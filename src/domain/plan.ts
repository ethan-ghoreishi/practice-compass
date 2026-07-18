import type {
  BlockMode,
  FocusArea,
  PracticeBlock,
  PracticeItem,
  Review,
  SchedulingParams,
} from './types';
import { DEFAULT_SCHEDULING_PARAMS, clampSchedulingParams } from './scheduling';
import { groupBlocksByItem, scoreItems, type ItemScore } from './scoring';
import { dueReviews } from './selectors';
import { defaultModeForStatus } from './defaults';
import { STRAND_TO_FOCUS } from './labels';
import { todayISODate } from './util';

// ---------------------------------------------------------------------------
// Session Plan — a time-budgeted programme for one practice session.
//
// This is organisation, not judgement: it lays out WHICH items to touch, in
// what order, for how long, so the user can stop deciding and just practise.
// Everything is deterministic (explicit `now`, stable score-desc-then-id
// tiebreaks, no randomness) and reuses the same priority scoring as the
// recommendation engine — no second, hidden set of numbers.
//
// The shape follows well-supported ideas from the practice-science literature,
// used as sane defaults (never as a claim of an "optimal" ratio):
//   • warm-up first, cool-down last (end on something stable) — sleep
//     consolidation favours finishing on a secure rep (Simmons & Duke 2006).
//   • short, spaced, goal-directed blocks — spacing + retrieval practice
//     (Cepeda 2006; Roediger & Karpicke 2006; Ericsson 1993).
//   • a mix of buckets rather than one item drilled — contextual interference
//     (Shea & Morgan 1979). It can feel harder; that's the point.
// The minute shares are adjustable via SchedulingParams (Settings).
//
// The one hard invariant: the segment minutes ALWAYS sum to the budget.
// ---------------------------------------------------------------------------

export type PlanBucket = 'warmup' | 'lesson' | 'review' | 'deep' | 'cooldown';

export interface PlanSegment {
  itemId: string;
  title: string;
  minutes: number;
  bucket: PlanBucket;
  /** Essential to the session (warm-up, the deep anchor, the top lesson/review). */
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
  /** instrumentId → next lesson date, as the scorer expects. */
  lessonDates?: Map<string, string>;
  /** Ids of items sitting in the current pathway stage (warm-up / deep pools). */
  stageItemIds?: Set<string>;
  params?: SchedulingParams;
}

const MIN_SEGMENT = 2;

// Statuses that make an item "deep work" (still being built) vs "settled".
const DEEP_STATUSES = new Set(['new', 'fragile', 'repairing']);
const COOLDOWN_STATUSES = new Set(['integrated', 'performable', 'maintenance']);

// Item types / strands that read as warm-up material.
const WARMUP_TYPES = new Set(['technique', 'exercise']);
const WARMUP_STRANDS = new Set([
  'warmup',
  'technique',
  'exercise',
  'scales',
  'arpeggios',
  'mezrab',
  'right_hand',
  'left_hand',
]);

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

function isWarmupItem(item: PracticeItem): boolean {
  return WARMUP_TYPES.has(item.itemType) || (!!item.strand && WARMUP_STRANDS.has(item.strand));
}

function focusFor(item: PracticeItem): FocusArea {
  return item.primaryFocus ?? (item.strand ? STRAND_TO_FOCUS[item.strand] : 'other');
}

/** A one-sentence reason built from the same numbers that ranked the item. */
export function planSegmentReason(bucket: PlanBucket, score: ItemScore): string {
  switch (bucket) {
    case 'warmup':
      return 'Warm up your hands and ears before the harder work.';
    case 'lesson':
      return score.daysToLesson != null && score.daysToLesson <= 0
        ? 'Assigned for your class — it’s due.'
        : `Assigned for your next class${score.daysToLesson != null ? ` · in ${score.daysToLesson} day${score.daysToLesson === 1 ? '' : 's'}` : ''}.`;
    case 'review':
      return score.overdueDays != null && score.overdueDays > 0
        ? `Due for review — ${score.overdueDays} day${score.overdueDays === 1 ? '' : 's'} overdue.`
        : 'Due for review — retrieve it from memory.';
    case 'cooldown':
      return 'End on something that already holds together.';
    case 'deep': {
      // Name the biggest contributor, like the recommendation engine does.
      const p = score.parts;
      if (p.fragility >= 4) return 'Focused work — it’s still shaky and needs rebuilding.';
      if (score.overdueDays && score.overdueDays > 0) return 'Focused work — its review is overdue.';
      if (p.neglected >= 4) return 'Focused work — it’s been neglected for a while.';
      if (p.importance >= 8) return 'Focused work — it matters most right now.';
      return 'Focused work on what needs the most attention.';
    }
  }
}

