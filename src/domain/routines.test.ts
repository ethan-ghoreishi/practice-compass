import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  aggregateItemMinutes,
  applyRoutineRun,
  detachIncompatibleRoutinesForPathway,
  detachRoutinesFromPathway,
  detachRoutinesFromStage,
  duplicateRoutineData,
  locateClock,
  retargetRoutineInstrument,
  routinesForInstrument,
  runElapsedSeconds,
  segmentsForRun,
  skipCurrentSegment,
  toRunSegments,
  unbindItemFromRoutines,
  unbindItemWhereInstrumentMismatch,
  type RunSegment,
} from './routines';
import { createItem } from './factories';
import { isSaturated } from './scoring';
import { seedPathways } from './pathwaySeed';
import { STRAND_TO_FOCUS } from './labels';
import type { Pathway, PathwayRoutine, PathwayStage, PracticeItem, RoutineSegment } from './types';
// The single-active-clock guard is store-level (start/resume actions, and the
// persisted-hydration merge) rather than a pure domain function — there is no
// allowed store test file for this contract, and this invariant is the
// routine feature's own defining constraint (CLAUDE.md's "single practice
// clock" section), so its regression coverage lives here rather than being
// left unproven or requiring a scope amendment for one test file.
import { useStore, type ActiveRoutine, type ActiveSession } from '../store/useStore';

// The IndexedDB-backed persist storage doesn't exist in this test environment
// (no real indexedDB global) — importing the real adapter is fine, but any
// actual read/write throws a Dexie MissingAPIError as an unhandled rejection
// the moment the store below calls setState. Stub only the storage I/O; leave
// every other export (idb, blob helpers) real since nothing here calls them.
vi.mock('../store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store/idb')>();
  return {
    ...actual,
    idbStorage: {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    },
  };
});

const NOW = new Date('2026-06-18T12:00:00.000Z');

function item(patch: Partial<PracticeItem> = {}): PracticeItem {
  return { ...createItem({ instrumentId: 'guitar', title: 'Test item' }, NOW), ...patch };
}

function routine(patch: Partial<PathwayRoutine> = {}): PathwayRoutine {
  return {
    id: 'r1',
    instrumentId: 'guitar',
    pathwayId: 'p1',
    stageId: 's1',
    name: 'Routine',
    segments: [],
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...patch,
  };
}

function stage(patch: Partial<PathwayStage> = {}): PathwayStage {
  return {
    id: 's1',
    pathwayId: 'p1',
    code: '1',
    title: 'Stage',
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...patch,
  };
}

describe('segmentsForRun (short on time)', () => {
  const segments: RoutineSegment[] = [
    { label: 'A', minutes: 1, essential: true },
    { label: 'B', minutes: 2 },
    { label: 'C', minutes: 1, essential: true },
  ];

  it('drops non-essential segments when short on time is chosen', () => {
    const out = segmentsForRun(segments, true);
    expect(out.map((s) => s.label)).toEqual(['A', 'C']);
  });

  it('keeps every segment when short on time is not chosen', () => {
    const out = segmentsForRun(segments, false);
    expect(out).toEqual(segments);
  });
});

describe('routinesForInstrument', () => {
  it('offers only routines for the session instrument', () => {
    const setarRoutine = routine({ id: 'r-setar', instrumentId: 'setar' });
    const guitarRoutine = routine({ id: 'r-guitar', instrumentId: 'guitar' });
    expect(routinesForInstrument([setarRoutine, guitarRoutine], 'setar')).toEqual([setarRoutine]);
  });
});

