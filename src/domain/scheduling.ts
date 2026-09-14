import type {
  BlockResult,
  ID,
  ISODate,
  ItemStatus,
  PracticeItem,
  PracticeDB,
  Review,
  ReviewDateSource,
  ReviewMode,
  ReviewType,
  SchedulingParams,
} from './types';
import { addDaysISODate, dayDiff, nowISO, parseISODate, todayISODate } from './util';
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

/**
 * SM-2 quality grade for the results that are genuinely POSITIVE evidence.
 * Only these three are retention evidence at all; `same` and
 * `slightly_better` are deliberately absent, and `worse` is handled on its own
 * negative path. Reading `same` as a slip — which this engine used to do, via
 * a quality of 2 that fell into the reset branch — was the single change the
 * owner overruled: no improvement is not failed recall.
 */
const STABLE_QUALITY: Partial<Record<BlockResult, number>> = {
  stable_alone: 4,
  stable_in_context: 5,
  performable: 5,
};

/** The three results that can be eligible retention evidence. */
export const STABLE_RESULTS: BlockResult[] = ['stable_alone', 'stable_in_context', 'performable'];

export function isStableResult(result: BlockResult | undefined): boolean {
  return !!result && STABLE_RESULTS.includes(result);
}

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

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

// --- The one review decision ------------------------------------------------
//
// PRACTICE IS EXPOSURE; ONLY ELIGIBLE RETENTION EVIDENCE ADVANCES SPACING.
//
// Three questions this answers together, because they are one decision:
//   • does the item's next-review DATE move, and to what?
//   • does its SPACING state (reps / ease / interval) move?
//   • what honest sentence explains the answer?
//
// Everything the close screen renders and everything the store persists is a
// rendering of THIS object. A second derivation anywhere is how "the date
// shown" and "the date saved" used to come apart.

/** Whether this decision writes a date at all. */
export type ReviewDateDisposition = 'keep' | 'set';

export interface ReviewDecision {
  /** 'keep' leaves the item's existing schedule and pending row exactly as they are. */
  disposition: ReviewDateDisposition;
  /** The date to WRITE — present only when `disposition === 'set'`. */
  dueDate?: ISODate;
  /** The date that will actually stand afterwards (the existing one when kept). */
  effectiveDate?: ISODate;
  /** Whole days from today to `effectiveDate`; 0 when there is no date. */
  intervalDays: number;
  /** Provenance to persist with a written date. */
  source: ReviewDateSource;
  reviewType: ReviewType;
  changeStrategy: boolean;
  rationale: string;
  /** SM-2 state to persist. Omitted entirely when spacing did not move. */
  sr?: { srReps: number; srEase: number; srIntervalDays: number; srLastProgressDay?: ISODate };
  /** True only when this close was eligible evidence that EXPANDED spacing. */
  advanced: boolean;
}

/**
 * Is this item's pending date one the engine may move early? A date is
 * PROTECTED when the owner chose it (`nextReviewSource === 'user'` — typed,
 * snoozed, or re-armed), when its provenance predates this field and is
 * therefore unknown, or when the item is on a fixed cadence. Only a date this
 * engine itself proposed is its own to bring forward.
 *
 * Protection is about a FUTURE date only. Once a date is due, it is the
 * review — and the engine takes over again, whoever chose it.
 */
export function isProtectedPendingDate(item: PracticeItem, now: Date): boolean {
  const existing = item.nextReviewDate;
  if (!existing || existing <= todayISODate(now)) return false;
  const mode = item.reviewMode ?? 'auto';
  if (mode !== 'auto') return true;
  return item.nextReviewSource !== 'auto';
}

