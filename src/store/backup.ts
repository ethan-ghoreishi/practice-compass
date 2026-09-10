import { decideReplacement, nowISO, parseImport, SCHEMA_VERSION } from '../domain';
import { allBlobs, replaceAllBlobs, type AttachmentBlob } from './idb';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Full backup = the JSON data PLUS the attachment file bytes (base64), so a
// single file is a complete, portable copy of everything. Save it to your NAS
// / iCloud; import restores data and files together.
// ---------------------------------------------------------------------------

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

interface BackupFile {
  id: string;
  ownerId: string;
  /** Legacy (schema ≤ 5) backups used itemId. */
  itemId?: string;
  mime: string;
  name: string;
  data: string; // base64
}

/** Metadata describing where/when a backup was made (for safe handoff). */
export interface BackupMeta {
  deviceName?: string;
  /** Most recent updatedAt across the data — "how new is this backup". */
  lastModified?: string;
}

const DEVICE_NAME_KEY = 'pc-device-name';

/** Per-device label; deliberately in localStorage, NOT in the backup data. */
export function getDeviceName(): string {
  try {
    return localStorage.getItem(DEVICE_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setDeviceName(name: string): void {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

const NAS_BASE_URL_KEY = 'pc-nas-base-url';

/**
 * Base URL for resolving relative class-recording paths (e.g. the NAS Tailscale
 * HTTPS root that serves the video folders). Per-device in localStorage — it is
 * environment config, never synced or written into backups, and never a place
 * for a password.
 */
export function getNasBaseUrl(): string {
  try {
    return localStorage.getItem(NAS_BASE_URL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setNasBaseUrl(url: string): void {
  try {
    localStorage.setItem(NAS_BASE_URL_KEY, url.trim());
  } catch {
    /* ignore */
  }
}

/** Most recent updatedAt/createdAt across everything — the data's "age". */
export function lastModifiedOf(db: ReturnType<typeof useStore.getState>['db']): string {
  let max = '';
  const scan = (rows: { updatedAt?: string; createdAt?: string; startedAt?: string }[]) => {
    for (const r of rows) {
      const t = r.updatedAt ?? r.startedAt ?? r.createdAt ?? '';
      if (t > max) max = t;
    }
  };
  scan(db.items);
  scan(db.blocks);
  scan(db.lessons);
  scan(db.materials);
  scan(db.pathwayStages);
  scan(db.attachments);
  return max;
}

export async function buildFullBackup(now: Date = new Date()): Promise<string> {
  const db = useStore.getState().db;
  const blobs = await allBlobs();
  const files: BackupFile[] = await Promise.all(
    blobs.map(async (b) => {
      const meta = db.attachments.find((a) => a.id === b.id);
      return {
        id: b.id,
        ownerId: b.ownerId,
        mime: meta?.mime ?? b.blob.type ?? 'application/octet-stream',
        name: meta?.name ?? 'file',
        data: await blobToBase64(b.blob),
      };
    }),
  );
  return JSON.stringify({
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(now),
    deviceName: getDeviceName() || undefined,
    lastModified: lastModifiedOf(db) || undefined,
    data: db,
    files,
  });
}

/** Peek at a backup's provenance without importing it. */
export function readBackupMeta(text: string): (BackupMeta & { exportedAt?: string }) | null {
  try {
    const parsed = JSON.parse(text) as { exportedAt?: string; deviceName?: string; lastModified?: string };
    return { exportedAt: parsed.exportedAt, deviceName: parsed.deviceName, lastModified: parsed.lastModified };
  } catch {
    return null;
  }
}

/**
 * Names for whatever practice is unfinished right now, for a visible message.
 * Lives here because this module already reads the store; used by both the
 * import refusal below and the sync deferral notice. Never fabricates a title:
 * `decideReplacement` falls back to a neutral phrase when one is missing.
 */
export function unfinishedPracticeLabels(): { itemTitle?: string; routineName?: string } {
  const { active, activeRoutine, db } = useStore.getState();
  return {
    itemTitle: active ? db.items.find((i) => i.id === active.itemId)?.title : undefined,
    routineName: activeRoutine ? db.pathwayRoutines.find((r) => r.id === activeRoutine.routineId)?.name : undefined,
  };
}

export type ImportOutcome = { ok: true; fileCount: number } | { ok: false; error: string };

/**
 * Is a whole-database replacement refused right now? Read fresh each time it is
 * asked, because the answer can change mid-import.
 */
function replacementRefusal(): string | null {
  const { active, activeRoutine } = useStore.getState();
  const decision = decideReplacement({
    intent: 'deliberate',
    session: { active, activeRoutine },
    labels: unfinishedPracticeLabels(),
  });
  return decision.outcome === 'proceed' ? null : decision.message;
}

/**
 * Import a full backup. Decodes every file BEFORE touching any existing data —
 * a single corrupt file aborts the whole import with nothing changed, rather
 * than clearing existing blobs and silently losing the ones that fail to
 * decode. Once every file decodes cleanly, the blob replacement runs as one
 * IndexedDB transaction (`replaceAllBlobs`) and only then does the JSON `db`
 * get swapped — so a mid-write failure can never leave attachment metadata
 * pointing at blobs that no longer exist.
 *
 * A `files` key that is ENTIRELY ABSENT (not just an empty array) means this
 * isn't a full backup — e.g. a bare state-only export, or a hand-edited file.
 * That case must never be read as "zero attachments" and wipe every existing
 * blob to match; existing blobs are left untouched. A present `files: []` IS
 * treated as a real full backup with no attachments, and does replace (that's
 * the whole point of restoring to a snapshot).
 *
 * This is the chokepoint for every INBOUND replacement — manual import, a sync
 * pull, conflict-keep-remote, and archive restore all arrive here — so it is
 * where an unfinished practice session is protected. The refusal is the FIRST
 * thing this function does, before the JSON is even parsed: `replaceAllBlobs`
 * below destroys every attachment blob, so a check placed after it would
 * return "nothing was changed" having already wiped them. It is ALSO the last
 * thing before `importDB`, because that first check does not span the whole
 * call — see the comment at the install itself.
 */
export async function importFullBackup(text: string): Promise<ImportOutcome> {
  // A replacement reaching this function is one the owner chose (Import,
  // Restore archive, Keep remote) or a sync pull that slipped past syncNow's
  // own deferral because practice started mid-sync. Either way an unfinished
  // session — running or paused, fresh or stale, ordinary or routine — is
  // never destroyed by it, and never silently: every caller already surfaces
  // this error.
  const refusal = replacementRefusal();
  if (refusal) return { ok: false, error: refusal };

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const validated = parseImport(text);
  if (!validated.ok) return { ok: false, error: validated.error };

  const files = (parsed as { files?: BackupFile[] }).files;
  const isFullBackup = Array.isArray(files);
  const rows: AttachmentBlob[] = [];
  if (isFullBackup) {
    for (const f of files) {
      if (!f?.id || typeof f.data !== 'string') continue;
      try {
        rows.push({
          id: f.id,
          ownerId: f.ownerId ?? f.itemId ?? '',
          blob: base64ToBlob(f.data, f.mime || 'application/octet-stream'),
        });
      } catch {
        return { ok: false, error: `File "${f.name ?? f.id}" in the backup is corrupt — nothing was changed.` };
      }
    }
  }

  try {
    // Only touch attachment blobs for a genuine full backup (files array
    // present, however short). A file with no `files` key at all leaves
    // today's attachments exactly as they are.
    if (isFullBackup) await replaceAllBlobs(rows);
  } catch (e) {
    return { ok: false, error: `Could not write attachment files (${e instanceof Error ? e.message : 'unknown error'}) — nothing was changed.` };
  }

  // Checked AGAIN, in the same synchronous tick as the install. The check at
  // the top of this function cannot cover the whole call: `replaceAllBlobs`
  // above yields to the event loop, so a tap that starts a block or a routine
  // while that transaction is in flight would otherwise reach `importDB` —
  // which nulls `active`/`activeRoutine` — with no guard between them. Nothing
  // awaits between here and the install, so this one is genuinely the last
  // word. The blobs are already written by this point, so the refusal says
  // that plainly rather than claiming nothing changed; the message still names
  // the session (ac-8), the practice is intact, and re-running the same import
  // afterwards finishes the job.
  const late = replacementRefusal();
  if (late) {
    return {
      ok: false,
      error: `${late}${isFullBackup ? ' (Your attachment files were already replaced from the backup — running this import again afterwards will finish the job.)' : ''}`,
    };
  }

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount: rows.length };
}
