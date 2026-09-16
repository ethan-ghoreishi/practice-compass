import { decideReplacement, nowISO, parseImport, SCHEMA_VERSION } from '../domain';
import { allBlobs, replaceAllBlobs, type AttachmentBlob } from './idb';
import { useHydrationStatus, useStore } from './useStore';

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

/**
 * A backup TOGETHER WITH the local revision it was taken at, captured in ONE
 * statement before any await. `allBlobs()` below yields, and a block finished
 * during that yield bumps `rev` without entering this snapshot — pairing an
 * old copy of the data with a newer revision number. That pair is exactly what
 * the replacement guard compares, so the mismatch would make `decideReplacement`
 * (which is itself correct) answer "nothing was written since" about a database
 * that had been written to, and install the incoming copy over recorded
 * practice. The pure decision is already tested; the WIRING is protected
 * structurally, the same way `installDatabase` protects its own — the revision
 * cannot be read from anywhere but the statement that reads the database.
 */
export async function buildFullBackupWithRev(now: Date = new Date()): Promise<{ text: string; rev: number }> {
  const { db, rev } = useStore.getState();
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
  return {
    text: JSON.stringify({
      app: 'practice-compass',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: nowISO(now),
      deviceName: getDeviceName() || undefined,
      lastModified: lastModifiedOf(db) || undefined,
      data: db,
      files,
    }),
    rev,
  };
}

