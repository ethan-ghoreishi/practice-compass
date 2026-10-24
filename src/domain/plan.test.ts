import { describe, expect, it } from 'vitest';
import {
  advancePlanPointer,
  allocateMinutes,
  buildSessionPlan,
  completePlanSegment,
  isWarmupSuitable,
  MAX_BUDGET_MINUTES,
  MAX_SEGMENT_MINUTES,
  MIN_BUDGET_MINUTES,
  MIN_SEGMENT_MINUTES,
  planPreviewDayHasPassed,
  planSegmentStartable,
  removePlanSegment,
  skipPlanSegment,
  swapSegment,
  validateBudgetMinutes,
  type BuildPlanArgs,
  type PlanRun,
  type SessionPlan,
} from './plan';
import { DEFAULT_SCHEDULING_PARAMS } from './scheduling';
import { createItem, createBlock, createReview } from './factories';
import { addDays, toISODate } from './util';
import type { ID, ISODate, ItemStatus, ItemType, PracticeBlock, PracticeItem, Review } from './types';

const NOW = new Date('2026-07-18T09:00:00.000Z');
const INST = 'setar';
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

let seq = 0;
function it_(o: Partial<PracticeItem> & { status?: ItemStatus; itemType?: ItemType } = {}): PracticeItem {
  const base = createItem(
    {
      instrumentId: o.instrumentId ?? INST,
      title: o.title ?? `item-${seq++}`,
      status: o.status ?? 'new',
      itemType: o.itemType ?? 'other',
      importance: o.importance ?? 3,
      difficulty: o.difficulty ?? 3,
    },
    NOW,
  );
  return { ...base, ...o };
}

function block(itemId: string, startedAt: string, durationMinutes = 10): PracticeBlock {
  return createBlock(
    { practiceItemId: itemId, instrumentId: INST, durationMinutes, mode: 'learn', focus: 'other', startedAt },
    NOW,
  );
}

function baseArgs(over: Partial<BuildPlanArgs> = {}): BuildPlanArgs {
  return {
    instrumentId: INST,
    budgetMinutes: 30,
    now: NOW,
    items: [],
    blocks: [],
    reviews: [],
    ...over,
  };
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const prep = (itemId: ID, date: ISODate) => new Map<ID, ISODate>([[itemId, date]]);

// ---------------------------------------------------------------------------
// ac-7 — B2/B4
// ---------------------------------------------------------------------------

describe('the anchor comes from real urgency, before any role decoration', () => {
  it('short sessions choose the most useful anchor before optional roles', () => {
    // A brand-new demanding piece scores well on its own; an ordinary usable
    // item committed to TOMORROW's class scores higher once its commitment
    // counts. The planner used to pre-select the deep-work one regardless.
    const newDeep = it_({ id: 'deep', title: 'new étude', status: 'new', importance: 4, difficulty: 5 });
    const forClass = it_({ id: 'class', title: 'gushe for class', status: 'usable', importance: 3, difficulty: 2 });
    const dates = prep('class', day(1));

    for (const budgetMinutes of [5, 10]) {
      const plan = buildSessionPlan(
        baseArgs({ items: [newDeep, forClass], budgetMinutes, preparationDates: dates }),
      );
      expect(plan.segments, `budget ${budgetMinutes}`).toHaveLength(1);
      expect(plan.segments[0].itemId, `budget ${budgetMinutes}`).toBe('class');
      expect(plan.segments[0].bucket, `budget ${budgetMinutes}`).toBe('lesson');
      expect(plan.segments[0].minutes, `budget ${budgetMinutes}`).toBe(budgetMinutes);
      expect(plan.segments[0].reason).toContain(day(1));
    }

    // Without the commitment the same two items rank the other way round —
    // so the change is the commitment, not a hard-coded preference.
    const noCommitment = buildSessionPlan(baseArgs({ items: [newDeep, forClass], budgetMinutes: 5 }));
    expect(noCommitment.segments[0].itemId).toBe('deep');

    // Ordinary useful material that fits no old bucket is still eligible and
    // still gets the budget — no fabricated mastery, no category requirement.
    for (const itemType of ['improvisation', 'other', 'technique'] as ItemType[]) {
      const ordinary = it_({ id: `ord-${itemType}`, title: itemType, status: 'usable', itemType });
      const plan = buildSessionPlan(baseArgs({ items: [ordinary], budgetMinutes: 10 }));
      expect(plan.segments.map((s) => s.itemId), itemType).toEqual([`ord-${itemType}`]);
      expect(plan.segments[0].minutes, itemType).toBe(10);
    }

    // A candidate belonging to another instrument never enters the plan.
    const foreign = it_({ id: 'foreign', title: 'guitar work', instrumentId: 'guitar', importance: 5 });
    const scoped = buildSessionPlan(baseArgs({ items: [foreign, forClass], budgetMinutes: 30 }));
    expect(scoped.segments.map((s) => s.itemId)).not.toContain('foreign');
  });
});

// ---------------------------------------------------------------------------
// ac-8 — B1/B2
// ---------------------------------------------------------------------------

describe('warm-up is a role ordinary familiar material fills', () => {
  it('warm up uses familiar existing material within the chosen budget', () => {
    const familiarRadif = it_({
      id: 'radif',
      title: 'familiar darāmad',
      status: 'usable',
      difficulty: 2,
      strand: 'radif',
      timesPractised: 12,
    });
    const familiarTechnique = it_({
      id: 'tech',
      title: 'known mezrāb drill',
      status: 'maintenance',
      difficulty: 2,
      itemType: 'technique',
      timesPractised: 30,
    });
    const unfamiliarDemanding = it_({
      id: 'hard',
      title: 'new demanding exercise',
      status: 'new',
      difficulty: 5,
      itemType: 'exercise',
      timesPractised: 0,
    });
    const mainWork = it_({ id: 'main', title: 'the real work', status: 'fragile', importance: 5, difficulty: 4 });

    // Suitability is low demand PLUS evidence of familiarity — a "technique"
    // label is not evidence of either.
    expect(isWarmupSuitable(familiarRadif)).toBe(true);
    expect(isWarmupSuitable(familiarTechnique)).toBe(true);
    expect(isWarmupSuitable(unfamiliarDemanding)).toBe(false);

    const pool = [familiarRadif, familiarTechnique, unfamiliarDemanding, mainWork];
    const share = DEFAULT_SCHEDULING_PARAMS.warmupShare;

    for (const budgetMinutes of [5, 10, 12, 15, 20, 45, 60, 120]) {
      const plan = buildSessionPlan(baseArgs({ items: pool, budgetMinutes }));
      const total = sum(plan.segments.map((s) => s.minutes));
      const warmups = plan.segments.filter((s) => s.bucket === 'warmup');
      const label = `budget ${budgetMinutes}`;

      expect(total, label).toBeLessThanOrEqual(budgetMinutes);
      expect(plan.segments.every((s) => s.minutes >= MIN_SEGMENT_MINUTES), label).toBe(true);
      expect(plan.segments.every((s) => s.minutes <= MAX_SEGMENT_MINUTES), label).toBe(true);
      expect(new Set(plan.segments.map((s) => s.itemId)).size, label).toBe(plan.segments.length);

      if (budgetMinutes < 12 || Math.round(budgetMinutes * share) < MIN_SEGMENT_MINUTES) {
        // No warm-up: under 12 minutes the session is one useful main focus,
        // and a share that rounds below the shortest segment worth starting
        // (12 × 0.12 rounds to 1) is no warm-up — never one stretched past
        // its share.
        expect(warmups, label).toHaveLength(0);
        if (budgetMinutes < 12) expect(plan.segments, label).toHaveLength(1);
      } else {
        expect(warmups, label).toHaveLength(1);
        // It is FIRST, it is a familiar candidate, and its bounded share is
        // real minutes rather than a weight nobody can check.
        expect(plan.segments[0].bucket, label).toBe('warmup');
        expect(['radif', 'tech'], label).toContain(plan.segments[0].itemId);
        // Exactly the configured share — never more.
        expect(plan.segments[0].minutes, label).toBe(Math.round(budgetMinutes * share));
        // Useful main work survives it.
        const main = total - plan.segments[0].minutes;
        expect(main, label).toBeGreaterThanOrEqual(5);
      }
    }

    // With no SUITABLE candidate the warm-up is omitted honestly rather than
    // handed to the least-bad item.
    const noneSuitable = buildSessionPlan(baseArgs({ items: [unfamiliarDemanding, mainWork], budgetMinutes: 45 }));
    expect(noneSuitable.segments.some((s) => s.bucket === 'warmup')).toBe(false);
    expect(noneSuitable.segments.length).toBeGreaterThan(0);

    // Invalid budgets are rejected cleanly at the boundary.
    for (const bad of [NaN, Infinity, 0, -10, 4, 121, '30' as unknown as number]) {
      expect(validateBudgetMinutes(bad), String(bad)).toBeNull();
      expect(() => buildSessionPlan(baseArgs({ items: pool, budgetMinutes: bad })), String(bad)).toThrow(
        /whole number of minutes/,
      );
    }
    expect(validateBudgetMinutes(MIN_BUDGET_MINUTES)).toBe(MIN_BUDGET_MINUTES);
    expect(validateBudgetMinutes(MAX_BUDGET_MINUTES)).toBe(MAX_BUDGET_MINUTES);
    expect(validateBudgetMinutes(19.6)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// ac-9 — B4/B5/B6
// ---------------------------------------------------------------------------

describe('variety follows real exposure, never a quota', () => {
  it('session variety responds to exposure without quotas or losing urgent work', () => {
    // A fixed multi-day fixture: lesson work, due maintenance, and material
    // with and without musical metadata.
    const lessonWork = it_({ id: 'lesson', title: 'committed piece', status: 'usable', strand: 'radif', importance: 4 });
    // Deliberately as important as the committed work, and genuinely due: the
    // question is whether sustained drilling of the committed item can bury an
    // equally useful need indefinitely.
    const dueMaintenance = it_({
      id: 'maint',
      title: 'solid piece, due',
      status: 'maintenance',
      strand: 'repertoire',
      importance: 4,
      nextReviewDate: day(-1),
    });
    const freshTechnique = it_({ id: 'fresh', title: 'fresh technique', status: 'usable', strand: 'mezrab', importance: 3 });
    const noMetadata = it_({ id: 'bare', title: 'no strand at all', status: 'usable', importance: 3 });
    const items = [lessonWork, dueMaintenance, freshTechnique, noMetadata];
    const reviews: Review[] = [
      createReview({ practiceItemId: 'maint', dueDate: day(-1), reviewType: 'maintenance' }, NOW),
    ];
    const dates = prep('lesson', day(2));

    // DAY 0 — nothing practised yet: the urgent committed work is chosen.
    const day0 = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: [] }),
    );
    // The ANCHOR — the first segment that is real work rather than a warm-up.
    const anchorOf = (p: SessionPlan) => p.segments.find((s) => s.bucket !== 'warmup')!.itemId;
    expect(anchorOf(day0)).toBe('lesson');
    expect(day0.summary).not.toContain('Skipping');

    // DAYS -3..-1 — the committed item has been drilled hard every day.
    const heavy = [
      block('lesson', addDays(NOW, -1).toISOString(), 40),
      block('lesson', addDays(NOW, -2).toISOString(), 40),
      block('lesson', addDays(NOW, -3).toISOString(), 40),
    ];
    const afterHeavy = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: heavy }),
    );
    // Urgent work is NOT lost — it is still in the session…
    expect(afterHeavy.segments.map((s) => s.itemId)).toContain('lesson');
    // …but maintenance is now reachable rather than permanently crowded out.
    expect(afterHeavy.segments.map((s) => s.itemId)).toContain('maint');
    // Bounded: repeated exposure eventually costs it the anchor position.
    expect(anchorOf(afterHeavy)).not.toBe('lesson');

    // Recently exposed material yields to comparably useful fresh work.
    const exposedFresh = [...heavy, block('fresh', addDays(NOW, -1).toISOString(), 40)];
    const yielded = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: exposedFresh }),
    );
    const freshIdx = yielded.segments.findIndex((s) => s.itemId === 'fresh');
    const bareIdx = yielded.segments.findIndex((s) => s.itemId === 'bare');
    expect(bareIdx).toBeGreaterThanOrEqual(0); // missing metadata still yields a useful plan
    if (freshIdx >= 0) expect(bareIdx).toBeLessThan(freshIdx);

    // No category is filled artificially: with only two eligible items there
    // are at most two segments, whatever the budget wants.
    const twoOnly = buildSessionPlan(baseArgs({ items: [lessonWork, noMetadata], budgetMinutes: 60 }));
    expect(twoOnly.segments).toHaveLength(2);
    expect(new Set(twoOnly.segments.map((s) => s.itemId)).size).toBe(2);

    // DETERMINISM: permuting the storage arrays changes nothing at all.
    const permutations: PracticeItem[][] = [
      items,
      [...items].reverse(),
      [items[2], items[0], items[3], items[1]],
    ];
    const reference = JSON.stringify(
      buildSessionPlan(baseArgs({ items, reviews, preparationDates: dates, blocks: heavy })).segments,
    );
    for (const perm of permutations) {
      const again = buildSessionPlan(
        baseArgs({ items: perm, reviews, preparationDates: dates, blocks: [...heavy].reverse() }),
      );
      expect(JSON.stringify(again.segments)).toBe(reference);
    }
  });
});

