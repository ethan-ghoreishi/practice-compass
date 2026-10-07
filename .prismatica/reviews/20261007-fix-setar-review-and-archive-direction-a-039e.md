---
id: 20261007-fix-setar-review-and-archive-direction-a-039e
contractId: 20261007-fix-setar-review-and-archive-direction-a-039e
patchId: 59f4c258584b13cf3d350fe3ec365f3b1295c95b
reviewer: codex
state: sealed
verdict: request_changes
createdAt: 2026-10-07T02:36:13.484Z
sealedAt: 2026-10-07T11:04:15.525Z
---

# Review: Fix Setar review and archive direction and choice state, and Repertoire search typing

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261007-fix-setar-review-and-archive-direction-a-039e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/47
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `59f4c258584b13cf3d350fe3ec365f3b1295c95b`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The Delta this change was framed from

# The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

_approved · about "browse-my-repertoire" step 3_

## Today

Typing quickly in the search box on a slow device can lose characters, because the box shows the URL's query and the router renders a URL change in a transition.

## Instead

The search box always keeps every character typed and the URL follows it; back/forward, Clear filters, an instrument switch and the Practice list still show the URL's query, and no filter erases another (c4506c6).

## Keep

- Query, facets and grouping live in the URL and survive opening a work and coming back.
- Browsing never changes the session instrument.

## New assumptions

_none_

## Show me

Under heavy CPU slowdown type "pishdaramad" into Search my repertoire one key at a time, then pick a composer: both the box and the URL hold the whole word and the composer.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, the findings
that review recorded, and the paths the rework touched — read any file you need
from the lane. The same Check already bound to this head is not to be rerun
wholesale.

Verify each prior finding's FAMILY across every consumer in the repository, not
only the lines this rework changed: a family is closed when no instance of its
invariant survives anywhere, and a fix that reached one consumer while a sibling
still breaks it is not closed.

**Approved intent:** `.prismatica/intents/20261007-fix-setar-review-and-archive-direction-a-039e.md`

**Findings from the previous review:**

- **archive-answer-visibility-through-repreview** — P1: Decisions that Apply will execute must remain visible, selected, switchable and clearable until Apply, even when candidate counts change. answer() discards reporting when the fresh question is undefined, while every decision branch still executes.
  _counterexample:_ Select Link, Create separately or Skip for piece عراق with one unbound exact-title candidate. Rename that candidate through a sync pull, then answer another row to re-preview. The row vanishes, but the retained decision still adopts the renamed item, creates an item or writes a suppression, with no stale decision. All three class answers fail likewise when two matching classes become one. Verified all six branches and applyArchiveImport in memory. Instances: sourceReconcile.ts:647,659,675,762,773,779 through answer():612-615 and thresholds:638-641,753-756. Consumers: ArchiveRefresh.tsx:100-104,166-171 hides them; store preview/commit and apply retain their effects. Checked clean: six stable answers, six clears with unchanged candidates, and six deleted/bound/other-instrument links with sufficient remaining ambiguity.
