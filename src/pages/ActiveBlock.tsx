import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOCK_MODE_LABELS, FOCUS_LABELS } from '../domain';
import { sessionElapsedSeconds, useStore } from '../store/useStore';
import { getItem, instrumentName } from '../store/lookups';
import { formatClock } from '../components/format';
import { PauseIcon, PlayIcon } from '../components/icons';

export default function ActiveBlock() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const pauseSession = useStore((s) => s.pauseSession);
  const resumeSession = useStore((s) => s.resumeSession);
  const cancelSession = useStore((s) => s.cancelSession);
  const setSessionNote = useStore((s) => s.setSessionNote);
  const navigate = useNavigate();

  const [, setTick] = useState(0);
  const [showNote, setShowNote] = useState(false);

  useEffect(() => {
    if (!active?.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active?.running]);

  if (!active) {
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
  const deg = Math.min(elapsed / targetSeconds, 1) * 360;

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">{instrumentName(db, active.instrumentId)}</div>
        <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
          {item?.title ?? 'Practice'}
        </h1>
        <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
          <span className="chip">{BLOCK_MODE_LABELS[active.mode]}</span>
          <span className="chip">{FOCUS_LABELS[active.focus]}</span>
        </div>
        {active.constraint && <p className="reason">Constraint: {active.constraint}</p>}
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
            gap: 2,
          }}
        >
          <div className="timer">{formatClock(elapsed)}</div>
          <div className="tiny faint">of {active.targetMinutes}:00</div>
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
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/close')}>
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
          navigate('/');
        }}
      >
        Discard block
      </button>
    </div>
  );
}