describe('the real seeded CGS Stage 1 fixture (13 segments, one item repeated 4x)', () => {
  // Bind every "Chunk chords (right hand only)" segment (the fixture's own
  // repeated label) to one item — everything else stays unbound.
  const seeded = seedPathways({ guitar: 'guitar', setar: '', tar: '' }, NOW);
  const stage1 = seeded.pathwayRoutines.find((r) => r.name === 'Stage 1 routine · 20 min')!;
  const CHUNK_CHORDS_ITEM = 'item-chunk-chords';
  const boundSegments: RoutineSegment[] = stage1.segments.map((s) =>
    s.label === 'Chunk chords (right hand only)' ? { ...s, itemId: CHUNK_CHORDS_ITEM } : s,
  );
  const runSegments = toRunSegments(boundSegments);
  const totalSeconds = runSegments.reduce((sum, s) => sum + s.seconds, 0);

  it('aggregates a repeated segment into one block per item, not one per segment', () => {
    const minutes = aggregateItemMinutes(runSegments, totalSeconds);
    // Four "Chunk chords" segments at 1 authored minute each, played through.
    expect(minutes.size).toBe(1);
    expect(minutes.get(CHUNK_CHORDS_ITEM)).toBe(4);
  });

  it('leaves an item unsaturated after a routine that repeats it four times', () => {
    const chunkChordsItem = item({ id: CHUNK_CHORDS_ITEM });
    const outcome = applyRoutineRun(runSegments, totalSeconds, [chunkChordsItem], new Map(), NOW);
    expect(outcome.blocks).toHaveLength(1);
    expect(outcome.blocks[0].durationMinutes).toBe(4);
    // Per-segment blocks (the collision this lane exists to avoid) would trip
    // isSaturated's 3-in-48-hours rule immediately; one aggregated block does not.
    expect(isSaturated(outcome.blocks, NOW)).toBe(false);
    expect(outcome.items[0].saturationWarning).toBe(false);
  });
});

describe('applyRoutineRun: honest, unlogged practice', () => {
  it('records routine minutes without completing a review or advancing SM-2', () => {
    const original = item({
      srReps: 5,
      srEase: 2.1,
      srIntervalDays: 10,
      nextReviewDate: '2026-09-01',
      timesPractised: 2,
      totalMinutes: 20,
    });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 300 }];
    const outcome = applyRoutineRun(segs, 300, [original], new Map(), NOW);

    expect(outcome.blocks).toHaveLength(1);
    expect(outcome.blocks[0].result).toBe('not_logged');
    expect(outcome.blocks[0].createdReview).toBe(false);

    const updated = outcome.items[0];
    expect(updated.srReps).toBe(5);
    expect(updated.srEase).toBe(2.1);
    expect(updated.srIntervalDays).toBe(10);
    expect(updated.nextReviewDate).toBe('2026-09-01');
    expect(updated.timesPractised).toBe(3);
    expect(updated.totalMinutes).toBe(25);
  });

  it("keeps the item's previous result after an unlogged routine block", () => {
    const original = item({ lastResult: 'stable_alone' });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 60 }];
    const outcome = applyRoutineRun(segs, 60, [original], new Map(), NOW);
    expect(outcome.items[0].lastResult).toBe('stable_alone');
  });

  it('gives a routine block the same mode and focus as starting the item directly', () => {
    // status 'usable' -> mode 'integrate'; no primaryFocus but a strand -> STRAND_TO_FOCUS fallback.
    const original = item({ status: 'usable', primaryFocus: undefined, strand: 'chords', materialId: 'mat-1' });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 120 }];
    const outcome = applyRoutineRun(segs, 120, [original], new Map(), NOW);
    const block = outcome.blocks[0];
    expect(block.mode).toBe('integrate');
    expect(block.focus).toBe(STRAND_TO_FOCUS.chords); // the strand fallback, not 'other'
    expect(block.materialId).toBe('mat-1');
    expect(block.instrumentId).toBe(original.instrumentId);
  });
});

