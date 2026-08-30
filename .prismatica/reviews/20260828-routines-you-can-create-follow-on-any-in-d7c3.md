---
id: 20260828-routines-you-can-create-follow-on-any-in-d7c3
contractId: 20260828-routines-you-can-create-follow-on-any-in-d7c3
patchId: 0273873e5218b522c48fab2109353d914e77a54c
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Single active practice clock and honest time accounting
    summary: The new hydration repair has no runnable regression test, so the exact
      rejected dual-clock failure is not protected by patch-bound evidence.
    counterexample: Restore the previous fail-open merge that returns persisted
      active and activeRoutine unchanged. All 21 named acceptance tests still
      pass because none hydrates a persisted dual-running state or asserts that
      both clocks are frozen with their elapsed time preserved.
createdAt: 2026-08-30T00:46:08.839Z
sealedAt: 2026-08-30T00:52:59.387Z
---

# Review: Routines you can create, follow on any instrument, and actually log

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260828-routines-you-can-create-follow-on-any-in-d7c3
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/5
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `0273873e5218b522c48fab2109353d914e77a54c`

## The Delta this change was framed from

# Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

_approved · about "work-a-pathway-stage" step 1_

## Today

The stage promises 'guided routines if any', and 'if any' is doing an enormous amount of work. Routines exist on the Classical Guitar pathway alone; Setar and Tar have none and no way to make one, because the store has no create, update or delete for them at all and a routine cannot exist without a pathway. They are reachable only four taps deep and never from Today. Running one records nothing whatsoever: twenty minutes of real practice ends at a 'Routine complete' screen and leaves no block, no minutes, and no trace in any insight. The syllabus's own 'if rushed for time, opt for the asterisked ones' is in the data and does nothing but print the word 'essential'. And the countdown ticks a counter instead of reading the clock, so locking the phone during a hands-free routine quietly loses the time.

## Instead

Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

## Keep

- Practising through the ordinary close flow stays the only thing that completes a review or advances spaced repetition — a routine records time, never a judgement.
- The Session Plan is untouched and stays a separate thing; routines are not folded into it and it is not folded into them.
- The seeded guitar routines keep running exactly as they do now for anyone who binds nothing to them.
- Starting a routine stays one tap, and binding items to segments stays optional.
- No streaks, scores or fabricated mastery on the finish screen — honest minutes and nothing else.
- Today's primary recommendation stays above the fold; the plan card gains a branch, not a new section.

## New assumptions

- A routine that repeats the same item is normal and correct — the CGS Stage 1 routine plays Chunk chords four times on purpose — so recording it must not read as four separate practice sessions.
- Recording minutes with no result is honest rather than incomplete: the user practised, and did not stop to judge how it went.

## Show me

On Setar, open Today and use the plan card to create a routine — a few named segments, two of them bound to real items, one marked essential. Run it. The timer keeps real time even if you lock the phone mid-segment. At the end, each bound item shows one new block with the minutes added up, its previous result unchanged and no new review scheduled. Run it again with 'short on time' and only the essential segments play. Then open the guitar Stage 1 routine and confirm it behaves exactly as it did before.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **Routine instrument, binding and placement integrity at every mutation edge** — Store-level placement validation still fails open for nonexistent pathways and cross-pathway stages.
  _counterexample:_ Call addRoutine or updateRoutine with pathwayId 'missing' and any stageId. retargetRoutineInstrument receives pathway undefined, treats undefined as a compatible General pathway, and preserves both identifiers. A stageId belonging to another pathway is likewise preserved because no stage relationship is checked.
- **Single active practice clock and honest time accounting** — Hydration preserves a legacy dual-running state, so both clocks can continue without passing through either new resume guard.
  _counterexample:_ Persist active.running=true and activeRoutine.running=true using the previously permitted concurrent-start state, then reload. The merge restores both objects unchanged; each elapsed-time function continues counting from its timestamp, and finishing both records the same wall-clock interval twice.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index b41f777..7dfe0eb 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -143,7 +143,14 @@ own pace, on a route they trust. Protect that:
   (`routines.ts`) is the one place these invariants are checked, and the store's `addRoutine`/
   `updateRoutine` call it UNCONDITIONALLY on every create and every save, not only when the
   instrument changed — a form is never trusted on faith for bindings or placement it didn't
-  actually re-derive. This is deliberately a save-time check, not a live one: editing a
+  actually re-derive. That check also covers a `pathwayId`/`stageId` that doesn't actually
+  resolve, not just one whose instrument mismatches: `addRoutine`/`updateRoutine` look up the
+  routine's claimed pathway AND stage live and pass both into `retargetRoutineInstrument`,
+  which never treats an unresolved `pathwayId` as an unscoped (therefore "compatible") General
+  pathway just because the lookup came back `undefined` — a placement pointing at a pathway
+  that no longer exists is cleared entirely, and a `stageId` that resolves to a *different*
+  pathway's stage is cleared on its own, leaving an otherwise-valid `pathwayId` placement
+  untouched. This is deliberately a save-time check, not a live one: editing a
   routine while it is ACTIVELY RUNNING (unbinding an item, changing the instrument) is
   allowed with no "is this active" guard, because `RoutineRunner.tsx` freezes the run's
   segment list (`activeRoutine.authoredSegments`/`segs`) at start and never re-derives it
@@ -173,7 +180,28 @@ own pace, on a route they trust. Protect that:
   persisted (`partialize`), so a dual state can reach a device from before this guard
   existed, and resuming either clock without checking the other would tick both at once, the
   same bug as a fresh concurrent start. Without either half, an ordinary block and a routine
-  could run concurrently and log the same wall-clock interval twice. The pages that start a
+  could run concurrently and log the same wall-clock interval twice. Guarding start and resume
+  is not enough on its own: those guards only run on an in-app action, but the persisted dual
+  state itself re-enters the store on every load through the persist middleware's `merge` —
+  the only path by which a whole `active`+`activeRoutine` pair can reach live state without
+  going through either guard (`importDB`/`resetDemo`/`clearAll` all explicitly null both, and
+  a sync pull replaces only `db`) — so `merge` is the one place this closes for good. If
+  `merge` finds both `active` and `activeRoutine` set, it freezes both (the same
+  accumulate-and-stop transform `pauseSession`/`pauseRoutineRun` already do): each keeps
+  whatever time had genuinely elapsed, but neither is left `running` with a live timestamp to
+  keep ticking from, so a stale dual state can never silently double-log time going FORWARD
+  again. The historical overlap up to the moment of the freeze is deliberately left on both
+  sides rather than guessed away — there is no way to know from the data alone which of the
+  two was the "real" one, and discarding either would silently lose genuinely-elapsed practice,
+  which nothing in this app is allowed to do; it becomes a stale pair the ordinary finish/
+  discard flow (and then the same start/resume guards) makes the user resolve one of, same as
+  any other unclosed block. `RoutineRunner.tsx`'s "an ordinary block is already running"
+  redirect applies even to the routine the store considers "mine": once both can exist as a
+  frozen (not just running) pair, showing the routine screen just because it's the active one
+  would land the user on a Resume button that silently no-ops (`resumeRoutineRun` refuses
+  while `active` exists) — redirecting unconditionally to `/active` gives one deterministic
+  screen to resolve first, instead of a dead button on whichever screen they happened to load.
+  The pages that start a
   clock (`Today.tsx`, `StageDetail.tsx`, `RoutineRunner.tsx`, and — for the out-of-scope
   pages that still `navigate('/active')` after a now-blocked start — `ActiveBlock.tsx`
   itself) resolve the conflict by redirecting to whichever clock is actually running instead
diff --git a/CLAUDE.md b/CLAUDE.md
index b6e46f1..ff4a583 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -143,7 +143,14 @@ own pace, on a route they trust. Protect that:
   (`routines.ts`) is the one place these invariants are checked, and the store's `addRoutine`/
   `updateRoutine` call it UNCONDITIONALLY on every create and every save, not only when the
   instrument changed — a form is never trusted on faith for bindings or placement it didn't
-  actually re-derive. This is deliberately a save-time check, not a live one: editing a
+  actually re-derive. That check also covers a `pathwayId`/`stageId` that doesn't actually
+  resolve, not just one whose instrument mismatches: `addRoutine`/`updateRoutine` look up the
+  routine's claimed pathway AND stage live and pass both into `retargetRoutineInstrument`,
+  which never treats an unresolved `pathwayId` as an unscoped (therefore "compatible") General
+  pathway just because the lookup came back `undefined` — a placement pointing at a pathway
+  that no longer exists is cleared entirely, and a `stageId` that resolves to a *different*
+  pathway's stage is cleared on its own, leaving an otherwise-valid `pathwayId` placement
+  untouched. This is deliberately a save-time check, not a live one: editing a
   routine while it is ACTIVELY RUNNING (unbinding an item, changing the instrument) is
   allowed with no "is this active" guard, because `RoutineRunner.tsx` freezes the run's
   segment list (`activeRoutine.authoredSegments`/`segs`) at start and never re-derives it
@@ -173,7 +180,28 @@ own pace, on a route they trust. Protect that:
   persisted (`partialize`), so a dual state can reach a device from before this guard
   existed, and resuming either clock without checking the other would tick both at once, the
   same bug as a fresh concurrent start. Without either half, an ordinary block and a routine
