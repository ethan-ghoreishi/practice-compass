import { describe, expect, it } from 'vitest';
import { allocateMinutes, buildSessionPlan, redistributePlan, swapSegment, type BuildPlanArgs } from './plan';
import { DEFAULT_SCHEDULING_PARAMS } from './scheduling';
import { createItem, createBlock, createReview } from './factories';
import type { ItemStatus, ItemType, PracticeBlock, PracticeItem, Review } from './types';

const NOW = new Date('2026-07-18T09:00:00.000Z');
const INST = 'setar';

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

function block(itemId: string, startedAt: string): PracticeBlock {
  return createBlock(
    { practiceItemId: itemId, instrumentId: INST, durationMinutes: 10, mode: 'learn', focus: 'other', startedAt },
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

describe('buildSessionPlan · minute budget invariant', () => {
  const items = [
    it_({ status: 'new', importance: 5, title: 'deep A' }),
    it_({ status: 'fragile', importance: 4, title: 'deep B' }),
    it_({ itemType: 'technique', status: 'usable', title: 'warmup' }),
    it_({ status: 'integrated', title: 'cooldown' }),
    it_({ status: 'usable', assignedForLesson: true, title: 'lesson' }),
  ];

  it('segment minutes always sum to the budget, across durations', () => {
    for (const budgetMinutes of [15, 20, 30, 45, 60]) {
      const plan = buildSessionPlan(baseArgs({ items, budgetMinutes }));
      expect(sum(plan.segments.map((s) => s.minutes)), `budget ${budgetMinutes}`).toBe(budgetMinutes);
      expect(plan.segments.every((s) => s.minutes >= 2)).toBe(true);
    }
  });

  it('is deterministic — same inputs give byte-identical output', () => {
    const a = buildSessionPlan(baseArgs({ items, budgetMinutes: 30 }));
    const b = buildSessionPlan(baseArgs({ items, budgetMinutes: 30 }));
    expect(a).toEqual(b);
  });

  it('puts warm-up first and cool-down last when present', () => {
    const plan = buildSessionPlan(baseArgs({ items, budgetMinutes: 45 }));
    expect(plan.segments[0].bucket).toBe('warmup');
    expect(plan.segments[plan.segments.length - 1].bucket).toBe('cooldown');
  });

  it('marks 2–3 core segments', () => {
    const plan = buildSessionPlan(baseArgs({ items, budgetMinutes: 45 }));
    const core = plan.segments.filter((s) => s.core).length;
    expect(core).toBeGreaterThanOrEqual(2);
    expect(core).toBeLessThanOrEqual(3);
  });
});

describe('buildSessionPlan · edge cases', () => {
  it('0 items → empty plan with an honest summary', () => {
    const plan = buildSessionPlan(baseArgs({ items: [], budgetMinutes: 30 }));
    expect(plan.segments).toHaveLength(0);
    expect(plan.summary).toMatch(/no items/i);
    expect(sum(plan.segments.map((s) => s.minutes))).toBe(0);
  });

  it('1 item → a single segment equal to the whole budget', () => {
    const plan = buildSessionPlan(baseArgs({ items: [it_({ status: 'new' })], budgetMinutes: 30 }));
    expect(plan.segments).toHaveLength(1);
    expect(plan.segments[0].minutes).toBe(30);
  });

  it('everything practised today → still plans, and says so', () => {
    const a = it_({ status: 'new', title: 'A' });
    const b = it_({ status: 'fragile', title: 'B' });
    const blocks = [block(a.id, '2026-07-18T07:00:00.000Z'), block(b.id, '2026-07-18T07:30:00.000Z')];
    const plan = buildSessionPlan(baseArgs({ items: [a, b], blocks, budgetMinutes: 30 }));
    expect(plan.segments.length).toBeGreaterThan(0);
    expect(sum(plan.segments.map((s) => s.minutes))).toBe(30);
    expect(plan.summary).toMatch(/already practised today/i);
  });

  it('keeps an assigned-for-class item even if practised today', () => {
    const assigned = it_({ status: 'usable', assignedForLesson: true, title: 'class work' });
    const other = it_({ status: 'new', title: 'other' });
    const blocks = [block(assigned.id, '2026-07-18T07:00:00.000Z')];
    const lessonDates = new Map([[INST, '2026-07-25']]);
    const plan = buildSessionPlan(baseArgs({ items: [assigned, other], blocks, lessonDates, budgetMinutes: 30 }));
    expect(plan.segments.some((s) => s.itemId === assigned.id)).toBe(true);
  });

  it('all-saturated items are penalised, never excluded', () => {
    const a = it_({ status: 'new', title: 'A' });
    // Many blocks today would saturate, but they are on a past day so it still qualifies.
    const blocks = Array.from({ length: 4 }, (_, i) => block(a.id, `2026-07-1${i}T07:00:00.000Z`));
    const plan = buildSessionPlan(baseArgs({ items: [a], blocks, budgetMinutes: 20 }));
    expect(plan.segments).toHaveLength(1);
    expect(plan.segments[0].minutes).toBe(20);
  });
});

describe('review pool + lesson boost', () => {
  it('includes a due-review item as a review segment', () => {
    const r = it_({ status: 'usable', title: 'to review' });
    const other = it_({ status: 'new', title: 'fresh' });
    const reviews: Review[] = [
      createReview({ practiceItemId: r.id, dueDate: '2026-07-10', reviewType: 'retention' }, NOW),
    ];
    const plan = buildSessionPlan(baseArgs({ items: [r, other], reviews, budgetMinutes: 30 }));
    const seg = plan.segments.find((s) => s.itemId === r.id);
    expect(seg?.bucket).toBe('review');
  });
});

describe('allocateMinutes', () => {
  it('always sums to the budget with each ≥ 2', () => {
    const buckets = ['warmup', 'deep', 'lesson', 'review', 'cooldown'] as const;
    for (const B of [10, 15, 20, 33, 47, 60]) {
      const m = allocateMinutes([...buckets], B);
      expect(sum(m)).toBe(B);
      expect(m.every((x) => x >= 2)).toBe(true);
    }
  });

  it('drops segments when the budget cannot give each ≥ 2', () => {
    // 5 minutes, 5 segments → at most 2 segments survive (2+3).
    const m = allocateMinutes(['warmup', 'deep', 'lesson', 'review', 'cooldown'], 5);
    expect(m.length).toBeLessThanOrEqual(2);
    expect(sum(m)).toBe(5);
  });

  it('clamps a review segment to reviewSlotMax, giving the surplus to deep', () => {
    // 2 segments, 30 min: unclamped weighting would hand review ~9 min.
    const params = { ...DEFAULT_SCHEDULING_PARAMS, reviewSlotMinMinutes: 3, reviewSlotMaxMinutes: 7 };
    const m = allocateMinutes(['deep', 'review'], 30, params);
    expect(m[1]).toBe(7);
    expect(sum(m)).toBe(30);
  });

  it('clamps a review segment up to reviewSlotMin, taking it from a lower-priority segment', () => {
    // reviewSlotMinMinutes is bounded to [2,5]; 15 min naturally gives review
    // only 4, so a min of 5 (the bound's ceiling) should bump it.
    const params = { ...DEFAULT_SCHEDULING_PARAMS, reviewSlotMinMinutes: 5, reviewSlotMaxMinutes: 7 };
    const unclamped = allocateMinutes(['deep', 'review', 'cooldown'], 15, DEFAULT_SCHEDULING_PARAMS);
    expect(unclamped[1]).toBeLessThan(5); // sanity: the natural share is below the floor we're about to set
    const m = allocateMinutes(['deep', 'review', 'cooldown'], 15, params);
    expect(m[1]).toBeGreaterThanOrEqual(5);
    expect(sum(m)).toBe(15);
  });

  it('a wider warmupShare gives the warm-up segment more real minutes', () => {
    const narrow = allocateMinutes(['warmup', 'deep'], 40, { ...DEFAULT_SCHEDULING_PARAMS, warmupShare: 0.1 });
    const wide = allocateMinutes(['warmup', 'deep'], 40, { ...DEFAULT_SCHEDULING_PARAMS, warmupShare: 0.15 });
    expect(wide[0]).toBeGreaterThan(narrow[0]);
    expect(sum(narrow)).toBe(40);
    expect(sum(wide)).toBe(40);
  });
});

describe('redistributePlan', () => {
  it('re-spreads to the same budget after a segment is removed', () => {
    const items = [
      it_({ status: 'new', title: 'A' }),
      it_({ status: 'fragile', title: 'B' }),
      it_({ itemType: 'technique', status: 'usable', title: 'W' }),
    ];
    const plan = buildSessionPlan(baseArgs({ items, budgetMinutes: 30 }));
    const trimmed = { ...plan, segments: plan.segments.slice(1) };
    const out = redistributePlan(trimmed);
    expect(sum(out.segments.map((s) => s.minutes))).toBe(30);
  });
});

describe('swapSegment', () => {
  it('replaces a segment with the next-best same-bucket candidate, keeping minutes', () => {
    const deep1 = it_({ status: 'new', importance: 5, title: 'deep-1' });
    const deep2 = it_({ status: 'new', importance: 4, title: 'deep-2' });
    // A tight budget yields one segment, leaving deep-2 as an unused candidate.
    const plan = buildSessionPlan(baseArgs({ items: [deep1, deep2], budgetMinutes: 10 }));
    const i = plan.segments.findIndex((s) => s.bucket === 'deep');
    const before = plan.segments[i];
    const out = swapSegment(plan, i, baseArgs({ items: [deep1, deep2] }));
    expect(out.segments[i].itemId).not.toBe(before.itemId);
    expect(out.segments[i].minutes).toBe(before.minutes);
    expect(out.segments[i].bucket).toBe('deep');
  });

  it('returns the plan unchanged when there is no alternative', () => {
    const only = it_({ status: 'new', title: 'only' });
    const plan = buildSessionPlan(baseArgs({ items: [only], budgetMinutes: 30 }));
    const out = swapSegment(plan, 0, baseArgs({ items: [only] }));
    expect(out).toEqual(plan);
  });
});
