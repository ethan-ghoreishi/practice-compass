---
id: 20261007-fix-setar-review-and-archive-direction-a-039e
contractId: 20261007-fix-setar-review-and-archive-direction-a-039e
patchId: a28ec9dca529b1c6740e6612be757a40f3618220
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-07T15:54:40.428Z
sealedAt: 2026-10-07T16:03:29.967Z
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
- **Diff patch-id:** `a28ec9dca529b1c6740e6612be757a40f3618220`
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

- **archive-cleared-answer-write-semantics** — P2: ac-4 requires a cleared Link/Create separately/Skip answer to write nothing. Clearing after candidates cease to be ambiguous instead enables automatic creation or adoption. The docs and named domain test narrow the guarantee, but the approved contract has no amendment.
  _counterexample:_ In memory using tests/fixtures/setar-archive.json: answer Skip for piece عراق, rename its sole unbound candidate, re-preview, then clear. ArchiveRefresh.undecide (src/components/ArchiveRefresh.tsx:108) removes the decision; planArchiveImport creates one archive-bound item (src/domain/sourceReconcile.ts:795). For class 13 initially having two exact candidates, clearing after correction leaves one candidate and adopts it (line 688), or zero candidates and creates one class (line 696). applyArchiveImport and store preview/commit execute those outputs. Family sweep covers all six item/class answer kinds and three fallback instances, the shared Clear answer handler, planner, writer, store rebase, docs/setar-archive.md:320 and sourceReconcile.test.ts:1991/2017. Checked clean: six answers with stable candidates, clears while ambiguity remains, invalid link refusals with remaining candidates, metadata Keep my value and deselected Setar setup rows. The exact ac-4 browser test clears only with stable candidates; the exact ac-5 domain test explicitly expects these three fallback writes. Either meet ac-4 or obtain an explicit owner contract amendment and matching named proof; explanatory copy alone does not close this.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index dab6873b241a21c7ec500990c497ed0558fcad29..003873f4e928afe2b9a6f2f7eb500c366b91d421 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -33,9 +33,13 @@ Five reports, one heavy lane (contract 20261007-…-039e, issue #47).
   still executed it; every ACTED-ON decision is now reported, flagged
   `ambiguous: false` when it would no longer be asked. Rejected: calling such
   a decision stale — its target still qualifies, and the archive decision
-  semantics (what is stale) were not this lane's to change. So "a cleared
-  answer writes nothing" holds only for a question still open; clearing one
-  that would no longer be asked gets the unasked default, said on its row.
+  semantics (what is stale) were not this lane's to change. Clearing such a
+  row first dropped the decision, so the refresh took its unasked default
+  (added the piece, adopted the one class left) — a write after "a cleared one
+  writes nothing" (ac-4; review). Chosen: Clear sends `clear-item` /
+  `clear-lesson`, which keeps the question open with its live candidates and
+  writes nothing; it can never be stale. Rejected: narrowing the guarantee in
+  copy (the contract was not amended).
 - **A difference row was read, not misapplied** (owner testing). The writes were
   right; "gusheh — yours: — · archive: X" used one dash as separator and empty
   value, and a choice changed no count ("will update 0" either way). Chosen: the
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 40f331593f7a09b62ecd93ce72a6dc7fa6ed61f5..554a2fc3d829e90e80ed1ba0d3de993ef6ace95d 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -317,10 +317,12 @@ applies the lot in one store mutation.
   is listed**, even when its candidates moved after it was chosen (a sync
   renamed the only match, two matching classes became one): it stays selected,
   switchable and clearable, says the matches changed (`ambiguous: false`), and
-  is never silently executed off screen. "A cleared one writes nothing" holds
-  only while the question is still open: cleared there, the refresh does what
-  it does unasked (the piece is added; a class that alone still matches is
-  adopted, otherwise added), and the row says so before it is cleared.
+  is never silently executed off screen. Clearing sends its own decision
+  (`clear-item` / `clear-lesson`), so a cleared question is asked again with
+  its live candidates, whatever they now are, is counted, and writes nothing —
+  never the default a refresh with no answer takes (add the piece, adopt the
+  one class left), which nobody chose. A later refresh, with no clear in hand,
+  decides it as usual.
 - **Every choice shows itself.** Keep my value / Use archive value and each
   answer mark the chosen one with the selected treatment (weight as well as
   colour), not only `aria-pressed`. Keep my value is the default.
diff --git a/src/components/ArchiveRefresh.tsx b/src/components/ArchiveRefresh.tsx
index ebe415b91b5b7eaeb6dc788ea557279791b90440..fbe7fc90b2d668e396bafd614648f11cb27b0a07 100644
--- a/src/components/ArchiveRefresh.tsx
+++ b/src/components/ArchiveRefresh.tsx
@@ -104,13 +104,14 @@ export default function ArchiveRefresh() {
     showPlan(phase.fetched, merged);
   }
 
-  /** Clear a question's answer: it is open again, and Apply writes nothing for it. */
+  /**
+   * Clear a question's answer: it is open again, and Apply writes nothing for
+   * it. The clear is itself sent, never just the answer dropped: with no
+   * decision at all, a question whose candidates moved would take the unasked
+   * default (add the piece, adopt the one class left) that nobody chose.
+   */
   function undecide(q: ReconcileQuestion) {
-    if (phase.kind !== 'preview') return;
-    const probe: ReconcileDecision = q.kind === 'item' ? { kind: 'skip-item', pieceKey: q.pieceKey! } : { kind: 'skip-lesson', sessionN: q.sessionN! };
-    const kept = decisions.filter((d) => !sameTarget(d, probe));
-    setDecisions(kept);
-    showPlan(phase.fetched, kept);
+    decide(q.kind === 'item' ? { kind: 'clear-item', pieceKey: q.pieceKey! } : { kind: 'clear-lesson', sessionN: q.sessionN! });
   }
 
   /** "Keep my value": withdraw the choice; Apply then keeps the owner's field. */
@@ -258,12 +259,8 @@ export default function ArchiveRefresh() {
                     <div className="tiny faint">
                       <span dir="ltr">
                         {'answer' in q && !q.ambiguous
-                          ? `The matches changed since you answered; your answer still applies. Cleared, this refresh does what it does unasked: ${
-                              q.kind === 'item' ? 'the piece is added as new' : 'a class that alone still matches is adopted, otherwise a new class is added'
-                            }.`
-                          : q.kind === 'item'
-                            ? 'An existing piece has this exact name.'
-                            : 'More than one class matches this session.'}
+                          ? 'The matches changed since you answered; your answer still applies until you clear it.'
+                          : askedSentence(q)}
                       </span>
                     </div>
                   </div>
@@ -571,6 +568,16 @@ function Recovery({ source, onRestored }: { source: ArchiveSource; onRestored: (
   );
 }
 
+/**
+ * Why an open question is asked. Only a CLEARED answer leaves one open that
+ * would not be asked unprompted (no exact-name piece, or at most one class).
+ */
+function askedSentence(q: ReconcileQuestion): string {
+  const cleared = 'You cleared your answer, so Apply writes nothing for it; answer it, or a later refresh decides it unasked.';
+  if (q.kind === 'item') return q.candidates.length ? 'An existing piece has this exact name.' : `No existing piece has this name now. ${cleared}`;
+  return q.candidates.length > 1 ? 'More than one class matches this session.' : `${q.candidates.length ? 'One class' : 'No class'} matches this session now. ${cleared}`;
+}
+
 /** The answers a question offers, each with the one decision it sends. */
 function answersFor(q: ReconcileQuestion): { label: string; decision: ReconcileDecision }[] {
   if (q.kind === 'item') {
diff --git a/src/domain/sourceReconcile.test.ts b/src/domain/sourceReconcile.test.ts
index 502efb74a260036a62a18c1936c7a9c8fc67ca0e..4ec343e25366317ce100568d7a19c8a0c7adf742 100644
--- a/src/domain/sourceReconcile.test.ts
+++ b/src/domain/sourceReconcile.test.ts
@@ -1926,6 +1926,14 @@ describe('answered questions, until Apply', () => {
       expect(p.summary.questions, d.kind).toBe(open.questions.length - 1);
       expect(p.staleDecisions, d.kind).toEqual([]);
     }
+    // CLEARED with the candidates unchanged: the plan is exactly the
+    // unanswered one — the question open, counted, nothing written for it.
+    const clears = [
+      { kind: 'clear-item', pieceKey: 'عراق' },
+      { kind: 'clear-lesson', sessionN: 13 },
+    ] as const;
+    for (const d of clears) expect(run([d]), d.kind).toEqual(open);
+
     // Both answered at once: nothing left to decide, both reported in order.
     const both = run([answers[3], answers[0]]);
     expect(both.answered.map((q) => q.answer)).toEqual([answers[3], answers[0]]);
@@ -1988,12 +1996,22 @@ describe('answered questions, until Apply', () => {
       expect(p.newItems.filter((i) => i.source?.pieceKey === 'عراق').length, d.kind).toBe(d.kind === 'create-item' ? 1 : 0);
       expect(p.source.suppressions.some((x) => x.kind === 'piece' && x.ref === 'عراق'), d.kind).toBe(d.kind === 'skip-item');
     }
-    // CLEARED there (no decision): nothing to ask, nothing reported, and the
-    // unasked default — the piece is added as new.
-    const clearedPiece = planArchiveImport({ db: renamed, index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
-    expect([clearedPiece.questions, clearedPiece.answered].map((qs) => qs.some((q) => q.pieceKey === 'عراق'))).toEqual([false, false]);
-    expect(clearedPiece.newItems.filter((i) => i.source?.pieceKey === 'عراق').length).toBe(1);
-    expect(clearedPiece.adoptedItems).toEqual([]);
+    // CLEARED there: the question is OPEN again with its live candidates
+    // (none), counted, and Apply writes NOTHING for it — not the unasked
+    // default, which with no decision at all adds the piece.
+    const unaskedPiece = planArchiveImport({ db: renamed, index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
+    expect(unaskedPiece.newItems.filter((i) => i.source?.pieceKey === 'عراق').length).toBe(1);
+    const clearedPiece = planArchiveImport({ db: renamed, index: INDEX, instrumentId: SETAR, decisions: [clears[0]], now: NOW });
+    expect(clearedPiece.questions.filter((q) => q.pieceKey === 'عراق')).toEqual([{ kind: 'item', pieceKey: 'عراق', label: 'عراق', candidates: [] }]);
+    expect(clearedPiece.summary.questions).toBe(unaskedPiece.summary.questions + 1);
+    expect(clearedPiece.answered.some((q) => q.pieceKey === 'عراق')).toBe(false);
+    expect(clearedPiece.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
+    expect([clearedPiece.adoptedItems, clearedPiece.staleDecisions]).toEqual([[], []]);
+    expect(clearedPiece.source.suppressions.some((x) => x.ref === 'عراق')).toBe(false);
+    // And Apply writes nothing about it, item or suppression.
+    const clearedDb = applyArchiveImport(renamed, clearedPiece, [clears[0]]);
+    expect(clearedDb.items.filter((i) => i.source?.pieceKey === 'عراق' || i.id === 'mine-araq')).toEqual(renamed.items);
+    expect(clearedDb.archiveSources?.[0]?.suppressions.some((x) => x.ref === 'عراق')).toBe(false);
     // Classes: TWO indistinguishable candidates, answered, then one or both
     // stop matching (a number corrected elsewhere).
     const renumber = (ids: string[]) => ({ ...db, lessons: db.lessons.map((l) => (ids.includes(l.id) ? { ...l, number: 99 } : l)) });
@@ -2014,12 +2032,24 @@ describe('answered questions, until Apply', () => {
         expect(p.newLessons.filter((l) => l.source?.sessionN === 13).length, label).toBe(d.kind === 'create-lesson' ? 1 : 0);
         expect(p.source.suppressions.some((x) => x.kind === 'session' && x.ref === '13'), label).toBe(d.kind === 'skip-lesson');
       }
-      // CLEARED there: the unasked default — the one class still matching is
-      // adopted, or with none a new class is added.
-      const cleared = planArchiveImport({ db: renumber(moved), index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
-      expect([cleared.questions, cleared.answered].map((qs) => qs.some((q) => q.sessionN === 13))).toEqual([false, false]);
-      expect(cleared.adoptedLessons.filter((l) => l.source?.sessionN === 13).map((l) => l.id)).toEqual(left);
-      expect(cleared.newLessons.filter((l) => l.source?.sessionN === 13).length).toBe(left.length ? 0 : 1);
+      // CLEARED there: OPEN again with the live candidates, and NOTHING
+      // written — not the unasked default, which with no decision at all
+      // adopts the one class still matching, or with none adds a class.
+      const unasked = planArchiveImport({ db: renumber(moved), index: INDEX, instrumentId: SETAR, decisions: [], now: NOW });
+      expect(unasked.adoptedLessons.filter((l) => l.source?.sessionN === 13).map((l) => l.id)).toEqual(left);
+      expect(unasked.newLessons.filter((l) => l.source?.sessionN === 13).length).toBe(left.length ? 0 : 1);
+      const cleared = planArchiveImport({ db: renumber(moved), index: INDEX, instrumentId: SETAR, decisions: [clears[1]], now: NOW });
+      const reopened = cleared.questions.filter((q) => q.sessionN === 13);
+      expect(reopened.map((q) => [q.label, q.candidates.map((c) => c.id)])).toEqual([[askedClass.label, left]]);
+      expect(cleared.summary.questions).toBe(unasked.summary.questions + 1);
+      expect(cleared.answered.some((q) => q.sessionN === 13)).toBe(false);
+      expect(cleared.adoptedLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
+      expect(cleared.newLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
+      expect(cleared.staleDecisions).toEqual([]);
+      expect(cleared.source.suppressions.some((x) => x.ref === '13')).toBe(false);
+      const written = applyArchiveImport(renumber(moved), cleared, [clears[1]]);
+      expect(written.lessons.filter((l) => l.source?.sessionN === 13)).toEqual([]);
+      expect(written.lessons.filter((l) => !l.source)).toEqual(renumber(moved).lessons);
     }
 
     // A decision about something never asked is reported too — Apply would
@@ -2028,5 +2058,16 @@ describe('answered questions, until Apply', () => {
     const unasked = run([{ kind: 'skip-item', pieceKey: 'آشوراوند' }]);
     expect(unasked.answered.map((q) => [q.pieceKey, q.candidates, q.ambiguous])).toEqual([['آشوراوند', [], false]]);
     expect(unasked.source.suppressions.map((s) => s.ref)).toContain('آشوراوند');
+    // Cleared, it is asked with no candidates and writes nothing — neither the
+    // suppression nor the piece the unasked refresh would add.
+    const clearedUnasked = run([{ kind: 'clear-item', pieceKey: 'آشوراوند' }]);
+    expect(clearedUnasked.questions.filter((q) => q.pieceKey === 'آشوراوند').map((q) => q.candidates)).toEqual([[]]);
+    expect(clearedUnasked.newItems.some((i) => i.source?.pieceKey === 'آشوراوند')).toBe(false);
+    expect(clearedUnasked.source.suppressions.some((s) => s.ref === 'آشوراوند')).toBe(false);
+    // A clear about a question already settled (bound, suppressed) is never
+    // stale: it asks nothing to be written.
+    const skipped = applyArchiveImport(db, unasked, [{ kind: 'skip-item', pieceKey: 'آشوراوند' }]);
+    const afterSkip = planArchiveImport({ db: skipped, index: INDEX, instrumentId: SETAR, decisions: [{ kind: 'clear-item', pieceKey: 'آشوراوند' }], now: NOW });
+    expect([afterSkip.staleDecisions, afterSkip.questions.some((q) => q.pieceKey === 'آشوراوند')]).toEqual([[], false]);
   });
 });
diff --git a/src/domain/sourceReconcile.ts b/src/domain/sourceReconcile.ts
index b72278c1f5f2737e0009da2310177327e008bee0..aad792b4a7e0d4dd798911a8526d527f0b22fc8a 100644
--- a/src/domain/sourceReconcile.ts
+++ b/src/domain/sourceReconcile.ts
@@ -46,6 +46,14 @@ export type ReconcileDecision =
   | { kind: 'link-lesson'; sessionN: number; lessonId: ID }
   | { kind: 'create-lesson'; sessionN: number }
   | { kind: 'skip-lesson'; sessionN: number }
+  /**
+   * A CLEARED ANSWER: the owner withdrew it. The question stays asked, with
+   * its live candidates, whatever they now are, and Apply writes nothing for
+   * it — never the default an unasked refresh would take (add the piece, adopt
+   * a class that alone matches), which nobody chose.
+   */
+  | { kind: 'clear-item'; pieceKey: string }
+  | { kind: 'clear-lesson'; sessionN: number }
   /**
    * A REGISTRY VALUE THE OWNER CHOSE TO TAKE — bound to the RECORD it was shown
    * against (`itemId`), the owner's value it was chosen over, TYPED (`from`: a
@@ -238,7 +246,7 @@ export interface ImportPlan {
   repairedLessons: Lesson[];
   /** Existing items adopted by an explicit owner decision. */
   adoptedItems: PracticeItem[];
-  /** The OPEN questions — what "N to decide" counts. */
+  /** The OPEN questions — what "N to decide" counts — a cleared answer's among them, whatever its candidates now are. */
   questions: ReconcileQuestion[];
   /**
    * The questions this preview's decisions answer, each with its answer, so
@@ -647,6 +655,10 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
     const ask: ReconcileQuestion = { kind: 'lesson', sessionN: session.n, label: `Class ${session.n} · ${session.date}`, candidates: candidates.map(lessonCandidate) };
     const ambiguous = candidates.length > 1;
 
+    if (acted(decisionFor('clear-lesson', (d) => 'sessionN' in d && d.sessionN === session.n))) {
+      questions.push(ask);
+      continue;
+    }
     const skip = decisionFor('skip-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
     if (skip) {
       acted(skip);
@@ -766,6 +778,10 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
     const ask: ReconcileQuestion = { kind: 'item', pieceKey: piece.key, label: piece.key, candidates: candidates.map(itemCandidate) };
     const ambiguous = candidates.length > 0;
 
+    if (acted(decisionFor('clear-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key))) {
+      questions.push(ask);
+      continue;
+    }
     const skipItem = decisionFor('skip-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key);
     if (skipItem) {
       acted(skipItem);
@@ -886,6 +902,11 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
   // it the same decision would go stale for ever.
   const realised = (d: ReconcileDecision): boolean => {
     switch (d.kind) {
+      // A clear writes nothing, so there is nothing for it to go stale on: a
+      // question that has since been bound or suppressed simply is not asked.
+      case 'clear-item':
+      case 'clear-lesson':
+        return true;
       case 'skip-item':
         return isSuppressed('piece', d.pieceKey);
       case 'skip-lesson':
diff --git a/tests/setar-review-ui.browser.test.ts b/tests/setar-review-ui.browser.test.ts
index 3904a1b6cf59fe4faac232118570ab2d3e34a3ba..223a58521281b3459ffc74af6c12f3ceb8d2fb80 100644
--- a/tests/setar-review-ui.browser.test.ts
+++ b/tests/setar-review-ui.browser.test.ts
@@ -447,21 +447,53 @@ describe('answered archive questions', () => {
         // next preview (Skip pressed again) no longer has a question to ask,
         // yet Apply would still write the skip — so the row stays, Skip still
         // selected, saying the matches changed, and can still be switched.
-        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
-        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
-        const pulled = structuredClone(await db(app)) as Db;
-        pulled.items = pulled.items.map((i) => (i.id === 'it-q2' ? { ...i, title: 'تصنیف-تست (renamed)' } : i));
-        publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 99);
-        await page.getByRole('button', { name: 'Sync now' }).click();
-        await until(app, (x) => x.items.find((i) => i.id === 'it-q2')!.title, (t) => t === 'تصنیف-تست (renamed)');
-        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
-        await page.getByText('The matches changed since you answered').waitFor({ timeout: 15_000 });
-        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
-        expect(await toDecide(), where).toBe('0');
-        await answers(Q2!).getByRole('button', { name: 'Create separately' }).click();
-        expect(await pressed(Q2!), where).toEqual([['Create separately', true]]);
-        await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
-        expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+        // Q2's one exact-name candidate retitled on the other device and pulled.
+        let pulls = 99;
+        const retitle = async (title: string) => {
+          const pulled = structuredClone(await db(app)) as Db;
+          pulled.items = pulled.items.map((i) => (i.id === 'it-q2' ? { ...i, title } : i));
+          publishRemote(remote, remoteStateText(pulled), await hashState(pulled), pulls++);
+          await page.getByRole('button', { name: 'Sync now' }).click();
+          await until(app, (x) => x.items.find((i) => i.id === 'it-q2')!.title, (t) => t === title);
+        };
+        const answeredThenMoved = async () => {
+          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+          await retitle('تصنیف-تست (renamed)');
+          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+          await page.getByText('The matches changed since you answered').waitFor({ timeout: 15_000 });
+          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+          expect(await toDecide(), where).toBe('0');
+          await answers(Q2!).getByRole('button', { name: 'Create separately' }).click();
+          expect(await pressed(Q2!), where).toEqual([['Create separately', true]]);
+          await answers(Q2!).getByRole('button', { name: 'Skip' }).click();
+          expect(await pressed(Q2!), where).toEqual([['Skip', true]]);
+        };
+        await answeredThenMoved();
+
+        // CLEARED after the match moved: open again with no candidate, counted,
+        // nothing selected — and Apply writes NOTHING for it, not the unasked
+        // default (adding the piece) that a refresh with no answer would take.
+        await answers(Q2!).getByRole('button', { name: 'Clear answer' }).click();
+        await page.getByText(/No existing piece has this name now\. You cleared your answer, so Apply writes nothing for it/).waitFor({ timeout: 15_000 });
+        expect(await pressed(Q2!), where).toEqual([]);
+        expect(await answers(Q2!).getByRole('button').allInnerTexts(), where).toEqual(['Create separately', 'Skip']);
+        expect(await toDecide(), where).toBe('1');
+        const clearedBefore = await db(app);
+        await page.getByRole('button', { name: 'Apply' }).click();
+        await page.getByText('Already current.', { exact: true }).waitFor({ timeout: 30_000 });
+        const clearedAfter = await db(app);
+        expect(clearedAfter.items, where).toEqual(clearedBefore.items);
+        expect(clearedAfter.archiveSources, where).toEqual(clearedBefore.archiveSources);
+        expect(clearedAfter.items.filter((i) => i.source?.pieceKey === Q2!.key), where).toEqual([]);
+        expect(clearedAfter.archiveSources[0]!.suppressions.some((s) => s.ref === Q2!.key), where).toBe(false);
+
+        // The match comes back, so Q2 is asked again; answered, moved, KEPT.
+        await retitle('تصنیف-تست');
+        await reload(app);
+        await refreshArchive(app);
+        expect(await answers(Q2!).count(), where).toBe(1);
+        await answeredThenMoved();
         // Apply writes the skip on screen: a suppression, and the renamed item untouched.
         const renamedBefore = (await db(app)).items.find((i) => i.id === 'it-q2');
         await page.getByRole('button', { name: 'Apply' }).click();
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/setar-archive.md`
- `src/components/ArchiveRefresh.tsx`
- `src/domain/sourceReconcile.test.ts`
- `src/domain/sourceReconcile.ts`
- `tests/setar-review-ui.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
b381e95 Rework: a cleared archive answer writes nothing, whatever its candidates did

Family: archive cleared-answer write semantics (ac-4, unamended).
Invariant: once the owner clears a Link / Create separately / Skip answer,
Apply writes nothing for that question — no item, class, adoption or
suppression — even when its candidates moved during re-preview.

Root cause: Clear dropped the decision, so a question whose candidates had
moved (no exact-name piece left; one or no class left) fell through to the
planner's unasked default and wrote it. Fixed at the choke point both
preview and commit share: Clear now sends its own decision (clear-item /
clear-lesson), which planArchiveImport checks before every answer branch,
keeping the question OPEN with its live candidates (counted in "N to
decide") and writing nothing. A clear asks for no write, so it is never
stale (realised sweep).

Consumers enumerated:
- All six answer kinds (link/create/skip x item/lesson): fixed — one clear
  decision replaces whichever answer (sameTarget keys piece/session), and
  the planner checks it first in both loops.
- The three fallback writes (item add; sole-class adopt; class add): fixed,
  each asserted absent in the ac-5 domain test next to the no-decision
  default for contrast.
- ArchiveRefresh undecide (shared Clear handler): fixed; the stale-retry
  path keeps clears (never stale); startRefresh resets them.
- Store preview/commit and the rebase check: checked clean — they pass
  decisions through, and a cleared question is an open one like any other.
- applyArchiveImport: checked clean — reads only plan outputs and
  apply-field decisions.
- Row copy: the moved-answer row no longer promises the default; a cleared
  question with no ambiguity says Apply writes nothing for it.
- docs/setar-archive.md and DECISIONS.md: the narrowed guarantee removed.
- Checked clean: stale link refusal (not a clear), metadata Keep my value,
  Setar setup deselected rows.

Proof: sourceReconcile.test "
… (truncated)
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
