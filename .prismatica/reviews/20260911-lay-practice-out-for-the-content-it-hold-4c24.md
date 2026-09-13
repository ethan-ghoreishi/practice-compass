---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractId: 20260911-lay-practice-out-for-the-content-it-hold-4c24
patchId: 1c85fc6fb59ab1a22cac40bb123696586ae4fa69
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-09-13T14:22:09.282Z
sealedAt: 2026-09-13T18:01:08.256Z
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
- **Diff patch-id:** `1c85fc6fb59ab1a22cac40bb123696586ae4fa69`

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

- **r-direction-aware-text: complete direction-aware grouping and independently directed lines** — The direction family remains incomplete. Repertoire's PathwayCard still forces left alignment while rendering its user-authored pathway title without a direction-aware group, and the new multi-line renderer makes distinct bullet lines inherit one shared direction. The named guard does not cover either counterexample.
  _counterexample:_ Use a Farsi pathway name in Repertoire: the button at src/pages/Repertoire.tsx:452 has textAlign:'left', pathway.name at :456 has no dir ancestor, and the inline instrument isolate at :469 cannot change block alignment. Separately, enter a Farsi question followed by an English question on the next line: renderFreeText at src/components/ClassQuestions.tsx:87-101 gives neither inner li its own dir, so both bullets inherit the first line's RTL direction. direction.test.ts:1170 only requires one unrelated group per file, and format.test.ts checks splitting rather than rendered direction.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index e1a1c0c..ed2e3ab 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -1129,6 +1129,61 @@ existing inline `<span dir="ltr">` isolate (it was previously a bare, undirected
 but the embedded instrument name inside that generated sentence stays open pending a
 domain-layer fix and its own lane.
 
+**A RESOLVED DIRECTION THAT NEVER REACHES THE ALIGNMENT IS NOT A FIX, AND NEITHER IS ONE
+WITH NOTHING TO RESOLVE FROM.** A tenth sealed finding named two counterexamples, both in
+this same family, and both invisible to the guard as it stood.
+
+Repertoire's `PathwayCard` rendered a user-authored `pathway.name` inside
+`<button style={{ textAlign: 'left' }}>` with NO direction-resolving group between them. A
+Farsi pathway name shaped correctly — the browser's bidi algorithm needs no help for that —
+and then sat pinned to the English edge, split from its own instrument/stage caption
+underneath. The inline `<span dir="auto">` already on that caption could never have fixed
+it: `text-align` is a BLOCK concept, which is exactly why this file's own "an isolate must
+be INLINE" rule exists. The fix is ONE group carrying `dir="auto"` AND re-declaring
+`textAlign: 'start'`, sitting INSIDE the button (the Balance-row precedent — the chevron row
+and the progress bar are layout, not text). Either half alone leaves the name where it was:
+a group with no `start` resolves a direction the alignment never hears about, and a `start`
+with no group has no direction to resolve. The same shape, audited across the app, was live
+in two more places and fixed with it — Insights' `<th style={CELL} dir="auto">` (CELL pinned
+`textAlign: 'left'` over an instrument name the owner can rename to Farsi; it is `'start'`
+now) and RoutineRunner's "Recorded" rows under a card pinning `'left'`. `center` is
+deliberately NOT a forcing value: centred text points at no edge, so it cannot misalign an
+RTL run, and excluding it is also what keeps this rule from demanding an unrequested layout
+change on the deliberately centred practice screens.
+
+**EVERY LINE OF A MULTI-LINE FREE-TEXT FIELD RESOLVES ITS OWN DIRECTION — EXCEPT THE ONE
+THAT ANCHORS THE GROUP.** `ClassQuestions`' bulleted renderer for
+`teacherQuestion`/`currentProblem`/`lastObservation` (one `<textarea>` each, so several
+distinct questions live as several lines of one string; `splitLines` in `format.ts`, tested)
+first shipped with every bullet bare, on the argument that lines typed into one box in one
+sitting share one direction. They do not — a Farsi question and an English one go into the
+same field — and bare lines all inherit the FIRST line's direction, dragging an English line
+RTL with its bullet on the wrong side, or the reverse. But the catch that argument was right
+about is real, and is why this is not simply "isolate every line": `dir="auto"` skips any
+descendant carrying its own `dir`, and the enclosing `<li dir="auto">` (and the
+Problem/Last-time value wrapper) has nothing else left to hunt once the title is isolated —
+isolating every line would leave the item with no resolution source and a silent LTR
+fallback, which is the ninth finding all over again. Both hold ONE way only: the FIRST line
+is the ANCHOR and stays BARE — it still follows its own language, because the direction it
+inherits is the direction it produced — and every line AFTER it carries its own `dir="auto"`
+on the row, so that line's text and its bullet follow it alone. The two branches are written
+out LITERALLY (never `dir={i === 0 ? undefined : 'auto'}`): `direction.test.ts` is a source
+scanner, and a computed attribute is invisible to every guard in it.
+
+`direction.test.ts` holds both closed with checks that assert the invariants rather than the
+presence of a group somewhere in a file — which is what the finding correctly said ac-5's
+own check could never fail on. The first discovers every element carrying a title class
+whose body renders an opaque data expression, and, when anything above it forces
+`textAlign: 'left'`/`'right'` — inline OR through a module-level style constant it names,
+the shape the Insights counterexample was actually written in — requires a `dir="auto"`
+group below that forcing element which re-declares `textAlign: 'start'`; it also fails any
+`dir="auto"` group that pins a physical alignment on ITSELF. The second asserts the anchor
+shape directly: exactly one bare branch, exactly one `dir="auto"` branch, and the isolate on
+the branch chosen for lines AFTER the first. Seven mutations were confirmed to fail before
+either was committed. Verification used DELIBERATELY MISMATCHED languages in both directions
+against the real running pages — the lesson this file keeps relearning, applied before the
+fact this time rather than after.
+
 **SEARCH GOES THROUGH THE FARSI-AWARE MATCHER AT EVERY SURFACE.** The data is
 authored in Farsi, so `title.toLowerCase().includes(query)` is not a search — it is
 a filter that can never match what the owner's keyboard emits: an iOS Arabic keyboard
diff --git a/DECISIONS.md b/DECISIONS.md
index 183abdf..5867142 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -2,6 +2,81 @@
 
 Durable record of non-obvious choices. Newest first.
 
+## Tenth rejection: a resolved direction that never reaches the alignment, and lines that share one (2026-09-13)
+
+Two counterexamples, one family — and both were invisible to the guard, which is the third
+thing this entry fixes.
+
+**A user-authored title under a forced physical alignment.** Repertoire's `PathwayCard`
+rendered `pathway.name` inside `<button style={{ textAlign: 'left' }}>` with no
+direction-resolving group between them. The browser shaped a Farsi pathway name correctly
+(bidi needs no help for that) and then pinned it to the English edge, split from its own
+instrument/stage caption. The inline `<span dir="auto">` already on that caption could
+never have fixed it: `text-align` is a BLOCK concept, and this repo's own "an isolate must
+be inline" rule exists precisely because a `<span>` never participates in one. Fixed by
+wrapping the name and its caption in ONE `dir="auto"` group that also re-declares
+`textAlign: 'start'` — both halves, because either alone leaves the name where it was. The
+group sits INSIDE the button rather than on it (the Balance-row precedent: the progress bar
+and its counter below are layout, not text). Measured against the live page: before,
+the Farsi name occupied x 41–184 of a 1068px card; after, 884–1027, with its caption on the
+same edge. The English card is byte-identical in layout (`start` === `left` under LTR).
+
+Auditing the same shape across the app found two more real instances, fixed with it:
+Insights' per-instrument `<th style={CELL} dir="auto">{r.instrumentName}</th>`, where
+`CELL` pinned `textAlign: 'left'` over an instrument name the owner can rename to Farsi
+(CELL now uses `'start'`), and RoutineRunner's "Recorded" rows, whose `dir="auto"` row sat
+under a card pinning `'left'`. `center` is deliberately NOT treated as forcing: centred text
+points at no edge, so it cannot misalign an RTL run — which is also what keeps this from
+demanding an unrequested layout change on the deliberately centred practice screens.
+
+**Lines of one field that are not one language.** The bulleted multi-line renderer added
+for `teacherQuestion`/`currentProblem`/`lastObservation` left every bullet bare, arguing
+that lines typed into one box share one direction. They do not: a musician who types a
+Farsi question and an English one into the same field gets two lines whose languages
+genuinely differ, and bare lines all inherit the FIRST line's direction — an English line
+dragged RTL with its bullet on the wrong side, or the reverse.
+
+The catch that argument was right about is real, though, and is why this is not simply
+"isolate every line": `dir="auto"` skips any descendant carrying its own `dir`, and the
+enclosing `<li dir="auto">` (and the Problem/Last-time value wrapper) has nothing else left
+to hunt, since the Ninth rejection above already isolated the title. Isolating every line
+would leave the whole item with no resolution source and a silent LTR fallback — the Ninth
+rejection, back again. Both hold one way only: the FIRST line is the ANCHOR and stays bare
+(it still follows its own language, because the direction it inherits is the one it
+produced), and every line AFTER it carries its own `dir="auto"` on the row, so its text and
+its bullet both follow that line alone. The two branches are written out literally rather
+than as `dir={i === 0 ? undefined : 'auto'}`, because `direction.test.ts` is a source
+scanner and a computed attribute is invisible to every guard in it.
+
+Verified against the real running Teacher Report page with DELIBERATELY MISMATCHED data in
+both directions (Farsi question line followed by an English one, and the reverse; an English
+item title over a Farsi question, and the reverse), at a 350px forced width: each bullet's
+computed `direction` and its bullet dot's measured x-position follow that line alone, while
+the item's ordinal still tracks the question's first line. In the Farsi-titled item, the
+bare Farsi first line computes `rtl` with its dot at x 327–333 (the right edge) and the
+isolated English second line computes `ltr` with its dot at 0–6; in the English-titled item
+the mirror holds — bare English line `ltr`, dot at 19–25, isolated Farsi line `rtl`, dot at
+344–350 — with the ordinal at 0–11 rather than 341–350. The `direction.test.ts` checks are
+shape checks over the source, so these measured figures are the only evidence that what the
+shape encodes actually renders; the discovery set behind the alignment check spans four
+files (Repertoire ×2, RoutineRunner, StartBlock, Today), not the counterexample's own file
+alone, so it cannot pass by having quietly emptied.
+
+**The guard.** The sealed finding was right that the existing ac-5 check only required one
+direction-aware group SOMEWHERE per file, which neither counterexample could fail.
+`direction.test.ts` adds two checks that assert the invariants themselves. The first
+discovers, mechanically, every element carrying a title class whose body renders an opaque
+data expression, and — when anything above it forces `textAlign: 'left'`/`'right'`, inline
+OR through a module-level style constant it names (which is how the Insights counterexample
+was written) — requires a `dir="auto"` group below that forcing element which re-declares
+`textAlign: 'start'`; it also fails any `dir="auto"` group that pins a physical alignment on
+itself. The second asserts the anchor shape of the multi-line renderer: exactly one bare
+line branch, exactly one `dir="auto"` branch, and the isolate on the branch chosen for lines
+AFTER the first. Seven mutations were confirmed to fail the suite before this was committed
+— dropping the group's `textAlign: 'start'`, dropping its `dir`, making both bullets bare,
+making both bullets isolated, moving the anchor to the last line, reverting `CELL` to
+`'left'`, and dropping RoutineRunner's `'start'`.
+
 ## Ninth rejection: the `<li>` anchored on the optional title, not the guaranteed question (2026-09-13)
 
 The Eighth review below concluded no further structural change was needed, using seed data
diff --git a/src/components/ClassQuestions.tsx b/src/components/ClassQuestions.tsx
index dae648d..54bbf56 100644
--- a/src/components/ClassQuestions.tsx
+++ b/src/components/ClassQuestions.tsx
@@ -71,32 +71,59 @@ import { splitLines } from './format';
  * item". A bullet carries no ordinal meaning, so it can never collide with
  * the outer numbering.
  *
- * The bullet is a real element, the first child of a flex `.row` — the same
- * "never rely on a native `::marker`'s own logical position" policy the
- * outer ordinal follows — but, UNLIKE the outer `<li>`, it carries NO
- * `dir="auto"` of its own. These lines all came out of one field the
- * musician wrote in one sitting, not independently authored values, so they
- * share whichever direction that field already resolves to rather than each
- * choosing one for itself. Left bare they inherit it and are never skipped
- * by an ancestor's own `dir="auto"` hunt — which matters specifically for
- * the QUESTION: the outer `<li>` anchors on it being bare, and an isolate
- * here (as `dir="auto"` on the title already is) would remove a multi-line
- * question from that hunt entirely, silently defaulting the whole item's
- * direction to LTR.
+ * EACH LINE IS INDEPENDENTLY AUTHORED, so each resolves its OWN direction.
+ * A sealed finding rejected the first pass at this, which left every bullet
+ * bare on the argument that lines from one field share one direction: they
+ * do not. A musician who types a Farsi question and an English one into the
+ * same box gets two lines whose languages genuinely differ, and leaving
+ * them all bare pinned every following line to the FIRST line's direction —
+ * an English line dragged RTL, or a Farsi one dragged LTR, with its bullet
+ * on the wrong side.
+ *
+ * The catch the first pass was right about is real, though: `dir="auto"`
+ * skips any descendant carrying its own `dir` when hunting for a first
+ * strong character, and the outer `<li dir="auto">` (and the Problem /
+ * Last time value wrapper) has nothing else left to hunt — the title is
+ * already isolated. Isolating EVERY line would leave the whole item with no
+ * resolution source and a silent LTR fallback, regressing the ninth
+ * finding's "the ordinal always tracks the question".
+ *
+ * Both hold one way only: the FIRST line is the ANCHOR and stays bare, so
+ * the enclosing group resolves from it — which means that line still
+ * follows its own language, since the direction it inherits is the one it
+ * produced. Every line AFTER it carries its own `dir="auto"` on the row, so
+ * its text and its bullet both follow that line alone. The two branches are
+ * written out literally rather than as `dir={i === 0 ? undefined : 'auto'}`:
+ * direction.test.ts is a source scanner, and a computed attribute is
+ * invisible to every guard in it.
  */
+function bullet(line: string, key: number, own: boolean) {
+  const dot = (
+    <span aria-hidden="true" className="tiny faint" style={{ flexShrink: 0 }}>
+      •
+    </span>
+  );
+  const style = { alignItems: 'flex-start', gap: 6 } as const;
+  // Two literal branches, not one computed dir — see the note above.
+  return own ? (
+    <li key={key} dir="auto" className="row" style={style}>
+      {dot}
+      <span className="grow">{line}</span>
+    </li>
+  ) : (
+    <li key={key} className="row" style={style}>
+      {dot}
+      <span className="grow">{line}</span>
+    </li>
+  );
+}
+
 function renderFreeText(text: string): ReactNode {
   const lines = splitLines(text);
   if (lines.length <= 1) return text;
   return (
     <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: 0, padding: 0, listStyle: 'none' }}>
-      {lines.map((line, i) => (
-        <li key={i} className="row" style={{ alignItems: 'flex-start', gap: 6 }}>
-          <span aria-hidden="true" className="tiny faint" style={{ flexShrink: 0 }}>
-            •
-          </span>
-          <span className="grow">{line}</span>
-        </li>
-      ))}
+      {lines.map((line, i) => bullet(line, i, i > 0))}
     </ul>
   );
 }
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index 5f9f9b6..e350216 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -132,6 +132,7 @@ const UNEXEMPTED_PHRASE_ALLOWLIST: { file: string; tagSnippet: string; why: stri
 const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string }[] = [
   { file: 'components/Attachments.tsx', tagName: 'button', classValue: 'grow' },
   { file: 'components/ClassQuestions.tsx', tagName: 'li', classValue: 'row' },
+  { file: 'components/ClassQuestions.tsx', tagName: 'li', classValue: 'row' },
   { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'small' },
   { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'tiny faint' },
   { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'tiny faint' },
@@ -182,6 +183,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Repertoire.tsx', tagName: 'link', classValue: 'row between small card-link' },
+  { file: 'pages/Repertoire.tsx', tagName: 'div', classValue: 'stack-sm' },
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'row between' },
   { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: '' },
@@ -1164,6 +1166,117 @@ function instrumentNameOccurrences(file: string): { at: number; end: number }[]
   return occurrences.sort((a, b) => a.at - b.at);
 }
 
