import type { AttachmentKind, AttachmentMeta, AttachmentOwnerType, ID, ISODate, LessonFileKind, PracticeDB } from './types';
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
   * The lesson this reference belongs to. ABSENT for a resource composed from
   * the archive graph (which belongs to a session, not to a lesson record) and
   * for a direct reference the owner attached to the item itself.
   */
  lessonId?: ID;
  /** Present only for a resource the archive scoped to this piece. */
  archive?: ItemFileProvenance;
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
        archive: { sessionN: r.sessionN, date: r.sessionDate, role: r.role, group: r.group, part: r.part },
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  // 2. DIRECT references the owner attached to the item itself — useful
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
      sizeBytes: rec.sizeBytes,
      notes: rec.notes,
      inline: false,
    });
  }

  // 3. Lessons the item is LINKED to. An archive-bound lesson contributes
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
 * Everything a LESSON holds: the archive session's own files (the class
 * recording, an unnamed handout — the material that belongs to the whole
 * class rather than to one piece) followed by references the owner authored
 * on the lesson itself, then its attachments.
 *
 * The same composition function family as `itemFiles`, for the same reason:
 * an archive-bound lesson carries no copy of its session's resources, so
 * reading its `recordings` array alone would show nothing at all.
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
        lessonId,
        archive: { sessionN: lesson.source.sessionN, date: lesson.date, role: r.role, group: r.group, part: r.part },
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  for (const rec of [...(lesson.recordings ?? [])].sort(
    (a, b) =>
      LESSON_FILE_KIND_ORDER[a.kind ?? 'video'] - LESSON_FILE_KIND_ORDER[b.kind ?? 'video'] ||
      a.createdAt.localeCompare(b.createdAt),
  )) {
    const key = referenceKey(rec.path);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      source: 'reference',
      id: rec.id,
      title: rec.title,
      path: rec.path,
      kind: rec.kind ?? 'video',
      lessonId,
      sizeBytes: rec.sizeBytes,
      notes: rec.notes,
      inline: false,
    });
  }

  for (const a of attachmentsOwnedBy(db.attachments, 'lesson', lessonId).sort((x, y) =>
    x.createdAt.localeCompare(y.createdAt),
  )) {
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
