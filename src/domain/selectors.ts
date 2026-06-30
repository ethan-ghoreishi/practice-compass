import type {
  ID,
  Instrument,
  PracticeBlock,
  PracticeItem,
  Review,
} from './types';
import { daysSinceTouched, groupBlocksByItem, isSaturated, overdueDays } from './scoring';
import { dayDiff, hoursSince, parseISODate } from './util';

// ---------------------------------------------------------------------------
// Derived lists used across the Today, Items and Insights screens. All pure.
// ---------------------------------------------------------------------------

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
  return blocks.filter((b) => hoursSince(b.startedAt, now) <= hours);
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
