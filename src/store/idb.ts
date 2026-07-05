import Dexie, { type Table } from 'dexie';
import type { StateStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// IndexedDB is the source of truth on the device (matching the systema / hess
// house style). Two tables:
//   • kv          — the serialised app state (one row; Zustand persists here)
//   • attachments — file blobs (PDFs, images, audio) keyed by id, per item
// This lifts the ~5 MB localStorage ceiling and lets the app hold the user's
// scores and teacher hand-outs as a genuine single source of truth.
// ---------------------------------------------------------------------------

export interface KV {
  key: string;
  value: string;
}

export interface AttachmentBlob {
  id: string;
  itemId: string;
  blob: Blob;
}

class PracticeCompassDB extends Dexie {
  kv!: Table<KV, string>;
  attachments!: Table<AttachmentBlob, string>;

  constructor() {
    super('practice-compass');
    this.version(1).stores({
      kv: 'key',
      attachments: 'id, itemId',
    });
  }
}

export const idb = new PracticeCompassDB();

/** Set true (once) by the storage adapter when there was nothing to restore. */
export let storageWasEmpty = false;

const PERSIST_KEY = 'practice-compass';

/**
 * Zustand storage backed by IndexedDB. On first read it transparently migrates
 * any existing localStorage data across, so returning users keep everything.
 */
export const idbStorage: StateStorage = {
  getItem: async (name) => {
    const rec = await idb.kv.get(name);
    if (rec) return rec.value;

    // One-time migration from the old localStorage-backed store.
    try {
      const ls = typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null;
      if (ls != null) {
        await idb.kv.put({ key: name, value: ls });
        return ls;
      }
    } catch {
      /* ignore access errors */
    }
    if (name === PERSIST_KEY) storageWasEmpty = true;
    return null;
  },
  setItem: async (name, value) => {
    await idb.kv.put({ key: name, value });
  },
  removeItem: async (name) => {
    await idb.kv.delete(name);
  },
};

// --- Attachment blob helpers -----------------------------------------------

export async function putBlob(id: string, itemId: string, blob: Blob): Promise<void> {
  await idb.attachments.put({ id, itemId, blob });
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return (await idb.attachments.get(id))?.blob;
}

export async function deleteBlob(id: string): Promise<void> {
  await idb.attachments.delete(id);
}

export async function deleteBlobsForItem(itemId: string): Promise<void> {
  await idb.attachments.where('itemId').equals(itemId).delete();
}

export async function clearBlobs(): Promise<void> {
  await idb.attachments.clear();
}

export async function allBlobs(): Promise<AttachmentBlob[]> {
  return idb.attachments.toArray();
}
