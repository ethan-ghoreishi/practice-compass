import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildSessionPlan,
  currentStage,
  nextLessonDates,
  redistributePlan,
  swapSegment,
  clampSchedulingParams,
  type PlanBucket,
  type SessionPlan as SessionPlanT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { CheckIcon, MinusIcon, PlayIcon, XIcon } from '../components/icons';

const BUCKET_LABEL: Record<PlanBucket, string> = {
  warmup: 'Warm-up',
  lesson: 'For class',
  review: 'Review',
  deep: 'Focus',
  cooldown: 'Cool-down',
};

export default function SessionPlan() {
  const activePlan = useStore((s) => s.activePlan);
  // A running plan takes over the whole page; otherwise show the preview.
  return activePlan ? <PlanRunner /> : <PlanPreview />;
}

// --- Preview: build, tweak, and start ---------------------------------------

function PlanPreview() {
  const db = useStore((s) => s.db);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const planMinutes = useStore((s) => s.planMinutesByInstrument);
  const setPlanMinutes = useStore((s) => s.setPlanMinutes);
  const startPlan = useStore((s) => s.startPlan);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const now = useMemo(() => new Date(), []);

  const instrumentId = sessionInstrumentId ?? db.instruments.find((i) => i.active)?.id ?? db.instruments[0]?.id ?? '';
  const queryMinutes = Number(params.get('minutes'));
  const budget = Number.isFinite(queryMinutes) && queryMinutes > 0 ? Math.round(queryMinutes) : planMinutes[instrumentId] ?? 20;

  const build = useMemo(() => {
    const lessonDates = nextLessonDates(db.lessons, now);
    const pathway = db.pathways.find((p) => p.instrumentId === instrumentId);
    const stage = pathway ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId) : null;
    const stageItemIds = stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
    return buildSessionPlan({
      instrumentId,
      budgetMinutes: budget,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      lessonDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
    });
  }, [instrumentId, budget, db.items, db.blocks, db.reviews, db.lessons, db.pathways, db.pathwayStages, db.settings, now]);

  const [plan, setPlan] = useState<SessionPlanT>(build);
  // Re-seed the editable copy whenever the freshly-built plan changes.
  const [seed, setSeed] = useState(build.generatedAt);
  if (build.generatedAt !== seed) {
    setSeed(build.generatedAt);
    setPlan(build);
  }

  const total = plan.segments.reduce((a, s) => a + s.minutes, 0);
  const editorArgs = () => {
    const lessonDates = nextLessonDates(db.lessons, now);
    const pathway = db.pathways.find((p) => p.instrumentId === instrumentId);
    const stage = pathway ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId) : null;
    const stageItemIds = stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
    return {
      instrumentId,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      lessonDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
      excludeIds: new Set(plan.segments.map((s) => s.itemId)),
    };
  };

  function regenerate() {
    setPlan(build);
    setSeed(build.generatedAt);
  }
  function removeAt(i: number) {
    const segments = plan.segments.filter((_, idx) => idx !== i);
    setPlan(redistributePlan({ ...plan, segments }, clampSchedulingParams(db.settings)));
  }
  function swapAt(i: number) {
    setPlan(swapSegment(plan, i, editorArgs()));
  }
  function start() {
    if (plan.segments.length === 0) return;
    setPlanMinutes(instrumentId, plan.budgetMinutes);
    startPlan(plan);
    navigate('/plan');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="row between">
          <h1 className="page-title">Your {instrumentName(db, instrumentId)} session</h1>
          <Link to="/" className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} aria-label="Back to Today">
            <XIcon />
          </Link>
        </div>
        <p className="page-sub">{plan.summary}</p>
      </header>

      {plan.segments.length === 0 ? (
        <div className="card">
          <p className="dim">Nothing to plan yet — add a piece or exercise and come back.</p>
        </div>
      ) : (
        <div className="card card-flush list">
          {plan.segments.map((seg, i) => (
            <div key={`${seg.itemId}-${i}`} className="list-row" style={{ alignItems: 'flex-start' }}>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                  <span className="mono-num" style={{ fontWeight: 600, minWidth: 44 }}>{seg.minutes} min</span>
                  <span className="tiny faint">{BUCKET_LABEL[seg.bucket]}</span>
                  {seg.core && <span className="tiny" style={{ color: 'var(--accent)' }}>core</span>}
                </div>
                <div className="truncate" dir="auto" style={{ fontWeight: 500 }}>{seg.title}</div>
                <div className="tiny faint" dir="auto">{seg.reason}</div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={() => swapAt(i)} aria-label={`Swap ${seg.title} for another`}>
                Swap
              </button>
              <button className="btn btn-ghost" style={{ flex: 'none', minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => removeAt(i)} aria-label={`Remove ${seg.title} from the plan`}>
                <MinusIcon />
              </button>
            </div>
          ))}
          <div className="list-row">
            <span className="grow tiny faint">Total</span>
            <span className="mono-num" style={{ fontWeight: 600 }}>{total} min</span>
          </div>
        </div>
      )}

      <div className="row" style={{ gap: 10 }}>
        <button className="btn btn-primary btn-lg grow" onClick={start} disabled={plan.segments.length === 0}>
          <PlayIcon /> Start plan
        </button>
        <button className="btn btn-lg" onClick={regenerate}>Regenerate</button>
      </div>
      <p className="tiny faint">
        Each block is real practice — start it, close it, and the plan moves on. Swap or remove anything before you begin.
      </p>
    </div>
  );
}

