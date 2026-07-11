import { create } from 'zustand';
import { hashState, shortHash } from '../domain';
import { buildFullBackup, getDeviceName, importFullBackup } from './backup';
import { loadPreSyncArchive, loadPreSyncArchiveMeta, savePreSyncArchive, type PreSyncArchiveMeta } from './idb';
import { makeGitHubRemote } from './gitRemote';
import {
  resolveSyncConflict,
  runSync,
  type LocalSnapshot,
  type RemoteSideMeta,
  type SnapshotFile,
  type SyncBook,
  type SyncPorts,
} from './syncEngine';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Device sync over a GitHub repo the user owns — free, no server of ours.
// This module only WIRES the tested engine (syncEngine.ts) to the real app:
// local snapshots come from the proven backup format, the remote is the Git
// Data API (gitRemote.ts), decisions compare content hashes (domain/sync.ts),
// and both sides of a conflict are preserved before anything is replaced.
//
// The token and sync bookkeeping stay in localStorage — per device, never
// inside backups or synced data.
// ---------------------------------------------------------------------------

const CONFIG_KEY = 'pc-sync-config';
const BOOK_KEY = 'pc-sync-state';

export interface SyncConfig {
  /** owner/name, e.g. "ethan-ghoreishi/practice-compass-data" */
  repo: string;
  token: string;
}

export type SyncPhase = 'off' | 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface ConflictSide {
  deviceName?: string;
  savedAt?: string;
  rev?: number;
  hash?: string;
}

export interface SyncStatus {
  phase: SyncPhase;
  message: string;
  lastSyncAt: string | null;
  /** Short content hash of the local data (display only). */
  localHash: string;
  /** Present while phase === 'conflict'. */
  conflict?: { local: ConflictSide; remote: ConflictSide | null; reason: string };
  /** A pre-sync archive exists and can be restored. */
  archiveAvailable: boolean;
  archiveMeta?: PreSyncArchiveMeta | null;
}

export const useSyncStatus = create<SyncStatus>(() => ({
  phase: getSyncConfig() ? 'idle' : 'off',
  message: getSyncConfig() ? 'Not synced yet this session.' : 'Sync is off.',
  lastSyncAt: loadBook().lastSyncAt,
  localHash: '—',
  archiveAvailable: false,
}));

function setStatus(patch: Partial<SyncStatus>) {
  useSyncStatus.setState(patch);
}

/** Refresh the archive flag (called on init and after archive writes). */
export async function refreshArchiveStatus(): Promise<void> {
  const meta = await loadPreSyncArchiveMeta();
  setStatus({ archiveAvailable: !!meta, archiveMeta: meta });
}

// ---- Config + bookkeeping (localStorage, per device) ------------------------

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as SyncConfig;
    return cfg.repo && cfg.token ? cfg : null;
  } catch {
    return null;
  }
}

export function setSyncConfig(cfg: SyncConfig | null): void {
  try {
    if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    else {
      localStorage.removeItem(CONFIG_KEY);
      localStorage.removeItem(BOOK_KEY);
    }
  } catch {
    /* ignore */
  }
  setStatus(
    cfg
      ? { phase: 'idle', message: 'Connected — not synced yet.', conflict: undefined }
      : { phase: 'off', message: 'Sync is off.', conflict: undefined },
  );
}

function loadBook(): SyncBook {
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SyncBook>;
      // Legacy bookkeeping (timestamp era) lacks lastSyncedHash → treated as
      // a first sync: identical data lands in-sync, differing data is an
      // explicit conflict. Safe either way.
      return {
        lastSyncedHash: parsed.lastSyncedHash ?? null,
        lastRemoteCommit: parsed.lastRemoteCommit ?? null,
        lastSyncAt: parsed.lastSyncAt ?? null,
      };
    }
  } catch {
    /* ignore */
  }
  return { lastSyncedHash: null, lastRemoteCommit: null, lastSyncAt: null };
}

function saveBook(book: SyncBook): void {
  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
  } catch {
    /* ignore */
  }
}

// ---- Ports ------------------------------------------------------------------

interface BackupShape {
  data?: unknown;
  files: SnapshotFile[];
  [k: string]: unknown;
}