// ---------------------------------------------------------------------------
// ac-10 — B2/B3/B7
// ---------------------------------------------------------------------------

describe('building, swapping and redistributing keep identity and honest reasons', () => {
  it('build swap and redistribution preserve candidate identity and honest reasons', () => {
    const resting = it_({ id: 'resting', title: 'resting', status: 'dormant', importance: 5, difficulty: 5 });
    const foreign = it_({ id: 'foreign', title: 'guitar', instrumentId: 'guitar', importance: 5 });
    const a = it_({ id: 'a', title: 'A', status: 'fragile', importance: 5, strand: 'radif' });
    const b = it_({ id: 'b', title: 'B', status: 'usable', importance: 4, strand: 'repertoire', timesPractised: 8, difficulty: 2 });
    const c = it_({ id: 'c', title: 'C', status: 'integrated', importance: 3, strand: 'technique', timesPractised: 9, difficulty: 2 });
    const d = it_({ id: 'd', title: 'D', status: 'usable', importance: 3, strand: 'rhythm', nextReviewDate: day(-2) });
    const items = [resting, foreign, a, b, c, d];
    const reviews = [createReview({ practiceItemId: 'd', dueDate: day(-2), reviewType: 'retention' }, NOW)];
    const args = baseArgs({ items, reviews, budgetMinutes: 45 });

    const plan = buildSessionPlan(args);
    const ids = plan.segments.map((s) => s.itemId);
    expect(ids).not.toContain('resting');
    expect(ids).not.toContain('foreign');
    expect(new Set(ids).size).toBe(ids.length);
    expect(sum(plan.segments.map((s) => s.minutes))).toBeLessThanOrEqual(45);
    expect(plan.segments.every((s) => s.minutes >= MIN_SEGMENT_MINUTES)).toBe(true);

    // Reasons name the ACTUAL decisive fact.
    const review = plan.segments.find((s) => s.bucket === 'review');
    if (review) expect(review.reason).toContain(day(-2));

    // SWAP keeps the role and the minutes, and can never reach excluded work.
    const idx = plan.segments.findIndex((s) => s.bucket === 'deep');
    if (idx >= 0) {
      const swapped = swapSegment(plan, idx, { ...args, excludeIds: new Set(plan.segments.map((s) => s.itemId)) });
      const seg = swapped.segments[idx];
      expect(seg.minutes).toBe(plan.segments[idx].minutes);
      expect(seg.bucket).toBe(plan.segments[idx].bucket);
      expect(['resting', 'foreign']).not.toContain(seg.itemId);
      expect(new Set(swapped.segments.map((s) => s.itemId)).size).toBe(swapped.segments.length);
      // The reason travelled with the item it describes.
      if (seg.itemId !== plan.segments[idx].itemId) {
        expect(seg.reason).not.toBe(plan.segments[idx].reason);
      }
    }

    // SWAP shares the build's OWN practised-today exclusion — it must never
    // hand back material the build itself set aside while a fresher, equally
    // eligible candidate is available. Three usable same-instrument items
    // ranked by importance (5/4/3); the middle one was practised one minute
    // ago today.
    const hi = it_({ id: 'hi', title: 'Hi', status: 'usable', importance: 5 });
    const mid = it_({ id: 'mid', title: 'Mid', status: 'usable', importance: 4 });
    const lo = it_({ id: 'lo', title: 'Lo', status: 'usable', importance: 3 });
    const practisedMid = [block('mid', NOW.toISOString())];
    const shortArgs = baseArgs({ items: [hi, mid, lo], blocks: practisedMid, budgetMinutes: 5 });
    const shortPlan = buildSessionPlan(shortArgs);
    expect(shortPlan.segments.map((s) => s.itemId)).toEqual(['hi']); // mid stepped aside, not chosen
    const shortSwap = swapSegment(shortPlan, 0, shortArgs);
    // Fresh 'lo' is available — the swap must reach it, never the
    // already-practised 'mid', even though 'mid' outranks 'lo' on score alone.
    expect(shortSwap.segments[0].itemId).toBe('lo');
    expect(shortSwap.segments[0].reason).not.toContain('Practised earlier today');

    // A warm-up swap uses the SAME exclusions as the build's own warm-up
    // pool: a candidate that is due for review, or committed to a class,
    // deserves that slot — never spent as a warm-up — even though it is
    // otherwise `isWarmupSuitable`.
    const dueWarm = it_({ id: 'due-warm', title: 'DueWarm', status: 'usable', difficulty: 2, timesPractised: 5 });
    const freshWarm = it_({ id: 'fresh-warm', title: 'FreshWarm', status: 'usable', difficulty: 2, timesPractised: 5 });
    expect(isWarmupSuitable(dueWarm)).toBe(true);
    expect(isWarmupSuitable(freshWarm)).toBe(true);
    const warmupReviews = [createReview({ practiceItemId: 'due-warm', dueDate: day(-1), reviewType: 'retention' }, NOW)];
    const warmupPlan: SessionPlan = {
      instrumentId: INST,
      budgetMinutes: 20,
      segments: [
        { itemId: 'placeholder', title: 'placeholder', minutes: 5, bucket: 'warmup', core: false, mode: 'learn', focus: 'tone', reason: 'x' },
      ],
      summary: '',
      generatedAt: NOW.toISOString(),
    };
    const warmArgs = baseArgs({ items: [dueWarm, freshWarm], reviews: warmupReviews, budgetMinutes: 20 });
    const swappedWarm = swapSegment(warmupPlan, 0, warmArgs);
    expect(swappedWarm.segments[0].itemId).toBe('fresh-warm'); // never the due one
    const onlyDue = swapSegment(warmupPlan, 0, { ...warmArgs, items: [dueWarm] });
    expect(onlyDue.segments[0].itemId).toBe('placeholder'); // no eligible candidate at all: no swap

    // REGENERATE is the same function with the same inputs: same answer.
    expect(JSON.stringify(buildSessionPlan(args).segments)).toBe(JSON.stringify(plan.segments));

    // REMOVE: the rest keep exactly what they had — item, role, reason AND
    // minutes — and the freed minutes stay unused, said so in the summary.
    const trimmed = removePlanSegment(plan, 0);
    expect(trimmed.segments).toEqual(plan.segments.slice(1));
    expect(trimmed.removedMinutes).toBe(plan.segments[0].minutes);
    expect(trimmed.summary).toContain('unused');
    const emptied = plan.segments.reduce((p) => removePlanSegment(p, 0), plan);
    expect(emptied.segments).toEqual([]);
    expect(removePlanSegment(plan, 99)).toBe(plan);

    // ALL-PRACTISED fallback: an item chosen is never described as skipped.
    const practisedToday = items
      .filter((i) => ['a', 'b', 'c', 'd'].includes(i.id))
      .map((i) => block(i.id, NOW.toISOString()));
    const fallback = buildSessionPlan(baseArgs({ items, reviews, blocks: practisedToday, budgetMinutes: 30 }));
    expect(fallback.segments.length).toBeGreaterThan(0);
    for (const seg of fallback.segments) {
      expect(fallback.summary).not.toContain(`Skipping ${seg.title}`);
      expect(seg.reason).toContain('Practised earlier today');
    }

    // A budget too large for the eligible work leaves an HONEST remainder.
    const sparse = buildSessionPlan(baseArgs({ items: [a, b], budgetMinutes: 120 }));
    expect(sum(sparse.segments.map((s) => s.minutes))).toBeLessThan(120);
    expect(sparse.summary).toContain('unplanned');

    // …and a budget the work can fill is filled.
    const full = buildSessionPlan(baseArgs({ items, reviews, budgetMinutes: 30 }));
    expect(sum(full.segments.map((s) => s.minutes))).toBe(30);
  });
});