describe('the wall clock: reads real elapsed time, not a tick count', () => {
  it('derives remaining time from the wall clock rather than tick count', () => {
    const start = '2026-06-18T12:00:00.000Z';
    const later = new Date('2026-06-18T12:02:10.000Z'); // 130s later, no ticks counted
    expect(runElapsedSeconds(10, start, true, later)).toBe(140); // 10 accumulated + 130 live
  });

  it('excludes paused time from a routine\'s recorded minutes', () => {
    const segs: RunSegment[] = [{ itemId: 'i1', seconds: 300 }]; // one 5-minute segment
    // Ran 60s, then paused — accumulated freezes at 60 regardless of real time passing.
    const pausedElapsed = runElapsedSeconds(60, undefined, false, new Date('2026-06-18T12:10:00.000Z'));
    expect(pausedElapsed).toBe(60);
    const pausedClock = locateClock(segs, pausedElapsed);
    expect(pausedClock.segIndex).toBe(0);
    expect(pausedClock.secondsLeft).toBe(240); // the pause did not consume the segment

    // Resume and run 60s more — only running time is added.
    const resumedElapsed = runElapsedSeconds(60, '2026-06-18T12:10:00.000Z', true, new Date('2026-06-18T12:11:00.000Z'));
    expect(resumedElapsed).toBe(120);
    expect(aggregateItemMinutes(segs, resumedElapsed).get('i1')).toBe(2); // 120s, not 420s
  });

  it('catches up across multiple segment boundaries after a long background interval', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
      { itemId: 'c', seconds: 60 },
    ];
    // Locked for long enough to pass segments a and b entirely, landing 10s into c.
    const clock = locateClock(segs, 130);
    expect(clock.segIndex).toBe(2);
    expect(clock.segElapsedSeconds).toBe(10);
    expect(clock.secondsLeft).toBe(50);
    expect(clock.finished).toBe(false);
  });

  it("records a shortened segment's real time and a completed segment's full duration", () => {
    const segs: RunSegment[] = [
      { itemId: 'short', seconds: 180 }, // authored 3 min
      { itemId: 'full', seconds: 120 }, // authored 2 min
    ];
    // Cut the first segment short after 60s (Skip).
    const clamped = skipCurrentSegment(segs, 60);
    expect(clamped[0].seconds).toBe(60);
    // The second segment then plays all the way through.
    const finalElapsed = 60 + 120; // 60s (clamped first) + full 120s second
    const minutes = aggregateItemMinutes(clamped, finalElapsed);
    expect(minutes.get('short')).toBe(1); // 60s -> 1 min, not the authored 3
    expect(minutes.get('full')).toBe(2); // full 120s authored duration
  });

  // The property RoutineRunner's single completion effect relies on to catch
  // EVERY way a run can end (natural tick, background catch-up, or Skip) in
  // one place: skipping the run's last remaining segment must make the very
  // next locateClock call report `finished`, with no separate "did skip end
  // it" signal needed. A store-level fix once called finishRoutine() directly
  // from inside the skip action instead of trusting this property — bypassing
  // the component's result snapshot and leaving the screen blank.
  it('skipping the last segment finishes the run immediately', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
    ];
    // 70s in: segment b (the last one) is 10s underway when Skip is tapped.
    const afterSkip = skipCurrentSegment(segs, 70);
    expect(locateClock(afterSkip, 70).finished).toBe(true);
  });

  it('skipping a middle segment does not finish the run, and lands cleanly at the start of the next one', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
      { itemId: 'c', seconds: 60 },
    ];
    // 20s into segment a (the first, not last) when Skip is tapped.
    const afterSkip = skipCurrentSegment(segs, 20);
    const clock = locateClock(afterSkip, 20);
    expect(clock.finished).toBe(false);
    expect(clock.segIndex).toBe(1); // landed on b
    expect(clock.segElapsedSeconds).toBe(0); // b starts fresh, no carryover
  });

  it('skipping the single segment of a one-segment run finishes it (the boundary both routines and short-on-time single-essential-segment runs can hit)', () => {
    const segs: RunSegment[] = [{ itemId: 'only', seconds: 60 }];
    const afterSkip = skipCurrentSegment(segs, 5);
    expect(locateClock(afterSkip, 5).finished).toBe(true);
  });
});

