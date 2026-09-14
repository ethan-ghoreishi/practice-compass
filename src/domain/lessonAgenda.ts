import type {
  ID,
  ISODate,
  ISODateTime,
  Lesson,
  LessonAgendaEntry,
  LessonPreparation,
  LessonQuestion,
  PracticeDB,
} from './types';
import { nowISO, todayISODate } from './util';

// ---------------------------------------------------------------------------
// The lesson agenda — one typed collection for "prepare this for that class"
// and "ask this at that class".
//
// Everything here is pure and takes an explicit `now`. Two things this module
// exists to keep apart, because the app used to conflate them in one boolean
// and one string on the item:
//
//   • A PREPARATION names a specific lesson, and that lesson's OWN date is the
//     only deadline it carries. A later commitment can never inherit an
//     earlier class's urgency, and an unassigned or past commitment carries
//     none at all.
//   • A QUESTION is not preparation. It changes no practice priority ever. It
//     keeps its own text, so several questions never overwrite each other, and
//     once asked it stays with the lesson it was asked at — historical, never
//     automatically carried forward to the next class.
// ---------------------------------------------------------------------------

export function isPreparation(e: LessonAgendaEntry): e is LessonPreparation {
  return e.kind === 'preparation';
}

export function isQuestion(e: LessonAgendaEntry): e is LessonQuestion {
  return e.kind === 'question';
}

/** Open = not yet asked. Asked entries leave the upcoming/open lists. */
export function isOpenQuestion(e: LessonAgendaEntry): e is LessonQuestion {
  return isQuestion(e) && !e.askedAt;
}

/** A commitment with no named lesson — visibly unassigned, never invented. */
export function isUnassigned(e: LessonAgendaEntry): boolean {
  return !e.lessonId;
}

export function entriesForInstrument(agenda: LessonAgendaEntry[], instrumentId: ID): LessonAgendaEntry[] {
  return agenda.filter((e) => e.instrumentId === instrumentId);
}

export function entriesForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonAgendaEntry[] {
  return agenda.filter((e) => e.lessonId === lessonId);
}

export function preparationsForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonPreparation[] {
  return entriesForLesson(agenda, lessonId).filter(isPreparation);
}

export function questionsForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonQuestion[] {
  return entriesForLesson(agenda, lessonId).filter(isQuestion);
}

/**
 * Unassigned entries for one instrument — what the owner still has to point at
 * a class. This is the honest home for everything the v12 migration converted:
 * the old data recorded no target, so none is invented for it.
 */
export function unassignedForInstrument(agenda: LessonAgendaEntry[], instrumentId: ID): LessonAgendaEntry[] {
  return entriesForInstrument(agenda, instrumentId).filter(isUnassigned);
}

/** Every preparation commitment naming this item, whatever its target. */
export function preparationsForItem(agenda: LessonAgendaEntry[], itemId: ID): LessonPreparation[] {
  return agenda.filter(isPreparation).filter((e) => e.itemId === itemId);
}

/** Every question concerning this item, open or asked. */
export function questionsForItem(agenda: LessonAgendaEntry[], itemId: ID): LessonQuestion[] {
  return agenda.filter(isQuestion).filter((e) => e.itemId === itemId);
}

/**
 * The lesson a NEW entry defaults to: the nearest lesson today or later on that
 * instrument. With no future lesson this is `undefined` — capture the entry
 * unassigned rather than inventing a class that does not exist (§C2).
 */
export function defaultTargetLesson(lessons: Lesson[], instrumentId: ID, now: Date): Lesson | undefined {
  const today = todayISODate(now);
  return lessons
    .filter((l) => l.instrumentId === instrumentId && l.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0];
}

/**
 * Per ITEM, the nearest date it is genuinely committed to prepare for: the
 * earliest lesson that is today or later, on the entry's own instrument, that
 * an existing preparation entry actually names.
 *
 * This is the ONLY channel by which lesson intent reaches practice priority.
 * A question contributes nothing. An unassigned commitment contributes
 * nothing. A commitment whose lesson has already passed contributes nothing —
 * its deadline is gone, and reading it as "still due" is exactly how a rolling
 * boolean used to keep an item permanently urgent. A commitment naming a
 * LATER class contributes that later date, never the nearest one.
 */
