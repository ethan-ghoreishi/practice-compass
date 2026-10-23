---
id: 20261023-make-practice-records-dependable-and-kee-34cc
contractId: 20261023-make-practice-records-dependable-and-kee-34cc
patchId: 89fc828ee3e5386153d2602cb21bdd0cd9f94bee
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: notes-recovery-idempotence
    summary: "P2: Overlapping note-save acknowledgements leave stale recovery bases
      and can delete a newer draft by text alone (ItemNotes.tsx:167-175,241;
      notesDrafts.ts:44-47; useStore.ts:2618-2626). Recovery must reproduce the
      latest owner draft exactly once."
    counterexample: "Both item and lesson owners: hold save A, type A plus more,
      acknowledge A, refuse the automatically queued newer write, then reload.
      The recovery copy still has the pre-A base, so replay appends A plus more
      to A; a previously kept-both save duplicates both competing texts. Also
      queue saves first then second, type first again before either
      acknowledgement, acknowledge first then second, and refuse the resulting
      third write. The old first acknowledgement drops the newest first draft;
      disk holds second and reload loses the latest first edit. Affects
      ItemDetail, ActiveBlock and RoutineRunner through ItemNotes, and Lessons
      through LessonNotes/DurableNotes, plus hydration replay. Checked clean:
      ordinary and conflicting save failure followed by successful Try again,
      item/lesson id separation, and gone-record refusal. Extend the exact test
      working note saves preserve newest text and refuse stale ownership across
      failures and replacement with both acknowledgement/failure/reload
      sequences for both owners; rework the entire recovery-base and draft-drop
      family."
createdAt: 2026-10-23T23:00:46.867Z
sealedAt: 2026-10-23T23:08:48.464Z
---

# Review: Make practice records dependable and keep session choices aligned with the work being done

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261023-make-practice-records-dependable-and-kee-34cc
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/56
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `89fc828ee3e5386153d2602cb21bdd0cd9f94bee`
- **Computed by:** prismatica 0.11.0 · build sha256:a53354b36e378c8f · installed package, not registry-verified

## The Delta this change was framed from

# Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

_approved · about "practise-todays-recommendation"_

## Today

The practice loop stores unscoped results and uses them for item-wide status/spacing; routine time is separate from optional capture but skip credits any positive elapsed interval, contents are opaque, notes require Done, plan order cannot be edited, and class/theory opportunities are not consistently integrated.

## Instead

Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

## Keep

- r-local-first-offline
- r-no-silent-data-loss
- r-practice-completes-reviews
- r-explainable-scheduling
- r-pure-tested-domain
- r-one-instrument-per-session
- r-quick-start
- r-direction-aware-text
- r-no-gamification
- r-secrets-stay-on-device
- r-large-files-stay-on-nas

## New assumptions

_none_

## Show me

The named acceptance families below, using a two-item Setar Warm up created through the real UI, literal long-gap chunk/class counterexamples, failure/reload/restore states and Chromium plus WebKit histories; one focused proof route, full required checks and one bounded native-device observation.



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

**Approved intent:** `.prismatica/intents/20261023-make-practice-records-dependable-and-kee-34cc.md`

**Findings from the previous review:**

- **notes-recovery-idempotence** — P2: Successful retry after a failed conflicting-note save leaves a recovery draft which reload appends again (ItemNotes.tsx:156-163; notesDrafts.ts:44-47; useStore.ts:2614-2618).
  _counterexample:_ Edit original to local draft; replace stored notes with remote words; fail autosave; repair storage; Try again; reload. Expected both texts once. Actual local draft appears twice. Reproduced for item and lesson owners. Affects ItemDetail, ActiveBlock, RoutineRunner and Lessons through DurableNotes; plain retry, owner typing and gone-record refusal checked clean. Extend exact test: working note saves preserve newest text and refuse stale ownership across failures and replacement.
- **session-unused-time-accounting** — P2: planRunTime omits time freed by early completion from running and completed summaries (plan.ts:971-980; SessionPlan.tsx:391-393).
  _counterexample:_ Start two 10-minute entries in a 20-minute Plan. Save the first after 2 minutes: remaining=10, recorded=2, unused=0 instead of 8. Save the second after 3 minutes: unused=0 instead of 15. Also affects partial completion followed by skip and restored runs. Preview removal, whole-entry skip and Routine move-on checked clean. Extend exact test: routine controls distinguish skipped time from partial practice across run transitions; cover the rendered ac-5 journey.
- **parent-part-opportunity-exclusion** — P2: swapSegment omits the parent/part exclusion applied by build and Today (plan.ts:857-874).
  _counterexample:_ Generate 30 minutes with usable technique items parent importance 5, child importance 4 bound to parent, and other importance 1; difficulty 3 each, no blocks/reviews. Build gives other warm-up 4 minutes plus parent focus 25. Swap other gives child plus parent without a separately due review. Reverse the importance values to reproduce the opposite direction. Shared swap eligibility is affected; build/regeneration, Today, move/remove and their due-review exception checked clean. Extend exact test: class preparation and shared recommendation pools return useful work without repetition noise.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/practice-session-model.md b/docs/practice-session-model.md