describe('aggregateItemMinutes: the whole-minute convention, at its edges', () => {
  it('never records a block for an item with exactly zero elapsed time', () => {
    const segs: RunSegment[] = [{ itemId: 'never-reached', seconds: 60 }];
    // The run ends before this segment's boundary is ever reached.
    expect(aggregateItemMinutes(segs, 0).has('never-reached')).toBe(false);
  });

  it('rounds any positive elapsed time up to the 1-minute floor, never discarding it', () => {
    const segs: RunSegment[] = [{ itemId: 'brief', seconds: 60 }];
    // Only 8 real seconds elapsed (e.g. skipped almost immediately) — well
    // under a minute, but genuinely practised, so it must still get a block.
    const minutes = aggregateItemMinutes(segs, 8);
    expect(minutes.get('brief')).toBe(1); // CloseBlock's Math.max(1, Math.round(secs/60))
  });
});

describe('duplicateRoutine: an independent copy', () => {
  it('duplicates a routine as an independent copy', () => {
    const original = routine({ segments: [{ label: 'A', minutes: 1 }] });
    const copy = duplicateRoutineData(original, 1, NOW);

    expect(copy.id).not.toBe(original.id);
    expect(copy.segments).not.toBe(original.segments);

    copy.segments[0].label = 'Edited';
    expect(original.segments[0].label).toBe('A');
  });
});

describe('detach vs delete on pathway/stage removal', () => {
  it('detaches a routine when its pathway is deleted instead of deleting it', () => {
    const r = routine({ pathwayId: 'p1', stageId: 's1' });
    const out = detachRoutinesFromPathway([r], 'p1', NOW);
    expect(out).toHaveLength(1);
    expect(out[0].pathwayId).toBeUndefined();
    expect(out[0].stageId).toBeUndefined();
  });

  it('keeps a routine in its pathway when only its stage is deleted', () => {
    const r = routine({ pathwayId: 'p1', stageId: 's1' });
    const out = detachRoutinesFromStage([r], 's1', NOW);
    expect(out).toHaveLength(1);
    expect(out[0].pathwayId).toBe('p1');
    expect(out[0].stageId).toBeUndefined();
  });
});

