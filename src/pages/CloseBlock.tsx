import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clampSchedulingParams,
  planNextReview,
  proposedCloseMinutes,
  type ReviewAnswer,
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
import { relativeDay } from '../components/format';

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
  const [reviewDate, setReviewDate] = useState('');
  const [reviewType, setReviewType] = useState<ReviewType>('retention');
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

  const reviewSuggestion = useMemo(
    () => (item && result ? planNextReview({ item, result, now, params }) : null),
    [item, result, now, params],
  );

  const statusSuggestion = useMemo(
    () =>
      item && result
        ? suggestStatusAfterBlock({ item, result, last3AllSame: recentSameStreak })
        : { suggestedStatus: undefined, message: undefined },
    [item, result, recentSameStreak],
  );

  function pickResult(r: BlockResult) {
    setResult(r);
    if (!item) return;
    const s = planNextReview({ item, result: r, now, params });
    setComeBack(true);
    if (s) {
      setReviewDate(s.dueDate);
      setReviewType(s.reviewType);
    }
    // Manual mode (s === null): keep the date the user chooses.
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
   * place rather than emerging from `comeBack && !!reviewDate`, and forced to
   * 'unanswered' by the escape hatch even when a result had been picked (and
   * so had already filled in a date) — otherwise that date would leak into a
   * close that deliberately recorded no judgement.
   */
  function handleSave(withoutResult = false) {
    const finalResult: BlockResult = withoutResult ? 'not_logged' : (result ?? 'not_logged');
    const answer: ReviewAnswer = withoutResult || !result ? 'unanswered' : comeBack && reviewDate ? 'scheduled' : 'declined';
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
      nextReviewDate: answer === 'scheduled' ? reviewDate : undefined,
      reviewType,
      teacherQuestion: becomeTeacherQ ? teacherQText.trim() : undefined,
    });
    // If a Session Plan is running, return to it (closeSession advanced it).
    navigate(useStore.getState().activePlan ? '/plan' : '/');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="eyebrow">{instrumentName(db, item.instrumentId)}</div>
        <h1 className="page-title" style={{ fontSize: '1.45rem' }}>
          {item.title}
        </h1>
        <p className="page-sub">A few seconds to capture what happened.</p>
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

      <Field
        label="Minutes practised"
        hint={
          proposed.stale
            ? `This block's clock ran far longer than its ${active.targetMinutes}-minute target, so we've proposed the target rather than the whole gap. Change it to whatever you actually played.`
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

      <div className="card card-quiet stack-sm">
        <div className="row between">
          <div className="small">Should this come back?</div>
          <YesNo value={comeBack} onChange={setComeBack} />
        </div>
        {comeBack && (
          <div className="grid-2">
            <Field
              label="Next review"
              hint={reviewSuggestion ? `${relativeDay(reviewSuggestion.dueDate, now)} · ${reviewSuggestion.rationale}` : 'Set a date yourself.'}
            >
              <input className="input" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
              {reviewSuggestion && (
                <Link to="/settings#how-scheduling-works" className="tiny faint" style={{ textDecoration: 'underline' }}>
                  Why this date?
                </Link>
              )}
            </Field>
            <Field label="Review type">
              <OptionPills
                ariaLabel="Review type"
                value={reviewType}
                onChange={setReviewType}
                options={(Object.keys(REVIEW_TYPE_LABELS) as ReviewType[]).map((v) => ({
                  value: v,
                  label: REVIEW_TYPE_LABELS[v],
                }))}
              />
            </Field>
          </div>
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
