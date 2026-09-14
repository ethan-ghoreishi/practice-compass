---
id: 20260913-build-a-daily-session-i-can-trust-from-l-402e
contractId: 20260913-build-a-daily-session-i-can-trust-from-l-402e
patchId: f4880b90fda08ea18f132e583a0ee757a20d4b6c
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: C7 new-model inbound validation
    summary: Hydration bypasses new-model validation and accepts newer schemas
      instead of refusing them.
    counterexample: At src/store/useStore.ts:1611-1635, both persist migrate and
      merge call migrateToCurrent without validateDB or a newer-version guard. A
      read-only probe through the actual useStore/Zustand persist.rehydrate with
      in-memory storage and writes disabled accepted version=12 agenda questions
      with itemId='nonexistent' and askedAt='2026-02-30T12:00:00.000Z';
      hasHydrated() was true and both invalid values entered live db unchanged.
      Persisted version=13 with db.schemaVersion=13 also hydrated successfully
      as schemaVersion=12 because migrations.ts:292 stamps the current version.
      The legacy-question conversion now succeeds, but this sibling inbound
      boundary still fails C7/ac-15. Extend the exact named test 'all inbound
      paths preserve the new model or reject before replacement' to exercise
      real hydration with invalid/current/newer inputs, preserving the installed
      state and providing actionable refusal.
createdAt: 2026-09-14T16:38:35.568Z
sealedAt: 2026-09-14T16:53:01.489Z
---

# Review: Build a daily session I can trust, from lesson commitments to the next review

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260913-build-a-daily-session-i-can-trust-from-l-402e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/22
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `f4880b90fda08ea18f132e583a0ee757a20d4b6c`

## The Delta this change was framed from

# For the chosen instrument and available minutes, construct an explainable useful session from current exposure and specific lesson preparation, with optional familiar warm-up within the budget and no category quotas. Run normal practice blocks, preserve authoritative manual/early review dates and advance spacing only on eligible evidence. Questions target lessons independently and retain asked/answer history through one honest migration.

_approved · about "run-a-session-plan"_

## Today

The time-budgeted session selects from role pools using rolling item lesson flags, permanent/count-based saturation and sometimes stale inputs; each successful close can advance spacing again, and teacher questions are mutable instrument-level strings.

## Instead

For the chosen instrument and available minutes, construct an explainable useful session from current exposure and specific lesson preparation, with optional familiar warm-up within the budget and no category quotas. Run normal practice blocks, preserve authoritative manual/early review dates and advance spacing only on eligible evidence. Questions target lessons independently and retain asked/answer history through one honest migration.

## Keep

- One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.
- Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.
- One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.
- Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.
- No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.
- Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.
- Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards.

## New assumptions

- Existing run-a-session-plan is the primary Flow; practise-todays-recommendation, clear-a-due-review, adjust-how-scheduling-works, log-a-class, prepare-for-the-next-class and back-up-and-restore have explicit affected behaviour. Other mapped consumers require scoped impact reconciliation, not invented new journeys.

## Show me

Demonstrate the two named real-browser journeys after the three decision families pass independently, then an OWNER musical/phone check at 5/20/45 minutes. Show exact saved dates, independent lesson targets, unassigned legacy data, retained asked answers and unchanged practice history.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **C5 lossless and complete lesson-intent migration** — Current-version hydration bypasses the unconditional migration and accepts incomplete conversion.
  _counterexample:_ src/store/useStore.ts:1611-1618: Zustand invokes migrate only when the persisted version differs. With persisted version=12, a v12 database containing teacherQuestion='hydration leftover' and lessonAgenda=[] hydrates with the legacy field unchanged and zero agenda entries. Reproduced through the actual store/Zustand using in-memory storage with writes disabled. Extend 'all inbound paths preserve the new model or reject before replacement' to exercise actual current-version hydration, not only validateDB payload wrappers.
- **A/B live decision freshness and preview-write agreement** — Start plan still accepts yesterday's preview before the next clock poll.
  _counterexample:_ src/pages/SessionPlan.tsx:99-107,141-145 and src/components/useDecisionNow.ts:23-32: build at 23:59:59, then click Start plan at 00:00:01 without a visibility/focus event and before the 30-second poll. Both today and baseDay still represent yesterday, stale is false, and startPlan installs the old selections/reasons without checking real time. Extend 'daily practice browser journey preserves the decision across close and rebuild' with this no-event Start race; its new plan-midnight branch explicitly dispatches visibilitychange.
- **C7 new-model inbound validation** — Invalid asked calendar dates and dangling new item targets still pass inbound validation.
  _counterexample:_ src/domain/lessonAgenda.ts:328-329,411-431: validateDB accepts a v12 question with askedAt='2026-02-30T12:00:00.000Z', because Date.parse normalises it, and accepts itemId='nonexistent'. Both reproduced in read-only probes. The orphan-item exemption is not supported by the actual producer: src/store/useStore.ts:801-828 calls detachItem, which removes preparations and converts question itemId to detachedFromItemId. Extend 'all inbound paths preserve the new model or reject before replacement' across valid calendar components and live item references, while preserving genuinely detached history and legacy restoration.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index aa77d44..7ee4c3a 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -675,22 +675,38 @@ where "legacy debris" is actually true.** `validateLessonAgenda` + `validateSche
 run inside `validateDB`, before `replaceAllBlobs` and before any install: unknown kinds,
 missing ids, duplicate ids, a missing instrument, empty question text, unreadable dates
 and a target that RESOLVES to a different instrument all refuse the import with
-actionable detail. A DANGLING `itemId` — set, but resolving to nothing — stays tolerated:
-the v11→v12 migration mints entries from `db.items` at the moment it runs, so an item
-deleted afterwards leaves its own agenda entries pointing at nothing, and every reader
-already copes with that (the docstring above already spells out the same tolerance for a
-dangling `instrumentId`); refusing a restore over one would make the owner's own
-documented recovery copy unrestorable — exactly the data loss this guard exists to
-prevent, not an example of it. A DANGLING `lessonId` is different and is now REFUSED: this
-app never leaves one dangling on its own — `deleteLesson` always converts a live
-`lessonId` to `detachedFromLessonId` (see `detachLesson`), so a `lessonId` that is neither
-absent nor resolving is invalid new intent, not legacy debris to wave through. A sealed
-review reproduced `validateDB` accepting `lessonId: 'nonexistent'` before this. Calendar
-values are also checked for REAL validity now, not merely shape:
-`nextReviewDate`/`srLastProgressDay`/a review's `dueDate` and a question's `askedAt` all
-round-trip through their own components (`/^\d{4}-\d{2}-\d{2}$/` alone happily matched
-`"2027-99-99"` and `"2026-02-30"`, which `Date.UTC` silently normalises rather than
-rejects) — a sealed review reproduced both accepted.
+actionable detail. A DANGLING `lessonId` is REFUSED: this app never leaves one dangling on
+its own — `deleteLesson` always converts a live `lessonId` to `detachedFromLessonId` (see
+`detachLesson`), so a `lessonId` that is neither absent nor resolving is invalid new
+intent, not legacy debris to wave through. A sealed review reproduced `validateDB`
+accepting `lessonId: 'nonexistent'` before this.
+
+**A DANGLING LIVE `itemId` IS REFUSED FOR THE IDENTICAL REASON, NOT TOLERATED.** This
+section previously tolerated it on the theory that the v11→v12 migration mints entries
+from `db.items` at the moment it runs, so an item deleted afterwards could leave its own
+agenda entries pointing at nothing. A sealed review found that theory does not hold
+against the app's own REAL producer: `deleteItem` (`useStore.ts`) always calls
+`detachItem` in the SAME synchronous update that removes the item — a preparation naming
+it is removed outright, and a question's `itemId` is converted to `detachedFromItemId` —
+so there is no in-app path that leaves a live `itemId` dangling any more than there is for
+`lessonId`. Preparations and questions alike now require a PRESENT `itemId` to resolve to
+a real item. A GENUINELY DETACHED record — `detachedFromItemId` set, `itemId` absent — is
+unaffected: `detachItem` destructures `itemId` OUT rather than setting it `undefined`
+(the same shape `detachLesson` already used for `lessonId`), so this strict check never
+sees one to reject, and `io.test.ts` proves that against the real `detachItem` producer,
+not a hand-built approximation of its shape.
+
+**CALENDAR VALUES ARE CHECKED FOR REAL VALIDITY, INCLUDING A QUESTION'S OWN `askedAt`.**
+`nextReviewDate`/`srLastProgressDay`/a review's `dueDate` (`isValidISODate`,
+`scheduling.ts`) and a question's `askedAt` (`isValidISODateTime`, `lessonAgenda.ts`) all
+round-trip their calendar components through `Date.UTC` rather than trusting a shape
+regex or `Date.parse` alone: `/^\d{4}-\d{2}-\d{2}$/` (or its date-time equivalent) happily
+matches `"2027-99-99"` and `"2026-02-30T12:00:00.000Z"`, and `Date.parse` silently
+NORMALISES an out-of-range day (February 30th becomes March 2nd) rather than rejecting
+it. A sealed review reproduced `askedAt` accepting exactly that string — the date-only
+check had already been fixed once, but its date-TIME sibling in a different file had not.
+The two checks stay small and separately owned, one per file, rather than merged into a
+shared import.
 
 ## Persian text is canonical, and direction-aware
 
@@ -1570,6 +1586,24 @@ no scores, no "optimal" claims, no gamification.
   whenever `rev` OR the day has moved — the same "mark it, don't silently rewrite it"
   treatment `rev` already got, so a deliberate swap or removal survives a midnight
   exactly as it survives any other change underneath the plan.
+- **THE PASSIVE `stale` FLAG ABOVE STILL LAGS THE TRUE INSTANT BY UP TO ITS OWN POLL
+  INTERVAL — STARTING A PLAN CANNOT TRUST IT ALONE.** `stale` is derived from
+  `useDecisionNow`'s own `now`, which refreshes at most every 30 seconds plus
+  visibility/focus — a real device left untouched across local midnight, with no event to
+  fire and no poll due yet, still reads `stale === false` and shows an ENABLED Start
+  button for up to that whole window. A sealed review reproduced this against the real
+  wiring: build at 23:59:59, click Start at 00:00:01 with no dispatched event, and the old
+  code installed yesterday's selections. Starting a plan is an authority boundary, so
+  `start()` (`SessionPlan.tsx`) checks a FRESH `new Date()` against `baseDay` directly —
+  via the extracted pure `planPreviewDayHasPassed(baseDay, now)` (`plan.ts`), the same rule
+  `stale`'s own day comparison already applies, just evaluated against the true instant
+  instead of the polled one — before ever calling `startPlan`. A mismatch refuses the
+  start and sets a small local `nowOverride` (the same shape `CloseBlock`'s own Save-race
+  guard already uses) so `now`/`today`/`stale` immediately catch up and the existing
+  banner and disabled button render — a visible refusal, never a silent no-op click. This
+  does not touch the `rev`-based half of `stale`: a store mutation already re-renders the
+  subscribed component synchronously, so only the CLOCK side of staleness can lag behind a
+  click in the first place.
 - **The plan runs REAL practice blocks — it is not a countdown.** `RoutineRunner` (the
   warm-up timer) stays untouched. The runner orchestrates the existing
   start→`/active`→`/close` flow: "Start this segment" = `beginPlanSegment` seeded from the
@@ -1692,7 +1726,13 @@ is left untouched (all five `-soft` fills, `--text`, `--text-dim`, `--accent-dim
   `hydrated`. Every inbound database — rehydration, manual import, sync pull,
   conflict-keep-remote, archive restore — runs through the one shared `migrateToCurrent`
   chain (`src/domain/migrations.ts`); persistence changes must keep it green and bump
-  `SCHEMA_VERSION`. Schema **v12** converts legacy lesson intent into `lessonAgenda` and
+  `SCHEMA_VERSION`. Rehydration reaches it via BOTH halves of the persist middleware —
+  `migrate` when the persisted version differs from the current one, `merge`
+  UNCONDITIONALLY otherwise — because Zustand skips `migrate` entirely once the persisted
+  version already matches, which would otherwise let an already-current database carry a
+  stray legacy field forever (a sealed review reproduced exactly this; see the
+  lesson-agenda section above for the fix and why re-running the conversion a second time
+  is safe). Schema **v12** converts legacy lesson intent into `lessonAgenda` and
   adds the two scheduling-metadata fields (`nextReviewSource`, `srLastProgressDay`) —
   neither is ever guessed for old data, so an existing future date keeps UNKNOWN
   provenance and is protected accordingly. Schema **v11** backfills a routine's `instrumentId` from the pathway
diff --git a/src/domain/io.test.ts b/src/domain/io.test.ts
index 2f53eb3..24b3803 100644
--- a/src/domain/io.test.ts
+++ b/src/domain/io.test.ts
@@ -6,7 +6,7 @@ import { migrateToCurrent } from './migrations';
 import { createSeedDB } from './seed';
 import { createBlock, createItem, createLesson } from './factories';
 import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
-import { createPreparation, detachLesson } from './lessonAgenda';
+import { createPreparation, createQuestion, detachItem, detachLesson } from './lessonAgenda';
 import { SCHEMA_VERSION, type PracticeDB } from './types';
 import { addDays, nowISO, toISODate } from './util';
 
@@ -77,6 +77,11 @@ describe('validateDB — backward-compatible import', () => {
       ...db,
       schemaVersion: 4,
       items: [item],
+      // Truncated to one item on purpose (this test is about pathwaySteps,
+      // not lesson agenda) — the seed's OWN agenda entries would otherwise
+      // dangle against every item but this one, which the strict live-itemId
+      // check now (correctly) refuses.
+      lessonAgenda: [],
       pathwaySteps: [{ itemId: item.id, stageId: 'correct-stage' }],
     };
     // migrateToV5's overwrite behaviour wins over the old "fill only when
@@ -131,6 +136,8 @@ describe('validateDB — backward-compatible import', () => {
       ...db,
       schemaVersion: undefined,
       items: [item],
+      // Truncated to one item on purpose (see the sibling test above).
+      lessonAgenda: [],
       pathwaySteps: [{ itemId: item.id, stageId: 'from-pathway-steps' }],
     });
     const result = parseImport(legacyText);
@@ -251,26 +258,34 @@ describe('the v12 model at every inbound door', () => {
     expect(
       bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: 'yesterday' }]),
     ).toThrow(/unreadable asked date/);
+    // An IMPOSSIBLE calendar timestamp is refused too, not merely an
+    // unparseable one: `Date.parse` silently NORMALISES "2026-02-30" into
+    // March 2nd rather than rejecting it, so a shape check (or `Date.parse`
+    // alone) happily accepted it before this. A sealed review reproduced
+    // exactly this string passing.
+    expect(
+      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: '2026-02-30T12:00:00.000Z' }]),
+    ).toThrow(/unreadable asked date/);
     // A DANGLING live `lessonId` — set, but resolving to nothing — is neither
     // a real agenda entry nor an honest unassigned one: `deleteLesson` always
     // converts a live reference to a detached marker, so this app never
     // leaves one dangling, and it is refused rather than tolerated as legacy
     // debris.
     expect(bad([{ ...sample, lessonId: 'nonexistent' }])).toThrow(/class that no longer exists/);
-    // A dangling `itemId`, by contrast, stays TOLERATED — deliberately
-    // asymmetric with `lessonId`. A genuine pre-upgrade backup can legitimately
-    // hold one whose item was deleted on another device before that deletion
-    // synced, and refusing it would make the owner's own documented recovery
-    // copy unrestorable.
-    expect(() =>
-      validateDB({ ...v12, lessonAgenda: [{ kind: 'preparation', id: 'p', instrumentId: 'setar', itemId: 'nonexistent' }] }),
-    ).not.toThrow();
-    expect(() =>
-      validateDB({
-        ...v12,
-        lessonAgenda: [{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', itemId: 'nonexistent' }],
-      }),
-    ).not.toThrow();
+    // A dangling `itemId` is REFUSED for the identical reason, not tolerated:
+    // `deleteItem` (`useStore.ts`) always calls `detachItem` in the SAME
+    // synchronous update that removes the item — a preparation naming it is
+    // removed outright, and a question's `itemId` becomes
+    // `detachedFromItemId` — so this app never leaves a LIVE `itemId`
+    // dangling any more than a `lessonId`. A sealed review found this
+    // previously tolerated on a theory the real producer above does not
+    // support.
+    expect(
+      bad([{ kind: 'preparation', id: 'p', instrumentId: 'setar', itemId: 'nonexistent' }]),
+    ).toThrow(/practice item that no longer exists/);
+    expect(
+      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', itemId: 'nonexistent' }]),
+    ).toThrow(/practice item that no longer exists/);
     expect(() => validateDB({ ...v12, lessonAgenda: 'nope' })).toThrow(/must be a list/);
     // Calendar values are checked for real, not merely shape: a due date and
     // an item's own next-review date must both name a date that exists.
@@ -333,6 +348,17 @@ describe('the v12 model at every inbound door', () => {
     expect(reallyDetached).not.toHaveProperty('lessonId');
     expect(reallyDetached).toMatchObject({ detachedFromLessonId: 'L-setar-1' });
     expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetached] })).not.toThrow();
