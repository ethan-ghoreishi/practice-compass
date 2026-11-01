import type { ID, Lesson, LessonRecording, PracticeDB } from './types';
import type { ArchiveSource } from './sourceArchive';
import { nowISO } from './util';

// ---------------------------------------------------------------------------
// ONE CLASS, ONE RECORD: folding an archive-bound twin into the owner's lesson.
//
// The reachable shape (the owner's Class 41, 2026-10-27): the owner planned
// the class in Compass — two links, two commitments, two questions — and an
// earlier Refresh, finding no path evidence, created a second lesson for the
// same session. Both are real records; neither may simply be deleted.
//
// The OWNER's lesson survives — it is what every agenda entry, attachment,
// draft and screen already names, so keeping its id rewrites the fewest
// references. The archive binding moves onto it, and everything the twin
// holds is carried over by reference, never re-created:
//
//   notes        both kept when both are written and different
//   itemIds      union, the survivor's order first
//   recordings   union by row; a shared path with other metadata stays two rows
//   agenda       `lessonId` / `detachedFromLessonId` re-pointed; id, text,
//                asked state, answer and timestamps untouched
//   attachments  `ownerId` re-pointed; the bytes are keyed by attachment id
//                and are never read, copied or deleted
//
// It is NOT `deleteLesson`: that deletes blobs, detaches the agenda and writes
// a session suppression — a deletion and a restore, which is exactly what a
// combine must never be. PURE and clock-explicit; the store commits it inside
// the archive import's one mutation.
// ---------------------------------------------------------------------------

export interface LessonMerge {
  archiveId: ID;
  sessionN: number;
  /** The owner's lesson: it survives, keeps its id and takes the binding. */
  lessonId: ID;
  /** The archive-bound twin folded into it. */
  boundId: ID;
}

/** Both texts, never one over the other. Identical (or one empty) collapses to one. */
export function combinedNotes(mine: string | undefined, theirs: string | undefined): string | undefined {
  const a = (mine ?? '').trim();
  const b = (theirs ?? '').trim();
  if (!b || a === b) return mine;
  if (!a) return theirs;
  return `${mine}\n\n${theirs}`;
}

function sameRow(a: LessonRecording, b: LessonRecording): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Has the owner said this session is NOT this lesson? (D6, docs/setar-lesson-lifecycle.md) */
export function isLessonKeptSeparate(source: ArchiveSource | undefined, sessionN: number, lessonId: ID): boolean {
  return (source?.suppressions ?? []).some((s) => s.kind === 'session' && s.ref === String(sessionN) && s.itemId === lessonId);
}

/**
 * Fold `boundId` into `lessonId`. Returns the database unchanged (same object)
 * when either lesson is missing — the caller has already re-planned and
 * refused a stale decision, so this is a backstop, never a guess.
 */
export function consolidateLesson(db: PracticeDB, merge: LessonMerge, now: Date): PracticeDB {
  const survivor = db.lessons.find((l) => l.id === merge.lessonId);
  const twin = db.lessons.find((l) => l.id === merge.boundId);
  if (!survivor || !twin || survivor.id === twin.id) return db;

  const recordings = [...(survivor.recordings ?? [])];
  for (const r of twin.recordings ?? []) {
    if (!recordings.some((x) => x.id === r.id && sameRow(x, r))) recordings.push(r);
  }
  const itemIds = [...(survivor.itemIds ?? [])];
  for (const id of twin.itemIds ?? []) if (!itemIds.includes(id)) itemIds.push(id);
  const notes = combinedNotes(survivor.notes, twin.notes);

  const merged: Lesson = {
    ...survivor,
    // The owner's own `origin` (absent: planned) is kept — provenance is not
    // scheduling intent (D7). The binding is the archive's fact.
    source: { archiveId: merge.archiveId, sessionN: merge.sessionN },
    ...(notes !== undefined ? { notes } : {}),
    ...(itemIds.length > 0 ? { itemIds } : {}),
    ...(recordings.length > 0 ? { recordings } : {}),
    updatedAt: nowISO(now),
  };
  if (notes === undefined) delete merged.notes;

  return {
    ...db,
    lessons: db.lessons.filter((l) => l.id !== twin.id).map((l) => (l.id === survivor.id ? merged : l)),
    lessonAgenda: db.lessonAgenda.map((e) =>
      e.lessonId === twin.id || e.detachedFromLessonId === twin.id
        ? {
            ...e,
            ...(e.lessonId === twin.id ? { lessonId: survivor.id } : {}),
            ...(e.detachedFromLessonId === twin.id ? { detachedFromLessonId: survivor.id } : {}),
          }
        : e,
    ),
    attachments: db.attachments.map((a) => (a.ownerType === 'lesson' && a.ownerId === twin.id ? { ...a, ownerId: survivor.id } : a)),
  };
}

/**
 * Every unbound lesson that is, by the archive's own facts, the SAME class as
 * an archive-bound one (same instrument, session date and number) and was not
 * kept separate — the pairs Refresh will ask about. Read from the ACCEPTED
 * graph, so a screen can point at the question offline; the decision itself is
 * taken in Refresh, through `planArchiveImport`, and nowhere else.
 */
export function lessonTwins(db: PracticeDB): LessonMerge[] {
  const out: LessonMerge[] = [];
  for (const source of db.archiveSources ?? []) {
    for (const bound of db.lessons) {
      if (bound.source?.archiveId !== source.id) continue;
      const session = source.sessions.find((s) => s.n === bound.source!.sessionN);
      if (!session) continue;
      for (const l of db.lessons) {
        if (l.source || l.instrumentId !== source.instrumentId || l.date !== session.date || l.number !== session.n) continue;
        if (isLessonKeptSeparate(source, session.n, l.id)) continue;
        out.push({ archiveId: source.id, sessionN: session.n, lessonId: l.id, boundId: bound.id });
      }
    }
  }
  return out;
}
