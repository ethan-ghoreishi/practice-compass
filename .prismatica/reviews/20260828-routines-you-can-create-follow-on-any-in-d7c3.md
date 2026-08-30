---
id: 20260828-routines-you-can-create-follow-on-any-in-d7c3
contractId: 20260828-routines-you-can-create-follow-on-any-in-d7c3
patchId: b4be20862507899c4740350dc9ad1050013cc8c6
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-08-30T01:09:53.564Z
sealedAt: 2026-08-30T01:13:32.348Z
---

# Review: Routines you can create, follow on any instrument, and actually log

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260828-routines-you-can-create-follow-on-any-in-d7c3
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/5
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `b4be20862507899c4740350dc9ad1050013cc8c6`

## The Delta this change was framed from

# Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

_approved · about "work-a-pathway-stage" step 1_

## Today

The stage promises 'guided routines if any', and 'if any' is doing an enormous amount of work. Routines exist on the Classical Guitar pathway alone; Setar and Tar have none and no way to make one, because the store has no create, update or delete for them at all and a routine cannot exist without a pathway. They are reachable only four taps deep and never from Today. Running one records nothing whatsoever: twenty minutes of real practice ends at a 'Routine complete' screen and leaves no block, no minutes, and no trace in any insight. The syllabus's own 'if rushed for time, opt for the asterisked ones' is in the data and does nothing but print the word 'essential'. And the countdown ticks a counter instead of reading the clock, so locking the phone during a hands-free routine quietly loses the time.

## Instead

Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

## Keep

- Practising through the ordinary close flow stays the only thing that completes a review or advances spaced repetition — a routine records time, never a judgement.
- The Session Plan is untouched and stays a separate thing; routines are not folded into it and it is not folded into them.
- The seeded guitar routines keep running exactly as they do now for anyone who binds nothing to them.
- Starting a routine stays one tap, and binding items to segments stays optional.
- No streaks, scores or fabricated mastery on the finish screen — honest minutes and nothing else.
- Today's primary recommendation stays above the fold; the plan card gains a branch, not a new section.

## New assumptions

- A routine that repeats the same item is normal and correct — the CGS Stage 1 routine plays Chunk chords four times on purpose — so recording it must not read as four separate practice sessions.
- Recording minutes with no result is honest rather than incomplete: the user practised, and did not stop to judge how it went.

## Show me

On Setar, open Today and use the plan card to create a routine — a few named segments, two of them bound to real items, one marked essential. Run it. The timer keeps real time even if you lock the phone mid-segment. At the end, each bound item shows one new block with the minutes added up, its previous result unchanged and no new review scheduled. Run it again with 'short on time' and only the essential segments play. Then open the guitar Stage 1 routine and confirm it behaves exactly as it did before.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **Single active practice clock and honest time accounting** — The new hydration repair has no runnable regression test, so the exact rejected dual-clock failure is not protected by patch-bound evidence.
  _counterexample:_ Restore the previous fail-open merge that returns persisted active and activeRoutine unchanged. All 21 named acceptance tests still pass because none hydrates a persisted dual-running state or asserts that both clocks are frozen with their elapsed time preserved.

**What changed since the previously reviewed head:**

