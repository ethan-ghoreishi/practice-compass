import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  daysUntil,
  dueReviews,
  fragileItems,
  generateInsights,
  instrumentBalance,
  insightOfTheDay,
  nextLessonDates,
  recommend,
  recommendForInstrument,
  routinesForInstrument,
  stageProgress,
  stageUnits,
  todayISODate,
  ITEM_STATUS_LABELS,
  type PathwayRoutine,
  type PracticeItem,
  type Recommendation,
} from '../domain';
import { useStore } from '../store/useStore';
import { getItem, instrumentName } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { EmptyState, StatusBadge } from '../components/ui';
import { ChevronRightIcon, MusicIcon, PathIcon, PlayIcon, PlusIcon, SparkIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import InstallHint from '../components/InstallHint';
import QuickAdd from '../components/QuickAdd';

// ---------------------------------------------------------------------------
// Today is a session workspace: "I am practising X now." Everything on screen
// belongs to X — its next recommendation first, then its class work, reviews
// and pathway position. The cross-instrument overview is a deliberate,
// secondary choice, never the default.
// ---------------------------------------------------------------------------

export default function Today() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const setSessionInstrument = useStore((s) => s.setSessionInstrument);

  const instruments = useMemo(() => db.instruments.filter((i) => i.active), [db.instruments]);
  // Last chosen instrument, else the first active one — never "all" by default.
  const selected =
    sessionInstrumentId === 'all'
      ? null
      : (instruments.find((i) => i.id === sessionInstrumentId) ?? instruments[0] ?? null);
  const overview = sessionInstrumentId === 'all';

  const now = useMemo(() => new Date(), []);

  return (
    <div className="stack-lg">
      <nav className="options" aria-label="Which instrument are you practising?">
        {instruments.map((i) => (
          <button
            key={i.id}
            className={`option${!overview && selected?.id === i.id ? ' selected' : ''}`}
            aria-pressed={!overview && selected?.id === i.id}
            onClick={() => setSessionInstrument(i.id)}
          >
            {i.name}
          </button>
        ))}
        <button
          className={`option${overview ? ' selected' : ''}`}
          aria-pressed={overview}
          onClick={() => setSessionInstrument('all')}
          title="Cross-instrument overview"
        >
          Overview
        </button>
      </nav>

      {active && !overview && selected && active.instrumentId === selected.id && (
        <Link to="/active" className="card card-accent card-link row between">
          <div>
            <div className="eyebrow">In progress</div>
            <div className="title-md" dir="auto">
              {getItem(db, active.itemId)?.title ?? 'Practice block'}
            </div>
          </div>
          <span className="btn btn-primary btn-sm">
            <PlayIcon /> Resume
          </span>
        </Link>
      )}

      <ElsewhereSessions selectedInstrumentId={overview ? null : (selected?.id ?? null)} />

      {overview || !selected ? (
        <OverviewView now={now} />
      ) : (
        <SessionView instrumentId={selected.id} instrumentName={selected.name} now={now} />
      )}

      {/* One-time, dismissible, hidden once installed — after the session, never in its place. */}
      <InstallHint />
    </div>
  );
}

// --- A session belongs to whichever instrument it was started for ------------
// `active`/`activePlan`/`activeRoutine` never masquerade as the selected
// instrument's own work. When one belongs to a DIFFERENT instrument than the
// one Today is scoped to, it shows here as an explicit "still running
// elsewhere" row (never silently hidden — that would invite overwriting it)
// rather than taking over that instrument's own Plan/Routines doorway.

