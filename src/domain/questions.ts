import type { ID, ISODateTime, Lesson, LessonAgendaEntry, LessonQuestion, PracticeBlock, PracticeItem } from './types';
import { faCollator } from './farsi';
import { defaultTargetLesson, isOpenQuestion, isQuestion, isUnassigned } from './lessonAgenda';
import { latestObservation } from './blocks';
import { isUpcomingLesson } from './sourceArchive';
import { isolate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Questions for a class — the things the owner actually wants to ask their
// teacher, composed from the one lesson-agenda collection.
//
// Two changes this module exists to carry, both of which the old
// "both fields set on the item" rule made impossible:
//
//   • Questions are selected BY LESSON ID, not by instrument. Every future
//     class used to show the identical list, so a question meant for March
//     appeared on January's agenda and looked unanswered for months.
//   • A question is independent of preparation. It needs no item, it changes
//     no practice priority, and one item can carry several without them
//     overwriting each other.
//
// A question is NEVER cleared by practising. It leaves the open list only when
// the owner explicitly marks it asked, and it then stays with the class it was
// asked at — history, not something automatically carried forward.
// ---------------------------------------------------------------------------

export interface ClassQuestion {
  /** The agenda entry's own id — the handle every action needs. */
  id: ID;
  /** The item it concerns, when it concerns one. */
  itemId?: ID;
  /** That item's title, when the item still exists. */
  title?: string;
  question: string;
  /**
   * The item's most recent recorded observation AND the day it was written —
   * CURRENT context, derived from its blocks, never an answer to this question
   * and never evidence the question was asked. Dated, because a sentence from
   * six months ago reads exactly like last night's without one.
   *
   * The item's Working notes are deliberately NOT here: a personal notebook is
   * not a line item on a teacher's sheet.
   */
  lastObservation?: { text: string; at: ISODateTime };
  /** Set once it has been asked; the entry is then historical. */
  askedAt?: string;
  answer?: string;
  /** True when it names no class — visibly unassigned, never invented. */
  unassigned: boolean;
}

function toClassQuestion(entry: LessonQuestion, items: PracticeItem[], blocks: PracticeBlock[]): ClassQuestion {
  const item = entry.itemId ? items.find((i) => i.id === entry.itemId) : undefined;
  return {
    id: entry.id,
    itemId: entry.itemId,
    title: item?.title.trim(),
    question: entry.text.trim(),
    lastObservation: item ? latestObservation(blocks.filter((b) => b.practiceItemId === item.id)) : undefined,
    askedAt: entry.askedAt,
    answer: entry.answer?.trim() || undefined,
    unassigned: isUnassigned(entry),
  };
}

/**
 * Sorted by the item's title with the Persian collator so Farsi titles order
 * naturally; a question with no item sorts by its own text. Ties break on the
 * entry id so the order is stable whatever order storage returned.
 */
function sortQuestions(list: ClassQuestion[]): ClassQuestion[] {
  return list.sort(
    (a, b) => faCollator.compare(a.title ?? a.question, b.title ?? b.question) || a.id.localeCompare(b.id),
  );
}

/** Every question targeted at ONE specific class, asked or not. */
export function questionsForLessonId(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  lessonId: ID,
  blocks: PracticeBlock[] = [],
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isQuestion)
      .filter((q) => q.lessonId === lessonId)
      .map((q) => toClassQuestion(q, items, blocks)),
  );
}

/** The still-open ones for that class — what to take into the room. */
export function openQuestionsForLessonId(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  lessonId: ID,
  blocks: PracticeBlock[] = [],
): ClassQuestion[] {
  return questionsForLessonId(agenda, items, lessonId, blocks).filter((q) => !q.askedAt);
}

/**
 * Open questions on this instrument that name no class at all. They are shown
 * separately and never folded into a lesson's own agenda: presenting an
 * unassigned question as if it belonged to a particular class is the guess
 * this whole model exists to avoid.
 */