+    // The item-side equivalent, against the REAL producer `detachItem`
+    // (`deleteItem`'s own path) rather than a hand-built approximation: it
+    // destructures `itemId` OUT rather than setting it undefined, so the
+    // strict live-itemId check just proven above must never see one here.
+    const questionOnItem = createQuestion({ id: 'q:real', text: 'Real question', itemId: 'i-premigrated', instrumentId: 'setar', now: NOW });
+    const [reallyDetachedQuestion] = JSON.parse(
+      JSON.stringify(detachItem([questionOnItem], 'i-premigrated', NOW)),
+    ) as typeof v12.lessonAgenda;
+    expect(reallyDetachedQuestion).not.toHaveProperty('itemId');
+    expect(reallyDetachedQuestion).toMatchObject({ detachedFromItemId: 'i-premigrated' });
+    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetachedQuestion] })).not.toThrow();
     expect(() =>
       validateDB({
         ...v12,
diff --git a/src/domain/lessonAgenda.ts b/src/domain/lessonAgenda.ts
index 31cede6..9630d66 100644
--- a/src/domain/lessonAgenda.ts
+++ b/src/domain/lessonAgenda.ts
@@ -316,17 +316,30 @@ export function createQuestion(args: {
 
 // --- Validation -------------------------------------------------------------
 
-const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T/;
+const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T/;
 
 /**
  * A real ISO date-time, not merely a string shaped like the prefix of one:
  * `/^\d{4}-\d{2}-\d{2}T/` alone matches "2027-13-40T99:99:99.000Z" just as
- * happily as a genuine timestamp. Every `askedAt` this app itself writes
- * comes from `nowISO` (`new Date().toISOString()`), which `Date.parse` always
- * reads back losslessly, so this rejects nothing legitimate.
+ * happily as a genuine timestamp, and `Date.parse` alone is no better — it
+ * silently NORMALISES an out-of-range day (`"2026-02-30T12:00:00.000Z"`
+ * becomes March 2nd) rather than rejecting it, so a sealed review reproduced
+ * that exact string passing. The calendar components are round-tripped
+ * through `Date.UTC` the same way `scheduling.ts`'s own `isValidISODate`
+ * checks a plain date, so an impossible day/month combination fails here
+ * too. Every `askedAt` this app itself writes comes from `nowISO`
+ * (`new Date().toISOString()`), which always round-trips losslessly, so this
+ * rejects nothing legitimate.
  */
 function isValidISODateTime(s: string): boolean {
-  return ISO_DATE_TIME.test(s) && Number.isFinite(Date.parse(s));
+  const m = ISO_DATE_TIME.exec(s);
+  if (!m || !Number.isFinite(Date.parse(s))) return false;
+  const [, ys, ms, ds] = m;
+  const y = Number(ys);
+  const mo = Number(ms);
+  const d = Number(ds);
+  const dt = new Date(Date.UTC(y, mo - 1, d));
+  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
 }
 
 /**
@@ -339,17 +352,24 @@ function isValidISODateTime(s: string): boolean {
  * lesson, an asked question whose item is gone, a question with no item at all
  * are all honest states this app produces itself.
  *
- * A LIVE `lessonId` that resolves to NOTHING is different: `deleteLesson`
- * always converts the live reference to `detachedFromLessonId` (see
- * `detachLesson`), so this app never leaves one dangling — a `lessonId` that
- * is neither absent nor resolving is invalid new intent, not legacy debris.
- * A dangling `itemId` stays TOLERATED, deliberately asymmetric with
- * `lessonId`: the v11→v12 migration mints entries from `db.items` at the
- * moment it runs, so an item deleted afterwards leaves its own agenda entries
- * pointing at nothing — every reader already copes with that, the same way
- * a dangling `instrumentId` is tolerated just above — and refusing to restore
- * a backup over one would make the owner's own documented recovery copy
- * unrestorable, exactly the data loss this guard exists to prevent.
+ * A LIVE `lessonId` OR a LIVE `itemId` that resolves to NOTHING is invalid new
+ * intent, not legacy debris — this app never leaves either dangling on its
+ * own. `deleteLesson` always converts a live `lessonId` to
+ * `detachedFromLessonId` (see `detachLesson`). `deleteItem` (`useStore.ts`)
+ * always calls `detachItem` in the SAME synchronous update that removes the
+ * item: a preparation naming it is removed outright, and a question's
+ * `itemId` is converted to `detachedFromItemId` — never left as a live
+ * reference to nothing. A sealed review found this section previously
+ * tolerating a dangling `itemId` on the theory that the v11→v12 migration
+ * mints entries from `db.items` at the moment it runs, so an item deleted
+ * afterwards could leave its own agenda entries pointing at nothing — that
+ * theory does not hold against the actual producer above, which cleans up
+ * synchronously in the SAME update, so a genuinely dangling live `itemId` can
+ * only be invalid data, not a legitimate history. A GENUINELY DETACHED
+ * record — `detachedFromItemId`/`detachedFromLessonId` set, the live field
+ * absent — is unaffected either way: `detachItem`/`detachLesson` destructure
+ * the live field OUT rather than setting it `undefined`, so this check never
+ * sees one to reject.
  */
 export function validateLessonAgenda(
   db: Pick<PracticeDB, 'lessonAgenda' | 'items' | 'lessons' | 'instruments'>,
@@ -405,15 +425,17 @@ export function validateLessonAgenda(
     } else if (e.lessonId !== undefined) {
       return `Lesson-agenda entry "${e.id}" has an unreadable class reference.`;
     }
-    // An item target that no longer resolves is tolerated (see the
-    // docstring); one that DOES resolve must agree with the entry's
-    // instrument — a mismatch there is invalid new intent regardless.
+    // A LIVE item target that resolves to nothing at all is refused outright
+    // — see this function's own docstring for why that is never legacy
+    // debris. One that DOES resolve must also agree with the entry's
+    // instrument.
     if (e.kind === 'preparation') {
       if (typeof e.itemId !== 'string' || !e.itemId) {
         return `Preparation "${e.id}" names no practice item.`;
       }
       const item = itemById.get(e.itemId);
-      if (item && item.instrumentId !== e.instrumentId) {
+      if (!item) return `Preparation "${e.id}" names a practice item that no longer exists.`;
+      if (item.instrumentId !== e.instrumentId) {
         return `Preparation "${e.id}" names an item on a different instrument.`;
       }
     } else {
@@ -422,7 +444,8 @@ export function validateLessonAgenda(
       }
       if (typeof e.itemId === 'string') {
         const item = itemById.get(e.itemId);
-        if (item && item.instrumentId !== e.instrumentId) {
+        if (!item) return `Question "${e.id}" names a practice item that no longer exists.`;
+        if (item.instrumentId !== e.instrumentId) {
           return `Question "${e.id}" names an item on a different instrument.`;
         }
       } else if (e.itemId !== undefined) {
diff --git a/src/domain/plan.test.ts b/src/domain/plan.test.ts
index 25dce1c..ed64c2b 100644
--- a/src/domain/plan.test.ts
+++ b/src/domain/plan.test.ts
@@ -9,6 +9,7 @@ import {
   MAX_SEGMENT_MINUTES,
   MIN_BUDGET_MINUTES,
   MIN_SEGMENT_MINUTES,
+  planPreviewDayHasPassed,
   planSegmentStartable,
   redistributePlan,
   skipPlanSegment,
@@ -505,6 +506,17 @@ describe('a running plan keeps its progress and refuses stale work', () => {
     expect(advancePlanPointer([pendingSeg, doneSeg], 1)).toBe(0); // wraps to what is still pending
     expect(advancePlanPointer([skippedSeg], 0)).toBe(1); // a deliberate skip stays skipped
     expect(advancePlanPointer([doneSeg], 0)).toBe(1); // finished
+
+    // Starting a plan is an authority boundary: the preview's OWN calendar
+    // day is checked against the caller's `now` directly — the extracted
+    // pure transition `SessionPlan.tsx`'s click-time guard actually calls,
+    // never a screen's own polled `now` that can lag the true instant by up
+    // to its poll interval, which is the exact gap a real device left
+    // untouched across midnight experiences with no event to close it.
+    const builtFor = day(0);
+    expect(planPreviewDayHasPassed(builtFor, NOW)).toBe(false);
+    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, 1))).toBe(true);
+    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, -1))).toBe(true);
   });
 });
 
diff --git a/src/domain/plan.ts b/src/domain/plan.ts
index 1f83294..c241ada 100644
--- a/src/domain/plan.ts
+++ b/src/domain/plan.ts
@@ -823,6 +823,22 @@ export function skipPlanSegment(run: PlanRun): PlanRun {
   return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
 }
 
+/**
+ * Has the local calendar day moved past the day a session-plan PREVIEW was
+ * built for? Takes the caller's OWN `now` rather than reading a clock itself,
+ * but the point of this function is that the caller must pass the TRUE
+ * current instant here, never a screen's own polled `now`
+ * (`useDecisionNow` refreshes at most every 30 seconds, plus visibility/focus)
+ * — starting a plan is an authority boundary, the one place that lag must
+ * never be trusted. `SessionPlan.tsx`'s own `stale` flag already renders this
+ * same comparison against its polled `now` for the passive banner; this is
+ * the identical rule, extracted so the click-time check reads a fresh
+ * `Date` directly rather than waiting for that polled value to catch up.
+ */
+export function planPreviewDayHasPassed(baseDay: string, now: Date): boolean {
+  return todayISODate(now) !== baseDay;
+}
+
 export type PlanStartCheck =
   | { ok: true; item: PracticeItem }
   | { ok: false; reason: 'finished' | 'deleted' | 'moved' | 'busy' };
diff --git a/src/pages/SessionPlan.tsx b/src/pages/SessionPlan.tsx
index da5b0bd..f17534f 100644
--- a/src/pages/SessionPlan.tsx
+++ b/src/pages/SessionPlan.tsx
@@ -5,6 +5,7 @@ import {
   currentStage,
   MAX_BUDGET_MINUTES,
   MIN_BUDGET_MINUTES,
+  planPreviewDayHasPassed,
   preparationDatesByItem,
   redistributePlan,
   swapSegment,
@@ -48,7 +49,19 @@ function PlanPreview() {
   const [params] = useSearchParams();
   // Refreshed at a local-day boundary so a preview left open overnight never
   // plans against yesterday's due dates and lesson deadlines.
-  const now = useDecisionNow();
+  //
+  // `useDecisionNow` polls at most every 30 seconds (plus visibility/focus),
+  // so it can lag the true instant by up to that long. `nowOverride` closes
+  // that gap at the one moment it actually matters — Start — without needing
+  // the shared hook to expose a manual refresh: the same small local-override
+  // shape CloseBlock's own Save race uses. `start()` sets it the instant it
+  // finds the real local day has moved past the day this preview was built
+  // for, forcing an immediate re-render where `today`/`stale` below already
+  // reflect it, instead of silently installing yesterday's selections under a
+  // Start button that still reads as enabled.
+  const [nowOverride, setNowOverride] = useState<Date | null>(null);
+  const decisionNow = useDecisionNow();
+  const now = nowOverride ?? decisionNow;
 
   const instrumentId = sessionInstrumentId ?? db.instruments.find((i) => i.active)?.id ?? db.instruments[0]?.id ?? '';
   // Invalid input is rejected at the boundary, never clamped into a session
@@ -139,6 +152,19 @@ function PlanPreview() {
     setPlan(swapSegment(plan, i, editorArgs()));
   }
   function start() {
+    // Starting a plan is an authority boundary: check the TRUE current
+    // instant here, never the polled `now` above, which can still be
+    // showing yesterday for up to `useDecisionNow`'s own poll interval after
+    // local midnight has genuinely passed — the exact window a dispatched
+    // visibility/focus event papers over but a real device left untouched
+    // does not get. A mismatch refuses the start and forces the SAME visible
+    // refresh the passive banner below already shows for a data change,
+    // rather than silently installing a preview for a day that has passed.
+    const trueNow = new Date();
+    if (planPreviewDayHasPassed(baseDay, trueNow)) {
+      setNowOverride(trueNow);
+      return;
+    }
     if (plan.segments.length === 0 || stale) return;
     setPlanMinutes(instrumentId, plan.budgetMinutes);
     startPlan(plan);
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index 26c2d3a..02e5714 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -1615,7 +1615,24 @@ export const useStore = create<StoreState>()(
       },
       merge: (persisted, current) => {
         const p = (persisted ?? {}) as Partial<StoreState>;
-        const merged = { ...current, ...p, db: p.db ?? current.db };
+        // Zustand only calls `migrate` above when the persisted version
+        // differs from the current one — a persisted database that ALREADY
+        // claims the current schema never reaches it, even when it carries a
+        // stray `assignedForLesson`/`teacherQuestion` an interrupted write
+        // left behind, with `lessonAgenda` never actually completed to
+        // represent it. `merge` is the one place ALL persisted state
+        // re-enters live state regardless of whether `migrate` ran (the same
+        // reasoning the active/activeRoutine freeze below relies on), so it
+        // is where this closes for good: run the SAME idempotent, lossless
+        // conversion `migrate` would have, unconditionally. Calling it again
+        // on state `migrate` already processed is safe — `migrateToV12`'s own
+        // docstring guarantees it is a no-op wherever no legacy field
+        // survives — and calling it with `SCHEMA_VERSION` as the "from"
+        // version is correct here because every OTHER step in the chain is
+        // gated on a version strictly below what a current database could
+        // ever claim; only the unconditional tail step ever runs.
+        const db = p.db ? migrateToCurrent(p.db, SCHEMA_VERSION) : current.db;
+        const merged = { ...current, ...p, db };
         // The start/resume guards keep active/activeRoutine from BOTH being
         // set going forward, but a device that persisted a dual-running
         // state before those guards existed reaches this merge unchecked —
diff --git a/tests/daily-practice.browser.test.ts b/tests/daily-practice.browser.test.ts
index 6487ed2..96874ae 100644
--- a/tests/daily-practice.browser.test.ts
+++ b/tests/daily-practice.browser.test.ts
@@ -227,6 +227,32 @@ describe('the daily practice loop, end to end', () => {
       // are the thing being protected, not the stale label itself.
       await page.getByRole('button', { name: 'Regenerate' }).click();
       expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
+
+      // --- 11b. THE START-PLAN RACE: NO event, NO poll — the exact gap step
+      // 11's own dispatched visibilitychange never exercises, and a real
+      // device left untouched genuinely experiences. Advance the clock past
+      // midnight again and click Start IMMEDIATELY, with nothing to have told
+      // the screen the day changed: the click itself must refuse rather than
+      // silently install yesterday's selections under a button that still
+      // reads as enabled, and the refusal must be VISIBLE — the same banner,
+      // not a dead click.
+      await page.clock.setFixedTime(new Date('2027-01-17T00:20:00'));
+      await page.getByRole('button', { name: 'Start plan' }).click();
+      await expect
+        .poll(() => page.getByText(/plan was built for a day that has passed/).isVisible().catch(() => false))
+        .toBe(true);
+      expect(await page.getByRole('button', { name: 'Start plan' }).isDisabled()).toBe(true);
+      // The click installed nothing: still the preview, not the runner.
+      expect(await page.getByRole('button', { name: 'Regenerate' }).isVisible()).toBe(true);
+      await page.getByRole('button', { name: 'Regenerate' }).click();
+      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
+      // Genuinely fresh now: the same click succeeds.
+      await page.getByRole('button', { name: 'Start plan' }).click();
+      await expect
+        .poll(() => page.getByRole('button', { name: 'End the plan' }).isVisible().catch(() => false))
+        .toBe(true);
+      await page.getByRole('button', { name: 'End the plan' }).click();
+
       await page.clock.setFixedTime(CLOCK);
       await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
 
diff --git a/tests/lesson-agenda.browser.test.ts b/tests/lesson-agenda.browser.test.ts
index fc3bcc0..7b82014 100644
--- a/tests/lesson-agenda.browser.test.ts
+++ b/tests/lesson-agenda.browser.test.ts
@@ -1,5 +1,13 @@
 import { describe, expect, it } from 'vitest';
-import { goTo, importBackup, importOutcome, openPracticeApp, reload } from './practiceBrowser';
+import {
+  goTo,
+  importBackup,
+  importOutcome,
+  openPracticeApp,
+  readPersistedState,
+  reload,
+  writePersistedState,
+} from './practiceBrowser';
 import v11 from './fixtures/practice-decisions-v11.json?raw';
 
 // ---------------------------------------------------------------------------
@@ -152,6 +160,42 @@ describe('the lesson agenda, end to end', () => {
       // Everything established above survived the refusal untouched.
       await expect.poll(() => classB.getByText('بله، سبک‌تر.').first().isVisible()).toBe(true);
       await expect.poll(() => classA.getByText(FARSI_QUESTION).first().isVisible()).toBe(true);
+
+      // --- 9. HYDRATION COMPLETES AN INCOMPLETE CURRENT-SCHEMA CONVERSION ---
+      // Zustand's persist middleware only calls `migrate` when the persisted
+      // version differs from the current one — a persisted v12 database that
+      // already carries a stray legacy field (an interrupted write, a bug in
+      // an earlier build) never reaches it that way. This writes directly
+      // into the app's own IndexedDB, the way an already-current device holds
+      // its state, bypassing every import door (which always runs
+      // `validateDB`, and so always runs the migration chain, regardless of
+      // the version a FILE claims).
+      const persisted = await readPersistedState(app);
+      expect(persisted.version).toBe(12);
+      const HYDRATION_ITEM = 'i-q-empty'; // has a preparation already, no question yet
+      const stateBefore = persisted.state as { db: { items: { id: string; teacherQuestion?: string }[] } };
+      const withLeftover = {
+        ...(persisted.state as Record<string, unknown>),
+        db: {
+          ...stateBefore.db,
+          items: stateBefore.db.items.map((i) =>
+            i.id === HYDRATION_ITEM ? { ...i, teacherQuestion: 'hydration leftover question' } : i,
+          ),
+        },
+      };
+      await writePersistedState(app, withLeftover, 12);
+      await reload(app);
+
+      // The leftover was completed LOSSLESSLY, not silently dropped: a real
+      // open question now exists for the item, reachable the ordinary way.
+      await goTo(app, `/items/${HYDRATION_ITEM}`);
+      await expect.poll(() => page.getByText('hydration leftover question').first().isVisible()).toBe(true);
+
+      // Idempotent: a SECOND, ordinary reload (now genuinely current, nothing
+      // left behind) creates no duplicate.
+      await reload(app);
+      await goTo(app, `/items/${HYDRATION_ITEM}`);
+      expect(await page.getByText('hydration leftover question').count()).toBe(1);
     } finally {
       await app.close();
     }
diff --git a/tests/practiceBrowser.ts b/tests/practiceBrowser.ts
index 9845449..32ec16c 100644
--- a/tests/practiceBrowser.ts
+++ b/tests/practiceBrowser.ts
@@ -132,3 +132,62 @@ export async function reload(app: PracticeApp): Promise<void> {
   await app.page.reload();
   await app.page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });
 }
+
+const KV_KEY = 'practice-compass';
+
+/**
+ * Read the raw bytes the app's own persist middleware would read on the next
+ * open — straight out of IndexedDB's `kv` store, not a JSON export shaped for
+ * the Settings importer. `{ state, version }` is exactly the shape Zustand's
+ * persist middleware writes and reads (`middleware.mjs`'s `setItem`/`hydrate`).
+ */
+export async function readPersistedState(app: PracticeApp): Promise<{ state: unknown; version: number }> {
+  return app.page.evaluate(
+    (key) =>
+      new Promise<{ state: unknown; version: number }>((resolve, reject) => {
+        const req = indexedDB.open('practice-compass');
+        req.onerror = () => reject(req.error);
+        req.onsuccess = () => {
+          const db = req.result;
+          const tx = db.transaction('kv', 'readonly');
+          const get = tx.objectStore('kv').get(key);
+          get.onsuccess = () => {
+            db.close();
+            resolve(JSON.parse((get.result as { value: string }).value));
+          };
+          get.onerror = () => reject(get.error);
+        };
+      }),
+    KV_KEY,
+  );
+}
+
+/**
+ * Write directly into the app's own IndexedDB `kv` store — the way an
+ * ALREADY-hydrated device holds its persisted state — bypassing every
+ * import/migration door entirely. The one way to reach the "persisted
+ * version already matches the current schema" hydration path: Zustand's
+ * persist middleware only calls `migrate` when the persisted version differs
+ * from the current one, and every JSON-import door runs `validateDB`
+ * regardless of what version a FILE claims.
+ */
+export async function writePersistedState(app: PracticeApp, state: unknown, version: number): Promise<void> {
+  await app.page.evaluate(
+    ({ key, state, version }) =>
+      new Promise<void>((resolve, reject) => {
+        const req = indexedDB.open('practice-compass');
+        req.onerror = () => reject(req.error);
+        req.onsuccess = () => {
+          const db = req.result;
+          const tx = db.transaction('kv', 'readwrite');
+          tx.objectStore('kv').put({ key, value: JSON.stringify({ state, version }) });
+          tx.oncomplete = () => {
+            db.close();
+            resolve();
+          };
+          tx.onerror = () => reject(tx.error);
+        };
+      }),
+    { key: KV_KEY, state, version },
+  );
+}
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

Practising (closing a block) is the ONLY thing that can complete a review or advance
SM‑2 — but it does not always do either. **Practice is exposure; only eligible retention
evidence advances spacing.** A good session on an item whose review is not yet due is real
practice (minutes, result, observation, next action all recorded) and is not the review it
was scheduled for: `decideReview` KEEPS the date, leaves `srReps`/`srEase`/`srIntervalDays`
untouched and leaves the pending row OPEN. `srLastProgressDay` holds that to at most one
advance per local calendar day, so re-arming a date or reloading cannot buy a second.
Nothing else may complete a review at all. "Not now" hides a due review for the rest of
today (no schedule change). Snooze
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
a manual- and an auto-mode item) asks the ENGINE whether its answer depends on the
judgement at all: it calls `planNextReview` once per result and returns true when all six
produce the same date. Reading `item.reviewMode === 'manual'` directly — which is what it
used to do — was a PROXY for that question, correct only while manual mode was the sole
way an item could have no per-result plan. It is not any more: a protected pending date
(one the owner chose, or a snooze) is kept for every result too, so a mode check would
clear a just-typed date on an auto-mode item whose date was never tied to a judgement
either. Calling the engine is still a boolean GATE on whether a per-result plan exists at
all, never a second value CloseBlock could render — CloseBlock keeps its single
derivation, and this function returns no date.

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
"prepare this FOR that class" — a `preparation` entry in the lesson agenda (see below),
which gives a priority boost climbing towards ITS OWN class's date
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

## Lesson commitments and questions are ONE typed collection (schema v12)

`PracticeDB.lessonAgenda` is the single home for "prepare this before that class" and
"ask this at that class" (`src/domain/lessonAgenda.ts`, pure and tested; queries in
`questions.ts`; UI in `src/components/LessonAgenda.tsx`). It replaced the item's rolling
`assignedForLesson` boolean and its single mutable `teacherQuestion` string, neither of
which could name WHICH class it meant or hold more than one answer.

- **Two kinds, one discriminated union.** `preparation` links an item to a lesson;
  `question` carries its own text, an OPTIONAL item, a lesson target and an open → asked
  lifecycle with an optional answer. Never separate independently toggleable booleans
  for next-class / asked / archived / completed.
- **A commitment names ITS OWN class, and that class's date is its only deadline.**
  `preparationDatesByItem` is the ONLY channel by which lesson intent reaches practice
  priority. A commitment for March never inherits January's deadline, a past commitment
  carries none, and an unassigned one carries none.
- **A QUESTION CHANGES NO PRACTICE PRIORITY, EVER.** It used to add three points and
  quietly reorder the day around a note to self.
- **An entry with no lesson is visibly UNASSIGNED, never guessed onto a class.** New
  entries default to the nearest upcoming lesson on that instrument with the date named
  on screen; with no future lesson they are captured unassigned.
- **Questions are selected BY LESSON ID** (`questionsForLessonId` /
  `openQuestionsForLessonId`), not by instrument — every future class used to show the
  identical list. `ClassQuestions` still exports them (Copy / Download / print), and a
  refused clipboard now says so in a live region and offers a selectable textarea.
- **Asked is explicit and reversible, and stays HISTORY.** Marking asked logs no
  practice and changes no urgency; the entry leaves the open lists, stays with the class
  it was asked at, and is never copied forward. An unasked question on a past class
  stays there until the owner explicitly moves it (`retargetEntry`).
- **Detaching preserves identity.** Deleting a lesson leaves its entries unassigned with
  `detachedFromLessonId` set; deleting an item removes its preparations (a commitment to
  prepare something that no longer exists means nothing) but KEEPS its questions with
  `detachedFromItemId` — a question and the teacher's answer are the owner's record of a
  class, not a property of the item. Nothing here deletes an item or its practice.
- **A question is never cleared by practising.** `CloseBlock` can raise one; it becomes
  its OWN entry and never overwrites another, and raising it does not commit the item to
  a class.

**The v11 → v12 migration converts legacy intent exactly once, and guesses nothing.**
`migrateToV12` turns each `assignedForLesson === true` into ONE unassigned preparation
and each non-empty `teacherQuestion` into ONE unassigned question — whatever the boolean
said, because the two were always independent facts. It reads NO clock (its timestamps
come from the item's own), so the same database migrates identically on two devices run
on different days. Multiline text stays ONE question. Ids are deterministic
(`prep:<itemId>` / `question:<itemId>`, with a `~2` suffix only when an unrelated entry
already owns one), the conversion is presence-aware, and the legacy fields are removed
only once their content is represented — so it is idempotent, including over an
already-current database whose agenda is legitimately empty.

**"REPRESENTED" MEANS SAME CONTENT, NOT MERELY A MATCHING ID.** A sealed review found
`represented()` treated a matching generated `id`/`kind`/`itemId` alone as proof a
question was already there — so a legacy `teacherQuestion` whose generated id happened to
already name a DIFFERENT existing question (partial migration, a hand-edited file, an
interrupted write) was silently DROPPED, because the pre-existing entry with the same id
looked like "already represented". A preparation carries no content beyond the link
itself, so any matching entry genuinely represents it, but a question's content IS its
text: `represented()` now also compares that text, and a same-id/different-text match
falls through to `freeId` exactly like an unrelated collision, so BOTH questions survive
under distinct ids. This step also now runs on EVERY inbound database, not only one
declaring `fromVersion < 12`: a database claiming the CURRENT schema can still carry a
stray `assignedForLesson`/`teacherQuestion` from an incomplete conversion, and gating on
the declared version silently accepted that leftover with nothing to show for it. Running
it unconditionally costs nothing extra on genuinely current data — it is a no-op wherever
neither legacy field survives.

**Inbound validation rejects invalid NEW intent and tolerates legacy debris — but only
where "legacy debris" is actually true.** `validateLessonAgenda` + `validateSchedulingFields`
run inside `validateDB`, before `replaceAllBlobs` and before any install: unknown kinds,
missing ids, duplicate ids, a missing instrument, empty question text, unreadable dates
and a target that RESOLVES to a different instrument all refuse the import with
actionable detail. A DANGLING `lessonId` is REFUSED: this app never leaves one dangling on
its own — `deleteLesson` always converts a live `lessonId` to `detachedFromLessonId` (see
`detachLesson`), so a `lessonId` that is neither absent nor resolving is invalid new
intent, not legacy debris to wave through. A sealed review reproduced `validateDB`
accepting `lessonId: 'nonexistent'` before this.

**A DANGLING LIVE `itemId` IS REFUSED FOR THE IDENTICAL REASON, NOT TOLERATED.** This
section previously tolerated it on the theory that the v11→v12 migration mints entries
from `db.items` at the moment it runs, so an item deleted afterwards could leave its own
agenda entries pointing at nothing. A sealed review found that theory does not hold
against the app's own REAL producer: `deleteItem` (`useStore.ts`) always calls
`detachItem` in the SAME synchronous update that removes the item — a preparation naming
it is removed outright, and a question's `itemId` is converted to `detachedFromItemId` —
so there is no in-app path that leaves a live `itemId` dangling any more than there is for
`lessonId`. Preparations and questions alike now require a PRESENT `itemId` to resolve to
a real item. A GENUINELY DETACHED record — `detachedFromItemId` set, `itemId` absent — is
unaffected: `detachItem` destructures `itemId` OUT rather than setting it `undefined`
(the same shape `detachLesson` already used for `lessonId`), so this strict check never
sees one to reject, and `io.test.ts` proves that against the real `detachItem` producer,
not a hand-built approximation of its shape.

**CALENDAR VALUES ARE CHECKED FOR REAL VALIDITY, INCLUDING A QUESTION'S OWN `askedAt`.**
`nextReviewDate`/`srLastProgressDay`/a review's `dueDate` (`isValidISODate`,
`scheduling.ts`) and a question's `askedAt` (`isValidISODateTime`, `lessonAgenda.ts`) all
round-trip their calendar components through `Date.UTC` rather than trusting a shape
regex or `Date.parse` alone: `/^\d{4}-\d{2}-\d{2}$/` (or its date-time equivalent) happily
matches `"2027-99-99"` and `"2026-02-30T12:00:00.000Z"`, and `Date.parse` silently
NORMALISES an out-of-range day (February 30th becomes March 2nd) rather than rejecting
it. A sealed review reproduced `askedAt` accepting exactly that string — the date-only
check had already been fixed once, but its date-TIME sibling in a different file had not.
The two checks stay small and separately owned, one per file, rather than merged into a
shared import.

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
Seventh/Eighth findings' — used seed data where an item's title and its teacher question
(then an item field, now a `lessonAgenda` entry) happen to share a language. That is exactly the one condition under which the underlying
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

The fix reverses which of the two is left bare. The lesson-agenda query behind this list
(`openQuestionsForLessonId`, formerly `questionsForNextClass`) guarantees `q.question` is
non-empty on every row this component ever renders — a question entry has no meaning
without its text; `q.title` carries no such guarantee and is authored completely independently.
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
THAT ANCHORS THE GROUP.** `ClassQuestions`' bulleted renderer for the question text and
`currentProblem`/`lastObservation` (one `<textarea>` each, so several
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

`decideReview` (in `scheduling.ts`) is the ONE pure decision behind closing a block: the
date disposition, the SM-2 transition and the sentence that explains them, together.
`planNextReview` previews it, `computeReviewOutcome` turns it into the write, and the
close screen renders it — three renderings of one value, never three derivations. Per
item it tracks `srReps` / `srEase` / `srIntervalDays`, plus `nextReviewSource` (who chose
the current date) and `srLastProgressDay` (the one-advance-per-day marker). Every number
is published in `docs/scheduling-evidence.md`.

**PRACTICE IS EXPOSURE; ONLY ELIGIBLE RETENTION EVIDENCE ADVANCES SPACING.** Eligible
means ALL THREE of: a logged `stable_alone` / `stable_in_context` / `performable`; at or
after the pending due date (or the first opportunity, when no date exists); and spacing
not already advanced today. Each of those independently blocks an advance. A missing,
`undefined` or `not_logged` result never advances — which is exactly what a routine block
is, so routine exposure can never become a retention judgement.

**`same` IS NOT FAILED RECALL.** This engine used to map it to a quality of 2, which fell
into the slip branch and reset a schedule the musician had every reason to trust. No
improvement is distinct from deterioration. Before a due date, `same` and
`slightly_better` change nothing; AT a due automatic review they REPEAT the current gap
(the configured first gap if there is none) without touching repetitions or ease, and
neither is ever described as a slip.

**ONLY `worse` MAY BRING AN AUTOMATIC DATE FORWARD**, to the EARLIER of the existing date
and the repair proposal — never later, so a repeated negative close cannot slide
tomorrow's repair into next week. Nothing else is read as failure: not duration, not
mode, not difficulty, not a teacher question, not a stale clock.

**A DATE THE OWNER OWNS IS NOT THE ENGINE'S TO MOVE.** A FUTURE date is PROTECTED when
the owner chose it (typed, snoozed, or re-armed — `nextReviewSource: 'user'`), when the
item is on a fixed cadence, or when its provenance predates this field and is therefore
unknown. Early practice, `worse` included, leaves it exactly where it is. Protection ends
when the date comes due: it is then the review, whoever chose it. Manual mode with no
newly chosen date preserves the pending schedule — an empty automatic proposal is not an
implicit "no".

**ONE ADVANCE PER ITEM PER LOCAL CALENDAR DAY**, recorded as `srLastProgressDay`. It is
an administrative eligibility marker, never a measured retention score: clearing and
re-arming the date, a reload, a sync, or simply closing a second block cannot buy a
second expansion.

**THE RATIONALE REPORTS THE FINAL SAVED DATE.** It used to quote the raw setting: a
three-day repair gap on an easy, unimportant item produced a four-day date and said
"three days".

**A CLOSE THAT ONLY KEEPS A DATE COMPLETES NOTHING.** `ReviewOutcome.completeOpenReviews`
is false for a `keep`, so extra practice before a review leaves that pending row OPEN —
it is not the review it was scheduled for. `closeOverrideDate` (`format.ts`, tested) is
the seam that makes this hold: the close screen SHOWS the date that will stand, which for
an early session is the item's existing one, and passing that back as an explicit
override would both stamp every engine-proposed date as the owner's and turn every keep
into a write. Only a date actually typed into the field is an override.

**"Schedule again" is administration, not practice.** `scheduleAgainPlan` sets ONE date on
the item and its pending row, CREATING the row when none is open (the case the old date
helper could not reach, which left a declined review unreachable from the item's own
screen). No block, no result, no statistics, no SM-2 movement.
`pendingScheduleConflict` REPORTS legacy open rows that disagree rather than silently
discarding one.

Keep it deterministic and explainable — don't turn it into an opaque model. Item status
labels are plain-language for the user — keep the enum keys stable and only change the
display labels in `labels.ts`.

**The engine is visible AND adjustable, never magic.** `SchedulingParams`
(`src/domain/types.ts`) holds bounded knobs — the SM-2 first/second/slip-reset gaps and
the Session Plan minute shares — persisted as an OPTIONAL `PracticeDB.settings` (schema
**v10**; `undefined ⇒ DEFAULT_SCHEDULING_PARAMS`, so old backups import unchanged and
`validateDB` carries the field through). `DEFAULT_SCHEDULING_PARAMS` reproduces the
historical constants EXACTLY — `decideReview`/`planNextReview` take an optional `params`
whose default is byte-identical to before (a snapshot test guards this). Every call site
that shows OR persists a date must thread the SAME params (`db.settings`): the store into
`closeSession`, `CloseBlock` into both preview calls — the date shown must equal the date
saved. `clampSchedulingParams` enforces the bounds (never trust raw input). Settings' "How
scheduling works" section states the real priority formula and the SM-2 rungs in plain
English with live values, offers bounded inputs + "Reset to recommended", and CloseBlock's
review row links to it ("Why this date?").

**"THE DATE SHOWN EQUALS THE DATE SAVED" ALSO HAS TO SURVIVE THE SAVE ITSELF, NOT JUST
THE RENDER.** `CloseBlock`'s `now` (`useDecisionNow`) only refreshes every 30 seconds plus
visibility/focus, while `closeSession` used to compute its OWN fresh `new Date()` at call
time — so a Save clicked in the narrow window after the local day had genuinely rolled,
but before either the poll or a visibility event caught up, could write a decision
`computeReviewOutcome` recomputed for TODAY while the screen had only ever shown
YESTERDAY's. A sealed review named this gap explicitly. `closeSession` now takes the
screen's own `now` (`CloseSessionInput.now`, defaulting to `new Date()` only for the rare
caller with no prior decision to keep in step) instead of reading a fresh clock at module
scope, so once a save actually proceeds it writes EXACTLY the value just previewed —
never a second, independently-computed one. The day check itself lives in `CloseBlock`:
`handleSave` compares the true instant against `now` first, and on a mismatch sets a
local `nowOverride` and returns WITHOUT calling `closeSession` — refreshing the decision
visibly (the date field, the rationale, everything derived from `now` recomputes) while
the draft (result, observation, next action, body note) is untouched, so the very next
Save simply works. This is deliberately a small, local override rather than a change to
`useDecisionNow`'s shared contract — `SessionPlan.tsx` and `LessonAgenda.tsx` also read
that hook and neither needed this.

## The Session Plan is a view over real blocks, not a new to-do list

The Session Plan (`src/domain/plan.ts`, pure + fully tested; `/plan` page) lays out one
time-budgeted session for the current instrument: ordered segments in five buckets
(`warmup · lesson · review · deep · cooldown`), each with minutes, a mode/focus, and a
one-sentence reason. It **reuses the same `scoreItems` priority numbers** as the
recommendation engine — no second, hidden ranking. It is organisation, never judgement:
no scores, no "optimal" claims, no gamification.

- **The invariant: minutes NEVER exceed the budget, and normally use all of it**
  (`buildSessionPlan`, `allocateMinutes` — weighted split, min 2 and max 25 per segment,
  drops the lowest-priority segments when the budget can't seat them all). An HONEST
  REMAINDER is allowed and stated in the summary: two items and two hours is not a reason
  to propose a sixty-minute block on each. Budgets are whole minutes from 5 to 120;
  anything else (non-finite, zero, out of range) is REJECTED at the boundary
  (`validateBudgetMinutes`) rather than clamped into a session the owner never chose.
  Keep it deterministic (explicit `now`, stable score-desc-then-id tiebreaks) and keep
  the edge cases green (0 items, 1 item, resting-only, everything practised-today →
  repeats honestly and says so). `redistributePlan`/`swapSegment` are the pure editors and
  preserve each segment's identity, role and reason; the preview page tweaks a LOCAL copy
  before `startPlan`.
- **THE ANCHOR COMES FROM REAL URGENCY, BEFORE ANY ROLE DECORATION.** A five-minute
  session used to pre-select new deep work and only then consider an item committed for
  tomorrow's class. Under 12 minutes the session is ONE useful main focus, no warm-up and
  no cool-down. Usable material, improvisation, rhythm and theory are ordinary useful
  work even though they fit none of the old buckets.
- **Warm-up is a ROLE an ordinary familiar item fills, never a tag.** `isWarmupSuitable`
  wants low demand (difficulty ≤ 3) AND evidence of familiarity (a settled status or 3+
  real sessions) — an unfamiliar demanding étude is not a warm-up because it is labelled
  "technique". It never consumes a due review or a class commitment, its share
  (`warmupShare`) is a PINNED allocation target rather than a weight, and with nothing
  suitable it is omitted honestly.
- **ONE eligibility policy** (`isProactiveCandidate`) across Today, the initial build,
  regeneration, swaps and every fallback: resting material never surfaces in a
  suggestion, and a fallback never widens to reach it. Direct, deliberate practice of a
  resting item stays available and its review data is untouched.
- **A SWAP SHARES THE BUILD'S OWN CANDIDATE POOL, NOT JUST ITS ELIGIBILITY POLICY.** A
  sealed review found `swapSegment` filtering by `isProactiveCandidate` alone and then
  searching `scored` directly — bypassing the build's OWN practised-today exclusion
  (`candidatePool`, shared by both now) and the warm-up pool's extra due/lesson
  exclusions. Concretely: three same-instrument usable items scored 5/4/3 with the
  middle one practised one minute ago today; a five-minute build correctly stepped past
  it for the fresher lowest-scoring one, but Swap handed it right back because fresh
  work scored lower — the exact material the build had just deliberately set aside, with
  an ordinary "focus" reason as if nothing were off. A warm-up swap could likewise reach
  a candidate that was due for review or committed to a class, which the build's own
  warm-up pool excludes on purpose (that slot belongs to the actual need, never spent as
  a warm-up). `candidatePool` (`plan.ts`) is now the ONE practised-today/repeat-fallback
  computation both `buildSessionPlan` and `swapSegment` draw from, and swap's own
  eligibility switch repeats the warm-up bucket's due/lesson exclusion verbatim. Swap
  deliberately does NOT replay the build's diversity preference (a tie-break among
  segments chosen together in one pass, which a single substitution has none of) — see
  `swapSegment`'s own docstring for why that is a documented choice, not an oversight.
- **Over-practice is bounded, decaying recent MINUTES**, not a block count and not a run
  of identical results (`recentExposureMinutes`, `exposurePenalty`). Three "same" results
  in January are a strategy hint in January, not a permanent penalty in September, and
  one 30-minute session is the same exposure as three 10-minute ones. A modest diversity
  preference (≤ 2 points, from the item's existing strand/type) is subordinate to every
  real need.
- **A preview is rebuilt for what it is FOR** — instrument and budget — and is marked as
  needing regeneration when the underlying practice data changes beneath it, rather than
  silently starting stale work. `beginPlanSegment` revalidates the item LIVE
  (`planSegmentStartable`): deleted or moved to another instrument ⇒ visibly skipped,
  another clock running ⇒ refused. Skipping logs nothing.
- **A PLAN CAN GO STALE WITH NO DATABASE WRITE AT ALL: THE CLOCK MOVING PAST IT.**
  `SessionPlan.tsx` tracked staleness only via `rev` (the store's mutation counter) and a
  `seedKey` of `instrumentId|budget` — neither moves when a preview is simply left open
  across local midnight. A sealed review reproduced this: yesterday's segments, reasons
  and "for today's class" labels stayed on screen and startable with the Start button
  enabled, because `build` (the live recomputation) had quietly changed underneath while
  nothing told the visible `plan` state to notice. The preview now also tracks the LOCAL
  CALENDAR DAY it was built for (`baseDay`, set alongside `baseRev`) and is `stale`
  whenever `rev` OR the day has moved — the same "mark it, don't silently rewrite it"
  treatment `rev` already got, so a deliberate swap or removal survives a midnight
  exactly as it survives any other change underneath the plan.
- **THE PASSIVE `stale` FLAG ABOVE STILL LAGS THE TRUE INSTANT BY UP TO ITS OWN POLL
  INTERVAL — STARTING A PLAN CANNOT TRUST IT ALONE.** `stale` is derived from
  `useDecisionNow`'s own `now`, which refreshes at most every 30 seconds plus
  visibility/focus — a real device left untouched across local midnight, with no event to
  fire and no poll due yet, still reads `stale === false` and shows an ENABLED Start
  button for up to that whole window. A sealed review reproduced this against the real
  wiring: build at 23:59:59, click Start at 00:00:01 with no dispatched event, and the old
  code installed yesterday's selections. Starting a plan is an authority boundary, so
  `start()` (`SessionPlan.tsx`) checks a FRESH `new Date()` against `baseDay` directly —
  via the extracted pure `planPreviewDayHasPassed(baseDay, now)` (`plan.ts`), the same rule
  `stale`'s own day comparison already applies, just evaluated against the true instant
  instead of the polled one — before ever calling `startPlan`. A mismatch refuses the
  start and sets a small local `nowOverride` (the same shape `CloseBlock`'s own Save-race
  guard already uses) so `now`/`today`/`stale` immediately catch up and the existing
  banner and disabled button render — a visible refusal, never a silent no-op click. This
  does not touch the `rev`-based half of `stale`: a store mutation already re-renders the
  subscribed component synchronously, so only the CLOCK side of staleness can lag behind a
  click in the first place.
- **The plan runs REAL practice blocks — it is not a countdown.** `RoutineRunner` (the
  warm-up timer) stays untouched. The runner orchestrates the existing
  start→`/active`→`/close` flow: "Start this segment" = `beginPlanSegment` seeded from the
  segment (its minutes become the target). `closeSession` has a tail that, when a plan is
  running and the closed block was the current segment, marks it `done` and advances the
  pointer — **the plain flow (no active plan) is byte-identical to before.** Skipping logs
  nothing. Practising is still the only thing that CAN complete a review or advance SM-2,
  and a plan segment closed before that item's review is due keeps the date and the
  spacing state exactly as an ordinary early session does.
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
  `SCHEMA_VERSION`. Rehydration reaches it via BOTH halves of the persist middleware —
  `migrate` when the persisted version differs from the current one, `merge`
  UNCONDITIONALLY otherwise — because Zustand skips `migrate` entirely once the persisted
  version already matches, which would otherwise let an already-current database carry a
  stray legacy field forever (a sealed review reproduced exactly this; see the
  lesson-agenda section above for the fix and why re-running the conversion a second time
  is safe). Schema **v12** converts legacy lesson intent into `lessonAgenda` and
  adds the two scheduling-metadata fields (`nextReviewSource`, `srLastProgressDay`) —
  neither is ever guessed for old data, so an existing future date keeps UNKNOWN
  provenance and is protected accordingly. Schema **v11** backfills a routine's `instrumentId` from the pathway
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

**Two of them drive the REAL app in a real browser.**
`tests/daily-practice.browser.test.ts` and `tests/lesson-agenda.browser.test.ts` are
ordinary Vitest tests using Playwright as a LIBRARY through `tests/practiceBrowser.ts`,
so their results land in the same report everything else does — a standalone Playwright
run would prove nothing to the check engine. Each starts its own Vite dev server and its
own browser CONTEXT (its own IndexedDB, its own localStorage, no GitHub and no NAS), at a
390×844 viewport, with the clock fixed so every derived date is deterministic. They seed
themselves by importing a fixture through the real Settings control and drive rendered
controls by role and name — never a debug hook, never a source regex.

Local setup, once: `npx playwright install chromium`. **A missing browser FAILS these
tests with that instruction; it never skips them** — a check that quietly passes because
it did not run is worse than no check at all. All three CI workflows install the browser
before `npm test` for the same reason.

`tests/fixtures/practice-decisions-v11.json` is the legacy (pre-agenda) database; the
v12 one is its migrated output plus the scheduling state a v12 build writes. The unit
tests read the SAME bytes the journeys import, through Vite's `?raw`.

## Roadmap items are allowed (they were designed for)

Audio recording attachment, PWA offline install, CSV export, calendar reminders, a
simple audio note per block, teacher‑sharing PDF. These extend the tool without breaking
the philosophy. Anything that contradicts the "do nots" above needs an explicit decision
from the user, recorded here.
```

### src/domain/io.test.ts

```
import { describe, expect, it } from 'vitest';
import V11_TEXT from '../../tests/fixtures/practice-decisions-v11.json?raw';
import V12_TEXT from '../../tests/fixtures/practice-decisions-v12.json?raw';
import { serializeExport, validateDB, parseImport } from './io';
import { migrateToCurrent } from './migrations';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
import { createPreparation, createQuestion, detachItem, detachLesson } from './lessonAgenda';
import { SCHEMA_VERSION, type PracticeDB } from './types';
import { addDays, nowISO, toISODate } from './util';

const NOW = new Date('2026-06-18T12:00:00.000Z');

describe('validateDB — backward-compatible import', () => {
  it('round-trips a current export untouched', () => {
    const db = createSeedDB(NOW);
    const out = validateDB({ app: 'practice-compass', data: db });
    expect(out.items.length).toBe(db.items.length);
    expect(out.lessons.length).toBe(db.lessons.length);
  });

  it('folds a legacy attachment itemId into ownerType and ownerId', () => {
    const db = createSeedDB(NOW);
    const legacy = {
      ...db,
      schemaVersion: 5,
      attachments: [
        { id: 'att1', itemId: db.items[0].id, name: 'afshari.pdf', mime: 'application/pdf', size: 100, kind: 'pdf', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(db.items[0].id);
    expect((out.attachments[0] as unknown as { itemId?: string }).itemId).toBeUndefined();
  });

  it('keeps modern owner-shaped attachments and lesson item links as-is', () => {
    const db = createSeedDB(NOW);
    const lesson = createLesson({ instrumentId: db.instruments[0].id, date: '2026-06-01' }, NOW);
    lesson.itemIds = [db.items[0].id];
    const withData = {
      ...db,
      lessons: [...db.lessons, lesson],
      attachments: [
        { id: 'a2', ownerType: 'lesson' as const, ownerId: lesson.id, name: 'notes.pdf', mime: 'application/pdf', size: 5, kind: 'pdf' as const, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(withData);
    expect(out.attachments[0].ownerType).toBe('lesson');
    expect(out.lessons.find((l) => l.id === lesson.id)?.itemIds).toEqual([db.items[0].id]);
  });

  it('rejects unusable shapes with a readable error', () => {
    expect(parseImport('not json').ok).toBe(false);
    expect(parseImport(JSON.stringify({ items: 'nope' })).ok).toBe(false);
  });

  it('treats a missing schemaVersion as the oldest and runs the whole chain', () => {
    // Pre-v3 shaped: no `pathways` key at all, and no schemaVersion field.
    const legacy = {
      instruments: [{ id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
      materials: [],
      items: [],
      blocks: [],
      reviews: [],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
  });

  it('places a legacy pathwaySteps item into its stage on every path', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: 'stale-stage' };
    const legacy = {
      ...db,
      schemaVersion: 4,
      items: [item],
      // Truncated to one item on purpose (this test is about pathwaySteps,
      // not lesson agenda) — the seed's OWN agenda entries would otherwise
      // dangle against every item but this one, which the strict live-itemId
      // check now (correctly) refuses.
      lessonAgenda: [],
      pathwaySteps: [{ itemId: item.id, stageId: 'correct-stage' }],
    };
    // migrateToV5's overwrite behaviour wins over the old "fill only when
    // empty" precedence — the same result whichever path the data arrived by:
    // the chain directly, and the real import entry point.
    const viaChain = migrateToCurrent(legacy as unknown as PracticeDB, 4);
    expect(viaChain.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
    const viaImport = validateDB(legacy);
    expect(viaImport.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
  });

  it('returns a legacy backup with no schemaVersion fully migrated', () => {
    const db = createSeedDB(NOW);
    const item = db.items[0];
    const legacy: Record<string, unknown> = {
      instruments: db.instruments,
      materials: db.materials,
      items: [{ ...item, stageId: undefined }],
      blocks: db.blocks,
      reviews: db.reviews,
      pathwaySteps: [{ itemId: item.id, stageId: 'legacy-stage' }],
      attachments: [
        { id: 'att-legacy', itemId: item.id, name: 'notes.pdf', mime: 'application/pdf', size: 10, kind: 'pdf', createdAt: '2025-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
    expect(out.items.find((i) => i.id === item.id)?.stageId).toBe('legacy-stage');
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(item.id);
    expect(out.lessons).toEqual([]);
  });

  it('rejects a database from a newer schema version instead of downgrading it', () => {
    const db = createSeedDB(NOW);
    const fromTheFuture = {
      app: 'practice-compass' as const,
      schemaVersion: SCHEMA_VERSION + 1,
      exportedAt: nowISO(NOW),
      data: { ...db, schemaVersion: SCHEMA_VERSION + 1 },
    };
    const result = parseImport(JSON.stringify(fromTheFuture));
    expect(result.ok).toBe(false);
    expect(() => validateDB(fromTheFuture)).toThrow(/newer version/i);
  });

  it('keeps legacy pathwaySteps placements when imported through the real entry point', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: undefined };
    const legacyText = JSON.stringify({
      ...db,
      schemaVersion: undefined,
      items: [item],
      // Truncated to one item on purpose (see the sibling test above).
      lessonAgenda: [],
      pathwaySteps: [{ itemId: item.id, stageId: 'from-pathway-steps' }],
    });
    const result = parseImport(legacyText);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.db.items.find((i) => i.id === item.id)?.stageId).toBe('from-pathway-steps');
    }
  });
});

describe('blocksInWindow — history stays historical', () => {
  const item = createItem({ instrumentId: 'i', title: 't' }, NOW);
  const at = (daysAgo: number) =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: 'i',
        durationMinutes: 10,
        mode: 'learn',
        focus: 'tone',
        result: 'slightly_better',
        startedAt: addDays(NOW, -daysAgo).toISOString(),
      },
      NOW,
    );

  it('excludes future-dated blocks from insight windows', () => {
    const blocks = [at(1), at(3), at(-2)]; // one block "from the future"
    const windowed = blocksInWindow(blocks, NOW, 7);
    expect(windowed).toHaveLength(2);
    expect(windowed.every((b) => new Date(b.startedAt) <= NOW)).toBe(true);
  });

  it('still bounds the window at N days back', () => {
    const blocks = [at(1), at(10)];
    expect(blocksInWindow(blocks, NOW, 7)).toHaveLength(1);
  });
});

describe('per-instrument lesson dates', () => {
  it('nextLessonDates maps each instrument only to its own next class', () => {
    const lessons = [
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 5)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 30)) }, NOW),
      createLesson({ instrumentId: 'tar', date: toISODate(addDays(NOW, 2)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, -10)) }, NOW), // past
    ];
    const map = nextLessonDates(lessons, NOW);
    expect(map.get('setar')).toBe(toISODate(addDays(NOW, 5)));
    expect(map.get('tar')).toBe(toISODate(addDays(NOW, 2)));
    expect(map.get('guitar')).toBeUndefined();
    expect(nextLessonFor(lessons, 'guitar', NOW)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ac-15 — C5/C6/C7: every inbound door, and what must be refused at it
// ---------------------------------------------------------------------------

// The exact bytes the browser journeys import through the real UI.

/** The shapes `validateDB` accepts, i.e. every door an inbound database uses. */
function doors(text: string): { label: string; payload: unknown }[] {
  const wrapped = JSON.parse(text) as { data: unknown };
  return [
    { label: 'full backup (data + files)', payload: JSON.parse(text) },
    { label: 'wrapped export', payload: { app: 'practice-compass', schemaVersion: 11, data: wrapped.data } },
    { label: 'bare database', payload: wrapped.data },
  ];
}

describe('the v12 model at every inbound door', () => {
  it('all inbound paths preserve the new model or reject before replacement', () => {
    // 1. Every door migrates identically. `importFullBackup` (manual import,
    //    sync pull, Keep remote, archive restore) and the store's own
    //    `importDB` all route through THIS function, so a door that behaved
    //    differently would have to bypass it.
    const reference = JSON.stringify(validateDB(JSON.parse(V11_TEXT)));
    for (const { label, payload } of doors(V11_TEXT)) {
      expect(JSON.stringify(validateDB(payload)), label).toBe(reference);
    }

    // 2. A CURRENT v12 database round-trips with its agenda, question history,
    //    scheduling provenance and one-advance-per-day marker intact.
    const v12 = validateDB(JSON.parse(V12_TEXT));
    const enriched: PracticeDB = {
      ...v12,
      items: v12.items.map((i) =>
        i.id === 'i-scheduled'
          ? { ...i, nextReviewSource: 'user' as const, srLastProgressDay: '2026-08-01' }
          : i,
      ),
      lessonAgenda: v12.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-farsi'
          ? { ...e, askedAt: '2026-08-02T10:00:00.000Z', answer: 'بله، زینت را سبک‌تر کن.' }
          : e,
      ),
    };
    const round = validateDB(JSON.parse(serializeExport(enriched)));
    expect(round.lessonAgenda).toEqual(enriched.lessonAgenda);
    const scheduled = round.items.find((i) => i.id === 'i-scheduled')!;
    expect(scheduled.nextReviewSource).toBe('user');
    expect(scheduled.srLastProgressDay).toBe('2026-08-01');
    expect(scheduled.srReps).toBe(3);
    expect(scheduled.reviewMode).toBe('manual');

    // 3. INVALID NEW DATA is refused with actionable detail, and nothing is
    //    filtered away quietly — dropping an entry the owner wrote is the
    //    data loss this guard exists to prevent.
    const bad = (agenda: unknown[]) => () => validateDB({ ...v12, lessonAgenda: agenda });
    const sample = v12.lessonAgenda[0];
    expect(bad([{ ...sample, kind: 'reminder' }])).toThrow(/unknown kind/);
    expect(bad([{ ...sample, id: undefined }])).toThrow(/missing an id/);
    expect(bad([sample, { ...v12.lessonAgenda[1], id: sample.id }])).toThrow(/share the id/);
    expect(bad([{ ...sample, instrumentId: '' }])).toThrow(/missing its instrument/);
    expect(bad([{ ...sample, lessonId: 'L-guitar-past' }])).toThrow(/different instrument/);
    expect(bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: '  ' }])).toThrow(/has no text/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: 'yesterday' }]),
    ).toThrow(/unreadable asked date/);
    // An IMPOSSIBLE calendar timestamp is refused too, not merely an
    // unparseable one: `Date.parse` silently NORMALISES "2026-02-30" into
    // March 2nd rather than rejecting it, so a shape check (or `Date.parse`
    // alone) happily accepted it before this. A sealed review reproduced
    // exactly this string passing.
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: '2026-02-30T12:00:00.000Z' }]),
    ).toThrow(/unreadable asked date/);
    // A DANGLING live `lessonId` — set, but resolving to nothing — is neither
    // a real agenda entry nor an honest unassigned one: `deleteLesson` always
    // converts a live reference to a detached marker, so this app never
    // leaves one dangling, and it is refused rather than tolerated as legacy
    // debris.
    expect(bad([{ ...sample, lessonId: 'nonexistent' }])).toThrow(/class that no longer exists/);
    // A dangling `itemId` is REFUSED for the identical reason, not tolerated:
    // `deleteItem` (`useStore.ts`) always calls `detachItem` in the SAME
    // synchronous update that removes the item — a preparation naming it is
    // removed outright, and a question's `itemId` becomes
    // `detachedFromItemId` — so this app never leaves a LIVE `itemId`
    // dangling any more than a `lessonId`. A sealed review found this
    // previously tolerated on a theory the real producer above does not
    // support.
    expect(
      bad([{ kind: 'preparation', id: 'p', instrumentId: 'setar', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(() => validateDB({ ...v12, lessonAgenda: 'nope' })).toThrow(/must be a list/);
    // Calendar values are checked for real, not merely shape: a due date and
    // an item's own next-review date must both name a date that exists.
    expect(() =>
      validateDB({ ...v12, items: v12.items.map((i) => (i.id === 'i-scheduled' ? { ...i, nextReviewDate: '2027-99-99' } : i)) }),
    ).toThrow(/unreadable next-review date/);
    expect(() =>
      validateDB({ ...v12, reviews: v12.reviews.map((r) => ({ ...r, dueDate: '2026-02-30' })) }),
    ).toThrow(/unreadable due date/);
    // An INCOMPLETE conversion — a legacy field still set with no entry to
    // represent it — is converted rather than accepted as-is, because the
    // chain runs on every inbound database whatever version it claims.
    // Declaring schema 12 (the CURRENT version, not a legacy 11) is the real
    // counterexample: a version-gated conversion step would skip this
    // database entirely and accept the leftover field with zero questions to
    // show for it.
    const halfConverted = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'left behind' } : i)),
    });
    expect(halfConverted.lessonAgenda.some((e) => e.kind === 'question' && e.text === 'left behind')).toBe(true);
    // A generated id that already names a DIFFERENT existing question is not
    // "already represented" merely by matching id/kind/itemId — the content
    // has to agree too. Both survive under distinct ids.
    const halfConvertedConflict = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'a brand new question' } : i)),
      lessonAgenda: [
        ...v12.lessonAgenda,
        {
          id: 'question:i-flag-false',
          kind: 'question' as const,
          itemId: 'i-flag-false',
          instrumentId: 'setar',
          text: 'a completely different pre-existing question',
          createdAt: '2026-08-01T09:00:00.000Z',
          updatedAt: '2026-08-01T09:00:00.000Z',
        },
      ],
    });
    const conflictEntry = halfConvertedConflict.lessonAgenda.find((e) => e.id === 'question:i-flag-false');
    expect(conflictEntry?.kind === 'question' ? conflictEntry.text : undefined).toBe(
      'a completely different pre-existing question',
    );
    expect(
      halfConvertedConflict.lessonAgenda.some(
        (e) => e.kind === 'question' && e.itemId === 'i-flag-false' && e.text === 'a brand new question',
      ),
    ).toBe(true);

    // 4. LEGITIMATE unassigned and detached historical records PASS — proven
    //    against the REAL producer, not a hand-built approximation of its
    //    shape. `detachLesson` destructures `lessonId` OUT rather than
    //    setting it undefined; a JSON round-trip must still read that as
    //    genuinely absent, not as a lingering `null`/`undefined` key.
    const attached = createPreparation({ id: 'prep:real', itemId: 'i-premigrated', instrumentId: 'setar', lessonId: 'L-setar-1', now: NOW });
    const [reallyDetached] = JSON.parse(JSON.stringify(detachLesson([attached], 'L-setar-1', NOW))) as typeof v12.lessonAgenda;
    expect(reallyDetached).not.toHaveProperty('lessonId');
    expect(reallyDetached).toMatchObject({ detachedFromLessonId: 'L-setar-1' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetached] })).not.toThrow();
    // The item-side equivalent, against the REAL producer `detachItem`
    // (`deleteItem`'s own path) rather than a hand-built approximation: it
    // destructures `itemId` OUT rather than setting it undefined, so the
    // strict live-itemId check just proven above must never see one here.
    const questionOnItem = createQuestion({ id: 'q:real', text: 'Real question', itemId: 'i-premigrated', instrumentId: 'setar', now: NOW });
    const [reallyDetachedQuestion] = JSON.parse(
      JSON.stringify(detachItem([questionOnItem], 'i-premigrated', NOW)),
    ) as typeof v12.lessonAgenda;
    expect(reallyDetachedQuestion).not.toHaveProperty('itemId');
    expect(reallyDetachedQuestion).toMatchObject({ detachedFromItemId: 'i-premigrated' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetachedQuestion] })).not.toThrow();
    expect(() =>
      validateDB({
        ...v12,
        lessonAgenda: [
          { ...sample, lessonId: undefined, detachedFromLessonId: 'L-setar-past' },
          {
            kind: 'question',
            id: 'q-detached',
            instrumentId: 'setar',
            text: 'Asked about a piece I have since deleted',
            askedAt: '2026-02-01T00:00:00.000Z',
            answer: 'Yes.',
            detachedFromItemId: 'long-gone',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
        ],
      }),
    ).not.toThrow();

    // 5. A NEWER schema is still refused outright rather than silently
    //    downgraded and stripped of whatever it added.
    expect(() => validateDB({ ...v12, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);

    // 6. No fake repair of old data: the v11 fixture's dangling instrument
    //    reference survives exactly as it arrived.
    const migrated = validateDB(JSON.parse(V11_TEXT));
    expect(migrated.items.find((i) => i.id === 'i-dangling')?.instrumentId).toBe('gone');
    expect(migrated.lessonAgenda.find((e) => e.itemId === 'i-dangling')?.instrumentId).toBe('gone');
  });
});

