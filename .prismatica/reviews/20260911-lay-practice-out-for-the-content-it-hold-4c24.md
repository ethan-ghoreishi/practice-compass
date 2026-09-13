---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractId: 20260911-lay-practice-out-for-the-content-it-hold-4c24
patchId: 90bfe93d1941bc986d529a3855d78796adaac142
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: "r-direction-aware-text: complete direction-aware grouping and
      independently directed lines"
    summary: The direction family remains incomplete. Repertoire's PathwayCard still
      forces left alignment while rendering its user-authored pathway title
      without a direction-aware group, and the new multi-line renderer makes
      distinct bullet lines inherit one shared direction. The named guard does
      not cover either counterexample.
    counterexample: "Use a Farsi pathway name in Repertoire: the button at
      src/pages/Repertoire.tsx:452 has textAlign:'left', pathway.name at :456
      has no dir ancestor, and the inline instrument isolate at :469 cannot
      change block alignment. Separately, enter a Farsi question followed by an
      English question on the next line: renderFreeText at
      src/components/ClassQuestions.tsx:87-101 gives neither inner li its own
      dir, so both bullets inherit the first line's RTL direction.
      direction.test.ts:1170 only requires one unrelated group per file, and
      format.test.ts checks splitting rather than rendered direction."
createdAt: 2026-09-13T12:13:15.212Z
sealedAt: 2026-09-13T13:56:12.952Z
---

# Review: Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260911-lay-practice-out-for-the-content-it-hold-4c24
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/20
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `90bfe93d1941bc986d529a3855d78796adaac142`

## The Delta this change was framed from

# The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

_approved · about "practise-todays-recommendation"_

## Today

Today shows two orchestration doorways before the app's actual answer, and from that card onward the app lays Persian content out backwards. A Farsi title resolves to direction:rtl and hugs the right edge of its cell while the English eyebrow above it, the reason below it and the 'due N days ago' caption under it all hug the left edge of the same cell — 80 dir="auto" attributes across 17 files and not one of them on a container. The due-review row leaves its title 113px of a 356px row, so a Farsi title truncates after about 13 characters. The close screen runs 1689px at 390x844 with the scheduling engine's controls — a native date field, a rationale paragraph squeezed into roughly 100px, and five review-type pills stacked vertically — fully expanded before the musician has said how it went. And in light theme the label on the primary Start button sits at 3.95:1, below AA.

## Instead

The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

## Keep

- A result stays required to save, and 'Save without a result' stays a reachable, deliberate way to record not_logged.
- A resultless close still changes no schedule: the item's date stays and its open Review row stays open; only a genuine decline clears and completes.
- Practising stays the only thing that completes a review and advances SM-2; 'Not now' still only hides for the day and '+2d' still moves the real date on both sides.
- Starting stays under 30 seconds, closing under 60, and a title stays the only required field anywhere.
- The Active screen stays deliberately empty — the ring, the elapsed figure, the two controls and the two existing disclosures. The wake lock and the boundary announcement are untouched and no recorded minute is affected.
- Session Plan and Routines stay two independent peer doorways, each with its own state and its own resume takeover; neither becomes a child of the other.
- No streak, score, badge, fabricated percentage or judging colour appears anywhere in the re-layout.
- English content renders exactly as it does today, and the shell — its 100dvh height model and its tab bar — is left entirely to the next lane.

## New assumptions

_none_

## Show me

On the iPhone, open Today on Setar. Practise now is the first thing under the instrument switcher, and the Farsi title with its English reason now sit as one right-aligned block instead of splitting across the card. Scroll to a due review: the Farsi title is legible instead of cut to a few characters, and its 'due N days ago' caption sits under it on the same edge. Switch to Classical Guitar — 'Study in C — full run' looks exactly as it always has, left-aligned. Start a block, finish it: the close screen asks how it went, what you noticed and what to try next time, and the whole review decision is one line, 'Review in 2 days · Repair', with a tap to open the date and type if you want them. Open it and the date is the same date the line just told you. Then switch to light theme and read the small grey metadata lines and the Start button's own label — both are legible now, and a test in the suite will fail if either ever drifts back.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

_none recorded_

**What changed since the previously reviewed head:**

```diff
diff --git a/src/components/ClassQuestions.tsx b/src/components/ClassQuestions.tsx
index f569334..dae648d 100644
--- a/src/components/ClassQuestions.tsx
+++ b/src/components/ClassQuestions.tsx
@@ -1,5 +1,7 @@
+import type { ReactNode } from 'react';
 import { useState } from 'react';
 import { renderClassQuestionsText, type ClassQuestion } from '../domain';
+import { splitLines } from './format';
 
 /**
  * "Questions for next class" — the questions to actually ask the teacher,
@@ -53,6 +55,52 @@ import { renderClassQuestionsText, type ClassQuestion } from '../domain';
  * question is never cleared by practising; the user edits the item to
  * remove it.
  */
+
+/**
+ * Several distinct questions/problems typed for the same item have nowhere
+ * to live but ONE `<textarea>` — there is no "multiple questions" structure,
+ * and inventing one (a schema change, add/remove rows in the form) is a
+ * bigger change than the actual complaint: two lines of free text were
+ * running together as one paragraph with no visual separator, only readable
+ * as two questions if you already knew to look for a question mark.
+ *
+ * A single line renders exactly as before. Two or more render as a bulleted
+ * list, deliberately NOT a second numbered one: the item above is already
+ * numbered (1. 2. …), and re-using numbers one level down would read as
+ * "item 2, question 2" — indistinguishable at a glance from "the second
+ * item". A bullet carries no ordinal meaning, so it can never collide with
+ * the outer numbering.
+ *
+ * The bullet is a real element, the first child of a flex `.row` — the same
+ * "never rely on a native `::marker`'s own logical position" policy the
+ * outer ordinal follows — but, UNLIKE the outer `<li>`, it carries NO
+ * `dir="auto"` of its own. These lines all came out of one field the
+ * musician wrote in one sitting, not independently authored values, so they
+ * share whichever direction that field already resolves to rather than each
+ * choosing one for itself. Left bare they inherit it and are never skipped
+ * by an ancestor's own `dir="auto"` hunt — which matters specifically for
+ * the QUESTION: the outer `<li>` anchors on it being bare, and an isolate
+ * here (as `dir="auto"` on the title already is) would remove a multi-line
+ * question from that hunt entirely, silently defaulting the whole item's
+ * direction to LTR.
+ */
+function renderFreeText(text: string): ReactNode {
+  const lines = splitLines(text);
+  if (lines.length <= 1) return text;
+  return (
+    <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
+      {lines.map((line, i) => (
+        <li key={i} className="row" style={{ alignItems: 'flex-start', gap: 6 }}>
+          <span aria-hidden="true" className="tiny faint" style={{ flexShrink: 0 }}>
+            •
+          </span>
+          <span className="grow">{line}</span>
+        </li>
+      ))}
+    </ul>
+  );
+}
+
 export default function ClassQuestions({
   instrumentName,
   dateLabel,
@@ -158,7 +206,7 @@ export default function ClassQuestions({
                     li's dir="auto" hunt is meant to land on, so the ordinal
                     always tracks the question, never the optional title. */}
                 <div className="small">
-                  {q.question}
+                  {renderFreeText(q.question)}
                 </div>
                 {/* Stacked, not inline: the caption's wrapper carries no dir of
                     its own, so it inherits the li's (question-driven) direction
@@ -171,7 +219,7 @@ export default function ClassQuestions({
                       <span dir="ltr">Problem</span>
                     </div>
                     <div className="tiny faint" dir="auto">
-                      {q.currentProblem}
+                      {renderFreeText(q.currentProblem)}
                     </div>
                   </div>
                 )}
@@ -181,7 +229,7 @@ export default function ClassQuestions({
                       <span dir="ltr">Last time</span>
                     </div>
                     <div className="tiny faint" dir="auto">
-                      {q.lastObservation}
+                      {renderFreeText(q.lastObservation)}
                     </div>
                   </div>
                 )}
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index e47d9ad..5f9f9b6 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -569,11 +569,11 @@ const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.gusheh}</span>' },
   {
     file: 'components/ClassQuestions.tsx',
-    snippet: '<div className="tiny faint" dir="auto">\n                      {q.currentProblem}',
+    snippet: '<div className="tiny faint" dir="auto">\n                      {renderFreeText(q.currentProblem)}',
   },
   {
     file: 'components/ClassQuestions.tsx',
-    snippet: '<div className="tiny faint" dir="auto">\n                      {q.lastObservation}',
+    snippet: '<div className="tiny faint" dir="auto">\n                      {renderFreeText(q.lastObservation)}',
   },
   // Instrument names used to be tracked here too, one exact snippet per site.
   // A sealed review found that shape structurally insufficient FOUR times
diff --git a/src/components/format.test.ts b/src/components/format.test.ts
index 5e25fc2..63804af 100644
--- a/src/components/format.test.ts
+++ b/src/components/format.test.ts
@@ -1,6 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import { type BlockResult, createItem, planNextReview, REVIEW_TYPE_LABELS, type ReviewPlan } from '../domain';
-import { relativeDay, reviewOverrideSurvivesResultChange, reviewSummaryLine } from './format';
+import { relativeDay, reviewOverrideSurvivesResultChange, reviewSummaryLine, splitLines } from './format';
 
 const NOW = new Date('2026-06-18T12:00:00.000Z');
 
@@ -86,3 +86,15 @@ describe('reviewOverrideSurvivesResultChange', () => {
     expect(reviewOverrideSurvivesResultChange(autoItem.reviewMode)).toBe(false);
   });
 });
+
+describe('splitLines', () => {
+  it('splits a multi-line free-text field into its trimmed, non-empty lines', () => {
+    expect(splitLines('سوال اول؟\nسوال دوم؟')).toEqual(['سوال اول؟', 'سوال دوم؟']);
+  });
+
+  it('keeps a single line as one entry, and drops blank lines and surrounding whitespace', () => {
+    expect(splitLines('one question')).toEqual(['one question']);
+    expect(splitLines('a\n\n  \nb\n')).toEqual(['a', 'b']);
+    expect(splitLines('  padded  ')).toEqual(['padded']);
+  });
+});
diff --git a/src/components/format.ts b/src/components/format.ts
index 6893d31..2ad3aa2 100644
--- a/src/components/format.ts
+++ b/src/components/format.ts
@@ -47,6 +47,21 @@ export function pluralize(n: number, word: string): string {
   return `${n} ${word}${n === 1 ? '' : 's'}`;
 }
 
+/**
+ * A free-text field's own non-empty lines. There is no data structure for
+ * "multiple questions" — `teacherQuestion`/`currentProblem`/`lastObservation`
+ * are each one `<textarea>`, so two distinct questions typed for the same
+ * item live as two lines of one string. This is how a renderer tells "one
+ * line" (plain text) from "several" (worth a bulleted breakdown) apart,
+ * without inventing a schema change for what is still one field.
+ */
+export function splitLines(text: string): string[] {
+  return text
+    .split('\n')
+    .map((line) => line.trim())
+    .filter(Boolean);
+}
+
 /**
  * The close screen's ONE honest line for the review decision — "Review in 2
  * days · Repair · …" — read off the SAME ReviewPlan that seeds the date field
```

