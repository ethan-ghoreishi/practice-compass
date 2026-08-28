import { describe, expect, it } from 'vitest';
import {
  applyReviewDateToRow,
  applyReviewDateToRows,
  clampSchedulingParams,
  computeReview,
  computeReviewOutcome,
  DEFAULT_SCHEDULING_PARAMS,
  planNextReview,
  resolveReviewDate,
  SCHEDULING_BOUNDS,
  shouldSuggestDormant,
  snoozePlan,
  suggestStatusAfterBlock,
} from './scheduling';
import type { SchedulingParams } from './types';
import { createItem, createReview } from './factories';
import { addDays, toISODate } from './util';
import type { ItemStatus, PracticeItem, Rating } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

function item(o: Partial<PracticeItem> & { status?: ItemStatus; importance?: Rating; difficulty?: Rating } = {}): PracticeItem {
  const base = createItem(
    { instrumentId: 'i', title: 't', status: o.status ?? 'usable', importance: o.importance ?? 3, difficulty: o.difficulty ?? 3 },
    NOW,
  );
  return { ...base, ...o };
}

describe('computeReview · spaced repetition (auto)', () => {
  it('grows the interval across successful reviews', () => {
    const r1 = computeReview(item(), 'stable_alone', NOW)!; // 1st good rep
    expect(r1.srReps).toBe(1);
    expect(r1.intervalDays).toBe(2);

    const r2 = computeReview(item({ srReps: 1, srIntervalDays: 2, srEase: 2.5 }), 'stable_alone', NOW)!;
    expect(r2.srReps).toBe(2);
    expect(r2.intervalDays).toBe(6);

    const r3 = computeReview(item({ srReps: 2, srIntervalDays: 6, srEase: 2.5 }), 'stable_in_context', NOW)!;
    expect(r3.srReps).toBe(3);
    expect(r3.intervalDays).toBe(15); // round(6 * 2.5)
  });

  it('resets to tomorrow when it slips (poor result)', () => {
    const r = computeReview(item({ srReps: 4, srIntervalDays: 30 }), 'worse', NOW)!;
    expect(r.srReps).toBe(0);
    expect(r.intervalDays).toBe(1);
  });

  it('flags a strategy change on "same" and resets', () => {
    const r = computeReview(item({ srReps: 3, srIntervalDays: 20 }), 'same', NOW)!;
    expect(r.changeStrategy).toBe(true);
    expect(r.intervalDays).toBe(1);
  });

  it('pulls important & difficult material sooner', () => {
    const plain = computeReview(item({ srReps: 2, srIntervalDays: 6, importance: 3, difficulty: 3 }), 'stable_in_context', NOW)!;
    const urgent = computeReview(item({ srReps: 2, srIntervalDays: 6, importance: 5, difficulty: 5 }), 'stable_in_context', NOW)!;
    expect(urgent.intervalDays).toBeLessThan(plain.intervalDays);
  });

  it('sets the due date from today + interval', () => {
    const r = computeReview(item(), 'stable_alone', NOW)!;
    expect(r.dueDate).toBe(toISODate(addDays(NOW, r.intervalDays)));
  });
});

describe('computeReview · modes', () => {
  it('returns null in manual mode and for unlogged blocks', () => {
    expect(computeReview(item({ reviewMode: 'manual' }), 'stable_alone', NOW)).toBeNull();
    expect(computeReview(item(), 'not_logged', NOW)).toBeNull();
  });

  it('uses the fixed cadence in interval mode', () => {
    const r = computeReview(item({ reviewMode: 'interval', reviewIntervalDays: 3 }), 'stable_alone', NOW)!;
    expect(r.intervalDays).toBe(3);
    expect(r.dueDate).toBe(toISODate(addDays(NOW, 3)));
  });

  it('fixed cadence does not overwrite the SM-2 interval base', () => {
    const r = computeReview(
      item({ reviewMode: 'interval', reviewIntervalDays: 30, srReps: 2, srEase: 2.5, srIntervalDays: 6 }),
      'stable_alone',
      NOW,
    )!;
    expect(r.intervalDays).toBe(30); // the fixed cadence still decides the due date
    expect(r.srIntervalDays).toBe(6); // but the underlying Auto base is untouched
  });
});

describe('planNextReview preview', () => {
  it('mirrors computeReview without the SR-state fields', () => {
    const p = planNextReview({ item: item(), result: 'stable_alone', now: NOW })!;
    expect(p.intervalDays).toBe(2);
    expect('srReps' in p).toBe(false);
  });
});