export function preparationDatesByItem(
  agenda: LessonAgendaEntry[],
  lessons: Lesson[],
  now: Date,
): Map<ID, ISODate> {
  const today = todayISODate(now);
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const out = new Map<ID, ISODate>();
  for (const e of agenda) {
    if (!isPreparation(e) || !e.lessonId) continue;
    const lesson = byId.get(e.lessonId);
    // A target on another instrument is not a valid commitment for this item.
    if (!lesson || lesson.instrumentId !== e.instrumentId) continue;
    if (lesson.date < today) continue;
    const cur = out.get(e.itemId);
    if (!cur || lesson.date < cur) out.set(e.itemId, lesson.date);
  }
  return out;
}

/** Item ids with a live (today-or-later) preparation commitment. */
export function itemsPreparedForLesson(agenda: LessonAgendaEntry[], lessons: Lesson[], now: Date): Set<ID> {
  return new Set(preparationDatesByItem(agenda, lessons, now).keys());
}

// --- Transforms -------------------------------------------------------------
//
// Every one returns a NEW array and touches only the entry it names. None of
// them logs practice, completes a review, or moves any spacing state — an
// agenda action is administration, never evidence.

function touch<T extends LessonAgendaEntry>(e: T, now: Date): T {
  return { ...e, updatedAt: nowISO(now) };
}

/** Mark a question asked, optionally recording the teacher's answer. */
export function markQuestionAsked(
  agenda: LessonAgendaEntry[],
  id: ID,
  now: Date,
  answer?: string,
): LessonAgendaEntry[] {
  return agenda.map((e) =>
    e.id === id && isQuestion(e)
      ? touch({ ...e, askedAt: e.askedAt ?? nowISO(now), answer: answer?.trim() || e.answer }, now)
      : e,
  );
}

/** Put an asked question back on the open list — explicit and reversible. */
export function reopenQuestion(agenda: LessonAgendaEntry[], id: ID, now: Date): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.id !== id || !isQuestion(e)) return e;
    // Destructure the field OUT rather than setting it undefined: an
    // `askedAt: undefined` key survives JSON round-trips as a present key in
    // some shapes, and "open" must mean the field is genuinely absent.
    const rest = { ...e };
    delete rest.askedAt;
    return touch(rest as LessonQuestion, now);
  });
}

/** Record or replace a teacher answer without changing the asked state. */
export function setQuestionAnswer(
  agenda: LessonAgendaEntry[],
  id: ID,
  answer: string,
  now: Date,
): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.id !== id || !isQuestion(e)) return e;
    const trimmed = answer.trim();
    const rest = { ...e };
    delete rest.answer;
    return touch(trimmed ? ({ ...rest, answer: trimmed } as LessonQuestion) : (rest as LessonQuestion), now);
  });
}

/**
 * Point an entry at a different lesson — the ONLY way a commitment changes
 * class. There is no automatic carry-forward: an unasked question sitting on a
 * past lesson stays on that lesson until the owner moves it here.
 *
 * A target on another instrument is refused (the array comes back unchanged)
 * rather than silently rewriting either side's instrument.
 */
export function retargetEntry(
  agenda: LessonAgendaEntry[],
  id: ID,
  lessonId: ID | undefined,
  lessons: Lesson[],
  now: Date,
): LessonAgendaEntry[] {
  const entry = agenda.find((e) => e.id === id);
  if (!entry) return agenda;
  if (lessonId) {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || lesson.instrumentId !== entry.instrumentId) return agenda;
  }
  return agenda.map((e) => {
    if (e.id !== id) return e;
    if (!lessonId) {
      const { lessonId: previous, ...rest } = e;
      return touch(
        { ...rest, ...(previous ? { detachedFromLessonId: previous } : {}) } as LessonAgendaEntry,
        now,
      );
    }
    return touch({ ...e, lessonId } as LessonAgendaEntry, now);
  });
}

/**
 * A lesson was deleted: every entry naming it becomes visibly unassigned and
 * REMEMBERS which lesson it used to name. Nothing is deleted and nothing is
 * silently reassigned to another class — an asked question stays asked, its
 * history intact.
 */
export function detachLesson(agenda: LessonAgendaEntry[], lessonId: ID, now: Date): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.lessonId !== lessonId) return e;
    const { lessonId: previous, ...rest } = e;
    return touch({ ...rest, detachedFromLessonId: previous } as LessonAgendaEntry, now);
  });
}

