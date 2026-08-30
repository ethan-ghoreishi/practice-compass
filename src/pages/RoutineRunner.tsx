import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { aggregateItemMinutes, locateClock, runElapsedSeconds, segmentsForRun, type RunSegment } from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon } from '../components/icons';

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

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
          {effectiveShortOnTime ? ' · short on time' : ''}
        </div>
        <div className="faint tiny">
          Segment {clock.segIndex + 1} of {authoredSegments.length}
          {seg.itemId ? '' : ' · warm-up — not logged as practice'}
        </div>
      </header>

      <div
        className="timer-ring"
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
