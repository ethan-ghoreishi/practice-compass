import { describe, expect, it } from 'vitest';
import {
  instrumentBalance,
  nextLessonNumber,
  practiceTotals,
  practiceTotalsByInstrument,
  startOfWeekISODate,
  totalMinutesInWindow,
} from './selectors';
import { createBlock, createInstrument } from './factories';
import type { Instrument, Lesson, PracticeBlock } from './types';

function instrument(id: string): Instrument {
  return { ...createInstrument({ name: id }, new Date(2026, 0, 1)), id };
}

function lesson(partial: Partial<Lesson> & { id: string; instrumentId: string; date: string }): Lesson {
  return { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...partial };
}

describe('nextLessonNumber', () => {
  it('is 1 when the instrument has no numbered lessons', () => {
    expect(nextLessonNumber([], 'setar')).toBe(1);
    expect(nextLessonNumber([lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01' })], 'setar')).toBe(1);
  });

  it('is max existing number + 1, scoped per instrument', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 3 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-02-01', number: 7 }),
      lesson({ id: 'c', instrumentId: 'tar', date: '2026-02-01', number: 40 }),
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(8);
    expect(nextLessonNumber(lessons, 'tar')).toBe(41);
  });

  it('ignores unnumbered lessons when computing the max', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 5 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-03-01' }), // no number
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(6);
  });
});

// --- B1: honest calendar totals ----------------------------------------------
//
// The trap `blocksInWindow` sets is that it filters on HOURS, so days:1 means
// "the last 24 hours" and days:7 means "the last 168" — the wrong answer to
// "how much have I practised today?". These are CALENDAR figures, and the
// choice is pinned here rather than left as a comment.
//
// Local time throughout: the tests construct dates with the local `Date(y, m,
// d, h)` constructor, exactly as the helpers read them, so they hold in any
// timezone the owner's devices run in.

function pBlock(startedAt: Date, durationMinutes: number, instrumentId = 'setar'): PracticeBlock {
  return createBlock(
    {
      practiceItemId: 'item-1',
      instrumentId,
      durationMinutes,
      mode: 'repair',
      focus: 'tone',
      result: 'slightly_better',
      startedAt: startedAt.toISOString(),
    },
    startedAt,
  );
}

// Thursday 18 June 2026, 12:00 local.
const THURSDAY = new Date(2026, 5, 18, 12, 0);

describe('practiceTotals · calendar days, not rolling windows', () => {
  it("counts by calendar day, so a block from late yesterday is not part of today's total", () => {
    // Deliberately INSIDE the last 24 hours — 22:30 the previous evening is
    // only 13½ hours before "now" — and just as deliberately NOT today.
    const lateYesterday = pBlock(new Date(2026, 5, 17, 22, 30), 40);
    const justAfterMidnight = pBlock(new Date(2026, 5, 18, 0, 20), 15);

    const totals = practiceTotals([lateYesterday, justAfterMidnight], THURSDAY);
    expect(totals.today).toEqual({ minutes: 15, blocks: 1 });
    // The rolling-window helper would have swept both in — that is the bug.
    expect(totalMinutesInWindow([lateYesterday, justAfterMidnight], THURSDAY, 1)).toBe(55);
    // Both are still this week, and both are still all time.
    expect(totals.week).toEqual({ minutes: 55, blocks: 2 });
    expect(totals.allTime).toEqual({ minutes: 55, blocks: 2 });
  });

  it('counts a midnight-crossing block whole against the day it began, including across the Monday boundary', () => {
    // A block begun 23:40 on Wednesday, 40 minutes long: its minutes run past
    // midnight, and ALL of them belong to Wednesday. `durationMinutes` is the
    // figure the owner attested to and deliberately diverges from wall clock,
    // and routine blocks carry no endedAt to split by — so a block is one
    // indivisible unit of attested practice.
    const crossesMidnight = pBlock(new Date(2026, 5, 17, 23, 40), 40);
    expect(practiceTotals([crossesMidnight], THURSDAY).today).toEqual({ minutes: 0, blocks: 0 });
    expect(practiceTotals([crossesMidnight], new Date(2026, 5, 17, 23, 59)).today).toEqual({ minutes: 40, blocks: 1 });

    // The SAME rule decides the Monday boundary: begun Sunday 23:30, it
    // belongs whole to the week that is ending, with nothing carried into the
    // week that begins forty minutes later.
    const sundayNight = pBlock(new Date(2026, 5, 14, 23, 30), 40); // Sunday 14 June 2026
    const monday = new Date(2026, 5, 15, 9, 0);
    expect(practiceTotals([sundayNight], monday).week).toEqual({ minutes: 0, blocks: 0 });
    expect(practiceTotals([sundayNight], new Date(2026, 5, 14, 23, 59)).week).toEqual({ minutes: 40, blocks: 1 });
  });

  it("starts the week on Monday so Sunday's practice belongs to the week that is ending", () => {
    const sunday = new Date(2026, 5, 14, 20, 0); // Sunday 14 June 2026
    const monday = new Date(2026, 5, 15, 8, 0);
    expect(startOfWeekISODate(monday)).toBe('2026-06-15');
    expect(startOfWeekISODate(sunday)).toBe('2026-06-08'); // the week that is ending
    // Saturday is still that same week; Thursday's week began on the 15th.
    expect(startOfWeekISODate(new Date(2026, 5, 20, 8, 0))).toBe('2026-06-15');
    expect(startOfWeekISODate(THURSDAY)).toBe('2026-06-15');

    const sundayBlock = pBlock(sunday, 25);
    const mondayBlock = pBlock(monday, 30);
    // Asked on Monday: only Monday's practice is in the new week.
    expect(practiceTotals([sundayBlock, mondayBlock], monday).week).toEqual({ minutes: 30, blocks: 1 });
    // Asked on Sunday evening: Sunday's practice is in the week that is ending.
    expect(practiceTotals([sundayBlock], sunday).week).toEqual({ minutes: 25, blocks: 1 });
  });

  it('reports minutes and blocks per instrument, all time included', () => {
    const blocks = [
      pBlock(THURSDAY, 20, 'setar'),
      pBlock(new Date(2026, 5, 16, 10, 0), 30, 'setar'),
      pBlock(new Date(2026, 2, 3, 10, 0), 45, 'guitar'), // months ago
    ];
    const rows = practiceTotalsByInstrument(
      [instrument('setar'), instrument('guitar')],
      blocks,
      THURSDAY,
    );
    expect(rows.map((r) => r.instrumentId)).toEqual(['setar', 'guitar']); // most all-time minutes first
    expect(rows[0]).toMatchObject({
      today: { minutes: 20, blocks: 1 },
      week: { minutes: 50, blocks: 2 },
      allTime: { minutes: 50, blocks: 2 },
    });
    expect(rows[1]).toMatchObject({
      today: { minutes: 0, blocks: 0 },
      week: { minutes: 0, blocks: 0 },
      allTime: { minutes: 45, blocks: 1 },
    });
  });
});

// --- A10: the one shipped derived figure that was arithmetically wrong --------

describe('instrumentBalance · the denominator covers exactly the rows shown', () => {
  it('percentages sum to 100 when blocks exist for an instrument not in the supplied list', () => {
    // Exactly what Today produces: only the ACTIVE instruments, with ALL
    // blocks — including a retired instrument's, which gets no row of its own.
    const supplied = [instrument('setar'), instrument('tar')];
    const blocks = [
      pBlock(THURSDAY, 30, 'setar'),
      pBlock(THURSDAY, 20, 'tar'),
      pBlock(THURSDAY, 40, 'guitar'), // retired — no row emitted for it
    ];

    const rows = instrumentBalance(supplied, blocks, THURSDAY, 7);
    expect(rows.reduce((s, r) => s + r.percent, 0)).toBe(100);
    expect(rows.find((r) => r.instrumentId === 'setar')!.percent).toBe(60);
    expect(rows.find((r) => r.instrumentId === 'tar')!.percent).toBe(40);
    // The retired instrument's minutes are in neither a row nor the denominator.
    expect(rows.map((r) => r.instrumentId)).toEqual(['setar', 'tar']);
  });

  it('reports zero percent for every instrument when nothing was practised', () => {
    const rows = instrumentBalance([instrument('setar')], [], THURSDAY, 7);
    expect(rows[0]).toMatchObject({ minutes: 0, blocks: 0, percent: 0 });
  });
});
