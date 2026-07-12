import type { PracticeItem } from './types';
import { faCollator } from './farsi';

// ---------------------------------------------------------------------------
// "Questions for next class" — the questions the user wants to actually ask
// their teacher, distinct from the report's broad "questions for teacher"
// list. Included only when BOTH are true: the item is flagged for the next
// class (`assignedForLesson`) AND it carries a `teacherQuestion`. Pure and
// deterministic; scoped to one instrument; ordered by title with the Persian
// collator so Farsi titles sort naturally.
//
// A question is NEVER cleared automatically — practising an item does not
// erase what you meant to ask. The user removes it by editing the item.
// ---------------------------------------------------------------------------

export interface ClassQuestion {
  itemId: string;
  title: string;
  question: string;
  currentProblem?: string;
  lastObservation?: string;
}

export function questionsForNextClass(items: PracticeItem[], instrumentId: string): ClassQuestion[] {
  return items
    .filter((i) => i.instrumentId === instrumentId)
    .filter((i) => i.assignedForLesson === true)
    .filter((i) => typeof i.teacherQuestion === 'string' && i.teacherQuestion.trim().length > 0)
    .map((i) => ({
      itemId: i.id,
      title: i.title.trim(),
      question: i.teacherQuestion!.trim(),
      currentProblem: i.currentProblem?.trim() || undefined,
      lastObservation: i.lastObservation?.trim() || undefined,
    }))
    .sort((a, b) => faCollator.compare(a.title, b.title));
}

/** Plain-text export (copy / download / print). Direction-neutral: the app's
 *  global `unicode-bidi: plaintext` keeps mixed Farsi/English lines correct. */
export function renderClassQuestionsText(instrumentName: string, dateLabel: string, questions: ClassQuestion[]): string {
  const lines: string[] = [];
  lines.push(`Questions for ${instrumentName} class — ${dateLabel}`);
  lines.push('');
  if (questions.length === 0) {
    lines.push('(No questions yet. Flag an item “for next class” and add a teacher question.)');
    return lines.join('\n');
  }
  questions.forEach((q, idx) => {
    lines.push(`${idx + 1}. ${q.title}`);
    lines.push(`   Q: ${q.question}`);
    if (q.currentProblem) lines.push(`   Problem: ${q.currentProblem}`);
    if (q.lastObservation) lines.push(`   Last time: ${q.lastObservation}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}
