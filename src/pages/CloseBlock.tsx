import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clampSchedulingParams,
  defaultTargetLesson,
  isStableResult,
  lessonLabel,
  nextPractice,
  nowISO,
  planNextReview,
  preparationDatesByItem,
  returnIntentOf,
  proposedCloseMinutes,
  todayISODate,
  type ReviewAnswer,
  type ReviewPlan,
  RESULT_DESCRIPTIONS,
  RESULT_LABELS,
  REVIEW_TYPE_LABELS,
  suggestStatusAfterBlock,
  FOCUS_LABELS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  RATING_LABELS,
  type BlockResult,
  type CloseItemEdits,
  type EvidenceScope,
  type ReturnIntent,
  type FocusArea,
  type ItemStatus,
  type Rating,
  type ReviewType,
} from '../domain';
import { sessionElapsedSeconds, useStore } from '../store/useStore';
import { getItem, instrumentName, itemBlocks } from '../store/lookups';
import { Field, OptionPills, RatingInput } from '../components/ui';
import { CheckIcon, PlayIcon } from '../components/icons';
import { closeOverrideDate, relativeDay, reviewOverrideSurvivesResultChange, reviewSummaryLine } from '../components/format';
import { useDecisionNow } from '../components/useDecisionNow';
import { closeDraftFor, closeDraftKey, dropCloseDraft, holdCloseDraft } from '../components/closeDraft';
import SchedulingExplanation from '../components/SchedulingExplanation';
import TeacherQuestionCapture from '../components/TeacherQuestionCapture';

const SCOPE_OPTIONS: { value: EvidenceScope; label: string }[] = [
  { value: 'focused', label: 'Focused work — a part or one aspect' },
  { value: 'whole', label: 'Whole-item check' },
];

const INTENT_OPTIONS: { value: ReturnIntent; label: string }[] = [
  { value: 'working', label: 'Working on this' },
  { value: 'keep_fresh', label: 'Keep fresh' },
];

const RESULT_BUTTON_LIST: { value: BlockResult; label: string }[] = [
  { value: 'worse', label: RESULT_LABELS.worse },
  { value: 'same', label: RESULT_LABELS.same },
  { value: 'slightly_better', label: RESULT_LABELS.slightly_better },
  { value: 'stable_alone', label: RESULT_LABELS.stable_alone },
  { value: 'stable_in_context', label: RESULT_LABELS.stable_in_context },
  { value: 'performable', label: RESULT_LABELS.performable },
];