describe('allocateMinutes', () => {
  it('never exceeds the budget and respects both segment bounds', () => {
    for (const budget of [5, 12, 20, 30, 45, 60, 120]) {
      for (const buckets of [
        ['deep'] as const,
        ['warmup', 'deep'] as const,
        ['warmup', 'lesson', 'review', 'deep', 'cooldown'] as const,
      ]) {
        const alloc = allocateMinutes([...buckets], budget);
        const label = `${budget} · ${buckets.join('/')}`;
        const seated = alloc.filter((m) => m > 0);
        expect(alloc, label).toHaveLength(buckets.length);
        expect(sum(alloc), label).toBeLessThanOrEqual(budget);
        expect(seated.length, label).toBeGreaterThan(0);
        expect(seated.every((m) => m >= MIN_SEGMENT_MINUTES), label).toBe(true);
        expect(seated.every((m) => m <= MAX_SEGMENT_MINUTES), label).toBe(true);
      }
    }
  });

  it('pins the warm-up to its configured share', () => {
    for (const budget of [12, 15, 20, 45, 60]) {
      const alloc = allocateMinutes(['warmup', 'deep', 'review'], budget);
      const share = Math.round(budget * DEFAULT_SCHEDULING_PARAMS.warmupShare);
      // Exactly its share — or, when that rounds below a drill's floor, not seated.
      expect(alloc[0], `budget ${budget}`).toBe(share >= MIN_SEGMENT_MINUTES ? share : 0);
    }
    const wide = allocateMinutes(['warmup', 'deep'], 60, { ...DEFAULT_SCHEDULING_PARAMS, warmupShare: 0.15 });
    expect(wide[0]).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// ac-11 — B7
// ---------------------------------------------------------------------------

describe('a running plan keeps its progress and refuses stale work', () => {
  it('plan transitions preserve progress and refuse stale cross instrument starts', () => {
    const one = it_({ id: 'one', title: 'first' });
    const two = it_({ id: 'two', title: 'second' });
    const three = it_({ id: 'three', title: 'third' });
    const plan: SessionPlan = buildSessionPlan(baseArgs({ items: [one, two, three], budgetMinutes: 45 }));
    const run: PlanRun = {
      instrumentId: INST,
      budgetMinutes: plan.budgetMinutes,
      startedAt: NOW.toISOString(),
      pointer: 0,
      segments: plan.segments.map((s) => ({ ...s, status: 'pending' as const })),
    };

    // Close the first segment: done, pointer advances, nothing else touched.
    const afterFirst = completePlanSegment(run, run.segments[0].itemId);
    expect(afterFirst.segments[0].status).toBe('done');
    expect(afterFirst.pointer).toBe(1);
    expect(afterFirst.segments.slice(1).every((s) => s.status === 'pending')).toBe(true);

    // Closing a block for something OFF the plan changes nothing.
    expect(completePlanSegment(afterFirst, 'not-in-plan')).toBe(afterFirst);

    // Skip the second: recorded as skipped, never as practice.
    const afterSkip = skipPlanSegment(afterFirst);
    expect(afterSkip.segments[1].status).toBe('skipped');
    expect(afterSkip.pointer).toBe(2);

    // Rehydrating that partially-done run preserves both.
    const rehydrated: PlanRun = JSON.parse(JSON.stringify(afterSkip));
    expect(rehydrated.segments.map((s) => s.status)).toEqual(['done', 'skipped', 'pending']);
    expect(planSegmentStartable(rehydrated, [one, two, three])).toMatchObject({ ok: true });

    // A pending item that was DELETED or MOVED to another instrument cannot
    // be played — it is visibly skipped instead, never under the wrong
    // instrument.
    const currentId = rehydrated.segments[rehydrated.pointer].itemId;
    const deleted = [one, two, three].filter((i) => i.id !== currentId);
    expect(planSegmentStartable(rehydrated, deleted)).toEqual({ ok: false, reason: 'deleted' });
    const moved = [one, two, three].map((i) => (i.id === currentId ? { ...i, instrumentId: 'guitar' } : i));
    expect(planSegmentStartable(rehydrated, moved)).toEqual({ ok: false, reason: 'moved' });
    const afterInvalid = skipPlanSegment(rehydrated);
    expect(afterInvalid.segments[rehydrated.pointer].status).toBe('skipped');
    expect(afterInvalid.segments.filter((s) => s.status === 'done')).toHaveLength(1); // progress survives

    // Another unfinished ordinary block or routine run refuses the start
    // outright — replacing one would destroy real practice.
    expect(planSegmentStartable(rehydrated, [one, two, three], true)).toEqual({ ok: false, reason: 'busy' });

    // A finished run has nothing to start.
    const finished: PlanRun = { ...afterInvalid, pointer: afterInvalid.segments.length };
    expect(planSegmentStartable(finished, [one, two, three])).toEqual({ ok: false, reason: 'finished' });

    // The pointer wraps back to a skipped segment rather than stranding it.
    const pendingSeg = { ...run.segments[0], status: 'pending' as const };
    const doneSeg = { ...run.segments[0], status: 'done' as const };
    const skippedSeg = { ...run.segments[0], status: 'skipped' as const };
    expect(advancePlanPointer([pendingSeg, doneSeg], 1)).toBe(0); // wraps to what is still pending
    expect(advancePlanPointer([skippedSeg], 0)).toBe(1); // a deliberate skip stays skipped
    expect(advancePlanPointer([doneSeg], 0)).toBe(1); // finished

    // Starting a plan is an authority boundary: the preview's OWN calendar
    // day is checked against the caller's `now` directly — the extracted
    // pure transition `SessionPlan.tsx`'s click-time guard actually calls,
    // never a screen's own polled `now` that can lag the true instant by up
    // to its poll interval, which is the exact gap a real device left
    // untouched across midnight experiences with no event to close it.
    const builtFor = day(0);
    expect(planPreviewDayHasPassed(builtFor, NOW)).toBe(false);
    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, 1))).toBe(true);
    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, -1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Regression coverage carried forward from before this lane.
//
// `PlanSegment.core` and the warm-up-first/cool-down-last ordering are shape
// guarantees this lane KEPT — `core` is still derived in `buildSessionPlan`,
// still preserved across `swapSegment`, and still rendered on the Session Plan
// page — but the ac-named tables assert minutes, identity and reasons rather
// than these, so both stopped being covered when the old per-function tests
// were replaced.
// ---------------------------------------------------------------------------

describe('a review segment stays inside its configured slot window', () => {
  // `reviewSlotMinMinutes` / `reviewSlotMaxMinutes` are live knobs — Settings
  // exposes them, `clampSchedulingParams` bounds them to [2,5] and [5,12], and
  // `allocateMinutes` still applies them after the weighted split (a retrieval
  // check should not quietly take half the session, nor be squeezed to
  // nothing). The lane's own allocation tests assert the uniform per-segment
  // bounds and the pinned warm-up share, so this window stopped being covered.
  // Values here are inside the documented bounds on purpose: an out-of-range
  // knob is clamped before it is read, which would make this pass vacuously.
  const BUCKETS = ['warmup', 'lesson', 'review', 'deep', 'cooldown'] as const;
  const REVIEW = BUCKETS.indexOf('review');
  const alloc = (budget: number, min: number, max: number) =>
    allocateMinutes([...BUCKETS], budget, {
      ...DEFAULT_SCHEDULING_PARAMS,
      reviewSlotMinMinutes: min,
      reviewSlotMaxMinutes: max,
    });

  it('the ceiling caps a long session’s review, and widening it gives real minutes back', () => {
    const tight = alloc(60, 2, 5);
    const wide = alloc(60, 5, 12);
    expect(tight[REVIEW]).toBeLessThanOrEqual(5);
    // Strictly more, not merely different: the knob is READ, not just stored.
    expect(wide[REVIEW]).toBeGreaterThan(tight[REVIEW]);
    expect(wide[REVIEW]).toBeLessThanOrEqual(12);
    // The surplus moves to other work; the budget is never exceeded.
    expect(sum(tight)).toBeLessThanOrEqual(60);
    expect(sum(wide)).toBeLessThanOrEqual(60);
  });

  it('the floor lifts a short session’s review, taking the minutes from other work', () => {
    for (const budget of [20, 30]) {
      const low = alloc(budget, 2, 5);
      const lifted = alloc(budget, 5, 12);
      expect(low[REVIEW], `${budget} min`).toBeLessThan(5);
      expect(lifted[REVIEW], `${budget} min`).toBeGreaterThanOrEqual(5);
      // Taken from other segments, not conjured: the total does not grow.
      expect(sum(lifted), `${budget} min`).toBeLessThanOrEqual(sum(low));
      expect(sum(lifted), `${budget} min`).toBeLessThanOrEqual(budget);
      expect(lifted.every((m) => m >= MIN_SEGMENT_MINUTES), `${budget} min`).toBe(true);
    }
  });
});

describe('a plan’s shape is as honest as its minutes', () => {
  const richArgs = () => {
    const warm = it_({ id: 'warm', title: 'Warm', status: 'integrated', difficulty: 2, timesPractised: 12, importance: 2 });
    const lesson = it_({ id: 'lesson', title: 'Lesson', status: 'fragile', importance: 5 });
    const due = it_({ id: 'due', title: 'Due', status: 'usable', importance: 4, nextReviewDate: day(-2) });
    const deep = it_({ id: 'deep', title: 'Deep', status: 'new', importance: 4, difficulty: 5 });
    const cool = it_({ id: 'cool', title: 'Cool', status: 'performable', importance: 2, difficulty: 1, timesPractised: 20 });
    // Ordinary middle work, so the cool-down candidate is still unspent when
    // the cool-down step runs — without it the middle fill takes `cool` and
    // the ordering assertion below would pass vacuously.
    const extra = it_({ id: 'extra', title: 'Extra', status: 'usable', importance: 3, difficulty: 3 });
    const spare = it_({ id: 'spare', title: 'Spare', status: 'fragile', importance: 4, difficulty: 3 });
    return baseArgs({
      items: [warm, lesson, due, deep, cool, extra, spare],
      reviews: [createReview({ practiceItemId: 'due', dueDate: day(-2), reviewType: 'retention' }, NOW)],
      preparationDates: prep('lesson', day(1)),
      budgetMinutes: 60,
    });
  };

  it('marks the work the session is actually FOR, never more than three segments', () => {
    const plan = buildSessionPlan(richArgs());
    const core = plan.segments.filter((s) => s.core);
    expect(core.length).toBeGreaterThanOrEqual(1);
    expect(core.length).toBeLessThanOrEqual(3);
    // The anchor — the first non-warm-up segment — is always core: it is the
    // reason the session exists, whatever roles decorate it.
    const anchor = plan.segments.find((s) => s.bucket !== 'warmup')!;
    expect(anchor.core).toBe(true);
    // A warm-up is core when there is one, because the session's own opening
    // is part of what it is for — but it never displaces the anchor.
    const warmup = plan.segments.find((s) => s.bucket === 'warmup');
    if (warmup) expect(warmup.core).toBe(true);
    // Nothing outside that set is marked: `core` is a claim about the two or
    // three segments the session exists for, not a decoration on every row.
    expect(plan.segments.filter((s) => !s.core).length).toBeGreaterThan(0);
  });

  it('puts a warm-up first and a cool-down last whenever it has them', () => {
    const plan = buildSessionPlan(richArgs());
    const buckets = plan.segments.map((s) => s.bucket);
    // Both roles are genuinely present for this fixture — asserted, so this
    // can never degrade into a pair of conditions that are simply never met.
    expect(buckets).toContain('warmup');
    expect(buckets).toContain('cooldown');
    expect(buckets.indexOf('warmup')).toBe(0);
    expect(buckets.lastIndexOf('cooldown')).toBe(buckets.length - 1);
    // Neither role may appear twice — they bracket the session, not fill it.
    expect(buckets.filter((b) => b === 'warmup').length).toBeLessThanOrEqual(1);
    expect(buckets.filter((b) => b === 'cooldown').length).toBeLessThanOrEqual(1);
  });

  it('a swap with nothing to swap to returns the plan unchanged', () => {
    const plan = buildSessionPlan(richArgs());
    const args = richArgs();
    // Everything eligible is already in the plan, so there is no alternative
    // candidate — the editor must leave the segment exactly as it was rather
    // than emptying it or reaching for ineligible work.
    const exclude = new Set([...plan.segments.map((s) => s.itemId), ...args.items.map((i) => i.id)]);
    const unchanged = swapSegment(plan, 0, { ...args, excludeIds: exclude });
    expect(unchanged.segments[0]).toEqual(plan.segments[0]);
  });
});

// ---------------------------------------------------------------------------
// Whole works keep the standard block (2026-10-14). Committed synthetic
// fixtures — one per instrument shape the owner plays — swept across every
// budget, warm-up share and review window the knobs allow.
// ---------------------------------------------------------------------------

type Fixture = { name: string; instrumentId: string; items: PracticeItem[]; reviews: Review[]; preparationDates: Map<ID, ISODate> };

function fixtureItem(instrumentId: string, id: string, o: Partial<PracticeItem>): PracticeItem {
  const base = createItem({ instrumentId, title: id, itemType: o.itemType ?? 'other', status: o.status ?? 'usable' }, NOW);
  return { ...base, id, importance: 3, difficulty: 3, ...o };
}
const shur = (gusheh: string) => ({ dastgahAvaz: 'شور', gusheh });

function fixtures(): Fixture[] {
  const due = (itemId: ID, back: number) => createReview({ practiceItemId: itemId, dueDate: day(-back), reviewType: 'retention' }, NOW);
  const withDue = (f: Omit<Fixture, 'reviews'>, ids: [ID, number][]): Fixture => ({
    ...f,
    items: f.items.map((i) => {
      const hit = ids.find(([id]) => id === i.id);
      return hit ? { ...i, nextReviewDate: day(-hit[1]) } : i;
    }),
    reviews: ids.map(([id, back]) => ({ ...due(id, back), id: `rev-${id}` })),
  });
  const S = 'setar';
  const setar = withDue(
    {
      name: 'Setar works, many due reviews and class commitments',
      instrumentId: S,
      items: [
        fixtureItem(S, 's-daramad', { itemType: 'gusheh', persian: shur('درآمد'), status: 'integrated', difficulty: 2, timesPractised: 14, importance: 2 }),
        fixtureItem(S, 's-salmak', { itemType: 'gusheh', persian: shur('سلمک'), status: 'performable', difficulty: 2, timesPractised: 20, importance: 2 }),
        fixtureItem(S, 's-shahnaz', { itemType: 'gusheh', persian: shur('شهناز'), status: 'maintenance', difficulty: 3, timesPractised: 9, importance: 2 }),
        fixtureItem(S, 's-r1', { itemType: 'gusheh', persian: shur('رضوی'), status: 'usable', importance: 4, timesPractised: 4 }),
        fixtureItem(S, 's-r2', { itemType: 'gusheh', persian: shur('قرچه'), status: 'usable', importance: 4, timesPractised: 4 }),
        fixtureItem(S, 's-r3', { itemType: 'gusheh', persian: shur('حسینی'), status: 'fragile', importance: 3, timesPractised: 3 }),
        fixtureItem(S, 's-r4', { itemType: 'gusheh', persian: shur('ملا نازی'), status: 'usable', importance: 3, timesPractised: 5 }),
        fixtureItem(S, 's-r5', { itemType: 'full_piece', persian: { dastgahAvaz: 'شور', form: 'چهارمضراب' }, status: 'usable', importance: 3, timesPractised: 6 }),
        fixtureItem(S, 's-l1', { itemType: 'gusheh', persian: shur('بیات کرد'), status: 'fragile', importance: 4 }),
        fixtureItem(S, 's-l2', { itemType: 'full_piece', persian: { dastgahAvaz: 'شور', form: 'رنگ' }, status: 'repairing', importance: 4 }),
        fixtureItem(S, 's-new', { itemType: 'gusheh', persian: shur('شهناز کرشمه'), status: 'new', importance: 5, difficulty: 4 }),
      ],
      preparationDates: new Map([
        ['s-l1', day(1)],
        ['s-l2', day(3)],
      ]),
    },
    [
      ['s-r1', 6],
      ['s-r2', 4],
      ['s-r3', 3],
      ['s-r4', 2],
      ['s-r5', 1],
    ],
  );
  const T = 'tar';
  const tar = withDue(
    {
      name: 'Tar drills only',
      instrumentId: T,
      items: [
        fixtureItem(T, 't-scale', { itemType: 'technique', status: 'integrated', difficulty: 2, timesPractised: 20, importance: 2 }),
        fixtureItem(T, 't-tremolo', { itemType: 'technique', status: 'maintenance', difficulty: 2, timesPractised: 15, importance: 2 }),
        fixtureItem(T, 't-d1', { itemType: 'exercise', status: 'usable', importance: 4, timesPractised: 4 }),
        fixtureItem(T, 't-d2', { itemType: 'exercise', status: 'usable', importance: 3, timesPractised: 4 }),
        fixtureItem(T, 't-new1', { itemType: 'exercise', status: 'new', importance: 4, difficulty: 4 }),
        fixtureItem(T, 't-new2', { itemType: 'technique', status: 'new', importance: 3, difficulty: 4 }),
        fixtureItem(T, 't-frag', { itemType: 'technique', status: 'fragile', importance: 4 }),
        fixtureItem(T, 't-l1', { itemType: 'exercise', status: 'repairing', importance: 3 }),
      ],
      preparationDates: new Map([['t-l1', day(2)]]),
    },
    [
      ['t-d1', 3],
      ['t-d2', 1],
    ],
  );
  const G = 'guitar';
  const guitar = withDue(
    {
      name: 'Guitar pieces plus drills',
      instrumentId: G,
      items: [
        fixtureItem(G, 'g-piece1', { itemType: 'full_piece', status: 'performable', difficulty: 2, timesPractised: 12, importance: 2 }),
        fixtureItem(G, 'g-piece2', { itemType: 'full_piece', status: 'fragile', importance: 4, timesPractised: 5 }),
        fixtureItem(G, 'g-piece3', { itemType: 'full_piece', status: 'new', importance: 5, difficulty: 4 }),
        fixtureItem(G, 'g-scale', { itemType: 'technique', status: 'usable', difficulty: 2, timesPractised: 8, importance: 2 }),
        fixtureItem(G, 'g-arpeggio', { itemType: 'technique', status: 'usable', importance: 3, timesPractised: 4 }),
        fixtureItem(G, 'g-etude', { itemType: 'exercise', status: 'new', importance: 3, difficulty: 3 }),
      ],
      preparationDates: new Map(),
    },
    [
      ['g-piece2', 2],
      ['g-arpeggio', 1],
    ],
  );
  const P = 'parts';
  const parts = withDue(
    {
      name: 'A piece practised as parts',
      instrumentId: P,
      items: [
        fixtureItem(P, 'p-piece', { itemType: 'full_piece', status: 'repairing', importance: 3 }),
        fixtureItem(P, 'p-a', { itemType: 'section', parentItemId: 'p-piece', status: 'usable', importance: 4, timesPractised: 4 }),
        fixtureItem(P, 'p-b', { itemType: 'section', parentItemId: 'p-piece', status: 'fragile', importance: 4 }),
        fixtureItem(P, 'p-c', { itemType: 'section', parentItemId: 'p-piece', status: 'integrated', difficulty: 2, timesPractised: 9, importance: 2 }),
        fixtureItem(P, 'p-other', { itemType: 'gusheh', persian: shur('گریلی'), status: 'usable', importance: 3 }),
      ],
      preparationDates: new Map(),
    },
    [
      ['p-a', 2],
      ['p-b', 1],
    ],
  );
  // The same library on a day with no class commitment and nothing new: every
  // middle slot is a due review, so the review ceiling's overflow has to go
  // somewhere — on base, into the cool-down.
  const setarReviews: Fixture = {
    ...setar,
    name: 'Setar works, every middle slot a due review',
    items: setar.items.filter((i) => !['s-l1', 's-l2', 's-new'].includes(i.id)),
    preparationDates: new Map(),
  };
  // The drill library with one settled work beside it: once two Removes leave
  // a drill cool-down rounded up to 10 on a share of 9, that work fits the
  // slot's minutes but not the role's share.
  const tarWork: Fixture = {
    ...tar,
    name: 'Tar drills and one settled work',
    items: [...tar.items, fixtureItem(T, 't-work', { itemType: 'gusheh', persian: { dastgahAvaz: 'ماهور', gusheh: 'درآمد' }, status: 'maintenance', difficulty: 2, timesPractised: 15, importance: 2 })],
  };
  return [setar, setarReviews, tar, guitar, parts, tarWork];
}

const BUDGETS = [5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120];
const SHARES = [0.1, 0.12, 0.15];
const WINDOWS: [number, number][] = [
  [3, 7],
  [2, 5],
  [5, 12],
];

function sweepArgs(f: Fixture, budgetMinutes: number, warmupShare: number, [min, max]: [number, number]): BuildPlanArgs {
  return {
    instrumentId: f.instrumentId,
    budgetMinutes,
    now: NOW,
    items: f.items,
    blocks: [],
    reviews: f.reviews,
    preparationDates: f.preparationDates,
    params: { ...DEFAULT_SCHEDULING_PARAMS, warmupShare, reviewSlotMinMinutes: min, reviewSlotMaxMinutes: max },
  };
}

/**
 * The base allocator's literal output (commit ee7a091, before this change) for
 * the drill-only Tar fixture, `budget|warmupShare|reviewMin-reviewMax` →
 * `item:bucket:minutes …`. Captured by running the old `buildSessionPlan`
 * over `fixtures()`; never recomputed here.
 */
const BASE_TAR: Record<string, string> = {
  '5|0.1|3-7': 't-l1:lesson:5',
  '5|0.1|2-5': 't-l1:lesson:5',
  '5|0.1|5-12': 't-l1:lesson:5',
  '5|0.12|3-7': 't-l1:lesson:5',
  '5|0.12|2-5': 't-l1:lesson:5',
  '5|0.12|5-12': 't-l1:lesson:5',
  '5|0.15|3-7': 't-l1:lesson:5',
  '5|0.15|2-5': 't-l1:lesson:5',
  '5|0.15|5-12': 't-l1:lesson:5',
  '10|0.1|3-7': 't-l1:lesson:10',
  '10|0.1|2-5': 't-l1:lesson:10',
  '10|0.1|5-12': 't-l1:lesson:10',
  '10|0.12|3-7': 't-l1:lesson:10',
  '10|0.12|2-5': 't-l1:lesson:10',
  '10|0.12|5-12': 't-l1:lesson:10',
  '10|0.15|3-7': 't-l1:lesson:10',
  '10|0.15|2-5': 't-l1:lesson:10',
  '10|0.15|5-12': 't-l1:lesson:10',
  '12|0.1|3-7': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.1|2-5': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.1|5-12': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.12|3-7': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.12|2-5': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.12|5-12': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.15|3-7': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.15|2-5': 't-scale:warmup:2 t-l1:lesson:10',
  '12|0.15|5-12': 't-scale:warmup:2 t-l1:lesson:10',
  '15|0.1|3-7': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.1|2-5': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.1|5-12': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.12|3-7': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.12|2-5': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.12|5-12': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.15|3-7': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.15|2-5': 't-scale:warmup:2 t-l1:lesson:13',
  '15|0.15|5-12': 't-scale:warmup:2 t-l1:lesson:13',
  '20|0.1|3-7': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.1|2-5': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.1|5-12': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.12|3-7': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.12|2-5': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.12|5-12': 't-scale:warmup:2 t-l1:lesson:12 t-tremolo:cooldown:6',
  '20|0.15|3-7': 't-scale:warmup:3 t-l1:lesson:12 t-tremolo:cooldown:5',
  '20|0.15|2-5': 't-scale:warmup:3 t-l1:lesson:12 t-tremolo:cooldown:5',
  '20|0.15|5-12': 't-scale:warmup:3 t-l1:lesson:12 t-tremolo:cooldown:5',
  '25|0.1|3-7': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.1|2-5': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.1|5-12': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.12|3-7': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.12|2-5': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.12|5-12': 't-scale:warmup:3 t-l1:lesson:15 t-tremolo:cooldown:7',
  '25|0.15|3-7': 't-scale:warmup:4 t-l1:lesson:14 t-tremolo:cooldown:7',
  '25|0.15|2-5': 't-scale:warmup:4 t-l1:lesson:14 t-tremolo:cooldown:7',
  '25|0.15|5-12': 't-scale:warmup:4 t-l1:lesson:14 t-tremolo:cooldown:7',
  '30|0.1|3-7': 't-scale:warmup:3 t-l1:lesson:14 t-d1:review:7 t-tremolo:cooldown:6',
  '30|0.1|2-5': 't-scale:warmup:3 t-l1:lesson:15 t-d1:review:5 t-tremolo:cooldown:7',
  '30|0.1|5-12': 't-scale:warmup:3 t-l1:lesson:13 t-d1:review:8 t-tremolo:cooldown:6',
  '30|0.12|3-7': 't-scale:warmup:4 t-l1:lesson:13 t-d1:review:7 t-tremolo:cooldown:6',
  '30|0.12|2-5': 't-scale:warmup:4 t-l1:lesson:14 t-d1:review:5 t-tremolo:cooldown:7',
  '30|0.12|5-12': 't-scale:warmup:4 t-l1:lesson:12 t-d1:review:8 t-tremolo:cooldown:6',
  '30|0.15|3-7': 't-scale:warmup:5 t-l1:lesson:13 t-d1:review:7 t-tremolo:cooldown:5',
  '30|0.15|2-5': 't-scale:warmup:5 t-l1:lesson:14 t-d1:review:5 t-tremolo:cooldown:6',
  '30|0.15|5-12': 't-scale:warmup:5 t-l1:lesson:12 t-d1:review:8 t-tremolo:cooldown:5',
  '45|0.1|3-7': 't-scale:warmup:5 t-l1:lesson:11 t-d1:review:7 t-frag:deep:17 t-tremolo:cooldown:5',
  '45|0.1|2-5': 't-scale:warmup:5 t-l1:lesson:12 t-d1:review:5 t-frag:deep:18 t-tremolo:cooldown:5',
  '45|0.1|5-12': 't-scale:warmup:5 t-l1:lesson:11 t-d1:review:7 t-frag:deep:17 t-tremolo:cooldown:5',
  '45|0.12|3-7': 't-scale:warmup:5 t-l1:lesson:11 t-d1:review:7 t-frag:deep:17 t-tremolo:cooldown:5',
  '45|0.12|2-5': 't-scale:warmup:5 t-l1:lesson:12 t-d1:review:5 t-frag:deep:18 t-tremolo:cooldown:5',
  '45|0.12|5-12': 't-scale:warmup:5 t-l1:lesson:11 t-d1:review:7 t-frag:deep:17 t-tremolo:cooldown:5',
  '45|0.15|3-7': 't-scale:warmup:7 t-l1:lesson:10 t-d1:review:7 t-frag:deep:16 t-tremolo:cooldown:5',
  '45|0.15|2-5': 't-scale:warmup:7 t-l1:lesson:11 t-d1:review:5 t-frag:deep:17 t-tremolo:cooldown:5',
  '45|0.15|5-12': 't-scale:warmup:7 t-l1:lesson:10 t-d1:review:7 t-frag:deep:16 t-tremolo:cooldown:5',
  '60|0.1|3-7': 't-scale:warmup:6 t-l1:lesson:13 t-d1:review:7 t-frag:deep:21 t-d2:review:7 t-tremolo:cooldown:6',
  '60|0.1|2-5': 't-scale:warmup:6 t-l1:lesson:15 t-d1:review:5 t-frag:deep:21 t-d2:review:5 t-tremolo:cooldown:8',
  '60|0.1|5-12': 't-scale:warmup:6 t-l1:lesson:13 t-d1:review:8 t-frag:deep:19 t-d2:review:8 t-tremolo:cooldown:6',
  '60|0.12|3-7': 't-scale:warmup:7 t-l1:lesson:13 t-d1:review:7 t-frag:deep:20 t-d2:review:7 t-tremolo:cooldown:6',
  '60|0.12|2-5': 't-scale:warmup:7 t-l1:lesson:15 t-d1:review:5 t-frag:deep:20 t-d2:review:5 t-tremolo:cooldown:8',
  '60|0.12|5-12': 't-scale:warmup:7 t-l1:lesson:13 t-d1:review:8 t-frag:deep:18 t-d2:review:8 t-tremolo:cooldown:6',
  '60|0.15|3-7': 't-scale:warmup:9 t-l1:lesson:12 t-d1:review:7 t-frag:deep:20 t-d2:review:7 t-tremolo:cooldown:5',
  '60|0.15|2-5': 't-scale:warmup:9 t-l1:lesson:14 t-d1:review:5 t-frag:deep:20 t-d2:review:5 t-tremolo:cooldown:7',
  '60|0.15|5-12': 't-scale:warmup:9 t-l1:lesson:12 t-d1:review:8 t-frag:deep:18 t-d2:review:8 t-tremolo:cooldown:5',
  '90|0.1|3-7': 't-scale:warmup:9 t-l1:lesson:14 t-d1:review:7 t-frag:deep:23 t-d2:review:7 t-new1:deep:23 t-tremolo:cooldown:7',
  '90|0.1|2-5': 't-scale:warmup:9 t-l1:lesson:16 t-d1:review:5 t-frag:deep:23 t-d2:review:5 t-new1:deep:23 t-tremolo:cooldown:9',
  '90|0.1|5-12': 't-scale:warmup:9 t-l1:lesson:14 t-d1:review:9 t-frag:deep:21 t-d2:review:9 t-new1:deep:21 t-tremolo:cooldown:7',
  '90|0.12|3-7': 't-scale:warmup:11 t-l1:lesson:15 t-d1:review:7 t-frag:deep:22 t-d2:review:7 t-new1:deep:22 t-tremolo:cooldown:6',
  '90|0.12|2-5': 't-scale:warmup:11 t-l1:lesson:16 t-d1:review:5 t-frag:deep:23 t-d2:review:5 t-new1:deep:22 t-tremolo:cooldown:8',
  '90|0.12|5-12': 't-scale:warmup:11 t-l1:lesson:14 t-d1:review:10 t-frag:deep:20 t-d2:review:9 t-new1:deep:20 t-tremolo:cooldown:6',
  '90|0.15|3-7': 't-scale:warmup:14 t-l1:lesson:14 t-d1:review:7 t-frag:deep:22 t-d2:review:7 t-new1:deep:20 t-tremolo:cooldown:6',
  '90|0.15|2-5': 't-scale:warmup:14 t-l1:lesson:16 t-d1:review:5 t-frag:deep:22 t-d2:review:5 t-new1:deep:22 t-tremolo:cooldown:6',
  '90|0.15|5-12': 't-scale:warmup:14 t-l1:lesson:14 t-d1:review:8 t-frag:deep:20 t-d2:review:8 t-new1:deep:20 t-tremolo:cooldown:6',
  '120|0.1|3-7': 't-scale:warmup:12 t-l1:lesson:25 t-d1:review:7 t-frag:deep:25 t-d2:review:7 t-new1:deep:25 t-tremolo:cooldown:19',
  '120|0.1|2-5': 't-scale:warmup:12 t-l1:lesson:25 t-d1:review:5 t-frag:deep:25 t-d2:review:5 t-new1:deep:25 t-tremolo:cooldown:23',
  '120|0.1|5-12': 't-scale:warmup:12 t-l1:lesson:22 t-d1:review:12 t-frag:deep:25 t-d2:review:12 t-new1:deep:25 t-tremolo:cooldown:12',
  '120|0.12|3-7': 't-scale:warmup:14 t-l1:lesson:25 t-d1:review:7 t-frag:deep:25 t-d2:review:7 t-new1:deep:25 t-tremolo:cooldown:17',
  '120|0.12|2-5': 't-scale:warmup:14 t-l1:lesson:25 t-d1:review:5 t-frag:deep:25 t-d2:review:5 t-new1:deep:25 t-tremolo:cooldown:21',
  '120|0.12|5-12': 't-scale:warmup:14 t-l1:lesson:22 t-d1:review:12 t-frag:deep:25 t-d2:review:12 t-new1:deep:25 t-tremolo:cooldown:10',
  '120|0.15|3-7': 't-scale:warmup:18 t-l1:lesson:25 t-d1:review:7 t-frag:deep:25 t-d2:review:7 t-new1:deep:25 t-tremolo:cooldown:13',
  '120|0.15|2-5': 't-scale:warmup:18 t-l1:lesson:25 t-d1:review:5 t-frag:deep:25 t-d2:review:5 t-new1:deep:25 t-tremolo:cooldown:17',
  '120|0.15|5-12': 't-scale:warmup:18 t-l1:lesson:19 t-d1:review:12 t-frag:deep:25 t-d2:review:12 t-new1:deep:25 t-tremolo:cooldown:9',
};

/** A whole work, derived here rather than imported: a top-level gusheh or full piece, or anything with Persian identity. */
const expectWork = (i: PracticeItem) =>
  !i.parentItemId && (i.itemType === 'gusheh' || i.itemType === 'full_piece' || !!i.persian?.dastgahAvaz || !!i.persian?.form || !!i.persian?.gusheh);
/** The published bucket weights (docs/scheduling-evidence.md §5), at the default deep-work share. */
const WEIGHT: Record<string, number> = { deep: 2.6, lesson: 1.8, review: 1.2, cooldown: 0.9 };
const warmShare = (B: number, share: number) => Math.round(B * share);
/** The cool-down's weighted split of the minutes after the warm-up, among the segments seated with it. */
function coolShare(B: number, share: number, buckets: string[]): number {
  const pool = B - (buckets.includes('warmup') ? warmShare(B, share) : 0);
  const rest = buckets.filter((b) => b !== 'warmup');
  return Math.floor((pool * WEIGHT.cooldown) / sum(rest.map((b) => WEIGHT[b])));
}
const render = (plan: SessionPlan) => plan.segments.map((x) => `${x.itemId}:${x.bucket}:${x.minutes}`).join(' ');

/**
 * Every rule a seated plan must keep, whichever door (build, Remove, Swap)
 * produced it. A swap keeps the slot's minutes, so a swapped plan is held to
 * the floors and role shares but not re-judged against the review ceiling.
 */
function expectFloorsAndShares(plan: SessionPlan, f: Fixture, B: number, share: number, max: number, label: string, swapped = false) {
  // Removed work leaves its minutes UNUSED by design: the generator's
  // "remainder only once everything is full" rule is about what it built.
  const removed = (plan.removedMinutes ?? 0) > 0;
  const items = new Map(f.items.map((i) => [i.id, i]));
  const segs = plan.segments;
  const buckets = segs.map((x) => x.bucket);
  const total = sum(segs.map((x) => x.minutes));
  expect(total, label).toBeLessThanOrEqual(B);
  for (const seg of segs) {
    const work = expectWork(items.get(seg.itemId)!);
    expect(seg.minutes, `${label} ${seg.itemId}`).toBeGreaterThanOrEqual(MIN_SEGMENT_MINUTES);
    expect(seg.minutes, `${label} ${seg.itemId}`).toBeLessThanOrEqual(MAX_SEGMENT_MINUTES);
    // A whole work never gets less than the standard 10-minute block beside other work.
    if (segs.length > 1 && work) expect(seg.minutes, `${label} ${seg.itemId} is a work`).toBeGreaterThanOrEqual(10);
    if (segs.length > 1 && seg.bucket === 'warmup') {
      // Exactly its pinned share, and a work only when that share is a standard block.
      expect(seg.minutes, `${label} warm-up`).toBe(warmShare(B, share));
      if (work) expect(warmShare(B, share), `${label} warm-up on a work`).toBeGreaterThanOrEqual(10);
    }
    if (segs.length > 1 && seg.bucket === 'cooldown') {
      const c = coolShare(B, share, buckets);
      expect(seg.minutes, `${label} cool-down`).toBeLessThanOrEqual(c + 1);
      if (work) expect(c, `${label} cool-down on a work`).toBeGreaterThanOrEqual(10);
    }
  }
  const work = segs.filter((x) => x.bucket === 'deep' || x.bucket === 'lesson');
  // The review ceiling holds while deep or lesson work could take the minutes.
  for (const r of swapped || removed ? [] : segs.filter((x) => x.bucket === 'review')) {
    const ceiling = Math.max(max, expectWork(items.get(r.itemId)!) ? 10 : MIN_SEGMENT_MINUTES);
    if (r.minutes > ceiling) expect(work.every((x) => x.minutes === MAX_SEGMENT_MINUTES), `${label} review over its ceiling`).toBe(true);
  }
  // An honest remainder only once everything that may take overflow is full.
  if (total < B && !removed) {
    expect(segs.filter((x) => x.bucket !== 'warmup' && x.bucket !== 'cooldown').every((x) => x.minutes === MAX_SEGMENT_MINUTES), `${label} remainder`).toBe(true);
  }
}

describe('whole works keep the standard block', () => {
  it('planned whole works keep the standard block and the plan adapts its segment count', () => {
    // The minutes first, across the whole sweep — the rules the owner set.
    for (const f of fixtures()) {
      for (const B of BUDGETS) {
        for (const share of SHARES) {
          for (const window of WINDOWS) {
            const label = `${f.name} · ${B} min · share ${share} · reviews ${window.join('–')}`;
            expectFloorsAndShares(buildSessionPlan(sweepArgs(f, B, share, window)), f, B, share, window[1], label);
          }
        }
      }
    }
    let drillOnlyCompared = 0;
    for (const f of fixtures()) {
      for (const B of BUDGETS) {
        for (const share of SHARES) {
          for (const window of WINDOWS) {
            const label = `${f.name} · ${B} min · share ${share} · reviews ${window.join('–')}`;
            const args = sweepArgs(f, B, share, window);
            const plan = buildSessionPlan(args);
            // Deterministic: the same inputs give the same plan, field for field.
            expect(buildSessionPlan(args), label).toEqual(plan);
            expect(plan.segments.length, label).toBeGreaterThan(0);
            expectFloorsAndShares(plan, f, B, share, window[1], label);
            const items = new Map(f.items.map((i) => [i.id, i]));
            // The anchor — the most useful work, which a five-minute plan is — always stays.
            const anchor = buildSessionPlan({ ...args, budgetMinutes: 5 }).segments[0].itemId;
            expect(plan.segments.map((x) => x.itemId), label).toContain(anchor);

            // The floor is fixed on each segment when it is planned.
            for (const seg of plan.segments) {
              expect(seg.floorMinutes, `${label} ${seg.itemId} floor`).toBe(expectWork(items.get(seg.itemId)!) ? 10 : MIN_SEGMENT_MINUTES);
            }
            // SWAP offers only material whose floor fits the slot — and, in a
            // warm-up or cool-down, the role's own share, not its rounded
            // minutes — whether the plan is fresh or already trimmed by Remove.
            const expectSwaps = (p: SessionPlan, at: string) =>
              p.segments.forEach((seg, i) => {
                const swapped = swapSegment(p, i, args);
                expect(swapped.segments[i].minutes, `${at} swap ${i}`).toBe(seg.minutes);
                expectFloorsAndShares(swapped, f, B, share, window[1], `${at} swap ${i}`, true);
              });
            expectSwaps(plan, label);
            // REMOVE leaves every other allocation as built, twice over, so
            // floors and shares still hold and Swap still respects them.
            const remove = (p: SessionPlan, i: number) => removePlanSegment(p, i);
            if (plan.segments.length > 1) {
              plan.segments.forEach((_, i) => {
                const removed = remove(plan, i);
                expect(removed.segments.length, `${label} remove ${i}`).toBe(plan.segments.length - 1);
                expectFloorsAndShares(removed, f, B, share, window[1], `${label} remove ${i}`);
                expectSwaps(removed, `${label} remove ${i}`);
                removed.segments.forEach((__, k) => {
                  if (removed.segments.length < 2) return;
                  const twice = remove(removed, k);
                  expectFloorsAndShares(twice, f, B, share, window[1], `${label} remove ${i} then ${k}`);
                  expectSwaps(twice, `${label} remove ${i} then ${k}`);
                });
              });
            }

            // DRILL-ONLY: where the base plan's warm-up and cool-down stayed
            // within their shares (nothing above the warm-up's share or the
            // cool-down's floored split — the review clamp used to push its
            // excess there) and no segment reached 25, the minutes are
            // exactly the base allocator's.
            if (f.name === 'Tar drills only') {
              const base = BASE_TAR[`${B}|${share}|${window.join('-')}`];
              const segs = base.split(' ').map((x) => x.split(':'));
              const buckets = segs.map((x) => x[1]);
              const minutes = (b: string) => Number(segs.find((x) => x[1] === b)![2]);
              const absorbed =
                (buckets.includes('warmup') && minutes('warmup') > warmShare(B, share)) ||
                (buckets.includes('cooldown') && minutes('cooldown') > coolShare(B, share, buckets));
              if (!absorbed && segs.every((x) => Number(x[2]) < MAX_SEGMENT_MINUTES)) {
                expect(render(plan), label).toBe(base);
                drillOnlyCompared += 1;
              }
            }
          }
        }
      }
    }
    // The comparison is real, not vacuous.
    expect(drillOnlyCompared).toBe(70);

    // The Setar day the owner reported: base gave a 2-minute warm-up on a
    // gusheh and an 11-minute cool-down holding the review ceiling's overflow.
    // Now two whole works, ten minutes each — fewer, longer segments.
    const [, reviewDay] = fixtures();
    expect(render(buildSessionPlan(sweepArgs(reviewDay, 20, 0.12, [3, 7])))).toBe('s-r1:review:10 s-r2:review:10');
    expect(render(buildSessionPlan(sweepArgs(reviewDay, 45, 0.12, [3, 7])))).toBe('s-r1:review:12 s-r2:review:11 s-r3:review:11 s-r5:review:11');
    // A work warms up once the share is a standard block, and cools down
    // only on its own weighted split — never on leftovers.
    expect(render(buildSessionPlan(sweepArgs(reviewDay, 90, 0.12, [3, 7])))).toMatch(/^s-shahnaz:warmup:11 .* s-daramad:cooldown:10$/);

    // Two Removes leave every remaining allocation exactly as built — the
    // cool-down keeps its own minutes — and Swap still may not hand that role
    // the settled work.
    const tarWork = fixtures()[5];
    const twArgs = sweepArgs(tarWork, 45, 0.15, [3, 7]);
    const builtTar = buildSessionPlan(twArgs);
    const trimmed = removePlanSegment(removePlanSegment(builtTar, 1), 1);
    expect(trimmed.segments).toEqual([builtTar.segments[0], ...builtTar.segments.slice(3)]);
    expect(sum(trimmed.segments.map((x) => x.minutes)) + (trimmed.removedMinutes ?? 0)).toBe(sum(builtTar.segments.map((x) => x.minutes)));
    const cool = trimmed.segments.findIndex((x) => x.bucket === 'cooldown');
    if (cool >= 0) expect(swapSegment(trimmed, cool, twArgs).segments[cool].itemId).not.toBe('t-work');

    // A RUNNING PLAN persisted before floors existed still edits and starts.
    const [setar] = fixtures();
    const built = buildSessionPlan(sweepArgs(setar, 45, 0.12, [3, 7]));
    const legacy: SessionPlan = { ...built, segments: built.segments.map(({ floorMinutes: _f, ...seg }) => (void _f, seg)) };
    expect(sum(removePlanSegment(legacy, 0).segments.map((x) => x.minutes))).toBeLessThanOrEqual(45);
    const run: PlanRun = {
      instrumentId: legacy.instrumentId,
      budgetMinutes: legacy.budgetMinutes,
      startedAt: NOW.toISOString(),
      pointer: 0,
      segments: legacy.segments.map((seg) => ({ ...seg, status: 'pending' })),
    };
    expect(planSegmentStartable(run, setar.items)).toMatchObject({ ok: true });
  });
});