describe('the binding invariant: a bound itemId never dangles', () => {
  it('unbinds a deleted item from routine segments without removing the segment', () => {
    const r = routine({
      segments: [
        { label: 'Bound', minutes: 3, itemId: 'gone' },
        { label: 'Unbound', minutes: 2 },
      ],
    });
    const out = unbindItemFromRoutines([r], 'gone', NOW);
    expect(out[0].segments).toHaveLength(2);
    expect(out[0].segments[0].itemId).toBeUndefined();
    expect(out[0].segments[0].label).toBe('Bound');
    expect(out[0].segments[0].minutes).toBe(3);
  });

  it('unbinds an item whose instrument no longer matches the routine', () => {
    const mismatched = routine({ id: 'r-guitar', instrumentId: 'guitar', segments: [{ label: 'A', minutes: 1, itemId: 'x' }] });
    const matching = routine({ id: 'r-setar', instrumentId: 'setar', segments: [{ label: 'B', minutes: 1, itemId: 'x' }] });
    const out = unbindItemWhereInstrumentMismatch([mismatched, matching], 'x', 'setar', NOW);
    expect(out.find((r) => r.id === 'r-guitar')!.segments[0].itemId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-setar')!.segments[0].itemId).toBe('x'); // left intact
  });

  it('detaches an incompatible routine when its pathway changes instrument', () => {
    const compatible = routine({ id: 'r-guitar', instrumentId: 'guitar', pathwayId: 'p1', stageId: 's1' });
    const incompatible = routine({ id: 'r-setar', instrumentId: 'setar', pathwayId: 'p1', stageId: 's1' });
    const out = detachIncompatibleRoutinesForPathway([compatible, incompatible], 'p1', 'guitar', NOW);
    expect(out.find((r) => r.id === 'r-setar')!.pathwayId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-setar')!.stageId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-guitar')!.pathwayId).toBe('p1'); // still compatible, still placed
  });

  it("clears incompatible bindings and placement when a routine changes instrument", () => {
    const setarItem = item({ id: 'item-setar', instrumentId: 'setar' });
    const guitarItem = item({ id: 'item-guitar', instrumentId: 'guitar' });
    const r = routine({
      instrumentId: 'setar',
      pathwayId: 'p1',
      stageId: 's1',
      segments: [
        { label: 'A', minutes: 1, itemId: 'item-setar' },
        { label: 'B', minutes: 1, itemId: 'item-guitar' },
      ],
    });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'setar',
      name: 'Setar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, 'guitar', [setarItem, guitarItem], pathway, stage(), NOW);

    expect(out.instrumentId).toBe('guitar');
    expect(out.segments[0].itemId).toBeUndefined(); // setar item no longer matches
    expect(out.segments[1].itemId).toBe('item-guitar'); // guitar item still matches
    expect(out.pathwayId).toBeUndefined(); // pathway is still 'setar' — now incompatible
    expect(out.stageId).toBeUndefined();
    // The pathway itself is never rewritten.
    expect(pathway.instrumentId).toBe('setar');
  });

  it('clears every binding and detaches from a specific-instrument pathway when the target instrument is undefined', () => {
    // The store calls retargetRoutineInstrument on EVERY save, not only when
    // the instrument changed — this is what stops a form from persisting a
    // mismatched itemId or placement on an unchanged instrument, and what
    // lets a routine go (or stay) honestly unscoped without inventing one.
    const guitarItem = item({ id: 'item-guitar', instrumentId: 'guitar' });
    const r = routine({
      instrumentId: 'guitar',
      pathwayId: 'p1',
      stageId: 's1',
      segments: [{ label: 'A', minutes: 1, itemId: 'item-guitar' }],
    });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'guitar',
      name: 'Guitar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, undefined, [guitarItem], pathway, stage(), NOW);

    expect(out.instrumentId).toBeUndefined();
    expect(out.segments[0].itemId).toBeUndefined(); // no instrument can match a bound item
    expect(out.pathwayId).toBeUndefined(); // the guitar pathway no longer matches
    expect(out.stageId).toBeUndefined();
  });

  it('stays placed on a General (no-instrument) pathway when the target instrument is undefined', () => {
    const r = routine({ instrumentId: undefined, pathwayId: 'p-general', stageId: 's1', segments: [] });
    const generalPathway: Pathway = {
      id: 'p-general',
      name: 'General',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, undefined, [], generalPathway, stage({ pathwayId: 'p-general' }), NOW);

    expect(out.instrumentId).toBeUndefined();
    expect(out.pathwayId).toBe('p-general');
    expect(out.stageId).toBe('s1');
  });

  it('clears a placement pointing at a pathway that no longer resolves, instead of treating it as an unscoped General pathway', () => {
    // A pathwayId that no longer resolves to a real pathway must not be
    // treated as an unscoped (therefore "compatible") General pathway just
    // because the caller's lookup came back undefined.
    const r = routine({ instrumentId: 'guitar', pathwayId: 'missing', stageId: 's1' });

    const out = retargetRoutineInstrument(r, 'guitar', [], undefined, stage(), NOW);

    expect(out.pathwayId).toBeUndefined();
    expect(out.stageId).toBeUndefined();
  });

  it('clears a stageId that belongs to a different pathway while keeping a still-valid pathwayId', () => {
    const r = routine({ instrumentId: 'guitar', pathwayId: 'p1', stageId: 's-other' });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'guitar',
      name: 'Guitar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };
    const foreignStage = stage({ id: 's-other', pathwayId: 'p-other' });

    const out = retargetRoutineInstrument(r, 'guitar', [], pathway, foreignStage, NOW);

    expect(out.pathwayId).toBe('p1'); // the pathway itself is still real and compatible
    expect(out.stageId).toBeUndefined(); // but the stage never belonged to it
  });
});

