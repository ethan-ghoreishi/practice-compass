import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  dueReviews,
  fragileItems,
  generateInsights,
  getCurriculum,
  instrumentBalance,
  insightOfTheDay,
  nextStepInStage,
  recommend,
  stageProgress,
  stepsForStage,
  ITEM_STATUS_LABELS,
  type CurriculumStep,
  type PracticeItem,
} from '../domain';
import type { Recommendation } from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName, getItem } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { Badge, EmptyState, StatusBadge } from '../components/ui';
import { ChevronRightIcon, MusicIcon, PathIcon, PlayIcon, SparkIcon } from '../components/icons';
import { relativeDay } from '../components/format';

const KIND_LABEL: Record<Recommendation['kind'], string> = {
  best: 'Best next focus',
  quick_win: 'Quick win',
  maintenance: 'Maintenance',
};

export default function Today() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const startSession = useStore((s) => s.startSession);
  const startStepSession = useStore((s) => s.startStepSession);
  const completeReview = useStore((s) => s.completeReview);
  const navigate = useNavigate();

  const now = useMemo(() => new Date(), []);
  const recs = useMemo(() => recommend(db.items, db.blocks, now), [db.items, db.blocks, now]);
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

  const curriculum = useMemo(() => getCurriculum(), []);
  const stage = useMemo(() => currentStage(curriculum, db.curriculum), [curriculum, db.curriculum]);
  const stageSp = useMemo(
    () => (stage ? stageProgress(stepsForStage(curriculum, db.curriculum, stage.id), db.curriculum) : null),
    [curriculum, db.curriculum, stage],
  );
  const nextStep = useMemo(
    () => (stage ? nextStepInStage(curriculum, db.curriculum, stage.id) : null),
    [curriculum, db.curriculum, stage],
  );

  const start = (item: PracticeItem) => {
    startSession(defaultStartInput(item));
    navigate('/active');
  };

  const practiseStep = (step: CurriculumStep) => {
    startStepSession(step);
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

      {stage && (
        <section className="card stack-sm">
          <div className="row between">
            <span className="eyebrow">
              <PathIcon width={13} height={13} style={{ verticalAlign: '-2px', marginRight: 5 }} />
              Your pathway
            </span>
            <Link to="/pathway" className="tiny link">
              View path
            </Link>
          </div>
          <Link to={`/pathway/${stage.code}`} className="title-md" style={{ color: 'var(--text)' }}>
            {stage.code} · {stage.title}
          </Link>
          {stageSp && (
            <div className="row" style={{ gap: 8 }}>
              <span className="balance-track grow">
                <span className="balance-fill" style={{ width: `${stageSp.percent}%` }} />
              </span>
              <span className="tiny faint mono-num">
                {stageSp.done}/{stageSp.total}
              </span>
            </div>
          )}
          {nextStep ? (
            <>
              <div className="small dim">Next: {nextStep.title}</div>
              <div className="row">
                {nextStep.kind !== 'checkpoint' ? (
                  <button className="btn btn-primary grow" onClick={() => practiseStep(nextStep)}>
                    <PlayIcon /> Practise next step
                  </button>
                ) : (
                  <Link to={`/pathway/${stage.code}`} className="btn btn-primary grow">
                    Review checkpoint
                  </Link>
                )}
                <Link to={`/pathway/${stage.code}`} className="btn">
                  Open
                </Link>
              </div>
            </>
          ) : (
            <Link to={`/pathway/${stage.code}`} className="btn btn-primary">
              Open stage
            </Link>
          )}
        </section>
      )}

      {!hasAnything ? (
        <div className="card">
          <EmptyState icon={<MusicIcon />} title="Your library is empty">
            Create your first practice item to get recommendations.{' '}
            <Link to="/items" className="link">
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