/**
 * The whole scheduling decision behind one closed block. Pure; `now` explicit.
 *
 * The permitted and forbidden cases, in the order they are decided:
 *
 *  1. No logged result (`not_logged`, or none at all) — nothing about the
 *     schedule was judged, so nothing moves. Routine runs land here: a routine
 *     records time, never a retention judgement.
 *  2. Manual mode — the owner owns the dates. An empty automatic proposal is
 *     not an implicit "no": the existing schedule stands.
 *  3. A PROTECTED future date — kept exactly, including under `worse`.
 *  4. An AUTOMATIC future date — kept for every positive or neutral result
 *     (extra practice is not a review), and brought forward by `worse` alone,
 *     to the EARLIER of the existing date and the repair proposal. Never
 *     postponed, so repeated negative closes cannot slide tomorrow's repair
 *     into next week.
 *  5. Due, or never scheduled — the review is actually happening:
 *       • fixed cadence uses its configured interval, SM-2 untouched;
 *       • `worse` resets spacing and schedules the relearn gap;
 *       • a stable result advances spacing — but at most ONCE per item per
 *         local calendar day, enforced by `srLastProgressDay`, so clearing and
 *         re-arming the date, a reload, a sync or simply closing twice cannot
 *         buy a second expansion;
 *       • `same` / `slightly_better` REPEAT the current gap without touching
 *         repetitions or ease, and are never described as a slip.
 */
