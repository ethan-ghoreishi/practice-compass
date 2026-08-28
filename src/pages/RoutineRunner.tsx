import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  aggregateItemMinutes,
  locateClock,
  runElapsedSeconds,
  segmentsForRun,
  skipCurrentSegment,
  toRunSegments,
  type ID,
  type RunSegment,
} from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon, XIcon } from '../components/icons';

/**
 * Thin route wrapper: `key={routineId+shortOnTime}` forces a full remount of
 * the actual runner whenever either changes. React Router reuses the same
 * component instance across a `:routineId` param change (same Route element),
 * so without this a still-running or already-finished run's local state
 * (segs/accumulatedSeconds/finished/result…) would carry over into the next
 * routine for at least one render — a fresh mount via `key` is simpler and
 * more robust than resetting a dozen pieces of state by hand in an effect.
 */
export default function RoutineRunner() {
  const { routineId } = useParams();
  const [searchParams] = useSearchParams();
  const shortOnTime = searchParams.get('short') === '1';
  return <RoutineSession key={`${routineId}:${shortOnTime}`} routineId={routineId} shortOnTime={shortOnTime} />;
}

function RoutineSession({ routineId, shortOnTime }: { routineId: ID | undefined; shortOnTime: boolean }) {
  const navigate = useNavigate();
  const db = useStore((s) => s.db);
  const finishRoutine = useStore((s) => s.finishRoutine);
  const routine = db.pathwayRoutines.find((r) => r.id === routineId);
  const stage = routine?.stageId ? db.pathwayStages.find((s) => s.id === routine.stageId) : undefined;

  const authoredSegments = useMemo(
    () => segmentsForRun(routine?.segments ?? [], shortOnTime),
    [routine, shortOnTime],
  );

  const [segs, setSegs] = useState<RunSegment[]>(() => toRunSegments(authoredSegments));
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);
  const [runningSince, setRunningSince] = useState<string | undefined>(() => new Date().toISOString());
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  // Snapshot of what was actually recorded, frozen at the moment of finishing
  // — the finished screen must show exactly what was saved, never a value
  // recomputed later against a clock that has since stopped advancing.
  const [result, setResult] = useState<{ segs: RunSegment[]; elapsedSeconds: number } | null>(null);
  const [, setTick] = useState(0);

  // Force a re-render every second so the countdown visibly ticks. The actual
  // time is always read fresh from the wall clock below, so a background/lock
  // interval catches up correctly the moment this tab wakes up again — it is
  // never a count of the ticks that fired.
  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  const elapsedSeconds = runElapsedSeconds(accumulatedSeconds, runningSince, running, new Date());
  const clock = locateClock(segs, elapsedSeconds);

  function finish(finalSegs: RunSegment[] = segs) {
    if (finished) return;
    finishRoutine(finalSegs, elapsedSeconds);
    setResult({ segs: finalSegs, elapsedSeconds });
    setFinished(true);
    setRunning(false);
  }

  // Natural completion: the wall clock alone decides once E reaches the run's
  // total — no per-tick counting, so a background/lock interval that runs
  // past the end is caught here the moment this tab wakes up again.
  useEffect(() => {
    if (clock.finished && !finished) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock.finished]);

  function pause() {
    setAccumulatedSeconds(elapsedSeconds);
    setRunning(false);
    setRunningSince(undefined);
  }

  function resume() {
    setRunning(true);
    setRunningSince(new Date().toISOString());
  }

  function skip() {
    const next = skipCurrentSegment(segs, elapsedSeconds);
    setSegs(next);
    if (locateClock(next, elapsedSeconds).finished) finish(next);
  }

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

  if (finished) {
    const recorded = result ? aggregateItemMinutes(result.segs, result.elapsedSeconds) : new Map<string, number>();
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
          {shortOnTime ? ' · short on time' : ''}
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
        {running ? (
          <button className="btn btn-lg" onClick={pause}>
            <PauseIcon /> Pause
          </button>
        ) : (
          <button className="btn btn-lg" onClick={resume}>
            <PlayIcon /> Resume
          </button>
        )}
        <button className="btn" onClick={skip}>
          Skip
        </button>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={() => finish()}>
        <XIcon width={16} height={16} /> End routine
      </button>
    </div>
  );
}
