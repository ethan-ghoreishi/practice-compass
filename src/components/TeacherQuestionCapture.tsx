import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { captureTargetProblem, isUpcomingLesson, lessonLabel, todayISODate, type ID, type LessonQuestion } from '../domain';
import {
  chooseLiveQuestionLesson,
  closeLiveQuestion,
  dropLiveQuestionItem,
  editLiveQuestion,
  flushLiveQuestion,
  focusLiveQuestion,
  liveQuestionEntry,
  liveQuestionSettled,
  openLiveQuestion,
  saveLiveQuestion,
  saveLiveQuestionAsNew,
  useLiveQuestion,
  useStore,
} from '../store/useStore';
import { getItem } from '../store/lookups';
import { useDecisionNow } from './useDecisionNow';

/**
 * "Ask teacher" while the clock runs: one short field whose words become ONE
 * independent agenda question, written on their own after a quiet pause —
 * no Save to remember (`saveLiveQuestion` and its lifecycle in the store).
 * Who it belongs to is frozen when the field opens; a routine boundary, the
 * run completing, navigation or a change underneath never retargets the
 * words, and "Saved" waits for the device. The words live in the store, not
 * here, so a remount or another screen never loses them: `session` is the
 * practice this screen shows (its clock's start) — a capture opened in it
 * stays open here; one from elsewhere shows only while words are still
 * unsaved. `recover` screens (Routine complete, Close, Today) never open a
 * new one. It touches no clock, note, marker, cue or ranking.
 */
export default function TeacherQuestionCapture({
  instrumentId,
  itemId,
  session,
  recover = false,
}: {
  instrumentId?: ID;
  itemId?: ID;
  session?: string;
  recover?: boolean;
}) {
  const capture = useLiveQuestion((s) => s.capture);
  const note = useLiveQuestion((s) => s.note);
  const shown = capture && ((session !== undefined && capture.session === session) || !liveQuestionSettled(capture)) ? capture : null;

  if (!shown) {
    if (recover || !instrumentId || session === undefined) return null;
    return (
      <div className="stack-sm" style={{ alignItems: 'center' }}>
        <button
          type="button"
          className="link small"
          onClick={() => openLiveQuestion(instrumentId, itemId, session)}
          style={{ background: 'none', border: 'none' }}
        >
          + Ask teacher
        </button>
        {note && (
          <span className="tiny faint" role="status">
            <span dir="ltr">{note}</span>
          </span>
        )}
      </div>
    );
  }
  return <QuestionEditor />;
}

