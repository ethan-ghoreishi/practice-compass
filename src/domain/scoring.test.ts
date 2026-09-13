import { describe, expect, it } from 'vitest';
import { createBlock, createItem } from './factories';
import {
  EXPOSURE_MINUTES_PER_POINT,
  EXPOSURE_PENALTY_MAX,
  EXPOSURE_WINDOW_DAYS,
  exposurePenalty,
  exposureWeight,
  fragilityScore,
  groupBlocksByItem,
  isProactiveCandidate,
  isSaturated,
  lastResultsAllSame,
  lessonUrgencyScore,
  neglectedScore,
  overdueScore,
  recentExposureMinutes,
  scoreItem,
  scoreItems,
} from './scoring';
import { addDays, toISODate } from './util';
import type { BlockResult, ISODate, PracticeBlock, PracticeItem } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

function itemAt(overrides: Parameters<typeof createItem>[0]) {
  return createItem(overrides, NOW);
}

function blockAgo(
  itemId: string,
  daysAgo: number,
  result: BlockResult = 'not_logged',
  durationMinutes = 10,
  hourOfDay = 12,
): PracticeBlock {
  const d = addDays(NOW, -daysAgo);
  d.setHours(hourOfDay, 0, 0, 0);
  return createBlock(
    {
      practiceItemId: itemId,
      instrumentId: 'inst',
      durationMinutes,
      mode: 'repair',
      focus: 'tone',
      result,
      startedAt: d.toISOString(),
    },
    NOW,
  );
}

describe('sub-scores', () => {
  it('fragilityScore maps status to weight', () => {
    expect(fragilityScore('fragile')).toBe(5);
    expect(fragilityScore('performable')).toBe(0);
  });

  it('overdueScore bands whole days past the date', () => {
    const base = itemAt({ instrumentId: 'inst', title: 't' });
    expect(overdueScore({ ...base, nextReviewDate: undefined }, NOW)).toBe(0);
    expect(overdueScore({ ...base, nextReviewDate: day(3) }, NOW)).toBe(0);
    expect(overdueScore({ ...base, nextReviewDate: day(0) }, NOW)).toBe(1);
    expect(overdueScore({ ...base, nextReviewDate: day(-2) }, NOW)).toBe(2);
    expect(overdueScore({ ...base, nextReviewDate: day(-20) }, NOW)).toBe(5);
  });

  it('neglectedScore bands days since the item was touched', () => {
    const base = itemAt({ instrumentId: 'inst', title: 't' });
    expect(neglectedScore({ ...base, lastPractisedAt: addDays(NOW, -1).toISOString() }, NOW)).toBe(0);
    expect(neglectedScore({ ...base, lastPractisedAt: addDays(NOW, -10).toISOString() }, NOW)).toBe(2);
    expect(neglectedScore({ ...base, lastPractisedAt: addDays(NOW, -60).toISOString() }, NOW)).toBe(4);
  });

  it('lesson urgency comes from the commitment’s own class date, and past ones score nothing', () => {
    expect(lessonUrgencyScore(undefined, NOW)).toBe(0);
    expect(lessonUrgencyScore(day(-1), NOW)).toBe(0); // the class has been and gone
    expect(lessonUrgencyScore(day(0), NOW)).toBe(8);
    expect(lessonUrgencyScore(day(1), NOW)).toBe(7);
    expect(lessonUrgencyScore(day(4), NOW)).toBe(6);
    expect(lessonUrgencyScore(day(9), NOW)).toBe(5);
    expect(lessonUrgencyScore(day(15), NOW)).toBe(4);
    expect(lessonUrgencyScore(day(60), NOW)).toBe(3);
    // A commitment to a LATER class carries that later date's urgency — it
    // can never inherit the nearer class's deadline.
    expect(lessonUrgencyScore(day(30), NOW)).toBeLessThan(lessonUrgencyScore(day(1), NOW));
  });
});

// ---------------------------------------------------------------------------
// ac-6 — B5
// ---------------------------------------------------------------------------

