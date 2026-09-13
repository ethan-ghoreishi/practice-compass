import type { BlockResult, ID, ISODate, ItemStatus, PracticeBlock, PracticeItem } from './types';
import { dayDiff, daysSince, parseISODate, toISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Deterministic priority scoring.
//
//   priority = importance*2 + difficulty + fragility + overdue
//            + neglected + lessonUrgency − exposurePenalty
//
// Every sub-score is a small pure function so each can be unit-tested in
// isolation and the breakdown can be shown to the user as a plain reason. The
// exact numbers, windows and bounds are published in
// docs/scheduling-evidence.md so a reviewer can calculate any answer by hand.
//
// Two things are deliberately NOT in this formula:
//   • a teacher question. A question is something to ASK, not evidence that
//     the item needs practice; it used to add three points and quietly
//     reorder the day around a note to self.
//   • a permanent count-based saturation penalty. Over-practice is measured as
//     bounded, DECAYING recent minutes instead, so an item drilled hard in
//     January is not still excluded in September.
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

// --- Recent exposure ---------------------------------------------------------
//
// "How much have I actually played this lately?" — measured in MINUTES over
// local calendar days, decaying to nothing across a bounded window.
//
// Minutes, not block counts: one 30-minute session and three 10-minute ones
// are the same amount of practice, and counting blocks made the longer session
// look like LESS exposure than the shorter ones. Local calendar days, not
// hours: an hours-based window slides with the clock, so a block from late
// last night counts differently depending on what time you open the app, and
// it misreads a DST day. Every block counts equally — a routine-bound block is
// real practice, and an unlogged one still used up the time.

/** Days of history that can contribute exposure at all. */
export const EXPOSURE_WINDOW_DAYS = 7;
/** Decayed minutes per penalty point. */
export const EXPOSURE_MINUTES_PER_POINT = 10;
/**
 * The most priority exposure can ever take away — deliberately EQUAL to the
 * largest boost a class deadline can give (`lessonUrgencyScore`'s 8). Sustained
 * heavy practice can therefore fully offset a deadline, so maintenance work
 * stays reachable behind a repeatedly drilled committed item, and can never do
 * MORE than offset it, so genuinely urgent work is never buried by having been
 * practised. Both ends bounded, on purpose.
 */
export const EXPOSURE_PENALTY_MAX = 8;
/** Decayed minutes at which an item is flagged as heavily practised lately. */
export const SATURATION_EXPOSURE_MINUTES = 60;

/** Linear decay: today counts fully, the oldest day in the window a seventh. */
export function exposureWeight(daysAgo: number, windowDays = EXPOSURE_WINDOW_DAYS): number {
  if (daysAgo < 0 || daysAgo >= windowDays) return 0;
  return (windowDays - daysAgo) / windowDays;
}

/**
 * Decayed minutes of practice on this item within the window. Future-dated
 * blocks (clock skew, hand-edited data) contribute nothing to PAST exposure,
 * and negative or unreadable durations count as zero rather than as credit.
 */
export function recentExposureMinutes(
  itemBlocks: PracticeBlock[],
  now: Date,
  windowDays = EXPOSURE_WINDOW_DAYS,
): number {
  const today = todayISODate(now);
  let sum = 0;
  for (const b of itemBlocks) {
    const day = toISODate(new Date(b.startedAt));
    if (!day || day > today) continue;
    const age = dayDiff(parseISODate(day), now);
    const w = exposureWeight(age, windowDays);
    if (w <= 0) continue;
    const minutes = Number.isFinite(b.durationMinutes) ? Math.max(0, Math.round(b.durationMinutes)) : 0;
    sum += minutes * w;
  }
  return sum;
}

/** Whole priority points recent exposure takes away — bounded, never fatal. */
export function exposurePenalty(itemBlocks: PracticeBlock[], now: Date): number {
  const minutes = recentExposureMinutes(itemBlocks, now);
  return Math.min(EXPOSURE_PENALTY_MAX, Math.floor(minutes / EXPOSURE_MINUTES_PER_POINT));
}

/** The item's most recent logged results, newest first (ignores `not_logged`). */
export function recentResults(itemBlocks: PracticeBlock[], n = 3): BlockResult[] {
  return [...itemBlocks]
    .filter((b) => b.result !== 'not_logged')
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, n)
    .map((b) => b.result);
}

/**
 * True when the last `n` logged results are all "same". A STRATEGY HINT only —
 * "try something different rather than more repetitions". It is deliberately
 * no longer an eligibility signal: three identical results in January must not
 * still be hiding the item from the planner in September.
 */
export function lastResultsAllSame(itemBlocks: PracticeBlock[], n = 3): boolean {
  const results = recentResults(itemBlocks, n);
  return results.length >= n && results.every((r) => r === 'same');
}