// ---------------------------------------------------------------------------
// ac-16 — C8: the rollout / rollback route
// ---------------------------------------------------------------------------

describe('the documented rollback route', () => {
  it('rollback fixtures preserve exports without pretending v12 can be downgraded', () => {
    // The owner's PRE-UPGRADE export restores into this build, upgrading
    // deterministically — the same result twice, whatever day it is run.
    const first = validateDB(JSON.parse(V11_TEXT));
    const second = validateDB(JSON.parse(V11_TEXT));
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.schemaVersion).toBe(SCHEMA_VERSION);

    // Attachment METADATA and the fixture's file bytes both survive the trip:
    // the metadata through the database, the bytes as the backup's own files
    // array, which `importFullBackup` writes before the data is installed.
    expect(first.attachments).toHaveLength(1);
    expect(first.attachments[0]).toMatchObject({ id: 'att-1', ownerType: 'item', ownerId: 'i-scheduled' });
    const files = (JSON.parse(V11_TEXT) as { files: { id: string; data: string }[] }).files;
    expect(files.map((f) => f.id)).toEqual(['att-1']);
    expect(atob(files[0].data)).toBe('score bytes');

    // A POST-UPGRADE export keeps everything v12 added — answers, manual
    // dates, provenance and SR state.
    const answered: PracticeDB = {
      ...first,
      lessonAgenda: first.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-only'
          ? { ...e, lessonId: 'L-setar-1', askedAt: '2027-03-05T10:00:00.000Z', answer: 'Tone first.' }
          : e,
      ),
    };
    const restored = validateDB(JSON.parse(serializeExport(answered)));
    const q = restored.lessonAgenda.find((e) => e.kind === 'question' && e.itemId === 'i-q-only')!;
    expect(q).toMatchObject({ lessonId: 'L-setar-1', answer: 'Tone first.' });
    expect(q.kind === 'question' && q.askedAt).toBe('2027-03-05T10:00:00.000Z');
    const manual = restored.items.find((i) => i.id === 'i-scheduled')!;
    expect(manual.nextReviewDate).toBe('2027-01-15');
    expect(manual.srEase).toBe(2.6);

    // THERE IS NO DOWNGRADE. An older build refuses a v12 file outright, and
    // this build must not pretend otherwise by rewriting the number or
    // dropping the new fields: the exported file says 12 and carries them.
    const exported = JSON.parse(serializeExport(answered)) as { schemaVersion: number; data: PracticeDB };
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
    expect(exported.data.lessonAgenda.length).toBeGreaterThan(0);
    expect(() => validateDB({ ...first, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);
    // An old v11 build can only restore an explicitly chosen PRE-upgrade
    // backup — which still exists, unchanged, and still says 11.
    expect((JSON.parse(V11_TEXT) as { schemaVersion: number }).schemaVersion).toBe(11);
  });
});
```

### src/domain/lessonAgenda.ts

```
import type {
  ID,
  ISODate,
  ISODateTime,
  Lesson,
  LessonAgendaEntry,
  LessonPreparation,
  LessonQuestion,
  PracticeDB,
} from './types';
import { nowISO, todayISODate } from './util';

// ---------------------------------------------------------------------------
// The lesson agenda — one typed collection for "prepare this for that class"
// and "ask this at that class".
//
// Everything here is pure and takes an explicit `now`. Two things this module
// exists to keep apart, because the app used to conflate them in one boolean
// and one string on the item:
//
//   • A PREPARATION names a specific lesson, and that lesson's OWN date is the
//     only deadline it carries. A later commitment can never inherit an
//     earlier class's urgency, and an unassigned or past commitment carries
//     none at all.
//   • A QUESTION is not preparation. It changes no practice priority ever. It
//     keeps its own text, so several questions never overwrite each other, and
//     once asked it stays with the lesson it was asked at — historical, never
//     automatically carried forward to the next class.
// ---------------------------------------------------------------------------

export function isPreparation(e: LessonAgendaEntry): e is LessonPreparation {
  return e.kind === 'preparation';
}

export function isQuestion(e: LessonAgendaEntry): e is LessonQuestion {
  return e.kind === 'question';
}

/** Open = not yet asked. Asked entries leave the upcoming/open lists. */
export function isOpenQuestion(e: LessonAgendaEntry): e is LessonQuestion {
  return isQuestion(e) && !e.askedAt;
}

/** A commitment with no named lesson — visibly unassigned, never invented. */
export function isUnassigned(e: LessonAgendaEntry): boolean {
  return !e.lessonId;
}

export function entriesForInstrument(agenda: LessonAgendaEntry[], instrumentId: ID): LessonAgendaEntry[] {
  return agenda.filter((e) => e.instrumentId === instrumentId);
}

export function entriesForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonAgendaEntry[] {
  return agenda.filter((e) => e.lessonId === lessonId);
}

export function preparationsForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonPreparation[] {
  return entriesForLesson(agenda, lessonId).filter(isPreparation);
}

export function questionsForLesson(agenda: LessonAgendaEntry[], lessonId: ID): LessonQuestion[] {
  return entriesForLesson(agenda, lessonId).filter(isQuestion);
}

/**
 * Unassigned entries for one instrument — what the owner still has to point at
 * a class. This is the honest home for everything the v12 migration converted:
 * the old data recorded no target, so none is invented for it.
 */
export function unassignedForInstrument(agenda: LessonAgendaEntry[], instrumentId: ID): LessonAgendaEntry[] {
  return entriesForInstrument(agenda, instrumentId).filter(isUnassigned);
}

/** Every preparation commitment naming this item, whatever its target. */
export function preparationsForItem(agenda: LessonAgendaEntry[], itemId: ID): LessonPreparation[] {
  return agenda.filter(isPreparation).filter((e) => e.itemId === itemId);
}

/** Every question concerning this item, open or asked. */
export function questionsForItem(agenda: LessonAgendaEntry[], itemId: ID): LessonQuestion[] {
  return agenda.filter(isQuestion).filter((e) => e.itemId === itemId);
}

/**
 * The lesson a NEW entry defaults to: the nearest lesson today or later on that
 * instrument. With no future lesson this is `undefined` — capture the entry
 * unassigned rather than inventing a class that does not exist (§C2).
 */
export function defaultTargetLesson(lessons: Lesson[], instrumentId: ID, now: Date): Lesson | undefined {
  const today = todayISODate(now);
  return lessons
    .filter((l) => l.instrumentId === instrumentId && l.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0];
}

/**
 * Per ITEM, the nearest date it is genuinely committed to prepare for: the
 * earliest lesson that is today or later, on the entry's own instrument, that
 * an existing preparation entry actually names.
 *
 * This is the ONLY channel by which lesson intent reaches practice priority.
 * A question contributes nothing. An unassigned commitment contributes
 * nothing. A commitment whose lesson has already passed contributes nothing —
 * its deadline is gone, and reading it as "still due" is exactly how a rolling
 * boolean used to keep an item permanently urgent. A commitment naming a
 * LATER class contributes that later date, never the nearest one.
 */
export function preparationDatesByItem(
  agenda: LessonAgendaEntry[],
  lessons: Lesson[],
  now: Date,
): Map<ID, ISODate> {
  const today = todayISODate(now);
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const out = new Map<ID, ISODate>();
  for (const e of agenda) {
    if (!isPreparation(e) || !e.lessonId) continue;
    const lesson = byId.get(e.lessonId);
    // A target on another instrument is not a valid commitment for this item.
    if (!lesson || lesson.instrumentId !== e.instrumentId) continue;
    if (lesson.date < today) continue;
    const cur = out.get(e.itemId);
    if (!cur || lesson.date < cur) out.set(e.itemId, lesson.date);
  }
  return out;
}

/** Item ids with a live (today-or-later) preparation commitment. */
export function itemsPreparedForLesson(agenda: LessonAgendaEntry[], lessons: Lesson[], now: Date): Set<ID> {
  return new Set(preparationDatesByItem(agenda, lessons, now).keys());
}

// --- Transforms -------------------------------------------------------------
//
// Every one returns a NEW array and touches only the entry it names. None of
// them logs practice, completes a review, or moves any spacing state — an
// agenda action is administration, never evidence.

function touch<T extends LessonAgendaEntry>(e: T, now: Date): T {
  return { ...e, updatedAt: nowISO(now) };
}

/** Mark a question asked, optionally recording the teacher's answer. */
export function markQuestionAsked(
  agenda: LessonAgendaEntry[],
  id: ID,
  now: Date,
  answer?: string,
): LessonAgendaEntry[] {
  return agenda.map((e) =>
    e.id === id && isQuestion(e)
      ? touch({ ...e, askedAt: e.askedAt ?? nowISO(now), answer: answer?.trim() || e.answer }, now)
      : e,
  );
}

/** Put an asked question back on the open list — explicit and reversible. */
export function reopenQuestion(agenda: LessonAgendaEntry[], id: ID, now: Date): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.id !== id || !isQuestion(e)) return e;
    // Destructure the field OUT rather than setting it undefined: an
    // `askedAt: undefined` key survives JSON round-trips as a present key in
    // some shapes, and "open" must mean the field is genuinely absent.
    const rest = { ...e };
    delete rest.askedAt;
    return touch(rest as LessonQuestion, now);
  });
}

/** Record or replace a teacher answer without changing the asked state. */
export function setQuestionAnswer(
  agenda: LessonAgendaEntry[],
  id: ID,
  answer: string,
  now: Date,
): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.id !== id || !isQuestion(e)) return e;
    const trimmed = answer.trim();
    const rest = { ...e };
    delete rest.answer;
    return touch(trimmed ? ({ ...rest, answer: trimmed } as LessonQuestion) : (rest as LessonQuestion), now);
  });
}

/**
 * Point an entry at a different lesson — the ONLY way a commitment changes
 * class. There is no automatic carry-forward: an unasked question sitting on a
 * past lesson stays on that lesson until the owner moves it here.
 *
 * A target on another instrument is refused (the array comes back unchanged)
 * rather than silently rewriting either side's instrument.
 */
export function retargetEntry(
  agenda: LessonAgendaEntry[],
  id: ID,
  lessonId: ID | undefined,
  lessons: Lesson[],
  now: Date,
): LessonAgendaEntry[] {
  const entry = agenda.find((e) => e.id === id);
  if (!entry) return agenda;
  if (lessonId) {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson || lesson.instrumentId !== entry.instrumentId) return agenda;
  }
  return agenda.map((e) => {
    if (e.id !== id) return e;
    if (!lessonId) {
      const { lessonId: previous, ...rest } = e;
      return touch(
        { ...rest, ...(previous ? { detachedFromLessonId: previous } : {}) } as LessonAgendaEntry,
        now,
      );
    }
    return touch({ ...e, lessonId } as LessonAgendaEntry, now);
  });
}

/**
 * A lesson was deleted: every entry naming it becomes visibly unassigned and
 * REMEMBERS which lesson it used to name. Nothing is deleted and nothing is
 * silently reassigned to another class — an asked question stays asked, its
 * history intact.
 */
export function detachLesson(agenda: LessonAgendaEntry[], lessonId: ID, now: Date): LessonAgendaEntry[] {
  return agenda.map((e) => {
    if (e.lessonId !== lessonId) return e;
    const { lessonId: previous, ...rest } = e;
    return touch({ ...rest, detachedFromLessonId: previous } as LessonAgendaEntry, now);
  });
}

/**
 * An item was deleted. Its PREPARATION commitments go with it — a commitment
 * to prepare something that no longer exists means nothing — but its QUESTIONS
 * survive, detached, because the question and its answer are the owner's own
 * record of the class, not a property of the item.
 */
export function detachItem(agenda: LessonAgendaEntry[], itemId: ID, now: Date): LessonAgendaEntry[] {
  return agenda
    .filter((e) => !(isPreparation(e) && e.itemId === itemId))
    .map((e) => {
      if (!isQuestion(e) || e.itemId !== itemId) return e;
      const { itemId: previous, ...rest } = e;
      return touch({ ...rest, detachedFromItemId: previous } as LessonQuestion, now);
    });
}

/**
 * An item changed instrument. A commitment or question follows the item, and
 * any lesson target that no longer matches is cleared rather than pointing at
 * another instrument's class.
 */
export function retargetEntriesForItemInstrument(
  agenda: LessonAgendaEntry[],
  itemId: ID,
  instrumentId: ID,
  lessons: Lesson[],
  now: Date,
): LessonAgendaEntry[] {
  const byId = new Map(lessons.map((l) => [l.id, l]));
  return agenda.map((e) => {
    const concerns = isPreparation(e) ? e.itemId === itemId : e.itemId === itemId;
    if (!concerns || e.instrumentId === instrumentId) return e;
    const lesson = e.lessonId ? byId.get(e.lessonId) : undefined;
    if (lesson && lesson.instrumentId !== instrumentId) {
      const { lessonId: previous, ...rest } = e;
      return touch({ ...rest, instrumentId, detachedFromLessonId: previous } as LessonAgendaEntry, now);
    }
    return touch({ ...e, instrumentId } as LessonAgendaEntry, now);
  });
}

// --- Factories --------------------------------------------------------------

export function createPreparation(args: {
  id: ID;
  itemId: ID;
  instrumentId: ID;
  lessonId?: ID;
  now: Date;
}): LessonPreparation {
  const at: ISODateTime = nowISO(args.now);
  return {
    id: args.id,
    kind: 'preparation',
    itemId: args.itemId,
    instrumentId: args.instrumentId,
    ...(args.lessonId ? { lessonId: args.lessonId } : {}),
    createdAt: at,
    updatedAt: at,
  };
}

export function createQuestion(args: {
  id: ID;
  text: string;
  instrumentId: ID;
  itemId?: ID;
  lessonId?: ID;
  now: Date;
}): LessonQuestion {
  const at: ISODateTime = nowISO(args.now);
  return {
    id: args.id,
    kind: 'question',
    text: args.text,
    instrumentId: args.instrumentId,
    ...(args.itemId ? { itemId: args.itemId } : {}),
    ...(args.lessonId ? { lessonId: args.lessonId } : {}),
    createdAt: at,
    updatedAt: at,
  };
}

// --- Validation -------------------------------------------------------------

const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T/;

/**
 * A real ISO date-time, not merely a string shaped like the prefix of one:
 * `/^\d{4}-\d{2}-\d{2}T/` alone matches "2027-13-40T99:99:99.000Z" just as
 * happily as a genuine timestamp, and `Date.parse` alone is no better — it
 * silently NORMALISES an out-of-range day (`"2026-02-30T12:00:00.000Z"`
 * becomes March 2nd) rather than rejecting it, so a sealed review reproduced
 * that exact string passing. The calendar components are round-tripped
 * through `Date.UTC` the same way `scheduling.ts`'s own `isValidISODate`
 * checks a plain date, so an impossible day/month combination fails here
 * too. Every `askedAt` this app itself writes comes from `nowISO`
 * (`new Date().toISOString()`), which always round-trips losslessly, so this
 * rejects nothing legitimate.
 */
