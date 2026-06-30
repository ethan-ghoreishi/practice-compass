import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  RESULT_LABELS,
  REVIEW_TYPE_LABELS,
  suggestReview,
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
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);

  const item = active ? getItem(db, active.itemId) : undefined;
  const defaultMinutes = active ? Math.max(1, Math.round(sessionElapsedSeconds(active) / 60)) : 10;

  const [result, setResult] = useState<BlockResult | null>(null);
  const [duration, setDuration] = useState(defaultMinutes);
  const [observation, setObservation] = useState(active?.note ?? '');
  const [nextAction, setNextAction] = useState('');
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

  const reviewSuggestion = useMemo(
    () => (result ? suggestReview({ result, mode: active?.mode, status: item?.status, now }) : null),
    [result, active?.mode, item?.status, now],
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
    const s = suggestReview({ result: r, mode: active?.mode, status: item?.status, now });
    if (s) {
      setComeBack(true);
      setReviewDate(s.dueDate);
      setReviewType(s.reviewType);
    } else {
      setComeBack(false);
    }
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

  function handleSave() {
    const finalResult: BlockResult = result ?? 'not_logged';
    const newStatus: ItemStatus | undefined =
      acceptStatus && statusSuggestion.suggestedStatus ? statusSuggestion.suggestedStatus : undefined;

    closeSession({
      result: finalResult,
      durationMinutes: duration,
      observation: observation.trim() || undefined,
      nextAction: nextAction.trim() || undefined,
      newStatus,
      scheduleReview: comeBack && !!reviewDate,
      nextReviewDate: reviewDate || undefined,
      reviewType,
      teacherQuestion: becomeTeacherQ ? teacherQText.trim() : undefined,
    });
    navigate('/');
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

      <Field label="Minutes practised">
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
            <Field label="Next review" hint={reviewSuggestion ? `Suggested ${relativeDay(reviewSuggestion.dueDate, now)}` : undefined}>
              <input className="input" type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
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
        <button className="btn btn-primary btn-lg grow" onClick={handleSave}>
          <CheckIcon /> Save block
        </button>
        <button className="btn" onClick={() => navigate('/active')}>
          <PlayIcon /> Back
        </button>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          cancelSession();
          navigate('/');
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
    <div className="options">
      <button type="button" className={`option${value ? ' selected' : ''}`} onClick={() => onChange(true)}>
        {yes}
      </button>
      <button type="button" className={`option${!value ? ' selected' : ''}`} onClick={() => onChange(false)}>
        {no}
      </button>
    </div>
  );
}