/** Heavily practised lately — a calm display warning, never an exclusion. */
export function isSaturated(itemBlocks: PracticeBlock[], now: Date): boolean {
  return recentExposureMinutes(itemBlocks, now) >= SATURATION_EXPOSURE_MINUTES;
}

/**
 * The ONE eligibility policy every automatic pool shares: Today's
 * recommendations, the initial plan, regeneration, swaps and every fallback.
 *
 * Resting ("dormant") material is work the owner has deliberately put down. It
 * stays fully practisable by choosing it directly, and its existing review
 * data is never erased — a simple status change brings it back. What it must
 * not do is keep surfacing in suggestions, including through a fallback that
 * quietly widens to "everything" when the honest answer is an empty pool.
 */
export function isProactiveCandidate(item: PracticeItem): boolean {
  return item.status !== 'dormant';
}

export interface ScoreParts {
  importance: number;
  difficulty: number;
  fragility: number;
  overdue: number;
  neglected: number;
  exposurePenalty: number;
  lesson: number;
}

export interface ItemScore {
  item: PracticeItem;
  total: number;
  parts: ScoreParts;
  /** Heavily practised in the last week — shown, never used to exclude. */
  saturated: boolean;
  /** Decayed minutes behind `parts.exposurePenalty`, for honest reasons. */
  exposureMinutes: number;
  overdueDays: number | null;
  daysSincePractised: number | null;
  /** Days until the class this item is actually committed to; null otherwise. */
  daysToLesson: number | null;
  /** The date of that class, so a reason can name it. */
  lessonDate: ISODate | null;
}

/**
 * Priority boost for an item committed to a SPECIFIC class, climbing as that
 * class approaches. The date comes from the commitment's own lesson — never
 * from "the next class, whenever that is", which is how a rolling flag used to
 * let a commitment made for March inherit January's deadline for ever.
 *
 * A past or unassigned commitment scores zero: its deadline has gone, or it
 * never named one.
 */
export function lessonUrgencyScore(preparationDate: ISODate | undefined, now: Date): number {
  if (!preparationDate) return 0;
  const d = dayDiff(now, parseISODate(preparationDate));
  if (d < 0) return 0; // the class has passed
  if (d === 0) return 8; // today
  if (d <= 2) return 7;
  if (d <= 5) return 6;
  if (d <= 10) return 5;
  if (d <= 20) return 4;
  return 3;
}

export function scoreItem(
  item: PracticeItem,
  itemBlocks: PracticeBlock[],
  now: Date,
  preparationDate?: ISODate,
): ItemScore {
  const exposureMinutes = recentExposureMinutes(itemBlocks, now);
  const parts: ScoreParts = {
    importance: item.importance * 2,
    difficulty: item.difficulty,
    fragility: fragilityScore(item.status),
    overdue: overdueScore(item, now),
    neglected: neglectedScore(item, now),
    exposurePenalty: Math.min(EXPOSURE_PENALTY_MAX, Math.floor(exposureMinutes / EXPOSURE_MINUTES_PER_POINT)),
    lesson: lessonUrgencyScore(preparationDate, now),
  };

  const total =
    parts.importance +
    parts.difficulty +
    parts.fragility +
    parts.overdue +
    parts.neglected +
    parts.lesson -
    parts.exposurePenalty;

  const daysToLesson = preparationDate ? dayDiff(now, parseISODate(preparationDate)) : null;

  return {
    item,
    total,
    parts,
    saturated: exposureMinutes >= SATURATION_EXPOSURE_MINUTES,
    exposureMinutes,
    overdueDays: overdueDays(item, now),
    daysSincePractised: daysSince(item.lastPractisedAt, now) ?? null,
    daysToLesson: daysToLesson !== null && daysToLesson >= 0 ? daysToLesson : null,
    lessonDate: daysToLesson !== null && daysToLesson >= 0 ? preparationDate! : null,
  };
}

/**
 * Score a list of items. `preparationDates` maps an ITEM id to the date of the
 * class it is committed to (`preparationDatesByItem` in lessonAgenda.ts).
 *
 * Ties break on the item's own id, not on array order: two items with the same
 * total must rank the same way whatever order storage happened to hand them
 * over, or a plan silently depends on how a database was written.
 */
export function scoreItems(
  items: PracticeItem[],
  blocksByItem: Map<string, PracticeBlock[]>,
  now: Date,
  preparationDates?: Map<ID, ISODate>,
): ItemScore[] {
  return items
    .map((item) => scoreItem(item, blocksByItem.get(item.id) ?? [], now, preparationDates?.get(item.id)))
    .sort((a, b) => b.total - a.total || a.item.id.localeCompare(b.item.id));
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
