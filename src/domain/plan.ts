import type {
  BlockMode,
  FocusArea,
  ID,
  ISODate,
  PracticeBlock,
  PracticeItem,
  Review,
  SchedulingParams,
} from './types';
import { DEFAULT_SCHEDULING_PARAMS, clampSchedulingParams } from './scheduling';
import {
  EXPOSURE_WINDOW_DAYS,
  groupBlocksByItem,
  isProactiveCandidate,
  scoreItems,
  type ItemScore,
} from './scoring';
import { dueReviews } from './selectors';
import { defaultModeForStatus, focusForItem } from './defaults';
import { toISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Session Plan — a time-budgeted programme for one practice session.
//
// This is organisation, not judgement: it lays out WHICH items to touch, in
// what order, for how long, so the user can stop deciding and just practise.
// Everything is deterministic (explicit `now`, score-desc then stable-id
// tiebreaks, no randomness) and reuses the same priority scoring as the
// recommendation engine — no second, hidden set of numbers, and the same
// eligibility policy (`isProactiveCandidate`) as Today, regeneration and swaps.
//
// The shape follows well-supported ideas from the practice-science literature,
// used as sane defaults (never as a claim of an "optimal" ratio):
//   • warm-up first, cool-down last (end on something stable) — sleep
//     consolidation favours finishing on a secure rep (Simmons & Duke 2006).
//   • short, spaced, goal-directed blocks — spacing + retrieval practice
//     (Cepeda 2006; Roediger & Karpicke 2006; Ericsson 1993).
//   • a mix of buckets rather than one item drilled — contextual interference
//     (Shea & Morgan 1979). It can feel harder; that's the point.
// The minute shares are adjustable via SchedulingParams (Settings). Every
// number this module uses is published in docs/scheduling-evidence.md.
//
// WHAT CHANGED, AND WHY: the main anchor is now chosen from actual urgency
// BEFORE any role decoration. A five-minute session used to pre-select new
// deep work and only then consider a higher-priority item committed for
// tomorrow's class. Warm-up is a ROLE an ordinary familiar item fills, not a
// type/strand label — an unfamiliar demanding exercise is not a warm-up just
// because it is tagged "technique". And the minutes may leave an honest
// remainder rather than stretch two items across two hours.
// ---------------------------------------------------------------------------

export type PlanBucket = 'warmup' | 'lesson' | 'review' | 'deep' | 'cooldown';

export interface PlanSegment {
  itemId: string;
  title: string;
  minutes: number;
  bucket: PlanBucket;
  /** Essential to the session (warm-up, the main anchor, the top lesson/review). */
  core: boolean;
  mode: BlockMode;
  focus: FocusArea;
  reason: string;
}

export interface SessionPlan {
  instrumentId: string;
  budgetMinutes: number;
  segments: PlanSegment[];
  summary: string;
  generatedAt: string;
}

export interface BuildPlanArgs {
  instrumentId: string;
  budgetMinutes: number;
  now: Date;
  items: PracticeItem[];
  blocks: PracticeBlock[];
  reviews: Review[];
  /** itemId → the date of the class it is committed to (`preparationDatesByItem`). */
  preparationDates?: Map<ID, ISODate>;
  /** Ids of items sitting in the current pathway stage — a tie-break only. */
  stageItemIds?: Set<string>;
  params?: SchedulingParams;
}

/** Shortest segment worth starting. */
export const MIN_SEGMENT_MINUTES = 2;
/** Longest single block the planner will ever propose. */
export const MAX_SEGMENT_MINUTES = 25;
/** Under this, the session is ONE useful main focus and nothing else. */
export const SHORT_SESSION_MINUTES = 12;
/** A warm-up may only exist if at least this much main work survives it. */
export const MAIN_WORK_FLOOR_MINUTES = 5;
/** The budgets this planner accepts. */
export const MIN_BUDGET_MINUTES = 5;
export const MAX_BUDGET_MINUTES = 120;

// Statuses that read as "settled" — the only ones a cool-down draws from.
const COOLDOWN_STATUSES = new Set(['integrated', 'performable', 'maintenance']);
/** Statuses that are themselves evidence the material is familiar. */
const FAMILIAR_STATUSES = new Set(['usable', 'integrated', 'performable', 'maintenance']);

/** Priority for handing out spare minutes and for trimming when too many. */
const BUCKET_PRIORITY: PlanBucket[] = ['deep', 'lesson', 'review', 'warmup', 'cooldown'];
/** Relative minute weight per bucket (deep gets the most; cool-down the least). */
const BUCKET_WEIGHT: Record<PlanBucket, number> = {
  warmup: 1,
  review: 1.2,
  lesson: 1.8,
  deep: 2.6,
  cooldown: 0.9,
};

/** Points subtracted when a candidate repeats a dimension already selected. */
export const DIVERSITY_SAME_SESSION_PENALTY = 1;
/** Points subtracted when it repeats a dimension practised in the last 2 days. */
export const DIVERSITY_RECENT_DAYS_PENALTY = 1;
const DIVERSITY_RECENT_WINDOW_DAYS = 2;

/**
 * Accept a whole-minute budget, or reject it. Non-finite, fractional-only
 * rubbish, zero and out-of-range values are refused AT THE BOUNDARY rather
 * than clamped into something the owner did not ask for or looped over.
 */
export function validateBudgetMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  if (n < MIN_BUDGET_MINUTES || n > MAX_BUDGET_MINUTES) return null;
  return n;
}