function isValidISODateTime(s: string): boolean {
  const m = ISO_DATE_TIME.exec(s);
  if (!m || !Number.isFinite(Date.parse(s))) return false;
  const [, ys, ms, ds] = m;
  const y = Number(ys);
  const mo = Number(ms);
  const d = Number(ds);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/**
 * Validate the agenda collection of an INBOUND database, before anything is
 * installed. Returns a human-readable problem, or null when the collection is
 * usable. Deliberately bounded to this model plus the scheduling fields it
 * shares a schema version with — it is not a general database sanitiser.
 *
 * Legitimate unassigned and detached historical records PASS: an entry with no
 * lesson, an asked question whose item is gone, a question with no item at all
 * are all honest states this app produces itself.
 *
 * A LIVE `lessonId` OR a LIVE `itemId` that resolves to NOTHING is invalid new
 * intent, not legacy debris — this app never leaves either dangling on its
 * own. `deleteLesson` always converts a live `lessonId` to
 * `detachedFromLessonId` (see `detachLesson`). `deleteItem` (`useStore.ts`)
 * always calls `detachItem` in the SAME synchronous update that removes the
 * item: a preparation naming it is removed outright, and a question's
 * `itemId` is converted to `detachedFromItemId` — never left as a live
 * reference to nothing. A sealed review found this section previously
 * tolerating a dangling `itemId` on the theory that the v11→v12 migration
 * mints entries from `db.items` at the moment it runs, so an item deleted
 * afterwards could leave its own agenda entries pointing at nothing — that
 * theory does not hold against the actual producer above, which cleans up
 * synchronously in the SAME update, so a genuinely dangling live `itemId` can
 * only be invalid data, not a legitimate history. A GENUINELY DETACHED
 * record — `detachedFromItemId`/`detachedFromLessonId` set, the live field
 * absent — is unaffected either way: `detachItem`/`detachLesson` destructure
 * the live field OUT rather than setting it `undefined`, so this check never
 * sees one to reject.
 */
export function validateLessonAgenda(
  db: Pick<PracticeDB, 'lessonAgenda' | 'items' | 'lessons' | 'instruments'>,
): string | null {
  const agenda: unknown[] = db.lessonAgenda as unknown[];
  if (!Array.isArray(agenda)) return 'Field "lessonAgenda" must be a list.';

  const seen = new Set<string>();
  const instruments = new Set(db.instruments.map((i) => i.id));
  const itemById = new Map(db.items.map((i) => [i.id, i]));
  const lessonById = new Map(db.lessons.map((l) => [l.id, l]));

  for (const raw of agenda) {
    if (!raw || typeof raw !== 'object') return 'Some lesson-agenda entries are not objects.';
    // Read the inbound row loosely: it is untrusted data that has not yet
    // earned the union type it claims.
    const e = raw as {
      id?: unknown;
      kind?: unknown;
      instrumentId?: unknown;
      lessonId?: unknown;
      itemId?: unknown;
      text?: unknown;
      askedAt?: unknown;
      answer?: unknown;
    };
    if (typeof e.id !== 'string' || !e.id) return 'Some lesson-agenda entries are missing an id.';
    if (seen.has(e.id)) return `Two lesson-agenda entries share the id "${e.id}".`;
    seen.add(e.id);
    if (e.kind !== 'preparation' && e.kind !== 'question') {
      return `Lesson-agenda entry "${e.id}" has an unknown kind.`;
    }
    // An instrument id is REQUIRED, but an id that no longer resolves is not
    // grounds to refuse the whole import: the v12 migration mints entries from
    // existing items, and an old backup can legitimately hold an item whose
    // instrument was deleted years ago. Refusing that would make the owner's
    // own pre-upgrade export — the documented recovery copy — unrestorable.
    // What IS checked is that a target actually PRESENT agrees with it.
    if (typeof e.instrumentId !== 'string' || !e.instrumentId) {
      return `Lesson-agenda entry "${e.id}" is missing its instrument.`;
    }
    void instruments;
    // A LIVE lesson target that resolves to nothing at all is refused
    // outright — see this function's own docstring for why that is never
    // legacy debris. A target that resolves must also agree with the
    // entry's instrument.
    if (typeof e.lessonId === 'string') {
      const lesson = lessonById.get(e.lessonId);
      if (!lesson) return `Lesson-agenda entry "${e.id}" names a class that no longer exists.`;
      if (lesson.instrumentId !== e.instrumentId) {
        return `Lesson-agenda entry "${e.id}" names a class on a different instrument.`;
      }
    } else if (e.lessonId !== undefined) {
      return `Lesson-agenda entry "${e.id}" has an unreadable class reference.`;
    }
    // A LIVE item target that resolves to nothing at all is refused outright
    // — see this function's own docstring for why that is never legacy
    // debris. One that DOES resolve must also agree with the entry's
    // instrument.
    if (e.kind === 'preparation') {
      if (typeof e.itemId !== 'string' || !e.itemId) {
        return `Preparation "${e.id}" names no practice item.`;
      }
      const item = itemById.get(e.itemId);
      if (!item) return `Preparation "${e.id}" names a practice item that no longer exists.`;
      if (item.instrumentId !== e.instrumentId) {
        return `Preparation "${e.id}" names an item on a different instrument.`;
      }
    } else {
      if (typeof e.text !== 'string' || !e.text.trim()) {
        return `Question "${e.id}" has no text.`;
      }
      if (typeof e.itemId === 'string') {
        const item = itemById.get(e.itemId);
        if (!item) return `Question "${e.id}" names a practice item that no longer exists.`;
        if (item.instrumentId !== e.instrumentId) {
          return `Question "${e.id}" names an item on a different instrument.`;
        }
      } else if (e.itemId !== undefined) {
        return `Question "${e.id}" has an unreadable item reference.`;
      }
      if (e.askedAt !== undefined && (typeof e.askedAt !== 'string' || !isValidISODateTime(e.askedAt))) {
        return `Question "${e.id}" has an unreadable asked date.`;
      }
      if (e.answer !== undefined && typeof e.answer !== 'string') {
        return `Question "${e.id}" has an unreadable answer.`;
      }
    }
  }
  return null;
}
```

### src/domain/plan.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  advancePlanPointer,
  allocateMinutes,
  buildSessionPlan,
  completePlanSegment,
  isWarmupSuitable,
  MAX_BUDGET_MINUTES,
  MAX_SEGMENT_MINUTES,
  MIN_BUDGET_MINUTES,
  MIN_SEGMENT_MINUTES,
  planPreviewDayHasPassed,
  planSegmentStartable,
  redistributePlan,
  skipPlanSegment,
  swapSegment,
  validateBudgetMinutes,
  type BuildPlanArgs,
  type PlanRun,
  type SessionPlan,
} from './plan';
import { DEFAULT_SCHEDULING_PARAMS } from './scheduling';
import { createItem, createBlock, createReview } from './factories';
import { addDays, toISODate } from './util';
import type { ID, ISODate, ItemStatus, ItemType, PracticeBlock, PracticeItem, Review } from './types';

const NOW = new Date('2026-07-18T09:00:00.000Z');
const INST = 'setar';
const day = (n: number): ISODate => toISODate(addDays(NOW, n));

let seq = 0;
function it_(o: Partial<PracticeItem> & { status?: ItemStatus; itemType?: ItemType } = {}): PracticeItem {
  const base = createItem(
    {
      instrumentId: o.instrumentId ?? INST,
      title: o.title ?? `item-${seq++}`,
      status: o.status ?? 'new',
      itemType: o.itemType ?? 'other',
      importance: o.importance ?? 3,
      difficulty: o.difficulty ?? 3,
    },
    NOW,
  );
  return { ...base, ...o };
}

function block(itemId: string, startedAt: string, durationMinutes = 10): PracticeBlock {
  return createBlock(
    { practiceItemId: itemId, instrumentId: INST, durationMinutes, mode: 'learn', focus: 'other', startedAt },
    NOW,
  );
}

function baseArgs(over: Partial<BuildPlanArgs> = {}): BuildPlanArgs {
  return {
    instrumentId: INST,
    budgetMinutes: 30,
    now: NOW,
    items: [],
    blocks: [],
    reviews: [],
    ...over,
  };
}

const sum = (ns: number[]) => ns.reduce((a, b) => a + b, 0);
const prep = (itemId: ID, date: ISODate) => new Map<ID, ISODate>([[itemId, date]]);

// ---------------------------------------------------------------------------
// ac-7 — B2/B4
// ---------------------------------------------------------------------------

describe('the anchor comes from real urgency, before any role decoration', () => {
  it('short sessions choose the most useful anchor before optional roles', () => {
    // A brand-new demanding piece scores well on its own; an ordinary usable
    // item committed to TOMORROW's class scores higher once its commitment
    // counts. The planner used to pre-select the deep-work one regardless.
    const newDeep = it_({ id: 'deep', title: 'new étude', status: 'new', importance: 4, difficulty: 5 });
    const forClass = it_({ id: 'class', title: 'gushe for class', status: 'usable', importance: 3, difficulty: 2 });
    const dates = prep('class', day(1));

    for (const budgetMinutes of [5, 10]) {
      const plan = buildSessionPlan(
        baseArgs({ items: [newDeep, forClass], budgetMinutes, preparationDates: dates }),
      );
      expect(plan.segments, `budget ${budgetMinutes}`).toHaveLength(1);
      expect(plan.segments[0].itemId, `budget ${budgetMinutes}`).toBe('class');
      expect(plan.segments[0].bucket, `budget ${budgetMinutes}`).toBe('lesson');
      expect(plan.segments[0].minutes, `budget ${budgetMinutes}`).toBe(budgetMinutes);
      expect(plan.segments[0].reason).toContain(day(1));
    }

    // Without the commitment the same two items rank the other way round —
    // so the change is the commitment, not a hard-coded preference.
    const noCommitment = buildSessionPlan(baseArgs({ items: [newDeep, forClass], budgetMinutes: 5 }));
    expect(noCommitment.segments[0].itemId).toBe('deep');

    // Ordinary useful material that fits no old bucket is still eligible and
    // still gets the budget — no fabricated mastery, no category requirement.
    for (const itemType of ['improvisation', 'other', 'technique'] as ItemType[]) {
      const ordinary = it_({ id: `ord-${itemType}`, title: itemType, status: 'usable', itemType });
      const plan = buildSessionPlan(baseArgs({ items: [ordinary], budgetMinutes: 10 }));
      expect(plan.segments.map((s) => s.itemId), itemType).toEqual([`ord-${itemType}`]);
      expect(plan.segments[0].minutes, itemType).toBe(10);
    }

    // A candidate belonging to another instrument never enters the plan.
    const foreign = it_({ id: 'foreign', title: 'guitar work', instrumentId: 'guitar', importance: 5 });
    const scoped = buildSessionPlan(baseArgs({ items: [foreign, forClass], budgetMinutes: 30 }));
    expect(scoped.segments.map((s) => s.itemId)).not.toContain('foreign');
  });
});

// ---------------------------------------------------------------------------
// ac-8 — B1/B2
// ---------------------------------------------------------------------------

describe('warm-up is a role ordinary familiar material fills', () => {
  it('warm up uses familiar existing material within the chosen budget', () => {
    const familiarRadif = it_({
      id: 'radif',
      title: 'familiar darāmad',
      status: 'usable',
      difficulty: 2,
      strand: 'radif',
      timesPractised: 12,
    });
    const familiarTechnique = it_({
      id: 'tech',
      title: 'known mezrāb drill',
      status: 'maintenance',
      difficulty: 2,
      itemType: 'technique',
      timesPractised: 30,
    });
    const unfamiliarDemanding = it_({
      id: 'hard',
      title: 'new demanding exercise',
      status: 'new',
      difficulty: 5,
      itemType: 'exercise',
      timesPractised: 0,
    });
    const mainWork = it_({ id: 'main', title: 'the real work', status: 'fragile', importance: 5, difficulty: 4 });

    // Suitability is low demand PLUS evidence of familiarity — a "technique"
    // label is not evidence of either.
    expect(isWarmupSuitable(familiarRadif)).toBe(true);
    expect(isWarmupSuitable(familiarTechnique)).toBe(true);
    expect(isWarmupSuitable(unfamiliarDemanding)).toBe(false);

    const pool = [familiarRadif, familiarTechnique, unfamiliarDemanding, mainWork];
    const share = DEFAULT_SCHEDULING_PARAMS.warmupShare;

    for (const budgetMinutes of [5, 10, 12, 15, 20, 45, 60, 120]) {
      const plan = buildSessionPlan(baseArgs({ items: pool, budgetMinutes }));
      const total = sum(plan.segments.map((s) => s.minutes));
      const warmups = plan.segments.filter((s) => s.bucket === 'warmup');
      const label = `budget ${budgetMinutes}`;

      expect(total, label).toBeLessThanOrEqual(budgetMinutes);
      expect(plan.segments.every((s) => s.minutes >= MIN_SEGMENT_MINUTES), label).toBe(true);
      expect(plan.segments.every((s) => s.minutes <= MAX_SEGMENT_MINUTES), label).toBe(true);
      expect(new Set(plan.segments.map((s) => s.itemId)).size, label).toBe(plan.segments.length);

      if (budgetMinutes < 12) {
        // No warm-up, no cool-down: one useful main focus.
        expect(warmups, label).toHaveLength(0);
        expect(plan.segments, label).toHaveLength(1);
      } else {
        expect(warmups, label).toHaveLength(1);
        // It is FIRST, it is a familiar candidate, and its bounded share is
        // real minutes rather than a weight nobody can check.
        expect(plan.segments[0].bucket, label).toBe('warmup');
        expect(['radif', 'tech'], label).toContain(plan.segments[0].itemId);
        // The configured share, floored at the shortest segment worth
        // starting — at 12 minutes 12 × 0.12 rounds to 1, and a one-minute
        // block is not a warm-up.
        expect(plan.segments[0].minutes, label).toBe(
          Math.max(MIN_SEGMENT_MINUTES, Math.round(budgetMinutes * share)),
        );
        // Useful main work survives it.
        const main = total - plan.segments[0].minutes;
        expect(main, label).toBeGreaterThanOrEqual(5);
      }
    }

    // With no SUITABLE candidate the warm-up is omitted honestly rather than
    // handed to the least-bad item.
    const noneSuitable = buildSessionPlan(baseArgs({ items: [unfamiliarDemanding, mainWork], budgetMinutes: 45 }));
    expect(noneSuitable.segments.some((s) => s.bucket === 'warmup')).toBe(false);
    expect(noneSuitable.segments.length).toBeGreaterThan(0);

    // Invalid budgets are rejected cleanly at the boundary.
    for (const bad of [NaN, Infinity, 0, -10, 4, 121, '30' as unknown as number]) {
      expect(validateBudgetMinutes(bad), String(bad)).toBeNull();
      expect(() => buildSessionPlan(baseArgs({ items: pool, budgetMinutes: bad })), String(bad)).toThrow(
        /whole number of minutes/,
      );
    }
    expect(validateBudgetMinutes(MIN_BUDGET_MINUTES)).toBe(MIN_BUDGET_MINUTES);
    expect(validateBudgetMinutes(MAX_BUDGET_MINUTES)).toBe(MAX_BUDGET_MINUTES);
    expect(validateBudgetMinutes(19.6)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// ac-9 — B4/B5/B6
// ---------------------------------------------------------------------------

describe('variety follows real exposure, never a quota', () => {
  it('session variety responds to exposure without quotas or losing urgent work', () => {
    // A fixed multi-day fixture: lesson work, due maintenance, and material
    // with and without musical metadata.
    const lessonWork = it_({ id: 'lesson', title: 'committed piece', status: 'usable', strand: 'radif', importance: 4 });
    // Deliberately as important as the committed work, and genuinely due: the
    // question is whether sustained drilling of the committed item can bury an
    // equally useful need indefinitely.
    const dueMaintenance = it_({
      id: 'maint',
      title: 'solid piece, due',
      status: 'maintenance',
      strand: 'repertoire',
      importance: 4,
      nextReviewDate: day(-1),
    });
    const freshTechnique = it_({ id: 'fresh', title: 'fresh technique', status: 'usable', strand: 'mezrab', importance: 3 });
    const noMetadata = it_({ id: 'bare', title: 'no strand at all', status: 'usable', importance: 3 });
    const items = [lessonWork, dueMaintenance, freshTechnique, noMetadata];
    const reviews: Review[] = [
      createReview({ practiceItemId: 'maint', dueDate: day(-1), reviewType: 'maintenance' }, NOW),
    ];
    const dates = prep('lesson', day(2));

    // DAY 0 — nothing practised yet: the urgent committed work is chosen.
    const day0 = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: [] }),
    );
    // The ANCHOR — the first segment that is real work rather than a warm-up.
    const anchorOf = (p: SessionPlan) => p.segments.find((s) => s.bucket !== 'warmup')!.itemId;
    expect(anchorOf(day0)).toBe('lesson');
    expect(day0.summary).not.toContain('Skipping');

    // DAYS -3..-1 — the committed item has been drilled hard every day.
    const heavy = [
      block('lesson', addDays(NOW, -1).toISOString(), 40),
      block('lesson', addDays(NOW, -2).toISOString(), 40),
      block('lesson', addDays(NOW, -3).toISOString(), 40),
    ];
    const afterHeavy = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: heavy }),
    );
    // Urgent work is NOT lost — it is still in the session…
    expect(afterHeavy.segments.map((s) => s.itemId)).toContain('lesson');
    // …but maintenance is now reachable rather than permanently crowded out.
    expect(afterHeavy.segments.map((s) => s.itemId)).toContain('maint');
    // Bounded: repeated exposure eventually costs it the anchor position.
    expect(anchorOf(afterHeavy)).not.toBe('lesson');

    // Recently exposed material yields to comparably useful fresh work.
    const exposedFresh = [...heavy, block('fresh', addDays(NOW, -1).toISOString(), 40)];
    const yielded = buildSessionPlan(
      baseArgs({ items, reviews, preparationDates: dates, budgetMinutes: 30, blocks: exposedFresh }),
    );
    const freshIdx = yielded.segments.findIndex((s) => s.itemId === 'fresh');
    const bareIdx = yielded.segments.findIndex((s) => s.itemId === 'bare');
    expect(bareIdx).toBeGreaterThanOrEqual(0); // missing metadata still yields a useful plan
    if (freshIdx >= 0) expect(bareIdx).toBeLessThan(freshIdx);

    // No category is filled artificially: with only two eligible items there
    // are at most two segments, whatever the budget wants.
    const twoOnly = buildSessionPlan(baseArgs({ items: [lessonWork, noMetadata], budgetMinutes: 60 }));
    expect(twoOnly.segments).toHaveLength(2);
    expect(new Set(twoOnly.segments.map((s) => s.itemId)).size).toBe(2);

    // DETERMINISM: permuting the storage arrays changes nothing at all.
    const permutations: PracticeItem[][] = [
      items,
      [...items].reverse(),
      [items[2], items[0], items[3], items[1]],
    ];
    const reference = JSON.stringify(
      buildSessionPlan(baseArgs({ items, reviews, preparationDates: dates, blocks: heavy })).segments,
    );
    for (const perm of permutations) {
      const again = buildSessionPlan(
        baseArgs({ items: perm, reviews, preparationDates: dates, blocks: [...heavy].reverse() }),
      );
      expect(JSON.stringify(again.segments)).toBe(reference);
    }
  });
});

// ---------------------------------------------------------------------------
// ac-10 — B2/B3/B7
// ---------------------------------------------------------------------------

describe('building, swapping and redistributing keep identity and honest reasons', () => {
  it('build swap and redistribution preserve candidate identity and honest reasons', () => {
    const resting = it_({ id: 'resting', title: 'resting', status: 'dormant', importance: 5, difficulty: 5 });
    const foreign = it_({ id: 'foreign', title: 'guitar', instrumentId: 'guitar', importance: 5 });
    const a = it_({ id: 'a', title: 'A', status: 'fragile', importance: 5, strand: 'radif' });
    const b = it_({ id: 'b', title: 'B', status: 'usable', importance: 4, strand: 'repertoire', timesPractised: 8, difficulty: 2 });
    const c = it_({ id: 'c', title: 'C', status: 'integrated', importance: 3, strand: 'technique', timesPractised: 9, difficulty: 2 });
    const d = it_({ id: 'd', title: 'D', status: 'usable', importance: 3, strand: 'rhythm', nextReviewDate: day(-2) });
    const items = [resting, foreign, a, b, c, d];
    const reviews = [createReview({ practiceItemId: 'd', dueDate: day(-2), reviewType: 'retention' }, NOW)];
    const args = baseArgs({ items, reviews, budgetMinutes: 45 });

    const plan = buildSessionPlan(args);
    const ids = plan.segments.map((s) => s.itemId);
    expect(ids).not.toContain('resting');
    expect(ids).not.toContain('foreign');
    expect(new Set(ids).size).toBe(ids.length);
    expect(sum(plan.segments.map((s) => s.minutes))).toBeLessThanOrEqual(45);
    expect(plan.segments.every((s) => s.minutes >= MIN_SEGMENT_MINUTES)).toBe(true);

    // Reasons name the ACTUAL decisive fact.
    const review = plan.segments.find((s) => s.bucket === 'review');
    if (review) expect(review.reason).toContain(day(-2));

    // SWAP keeps the role and the minutes, and can never reach excluded work.
    const idx = plan.segments.findIndex((s) => s.bucket === 'deep');
    if (idx >= 0) {
      const swapped = swapSegment(plan, idx, { ...args, excludeIds: new Set(plan.segments.map((s) => s.itemId)) });
      const seg = swapped.segments[idx];
      expect(seg.minutes).toBe(plan.segments[idx].minutes);
      expect(seg.bucket).toBe(plan.segments[idx].bucket);
      expect(['resting', 'foreign']).not.toContain(seg.itemId);
      expect(new Set(swapped.segments.map((s) => s.itemId)).size).toBe(swapped.segments.length);
      // The reason travelled with the item it describes.
      if (seg.itemId !== plan.segments[idx].itemId) {
        expect(seg.reason).not.toBe(plan.segments[idx].reason);
      }
    }

    // SWAP shares the build's OWN practised-today exclusion — it must never
    // hand back material the build itself set aside while a fresher, equally
    // eligible candidate is available. Three usable same-instrument items
    // ranked by importance (5/4/3); the middle one was practised one minute
    // ago today.
    const hi = it_({ id: 'hi', title: 'Hi', status: 'usable', importance: 5 });
    const mid = it_({ id: 'mid', title: 'Mid', status: 'usable', importance: 4 });
    const lo = it_({ id: 'lo', title: 'Lo', status: 'usable', importance: 3 });
    const practisedMid = [block('mid', NOW.toISOString())];
    const shortArgs = baseArgs({ items: [hi, mid, lo], blocks: practisedMid, budgetMinutes: 5 });
    const shortPlan = buildSessionPlan(shortArgs);
    expect(shortPlan.segments.map((s) => s.itemId)).toEqual(['hi']); // mid stepped aside, not chosen
    const shortSwap = swapSegment(shortPlan, 0, shortArgs);
    // Fresh 'lo' is available — the swap must reach it, never the
    // already-practised 'mid', even though 'mid' outranks 'lo' on score alone.
    expect(shortSwap.segments[0].itemId).toBe('lo');
    expect(shortSwap.segments[0].reason).not.toContain('Practised earlier today');

    // A warm-up swap uses the SAME exclusions as the build's own warm-up
    // pool: a candidate that is due for review, or committed to a class,
    // deserves that slot — never spent as a warm-up — even though it is
    // otherwise `isWarmupSuitable`.
    const dueWarm = it_({ id: 'due-warm', title: 'DueWarm', status: 'usable', difficulty: 2, timesPractised: 5 });
    const freshWarm = it_({ id: 'fresh-warm', title: 'FreshWarm', status: 'usable', difficulty: 2, timesPractised: 5 });
    expect(isWarmupSuitable(dueWarm)).toBe(true);
    expect(isWarmupSuitable(freshWarm)).toBe(true);
    const warmupReviews = [createReview({ practiceItemId: 'due-warm', dueDate: day(-1), reviewType: 'retention' }, NOW)];
    const warmupPlan: SessionPlan = {
      instrumentId: INST,
      budgetMinutes: 20,
      segments: [
        { itemId: 'placeholder', title: 'placeholder', minutes: 5, bucket: 'warmup', core: false, mode: 'learn', focus: 'tone', reason: 'x' },
      ],
      summary: '',
      generatedAt: NOW.toISOString(),
    };
    const warmArgs = baseArgs({ items: [dueWarm, freshWarm], reviews: warmupReviews, budgetMinutes: 20 });
    const swappedWarm = swapSegment(warmupPlan, 0, warmArgs);
    expect(swappedWarm.segments[0].itemId).toBe('fresh-warm'); // never the due one
    const onlyDue = swapSegment(warmupPlan, 0, { ...warmArgs, items: [dueWarm] });
    expect(onlyDue.segments[0].itemId).toBe('placeholder'); // no eligible candidate at all: no swap

    // REGENERATE is the same function with the same inputs: same answer.
    expect(JSON.stringify(buildSessionPlan(args).segments)).toBe(JSON.stringify(plan.segments));

    // REMOVE + redistribute: totals stay within budget, and no segment gains
    // another role's reason.
    const trimmed = redistributePlan({ ...plan, segments: plan.segments.slice(1) });
    expect(sum(trimmed.segments.map((s) => s.minutes))).toBeLessThanOrEqual(plan.budgetMinutes);
    trimmed.segments.forEach((seg, i) => {
      const original = plan.segments[i + 1];
      expect(seg.itemId).toBe(original.itemId);
      expect(seg.bucket).toBe(original.bucket);
      expect(seg.reason).toBe(original.reason);
    });
    expect(redistributePlan({ ...plan, segments: [] }).segments).toEqual([]);

    // ALL-PRACTISED fallback: an item chosen is never described as skipped.
    const practisedToday = items
      .filter((i) => ['a', 'b', 'c', 'd'].includes(i.id))
      .map((i) => block(i.id, NOW.toISOString()));
    const fallback = buildSessionPlan(baseArgs({ items, reviews, blocks: practisedToday, budgetMinutes: 30 }));
    expect(fallback.segments.length).toBeGreaterThan(0);
    for (const seg of fallback.segments) {
      expect(fallback.summary).not.toContain(`Skipping ${seg.title}`);
      expect(seg.reason).toContain('Practised earlier today');
    }

    // A budget too large for the eligible work leaves an HONEST remainder.
    const sparse = buildSessionPlan(baseArgs({ items: [a, b], budgetMinutes: 120 }));
    expect(sum(sparse.segments.map((s) => s.minutes))).toBeLessThan(120);
    expect(sparse.summary).toContain('unplanned');

    // …and a budget the work can fill is filled.
    const full = buildSessionPlan(baseArgs({ items, reviews, budgetMinutes: 30 }));
    expect(sum(full.segments.map((s) => s.minutes))).toBe(30);
  });
});

describe('allocateMinutes', () => {
  it('never exceeds the budget and respects both segment bounds', () => {
    for (const budget of [5, 12, 20, 30, 45, 60, 120]) {
      for (const buckets of [
        ['deep'] as const,
        ['warmup', 'deep'] as const,
        ['warmup', 'lesson', 'review', 'deep', 'cooldown'] as const,
      ]) {
        const alloc = allocateMinutes([...buckets], budget);
        const label = `${budget} · ${buckets.join('/')}`;
        expect(sum(alloc), label).toBeLessThanOrEqual(budget);
        expect(alloc.every((m) => m >= MIN_SEGMENT_MINUTES), label).toBe(true);
        expect(alloc.every((m) => m <= MAX_SEGMENT_MINUTES), label).toBe(true);
      }
    }
  });

  it('pins the warm-up to its configured share', () => {
    for (const budget of [12, 15, 20, 45, 60]) {
      const alloc = allocateMinutes(['warmup', 'deep', 'review'], budget);
      expect(alloc[0], `budget ${budget}`).toBe(
        Math.max(MIN_SEGMENT_MINUTES, Math.round(budget * DEFAULT_SCHEDULING_PARAMS.warmupShare)),
      );
    }
    const wide = allocateMinutes(['warmup', 'deep'], 60, { ...DEFAULT_SCHEDULING_PARAMS, warmupShare: 0.15 });
    expect(wide[0]).toBe(9);
  });
});

// ---------------------------------------------------------------------------
// ac-11 — B7
// ---------------------------------------------------------------------------

describe('a running plan keeps its progress and refuses stale work', () => {
  it('plan transitions preserve progress and refuse stale cross instrument starts', () => {
    const one = it_({ id: 'one', title: 'first' });
    const two = it_({ id: 'two', title: 'second' });
    const three = it_({ id: 'three', title: 'third' });
    const plan: SessionPlan = buildSessionPlan(baseArgs({ items: [one, two, three], budgetMinutes: 45 }));
    const run: PlanRun = {
      instrumentId: INST,
      budgetMinutes: plan.budgetMinutes,
      startedAt: NOW.toISOString(),
      pointer: 0,
      segments: plan.segments.map((s) => ({ ...s, status: 'pending' as const })),
    };

    // Close the first segment: done, pointer advances, nothing else touched.
    const afterFirst = completePlanSegment(run, run.segments[0].itemId);
    expect(afterFirst.segments[0].status).toBe('done');
    expect(afterFirst.pointer).toBe(1);
    expect(afterFirst.segments.slice(1).every((s) => s.status === 'pending')).toBe(true);

    // Closing a block for something OFF the plan changes nothing.
    expect(completePlanSegment(afterFirst, 'not-in-plan')).toBe(afterFirst);

    // Skip the second: recorded as skipped, never as practice.
    const afterSkip = skipPlanSegment(afterFirst);
    expect(afterSkip.segments[1].status).toBe('skipped');
    expect(afterSkip.pointer).toBe(2);

    // Rehydrating that partially-done run preserves both.
    const rehydrated: PlanRun = JSON.parse(JSON.stringify(afterSkip));
    expect(rehydrated.segments.map((s) => s.status)).toEqual(['done', 'skipped', 'pending']);
    expect(planSegmentStartable(rehydrated, [one, two, three])).toMatchObject({ ok: true });

    // A pending item that was DELETED or MOVED to another instrument cannot
    // be played — it is visibly skipped instead, never under the wrong
    // instrument.
    const currentId = rehydrated.segments[rehydrated.pointer].itemId;
    const deleted = [one, two, three].filter((i) => i.id !== currentId);
    expect(planSegmentStartable(rehydrated, deleted)).toEqual({ ok: false, reason: 'deleted' });
    const moved = [one, two, three].map((i) => (i.id === currentId ? { ...i, instrumentId: 'guitar' } : i));
    expect(planSegmentStartable(rehydrated, moved)).toEqual({ ok: false, reason: 'moved' });
    const afterInvalid = skipPlanSegment(rehydrated);
    expect(afterInvalid.segments[rehydrated.pointer].status).toBe('skipped');
    expect(afterInvalid.segments.filter((s) => s.status === 'done')).toHaveLength(1); // progress survives

    // Another unfinished ordinary block or routine run refuses the start
    // outright — replacing one would destroy real practice.
    expect(planSegmentStartable(rehydrated, [one, two, three], true)).toEqual({ ok: false, reason: 'busy' });

    // A finished run has nothing to start.
    const finished: PlanRun = { ...afterInvalid, pointer: afterInvalid.segments.length };
    expect(planSegmentStartable(finished, [one, two, three])).toEqual({ ok: false, reason: 'finished' });

    // The pointer wraps back to a skipped segment rather than stranding it.
    const pendingSeg = { ...run.segments[0], status: 'pending' as const };
    const doneSeg = { ...run.segments[0], status: 'done' as const };
    const skippedSeg = { ...run.segments[0], status: 'skipped' as const };
    expect(advancePlanPointer([pendingSeg, doneSeg], 1)).toBe(0); // wraps to what is still pending
    expect(advancePlanPointer([skippedSeg], 0)).toBe(1); // a deliberate skip stays skipped
    expect(advancePlanPointer([doneSeg], 0)).toBe(1); // finished

    // Starting a plan is an authority boundary: the preview's OWN calendar
    // day is checked against the caller's `now` directly — the extracted
    // pure transition `SessionPlan.tsx`'s click-time guard actually calls,
    // never a screen's own polled `now` that can lag the true instant by up
    // to its poll interval, which is the exact gap a real device left
    // untouched across midnight experiences with no event to close it.
    const builtFor = day(0);
    expect(planPreviewDayHasPassed(builtFor, NOW)).toBe(false);
    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, 1))).toBe(true);
    expect(planPreviewDayHasPassed(builtFor, addDays(NOW, -1))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Regression coverage carried forward from before this lane.
//
// `PlanSegment.core` and the warm-up-first/cool-down-last ordering are shape
// guarantees this lane KEPT — `core` is still derived in `buildSessionPlan`,
// still preserved across `swapSegment`, and still rendered on the Session Plan
// page — but the ac-named tables assert minutes, identity and reasons rather
// than these, so both stopped being covered when the old per-function tests
// were replaced.
// ---------------------------------------------------------------------------

describe('a review segment stays inside its configured slot window', () => {
  // `reviewSlotMinMinutes` / `reviewSlotMaxMinutes` are live knobs — Settings
  // exposes them, `clampSchedulingParams` bounds them to [2,5] and [5,12], and
  // `allocateMinutes` still applies them after the weighted split (a retrieval
  // check should not quietly take half the session, nor be squeezed to
  // nothing). The lane's own allocation tests assert the uniform per-segment
  // bounds and the pinned warm-up share, so this window stopped being covered.
  // Values here are inside the documented bounds on purpose: an out-of-range
  // knob is clamped before it is read, which would make this pass vacuously.
  const BUCKETS = ['warmup', 'lesson', 'review', 'deep', 'cooldown'] as const;
  const REVIEW = BUCKETS.indexOf('review');
  const alloc = (budget: number, min: number, max: number) =>
    allocateMinutes([...BUCKETS], budget, {
      ...DEFAULT_SCHEDULING_PARAMS,
      reviewSlotMinMinutes: min,
      reviewSlotMaxMinutes: max,
    });

  it('the ceiling caps a long session’s review, and widening it gives real minutes back', () => {
    const tight = alloc(60, 2, 5);
    const wide = alloc(60, 5, 12);
    expect(tight[REVIEW]).toBeLessThanOrEqual(5);
    // Strictly more, not merely different: the knob is READ, not just stored.
    expect(wide[REVIEW]).toBeGreaterThan(tight[REVIEW]);
    expect(wide[REVIEW]).toBeLessThanOrEqual(12);
    // The surplus moves to other work; the budget is never exceeded.
    expect(sum(tight)).toBeLessThanOrEqual(60);
    expect(sum(wide)).toBeLessThanOrEqual(60);
  });

  it('the floor lifts a short session’s review, taking the minutes from other work', () => {
    for (const budget of [20, 30]) {
      const low = alloc(budget, 2, 5);
      const lifted = alloc(budget, 5, 12);
      expect(low[REVIEW], `${budget} min`).toBeLessThan(5);
      expect(lifted[REVIEW], `${budget} min`).toBeGreaterThanOrEqual(5);
      // Taken from other segments, not conjured: the total does not grow.
      expect(sum(lifted), `${budget} min`).toBeLessThanOrEqual(sum(low));
      expect(sum(lifted), `${budget} min`).toBeLessThanOrEqual(budget);
      expect(lifted.every((m) => m >= MIN_SEGMENT_MINUTES), `${budget} min`).toBe(true);
    }
  });
});

describe('a plan’s shape is as honest as its minutes', () => {
  const richArgs = () => {
    const warm = it_({ id: 'warm', title: 'Warm', status: 'integrated', difficulty: 2, timesPractised: 12, importance: 2 });
    const lesson = it_({ id: 'lesson', title: 'Lesson', status: 'fragile', importance: 5 });
    const due = it_({ id: 'due', title: 'Due', status: 'usable', importance: 4, nextReviewDate: day(-2) });
    const deep = it_({ id: 'deep', title: 'Deep', status: 'new', importance: 4, difficulty: 5 });
    const cool = it_({ id: 'cool', title: 'Cool', status: 'performable', importance: 2, difficulty: 1, timesPractised: 20 });
    // Ordinary middle work, so the cool-down candidate is still unspent when
    // the cool-down step runs — without it the middle fill takes `cool` and
    // the ordering assertion below would pass vacuously.
    const extra = it_({ id: 'extra', title: 'Extra', status: 'usable', importance: 3, difficulty: 3 });
    const spare = it_({ id: 'spare', title: 'Spare', status: 'fragile', importance: 4, difficulty: 3 });
    return baseArgs({
      items: [warm, lesson, due, deep, cool, extra, spare],
      reviews: [createReview({ practiceItemId: 'due', dueDate: day(-2), reviewType: 'retention' }, NOW)],
      preparationDates: prep('lesson', day(1)),
      budgetMinutes: 60,
    });
  };

  it('marks the work the session is actually FOR, never more than three segments', () => {
    const plan = buildSessionPlan(richArgs());
    const core = plan.segments.filter((s) => s.core);
    expect(core.length).toBeGreaterThanOrEqual(1);
    expect(core.length).toBeLessThanOrEqual(3);
    // The anchor — the first non-warm-up segment — is always core: it is the
    // reason the session exists, whatever roles decorate it.
    const anchor = plan.segments.find((s) => s.bucket !== 'warmup')!;
    expect(anchor.core).toBe(true);
    // A warm-up is core when there is one, because the session's own opening
    // is part of what it is for — but it never displaces the anchor.
    const warmup = plan.segments.find((s) => s.bucket === 'warmup');
    if (warmup) expect(warmup.core).toBe(true);
    // Nothing outside that set is marked: `core` is a claim about the two or
    // three segments the session exists for, not a decoration on every row.
    expect(plan.segments.filter((s) => !s.core).length).toBeGreaterThan(0);
  });

  it('puts a warm-up first and a cool-down last whenever it has them', () => {
    const plan = buildSessionPlan(richArgs());
    const buckets = plan.segments.map((s) => s.bucket);
    // Both roles are genuinely present for this fixture — asserted, so this
    // can never degrade into a pair of conditions that are simply never met.
    expect(buckets).toContain('warmup');
    expect(buckets).toContain('cooldown');
    expect(buckets.indexOf('warmup')).toBe(0);
    expect(buckets.lastIndexOf('cooldown')).toBe(buckets.length - 1);
    // Neither role may appear twice — they bracket the session, not fill it.
    expect(buckets.filter((b) => b === 'warmup').length).toBeLessThanOrEqual(1);
    expect(buckets.filter((b) => b === 'cooldown').length).toBeLessThanOrEqual(1);
  });

  it('a swap with nothing to swap to returns the plan unchanged', () => {
    const plan = buildSessionPlan(richArgs());
    const args = richArgs();
    // Everything eligible is already in the plan, so there is no alternative
    // candidate — the editor must leave the segment exactly as it was rather
    // than emptying it or reaching for ineligible work.
    const exclude = new Set([...plan.segments.map((s) => s.itemId), ...args.items.map((i) => i.id)]);
    const unchanged = swapSegment(plan, 0, { ...args, excludeIds: exclude });
    expect(unchanged.segments[0]).toEqual(plan.segments[0]);
  });
});
```

### src/domain/plan.ts

```
import type {
  BlockMode,
  FocusArea,
  ID,
  ISODate,
  PracticeBlock,
  PracticeItem,
  Review,
  SchedulingParams,
} from './types';
import { DEFAULT_SCHEDULING_PARAMS, clampSchedulingParams } from './scheduling';
import {
  EXPOSURE_WINDOW_DAYS,
  groupBlocksByItem,
  isProactiveCandidate,
  scoreItems,
  type ItemScore,
} from './scoring';
import { dueReviews } from './selectors';
import { defaultModeForStatus, focusForItem } from './defaults';
import { toISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Session Plan — a time-budgeted programme for one practice session.
//
// This is organisation, not judgement: it lays out WHICH items to touch, in
// what order, for how long, so the user can stop deciding and just practise.
// Everything is deterministic (explicit `now`, score-desc then stable-id
// tiebreaks, no randomness) and reuses the same priority scoring as the
// recommendation engine — no second, hidden set of numbers, and the same
// eligibility policy (`isProactiveCandidate`) as Today, regeneration and swaps.
//
// The shape follows well-supported ideas from the practice-science literature,
// used as sane defaults (never as a claim of an "optimal" ratio):
//   • warm-up first, cool-down last (end on something stable) — sleep
//     consolidation favours finishing on a secure rep (Simmons & Duke 2006).
//   • short, spaced, goal-directed blocks — spacing + retrieval practice
//     (Cepeda 2006; Roediger & Karpicke 2006; Ericsson 1993).
//   • a mix of buckets rather than one item drilled — contextual interference
//     (Shea & Morgan 1979). It can feel harder; that's the point.
// The minute shares are adjustable via SchedulingParams (Settings). Every
// number this module uses is published in docs/scheduling-evidence.md.
//
// WHAT CHANGED, AND WHY: the main anchor is now chosen from actual urgency
// BEFORE any role decoration. A five-minute session used to pre-select new
// deep work and only then consider a higher-priority item committed for
// tomorrow's class. Warm-up is a ROLE an ordinary familiar item fills, not a
// type/strand label — an unfamiliar demanding exercise is not a warm-up just
// because it is tagged "technique". And the minutes may leave an honest
// remainder rather than stretch two items across two hours.
// ---------------------------------------------------------------------------

export type PlanBucket = 'warmup' | 'lesson' | 'review' | 'deep' | 'cooldown';

export interface PlanSegment {
  itemId: string;
  title: string;
  minutes: number;
  bucket: PlanBucket;
  /** Essential to the session (warm-up, the main anchor, the top lesson/review). */
  core: boolean;
  mode: BlockMode;
  focus: FocusArea;
  reason: string;
}

export interface SessionPlan {
  instrumentId: string;
  budgetMinutes: number;
  segments: PlanSegment[];
  summary: string;
  generatedAt: string;
}

export interface BuildPlanArgs {
  instrumentId: string;
  budgetMinutes: number;
  now: Date;
  items: PracticeItem[];
  blocks: PracticeBlock[];
  reviews: Review[];
  /** itemId → the date of the class it is committed to (`preparationDatesByItem`). */
  preparationDates?: Map<ID, ISODate>;
  /** Ids of items sitting in the current pathway stage — a tie-break only. */
  stageItemIds?: Set<string>;
  params?: SchedulingParams;
}

/** Shortest segment worth starting. */
export const MIN_SEGMENT_MINUTES = 2;
/** Longest single block the planner will ever propose. */
export const MAX_SEGMENT_MINUTES = 25;
/** Under this, the session is ONE useful main focus and nothing else. */
export const SHORT_SESSION_MINUTES = 12;
/** A warm-up may only exist if at least this much main work survives it. */
export const MAIN_WORK_FLOOR_MINUTES = 5;
/** The budgets this planner accepts. */
export const MIN_BUDGET_MINUTES = 5;
export const MAX_BUDGET_MINUTES = 120;

// Statuses that read as "settled" — the only ones a cool-down draws from.
const COOLDOWN_STATUSES = new Set(['integrated', 'performable', 'maintenance']);
/** Statuses that are themselves evidence the material is familiar. */
const FAMILIAR_STATUSES = new Set(['usable', 'integrated', 'performable', 'maintenance']);

/** Priority for handing out spare minutes and for trimming when too many. */
const BUCKET_PRIORITY: PlanBucket[] = ['deep', 'lesson', 'review', 'warmup', 'cooldown'];
/** Relative minute weight per bucket (deep gets the most; cool-down the least). */
const BUCKET_WEIGHT: Record<PlanBucket, number> = {
  warmup: 1,
  review: 1.2,
  lesson: 1.8,
  deep: 2.6,
  cooldown: 0.9,
};

/** Points subtracted when a candidate repeats a dimension already selected. */
export const DIVERSITY_SAME_SESSION_PENALTY = 1;
/** Points subtracted when it repeats a dimension practised in the last 2 days. */
export const DIVERSITY_RECENT_DAYS_PENALTY = 1;
const DIVERSITY_RECENT_WINDOW_DAYS = 2;

/**
 * Accept a whole-minute budget, or reject it. Non-finite, fractional-only
 * rubbish, zero and out-of-range values are refused AT THE BOUNDARY rather
 * than clamped into something the owner did not ask for or looped over.
 */
export function validateBudgetMinutes(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const n = Math.round(value);
  if (n < MIN_BUDGET_MINUTES || n > MAX_BUDGET_MINUTES) return null;
  return n;
}

/**
 * The candidate pool a build OR a swap picks from: practised-today material
 * steps aside — unless it is committed to a class, a commitment the day's
 * earlier session did not discharge — falling back to repeating today's own
 * work only when nothing fresh remains eligible. Shared so a swap can never
 * reach material the build itself deliberately set aside (§B3/B7): a swap
 * used to run this filter over `scored` directly, so it could hand back an
 * item the build had excluded as already practised while a fresher,
 * untouched candidate sat right behind it.
 */
function candidatePool(
  scored: ItemScore[],
  blocks: PracticeBlock[],
  now: Date,
): { pool: ItemScore[]; isRepeatPool: boolean; practisedToday: Set<string> } {
  const today = todayISODate(now);
  const practisedToday = new Set(
    blocks.filter((b) => toISODate(new Date(b.startedAt)) === today).map((b) => b.practiceItemId),
  );
  const fresh = scored.filter((s) => !practisedToday.has(s.item.id) || s.parts.lesson > 0);
  return { pool: fresh.length > 0 ? fresh : scored, isRepeatPool: fresh.length === 0, practisedToday };
}

/**
 * Is this item suitable as a warm-up? A role, not a label.
 *
 * Two things together: LOW DEMAND (difficulty ≤ 3) and evidence of
 * FAMILIARITY — either a settled status or a real practice history. A brand
 * new, demanding étude tagged "technique" is exactly what a warm-up is not,
 * however the old type/strand test read it. With nothing suitable the planner
 * omits the warm-up honestly rather than promoting the least-bad candidate.
 */
export function isWarmupSuitable(item: PracticeItem): boolean {
  if (item.difficulty >= 4) return false;
  if (item.status === 'new' || item.status === 'dormant') return false;
  return item.timesPractised >= 3 || FAMILIAR_STATUSES.has(item.status);
}

/**
 * The musical dimension a diversity preference works on: the item's own
 * strand, else its type. Existing metadata only — no new taxonomy, and a
 * missing one simply contributes no preference either way.
 */
export function itemDimension(item: PracticeItem): string {
  return item.strand ?? item.itemType;
}

interface Candidate {
  score: ItemScore;
  bucket: PlanBucket;
  reason: string;
}

function focusFor(item: PracticeItem): FocusArea {
  return focusForItem(item);
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A one-sentence reason built from the SAME record that selected the item:
 * its own score parts, its own committed lesson, its own review date. Extra
 * context (a repeat, a diversity trade-off) is passed in from the selection
 * step that actually made that trade, never re-derived here.
 */
export function planSegmentReason(
  bucket: PlanBucket,
  score: ItemScore,
  context: { repeat?: boolean; yieldedTo?: string; dueDate?: ISODate } = {},
): string {
  if (context.repeat) {
    return 'Practised earlier today — chosen again because nothing else eligible is waiting.';
  }
  switch (bucket) {
    case 'warmup':
      return 'Warm up on something you already know before the harder work.';
    case 'lesson':
      return score.daysToLesson === 0
        ? `For today’s class (${score.lessonDate}).`
        : `For your class on ${score.lessonDate} — ${plural(score.daysToLesson ?? 0, 'day')} away.`;
    case 'review': {
      const when = context.dueDate ? ` (due ${context.dueDate})` : '';
      return score.overdueDays != null && score.overdueDays > 0
        ? `Due for review${when} — ${plural(score.overdueDays, 'day')} overdue.`
        : `Due for review today${when} — retrieve it from memory.`;
    }
    case 'cooldown':
      return 'End on something that already holds together.';
    case 'deep': {
      const p = score.parts;
      if (context.yieldedTo) {
        return `Fresh work — you have already spent time on ${context.yieldedTo} lately.`;
      }
      if (p.fragility >= 4) return 'Focused work — it’s still shaky and needs rebuilding.';
      if (score.overdueDays && score.overdueDays > 0) return 'Focused work — its review is overdue.';
      if (p.neglected >= 3) return 'Focused work — it’s been a while since you touched it.';
      if (p.importance >= 8) return 'Focused work — it matters most right now.';
      if (p.exposurePenalty > 0) {
        return `Focused work — ${Math.round(score.exposureMinutes)} minutes on it this week already.`;
      }
      return 'Focused work on what needs the most attention.';
    }
  }
}

/**
 * Build a time-budgeted plan for one instrument. Pure and deterministic.
 * Minutes are whole and never exceed `budgetMinutes`.
 *
 * Throws on an invalid budget: a plan built from a NaN or a two-day session
 * length is not a plan, and silently repairing one hides the caller's bug.
 */
export function buildSessionPlan(args: BuildPlanArgs): SessionPlan {
  const B = validateBudgetMinutes(args.budgetMinutes);
  if (B === null) {
    throw new Error(
      `Session length must be a whole number of minutes between ${MIN_BUDGET_MINUTES} and ${MAX_BUDGET_MINUTES}.`,
    );
  }
  const params = clampSchedulingParams(args.params ?? DEFAULT_SCHEDULING_PARAMS);
  const now = args.now;
  const generatedAt = now.toISOString();
  const empty = (summary: string): SessionPlan => ({
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments: [],
    summary,
    generatedAt,
  });

  // ---- eligibility: one policy, no widening fallback -----------------------
  const items = args.items.filter((i) => i.instrumentId === args.instrumentId).filter(isProactiveCandidate);
  const blocks = args.blocks.filter((b) => b.instrumentId === args.instrumentId);
  const blocksByItem = groupBlocksByItem(blocks);
  const scored = scoreItems(items, blocksByItem, now, args.preparationDates);

  if (scored.length === 0) {
    return empty(
      args.items.some((i) => i.instrumentId === args.instrumentId)
        ? 'Everything for this instrument is resting — change an item’s status to bring it back.'
        : 'No items for this instrument yet — add one and the plan fills in.',
    );
  }

  const today = todayISODate(now);
  const { pool, isRepeatPool, practisedToday } = candidatePool(scored, blocks, now);

  const dueById = new Map(
    dueReviews(args.reviews, now)
      .filter((r) => items.some((i) => i.id === r.practiceItemId))
      .map((r) => [r.practiceItemId, r.dueDate] as const),
  );

  const bucketFor = (s: ItemScore): PlanBucket => {
    if (s.parts.lesson > 0) return 'lesson';
    if (dueById.has(s.item.id)) return 'review';
    return 'deep';
  };

  // Dimensions touched in the last couple of days — a modest freshness
  // preference, subordinate to every real need above it in the score.
  const recentDimensions = new Set<string>();
  for (const b of blocks) {
    const day = toISODate(new Date(b.startedAt));
    if (day > today) continue;
    const ageOk = day >= addDaysBack(today, DIVERSITY_RECENT_WINDOW_DAYS);
    if (!ageOk) continue;
    const item = items.find((i) => i.id === b.practiceItemId);
    if (item) recentDimensions.add(itemDimension(item));
  }

  const stageIds = args.stageItemIds ?? new Set<string>();
  const used = new Set<string>();
  const selectedDimensions = new Set<string>();
  const selected: Candidate[] = [];

  /**
   * Pick the best remaining candidate from `from`, applying the bounded
   * diversity preference. Returns the candidate AND the dimension it beat, so
   * the reason can say so rather than inventing an explanation later.
   */
  const pick = (
    from: ItemScore[],
    applyDiversity: boolean,
  ): { score: ItemScore; yieldedTo?: string } | undefined => {
    const open = from.filter((s) => !used.has(s.item.id));
    if (open.length === 0) return undefined;
    const adjusted = open.map((s) => {
      const dim = itemDimension(s.item);
      let penalty = 0;
      if (applyDiversity) {
        if (selectedDimensions.has(dim)) penalty += DIVERSITY_SAME_SESSION_PENALTY;
        if (recentDimensions.has(dim)) penalty += DIVERSITY_RECENT_DAYS_PENALTY;
      }
      return { s, adjusted: s.total - penalty, penalty };
    });
    adjusted.sort(
      (a, b) =>
        b.adjusted - a.adjusted ||
        b.s.total - a.s.total ||
        Number(stageIds.has(b.s.item.id)) - Number(stageIds.has(a.s.item.id)) ||
        a.s.item.id.localeCompare(b.s.item.id),
    );
    const best = adjusted[0];
    // Name the trade only when diversity ACTUALLY changed the order.
    const top = open.slice().sort((a, b) => b.total - a.total || a.item.id.localeCompare(b.item.id))[0];
    const yieldedTo = top && top.item.id !== best.s.item.id ? top.item.title : undefined;
    return { score: best.s, yieldedTo };
  };

  const add = (
    chosen: { score: ItemScore; yieldedTo?: string } | undefined,
    bucket: PlanBucket,
    extra: { repeat?: boolean } = {},
  ): Candidate | undefined => {
    if (!chosen) return undefined;
    used.add(chosen.score.item.id);
    selectedDimensions.add(itemDimension(chosen.score.item));
    const candidate: Candidate = {
      score: chosen.score,
      bucket,
      reason: planSegmentReason(bucket, chosen.score, {
        repeat: extra.repeat,
        yieldedTo: bucket === 'deep' ? chosen.yieldedTo : undefined,
        dueDate: dueById.get(chosen.score.item.id),
      }),
    };
    selected.push(candidate);
    return candidate;
  };

  // ---- 1. the anchor: the most useful work, before any role decoration ----
  const anchorPick = pick(pool, false);
  const anchor = add(anchorPick, anchorPick ? bucketFor(anchorPick.score) : 'deep', { repeat: isRepeatPool });
  if (!anchor) return empty('Nothing eligible to practise right now.');

  if (B >= SHORT_SESSION_MINUTES) {
    // ---- 2. warm-up: optional, real minutes, never at the cost of the work --
    const warmupMinutes = Math.max(MIN_SEGMENT_MINUTES, Math.round(B * params.warmupShare));
    if (B - warmupMinutes >= MAIN_WORK_FLOOR_MINUTES) {
      // A warm-up never consumes work that is WANTED for itself: an item
      // whose review is due deserves the retrieval slot, and one committed to
      // a class deserves real practice. Spending either as the warm-up would
      // quietly drop the need that made it urgent.
      const warmupPool = pool.filter(
        (s) => isWarmupSuitable(s.item) && !dueById.has(s.item.id) && s.parts.lesson === 0,
      );
      add(pick(warmupPool, false), 'warmup', { repeat: isRepeatPool });
    }

    // ---- 3. fill the middle with further useful work ------------------------
    const target = segmentTarget(B);
    const wantCooldown = B >= 20;
    const middleTarget = target - (wantCooldown ? 1 : 0);
    while (selected.length < middleTarget) {
      const next = pick(pool, true);
      if (!next) break;
      add(next, bucketFor(next.score), { repeat: isRepeatPool });
    }

    // ---- 4. cool-down: optional familiar work, never a slot to fill ---------
    if (wantCooldown && selected.length < target) {
      add(pick(pool.filter((s) => COOLDOWN_STATUSES.has(s.item.status)), false), 'cooldown', {
        repeat: isRepeatPool,
      });
    }
  }

  // ---- order: warm-up first, cool-down last, work by priority between -------
  const rank = (c: Candidate): number => (c.bucket === 'warmup' ? 0 : c.bucket === 'cooldown' ? 2 : 1);
  const ordered = selected
    .map((c, i) => ({ c, i }))
    .sort((a, b) => {
      const ra = rank(a.c);
      const rb = rank(b.c);
      if (ra !== rb) return ra - rb;
      if (ra === 1) return b.c.score.total - a.c.score.total || a.c.score.item.id.localeCompare(b.c.score.item.id);
      return a.i - b.i;
    })
    .map(({ c }) => c);

  const minutes = allocateMinutes(ordered.map((c) => c.bucket), B, params);
  const kept = ordered.slice(0, minutes.length);

  const coreIds = new Set<string>([anchor.score.item.id]);
  const warmupSeg = kept.find((c) => c.bucket === 'warmup');
  if (warmupSeg) coreIds.add(warmupSeg.score.item.id);
  const topWork = kept.find((c) => c.bucket === 'lesson' || c.bucket === 'review');
  if (topWork && coreIds.size < 3) coreIds.add(topWork.score.item.id);

  const segments: PlanSegment[] = kept.map((c, i) => ({
    itemId: c.score.item.id,
    title: c.score.item.title,
    minutes: minutes[i],
    bucket: c.bucket,
    core: coreIds.has(c.score.item.id),
    mode: defaultModeForStatus(c.score.item.status),
    focus: focusFor(c.score.item),
    reason: c.reason,
  }));

  // "Skipping X" is decided from what was ACTUALLY left out. Deriving it
  // before selection is how the fallback used to name an item it went on to
  // choose — a plan describing its own segment as skipped.
  const chosen = new Set(segments.map((s) => s.itemId));
  const skippedTitles = scored
    .filter((s) => practisedToday.has(s.item.id) && !chosen.has(s.item.id))
    .map((s) => s.item.title);

  return {
    instrumentId: args.instrumentId,
    budgetMinutes: B,
    segments,
    summary: buildSummary(segments, B, skippedTitles),
    generatedAt,
  };
}

/** Local calendar date `days` before `date`. */
function addDaysBack(date: ISODate, days: number): ISODate {
  const [y, m, d] = date.split('-').map(Number);
  const back = new Date(y, (m ?? 1) - 1, (d ?? 1) - days);
  return toISODate(back);
}

/** How many segments a budget can sensibly seat. */
function segmentTarget(B: number): number {
  if (B < SHORT_SESSION_MINUTES) return 1;
  if (B < 20) return 2;
  if (B < 30) return 3;
  if (B < 45) return 4;
  if (B < 60) return 5;
  if (B < 90) return 6;
  return 7;
}

/**
 * Apportion whole minutes across the given buckets, never exceeding `budget`
 * and normally using all of it. Every segment gets at least
 * MIN_SEGMENT_MINUTES and at most MAX_SEGMENT_MINUTES.
 *
 * That ceiling is what makes an honest remainder possible: two items and two
 * hours is not a reason to propose a sixty-minute block on each. When the
 * ceiling binds, the leftover minutes are simply not allocated, and the
 * summary says so — inventing filler or stretching work beyond a sensible
 * allocation would be a worse answer than a short plan.
 *
 * Deterministic largest-remainder split by bucket weight, a priority-ordered
 * ±1 fix, then review segments are clamped into
 * `[reviewSlotMinMinutes, reviewSlotMaxMinutes]`.
 */
export function allocateMinutes(buckets: PlanBucket[], budget: number, params?: SchedulingParams): number[] {
  const B = Math.max(MIN_SEGMENT_MINUTES, Math.round(budget));
  let list = buckets.slice();
  if (list.length === 0) return [];

  // Too many segments to give each ≥ MIN_SEGMENT_MINUTES? Drop lowest-priority.
  const maxSegments = Math.max(1, Math.floor(B / MIN_SEGMENT_MINUTES));
  if (list.length > maxSegments) {
    const keepOrder = list
      .map((bucket, i) => ({ bucket, i }))
      .sort((a, b) => BUCKET_PRIORITY.indexOf(a.bucket) - BUCKET_PRIORITY.indexOf(b.bucket) || a.i - b.i)
      .slice(0, maxSegments)
      .map((x) => x.i)
      .sort((a, b) => a - b);
    list = keepOrder.map((i) => buckets[i]);
  }

  if (list.length === 1) return [Math.min(B, MAX_SEGMENT_MINUTES)];

  const p = clampSchedulingParams(params);
  const alloc: number[] = new Array(list.length).fill(0);

  // The warm-up's share is a REAL ALLOCATION TARGET, not a weight nudge: it is
  // pinned to `round(B × warmupShare)` and then left alone. Bounded by
  // feasibility — never below the floor, never above the ceiling, and never so
  // large that another segment cannot reach the floor. Everything else splits
  // what remains, so the published share is the number the owner actually
  // sees on the screen rather than an input to a weighting they cannot check.
  const warmupIdx = list.indexOf('warmup');
  const rest = list.map((_, i) => i).filter((i) => i !== warmupIdx);
  let pool = B;
  if (warmupIdx >= 0) {
    const headroom = B - rest.length * MIN_SEGMENT_MINUTES;
    const target = Math.round(B * p.warmupShare);
    alloc[warmupIdx] = Math.max(
      MIN_SEGMENT_MINUTES,
      Math.min(target, MAX_SEGMENT_MINUTES, Math.max(MIN_SEGMENT_MINUTES, headroom)),
    );
    pool = B - alloc[warmupIdx];
  }

  const weights = rest.map((i) => weightFor(list[i], p));
  const sumW = weights.reduce((a, w) => a + w, 0) || 1;
  rest.forEach((i, k) => {
    alloc[i] = Math.min(
      MAX_SEGMENT_MINUTES,
      Math.max(MIN_SEGMENT_MINUTES, Math.floor((pool * weights[k]) / sumW)),
    );
  });

  let total = alloc.reduce((a, m) => a + m, 0);
  const byPriority = rest
    .map((i) => ({ b: list[i], i }))
    .sort((a, z) => BUCKET_PRIORITY.indexOf(a.b) - BUCKET_PRIORITY.indexOf(z.b) || a.i - z.i)
    .map((x) => x.i);

  // Hand out the shortfall to the highest-priority segments that still have
  // room under the ceiling. When none has room, the remainder stays unspent —
  // an honest short plan beats stretching two items across two hours.
  let guard = 0;
  while (total < B && guard++ < 10000) {
    let changed = false;
    for (const i of byPriority) {
      if (total >= B) break;
      if (alloc[i] < MAX_SEGMENT_MINUTES) {
        alloc[i] += 1;
        total += 1;
        changed = true;
      }
    }
    if (!changed) break;
  }
  // Trim any overflow from the lowest-priority segments that stay at the floor.
  const lowestFirst = byPriority.slice().reverse();
  guard = 0;
  while (total > B && guard++ < 10000) {
    let changed = false;
    for (const i of lowestFirst) {
      if (total <= B) break;
      if (alloc[i] > MIN_SEGMENT_MINUTES) {
        alloc[i] -= 1;
        total -= 1;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Keep review segments within the configured slot window — a retrieval check
  // should not quietly take half the session. Minutes move only among the
  // non-warm-up segments, so the warm-up's pinned share survives this step.
  const reviewIdx = rest.filter((i) => list[i] === 'review');
  if (reviewIdx.length > 0) {
    const others = byPriority.filter((i) => list[i] !== 'review');
    const othersLowestFirst = others.slice().reverse();
    for (const i of reviewIdx) {
      const original = alloc[i];
      const desired = Math.min(Math.max(original, p.reviewSlotMinMinutes), p.reviewSlotMaxMinutes);
      const diff = original - desired;
      if (diff > 0 && others.length > 0) {
        let give = diff;
        let g = 0;
        while (give > 0 && g++ < 10000) {
          let changed = false;
          for (const j of others) {
            if (give <= 0) break;
            if (alloc[j] < MAX_SEGMENT_MINUTES) {
              alloc[j] += 1;
              give -= 1;
              changed = true;
            }
          }
          if (!changed) break;
        }
        // Only give away what someone could actually take: the rest stays on
        // the review rather than vanishing from the budget.
        alloc[i] = original - (diff - give);
      } else if (diff < 0) {
        const need = -diff;
        let taken = 0;
        let g = 0;
        while (taken < need && g++ < 10000) {
          let changed = false;
          for (const j of othersLowestFirst) {
            if (taken >= need) break;
            if (alloc[j] > MIN_SEGMENT_MINUTES) {
              alloc[j] -= 1;
              taken += 1;
              changed = true;
            }
          }
          if (!changed) break;
        }
        alloc[i] = Math.min(MAX_SEGMENT_MINUTES, original + taken);
      }
    }
  }

  return alloc;
}

function weightFor(bucket: PlanBucket, params: SchedulingParams): number {
  // Warm-up is deliberately absent: its share is a pinned allocation target
  // above, not a weight. Having both was two half-mechanisms for one number,
  // and meant the published share was never the minutes anyone actually got.
  if (bucket === 'deep') return BUCKET_WEIGHT.deep * (params.deepWorkShare / DEFAULT_SCHEDULING_PARAMS.deepWorkShare);
  return BUCKET_WEIGHT[bucket];
}

function buildSummary(segments: PlanSegment[], B: number, skippedTitles: string[]): string {
  if (segments.length === 0) return `${B} min free — add an item and the plan fills in.`;
  const counts = new Map<PlanBucket, number>();
  for (const s of segments) counts.set(s.bucket, (counts.get(s.bucket) ?? 0) + 1);
  const parts: string[] = [];
  if (counts.get('warmup')) parts.push('a warm-up');
  const focus = (counts.get('deep') ?? 0) + (counts.get('lesson') ?? 0);
  if (focus) parts.push(`${focus} focus block${focus === 1 ? '' : 's'}`);
  if (counts.get('review')) parts.push(`${counts.get('review')} review${counts.get('review') === 1 ? '' : 's'}`);
  if (counts.get('cooldown')) parts.push('a cool-down');
  const planned = segments.reduce((a, s) => a + s.minutes, 0);
  let out = `${planned} min · ${joinList(parts)}.`;
  if (planned < B) {
    out += ` ${B - planned} of your ${B} minutes are unplanned — there isn’t more useful work waiting.`;
  }
  if (skippedTitles.length > 0) {
    const shown = skippedTitles.slice(0, 2).join(', ');
    const more = skippedTitles.length > 2 ? ` +${skippedTitles.length - 2} more` : '';
    out += ` Skipping ${shown}${more} — already practised today.`;
  }
  return out;
}

function joinList(parts: string[]): string {
  if (parts.length === 0) return 'a focused block';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * Re-spread minutes across the remaining segments after one was removed. Item
 * identity, bucket and reason are untouched — redistribution moves minutes,
 * never work: attaching one role's minutes and reason to another item is the
 * failure this preserves against.
 */
export function redistributePlan(plan: SessionPlan, params?: SchedulingParams): SessionPlan {
  if (plan.segments.length === 0) {
    return { ...plan, summary: buildSummary([], plan.budgetMinutes, []) };
  }
  const minutes = allocateMinutes(plan.segments.map((s) => s.bucket), plan.budgetMinutes, params);
  // allocateMinutes may drop segments if there are too many for the budget;
  // keep only the ones it kept, in order.
  const kept = plan.segments.slice(0, minutes.length);
  const segments = kept.map((s, i) => ({ ...s, minutes: minutes[i] }));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, []) };
}

/**
 * Swap segment `index` for the next-best alternative, keeping its minutes and
 * its role. Uses the SAME eligibility policy, candidate pool and warm-up
 * exclusions as the build — a swap that could reach material the build
 * excluded is a second, hidden policy, and it used to hand back an item
 * already practised today (or a due/lesson-committed item as a "warm-up")
 * even while a fresher, build-eligible candidate sat right behind it.
 *
 * DELIBERATELY NOT SHARED: the build's DIVERSITY preference
 * (`selectedDimensions`/`recentDimensions` in `buildSessionPlan`). Diversity
 * is a modest, order-dependent tie-break among the OTHER segments a build is
 * choosing at the same time (AGENTS.md: "subordinate to real needs") — it is
 * not an eligibility rule like practised-today or a due/lesson exclusion, and
 * a swap has no OTHER segments' choices in front of it to be diverse against
 * (`plan.segments` here is the already-finished plan, not a selection in
 * progress). Reconstructing that state for one substitution would make a
 * swap's answer depend on an ordering it never participated in. A swap
 * therefore returns the single best-scoring ELIGIBLE candidate, full stop.
 */
export function swapSegment(
  plan: SessionPlan,
  index: number,
  args: Omit<BuildPlanArgs, 'budgetMinutes'> & { excludeIds?: Set<string> },
): SessionPlan {
  const target = plan.segments[index];
  if (!target) return plan;

  const items = args.items
    .filter((i) => i.instrumentId === plan.instrumentId)
    .filter(isProactiveCandidate);
  const blocks = args.blocks.filter((b) => b.instrumentId === plan.instrumentId);
  const scored = scoreItems(items, groupBlocksByItem(blocks), args.now, args.preparationDates);
  // The SAME candidate pool the build itself drew from — practised-today
  // material stays excluded here too, unless nothing fresh is eligible for
  // this bucket, in which case the honest repeat fallback applies exactly as
  // it does on a build (§B3/B7).
  const { pool, isRepeatPool } = candidatePool(scored, blocks, args.now);

  const inUse = new Set(plan.segments.map((s) => s.itemId));
  const exclude = args.excludeIds ?? new Set<string>();
  const dueById = new Map(
    dueReviews(args.reviews, args.now)
      .filter((r) => items.some((i) => i.id === r.practiceItemId))
      .map((r) => [r.practiceItemId, r.dueDate] as const),
  );

  const eligible = (s: ItemScore): boolean => {
    if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
    switch (target.bucket) {
      case 'warmup':
        // Same exclusions as the build's own warm-up pool: a due review or a
        // class commitment deserves the slot it is actually needed for, never
        // spent as a warm-up.
        return isWarmupSuitable(s.item) && !dueById.has(s.item.id) && s.parts.lesson === 0;
      case 'lesson':
        return s.parts.lesson > 0;
      case 'review':
        return dueById.has(s.item.id);
      case 'cooldown':
        return COOLDOWN_STATUSES.has(s.item.status);
      case 'deep':
        return true;
    }
  };

  const pick = pool.find(eligible);
  if (!pick) return plan;

  const replacement: PlanSegment = {
    itemId: pick.item.id,
    title: pick.item.title,
    minutes: target.minutes,
    bucket: target.bucket,
    core: target.core,
    mode: defaultModeForStatus(pick.item.status),
    focus: focusFor(pick.item),
    reason: planSegmentReason(target.bucket, pick, { dueDate: dueById.get(pick.item.id), repeat: isRepeatPool }),
  };
  const segments = plan.segments.map((s, i) => (i === index ? replacement : s));
  return { ...plan, segments, summary: buildSummary(segments, plan.budgetMinutes, []) };
}

/** Exposure window this planner reasons over, re-exported for the docs table. */
export { EXPOSURE_WINDOW_DAYS };

// --- Running a plan ----------------------------------------------------------
//
// The pointer transitions live here, pure, for the same reason every other
// decision does: the store cannot be imported in a Node test (it pulls in
// Dexie), so a transition written inline there would be provable only through
// a browser. These are the transitions; `useStore` is the thin caller.

export type PlanSegmentStatus = 'pending' | 'done' | 'skipped';

export interface PlanRunSegment extends PlanSegment {
  status: PlanSegmentStatus;
}

export interface PlanRun {
  instrumentId: string;
  budgetMinutes: number;
  startedAt: string;
  /** Index of the next segment to practise; === segments.length when finished. */
  pointer: number;
  segments: PlanRunSegment[];
}

/**
 * The next still-PENDING segment. It wraps once to the start, so a pending
 * segment the pointer has already jumped past is not stranded; a segment the
 * owner deliberately skipped stays skipped. `segments.length` means finished.
 */
export function advancePlanPointer(segments: PlanRunSegment[], from: number): number {
  for (let i = from + 1; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  return segments.length;
}

/**
 * A block just closed. When it was the CURRENT segment's item, that segment is
 * done and the pointer moves on; anything else leaves the run untouched —
 * practising something off-plan is ordinary, not plan progress.
 */
export function completePlanSegment(run: PlanRun, itemId: string): PlanRun {
  const seg = run.segments[run.pointer];
  if (!seg || seg.itemId !== itemId || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) => (i === run.pointer ? { ...s, status: 'done' as const } : s));
  return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
}

/** Skip the current segment. Records nothing: a skipped segment is not practice. */
export function skipPlanSegment(run: PlanRun): PlanRun {
  const seg = run.segments[run.pointer];
  if (!seg || seg.status !== 'pending') return run;
  const segments = run.segments.map((s, i) => (i === run.pointer ? { ...s, status: 'skipped' as const } : s));
  return { ...run, segments, pointer: advancePlanPointer(segments, run.pointer) };
}

/**
 * Has the local calendar day moved past the day a session-plan PREVIEW was
 * built for? Takes the caller's OWN `now` rather than reading a clock itself,
 * but the point of this function is that the caller must pass the TRUE
 * current instant here, never a screen's own polled `now`
 * (`useDecisionNow` refreshes at most every 30 seconds, plus visibility/focus)
 * — starting a plan is an authority boundary, the one place that lag must
 * never be trusted. `SessionPlan.tsx`'s own `stale` flag already renders this
 * same comparison against its polled `now` for the passive banner; this is
 * the identical rule, extracted so the click-time check reads a fresh
 * `Date` directly rather than waiting for that polled value to catch up.
 */
export function planPreviewDayHasPassed(baseDay: string, now: Date): boolean {
  return todayISODate(now) !== baseDay;
}

export type PlanStartCheck =
  | { ok: true; item: PracticeItem }
  | { ok: false; reason: 'finished' | 'deleted' | 'moved' | 'busy' };

/**
 * May the current segment be started right now? Revalidated against LIVE data
 * every time, never trusted from the plan: between building a plan and reaching
 * a segment the item can be deleted or moved to another instrument, and another
 * clock can have been started.
 *
 * A `deleted`/`moved` segment is visibly skipped by the caller rather than
 * played under the wrong instrument; a `busy` verdict refuses outright, because
 * replacing an unfinished block or routine run would destroy real practice.
 */
export function planSegmentStartable(
  run: PlanRun,
  items: PracticeItem[],
  busy = false,
): PlanStartCheck {
  if (busy) return { ok: false, reason: 'busy' };
  const seg = run.segments[run.pointer];
  if (!seg) return { ok: false, reason: 'finished' };
  const item = items.find((i) => i.id === seg.itemId);
  if (!item) return { ok: false, reason: 'deleted' };
  if (item.instrumentId !== run.instrumentId) return { ok: false, reason: 'moved' };
  return { ok: true, item };
}
```

### src/pages/SessionPlan.tsx

```
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  buildSessionPlan,
  currentStage,
  MAX_BUDGET_MINUTES,
  MIN_BUDGET_MINUTES,
  planPreviewDayHasPassed,
  preparationDatesByItem,
  redistributePlan,
  swapSegment,
  clampSchedulingParams,
  todayISODate,
  validateBudgetMinutes,
  type PlanBucket,
  type SessionPlan as SessionPlanT,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { CheckIcon, MinusIcon, PlayIcon, XIcon } from '../components/icons';
import { useDecisionNow } from '../components/useDecisionNow';

/** The presets the picker offers; any whole minute in range is still accepted. */
const BUDGET_PRESETS = [5, 10, 15, 20, 30, 45, 60] as const;

const BUCKET_LABEL: Record<PlanBucket, string> = {
  warmup: 'Warm-up',
  lesson: 'For class',
  review: 'Review',
  deep: 'Focus',
  cooldown: 'Cool-down',
};

export default function SessionPlan() {
  const activePlan = useStore((s) => s.activePlan);
  // A running plan takes over the whole page; otherwise show the preview.
  return activePlan ? <PlanRunner /> : <PlanPreview />;
}

// --- Preview: build, tweak, and start ---------------------------------------

function PlanPreview() {
  const db = useStore((s) => s.db);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const planMinutes = useStore((s) => s.planMinutesByInstrument);
  const setPlanMinutes = useStore((s) => s.setPlanMinutes);
  const startPlan = useStore((s) => s.startPlan);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Refreshed at a local-day boundary so a preview left open overnight never
  // plans against yesterday's due dates and lesson deadlines.
  //
  // `useDecisionNow` polls at most every 30 seconds (plus visibility/focus),
  // so it can lag the true instant by up to that long. `nowOverride` closes
  // that gap at the one moment it actually matters — Start — without needing
  // the shared hook to expose a manual refresh: the same small local-override
  // shape CloseBlock's own Save race uses. `start()` sets it the instant it
  // finds the real local day has moved past the day this preview was built
  // for, forcing an immediate re-render where `today`/`stale` below already
  // reflect it, instead of silently installing yesterday's selections under a
  // Start button that still reads as enabled.
  const [nowOverride, setNowOverride] = useState<Date | null>(null);
  const decisionNow = useDecisionNow();
  const now = nowOverride ?? decisionNow;

  const instrumentId = sessionInstrumentId ?? db.instruments.find((i) => i.active)?.id ?? db.instruments[0]?.id ?? '';
  // Invalid input is rejected at the boundary, never clamped into a session
  // length the owner did not choose or looped over.
  const queryMinutes = validateBudgetMinutes(Number(params.get('minutes')));
  const [chosen, setChosen] = useState<number | null>(null);
  const budget = chosen ?? queryMinutes ?? validateBudgetMinutes(planMinutes[instrumentId]) ?? 20;

  const build = useMemo(() => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
    const pathway = db.pathways.find((p) => p.instrumentId === instrumentId);
    const stage = pathway ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId) : null;
    const stageItemIds = stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
    return buildSessionPlan({
      instrumentId,
      budgetMinutes: budget,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      preparationDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
    });
  }, [instrumentId, budget, db.items, db.blocks, db.reviews, db.lessons, db.lessonAgenda, db.pathways, db.pathwayStages, db.settings, now]);

  const [plan, setPlan] = useState<SessionPlanT>(build);
  // WHAT the plan was built FOR. `generatedAt` used to be the re-seed key, and
  // it never changed within a mount (the page froze `now`), so changing the
  // budget or the instrument left the previous plan on screen — a preview of a
  // session the owner was no longer asking for.
  const seedKey = `${instrumentId}|${budget}`;
  const [seed, setSeed] = useState(seedKey);
  // The data revision the visible draft was built from. A change to the items,
  // blocks or reviews underneath it does NOT silently rewrite the draft (that
  // would throw away deliberate swaps and removals) — it marks the draft as
  // needing regeneration, so stale work can never be started by accident.
  const rev = useStore((s) => s.rev);
  const [baseRev, setBaseRev] = useState(rev);
  // The LOCAL CALENDAR DAY the visible draft was built for. `rev` alone
  // cannot catch a plan left open across midnight with no database write in
  // between: `db.items`/`db.blocks`/`db.reviews` are identical, so `rev`
  // never moves, yet "today's class" and "due today" are no longer honest
  // once the day has actually rolled. Tracked the same way as `rev` — marking
  // the draft stale rather than silently rewriting it — so a deliberate swap
  // or removal survives the boundary exactly as it survives any other change
  // underneath the plan.
  const today = todayISODate(now);
  const [baseDay, setBaseDay] = useState(today);
  if (seedKey !== seed) {
    setSeed(seedKey);
    setPlan(build);
    setBaseRev(rev);
    setBaseDay(today);
  }
  const stale = rev !== baseRev || today !== baseDay;

  const total = plan.segments.reduce((a, s) => a + s.minutes, 0);
  const editorArgs = () => {
    const preparationDates = preparationDatesByItem(db.lessonAgenda, db.lessons, now);
    const pathway = db.pathways.find((p) => p.instrumentId === instrumentId);
    const stage = pathway ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId) : null;
    const stageItemIds = stage ? new Set(db.items.filter((i) => i.stageId === stage.id).map((i) => i.id)) : new Set<string>();
    return {
      instrumentId,
      now,
      items: db.items,
      blocks: db.blocks,
      reviews: db.reviews,
      preparationDates,
      stageItemIds,
      params: clampSchedulingParams(db.settings),
      excludeIds: new Set(plan.segments.map((s) => s.itemId)),
    };
  };

  function regenerate() {
    setPlan(build);
    setSeed(seedKey);
    setBaseRev(rev);
    setBaseDay(today);
  }
  function removeAt(i: number) {
    const segments = plan.segments.filter((_, idx) => idx !== i);
    setPlan(redistributePlan({ ...plan, segments }, clampSchedulingParams(db.settings)));
  }
  function swapAt(i: number) {
    setPlan(swapSegment(plan, i, editorArgs()));
  }
  function start() {
    // Starting a plan is an authority boundary: check the TRUE current
    // instant here, never the polled `now` above, which can still be
    // showing yesterday for up to `useDecisionNow`'s own poll interval after
    // local midnight has genuinely passed — the exact window a dispatched
    // visibility/focus event papers over but a real device left untouched
    // does not get. A mismatch refuses the start and forces the SAME visible
    // refresh the passive banner below already shows for a data change,
    // rather than silently installing a preview for a day that has passed.
    const trueNow = new Date();
    if (planPreviewDayHasPassed(baseDay, trueNow)) {
      setNowOverride(trueNow);
      return;
    }
    if (plan.segments.length === 0 || stale) return;
    setPlanMinutes(instrumentId, plan.budgetMinutes);
    startPlan(plan);
    navigate('/plan');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="row between">
          {/* The instrument name is the owner's own editable text — its own
              dir="auto" isolate, nested inside the title rather than bare, so
              a Farsi name doesn't inherit whatever base the title's fixed
              English words would otherwise resolve to. */}
          <h1 className="page-title">
            Your <span dir="auto">{instrumentName(db, instrumentId)}</span> session
          </h1>
          <Link to="/" className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} aria-label="Back to Today">
            <XIcon />
          </Link>
        </div>
        <p className="page-sub">{plan.summary}</p>
      </header>

      {/* How long have you got? The presets cover the ordinary answers
          (5 and 10 included — a five-minute session is a real session, and
          used to have no preset at all), and the number entry covers every
          other whole minute in range. An out-of-range or unreadable value is
          simply not accepted, rather than quietly becoming something else. */}
      <fieldset className="stack-sm" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="section-label">How long have you got?</legend>
        <div className="options">
          {BUDGET_PRESETS.map((m) => (
            <button
              key={m}
              type="button"
              className={`option${budget === m ? ' selected' : ''}`}
              aria-pressed={budget === m}
              onClick={() => setChosen(m)}
            >
              {m} min
            </button>
          ))}
        </div>
        <input
          className="input"
          type="number"
          inputMode="numeric"
          min={MIN_BUDGET_MINUTES}
          max={MAX_BUDGET_MINUTES}
          step={1}
          aria-label="Session length in minutes"
          value={budget}
          onChange={(e) => {
            const v = validateBudgetMinutes(Number(e.target.value));
            if (v !== null) setChosen(v);
          }}
          style={{ maxWidth: 120 }}
        />
      </fieldset>

      {plan.segments.length === 0 ? (
        <div className="card">
          <p className="dim">Nothing to plan yet — add a piece or exercise and come back.</p>
        </div>
      ) : (
        <div className="card card-flush list">
          {plan.segments.map((seg, i) => (
            <div key={`${seg.itemId}-${i}`} className="list-row" style={{ alignItems: 'flex-start' }}>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                  <span className="mono-num" style={{ fontWeight: 600, minWidth: 44 }}>{seg.minutes} min</span>
                  <span className="tiny faint">{BUCKET_LABEL[seg.bucket]}</span>
                  {seg.core && <span className="tiny" style={{ color: 'var(--accent)' }}>core</span>}
                </div>
                <div dir="auto">
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {/* seg.reason is always English (planSegmentReason) — its own
                      dir="ltr" isolate keeps its bidi base fixed regardless of
                      the title's. */}
                  <div className="tiny faint">
                    <span dir="ltr">{seg.reason}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" style={{ flex: 'none' }} onClick={() => swapAt(i)} aria-label={`Swap ${seg.title} for another`}>
                Swap
              </button>
              <button className="btn btn-ghost" style={{ flex: 'none', minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => removeAt(i)} aria-label={`Remove ${seg.title} from the plan`}>
                <MinusIcon />
              </button>
            </div>
          ))}
          <div className="list-row">
            <span className="grow tiny faint">Total</span>
            <span className="mono-num" style={{ fontWeight: 600 }}>{total} min</span>
          </div>
        </div>
      )}

      {stale && (
        <div className="card card-quiet small" role="status" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">
            {today !== baseDay
              ? 'This plan was built for a day that has passed. Regenerate it before you start.'
              : 'Your practice data changed while this plan was open. Regenerate it before you start.'}
          </span>
        </div>
      )}

      <div className="row" style={{ gap: 10 }}>
        <button
          className="btn btn-primary btn-lg grow"
          onClick={start}
          disabled={plan.segments.length === 0 || stale}
        >
          <PlayIcon /> Start plan
        </button>
        <button className="btn btn-lg" onClick={regenerate}>Regenerate</button>
      </div>
      <p className="tiny faint">
        Each block is real practice — start it, close it, and the plan moves on. Swap or remove anything before you begin.
      </p>
    </div>
  );
}

// --- Runner: walk the segments through real blocks --------------------------

function PlanRunner() {
  const activePlan = useStore((s) => s.activePlan)!;
  const db = useStore((s) => s.db);
  const beginPlanSegment = useStore((s) => s.beginPlanSegment);
  const skipPlanSegment = useStore((s) => s.skipPlanSegment);
  const endPlan = useStore((s) => s.endPlan);
  const navigate = useNavigate();

  const done = activePlan.segments.filter((s) => s.status === 'done').length;
  const finished = activePlan.pointer >= activePlan.segments.length;

  function begin() {
    beginPlanSegment();
    navigate('/active');
  }
  function finish() {
    endPlan();
    navigate('/');
  }

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)' }}>
      <header className="stack-sm">
        <div className="row between">
          {/* Same isolate as the picker's own title above. */}
          <h1 className="page-title">
            <span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span> session
          </h1>
          <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={finish} aria-label="End the plan">
            <XIcon />
          </button>
        </div>
        <p className="page-sub">
          {done} of {activePlan.segments.length} done · {activePlan.budgetMinutes} min planned
        </p>
      </header>

      {finished ? (
        <div className="card card-accent stack-sm">
          <h2 className="title-md">Session complete</h2>
          <p className="dim">You worked through the plan. End on that — rest is where it consolidates.</p>
          <button className="btn btn-primary btn-lg" onClick={finish}>
            <CheckIcon /> Done
          </button>
        </div>
      ) : null}

      <div className="card card-flush list">
        {activePlan.segments.map((seg, i) => {
          const isCurrent = i === activePlan.pointer && !finished;
          return (
            <div
              key={`${seg.itemId}-${i}`}
              className={`list-row${isCurrent ? ' card-accent' : ''}`}
              style={{ alignItems: 'flex-start', opacity: seg.status === 'pending' ? 1 : 0.55 }}
            >
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="row" style={{ gap: 8, alignItems: 'baseline' }}>
                  <span className="mono-num" style={{ fontWeight: 600, minWidth: 44 }}>{seg.minutes} min</span>
                  <span className="tiny faint">{BUCKET_LABEL[seg.bucket]}</span>
                  {seg.status === 'done' && <span className="tiny" style={{ color: 'var(--tone-good)' }}>done</span>}
                  {seg.status === 'skipped' && <span className="tiny faint">skipped</span>}
                </div>
                <div dir="auto">
                  <div className="truncate" style={{ fontWeight: 500 }}>{seg.title}</div>
                  {isCurrent && (
                    <div className="tiny faint">
                      <span dir="ltr">{seg.reason}</span>
                    </div>
                  )}
                </div>
              </div>
              {isCurrent && (
                <div className="row" style={{ gap: 6, flex: 'none' }}>
                  <button className="btn btn-primary btn-sm" onClick={begin} aria-label={`Start ${seg.title}`}>
                    <PlayIcon /> Start
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={skipPlanSegment} aria-label={`Skip ${seg.title}`}>
                    Skip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### src/store/useStore.ts

```
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearBlobs, deleteBlob, idbStorage, storageWasEmpty } from './idb';
import { withRevision } from './revision';
import {
  acknowledgeThrough,
  applyBlockStats,
  applyRoutineRun,
  catalogForStage,
  isLosslesslyRemovable,
  completeOpenReviewsFor,
  computeReviewOutcome,
  installDatabase,
  createPreparation,
  createQuestion,
  detachItem as detachAgendaItem,
  detachLesson as detachAgendaLesson,
  markQuestionAsked as markAgendaQuestionAsked,
  reopenQuestion as reopenAgendaQuestion,
  retargetEntriesForItemInstrument,
  retargetEntry as retargetAgendaEntry,
  completePlanSegment,
  planSegmentStartable,
  scheduleAgainPlan,
  skipPlanSegment as skipPlanSegmentRun,
  setQuestionAnswer as setAgendaQuestionAnswer,
  resolveReviewDate,
  applyReviewDateToRows,
  applyReviewDateToRow,
  clampSchedulingParams,
  createBlock,
  createInstrument,
  createItem,
  createLesson,
  createMaterial,
  createReview,
  createSeedDB,
  detachIncompatibleRoutinesForPathway,
  detachRoutinesFromPathway,
  detachRoutinesFromStage,
  duplicateRoutineData,
  focusForItem,
  groupBlocksByItem,
  itemFromCatalogEntry,
  itemOwnedAttachments,
  retargetRoutineInstrument,
  runElapsedSeconds,
  segmentBoundaries,
  skipCurrentSegment,
  toRunSegments,
  snoozePlan,
  SNOOZE_DAYS_DEFAULT,
  todayISODate,
  unbindItemFromRoutines,
  unbindItemWhereInstrumentMismatch,
  defaultModeForStatus,
  DEFAULT_DURATION_MINUTES,
  emptyDB,
  migrateToCurrent,
  newId,
  nowISO,
  SCHEMA_VERSION,
  seedPathways,
  buildSetarClassLessons,
  missingSessionReferences,
  SETAR_CLASS_SESSIONS,
  validateDB,
  type BlockMode,
  type BlockResult,
  type FocusArea,
  type GuitarFields,
  type ID,
  type Instrument,
  type AttachmentMeta,
  type ISODate,
  type ItemStatus,
  type LessonFileKind,
  type LessonRecording,
  type Material,
  type MaterialSourceType,
  type MaterialStatus,
  type Pathway,
  type PathwayRoutine,
  type PathwayStage,
  type PersianFields,
  type PracticeDB,
  type PracticeItem,
  type Rating,
  type ReviewAnswer,
  type ReviewMode,
  type ReviewType,
  type RoutineSegment,
  type RunSegment,
  type PlanRunSegment,
  type SchedulingParams,
  type SessionPlan,
} from '../domain';
import type { CreateItemInput } from '../domain/factories';