describe('the single active clock guard, enforced at every entry point', () => {
  // Persisted or in-memory state from before these guards existed could carry
  // BOTH an ordinary session and a routine run at once; each entry point below
  // is a distinct door that state could otherwise slip through and double-log
  // the same wall-clock interval. Reset between tests since the store is a
  // singleton.
  beforeEach(() => {
    useStore.setState({ active: null, activeRoutine: null });
  });

  function session(patch: Partial<ActiveSession> = {}): ActiveSession {
    return {
      itemId: 'item-1',
      instrumentId: 'guitar',
      mode: 'maintain',
      focus: 'tone',
      targetMinutes: 10,
      startedAt: NOW.toISOString(),
      accumulatedSeconds: 0,
      running: true,
      segmentStartedAt: NOW.toISOString(),
      ...patch,
    };
  }

  function runningRoutine(patch: Partial<ActiveRoutine> = {}): ActiveRoutine {
    return {
      routineId: 'r1',
      shortOnTime: false,
      authoredSegments: [],
      segs: [],
      accumulatedSeconds: 0,
      running: true,
      runningSince: NOW.toISOString(),
      ...patch,
    };
  }

  it('refuses to start an ordinary session while a routine is running', () => {
    useStore.setState({ activeRoutine: runningRoutine() });

    useStore.getState().startSession({
      itemId: 'item-2',
      instrumentId: 'guitar',
      mode: 'maintain',
      focus: 'tone',
      targetMinutes: 10,
    });

    expect(useStore.getState().active).toBeNull();
  });

  it('refuses to resume an ordinary session while a routine is running', () => {
    useStore.setState({
      active: session({ running: false, segmentStartedAt: undefined }),
      activeRoutine: runningRoutine(),
    });

    useStore.getState().resumeSession();

    expect(useStore.getState().active?.running).toBe(false);
  });

  it('refuses to start a routine run while an ordinary session is running', () => {
    useStore.setState({ active: session() });

    useStore.getState().startRoutineRun('r1', false, []);

    expect(useStore.getState().activeRoutine).toBeNull();
  });

  it('refuses to resume a routine run while an ordinary session is running', () => {
    useStore.setState({
      active: session(),
      activeRoutine: runningRoutine({ running: false, runningSince: undefined }),
    });

    useStore.getState().resumeRoutineRun();

    expect(useStore.getState().activeRoutine?.running).toBe(false);
  });

  it('freezes both clocks on hydration instead of resuming a persisted dual-running state', () => {
    // The exact rejected failure: a device that persisted BOTH an active
    // session and an active routine as running (only reachable from before
    // the guards above existed) must not have hydration hand them back
    // unchanged — each would keep ticking live from its own timestamp and
    // double-log the same wall-clock interval on the very next read.
    const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const persisted = {
      active: session({ accumulatedSeconds: 30, running: true, segmentStartedAt: TEN_MINUTES_AGO }),
      activeRoutine: runningRoutine({ accumulatedSeconds: 45, running: true, runningSince: TEN_MINUTES_AGO }),
    };
    const merge = useStore.persist.getOptions().merge;
    if (!merge) throw new Error('expected the persist config to define a merge function');

    const merged = merge(persisted, useStore.getState());

    expect(merged.active?.running).toBe(false);
    expect(merged.active?.segmentStartedAt).toBeUndefined();
    expect(merged.active?.accumulatedSeconds).toBeGreaterThanOrEqual(30 + 600);
    expect(merged.activeRoutine?.running).toBe(false);
    expect(merged.activeRoutine?.runningSince).toBeUndefined();
    expect(merged.activeRoutine?.accumulatedSeconds).toBeGreaterThanOrEqual(45 + 600);
  });
});