- **generated-line-direction-proof-matrix** — P2: ac-1 requires geometric order proof crossing English/Farsi titles with English/Farsi/mixed values. The named test lacks English-title/Farsi-value and English-title/mixed-value cases.
  _counterexample:_ tests/fixtures/setar-review-ui.json:40-44 and 70-74 are the only English-title groups; all four measured lines contain exclusively English values. tests/setar-review-ui.browser.test.ts:219-225 measures only those fixture rows. Swept tests/setar-practice.browser.test.ts:1460-1500: its English-title check allows zero authored values and checks computed direction, not token order. practice-information-layout.browser.test.ts covers notes. Checked clean: geometric coverage for Farsi-title setup rows, both archive DifferenceRow sections and attention rows across Chromium/WebKit and phone/desktop. Complete the missing combinations in the contracted named fixture route.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 09b24599a95d7865aa6c0f29910479ec51dddf83..b26cdd4cad0f1bb672851f5f4fb7a8546d304824 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -28,7 +28,14 @@ Five reports, one heavy lane (contract 20261007-…-039e, issue #47).
   plan reports `answered` beside the open `questions`, so preview, re-preview and
   commit read one source; "N to decide" still counts only open ones; a link whose
   target no longer qualifies is stale and the question opens again. `questions`
-  kept its meaning because the store's rebase check reads it.
+  kept its meaning because the store's rebase check reads it. Review found an
+  answer vanishing when its candidates moved (a rename via sync) while Apply
+  still executed it; every ACTED-ON decision is now reported, flagged
+  `ambiguous: false` when it would no longer be asked. Rejected: calling such
+  a decision stale — its target still qualifies, and the archive decision
+  semantics (what is stale) were not this lane's to change. So "a cleared
+  answer writes nothing" holds only for a question still open; clearing one
+  that would no longer be asked gets the unasked default, said on its row.
 - **Repertoire search was a real, rare defect.** The box showed the URL's query;
   the router renders a URL change in a transition, and while one is pending React
   restores a controlled input to its last rendered value — "pishdaramad" became
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 8f35646f5208dd555fd4e9930de684eaa8a44015..ae7a970acf4ebbbf82777794cf6e8b8fb7c15276 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -313,7 +313,14 @@ applies the lot in one store mutation.
   An answered question **stays listed with its answer selected** until Apply,
   and can be switched or cleared there (`plan.answered`); Apply writes exactly
   the answers selected then, an unanswered or cleared one writes nothing, and
-  "N to decide" counts only the open ones.
+  "N to decide" counts only the open ones. **Every decision Apply would execute
+  is listed**, even when its candidates moved after it was chosen (a sync
+  renamed the only match, two matching classes became one): it stays selected,
+  switchable and clearable, says the matches changed (`ambiguous: false`), and
+  is never silently executed off screen. "A cleared one writes nothing" holds
+  only while the question is still open: cleared there, the refresh does what
+  it does unasked (the piece is added; a class that alone still matches is
+  adopted, otherwise added), and the row says so before it is cleared.
 - **Every choice shows itself.** Keep my value / Use archive value and each
   answer mark the chosen one with the selected treatment (weight as well as
   colour), not only `aria-pressed`. Keep my value is the default.
diff --git a/src/components/ArchiveRefresh.tsx b/src/components/ArchiveRefresh.tsx
index 63229e7889ad69a6628676ee3d841d7dcf567103..63a5bacc2d8696bf2fd938907576b824880e9a2a 100644
--- a/src/components/ArchiveRefresh.tsx
+++ b/src/components/ArchiveRefresh.tsx
@@ -254,9 +254,13 @@ export default function ArchiveRefresh() {
                     <strong>{q.label}</strong>
                     <div className="tiny faint">
                       <span dir="ltr">
-                        {q.kind === 'item'
-                          ? 'An existing piece has this exact name.'
-                          : 'More than one class matches this session.'}
+                        {'answer' in q && !q.ambiguous
+                          ? `The matches changed since you answered; your answer still applies. Cleared, this refresh does what it does unasked: ${
+                              q.kind === 'item' ? 'the piece is added as new' : 'a class that alone still matches is adopted, otherwise a new class is added'
+                            }.`
+                          : q.kind === 'item'
+                            ? 'An existing piece has this exact name.'
+                            : 'More than one class matches this session.'}
                       </span>
                     </div>
                   </div>
diff --git a/src/domain/sourceReconcile.test.ts b/src/domain/sourceReconcile.test.ts
index a4757587a3b85a4e2091475583fc6fe4158b893c..4f89bbfe9a4d2bc2f132a40c82a113ef7665768f 100644
--- a/src/domain/sourceReconcile.test.ts
+++ b/src/domain/sourceReconcile.test.ts
@@ -1899,7 +1899,7 @@ describe('answered questions, until Apply', () => {
       const asked = 'pieceKey' in d ? askedPiece : askedClass;
       const isIt = (q: { pieceKey?: string; sessionN?: number }) => q.pieceKey === asked.pieceKey && q.sessionN === asked.sessionN;
       expect(p.questions.some(isIt), d.kind).toBe(false);
-      expect(p.answered, d.kind).toEqual([{ ...asked, answer: d }]);
+      expect(p.answered, d.kind).toEqual([{ ...asked, answer: d, ambiguous: true }]);
       expect(p.summary.questions, d.kind).toBe(open.questions.length - 1);
       expect(p.staleDecisions, d.kind).toEqual([]);
     }
@@ -1934,11 +1934,76 @@ describe('answered questions, until Apply', () => {
     expect(staleClass.adoptedLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
     expect(staleClass.questions.find((q) => q.sessionN === 13)!.candidates.map((c) => c.id).sort()).toEqual(['legacy-13', 'legacy-13-third']);
 
-    // A decision about something never asked is NOT reported as an answered
-    // question (there was no question to answer): skipping a piece nobody else
-    // claims still suppresses it, exactly as before.
+    // EVERY DECISION APPLY EXECUTES IS ON SCREEN, even when its candidates
+    // moved after it was chosen: reported with its answer, not open, and
+    // `ambiguous: false` so the row never claims a match that is gone. The
+    // effects are written out by hand, not read back from the plan.
+    const sourced = (key: string) => ({ archiveId: 'setar-classes', pieceKey: key });
+    // Items: ONE exact-title candidate, answered, then renamed (a sync pull).
+    const single = baseDB({ items: [sameTitle] });
+    const renamed = { ...single, items: [{ ...sameTitle, title: 'عراقِ من' }] };
+    const pieceAnswers = [answers[0], answers[1], answers[2]].map((d) => (d.kind === 'link-item' ? { ...d, itemId: 'mine-araq' } : d));
+    for (const d of pieceAnswers) {
+      const before = planArchiveImport({ db: single, index: INDEX, instrumentId: SETAR, decisions: [d], now: NOW });
+      expect(before.answered.map((q) => [q.answer, q.ambiguous]), d.kind).toEqual([[d, true]]);
+      const p = planArchiveImport({ db: renamed, index: INDEX, instrumentId: SETAR, decisions: [d], now: NOW });
+      expect(p.questions.some((q) => q.pieceKey === 'عراق'), d.kind).toBe(false);
+      expect(p.staleDecisions, d.kind).toEqual([]);
+      expect(p.answered, d.kind).toEqual([
+        {
+          kind: 'item',
+          pieceKey: 'عراق',
+          label: 'عراق',
+          candidates: d.kind === 'link-item' ? [{ id: 'mine-araq', title: 'عراقِ من', why: 'Your chosen link; it no longer matches.' }] : [],
+          answer: d,
+          ambiguous: false,
+        },
+      ]);
+      expect(p.adoptedItems.map((i) => [i.id, i.title, i.source]), d.kind).toEqual(
+        d.kind === 'link-item' ? [['mine-araq', 'عراقِ من', sourced('عراق')]] : [],
+      );
+      expect(p.newItems.filter((i) => i.source?.pieceKey === 'عراق').length, d.kind).toBe(d.kind === 'create-item' ? 1 : 0);
+      expect(p.source.suppressions.some((x) => x.kind === 'piece' && x.ref === 'عراق'), d.kind).toBe(d.kind === 'skip-item');
+    }
+    // CLEARED there (no decision): nothing to ask, nothing reported, and the
+    // unasked default — the piece is added as new.
+    const clearedPiece = planArchiveImport({ db: renamed, index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
+    expect([clearedPiece.questions, clearedPiece.answered].map((qs) => qs.some((q) => q.pieceKey === 'عراق'))).toEqual([false, false]);
+    expect(clearedPiece.newItems.filter((i) => i.source?.pieceKey === 'عراق').length).toBe(1);
+    expect(clearedPiece.adoptedItems).toEqual([]);
+    // Classes: TWO indistinguishable candidates, answered, then one or both
+    // stop matching (a number corrected elsewhere).
+    const renumber = (ids: string[]) => ({ ...db, lessons: db.lessons.map((l) => (ids.includes(l.id) ? { ...l, number: 99 } : l)) });
+    const linkFirst = { kind: 'link-lesson', sessionN: 13, lessonId: 'legacy-13' } as const;
+    for (const moved of [['legacy-13-twin'], ['legacy-13', 'legacy-13-twin']]) {
+      const left = ['legacy-13', 'legacy-13-twin'].filter((id) => !moved.includes(id));
+      for (const d of [linkFirst, answers[4], answers[5]]) {
+        const label = `${d.kind} with ${left.length} left`;
+        const p = planArchiveImport({ db: renumber(moved), index: INDEX, instrumentId: SETAR, decisions: [d], now: NOW });
+        expect(p.questions.some((q) => q.sessionN === 13), label).toBe(false);
+        expect(p.staleDecisions, label).toEqual([]);
+        const shown = p.answered.find((q) => q.sessionN === 13)!;
+        expect([shown.answer, shown.ambiguous, shown.label], label).toEqual([d, false, askedClass.label]);
+        const offered = d.kind === 'link-lesson' && !left.includes('legacy-13') ? [...left, 'legacy-13'] : left;
+        expect(shown.candidates.map((c) => c.id), label).toEqual(offered);
+        const adopted = p.adoptedLessons.filter((l) => l.source?.sessionN === 13).map((l) => l.id);
+        expect(adopted, label).toEqual(d.kind === 'link-lesson' ? ['legacy-13'] : []);
+        expect(p.newLessons.filter((l) => l.source?.sessionN === 13).length, label).toBe(d.kind === 'create-lesson' ? 1 : 0);
+        expect(p.source.suppressions.some((x) => x.kind === 'session' && x.ref === '13'), label).toBe(d.kind === 'skip-lesson');
+      }
+      // CLEARED there: the unasked default — the one class still matching is
+      // adopted, or with none a new class is added.
+      const cleared = planArchiveImport({ db: renumber(moved), index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
+      expect([cleared.questions, cleared.answered].map((qs) => qs.some((q) => q.sessionN === 13))).toEqual([false, false]);
+      expect(cleared.adoptedLessons.filter((l) => l.source?.sessionN === 13).map((l) => l.id)).toEqual(left);
+      expect(cleared.newLessons.filter((l) => l.source?.sessionN === 13).length).toBe(left.length ? 0 : 1);
+    }
+
+    // A decision about something never asked is reported too — Apply would
+    // execute it — never as ambiguous: skipping a piece nobody else claims
+    // still suppresses it, exactly as before.
     const unasked = run([{ kind: 'skip-item', pieceKey: 'آشوراوند' }]);
-    expect(unasked.answered).toEqual([]);
+    expect(unasked.answered.map((q) => [q.pieceKey, q.candidates, q.ambiguous])).toEqual([['آشوراوند', [], false]]);
     expect(unasked.source.suppressions.map((s) => s.ref)).toContain('آشوراوند');
   });
 });
diff --git a/src/domain/sourceReconcile.ts b/src/domain/sourceReconcile.ts
index 7b55dcb31c2ea6a864bdc226ba2b1da5f61c1a79..62247163d9ccea9a0e1575f508e4ac40b1d829a1 100644
--- a/src/domain/sourceReconcile.ts
+++ b/src/domain/sourceReconcile.ts
@@ -89,8 +89,14 @@ export interface ReconcileQuestion {
   candidates: ReconcileCandidate[];
 }
 
-/** A question the owner has answered on this preview: still shown, with its answer, until Apply. */
-export type AnsweredQuestion = ReconcileQuestion & { answer: ReconcileDecision };
+/**
+ * A question the owner has answered on this preview: still shown, with its
+ * answer, until Apply. EVERY decision Apply will execute is reported, even
+ * when the candidates moved since it was chosen (a sync renamed one, two
+ * classes became one): `ambiguous` says whether the question would still be
+ * asked, so the screen never claims a match that is no longer there.
+ */
+export type AnsweredQuestion = ReconcileQuestion & { answer: ReconcileDecision; ambiguous: boolean };
 
 /**
  * A registry value that differs, in MEANING, from the owner's own field on an
@@ -606,13 +612,16 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
   const adoptedLessons: Lesson[] = [];
   const questions: ReconcileQuestion[] = [];
   const answered: AnsweredQuestion[] = [];
-  // The question an answer belongs to, reported with it — only where it
-  // would have been asked. Its candidates are always the live ones, plus a
-  // still-valid link target, so the answer is one of the choices on screen.
-  const answer = (q: ReconcileQuestion | undefined, d: ReconcileDecision, target?: ReconcileCandidate) => {
-    if (!q) return;
-    const candidates = target && !q.candidates.some((c) => c.id === target.id) ? [...q.candidates, target] : q.candidates;
-    answered.push({ ...q, candidates, answer: d });
+  // The question an answer belongs to, reported with it whenever the answer
+  // is ACTED ON — never only where it would still be asked, or a decision
+  // whose candidates moved would vanish from the screen while Apply still
+  // executed it. Its candidates are always the live ones, plus a still-valid
+  // link target, so the answer is one of the choices on screen.
+  const answer = (q: ReconcileQuestion, ambiguous: boolean, d: ReconcileDecision, target?: ReconcileCandidate) => {
+    // A link target that no longer matches says so, never the match it lost.
+    const candidates =
+      target && !q.candidates.some((c) => c.id === target.id) ? [...q.candidates, { ...target, why: 'Your chosen link; it no longer matches.' }] : q.candidates;
+    answered.push({ ...q, candidates, answer: d, ambiguous });
   };
 
   for (const session of index.sessions) {
@@ -635,16 +644,14 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       title: `${l.date}${l.number ? ` · class ${l.number}` : ''}`,
       why: 'Same date and number, and it already links to this folder.',
     });
-    const question: ReconcileQuestion | undefined =
-      candidates.length > 1
-        ? { kind: 'lesson', sessionN: session.n, label: `Class ${session.n} · ${session.date}`, candidates: candidates.map(lessonCandidate) }
-        : undefined;
+    const ask: ReconcileQuestion = { kind: 'lesson', sessionN: session.n, label: `Class ${session.n} · ${session.date}`, candidates: candidates.map(lessonCandidate) };
+    const ambiguous = candidates.length > 1;
 
     const skip = decisionFor('skip-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
     if (skip) {
       acted(skip);
       suppress('session', String(session.n));
-      answer(question, skip);
+      answer(ask, ambiguous, skip);
       continue;
     }
 
@@ -656,7 +663,7 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
     if (createSeparately) {
       acted(createSeparately);
       newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
-      answer(question, createSeparately);
+      answer(ask, ambiguous, createSeparately);
       continue;
     }
 
@@ -672,7 +679,7 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       const target = db.lessons.find((l) => l.id === linked.lessonId);
       if (target && !target.source && target.instrumentId === instrumentId) {
         adoptedLessons.push({ ...target, source: { archiveId, sessionN: session.n }, origin: 'archive' });
-        answer(question, linked, lessonCandidate(target));
+        answer(ask, ambiguous, linked, lessonCandidate(target));
         continue;
       }
       staleDecisions.push(linked);
@@ -682,8 +689,8 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       adoptedLessons.push({ ...candidates[0]!, source: { archiveId, sessionN: session.n }, origin: 'archive' });
       continue;
     }
-    if (question) {
-      questions.push(question);
+    if (ambiguous) {
+      questions.push(ask);
       continue;
     }
     newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
@@ -751,15 +758,14 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       why: i.title.trim() === piece.key ? 'Same title as the archive name.' : 'Matches a name this piece used to have.',
     });
     const candidates = db.items.filter((i) => !i.source && i.instrumentId === instrumentId && literals.has(i.title.trim()));
-    const question: ReconcileQuestion | undefined = candidates.length
-      ? { kind: 'item', pieceKey: piece.key, label: piece.key, candidates: candidates.map(itemCandidate) }
-      : undefined;
+    const ask: ReconcileQuestion = { kind: 'item', pieceKey: piece.key, label: piece.key, candidates: candidates.map(itemCandidate) };
+    const ambiguous = candidates.length > 0;
 
     const skipItem = decisionFor('skip-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key);
     if (skipItem) {
       acted(skipItem);
       suppress('piece', piece.key);
-      answer(question, skipItem);
+      answer(ask, ambiguous, skipItem);
       continue;
     }
     const linked = decisionFor('link-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key) as
@@ -770,15 +776,15 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       const target = db.items.find((i) => i.id === linked.itemId);
       if (target && !target.source && target.instrumentId === instrumentId) {
         adoptedItems.push({ ...target, source: { archiveId, pieceKey: piece.key } });
-        answer(question, linked, itemCandidate(target));
+        answer(ask, ambiguous, linked, itemCandidate(target));
         continue;
       }
       staleDecisions.push(linked); // see the lesson branch above
     }
     const createNow = acted(decisionFor('create-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key));
-    if (createNow) answer(question, createNow);
-    else if (question) {
-      questions.push(question);
+    if (createNow) answer(ask, ambiguous, createNow);
+    else if (ambiguous) {
+      questions.push(ask);
       continue;
     }
     newItems.push(itemForPiece(archiveId, instrumentId, piece, now));
diff --git a/tests/fixtures/setar-review-ui.json b/tests/fixtures/setar-review-ui.json
index 3f9c15ecf01168cddd048856c6c1abc603eddcc5..11df70b5bd6dd820aba015113e318615f4aaa3b5 100644
--- a/tests/fixtures/setar-review-ui.json
+++ b/tests/fixtures/setar-review-ui.json
@@ -3,13 +3,20 @@
   "edits": {
     "titles": {
       "src-cecabb9927a83707": "Dashti study no. 1",
-      "src-b31f039e3704d8a4": "Chaharmezrab of Mahur (Saba)"
+      "src-b31f039e3704d8a4": "Chaharmezrab of Mahur (Saba)",
+      "src-1796d49e7a447548": "Daramad 1 of Bayat-e Tork",
+      "src-2a60eb8957048b83": "Daramad 2 of Bayat-e Tork"
     },
+    "placement": {
+      "src-1796d49e7a447548": { "materialId": "mat-radif-borumand" },
+      "src-2a60eb8957048b83": { "stageId": "my-stage" }
+    },
+    "pieceKeys": { "جنگ-شهنازی": "Jang-e Shahnazi" },
     "materials": { "mat-radif-borumand": "Radif روایت برومند" },
     "stages": { "setar-radif-forms": { "code": "Forms", "title": "Composed & improvised" } },
     "persian": {
       "src-d9411fce694a919c": { "composer": "Morad-Khani" },
-      "src-f51b1fd3f6b11be9": { "composer": "Ali-Akbar S. (my teacher)" },
+      "src-f51b1fd3f6b11be9": { "composer": "Ali-Akbar S. (استاد من)" },
       "src-1e53fb5dcf056207": { "form": "Gusheh گوشه" }
     }
   },
@@ -79,6 +86,23 @@
         "dir": "rtl",
         "lines": [["Suggestion:", "answers none"]]
       },
+      {
+        "title": "Daramad 1 of Bayat-e Tork",
+        "dir": "ltr",
+        "lines": [
+          ["Kind:", "composed piece", "→", "gusheh (radif) ·", "درامد"],
+          ["Place:", "not placed", "→", "بیات ترک · آواز بیات ترک"],
+          ["Study source:", "Radif روایت برومند"]
+        ]
+      },
+      {
+        "title": "Daramad 2 of Bayat-e Tork",
+        "dir": "ltr",
+        "lines": [
+          ["Place:", "استاد · ردیف استاد"],
+          ["Study source:", "none", "→", "ردیف میرزا عبدالله"]
+        ]
+      },
       {
         "title": "درامد-ابوعطا-ردیف-میرزاعبدالله",
         "dir": "rtl",
@@ -93,23 +117,27 @@
     "fresh": [
       {
         "piece": "اتود-وزیری",
+        "dir": "rtl",
         "field": "composer",
         "tokens": ["composer — yours:", "وزیری", "· archive:", "ابوالحسن صبا"]
       },
       {
         "piece": "چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله",
+        "dir": "rtl",
         "field": "composer",
         "tokens": ["composer — yours:", "Morad-Khani", "· archive:", "مرادخانی (Moradkhani)"]
       }
     ],
     "standing": [
       {
-        "piece": "جنگ-شهنازی",
+        "piece": "Jang-e Shahnazi",
+        "dir": "ltr",
         "field": "composer",
-        "tokens": ["composer — yours:", "Ali-Akbar S. (my teacher)", "· archive:", "شهنازی"]
+        "tokens": ["composer — yours:", "Ali-Akbar S. (استاد من)", "· archive:", "شهنازی"]
       },
       {
         "piece": "آواز-دشتی-شور",
+        "dir": "rtl",
         "field": "form",
         "tokens": ["form — yours:", "Gusheh گوشه", "· archive:", "گوشه"]
       }
diff --git a/tests/setar-review-ui.browser.test.ts b/tests/setar-review-ui.browser.test.ts
index c421f3054332b54789fd03792978a4bb115652a7..0a60d3eea34bb6bc6699a15c1d1780909c87acf1 100644
--- a/tests/setar-review-ui.browser.test.ts
+++ b/tests/setar-review-ui.browser.test.ts
@@ -31,12 +31,16 @@ import {
 // The family proof for direction (ac-1) lives here and in one committed
 // fixture, tests/fixtures/setar-review-ui.json, whose expected lines were
 // written by hand. Classes crossed: title Farsi / English (the group resolves
-// RTL / LTR, asserted) × values Farsi / English / mixed; setup kind, place,
-// study source, suggestion and class rows in proposed and exception states;
-// archive differences in "Archive metadata differs" and "Review differences";
-// the attention list; phone and desktop; Chromium and WebKit. Limits: class
-// and suggestion rows are only ever exceptions (planSetarSetup proposes
-// neither), and a difference row's title is always the registry's (Farsi) key.
+// RTL / LTR, asserted) × values Farsi / English / mixed, every cell on setup
+// rows and every cell but English × English on difference rows; setup kind, place, study source, suggestion and
+// class rows in proposed and exception states; archive differences in
+// "Archive metadata differs" and "Review differences" (one registry key
+// renamed to English for the English-title cells); the attention list; phone
+// and desktop; Chromium and WebKit. Limits: class and suggestion rows are only
+// ever exceptions (planSetarSetup proposes neither) and their values are
+// always generated English, so they have no Farsi- or mixed-value cell; the
+// "Archive metadata differs" rows keep Farsi keys, the English-key cells are
+// in "Review differences", the same DifferenceRow.
 // ---------------------------------------------------------------------------
 
 const CLOCK = new Date('2026-10-05T09:00:00.000Z');
@@ -44,6 +48,19 @@ const T = CLOCK.toISOString();
 const OWNER_V16: { data: PracticeDB } = JSON.parse(OWNER_V16_TEXT);
 type Db = PracticeDB;
 
+/**
+ * A registry key renamed wherever the archive names it — the graph and the
+ * item's binding — and nowhere else: an item's title is the owner's.
+ */
+const renameKeys = <V,>(v: V, keys: Record<string, string>): V =>
+  typeof v === 'string'
+    ? ((keys[v] ?? v) as V)
+    : Array.isArray(v)
+      ? (v.map((x) => renameKeys(x, keys)) as V)
+      : v && typeof v === 'object'
+        ? (Object.fromEntries(Object.entries(v).map(([k, x]) => [k, renameKeys(x, keys)])) as V)
+        : v;
+
 /** The owner-shaped seed with this fixture's edits. */
 function fixtureDb(): Db {
   const base = validateDB(OWNER_V16);
@@ -51,10 +68,18 @@ function fixtureDb(): Db {
   return {
     ...base,
     attachments: [],
+    archiveSources: renameKeys(base.archiveSources, e.pieceKeys),
     items: base.items.map((i) => {
       const title = (e.titles as Record<string, string>)[i.id];
       const persian = (e.persian as Record<string, Record<string, string>>)[i.id];
-      return { ...i, ...(title ? { title } : {}), ...(persian ? { persian: { ...i.persian, ...persian } } : {}) };
+      const placement = (e.placement as Record<string, { materialId?: string; stageId?: string }>)[i.id];
+      return {
+        ...i,
+        ...(title ? { title } : {}),
+        ...(persian ? { persian: { ...i.persian, ...persian } } : {}),
+        ...placement,
+        ...(i.source ? { source: renameKeys(i.source, e.pieceKeys) } : {}),
+      };
     }),
     materials: base.materials.map((m) => {
       const title = (e.materials as Record<string, string>)[m.id];
@@ -234,14 +259,14 @@ describe('generated lines beside a Farsi title', () => {
             const at = `${where} Archive metadata differs «${d.piece}» ${d.field}`;
             const group = row(d).locator('div[dir="auto"]').first();
             const box = await readsInOrder(group.locator('div.tiny'), d.tokens, at);
-            await startsWithTitle(group, group.locator('strong'), box, 'rtl', at);
+            await startsWithTitle(group, group.locator('strong'), box, d.dir, at);
           }
           await page.getByRole('button', { name: /^Review differences/ }).click();
           for (const d of CASES.differences.standing) {
             const at = `${where} Review differences «${d.piece}» ${d.field}`;
             const group = row(d).locator('div[dir="auto"]').first();
             const box = await readsInOrder(group.locator('div.tiny'), d.tokens, at);
-            await startsWithTitle(group, group.locator('strong'), box, 'rtl', at);
+            await startsWithTitle(group, group.locator('strong'), box, d.dir, at);
           }
           await page.getByRole('button', { name: /^Show \d+ needing attention$/ }).click();
           for (const tokens of CASES.attention) {
@@ -372,7 +397,7 @@ describe('answered archive questions', () => {
           .evaluateAll((bs) => bs.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => [b.textContent, b.classList.contains('selected')]));
       const toDecide = async () => /(\d+) to decide/.exec(await page.getByText(/\d+ to decide/).first().innerText())?.[1];
       try {
-        await connected(app, indexText);
+        const remote = await connected(app, indexText);
         await refreshArchive(app);
         expect(await toDecide(), where).toBe('2');
         expect([await pressed(Q1!), await pressed(Q2!)], where).toEqual([[], []]);
@@ -412,6 +437,34 @@ describe('answered archive questions', () => {
         expect(await toDecide(), where).toBe('1');
         expect(await answers(Q2!).count(), where).toBe(1);
         expect(await answers(Q1!).count(), where).toBe(0);
+
+        // THE MATCH MOVES AFTER THE ANSWER: Q2 skipped, then its only
+        // exact-name candidate is renamed on another device and pulled. The
+        // next preview (Skip pressed again) no longer has a question to ask,
+        // yet Apply would still write the skip — so the row stays, Skip still
+        // selected, saying the matches changed, and can still be switched.
+        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+        const pulled = structuredClone(await db(app)) as Db;
+        pulled.items = pulled.items.map((i) => (i.id === 'it-q2' ? { ...i, title: 'تصنیف-تست (renamed)' } : i));
+        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 99);
+        await page.getByRole('button', { name: 'Sync now' }).click();
+        await until(app, (x) => x.items.find((i) => i.id === 'it-q2')!.title, (t) => t === 'تصنیف-تست (renamed)');
+        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+        await page.getByText('The matches changed since you answered').waitFor({ timeout: 15_000 });
+        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+        expect(await toDecide(), where).toBe('0');
+        await answers(Q2!).getByRole('button', { name: 'Create separately' }).click();
+        expect(await pressed(Q2!), where).toEqual([['Create separately', true]]);
+        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+        // Apply writes the skip on screen: a suppression, and the renamed item untouched.
+        const renamedBefore = (await db(app)).items.find((i) => i.id === 'it-q2');
+        await page.getByRole('button', { name: 'Apply' }).click();
+        await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
+        const skipped = await until(app, (x) => x, (x) => x.archiveSources[0]!.suppressions.some((s) => s.ref === Q2!.key));
+        expect(skipped.items.find((i) => i.id === 'it-q2'), where).toEqual(renamedBefore);
+        expect(skipped.items.filter((i) => i.source?.pieceKey === Q2!.key), where).toEqual([]);
         expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
       } finally {
         await app.close();
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/setar-archive.md`
- `src/components/ArchiveRefresh.tsx`
- `src/domain/sourceReconcile.test.ts`
- `src/domain/sourceReconcile.ts`
- `tests/fixtures/setar-review-ui.json`
- `tests/setar-review-ui.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
bd1eb1c Rework: report every acted-on archive decision; complete the direction matrix

Family archive-answer-visibility-through-repreview. Invariant: whatever
Apply will execute for a Link / Create separately / Skip answer is on
screen, selected, switchable and clearable until Apply, whatever happened
to its candidates since it was chosen. The plan reported an answer only
where the question would still be asked (lessons: >1 candidate, items:
>=1), while every branch still executed it.

Fixed at the one choke point, `answer()` in planArchiveImport: each loop
always builds the question from the live candidates, the threshold gates
only the OPEN list, and every acted-on decision is reported, flagged
`ambiguous: false` when it would no longer be asked. A link target that no
longer matches is offered with an honest "Your chosen link" reason.
Staleness rules are unchanged (deleted / bound / other-instrument links
stay stale and re-open the question).

Consumers, each fixed or checked clean:
- skip-lesson, create-lesson, link-lesson, skip-item, link-item,
  create-item branches: all now report (fixed, one place).
- ArchiveRefresh `asked` merge: renders plan.answered as before; the row's
  sentence now says the matches changed when `ambiguous` is false, as one
  dir="ltr" isolate (ac-2 guard still green). `undecide`: unchanged, clears
  by target.
- store preview/commit and applyArchiveImport: unchanged, effects never
  moved; only reporting did.
- summary.questions / "N to decide": still counts only open questions.
- ReferenceChoices "already answered" and setarSetup.ts reference rows:
  different decisions (catalogue refs), checked clean.

Proof: ac-5 named test adds candidate churn for all six branches (item 1->0
by rename; class 2->1 and 2->0 by renumber) with hand-written effects;
ac-4 named journey renames the only match via a sync pull after Skip, then
re-previews: row stays, Skip selected, switchable, Apply writes the skip.
Both fail on the previous sourceReconcile.
… (truncated)

c92b7a1 Rework: say what clearing a moved archive answer does

Same family as the previous commit (an executed archive decision is
visible). A row kept only because its candidates moved is clearable, but
clearing it does not "write nothing": with no question left, the refresh
takes its unasked default (piece added; a class that alone still matches
adopted, otherwise added). Behaviour unchanged; made explicit:
- ac-5 named test: the no-decision plan for each churned database asserts
  neither questions nor answered list it, and the default effects by hand.
- The row's ambiguous:false sentence names that default (one ltr isolate).
- docs/setar-archive.md and DECISIONS.md qualify "a cleared one writes
  nothing" to questions still open.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Check against the contract

- [ ] **ac-1** — Family proof, one committed fixture (tests/fixtures/setar-review-ui.json) and independently derived expected order: every generated line that embeds values reads label, current value, arrow/separator, new value from the inline-start edge, measured by on-screen geometry (not computed direction), and the arrow points from current to proposed. Classes crossed: title fa/en x values fa/en/mixed; setup fields kind, place, study source, suggestion, class in proposed and exception states; archive differences in Archive metadata differs and Review differences; attention list; 390x844 and desktop; Chromium and WebKit. Fails on the current markup. _(proof: setar review and archive lines read in order beside a farsi title)_
- [ ] **ac-2** — Static guard: inside a dir="auto" group no line renders as a run of sibling dir="ltr"/dir="auto" isolates; a generated line is one inline dir="ltr" isolate with each value nested in its own dir="auto". _(proof: a generated line inside a group is one ltr isolate with its values nested)_
- [ ] **ac-3** — Keep my value / Use archive value: the pressed option looks different from the unpressed one (computed style differs, not colour alone), swaps on click and keyboard, survives a stale re-preview with Keep shown, and Apply writes the archive value only when Use archive value is selected and leaves the owner value otherwise (IndexedDB read back), in Chromium and WebKit. _(proof: archive metadata choices show the selected option and apply exactly it)_
- [ ] **ac-4** — An answered Link / Create separately / Skip question stays listed with its answer visibly selected; switching or clearing it before Apply changes what is written; Apply writes only the final answers; a cleared one writes nothing; "N to decide" counts only open questions. _(proof: answered archive questions stay visible and apply only the final answer)_
- [ ] **ac-5** — Domain: the plan reports each answered question with its answer and excludes it from the open count; a link answer whose target no longer qualifies is stale and the question is open again; no other plan output changes. _(proof: an answered question is reported with its answer and is not counted as open)_
- [ ] **ac-6** — Every aria-pressed control in src/components and src/pages pairs with a visible selected treatment (.option.selected, btn-primary, a tone class or an equivalent recorded in the test ledger). _(proof: every aria-pressed control renders a visible selected state)_
- [ ] **ac-7** — Repertoire search under 20x CPU throttle at ~100 ms per key keeps every character in the box and the URL (fails before the fix); a facet chosen mid-typing loses neither; back/forward, Clear filters, an instrument switch and the Practice list still show the URL query. _(proof: repertoire search keeps every typed character under heavy cpu slowdown)_
- [ ] **ac-8** — Regression guard for c4506c6: the existing browse-context journey, including its throttled query + composer step, still passes unchanged. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-9** — With each destination page module delayed on its first visit (a harness option, no debug hook), the Repertoire journeys reproduce the line-441 shape before the fix and afterwards act only once the page they navigated to is on screen. _(proof: repertoire journeys act only on the page they navigated to)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx
- **work-a-pathway-stage** — touched via src/pages/Repertoire.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **adjust-how-scheduling-works** — shares entity "PracticeItem" with "browse-my-repertoire"
- **capture-a-practice-item** — shares entity "PracticeItem" with "browse-my-repertoire"
- **clear-a-due-review** — shares entity "PracticeItem" with "browse-my-repertoire"
- **log-a-class** — shares entity "PracticeItem" with "browse-my-repertoire"
- **practise-todays-recommendation** — shares entity "PracticeItem" with "browse-my-repertoire"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "browse-my-repertoire"
- **run-a-session-plan** — shares entity "PracticeItem" with "browse-my-repertoire"
- **see-practice-patterns** — shares entity "PracticeItem" with "browse-my-repertoire"

**What the agent reported:**

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## adjust-how-scheduling-works — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## capture-a-practice-item — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## clear-a-due-review — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## log-a-class — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## practise-todays-recommendation — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## prepare-for-the-next-class — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## run-a-session-plan — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.

## see-practice-patterns — unchanged

This change touches no PracticeItem field, scheduling, block, review or lesson logic: only Setar review/archive line markup and choice state, the Repertoire search box's displayed value, and test harness waits.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261007-fix-setar-review-and-archive-direction-a-039e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261007-fix-setar-review-and-archive-direction-a-039e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
