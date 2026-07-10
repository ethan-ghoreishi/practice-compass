import {
  newId,
  nowISO,
  type AttachmentKind,
  type AttachmentMeta,
  type AttachmentOwnerType,
} from '../domain';
import { deleteBlob, getBlob, putBlob } from './idb';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Attachment API. Blobs live in IndexedDB (src/store/idb.ts); lightweight
// metadata lives in the reactive store. An attachment belongs to a practice
// item OR a lesson (ownerType + ownerId).
// ---------------------------------------------------------------------------

/** Files above this are allowed, but the user is warned about backup size. */
export const LARGE_FILE_BYTES = 25 * 1024 * 1024;

export function kindForMime(mime: string): AttachmentKind {
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  return 'other';
}

export async function addAttachment(
  ownerType: AttachmentOwnerType,
  ownerId: string,
  file: File,
): Promise<AttachmentMeta> {
  const id = newId();
  await putBlob(id, ownerId, file);
  const meta: AttachmentMeta = {
    id,
    ownerType,
    ownerId,
    name: file.name || 'file',
    mime: file.type || 'application/octet-stream',
    size: file.size,
    kind: kindForMime(file.type || ''),
    createdAt: nowISO(),
  };
  useStore.getState().addAttachmentMeta(meta);
  return meta;
}

export async function removeAttachment(id: string): Promise<void> {
  await deleteBlob(id);
  useStore.getState().removeAttachmentMeta(id);
}

/** Object URL for viewing/downloading; caller must revoke it when done. */
export async function attachmentObjectURL(id: string): Promise<string | null> {
  const blob = await getBlob(id);
  return blob ? URL.createObjectURL(blob) : null;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
