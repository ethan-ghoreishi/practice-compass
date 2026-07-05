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
  itemId: string;
  mime: string;
  name: string;
  data: string; // base64
}

export async function buildFullBackup(now: Date = new Date()): Promise<string> {
  const db = useStore.getState().db;
  const blobs = await allBlobs();
  const files: BackupFile[] = await Promise.all(
    blobs.map(async (b) => {
      const meta = db.attachments.find((a) => a.id === b.id);
      return {
        id: b.id,
        itemId: b.itemId,
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
    data: db,
    files,
  });
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
          await putBlob(f.id, f.itemId ?? '', base64ToBlob(f.data, f.mime || 'application/octet-stream'));
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