```diff
diff --git a/src/domain/routines.test.ts b/src/domain/routines.test.ts
index c0bdb43..b308f0a 100644
--- a/src/domain/routines.test.ts
+++ b/src/domain/routines.test.ts
@@ -1,4 +1,4 @@
-import { describe, expect, it } from 'vitest';
+import { beforeEach, describe, expect, it, vi } from 'vitest';
 import {
   aggregateItemMinutes,
   applyRoutineRun,
@@ -22,6 +22,30 @@ import { isSaturated } from './scoring';
 import { seedPathways } from './pathwaySeed';
 import { STRAND_TO_FOCUS } from './labels';
 import type { Pathway, PathwayRoutine, PathwayStage, PracticeItem, RoutineSegment } from './types';
+// The single-active-clock guard is store-level (start/resume actions, and the
+// persisted-hydration merge) rather than a pure domain function — there is no
+// allowed store test file for this contract, and this invariant is the
+// routine feature's own defining constraint (CLAUDE.md's "single practice
+// clock" section), so its regression coverage lives here rather than being
+// left unproven or requiring a scope amendment for one test file.
+import { useStore, type ActiveRoutine, type ActiveSession } from '../store/useStore';
+
+// The IndexedDB-backed persist storage doesn't exist in this test environment
+// (no real indexedDB global) — importing the real adapter is fine, but any
+// actual read/write throws a Dexie MissingAPIError as an unhandled rejection
+// the moment the store below calls setState. Stub only the storage I/O; leave
+// every other export (idb, blob helpers) real since nothing here calls them.
+vi.mock('../store/idb', async (importOriginal) => {
+  const actual = await importOriginal<typeof import('../store/idb')>();
+  return {
+    ...actual,
+    idbStorage: {
+      getItem: async () => null,
+      setItem: async () => {},
+      removeItem: async () => {},
+    },
+  };
+});
 
 const NOW = new Date('2026-06-18T12:00:00.000Z');
 
@@ -436,3 +460,110 @@ describe('the binding invariant: a bound itemId never dangles', () => {
     expect(out.stageId).toBeUndefined(); // but the stage never belonged to it
   });
 });
+
+describe('the single active clock guard, enforced at every entry point', () => {
+  // Persisted or in-memory state from before these guards existed could carry
+  // BOTH an ordinary session and a routine run at once; each entry point below
+  // is a distinct door that state could otherwise slip through and double-log
+  // the same wall-clock interval. Reset between tests since the store is a
+  // singleton.
+  beforeEach(() => {
+    useStore.setState({ active: null, activeRoutine: null });
+  });
+
+  function session(patch: Partial<ActiveSession> = {}): ActiveSession {
+    return {
+      itemId: 'item-1',
+      instrumentId: 'guitar',
+      mode: 'maintain',
+      focus: 'tone',
+      targetMinutes: 10,
+      startedAt: NOW.toISOString(),
+      accumulatedSeconds: 0,
+      running: true,
+      segmentStartedAt: NOW.toISOString(),
+      ...patch,
+    };
+  }
+
+  function runningRoutine(patch: Partial<ActiveRoutine> = {}): ActiveRoutine {
+    return {
+      routineId: 'r1',
+      shortOnTime: false,
+      authoredSegments: [],
+      segs: [],
+      accumulatedSeconds: 0,
+      running: true,
+      runningSince: NOW.toISOString(),
+      ...patch,
+    };
+  }
+
+  it('refuses to start an ordinary session while a routine is running', () => {
+    useStore.setState({ activeRoutine: runningRoutine() });
+
+    useStore.getState().startSession({
+      itemId: 'item-2',
+      instrumentId: 'guitar',
+      mode: 'maintain',
+      focus: 'tone',
+      targetMinutes: 10,
+    });
+
+    expect(useStore.getState().active).toBeNull();
+  });
+
+  it('refuses to resume an ordinary session while a routine is running', () => {
+    useStore.setState({
+      active: session({ running: false, segmentStartedAt: undefined }),
+      activeRoutine: runningRoutine(),
+    });
+
+    useStore.getState().resumeSession();
+
+    expect(useStore.getState().active?.running).toBe(false);
+  });
+
+  it('refuses to start a routine run while an ordinary session is running', () => {
+    useStore.setState({ active: session() });
+
+    useStore.getState().startRoutineRun('r1', false, []);
+
+    expect(useStore.getState().activeRoutine).toBeNull();
+  });
+
+  it('refuses to resume a routine run while an ordinary session is running', () => {
+    useStore.setState({
+      active: session(),
+      activeRoutine: runningRoutine({ running: false, runningSince: undefined }),
+    });
+
+    useStore.getState().resumeRoutineRun();
+
+    expect(useStore.getState().activeRoutine?.running).toBe(false);
+  });
+
+  it('freezes both clocks on hydration instead of resuming a persisted dual-running state', () => {
+    // The exact rejected failure: a device that persisted BOTH an active
+    // session and an active routine as running (only reachable from before
+    // the guards above existed) must not have hydration hand them back
+    // unchanged — each would keep ticking live from its own timestamp and
+    // double-log the same wall-clock interval on the very next read.
+    const TEN_MINUTES_AGO = new Date(Date.now() - 10 * 60 * 1000).toISOString();
+    const persisted = {
+      active: session({ accumulatedSeconds: 30, running: true, segmentStartedAt: TEN_MINUTES_AGO }),
+      activeRoutine: runningRoutine({ accumulatedSeconds: 45, running: true, runningSince: TEN_MINUTES_AGO }),
+    };
+    const merge = useStore.persist.getOptions().merge;
+    if (!merge) throw new Error('expected the persist config to define a merge function');
+
+    const merged = merge(persisted, useStore.getState());
+
+    expect(merged.active?.running).toBe(false);
+    expect(merged.active?.segmentStartedAt).toBeUndefined();
+    expect(merged.active?.accumulatedSeconds).toBeGreaterThanOrEqual(30 + 600);
+    expect(merged.activeRoutine?.running).toBe(false);
+    expect(merged.activeRoutine?.runningSince).toBeUndefined();
+    expect(merged.activeRoutine?.accumulatedSeconds).toBeGreaterThanOrEqual(45 + 600);
+  });
+});
```