async function buildLocalSnapshot(): Promise<LocalSnapshot> {
  const backup = JSON.parse(await buildFullBackup()) as BackupShape;
  const files = backup.files;
  backup.files = [];
  return {
    stateText: JSON.stringify(backup),
    files,
    hash: await hashState(backup.data ?? {}),
    rev: useStore.getState().rev,
    deviceName: getDeviceName(),
  };
}

function makePorts(cfg: SyncConfig): SyncPorts {
  return {
    remote: makeGitHubRemote(cfg),
    local: {
      buildSnapshot: buildLocalSnapshot,
      applySnapshot: async (stateText, files) => {
        const backup = JSON.parse(stateText) as BackupShape;
        backup.files = files;
        const result = await importFullBackup(JSON.stringify(backup));
        if (!result.ok) throw new Error(result.error);
      },
      archivePreSync: async (reason) => {
        const backupText = await buildFullBackup();
        await savePreSyncArchive(
          { savedAt: new Date().toISOString(), reason, deviceName: getDeviceName() || undefined },
          backupText,
        );
        await refreshArchiveStatus();
      },
    },
    book: { load: loadBook, save: saveBook },
    now: () => new Date(),
  };
}

// ---- Public API ---------------------------------------------------------------

let running = false;

function conflictSideOfLocal(local: LocalSnapshot): ConflictSide {
  return { deviceName: local.deviceName || 'this device', rev: local.rev, hash: local.hash };
}

function conflictSideOfRemote(remote: RemoteSideMeta | null): ConflictSide | null {
  return remote ? { deviceName: remote.deviceName, savedAt: remote.savedAt, rev: remote.rev, hash: remote.hash } : null;
}

async function applyOutcome(outcome: Awaited<ReturnType<typeof runSync>>): Promise<void> {
  const at = new Date().toISOString();
  switch (outcome.kind) {
    case 'in-sync':
      setStatus({ phase: 'synced', message: 'Already in sync.', lastSyncAt: at, conflict: undefined });
      break;
    case 'pushed':
      setStatus({
        phase: 'synced',
        message: outcome.direction === 'first-push' ? 'First snapshot pushed to GitHub.' : 'Sent this device’s changes to GitHub.',
        lastSyncAt: at,
        conflict: undefined,
      });
      break;
    case 'pulled':
      setStatus({
        phase: 'synced',
        message: `Brought the GitHub copy${outcome.remote.deviceName ? ` (from “${outcome.remote.deviceName}”)` : ''} onto this device. The previous copy is archived and restorable below.`,
        lastSyncAt: at,
        conflict: undefined,
      });
      break;
    case 'conflict':
      setStatus({
        phase: 'conflict',
        message: outcome.reason,
        conflict: { local: conflictSideOfLocal(outcome.local), remote: conflictSideOfRemote(outcome.remote), reason: outcome.reason },
      });
      break;
    case 'error':
      setStatus({ phase: 'error', message: outcome.message });
      break;
  }
  const local = useStore.getState();
  setStatus({ localHash: `r${local.rev} · ${shortHash(await hashState(local.db))}` });
}

export async function syncNow(): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg) return;
  if (!navigator.onLine) {
    setStatus({ phase: 'idle', message: 'Offline — will sync when back online.' });
    return;
  }
  if (running) return;
  running = true;
  setStatus({ phase: 'syncing', message: 'Syncing…', conflict: undefined });
  try {
    await applyOutcome(await runSync(makePorts(cfg)));
  } finally {
    running = false;
  }
}

export async function resolveConflict(keep: 'local' | 'remote'): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg || running) return;
  running = true;
  setStatus({ phase: 'syncing', message: keep === 'local' ? 'Keeping this device’s copy…' : 'Archiving this copy, then taking GitHub’s…' });
  try {
    await applyOutcome(await resolveSyncConflict(makePorts(cfg), keep));
  } finally {
    running = false;
  }
}

/** Restore the pre-sync archive (the copy preserved before the last replace). */
export async function restorePreSyncArchive(): Promise<{ ok: boolean; error?: string }> {
  const text = await loadPreSyncArchive();
  if (!text) return { ok: false, error: 'No archived copy exists.' };
  const result = await importFullBackup(text);
  if (!result.ok) return { ok: false, error: result.error };
  setStatus({ phase: 'idle', message: 'Archived copy restored. Sync again when ready — a differing GitHub copy will show as an explicit choice.' });
  return { ok: true };
}