interface Candidate {
  score: ItemScore;
  bucket: PlanBucket;
}

/**
 * Build a time-budgeted plan for one instrument. Pure and deterministic.
 * Minutes are whole and always sum to `budgetMinutes`.
 */
export function buildSessionPlan(args: BuildPlanArgs): SessionPlan {
  const params = clampSchedulingParams(args.params ?? DEFAULT_SCHEDULING_PARAMS);
  const B = Math.max(MIN_SEGMENT, Math.round(args.budgetMinutes));
  const now = args.now;
  const generatedAt = now.toISOString();

  const items = args.items.filter((i) => i.instrumentId === args.instrumentId);
  const blocks = args.blocks.filter((b) => b.instrumentId === args.instrumentId);
  const blocksByItem = groupBlocksByItem(blocks);
  const scored = scoreItems(items, blocksByItem, now, args.lessonDates);
  const scoreById = new Map(scored.map((s) => [s.item.id, s]));

  if (scored.length === 0) {
    return { instrumentId: args.instrumentId, budgetMinutes: B, segments: [], summary: 'No items for this instrument yet — add one and the plan fills in.', generatedAt };
  }

  // Practised-today items are de-prioritised (excluded from pools) unless they
  // are assigned for the next class. Their titles feed an honest summary line.
  const today = todayISODate(now);
  const practisedToday = new Set(
    blocks.filter((b) => b.startedAt.slice(0, 10) === today).map((b) => b.practiceItemId),
  );
  const skippedTitles = scored
    .filter((s) => practisedToday.has(s.item.id) && !s.item.assignedForLesson)
    .map((s) => s.item.title);

  const available = (s: ItemScore): boolean => !practisedToday.has(s.item.id) || !!s.item.assignedForLesson;

  const stageIds = args.stageItemIds ?? new Set<string>();
  // dueReviews is oldest-due first; keep that order for the review pool.
  const reviewOrder = dueReviews(args.reviews, now)
    .map((r) => scoreById.get(r.practiceItemId))
    .filter((s): s is ItemScore => !!s && available(s));

  const inScore = scored.filter(available);
  const warmupPool = inScore.filter((s) => isWarmupItem(s.item) && (stageIds.size === 0 || stageIds.has(s.item.id)));
  const warmupFallback = inScore.filter((s) => isWarmupItem(s.item));
  const lessonPool = inScore.filter((s) => s.item.assignedForLesson);
  const deepStage = inScore.filter((s) => DEEP_STATUSES.has(s.item.status) && stageIds.has(s.item.id));
  const deepAny = inScore.filter((s) => DEEP_STATUSES.has(s.item.status));
  const deepPool = deepStage.length > 0 ? deepStage : deepAny;
  const cooldownPool = inScore.filter((s) => COOLDOWN_STATUSES.has(s.item.status));

  // If every pool came up empty (e.g. everything already practised today),
  // fall back to the top-scored items so the session is never blank.
  const poolsEmpty =
    warmupPool.length + warmupFallback.length + lessonPool.length + deepPool.length + cooldownPool.length + reviewOrder.length === 0;
  const fallbackPool = poolsEmpty ? scored.slice() : [];

  // ---- choose the segment skeleton (which items, which bucket) -------------
  const used = new Set<string>();
  const skeleton: Candidate[] = [];
  const take = (pool: ItemScore[], bucket: PlanBucket): ItemScore | undefined => {
    const pick = pool.find((s) => !used.has(s.item.id));
    if (pick) {
      used.add(pick.item.id);
      skeleton.push({ score: pick, bucket });
    }
    return pick;
  };

  const wantWarmup = B >= 12;
  const wantCooldown = B >= 20;
  // Rough total-segment target by budget; the deep anchor is always core.
  const totalTarget = B < 12 ? 1 : B < 20 ? 3 : B < 30 ? 4 : B < 45 ? 5 : B < 60 ? 6 : 7;

  if (wantWarmup) take(warmupPool.length ? warmupPool : warmupFallback, 'warmup');
  take(deepPool, 'deep');

  // Fill the middle from the highest-scored unused lesson/review/deep items.
  const midThreshold = totalTarget - (wantCooldown ? 1 : 0);
  const mergedMid: Candidate[] = [
    ...lessonPool.map((s) => ({ score: s, bucket: 'lesson' as PlanBucket })),
    ...reviewOrder.map((s) => ({ score: s, bucket: 'review' as PlanBucket })),
    ...deepAny.map((s) => ({ score: s, bucket: 'deep' as PlanBucket })),
  ];
  // Prefer a bucket label of lesson > review > deep when an item qualifies for
  // several; sort by score, stable by id.
  const bucketRank: Record<PlanBucket, number> = { lesson: 0, review: 1, deep: 2, warmup: 3, cooldown: 4 };
  const seenMid = new Set<string>();
  const midCandidates = mergedMid
    .filter((c) => {
      if (seenMid.has(c.score.item.id)) return false;
      seenMid.add(c.score.item.id);
      return true;
    })
    .sort((a, b) => b.score.total - a.score.total || a.score.item.id.localeCompare(b.score.item.id));
  // Collapse to the strongest bucket label per item.
  const bestBucketForItem = new Map<string, PlanBucket>();
  for (const c of [...mergedMid].sort((a, b) => bucketRank[a.bucket] - bucketRank[b.bucket])) {
    if (!bestBucketForItem.has(c.score.item.id)) bestBucketForItem.set(c.score.item.id, c.bucket);
  }

  for (const c of midCandidates) {
    if (skeleton.length >= midThreshold) break;
    if (used.has(c.score.item.id)) continue;
    used.add(c.score.item.id);
    skeleton.push({ score: c.score, bucket: bestBucketForItem.get(c.score.item.id) ?? c.bucket });
  }

  if (wantCooldown) take(cooldownPool, 'cooldown');

  // Fallback: nothing landed (everything practised / filtered) → top items.
  if (skeleton.length === 0) {
    for (const s of fallbackPool.length ? fallbackPool : scored) {
      if (skeleton.length >= Math.min(totalTarget, Math.max(1, Math.floor(B / MIN_SEGMENT)))) break;
      if (used.has(s.item.id)) continue;
      used.add(s.item.id);
      skeleton.push({ score: s, bucket: DEEP_STATUSES.has(s.item.status) ? 'deep' : 'cooldown' });
    }
  }

  // ---- order: warm-up first, cool-down last, work by priority in between ----
  const order = (c: Candidate): number => (c.bucket === 'warmup' ? 0 : c.bucket === 'cooldown' ? 2 : 1);
  const ordered = skeleton
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const oa = order(a.c);
      const ob = order(b.c);
      if (oa !== ob) return oa - ob;
      if (oa === 1) return b.c.score.total - a.c.score.total || a.c.score.item.id.localeCompare(b.c.score.item.id);
      return a.i - b.i;
    })
    .map(({ c }) => c);

  // ---- allocate minutes so Σ == B ------------------------------------------
  const minutes = allocateMinutes(ordered.map((c) => c.bucket), B, params);

  // ---- mark 2–3 core segments ----------------------------------------------
  const coreIds = new Set<string>();
  const warmupSeg = ordered.find((c) => c.bucket === 'warmup');
  if (warmupSeg) coreIds.add(warmupSeg.score.item.id);
  const deepSeg = ordered.find((c) => c.bucket === 'deep');
  if (deepSeg) coreIds.add(deepSeg.score.item.id);
  const topWork = ordered.find((c) => c.bucket === 'lesson' || c.bucket === 'review');
  if (topWork && coreIds.size < 3) coreIds.add(topWork.score.item.id);

  const segments: PlanSegment[] = ordered.map((c, i) => ({
    itemId: c.score.item.id,
    title: c.score.item.title,
    minutes: minutes[i],
    bucket: c.bucket,
    core: coreIds.has(c.score.item.id),
    mode: defaultModeForStatus(c.score.item.status),
    focus: focusFor(c.score.item),
    reason: planSegmentReason(c.bucket, c.score),
  }));

  return {
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments,
    summary: buildSummary(segments, B, skippedTitles),
    generatedAt,
  };
}

