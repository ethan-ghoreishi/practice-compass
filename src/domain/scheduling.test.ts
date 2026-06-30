import { describe, expect, it } from 'vitest';
import {
  shouldSuggestDormant,
  suggestReview,
  suggestStatusAfterBlock,
} from './scheduling';
import { createItem } from './factories';
import { addDays, toISODate } from './util';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const item = (o: Parameters<typeof createItem>[0]) => createItem(o, NOW);

describe('suggestReview', () => {
  it('maps each result to the documented interval', () => {
    expect(suggestReview({ result: 'worse', now: NOW })?.offsetDays).toBe(1);
    expect(suggestReview({ result: 'same', now: NOW })?.offsetDays).toBe(1);
    expect(suggestReview({ result: 'slightly_better', now: NOW })?.offsetDays).toBe(2);
    expect(suggestReview({ result: 'stable_alone', now: NOW })?.offsetDays).toBe(4);
    expect(suggestReview({ result: 'stable_in_context', now: NOW })?.offsetDays).toBe(7);
    expect(suggestReview({ result: 'performable', now: NOW })?.offsetDays).toBe(21);
  });

  it('flags a strategy change when the result is "same"', () => {
    const s = suggestReview({ result: 'same', now: NOW });
    expect(s?.changeStrategy).toBe(true);
    expect(s?.note).toBeTruthy();
  });

  it('returns null for not_logged', () => {
    expect(suggestReview({ result: 'not_logged', now: NOW })).toBeNull();
  });

  it('computes the due date from today + offset', () => {
    const s = suggestReview({ result: 'stable_alone', now: NOW });
    expect(s?.dueDate).toBe(toISODate(addDays(NOW, 4)));
  });

  it('uses a long interval for maintenance work that held up', () => {
    const s = suggestReview({ result: 'stable_in_context', mode: 'maintain', now: NOW });
    expect(s?.offsetDays).toBe(30);
    expect(s?.reviewType).toBe('maintenance');
  });
});

describe('suggestStatusAfterBlock', () => {
  it('promotes fragile → usable on stable_alone', () => {
    const it0 = item({ instrumentId: 'i', title: 't', status: 'fragile' });
    expect(suggestStatusAfterBlock({ item: it0, result: 'stable_alone', last3AllSame: false }).suggestedStatus).toBe('usable');
  });

  it('promotes usable → integrated on stable_in_context', () => {
    const it0 = item({ instrumentId: 'i', title: 't', status: 'usable' });
    expect(suggestStatusAfterBlock({ item: it0, result: 'stable_in_context', last3AllSame: false }).suggestedStatus).toBe('integrated');
  });

  it('suggests performable on a performable result', () => {
    const it0 = item({ instrumentId: 'i', title: 't', status: 'usable' });
    expect(suggestStatusAfterBlock({ item: it0, result: 'performable', last3AllSame: false }).suggestedStatus).toBe('performable');
  });

  it('keeps status but advises a new strategy after three "same" results', () => {
    const it0 = item({ instrumentId: 'i', title: 't', status: 'fragile' });
    const s = suggestStatusAfterBlock({ item: it0, result: 'same', last3AllSame: true });
    expect(s.suggestedStatus).toBeUndefined();
    expect(s.message).toMatch(/strategy/i);
  });
});

describe('shouldSuggestDormant', () => {
  it('suggests dormant after 30+ idle days, but not for resting items', () => {
    const stale = item({ instrumentId: 'i', title: 't', status: 'usable' });
    stale.lastPractisedAt = addDays(NOW, -31).toISOString();
    expect(shouldSuggestDormant(stale, NOW)).toBe(true);

    const maint = item({ instrumentId: 'i', title: 't', status: 'maintenance' });
    maint.lastPractisedAt = addDays(NOW, -60).toISOString();
    expect(shouldSuggestDormant(maint, NOW)).toBe(false);

    const fresh = item({ instrumentId: 'i', title: 't', status: 'usable' });
    fresh.lastPractisedAt = addDays(NOW, -5).toISOString();
    expect(shouldSuggestDormant(fresh, NOW)).toBe(false);
  });
});
