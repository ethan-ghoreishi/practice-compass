---
id: 20260830-hands-free-practice-the-screen-stays-awa-65dd
contractId: 20260830-hands-free-practice-the-screen-stays-awa-65dd
patchId: 2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-08-30T23:56:17.677Z
sealedAt: 2026-08-31T00:01:56.129Z
---

# Review: Hands-free practice: the screen stays awake while a clock runs, and the app announces the intended end

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260830-hands-free-practice-the-screen-stays-awa-65dd
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/7
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab`

## The Delta this change was framed from

# While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

_approved · about "practise-todays-recommendation" step 4_

## Today

The musician practises while the block runs, pausing and resuming as needed, and the screen shows the elapsed clock. Nothing asks the device to keep the display awake, so on a phone the screen dims and locks mid-block and the clock is simply not there to glance at. Reaching the 10-minute target changes nothing at all: the ring silently saturates at full (`Math.min(elapsed / targetSeconds, 1)`) and the readout keeps counting with no indication that the intended time has arrived.

## Instead

While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

## Keep

- Elapsed seconds still accumulate only while the timer runs, from the wall clock, exactly as now.
- Finish still freezes the clock before the close screen, so reflection time is not counted.
- The review date shown before saving is still exactly the date saved.
- Starting a block stays under 30 seconds; nothing new is required of the user to get the screen to stay awake.
- Practising is still the only thing that completes a review and advances spaced repetition.

## New assumptions

- Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is established by an OWNER device check, not asserted by this contract; the implementation feature-detects and degrades to a silent no-op.
- The specification requires the platform to release a wake lock when the document becomes hidden, so reacquiring on return to visible is mandated behaviour rather than a browser-specific workaround.

## Show me

On the iPhone with the app installed: start a block at the shortest real preset (5 minutes) from Today, put the phone face-up on the music stand and do not touch it. The display stays on for the whole block; at 5:00 the screen visibly changes to say the target is reached and starts counting overtime; the block is still running and waiting for you to Finish. Tap Pause and leave it: the phone now sleeps normally, and when you wake it the elapsed time has not moved.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **Non-running clock signal suppression** — ActiveBlock and RoutineRunner evaluate nextSignal and play the cue even when the active clock is paused or frozen. The wake-lock predicate checks running, but the announcement path does not, contrary to the contract requirement that a frozen non-running clock announces nothing.
  _counterexample:_ Hydrate a legacy dual-clock state whose ordinary block or routine is already beyond a boundary, has running=false after merge freezes it, and has signalledThrough absent. Opening its practice screen calls nextSignal, advances the marker and invokes playSignalCue despite no clock running.

**What changed since the previously reviewed head:**

```diff
diff --git a/src/pages/ActiveBlock.tsx b/src/pages/ActiveBlock.tsx
index 2aa5bc7..e489143 100644
--- a/src/pages/ActiveBlock.tsx
+++ b/src/pages/ActiveBlock.tsx
@@ -31,14 +31,14 @@ export default function ActiveBlock() {
 
   const elapsedForSignal = active ? sessionElapsedSeconds(active) : 0;
   useEffect(() => {
-    if (!active) return;
+    if (!active?.running) return; // paused or frozen (legacy dual-clock hydration): announce nothing
     const result = nextSignal(active.signalledThrough, elapsedForSignal, [active.targetMinutes * 60]);
     if (result.announce) {
       setSessionSignal(result.marker);
       playSignalCue();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, [active?.signalledThrough, elapsedForSignal, active?.targetMinutes]);
+  }, [active?.running, active?.signalledThrough, elapsedForSignal, active?.targetMinutes]);
 
   if (!active) {
     // A routine is running instead — its own clock, not this one. Point back
diff --git a/src/pages/RoutineRunner.tsx b/src/pages/RoutineRunner.tsx
index e293caa..365484b 100644
--- a/src/pages/RoutineRunner.tsx
+++ b/src/pages/RoutineRunner.tsx
@@ -121,14 +121,14 @@ export default function RoutineRunner() {
   // segments at once. Skip never reaches this path — it acknowledges
   // silently via the store's skipRoutineRun instead.
   useEffect(() => {
-    if (!isMine) return;
+    if (!isMine || !activeRoutine.running) return; // paused or frozen (legacy dual-clock hydration): announce nothing
     const signalResult = nextSignal(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
     if (signalResult.announce) {
       setRoutineSignal(signalResult.marker);
       playSignalCue();
     }
     // eslint-disable-next-line react-hooks/exhaustive-deps
-  }, [isMine, activeRoutine?.signalledThrough, elapsedSeconds, segs]);
+  }, [isMine, activeRoutine?.running, activeRoutine?.signalledThrough, elapsedSeconds, segs]);
 
   function finish() {
     if (!isMine || result) return;
```

**Full current text of every file the rework touched:**

### src/pages/ActiveBlock.tsx

```
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOCK_MODE_LABELS, FOCUS_LABELS, nextSignal } from '../domain';
import { sessionElapsedSeconds, useStore } from '../store/useStore';
import { getItem, instrumentName } from '../store/lookups';
import { formatClock } from '../components/format';
import { PauseIcon, PlayIcon } from '../components/icons';
import { playSignalCue, useScreenAwake } from '../components/useScreenAwake';

export default function ActiveBlock() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const pauseSession = useStore((s) => s.pauseSession);
  const resumeSession = useStore((s) => s.resumeSession);
  const cancelSession = useStore((s) => s.cancelSession);
  const setSessionNote = useStore((s) => s.setSessionNote);
  const setSessionSignal = useStore((s) => s.setSessionSignal);
  const navigate = useNavigate();

  const [, setTick] = useState(0);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!active?.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active?.running]);

  useScreenAwake(!!active, !!active?.running);

  const elapsedForSignal = active ? sessionElapsedSeconds(active) : 0;
  useEffect(() => {
    if (!active?.running) return; // paused or frozen (legacy dual-clock hydration): announce nothing
    const result = nextSignal(active.signalledThrough, elapsedForSignal, [active.targetMinutes * 60]);
    if (result.announce) {
      setSessionSignal(result.marker);
      playSignalCue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.running, active?.signalledThrough, elapsedForSignal, active?.targetMinutes]);

  if (!active) {
    // A routine is running instead — its own clock, not this one. Point back
    // at it rather than offering a fresh start that would just no-op.
    if (activeRoutine) {
      return (
        <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
          <h1 className="page-title">A routine is running</h1>
          <Link
            to={`/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`}
            className="btn btn-primary btn-lg"
          >
            <PlayIcon /> Resume your routine
          </Link>
        </div>
      );
    }
    return (
      <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
        <h1 className="page-title">No block in progress</h1>
        <Link to="/start" className="btn btn-primary btn-lg">
          <PlayIcon /> Start a block
        </Link>
      </div>
    );
  }

  const item = getItem(db, active.itemId);
  const elapsed = sessionElapsedSeconds(active);
  const targetSeconds = active.targetMinutes * 60;
  const reached = elapsed >= targetSeconds; // durable for the rest of the block — practising past target is ordinary, never un-happens
  const deg = Math.min(elapsed / targetSeconds, 1) * 360;

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">{instrumentName(db, active.instrumentId)}</div>
        <h1 className="page-title" dir="auto" style={{ fontSize: '1.5rem' }}>
          {item?.title ?? 'Practice'}
        </h1>
        <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
          <span className="chip">{BLOCK_MODE_LABELS[active.mode]}</span>
          <span className="chip">{FOCUS_LABELS[active.focus]}</span>
        </div>
        {active.constraint && <p className="reason">Constraint: {active.constraint}</p>}
      </header>

      {item && (item.notes || item.currentProblem) && (
        <AboutThisPiece notes={item.notes} problem={item.currentProblem} />
      )}

      <div
        className={`timer-ring${reached ? ' timer-ring--reached' : ''}`}
        style={reached ? undefined : { background: `conic-gradient(var(--accent-dim) ${deg}deg, var(--surface-3) ${deg}deg)` }}
      >
        <div
          style={{
            width: 194,
            height: 194,
            borderRadius: '50%',
            background: 'var(--surface)',
            display: 'grid',
            placeItems: 'center',
            gap: 2,
          }}
        >
          <div className="timer">{formatClock(elapsed)}</div>
          {reached ? (
            <div className="tiny timer-target-reached">Target reached · +{formatClock(elapsed - targetSeconds)}</div>
          ) : (
            <div className="tiny faint">of {active.targetMinutes}:00</div>
          )}
        </div>
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        {active.running ? (
          <button className="btn btn-lg" onClick={pauseSession}>
            <PauseIcon /> Pause
          </button>
        ) : (
          <button className="btn btn-lg" onClick={resumeSession}>
            <PlayIcon /> Resume
          </button>
        )}
        <button
          className="btn btn-primary btn-lg"
          onClick={() => {
            // Freeze the clock the moment you finish — reflection time is
            // yours, not silently added to the block.
            pauseSession();
            navigate('/close');
          }}
        >
          Finish
        </button>
      </div>

      {showNote ? (
        <textarea
          className="textarea"
          placeholder="A passing thought to remember…"
          value={active.note ?? ''}
          onChange={(e) => setSessionNote(e.target.value)}
          autoFocus
        />
      ) : (
        <button className="link small" onClick={() => setShowNote(true)} style={{ background: 'none', border: 'none' }}>
          + Add a quick note
        </button>
      )}

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          cancelSession();
          // Mirrors CloseBlock's Save/Discard: a running plan is still the
          // active context to return to, not generic Today.
          navigate(useStore.getState().activePlan ? '/plan' : '/');
        }}
      >
        Discard block
      </button>
    </div>
  );
}