**Full current text of every file the rework touched:**

### src/components/ClassQuestions.tsx

```
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
 * The bullet is a real element, the first child of a flex `.row` — the same
 * "never rely on a native `::marker`'s own logical position" policy the
 * outer ordinal follows — but, UNLIKE the outer `<li>`, it carries NO
 * `dir="auto"` of its own. These lines all came out of one field the
 * musician wrote in one sitting, not independently authored values, so they
 * share whichever direction that field already resolves to rather than each
 * choosing one for itself. Left bare they inherit it and are never skipped
 * by an ancestor's own `dir="auto"` hunt — which matters specifically for
 * the QUESTION: the outer `<li>` anchors on it being bare, and an isolate
 * here (as `dir="auto"` on the title already is) would remove a multi-line
 * question from that hunt entirely, silently defaulting the whole item's
 * direction to LTR.
 */
function renderFreeText(text: string): ReactNode {
  const lines = splitLines(text);
  if (lines.length <= 1) return text;
  return (
    <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
      {lines.map((line, i) => (
        <li key={i} className="row" style={{ alignItems: 'flex-start', gap: 6 }}>
          <span aria-hidden="true" className="tiny faint" style={{ flexShrink: 0 }}>
            •
          </span>
          <span className="grow">{line}</span>
        </li>
      ))}
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
```

### src/components/direction.test.ts

```
import { describe, expect, it } from 'vitest';

/**
 * Layout follows the direction of the content it shows.
 *
 * A title and the details that belong to it sit in ONE group that carries
 * `dir="auto"`, so a Persian item reads as one right-aligned block instead of
 * splitting across the card — the title hugging one edge while its own caption
 * hugs the other. Direction is resolved natively by the browser from the first
 * strong character; nothing here detects or reorders text in JavaScript.
 *
 * The completion boundary is mechanical, not a matter of care. After this lane
 * `dir="auto"` appears on GROUPS and on free-text FIELDS — never bare on a
 * title element. This test asserts BOTH halves, so a missed title fails and a
 * whole skipped file fails; "fixing" a file by DELETING the attribute fails
 * too, which is important because that would break Farsi rendering outright.
 *
 * jsdom cannot evaluate any of this — it resolves no `dir=auto` and computes no
 * `text-align` — so this reads the source instead, and the owner's device check
 * (ac-6) is what proves the rendering. This test proves COMPLETENESS.
 */

/**
 * Every page and shared component, as source text. Read through Vite's raw
 * loader rather than node:fs: `src` is compiled without node types, and a glob
 * means a NEW file is swept in automatically rather than needing to be
 * remembered.
 */
const under = (dir: string, modules: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(modules).map(([path, source]) => [`${dir}/${path.split('/').pop()}`, source as string]),
  );

const SOURCES: Record<string, string> = {
  ...under('pages', import.meta.glob('../pages/*.tsx', { query: '?raw', import: 'default', eager: true })),
  ...under('components', import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true })),
};

/** Classes that mark an element as a TITLE — direction may not sit on these. */
const TITLE_CLASSES = ['truncate', 'title-md', 'page-title', 'stage-unit-title'];

/** Native controls own their own text; direction on them is a FIELD, not a group. */
const FIELD_TAGS = ['input', 'textarea', 'select'];

/**
 * Every surface that renders user-authored text and must therefore carry
 * direction on at least one group. Recorded here (and in AGENTS.md) so the next
 * lane inherits the list rather than re-deriving it.
 */
const SURFACES = [
  'pages/Today.tsx',
  'pages/StartBlock.tsx',
  'pages/ActiveBlock.tsx',
  'pages/CloseBlock.tsx',
  'pages/Repertoire.tsx',
  'pages/ItemDetail.tsx',
  'pages/Lessons.tsx',
  'pages/PathwayDetail.tsx',
  'pages/StageDetail.tsx',
  'pages/SessionPlan.tsx',
  'pages/RoutineRunner.tsx',
  'pages/Materials.tsx',
  'pages/Insights.tsx',
  'pages/TeacherReport.tsx',
  'components/ItemCard.tsx',
  'components/ItemMaterial.tsx',
  'components/ClassQuestions.tsx',
  'components/Attachments.tsx',
];

/**
 * Titles that genuinely have no group to join, listed so the exception is
 * VISIBLE to a reviewer rather than silently left behind. Each entry must still
 * match a real site — a stale entry fails the test below.
 */
const ALLOWED_TITLE_SITES: { file: string; snippet: string; why: string }[] = [
  // EMPTY, and that is the finding: every title on every surface turned out to
  // have a group it could join — the catalogue row's own text column, the row a
  // lone title shares with its badge, or a wrapper drawn around the title and
  // the caption beneath it. An entry here would be a title the sweep could not
  // reach; the list is kept (and asserted below) so the next one is visible
  // rather than silent.
];

/**
 * Genuine exceptions to `unexemptedPhrase`'s 2+-token rule, visible for the
 * same reason `ALLOWED_TITLE_SITES` is: a stale entry (its `tagSnippet` no
 * longer found on the named group) fails the test below, so an exception
 * can't quietly outlive the code it was written for. Both entries here are
 * TWO+ opaque data expressions that read as a single compound VALUE, not a
 * title split from a foreign caption — the shape this whole family exists to
 * catch:
 * - `{sp.done}/{sp.total}` (PathwayDetail's stage progress) is a numeric
 *   counter ("3/5") — digits carry no bidi risk on their own, unlike an
 *   English WORD dropped into an RTL run.
 * - `` `${pathway.name} — ` `` followed by `{stage.code}` (ItemDetail's
 *   breadcrumb) is one continuous "Pathway — Stage" label built from two
 *   fields, exactly the same kind of compound anchor a lone title already
 *   forms with the badge it sits next to elsewhere in this file — there is
 *   no separate "caption" here to have its own opinion about direction.
 */
const UNEXEMPTED_PHRASE_ALLOWLIST: { file: string; tagSnippet: string; why: string }[] = [
  {
    file: 'pages/PathwayDetail.tsx',
    tagSnippet: '<button className="grow" dir="auto"',
    why: '{sp.done}/{sp.total} is a numeric progress counter, not English words',
  },
  {
    file: 'pages/ItemDetail.tsx',
    tagSnippet: 'stage.pathwayId',
    why: 'pathway name + stage code is one compound breadcrumb label, not a title plus a foreign caption',
  },
];

/**
 * Every group-level `dir="auto"` site, recorded in source order — duplicates
 * included, because three bare `<div dir="auto">` in the same file (Today.tsx
 * has several) are three separate SITES, not one collapsed entry. This is
 * what "every listed surface has A group" (below) cannot see: a file keeps
 * passing that check as long as ONE of its groups survives, so deleting the
 * Practise-now card's own `dir="auto"` — the exact regression a rejected
 * review found — left Today.tsx's other, unrelated groups to vouch for it.
 * Comparing the WHOLE ordered inventory instead means removing any one of
 * these sites — anywhere in any file — shrinks or reorders the array and
 * fails here, whether or not that file has other groups left.
 *
 * Same visibility contract as ALLOWED_TITLE_SITES: this is a recorded ledger,
 * not a derivation, so a legitimate new group site must be added here (the
 * "keeps every recorded group site current" test below fails until it is),
 * exactly as a title exception must be added to the allowlist above.
 */
const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string }[] = [
  { file: 'components/Attachments.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'components/ClassQuestions.tsx', tagName: 'li', classValue: 'row' },
  { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'small' },
  { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'tiny faint' },
  { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'tiny faint' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemCard.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'eyebrow' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/CloseBlock.tsx', tagName: 'div', classValue: 'eyebrow' },
  { file: 'pages/CloseBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/Insights.tsx', tagName: 'th', classValue: 'dim' },
  { file: 'pages/Insights.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: 'list-row' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: 'dim' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/Lessons.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'tiny dim' },
  { file: 'pages/Lessons.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Materials.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Materials.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'p', classValue: 'page-sub' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'card card-quiet small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'link', classValue: 'row between small card-link' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'tiny faint' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: 'card card-quiet row between small' },
  { file: 'pages/StageDetail.tsx', tagName: 'button', classValue: 'stage-unit-text' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StartBlock.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/TeacherReport.tsx', tagName: 'pre', classValue: 'pre' },
  { file: 'pages/Today.tsx', tagName: 'button', classValue: "`option${!overview && selected?.id === i.id ? ' selected' : ''}`" },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
];

// --- reading the source -----------------------------------------------------

function sourceFiles(): string[] {
  return Object.keys(SOURCES).sort();
}

interface Site {
  file: string;
  line: number;
  tagName: string;
  classValue: string;
  text: string;
  at: number;
}

/** The opening tag that an index sits inside, brace- and quote-aware. */
function enclosingTag(src: string, at: number): string {
  const start = src.lastIndexOf('<', at);
  let depth = 0;
  let i = start + 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1);
      if (end < 0) break;
      i = end;
    } else if (c === '>' && depth === 0) break;
    i += 1;
  }
  return src.slice(start, i + 1);
}

/** The raw text of a tag's className attribute (string or expression). */
function classNameOf(tag: string): string {
  const at = tag.indexOf('className=');
  if (at < 0) return '';
  const from = at + 'className='.length;
  const opener = tag[from];
  if (opener === '"' || opener === "'") {
    const end = tag.indexOf(opener, from + 1);
    return end < 0 ? tag.slice(from + 1) : tag.slice(from + 1, end);
  }
  if (opener !== '{') return '';
  let depth = 0;
  for (let i = from; i < tag.length; i += 1) {
    if (tag[i] === '{') depth += 1;
    else if (tag[i] === '}') {
      depth -= 1;
      if (depth === 0) return tag.slice(from + 1, i);
    }
  }
  return tag.slice(from + 1);
}

/**
 * Blank out `//` and `/* *\/` comments before scanning — a prose comment that
 * mentions `dir="auto"` (this file is full of them, and rightly so) is not an
 * attribute, and matching it anyway produces a phantom site: at best one with
 * no enclosing tag, at worst `enclosingTag` walking backward out of the
 * comment and mis-picking an unrelated real tag from earlier in the file.
 * String and template literals are copied through verbatim — that is where a
 * REAL `dir="auto"` attribute value lives — and every character removed is
 * replaced with a space (newlines kept as newlines) so line numbers and
 * offsets into the rest of the source are unaffected.
 *
 * A `'`/`"` is treated as a real string delimiter only if its MATCHING quote
 * shows up before the next newline. A genuine JS string/JSX attribute value
 * in this codebase is always single-line, so this is a safe bound — and it
 * is a NECESSARY one: plain JSX text containing an apostrophe ("That stage
 * doesn't exist.") is not a string at all, and treating it as one made the
 * scanner consume every real comment and tag after it — including this
 * file's OWN prose, once a comment happened to quote `dir="ltr"` inside that
 * unterminated span — as literal, unstripped text. A backtick template
 * literal has no such single-line guarantee in general (this codebase's
 * few multi-line ones are template literals), so it keeps the unbounded
 * scan.
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === '//') {
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i += 1;
      }
    } else if (two === '/*') {
      out += '  ';
      i += 2;
      while (i < src.length && src.slice(i, i + 2) !== '*/') {
        out += src[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out += '  ';
      i += 2;
    } else if (src[i] === '"' || src[i] === "'") {
      const quote = src[i];
      const lineEnd = src.indexOf('\n', i + 1);
      const searchEnd = lineEnd < 0 ? src.length : lineEnd;
      const close = src.indexOf(quote, i + 1);
      if (close < 0 || close > searchEnd) {
        // No same-line match — an apostrophe/quote in plain text, not a
        // real string. Pass it through and keep scanning normally right
        // after it, so a later quote on the same or a later line gets its
        // own fresh (and likely correct) chance to pair up.
        out += src[i];
        i += 1;
        continue;
      }
      out += quote;
      i += 1;
      while (i < close) {
        if (src[i] === '\\' && i + 1 < close) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      out += src[i];
      i += 1;
    } else if (src[i] === '`') {
      const quote = src[i];
      out += quote;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < src.length) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      if (i < src.length) {
        out += src[i];
        i += 1;
      }
    } else {
      out += src[i];
      i += 1;
    }
  }
  return out;
}

function directionSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="auto"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
      at,
    });
  }
  return sites;
}

const isTitle = (site: Site) => TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(site.classValue));
const isField = (site: Site) => FIELD_TAGS.includes(site.tagName);
const isGroup = (site: Site) => !isTitle(site) && !isField(site);

const allowed = (site: Site) =>
  ALLOWED_TITLE_SITES.some((e) => e.file === site.file && site.text.includes(e.snippet));

// --- mixed-content groups: a child's OWN bidi base, not just the group's ---
//
// A rejected review found that the inventory above proves a GROUP carries
// direction, but nothing proved that a fixed English sentence or an
// independently-authored value sitting INSIDE that group has a bidi base of
// its own. A Farsi title makes the whole group resolve RTL; anything else in
// that subtree with no `dir` of its own is exposed to that same RTL base —
// which is exactly right for a caption that belongs to the title (that is
// the whole point of grouping), but wrong for fixed page copy or a separately
// authored value that could be a different script entirely.
//
// This can't be reduced to "no bare Latin text in a group": a short fixed
// label immediately followed by its own isolate — `Constraint: ` before
// `<span dir="auto">{value}</span>`, the established shape ActiveBlock set —
// is deliberately left bare, and flagging it would force changes to an
// already-correct, already-reviewed pattern. What actually breaks is a real
// PHRASE (2+ words) that reaches the end of the group with nothing to isolate
// it: `unexemptedPhrase` walks a group's body in source order, accumulating
// exposed literal text (skipping `{…}` expressions, whose content is opaque
// from source) into a run, and clears that run the moment it is immediately
// followed by an element carrying its own `dir=` — the run is exempted
// regardless of length, because whatever risk existed is now the isolate's
// to own. Only a run that survives to the end of the group's body, and that
// reads as a real phrase, is flagged.

/**
 * The element's body span: from just after its own opening tag's `>` to just
 * after its matching closing tag (empty for a self-closing tag). Depth
 * tracking is generic — any opened tag increases it, any closed tag
 * decreases it — since well-formed JSX nests properly regardless of name.
 *
 * A React Fragment shorthand (`<>…</>`) is EVERY bit as much an opening/
 * closing pair as a named tag, and must be counted as one: `</>` starts with
 * `/` so the CLOSING branch below already matched it (correctly decrementing
 * depth), but `<>` starts with neither `/` nor a letter, so it fell through
 * unmatched and never incremented depth. Every `<>…</>` pair inside a body
 * therefore decremented depth ONE MORE TIME than it was ever incremented —
 * on a group whose conditional content used a fragment (`{cond && (<>…
 * </>)}`, the shape `{stage && (<><span>…</span><Link>…</Link></>)}` already
 * uses in this codebase), depth hit zero several tags before the group's
 * REAL close, silently truncating the body `unexemptedPhrase` scans and
 * hiding every violation after that point — exactly the kind of gap a
 * "detectable, not enumerated" claim must not have.
 */
function elementBody(src: string, tag: string, openAt: number): { start: number; end: number } {
  const start = openAt + tag.length;
  if (tag.endsWith('/>')) return { start, end: start };
  let depth = 1;
  let i = start;
  while (i < src.length && depth > 0) {
    if (src[i] === '<') {
      if (src[i + 1] === '/') {
        const close = src.indexOf('>', i);
        i = close < 0 ? src.length : close + 1;
        depth -= 1;
        continue;
      }
      if (src[i + 1] === '>') {
        // Fragment shorthand open, <>. Its close, </>, is matched by the
        // ordinary closing-tag branch above, so this one must increment.
        i += 2;
        depth += 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const inner = enclosingTag(src, i);
        i += inner.length;
        if (!inner.endsWith('/>')) depth += 1;
        continue;
      }
    }
    i += 1;
  }
  return { start, end: i };
}

/**
 * The first exposed, unexempted 2+-token run in a group's body, or null when
 * everything either belongs to an isolate or never accumulates a real phrase.
 * See the block comment above for what "exempted" means.
 *
 * A DATA expression (`{item.title}`, `{ITEM_TYPE_LABELS[item.itemType]}`,
 * `{formatBytes(a.size)}`) counts as ONE opaque token — its actual rendered
 * text is invisible from source, but its mere PRESENCE, unisolated, next to
 * other content is exactly the shape a rejected review found live in the
 * app: `{MATERIAL_SOURCE_LABELS[...]} · {MATERIAL_STATUS_LABELS[...]} ·{' '}
 * {itemCount(...)} item{...}` reads as zero words to a scanner that only
 * counts literal text, yet renders three always-English fragments in a row.
 * Treating each such expression as a token turns that invisible run into a
 * 3+-token hit without ever needing to know what the labels actually say.
 * An expression that contains its own nested JSX (`{cond && <div dir="auto">
 * …</div>}`) is left fully opaque (zero contribution) as before — its
 * children are independent elements, already reachable by the outer scan
 * over the whole file, and forcing them through this same linear buffer
 * would require a real JSX parser this file deliberately doesn't have.
 */
function unexemptedPhrase(src: string, bodyStart: number, bodyEnd: number): string | null {
  let buffer = '';
  // A run is judged at each TAG boundary (open or close) — two adjacent but
  // unrelated elements (e.g. two one-word buttons, "Edit" and "Delete") must
  // never concatenate into a false 2-word phrase. An EXPRESSION boundary does
  // NOT judge the run: `{n} segments · {m} min` is one generated phrase split
  // across two expressions, and judging at each `{` would fragment it into
  // single, individually-innocent words, hiding the real violation.
  const flush = (): string | null => {
    const words = buffer.trim().match(/[A-Za-z]+/g) ?? [];
    buffer = '';
    return words.length >= 2 ? words.join(' ') : null;
  };
  let i = bodyStart;
  while (i < bodyEnd) {
    const c = src[i];
    if (c === '{') {
      const exprStart = i + 1;
      let depth = 1;
      i += 1;
      while (i < bodyEnd && depth > 0) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') depth -= 1;
        i += 1;
      }
      const exprText = src.slice(exprStart, i - 1);
      if (!/<[A-Za-z]/.test(exprText)) buffer += ' X ';
      continue;
    }
    if (c === '<') {
      if (src[i + 1] === '/') {
        const hit = flush();
        if (hit) return hit;
        const close = src.indexOf('>', i);
        i = close < 0 ? bodyEnd : close + 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const hit = flush();
        if (hit) return hit;
        const tag = enclosingTag(src, i);
        if (/\sdir="(auto|ltr|rtl)"/.test(tag)) {
          const body = elementBody(src, tag, i);
          i = body.end; // exempted: leads into its own isolate, whatever its length
        } else {
          i += tag.length; // transparent: its children are scanned in the same pass
        }
        continue;
      }
    }
    buffer += c;
    i += 1;
  }
  return flush();
}

