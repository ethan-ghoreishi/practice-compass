import { useMemo, useState } from 'react';
import {
  defaultTargetLesson,
  isPreparation,
  isQuestion,
  lessonLabel,
  lessonsForInstrument,
  type ID,
  type LessonAgendaEntry,
  type LessonQuestion,
} from '../domain';
import { useStore } from '../store/useStore';
import { useDecisionNow } from './useDecisionNow';
import { Field } from './ui';

// ---------------------------------------------------------------------------
// The lesson agenda, rendered wherever a commitment or a question is managed:
// from the ITEM (what am I preparing, what do I want to ask about this?) and
// from the CLASS (what is on this class's agenda?).
//
// Both views read the ONE canonical collection, so a question raised on an
// item and the same question seen on its class are the same record — never two
// lists that can disagree. Every action here is administrative: none of them
// logs practice, completes a review or changes an item's urgency.
//
// Direction: a question's text and an item's title are both owner-authored and
// need not share a language, so each carries its own `dir="auto"`; fixed
// English copy inside such a group is isolated inline with `<span dir="ltr">`.
// ---------------------------------------------------------------------------

/** The class an entry names, spelled out — or plainly "unassigned". */
function TargetLine({ entry }: { entry: LessonAgendaEntry }) {
  const db = useStore((s) => s.db);
  const lesson = entry.lessonId ? db.lessons.find((l) => l.id === entry.lessonId) : undefined;
  const former = entry.detachedFromLessonId ? db.lessons.find((l) => l.id === entry.detachedFromLessonId) : undefined;
  return (
    <div className="tiny faint">
      <span dir="ltr">
        {lesson
          ? `For ${lessonLabel(lesson)}`
          : former
            ? `Unassigned — was for ${lessonLabel(former)}`
            : 'Unassigned — no class chosen yet'}
      </span>
    </div>
  );
}

/** The target picker: the only way an entry changes class. */
function TargetPicker({ entry }: { entry: LessonAgendaEntry }) {
  const db = useStore((s) => s.db);
  const setAgendaTarget = useStore((s) => s.setAgendaTarget);
  const lessons = lessonsForInstrument(db.lessons, entry.instrumentId);
  const label = entry.kind === 'question' ? 'Ask at' : 'Prepare for';
  return (
    <select
      className="input"
      aria-label={`${label} which class`}
      value={entry.lessonId ?? ''}
      onChange={(e) => setAgendaTarget(entry.id, e.target.value || undefined)}
      style={{ maxWidth: 220 }}
    >
      <option value="">Unassigned</option>
      {lessons.map((l) => (
        <option key={l.id} value={l.id}>
          {lessonLabel(l)}
        </option>
      ))}
    </select>
  );
}

function QuestionRow({ entry, showTarget = true }: { entry: LessonQuestion; showTarget?: boolean }) {
  const markQuestionAsked = useStore((s) => s.markQuestionAsked);
  const reopenQuestion = useStore((s) => s.reopenQuestion);
  const setQuestionAnswer = useStore((s) => s.setQuestionAnswer);
  const removeAgendaEntry = useStore((s) => s.removeAgendaEntry);
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState(entry.answer ?? '');

  return (
    <div className="card card-quiet stack-sm">
      {/* The question's own text leads the group, so a Farsi question and the
          lines belonging to it read as one right-aligned block. */}
      <div dir="auto">
        <div className="small" style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>
          {entry.text}
        </div>
        {entry.askedAt && (
          <div className="tiny faint">
            <span dir="ltr">{`Asked ${entry.askedAt.slice(0, 10)}`}</span>
          </div>
        )}
      </div>
      {entry.answer && (
        <div>
          <div className="tiny faint">
            <span dir="ltr">Answer</span>
          </div>
          <div className="small" dir="auto" style={{ whiteSpace: 'pre-wrap' }}>
            {entry.answer}
          </div>
        </div>
      )}
      {showTarget && <TargetLine entry={entry} />}
      <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
        {showTarget && <TargetPicker entry={entry} />}
        {entry.askedAt ? (
          <button className="btn btn-ghost btn-sm" onClick={() => reopenQuestion(entry.id)}>
            Reopen
          </button>
        ) : (
          <button className="btn btn-sm" onClick={() => markQuestionAsked(entry.id)}>
            Mark asked
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => setAnswering((o) => !o)}>
          {entry.answer ? 'Edit answer' : 'Add answer'}
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => removeAgendaEntry(entry.id)}
          aria-label="Remove this question"
        >
          Remove
        </button>
      </div>
      {answering && (
        <Field label="What the teacher said">
          <textarea
            className="textarea"
            value={answer}
            aria-label="Teacher answer"
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button
            className="btn btn-sm"
            onClick={() => {
              setQuestionAnswer(entry.id, answer);
              setAnswering(false);
            }}
          >
            Save answer
          </button>
        </Field>
      )}
    </div>
  );
}