// ---------------------------------------------------------------------------
// The single app store. Holds the whole local database, the live practice
// session, and a colour-scheme preference. Everything persists to
// localStorage; domain logic stays pure and is called from the actions here.
// ---------------------------------------------------------------------------

export type ThemePref = 'system' | 'light' | 'dark';

export interface ActiveSession {
  itemId: ID;
  instrumentId: ID;
  materialId?: ID;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  targetMinutes: number;
  startedAt: string;
  /** Seconds accumulated up to the last pause. */
  accumulatedSeconds: number;
  running: boolean;
  /** When the current running segment began (if running). */
  segmentStartedAt?: string;
  /** A quick note jotted during practice; pre-fills the close screen. */
  note?: string;
  /** Count of boundaries already announced (practiceSignal.ts). Absent reads as zero — see nextSignal. */
  signalledThrough?: number;
}

export function sessionElapsedSeconds(s: ActiveSession, now: Date = new Date()): number {
  const live = s.running && s.segmentStartedAt
    ? (now.getTime() - new Date(s.segmentStartedAt).getTime()) / 1000
    : 0;
  return Math.max(0, Math.floor(s.accumulatedSeconds + live));
}

/** A plan segment plus its live run status (the domain's own run shape). */
export type PlanSegmentState = PlanRunSegment;