function QuestionEditor() {
  const capture = useLiveQuestion((s) => s.capture)!;
  const db = useStore((s) => s.db);
  const now = useDecisionNow();
  const input = useRef<HTMLInputElement>(null);
  const leaving = useRef(false);

  // Leaving the editor writes what is still waiting for its pause, and
  // remembers whether the field held focus so a remount (Routine complete)
  // gives it back. Layout cleanup: the field is still in the document here.
  useLayoutEffect(() => {
    leaving.current = false;
    const field = input.current;
    return () => {
      leaving.current = true;
      if (field && document.activeElement === field) focusLiveQuestion(true);
      flushLiveQuestion();
    };
  }, []);

  // Once written, the question is the agenda's: its class (a deleted class
  // detaches it there) and its item are read from the entry itself.
  const entry = liveQuestionEntry(capture, db.lessonAgenda) as LessonQuestion | undefined;
  const gone = !!capture.questionId && !entry;
  const problem = capture.questionId ? null : captureTargetProblem(db, capture.owner, now);
  const lessonId = capture.questionId ? entry?.lessonId : capture.owner.lessonId;
  const aboutId = capture.questionId ? entry?.itemId : capture.owner.itemId;
  const item = aboutId ? getItem(db, aboutId) : undefined;
  const lesson = lessonId ? db.lessons.find((l) => l.id === lessonId) : undefined;
  const today = todayISODate(now);
  const upcoming = db.lessons
    .filter((l) => l.instrumentId === capture.owner.instrumentId && isUpcomingLesson(l, today))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  const words = capture.text.trim();
  const attempt = capture.attempt;

  const copy = () => void navigator.clipboard?.writeText(capture.text).catch(() => undefined);
  let status: ReactNode = null;
  if (gone) {
    status = (
      <span className="row tiny" role="alert" style={{ gap: 8, color: 'var(--tone-alert)', flexWrap: 'wrap' }}>
        <span dir="ltr">This question was removed from your class list — these words are not saved.</span>
        <button type="button" className="btn btn-sm" onClick={saveLiveQuestionAsNew} disabled={!words}>
          Save as a new question
        </button>
        <button type="button" className="btn btn-sm" onClick={copy} disabled={!words}>
          Copy
        </button>
      </span>
    );
  } else if (attempt?.status === 'failed') {
    status = (
      <span className="row tiny" role="alert" style={{ gap: 8, color: 'var(--tone-alert)', flexWrap: 'wrap' }}>
        {words ? (
          <>
            <span dir="ltr">Not saved — this device refused the write. Your words are still here.</span>
            <button type="button" className="btn btn-sm" onClick={() => saveLiveQuestion(true)}>
              Try again
            </button>
            <button type="button" className="btn btn-sm" onClick={copy}>
              Copy
            </button>
          </>
        ) : (
          <>
            <span dir="ltr">Not saved — this device refused the last words, which your question still holds. The field is empty.</span>
            <button type="button" className="btn btn-sm" onClick={() => saveLiveQuestion(true)}>
              Try again
            </button>
          </>
        )}
      </span>
    );
  } else if (attempt?.status === 'saving') {
    status = (
      <span className="tiny faint" role="status">
        Saving…
      </span>
    );
  } else if (words && attempt?.carried === words) {
    status = (
      <span className="tiny" role="status">
        <span dir="ltr">Saved on this device{lesson ? ` for ${lessonLabel(lesson)}` : ' — unassigned'}.</span>
      </span>
    );
  } else if (!words && capture.written) {
    status = (
      <span className="tiny faint" role="status">
        <span dir="ltr">The field is empty — nothing new is saved; your saved question stays as it was.</span>
      </span>
    );
  } else if (words && !problem) {
    status = (
      <span className="tiny faint" role="status">
        <span dir="ltr">Saves on this device when you pause.</span>
      </span>
    );
  }

  return (
    <form
      className="card card-quiet stack-sm"
      style={{ textAlign: 'start' }}
      aria-label="Ask teacher"
      onSubmit={(e) => {
        e.preventDefault();
        saveLiveQuestion();
      }}
    >
      <label className="field-label" htmlFor="pc-ask-teacher">
        Question for your teacher
      </label>
      <input
        id="pc-ask-teacher"
        ref={input}
        className="input"
        dir="auto"
        aria-label="Question for your teacher"
        placeholder="What will you ask?"
        value={capture.text}
        autoFocus={capture.focused}
        onFocus={() => focusLiveQuestion(true)}
        onBlur={() => {
          if (!leaving.current) focusLiveQuestion(false);
        }}
        onChange={(e) => editLiveQuestion(e.target.value)}
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
        value={lessonId ?? ''}
        disabled={gone}
        onChange={(e) => chooseLiveQuestionLesson(e.target.value || undefined)}
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
              <button type="button" className="btn btn-sm" onClick={dropLiveQuestionItem}>
                Keep it without the item
              </button>
            </div>
          )}
          {problem.lesson && (
            <div className="tiny">
              <span dir="ltr">{problem.lesson}</span>{' '}
              <button type="button" className="btn btn-sm" onClick={() => chooseLiveQuestionLesson(undefined)}>
                Save it unassigned
              </button>
            </div>
          )}
        </div>
      )}
      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn btn-sm" onClick={closeLiveQuestion}>
          Done
        </button>
        {status}
      </div>
    </form>
  );
}
