import { useRef, useState } from 'react';
import {
  captureTargetProblem,
  isUpcomingLesson,
  lessonLabel,
  openQuestionCapture,
  todayISODate,
  type ID,
  type QuestionCapture,
} from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { SaveStatus, useAcknowledgedSaves } from './ui';
import { useDecisionNow } from './useDecisionNow';

/**
 * "Ask teacher" while the clock runs: one short field that appends ONE
 * independent question to the lesson agenda. Who it belongs to is frozen when
 * the field opens (`openQuestionCapture`) — a routine boundary or a change
 * underneath never retargets the words — and "Saved." waits for the device.
 * A failed write keeps the words; Try again writes the SAME question again,
 * never a second one. It touches no clock, note, marker, cue or ranking.
 */
export default function TeacherQuestionCapture({ instrumentId, itemId }: { instrumentId: ID; itemId?: ID }) {
  const db = useStore((s) => s.db);
  const addLessonQuestion = useStore((s) => s.addLessonQuestion);
  const updateLessonQuestion = useStore((s) => s.updateLessonQuestion);
  const persistAgain = useStore((s) => s.persistAgain);
  const [capture, setCapture] = useState<QuestionCapture | null>(null);
  const [text, setText] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const live = useRef('');
  /** The question this capture already appended in memory: a retry writes it, never another. */
  const added = useRef<ID | null>(null);
  const ack = useAcknowledgedSaves();
  const KEY = 'question';
  const now = useDecisionNow();

  const close = () => {
    setCapture(null);
    setText('');
    live.current = '';
    added.current = null;
    ack.reset(KEY);
  };

  const open = () => {
    setLastSaved(null);
    setCapture(openQuestionCapture(db.lessons, instrumentId, itemId, new Date()));
  };

  if (!capture) {
    return (
      <div className="stack-sm" style={{ alignItems: 'center' }}>
        <button type="button" className="link small" onClick={open} style={{ background: 'none', border: 'none' }}>
          + Ask teacher
        </button>
        {lastSaved && (
          <span className="tiny faint" role="status">
            <span dir="ltr">{lastSaved}</span>
          </span>
        )}
      </div>
    );
  }

  // Once appended, the question is the store's to keep consistent (a deleted
  // class or item detaches it there); a retry only writes it again.
  const problem = added.current ? null : captureTargetProblem(db, capture, now);
  const item = capture.itemId ? getItem(db, capture.itemId) : undefined;
  const lesson = capture.lessonId ? db.lessons.find((l) => l.id === capture.lessonId) : undefined;
  const today = todayISODate(now);
  const upcoming = db.lessons
    .filter((l) => l.instrumentId === capture.instrumentId && isUpcomingLesson(l, today))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const trimmed = text.trim();

  const save = () => {
    const words = live.current.trim();
    if (!words || (!added.current && captureTargetProblem(useStore.getState().db, capture, new Date()))) return;
    ack.run(
      KEY,
      words,
      () => {
        if (added.current) {
          // Already in memory from an attempt whose write failed: write THAT
          // question (with any words typed since), never append another.
          updateLessonQuestion(added.current, words);
          persistAgain();
          return null;
        }
        const id = addLessonQuestion({ text: words, ...capture });
        if (!id) return 'Not added — the class or item changed. Choose again.';
        added.current = id;
        return null;
      },
      {
        current: () => live.current.trim(),
        again: save,
        saved: () => {
          setLastSaved(`Question saved on this device${lesson ? ` for ${lessonLabel(lesson)}` : ' — unassigned'}.`);
          close();
        },
      },
    );
  };

  return (
    <form
      className="card card-quiet stack-sm"
      style={{ textAlign: 'start' }}
      aria-label="Ask teacher"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <label className="field-label" htmlFor="pc-ask-teacher">
        Question for your teacher
      </label>
      <input
        id="pc-ask-teacher"
        className="input"
        dir="auto"
        aria-label="Question for your teacher"
        placeholder="What will you ask?"
        value={text}
        autoFocus
        onChange={(e) => {
          live.current = e.target.value;
          setText(e.target.value);
        }}
      />
      <div className="tiny faint">
        {item ? (
          <span dir="ltr">
            About: <span dir="auto">{item.title}</span>
          </span>
        ) : (
          <span dir="ltr">About this instrument — no item.</span>
        )}
      </div>
      <label className="tiny faint" htmlFor="pc-ask-teacher-class">
        Ask at
      </label>
      <select
        id="pc-ask-teacher-class"
        className="input"
        value={capture.lessonId ?? ''}
        disabled={!!added.current}
        onChange={(e) => {
          const lessonId = e.target.value || undefined;
          setCapture((c) => (c ? { instrumentId: c.instrumentId, ...(c.itemId ? { itemId: c.itemId } : {}), ...(lessonId ? { lessonId } : {}) } : c));
        }}
      >
        {lesson && !upcoming.includes(lesson) && <option value={lesson.id}>{lessonLabel(lesson)}</option>}
        {upcoming.map((l) => (
          <option key={l.id} value={l.id}>
            {lessonLabel(l)}
          </option>
        ))}
        <option value="">No class — save it unassigned</option>
      </select>
      {problem && (
        <div className="stack-sm" role="alert" style={{ color: 'var(--tone-warn)' }}>
          {problem.item && (
            <div className="tiny">
              <span dir="ltr">{problem.item}</span>{' '}
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setCapture((c) => (c ? { instrumentId: c.instrumentId, ...(c.lessonId ? { lessonId: c.lessonId } : {}) } : c))}
              >
                Keep it without the item
              </button>
            </div>
          )}
          {problem.lesson && (
            <div className="tiny">
              <span dir="ltr">{problem.lesson}</span>{' '}
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setCapture((c) => (c ? { instrumentId: c.instrumentId, ...(c.itemId ? { itemId: c.itemId } : {}) } : c))}
              >
                Save it unassigned
              </button>
            </div>
          )}
        </div>
      )}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button type="submit" className="btn btn-sm" disabled={!trimmed || !!problem}>
          Save question
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={close}>
          {added.current ? 'Close' : 'Cancel'}
        </button>
        <SaveStatus ack={ack.states[KEY]} current={trimmed} onRetry={save} />
      </div>
    </form>
  );
}
