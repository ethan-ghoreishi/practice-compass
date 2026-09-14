import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildSessionPlan,
  currentStage,
  MAX_BUDGET_MINUTES,
  MIN_BUDGET_MINUTES,
  planPreviewDayHasPassed,
  preparationDatesByItem,
  redistributePlan,
  swapSegment,
  clampSchedulingParams,
  todayISODate,
  validateBudgetMinutes,
  type PlanBucket,
  type SessionPlan as SessionPlanT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { CheckIcon, MinusIcon, PlayIcon, XIcon } from '../components/icons';
import { useDecisionNow } from '../components/useDecisionNow';

/** The presets the picker offers; any whole minute in range is still accepted. */
const BUDGET_PRESETS = [5, 10, 15, 20, 30, 45, 60] as const;

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
  // Refreshed at a local-day boundary so a preview left open overnight never
  // plans against yesterday's due dates and lesson deadlines.
  //
  // `useDecisionNow` polls at most every 30 seconds (plus visibility/focus),
  // so it can lag the true instant by up to that long. `nowOverride` closes
  // that gap at the one moment it actually matters — Start — without needing
  // the shared hook to expose a manual refresh: the same small local-override
  // shape CloseBlock's own Save race uses. `start()` sets it the instant it
  // finds the real local day has moved past the day this preview was built
  // for, forcing an immediate re-render where `today`/`stale` below already
  // reflect it, instead of silently installing yesterday's selections under a
  // Start button that still reads as enabled.
  const [nowOverride, setNowOverride] = useState<Date | null>(null);
  const decisionNow = useDecisionNow();
  const now = nowOverride ?? decisionNow;

  const instrumentId = sessionInstrumentId ?? db.instruments.find((i) => i.active)?.id ?? db.instruments[0]?.id ?? '';
  // Invalid input is rejected at the boundary, never clamped into a session
  // length the owner did not choose or looped over.
  const queryMinutes = validateBudgetMinutes(Number(params.get('minutes')));
  const [chosen, setChosen] = useState<number | null>(null);
  const budget = chosen ?? queryMinutes ?? validateBudgetMinutes(planMinutes[instrumentId]) ?? 20;

  const build = useMemo(() => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
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
      preparationDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
    });
  }, [instrumentId, budget, db.items, db.blocks, db.reviews, db.lessons, db.lessonAgenda, db.pathways, db.pathwayStages, db.settings, now]);

  const [plan, setPlan] = useState<SessionPlanT>(build);
  // WHAT the plan was built FOR. `generatedAt` used to be the re-seed key, and
  // it never changed within a mount (the page froze `now`), so changing the
  // budget or the instrument left the previous plan on screen — a preview of a
  // session the owner was no longer asking for.
  const seedKey = `${instrumentId}|${budget}`;
  const [seed, setSeed] = useState(seedKey);
  // The data revision the visible draft was built from. A change to the items,
  // blocks or reviews underneath it does NOT silently rewrite the draft (that
  // would throw away deliberate swaps and removals) — it marks the draft as
  // needing regeneration, so stale work can never be started by accident.
  const rev = useStore((s) => s.rev);
  const [baseRev, setBaseRev] = useState(rev);
  // The LOCAL CALENDAR DAY the visible draft was built for. `rev` alone
  // cannot catch a plan left open across midnight with no database write in
  // between: `db.items`/`db.blocks`/`db.reviews` are identical, so `rev`
  // never moves, yet "today's class" and "due today" are no longer honest
  // once the day has actually rolled. Tracked the same way as `rev` — marking
  // the draft stale rather than silently rewriting it — so a deliberate swap
  // or removal survives the boundary exactly as it survives any other change
  // underneath the plan.
  const today = todayISODate(now);
  const [baseDay, setBaseDay] = useState(today);
  if (seedKey !== seed) {
    setSeed(seedKey);
    setPlan(build);
    setBaseRev(rev);
    setBaseDay(today);
  }
  const stale = rev !== baseRev || today !== baseDay;

  const total = plan.segments.reduce((a, s) => a + s.minutes, 0);
  const editorArgs = () => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
    const pathway = db.pathways.find((p) => p.instrumentId === instrumentId);
    const stage = pathway ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId) : null;
    const stageItemIds = stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
    return {
      instrumentId,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      preparationDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
      excludeIds: new Set(plan.segments.map((s) => s.itemId)),
    };
  };

  function regenerate() {
    setPlan(build);
    setSeed(seedKey);
    setBaseRev(rev);
    setBaseDay(today);
  }
  function removeAt(i: number) {
    const segments = plan.segments.filter((_, idx) => idx !== i);
    setPlan(redistributePlan({ ...plan, segments }, clampSchedulingParams(db.settings)));
  }
  function swapAt(i: number) {
    setPlan(swapSegment(plan, i, editorArgs()));
  }
  function start() {
    // Starting a plan is an authority boundary: check the TRUE current
    // instant here, never the polled `now` above, which can still be
    // showing yesterday for up to `useDecisionNow`'s own poll interval after
    // local midnight has genuinely passed — the exact window a dispatched
    // visibility/focus event papers over but a real device left untouched
    // does not get. A mismatch refuses the start and forces the SAME visible
    // refresh the passive banner below already shows for a data change,
    // rather than silently installing a preview for a day that has passed.
    const trueNow = new Date();
    if (planPreviewDayHasPassed(baseDay, trueNow)) {
      setNowOverride(trueNow);
      return;
    }
    if (plan.segments.length === 0 || stale) return;
    setPlanMinutes(instrumentId, plan.budgetMinutes);
    startPlan(plan);
    navigate('/plan');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="row between">
          {/* The instrument name is the owner's own editable text — its own
              dir="auto" isolate, nested inside the title rather than bare, so
              a Farsi name doesn't inherit whatever base the title's fixed
              English words would otherwise resolve to. */}
          <h1 className="page-title">
            Your <span dir="auto">{instrumentName(db, instrumentId)}</span> session
          </h1>
          <Link to="/" className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} aria-label="Back to Today">
            <XIcon />
          </Link>
        </div>
        <p className="page-sub">{plan.summary}</p>
      </header>

      {/* How long have you got? The presets cover the ordinary answers
          (5 and 10 included — a five-minute session is a real session, and
          used to have no preset at all), and the number entry covers every
          other whole minute in range. An out-of-range or unreadable value is
          simply not accepted, rather than quietly becoming something else. */}
      <fieldset className="stack-sm" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="section-label">How long have you got?</legend>
        <div className="options">
          {BUDGET_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`option${budget === m ? ' selected' : ''}`}
              aria-pressed={budget === m}
              onClick={() => setChosen(m)}
            >
              {m} min
            </button>
          ))}
        </div>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={MIN_BUDGET_MINUTES}
          max={MAX_BUDGET_MINUTES}
          step={1}
          aria-label="Session length in minutes"
          value={budget}
          onChange={(e) => {
            const v = validateBudgetMinutes(Number(e.target.value));
            if (v !== null) setChosen(v);
          }}
          style={{ maxWidth: 120 }}
        />
      </fieldset>

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
                <div dir="auto">
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {/* seg.reason is always English (planSegmentReason) — its own
                      dir="ltr" isolate keeps its bidi base fixed regardless of
                      the title's. */}
                  <div className="tiny faint">
                    <span dir="ltr">{seg.reason}</span>
                  </div>
                </div>
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

      {stale && (
        <div className="card card-quiet small" role="status" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">
            {today !== baseDay
              ? 'This plan was built for a day that has passed. Regenerate it before you start.'
              : 'Your practice data changed while this plan was open. Regenerate it before you start.'}
          </span>
        </div>
      )}

      <div className="row" style={{ gap: 10 }}>
        <button
          className="btn btn-primary btn-lg grow"
          onClick={start}
          disabled={plan.segments.length === 0 || stale}
        >
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
          {/* Same isolate as the picker's own title above. */}
          <h1 className="page-title">
            <span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span> session
          </h1>
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
                <div dir="auto">
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {isCurrent && (
                    <div className="tiny faint">
                      <span dir="ltr">{seg.reason}</span>
                    </div>
                  )}
                </div>
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
