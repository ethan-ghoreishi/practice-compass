import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clampSchedulingParams,
  planNextReview,
  proposedCloseMinutes,
  type ReviewAnswer,
  type ReviewPlan,
  RESULT_LABELS,
  REVIEW_TYPE_LABELS,
  suggestStatusAfterBlock,
  ITEM_STATUS_LABELS,
  type BlockResult,
  type ItemStatus,
  type ReviewType,
} from '../domain';
import { sessionElapsedSeconds, useStore } from '../store/useStore';
import { getItem, instrumentName, itemBlocks } from '../store/lookups';
import { Field, OptionPills } from '../components/ui';
import { CheckIcon, PlayIcon } from '../components/icons';
import { reviewSummaryLine } from '../components/format';

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
  const now = useMemo(() => new Date(), []);

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

  const [result, setResult] = useState<BlockResult | null>(null);
  const [duration, setDuration] = useState(proposed.minutes);
  const [observation, setObservation] = useState(active?.note ?? '');
  const [nextAction, setNextAction] = useState('');
  const [bodyNote, setBodyNote] = useState('');
  const [showBodyNote, setShowBodyNote] = useState(false);
  const [comeBack, setComeBack] = useState(true);
  // A CORRECTION to the engine's plan, never a second copy of it. Held as an
  // override so there is still exactly ONE review value on this screen (below).
  const [override, setOverride] = useState<{ dueDate?: string; reviewType?: ReviewType } | null>(null);
  const [showReviewControls, setShowReviewControls] = useState(false);
  const [acceptStatus, setAcceptStatus] = useState(true);
  const [becomeTeacherQ, setBecomeTeacherQ] = useState(false);
  const [teacherQText, setTeacherQText] = useState(item?.teacherQuestion ?? '');

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
  const review = useMemo<ReviewPlan | null>(() => {
    const base = item && result ? planNextReview({ item, result, now, params }) : null;
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
  }, [item, result, now, params, override]);

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

  const statusSuggestion = useMemo(
    () =>
      item && result
        ? suggestStatusAfterBlock({ item, result, last3AllSame: recentSameStreak })
        : { suggestedStatus: undefined, message: undefined },
    [item, result, recentSameStreak],
  );

  function pickResult(r: BlockResult) {
    setResult(r);
    setComeBack(true);
    // A fresh result means a fresh plan: a correction made earlier belonged to
    // the date the PREVIOUS result produced, and carrying it over would pin a
    // date to a judgement it was never made about. The plan itself is derived
    // above from `result` — nothing is computed here.
    setOverride(null);
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

  /**
   * Saving with a result answers the review question; saving WITHOUT one
   * answers nothing about it, so the schedule must not move. Stated in one
   * place rather than emerging from `comeBack && !!review`, and forced to
   * 'unanswered' by the escape hatch even when a result had been picked (and
   * so had already produced a plan) — otherwise that date would leak into a
   * close that deliberately recorded no judgement.
   */
  function handleSave(withoutResult = false) {
    const finalResult: BlockResult = withoutResult ? 'not_logged' : (result ?? 'not_logged');
    const answer: ReviewAnswer = withoutResult || !result ? 'unanswered' : comeBack && review ? 'scheduled' : 'declined';
    const newStatus: ItemStatus | undefined =
      !withoutResult && acceptStatus && statusSuggestion.suggestedStatus ? statusSuggestion.suggestedStatus : undefined;

    closeSession({
      result: finalResult,
      durationMinutes: duration,
      observation: observation.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      bodyNote: bodyNote.trim() || undefined,
      newStatus,
      answer,
      nextReviewDate: answer === 'scheduled' ? review?.dueDate : undefined,
      reviewType: review?.reviewType ?? 'retention',
      teacherQuestion: becomeTeacherQ ? teacherQText.trim() : undefined,
    });
    // If a Session Plan is running, return to it (closeSession advanced it).
    navigate(useStore.getState().activePlan ? '/plan' : '/');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="eyebrow">{instrumentName(db, item.instrumentId)}</div>
        {/* The item's own name leads its group, so a Farsi title and the line
            beneath it read as one block. The English eyebrow stays outside:
            dir="auto" resolves from the first strong character in the subtree. */}
        <div className="stack-sm" dir="auto">
          <h1 className="page-title" style={{ fontSize: '1.45rem' }}>
            {item.title}
          </h1>
          <p className="page-sub">A few seconds to capture what happened.</p>
        </div>
      </header>

      <Field label="How did it go?">
        <div className="options">
          {RESULT_BUTTON_LIST.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option${result === o.value ? ' selected' : ''}`}
              aria-pressed={result === o.value}
              onClick={() => pickResult(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Field>

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
          value={duration}
          onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
          style={{ maxWidth: 120 }}
        />
      </Field>

      {showBodyNote ? (
        <Field label="Body / tension note">
          <input
            className="input"
            placeholder="e.g. right shoulder crept up in the riz"
            value={bodyNote}
            onChange={(e) => setBodyNote(e.target.value)}
            autoFocus
          />
        </Field>
      ) : (
        <button
          className="link small"
          style={{ background: 'none', border: 'none', textAlign: 'left', width: 'fit-content' }}
          onClick={() => setShowBodyNote(true)}
        >
          + Body / tension note
        </button>
      )}

      {statusSuggestion.suggestedStatus && (
        <div className="card card-quiet">
          <div className="row between">
            <div className="small">
              Suggest moving to <strong>{ITEM_STATUS_LABELS[statusSuggestion.suggestedStatus]}</strong>.
            </div>
            <YesNo value={acceptStatus} onChange={setAcceptStatus} yes="Accept" no="Keep" />
          </div>
        </div>
      )}

      {/* The scheduling decision, collapsed to ONE honest line: the date and
          type that will actually be saved, with the controls a tap behind it.
          Same data, same defaults, same required result — less supervision of
          the algorithm while the musician's own words are still fresh. Every
          rendering here reads `review`; nothing computes a date. */}
      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small" style={{ minWidth: 0 }}>{reviewLine}</div>
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
              <YesNo value={comeBack} onChange={setComeBack} />
            </div>
            {comeBack && (
              <>
                <Field label="Next review">
                  <input
                    className="input"
                    type="date"
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
                <Link to="/settings#how-scheduling-works" className="tiny faint" style={{ textDecoration: 'underline' }}>
                  Why this date?
                </Link>
              </>
            )}
          </>
        )}
      </div>

      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small">Make this a teacher question?</div>
          <YesNo value={becomeTeacherQ} onChange={setBecomeTeacherQ} />
        </div>
        {becomeTeacherQ && (
          <textarea
            className="textarea"
            placeholder="What will you ask your teacher?"
            value={teacherQText}
            onChange={(e) => setTeacherQText(e.target.value)}
          />
        )}
      </div>

      <div className="row">
        {/* One of the six results is required — they are already the first
            thing on this screen, so this adds no field, it only makes a choice
            already present a required one. */}
        <button className="btn btn-primary btn-lg grow" onClick={() => handleSave()} disabled={!result}>
          <CheckIcon /> Save block
        </button>
        <button
          className="btn"
          onClick={() => {
            resumeSession();
            navigate('/active');
          }}
        >
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
  yes = 'Yes',
  no = 'No',
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  yes?: string;
  no?: string;
}) {
  return (
    <div className="options" role="group">
      <button type="button" className={`option${value ? ' selected' : ''}`} aria-pressed={value} onClick={() => onChange(true)}>
        {yes}
      </button>
      <button type="button" className={`option${!value ? ' selected' : ''}`} aria-pressed={!value} onClick={() => onChange(false)}>
        {no}
      </button>
    </div>
  );
}