/**
 * The candidate pool a build OR a swap picks from: practised-today material
 * steps aside — unless it is committed to a class, a commitment the day's
 * earlier session did not discharge — falling back to repeating today's own
 * work only when nothing fresh remains eligible. Shared so a swap can never
 * reach material the build itself deliberately set aside (§B3/B7): a swap
 * used to run this filter over `scored` directly, so it could hand back an
 * item the build had excluded as already practised while a fresher,
 * untouched candidate sat right behind it.
 */
function candidatePool(
  scored: ItemScore[],
  blocks: PracticeBlock[],
  now: Date,
): { pool: ItemScore[]; isRepeatPool: boolean; practisedToday: Set<string> } {
  const today = todayISODate(now);
  const practisedToday = new Set(
    blocks.filter((b) => toISODate(new Date(b.startedAt)) === today).map((b) => b.practiceItemId),
  );
  const fresh = scored.filter((s) => !practisedToday.has(s.item.id) || s.parts.lesson > 0);
  return { pool: fresh.length > 0 ? fresh : scored, isRepeatPool: fresh.length === 0, practisedToday };
}

/**
 * Is this item suitable as a warm-up? A role, not a label.
 *
 * Two things together: LOW DEMAND (difficulty ≤ 3) and evidence of
 * FAMILIARITY — either a settled status or a real practice history. A brand
 * new, demanding étude tagged "technique" is exactly what a warm-up is not,
 * however the old type/strand test read it. With nothing suitable the planner
 * omits the warm-up honestly rather than promoting the least-bad candidate.
 */
export function isWarmupSuitable(item: PracticeItem): boolean {
  if (item.difficulty >= 4) return false;
  if (item.status === 'new' || item.status === 'dormant') return false;
  return item.timesPractised >= 3 || FAMILIAR_STATUSES.has(item.status);
}

/**
 * The musical dimension a diversity preference works on: the item's own
 * strand, else its type. Existing metadata only — no new taxonomy, and a
 * missing one simply contributes no preference either way.
 */
export function itemDimension(item: PracticeItem): string {
  return item.strand ?? item.itemType;
}

interface Candidate {
  score: ItemScore;
  bucket: PlanBucket;
  reason: string;
}

