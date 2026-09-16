import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BLOCK_MODE_LABELS, FOCUS_LABELS, itemFiles, lastNextAction, nextSignal } from '../domain';
import { sessionElapsedSeconds, useStore } from '../store/useStore';
import { getItem, instrumentName, itemBlocks } from '../store/lookups';
import { formatClock } from '../components/format';
import ItemMaterial from '../components/ItemMaterial';
import ItemNotes from '../components/ItemNotes';
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
  // The last step of the loop, closed: the one thing you decided to try next
  // time reaches you BEFORE you start playing, rather than being written on
  // every close and read nowhere.
  const previousNextAction = lastNextAction(itemBlocks(db, active.itemId));
  // Whether there is anything to open at all — a pure read, no blob work: the
  // disclosure below renders nothing until it is actually opened.
  const hasMaterial = itemFiles(db, active.itemId).length > 0;
  const elapsed = sessionElapsedSeconds(active);
  const targetSeconds = active.targetMinutes * 60;
  const reached = elapsed >= targetSeconds; // durable for the rest of the block — practising past target is ordinary, never un-happens
  const deg = Math.min(elapsed / targetSeconds, 1) * 360;

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        {/* The eyebrow renders the INSTRUMENT'S OWN editable name (Settings
            lets it be renamed, Farsi included) — never fixed English copy —
            so it carries its own dir="auto" rather than being bare. It stays
            its own group, OUTSIDE the title's: dir="auto" resolves from the
            first strong character in a subtree, so folding it into the title
            group would let the instrument's script decide the item title's
            own direction instead of the title's own content deciding it. */}
        <div className="eyebrow" dir="auto">{instrumentName(db, active.instrumentId)}</div>
        {/* The item title and the details that belong to it are ONE group
            carrying the direction, so a Farsi piece reads as one block.
            The whole page centres its timer and buttons regardless of
            language, but the title group overrides that back to `start` —
            right for Farsi, left for English — or the page's own centring
            would silently win over the resolved direction. */}
        <div className="stack-sm" dir="auto" style={{ textAlign: 'start' }}>
          <h1 className="page-title" style={{ fontSize: '1.5rem' }}>
            {item?.title ?? 'Practice'}
          </h1>
          {/* Mode/focus chips are generated English metadata, never user
              text — each gets its own dir="ltr" isolate so it can't inherit
              a Farsi title's RTL base. */}
          <div className="row" style={{ justifyContent: 'center', gap: 8 }}>
            <span className="chip" dir="ltr">{BLOCK_MODE_LABELS[active.mode]}</span>
            <span className="chip" dir="ltr">{FOCUS_LABELS[active.focus]}</span>
          </div>
          {/* The constraint VALUE is free text (could be either language) and
              sits after a fixed English label — its own dir="auto" isolate
              resolves from its own content, not from "Constraint: " nor from
              the title above it. */}
          {active.constraint && (
            <p className="reason">
              Constraint: <span dir="auto">{active.constraint}</span>
            </p>
          )}
        </div>
      </header>

      {previousNextAction && (
        <div className="card card-quiet small" style={{ textAlign: 'start' }}>
          <span className="faint">Last time you decided to try: </span>
          {/* previousNextAction is free text the owner typed at a previous
              close — its own dir="auto" resolves from ITS content, not from
              the fixed English label before it. */}
          <span dir="auto">{previousNextAction}</span>
        </div>
      )}

      {/* Working notes — the ITEM's own notebook, readable and editable while
          the timer runs. Collapsed by default so the clock stays the screen.
          Nothing here touches the clock, the elapsed figure or the block. */}
      {item && (
        <div className="card card-quiet" style={{ textAlign: 'start' }}>
          <ItemNotes itemId={item.id} startExpanded={false} />
          <div className="tiny" style={{ color: 'var(--gold)', marginTop: 6 }}>
            <span dir="ltr">Keep asking: what is going on here — where does it rest, and where is it headed?</span>
          </div>
        </div>
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

      {hasMaterial && <MaterialDuringPractice itemId={active.itemId} />}

      {/* Scratch OBSERVATION for THIS block — it seeds the close screen and
          belongs to the block, not to the item. Editing the Working notes
          above never touches it, and it never touches them. */}
      {showNote ? (
        <div className="stack-sm" style={{ textAlign: 'start' }}>
          <label className="field-label" htmlFor="pc-block-observation">
            Observation for this block
          </label>
          <textarea
            id="pc-block-observation"
            className="textarea"
            aria-label="Observation for this block"
            placeholder="What are you noticing right now?"
            value={active.note ?? ''}
            onChange={(e) => setSessionNote(e.target.value)}
            autoFocus
          />
          <div className="tiny faint">
            <span dir="ltr">Carried to the close screen as this block's observation.</span>
          </div>
        </div>
      ) : (
        <button className="link small" onClick={() => setShowNote(true)} style={{ background: 'none', border: 'none' }}>
          + Note an observation for this block
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
 * The score, the class video, the photo of the page — one CLOSED disclosure,
 * below the timer AND below Pause/Finish (the buttons you reach for with the
 * instrument in your hands), in the same shape as "About this piece". Nothing loads until
 * it is opened, and nothing here touches the clock, the wake lock or the
 * boundary signal: a photo renders inline, everything else opens in a tab.
 */
function MaterialDuringPractice({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card card-quiet stack-sm" style={{ textAlign: 'left' }}>
      <button
        className="row between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, width: '100%' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="section-label">Material</span>
        <span className="tiny faint">{open ? 'hide' : 'show'}</span>
      </button>
      {open && <ItemMaterial itemId={itemId} />}
    </div>
  );
}