/**
 * Conscious practice: keep "what this piece is and what to notice" one tap
 * away during the block, with the standing question that turns repetition
 * into awareness.
 */
function AboutThisPiece({ notes, problem }: { notes?: string; problem?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card card-quiet stack-sm" style={{ textAlign: 'left' }}>
      <button
        className="row between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, width: '100%' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="section-label">About this piece</span>
        <span className="tiny faint">{open ? 'hide' : 'show'}</span>
      </button>
      {open && (
        <>
          {notes && (
            <div className="small dim" dir="auto" style={{ whiteSpace: 'pre-wrap' }}>
              {notes}
            </div>
          )}
          {problem && (
            <div className="small" dir="auto">
              <span className="faint">Working on: </span>
              {problem}
            </div>
          )}
          <div className="tiny" style={{ color: 'var(--gold)' }}>
            Keep asking: what is going on here — where does it rest, and where is it headed?
          </div>
        </>
      )}
    </div>
  );
}
```

### src/pages/RoutineRunner.tsx

```
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { aggregateItemMinutes, locateClock, nextSignal, runElapsedSeconds, segmentBoundaries, segmentsForRun, type RunSegment } from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon } from '../components/icons';
import { playSignalCue, useScreenAwake } from '../components/useScreenAwake';

/** How long the "just arrived" cue stays visible after a segment boundary — long enough that glancing up a few seconds later still shows it, never a single-render flash. */
const SEGMENT_ARRIVAL_WINDOW_SECONDS = 8;