+// --- a forced physical alignment never overrides a data title's own ------
+//
+// An EIGHTH SEALED FINDING found Repertoire's PathwayCard rendering a
+// user-authored pathway name inside a `<button style={{ textAlign: 'left' }}>`
+// with no direction-resolving group anywhere between them: a Farsi pathway
+// name shaped correctly (the browser's own bidi algorithm needs no help for
+// that) and then sat pinned to the English edge, split from the instrument /
+// stage caption underneath it. The inline instrument isolate already on that
+// caption could never fix it — `text-align` is a BLOCK concept, and this
+// file's own "an isolate must be inline" rule exists precisely because a
+// `<span>` never participates in one.
+//
+// Two things have to hold together, which is why this is ONE check rather
+// than two: the title needs a `dir="auto"` group to resolve from, AND that
+// group has to sit BELOW whatever is forcing a physical alignment and
+// re-declare `textAlign: 'start'`, or the direction it resolves never
+// reaches the alignment. Either half alone leaves the name exactly where it
+// was. `center` is deliberately NOT a forcing value: centred text points at
+// no edge, so it cannot misalign an RTL run — only `left`/`right` can, and
+// excluding `center` is also what keeps this from demanding an unrequested
+// layout change on the deliberately centred practice screens.
+//
+// The scan resolves a `style={CONST}` / `style={{ ...CONST, x }}` reference
+// against module-level `const NAME = { … }` declarations in the same file,
+// because that is how the real counterexample this found in Insights.tsx was
+// written (`<th style={CELL} dir="auto">{r.instrumentName}</th>`, with CELL
+// pinning `textAlign: 'left'`) — a scanner that only read inline literals
+// would have called that site clean.
+
+/** Module-level `const NAME = { … }` style objects, by name. */
+function styleConstants(src: string): Record<string, string> {
+  const out: Record<string, string> = {};
+  for (const m of src.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w.<>]+)?\s*=\s*\{([^{}]*)\}/g)) {
+    out[m[1]] = m[2];
+  }
+  return out;
+}
+
+/** The whole text of a tag's `style={…}` attribute value, with any
+ *  module-level style constant it names spliced in. */
+function styleTextOf(tag: string, consts: Record<string, string>): string {
+  const at = tag.indexOf('style=');
+  if (at < 0) return '';
+  const from = tag.indexOf('{', at);
+  if (from < 0) return '';
+  let depth = 0;
+  let end = tag.length;
+  for (let i = from; i < tag.length; i += 1) {
+    if (tag[i] === '{') depth += 1;
+    else if (tag[i] === '}') {
+      depth -= 1;
+      if (depth === 0) {
+        end = i + 1;
+        break;
+      }
+    }
+  }
+  const inline = tag.slice(from, end);
+  const referenced = [...inline.matchAll(/[A-Za-z_$][\w$]*/g)]
+    .map((m) => consts[m[0]])
+    .filter(Boolean)
+    .join(' ');
+  return `${inline} ${referenced}`;
+}
+
+/** 'left'/'right' when a tag forces a PHYSICAL alignment over its content
+ *  (directly or through a style constant), null otherwise. 'center' points
+ *  at no edge and never misaligns an RTL run, so it is not forcing. */
+function forcedAlign(tag: string, consts: Record<string, string>): string | null {
+  return /textAlign\s*:\s*['"](left|right)['"]/.exec(styleTextOf(tag, consts))?.[1] ?? null;
+}
+
+/** True when a tag re-declares the logical `textAlign: 'start'`. */
+function declaresStart(tag: string, consts: Record<string, string>): boolean {
+  return /textAlign\s*:\s*['"]start['"]/.test(styleTextOf(tag, consts));
+}
+
+/**
+ * Every element carrying a TITLE class whose body renders an OPAQUE data
+ * expression — the owner's own text, whose language cannot be known from
+ * source. A title made only of literal copy ("Routine complete") is fixed
+ * English and never needs a direction of its own.
+ */
+function dataTitleSites(file: string): { line: number; tag: string; at: number }[] {
+  const src = stripComments(SOURCES[file]);
+  const out: { line: number; tag: string; at: number }[] = [];
+  for (const m of src.matchAll(/<[A-Za-z][\w.]*\s[^>]*className=/g)) {
+    const at = m.index!;
+    const tag = enclosingTag(src, at + 1);
+    if (!TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(classNameOf(tag)))) continue;
+    if (tag.endsWith('/>')) continue;
+    const body = elementBody(src, tag, at);
+    if (!src.slice(body.start, body.end).includes('{')) continue;
+    out.push({ line: src.slice(0, at).split('\n').length, tag, at });
+  }
+  return out;
+}
+
+/**
+ * The ancestor chain of a title, innermost FIRST, each entry carrying its own
+ * opening tag text so this check can read both its `dir` and its alignment.
+ */
+function ancestorTags(src: string, at: number): { tag: string; dir: string | null }[] {
+  return ancestorChain(src, at)
+    .map((e) => {
+      const tag = enclosingTag(src, e.bodyStart - 1);
+      return { tag, dir: e.dir };
+    })
+    .reverse();
+}
+
 // --- the check --------------------------------------------------------------
 
 describe('direction lives on the group', () => {
@@ -1395,7 +1508,9 @@ describe('direction lives on the group', () => {
   it("the question anchors ClassQuestions' <li>, not the independently-authored title", () => {
     const file = 'components/ClassQuestions.tsx';
     const src = stripComments(SOURCES[file]);
-    const liSite = directionSites(file).find((s) => s.tagName === 'li');
+    // The item's own <li>, not one of renderFreeText's bullet rows (which
+    // now carry dir="auto" of their own and appear earlier in the file).
+    const liSite = directionSites(file).find((s) => s.tagName === 'li' && s.text.includes('key={q.itemId}'));
     expect(liSite, 'ClassQuestions\' <li dir="auto"> site not found').toBeTruthy();
     const openAt = src.lastIndexOf('<', liSite!.at);
     const body = elementBody(src, liSite!.text, openAt);
@@ -1408,4 +1523,90 @@ describe('direction lives on the group', () => {
     );
     expect(questionTag, "the question must stay bare so the <li> resolves from it").not.toMatch(/\sdir=/);
   });
+
+  // An EIGHTH SEALED FINDING: Repertoire's PathwayCard forced a user-authored
+  // pathway name left (the button's own textAlign:'left') with no
+  // direction-resolving group anywhere above it, so a Persian pathway read
+  // against the English edge while its own caption sat beside it. The two
+  // halves are asserted together because either alone leaves the name where
+  // it was: a group to resolve the direction FROM, and that same group
+  // re-declaring the logical `textAlign: 'start'` below whatever pinned a
+  // physical one. Discovered mechanically from the shapes the app actually
+  // uses (a title class whose body renders an opaque data expression; an
+  // alignment pinned inline OR through a module-level style constant), not
+  // from a list of locations a reviewer happened to name.
+  it('no forced left/right alignment overrides a data title\'s own resolved direction', () => {
+    const violations: string[] = [];
+    let titlesSeen = 0;
+    for (const file of sourceFiles()) {
+      const src = stripComments(SOURCES[file]);
+      const consts = styleConstants(src);
+      for (const title of dataTitleSites(file)) {
+        // A title carrying its own dir is an isolate (fixed copy deliberately
+        // pinned), judged by the isolate rules above, not by this one.
+        if (/\sdir="(auto|ltr|rtl)"/.test(title.tag)) continue;
+        const chain = [{ tag: title.tag, dir: null as string | null }, ...ancestorTags(src, title.at + 1)];
+        const forcedAt = chain.findIndex((e) => forcedAlign(e.tag, consts) !== null);
+        if (forcedAt < 0) continue; // nothing forces a physical edge on this title
+        titlesSeen += 1;
+        const where = `${file}:${title.line} [${classNameOf(title.tag).trim()}]`;
+        // The group must sit strictly BELOW the forcing element (a smaller
+        // index is nearer the title), resolve direction, and restore start.
+        const group = chain.slice(0, forcedAt).find((e) => e.dir !== null);
+        if (!group) {
+          violations.push(`${where} — forced ${forcedAlign(chain[forcedAt].tag, consts)} with no dir group between`);
+        } else if (group.dir !== 'auto') {
+          violations.push(`${where} — the nearest group pins dir="${group.dir}" instead of resolving the title's own`);
+        } else if (!declaresStart(group.tag, consts)) {
+          violations.push(`${where} — its dir="auto" group never restores textAlign:'start', so the resolved direction never reaches the alignment`);
+        }
+      }
+      // The same defect one level up, in a shape no title-class filter can
+      // see: a group that resolves a direction and then pins a physical edge
+      // ON ITSELF. Insights' per-instrument <th style={CELL} dir="auto"> was
+      // exactly this — CELL pinning textAlign:'left' over the owner's own
+      // (renameable, Farsi-capable) instrument name.
+      for (const group of directionSites(file).filter(isGroup)) {
+        const forced = forcedAlign(group.text, consts);
+        if (forced) {
+          violations.push(
+            `${file}:${group.line} — a dir="auto" group pins textAlign:'${forced}', overriding the direction it just resolved`,
+          );
+        }
+      }
+    }
+    expect(violations).toEqual([]);
+    // Same discipline as the checks above: a scanner that silently matches
+    // nothing is not proof that nothing needed checking.
+    expect(titlesSeen).toBeGreaterThan(0);
+  });
+
+  // The same EIGHTH FINDING's second half: renderFreeText rendered every line
+  // of a multi-line question/problem/observation bare, so one Farsi line
+  // dragged every following English line RTL (and the reverse). Each line is
+  // independently authored and resolves its OWN direction — except the FIRST,
+  // which stays bare ON PURPOSE: it is the only strong text left for the
+  // enclosing dir="auto" (the item's <li>, the Problem/Last-time value
+  // wrapper) to resolve from, since the title is already isolated. Isolating
+  // it too would leave the whole item with no resolution source and a silent
+  // LTR fallback — the ninth finding, back again. Mutation-tested both ways:
+  // making the first line resolve its own direction fails here, and so does
+  // leaving the rest bare.
+  it('every line after the anchor of a multi-line free-text field resolves its own direction', () => {
+    const file = 'components/ClassQuestions.tsx';
+    const src = stripComments(SOURCES[file]);
+    const at = src.indexOf('function bullet(');
+    expect(at, 'renderFreeText\'s per-line renderer not found').toBeGreaterThan(-1);
+    const end = src.indexOf('\nfunction renderFreeText', at);
+    const liTags = [...src.slice(at, end).matchAll(/<li\b[^>]*>/g)].map((m) => m[0]);
+    expect(liTags.length, 'expected an anchor branch and an own-direction branch').toBe(2);
+    const bare = liTags.filter((t) => !/\sdir=/.test(t));
+    const own = liTags.filter((t) => /\sdir="auto"/.test(t));
+    expect(bare.length, 'exactly one line — the anchor — stays bare').toBe(1);
+    expect(own.length, 'every other line carries its own dir="auto"').toBe(1);
+    // …and the branch that gets the isolate is the one chosen for lines
+    // AFTER the first, never the first itself.
+    expect(src.slice(at, end)).toMatch(/return own \? \(\s*<li key=\{key\} dir="auto"/);
+    expect(src.slice(end)).toMatch(/bullet\(line, i, i > 0\)/);
+  });
 });
diff --git a/src/pages/Insights.tsx b/src/pages/Insights.tsx
index 902dc47..80a29d6 100644
--- a/src/pages/Insights.tsx
+++ b/src/pages/Insights.tsx
@@ -134,7 +134,12 @@ function PractiseTotals({ now }: { now: Date }) {
   );
 }
 
-const CELL: CSSProperties = { textAlign: 'left', padding: '4px 8px 4px 0', whiteSpace: 'nowrap' };
+// textAlign 'start', never 'left': the instrument column's own <th> carries
+// dir="auto" (the name is the owner's editable text, Farsi included), and a
+// physical 'left' would resolve the direction without ever reaching the
+// alignment — leaving a Farsi name shaped correctly but pinned to the
+// English edge. 'start' is identical to 'left' for every English row.
+const CELL: CSSProperties = { textAlign: 'start', padding: '4px 8px 4px 0', whiteSpace: 'nowrap' };
 const NUM: CSSProperties = { textAlign: 'right', padding: '4px 0 4px 8px', whiteSpace: 'nowrap' };
 
 function cell(t: { minutes: number; blocks: number }): string {
diff --git a/src/pages/Repertoire.tsx b/src/pages/Repertoire.tsx
index a29727b..1ea53c0 100644
--- a/src/pages/Repertoire.tsx
+++ b/src/pages/Repertoire.tsx
@@ -450,24 +450,33 @@ function PathwayCard({
 
   return (
     <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
-      <div className="row between">
-        <div className="row" style={{ gap: 8, minWidth: 0 }}>
-          <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
-          <span className="title-md truncate">{pathway.name}</span>
+      {/* The pathway's own name and the line of metadata under it are ONE
+          group, carrying the direction, so a Farsi name and its own caption
+          read as one right-aligned block — the rule the rest of this app
+          already follows. The group sits INSIDE the button rather than on
+          it (the Balance-row precedent: the chevron's `row between` and the
+          progress bar below are layout, not text, and giving them a
+          resolved RTL direction would swap the bar and the counter), and it
+          re-declares textAlign:'start' because the button pins
+          textAlign:'left' — a resolved direction that never reaches the
+          alignment leaves a Persian title pinned left exactly as before.
+          The instrument name keeps its own inline dir="auto" isolate for
+          the reason PathwayDetail's identical line does: it is the owner's
+          own editable text and need not share the pathway name's language.
+          stage.code/title stay bare — it's the stage's own compound label,
+          not a foreign caption. */}
+      <div className="stack-sm" dir="auto" style={{ textAlign: 'start', minWidth: 0 }}>
+        <div className="row between">
+          <div className="row" style={{ gap: 8, minWidth: 0 }}>
+            <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
+            <span className="title-md truncate">{pathway.name}</span>
+          </div>
+          <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
+        </div>
+        <div className="tiny faint truncate">
+          <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
+          {stage ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}` : ''}
         </div>
-        <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
-      </div>
-      {/* The instrument name (or 'General') is the owner's own editable text
-          — its own dir="auto" isolate, same as PathwayDetail's identical
-          line. An INLINE isolate (a span, never a block) fixes the name's
-          own bidi base without touching this card's own textAlign:'left' —
-          text-align is a block concept a span never participates in, per
-          this file's own "an isolate must be inline" rule. stage.code/title
-          stay bare, same reasoning as PathwayDetail: it's the stage's own
-          compound label, not a foreign caption. */}
-      <div className="tiny faint truncate">
-        <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
-        {stage ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}` : ''}
       </div>
       <div className="row" style={{ gap: 8 }}>
         <span className="balance-track grow">
diff --git a/src/pages/RoutineRunner.tsx b/src/pages/RoutineRunner.tsx
index d9648ff..01b7c3c 100644
--- a/src/pages/RoutineRunner.tsx
+++ b/src/pages/RoutineRunner.tsx
@@ -174,8 +174,13 @@ export default function RoutineRunner() {
         {recorded.size > 0 ? (
           <div className="card stack-sm" style={{ textAlign: 'left' }}>
             <div className="section-label">Recorded</div>
+            {/* textAlign 'start' on the row itself: the card above pins a
+                physical 'left', so without this the row resolves a Farsi
+                item's direction but never carries it to the alignment —
+                the title shapes RTL and still hugs the English edge.
+                Identical to 'left' for an English title. */}
             {[...recorded.entries()].map(([itemId, minutes]) => (
-              <div key={itemId} className="row between" dir="auto">
+              <div key={itemId} className="row between" dir="auto" style={{ textAlign: 'start' }}>
                 <span className="truncate">
                   {getItem(db, itemId)?.title ?? 'Item'}
                 </span>
```

**Full current text of every file the rework touched:**

### AGENTS.md

```
# AGENTS.md — development rules for Practice Compass

This file is the contract for anyone (human or AI) extending this app. Read it before
adding features. The whole value of the tool comes from what it *refuses* to do.

## The one rule above all

Preserve the core loop: **one item · one mode · one focus · one result · one next action.**
If a change blurs that loop or adds a second thing to think about per step, it's wrong —
even if it's "useful".

**The loop CLOSES: the next action is read, not just written.** `PracticeBlock.nextAction`
was captured on every close and read nowhere, so the one thing deliberately decided last
time never reached the moment it was written for. `ActiveBlock` now shows it at the top,
before you start playing, via `lastNextAction` (`blocks.ts`, tested) — the most recent
NON-EMPTY one, so a later block that recorded none does not blank out a decision that
still stands. Anything the app asks you to record, it must eventually USE.

## Keep admin overhead low

- Starting a block must stay **under 30 seconds**; closing one **under 60 seconds**.
  Any new field in those flows must be optional and have a smart default.
- Never add a required field beyond an item title.
- Rich metadata stays progressive: hidden until the user asks for it.

## Prioritise the quick‑start flow

- Smart defaults are a feature, not a convenience. Status → mode, item → focus,
  10‑minute duration. If you add a concept, give it a sensible default too.
- Inline item creation must keep working from the Start screen and from recommendations.
- **Exactly two creation paths, both one-step.** Quick add = title only (Start's
  inline create is also title-only, with a link to the full form that returns to Start
  with the item preselected). The full form ("Add practice item", `/items/new`, also
  inline edit) is KIND-FIRST: it asks what you're adding (gusheh / composed piece /
  piece / étude / passage / technique — `src/components/itemKinds.ts`, tested) and
  shows only that kind's identity fields, in three groups: "What are you adding? /
  Connect it (optional) / First practice setup". Connections (study source with inline
  create, pathway stage, lesson, parent work) are settable AT creation — no
  create-then-edit round trips, and never a third half-detailed path. Item detail
  shows a "Connected to" summary near the top.

## Today is a session workspace, scoped to one instrument

The user practises one instrument at a time ("I'm practising Setar now"). Today is
driven by a persisted `sessionInstrumentId`: the switcher at the top picks the
instrument, everything below it (recommendation, class work, reviews, pathway position,
quick add, Start) is scoped to that instrument, and the primary recommendation must stay
above the fold on a 390×844 phone. The cross‑instrument "Overview" is a deliberate,
secondary choice — never the default. Never hard‑code a morning/evening schedule and
never surface another instrument's work inside a session. The Session Plan and
Routines are two independent, peer doorway cards (`PlanCard`/`RoutinesCard` in
`Today.tsx`) — a time-budgeted session and following a routine are separate systems,
and OWNER acceptance testing (2026‑08‑28) found nesting routines inside the Session
Plan's expanded panel read as routines being subordinate to picking a duration, so
they were pulled out into their own doorway. Both start collapsed (~50px) so the
primary recommendation stays above the fold; each has its own open/close state and
its own "Resume your plan"/"Resume your routine" takeover. Routines are scoped to the
session instrument (`routinesForInstrument`), each row showing Edit and — when a
segment is essential — a visible "Short on time — essentials only" button, plus "New
routine" ("Create a routine" when there are none yet). Today is the ONLY surface an
unplaced routine is reachable from at all, so its rows carry the same Edit/Start/
short-on-time affordances StageDetail's `RoutineCard`/PathwayDetail's `RoutineRow`
give a placed one.

**THE TWO DOORWAYS SIT ABOVE THE RECOMMENDATION, AND THAT IS AN OWNER JUDGEMENT, NOT A
DERIVATION.** The 2026‑09‑11 lane BUILT the other order — Practise now directly under
the instrument switcher, with Plan and Routines beneath it — on the argument that
orchestrating a session is a choice you make INSTEAD of taking the suggestion. The owner
tried it on their own iPhone and preferred the original: Plan and Routines read as
belonging at the top of the page, and recommendation-first felt less natural. The order
reverted before the lane shipped, which is a PASSING outcome of that check, not a
failure. Both orders keep the recommendation above the fold at 390×844, so nothing here
follows from the phone constraint — do not re-derive this ordering from first principles
and quietly flip it back. It changes only when the owner says so.

## Review actions have honest, distinct semantics

Practising (closing a block) is the ONLY thing that completes a review and advances
SM‑2. "Not now" hides a due review for the rest of today (no schedule change). Snooze
(+2d) genuinely moves the due date on both the review and the item — never fabricate a
result, and never leave a stale overdue item after an action. The Finish button freezes
the clock (`pauseSession`) before the close screen; reflection time is not counted.

**ANSWERING NOTHING IS NOT DECLINING.** A result is REQUIRED to save a block — the six
options are already the first thing on the close screen, so this adds no field (r-quick-start
holds: it makes a choice already present a required one), and "Save without a result" keeps
`not_logged` reachable and DELIBERATE. `computeReviewOutcome` takes a tri-state
`ReviewAnswer` (`'scheduled' | 'declined' | 'unanswered'`) and returns
`completeOpenReviews` ALONGSIDE `nextReviewDate`, because they are ONE decision: a close
carrying no result keeps the item's date AND leaves its open Review row OPEN, while a
genuine decline still clears the date and completes the row. `closeSession` must never
decide the row separately — completing every open row unconditionally, next to a
`!scheduleReview` branch that cleared the date, is exactly how one skipped tap used to
erase the next date, close the open review, leave SM‑2 state stale and drop the item out
of Due reviews for good, all while the panel read "Should this come back? Yes" above an
empty date field. The row transform is `completeOpenReviewsFor` (`scheduling.ts`, tested)
so the array change is reachable from a Node test; `CloseBlock` states the mapping in one
place and the escape hatch forces `'unanswered'` even when a result had already filled in
a date. r-explainable-scheduling's "the date shown is the date saved" now includes when
that date is deliberately left UNCHANGED.

**THE CLOSE SCREEN LEADS WITH THE MUSICIAN'S WORDS, AND DERIVES THE DATE ONCE.** How it
went, what you noticed and what to try next time are always visible and come BEFORE the
minutes and the scheduler. The whole scheduling decision is ONE honest line — "Review in
2 days · Repair · …" — with the date field, the review-type choice, "Why this date?" and
the come-back Yes/No a single tap behind it. (It used to run 1689px at 390×844, with the
engine's controls fully expanded before a result had been chosen, and a two-column grid
whose right column stacked five review-type pills vertically.)

There is exactly ONE `ReviewPlan` value in that component (`review`, a `useMemo`): the
engine's plan for the chosen result with any manual correction folded INTO it. The
collapsed line, the date field and the value handed to `closeSession` are three
renderings of THAT object, so a divergent date is UNREPRESENTABLE rather than merely
guarded against — there used to be a second `planNextReview` call seeding the field from
a different invocation than the preview. `clampSchedulingParams(db.settings)` is threaded
into that one derivation. The line itself comes from `reviewSummaryLine`
(`src/components/format.ts`, tested): a pure FORMATTER that reports the plan's `dueDate`,
`reviewType` and `rationale` and computes no date of its own. Once the owner sets their
own date the rationale becomes "The date you chose." — quoting the engine's reason would
explain a number it did not pick. Never reintroduce a second derivation here.

**A MANUALLY CHOSEN DATE SURVIVES CHANGING THE RESULT WHEN NO AUTOMATIC PLAN EXISTS.**
`pickResult` clears the manual `override` on every fresh result — a correction made
earlier belonged to the date the PREVIOUS result's plan produced, so carrying it forward
would pin a date to a judgement it was never made about. But a manual-mode item
(`item.reviewMode === 'manual'`) has NO automatic plan for ANY result — `computeReview`
returns `null` unconditionally in manual mode, before it even looks at `result` — so the
owner's typed-in date was never tied to a particular judgement in the first place, and
clearing it on every result change silently threw away a date they had just chosen. The
restructure once did exactly that (`setOverride(null)` unconditionally), turning a
deliberate "come back on this date" into an accidental decline the moment the musician
changed which result they picked. `reviewOverrideSurvivesResultChange`
(`src/components/format.ts`, tested against the real engine across all six results, both
a manual- and an auto-mode item) reads `item.reviewMode` directly rather than calling
`planNextReview` a second time inside `pickResult` — CloseBlock keeps its single
derivation; this is a boolean gate on whether one exists at all, not a second value that
could disagree with it.

**THE DUE-REVIEW ROW GIVES THE ITEM'S NAME THE ROOM.** "Not now" + "+2d" + ▶ used to take
243px of a 356px row, leaving the title 113px — about 13 characters of a Farsi name, the
one thing the row exists to identify. The text now claims a whole line whenever the three
actions cannot sit beside it (`flex: 1 1 220px` with `flex-wrap`) and WRAPS instead of
truncating. All three actions keep their existing, deliberately distinct meanings: this
is layout only.

## Nothing replaces an unfinished practice session

`src/domain/practiceSession.ts` (pure, tested) is the sibling of `practiceSignal.ts`: that
module owns pure decisions about a running clock's SIGNALS, this one owns pure decisions
about the unfinished SESSION. Two INDEPENDENT questions live there and must never be
conflated:

- **PRESENCE** (`hasUnfinishedPractice`, `decideReplacement`) — does an unfinished session
  exist? That, and ONLY that, decides whether a whole-database replacement may proceed.
  Never `running`, so PAUSING PROTECTS A SESSION RATHER THAN EXPOSING IT; the frozen
  `active`+`activeRoutine` pair the persist `merge` produces is unfinished practice like
  any other.
- **PLAUSIBILITY** (`isStaleClock`, `proposedCloseMinutes`) — does this session's elapsed
  figure still look like time someone played? That decides the minutes `CloseBlock`
  proposes and the ATTENTION state, and NOTHING else.

**A HEURISTIC ABOUT A DURATION NEVER BECOMES AN AUTHORITY TO DESTROY PRACTICE.** A stale
verdict must never be wired to a destructive path, and `decideReplacement` must keep
reaching the SAME decision for a stale session as for a live one (a session paused at
three genuine hours crosses any sensible threshold — discarding it would lose real
practice). Staleness may never be fed into `shouldKeepAwake` or `nextSignal` either.

`active` lives outside `db`, so `withRevision` never bumps `rev` while you practise: a
mid-block device looks UNCHANGED to `decideSync`, a remote change resolves to `pull`, and
the in-flight block is destroyed with no archive and no prompt. So: AUTOMATIC sync
(`syncNow`) checks the predicate BEFORE attempting and reports a distinct `deferred`
SyncPhase — a background merge waiting its turn is not an error and must not be dressed as
one — while DELIBERATE replacement (Import, Restore archive, Keep remote) gets an explicit
refusal naming the session. The guard for the inbound paths is the FIRST statement of
`importFullBackup` (`backup.ts`), before the JSON is even parsed: `replaceAllBlobs` below
it destroys every attachment blob, so a check placed after it would wipe them while
returning "nothing was changed". Every deliberate caller already surfaces
`{ok:false,error}`, so no `Settings.tsx` change is needed.

The inbound guard is checked TWICE, and the second one is what makes it hold: the first
check is `importFullBackup`'s opening statement, but `await replaceAllBlobs(...)` below it
yields to the event loop, so a tap that starts a block while that transaction is in flight
would reach `importDB` — which nulls `active`/`activeRoutine` — with no guard between. The
second check sits in the same synchronous tick as the install, with nothing awaited in
between, so it is genuinely the last word. It refuses honestly: the blobs are already
written by then, so the message says so and invites re-running the import rather than
claiming nothing changed. Both checks take the CALLER'S INTENT (`importFullBackup(text,
intent)`), because a sync pull that reaches them is still AUTOMATIC — `syncNow` checked
before the network fetch, and practice can begin during it. It defers, and `githubSync.ts`
carries that verdict back out to `applyOutcome` (`pendingDeferral`, module scope for the
same reason `running` is) so the phase is `deferred`, never `error`: App.tsx's retry
watches `deferred`, so an `error` here would stop sync until something else happened to
trigger one — the silent outage this lane exists to prevent. Ordering is NOT reversed to fix
this — `replaceAllBlobs` is one
IndexedDB transaction, so a failed blob write rolls back and leaves blobs and `db` alike
untouched, which installing the `db` first would give up.

PRESENCE IS NOT THE WHOLE GUARD. `decideReplacement` has TWO blocking reasons, and both
are about practice that would be DESTROYED — neither is a heuristic about a duration. The
second is the local REVISION: an inbound snapshot may only be installed over the database
it was compared with. A block started AND FINISHED while a pull is in flight leaves no
unfinished session for presence to see. That block is not in the incoming snapshot, and —
if it landed after the pre-sync archive was taken — not in the only other copy either, so
installing the snapshot would destroy a minute that was genuinely played. So `importFullBackup(text, intent,
decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
in the same call as the presence check (ONE call answering both, so no await can ever be
slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
is) so the guarded window covers the remote fetch and the archive too, not just
`replaceAllBlobs`. It does NOT read that number from the store itself: it takes the one
`buildFullBackupWithRev` (`backup.ts`) returns, captured in the SAME statement as the
database (`const { db, rev } = useStore.getState()`) and before `allBlobs()` yields. Read
after that await, the baseline would pair an OLD copy of the data with a NEWER revision
number, and a block finished while the attachment blobs were being read would make
`decideReplacement` — which is itself correct — answer "nothing was written since" about a
database that had been written to. The pure decision is tested; this WIRING is protected
structurally, the same way `installDatabase`'s is: the revision is not reachable from
anywhere but the statement that reads the database. It is passed IN, never read from module scope inside `importFullBackup`:
a manual Import or an archive restore has no earlier decision point than its own call and
defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
PRESENCE is answered first so a message that can name the blocking session still does
(ac-8). This deferral needs no retry watcher of its own — there is no blocking session for
the presence retry to watch clear, but the very write that raised it bumped `rev`, which
App.tsx's quiet-period auto-sync already watches, and the next run sees both sides changed
and offers the owner an explicit conflict with both copies preserved. That trigger is only
reliable because A SYNC REQUEST ARRIVING WHILE ONE RUNS IS REMEMBERED, NEVER DROPPED
(`rerunWanted` in `githubSync.ts`: `syncNow` sets it instead of returning into nothing, and
the run loops once more when it is set). `running` used to make such a request a silent
no-op, so a run outlasting the 30-second quiet period swallowed the single retry that
revision had scheduled and then deferred for that very revision — permanently waiting on a
condition nothing was watching. Remembering the request fixes that at the root, for every
trigger (open, quiet period, back online, deferral cleared) rather than for one
counterexample, and cannot spin: the flag is cleared at the top of each lap, so another lap
needs a genuinely new request that arrived during the previous one. `resolveConflict` drains
it too — a request that arrived while the owner was deciding is owed a run just the same.

A stale clock is labelled wherever the block appears on Today — the In-progress card AND
the "still running elsewhere" row (`StaleNote`) — because those two are exhaustive and
labelling only the first left the same block silent after switching instrument or choosing
Overview, where with no GitHub sync configured no deferral notice exists either. A stale
ROUTINE carries no such note: a run has no single target to judge an elapsed figure
against, and `segmentElapsed` already clamps each segment to its authored duration.

The deferral is VISIBLE and BOUNDED, never a silent permanent outage: `SyncNotice`
(`Layout.tsx`) renders `deferred` and says what it is waiting on, Today labels a stale
clock wherever the block is shown, and the resolution is the owner's — Finish, correct the minutes, or
Discard. The RETRY watches the BLOCKING CONDITION CLEARING (`deferredSyncRetry`, an effect
in `App.tsx` keyed on presence), never `rev`: `closeSession` writes a block and bumps the
counter but `cancelSession` is a bare `set({ active: null })` that writes nothing, so a
rev-watching retry resumes after a finish and waits forever after a discard. Seed the
previous-presence ref with the CURRENT presence, or an ordinary load reads as a
present→absent transition and fires a spurious sync.

**Installing a database clears the ephemeral state that pointed at the old one.**
`installDatabase` returns the new `db` TOGETHER WITH `active`/`activeRoutine`/`activePlan`
nulled, `notNow` reset and a `sessionInstrumentId` that survives only if it still resolves
(`'all'` always survives). Its SIGNATURE is the guarantee: `importDB`, `resetDemo` and
`clearAll` are each a single `set()` of its result, so installing a database WITHOUT the
reset is something the code cannot express — which matters because the Node environment
cannot import `useStore.ts` (it pulls in Dexie via `./idb`), so the unit test proves the
DECISION and the shape protects the WIRING. There are SIX whole-database replacements, not
four: `resetDemo` and `clearAll` are called directly on the store and never touch
`importFullBackup`, so a fix living only there would silently miss two of the three install
points. Deliberate erasure keeps NO guard — those actions are aimed at destroying the data
and already confirm first, so refusing them would be obstruction, not safety.

## Practice totals are calendar figures, not rolling windows

`practiceTotals` / `practiceTotalsByInstrument` / `startOfWeekISODate` (`selectors.ts`,
tested) answer "how much have I practised?" — a compact minutes-and-blocks line low on
Today (BELOW the recommendation, never above: "Practise now" stays above the fold at
390×844) and the full today / this week / all time per-instrument view on Insights. Do NOT
reuse `blocksInWindow`/`totalMinutesInWindow` for these: they filter on HOURS, so `days:1`
means the last 24 hours and `days:7` the last 168 — a block from late last night is not
today's practice. The week starts **Monday 00:00 local**.

**A block belongs WHOLE to the local calendar day it BEGAN**, with none of its minutes
apportioned across midnight or the Monday boundary. This was challenged and the code
settles it: `durationMinutes` is the figure the owner ATTESTED to and this lane makes it
diverge from wall clock on purpose (an abandoned block proposes its target), so
`endedAt - startedAt` is not the authored duration; and `endedAt` is optional and ABSENT on
routine blocks (`applyRoutineRun` passes none), so apportioning would apply to some blocks
and not others. Splitting would overrule the owner's own correction with a number they
never attested to. Totals stay NEUTRAL COUNTS — no goal, streak, score, bar that fills or
colour that judges. Relatedly, `instrumentBalance` takes its denominator from only the
blocks belonging to the instruments it emits rows for, so the percentages sum to 100 when
a caller passes active instruments with all blocks (Today does).

A calendar figure needs a LIVE clock: Today and Insights tick `now` once a minute
(`setInterval` in each page) rather than freezing it at mount, or a screen left open across
midnight keeps reporting yesterday's blocks as today's — and a running block never gains
its stale label. Insights passes ALL of `db.instruments` to `practiceTotalsByInstrument`,
not just the active ones, because its "All instruments" row counts every block: filtering
to active instruments left a retired instrument's history with no row while its minutes
stayed in the total. Rows with no practice are dropped at the call site, so the selector's
"one row per supplied instrument" contract is unchanged.

## Hands-free practice: the screen stays awake, and the app announces the end

The practice loop assumes you put the device down and play. While a practice clock —
an ordinary block (`ActiveBlock`) or a routine run (`RoutineRunner`) — is genuinely
RUNNING and its screen is VISIBLE, the app holds a Screen Wake Lock so the clock stays
readable without touching anything; pausing, finishing, discarding, unmounting
(navigating away) and the document going hidden all release it. WHETHER to hold the
lock is a pure, tested predicate — `shouldKeepAwake({ hasClock, running, visible })`
(`src/domain/practiceSignal.ts`) — true only when all three hold. There is exactly ONE
owner of the lock (`useScreenAwake`, wired once per practice screen), so two can never
be held at once. Reacquiring on `visibilitychange` back to visible is required by the
Screen Wake Lock specification (the platform releases a held lock the moment the
document becomes hidden) — not a browser-specific workaround. No wake-lock outcome,
success, rejection, or unsupported, may ever influence a recorded minute: the whole
elapsed-time family (`sessionElapsedSeconds`, `runElapsedSeconds`, `locateClock`,
`skipCurrentSegment`, `aggregateItemMinutes`) stays exactly as it was before this
existed.

**The decision of WHEN to announce is pure and tested** (`src/domain/practiceSignal.ts`):
`nextSignal(marker, elapsedSeconds, boundarySeconds)` announces AT MOST ONCE per call —
if elapsed has passed more boundaries than the marker records, it announces once and
advances the marker to the number ACTUALLY passed, never by one. This is what makes a
background/lock catch-up correct: a phone that wakes up several boundaries later
announces once and lands on the right one. The marker is a COUNT OF BOUNDARIES ALREADY
ANNOUNCED, living as an optional `signalledThrough?: number` on the store's EPHEMERAL
`active`/`activeRoutine` (useStore.ts) — never in `PracticeDB`, so no `SCHEMA_VERSION`
bump, no migration, and it never syncs or lands in a backup. An ABSENT marker reads as
zero (nothing announced yet) — the honest reading for a session persisted before this
feature existed. Boundaries are the run's ordered cumulative END boundaries: an ordinary
block passes `[targetMinutes * 60]`; a routine passes `segmentBoundaries(segs)`
(`src/domain/routines.ts`) — the SAME numbers `locateClock` advances on, by construction,
not a second cumulative sum recomputed in the runner. A deliberate Skip calls
`acknowledgeThrough` instead, which advances the marker to match elapsed WITHOUT
announcing — the user ended the segment themselves, so telling them it ended is noise —
and clears every boundary at or before elapsed (not just one), since Skip can produce a
zero-length or repeated boundary that is legitimate input, never malformed.

**The visual state change is the guaranteed signal**, always delivered regardless of the
wake lock or any device capability: an ordinary block reaching its target shows a
durable "target reached" ring state and a growing overtime figure
(`formatClock(elapsed - targetSeconds)`) for as long as the block runs — it does NOT
auto-finish; practising past the target is ordinary, and only Finish or Discard ends a
block. A routine segment boundary is perceptible for a defined window after arrival
(never a single-render flash), and routine completion is already durably shown by the
existing "Routine complete" screen. Audio and vibration (`playSignalCue`,
`useScreenAwake.ts`) are FEATURE-DETECTED BEST-EFFORT ONLY, wrapped so any failure is
silent, and are never part of any automated check: `navigator.vibrate` is unimplemented
in Safari on iOS, and a WebAudio context needs a user-gesture unlock that happens on the
page that starts the clock (Today/StageDetail/SessionPlan) — never on the practice
screen itself, which hands-free practice, by definition, never taps. It may therefore be
silent on the owner's own iPhone; the OWNER device checks record what was actually heard
rather than asserting it. Widening the frame to unlock audio at the start gesture is a
separate lane. Neutral and non-gamified throughout: a state change and a number, never a
streak, score, or
celebration.

**The wake lock itself is one shared, port-injected coordinator**
(`src/components/screenAwake.ts`) — no `navigator`/`window`/`document`, so its whole
ownership state machine (at most one outstanding request and one held sentinel; a
rejected or unsupported acquisition swallowed silently; a pending acquisition that
resolves after being disabled released immediately rather than stranded held) is
reachable from an ordinary Node test. `src/components/useScreenAwake.ts` is the thin
React/browser adapter that feature-detects (`'wakeLock' in navigator`) and supplies the
real port, and wires `visibilitychange`.

**Secure-context constraint.** The Screen Wake Lock API requires a secure context.
Production (GitHub Pages) is HTTPS and unaffected. This repo has no branch-preview
deployment — `.github/workflows/deploy.yml` publishes only on push to `main` — so
plain-HTTP LAN serving of an unmerged branch cannot exercise this feature at all
(`navigator.wakeLock` is simply `undefined`, which looks like a bug but is an
environment gap). Before drawing any conclusion about this feature (or any future
secure-context-dependent work) from an unmerged branch, first confirm
`window.isSecureContext` and `'wakeLock' in navigator` on the actual test device, and
establish a genuine HTTPS route for it first.

## Hard "do nots" (require explicit user instruction to change)

- ❌ **No gamification** — no streaks, points, badges, XP, leaderboards, confetti,
  or fake "mastery %". Progress is shown as honest status + result, nothing else.
- ❌ **No backend, no auth server, no service of our own.** The app is local‑first:
  **IndexedDB (Dexie) is the source of truth** on each device (app state in the `kv`
  table, attachment blobs in the `attachments` table) and everything works offline.
  **Amended by explicit user decision (2026‑07‑11):** device sync IS sanctioned — via
  the **user's own GitHub repo**. The engine (`src/store/syncEngine.ts`, port-injected
  and fully unit-tested; GitHub transport in `gitRemote.ts`; wiring in `githubSync.ts`)
  publishes whole snapshots ATOMICALLY with the Git Data API: blobs → tree → commit →
  fast-forward-only ref update, so a race or partial failure never leaves a broken
  remote. A brand-new EMPTY data repo is bootstrapped first via the Contents API
  (`RemotePort.initialize()`) — the git-data endpoints 409 on an empty repo — then the
  first snapshot commits as a child of that bootstrap commit; init failures surface a
  clear message with the manual README fallback and never leave a partial snapshot. Decisions are three-way CONTENT-HASH comparisons (`decideSync` +
  `canonicalStringify`/`hashState` in `src/domain/`), never timestamps — pathway-only
  edits and deletions sync like everything else, and a store middleware
  (`src/store/revision.ts`) bumps a `rev` counter on every db mutation. Both-changed =
  explicit two-button conflict ("newest" is a hint, never an auto-winner), and BOTH
  copies are preserved before any replace: the local copy goes to an in-app restore
  slot (idb) and an `archive/…` branch; the remote copy stays reachable as the parent
  commit. Legacy `state.json`+`files/` remotes stay readable; the first new push
  migrates the format with the old snapshot kept in git history. Never a silent merge,
  never per-field magic, never a custom server. Manual export/import stays as the
  fallback. Free tiers only; no paid services.
- ❌ **No AI or audio analysis** in v1 — no tone scoring, pitch detection, posture
  tracking, or "AI teacher" judgement. The app organises; it does not grade.
- ❌ **No guilt‑driven copy.** Insights are neutral observations, never nags.

## The Pathway is a trust anchor — keep it that way

Pathways exist so the user can **stop deciding what's next and just practise**, at their
own pace, on a route they trust. Protect that:

- **The item is the only unit of work — pathways are a view over items.** There is no
  separate "step" object. A `PracticeItem` may carry a `stageId` (placing it inside a
  pathway stage), a `strand`, and a `catalogKey`. Stage progress is *derived* from the
  mastery status of the items in it (`itemStageState` in `pathways.ts`). Never reintroduce
  a parallel to-do list next to items.
- **The catalog is reference data in code, not persisted.** `pathwaySeed.ts` defines
  per-stage `CatalogEntry` suggestions (gushes, lesson areas) with `about` guidance for
  conscious practice; `addFromCatalog` turns one into a real item with one tap. The new
  item is honestly **"Not practised yet"** (status `new`, zero stats) with an immediate
  Undo — adding is organisation, not progress. Label suggestions as reference aids, never
  canonical. Improving the catalog needs no migration; keep entry keys stable per stage.
- **Adding from the catalog is losslessly reversible.** The Undo is DURABLE (persists until
  dismissed or the item is practised — no timeout), and a fresh catalog item shows a "Remove"
  affordance on its row and in the item's "Connected to". `isLosslesslyRemovable`
  (`pathways.ts`, tested) gates this: `catalogKey` set AND status `new` AND zero blocks AND
  `timesPractised === 0`. The store's `removeCatalogItem` re-checks the predicate against
  LIVE blocks before delegating to `deleteItem`; once anything is logged, only the ordinary
  delete-with-confirm remains. This is the one place a stage row grows a second 44×44 action
  (− beside ▶); it disappears the moment the item is practised.
- **Structure, not gamification.** Show honest position (items solid / in progress /
  suggestions remaining). No streaks, scores, or fabricated mastery %.
- **Pathways/stages stay editable data** (`pathways`, `pathwayStages`, `pathwayRoutines`)
  with full CRUD. Sections are the stages' `group` string (rename via `renameSection`;
  new stages pick their section explicitly). Deleting a stage/pathway must never delete
  items — only detach them, and clear any stale `currentStageId` pin.
- **Routines are ordinary editable data belonging to an instrument** (`src/domain/routines.ts`,
  tested; CRUD in `src/store/useStore.ts`; editor at `src/pages/RoutineEdit.tsx`, route
  `/routine/new` or `/routine/:id/edit`). `PathwayRoutine.instrumentId` is optional at rest
  (a pre-v11 or General-pathway routine may have none — never fabricated) but REQUIRED for
  every routine created from now on; editing an already-unscoped legacy routine (e.g. just
  renaming it) must not invent one either — `RoutineEdit.tsx` defaults the Instrument field
  to the existing routine's own value (possibly none), never to `instruments[0]`, and only a
  brand-new routine requires a choice before Save is enabled. `pathwayId`/`stageId` are
  optional PLACEMENT, not identity, so a routine can exist unplaced ("my Setar warm-up");
  deleting a pathway or stage DETACHES its routines (clears the placement) rather than
  deleting them — pathway deletion clears both `pathwayId` and `stageId`, stage deletion
  clears only `stageId`. `RoutineSegment.itemId` optionally binds a segment to a real
  `PracticeItem`; a bound itemId must always match the routine's instrument, enforced at
  every edge (item deleted → unbind everywhere; item's instrument changes → unbind from
  now-mismatched routines; routine's instrument changes → clear mismatched bindings and
  detach an incompatible placement; pathway's instrument changes → detach an incompatible
  placed routine) — never by silently rewriting either side's instrument. `retargetRoutineInstrument`
  (`routines.ts`) is the one place these invariants are checked, and the store's `addRoutine`/
  `updateRoutine` call it UNCONDITIONALLY on every create and every save, not only when the
  instrument changed — a form is never trusted on faith for bindings or placement it didn't
  actually re-derive. That check also covers a `pathwayId`/`stageId` that doesn't actually
  resolve, not just one whose instrument mismatches: `addRoutine`/`updateRoutine` look up the
  routine's claimed pathway AND stage live and pass both into `retargetRoutineInstrument`,
  which never treats an unresolved `pathwayId` as an unscoped (therefore "compatible") General
  pathway just because the lookup came back `undefined` — a placement pointing at a pathway
  that no longer exists is cleared entirely, and a `stageId` that resolves to a *different*
  pathway's stage is cleared on its own, leaving an otherwise-valid `pathwayId` placement
  untouched. This is deliberately a save-time check, not a live one: editing a
  routine while it is ACTIVELY RUNNING (unbinding an item, changing the instrument) is
  allowed with no "is this active" guard, because `RoutineRunner.tsx` freezes the run's
  segment list (`activeRoutine.authoredSegments`/`segs`) at start and never re-derives it
  from the routine's current data — so a mid-run edit can never shorten or desync the
  in-flight run, and `finishRoutine` still records the genuinely-elapsed minutes against
  whatever item was actually practised. Discarding that instead would silently lose real
  practice, which nothing in this app is allowed to do. Finishing a run writes **at most one
  block per distinct bound item, never one per segment** — `aggregateItemMinutes` sums the
  ACTUAL elapsed running time across every visit to that item's segments (the seeded CGS
  Stage 1 routine repeats "Chunk chords" four times on purpose). The block's result stays
  the factory default `not_logged`: a routine records time, never a judgement, and never
  completes a review or advances SM-2. `focusForItem` (`src/domain/defaults.ts`) is the
  shared strong focus default — the same one `startItemSession` uses — so a routine block
  is indistinguishable from starting that item directly; do not reintroduce a third copy of
  that fallback expression. The run in progress lives in the store as `activeRoutine`
  (ephemeral — never in `PracticeDB`, same shape as `active`/`activePlan`), not component
  state: navigating away (nav-bar tap, browser back) never silently loses genuinely-elapsed
  bound-item practice, matching how an active block already survives navigation, and only
  one routine can run at a time — starting a different one while another is active redirects
  to resume it instead of overwriting its in-flight time. More generally, only ONE practice
  clock of any kind runs at a time, enforced by the START **and** RESUME half of both:
  `startSession` (so `startItemSession` and Session Plan's `beginPlanSegment`, which both
  route through it) and `resumeSession` both refuse while `activeRoutine` is set;
  `startRoutineRun` and `resumeRoutineRun` both refuse while `active` is set — the same
  guard pair in each shared function covers every caller, rather than trusting each page to
  check both. Resume needs the same guard as start: `active`/`activeRoutine` are both
  persisted (`partialize`), so a dual state can reach a device from before this guard
  existed, and resuming either clock without checking the other would tick both at once, the
  same bug as a fresh concurrent start. Without either half, an ordinary block and a routine
  could run concurrently and log the same wall-clock interval twice. Guarding start and resume
  is not enough on its own: those guards only run on an in-app action, but the persisted dual
  state itself re-enters the store on every load through the persist middleware's `merge` —
  the only path by which a whole `active`+`activeRoutine` pair can reach live state without
  going through either guard (`importDB`/`resetDemo`/`clearAll` all explicitly null both, and
  a sync pull replaces only `db`) — so `merge` is the one place this closes for good. If
  `merge` finds both `active` and `activeRoutine` set, it freezes both (the same
  accumulate-and-stop transform `pauseSession`/`pauseRoutineRun` already do): each keeps
  whatever time had genuinely elapsed, but neither is left `running` with a live timestamp to
  keep ticking from, so a stale dual state can never silently double-log time going FORWARD
  again. The historical overlap up to the moment of the freeze is deliberately left on both
  sides rather than guessed away — there is no way to know from the data alone which of the
  two was the "real" one, and discarding either would silently lose genuinely-elapsed practice,
  which nothing in this app is allowed to do; it becomes a stale pair the ordinary finish/
  discard flow (and then the same start/resume guards) makes the user resolve one of, same as
  any other unclosed block. `RoutineRunner.tsx`'s "an ordinary block is already running"
  redirect applies even to the routine the store considers "mine": once both can exist as a
  frozen (not just running) pair, showing the routine screen just because it's the active one
  would land the user on a Resume button that silently no-ops (`resumeRoutineRun` refuses
  while `active` exists) — redirecting unconditionally to `/active` gives one deterministic
  screen to resolve first, instead of a dead button on whichever screen they happened to load.
  The pages that start a
  clock (`Today.tsx`, `StageDetail.tsx`, `RoutineRunner.tsx`, and — for the out-of-scope
  pages that still `navigate('/active')` after a now-blocked start — `ActiveBlock.tsx`
  itself) resolve the conflict by redirecting to whichever clock is actually running instead
  of leaving the user on a dead screen. `RoutineRunner.tsx` derives
  remaining time from a wall-clock elapsed-seconds value (`runElapsedSeconds`/`locateClock`
  in `routines.ts`), the same accumulated-plus-live-since-a-timestamp shape as
  `sessionElapsedSeconds` — so pausing genuinely freezes it and a backgrounded/locked phone
  catches up across MULTIPLE segment boundaries at once rather than losing time or advancing
  one tick at a time. Skip clamps the current segment's effective duration to whatever
  actually elapsed (never the full authored minutes); a segment played to completion keeps
  its full duration. Choosing "short on time" (`segmentsForRun`) drops every non-essential
  segment, honouring the syllabus's asterisk rule. "Finish routine" (mid-run) always saves
  whatever bound-item time has genuinely elapsed via the same `finishRoutine` path as natural
  completion — never a separate discard — with a caption stating that plainly, since ending
  early must never silently fabricate or silently lose practice. Today's Routines card is
  documented in its own bullet above.
- **The current stage is the user's choice.** Teacher-led work jumps around:
  `Pathway.currentStageId` (pin) always wins; "first incomplete stage" is only the
  fallback. Never treat linear order as truth for Setar/Tar.
- **Pieces can have parts** (`parentItemId`): parts are ordinary items grouped under a
  piece/étude, with a deterministic "practise this part now" pick (`pickNextPart`) and a
  calm stall hint (`stallHint`) — smaller unit or new strategy, never quotas.
- **"My repertoire" is a DERIVED lens, not new structure.** Repertoire has exactly
  three views: **Pathways · My repertoire · Practice list**. A "work" is any top-level
  item with Persian identity (dastgāh/form/composer/gusheh) or a full piece/gusheh type
  (`isWork`/`repertoireWorks` in `src/domain/repertoire.ts`, tested). Persian works
  group by dastgāh via `groupByDastgah` (`src/domain/persian.ts` — folds spelling
  variants, labels with the user's own majority spelling, standard dastgāh order) with
  radif gushehs and composed maestro pieces side by side; other instruments group by
  study source. Parent works appear ONCE; parts stay nested (never standalone
  duplicates). Form/composer are compact metadata + filter chips, never a deep
  hierarchy. Dastgāh/form suggestions are datalists (reference aids), free text always
  wins. Never invent a parallel "pieces" object or a guitar-specific model.
- **Sources stay simple.** A Material is instrument + one clear name + kind + status +
  note. Piece-level detail (dastgāh, gusheh, composer, teacher) belongs on items, never
  on sources — the removed parent-title/section/teacher-source fields must not return.
  Sources are reached from Repertoire (not More), and are creatable inline from the
  item form.
- **Seeds are honest starting points, never fabricated authority.** Guitar = CGS. Setar =
  a radif/dastgāh map (teacher-driven, explicitly "reorder me"). Tar = the Honarestān
  method. Dastgāh intros use standard characterisations; per-gushe `about` text stays a
  generic conscious-practice prompt (shāhed / ist / forud) — the teacher's account is the
  authority, never invent specifics as if canonical.
- **Calm, self-paced copy.** "Move on when it feels right, not by a deadline" is the voice.

## Lessons (classes) and the deadline exception

`Lesson` records (per instrument, date + free-form notes) support the user's real
workflow: record the class, rewatch it, type up notes (often **in Farsi** — all free-text
fields must stay direction-aware; `.input`/`.textarea` carry `unicode-bidi: plaintext`,
which is the only place that rule is set — it is NOT global, and display text gets its
direction from the grouping rule below), then
create/link the concrete practice items (`lesson.itemIds` — a link, never ownership;
unlinking keeps the item). "Originated in this lesson" (`itemIds`) is separate from
"work on before the next class" (`assignedForLesson`), which gives a per-instrument
priority boost that climbs as that instrument's next lesson approaches
(`lessonUrgencyScore`). This is the one sanctioned "deadline" in the app — a monthly
class is a real commitment, not a manufactured streak. Keep it per-instrument and
generic (future Tar/Guitar teachers), never guilt-toned. Attachments belong to an item
OR a lesson (`AttachmentMeta.ownerType/ownerId`; blobs keyed by `ownerId` in Dexie) for
SMALL files (PDFs/photos/short audio, size-capped). **Full class videos — and score
PDFs/docs — are NAS references, never bytes:** `Lesson.recordings` (`LessonRecording`)
holds title + a relative NAS path (or full https URL) + size/notes + an optional `kind`
(`LessonFileKind` = video/pdf/doc/audio; schema **v9** stamps legacy refs `kind:'video'`).
`resolveRecording` (`src/domain/recordings.ts`, tested) returns a discriminated
`ok|no-base|bad-base|empty` result — the scheme-less-base bug is fixed by
`normalizeBaseUrl` (prepends `https://`, rejects non-http(s), validates via `new URL`);
`resolveRecordingUrl`/`needsBaseUrl` are thin wrappers. It joins the ref under the
per-device NAS base URL (Settings, localStorage) and opens only on explicit tap — never at
startup, never in IndexedDB/sync/backups; a `bad-base` never `window.open`s. Removing a
reference never touches the NAS file. Lessons carry an optional `number`
(`nextLessonNumber` prefills it, editable, never required; shown as "Class N · date"); refs
render video-first then scores/docs with kind icons. The user's Setar class history imports
additively via `buildSetarClassLessons` (`src/domain/setarClasses.ts`, tested) →
`importSetarClasses`, which also **backfills** missing refs (video + one per PDF/doc,
path-deduped) onto already-imported lessons — idempotent. `SETAR_CLASS_SESSIONS` lives
between `// [scan:begin]`/`// [scan:end]` markers and is regenerated from the real NAS
folder by `npm run scan:setar` (`scripts/scan-setar-classes.mjs`, stdlib, dry-run by
default; pure helpers unit-tested) — references only, never copying bytes.

## Questions for next class

`questionsForNextClass` (`src/domain/questions.ts`, tested) collects items where
`assignedForLesson === true` AND `teacherQuestion` is non-empty, scoped to one
instrument, ordered by the Persian collator. Shown on the upcoming lesson and the
Teacher Report with Copy / Download / print-friendly export (`ClassQuestions`). A
question is NEVER auto-cleared by practising; the user edits the item to remove it.

## Persian text is canonical, and direction-aware

Built-in Setar/Tar data (pathway/section/stage names, catalogue gushehs, forms,
composers, study sources, seeded items) is authored in **Farsi**; generic app UI and
Classical Guitar stay English. STABLE ascii identifiers are decoupled from Farsi
display: `StageSeed.slug` / `StepSeed.key` in `pathwaySeed.ts` keep stage ids and
catalog keys byte-stable (fall back to `slug(code)`/`slug(title)` for English seeds), so
the Farsi conversion needs no migration. `src/domain/farsi.ts` (tested) provides
`normalizePersian` (fold Arabic↔Persian yeh/kaf, digits, ZWNJ, whitespace — preserves
آ), `faCollator` for sorting, and Latin transliteration aliases for search
(`persianSearchMatch`); `groupByDastgah` folds spelling variants and ranks by Farsi or
Latin dastgāh names. Every Farsi surface resolves its direction NATIVELY, via
`dir="auto"` — never by detecting a script in JavaScript and never by reordering text.
Free-text FIELDS also carry `unicode-bidi: plaintext` (set on `.input`/`.textarea` in
`global.css`, and nowhere else — this was previously described here as global, which was
never true).

**LAYOUT FOLLOWS THE DIRECTION OF THE CONTENT IT SHOWS.** A title and the details that
belong to it sit in ONE group carrying `dir="auto"`, so a Persian item reads as one
right-aligned block. Before 2026‑09‑11 direction sat on the TITLE alone at 47 sites and
on no container anywhere: a Farsi title resolved RTL and hugged the right edge of its
cell while its own "due 14 days ago" caption, carrying no direction at all, hugged the
left — the app looked polished in English and broken on the two instruments whose seeded
data is entirely Farsi. The rule is now mechanical, not a matter of care:

- `dir="auto"` appears on GROUPS (the element holding a title together with the details
  that belong to it) and on free-text FIELDS — **never bare on a title element**
  (`truncate`, `title-md`, `page-title`, `stage-unit-title`).
- The group is drawn so the TITLE is the first strong text inside it. Where an English
  eyebrow precedes the title in the DOM — Today's Practise-now card, the close screen's
  header, Session Plan's minutes/bucket line, ItemDetail's "practise this part now",
  Today's Routines doorway ("Resume your routine"/"Routines" precedes the routine's own
  name), ActiveBlock's "Last time you decided to try:"/"Working on:" — the group wraps
  title + details and LEAVES THE EYEBROW OUT, because `dir="auto"` resolves from the
  first strong character in the subtree. Getting this backwards doesn't just mis-align:
  Today's Routines buttons carried `dir="auto"` on the whole button, so the fixed English
  label — not the Farsi routine name that followed it — decided the resolved direction,
  and the button never read the name at all.
- **A detail that mixes languages needs its OWN nested `dir` inside the group, not the
  group's resolved direction.** Two different cases, two different attributes:
  - A detail that is ALWAYS ENGLISH BY CONSTRUCTION — `buildReason`/`planSegmentReason`'s
    generated sentences (Today's recommendation reason, ItemDetail's "practise this part
    now" reason, Session Plan's segment reason) — carries its own `dir="ltr"` isolate
    around the whole sentence, nested inside the group. Grouped under a Farsi title, that
    div/paragraph still resolves RTL and the detail still sits in the same right-aligned
    block (nothing about ALIGNMENT changes) — but the isolate fixes the sentence's OWN
    bidi base to LTR, so the title's RTL base can no longer drag the sentence's trailing
    full stop to the visual start (FriBidi renders a trailing neutral character using the
    surrounding base direction when nothing more specific claims it). `dir="ltr"` here is
    a static fact about content that is never user text, not detection.
  - A detail that is FREE TEXT the owner typed (ActiveBlock's `constraint`/`problem`,
    the "last time you decided to try" note) sitting after a fixed English label —
    `Constraint: `, `Working on: `, `Last time you decided to try: ` — carries its own
    `dir="auto"` around just the value, not the label. The label would otherwise be the
    subtree's first strong text (the same eyebrow bug as above) and pin the whole line to
    English regardless of what the owner actually typed.
- A group that sits under an ancestor pinning `text-align: left` OR `text-align: center`
  must set `text-align: start` on itself, or its own direction never reaches the
  alignment — ActiveBlock's whole screen centres its timer and buttons regardless of
  language (that stays, it isn't text), but the title group overrides back to `start`
  so ac-6's "English stays left, Farsi goes right" actually holds on that screen. This
  is a deliberate LAYOUT CHANGE for English on Active specifically (centred → left) and
  does not conflict with "English keeps its layout exactly as it is today" elsewhere in
  this file: that non-goal protects English from being flipped to a Farsi-style
  right-align, it was never a promise that Active's pre-existing centring was sacred —
  ac-6 names Active as a checked surface with exactly this expectation.
- Group HEADINGS that render Farsi (the dastgāh sections, Materials' instrument sections)
  take direction on the SECTION, so a heading can no longer disagree with the rows
  beneath it.
- A lone title with no caption of its own takes the group it shares with its badge or
  action — the row itself.
- OUT of scope by construction: `<option>` contents (the native control owns their
  rendering) and titles inside `confirm()`/toast template strings (plain strings, not
  laid-out blocks). `ItemForm.tsx`, `QuickAdd.tsx` and `RoutineEdit.tsx` hold field sites
  only and are correct as they are.

`src/components/direction.test.ts` holds this closed and records the surface list, so a
missed title FAILS and a whole skipped file FAILS — and "fixing" one by deleting the
attribute fails too, since that would break Farsi rendering outright. Genuine exceptions
live in that test's explicit allowlist AND here; **the allowlist is currently EMPTY**,
because every title on every surface turned out to have a group it could join. An
exception must always be VISIBLE, never silent.

**"a whole skipped file fails" is not the same guarantee as "a deleted site fails."** A
per-FILE check ("does this file have at least one group somewhere") stays green as long
as one group survives anywhere in the file — so deleting the Practise-now card's own
`dir="auto"` from Today.tsx, which carries several other unrelated groups, passed that
check even though the one thing it was there to prove had broken. `GROUP_SITE_INVENTORY`
in that test is the fix: every group-level site, recorded in file-then-source order,
DUPLICATES INCLUDED (three bare `<div dir="auto">` in Today.tsx are three sites, not one
collapsed entry, or removing one of the three would still pass a de-duplicated list), and
asserted with `toEqual` against the live scan. Deleting any one recorded site — anywhere,
in any file — shrinks or reorders that array and fails, regardless of what else survives
in the same file. It carries the same visibility contract as the title allowlist: a
legitimate new group site must be added to the recorded array (a test fails until it is),
never inferred silently. The scanner also strips `//` and `/* */` comments before
matching — this file's own prose repeatedly writes the literal string `dir="auto"`, and
matching inside a comment either produces a site with no real enclosing tag or, worse,
walks backward out of the comment and mis-attributes an unrelated tag from earlier in the
file.

**A GROUP CARRYING DIRECTION IS NOT THE SAME CLAIM AS EVERY CHILD IN IT HAVING ITS OWN.**
A sealed review rejected the first pass at this section for exactly that gap: the
inventory above proves a title and its details share ONE resolved direction (the fix this
whole rule exists for), but it says nothing about a CHILD inside that group whose own
bidi base needs to be independent of the title's — a Farsi title makes the group resolve
RTL, and anything else in that subtree with no `dir` of its own is exposed to that same
RTL base. That is exactly right for a caption that belongs to the title (the point of
grouping), but wrong for two other shapes:

- **Fixed English page copy or generated metadata** — a hardcoded sentence
  (`CloseBlock`'s "A few seconds to capture what happened.", `StaleNote`'s "Running far
  past its target…"), or a phrase built from numbers and English words
  (`{n} segments · {m} min`, `due {relativeDay(...)}`) — is never user text and never
  changes language, so it carries its own `dir="ltr"` isolate, nested inside the group,
  the same shape already established for `reason` props (Today/ItemDetail/SessionPlan).
  The counterexample the review found: `CloseBlock.tsx`'s "A few seconds…" sentence sat
  bare in the item-title group, so a Farsi title made its trailing full stop render at
  the visual start — the same defect this section already fixed once, reappearing one
  level down. `TodayRoutineRow`/`PathwayDetail`'s `RoutineRow`/`StageDetail`'s
  `RoutineCard` all render the identical "N segments · M min" phrase and all needed the
  same isolate — a fix applied to one occurrence of a repeated pattern and not the
  others is exactly the kind of gap this closure exists to catch.
- **An independently-authored value** — a question, a problem, an observation, a
  pathway's own description or note — carries its own `dir="auto"` isolate for the same
  reason `ActiveBlock`'s `constraint`/`problem`/`previousNextAction` already do: its
  language cannot be assumed from the title sitting next to it. The counterexample:
  `ClassQuestions`' question/problem/last-observation sat bare in the title's `<li>`
  group with no isolate of any kind — unlike `ActiveBlock`'s established shape (a fixed
  English label left bare, immediately followed by the value in its own `dir="auto"`),
  which `ClassQuestions` now matches rather than inventing a third pattern.

**THIS IS DELIBERATELY NOT "no bare Latin text in a group."** A short fixed label
immediately followed by its own isolate — `Constraint: ` before
`<span dir="auto">{value}</span>`, `Problem: ` before the same shape in
`ClassQuestions` — stays bare on purpose; flagging it would force a change to an
already-correct, already-reviewed pattern. What actually breaks is a real PHRASE that
reaches the end of a group's rendered content with nothing to isolate it — which is
what `src/components/direction.test.ts`'s `unexemptedPhrase` scans for mechanically: it
walks a group's body in source order, accumulating exposed literal text, and clears
that accumulation the moment it is immediately followed by any element carrying its own
`dir=` — regardless of the accumulated text's length, which is what keeps the
`ActiveBlock` label shape passing. Only a run that survives to a TAG boundary (not an
expression boundary — `{n} segments · {m} min` is one generated phrase split across two
expressions and must not fragment into single, individually-innocent words) and reads
as two or more words is flagged. This is the "detectable, not enumerated" half the
rejected review asked for: a NEW hardcoded sentence dropped into a group without its own
isolate fails this test on its own, the same way a missed title already failed the
group-vs-title test above.

What that scan cannot see from source — an independently-authored VALUE (an
expression whose content is opaque, like `{q.currentProblem}`) needing `dir="auto"`, or
a component like `StaleNote` whose OWN return value needs to be isolated regardless of
which title group calls it — is a recorded ledger instead, `ISOLATED_VALUE_SITES` and
`LTR_ISOLATE_SITES` in the same test file, carrying the identical visibility contract as
`GROUP_SITE_INVENTORY`: a legitimate new one must be added, visibly, or the test fails
until it is.

**AN ISOLATE MUST BE INLINE. A BLOCK CARRYING ONE RESOLVES ITS OWN ALIGNMENT,
INDEPENDENTLY OF THE GROUP.** A third rejected review found `ItemMaterial.tsx`'s NAS/
device detail line isolated with `<div className="tiny faint" dir="ltr">…</div>` — the
isolate correctly fixed the sentence's own bidi ordering, but moved the BUG rather than
fixing it: `text-align: start`, inherited from the group, is a per-box COMPUTED value
that resolves against THAT box's OWN `direction` — give the div its own `dir="ltr"` and
its `text-align: start` resolves LEFT regardless of the group's (possibly RTL) resolved
direction, splitting the detail from a right-aligned Farsi title exactly as before, just
relocated one level down. An inline isolate (`<span dir="ltr">`, nested inside a block
that carries no `dir` of its own) never has this problem: `text-align` only governs how a
BLOCK aligns its own content, and a `<span>` is not itself a block — even where a flex
container blockifies it into a flex item, that item sizes to its content, so there is no
extra width for its own `text-align` to act on. Its `dir` therefore only ever isolates the
Unicode bidi algorithm's treatment of the text inside it, never which edge anything
visually sits on — the established shape throughout this file was always the span form,
and the block form was a new, narrower regression in one fix. `direction.test.ts` now
bans the shape mechanically rather than by care: no
`dir="ltr"`/`dir="rtl"` may sit on any tag but `span`/`bdi`, full stop, so this class of
bug cannot resurface in any file, named here or not — one location fixed and the anti-
pattern deleted are two different guarantees, and only the second is durable.

**A NATIVE LIST MARKER'S OWN LOGICAL POSITION IS NOT SOMETHING A GUTTER MEASUREMENT CAN
GUARANTEE.** The third rejection found `ClassQuestions.tsx`'s `<ol>` reserving gutter
space with `paddingInlineStart` alone while each `<li>` resolves its OWN direction via
`dir="auto"`, and fixed it with symmetric `paddingInline` instead, reasoning that a
marker landing on either side would then have room. A SIXTH SEALED FINDING, checked on
the owner's own iPhone, found the number still escaping the card even with that room
reserved: an outside `::marker`'s exact position for a direction-variable list item is a
browser implementation detail — exactly the class of thing jsdom cannot compute either,
which is why a padding measurement was ever trusted to stand in for it — not a distance a
gutter can be sized against. The fix stops accommodating the native marker and removes it
instead: `listStyle: 'none'` on the `<ol>`, with the ordinal rendered as a real element,
the FIRST child of a flex `<li dir="auto">`. Flexbox's row axis is direction-aware BY
SPECIFICATION (`flex-direction: row`'s start is the writing mode's own start, not a fixed
physical side), so the number leads on the right for a Farsi question and on the left for
an English one — and because it is now an ordinary flex child inside the `<li>`'s own
content box, rather than a marker rendered in the padding area outside it, it can no
longer escape the card on any device. It carries no `dir` of its own (a digit is
bidi-neutral, so `dir="auto"` on the `<li>` skips it and still resolves from the title as
before) and neither does the wrapper around title/question/details: `dir="auto"` skips a
descendant that carries its own `dir` when hunting for a first strong character, so
giving the wrapper one would leave the `<li>` with no resolution source at all — the same
class of regression the `stage.title` revert and the instrument-name checks above already
found. `direction.test.ts` now asserts the mechanism directly rather than a proxy for it:
every `<ol>`/`<ul>` containing a `dir="auto"` `<li>` must disable the native marker
outright, and that `<li>` must itself be a flex/grid container able to reorder its own
content — a shape check on the fix itself, not a measurement around a browser behaviour
nothing here can verify.

Removing the native marker has an accessibility cost the visual fix alone doesn't pay
back: WebKit drops an `<ol>`'s own list semantics from the accessibility tree once
`list-style: none` removes its marker, so VoiceOver on the owner's own iPhone — the exact
device this fix targets — would stop announcing "list, N items" or a question's position
in it. `role="list"` on the `<ol>` restores that; the visible ordinal carries
`aria-hidden` so it is not announced a second time on top of it.

**A ROW'S OWN ALIGNMENT COMES FROM THE VALUE, NEVER FROM A LABEL MARKED OUT OF THE HUNT.**
The sixth finding also covered `ClassQuestions`' `Problem:`/`Last time:` lines, diagnosed
at the time as a WRAP-alignment gap: the established shape — a fixed English label left
bare, immediately followed by the value in its own `dir="auto"` isolate — gives the
value's own CHARACTERS correct bidi order, but a plain inline span has no width of its own
to align a wrapped line within, so a long value was given `display: 'inline-block'` +
`textAlign: 'start'` to align its OWN wrapped lines independent of whatever surrounded it.

A SEVENTH SEALED FINDING found that diagnosis addressed the wrong claim. Giving the value
its own wrap-line alignment is not the same claim as giving the ROW — the element that
actually positions "Label: value" as a unit — the right alignment in the first place. The
row itself was left BARE in both the original and the wrap-alignment fix, so it inherited
whichever direction the TITLE above it resolved to, regardless of what script the VALUE
was written in. For a Farsi title with a Farsi value this looked right by coincidence
(inherited-from-title happened to match the value); for an English-titled item with a
Farsi problem note, the whole row stayed pinned left — the label's inherited position, not
the value's own — with the value's internal characters shaping correctly but its overall
POSITION wrong regardless of whether it wrapped. This is exactly the "a group carrying
direction is not the same claim as every child in it having its own" family two sections
up, just not yet applied to a row whose OWN direction, not merely a child's bidi base,
needed to track an independently-authored value.

The fix moves `dir="auto"` from the value to the ROW, and marks the LABEL — never the
value — with its own `dir="ltr"`. Not because the label's text ever changes: `dir="auto"`
skips a descendant that carries its own `dir` when hunting for a first strong character
(the exact mechanism the eyebrow/title split above already relies on), so marking the
label takes it OUT of that hunt and leaves the deliberately bare value as the row's only
candidate. Marking the value too would take BOTH out, leaving the row with nothing to
resolve from and a silent fallback to LTR no matter what the value says — confirmed to
fail the new check when tried, alongside the opposite mutation (removing the label's
`dir="ltr"` entirely, reverting to the original bug), which the pre-existing
`unexemptedPhrase` check also independently catches. Verified across all four
title/value language combinations at both a 350px (iPhone-card-width) and a 700px
(desktop) container width: a value's own language determines its row's alignment
independent of the title, in both directions, at both widths — and with all four lines
(title, question, Problem, Last time) now agreeing, the block reads as one attached unit
against the marker rather than two aligned lines and two stray ones.

`direction.test.ts` replaces the two `ISOLATED_VALUE_SITES` snippet entries with a SHAPE
check, `isLabelFirstAutoRow`: any `dir="auto"` group whose body opens with a
`<span dir="ltr">…</span>` must have no other `dir=` anywhere else in its body. It is not
anchored to `ClassQuestions.tsx` — it would catch the identical regression in any future
file adopting this label-first-row pattern, the same "shape, not a location list"
discipline the instrument-name and native-marker checks above already established. This
is deliberately NOT generalised to `ActiveBlock`'s
`constraint`/`problem`/`previousNextAction` or `RoutineRunner`'s `Next:` label, which use
the older bare-label-then-isolate shape: those fields sit directly under their own title
in this app's real data (never independently mismatched), so the failure this fixes does
not arise for them, and touching files this lane's own brief did not name would be scope
the sealed finding never asked for.

**THE MARKER/TITLE GAP AND THE RAGGED LEFT EDGE ARE TWO DIFFERENT CLAIMS, AND ONLY ONE OF
THEM WAS EVER BROKEN.** A follow-up OWNER pass on this same finding read as a second,
distinct complaint — the ordinal "looked" detached from a Farsi question because the
Problem/Last-time lines sat at the opposite (left) edge while the title and question sat
right, an asymmetry a screenshot reads as "the number is not attached" even though the
title itself was never the problem. Measured directly against the live DOM (real seeded
Farsi data, cloned at a 340px container width, text extents read via
`Range.getClientRects()`, not `getBoundingClientRect()` on the boxes): the ordinal's right
edge sits at 338px, the title/question/Problem/Last-time lines all right-align flush
against 330px — an 8px gap matching the authored `gap: 8` on every one of the four lines,
not just the title. The remaining LEFT edges spread across a 143px range (62px-205px),
because the four lines are different lengths and each is right-aligned within a box whose
own right edge is pinned to the ordinal regardless of the box's width. That spread is
mathematically invariant to how the box is sized: left edge = box_right minus line_width,
and box_right never moves, so switching the wrapper from `flex: 1` (this file's `.grow`)
to shrink-to-fit was tried and measured byte-for-byte identical before and after — proof
that no flex-sizing change can touch it, because there is nothing wrong with the sizing to
begin with. A ragged left edge on right-aligned lines of differing length is ordinary
typography (the same thing an address block or a right-aligned caption does), not a
resolvable defect, and the row-direction fix above is what actually closed the gap the
owner was reacting to for THAT screenshot: before it, Problem/Last-time sat at the FAR left
(~25px, the opposite edge entirely) while title/question sat at ~330px — a hard
two-line/two-line split, not mere length variance. Once all four lines agree on which edge
they hug, the remaining spread is length variance, and no further padding or flex-sizing
change was warranted for it specifically. **This measurement is scoped to the ragged-edge
question alone and is NOT a claim that every marker-attachment complaint was closed** — a
NINTH finding below, on the exact same screenshot's underlying data, found a real,
different structural bug in how the `<li>` itself picks its resolved direction. Read that
finding for the actual fix; do not re-derive "nothing more to do here" from this measurement
a second time.

**THE `<li>`'S RESOLVED DIRECTION WAS ANCHORED ON THE WRONG CANDIDATE — THE OPTIONAL TITLE,
NOT THE GUARANTEED QUESTION.** All of the verification above — this file's and the
Seventh/Eighth findings' — used seed data where an item's title and its `teacherQuestion`
happen to share a language. That is exactly the one condition under which the underlying
bug is invisible: `<li dir="auto">`'s hunt for a first strong character skips any
descendant that carries its OWN `dir` (the same skip mechanism used throughout this file),
and both the question and the Problem/Last-time rows already carried their own `dir="auto"`
isolates — so the hunt could only ever land on the bare TITLE. Whichever language the TITLE
happened to be in decided which side the ordinal rendered on, regardless of the question's
own language. An OWNER pass with a title and question in DIFFERENT languages (reproduced
directly against the live running app — the real Teacher Report page, not a clone — by
temporarily setting an English title on the real seeded Farsi item via the store) showed
this concretely: the ordinal and title landed together on the English side, while the
question — right-aligned by its own independent `dir="auto"`, correctly, on its own terms —
sat at the FAR OPPOSITE edge, unattached from the marker entirely. The reverse combination
(Farsi title, English question) reproduced the mirror image. Neither combination is exotic:
an item's title is free text the owner chooses for their own reasons and has no obligation
to share a language with a teacher's question about it.

The fix reverses which of the two is left bare. `questionsForNextClass` guarantees
`q.question` is non-empty on every row this component ever renders (it filters on exactly
that field); `q.title` carries no such guarantee and is authored completely independently.
The title now carries its OWN `dir="auto"` isolate (the same skip mechanism, deliberately
applied to the OTHER field this time), so it renders in its own correct direction but is
taken OUT of the `<li>`'s hunt; the question is left bare, so it is what the `<li>`'s
`dir="auto"` actually finds — the marker now always tracks the question, the one field
guaranteed present, never the optional title. Structural, not padding: this is the same
skip mechanism this file already relies on throughout, applied to the correct field.
Verified directly against the real, running page
(not a synthetic clone) at both a 390px (real DOM node, width forced via the live element's
own style, not `resize_window` — which does not affect layout in this environment — so the
SAME component tree is exercised, just narrower) and the full desktop width: an English
title with a Farsi question now attaches the marker to the question (right) with the title
independently left-aligned; a Farsi title with an English question attaches the marker to
the question (left) with the title independently right-aligned; the original matching-language
case (both Farsi) is unaffected. `direction.test.ts` records this as a dedicated,
mutation-tested shape check (`"the question anchors ClassQuestions' <li>..."`) asserting the
title's tag carries `dir="auto"` and the question's does not — confirmed to fail under both
reverted mutations (title bare again; question marked again) before being committed.

**THE LESSON THIS FILE KEEPS RELEARNING:** matching-language seed data proves a fix works
when title and value AGREE, and says nothing about what happens when they DISAGREE — the
Seventh finding's row-direction fix and this Ninth finding are the same shape of gap,
found twice because the same seed data was trusted twice. Any future verification of a
mixed-language surface in this file should deliberately construct a MISMATCHED case, not
only the matching one already in the seed.

**THE SOURCE SCANNER'S OWN BLIND SPOT WAS THE BIGGER GAP.** `unexemptedPhrase` skipped
every `{…}` expression as fully opaque, contributing zero words — which is exactly
right for a single expression like a title, but means a run built ENTIRELY from
expressions (`{MATERIAL_SOURCE_LABELS[m.sourceType]} · {MATERIAL_STATUS_LABELS[m.status]}
·{' '} {itemCount(m.id)} item{…}`) read as zero words to the scanner while rendering
three always-English fragments in a row, unisolated, in a group whose title could
resolve RTL. This is precisely why the named counterexamples (`Materials.tsx`,
`ItemCard.tsx`, `RoutineRunner.tsx`, `Lessons.tsx`, `Repertoire.tsx`) passed a test that
was supposed to catch them. Fixed by counting an opaque, non-JSX-bearing expression as
ONE token rather than zero — its actual text stays invisible from source, but its mere
UNISOLATED PRESENCE next to other content is what the shape is; an expression whose own
content contains nested JSX (`{cond && <div dir="auto">…</div>}`) stays fully opaque, its
children already reachable by the outer whole-file scan. That single change, plus
re-auditing every recorded group's body by hand, found the five named sites AND several
more of the identical shape the review did not enumerate: `Repertoire.tsx`'s SECOND,
near-duplicate dastgāh-count span (the non-Persian `sourceGroups` branch mirrors the
fixed one exactly and had been missed), `ActiveBlock.tsx`'s mode/focus chips (the
practice screen itself), `Attachments.tsx`'s and `ItemDetail.tsx`'s file kind/size line,
`StartBlock.tsx`'s and `Today.tsx`'s item-type/status labels, `StageDetail.tsx`'s
strand/status `meta` line, `PathwayDetail.tsx`'s "Current"/"Done"/item-count badges and
its piece-count fallback, `Today.tsx`'s "routine running" indicator (at the time, one
`dir="ltr"` isolate covering the whole phrase — a sealed review later found that this
wrongly pinned the instrument name inside it too; see below) and its cross-instrument
Overview row (a fixed sentence embedding the next item's own possibly-Farsi title —
isolated the same way `StageDetail`'s undo banner already does, whole sentence under one
`dir="ltr"`), and `Insights.tsx`'s generated observation sentences (several of which also
embed an item's own title mid-sentence). One further site needed the OTHER isolate —
`dir="auto"` for a value authored independently of its neighbour, not `dir="ltr"` for
generated copy: `RoutineRunner.tsx`'s "Next: {label}" (the upcoming segment's own name).
`PathwayDetail.tsx`'s pathway `source` field got the same treatment (free text beside the
instrument name, at the time itself still wrongly isolated as `dir="ltr"` — see below),
but its stage's own `title` was tried the same way and REVERTED: `stage.title` is not authored
independently of `stage.code`, it is the SAME stage's own fuller name, and this file
already settles (a few paragraphs up) that the two must AGREE on whichever direction
the group resolves — isolating `stage.title` would have pulled it OUT of the button's
own `dir="auto"` detection (a nested `dir` is skipped by the HTML auto algorithm),
which can flip the group's resolved direction whenever `stage.code` itself carries no
strong character. It stays a bare `<span>`, exactly like `stage.code`.

**RE-DERIVING THE TEST'S OWN TAG TRAVERSAL FROM FIRST PRINCIPLES FOUND A DEEPER GAP
THAN ANY SINGLE MISSED FILE.** `elementBody` (the helper both `unexemptedPhrase` and
the isolate-skip logic use to find where an element's content ends) tracked nesting
depth by incrementing on every opening tag and decrementing on every closing one —
except a React Fragment shorthand, `<>`, starts with neither `/` nor a letter, so it
matched NEITHER branch and never incremented depth, while its own close, `</>`, starts
with `/` and DID match the closing branch, decrementing it. Every `<>…</>` pair inside
a body therefore owed depth one MORE decrement than it was ever given an increment for
— and this codebase's own established shape for a conditional detail
(`{stage && (<><span>…</span><Link>…</Link></>)}`, exactly what `ItemDetail.tsx`'s
header uses) hits that shape twice. On that header, depth reached zero several tags
before the real `</header>`, so `unexemptedPhrase` silently stopped scanning before
ever reaching `<span className="tiny faint">difficulty {item.difficulty}/5</span>` — a
real, unisolated generated-English phrase that had been sitting in the group
throughout every previous pass of this lane, invisible to a scanner whose entire claim
is "detectable, not enumerated." Fixed by giving `<>` the same weight as any other
opening tag. Re-running the FULL suite after the fix surfaced exactly this one
violation — nothing else in the currently-scanned files was hiding behind the same
bug — now closed with the same `dir="ltr"` (at the time, `instrumentName` sat in this
same list too — a sealed review later found that wrong; see below — plus
`ITEM_TYPE_LABELS`, "difficulty N/5", "saturated — consider resting") the rest of this
section already established, while `stage.code` and the material label stay bare for the
same reason `stage.title` does two paragraphs up. The lesson generalises beyond this one bug: an
example-driven fix only ever closes the examples in front of it; only re-deriving a
shared helper's own correctness from what it claims to do (does `<>` open or close a
nesting level? — the answer was always "both, and this code only handled one") finds
what a location list, however carefully audited, cannot.

Two sites the stronger scanner flagged are recorded, VISIBLY, as genuine exceptions in
`UNEXEMPTED_PHRASE_ALLOWLIST` rather than isolated: `PathwayDetail.tsx`'s stage-progress
counter (`{sp.done}/{sp.total}`, e.g. "3/5") is digits only — numbers carry no bidi risk
the way an English WORD dropped into an RTL run does — and `ItemDetail.tsx`'s
pathway-plus-stage breadcrumb (`` `${pathway.name} — ` `` immediately followed by
`{stage.code}`) is one continuous compound LABEL built from two fields, not a title
split from an unrelated caption; there is no separate "caption" here with an opinion of
its own about direction. The allowlist carries the same visibility contract as
`ALLOWED_TITLE_SITES` — a stale entry (naming a site that no longer exists) fails its own
test.

**THE SCANNER'S OWN COMMENT-STRIPPING HAD A LATENT BUG THAT THIS WORK EXPOSED.**
`stripComments` treated any `'`/`"` as a real string delimiter and scanned forward,
unbounded, for its match — correct for a real JS string, wrong for plain JSX TEXT
containing an apostrophe (`StageDetail.tsx`: "That stage doesn't exist."). Hitting that
apostrophe outside any real string put the scanner into a phantom "inside a string"
state that swallowed everything after it — real comments included — until an unrelated
quote character somewhere later happened to close it, cascading into a chain of further
phantom strings for the rest of the file. This had been silently true all along; it only
surfaced now because a newly added comment happened to be inside the corrupted span and
happened to quote `dir="ltr"` in its own prose, which the (no longer stripped) comment
then exposed to the `dir="ltr"`/`dir="rtl"` block-isolate scan as if it were a real
attribute. Fixed at the root rather than by rewording the comment: a `'`/`"` now only
starts a real string if its matching quote appears before the next newline (every real
string/attribute value in this codebase is single-line); otherwise it is passed through
as ordinary text and scanning resumes normally right after it. Backtick template
literals keep their original unbounded, multi-line scan. This makes EVERY check in this
file more trustworthy, not just the new ones — the exact failure mode the file's own
`stripComments` docstring already warned about ("worst, `enclosingTag` walking backward
out of the comment and mis-attributing an unrelated tag") was silently possible for any
file containing a stray apostrophe in plain prose, this codebase's Setar/Tar seed data
included.

**AN INSTRUMENT NAME IS THE OWNER'S OWN EDITABLE TEXT, NEVER GENERATED COPY — GETTING
THIS BACKWARDS IS A CLASSIFICATION MISTAKE, NOT A MISSED LOCATION.** A sealed review
found four sites (`ItemCard.tsx`, `ItemDetail.tsx`, `PathwayDetail.tsx`,
`Repertoire.tsx`) pinning an item's or work's instrument name under `dir="ltr"` right
alongside genuinely generated metadata like `ITEM_TYPE_LABELS` — Settings lets an
instrument be renamed, Farsi included, so forcing a renamed instrument to LTR gives it
the wrong bidi base, the exact defect every other isolate in this file exists to
prevent. Auditing every remaining `LTR_ISOLATE_SITES` entry against its real source
(not just the four named) found a fifth of the identical shape — `Today.tsx`'s "routine
running" row bundled the instrument name and the fixed English suffix into ONE
`dir="ltr"` span — and two more with no direction treatment AT ALL, invisible to that
same audit because it can only see spans that already carry a `dir`: the Plan doorway's
mismatched-instrument row (the exact twin of the routine row, same bundling, just
missing the isolate rather than misusing it) and the weekly Balance row's instrument
name, sitting bare inside a `.truncate` title span. All seven now isolate the
instrument name on its own `dir="auto"` — nested one level in for the Balance row
rather than on `.balance-row` itself, because that row is a CSS GRID and giving IT a
resolved RTL direction would reverse its three columns for a Farsi instrument, flipping
the bar and percentage to the other side. The fix generalises past these seven
locations: `direction.test.ts` now also fails if any `dir="ltr"`/`"rtl"` isolate's body
references `instrumentName` — a call, a bare identifier, or a property access like
`b.instrumentName` all match, not only the call form (the widened check was itself the
product of a caught regression: an earlier `\binstrumentName\(` version missed the
Balance row's own property-access form) — or ItemCard's own `inst` alias for it, so a
future regression anywhere in the file is caught by the SHAPE, not by whichever site a reviewer
happened to name.

**A FIFTH REJECTION FOUND THE SHAPE-BAN STILL WASN'T ENOUGH, BECAUSE IT WAS ONLY EVER A
NEGATIVE CHECK.** Banning `dir="ltr"`/`"rtl"` around an instrument name catches nothing
about a name rendered with NO direction treatment at all, an alias beyond the two literal
anchors the check happened to know (`instrumentName`, `{inst}`), or a name fused into a
template string (`` `${instrumentName(db, x)} plan` ``) before anything could render it —
three shapes a fourth sealed review found live in the app (Repertoire's `PathwayCard`,
Session Plan's two page titles, wide Lessons' sidebar heading and its detail-pane header,
Today's cross-instrument "in progress"/"plan"/"routine" rows, Today's `EmptyState` title
and "Before your … class" heading, and ActiveBlock's/CloseBlock's own eyebrow — the last
two mis-classifying the instrument's own name as "the English eyebrow" in their own
comments). `direction.test.ts` now asserts the invariant itself rather than banning one
way of getting it wrong: `instrumentNameOccurrences` DISCOVERS every current renderer
mechanically — the `instrumentName(db, id)` call, a bare `.instrumentName` property read,
a LOCAL ALIAS of either (a destructured, renamed prop; a `const X = instrumentName(...)`
binding; a `const X = …instruments….find(...)?.name` binding, generalised past the literal
spelling "instrumentName" so a differently-named local is still caught), and a per-item
`.name` read inside an `instruments.map`/`.filter().map` callback or an inline
`instruments.find(...)?.name` — rather than requiring each to be re-listed by hand.
`resolvesOwnDirection` then asserts the POSITIVE invariant: the name's nearest ancestor
`dir` must be `"auto"`, AND nothing else may render before it within that SAME ancestor's
body — a `dir="auto"` ancestor resolves from whichever strong character comes FIRST in
its subtree, so an item's own title (or anything else) preceding the name inside the same
auto group claims that resolution for itself, exactly the classification mistake this
whole family exists to catch. `isFusedIntoTemplate` separately catches the template-fusion
shape. A declaration/binding site (the alias's own introduction) and a value forwarded as
a JSX ATTRIBUTE (`instrumentName={x}`, prop-drilling rather than a DOM text render — the
receiving component is checked wherever IT renders the value; `ClassQuestions` never does)
are both excluded, visibly, in the check's own comments rather than by a silent gap.

Two real sites deliberately stay BARE and must keep passing exactly as they are:
Insights.tsx's `<th dir="auto">{r.instrumentName}</th>` and Today.tsx's cross-instrument
`<div className="grow" dir="auto">…<div>{inst.name}</div>…` row. Both already resolve
correctly because the name is genuinely the FIRST strong content of their own dir="auto"
ancestor; wrapping either in a nested isolate would BREAK, not fix, them — `dir="auto"`
skips a descendant that already carries its own `dir` when hunting for a first strong
character, so the ancestor would lose its only resolution source and silently fall back to
LTR for a Farsi instrument, the same reasoning this file already used once to revert
isolating `stage.title`. The completion gate for this check was empirical, not assumed:
each discovery shape above was mutated back to its broken form in turn and confirmed to
fail the test before being reverted, and the check itself asserts it discovers a non-zero
set of sites overall, so a regression that makes every pattern silently stop matching
cannot masquerade as "nothing to report."

Two gaps are named here because this lane cannot close them, not because they were missed.
`src/components/QuickAdd.tsx`'s instrument-picker button renders `{i.name}` with no
direction treatment at all — a real instance of this same defect — but `QuickAdd.tsx`,
`ItemForm.tsx` and `RoutineEdit.tsx` are this lane's own contract's declared non-goal
("their dir=\"auto\" usage is already correct and must not be touched"), so
`direction.test.ts`'s instrument-name check explicitly excludes all three rather than
either silently passing over a real bug or failing a check this lane cannot act on.
Separately, `src/domain/insights.ts` (a forbidden path here) bakes
`${r.instrumentName} ${r.percent}%` for every instrument into one generated sentence
before Today or Insights ever renders it — the identical "fused into a string" defect,
sitting one layer below where a presentation-only lane can reach it. Today.tsx's own
render of that sentence (`insight.body`) was still tightened to match Insights.tsx's
existing inline `<span dir="ltr">` isolate (it was previously a bare, undirected block),
but the embedded instrument name inside that generated sentence stays open pending a
domain-layer fix and its own lane.

**A RESOLVED DIRECTION THAT NEVER REACHES THE ALIGNMENT IS NOT A FIX, AND NEITHER IS ONE
WITH NOTHING TO RESOLVE FROM.** A tenth sealed finding named two counterexamples, both in
this same family, and both invisible to the guard as it stood.

Repertoire's `PathwayCard` rendered a user-authored `pathway.name` inside
`<button style={{ textAlign: 'left' }}>` with NO direction-resolving group between them. A
Farsi pathway name shaped correctly — the browser's bidi algorithm needs no help for that —
and then sat pinned to the English edge, split from its own instrument/stage caption
underneath. The inline `<span dir="auto">` already on that caption could never have fixed
it: `text-align` is a BLOCK concept, which is exactly why this file's own "an isolate must
be INLINE" rule exists. The fix is ONE group carrying `dir="auto"` AND re-declaring
`textAlign: 'start'`, sitting INSIDE the button (the Balance-row precedent — the chevron row
and the progress bar are layout, not text). Either half alone leaves the name where it was:
a group with no `start` resolves a direction the alignment never hears about, and a `start`
with no group has no direction to resolve. The same shape, audited across the app, was live
in two more places and fixed with it — Insights' `<th style={CELL} dir="auto">` (CELL pinned
`textAlign: 'left'` over an instrument name the owner can rename to Farsi; it is `'start'`
now) and RoutineRunner's "Recorded" rows under a card pinning `'left'`. `center` is
deliberately NOT a forcing value: centred text points at no edge, so it cannot misalign an
RTL run, and excluding it is also what keeps this rule from demanding an unrequested layout
change on the deliberately centred practice screens.

**EVERY LINE OF A MULTI-LINE FREE-TEXT FIELD RESOLVES ITS OWN DIRECTION — EXCEPT THE ONE
THAT ANCHORS THE GROUP.** `ClassQuestions`' bulleted renderer for
`teacherQuestion`/`currentProblem`/`lastObservation` (one `<textarea>` each, so several
distinct questions live as several lines of one string; `splitLines` in `format.ts`, tested)
first shipped with every bullet bare, on the argument that lines typed into one box in one
sitting share one direction. They do not — a Farsi question and an English one go into the
same field — and bare lines all inherit the FIRST line's direction, dragging an English line
RTL with its bullet on the wrong side, or the reverse. But the catch that argument was right
about is real, and is why this is not simply "isolate every line": `dir="auto"` skips any
descendant carrying its own `dir`, and the enclosing `<li dir="auto">` (and the
Problem/Last-time value wrapper) has nothing else left to hunt once the title is isolated —
isolating every line would leave the item with no resolution source and a silent LTR
fallback, which is the ninth finding all over again. Both hold ONE way only: the FIRST line
is the ANCHOR and stays BARE — it still follows its own language, because the direction it
inherits is the direction it produced — and every line AFTER it carries its own `dir="auto"`
on the row, so that line's text and its bullet follow it alone. The two branches are written
out LITERALLY (never `dir={i === 0 ? undefined : 'auto'}`): `direction.test.ts` is a source
scanner, and a computed attribute is invisible to every guard in it.

`direction.test.ts` holds both closed with checks that assert the invariants rather than the
presence of a group somewhere in a file — which is what the finding correctly said ac-5's
own check could never fail on. The first discovers every element carrying a title class
whose body renders an opaque data expression, and, when anything above it forces
`textAlign: 'left'`/`'right'` — inline OR through a module-level style constant it names,
the shape the Insights counterexample was actually written in — requires a `dir="auto"`
group below that forcing element which re-declares `textAlign: 'start'`; it also fails any
`dir="auto"` group that pins a physical alignment on ITSELF. The second asserts the anchor
shape directly: exactly one bare branch, exactly one `dir="auto"` branch, and the isolate on
the branch chosen for lines AFTER the first. Seven mutations were confirmed to fail before
either was committed. Verification used DELIBERATELY MISMATCHED languages in both directions
against the real running pages — the lesson this file keeps relearning, applied before the
fact this time rather than after.

**SEARCH GOES THROUGH THE FARSI-AWARE MATCHER AT EVERY SURFACE.** The data is
authored in Farsi, so `title.toLowerCase().includes(query)` is not a search — it is
a filter that can never match what the owner's keyboard emits: an iOS Arabic keyboard
produces the ARABIC kaf (U+0643) and the seeded titles hold the PERSIAN kaf (U+06A9),
and no amount of case folding bridges those. Both search boxes — Repertoire's practice
list and Start's item picker — filter through `itemMatchesSearch` (`selectors.ts`,
tested), the one wrapper over the existing `persianSearchMatch`. It is a WRAPPER, not
a second matcher: `farsi.ts` keeps its behaviour exactly, and the wrapper exists so
the WIRING is reachable from a Node test in a repo whose vitest environment is
`'node'` and can therefore never render a screen. A new search surface calls it too.

## Everything the app already knows reaches you where you are

Which instrument you are practising, which piece you mean when you type it in Farsi,
and which class files are already linked to a piece — none of that may sit one screen
away from where you need it, and NONE of it is new stored data.

**A BROWSE SCREEN OPENS ON THE INSTRUMENT YOU ARE PRACTISING, AND STILL WIDENS.**
Repertoire (all three views — Pathways, My repertoire, Practice list) and Lessons seed
their instrument filter from the SAME persisted `sessionInstrumentId` Today, Start, Quick
Add, New Item and the Session Plan already read, via `defaultInstrumentFilter`
(`selectors.ts`, tested): a resolvable session instrument seeds the filter, the `'all'`
sentinel seeds the every-instrument view, and a session instrument that no longer
resolves IN THE LIST THAT SCREEN'S OWN DROPDOWN RENDERS falls back to every-instrument
rather than seeding a value with no matching option and showing an empty screen. These
screens SEED from that value and never WRITE it: browsing another instrument's
repertoire must not change what Today recommends. The cross-instrument view is never
removed — only stopped from being the default you undo on every visit.

**A NARROWED PATHWAYS VIEW HIDES GENERAL PATHWAYS TOO, NOT JUST OTHER INSTRUMENTS'
OWN.** A `Pathway` with no `instrumentId` is General — cross-instrument by design — and
can hold items from ANY instrument, so showing it while narrowed to Setar can still
surface a Tar item's progress with no way to know it slipped through. `pathwaysForInstrumentFilter`
(`selectors.ts`, tested) is the one place this is decided: a real filter keeps only
pathways scoped to that exact instrument, and only the explicit `''` ("all") filter
widens back to see General pathways too — the same opt-in-widen shape as everything else
in this section, not a second rule.

**AN ITEM'S MATERIAL IS COMPOSED, NEVER STORED.** `itemFiles(db, itemId)`
(`src/domain/itemFiles.ts`, pure and tested) lists the NAS references of every lesson
the item is LINKED to (`lesson.itemIds` → `lesson.recordings`), deduplicated BY PATH so
a file referenced from two of those lessons appears once, followed by the item's own
attachments — lessons newest first, kind order within a lesson, attachments oldest
first. Nothing is persisted to make this view work and no new field exists; these links
were always in the data and were simply never composed. An attachment's `ownerId` is not
an item id on its own — a lesson's attachments share the same id space, so a lesson and an
item can collide on id — so ownership is decided by `ownerType` AND `ownerId` TOGETHER, via
one shared `attachmentsOwnedBy(attachments, ownerType, ownerId)` predicate (`itemFiles.ts`,
exported and tested), with `itemOwnedAttachments` as its item-scoped wrapper. EVERY surface
that lists, counts or removes attachments reuses it rather than re-deriving the check:
Material's composition here, ItemDetail's Files CRUD list below, the shared `Attachments`
component (a lesson's own file list, `ownerType="lesson"`), `ItemCard`'s file-count badge, and
`deleteItem`/`deleteLesson` (`useStore.ts`) choosing which attachment metadata AND blobs to
destroy — so no read, count or delete can cross-contaminate the other owner type on a
colliding id. An item with no lesson link and no attachments yields an EMPTY LIST, and the
surfaces render nothing rather than an
empty frame. An item with no lesson link cannot reference NAS material at all — that is
the honest gap, and closing it needs a persisted item-level reference, therefore a
schema change and its own lane. Both the PRACTICE screen and ItemDetail render the WHOLE
composition — a reference and an attachment for the same piece are never split across two
sections of the screen. ItemDetail's existing Files section stays below it, but only for
add/remove: that is a CRUD concern, never a second, partial presentation of what
`itemFiles` already composed. It selects its list via the SAME `itemOwnedAttachments`
predicate rather than filtering `ownerId` alone, so it can never present or remove a
lesson's attachment that happens to share the item's id. It is therefore its own small
list local to `ItemDetail.tsx`
(name, size, Remove — no thumbnail, no Open), not the shared `Attachments` component used
for a lesson's own attachments: that component's preview and Open are exactly the
presentation Material already gives an item's files, and reusing it here would put the
same file on screen twice.

**THE TWO KINDS OPEN BY DIFFERENT MECHANISMS, SO EVERY ENTRY CARRIES WHICH IT IS.** A
reference resolves through the configured NAS base URL; an attachment resolves to a
blob on this device. `ItemFile` is a discriminated union on `source`
(`'reference' | 'attachment'`) so the compiler — not a component's care — is what stops
a reference being opened as a blob or an attachment being pushed through the base URL
and 404ing. They share no identity field (a reference has a `path`, an attachment a
`name`), so they are never merged and deduplication is WITHIN a kind, never across.

**WHAT MAY RENDER INLINE IS A PURE PROPERTY OF THE ENTRY, decided in `itemFiles.ts`.**
`inline` is true only for a LOCAL IMAGE attachment; every PDF, audio file and every NAS
reference is open-only. Written inline in a component that rule would be unreachable
from a Node test, and it is exactly the rule that keeps the practice screen a practice
screen and the whole feature inside the existing production CSP: `blob:` images are
already permitted, while a NAS origin is not knowable at build time and so could never
render under a static policy in any case. Large media stays on the NAS — files are
OPENED, never fetched into attachments, IndexedDB, sync or a backup.

**MATERIAL DURING PRACTICE IS ONE CLOSED DISCLOSURE, BELOW THE TIMER.** `ActiveBlock`
offers it only when `itemFiles` is non-empty, renders nothing until it is opened (a
closed disclosure does zero async work), and sits in the same shape as "About this
piece" — not a panel, not a viewer, not a dashboard. No material or viewer concern may
influence a recorded minute, the wake lock, or a boundary announcement: the
elapsed-time family, `shouldKeepAwake` and `nextSignal` are untouched by any of this.

**A NAS REFERENCE IS STORED RELATIVE TO THE CONFIGURED BASE, so it stays portable.**
An absolute URL saved verbatim is PINNED TO ONE ROUTE to the NAS: it dies on a phone
away from home, and everywhere at once if the base URL ever changes.
`relativizeReference(base, pasted)` (`recordings.ts`, tested) rewrites a pasted URL that
sits UNDER the configured base into the path beneath it — requiring the path BOUNDARY
(`base + '/'`, so `…/media` never swallows `…/mediaXYZ/`) and comparing normalised URLs,
not raw strings. It DECODES per segment because `resolveRecording` re-encodes on the way
out; a Farsi filename copied percent-encoded from a directory listing would otherwise be
double-escaped into a dead link. Everything else is stored EXACTLY as given, because
guessing is worse than mangling nothing: a different origin is a deliberate external
link, a URL carrying a query or fragment is not a plain file path, and a blank or
unparseable base is not something to reason from. This is what makes the transport
(LAN address today, something else later) a decision that can be CHANGED WITHOUT
REWRITING A SINGLE STORED REFERENCE — and it is the only thing this lane writes
differently: the TEXT of an existing `LessonRecording.path`, its type and meaning
unchanged.

**BROWSE IS OFFERED ONLY WHERE IT CAN WORK.** Settings and the lesson add-reference form
open the NAS listing at `normalizeBaseUrl(base)`; a blank or unparseable base yields no
target and the action is disabled with a plain explanation, never a dead link or a
same-origin request. A missing or unreachable NAS degrades to a disabled or absent
action — never an error state, and never anything that blocks practising. Everything
still works fully offline; the base URL stays per-device in localStorage, out of
exports, backups and synced data.

## Review scheduling stays explainable

`computeReview` (in `scheduling.ts`) is an **SM-2 spaced-repetition engine** adapted to
music: per item it tracks `srReps` / `srEase` / `srIntervalDays`; good reviews expand the
interval, a slip resets it, and importance/difficulty pull material a little sooner. It
supports per-item overrides (Auto / fixed cadence / Manual) and returns a plain `rationale`.
Keep it deterministic and explainable — don't turn it into an opaque model, and keep the
SM-2 tests green. Item status labels are plain-language for the user — keep the enum keys
stable and only change the display labels in `labels.ts`.

**The engine is visible AND adjustable, never magic.** `SchedulingParams`
(`src/domain/types.ts`) holds bounded knobs — the SM-2 first/second/slip-reset gaps and
the Session Plan minute shares — persisted as an OPTIONAL `PracticeDB.settings` (schema
**v10**; `undefined ⇒ DEFAULT_SCHEDULING_PARAMS`, so old backups import unchanged and
`validateDB` carries the field through). `DEFAULT_SCHEDULING_PARAMS` reproduces the
historical constants EXACTLY — `computeReview`/`planNextReview` take an optional `params`
whose default is byte-identical to before (a snapshot test guards this). Every call site
that shows OR persists a date must thread the SAME params (`db.settings`): the store into
`closeSession`, `CloseBlock` into both preview calls — the date shown must equal the date
saved. `clampSchedulingParams` enforces the bounds (never trust raw input). Settings' "How
scheduling works" section states the real priority formula and the SM-2 rungs in plain
English with live values, offers bounded inputs + "Reset to recommended", and CloseBlock's
review row links to it ("Why this date?").

## The Session Plan is a view over real blocks, not a new to-do list

The Session Plan (`src/domain/plan.ts`, pure + fully tested; `/plan` page) lays out one
time-budgeted session for the current instrument: ordered segments in five buckets
(`warmup · lesson · review · deep · cooldown`), each with minutes, a mode/focus, and a
one-sentence reason. It **reuses the same `scoreItems` priority numbers** as the
recommendation engine — no second, hidden ranking. It is organisation, never judgement:
no scores, no "optimal" claims, no gamification.

- **The invariant: segment minutes ALWAYS sum to the budget** (`buildSessionPlan`,
  `allocateMinutes` — largest-remainder split, min 2/segment, drops the lowest-priority
  segments when the budget can't seat them all). Keep it deterministic (explicit `now`,
  stable score-desc-then-id tiebreaks) and keep the sum==budget tests green across
  15/20/30/45/60 and the edge cases (0 items, 1 item, all-saturated, everything
  practised-today → falls back and says so). `redistributePlan`/`swapSegment` are the pure
  editors; the preview page tweaks a LOCAL copy before `startPlan`.
- **The plan runs REAL practice blocks — it is not a countdown.** `RoutineRunner` (the
  warm-up timer) stays untouched. The runner orchestrates the existing
  start→`/active`→`/close` flow: "Start this segment" = `beginPlanSegment` seeded from the
  segment (its minutes become the target). `closeSession` has a tail that, when a plan is
  running and the closed block was the current segment, marks it `done` and advances the
  pointer — **the plain flow (no active plan) is byte-identical to before.** Skipping logs
  nothing. Practising is still the only thing that completes a review / advances SM-2.
- **The running plan is EPHEMERAL** — `activePlan` + `planMinutesByInstrument` live in the
  store (persisted via `partialize`), **never in `PracticeDB`, so no schema bump and it
  never syncs/backs-up as data.**
- **Today's plan card stays collapsed (~50px) above "Practise now"** so the primary
  recommendation stays above the fold at 390×844 (verified). Putting it BELOW the
  recommendation was built and tried in the 2026‑09‑11 lane and the owner preferred it
  where it is — see "Today is a session workspace" above. It becomes "Resume your plan"
  while one runs. The evidence behind the bucket shape (spacing, interleaving, retrieval
  practice, end-on-stability) is cited soberly in `plan.ts` and `DECISIONS.md` — sane
  defaults, adjustable via `SchedulingParams`, never dressed up as an optimum.

## Device & infrastructure

**MacBook-first in daily use** (laptop open while practising — notes, files, webcam as
mirror), iPhone as the companion; the phone constraint still binds (primary
recommendation above the fold at 390×844). Both run the **same installed PWA** served
from **GitHub Pages** (`.github/workflows/deploy.yml` publishes `dist/` on every push to
main; the repo is public by explicit user decision, 2026‑07‑11 — the user does not need
the app or data private). Prod base `/practice-compass/` (override with `PC_BASE`)
matches the Pages project path. CI (`ci.yml`) still gates lint + tests + build. The
installed PWA works fully offline; hosting reliability only affects updates.
`scripts/deploy-nas.sh` remains an OPTIONAL LAN mirror — never the primary, and no
Tailscale requirement in the main flow.

**Devices sync via the user's GitHub data repo** (Settings → Sync): on app open, after
30 quiet seconds following changes (rev-driven), on returning online, and manually.
Status shows device name, last sync, current revision + short content hash, plain
errors, and a "restore archived copy" recovery action. The UI must stay honest about
the model: whole snapshots, hash-compared, explicit conflicts, both sides preserved.
The PAT is scoped to the single data repo (Contents R/W) and lives only in
localStorage — never in backups or synced data.

**Attachment size policy is enforced, not claimed** (`attachmentPolicy` in
`src/domain/files.ts`, tested): warn over 10 MB and for any video, refuse over 40 MB
with a clear message. Class videos live on the NAS as recording references, never the app.

**Hybrid storage — keep the roles distinct (Settings explains them):** LOCAL data
(IndexedDB) is the source of truth and works offline. GITHUB SYNC is the small,
versioned multi-device state transport — one private data repo per app that genuinely
needs it; a phone-only app uses local + NAS backup and needs no GitHub repo. NAS BACKUP
is the user's own independent full export — never treat sync git history as the only
backup. NAS RECORDINGS hold the large videos the other three must never carry. Do not
replace GitHub sync with a NAS backend, and do not fold recordings into sync/backup.

**The app shell is a fixed-height flex column and only `<main>` scrolls** — nothing is
`position: fixed/sticky`, so the nav bar cannot drift. The shell height is **`100dvh`
(dynamic viewport) with a `100vh` fallback via `@supports`**, NOT `height: 100%`: in an
installed iOS PWA with `viewport-fit=cover`, `100%` resolves to the layout viewport
which stops above the home-indicator safe area, leaving the bar floating above the
physical bottom with dead space beneath. With `100dvh` the shell reaches the true
bottom and the bar's own `env(safe-area-inset-bottom)` padding lifts just its buttons
clear. **The iOS software keyboard must not drift the shell:** `useViewportGuard`
(`src/components/useViewportGuard.ts`, wired once in `Layout`) listens to `visualViewport`
and, when no editable is focused, resets any layout-viewport displacement to 0; on focus it
scrolls the field into `<main>` instead. It is a no-op without `visualViewport` and must
stay pure glue — never restructure the shell to "fix" the keyboard. Five EQUAL nav tabs
(no raised centre button — Today owns the primary Start
action); route changes scroll `<main>` to top; per-route page widths (narrow for focused
practice, wide ~1100px for browsing/notes on desktop); serif is for headings only,
controls/nav/metadata are sans. Pathway catalogue rows use a stable
`[state · minmax(0,1fr) · one 44×44 action]` grid so adding a suggestion swaps only the
action icon (+→▶) without reflowing the text; status shows once (no duplicate badge);
detach lives in the item's "Connected to", not the row. The service worker registers in PROMPT mode: updates show an in-app "new version
→ Reload" banner (checked hourly and on visibilitychange) and the build stamp
(`__APP_VERSION__`) is visible in Settings — reinstalling is never the update path.
The public build ships a restrictive CSP meta (self + api.github.com only), injected
at build time (`cspPlugin` in vite.config.ts). Pages deploys ONLY behind lint + tests
+ build (deploy.yml single dependency chain).

**Canonical names in user-facing copy:** practice item (the only unit of work) ·
Study source (where an item comes from: radif, method book, collection, course,
teacher handout — nothing else) · Pathways / My repertoire / Practice list (the three
Repertoire views) · "Add practice item" (full form) · "Based on / reference" (a
pathway's provenance) · "Connect it (optional)" (the links group). A practice item may
link to a study source, a stage, lessons and a parent work at once; links never
duplicate the item.

## Colour is checked by a test, not by eye

`src/styles/contrast.test.ts` computes WCAG ratios from the SHIPPED stylesheet and fails
the suite if a listed pair drops below AA for small text (4.5:1). The checked
(foreground token, background token) pairs are written out explicitly in that test, so a
token that is NOT covered is a visible omission rather than a silent one; the claim is
bounded to those pairs and is not a claim about every possible combination. A
translucent background (`--tone-*-soft` behind a `.badge`/`.chip`, `--accent-soft`
behind a selected option) is composited over the opaque surface the pair names — badges
are the only place `--tone-rest` renders at all, so an opaque pair for it would be a
fiction.

Every block that declares the palette is asserted, not just the first: `global.css`
declares the light palette TWICE — at `:root[data-theme='light']` and again inside
`@media (prefers-color-scheme: light) { :root:not([data-theme]) }` — and the duplicate is
what an owner who has never picked a theme actually sees. **Move a light token in both
blocks or the test fails.** Only tokens that FAIL a listed pair move; every passing token
is left untouched (all five `-soft` fills, `--text`, `--text-dim`, `--accent-dim` and
`--accent-contrast` are unchanged), and no layout, spacing or type changes with them.

## Architecture rules

- **Domain logic stays pure.** Everything in `src/domain/` must be free of React and
  side effects, and must take an explicit `now: Date` instead of calling `new Date()`
  internally. This keeps it deterministic and unit‑testable.
- **The recommendation engine stays deterministic and explainable.** Every recommended
  card must produce a one‑sentence reason from the same numbers that ranked it. No
  hidden heuristics, no models.
- **The store is the only place that mutates app data.** UI components call store actions;
  they never touch IndexedDB or rebuild domain objects by hand. Attachment **blobs** are the
  one exception: they live in IndexedDB via `src/store/idb.ts` and the `attachments.ts`
  service (too big for the reactive JSON); only their lightweight metadata sits in the store.
- **Storage is async.** The store hydrates from IndexedDB after load; `App` gates render on
  `hydrated`. Every inbound database — rehydration, manual import, sync pull,
  conflict-keep-remote, archive restore — runs through the one shared `migrateToCurrent`
  chain (`src/domain/migrations.ts`); persistence changes must keep it green and bump
  `SCHEMA_VERSION`. Schema **v11** backfills a routine's `instrumentId` from the pathway
  it belonged to — but only when that pathway names an instrument that actually resolves
  in `db.instruments` (a General pathway, a legacy empty-string id, or a dangling
  reference all leave the routine honestly unscoped rather than inventing one), and never
  overwrites a routine that already has one.
- **One file per route** under `src/pages/`. Shared UI primitives live in
  `src/components/`. Pure helpers go in their own non‑component modules (this also keeps
  React Fast Refresh and the `react-refresh` lint rule happy).

## Tests are not optional

`npm test` must pass. The suite guards the behaviour that makes the recommendations
trustworthy; if you change the scoring formula or scheduling intervals, update the tests
in the same change and make sure they still describe correct behaviour.

## Roadmap items are allowed (they were designed for)

Audio recording attachment, PWA offline install, CSV export, calendar reminders, a
simple audio note per block, teacher‑sharing PDF. These extend the tool without breaking
the philosophy. Anything that contradicts the "do nots" above needs an explicit decision
from the user, recorded here.
```

### DECISIONS.md

```
# Decisions

Durable record of non-obvious choices. Newest first.

## Tenth rejection: a resolved direction that never reaches the alignment, and lines that share one (2026-09-13)

Two counterexamples, one family — and both were invisible to the guard, which is the third
thing this entry fixes.

**A user-authored title under a forced physical alignment.** Repertoire's `PathwayCard`
rendered `pathway.name` inside `<button style={{ textAlign: 'left' }}>` with no
direction-resolving group between them. The browser shaped a Farsi pathway name correctly
(bidi needs no help for that) and then pinned it to the English edge, split from its own
instrument/stage caption. The inline `<span dir="auto">` already on that caption could
never have fixed it: `text-align` is a BLOCK concept, and this repo's own "an isolate must
be inline" rule exists precisely because a `<span>` never participates in one. Fixed by
wrapping the name and its caption in ONE `dir="auto"` group that also re-declares
`textAlign: 'start'` — both halves, because either alone leaves the name where it was. The
group sits INSIDE the button rather than on it (the Balance-row precedent: the progress bar
and its counter below are layout, not text). Measured against the live page: before,
the Farsi name occupied x 41–184 of a 1068px card; after, 884–1027, with its caption on the
same edge. The English card is byte-identical in layout (`start` === `left` under LTR).

Auditing the same shape across the app found two more real instances, fixed with it:
Insights' per-instrument `<th style={CELL} dir="auto">{r.instrumentName}</th>`, where
`CELL` pinned `textAlign: 'left'` over an instrument name the owner can rename to Farsi
(CELL now uses `'start'`), and RoutineRunner's "Recorded" rows, whose `dir="auto"` row sat
under a card pinning `'left'`. `center` is deliberately NOT treated as forcing: centred text
points at no edge, so it cannot misalign an RTL run — which is also what keeps this from
demanding an unrequested layout change on the deliberately centred practice screens.

**Lines of one field that are not one language.** The bulleted multi-line renderer added
for `teacherQuestion`/`currentProblem`/`lastObservation` left every bullet bare, arguing
that lines typed into one box share one direction. They do not: a musician who types a
Farsi question and an English one into the same field gets two lines whose languages
genuinely differ, and bare lines all inherit the FIRST line's direction — an English line
dragged RTL with its bullet on the wrong side, or the reverse.

The catch that argument was right about is real, though, and is why this is not simply
"isolate every line": `dir="auto"` skips any descendant carrying its own `dir`, and the
enclosing `<li dir="auto">` (and the Problem/Last-time value wrapper) has nothing else left
to hunt, since the Ninth rejection above already isolated the title. Isolating every line
would leave the whole item with no resolution source and a silent LTR fallback — the Ninth
rejection, back again. Both hold one way only: the FIRST line is the ANCHOR and stays bare
(it still follows its own language, because the direction it inherits is the one it
produced), and every line AFTER it carries its own `dir="auto"` on the row, so its text and
its bullet both follow that line alone. The two branches are written out literally rather
than as `dir={i === 0 ? undefined : 'auto'}`, because `direction.test.ts` is a source
scanner and a computed attribute is invisible to every guard in it.

Verified against the real running Teacher Report page with DELIBERATELY MISMATCHED data in
both directions (Farsi question line followed by an English one, and the reverse; an English
item title over a Farsi question, and the reverse), at a 350px forced width: each bullet's
computed `direction` and its bullet dot's measured x-position follow that line alone, while
the item's ordinal still tracks the question's first line. In the Farsi-titled item, the
bare Farsi first line computes `rtl` with its dot at x 327–333 (the right edge) and the
isolated English second line computes `ltr` with its dot at 0–6; in the English-titled item
the mirror holds — bare English line `ltr`, dot at 19–25, isolated Farsi line `rtl`, dot at
344–350 — with the ordinal at 0–11 rather than 341–350. The `direction.test.ts` checks are
shape checks over the source, so these measured figures are the only evidence that what the
shape encodes actually renders; the discovery set behind the alignment check spans four
files (Repertoire ×2, RoutineRunner, StartBlock, Today), not the counterexample's own file
alone, so it cannot pass by having quietly emptied.

**The guard.** The sealed finding was right that the existing ac-5 check only required one
direction-aware group SOMEWHERE per file, which neither counterexample could fail.
`direction.test.ts` adds two checks that assert the invariants themselves. The first
discovers, mechanically, every element carrying a title class whose body renders an opaque
data expression, and — when anything above it forces `textAlign: 'left'`/`'right'`, inline
OR through a module-level style constant it names (which is how the Insights counterexample
was written) — requires a `dir="auto"` group below that forcing element which re-declares
`textAlign: 'start'`; it also fails any `dir="auto"` group that pins a physical alignment on
itself. The second asserts the anchor shape of the multi-line renderer: exactly one bare
line branch, exactly one `dir="auto"` branch, and the isolate on the branch chosen for lines
AFTER the first. Seven mutations were confirmed to fail the suite before this was committed
— dropping the group's `textAlign: 'start'`, dropping its `dir`, making both bullets bare,
making both bullets isolated, moving the anchor to the last line, reverting `CELL` to
`'left'`, and dropping RoutineRunner's `'start'`.

## Ninth rejection: the `<li>` anchored on the optional title, not the guaranteed question (2026-09-13)

The Eighth review below concluded no further structural change was needed, using seed data
where the item's title and its `teacherQuestion` share a language (both Farsi). An OWNER
pass reported the marker was STILL not attached to the question on the real, current build
— and, tested directly against the real running app (the actual Teacher Report page, not a
synthetic clone), with a title and question set to DIFFERENT languages, this was true and
was a genuinely different, previously undiagnosed bug: the Eighth review's own conclusion
does not extend past the one language combination its evidence used.

Root cause: `<li dir="auto">`'s hunt for a first strong character skips any descendant that
carries its own `dir`. The question and the Problem/Last-time rows all already carried
their own `dir="auto"` isolates, so the hunt could only ever land on the bare TITLE —
meaning the ordinal's side was decided by the TITLE's language alone, regardless of the
QUESTION's. With matching languages this is invisible (title and question agree on which
side to hug); with an English title and a Farsi question (or the reverse), the ordinal and
title land on one side while the question — correctly right- or left-aligned by its own
independent isolate — lands on the OTHER, unattached from the marker entirely. Reproduced
both ways by temporarily setting an English title on the real seeded Farsi item via the
live store (`useStore.getState().updateItem(...)`) against the actual running page, at both
a 390px-forced real DOM width and the full desktop width.

Fixed by reversing which field is left bare: `questionsForNextClass` guarantees
`q.question` is non-empty on every row this component renders (that is its filter); `q.title`
carries no such guarantee. The title now carries its own `dir="auto"` isolate (out of the
`<li>`'s hunt, rendering in its own correct direction independently); the question is left
bare, so the `<li>`'s `dir="auto"` — and therefore the ordinal's side — always tracks it.
Verified at both widths, both mismatch directions, and confirmed the original
matching-language case is unaffected. `direction.test.ts` adds a dedicated, mutation-tested
shape check (`"the question anchors ClassQuestions' <li>..."`) asserting the title's tag
carries `dir="auto"` and the question's does not; both reverting the title and re-marking
the question were confirmed to fail it (and, independently, `GROUP_SITE_INVENTORY`'s exact
count) before this was committed. The stale `ISOLATED_VALUE_SITES` entry for the question's
old isolate was removed; no new entry was needed for the title's new one since it is a
plain `GROUP_SITE_INVENTORY` site (same tag/class the old entry already tracked).

The general lesson, restated because this is the second time this file has learned it: a
verification built entirely from matching-language seed data proves a fix holds when the
two sides AGREE and says nothing about what happens when they DISAGREE. The Seventh
rejection's row-direction fix and this Ninth rejection are the same shape of gap, closed
twice because the same seed data was trusted twice.

## Eighth review: the ragged left edge is measured, not assumed, and needed no further fix (2026-09-13)

**Scope note (superseded in part by the Ninth rejection above):** this review's conclusion
— that no further structural change was warranted — was correct only for the ragged-edge
question it actually measured, using seed data with a Farsi title AND a Farsi question. It
was not, and should not have been read as, a claim that every marker-attachment complaint
on this screenshot was closed; a real, different bug (title/question language mismatch)
was still open and is fixed above.

A follow-up OWNER pass on the same `ClassQuestions` finding read as a further complaint:
the "1." marker looked detached from the Farsi question because the Problem/Last-time
lines sat at the opposite (left) edge from the title and question — a visible asymmetry a
screenshot reads as "not attached" even where the title itself was correctly positioned.
Rather than trust that reading, both edges were measured directly against the live DOM:
the real seeded Farsi item, cloned into a fixed-width harness at 340px, with each line's
actual rendered text extent read via `Range.getClientRects()` (glyph bounds, not
`getBoundingClientRect()` on the containing boxes). Result: all four lines — title,
question, Problem, Last time — right-align flush at 330px, an 8px gap from the ordinal's
own right edge at 338px, matching the authored `gap: 8` exactly. The LEFT edges spread
across 62px-205px (143px), because the four lines differ in length and each is
right-aligned inside a box whose right edge is pinned to the ordinal regardless of the
box's own width.

A specific fix was proposed and tested before being rejected: swap the value wrapper's
`flex: 1` (`.grow`) for shrink-to-fit sizing, on the theory that a narrower box would pull
the ragged edges together. Patched live and re-measured, the result was byte-for-byte
identical — same 143px spread, same individual line positions — because for right-aligned
text, `left edge = box_right − line_width`, and `box_right` never moves: it stays flush
against the ordinal no matter how the box itself is sized. There is no flex-sizing change
that touches this, because the sizing was never the defect.

Conclusion: a ragged left edge on right-aligned lines of differing length is ordinary
typography (the same shape any right-aligned paragraph or an address block has), not a
resolvable structural defect. The actual defect the owner was reacting to was fixed by the
Seventh rejection below, before this measurement was taken: Problem/Last-time used to sit
at the FAR left (~25px, the opposite edge entirely) while title/question sat at ~330px — a
hard two-line/two-line split, not mere length variance. Once the row-direction fix made
all four lines agree on which edge they hug, what's left is ordinary variance in line
length, and no further structural or padding change is warranted. No source change
accompanies this entry; it exists so a future review does not reopen the same screenshot
and re-diagnose an already-closed gap as a new one.

## Seventh rejection: the ROW's own alignment must come from the value, not an inherited direction (2026-09-13)

A seventh sealed finding, checked on the owner's own iPhone, found the sixth rejection's
`display: 'inline-block'` fix for `ClassQuestions`' `Problem:`/`Last time:` rows still
wrong — not merely incomplete. That fix gave the VALUE its own bidi character order and
its own wrap-line alignment, but left the ROW that positions "Label: value" as a unit
BARE, so the row inherited whichever direction the TITLE above it resolved to — right for
a Farsi title, left for an English one — regardless of what script the value was actually
written in. For the common case (title and value the same language) this looked correct
by coincidence; for an English-titled item with a Farsi problem note, the whole row
stayed pinned left, exactly where the inherited direction put it, with the value's
internal shaping correct but its POSITION wrong. This is the same root cause the
"A GROUP CARRYING DIRECTION IS NOT THE SAME CLAIM AS EVERY CHILD IN IT HAVING ITS OWN"
section already named for other files, just not yet applied to a LABEL-plus-VALUE row.

Fixed by moving `dir="auto"` from the value to the ROW itself, and marking the LABEL —
never the value — with its own `dir="ltr"`. This is not because the label's text ever
changes; `dir="auto"` skips a descendant that carries its own `dir` when hunting for a
first strong character, so marking the label takes it OUT of that hunt and leaves the
(deliberately bare) value as the row's only resolution source. Marking the value too
would take BOTH out, leaving the row with nothing to resolve from and a silent fallback
to LTR regardless of the value's own script — confirmed to fail the new test when tried.
Verified across all four combinations (Farsi/English title × Farsi/English value) at both
a narrow (350px, iPhone-card-width) and a wide (700px, desktop) container: a value's own
language now determines its row's alignment independently of the title, in both
directions, at both widths. This also resolved the number/title "detachment" the same
finding reported: with all four lines (title, question, Problem, Last time) correctly
right-aligning together, the block reads as one coherent unit against the marker instead
of two aligned lines and two stray ones.

`direction.test.ts` replaces the `ISOLATED_VALUE_SITES` ledger entries for these rows
with a shape check, `isLabelFirstAutoRow` / "a label-first auto row's value stays bare":
any `dir="auto"` group whose body opens with a `<span dir="ltr">…</span>` must have no
other `dir=` anywhere else in its body, or the row has nothing left to resolve from. It is
a SHAPE check, not a ClassQuestions-specific one, so it would catch the same regression in
any future file using this pattern. Two mutations were confirmed to fail before this was
committed: marking the value `dir="auto"` too (caught by the new check and by
`GROUP_SITE_INVENTORY`'s exact-order equality), and removing the label's `dir="ltr"`
entirely — reverting to the original bug — which the PRE-EXISTING `unexemptedPhrase` check
also catches on its own (the bare "Problem" label plus the value's opaque expression reads
as a 2-word exposed phrase), giving this shape two independent guards.

## Sixth rejection: a native marker is removed, not accommodated; a value's alignment is its own (2026-09-13)

A sixth sealed finding, checked on the owner's own iPhone, found `ClassQuestions.tsx`'s
question number still escaping the card despite the third rejection's symmetric
`paddingInline` fix — proof that an outside `::marker`'s exact position for a
direction-variable `<li>` is a browser implementation detail no gutter measurement can
guarantee (jsdom cannot compute it either, which is why a padding proxy was ever trusted
to stand in for it). Fixed by removing the native marker mechanism entirely rather than
reserving room for it: `listStyle: 'none'` on the `<ol>`, with the ordinal rendered as a
real element, the FIRST child of a flex `<li dir="auto">` — flexbox's row axis is
direction-aware by specification, so the number leads on the correct side and sits inside
the content box it can never escape. The wrapper around title/question/details carries no
`dir` of its own, deliberately: `dir="auto"` skips a descendant that has its own `dir`
when hunting for a first strong character, so giving the wrapper one would leave the
`<li>` with no resolution source at all. `direction.test.ts`'s list-marker check
(`disablesNativeMarker`/`isDirectionAwareContainer`, replacing `reservesRoomOnBothSides`)
now asserts the mechanism directly — no native marker, and the `<li>` is itself a
flex/grid container — rather than measuring a proxy for it; each half was confirmed to
fail on its own when reverted. `role="list"` on the `<ol>` pays back the one accessibility
cost of removing the marker: WebKit drops an `<ol>`'s list semantics from the
accessibility tree once `list-style: none` takes its marker away, which would have gone
unnoticed here — VoiceOver on the owner's own iPhone is exactly where it would have
surfaced.

The same finding also covered `ClassQuestions`' `Problem:`/`Last time:` lines, diagnosed at
the time as a wrap-alignment gap and fixed with `display: 'inline-block'` on the value's
own isolate. A seventh sealed finding (below) found that diagnosis incomplete — the value
having its own bidi order was never the same claim as the ROW having the right
alignment — and replaced it with a different fix entirely. See "Seventh rejection" above
for what actually shipped.

## Fifth rejection: the instrument-name check had to become positive, not just a ban (2026-09-12)

A fifth sealed review found the fourth rejection's fix was still a negative check —
banning `dir="ltr"`/`"rtl"` around an instrument name — which cannot detect a name with
NO direction treatment at all, an alias beyond the two literal anchors the check knew
(`instrumentName`, `{inst}`), or a name fused into a template string before anything
renders. Real, live instances of all three: Repertoire's `PathwayCard`, Session Plan's
two page titles, wide Lessons' sidebar heading and detail-pane header, Today's
cross-instrument "in progress"/"plan"/"routine" rows (built as pre-joined template
strings), Today's instrument switcher and `EmptyState` title and "Before your … class"
heading, and ActiveBlock's/CloseBlock's own eyebrow (mis-classifying the instrument's own
name as fixed English in their own comments). Fixed by replacing the ban with a positive,
mechanically-discovering check in `direction.test.ts`: `instrumentNameOccurrences` finds
every current renderer from the SHAPES this codebase uses to produce one (the helper call,
a property read, a local alias of either via destructure-rename/const-binding/find-and-name,
or a per-item `.name` read inside an `instruments` iteration) rather than a location list,
and `resolvesOwnDirection` asserts the invariant itself — the nearest ancestor `dir` must
be `"auto"` AND nothing else may render before the name within that ancestor's body, or
the ancestor's resolution belongs to whatever precedes it, not to the name riding along
beside it. Two sites deliberately stay bare because they are already the first strong
content of their own dir="auto" ancestor (Insights.tsx's `<th>`, Today.tsx's
cross-instrument `{inst.name}` row) — isolating either would break, not fix, them, the
same reasoning that earlier reverted isolating `stage.title`. Two gaps are named rather
than silently left: `QuickAdd.tsx`'s instrument-picker button has the identical bare-name
defect but sits in a file this lane's own contract puts out of scope, so the check
explicitly excludes it instead of failing on a bug this lane cannot fix; and
`src/domain/insights.ts` fuses an instrument name into a generated sentence one layer
below where a presentation-only lane can reach, left open for its own lane. See
AGENTS.md's "A FIFTH REJECTION..." section for the full account.

## Fourth rejection: an instrument name is user text, not generated copy (2026-09-12)

A sealed review found four sites (`ItemCard.tsx`, `ItemDetail.tsx`,
`PathwayDetail.tsx`, `Repertoire.tsx`) forcing an item's or work's instrument name under
`dir="ltr"` as if it were generated metadata like `ITEM_TYPE_LABELS` sitting next to
it — but an instrument is renameable in Settings, Farsi included, so it is the owner's
own editable text and needed its own `dir="auto"` isolate instead. Auditing every
remaining `LTR_ISOLATE_SITES` entry against its real source (not just the four named)
found a fifth of the identical shape (`Today.tsx`'s "routine running" row, bundling the
instrument name and a fixed English suffix into one `dir="ltr"` span) and two with no
direction treatment at all — invisible to that audit because it can only see spans that
already carry a `dir`: the Plan doorway's mismatched-instrument row (the exact twin of
the routine row) and the weekly Balance row's instrument name, bare inside a
`.truncate` title span whose row is a CSS grid (isolating the row itself, rather than
the name, would have reversed its three columns for a Farsi instrument). All seven now
carry their own `dir="auto"`, and `direction.test.ts` bans the SHAPE going forward — any
`dir="ltr"`/`"rtl"` isolate whose body references `instrumentName` (a call, a bare
identifier, or a property access like `b.instrumentName`) fails — rather than
re-closing whichever locations a reviewer happened to enumerate.

## Third rejection: an isolate must be inline, a marker needs room on both sides, and the scanner's own blind spot (2026-09-12)

A third sealed review of the direction lane found the SAME family — mixed-content
groups, alignment, list markers, completeness — still open in `ItemMaterial.tsx`,
`Materials.tsx`, `ItemCard.tsx`, `RoutineRunner.tsx`, `Lessons.tsx`, `Repertoire.tsx` and
`ClassQuestions.tsx`, closed as three root causes rather than as seven counterexamples.

1. **A block-level isolate resolves its own alignment, independently of the group.**
   `ItemMaterial.tsx`'s detail line carried `<div className="tiny faint" dir="ltr">…
   </div>` — the isolate fixed the sentence's own bidi ordering but, because
   `text-align: start` is a per-box computed value resolved against that box's OWN
   `direction`, gave the div's `text-align` a LEFT resolution regardless of the group's
   (possibly RTL) one — the detail split from a right-aligned Farsi title exactly as
   before, one level down. Fixed by moving every such isolate to an inline `<span>`
   nested inside a `dir`-less block (the shape already used everywhere else in the
   file), and closed for good with a mechanical rule in `direction.test.ts`: no
   `dir="ltr"`/`dir="rtl"` may sit on anything but `span`/`bdi`. One rejected review
   found one file doing this; a structural ban is what stops a second file doing it
   next lane.

2. **A native list marker follows its OWN list item's direction, not the list's.**
   `ClassQuestions.tsx`'s `<ol>` reserved gutter space with `paddingInlineStart` alone
   while each `<li>` resolves its own direction via `dir="auto"` — the browser positions
   the outside `::marker` on that li's OWN start edge, so a Farsi item's marker lands on
   the right, the side the list reserved no room for, and gets pressed against or past
   the content border. Fixed with symmetric `paddingInline`. `direction.test.ts` scans
   every `<ol>`/`<ul>` for this shape now, not just this one list.

3. **The scanner itself skipped every `{…}` expression as opaque, contributing zero
   words — hiding a run built ENTIRELY from expressions.** `Materials.tsx`'s
   `{MATERIAL_SOURCE_LABELS[...]} · {MATERIAL_STATUS_LABELS[...]} ·{' '} {itemCount(...)}
   item{...}` reads as zero literal words to a scanner counting only literal text, while
   rendering three always-English fragments in a row, unisolated, next to a title that
   could resolve RTL. `unexemptedPhrase` now counts an opaque, non-JSX-bearing
   expression as ONE token (its content stays invisible from source, but its
   unisolated PRESENCE next to other content is the shape being caught); an expression
   containing its own nested JSX stays fully opaque, since its children are already
   reachable by the outer whole-file scan. That one change, plus re-auditing every
   recorded group by hand, surfaced the five named sites and further, unnamed ones of
   the identical shape: `Repertoire.tsx`'s second, near-duplicate work-count span (the
   non-Persian branch mirrors the fixed one and had simply been missed), `ActiveBlock`'s
   own mode/focus chips, `Attachments`'/`ItemDetail`'s file kind/size line,
   `StartBlock`'s/`Today`'s item-type/status labels, `StageDetail`'s strand/status
   line, `PathwayDetail`'s "Current"/"Done"/item-count badges and piece-count fallback,
   `Today`'s "routine running" indicator and its cross-instrument Overview row (a fixed
   sentence embedding the next item's own possibly-Farsi title, isolated the way
   `StageDetail`'s undo banner already does), and `Insights`' generated observation
   sentences. Two sites needed `dir="auto"` rather than `dir="ltr"` — a value authored
   independently of its neighbour, not generated copy: `RoutineRunner`'s upcoming
   segment label and `PathwayDetail`'s pathway `source`. A stage's own `title` was
   tried the same way and REVERTED: `stage.title` is not authored independently of
   `stage.code` — it is the SAME stage's fuller name, rendered only when it differs
   from the code — and a prior lane already settled that the two should AGREE on
   whichever direction the group resolves rather than one overriding the other
   (`PathwayDetail`'s stage rows, 2026-09-11 entry below: "even where a group DOES
   resolve LTR from its code, that is the point"). Isolating `stage.title` in its own
   `dir="auto"` would have pulled it OUT of the button's own auto-detection (a nested
   `dir` attribute is skipped by the HTML algorithm), which can flip the group's OWN
   resolved direction whenever `stage.code` itself has no strong character — the
   opposite of "agree." It stays a bare `<span>`, exactly like `stage.code`. Two
   flagged sites were genuine exceptions, recorded visibly in a new
   `UNEXEMPTED_PHRASE_ALLOWLIST` rather than isolated: a numeric progress counter
   (`{sp.done}/{sp.total}` — digits carry no bidi risk) and a compound "Pathway — Stage"
   breadcrumb built from two fields (one continuous label, not a title split from a
   foreign caption).

4. **`elementBody`'s depth counter did not recognise React's Fragment shorthand as an
   opening tag, only as a closing one — silently truncating the body several checks
   scan.** `</>` starts with `/`, so it matched the ordinary CLOSING-tag branch and
   decremented depth; `<>` starts with neither `/` nor a letter, so it matched nothing
   and never incremented it. Every `<>…</>` pair inside a group's body therefore
   decremented depth once more than it was ever incremented — and this codebase's own
   established shape for a conditional detail (`{stage && (<><span>…</span>
   <Link>…</Link></>)}`, `ItemDetail.tsx`'s header) uses exactly that shorthand. On
   that header, depth hit zero several tags before the `</header>` actually closes,
   so `unexemptedPhrase` silently stopped scanning before ever reaching
   `<span className="tiny faint">difficulty {item.difficulty}/5</span>` — a real,
   unisolated generated-English phrase that had been sitting in the group the whole
   time, invisible to a scanner whose whole claim is "detectable, not enumerated."
   Fixed by giving `<>` the same weight as any other opening tag; the fix surfaced
   this one concrete violation across every file the suite scans (no others were
   hiding behind it), now fixed with the same `dir="ltr"`/`dir="auto"` split as its
   sibling `row-wrap` (`instrumentName`/`ITEM_TYPE_LABELS` generated, `stage.code`/
   the material label left bare since both can be Farsi themselves) and its
   importance/difficulty/saturated row. A structural bug in the TEST's own tag
   traversal is exactly the kind of gap a purely example-driven fix cannot close —
   only re-deriving the traversal from first principles (does this construct open or
   close a nesting level?) finds it.

**A restructure, not a pure direction-only edit, in `Repertoire.tsx`'s `WorkRow`.**
Its metadata line was `[form, composer, gusheh, instrumentName, lastPractised]
.filter(Boolean).join(' · ')` — a single STRING assembled from fields in two
different authorships (Persian identity fields, genuinely Farsi; instrument name and
the last-practised phrase, generated English). A joined string has no seam to hang a
`dir=` on partway through, so isolating it correctly required rebuilding the array as
JSX nodes (`<span dir="auto">`/`<span dir="ltr">` per fragment) joined with an
explicit separator, rather than adding an attribute to existing markup. This is more
than the "direction wiring only" the contract asks of a non-loop file, but there was
no lighter way to give each fragment its own bidi base — flagged here rather than
left for a reviewer to have to notice on their own.

**The scanner's own comment-stripping had a latent bug this work exposed, not
introduced.** `stripComments` treated any `'`/`"` as a real string delimiter and
scanned forward, unbounded, for its match. Plain JSX text containing an apostrophe
(`StageDetail.tsx`: "That stage doesn't exist.") is not a string at all; hitting that
apostrophe put the scanner into a phantom "inside a string" state that swallowed
everything after it — including real comments — until an unrelated quote later
happened to close it, cascading through the rest of the file. This had been silently
true all along and only surfaced because a new comment inside the corrupted span
happened to quote `dir="ltr"` in its own prose, which the (no longer stripped) comment
then exposed to the new block-isolate scan as a phantom real attribute. Fixed at the
root: a `'`/`"` now starts a real string only if its match appears before the next
newline (every real string/attribute value here is single-line); otherwise it passes
through as ordinary text. Backtick template literals keep their unbounded, multi-line
scan. This makes every check in the file more trustworthy, not just the new ones.

## The content leads: direction on the group, and a colour list that is bounded on purpose (2026-09-11)

**Direction lives on the GROUP, never on the title.** `dir="auto"` was on 47 title
elements and on no container anywhere, so a Farsi title resolved RTL and hugged the right
edge of its cell while its own English caption hugged the left. The fix is not a new
mechanism — it is moving the SAME native attribute up one level, to the element that
holds a title together with the details belonging to it. Two consequences are worth
recording because they are not obvious:

1. `dir="auto"` resolves from the FIRST STRONG CHARACTER in the subtree, so where an
   English eyebrow precedes the title in the DOM (Today's Practise-now card, the close
   screen's header, Session Plan's minutes/bucket line) the group is drawn around
   title + details and the eyebrow is deliberately left OUTSIDE it. Wrapping the whole
   card would pin the group LTR and change nothing.
2. Direction alone does not move text. Several groups sit under an ancestor pinning
   `text-align: left` (a picker row button, the practice screen's centred column), and
   `left` is inherited as a COMPUTED value — it does not re-resolve per element. Those
   groups set `text-align: start` on themselves.

The sweep is held closed by `src/components/direction.test.ts` rather than by care, and
its exception allowlist came out EMPTY: every title on every surface had a group it could
join. `PathwayDetail`'s stage rows were the candidate exception (an ascii-looking code
like "2A" leading a Farsi title) — but the Setar and Tar seeds author stage codes in
Farsi (`نشست`, `شور`, `ماهور`), so grouping code + title is both correct and what the
owner actually sees. Even where a group DOES resolve LTR from its code, that is the point:
the code and the title then agree instead of pointing at opposite edges.

**The colour list is bounded, and the planner's "six failing tokens" was an undercount.**
The plan measured each foreground token against `--bg` only. Two tokens fail there and
were missed (`--tone-progress` 4.41, `--tone-rest` 4.26), and more importantly `--bg` is
not where several of them RENDER: `--tone-rest` only ever appears as `.badge`/`.chip`
text over its own translucent `--tone-rest-soft` fill. `src/styles/contrast.test.ts`
therefore lists the pairs each token is ACTUALLY rendered on, compositing a translucent
fill over the card it sits in, and asserts them in all three palette blocks.

That honest list moves EIGHT light tokens (`--text-faint`, `--accent`, `--gold`,
`--tone-alert`, `--tone-warn`, `--tone-progress`, `--tone-good`, `--tone-rest`) and FOUR
dark ones (`--text-faint`, `--tone-alert`, `--tone-progress`, `--tone-rest`) rather than
the six + one the plan predicted. The list was NOT trimmed to make that arithmetic come
out right: an uncovered token is supposed to be a visible omission, and dropping badges
would have left two of the five tone tokens with no coverage at all. Three of the four
dark moves are 1–7 units and imperceptible. `--accent-contrast` (white on the primary
Start button, 3.95 at HEAD) needed no move of its own — darkening `--accent` to clear AA
against the page took that pair to 5.94. Every `-soft` fill, `--text`, `--text-dim` and
`--accent-dim` are untouched, because they pass.

**Both light blocks, every time.** `global.css` declares the light palette twice — at
`:root[data-theme='light']` and again inside `@media (prefers-color-scheme: light)
{ :root:not([data-theme]) }`. The duplicate is what an owner who never picked a theme
sees, so the test asserts both blocks AND that they agree token for token.

**Reading the stylesheet needed a workaround, not a config change.** `src` is typechecked
by `tsconfig.app.json`, which does not enable node types, and Vitest blanks every `.css`
module — `?raw` included — unless `test.css` is on in `vite.config.ts`. Both files are
outside this lane's scope. So the contrast test reads the real file through a dynamic
import whose specifier the compiler cannot resolve statically. Reading the REAL file is
the whole point: a table of colours copied into the test would keep passing while the app
shipped something else. The direction test needs no such trick — `import.meta.glob` with
`?raw` works for `.tsx`, and a glob also means a NEW page is swept in automatically.

**One ReviewPlan on the close screen.** The collapsed summary line and the expanded date
field are two renderings of ONE value, with a manual correction folded into it rather
than held beside it. The guarantee had to be structural: `CloseBlock` previously called
`planNextReview` twice (once for the preview hint, once inside `pickResult` to seed the
field), which is exactly the drift r-explainable-scheduling exists to prevent. A pure
formatter (`reviewSummaryLine`) renders the line and computes nothing, so a divergent
date is unrepresentable rather than merely remembered about.

**Today's order was built the other way round, tried, and REVERTED — by design.** The
lane built Practise now directly under the instrument switcher with Plan and Routines as
two compact peer doorways beneath it, on the argument that orchestrating a session is a
choice you make INSTEAD of taking the suggestion. It shipped as one ordering change with
no data or state implication precisely so the owner's own device could settle it. It did:
on 2026-09-11 the owner judged the original order better — Plan and Routines read as
belonging at the top of the page, and recommendation-first felt less natural — so the
order went back. That reversal is a PASSING outcome of the check, not a failure of the
lane, and everything else the lane built stands.

Worth recording for whoever reads the code next: BOTH orders keep the recommendation
above the fold at 390×844, so nothing about this ordering follows from the phone
constraint or from any other rule in AGENTS.md. It is a taste judgement that only the
owner can make, and the argument for recommendation-first is genuinely available to
re-derive — which is exactly why `Today.tsx` and AGENTS.md now say, in so many words,
not to act on it without asking.

**Rejection findings, addressed (fresh review, 2026-09-11).** A sealed fresh review of
this lane's diff returned `request_changes` against two families, fixed comprehensively
rather than by patching the two cited examples:

1. **Mixed-content groups and completeness.** Grouping a Farsi title with an
   ALWAYS-ENGLISH generated detail (`buildReason`, `planSegmentReason`) under one
   `dir="auto"` fixed the ALIGNMENT but broke the detail's own bidi ordering: the Farsi
   title's resolved RTL base became the detail's base too, and FriBidi renders a trailing
   neutral character (the sentence's own full stop) using that base when nothing more
   specific claims it — so it visually jumped to the start. Fixed by nesting a
   `dir="ltr"` isolate around each such detail (Today's Practise-now card and secondary
   recommendations, ItemDetail's "practise this part now", Session Plan's segment
   list and runner) — grouping and alignment are unchanged, only the isolate's own
   internal ordering is fixed. A structurally identical bug existed the other way round
   for FREE TEXT the owner typed after a fixed English label (ActiveBlock's
   `constraint`/`problem`, "last time you decided to try"): the label was the subtree's
   first strong text, so `dir="auto"` on the whole line resolved from the label and never
   saw the owner's own (possibly Farsi) words — fixed the same way the codebase already
   excludes an eyebrow, by giving the VALUE its own nested `dir="auto"` and leaving the
   label outside it. Today's Routines doorway had the same eyebrow-first bug at the
   button level ("Resume your routine"/"Routines" decided the direction, not the routine's
   own name) — fixed by moving `dir="auto"` off the button and onto a block wrapper
   around just the name, mirroring the shape `ElsewhereSessions` already used a few lines
   above it (an inline `<span>` there would silently break `.truncate`'s ellipsis, since
   `overflow`/`text-overflow` do nothing on a non-replaced inline box). ActiveBlock's
   header stayed CENTRED despite the contract requiring Farsi right / English left on that
   screen — the page's own `text-align: center` (correct for the timer ring and buttons)
   was never overridden for the title group; it now sets `text-align: start` on itself,
   which is a deliberate LAYOUT CHANGE for English on that one screen and is documented in
   AGENTS.md as not conflicting with "English keeps its layout" elsewhere (that non-goal
   guards against a Farsi-style right-align, not against ac-6's explicit left-for-English
   requirement on Active).

   The COMPLETENESS gap: `direction.test.ts`'s "every surface has a group" check passed
   as long as ONE group survived anywhere in the file, so deleting the Practise-now card's
   own `dir="auto"` still passed because Today.tsx has several unrelated groups. Fixed
   with `GROUP_SITE_INVENTORY` — every group-level site recorded in order, duplicates
   included, asserted with `toEqual` against the live scan, so removing any ONE recorded
   site anywhere fails regardless of what else survives in the same file. Building that
   inventory surfaced a second, unrelated defect in the scanner itself: this file's own
   prose repeatedly writes the literal string `dir="auto"` in comments, and the naive
   regex scan matched those too — usually producing a site with no real enclosing tag, but
   at least once walking backward out of a long comment and mis-attributing an unrelated
   component tag from elsewhere in the file as if it were the match's real element. The
   scanner now strips `//` and `/* */` comments (copying string/template literals through
   verbatim, since that is where a REAL `dir="auto"` attribute value lives) before
   matching.

2. **CloseBlock manual-date preservation.** `pickResult` cleared the manual `override` on
   every result change — correct when the engine actually re-plans (a fresh judgement
   deserves a fresh plan, not a stale correction pinned to the old one), wrong when it
   doesn't: a manual-mode item (`item.reviewMode === 'manual'`) has no automatic plan for
   ANY result, so a date the owner had just typed in was never tied to a particular
   judgement, and clearing it turned a deliberate "come back on this date" into an
   accidental decline the moment they picked a different result. Fixed by gating the
   clear on `reviewOverrideSurvivesResultChange(item.reviewMode)`
   (`src/components/format.ts`) rather than calling `planNextReview` a second time inside
   `pickResult` — CloseBlock's single `ReviewPlan` derivation is unchanged; this is a
   boolean read of the item's own mode, not a second value that could disagree with it.
   The predicate is tested against the real engine across all six results for both a
   manual- and an auto-mode item, not asserted in prose alone.

**Second rejection, closed as a family rather than as four counterexamples
(2026-09-11).** A second sealed review found the FIRST fix's isolate pattern had not
been applied everywhere it was needed: `CloseBlock`'s own "A few seconds to capture
what happened." sat bare in the item-title group (the identical defect the first
rejection fixed elsewhere in the same file's neighbours), and `ClassQuestions`'
question/problem/last-observation carried no isolate of any kind, unlike the
`ActiveBlock` shape the first fix established. Rather than patching just those two
call sites, the whole surface list was re-audited for the same two shapes:

- **Fixed English copy/metadata bare in a group** — beyond the two named sites, the
  same "N segments · M min" phrase existed identically in THREE places
  (`Today.tsx`'s `TodayRoutineRow`, `PathwayDetail.tsx`'s `RoutineRow`,
  `StageDetail.tsx`'s `RoutineCard` — one component per surface a routine can be
  started from, never refactored into one shared component), `StaleNote`'s "Running
  far past its target…" (rendered inside two different title groups), Today's due-review
  caption ("due `relativeDay(...)`"), the NAS-reference warning sentences
  (`Lessons.tsx`, `ItemMaterial.tsx`), `ItemDetail.tsx`'s "Study source:" label and
  `StageDetail.tsx`'s "Added "…" — not practised yet." undo banner. Every one now
  carries the same nested `dir="ltr"` isolate as the first fix's `reason` spans.
- **Independently-authored values bare in a group** — `PathwayDetail.tsx`'s
  `pathway.description`/`pathway.note`, editable independently of the pathway's own
  name, needed the same `dir="auto"` isolate `ActiveBlock`'s `constraint`/`problem`
  already carry.

**The test itself was the real gap, not just the four sites.** `direction.test.ts`
proved a GROUP carries direction; it never proved a CHILD inside it does. A generic
"no bare Latin text in a group" rule would have forced changes to the already-correct
`ActiveBlock` label shape (`Constraint: ` stays bare on purpose, immediately followed
by its own isolate), so the new check (`unexemptedPhrase`) walks a group's body in
source order, judges an accumulated run of exposed text at each TAG boundary (never at
an expression boundary, or `{n} segments · {m} min` fragments into single innocent
words), and exempts a run — regardless of its length — the moment it is immediately
followed by an element carrying its own `dir=`. Two recorded ledgers
(`ISOLATED_VALUE_SITES`, `LTR_ISOLATE_SITES`) cover what no source scan can prove:
an expression's own content (`{q.currentProblem}`) is opaque from source, and a
component like `StaleNote` renders its isolate from its OWN definition, invisible from
any of its call sites. Both carry the same visibility contract as
`GROUP_SITE_INVENTORY` — a new site must be added, visibly, never inferred silently.

## Serving NAS class recordings over HTTPS (Task 3, 2026-07; CORRECTED 2026-09-10)

**Problem.** The app runs on an HTTPS origin (GitHub Pages). Class videos and scores
live on the Synology NAS under `homes/ethan/SNDK/video-courses` (on disk:
`/volume1/homes/ethan/SNDK/video-courses`). A lesson reference stores a *relative*
path (e.g. `setar-classes/session-1-…/video.mp4`); the app joins it under a **NAS
base URL** set in Settings. Two things must be true for playback:

1. The base URL must be a real `https://` origin. (A scheme-less value like
   `ds220plus.taild1d1f7.ts.net` was previously concatenated raw and treated as a
   *relative* URL against the Pages origin — so every recording opened the same
   in-app 404. Fixed in `normalizeBaseUrl` / `resolveRecording`,
   `src/domain/recordings.ts`.)
2. The folder must be served over HTTPS. DSM on `:5000` does **not** serve raw
   files, and plain `http://` links are mixed content that iOS blocks.

**What is ACTUALLY running (probed 2026-09-10, and this corrects what this record
used to claim).** This file previously recorded *Tailscale Serve on the Synology* as
the chosen mechanism, with a runbook. That is **not** what is in place, and an agent
following that runbook would have configured the wrong thing:

- There is **no Tailscale CLI and no Tailscale.app on this Mac**.
- `https://192.168.0.20:5010/` answers **HTTP 200 from nginx** and already serves
  **real browsable directory listings** (mod_autoindex-style "Index of /"), whose
  document root IS the `video-courses` folder — it lists `setar-classes/`,
  `tar-classes/` and `classical-guitar/`, and `/setar-classes/` answers 200. So the
  existing relative references already resolve against it, and a **Browse** link
  needs no server change whatsoever; the capability was already there and unused.
- The certificate is Synology's own default (`CN=synology`, issuer
  `Synology Inc. CA`) and does **not** match `192.168.0.20`. That is why this works
  on the MacBook, where the exception has been accepted, and why **each new device
  must accept the certificate once** before NAS links open there. A certificate
  prompt on the iPhone is INFRASTRUCTURE, not an app defect.

**Current base URL:** `https://192.168.0.20:5010` (LAN only).

**The app is deliberately TRANSPORT-AGNOSTIC, and that is now enforced rather than
hoped for.** A reference pasted from the NAS listing is stored **relative** to the
configured base (`relativizeReference`, `recordings.ts`, tested) instead of as the
absolute URL the browser gave you. An absolute URL would pin that reference to one
route to the NAS — dead on a phone away from home, and dead everywhere the day the
base URL changes. Because only the path is stored, **choosing the transport is a
decision that can be changed later without rewriting a single stored reference.**

**That choice is deliberately left OPEN.** Staying on the LAN address, moving to
Tailscale (`ts.net` gives a valid certificate and tailnet-only access; Go's file
server supports Range requests, so video seeking works), or putting a reverse proxy
in front are all still available. Whichever is chosen, only the Settings base URL
changes.

**Rejected alternatives.** WebDAV (auth prompts break iOS inline video); per-file
File Station share links (unmaintainable — one link per file). Also deliberately NOT
built: a `scan:nas` index feeding an in-app file picker — the NAS already renders
browsable listings, so browse → copy → paste closes most of the gap without adding a
build script, a generated reference module, a staleness story and a Mac-only
dependency. Revisit only if browsing and pasting proves insufficient in real use.

**Never modify the recordings themselves** — the app only stores references, and
removing a reference never touches the NAS file.

---

## Session Plan — algorithm & evidence (2026-07-18)

The Session Plan (`src/domain/plan.ts`) lays out a time-budgeted session as ordered
segments in five buckets (warm-up · lesson · review · deep · cool-down). It reuses the
recommendation engine's `scoreItems` — no second ranking — and is pure and deterministic.

**Decisions.**
- **Minutes always sum to the budget.** A largest-remainder split by bucket weight, each
  segment ≥ 2 min; when the budget can't seat every segment, the lowest-priority ones are
  dropped before allocation. This is the one load-bearing invariant and is tested across
  15/20/30/45/60 and the edge cases.
- **The plan runs REAL blocks, not a countdown.** The runner drives the existing
  start→active→close flow; `closeSession` advances the plan only when the closed block was
  the current segment. `RoutineRunner` (the warm-up timer) is deliberately left untouched.
- **The running plan is ephemeral** (store-only, never in `PracticeDB`) so it never syncs
  or lands in a backup as data.
- **Shares are sane defaults, adjustable, never "optimal".** Bucket minute shares come from
  `SchedulingParams` (Settings) — the app makes no claim of an ideal ratio.

**Evidence (used as rationale for the SHAPE, not as precise prescriptions).**
- Spacing effect → short, spaced segments + SM-2 (Cepeda et al. 2006; Simmons 2012).
- Contextual interference / interleaving → the no-adjacent-same-item mix and the "it feels
  harder; that's the point" framing (Shea & Morgan 1979; Carter & Grahn 2016; Stambaugh 2011).
- Retrieval practice → short review slots (Roediger & Karpicke 2006).
- Deliberate, goal-directed practice → one focus per segment (Ericsson et al. 1993;
  Duke, Simmons & Cash 2009).
- Sleep consolidation → cool-down / end-on-stability (Simmons & Duke 2006).

No claim of an optimal minute ratio is made; the shares are defaults the user can adjust.
```

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
  { file: 'pages/Repertoire.tsx', tagName: 'div', classValue: 'stack-sm' },
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

// --- a forced physical alignment never overrides a data title's own ------
//
// An EIGHTH SEALED FINDING found Repertoire's PathwayCard rendering a
// user-authored pathway name inside a `<button style={{ textAlign: 'left' }}>`
// with no direction-resolving group anywhere between them: a Farsi pathway
// name shaped correctly (the browser's own bidi algorithm needs no help for
// that) and then sat pinned to the English edge, split from the instrument /
// stage caption underneath it. The inline instrument isolate already on that
// caption could never fix it — `text-align` is a BLOCK concept, and this
// file's own "an isolate must be inline" rule exists precisely because a
// `<span>` never participates in one.
//
// Two things have to hold together, which is why this is ONE check rather
// than two: the title needs a `dir="auto"` group to resolve from, AND that
// group has to sit BELOW whatever is forcing a physical alignment and
// re-declare `textAlign: 'start'`, or the direction it resolves never
// reaches the alignment. Either half alone leaves the name exactly where it
// was. `center` is deliberately NOT a forcing value: centred text points at
// no edge, so it cannot misalign an RTL run — only `left`/`right` can, and
// excluding `center` is also what keeps this from demanding an unrequested
// layout change on the deliberately centred practice screens.
//
// The scan resolves a `style={CONST}` / `style={{ ...CONST, x }}` reference
// against module-level `const NAME = { … }` declarations in the same file,
// because that is how the real counterexample this found in Insights.tsx was
// written (`<th style={CELL} dir="auto">{r.instrumentName}</th>`, with CELL
// pinning `textAlign: 'left'`) — a scanner that only read inline literals
// would have called that site clean.

/** Module-level `const NAME = { … }` style objects, by name. */
function styleConstants(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of src.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*(?::\s*[\w.<>]+)?\s*=\s*\{([^{}]*)\}/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

/** The whole text of a tag's `style={…}` attribute value, with any
 *  module-level style constant it names spliced in. */
function styleTextOf(tag: string, consts: Record<string, string>): string {
  const at = tag.indexOf('style=');
  if (at < 0) return '';
  const from = tag.indexOf('{', at);
  if (from < 0) return '';
  let depth = 0;
  let end = tag.length;
  for (let i = from; i < tag.length; i += 1) {
    if (tag[i] === '{') depth += 1;
    else if (tag[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  const inline = tag.slice(from, end);
  const referenced = [...inline.matchAll(/[A-Za-z_$][\w$]*/g)]
    .map((m) => consts[m[0]])
    .filter(Boolean)
    .join(' ');
  return `${inline} ${referenced}`;
}

/** 'left'/'right' when a tag forces a PHYSICAL alignment over its content
 *  (directly or through a style constant), null otherwise. 'center' points
 *  at no edge and never misaligns an RTL run, so it is not forcing. */
function forcedAlign(tag: string, consts: Record<string, string>): string | null {
  return /textAlign\s*:\s*['"](left|right)['"]/.exec(styleTextOf(tag, consts))?.[1] ?? null;
}

/** True when a tag re-declares the logical `textAlign: 'start'`. */
function declaresStart(tag: string, consts: Record<string, string>): boolean {
  return /textAlign\s*:\s*['"]start['"]/.test(styleTextOf(tag, consts));
}

/**
 * Every element carrying a TITLE class whose body renders an OPAQUE data
 * expression — the owner's own text, whose language cannot be known from
 * source. A title made only of literal copy ("Routine complete") is fixed
 * English and never needs a direction of its own.
 */
function dataTitleSites(file: string): { line: number; tag: string; at: number }[] {
  const src = stripComments(SOURCES[file]);
  const out: { line: number; tag: string; at: number }[] = [];
  for (const m of src.matchAll(/<[A-Za-z][\w.]*\s[^>]*className=/g)) {
    const at = m.index!;
    const tag = enclosingTag(src, at + 1);
    if (!TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(classNameOf(tag)))) continue;
    if (tag.endsWith('/>')) continue;
    const body = elementBody(src, tag, at);
    if (!src.slice(body.start, body.end).includes('{')) continue;
    out.push({ line: src.slice(0, at).split('\n').length, tag, at });
  }
  return out;
}

/**
 * The ancestor chain of a title, innermost FIRST, each entry carrying its own
 * opening tag text so this check can read both its `dir` and its alignment.
 */
function ancestorTags(src: string, at: number): { tag: string; dir: string | null }[] {
  return ancestorChain(src, at)
    .map((e) => {
      const tag = enclosingTag(src, e.bodyStart - 1);
      return { tag, dir: e.dir };
    })
    .reverse();
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
    // The item's own <li>, not one of renderFreeText's bullet rows (which
    // now carry dir="auto" of their own and appear earlier in the file).
    const liSite = directionSites(file).find((s) => s.tagName === 'li' && s.text.includes('key={q.itemId}'));
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

  // An EIGHTH SEALED FINDING: Repertoire's PathwayCard forced a user-authored
  // pathway name left (the button's own textAlign:'left') with no
  // direction-resolving group anywhere above it, so a Persian pathway read
  // against the English edge while its own caption sat beside it. The two
  // halves are asserted together because either alone leaves the name where
  // it was: a group to resolve the direction FROM, and that same group
  // re-declaring the logical `textAlign: 'start'` below whatever pinned a
  // physical one. Discovered mechanically from the shapes the app actually
  // uses (a title class whose body renders an opaque data expression; an
  // alignment pinned inline OR through a module-level style constant), not
  // from a list of locations a reviewer happened to name.
  it('no forced left/right alignment overrides a data title\'s own resolved direction', () => {
    const violations: string[] = [];
    let titlesSeen = 0;
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      const consts = styleConstants(src);
      for (const title of dataTitleSites(file)) {
        // A title carrying its own dir is an isolate (fixed copy deliberately
        // pinned), judged by the isolate rules above, not by this one.
        if (/\sdir="(auto|ltr|rtl)"/.test(title.tag)) continue;
        const chain = [{ tag: title.tag, dir: null as string | null }, ...ancestorTags(src, title.at + 1)];
        const forcedAt = chain.findIndex((e) => forcedAlign(e.tag, consts) !== null);
        if (forcedAt < 0) continue; // nothing forces a physical edge on this title
        titlesSeen += 1;
        const where = `${file}:${title.line} [${classNameOf(title.tag).trim()}]`;
        // The group must sit strictly BELOW the forcing element (a smaller
        // index is nearer the title), resolve direction, and restore start.
        const group = chain.slice(0, forcedAt).find((e) => e.dir !== null);
        if (!group) {
          violations.push(`${where} — forced ${forcedAlign(chain[forcedAt].tag, consts)} with no dir group between`);
        } else if (group.dir !== 'auto') {
          violations.push(`${where} — the nearest group pins dir="${group.dir}" instead of resolving the title's own`);
        } else if (!declaresStart(group.tag, consts)) {
          violations.push(`${where} — its dir="auto" group never restores textAlign:'start', so the resolved direction never reaches the alignment`);
        }
      }
      // The same defect one level up, in a shape no title-class filter can
      // see: a group that resolves a direction and then pins a physical edge
      // ON ITSELF. Insights' per-instrument <th style={CELL} dir="auto"> was
      // exactly this — CELL pinning textAlign:'left' over the owner's own
      // (renameable, Farsi-capable) instrument name.
      for (const group of directionSites(file).filter(isGroup)) {
        const forced = forcedAlign(group.text, consts);
        if (forced) {
          violations.push(
            `${file}:${group.line} — a dir="auto" group pins textAlign:'${forced}', overriding the direction it just resolved`,
          );
        }
      }
    }
    expect(violations).toEqual([]);
    // Same discipline as the checks above: a scanner that silently matches
    // nothing is not proof that nothing needed checking.
    expect(titlesSeen).toBeGreaterThan(0);
  });

  // The same EIGHTH FINDING's second half: renderFreeText rendered every line
  // of a multi-line question/problem/observation bare, so one Farsi line
  // dragged every following English line RTL (and the reverse). Each line is
  // independently authored and resolves its OWN direction — except the FIRST,
  // which stays bare ON PURPOSE: it is the only strong text left for the
  // enclosing dir="auto" (the item's <li>, the Problem/Last-time value
  // wrapper) to resolve from, since the title is already isolated. Isolating
  // it too would leave the whole item with no resolution source and a silent
  // LTR fallback — the ninth finding, back again. Mutation-tested both ways:
  // making the first line resolve its own direction fails here, and so does
  // leaving the rest bare.
  it('every line after the anchor of a multi-line free-text field resolves its own direction', () => {
    const file = 'components/ClassQuestions.tsx';
    const src = stripComments(SOURCES[file]);
    const at = src.indexOf('function bullet(');
    expect(at, 'renderFreeText\'s per-line renderer not found').toBeGreaterThan(-1);
    const end = src.indexOf('\nfunction renderFreeText', at);
    const liTags = [...src.slice(at, end).matchAll(/<li\b[^>]*>/g)].map((m) => m[0]);
    expect(liTags.length, 'expected an anchor branch and an own-direction branch').toBe(2);
    const bare = liTags.filter((t) => !/\sdir=/.test(t));
    const own = liTags.filter((t) => /\sdir="auto"/.test(t));
    expect(bare.length, 'exactly one line — the anchor — stays bare').toBe(1);
    expect(own.length, 'every other line carries its own dir="auto"').toBe(1);
    // …and the branch that gets the isolate is the one chosen for lines
    // AFTER the first, never the first itself.
    expect(src.slice(at, end)).toMatch(/return own \? \(\s*<li key=\{key\} dir="auto"/);
    expect(src.slice(end)).toMatch(/bullet\(line, i, i > 0\)/);
  });
});
```

### src/pages/Insights.tsx

```
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  generateInsights,
  practiceTotals,
  practiceTotalsByInstrument,
  type Insight,
  type InsightTone,
} from '../domain';
import { useStore } from '../store/useStore';
import { EmptyState } from '../components/ui';
import { InsightsIcon } from '../components/icons';

const TONE_COLOR: Record<InsightTone, string> = {
  neutral: 'var(--border-strong)',
  positive: 'var(--tone-good)',
  attention: 'var(--tone-warn)',
};

export default function Insights() {
  const db = useStore((s) => s.db);
  const [windowDays, setWindowDays] = useState(7);
  // A LIVE clock: this page can sit open across midnight, and a `now` frozen at
  // mount would keep reporting yesterday's blocks as today's — and, on a Monday
  // rollover, last week's as this week's. One clock for the whole page, passed
  // down, so the totals below can never drift from the insights above.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const insights = useMemo(() => generateInsights(db, now, windowDays), [db, now, windowDays]);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Insights</h1>
        <p className="page-sub">Calm, neutral patterns from your practice — not a scoreboard.</p>
      </header>

      <PractiseTotals now={now} />

      <div className="options">
        {[7, 30].map((d) => (
          <button
            key={d}
            className={`option${windowDays === d ? ' selected' : ''}`}
            onClick={() => setWindowDays(d)}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {insights.length === 0 ? (
        <div className="card">
          <EmptyState icon={<InsightsIcon />} title="Not enough to say yet">
            Log a few practice blocks and patterns will appear here.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {insights.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}

      <Link to="/report" className="btn btn-block">
        Build a teacher report →
      </Link>
    </div>
  );
}

/**
 * How much practice there has actually been: today, this week and all time,
 * overall and per instrument. CALENDAR figures — a block belongs whole to the
 * local day it began, and the week starts Monday, so a session begun Sunday
 * 23:30 belongs to the week that is ending. Neutral counts of minutes and
 * blocks: no goal, no streak, no score, no bar that fills, no colour that
 * judges.
 */
function PractiseTotals({ now }: { now: Date }) {
  const db = useStore((s) => s.db);
  const overall = useMemo(() => practiceTotals(db.blocks, now), [db.blocks, now]);
  // EVERY instrument, not just the active ones. The "All instruments" row
  // counts every block, so filtering the per-instrument rows down to the active
  // ones left a retired instrument's history with no row of its own and the
  // rows silently short of the total. Instruments are never deleted (only made
  // inactive), so this covers every block; rows with nothing to report are
  // dropped so the table stays a list of practice rather than of instruments.
  const rows = useMemo(
    () => practiceTotalsByInstrument(db.instruments, db.blocks, now).filter((r) => r.allTime.blocks > 0),
    [db.instruments, db.blocks, now],
  );
  if (overall.allTime.blocks === 0) return null;

  return (
    <section className="card stack-sm">
      <div className="section-label">Time practised</div>
      <div className="table-scroll" style={{ overflowX: 'auto' }}>
        <table className="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={CELL} scope="col"></th>
              <th style={NUM} scope="col">Today</th>
              <th style={NUM} scope="col">This week</th>
              <th style={NUM} scope="col">All time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ ...CELL, fontWeight: 600 }} scope="row">All instruments</th>
              <td style={NUM}>{cell(overall.today)}</td>
              <td style={NUM}>{cell(overall.week)}</td>
              <td style={NUM}>{cell(overall.allTime)}</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.instrumentId}>
                <th style={CELL} scope="row" className="dim" dir="auto">{r.instrumentName}</th>
                <td style={NUM} className="dim">{cell(r.today)}</td>
                <td style={NUM} className="dim">{cell(r.week)}</td>
                <td style={NUM} className="dim">{cell(r.allTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny faint">
        Counted by calendar day, and the week starts Monday — a block belongs whole to the day it began.
      </p>
    </section>
  );
}

// textAlign 'start', never 'left': the instrument column's own <th> carries
// dir="auto" (the name is the owner's editable text, Farsi included), and a
// physical 'left' would resolve the direction without ever reaching the
// alignment — leaving a Farsi name shaped correctly but pinned to the
// English edge. 'start' is identical to 'left' for every English row.
const CELL: CSSProperties = { textAlign: 'start', padding: '4px 8px 4px 0', whiteSpace: 'nowrap' };
const NUM: CSSProperties = { textAlign: 'right', padding: '4px 0 4px 8px', whiteSpace: 'nowrap' };

function cell(t: { minutes: number; blocks: number }): string {
  return `${t.minutes} min · ${t.blocks}`;
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article
      className="card"
      style={{ borderLeft: `3px solid ${TONE_COLOR[insight.tone]}` }}
    >
      <div className="section-label" style={{ marginBottom: 4 }}>
        {insight.category}
      </div>
      <div dir="auto">
        <div className="title-md" style={{ fontSize: '1.05rem', marginBottom: 4 }}>
          {insight.title}
        </div>
        {/* Fixed English sentence with an item's own (possibly Farsi) title
            sometimes embedded mid-sentence (e.g. `Most of your time went to
            "${item.title}"…`) — its own dir="ltr" isolate fixes the
            sentence's bidi base regardless of any embedded title, the same
            shape StageDetail's undo banner already uses. */}
        <div className="small dim">
          <span dir="ltr">{insight.body}</span>
        </div>
      </div>
    </article>
  );
}
```

### src/pages/Repertoire.tsx

```
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  defaultInstrumentFilter,
  formsPresent,
  groupBlocksByItem,
  groupByDastgah,
  isDue,
  itemMatchesSearch,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  neglectedScore,
  nextLessonDates,
  overworkedItems,
  pathwayProgress,
  pathwaysForInstrumentFilter,
  scoreItems,
  stageProgress,
  stageUnits,
  repertoireWorks,
  UNCLASSIFIED_DASTGAH,
  type ItemStatus,
  type ItemType,
  type Pathway as PathwayT,
  type RepertoireWork,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import ItemCard from '../components/ItemCard';
import QuickAdd from '../components/QuickAdd';
import { Field, StatusBadge } from '../components/ui';
import { recordToOptions } from '../components/options';
import { relativeFromDateTime } from '../components/format';
import { ChevronRightIcon, ItemsIcon, PathIcon, PlusIcon } from '../components/icons';
import { EmptyState } from '../components/ui';

type View = 'paths' | 'works' | 'all';

export default function Repertoire() {
  const [view, setView] = useState<View>('paths');
  const navigate = useNavigate();

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="row between">
          <h1 className="page-title">Repertoire</h1>
          <div className="row" style={{ gap: 8 }}>
            <Link to="/materials" state={{ from: '/repertoire' }} className="btn btn-ghost btn-sm">
              Study sources
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
              <PlusIcon /> Add practice item
            </button>
          </div>
        </div>
        <p className="page-sub" style={{ margin: 0 }}>
          Practice items are what you do. Pathways, study sources and lessons simply connect the same items in
          different ways.
        </p>
        <div className="options" role="group" aria-label="Repertoire view">
          <button className={`option${view === 'paths' ? ' selected' : ''}`} aria-pressed={view === 'paths'} onClick={() => setView('paths')}>
            Pathways
          </button>
          <button
            className={`option${view === 'works' ? ' selected' : ''}`}
            aria-pressed={view === 'works'}
            onClick={() => setView('works')}
          >
            My repertoire
          </button>
          <button className={`option${view === 'all' ? ' selected' : ''}`} aria-pressed={view === 'all'} onClick={() => setView('all')}>
            Practice list
          </button>
        </div>
      </header>

      {view === 'paths' ? <PathwaysView /> : view === 'works' ? <MyRepertoireView /> : <AllItemsView />}
    </div>
  );
}

// --- My repertoire: the works you actually play -------------------------------
//
// A LENS over ordinary practice items (domain/repertoire.ts) — never a
// parallel database. Persian instruments group by dastgāh/āvāz with radif
// gushehs and composed maestro pieces side by side (a chahārmezrāb of Sabā in
// Afshāri is repertoire, not a stage); other instruments group by study
// source. Parent works appear once; parts stay nested beneath them.

function MyRepertoireView() {
  const db = useStore((s) => s.db);
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);

  const activeInstruments = db.instruments.filter((i) => i.active);
  // Open on the instrument you are actually practising; the dropdown still
  // widens to all. This never writes sessionInstrumentId back — browsing
  // another instrument must not change what Today recommends.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [instrumentId, setInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, activeInstruments),
  );
  const [formFilter, setFormFilter] = useState('');

  const scope = useMemo(
    () => db.items.filter((i) => !instrumentId || i.instrumentId === instrumentId),
    [db.items, instrumentId],
  );
  const works = useMemo(() => repertoireWorks(scope), [scope]);
  const forms = useMemo(() => formsPresent(works), [works]);

  const filtered = useMemo(
    () => (formFilter ? works.filter((w) => (w.work.persian?.form ?? '').toLowerCase() === formFilter.toLowerCase()) : works),
    [works, formFilter],
  );

  const persianIds = useMemo(
    () => new Set(db.instruments.filter((i) => i.family === 'Persian').map((i) => i.id)),
    [db.instruments],
  );
  const persianWorks = filtered.filter((w) => persianIds.has(w.work.instrumentId));
  const otherWorks = filtered.filter((w) => !persianIds.has(w.work.instrumentId));

  // Persian works by dastgāh (works only — parts are attached to each work).
  const dastgahGroups = useMemo(() => {
    const byId = new Map(persianWorks.map((w) => [w.work.id, w]));
    return groupByDastgah(persianWorks.map((w) => w.work)).map((g) => ({
      dastgah: g.dastgah,
      works: g.items.map((i) => byId.get(i.id)!),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, instrumentId]);

  // Other instruments (e.g. Classical Guitar): group by study source.
  const sourceGroups = useMemo(() => {
    const map = new Map<string, typeof otherWorks>();
    for (const w of otherWorks) {
      const key = w.work.materialId ?? '';
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return [...map.entries()]
      .map(([materialId, ws]) => ({
        label: materialId ? (db.materials.find((m) => m.id === materialId)?.title ?? 'Unknown source') : 'No study source yet',
        works: ws,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, instrumentId, db.materials]);

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        The works and gushehs you play. Radif and composed maestro pieces sit together under their dastgāh; parts stay
        under their parent work.
      </p>

      {activeInstruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument">
          <button className={`option${!instrumentId ? ' selected' : ''}`} aria-pressed={!instrumentId} onClick={() => setInstrumentId('')}>
            All
          </button>
          {activeInstruments.map((i) => (
            <button
              key={i.id}
              className={`option${instrumentId === i.id ? ' selected' : ''}`}
              aria-pressed={instrumentId === i.id}
              onClick={() => setInstrumentId(i.id)}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}

      {forms.length > 1 && (
        <div className="row-wrap" role="group" aria-label="Filter by form">
          {forms.map((f) => (
            <button
              key={f}
              className={`chip${formFilter.toLowerCase() === f.toLowerCase() ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              aria-pressed={formFilter.toLowerCase() === f.toLowerCase()}
              onClick={() => setFormFilter((cur) => (cur.toLowerCase() === f.toLowerCase() ? '' : f))}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No works here yet">
            Add a gusheh or a composed piece (with its dastgāh, form, composer) — or a guitar piece — and it appears
            here. Technique drills stay in the Practice list.
          </EmptyState>
        </div>
      )}

      {dastgahGroups.map((g) => (
        <section key={g.dastgah} className="stack-sm" dir="auto">
          <div className="row between">
            <h2 className="title-md">
              {g.dastgah === UNCLASSIFIED_DASTGAH ? 'No dastgāh yet' : g.dastgah}
            </h2>
            {/* Generated English metadata, never user text — its own
                dir="ltr" isolate keeps it from inheriting the dastgāh
                heading's RTL base. */}
            <span className="tiny faint" dir="ltr">
              {g.works.length} work{g.works.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card card-flush list">
            {g.works.map((w) => (
              <WorkRow key={w.work.id} entry={w} db={db} now={now} />
            ))}
          </div>
        </section>
      ))}

      {otherWorks.length > 0 &&
        sourceGroups.map((g) => (
          <section key={g.label} className="stack-sm" dir="auto">
            <div className="row between">
              <h2 className="title-md">
                {g.label}
              </h2>
              {/* Generated English metadata, never user text — its own
                  dir="ltr" isolate keeps it from inheriting the group
                  heading's RTL base. */}
              <span className="tiny faint" dir="ltr">
                {g.works.length} work{g.works.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="card card-flush list">
              {g.works.map((w) => (
                <WorkRow key={w.work.id} entry={w} db={db} now={now} />
              ))}
            </div>
          </section>
        ))}

      <button className="btn" style={{ width: 'fit-content' }} onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
        <PlusIcon /> Add practice item
      </button>
    </div>
  );
}

function WorkRow({
  entry,
  db,
  now,
}: {
  entry: RepertoireWork;
  db: ReturnType<typeof useStore.getState>['db'];
  now: Date;
}) {
  const { work, parts } = entry;
  const [open, setOpen] = useState(false);
  return (
    <div className="list-row" style={{ flexWrap: 'wrap' }}>
      <Link to={`/items/${work.id}`} state={{ from: '/repertoire' }} className="grow row" style={{ minWidth: 0, gap: 10 }}>
        <div className="grow" dir="auto" style={{ minWidth: 0 }}>
          <div className="truncate">
            {work.title}
          </div>
          {/* form/composer/gusheh and the instrument name are all authored
              independently of the work's own title (their own dir="auto"
              isolates — the instrument name is the owner's own editable
              text, renameable in Settings, Farsi included, never generated
              copy); the last-practised phrase is generated metadata (its own
              dir="ltr" isolate) — never one isolate speaking for all of
              them, and never joined into one bare string that inherits
              whichever direction the title happened to resolve. */}
          <div className="tiny faint truncate">
            {[
              work.persian?.form ? <span dir="auto">{work.persian.form}</span> : null,
              work.persian?.composer ? <span dir="auto">{work.persian.composer}</span> : null,
              work.persian?.gusheh ? (
                <span>
                  gusheh: <span dir="auto">{work.persian.gusheh}</span>
                </span>
              ) : null,
              <span dir="auto">{instrumentName(db, work.instrumentId)}</span>,
              <span dir="ltr">
                {work.lastPractisedAt ? `last ${relativeFromDateTime(work.lastPractisedAt, now)}` : 'not practised yet'}
              </span>,
            ]
              .filter(Boolean)
              .map((node, i) => (
                <span key={i}>
                  {i > 0 ? ' · ' : ''}
                  {node}
                </span>
              ))}
          </div>
        </div>
        <StatusBadge status={work.status} />
      </Link>
      {parts.length > 0 && (
        <>
          <button
            className="link tiny"
            style={{ background: 'none', border: 'none', flex: 'none' }}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '− parts' : `${parts.length} part${parts.length === 1 ? '' : 's'} ›`}
          </button>
          {open && (
            <div className="stack-sm" style={{ width: '100%', paddingLeft: 14, marginTop: 6 }}>
              {parts.map((p) => (
                <Link key={p.id} to={`/items/${p.id}`} state={{ from: '/repertoire' }} className="row between small card-link" dir="auto" style={{ minWidth: 0 }}>
                  <span className="truncate dim">
                    {p.title}
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- By pathway --------------------------------------------------------------

function PathwaysView() {
  const db = useStore((s) => s.db);
  const addPathway = useStore((s) => s.addPathway);
  const reseedDefaultPathways = useStore((s) => s.reseedDefaultPathways);
  const navigate = useNavigate();

  const activeInstruments = db.instruments.filter((i) => i.active);
  // Open on the instrument you are actually practising; the toggle still
  // widens to all. This never writes sessionInstrumentId back — browsing
  // another instrument must not change what Today recommends.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [filterInstrumentId, setFilterInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, activeInstruments),
  );

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');

  const pathways = useMemo(
    () => pathwaysForInstrumentFilter(db.pathways, filterInstrumentId).slice().sort((a, b) => a.order - b.order),
    [db.pathways, filterInstrumentId],
  );

  function create() {
    if (!name.trim()) return;
    const id = addPathway({ name, instrumentId: instrumentId || undefined });
    setName('');
    setCreating(false);
    navigate(`/pathway/${id}`);
  }

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        Your items, organised along the routes you trust. Add pieces from each stage's list, at your own pace.
      </p>

      {activeInstruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument">
          <button
            className={`option${!filterInstrumentId ? ' selected' : ''}`}
            aria-pressed={!filterInstrumentId}
            onClick={() => setFilterInstrumentId('')}
          >
            All
          </button>
          {activeInstruments.map((i) => (
            <button
              key={i.id}
              className={`option${filterInstrumentId === i.id ? ' selected' : ''}`}
              aria-pressed={filterInstrumentId === i.id}
              onClick={() => setFilterInstrumentId(i.id)}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}

      {pathways.map((p) => (
        <PathwayCard key={p.id} pathway={p} db={db} onOpen={() => navigate(`/pathway/${p.id}`)} />
      ))}

      {creating ? (
        <div className="card stack-sm">
          <Field label="Name">
            <input className="input" dir="auto" autoFocus placeholder="e.g. Tar · my teacher's plan" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Instrument">
            <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
              <option value="">General</option>
              {db.instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!name.trim()} onClick={create}>
              Create pathway
            </button>
            <button className="btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="row-wrap">
          <button className="btn btn-sm" onClick={() => setCreating(true)}>
            <PlusIcon /> New pathway
          </button>
          {pathways.length === 0 && (
            <button className="btn btn-sm" onClick={reseedDefaultPathways}>
              Restore default pathways
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PathwayCard({
  pathway,
  db,
  onOpen,
}: {
  pathway: PathwayT;
  db: ReturnType<typeof useStore.getState>['db'];
  onOpen: () => void;
}) {
  const stage = currentStage(db.pathwayStages, db.items, pathway.id);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const sp = stage ? stageProgress(stageUnits(stage, db.items)) : null;

  return (
    <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
      {/* The pathway's own name and the line of metadata under it are ONE
          group, carrying the direction, so a Farsi name and its own caption
          read as one right-aligned block — the rule the rest of this app
          already follows. The group sits INSIDE the button rather than on
          it (the Balance-row precedent: the chevron's `row between` and the
          progress bar below are layout, not text, and giving them a
          resolved RTL direction would swap the bar and the counter), and it
          re-declares textAlign:'start' because the button pins
          textAlign:'left' — a resolved direction that never reaches the
          alignment leaves a Persian title pinned left exactly as before.
          The instrument name keeps its own inline dir="auto" isolate for
          the reason PathwayDetail's identical line does: it is the owner's
          own editable text and need not share the pathway name's language.
          stage.code/title stay bare — it's the stage's own compound label,
          not a foreign caption. */}
      <div className="stack-sm" dir="auto" style={{ textAlign: 'start', minWidth: 0 }}>
        <div className="row between">
          <div className="row" style={{ gap: 8, minWidth: 0 }}>
            <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
            <span className="title-md truncate">{pathway.name}</span>
          </div>
          <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
        </div>
        <div className="tiny faint truncate">
          <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
          {stage ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}` : ''}
        </div>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span className="balance-track grow">
          <span className="balance-fill" style={{ width: `${sp?.percent ?? 0}%` }} />
        </span>
        <span className="tiny faint mono-num">
          {prog.done}/{prog.total}
        </span>
      </div>
    </button>
  );
}

// --- All items ---------------------------------------------------------------

type Quick = 'due' | 'lesson' | 'fragile' | 'neglected' | 'overworked' | 'teacher';

const QUICK: { key: Quick; label: string }[] = [
  { key: 'due', label: 'Due today' },
  { key: 'lesson', label: 'For class' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'neglected', label: 'Neglected' },
  { key: 'overworked', label: 'Overworked' },
  { key: 'teacher', label: 'Teacher Q' },
];

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

function AllItemsView() {
  const db = useStore((s) => s.db);

  const now = useMemo(() => new Date(), []);
  const [search, setSearch] = useState('');
  // Seeded from the session instrument (never written back) against the same
  // list the dropdown below renders.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [instrumentId, setInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, db.instruments),
  );
  const [status, setStatus] = useState<ItemStatus | ''>('');
  const [type, setType] = useState<ItemType | ''>('');
  const [quick, setQuick] = useState<Set<Quick>>(new Set());

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const scored = useMemo(
    () => scoreItems(db.items, groupBlocksByItem(db.blocks), now, lessonDates),
    [db.items, db.blocks, now, lessonDates],
  );
  const overworkedIds = useMemo(
    () => new Set(overworkedItems(db.items, db.blocks, now).map((i) => i.id)),
    [db.items, db.blocks, now],
  );

  const toggleQuick = (k: Quick) =>
    setQuick((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const visible = scored
    .map((s) => s.item)
    .filter((item) => {
      if (!itemMatchesSearch(item, search)) return false;
      if (instrumentId && item.instrumentId !== instrumentId) return false;
      if (status && item.status !== status) return false;
      if (type && item.itemType !== type) return false;
      if (quick.has('due') && !isDue(item, now)) return false;
      if (quick.has('lesson') && !item.assignedForLesson) return false;
      if (quick.has('fragile') && item.status !== 'fragile' && item.status !== 'repairing') return false;
      if (quick.has('neglected') && neglectedScore(item, now) < 2) return false;
      if (quick.has('overworked') && !overworkedIds.has(item.id)) return false;
      if (quick.has('teacher') && !(item.teacherQuestion && item.teacherQuestion.trim())) return false;
      return true;
    });

  return (
    <div className="stack">
      <QuickAdd />

      <div className="stack-sm">
        <input className="input" dir="auto" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="row" style={{ gap: 8 }}>
          <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            <option value="">All instruments</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as ItemStatus | '')}>
            <option value="">Any status</option>
            {ITEM_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as ItemType | '')}>
            <option value="">Any type</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="row-wrap">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className={`chip${quick.has(q.key) ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleQuick(q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No items match">
            Try clearing a filter, or add one above — just a title is enough.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### src/pages/RoutineRunner.tsx

```
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { aggregateItemMinutes, locateClock, nextSignal, runElapsedSeconds, segmentBoundaries, segmentsForRun, type RunSegment } from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon } from '../components/icons';
import { playSignalCue, useScreenAwake } from '../components/useScreenAwake';

/** How long the "just arrived" cue stays visible after a segment boundary — long enough that glancing up a few seconds later still shows it, never a single-render flash. */
const SEGMENT_ARRIVAL_WINDOW_SECONDS = 8;

/**
 * The live run (segs/elapsed/running) lives in the store as `activeRoutine`,
 * not component state — so a nav-bar tap or browser back never silently
 * loses genuinely-elapsed bound-item practice, the same reason `active`
 * (an ordinary block session) survives navigation. Only one routine can run
 * at a time: if a DIFFERENT routine is already active, this redirects to it
 * rather than letting a fresh start quietly discard its in-flight time. And
 * only one practice clock of ANY kind runs at a time: if an ordinary block
 * is active, this redirects to it too, rather than starting a routine
 * alongside it and logging the same interval twice.
 */
export default function RoutineRunner() {
  const { routineId } = useParams();
  const [searchParams] = useSearchParams();
  const shortOnTime = searchParams.get('short') === '1';
  const navigate = useNavigate();
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const startRoutineRun = useStore((s) => s.startRoutineRun);
  const pauseRoutineRun = useStore((s) => s.pauseRoutineRun);
  const resumeRoutineRun = useStore((s) => s.resumeRoutineRun);
  const skipRoutineRun = useStore((s) => s.skipRoutineRun);
  const finishRoutine = useStore((s) => s.finishRoutine);
  const setRoutineSignal = useStore((s) => s.setRoutineSignal);

  const routine = db.pathwayRoutines.find((r) => r.id === routineId);
  const stage = routine?.stageId ? db.pathwayStages.find((s) => s.id === routine.stageId) : undefined;

  // Snapshot of what was actually recorded, frozen at the moment of finishing
  // — the finished screen must show exactly what was saved, never a value
  // recomputed later against a clock that has since stopped advancing.
  const [result, setResult] = useState<{ segs: RunSegment[]; elapsedSeconds: number } | null>(null);
  const [, setTick] = useState(0);

  const isMine = !!routineId && activeRoutine?.routineId === routineId;
  const otherActive = activeRoutine && activeRoutine.routineId !== routineId ? activeRoutine : undefined;

  // An existing run's segment list — content AND short-on-time filtering — is
  // decided once, at start, and frozen into activeRoutine. It is never
  // re-derived from the routine's CURRENT data: the routine can be edited
  // (segments added/removed) from its Stage/Pathway page with no "is this
  // active" guard while a run is in progress, and re-deriving live would
  // desync this list's length from activeRoutine.segs — indexing past the
  // end of one of them, a blank runner screen. A stale `?short=1` link on an
  // already-running full routine is the same family of bug. The URL param
  // and the routine's live data only seed a FRESH run.
  const effectiveShortOnTime = isMine ? activeRoutine.shortOnTime : shortOnTime;
  const authoredSegments = isMine
    ? activeRoutine.authoredSegments
    : routine
      ? segmentsForRun(routine.segments, effectiveShortOnTime)
      : [];

  // A different routine is already running: resume it rather than letting a
  // fresh start here silently overwrite its unsaved elapsed time.
  useEffect(() => {
    if (otherActive) {
      navigate(`/routine/${otherActive.routineId}${otherActive.shortOnTime ? '?short=1' : ''}`, { replace: true });
    }
  }, [otherActive, navigate]);

  // An ordinary block is already running: resolve it there. The store's
  // startRoutineRun already refuses to start a routine while one is active
  // (so the same interval can never be logged twice), but without this
  // redirect the "begin one" effect below would just no-op forever, leaving
  // the user stranded on a blank screen instead of back at their block.
  // Unconditional on isMine: the guards above make "this routine is mine AND
  // an ordinary block also exists" unreachable from any in-app action, so the
  // only way here is a persisted dual-clock state from before those guards —
  // which the store's hydration `merge` freezes rather than deletes. Without
  // this redirect, `isMine` would keep showing this frozen routine with a
  // Resume button that silently no-ops (resumeRoutineRun refuses while
  // `active` exists). Sending the user to resolve the block first, same as
  // any genuinely concurrent case, gives a single deterministic way out
  // instead of a dead button.
  useEffect(() => {
    if (active) navigate('/active', { replace: true });
  }, [active, navigate]);

  // Nothing running yet for this routine: begin one.
  useEffect(() => {
    if (routine && routineId && !active && !activeRoutine && !result) {
      startRoutineRun(routineId, shortOnTime, segmentsForRun(routine.segments, shortOnTime));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routine, routineId, shortOnTime, active]);

  // Force a re-render every second so the countdown visibly ticks. The actual
  // time is always read fresh from the wall clock below, so a background/lock
  // interval catches up correctly the moment this tab wakes up again — it is
  // never a count of the ticks that fired.
  useEffect(() => {
    if (!isMine || !activeRoutine?.running) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isMine, activeRoutine?.running]);

  const elapsedSeconds = isMine
    ? runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date())
    : 0;
  const segs = isMine ? activeRoutine.segs : [];
  const clock = isMine ? locateClock(segs, elapsedSeconds) : null;

  useScreenAwake(isMine, isMine && !!activeRoutine?.running);

  // Announce a boundary at most once, whether crossed by natural ticking or
  // by waking up after a background/lock interval that jumped several
  // segments at once. Skip never reaches this path — it acknowledges
  // silently via the store's skipRoutineRun instead.
  useEffect(() => {
    if (!isMine || !activeRoutine.running) return; // paused or frozen (legacy dual-clock hydration): announce nothing
    const signalResult = nextSignal(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
    if (signalResult.announce) {
      setRoutineSignal(signalResult.marker);
      playSignalCue();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMine, activeRoutine?.running, activeRoutine?.signalledThrough, elapsedSeconds, segs]);

  function finish() {
    if (!isMine || result) return;
    setResult({ segs, elapsedSeconds });
    finishRoutine();
  }

  // Natural completion: the wall clock alone decides once E reaches the run's
  // total — no per-tick counting, so a background/lock interval that runs
  // past the end is caught here the moment this tab wakes up again.
  useEffect(() => {
    if (isMine && clock?.finished && !result) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMine, clock?.finished]);

  if (!routine) {
    return (
      <div className="stack" style={{ textAlign: 'center', paddingTop: 'var(--space-6)' }}>
        <h1 className="page-title">Routine not found</h1>
        <Link to="/repertoire" className="btn btn-primary">
          Back to repertoire
        </Link>
      </div>
    );
  }

  const backTo = routine.stageId
    ? `/pathway/${routine.pathwayId}/${routine.stageId}`
    : routine.pathwayId
      ? `/pathway/${routine.pathwayId}`
      : '/';

  if (result) {
    const recorded = aggregateItemMinutes(result.segs, result.elapsedSeconds);
    return (
      <div className="stack-lg" style={{ textAlign: 'center', paddingTop: 'var(--space-7)' }}>
        <div className="timer-ring" style={{ background: 'var(--tone-good-soft)' }}>
          <div style={{ display: 'grid', placeItems: 'center', gap: 6 }}>
            <CheckIcon width={48} height={48} style={{ color: 'var(--tone-good)' }} />
            <div className="title-md">Routine complete</div>
          </div>
        </div>
        {recorded.size > 0 ? (
          <div className="card stack-sm" style={{ textAlign: 'left' }}>
            <div className="section-label">Recorded</div>
            {/* textAlign 'start' on the row itself: the card above pins a
                physical 'left', so without this the row resolves a Farsi
                item's direction but never carries it to the alignment —
                the title shapes RTL and still hugs the English edge.
                Identical to 'left' for an English title. */}
            {[...recorded.entries()].map(([itemId, minutes]) => (
              <div key={itemId} className="row between" dir="auto" style={{ textAlign: 'start' }}>
                <span className="truncate">
                  {getItem(db, itemId)?.title ?? 'Item'}
                </span>
                {/* Generated English metadata, never user text — its own
                    dir="ltr" isolate keeps it from inheriting a Farsi
                    item title's RTL base. */}
                <span className="tiny faint" dir="ltr">{minutes} min</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="page-sub">Nicely done. Short and steady is the whole game.</p>
        )}
        <button className="btn btn-primary btn-lg" onClick={() => navigate(backTo)}>
          {stage ? `Back to ${stage.code}` : 'Back'}
        </button>
      </div>
    );
  }

  if (!isMine || !clock) return null; // brief window while redirecting to / starting the run

  const seg = authoredSegments[clock.segIndex];
  if (!seg) return null;
  const segTotalSeconds = segs[clock.segIndex]?.seconds ?? seg.minutes * 60;
  const deg = segTotalSeconds > 0 ? (clock.segElapsedSeconds / segTotalSeconds) * 360 : 0;
  const next = authoredSegments[clock.segIndex + 1];
  // A segment reached via a boundary crossing (never the run's opening segment) stays
  // perceptibly marked for a defined window — never a one-render flash — so a musician
  // glancing up a few seconds after arriving still sees that the segment changed. This is
  // elapsed-derived, not marker-derived, so it also shows after a deliberate Skip (which
  // suppresses only the announcement, via acknowledgeThrough) — deliberately: it describes
  // the segment you are now on, not a re-announcement of the one you just chose to end.
  const justArrived = clock.segIndex > 0 && clock.segElapsedSeconds < SEGMENT_ARRIVAL_WINDOW_SECONDS;

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
          {effectiveShortOnTime ? ' · short on time' : ''}
        </div>
        <div className={`tiny${justArrived ? ' segment-arrived' : ' faint'}`}>
          {justArrived ? 'New segment · ' : ''}
          Segment {clock.segIndex + 1} of {authoredSegments.length}
          {seg.itemId ? '' : ' · warm-up — not logged as practice'}
        </div>
      </header>

      <div
        className={`timer-ring${justArrived ? ' timer-ring--arrived' : ''}`}
        style={{ background: `conic-gradient(var(--accent-dim) ${deg}deg, var(--surface-3) ${deg}deg)` }}
      >
        <div
          style={{
            width: 194,
            height: 194,
            borderRadius: '50%',
            background: 'var(--surface)',
            display: 'grid',
            placeItems: 'center',
            gap: 4,
            padding: 16,
          }}
        >
          <div className="timer" style={{ fontSize: '2.8rem' }}>
            {formatClock(clock.secondsLeft)}
          </div>
          {seg.essential && <span className="tiny" style={{ color: 'var(--gold)' }}>essential</span>}
        </div>
      </div>

      {/* The segment's own label leads, so it and the item beneath it read as
          one block rather than pointing at opposite edges. */}
      <div dir="auto">
        <div className="title-md" style={{ fontSize: '1.2rem' }}>
          {seg.label}
        </div>
        {seg.itemId && (
          <div className="tiny faint" dir="auto">
            {getItem(db, seg.itemId)?.title}
          </div>
        )}
        {/* next.label is authored independently of seg.label — its own
            dir="auto" isolate resolves from its own content, not seg's. */}
        {next && (
          <div className="tiny faint" style={{ marginTop: 6 }}>
            Next: <span dir="auto">{next.label}</span>
          </div>
        )}
      </div>

      <div className="row" style={{ justifyContent: 'center' }}>
        {activeRoutine.running ? (
          <button className="btn btn-lg" onClick={pauseRoutineRun}>
            <PauseIcon /> Pause
          </button>
        ) : (
          <button className="btn btn-lg" onClick={resumeRoutineRun}>
            <PlayIcon /> Resume
          </button>
        )}
        <button className="btn" onClick={skipRoutineRun}>
          Skip
        </button>
      </div>

      <div className="stack-sm" style={{ alignItems: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={finish}>
          <CheckIcon width={16} height={16} /> Finish &amp; save
        </button>
        <span className="tiny faint">Records what you've practised so far — never a discard</span>
      </div>
    </div>
  );
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
