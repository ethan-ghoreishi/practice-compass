import { describe, expect, it } from 'vitest';
import {
  planNextReview,
  shouldSuggestDormant,
  suggestStatusAfterBlock,
} from './scheduling';
import { createItem } from './factories';
import { addDays, toISODate } from './util';
import type { ItemStatus, Rating } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

function item(o: Partial<{ status: ItemStatus; importance: Rating; difficulty: Rating; reviewMode: 'auto' | 'interval' | 'manual'; reviewIntervalDays: number }>) {
  const it = createItem({ instrumentId: 'i', title: 't', status: o.status ?? 'usable', importance: o.importance ?? 3, difficulty: o.difficulty ?? 3 }, NOW);
  return { ...it, reviewMode: o.reviewMode, reviewIntervalDays: o.reviewIntervalDays };
}

describe('planNextReview · auto mode', () => {
  it('uses the status base interval with neutral metrics', () => {
    expect(planNextReview({ item: item({ status: 'integrated' }), now: NOW })?.intervalDays).toBe(10);
    expect(planNextReview({ item: item({ status: 'performable' }), now: NOW })?.intervalDays).toBe(21);
    expect(planNextReview({ item: item({ status: 'fragile' }), now: NOW })?.intervalDays).toBe(1);
  });

  it('shrinks the interval on a poor result and stretches it on a good one', () => {
    const base = item({ status: 'usable' }); // base 4
    expect(planNextReview({ item: base, result: 'worse', now: NOW })?.intervalDays).toBe(2); // 4*0.5
    expect(planNextReview({ item: base, result: 'stable_in_context', now: NOW })?.intervalDays).toBe(9); // 4*2.2
  });

  it('reviews important and difficult items sooner', () => {
    const plain = planNextReview({ item: item({ status: 'integrated', importance: 3, difficulty: 3 }), now: NOW })!;
    const urgent = planNextReview({ item: item({ status: 'integrated', importance: 5, difficulty: 5 }), now: NOW })!;
    expect(urgent.intervalDays).toBeLessThan(plain.intervalDays);
  });

  it('flags a strategy change on "same" and sets the due date from today', () => {
    const p = planNextReview({ item: item({ status: 'repairing' }), result: 'same', now: NOW })!;
    expect(p.changeStrategy).toBe(true);
    expect(p.dueDate).toBe(toISODate(addDays(NOW, p.intervalDays)));
  });
});

describe('planNextReview · manual & interval modes', () => {
  it('returns null in manual mode (user sets the date)', () => {
    expect(planNextReview({ item: item({ reviewMode: 'manual' }), now: NOW })).toBeNull();
  });

  it('uses the fixed cadence in interval mode', () => {
    const p = planNextReview({ item: item({ reviewMode: 'interval', reviewIntervalDays: 3 }), now: NOW })!;
    expect(p.intervalDays).toBe(3);
    expect(p.dueDate).toBe(toISODate(addDays(NOW, 3)));
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
