import type { AttachmentKind, AttachmentMeta, AttachmentOwnerType, ID, LessonFileKind, PracticeDB } from './types';

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

export interface ItemFileReference {
  source: 'reference';
  id: ID;
  title: string;
  /** Relative NAS path or full https URL — resolve with `resolveRecording`. */
  path: string;
  kind: LessonFileKind;
  /** The lesson this reference belongs to (references are never owned by items). */
  lessonId: ID;
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

  const lessons = db.lessons
    .filter((l) => (l.itemIds ?? []).includes(itemId))
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

  const seen = new Set<string>();
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
