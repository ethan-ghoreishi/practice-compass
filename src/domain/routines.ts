import { applyBlockStats } from './blocks';
import { defaultModeForStatus, focusForItem } from './defaults';
import { createBlock } from './factories';
import { RESULT_LABELS } from './labels';
import type {
  BlockResult,
  ID,
  ISODateTime,
  Pathway,
  PathwayRoutine,
  PathwayStage,
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

/** A routine's authored length: the total its segments were written to fill. */
export function routineTotalMinutes(segments: RoutineSegment[]): number {
  return segments.reduce((n, s) => n + Math.max(0, s.minutes), 0);
}

/**
 * A ROUTINE'S AUTHORED MINUTES ARE PROPORTIONS, NOT A FIXED LENGTH.
 *
 * A curriculum routine says "twice as long on the piece as on chords"; running
 * it in the time you actually have should keep that and change nothing else. So
 * fitting is proportional scaling, and a segment keeps its label, its note, its
 * essential flag and its bound item — only the MINUTES ever move.
 *
 * Two knobs, not one: this is a TIME decision and `segmentsForRun`'s
 * "short on time — essentials only" is a CONTENT decision. They compose (fit
 * what essentials-only left) and neither replaces the other.
 *
 * Returns the input array UNCHANGED at the authored total, so doing nothing
 * behaves exactly as it always did.
 *
 * Scaling alone cannot reach a short total — a one-minute floor on every
 * segment overshoots — so DROPPING is part of the fit, and it follows the
 * routine's OWN priority: non-essential first, latest first, so the syllabus's
 * own `⭐`/essential marking keeps meaning what it means.
 *
 * The floor is applied as a REPAIR after the proportional split, never as a
 * minute reserved before it: handing every segment one minute up front and
 * sharing out only the remainder distorts the authored proportions for no
 * reason (1:9 fitted to 20 gave 3:17 where 2:18 is both exact and legal). The Session Plan's
 * bucket-priority allocator is deliberately NOT reused: it pins a warm-up share
 * and clamps every segment to 2-25 minutes, which would distort a one-minute
 * syllabus segment and entangle two systems the app keeps as peers.
 */
export function fitRoutineToMinutes(segments: RoutineSegment[], targetMinutes: number): RoutineSegment[] {
  const target = Math.floor(targetMinutes);
  if (segments.length === 0 || !Number.isFinite(target) || target <= 0) return [];
  if (target === routineTotalMinutes(segments)) return segments;

  // Every surviving segment needs at least its one-minute floor.
  const kept = [...segments];
  while (kept.length > target) {
    let drop = kept.length - 1;
    for (let k = kept.length - 1; k >= 0; k--) {
      if (!kept[k].essential) {
        drop = k;
        break;
      }
    }
    kept.splice(drop, 1);
  }

  // PROPORTIONAL OVER THE WHOLE TARGET, largest remainder first (earlier segment
  // wins a tie). The floor is a REPAIR applied afterwards, never a minute handed
  // out before the proportions are read: reserving one minute each and splitting
  // only what was left over distorts every share for no reason — 1:9 fitted to
  // 20 came out 3:17 where the authored proportion is exactly 2:18.
  const weightTotal = routineTotalMinutes(kept);
  const shares = kept.map((s) =>
    weightTotal > 0 ? (target * Math.max(0, s.minutes)) / weightTotal : target / kept.length,
  );
  const whole = shares.map((v) => Math.floor(v));
  let spare = target - whole.reduce((a, b) => a + b, 0);
  const order = shares
    .map((v, k) => ({ k, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || a.k - b.k);
  for (const { k } of order) {
    if (spare <= 0) break;
    whole[k] += 1;
    spare -= 1;
  }

  // Lift any segment rounded to nothing up to its one-minute floor, taking the
  // minute from the longest segment that can spare one (earliest on a tie). The
  // total never moves, and it terminates: every lift removes one zero, and
  // `kept.length <= target` guarantees a donor with 2 or more exists.
  for (let k = 0; k < whole.length; k++) {
    if (whole[k] > 0) continue;
    let donor = -1;
    for (let d = 0; d < whole.length; d++) {
      if (whole[d] >= 2 && (donor < 0 || whole[d] > whole[donor])) donor = d;
    }
    if (donor < 0) break;
    whole[donor] -= 1;
    whole[k] += 1;
  }
  return kept.map((s, idx) => ({ ...s, minutes: whole[idx] }));
}

/**
 * WHAT A FIT DROPPED, SAID HONESTLY — or null when it dropped nothing.
 *
 * Cutting the time far enough eventually reaches the ESSENTIAL segments too:
 * `fitRoutineToMinutes` drops non-essential first and latest first, and only
 * then an essential one. Reporting that as "non-essential dropped" is a plain
 * untruth about the one distinction the syllabus's own ⭐ marking exists to
 * make, and it is exactly what the control used to say.
 *
 * It is a pure FORMATTER here rather than an expression inside the component
 * for the reason this app keeps giving: written inline it would be unreachable
 * from a Node test, and it is the sentence, not the arithmetic, that was wrong.
 */
export function describeFitDrop(segments: RoutineSegment[], fitted: RoutineSegment[]): string | null {
  const dropped = segments.length - fitted.length;
  if (dropped <= 0) return null;
  const essential = segments.filter((s) => s.essential).length - fitted.filter((s) => s.essential).length;
  return essential > 0
    ? `${dropped} segment(s) dropped, ${essential} of them essential`
    : `${dropped} non-essential segment(s) dropped`;
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
  /** Effective seconds for this run: authored minutes, or shortened by Move on / Skip / Remove. */
  seconds: number;
  /**
   * Skipped or removed in this run: whatever time passed in it is NOT
   * practice and credits nothing. Absent on a legacy run, whose old skip kept
   * its elapsed time — never reinterpreted.
   */
  skipped?: boolean;
}

export function toRunSegments(segments: RoutineSegment[]): RunSegment[] {
  return segments.map((s) => ({ itemId: s.itemId, seconds: Math.max(0, Math.round(s.minutes * 60)) }));
}

/** Cumulative seconds at the START of each segment — length segments.length + 1. */
function cumulativeStarts(segments: RunSegment[]): number[] {
  const out = [0];
  for (const s of segments) out.push(out[out.length - 1] + s.seconds);
  return out;
}

/**
 * The run's ordered cumulative END boundaries — one per segment, the same
 * numbers `locateClock` advances on, by construction rather than by a second
 * cumulative sum recomputed elsewhere. This is what `practiceSignal.ts`'s
 * `nextSignal`/`acknowledgeThrough` consume: an ordinary block passes
 * `[targetMinutes * 60]` directly instead.
 */
export function segmentBoundaries(segments: RunSegment[]): number[] {
  return cumulativeStarts(segments).slice(1);
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
  const bounds = cumulativeStarts(segments);
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

/** MOVE ON: cut the CURRENT segment short and KEEP what was practised — clamp its effective duration to what has actually elapsed, so the unused remainder is never credited (nor handed to another segment) and the next segment starts fresh. A no-op once the run has already finished. */
export function skipCurrentSegment(segments: RunSegment[], elapsedSeconds: number): RunSegment[] {
  const bounds = cumulativeStarts(segments);
  const clock = locateClock(segments, elapsedSeconds);
  if (clock.finished) return segments;
  return segments.map((s, i) => (i === clock.segIndex ? { ...s, seconds: elapsedSeconds - bounds[i] } : s));
}

/** SKIP without practising: end the CURRENT segment where it stands AND record nothing for this occurrence, however long it ran. Earlier occurrences of the same item keep their time. */
export function skipSegmentUnpractised(segments: RunSegment[], elapsedSeconds: number): RunSegment[] {
  const clock = locateClock(segments, elapsedSeconds);
  if (clock.finished) return segments;
  return skipCurrentSegment(segments, elapsedSeconds).map((s, i) => (i === clock.segIndex ? { ...s, skipped: true } : s));
}

/** REMOVE a segment the run has not reached yet: it takes no time and records nothing; every other segment keeps its minutes. The current or an earlier segment is never removed here. */
export function removePendingSegment(segments: RunSegment[], index: number, elapsedSeconds: number): RunSegment[] {
  const clock = locateClock(segments, elapsedSeconds);
  if (clock.finished || index <= clock.segIndex || !segments[index]) return segments;
  return segments.map((s, i) => (i === index ? { ...s, seconds: 0, skipped: true } : s));
}

export type RunSegmentState = 'done' | 'moved_on' | 'skipped' | 'current' | 'pending';

/** Each segment's state in a run, for the full list shown while it runs. */
export function runSegmentStates(authored: RoutineSegment[], segments: RunSegment[], elapsedSeconds: number): RunSegmentState[] {
  const clock = locateClock(segments, elapsedSeconds);
  return segments.map((s, i) => {
    if (s.skipped) return 'skipped';
    if (i < clock.segIndex) return s.seconds < Math.round((authored[i]?.minutes ?? 0) * 60) ? 'moved_on' : 'done';
    if (i === clock.segIndex) return 'current';
    return 'pending';
  });
}

/**
 * The run's time, each figure on its own, in seconds: `planned` is what the
 * frozen run asked for at start, `remaining` what is still ahead of the clock,
 * `unused` what Move on, Skip and Remove freed — never handed to another
 * segment. Practised time is `aggregateItemMinutes`, never a target.
 */
export function routineRunTime(authored: RoutineSegment[], segments: RunSegment[], elapsedSeconds: number): { planned: number; remaining: number; unused: number } {
  const planned = authored.reduce((n, s) => n + Math.max(0, Math.round(s.minutes * 60)), 0);
  const effective = segments.reduce((n, s) => n + s.seconds, 0);
  return { planned, remaining: Math.max(0, effective - Math.max(0, elapsedSeconds)), unused: Math.max(0, planned - effective) };
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
  const bounds = cumulativeStarts(segments);
  const secondsByItem = new Map<ID, number>();
  segments.forEach((seg, i) => {
    if (!seg.itemId || seg.skipped) return;
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
        // Practice inside a routine is never a whole-item check.
        scope: 'focused',
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

// --- What a finished run's items showed -----------------------------------

/** One recorded item's capture on Routine complete: a result and/or one line. */
export interface RoutineCapture {
  blockId: ID;
  /** One of the six results, or `not_logged` for none. */
  result: BlockResult;
  observation?: string;
}

/**
 * Annotate the blocks a routine run just created with what each item showed —
 * the lighter variant of a close, after the clock has stopped. ONLY those
 * blocks (`runBlockIds`, as `finishRoutine` returned them) may change: a
 * capture naming any other block, or a value that is not a result, refuses
 * the whole capture naming the block, and nothing is written.
 *
 * A result is real evidence for every reader of results (history, the
 * three-same hint, Insights, the teacher report). It never reaches a review:
 * dates, open reviews, SM-2 state, status, minutes and counters stay exactly
 * as the run left them. `lastResult` follows only while the block is the
 * item's latest logged one. An unchanged capture returns the SAME arrays, so
 * repeating it writes nothing.
 */
export function captureRoutineResults(
  db: { blocks: PracticeBlock[]; items: PracticeItem[] },
  runBlockIds: ID[],
  captures: RoutineCapture[],
  now: Date,
): { blocks: PracticeBlock[]; items: PracticeItem[] } | { refused: string } {
  const mine = new Set(runBlockIds);
  for (const c of captures) {
    if (!mine.has(c.blockId) || !db.blocks.some((b) => b.id === c.blockId)) {
      return { refused: `Block ${c.blockId} is not one this routine run recorded.` };
    }
    if (!Object.prototype.hasOwnProperty.call(RESULT_LABELS, c.result)) {
      return { refused: `Block ${c.blockId}: "${String(c.result)}" is not a result.` };
    }
    if (c.observation !== undefined && typeof c.observation !== 'string') {
      return { refused: `Block ${c.blockId}: the observation is not text.` };
    }
  }
  const byBlock = new Map(captures.map((c) => [c.blockId, c]));
  const changed = new Set<ID>();
  const blocks = db.blocks.map((b) => {
    const c = byBlock.get(b.id);
    if (!c) return b;
    const observation = c.observation?.trim() || undefined;
    if (b.result === c.result && b.observation === observation) return b;
    changed.add(b.practiceItemId);
    const next: PracticeBlock = { ...b, result: c.result, updatedAt: nowISO(now) };
    if (observation) next.observation = observation;
    else delete next.observation;
    return next;
  });
  if (changed.size === 0) return { blocks: db.blocks, items: db.items };

  const latestLogged = (list: PracticeBlock[], itemId: ID) =>
    list
      .filter((b) => b.practiceItemId === itemId && b.result !== 'not_logged')
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || b.createdAt.localeCompare(a.createdAt))[0];
  const items = db.items.map((item) => {
    if (!changed.has(item.id)) return item;
    const before = latestLogged(db.blocks, item.id);
    const after = latestLogged(blocks, item.id);
    // Only when a captured block is (or was) the item's latest logged one.
    const touches = [before, after].some((b) => b && mine.has(b.id) && byBlock.has(b.id));
    if (!touches || !after || after.result === item.lastResult) return item;
    return { ...item, lastResult: after.result, updatedAt: nowISO(now) };
  });
  return { blocks, items };
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
 * its pathway/stage placement if that placement is no longer compatible or
 * no longer real. The pathway's own instrument is never touched.
 *
 * This is the one place those invariants are checked, so the store calls it
 * unconditionally on every create and every save — not only when the
 * instrument actually changes — rather than trusting a form's bindings and
 * placement on faith. `newInstrumentId` may be undefined: a routine can be
 * legitimately unscoped (a General-pathway routine, or one a v11 migration
 * correctly declined to invent an instrument for), and no item can match
 * "no instrument", so every binding is cleared in that case.
 *
 * `pathway`/`stage` are the caller's live lookups by the routine's own
 * `pathwayId`/`stageId` — never trusted just because those ids are set. A
 * `pathwayId` that no longer resolves (deleted, or never real) can never be
 * a valid placement, so it clears the whole placement rather than being
 * preserved as an undetectable dangling reference. A `stageId` is only kept
 * when it resolves AND actually belongs to that same pathway — a stage
 * lookup that resolves to a different pathway's stage is cleared on its own,
 * leaving an otherwise-valid pathwayId placement intact.
 */
export function retargetRoutineInstrument(
  routine: PathwayRoutine,
  newInstrumentId: ID | undefined,
  items: PracticeItem[],
  pathway: Pathway | undefined,
  stage: PathwayStage | undefined,
  now: Date,
): PathwayRoutine {
  const byId = new Map(items.map((i) => [i.id, i]));
  const segments = routine.segments.map((s) =>
    s.itemId && byId.get(s.itemId)?.instrumentId !== newInstrumentId ? { ...s, itemId: undefined } : s,
  );
  const pathwayReal = routine.pathwayId === undefined || pathway !== undefined;
  const stillPlaced = pathwayReal && placementCompatible(newInstrumentId, pathway?.instrumentId);
  const stageBelongs = routine.stageId === undefined || (stage !== undefined && stage.pathwayId === routine.pathwayId);
  return touchRoutine(
    {
      ...routine,
      instrumentId: newInstrumentId,
      segments,
      pathwayId: stillPlaced ? routine.pathwayId : undefined,
      stageId: stillPlaced && stageBelongs ? routine.stageId : undefined,
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
