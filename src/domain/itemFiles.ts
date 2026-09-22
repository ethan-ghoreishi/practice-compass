import type { AttachmentKind, AttachmentMeta, AttachmentOwnerType, ID, ISODate, LessonFileKind, PracticeDB } from './types';
import { type CourseFileKind, courseFilesFor } from './courseSeed';
import {
  CLASS_ROLE,
  CORRECTION_ROLE,
  DEMO_ROLE,
  NOTATION_ROLE,
  archiveFor,
  resourcesForPiece,
  resourcesForSession,
  resourceReference,
} from './sourceArchive';

// ---------------------------------------------------------------------------
// An item's MATERIAL — composed, never stored.
//
// Everything a piece needs to be practised from is already linked in the data:
// the lessons it came from hold NAS references (the class video, the score
// PDF), and the item itself holds attachments. Nothing new is persisted to show
// them together; this module is the composition that was always possible and
// never made.
//
// The two kinds open by COMPLETELY DIFFERENT mechanisms — a reference resolves
// through the configured NAS base URL, an attachment through a blob — so the
// `source` discriminant is not decoration: it is what stops a reference being
// opened as a blob or an attachment being pushed through the base URL. They
// also share no identity field (a reference has a path, an attachment a name),
// so they are never merged and deduplication is WITHIN a kind, never across.
// ---------------------------------------------------------------------------

/** Video first, then scores/docs, then audio — the order Lessons already shows. */
export const LESSON_FILE_KIND_ORDER: Record<LessonFileKind, number> = {
  video: 0,
  pdf: 1,
  doc: 2,
  audio: 3,
};

/** Where a composed reference came from, so the UI can say so honestly. */
export interface ItemFileProvenance {
  sessionN: number;
  date: ISODate;
  /** The archive's own role word — a correction, a demonstration, notation. */
  role: string;
  /** Parts of ONE logical demonstration share this. */
  group?: string | null;
  part?: number | null;
}

export interface ItemFileReference {
  source: 'reference';
  id: ID;
  title: string;
  /** Relative NAS path or full https URL — resolve with `resolveRecording`. */
  path: string;
  kind: LessonFileKind;
  /**
   * WHICH CONFIGURED BASE THIS PATH IS RELATIVE TO. A class reference is
   * relative to the archive base, which keeps its exact value and meaning; a
   * course file is relative to the SHARED MEDIA ROOT one folder above it. The
   * two are never resolved against each other and no reference is ever tried
   * against both — `baseForItemFile` is the one place the choice is made, so a
   * component cannot get it wrong.
   */
  root: 'archive' | 'media';
  /**
   * The lesson this reference belongs to. ABSENT for a resource composed from
   * the archive graph (which belongs to a session, not to a lesson record) and
   * for a direct reference the owner attached to the item itself.
   */
  lessonId?: ID;
  /** Present only for a resource the archive scoped to this piece. */
  archive?: ItemFileProvenance;
  /** The source no longer describes this file; its provenance is kept. */
  unavailable?: boolean;
  sizeBytes?: number;
  notes?: string;
  /**
   * Never inline. A NAS origin is not knowable at build time, so a remote file
   * could not render under the static production CSP in any case; opening it in
   * a tab is the only honest option.
   */
  inline: false;
}

export interface ItemFileAttachment {
  source: 'attachment';
  id: ID;
  title: string;
  kind: AttachmentKind;
  mime: string;
  sizeBytes: number;
  /** A local image renders inline (blob: is already permitted); nothing else does. */
  inline: boolean;
}

export type ItemFile = ItemFileReference | ItemFileAttachment;

/**
 * A course file's own kind, narrowed to the four an item's material list knows.
 * An image and a folder are both "open it where it lives" — `LessonFileKind` is
 * a PERSISTED type and is not widened for a composed value that never reaches
 * the database.
 */
const COURSE_KIND_TO_FILE_KIND: Record<CourseFileKind, LessonFileKind> = {
  video: 'video',
  pdf: 'pdf',
  image: 'doc',
  audio: 'audio',
  doc: 'doc',
  folder: 'doc',
};

/**
 * The base a reference resolves against — the ONE place that choice is made.
 * A component never picks, so a course file can never be pushed through the
 * archive base (404) and a class recording can never be pushed through the
 * media root (the wrong folder entirely).
 */