export function unassignedOpenQuestions(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  instrumentId: ID,
  blocks: PracticeBlock[] = [],
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isOpenQuestion)
      .filter((q) => q.instrumentId === instrumentId && isUnassigned(q))
      .map((q) => toClassQuestion(q, items, blocks)),
  );
}

/** Every open question on this instrument, whether assigned to a class or not. */
export function openQuestionsForInstrument(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  instrumentId: ID,
  blocks: PracticeBlock[] = [],
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isOpenQuestion)
      .filter((q) => q.instrumentId === instrumentId)
      .map((q) => toClassQuestion(q, items, blocks)),
  );
}

// --- A question captured while practising ----------------------------------
//
// Ownership is FROZEN when the field opens: the instrument, the item being
// practised (none for an unbound routine segment — never a guessed one) and
// the nearest upcoming class. A routine boundary, a deleted item or a changed
// class while the owner types never retargets the words; a target that has
// become invalid is explained and refused, and the owner chooses again.

export interface QuestionCapture {
  instrumentId: ID;
  itemId?: ID;
  lessonId?: ID;
}

export function openQuestionCapture(lessons: Lesson[], instrumentId: ID, itemId: ID | undefined, now: Date): QuestionCapture {
  const lesson = defaultTargetLesson(lessons, instrumentId, now);
  return { instrumentId, ...(itemId ? { itemId } : {}), ...(lesson ? { lessonId: lesson.id } : {}) };
}

/** Why the frozen owner can no longer take the words — per target — or null when it still can. */
export function captureTargetProblem(
  db: { items: PracticeItem[]; lessons: Lesson[] },
  capture: QuestionCapture,
  now: Date,
): { item?: string; lesson?: string } | null {
  const out: { item?: string; lesson?: string } = {};
  if (capture.itemId) {
    const item = db.items.find((i) => i.id === capture.itemId);
    if (!item) out.item = 'The item this question was about was deleted while you typed.';
    else if (item.instrumentId !== capture.instrumentId) out.item = 'The item this question was about moved to another instrument while you typed.';
  }
  if (capture.lessonId) {
    const lesson = db.lessons.find((l) => l.id === capture.lessonId);
    if (!lesson) out.lesson = 'The class it was for was deleted while you typed.';
    else if (lesson.instrumentId !== capture.instrumentId) out.lesson = 'The class it was for moved to another instrument while you typed.';
    else if (!isUpcomingLesson(lesson, todayISODate(now))) out.lesson = 'The class it was for is no longer upcoming.';
  }
  return out.item || out.lesson ? out : null;
}

/** A short label for the class an entry names, for display next to it. */
export function lessonLabel(lesson: Lesson | undefined): string {
  if (!lesson) return 'Unassigned';
  return lesson.number ? `Class ${lesson.number} · ${lesson.date}` : lesson.date;
}

/** Plain-text export (copy / download / print). Every value the owner wrote is
 *  a bidi isolate (`isolate`), so a Farsi line keeps its own direction inside
 *  the English sheet wherever the text is pasted, printed or shown. */
export function renderClassQuestionsText(
  instrumentName: string,
  dateLabel: string,
  questions: ClassQuestion[],
): string {
  const lines: string[] = [];
  lines.push(`Questions for ${isolate(instrumentName)} class — ${dateLabel}`);
  lines.push('');
  if (questions.length === 0) {
    lines.push('(No questions yet. Add one from an item or from the class itself.)');
    return lines.join('\n');
  }
  questions.forEach((q, idx) => {
    lines.push(`${idx + 1}. ${q.title !== undefined ? isolate(q.title) : '(no item)'}`);
    lines.push(`   Q: ${isolate(q.question)}`);
    if (q.answer) lines.push(`   A: ${isolate(q.answer)}`);
    // Current context, dated and labelled as such — never the item's Working
    // notes, and never presented as an answer to the question above it.
    if (q.lastObservation) lines.push(`   Last observed ${q.lastObservation.at.slice(0, 10)}: ${isolate(q.lastObservation.text)}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}
