import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  assignedForLesson,
  currentStage,
  daysUntil,
  dueReviews,
  fragileItems,
  generateInsights,
  instrumentBalance,
  insightOfTheDay,
  nextLessonDates,
  recommend,
  stageProgress,
  stageUnits,
  ITEM_STATUS_LABELS,
  type PracticeItem,
} from '../domain';
import type { Recommendation } from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName, getItem } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { Badge, EmptyState, StatusBadge } from '../components/ui';
import { ChevronRightIcon, MusicIcon, PathIcon, PlayIcon, SparkIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import InstallHint from '../components/InstallHint';

const KIND_LABEL: Record<Recommendation['kind'], string> = {
  best: 'Best next focus',
  quick_win: 'Quick win',
  maintenance: 'Maintenance',
};

export default function Today() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const startSession = useStore((s) => s.startSession);
  const completeReview = useStore((s) => s.completeReview);
  const navigate = useNavigate();

  const now = useMemo(() => new Date(), []);
  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const recs = useMemo(
    () => recommend(db.items, db.blocks, now, lessonDates),
    [db.items, db.blocks, now, lessonDates],
  );
  const classWork = useMemo(() => {
    const flagged = assignedForLesson(db.items).filter((i) => lessonDates.has(i.instrumentId));
    return flagged
      .map((item) => ({ item, days: daysUntil(lessonDates.get(item.instrumentId)!, now) }))
      .sort((a, b) => a.days - b.days);
  }, [db.items, lessonDates, now]);
  const reviews = useMemo(() => dueReviews(db.reviews, now), [db.reviews, now]);
  const fragile = useMemo(() => fragileItems(db.items), [db.items]);
  const balance = useMemo(
    () => instrumentBalance(db.instruments, db.blocks, now, 7),
    [db.instruments, db.blocks, now],
  );
  const insight = useMemo(
    () => insightOfTheDay(generateInsights(db, now), now),
    [db, now],
  );

  const pathways = useMemo(() => [...db.pathways].sort((a, b) => a.order - b.order), [db.pathways]);

  const start = (item: PracticeItem) => {
    startSession(defaultStartInput(item));
    navigate('/active');
  };

  const cards = [recs.best, recs.quickWin, recs.maintenance].filter(Boolean) as Recommendation[];
  const hasAnything = db.items.length > 0;

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="eyebrow">{formatToday(now)}</div>
        <h1 className="page-title">What shall we practise?</h1>
        <p className="page-sub">One item, one focus. Pick a card or start your own block.</p>
      </header>

      <InstallHint />

      {active && (
        <Link to="/active" className="card card-accent card-link row between">
          <div>
            <div className="eyebrow">In progress</div>
            <div className="title-md">{getItem(db, active.itemId)?.title ?? 'Practice block'}</div>
          </div>
          <span className="btn btn-primary btn-sm">
            <PlayIcon /> Resume
          </span>
        </Link>
      )}

      {classWork.length > 0 && (
        <section className="stack-sm">
          <h2 className="title-md">
            Before your {instrumentName(db, classWork[0].item.instrumentId)} class
            <span className="dim" style={{ fontWeight: 400 }}>
              {' '}
              · {classWork[0].days <= 0 ? 'today' : `in ${classWork[0].days} day${classWork[0].days === 1 ? '' : 's'}`}
            </span>
          </h2>
          <div className="card card-flush list">
            {classWork.map(({ item }) => (
              <div key={item.id} className="list-row">
                <Link to={`/items/${item.id}`} className="grow" style={{ minWidth: 0 }}>
                  <div className="truncate" dir="auto">
                    {item.title}
                  </div>
                  <div className="tiny faint">{ITEM_STATUS_LABELS[item.status]}</div>
                </Link>
                <StatusBadge status={item.status} />
                <button className="btn btn-sm btn-primary" onClick={() => start(item)} aria-label={`Practise ${item.title}`}>
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {pathways.length > 0 && (
        <section className="stack-sm">
          <div className="row between">
            <h2 className="title-md row" style={{ gap: 6 }}>
              <PathIcon width={16} height={16} style={{ color: 'var(--accent)' }} /> Your pathways
            </h2>
            <Link to="/repertoire" className="tiny link">
              Manage
            </Link>
          </div>
          <div className="card card-flush list">
            {pathways.map((p) => {
              const cur = currentStage(db.pathwayStages, db.items, p.id);
              const sp = cur ? stageProgress(stageUnits(cur, db.items)) : null;
              return (
                <Link key={p.id} to={cur ? `/pathway/${p.id}/${cur.id}` : `/pathway/${p.id}`} className="list-row card-link" style={{ borderRadius: 0 }}>
                  <div className="grow">
                    <div className="truncate">{p.name}</div>
                    <div className="tiny faint truncate">
                      {p.instrumentId ? instrumentName(db, p.instrumentId) : 'General'}
                      {cur ? ` · now: ${cur.code}${cur.title !== cur.code ? ` ${cur.title}` : ''}` : ''}
                    </div>
                    {sp && (
                      <div className="row" style={{ gap: 8, marginTop: 6 }}>
                        <span className="balance-track grow" style={{ maxWidth: 160 }}>
                          <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
                        </span>
                        <span className="tiny faint mono-num">
                          {sp.done}/{sp.total}
                        </span>
                      </div>
                    )}
                  </div>
                  <ChevronRightIcon width={16} height={16} className="faint" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {!hasAnything ? (
        <div className="card">
          <EmptyState icon={<MusicIcon />} title="Your library is empty">
            Create your first practice item to get recommendations.{' '}
            <Link to="/repertoire" className="link">
              Add an item
            </Link>
            .
          </EmptyState>
        </div>
      ) : (
        <>
          <section className="stack">
            {cards.map((rec) => (
              <RecommendationCard key={rec.kind} rec={rec} onStart={start} db={db} />
            ))}
          </section>

          <Link to="/start" className="btn btn-primary btn-lg btn-block">
            <PlayIcon /> Start a quick block
          </Link>

          {insight && (
            <section className="card">
              <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                <SparkIcon width={20} height={20} style={{ color: 'var(--gold)', flex: 'none', marginTop: 2 }} />
                <div>
                  <div className="section-label" style={{ marginBottom: 4 }}>
                    Insight of the day
                  </div>
                  <div>{insight.body}</div>
                </div>
              </div>
            </section>
          )}

          <section className="stack-sm">
            <div className="row between">
              <h2 className="title-md">Due reviews</h2>
              <span className="faint small">{reviews.length}</span>
            </div>
            {reviews.length === 0 ? (
              <div className="card card-quiet small dim">Nothing due. Enjoy the space.</div>
            ) : (
              <div className="card card-flush list">
                {reviews.map((r) => {
                  const item = getItem(db, r.practiceItemId);
                  if (!item) return null;
                  return (
                    <div key={r.id} className="list-row">
                      <button
                        className="grow row"
                        style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'inherit', padding: 0 }}
                        onClick={() => start(item)}
                      >
                        <div className="grow">
                          <div className="truncate">{item.title}</div>
                          <div className="tiny faint">
                            {instrumentName(db, item.instrumentId)} · due {relativeDay(r.dueDate, now)}
                          </div>
                        </div>
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        title="Mark reviewed without a block"
                        onClick={() => completeReview(r.id)}
                      >
                        Skip
                      </button>
                      <button className="btn btn-sm" onClick={() => start(item)}>
                        <PlayIcon /> Start
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {fragile.length > 0 && (
            <section className="stack-sm">
              <h2 className="title-md">Fragile right now</h2>
              <div className="card card-flush list">
                {fragile.map((item) => (
                  <Link key={item.id} to={`/items/${item.id}`} className="list-row card-link" style={{ borderRadius: 0 }}>
                    <div className="grow">
                      <div className="truncate">{item.title}</div>
                      <div className="tiny faint">{instrumentName(db, item.instrumentId)}</div>
                    </div>
                    <StatusBadge status={item.status} />
                    <ChevronRightIcon width={16} height={16} className="faint" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="stack-sm">
            <h2 className="title-md">Instrument balance · last 7 days</h2>
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
        </>
      )}
    </div>
  );
}

function RecommendationCard({
  rec,
  onStart,
  db,
}: {
  rec: Recommendation;
  onStart: (item: PracticeItem) => void;
  db: ReturnType<typeof useStore.getState>['db'];
}) {
  const item = rec.score.item;
  return (
    <article className={`card ${rec.kind === 'best' ? 'card-accent' : ''}`}>
      <div className="row between" style={{ marginBottom: 6 }}>
        <span className={`eyebrow`}>{KIND_LABEL[rec.kind]}</span>
        <Badge tone={rec.kind === 'best' ? 'progress' : rec.kind === 'quick_win' ? 'good' : 'rest'}>
          {ITEM_STATUS_LABELS[item.status]}
        </Badge>
      </div>
      <Link to={`/items/${item.id}`} className="link" style={{ color: 'var(--text)' }}>
        <h3 className="title-md" style={{ fontSize: '1.25rem' }}>
          {item.title}
        </h3>
      </Link>
      <div className="tiny faint" style={{ marginTop: 2 }}>
        {instrumentName(db, item.instrumentId)}
      </div>
      <p className="reason" style={{ marginTop: 8 }}>
        {rec.reason}
      </p>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary grow" onClick={() => onStart(item)}>
          <PlayIcon /> Start now
        </button>
        <Link to={`/items/${item.id}`} className="btn">
          Details
        </Link>
      </div>
    </article>
  );
}

function formatToday(now: Date): string {
  return now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}