export function baseForItemFile(
  file: ItemFileReference,
  bases: { archiveBase?: string; mediaRoot?: string | null },
): string | undefined {
  return (file.root === 'media' ? bases.mediaRoot : bases.archiveBase) ?? undefined;
}

/** Same file, whichever lesson referenced it: `/a/b` and `a/b` resolve alike. */
function referenceKey(path: string): string {
  return path.trim().replace(/^\/+/, '');
}

/**
 * The single test for "this attachment belongs to this owner." `ownerId`
 * alone is not enough — an item and a lesson can collide on id, since each
 * has its own id space — so the check is only correct when `ownerType` and
 * `ownerId` are checked TOGETHER. Every surface that lists, counts or removes
 * attachments (an item's own files, a lesson's own Files section, ItemCard's
 * file-count badge) calls this instead of re-deriving the predicate, so the
 * invariant can't drift between call sites.
 */
export function attachmentsOwnedBy(
  attachments: AttachmentMeta[],
  ownerType: AttachmentOwnerType,
  ownerId: ID,
): AttachmentMeta[] {
  return attachments.filter((a) => a.ownerType === ownerType && a.ownerId === ownerId);
}

/** `attachmentsOwnedBy` narrowed to an item — the common case at every item surface. */
export function itemOwnedAttachments(attachments: AttachmentMeta[], itemId: ID): AttachmentMeta[] {
  return attachmentsOwnedBy(attachments, 'item', itemId);
}

/**
 * Every file that already belongs to an item: the NAS references of each lesson
 * the item is LINKED to (deduplicated by path, so a file referenced from two of
 * those lessons appears once), followed by the item's own attachments.
 *
 * Order is deterministic: lessons newest first, references within a lesson by
 * kind then creation, then attachments oldest first (the order the Files
 * section already lists them in).
 */
