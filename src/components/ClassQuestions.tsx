import { useState } from 'react';
import { renderClassQuestionsText, type ClassQuestion } from '../domain';

/**
 * "Questions for next class" — the questions to actually ask the teacher,
 * with Copy / Download / Print exports. Each question is one coherent,
 * direction-aware unit: the ordinal number is a real element inside a flex
 * `<li dir="auto">`, never a native `::marker` — a marker's own logical
 * position for a direction-variable list item is a browser implementation
 * detail no gutter measurement can guarantee, so it is never relied on at
 * all.
 *
 * THE QUESTION leads the li's own resolution — never the title. `dir="auto"`
 * skips any descendant that carries its own `dir` when hunting for a first
 * strong character, so whichever of title/question is left BARE is what the
 * ordinal's side tracks. `questionsForNextClass` guarantees `q.question` is
 * non-empty on every rendered row; `q.title` carries no such guarantee and is
 * authored independently (an item's own name, which need not share the
 * question's language) — an OWNER-observed regression found the ordinal
 * pinned to whichever language the TITLE happened to be in (bare, leading
 * the hunt) while the question resolved its own, different direction and
 * landed on the opposite edge, unattached from the marker entirely. The
 * title now carries its OWN `dir="auto"` isolate (taking it OUT of the
 * hunt, same skip mechanism, so an English title still renders left and a
 * Farsi one still renders right, independently); the question is left bare,
 * so it is what the li's `dir="auto"` actually finds.
 *
 * Problem/Last time are each their OWN group: the ROW itself carries
 * `dir="auto"`, so the row's alignment comes from the VALUE, not from the
 * title above it or from whichever direction the label happens to read in.
 * The fixed English label is marked `dir="ltr"` — not because its own text
 * ever changes, but because `dir="auto"` skips a descendant that carries its
 * own `dir` when hunting for a first strong character, so marking the label
 * takes it OUT of that hunt and leaves the value as the only candidate. The
 * value itself is bare (no `dir` of its own): were it marked too, BOTH
 * children would be skipped and the row would have no resolution source at
 * all, falling back to LTR regardless of what the value says. A question is
 * never cleared by practising; the user edits the item to remove it.
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
           resolution source of its own. The QUESTION (below) is left bare
           for the same reason, deliberately — it is what the li's hunt is
           meant to find, since it is always present and the title is not.

           role="list": WebKit drops an <ol>/<ul>'s own list semantics from
           the accessibility tree once `list-style: none` removes its visual
           marker — an explicit role restores VoiceOver's "list, N items" and
           each <li>'s position announcement, which the visible ordinal
           (aria-hidden below, so it isn't announced twice) does not carry
           on its own. */
        <ol
          role="list"
          className="stack-sm"
          style={{ margin: 0, padding: 0, listStyle: 'none' }}
        >
          {questions.map((q, i) => (
            <li key={q.itemId} dir="auto" className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
              <span className="tiny faint" aria-hidden="true" style={{ flexShrink: 0 }}>
                {i + 1}.
              </span>
              <div className="stack-sm grow">
                {/* The title is authored independently of the question — an
                    item's own name, which need not share the question's
                    language — so it carries its own dir="auto" isolate,
                    resolving from its own content rather than anchoring the
                    li (that would pin the ordinal to the title's language,
                    splitting it from the question whenever the two differ). */}
                <div className="small" dir="auto" style={{ fontWeight: 600 }}>
                  {q.title}
                </div>
                {/* Bare, deliberately: q.question is guaranteed non-empty
                    (questionsForNextClass filters on it) and is what the
                    li's dir="auto" hunt is meant to land on, so the ordinal
                    always tracks the question, never the optional title. */}
                <div className="small">
                  {q.question}
                </div>
                {/* The ROW resolves direction from the VALUE, never the label:
                    dir="ltr" on the label takes it out of the auto hunt, and the
                    bare value is what's left for the row's dir="auto" to find. A
                    Farsi value right-aligns the whole row even under an
                    English title; an English value left-aligns it even under a
                    Farsi one — the label never claims the direction either way. */}
                {q.currentProblem && (
                  <div className="tiny faint" dir="auto">
                    <span dir="ltr">Problem:</span> {q.currentProblem}
                  </div>
                )}
                {q.lastObservation && (
                  <div className="tiny faint" dir="auto">
                    <span dir="ltr">Last time:</span> {q.lastObservation}
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
