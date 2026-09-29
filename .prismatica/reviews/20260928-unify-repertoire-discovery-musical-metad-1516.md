---
id: 20260928-unify-repertoire-discovery-musical-metad-1516
contractId: 20260928-unify-repertoire-discovery-musical-metad-1516
patchId: b48e8fc38702ca24f914e5789a7e6381b551a865
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Native iPhone bottom navigation recovers after keyboard dismissal
    summary: "ac-24 fails: the owner still reproduces a raised bottom bar after
      dismissing the keyboard on an actual iPhone. Browser geometry fixtures do
      not establish Safari or installed-PWA acceptance. Sweep checked shell/tab
      CSS, Layout, useViewportGuard, viewport decision and browser fixture;
      native behaviour remains failing and its mechanism unmeasured."
    counterexample: On the owner's iPhone, focus and type in an input, dismiss the
      keyboard, and observe the Today/Repertoire/Start/Lessons/More bar remain
      displaced. Capture the required Safari and installed-PWA traces before
      claiming recovery.
  - family: Owned work and stage suggestion present one clear musical work
    summary: Placing an owned item changes stageId without binding the matching
      reference. stageUnits then shows the unbound suggestion followed by the
      owned item, and Add can create another item. Sweep checked Item Detail
      placement, catalogue Add/Play, resolution, stage rows, progress/next-unit,
      explicit link, unlink, hide/restore and removal. Explicit linking is
      clean; the ordinary placement journey remains misleading. Preserve
      explicit identity choice and owner data.
    counterexample: Place سیخی-ابوعطا-ردیف-میرزاعبدالله in the stage containing the
      سیخی reference. The stage shows both rows; tapping Add on سیخی creates a
      second practice item instead of making the existing relationship clear and
      actionable.
createdAt: 2026-09-29T17:55:22.883Z
sealedAt: 2026-09-29T18:07:01.589Z
---

# Review: Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260928-unify-repertoire-discovery-musical-metad-1516
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/39
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `b48e8fc38702ca24f914e5789a7e6381b551a865`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The Delta this change was framed from

# Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

_approved · about "browse-my-repertoire" step 1_

## Today

Repertoire browsing depends on separate raw-text groups and placement-based catalogue lookup; reference, owned practice and source concepts are inconsistently presented.

## Instead

Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

## Keep

- Owned PracticeItem is the practice unit.
- Core practice/scheduling and local-first guarantees.
- Existing owner data and explicit additive defaults.

## New assumptions

- NAS refresh delay was external indexer timing, not an app relocation defect.

## Show me

On phone and desktop, find the same work by Farsi/Latin term or maestro, open and return without losing filters, move it out of a stage and add its reference without duplication, hide/restore suggestions, and install Tar's shared radif view with independent practice. Show unclassified works, safe legacy migration, honest failed saves and the actual iPhone keyboard recovery.



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

**Approved intent:** `.prismatica/intents/20260928-unify-repertoire-discovery-musical-metad-1516.md`

**Findings from the previous review:**

- **Course-source ambiguity must remain answerable across every Add and Start path** — StageDetail.addSuggestion surfaces sourceCandidates, but StageDetail.practise ignores them and navigates away. planCatalogAddition persists an item without materialId; its bound-item fast path never returns the candidates again. The question is also lost if the Add prompt is cancelled or the page is left. Sweep: findCourseSource and resolveCourseSource detect ambiguity; planCatalogAddition and useStore.addFromCatalog carry it on first creation; StageDetail.addSuggestion and SourceChoice handle it only while mounted; StageDetail.practise and repeat bound Add do not; chooseCourseSource correctly checks instrument and key clashes. The named study-source test covers only the first pure planner result.
  _counterexample:_ With two unkeyed Tar sources titled as Khonyagar candidates, tap Play on an untaken Khonyagar suggestion. The new item is saved without materialId, practice opens, no choice appears, and later Add sees the bound item and returns no sourceCandidates.
- **Vocabulary edits must not silently reclassify ambiguous authored text** — Inbound term validation deliberately accepts overlapping aliases and resolveValue keeps their item text ambiguous. itemsUsingTerm counts only uniquely resolved terms, so planDeleteTerm allows deleting a colliding custom term used in ambiguous text; planUpdateTerm likewise misses the transition when removing an alias. The remaining claimant then becomes a unique term without an item edit. Sweep: validateMusicTerms and vocabulary admit the collision; resolveValue and valueGroup correctly keep it literal while ambiguous; planAddTerm refuses new collisions; planUpdateTerm and planDeleteTerm miss this transition; MusicTerms uses the same count to enable Delete; store updateTerm/deleteTerm apply those planners; repertoire grouping/search and source reconciliation consume the changed resolution.
  _counterexample:_ Import a valid v15 custom Dastgah term named My Shur with alias Shur alongside the built-in Shur alias and an item whose dastgahAvaz is literal Shur. The item is initially ambiguous, the custom term shows zero users, and Delete succeeds. On the next render, that unchanged item resolves and groups as the built-in Shur term.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index cdd67d21e5ef73f3988b783d789d1f51fe106be8..8ff05404fe9cfd9a02395313f89607412d6eb2d2 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -779,8 +779,9 @@ own pace, on a route they trust. Protect that:
   stay literal and group by their own text; transliteration is search only
   (`searchAliasTable`). Picking a term's NAME stores the reference. More → Musical terms
   renames (id kept, old name kept as a spelling), refuses a spelling another term claims or
-  an item still depends on, archives (still readable, no longer offered) and deletes only
-  unused custom terms; "Saved." waits for IndexedDB. Gusheh titles are NOT terms. Term and
+  any edit that would change what an unedited item's value means (`reclassifiedItems` —
+  ambiguous text collapsing onto the remaining claimant included), archives (still
+  readable, no longer offered) and deletes only custom terms no value depends on; "Saved." waits for IndexedDB. Gusheh titles are NOT terms. Term and
   source editors share `useAcknowledgedSaves` (`ui.tsx`): Saved speaks only for the draft it
   carried (newer text is re-written), outcomes are keyed by record so a moved or deleted row
   keeps its failure and Try again, nothing closes before acknowledgement, and Done resets.
