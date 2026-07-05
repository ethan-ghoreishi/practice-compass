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
// Review scheduling — a spaced-repetition engine (SM-2, the algorithm behind
// SuperMemo / Anki) adapted to music practice.
//
// The idea (retrieval practice + expanding intervals) is well-supported for
// long-term retention: each time a piece / gushe holds up, the gap before you
// revisit it grows; when it slips, the gap resets so you relearn it. Per item
// the app tracks reps, an ease factor and the current interval. Importance and
// difficulty gently pull important/hard material sooner.
//
// The user can override per item: Auto (this engine), Every-N-days, or Manual.
// Nothing here mutates state — it only proposes.
// ---------------------------------------------------------------------------

export const DEFAULT_REVIEW_INTERVAL_DAYS = 7;
export const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const FIRST_INTERVAL = 2; // days after the 1st good review
const SECOND_INTERVAL = 6; // days after the 2nd

/** Map a block result to an SM-2 quality grade (0–5). */
const QUALITY: Record<BlockResult, number> = {
  worse: 1,
  same: 2,
  slightly_better: 3,
  stable_alone: 4,
  stable_in_context: 5,
  performable: 5,
  not_logged: -1,
};

function reviewTypeFor(item: PracticeItem, result?: BlockResult): ReviewType {
  if (result === 'performable' || item.status === 'maintenance') return 'maintenance';
  if (item.status === 'performable' || item.status === 'integrated') return 'integration';
  if (item.status === 'fragile' || item.status === 'repairing') return 'repair';
  return 'retention';
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Important & difficult material is pulled a little sooner. */
function urgencyFactor(item: PracticeItem): number {
  const importance = 1 + (3 - item.importance) * 0.08; // imp5 → 0.84, imp1 → 1.16
  const difficulty = 1 + (3 - item.difficulty) * 0.05; // diff5 → 0.90, diff1 → 1.10
  return importance * difficulty;
}

export interface ReviewComputation {
  intervalDays: number;
  dueDate: ISODate;
  reviewType: ReviewType;
  changeStrategy: boolean;
  rationale: string;
  // New spaced-repetition state to persist on the item:
  srReps: number;
  srEase: number;
  srIntervalDays: number;
}

/**
 * Compute the next review + updated SR state for an item after a block.
 * Returns `null` for manual mode / unlogged results (nothing to schedule).
 */
export function computeReview(
  item: PracticeItem,
  result: BlockResult | undefined,
  now: Date = new Date(),
): ReviewComputation | null {
  const mode = item.reviewMode ?? 'auto';
  if (mode === 'manual') return null;
  if (result === 'not_logged') return null;

  const today = todayISODate(now);
  const reps0 = item.srReps ?? 0;
  const ease0 = item.srEase ?? DEFAULT_EASE;
  const base0 = item.srIntervalDays ?? 0;

  if (mode === 'interval') {
    const interval = clamp(Math.round(item.reviewIntervalDays ?? DEFAULT_REVIEW_INTERVAL_DAYS), 1, 365);
    return {
      intervalDays: interval,
      dueDate: addDaysISODate(today, interval),
      reviewType: reviewTypeFor(item, result),
      changeStrategy: result === 'same',
      rationale: `Fixed cadence: every ${interval} day${interval === 1 ? '' : 's'}.`,
      srReps: reps0,
      srEase: ease0,
      srIntervalDays: interval,
    };
  }

  // --- auto: SM-2 -----------------------------------------------------------
  const q = result ? QUALITY[result] : 3;
  let reps: number;
  let ease = ease0;
  let base: number; // the SM-2 interval before urgency modifiers

  if (q < 3) {
    // Slipped — reset and relearn tomorrow.
    reps = 0;
    base = 1;
  } else {
    reps = reps0 + 1;
    if (reps === 1) base = FIRST_INTERVAL;
    else if (reps === 2) base = SECOND_INTERVAL;
    else base = Math.round(base0 * ease0);
    ease = Math.max(MIN_EASE, ease0 + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  base = clamp(base, 1, 365);

  const mod = urgencyFactor(item);
  const intervalDays = clamp(Math.round(base * mod), 1, 365);

  let rationale: string;
  if (q < 3) {
    rationale = 'Spaced repetition: it slipped — back tomorrow to relearn.';
  } else {
    const sooner = mod < 0.95 ? ' — a little sooner (important / hard)' : '';
    rationale = `Spaced repetition: ${reps} good review${reps === 1 ? '' : 's'} → ${intervalDays} day${intervalDays === 1 ? '' : 's'}${sooner}.`;
  }

  return {
    intervalDays,
    dueDate: addDaysISODate(today, intervalDays),
    reviewType: reviewTypeFor(item, result),
    changeStrategy: result === 'same',
    rationale,
    srReps: reps,
    srEase: Math.round(ease * 100) / 100,
    srIntervalDays: base,
  };
}

export interface ReviewPlan {
  intervalDays: number;
  dueDate: ISODate;
  reviewType: ReviewType;
  changeStrategy: boolean;
  rationale: string;
}

/** Preview-only wrapper (no SR-state fields) for the close-block screen. */
export function planNextReview(args: {
  item: PracticeItem;
  result?: BlockResult;
  now?: Date;
}): ReviewPlan | null {
  const c = computeReview(args.item, args.result, args.now);
  if (!c) return null;
  const { intervalDays, dueDate, reviewType, changeStrategy, rationale } = c;
  return { intervalDays, dueDate, reviewType, changeStrategy, rationale };
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