function focusFor(item: PracticeItem): FocusArea {
  return focusForItem(item);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A one-sentence reason built from the SAME record that selected the item:
 * its own score parts, its own committed lesson, its own review date. Extra
 * context (a repeat, a diversity trade-off) is passed in from the selection
 * step that actually made that trade, never re-derived here.
 */
export function planSegmentReason(
  bucket: PlanBucket,
  score: ItemScore,
  context: { repeat?: boolean; yieldedTo?: string; dueDate?: ISODate } = {},
): string {
  if (context.repeat) {
    return 'Practised earlier today — chosen again because nothing else eligible is waiting.';
  }
  switch (bucket) {
    case 'warmup':
      return 'Warm up on something you already know before the harder work.';
    case 'lesson':
      return score.daysToLesson === 0
        ? `For today’s class (${score.lessonDate}).`
        : `For your class on ${score.lessonDate} — ${plural(score.daysToLesson ?? 0, 'day')} away.`;
    case 'review': {
      const when = context.dueDate ? ` (due ${context.dueDate})` : '';
      return score.overdueDays != null && score.overdueDays > 0
        ? `Due for review${when} — ${plural(score.overdueDays, 'day')} overdue.`
        : `Due for review today${when} — retrieve it from memory.`;
    }
    case 'cooldown':
      return 'End on something that already holds together.';
    case 'deep': {
      const p = score.parts;
      if (context.yieldedTo) {
        return `Fresh work — you have already spent time on ${context.yieldedTo} lately.`;
      }
      if (p.fragility >= 4) return 'Focused work — it’s still shaky and needs rebuilding.';
      if (score.overdueDays && score.overdueDays > 0) return 'Focused work — its review is overdue.';
      if (p.neglected >= 3) return 'Focused work — it’s been a while since you touched it.';
      if (p.importance >= 8) return 'Focused work — it matters most right now.';
      if (p.exposurePenalty > 0) {
        return `Focused work — ${Math.round(score.exposureMinutes)} minutes on it this week already.`;
      }
      return 'Focused work on what needs the most attention.';
    }
  }
}

/**
 * Build a time-budgeted plan for one instrument. Pure and deterministic.
 * Minutes are whole and never exceed `budgetMinutes`.
 *
 * Throws on an invalid budget: a plan built from a NaN or a two-day session
 * length is not a plan, and silently repairing one hides the caller's bug.
 */
export function buildSessionPlan(args: BuildPlanArgs): SessionPlan {
  const B = validateBudgetMinutes(args.budgetMinutes);
  if (B === null) {
    throw new Error(
      `Session length must be a whole number of minutes between ${MIN_BUDGET_MINUTES} and ${MAX_BUDGET_MINUTES}.`,
    );
  }
  const params = clampSchedulingParams(args.params ?? DEFAULT_SCHEDULING_PARAMS);
  const now = args.now;
  const generatedAt = now.toISOString();
  const empty = (summary: string): SessionPlan => ({
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments: [],
    summary,
    generatedAt,
  });

  // ---- eligibility: one policy, no widening fallback -----------------------
  const items = args.items.filter((i) => i.instrumentId === args.instrumentId).filter(isProactiveCandidate);
  const blocks = args.blocks.filter((b) => b.instrumentId === args.instrumentId);
  const blocksByItem = groupBlocksByItem(blocks);
  const scored = scoreItems(items, blocksByItem, now, args.preparationDates);

  if (scored.length === 0) {
    return empty(
      args.items.some((i) => i.instrumentId === args.instrumentId)
        ? 'Everything for this instrument is resting — change an item’s status to bring it back.'
        : 'No items for this instrument yet — add one and the plan fills in.',
    );
  }

  const today = todayISODate(now);
  const { pool, isRepeatPool, practisedToday } = candidatePool(scored, blocks, now);

  const dueById = new Map(
    dueReviews(args.reviews, now)
      .filter((r) => items.some((i) => i.id === r.practiceItemId))
      .map((r) => [r.practiceItemId, r.dueDate] as const),
  );

  const bucketFor = (s: ItemScore): PlanBucket => {
    if (s.parts.lesson > 0) return 'lesson';
    if (dueById.has(s.item.id)) return 'review';
    return 'deep';
  };

  // Dimensions touched in the last couple of days — a modest freshness
  // preference, subordinate to every real need above it in the score.
  const recentDimensions = new Set<string>();
  for (const b of blocks) {
    const day = toISODate(new Date(b.startedAt));
    if (day > today) continue;
    const ageOk = day >= addDaysBack(today, DIVERSITY_RECENT_WINDOW_DAYS);
    if (!ageOk) continue;
    const item = items.find((i) => i.id === b.practiceItemId);
    if (item) recentDimensions.add(itemDimension(item));
  }

  const stageIds = args.stageItemIds ?? new Set<string>();
  const used = new Set<string>();
  const selectedDimensions = new Set<string>();
  const selected: Candidate[] = [];

  /**
   * Pick the best remaining candidate from `from`, applying the bounded
   * diversity preference. Returns the candidate AND the dimension it beat, so
   * the reason can say so rather than inventing an explanation later.
   */
  const pick = (
    from: ItemScore[],
    applyDiversity: boolean,
  ): { score: ItemScore; yieldedTo?: string } | undefined => {
    const open = from.filter((s) => !used.has(s.item.id));
    if (open.length === 0) return undefined;
    const adjusted = open.map((s) => {
      const dim = itemDimension(s.item);
      let penalty = 0;
      if (applyDiversity) {
        if (selectedDimensions.has(dim)) penalty += DIVERSITY_SAME_SESSION_PENALTY;
        if (recentDimensions.has(dim)) penalty += DIVERSITY_RECENT_DAYS_PENALTY;
      }
      return { s, adjusted: s.total - penalty, penalty };
    });
    adjusted.sort(
      (a, b) =>
        b.adjusted - a.adjusted ||
        b.s.total - a.s.total ||
        Number(stageIds.has(b.s.item.id)) - Number(stageIds.has(a.s.item.id)) ||
        a.s.item.id.localeCompare(b.s.item.id),
    );
    const best = adjusted[0];
    // Name the trade only when diversity ACTUALLY changed the order.
    const top = open.slice().sort((a, b) => b.total - a.total || a.item.id.localeCompare(b.item.id))[0];
    const yieldedTo = top && top.item.id !== best.s.item.id ? top.item.title : undefined;
    return { score: best.s, yieldedTo };
  };

  const add = (
    chosen: { score: ItemScore; yieldedTo?: string } | undefined,
    bucket: PlanBucket,
    extra: { repeat?: boolean } = {},
  ): Candidate | undefined => {
    if (!chosen) return undefined;
    used.add(chosen.score.item.id);
    selectedDimensions.add(itemDimension(chosen.score.item));
    const candidate: Candidate = {
      score: chosen.score,
      bucket,
      reason: planSegmentReason(bucket, chosen.score, {
        repeat: extra.repeat,
        yieldedTo: bucket === 'deep' ? chosen.yieldedTo : undefined,
        dueDate: dueById.get(chosen.score.item.id),
      }),
    };
    selected.push(candidate);
    return candidate;
  };

  // ---- 1. the anchor: the most useful work, before any role decoration ----
  const anchorPick = pick(pool, false);
  const anchor = add(anchorPick, anchorPick ? bucketFor(anchorPick.score) : 'deep', { repeat: isRepeatPool });
  if (!anchor) return empty('Nothing eligible to practise right now.');

  if (B >= SHORT_SESSION_MINUTES) {
    // ---- 2. warm-up: optional, real minutes, never at the cost of the work --
    const warmupMinutes = Math.max(MIN_SEGMENT_MINUTES, Math.round(B * params.warmupShare));
    if (B - warmupMinutes >= MAIN_WORK_FLOOR_MINUTES) {
      // A warm-up never consumes work that is WANTED for itself: an item
      // whose review is due deserves the retrieval slot, and one committed to
      // a class deserves real practice. Spending either as the warm-up would
      // quietly drop the need that made it urgent.
      const warmupPool = pool.filter(
        (s) => isWarmupSuitable(s.item) && !dueById.has(s.item.id) && s.parts.lesson === 0,
      );
      add(pick(warmupPool, false), 'warmup', { repeat: isRepeatPool });
    }

    // ---- 3. fill the middle with further useful work ------------------------
    const target = segmentTarget(B);
    const wantCooldown = B >= 20;
    const middleTarget = target - (wantCooldown ? 1 : 0);
    while (selected.length < middleTarget) {
      const next = pick(pool, true);
      if (!next) break;
      add(next, bucketFor(next.score), { repeat: isRepeatPool });
    }

    // ---- 4. cool-down: optional familiar work, never a slot to fill ---------
    if (wantCooldown && selected.length < target) {
      add(pick(pool.filter((s) => COOLDOWN_STATUSES.has(s.item.status)), false), 'cooldown', {
        repeat: isRepeatPool,
      });
    }
  }

  // ---- order: warm-up first, cool-down last, work by priority between -------
  const rank = (c: Candidate): number => (c.bucket === 'warmup' ? 0 : c.bucket === 'cooldown' ? 2 : 1);
  const ordered = selected
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const ra = rank(a.c);
      const rb = rank(b.c);
      if (ra !== rb) return ra - rb;
      if (ra === 1) return b.c.score.total - a.c.score.total || a.c.score.item.id.localeCompare(b.c.score.item.id);
      return a.i - b.i;
    })
    .map(({ c }) => c);

  const minutes = allocateMinutes(ordered.map((c) => c.bucket), B, params);
  const kept = ordered.slice(0, minutes.length);

  const coreIds = new Set<string>([anchor.score.item.id]);
  const warmupSeg = kept.find((c) => c.bucket === 'warmup');
  if (warmupSeg) coreIds.add(warmupSeg.score.item.id);
  const topWork = kept.find((c) => c.bucket === 'lesson' || c.bucket === 'review');
  if (topWork && coreIds.size < 3) coreIds.add(topWork.score.item.id);

  const segments: PlanSegment[] = kept.map((c, i) => ({
    itemId: c.score.item.id,
    title: c.score.item.title,
    minutes: minutes[i],
    bucket: c.bucket,
    core: coreIds.has(c.score.item.id),
    mode: defaultModeForStatus(c.score.item.status),
    focus: focusFor(c.score.item),
    reason: c.reason,
  }));

  // "Skipping X" is decided from what was ACTUALLY left out. Deriving it
  // before selection is how the fallback used to name an item it went on to
  // choose — a plan describing its own segment as skipped.
  const chosen = new Set(segments.map((s) => s.itemId));
  const skippedTitles = scored
    .filter((s) => practisedToday.has(s.item.id) && !chosen.has(s.item.id))
    .map((s) => s.item.title);

  return {
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments,
    summary: buildSummary(segments, B, skippedTitles),
    generatedAt,
  };
}