/**
 * Independently-authored values (case ii: a question, a note, an observation
 * — content whose own language cannot be assumed from the title next to it)
 * that carry their own `dir=` isolate, so they resolve from their OWN content
 * rather than the group's. Unlike the fixed-copy phrases above, these are
 * plain expressions (`{q.currentProblem}`, `{pathway.note}`) — their value is
 * opaque from source, so completeness here is a recorded ledger, not a
 * derivation, exactly like ALLOWED_TITLE_SITES and GROUP_SITE_INVENTORY: a
 * legitimate new one must be added, visibly, rather than left silent.
 */
const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{active.constraint}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{previousNextAction}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{problem}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<p className="page-sub" dir="auto">' },
  { file: 'pages/PathwayDetail.tsx', snippet: 'card-quiet small dim" dir="auto" style={{ marginTop: 4 }}' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="auto">{pathway.source}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<div className="tiny faint" dir="auto">' },
  { file: 'pages/RoutineRunner.tsx', snippet: 'Next: <span dir="auto">{next.label}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.form}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.composer}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.gusheh}</span>' },
  {
    file: 'components/ClassQuestions.tsx',
    snippet: '<div className="tiny faint" dir="auto">\n                      {renderFreeText(q.currentProblem)}',
  },
  {
    file: 'components/ClassQuestions.tsx',
    snippet: '<div className="tiny faint" dir="auto">\n                      {renderFreeText(q.lastObservation)}',
  },
  // Instrument names used to be tracked here too, one exact snippet per site.
  // A sealed review found that shape structurally insufficient FOUR times
  // running: each rework closed only the sites a reviewer had named, while
  // aliases, property access and names fused into template strings kept
  // slipping through undetected. Instrument names are now covered by a
  // dedicated, pattern-driven check below ('an instrument name resolves its
  // own direction wherever it renders') that discovers every renderer of the
  // name mechanically instead of requiring each one to be re-listed here —
  // see that check for the full rationale.
  //
  // ClassQuestions' Problem:/Last time: rows used to be tracked here too, as
  // a value wrapped in its own isolate span. A SEVENTH SEALED FINDING moved
  // them to a "label-first auto row" shape (row carries dir="auto", label
  // isolated dir="ltr" to take it out of the hunt, value left bare) covered
  // by the dedicated shape check below instead of a snippet ledger. A TENTH
  // finding found THAT shape puts the label at the wrong visual end whenever
  // the row resolves RTL: isolating the label makes it an atomic run the
  // bidi algorithm is free to reorder, so its trailing colon landed on the
  // outer edge, detached from the value. The fix stacks caption over value
  // instead of one inline line, which removes the single line the two ever
  // had to contend a resolution source for — so the value is back to being a
  // plain isolated value, tracked in ISOLATED_VALUE_SITES below, and the
  // caption is back to being an ordinary LTR_ISOLATE_SITES entry.
  //
  // ClassQuestions' q.question used to be tracked here too, isolated with
  // its own dir="auto" span while the title was left bare to anchor the
  // <li>. An OWNER-observed regression found that backwards: the title is
  // optional and independently authored, so anchoring the li on it split
  // the ordinal from the question whenever the two differed in language.
  // The roles are now reversed — title isolated, question bare — which
  // makes the title's new dir="auto" a plain GROUP_SITE_INVENTORY entry
  // (same tag/class as the old question entry, so that ledger needs no
  // edit) rather than a value-ledger one, and adds a dedicated shape check
  // below ('the question anchors the group's direction...') asserting the
  // anchor is the question, not the title.
];

/**
 * Fixed English copy or generated metadata (case i: `buildReason`,
 * `relativeDay`, a hardcoded sentence) that is ALWAYS English by
 * construction, wrapped in its own `dir="ltr"` isolate so a Farsi title's RTL
 * base can't drag its trailing punctuation to the visual start. Recorded for
 * the same reason as ISOLATED_VALUE_SITES: a call like `StaleNote` renders
 * from a different function than its call site, so no source scan at the
 * call site can see whether its OWN return value is isolated.
 */
const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{recs.best.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{rec.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: 'due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">Running far past its target' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> routine running ▸</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> plan running ▸</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  {
    file: 'pages/Today.tsx',
    snippet: '<span dir="ltr">\n                        {recs.best ? `next: ${recs.best.score.item.title}`',
  },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{next.reason}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">Study source: </span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">\n                  {a.kind} · {formatBytes(a.size)}' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">difficulty {item.difficulty}/5</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>' },
  { file: 'pages/SessionPlan.tsx', snippet: '<span dir="ltr">{seg.reason}</span>' },
  { file: 'pages/CloseBlock.tsx', snippet: '<span dir="ltr">A few seconds to capture what happened.</span>' },
  { file: 'pages/StageDetail.tsx', snippet: '<span className="truncate" dir="ltr">' },
  { file: 'pages/StageDetail.tsx', snippet: '{routine.segments.length} segments · {total} min{bound' },
  { file: 'pages/StageDetail.tsx', snippet: '<span dir="ltr">{meta.join(\' · \')}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span className=\"badge tone-progress\" dir=\"ltr\">{isPinned ? 'Current · pinned' : 'Current'}</span>" },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="badge tone-good" dir="ltr">Done</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span dir=\"ltr\">{sp.total} piece{sp.total === 1 ? '' : 's'}</span>" },
  { file: 'pages/Lessons.tsx', snippet: '<span className="badge tone-progress" dir="ltr">' },
  { file: 'pages/Lessons.tsx', snippet: '<span className="tiny faint" dir="ltr">no class planned</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{meta}</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Set your NAS base URL in' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Your NAS base URL isn’t a valid web address' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<span className="tiny faint" dir="ltr">{minutes} min</span>' },
  { file: 'pages/StartBlock.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/Insights.tsx', snippet: '<span dir="ltr">{insight.body}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{BLOCK_MODE_LABELS[active.mode]}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{FOCUS_LABELS[active.focus]}</span>' },
  {
    file: 'pages/Repertoire.tsx',
    snippet: '<span className="tiny faint" dir="ltr">\n              {g.works.length} work',
  },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="ltr">\n                {work.lastPractisedAt' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n            On your NAS' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n              On this device' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="ltr">Problem</span>' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="ltr">Last time</span>' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{FOCUS_LABELS[item.primaryFocus]}</span>' },
  { file: 'components/Attachments.tsx', snippet: '<span dir="ltr">\n            {att.kind} · {formatBytes(att.size)}' },
  {
    file: 'pages/Materials.tsx',
    snippet: '<span dir="ltr">\n                          {MATERIAL_SOURCE_LABELS[m.sourceType]}',
  },
];

// --- an isolate must be INLINE, never a block that resolves its own align --
//
// A rejected review found `ItemMaterial.tsx` fixing a Farsi title's detail
// line with `<div className="tiny faint" dir="ltr">…</div>` — a BLOCK
// carrying the isolate directly. `text-align: start`, inherited from the
// group, is a per-BOX computed value: it resolves against that box's OWN
// `direction`, not the group's. Give the block its own `dir="ltr"` and its
// `text-align: start` resolves LEFT regardless of the group's (possibly RTL)
// resolved direction — splitting the detail from a right-aligned Farsi title
// exactly as before, just relocated. An INLINE isolate (`<span dir="ltr">`)
// never has this problem: `text-align` is a block-level concept, so a span's
// own `dir` only isolates the Unicode bidi algorithm's treatment of the text
// inside it and never touches which edge the enclosing block aligns to. This
// is therefore not a location to enumerate but a SHAPE to ban outright: no
// `dir="ltr"`/`dir="rtl"` may ever sit on a tag other than `span`/`bdi`,
// full stop, so this class of bug cannot come back in any file, named here
// or not.
const INLINE_ISOLATE_TAGS = ['span', 'bdi'];

function isolateSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="(?:ltr|rtl)"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
      at,
    });
  }
  return sites;
}

// --- a native list marker is never relied on for a direction-variable item -
//
// A rejected review found `ClassQuestions.tsx`'s `<ol>` reserving gutter
// space with `paddingInlineStart` alone while its `<li>`s each resolve their
// OWN direction via `dir="auto"`, and the first fix reserved symmetric
// `paddingInline` instead, reasoning that a marker landing on either side
// would then have room. A SIXTH SEALED FINDING, checked on the owner's own
// iPhone, found the number still escaping the card even with that room
// reserved: an outside `::marker`'s exact position for a direction-variable
// list item is a browser implementation detail — exactly the class of thing
// jsdom cannot compute either, which is why a padding measurement was ever
// trusted to stand in for it — not a distance a gutter can be sized against.
// The fix stops accommodating the native marker and removes it instead
// (`listStyle: 'none'`), rendering the ordinal as a real element: the FIRST
// child of a flex `<li dir="auto">`, so flexbox's own direction-aware row
// axis (a spec-mandated behaviour, unlike marker positioning) puts it on the
// correct side and keeps it inside the content box by construction — it can
// no longer escape a card it is now genuinely inside of. This scans every
// `<ol>`/`<ul>` in the app (not just the one known today) and asserts the
// mechanism directly: a list containing a `dir="auto"` `<li>` must disable
// the native marker outright, and that `<li>` must itself be a flex/grid
// container able to reorder its own content — a shape check on the fix
// itself, not a measurement around a browser behaviour nothing here can
// verify.
function listSites(file: string): { file: string; line: number; tag: string; autoLiTags: string[] }[] {
  const src = stripComments(SOURCES[file]);
  const sites: { file: string; line: number; tag: string; autoLiTags: string[] }[] = [];
  for (const match of src.matchAll(/<(ol|ul)\b/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    if (tag.endsWith('/>')) continue;
    const body = elementBody(src, tag, at);
    const bodyText = src.slice(body.start, body.end);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tag,
      autoLiTags: [...bodyText.matchAll(/<li\b[^>]*\sdir="auto"[^>]*>/g)].map((m) => m[0]),
    });
  }
  return sites;
}