// --- Runner: walk the segments through real blocks --------------------------

function PlanRunner() {
  const activePlan = useStore((s) => s.activePlan)!;
  const db = useStore((s) => s.db);
  const beginPlanSegment = useStore((s) => s.beginPlanSegment);
  const skipPlanSegment = useStore((s) => s.skipPlanSegment);
  const endPlan = useStore((s) => s.endPlan);
  const navigate = useNavigate();

  const done = activePlan.segments.filter((s) => s.status === 'done').length;
  const finished = activePlan.pointer >= activePlan.segments.length;

  function begin() {
    beginPlanSegment();
    navigate('/active');
  }
  function finish() {
    endPlan();
    navigate('/');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="row between">
          <h1 className="page-title">{instrumentName(db, activePlan.instrumentId)} session</h1>
          <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={finish} aria-label="End the plan">
            <XIcon />
          </button>
        </div>
        <p className="page-sub">
          {done} of {activePlan.segments.length} done · {activePlan.budgetMinutes} min planned
        </p>
      </header>

      {finished ? (
        <div className="card card-accent stack-sm">
          <h2 className="title-md">Session complete</h2>
          <p className="dim">You worked through the plan. End on that — rest is where it consolidates.</p>
          <button className="btn btn-primary btn-lg" onClick={finish}>
            <CheckIcon /> Done
          </button>
        </div>
      ) : null}

      <div className="card card-flush list">
        {activePlan.segments.map((seg, i) => {
          const isCurrent = i === activePlan.pointer && !finished;
          return (
            <div
              key={`${seg.itemId}-${i}`}
              className={`list-row${isCurrent ? ' card-accent' : ''}`}
              style={{ alignItems: 'flex-start', opacity: seg.status === 'pending' ? 1 : 0.55 }}
            >
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                  <span className="mono-num" style={{ fontWeight: 600, minWidth: 44 }}>{seg.minutes} min</span>
                  <span className="tiny faint">{BUCKET_LABEL[seg.bucket]}</span>
                  {seg.status === 'done' && <span className="tiny" style={{ color: 'var(--tone-good)' }}>done</span>}
                  {seg.status === 'skipped' && <span className="tiny faint">skipped</span>}
                </div>
                <div className="truncate" dir="auto" style={{ fontWeight: 500 }}>{seg.title}</div>
                {isCurrent && <div className="tiny faint" dir="auto">{seg.reason}</div>}
              </div>
              {isCurrent && (
                <div className="row" style={{ gap: 6, flex: 'none' }}>
                  <button className="btn btn-primary btn-sm" onClick={begin} aria-label={`Start ${seg.title}`}>
                    <PlayIcon /> Start
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={skipPlanSegment} aria-label={`Skip ${seg.title}`}>
                    Skip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
