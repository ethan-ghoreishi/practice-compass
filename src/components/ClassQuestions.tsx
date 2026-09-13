import type { ReactNode } from 'react';
import { useState } from 'react';
import { renderClassQuestionsText, type ClassQuestion } from '../domain';
import { splitLines } from './format';

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
 * Problem/Last time are each STACKED, a caption above its value, rather than
 * one inline "Label: value" line. An OWNER-observed regression found the
 * previous inline shape — the row carrying `dir="auto"`, the label isolated
 * `dir="ltr"` to take it out of the hunt, the value left bare — put the
 * label at the wrong VISUAL end whenever the row resolved RTL: `dir="ltr"`
 * makes the label an isolated, atomic run, and the Unicode bidi algorithm
 * reorders that atomic run to the position its RTL neighbour's algorithm
 * dictates, not the position it was written in. The label's own trailing
 * colon ended up on the OUTER edge, pointing at nothing, with the value
 * sitting on the far side of it rather than beside it — correct on-value
 * character shaping, wrong pairing.
 *
 * Stacking removes the single inline line the two ever had to fight over.
 * The caption (`<span dir="ltr">`, isolated so it can never itself flip, and
 * inline rather than block so its isolate cannot hijack its own line's
 * alignment — see direction.test.ts's "a bidi isolate is always inline"
 * rule) sits in a plain, undirected wrapper: with no `dir` of its own that
 * wrapper inherits the surrounding `direction` from the `<li>` (i.e. from
 * the QUESTION), so the caption aligns to the same edge as the rest of the
 * card. The value below it keeps its own `dir="auto"` isolate, resolving
 * from its OWN content exactly as before — independently RTL for a Farsi
 * note, independently LTR for an English one, whichever the question is.
 * The two lines sit close together (a tighter gap than separates the
 * fields from each other) so they still read as one pair, without either
 * one's direction ever being able to drag the other out of place. A
 * question is never cleared by practising; the user edits the item to
 * remove it.
 */

/**
 * Several distinct questions/problems typed for the same item have nowhere
 * to live but ONE `<textarea>` — there is no "multiple questions" structure,
 * and inventing one (a schema change, add/remove rows in the form) is a
 * bigger change than the actual complaint: two lines of free text were
 * running together as one paragraph with no visual separator, only readable
 * as two questions if you already knew to look for a question mark.
 *
 * A single line renders exactly as before. Two or more render as a bulleted
 * list, deliberately NOT a second numbered one: the item above is already
 * numbered (1. 2. …), and re-using numbers one level down would read as
 * "item 2, question 2" — indistinguishable at a glance from "the second
 * item". A bullet carries no ordinal meaning, so it can never collide with
 * the outer numbering.
 *
 * EACH LINE IS INDEPENDENTLY AUTHORED, so each resolves its OWN direction.
 * A sealed finding rejected the first pass at this, which left every bullet
 * bare on the argument that lines from one field share one direction: they
 * do not. A musician who types a Farsi question and an English one into the
 * same box gets two lines whose languages genuinely differ, and leaving
 * them all bare pinned every following line to the FIRST line's direction —
 * an English line dragged RTL, or a Farsi one dragged LTR, with its bullet
 * on the wrong side.
 *
 * The catch the first pass was right about is real, though: `dir="auto"`
 * skips any descendant carrying its own `dir` when hunting for a first
 * strong character, and the outer `<li dir="auto">` (and the Problem /
 * Last time value wrapper) has nothing else left to hunt — the title is
 * already isolated. Isolating EVERY line would leave the whole item with no
 * resolution source and a silent LTR fallback, regressing the ninth
 * finding's "the ordinal always tracks the question".
 *
 * Both hold one way only: the FIRST line is the ANCHOR and stays bare, so
 * the enclosing group resolves from it — which means that line still
 * follows its own language, since the direction it inherits is the one it
 * produced. Every line AFTER it carries its own `dir="auto"` on the row, so
 * its text and its bullet both follow that line alone. The two branches are
 * written out literally rather than as `dir={i === 0 ? undefined : 'auto'}`:
 * direction.test.ts is a source scanner, and a computed attribute is
 * invisible to every guard in it.
 */
