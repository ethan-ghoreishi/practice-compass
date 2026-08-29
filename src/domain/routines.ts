import { applyBlockStats } from './blocks';
import { defaultModeForStatus, focusForItem } from './defaults';
import { createBlock } from './factories';
import type {
  ID,
  ISODateTime,
  Pathway,
  PathwayRoutine,
  PracticeBlock,
  PracticeItem,
  RoutineSegment,
} from './types';
import { newId, nowISO } from './util';

// ---------------------------------------------------------------------------
// Routines as ordinary editable data: which ones a session sees, how the
// short-on-time filter works, how the runner's wall clock derives the current
// segment, and how a run turns into real practice blocks — one per distinct
// bound item, carrying its actual elapsed running time. Also the binding and
// placement invariants that keep a bound itemId from ever dangling. Pure and
// tested here; the store and the runner stay thin call sites.
// ---------------------------------------------------------------------------

/** Segments to actually run: all of them, or (short on time) only the essential ones. */
export function segmentsForRun(segments: RoutineSegment[], shortOnTime: boolean): RoutineSegment[] {
  return shortOnTime ? segments.filter((s) => s.essential) : segments;
}

/** Routines the session instrument may practise right now. */
export function routinesForInstrument(routines: PathwayRoutine[], instrumentId: ID): PathwayRoutine[] {
  return routines.filter((r) => r.instrumentId === instrumentId);
}

// --- The wall-clock run clock ------------------------------------------------
//
// A run is driven by one monotonic number: total running seconds elapsed
// since it began (E), following the same accumulated + live-since-a-timestamp
// shape as sessionElapsedSeconds (useStore.ts) — pausing genuinely freezes it,
// resuming picks it back up, and a real background/lock interval is simply a
// bigger jump in E next time it's read. A segment's *effective* duration
// starts at its authored minutes and can only be shortened (by Skip, which
// clamps it to whatever has elapsed so far) — never lengthened — so "played
// through" and "cut short" fall out of the same arithmetic, and the current
// segment for any E is found by walking the (small) list of boundaries, which
// is what lets it land on a much later segment after a long interval instead
// of advancing one step at a time.

export interface RunSegment {
  itemId?: ID;
  /** Effective seconds for this run: authored minutes, or Skip-shortened. */
  seconds: number;
}

export function toRunSegments(segments: RoutineSegment[]): RunSegment[] {
  return segments.map((s) => ({ itemId: s.itemId, seconds: Math.max(0, Math.round(s.minutes * 60)) }));
}

/** Cumulative seconds at the START of each segment — length segments.length + 1. */
function boundaries(segments: RunSegment[]): number[] {
  const out = [0];
  for (const s of segments) out.push(out[out.length - 1] + s.seconds);
  return out;
}

export interface RoutineClock {
  /** Index of the segment E currently falls in, or segments.length once finished. */
  segIndex: number;
  /** Seconds already elapsed within the current segment. */
  segElapsedSeconds: number;
  /** Seconds left in the current segment (0 once finished). */
  secondsLeft: number;
  finished: boolean;
}

/** Seconds elapsed while running, given accumulated-before-pause + a live interval — the same shape as sessionElapsedSeconds, so background time is real time, not a fabricated tick count. */
export function runElapsedSeconds(
  accumulatedSeconds: number,
  runningSince: ISODateTime | undefined,
  running: boolean,
  now: Date,
): number {
  const live = running && runningSince ? (now.getTime() - new Date(runningSince).getTime()) / 1000 : 0;
  return Math.max(0, accumulatedSeconds + live);
}

/** Where the wall clock has landed for total elapsed E — jumps across as many boundaries as E demands, in one pass. */
export function locateClock(segments: RunSegment[], elapsedSeconds: number): RoutineClock {
  const bounds = boundaries(segments);
  const total = bounds[bounds.length - 1];
  const e = Math.max(0, elapsedSeconds);
  if (segments.length === 0 || e >= total) {
    return { segIndex: segments.length, segElapsedSeconds: 0, secondsLeft: 0, finished: true };
  }
  for (let i = 0; i < segments.length; i++) {
    if (e < bounds[i + 1]) {
      return { segIndex: i, segElapsedSeconds: e - bounds[i], secondsLeft: bounds[i + 1] - e, finished: false };
    }
  }
  return { segIndex: segments.length, segElapsedSeconds: 0, secondsLeft: 0, finished: true };
}

