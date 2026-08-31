import { describe, expect, it } from 'vitest';
import { acknowledgeThrough, nextSignal, shouldKeepAwake } from './practiceSignal';
import { segmentBoundaries, skipCurrentSegment, toRunSegments } from './routines';
import type { RoutineSegment } from './types';

describe('nextSignal: at most one announcement per boundary crossed', () => {
  it('announces once when the clock jumps across several boundaries at once', () => {
    const result = nextSignal(0, 200, [60, 120, 180, 240]); // a locked phone waking up mid-run
    expect(result.announce).toBe(true);
  });

  it('advances the marker to the boundary actually reached, not by one', () => {
    const result = nextSignal(0, 200, [60, 120, 180, 240]);
    expect(result.marker).toBe(3);
  });

  it('announces an ordinary block target exactly once and never again', () => {
    const boundaries = [600]; // a 10-minute target
    const first = nextSignal(undefined, 600, boundaries);
    expect(first.announce).toBe(true);
    expect(first.marker).toBe(1);
    const second = nextSignal(first.marker, 900, boundaries); // overtime
    expect(second.announce).toBe(false);
    const third = nextSignal(second.marker, 1800, boundaries); // way overtime
    expect(third.announce).toBe(false);
  });

  it('does not announce again after pausing across the target and resuming', () => {
    const boundaries = [600];
    const reached = nextSignal(undefined, 600, boundaries);
    expect(reached.announce).toBe(true);
    // Paused: accumulated seconds frozen, elapsed does not move, marker persists.
    const whilePaused = nextSignal(reached.marker, 600, boundaries);
    expect(whilePaused.announce).toBe(false);
    // Resumed and kept practising past the target.
    const afterResume = nextSignal(whilePaused.marker, 750, boundaries);
    expect(afterResume.announce).toBe(false);
  });

  it('treats an absent marker as nothing announced yet', () => {
    // A session persisted before this feature existed, already past target.
    const result = nextSignal(undefined, 650, [600]);
    expect(result.announce).toBe(true);
    expect(result.marker).toBe(1);
  });

  it('announces nothing before the first boundary is reached', () => {
    const result = nextSignal(0, 59, [60, 120]);
    expect(result.announce).toBe(false);
    expect(result.marker).toBe(0);
  });

  it('stays silent once every boundary has been announced', () => {
    const result = nextSignal(2, 999_999, [60, 120]);
    expect(result.announce).toBe(false);
    expect(result.marker).toBe(2);
  });

  it('reports the final boundary distinctly from an intermediate one', () => {
    const boundaries = [60, 120, 180];
    const middle = nextSignal(0, 60, boundaries);
    expect(middle.announce).toBe(true);
    expect(middle.final).toBe(false);
    const last = nextSignal(middle.marker, 180, boundaries);
    expect(last.announce).toBe(true);
    expect(last.final).toBe(true);
  });

  it('announces nothing for an empty or malformed boundary list', () => {
    expect(nextSignal(0, 100, []).announce).toBe(false);
    expect(nextSignal(5, 100, []).marker).toBe(5); // left alone, not reset
    expect(nextSignal(0, 100, [NaN]).announce).toBe(false);
    expect(nextSignal(0, 100, [-5]).announce).toBe(false);
    expect(nextSignal(0, 100, [120, 60]).announce).toBe(false); // out of order
    expect(acknowledgeThrough(3, 100, [])).toBe(3); // left alone, not reset
  });
});

describe('acknowledgeThrough: a deliberate Skip acknowledges without announcing', () => {
  it('advances the marker without announcing when a segment is skipped', () => {
    const boundaries = [60, 120, 180];
    const afterSkip = acknowledgeThrough(0, 60, boundaries);
    expect(afterSkip).toBe(1);
    const check = nextSignal(afterSkip, 60, boundaries);
    expect(check.announce).toBe(false); // the user ended it themselves; nothing to tell them
  });

  it('stays silent on the boundary a skip has just clamped into place', () => {
    // Skip clamps the current segment so its end boundary lands exactly on elapsed.
    const boundaries = [30];
    const marker = acknowledgeThrough(undefined, 30, boundaries);
    const result = nextSignal(marker, 30, boundaries);
    expect(result.announce).toBe(false);
  });
});

describe('shouldKeepAwake: only while genuinely running and visible', () => {
  it('keeps the screen awake only while a clock is running and visible', () => {
    expect(shouldKeepAwake({ hasClock: true, running: true, visible: true })).toBe(true);
  });

  it('does not keep the screen awake while the clock is paused', () => {
    expect(shouldKeepAwake({ hasClock: true, running: false, visible: true })).toBe(false);
  });

  it('does not keep the screen awake while the document is hidden', () => {
    expect(shouldKeepAwake({ hasClock: true, running: true, visible: false })).toBe(false);
  });

  it('does not keep the screen awake when no clock is running', () => {
    // Includes a frozen, non-running clock left by a legacy dual-clock hydration.
    expect(shouldKeepAwake({ hasClock: false, running: false, visible: true })).toBe(false);
  });
});

describe('marker interaction with real skip-produced boundaries (routines.ts)', () => {
  const twoOneMinuteSegments: RoutineSegment[] = [
    { label: 'A', minutes: 1 },
    { label: 'B', minutes: 1 },
  ];

  it('announces nothing when a segment is skipped immediately at zero elapsed', () => {
    const afterSkip = skipCurrentSegment(toRunSegments(twoOneMinuteSegments), 0);
    const bounds = segmentBoundaries(afterSkip); // [0, 60]
    const marker = acknowledgeThrough(undefined, 0, bounds);
    expect(nextSignal(marker, 0, bounds).announce).toBe(false);
  });

  it('advances the marker past a zero-duration boundary created by an immediate skip', () => {
    const afterSkip = skipCurrentSegment(toRunSegments(twoOneMinuteSegments), 0);
    const bounds = segmentBoundaries(afterSkip); // [0, 60]
    const marker = acknowledgeThrough(undefined, 0, bounds);
    expect(marker).toBeGreaterThanOrEqual(1);
  });

  it('stays silent across repeated zero-time skips', () => {
    let segs = toRunSegments(twoOneMinuteSegments);
    segs = skipCurrentSegment(segs, 0); // skip A immediately
    segs = skipCurrentSegment(segs, 0); // skip B immediately too
    const bounds = segmentBoundaries(segs); // [0, 0]
    const marker = acknowledgeThrough(undefined, 0, bounds);
    expect(nextSignal(marker, 0, bounds).announce).toBe(false);
  });

  it('still announces the next genuinely elapsed boundary after a skip', () => {
    const threeOneMinuteSegments: RoutineSegment[] = [
      { label: 'A', minutes: 1 },
      { label: 'B', minutes: 1 },
      { label: 'C', minutes: 1 },
    ];
    const afterSkip = skipCurrentSegment(toRunSegments(threeOneMinuteSegments), 0); // skip A immediately
    const bounds = segmentBoundaries(afterSkip); // [0, 60, 120]
    const marker = acknowledgeThrough(undefined, 0, bounds);
    // B genuinely played through to its real end at 60s.
    expect(nextSignal(marker, 60, bounds).announce).toBe(true);
  });
});
