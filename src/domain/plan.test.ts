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
  planSegmentStartable,
  redistributePlan,
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

      if (budgetMinutes < 12) {
        // No warm-up, no cool-down: one useful main focus.
        expect(warmups, label).toHaveLength(0);
        expect(plan.segments, label).toHaveLength(1);
      } else {
        expect(warmups, label).toHaveLength(1);
        // It is FIRST, it is a familiar candidate, and its bounded share is
        // real minutes rather than a weight nobody can check.
        expect(plan.segments[0].bucket, label).toBe('warmup');
        expect(['radif', 'tech'], label).toContain(plan.segments[0].itemId);
        // The configured share, floored at the shortest segment worth
        // starting — at 12 minutes 12 × 0.12 rounds to 1, and a one-minute
        // block is not a warm-up.
        expect(plan.segments[0].minutes, label).toBe(
          Math.max(MIN_SEGMENT_MINUTES, Math.round(budgetMinutes * share)),
        );
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

    // REGENERATE is the same function with the same inputs: same answer.
    expect(JSON.stringify(buildSessionPlan(args).segments)).toBe(JSON.stringify(plan.segments));

    // REMOVE + redistribute: totals stay within budget, and no segment gains
    // another role's reason.
    const trimmed = redistributePlan({ ...plan, segments: plan.segments.slice(1) });
    expect(sum(trimmed.segments.map((s) => s.minutes))).toBeLessThanOrEqual(plan.budgetMinutes);
    trimmed.segments.forEach((seg, i) => {
      const original = plan.segments[i + 1];
      expect(seg.itemId).toBe(original.itemId);
      expect(seg.bucket).toBe(original.bucket);
      expect(seg.reason).toBe(original.reason);
    });
    expect(redistributePlan({ ...plan, segments: [] }).segments).toEqual([]);

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
        expect(sum(alloc), label).toBeLessThanOrEqual(budget);
        expect(alloc.every((m) => m >= MIN_SEGMENT_MINUTES), label).toBe(true);
        expect(alloc.every((m) => m <= MAX_SEGMENT_MINUTES), label).toBe(true);
      }
    }
  });

  it('pins the warm-up to its configured share', () => {
    for (const budget of [12, 15, 20, 45, 60]) {
      const alloc = allocateMinutes(['warmup', 'deep', 'review'], budget);
      expect(alloc[0], `budget ${budget}`).toBe(
        Math.max(MIN_SEGMENT_MINUTES, Math.round(budget * DEFAULT_SCHEDULING_PARAMS.warmupShare)),
      );
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
  });
});