/**
 * An item's own agenda: what it is committed to prepare for, and what the
 * owner wants to ask about it. Adding a question here never marks the item as
 * work for a class — the two are genuinely independent commitments.
 */
export function ItemAgenda({ itemId }: { itemId: ID }) {
  const db = useStore((s) => s.db);
  const addLessonPreparation = useStore((s) => s.addLessonPreparation);
  const addLessonQuestion = useStore((s) => s.addLessonQuestion);
  const removeAgendaEntry = useStore((s) => s.removeAgendaEntry);
  const now = useDecisionNow();

  const item = db.items.find((i) => i.id === itemId);
  const preparations = db.lessonAgenda.filter((e) => isPreparation(e) && e.itemId === itemId);
  const questions = db.lessonAgenda.filter((e): e is LessonQuestion => isQuestion(e) && e.itemId === itemId);
  const nextLesson = useMemo(
    () => (item ? defaultTargetLesson(db.lessons, item.instrumentId, now) : undefined),
    [db.lessons, item, now],
  );

  const [asking, setAsking] = useState(false);
  const [text, setText] = useState('');
  if (!item) return null;

  return (
    <section className="stack-sm">
      <div className="section-label">Class commitments</div>

      {preparations.length === 0 ? (
        <p className="tiny faint">
          <span dir="ltr">Not committed to a class yet.</span>
        </p>
      ) : (
        preparations.map((e) => (
          <div key={e.id} className="card card-quiet stack-sm">
            <TargetLine entry={e} />
            <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
              <TargetPicker entry={e} />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => removeAgendaEntry(e.id)}
                aria-label="Remove this class commitment"
              >
                Remove
              </button>
            </div>
          </div>
        ))
      )}
      <button
        className="btn btn-sm"
        onClick={() => addLessonPreparation(itemId, nextLesson?.id)}
        style={{ width: 'fit-content' }}
      >
        {nextLesson ? `Prepare for ${lessonLabel(nextLesson)}` : 'Note as class work (unassigned)'}
      </button>

      <div className="section-label">Questions for your teacher</div>
      {questions.length === 0 ? (
        <p className="tiny faint">
          <span dir="ltr">No questions recorded for this item.</span>
        </p>
      ) : (
        questions.map((q) => <QuestionRow key={q.id} entry={q} />)
      )}

      {asking ? (
        <Field label="What will you ask?">
          <textarea
            className="textarea"
            value={text}
            aria-label="New question"
            onChange={(e) => setText(e.target.value)}
          />
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn btn-sm btn-primary"
              disabled={!text.trim()}
              onClick={() => {
                addLessonQuestion({
                  text,
                  instrumentId: item.instrumentId,
                  itemId,
                  lessonId: nextLesson?.id,
                });
                setText('');
                setAsking(false);
              }}
            >
              Add question
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setAsking(false)}>
              Cancel
            </button>
          </div>
          <p className="tiny faint">
            <span dir="ltr">
              {nextLesson
                ? `It will be asked at ${lessonLabel(nextLesson)} unless you change that.`
                : 'There is no upcoming class yet, so it will be saved unassigned.'}
            </span>
          </p>
        </Field>
      ) : (
        <button className="btn btn-sm" onClick={() => setAsking(true)} style={{ width: 'fit-content' }}>
          + Ask about this
        </button>
      )}
    </section>
  );
}

