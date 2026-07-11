import { create } from 'zustand';
import { decideSync, type SyncDecision } from '../domain';
import { buildFullBackup, getDeviceName, importFullBackup, lastModifiedOf } from './backup';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Device sync over a GitHub repo — free, reliable, no server of our own.
//
// The remote is just the proven backup format, split so pushes stay small:
//   state.json   — the full app data (small JSON, changes every session)
//   files/{id}   — one JSON entry per attachment (immutable: add/delete only)
//
// IndexedDB remains the source of truth on each device; sync moves whole
// snapshots, newest wins, and any ambiguity is surfaced as an explicit
// conflict for the user to resolve — never a silent merge.
//
// The token and sync bookkeeping live in localStorage (per device, never
// inside the synced data itself).
// ---------------------------------------------------------------------------

const CONFIG_KEY = 'pc-sync-config';
const STATE_KEY = 'pc-sync-state';
const API = 'https://api.github.com';

export interface SyncConfig {
  /** owner/name, e.g. "ethan-ghoreishi/practice-compass-data" */
  repo: string;
  token: string;
}

interface SyncBookkeeping {
  lastSyncedLocal: string | null;
  lastSyncedRemote: string | null;
  lastSyncAt: string | null;
}

export interface RemoteMeta {
  lastModified: string;
  deviceName?: string;
  exportedAt?: string;
}

export type SyncPhase = 'off' | 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface SyncStatus {
  phase: SyncPhase;
  message: string;
  lastSyncAt: string | null;
  /** Present while phase === 'conflict'. */
  conflict?: { local: RemoteMeta; remote: RemoteMeta; reason: string };
}

/** Small UI-facing status store (not persisted). */
export const useSyncStatus = create<SyncStatus>(() => ({
  phase: getSyncConfig() ? 'idle' : 'off',
  message: getSyncConfig() ? 'Not synced yet this session.' : 'Sync is off.',
  lastSyncAt: loadBookkeeping().lastSyncAt,
}));

function setStatus(patch: Partial<SyncStatus>) {
  useSyncStatus.setState(patch);
}

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
      localStorage.removeItem(STATE_KEY);
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

function loadBookkeeping(): SyncBookkeeping {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw) as SyncBookkeeping;
  } catch {
    /* ignore */
  }
  return { lastSyncedLocal: null, lastSyncedRemote: null, lastSyncAt: null };
}

function saveBookkeeping(b: SyncBookkeeping): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(b));
  } catch {
    /* ignore */
  }
}

// ---- Encoding helpers (data may contain Farsi — never plain btoa) ----------

