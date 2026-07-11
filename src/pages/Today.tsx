import { useMemo } from 'react';
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
  stageProgress,
  stageUnits,
  todayISODate,
  ITEM_STATUS_LABELS,
  type PracticeItem,
  type Recommendation,
} from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { EmptyState, StatusBadge } from '../components/ui';
import { ChevronRightIcon, MusicIcon, PathIcon, PlayIcon, SparkIcon } from '../components/icons';
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

      {active && (
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
                  <button className="btn btn-sm btn-primary" onClick={() => { startItemSession(item.id); navigate('/active'); }} aria-label={`Review ${item.title}`}>
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
