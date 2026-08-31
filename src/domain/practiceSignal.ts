// ---------------------------------------------------------------------------
// Hands-free practice: deciding WHEN to tell the user the intended time has
// been reached, as a pure function over an explicit marker — never a
// useRef or component-local flag, so the multi-boundary catch-up, skip and
// absent-marker rules are all reachable from a Node test (no DOM here).
//
// The marker is a COUNT OF BOUNDARIES ALREADY ANNOUNCED. It lives on the
// store's ephemeral `active`/`activeRoutine` (see useStore.ts) — never in
// PracticeDB, so an absent marker is the honest reading for a session
// persisted before this feature existed: nothing announced yet, not zero
// boundaries reached.
//
// Boundaries are the run's ordered cumulative END boundaries — an ordinary
// block passes `[targetMinutes * 60]`; a routine passes
// `segmentBoundaries(segs)` (routines.ts), the exact numbers `locateClock`
// advances on. They are NON-DECREASING, not strictly increasing: Skip can
// clamp a segment to zero or repeat a value, and that is legitimate input,
// not malformed.
// ---------------------------------------------------------------------------

export interface SignalResult {
  /** Whether to tell the user right now — at most once per call. */
  announce: boolean;
  /** The marker to persist, whether or not this call announced. */
  marker: number;
  /** True once the LAST boundary has been passed (routine complete / an ordinary block's one boundary). */
  final: boolean;
}

/** Genuinely malformed: empty (the honest no-boundaries case), or containing a NaN, negative, or out-of-order value. A repeated or zero value is legitimate Skip output, never malformed. */
function isWellFormed(boundarySeconds: number[]): boolean {
  if (boundarySeconds.length === 0) return false;
  let prev = -Infinity;
  for (const b of boundarySeconds) {
    if (!Number.isFinite(b) || b < 0 || b < prev) return false;
    prev = b;
  }
  return true;
}

function boundariesPassed(elapsedSeconds: number, boundarySeconds: number[]): number {
  let count = 0;
  for (const b of boundarySeconds) if (elapsedSeconds >= b) count++;
  return count;
}

/**
 * At most one announcement per call: if elapsed has passed more boundaries
 * than `marker` records, announce once and advance the marker to the number
 * ACTUALLY passed — never by one. This is what makes a background/lock
 * catch-up correct: a phone that wakes up four boundaries later announces
 * once and lands on the right one, never four times and never zero.
 */
export function nextSignal(marker: number | undefined, elapsedSeconds: number, boundarySeconds: number[]): SignalResult {
  const current = marker ?? 0;
  if (!isWellFormed(boundarySeconds)) return { announce: false, marker: current, final: false };
  const passed = boundariesPassed(elapsedSeconds, boundarySeconds);
  if (passed <= current) return { announce: false, marker: current, final: false };
  return { announce: true, marker: passed, final: passed === boundarySeconds.length };
}

/**
 * Advance the marker to match elapsed WITHOUT announcing — what a
 * deliberate Skip uses: the user is standing at the screen and chose to end
 * the segment, so telling them it ended is noise. Clears every boundary at
 * or before elapsed, not just one, so several immediate skips in a row
 * (which produce several equal cumulative boundaries) never leave one
 * behind for `nextSignal` to announce on a later render.
 */
export function acknowledgeThrough(marker: number | undefined, elapsedSeconds: number, boundarySeconds: number[]): number {
  const current = marker ?? 0;
  if (!isWellFormed(boundarySeconds)) return current;
  return Math.max(current, boundariesPassed(elapsedSeconds, boundarySeconds));
}

export interface KeepAwakeInputs {
  hasClock: boolean;
  running: boolean;
  visible: boolean;
}

/** The screen stays awake only while a clock is genuinely running AND its screen is visible. Paused means it may sleep; hidden means nothing is held. */
export function shouldKeepAwake({ hasClock, running, visible }: KeepAwakeInputs): boolean {
  return hasClock && running && visible;
}
