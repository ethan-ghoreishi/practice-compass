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
  candidatePool,
  EXPOSURE_WINDOW_DAYS,
  groupBlocksByItem,
  hasDueReview,
  isProactiveCandidate,
  sameWork,
  scoreItems,
  type ItemScore,
} from './scoring';
import { dueReviews } from './selectors';
import { DEFAULT_DURATION_MINUTES, defaultModeForStatus, focusForItem } from './defaults';
import { isWork } from './repertoire';
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
  /**
   * The fewest minutes this segment's material is worth in a multi-segment
   * plan, fixed when it was planned (`segmentFloor`). Optional: a running
   * plan persisted before floors existed has none, reads as
   * MIN_SEGMENT_MINUTES, and still runs.
   */
  floorMinutes?: number;
}

export interface SessionPlan {
  instrumentId: string;
  budgetMinutes: number;
  segments: PlanSegment[];
  summary: string;
  generatedAt: string;
  /**
   * Minutes the owner removed from this preview and has not handed out again.
   * They stay UNUSED until the owner deliberately spreads them or gives them
   * to one entry (`reuseFreedMinutes`), or a Regenerate / new budget rebuilds
   * the allocation — never automatically.
   */
  removedMinutes?: number;
  /**
   * Required class work (`requiredClassWork`) this build could not seat
   * because the floors did not fit the budget. Coverage names them; a start
   * without them is an explicit choice.
   */
  classOmitted?: ID[];
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
  /**
   * The next class's required work (`requiredClassWork(...).itemIds`): seated
   * before every optional role and heuristic whenever its floors fit.
   */
  requiredItemIds?: ID[];
  params?: SchedulingParams;
}

/** Shortest segment worth starting: a drill, a technique, a passage or a part. */
export const MIN_SEGMENT_MINUTES = 2;
/**
 * Shortest segment a whole WORK (`isWork`: a top-level gusheh, a full piece,
 * anything with dastgāh/form/composer) gets in a multi-segment plan — the
 * app's own standard block, never a second number. Same on every instrument.
 */
export const WORK_SEGMENT_MINUTES = DEFAULT_DURATION_MINUTES;
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
 * Theory / listening study gets a turn: a `reading_theory` item not practised
 * for this many local days (or never) is waiting for one.
 */
export const THEORY_TURN_GAP_DAYS = 4;
/**
 * Points a waiting study item gains in the plan's MIDDLE picks only — never
 * the anchor, the warm-up or the cool-down — so it surfaces once urgent work
 * is seated and there is room, and never displaces it. A preference, not a
 * slot: no candidate means no filler.
 */
export const THEORY_TURN_POINTS = 3;

/** Is this study item waiting for a turn? Ordinary blocks are the only evidence. */
export function theoryTurnDue(item: PracticeItem, blocks: PracticeBlock[], now: Date): boolean {
  if (item.strand !== 'reading_theory') return false;
  const since = addDaysBack(todayISODate(now), THEORY_TURN_GAP_DAYS - 1);
  return !blocks.some((b) => b.practiceItemId === item.id && toISODate(new Date(b.startedAt)) >= since);
}

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
 * Is this item suitable as a warm-up? A role, not a label.
 *
 * Two things together: LOW DEMAND (difficulty ≤ 3) and evidence of
 * FAMILIARITY — either a settled status or a real practice history. A brand
 * new, demanding étude tagged "technique" is exactly what a warm-up is not,
 * however the old type/strand test read it. With nothing suitable the planner
 * omits the warm-up honestly rather than promoting the least-bad candidate.
 */