/** True when the list's own inline style disables the native marker outright
 *  (`listStyle`/`listStyleType: 'none'`) — the only thing about a marker's
 *  own rendered position a source scan can actually verify, unlike a
 *  padding measurement around a mechanism jsdom cannot compute either. */
function disablesNativeMarker(tag: string): boolean {
  const style = tag.match(/style=\{\{([^}]*)\}\}/)?.[1] ?? '';
  return /\blistStyle(?:Type)?\s*:\s*['"]none['"]/.test(style);
}

/** True when a `<li>` tag is itself a flex (or grid) container — the
 *  mechanism that lets its own content (an ordinal, a badge) reorder with
 *  its own resolved direction instead of depending on a static layout. */
function isDirectionAwareContainer(liTag: string): boolean {
  // `.row` is `display: flex` in global.css — this is a source scan trusting
  // a fact declared in a different file; renaming or redefining that class
  // would silently blind this check.
  if (/\bclassName="[^"]*\brow\b[^"]*"/.test(liTag)) return true;
  const style = liTag.match(/style=\{\{([^}]*)\}\}/)?.[1] ?? '';
  return /display\s*:\s*['"](?:flex|grid)['"]/.test(style);
}

// --- a row's alignment comes from its value, never a label marked out of the hunt ---
//
// A SEVENTH SEALED FINDING found `ClassQuestions.tsx`'s Problem:/Last time:
// rows still misaligned after the sixth rework: giving the VALUE its own
// `dir="auto"` isolate (or later, `display: inline-block`) makes the value's
// OWN characters shape correctly, but the ROW that positions "Label: value"
// as a unit was left bare, inheriting whichever direction the TITLE above it
// happened to resolve to — right for a Farsi title, left for an English one
// — regardless of what script the value itself was written in. An
// English-titled item with a Farsi problem note left the whole "Problem:
// ..." row pinned to the left, exactly where the label's own inherited
// direction put it, with the value's internal shaping correct but its
// POSITION wrong.
//
// The fix gives the ROW itself `dir="auto"`, and marks the LABEL —
// `Problem:`/`Last time:`, never the value — with its own `dir="ltr"`. This
// is not because the label's text ever changes; it is because `dir="auto"`
// skips a descendant that carries its own `dir` when hunting for a first
// strong character (the same mechanism the group-vs-title rule above relies
// on). Marking the label takes it OUT of that hunt, so the row's resolution
// comes from whatever is left — the value, left deliberately BARE. Marking
// the value too would take BOTH out, leaving the row with no candidate at
// all and a silent fallback to LTR no matter what the value says — the
// regression this check exists to catch. This is a SHAPE check, not a
// ClassQuestions-specific one: it fires on any file using the same
// label-first `dir="auto"` row pattern.
function isLabelFirstAutoRow(file: string, site: Site): boolean {
  const src = stripComments(SOURCES[file]);
  const openAt = src.lastIndexOf('<', site.at);
  const body = elementBody(src, site.text, openAt);
  return /^\s*<span[^>]*\sdir="ltr"[^>]*>[^<]*<\/span>/.test(src.slice(body.start, body.end));
}

// --- an instrument name resolves its own direction, wherever it renders ----
//
// Four consecutive sealed reviews rejected this family for the same root
// cause: every rework closed the handful of sites a reviewer had named by
// file:line, while the same defect kept resurfacing in a shape the fix
// hadn't covered — an alias, a property read, a name folded into a template
// string before anything could render. A location list can only ever be as
// complete as the audit that built it. This discovers every CURRENT
// renderer of an instrument's name mechanically, from the shapes this
// codebase actually uses to produce one, rather than requiring each to be
// re-listed by hand:
//   - the instrumentName(db, id) helper, called directly;
//   - a bare `.instrumentName` property read (a selector row's own field);
//   - a LOCAL ALIAS of either — a destructured, renamed prop
//     (`instrumentName: name`), or a `const X = instrumentName(...)`
//     binding — found by locating the alias's OWN declaration, then
//     scanning the rest of the file for bare reads of it;
//   - a direct `.name` read on an Instrument object bound by iterating
//     `db.instruments` (a `.map`/`.filter().map` callback's own parameter,
//     or an inline `instruments.find(...)?.name` with no variable at all).
// An instrument is renameable in Settings, Farsi included, so every one of
// these is the OWNER'S OWN editable text, never generated copy.
//
// The invariant asserted is the one BEHIND the fix, not the fix's own site
// list: a rendered instrument name resolves its OWN direction — nothing may
// fuse it into a plain string with other text before it renders, and its
// nearest enclosing `dir` (searching outward through real ancestors, never
// a neighbouring SIBLING) must be "auto", never absent and never forced to
// "ltr"/"rtl". A declaration/binding site (the alias's own introduction) is
// not itself a render and is excluded; so is a value forwarded as a JSX
// ATTRIBUTE (`instrumentName={x}`) — that is prop-drilling, not a DOM text
// render, and the component actually receiving it is checked wherever IT
// renders the value (ClassQuestions never does — it only builds
// clipboard/filename text with the prop, never a laid-out block).

/** Index of the `)` matching the `(` at `openAt`, skipping over the contents
 *  of any string/template so a stray bracket character inside one (none
 *  exist in the callbacks this scans today) can never desync the count. */
function matchingParenClose(src: string, openAt: number): number {
  let depth = 0;
  let i = openAt;
  while (i < src.length) {
    const c = src[i];
    if (c === '(') depth += 1;
    else if (c === ')') {
      depth -= 1;
      if (depth === 0) return i;
    } else if (c === '"' || c === "'" || c === '`') {
      const close = src.indexOf(c, i + 1);
      i = close < 0 ? src.length : close;
    }
    i += 1;
  }
  return src.length;
}

/** Walks back over a receiver chain (`db.instruments` → the start of `db`)
 *  so a declaration check lands on the true start of the expression, not
 *  wherever a matched sub-pattern happens to begin inside it. */
function receiverChainStart(src: string, at: number): number {
  let i = at;
  while (i > 0 && src[i - 1] === '.') {
    let k = i - 1;
    while (k > 0 && /[\w$]/.test(src[k - 1] ?? '')) k -= 1;
    if (k === i - 1) break; // a bare '.' with no identifier before it
    i = k;
  }
  return i;
}

/**
 * The tag name, dir value and own body-start offset of every element
 * enclosing position `at`, outermost first — the ANCESTOR chain, not just
 * the nearest opening tag. What resolves a name's direction is the nearest
 * ancestor carrying ANY dir at all, which is not necessarily the immediate
 * parent: ActiveBlock's/CloseBlock's eyebrow divs sit right next to (not
 * inside) the title's own dir="auto" group, so that group must never count
 * for them.
 */
function ancestorChain(src: string, at: number): { tagName: string; dir: string | null; bodyStart: number }[] {
  const stack: { tagName: string; dir: string | null; bodyStart: number }[] = [];
  let i = 0;
  while (i < at) {
    if (src[i] === '<') {
      if (src[i + 1] === '/') {
        const close = src.indexOf('>', i);
        i = close < 0 ? at : close + 1;
        stack.pop();
        continue;
      }
      if (src[i + 1] === '>') {
        stack.push({ tagName: '', dir: null, bodyStart: i + 2 }); // fragment shorthand, never carries dir
        i += 2;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const tag = enclosingTag(src, i);
        const tagEnd = i + tag.length;
        i = tagEnd;
        if (!tag.endsWith('/>')) {
          const dirMatch = /\sdir="(auto|ltr|rtl)"/.exec(tag);
          const nameMatch = /^<\s*([A-Za-z][\w.]*)/.exec(tag);
          stack.push({ tagName: (nameMatch?.[1] ?? '').toLowerCase(), dir: dirMatch ? dirMatch[1] : null, bodyStart: tagEnd });
        }
        continue;
      }
    }
    i += 1;
  }
  return stack;
}

/**
 * Whatever renders BEFORE position `at` inside a body that runs from
 * `bodyStart` to `at` — real sibling content only, opaque-but-present
 * markers ('X') standing in for anything whose actual text isn't visible
 * from source. Two things are deliberately NOT "preceding content":
 *   - A bare `{` that is the START of the very expression `at` sits inside
 *     (`<span dir="auto">{instrumentName(...)}</span>` has no sibling
 *     before the call, just the brace opening its own container) — this
 *     function stops (returns what it has so far) the moment it finds the
 *     `{…}` or `<tag>…</tag>` that CONTAINS `at`, rather than descending
 *     through it as if it were a finished sibling.
 *   - A ternary/logical-AND's UNTAKEN branch or its own condition text
 *     (`{cond ? instrumentName(db, x) : 'General'}`) — these sit inside
 *     the SAME expression as `at`, never as separate rendered siblings, so
 *     stopping at that expression's boundary (rather than treating its
 *     condition as literal preceding text) is what keeps this from
 *     flagging PathwayDetail's and Repertoire's `cond ? instrumentName(...)
 *     : 'General'` pattern as though "cond ? " had rendered first.
 * A COMPLETE prior `{…}` expression or `<tag>…</tag>` element (one that
 * closes before `at`) DOES count, opaquely — an item's own title rendered
 * in an earlier sibling div is real content even though this text scan
 * can't see what the title actually says.
 */
