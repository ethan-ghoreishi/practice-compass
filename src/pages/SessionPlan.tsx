import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildSessionPlan,
  pathwayPosition,
  primaryPathway,
  MAX_BUDGET_MINUTES,
  MIN_BUDGET_MINUTES,
  movePlanSegment,
  freedMinutes,
  freedRoom,
  planClassCoverage,
  planPreviewDayHasPassed,
  planRunTime,
  preparationDatesByItem,
  removePlanSegment,
  requiredClassWork,
  reuseFreedMinutes,
  swapSegment,
  clampSchedulingParams,
  todayISODate,
  validateBudgetMinutes,
  type ClassCoverage,
  type PlanBucket,
  type SessionPlan as SessionPlanT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { CheckIcon, MinusIcon, PlayIcon, XIcon } from '../components/icons';
import { useDecisionNow } from '../components/useDecisionNow';
import { FreedTime } from '../components/ui';

/** The presets the picker offers; any whole minute in range is still accepted. */
const BUDGET_PRESETS = [5, 10, 15, 20, 30, 45, 60] as const;

const BUCKET_LABEL: Record<PlanBucket, string> = {
  warmup: 'Warm-up',
  lesson: 'For class',
  review: 'Review',
  deep: 'Focus',
  cooldown: 'Cool-down',
};

/**
 * The items placed in the stage this instrument's route is at — read through
 * the SAME selector Today and Repertoire use (visible, ordered, pinned), and
 * shared by BOTH plan derivations below so the build and the editor can never
 * follow two different routes. Which items count as "in the stage" is
 * unchanged: placement, exactly as the plan engine has always been given.
 */