/** Cut the CURRENT segment short: clamp its effective duration to what has actually elapsed, so the unused remainder is never credited and the next segment starts fresh. A no-op once the run has already finished. */
export function skipCurrentSegment(segments: RunSegment[], elapsedSeconds: number): RunSegment[] {
  const bounds = boundaries(segments);
  const clock = locateClock(segments, elapsedSeconds);
  if (clock.finished) return segments;
  return segments.map((s, i) => (i === clock.segIndex ? { ...s, seconds: elapsedSeconds - bounds[i] } : s));
}

/** Seconds actually spent in one segment given the run's total elapsed E — 0 before it starts, its full effective duration once fully passed, partial while current. */
function segmentElapsed(seg: RunSegment, boundaryBefore: number, elapsedSeconds: number): number {
  return Math.max(0, Math.min(seg.seconds, elapsedSeconds - boundaryBefore));
}

/**
 * Minutes actually spent per bound item, aggregated across EVERY segment that
 * names it — never one entry per segment. Follows the app's existing
 * seconds-to-minutes convention exactly (CloseBlock.tsx's
 * `Math.max(1, Math.round(seconds / 60))`): zero elapsed time for an item
 * means it was never reached this run, so it gets no block at all — but ANY
 * positive elapsed time, however brief, rounds up to at least the 1-minute
 * floor rather than being discarded. A bound item that was genuinely
 * practised is never silently dropped for having too little time.
 */
export function aggregateItemMinutes(segments: RunSegment[], elapsedSeconds: number): Map<ID, number> {
  const bounds = boundaries(segments);
  const secondsByItem = new Map<ID, number>();
  segments.forEach((seg, i) => {
    if (!seg.itemId) return;
    const secs = segmentElapsed(seg, bounds[i], elapsedSeconds);
    secondsByItem.set(seg.itemId, (secondsByItem.get(seg.itemId) ?? 0) + secs);
  });
  const minutesByItem = new Map<ID, number>();
  for (const [itemId, secs] of secondsByItem) {
    if (secs > 0) minutesByItem.set(itemId, Math.max(1, Math.round(secs / 60)));
  }
  return minutesByItem;
}

// --- Turning a run into real practice blocks --------------------------------

export interface RoutineRunOutcome {
  /** One block per distinct bound item, never one per segment. */
  blocks: PracticeBlock[];
  /** Those items, with stats applied — the item's previous result and schedule survive untouched (result defaults to not_logged). */
  items: PracticeItem[];
}

/**
 * At most one block per distinct item touched this run, carrying its real
 * aggregated minutes. Mode/focus/materialId/instrumentId match exactly what
 * starting that item directly would use (useStore.ts's startItemSession), so
 * a routine block is indistinguishable from an ordinary one. No review is
 * scheduled and no SM-2 state is touched — the block's result stays the
 * factory default (`not_logged`), which the rest of the engine already
 * treats honestly everywhere it matters.
 */
export function applyRoutineRun(
  runSegments: RunSegment[],
  elapsedSeconds: number,
  items: PracticeItem[],
  existingBlocksByItem: Map<ID, PracticeBlock[]>,
  now: Date,
): RoutineRunOutcome {
  const minutesByItem = aggregateItemMinutes(runSegments, elapsedSeconds);
  const byId = new Map(items.map((i) => [i.id, i]));
  const blocks: PracticeBlock[] = [];
  const outItems: PracticeItem[] = [];
  for (const [itemId, minutes] of minutesByItem) {
    const item = byId.get(itemId);
    if (!item) continue; // deleted mid-run — the deletion already unbound it
    const block = createBlock(
      {
        practiceItemId: item.id,
        instrumentId: item.instrumentId,
        materialId: item.materialId,
        durationMinutes: minutes,
        mode: defaultModeForStatus(item.status),
        focus: focusForItem(item),
      },
      now,
    );
    blocks.push(block);
    outItems.push(
      applyBlockStats(item, block, {
        itemBlocksIncludingNew: [...(existingBlocksByItem.get(itemId) ?? []), block],
        now,
      }),
    );
  }
  return { blocks, items: outItems };
}

// --- The binding invariant: a bound itemId never dangles ---------------------

function touchRoutine(r: PathwayRoutine, now: Date): PathwayRoutine {
  return { ...r, updatedAt: nowISO(now) };
}

