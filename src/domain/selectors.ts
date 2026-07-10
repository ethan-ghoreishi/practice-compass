import type {
  ID,
  Instrument,
  ISODate,
  Lesson,
  PracticeBlock,
  PracticeItem,
  Review,
} from './types';
import { daysSinceTouched, groupBlocksByItem, isSaturated, overdueDays } from './scoring';
import { dayDiff, hoursSince, parseISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Derived lists used across the Today, Items and Insights screens. All pure.
// ---------------------------------------------------------------------------

/** The nearest upcoming (today or later) lesson for an instrument, if any. */
export function nextLessonFor(lessons: Lesson[], instrumentId: ID, now: Date): Lesson | undefined {
  const today = todayISODate(now);
  return lessons
    .filter((l) => l.instrumentId === instrumentId && l.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** A map of instrumentId → nearest upcoming lesson date. */
export function nextLessonDates(lessons: Lesson[], now: Date): Map<ID, ISODate> {
  const map = new Map<ID, ISODate>();
  const today = todayISODate(now);
  for (const l of lessons) {
    if (l.date < today) continue;
    const cur = map.get(l.instrumentId);
    if (!cur || l.date < cur) map.set(l.instrumentId, l.date);
  }
  return map;
}

/** Whole days from now until a calendar date (negative if past). */
export function daysUntil(dateISO: ISODate, now: Date): number {
  return dayDiff(now, parseISODate(dateISO));
}

export function lessonsForInstrument(lessons: Lesson[], instrumentId: ID): Lesson[] {
  return lessons.filter((l) => l.instrumentId === instrumentId).sort((a, b) => b.date.localeCompare(a.date));
}

/** Items flagged to complete before their instrument's next lesson. */
export function assignedForLesson(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.assignedForLesson);
}

export function isDue(item: PracticeItem, now: Date): boolean {
  const d = overdueDays(item, now);
  return d !== null && d >= 0;
}

export function dueItems(items: PracticeItem[], now: Date): PracticeItem[] {
  return items
    .filter((i) => isDue(i, now))
    .sort((a, b) => (overdueDays(b, now) ?? 0) - (overdueDays(a, now) ?? 0));
}

export function fragileItems(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.status === 'fragile' || i.status === 'repairing');
}

export function neglectedImportantItems(
  items: PracticeItem[],
  now: Date,
  minImportance = 4,
  minDays = 8,
): PracticeItem[] {
  return items
    .filter((i) => i.importance >= minImportance && daysSinceTouched(i, now) >= minDays)
    .filter((i) => i.status !== 'dormant')
    .sort((a, b) => daysSinceTouched(b, now) - daysSinceTouched(a, now));
}

export function overworkedItems(
  items: PracticeItem[],
  blocks: PracticeBlock[],
  now: Date,
): PracticeItem[] {
  const byItem = groupBlocksByItem(blocks);
  return items.filter((i) => isSaturated(byItem.get(i.id) ?? [], now));
}

export function itemsWithTeacherQuestion(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.teacherQuestion && i.teacherQuestion.trim().length > 0);
}

export function dueReviews(reviews: Review[], now: Date): Review[] {
  return reviews
    .filter((r) => !r.completedAt)
    .filter((r) => dayDiff(parseISODate(r.dueDate), now) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function blocksInWindow(
  blocks: PracticeBlock[],
  now: Date,
  days: number,
): PracticeBlock[] {
  const hours = days * 24;
  // Future-dated blocks (clock skew, edited data) must not shape history.
  return blocks.filter((b) => {
    const h = hoursSince(b.startedAt, now);
    return h >= 0 && h <= hours;
  });
}

export interface InstrumentBalanceRow {
  instrumentId: ID;
  instrumentName: string;
  minutes: number;
  blocks: number;
  percent: number;
}

/** Minutes/blocks per instrument over the last `days`, including idle ones. */
export function instrumentBalance(
  instruments: Instrument[],
  blocks: PracticeBlock[],
  now: Date,
  days = 7,
): InstrumentBalanceRow[] {
  const windowBlocks = blocksInWindow(blocks, now, days);
  const totalMinutes = windowBlocks.reduce((s, b) => s + b.durationMinutes, 0);

  const rows = instruments.map((inst) => {
    const own = windowBlocks.filter((b) => b.instrumentId === inst.id);
    const minutes = own.reduce((s, b) => s + b.durationMinutes, 0);
    return {
      instrumentId: inst.id,
      instrumentName: inst.name,
      minutes,
      blocks: own.length,
      percent: totalMinutes > 0 ? Math.round((minutes / totalMinutes) * 100) : 0,
    };
  });

  return rows.sort((a, b) => b.minutes - a.minutes);
}

export function totalMinutesInWindow(blocks: PracticeBlock[], now: Date, days: number): number {
  return blocksInWindow(blocks, now, days).reduce((s, b) => s + b.durationMinutes, 0);
}