-  could run concurrently and log the same wall-clock interval twice. The pages that start a
+  could run concurrently and log the same wall-clock interval twice. Guarding start and resume
+  is not enough on its own: those guards only run on an in-app action, but the persisted dual
+  state itself re-enters the store on every load through the persist middleware's `merge` —
+  the only path by which a whole `active`+`activeRoutine` pair can reach live state without
+  going through either guard (`importDB`/`resetDemo`/`clearAll` all explicitly null both, and
+  a sync pull replaces only `db`) — so `merge` is the one place this closes for good. If
+  `merge` finds both `active` and `activeRoutine` set, it freezes both (the same
+  accumulate-and-stop transform `pauseSession`/`pauseRoutineRun` already do): each keeps
+  whatever time had genuinely elapsed, but neither is left `running` with a live timestamp to
+  keep ticking from, so a stale dual state can never silently double-log time going FORWARD
+  again. The historical overlap up to the moment of the freeze is deliberately left on both
+  sides rather than guessed away — there is no way to know from the data alone which of the
+  two was the "real" one, and discarding either would silently lose genuinely-elapsed practice,
+  which nothing in this app is allowed to do; it becomes a stale pair the ordinary finish/
+  discard flow (and then the same start/resume guards) makes the user resolve one of, same as
+  any other unclosed block. `RoutineRunner.tsx`'s "an ordinary block is already running"
+  redirect applies even to the routine the store considers "mine": once both can exist as a
+  frozen (not just running) pair, showing the routine screen just because it's the active one
+  would land the user on a Resume button that silently no-ops (`resumeRoutineRun` refuses
+  while `active` exists) — redirecting unconditionally to `/active` gives one deterministic
+  screen to resolve first, instead of a dead button on whichever screen they happened to load.
+  The pages that start a
   clock (`Today.tsx`, `StageDetail.tsx`, `RoutineRunner.tsx`, and — for the out-of-scope
   pages that still `navigate('/active')` after a now-blocked start — `ActiveBlock.tsx`
   itself) resolve the conflict by redirecting to whichever clock is actually running instead
diff --git a/src/domain/routines.test.ts b/src/domain/routines.test.ts
index fe046c2..c0bdb43 100644
--- a/src/domain/routines.test.ts
+++ b/src/domain/routines.test.ts
@@ -21,7 +21,7 @@ import { createItem } from './factories';
 import { isSaturated } from './scoring';
 import { seedPathways } from './pathwaySeed';
 import { STRAND_TO_FOCUS } from './labels';
-import type { Pathway, PathwayRoutine, PracticeItem, RoutineSegment } from './types';
+import type { Pathway, PathwayRoutine, PathwayStage, PracticeItem, RoutineSegment } from './types';
 
 const NOW = new Date('2026-06-18T12:00:00.000Z');
 
@@ -44,6 +44,19 @@ function routine(patch: Partial<PathwayRoutine> = {}): PathwayRoutine {
   };
 }
 
+function stage(patch: Partial<PathwayStage> = {}): PathwayStage {
+  return {
+    id: 's1',
+    pathwayId: 'p1',
+    code: '1',
+    title: 'Stage',
+    order: 0,
+    createdAt: NOW.toISOString(),
+    updatedAt: NOW.toISOString(),
+    ...patch,
+  };
+}
+
 describe('segmentsForRun (short on time)', () => {
   const segments: RoutineSegment[] = [
     { label: 'A', minutes: 1, essential: true },
@@ -336,7 +349,7 @@ describe('the binding invariant: a bound itemId never dangles', () => {
       updatedAt: NOW.toISOString(),
     };
 
-    const out = retargetRoutineInstrument(r, 'guitar', [setarItem, guitarItem], pathway, NOW);
+    const out = retargetRoutineInstrument(r, 'guitar', [setarItem, guitarItem], pathway, stage(), NOW);
 
     expect(out.instrumentId).toBe('guitar');
     expect(out.segments[0].itemId).toBeUndefined(); // setar item no longer matches
@@ -368,7 +381,7 @@ describe('the binding invariant: a bound itemId never dangles', () => {
       updatedAt: NOW.toISOString(),
     };
 
-    const out = retargetRoutineInstrument(r, undefined, [guitarItem], pathway, NOW);
+    const out = retargetRoutineInstrument(r, undefined, [guitarItem], pathway, stage(), NOW);
 
     expect(out.instrumentId).toBeUndefined();
     expect(out.segments[0].itemId).toBeUndefined(); // no instrument can match a bound item
@@ -386,10 +399,40 @@ describe('the binding invariant: a bound itemId never dangles', () => {
       updatedAt: NOW.toISOString(),
     };
 
-    const out = retargetRoutineInstrument(r, undefined, [], generalPathway, NOW);
+    const out = retargetRoutineInstrument(r, undefined, [], generalPathway, stage({ pathwayId: 'p-general' }), NOW);
 
     expect(out.instrumentId).toBeUndefined();
     expect(out.pathwayId).toBe('p-general');
     expect(out.stageId).toBe('s1');
   });
+
+  it('clears a placement pointing at a pathway that no longer resolves, instead of treating it as an unscoped General pathway', () => {
+    // A pathwayId that no longer resolves to a real pathway must not be
+    // treated as an unscoped (therefore "compatible") General pathway just
+    // because the caller's lookup came back undefined.
+    const r = routine({ instrumentId: 'guitar', pathwayId: 'missing', stageId: 's1' });
+
+    const out = retargetRoutineInstrument(r, 'guitar', [], undefined, stage(), NOW);
+
+    expect(out.pathwayId).toBeUndefined();
+    expect(out.stageId).toBeUndefined();
+  });
+
+  it('clears a stageId that belongs to a different pathway while keeping a still-valid pathwayId', () => {
+    const r = routine({ instrumentId: 'guitar', pathwayId: 'p1', stageId: 's-other' });
+    const pathway: Pathway = {
+      id: 'p1',
+      instrumentId: 'guitar',
+      name: 'Guitar path',
+      order: 0,
+      createdAt: NOW.toISOString(),
+      updatedAt: NOW.toISOString(),
+    };
+    const foreignStage = stage({ id: 's-other', pathwayId: 'p-other' });
+
+    const out = retargetRoutineInstrument(r, 'guitar', [], pathway, foreignStage, NOW);
+
+    expect(out.pathwayId).toBe('p1'); // the pathway itself is still real and compatible
+    expect(out.stageId).toBeUndefined(); // but the stage never belonged to it
+  });
 });
diff --git a/src/domain/routines.ts b/src/domain/routines.ts
index 9dae6c0..b4782f5 100644
--- a/src/domain/routines.ts
+++ b/src/domain/routines.ts
@@ -6,6 +6,7 @@ import type {
   ISODateTime,
   Pathway,
   PathwayRoutine,
+  PathwayStage,
   PracticeBlock,
   PracticeItem,
   RoutineSegment,
@@ -259,8 +260,8 @@ export function detachIncompatibleRoutinesForPathway(
 /**
  * Enforce the binding + placement invariants against a target instrument:
  * clear item bindings that don't belong to it, and detach the routine from
- * its pathway/stage placement if that placement is no longer compatible.
- * The pathway's own instrument is never touched.
+ * its pathway/stage placement if that placement is no longer compatible or
+ * no longer real. The pathway's own instrument is never touched.
  *
  * This is the one place those invariants are checked, so the store calls it
  * unconditionally on every create and every save — not only when the
@@ -269,26 +270,38 @@ export function detachIncompatibleRoutinesForPathway(
  * legitimately unscoped (a General-pathway routine, or one a v11 migration
  * correctly declined to invent an instrument for), and no item can match
  * "no instrument", so every binding is cleared in that case.
+ *
+ * `pathway`/`stage` are the caller's live lookups by the routine's own
+ * `pathwayId`/`stageId` — never trusted just because those ids are set. A
+ * `pathwayId` that no longer resolves (deleted, or never real) can never be
+ * a valid placement, so it clears the whole placement rather than being
+ * preserved as an undetectable dangling reference. A `stageId` is only kept
+ * when it resolves AND actually belongs to that same pathway — a stage
+ * lookup that resolves to a different pathway's stage is cleared on its own,
+ * leaving an otherwise-valid pathwayId placement intact.
  */
 export function retargetRoutineInstrument(
   routine: PathwayRoutine,
   newInstrumentId: ID | undefined,
   items: PracticeItem[],
   pathway: Pathway | undefined,
+  stage: PathwayStage | undefined,
   now: Date,
 ): PathwayRoutine {
   const byId = new Map(items.map((i) => [i.id, i]));
   const segments = routine.segments.map((s) =>
     s.itemId && byId.get(s.itemId)?.instrumentId !== newInstrumentId ? { ...s, itemId: undefined } : s,
   );
-  const stillPlaced = placementCompatible(newInstrumentId, pathway?.instrumentId);
+  const pathwayReal = routine.pathwayId === undefined || pathway !== undefined;
+  const stillPlaced = pathwayReal && placementCompatible(newInstrumentId, pathway?.instrumentId);
+  const stageBelongs = routine.stageId === undefined || (stage !== undefined && stage.pathwayId === routine.pathwayId);
   return touchRoutine(
     {
       ...routine,
       instrumentId: newInstrumentId,
       segments,
       pathwayId: stillPlaced ? routine.pathwayId : undefined,
-      stageId: stillPlaced ? routine.stageId : undefined,
+      stageId: stillPlaced && stageBelongs ? routine.stageId : undefined,
     },
     now,
   );
diff --git a/src/pages/RoutineRunner.tsx b/src/pages/RoutineRunner.tsx
index c8b378a..21d9722 100644
--- a/src/pages/RoutineRunner.tsx
+++ b/src/pages/RoutineRunner.tsx
@@ -72,9 +72,18 @@ export default function RoutineRunner() {
   // (so the same interval can never be logged twice), but without this
   // redirect the "begin one" effect below would just no-op forever, leaving
   // the user stranded on a blank screen instead of back at their block.
+  // Unconditional on isMine: the guards above make "this routine is mine AND
+  // an ordinary block also exists" unreachable from any in-app action, so the
+  // only way here is a persisted dual-clock state from before those guards —
+  // which the store's hydration `merge` freezes rather than deletes. Without
+  // this redirect, `isMine` would keep showing this frozen routine with a
+  // Resume button that silently no-ops (resumeRoutineRun refuses while
+  // `active` exists). Sending the user to resolve the block first, same as
+  // any genuinely concurrent case, gives a single deterministic way out
+  // instead of a dead button.
   useEffect(() => {
-    if (active && !isMine) navigate('/active', { replace: true });
-  }, [active, isMine, navigate]);
+    if (active) navigate('/active', { replace: true });
+  }, [active, navigate]);
 
   // Nothing running yet for this routine: begin one.
   useEffect(() => {
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index 65d20ef..18b9be6 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -1206,7 +1206,8 @@ export const useStore = create<StoreState>()(
         // invariant enforcement updateRoutine applies on every save.
         const { db } = get();
         const pathway = draft.pathwayId ? db.pathways.find((p) => p.id === draft.pathwayId) : undefined;
-        const routine = retargetRoutineInstrument(draft, draft.instrumentId, db.items, pathway, now);
+        const stage = draft.stageId ? db.pathwayStages.find((st) => st.id === draft.stageId) : undefined;
+        const routine = retargetRoutineInstrument(draft, draft.instrumentId, db.items, pathway, stage, now);
         set((s) => ({ db: { ...s.db, pathwayRoutines: [...s.db.pathwayRoutines, routine] } }));
         return routine.id;
       },
@@ -1234,7 +1235,8 @@ export const useStore = create<StoreState>()(
               // changed — rather than trusting whatever the form happened to
               // submit.
               const pathway = merged.pathwayId ? s.db.pathways.find((p) => p.id === merged.pathwayId) : undefined;
-              return retargetRoutineInstrument(merged, merged.instrumentId, s.db.items, pathway, now);
+              const stage = merged.stageId ? s.db.pathwayStages.find((st) => st.id === merged.stageId) : undefined;
+              return retargetRoutineInstrument(merged, merged.instrumentId, s.db.items, pathway, stage, now);
             }),
           },
         }));
@@ -1373,7 +1375,41 @@ export const useStore = create<StoreState>()(
       },
       merge: (persisted, current) => {
         const p = (persisted ?? {}) as Partial<StoreState>;
-        return { ...current, ...p, db: p.db ?? current.db };
+        const merged = { ...current, ...p, db: p.db ?? current.db };
+        // The start/resume guards keep active/activeRoutine from BOTH being
+        // set going forward, but a device that persisted a dual-running
+        // state before those guards existed reaches this merge unchecked —
+        // hydration is the one place ALL persisted state re-enters the
+        // store, so it's the one place left to close. Passing both straight
+        // through would let each keep ticking live from its own timestamp
+        // and double-log the same wall-clock interval, exactly the bug the
+        // guards exist to prevent. Freeze both (the same transform
+        // pauseSession/pauseRoutineRun already do) rather than discarding
+        // either: nothing already elapsed is lost, neither clock advances
+        // further on its own, and the ordinary finish/discard flow is what
+        // the user resolves one with before the guards allow resuming or
+        // starting the other.
+        if (merged.active && merged.activeRoutine) {
+          const now = new Date();
+          merged.active = {
+            ...merged.active,
+            accumulatedSeconds: sessionElapsedSeconds(merged.active, now),
+            running: false,
+            segmentStartedAt: undefined,
+          };
+          merged.activeRoutine = {
+            ...merged.activeRoutine,
+            accumulatedSeconds: runElapsedSeconds(
+              merged.activeRoutine.accumulatedSeconds,
+              merged.activeRoutine.runningSince,
+              merged.activeRoutine.running,
+              now,
+            ),
+            running: false,
+            runningSince: undefined,
+          };
+        }
+        return merged;
       },
     },
   ),
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