/**
 * An item was deleted. Its PREPARATION commitments go with it — a commitment
 * to prepare something that no longer exists means nothing — but its QUESTIONS
 * survive, detached, because the question and its answer are the owner's own
 * record of the class, not a property of the item.
 */
export function detachItem(agenda: LessonAgendaEntry[], itemId: ID, now: Date): LessonAgendaEntry[] {
  return agenda
    .filter((e) => !(isPreparation(e) && e.itemId === itemId))
    .map((e) => {
      if (!isQuestion(e) || e.itemId !== itemId) return e;
      const { itemId: previous, ...rest } = e;
      return touch({ ...rest, detachedFromItemId: previous } as LessonQuestion, now);
    });
}

/**
 * An item changed instrument. A commitment or question follows the item, and
 * any lesson target that no longer matches is cleared rather than pointing at
 * another instrument's class.
 */
export function retargetEntriesForItemInstrument(
  agenda: LessonAgendaEntry[],
  itemId: ID,
  instrumentId: ID,
  lessons: Lesson[],
  now: Date,
): LessonAgendaEntry[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return agenda.map((e) => {
    const concerns = isPreparation(e) ? e.itemId === itemId : e.itemId === itemId;
    if (!concerns || e.instrumentId === instrumentId) return e;
    const lesson = e.lessonId ? byId.get(e.lessonId) : undefined;
    if (lesson && lesson.instrumentId !== instrumentId) {
      const { lessonId: previous, ...rest } = e;
      return touch({ ...rest, instrumentId, detachedFromLessonId: previous } as LessonAgendaEntry, now);
    }
    return touch({ ...e, instrumentId } as LessonAgendaEntry, now);
  });
}

// --- Factories --------------------------------------------------------------

export function createPreparation(args: {
  id: ID;
  itemId: ID;
  instrumentId: ID;
  lessonId?: ID;
  now: Date;
}): LessonPreparation {
  const at: ISODateTime = nowISO(args.now);
  return {
    id: args.id,
    kind: 'preparation',
    itemId: args.itemId,
    instrumentId: args.instrumentId,
    ...(args.lessonId ? { lessonId: args.lessonId } : {}),
    createdAt: at,
    updatedAt: at,
  };
}

export function createQuestion(args: {
  id: ID;
  text: string;
  instrumentId: ID;
  itemId?: ID;
  lessonId?: ID;
  now: Date;
}): LessonQuestion {
  const at: ISODateTime = nowISO(args.now);
  return {
    id: args.id,
    kind: 'question',
    text: args.text,
    instrumentId: args.instrumentId,
    ...(args.itemId ? { itemId: args.itemId } : {}),
    ...(args.lessonId ? { lessonId: args.lessonId } : {}),
    createdAt: at,
    updatedAt: at,
  };
}

// --- Validation -------------------------------------------------------------

const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;

/**
 * A real ISO date-time, not merely a string shaped like the prefix of one:
 * `/^\d{4}-\d{2}-\d{2}T/` alone matches "2027-13-40T99:99:99.000Z" just as
 * happily as a genuine timestamp. Every `askedAt` this app itself writes
 * comes from `nowISO` (`new Date().toISOString()`), which `Date.parse` always
 * reads back losslessly, so this rejects nothing legitimate.
 */
function isValidISODateTime(s: string): boolean {
  return ISO_DATE_TIME.test(s) && Number.isFinite(Date.parse(s));
}

/**
 * Validate the agenda collection of an INBOUND database, before anything is
 * installed. Returns a human-readable problem, or null when the collection is
 * usable. Deliberately bounded to this model plus the scheduling fields it
 * shares a schema version with — it is not a general database sanitiser.
 *
 * Legitimate unassigned and detached historical records PASS: an entry with no
 * lesson, an asked question whose item is gone, a question with no item at all
 * are all honest states this app produces itself.
 *
 * A LIVE `lessonId` that resolves to NOTHING is different: `deleteLesson`
 * always converts the live reference to `detachedFromLessonId` (see
 * `detachLesson`), so this app never leaves one dangling — a `lessonId` that
 * is neither absent nor resolving is invalid new intent, not legacy debris.
 * A dangling `itemId` stays TOLERATED, deliberately asymmetric with
 * `lessonId`: the v11→v12 migration mints entries from `db.items` at the
 * moment it runs, so an item deleted afterwards leaves its own agenda entries
 * pointing at nothing — every reader already copes with that, the same way
 * a dangling `instrumentId` is tolerated just above — and refusing to restore
 * a backup over one would make the owner's own documented recovery copy
 * unrestorable, exactly the data loss this guard exists to prevent.
 */
