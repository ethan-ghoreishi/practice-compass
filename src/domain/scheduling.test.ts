import { describe, expect, it } from 'vitest';
import {
  computeReview,
  planNextReview,
  shouldSuggestDormant,
  snoozePlan,
  suggestStatusAfterBlock,
} from './scheduling';
import { createItem } from './factories';
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
});

describe('planNextReview preview', () => {
  it('mirrors computeReview without the SR-state fields', () => {
    const p = planNextReview({ item: item(), result: 'stable_alone', now: NOW })!;
    expect(p.intervalDays).toBe(2);
    expect('srReps' in p).toBe(false);
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
