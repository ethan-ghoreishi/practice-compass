import { useState } from 'react';
import { renderClassQuestionsText, type ClassQuestion } from '../domain';

/**
 * "Questions for next class" — the questions to actually ask the teacher,
 * with Copy / Download / Print exports. The title leads each question's own
 * group (`dir="auto"` on the `<li>`), but the question, problem and last
 * observation are each authored independently of the title AND of each
 * other, so each carries its OWN `dir="auto"` isolate rather than inheriting
 * the title's resolved direction. A question is never cleared by practising;
 * the user edits the item to remove it.
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
        /* paddingInline (both sides), not paddingInlineStart alone: each
           li below resolves its OWN direction via dir="auto", and the
           native ::marker sits on the START edge of THAT li, not of this
           ol — a Farsi item's marker lands on the right, an English item's
           on the left. Symmetric padding leaves it room to be seen in full
           on whichever side it lands. */
        <ol className="stack-sm" style={{ margin: 0, paddingInline: 22 }}>
          {questions.map((q) => (
            <li key={q.itemId} dir="auto">
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
                  Problem: <span dir="auto">{q.currentProblem}</span>
                </div>
              )}
              {q.lastObservation && (
                <div className="tiny faint">
                  Last time: <span dir="auto">{q.lastObservation}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      )}

      {/* Off-screen sheet — the only thing that prints. */}
      {questions.length > 0 && <pre className="print-sheet">{text}</pre>}
    </section>
  );
}