function ElsewhereSessions({ selectedInstrumentId }: { selectedInstrumentId: string | null }) {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activePlan = useStore((s) => s.activePlan);
  const activeRoutine = useStore((s) => s.activeRoutine);

  const rows: { key: string; label: string; detail: string; to: string }[] = [];

  if (active && active.instrumentId !== selectedInstrumentId) {
    rows.push({
      key: 'active',
      label: getItem(db, active.itemId)?.title ?? 'Practice block',
      detail: `${instrumentName(db, active.instrumentId)} · in progress`,
      to: '/active',
    });
  }
  if (activePlan && activePlan.instrumentId !== selectedInstrumentId) {
    const done = activePlan.segments.filter((s) => s.status === 'done').length;
    rows.push({
      key: 'plan',
      label: `${instrumentName(db, activePlan.instrumentId)} plan`,
      detail: `${done} of ${activePlan.segments.length} done`,
      to: '/plan',
    });
  }
  if (activeRoutine) {
    const routine = db.pathwayRoutines.find((r) => r.id === activeRoutine.routineId);
    // A legacy routine with no instrumentId isn't foreign to anything —
    // never invent the instrument it's masquerading as.
    if (routine?.instrumentId && routine.instrumentId !== selectedInstrumentId) {
      rows.push({
        key: 'routine',
        label: routine.name,
        detail: `${instrumentName(db, routine.instrumentId)} routine`,
        to: `/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`,
      });
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="stack-sm">
      {rows.map((r) => (
        <Link key={r.key} to={r.to} className="card card-quiet card-link row between">
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny faint">{r.detail}</div>
            <div className="small truncate" dir="auto">
              {r.label}
            </div>
          </div>
          <span className="tiny faint" style={{ flex: 'none' }}>
            Resume ▸
          </span>
        </Link>
      ))}
    </div>
  );
}

// --- Session Plan and Routines: two independent, peer doorways ---------------
// Deliberately separate cards, not a shared panel — a time-budgeted Session
// Plan and following a routine are peer choices, not one subordinate to the
// other. Each starts collapsed so "Practise now" stays above the fold at
// 390×844, and each carries its own open/close state and its own "resume"
// takeover, matching the existing `active`/`activePlan` pattern.

const PLAN_DURATIONS = [15, 20, 30, 45, 60] as const;

function PlanCard({ instrumentId }: { instrumentId: string }) {
  const db = useStore((s) => s.db);
  const activePlan = useStore((s) => s.activePlan);
  const planMinutes = useStore((s) => s.planMinutesByInstrument);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (activePlan && activePlan.instrumentId === instrumentId) {
    const done = activePlan.segments.filter((s) => s.status === 'done').length;
    return (
      <button className="card card-accent row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate('/plan')}>
        <span style={{ fontWeight: 600 }}>Resume your plan</span>
        <span className="small">{done} of {activePlan.segments.length} · {activePlan.budgetMinutes} min ▸</span>
      </button>
    );
  }
  if (activePlan) {
    // A different instrument's plan is running. Starting a new plan here
    // would dead-end at that plan anyway (`/plan` always shows whichever one
    // is active) — so this doorway stays visibly blocked rather than
    // offering a duration picker that can't actually start anything.
    return (
      <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate('/plan')}>
        <span style={{ fontWeight: 600, opacity: 0.7 }}>Plan this session</span>
        <span className="faint small">{instrumentName(db, activePlan.instrumentId)} plan running ▸</span>
      </button>
    );
  }

  const defaultMinutes = planMinutes[instrumentId] ?? 20;

  if (!open) {
    return (
      <button
        className="card card-quiet row between"
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        aria-expanded={false}
      >
        <span style={{ fontWeight: 600 }}>Plan this session</span>
        <span className="faint small">choose a length ▸</span>
      </button>
    );
  }

  return (
    <section className="card card-quiet stack-sm">
      <div className="row between">
        <span style={{ fontWeight: 600 }}>How long today?</span>
        <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => setOpen(false)} aria-label="Collapse">✕</button>
      </div>
      <div className="options">
        {PLAN_DURATIONS.map((m) => (
          <button
            key={m}
            className={`option${m === defaultMinutes ? ' selected' : ''}`}
            onClick={() => navigate(`/plan?minutes=${m}`)}
          >
            {m} min
          </button>
        ))}
      </div>
    </section>
  );
}