describe('resolveReviewDate — the tri-state review-date primitive', () => {
  it('returns undefined (no change) for an absent instruction', () => {
    expect(resolveReviewDate(undefined)).toBeUndefined();
  });

  it('clears the schedule for null', () => {
    expect(resolveReviewDate(null)).toEqual({ nextReviewDate: undefined });
  });

  it('sets the schedule for an explicit date', () => {
    const date = toISODate(addDays(NOW, 5));
    expect(resolveReviewDate(date)).toEqual({ nextReviewDate: date });
  });
});

describe("applyReviewDateToRows — the coupled write to an item's Review rows", () => {
  const itemId = 'item-1';

  function openReview(dueDate: string) {
    return createReview({ practiceItemId: itemId, dueDate, reviewType: 'retention' }, NOW);
  }

  it('leaves the review schedule untouched when an item update does not include a review date', () => {
    const reviews = [openReview(toISODate(addDays(NOW, -14)))];
    expect(
      applyReviewDateToRows({ reviews, practiceItemId: itemId, instruction: undefined, now: NOW }),
    ).toBeUndefined();
  });

  it("moves the open review row when the item's review date changes", () => {
    const reviews = [openReview(toISODate(addDays(NOW, -14)))];
    const date = toISODate(addDays(NOW, 5));
    const updated = applyReviewDateToRows({ reviews, practiceItemId: itemId, instruction: date, now: NOW })!;
    expect(updated[0].dueDate).toBe(date);
  });

  it('removes the open review row when the schedule is cleared', () => {
    const reviews = [openReview(toISODate(addDays(NOW, -14)))];
    const updated = applyReviewDateToRows({ reviews, practiceItemId: itemId, instruction: null, now: NOW })!;
    expect(updated).toHaveLength(0);
  });

  it('only touches the open row for this item, leaving completed rows and other items alone', () => {
    const mine = openReview(toISODate(addDays(NOW, -1)));
    const completedMine = { ...openReview(toISODate(addDays(NOW, -30))), completedAt: NOW.toISOString() };
    const other = createReview({ practiceItemId: 'item-2', dueDate: toISODate(addDays(NOW, 1)), reviewType: 'retention' }, NOW);
    const date = toISODate(addDays(NOW, 5));

    const updated = applyReviewDateToRows({
      reviews: [mine, completedMine, other],
      practiceItemId: itemId,
      instruction: date,
      now: NOW,
    })!;

    expect(updated.find((r) => r.id === mine.id)!.dueDate).toBe(date);
    expect(updated.find((r) => r.id === completedMine.id)!.dueDate).toBe(completedMine.dueDate);
    expect(updated.find((r) => r.id === other.id)!.dueDate).toBe(other.dueDate);
  });

  it('snooze moves the same date on the item and the review without changing SM-2 state', () => {
    const stale = item({ nextReviewDate: toISODate(addDays(NOW, -3)), srReps: 3, srEase: 2.6, srIntervalDays: 15 });
    const review = openReview(toISODate(addDays(NOW, -3)));
    const { dueDate } = snoozePlan(2, NOW);

    // The two writes snoozeReview actually performs: the SELECTED row (by
    // its own id — applyReviewDateToRow, not the item-scoped
    // applyReviewDateToRows), and the item, from the same resolved value.
    const updatedReviews = applyReviewDateToRow({
      reviews: [review],
      reviewId: review.id,
      instruction: dueDate,
      now: NOW,
    })!;
    const write = resolveReviewDate(dueDate)!;
    const updatedItem = { ...stale, nextReviewDate: write.nextReviewDate };

    expect(updatedReviews[0].dueDate).toBe(dueDate);
    expect(updatedItem.nextReviewDate).toBe(dueDate);
    expect(updatedItem.srReps).toBe(stale.srReps);
    expect(updatedItem.srEase).toBe(stale.srEase);
    expect(updatedItem.srIntervalDays).toBe(stale.srIntervalDays);
  });
});