function b64encodeText(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

// ---- GitHub Contents API ----------------------------------------------------

async function gh(cfg: SyncConfig, path: string, init: RequestInit = {}, raw = false): Promise<Response> {
  return fetch(`${API}/repos/${cfg.repo}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: raw ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
}

async function ghGetRawText(cfg: SyncConfig, path: string): Promise<string | null> {
  const res = await gh(cfg, path, {}, true);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} reading ${path}`);
  return res.text();
}

/** sha of a content file, or null when it doesn't exist. */
async function ghGetSha(cfg: SyncConfig, path: string): Promise<string | null> {
  // Object media type returns metadata (incl. sha) without the payload.
  const res = await gh(cfg, path, { headers: { Accept: 'application/vnd.github.object+json' } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status} reading ${path}`);
  const obj = (await res.json()) as { sha?: string };
  return obj.sha ?? null;
}

async function ghPut(cfg: SyncConfig, path: string, contentB64: string, message: string, sha?: string | null) {
  const res = await gh(cfg, path, {
    method: 'PUT',
    body: JSON.stringify({ message, content: contentB64, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} writing ${path}: ${(await res.text()).slice(0, 200)}`);
}

async function ghDelete(cfg: SyncConfig, path: string, sha: string, message: string) {
  const res = await gh(cfg, path, { method: 'DELETE', body: JSON.stringify({ message, sha }) });
  if (!res.ok && res.status !== 404) throw new Error(`GitHub ${res.status} deleting ${path}`);
}

async function listRemoteFiles(cfg: SyncConfig): Promise<{ name: string; sha: string }[]> {
  const res = await gh(cfg, 'contents/files');
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub ${res.status} listing files`);
  const arr = (await res.json()) as { name: string; sha: string }[];
  return Array.isArray(arr) ? arr.map(({ name, sha }) => ({ name, sha })) : [];
}

interface BackupShape {
  lastModified?: string;
  exportedAt?: string;
  deviceName?: string;
  files: { id: string; ownerId: string; mime: string; name: string; data: string }[];
  [k: string]: unknown;
}

/** Remote state.json meta (cheap-ish: one raw read of the small state file). */
async function getRemoteMeta(cfg: SyncConfig): Promise<RemoteMeta | null> {
  const text = await ghGetRawText(cfg, 'contents/state.json');
  if (text === null) return null;
  const parsed = JSON.parse(text) as BackupShape;
  return {
    lastModified: parsed.lastModified ?? parsed.exportedAt ?? '',
    deviceName: parsed.deviceName,
    exportedAt: parsed.exportedAt,
  };
}

async function pushSnapshot(cfg: SyncConfig): Promise<void> {
  const device = getDeviceName() || 'unnamed device';
  const backup = JSON.parse(await buildFullBackup()) as BackupShape;
  const files = backup.files;
  backup.files = [];

  const stateSha = await ghGetSha(cfg, 'contents/state.json');
  await ghPut(cfg, 'contents/state.json', b64encodeText(JSON.stringify(backup)), `sync: state from ${device}`, stateSha);

  // Attachments are immutable (added/deleted, never edited): upload the
  // missing ones, remove the deleted ones, skip the rest.
  const remote = await listRemoteFiles(cfg);
  const remoteNames = new Set(remote.map((r) => r.name));
  const localIds = new Set(files.map((f) => f.id));
  for (const f of files) {
    if (!remoteNames.has(f.id)) {
      await ghPut(cfg, `contents/files/${f.id}`, b64encodeText(JSON.stringify(f)), `sync: file ${f.name} from ${device}`);
    }
  }
  for (const r of remote) {
    if (!localIds.has(r.name)) {
      await ghDelete(cfg, `contents/files/${r.name}`, r.sha, `sync: remove ${r.name} (deleted on ${device})`);
    }
  }
}

async function pullSnapshot(cfg: SyncConfig): Promise<void> {
  const text = await ghGetRawText(cfg, 'contents/state.json');
  if (text === null) throw new Error('No copy on GitHub yet.');
  const backup = JSON.parse(text) as BackupShape;
  const remote = await listRemoteFiles(cfg);
  const entries = await Promise.all(
    remote.map(async (r) => {
      const fileText = await ghGetRawText(cfg, `contents/files/${r.name}`);
      return fileText ? (JSON.parse(fileText) as BackupShape['files'][number]) : null;
    }),
  );
  backup.files = entries.filter((e): e is BackupShape['files'][number] => !!e);
  const result = await importFullBackup(JSON.stringify(backup));
  if (!result.ok) throw new Error(result.error);
}

// ---- Orchestration ----------------------------------------------------------

let running = false;

export interface SyncOutcome {
  decision: SyncDecision['direction'] | 'error' | 'skipped';
  detail: string;
}

export async function syncNow(): Promise<SyncOutcome> {
  const cfg = getSyncConfig();
  if (!cfg) return { decision: 'skipped', detail: 'Sync is not set up.' };
  if (!navigator.onLine) {
    setStatus({ phase: 'idle', message: 'Offline — will sync when back online.' });
    return { decision: 'skipped', detail: 'Offline.' };
  }
  if (running) return { decision: 'skipped', detail: 'A sync is already running.' };
  running = true;
  setStatus({ phase: 'syncing', message: 'Syncing…', conflict: undefined });

  try {
    const db = useStore.getState().db;
    const local = lastModifiedOf(db);
    const remoteMeta = await getRemoteMeta(cfg);
    const book = loadBookkeeping();
    const decision = decideSync({
      localLastModified: local,
      remoteLastModified: remoteMeta ? remoteMeta.lastModified : null,
      lastSyncedLocal: book.lastSyncedLocal,
      lastSyncedRemote: book.lastSyncedRemote,
    });

    switch (decision.direction) {
      case 'first-push':
      case 'push': {
        await pushSnapshot(cfg);
        finishSync(local, local, decision.direction === 'first-push' ? 'First backup pushed to GitHub.' : 'Sent this device’s changes to GitHub.');
        return { decision: decision.direction, detail: decision.reason };
      }
      case 'pull': {
        await pullSnapshot(cfg);
        const newLocal = lastModifiedOf(useStore.getState().db);
        finishSync(newLocal, newLocal, `Brought the newer GitHub copy${remoteMeta?.deviceName ? ` (from “${remoteMeta.deviceName}”)` : ''} onto this device.`);
        return { decision: 'pull', detail: decision.reason };
      }
      case 'in-sync': {
        finishSync(book.lastSyncedLocal ?? local, book.lastSyncedRemote ?? local, 'Already in sync.');
        return { decision: 'in-sync', detail: decision.reason };
      }
      case 'conflict': {
        setStatus({
          phase: 'conflict',
          message: decision.reason,
          conflict: {
            local: { lastModified: local, deviceName: getDeviceName() || 'this device' },
            remote: remoteMeta ?? { lastModified: '' },
            reason: decision.reason,
          },
        });
        return { decision: 'conflict', detail: decision.reason };
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed.';
    setStatus({ phase: 'error', message: msg });
    return { decision: 'error', detail: msg };
  } finally {
    running = false;
  }
}

function finishSync(local: string, remote: string, message: string) {
  const at = new Date().toISOString();
  saveBookkeeping({ lastSyncedLocal: local, lastSyncedRemote: remote, lastSyncAt: at });
  setStatus({ phase: 'synced', message, lastSyncAt: at, conflict: undefined });
}

/** Explicit conflict resolution — the user chose which whole copy wins. */
export async function resolveConflict(keep: 'local' | 'remote'): Promise<SyncOutcome> {
  const cfg = getSyncConfig();
  if (!cfg) return { decision: 'skipped', detail: 'Sync is not set up.' };
  if (running) return { decision: 'skipped', detail: 'A sync is already running.' };
  running = true;
  setStatus({ phase: 'syncing', message: keep === 'local' ? 'Sending this device’s copy…' : 'Taking the GitHub copy…' });
  try {
    if (keep === 'local') {
      await pushSnapshot(cfg);
      const local = lastModifiedOf(useStore.getState().db);
      finishSync(local, local, 'Kept this device’s copy — GitHub now matches it.');
      return { decision: 'push', detail: 'Kept local copy.' };
    }
    await pullSnapshot(cfg);
    const local = lastModifiedOf(useStore.getState().db);
    finishSync(local, local, 'Took the GitHub copy — this device now matches it.');
    return { decision: 'pull', detail: 'Kept remote copy.' };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Sync failed.';
    setStatus({ phase: 'error', message: msg });
    return { decision: 'error', detail: msg };
  } finally {
    running = false;
  }
}