/**
 * The live run (segs/elapsed/running) lives in the store as `activeRoutine`,
 * not component state — so a nav-bar tap or browser back never silently
 * loses genuinely-elapsed bound-item practice, the same reason `active`
 * (an ordinary block session) survives navigation. Only one routine can run
 * at a time: if a DIFFERENT routine is already active, this redirects to it
 * rather than letting a fresh start quietly discard its in-flight time. And
 * only one practice clock of ANY kind runs at a time: if an ordinary block
 * is active, this redirects to it too, rather than starting a routine
 * alongside it and logging the same interval twice.
 */
export default function RoutineRunner() {
  const { routineId } = useParams();
  const [searchParams] = useSearchParams();
  const shortOnTime = searchParams.get('short') === '1';
  const navigate = useNavigate();
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const startRoutineRun = useStore((s) => s.startRoutineRun);
  const pauseRoutineRun = useStore((s) => s.pauseRoutineRun);
  const resumeRoutineRun = useStore((s) => s.resumeRoutineRun);
  const skipRoutineRun = useStore((s) => s.skipRoutineRun);
  const finishRoutine = useStore((s) => s.finishRoutine);
  const setRoutineSignal = useStore((s) => s.setRoutineSignal);

  const routine = db.pathwayRoutines.find((r) => r.id === routineId);
  const stage = routine?.stageId ? db.pathwayStages.find((s) => s.id === routine.stageId) : undefined;

  // Snapshot of what was actually recorded, frozen at the moment of finishing
  // — the finished screen must show exactly what was saved, never a value
  // recomputed later against a clock that has since stopped advancing.
  const [result, setResult] = useState<{ segs: RunSegment[]; elapsedSeconds: number } | null>(null);
  const [, setTick] = useState(0);

  const isMine = !!routineId && activeRoutine?.routineId === routineId;
  const otherActive = activeRoutine && activeRoutine.routineId !== routineId ? activeRoutine : undefined;

  // An existing run's segment list — content AND short-on-time filtering — is
  // decided once, at start, and frozen into activeRoutine. It is never
  // re-derived from the routine's CURRENT data: the routine can be edited
  // (segments added/removed) from its Stage/Pathway page with no "is this
  // active" guard while a run is in progress, and re-deriving live would
  // desync this list's length from activeRoutine.segs — indexing past the
  // end of one of them, a blank runner screen. A stale `?short=1` link on an
  // already-running full routine is the same family of bug. The URL param
  // and the routine's live data only seed a FRESH run.
  const effectiveShortOnTime = isMine ? activeRoutine.shortOnTime : shortOnTime;
  const authoredSegments = isMine
    ? activeRoutine.authoredSegments
    : routine
      ? segmentsForRun(routine.segments, effectiveShortOnTime)
      : [];

  // A different routine is already running: resume it rather than letting a
  // fresh start here silently overwrite its unsaved elapsed time.
  useEffect(() => {
    if (otherActive) {
      navigate(`/routine/${otherActive.routineId}${otherActive.shortOnTime ? '?short=1' : ''}`, { replace: true });
    }
  }, [otherActive, navigate]);

  // An ordinary block is already running: resolve it there. The store's
  // startRoutineRun already refuses to start a routine while one is active
  // (so the same interval can never be logged twice), but without this
  // redirect the "begin one" effect below would just no-op forever, leaving
  // the user stranded on a blank screen instead of back at their block.
  // Unconditional on isMine: the guards above make "this routine is mine AND
  // an ordinary block also exists" unreachable from any in-app action, so the
  // only way here is a persisted dual-clock state from before those guards —
  // which the store's hydration `merge` freezes rather than deletes. Without
  // this redirect, `isMine` would keep showing this frozen routine with a
  // Resume button that silently no-ops (resumeRoutineRun refuses while
  // `active` exists). Sending the user to resolve the block first, same as
  // any genuinely concurrent case, gives a single deterministic way out
  // instead of a dead button.
  useEffect(() => {
    if (active) navigate('/active', { replace: true });
  }, [active, navigate]);

  // Nothing running yet for this routine: begin one.
  useEffect(() => {
    if (routine && routineId && !active && !activeRoutine && !result) {
      startRoutineRun(routineId, shortOnTime, segmentsForRun(routine.segments, shortOnTime));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, routineId, shortOnTime, active]);

  // Force a re-render every second so the countdown visibly ticks. The actual
  // time is always read fresh from the wall clock below, so a background/lock
  // interval catches up correctly the moment this tab wakes up again — it is
  // never a count of the ticks that fired.
  useEffect(() => {
    if (!isMine || !activeRoutine?.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isMine, activeRoutine?.running]);

  const elapsedSeconds = isMine
    ? runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date())
    : 0;
  const segs = isMine ? activeRoutine.segs : [];
  const clock = isMine ? locateClock(segs, elapsedSeconds) : null;

  useScreenAwake(isMine, isMine && !!activeRoutine?.running);

  // Announce a boundary at most once, whether crossed by natural ticking or
  // by waking up after a background/lock interval that jumped several
  // segments at once. Skip never reaches this path — it acknowledges
  // silently via the store's skipRoutineRun instead.
  useEffect(() => {
    if (!isMine || !activeRoutine.running) return; // paused or frozen (legacy dual-clock hydration): announce nothing
    const signalResult = nextSignal(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
    if (signalResult.announce) {
      setRoutineSignal(signalResult.marker);
      playSignalCue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMine, activeRoutine?.running, activeRoutine?.signalledThrough, elapsedSeconds, segs]);

  function finish() {
    if (!isMine || result) return;
    setResult({ segs, elapsedSeconds });
    finishRoutine();
  }

  // Natural completion: the wall clock alone decides once E reaches the run's
  // total — no per-tick counting, so a background/lock interval that runs
  // past the end is caught here the moment this tab wakes up again.
  useEffect(() => {
    if (isMine && clock?.finished && !result) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMine, clock?.finished]);

  if (!routine) {
    return (
      <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
        <h1 className="page-title">Routine not found</h1>
        <Link to="/repertoire" className="btn btn-primary">
          Back to repertoire
        </Link>
      </div>
    );
  }

  const backTo = routine.stageId
    ? `/pathway/${routine.pathwayId}/${routine.stageId}`
    : routine.pathwayId
      ? `/pathway/${routine.pathwayId}`
      : '/';

  if (result) {
    const recorded = aggregateItemMinutes(result.segs, result.elapsedSeconds);
    return (
      <div className="stack-lg" style={{ textAlign: 'center', paddingTop: 'var(--space-7)' }}>
        <div className="timer-ring" style={{ background: 'var(--tone-good-soft)' }}>
          <div style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
            <CheckIcon width={48} height={48} style={{ color: 'var(--tone-good)' }} />
            <div className="title-md">Routine complete</div>
          </div>
        </div>
        {recorded.size > 0 ? (
          <div className="card stack-sm" style={{ textAlign: 'left' }}>
            <div className="section-label">Recorded</div>
            {[...recorded.entries()].map(([itemId, minutes]) => (
              <div key={itemId} className="row between">
                <span dir="auto" className="truncate">
                  {getItem(db, itemId)?.title ?? 'Item'}
                </span>
                <span className="tiny faint">{minutes} min</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="page-sub">Nicely done. Short and steady is the whole game.</p>
        )}
        <button className="btn btn-primary btn-lg" onClick={() => navigate(backTo)}>
          {stage ? `Back to ${stage.code}` : 'Back'}
        </button>
      </div>
    );
  }

  if (!isMine || !clock) return null; // brief window while redirecting to / starting the run

  const seg = authoredSegments[clock.segIndex];
  if (!seg) return null;
  const segTotalSeconds = segs[clock.segIndex]?.seconds ?? seg.minutes * 60;
  const deg = segTotalSeconds > 0 ? (clock.segElapsedSeconds / segTotalSeconds) * 360 : 0;
  const next = authoredSegments[clock.segIndex + 1];
  // A segment reached via a boundary crossing (never the run's opening segment) stays
  // perceptibly marked for a defined window — never a one-render flash — so a musician
  // glancing up a few seconds after arriving still sees that the segment changed. This is
  // elapsed-derived, not marker-derived, so it also shows after a deliberate Skip (which
  // suppresses only the announcement, via acknowledgeThrough) — deliberately: it describes
  // the segment you are now on, not a re-announcement of the one you just chose to end.
  const justArrived = clock.segIndex > 0 && clock.segElapsedSeconds < SEGMENT_ARRIVAL_WINDOW_SECONDS;

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
          {effectiveShortOnTime ? ' · short on time' : ''}
        </div>
        <div className={`tiny${justArrived ? ' segment-arrived' : ' faint'}`}>
          {justArrived ? 'New segment · ' : ''}
          Segment {clock.segIndex + 1} of {authoredSegments.length}
          {seg.itemId ? '' : ' · warm-up — not logged as practice'}
        </div>
      </header>

      <div
        className={`timer-ring${justArrived ? ' timer-ring--arrived' : ''}`}
        style={{ background: `conic-gradient(var(--accent-dim) ${deg}deg, var(--surface-3) ${deg}deg)` }}
      >
        <div
          style={{
            width: 194,
            height: 194,
            borderRadius: '50%',
            background: 'var(--surface)',
            display: 'grid',
            placeItems: 'center',
            gap: 4,
            padding: 16,
          }}
        >
          <div className="timer" style={{ fontSize: '2.8rem' }}>
            {formatClock(clock.secondsLeft)}
          </div>
          {seg.essential && <span className="tiny" style={{ color: 'var(--gold)' }}>essential</span>}
        </div>
      </div>

      <div>
        <div className="title-md" style={{ fontSize: '1.2rem' }}>
          {seg.label}
        </div>
        {seg.itemId && (
          <div className="tiny faint" dir="auto">
            {getItem(db, seg.itemId)?.title}
          </div>
        )}
        {next && <div className="tiny faint" style={{ marginTop: 6 }}>Next: {next.label}</div>}
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        {activeRoutine.running ? (
          <button className="btn btn-lg" onClick={pauseRoutineRun}>
            <PauseIcon /> Pause
          </button>
        ) : (
          <button className="btn btn-lg" onClick={resumeRoutineRun}>
            <PlayIcon /> Resume
          </button>
        )}
        <button className="btn" onClick={skipRoutineRun}>
          Skip
        </button>
      </div>

      <div className="stack-sm" style={{ alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={finish}>
          <CheckIcon width={16} height={16} /> Finish &amp; save
        </button>
        <span className="tiny faint">Records what you've practised so far — never a discard</span>
      </div>
    </div>
  );
}
```

## Check against the contract

- [ ] **ac-1** — A clock that jumps across several segment boundaries at once (a backgrounded or locked phone waking up) announces ONCE, not once per boundary crossed. This is the counterexample that fails a per-tick implementation. _(proof: announces once when the clock jumps across several boundaries at once)_
- [ ] **ac-2** — That same jump advances the marker to the number of boundaries ACTUALLY passed, not by one — so the next call does not re-announce the boundaries it skipped over. _(proof: advances the marker to the boundary actually reached, not by one)_
- [ ] **ac-3** — An ordinary block's single target boundary announces exactly once; every later call at or beyond the target announces nothing. Fails if the implementation re-derives 'past target' each render instead of remembering. _(proof: announces an ordinary block target exactly once and never again)_
- [ ] **ac-4** — Pausing across the target and resuming does not re-announce, because the marker persists rather than being rebuilt from the running state. _(proof: does not announce again after pausing across the target and resuming)_
- [ ] **ac-5** — An absent marker (a session persisted before this change) reads as nothing announced yet, rather than throwing or silently swallowing a real boundary. _(proof: treats an absent marker as nothing announced yet)_
- [ ] **ac-6** — Nothing is announced while elapsed has not yet reached the first boundary. _(proof: announces nothing before the first boundary is reached)_
- [ ] **ac-7** — Once every boundary has been announced, further calls stay silent no matter how far elapsed runs past the end — an overrunning routine never announces repeatedly. _(proof: stays silent once every boundary has been announced)_
- [ ] **ac-8** — The last boundary is reported as final and an intermediate one is not, so routine completion and a mere segment change are distinguishable by the caller. _(proof: reports the final boundary distinctly from an intermediate one)_
- [ ] **ac-9** — A deliberate Skip advances the marker WITHOUT announcing, so the user is never told about a segment they chose to end themselves. Fails if skip routes through the announcing path. _(proof: advances the marker without announcing when a segment is skipped)_
- [ ] **ac-10** — After a skip has clamped the current segment onto the elapsed value, the very next signal check stays silent — the concrete regression the acknowledge path exists to prevent. _(proof: stays silent on the boundary a skip has just clamped into place)_
- [ ] **ac-11** — The announcement boundaries are the same numbers locateClock segments by, for the same run — including after a skip has clamped a segment. Fails if a second cumulative sum is computed independently and drifts. _(proof: exposes the same segment boundaries the clock advances on)_
- [ ] **ac-12** — The screen is kept awake only while a clock is genuinely running AND its screen is visible. _(proof: keeps the screen awake only while a clock is running and visible)_
- [ ] **ac-13** — A paused clock releases the screen — pausing to talk to a teacher lets the phone sleep normally. _(proof: does not keep the screen awake while the clock is paused)_
- [ ] **ac-14** — A hidden document keeps nothing, so a backgrounded tab never holds a lock. _(proof: does not keep the screen awake while the document is hidden)_
- [ ] **ac-15** — With no clock at all — including a frozen, non-running clock left by a legacy dual-clock hydration — nothing is held. _(proof: does not keep the screen awake when no clock is running)_
- [ ] **ac-16** — The existing suite still passes in full — in particular every routines, scheduling, plan and migrations test — proving elapsed accounting, one-block-per-item aggregation and the single-clock guards are untouched. 267 tests pass at HEAD; the count must only grow. _(proof: aggregates a repeated segment into one block per item, not one per segment)_
- [ ] **ac-17** — A routine that repeats one item four times still leaves that item unsaturated — proof this lane did not disturb block creation or the scoring family while adding the announcement. _(proof: leaves an item unsaturated after a routine that repeats it four times)_
- [ ] **ac-18** — OWNER DEVICE CHECK — RUN THIS FIRST, BEFORE ANY OTHER DEVICE CHECK. The Builder must already have handed you a runnable procedure naming (a) the secure-context mechanism, (b) the exact steps to expose this lane's build to the iPhone, (c) the exact HTTPS URL, and (d) exactly how to read the two values below on the phone. Note there is no branch-preview deployment in this repo (deploy.yml runs on main only), so this route has to be established, not looked up. Open that URL on the iPhone and confirm `window.isSecureContext === true` and `'wakeLock' in navigator` is true. If either is false, STOP: the environment cannot exercise this lane, every remaining wake-lock device check is ENVIRONMENT-BLOCKED rather than failed, and device acceptance may not be recorded as complete. _(proof: manual:OWNER)_
- [ ] **ac-19** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a block at the shortest REAL selectable target — 5 minutes, the minimum in DURATION_PRESETS; do not add a 1-minute option for testing — put the phone face-up on the music stand and DO NOT TOUCH IT. After 5.5 minutes confirm: (a) the display never dimmed or locked; (b) the screen shows the target-reached state with an overtime figure counting up; (c) the block did NOT auto-finish. Record whether any sound was heard. _(proof: manual:OWNER)_
- [ ] **ac-20** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a routine whose first two segments are 1 minute each, put the phone down and DO NOT TOUCH IT. Confirm the display stays on and the arrival at segment 2 is visibly announced without any interaction. Record whether any sound or vibration occurred. _(proof: manual:OWNER)_
- [ ] **ac-21** — OWNER DEVICE CHECK (iPhone). Mid-block, tap Pause and put the phone down for 2 minutes. Confirm the display is allowed to sleep normally, then wake it and confirm the elapsed time did NOT advance during the pause. _(proof: manual:OWNER)_
- [ ] **ac-22** — OWNER DEVICE CHECK (iPhone). Mid-block, switch to another app for 60 seconds, then return. Confirm the display stays awake again on return (the spec-mandated release-on-hidden is reacquired), and that elapsed reflects the full real wall-clock interval including the time away. _(proof: manual:OWNER)_
- [ ] **ac-23** — OWNER DEVICE CHECK (leak check, iPhone). From a running block, exercise each exit in turn — Finish then Save, Finish then Discard, Discard block, and a nav-bar tap away — and after each confirm the phone sleeps normally on Today within its usual auto-lock interval. _(proof: manual:OWNER)_
- [ ] **ac-24** — OWNER DEVICE CHECK (graceful degradation). Open the app in a browser without Screen Wake Lock support, or with the lock denied (for example on low-power mode), and run a 5-minute block (the shortest real preset). Confirm the timer runs normally, the target-reached state and overtime still appear, no error is shown, and the saved minutes are correct. _(proof: manual:OWNER)_
- [ ] **ac-25** — An immediate Skip at the very start of a segment produces a zero-length effective segment and announces NOTHING — the user chose to end it and is standing at the screen. _(proof: announces nothing when a segment is skipped immediately at zero elapsed)_
- [ ] **ac-26** — That immediate skip still advances the marker PAST the zero-duration boundary it created, so the boundary is never left behind to be announced on a later render. _(proof: advances the marker past a zero-duration boundary created by an immediate skip)_
- [ ] **ac-27** — Several immediate skips in a row create several equal cumulative boundaries and all of them stay silent — acknowledgeThrough clears every boundary at or before the elapsed value, not just one. _(proof: stays silent across repeated zero-time skips)_
- [ ] **ac-28** — After skipping, the next genuinely elapsed segment boundary still announces normally. This is the counterexample that fails an implementation which treats a zero boundary as malformed and disables the rest of the run. _(proof: still announces the next genuinely elapsed boundary after a skip)_
- [ ] **ac-29** — An empty boundary list, and genuinely malformed input (negative, NaN, or out-of-order values), announce nothing and leave the marker alone — without classifying a legitimate skip-produced zero as malformed. _(proof: announces nothing for an empty or malformed boundary list)_
- [ ] **ac-30** — At most one request is outstanding and at most one sentinel held, however many times the coordinator is re-enabled. _(proof: holds at most one sentinel and never stacks requests)_
- [ ] **ac-31** — A rejected acquisition is harmless: no throw escapes, no state is corrupted, and a later enable can still acquire. _(proof: treats a rejected wake lock request as harmless)_
- [ ] **ac-32** — Disabling while a request is still in flight releases the sentinel that resolves afterwards instead of holding it — the pending-acquisition leak. _(proof: releases a sentinel that resolves after the coordinator was disabled)_
- [ ] **ac-33** — Unmounting or disabling while a sentinel is held releases it exactly once. _(proof: releases a held sentinel exactly once when disabled)_
- [ ] **ac-34** — Hidden releases, and returning to visible while the clock still qualifies reacquires exactly once — not zero times, not twice. _(proof: reacquires exactly once when the document becomes visible again)_
- [ ] **ac-35** — Rapid visibility and pause/resume churn neither stacks requests nor leaves a stale sentinel held once the churn settles. _(proof: leaks no sentinel across rapid visibility and pause churn)_
- [ ] **ac-36** — OWNER DEVICE CHECK (perceptibility). During a routine, deliberately look away from the phone across a segment boundary and glance back a few seconds later. Confirm it is still apparent that the segment changed — a cue that has already vanished by the time you look up fails this check. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

This lane only adds an ephemeral signalledThrough marker to ActiveSession/ActiveRoutine in useStore.ts (never PracticeDB) and the wake-lock/announcement glue on ActiveBlock/RoutineRunner. PracticeItem's own shape, fields and repertoire grouping are untouched — the shared entity is coincidental to useStore.ts being a single large file.

## install-the-app-and-keep-it-current — unchanged

This lane adds no PWA manifest, service-worker, or install-prompt changes (explicitly excluded). The shared /settings route is coincidental to useStore.ts being a single large file; no Settings UI or update-banner behaviour changed.

## point-this-device-at-the-nas — unchanged

No NAS base URL, recordings, or Settings NAS UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file.

## prepare-for-the-next-class — unchanged

No lesson, teacherQuestion, or assignedForLesson logic was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file — this lane's only PracticeItem-adjacent change is an ephemeral, never-persisted-to-PracticeDB signal marker on the active session/routine, unrelated to lesson prep.

## see-practice-patterns — unchanged

No insights/report aggregation code was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file.

## sync-devices-via-github — unchanged

No sync engine, GitHub transport, or Settings sync UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file; the new signalledThrough marker lives only on ephemeral active/activeRoutine state, which was never synced before and still is not.

## work-a-pathway-stage — truth-proposed

RoutineRunner now holds a screen wake lock and visibly announces a segment boundary instead of swapping silently; filed as an update proposal (.prismatica/flows/proposals/work-a-pathway-stage.md) that also corrects the stale 'not logged as practice' wording in the Guided routine variation.

## run-a-session-plan — truth-proposed

Session Plan segments run as ordinary blocks on /active, which now gain the same wake-lock and target-reached announcement as an unplanned block; filed as an update proposal (.prismatica/flows/proposals/run-a-session-plan.md) updating step 4's description.

## practise-todays-recommendation — truth-proposed

Step 4 now states the screen wake lock and target-reached/overtime announcement, carrying the already-approved Delta's wording into the flow's own truth via an update proposal (.prismatica/flows/proposals/practise-todays-recommendation.md).


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

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
  Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
    Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes and current problem on request.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app holds a screen wake lock so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it. Reaching the target visibly announces it once, with a growing overtime figure — the block does not auto-finish.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
  The musician Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
    Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.
  The musician Taps 'Save block'.
    Shows: Back to Today (or to the running plan), with the item's stats and status updated.
    Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
  Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
    Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.
  The musician Swaps, removes or regenerates segments until the shape looks right.
    Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
    Changes: Only a local copy of the plan — nothing is saved yet.
  The musician Taps 'Start plan'.
    Shows: The runner: the whole list with the current segment highlighted.
    Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
− The musician Taps 'Start' on the current segment.
−   Shows: The ordinary active-block screen, with the segment's minutes as the target.
−   Changes: A real practice block opens for that segment's item.
+ The musician Taps 'Start' on the current segment.
+   Shows: The ordinary active-block screen, with the segment's minutes as the target — the screen stays awake while it runs, and reaching the segment's minutes visibly announces the target reached (with a growing overtime figure) rather than counting on unremarked.
+   Changes: A real practice block opens for that segment's item.
  The musician Finishes and saves the block as usual.
    Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
    Changes: The block, item stats and review schedule update exactly as in an unplanned block.
  The musician Skips anything they do not want, or ends the plan at any time.
    Shows: 'Session complete' once the last segment is passed.
    Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260830-hands-free-practice-the-screen-stays-awa-65dd' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