describe('applyReviewDateToRow — the row-scoped write snoozeReview needs', () => {
  const itemId = 'item-1';

  function openReview(dueDate: string) {
    return createReview({ practiceItemId: itemId, dueDate, reviewType: 'retention' }, NOW);
  }

  it('leaves the row untouched when the instruction is absent', () => {
    const reviews = [openReview(toISODate(addDays(NOW, -14)))];
    expect(
      applyReviewDateToRow({ reviews, reviewId: reviews[0].id, instruction: undefined, now: NOW }),
    ).toBeUndefined();
  });

  it('moves only the selected row, leaving a second open review for the SAME item untouched', () => {
    // The regression the review caught: two open rows on one item — a
    // real, if unusual, shape (e.g. a stale row left behind by a bug, or
    // two review types in flight at once). Snoozing review A must not
    // silently move review B.
    const a = openReview(toISODate(addDays(NOW, -14)));
    const b = openReview(toISODate(addDays(NOW, -1)));
    const date = toISODate(addDays(NOW, 2));

    const updated = applyReviewDateToRow({ reviews: [a, b], reviewId: a.id, instruction: date, now: NOW })!;

    expect(updated.find((r) => r.id === a.id)!.dueDate).toBe(date);
    expect(updated.find((r) => r.id === b.id)!.dueDate).toBe(b.dueDate);
  });

  it('removes only the selected row when its instruction clears the schedule', () => {
    const a = openReview(toISODate(addDays(NOW, -14)));
    const b = openReview(toISODate(addDays(NOW, -1)));

    const updated = applyReviewDateToRow({ reviews: [a, b], reviewId: a.id, instruction: null, now: NOW })!;

    expect(updated.find((r) => r.id === a.id)).toBeUndefined();
    expect(updated.find((r) => r.id === b.id)!.dueDate).toBe(b.dueDate);
  });

  it('leaves other items alone', () => {
    const mine = openReview(toISODate(addDays(NOW, -1)));
    const other = createReview({ practiceItemId: 'item-2', dueDate: toISODate(addDays(NOW, 1)), reviewType: 'retention' }, NOW);
    const date = toISODate(addDays(NOW, 5));

    const updated = applyReviewDateToRow({ reviews: [mine, other], reviewId: mine.id, instruction: date, now: NOW })!;

    expect(updated.find((r) => r.id === mine.id)!.dueDate).toBe(date);
    expect(updated.find((r) => r.id === other.id)!.dueDate).toBe(other.dueDate);
  });
});

describe('computeReviewOutcome — the decision behind closing a block', () => {
  it('requires an explicit now at the type level — this must never read the wall clock', () => {
    // @ts-expect-error — `now` is required; omitting it must fail to compile
    // rather than silently fall back to `new Date()`.
    computeReviewOutcome({ item: item(), scheduleReview: true });
  });

  it("clears the item's next review date when no review is scheduled", () => {
    const stale = item({ nextReviewDate: toISODate(addDays(NOW, -14)) });
    const outcome = computeReviewOutcome({ item: stale, result: 'stable_alone', scheduleReview: false, now: NOW });
    // Tri-state, ready for applyBlockStats: null clears (§1.1), not undefined-keeps.
    expect(outcome.nextReviewDate).toBeNull();
  });

  it("keeps the item's next review date when a review is scheduled", () => {
    const date = toISODate(addDays(NOW, 5));
    const outcome = computeReviewOutcome({
      item: item(),
      result: 'stable_alone',
      scheduleReview: true,
      nextReviewDate: date,
      now: NOW,
    });
    expect(outcome.nextReviewDate).toBe(date);
  });

  it('writes one date to both the item and its new review row', () => {
    const outcome = computeReviewOutcome({
      item: item({ srReps: 2, srIntervalDays: 6, srEase: 2.5 }),
      result: 'stable_in_context',
      scheduleReview: true, // no explicit nextReviewDate — falls back to the SM-2 suggestion
      now: NOW,
    });
    expect(outcome.nextReviewDate).toBeTruthy();
    expect(outcome.review?.dueDate).toBe(outcome.nextReviewDate);
  });

  it('leaves SM-2 state untouched when no review is scheduled', () => {
    const outcome = computeReviewOutcome({
      item: item({ srReps: 3, srEase: 2.6, srIntervalDays: 15 }),
      result: 'worse',
      scheduleReview: false,
      now: NOW,
    });
    expect(outcome.sr).toBeUndefined();
  });
});

