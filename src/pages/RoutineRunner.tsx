import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon, XIcon } from '../components/icons';

export default function RoutineRunner() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const db = useStore((s) => s.db);
  const routine = db.pathwayRoutines.find((r) => r.id === routineId);
  const stage = routine?.stageId ? db.pathwayStages.find((s) => s.id === routine.stageId) : undefined;

  const segments = routine?.segments ?? [];
  const [segIndex, setSegIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(segments[0] ? segments[0].minutes * 60 : 0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);

  // Reset the countdown whenever the active segment changes.
  useEffect(() => {
    if (finished) return;
    const seg = segments[segIndex];
    if (seg) setSecondsLeft(seg.minutes * 60);
  }, [segIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick down; advance (or finish) when a segment elapses.
  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setSegIndex((i) => {
          if (i + 1 >= segments.length) {
            setFinished(true);
            setRunning(false);
            return i;
          }
          return i + 1;
        });
        return 0;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, finished, segments.length]);

  if (!routine) {
    return (
      <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
        <h1 className="page-title">Routine not found</h1>
        <Link to="/pathway" className="btn btn-primary">
          Back to pathways
        </Link>
      </div>
    );
  }

  const backTo = routine.stageId
    ? `/pathway/${routine.pathwayId}/${routine.stageId}`
    : `/pathway/${routine.pathwayId}`;

  if (finished) {
    return (
      <div className="stack-lg" style={{ textAlign: 'center', paddingTop: 'var(--space-7)' }}>
        <div className="timer-ring" style={{ background: 'var(--tone-good-soft)' }}>
          <div style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
            <CheckIcon width={48} height={48} style={{ color: 'var(--tone-good)' }} />
            <div className="title-md">Routine complete</div>
          </div>
        </div>
        <p className="page-sub">Nicely done. Short and steady is the whole game.</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate(backTo)}>
          Back to {stage?.code ?? 'pathway'}
        </button>
      </div>
    );
  }

  const seg = segments[segIndex];
  const segTotal = seg.minutes * 60;
  const deg = segTotal > 0 ? ((segTotal - secondsLeft) / segTotal) * 360 : 0;
  const next = segments[segIndex + 1];

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
        </div>
        <div className="faint tiny">
          Segment {segIndex + 1} of {segments.length} · warm-up — not logged as practice
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
            {formatClock(secondsLeft)}
          </div>
          {seg.essential && <span className="tiny" style={{ color: 'var(--gold)' }}>essential</span>}
        </div>
      </div>

      <div>
        <div className="title-md" style={{ fontSize: '1.2rem' }}>
          {seg.label}
        </div>
        {next && <div className="tiny faint" style={{ marginTop: 6 }}>Next: {next.label}</div>}
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        <button className="btn" onClick={() => setSegIndex((i) => Math.max(0, i - 1))} disabled={segIndex === 0}>
          Previous
        </button>
        {running ? (
          <button className="btn btn-lg" onClick={() => setRunning(false)}>
            <PauseIcon /> Pause
          </button>
        ) : (
          <button className="btn btn-lg" onClick={() => setRunning(true)}>
            <PlayIcon /> Resume
          </button>
        )}
        <button
          className="btn"
          onClick={() =>
            setSegIndex((i) => {
              if (i + 1 >= segments.length) {
                setFinished(true);
                setRunning(false);
                return i;
              }
              return i + 1;
            })
          }
        >
          Skip
        </button>
      </div>

      <button className="btn btn-ghost btn-sm" onClick={() => navigate(backTo)}>
        <XIcon width={16} height={16} /> End routine
      </button>
    </div>
  );
}
