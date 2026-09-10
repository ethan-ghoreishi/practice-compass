import { create } from 'zustand';
import { decideReplacement, hashState, shortHash } from '../domain';
import { buildFullBackup, buildFullBackupWithRev, getDeviceName, importFullBackup, unfinishedPracticeLabels } from './backup';
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

/**
 * 'deferred' is a distinct WAITING state, never an error and never a silent
 * no-op: automatic sync holds off while practice is unfinished rather than
 * replacing this device's data and destroying an in-flight block. Nothing
 * switches exhaustively on this type, and Settings compares it only for
 * equality, so a deferral falls through to the generic message in normal
 * colour — which is exactly right, because a background merge waiting its turn
 * is not a failure.
 */
export type SyncPhase = 'off' | 'idle' | 'syncing' | 'synced' | 'deferred' | 'conflict' | 'error';

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

/**
 * The local revision the running sync's comparison was made against. An
 * inbound snapshot is only safe to install over the database it was compared
 * with: between this snapshot and the install sit the remote fetch and the
 * pre-sync archive, and a block started AND FINISHED in that window is in
 * NEITHER the archive nor the incoming copy, with no unfinished session left
 * for the presence guard to see. Module scope is safe for the same reason
 * `running` and `pendingDeferral` are — exactly one sync runs at a time, and
 * `buildLocalSnapshot` always precedes `applySnapshot` in both engine paths.
 *
 * It comes back FROM the snapshot rather than being read here: reading the
 * store after awaiting the backup would pair the captured database with a
 * revision bumped while its attachment blobs were still being read, and that
 * pair is the whole guard.
 */
let syncBaselineRev: number | null = null;

async function buildLocalSnapshot(): Promise<LocalSnapshot> {
  const { text, rev } = await buildFullBackupWithRev();
  const backup = JSON.parse(text) as BackupShape;
  const files = backup.files;
  backup.files = [];
  syncBaselineRev = rev;
  return {
    stateText: JSON.stringify(backup),
    files,
    hash: await hashState(backup.data ?? {}),
    rev,
    deviceName: getDeviceName(),
  };
}

/**
 * A deferral raised INSIDE a sync run, carried back out to `applyOutcome`.
 * `importFullBackup` defers when practice happened after `syncNow`'s own check
 * — during the network fetch, the pre-sync archive, or `replaceAllBlobs` —
 * whether it is still unfinished or was already recorded, and the only channel
 * out of `runSync` is a thrown error, which would land in `error` phase. That
 * is the wrong answer twice over: a background merge waiting its turn is not a
 * failure, and App.tsx's retry watches `deferred`, so an `error` would leave
 * the sync stopped until something else happened to trigger one. Module scope
 * is safe for the same reason `running` below is: exactly one sync runs at a
 * time, and each entry point clears this first.
 */
let pendingDeferral: string | null = null;

function makePorts(cfg: SyncConfig, intent: 'automatic' | 'deliberate'): SyncPorts {
  return {
    remote: makeGitHubRemote(cfg),
    local: {
      buildSnapshot: buildLocalSnapshot,
      applySnapshot: async (stateText, files) => {
        const backup = JSON.parse(stateText) as BackupShape;
        backup.files = files;
        // Deliberately NOT read inside `importFullBackup`: a manual Import or
        // an archive restore has no earlier decision point than its own call,
        // and a stale baseline left over from a sync run would make it refuse
        // for no reason.
        const result = await importFullBackup(JSON.stringify(backup), intent, syncBaselineRev ?? undefined);
        if (!result.ok) {
          if (result.deferred) pendingDeferral = result.error;
          throw new Error(result.error);
        }
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

/**
 * A sync request that arrives while one is already running is REMEMBERED, not
 * dropped. `running` used to make such a request a silent no-op, which turned
 * the ONE quiet-period retry a mid-sync revision bump schedules into nothing at
 * all: a run lasting past those 30 seconds swallowed the retry and then deferred
 * for that very revision, leaving sync waiting for a condition nothing was
 * watching. Remembering the request closes it at the root, for every trigger
 * (open, quiet period, back online, deferral cleared) rather than for the one
 * counterexample. It cannot spin: the flag is cleared at the top of each
 * iteration, so another lap needs a genuinely new request that arrived during
 * the previous one.
 */
let rerunWanted = false;

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
      // A run stopped by unfinished practice is WAITING, not broken.
      if (pendingDeferral) setStatus({ phase: 'deferred', message: pendingDeferral, conflict: undefined });
      else setStatus({ phase: 'error', message: outcome.message });
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
  // Checked before the deferral so a sync already in flight is never relabelled
  // as "waiting" — it is genuinely running, and importFullBackup's own guard is
  // what protects a block started mid-sync. The request is kept, not discarded.
  if (running) {
    rerunWanted = true;
    return;
  }
  running = true;
  try {
    do {
      // Cleared BEFORE the run, so only a request that arrives during this lap
      // earns another one.
      rerunWanted = false;
      // Defer QUIETLY while practice is unfinished — running or paused, fresh or
      // stale, ordinary or routine. A pull would replace this device's database
      // and silently destroy the in-flight block, which lives outside `db` and is
      // therefore invisible to the hash comparison. The deferral is visible (the
      // notice in Layout says what it is waiting on) and App.tsx retries it the
      // moment the blocking session clears — whether it was finished or
      // discarded. Nothing is awaited between this check and the return, so no
      // request can be lost on this path.
      const { active, activeRoutine } = useStore.getState();
      const decision = decideReplacement({
        intent: 'automatic',
        session: { active, activeRoutine },
        labels: unfinishedPracticeLabels(),
      });
      if (decision.outcome !== 'proceed') {
        setStatus({ phase: 'deferred', message: decision.message, conflict: undefined });
        return;
      }
      pendingDeferral = null;
      setStatus({ phase: 'syncing', message: 'Syncing…', conflict: undefined });
      await applyOutcome(await runSync(makePorts(cfg, 'automatic')));
    } while (rerunWanted);
  } finally {
    running = false;
  }
}

export async function resolveConflict(keep: 'local' | 'remote'): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg || running) return;
  running = true;
  // Keep-remote is DELIBERATE: it never defers, it refuses out loud.
  pendingDeferral = null;
  setStatus({ phase: 'syncing', message: keep === 'local' ? 'Keeping this device’s copy…' : 'Archiving this copy, then taking GitHub’s…' });
  try {
    await applyOutcome(await resolveSyncConflict(makePorts(cfg, 'deliberate'), keep));
  } finally {
    running = false;
  }
  // A request that arrived while the owner was resolving the conflict is owed a
  // run just as much as one that arrived during an automatic sync.
  if (rerunWanted) {
    rerunWanted = false;
    await syncNow();
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