/** The Session Plan currently being run (ephemeral — never in PracticeDB). */
export interface ActivePlan {
  instrumentId: ID;
  budgetMinutes: number;
  startedAt: string;
  /** Index of the next segment to practise. */
  pointer: number;
  segments: PlanSegmentState[];
}

/**
 * A routine run in progress (ephemeral — never in PracticeDB). Same
 * accumulated-seconds-plus-live-since-timestamp shape as `ActiveSession`, for
 * the same reason: living in the store — not component state — means
 * navigating away (a nav-bar tap, browser back) never silently loses
 * genuinely-elapsed bound-item practice, exactly like an active block. Only
 * one routine can run at a time, matching `active`/`activePlan`.
 */
export interface ActiveRoutine {
  routineId: ID;
  shortOnTime: boolean;
  /**
   * The segment list as it was AT START — label, essential, itemId — frozen
   * here rather than re-derived live from the routine's current data. The
   * routine can be edited (segments added/removed) while a run is in
   * progress (Edit is reachable from StageDetail/PathwayDetail with no
   * "is this active" guard); re-deriving from live data would desync this
   * list's length from `segs` below and index past the end of one of them —
   * a blank runner screen. A run's segments are what was actually started.
   */
  authoredSegments: RoutineSegment[];
  /** Same length/order as authoredSegments; .seconds mutates (Skip clamps it). */
  segs: RunSegment[];
  accumulatedSeconds: number;
  running: boolean;
  runningSince?: string;
  /** Count of boundaries already announced (practiceSignal.ts). Absent reads as zero — see nextSignal. */
  signalledThrough?: number;
}

/** Advance the pointer to the next still-pending segment (or one past the end). */
export interface StartSessionInput {
  itemId: ID;
  instrumentId: ID;
  materialId?: ID;
  mode: BlockMode;
  focus: FocusArea;
  constraint?: string;
  targetMinutes: number;
}

export interface CloseSessionInput {
  result: BlockResult;
  durationMinutes: number;
  observation?: string;
  nextAction?: string;
  bodyNote?: string;
  newStatus?: ItemStatus;
  /**
   * What the close screen answered about the next review. 'unanswered' (no
   * result chosen) must leave the item's date AND its open review row exactly
   * as they are — see ReviewAnswer in scheduling.ts.
   */
  answer: ReviewAnswer;
  nextReviewDate?: ISODate;
  reviewType?: ReviewType;
  /**
   * A question raised during this close. It becomes its OWN agenda entry —
   * it never overwrites an existing question, and it never marks the item as
   * work committed for a class. Targetless means honestly unassigned.
   */
  newQuestion?: { text: string; lessonId?: ID };
  /**
   * The `now` the close screen actually PREVIEWED its decision with — never
   * read from module scope inside `closeSession`. Recomputing a fresh
   * `new Date()` here instead would let the saved date silently diverge from
   * the one the screen just showed if the local day rolled between the
   * screen's last render and this call; the caller (`CloseBlock`) is
   * responsible for checking that first and refusing to call this while they
   * disagree. Defaults to `new Date()` for callers with no decision to keep
   * in step (there are none in-app; only tests omit it).
   */
  now?: Date;
}

export interface ItemPatch {
  instrumentId?: ID;
  title?: string;
  itemType?: PracticeItem['itemType'];
  materialId?: ID;
  status?: ItemStatus;
  importance?: Rating;
  difficulty?: Rating;
  currentProblem?: string;
  primaryFocus?: FocusArea;
  bestStrategy?: string;
  notes?: string;
  tags?: string[];
  /** `undefined` (key absent) keeps the schedule; `null` clears it; an ISODate moves it — and its open review row with it (§1.5). */
  nextReviewDate?: ISODate | null;
  reviewMode?: ReviewMode;
  reviewIntervalDays?: number;
  persian?: PersianFields;
  guitar?: GuitarFields;
}

interface StoreState {
  db: PracticeDB;
  /** Monotonic data revision — bumped by middleware on every db mutation. */
  rev: number;
  active: ActiveSession | null;
  theme: ThemePref;
  /** True once the async IndexedDB store has finished rehydrating. */
  hydrated: boolean;
  /**
   * The instrument the user chose to practise right now ("I'm practising Setar").
   * Persisted so Today reopens where they left off. Null = overview.
   */
  sessionInstrumentId: ID | null;
  /** Reviews the user said "not now" to — hidden for the rest of *today* only. */
  notNow: { date: string; ids: ID[] };
  /** The Session Plan being run right now (ephemeral; not in PracticeDB). */
  activePlan: ActivePlan | null;
  /** Last chosen plan duration per instrument, so the picker remembers. */
  planMinutesByInstrument: Record<ID, number>;
  /** The routine run in progress right now (ephemeral; not in PracticeDB). */
  activeRoutine: ActiveRoutine | null;

  setTheme: (t: ThemePref) => void;
  setSessionInstrument: (id: ID | null) => void;

  /** Merge + clamp scheduling knobs. Passing null resets to the defaults. */
  updateSchedulingParams: (patch: Partial<SchedulingParams> | null) => void;

  // Session Plan (a time-budgeted programme over real practice blocks)
  /** Remember the chosen duration for an instrument's next plan. */
  setPlanMinutes: (instrumentId: ID, minutes: number) => void;
  /** Begin running a built plan (segments become pending). */
  startPlan: (plan: SessionPlan) => void;
  /** Start a real block seeded from the current segment (→ /active → /close). */
  beginPlanSegment: () => void;
  /** Mark the current segment skipped and advance (no data written). */
  skipPlanSegment: () => void;
  /** End the running plan (clears it). */
  endPlan: () => void;

  // Attachments (metadata; blobs live in IndexedDB via src/store/idb.ts)
  addAttachmentMeta: (meta: AttachmentMeta) => void;
  removeAttachmentMeta: (id: ID) => void;

  // Instruments
  addInstrument: (input: { name: string; family?: string }) => ID;
  updateInstrument: (id: ID, patch: Partial<Pick<Instrument, 'name' | 'family' | 'active'>>) => void;

  // Lessons (classes with a teacher)
  addLesson: (input: { instrumentId: ID; date: ISODate; notes?: string; number?: number }) => ID;
  updateLesson: (id: ID, patch: { date?: ISODate; notes?: string; number?: number }) => void;
  deleteLesson: (id: ID) => void;
  /** Link/unlink an existing item to a lesson (a link, never ownership). */
  linkItemToLesson: (lessonId: ID, itemId: ID) => void;
  addLessonRecording: (
    lessonId: ID,
    input: {
      title: string;
      path: string;
      kind?: LessonFileKind;
      date?: ISODate;
      sizeBytes?: number;
      durationLabel?: string;
      notes?: string;
    },
  ) => ID;
  removeLessonRecording: (lessonId: ID, recordingId: ID) => void;
  /** Additively import the Setar class history (NAS references). Returns count added. */
  importSetarClasses: (instrumentId: ID) => number;
  unlinkItemFromLesson: (lessonId: ID, itemId: ID) => void;

  // Materials
  addMaterial: (input: {
    instrumentId: ID;
    title: string;
    sourceType?: MaterialSourceType;
    sourceName?: string;
    parentTitle?: string;
    section?: string;
    teacherOrSource?: string;
    notes?: string;
    status?: MaterialStatus;
  }) => ID;
  updateMaterial: (id: ID, patch: Partial<Omit<Material, 'id' | 'createdAt'>>) => void;
  deleteMaterial: (id: ID) => void;

  // Items
  addItem: (input: CreateItemInput) => ID;
  updateItem: (id: ID, patch: ItemPatch) => void;
  setItemStatus: (id: ID, status: ItemStatus) => void;
  deleteItem: (id: ID) => void;
  /** Delete a catalog item ONLY if lossless (fresh, never practised); returns whether it did. */
  removeCatalogItem: (id: ID) => boolean;
  placeItemInStage: (itemId: ID, stageId: ID | undefined) => void;

  // Lesson agenda — commitments and questions, each naming its own class
  /** Commit an item to a specific class (or capture it unassigned). Returns the entry id. */
  addLessonPreparation: (itemId: ID, lessonId?: ID) => ID | null;
  /** Raise a question. It is its own entry; nothing else is overwritten. */
  addLessonQuestion: (input: { text: string; instrumentId: ID; itemId?: ID; lessonId?: ID }) => ID | null;
  /** Edit a question's text. Never touches its asked state or answer. */
  updateLessonQuestion: (id: ID, text: string) => void;
  /** Point an entry at a different class, or at none. The only carry-forward. */
  setAgendaTarget: (id: ID, lessonId: ID | undefined) => void;
  /** Mark asked (optionally with the teacher's answer). Logs no practice. */
  markQuestionAsked: (id: ID, answer?: string) => void;
  /** Put an asked question back on the open list. */
  reopenQuestion: (id: ID) => void;
  /** Record or replace a teacher answer without changing the asked state. */
  setQuestionAnswer: (id: ID, answer: string) => void;
  /** Remove an entry. Never deletes the item or its practice. */
  removeAgendaEntry: (id: ID) => void;
  /** Create a practice item from a stage's reference catalog entry; returns its id. */
  addFromCatalog: (stageId: ID, entryKey: string) => ID;
  /** Begin a session on an existing item (with smart defaults). */
  startItemSession: (itemId: ID) => void;

  // Session
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setSessionNote: (note: string) => void;
  /** Persist how many target boundaries have been announced (practiceSignal.ts) — store state, not component state, so navigating away and back never re-announces. */
  setSessionSignal: (marker: number) => void;
  cancelSession: () => void;
  closeSession: (input: CloseSessionInput) => void;

  // Reviews
  completeReview: (id: ID, result?: BlockResult) => void;
  /** "Not now": hide a due review for the rest of today (no schedule change). */
  notNowReview: (id: ID) => void;
  /** Snooze: honestly move the due date N days from today (no SM-2 change). */
  snoozeReview: (id: ID, days?: number) => void;
  /**
   * "Schedule again" from the item itself: set the one pending date on both
   * the item and its review row, creating the row when none is open. Purely
   * administrative — no block, no result, no SM-2 progress.
   */
  scheduleReviewAgain: (itemId: ID, dueDate: ISODate, reviewType?: ReviewType) => void;

  // Pathways
  addPathway: (input: { name: string; instrumentId?: ID; source?: string; description?: string; note?: string }) => ID;
  updatePathway: (id: ID, patch: Partial<Pick<Pathway, 'name' | 'instrumentId' | 'source' | 'description' | 'note' | 'archived' | 'currentStageId'>>) => void;
  deletePathway: (id: ID) => void;
  reseedDefaultPathways: () => void;

  addStage: (pathwayId: ID, input: { code: string; title: string; group?: string; intro?: string }) => ID;
  updateStage: (id: ID, patch: Partial<Pick<PathwayStage, 'code' | 'title' | 'group' | 'intro'>>) => void;
  deleteStage: (id: ID) => void;
  moveStage: (id: ID, dir: -1 | 1) => void;
  /** Rename a section heading across all of a pathway's stages. */
  renameSection: (pathwayId: ID, oldGroup: string | undefined, newGroup: string) => void;

  // Routines (ordinary editable data, placement optional, instrument required)
  addRoutine: (input: {
    name: string;
    instrumentId: ID;
    pathwayId?: ID;
    stageId?: ID;
    segments?: RoutineSegment[];
  }) => ID;
  /**
   * Full-form save: a complete replace, not a partial patch. Every save
   * re-enforces the binding + placement invariants against the instrument
   * being saved, whether or not it changed — never trusts the form on
   * faith. `instrumentId` is optional here (unlike addRoutine): editing an
   * already-unscoped legacy routine must be able to save without inventing
   * one.
   */
  updateRoutine: (
    id: ID,
    patch: { name: string; segments: RoutineSegment[]; instrumentId?: ID; pathwayId?: ID; stageId?: ID },
  ) => void;
  deleteRoutine: (id: ID) => void;
  duplicateRoutine: (id: ID) => ID;
  /**
   * Begin running a routine (segments become the live run). A no-op if an
   * ordinary block is running, or if a DIFFERENT routine is already active —
   * callers must resolve (resume/finish/discard) that one first, so its
   * in-flight elapsed time is never silently overwritten or double-counted.
   */
  startRoutineRun: (routineId: ID, shortOnTime: boolean, authoredSegments: RoutineSegment[]) => void;
  pauseRoutineRun: () => void;
  resumeRoutineRun: () => void;
  /** Mark the current segment skipped; finishes the run if that was the last one. */
  skipRoutineRun: () => void;
  /** Turn the active run into real practice blocks — at most one per distinct bound item, carrying its actual elapsed running time — then clear it. */
  finishRoutine: () => void;
  /** Persist how many segment boundaries have been announced (practiceSignal.ts) — store state, not component state, so navigating away and back never re-announces. */
  setRoutineSignal: (marker: number) => void;

  // Data management
  exportDB: () => PracticeDB;
  importDB: (raw: unknown) => void;
  resetDemo: () => void;
  clearAll: () => void;
}

function touch<T extends { updatedAt: string }>(entity: T, now: Date): T {
  return { ...entity, updatedAt: nowISO(now) };
}