describe('over-practice is measured as decaying recent minutes', () => {
  it('recent exposure measures minutes and decays independently of old same results', () => {
    // 1. Equal minutes, split differently, is equal exposure. Counting BLOCKS
    //    made the longer single session read as LESS exposure than three
    //    short ones — the exact inversion this replaces.
    const oneLong = [blockAgo('a', 0, 'not_logged', 30)];
    const threeShort = [
      blockAgo('a', 0, 'not_logged', 10, 9),
      blockAgo('a', 0, 'not_logged', 10, 13),
      blockAgo('a', 0, 'not_logged', 10, 18),
    ];
    expect(recentExposureMinutes(oneLong, NOW)).toBe(recentExposureMinutes(threeShort, NOW));

    // 2. Monotonic in minutes: more recent practice can never count as less.
    let previous = 0;
    for (const minutes of [5, 10, 20, 40, 90]) {
      const value = recentExposureMinutes([blockAgo('a', 0, 'not_logged', minutes)], NOW);
      expect(value, `${minutes} min`).toBeGreaterThan(previous);
      previous = value;
    }

    // 3. Routine and unlogged blocks count exactly like any other: a routine
    //    records real time, and an unlogged block still used the session up.
    for (const result of ['not_logged', 'same', 'performable'] as BlockResult[]) {
      expect(recentExposureMinutes([blockAgo('a', 0, result, 20)], NOW), result).toBe(
        recentExposureMinutes([blockAgo('a', 0, 'not_logged', 20)], NOW),
      );
    }

    // 4. Future-dated blocks are not past exposure.
    const future = createBlock(
      {
        practiceItemId: 'a',
        instrumentId: 'inst',
        durationMinutes: 60,
        mode: 'learn',
        focus: 'tone',
        startedAt: addDays(NOW, 3).toISOString(),
      },
      NOW,
    );
    expect(recentExposureMinutes([future], NOW)).toBe(0);

    // 5. Local CALENDAR days, not rolling hours: a block at 23:00 last night
    //    and one at 01:00 this morning are yesterday and today whatever time
    //    the app is opened, and a UTC-midnight boundary cannot reclassify
    //    them. Both are inside the window, weighted by their own day.
    const lateLastNight = blockAgo('a', 1, 'not_logged', 20, 23);
    const earlyToday = blockAgo('a', 0, 'not_logged', 20, 1);
    expect(recentExposureMinutes([earlyToday], NOW)).toBeGreaterThan(recentExposureMinutes([lateLastNight], NOW));
    // Across a DST change (late-October UK) the day arithmetic still holds:
    // the calendar-day difference is what is counted, not elapsed hours.
    const dstNow = new Date('2026-10-27T12:00:00.000Z');
    const dstBlock = createBlock(
      {
        practiceItemId: 'a',
        instrumentId: 'inst',
        durationMinutes: 30,
        mode: 'learn',
        focus: 'tone',
        startedAt: new Date('2026-10-24T12:00:00.000Z').toISOString(),
      },
      dstNow,
    );
    expect(recentExposureMinutes([dstBlock], dstNow)).toBeCloseTo(30 * exposureWeight(3), 5);

    // 6. It DECAYS, and leaves the window entirely.
    const weights = Array.from({ length: EXPOSURE_WINDOW_DAYS + 1 }, (_, age) => exposureWeight(age));
    for (let age = 1; age < EXPOSURE_WINDOW_DAYS; age++) {
      expect(weights[age], `age ${age}`).toBeLessThan(weights[age - 1]);
    }
    expect(exposureWeight(EXPOSURE_WINDOW_DAYS)).toBe(0);
    expect(recentExposureMinutes([blockAgo('a', EXPOSURE_WINDOW_DAYS + 1, 'not_logged', 120)], NOW)).toBe(0);

    // 7. The penalty is BOUNDED — over-practice can cost points, never
    //    eligibility.
    expect(exposurePenalty([blockAgo('a', 0, 'not_logged', 5)], NOW)).toBe(0);
    expect(exposurePenalty([blockAgo('a', 0, 'not_logged', EXPOSURE_MINUTES_PER_POINT * 2)], NOW)).toBe(2);
    expect(exposurePenalty([blockAgo('a', 0, 'not_logged', 600)], NOW)).toBe(EXPOSURE_PENALTY_MAX);

    // 8. Three OLD "same" results are a strategy hint and NOTHING else: no
    //    permanent saturation, no penalty, no exclusion from selection.
    const oldSame = [40, 45, 50].map((d) => blockAgo('a', d, 'same', 20));
    expect(lastResultsAllSame(oldSame)).toBe(true);
    expect(isSaturated(oldSame, NOW)).toBe(false);
    expect(exposurePenalty(oldSame, NOW)).toBe(0);
    const stale = itemAt({ instrumentId: 'inst', title: 'stalled' });
    expect(scoreItem(stale, oldSame, NOW).total).toBe(scoreItem(stale, [], NOW).total);
    expect(isProactiveCandidate(stale)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

describe('scoreItems is deterministic', () => {
  it('breaks ties on the item id, not the order storage happened to return', () => {
    const a = { ...itemAt({ instrumentId: 'inst', title: 'A' }), id: 'aaa' };
    const b = { ...itemAt({ instrumentId: 'inst', title: 'B' }), id: 'bbb' };
    const c = { ...itemAt({ instrumentId: 'inst', title: 'C' }), id: 'ccc' };
    const permutations: PracticeItem[][] = [
      [a, b, c],
      [c, b, a],
      [b, a, c],
    ];
    const ids = permutations.map((items) => scoreItems(items, groupBlocksByItem([]), NOW).map((s) => s.item.id));
    for (const order of ids) expect(order).toEqual(['aaa', 'bbb', 'ccc']);
  });

  it('a question adds nothing to priority — only a real commitment does', () => {
    const plain = itemAt({ instrumentId: 'inst', title: 'plain' });
    const withCommitment = scoreItem(plain, [], NOW, day(1));
    const without = scoreItem(plain, [], NOW);
    expect(withCommitment.total).toBeGreaterThan(without.total);
    expect(without.parts.lesson).toBe(0);
    // There is no "teacher" term left in the breakdown at all.
    expect(Object.keys(without.parts).sort()).toEqual([
      'difficulty',
      'exposurePenalty',
      'fragility',
      'importance',
      'lesson',
      'neglected',
      'overdue',
    ]);
  });
});