function contentBefore(src: string, bodyStart: number, at: number): string {
  let i = bodyStart;
  let out = '';
  while (i < at) {
    const c = src[i];
    if (c === '<' && /[A-Za-z]/.test(src[i + 1] ?? '')) {
      const tag = enclosingTag(src, i);
      if (tag.endsWith('/>')) {
        out += 'X'; // a self-closing element — opaque prior content
        i += tag.length;
        continue;
      }
      const body = elementBody(src, tag, i);
      if (body.end <= at) {
        out += 'X'; // this whole child closes before `at` — opaque prior content
        i = body.end;
      } else {
        return out + contentBefore(src, body.start, at); // `at` is inside this child — descend, don't skip it
      }
      continue;
    }
    if (c === '{') {
      const closeAt = matchingBraceClose(src, i);
      if (closeAt <= at) {
        out += 'X'; // a full sibling expression — opaque prior content
        i = closeAt + 1;
      } else {
        return out; // `at` is inside THIS expression — its own condition/branches never count
      }
      continue;
    }
    if (!/\s/.test(c)) out += c; // literal JSX text
    i += 1;
  }
  return out;
}

/**
 * Whether an occurrence at `at` resolves ITS OWN direction — the nearest
 * ancestor carrying any `dir` must be "auto", AND nothing else may render
 * before it within that SAME ancestor's body. A dir="auto" ancestor
 * resolves from whichever strong character comes FIRST in its subtree: if
 * an item's own title (or any other independently-authored value) precedes
 * the name inside the same auto ancestor, the ancestor's resolution belongs
 * to THAT value, not to the name riding along beside it — exactly the
 * classification mistake this whole family exists to catch (ItemCard's row
 * would silently regress this way if its instrument name ever lost its own
 * `<span dir="auto">` and merely sat inside the row's outer auto group).
 * Two real sites deliberately rely on being genuinely FIRST rather than
 * carrying their own isolate — Insights.tsx's `<th dir="auto">` and
 * Today.tsx's cross-instrument `{inst.name}` — and this still accepts both.
 */
function resolvesOwnDirection(src: string, at: number): { ok: boolean; dir: string | null } {
  const chain = ancestorChain(src, at);
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const entry = chain[i];
    if (entry.dir === null) continue;
    if (entry.dir !== 'auto') return { ok: false, dir: entry.dir };
    return { ok: contentBefore(src, entry.bodyStart, at).length === 0, dir: 'auto' };
  }
  return { ok: false, dir: null };
}

/** `<option>` contents are excluded from this whole family by the contract:
 *  the native control owns their rendering, so no dir treatment applies. */
function isInsideOption(src: string, at: number): boolean {
  return ancestorChain(src, at).some((a) => a.tagName === 'option');
}

/** Index just past the matching `}` for the `{` at `openAt`. */
function matchingBraceClose(src: string, openAt: number): number {
  let depth = 0;
  let i = openAt;
  while (i < src.length) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return src.length;
}

/**
 * True when `matchStart` sits inside a `${…}` template substitution whose
 * enclosing backtick template also holds OTHER literal text — the shape
 * that fuses a name with fixed words into one string before anything can
 * render, so no isolate can ever wrap the name alone by the time it
 * reaches JSX (`Nothing for ${name} yet`, `${instrumentName(db, x)} plan`).
 * A template holding ONLY the one substitution has nothing fused into it.
 */
function isFusedIntoTemplate(src: string, matchStart: number): boolean {
  if (src.slice(matchStart - 2, matchStart) !== '${') return false;
  const subClose = matchingBraceClose(src, matchStart - 1);
  const openBacktick = src.lastIndexOf('`', matchStart);
  const closeBacktick = src.indexOf('`', subClose);
  if (openBacktick < 0 || closeBacktick < 0) return true; // malformed — be conservative
  const body = src.slice(openBacktick + 1, closeBacktick).replace(/\$\{[^{}]*\}/g, '');
  return body.trim().length > 0;
}

/** Every current DOM-text render of an instrument's name in `file`, as
 *  [start, end) spans into the (comment-stripped) source. See the block
 *  comment above for the shapes discovered and excluded. */