index 76d658900ebe4f0353b55636a15d69cbf3e86bea..e38aed2075e586d4917a9d11c62b08b36c8d95f4 100644
--- a/docs/practice-session-model.md
+++ b/docs/practice-session-model.md
@@ -91,7 +91,8 @@ anything practised today — a routine's unassessed block included, a class
 commitment included — steps aside while anything else is eligible; with
 nothing else eligible the pool repeats today's work and every reason says so.
 A piece and its own part are one intended work (`sameWork`): one card or
-segment, unless the other has its own due review. Urgency outranks variety:
+segment, unless the other has its own due review — a swap included, judged
+against the segments that stay. Urgency outranks variety:
 diversity and the theory turn act only in a plan's middle picks.
 
 ## 6. Theory / listening study
@@ -131,7 +132,9 @@ target. An earlier real occurrence of a repeated routine item survives skipping
 a later one. A legacy run (no `skipped` flags) keeps its old skip credit.
 
 Time figures, each separate: Plan `planRunTime` → available / planned /
-remaining / unused / recorded; Routine `routineRunTime` → planned / remaining /
+remaining / unused / recorded (a done segment occupies what it actually took,
+up to its target, so finishing early frees the rest as unused); Routine
+`routineRunTime` → planned / remaining /
 unused (seconds), recorded = `aggregateItemMinutes`.
 
 ## 8. Notes without a Done dependency
@@ -148,7 +151,10 @@ same text → nothing; stored text unchanged since `base` → replaced; stored t
 changed underneath (sync, import, restore, another editor) → BOTH kept, stored
 first, then this text under `KEPT_DRAFT_HEADING`; record gone → nothing written,
 draft kept on the device. After a reload, held drafts replay through the same
-decision before the app opens. Item and lesson ids never share a draft.
+decision before the app opens. Item and lesson ids never share a draft. When a
+write kept both texts, the device copy becomes that kept-both text, based on
+what the store held, so a retry or a reload never replays the old draft onto it
+a second time.
 
 ## 9. Data and compatibility
 
