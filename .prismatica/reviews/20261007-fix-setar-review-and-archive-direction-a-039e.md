---
id: 20261007-fix-setar-review-and-archive-direction-a-039e
contractId: 20261007-fix-setar-review-and-archive-direction-a-039e
patchId: 0f71be02e9d02bd9564c8cd997f8525f4a2059b9
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: archive-cleared-answer-write-semantics
    summary: "P2: ac-4 requires a cleared Link/Create separately/Skip answer to
      write nothing. Clearing after candidates cease to be ambiguous instead
      enables automatic creation or adoption. The docs and named domain test
      narrow the guarantee, but the approved contract has no amendment."
    counterexample: "In memory using tests/fixtures/setar-archive.json: answer Skip
      for piece عراق, rename its sole unbound candidate, re-preview, then clear.
      ArchiveRefresh.undecide (src/components/ArchiveRefresh.tsx:108) removes
      the decision; planArchiveImport creates one archive-bound item
      (src/domain/sourceReconcile.ts:795). For class 13 initially having two
      exact candidates, clearing after correction leaves one candidate and
      adopts it (line 688), or zero candidates and creates one class (line 696).
      applyArchiveImport and store preview/commit execute those outputs. Family
      sweep covers all six item/class answer kinds and three fallback instances,
      the shared Clear answer handler, planner, writer, store rebase,
      docs/setar-archive.md:320 and sourceReconcile.test.ts:1991/2017. Checked
      clean: six answers with stable candidates, clears while ambiguity remains,
      invalid link refusals with remaining candidates, metadata Keep my value
      and deselected Setar setup rows. The exact ac-4 browser test clears only
      with stable candidates; the exact ac-5 domain test explicitly expects
      these three fallback writes. Either meet ac-4 or obtain an explicit owner
      contract amendment and matching named proof; explanatory copy alone does
      not close this."
createdAt: 2026-10-07T15:21:47.354Z
sealedAt: 2026-10-07T15:35:38.824Z
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
- **Diff patch-id:** `0f71be02e9d02bd9564c8cd997f8525f4a2059b9`
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