export function isWarmupSuitable(item: PracticeItem): boolean {
  // Study is not playing: it never warms the hands up (nor cools them down).
  if (item.strand === 'reading_theory') return false;
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

/** The floor a segment on this item gets in a multi-segment plan. */
export function segmentFloor(item: PracticeItem): number {
  return isWork(item) ? WORK_SEGMENT_MINUTES : MIN_SEGMENT_MINUTES;
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
  context: { repeat?: boolean; yieldedTo?: string; dueDate?: ISODate; studyTurn?: boolean; classRepeat?: boolean } = {},
): string {
  if (context.repeat) {
    return 'Practised earlier today — chosen again because nothing else eligible is waiting.';
  }
  if (context.studyTurn && bucket === 'deep') {
    return 'Study time — it has not had a turn for a few days, and the urgent work is already in.';
  }
  switch (bucket) {
    case 'warmup':
      return 'Warm up on something you already know before the harder work.';
    case 'lesson': {
      const base =
        score.daysToLesson === 0
          ? `For today’s class (${score.lessonDate}).`
          : `For your class on ${score.lessonDate} — ${plural(score.daysToLesson ?? 0, 'day')} away.`;
      return context.classRepeat ? `${base} Practised earlier today — class work stays in until the class.` : base;
    }
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
      if (score.overdueDays && score.overdueDays > 0) return 'Focused work — its next practice is overdue.';
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
  const { pool, isRepeatPool, practisedToday, classRepeats } = candidatePool(scored, blocks, now);

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
  ): { score: ItemScore; yieldedTo?: string; studyTurn?: boolean } | undefined => {
    // A piece and its own part are one intended work: never both, unless the
    // other carries a review that is due in its own right.
    const open = from.filter(
      (s) =>
        !used.has(s.item.id) &&
        !(selected.some((c) => sameWork(c.score.item, s.item)) && !hasDueReview(s.item, now)),
    );
    if (open.length === 0) return undefined;
    const adjusted = open.map((s) => {
      const dim = itemDimension(s.item);
      let penalty = 0;
      if (applyDiversity) {
        if (selectedDimensions.has(dim)) penalty += DIVERSITY_SAME_SESSION_PENALTY;
        if (recentDimensions.has(dim)) penalty += DIVERSITY_RECENT_DAYS_PENALTY;
        if (theoryTurnDue(s.item, blocks, now)) penalty -= THEORY_TURN_POINTS;
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
    const studyTurn = applyDiversity && theoryTurnDue(best.s.item, blocks, now);
    const yieldedTo = top && top.item.id !== best.s.item.id && !studyTurn ? top.item.title : undefined;
    return { score: best.s, yieldedTo, studyTurn };
  };

  const add = (
    chosen: { score: ItemScore; yieldedTo?: string; studyTurn?: boolean } | undefined,
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
        studyTurn: chosen.studyTurn,
        classRepeat: classRepeats.has(chosen.score.item.id),
      }),
    };
    selected.push(candidate);
    return candidate;
  };

  // ---- 0. the next class's work, RESERVED before anything else -------------
  // Every required item gets a seat at its floor whenever the floors fit,
  // whatever it scored, however much it was practised today, and before any
  // optional role, variety, study turn, anchor preference or segment count.
  // When they cannot all fit, the useful subset is taken in ranking order
  // (each item whose floor still fits), the rest are named as omitted, and the
  // plan holds class work only — never optional padding beside an omission.
  const required = new Set(args.requiredItemIds ?? []);
  const reserved: Candidate[] = [];
  const classOmitted: ID[] = [];
  let room = B;
  for (const s of scored.filter((x) => required.has(x.item.id))) {
    if (segmentFloor(s.item) > room) {
      classOmitted.push(s.item.id);
      continue;
    }
    room -= segmentFloor(s.item);
    reserved.push(add({ score: s }, bucketFor(s))!);
  }
  const partial = classOmitted.length > 0;
  if (partial && reserved.length === 0) {
    return {
      ...empty('Your next class’s work needs a longer session than this — choose more minutes to plan it.'),
      classOmitted,
    };
  }

  // ---- 1. the anchor: the most useful work, before any role decoration ----
  const anchorPick = reserved.length > 0 ? undefined : pick(pool, false);
  const anchor = reserved[0] ?? add(anchorPick, anchorPick ? bucketFor(anchorPick.score) : 'deep', { repeat: isRepeatPool });
  if (!anchor) return empty('Nothing eligible to practise right now.');

  if (!partial && B >= SHORT_SESSION_MINUTES) {
    // ---- 2. warm-up: optional, real minutes, never at the cost of the work --
    // Its minutes are its pinned share and nothing more, so a role whose share
    // is under a material's floor is filled by material that fits it — a
    // whole work warms up only when the share is a standard block — or not at
    // all.
    const warmupMinutes = warmupShareMinutes(B, params);
    if (warmupMinutes >= MIN_SEGMENT_MINUTES && B - warmupMinutes >= MAIN_WORK_FLOOR_MINUTES) {
      // A warm-up never consumes work that is WANTED for itself: an item
      // whose review is due deserves the retrieval slot, and one committed to
      // a class deserves real practice. Spending either as the warm-up would
      // quietly drop the need that made it urgent.
      const warmupPool = pool.filter(
        (s) =>
          isWarmupSuitable(s.item) &&
          !dueById.has(s.item.id) &&
          s.parts.lesson === 0 &&
          segmentFloor(s.item) <= warmupMinutes,
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
    // Its share is its weighted split with it seated; only material whose
    // floor that share reaches may take the role.
    if (wantCooldown && selected.length < target) {
      const share = cooldownShareMinutes(
        B,
        params,
        selected.map((c) => c.bucket),
      );
      add(
        pick(
          pool.filter((s) => COOLDOWN_STATUSES.has(s.item.status) && s.item.strand !== 'reading_theory' && segmentFloor(s.item) <= share),
          false,
        ),
        'cooldown',
        { repeat: isRepeatPool },
      );
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

  // Seating and minutes in one step: a segment stays only while every seated
  // segment can still reach its floor, and the anchor and every reserved
  // class item always stay.
  const minutes = allocateMinutes(
    ordered.map((c) => c.bucket),
    B,
    params,
    ordered.map((c) => segmentFloor(c.score.item)),
    [anchor, ...reserved].map((c) => ordered.indexOf(c)),
  );
  const kept = ordered.filter((_, i) => minutes[i] > 0);
  const keptMinutes = minutes.filter((m) => m > 0);

  const coreIds = new Set<string>([anchor.score.item.id]);
  const warmupSeg = kept.find((c) => c.bucket === 'warmup');
  if (warmupSeg) coreIds.add(warmupSeg.score.item.id);
  const topWork = kept.find((c) => c.bucket === 'lesson' || c.bucket === 'review');
  if (topWork && coreIds.size < 3) coreIds.add(topWork.score.item.id);

  const segments: PlanSegment[] = kept.map((c, i) => ({
    itemId: c.score.item.id,
    title: c.score.item.title,
    minutes: keptMinutes[i],
    bucket: c.bucket,
    core: coreIds.has(c.score.item.id),
    mode: defaultModeForStatus(c.score.item.status),
    focus: focusFor(c.score.item),
    reason: c.reason,
    floorMinutes: segmentFloor(c.score.item),
  }));

  // "Skipping X" is decided from what was ACTUALLY left out. Deriving it
  // before selection is how the fallback used to name an item it went on to
  // choose — a plan describing its own segment as skipped.
  const chosen = new Set(segments.map((s) => s.itemId));
  const skippedTitles = scored
    .filter((s) => practisedToday.has(s.item.id) && !classRepeats.has(s.item.id) && !chosen.has(s.item.id))
    .map((s) => s.item.title);

  return {
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments,
    summary: buildSummary(segments, B, skippedTitles),
    generatedAt,
    ...(partial ? { classOmitted } : {}),
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

/** The warm-up's minutes: its pinned share of the budget, and never more. */
export function warmupShareMinutes(budget: number, params: SchedulingParams): number {
  return Math.min(MAX_SEGMENT_MINUTES, Math.round(budget * clampSchedulingParams(params).warmupShare));
}

/**
 * The cool-down's share: its weighted split of the minutes after the warm-up,
 * computed with it seated beside `others` (every other segment's bucket).
 * The allocator may add one rounding minute to it, never more.
 */
export function cooldownShareMinutes(budget: number, params: SchedulingParams, others: PlanBucket[]): number {
  const p = clampSchedulingParams(params);
  const pool = budget - (others.includes('warmup') ? warmupShareMinutes(budget, p) : 0);
  const rest = [...others.filter((b) => b !== 'warmup' && b !== 'cooldown'), 'cooldown' as const];
  const sumW = rest.reduce((a, b) => a + weightFor(b, p), 0);
  return Math.floor((pool * weightFor('cooldown', p)) / sumW);
}

/**
 * Seat segments and apportion whole minutes, never exceeding `budget`.
 * Returns minutes ALIGNED with `buckets`: a segment the budget cannot seat
 * gets 0, every seated one at least its floor.
 *
 * SEATING. A segment stays only while every seated segment can still reach
 * its floor (`floors`, default MIN_SEGMENT_MINUTES; a whole work's is the
 * standard block): the optional roles go first — cool-down, then warm-up —
 * then the lowest-priority work (the last), never an `anchor` (one index or
 * several — the reserved class work; default: the first that is not an
 * optional role). One seated segment takes the whole
 * budget up to MAX_SEGMENT_MINUTES, floors aside.
 *
 * OPTIONAL ROLES NEVER CARRY OVERFLOW. The warm-up gets exactly its pinned
 * share, `round(B × warmupShare)`; the cool-down its weighted split of what
 * follows plus at most one rounding minute. A role whose share is below its
 * floor is not seated at all.
 *
 * EVERYTHING ELSE splits the rest by bucket weight, then: one rounding pass
 * in priority order; review segments clamped into
 * `[reviewSlotMinMinutes, reviewSlotMaxMinutes]` (never below their floor),
 * their excess going to deep and lesson work; overflow to deep and lesson
 * work, each up to MAX_SEGMENT_MINUTES, and only once all of them are full,
 * to reviews. Anything still left is an honest remainder: an unspent minute
 * beats stretching two items across two hours.
 */
export function allocateMinutes(
  buckets: PlanBucket[],
  budget: number,
  params?: SchedulingParams,
  floors?: number[],
  anchor?: number | number[],
): number[] {
  const B = Math.max(MIN_SEGMENT_MINUTES, Math.round(budget));
  const p = clampSchedulingParams(params);
  const n = buckets.length;
  const alloc: number[] = new Array(n).fill(0);
  if (n === 0) return alloc;
  const floorOf = (i: number) => Math.max(MIN_SEGMENT_MINUTES, floors?.[i] ?? MIN_SEGMENT_MINUTES);
  const optional = (i: number) => buckets[i] === 'warmup' || buckets[i] === 'cooldown';
  const kept = new Set((Array.isArray(anchor) ? anchor : anchor === undefined ? [] : [anchor]).filter((i) => i >= 0 && i < n));
  if (kept.size === 0) kept.add(buckets.findIndex((_, i) => !optional(i)));

  // ---- seating ----------------------------------------------------------------
  const seated = new Set(buckets.map((_, i) => i));
  const fits = (): boolean => {
    if (seated.size <= 1) return true;
    const list = [...seated];
    const wu = list.find((i) => buckets[i] === 'warmup');
    const wuMinutes = wu === undefined ? 0 : warmupShareMinutes(B, p);
    if (wu !== undefined && wuMinutes < floorOf(wu)) return false;
    const cd = list.find((i) => buckets[i] === 'cooldown');
    if (cd !== undefined) {
      const share = cooldownShareMinutes(B, p, list.filter((i) => i !== cd).map((i) => buckets[i]));
      if (share < floorOf(cd)) return false;
    }
    return wuMinutes + list.filter((i) => i !== wu).reduce((a, i) => a + floorOf(i), 0) <= B;
  };
  while (!fits()) {
    const list = [...seated];
    const drop =
      list.find((i) => buckets[i] === 'cooldown') ??
      list.find((i) => buckets[i] === 'warmup') ??
      list.filter((i) => !kept.has(i)).at(-1);
    if (drop === undefined) break;
    seated.delete(drop);
  }
  const live = [...seated];
  if (live.length === 1) {
    alloc[live[0]] = Math.min(B, MAX_SEGMENT_MINUTES);
    return alloc;
  }

  // ---- optional roles: their share, never more --------------------------------
  const warmupIdx = live.find((i) => buckets[i] === 'warmup');
  if (warmupIdx !== undefined) alloc[warmupIdx] = warmupShareMinutes(B, p);
  const rest = live.filter((i) => i !== warmupIdx);
  const pool = B - (warmupIdx === undefined ? 0 : alloc[warmupIdx]);

  const weights = rest.map((i) => weightFor(buckets[i], p));
  const sumW = weights.reduce((a, w) => a + w, 0) || 1;
  const cap = new Map<number, number>();
  rest.forEach((i, k) => {
    const raw = Math.floor((pool * weights[k]) / sumW);
    cap.set(i, buckets[i] === 'cooldown' ? Math.min(MAX_SEGMENT_MINUTES, Math.max(floorOf(i), raw + 1)) : MAX_SEGMENT_MINUTES);
    alloc[i] = Math.min(cap.get(i)!, Math.max(floorOf(i), raw));
  });

  let total = alloc.reduce((a, m) => a + m, 0);
  const byPriority = rest
    .map((i) => ({ b: buckets[i], i }))
    .sort((a, z) => BUCKET_PRIORITY.indexOf(a.b) - BUCKET_PRIORITY.indexOf(z.b) || a.i - z.i)
    .map((x) => x.i);
  const work = byPriority.filter((i) => buckets[i] === 'deep' || buckets[i] === 'lesson');
  const reviews = byPriority.filter((i) => buckets[i] === 'review');

  /** Hand `amount` minutes round-robin to `to`, each up to its cap; returns what nobody could take. */
  const give = (to: number[], amount: number, room: (i: number) => number = (i) => cap.get(i)!): number => {
    let left = amount;
    for (let changed = true; left > 0 && changed; ) {
      changed = false;
      for (const j of to) {
        if (left <= 0) break;
        if (alloc[j] < room(j)) {
          alloc[j] += 1;
          left -= 1;
          changed = true;
        }
      }
    }
    return left;
  };

  // Floors can push the split over the budget: trim the lowest-priority
  // segments back towards their floors (seating guarantees the floors fit).
  const lowestFirst = byPriority.slice().reverse();
  for (let changed = true; total > B && changed; ) {
    changed = false;
    for (const i of lowestFirst) {
      if (total <= B) break;
      if (alloc[i] > floorOf(i)) {
        alloc[i] -= 1;
        total -= 1;
        changed = true;
      }
    }
  }
  // ONE rounding pass, in priority order: the split's own remainder.
  for (const i of byPriority) {
    if (total >= B) break;
    if (alloc[i] < cap.get(i)!) {
      alloc[i] += 1;
      total += 1;
    }
  }

  // Keep review segments within the configured slot window — a retrieval check
  // should not quietly take half the session — but never below a floor: a
  // whole work's review is still a standard block. Excess goes only to deep
  // and lesson work; what they cannot take stays on the review.
  const othersLowestFirst = byPriority.filter((i) => buckets[i] !== 'review').reverse();
  for (const i of reviews) {
    const original = alloc[i];
    const desired = Math.max(floorOf(i), Math.min(Math.max(original, p.reviewSlotMinMinutes), p.reviewSlotMaxMinutes));
    if (original > desired) {
      alloc[i] = desired + give(work, original - desired);
    } else if (original < desired) {
      let taken = 0;
      for (let changed = true; taken < desired - original && changed; ) {
        changed = false;
        for (const j of othersLowestFirst) {
          if (taken >= desired - original) break;
          if (alloc[j] > floorOf(j)) {
            alloc[j] -= 1;
            taken += 1;
            changed = true;
          }
        }
      }
      alloc[i] = original + taken;
    }
  }

  // Overflow: deep and lesson work first, reviews only once that is full.
  // Never a warm-up or a cool-down.
  total = alloc.reduce((a, m) => a + m, 0);
  total = B - give(work, B - total);
  give(reviews, B - total);
  return alloc;
}

function weightFor(bucket: PlanBucket, params: SchedulingParams): number {
  // Warm-up is deliberately absent: its share is a pinned allocation target
  // above, not a weight. Having both was two half-mechanisms for one number,
  // and meant the published share was never the minutes anyone actually got.
  if (bucket === 'deep') return BUCKET_WEIGHT.deep * (params.deepWorkShare / DEFAULT_SCHEDULING_PARAMS.deepWorkShare);
  return BUCKET_WEIGHT[bucket];
}

function buildSummary(segments: PlanSegment[], B: number, skippedTitles: string[], removedMinutes = 0): string {
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
    out +=
      removedMinutes > 0
        ? ` ${B - planned} of your ${B} minutes are unused — removing work leaves its time free until you give it to the rest or Regenerate.`
        : ` ${B - planned} of your ${B} minutes are unplanned — there isn’t more useful work waiting.`;
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
 * Remove one segment from the PREVIEW. The other segments keep their order,
 * minutes, roles and reasons exactly: the freed minutes stay visibly unused,
 * never spread automatically (that would quietly change what each of them
 * asks of you). Handing them out is a separate, explicit preview edit
 * (`reuseFreedMinutes`); Regenerate or a new budget allocates afresh.
 * Records nothing.
 */
export function removePlanSegment(plan: SessionPlan, index: number): SessionPlan {
  const target = plan.segments[index];
  if (!target) return plan;
  const segments = plan.segments.filter((_, i) => i !== index);
  const removedMinutes = (plan.removedMinutes ?? 0) + target.minutes;
  return { ...plan, segments, removedMinutes, summary: buildSummary(segments, plan.budgetMinutes, [], removedMinutes) };
}

/**
 * Move one segment one place earlier (-1) or later (+1) in the PREVIEW. The
 * whole segment moves — item, minutes, role, reason, focus — and nothing else
 * changes: no ranking, budget, review or database. A move off either end is a
 * no-op. Starting runs the segments in exactly this order.
 */
export function movePlanSegment(plan: SessionPlan, index: number, dir: -1 | 1): SessionPlan {
  const to = index + dir;
  if (!plan.segments[index] || to < 0 || to >= plan.segments.length) return plan;
  const segments = [...plan.segments];
  [segments[index], segments[to]] = [segments[to], segments[index]];
  return { ...plan, segments };
}

/**
 * Swap segment `index` for the next-best alternative, keeping its minutes and
 * its role — offered only material whose floor fits those minutes and, in a
 * warm-up or cool-down, that role's share. Uses the SAME eligibility policy, candidate pool and warm-up
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
  const { pool, isRepeatPool, classRepeats } = candidatePool(scored, blocks, args.now);

  const inUse = new Set(plan.segments.map((s) => s.itemId));
  // The build's own rule: a piece and its own part are one intended work, so
  // a swap never brings in a relative of another segment unless its own
  // review is due.
  const kept = items.filter((i) => plan.segments.some((s, j) => j !== index && s.itemId === i.id));
  const exclude = args.excludeIds ?? new Set<string>();
  const dueById = new Map(
    dueReviews(args.reviews, args.now)
      .filter((r) => items.some((i) => i.id === r.practiceItemId))
      .map((r) => [r.practiceItemId, r.dueDate] as const),
  );

  // Only material whose floor fits the slot: a two-minute warm-up is never
  // handed a whole work. An optional role is judged by its SHARE, as the build
  // and the allocator judge it — never by minutes rounding lifted above it.
  // A one-segment plan has no floors.
  const params = args.params ?? DEFAULT_SCHEDULING_PARAMS;
  const others = plan.segments.filter((_, i) => i !== index).map((s) => s.bucket);
  const room =
    target.bucket === 'warmup'
      ? Math.min(target.minutes, warmupShareMinutes(plan.budgetMinutes, params))
      : target.bucket === 'cooldown'
        ? Math.min(target.minutes, cooldownShareMinutes(plan.budgetMinutes, params, others))
        : target.minutes;
  const eligible = (s: ItemScore): boolean => {
    if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
    if (kept.some((k) => sameWork(k, s.item)) && !hasDueReview(s.item, args.now)) return false;
    if (plan.segments.length > 1 && segmentFloor(s.item) > room) return false;
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
        return COOLDOWN_STATUSES.has(s.item.status) && s.item.strand !== 'reading_theory';
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
    reason: planSegmentReason(target.bucket, pick, {
      dueDate: dueById.get(pick.item.id),
      repeat: isRepeatPool,
      classRepeat: classRepeats.has(pick.item.id),
    }),
    floorMinutes: segmentFloor(pick.item),
  };
  const segments = plan.segments.map((s, i) => (i === index ? replacement : s));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, [], plan.removedMinutes) };
}

// --- Freed preview time: an explicit edit, never automatic --------------------

/** Removed minutes not yet handed out — the only time a reuse may spend. */
export function freedMinutes(plan: SessionPlan): number {
  const planned = plan.segments.reduce((n, s) => n + s.minutes, 0);
  return Math.max(0, Math.min(plan.removedMinutes ?? 0, plan.budgetMinutes - planned));
}

/**
 * How many more minutes segment `index` may take from freed time — the
 * allocator's own ceilings: work and reviews up to MAX_SEGMENT_MINUTES, a
 * warm-up up to its pinned share, a cool-down up to its split plus the one
 * rounding minute.
 */
export function freedRoom(plan: SessionPlan, index: number, params?: SchedulingParams): number {
  const seg = plan.segments[index];
  if (!seg) return 0;
  const p = clampSchedulingParams(params ?? DEFAULT_SCHEDULING_PARAMS);
  const B = plan.budgetMinutes;
  const others = plan.segments.filter((_, i) => i !== index).map((s) => s.bucket);
  const cap =
    seg.bucket === 'warmup'
      ? warmupShareMinutes(B, p)
      : seg.bucket === 'cooldown'
        ? Math.min(MAX_SEGMENT_MINUTES, Math.max(seg.floorMinutes ?? MIN_SEGMENT_MINUTES, cooldownShareMinutes(B, p, others) + 1))
        : MAX_SEGMENT_MINUTES;
  return Math.max(0, cap - seg.minutes);
}

/**
 * Give the preview's freed minutes back, deliberately: `'spread'` hands them
 * one at a time, in the plan's own order, to the work segments (focus and
 * class) and only then to reviews — never to a warm-up or cool-down, which
 * never carry overflow — while `index` gives them to that one entry. Each
 * recipient stops at its `freedRoom`; whatever nobody can take stays unused.
 * Order, identity, roles and reasons never change, nothing is regenerated,
 * and only time still freed can be spent, once.
 */
export function reuseFreedMinutes(plan: SessionPlan, to: 'spread' | number, params?: SchedulingParams): SessionPlan {
  const freed = freedMinutes(plan);
  if (freed === 0) return plan;
  const minutes = plan.segments.map((s) => s.minutes);
  const room = plan.segments.map((_, i) => freedRoom(plan, i, params));
  let left = freed;
  const give = (to: number[]) => {
    for (let changed = true; left > 0 && changed; ) {
      changed = false;
      for (const i of to) {
        if (left > 0 && room[i] > 0) {
          minutes[i] += 1;
          room[i] -= 1;
          left -= 1;
          changed = true;
        }
      }
    }
  };
  const all = plan.segments.map((_, i) => i);
  if (to === 'spread') {
    give(all.filter((i) => plan.segments[i].bucket === 'deep' || plan.segments[i].bucket === 'lesson'));
    give(all.filter((i) => plan.segments[i].bucket === 'review'));
  } else if (plan.segments[to]) {
    give([to]);
  }
  if (left === freed) return plan;
  const segments = plan.segments.map((s, i) => (minutes[i] === s.minutes ? s : { ...s, minutes: minutes[i] }));
  const removedMinutes = (plan.removedMinutes ?? 0) - (freed - left);
  return { ...plan, segments, removedMinutes, summary: buildSummary(segments, plan.budgetMinutes, [], removedMinutes) };
}

// --- Class coverage: what the next class asked for, against THIS preview ----

export interface ClassCoverageEntry {
  itemId: ID;
  title: string;
  floorMinutes: number;
}

export interface ClassCoverage {
  /** The class date the required work is for. */
  date?: ISODate;
  required: ClassCoverageEntry[];
  /** Required items the preview seats. */
  seated: ID[];
  /** Required items it does not: left out for capacity, or by the owner's own remove/swap. */
  omitted: (ClassCoverageEntry & { why: 'capacity' | 'edited' })[];
  /** Prepared but resting — never seated, said instead. */
  resting: { itemId: ID; title: string }[];
  /** The fewest minutes in which every required item reaches its floor. */
  minimumMinutes: number;
  /** Binds a partial-start choice to exactly this budget, subset and omission set. */
  key: string;
}

/**
 * Derived from the preview AS IT STANDS — after any remove or swap — against
 * the live required set, never stored: a manual edit shows as an omission,
 * never silently repaired and never silently counted as covered.
 */
export function planClassCoverage(
  plan: SessionPlan,
  required: { date?: ISODate; itemIds: ID[]; restingItemIds: ID[] },
  items: PracticeItem[],
  /** The data revision and local day the preview was built for: a choice made on another basis is stale. */
  basis = '',
): ClassCoverage {
  const byId = new Map(items.map((i) => [i.id, i]));
  const entries = required.itemIds
    .map((id) => byId.get(id))
    .filter((i): i is PracticeItem => !!i)
    .map((i) => ({ itemId: i.id, title: i.title, floorMinutes: segmentFloor(i) }));
  const inPlan = new Set(plan.segments.map((s) => s.itemId));
  const capacity = new Set(plan.classOmitted ?? []);
  const seated = entries.filter((e) => inPlan.has(e.itemId)).map((e) => e.itemId);
  const omitted = entries
    .filter((e) => !inPlan.has(e.itemId))
    .map((e) => ({ ...e, why: capacity.has(e.itemId) ? ('capacity' as const) : ('edited' as const) }));
  return {
    date: required.date,
    required: entries,
    seated,
    omitted,
    resting: required.restingItemIds.map((id) => byId.get(id)).filter((i): i is PracticeItem => !!i).map((i) => ({ itemId: i.id, title: i.title })),
    minimumMinutes: Math.max(MIN_BUDGET_MINUTES, entries.reduce((n, e) => n + e.floorMinutes, 0)),
    key: [basis, plan.budgetMinutes, seated.join(','), omitted.map((o) => o.itemId).join(',')].join('|'),
  };
}

/**
 * Why Start must refuse, or null. A preview with required class work left out
 * starts only through a choice made against THIS coverage (`acceptedKey`, the
 * key the owner's partial-start tap carried); a coverage that has moved since
 * — a changed lesson, a new commitment, another remove — refuses it.
 */
export function planStartRefusal(
  plan: SessionPlan,
  coverage: ClassCoverage,
  acceptedKey?: string,
): 'empty' | 'partial' | null {
  if (plan.segments.length === 0) return 'empty';
  if (coverage.omitted.length > 0 && acceptedKey !== coverage.key) return 'partial';
  return null;
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
  /** Minutes actually saved for this segment's block — set only when done. */
  actualMinutes?: number;
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
export function completePlanSegment(run: PlanRun, itemId: string, actualMinutes?: number): PlanRun {
  const seg = run.segments[run.pointer];
  if (!seg || seg.itemId !== itemId || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) =>
    i === run.pointer ? { ...s, status: 'done' as const, ...(actualMinutes !== undefined ? { actualMinutes } : {}) } : s,
  );
  return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
}

/**
 * Skip a still-PENDING segment — the current one, or (`index`) any later one
 * removed from this run. Records nothing: a skipped segment is not practice,
 * and the other segments keep their minutes. A done segment, and its saved
 * block, are never touched.
 */
export function skipPlanSegment(run: PlanRun, index = run.pointer): PlanRun {
  const seg = run.segments[index];
  if (!seg || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) => (i === index ? { ...s, status: 'skipped' as const } : s));
  return { ...run, segments, pointer: index === run.pointer ? advancePlanPointer(segments, run.pointer) : run.pointer };
}

/**
 * The run's time, each figure on its own: `available` is the budget chosen,
 * `planned` what the segments still standing ask for (a done one: what it
 * actually took, up to its target), `remaining` what the pending ones ask
 * for, `unused` what nothing asks for (removed, skipped, finished early or
 * never planned), `recorded` what was actually saved. Recorded is never
 * inferred from a target, and overtime never borrows another segment's.
 */
export function planRunTime(run: PlanRun): { available: number; planned: number; remaining: number; unused: number; recorded: number } {
  const remaining = run.segments.filter((s) => s.status === 'pending').reduce((n, s) => n + s.minutes, 0);
  // A done segment from before `actualMinutes` was kept occupies its target: nothing is claimed freed.
  const taken = run.segments
    .filter((s) => s.status === 'done')
    .reduce((n, s) => n + Math.min(s.minutes, s.actualMinutes ?? s.minutes), 0);
  const planned = remaining + taken;
  return {
    available: run.budgetMinutes,
    planned,
    remaining,
    unused: Math.max(0, run.budgetMinutes - planned),
    recorded: run.segments.reduce((n, s) => n + (s.status === 'done' ? (s.actualMinutes ?? 0) : 0), 0),
  };
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