export function decideReview(args: {
  item: PracticeItem;
  result: BlockResult | undefined;
  now: Date;
  params?: SchedulingParams;
}): ReviewDecision {
  const { item, result, now } = args;
  const params = args.params ?? DEFAULT_SCHEDULING_PARAMS;
  const today = todayISODate(now);
  const existing = item.nextReviewDate;
  const mode = item.reviewMode ?? 'auto';
  const reviewType = reviewTypeFor(item, result);
  const changeStrategy = result === 'same';
  const mod = urgencyFactor(item);

  const keep = (rationale: string): ReviewDecision => ({
    disposition: 'keep',
    effectiveDate: existing,
    intervalDays: existing ? Math.max(0, dayDiff(now, parseISODate(existing))) : 0,
    source: item.nextReviewSource ?? 'auto',
    reviewType,
    changeStrategy,
    rationale,
    advanced: false,
  });

  const set = (
    dueDate: ISODate,
    rationale: string,
    extra: Partial<Pick<ReviewDecision, 'sr' | 'advanced'>> = {},
  ): ReviewDecision => ({
    disposition: 'set',
    dueDate,
    effectiveDate: dueDate,
    intervalDays: Math.max(0, dayDiff(now, parseISODate(dueDate))),
    source: 'auto',
    reviewType,
    changeStrategy,
    rationale,
    advanced: false,
    ...extra,
  });

  // 1. No judgement was recorded.
  if (!result || result === 'not_logged') {
    return keep('No result was recorded, so the review schedule is unchanged.');
  }

  // 2. The owner sets this item's dates by hand.
  if (mode === 'manual') {
    return keep('You choose this item’s dates — the existing one stands.');
  }

  const reps0 = item.srReps ?? 0;
  const ease0 = item.srEase ?? DEFAULT_EASE;
  const base0 = item.srIntervalDays ?? 0;

  // 3 & 4. A date still in the future: this close is extra practice, not the
  // review it was scheduled for.
  if (existing && existing > today) {
    if (result !== 'worse' || isProtectedPendingDate(item, now)) {
      return keep(
        isProtectedPendingDate(item, now)
          ? 'Your own date for this item stands — extra practice doesn’t move it.'
          : 'Not due yet — today counts as extra practice and the date stands.',
      );
    }
    // Only genuinely negative evidence may bring an automatic date forward.
    const repairBase = clamp(params.sm2SlipResetDays, 1, 365);
    const repairDays = clamp(Math.round(repairBase * mod), 1, 365);
    const proposal = addDaysISODate(today, repairDays);
    const dueDate = proposal < existing ? proposal : existing;
    const actualDays = Math.max(0, dayDiff(now, parseISODate(dueDate)));
    return set(
      dueDate,
      `Spaced repetition: it slipped — back in ${plural(actualDays, 'day')} to relearn.`,
      { sr: { srReps: 0, srEase: ease0, srIntervalDays: repairBase } },
    );
  }

  // 5. Due, or never scheduled — the review is happening now.
  if (mode === 'interval') {
    const interval = clamp(Math.round(item.reviewIntervalDays ?? DEFAULT_REVIEW_INTERVAL_DAYS), 1, 365);
    // A fixed cadence is the owner's own rhythm: it uses its configured gap and
    // leaves SM-2 state alone, so switching back to Auto inherits nothing.
    return set(addDaysISODate(today, interval), `Fixed cadence: every ${plural(interval, 'day')}.`);
  }

  if (result === 'worse') {
    const repairBase = clamp(params.sm2SlipResetDays, 1, 365);
    const days = clamp(Math.round(repairBase * mod), 1, 365);
    return set(
      addDaysISODate(today, days),
      `Spaced repetition: it slipped — back in ${plural(days, 'day')} to relearn.`,
      { sr: { srReps: 0, srEase: ease0, srIntervalDays: repairBase } },
    );
  }

  if (isStableResult(result)) {
    // ONE spacing advance per item per local calendar day. This marker is
    // administrative eligibility, never a measured retention score.
    if (item.srLastProgressDay === today) {
      return keep(
        existing
          ? 'Spacing already moved today — this session is recorded and the date stands.'
          : 'Spacing already moved today — this session is recorded, with no new date.',
      );
    }
    const q = STABLE_QUALITY[result] ?? 4;
    const reps = reps0 + 1;
    const base = clamp(
      reps === 1
        ? params.sm2FirstIntervalDays
        : reps === 2
          ? params.sm2SecondIntervalDays
          : Math.round(base0 * ease0) || params.sm2SecondIntervalDays,
      1,
      365,
    );
    const ease = Math.max(MIN_EASE, ease0 + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    const intervalDays = clamp(Math.round(base * mod), 1, 365);
    const sooner = mod < 0.95 ? ' — a little sooner (important / hard)' : '';
    return set(
      addDaysISODate(today, intervalDays),
      `Spaced repetition: ${plural(reps, 'good review')} → ${plural(intervalDays, 'day')}${sooner}.`,
      {
        advanced: true,
        sr: {
          srReps: reps,
          srEase: Math.round(ease * 100) / 100,
          srIntervalDays: base,
          srLastProgressDay: today,
        },
      },
    );
  }

  // `same` / `slightly_better` at a due review: hold the current gap. Not a
  // slip, not progress — repetitions and ease are untouched.
  const base = clamp(base0 > 0 ? base0 : params.sm2FirstIntervalDays, 1, 365);
  const intervalDays = clamp(Math.round(base * mod), 1, 365);
  return set(
    addDaysISODate(today, intervalDays),
    `Spaced repetition: holding steady — the same ${plural(intervalDays, 'day')} gap again.`,
    { sr: { srReps: reps0, srEase: ease0, srIntervalDays: base } },
  );
}

export interface ReviewPlan {
  intervalDays: number;
  dueDate: ISODate;
  reviewType: ReviewType;
  changeStrategy: boolean;
  rationale: string;
}

/**
 * Preview-only wrapper for the close screen: the date that will actually stand
 * after this close, whether the decision writes it or leaves it in place.
 * Returns `null` only when there is genuinely no date at all — nothing to show
 * and nothing to save.
 */
export function planNextReview(args: {
  item: PracticeItem;
  result?: BlockResult;
  now?: Date;
  params?: SchedulingParams;
}): ReviewPlan | null {
  const d = decideReview({
    item: args.item,
    result: args.result,
    now: args.now ?? new Date(),
    params: args.params,
  });
  if (!d.effectiveDate) return null;
  return {
    intervalDays: d.intervalDays,
    dueDate: d.effectiveDate,
    reviewType: d.reviewType,
    changeStrategy: d.changeStrategy,
    rationale: d.rationale,
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

// --- The one place a review-date write is decided ---------------------------
//
// An item's nextReviewDate and its Review row's dueDate must always move
// together — that's the whole fix. `resolveReviewDate` is the single,
// tri-state primitive every call site (closeSession, updateItem,
// snoozeReview) routes through: absent/undefined leaves the schedule exactly
// as it is, `null` deliberately clears it, an ISODate sets both sides to that
// one value.

export type ReviewDateInstruction = ISODate | null | undefined;

export interface ReviewDateWrite {
  /** What PracticeItem.nextReviewDate becomes. `undefined` clears it. */
  nextReviewDate: ISODate | undefined;
}

/**
 * Resolve a tri-state review-date instruction into the write to apply.
 * Returns `undefined` when nothing should change (the caller leaves both the
 * item and any review row exactly as they are).
 */
export function resolveReviewDate(instruction: ReviewDateInstruction): ReviewDateWrite | undefined {
  if (instruction === undefined) return undefined;
  return { nextReviewDate: instruction ?? undefined };
}

/**
 * Apply a tri-state review-date instruction to an item's Review rows.
 * Every OPEN row belonging to `practiceItemId` moves with the item: absent
 * leaves the array exactly as it is (returns `undefined`), null removes those
 * rows (there's nothing honest to point them at once the item has no next
 * review), an ISODate moves them to that date. This is the coupling that
 * `resolveReviewDate` alone cannot prove — the item and its review rows are
 * always the same array operation.
 */
export function applyReviewDateToRows(args: {
  reviews: Review[];
  practiceItemId: ID;
  instruction: ReviewDateInstruction;
  now: Date;
}): Review[] | undefined {
  const write = resolveReviewDate(args.instruction);
  if (!write) return undefined;

  const isOpenRowForItem = (r: Review) => r.practiceItemId === args.practiceItemId && !r.completedAt;

  if (write.nextReviewDate === undefined) {
    return args.reviews.filter((r) => !isOpenRowForItem(r));
  }
  const dueDate = write.nextReviewDate;
  return args.reviews.map((r) => (isOpenRowForItem(r) ? { ...r, dueDate, updatedAt: nowISO(args.now) } : r));
}

/**
 * Apply a tri-state review-date instruction to ONE Review row, selected by
 * its own id — the model `snoozeReview` needs. Unlike `applyReviewDateToRows`
 * (item-scoped: every open row moves, for when the ITEM's date is what's
 * being decided — closeSession, updateItem), this never touches a sibling
 * open row for the same item: snoozing review X must move X, not everything
 * else the item happens to have open.
 */
export function applyReviewDateToRow(args: {
  reviews: Review[];
  reviewId: ID;
  instruction: ReviewDateInstruction;
  now: Date;
}): Review[] | undefined {
  const write = resolveReviewDate(args.instruction);
  if (!write) return undefined;

  if (write.nextReviewDate === undefined) {
    return args.reviews.filter((r) => r.id !== args.reviewId);
  }
  const dueDate = write.nextReviewDate;
  return args.reviews.map((r) => (r.id === args.reviewId ? { ...r, dueDate, updatedAt: nowISO(args.now) } : r));
}

/**
 * What the close screen actually answered about the item's next review. The
 * whole of §A6 is that the first two used to be indistinguishable:
 *
 *   'scheduled'  — a date to write. Sets both sides and completes the open row.
 *   'declined'   — the owner said no. Clears the item's date and completes the
 *                  open row, exactly as it has always done.
 *   'unanswered' — no result was chosen, so NOTHING about the schedule was
 *                  decided. Keeps the item's date and leaves the open row
 *                  OPEN. Answering nothing is not declining: reading it as one
 *                  silently erased the next date, closed the open review and
 *                  left SM-2 state stale, so the item never appeared under Due
 *                  reviews again — while the screen read "Should this come
 *                  back? Yes" above an empty date field.
 */
export type ReviewAnswer = 'scheduled' | 'declined' | 'unanswered';

export interface ReviewOutcome {
  /**
   * Ready to hand straight to `applyBlockStats`: `undefined` keeps the
   * item's existing date, `null` clears it, an ISODate sets it.
   */
  nextReviewDate: ISODate | null | undefined;
  /**
   * Provenance to persist alongside it — `undefined` leaves the item's own
   * unchanged, `null` clears it along with the date.
   */
  nextReviewSource: ReviewDateSource | null | undefined;
  /**
   * Whether the item's OPEN review rows should be completed by this close.
   * Part of the SAME return value as the date on purpose: closeSession used to
   * decide this separately and unconditionally, which is precisely how the row
   * and the date came apart.
   *
   * A close that merely KEEPS an existing future date completes nothing —
   * the review it was scheduled for has not happened yet, and extra practice
   * before it is not that review. That pending row stays open.
   */
  completeOpenReviews: boolean;
  /** The new Review row to create, when a review was genuinely scheduled. */
  review?: { dueDate: ISODate; reviewType: ReviewType };
  /** SM-2 state to persist — omitted entirely when spacing did not move, so
   *  neither declining a review nor practising early ever fabricates
   *  retention history. */
  sr?: { srReps: number; srEase: number; srIntervalDays: number; srLastProgressDay?: ISODate };
  /** The decision this outcome renders, for callers that want the reason. */
  decision?: ReviewDecision;
}

/**
 * The decision behind closing a block: whether the item gets a next review at
 * all, whether its open review row is completed, and — when a review is
 * scheduled — the ONE date written to both the item and its new Review row.
 *
 * Three answers, three distinct transitions:
 *   • 'unanswered' — nothing was judged. Date, row and spacing all stand.
 *   • 'declined'   — a deliberate No. The pending date is cleared and the open
 *                    row completed, with no fabricated result and no spacing
 *                    progress. It is a decision about the PENDING REVIEW, not
 *                    a ban on ever practising the item again.
 *   • 'scheduled'  — the engine's decision applies, with the owner's own typed
 *                    date folded in as an explicit override when they set one.
 *
 * An explicit date the owner typed is authoritative in EITHER direction and is
 * recorded as theirs (`source: 'user'`), so the engine will not quietly move it
 * next time. It never fabricates spacing progress on its own: the SM-2
 * transition, if any, comes from the same decision that would have applied
 * without it.
 */
export function computeReviewOutcome(args: {
  item: PracticeItem;
  result?: BlockResult;
  answer: ReviewAnswer;
  /** Explicit override (e.g. a user-edited date on the close screen). */
  nextReviewDate?: ISODate;
  reviewType?: ReviewType;
  /** Required — this decision must never fall back to the wall clock. */
  now: Date;
  params?: SchedulingParams;
}): ReviewOutcome {
  const { item, result, answer, now, params } = args;

  // Nothing was decided about the schedule, so nothing about the schedule
  // moves — neither the item's date nor its open row. This is the one branch
  // that produces keep-the-date AND leave-the-row-open together.
  if (answer === 'unanswered') {
    return { nextReviewDate: undefined, nextReviewSource: undefined, completeOpenReviews: false };
  }

  if (answer === 'declined') {
    return { nextReviewDate: null, nextReviewSource: null, completeOpenReviews: true };
  }

  const decision = decideReview({ item, result, now, params });

  // An explicit date the owner chose overrides the engine's own proposal —
  // in either direction — and is stamped as theirs.
  if (args.nextReviewDate) {
    return {
      nextReviewDate: args.nextReviewDate,
      nextReviewSource: 'user',
      completeOpenReviews: true,
      review: { dueDate: args.nextReviewDate, reviewType: args.reviewType ?? decision.reviewType },
      sr: decision.sr,
      decision,
    };
  }

  if (decision.disposition === 'keep') {
    // The existing schedule stands — including its still-open pending row.
    return {
      nextReviewDate: undefined,
      nextReviewSource: undefined,
      completeOpenReviews: false,
      sr: decision.sr,
      decision,
    };
  }

  const dueDate = decision.dueDate!;
  return {
    nextReviewDate: dueDate,
    nextReviewSource: decision.source,
    completeOpenReviews: true,
    review: { dueDate, reviewType: args.reviewType ?? decision.reviewType },
    sr: decision.sr,
    decision,
  };
}

/**
 * Apply a close's completion decision to an item's OPEN review rows — the
 * array transform behind `ReviewOutcome.completeOpenReviews`, living next to
 * `applyReviewDateToRows` for the same reason: the row change has to be
 * reachable from a Node test, and `closeSession` (which cannot be) is a thin
 * caller. `complete: false` returns the array untouched, so a close that
 * answered nothing genuinely leaves the due review open.
 */
export function completeOpenReviewsFor(args: {
  reviews: Review[];
  practiceItemId: ID;
  complete: boolean;
  result?: BlockResult;
  now: Date;
}): Review[] {
  if (!args.complete) return args.reviews;
  const at = nowISO(args.now);
  return args.reviews.map((r) =>
    r.practiceItemId === args.practiceItemId && !r.completedAt
      ? { ...r, completedAt: at, result: args.result, updatedAt: at }
      : r,
  );
}

// --- Review actions that are NOT practice ------------------------------------
//
// Practising (closing a block) is the only thing that *can* complete a review or
// advance SM-2 — and `decideReview` above decides whether a given close actually
// does: an early session on a not-yet-due item keeps the date, leaves the pending
// row open and leaves SM-2 untouched. The other actions have deliberately small,
// honest semantics:
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

// --- Re-arming a pending review from the item itself -------------------------

export interface ScheduleAgainPlan {
  /** The one date both the item and its pending row end up on. */
  dueDate: ISODate;
  reviewType: ReviewType;
  /** The rows after moving every OPEN row for this item onto that date. */
  reviews: Review[];
  /** True when the item had NO open row and one must be created. */
  createRow: boolean;
}

/**
 * "Schedule again" / "set a date" on the item itself — an ADMINISTRATIVE
 * action, never practice. It creates no block, records no result, changes no
 * statistics and moves no SM-2 state; all it does is decide the one pending
 * date, on both sides at once.
 *
 * It has to work when there is no open row at all, which is the case the old
 * date helper could not reach: it only ever UPDATED existing rows, so an item
 * whose review had been declined could never be re-armed from its own screen.
 * A date chosen here is the owner's (`nextReviewSource: 'user'`), so the engine
 * treats it as authoritative until it comes due.
 */
export function scheduleAgainPlan(args: {
  item: PracticeItem;
  reviews: Review[];
  dueDate: ISODate;
  reviewType?: ReviewType;
  now: Date;
}): ScheduleAgainPlan {
  const { item, dueDate, now } = args;
  const hasOpenRow = args.reviews.some((r) => r.practiceItemId === item.id && !r.completedAt);
  const reviews =
    applyReviewDateToRows({ reviews: args.reviews, practiceItemId: item.id, instruction: dueDate, now }) ??
    args.reviews;
  return {
    dueDate,
    reviewType: args.reviewType ?? reviewTypeFor(item),
    reviews,
    createRow: !hasOpenRow,
  };
}

/**
 * Open review rows for one item that DISAGREE about when it is next due —
 * either with each other or with the item's own date. Legacy data can hold
 * these, and they are reported rather than silently rewritten: quietly
 * dropping one is a decision the owner never made about a date they once set.
 *
 * Returns null when the schedule is coherent (the ordinary case). Note that
 * every ordinary date write in this module already MOVES every open row for
 * the item together, so a conflict cannot be created going forward — this
 * describes what arrived, so the owner can resolve it deliberately.
 */
export function pendingScheduleConflict(
  item: PracticeItem,
  reviews: Review[],
): { rows: Review[]; message: string } | null {
  const open = reviews.filter((r) => r.practiceItemId === item.id && !r.completedAt);
  if (open.length === 0) return null;
  const dates = new Set(open.map((r) => r.dueDate));
  if (item.nextReviewDate) dates.add(item.nextReviewDate);
  if (dates.size <= 1) return null;
  const listed = [...dates].sort().join(', ');
  return {
    rows: open,
    message: `This item has more than one pending review date (${listed}). Set the date you mean and they will all move together.`,
  };
}

// --- Inbound validation ------------------------------------------------------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const REVIEW_MODES: ReviewMode[] = ['auto', 'interval', 'manual'];
const REVIEW_TYPES: ReviewType[] = ['retention', 'repair', 'integration', 'maintenance', 'teacher_check'];

/**
 * A real calendar date, not merely a string SHAPED like one:
 * `/^\d{4}-\d{2}-\d{2}$/` matches "2027-99-99" and "2026-02-30" just as
 * happily as a genuine date. `Date.UTC` normalises an out-of-range month or
 * day rather than rejecting it (day 30 of February silently becomes March
 * 2nd), so the shape regex alone lets exactly that kind of nonsense through —
 * the round trip through the SAME components is what actually proves it.
 */
function isValidISODate(s: string): boolean {
  if (!ISO_DATE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/**
 * Validate the scheduling fields of an INBOUND database before it is
 * installed. Bounded to the decision loop's own data — dates readable, enums
 * known, numbers finite, pending rows pointing at items that exist. It does
 * NOT reject a schedule whose open rows merely disagree about a date: that is
 * legitimate legacy state, reported to the owner by `pendingScheduleConflict`
 * rather than discarded here.
 */
export function validateSchedulingFields(db: Pick<PracticeDB, 'items' | 'reviews'>): string | null {
  for (const i of db.items) {
    if (i.nextReviewDate !== undefined && !isValidISODate(String(i.nextReviewDate))) {
      return `Item "${i.title ?? i.id}" has an unreadable next-review date.`;
    }
    if (i.reviewMode !== undefined && !REVIEW_MODES.includes(i.reviewMode)) {
      return `Item "${i.title ?? i.id}" has an unknown review mode.`;
    }
    if (i.nextReviewSource !== undefined && i.nextReviewSource !== 'auto' && i.nextReviewSource !== 'user') {
      return `Item "${i.title ?? i.id}" has an unknown review-date source.`;
    }
    if (i.srLastProgressDay !== undefined && !isValidISODate(String(i.srLastProgressDay))) {
      return `Item "${i.title ?? i.id}" has an unreadable spacing-progress day.`;
    }
    for (const key of ['srReps', 'srEase', 'srIntervalDays', 'reviewIntervalDays'] as const) {
      const v = i[key];
      if (v !== undefined && (typeof v !== 'number' || !Number.isFinite(v))) {
        return `Item "${i.title ?? i.id}" has an unreadable ${key}.`;
      }
    }
  }
  const seen = new Set<string>();
  for (const r of db.reviews) {
    if (seen.has(r.id)) return `Two reviews share the id "${r.id}".`;
    seen.add(r.id);
    if (!isValidISODate(String(r.dueDate))) return `A review for "${r.practiceItemId}" has an unreadable due date.`;
    if (!REVIEW_TYPES.includes(r.reviewType)) return `A review for "${r.practiceItemId}" has an unknown type.`;
    // A row pointing at an item that no longer exists is legacy debris, not
    // invalid new intent — it is tolerated (and ignored by every reader) rather
    // than used to refuse an entire restore. Repairing it belongs to the
    // separate storage-integrity work, not to this decision loop.
  }
  return null;
}
