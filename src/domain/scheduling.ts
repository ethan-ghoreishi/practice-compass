import type {
  BlockResult,
  ISODate,
  ItemStatus,
  PracticeItem,
  ReviewType,
} from './types';
import { addDaysISODate, todayISODate } from './util';
import { daysSinceTouched } from './scoring';

// ---------------------------------------------------------------------------
// Review scheduling and gentle status suggestions.
//
// `planNextReview` is a small, explainable spaced-repetition engine. In "auto"
// mode it blends the item's mastery (status), importance, difficulty and how
// the last block went into a single interval. The user can override per item
// with a fixed cadence ("every N days") or fully manual dates.
//
// Nothing here mutates anything — these functions only *propose*.
// ---------------------------------------------------------------------------

export const DEFAULT_REVIEW_INTERVAL_DAYS = 7;

/** Base interval (days) by mastery/status — the spaced-repetition backbone. */
const STATUS_BASE_DAYS: Record<ItemStatus, number> = {
  new: 2,
  fragile: 1,
  repairing: 2,
  usable: 4,
  integrated: 10,
  performable: 21,
  maintenance: 30,
  dormant: 30,
};

/** How the latest result stretches or shrinks the interval. */
const RESULT_FACTOR: Record<BlockResult, number> = {
  worse: 0.5,
  same: 0.6,
  slightly_better: 1.0,
  stable_alone: 1.5,
  stable_in_context: 2.2,
  performable: 3.0,
  not_logged: 1.0,
};

function reviewTypeFor(item: PracticeItem, result?: BlockResult): ReviewType {
  if (result === 'performable' || item.status === 'maintenance') return 'maintenance';
  if (item.status === 'performable' || item.status === 'integrated') return 'integration';
  if (item.status === 'fragile' || item.status === 'repairing') return 'repair';
  return 'retention';
}

export interface ReviewPlan {
  intervalDays: number;
  dueDate: ISODate;
  reviewType: ReviewType;
  /** True when the result was "same" — nudge a change of approach. */
  changeStrategy: boolean;
  rationale: string;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Decide the next review date for an item, honouring its review mode.
 * Returns `null` for manual mode (the user sets the date themselves).
 */
export function planNextReview(args: {
  item: PracticeItem;
  result?: BlockResult;
  now?: Date;
}): ReviewPlan | null {
  const { item, result, now = new Date() } = args;
  const today = todayISODate(now);
  const mode = item.reviewMode ?? 'auto';

  if (mode === 'manual') return null;

  if (mode === 'interval') {
    const interval = clamp(Math.round(item.reviewIntervalDays ?? DEFAULT_REVIEW_INTERVAL_DAYS), 1, 365);
    return {
      intervalDays: interval,
      dueDate: addDaysISODate(today, interval),
      reviewType: reviewTypeFor(item, result),
      changeStrategy: result === 'same',
      rationale: `Fixed cadence: every ${interval} day${interval === 1 ? '' : 's'}.`,
    };
  }

  // auto
  const base = STATUS_BASE_DAYS[item.status];
  const resultFactor = result ? RESULT_FACTOR[result] : 1.0;
  const importanceFactor = 1 + (3 - item.importance) * 0.1; // more important → sooner
  const difficultyFactor = 1 + (3 - item.difficulty) * 0.07; // harder → sooner
  const interval = clamp(Math.round(base * resultFactor * importanceFactor * difficultyFactor), 1, 90);

  const drivers: string[] = [`it’s ${item.status}`];
  if (result && result !== 'not_logged') drivers.push(`last result “${result.replace(/_/g, ' ')}”`);
  if (item.importance >= 4) drivers.push('high importance');
  if (item.difficulty >= 4) drivers.push('high difficulty');

  return {
    intervalDays: interval,
    dueDate: addDaysISODate(today, interval),
    reviewType: reviewTypeFor(item, result),
    changeStrategy: result === 'same',
    rationale: `Auto — ${interval} day${interval === 1 ? '' : 's'} (${drivers.join(', ')}).`,
  };
}

export interface StatusSuggestion {
  suggestedStatus?: ItemStatus;
  message?: string;
}

/** Suggest (never force) a status change after a block closes. */
export function suggestStatusAfterBlock(args: {
  item: PracticeItem;
  result: BlockResult;
  last3AllSame: boolean;
}): StatusSuggestion {
  const { item, result, last3AllSame } = args;

  if (last3AllSame) {
    return { message: 'Three “same” results in a row — try a different strategy rather than changing status.' };
  }
  if (result === 'stable_alone' && (item.status === 'fragile' || item.status === 'repairing')) {
    return { suggestedStatus: 'usable', message: 'Holds together on its own — move it on to “Coming together”?' };
  }
  if (result === 'stable_in_context' && item.status === 'usable') {
    return { suggestedStatus: 'integrated', message: 'Holds up in context — move it on to “Solid”?' };
  }
  if (result === 'performable' && item.status !== 'performable') {
    return { suggestedStatus: 'performable', message: 'Ready to perform — mark it “Performance-ready”?' };
  }
  return {};
}

/** Suggest dormancy for long-untouched items (used by Insights). */
export function shouldSuggestDormant(item: PracticeItem, now: Date): boolean {
  if (item.status === 'maintenance' || item.status === 'dormant') return false;
  return daysSinceTouched(item, now) >= 30;
}