@@ -790,7 +791,9 @@ own pace, on a route they trust. Protect that:
   stored and selectable on its own source, and the compact editor patches only what it
   shows. A new source starts on the browsed/session instrument. A shipped course's own source
   carries `sourceKey` (v15) so a rename never mints a copy; only a uniquely proven origin (the
-  course's title AND kind) is keyed, an unproven same-titled source is ASKED about. Never
+  course's title AND kind) is keyed, an unproven same-titled source is ASKED about — and
+  that question is DERIVED from saved data (`courseSourceQuestions`), so Play, a cancelled
+  prompt or a reload never loses it; the answer goes only to the items it named. Never
   deduplicate arbitrary sources by title or share them across instruments. One keyed source
   per course per instrument: a second is refused, never silently un-keyed.
 - **Seeds are honest starting points, never fabricated authority.** Guitar = CGS. Setar =
diff --git a/docs/repertoire-experience.md b/docs/repertoire-experience.md
index 1437d81f4faaefa7fd26d657abbba60ff68cd7e7..00291f077e655e5e4b04cac6f2b341e45b244f58 100644
--- a/docs/repertoire-experience.md
+++ b/docs/repertoire-experience.md
@@ -42,11 +42,11 @@ Reference ids: `stage:<stageId>:<key>` · `course:<courseId>:work:<identity>` ·
 | Fact | Written by | Read by |
 | --- | --- | --- |
 | Term values on items | `ItemForm` (`MusicalTermField` → `valueFromInput`), `itemFromCatalogEntry` (radif entries carry `{termId}`), archive adoption (`sourceReconcile`, raw registry TEXT only), migration (never — legacy text is kept) | `resolveValue`/`valueLabel`/`valueGroup`/`valueSearchTexts` → `groupByDastgah`, `discoverRepertoire`, `repertoireSearchTexts` (Practice list, Start), `ItemDetail` details, `WorkRow`, `MusicalTermField`, archive suggestion comparison (`fieldAlreadySays`), `isWork`/`hasPersianIdentity`, `kindFromItem`, `validateMusicTerms` |
-| `musicTerms` | `addTerm`/`updateTerm`/`deleteTerm` (store, via `planAddTerm`/`planUpdateTerm`/`planDeleteTerm`), `migrateToV15` (empty list only) | `vocabulary()` everywhere above, `searchAliasTable`, MusicTerms page, `validateDB` |
+| `musicTerms` | `addTerm`/`updateTerm`/`deleteTerm` (store, via `planAddTerm`/`planUpdateTerm`/`planDeleteTerm`; an update is refused when `reclassifiedItems` finds an unedited value whose meaning would change, a delete while `itemsUsingTerm` — ambiguous claimants included — is non-empty; MusicTerms' Delete reads `planDeleteTerm` itself), `migrateToV15` (empty list only) | `vocabulary()` everywhere above, `searchAliasTable`, MusicTerms page, `validateDB` |
 | `catalogRefs` | `planCatalogAddition` (Add), `planLinkReference`, `planUnlinkReference`, `planRemoveFromPathway`, and — through `settleLegacyEvidence` (unique legacy decided, ambiguous refused) — every placement writer: `updateItem` (stage/key/instrument), `placeItemInStage`, `deleteStage`, `deletePathway`; `bindLegacyReferences` (v15 migration, fitting evidence only). Every one passes `identityRefusal` before `set()`; a link or instrument move may not overrule another item's legacy answer (`legacyClaimRefusal`) | `resolveCatalogReference` → `stageUnits`/`hiddenUnits`/`stageProgress`/`currentStage`/`nextUnitInStage`/`pathwayProgress`, `planCatalogAddition` reuse, `carriedCourseWorkItem`, routine segment binding (`unitItem`), `itemReferences` → `itemFiles` course material, `validateReferences` |
 | `hiddenRefs` | `planSetReferenceHidden` (Hide/Restore), `planRemoveFromPathway` | `pathwayStageContext` → every stage consumer above; `validateReferences` (scope = the pathway's shipped definition) |
 | Pathway route | `updatePathway` (archived, pin), `deleteStage` (clears pin) | `visiblePathways`/`primaryPathway`/`pathwayPosition` → Today, SessionPlan (build + editor), Repertoire cards, PathwayDetail |
-| `sourceKey` | `resolveCourseSource` (mint/adopt), `chooseCourseSource` and `updateMaterial` (both refused by `sourceKeyClash` when the instrument already holds the key), `backfillCourseSourceKeys` (v15) | `findCourseSource`, `validateStudySources` |
+| `sourceKey` | `resolveCourseSource` (mint/adopt), `chooseCourseSource` (via `planChooseCourseSource`, answering the derived `courseSourceQuestions` for exactly the items it names — StageDetail renders it; `planCatalogAddition` returns its candidates on first AND repeat Add) and `updateMaterial` (both refused by `sourceKeyClash` when the instrument already holds the key), `backfillCourseSourceKeys` (v15) | `findCourseSource`, `validateStudySources` |
 | Missing shipped stages | `planDefaultStages` via `addDefaultStages` (PathwayDetail "Restore shipped stages"), `planCourseLevels` (course levels) | `offeredDefaultStages`, `offeredCourseLevels` |
 | Save outcomes (terms, sources, course source choice) | `useAcknowledgedSaves` in MusicTerms, Materials, ItemForm inline source, StageDetail `SourceChoice` | `SaveStatus` (keyed by record, carried-draft aware) |
 | Browse return | Repertoire (`state.from`, Study sources `?instrument=`) | PathwayDetail, StageDetail (`pathwaysReturnPath` fallback), Materials |
diff --git a/src/components/ReferenceChoices.tsx b/src/components/ReferenceChoices.tsx
index 1f9f4a8170965cbda711ab35a9e8034c8a74b67f..c6d7e4059da45b6c5129b83ab7bdd7e5262c52bc 100644
--- a/src/components/ReferenceChoices.tsx
+++ b/src/components/ReferenceChoices.tsx
@@ -66,12 +66,15 @@ export function ItemChoice({
 export function SourceChoice({
   courseName,
   materials,
+  items,
   ack,
   onChoose,
   onCancel,
 }: {
   courseName: string;
   materials: Material[];
+  /** The items the answer is given to — named, because only those are. */
+  items: PracticeItem[];
   /** The saved outcome of the last choice: it stays on screen until acknowledged. */
   ack?: Ack;
   onChoose: (materialId: string) => void;
@@ -85,6 +88,16 @@ export function SourceChoice({
       <p className="tiny dim" style={{ margin: 0 }}>
         More than one of your sources could be this course. Choose the one to keep using — nothing is merged or renamed.
       </p>
+      <p className="tiny dim" style={{ margin: 0 }}>
+        Your choice is given to{' '}
+        {items.map((i, n) => (
+          <span key={i.id}>
+            {n > 0 && ', '}
+            <span dir="auto">{i.title}</span>
+          </span>
+        ))}
+        .
+      </p>
       {materials.map((m) => (
         <button
           key={m.id}
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index 9f313b19ca68ec4fb1fa61b9043336cdd1cab4a3..e507132fd34a608069715c75900cfd0605a1663b 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -174,6 +174,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
+  { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceEditor.tsx", tagName: "li", classValue: "row between" },
   { file: "pages/ActiveBlock.tsx", tagName: "div", classValue: "eyebrow" },
   { file: "pages/ActiveBlock.tsx", tagName: "div", classValue: "stack-sm" },
diff --git a/src/domain/courseSeed.ts b/src/domain/courseSeed.ts
index 541d194f47ad12dbfc22ab6372329097102fc338..4c5c72d632020883ac22d2f02f7aae6ed0b5396f 100644
--- a/src/domain/courseSeed.ts
+++ b/src/domain/courseSeed.ts
@@ -668,7 +668,16 @@ export function planCatalogAddition(
   const ref = catalogReferenceId(stageId, entryKey);
   const resolved = resolveCatalogReference(ref, instrumentId, db.items);
   if (resolved.status === 'bound') {
-    return { items: db.items, materials: db.materials, itemId: resolved.item.id, created: false };
+    // Reuse writes nothing — but a source question the item is still waiting
+    // on is asked again, so no tap, cancel or page left behind can lose it.
+    const asked = pendingSourceCandidates(db, resolved.item);
+    return {
+      items: db.items,
+      materials: db.materials,
+      itemId: resolved.item.id,
+      created: false,
+      ...(asked ? { sourceCandidates: asked } : {}),
+    };
   }
   if (resolved.status === 'ambiguous') {
     return { items: db.items, materials: db.materials, itemId: '', created: false, candidates: resolved.candidates };
@@ -687,13 +696,85 @@ export function planCatalogAddition(
 
   const source = resolveCourseSource(db.materials, found.course, instrumentId, now);
   const item = source.materialId ? { ...base, materialId: source.materialId } : base;
-  return {
-    items: [...db.items, item],
-    materials: source.materials,
-    itemId: item.id,
-    created: true,
-    ...(source.candidates ? { sourceCandidates: source.candidates } : {}),
-  };
+  const next = { items: [...db.items, item], materials: source.materials };
+  const asked = pendingSourceCandidates(next, item);
+  return { ...next, itemId: item.id, created: true, ...(asked ? { sourceCandidates: asked } : {}) };
+}
+
+// --- the course's study source, when the owner must say which it is ----------
+
+/** The course a reference belongs to: a course work, or a section of a course stage. */
+export function courseOfReference(refId: string): CourseData | undefined {
+  const work = /^course:([^:]+):work:/.exec(refId);
+  if (work) return courseById(work[1]);
+  if (!refId.startsWith('stage:')) return undefined;
+  const rest = refId.slice('stage:'.length);
+  const cut = rest.lastIndexOf(':');
+  return cut > 0 ? courseStage(rest.slice(0, cut))?.course : undefined;
+}
+
+export interface CourseSourceQuestion {
+  course: CourseData;
+  instrumentId: ID;
+  /** The owner's sources that could each be this course's. */
+  candidates: Material[];
+  /** Every item waiting on the answer — named on screen, and the only ones it is written to. */
+  items: PracticeItem[];
+}
+
+/**
+ * WHICH STUDY SOURCE IS THIS COURSE — DERIVED FROM SAVED DATA, NEVER HELD BY A
+ * SCREEN. The question stands, per instrument, while the course's source is
+ * ambiguous (`findCourseSource`) and some item of that course — by the
+ * references it answers, never its placement, so a moved or detached item is
+ * still asked — has no source. Nothing ephemeral carries it, so leaving the
+ * page, "Decide later", Play instead of Add and a reload all leave it exactly
+ * as answerable as before; it ends only when the owner answers it (or gives
+ * each item a source themselves).
+ */
+export function courseSourceQuestions(db: CatalogAdditionDB, course: CourseData): CourseSourceQuestion[] {
+  const out: CourseSourceQuestion[] = [];
+  const waiting = db.items.filter((i) => !i.materialId && itemReferences(i).some((r) => courseOfReference(r)?.id === course.id));
+  for (const instrumentId of [...new Set(waiting.map((i) => i.instrumentId))]) {
+    const found = findCourseSource(db.materials, course, instrumentId);
+    if (found.status !== 'ambiguous') continue;
+    out.push({ course, instrumentId, candidates: found.candidates, items: waiting.filter((i) => i.instrumentId === instrumentId) });
+  }
+  return out;
+}
+
+/** The candidates one item is still waiting on the owner to choose between, if any. */
+function pendingSourceCandidates(db: CatalogAdditionDB, item: PracticeItem): Material[] | undefined {
+  for (const ref of itemReferences(item)) {
+    const course = courseOfReference(ref);
+    const q = course && courseSourceQuestions(db, course).find((x) => x.items.some((i) => i.id === item.id));
+    if (q) return q.candidates;
+  }
+  return undefined;
+}
+
+/**
+ * The owner's answer: key the chosen source as the course's, and give it to
+ * exactly the items the question NAMED that still have none. A course item
+ * without a source is indistinguishable from one whose source the owner
+ * cleared, so nothing the question did not name is ever filled in. Choosing
+ * again (a retry) re-states the same answer and changes nothing further.
+ */
+export function planChooseCourseSource(
+  db: CatalogAdditionDB,
+  course: CourseData,
+  materialId: ID,
+  itemIds: ID[],
+  now: Date,
+): { ok: true; items: PracticeItem[]; materials: Material[] } | { ok: false; reason: string } {
+  const material = db.materials.find((m) => m.id === materialId);
+  const named = new Set(itemIds);
+  const targets = db.items.filter((i) => named.has(i.id));
+  if (!material || !targets.length) return { ok: false, reason: 'That item or study source no longer exists.' };
+  if (targets.some((i) => i.instrumentId !== material.instrumentId)) return { ok: false, reason: 'That study source belongs to another instrument.' };
+  const materials = withCourseSourceKey(db.materials, materialId, course);
+  const items = db.items.map((i) => (named.has(i.id) && !i.materialId ? { ...i, materialId, updatedAt: nowISO(now) } : i));
+  return { ok: true, items, materials };
 }
 
 /**
diff --git a/src/domain/musicTerms.test.ts b/src/domain/musicTerms.test.ts
index c3d3f9ecef4e748736ee3dfd675536e2695d4972..9527b15fe729f2cb9ba6935728db4bd65ee7dcad 100644
--- a/src/domain/musicTerms.test.ts
+++ b/src/domain/musicTerms.test.ts
@@ -1,9 +1,11 @@
 import { describe, expect, it } from 'vitest';
 import {
   BUILT_IN_TERMS,
+  itemsUsingTerm,
   planAddTerm,
   planDeleteTerm,
   planUpdateTerm,
+  reclassifiedItems,
   resolveValue,
   searchAliasTable,
   searchMatch,
@@ -138,5 +140,53 @@ describe('the shared musical vocabulary', () => {
     expect(planDeleteTerm(terms, items, 'term-khatai')).toMatchObject({ ok: false });
     expect(planDeleteTerm(terms, [item('y', { form: { termId: 'term-khatai' } })], 'term-khatai')).toMatchObject({ ok: false });
     expect(planDeleteTerm(terms, [], 'term-khatai')).toEqual({ ok: true, terms: [] });
+
+    // AMBIGUOUS TEXT IS HELD IN PLACE BY EVERY CLAIMANT. An imported custom
+    // term sharing a spelling with another (validation admits it; resolution
+    // keeps that text literal) may neither be deleted nor lose the spelling,
+    // for each field — against a built-in claimant and against a custom one —
+    // because either hands the item to whichever claimant is left.
+    const cases: { field: 'dastgahAvaz' | 'form' | 'composer'; kind: MusicTerm['kind']; spelling: string; other?: MusicTerm }[] = [
+      { field: 'dastgahAvaz', kind: 'dastgah', spelling: 'Shur' },
+      { field: 'form', kind: 'form', spelling: 'Reng' },
+      { field: 'composer', kind: 'composer', spelling: 'Darvish Khan' },
+      { field: 'form', kind: 'form', spelling: 'Naghmeh', other: term('term-other', 'form', 'Other naghmeh', ['Naghmeh']) },
+    ];
+    for (const c of cases) {
+      const mine = term('term-mine', c.kind, `My ${c.spelling}`, [c.spelling]);
+      const stored = [mine, ...(c.other ? [c.other] : [])];
+      const piece = item('amb', { [c.field]: c.spelling });
+      const label = `${c.field} ${c.spelling}${c.other ? ' (custom claimant)' : ''}`;
+      expect(resolveValue(c.spelling, c.kind, vocabulary(stored)).status, label).toBe('ambiguous');
+      // Neither term may be deleted out from under it, and the count says why.
+      expect(itemsUsingTerm([piece], 'term-mine', vocabulary(stored)).map((i) => i.id), label).toEqual(['amb']);
+      expect(planDeleteTerm(stored, [piece], 'term-mine').ok, label).toBe(false);
+      if (c.other) expect(planDeleteTerm(stored, [piece], 'term-other').ok, label).toBe(false);
+      // Removing the shared spelling is the same collapse, said as an edit.
+      const dropped = planUpdateTerm(stored, [piece], 'term-mine', { aliases: [] }, NOW);
+      expect(dropped.ok, label).toBe(false);
+      expect(!dropped.ok && dropped.reason, label).toMatch(/quietly change what it means/);
+      // …but the term is not stuck: the collision it arrived with is not this
+      // edit's doing, so archiving it and renaming it (spelling kept) still work,
+      // and the piece still reads as the owner wrote it.
+      const archived = planUpdateTerm(stored, [piece], 'term-mine', { archived: true }, NOW);
+      expect(archived.ok, label).toBe(true);
+      const renamed = planUpdateTerm(archived.ok ? archived.terms : stored, [piece], 'term-mine', { name: `Mine ${c.spelling}` }, NOW);
+      expect(renamed.ok, label).toBe(true);
+      expect(resolveValue(c.spelling, c.kind, vocabulary(renamed.ok ? renamed.terms : [])).status, label).toBe('ambiguous');
+      expect(reclassifiedItems([piece], c.kind, vocabulary(stored), vocabulary(renamed.ok ? renamed.terms : [])), label).toEqual([]);
+      // With nothing written in that spelling, both edits are free.
+      expect(planDeleteTerm(stored, [], 'term-mine').ok, label).toBe(true);
+      expect(planUpdateTerm(stored, [], 'term-mine', { aliases: [] }, NOW).ok, label).toBe(true);
+    }
+    // Text that STAYS ambiguous reads literally either way: three claimants of
+    // «Zarbi», one of them dropping it, reclassify nothing.
+    const three = [term('term-a', 'form', 'Zarbi A', ['Zarbi']), term('term-b', 'form', 'Zarbi B', ['Zarbi'])];
+    expect(planUpdateTerm(three, [item('z', { form: 'Zarbi' })], 'term-a', { aliases: [] }, NOW).ok).toBe(true);
+    // Giving LITERAL text a term is what adding a spelling is for — allowed.
+    const plain = item('plain', { form: 'Chaharpareh' });
+    const claimed = planUpdateTerm(terms, [plain], 'term-khatai', { aliases: ['Khatai', 'Chaharpareh'] }, NOW);
+    expect(claimed.ok).toBe(true);
+    expect(resolveValue('Chaharpareh', 'form', vocabulary(claimed.ok ? claimed.terms : [])).status).toBe('term');
   });
 });
diff --git a/src/domain/musicTerms.ts b/src/domain/musicTerms.ts
index 746cf4dc91fe3c249d3f98ff79a8499492bfbd2f..7de8e3f938007f7899398aee9d70658d28401bbe 100644
--- a/src/domain/musicTerms.ts
+++ b/src/domain/musicTerms.ts
@@ -373,7 +373,12 @@ export function parseAliases(text: string): string[] {
   return [...new Set(text.split(/[\n,،]/).map((a) => a.trim()).filter(Boolean))];
 }
 
-/** Items whose stored value currently MEANS this term, by reference or by alias. */
+/**
+ * Items whose stored value DEPENDS on this term: a reference to it, text that
+ * means it uniquely, or text it is one of several claimants of (ambiguous
+ * text is kept literal only because more than one term answers to it, so
+ * every claimant is holding that reading in place).
+ */
 export function itemsUsingTerm(items: PracticeItem[], termId: ID, vocab: Vocabulary): PracticeItem[] {
   const term = vocab.byId.get(termId);
   if (!term) return [];
@@ -381,16 +386,53 @@ export function itemsUsingTerm(items: PracticeItem[], termId: ID, vocab: Vocabul
     TERM_FIELDS.some((field) => {
       if (TERM_FIELD_KIND[field] !== term.kind) return false;
       const r = resolveValue(item.persian?.[field], term.kind, vocab);
-      return r.status === 'term' && r.term.id === termId;
+      if (r.status === 'term') return r.term.id === termId;
+      return r.status === 'ambiguous' && r.candidates.some((t) => t.id === termId);
+    }),
+  );
+}
+
+/** What a value MEANS, as one comparable word: a term's id, or how it reads without one. */
+function meaning(value: MusicalValue | null | undefined, kind: MusicTermKind, vocab: Vocabulary): string {
+  const r = resolveValue(value, kind, vocab);
+  return r.status === 'term' ? `term:${r.term.id}` : r.status;
+}
+
+/**
+ * THE ONE CHECK a vocabulary edit passes before it is applied: the items whose
+ * stored text or reference would MEAN something different under `after` than
+ * under `before`, with nothing about the item itself edited. The only change
+ * allowed is literal text becoming a term — a spelling the owner has just
+ * given a term, which is what adding that spelling is for. Everything else —
+ * a term's text turning literal, one term becoming another, a reference left
+ * dangling, or AMBIGUOUS text collapsing onto whichever claimant is left — is
+ * reclassifying the owner's piece behind their back. Still-ambiguous text is
+ * no change: it reads literally either way.
+ */
+export function reclassifiedItems(items: PracticeItem[], kind: MusicTermKind, before: Vocabulary, after: Vocabulary): PracticeItem[] {
+  return items.filter((item) =>
+    TERM_FIELDS.some((field) => {
+      if (TERM_FIELD_KIND[field] !== kind) return false;
+      const was = meaning(item.persian?.[field], kind, before);
+      const now = meaning(item.persian?.[field], kind, after);
+      return was !== now && !(was === 'literal' && now.startsWith('term:'));
     }),
   );
 }
 
-/** Which keys of `candidate` another term of the same kind already claims. */
-function collisions(candidate: Pick<MusicTerm, 'id' | 'kind' | 'name' | 'aliases'>, vocab: Vocabulary): string[] {
+/**
+ * Which keys of `candidate` another term of the same kind already claims —
+ * only the keys this edit ADDS. A collision the term already carried (an
+ * imported file may hold one; resolution keeps that text literal) is not the
+ * edit's doing, and refusing on it would leave the term impossible to archive
+ * or rename at all.
+ */
+function collisions(candidate: Pick<MusicTerm, 'id' | 'kind' | 'name' | 'aliases'>, vocab: Vocabulary, had: string[] = []): string[] {
   const own = vocab.keys.get(candidate.kind)!;
+  const held = new Set(had);
   const out: string[] = [];
   for (const text of [candidate.name, ...candidate.aliases]) {
+    if (held.has(termKey(text))) continue;
     const claimants = (own.get(termKey(text)) ?? []).filter((t) => t.id !== candidate.id);
     if (claimants.length) out.push(`“${text}” already means ${claimants.map((t) => `“${t.name}”`).join(', ')}`);
   }
@@ -445,29 +487,25 @@ export function planUpdateTerm(
   const next: MusicTerm = { ...current, name, aliases, updatedAt: nowISO(now) };
   if (archived) next.archived = true;
   else delete next.archived;
-  const clash = collisions(next, vocab);
+  const clash = collisions(next, vocab, termKeys(current));
   if (clash.length) return { ok: false, reason: `Not saved: ${clash.join('; ')}. One spelling cannot mean two terms.` };
-  const keptKeys = new Set(termKeys(next));
-  const dependents = items.filter((item) =>
-    TERM_FIELDS.some((field) => {
-      if (TERM_FIELD_KIND[field] !== current.kind) return false;
-      const value = item.persian?.[field];
-      if (typeof value !== 'string') return false;
-      const r = resolveValue(value, current.kind, vocab);
-      return r.status === 'term' && r.term.id === id && !keptKeys.has(termKey(value));
-    }),
-  );
-  if (dependents.length) {
-    const n = dependents.length;
+  const terms = withStored(stored, next);
+  const changed = reclassifiedItems(items, current.kind, vocab, vocabulary(terms));
+  if (changed.length) {
+    const n = changed.length;
     return {
       ok: false,
-      reason: `Not saved: ${n} item${n === 1 ? ' is' : 's are'} written with a spelling you removed. Keep it as an alias, or change ${n === 1 ? 'that item' : 'those items'} first.`,
+      reason: `Not saved: ${n} item${n === 1 ? ' is' : 's are'} written with a spelling you removed, and would quietly change what ${n === 1 ? 'it means' : 'they mean'}. Keep it as an alias, or change ${n === 1 ? 'that item' : 'those items'} first.`,
     };
   }
-  return { ok: true, terms: withStored(stored, next) };
+  return { ok: true, terms };
 }
 
-/** Delete: custom terms only, and only while nothing means them. */
+/**
+ * Delete: custom terms only, and only while no item's value depends on it —
+ * including text it is one of several claimants of, whose other claimant it
+ * would otherwise silently hand the item to.
+ */
 export function planDeleteTerm(stored: MusicTerm[], items: PracticeItem[], id: ID): TermPlan {
   if (isBuiltInTerm(id)) return { ok: false, reason: 'A built-in term cannot be deleted. Archive it to stop offering it.' };
   const vocab = vocabulary(stored);
diff --git a/src/domain/studySources.test.ts b/src/domain/studySources.test.ts
index 59dfef35c908900bc90ea7f3dffb77e399eb7fd7..b5f80e5693ff9c12abf331cb747769b90b7f2356 100644
--- a/src/domain/studySources.test.ts
+++ b/src/domain/studySources.test.ts
@@ -7,7 +7,14 @@ import {
   sourceKindOptions,
   withCourseSourceKey,
 } from './studySources';
-import { courseStageId, COURSES, planCatalogAddition, resolveCourseSource } from './courseSeed';
+import {
+  courseSourceQuestions,
+  courseStageId,
+  COURSES,
+  planCatalogAddition,
+  planChooseCourseSource,
+  resolveCourseSource,
+} from './courseSeed';
 import { catalogForStage } from './pathwaySeed';
 import { CGS_COURSE } from './courseData';
 import { KHONYAGAR_COURSE } from './khonyagarData';
@@ -85,6 +92,46 @@ describe('study sources', () => {
     expect(asked.items.find((i) => i.id === asked.itemId)!.materialId).toBeUndefined();
     expect(asked.sourceCandidates!.map((m) => m.id)).toEqual(['mat-khon-1', 'mat-khon-2']);
     expect(asked.materials).toBe(db.materials);
+    // 6. THE QUESTION IS SAVED DATA, NOT A SCREEN'S MEMORY. Whatever the tap
+    //    (Play adds exactly as Add does), the new item is left waiting, and the
+    //    question is derived from the database: it survives an export/reload,
+    //    and a REPEAT Add of the now-bound suggestion asks it again while
+    //    writing nothing.
+    const afterFirst = { ...db, items: asked.items, materials: asked.materials };
+    const reloaded = validateDB(JSON.parse(serializeExport(afterFirst, NOW)));
+    const questionOf = (d: Pick<typeof db, 'items' | 'materials'>) => courseSourceQuestions(d, KHONYAGAR_COURSE);
+    expect(questionOf(reloaded).map((q) => [q.instrumentId, q.candidates.map((m) => m.id), q.items.map((i) => i.id)])).toEqual([
+      ['inst-tar', ['mat-khon-1', 'mat-khon-2'], [asked.itemId]],
+    ]);
+    const again = planCatalogAddition(reloaded, kStage, kEntry.key, kEntry, 'inst-tar', NOW);
+    expect([again.created, again.itemId, again.items, again.materials]).toEqual([false, asked.itemId, reloaded.items, reloaded.materials]);
+    expect(again.items).toBe(reloaded.items);
+    expect(again.sourceCandidates!.map((m) => m.id)).toEqual(['mat-khon-1', 'mat-khon-2']);
+    // Moved out of its stage, it is still asked: the course is read from the
+    // references it answers, never from where it sits.
+    const moved = reloaded.items.map((i) => (i.id === asked.itemId ? { ...i, stageId: undefined } : i));
+    expect(questionOf({ ...reloaded, items: moved })[0].items.map((i) => i.id)).toEqual([asked.itemId]);
+    // A second suggestion added while it is still open joins the SAME question.
+    const kEntry2 = catalogForStage(kStage)[1];
+    const second = planCatalogAddition(reloaded, kStage, kEntry2.key, kEntry2, 'inst-tar', NOW);
+    const both = { ...reloaded, items: second.items, materials: second.materials };
+    expect(questionOf(both)[0].items.map((i) => i.id)).toEqual([asked.itemId, second.itemId]);
+    // 7. THE ANSWER goes to exactly the items the question named — both here —
+    //    keys the chosen source, and ends the question. Choosing again (a
+    //    retry) restates it and changes nothing further.
+    const answered = planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId, second.itemId], NOW);
+    if (!answered.ok) throw new Error(answered.reason);
+    expect(answered.items.filter((i) => i.materialId === 'mat-khon-2').map((i) => i.id)).toEqual([asked.itemId, second.itemId]);
+    expect(questionOf(answered)).toEqual([]);
+    const retried = planChooseCourseSource(answered, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId, second.itemId], NOW);
+    expect(retried.ok && [retried.items, retried.materials]).toEqual([answered.items, answered.materials]);
+    // …and ONLY to those: a course item it did not name keeps no source —
+    // one without a source looks exactly like one the owner cleared.
+    const onlyFirst = planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-khon-2', [asked.itemId], NOW);
+    expect(onlyFirst.ok && onlyFirst.items.find((i) => i.id === second.itemId)!.materialId).toBeUndefined();
+    // A source on another instrument is refused, never half-applied.
+    expect(planChooseCourseSource(both, KHONYAGAR_COURSE, 'mat-cgs', [asked.itemId], NOW)).toMatchObject({ ok: false });
+
     // The owner's answer keys exactly the one chosen.
     const chosen = withCourseSourceKey(db.materials, 'mat-khon-2', KHONYAGAR_COURSE);
     expect(chosen.filter((m) => m.sourceKey).map((m) => [m.id, m.sourceKey])).toEqual([
diff --git a/src/pages/MusicTerms.tsx b/src/pages/MusicTerms.tsx
index 6b3eac3b441469ff5ef9d846312c73615ecb221b..061bce2aa18e0da72b24d9f60e4dfb4f5decb2ff 100644
--- a/src/pages/MusicTerms.tsx
+++ b/src/pages/MusicTerms.tsx
@@ -6,6 +6,7 @@ import {
   MUSIC_TERM_KIND_LABELS,
   MUSIC_TERM_KINDS,
   parseAliases,
+  planDeleteTerm,
   vocabulary,
   type MusicTerm,
   type MusicTermKind,
@@ -49,8 +50,16 @@ export default function MusicTerms() {
     setDeleted((d) => ({ ...d, [term.id]: term.name }));
     saves.run(term.id, 'delete', () => deleteTerm(term.id));
   };
+  // Delete is offered exactly when the planner the store applies would allow it.
   const row = (t: MusicTerm) => (
-    <TermRow key={t.id} term={t} users={itemsUsingTerm(db.items, t.id, vocab).length} saves={saves} onDelete={() => remove(t)} />
+    <TermRow
+      key={t.id}
+      term={t}
+      users={itemsUsingTerm(db.items, t.id, vocab).length}
+      deletable={planDeleteTerm(db.musicTerms, db.items, t.id).ok}
+      saves={saves}
+      onDelete={() => remove(t)}
+    />
   );
 
   return (
@@ -180,7 +189,19 @@ function AddTerm({ kind, saves }: { kind: MusicTermKind; saves: AckSaves }) {
   );
 }
 
-function TermRow({ term, users, saves, onDelete }: { term: MusicTerm; users: number; saves: AckSaves; onDelete: () => void }) {
+function TermRow({
+  term,
+  users,
+  deletable,
+  saves,
+  onDelete,
+}: {
+  term: MusicTerm;
+  users: number;
+  deletable: boolean;
+  saves: AckSaves;
+  onDelete: () => void;
+}) {
   const updateTerm = useStore((s) => s.updateTerm);
   const [editing, setEditing] = useState(false);
   const [name, setNameState] = useState(term.name);
@@ -258,8 +279,8 @@ function TermRow({ term, users, saves, onDelete }: { term: MusicTerm; users: num
           <button
             className="btn btn-ghost btn-sm btn-danger"
             aria-label={`Delete ${term.name}`}
-            disabled={users > 0}
-            title={users > 0 ? 'Used by pieces — archive it instead' : undefined}
+            disabled={!deletable}
+            title={deletable ? undefined : 'Used by pieces — archive it instead'}
             onClick={() => {
               if (confirm(`Delete the term “${term.name}”? No piece uses it.`)) onDelete();
             }}
diff --git a/src/pages/StageDetail.tsx b/src/pages/StageDetail.tsx
index 09901b4f8a4840b119c4bcd21c5561bccbe50fde..66df98c71e31424a4b020d8367898aef5f2f2995 100644
--- a/src/pages/StageDetail.tsx
+++ b/src/pages/StageDetail.tsx
@@ -9,9 +9,10 @@ import {
   stageUnits,
   ITEM_STATUS_LABELS,
   STRAND_LABELS,
-  type Material,
+  type CourseSourceQuestion,
   type PathwayRoutine,
   type StageUnit,
+  courseSourceQuestions,
   courseStage,
   itemsPreparedForLesson,
   pathwaysReturnPath,
@@ -72,13 +73,21 @@ export default function StageDetail() {
   // An explicit choice in progress: which item a suggestion is, or which
   // study source a course is.
   const [choosing, setChoosing] = useState<{ unit: StageUnit; mode: 'link' | 'ambiguous' } | null>(null);
-  const [sourceChoice, setSourceChoice] = useState<{ itemId: string; materials: Material[] } | null>(null);
-  // Choosing the course's source is a saved decision: the choice stays on
+  // Which study source the course is: a question DERIVED from saved data
+  // (`courseSourceQuestions`), so Play, a cancelled prompt, leaving the page
+  // or a reload never loses it. "Decide later" only quiets it for this visit.
+  const [sourceDeferred, setSourceDeferred] = useState(false);
+  // Choosing is a saved decision: the question the owner answered stays on
   // screen until IndexedDB acknowledged it, and a failure offers Try again.
+  const [heldQuestion, setHeldQuestion] = useState<CourseSourceQuestion | null>(null);
   const saves = useAcknowledgedSaves();
   // A stage this course owns can write two routines from the course's own
   // syllabus. Both become ORDINARY EDITABLE routines — neither is a live view.
   const course = stageId ? courseStage(stageId) : undefined;
+  const openQuestion = course
+    ? courseSourceQuestions(db, course.course).find((q) => !ctx.instrumentId || q.instrumentId === ctx.instrumentId)
+    : undefined;
+  const sourceQuestion = heldQuestion ?? (sourceDeferred ? undefined : openQuestion);
 
   if (!stage) {
     return (
@@ -123,7 +132,9 @@ export default function StageDetail() {
       return;
     }
     setNotice(result.created ? `Added “${unit.title}” to your items — not practised yet.` : `“${unit.title}” is already one of your items.`);
-    if (result.sourceCandidates) setSourceChoice({ itemId: result.id, materials: result.sourceCandidates });
+    // The tap asked about this suggestion's course source: show the question
+    // again even if it was put off earlier in this visit.
+    if (result.sourceCandidates) setSourceDeferred(false);
   }
 
   function practise(unit: StageUnit) {
@@ -134,6 +145,8 @@ export default function StageDetail() {
       navigate(`/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`);
       return;
     }
+    // Practice starts at once. A study-source question this raises is not
+    // asked here — it is derived from saved data and waits on this stage.
     const added = unit.item ? null : addFromCatalog(stage!.id, unit.key);
     if (added?.refusal) {
       setRefusal(added.refusal);
@@ -291,26 +304,34 @@ export default function StageDetail() {
             {refusal}
           </p>
         )}
-        {sourceChoice && course && (
+        {sourceQuestion && (
           <SourceChoice
-            courseName={course.course.sourceName}
-            materials={sourceChoice.materials}
+            courseName={sourceQuestion.course.sourceName}
+            materials={sourceQuestion.candidates}
+            items={sourceQuestion.items}
             ack={saves.states.source}
             onChoose={(materialId) => {
-              const { itemId } = sourceChoice;
-              saves.run('source', materialId, () => chooseCourseSource(itemId, materialId, course.course.id), {
-                current: () => materialId,
-                again: () => undefined,
-                saved: () => {
-                  saves.reset('source');
-                  setSourceChoice(null);
-                  setNotice('Study source chosen — Saved.');
+              const q = sourceQuestion;
+              setHeldQuestion(q);
+              saves.run(
+                'source',
+                materialId,
+                () => chooseCourseSource(q.items.map((i) => i.id), materialId, q.course.id),
+                {
+                  current: () => materialId,
+                  again: () => undefined,
+                  saved: () => {
+                    saves.reset('source');
+                    setHeldQuestion(null);
+                    setNotice('Study source chosen — Saved.');
+                  },
                 },
-              });
+              );
             }}
             onCancel={() => {
               saves.reset('source');
-              setSourceChoice(null);
+              setHeldQuestion(null);
+              setSourceDeferred(true);
             }}
           />
         )}
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index eb4f892e0dd99b2c99908fec066b692cf20b7fec..8799bcc1074269bef9c6b0d16dd2e97cf849cebe 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -49,6 +49,7 @@ import {
   courseRoutine,
   courseStage,
   planCatalogAddition,
+  planChooseCourseSource,
   planCourseLevels,
   itemOwnedAttachments,
   retargetRoutineInstrument,
@@ -85,7 +86,6 @@ import {
   planUnlinkReference,
   planUpdateTerm,
   courseById,
-  withCourseSourceKey,
   isBuiltInTerm,
   settleLegacyEvidence,
   legacyClaimRefusal,
@@ -402,8 +402,8 @@ interface StoreState {
   removeFromPathway: (itemId: ID, pathwayId: ID) => string | null;
   /** Hide or restore one suggestion in one pathway. Visibility only. */
   setReferenceHidden: (pathwayId: ID, refId: string, hidden: boolean) => void;
-  /** Answer "which study source is this course?" when two candidates exist. */
-  chooseCourseSource: (itemId: ID, materialId: ID, courseId: string) => string | null;
+  /** Answer "which study source is this course?" for the items the question named (`courseSourceQuestions`). */
+  chooseCourseSource: (itemIds: ID[], materialId: ID, courseId: string) => string | null;
 
   // --- Shared musical terms (each returns the refusal, or null) --------------
   /** Returns the new term's id, or the refusal. */
@@ -1088,19 +1088,17 @@ export const useStore = create<StoreState>()(
         if (plan.ok && plan.pathways !== db.pathways) set((s) => ({ db: { ...s.db, pathways: plan.pathways } }));
       },
 
-      chooseCourseSource: (itemId, materialId, courseId) => {
+      chooseCourseSource: (itemIds, materialId, courseId) => {
         const course = courseById(courseId);
         const { db } = get();
-        const material = db.materials.find((m) => m.id === materialId);
-        const item = db.items.find((i) => i.id === itemId);
-        if (!course || !material || !item) return 'That item or study source no longer exists.';
-        if (material.instrumentId !== item.instrumentId) return 'That study source belongs to another instrument.';
-        const now = new Date();
-        const materials = withCourseSourceKey(db.materials, materialId, course);
-        const items = db.items.map((i) => (i.id === itemId ? touch({ ...i, materialId }, now) : i));
-        const refusal = identityRefusal({ ...db, materials, items });
+        if (!course) return 'That item or study source no longer exists.';
+        const plan = planChooseCourseSource(db, course, materialId, itemIds, new Date());
+        if (!plan.ok) return plan.reason;
+        const refusal = identityRefusal({ ...db, materials: plan.materials, items: plan.items });
         if (refusal) return refusal;
-        set((s) => ({ db: { ...s.db, materials, items } }));
+        // Always a write, even when a retry re-states an answer already in
+        // memory: the save it is retrying never reached IndexedDB.
+        set((s) => ({ db: { ...s.db, materials: plan.materials, items: plan.items } }));
         return null;
       },
 
diff --git a/tests/repertoire-experience.browser.test.ts b/tests/repertoire-experience.browser.test.ts
index f812cfae5fb61a523911d9ee429eb5f61391d990..e4e250970573a0ddb041752ae22e279728ca1754 100644
--- a/tests/repertoire-experience.browser.test.ts
+++ b/tests/repertoire-experience.browser.test.ts
@@ -33,6 +33,21 @@ function stateOnly(text: string): string {
   return JSON.stringify(raw);
 }
 
+/**
+ * The current fixture plus a COLLISION an inbound file may legitimately carry:
+ * a custom composer term sharing the spelling «Darvish Khan» with the built-in
+ * درویش‌خان, and a piece written in exactly that spelling — which therefore
+ * reads as ambiguous, literal text.
+ */
+function withCollision(text: string): string {
+  const raw = JSON.parse(text);
+  const at = '2026-09-20T10:00:00.000Z';
+  raw.data.musicTerms.push({ id: 'term-my-darvish', kind: 'composer', name: 'درویش من', aliases: ['Darvish Khan'], createdAt: at, updatedAt: at });
+  const base = raw.data.items.find((i: { id: string }) => i.id === 'it-khatai');
+  raw.data.items.push({ ...base, id: 'it-ambiguous', title: 'رنگ قدیمی', timesPractised: 0, totalMinutes: 0, persian: { composer: 'Darvish Khan' } });
+  return JSON.stringify(raw);
+}
+
 const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
 const until = <T,>(app: PracticeApp, read: (d: Db) => T, ok: (v: T) => boolean) =>
   persistedUntil(app, (s) => read((s.state as { db: Db }).db), ok, 20_000);
@@ -93,10 +108,21 @@ describe('musical terms, managed', () => {
     const { page } = app;
     const term = async (id: string) => (await db(app)).musicTerms.find((t) => t.id === id);
     try {
-      await importBackup(app, 'repertoire-current-v15.json', stateOnly(CURRENT_TEXT));
+      await importBackup(app, 'repertoire-current-v15.json', withCollision(stateOnly(CURRENT_TEXT)));
       expect(await importOutcome(app)).toContain('Imported');
       await goTo(app, '/terms');
 
+      // AMBIGUOUS TEXT IS HELD BY EVERY CLAIMANT: the custom term the piece's
+      // «Darvish Khan» could mean counts it, cannot be deleted (that would hand
+      // the piece to the built-in درویش‌خان), and is not stuck — it archives.
+      await page.getByRole('button', { name: 'Composer / maestro' }).click();
+      const mine = page.locator('.list-row', { hasText: 'درویش من' });
+      expect(await mine.innerText()).toContain('1 piece');
+      expect(await page.getByRole('button', { name: 'Delete درویش من' }).isDisabled()).toBe(true);
+      await page.getByRole('button', { name: 'Archive درویش من' }).click();
+      await until(app, (d) => d.musicTerms.find((t) => t.id === 'term-my-darvish')?.archived, (a) => a === true);
+      await page.getByRole('button', { name: 'Dastgāh / Āvāz' }).click();
+
       // RENAME A BUILT-IN: same id, former name kept as a spelling.
       await page.getByRole('button', { name: 'Edit دستگاه شور' }).click();
       await page.getByRole('textbox', { name: 'Name of دستگاه شور' }).fill('شورِ من');
@@ -180,6 +206,9 @@ describe('musical terms, managed', () => {
       expect(after.musicTerms.find((t) => t.id === 'dastgah:shur')!.name).toBe('شورِ من');
       expect(after.musicTerms.find((t) => t.id === 'term-khatai')!.archived).toBe(true);
       expect(after.items.find((i) => i.id === 'it-khatai')!.persian!.form).toEqual({ termId: 'term-khatai' });
+      // …and the ambiguous piece still reads exactly as written, its term kept.
+      expect(after.items.find((i) => i.id === 'it-ambiguous')!.persian!.composer).toBe('Darvish Khan');
+      expect(after.musicTerms.find((t) => t.id === 'term-my-darvish')!.aliases).toEqual(['Darvish Khan']);
 
       // A FAILED WRITE never says Saved: the draft stays, and Try again writes
       // what is on screen NOW.
@@ -273,9 +302,33 @@ describe('musical terms, managed', () => {
       await page.getByRole('button', { name: /Add default pathway: .*خنیاگر/ }).click();
       await page.getByRole('button', { name: /آزاد میرزاپور/ }).first().click();
       await page.getByRole('link', { name: 'Continue this stage' }).click();
+      const tarItems = async () => (await db(app)).items.filter((i) => i.instrumentId === 'inst-tar').map((i) => i.id);
+      const preexisting = new Set(await tarItems());
       await page.locator('button[title="Add to your items"]').first().click();
       const choice = page.getByRole('region', { name: 'Choose the study source' });
       await choice.waitFor({ timeout: 10_000 });
+      // THE QUESTION IS SAVED DATA, NOT THIS SCREEN'S MEMORY: put off, then
+      // Play (practice starts at once, nothing blocks it), then come back —
+      // and reload — and it is still asked.
+      await expect.poll(async () => (await tarItems()).filter((id) => !preexisting.has(id)).length).toBe(1);
+      const firstId = (await tarItems()).filter((id) => !preexisting.has(id));
+      expect((await db(app)).items.find((i) => i.id === firstId[0])!.materialId).toBeUndefined();
+      const stageUrl = page.url();
+      await choice.getByRole('button', { name: 'Decide later' }).click();
+      await expect.poll(() => choice.count()).toBe(0);
+      await page.locator('button[aria-label^="Practise "]').first().click();
+      await page.waitForURL(/#\/active/, { timeout: 10_000 });
+      await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 10_000 });
+      await page.goto(stageUrl);
+      await choice.waitFor({ timeout: 10_000 });
+      await reload(app);
+      await choice.waitFor({ timeout: 10_000 });
+      // A second Add while it is open joins the SAME question, which names both.
+      await page.locator('button[title="Add to your items"]').first().click();
+      await expect.poll(async () => (await tarItems()).filter((id) => !preexisting.has(id)).length).toBe(2);
+      const waiting = (await tarItems()).filter((id) => !preexisting.has(id));
+      const titles = (await db(app)).items.filter((i) => waiting.includes(i.id)).map((i) => i.title);
+      for (const t of titles) expect(await choice.innerText()).toContain(t);
       await breakStorage(page);
       await choice.getByRole('button', { name: 'خنیاگر' }).first().click();
       await choice.getByText(/Not saved/).waitFor({ timeout: 10_000 });
@@ -288,6 +341,9 @@ describe('musical terms, managed', () => {
         (d) => d.materials.filter((m) => m.instrumentId === 'inst-tar' && m.sourceKey).map((m) => m.id),
         (ids) => ids.length === 1 && khon.includes(ids[0]),
       );
+      // …and the answer reached exactly the items it named.
+      const keyed = (await db(app)).materials.find((m) => m.instrumentId === 'inst-tar' && m.sourceKey)!.id;
+      expect((await db(app)).items.filter((i) => waiting.includes(i.id)).map((i) => i.materialId)).toEqual([keyed, keyed]);
       expect(app.pageErrors.map((e) => e.message)).toEqual([]);
     } finally {
       await app.close();
diff --git a/tests/repertoire-families.test.ts b/tests/repertoire-families.test.ts
index bf93575a37bfa16eb9bfda213135510cc077ef1c..b10c5353024b7300029b194df11bd93525f0c893 100644
--- a/tests/repertoire-families.test.ts
+++ b/tests/repertoire-families.test.ts
@@ -476,7 +476,7 @@ describe('Family A — administration is organisation, never practice evidence',
     run('delete unused custom', () => expect(store().deleteTerm(added)).toBeNull());
     // SOURCE administration.
     run('edit a source', () => store().updateMaterial('mat-song', { title: 'Songbook', sourceType: 'song' }));
-    run('choose a course source', () => store().chooseCourseSource('it-cgs-chords', 'mat-cgs', 'cgs'));
+    run('choose a course source', () => store().chooseCourseSource(['it-cgs-chords'], 'mat-cgs', 'cgs'));
     // REFERENCE and PATHWAY administration.
     run('link', () => expect(store().linkReference(SEED_PATHWAY_IDS.setar, catalogReferenceId('setar-radif-shur', 'daramad-e-shur'), 'it-daramad-a')).toBeNull());
     run('unlink', () => store().unlinkReference('it-daramad-a', catalogReferenceId('setar-radif-shur', 'daramad-e-shur')));
@@ -546,7 +546,7 @@ describe('Family A — administration is organisation, never practice evidence',
     // source, or moving the keyed one onto an instrument that already holds
     // the key, is refused — the other source is never silently un-keyed.
     const copy = store().addMaterial({ instrumentId: 'inst-guitar', title: 'CGS notes', sourceType: 'course' });
-    unchanged('a second source for a keyed course', () => store().chooseCourseSource('it-cgs-chords', copy, 'cgs'), /already this course's study source/);
+    unchanged('a second source for a keyed course', () => store().chooseCourseSource(['it-cgs-chords'], copy, 'cgs'), /already this course's study source/);
     // (Adding from the pathway while it sat on Setar minted Setar's own keyed source.)
     expect(store().db.materials.filter((m) => m.sourceKey === 'course:cgs').map((m) => m.instrumentId).sort()).toEqual(['inst-guitar', 'inst-setar']);
     unchanged('keyed source moved onto a holder', () => store().updateMaterial('mat-cgs', { instrumentId: 'inst-setar' }), /already this course's study source/);
```

**Paths the rework touched:**

- `AGENTS.md`
- `docs/repertoire-experience.md`
- `src/components/ReferenceChoices.tsx`
- `src/components/direction.test.ts`
- `src/domain/courseSeed.ts`
- `src/domain/musicTerms.test.ts`
- `src/domain/musicTerms.ts`
- `src/domain/studySources.test.ts`
- `src/pages/MusicTerms.tsx`
- `src/pages/StageDetail.tsx`
- `src/store/useStore.ts`
- `tests/repertoire-experience.browser.test.ts`
- `tests/repertoire-families.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
31822af Rework: close the course-source and term-reclassification families

Family 1 — a course's study-source question stays answerable on every Add
and Start path.
Invariant: while a course's source is ambiguous on an instrument, every item
of that course with no source is waiting on the owner, and that fact is read
from saved data, never held by a screen.
Choke point: courseSourceQuestions (courseSeed.ts) derives the question —
course read from the item's references, not its placement — and
planChooseCourseSource writes the answer to exactly the items it named
(a sourceless course item looks the same as one the owner cleared, so
nothing unnamed is filled in; a retry restates the same answer).
Consumers:
- findCourseSource / resolveCourseSource: detect ambiguity — unchanged, checked.
- planCatalogAddition: created path and the bound (repeat Add) fast path both
  return the derived candidates; the fast path still writes nothing. Fixed.
- useStore.addFromCatalog: passes them through. Checked.
- useStore.chooseCourseSource: now takes the named item ids, applies the pure
  planner, keeps the sourceKeyClash/identityRefusal guard. Fixed.
- StageDetail: the SourceChoice is rendered from the derived question, so
  Play, "Decide later", leaving the page and reload lose nothing; a held copy
  keeps a failed save and its Try again on screen. practise() starts at once
  and the question waits on the stage. Fixed.
- SourceChoice: names the items the answer goes to. Fixed.
Proof: 'study sources clarify new choices without rewriting legacy meaning'
(reload round trip, repeat Add, moved item, two items, answer/retry, only
named items, cross-instrument refusal) and the ac-4 browser journey (Add,
Decide later, Play, come back, reload, second Add joins, answer reaches both).

Family 2 — a vocabulary edit never silently reclassifies an unedited item.
Invariant: an update or delete may not change what any item's stored value
means, except literal text gaining a term (what adding a spe
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Legacy/current/partial v15 fixtures migrate identically across clocks and repeated runs, preserve authored strings and IDs, leave deliberately empty collections empty and handle pre-v3 seeding deterministically. No new deletion waiver. _(proof: repertoire v15 migration is deterministic idempotent and lossless)_
- [ ] **ac-2** — Wrong types, duplicate new IDs, wrong-kind/dangling term refs and invalid binding/suppression records refuse installation, while unknown/ambiguous legacy strings remain exact and usable. _(proof: repertoire identity validation refuses malformed state without discarding legacy evidence)_
- [ ] **ac-3** — Curated unique aliases group Shur and شور; ambiguous names, composites and substrings never establish identity. Renamed and archived terms retain stable references; broader search matching does not change ownership. _(proof: musical term resolution separates exact identity from broad search)_
- [ ] **ac-4** — Real add/rename/alias/archive/restore/delete controls preserve references across reload, refuse referenced/built-in deletion and alias collisions, and retain drafts through failed acknowledged saves and retry. _(proof: musical term management preserves identities and reports durable saves honestly)_
- [ ] **ac-5** — Combined query/facets find terms, maestros, sources, raw text and existing archive aliases; title-only Persian full pieces remain visible, parents occur once, matching parts expose their parent and empty results are clear. _(proof: repertoire discovery includes every eligible work without duplicate parents)_
- [ ] **ac-6** — Rendered My repertoire, All practice items and Start share text matching but retain eligibility differences; switching views and back/forward preserve browse state without changing Today's session instrument. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-7** — Reference Add/Start/row/progress/course-file consumers agree after detach, move, stage/path deletion and reload; repeat stale Add reuses one item; same generic keys across distinct contexts never conflate. _(proof: catalogue identity survives placement changes across every consumer)_
- [ ] **ac-8** — Link existing preserves all owner fields; ambiguous legacy matches and duplicates require an explicit choice, never first-match/title merging. Several references can deliberately reuse one item; cross-instrument reuse refuses. _(proof: catalogue linking preserves owner records and refuses ambiguous automatic reuse)_
- [ ] **ac-9** — Hiding/restoring survives reload and backup round trip, affects only reference visibility in its context, preserves explicitly placed and owned work, and keeps progress/next suggestion consistent without treating hidden work as done. _(proof: hidden reference suggestions never delete or complete owned practice)_
- [ ] **ac-10** — Existing additive installation restores only missing selected defaults/stages, preserves edited rows and routines and never auto-reseeds on load. Archive/restore and repeated no-op actions are idempotent. _(proof: pathway restoration remains explicit additive and lossless)_
- [ ] **ac-11** — Unlink reference and Remove from pathway retain notes, attachments, lesson/agenda/routine links, children, reviews and all history, even for a new never-practised item. No catalogue shortcut calls automatic item deletion. _(proof: pathway removal keeps enriched and never practised owner items)_
- [ ] **ac-12** — One shared contextual Persian catalogue yields independent Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items receive modal metadata, and existing Guitar/Honarestan/Khonyagar work/material identities remain intact. _(proof: Setar and Tar share reference definitions without sharing practice state)_
- [ ] **ac-13** — Upgrade leaves the old mixed Setar path, generic-form items, text, pins and routines unchanged. Explicitly adding the new radif view reuses proven bindings; Forms derives actual works from the term vocabulary and creates no generic form item. _(proof: new Persian reference views preserve existing Setar organisation)_
- [ ] **ac-14** — Today, both SessionPlan derivations, Repertoire and PathwayDetail use the same visible ordered pathway and pinned stage, including archived/deleted pins and equal-order tie cases, without changing scheduling decisions. _(proof: pathway context readers agree on visible routes and pinned stages)_
- [ ] **ac-15** — New source choices describe collections/materials; legacy kinds and hidden fields survive edit/export, session instrument defaults correctly, and known course-source renames reuse stable provenance while ambiguous candidates require choice. _(proof: study sources clarify new choices without rewriting legacy meaning)_
- [ ] **ac-16** — Every inbound door installs valid v15 and legacy fixtures consistently and refuses malformed/unsupported state before replacement: full/state-only import, fake-remote pull, Keep remote, archive restore, cold recovery and both hydration paths. Preserve existing byte/session/revision guards. _(proof: every inbound door enforces the repertoire v15 boundary)_
- [ ] **ac-17** — Export/import and content hashing preserve terms/bindings/hides and custom strings. A disposable baseline v14 reader refuses a v15 backup without replacing state/blobs; current reader accepts prior backups. _(proof: repertoire backups round trip and older readers refuse v15 safely)_
- [ ] **ac-18** — Source metadata adoption understands term-backed and literal fields while retaining raw source facts, owner edits and stale-premise refusals; archive identity/location/refresh outcomes remain unchanged for existing fixtures. _(proof: musical metadata integration preserves archive reconciliation boundaries)_
- [ ] **ac-19** — Actual rendered Chromium/WebKit phone and desktop journeys exercise browse/edit/add/link/hide/restore/Tar/source/term flows plus Today/Start/Active/Close, reload/offline/failure states and all pageerrors. Assert real saved state as well as UI. _(proof: the unified repertoire journey works in Chromium and WebKit)_
- [ ] **ac-20** — Chosen viewport mechanism handles retained focus, blur, repeated geometry changes, zoom, absent VisualViewport, route teardown and hardware-keyboard geometry without timer guesses, forced blur or scrolling loops. Expected geometry is fixture-authored, not copied from implementation. _(proof: viewport recovery respects focus zoom and scroll ownership)_
- [ ] **ac-21** — Both engines demonstrate mixed-script wrapping, labelled controls, keyboard access, focus visibility, theme contrast, reflow and accessible empty/error states at phone/desktop widths; Today preserves the owner's ordering and visible recommendation. _(proof: the shared practice shell remains accessible and readable across layouts)_
- [ ] **ac-22** — Before/after projections for term/source/reference/pathway administration leave practice history, item status/ratings/SM-2/dates, notes, reviews, agenda and unfinished block/routine/plan untouched apart from explicitly chosen organisation fields. _(proof: repertoire administration never fabricates or resets practice evidence)_
- [ ] **ac-23** — Before first review, inspect the committed consumer/invariant matrix, independent fixture expectations and reproducible focused runner; every acceptance title maps to exactly one test, both engines actually ran, and proof limits are explicit. _(proof: manual:OWNER)_
- [ ] **ac-24** — On the owner's actual iPhone Safari and installed PWA, record device/iOS version and before/after viewport traces, keyboard Done with retained focus, repeated opening/dismissal, scroll, rotation, route change, background/resume and zoom. Verify no residual lifted bar, occluded editing or lost text. Without device evidence this remains outstanding. _(proof: manual:OWNER)_
- [ ] **ac-25** — Review the coherent phone/desktop journey and partial radif labels against source evidence. Confirm useful Forms browsing, maestro discovery, screen-reader/keyboard operation, Plan then Routines ordering and start/close budgets. Keep a pre-upgrade full backup; approve migration on a disposable copy before any real upgrade. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/selectors.ts
- **log-a-class** — touched via src/domain/selectors.ts, src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/StartBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/io.ts
- **sync-devices-via-github** — touched via src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts matched changed file(s) src/domain/farsi.ts, src/domain/persian.ts, src/domain/repertoire.ts, src/pages/ItemDetail.tsx, src/pages/Materials.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/pages/NewItem.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts, src/domain/selectors.ts matched changed file(s) src/domain/selectors.ts, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/selectors.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/StartBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/StartBlock.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/App.tsx matched changed file(s) src/App.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts, src/pages/Repertoire.tsx matched changed file(s) src/domain/pathwaySeed.ts, src/domain/pathways.ts, src/pages/PathwayDetail.tsx, src/pages/Repertoire.tsx, src/pages/StageDetail.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings, the service worker, the update banner and the build stamp are untouched; the shared /settings route is only where another flow's page lives.

## point-this-device-at-the-nas — unchanged

The per-device media base, its normalisation and Settings are untouched; course material still resolves through the same mediaRoot/baseForItemFile path, only its catalogue key lookup now goes through a stable reference id.

## prepare-for-the-next-class — unchanged

lessonAgenda, its queries, ClassQuestions and LessonAgenda are untouched; PracticeItem only gains an optional catalogRefs list and term-aware metadata, neither of which the agenda or lesson urgency reads.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now (update proposed)

Proposed step changes:
− The musician Chooses 'My repertoire'.
−   Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
−   Changes: Nothing; this is a lens over ordinary items, not a separate store.
− Practice Compass Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
−   Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.
− The musician Optionally filters by form, or narrows to one instrument.
−   Shows: Form chips built from what is actually present.
− The musician Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
−   Shows: Items in priority order, each with its status and stats.
− The musician Opens an item.
−   Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
−   Changes: Nothing until an action is taken there.
+ The musician Opens Repertoire, or picks one of the three peer views: My repertoire, Pathways or Practice list, and one instrument (or All).
+   Shows: Works grouped by dastgāh (Persian) or study source (others); unclassified works under "No dastgāh yet"; each work once, parts nested.
+   Changes: Nothing but the URL: view, instrument, query and filters live there, and Today's session instrument is never changed.
+ Practice Compass Groups each classifying value by the shared vocabulary: a term reference, or text that is exactly one curated spelling of a term, joins that term; composites and unknown spellings stay the owner's own text.
+   Shows: «Shur» and «شور» in one group labelled with the term's name; the owner's text is never rewritten.
+ The musician Searches (title, gusheh, dastgāh/form/maestro in any spelling, study source, archive aliases) and narrows by Dastgāh, Form or Composer, or regroups by form, composer or source.
+   Shows: Facets built only from the works actually owned; a matching part shows its parent once; "No works match" with Clear filters when nothing does.
+ The musician Or chooses Practice list and filters by the same search, status, type or a quick chip.
+   Shows: Every practice item in priority order, parts included, under Practice list's own eligibility.
+ The musician Opens an item, then comes back by its back link or browser back.
+   Shows: The same view, instrument, query and filters as before.

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

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
− Practice Compass Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
−   Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.
− The musician Taps + on a suggestion.
−   Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
−   Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.
− The musician Undoes it, or removes it later from the row's − button, if it was added by mistake.
−   Shows: The row reverts to a suggestion.
−   Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.
+ Practice Compass Shows the stage's rows: the owner's items laid over the stage's reference suggestions, each suggestion resolved to the owner's item by its reference binding on the pathway's instrument — never by where the item sits.
+   Shows: 'n/m solid' over the visible rows; suggestions hidden in this pathway are omitted; two legacy copies answering one suggestion show as a choice.
+ The musician Taps + on a suggestion.
+   Shows: 'Added … — not practised yet.' The row now plays that item.
+   Changes: A practice item is created bound to the suggestion's reference; tapping again, after a move or a reload, hands back the same item — adding is organisation, not progress.
+ The musician Optionally uses a row's ⋯ menu: Link an existing item, Unlink reference, Remove from pathway, or Hide this suggestion (restored from 'Hidden suggestions').
+   Changes: Only organisation: Link sets one item's binding (same instrument only); Unlink drops one binding; Remove from pathway clears placement and hides the suggestion in this pathway; Hide is visibility only. Nothing is deleted — Delete practice item stays on the item's own page.
  The musician Taps ▶ on a row to practise it.
    Shows: The ordinary active block.
    Changes: A suggestion not yet added is added first, then the block opens.
− The musician Optionally pins the stage as the current one, or edits its code, title and intro.
−   Shows: Today's 'Now in:' card points at the pinned stage.
−   Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.
+ The musician Optionally pins the stage as the current one, edits it, or archives/restores the pathway.
+   Shows: Today, the Session Plan and Repertoire follow the same visible pathway and pinned stage.
+   Changes: The pathway records the pin or its archived state; deleting a stage or pathway detaches items instead of deleting them.

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260928-unify-repertoire-discovery-musical-metad-1516' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