/**
 * One class's own agenda: the work committed to it, the questions to ask at
 * it, and the history of what was already asked. Unassigned entries on the
 * same instrument are offered separately, so a commitment with no target is
 * visible without ever being silently folded into this class's list.
 */
export function LessonAgendaPanel({ lessonId }: { lessonId: ID }) {
  const db = useStore((s) => s.db);
  const setAgendaTarget = useStore((s) => s.setAgendaTarget);
  const removeAgendaEntry = useStore((s) => s.removeAgendaEntry);
  const addLessonQuestion = useStore((s) => s.addLessonQuestion);
  const [text, setText] = useState('');

  const lesson = db.lessons.find((l) => l.id === lessonId);
  const entries = db.lessonAgenda.filter((e) => e.lessonId === lessonId);
  const preparations = entries.filter(isPreparation);
  const open = entries.filter((e): e is LessonQuestion => isQuestion(e) && !e.askedAt);
  const asked = entries.filter((e): e is LessonQuestion => isQuestion(e) && !!e.askedAt);
  const unassigned = lesson
    ? db.lessonAgenda.filter((e) => e.instrumentId === lesson.instrumentId && !e.lessonId)
    : [];
  if (!lesson) return null;

  const titleOf = (id: ID | undefined) => db.items.find((i) => i.id === id)?.title;

  return (
    <section className="stack-sm">
      <div className="section-label">Committed for this class</div>
      {preparations.length === 0 ? (
        <p className="tiny faint">
          <span dir="ltr">Nothing committed to this class yet.</span>
        </p>
      ) : (
        preparations.map((e) => (
          <div key={e.id} className="row between">
            <div className="grow" dir="auto" style={{ minWidth: 0 }}>
              <div className="truncate">{titleOf(e.itemId) ?? e.itemId}</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => removeAgendaEntry(e.id)}
              aria-label={`Remove ${titleOf(e.itemId) ?? 'this item'} from this class`}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <div className="section-label">Questions to ask at this class</div>
      {open.length === 0 ? (
        <p className="tiny faint">
          <span dir="ltr">No open questions for this class.</span>
        </p>
      ) : (
        open.map((q) => <QuestionRow key={q.id} entry={q} showTarget={false} />)
      )}
      <Field label="Add a question for this class">
        <textarea
          className="textarea"
          value={text}
          aria-label="New question for this class"
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="btn btn-sm"
          disabled={!text.trim()}
          onClick={() => {
            addLessonQuestion({ text, instrumentId: lesson.instrumentId, lessonId });
            setText('');
          }}
        >
          Add question
        </button>
      </Field>

      {asked.length > 0 && (
        <>
          <div className="section-label">Already asked at this class</div>
          {asked.map((q) => (
            <QuestionRow key={q.id} entry={q} showTarget={false} />
          ))}
        </>
      )}

      {unassigned.length > 0 && (
        <>
          <div className="section-label">Unassigned on this instrument</div>
          <p className="tiny faint">
            <span dir="ltr">
              These name no class yet — nothing was guessed for them. Move one here when it belongs here.
            </span>
          </p>
          {unassigned.map((e) => (
            <div key={e.id} className="row between">
              <div className="grow" dir="auto" style={{ minWidth: 0 }}>
                <div className="small">
                  {isQuestion(e) ? e.text : (titleOf(e.itemId) ?? e.itemId)}
                </div>
                <div className="tiny faint">
                  <span dir="ltr">{isQuestion(e) ? 'Question' : 'Class work'}</span>
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => setAgendaTarget(e.id, lessonId)}>
                Move to this class
              </button>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