export const useStore = create<StoreState>()(
  persist(
    withRevision((set, get) => ({
      db: emptyDB(),
      rev: 0,
      active: null,
      theme: 'system',
      hydrated: false,
      sessionInstrumentId: null,
      notNow: { date: '', ids: [] },
      activePlan: null,
      planMinutesByInstrument: {},
      activeRoutine: null,

      setTheme: (theme) => set({ theme }),

      updateSchedulingParams: (patch) =>
        set((s) => ({
          db: {
            ...s.db,
            // null ⇒ reset (drop the field so it falls back to defaults).
            settings: patch === null ? undefined : clampSchedulingParams({ ...s.db.settings, ...patch }),
          },
        })),

      setPlanMinutes: (instrumentId, minutes) =>
        set((s) => ({
          planMinutesByInstrument: { ...s.planMinutesByInstrument, [instrumentId]: Math.max(5, Math.round(minutes)) },
        })),

      startPlan: (plan) =>
        set({
          activePlan: {
            instrumentId: plan.instrumentId,
            budgetMinutes: plan.budgetMinutes,
            startedAt: nowISO(),
            pointer: 0,
            segments: plan.segments.map((seg) => ({ ...seg, status: 'pending' as const })),
          },
        }),

      beginPlanSegment: () => {
        const { activePlan, db, active, activeRoutine } = get();
        if (!activePlan) return;
        const seg = activePlan.segments[activePlan.pointer];
        // Revalidated LIVE against the same pure check a test can reach, never
        // trusted from the plan: an item can be deleted or moved to another
        // instrument between building the plan and reaching this segment.
        const check = planSegmentStartable(activePlan, db.items, !!active || !!activeRoutine);
        if (!check.ok) {
          // A deleted or moved item is visibly skipped (and skipping logs
          // nothing); a busy clock is refused outright rather than replaced.
          if (check.reason === 'deleted' || check.reason === 'moved') get().skipPlanSegment();
          return;
        }
        const item = check.item;
        if (!seg) return;
        get().startSession({
          itemId: item.id,
          instrumentId: item.instrumentId,
          materialId: item.materialId,
          mode: seg.mode,
          focus: seg.focus,
          targetMinutes: seg.minutes,
        });
      },

      skipPlanSegment: () =>
        set((s) => (s.activePlan ? { activePlan: skipPlanSegmentRun(s.activePlan) } : {})),

      endPlan: () => set({ activePlan: null }),

      setSessionInstrument: (sessionInstrumentId) => set({ sessionInstrumentId }),

      addAttachmentMeta: (meta) => {
        set((s) => ({ db: { ...s.db, attachments: [...s.db.attachments, meta] } }));
      },
      removeAttachmentMeta: (id) => {
        set((s) => ({ db: { ...s.db, attachments: s.db.attachments.filter((a) => a.id !== id) } }));
      },

      addInstrument: (input) => {
        const now = new Date();
        const inst = createInstrument(input, now);
        set((s) => ({ db: { ...s.db, instruments: [...s.db.instruments, inst] } }));
        return inst.id;
      },

      updateInstrument: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            instruments: s.db.instruments.map((i) =>
              i.id === id ? touch({ ...i, ...patch }, now) : i,
            ),
          },
        }));
      },

      addLesson: (input) => {
        const now = new Date();
        const lesson = createLesson(input, now);
        set((s) => ({ db: { ...s.db, lessons: [...s.db.lessons, lesson] } }));
        return lesson.id;
      },

      updateLesson: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === id ? touch({ ...l, ...patch, notes: patch.notes ?? l.notes }, now) : l,
            ),
          },
        }));
      },

      deleteLesson: (id) => {
        const detachNow = new Date();
        // The lesson owns its attachments; linked items are never touched.
        // ownerId alone is not a lesson id — an item can share it — so only
        // an attachment whose ownerType is ALSO 'lesson' is this lesson's own.
        const owned = get().db.attachments.filter((a) => a.ownerType === 'lesson' && a.ownerId === id);
        for (const a of owned) void deleteBlob(a.id);
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.filter((l) => l.id !== id),
            attachments: s.db.attachments.filter((a) => !(a.ownerType === 'lesson' && a.ownerId === id)),
            // Entries that named it become visibly unassigned and REMEMBER
            // which class they were for. Nothing is deleted and nothing is
            // silently reassigned to another class.
            lessonAgenda: detachAgendaLesson(s.db.lessonAgenda, id, detachNow),
          },
        }));
      },

      linkItemToLesson: (lessonId, itemId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId && !(l.itemIds ?? []).includes(itemId)
                ? touch({ ...l, itemIds: [...(l.itemIds ?? []), itemId] }, now)
                : l,
            ),
          },
        }));
      },

      addLessonRecording: (lessonId, input) => {
        const now = new Date();
        const rec: LessonRecording = {
          id: newId(),
          title: input.title.trim() || 'Class recording',
          path: input.path.trim(),
          kind: input.kind ?? 'video',
          date: input.date,
          sizeBytes: input.sizeBytes,
          durationLabel: input.durationLabel,
          notes: input.notes?.trim() || undefined,
          createdAt: nowISO(now),
        };
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId ? touch({ ...l, recordings: [...(l.recordings ?? []), rec] }, now) : l,
            ),
          },
        }));
        return rec.id;
      },

      // Removes only the REFERENCE. The NAS file is never touched.
      removeLessonRecording: (lessonId, recordingId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId
                ? touch({ ...l, recordings: (l.recordings ?? []).filter((r) => r.id !== recordingId) }, now)
                : l,
            ),
          },
        }));
      },

      // Additively import the user's Setar class history as lessons with NAS
      // references (class video + score PDFs/docs). New dates become new
      // lessons; dates that already have a lesson get any MISSING references
      // backfilled (path-deduped) — so a re-run after PDFs were added fills
      // them in without ever duplicating. Idempotent. Returns lessons added.
      importSetarClasses: (instrumentId) => {
        const now = new Date();
        const ownLessons = get().db.lessons.filter((l) => l.instrumentId === instrumentId);
        const existingDates = new Set(ownLessons.map((l) => l.date));
        const added = buildSetarClassLessons(instrumentId, existingDates, now);

        // Backfill references AND missing lesson numbers onto lessons that
        // already exist for a session date. A number is only ever filled in
        // when absent — a user-edited number is never overwritten.
        const byDate = new Map(ownLessons.map((l) => [l.date, l]));
        const backfill = new Map<string, LessonRecording[]>();
        const numberBackfill = new Map<string, number>();
        for (const session of SETAR_CLASS_SESSIONS) {
          const lesson = byDate.get(session.date);
          if (!lesson) continue;
          const havePaths = new Set((lesson.recordings ?? []).map((r) => r.path));
          const missing = missingSessionReferences(session, havePaths, now);
          if (missing.length > 0) backfill.set(lesson.id, missing);
          if (lesson.number === undefined) numberBackfill.set(lesson.id, session.n);
        }

        if (added.length === 0 && backfill.size === 0 && numberBackfill.size === 0) return 0;
        set((s) => ({
          db: {
            ...s.db,
            lessons: [
              ...s.db.lessons.map((l) =>
                backfill.has(l.id) || numberBackfill.has(l.id)
                  ? touch(
                      {
                        ...l,
                        recordings: backfill.has(l.id) ? [...(l.recordings ?? []), ...backfill.get(l.id)!] : l.recordings,
                        number: numberBackfill.get(l.id) ?? l.number,
                      },
                      now,
                    )
                  : l,
              ),
              ...added,
            ],
          },
        }));
        return added.length;
      },

      unlinkItemFromLesson: (lessonId, itemId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.map((l) =>
              l.id === lessonId
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== itemId) }, now)
                : l,
            ),
          },
        }));
      },

      addMaterial: (input) => {
        const now = new Date();
        const mat = createMaterial(input, now);
        set((s) => ({ db: { ...s.db, materials: [...s.db.materials, mat] } }));
        return mat.id;
      },

      updateMaterial: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            materials: s.db.materials.map((m) =>
              m.id === id ? touch({ ...m, ...patch }, now) : m,
            ),
          },
        }));
      },

      deleteMaterial: (id) => {
        set((s) => ({
          db: {
            ...s.db,
            materials: s.db.materials.filter((m) => m.id !== id),
            // Detach items from the removed material rather than deleting them.
            items: s.db.items.map((i) =>
              i.materialId === id ? { ...i, materialId: undefined } : i,
            ),
          },
        }));
      },

      addItem: (input) => {
        const now = new Date();
        const item = createItem(input, now);
        set((s) => ({ db: { ...s.db, items: [...s.db.items, item] } }));
        return item.id;
      },

      updateItem: (id, patch) => {
        const now = new Date();
        // Route the review date through the shared resolver (§1.5): absent
        // leaves the schedule untouched, so a blind spread of `patch` can
        // never silently wipe it; an ISODate moves the open review row with
        // it; null clears both sides honestly.
        const { nextReviewDate, ...rest } = patch;
        const write = resolveReviewDate(nextReviewDate);
        const current = get().db.items.find((i) => i.id === id);
        const newInstrumentId =
          rest.instrumentId !== undefined && current && rest.instrumentId !== current.instrumentId
            ? rest.instrumentId
            : undefined;
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => {
              if (i.id !== id) return i;
              const next = { ...i, ...rest };
              if (write) {
                next.nextReviewDate = write.nextReviewDate;
                // A date arriving through an explicit item patch is the
                // OWNER'S, never the engine's — stamp the provenance here so
                // this cannot become a fourth path that writes a date without
                // one (closeSession, snoozeReview and scheduleReviewAgain all
                // stamp their own). Without it an owner-edited date on an
                // auto-source item would stay 'auto' and lose the protection
                // A4/A5 promise it. Clearing the date clears the provenance.
                next.nextReviewSource = write.nextReviewDate ? 'user' : undefined;
              }
              return touch(next, now);
            }),
            reviews:
              applyReviewDateToRows({ reviews: s.db.reviews, practiceItemId: id, instruction: nextReviewDate, now }) ??
              s.db.reviews,
            // An item that changes instrument no longer belongs in a routine
            // scoped to the old one — unbind it there; matching routines keep it.
            pathwayRoutines: newInstrumentId
              ? unbindItemWhereInstrumentMismatch(s.db.pathwayRoutines, id, newInstrumentId, now)
              : s.db.pathwayRoutines,
            // Its commitments and questions follow it; a class target that no
            // longer matches is cleared rather than pointing at another
            // instrument's lesson.
            lessonAgenda: newInstrumentId
              ? retargetEntriesForItemInstrument(s.db.lessonAgenda, id, newInstrumentId, s.db.lessons, now)
              : s.db.lessonAgenda,
          },
        }));
      },

      setItemStatus: (id, status) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === id ? touch({ ...i, status }, now) : i)),
          },
        }));
      },

      deleteItem: (id) => {
        // ownerId alone is not an item id — a lesson can share it — so only
        // an attachment owned by THIS item (ownerType 'item' too) is deleted.
        const owned = itemOwnedAttachments(get().db.attachments, id);
        for (const a of owned) void deleteBlob(a.id);
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items
              .filter((i) => i.id !== id)
              // Parts of a deleted piece stay, but ungrouped.
              .map((i) => (i.parentItemId === id ? touch({ ...i, parentItemId: undefined }, now) : i)),
            blocks: s.db.blocks.filter((b) => b.practiceItemId !== id),
            reviews: s.db.reviews.filter((r) => r.practiceItemId !== id),
            attachments: s.db.attachments.filter((a) => !(a.ownerType === 'item' && a.ownerId === id)),
            lessons: s.db.lessons.map((l) =>
              (l.itemIds ?? []).includes(id)
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== id) }, now)
                : l,
            ),
            // The segment survives as an unbound countdown — never removed.
            pathwayRoutines: unbindItemFromRoutines(s.db.pathwayRoutines, id, now),
            // Commitments to prepare a deleted item go with it; QUESTIONS
            // survive, detached, because a question and its answer are the
            // owner's record of a class, not a property of the item.
            lessonAgenda: detachAgendaItem(s.db.lessonAgenda, id, now),
          },
          active: s.active?.itemId === id ? null : s.active,
        }));
      },

      removeCatalogItem: (id) => {
        const s = get();
        const item = s.db.items.find((i) => i.id === id);
        if (!item) return false;
        const itemBlocks = s.db.blocks.filter((b) => b.practiceItemId === id);
        // Only proceed when the deletion is provably lossless — a fresh,
        // never-practised catalog item reverting to a suggestion.
        if (!isLosslesslyRemovable(item, itemBlocks)) return false;
        get().deleteItem(id);
        return true;
      },

      placeItemInStage: (itemId, stageId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) => (i.id === itemId ? touch({ ...i, stageId }, now) : i)),
          },
        }));
      },

      addLessonPreparation: (itemId, lessonId) => {
        const now = new Date();
        const { db } = get();
        const item = db.items.find((i) => i.id === itemId);
        if (!item) return null;
        // A class on another instrument is never a valid target — refuse
        // rather than silently rewriting either side.
        if (lessonId) {
          const lesson = db.lessons.find((l) => l.id === lessonId);
          if (!lesson || lesson.instrumentId !== item.instrumentId) return null;
        }
        // One commitment per item per class: committing twice is the same
        // commitment, not two.
        const existing = db.lessonAgenda.find(
          (e) => e.kind === 'preparation' && e.itemId === itemId && e.lessonId === lessonId,
        );
        if (existing) return existing.id;
        const entry = createPreparation({
          id: newId(),
          itemId,
          instrumentId: item.instrumentId,
          lessonId,
          now,
        });
        set((st) => ({ db: { ...st.db, lessonAgenda: [...st.db.lessonAgenda, entry] } }));
        return entry.id;
      },

      addLessonQuestion: (input) => {
        const now = new Date();
        const text = input.text.trim();
        if (!text) return null;
        const { db } = get();
        if (input.itemId) {
          const item = db.items.find((i) => i.id === input.itemId);
          if (!item || item.instrumentId !== input.instrumentId) return null;
        }
        if (input.lessonId) {
          const lesson = db.lessons.find((l) => l.id === input.lessonId);
          if (!lesson || lesson.instrumentId !== input.instrumentId) return null;
        }
        const entry = createQuestion({ id: newId(), ...input, text, now });
        set((st) => ({ db: { ...st.db, lessonAgenda: [...st.db.lessonAgenda, entry] } }));
        return entry.id;
      },

      updateLessonQuestion: (id, text) => {
        const now = new Date();
        const trimmed = text.trim();
        if (!trimmed) return;
        set((s) => ({
          db: {
            ...s.db,
            lessonAgenda: s.db.lessonAgenda.map((e) =>
              e.id === id && e.kind === 'question' ? touch({ ...e, text: trimmed }, now) : e,
            ),
          },
        }));
      },

      setAgendaTarget: (id, lessonId) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, lessonAgenda: retargetAgendaEntry(s.db.lessonAgenda, id, lessonId, s.db.lessons, now) },
        }));
      },

      markQuestionAsked: (id, answer) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: markAgendaQuestionAsked(s.db.lessonAgenda, id, now, answer) } }));
      },

      reopenQuestion: (id) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: reopenAgendaQuestion(s.db.lessonAgenda, id, now) } }));
      },

      setQuestionAnswer: (id, answer) => {
        const now = new Date();
        set((s) => ({ db: { ...s.db, lessonAgenda: setAgendaQuestionAnswer(s.db.lessonAgenda, id, answer, now) } }));
      },

      removeAgendaEntry: (id) => {
        set((s) => ({ db: { ...s.db, lessonAgenda: s.db.lessonAgenda.filter((e) => e.id !== id) } }));
      },

      addFromCatalog: (stageId, entryKey) => {
        const { db } = get();
        // Reuse an existing item already created from this catalog entry.
        const existing = db.items.find((i) => i.stageId === stageId && i.catalogKey === entryKey);
        if (existing) return existing.id;

        const entry = catalogForStage(stageId).find((e) => e.key === entryKey);
        const stage = db.pathwayStages.find((s) => s.id === stageId);
        const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
        const instrumentId =
          (pathway?.instrumentId && db.instruments.find((i) => i.id === pathway.instrumentId)?.id) ||
          db.instruments.find((i) => i.active)?.id ||
          db.instruments[0]?.id ||
          '';
        const now = new Date();
        const item = entry
          ? itemFromCatalogEntry(entry, instrumentId, now)
          : createItem({ instrumentId, title: 'New item', stageId }, now);
        set((s) => ({ db: { ...s.db, items: [...s.db.items, item] } }));
        return item.id;
      },

      startItemSession: (itemId) => {
        const { db } = get();
        const item = db.items.find((i) => i.id === itemId);
        if (!item) return;
        get().startSession({
          itemId: item.id,
          instrumentId: item.instrumentId,
          materialId: item.materialId,
          mode: defaultModeForStatus(item.status),
          focus: focusForItem(item),
          targetMinutes: DEFAULT_DURATION_MINUTES,
        });
      },

      startSession: (input) => {
        const { active, activeRoutine } = get();
        // Never silently overwrite an existing session's elapsed time, and
        // never let an ordinary block run alongside a routine — every start
        // path (direct item starts, Session Plan segments) routes through
        // here, so this one guard is what keeps only one practice clock
        // ticking at a time. The caller must resolve the existing one first
        // (finish/discard/resume it) — same rule startRoutineRun applies in
        // the other direction.
        if (active || activeRoutine) return;
        const now = new Date();
        set({
          active: {
            ...input,
            startedAt: nowISO(now),
            accumulatedSeconds: 0,
            running: true,
            segmentStartedAt: nowISO(now),
          },
        });
      },

      pauseSession: () => {
        const { active } = get();
        if (!active || !active.running) return;
        set({
          active: {
            ...active,
            accumulatedSeconds: sessionElapsedSeconds(active),
            running: false,
            segmentStartedAt: undefined,
          },
        });
      },

      resumeSession: () => {
        const { active, activeRoutine } = get();
        if (!active || active.running) return;
        // A routine clock is also live (only reachable from persisted state
        // predating this guard) — resuming would tick two clocks at once,
        // same as a fresh start. Resolve it first (finish/discard it).
        if (activeRoutine) return;
        set({ active: { ...active, running: true, segmentStartedAt: nowISO() } });
      },

      setSessionNote: (note) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, note } });
      },

      setSessionSignal: (marker) => {
        const { active } = get();
        if (!active) return;
        set({ active: { ...active, signalledThrough: marker } });
      },

      cancelSession: () => set({ active: null }),

      closeSession: (input) => {
        const now = input.now ?? new Date();
        const { active, db, activePlan } = get();
        if (!active) return;
        const item = db.items.find((i) => i.id === active.itemId);
        if (!item) {
          set({ active: null });
          return;
        }

        const block = createBlock(
          {
            practiceItemId: item.id,
            instrumentId: active.instrumentId,
            materialId: active.materialId,
            startedAt: active.startedAt,
            endedAt: nowISO(now),
            durationMinutes: input.durationMinutes,
            mode: active.mode,
            focus: active.focus,
            constraint: active.constraint,
            result: input.result,
            observation: input.observation,
            nextAction: input.nextAction,
            bodyNote: input.bodyNote,
            createdReview: input.answer === 'scheduled',
          },
          now,
        );

        // The one decision behind closing a block: does the item get a next
        // review at all, and — if so — the single date written to both the
        // item and its new Review row (§1.1–§1.3).
        const outcome = computeReviewOutcome({
          item,
          result: input.result,
          answer: input.answer,
          nextReviewDate: input.nextReviewDate,
          reviewType: input.reviewType,
          now,
          params: clampSchedulingParams(db.settings),
        });

        const existing = db.blocks.filter((b) => b.practiceItemId === item.id);
        let updatedItem = applyBlockStats(item, block, {
          itemBlocksIncludingNew: [...existing, block],
          now,
          newStatus: input.newStatus,
          nextReviewDate: outcome.nextReviewDate,
        });
        if (outcome.sr) {
          updatedItem = {
            ...updatedItem,
            srReps: outcome.sr.srReps,
            srEase: outcome.sr.srEase,
            srIntervalDays: outcome.sr.srIntervalDays,
            // The one-advance-per-day marker only moves when the decision
            // actually advanced spacing; every other close leaves it alone.
            ...(outcome.sr.srLastProgressDay ? { srLastProgressDay: outcome.sr.srLastProgressDay } : {}),
          };
        }
        // Provenance travels with the date, from the same decision: an
        // engine-proposed date is the engine's to move again, a typed one is
        // the owner's and is protected until it comes due.
        if (outcome.nextReviewSource !== undefined) {
          updatedItem = {
            ...updatedItem,
            nextReviewSource: outcome.nextReviewSource ?? undefined,
          };
        }

        // A question raised here becomes its own agenda entry. It never
        // overwrites another question and never commits the item to a class.
        const questionText = input.newQuestion?.text.trim();
        // The same target validation the guarded action applies: a class on
        // another instrument is never a valid target, so the question is saved
        // honestly unassigned rather than pointed at somebody else's lesson.
        const questionLessonId = input.newQuestion?.lessonId;
        const questionLesson = questionLessonId ? db.lessons.find((l) => l.id === questionLessonId) : undefined;
        const newQuestion = questionText
          ? createQuestion({
              id: newId(),
              text: questionText,
              instrumentId: item.instrumentId,
              itemId: item.id,
              lessonId: questionLesson?.instrumentId === item.instrumentId ? questionLesson.id : undefined,
              now,
            })
          : undefined;

        // Complete this item's open reviews only when the SAME decision that
        // set the date says so, and schedule the next from that one date
        // (§1.2). Deciding it separately and unconditionally here is exactly
        // how the row and the date used to come apart.
        const reviews = completeOpenReviewsFor({
          reviews: db.reviews,
          practiceItemId: item.id,
          complete: outcome.completeOpenReviews,
          result: input.result,
          now,
        });
        if (outcome.review) {
          reviews.push(
            createReview(
              {
                practiceItemId: item.id,
                dueDate: outcome.review.dueDate,
                reviewType: outcome.review.reviewType,
              },
              now,
            ),
          );
        }

        // If a Session Plan is running and this block closed its current
        // segment's item, mark that segment done and advance. The plain flow
        // (no active plan) is byte-identical to before.
        const nextPlan = activePlan ? completePlanSegment(activePlan, item.id) : activePlan;

        set({
          db: {
            ...db,
            blocks: [...db.blocks, block],
            items: db.items.map((i) => (i.id === item.id ? updatedItem : i)),
            reviews,
            lessonAgenda: newQuestion ? [...db.lessonAgenda, newQuestion] : db.lessonAgenda,
          },
          active: null,
          activePlan: nextPlan,
        });
      },

      completeReview: (id, result) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            reviews: s.db.reviews.map((r) =>
              r.id === id ? { ...r, completedAt: nowISO(now), result, updatedAt: nowISO(now) } : r,
            ),
          },
        }));
      },

      notNowReview: (id) => {
        const today = todayISODate();
        set((s) => {
          const sameDay = s.notNow.date === today;
          return {
            notNow: { date: today, ids: sameDay ? [...new Set([...s.notNow.ids, id])] : [id] },
          };
        });
      },

      snoozeReview: (id, days = SNOOZE_DAYS_DEFAULT) => {
        const now = new Date();
        const { dueDate } = snoozePlan(days, now);
        // The existing correct model: one date, resolved once. The write is
        // scoped to the SELECTED row only (applyReviewDateToRow) — snoozing
        // one due review must not silently move a sibling open review for
        // the same item, unlike closeSession/updateItem where the item's
        // whole schedule is what's being decided.
        const write = resolveReviewDate(dueDate)!;
        set((s) => {
          const review = s.db.reviews.find((r) => r.id === id);
          if (!review) return s;
          return {
            db: {
              ...s.db,
              reviews:
                applyReviewDateToRow({ reviews: s.db.reviews, reviewId: id, instruction: dueDate, now }) ??
                s.db.reviews,
              // Keep the item's own schedule in step so nothing shows overdue.
              // A snooze is the owner's own choice of date, so it is stamped
              // as theirs: extra practice before it must not quietly undo it.
              items: s.db.items.map((i) =>
                i.id === review.practiceItemId
                  ? touch({ ...i, nextReviewDate: write.nextReviewDate, nextReviewSource: 'user' as const }, now)
                  : i,
              ),
            },
          };
        });
      },

      // --- Pathways --------------------------------------------------------

      scheduleReviewAgain: (itemId, dueDate, reviewType) => {
        const now = new Date();
        set((s) => {
          const item = s.db.items.find((i) => i.id === itemId);
          if (!item) return s;
          const plan = scheduleAgainPlan({ item, reviews: s.db.reviews, dueDate, reviewType, now });
          const reviews = plan.createRow
            ? [
                ...plan.reviews,
                createReview({ practiceItemId: itemId, dueDate: plan.dueDate, reviewType: plan.reviewType }, now),
              ]
            : plan.reviews;
          return {
            db: {
              ...s.db,
              // The owner chose this date, so the engine treats it as
              // authoritative until it comes due. No block, no result, no
              // statistics and no SM-2 movement: this is administration.
              items: s.db.items.map((i) =>
                i.id === itemId
                  ? touch({ ...i, nextReviewDate: plan.dueDate, nextReviewSource: 'user' as const }, now)
                  : i,
              ),
              reviews,
            },
          };
        });
      },

      addPathway: (input) => {
        const now = new Date();
        const ts = nowISO(now);
        const pathway: Pathway = {
          id: newId(),
          instrumentId: input.instrumentId,
          name: input.name.trim(),
          source: input.source?.trim() || undefined,
          description: input.description?.trim() || undefined,
          note: input.note?.trim() || undefined,
          order: get().db.pathways.length,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ db: { ...s.db, pathways: [...s.db.pathways, pathway] } }));
        return pathway.id;
      },

      updatePathway: (id, patch) => {
        const now = new Date();
        const current = get().db.pathways.find((p) => p.id === id);
        const instrumentChanged = 'instrumentId' in patch && current && patch.instrumentId !== current.instrumentId;
        set((s) => ({
          db: {
            ...s.db,
            pathways: s.db.pathways.map((p) => (p.id === id ? touch({ ...p, ...patch }, now) : p)),
            // Neither side is silently rewritten to agree — an incompatible
            // placed routine is detached instead.
            pathwayRoutines: instrumentChanged
              ? detachIncompatibleRoutinesForPathway(s.db.pathwayRoutines, id, patch.instrumentId, now)
              : s.db.pathwayRoutines,
          },
        }));
      },

      deletePathway: (id) => {
        const now = new Date();
        set((s) => {
          const stageIds = new Set(s.db.pathwayStages.filter((st) => st.pathwayId === id).map((st) => st.id));
          return {
            db: {
              ...s.db,
              pathways: s.db.pathways.filter((p) => p.id !== id),
              pathwayStages: s.db.pathwayStages.filter((st) => st.pathwayId !== id),
              // A user's routine is detached, never deleted — same rule as items.
              pathwayRoutines: detachRoutinesFromPathway(s.db.pathwayRoutines, id, now),
              // Items are kept — they simply leave their stages.
              items: s.db.items.map((i) =>
                i.stageId && stageIds.has(i.stageId) ? touch({ ...i, stageId: undefined }, now) : i,
              ),
            },
          };
        });
      },

      reseedDefaultPathways: () => {
        const now = new Date();
        const { db } = get();
        const ids = {
          guitar: db.instruments.find((i) => /guitar/i.test(i.name))?.id ?? '',
          setar: db.instruments.find((i) => /setar/i.test(i.name) || i.name.includes('سه'))?.id ?? '',
          tar:
            db.instruments.find((i) => (/^tar$/i.test(i.name.trim()) || i.name.includes('تار')) && !/setar/i.test(i.name))?.id ?? '',
        };
        const seeded = seedPathways(ids, now);
        const have = new Set(db.pathways.map((p) => p.id));
        const newP = seeded.pathways.filter((p) => !have.has(p.id));
        const newIds = new Set(newP.map((p) => p.id));
        set((s) => ({
          db: {
            ...s.db,
            pathways: [...s.db.pathways, ...newP],
            pathwayStages: [...s.db.pathwayStages, ...seeded.pathwayStages.filter((x) => newIds.has(x.pathwayId))],
            pathwayRoutines: [...s.db.pathwayRoutines, ...seeded.pathwayRoutines.filter((x) => !!x.pathwayId && newIds.has(x.pathwayId))],
          },
        }));
      },

      addStage: (pathwayId, input) => {
        const now = new Date();
        const ts = nowISO(now);
        const order = get().db.pathwayStages.filter((s) => s.pathwayId === pathwayId).length;
        const stage: PathwayStage = {
          id: newId(),
          pathwayId,
          code: input.code.trim() || 'New',
          title: input.title.trim(),
          group: input.group?.trim() || undefined,
          intro: input.intro?.trim() || undefined,
          order,
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ db: { ...s.db, pathwayStages: [...s.db.pathwayStages, stage] } }));
        return stage.id;
      },

      updateStage: (id, patch) => {
        const now = new Date();
        set((s) => ({
          db: { ...s.db, pathwayStages: s.db.pathwayStages.map((st) => (st.id === id ? touch({ ...st, ...patch }, now) : st)) },
        }));
      },

      deleteStage: (id) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.filter((st) => st.id !== id),
            // Stage deletion is not pathway deletion — the routine keeps its
            // pathwayId and only stageId is cleared.
            pathwayRoutines: detachRoutinesFromStage(s.db.pathwayRoutines, id, now),
            // Items stay — they just leave the stage.
            items: s.db.items.map((i) => (i.stageId === id ? touch({ ...i, stageId: undefined }, now) : i)),
            // Un-pin any pathway pointing at the removed stage.
            pathways: s.db.pathways.map((p) =>
              p.currentStageId === id ? touch({ ...p, currentStageId: undefined }, now) : p,
            ),
          },
        }));
      },

      renameSection: (pathwayId, oldGroup, newGroup) => {
        const now = new Date();
        const next = newGroup.trim() || undefined;
        set((s) => ({
          db: {
            ...s.db,
            pathwayStages: s.db.pathwayStages.map((st) =>
              st.pathwayId === pathwayId && (st.group ?? undefined) === (oldGroup ?? undefined)
                ? touch({ ...st, group: next }, now)
                : st,
            ),
          },
        }));
      },

      moveStage: (id, dir) => {
        set((s) => {
          const stage = s.db.pathwayStages.find((x) => x.id === id);
          if (!stage) return s;
          const sibs = s.db.pathwayStages
            .filter((x) => x.pathwayId === stage.pathwayId)
            .sort((a, b) => a.order - b.order);
          const idx = sibs.findIndex((x) => x.id === id);
          const swap = sibs[idx + dir];
          if (!swap) return s;
          const now = new Date();
          return {
            db: {
              ...s.db,
              pathwayStages: s.db.pathwayStages.map((x) =>
                x.id === stage.id ? touch({ ...x, order: swap.order }, now) : x.id === swap.id ? touch({ ...x, order: stage.order }, now) : x,
              ),
            },
          };
        });
      },

      // --- Routines ----------------------------------------------------------

      addRoutine: (input) => {
        const now = new Date();
        const ts = nowISO(now);
        const draft: PathwayRoutine = {
          id: newId(),
          instrumentId: input.instrumentId,
          pathwayId: input.pathwayId,
          stageId: input.stageId,
          name: input.name.trim() || 'New routine',
          segments: input.segments ?? [],
          order: get().db.pathwayRoutines.length,
          createdAt: ts,
          updatedAt: ts,
        };
        // Never trust the caller's bindings/placement on faith — the same
        // invariant enforcement updateRoutine applies on every save.
        const { db } = get();
        const pathway = draft.pathwayId ? db.pathways.find((p) => p.id === draft.pathwayId) : undefined;
        const stage = draft.stageId ? db.pathwayStages.find((st) => st.id === draft.stageId) : undefined;
        const routine = retargetRoutineInstrument(draft, draft.instrumentId, db.items, pathway, stage, now);
        set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, routine] } }));
        return routine.id;
      },

      updateRoutine: (id, patch) => {
        const now = new Date();
        const { db } = get();
        const current = db.pathwayRoutines.find((r) => r.id === id);
        if (!current) return;
        set((s) => ({
          db: {
            ...s.db,
            pathwayRoutines: s.db.pathwayRoutines.map((r) => {
              if (r.id !== id) return r;
              const merged: PathwayRoutine = {
                ...r,
                name: patch.name.trim() || r.name,
                segments: patch.segments,
                instrumentId: patch.instrumentId,
                pathwayId: patch.pathwayId,
                stageId: patch.stageId,
              };
              // Always re-enforce the binding + placement invariants against
              // the instrument actually being saved — whether or not it
              // changed — rather than trusting whatever the form happened to
              // submit.
              const pathway = merged.pathwayId ? s.db.pathways.find((p) => p.id === merged.pathwayId) : undefined;
              const stage = merged.stageId ? s.db.pathwayStages.find((st) => st.id === merged.stageId) : undefined;
              return retargetRoutineInstrument(merged, merged.instrumentId, s.db.items, pathway, stage, now);
            }),
          },
        }));
      },

      deleteRoutine: (id) => {
        // Deleting the routine currently running must not strand
        // `activeRoutine` pointing at a now-dead id (every other routine's
        // Start would then redirect to a "Routine not found" dead end with
        // no way back). Finish it first — honestly saving whatever bound-item
        // time has genuinely elapsed, same as any other early finish — rather
        // than silently discarding it.
        if (get().activeRoutine?.routineId === id) get().finishRoutine();
        set((s) => ({ db: { ...s.db, pathwayRoutines: s.db.pathwayRoutines.filter((r) => r.id !== id) } }));
      },

      duplicateRoutine: (id) => {
        const now = new Date();
        const { db } = get();
        const routine = db.pathwayRoutines.find((r) => r.id === id);
        if (!routine) return '';
        const copy = duplicateRoutineData(routine, db.pathwayRoutines.length, now);
        set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, copy] } }));
        return copy.id;
      },

      startRoutineRun: (routineId, shortOnTime, authoredSegments) => {
        const { activeRoutine, active } = get();
        // Same guard as startSession, in the other direction: an ordinary
        // block already running must be resolved before a routine can start.
        if (active) return;
        if (activeRoutine && activeRoutine.routineId !== routineId) return;
        set({
          activeRoutine: {
            routineId,
            shortOnTime,
            authoredSegments,
            segs: toRunSegments(authoredSegments),
            accumulatedSeconds: 0,
            running: true,
            runningSince: nowISO(),
          },
        });
      },

      pauseRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine?.running) return;
        set({
          activeRoutine: {
            ...activeRoutine,
            accumulatedSeconds: runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, true, new Date()),
            running: false,
            runningSince: undefined,
          },
        });
      },

      resumeRoutineRun: () => {
        const { activeRoutine, active } = get();
        if (!activeRoutine || activeRoutine.running) return;
        // Same guard as resumeSession, in the other direction.
        if (active) return;
        set({ activeRoutine: { ...activeRoutine, running: true, runningSince: nowISO() } });
      },

      // Mutates segs only — never decides the run is over. Whether a skip
      // lands on the final segment (locateClock's `finished` flips true) is
      // detected uniformly by RoutineRunner's one completion effect, the same
      // place natural (tick/background-catch-up) completion is detected. A
      // second "did this finish it" branch here previously called
      // finishRoutine() directly, bypassing the component's result snapshot
      // and leaving the screen blank once activeRoutine was cleared out from
      // under it.
      skipRoutineRun: () => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, new Date());
        const segs = skipCurrentSegment(activeRoutine.segs, elapsedSeconds);
        // Skip clamps the boundary onto elapsed itself — acknowledge it silently
        // (never nextSignal's announcing path), or the very next render would
        // see a freshly-passed boundary and announce a segment the user just
        // chose to end themselves.
        const signalledThrough = acknowledgeThrough(activeRoutine.signalledThrough, elapsedSeconds, segmentBoundaries(segs));
        set({ activeRoutine: { ...activeRoutine, segs, signalledThrough } });
      },

      setRoutineSignal: (marker) => {
        const { activeRoutine } = get();
        if (!activeRoutine) return;
        set({ activeRoutine: { ...activeRoutine, signalledThrough: marker } });
      },

      finishRoutine: () => {
        const { activeRoutine, db } = get();
        if (!activeRoutine) return;
        const now = new Date();
        const elapsedSeconds = runElapsedSeconds(activeRoutine.accumulatedSeconds, activeRoutine.runningSince, activeRoutine.running, now);
        const outcome = applyRoutineRun(activeRoutine.segs, elapsedSeconds, db.items, groupBlocksByItem(db.blocks), now);
        const updatedById = new Map(outcome.items.map((i) => [i.id, i]));
        set((s) => ({
          activeRoutine: null,
          db: {
            ...s.db,
            blocks: outcome.blocks.length > 0 ? [...s.db.blocks, ...outcome.blocks] : s.db.blocks,
            items: s.db.items.map((i) => updatedById.get(i.id) ?? i),
          },
        }));
      },

      exportDB: () => get().db,

      // The three — and only three — places a new `db` object is installed.
      // Each is a single `set()` of `installDatabase`, which returns the new
      // database TOGETHER WITH the ephemeral reset: no path can install a
      // database while leaving the running plan, today's dismissed reviews or
      // a now-dangling session instrument pointing at the one it replaced.
      // (resetDemo and clearAll never pass through importFullBackup, so a fix
      // that lived only there would silently miss two of the three.)
      importDB: (raw) => {
        set((s) => installDatabase({ db: validateDB(raw), sessionInstrumentId: s.sessionInstrumentId }));
      },

      resetDemo: () => {
        void clearBlobs();
        set((s) => installDatabase({ db: createSeedDB(), sessionInstrumentId: s.sessionInstrumentId }));
      },

      clearAll: () => {
        void clearBlobs();
        set((s) => installDatabase({ db: emptyDB(), sessionInstrumentId: s.sessionInstrumentId }));
      },
    })),
    {
      name: 'practice-compass',
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({
        db: s.db,
        rev: s.rev,
        active: s.active,
        theme: s.theme,
        sessionInstrumentId: s.sessionInstrumentId,
        notNow: s.notNow,
        activePlan: s.activePlan,
        planMinutesByInstrument: s.planMinutesByInstrument,
        activeRoutine: s.activeRoutine,
      }),
      migrate: (persisted, version) => {
        const state = persisted as { db?: PracticeDB } | undefined;
        if (state?.db) state.db = migrateToCurrent(state.db, version);
        return state as unknown;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<StoreState>;
        // Zustand only calls `migrate` above when the persisted version
        // differs from the current one — a persisted database that ALREADY
        // claims the current schema never reaches it, even when it carries a
        // stray `assignedForLesson`/`teacherQuestion` an interrupted write
        // left behind, with `lessonAgenda` never actually completed to
        // represent it. `merge` is the one place ALL persisted state
        // re-enters live state regardless of whether `migrate` ran (the same
        // reasoning the active/activeRoutine freeze below relies on), so it
        // is where this closes for good: run the SAME idempotent, lossless
        // conversion `migrate` would have, unconditionally. Calling it again
        // on state `migrate` already processed is safe — `migrateToV12`'s own
        // docstring guarantees it is a no-op wherever no legacy field
        // survives — and calling it with `SCHEMA_VERSION` as the "from"
        // version is correct here because every OTHER step in the chain is
        // gated on a version strictly below what a current database could
        // ever claim; only the unconditional tail step ever runs.
        const db = p.db ? migrateToCurrent(p.db, SCHEMA_VERSION) : current.db;
        const merged = { ...current, ...p, db };
        // The start/resume guards keep active/activeRoutine from BOTH being
        // set going forward, but a device that persisted a dual-running
        // state before those guards existed reaches this merge unchecked —
        // hydration is the one place ALL persisted state re-enters the
        // store, so it's the one place left to close. Passing both straight
        // through would let each keep ticking live from its own timestamp
        // and double-log the same wall-clock interval, exactly the bug the
        // guards exist to prevent. Freeze both (the same transform
        // pauseSession/pauseRoutineRun already do) rather than discarding
        // either: nothing already elapsed is lost, neither clock advances
        // further on its own, and the ordinary finish/discard flow is what
        // the user resolves one with before the guards allow resuming or
        // starting the other.
        if (merged.active && merged.activeRoutine) {
          const now = new Date();
          merged.active = {
            ...merged.active,
            accumulatedSeconds: sessionElapsedSeconds(merged.active, now),
            running: false,
            segmentStartedAt: undefined,
          };
          merged.activeRoutine = {
            ...merged.activeRoutine,
            accumulatedSeconds: runElapsedSeconds(
              merged.activeRoutine.accumulatedSeconds,
              merged.activeRoutine.runningSince,
              merged.activeRoutine.running,
              now,
            ),
            running: false,
            runningSince: undefined,
          };
        }
        return merged;
      },
    },
  ),
);

// Async IndexedDB hydration: flip the gate when done, and seed a fresh install.
function finishHydration() {
  if (storageWasEmpty && useStore.getState().db.pathways.length === 0) {
    useStore.setState({ db: createSeedDB(), hydrated: true });
  } else {
    useStore.setState({ hydrated: true });
  }
}
if (useStore.persist.hasHydrated()) finishHydration();
else useStore.persist.onFinishHydration(finishHydration);
```

### tests/daily-practice.browser.test.ts

```
import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { goTo, importBackup, importOutcome, openPracticeApp, reload } from './practiceBrowser';
import v12 from './fixtures/practice-decisions-v12.json?raw';

// ---------------------------------------------------------------------------
// ac-17 — the daily decision loop, in the real app.
//
// The pure engine is proven in `src/domain/scheduling.test.ts`. What only this
// can show is the SEAM: that the date the close screen SHOWS is the date the
// store WRITES, that the written date survives a reload, and that the same
// screen driven a second time on the same day does not quietly advance
// spacing again.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
/** A Setar item from the fixture, reached by its own detail screen. */
const ITEM = 'i-collision';

