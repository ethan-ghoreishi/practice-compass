import { useMemo, useState } from 'react';
import {
  addDays,
  buildTeacherReport,
  nextLessonFor,
  questionsForNextClass,
  toISODate,
  todayISODate,
} from '../domain';
import { useStore } from '../store/useStore';
import { Field } from '../components/ui';
import ClassQuestions from '../components/ClassQuestions';

export default function TeacherReport() {
  const db = useStore((s) => s.db);
  const now = useMemo(() => new Date(), []);

  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');
  const [from, setFrom] = useState(toISODate(addDays(now, -14)));
  const [to, setTo] = useState(todayISODate(now));
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (instrumentId ? buildTeacherReport(db, { instrumentId, from, to, now }) : ''),
    [db, instrumentId, from, to, now],
  );

  const questions = useMemo(
    () => (instrumentId ? questionsForNextClass(db.items, instrumentId) : []),
    [db.items, instrumentId],
  );
  const nextClass = instrumentId ? nextLessonFor(db.lessons, instrumentId, now) : null;
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
        <p className="page-sub">A copyable summary for your next lesson.</p>
      </header>

      <div className="card stack">
        <Field label="Instrument">
          <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
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
              instrumentName={instrumentName}
              dateLabel={
                nextClass
                  ? typeof nextClass.number === 'number'
                    ? `Class ${nextClass.number} · ${nextClass.date}`
                    : nextClass.date
                  : 'next class'
              }
              questions={questions}
            />
          </div>

          <button className="btn btn-primary btn-block" onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy report'}
          </button>
          <div className="card">
            <pre className="pre">{report}</pre>
          </div>
        </>
      ) : (
        <div className="card small dim">Add an instrument to generate a report.</div>
      )}
    </div>
  );
}
