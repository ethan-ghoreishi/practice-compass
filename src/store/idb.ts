import Dexie, { type Table } from 'dexie';
import type { StateStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// IndexedDB is the source of truth on the device (matching the systema / hess
// house style). Two tables:
//   • kv          — the serialised app state (one row; Zustand persists here)
//   • attachments — file blobs (PDFs, images, audio) keyed by id, owned by a
//                   practice item OR a lesson (ownerId)
// This lifts the ~5 MB localStorage ceiling and lets the app hold the user's
// scores and teacher hand-outs as a genuine single source of truth.
// ---------------------------------------------------------------------------

export interface KV {
  key: string;
  value: string;
}

export interface AttachmentBlob {
  id: string;
  /** Id of the owning PracticeItem or Lesson. */
  ownerId: string;
  blob: Blob;
}

class PracticeCompassDB extends Dexie {
  kv!: Table<KV, string>;
  attachments!: Table<AttachmentBlob, string>;

  constructor() {
    super('practice-compass');
    // v1: blobs keyed per item (itemId).
    this.version(1).stores({
      kv: 'key',
      attachments: 'id, itemId',
    });
    // v2: attachments can belong to an item or a lesson → generic ownerId.
    this.version(2)
      .stores({
        kv: 'key',
        attachments: 'id, ownerId',
      })
      .upgrade(async (tx) => {
        await tx
          .table('attachments')
          .toCollection()
          .modify((row: AttachmentBlob & { itemId?: string }) => {
            row.ownerId = row.ownerId ?? row.itemId ?? '';
            delete row.itemId;
          });
      });
  }
}

export const idb = new PracticeCompassDB();

/** Set true (once) by the storage adapter when there was nothing to restore. */
export let storageWasEmpty = false;

let pendingWrite: Promise<void> = Promise.resolve();

/**
 * Resolves when the most recent persisted write has actually landed in
 * IndexedDB — and REJECTS with the storage error when it did not. The store's
 * persist middleware writes through `idbStorage.setItem` below on every state
 * change, so awaiting this immediately after a store action is a real
 * acknowledgement of that action's durability, never a timeout standing in
 * for one.
 *
 * "Immediately" is load-bearing and is genuinely enough: zustand's persist
 * middleware wraps `setState` and calls `setItem` SYNCHRONOUSLY inside it, and
 * `setItem` assigns `pendingWrite` before its own first await — so a caller
 * that does `action(); storageSettled().then(...)` as two adjacent statements
 * has already captured ITS OWN write's promise, with no point at which another
 * store write (a boundary signal during a running clock, say) could interleave
 * and hand it somebody else's outcome.
 */
export function storageSettled(): Promise<void> {
  return pendingWrite;
}

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
    // Track the write so a caller can wait for DURABILITY rather than guess at
    // it. Nothing in the app may claim "saved" before this settles, and a
    // rejected write has to reach the person who typed the text — the whole
    // point of a local-first notebook is that what you wrote is still there.
    const write = idb.kv.put({ key: name, value }).then(() => undefined);
    pendingWrite = write;
    // Zustand's persist middleware calls this and ignores the result
    // (`void setItem()`), so a rejection reaching the outer promise would
    // surface only as an unhandled rejection in the page — noise that hides
    // real errors. The failure is NOT swallowed: `storageSettled()` above
    // hands it to the one caller that can act on it. This `catch` also marks
    // `write` itself handled, so the ordinary writes nobody is waiting on
    // cannot raise one either.
    await write.catch(() => undefined);
  },
  removeItem: async (name) => {
    await idb.kv.delete(name);
  },
};

// --- Attachment blob helpers -----------------------------------------------

export async function putBlob(id: string, ownerId: string, blob: Blob): Promise<void> {
  await idb.attachments.put({ id, ownerId, blob });
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  return (await idb.attachments.get(id))?.blob;
}

export async function deleteBlob(id: string): Promise<void> {
  await idb.attachments.delete(id);
}

export async function deleteBlobsForOwner(ownerId: string): Promise<void> {
  await idb.attachments.where('ownerId').equals(ownerId).delete();
}

export async function clearBlobs(): Promise<void> {
  await idb.attachments.clear();
}

/**
 * Atomically replace every attachment blob: clear the table and write the new
 * set in one IndexedDB transaction. If anything throws mid-write, Dexie rolls
 * the whole transaction back — existing blobs are never left half-cleared.
 */
export async function replaceAllBlobs(rows: AttachmentBlob[]): Promise<void> {
  await idb.transaction('rw', idb.attachments, async () => {
    await idb.attachments.clear();
    if (rows.length > 0) await idb.attachments.bulkPut(rows);
  });
}

export async function allBlobs(): Promise<AttachmentBlob[]> {
  return idb.attachments.toArray();
}

// --- Pre-sync archive slot ---------------------------------------------------
// Before sync replaces local data (pull or conflict resolution), the entire
// current copy — one full backup JSON including file payloads — is preserved
// here so "Take the GitHub copy" is never destructive. One slot; each new
// archive replaces the previous one.

const ARCHIVE_KEY = 'pc-pre-sync-archive';

export interface PreSyncArchiveMeta {
  savedAt: string;
  reason: string;
  deviceName?: string;
}

export async function savePreSyncArchive(meta: PreSyncArchiveMeta, backupText: string): Promise<void> {
  await idb.kv.put({ key: ARCHIVE_KEY, value: JSON.stringify({ meta, backupText }) });
}

export async function loadPreSyncArchiveMeta(): Promise<PreSyncArchiveMeta | null> {
  const row = await idb.kv.get(ARCHIVE_KEY);
  if (!row) return null;
  try {
    return (JSON.parse(row.value) as { meta: PreSyncArchiveMeta }).meta;
  } catch {
    return null;
  }
}

export async function loadPreSyncArchive(): Promise<string | null> {
  const row = await idb.kv.get(ARCHIVE_KEY);
  if (!row) return null;
  try {
    return (JSON.parse(row.value) as { backupText: string }).backupText;
  } catch {
    return null;
  }
}