describe('the daily practice loop, end to end', () => {
  it('daily practice browser journey preserves the decision across close and rebuild', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      await importBackup(app, 'v12.json', v12);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);

      // --- 1. Five minutes, then thirty -----------------------------------
      await goTo(app, '/plan');
      await page.getByRole('button', { name: '5 min', exact: true }).click();
      await expect.poll(() => segmentCount(page)).toBe(1);
      expect(await totalMinutes(page)).toBe(5);
      // Under twelve minutes there is ONE useful main focus and no warm-up.
      expect(await page.locator('.list-row').filter({ hasText: 'Warm-up' }).count()).toBe(0);
      expect(await page.getByText(/min ·/).first().textContent()).toContain('5 min');

      // Changing the budget REBUILDS the preview. It used to key its re-seed
      // on a timestamp that never changed within a mount, so a longer session
      // showed the shorter session's plan.
      await page.getByRole('button', { name: '30 min', exact: true }).click();
      await expect.poll(() => totalMinutes(page)).toBe(30);
      expect(await segmentCount(page)).toBeGreaterThan(1);
      // A warm-up appears, and it is FIRST and familiar — not the demanding
      // new material, whatever it is labelled.
      expect(await page.locator('.list-row').filter({ hasText: 'Warm-up' }).count()).toBe(1);
      const firstRow = page.locator('.list-row').first();
      expect(await firstRow.textContent()).toContain('Warm-up');
      expect(await firstRow.textContent()).toContain('Warm up on something you already know');

      // --- 2. A real block from the plan, and progress that survives -------
      const planned = await segmentCount(page);
      await page.getByRole('button', { name: 'Start plan' }).click();
      await page.getByRole('button', { name: /^Start / }).first().click();
      await finishBlock(page);
      await page.getByRole('button', { name: 'Stable alone' }).click();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      await goTo(app, '/plan');
      // The plan is still running, one segment done, the rest still pending —
      // and it came back out of storage, not out of React state.
      await expect
        .poll(() => page.locator('main').innerText().then((t) => t.includes(`1 of ${planned} done`)))
        .toBe(true);
      await page.getByRole('button', { name: 'End the plan' }).click();

      // --- 3. THE DATE SHOWN IS THE DATE SAVED, after a reload -------------
      let savedDate = '';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable alone' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        savedDate = await page.getByLabel('Next review date').inputValue();
        expect(savedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(savedDate > isoOf(CLOCK)).toBe(true);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      // …and the item's PENDING ROW agrees: at that date the item appears
      // under Due reviews, which reads the ROW, not the item.
      const itemTitle = await itemTitleOf(page, app.origin, ITEM);
      await page.clock.setFixedTime(new Date(`${savedDate}T09:00:00`));
      await goTo(app, '/');
      await expect.poll(() => page.getByRole('heading', { name: 'Due reviews' }).isVisible()).toBe(true);
      await expect
        .poll(() => page.locator('main').innerText().then((t) => t.includes(itemTitle)))
        .toBe(true);
      await page.clock.setFixedTime(CLOCK);

      // --- 4. A SECOND successful close the same day does NOT advance again -
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Performable' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(savedDate);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      // --- 5. `same` keeps it too; only `worse` brings it forward ----------
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(savedDate);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(savedDate);

      let repairedDate = '';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Worse' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        repairedDate = await page.getByLabel('Next review date').inputValue();
        expect(repairedDate < savedDate).toBe(true);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(repairedDate);

      // --- 6. A date the owner types wins, in either direction -------------
      const chosen = '2027-05-09';
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Slightly better' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        await page.getByLabel('Next review date').fill(chosen);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(chosen);

      // …and once it is the owner's, successful practice leaves it alone.
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable in context' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        expect(await page.getByLabel('Next review date').inputValue()).toBe(chosen);
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(chosen);

      // --- 7. Explicit No, then Schedule again from the item ---------------
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Stable alone' }).click();
        await page.getByRole('button', { name: 'Change' }).click();
        await page.getByRole('group', { name: '' }).first().waitFor().catch(() => {});
        await page.getByRole('button', { name: 'No', exact: true }).first().click();
        await page.getByRole('button', { name: 'Save block' }).click();
      });
      await reload(app);
      await goTo(app, `/items/${ITEM}`);
      await expect.poll(() => page.getByRole('button', { name: 'Schedule again' }).isVisible()).toBe(true);

      const rearmed = '2027-06-20';
      const blocksBeforeRearm = await practiceBlockCount(page, app.origin, ITEM);
      await goTo(app, `/items/${ITEM}`);
      await page.getByRole('button', { name: 'Schedule again' }).click();
      await page.getByLabel('Next review date').fill(rearmed);
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(rearmed);
      // Re-arming is administration: it logged no practice.
      expect(await practiceBlockCount(page, app.origin, ITEM)).toBe(blocksBeforeRearm);
      const blocksBefore = await practiceBlockCount(page, app.origin, ITEM);

      // --- 8. Saving without a result answers nothing about the schedule ---
      await practise(page, app.origin, ITEM, async () => {
        await page.getByRole('button', { name: 'Save without a result' }).click();
      });
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, ITEM)).toBe(rearmed);
      expect(await practiceBlockCount(page, app.origin, ITEM)).toBe(blocksBefore + 1);

      // --- 9. Across local midnight, with the draft intact -----------------
      // A DIFFERENT item, with no pending date at all, so the proposal is
      // derived from TODAY and a day boundary must visibly move it. (ITEM's
      // own date is the owner's by now, and is protected on purpose.)
      const FRESH = 'i-flag-missing';
      await goTo(app, `/items/${FRESH}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await finishBlock(page);
      const draft = 'the riz evened out after slowing right down';
      await page.getByPlaceholder('What did you notice?').fill(draft);
      await page.getByRole('button', { name: 'Worse' }).click();
      await page.getByRole('button', { name: 'Change' }).click();
      const beforeMidnight = await page.getByLabel('Next review date').inputValue();

      await page.clock.setFixedTime(new Date('2027-01-16T00:30:00'));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await expect
        .poll(() => page.getByLabel('Next review date').inputValue())
        .not.toBe(beforeMidnight);
      // The musician's own words survived the refresh.
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe(draft);
      const afterMidnight = await page.getByLabel('Next review date').inputValue();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, FRESH)).toBe(afterMidnight);

      // --- 10. The preview reflects the practice that has actually happened -
      // Everything above really was practised today, so a freshly built plan
      // must say so rather than proposing the same work again as if nothing
      // had been done. This is the live-data half of "no stale preview": the
      // budget half is step 1, the local-day half is step 9.
      await page.clock.setFixedTime(CLOCK);
      await goTo(app, '/plan');
      await page.getByRole('button', { name: '30 min', exact: true }).click();
      const summary = await page.locator('.page-sub').first().textContent();
      expect(summary).toContain('already practised today');
      expect(await page.locator('.list-row').filter({ hasText: itemTitle }).count()).toBe(0);

      // --- 11. A PLAN LEFT OPEN ACROSS MIDNIGHT IS MARKED STALE ------------
      // Still the same preview from step 10, on screen with no database
      // write in between. `rev` alone cannot see a day rolling over — this is
      // the OTHER half of "no stale preview" the review named: not data
      // changing beneath the plan, but the CLOCK moving past it while it sits
      // open, unstarted.
      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
      await page.clock.setFixedTime(new Date('2027-01-16T00:15:00'));
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
      await expect
        .poll(() => page.getByText(/plan was built for a day that has passed/).isVisible().catch(() => false))
        .toBe(true);
      expect(await page.getByRole('button', { name: 'Start plan' }).isDisabled()).toBe(true);
      // Regenerating clears it: the owner's swaps/removals up to that point
      // are the thing being protected, not the stale label itself.
      await page.getByRole('button', { name: 'Regenerate' }).click();
      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);

      // --- 11b. THE START-PLAN RACE: NO event, NO poll — the exact gap step
      // 11's own dispatched visibilitychange never exercises, and a real
      // device left untouched genuinely experiences. Advance the clock past
      // midnight again and click Start IMMEDIATELY, with nothing to have told
      // the screen the day changed: the click itself must refuse rather than
      // silently install yesterday's selections under a button that still
      // reads as enabled, and the refusal must be VISIBLE — the same banner,
      // not a dead click.
      await page.clock.setFixedTime(new Date('2027-01-17T00:20:00'));
      await page.getByRole('button', { name: 'Start plan' }).click();
      await expect
        .poll(() => page.getByText(/plan was built for a day that has passed/).isVisible().catch(() => false))
        .toBe(true);
      expect(await page.getByRole('button', { name: 'Start plan' }).isDisabled()).toBe(true);
      // The click installed nothing: still the preview, not the runner.
      expect(await page.getByRole('button', { name: 'Regenerate' }).isVisible()).toBe(true);
      await page.getByRole('button', { name: 'Regenerate' }).click();
      expect(await page.getByRole('button', { name: 'Start plan' }).isEnabled()).toBe(true);
      // Genuinely fresh now: the same click succeeds.
      await page.getByRole('button', { name: 'Start plan' }).click();
      await expect
        .poll(() => page.getByRole('button', { name: 'End the plan' }).isVisible().catch(() => false))
        .toBe(true);
      await page.getByRole('button', { name: 'End the plan' }).click();

      await page.clock.setFixedTime(CLOCK);
      await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

      // --- 12. THE CLOSE-SCREEN RACE: a Save clicked exactly as the day
      // rolls, with NO visibilitychange/focus event and before the next
      // 30-second poll — the exact gap step 9's own visibilitychange dispatch
      // does not exercise. The first Save must refresh the decision instead
      // of silently writing the day it was previewed on; the second — now
      // agreeing with the true day — writes exactly what is on screen.
      const RACE_ITEM = 'i-q-and-flag';
      await goTo(app, `/items/${RACE_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await finishBlock(page);
      const raceDraft = 'the vibrato settled once the wrist relaxed';
      await page.getByPlaceholder('What did you notice?').fill(raceDraft);
      await page.getByRole('button', { name: 'Worse' }).click();
      await page.getByRole('button', { name: 'Change' }).click();
      const previewedBeforeRace = await page.getByLabel('Next review date').inputValue();

      await page.clock.setFixedTime(new Date('2027-01-16T00:05:00'));
      await page.getByRole('button', { name: 'Save block' }).click();
      // Still on the close screen: that click refreshed the stale decision
      // rather than saving it. The musician's own words survived untouched.
      expect(await page.getByRole('button', { name: 'Save block' }).isVisible()).toBe(true);
      expect(await page.getByPlaceholder('What did you notice?').inputValue()).toBe(raceDraft);
      await expect
        .poll(() => page.getByLabel('Next review date').inputValue())
        .not.toBe(previewedBeforeRace);
      const correctedDate = await page.getByLabel('Next review date').inputValue();
      await page.getByRole('button', { name: 'Save block' }).click();
      await page.waitForTimeout(300);
      await reload(app);
      expect(await persistedReviewDate(page, app.origin, RACE_ITEM)).toBe(correctedDate);
      await page.clock.setFixedTime(CLOCK);
    } finally {
      await app.close();
    }
  });
});

// --- helpers ---------------------------------------------------------------

function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function segmentCount(page: Page): Promise<number> {
  // Every segment row carries a Swap button; the Total row does not.
  return page.getByRole('button', { name: /^Swap / }).count();
}

async function totalMinutes(page: Page): Promise<number> {
  const rows = page.locator('.list-row');
  const last = await rows.last().textContent();
  return Number((last ?? '').replace(/[^0-9]/g, ''));
}

/** The item's own title, read from its detail screen. */
async function itemTitleOf(page: Page, origin: string, itemId: string): Promise<string> {
  await page.goto(`${origin}#/items/${itemId}`);
  await page.locator('h1.page-title').first().waitFor();
  return ((await page.locator('h1.page-title').first().textContent()) ?? '').trim();
}

/** Run one ordinary block on an item and close it however `close` says. */
async function practise(page: Page, origin: string, itemId: string, close: () => Promise<void>): Promise<void> {
  await page.goto(`${origin}#/items/${itemId}`);
  await page.getByRole('button', { name: 'Start a block' }).click();
  await finishBlock(page);
  await close();
  await page.waitForTimeout(300);
}

async function finishBlock(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Finish' }).click();
  await page.getByRole('button', { name: 'Stable alone' }).waitFor();
}

/**
 * The date the DATABASE holds for this item, read back through the item's own
 * "change review date" control — a real control showing the persisted value,
 * never a debug hook.
 */
async function persistedReviewDate(page: Page, origin: string, itemId: string): Promise<string> {
  await page.goto(`${origin}#/items/${itemId}`);
  const open = page.getByRole('button', { name: /Change review date|Schedule again/ });
  await open.waitFor();
  const label = await open.textContent();
  if (label?.includes('Schedule again')) return '';
  await open.click();
  const value = await page.getByLabel('Next review date').inputValue();
  await page.getByRole('button', { name: 'Cancel' }).click();
  return value;
}

/**
 * How many blocks this item has recorded, read from its own Blocks stat — the
 * honest count of practice, and the thing an administrative action must never
 * move.
 */
async function practiceBlockCount(page: Page, origin: string, itemId: string): Promise<number> {
  await page.goto(`${origin}#/items/${itemId}`);
  const stat = page.locator('.stat').filter({ hasText: 'Blocks' }).first();
  await stat.waitFor();
  return Number(((await stat.locator('.stat-value').textContent()) ?? '').trim());
}
```

### tests/lesson-agenda.browser.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  readPersistedState,
  reload,
  writePersistedState,
} from './practiceBrowser';
import v11 from './fixtures/practice-decisions-v11.json?raw';

// ---------------------------------------------------------------------------
// ac-18 — the lesson-agenda journey, in the real app.
//
// The legacy fixture goes in through the real Settings importer, and
// everything after that is done with the controls the owner actually uses.
// The point is the SEAM: the pure migration and the pure agenda transforms are
// proven in `src/domain`, but only this can show that what the owner sees and
// what the database holds are the same thing.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_QUESTION = 'آیا مضرابِ ریز را سبک‌تر بگیرم؟';
const ENGLISH_QUESTION = 'Should I keep the tempo steady through the foroud?';

describe('the lesson agenda, end to end', () => {
  it('lesson agenda browser journey retains questions after the targeted class', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- 1. The legacy database arrives through the real import control ---
      await importBackup(app, 'legacy-v11.json', v11);
      expect(await importOutcome(app)).toContain('Imported');

      // A RELOAD, so what follows is read back out of IndexedDB rather than
      // out of whatever React happened to be holding.
      await reload(app);
      await goTo(app, '/lessons');

      const classA = page.locator('article').filter({ hasText: 'Class 41 · 2027-03-05' }).first();
      const classB = page.locator('article').filter({ hasText: 'Class 42 · 2027-04-02' }).first();
      await classA.waitFor();

      // --- 2. Migrated intent is VISIBLY UNASSIGNED, never guessed onto a class -
      const unassignedA = classA.getByText('These name no class yet');
      await expect.poll(() => unassignedA.isVisible()).toBe(true);
      // The Farsi question came through verbatim, as ONE question.
      await expect
        .poll(() => classA.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).first().isVisible())
        .toBe(true);
      // Nothing was silently attached to either class.
      await expect.poll(() => classA.getByText('No open questions for this class').isVisible()).toBe(true);
      await expect.poll(() => classB.getByText('Nothing committed to this class yet').isVisible()).toBe(true);

      // --- 3. Question and preparation are targeted INDEPENDENTLY -----------
      // The question goes to class B, from the class surface.
      const farsiRow = classB
        .locator('div')
        .filter({ hasText: 'آیا نقطهٔ فرودم درست است؟' })
        .filter({ has: page.getByRole('button', { name: 'Move to this class' }) })
        .last();
      await farsiRow.getByRole('button', { name: 'Move to this class' }).click();

      // The preparation goes to class A, from the ITEM surface — a different
      // screen, the same one collection.
      await goTo(app, '/repertoire');
      await page.getByRole('button', { name: 'Practice list' }).click();
      await page.getByRole('link', { name: /پیش‌درآمدِ افشاری/ }).first().click();
      await page.getByRole('button', { name: /Prepare for Class 41/ }).click();
      await expect.poll(() => page.getByText('For Class 41 · 2027-03-05').first().isVisible()).toBe(true);

      await reload(app);
      await goTo(app, '/lessons');

      // Each class now shows ITS OWN commitment and nobody else's.
      await expect
        .poll(() => classB.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).first().isVisible())
        .toBe(true);
      await expect.poll(() => classA.getByText('Nothing committed to this class yet').isVisible()).toBe(false);
      await expect.poll(() => classB.getByText('Nothing committed to this class yet').isVisible()).toBe(true);
      await expect.poll(() => classA.getByText('No open questions for this class').isVisible()).toBe(true);

      // --- 4. Asked, with an answer — and it STAYS on that class ------------
      const questionCard = classB
        .locator('div.card')
        .filter({ hasText: 'آیا نقطهٔ فرودم درست است؟' })
        .first();
      await questionCard.getByRole('button', { name: 'Add answer' }).click();
      await questionCard.getByLabel('Teacher answer').fill('بله، سبک‌تر.');
      await questionCard.getByRole('button', { name: 'Save answer' }).click();
      await questionCard.getByRole('button', { name: 'Mark asked' }).click();

      await reload(app);
      await goTo(app, '/lessons');

      // It has left the OPEN list for that class…
      await expect.poll(() => classB.getByText('Already asked at this class').isVisible()).toBe(true);
      await expect.poll(() => classB.getByText('بله، سبک‌تر.').first().isVisible()).toBe(true);
      // …and it was NOT carried forward to the other class.
      await expect
        .poll(() => classA.getByText('آیا نقطهٔ فرودم درست است؟', { exact: false }).count())
        .toBe(0);
      // No practice was logged by any of it.
      await goTo(app, '/');
      await expect.poll(() => page.getByText(/Practised today: 0 min · 0 blocks/).isVisible()).toBe(true);

      // --- 5. Mixed languages, checked against the REAL laid-out DOM --------
      // A Farsi question on an ENGLISH-titled item, and an English question on
      // a FARSI-titled item: the two combinations that only differ when the
      // title and the question disagree, which matching-language seed data can
      // never show.
      await addQuestionToItem(page, /Question but never flagged/, FARSI_QUESTION);
      await addQuestionToItem(page, /آوازِ افشاری/, ENGLISH_QUESTION);

      await reload(app);
      await goTo(app, '/lessons');
      const sheet = classA.getByRole('list').filter({ has: page.getByText(FARSI_QUESTION) }).first();
      await sheet.waitFor();

      const farsiOnEnglish = await rowDirection(page, FARSI_QUESTION);
      const englishOnFarsi = await rowDirection(page, ENGLISH_QUESTION);
      // The row's direction tracks the QUESTION, which is the field that is
      // always present — never the optional, independently-authored title.
      expect(farsiOnEnglish).toBe('rtl');
      expect(englishOnFarsi).toBe('ltr');

      // --- 6. A refused clipboard says so, and offers something else --------
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          configurable: true,
          value: { writeText: () => Promise.reject(new Error('denied')) },
        });
      });
      await reload(app);
      await goTo(app, '/lessons');
      await classA.getByRole('button', { name: 'Copy' }).first().click();
      const status = page.getByRole('status').filter({ hasText: 'Couldn’t copy' }).first();
      await status.waitFor();
      expect(await status.textContent()).toContain('select it, or use Download');
      // The fallback is a real, selectable control with an accessible name.
      const fallback = page.getByLabel('Questions text to select and copy');
      await fallback.waitFor();
      expect(await fallback.inputValue()).toContain(FARSI_QUESTION);
      expect(await page.getByRole('button', { name: 'Download' }).first().isEnabled()).toBe(true);

      // --- 7. The controls this lane added are reachable by role and name ---
      for (const name of ['Mark asked', 'Add answer', 'Remove this question']) {
        expect(await classA.getByRole('button', { name }).first().isVisible(), name).toBe(true);
      }
      expect(await classA.getByLabel('New question for this class').first().isVisible()).toBe(true);

      // --- 8. An INVALID new-model import is refused, old data still there --
      const broken = JSON.parse(v11) as { data: { lessonAgenda: unknown[] } };
      broken.data.lessonAgenda = [{ id: 'x', kind: 'reminder', instrumentId: 'setar' }];
      await importBackup(app, 'broken.json', JSON.stringify(broken));
      expect(await importOutcome(app)).toContain('Import failed');
      await reload(app);
      await goTo(app, '/lessons');
      // Everything established above survived the refusal untouched.
      await expect.poll(() => classB.getByText('بله، سبک‌تر.').first().isVisible()).toBe(true);
      await expect.poll(() => classA.getByText(FARSI_QUESTION).first().isVisible()).toBe(true);

      // --- 9. HYDRATION COMPLETES AN INCOMPLETE CURRENT-SCHEMA CONVERSION ---
      // Zustand's persist middleware only calls `migrate` when the persisted
      // version differs from the current one — a persisted v12 database that
      // already carries a stray legacy field (an interrupted write, a bug in
      // an earlier build) never reaches it that way. This writes directly
      // into the app's own IndexedDB, the way an already-current device holds
      // its state, bypassing every import door (which always runs
      // `validateDB`, and so always runs the migration chain, regardless of
      // the version a FILE claims).
      const persisted = await readPersistedState(app);
      expect(persisted.version).toBe(12);
      const HYDRATION_ITEM = 'i-q-empty'; // has a preparation already, no question yet
      const stateBefore = persisted.state as { db: { items: { id: string; teacherQuestion?: string }[] } };
      const withLeftover = {
        ...(persisted.state as Record<string, unknown>),
        db: {
          ...stateBefore.db,
          items: stateBefore.db.items.map((i) =>
            i.id === HYDRATION_ITEM ? { ...i, teacherQuestion: 'hydration leftover question' } : i,
          ),
        },
      };
      await writePersistedState(app, withLeftover, 12);
      await reload(app);

      // The leftover was completed LOSSLESSLY, not silently dropped: a real
      // open question now exists for the item, reachable the ordinary way.
      await goTo(app, `/items/${HYDRATION_ITEM}`);
      await expect.poll(() => page.getByText('hydration leftover question').first().isVisible()).toBe(true);

      // Idempotent: a SECOND, ordinary reload (now genuinely current, nothing
      // left behind) creates no duplicate.
      await reload(app);
      await goTo(app, `/items/${HYDRATION_ITEM}`);
      expect(await page.getByText('hydration leftover question').count()).toBe(1);
    } finally {
      await app.close();
    }
  });
});

/** Raise a question from the ITEM surface, the way the owner does. */
async function addQuestionToItem(
  page: import('playwright').Page,
  title: RegExp,
  text: string,
): Promise<void> {
  await page.goto(page.url().replace(/#.*$/, '') + '#/repertoire');
  await page.getByRole('button', { name: 'Practice list' }).click();
  await page.getByRole('link', { name: title }).first().click();
  await page.getByRole('button', { name: '+ Ask about this' }).click();
  await page.getByLabel('New question').fill(text);
  await page.getByRole('button', { name: 'Add question' }).click();
  await page.getByText(text).first().waitFor();
}

/**
 * The direction a question's own row actually RESOLVES to in the laid-out DOM —
 * read from the browser, not inferred from source.
 */
async function rowDirection(page: import('playwright').Page, question: string): Promise<string> {
  return page.evaluate((q) => {
    const all = [...document.querySelectorAll('li')];
    const li = all.find((el) => (el.textContent ?? '').includes(q));
    if (!li) return 'not-found';
    return getComputedStyle(li).direction;
  }, question);
}
```

### tests/practiceBrowser.ts

```
import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';

// ---------------------------------------------------------------------------
// A small harness for driving the REAL app in a real browser from an ordinary
// Vitest test.
//
// Deliberately a LIBRARY, not a second test runner: the installed check engine
// traces acceptance through the Vitest report, so a standalone Playwright exit
// code would prove nothing to it. Each journey gets its own Vite dev server and
// its own browser CONTEXT, which means its own origin-scoped IndexedDB and
// localStorage — no fixture from one journey can reach the other, and neither
// can touch the owner's real data, GitHub or NAS.
//
// A missing browser is a FAILURE with a setup message, never a skip: a check
// that quietly passes because it did not run is worse than no check at all.
// ---------------------------------------------------------------------------

const INSTALL_HINT =
  'The Playwright browser is not installed. Run `npx playwright install chromium` ' +
  '(CI does this before `npm test`). This check never skips: an unverified journey is not a passing one.';

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
  close(): Promise<void>;
}

/**
 * Start the app and open it in a fresh, isolated browser context.
 *
 * `now` fixes the browser's clock before any script runs, so every date the
 * app derives — due reviews, lesson deadlines, the local calendar day a block
 * belongs to — is deterministic. `page.clock` can then move it forward within
 * a journey (across local midnight, for instance) exactly as a real device
 * left open overnight would experience it.
 */
export async function openPracticeApp(options: { now: Date; viewport?: { width: number; height: number } }): Promise<PracticeApp> {
  const server: ViteDevServer = await createServer({
    configFile: 'vite.config.ts',
    logLevel: 'error',
    server: { port: 0, strictPort: false },
  });
  await server.listen();
  const origin = server.resolvedUrls?.local[0];
  if (!origin) {
    await server.close();
    throw new Error('The dev server started but reported no local URL.');
  }

  let browser: Browser;
  try {
    browser = await chromium.launch();
  } catch (e) {
    await server.close();
    throw new Error(INSTALL_HINT, { cause: e });
  }

  let context: BrowserContext;
  let page: Page;
  try {
    context = await browser.newContext({
      viewport: options.viewport ?? { width: 390, height: 844 },
      // The owner's phone. Deliberately the constraint the product is held to.
      deviceScaleFactor: 2,
    });
    page = await context.newPage();
    // ONE handler for the whole journey. The app's destructive actions ask
    // first with confirm(); an unanswered dialog blocks every later command,
    // and registering a second handler makes the first one's accept() throw.
    page.on('dialog', (d) => {
      void d.accept().catch(() => {});
    });
    await page.clock.install({ time: options.now });
    await page.goto(origin);
    // The store hydrates from IndexedDB before anything renders.
    await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });
  } catch (e) {
    await browser.close();
    await server.close();
    throw e;
  }

  return {
    page,
    origin,
    async close() {
      await browser.close();
      await server.close();
    },
  };
}

/**
 * Import a backup through the REAL Settings control — the same path the owner
 * uses, file picker and confirmation included. No debug hook, no direct store
 * access: a journey that seeded itself through a back door would prove nothing
 * about the door the owner actually walks through.
 */
export async function importBackup(app: PracticeApp, name: string, json: string): Promise<void> {
  const { page } = app;
  await page.getByRole('link', { name: 'More' }).click();
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByLabel('Import backup file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(json, 'utf8'),
  });
  await page.getByText(/Imported \(|Import failed:/).waitFor({ timeout: 20_000 });
}

/** The message the Settings import flashed — "Imported (1 file)." or a refusal. */
export async function importOutcome(app: PracticeApp): Promise<string> {
  return (await app.page.getByText(/Imported \(|Import failed:/).first().textContent()) ?? '';
}

/** Go to a route the way the owner does, then wait for the app to settle. */
export async function goTo(app: PracticeApp, hashPath: string): Promise<void> {
  await app.page.goto(`${app.origin}#${hashPath}`.replace('##', '#'));
  await app.page.getByRole('navigation', { name: 'Primary' }).waitFor();
}

/** Reload, proving a claim survived in IndexedDB rather than in React state. */
export async function reload(app: PracticeApp): Promise<void> {
  // The store persists to IndexedDB asynchronously (that is the whole reason
  // App gates render on `hydrated`), so a reload fired in the same tick as the
  // click can outrun the write. This wait is about the storage platform, not
  // about the app: it is real wall-clock time in Node, unaffected by the
  // page's faked clock.
  await app.page.waitForTimeout(400);
  await app.page.reload();
  await app.page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });
}

const KV_KEY = 'practice-compass';

/**
 * Read the raw bytes the app's own persist middleware would read on the next
 * open — straight out of IndexedDB's `kv` store, not a JSON export shaped for
 * the Settings importer. `{ state, version }` is exactly the shape Zustand's
 * persist middleware writes and reads (`middleware.mjs`'s `setItem`/`hydrate`).
 */
export async function readPersistedState(app: PracticeApp): Promise<{ state: unknown; version: number }> {
  return app.page.evaluate(
    (key) =>
      new Promise<{ state: unknown; version: number }>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readonly');
          const get = tx.objectStore('kv').get(key);
          get.onsuccess = () => {
            db.close();
            resolve(JSON.parse((get.result as { value: string }).value));
          };
          get.onerror = () => reject(get.error);
        };
      }),
    KV_KEY,
  );
}

/**
 * Write directly into the app's own IndexedDB `kv` store — the way an
 * ALREADY-hydrated device holds its persisted state — bypassing every
 * import/migration door entirely. The one way to reach the "persisted
 * version already matches the current schema" hydration path: Zustand's
 * persist middleware only calls `migrate` when the persisted version differs
 * from the current one, and every JSON-import door runs `validateDB`
 * regardless of what version a FILE claims.
 */
export async function writePersistedState(app: PracticeApp, state: unknown, version: number): Promise<void> {
  await app.page.evaluate(
    ({ key, state, version }) =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').put({ key, value: JSON.stringify({ state, version }) });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { key: KV_KEY, state, version },
  );
}
```

## Check against the contract

- [ ] **ac-1** — A1/A2/A3. Against the real pure close transition, table all three stable results, a future date, due date, first schedule and repeated same-day closes. Early successes preserve date/open-row identity/reps/ease/base while real block stats change; a due stable result advances once; explicit clear/re-arm and reload cannot enable a second same-day advance. Undefined/not_logged and routine exposure never advance. Distinguish the actual permitted and forbidden cases, not just a default result. _(proof: early successful practice preserves the pending review and spacing state)_
- [ ] **ac-2** — A3/A4. same and slightly_better before due preserve the schedule and SR state; neither is described as a slip. Due same/slightly_better repeat rather than expand/reset the interval. worse may shorten an automatic future review with min(existing,repair), never postpone it even on repetition. Verify a repair setting modified by importance/difficulty explains the final saved date, not the raw setting. _(proof: only deterioration can bring an automatic review forward)_
- [ ] **ac-3** — A5/C6. Table auto-date manual override, manual mode, fixed cadence, snoozed date and unknown legacy provenance with positive/same/worse results before/at/after due. Protected future dates remain exact. Manual no-new-date preserves pending state unless explicit No. Fixed due scheduling uses fixed cadence without SR change. An explicit date edit is respected even when different from the engine. _(proof: manual and fixed dates survive extra practice without advancing spacing)_
- [ ] **ac-4** — A6. Exercise real shared transitions for explicit decline, unanswered, scheduled-without-date, initial schedule, no-open-row Schedule again, existing-open-row edit and snooze. Assert item/open-row dates agree, no duplicate pending review is created by repetition, completed history is unchanged, and administrative actions create no block/result/SR progress. Conflicting legacy pending dates must be reported rather than silently discarded. _(proof: decline unanswered and schedule again make distinct pending review transitions)_
- [ ] **ac-5** — B3/C2. Compare dormant vs active and preparation vs question-only/unassigned/past/other-instrument agenda entries across recommend, plan and swap. Resting-only automatic pools are honestly empty, never resurrected by fallback. Direct explicit item practice remains possible. A question alone changes no practice priority; only a specific current/future lesson preparation contributes its own urgency. _(proof: recommendations exclude resting items and question only urgency)_
- [ ] **ac-6** — B5. Equal minutes/time split into one vs several blocks have equal exposure; longer recent practice cannot count as less exposure. Include routine/not_logged blocks, future timestamps, UTC/local midnight, DST and old same results. Recent penalties decay; old same can yield a strategy hint but not permanent saturation or selection exclusion. _(proof: recent exposure measures minutes and decays independently of old same results)_
- [ ] **ac-7** — B2/B4. At 5 and 10 minutes a tomorrow-lesson usable item with higher true urgency beats an unrelated new deep item; one main focus uses the budget. With no urgent work, an ordinary usable/improvisation/rhythm/theory item remains eligible without fabricated mastery or category requirements. Wrong-instrument candidates never enter the plan. _(proof: short sessions choose the most useful anchor before optional roles)_
- [ ] **ac-8** — B1/B2. Table 5/10/12/15/20/45/60/120 minutes; familiar Radif/piece and familiar technique candidates versus unfamiliar demanding exercise. No mandatory warm-up in short sessions or when unsuitable. When present it is first, within the total, its bounded share is real, and useful main work remains. No special warm-up entity/tag is required; routine data is unchanged. Invalid budgets reject cleanly. _(proof: warm up uses familiar existing material within the chosen budget)_
- [ ] **ac-9** — B4/B5/B6. A fixed multi-day fixture with lesson work, due maintenance and existing diverse/absent metadata shows urgent work selected when needed, recently exposed equivalents yielding to fresh useful work, maintenance remaining reachable as repeated urgent exposure accumulates, and missing categories never filled artificially. Same input and permutations of storage arrays produce identical selections and reasons using stable ids. Document the numeric policy and fixture outputs. _(proof: session variety responds to exposure without quotas or losing urgent work)_
- [ ] **ac-10** — B2/B3/B7. Exercise initial build, swap, regenerate, remove and all-practised fallback with the same candidates. No dormant/wrong-instrument candidate bypass, duplicate item, or selected-but-described-as-skipped item. Allocations never exceed the budget and normally use it fully when suitable eligible work exists; an honest remainder is allowed when filling it would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. All segments remain feasible and positive; dropping/redistributing cannot attach another role's minutes/reason to the wrong item. Reasons identify the actual lesson, final date or repeat/exposure trade-off. _(proof: build swap and redistribution preserve candidate identity and honest reasons)_
- [ ] **ac-11** — B7. Rehydrate a partially done/skipped plan, change/delete/move a pending item, and attempt to begin with another unfinished ordinary/routine session. Completed progress and real blocks survive; invalid pending work cannot start under another instrument; skipping/ending logs nothing. Live relevant changes cannot silently start stale preview decisions. Use actual store wiring in the browser journey as well as any extracted pure transition. _(proof: plan transitions preserve progress and refuse stale cross instrument starts)_
- [ ] **ac-12** — C1/C2. One item has a question for lesson A and preparation for lesson B. Query each lesson, Today, item and report: no question-derived urgency, no duplicated next-class agenda, no mutation of Lesson.itemIds. Several same-instrument future lessons remain distinct. No future lesson produces visible unassigned capture; same-instrument target validation rejects mismatches. _(proof: lesson preparation and questions have independent specific targets)_
- [ ] **ac-13** — C3/C4. Mark asked with/without answer, reopen, pass the lesson date, reschedule it, delete it and move/delete an associated item. Text/answer/former target identification survives detachment. Asked entries never reappear automatically; unasked past entries remain on that lesson, and only explicit carry-forward changes target. None of these actions logs practice or completes a review. _(proof: asked questions remain historical without automatic carry forward)_
- [ ] **ac-14** — C5. v11 fixtures include true/false/missing flags, question-only items, multiline Farsi/English, empty text, no future lessons, several future lessons, ids resembling generated ids and partially migrated entries. Convert each legacy intention once to the correct unassigned kind, preserve text verbatim, invent no asked state/answer/target, and produce the same result on different days and repeated applications. Already-current empty collections remain empty. Unrelated data and SR state are byte-equivalent. _(proof: legacy lesson intent migrates unassigned exactly once without losing text)_
- [ ] **ac-15** — C5/C6/C7. Exercise pure migration and actual hydration/import wiring for bare/wrapped/full backups, sync-intent import, Keep remote and archive restore delegation. Current v12 round trips retain agenda/history/provenance/marker; invalid new fields/targets/dates/duplicates, incomplete conversion and newer schemas fail before database/blob replacement. Legitimate unassigned or detached historical records pass. Presence/revision guards remain effective; no fake repair of old data. _(proof: all inbound paths preserve the new model or reject before replacement)_
- [ ] **ac-16** — C8. Export/import both pre-upgrade v11 and post-upgrade v12 fixtures, including attachment metadata and valid fixture bytes, lesson answers, manual dates and SR state. Verify deterministic upgrade and complete v12 retention after restore. Prove newer-version rejection remains; do not rewrite schemaVersion or omit new fields as a supposed downgrade. Documentation states old-build restore cannot retain later v12 edits. _(proof: rollback fixtures preserve exports without pretending v12 can be downgraded)_
- [ ] **ac-17** — A/B integration. One uniquely named Vitest test drives the actual app in an isolated Playwright browser at a 390x844 viewport: choose 5 then 30 minutes, inspect explanation/total/warm-up suitability and urgent work, start/finish/save, reload and rebuild. Assert the rendered date equals persisted item/pending review and successful extra practice does not advance again. Include within-test branches for same vs worse, manual date/result change, explicit No then item-level Schedule again, and unanswered save. Move the test clock across local midnight and mutate relevant fixture state to prove live preview/close revalidation without losing the draft. Use accessible controls, not production debug hooks or source regex. _(proof: daily practice browser journey preserves the decision across close and rebuild)_
- [ ] **ac-18** — C integration. One uniquely named Vitest test imports the legacy fixture through real UI, reloads to verify visible unassigned intent, targets question and preparation independently across two future lessons, marks asked and adds an answer, then verifies historical retention and no next-class repetition. Simulate clipboard rejection and assert accessible feedback plus selectable/download fallback. Check Farsi question with English title and the reverse through real DOM layout/direction, and keyboard-accessible names of changed controls. Exercise invalid new-model import and assert old data stays present. _(proof: lesson agenda browser journey retains questions after the targeted class)_
- [ ] **ac-19** — Musical/real-device acceptance only: using representative Setar and Guitar data, inspect 5/20/45-minute outputs and the published reasons. Confirm warm-up suitability, useful variety without quotas, urgency without repetitive crowding-out, quick start under 30 seconds and ordinary close under 60 seconds, and legible mixed Farsi/English on the actual phone. Confirm one-time unassigned migration is understandable. This is not permission to change scheduler policy or a claim that desktop automation reproduces the iPhone keyboard bug; deterministic checks above must already pass. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx, vite.config.ts
- **log-a-class** — touched via src/pages/Lessons.tsx, src/domain/selectors.ts, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/StageDetail.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/plan.ts, src/domain/scheduling.ts, src/domain/types.ts, src/pages/CloseBlock.tsx, src/pages/Settings.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts matched changed file(s) src/domain/scheduling.ts, src/domain/selectors.ts, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, vite.config.ts matched changed file(s) src/pages/Settings.tsx, vite.config.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/selectors.ts, src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts matched changed file(s) src/domain/recommend.ts, src/domain/scheduling.ts, src/domain/scoring.ts, src/pages/CloseBlock.tsx, src/pages/Today.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts matched changed file(s) src/domain/plan.ts, src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts matched changed file(s) src/domain/insights.ts, src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StageDetail.tsx, src/store/useStore.ts matched changed file(s) src/pages/StageDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### install-the-app-and-keep-it-current — Works now

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

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

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260913-build-a-daily-session-i-can-trust-from-l-402e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