/** Local calendar date `days` before `date`. */
function addDaysBack(date: ISODate, days: number): ISODate {
  const [y, m, d] = date.split('-').map(Number);
  const back = new Date(y, (m ?? 1) - 1, (d ?? 1) - days);
  return toISODate(back);
}

/** How many segments a budget can sensibly seat. */
function segmentTarget(B: number): number {
  if (B < SHORT_SESSION_MINUTES) return 1;
  if (B < 20) return 2;
  if (B < 30) return 3;
  if (B < 45) return 4;
  if (B < 60) return 5;
  if (B < 90) return 6;
  return 7;
}

/**
 * Apportion whole minutes across the given buckets, never exceeding `budget`
 * and normally using all of it. Every segment gets at least
 * MIN_SEGMENT_MINUTES and at most MAX_SEGMENT_MINUTES.
 *
 * That ceiling is what makes an honest remainder possible: two items and two
 * hours is not a reason to propose a sixty-minute block on each. When the
 * ceiling binds, the leftover minutes are simply not allocated, and the
 * summary says so — inventing filler or stretching work beyond a sensible
 * allocation would be a worse answer than a short plan.
 *
 * Deterministic largest-remainder split by bucket weight, a priority-ordered
 * ±1 fix, then review segments are clamped into
 * `[reviewSlotMinMinutes, reviewSlotMaxMinutes]`.
 */