_none recorded_

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index b26cdd4cad0f1bb672851f5f4fb7a8546d304824..dab6873b241a21c7ec500990c497ed0558fcad29 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -36,6 +36,26 @@ Five reports, one heavy lane (contract 20261007-…-039e, issue #47).
   semantics (what is stale) were not this lane's to change. So "a cleared
   answer writes nothing" holds only for a question still open; clearing one
   that would no longer be asked gets the unasked default, said on its row.
+- **A difference row was read, not misapplied** (owner testing). The writes were
+  right; "gusheh — yours: — · archive: X" used one dash as separator and empty
+  value, and a choice changed no count ("will update 0" either way). Chosen: the
+  setup review's grammar ("Field: none → X", item-form field names), intros
+  saying Apply writes only rows set to Use archive value, the summary saying
+  "will set N fields to the archive's value" before Apply and "set" after
+  (component-side, by `decisionMatchesSuggestion`; a zero "update" count gives
+  way beside it), and the rows start-aligned like the rest of the section
+  (`.list-row` had centred them). Rejected: relabelling the buttons (the
+  contract names Keep my value).
+- **A gusheh name is offered only to a gusheh.** Every one of the owner's
+  standing differences was a legacy درامد/چهارپاره item, imported as a composed
+  piece, offered the registry's gusheh name. Taken, it left a composed piece
+  with a name the item form hides ("Gusheh (radif only)") and cannot clear. The
+  registry derives that name from its kind reading, and the kind is Review Setar
+  setup's question, which writes kind and name together (each of those items
+  has that row). So the plan offers `gusheh` only where the item IS a gusheh,
+  standing or fresh; other fields are offered as before, and nothing already
+  written is touched. Rejected: Use archive value also changing the kind (a
+  second door to setup's decision) or showing the field on composed pieces.
 - **Repertoire search was a real, rare defect.** The box showed the URL's query;
   the router renders a URL change in a transition, and while one is pending React
   restores a controlled input to its last rendered value — "pishdaramad" became
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index ae7a970acf4ebbbf82777794cf6e8b8fb7c15276..40f331593f7a09b62ecd93ce72a6dc7fa6ed61f5 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -324,8 +324,9 @@ applies the lot in one store mutation.
 - **Every choice shows itself.** Keep my value / Use archive value and each
   answer mark the chosen one with the selected treatment (weight as well as
   colour), not only `aria-pressed`. Keep my value is the default.
-- **Lines read in order beside a Farsi name.** A difference ("composer — yours:
-  X · archive: Y"), a Review Setar setup change ("Kind: before → after") and an
+- **Lines read in order beside a Farsi name.** A difference ("Composer /
+  maestro: yours → archive's", an empty value said as "none"), a Review Setar
+  setup change ("Kind: before → after") and an
   attention line ("path — reason") are each one left-to-right line with every
   value in its own direction inside it, so the arrow always points from what you
   have to what is proposed.
@@ -439,7 +440,11 @@ piece's `dastgah`, `form`, `composer` and gusheh name. Under **Archive metadata
 differs**, a registry value is offered only when the registry CHANGED that field
 since the graph this device last accepted — never because it merely differs from
 yours. Each offer is "Keep my value" (the default) or "Use archive value"; Apply
-accepts the archive's facts and keeps every value you did not choose. Accepting
+accepts the archive's facts and keeps every value you did not choose. Choosing
+writes nothing by itself: the summary counts the fields Apply will take from the
+archive ("will set N fields to the archive's value") and, once applied, says so.
+A gusheh name is offered only to an item that is a gusheh: on any other kind it
+is a kind question, which **Review Setar setup** settles with the name. Accepting
 the graph settles the offer, through a reload, a sync and a reinstall alike, with
 no separate ledger of answers. Differences you already live with stay out of the
 way until you open **Review differences**, where the same two choices apply.
diff --git a/src/components/ArchiveRefresh.tsx b/src/components/ArchiveRefresh.tsx
index 63a5bacc2d8696bf2fd938907576b824880e9a2a..ebe415b91b5b7eaeb6dc788ea557279791b90440 100644
--- a/src/components/ArchiveRefresh.tsx
+++ b/src/components/ArchiveRefresh.tsx
@@ -43,7 +43,7 @@ type Phase =
   | { kind: 'idle' }
   | { kind: 'working' }
   | { kind: 'error'; message: string }
-  | { kind: 'done'; message: string; plan?: ImportPlan; commitSha?: string }
+  | { kind: 'done'; message: string; plan?: ImportPlan; commitSha?: string; fromArchive: number }
   | { kind: 'preview'; fetched: FetchedIndex; rev: number; plan: ImportPlan; notice?: string };
 
 export default function ArchiveRefresh() {
@@ -151,7 +151,7 @@ export default function ArchiveRefresh() {
       setPhase({ kind: 'error', message: result.message });
       return;
     }
-    setPhase({ kind: 'done', message: result.message, plan: phase.plan, commitSha: fetched.commitSha });
+    setPhase({ kind: 'done', message: result.message, plan: phase.plan, commitSha: fetched.commitSha, fromArchive });
   }
 
   // A restore changes what a preview on screen was decided against: look again.
@@ -161,6 +161,9 @@ export default function ArchiveRefresh() {
 
   const plan = phase.kind === 'preview' ? phase.plan : undefined;
   const standing = plan ? plan.differences.filter((d) => !d.fresh) : [];
+  // What Apply will write from the difference rows: the plan's own matching
+  // rule, so a choice is seen to count the moment it is made.
+  const fromArchive = plan ? decisions.filter((d) => plan.differences.some((x) => decisionMatchesSuggestion(d, x))).length : 0;
   // Open and answered questions together, in the index's own order, so
   // answering one never moves it: it stays where it was, its answer shown.
   const asked: (ReconcileQuestion | AnsweredQuestion)[] = [];
@@ -229,7 +232,7 @@ export default function ArchiveRefresh() {
       {phase.kind === 'done' && (
         <div className="tiny" aria-live="polite" style={{ textAlign: 'start' }}>
           <span dir="ltr">{phase.message}</span>
-          {phase.plan && <Summary plan={phase.plan} done commitSha={phase.commitSha} />}
+          {phase.plan && <Summary plan={phase.plan} done commitSha={phase.commitSha} fromArchive={phase.fromArchive} />}
         </div>
       )}
 
@@ -240,13 +243,13 @@ export default function ArchiveRefresh() {
       )}
       {phase.kind === 'preview' && plan && (
         <div className="stack-sm">
-          <Summary plan={plan} commitSha={phase.fetched.commitSha} />
+          <Summary plan={plan} commitSha={phase.fetched.commitSha} fromArchive={fromArchive} />
 
           {asked.length > 0 && (
             <div className="stack-sm">
               <div className="section-label">Needs a decision</div>
               {asked.map((q) => (
-                <div key={`${q.kind}-${q.pieceKey ?? q.sessionN}`} className="list-row stack-sm">
+                <div key={`${q.kind}-${q.pieceKey ?? q.sessionN}`} className="list-row stack-sm" style={ROW}>
                   {/* The GROUP is the name and the sentence that belongs to it;
                       the fixed English buttons below sit OUTSIDE it, so a Farsi
                       piece name cannot claim their bidi base. */}
@@ -298,8 +301,8 @@ export default function ArchiveRefresh() {
               <div className="section-label">Archive metadata differs</div>
               <p className="tiny faint" style={{ textAlign: 'start', margin: 0 }}>
                 <span dir="ltr">
-                  The registry changed these since this device last accepted the archive. Your value stays unless you
-                  choose the archive’s.
+                  The registry changed these since this device last accepted the archive. Each line reads your value →
+                  the archive’s. Apply changes only the ones set to Use archive value.
                 </span>
               </p>
               {plan.suggestions.map((sg) => (
@@ -323,8 +326,8 @@ export default function ArchiveRefresh() {
                 <>
                   <p className="tiny faint" style={{ textAlign: 'start', margin: 0 }}>
                     <span dir="ltr">
-                      Values you already have that differ from the registry, which has not changed them. Nothing here
-                      changes unless you choose it.
+                      Fields of your pieces that differ from the registry, which has not changed them. Each line reads
+                      your value → the archive’s. Apply changes only the ones set to Use archive value.
                     </span>
                   </p>
                   {standing.map((sg) => (
@@ -374,14 +377,16 @@ function DifferenceRow({
   // has since edited is no longer this difference's answer.
   const used = decisions.some((d) => decisionMatchesSuggestion(d, sg));
   return (
-    <div className="list-row stack-sm">
+    <div className="list-row stack-sm" style={ROW}>
       <div dir="auto" style={{ textAlign: 'start' }}>
         <strong>{sg.pieceKey}</strong>
         {/* ONE line, ONE isolate, each value nested in its own: as sibling
-            isolates beside a Farsi key the line ran right to left. */}
+            isolates beside a Farsi key the line ran right to left. The same
+            grammar as Review Setar setup — field: yours → archive's — with an
+            empty value said as "none", never a dash beside the separators. */}
         <div className="tiny faint">
           <span dir="ltr">
-            {FIELD_LABELS[sg.field]} — yours: <span dir="auto">{sg.from || '—'}</span> · archive: <span dir="auto">{sg.to}</span>
+            {FIELD_NAMES[sg.field]}: {sg.from ? <span dir="auto">{sg.from}</span> : 'none'} → <span dir="auto">{sg.to}</span>
             {sg.provisional ? ' · the registry marks this identity provisional' : null}
           </span>
         </div>
@@ -398,9 +403,13 @@ function DifferenceRow({
   );
 }
 
-function Summary({ plan, done = false, commitSha }: { plan: ImportPlan; done?: boolean; commitSha?: string }) {
+function Summary({ plan, done = false, commitSha, fromArchive }: { plan: ImportPlan; done?: boolean; commitSha?: string; fromArchive: number }) {
   const s = plan.summary;
   const [open, setOpen] = useState(false);
+  // The fields chosen from the archive are said as what Apply sets; "update 0"
+  // beside them read as a contradiction, so a zero update count gives way.
+  const updated = s.updatedLessons || !fromArchive ? ` · ${done ? 'Updated' : 'will update'} ${s.updatedLessons}` : '';
+  const used = fromArchive ? ` · ${done ? 'set' : 'will set'} ${fromArchive} field${fromArchive === 1 ? '' : 's'} to the archive’s value` : '';
   const counts = [
     `${s.questions} to decide`,
     s.metadata ? `${s.metadata} archive change${s.metadata === 1 ? '' : 's'} to look at` : null,
@@ -413,7 +422,7 @@ function Summary({ plan, done = false, commitSha }: { plan: ImportPlan; done?: b
         <span dir="ltr">
           {s.unchanged
             ? `Already current. ${counts.slice(1).join(' · ')}`
-            : `${done ? 'Added' : 'Will add'} ${s.addedItems} pieces and ${s.addedLessons} classes · ${done ? 'Updated' : 'will update'} ${s.updatedLessons} · ${counts.join(' · ')}`}
+            : `${done ? 'Added' : 'Will add'} ${s.addedItems} pieces and ${s.addedLessons} classes${updated}${used} · ${counts.join(' · ')}`}
         </span>
       </div>
       <div className="tiny faint" style={{ textAlign: 'start' }}>
@@ -598,10 +607,21 @@ function sameTarget(a: ReconcileDecision, b: ReconcileDecision): boolean {
 
 const LINK_BTN = { background: 'none', border: 'none', padding: 0 } as const;
 
-/** Plain names for the registry fields an improvement can touch. */
+/** Plain names for the registry fields an improvement can touch (the choice group's accessible name). */
 const FIELD_LABELS: Record<MetadataField, string> = {
   dastgahAvaz: 'dastgāh',
   gusheh: 'gusheh',
   form: 'form',
   composer: 'composer',
 };
+
+/** A stacked row starts where the section does: `.list-row` centres its children, which floated each one mid-page. */
+const ROW = { alignItems: 'flex-start' } as const;
+
+/** The same fields as the item form names them, for the difference line the owner reads. */
+const FIELD_NAMES: Record<MetadataField, string> = {
+  dastgahAvaz: 'Dastgāh / Āvāz',
+  gusheh: 'Gusheh',
+  form: 'Form',
+  composer: 'Composer / maestro',
+};
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index 40458312657305e643fdbf0522704839d67b945e..a8b60fca063234ba9ef3f207bee26c82c7cfcf63 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -667,7 +667,7 @@ const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="auto">{b.nextAction}</span>' },
   // A registry improvement offered on Refresh: the value the owner has and the
   // value the archive proposes are authored independently of each other.
-  { file: 'components/ArchiveRefresh.tsx', snippet: "<span dir=\"auto\">{sg.from || '—'}</span>" },
+  { file: 'components/ArchiveRefresh.tsx', snippet: "<span dir=\"auto\">{sg.from}</span>" },
   { file: 'components/ArchiveRefresh.tsx', snippet: '<span dir="auto">{sg.to}</span>' },
   // Review Setar setup: each owner-authored before/after value, in its own isolate.
   { file: 'components/SetarSetupReview.tsx', snippet: '<span key={i} dir="auto">' },
@@ -726,7 +726,7 @@ const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
   { file: 'components/SetarSetupReview.tsx', snippet: '<span dir="ltr">\n                      {FIELD[p.field]}: <Value db={db} v={p.before} />' },
   // Refresh Setar archive: a difference line and an attention line, each ONE
   // isolate with its values nested.
-  { file: 'components/ArchiveRefresh.tsx', snippet: "<span dir=\"ltr\">\n            {FIELD_LABELS[sg.field]} — yours: <span dir=\"auto\">{sg.from || '—'}</span> · archive: <span dir=\"auto\">{sg.to}</span>" },
+  { file: 'components/ArchiveRefresh.tsx', snippet: "<span dir=\"ltr\">\n            {FIELD_NAMES[sg.field]}: {sg.from ? <span dir=\"auto\">{sg.from}</span> : 'none'} → <span dir=\"auto\">{sg.to}</span>" },
   { file: 'components/ArchiveRefresh.tsx', snippet: '<span dir="ltr">\n                      <span dir="auto">{d.path}</span> — {d.reason}' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{recs.best.reason}</span>' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{rec.reason}</span>' },
diff --git a/src/domain/sourceReconcile.test.ts b/src/domain/sourceReconcile.test.ts
index 4f89bbfe9a4d2bc2f132a40c82a113ef7665768f..502efb74a260036a62a18c1936c7a9c8fc67ca0e 100644
--- a/src/domain/sourceReconcile.test.ts
+++ b/src/domain/sourceReconcile.test.ts
@@ -1583,6 +1583,29 @@ describe('archive metadata against the accepted baseline', () => {
   const fields = (p: ReturnType<typeof planArchiveImport>, list: 'suggestions' | 'differences') =>
     p[list].map((s) => `${s.pieceKey}:${s.field}`).sort();
 
+  it('a gusheh name is offered only to an item that is a gusheh', () => {
+    const key = 'بسته-نگار-بیات-ترک-ردیف-میرزاعبدالله';
+    const first = run(baseDB(), idx('a'));
+    const kinded = (db: PracticeDB, itemType: PracticeDB['items'][number]['itemType']): PracticeDB => ({
+      ...db,
+      items: db.items.map((i) => (i.source?.pieceKey === key ? { ...i, itemType } : i)),
+    });
+    const emptied = edit(first.next, key, { gusheh: '' });
+    // A gusheh with no name: the registry's is a difference, as for any field.
+    expect(fields(run(emptied, idx('b')).p, 'differences')).toEqual([`${key}:gusheh`]);
+    // The same item as a composed piece — the legacy import's old kind — is
+    // not offered a name its form can neither show nor clear, standing or
+    // fresh; its kind is Review Setar setup's to settle, name included.
+    const piece = kinded(emptied, 'full_piece');
+    expect(run(piece, idx('b')).p.differences).toEqual([]);
+    const renamed = run(piece, idx('c', withPiece(key, { piece: 'بسته-نگار-دوم' })));
+    expect(renamed.p.differences).toEqual([]);
+    expect(renamed.p.summary.metadata).toBe(0);
+    // Its other fields are still offered.
+    const composer = run(piece, idx('d', withPiece(key, { composer: 'صبا' })));
+    expect(fields(composer.p, 'suggestions')).toEqual([`${key}:composer`]);
+  });
+
   it('setar metadata refresh offers only new meaningful source proposals', () => {
     // Two custom composers claim one spelling: «Ambig» is AMBIGUOUS, so it
     // stays the owner's literal text and compares as text.
diff --git a/src/domain/sourceReconcile.ts b/src/domain/sourceReconcile.ts
index 62247163d9ccea9a0e1575f508e4ac40b1d829a1..b72278c1f5f2737e0009da2310177327e008bee0 100644
--- a/src/domain/sourceReconcile.ts
+++ b/src/domain/sourceReconcile.ts
@@ -722,6 +722,11 @@ export function planArchiveImport({ db, index, instrumentId, decisions = [], ver
       // EMPTY.
       const baseline = accepted.get(piece.key);
       for (const field of ['dastgahAvaz', 'gusheh', 'form', 'composer'] as MetadataField[]) {
+        // A gusheh NAME belongs to a gusheh: the registry's comes from its kind
+        // reading, and on an item of another kind it would be a name the item
+        // form neither shows nor can clear. The kind is Review Setar setup's
+        // question, which writes kind and name together.
+        if (field === 'gusheh' && bound.itemType !== 'gusheh') continue;
         const proposed = persianFromPiece(piece)[field] ?? '';
         const current = bound.persian?.[field] ?? null;
         if (!offers(current, proposed, field, vocab)) continue;
diff --git a/tests/fixtures/setar-review-ui.json b/tests/fixtures/setar-review-ui.json
index 11df70b5bd6dd820aba015113e318615f4aaa3b5..b43050e419d2862259a920314a6fd8613cd2baf5 100644
--- a/tests/fixtures/setar-review-ui.json
+++ b/tests/fixtures/setar-review-ui.json
@@ -15,6 +15,7 @@
     "materials": { "mat-radif-borumand": "Radif روایت برومند" },
     "stages": { "setar-radif-forms": { "code": "Forms", "title": "Composed & improvised" } },
     "persian": {
+      "src-cecabb9927a83707": { "composer": "" },
       "src-d9411fce694a919c": { "composer": "Morad-Khani" },
       "src-f51b1fd3f6b11be9": { "composer": "Ali-Akbar S. (استاد من)" },
       "src-1e53fb5dcf056207": { "form": "Gusheh گوشه" }
@@ -119,27 +120,33 @@
         "piece": "اتود-وزیری",
         "dir": "rtl",
         "field": "composer",
-        "tokens": ["composer — yours:", "وزیری", "· archive:", "ابوالحسن صبا"]
+        "tokens": ["Composer / maestro:", "وزیری", "→", "ابوالحسن صبا"]
       },
       {
         "piece": "چهارپاره-مرادخانی-ماهور-ردیف-میرزاعبدالله",
         "dir": "rtl",
         "field": "composer",
-        "tokens": ["composer — yours:", "Morad-Khani", "· archive:", "مرادخانی (Moradkhani)"]
+        "tokens": ["Composer / maestro:", "Morad-Khani", "→", "مرادخانی (Moradkhani)"]
       }
     ],
     "standing": [
+      {
+        "piece": "تمرین-دشتی-1-علیزاده",
+        "dir": "rtl",
+        "field": "composer",
+        "tokens": ["Composer / maestro:", "none", "→", "علیزاده"]
+      },
       {
         "piece": "Jang-e Shahnazi",
         "dir": "ltr",
         "field": "composer",
-        "tokens": ["composer — yours:", "Ali-Akbar S. (استاد من)", "· archive:", "شهنازی"]
+        "tokens": ["Composer / maestro:", "Ali-Akbar S. (استاد من)", "→", "شهنازی"]
       },
       {
         "piece": "آواز-دشتی-شور",
         "dir": "rtl",
         "field": "form",
-        "tokens": ["form — yours:", "Gusheh گوشه", "· archive:", "گوشه"]
+        "tokens": ["Form:", "Gusheh گوشه", "→", "گوشه"]
       }
     ]
   },
diff --git a/tests/setar-review-ui.browser.test.ts b/tests/setar-review-ui.browser.test.ts
index 0a60d3eea34bb6bc6699a15c1d1780909c87acf1..3904a1b6cf59fe4faac232118570ab2d3e34a3ba 100644
--- a/tests/setar-review-ui.browser.test.ts
+++ b/tests/setar-review-ui.browser.test.ts
@@ -332,10 +332,13 @@ describe('archive metadata choices, seen', () => {
         // Click swaps it, and the two looks swap with it.
         await choice(F1!, 'Use archive value').click();
         expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
+        // The choice is SEEN to count before Apply: the summary names it.
+        expect(await page.locator('main').innerText(), where).toMatch(/classes · will set 1 field to the archive’s value · /);
         // The keyboard does the same: Keep (Enter), then Use again (Space).
         await choice(F1!, 'Keep my value').focus();
         await page.keyboard.press('Enter');
         expect(await pressedLook(F1!, 'Keep my value'), where).toEqual(first);
+        expect(await page.locator('main').innerText(), where).not.toMatch(/to the archive’s value/);
         await choice(F1!, 'Use archive value').focus();
         await page.keyboard.press('Space');
         expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
@@ -360,6 +363,7 @@ describe('archive metadata choices, seen', () => {
         expect(await pressedLook(F1!, 'Use archive value'), where).toEqual(first);
         await page.getByRole('button', { name: 'Apply' }).click();
         await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
+        expect(await page.locator('main').innerText(), where).toMatch(/classes · set 1 field to the archive’s value · /);
         const after = await until(app, (x) => x, (x) => x.items.find((i) => i.id === f1)!.persian?.composer === 'ابوالحسن صبا');
         expect(after.items.find((i) => i.id === f2)!.persian?.composer, where).toBe(beforeApply.items.find((i) => i.id === f2)!.persian?.composer);
         expect(after.items.find((i) => i.id === f2)!.persian?.composer, where).toBe('Morad-Khani');
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/setar-archive.md`
- `src/components/ArchiveRefresh.tsx`
- `src/components/direction.test.ts`
- `src/domain/sourceReconcile.test.ts`
- `src/domain/sourceReconcile.ts`
- `tests/fixtures/setar-review-ui.json`
- `tests/setar-review-ui.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
b6790fb Rework: make archive difference rows say what Apply will change

Owner testing: a Review differences row ("gusheh — yours: — · archive: X")
did not say which value was whose, what the dash meant, or whether a choice
did anything before Apply. The writes were already correct.

Invariant 1. Every difference row reads "Field: your value → archive's
value" with item-form field names, and an empty value is said as "none".
The summary counts the rows set to Use archive value before Apply
("will set N fields to the archive's value") and after it ("set …"). It uses
the plan's own decisionMatchesSuggestion, and a zero "update" count gives
way beside it.
- Fixed: DifferenceRow, used by Archive metadata differs and Review
  differences.
- Fixed: both section intros.
- Fixed: the preview Summary and the done Summary.
- Fixed: question rows and difference rows, now start-aligned. `.list-row`
  had centred them inside a start-aligned section.
- Fixed: both direction ledgers.
- Fixed: the hand-written line fixture. A deliberately emptied composer
  keeps "none" proven on screen.
- Checked clean: Review Setar setup, which already uses this grammar.

Invariant 2. The plan offers a gusheh NAME only to an item whose type is
gusheh. Taken on a legacy composed piece, the name could be neither seen nor
cleared in the item form ("Gusheh (radif only)"). The registry derives the
name from its kind reading, and the kind belongs to Review Setar setup,
which writes kind and name together. Each of the 7 affected owner items has
that row.
- Fixed at the one choke point, planArchiveImport's differences loop. It
  feeds suggestions, differences, summary.metadata, the stale-decision check
  and applyArchiveImport's write.
- Checked clean: link adoption copies no Persian fields.
- Checked clean: new items are seeded with kind and name from the same
  classifyPiece.
- Other fields are offered as before. Nothing already written is changed.

Proof:
- sourceReconcile.test "a gusheh name is offer
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
