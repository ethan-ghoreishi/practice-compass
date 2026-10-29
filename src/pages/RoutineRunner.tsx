import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  aggregateItemMinutes,
  describeFitDrop,
  fitRoutineToMinutes,
  locateClock,
  nextSignal,
  previewRoutine,
  previewRunSegments,
  removeFromPreview,
  RESULT_LABELS,
  reuseFreedRoutineMinutes,
  routineRunTime,
  runElapsedSeconds,
  runSegmentStates,
  segmentBoundaries,
  segmentsForRun,
  validateBudgetMinutes,
  type BlockResult,
  type ID,
  type PracticeDB,
  type RoutinePreview,
  type RoutineSegment,
  type RunSegment,
  type RunSegmentState,
} from '../domain';
import { useStore } from '../store/useStore';
import { storageSettled } from '../store/idb';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { FreedTime, OptionPills, SaveStatus, useAcknowledgedSaves } from '../components/ui';
import ItemNotes from '../components/ItemNotes';
import { CheckIcon, PauseIcon, PlayIcon } from '../components/icons';
import { useScreenAwake } from '../components/useScreenAwake';
import { playPracticeCue, usePracticeSound } from '../components/practiceCue';
import TeacherQuestionCapture from '../components/TeacherQuestionCapture';
import { Metronome, SoundNote } from './ActiveBlock';

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
  const moveOnRoutineRun = useStore((s) => s.moveOnRoutineRun);
  const removeRoutineSegment = useStore((s) => s.removeRoutineSegment);
  const finishRoutine = useStore((s) => s.finishRoutine);
  const persistAgain = useStore((s) => s.persistAgain);
  const claimRoutineSignal = useStore((s) => s.claimRoutineSignal);
  const sound = usePracticeSound();

  const routine = db.pathwayRoutines.find((r) => r.id === routineId);
  const stage = routine?.stageId ? db.pathwayStages.find((s) => s.id === routine.stageId) : undefined;

  // Snapshot of what was actually recorded, frozen at the moment of finishing
  // — the finished screen must show exactly what was saved, never a value
  // recomputed later against a clock that has since stopped advancing.
  const [result, setResult] = useState<{ segs: RunSegment[]; elapsedSeconds: number; blockIds: ID[]; startedAt: string } | null>(null);
  // Whether what Finish wrote has reached IndexedDB — "Saved" is said only
  // then. A failed write keeps the run's outcome in memory (no second credit)
  // and Try again writes it again.
  const [saved, setSaved] = useState<'saving' | 'saved' | 'failed' | null>(null);
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

  // Nothing running yet: a run is begun only by a TAP — a card's Start, a
  // duration, or the Start below — never by arriving at this URL. A start in
  // an effect is outside every gesture, so its practice sound could never be
  // readied, and a bare link would start a clock nobody asked for.
  const begin = () => {
    if (routine && routineId) startRoutineRun(routineId, shortOnTime, segmentsForRun(routine.segments, shortOnTime));
  };
  // The contents the preview shows ARE the run a Start begins: the content
  // choice (essentials only), then any chosen length (proportional fit), then
  // the owner's edits here — a removal frees its minutes, which stay unused
  // unless the owner explicitly hands them back. None of it touches the
  // saved routine, and a new content or length choice starts the preview over.
  const fitMinutes = validateBudgetMinutes(Number(searchParams.get('minutes') ?? ''));
  const content = routine ? segmentsForRun(routine.segments, shortOnTime) : [];
  const previewed = fitMinutes === null ? content : fitRoutineToMinutes(content, fitMinutes);
  const previewKey = `${routineId}|${shortOnTime}|${fitMinutes}|${routine?.updatedAt}`;
  const [preview, setPreview] = useState<{ key: string; p: RoutinePreview } | null>(null);
  const edits = preview?.key === previewKey ? preview.p : previewRoutine(previewed);
  const edit = (p: RoutinePreview) => setPreview({ key: previewKey, p });
  const chosen = previewRunSegments(edits);
  const beginChosen = () => {
    if (routine && routineId && chosen.length > 0) startRoutineRun(routineId, shortOnTime, chosen);
  };

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
    if (signalResult.announce && claimRoutineSignal(activeRoutine.startedAt, signalResult.marker)) playPracticeCue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMine, activeRoutine?.running, activeRoutine?.signalledThrough, elapsedSeconds, segs]);

  function acknowledge() {
    setSaved('saving');
    void storageSettled().then(
      () => setSaved('saved'),
      () => setSaved('failed'),
    );
  }

  function finish() {
    if (!isMine || result) return;
    // The minutes are saved HERE, before Routine complete offers any capture.
    setResult({ segs, elapsedSeconds, startedAt: activeRoutine?.startedAt ?? 'routine', blockIds: finishRoutine() });
    acknowledge();
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
        {recorded.size > 0 && (
          <div className="tiny" role="status" style={{ color: saved === 'failed' ? 'var(--tone-alert)' : undefined }}>
            {saved === 'failed' ? (
              <>
                <span dir="ltr">Not saved on this device yet — the practice is held here, counted once.</span>{' '}
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    persistAgain();
                    acknowledge();
                  }}
                >
                  Try again
                </button>
              </>
            ) : (
              <span className="faint" dir="ltr">
                {saved === 'saved' ? 'Saved on this device — no feedback needed.' : 'Saving…'}
              </span>
            )}
          </div>
        )}
        {recorded.size > 0 ? (
          <div className="card stack-sm" style={{ textAlign: 'left' }}>
            <div className="section-label">Recorded</div>
            {/* textAlign 'start' on the row itself: the card above pins a
                physical 'left', so without this the row resolves a Farsi
                item's direction but never carries it to the alignment —
                the title shapes RTL and still hugs the English edge.
                Identical to 'left' for an English title. */}
            {[...recorded.entries()].map(([itemId, minutes]) => (
              <div key={itemId} className="row between" dir="auto" style={{ textAlign: 'start' }} data-recorded-item={itemId}>
                <span className="truncate">
                  {getItem(db, itemId)?.title ?? 'Item'}
                </span>
                {/* Generated English metadata, never user text — its own
                    dir="ltr" isolate keeps it from inheriting a Farsi
                    item title's RTL base. */}
                <span className="tiny faint" dir="ltr">{minutes} min</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="page-sub">
            <span dir="ltr">Nothing was recorded — no item-bound segment was practised in this run.</span>
          </p>
        )}
        {/* A question typed as the run ended stays open, its words and controls intact. */}
        <TeacherQuestionCapture recover session={result.startedAt} />
        {recorded.size > 0 && <RoutineCapture blockIds={result.blockIds} />}
        <button className="btn btn-primary btn-lg" onClick={() => navigate(backTo)}>
          {stage ? `Back to ${stage.code}` : 'Back'}
        </button>
      </div>
    );
  }

  if (!isMine && !otherActive && !active) {
    const chosenMinutes = chosen.reduce((n, x) => n + x.minutes, 0);
    const dropped = fitMinutes === null ? null : describeFitDrop(content, previewed);
    return (
      <div className="stack-lg" style={{ paddingTop: 'var(--space-6)' }}>
        <header className="stack-sm" style={{ textAlign: 'center' }}>
          <div className="eyebrow">{stage ? `${stage.code} · ` : ''}Routine</div>
          {/* The routine's own name leads its group; the generated summary
              is an inline LTR isolate inside it. */}
          <div className="stack-sm" dir="auto" style={{ textAlign: 'start' }}>
            <h1 className="page-title">{routine.name}</h1>
            <div className="tiny faint">
              <span dir="ltr">
                {chosen.length} segments · {chosenMinutes} min{shortOnTime ? ' · short on time' : ''}
                {fitMinutes !== null ? ` · fitted to ${fitMinutes} min` : ''}
                {edits.freedMinutes > 0 ? ` · ${edits.freedMinutes} min removed, left unused` : ''}
                {dropped ? ` · ${dropped}` : ''}
              </span>
            </div>
          </div>
        </header>
        <RunContents
          db={db}
          segments={edits.segments}
          label="What this run will contain"
          rowState={(i) => (edits.removed.includes(i) ? 'skipped' : 'pending')}
          onRemove={(i) => edit(removeFromPreview(edits, i))}
          removeLabel="Remove from this session"
        />
        <FreedTime
          minutes={edits.freedMinutes}
          recipients={edits.segments.map((seg, i) => ({ index: i, title: segmentTitle(db, seg) })).filter((r) => !edits.removed.includes(r.index))}
          onSpread={chosen.length > 0 ? () => edit(reuseFreedRoutineMinutes(edits, 'spread')) : undefined}
          onGive={(i) => edit(reuseFreedRoutineMinutes(edits, i))}
        />
        {chosen.length === 0 ? (
          <p className="small faint" style={{ textAlign: 'center' }}>
            <span dir="ltr">Every segment is removed — nothing to run.</span>
          </p>
        ) : null}
        <button
          className="btn btn-primary btn-lg"
          disabled={chosen.length === 0}
          onClick={fitMinutes === null && edits.removed.length === 0 ? begin : beginChosen}
        >
          <PlayIcon /> Start
        </button>
        <Link to={backTo} className="link small" style={{ textAlign: 'center' }}>
          Not now
        </Link>
      </div>
    );
  }

  if (!isMine || !clock) return null; // brief window while redirecting to the running clock

  const seg = authoredSegments[clock.segIndex];
  if (!seg) return null;
  const states = runSegmentStates(authoredSegments, segs, elapsedSeconds);
  const time = routineRunTime(authoredSegments, segs, elapsedSeconds);
  const segTitle = segmentTitle(db, seg);
  const segTotalSeconds = segs[clock.segIndex]?.seconds ?? seg.minutes * 60;
  const deg = segTotalSeconds > 0 ? (clock.segElapsedSeconds / segTotalSeconds) * 360 : 0;
  const next = authoredSegments.find((_, i) => i > clock.segIndex && !segs[i]?.skipped);
  // A segment reached via a boundary crossing (never the run's opening segment) stays
  // perceptibly marked for a defined window — never a one-render flash — so a musician
  // glancing up a few seconds after arriving still sees that the segment changed. This is
  // elapsed-derived, not marker-derived, so it also shows after a deliberate Skip (which
  // suppresses only the announcement, via acknowledgeThrough) — deliberately: it describes
  // the segment you are now on, not a re-announcement of the one you just chose to end.
  const justArrived = clock.segIndex > 0 && clock.segElapsedSeconds < SEGMENT_ARRIVAL_WINDOW_SECONDS;
  // A question's instrument: the routine's own, else its bound item's — never invented.
  const captureInstrument = routine.instrumentId ?? (seg.itemId ? getItem(db, seg.itemId)?.instrumentId : undefined);

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        {/* The page's one heading names the run; the eyebrow below shows it. */}
        <h1 className="sr-only">{routine.name}</h1>
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
          {effectiveShortOnTime ? ' · short on time' : ''}
        </div>
        <div className={`tiny${justArrived ? ' segment-arrived' : ' faint'}`}>
          {justArrived ? 'New segment · ' : ''}
          Segment {clock.segIndex + 1} of {authoredSegments.length}
          {seg.itemId ? '' : ' · unbound — not logged as practice'}
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

      {/* The segment's own label leads, so it and the item beneath it read as
          one block rather than pointing at opposite edges. */}
      <div dir="auto" style={{ textAlign: 'center' }}>
        <div className="title-md" style={{ fontSize: '1.2rem' }}>
          {segTitle}
        </div>
        {seg.itemId && seg.label && (
          <div className="tiny faint" dir="auto">
            {getItem(db, seg.itemId)?.title}
          </div>
        )}
        {/* next.label is authored independently of seg.label — its own
            dir="auto" isolate resolves from its own content, not seg's. */}
        {next && (
          <div className="tiny faint" style={{ marginTop: 6 }}>
            <span dir="ltr">
              Next: <span dir="auto">{segmentTitle(db, next)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Working notes for THE SEGMENT'S OWN BOUND ITEM — keyed on that item's
          id, so crossing a segment boundary remounts the editor rather than
          carrying an open draft onto the next piece. An UNBOUND segment is a
          plain countdown and has no item, so it gets no notebook rather than a
          fictitious one, and the authored segment instruction stays separate
          above. Nothing here touches the run's clock or its allocation. */}
      {seg.itemId && getItem(db, seg.itemId) && (
        <div className="card card-quiet" style={{ textAlign: 'start' }}>
          <ItemNotes key={seg.itemId} itemId={seg.itemId} startExpanded={false} />
        </div>
      )}

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
        <button className="btn" onClick={moveOnRoutineRun} aria-label="Move on — keep the time practised">
          Move on
        </button>
        <button className="btn btn-ghost" onClick={skipRoutineRun} aria-label="Skip — log nothing for this segment">
          Skip
        </button>
      </div>
      <p className="tiny faint">
        <span dir="ltr">Move on keeps what you practised here; Skip logs nothing for this segment. Neither lengthens another segment.</span>
      </p>

      <SoundNote state={sound} />

      <Metronome running={activeRoutine.running} />

      <TeacherQuestionCapture instrumentId={captureInstrument} itemId={seg.itemId && getItem(db, seg.itemId) ? seg.itemId : undefined} session={activeRoutine.startedAt ?? 'routine'} />

      <details className="disclosure" style={{ textAlign: 'start' }}>
        <summary className="small">
          <span dir="ltr">
            Run contents · {Math.round(time.remaining / 60)} of {Math.round(time.planned / 60)} min left
            {time.unused >= 60 ? ` · ${Math.round(time.unused / 60)} min unused` : ''}
          </span>
        </summary>
        <RunContents
          db={db}
          segments={authoredSegments}
          rowState={(i) => states[i]}
          onRemove={(i) => (states[i] === 'pending' ? removeRoutineSegment(i) : undefined)}
          removeLabel="Remove from this run"
        />
      </details>

      <div className="stack-sm" style={{ alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={finish}>
          <CheckIcon width={16} height={16} /> Finish &amp; save
        </button>
        <span className="tiny faint">Records what you've practised so far — never a discard</span>
      </div>
    </div>
  );
}

/** A segment's name: its own label, else its bound item's title — a bound segment needs no label of its own. */
function segmentTitle(db: PracticeDB, seg: RoutineSegment): string {
  return seg.label || (seg.itemId ? getItem(db, seg.itemId)?.title : undefined) || 'Segment';
}

const STATE_LABEL: Record<RunSegmentState, string> = {
  done: 'done',
  moved_on: 'moved on',
  skipped: 'skipped',
  current: 'now',
  pending: '',
};

/**
 * The run's contents, in order — before the start tap (what Start will run)
 * and while running (each entry's state). An unbound segment says so: it is
 * a countdown and logs nothing. Only a pending entry offers removal.
 */
function RunContents({
  db,
  segments,
  label,
  rowState,
  onRemove,
  removeLabel,
}: {
  db: PracticeDB;
  segments: RoutineSegment[];
  label?: string;
  rowState: (i: number) => RunSegmentState;
  onRemove: (i: number) => void;
  removeLabel: string;
}) {
  return (
    <section className="stack-sm" aria-label={label ?? 'Run contents'}>
      {label && <div className="section-label">{label}</div>}
      <ol className="card card-flush list" role="list" style={{ margin: 0, padding: 0 }}>
        {segments.map((seg, i) => {
          const state = rowState(i);
          const item = seg.itemId ? getItem(db, seg.itemId) : undefined;
          const title = segmentTitle(db, seg);
          return (
            <li key={i} className="list-row" style={{ alignItems: 'center', opacity: state === 'skipped' ? 0.55 : 1 }}>
              <span className="mono-num tiny faint" style={{ minWidth: 20 }}>
                {i + 1}
              </span>
              <div className="grow" dir="auto" style={{ minWidth: 0, textAlign: 'start' }}>
                <div style={{ fontWeight: state === 'current' ? 600 : 500 }}>{title}</div>
                {item && seg.label && <div className="tiny faint" dir="auto">{item.title}</div>}
                <div className="tiny faint">
                  <span dir="ltr">
                    {seg.minutes} min{seg.essential ? ' · essential' : ''}
                    {seg.itemId ? '' : ' · unbound — not logged'}
                    {STATE_LABEL[state] ? ` · ${STATE_LABEL[state]}` : ''}
                  </span>
                </div>
              </div>
              {state === 'pending' && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 'none', minHeight: 44 }}
                  onClick={() => onRemove(i)}
                  aria-label={`${removeLabel}: ${title}`}
                >
                  Remove
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const CAPTURE_RESULTS: BlockResult[] = ['worse', 'same', 'slightly_better', 'stable_alone', 'stable_in_context', 'performable'];

/**
 * The lighter variant of a close, after the clock has stopped: for each item
 * this run recorded, optionally one of the six results and one line, written
 * onto the run's OWN blocks. Nothing is required — the minutes are already
 * saved, and leaving forgoes only the capture. A chosen result can be cleared
 * back to "Not assessed" (`not_logged`), before or after saving. It never
 * schedules a review, moves a date or changes a status.
 */
function RoutineCapture({ blockIds }: { blockIds: ID[] }) {
  const db = useStore((s) => s.db);
  const recordRoutineCapture = useStore((s) => s.recordRoutineCapture);
  const blocks = blockIds.map((id) => db.blocks.find((b) => b.id === id)).filter((b) => b !== undefined);
  const [draft, setDraft] = useState<Record<ID, { result: BlockResult; observation: string }>>({});
  const ack = useAcknowledgedSaves();
  const KEY = 'capture';
  const entry = (id: ID) => draft[id] ?? { result: 'not_logged' as BlockResult, observation: '' };
  const save = () =>
    ack.run(KEY, JSON.stringify(draft), () =>
      recordRoutineCapture(
        blockIds,
        Object.entries(draft).map(([blockId, v]) => ({ blockId, result: v.result, observation: v.observation })),
      ),
    );
  if (blocks.length === 0) return null;
  return (
    <div className="card stack" style={{ textAlign: 'start' }}>
      <div className="section-label">What did each show? (optional)</div>
      {blocks.map((b) => {
        const v = entry(b.id);
        const title = getItem(db, b.practiceItemId)?.title ?? 'Item';
        const set = (patch: Partial<{ result: BlockResult; observation: string }>) =>
          setDraft((d) => ({ ...d, [b.id]: { ...(d[b.id] ?? { result: 'not_logged', observation: '' }), ...patch } }));
        return (
          <div key={b.id} className="stack-sm" role="group" aria-label={title}>
            <div className="small" dir="auto">
              {title}
            </div>
            <OptionPills
              ariaLabel={`Result for ${title}`}
              value={v.result}
              onChange={(r) => set({ result: r })}
              options={CAPTURE_RESULTS.map((r) => ({ value: r, label: RESULT_LABELS[r] }))}
            />
            {/* Back to "Not assessed" — before or after saving; the line below stays. */}
            {v.result !== 'not_logged' && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ minHeight: 44, alignSelf: 'flex-start' }}
                aria-label={`Clear the result for ${title}`}
                onClick={() => set({ result: 'not_logged' })}
              >
                Clear result
              </button>
            )}
            <input
              className="input"
              dir="auto"
              aria-label={`Observation for ${title}`}
              placeholder="One thing you noticed"
              value={v.observation}
              onChange={(e) => set({ observation: e.target.value })}
            />
          </div>
        );
      })}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-sm" onClick={save}>
          Save what they showed
        </button>
        <SaveStatus ack={ack.states[KEY]} current={JSON.stringify(draft)} onRetry={save} />
      </div>
    </div>
  );
}