function RoutinesCard({ instrumentId }: { instrumentId: string }) {
  const db = useStore((s) => s.db);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const routines = useStore((s) => s.db.pathwayRoutines);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const myRoutines = routinesForInstrument(routines, instrumentId);

  if (activeRoutine) {
    const running = routines.find((r) => r.id === activeRoutine.routineId);
    // A legacy routine with no instrumentId isn't foreign to anything.
    const matches = !running?.instrumentId || running.instrumentId === instrumentId;
    const to = `/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`;
    if (matches) {
      return (
        <button className="card card-accent row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(to)}>
          <span style={{ fontWeight: 600 }}>Resume your routine</span>
          <span className="small truncate" dir="auto" style={{ minWidth: 0 }}>{running?.name ?? 'Routine'} ▸</span>
        </button>
      );
    }
    // A different instrument's routine is running. Starting another one here
    // would just bounce back to it (RoutineRunner's own otherActive redirect)
    // — so this doorway stays visibly blocked rather than offering a Start
    // that can't actually start anything.
    return (
      <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(to)}>
        <span style={{ fontWeight: 600, opacity: 0.7 }}>Routines</span>
        <span className="faint small truncate" dir="auto">{instrumentName(db, running?.instrumentId)} routine running ▸</span>
      </button>
    );
  }

  if (!open) {
    return (
      <button
        className="card card-quiet row between"
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        aria-expanded={false}
      >
        <span style={{ fontWeight: 600 }}>Routines</span>
        <span className="faint small">
          {myRoutines.length > 0 ? `${myRoutines.length} saved ▸` : 'follow a set warm-up ▸'}
        </span>
      </button>
    );
  }

  return (
    <section className="card card-quiet stack-sm">
      <div className="row between">
        <span style={{ fontWeight: 600 }}>Routines</span>
        <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => setOpen(false)} aria-label="Collapse">✕</button>
      </div>
      {myRoutines.length === 0 ? (
        <button className="btn" style={{ width: '100%' }} onClick={() => navigate(`/routine/new?instrument=${instrumentId}`)}>
          <PlusIcon /> Create a routine
        </button>
      ) : (
        <div className="stack-sm">
          {myRoutines.map((r) => (
            <TodayRoutineRow key={r.id} routine={r} />
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/routine/new?instrument=${instrumentId}`)}>
            <PlusIcon /> New routine
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * Same shape as StageDetail's RoutineCard / PathwayDetail's RoutineRow (name +
 * segment summary, Edit, Start, and — when the routine has an essential
 * segment — a visible "short on time" entry point). This is the ONLY place an
 * unplaced routine (no pathway/stage) is reachable at all, so it needs the
 * same Edit/Start/short-on-time affordances those pages give a placed one.
 */
function TodayRoutineRow({ routine }: { routine: PathwayRoutine }) {
  const navigate = useNavigate();
  const total = routine.segments.reduce((sum, seg) => sum + seg.minutes, 0);
  const hasEssential = routine.segments.some((seg) => seg.essential);
  return (
    <article className="card stack-sm">
      <div className="row between">
        <div style={{ minWidth: 0 }}>
          <div className="truncate" dir="auto">{routine.name}</div>
          <div className="tiny faint">{routine.segments.length} segments · {total} min</div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/routine/${routine.id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/routine/${routine.id}`)} aria-label={`Start ${routine.name}`}>
            <PlayIcon width={16} height={16} />
          </button>
        </div>
      </div>
      {hasEssential && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-end' }}
          onClick={() => navigate(`/routine/${routine.id}?short=1`)}
        >
          Short on time — essentials only
        </button>
      )}
    </article>
  );
}

// --- The per-instrument session ----------------------------------------------