## Review actions have honest, distinct semantics

Practising (closing a block) is the ONLY thing that completes a review and advances
SM‑2. "Not now" hides a due review for the rest of today (no schedule change). Snooze
(+2d) genuinely moves the due date on both the review and the item — never fabricate a
result, and never leave a stale overdue item after an action. The Finish button freezes
the clock (`pauseSession`) before the close screen; reflection time is not counted.

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
fields must stay direction-aware; `unicode-bidi: plaintext` handles this globally), then
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
Latin dastgāh names. All Farsi surfaces use `dir="auto"` + the global
`unicode-bidi: plaintext`.

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
  recommendation stays above the fold at 390×844 (verified). It becomes "Resume your plan"
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

## When you add a feature

1. Add/extend the **types** in `src/domain/types.ts` and bump `SCHEMA_VERSION` if the
   persisted shape changes (add a migration in the store's `persist` config).
2. Put the logic in a **pure domain module** with **tests** (`*.test.ts`). The required
   coverage — priority scoring, recommendation selection, review scheduling, stat
   updates, saturation — must stay green.
3. Only then wire up the UI.
4. Run `npm run build`, `npm run lint`, `npm test` and fix everything before finishing.

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

### CLAUDE.md

```
# CLAUDE.md — development rules for Practice Compass

This file is the contract for anyone (human or AI) extending this app. Read it before
adding features. The whole value of the tool comes from what it *refuses* to do.

## The one rule above all

Preserve the core loop: **one item · one mode · one focus · one result · one next action.**
If a change blurs that loop or adds a second thing to think about per step, it's wrong —
even if it's "useful".

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

## Review actions have honest, distinct semantics

Practising (closing a block) is the ONLY thing that completes a review and advances
SM‑2. "Not now" hides a due review for the rest of today (no schedule change). Snooze
(+2d) genuinely moves the due date on both the review and the item — never fabricate a
result, and never leave a stale overdue item after an action. The Finish button freezes
the clock (`pauseSession`) before the close screen; reflection time is not counted.

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
fields must stay direction-aware; `unicode-bidi: plaintext` handles this globally), then
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
Latin dastgāh names. All Farsi surfaces use `dir="auto"` + the global
`unicode-bidi: plaintext`.

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
  recommendation stays above the fold at 390×844 (verified). It becomes "Resume your plan"
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

## When you add a feature

1. Add/extend the **types** in `src/domain/types.ts` and bump `SCHEMA_VERSION` if the
   persisted shape changes (add a migration in the store's `persist` config).
2. Put the logic in a **pure domain module** with **tests** (`*.test.ts`). The required
   coverage — priority scoring, recommendation selection, review scheduling, stat
   updates, saturation — must stay green.
3. Only then wire up the UI.
4. Run `npm run build`, `npm run lint`, `npm test` and fix everything before finishing.

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

### src/domain/routines.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  aggregateItemMinutes,
  applyRoutineRun,
  detachIncompatibleRoutinesForPathway,
  detachRoutinesFromPathway,
  detachRoutinesFromStage,
  duplicateRoutineData,
  locateClock,
  retargetRoutineInstrument,
  routinesForInstrument,
  runElapsedSeconds,
  segmentsForRun,
  skipCurrentSegment,
  toRunSegments,
  unbindItemFromRoutines,
  unbindItemWhereInstrumentMismatch,
  type RunSegment,
} from './routines';
import { createItem } from './factories';
import { isSaturated } from './scoring';
import { seedPathways } from './pathwaySeed';
import { STRAND_TO_FOCUS } from './labels';
import type { Pathway, PathwayRoutine, PathwayStage, PracticeItem, RoutineSegment } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

function item(patch: Partial<PracticeItem> = {}): PracticeItem {
  return { ...createItem({ instrumentId: 'guitar', title: 'Test item' }, NOW), ...patch };
}

function routine(patch: Partial<PathwayRoutine> = {}): PathwayRoutine {
  return {
    id: 'r1',
    instrumentId: 'guitar',
    pathwayId: 'p1',
    stageId: 's1',
    name: 'Routine',
    segments: [],
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...patch,
  };
}

function stage(patch: Partial<PathwayStage> = {}): PathwayStage {
  return {
    id: 's1',
    pathwayId: 'p1',
    code: '1',
    title: 'Stage',
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...patch,
  };
}

describe('segmentsForRun (short on time)', () => {
  const segments: RoutineSegment[] = [
    { label: 'A', minutes: 1, essential: true },
    { label: 'B', minutes: 2 },
    { label: 'C', minutes: 1, essential: true },
  ];

  it('drops non-essential segments when short on time is chosen', () => {
    const out = segmentsForRun(segments, true);
    expect(out.map((s) => s.label)).toEqual(['A', 'C']);
  });

  it('keeps every segment when short on time is not chosen', () => {
    const out = segmentsForRun(segments, false);
    expect(out).toEqual(segments);
  });
});

describe('routinesForInstrument', () => {
  it('offers only routines for the session instrument', () => {
    const setarRoutine = routine({ id: 'r-setar', instrumentId: 'setar' });
    const guitarRoutine = routine({ id: 'r-guitar', instrumentId: 'guitar' });
    expect(routinesForInstrument([setarRoutine, guitarRoutine], 'setar')).toEqual([setarRoutine]);
  });
});

describe('the real seeded CGS Stage 1 fixture (13 segments, one item repeated 4x)', () => {
  // Bind every "Chunk chords (right hand only)" segment (the fixture's own
  // repeated label) to one item — everything else stays unbound.
  const seeded = seedPathways({ guitar: 'guitar', setar: '', tar: '' }, NOW);
  const stage1 = seeded.pathwayRoutines.find((r) => r.name === 'Stage 1 routine · 20 min')!;
  const CHUNK_CHORDS_ITEM = 'item-chunk-chords';
  const boundSegments: RoutineSegment[] = stage1.segments.map((s) =>
    s.label === 'Chunk chords (right hand only)' ? { ...s, itemId: CHUNK_CHORDS_ITEM } : s,
  );
  const runSegments = toRunSegments(boundSegments);
  const totalSeconds = runSegments.reduce((sum, s) => sum + s.seconds, 0);

  it('aggregates a repeated segment into one block per item, not one per segment', () => {
    const minutes = aggregateItemMinutes(runSegments, totalSeconds);
    // Four "Chunk chords" segments at 1 authored minute each, played through.
    expect(minutes.size).toBe(1);
    expect(minutes.get(CHUNK_CHORDS_ITEM)).toBe(4);
  });

  it('leaves an item unsaturated after a routine that repeats it four times', () => {
    const chunkChordsItem = item({ id: CHUNK_CHORDS_ITEM });
    const outcome = applyRoutineRun(runSegments, totalSeconds, [chunkChordsItem], new Map(), NOW);
    expect(outcome.blocks).toHaveLength(1);
    expect(outcome.blocks[0].durationMinutes).toBe(4);
    // Per-segment blocks (the collision this lane exists to avoid) would trip
    // isSaturated's 3-in-48-hours rule immediately; one aggregated block does not.
    expect(isSaturated(outcome.blocks, NOW)).toBe(false);
    expect(outcome.items[0].saturationWarning).toBe(false);
  });
});

describe('applyRoutineRun: honest, unlogged practice', () => {
  it('records routine minutes without completing a review or advancing SM-2', () => {
    const original = item({
      srReps: 5,
      srEase: 2.1,
      srIntervalDays: 10,
      nextReviewDate: '2026-09-01',
      timesPractised: 2,
      totalMinutes: 20,
    });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 300 }];
    const outcome = applyRoutineRun(segs, 300, [original], new Map(), NOW);

    expect(outcome.blocks).toHaveLength(1);
    expect(outcome.blocks[0].result).toBe('not_logged');
    expect(outcome.blocks[0].createdReview).toBe(false);

    const updated = outcome.items[0];
    expect(updated.srReps).toBe(5);
    expect(updated.srEase).toBe(2.1);
    expect(updated.srIntervalDays).toBe(10);
    expect(updated.nextReviewDate).toBe('2026-09-01');
    expect(updated.timesPractised).toBe(3);
    expect(updated.totalMinutes).toBe(25);
  });

  it("keeps the item's previous result after an unlogged routine block", () => {
    const original = item({ lastResult: 'stable_alone' });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 60 }];
    const outcome = applyRoutineRun(segs, 60, [original], new Map(), NOW);
    expect(outcome.items[0].lastResult).toBe('stable_alone');
  });

  it('gives a routine block the same mode and focus as starting the item directly', () => {
    // status 'usable' -> mode 'integrate'; no primaryFocus but a strand -> STRAND_TO_FOCUS fallback.
    const original = item({ status: 'usable', primaryFocus: undefined, strand: 'chords', materialId: 'mat-1' });
    const segs: RunSegment[] = [{ itemId: original.id, seconds: 120 }];
    const outcome = applyRoutineRun(segs, 120, [original], new Map(), NOW);
    const block = outcome.blocks[0];
    expect(block.mode).toBe('integrate');
    expect(block.focus).toBe(STRAND_TO_FOCUS.chords); // the strand fallback, not 'other'
    expect(block.materialId).toBe('mat-1');
    expect(block.instrumentId).toBe(original.instrumentId);
  });
});

describe('the wall clock: reads real elapsed time, not a tick count', () => {
  it('derives remaining time from the wall clock rather than tick count', () => {
    const start = '2026-06-18T12:00:00.000Z';
    const later = new Date('2026-06-18T12:02:10.000Z'); // 130s later, no ticks counted
    expect(runElapsedSeconds(10, start, true, later)).toBe(140); // 10 accumulated + 130 live
  });

  it('excludes paused time from a routine\'s recorded minutes', () => {
    const segs: RunSegment[] = [{ itemId: 'i1', seconds: 300 }]; // one 5-minute segment
    // Ran 60s, then paused — accumulated freezes at 60 regardless of real time passing.
    const pausedElapsed = runElapsedSeconds(60, undefined, false, new Date('2026-06-18T12:10:00.000Z'));
    expect(pausedElapsed).toBe(60);
    const pausedClock = locateClock(segs, pausedElapsed);
    expect(pausedClock.segIndex).toBe(0);
    expect(pausedClock.secondsLeft).toBe(240); // the pause did not consume the segment

    // Resume and run 60s more — only running time is added.
    const resumedElapsed = runElapsedSeconds(60, '2026-06-18T12:10:00.000Z', true, new Date('2026-06-18T12:11:00.000Z'));
    expect(resumedElapsed).toBe(120);
    expect(aggregateItemMinutes(segs, resumedElapsed).get('i1')).toBe(2); // 120s, not 420s
  });

  it('catches up across multiple segment boundaries after a long background interval', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
      { itemId: 'c', seconds: 60 },
    ];
    // Locked for long enough to pass segments a and b entirely, landing 10s into c.
    const clock = locateClock(segs, 130);
    expect(clock.segIndex).toBe(2);
    expect(clock.segElapsedSeconds).toBe(10);
    expect(clock.secondsLeft).toBe(50);
    expect(clock.finished).toBe(false);
  });

  it("records a shortened segment's real time and a completed segment's full duration", () => {
    const segs: RunSegment[] = [
      { itemId: 'short', seconds: 180 }, // authored 3 min
      { itemId: 'full', seconds: 120 }, // authored 2 min
    ];
    // Cut the first segment short after 60s (Skip).
    const clamped = skipCurrentSegment(segs, 60);
    expect(clamped[0].seconds).toBe(60);
    // The second segment then plays all the way through.
    const finalElapsed = 60 + 120; // 60s (clamped first) + full 120s second
    const minutes = aggregateItemMinutes(clamped, finalElapsed);
    expect(minutes.get('short')).toBe(1); // 60s -> 1 min, not the authored 3
    expect(minutes.get('full')).toBe(2); // full 120s authored duration
  });

  // The property RoutineRunner's single completion effect relies on to catch
  // EVERY way a run can end (natural tick, background catch-up, or Skip) in
  // one place: skipping the run's last remaining segment must make the very
  // next locateClock call report `finished`, with no separate "did skip end
  // it" signal needed. A store-level fix once called finishRoutine() directly
  // from inside the skip action instead of trusting this property — bypassing
  // the component's result snapshot and leaving the screen blank.
  it('skipping the last segment finishes the run immediately', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
    ];
    // 70s in: segment b (the last one) is 10s underway when Skip is tapped.
    const afterSkip = skipCurrentSegment(segs, 70);
    expect(locateClock(afterSkip, 70).finished).toBe(true);
  });

  it('skipping a middle segment does not finish the run, and lands cleanly at the start of the next one', () => {
    const segs: RunSegment[] = [
      { itemId: 'a', seconds: 60 },
      { itemId: 'b', seconds: 60 },
      { itemId: 'c', seconds: 60 },
    ];
    // 20s into segment a (the first, not last) when Skip is tapped.
    const afterSkip = skipCurrentSegment(segs, 20);
    const clock = locateClock(afterSkip, 20);
    expect(clock.finished).toBe(false);
    expect(clock.segIndex).toBe(1); // landed on b
    expect(clock.segElapsedSeconds).toBe(0); // b starts fresh, no carryover
  });

  it('skipping the single segment of a one-segment run finishes it (the boundary both routines and short-on-time single-essential-segment runs can hit)', () => {
    const segs: RunSegment[] = [{ itemId: 'only', seconds: 60 }];
    const afterSkip = skipCurrentSegment(segs, 5);
    expect(locateClock(afterSkip, 5).finished).toBe(true);
  });
});

describe('aggregateItemMinutes: the whole-minute convention, at its edges', () => {
  it('never records a block for an item with exactly zero elapsed time', () => {
    const segs: RunSegment[] = [{ itemId: 'never-reached', seconds: 60 }];
    // The run ends before this segment's boundary is ever reached.
    expect(aggregateItemMinutes(segs, 0).has('never-reached')).toBe(false);
  });

  it('rounds any positive elapsed time up to the 1-minute floor, never discarding it', () => {
    const segs: RunSegment[] = [{ itemId: 'brief', seconds: 60 }];
    // Only 8 real seconds elapsed (e.g. skipped almost immediately) — well
    // under a minute, but genuinely practised, so it must still get a block.
    const minutes = aggregateItemMinutes(segs, 8);
    expect(minutes.get('brief')).toBe(1); // CloseBlock's Math.max(1, Math.round(secs/60))
  });
});

describe('duplicateRoutine: an independent copy', () => {
  it('duplicates a routine as an independent copy', () => {
    const original = routine({ segments: [{ label: 'A', minutes: 1 }] });
    const copy = duplicateRoutineData(original, 1, NOW);

    expect(copy.id).not.toBe(original.id);
    expect(copy.segments).not.toBe(original.segments);

    copy.segments[0].label = 'Edited';
    expect(original.segments[0].label).toBe('A');
  });
});

describe('detach vs delete on pathway/stage removal', () => {
  it('detaches a routine when its pathway is deleted instead of deleting it', () => {
    const r = routine({ pathwayId: 'p1', stageId: 's1' });
    const out = detachRoutinesFromPathway([r], 'p1', NOW);
    expect(out).toHaveLength(1);
    expect(out[0].pathwayId).toBeUndefined();
    expect(out[0].stageId).toBeUndefined();
  });

  it('keeps a routine in its pathway when only its stage is deleted', () => {
    const r = routine({ pathwayId: 'p1', stageId: 's1' });
    const out = detachRoutinesFromStage([r], 's1', NOW);
    expect(out).toHaveLength(1);
    expect(out[0].pathwayId).toBe('p1');
    expect(out[0].stageId).toBeUndefined();
  });
});

describe('the binding invariant: a bound itemId never dangles', () => {
  it('unbinds a deleted item from routine segments without removing the segment', () => {
    const r = routine({
      segments: [
        { label: 'Bound', minutes: 3, itemId: 'gone' },
        { label: 'Unbound', minutes: 2 },
      ],
    });
    const out = unbindItemFromRoutines([r], 'gone', NOW);
    expect(out[0].segments).toHaveLength(2);
    expect(out[0].segments[0].itemId).toBeUndefined();
    expect(out[0].segments[0].label).toBe('Bound');
    expect(out[0].segments[0].minutes).toBe(3);
  });

  it('unbinds an item whose instrument no longer matches the routine', () => {
    const mismatched = routine({ id: 'r-guitar', instrumentId: 'guitar', segments: [{ label: 'A', minutes: 1, itemId: 'x' }] });
    const matching = routine({ id: 'r-setar', instrumentId: 'setar', segments: [{ label: 'B', minutes: 1, itemId: 'x' }] });
    const out = unbindItemWhereInstrumentMismatch([mismatched, matching], 'x', 'setar', NOW);
    expect(out.find((r) => r.id === 'r-guitar')!.segments[0].itemId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-setar')!.segments[0].itemId).toBe('x'); // left intact
  });

  it('detaches an incompatible routine when its pathway changes instrument', () => {
    const compatible = routine({ id: 'r-guitar', instrumentId: 'guitar', pathwayId: 'p1', stageId: 's1' });
    const incompatible = routine({ id: 'r-setar', instrumentId: 'setar', pathwayId: 'p1', stageId: 's1' });
    const out = detachIncompatibleRoutinesForPathway([compatible, incompatible], 'p1', 'guitar', NOW);
    expect(out.find((r) => r.id === 'r-setar')!.pathwayId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-setar')!.stageId).toBeUndefined();
    expect(out.find((r) => r.id === 'r-guitar')!.pathwayId).toBe('p1'); // still compatible, still placed
  });

  it("clears incompatible bindings and placement when a routine changes instrument", () => {
    const setarItem = item({ id: 'item-setar', instrumentId: 'setar' });
    const guitarItem = item({ id: 'item-guitar', instrumentId: 'guitar' });
    const r = routine({
      instrumentId: 'setar',
      pathwayId: 'p1',
      stageId: 's1',
      segments: [
        { label: 'A', minutes: 1, itemId: 'item-setar' },
        { label: 'B', minutes: 1, itemId: 'item-guitar' },
      ],
    });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'setar',
      name: 'Setar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, 'guitar', [setarItem, guitarItem], pathway, stage(), NOW);

    expect(out.instrumentId).toBe('guitar');
    expect(out.segments[0].itemId).toBeUndefined(); // setar item no longer matches
    expect(out.segments[1].itemId).toBe('item-guitar'); // guitar item still matches
    expect(out.pathwayId).toBeUndefined(); // pathway is still 'setar' — now incompatible
    expect(out.stageId).toBeUndefined();
    // The pathway itself is never rewritten.
    expect(pathway.instrumentId).toBe('setar');
  });

  it('clears every binding and detaches from a specific-instrument pathway when the target instrument is undefined', () => {
    // The store calls retargetRoutineInstrument on EVERY save, not only when
    // the instrument changed — this is what stops a form from persisting a
    // mismatched itemId or placement on an unchanged instrument, and what
    // lets a routine go (or stay) honestly unscoped without inventing one.
    const guitarItem = item({ id: 'item-guitar', instrumentId: 'guitar' });
    const r = routine({
      instrumentId: 'guitar',
      pathwayId: 'p1',
      stageId: 's1',
      segments: [{ label: 'A', minutes: 1, itemId: 'item-guitar' }],
    });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'guitar',
      name: 'Guitar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, undefined, [guitarItem], pathway, stage(), NOW);

    expect(out.instrumentId).toBeUndefined();
    expect(out.segments[0].itemId).toBeUndefined(); // no instrument can match a bound item
    expect(out.pathwayId).toBeUndefined(); // the guitar pathway no longer matches
    expect(out.stageId).toBeUndefined();
  });

  it('stays placed on a General (no-instrument) pathway when the target instrument is undefined', () => {
    const r = routine({ instrumentId: undefined, pathwayId: 'p-general', stageId: 's1', segments: [] });
    const generalPathway: Pathway = {
      id: 'p-general',
      name: 'General',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };

    const out = retargetRoutineInstrument(r, undefined, [], generalPathway, stage({ pathwayId: 'p-general' }), NOW);

    expect(out.instrumentId).toBeUndefined();
    expect(out.pathwayId).toBe('p-general');
    expect(out.stageId).toBe('s1');
  });

  it('clears a placement pointing at a pathway that no longer resolves, instead of treating it as an unscoped General pathway', () => {
    // A pathwayId that no longer resolves to a real pathway must not be
    // treated as an unscoped (therefore "compatible") General pathway just
    // because the caller's lookup came back undefined.
    const r = routine({ instrumentId: 'guitar', pathwayId: 'missing', stageId: 's1' });

    const out = retargetRoutineInstrument(r, 'guitar', [], undefined, stage(), NOW);

    expect(out.pathwayId).toBeUndefined();
    expect(out.stageId).toBeUndefined();
  });

  it('clears a stageId that belongs to a different pathway while keeping a still-valid pathwayId', () => {
    const r = routine({ instrumentId: 'guitar', pathwayId: 'p1', stageId: 's-other' });
    const pathway: Pathway = {
      id: 'p1',
      instrumentId: 'guitar',
      name: 'Guitar path',
      order: 0,
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
    };
    const foreignStage = stage({ id: 's-other', pathwayId: 'p-other' });

    const out = retargetRoutineInstrument(r, 'guitar', [], pathway, foreignStage, NOW);

    expect(out.pathwayId).toBe('p1'); // the pathway itself is still real and compatible
    expect(out.stageId).toBeUndefined(); // but the stage never belonged to it
  });
});
```

### src/domain/routines.ts

```
import { applyBlockStats } from './blocks';
import { defaultModeForStatus, focusForItem } from './defaults';
import { createBlock } from './factories';
import type {
  ID,
  ISODateTime,
  Pathway,
  PathwayRoutine,
  PathwayStage,
  PracticeBlock,
  PracticeItem,
  RoutineSegment,
} from './types';
import { newId, nowISO } from './util';

// ---------------------------------------------------------------------------
// Routines as ordinary editable data: which ones a session sees, how the
// short-on-time filter works, how the runner's wall clock derives the current
// segment, and how a run turns into real practice blocks — one per distinct
// bound item, carrying its actual elapsed running time. Also the binding and
// placement invariants that keep a bound itemId from ever dangling. Pure and
// tested here; the store and the runner stay thin call sites.
// ---------------------------------------------------------------------------

/** Segments to actually run: all of them, or (short on time) only the essential ones. */
export function segmentsForRun(segments: RoutineSegment[], shortOnTime: boolean): RoutineSegment[] {
  return shortOnTime ? segments.filter((s) => s.essential) : segments;
}

/** Routines the session instrument may practise right now. */
export function routinesForInstrument(routines: PathwayRoutine[], instrumentId: ID): PathwayRoutine[] {
  return routines.filter((r) => r.instrumentId === instrumentId);
}

// --- The wall-clock run clock ------------------------------------------------
//
// A run is driven by one monotonic number: total running seconds elapsed
// since it began (E), following the same accumulated + live-since-a-timestamp
// shape as sessionElapsedSeconds (useStore.ts) — pausing genuinely freezes it,
// resuming picks it back up, and a real background/lock interval is simply a
// bigger jump in E next time it's read. A segment's *effective* duration
// starts at its authored minutes and can only be shortened (by Skip, which
// clamps it to whatever has elapsed so far) — never lengthened — so "played
// through" and "cut short" fall out of the same arithmetic, and the current
// segment for any E is found by walking the (small) list of boundaries, which
// is what lets it land on a much later segment after a long interval instead
// of advancing one step at a time.

export interface RunSegment {
  itemId?: ID;
  /** Effective seconds for this run: authored minutes, or Skip-shortened. */
  seconds: number;
}

export function toRunSegments(segments: RoutineSegment[]): RunSegment[] {
  return segments.map((s) => ({ itemId: s.itemId, seconds: Math.max(0, Math.round(s.minutes * 60)) }));
}

/** Cumulative seconds at the START of each segment — length segments.length + 1. */
function boundaries(segments: RunSegment[]): number[] {
  const out = [0];
  for (const s of segments) out.push(out[out.length - 1] + s.seconds);
  return out;
}

export interface RoutineClock {
  /** Index of the segment E currently falls in, or segments.length once finished. */
  segIndex: number;
  /** Seconds already elapsed within the current segment. */
  segElapsedSeconds: number;
  /** Seconds left in the current segment (0 once finished). */
  secondsLeft: number;
  finished: boolean;
}

/** Seconds elapsed while running, given accumulated-before-pause + a live interval — the same shape as sessionElapsedSeconds, so background time is real time, not a fabricated tick count. */
export function runElapsedSeconds(
  accumulatedSeconds: number,
  runningSince: ISODateTime | undefined,
  running: boolean,
  now: Date,
): number {
  const live = running && runningSince ? (now.getTime() - new Date(runningSince).getTime()) / 1000 : 0;
  return Math.max(0, accumulatedSeconds + live);
}

/** Where the wall clock has landed for total elapsed E — jumps across as many boundaries as E demands, in one pass. */
export function locateClock(segments: RunSegment[], elapsedSeconds: number): RoutineClock {
  const bounds = boundaries(segments);
  const total = bounds[bounds.length - 1];
  const e = Math.max(0, elapsedSeconds);
  if (segments.length === 0 || e >= total) {
    return { segIndex: segments.length, segElapsedSeconds: 0, secondsLeft: 0, finished: true };
  }
  for (let i = 0; i < segments.length; i++) {
    if (e < bounds[i + 1]) {
      return { segIndex: i, segElapsedSeconds: e - bounds[i], secondsLeft: bounds[i + 1] - e, finished: false };
    }
  }
  return { segIndex: segments.length, segElapsedSeconds: 0, secondsLeft: 0, finished: true };
}

/** Cut the CURRENT segment short: clamp its effective duration to what has actually elapsed, so the unused remainder is never credited and the next segment starts fresh. A no-op once the run has already finished. */
export function skipCurrentSegment(segments: RunSegment[], elapsedSeconds: number): RunSegment[] {
  const bounds = boundaries(segments);
  const clock = locateClock(segments, elapsedSeconds);
  if (clock.finished) return segments;
  return segments.map((s, i) => (i === clock.segIndex ? { ...s, seconds: elapsedSeconds - bounds[i] } : s));
}

/** Seconds actually spent in one segment given the run's total elapsed E — 0 before it starts, its full effective duration once fully passed, partial while current. */
function segmentElapsed(seg: RunSegment, boundaryBefore: number, elapsedSeconds: number): number {
  return Math.max(0, Math.min(seg.seconds, elapsedSeconds - boundaryBefore));
}

/**
 * Minutes actually spent per bound item, aggregated across EVERY segment that
 * names it — never one entry per segment. Follows the app's existing
 * seconds-to-minutes convention exactly (CloseBlock.tsx's
 * `Math.max(1, Math.round(seconds / 60))`): zero elapsed time for an item
 * means it was never reached this run, so it gets no block at all — but ANY
 * positive elapsed time, however brief, rounds up to at least the 1-minute
 * floor rather than being discarded. A bound item that was genuinely
 * practised is never silently dropped for having too little time.
 */
export function aggregateItemMinutes(segments: RunSegment[], elapsedSeconds: number): Map<ID, number> {
  const bounds = boundaries(segments);
  const secondsByItem = new Map<ID, number>();
  segments.forEach((seg, i) => {
    if (!seg.itemId) return;
    const secs = segmentElapsed(seg, bounds[i], elapsedSeconds);
    secondsByItem.set(seg.itemId, (secondsByItem.get(seg.itemId) ?? 0) + secs);
  });
  const minutesByItem = new Map<ID, number>();
  for (const [itemId, secs] of secondsByItem) {
    if (secs > 0) minutesByItem.set(itemId, Math.max(1, Math.round(secs / 60)));
  }
  return minutesByItem;
}

// --- Turning a run into real practice blocks --------------------------------

export interface RoutineRunOutcome {
  /** One block per distinct bound item, never one per segment. */
  blocks: PracticeBlock[];
  /** Those items, with stats applied — the item's previous result and schedule survive untouched (result defaults to not_logged). */
  items: PracticeItem[];
}

/**
 * At most one block per distinct item touched this run, carrying its real
 * aggregated minutes. Mode/focus/materialId/instrumentId match exactly what
 * starting that item directly would use (useStore.ts's startItemSession), so
 * a routine block is indistinguishable from an ordinary one. No review is
 * scheduled and no SM-2 state is touched — the block's result stays the
 * factory default (`not_logged`), which the rest of the engine already
 * treats honestly everywhere it matters.
 */
export function applyRoutineRun(
  runSegments: RunSegment[],
  elapsedSeconds: number,
  items: PracticeItem[],
  existingBlocksByItem: Map<ID, PracticeBlock[]>,
  now: Date,
): RoutineRunOutcome {
  const minutesByItem = aggregateItemMinutes(runSegments, elapsedSeconds);
  const byId = new Map(items.map((i) => [i.id, i]));
  const blocks: PracticeBlock[] = [];
  const outItems: PracticeItem[] = [];
  for (const [itemId, minutes] of minutesByItem) {
    const item = byId.get(itemId);
    if (!item) continue; // deleted mid-run — the deletion already unbound it
    const block = createBlock(
      {
        practiceItemId: item.id,
        instrumentId: item.instrumentId,
        materialId: item.materialId,
        durationMinutes: minutes,
        mode: defaultModeForStatus(item.status),
        focus: focusForItem(item),
      },
      now,
    );
    blocks.push(block);
    outItems.push(
      applyBlockStats(item, block, {
        itemBlocksIncludingNew: [...(existingBlocksByItem.get(itemId) ?? []), block],
        now,
      }),
    );
  }
  return { blocks, items: outItems };
}

// --- The binding invariant: a bound itemId never dangles ---------------------

function touchRoutine(r: PathwayRoutine, now: Date): PathwayRoutine {
  return { ...r, updatedAt: nowISO(now) };
}

/** Item deletion: unbind it from every segment that named it. The segment survives as an unbound countdown — never removed. */
export function unbindItemFromRoutines(routines: PathwayRoutine[], itemId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) => {
    if (!r.segments.some((s) => s.itemId === itemId)) return r;
    return touchRoutine(
      { ...r, segments: r.segments.map((s) => (s.itemId === itemId ? { ...s, itemId: undefined } : s)) },
      now,
    );
  });
}

/** Item instrument change: unbind it only from routines whose instrument no longer matches — bindings on still-matching routines are left intact. */
export function unbindItemWhereInstrumentMismatch(
  routines: PathwayRoutine[],
  itemId: ID,
  newInstrumentId: ID,
  now: Date,
): PathwayRoutine[] {
  return routines.map((r) => {
    if (r.instrumentId === newInstrumentId) return r;
    if (!r.segments.some((s) => s.itemId === itemId)) return r;
    return touchRoutine(
      { ...r, segments: r.segments.map((s) => (s.itemId === itemId ? { ...s, itemId: undefined } : s)) },
      now,
    );
  });
}

/** A General (no-instrument) pathway accepts any routine; otherwise the two instruments must match exactly. */
function placementCompatible(routineInstrumentId: ID | undefined, pathwayInstrumentId: ID | undefined): boolean {
  return pathwayInstrumentId === undefined || routineInstrumentId === pathwayInstrumentId;
}

/** Pathway deletion: detach every routine placed in it (both pathwayId and stageId cleared) rather than deleting it. */
export function detachRoutinesFromPathway(routines: PathwayRoutine[], pathwayId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) =>
    r.pathwayId === pathwayId ? touchRoutine({ ...r, pathwayId: undefined, stageId: undefined }, now) : r,
  );
}

/** Stage deletion is not pathway deletion: clear only stageId, so the routine stays in the pathway it still belongs to. */
export function detachRoutinesFromStage(routines: PathwayRoutine[], stageId: ID, now: Date): PathwayRoutine[] {
  return routines.map((r) => (r.stageId === stageId ? touchRoutine({ ...r, stageId: undefined }, now) : r));
}

/** Pathway instrument change: detach any routine placed there that the new instrument makes incompatible — the routine's own instrument is never rewritten. */
export function detachIncompatibleRoutinesForPathway(
  routines: PathwayRoutine[],
  pathwayId: ID,
  newPathwayInstrumentId: ID | undefined,
  now: Date,
): PathwayRoutine[] {
  return routines.map((r) =>
    r.pathwayId === pathwayId && !placementCompatible(r.instrumentId, newPathwayInstrumentId)
      ? touchRoutine({ ...r, pathwayId: undefined, stageId: undefined }, now)
      : r,
  );
}

/**
 * Enforce the binding + placement invariants against a target instrument:
 * clear item bindings that don't belong to it, and detach the routine from
 * its pathway/stage placement if that placement is no longer compatible or
 * no longer real. The pathway's own instrument is never touched.
 *
 * This is the one place those invariants are checked, so the store calls it
 * unconditionally on every create and every save — not only when the
 * instrument actually changes — rather than trusting a form's bindings and
 * placement on faith. `newInstrumentId` may be undefined: a routine can be
 * legitimately unscoped (a General-pathway routine, or one a v11 migration
 * correctly declined to invent an instrument for), and no item can match
 * "no instrument", so every binding is cleared in that case.
 *
 * `pathway`/`stage` are the caller's live lookups by the routine's own
 * `pathwayId`/`stageId` — never trusted just because those ids are set. A
 * `pathwayId` that no longer resolves (deleted, or never real) can never be
 * a valid placement, so it clears the whole placement rather than being
 * preserved as an undetectable dangling reference. A `stageId` is only kept
 * when it resolves AND actually belongs to that same pathway — a stage
 * lookup that resolves to a different pathway's stage is cleared on its own,
 * leaving an otherwise-valid pathwayId placement intact.
 */
export function retargetRoutineInstrument(
  routine: PathwayRoutine,
  newInstrumentId: ID | undefined,
  items: PracticeItem[],
  pathway: Pathway | undefined,
  stage: PathwayStage | undefined,
  now: Date,
): PathwayRoutine {
  const byId = new Map(items.map((i) => [i.id, i]));
  const segments = routine.segments.map((s) =>
    s.itemId && byId.get(s.itemId)?.instrumentId !== newInstrumentId ? { ...s, itemId: undefined } : s,
  );
  const pathwayReal = routine.pathwayId === undefined || pathway !== undefined;
  const stillPlaced = pathwayReal && placementCompatible(newInstrumentId, pathway?.instrumentId);
  const stageBelongs = routine.stageId === undefined || (stage !== undefined && stage.pathwayId === routine.pathwayId);
  return touchRoutine(
    {
      ...routine,
      instrumentId: newInstrumentId,
      segments,
      pathwayId: stillPlaced ? routine.pathwayId : undefined,
      stageId: stillPlaced && stageBelongs ? routine.stageId : undefined,
    },
    now,
  );
}

/** An independent editable copy — new id, new segment objects, so editing the copy never touches the original. */
export function duplicateRoutineData(routine: PathwayRoutine, order: number, now: Date): PathwayRoutine {
  const ts = nowISO(now);
  return {
    ...routine,
    id: newId(),
    name: `${routine.name} (copy)`,
    segments: routine.segments.map((s) => ({ ...s })),
    order,
    createdAt: ts,
    updatedAt: ts,
  };
}
```

### src/pages/RoutineRunner.tsx

```
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { aggregateItemMinutes, locateClock, runElapsedSeconds, segmentsForRun, type RunSegment } from '../domain';
import { useStore } from '../store/useStore';
import { getItem } from '../store/lookups';
import { formatClock } from '../components/format';
import { CheckIcon, PauseIcon, PlayIcon } from '../components/icons';

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
            {[...recorded.entries()].map(([itemId, minutes]) => (
              <div key={itemId} className="row between">
                <span dir="auto" className="truncate">
                  {getItem(db, itemId)?.title ?? 'Item'}
                </span>
                <span className="tiny faint">{minutes} min</span>
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

  return (
    <div className="stack-lg" style={{ paddingTop: 'var(--space-4)', textAlign: 'center' }}>
      <header className="stack-sm">
        <div className="eyebrow">
          {stage ? `${stage.code} · ` : ''}
          {routine.name}
          {effectiveShortOnTime ? ' · short on time' : ''}
        </div>
        <div className="faint tiny">
          Segment {clock.segIndex + 1} of {authoredSegments.length}
          {seg.itemId ? '' : ' · warm-up — not logged as practice'}
        </div>
      </header>

      <div
        className="timer-ring"
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

      <div>
        <div className="title-md" style={{ fontSize: '1.2rem' }}>
          {seg.label}
        </div>
        {seg.itemId && (
          <div className="tiny faint" dir="auto">
            {getItem(db, seg.itemId)?.title}
          </div>
        )}
        {next && <div className="tiny faint" style={{ marginTop: 6 }}>Next: {next.label}</div>}
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

### src/store/useStore.ts

```
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearBlobs, deleteBlobsForOwner, idbStorage, storageWasEmpty } from './idb';
import { withRevision } from './revision';
import {
  applyBlockStats,
  applyRoutineRun,
  catalogForStage,
  isLosslesslyRemovable,
  computeReviewOutcome,
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
  retargetRoutineInstrument,
  runElapsedSeconds,
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
  type ReviewMode,
  type ReviewType,
  type RoutineSegment,
  type RunSegment,
  type SchedulingParams,
  type PlanSegment,
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
}

