import { useMemo, useState } from 'react';
import {
  addDays,
  buildTeacherReport,
  lessonLabel,
  nextLessonFor,
  openQuestionsForInstrument,
  openQuestionsForLessonId,
  toISODate,
  todayISODate,
} from '../domain';
import { useStore } from '../store/useStore';
import { Field } from '../components/ui';
import ClassQuestions from '../components/ClassQuestions';
import { useDecisionNow } from '../components/useDecisionNow';

export default function TeacherReport() {
  const db = useStore((s) => s.db);
  // The report's own PERIOD is the owner's choice and never moves on its own;
  // the "current" sections below (suggested focus, open questions) are today's,
  // so the page needs a live day rather than one frozen when it was opened.
  const now = useDecisionNow();

  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');
  const [from, setFrom] = useState(toISODate(addDays(now, -14)));
  const [to, setTo] = useState(todayISODate(now));
  const [copied, setCopied] = useState(false);

  // WHICH class this report is for. A question belongs to a NAMED class, so a
  // report that cannot name one can only ever show every open question on the
  // instrument — which is a different, honest thing, and is labelled as one.
  // `null` means "follow the next class"; choosing explicitly pins it, and
  // changing instrument returns to following (the pinned id belongs to the old
  // instrument's lessons).
  const [lessonChoice, setLessonChoice] = useState<string | null>(null);
  const lessons = useMemo(
    () =>
      db.lessons
        .filter((l) => l.instrumentId === instrumentId)
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [db.lessons, instrumentId],
  );
  const nextClass = instrumentId ? nextLessonFor(db.lessons, instrumentId, now) : null;
  const lessonId = lessonChoice ?? nextClass?.id ?? '';
  const chosen = lessons.find((l) => l.id === lessonId);

  const report = useMemo(
    () =>
      instrumentId
        ? buildTeacherReport(db, { instrumentId, from, to, now, lessonId: chosen?.id })
        : '',
    [db, instrumentId, from, to, now, chosen?.id],
  );

  const questions = useMemo(() => {
    if (!instrumentId) return [];
    // `db.blocks` is what supplies each question's CURRENT context — the
    // item's latest recorded observation, with the day it was written. It is
    // derived, never a cached field, so it cannot drift from the history.
    return chosen
      ? openQuestionsForLessonId(db.lessonAgenda, db.items, chosen.id, db.blocks)
      : openQuestionsForInstrument(db.lessonAgenda, db.items, instrumentId, db.blocks);
  }, [db.lessonAgenda, db.items, db.blocks, instrumentId, chosen]);
  const instrumentName = db.instruments.find((i) => i.id === instrumentId)?.name ?? 'Instrument';

  async function copy() {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Teacher report</h1>
        <p className="page-sub">A copyable summary for a class — your next one unless you choose another.</p>
      </header>

      <div className="card stack">
        <Field label="Instrument">
          <select
            className="select"
            aria-label="Instrument"
            value={instrumentId}
            onChange={(e) => {
              setInstrumentId(e.target.value);
              setLessonChoice(null);
            }}
          >
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Class this report is for">
          {/* Field is a role="group" div, never a <label> (interactive controls
              must not nest inside one), so the control carries its own name. */}
          <select
            className="select"
            aria-label="Class this report is for"
            value={lessonId}
            onChange={(e) => setLessonChoice(e.target.value)}
          >
            <option value="">No particular class</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {lessonLabel(l)}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid-2">
          <Field label="From">
            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </Field>
          <Field label="To">
            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </Field>
        </div>
      </div>

      {instrumentId ? (
        <>
          <div className="card">
            <ClassQuestions
              title={chosen ? 'Questions for this class' : 'Open questions on this instrument'}
              instrumentName={instrumentName}
              dateLabel={chosen ? lessonLabel(chosen) : 'no particular class'}
              questions={questions}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy report'}
          </button>
          <div className="card">
            <pre className="pre" dir="auto">{report}</pre>
          </div>
        </>
      ) : (
        <div className="card small dim">Add an instrument to generate a report.</div>
      )}
    </div>
  );
}