export function itemFiles(db: PracticeDB, itemId: ID): ItemFile[] {
  const out: ItemFile[] = [];
  const seen = new Set<string>();
  const item = db.items.find((i) => i.id === itemId);

  // 1. WHAT THE ARCHIVE SAYS IS MATERIAL FOR THIS PIECE.
  //
  // Scope comes from the graph, never from "everything the lesson happens to
  // hold": a class recording covers a whole lesson and stays there, a named
  // score belongs to its own piece and never bleeds onto a sibling, and the
  // owner's own practice recordings were never resources to begin with.
  const source = item?.source ? archiveFor(db, item.source.archiveId) : undefined;
  if (source && item?.source) {
    const scoped = resourcesForPiece(source, item.source.pieceKey, itemId);
    // Corrections carry the teacher's own hand and are the most useful thing
    // here, so they lead — but a clean score is still kept, not replaced by it.
    const rank = (role: string) =>
      role === CORRECTION_ROLE ? 0 : role === DEMO_ROLE ? 1 : role === NOTATION_ROLE ? 2 : 3;
    const ordered = [...scoped].sort(
      (a, b) =>
        rank(a.role) - rank(b.role) ||
        a.sessionN - b.sessionN ||
        (a.group ?? '').localeCompare(b.group ?? '') ||
        (a.part ?? 0) - (b.part ?? 0) ||
        a.path.localeCompare(b.path),
    );
    for (const r of ordered) {
      // Defensive, and cheap: the graph already excludes it, and a class
      // recording must never become one piece's material by any route.
      if (r.role === CLASS_ROLE) continue;
      const key = referenceKey(r.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const ref = resourceReference(item.source.archiveId, r, r.sessionDate);
      out.push({
        source: 'reference',
        id: ref.id,
        title: ref.title,
        path: ref.path,
        kind: ref.kind ?? 'video',
        root: 'archive',
        archive: { sessionN: r.sessionN, date: r.sessionDate, role: r.role, group: r.group, part: r.part },
        ...(r.unavailable ? { unavailable: true } : {}),
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  // 2. WHAT THE COURSE SAYS IS MATERIAL FOR THIS SECTION.
  //
  // COMPOSED LIVE FROM THE CATALOGUE, NEVER STORED ON THE ITEM. The item holds
  // only the stage and the catalogue key it was created from; its videos,
  // scores, images and contrast-card folder are read out of the course data
  // every time — so re-running the scanner after the course changes reaches
  // every item that already exists, and the owner never types a link.
  //
  // These paths are relative to the SHARED MEDIA ROOT, not to the archive base,
  // which is why they carry `root: 'media'`. No bytes enter the app: a course
  // file is opened where it lives, exactly like a class recording.
  if (item?.stageId && item.catalogKey) {
    for (const f of courseFilesFor(item.stageId, item.catalogKey)) {
      const key = referenceKey(f.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({
        source: 'reference',
        id: `course:${f.path}`,
        title: f.title,
        path: f.path,
        kind: COURSE_KIND_TO_FILE_KIND[f.kind],
        root: 'media',
        inline: false,
      });
    }
  }

  // 3. DIRECT references the owner attached to the item itself — useful
  //    material that needs no artificial lesson to hang from.
  for (const rec of item?.references ?? []) {
    const key = referenceKey(rec.path);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      source: 'reference',
      id: rec.id,
      title: rec.title,
      path: rec.path,
      kind: rec.kind ?? 'video',
      root: 'archive',
      sizeBytes: rec.sizeBytes,
      notes: rec.notes,
      inline: false,
    });
  }

  // 4. Lessons the item is LINKED to. An archive-bound lesson contributes
  //    nothing here: its files reached this list above, correctly scoped.
  //    A manual, unclassified lesson still contributes all of its references —
  //    nothing knows their scope, and inventing one would be a guess.
  const lessons = db.lessons
    .filter((l) => (l.itemIds ?? []).includes(itemId) && !l.source)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

  for (const lesson of lessons) {
    const recordings = [...(lesson.recordings ?? [])].sort(
      (a, b) =>
        LESSON_FILE_KIND_ORDER[a.kind ?? 'video'] - LESSON_FILE_KIND_ORDER[b.kind ?? 'video'] ||
        a.createdAt.localeCompare(b.createdAt),
    );
    for (const rec of recordings) {
      const key = referenceKey(rec.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({
        source: 'reference',
        id: rec.id,
        title: rec.title,
        path: rec.path,
        kind: rec.kind ?? 'video',
        root: 'archive',
        lessonId: lesson.id,
        sizeBytes: rec.sizeBytes,
        notes: rec.notes,
        inline: false,
      });
    }
  }

  const attachments = itemOwnedAttachments(db.attachments, itemId).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  for (const a of attachments) {
    out.push({
      source: 'attachment',
      id: a.id,
      title: a.name,
      kind: a.kind,
      mime: a.mime,
      sizeBytes: a.size,
      inline: a.kind === 'image',
    });
  }

  return out;
}

/**
 * What the ARCHIVE gives a lesson: its session's own files — the class
 * recording, an unnamed handout, the material that belongs to the whole class
 * rather than to one piece. An archive-bound lesson keeps no copy of these, so
 * reading its `recordings` array alone shows nothing at all; this is the only
 * way they reach the screen.
 *
 * EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT. This used to
 * compose the owner's own `recordings` and attachments too, and the lesson page
 * renders those in their own editable sections — so one authored NAS reference
 * and one local attachment each appeared TWICE, once here and once where they
 * can actually be edited or removed. An item is the opposite case and stays as
 * it is: its material is composed from OTHER records (linked lessons, the
 * graph) that the item's own page has no section for, which is exactly why
 * `itemFiles` must stay the whole composition.
 */
export function lessonFiles(db: PracticeDB, lessonId: ID): ItemFile[] {
  const out: ItemFile[] = [];
  const seen = new Set<string>();
  const lesson = db.lessons.find((l) => l.id === lessonId);
  if (!lesson) return out;

  const source = lesson.source ? archiveFor(db, lesson.source.archiveId) : undefined;
  if (source && lesson.source) {
    const resources = resourcesForSession(source, lesson.source.sessionN).sort(
      (a, b) =>
        // The class recording first — it IS the lesson — then everything else
        // in the archive's own role order, parts numerically.
        (a.role === CLASS_ROLE ? 0 : 1) - (b.role === CLASS_ROLE ? 0 : 1) ||
        a.role.localeCompare(b.role) ||
        (a.part ?? 0) - (b.part ?? 0) ||
        a.path.localeCompare(b.path),
    );
    for (const r of resources) {
      const key = referenceKey(r.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const ref = resourceReference(lesson.source.archiveId, r, lesson.date);
      out.push({
        source: 'reference',
        id: ref.id,
        title: ref.title,
        path: ref.path,
        kind: ref.kind ?? 'video',
        root: 'archive',
        lessonId,
        archive: { sessionN: lesson.source.sessionN, date: lesson.date, role: r.role, group: r.group, part: r.part },
        ...(r.unavailable ? { unavailable: true } : {}),
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  return out;
}
