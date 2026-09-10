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
import { addDaysISODate, dayDiff, hoursSince, parseISODate, toISODate, todayISODate } from './util';

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

/** Suggested next class number for an instrument: max existing + 1, or 1. */
export function nextLessonNumber(lessons: Lesson[], instrumentId: ID): number {
  const max = lessons
    .filter((l) => l.instrumentId === instrumentId && typeof l.number === 'number')
    .reduce((m, l) => Math.max(m, l.number as number), 0);
  return max + 1;
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
  // The denominator must cover exactly the instruments that get a row.
  // Callers legitimately pass only the ACTIVE instruments alongside ALL
  // blocks (Today does), and taking the total from every block then meant a
  // retired instrument's practice sat in the denominator with no row of its
  // own — so the percentages summed to less than 100.
  const shown = new Set(instruments.map((i) => i.id));
  const windowBlocks = blocksInWindow(blocks, now, days).filter((b) => shown.has(b.instrumentId));
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

// --- Honest practice totals --------------------------------------------------
//
// CALENDAR figures, not rolling windows. `blocksInWindow` above filters on
// HOURS, so days:1 means "the last 24 hours" and days:7 means "the last 168" —
// which is exactly the wrong answer to "how much have I practised today?": a
// block from late last night is not today's practice. These helpers are
// therefore separate rather than a reuse of that one.
//
// A block belongs WHOLE to the local calendar day it BEGAN, with none of its
// minutes apportioned into the following day. Two facts in the model settle
// that rather than convenience: `durationMinutes` is the figure the owner
// attested to at close and deliberately diverges from wall clock (an abandoned
// block proposes its target), so `endedAt - startedAt` is not the authored
// duration; and `endedAt` is optional and absent on routine blocks, so
// apportioning would quietly apply to some blocks and not others. The same
// rule decides the week boundary: a session begun Sunday 23:30 belongs to the
// week that is ending.

export interface PracticeTotal {
  minutes: number;
  blocks: number;
}

/** Monday 00:00 local — ISO-8601 and UK convention — as a calendar date. */
export function startOfWeekISODate(now: Date): ISODate {
  const mondayFirst = (now.getDay() + 6) % 7; // Sunday (0) → 6, Monday (1) → 0
  return addDaysISODate(todayISODate(now), -mondayFirst);
}

/** The local calendar day a block belongs to. */
function blockDay(b: PracticeBlock): ISODate {
  return toISODate(new Date(b.startedAt));
}

function total(blocks: PracticeBlock[]): PracticeTotal {
  return {
    minutes: blocks.reduce((s, b) => s + Math.max(0, Math.round(b.durationMinutes)), 0),
    blocks: blocks.length,
  };
}

export interface PracticeTotals {
  today: PracticeTotal;
  week: PracticeTotal;
  allTime: PracticeTotal;
}

/** Minutes and block counts for today, this week (from Monday) and all time. */
export function practiceTotals(blocks: PracticeBlock[], now: Date): PracticeTotals {
  const today = todayISODate(now);
  const weekStart = startOfWeekISODate(now);
  const days = blocks.map((b) => ({ b, day: blockDay(b) }));
  return {
    today: total(days.filter((d) => d.day === today).map((d) => d.b)),
    week: total(days.filter((d) => d.day >= weekStart && d.day <= today).map((d) => d.b)),
    allTime: total(blocks),
  };
}

export interface InstrumentTotalsRow extends PracticeTotals {
  instrumentId: ID;
  instrumentName: string;
}

/** The same calendar figures per instrument, for the full Insights view. */
export function practiceTotalsByInstrument(
  instruments: Instrument[],
  blocks: PracticeBlock[],
  now: Date,
): InstrumentTotalsRow[] {
  return instruments
    .map((inst) => ({
      instrumentId: inst.id,
      instrumentName: inst.name,
      ...practiceTotals(
        blocks.filter((b) => b.instrumentId === inst.id),
        now,
      ),
    }))
    .sort((a, b) => b.allTime.minutes - a.allTime.minutes);
}