/**
 * Apportion `B` whole minutes across the given buckets so the total is exactly
 * `B`, every segment ≥ MIN_SEGMENT. Deterministic largest-remainder split by
 * bucket weight, a priority-ordered ±1 fix, then review segments are clamped
 * into `[reviewSlotMinMinutes, reviewSlotMaxMinutes]` with the difference
 * moved to/from the other segments by priority.
 */
export function allocateMinutes(buckets: PlanBucket[], budget: number, params?: SchedulingParams): number[] {
  const B = Math.max(MIN_SEGMENT, Math.round(budget));
  let list = buckets.slice();
  if (list.length === 0) return [];
  if (list.length === 1) return [B];

  // Too many segments to give each ≥ MIN_SEGMENT? Drop lowest-priority ones.
  const maxSegments = Math.floor(B / MIN_SEGMENT);
  if (list.length > maxSegments) {
    // Keep by bucket priority; drop cool-down, then warm-up, then trailing work.
    const keepOrder = list
      .map((bucket, i) => ({ bucket, i }))
      .sort((a, b) => BUCKET_PRIORITY.indexOf(a.bucket) - BUCKET_PRIORITY.indexOf(b.bucket) || a.i - b.i)
      .slice(0, maxSegments)
      .map((x) => x.i)
      .sort((a, b) => a - b);
    list = keepOrder.map((i) => buckets[i]);
  }

  const p = clampSchedulingParams(params);
  const weights = list.map((b) => weightFor(b, p));
  const sumW = weights.reduce((a, w) => a + w, 0);
  const alloc = weights.map((w) => Math.max(MIN_SEGMENT, Math.floor((B * w) / sumW)));

  let total = alloc.reduce((a, m) => a + m, 0);
  const byPriority = list
    .map((b, i) => ({ b, i }))
    .sort((a, z) => BUCKET_PRIORITY.indexOf(a.b) - BUCKET_PRIORITY.indexOf(z.b) || a.i - z.i)
    .map((x) => x.i);

  // Hand out any shortfall to the highest-priority segments, cycling.
  let guard = 0;
  while (total < B && guard++ < 10000) {
    for (const i of byPriority) {
      if (total >= B) break;
      alloc[i] += 1;
      total += 1;
    }
  }
  // Trim any overflow from the lowest-priority segments that stay ≥ MIN_SEGMENT.
  const lowestFirst = byPriority.slice().reverse();
  guard = 0;
  while (total > B && guard++ < 10000) {
    let changed = false;
    for (const i of lowestFirst) {
      if (total <= B) break;
      if (alloc[i] > MIN_SEGMENT) {
        alloc[i] -= 1;
        total -= 1;
        changed = true;
      }
    }
    if (!changed) break; // all at floor — 2*n <= B guarantees this can't happen while total>B
  }

  // Keep review segments within the configured slot window (reviewSlotMin/Max
  // — otherwise a two-segment plan can hand a review far more time than a
  // "quick retrieval check" should get). Any minutes taken from a review go to
  // the highest-priority other segment; any minutes a too-small review needs
  // come from the lowest-priority other segment that stays ≥ MIN_SEGMENT. Σ
  // stays exactly B throughout.
  const reviewIdx = list.map((b, i) => (b === 'review' ? i : -1)).filter((i) => i >= 0);
  if (reviewIdx.length > 0) {
    const others = byPriority.filter((i) => list[i] !== 'review');
    const othersLowestFirst = others.slice().reverse();
    for (const i of reviewIdx) {
      const original = alloc[i];
      const desired = Math.min(Math.max(original, p.reviewSlotMinMinutes), p.reviewSlotMaxMinutes);
      const diff = original - desired; // >0: had too much; <0: had too little
      if (diff > 0 && others.length > 0) {
        alloc[i] = desired;
        let give = diff;
        let g = 0;
        while (give > 0 && g++ < 10000) {
          for (const j of others) {
            if (give <= 0) break;
            alloc[j] += 1;
            give -= 1;
          }
        }
      } else if (diff < 0) {
        const need = -diff;
        let taken = 0;
        let g = 0;
        while (taken < need && g++ < 10000) {
          let changed = false;
          for (const j of othersLowestFirst) {
            if (taken >= need) break;
            if (alloc[j] > MIN_SEGMENT) {
              alloc[j] -= 1;
              taken += 1;
              changed = true;
            }
          }
          if (!changed) break;
        }
        // Only credit what was actually fundable — if nothing could be taken
        // from elsewhere (everyone at the floor), the review stays at its
        // original allocation rather than breaking the Σ==B invariant.
        alloc[i] = original + taken;
      }
    }
  }

  return alloc;
}