function instrumentNameOccurrences(file: string): { at: number; end: number }[] {
  const src = stripComments(SOURCES[file]);
  const occurrences: { at: number; end: number }[] = [];

  const isAttributeValue = (at: number): boolean =>
    /[A-Za-z][\w-]*=\{\s*$/.test(src.slice(Math.max(0, at - 60), at));
  const isDeclarationRhs = (at: number): boolean =>
    /\b(?:const|let)\s+\w+\s*=\s*$/.test(src.slice(Math.max(0, at - 80), at));
  const record = (at: number, end: number) => {
    if (isAttributeValue(at)) return; // prop-drilling — the callee is checked separately
    if (isInsideOption(src, at)) return; // native control owns its own rendering
    occurrences.push({ at, end });
  };

  // instrumentName(db, EXPR) — direct calls. A call bound to a const is an
  // alias, not itself a render; its later bare reads are tracked below.
  for (const m of src.matchAll(/\binstrumentName\(([^()]*)\)/g)) {
    if (isDeclarationRhs(m.index!)) continue;
    record(m.index!, m.index! + m[0].length);
  }

  // X.instrumentName — property reads, receiver chain included so a
  // declaration check lands before the whole expression, not mid-chain.
  // `m.index` is the dot itself, so first step back over the identifier
  // immediately before it (receiverChainStart expects to start AT an
  // identifier, not at a dot).
  for (const m of src.matchAll(/\.\s*instrumentName\b/g)) {
    let idStart = m.index!;
    while (idStart > 0 && /[\w$]/.test(src[idStart - 1] ?? '')) idStart -= 1;
    const start = receiverChainStart(src, idStart);
    if (isDeclarationRhs(start)) continue;
    record(start, m.index! + m[0].length);
  }

  // Local aliases: a destructured, renamed prop (excluding the type
  // annotation `instrumentName: string`, which reads identically), a
  // `const X = instrumentName(...)` binding, or a `const X =
  // …instruments….find(...)?.name` binding — the last generalised past the
  // literal spelling "instrumentName" so a differently-named local (or a
  // future one) is still caught.
  const aliases = new Set<string>();
  for (const m of src.matchAll(/\binstrumentName\s*:\s*(\w+)/g)) {
    if (m[1] !== 'string') aliases.add(m[1]);
  }
  for (const m of src.matchAll(/\b(?:const|let)\s+(\w+)\s*=\s*instrumentName\(/g)) {
    aliases.add(m[1]);
  }
  for (const m of src.matchAll(
    /\b(?:const|let)\s+(\w+)\s*=\s*[^;\n]*?\binstruments\b[^;\n]*?\.find\((?:[^()]|\([^()]*\))*\)\s*\??\.\s*name\b/g,
  )) {
    aliases.add(m[1]);
  }
  for (const alias of aliases) {
    for (const m of src.matchAll(new RegExp(`\\b${alias}\\b`, 'g'))) {
      const at = m.index!;
      const end = at + alias.length;
      const before = src.slice(Math.max(0, at - 20), at);
      const after = src.slice(end, end + 20);
      // A BARE alias is a standalone identifier — `.name` on some unrelated
      // object (`routine.name`, `selected.name`) merely ENDS in the same
      // letters and must never count just because a plain-text \b-bounded
      // scan can't tell "name" the alias from "name" the property name.
      if (before.endsWith('.')) continue;
      const isBindingLhs = /\b(?:const|let)\s+$/.test(before) && /^\s*=(?!=)/.test(after);
      const isRenameTarget = /\binstrumentName\s*:\s*$/.test(before);
      // `<ClassQuestions instrumentName={instrumentName} />` — the KEY is
      // this same word too (coincidentally, since the alias here happens to
      // be spelled "instrumentName"); it is the attribute's NAME, not a
      // value being read, and must not be confused with the VALUE right
      // after it, which `record`'s own isAttributeValue check still catches.
      const isAttributeName = /^\s*=\{/.test(after);
      if (isBindingLhs || isRenameTarget || isAttributeName) continue; // the alias's own introduction, not a read
      record(at, end);
    }
  }

  // A per-item `.name` read inside a `db.instruments`/`instruments` iteration
  // — `(?:\.\w+\([^()]*\))*` tolerates any number of chained hops
  // (`.filter(...).map(...)`) before the `.map(` that actually binds a
  // per-instrument callback parameter.
  for (const m of src.matchAll(
    /\binstruments\b(?:\s*\.\s*\w+\([^()]*\))*\s*\.\s*map\(\s*\(?\s*(\w+)\s*\)?\s*=>/g,
  )) {
    const param = m[1];
    const mapOpenParen = m.index! + m[0].lastIndexOf('map(') + 'map('.length - 1;
    const bodyStart = m.index! + m[0].length;
    const bodyEnd = matchingParenClose(src, mapOpenParen);
    const scope = src.slice(bodyStart, bodyEnd);
    for (const im of scope.matchAll(new RegExp(`\\b${param}\\.name\\b`, 'g'))) {
      record(bodyStart + im.index!, bodyStart + im.index! + im[0].length);
    }
  }

  // An inline `instruments.find(...)?.name` with no intermediate variable —
  // the whole expression is the render candidate. One already bound to a
  // `const` was tracked as an alias above instead. `(?:[^()]|\([^()]*\))*`
  // (not the plain `[^()]*` the .map( pattern above gets away with) is
  // needed here because .find's own callback is itself parenthesized —
  // `.find((i) => i.id === x)` nests one paren level that a no-parens-
  // allowed class can never get past.
  for (const m of src.matchAll(
    /\binstruments\b(?:\s*\.\s*\w+\([^()]*\))*\s*\.\s*find\((?:[^()]|\([^()]*\))*\)\s*\??\.\s*name\b/g,
  )) {
    const start = receiverChainStart(src, m.index!);
    if (isDeclarationRhs(start)) continue;
    record(start, m.index! + m[0].length);
  }

  return occurrences.sort((a, b) => a.at - b.at);
}

// --- the check --------------------------------------------------------------

describe('direction lives on the group', () => {
  it('direction lives on the group: no title element carries dir="auto", and every listed surface has one', () => {
    const all = sourceFiles().flatMap(directionSites);

    // (a) A title that still carries direction is a site the sweep missed: its
    //     own caption still aligns to the opposite edge.
    const onTitles = all
      .filter((s) => isTitle(s) && !allowed(s))
      .map((s) => `${s.file}:${s.line} — dir="auto" on a title (class "${s.classValue.trim()}")`);
    expect(onTitles).toEqual([]);

    // (b) A surface with no group at all is a whole file the sweep skipped —
    //     and deleting the attribute instead of moving it fails here too.
    const withoutGroup = SURFACES.filter(
      (file) => !all.some((s) => s.file === file && isGroup(s)),
    ).map((file) => `${file} — renders user text but carries direction on no group`);
    expect(withoutGroup).toEqual([]);
  });

  it('keeps every listed exception real, so the allowlist cannot rot', () => {
    const all = sourceFiles().flatMap(directionSites);
    for (const entry of ALLOWED_TITLE_SITES) {
      const hit = all.some((s) => s.file === entry.file && s.text.includes(entry.snippet) && isTitle(s));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.snippet})`).toBe(true);
    }
  });

  it('keeps every recorded group site current — removing any ONE of them fails, even when its file has others', () => {
    const inventory = sourceFiles()
      .flatMap(directionSites)
      .filter(isGroup)
      .map(({ file, tagName, classValue }) => ({ file, tagName, classValue }));
    expect(inventory).toEqual(GROUP_SITE_INVENTORY);
  });

  it('no fixed English phrase in a group inherits the title\'s bidi base unisolated', () => {
    const exempt = (file: string, tagText: string) =>
      UNEXEMPTED_PHRASE_ALLOWLIST.some((e) => e.file === file && tagText.includes(e.tagSnippet));
    const violations: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of directionSites(file).filter(isGroup)) {
        if (exempt(file, site.text)) continue;
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const phrase = unexemptedPhrase(src, body.start, body.end);
        if (phrase) violations.push(`${file}:${site.line} — "${phrase}" is exposed to the group's bidi base`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keeps every listed unexempted-phrase exception real, so it cannot rot', () => {
    for (const entry of UNEXEMPTED_PHRASE_ALLOWLIST) {
      const hit = sourceFiles()
        .filter((f) => f === entry.file)
        .flatMap(directionSites)
        .filter(isGroup)
        .some((s) => s.text.includes(entry.tagSnippet));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.tagSnippet})`).toBe(true);
    }
  });

  it('keeps every independently-authored value isolated from the group it sits in', () => {
    for (const entry of ISOLATED_VALUE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('keeps every fixed-English / generated-metadata site isolated from the group it sits in', () => {
    for (const entry of LTR_ISOLATE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('a bidi isolate is always inline (span/bdi), never a block that resolves its own alignment', () => {
    const violations = sourceFiles()
      .flatMap(isolateSites)
      .filter((s) => !INLINE_ISOLATE_TAGS.includes(s.tagName))
      .map((s) => `${s.file}:${s.line} — dir="ltr"/"rtl" on a <${s.tagName}>, not an inline span`);
    expect(violations).toEqual([]);
  });

  // A sealed review found FOUR sites forcing an instrument name — the OWNER'S
  // OWN editable text, never generated copy — under dir="ltr" as if it were
  // metadata like ITEM_TYPE_LABELS sitting next to it. Auditing the rest of
  // LTR_ISOLATE_SITES by hand found three more of the identical shape. A
  // location list closes only the sites that happened to exist today; this
  // bans the SHAPE, so a future dir="ltr"/"rtl" wrapped around an instrument
  // name fails here regardless of which file it turns up in. The pattern is
  // deliberately NOT anchored to a call — `\binstrumentName\(` alone missed
  // `{b.instrumentName}` (a property access, no call, no parenthesis) in the
  // very same audit that added this test — so it also matches a bare
  // `instrumentName` identifier, covering a property access and a value
  // passed through as a prop (e.g. `TeacherReport.tsx`'s local `instrumentName`
  // variable), not just a direct call.
  it('no dir="ltr"/"rtl" isolate wraps an instrument name', () => {
    const violations: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of isolateSites(file)) {
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const bodyText = src.slice(body.start, body.end);
        if (/\binstrumentName\b|\{inst\}/.test(bodyText)) {
          violations.push(`${file}:${site.line} — an instrument name sits inside a dir="ltr"/"rtl" isolate`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // See the block comment above `instrumentNameOccurrences` for the full
  // rationale and the shapes discovered. This supersedes the previous
  // approach of listing each fixed site's exact snippet in
  // ISOLATED_VALUE_SITES: that ledger could only ever vouch for sites a
  // human had already found, and four rounds of rejection on this exact
  // family showed that was never enough. Two real sites deliberately keep
  // resolving from an ANCESTOR rather than their own isolate — Insights.tsx's
  // `<th dir="auto">` and Today.tsx's cross-instrument `{inst.name}` — and
  // this check accepts that (it asks about the name's own resolved
  // direction, not the shape of the markup around it); wrapping either in a
  // nested isolate later would silently regress the GROUP's own resolution
  // instead (dir="auto" skips a descendant that carries its own dir when
  // hunting for a first strong character), which is caught separately by
  // `GROUP_SITE_INVENTORY`'s exhaustive equality against any new dir="auto"
  // site, not by this check.
  //
  // Excluded: ItemForm.tsx, QuickAdd.tsx and RoutineEdit.tsx, the three
  // files this lane's own contract puts out of scope ("their dir='auto'
  // usage is already correct and must not be touched"). That claim turned
  // out to be wrong for one of them — QuickAdd.tsx's instrument-picker
  // button renders `{i.name}` with no dir anywhere — but fixing it means
  // editing a forbidden file, so it is named here and in AGENTS.md instead
  // of silently passing OR silently failing a check this lane cannot act on.
  const OUT_OF_SCOPE_FOR_THIS_LANE = ['components/ItemForm.tsx', 'components/QuickAdd.tsx', 'pages/RoutineEdit.tsx'];
  it('an instrument name resolves its own direction, wherever it renders', () => {
    const violations: string[] = [];
    let sitesSeen = 0;
    for (const file of sourceFiles().filter((f) => !OUT_OF_SCOPE_FOR_THIS_LANE.includes(f))) {
      const src = stripComments(SOURCES[file]);
      const occurrences = instrumentNameOccurrences(file);
      sitesSeen += occurrences.length;
      for (const { at, end } of occurrences) {
        if (isFusedIntoTemplate(src, at)) {
          const line = src.slice(0, at).split('\n').length;
          violations.push(`${file}:${line} — an instrument name is fused into a template string before it renders`);
          continue;
        }
        const { ok, dir } = resolvesOwnDirection(src, at);
        if (!ok) {
          const line = src.slice(0, at).split('\n').length;
          const found =
            dir === null
              ? 'no dir="" ancestor at all'
              : dir === 'auto'
                ? 'a dir="auto" ancestor whose resolution is already claimed by something preceding it'
                : `an ancestor forces dir="${dir}"`;
          violations.push(`${file}:${line} — "${src.slice(at, end)}" resolves its direction from ${found}`);
        }
      }
    }
    expect(violations).toEqual([]);
    // A scanner that silently finds nothing is not proof of nothing being
    // wrong — this fails if a regression in the discovery patterns above
    // ever made them stop matching entirely (every shape they cover is
    // exercised by real code in this app today).
    expect(sitesSeen).toBeGreaterThan(0);
  });

  it('a list with a direction-variable item never relies on the native marker, and lays that item out as a direction-aware flex container', () => {
    const violations: string[] = [];
    for (const site of sourceFiles().flatMap(listSites)) {
      if (site.autoLiTags.length === 0) continue;
      if (!disablesNativeMarker(site.tag)) {
        violations.push(`${site.file}:${site.line} — <ol>/<ul> relies on a native marker for an li whose direction can vary`);
      }
      for (const liTag of site.autoLiTags) {
        if (!isDirectionAwareContainer(liTag)) {
          violations.push(
            `${site.file}:${site.line} — a dir="auto" <li> isn't itself a flex/grid container, so its own content can't reorder with its direction`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it("a label-first auto row's value stays bare, so the row still has a direction to resolve from", () => {
    const violations: string[] = [];
    let rowsSeen = 0;
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of directionSites(file).filter(isGroup)) {
        if (!isLabelFirstAutoRow(file, site)) continue;
        rowsSeen += 1;
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const bodyText = src.slice(body.start, body.end);
        const afterLabel = bodyText.replace(/^\s*<span[^>]*\sdir="ltr"[^>]*>[^<]*<\/span>/, '');
        if (/\sdir="(?:auto|ltr|rtl)"/.test(afterLabel)) {
          violations.push(
            `${file}:${site.line} — the value in a label-first row carries its own dir, leaving the row with nothing left to resolve from`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
    // Same discipline as the instrument-name check above: a scanner that
    // silently matches nothing is not proof nothing needs checking.
    expect(rowsSeen).toBeGreaterThan(0);
  });

  // An OWNER-observed regression found ClassQuestions' <li dir="auto">
  // anchored on the wrong candidate: the title was left bare (leading the
  // hunt) while the question carried its own isolate — so an item whose
  // title and question differed in language put the ordinal on the
  // title's side while the question (the only field questionsForNextClass
  // actually guarantees is non-empty) resolved its own, different
  // direction and landed on the opposite edge, unattached from the
  // marker entirely. Matching-language seed data never exposed this: the
  // bug only shows when the two differ. Fixed by reversing which one is
  // bare — the question anchors the <li>, the title gets its own isolate
  // — and asserted directly here rather than trusting seed data again.
  it("the question anchors ClassQuestions' <li>, not the independently-authored title", () => {
    const file = 'components/ClassQuestions.tsx';
    const src = stripComments(SOURCES[file]);
    const liSite = directionSites(file).find((s) => s.tagName === 'li');
    expect(liSite, 'ClassQuestions\' <li dir="auto"> site not found').toBeTruthy();
    const openAt = src.lastIndexOf('<', liSite!.at);
    const body = elementBody(src, liSite!.text, openAt);
    const bodyText = src.slice(body.start, body.end);
    const smallDivs = [...bodyText.matchAll(/<div className="small"[^>]*>/g)].map((m) => m[0]);
    expect(smallDivs.length, 'expected a title div and a question div').toBeGreaterThanOrEqual(2);
    const [titleTag, questionTag] = smallDivs;
    expect(titleTag, 'the title must carry its own dir="auto" isolate, out of the <li>\'s hunt').toMatch(
      /\sdir="auto"/,
    );
    expect(questionTag, "the question must stay bare so the <li> resolves from it").not.toMatch(/\sdir=/);
  });
});
```

### src/components/format.test.ts

```
import { describe, expect, it } from 'vitest';
import { type BlockResult, createItem, planNextReview, REVIEW_TYPE_LABELS, type ReviewPlan } from '../domain';
import { relativeDay, reviewOverrideSurvivesResultChange, reviewSummaryLine, splitLines } from './format';

const NOW = new Date('2026-06-18T12:00:00.000Z');

const ALL_RESULTS: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

/**
 * The close screen collapses the whole scheduling decision to ONE line, with
 * the date field, the review type and "Why this date?" a tap behind it. That is
 * only safe if the line and the field are two renderings of the SAME value — so
 * this asserts the formatter REPORTS a plan rather than deriving anything of its
 * own. A formatter that recomputed a date could disagree with the field; one
 * that can only read the three fields it is handed cannot.
 */
describe('reviewSummaryLine', () => {
  it("the one-line review summary reports exactly the ReviewPlan's due date, type and rationale", () => {
    // A REAL plan from the engine — the same call CloseBlock makes — so this is
    // bound to the value the screen actually holds, not a hand-written stub.
    const item = createItem({ instrumentId: 'i', title: 'درآمد شور', status: 'fragile' }, NOW);
    const plan = planNextReview({ item, result: 'worse', now: NOW });
    expect(plan).not.toBeNull();

    const line = reviewSummaryLine(plan as ReviewPlan, NOW);

    expect(line).toContain(relativeDay(plan!.dueDate, NOW));
    expect(line).toContain(REVIEW_TYPE_LABELS[plan!.reviewType]);
    expect(line).toContain(plan!.rationale);

    // …and nothing else: the line is exactly those three fields, in order.
    expect(line).toBe(
      `Review ${relativeDay(plan!.dueDate, NOW)} · ${REVIEW_TYPE_LABELS[plan!.reviewType]} · ${plan!.rationale}`,
    );
  });

  it('follows the plan it is given, so a corrected date is the date it reports', () => {
    // The screen folds a manual correction INTO the one plan value rather than
    // keeping a second date beside it. Whatever ends up in that value is what
    // the line says — there is no path by which the line keeps the engine's
    // date while the field shows another.
    const engine: ReviewPlan = {
      intervalDays: 2,
      dueDate: '2026-06-20',
      reviewType: 'repair',
      changeStrategy: false,
      rationale: 'A slip resets the interval to 2 days.',
    };
    const corrected: ReviewPlan = { ...engine, dueDate: '2026-07-01', rationale: 'The date you chose.' };

    expect(reviewSummaryLine(engine, NOW)).toBe('Review in 2 days · Repair · A slip resets the interval to 2 days.');
    expect(reviewSummaryLine(corrected, NOW)).toBe('Review in 13 days · Repair · The date you chose.');
  });
});

/**
 * A manually chosen review date must survive changing the result WHEN NO
 * AUTOMATIC PLAN EXISTS — the rule the close screen used to keep before this
 * lane restructured it around a single `ReviewPlan`, and lost. The predicate
 * is bound to the actual engine here (not just asserted in prose): a
 * manual-mode item has no automatic plan for any of the six results, and an
 * auto-mode item has one for every one of them.
 */
describe('reviewOverrideSurvivesResultChange', () => {
  it('a manually chosen date survives changing the result when no automatic plan exists', () => {
    const manualItem = createItem(
      { instrumentId: 'i', title: 'درآمد شور', status: 'fragile', reviewMode: 'manual' },
      NOW,
    );
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: manualItem, result, now: NOW })).toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(manualItem.reviewMode)).toBe(true);

    const autoItem = createItem({ instrumentId: 'i', title: 'Étude', status: 'fragile' }, NOW);
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: autoItem, result, now: NOW })).not.toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(autoItem.reviewMode)).toBe(false);
  });
});

describe('splitLines', () => {
  it('splits a multi-line free-text field into its trimmed, non-empty lines', () => {
    expect(splitLines('سوال اول؟\nسوال دوم؟')).toEqual(['سوال اول؟', 'سوال دوم؟']);
  });

  it('keeps a single line as one entry, and drops blank lines and surrounding whitespace', () => {
    expect(splitLines('one question')).toEqual(['one question']);
    expect(splitLines('a\n\n  \nb\n')).toEqual(['a', 'b']);
    expect(splitLines('  padded  ')).toEqual(['padded']);
  });
});
```

### src/components/format.ts

```
import { dayDiff, parseISODate, REVIEW_TYPE_LABELS, type ReviewMode, type ReviewPlan } from '../domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTimeISO(iso: string): string {
  return formatShortDate(new Date(iso));
}

/** Friendly relative day from an ISODate (calendar) string. */
export function relativeDay(dateISO: string, now: Date = new Date()): string {
  const diff = dayDiff(now, parseISODate(dateISO)); // +future, -past
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 1) return `in ${diff} days`;
  return `${-diff} days ago`;
}

/** Friendly relative day from a full ISO datetime. */
export function relativeFromDateTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return 'never';
  const diff = dayDiff(new Date(iso), now); // days since
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A free-text field's own non-empty lines. There is no data structure for
 * "multiple questions" — `teacherQuestion`/`currentProblem`/`lastObservation`
 * are each one `<textarea>`, so two distinct questions typed for the same
 * item live as two lines of one string. This is how a renderer tells "one
 * line" (plain text) from "several" (worth a bulleted breakdown) apart,
 * without inventing a schema change for what is still one field.
 */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The close screen's ONE honest line for the review decision — "Review in 2
 * days · Repair · …" — read off the SAME ReviewPlan that seeds the date field
 * behind the disclosure.
 *
 * It is a pure FORMATTER, never a second derivation: it reports the plan's
 * three fields and computes no date of its own. That is what makes
 * r-explainable-scheduling's "the date shown before saving is exactly the date
 * saved" hold by construction on a screen where the decision is collapsed to a
 * line — a divergent date is unrepresentable, not merely remembered about.
 */
export function reviewSummaryLine(plan: ReviewPlan, now: Date = new Date()): string {
  return `Review ${relativeDay(plan.dueDate, now)} · ${REVIEW_TYPE_LABELS[plan.reviewType]} · ${plan.rationale}`;
}

/**
 * Whether a manual date correction on the close screen should survive
 * picking a different result. `computeReview` (and so `planNextReview`)
 * returns `null` for every result when an item's `reviewMode` is 'manual' —
 * there is no automatic plan for THIS judgement to replace, so a date the
 * owner already typed in isn't pinned to the previous result and must not be
 * cleared just because they picked a different one. `src/domain/**` is out of
 * scope for this lane, so this reads the item's own mode rather than calling
 * `planNextReview` a second time — CloseBlock keeps its single derivation.
 */
export function reviewOverrideSurvivesResultChange(reviewMode: ReviewMode | undefined): boolean {
  return reviewMode === 'manual';
}
```

## Check against the contract

- [ ] **ac-1** — REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment. _(proof: the one-line review summary reports exactly the ReviewPlan's due date, type and rationale)_
- [ ] **ac-4** — An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts. _(proof: every listed colour pair meets WCAG AA in every block where its tokens are declared)_
- [ ] **ac-5** — The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir="auto" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts. _(proof: direction lives on the group: no title element carries dir="auto", and every listed surface has one)_
- [ ] **ac-6** — On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device. _(proof: manual:OWNER)_
- [ ] **ac-7** — On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane. _(proof: manual:OWNER)_
- [ ] **ac-8** — The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx
- **clear-a-due-review** — touched via src/pages/Today.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/components/Attachments.tsx
- **point-this-device-at-the-nas** — touched via src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx
- **see-practice-patterns** — touched via src/pages/Insights.tsx, src/pages/Today.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **back-up-and-restore** — shares route "/settings" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/components/Attachments.tsx matched changed file(s) src/components/Attachments.tsx, src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/StartBlock.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx, src/pages/TeacherReport.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/SessionPlan.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Insights.tsx, src/pages/Today.tsx matched changed file(s) src/pages/Insights.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx matched changed file(s) src/pages/PathwayDetail.tsx, src/pages/RoutineRunner.tsx, src/pages/StageDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — unchanged

Settings.tsx is a forbidden path in this lane and was not touched; the only file these flows share with this diff is src/styles/global.css, where eight light and four dark colour tokens moved to clear WCAG AA. Nothing about exporting, importing or restoring an archive changed — no control, copy, route or store action differs.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, index.html, vite.config.ts and the service-worker registration are all forbidden paths in this lane and were not touched. The only shared file is src/styles/global.css, and only colour tokens moved there — the update banner, the build stamp and the install flow are byte-identical.

## sync-devices-via-github — unchanged

src/store/** and src/domain/** are forbidden in this lane and unchanged, so decideSync, the snapshot format, the conflict flow and the PAT handling are byte-identical. The only shared file is src/styles/global.css, where colour tokens moved for contrast; SyncNotice lives in Layout.tsx, also untouched.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260911-lay-practice-out-for-the-content-it-hold-4c24' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