export function allocateMinutes(buckets: PlanBucket[], budget: number, params?: SchedulingParams): number[] {
  const B = Math.max(MIN_SEGMENT_MINUTES, Math.round(budget));
  let list = buckets.slice();
  if (list.length === 0) return [];

  // Too many segments to give each ≥ MIN_SEGMENT_MINUTES? Drop lowest-priority.
  const maxSegments = Math.max(1, Math.floor(B / MIN_SEGMENT_MINUTES));
  if (list.length > maxSegments) {
    const keepOrder = list
      .map((bucket, i) => ({ bucket, i }))
      .sort((a, b) => BUCKET_PRIORITY.indexOf(a.bucket) - BUCKET_PRIORITY.indexOf(b.bucket) || a.i - b.i)
      .slice(0, maxSegments)
      .map((x) => x.i)
      .sort((a, b) => a - b);
    list = keepOrder.map((i) => buckets[i]);
  }

  if (list.length === 1) return [Math.min(B, MAX_SEGMENT_MINUTES)];

  const p = clampSchedulingParams(params);
  const alloc: number[] = new Array(list.length).fill(0);

  // The warm-up's share is a REAL ALLOCATION TARGET, not a weight nudge: it is
  // pinned to `round(B × warmupShare)` and then left alone. Bounded by
  // feasibility — never below the floor, never above the ceiling, and never so
  // large that another segment cannot reach the floor. Everything else splits
  // what remains, so the published share is the number the owner actually
  // sees on the screen rather than an input to a weighting they cannot check.
  const warmupIdx = list.indexOf('warmup');
  const rest = list.map((_, i) => i).filter((i) => i !== warmupIdx);
  let pool = B;
  if (warmupIdx >= 0) {
    const headroom = B - rest.length * MIN_SEGMENT_MINUTES;
    const target = Math.round(B * p.warmupShare);
    alloc[warmupIdx] = Math.max(
      MIN_SEGMENT_MINUTES,
      Math.min(target, MAX_SEGMENT_MINUTES, Math.max(MIN_SEGMENT_MINUTES, headroom)),
    );
    pool = B - alloc[warmupIdx];
  }

  const weights = rest.map((i) => weightFor(list[i], p));
  const sumW = weights.reduce((a, w) => a + w, 0) || 1;
  rest.forEach((i, k) => {
    alloc[i] = Math.min(
      MAX_SEGMENT_MINUTES,
      Math.max(MIN_SEGMENT_MINUTES, Math.floor((pool * weights[k]) / sumW)),
    );
  });

  let total = alloc.reduce((a, m) => a + m, 0);
  const byPriority = rest
    .map((i) => ({ b: list[i], i }))
    .sort((a, z) => BUCKET_PRIORITY.indexOf(a.b) - BUCKET_PRIORITY.indexOf(z.b) || a.i - z.i)
    .map((x) => x.i);

  // Hand out the shortfall to the highest-priority segments that still have
  // room under the ceiling. When none has room, the remainder stays unspent —
  // an honest short plan beats stretching two items across two hours.
  let guard = 0;
  while (total < B && guard++ < 10000) {
    let changed = false;
    for (const i of byPriority) {
      if (total >= B) break;
      if (alloc[i] < MAX_SEGMENT_MINUTES) {
        alloc[i] += 1;
        total += 1;
        changed = true;
      }
    }
    if (!changed) break;
  }
  // Trim any overflow from the lowest-priority segments that stay at the floor.
  const lowestFirst = byPriority.slice().reverse();
  guard = 0;
  while (total > B && guard++ < 10000) {
    let changed = false;
    for (const i of lowestFirst) {
      if (total <= B) break;
      if (alloc[i] > MIN_SEGMENT_MINUTES) {
        alloc[i] -= 1;
        total -= 1;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Keep review segments within the configured slot window — a retrieval check
  // should not quietly take half the session. Minutes move only among the
  // non-warm-up segments, so the warm-up's pinned share survives this step.
  const reviewIdx = rest.filter((i) => list[i] === 'review');
  if (reviewIdx.length > 0) {
    const others = byPriority.filter((i) => list[i] !== 'review');
    const othersLowestFirst = others.slice().reverse();
    for (const i of reviewIdx) {
      const original = alloc[i];
      const desired = Math.min(Math.max(original, p.reviewSlotMinMinutes), p.reviewSlotMaxMinutes);
      const diff = original - desired;
      if (diff > 0 && others.length > 0) {
        let give = diff;
        let g = 0;
        while (give > 0 && g++ < 10000) {
          let changed = false;
          for (const j of others) {
            if (give <= 0) break;
            if (alloc[j] < MAX_SEGMENT_MINUTES) {
              alloc[j] += 1;
              give -= 1;
              changed = true;
            }
          }
          if (!changed) break;
        }
        // Only give away what someone could actually take: the rest stays on
        // the review rather than vanishing from the budget.
        alloc[i] = original - (diff - give);
      } else if (diff < 0) {
        const need = -diff;
        let taken = 0;
        let g = 0;
        while (taken < need && g++ < 10000) {
          let changed = false;
          for (const j of othersLowestFirst) {
            if (taken >= need) break;
            if (alloc[j] > MIN_SEGMENT_MINUTES) {
              alloc[j] -= 1;
              taken += 1;
              changed = true;
            }
          }
          if (!changed) break;
        }
        alloc[i] = Math.min(MAX_SEGMENT_MINUTES, original + taken);
      }
    }
  }

  return alloc;
}

function weightFor(bucket: PlanBucket, params: SchedulingParams): number {
  // Warm-up is deliberately absent: its share is a pinned allocation target
  // above, not a weight. Having both was two half-mechanisms for one number,
  // and meant the published share was never the minutes anyone actually got.
  if (bucket === 'deep') return BUCKET_WEIGHT.deep * (params.deepWorkShare / DEFAULT_SCHEDULING_PARAMS.deepWorkShare);
  return BUCKET_WEIGHT[bucket];
}

function buildSummary(segments: PlanSegment[], B: number, skippedTitles: string[]): string {
  if (segments.length === 0) return `${B} min free — add an item and the plan fills in.`;
  const counts = new Map<PlanBucket, number>();
  for (const s of segments) counts.set(s.bucket, (counts.get(s.bucket) ?? 0) + 1);
  const parts: string[] = [];
  if (counts.get('warmup')) parts.push('a warm-up');
  const focus = (counts.get('deep') ?? 0) + (counts.get('lesson') ?? 0);
  if (focus) parts.push(`${focus} focus block${focus === 1 ? '' : 's'}`);
  if (counts.get('review')) parts.push(`${counts.get('review')} review${counts.get('review') === 1 ? '' : 's'}`);
  if (counts.get('cooldown')) parts.push('a cool-down');
  const planned = segments.reduce((a, s) => a + s.minutes, 0);
  let out = `${planned} min · ${joinList(parts)}.`;
  if (planned < B) {
    out += ` ${B - planned} of your ${B} minutes are unplanned — there isn’t more useful work waiting.`;
  }
  if (skippedTitles.length > 0) {
    const shown = skippedTitles.slice(0, 2).join(', ');
    const more = skippedTitles.length > 2 ? ` +${skippedTitles.length - 2} more` : '';
    out += ` Skipping ${shown}${more} — already practised today.`;
  }
  return out;
}

function joinList(parts: string[]): string {
  if (parts.length === 0) return 'a focused block';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * Re-spread minutes across the remaining segments after one was removed. Item
 * identity, bucket and reason are untouched — redistribution moves minutes,
 * never work: attaching one role's minutes and reason to another item is the
 * failure this preserves against.
 */
export function redistributePlan(plan: SessionPlan, params?: SchedulingParams): SessionPlan {
  if (plan.segments.length === 0) {
    return { ...plan, summary: buildSummary([], plan.budgetMinutes, []) };
  }
  const minutes = allocateMinutes(plan.segments.map((s) => s.bucket), plan.budgetMinutes, params);
  // allocateMinutes may drop segments if there are too many for the budget;
  // keep only the ones it kept, in order.
  const kept = plan.segments.slice(0, minutes.length);
  const segments = kept.map((s, i) => ({ ...s, minutes: minutes[i] }));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, []) };
}

/**
 * Swap segment `index` for the next-best alternative, keeping its minutes and
 * its role. Uses the SAME eligibility policy, candidate pool and warm-up
 * exclusions as the build — a swap that could reach material the build
 * excluded is a second, hidden policy, and it used to hand back an item
 * already practised today (or a due/lesson-committed item as a "warm-up")
 * even while a fresher, build-eligible candidate sat right behind it.
 *
 * DELIBERATELY NOT SHARED: the build's DIVERSITY preference
 * (`selectedDimensions`/`recentDimensions` in `buildSessionPlan`). Diversity
 * is a modest, order-dependent tie-break among the OTHER segments a build is
 * choosing at the same time (AGENTS.md: "subordinate to real needs") — it is
 * not an eligibility rule like practised-today or a due/lesson exclusion, and
 * a swap has no OTHER segments' choices in front of it to be diverse against
 * (`plan.segments` here is the already-finished plan, not a selection in
 * progress). Reconstructing that state for one substitution would make a
 * swap's answer depend on an ordering it never participated in. A swap
 * therefore returns the single best-scoring ELIGIBLE candidate, full stop.
 */
export function swapSegment(
  plan: SessionPlan,
  index: number,
  args: Omit<BuildPlanArgs, 'budgetMinutes'> & { excludeIds?: Set<string> },
): SessionPlan {
  const target = plan.segments[index];
  if (!target) return plan;

  const items = args.items
    .filter((i) => i.instrumentId === plan.instrumentId)
    .filter(isProactiveCandidate);
  const blocks = args.blocks.filter((b) => b.instrumentId === plan.instrumentId);
  const scored = scoreItems(items, groupBlocksByItem(blocks), args.now, args.preparationDates);
  // The SAME candidate pool the build itself drew from — practised-today
  // material stays excluded here too, unless nothing fresh is eligible for
  // this bucket, in which case the honest repeat fallback applies exactly as
  // it does on a build (§B3/B7).
  const { pool, isRepeatPool } = candidatePool(scored, blocks, args.now);

  const inUse = new Set(plan.segments.map((s) => s.itemId));
  const exclude = args.excludeIds ?? new Set<string>();
  const dueById = new Map(
    dueReviews(args.reviews, args.now)
      .filter((r) => items.some((i) => i.id === r.practiceItemId))
      .map((r) => [r.practiceItemId, r.dueDate] as const),
  );

  const eligible = (s: ItemScore): boolean => {
    if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
    switch (target.bucket) {
      case 'warmup':
        // Same exclusions as the build's own warm-up pool: a due review or a
        // class commitment deserves the slot it is actually needed for, never
        // spent as a warm-up.
        return isWarmupSuitable(s.item) && !dueById.has(s.item.id) && s.parts.lesson === 0;
      case 'lesson':
        return s.parts.lesson > 0;
      case 'review':
        return dueById.has(s.item.id);
      case 'cooldown':
        return COOLDOWN_STATUSES.has(s.item.status);
      case 'deep':
        return true;
    }
  };

  const pick = pool.find(eligible);
  if (!pick) return plan;

  const replacement: PlanSegment = {
    itemId: pick.item.id,
    title: pick.item.title,
    minutes: target.minutes,
    bucket: target.bucket,
    core: target.core,
    mode: defaultModeForStatus(pick.item.status),
    focus: focusFor(pick.item),
    reason: planSegmentReason(target.bucket, pick, { dueDate: dueById.get(pick.item.id), repeat: isRepeatPool }),
  };
  const segments = plan.segments.map((s, i) => (i === index ? replacement : s));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, []) };
}