function currentStageItemIds(
  db: Pick<ReturnType<typeof useStore.getState>['db'], 'pathways' | 'pathwayStages' | 'items'>,
  instrumentId: string,
): Set<string> {
  const { stage } = pathwayPosition(db, primaryPathway(db.pathways, instrumentId));
  return stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
}

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
  // A refused Start says why, until the preview changes under it.
  const [refusal, setRefusal] = useState<string | null>(null);
  const decisionNow = useDecisionNow();
  const now = nowOverride ?? decisionNow;

  const instrumentId = sessionInstrumentId ?? db.instruments.find((i) => i.active)?.id ?? db.instruments[0]?.id ?? '';
  // Invalid input is rejected at the boundary, never clamped into a session
  // length the owner did not choose or looped over.
  const queryMinutes = validateBudgetMinutes(Number(params.get('minutes')));
  const [chosen, setChosen] = useState<number | null>(null);
  const budget = chosen ?? queryMinutes ?? validateBudgetMinutes(planMinutes[instrumentId]) ?? 20;

  // The next class's required work — the ONE set the build reserves, the
  // coverage reports and Start rechecks.
  const required = useMemo(
    () => requiredClassWork(db.lessonAgenda, db.lessons, db.items, instrumentId, now),
    [db.lessonAgenda, db.lessons, db.items, instrumentId, now],
  );

  const build = useMemo(() => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
    const stageItemIds = currentStageItemIds(
      { pathways: db.pathways, pathwayStages: db.pathwayStages, items: db.items },
      instrumentId,
    );
    return buildSessionPlan({
      instrumentId,
      budgetMinutes: budget,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      preparationDates,
      stageItemIds,
      requiredItemIds: required.itemIds,
      params: clampSchedulingParams(db.settings),
    });
  }, [instrumentId, budget, db.items, db.blocks, db.reviews, db.lessons, db.lessonAgenda, db.pathways, db.pathwayStages, db.settings, now, required]);

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
    setRefusal(null);
    setPlan(build);
    setBaseRev(rev);
    setBaseDay(today);
  }
  const stale = rev !== baseRev || today !== baseDay;
  const coverage = planClassCoverage(plan, required, db.items, `${baseRev}|${baseDay}`);
  const short = coverage.omitted.some((o) => o.why === 'short');

  const total = plan.segments.reduce((a, s) => a + s.minutes, 0);
  const unused = Math.max(0, plan.budgetMinutes - total);
  const scheduling = clampSchedulingParams(db.settings);
  const freed = freedMinutes(plan);
  const recipients = plan.segments.map((seg, i) => ({ index: i, title: seg.title })).filter((r) => freedRoom(plan, r.index, scheduling) > 0);
  const spreadable = recipients.some((r) => plan.segments[r.index].bucket !== 'warmup' && plan.segments[r.index].bucket !== 'cooldown');
  const editorArgs = () => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
    const stageItemIds = currentStageItemIds(
      { pathways: db.pathways, pathwayStages: db.pathwayStages, items: db.items },
      instrumentId,
    );
    return {
      instrumentId,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      preparationDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
      requiredItemIds: required.itemIds,
      excludeIds: new Set(plan.segments.map((s) => s.itemId)),
    };
  };

  function edit(next: SessionPlanT) {
    setRefusal(null);
    setPlan(next);
  }
  function regenerate() {
    setRefusal(null);
    setPlan(build);
    setSeed(seedKey);
    setBaseRev(rev);
    setBaseDay(today);
  }
  // Removing leaves the freed minutes UNUSED — the other segments keep
  // exactly what they asked for; Regenerate (or a new length) allocates again.
  function removeAt(i: number) {
    edit(removePlanSegment(plan, i));
  }
  // Order is the owner's: the whole segment moves, nothing else changes, and
  // focus stays on the control just used so repeated moves need no hunting.
  function moveAt(i: number, dir: -1 | 1, button: HTMLButtonElement) {
    const label = button.getAttribute('aria-label') ?? '';
    edit(movePlanSegment(plan, i, dir));
    // At either end its own control disables, so focus moves to the other one.
    const other = label.endsWith(' earlier') ? label.replace(/ earlier$/, ' later') : label.replace(/ later$/, ' earlier');
    requestAnimationFrame(() => {
      const buttons = [...document.querySelectorAll<HTMLButtonElement>('button[aria-label]')];
      const find = (name: string) => buttons.find((b) => b.getAttribute('aria-label') === name && !b.disabled);
      (find(label) ?? find(other))?.focus();
    });
  }
  function swapAt(i: number) {
    edit(swapSegment(plan, i, editorArgs()));
  }
  /** `acceptedKey`: the coverage a "Start without …" tap was made against. */
  function start(acceptedKey?: string) {
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
    // Class coverage is rechecked against LIVE data at the true instant, by
    // the store as it installs the run: a partial-start choice made against
    // other commitments never carries over, and a sub-floor class slot never
    // starts at all.
    const refused = startPlan(plan, acceptedKey);
    if (refused) {
      setRefusal(
        refused === 'short'
          ? 'A class item here has less than its useful minutes — swap it back or regenerate.'
          : 'Your class work changed — check what is left out, then choose again.',
      );
      return;
    }
    setPlanMinutes(instrumentId, plan.budgetMinutes);
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

      <ClassCoverageCard coverage={coverage} budget={plan.budgetMinutes} onUseMinutes={(m) => setChosen(m)} />

      {plan.segments.length === 0 ? (
        coverage.omitted.length > 0 ? null : (
          <div className="card">
            <p className="dim">Nothing to plan yet — add a piece or exercise and come back.</p>
          </div>
        )
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
                <div dir="auto" style={{ textAlign: 'start' }}>
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {/* seg.reason is always English (planSegmentReason) — its own
                      dir="ltr" isolate keeps its bidi base fixed regardless of
                      the title's. */}
                  <div className="tiny faint">
                    <span dir="ltr">{seg.reason}</span>
                  </div>
                </div>
              </div>
              <div className="row" style={{ flex: 'none', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 140 }}>
                <button
                  className="btn btn-ghost"
                  style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                  disabled={i === 0}
                  onClick={(e) => moveAt(i, -1, e.currentTarget)}
                  aria-label={`Move ${seg.title} earlier`}
                >
                  ↑
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ minWidth: 44, minHeight: 44, padding: 0 }}
                  disabled={i === plan.segments.length - 1}
                  onClick={(e) => moveAt(i, 1, e.currentTarget)}
                  aria-label={`Move ${seg.title} later`}
                >
                  ↓
                </button>
                <button className="btn btn-ghost btn-sm" style={{ minHeight: 44 }} onClick={() => swapAt(i)} aria-label={`Swap ${seg.title} for another`}>
                  Swap
                </button>
                <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => removeAt(i)} aria-label={`Remove ${seg.title} from the plan`}>
                  <MinusIcon />
                </button>
              </div>
            </div>
          ))}
          <div className="list-row">
            <span className="grow tiny faint">Planned</span>
            <span className="mono-num" style={{ fontWeight: 600 }}>{total} min</span>
          </div>
          {unused > 0 && (
            <div className="list-row">
              <span className="grow tiny faint">Unused of your {plan.budgetMinutes} min</span>
              <span className="mono-num tiny faint">{unused} min</span>
            </div>
          )}
        </div>
      )}

      <FreedTime
        minutes={freed}
        recipients={recipients}
        onSpread={spreadable ? () => edit(reuseFreedMinutes(plan, 'spread', scheduling)) : undefined}
        onGive={(i) => edit(reuseFreedMinutes(plan, i, scheduling))}
      />

      {stale && (
        <div className="card card-quiet small" role="status" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">
            {today !== baseDay
              ? 'This plan was built for a day that has passed. Regenerate it before you start.'
              : 'Your practice data changed while this plan was open. Regenerate it before you start.'}
          </span>
        </div>
      )}

      {refusal && (
        <div className="card card-quiet small" role="alert" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">{refusal}</span>
        </div>
      )}

      <div className="row" style={{ gap: 10 }}>
        {short ? (
          <button className="btn btn-primary btn-lg grow" disabled>
            <PlayIcon /> Start plan
          </button>
        ) : coverage.omitted.length > 0 && plan.segments.length > 0 ? (
          <button className="btn btn-primary btn-lg grow" onClick={() => start(coverage.key)} disabled={stale}>
            <PlayIcon /> Start without {coverage.omitted.length} class item{coverage.omitted.length === 1 ? '' : 's'}
          </button>
        ) : (
          <button className="btn btn-primary btn-lg grow" onClick={() => start()} disabled={plan.segments.length === 0 || stale}>
            <PlayIcon /> Start plan
          </button>
        )}
        <button className="btn btn-lg" onClick={regenerate}>Regenerate</button>
      </div>
      <p className="tiny faint">
        Each block is real practice — start it, close it, and the plan moves on. Reorder, swap or remove anything before you begin; removing leaves its time free unless you give it to the rest.
      </p>
    </div>
  );
}