describe('adjustable scheduling params', () => {
  it('passing the explicit defaults is byte-identical to passing nothing', () => {
    const cases: { it: PracticeItem; r: Parameters<typeof computeReview>[1] }[] = [
      { it: item(), r: 'stable_alone' },
      { it: item({ srReps: 1, srIntervalDays: 2 }), r: 'stable_alone' },
      { it: item({ srReps: 2, srIntervalDays: 6 }), r: 'stable_in_context' },
      { it: item({ srReps: 4, srIntervalDays: 30 }), r: 'worse' },
      { it: item({ importance: 5, difficulty: 5, srReps: 2, srIntervalDays: 6 }), r: 'stable_in_context' },
    ];
    for (const c of cases) {
      expect(computeReview(c.it, c.r, NOW, DEFAULT_SCHEDULING_PARAMS)).toEqual(computeReview(c.it, c.r, NOW));
    }
  });

  it('the defaults reproduce the historical constants exactly', () => {
    expect(DEFAULT_SCHEDULING_PARAMS.sm2FirstIntervalDays).toBe(2);
    expect(DEFAULT_SCHEDULING_PARAMS.sm2SecondIntervalDays).toBe(6);
    expect(DEFAULT_SCHEDULING_PARAMS.sm2SlipResetDays).toBe(1);
  });

  it('honours widened intervals in the SM-2 rungs', () => {
    const params: SchedulingParams = { ...DEFAULT_SCHEDULING_PARAMS, sm2FirstIntervalDays: 4, sm2SecondIntervalDays: 10 };
    expect(computeReview(item(), 'stable_alone', NOW, params)!.intervalDays).toBe(4);
    expect(computeReview(item({ srReps: 1, srIntervalDays: 4 }), 'stable_alone', NOW, params)!.intervalDays).toBe(10);
  });

  it('honours a longer slip-reset gap, with matching rationale', () => {
    const params: SchedulingParams = { ...DEFAULT_SCHEDULING_PARAMS, sm2SlipResetDays: 3 };
    const r = computeReview(item({ srReps: 4, srIntervalDays: 30 }), 'worse', NOW, params)!;
    expect(r.intervalDays).toBe(3);
    expect(r.rationale).toMatch(/back in 3 days/);
  });

  it('clampSchedulingParams fills defaults, clamps out-of-range, rounds integers', () => {
    expect(clampSchedulingParams(undefined)).toEqual(DEFAULT_SCHEDULING_PARAMS);
    const clamped = clampSchedulingParams({
      sm2FirstIntervalDays: 99,
      sm2SecondIntervalDays: 0,
      sm2SlipResetDays: 2.6,
      warmupShare: 5,
      deepWorkShare: -1,
    });
    expect(clamped.sm2FirstIntervalDays).toBe(SCHEDULING_BOUNDS.sm2FirstIntervalDays[1]); // 4
    expect(clamped.sm2SecondIntervalDays).toBe(SCHEDULING_BOUNDS.sm2SecondIntervalDays[0]); // 3
    expect(clamped.sm2SlipResetDays).toBe(3); // round(2.6) clamped into 1–3
    expect(clamped.warmupShare).toBe(SCHEDULING_BOUNDS.warmupShare[1]); // 0.15
    expect(clamped.deepWorkShare).toBe(SCHEDULING_BOUNDS.deepWorkShare[0]); // 0.25
  });

  it('keeps the review-slot window coherent (max ≥ min)', () => {
    const c = clampSchedulingParams({ reviewSlotMinMinutes: 5, reviewSlotMaxMinutes: 5 });
    expect(c.reviewSlotMaxMinutes).toBeGreaterThanOrEqual(c.reviewSlotMinMinutes);
  });
});

describe('suggestStatusAfterBlock', () => {
  it('promotes shaky → coming together on stable_alone', () => {
    expect(suggestStatusAfterBlock({ item: item({ status: 'fragile' }), result: 'stable_alone', last3AllSame: false }).suggestedStatus).toBe('usable');
  });
  it('keeps status but advises a new strategy after three "same"', () => {
    const s = suggestStatusAfterBlock({ item: item({ status: 'fragile' }), result: 'same', last3AllSame: true });
    expect(s.suggestedStatus).toBeUndefined();
    expect(s.message).toMatch(/strategy/i);
  });
});

describe('snoozePlan ("not now" with an honest date move)', () => {
  it('pushes the due date N days from today — not from the stale old due date', () => {
    expect(snoozePlan(2, NOW).dueDate).toBe(toISODate(addDays(NOW, 2)));
    expect(snoozePlan(7, NOW).dueDate).toBe(toISODate(addDays(NOW, 7)));
  });

  it('never snoozes into the past or by zero', () => {
    expect(snoozePlan(0, NOW).dueDate).toBe(toISODate(addDays(NOW, 1)));
    expect(snoozePlan(-3, NOW).dueDate).toBe(toISODate(addDays(NOW, 1)));
  });
});

describe('shouldSuggestDormant', () => {
  it('suggests dormant after 30+ idle days, but not for resting items', () => {
    const stale = item({ status: 'usable' });
    stale.lastPractisedAt = addDays(NOW, -31).toISOString();
    expect(shouldSuggestDormant(stale, NOW)).toBe(true);

    const maint = item({ status: 'maintenance' });
    maint.lastPractisedAt = addDays(NOW, -60).toISOString();
    expect(shouldSuggestDormant(maint, NOW)).toBe(false);
  });
});
