import type {
  BlockResult,
  ISODate,
  ItemStatus,
  PracticeItem,
  ReviewType,
  SchedulingParams,
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

// --- Adjustable scheduling knobs --------------------------------------------
//
// These are the *defaults*: the exact intervals the engine has always used
// (first=2, second=6, slip-reset=1). Passing no `params` reproduces the old
// behaviour byte-for-byte — the tests assert this. A user can widen or tighten
// them in Settings; nothing is required and every value is clamped to sane
// bounds (`clampSchedulingParams`) rather than trusted blindly.

export const DEFAULT_SCHEDULING_PARAMS: SchedulingParams = {
  sm2FirstIntervalDays: 2,
  sm2SecondIntervalDays: 6,
  sm2SlipResetDays: 1,
  warmupShare: 0.12,
  deepWorkShare: 0.33,
  reviewSlotMinMinutes: 3,
  reviewSlotMaxMinutes: 7,
};

/** Inclusive bounds for each param, kept next to the defaults they guard. */
export const SCHEDULING_BOUNDS: Record<keyof SchedulingParams, [number, number]> = {
  sm2FirstIntervalDays: [1, 4],
  sm2SecondIntervalDays: [3, 10],
  sm2SlipResetDays: [1, 3],
  warmupShare: [0.1, 0.15],
  deepWorkShare: [0.25, 0.4],
  reviewSlotMinMinutes: [2, 5],
  reviewSlotMaxMinutes: [5, 12],
};

/**
 * Coerce a partial/untrusted params object into a full, in-bounds
 * SchedulingParams. Missing fields fall back to the default; out-of-range or
 * non-finite values are clamped. Integer fields are rounded; shares are not.
 */
export function clampSchedulingParams(partial?: Partial<SchedulingParams>): SchedulingParams {
  const out = { ...DEFAULT_SCHEDULING_PARAMS };
  for (const key of Object.keys(DEFAULT_SCHEDULING_PARAMS) as (keyof SchedulingParams)[]) {
    const raw = partial?.[key];
    const [lo, hi] = SCHEDULING_BOUNDS[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      const isShare = key === 'warmupShare' || key === 'deepWorkShare';
      out[key] = clamp(isShare ? raw : Math.round(raw), lo, hi);
    }
  }
  // Keep the review slot window coherent even after independent clamping.
  if (out.reviewSlotMaxMinutes < out.reviewSlotMinMinutes) {
    out.reviewSlotMaxMinutes = out.reviewSlotMinMinutes;
  }
  return out;
}

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
  params: SchedulingParams = DEFAULT_SCHEDULING_PARAMS,
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
    // Slipped — reset and relearn after the slip-reset gap.
    reps = 0;
    base = params.sm2SlipResetDays;
  } else {
    reps = reps0 + 1;
    if (reps === 1) base = params.sm2FirstIntervalDays;
    else if (reps === 2) base = params.sm2SecondIntervalDays;
    else base = Math.round(base0 * ease0);
    ease = Math.max(MIN_EASE, ease0 + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  }
  base = clamp(base, 1, 365);

  const mod = urgencyFactor(item);
  const intervalDays = clamp(Math.round(base * mod), 1, 365);

  let rationale: string;
  if (q < 3) {
    const when =
      params.sm2SlipResetDays === 1 ? 'back tomorrow' : `back in ${params.sm2SlipResetDays} days`;
    rationale = `Spaced repetition: it slipped — ${when} to relearn.`;
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
  params?: SchedulingParams;
}): ReviewPlan | null {
  const c = computeReview(args.item, args.result, args.now, args.params);
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

// --- Review actions that are NOT practice ------------------------------------
//
// Practising (closing a block) is the only thing that *completes* a review and
// advances SM-2. The other actions have deliberately small, honest semantics:
//   • snooze  — "not now": push the due date N days from today. No SM-2 change,
//               no pretend result. The overdue nag disappears because the date
//               genuinely moved.
//   • (there is no "mark done without practising" — that would fabricate data.)

export const SNOOZE_DAYS_DEFAULT = 2;

export interface SnoozePlan {
  dueDate: ISODate;
}

/** New due date when snoozing a review: N days from today (not from the old,
 *  possibly long-past due date). */
export function snoozePlan(days: number, now: Date = new Date()): SnoozePlan {
  const d = Math.max(1, Math.round(days));
  return { dueDate: addDaysISODate(todayISODate(now), d) };
}