diff --git a/src/components/ItemNotes.tsx b/src/components/ItemNotes.tsx
index 7589c81007d69840895098d827e86fe0a91216a9..c6607f095843f52f59445251b572f9413fcfb9cc 100644
--- a/src/components/ItemNotes.tsx
+++ b/src/components/ItemNotes.tsx
@@ -142,6 +142,7 @@ export function DurableNotes({
       if (savedTimer.current) clearTimeout(savedTimer.current);
       setState({ phase: 'saving' });
     }
+    const prior = storedNotes(d.owner);
     const outcome: NoteSaveOutcome = saveNotes(d.owner, d.text, d.base);
     if (outcome === 'gone') {
       if (speak && saveSeq.current === seq) setState({ phase: 'failed', message: 'this record no longer exists, so nothing was written.' });
@@ -154,13 +155,16 @@ export function DurableNotes({
     // typed next is based on it — and when both texts were kept, the editor
     // shows what the record now holds.
     const after = outcome === 'merged' ? storedNotes(d.owner) : d.text;
+    // The store re-held the device copy as the kept-both text over `prior`;
+    // what is typed next is held over the same base.
+    if (outcome === 'merged') durable.current = prior;
     const current = draftRef.current;
     if (current && keyOf(current.owner) === keyOf(d.owner)) {
       applyDraft({ ...current, base: after, ...(outcome === 'merged' ? { text: after } : {}) });
     }
     void storageSettled().then(
       () => {
-        dropNoteDraft(d.owner, d.text);
+        dropNoteDraft(d.owner, after);
         if (speak && saveSeq.current === seq) durable.current = after;
         if (!speak || saveSeq.current !== seq) return;
         const now = draftRef.current;
diff --git a/src/domain/plan.ts b/src/domain/plan.ts
index 600a1db36dec447502c197949726912221a41c02..5ea9584ecf1605179b6d9101185d3686c540601d 100644
--- a/src/domain/plan.ts
+++ b/src/domain/plan.ts
@@ -835,6 +835,10 @@ export function swapSegment(
   const { pool, isRepeatPool } = candidatePool(scored, blocks, args.now);
 
   const inUse = new Set(plan.segments.map((s) => s.itemId));
+  // The build's own rule: a piece and its own part are one intended work, so
+  // a swap never brings in a relative of another segment unless its own
+  // review is due.
+  const kept = items.filter((i) => plan.segments.some((s, j) => j !== index && s.itemId === i.id));
   const exclude = args.excludeIds ?? new Set<string>();
   const dueById = new Map(
     dueReviews(args.reviews, args.now)
@@ -856,6 +860,7 @@ export function swapSegment(
         : target.minutes;
   const eligible = (s: ItemScore): boolean => {
     if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
+    if (kept.some((k) => sameWork(k, s.item)) && !hasDueReview(s.item, args.now)) return false;
     if (plan.segments.length > 1 && segmentFloor(s.item) > room) return false;
     switch (target.bucket) {
       case 'warmup':
@@ -963,19 +968,23 @@ export function skipPlanSegment(run: PlanRun, index = run.pointer): PlanRun {
 
 /**
  * The run's time, each figure on its own: `available` is the budget chosen,
- * `planned` what the segments still standing ask for, `remaining` what the
- * pending ones ask for, `unused` what nothing asks for (removed, skipped or
+ * `planned` what the segments still standing ask for (a done one: what it
+ * actually took, up to its target), `remaining` what the pending ones ask
+ * for, `unused` what nothing asks for (removed, skipped, finished early or
  * never planned), `recorded` what was actually saved. Recorded is never
- * inferred from a target.
+ * inferred from a target, and overtime never borrows another segment's.
  */
 export function planRunTime(run: PlanRun): { available: number; planned: number; remaining: number; unused: number; recorded: number } {
-  const sum = (status: PlanSegmentStatus[]) =>
-    run.segments.filter((s) => status.includes(s.status)).reduce((n, s) => n + s.minutes, 0);
-  const planned = sum(['pending', 'done']);
+  const remaining = run.segments.filter((s) => s.status === 'pending').reduce((n, s) => n + s.minutes, 0);
+  // A done segment from before `actualMinutes` was kept occupies its target: nothing is claimed freed.
+  const taken = run.segments
+    .filter((s) => s.status === 'done')
+    .reduce((n, s) => n + Math.min(s.minutes, s.actualMinutes ?? s.minutes), 0);
+  const planned = remaining + taken;
   return {
     available: run.budgetMinutes,
     planned,
-    remaining: sum(['pending']),
+    remaining,
     unused: Math.max(0, run.budgetMinutes - planned),
     recorded: run.segments.reduce((n, s) => n + (s.status === 'done' ? (s.actualMinutes ?? 0) : 0), 0),
   };
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index e253f182f235a187cb3f472edb3e3aa6775dbf71..da347b37f995f796584fdfa45da8b100122d24b2 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -1,7 +1,7 @@
 import { create } from 'zustand';
 import { createJSONStorage, persist } from 'zustand/middleware';
 import { clearBlobs, deleteBlob, idbStorage, storageSettled, storageWasEmpty } from './idb';
-import { dropNoteDraft, heldNoteDrafts } from './notesDrafts';
+import { dropNoteDraft, heldNoteDrafts, holdNoteDraft } from './notesDrafts';
 import { withRevision } from './revision';
 import { primePracticeSound } from '../components/practiceCue';
 import {
@@ -1893,6 +1893,10 @@ export const useStore = create<StoreState>()(
               : { lessons: s.db.lessons.map((l) => (l.id === owner.id ? touch({ ...l, notes: notes || undefined }, now) : l)) }),
           },
         }));
+        // The competing text is now accounted for: the device copy becomes the
+        // kept-both text, typed over what was stored, so neither a retry nor a
+        // reload replays the old draft against it a second time.
+        if (merged) holdNoteDraft(owner, { text: notes, base: record.notes ?? '' });
         return merged ? 'merged' : 'written';
       },
 
@@ -2613,9 +2617,13 @@ export const useHydrationStatus = create<HydrationStatus>(() => ({
  */
 function replayNoteDrafts() {
   for (const { owner, draft } of heldNoteDrafts()) {
-    if (useStore.getState().saveNotes(owner, draft.text, draft.base) === 'gone') continue;
+    const outcome = useStore.getState().saveNotes(owner, draft.text, draft.base);
+    if (outcome === 'gone') continue;
+    const { db } = useStore.getState();
+    const record = owner.kind === 'item' ? db.items.find((i) => i.id === owner.id) : db.lessons.find((l) => l.id === owner.id);
+    const written = outcome === 'merged' ? (record?.notes ?? '') : draft.text;
     void storageSettled().then(
-      () => dropNoteDraft(owner, draft.text),
+      () => dropNoteDraft(owner, written),
       () => undefined,
     );
   }
diff --git a/tests/practice-session-families.test.ts b/tests/practice-session-families.test.ts
index 7ef521bab206889df576ea9e827af002b888fcfe..a2bbf36c24534bddafc01ca62a015bb02e31f665 100644
--- a/tests/practice-session-families.test.ts
+++ b/tests/practice-session-families.test.ts
@@ -347,6 +347,34 @@ describe('the shared session-control policy', () => {
     useStore.getState().skipPlanSegment(0);
     expect(useStore.getState().activePlan!.segments[0].status).toBe('done');
 
+    // EARLY COMPLETION frees the rest of that target: unused, never handed on.
+    // 20′ available, two 10′ entries. Saved after 2′: 10 left, 2 recorded,
+    // 20 − (2 + 10) = 8 unused. Saved after 3′: 20 − (2 + 3) = 15 unused.
+    const twoTens: SessionPlan = { ...plan, budgetMinutes: 20, segments: [seg('warm', 10, 'warmup'), seg('chahar', 10, 'lesson')] };
+    const closeAfter = (minutes: number) => {
+      useStore.getState().beginPlanSegment();
+      useStore.getState().closeSession({ result: 'same', durationMinutes: minutes, answer: 'scheduled', now: NOW });
+    };
+    seed(planDb);
+    useStore.getState().startPlan(twoTens);
+    closeAfter(2);
+    expect(planRunTime(useStore.getState().activePlan!)).toEqual({ available: 20, planned: 12, remaining: 10, unused: 8, recorded: 2 });
+    // A RESTORED run (the persisted shape, round-tripped) reads the same figures.
+    const restored = JSON.parse(JSON.stringify(useStore.getState().activePlan)) as typeof run;
+    expect(planRunTime(restored)).toEqual({ available: 20, planned: 12, remaining: 10, unused: 8, recorded: 2 });
+    closeAfter(3);
+    run = useStore.getState().activePlan!;
+    expect([run.pointer, planRunTime(run)]).toEqual([2, { available: 20, planned: 5, remaining: 0, unused: 15, recorded: 5 }]);
+    // Partial practice, then Skip the next: 20 − 2 = 18 unused, 2 recorded.
+    seed(planDb);
+    useStore.getState().startPlan(twoTens);
+    closeAfter(2);
+    useStore.getState().skipPlanSegment();
+    expect(planRunTime(useStore.getState().activePlan!)).toEqual({ available: 20, planned: 2, remaining: 0, unused: 18, recorded: 2 });
+    // A done segment with no recorded figure (an older run) claims nothing freed.
+    const older = { ...restored, segments: restored.segments.map((x) => ({ ...x, actualMinutes: undefined })) };
+    expect(planRunTime(older)).toEqual({ available: 20, planned: 20, remaining: 10, unused: 0, recorded: 0 });
+
     // Skip a LATER pending entry while running: the current one is untouched.
     seed(planDb);
     useStore.getState().startPlan(plan);
@@ -728,6 +756,29 @@ describe('class preparation and the shared pool', () => {
     expect([recs2.best, recs2.quickWin, recs2.maintenance].filter(Boolean).map((r) => r!.score.item.id).sort()).toEqual(['p', 'p-part']);
     const planned = buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 30, now: NOW, items: [P, part, Q, R], blocks: [], reviews: [], preparationDates: dates() });
     expect(planned.segments.filter((s) => s.itemId === 'p' || s.itemId === 'p-part')).toHaveLength(1);
+    // … and a SWAP keeps that rule, in both directions: swapping the other
+    // entry never brings in the relative of the one that stays.
+    for (const [parentImportance, childImportance] of [[5, 4], [4, 5]] as const) {
+      const tech = (id: string, importance: number, over: Partial<PracticeItem> = {}) => item(id, id, { itemType: 'technique', importance, ...over });
+      const family = [tech('parent', parentImportance), tech('child', childImportance, { parentItemId: 'parent' }), tech('other', 1)];
+      const anchor = parentImportance > childImportance ? 'parent' : 'child';
+      const args = { instrumentId: SETAR, now: NOW, items: family, blocks: [], reviews: [] };
+      const built = buildSessionPlan({ ...args, budgetMinutes: 30 });
+      expect(built.segments.map((x) => [x.itemId, x.minutes]), anchor).toEqual([['other', 4], [anchor, 25]]);
+      // No other candidate: the slot keeps what it had rather than repeat the work.
+      expect(swapSegment(built, 0, args).segments.map((x) => x.itemId), anchor).toEqual(['other', anchor]);
+      // A relative whose OWN review is due is a distinct need: never spent as
+      // a warm-up, but it may take a deep slot beside the work.
+      const relative = anchor === 'parent' ? 'child' : 'parent';
+      const dueFamily = family.map((i) => (i.id === relative ? { ...i, nextReviewDate: TODAY, nextReviewSource: 'auto' as const } : i));
+      const dueRow = [{ id: 'due-row', practiceItemId: relative, dueDate: TODAY, reviewType: 'retention' as const, createdAt: T, updatedAt: T }];
+      const due = { ...args, items: dueFamily, reviews: dueRow };
+      expect(swapSegment(built, 0, due).segments.map((x) => x.itemId), anchor).toEqual(['other', anchor]);
+      const deep = (itemId: string): PlanSegment => ({ itemId, title: itemId, minutes: 10, bucket: 'deep', core: false, mode: 'learn', focus: 'other', reason: '', floorMinutes: 2 });
+      const twoDeep: SessionPlan = { instrumentId: SETAR, budgetMinutes: 20, segments: [deep(anchor), deep('other')], summary: '', generatedAt: T };
+      expect(swapSegment(twoDeep, 1, args).segments.map((x) => x.itemId), anchor).toEqual([anchor, 'other']);
+      expect(swapSegment(twoDeep, 1, due).segments.map((x) => x.itemId), anchor).toEqual([anchor, relative]);
+    }
     // Urgency first: the class anchor leads a short plan.
     expect(buildSessionPlan({ instrumentId: SETAR, budgetMinutes: 10, now: NOW, items: [P, Q, R], blocks: [], reviews: [], preparationDates: dates() }).segments.map((s) => s.itemId)).toEqual(['p']);
   });
diff --git a/tests/practice-session.browser.test.ts b/tests/practice-session.browser.test.ts
index 7db378d65f5d8569e9fee9de6aefe35b8aebe023..55ceefcf5db77d94f0bcb02b1e097c0001afc66e 100644
--- a/tests/practice-session.browser.test.ts
+++ b/tests/practice-session.browser.test.ts
@@ -2,9 +2,15 @@ import { describe, expect, it } from 'vitest';
 import type { Page } from 'playwright';
 import { buildSessionPlan, createItem, isWork, SCHEMA_VERSION, type PracticeBlock, type PracticeItem } from '../src/domain';
 import { RESULT_LABELS } from '../src/domain/labels';
+import { hashState } from '../src/domain/canonical';
 import {
+  connectSync,
   goTo,
   importBackup,
+  installFakeGitHub,
+  newFakeRemote,
+  publishRemote,
+  remoteStateText,
   importOutcome,
   openPracticeApp,
   persistedDb,
@@ -429,7 +435,12 @@ describe('plan and routine controls', () => {
           await page.getByRole('button', { name: 'Finish' }).click();
           await page.getByRole('button', { name: 'Save without a result' }).click();
           await page.getByRole('button', { name: `Start ${moved[1]}` }).waitFor();
-          expect(await page.locator('main').innerText(), where).toContain('1 min recorded');
+          // Finishing early frees the rest of that target as UNUSED: 1′ of
+          // keptMinutes[0] taken, the others still ask for theirs.
+          const left = keptMinutes.slice(1).reduce((n, m) => n + m, 0);
+          expect(await page.locator('main').innerText(), where).toContain(
+            `${left} min left of ${left + 1} planned · ${45 - left - 1} of 45 unused · 1 min recorded`,
+          );
           // Skip a LATER pending entry: it records nothing; the rest keep their minutes.
           const running = moved.slice(0, -1);
           await page.getByRole('button', { name: `Skip ${running.at(-1)}` }).click();
@@ -440,6 +451,11 @@ describe('plan and routine controls', () => {
           await page.getByRole('button', { name: 'Skip this one — save nothing' }).click();
           await page.getByRole('button', { name: 'End the plan' }).waitFor();
           expect((await db(app)).blocks.map((b) => [b.practiceItemId, b.durationMinutes]), where).toEqual([[await idOf(app, moved[0]), 1]]);
+          // Only the entries between the skipped ones still ask for time.
+          const leftEnd = keptMinutes.slice(2, -1).reduce((n, m) => n + m, 0);
+          expect(await page.locator('main').innerText(), where).toContain(
+            `${leftEnd} min left of ${leftEnd + 1} planned · ${45 - leftEnd - 1} of 45 unused · 1 min recorded`,
+          );
           await page.getByRole('button', { name: 'End the plan' }).click();
           await page.getByRole('navigation', { name: 'Primary' }).waitFor();
 
@@ -743,6 +759,104 @@ describe('notes without a Done dependency', () => {
         await writePersistedState(app, { ...beforeDelete, db: { ...beforeDelete.db, items: beforeDelete.db.items.filter((i) => i.id !== FRESH) } }, SCHEMA_VERSION);
         await reload(app);
         expect((await db(app)).items.map((i) => i.id).sort(), engine).toEqual([CHAHAR, CLASS_ITEM, PIECE, WARM, TWIN, DUE].sort());
+
+        const kept = (theirs: string, mine: string) => `${theirs}\n\n— Also typed on this device (kept, not merged) —\n${mine}`;
+
+        // --- A REPLAYED draft kept both, its own write refused at load --------
+        // A later ordinary write makes the kept-both text durable anyway; the
+        // next reload must not replay the old draft onto it a second time.
+        await page.addInitScript(() => {
+          if (!localStorage.getItem('pc-test-refuse-writes')) return;
+          const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
+          proto.__realPut = proto.put;
+          proto.put = function failing() {
+            throw new DOMException('storage is full', 'QuotaExceededError');
+          };
+        });
+        await goTo(app, `/items/${CLASS_ITEM}`);
+        await editShownNotes(page);
+        await breakStorage(page);
+        await notesBox(page).fill('my class-item words');
+        await goTo(app, '/repertoire');
+        await repairStorage(page);
+        const under = (await readPersistedState(app)).state as { db: Db };
+        await writePersistedState(
+          app,
+          { ...under, db: { ...under.db, items: under.db.items.map((i) => (i.id === CLASS_ITEM ? { ...i, notes: 'their class-item words' } : i)) } },
+          SCHEMA_VERSION,
+        );
+        await page.evaluate(() => localStorage.setItem('pc-test-refuse-writes', '1'));
+        await reload(app);
+        await repairStorage(page);
+        await page.evaluate(() => localStorage.removeItem('pc-test-refuse-writes'));
+        await goTo(app, `/items/${PIECE}`);
+        await editShownNotes(page);
+        await notesBox(page).fill('a later, ordinary save');
+        await page.clock.runFor(1_000);
+        await page.getByText('Saved.').waitFor();
+        await notesOf(app, CLASS_ITEM, kept('their class-item words', 'my class-item words'));
+        await reload(app);
+        await show(app, `/items/${CLASS_ITEM}`);
+        await page.getByText('their class-item words', { exact: false }).first().waitFor();
+        expect((await page.locator('main').innerText()).split('my class-item words').length - 1, engine).toBe(1);
+
+        // --- PULLED UNDERNEATH A LIVE EDITOR, the kept-both write refused ------
+        // A sync (the device coming back online) replaces the record while the
+        // words are still unwritten; the kept-both write is then refused. Both
+        // texts survive exactly ONCE — after Try again (item) and after a
+        // reload with more typed and no retry (class) — never the old draft
+        // replayed a second time on top of them.
+        const remote = newFakeRemote();
+        await installFakeGitHub(page, remote);
+        await connectSync(app);
+        const pullUnderneath = async (change: (d: Db) => Db, landed: () => Promise<unknown>) => {
+          const theirs = change((await persistedDb(app)) as unknown as Db);
+          publishRemote(remote, remoteStateText(theirs), await hashState(theirs), 60 + remote.calls.length);
+          await page.evaluate(() => window.dispatchEvent(new Event('online')));
+          await landed();
+        };
+        const heldDrafts = () => page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith('pc-note-draft:')));
+
+        await goTo(app, `/items/${WARM}`);
+        await editShownNotes(page);
+        await notesBox(page).fill('my words, while the other device synced');
+        await pullUnderneath(
+          (d) => ({ ...d, items: d.items.map((i) => (i.id === WARM ? { ...i, notes: 'their words, pulled while I typed' } : i)) }),
+          () => notesOf(app, WARM, 'their words, pulled while I typed'),
+        );
+        await breakStorage(page);
+        await page.clock.runFor(1_000);
+        await page.getByText(/Not saved/).waitFor();
+        await repairStorage(page);
+        await page.getByRole('button', { name: 'Try again' }).click();
+        await page.getByText('Saved.').waitFor();
+        // (The deleted record's draft above stays on the device, recreating nothing.)
+        expect(await heldDrafts(), engine).toEqual([`pc-note-draft:item:${FRESH}`]);
+        await reload(app);
+        await notesOf(app, WARM, kept('their words, pulled while I typed', 'my words, while the other device synced'));
+
+        await goTo(app, '/lessons');
+        const classCard = page.getByRole('article').filter({ hasText: 'Class 37' });
+        await classCard.getByRole('button', { name: /Class 37/ }).first().click();
+        await classCard.getByRole('button', { name: 'Edit Class notes' }).click();
+        const classBox = classCard.getByRole('textbox', { name: 'Class notes' });
+        await classBox.fill('my class words');
+        await pullUnderneath(
+          (d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === TWIN ? { ...l, notes: 'their class words' } : l)) }),
+          () => persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes, (n) => n === 'their class words'),
+        );
+        await breakStorage(page);
+        await page.clock.runFor(1_000);
+        await classCard.getByText(/Not saved/).waitFor();
+        expect(await classBox.inputValue(), engine).toBe(kept('their class words', 'my class words'));
+        await classBox.fill(`${kept('their class words', 'my class words')} — and more`);
+        await repairStorage(page);
+        await reload(app);
+        await persistedUntil(
+          app,
+          (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes,
+          (n) => n === kept('their class words', 'my class words — and more'),
+        );
         expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
       } finally {
         await app.close();
```

**Paths the rework touched:**

- `docs/practice-session-model.md`
- `src/components/ItemNotes.tsx`
- `src/domain/plan.ts`
- `src/store/useStore.ts`
- `tests/practice-session-families.test.ts`
- `tests/practice-session.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
050ba4e Rework review findings: kept-both note drafts, early-finish unused time, swap parent/part rule

- notes-recovery-idempotence: after a kept-both write the device draft becomes
  that text based on what the store held, and the drop matches what was written,
  so a retry or reload never replays the old draft a second time (items and
  lessons via DurableNotes).
- session-unused-time-accounting: planRunTime counts a done segment as what it
  actually took, up to its target, so finishing early frees the rest as unused.
- parent-part-opportunity-exclusion: swapSegment applies the build's sameWork
  exclusion against the segments that stay, keeping the due-review exception.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

dc1f663 Rework review findings: share the kept-both draft rebase with reload replay

- notes-recovery-idempotence: saveNotes itself re-holds the device draft as the
  kept-both text, so the reload replay path and the editor share one rule; the
  replay drops by what it actually wrote. Proven with a replay whose own write
  is refused at load and a later ordinary save makes the text durable.
- parent-part-opportunity-exclusion: the due-review exception is proven with a
  coupled review row in a deep slot (never a warm-up).
- session-unused-time-accounting: the rendered Plan header is checked at the
  end of the run as well as mid-run.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Check against the contract

- [ ] **ac-1** — Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path. _(proof: routine completion and history preserve all practised items without feedback)_
- [ ] **ac-2** — Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names. _(proof: routine controls distinguish skipped time from partial practice across run transitions)_
- [ ] **ac-3** — Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time. _(proof: routine contents and controls describe the exact run started from every doorway)_
- [ ] **ac-4** — Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks. _(proof: session plan reordering preserves segment identity allocation and execution order)_
- [ ] **ac-5** — Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow. _(proof: session plan move controls work by keyboard and touch without losing the draft)_
- [ ] **ac-6** — Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged. _(proof: working note drafts survive exits boundaries and reload without Done)_
- [ ] **ac-7** — Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave. _(proof: working note saves preserve newest text and refuse stale ownership across failures and replacement)_
- [ ] **ac-8** — Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries. _(proof: scoped evidence separates focused progress from whole item retention and readiness)_
- [ ] **ac-9** — Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale. _(proof: working returns stay short while protected dates and retention spacing keep their authority)_
- [ ] **ac-10** — An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity. _(proof: class preparation and shared recommendation pools return useful work without repetition noise)_
- [ ] **ac-11** — Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text. _(proof: close and review screens explain scope readiness and next practice with the date actually saved)_
- [ ] **ac-12** — Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares. _(proof: theory study uses ordinary practice items and earns bounded non urgent opportunities)_
- [ ] **ac-13** — Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes. _(proof: session model migration preserves history dates bytes and unresolved legacy meanings)_
- [ ] **ac-14** — Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss. _(proof: session model inbound doors preserve live practice and fail before replacing data)_
- [ ] **ac-15** — Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-16** — All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker. _(proof: ci release paths retain pinned dual engine provisioning and tests before publishing)_
- [ ] **ac-17** — One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties. _(proof: manual:OWNER)_
- [ ] **ac-18** — One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx, src/domain/repertoire.ts
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/io.ts
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx, src/domain/repertoire.ts matched changed file(s) src/domain/repertoire.ts, src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, the service worker, Layout and app-update code are untouched; the shared /settings route is only where the scheduling explanation also renders.

## point-this-device-at-the-nas — unchanged

No NAS base, reference or recording code changed; the shared /settings route is incidental.

## sync-devices-via-github — unchanged

syncEngine, githubSync and gitRemote are untouched; a pulled snapshot goes through the same validateDB, which now also checks the v17 fields (proved by session model inbound doors preserve live practice and fail before replacing data). As with every schema bump, both devices update before syncing; an older build refuses a v17 snapshot whole.

## practise-todays-recommendation — truth-proposed

Scoped results (focused/whole), Working/Keep-fresh returns, the shared candidate pool and autosaving notes change steps 2, 4, 6 and 7; update proposal in this lane.

## run-a-session-plan — truth-proposed

Preview Move earlier/later, removal without redistribution, skipping any pending or the running segment, and separate time figures change steps 2, 3, 5, 6 and the budget rule; update proposal in this lane.

## work-a-pathway-stage — truth-proposed

Routine contents preview before Start, running list with Move on / Skip / Remove, and unlabelled bound segments kept change the Guided routine variation; update proposal in this lane.

## adjust-how-scheduling-works — truth-proposed

The explanation now states Working returns, Keep-fresh whole checks and class preparation (step 1); update proposal in this lane.

## clear-a-due-review — truth-proposed

Which close completes a due review now depends on return intention and block scope (step 2, endsWith); update proposal in this lane.

## capture-a-practice-item — truth-proposed

Theory / listening study joins the kind-first form and study ideas pre-fill it (step 2, new variation); update proposal in this lane.

## log-a-class — truth-proposed

Class notes autosave and replay after reload instead of saving on blur (step 2); update proposal in this lane.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now (update proposed)

Proposed step changes:
− Practice Compass States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
−   Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
+ Practice Compass States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
+   Shows: The priority terms, the working return days, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
  The musician Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
    Shows: The explanation updates to the new numbers.
    Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.
  The musician Closes a block or builds a plan afterwards.
    Shows: Review dates and plan shapes computed with the adjusted values.
    Changes: The same settings are used for the date previewed and the date saved.
  The musician Taps 'Reset to recommended' whenever they want the original behaviour back.
    Shows: 'Using the recommended defaults.'
    Changes: The settings field is dropped, so the historical constants apply exactly.

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now (update proposed)

Proposed step changes:
  The musician Types a title into the quick-add box and presses Add.
    Shows: 'Added ✓' with an 'add details' link.
    Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.
− The musician Or chooses 'Add practice item' for the full one-step form.
−   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
+ The musician Or chooses 'Add practice item' for the full one-step form.
+   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique / theory or listening study), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
  The musician Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
    Shows: Persian instruments are asked for dastgāh, gusheh, form and composer. While typing in dastgāh, form or composer, up to eight matching terms appear below the box as buttons — found from Farsi, Latin, an alias or a transliteration — beside an ‘All’ list and a clear control; a tap, click or Enter stores the shared term and returns focus to the box. A partial match is never accepted on its own, and free text always wins.
  The musician Saves.
    Shows: The item's own page, with a 'Connected to' summary near the top.
    Changes: One item, linked to whatever it belongs to — links never duplicate the item.

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now (update proposed)

Proposed step changes:
  Practice Compass Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
    Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.
− The musician Taps ▶ to practise it.
−   Shows: The active block, seeded from the item's status and focus.
−   Changes: Nothing yet — the review only completes when the block is closed.
+ The musician Taps ▶ to practise it.
+   Shows: The active block, seeded from the item's status and focus.
+   Changes: Nothing yet — the review completes only when the close decides the item's next date: an assessed close of an item being worked on, or a whole-item check of a kept-fresh one (focused work on a kept-fresh item leaves its check waiting).
  The musician Or taps 'Not now'.
    Shows: The row disappears for the rest of the day and returns tomorrow.
    Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.
  The musician Or taps '+2d' to genuinely move it.
    Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now (update proposed)

Proposed step changes:
  The musician Accepts the pre-filled class number and picks the date.
    Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
    Changes: A Lesson is stored for that instrument; the number is optional and editable.
− The musician Rewatches the class and types the notes, in Farsi or English.
−   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
−   Changes: Notes are saved when the field loses focus.
+ The musician Rewatches the class and types the notes, in Farsi or English.
+   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text, and 'Saved.' only once the device has stored them.
+   Changes: Notes save themselves after a short pause and whenever the musician leaves the class — never merely because the field loses focus; Done is optional. Words still unsaved when the page reloads are written to that class afterwards, and a class whose notes changed meanwhile keeps both texts.
  The musician Adds a link to the class recording and to any scores — a NAS path or a full https link.
    Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
    Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.
  The musician Taps 'Open' on a link.
    Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
    Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
    Only if: A NAS base URL is set in Settings and the NAS is reachable from this device
  The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
    Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
    Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.
  The musician Optionally attaches small hand-outs (a PDF, a photo, a short audio).
    Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
    Changes: Small blobs are stored on the device and travel with backups and sync.

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
− Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
−   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
+ Practice Compass Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (class work and an unassessed routine block included) steps aside while anything else waits — and shows the best one with a one-sentence reason.
+   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review, and a repeat says plainly that nothing else is waiting.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
− The musician Picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort' line (Change) — an engine-suggested status shows there pre-selected as the pending change.
−   Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link; the date is decided from the item as practised, so revising the item never moves it.
−   Changes: Nothing until Save; untouched fields are never written.
− The musician Taps 'Save block'.
−   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
−   Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.
+ The musician Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
+   Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says when the item is wanted before its class — beside a review date that stays as stored. 'Why this date?' explains it in place.
+   Changes: Nothing until Save; untouched fields are never written.
+ The musician Taps 'Save block'.
+   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
+   Changes: A PracticeBlock is stored with what it covered; the item's counters and saturation flag update; its next date is the one shown — spaced repetition advances only on a kept-fresh item's eligible whole-item check — and the open review completes only when that decision writes a date. Status and return intention change only when the musician chose them.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
  Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
    Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.
− The musician Swaps, removes or regenerates segments until the shape looks right.
−   Shows: A removal re-spreads the minutes under the same floors and shares; a swap offers only material whose floor fits the slot.
−   Changes: Only a local copy of the plan — nothing is saved yet.
− The musician Taps 'Start plan'.
−   Shows: The runner: the whole list with the current segment highlighted.
−   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
+ The musician Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
+   Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused; only Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it.
+   Changes: Only a local copy of the plan — nothing is saved yet.
+ The musician Taps 'Start plan'.
+   Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately.
+   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
  The musician Taps 'Start' on the current segment.
    Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
    Changes: A real practice block opens for that segment's item.
− The musician Finishes and saves the block as usual.
−   Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
−   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
− The musician Skips anything they do not want, or ends the plan at any time.
−   Shows: 'Session complete' once the last segment is passed.
−   Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.
+ The musician Finishes and saves the block as usual.
+   Shows: Back on the plan, that segment reads 'done' with the minutes actually recorded, and the pointer moves to the next one; overtime is recorded as practised and charged to no other segment.
+   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
+ The musician Skips any segment not yet started, skips the running one with 'Skip this one — save nothing', or ends the plan at any time; Finish (then Save, with or without a result) is how a shortened segment keeps what was practised.
+   Shows: 'Session complete' once the last segment is passed — saying so plainly when nothing was practised.
+   Changes: A skipped segment logs nothing at all, even after time passed in it, and lengthens nothing else; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261023-make-practice-records-dependable-and-kee-34cc' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
