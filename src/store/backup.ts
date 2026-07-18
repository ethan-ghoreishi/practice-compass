import { nowISO, parseImport, SCHEMA_VERSION } from '../domain';
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

export type ImportOutcome = { ok: true; fileCount: number } | { ok: false; error: string };

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
 */
export async function importFullBackup(text: string): Promise<ImportOutcome> {
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

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount: rows.length };
}