/** Exposure window this planner reasons over, re-exported for the docs table. */
export { EXPOSURE_WINDOW_DAYS };

// --- Running a plan ----------------------------------------------------------
//
// The pointer transitions live here, pure, for the same reason every other
// decision does: the store cannot be imported in a Node test (it pulls in
// Dexie), so a transition written inline there would be provable only through
// a browser. These are the transitions; `useStore` is the thin caller.

export type PlanSegmentStatus = 'pending' | 'done' | 'skipped';

export interface PlanRunSegment extends PlanSegment {
  status: PlanSegmentStatus;
}

export interface PlanRun {
  instrumentId: string;
  budgetMinutes: number;
  startedAt: string;
  /** Index of the next segment to practise; === segments.length when finished. */
  pointer: number;
  segments: PlanRunSegment[];
}

/**
 * The next still-PENDING segment. It wraps once to the start, so a pending
 * segment the pointer has already jumped past is not stranded; a segment the
 * owner deliberately skipped stays skipped. `segments.length` means finished.
 */
export function advancePlanPointer(segments: PlanRunSegment[], from: number): number {
  for (let i = from + 1; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  return segments.length;
}

/**
 * A block just closed. When it was the CURRENT segment's item, that segment is
 * done and the pointer moves on; anything else leaves the run untouched —
 * practising something off-plan is ordinary, not plan progress.
 */
export function completePlanSegment(run: PlanRun, itemId: string): PlanRun {
  const seg = run.segments[run.pointer];
  if (!seg || seg.itemId !== itemId || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) => (i === run.pointer ? { ...s, status: 'done' as const } : s));
  return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
}