/** Item deletion: unbind it from every segment that named it. The segment survives as an unbound countdown — never removed. */
export function unbindItemFromRoutines(routines: PathwayRoutine[], itemId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) => {
    if (!r.segments.some((s) => s.itemId === itemId)) return r;
    return touchRoutine(
      { ...r, segments: r.segments.map((s) => (s.itemId === itemId ? { ...s, itemId: undefined } : s)) },
      now,
    );
  });
}

/** Item instrument change: unbind it only from routines whose instrument no longer matches — bindings on still-matching routines are left intact. */
export function unbindItemWhereInstrumentMismatch(
  routines: PathwayRoutine[],
  itemId: ID,
  newInstrumentId: ID,
  now: Date,
): PathwayRoutine[] {
  return routines.map((r) => {
    if (r.instrumentId === newInstrumentId) return r;
    if (!r.segments.some((s) => s.itemId === itemId)) return r;
    return touchRoutine(
      { ...r, segments: r.segments.map((s) => (s.itemId === itemId ? { ...s, itemId: undefined } : s)) },
      now,
    );
  });
}

/** A General (no-instrument) pathway accepts any routine; otherwise the two instruments must match exactly. */
function placementCompatible(routineInstrumentId: ID | undefined, pathwayInstrumentId: ID | undefined): boolean {
  return pathwayInstrumentId === undefined || routineInstrumentId === pathwayInstrumentId;
}

/** Pathway deletion: detach every routine placed in it (both pathwayId and stageId cleared) rather than deleting it. */
export function detachRoutinesFromPathway(routines: PathwayRoutine[], pathwayId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) =>
    r.pathwayId === pathwayId ? touchRoutine({ ...r, pathwayId: undefined, stageId: undefined }, now) : r,
  );
}

/** Stage deletion is not pathway deletion: clear only stageId, so the routine stays in the pathway it still belongs to. */
export function detachRoutinesFromStage(routines: PathwayRoutine[], stageId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) => (r.stageId === stageId ? touchRoutine({ ...r, stageId: undefined }, now) : r));
}

/** Pathway instrument change: detach any routine placed there that the new instrument makes incompatible — the routine's own instrument is never rewritten. */
export function detachIncompatibleRoutinesForPathway(
  routines: PathwayRoutine[],
  pathwayId: ID,
  newPathwayInstrumentId: ID | undefined,
  now: Date,
): PathwayRoutine[] {
  return routines.map((r) =>
    r.pathwayId === pathwayId && !placementCompatible(r.instrumentId, newPathwayInstrumentId)
      ? touchRoutine({ ...r, pathwayId: undefined, stageId: undefined }, now)
      : r,
  );
}

/**
 * Enforce the binding + placement invariants against a target instrument:
 * clear item bindings that don't belong to it, and detach the routine from
 * its pathway/stage placement if that placement is no longer compatible.
 * The pathway's own instrument is never touched.
 *
 * This is the one place those invariants are checked, so the store calls it
 * unconditionally on every create and every save — not only when the
 * instrument actually changes — rather than trusting a form's bindings and
 * placement on faith. `newInstrumentId` may be undefined: a routine can be
 * legitimately unscoped (a General-pathway routine, or one a v11 migration
 * correctly declined to invent an instrument for), and no item can match
 * "no instrument", so every binding is cleared in that case.
 */
export function retargetRoutineInstrument(
  routine: PathwayRoutine,
  newInstrumentId: ID | undefined,
  items: PracticeItem[],
  pathway: Pathway | undefined,
  now: Date,
): PathwayRoutine {
  const byId = new Map(items.map((i) => [i.id, i]));
  const segments = routine.segments.map((s) =>
    s.itemId && byId.get(s.itemId)?.instrumentId !== newInstrumentId ? { ...s, itemId: undefined } : s,
  );
  const stillPlaced = placementCompatible(newInstrumentId, pathway?.instrumentId);
  return touchRoutine(
    {
      ...routine,
      instrumentId: newInstrumentId,
      segments,
      pathwayId: stillPlaced ? routine.pathwayId : undefined,
      stageId: stillPlaced ? routine.stageId : undefined,
    },
    now,
  );
}

/** An independent editable copy — new id, new segment objects, so editing the copy never touches the original. */
export function duplicateRoutineData(routine: PathwayRoutine, order: number, now: Date): PathwayRoutine {
  const ts = nowISO(now);
  return {
    ...routine,
    id: newId(),
    name: `${routine.name} (copy)`,
    segments: routine.segments.map((s) => ({ ...s })),
    order,
    createdAt: ts,
    updatedAt: ts,
  };
}
