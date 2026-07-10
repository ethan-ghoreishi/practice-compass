import { nowISO, parseImport, SCHEMA_VERSION } from '../domain';
import { allBlobs, clearBlobs, putBlob } from './idb';
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

export async function importFullBackup(text: string): Promise<ImportOutcome> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const validated = parseImport(text);
  if (!validated.ok) return { ok: false, error: validated.error };

  // Replace all local blobs with the backup's.
  await clearBlobs();
  const files = (parsed as { files?: BackupFile[] }).files;
  let fileCount = 0;
  if (Array.isArray(files)) {
    for (const f of files) {
      if (f?.id && typeof f.data === 'string') {
        try {
          await putBlob(f.id, f.ownerId ?? f.itemId ?? '', base64ToBlob(f.data, f.mime || 'application/octet-stream'));
          fileCount += 1;
        } catch {
          /* skip a corrupt file rather than fail the whole import */
        }
      }
    }
  }

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount };
}