export default function CloseBlock() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const closeSession = useStore((s) => s.closeSession);
  const cancelSession = useStore((s) => s.cancelSession);
  const resumeSession = useStore((s) => s.resumeSession);
  const navigate = useNavigate();
  // The DAY this decision is made in, refreshed at a local-day boundary or
  // when the page comes back into view. A close screen left open across
  // midnight must not write a date derived from yesterday — and the draft in
  // the fields above survives the refresh, because only `now` changes.
  //
  // `useDecisionNow` polls at most every 30 seconds (plus visibility/focus),
  // so it can lag the true instant by up to that long. `nowOverride` closes
  // that gap at the one moment it actually matters — Save — without needing
  // the shared hook to expose a manual refresh: `handleSave` sets it the
  // instant it finds the real local day has moved past what `now` reflects,
  // forcing an immediate re-render with the CORRECTED decision instead of
  // silently saving one that no longer matches what is on screen.
  const [nowOverride, setNowOverride] = useState<Date | null>(null);
  const decisionNow = useDecisionNow();
  const now = nowOverride ?? decisionNow;

  const item = active ? getItem(db, active.itemId) : undefined;
  // The clock was paused on Finish, so the elapsed figure is frozen —
  // reflection time is not silently counted. An ABANDONED clock proposes the
  // block's own target instead of the wall-clock gap, so a timer left running
  // overnight can never quietly write eight hours of practice that did not
  // happen; ordinary overtime still proposes the real elapsed time. Either way
  // it is a proposal in an editable field — the owner's correction always wins.
  const proposed = active
    ? proposedCloseMinutes(sessionElapsedSeconds(active), active.targetMinutes)
    : { minutes: 10, stale: false };

  // What the owner left here when they went Back to practise more — THIS
  // block's inputs only (closeDraft.ts), never a derived decision: the review
  // line, the suggestion and an untouched minutes proposal are worked out
  // again from now.
  const draftKey = active ? closeDraftKey(active) : '';
  const [restored] = useState(() => (draftKey ? closeDraftFor(draftKey) : null));

  const [result, setResult] = useState<BlockResult | null>(restored?.result ?? null);
  // What this block's result is ABOUT. Focused unless the owner says it was a
  // check of the whole item — never inferred from a result, mode or title.
  const [scope, setScope] = useState<EvidenceScope>(restored?.scope ?? 'focused');
  // Working on this / Keep fresh as this close leaves the item: only ever the
  // owner's explicit choice, never a pre-selected promotion.
  const [intentPick, setIntentPick] = useState<ReturnIntent | null>(restored?.intentPick ?? null);
  // Only a figure the owner typed is kept; otherwise the live proposal shows.
  const [correctedMinutes, setCorrectedMinutes] = useState<number | null>(restored?.correctedMinutes ?? null);
  const duration = correctedMinutes ?? proposed.minutes;
  // A held draft's observation is the block's observation: Active edited it
  // in place while practising more (closeDraft.ts), so nothing here chooses.
  const [observation, setObservation] = useState(restored ? restored.observation : (active?.note ?? ''));
  const [nextAction, setNextAction] = useState(restored?.nextAction ?? '');
  const [comeBack, setComeBack] = useState(restored?.comeBack ?? true);
  // A CORRECTION to the engine's plan, never a second copy of it. Held as an
  // override so there is still exactly ONE review value on this screen (below).
  const [override, setOverride] = useState<{ dueDate?: string; reviewType?: ReviewType } | null>(restored?.override ?? null);
  const [showReviewControls, setShowReviewControls] = useState(false);
  // The item as this practice left it: Status, Primary focus and Current
  // effort, each `null` while untouched — an untouched field is never written.
  // Focus '' is a deliberate None.
  const [statusPick, setStatusPick] = useState<ItemStatus | null>(restored?.statusPick ?? null);
  const [focusPick, setFocusPick] = useState<FocusArea | '' | null>(restored?.focusPick ?? null);
  const [effortPick, setEffortPick] = useState<Rating | null>(restored?.effortPick ?? null);
  const [showItemControls, setShowItemControls] = useState(false);
  const [becomeTeacherQ, setBecomeTeacherQ] = useState(restored?.becomeTeacherQ ?? false);
  // A NEW question every time: it becomes its own agenda entry rather than
  // overwriting whatever the item already carried, and raising one never
  // commits the item to a class.
  const [teacherQText, setTeacherQText] = useState(restored?.teacherQText ?? '');

  // Recent results including the (pending) one, for the "three same" check.
  const recentSameStreak = useMemo(() => {
    if (!item) return false;
    const prior = itemBlocks(db, item.id)
      .filter((b) => b.result !== 'not_logged')
      .map((b) => b.result);
    const combined = result ? [result, ...prior] : prior;
    return combined.length >= 3 && combined.slice(0, 3).every((r) => r === 'same');
  }, [db, item, result]);

  // Use the same scheduling knobs the store will persist with, so the date
  // previewed here is exactly the date that gets saved.
  const params = useMemo(() => clampSchedulingParams(db.settings), [db.settings]);

  // A question raised here defaults to the nearest upcoming class on this
  // instrument, named in the caption below so the target is never a guess the
  // owner cannot see. With no upcoming class it is saved unassigned rather
  // than pointed at one that does not exist.
  const questionLesson = useMemo(
    () => (item ? defaultTargetLesson(db.lessons, item.instrumentId, now) : undefined),
    [db.lessons, item, now],
  );

  /**
   * THE review decision on this screen — one value, derived once.
   *
   * The engine's plan for the chosen result, with any correction the owner made
   * folded INTO it. The collapsed line, the date field behind the disclosure and
   * the date handed to `closeSession` are three renderings of THIS object, so
   * "the date shown before saving is exactly the date saved" holds by
   * construction: a divergent date is unrepresentable, not merely remembered
   * about. A second `planNextReview` call anywhere in this file — there used to
   * be one, seeding the field from a different invocation than the preview —
   * would reintroduce exactly the drift r-explainable-scheduling forbids.
   */
  const intent: ReturnIntent | null = item ? (intentPick ?? returnIntentOf(item)) : null;
  const review = useMemo<ReviewPlan | null>(() => {
    const base = item && result && intent ? planNextReview({ item, result, now, params, scope, intent }) : null;
    if (!override) return base;
    // `undefined` means NOT OVERRIDDEN (use the engine's date); `''` means the
    // owner CLEARED the field — a deliberate "schedule nothing", which
    // `handleSave` reads as a genuine decline exactly as it did before this
    // screen was restructured. `??` would collapse those two into one and make
    // the field un-clearable: it would snap back to the engine's date.
    const dueDate = override.dueDate !== undefined ? override.dueDate : (base?.dueDate ?? '');
    // No date is NO PLAN — whether because the item is on manual dates and none
    // has been picked, or because the owner just cleared it. Returning the
    // engine's plan here would schedule a date they had deleted.
    if (!dueDate) return null;
    return {
      intervalDays: base?.intervalDays ?? 0,
      changeStrategy: base?.changeStrategy ?? false,
      dueDate,
      reviewType: override.reviewType ?? base?.reviewType ?? 'retention',
      // The rationale explains the DATE. Once the owner sets their own, quoting
      // the engine's reason would explain a number it did not choose.
      rationale: base && dueDate === base.dueDate ? base.rationale : 'The date you chose.',
    };
  }, [item, result, now, params, override, scope, intent]);

  /**
   * The one line the screen shows for that decision. Every branch is honest
   * about what will be SAVED: the plan when there is one, the deliberate "no"
   * when the owner declined, and plainly nothing when no result has been picked
   * — never a date the close is not actually going to write.
   */
  const reviewLine = !result
    ? 'Pick how it went and the next review appears here.'
    : !comeBack
      ? 'Not coming back — no review will be scheduled.'
      : review
        ? reviewSummaryLine(review, now)
        : 'No date set — nothing will be scheduled.';

  /**
   * NEXT PRACTICE — the ONE scheduling line. Derived from the item exactly as
   * this close will leave it (the date `review` will stand on, the practice
   * just done, the intention chosen) by the same `nextPractice` the item page
   * shows, so a class opportunity or a short Working return reads here as
   * what it is, beside the review date it does not overwrite.
   */
  const preparationDate = useMemo(
    () => (item ? preparationDatesByItem(db.lessonAgenda, db.lessons, now).get(item.id) : undefined),
    [db.lessonAgenda, db.lessons, item, now],
  );
  const next = useMemo(() => {
    if (!item || !intent) return null;
    const standing = !result ? item.nextReviewDate : !comeBack ? undefined : review?.dueDate;
    const source = override?.dueDate && standing === override.dueDate ? ('user' as const) : standing !== item.nextReviewDate ? ('auto' as const) : item.nextReviewSource;
    return nextPractice({
      item: { ...item, nextReviewDate: standing, nextReviewSource: source, lastPractisedAt: nowISO(now), returnIntent: intent },
      preparationDate,
      now,
    });
  }, [item, intent, result, comeBack, review, override, preparationDate, now]);
  const scheduleLine =
    !result || !next || (next.kind !== 'class' && next.date === review?.dueDate)
      ? reviewLine
      : `${next.date ? `Next practice ${relativeDay(next.date, now)} · ` : ''}${next.sentence}${next.keptNote ? ` ${next.keptNote}` : ''}`;

  const statusSuggestion = useMemo(
    () =>
      item && result
        ? suggestStatusAfterBlock({ item, result, last3AllSame: recentSameStreak, scope })
        : { suggestedStatus: undefined, message: undefined },
    [item, result, recentSameStreak, scope],
  );

  function pickResult(r: BlockResult) {
    setResult(r);
    setComeBack(true);
    // A fresh result means a fresh plan: a correction made earlier belonged to
    // the date the PREVIOUS result produced, and carrying it over would pin a
    // date to a judgement it was never made about. The plan itself is derived
    // above from `result` — nothing is computed here. But a manual-mode item
    // has no automatic plan for ANY result (computeReview returns null
    // unconditionally in manual mode) — the owner's typed-in date isn't tied
    // to a judgement at all, so it must survive switching results.
    if (item && intent && !reviewOverrideSurvivesResultChange(item, now, params, { scope, intent })) setOverride(null);
  }

  function pickScope(next: EvidenceScope) {
    setScope(next);
    // A different scope can mean a different decision — the same rule as a
    // different result.
    if (item && intent && !reviewOverrideSurvivesResultChange(item, now, params, { scope: next, intent })) setOverride(null);
  }

  if (!active || !item) {
    return (
      <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
        <h1 className="page-title">Nothing to close</h1>
        <Link to="/" className="btn btn-primary">
          Back to Today
        </Link>
      </div>
    );
  }

  // What the line shows: the owner's pick, else the item as it stands. A
  // suggestion is offered beside it, never pre-selected.
  const shownStatus: ItemStatus = statusPick ?? item.status;
  const shownIntent: ReturnIntent = intentPick ?? returnIntentOf(item);
  const offerKeepFresh = scope === 'whole' && !!result && isStableResult(result) && shownIntent === 'working';
  const shownFocus: FocusArea | '' = focusPick ?? item.primaryFocus ?? '';
  const shownEffort: Rating = effortPick ?? item.difficulty;
  const itemLine = [
    `Status ${shownStatus === item.status ? ITEM_STATUS_LABELS[item.status] : `${ITEM_STATUS_LABELS[item.status]} → ${ITEM_STATUS_LABELS[shownStatus]}`}`,
    `Focus ${shownFocus ? FOCUS_LABELS[shownFocus] : 'none'}`,
    `Effort ${shownEffort} of 5`,
    INTENT_OPTIONS.find((o) => o.value === shownIntent)!.label,
  ].join(' · ');

  /**
   * Saving with a result answers the review question; saving WITHOUT one
   * answers nothing about it, so the schedule must not move. Stated in one
   * place rather than emerging from `comeBack && !!review`, and forced to
   * 'unanswered' by the escape hatch even when a result had been picked (and
   * so had already produced a plan) — otherwise that date would leak into a
   * close that deliberately recorded no judgement.
   */
  function handleSave(withoutResult = false) {
    // The local day may have rolled since `now` (and therefore `review`) was
    // last computed — `useDecisionNow` only checks every 30 seconds, plus
    // visibility/focus. Catch that HERE, at the one instant it can actually
    // change what gets saved, rather than letting `closeSession` silently
    // recompute a different day's decision than the one just shown. Refresh
    // and stop: the draft above is untouched, so Save simply works once the
    // corrected line is on screen.
    const trueNow = new Date();
    if (todayISODate(trueNow) !== todayISODate(now)) {
      setNowOverride(trueNow);
      return;
    }

    const finalResult: BlockResult = withoutResult ? 'not_logged' : (result ?? 'not_logged');
    const answer: ReviewAnswer = withoutResult || !result ? 'unanswered' : comeBack && review ? 'scheduled' : 'declined';
    // Only what the owner touched; the engine's suggestion travels separately
    // and the store applies it only with a result.
    const itemEdits: CloseItemEdits = {};
    if (statusPick !== null) itemEdits.status = statusPick;
    if (focusPick !== null) itemEdits.primaryFocus = focusPick === '' ? null : focusPick;
    if (effortPick !== null) itemEdits.difficulty = effortPick;
    if (intentPick !== null) itemEdits.returnIntent = intentPick;

    closeSession({
      result: finalResult,
      scope,
      durationMinutes: duration,
      observation: observation.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      itemEdits,
      answer,
      // ONLY a date the owner actually typed — never the date the screen is
      // merely SHOWING, which for an early session is the item's existing one.
      nextReviewDate: closeOverrideDate(answer, override),
      // The SAME `now` `review` was just computed with — never a fresh
      // `new Date()` inside the store, which is exactly what could disagree
      // with what this screen showed.
      now,
      reviewType: review?.reviewType ?? 'retention',
      newQuestion:
        becomeTeacherQ && teacherQText.trim()
          ? { text: teacherQText.trim(), lessonId: questionLesson?.id }
          : undefined,
    });
    dropCloseDraft(draftKey);
    // If a Session Plan is running, return to it (closeSession advanced it).
    navigate(useStore.getState().activePlan ? '/plan' : '/');
  }

  /** Back to practising THIS block: what is typed here waits for its Finish. */
  function practiseMore() {
    holdCloseDraft({
      key: draftKey,
      result,
      observation,
      nextAction,
      correctedMinutes,
      comeBack,
      override,
      statusPick,
      focusPick,
      effortPick,
      becomeTeacherQ,
      teacherQText,
      scope,
      intentPick,
    });
    resumeSession();
    navigate('/active');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        {/* The eyebrow renders the INSTRUMENT'S OWN editable name, never fixed
            English copy — its own dir="auto" rather than bare. */}
        <div className="eyebrow" dir="auto">{instrumentName(db, item.instrumentId)}</div>
        {/* The item's own name leads its group, so a Farsi title and the line
            beneath it read as one block. The eyebrow stays its own group,
            outside this one: dir="auto" resolves from the first strong
            character in a subtree, so folding the eyebrow in would let the
            instrument's script decide the item title's own direction.
            "A few seconds…" is fixed English page copy, never user text — its
            own dir="ltr" isolate keeps its bidi base fixed regardless of the
            title's, so a Farsi title's RTL base can't drag its trailing full
            stop to the visual start. */}
        <div className="stack-sm" dir="auto" style={{ textAlign: 'start' }}>
          <h1 className="page-title" style={{ fontSize: '1.45rem' }}>
            {item.title}
          </h1>
          <p className="page-sub">
            <span dir="ltr">A few seconds to capture what happened.</span>
          </p>
        </div>
      </header>

      {/* What the result is ABOUT. Focused is the default: a good chunk is
          progress on that chunk, never readiness of the whole item. */}
      <Field label="What did this block cover?">
        <OptionPills ariaLabel="What this block covered" value={scope} onChange={pickScope} options={SCOPE_OPTIONS} />
      </Field>

      {/* The most concrete thing you actually demonstrated. Each option says
          what it CLAIMS, so "same" is never mistaken for failed recall and a
          stability claim always names its scope. */}
      <Field label="What did this block actually show?">
        <div className="options">
          {RESULT_BUTTON_LIST.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option${result === o.value ? ' selected' : ''}`}
              aria-pressed={result === o.value}
              // The NAME stays the label; the sentence is a DESCRIPTION, so it
              // is announced after it rather than becoming part of it.
              aria-describedby={`pc-result-desc-${o.value}`}
              title={RESULT_DESCRIPTIONS[o.value]}
              onClick={() => pickResult(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        {RESULT_BUTTON_LIST.map((o) => (
          <span key={o.value} id={`pc-result-desc-${o.value}`} className="sr-only">
            {RESULT_DESCRIPTIONS[o.value]}
          </span>
        ))}
      </Field>
      {result && (
        <p className="tiny faint" style={{ marginTop: -8 }}>
          <span dir="ltr">{RESULT_DESCRIPTIONS[result]}</span>
        </p>
      )}

      {statusSuggestion.suggestedStatus && statusPick === null && (
        <div className="card card-quiet small row between" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span dir="ltr">{statusSuggestion.message}</span>
          <button type="button" className="btn btn-sm" onClick={() => setStatusPick(statusSuggestion.suggestedStatus!)}>
            Mark it {ITEM_STATUS_LABELS[statusSuggestion.suggestedStatus]}
          </button>
        </div>
      )}
      {offerKeepFresh && intentPick === null && (
        <div className="card card-quiet small row between" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span dir="ltr">It held up as a whole. Ready to keep it fresh with spaced checks?</span>
          <button type="button" className="btn btn-sm" onClick={() => setIntentPick('keep_fresh')}>
            Keep it fresh
          </button>
        </div>
      )}

      {recentSameStreak && (
        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
          Three “same” results in a row — try a different strategy or bring it to your teacher.
        </div>
      )}

      <Field label="One observation">
        <textarea
          className="textarea"
          placeholder="What did you notice?"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </Field>

      <Field label="Next action">
        <input
          className="input"
          placeholder="The one thing to try next time"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
        />
      </Field>

      <Field
        label="Minutes practised"
        hint={
          proposed.stale
            ? `The clock ran far past its ${active.targetMinutes}-minute target, so that target is proposed rather than the whole gap — change it to what you actually played.`
            : undefined
        }
      >
        <input
          className="input"
          type="number"
          min={1}
          aria-label="Minutes practised"
          value={duration}
          onChange={(e) => setCorrectedMinutes(Math.max(1, Number(e.target.value) || 1))}
          style={{ maxWidth: 120 }}
        />
      </Field>

      {/* The item as this practice left it — Status, Primary focus and
          Current effort — collapsed to ONE line with the controls a tap
          behind it. An engine-suggested status is the pending change,
          pre-selected; tapping the current status keeps it. Personal
          priority is a planning decision and stays on the item page. */}
      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small" style={{ minWidth: 0 }}>
            {itemLine}
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ flex: 'none' }}
            aria-expanded={showItemControls}
            aria-label={showItemControls ? 'Done with status, focus, effort and return' : 'Change status, focus, effort and return'}
            onClick={() => setShowItemControls((o) => !o)}
          >
            {showItemControls ? 'Done' : 'Change'}
          </button>
        </div>
        {showItemControls && (
          <>
            <Field label="Status">
              <OptionPills
                ariaLabel="Status after this block"
                value={shownStatus}
                onChange={setStatusPick}
                options={ITEM_STATUS_ORDER.map((v) => ({ value: v, label: ITEM_STATUS_LABELS[v] }))}
              />
            </Field>
            <Field label="Primary focus">
              <select
                className="select"
                aria-label="Primary focus"
                value={shownFocus}
                onChange={(e) => setFocusPick(e.target.value as FocusArea | '')}
              >
                <option value="">None</option>
                {(Object.keys(FOCUS_LABELS) as FocusArea[]).map((f) => (
                  <option key={f} value={f}>
                    {FOCUS_LABELS[f]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={RATING_LABELS.difficulty}>
              <RatingInput name={RATING_LABELS.difficulty} value={shownEffort} onChange={setEffortPick} />
            </Field>
            <Field label="Comes back as">
              <OptionPills ariaLabel="Comes back as" value={shownIntent} onChange={setIntentPick} options={INTENT_OPTIONS} />
            </Field>
          </>
        )}
      </div>

      {/* The scheduling decision, collapsed to ONE honest line: the date and
          type that will actually be saved, with the controls a tap behind it.
          Same data, same defaults, same required result — less supervision of
          the algorithm while the musician's own words are still fresh. Every
          rendering here reads `review`; nothing computes a date. */}
      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small" style={{ minWidth: 0 }}>
            <span dir="ltr">{scheduleLine}</span>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ flex: 'none' }}
            aria-expanded={showReviewControls}
            onClick={() => setShowReviewControls((o) => !o)}
          >
            {showReviewControls ? 'Done' : 'Change'}
          </button>
        </div>
        {showReviewControls && (
          <>
            <div className="row between">
              <div className="small">Should this come back?</div>
              <YesNo label="Should this come back?" value={comeBack} onChange={setComeBack} />
            </div>
            {scheduleLine !== reviewLine && <div className="tiny faint"><span dir="ltr">{reviewLine}</span></div>}
            {comeBack && (
              <>
                <Field label="Next review">
                  <input
                    className="input"
                    type="date"
                    aria-label="Next review date"
                    value={review?.dueDate ?? ''}
                    onChange={(e) => setOverride((o) => ({ ...o, dueDate: e.target.value }))}
                  />
                </Field>
                <Field label="Review type">
                  <OptionPills
                    ariaLabel="Review type"
                    value={review?.reviewType ?? override?.reviewType ?? 'retention'}
                    onChange={(v) => setOverride((o) => ({ ...o, reviewType: v }))}
                    options={(Object.keys(REVIEW_TYPE_LABELS) as ReviewType[]).map((v) => ({
                      value: v,
                      label: REVIEW_TYPE_LABELS[v],
                    }))}
                  />
                </Field>
                {/* Explained in place: leaving would lose everything typed above. */}
                <details className="disclosure">
                  <summary className="small">Why this date?</summary>
                  <SchedulingExplanation />
                </details>
              </>
            )}
          </>
        )}
      </div>

      {/* A question still open from the practice itself: its own lifecycle,
          independent of the one below. */}
      <TeacherQuestionCapture recover session={active?.startedAt} />

      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small">Make this a teacher question?</div>
          <YesNo label="Make this a teacher question?" value={becomeTeacherQ} onChange={setBecomeTeacherQ} />
        </div>
        {becomeTeacherQ && (
          <>
            <textarea
              className="textarea"
              placeholder="What will you ask your teacher?"
              aria-label="Question for your teacher"
              value={teacherQText}
              onChange={(e) => setTeacherQText(e.target.value)}
            />
            <p className="tiny faint">
              <span dir="ltr">
                {questionLesson
                  ? `It will be asked at ${lessonLabel(questionLesson)}. It does not commit this item to that class.`
                  : 'There is no upcoming class yet, so it will be saved unassigned.'}
              </span>
            </p>
          </>
        )}
      </div>

      <div className="row">
        {/* One of the six results is required — they are already the first
            thing on this screen, so this adds no field, it only makes a choice
            already present a required one. */}
        <button className="btn btn-primary btn-lg grow" onClick={() => handleSave()} disabled={!result}>
          <CheckIcon /> Save block
        </button>
        <button className="btn" onClick={practiseMore}>
          <PlayIcon /> Back
        </button>
      </div>
      {!result && <p className="tiny faint">Pick how it went above to save, or save the minutes on their own.</p>}
      {/* The escape hatch keeps "no result" reachable and DELIBERATE rather
          than accidental. It records the time and leaves the schedule exactly
          as it was — the review date and any open review row both stand. */}
      <button className="btn btn-sm" onClick={() => handleSave(true)}>
        Save without a result
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          dropCloseDraft(draftKey);
          cancelSession();
          navigate(useStore.getState().activePlan ? '/plan' : '/');
        }}
      >
        Discard without saving
      </button>
    </div>
  );
}

function YesNo({
  value,
  onChange,
  label,
  yes = 'Yes',
  no = 'No',
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  /** What this yes/no is ABOUT — three of them sit on this one screen. */
  label: string;
  yes?: string;
  no?: string;
}) {
  return (
    <div className="options" role="group" aria-label={label}>
      <button type="button" className={`option${value ? ' selected' : ''}`} aria-pressed={value} onClick={() => onChange(true)}>
        {yes}
      </button>
      <button type="button" className={`option${!value ? ' selected' : ''}`} aria-pressed={!value} onClick={() => onChange(false)}>
        {no}
      </button>
    </div>
  );
}