export function validateLessonAgenda(
  db: Pick<PracticeDB, 'lessonAgenda' | 'items' | 'lessons' | 'instruments'>,
): string | null {
  const agenda: unknown[] = db.lessonAgenda as unknown[];
  if (!Array.isArray(agenda)) return 'Field "lessonAgenda" must be a list.';

  const seen = new Set<string>();
  const instruments = new Set(db.instruments.map((i) => i.id));
  const itemById = new Map(db.items.map((i) => [i.id, i]));
  const lessonById = new Map(db.lessons.map((l) => [l.id, l]));

  for (const raw of agenda) {
    if (!raw || typeof raw !== 'object') return 'Some lesson-agenda entries are not objects.';
    // Read the inbound row loosely: it is untrusted data that has not yet
    // earned the union type it claims.
    const e = raw as {
      id?: unknown;
      kind?: unknown;
      instrumentId?: unknown;
      lessonId?: unknown;
      itemId?: unknown;
      text?: unknown;
      askedAt?: unknown;
      answer?: unknown;
    };
    if (typeof e.id !== 'string' || !e.id) return 'Some lesson-agenda entries are missing an id.';
    if (seen.has(e.id)) return `Two lesson-agenda entries share the id "${e.id}".`;
    seen.add(e.id);
    if (e.kind !== 'preparation' && e.kind !== 'question') {
      return `Lesson-agenda entry "${e.id}" has an unknown kind.`;
    }
    // An instrument id is REQUIRED, but an id that no longer resolves is not
    // grounds to refuse the whole import: the v12 migration mints entries from
    // existing items, and an old backup can legitimately hold an item whose
    // instrument was deleted years ago. Refusing that would make the owner's
    // own pre-upgrade export — the documented recovery copy — unrestorable.
    // What IS checked is that a target actually PRESENT agrees with it.
    if (typeof e.instrumentId !== 'string' || !e.instrumentId) {
      return `Lesson-agenda entry "${e.id}" is missing its instrument.`;
    }
    void instruments;
    // A LIVE lesson target that resolves to nothing at all is refused
    // outright — see this function's own docstring for why that is never
    // legacy debris. A target that resolves must also agree with the
    // entry's instrument.
    if (typeof e.lessonId === 'string') {
      const lesson = lessonById.get(e.lessonId);
      if (!lesson) return `Lesson-agenda entry "${e.id}" names a class that no longer exists.`;
      if (lesson.instrumentId !== e.instrumentId) {
        return `Lesson-agenda entry "${e.id}" names a class on a different instrument.`;
      }
    } else if (e.lessonId !== undefined) {
      return `Lesson-agenda entry "${e.id}" has an unreadable class reference.`;
    }
    // An item target that no longer resolves is tolerated (see the
    // docstring); one that DOES resolve must agree with the entry's
    // instrument — a mismatch there is invalid new intent regardless.
    if (e.kind === 'preparation') {
      if (typeof e.itemId !== 'string' || !e.itemId) {
        return `Preparation "${e.id}" names no practice item.`;
      }
      const item = itemById.get(e.itemId);
      if (item && item.instrumentId !== e.instrumentId) {
        return `Preparation "${e.id}" names an item on a different instrument.`;
      }
    } else {
      if (typeof e.text !== 'string' || !e.text.trim()) {
        return `Question "${e.id}" has no text.`;
      }
      if (typeof e.itemId === 'string') {
        const item = itemById.get(e.itemId);
        if (item && item.instrumentId !== e.instrumentId) {
          return `Question "${e.id}" names an item on a different instrument.`;
        }
      } else if (e.itemId !== undefined) {
        return `Question "${e.id}" has an unreadable item reference.`;
      }
      if (e.askedAt !== undefined && (typeof e.askedAt !== 'string' || !isValidISODateTime(e.askedAt))) {
        return `Question "${e.id}" has an unreadable asked date.`;
      }
      if (e.answer !== undefined && typeof e.answer !== 'string') {
        return `Question "${e.id}" has an unreadable answer.`;
      }
    }
  }
  return null;
}