/** Skip the current segment. Records nothing: a skipped segment is not practice. */
export function skipPlanSegment(run: PlanRun): PlanRun {
  const seg = run.segments[run.pointer];
  if (!seg || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) => (i === run.pointer ? { ...s, status: 'skipped' as const } : s));
  return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
}

/**
 * Has the local calendar day moved past the day a session-plan PREVIEW was
 * built for? Takes the caller's OWN `now` rather than reading a clock itself,
 * but the point of this function is that the caller must pass the TRUE
 * current instant here, never a screen's own polled `now`
 * (`useDecisionNow` refreshes at most every 30 seconds, plus visibility/focus)
 * — starting a plan is an authority boundary, the one place that lag must
 * never be trusted. `SessionPlan.tsx`'s own `stale` flag already renders this
 * same comparison against its polled `now` for the passive banner; this is
 * the identical rule, extracted so the click-time check reads a fresh
 * `Date` directly rather than waiting for that polled value to catch up.
 */
export function planPreviewDayHasPassed(baseDay: string, now: Date): boolean {
  return todayISODate(now) !== baseDay;
}

export type PlanStartCheck =
  | { ok: true; item: PracticeItem }
  | { ok: false; reason: 'finished' | 'deleted' | 'moved' | 'busy' };

/**
 * May the current segment be started right now? Revalidated against LIVE data
 * every time, never trusted from the plan: between building a plan and reaching
 * a segment the item can be deleted or moved to another instrument, and another
 * clock can have been started.
 *
 * A `deleted`/`moved` segment is visibly skipped by the caller rather than
 * played under the wrong instrument; a `busy` verdict refuses outright, because
 * replacing an unfinished block or routine run would destroy real practice.
 */
export function planSegmentStartable(
  run: PlanRun,
  items: PracticeItem[],
  busy = false,
): PlanStartCheck {
  if (busy) return { ok: false, reason: 'busy' };
  const seg = run.segments[run.pointer];
  if (!seg) return { ok: false, reason: 'finished' };
  const item = items.find((i) => i.id === seg.itemId);
  if (!item) return { ok: false, reason: 'deleted' };
  if (item.instrumentId !== run.instrumentId) return { ok: false, reason: 'moved' };
  return { ok: true, item };
}
