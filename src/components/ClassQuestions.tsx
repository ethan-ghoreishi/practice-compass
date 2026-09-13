import { useState } from 'react';
import { renderClassQuestionsText, type ClassQuestion } from '../domain';

/**
 * "Questions for next class" — the questions to actually ask the teacher,
 * with Copy / Download / Print exports. Each question is one coherent,
 * direction-aware unit: the ordinal number is a real element inside a flex
 * `<li dir="auto">`, never a native `::marker` — a marker's own logical
 * position for a direction-variable list item is a browser implementation
 * detail that escaped the card on the owner's own iPhone even with
 * symmetric gutter room reserved for it, so it is never relied on at all.
 * The title leads the li's own resolution (bare, no dir of its own); the
 * question, problem and last observation are each authored independently of
 * the title AND of each other, so each carries its OWN `dir="auto"` isolate.
 * Problem/Last time keep a fixed English label, immediately followed by the
 * value's own isolate — `ActiveBlock`'s established shape — refined so a
 * value long enough to wrap on a narrow phone wraps according to ITS OWN
 * resolved direction rather than the label's: the isolate is block-level
 * (`display: inline-block`), which changes nothing for a short value (its
 * box is exactly as wide as its one line) but right-aligns a wrapped Farsi
 * value's own continuation lines even when the label ahead of it is English.
 * A question is never cleared by practising; the user edits the item to
 * remove it.
 */
export default function ClassQuestions({
  instrumentName,
  dateLabel,
  questions,
}: {
  instrumentName: string;
  dateLabel: string;
  questions: ClassQuestion[];
}) {
  const [copied, setCopied] = useState(false);
  const text = renderClassQuestionsText(instrumentName, dateLabel, questions);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = `${instrumentName}-${dateLabel}`.replace(/[^\p{L}\p{N}-]+/gu, '-');
    a.download = `questions-${safe}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <div className="section-label">Questions for next class</div>
        {questions.length > 0 && (
          <div className="row" style={{ gap: 6 }}>
            <button className="btn btn-ghost btn-sm" onClick={copy}>
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={download}>
              Download
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              Print
            </button>
          </div>
        )}
      </div>

      {questions.length === 0 ? (
        <div className="card card-quiet small dim">
          Nothing to ask yet. Flag an item “for next class” and add a teacher question — it will collect here.
        </div>
      ) : (
        /* No native marker: an outside ::marker's own logical position for a
           direction-variable <li> is a browser implementation detail, not
           something a gutter measurement can guarantee — it escaped the
           card's own padding on the owner's iPhone even with symmetric room
           reserved on both sides. The ordinal is a real element instead, the
           FIRST child of a flex <li dir="auto">: flexbox's row axis is
           direction-aware by specification, so the number leads on the
           right for a Farsi question and on the left for an English one,
           always inside the content box it can never escape. It carries no
           dir of its own (a digit is bidi-neutral) and neither does the
           wrapper around title/question/details — dir="auto" skips a
           descendant that has its own dir when hunting for a first strong
           character, so giving the wrapper one would leave the <li> with no
           resolution source of its own. */
        <ol className="stack-sm" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {questions.map((q, i) => (
            <li key={q.itemId} dir="auto" className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
              <span className="tiny faint" aria-hidden="true" style={{ flexShrink: 0 }}>
                {i + 1}.
              </span>
              <div className="stack-sm grow">
                <div className="small" style={{ fontWeight: 600 }}>
                  {q.title}
                </div>
                {/* question/problem/observation are each authored independently
                    of the title (and of each other) — their own dir="auto"
                    isolates resolve from their own content, not from q.title's. */}
                <div className="small" dir="auto">
                  {q.question}
                </div>
                {q.currentProblem && (
                  <div className="tiny faint">
                    Problem: <span dir="auto" style={{ display: 'inline-block', textAlign: 'start' }}>{q.currentProblem}</span>
                  </div>
                )}
                {q.lastObservation && (
                  <div className="tiny faint">
                    Last time: <span dir="auto" style={{ display: 'inline-block', textAlign: 'start' }}>{q.lastObservation}</span>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Off-screen sheet — the only thing that prints. */}
      {questions.length > 0 && <pre className="print-sheet">{text}</pre>}
    </section>
  );
}