function weightFor(bucket: PlanBucket, params: SchedulingParams): number {
  // Nudge the base weights toward the user's warm-up / deep shares.
  if (bucket === 'warmup') return BUCKET_WEIGHT.warmup * (params.warmupShare / DEFAULT_SCHEDULING_PARAMS.warmupShare);
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
  let out = `${B} min · ${joinList(parts)}.`;
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
 * Re-spread minutes across the remaining segments after one was removed, so the
 * total stays exactly the original budget. Buckets/items are untouched.
 */
export function redistributePlan(plan: SessionPlan, params?: SchedulingParams): SessionPlan {
  if (plan.segments.length === 0) return plan;
  const minutes = allocateMinutes(plan.segments.map((s) => s.bucket), plan.budgetMinutes, params);
  // allocateMinutes may drop segments if there are too many for the budget;
  // keep only the ones it kept, in order.
  const kept = plan.segments.slice(0, minutes.length);
  const segments = kept.map((s, i) => ({ ...s, minutes: minutes[i] }));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, []) };
}

/**
 * Swap segment `index` for the next-best unused candidate in the same bucket,
 * keeping its minutes. Returns the plan unchanged if there is no alternative.
 */
export function swapSegment(
  plan: SessionPlan,
  index: number,
  args: Omit<BuildPlanArgs, 'budgetMinutes'> & { excludeIds?: Set<string> },
): SessionPlan {
  const target = plan.segments[index];
  if (!target) return plan;

  const items = args.items.filter((i) => i.instrumentId === plan.instrumentId);
  const blocks = args.blocks.filter((b) => b.instrumentId === plan.instrumentId);
  const scored = scoreItems(items, groupBlocksByItem(blocks), args.now, args.lessonDates);
  const scoreById = new Map(scored.map((s) => [s.item.id, s]));

  const inUse = new Set(plan.segments.map((s) => s.itemId));
  const exclude = args.excludeIds ?? new Set<string>();
  const stageIds = args.stageItemIds ?? new Set<string>();
  const dueIds = new Set(dueReviews(args.reviews, args.now).map((r) => r.practiceItemId));

  const eligible = (s: ItemScore): boolean => {
    if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
    switch (target.bucket) {
      case 'warmup':
        return isWarmupItem(s.item);
      case 'lesson':
        return !!s.item.assignedForLesson;
      case 'review':
        return dueIds.has(s.item.id);
      case 'cooldown':
        return COOLDOWN_STATUSES.has(s.item.status);
      case 'deep':
        return DEEP_STATUSES.has(s.item.status) && (stageIds.size === 0 || stageIds.has(s.item.id));
    }
  };

  const pick =
    target.bucket === 'review'
      ? dueReviews(args.reviews, args.now)
          .map((r) => scoreById.get(r.practiceItemId))
          .find((s): s is ItemScore => !!s && eligible(s))
      : scored.find(eligible);
  if (!pick) return plan;

  const replacement: PlanSegment = {
    itemId: pick.item.id,
    title: pick.item.title,
    minutes: target.minutes,
    bucket: target.bucket,
    core: target.core,
    mode: defaultModeForStatus(pick.item.status),
    focus: focusFor(pick.item),
    reason: planSegmentReason(target.bucket, pick),
  };
  const segments = plan.segments.map((s, i) => (i === index ? replacement : s));
  return { ...plan, segments };
}