function SessionView({
  instrumentId,
  instrumentName: name,
  now,
}: {
  instrumentId: string;
  instrumentName: string;
  now: Date;
}) {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const notNow = useStore((s) => s.notNow);
  const startSession = useStore((s) => s.startSession);
  const startItemSession = useStore((s) => s.startItemSession);
  const notNowReview = useStore((s) => s.notNowReview);
  const snoozeReview = useStore((s) => s.snoozeReview);
  const navigate = useNavigate();

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const recs = useMemo(
    () => recommendForInstrument(instrumentId, db.items, db.blocks, now, lessonDates),
    [instrumentId, db.items, db.blocks, now, lessonDates],
  );

  const items = useMemo(() => db.items.filter((i) => i.instrumentId === instrumentId), [db.items, instrumentId]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const lessonDate = lessonDates.get(instrumentId);
  const classWork = useMemo(
    () => (lessonDate ? items.filter((i) => i.assignedForLesson) : []),
    [items, lessonDate],
  );

  const hiddenToday = notNow.date === todayISODate(now) ? new Set(notNow.ids) : new Set<string>();
  const reviews = useMemo(
    () =>
      dueReviews(db.reviews, now).filter((r) => {
        const item = itemById.get(r.practiceItemId);
        return item && !hiddenToday.has(r.id);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db.reviews, now, itemById, notNow],
  );

  const pathway = useMemo(
    () => db.pathways.find((p) => p.instrumentId === instrumentId),
    [db.pathways, instrumentId],
  );
  const stage = pathway
    ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId)
    : null;
  const stageSp = stage ? stageProgress(stageUnits(stage, db.items)) : null;

  const fragile = useMemo(() => fragileItems(items), [items]);

  const start = (item: PracticeItem) => {
    // A different item is already active: don't silently swap it out from
    // under the user (startSession would just no-op) — the in-progress
    // banner above is the resolve path.
    if (active && active.itemId !== item.id) return;
    startSession(defaultStartInput(item));
    navigate('/active');
  };

  if (items.length === 0) {
    return (
      <div className="stack">
        <div className="card">
          <EmptyState icon={<MusicIcon />} title={`Nothing for ${name} yet`}>
            Add your first piece or exercise below — a title is enough.
          </EmptyState>
        </div>
        <QuickAdd />
      </div>
    );
  }

  const secondary = [recs.quickWin, recs.maintenance].filter(Boolean) as Recommendation[];

  return (
    <div className="stack-lg">
      {/* 0 · Two collapsed, peer doorways — a time-budgeted plan and a
             routine are separate systems, neither subordinate to the other.
             Both start collapsed so the primary recommendation stays above
             the fold at 390×844. */}
      <PlanCard instrumentId={instrumentId} />
      <RoutinesCard instrumentId={instrumentId} />

      {/* 1 · The one thing to practise now — above the fold. */}
      {recs.best && (
        <article className="card card-accent">
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="eyebrow">Practise now</span>
            <StatusBadge status={recs.best.score.item.status} />
          </div>
          <Link to={`/items/${recs.best.score.item.id}`} state={{ from: '/' }} style={{ color: 'var(--text)' }}>
            <h2 className="title-md" dir="auto" style={{ fontSize: '1.3rem' }}>
              {recs.best.score.item.title}
            </h2>
          </Link>
          <p className="reason" style={{ marginTop: 6 }}>
            {recs.best.reason}
          </p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-lg grow" onClick={() => start(recs.best!.score.item)}>
              <PlayIcon /> Start · 10 min
            </button>
            <Link to={`/items/${recs.best.score.item.id}`} state={{ from: '/' }} className="btn btn-lg">
              Details
            </Link>
          </div>
        </article>
      )}

      {/* 2 · A calm sketch of the session. */}
      {secondary.length > 0 && (
        <section className="card card-quiet stack-sm">
          <div className="section-label">Then, if you have time</div>
          {secondary.map((rec) => (
            <div key={rec.kind} className="row" style={{ gap: 10 }}>
              <button
                className="grow"
                style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', minWidth: 0, padding: 0 }}
                onClick={() => start(rec.score.item)}
              >
                <span className="truncate" dir="auto">
                  {rec.score.item.title}
                </span>
                <div className="tiny faint truncate">{rec.reason}</div>
              </button>
              <button className="btn btn-sm" onClick={() => start(rec.score.item)} aria-label={`Practise ${rec.score.item.title}`}>
                <PlayIcon />
              </button>
            </div>
          ))}
        </section>
      )}

      {/* 3 · Class commitments for THIS instrument only. */}
      {lessonDate && classWork.length > 0 && (
        <section className="stack-sm">
          <h2 className="title-md">
            Before your {name} class
            <span className="dim" style={{ fontWeight: 400 }}>
              {' '}
              · {daysUntil(lessonDate, now) <= 0 ? 'today' : `in ${daysUntil(lessonDate, now)} day${daysUntil(lessonDate, now) === 1 ? '' : 's'}`}
            </span>
          </h2>
          <div className="card card-flush list">
            {classWork.map((item) => (
              <div key={item.id} className="list-row">
                <Link to={`/items/${item.id}`} state={{ from: '/' }} className="grow" style={{ minWidth: 0 }}>
                  <div className="truncate" dir="auto">
                    {item.title}
                  </div>
                  <div className="tiny faint">{ITEM_STATUS_LABELS[item.status]}</div>
                </Link>
                <button className="btn btn-sm btn-primary" onClick={() => start(item)} aria-label={`Practise ${item.title}`}>
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 · Due reviews, with honest actions. */}
      {reviews.length > 0 && (
        <section className="stack-sm">
          <div className="row between">
            <h2 className="title-md">Due reviews</h2>
            <span className="faint small">{reviews.length}</span>
          </div>
          <div className="card card-flush list">
            {reviews.map((r) => {
              const item = itemById.get(r.practiceItemId)!;
              return (
                <div key={r.id} className="list-row">
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="truncate" dir="auto">
                      {item.title}
                    </div>
                    <div className="tiny faint">due {relativeDay(r.dueDate, now)}</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Hide for the rest of today (no schedule change)"
                    onClick={() => notNowReview(r.id)}
                  >
                    Not now
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    title="Move the review 2 days from today"
                    onClick={() => snoozeReview(r.id)}
                  >
                    +2d
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (active && active.itemId !== item.id) return;
                      startItemSession(item.id);
                      navigate('/active');
                    }}
                    aria-label={`Review ${item.title}`}
                  >
                    <PlayIcon />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="tiny faint">Practising completes a review; “Not now” hides it until tomorrow; “+2d” moves its date.</div>
        </section>
      )}

      {/* 5 · Where you are on this instrument's path. */}
      {pathway && stage && (
        <Link
          to={`/pathway/${pathway.id}/${stage.id}`}
          className="card card-link row"
          style={{ gap: 10 }}
        >
          <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="truncate">
              <span className="dim">Now in:</span> {stage.code}
              {stage.title !== stage.code ? ` · ${stage.title}` : ''}
            </div>
            {stageSp && (
              <div className="row" style={{ gap: 8, marginTop: 6 }}>
                <span className="balance-track grow" style={{ maxWidth: 180 }}>
                  <span className="balance-fill" style={{ width: `${stageSp.percent}%` }} />
                </span>
                <span className="tiny faint mono-num">
                  {stageSp.done}/{stageSp.total}
                </span>
              </div>
            )}
          </div>
          <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
        </Link>
      )}

      {/* 6 · Shaky material, quick capture, and the open-ended start. */}
      {fragile.length > 0 && (
        <section className="stack-sm">
          <h2 className="title-md">Shaky right now</h2>
          <div className="card card-flush list">
            {fragile.slice(0, 4).map((item) => (
              <Link key={item.id} to={`/items/${item.id}`} state={{ from: '/' }} className="list-row card-link" style={{ borderRadius: 0 }}>
                <div className="grow truncate" dir="auto">
                  {item.title}
                </div>
                <StatusBadge status={item.status} />
                <ChevronRightIcon width={16} height={16} className="faint" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <QuickAdd />

      <Link to="/start" className="btn btn-block">
        Choose something else to practise…
      </Link>
    </div>
  );
}

// --- The deliberate cross-instrument overview ---------------------------------

function OverviewView({ now }: { now: Date }) {
  const db = useStore((s) => s.db);
  const setSessionInstrument = useStore((s) => s.setSessionInstrument);
  const navigate = useNavigate();

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const balance = useMemo(
    () => instrumentBalance(db.instruments.filter((i) => i.active), db.blocks, now, 7),
    [db.instruments, db.blocks, now],
  );
  const insight = useMemo(() => insightOfTheDay(generateInsights(db, now), now), [db, now]);

  return (
    <div className="stack-lg">
      <p className="page-sub" style={{ marginTop: -8 }}>
        A calm look across all instruments. Pick one above when you sit down to practise.
      </p>

      <section className="stack-sm">
        <h2 className="title-md">Each instrument, at a glance</h2>
        <div className="card card-flush list">
          {db.instruments
            .filter((i) => i.active)
            .map((inst) => {
              const recs = recommend(
                db.items.filter((x) => x.instrumentId === inst.id),
                db.blocks.filter((b) => b.instrumentId === inst.id),
                now,
                lessonDates,
              );
              const lessonDate = lessonDates.get(inst.id);
              return (
                <button
                  key={inst.id}
                  className="list-row card-link"
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}
                  onClick={() => {
                    setSessionInstrument(inst.id);
                    navigate('/');
                  }}
                >
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div>{inst.name}</div>
                    <div className="tiny faint truncate" dir="auto">
                      {recs.best ? `next: ${recs.best.score.item.title}` : 'nothing queued'}
                      {lessonDate ? ` · class ${relativeDay(lessonDate, now)}` : ''}
                    </div>
                  </div>
                  <ChevronRightIcon width={16} height={16} className="faint" />
                </button>
              );
            })}
        </div>
      </section>

      {insight && (
        <section className="card">
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <SparkIcon width={20} height={20} style={{ color: 'var(--gold)', flex: 'none', marginTop: 2 }} />
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>
                Insight
              </div>
              <div>{insight.body}</div>
            </div>
          </div>
        </section>
      )}

      <section className="stack-sm">
        <h2 className="title-md">Balance · last 7 days</h2>
        <div className="card stack-sm">
          {balance.every((b) => b.minutes === 0) ? (
            <div className="small dim">No practice logged in the last 7 days yet.</div>
          ) : (
            balance.map((b) => (
              <div key={b.instrumentId} className="balance-row">
                <span className="small truncate">{b.instrumentName}</span>
                <span className="balance-track">
                  <span className="balance-fill" style={{ width: `${b.percent}%` }} />
                </span>
                <span className="tiny faint mono-num" style={{ textAlign: 'right' }}>
                  {b.percent}%
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <Link to="/insights" className="btn btn-block">
        More insights →
      </Link>
    </div>
  );
}