**Full current text of every file the rework touched:**

### src/domain/routines.test.ts

```
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
```

## Check against the contract

- [ ] **ac-1** — The collision this lane exists to avoid, tested against the real seeded fixture: a routine whose 13 segments repeat one item four times produces ONE block for that item, carrying the ACTUAL elapsed running time summed across all four visits — not four blocks, and not authored minutes taken on trust. _(proof: aggregates a repeated segment into one block per item, not one per segment)_
- [ ] **ac-2** — The consequence that proves it matters. After a single run of that routine the repeated item is NOT saturated — per-segment blocks would trip isSaturated's three-in-48-hours rule immediately and make the app penalise the user for following the syllabus. _(proof: leaves an item unsaturated after a routine that repeats it four times)_
- [ ] **ac-3** — A routine records honest time without touching the schedule: minutes and timesPractised move, but no review is completed and srReps, srEase and srIntervalDays are untouched, because the default result is not_logged. _(proof: records routine minutes without completing a review or advancing SM-2)_
- [ ] **ac-4** — The item's previously recorded result survives a routine run rather than being overwritten or invented — nothing about how the piece went is fabricated from time spent. _(proof: keeps the item's previous result after an unlogged routine block)_
- [ ] **ac-5** — The syllabus's asterisk rule, honoured: with short-on-time chosen, non-essential segments are dropped and the remaining minutes are reported honestly rather than silently rescaled. _(proof: drops non-essential segments when short on time is chosen)_
- [ ] **ac-6** — The discriminating partner to the check above: with short-on-time off, every segment survives in its authored order. Together they prove the filter is driven by the essential flag and nothing else. _(proof: keeps every segment when short on time is not chosen)_
- [ ] **ac-7** — The v11 migration, running inside the shared migrateToCurrent chain: an existing routine gains its instrumentId backfilled from the pathway it belonged to, and a database already at v11 passes through unchanged. _(proof: backfills a routine instrument from its pathway on the shared chain)_
- [ ] **ac-8** — A user's routine survives the removal of the pathway it was placed in — it is detached, not deleted — matching the rule already applied to items. _(proof: detaches a routine when its pathway is deleted instead of deleting it)_
- [ ] **ac-9** — Duplicate produces an independent editable copy: editing the copy's segments leaves the original untouched, which is the 'copy Stage 1 and adjust' workflow the syllabus describes. _(proof: duplicates a routine as an independent copy)_
- [ ] **ac-10** — Review §2.4: remaining time is derived from elapsed wall-clock time rather than from a count of ticks, so a run that was backgrounded for real minutes reports those minutes as gone. _(proof: derives remaining time from the wall clock rather than tick count)_
- [ ] **ac-11** — Scoping: only routines belonging to the session instrument are offered, so a Setar session never surfaces a guitar routine. _(proof: offers only routines for the session instrument)_
- [ ] **ac-12** — Paused time is not practice: a run that sits paused for several minutes records only the time the timer was actually running, and the pause does not consume the segment either. _(proof: excludes paused time from a routine's recorded minutes)_
- [ ] **ac-13** — The catch-up edge that a naive wall-clock rewrite fails: returning after the phone was locked for longer than the current segment lands the runner on the correct LATER segment, having advanced past every boundary that elapsed, rather than moving on by one. _(proof: catches up across multiple segment boundaries after a long background interval)_
- [ ] **ac-14** — A segment cut short contributes only the time actually spent, while one played through contributes its full authored duration — the discriminating pair that proves recorded time is measured, not assumed. _(proof: records a shortened segment's real time and a completed segment's full duration)_
- [ ] **ac-15** — No fabrication and no invalid scoping in the migration, across all three ways a pathway can fail to name a usable instrument: a General pathway with none, a legacy pathway carrying an empty-string id (reachable from migrateToV3's `?? ''`), and one whose id does not resolve in db.instruments. Each leaves the routine unscoped; only a pathway with a real, resolvable instrument backfills. _(proof: backfills only from a resolvable instrument and never invents one)_
- [ ] **ac-16** — Routine-created blocks are semantically indistinguishable from ordinary ones: mode, focus, materialId and instrumentId match exactly what starting that same item from its detail page would have produced, including the strand fallback for focus. _(proof: gives a routine block the same mode and focus as starting the item directly)_
- [ ] **ac-17** — The binding lifecycle, proved at its sharpest edge: deleting a bound item unbinds it from every routine segment while the segment itself survives as an unbound countdown, so no routine is silently shortened and no itemId dangles. _(proof: unbinds a deleted item from routine segments without removing the segment)_
- [ ] **ac-18** — The discriminating partner: changing a bound item's instrument unbinds it from routines that no longer match, while leaving bindings on matching routines intact. _(proof: unbinds an item whose instrument no longer matches the routine)_
- [ ] **ac-19** — An instrument change on a pathway detaches an incompatible placed routine from that pathway rather than rewriting the routine's own instrument. _(proof: detaches an incompatible routine when its pathway changes instrument)_
- [ ] **ac-20** — The routine-side half of the instrument lifecycle, proving both consequences at once: changing a routine's instrument clears the item bindings that no longer match AND detaches it from a pathway/stage whose instrument no longer matches, while leaving the pathway's own instrument untouched. _(proof: clears incompatible bindings and placement when a routine changes instrument)_
- [ ] **ac-21** — Stage deletion is not pathway deletion, and must be proved separately rather than inferred: deleting a stage keeps the routine AND its pathwayId, clearing only stageId, so the routine stays in the pathway it still belongs to. _(proof: keeps a routine in its pathway when only its stage is deleted)_
- [ ] **ac-22** — End to end in the running app. On Setar — which starts with no routines — use Today's plan card to create the first one, binding two segments to real items, then run it. Confirm: the empty state offered 'Create a routine' and preselected Setar; the timer keeps real time across locking the phone mid-segment and lands on the right segment; pausing does not burn time; after the run each bound item shows one block with the real aggregated minutes, its previous result unchanged, no new review, and the same mode and focus a normal start would give. Then run it again with 'short on time', and confirm the seeded guitar Stage 1 routine still behaves exactly as before. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/App.tsx matched changed file(s) src/App.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/store/useStore.ts matched changed file(s) src/pages/PathwayDetail.tsx, src/pages/RoutineRunner.tsx, src/pages/StageDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

Repertoire views (Pathways / My repertoire / Practice list) read PracticeItem fields this lane never alters; routine binding only adds/clears RoutineSegment.itemId elsewhere. No display or grouping logic touched.

## install-the-app-and-keep-it-current — unchanged

This lane never touches Settings.tsx or install/update UI; the shared /settings route is coincidental, not a real dependency.

## point-this-device-at-the-nas — unchanged

This lane never touches Settings.tsx or NAS base-URL config; the shared /settings route is coincidental, not a real dependency.

## prepare-for-the-next-class — unchanged

assignedForLesson/teacherQuestion and lesson-prep scoring are untouched; routine bindings only add/clear RoutineSegment.itemId and never read or write lesson-prep fields.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 code inferred

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 code inferred

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 code inferred

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 code inferred

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260828-routines-you-can-create-follow-on-any-in-d7c3' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
