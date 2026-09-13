import type { ID, Lesson, LessonAgendaEntry, LessonQuestion, PracticeItem } from './types';
import { faCollator } from './farsi';
import { isOpenQuestion, isQuestion, isUnassigned } from './lessonAgenda';

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
  currentProblem?: string;
  lastObservation?: string;
  /** Set once it has been asked; the entry is then historical. */
  askedAt?: string;
  answer?: string;
  /** True when it names no class — visibly unassigned, never invented. */
  unassigned: boolean;
}

function toClassQuestion(entry: LessonQuestion, items: PracticeItem[]): ClassQuestion {
  const item = entry.itemId ? items.find((i) => i.id === entry.itemId) : undefined;
  return {
    id: entry.id,
    itemId: entry.itemId,
    title: item?.title.trim(),
    question: entry.text.trim(),
    currentProblem: item?.currentProblem?.trim() || undefined,
    lastObservation: item?.lastObservation?.trim() || undefined,
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
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isQuestion)
      .filter((q) => q.lessonId === lessonId)
      .map((q) => toClassQuestion(q, items)),
  );
}

/** The still-open ones for that class — what to take into the room. */
export function openQuestionsForLessonId(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  lessonId: ID,
): ClassQuestion[] {
  return questionsForLessonId(agenda, items, lessonId).filter((q) => !q.askedAt);
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
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isOpenQuestion)
      .filter((q) => q.instrumentId === instrumentId && isUnassigned(q))
      .map((q) => toClassQuestion(q, items)),
  );
}

/** Every open question on this instrument, whether assigned to a class or not. */
export function openQuestionsForInstrument(
  agenda: LessonAgendaEntry[],
  items: PracticeItem[],
  instrumentId: ID,
): ClassQuestion[] {
  return sortQuestions(
    agenda
      .filter(isOpenQuestion)
      .filter((q) => q.instrumentId === instrumentId)
      .map((q) => toClassQuestion(q, items)),
  );
}

/** A short label for the class an entry names, for display next to it. */
export function lessonLabel(lesson: Lesson | undefined): string {
  if (!lesson) return 'Unassigned';
  return lesson.number ? `Class ${lesson.number} · ${lesson.date}` : lesson.date;
}

/** Plain-text export (copy / download / print). Direction-neutral: the app's
 *  `unicode-bidi: plaintext` on free-text fields keeps mixed lines correct. */
export function renderClassQuestionsText(
  instrumentName: string,
  dateLabel: string,
  questions: ClassQuestion[],
): string {
  const lines: string[] = [];
  lines.push(`Questions for ${instrumentName} class — ${dateLabel}`);
  lines.push('');
  if (questions.length === 0) {
    lines.push('(No questions yet. Add one from an item or from the class itself.)');
    return lines.join('\n');
  }
  questions.forEach((q, idx) => {
    lines.push(`${idx + 1}. ${q.title ?? '(no item)'}`);
    lines.push(`   Q: ${q.question}`);
    if (q.answer) lines.push(`   A: ${q.answer}`);
    if (q.currentProblem) lines.push(`   Problem: ${q.currentProblem}`);
    if (q.lastObservation) lines.push(`   Last time: ${q.lastObservation}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}