/** The backup text alone, for the callers that never install it back. */
export async function buildFullBackup(now: Date = new Date()): Promise<string> {
  return (await buildFullBackupWithRev(now)).text;
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

export type ImportOutcome =
  | { ok: true; fileCount: number }
  | {
      ok: false;
      error: string;
      /**
       * True when the refusal was a DEFERRAL, not a failure — an automatic sync
       * that will resume by itself. The caller must not dress this as an error:
       * `error` phase is not what App.tsx's retry watches, so reporting one
       * would turn a session that resolves in a minute into a silent outage.
       */
      deferred?: boolean;
    };

type ImportRefusal = Extract<ImportOutcome, { ok: false }>;

/**
 * Is a whole-database replacement refused right now? Read fresh each time it is
 * asked, because the answer can change mid-import — BOTH reasons can arise
 * after the replacement was decided. The intent is the caller's: a sync pull is
 * AUTOMATIC and defers quietly, everything else is DELIBERATE and refuses out
 * loud. `decidedFromRev` is the local revision the replacement was decided
 * against; a different one now means practice was committed in between and
 * installing the snapshot would destroy it.
 */
function replacementRefusal(intent: 'automatic' | 'deliberate', decidedFromRev: number): ImportRefusal | null {
  const { active, activeRoutine, rev } = useStore.getState();
  const decision = decideReplacement({
    intent,
    session: { active, activeRoutine },
    labels: unfinishedPracticeLabels(),
    revision: { decidedFrom: decidedFromRev, current: rev },
  });
  if (decision.outcome === 'proceed') return null;
  return { ok: false, error: decision.message, deferred: decision.outcome === 'defer' };
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
 * where local practice is protected. The refusal is the FIRST thing this
 * function does, before the JSON is even parsed: `replaceAllBlobs` below
 * destroys every attachment blob, so a check placed after it would return
 * "nothing was changed" having already wiped them. It is ALSO the last thing
 * before `importDB`, because that first check does not span the whole call —
 * see the comment at the install itself.
 *
 * `decidedFromRev` is the local revision this replacement was decided against.
 * A sync pull passes the revision of the snapshot it actually compared, so the
 * guarded window covers the network fetch and the pre-sync archive too — a
 * block finished in there is in neither the archive nor the incoming snapshot.
 * A deliberate caller has no earlier decision point than this call, so it
 * defaults to the revision on entry.
 */
export async function importFullBackup(
  text: string,
  intent: 'automatic' | 'deliberate' = 'deliberate',
  decidedFromRev: number = useStore.getState().rev,
): Promise<ImportOutcome> {
  // A replacement reaching this function is one the owner chose (Import,
  // Restore archive, Keep remote) or a sync pull that slipped past syncNow's
  // own deferral because practice started mid-sync. Either way an unfinished
  // session — running or paused, fresh or stale, ordinary or routine — is
  // never destroyed by it, nor is a block that was started AND FINISHED since
  // the pull was decided, and never silently: every caller already surfaces
  // this error.
  const refusal = replacementRefusal(intent, decidedFromRev);
  if (refusal) return refusal;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const validated = parseImport(text);
  if (!validated.ok) return { ok: false, error: validated.error };

  const decoded = decodeBackupFiles((parsed as { files?: unknown }).files, validated.db.attachments);
  if (!decoded.ok) return { ok: false, error: decoded.error };
  const { isFullBackup, rows } = decoded;

  try {
    // Only touch attachment blobs for a genuine full backup (files array
    // present, however short). A file with no `files` key at all leaves
    // today's attachments exactly as they are.
    if (isFullBackup) await replaceAllBlobs(rows);
  } catch (e) {
    return { ok: false, error: `Could not write attachment files (${e instanceof Error ? e.message : 'unknown error'}) — nothing was changed.` };
  }

  // Checked AGAIN, in the same synchronous tick as the install — ONE call
  // answering BOTH reasons, so no await can ever be slipped between them. The
  // check at the top of this function cannot cover the whole call:
  // `replaceAllBlobs` above yields to the event loop, so during that
  // transaction a tap can start a block or a routine (which `importDB` would
  // null) — or start one AND FINISH it, which leaves no session for presence
  // to see while the recorded block sits in a `db` the incoming snapshot is
  // about to overwrite, held by no archive. The revision comparison is what
  // catches that second case. Nothing awaits between here and the install, so
  // this one is genuinely the last word. The blobs are already written by this
  // point, so the refusal says that plainly rather than claiming nothing
  // changed; the message still names the blocking session when there is one
  // (ac-8), the practice is intact, and re-running the same import afterwards
  // finishes the job.
  const late = replacementRefusal(intent, decidedFromRev);
  if (late) {
    if (!isFullBackup) return late;
    // Say what actually happened; do NOT instruct a manual re-run, because a
    // deferral reaching here is an automatic sync that re-runs itself.
    return { ...late, error: `${late.error} (Your attachment files had already been replaced from the backup — the data itself was not. The next attempt finishes the job.)` };
  }

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount: rows.length };
}

/**
 * Decode and CHECK a full backup's `files` before a single blob is touched.
 *
 * A migration rollback is a full-backup restore, so this is the transport this
 * lane's whole recovery route depends on — and it used to `continue` past any
 * entry with no id or a non-string `data`, silently installing metadata for
 * bytes that never arrived. The file said "Imported (3 files)" and the
 * attachment was simply gone.
 *
 * Three states, kept distinct:
 *   • `files` ABSENT  — not a full backup (a bare state export, a hand-edited
 *     file). Existing blobs are left exactly as they are.
 *   • `files: []`     — a real full backup with no attachments. It DOES
 *     replace: that is what restoring to a snapshot means.
 *   • a non-empty set — every entry must be sound, or nothing is written.
 *
 * "Sound" means: an object with a non-empty string `id`, no duplicate id, a
 * string `data` that actually base64-decodes, an owner that resolves through
 * the canonical metadata, and metadata whose own ids are unique. Bytes with no
 * matching metadata (orphans) and metadata with no bytes (omissions) are both
 * refused rather than half-installed. Legacy `itemId` ownership is still
 * accepted — normalised through the same v6 semantics the migration uses — but
 * an owner is never GUESSED.
 */
function decodeBackupFiles(
  files: unknown,
  attachments: { id: string; ownerType: string; ownerId: string }[],
):
  | { ok: true; isFullBackup: boolean; rows: AttachmentBlob[] }
  | { ok: false; error: string } {
  if (files === undefined) return { ok: true, isFullBackup: false, rows: [] };
  if (!Array.isArray(files)) {
    return { ok: false, error: 'The backup\'s "files" entry is not a list of files — nothing was changed.' };
  }

  const metaIds = new Set<string>();
  for (const a of attachments) {
    if (metaIds.has(a.id)) {
      return { ok: false, error: `Two attachments in the backup share the id "${a.id}" — nothing was changed.` };
    }
    metaIds.add(a.id);
  }
  const metaById = new Map(attachments.map((a) => [a.id, a]));

  const rows: AttachmentBlob[] = [];
  const seen = new Set<string>();
  for (const raw of files) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return { ok: false, error: 'A file entry in the backup is not readable — nothing was changed.' };
    }
    const f = raw as Partial<BackupFile>;
    if (typeof f.id !== 'string' || f.id.length === 0) {
      return { ok: false, error: 'A file in the backup has no id — nothing was changed.' };
    }
    if (seen.has(f.id)) {
      return { ok: false, error: `Two files in the backup share the id "${f.id}" — nothing was changed.` };
    }
    seen.add(f.id);
    if (typeof f.data !== 'string') {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup has no readable data — nothing was changed.` };
    }
    const meta = metaById.get(f.id);
    if (!meta) {
      return {
        ok: false,
        error: `File "${f.name ?? f.id}" in the backup belongs to nothing this file describes — nothing was changed.`,
      };
    }
    // Legacy (schema ≤ 5) backups carried `itemId` instead of `ownerId`; the
    // v6 migration folds that into ownerType 'item' + ownerId, so accept it
    // here through the SAME rule rather than a second interpretation.
    const owner = typeof f.ownerId === 'string' && f.ownerId ? f.ownerId : f.itemId;
    if (typeof owner !== 'string' || owner.length === 0) {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup names no owner — nothing was changed.` };
    }
    if (owner !== meta.ownerId) {
      return {
        ok: false,
        error: `File "${f.name ?? f.id}" in the backup claims a different owner than its record — nothing was changed.`,
      };
    }
    let blob: Blob;
    try {
      blob = base64ToBlob(f.data, f.mime || 'application/octet-stream');
    } catch {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup is corrupt — nothing was changed.` };
    }
    rows.push({ id: f.id, ownerId: owner, blob });
  }

  // Metadata with no bytes would install an attachment that cannot be opened.
  // An EMPTY file set on a database that describes no attachments is fine;
  // this only fires when the two genuinely disagree.
  const missing = attachments.find((a) => !seen.has(a.id));
  if (missing) {
    return {
      ok: false,
      error: `The backup describes a file ("${missing.id}") whose contents are not in it — nothing was changed.`,
    };
  }

  return { ok: true, isFullBackup: true, rows };
}

/**
 * Recover from a refused COLD-START hydration (§C7). Every other inbound door
 * (Settings' own Import, sync, Keep remote, archive restore) is reachable
 * only once `hydrated` is true — but a refused cold start is exactly the case
 * where it never becomes true, so `App.tsx`'s corrupt-data refusal screen
 * needs its own way in. This is a thin wrapper, not a second import
 * implementation: `importFullBackup` above is the SAME validated
 * install path every other door already uses, so invalid data is rejected
 * here with nothing written, exactly as it already is everywhere else.
 * `importFullBackup`'s presence/revision guard reads `useStore.getState()`,
 * which — hydration never having succeeded — is still this store's plain
 * initial state (`emptyDB()`, no active session, `rev: 0`), so there is no
 * in-progress practice a cold start could ever be protecting and the default
 * `intent`/`decidedFromRev` are already correct.
 *
 * On success it ALSO flips `hydrated` true and clears the reactive refusal
 * flag: `importFullBackup`/`importDB` install a valid `db` but have no
 * reason to know about a gate that exists only before this device's very
 * first successful hydration. `App.tsx` renders the ordinary app the moment
 * both flip — this call is the only place that needs to know about the gate
 * at all.
 */
export async function recoverFromRefusedHydration(text: string): Promise<ImportOutcome> {
  const result = await importFullBackup(text);
  if (result.ok) {
    useStore.setState({ hydrated: true });
    useHydrationStatus.setState({ refused: false, message: null, tooNew: false });
  }
  return result;
}