export function sessionElapsedSeconds(s: ActiveSession, now: Date = new Date()): number {
  const live = s.running && s.segmentStartedAt
    ? (now.getTime() - new Date(s.segmentStartedAt).getTime()) / 1000
    : 0;
  return Math.max(0, Math.floor(s.accumulatedSeconds + live));
}

/** A plan segment plus its live run status. */
export interface PlanSegmentState extends PlanSegment {
  status: 'pending' | 'done' | 'skipped';
}

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
}

/** Advance the pointer to the next still-pending segment (or one past the end). */
function advancePointer(segments: PlanSegmentState[], from: number): number {
  for (let i = from + 1; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  // Nothing pending after `from`; look from the start (skips may have been jumped).
  for (let i = 0; i < segments.length; i++) {
    if (segments[i].status === 'pending') return i;
  }
  return segments.length;
}

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
  scheduleReview: boolean;
  nextReviewDate?: ISODate;
  reviewType?: ReviewType;
  /** When set, written onto the item as its teacher question. */
  teacherQuestion?: string;
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
  teacherQuestion?: string;
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
  toggleAssignedForLesson: (itemId: ID) => void;
  /** Create a practice item from a stage's reference catalog entry; returns its id. */
  addFromCatalog: (stageId: ID, entryKey: string) => ID;
  /** Begin a session on an existing item (with smart defaults). */
  startItemSession: (itemId: ID) => void;

  // Session
  startSession: (input: StartSessionInput) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  setSessionNote: (note: string) => void;
  cancelSession: () => void;
  closeSession: (input: CloseSessionInput) => void;

  // Reviews
  completeReview: (id: ID, result?: BlockResult) => void;
  /** "Not now": hide a due review for the rest of today (no schedule change). */
  notNowReview: (id: ID) => void;
  /** Snooze: honestly move the due date N days from today (no SM-2 change). */
  snoozeReview: (id: ID, days?: number) => void;

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
        const { activePlan, db } = get();
        if (!activePlan) return;
        const seg = activePlan.segments[activePlan.pointer];
        if (!seg) return;
        const item = db.items.find((i) => i.id === seg.itemId);
        if (!item) {
          // The item was deleted since the plan was built — skip past it.
          get().skipPlanSegment();
          return;
        }
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
        set((s) => {
          if (!s.activePlan) return {};
          const segments = s.activePlan.segments.map((seg, i) =>
            i === s.activePlan!.pointer && seg.status === 'pending' ? { ...seg, status: 'skipped' as const } : seg,
          );
          return { activePlan: { ...s.activePlan, segments, pointer: advancePointer(segments, s.activePlan.pointer) } };
        }),

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
        // The lesson owns its attachments; linked items are never touched.
        void deleteBlobsForOwner(id);
        set((s) => ({
          db: {
            ...s.db,
            lessons: s.db.lessons.filter((l) => l.id !== id),
            attachments: s.db.attachments.filter((a) => a.ownerId !== id),
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
              if (write) next.nextReviewDate = write.nextReviewDate;
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
        void deleteBlobsForOwner(id);
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
            attachments: s.db.attachments.filter((a) => a.ownerId !== id),
            lessons: s.db.lessons.map((l) =>
              (l.itemIds ?? []).includes(id)
                ? touch({ ...l, itemIds: (l.itemIds ?? []).filter((x) => x !== id) }, now)
                : l,
            ),
            // The segment survives as an unbound countdown — never removed.
            pathwayRoutines: unbindItemFromRoutines(s.db.pathwayRoutines, id, now),
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

      toggleAssignedForLesson: (itemId) => {
        const now = new Date();
        set((s) => ({
          db: {
            ...s.db,
            items: s.db.items.map((i) =>
              i.id === itemId ? touch({ ...i, assignedForLesson: !i.assignedForLesson }, now) : i,
            ),
          },
        }));
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

      cancelSession: () => set({ active: null }),

      closeSession: (input) => {
        const now = new Date();
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
            createdReview: input.scheduleReview,
          },
          now,
        );

        // The one decision behind closing a block: does the item get a next
        // review at all, and — if so — the single date written to both the
        // item and its new Review row (§1.1–§1.3).
        const outcome = computeReviewOutcome({
          item,
          result: input.result,
          scheduleReview: input.scheduleReview,
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
          };
        }
        if (input.teacherQuestion !== undefined) {
          updatedItem = { ...updatedItem, teacherQuestion: input.teacherQuestion.trim() || undefined };
        }

        // Close any open reviews for this item; optionally schedule the next
        // from the SAME date just written onto the item (§1.2).
        const reviews = db.reviews.map((r) =>
          r.practiceItemId === item.id && !r.completedAt
            ? { ...r, completedAt: nowISO(now), result: input.result, updatedAt: nowISO(now) }
            : r,
        );
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
        let nextPlan = activePlan;
        if (activePlan) {
          const seg = activePlan.segments[activePlan.pointer];
          if (seg && seg.itemId === item.id && seg.status === 'pending') {
            const segments = activePlan.segments.map((s, i) =>
              i === activePlan.pointer ? { ...s, status: 'done' as const } : s,
            );
            nextPlan = { ...activePlan, segments, pointer: advancePointer(segments, activePlan.pointer) };
          }
        }

        set({
          db: {
            ...db,
            blocks: [...db.blocks, block],
            items: db.items.map((i) => (i.id === item.id ? updatedItem : i)),
            reviews,
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
              items: s.db.items.map((i) =>
                i.id === review.practiceItemId ? touch({ ...i, nextReviewDate: write.nextReviewDate }, now) : i,
              ),
            },
          };
        });
      },

      // --- Pathways --------------------------------------------------------

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
        set({ activeRoutine: { ...activeRoutine, segs } });
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

      importDB: (raw) => {
        const db = validateDB(raw);
        set({ db, active: null, activeRoutine: null });
      },

      resetDemo: () => {
        void clearBlobs();
        set({ db: createSeedDB(), active: null, activeRoutine: null });
      },

      clearAll: () => {
        void clearBlobs();
        set({ db: emptyDB(), active: null, activeRoutine: null });
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
        const merged = { ...current, ...p, db: p.db ?? current.db };
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

## Check against the contract

- [ ] **ac-1** — The collision this lane exists to avoid, tested against the real seeded fixture: a routine whose 13 segments repeat one item four times produces ONE block for that item, carrying the ACTUAL elapsed running time summed across all four visits — not four blocks, and not authored minutes taken on trust. _(proof: aggregates a repeated segment into one block per item, not one per segment)_
- [ ] **ac-2** — The consequence that proves it matters. After a single run of that routine the repeated item is NOT saturated — per-segment blocks would trip isSaturated's three-in-48-hours rule immediately and make the app penalise the user for following the syllabus. _(proof: leaves an item unsaturated after a routine that repeats it four times)_
- [ ] **ac-3** — A routine records honest time without touching the schedule: minutes and timesPractised move, but no review is completed and srReps, srEase and srIntervalDays are untouched, because the default result is not_logged. _(proof: records routine minutes without completing a review or advancing SM-2)_
- [ ] **ac-4** — The item's previously recorded result survives a routine run rather than being overwritten or invented — nothing about how the piece went is fabricated from time spent. _(proof: keeps the item's previous result after an unlogged routine block)_
- [ ] **ac-5** — The syllabus's asterisk rule, honoured: with short-on-time chosen, non-essential segments are dropped and the remaining minutes are reported honestly rather than silently rescaled. _(proof: drops non-essential segments when short on time is chosen)_
- [ ] **ac-6** — The discriminating partner to the check above: with short-on-time off, every segment survives in its authored order. Together they prove the filter is driven by the essential flag and nothing else. _(proof: keeps every segment when short on time is not chosen)_
- [ ] **ac-7** — The v11 migration, running inside the shared migrateToCurrent chain: an existing routine gains its instrumentId backfilled from the pathway it belonged to, and a database already at v11 passes through unchanged. _(proof: backfills a routine instrument from its pathway on the shared chain)_
- [ ] **ac-8** — A user's routine survives the removal of the pathway it was placed in — it is detached, not deleted — matching the rule already applied to items. _(proof: detaches a routine when its pathway is deleted instead of deleting it)_
- [ ] **ac-9** — Duplicate produces an independent editable copy: editing the copy's segments leaves the original untouched, which is the 'copy Stage 1 and adjust' workflow the syllabus describes. _(proof: duplicates a routine as an independent copy)_
- [ ] **ac-10** — Review §2.4: remaining time is derived from elapsed wall-clock time rather than from a count of ticks, so a run that was backgrounded for real minutes reports those minutes as gone. _(proof: derives remaining time from the wall clock rather than tick count)_
- [ ] **ac-11** — Scoping: only routines belonging to the session instrument are offered, so a Setar session never surfaces a guitar routine. _(proof: offers only routines for the session instrument)_
- [ ] **ac-12** — Paused time is not practice: a run that sits paused for several minutes records only the time the timer was actually running, and the pause does not consume the segment either. _(proof: excludes paused time from a routine's recorded minutes)_
- [ ] **ac-13** — The catch-up edge that a naive wall-clock rewrite fails: returning after the phone was locked for longer than the current segment lands the runner on the correct LATER segment, having advanced past every boundary that elapsed, rather than moving on by one. _(proof: catches up across multiple segment boundaries after a long background interval)_
- [ ] **ac-14** — A segment cut short contributes only the time actually spent, while one played through contributes its full authored duration — the discriminating pair that proves recorded time is measured, not assumed. _(proof: records a shortened segment's real time and a completed segment's full duration)_
- [ ] **ac-15** — No fabrication and no invalid scoping in the migration, across all three ways a pathway can fail to name a usable instrument: a General pathway with none, a legacy pathway carrying an empty-string id (reachable from migrateToV3's `?? ''`), and one whose id does not resolve in db.instruments. Each leaves the routine unscoped; only a pathway with a real, resolvable instrument backfills. _(proof: backfills only from a resolvable instrument and never invents one)_
- [ ] **ac-16** — Routine-created blocks are semantically indistinguishable from ordinary ones: mode, focus, materialId and instrumentId match exactly what starting that same item from its detail page would have produced, including the strand fallback for focus. _(proof: gives a routine block the same mode and focus as starting the item directly)_
- [ ] **ac-17** — The binding lifecycle, proved at its sharpest edge: deleting a bound item unbinds it from every routine segment while the segment itself survives as an unbound countdown, so no routine is silently shortened and no itemId dangles. _(proof: unbinds a deleted item from routine segments without removing the segment)_
- [ ] **ac-18** — The discriminating partner: changing a bound item's instrument unbinds it from routines that no longer match, while leaving bindings on matching routines intact. _(proof: unbinds an item whose instrument no longer matches the routine)_
- [ ] **ac-19** — An instrument change on a pathway detaches an incompatible placed routine from that pathway rather than rewriting the routine's own instrument. _(proof: detaches an incompatible routine when its pathway changes instrument)_
- [ ] **ac-20** — The routine-side half of the instrument lifecycle, proving both consequences at once: changing a routine's instrument clears the item bindings that no longer match AND detaches it from a pathway/stage whose instrument no longer matches, while leaving the pathway's own instrument untouched. _(proof: clears incompatible bindings and placement when a routine changes instrument)_
- [ ] **ac-21** — Stage deletion is not pathway deletion, and must be proved separately rather than inferred: deleting a stage keeps the routine AND its pathwayId, clearing only stageId, so the routine stays in the pathway it still belongs to. _(proof: keeps a routine in its pathway when only its stage is deleted)_
- [ ] **ac-22** — End to end in the running app. On Setar — which starts with no routines — use Today's plan card to create the first one, binding two segments to real items, then run it. Confirm: the empty state offered 'Create a routine' and preselected Setar; the timer keeps real time across locking the phone mid-segment and lands on the right segment; pausing does not burn time; after the run each bound item shows one block with the real aggregated minutes, its previous result unchanged, no new review, and the same mode and focus a normal start would give. Then run it again with 'short on time', and confirm the seeded guitar Stage 1 routine still behaves exactly as before. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/App.tsx matched changed file(s) src/App.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/store/useStore.ts matched changed file(s) src/pages/PathwayDetail.tsx, src/pages/RoutineRunner.tsx, src/pages/StageDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

Repertoire views (Pathways / My repertoire / Practice list) read PracticeItem fields this lane never alters; routine binding only adds/clears RoutineSegment.itemId elsewhere. No display or grouping logic touched.

## install-the-app-and-keep-it-current — unchanged

This lane never touches Settings.tsx or install/update UI; the shared /settings route is coincidental, not a real dependency.

## point-this-device-at-the-nas — unchanged

This lane never touches Settings.tsx or NAS base-URL config; the shared /settings route is coincidental, not a real dependency.

## prepare-for-the-next-class — unchanged

assignedForLesson/teacherQuestion and lesson-prep scoring are untouched; routine bindings only add/clear RoutineSegment.itemId and never read or write lesson-prep fields.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 code inferred

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 code inferred

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 code inferred

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 code inferred

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260828-routines-you-can-create-follow-on-any-in-d7c3' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-routines-you-can-create-follow-on-any-in-d7c3/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