/**
 * What the next class asked this plan for, against the preview AS IT STANDS:
 * how much of it is seated, what is left out and why (does not fit, or the
 * owner's own remove/swap), what it would need, and what is resting. Silent
 * when there is no class work to report.
 */
function ClassCoverageCard({
  coverage,
  budget,
  onUseMinutes,
}: {
  coverage: ClassCoverage;
  budget: number;
  onUseMinutes: (minutes: number) => void;
}) {
  if (coverage.required.length === 0 && coverage.resting.length === 0) return null;
  const n = coverage.required.length;
  const capacity = coverage.omitted.some((o) => o.why === 'capacity');
  const tooMuch = coverage.minimumMinutes > MAX_BUDGET_MINUTES;
  return (
    <section className={`card stack-sm${coverage.omitted.length > 0 ? ' card-accent' : ' card-quiet'}`} aria-label="Class coverage">
      <div className="small">
        <span dir="ltr">
          For your class on {coverage.date}:{' '}
          {n === 0
            ? 'nothing to seat.'
            : coverage.omitted.length === 0
              ? `all ${n} class item${n === 1 ? ' is' : 's are'} in this plan.`
              : `${coverage.seated.length} of ${n} class items in this plan.`}
        </span>
      </div>
      {coverage.omitted.length > 0 && (
        <ul className="stack-sm" role="list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {coverage.omitted.map((o) => (
            <li key={o.itemId} className="small" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span dir="auto" style={{ fontWeight: 500 }}>{o.title}</span>
              <span className="tiny faint" dir="ltr">
                {o.why === 'capacity'
                  ? `left out — needs ${o.floorMinutes} min and does not fit`
                  : o.why === 'short'
                    ? `needs ${o.floorMinutes} min — too short here to start; swap it back or regenerate`
                    : 'left out — you removed or swapped it'}
              </span>
            </li>
          ))}
        </ul>
      )}
      {capacity && (
        <div className="row tiny" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {tooMuch ? (
            <span dir="ltr">
              All of it needs at least {coverage.minimumMinutes} min — more than one plan holds ({MAX_BUDGET_MINUTES}). Start the part that fits and plan the rest in another session.
            </span>
          ) : (
            <>
              <span dir="ltr">All of it fits in {coverage.minimumMinutes} min (you chose {budget}).</span>
              <button type="button" className="btn btn-sm" style={{ minHeight: 44 }} onClick={() => onUseMinutes(coverage.minimumMinutes)}>
                Use {coverage.minimumMinutes} min
              </button>
            </>
          )}
        </div>
      )}
      {coverage.resting.map((r) => (
        <div key={r.itemId} className="tiny faint">
          <span dir="ltr">
            <span dir="auto">{r.title}</span> is prepared for this class but resting — change its status to plan it.
          </span>
        </div>
      ))}
    </section>
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
  const time = planRunTime(activePlan);
  // A segment refused at Start (required class work now worth more than its slot), for the pointer it was refused at.
  const [short, setShort] = useState<{ pointer: number; floorMinutes: number } | null>(null);

  function begin() {
    const check = beginPlanSegment();
    if (check && !check.ok && check.reason === 'short') return setShort({ pointer: activePlan.pointer, floorMinutes: check.floorMinutes });
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
          {done} of {activePlan.segments.length} done · {time.remaining} min left of {time.planned} planned
          {time.unused > 0 ? ` · ${time.unused} of ${time.available} unused` : ''} · {time.recorded} min recorded
        </p>
      </header>

      {finished ? (
        <div className="card card-accent stack-sm">
          <h2 className="title-md">Session complete</h2>
          <p className="dim">
            {done > 0
              ? 'You worked through the plan. End on that — rest is where it consolidates.'
              : 'Nothing from this plan was practised — every segment was skipped, and nothing was recorded.'}
          </p>
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
                  {seg.status === 'done' && (
                    <span className="tiny" style={{ color: 'var(--tone-good)' }}>
                      done{seg.actualMinutes !== undefined ? ` · ${seg.actualMinutes} min recorded` : ''}
                    </span>
                  )}
                  {seg.status === 'skipped' && <span className="tiny faint">skipped</span>}
                </div>
                <div dir="auto" style={{ textAlign: 'start' }}>
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {isCurrent && (
                    <div className="tiny faint">
                      <span dir="ltr">{seg.reason}</span>
                    </div>
                  )}
                  {isCurrent && short?.pointer === i && (
                    <div className="tiny" role="alert" style={{ color: 'var(--tone-warn)' }}>
                      <span dir="ltr">
                        This class work now needs at least {short.floorMinutes} min, more than this segment's {seg.minutes}. Skip it, or end
                        the plan and build a longer one.
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {isCurrent && (
                <div className="row" style={{ gap: 6, flex: 'none' }}>
                  <button className="btn btn-sm" onClick={begin} aria-label={`Start ${seg.title}`}>
                    <PlayIcon /> Start
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ minHeight: 44 }} onClick={() => skipPlanSegment()} aria-label={`Skip ${seg.title}`}>
                    Skip
                  </button>
                </div>
              )}
              {!isCurrent && seg.status === 'pending' && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 'none', minHeight: 44 }}
                  onClick={() => skipPlanSegment(i)}
                  aria-label={`Skip ${seg.title}`}
                >
                  Skip
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
