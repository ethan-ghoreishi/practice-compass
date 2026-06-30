import type { BlockResult, ItemStatus, PracticeBlock, PracticeItem } from './types';
import { dayDiff, daysSince, hoursSince, parseISODate } from './util';

// ---------------------------------------------------------------------------
// Deterministic priority scoring.
//
//   priority = importance*2 + difficulty + fragility + overdue
//            + teacherRelevance + neglected − saturationPenalty
//
// Every sub-score is a small pure function so each can be unit-tested in
// isolation and the breakdown can be shown to the user as a plain reason.
// ---------------------------------------------------------------------------

const FRAGILITY_BY_STATUS: Record<ItemStatus, number> = {
  new: 2,
  fragile: 5,
  repairing: 5,
  usable: 3,
  integrated: 1,
  performable: 0,
  maintenance: 1,
  dormant: 2,
};

export function fragilityScore(status: ItemStatus): number {
  return FRAGILITY_BY_STATUS[status];
}

/**
 * Whole days a review is overdue: `today − nextReviewDate`.
 * Negative when the review is still in the future; `null` when unscheduled.
 */
export function overdueDays(item: PracticeItem, now: Date): number | null {
  if (!item.nextReviewDate) return null;
  return dayDiff(parseISODate(item.nextReviewDate), now);
}

export function overdueScore(item: PracticeItem, now: Date): number {
  const d = overdueDays(item, now);
  if (d === null || d < 0) return 0;
  if (d === 0) return 1; // due today
  if (d <= 2) return 2;
  if (d <= 6) return 3;
  if (d <= 13) return 4;
  return 5; // 14+ days overdue
}

export function teacherRelevanceScore(item: PracticeItem): number {
  return item.teacherQuestion && item.teacherQuestion.trim() ? 3 : 0;
}

/**
 * Days since the item was last touched. Falls back to `createdAt` so a brand
 * new, never-practised item still ages into the "neglected" bands rather than
 * looking permanently fresh.
 */
export function daysSinceTouched(item: PracticeItem, now: Date): number {
  return daysSince(item.lastPractisedAt ?? item.createdAt, now) ?? 0;
}

export function neglectedScore(item: PracticeItem, now: Date): number {
  const d = daysSinceTouched(item, now);
  if (d <= 3) return 0;
  if (d <= 7) return 1;
  if (d <= 14) return 2;
  if (d <= 30) return 3;
  return 4; // 31+ days
}

/** Blocks for one item that started within the last `hours`. */
export function recentBlockCount(
  itemBlocks: PracticeBlock[],
  now: Date,
  hours = 48,
): number {
  return itemBlocks.filter((b) => hoursSince(b.startedAt, now) <= hours).length;
}

/** The item's most recent logged results, newest first (ignores `not_logged`). */
export function recentResults(itemBlocks: PracticeBlock[], n = 3): BlockResult[] {
  return [...itemBlocks]
    .filter((b) => b.result !== 'not_logged')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, n)
    .map((b) => b.result);
}

/** True when the last `n` logged results are all "same". */
export function lastResultsAllSame(itemBlocks: PracticeBlock[], n = 3): boolean {
  const results = recentResults(itemBlocks, n);
  return results.length >= n && results.every((r) => r === 'same');
}

/** True when an item is over-drilled (too frequent, or stuck on "same"). */
export function isSaturated(itemBlocks: PracticeBlock[], now: Date): boolean {
  return recentBlockCount(itemBlocks, now) >= 3 || lastResultsAllSame(itemBlocks);
}

export function saturationPenalty(itemBlocks: PracticeBlock[], now: Date): number {
  return isSaturated(itemBlocks, now) ? 3 : 0;
}

export interface ScoreParts {
  importance: number;
  difficulty: number;
  fragility: number;
  overdue: number;
  teacher: number;
  neglected: number;
  saturationPenalty: number;
}

export interface ItemScore {
  item: PracticeItem;
  total: number;
  parts: ScoreParts;
  saturated: boolean;
  overdueDays: number | null;
  daysSincePractised: number | null;
}

export function scoreItem(
  item: PracticeItem,
  itemBlocks: PracticeBlock[],
  now: Date,
): ItemScore {
  const parts: ScoreParts = {
    importance: item.importance * 2,
    difficulty: item.difficulty,
    fragility: fragilityScore(item.status),
    overdue: overdueScore(item, now),
    teacher: teacherRelevanceScore(item),
    neglected: neglectedScore(item, now),
    saturationPenalty: saturationPenalty(itemBlocks, now),
  };

  const total =
    parts.importance +
    parts.difficulty +
    parts.fragility +
    parts.overdue +
    parts.teacher +
    parts.neglected -
    parts.saturationPenalty;

  return {
    item,
    total,
    parts,
    saturated: isSaturated(itemBlocks, now),
    overdueDays: overdueDays(item, now),
    daysSincePractised: daysSince(item.lastPractisedAt, now) ?? null,
  };
}

/** Convenience: score a list of items given a lookup of blocks per item. */
export function scoreItems(
  items: PracticeItem[],
  blocksByItem: Map<string, PracticeBlock[]>,
  now: Date,
): ItemScore[] {
  return items
    .map((item) => scoreItem(item, blocksByItem.get(item.id) ?? [], now))
    .sort((a, b) => b.total - a.total);
}

export function groupBlocksByItem(blocks: PracticeBlock[]): Map<string, PracticeBlock[]> {
  const map = new Map<string, PracticeBlock[]>();
  for (const b of blocks) {
    const list = map.get(b.practiceItemId);
    if (list) list.push(b);
    else map.set(b.practiceItemId, [b]);
  }
  return map;
}