function bullet(line: string, key: number, own: boolean) {
  const dot = (
    <span aria-hidden="true" className="tiny faint" style={{ flexShrink: 0 }}>
      •
    </span>
  );
  const style = { alignItems: 'flex-start', gap: 6 } as const;
  // Two literal branches, not one computed dir — see the note above.
  return own ? (
    <li key={key} dir="auto" className="row" style={style}>
      {dot}
      <span className="grow">{line}</span>
    </li>
  ) : (
    <li key={key} className="row" style={style}>
      {dot}
      <span className="grow">{line}</span>
    </li>
  );
}

function renderFreeText(text: string): ReactNode {
  const lines = splitLines(text);
  if (lines.length <= 1) return text;
  return (
    <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
      {lines.map((line, i) => bullet(line, i, i > 0))}
    </ul>
  );
}

export default function ClassQuestions({
  instrumentName,
  dateLabel,
  questions,
}: {
  instrumentName: string;
  dateLabel: string;
  questions: ClassQuestion[];
}) {
  // Three states, not a boolean: a FAILED copy has to say so and offer
  // something else, or the owner walks into class believing the list is on
  // their clipboard. The clipboard is refused routinely — an insecure origin,
  // a denied permission, a browser that needs a fresher user gesture.
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const text = renderClassQuestionsText(instrumentName, dateLabel, questions);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1800);
    } catch {
      setCopyState('failed');
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
              {copyState === 'copied' ? 'Copied ✓' : 'Copy'}
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

      {/* Announced, not merely coloured: a live region so the outcome reaches
          assistive technology as well as the eye. */}
      <div role="status" aria-live="polite" className="tiny">
        {copyState === 'copied' ? (
          <span dir="ltr">Questions copied to the clipboard.</span>
        ) : copyState === 'failed' ? (
          <span dir="ltr">
            Couldn’t copy — your browser refused clipboard access. The full text is below: select it, or use Download.
          </span>
        ) : null}
      </div>
      {copyState === 'failed' && (
        <textarea
          className="textarea"
          readOnly
          aria-label="Questions text to select and copy"
          value={text}
          style={{ minHeight: 140 }}
        />
      )}

      {questions.length === 0 ? (
        <div className="card card-quiet small dim">
          Nothing to ask at this class yet. Add a question from an item or from the class itself — it will collect here.
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
            <li key={q.id} dir="auto" className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
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
                {q.title && (
                  <div className="small" dir="auto" style={{ fontWeight: 600 }}>
                    {q.title}
                  </div>
                )}
                {/* Bare, deliberately: q.question is guaranteed non-empty
                    (questionsForNextClass filters on it) and is what the
                    li's dir="auto" hunt is meant to land on, so the ordinal
                    always tracks the question, never the optional title. */}
                <div className="small">
                  {renderFreeText(q.question)}
                </div>
                {/* Stacked, not inline: the caption's wrapper carries no dir of
                    its own, so it inherits the li's (question-driven) direction
                    and aligns with the rest of the card; the value below keeps
                    its own dir="auto", resolving from its own content. Neither
                    line's direction can drag the other out of place. */}
                {q.currentProblem && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="tiny faint">
                      <span dir="ltr">Problem</span>
                    </div>
                    <div className="tiny faint" dir="auto">
                      {renderFreeText(q.currentProblem)}
                    </div>
                  </div>
                )}
                {q.lastObservation && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <div className="tiny faint">
                      <span dir="ltr">Last time</span>
                    </div>
                    <div className="tiny faint" dir="auto">
                      {renderFreeText(q.lastObservation)}
                    </div>
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
