---
id: 20260910-every-recorded-minute-is-one-you-played--9ed1
contractId: 20260910-every-recorded-minute-is-one-you-played--9ed1
patchId: 527e64074c85a0a65e9380fa101353bf1f5786db
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: unfinished-session replacement atomicity
    summary: The sync baseline revision is captured after buildFullBackup returns,
      although buildFullBackup captures the database before awaiting attachment
      reads. A database mutation during that await can therefore be absent from
      the snapshot yet included in the recorded baseline revision, allowing the
      late guard to proceed and overwrite newly recorded practice.
    counterexample: Begin a pull with no active session. buildFullBackup captures
      the old db at backup.ts:107, then awaits allBlobs or blob encoding. Start
      and finish a practice block during that await, bumping rev.
      buildLocalSnapshot then records the new rev at githubSync.ts:168-169
      beside the old db snapshot. If the pull path is selected and no later
      mutation occurs, replacementRefusal sees current rev equal to
      decidedFromRev and importDB installs the incoming database, destroying the
      completed block.
  - family: revision-deferral retry
    summary: A revision raised during an automatic sync schedules one quiet-period
      retry, but syncNow discards that retry when the original sync is still
      running. If the original run later becomes deferred for that revision,
      neither the revision nor unfinished-session effects schedule another
      attempt, leaving sync permanently deferred.
    counterexample: Start a pull, then start and finish a block so rev changes and
      App.tsx schedules its single 30-second retry. Keep the original network or
      blob operation running beyond 30 seconds. The timer calls syncNow, which
      returns immediately because running is true at githubSync.ts:286. The
      original run then reaches the late revision guard and sets phase to
      deferred, but no unfinished session ever transitions from present to
      absent and rev does not change again. No further sync is scheduled.
  - family: instrument-balance percentage integrity
    summary: instrumentBalance fixes the denominator but independently rounds every
      row percentage. AC-13 and the documented invariant require emitted
      percentages to sum to 100, which independent rounding does not guarantee;
      the named test covers only a conveniently exact 60/40 split.
    counterexample: Supply three displayed instruments with one minute each plus any
      blocks for an omitted retired instrument. The filtered denominator is
      three minutes, so each displayed row becomes Math.round(100/3), or 33
      percent. The emitted percentages total 99 rather than 100.
createdAt: 2026-09-10T15:39:21.092Z
sealedAt: 2026-09-10T15:53:52.281Z
---

# Review: Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260910-every-recorded-minute-is-one-you-played--9ed1
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/16
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `527e64074c85a0a65e9380fa101353bf1f5786db`

## The Delta this change was framed from

# Every minute the app records is a minute you actually played, and every number it shows is derived from those minutes honestly. Two separate questions do that work and are never confused: whether an unfinished session EXISTS decides whether anything may replace your data, and whether its elapsed figure is still PLAUSIBLE decides only what minutes are proposed and whether it is worth pointing at. A heuristic about duration never becomes permission to discard practice.

Saving needs a result -- the six options are already on screen, and 'Save without a result' keeps not_logged deliberate rather than accidental. Underneath, at the one place every caller routes through, answering nothing no longer reads as declining: a close carrying no result leaves the item's review date exactly as it was and leaves its open review open, while genuinely declining still clears it. Closing an ABANDONED block proposes its own target rather than the fabricated figure and says plainly why, so a forgotten clock cannot write practice you did not do -- while ordinary overtime stays completely normal. Practising an item again shows the next action you chose last time, before you start playing.

And no unfinished session is ever destroyed by a replacement you did not aim at it -- running or paused, fresh or stale, ordinary or routine. Staleness decides the minutes proposed and raises the attention state; it never becomes permission to discard practice. Automatic sync defers quietly while practice is unfinished and retries the moment that session clears, whether you finished it or discarded it. A deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the block that is in the way -- never a silent no-op, never a silent discard. A stale session blocking sync says so on Today and in the sync notice, and Resume leads straight to Finish, correct the minutes, or Discard. When a replacement does happen, the running plan, today's dismissals and a session instrument the new database lacks are cleared in the same step -- at every one of the three places a database is installed, not just the import path.

And you can finally see how much you have practised: a compact minutes-and-blocks line for today and this week, low on Today and never above the recommendation, with today, this week and all time per instrument on Insights. Calendar figures, not rolling windows -- late last night belongs to yesterday and the week starts Monday. Neutral counts only, no target and no streak.

_approved · about "practise-todays-recommendation" step 7_

## Today

Step 7 records that saving a block completes any open review and schedules the next one 'on the date that was shown', and the flow ends 'recorded honestly: one block, one result, one next action -- and the item knows when it should come back.' Verified against the code at 0c6058e, four of those claims are false.

ONE RESULT is optional, and skipping it is destructive. Save is always enabled and `result` starts null. setReviewDate is reached only from pickResult or the manual date field, so with no result the date field stays empty, scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate: null } and CLEARS the item's date, and closeSession completes every open review for the item anyway. One skipped tap and the item silently leaves the review system: review closed, date erased, SM-2 state left stale, and it never appears under Due reviews again. The screen says the opposite while this happens -- 'Should this come back? Yes' sits above an empty date field, because comeBack defaults to true. 'The date shown is the date saved' is broken in the worst direction: nothing is shown and the schedule is wiped.

RECORDED HONESTLY is not guaranteed. Elapsed time is unbounded wall clock, so a block left running overnight pre-fills the duration with the entire gap. Save it distractedly and eight hours of practice you did not do enter the item's totals, the instrument balance, the Teacher Report and every insight, permanently. Nothing distinguishes a phone locked during real practice from a session abandoned two days ago.

ONE NEXT ACTION is write-only. It is captured on every close and read by nothing, anywhere. Practise the item again and the screen shows its general notes instead, so the one thing you deliberately decided to try never reaches the moment it was written for.

And the block can be destroyed before it is ever recorded. A running block lives outside the synced database, so the device looks unchanged to sync; a change from the other device resolves to a straight pull, and the in-flight block is discarded with no prompt and no archive. A PAUSED block is no safer than a running one. Choosing Import, Restore archive or Keep remote by hand does the same thing just as quietly. And the same replacement leaves the running plan, today's dismissed reviews and a now-dangling session instrument pointing at a database that no longer contains them -- at all three places a database is installed, since reset-to-demo and erase-everything never pass through the import path at all.

## Instead

Every minute the app records is a minute you actually played, and every number it shows is derived from those minutes honestly. Two separate questions do that work and are never confused: whether an unfinished session EXISTS decides whether anything may replace your data, and whether its elapsed figure is still PLAUSIBLE decides only what minutes are proposed and whether it is worth pointing at. A heuristic about duration never becomes permission to discard practice.

Saving needs a result -- the six options are already on screen, and 'Save without a result' keeps not_logged deliberate rather than accidental. Underneath, at the one place every caller routes through, answering nothing no longer reads as declining: a close carrying no result leaves the item's review date exactly as it was and leaves its open review open, while genuinely declining still clears it. Closing an ABANDONED block proposes its own target rather than the fabricated figure and says plainly why, so a forgotten clock cannot write practice you did not do -- while ordinary overtime stays completely normal. Practising an item again shows the next action you chose last time, before you start playing.

And no unfinished session is ever destroyed by a replacement you did not aim at it -- running or paused, fresh or stale, ordinary or routine. Staleness decides the minutes proposed and raises the attention state; it never becomes permission to discard practice. Automatic sync defers quietly while practice is unfinished and retries the moment that session clears, whether you finished it or discarded it. A deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the block that is in the way -- never a silent no-op, never a silent discard. A stale session blocking sync says so on Today and in the sync notice, and Resume leads straight to Finish, correct the minutes, or Discard. When a replacement does happen, the running plan, today's dismissals and a session instrument the new database lacks are cleared in the same step -- at every one of the three places a database is installed, not just the import path.

And you can finally see how much you have practised: a compact minutes-and-blocks line for today and this week, low on Today and never above the recommendation, with today, this week and all time per instrument on Insights. Calendar figures, not rolling windows -- late last night belongs to yesterday and the week starts Monday. Neutral counts only, no target and no streak.

## Keep

- An unfinished practice session is never destroyed by a replacement you did not aim at it, and a paused session is protected exactly as much as a running one.
- A heuristic never becomes an authority: staleness changes what is proposed and what is shown, never what is discarded.
- Practising stays the only thing that completes a review and advances spaced repetition; 'Not now' still changes no schedule and snooze still moves the real date on both sides.
- The date previewed before saving is exactly the date saved -- now including when that date is deliberately left unchanged.
- Closing a block stays under 60 seconds and starting one under 30. No new field is added; requiring a result only makes a choice already on screen a required one.
- The SM-2 rungs are not retuned and no schema changes: SCHEMA_VERSION stays 11 with no migration.
- No timer or wake-lock behaviour changes, and no recorded minute is ever influenced by a wake-lock or audio outcome.
- Routine runs are untouched -- their minutes are already clamped per segment, and finishRoutine still records time without a judgement.
- The sync model stays whole-snapshot, content-hash compared, with explicit two-button conflicts and both copies preserved. No timestamp enters a sync decision.
- The primary recommendation stays above the fold on a 390x844 phone; the totals line sits below it.
- Totals stay neutral counts -- no goal, streak, score, bar or judging colour -- and everything still works fully offline.

## New assumptions

- Staleness is a judgement about a DURATION, not about a session's worth. It is wired to the proposed minutes and the attention state, and to no destructive path anywhere.
- What blocks a replacement is the PRESENCE of an unfinished session, never whether its clock is ticking -- pausing protects, it does not expose.
- A deferred sync is retried by watching the blocking condition clear, so finishing and discarding both release it; neither depends on an incidental database write.
- Deliberate erasure -- reset to demo, erase everything -- is aimed at destroying the data and already confirms first, so it keeps no guard; it must still leave no ephemeral state behind.
- A block belongs whole to the calendar day it began, because its minutes are the figure you attested to and routine blocks carry no end timestamp to split by.
- The week starts Monday 00:00 local time.
- The most recent non-empty next action is the right one to surface; a later block that recorded none should not blank out a decision that still stands.

## Show me

Practise an item, tap Finish, and try to save without choosing a result -- Save is unavailable. Use 'Save without a result', then open the item: its next review date is UNCHANGED and its due review is still open, where today both would have silently disappeared. Practise it again and last time's next action is shown before you start playing.

Leave a block running overnight, reopen and tap Finish: the proposed minutes are the block's target, not the eight-hour gap, with one plain line saying why -- and the block is still there to resolve, not discarded on your behalf. A block you genuinely played twenty minutes past its target still proposes the real elapsed time.

Now the part that matters most. With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, your block is still there with its time intact, and the sync notice says it is waiting on that block. PAUSE the block -- it is still protected. Leave it overnight so it goes stale -- it is STILL protected, and now Today's In-progress card says so. Discard it, and sync completes on its own within a few seconds without you touching anything. Then try Import or Restore archive with a block unfinished: each refuses out loud, names the block, and leaves it exactly where it was.

Finally, glance at Today: below the 'Practise now' card -- still fully visible without scrolling -- a quiet line reads today's and this week's minutes and block counts, and Insights shows the same per instrument including all time. No goal, no streak, no bar.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **unfinished-session replacement atomicity** — The late guard checks only whether practice is unfinished at the instant before importDB. A block started and finished during the asynchronous blob replacement leaves no active session, so the incoming database overwrites the newly recorded block.
  _counterexample:_ Begin an automatic pull with no active session. After the local pre-sync archive is complete and while replaceAllBlobs is awaiting IndexedDB, start and finish an ordinary block. The late replacementRefusal sees active and activeRoutine both null, importDB installs the remote database, and the completed block exists in neither the earlier archive nor the incoming snapshot.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 48081f8..c28f372 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -140,6 +140,29 @@ this — `replaceAllBlobs` is one
 IndexedDB transaction, so a failed blob write rolls back and leaves blobs and `db` alike
 untouched, which installing the `db` first would give up.
 
+PRESENCE IS NOT THE WHOLE GUARD. `decideReplacement` has TWO blocking reasons, and both
+are about practice that would be DESTROYED — neither is a heuristic about a duration. The
+second is the local REVISION: an inbound snapshot may only be installed over the database
+it was compared with. A block started AND FINISHED while a pull is in flight leaves no
+unfinished session for presence to see, and the recorded block is in NEITHER the pre-sync
+archive (taken earlier) nor the incoming snapshot — installing it would destroy a minute
+that was genuinely played with nothing holding a copy. So `importFullBackup(text, intent,
+decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
+in the same call as the presence check (ONE call answering both, so no await can ever be
+slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
+clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
+is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
+The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
+`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
+is) so the guarded window covers the remote fetch and the archive too, not just
+`replaceAllBlobs`. It is passed IN, never read from module scope inside `importFullBackup`:
+a manual Import or an archive restore has no earlier decision point than its own call and
+defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
+PRESENCE is answered first so a message that can name the blocking session still does
+(ac-8). This deferral needs no retry watcher: the very write that raised it bumped `rev`,
+which App.tsx's quiet-period auto-sync already watches, and the next run sees both sides
+changed and offers the owner an explicit conflict with both copies preserved.
+
 A stale clock is labelled wherever the block appears on Today — the In-progress card AND
 the "still running elsewhere" row (`StaleNote`) — because those two are exhaustive and
 labelling only the first left the same block silent after switching instrument or choosing
diff --git a/CLAUDE.md b/CLAUDE.md
index 348ba10..90b67ef 100644
--- a/CLAUDE.md
+++ b/CLAUDE.md
@@ -140,6 +140,29 @@ this — `replaceAllBlobs` is one
 IndexedDB transaction, so a failed blob write rolls back and leaves blobs and `db` alike
 untouched, which installing the `db` first would give up.
 
+PRESENCE IS NOT THE WHOLE GUARD. `decideReplacement` has TWO blocking reasons, and both
+are about practice that would be DESTROYED — neither is a heuristic about a duration. The
+second is the local REVISION: an inbound snapshot may only be installed over the database
+it was compared with. A block started AND FINISHED while a pull is in flight leaves no
+unfinished session for presence to see, and the recorded block is in NEITHER the pre-sync
+archive (taken earlier) nor the incoming snapshot — installing it would destroy a minute
+that was genuinely played with nothing holding a copy. So `importFullBackup(text, intent,
+decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
+in the same call as the presence check (ONE call answering both, so no await can ever be
+slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
+clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
+is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
+The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
+`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
+is) so the guarded window covers the remote fetch and the archive too, not just
+`replaceAllBlobs`. It is passed IN, never read from module scope inside `importFullBackup`:
+a manual Import or an archive restore has no earlier decision point than its own call and
+defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
+PRESENCE is answered first so a message that can name the blocking session still does
+(ac-8). This deferral needs no retry watcher: the very write that raised it bumped `rev`,
+which App.tsx's quiet-period auto-sync already watches, and the next run sees both sides
+changed and offers the owner an explicit conflict with both copies preserved.
+
 A stale clock is labelled wherever the block appears on Today — the In-progress card AND
 the "still running elsewhere" row (`StaleNote`) — because those two are exhaustive and
 labelling only the first left the same block silent after switching instrument or choosing
diff --git a/README.md b/README.md
index ef5dd0b..e163178 100644
--- a/README.md
+++ b/README.md
@@ -53,11 +53,14 @@ daily home is the **MacBook**, with the **iPhone** as companion.
   through a GitHub repo you own: snapshots publish atomically (one git commit each),
   changes are compared by content hash (not clocks), both copies are archived before
   any conflict resolution, and everything is recoverable from the repo's history.
-  **Unfinished practice is never destroyed by a replacement you did not aim at it** —
-  running or paused, fresh or stale, ordinary or routine. Background sync defers quietly
-  while a session is open (saying so on screen) and resumes on its own the moment you
-  finish or discard it; a deliberate Import, Restore archive or Keep remote refuses out
-  loud instead, naming the block that is in the way.
+  **Practice is never destroyed by a replacement you did not aim at it** — an open
+  session, running or paused, fresh or stale, ordinary or routine, and equally a block
+  you started and finished while the sync was still running. Background sync defers
+  quietly (saying so on screen) and resumes on its own — the moment you finish or discard
+  an open session, or on its next run if the practice is already recorded, where a
+  changed copy on both sides becomes an explicit choice rather than a silent overwrite. A
+  deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the
+  block that is in the way.
 - **Shows how much you have actually practised.** A quiet minutes-and-blocks line low on
   Today, and today / this week / all time per instrument on Insights. Calendar figures,
   not rolling windows — late last night belongs to yesterday and the week starts Monday.
diff --git a/src/components/Layout.tsx b/src/components/Layout.tsx
index a9ddbeb..4e5dcf9 100644
--- a/src/components/Layout.tsx
+++ b/src/components/Layout.tsx
@@ -1,5 +1,6 @@
 import { useEffect, useRef } from 'react';
 import { NavLink, Outlet, useLocation } from 'react-router-dom';
+import { hasUnfinishedPractice } from '../domain';
 import { useStore } from '../store/useStore';
 import { useSyncStatus } from '../store/githubSync';
 import { useViewportGuard } from './useViewportGuard';
@@ -150,24 +151,32 @@ function UpdateBanner() {
 
 /**
  * Calm, non-blocking notice when sync needs a decision, hit an error, or is
- * WAITING on unfinished practice. The deferral must be visible here and not
- * only in Settings: an unbounded, invisible sync outage is exactly what a
- * forgotten block used to cause. It says what it is waiting for and points at
- * the practice screen, where Finish, correcting the minutes, and Discard are
- * all one tap away — the app never resolves it by discarding the practice.
+ * WAITING. The deferral must be visible here and not only in Settings: an
+ * unbounded, invisible sync outage is exactly what a forgotten block used to
+ * cause. It says what it is waiting for, and Resume points at the practice
+ * screen where Finish, correcting the minutes, and Discard are all one tap
+ * away — the app never resolves it by discarding the practice.
+ *
+ * Resume is keyed on the SESSION EXISTING, not on the phase. A deferral raised
+ * because practice was RECORDED mid-sync has no session to resume — offering a
+ * link to /active there would be a dead control that bounces straight back,
+ * and that deferral needs no tap at all: it clears itself on the next sync.
  */
 function SyncNotice({ pathname }: { pathname: string }) {
   const phase = useSyncStatus((s) => s.phase);
   const message = useSyncStatus((s) => s.message);
+  const unfinished = useStore((s) => hasUnfinishedPractice(s));
   if (pathname === '/settings') return null; // Settings shows the full panel.
   if (phase !== 'conflict' && phase !== 'error' && phase !== 'deferred') return null;
   if (phase === 'deferred') {
     return (
       <div className="card card-quiet row between small" style={{ marginBottom: 'var(--space-4)' }}>
         <span className="dim">Sync is waiting: {message}</span>
-        <NavLink to="/active" className="link" style={{ flex: 'none' }}>
-          Resume
-        </NavLink>
+        {unfinished && (
+          <NavLink to="/active" className="link" style={{ flex: 'none' }}>
+            Resume
+          </NavLink>
+        )}
       </div>
     );
   }
diff --git a/src/domain/practiceSession.test.ts b/src/domain/practiceSession.test.ts
index 8b73604..bdfbb9e 100644
--- a/src/domain/practiceSession.test.ts
+++ b/src/domain/practiceSession.test.ts
@@ -47,11 +47,17 @@ const NOTHING = { active: null, activeRoutine: null };
 // comparison, a remote change resolves to a straight pull, and importDB nulls
 // `active`. Committed data is archived first — the in-flight block is not.
 //
-// The invariant is UNCONDITIONAL. Only PRESENCE decides: running or paused,
-// fresh or stale, ordinary or routine. An earlier draft let a stale clock stop
-// deferring, which would have promoted a heuristic about a DURATION into an
-// authority to destroy practice — a session paused at three genuine hours
-// crosses any sensible threshold.
+// The invariant is UNCONDITIONAL. PRESENCE decides regardless of running or
+// paused, fresh or stale, ordinary or routine. An earlier draft let a stale
+// clock stop deferring, which would have promoted a heuristic about a DURATION
+// into an authority to destroy practice — a session paused at three genuine
+// hours crosses any sensible threshold.
+//
+// Presence is not the whole guard, because it cannot see practice that was
+// started AND FINISHED while the replacement was in flight: that leaves no
+// session behind, only a recorded block the incoming snapshot would overwrite.
+// The second blocking reason is the local REVISION moving — a counter, not a
+// clock and not a heuristic.
 
 describe('A1 · a replacement never destroys an unfinished practice session', () => {
   it('refuses a replacement for a running, a paused, and a stale unfinished session alike', () => {
@@ -111,6 +117,41 @@ describe('A1 · a replacement never destroys an unfinished practice session', ()
     expect(deliberate.outcome).not.toBe(auto.outcome);
   });
 
+  it('refuses a replacement when practice was recorded on this device after the replacement was decided', () => {
+    // The window presence CANNOT see. A pull is decided against local revision
+    // 7; while the remote copy downloads, the pre-sync archive is written and
+    // `replaceAllBlobs` runs, a block is started AND FINISHED. There is no
+    // unfinished session left to find, and the recorded block is in neither
+    // the archive nor the incoming snapshot — installing it would destroy a
+    // minute that was genuinely played, with nothing holding a copy.
+    const moved = { intent: 'automatic' as const, session: NOTHING, revision: { decidedFrom: 7, current: 8 } };
+    expect(hasUnfinishedPractice(NOTHING)).toBe(false);
+    expect(decideReplacement(moved).outcome).toBe('defer');
+    // Waiting, not broken — and NOT on something to finish or discard, because
+    // the practice is already recorded. The `rev` bump that raised this is
+    // what the quiet-period auto-sync watches, so the next run offers both
+    // copies as an explicit conflict.
+    expect(decideReplacement(moved).message).not.toContain('discard');
+    expect(decideReplacement({ ...moved, intent: 'deliberate' }).outcome).toBe('refuse');
+
+    // Discriminating: an UNMOVED revision is not a blocker. Without this the
+    // guard could be satisfied by refusing every replacement forever, which
+    // would be a permanent silent sync outage — worse than the bug.
+    expect(decideReplacement({ ...moved, revision: { decidedFrom: 7, current: 7 } }).outcome).toBe('proceed');
+    expect(decideReplacement({ ...moved, intent: 'deliberate', revision: { decidedFrom: 7, current: 7 } }).outcome).toBe('proceed');
+
+    // Both reasons at once: PRESENCE answers first, so the message can still
+    // name the session that is in the way (ac-8).
+    const both = decideReplacement({
+      intent: 'deliberate',
+      session: { active: liveBlock(), activeRoutine: null },
+      labels: { itemTitle: 'درآمد ماهور' },
+      revision: { decidedFrom: 7, current: 8 },
+    });
+    expect(both.outcome).toBe('refuse');
+    expect(both.message).toContain('درآمد ماهور');
+  });
+
   it('names the blocking session neutrally rather than fabricating a title', () => {
     const noTitle = decideReplacement({ intent: 'deliberate', session: { active: liveBlock(), activeRoutine: null } });
     expect(noTitle.message).toContain('a practice block');
diff --git a/src/domain/practiceSession.ts b/src/domain/practiceSession.ts
index 9df6ceb..67e9a0e 100644
--- a/src/domain/practiceSession.ts
+++ b/src/domain/practiceSession.ts
@@ -11,10 +11,13 @@ import type { ID, PracticeDB } from './types';
 // TWO INDEPENDENT QUESTIONS live here, and conflating them is the bug this
 // module exists to prevent:
 //
-//   PRESENCE     — does an unfinished session exist? That, and ONLY that,
-//                  decides whether a whole-database replacement may proceed.
-//                  Running or paused, fresh or stale, ordinary or routine: a
-//                  session that exists is protected.
+//   PRESENCE     — does an unfinished session exist? Running or paused, fresh
+//                  or stale, ordinary or routine: a session that exists is
+//                  protected. This, together with whether the local database
+//                  has been WRITTEN TO since a replacement was decided (a
+//                  revision counter, never a clock and never a heuristic), and
+//                  NOTHING else, decides whether a whole-database replacement
+//                  may proceed.
 //   PLAUSIBILITY — does this session's elapsed figure still look like time
 //                  someone actually played? That, and ONLY that, decides what
 //                  minutes are proposed at close and whether the session is
@@ -97,36 +100,75 @@ export interface ReplacementDecision {
 }
 
 /**
- * THE CORE SAFETY DECISION. An unfinished practice session — ordinary or
- * routine, RUNNING OR PAUSED, FRESH OR STALE — is never destroyed by a
- * replacement the owner did not explicitly aim at it.
+ * THE CORE SAFETY DECISION. A replacement never destroys practice the owner
+ * did not aim it at. TWO INDEPENDENT REASONS block one, and both are about
+ * practice that would be DESTROYED — neither is a heuristic about a duration:
+ *
+ *   PRESENCE — an unfinished session exists (ordinary or routine, RUNNING OR
+ *              PAUSED, FRESH OR STALE). The elapsed figures on the inputs are
+ *              ignored by construction: staleness is not, and can never
+ *              become, permission to destroy practice.
+ *   REVISION — the local database has been WRITTEN TO since this replacement
+ *              was decided against it. An inbound snapshot is only safe to
+ *              install over the database it was compared with; a block
+ *              started AND FINISHED while the pull was in flight leaves no
+ *              unfinished session behind, so presence cannot see it, and it
+ *              exists in neither the pre-sync archive nor the incoming
+ *              snapshot. `rev` is a monotonic COUNTER bumped on every db
+ *              mutation, never a clock — no timestamp enters this decision.
+ *
+ * PRESENCE is answered first, so a message that can name the blocking session
+ * always does.
  *
  * Automatic (background sync) and deliberate (Import, Restore archive, Keep
  * remote) are answered differently because silence would be wrong in opposite
  * directions: a background merge waiting its turn is not a failure and an
  * alert would be noise, while a deliberate choice that quietly did nothing
  * looks like a broken button.
- *
- * Only PRESENCE is read. The elapsed figures on the inputs are ignored by
- * construction — staleness is not, and can never become, permission to
- * destroy practice.
  */
 export function decideReplacement(args: {
   intent: 'automatic' | 'deliberate';
   session: EphemeralPractice;
   labels?: { itemTitle?: string; routineName?: string };
+  /**
+   * The local revision counter as it stood when this replacement was decided,
+   * and as it stands now. Unequal means practice (or any other edit) was
+   * committed on this device in between. Optional: a caller that cannot move
+   * between the decision and the install has nothing to compare.
+   */
+  revision?: { decidedFrom: number; current: number };
 }): ReplacementDecision {
   const blocking = unfinishedPractice(args.session, args.labels);
-  if (!blocking) return { outcome: 'proceed', message: '' };
+  if (blocking) {
+    const what = blocking.kind === 'block' ? `an unfinished practice block (${blocking.label})` : `an unfinished routine (${blocking.label})`;
+    if (args.intent === 'automatic') {
+      return { outcome: 'defer', message: `Waiting on ${what} — sync will finish on its own once you finish or discard it.` };
+    }
+    return {
+      outcome: 'refuse',
+      message: `Not replaced: ${what} is still open, and replacing your data would destroy it. Finish or discard it first — Today's In-progress card leads straight there.`,
+    };
+  }
 
-  const what = blocking.kind === 'block' ? `an unfinished practice block (${blocking.label})` : `an unfinished routine (${blocking.label})`;
-  if (args.intent === 'automatic') {
-    return { outcome: 'defer', message: `Waiting on ${what} — sync will finish on its own once you finish or discard it.` };
+  if (args.revision && args.revision.current !== args.revision.decidedFrom) {
+    // Nothing to finish or discard here — the practice is already recorded.
+    // The automatic case heals itself without any deferral retry: the very
+    // write that raised this bumped `rev`, which the quiet-period auto-sync
+    // watches, and the next run sees both sides changed and offers the owner
+    // an explicit choice with both copies preserved.
+    if (args.intent === 'automatic') {
+      return {
+        outcome: 'defer',
+        message: 'Waiting: practice was recorded on this device while the sync was running. Sync will run again shortly and offer you both copies.',
+      };
+    }
+    return {
+      outcome: 'refuse',
+      message: 'Not replaced: practice was recorded on this device after this replacement started, and replacing your data now would destroy it. Nothing is lost — try again.',
+    };
   }
-  return {
-    outcome: 'refuse',
-    message: `Not replaced: ${what} is still open, and replacing your data would destroy it. Finish or discard it first — Today's In-progress card leads straight there.`,
-  };
+
+  return { outcome: 'proceed', message: '' };
 }
 
 /**
diff --git a/src/store/backup.ts b/src/store/backup.ts
index 3a77ba2..e445a2a 100644
--- a/src/store/backup.ts
+++ b/src/store/backup.ts
@@ -171,16 +171,20 @@ type ImportRefusal = Extract<ImportOutcome, { ok: false }>;
 
 /**
  * Is a whole-database replacement refused right now? Read fresh each time it is
- * asked, because the answer can change mid-import. The intent is the caller's:
- * a sync pull is AUTOMATIC and defers quietly, everything else is DELIBERATE
- * and refuses out loud.
+ * asked, because the answer can change mid-import — BOTH reasons can arise
+ * after the replacement was decided. The intent is the caller's: a sync pull is
+ * AUTOMATIC and defers quietly, everything else is DELIBERATE and refuses out
+ * loud. `decidedFromRev` is the local revision the replacement was decided
+ * against; a different one now means practice was committed in between and
+ * installing the snapshot would destroy it.
  */
-function replacementRefusal(intent: 'automatic' | 'deliberate'): ImportRefusal | null {
-  const { active, activeRoutine } = useStore.getState();
+function replacementRefusal(intent: 'automatic' | 'deliberate', decidedFromRev: number): ImportRefusal | null {
+  const { active, activeRoutine, rev } = useStore.getState();
   const decision = decideReplacement({
     intent,
     session: { active, activeRoutine },
     labels: unfinishedPracticeLabels(),
+    revision: { decidedFrom: decidedFromRev, current: rev },
   });
   if (decision.outcome === 'proceed') return null;
   return { ok: false, error: decision.message, deferred: decision.outcome === 'defer' };
@@ -204,24 +208,33 @@ function replacementRefusal(intent: 'automatic' | 'deliberate'): ImportRefusal |
  *
  * This is the chokepoint for every INBOUND replacement — manual import, a sync
  * pull, conflict-keep-remote, and archive restore all arrive here — so it is
- * where an unfinished practice session is protected. The refusal is the FIRST
- * thing this function does, before the JSON is even parsed: `replaceAllBlobs`
- * below destroys every attachment blob, so a check placed after it would
- * return "nothing was changed" having already wiped them. It is ALSO the last
- * thing before `importDB`, because that first check does not span the whole
- * call — see the comment at the install itself.
+ * where local practice is protected. The refusal is the FIRST thing this
+ * function does, before the JSON is even parsed: `replaceAllBlobs` below
+ * destroys every attachment blob, so a check placed after it would return
+ * "nothing was changed" having already wiped them. It is ALSO the last thing
+ * before `importDB`, because that first check does not span the whole call —
+ * see the comment at the install itself.
+ *
+ * `decidedFromRev` is the local revision this replacement was decided against.
+ * A sync pull passes the revision of the snapshot it actually compared, so the
+ * guarded window covers the network fetch and the pre-sync archive too — a
+ * block finished in there is in neither the archive nor the incoming snapshot.
+ * A deliberate caller has no earlier decision point than this call, so it
+ * defaults to the revision on entry.
  */
 export async function importFullBackup(
   text: string,
   intent: 'automatic' | 'deliberate' = 'deliberate',
+  decidedFromRev: number = useStore.getState().rev,
 ): Promise<ImportOutcome> {
   // A replacement reaching this function is one the owner chose (Import,
   // Restore archive, Keep remote) or a sync pull that slipped past syncNow's
   // own deferral because practice started mid-sync. Either way an unfinished
   // session — running or paused, fresh or stale, ordinary or routine — is
-  // never destroyed by it, and never silently: every caller already surfaces
+  // never destroyed by it, nor is a block that was started AND FINISHED since
+  // the pull was decided, and never silently: every caller already surfaces
   // this error.
-  const refusal = replacementRefusal(intent);
+  const refusal = replacementRefusal(intent, decidedFromRev);
   if (refusal) return refusal;
 
   let parsed: unknown;
@@ -260,20 +273,26 @@ export async function importFullBackup(
     return { ok: false, error: `Could not write attachment files (${e instanceof Error ? e.message : 'unknown error'}) — nothing was changed.` };
   }
 
-  // Checked AGAIN, in the same synchronous tick as the install. The check at
-  // the top of this function cannot cover the whole call: `replaceAllBlobs`
-  // above yields to the event loop, so a tap that starts a block or a routine
-  // while that transaction is in flight would otherwise reach `importDB` —
-  // which nulls `active`/`activeRoutine` — with no guard between them. Nothing
-  // awaits between here and the install, so this one is genuinely the last
-  // word. The blobs are already written by this point, so the refusal says
-  // that plainly rather than claiming nothing changed; the message still names
-  // the session (ac-8), the practice is intact, and re-running the same import
-  // afterwards finishes the job.
-  const late = replacementRefusal(intent);
+  // Checked AGAIN, in the same synchronous tick as the install — ONE call
+  // answering BOTH reasons, so no await can ever be slipped between them. The
+  // check at the top of this function cannot cover the whole call:
+  // `replaceAllBlobs` above yields to the event loop, so during that
+  // transaction a tap can start a block or a routine (which `importDB` would
+  // null) — or start one AND FINISH it, which leaves no session for presence
+  // to see while the recorded block sits in a `db` the incoming snapshot is
+  // about to overwrite, held by no archive. The revision comparison is what
+  // catches that second case. Nothing awaits between here and the install, so
+  // this one is genuinely the last word. The blobs are already written by this
+  // point, so the refusal says that plainly rather than claiming nothing
+  // changed; the message still names the blocking session when there is one
+  // (ac-8), the practice is intact, and re-running the same import afterwards
+  // finishes the job.
+  const late = replacementRefusal(intent, decidedFromRev);
   if (late) {
     if (!isFullBackup) return late;
-    return { ...late, error: `${late.error} (Your attachment files were already replaced from the backup — running this import again afterwards will finish the job.)` };
+    // Say what actually happened; do NOT instruct a manual re-run, because a
+    // deferral reaching here is an automatic sync that re-runs itself.
+    return { ...late, error: `${late.error} (Your attachment files had already been replaced from the backup — the data itself was not. The next attempt finishes the job.)` };
   }
 
   useStore.getState().importDB(parsed);
diff --git a/src/store/githubSync.ts b/src/store/githubSync.ts
index 726e382..cab2c87 100644
--- a/src/store/githubSync.ts
+++ b/src/store/githubSync.ts
@@ -149,23 +149,38 @@ interface BackupShape {
   [k: string]: unknown;
 }
 
+/**
+ * The local revision the running sync's comparison was made against. An
+ * inbound snapshot is only safe to install over the database it was compared
+ * with: between this snapshot and the install sit the remote fetch and the
+ * pre-sync archive, and a block started AND FINISHED in that window is in
+ * NEITHER the archive nor the incoming copy, with no unfinished session left
+ * for the presence guard to see. Module scope is safe for the same reason
+ * `running` and `pendingDeferral` are — exactly one sync runs at a time, and
+ * `buildLocalSnapshot` always precedes `applySnapshot` in both engine paths.
+ */
+let syncBaselineRev: number | null = null;
+
 async function buildLocalSnapshot(): Promise<LocalSnapshot> {
   const backup = JSON.parse(await buildFullBackup()) as BackupShape;
   const files = backup.files;
   backup.files = [];
+  const rev = useStore.getState().rev;
+  syncBaselineRev = rev;
   return {
     stateText: JSON.stringify(backup),
     files,
     hash: await hashState(backup.data ?? {}),
-    rev: useStore.getState().rev,
+    rev,
     deviceName: getDeviceName(),
   };
 }
 
 /**
  * A deferral raised INSIDE a sync run, carried back out to `applyOutcome`.
- * `importFullBackup` defers when practice began after `syncNow`'s own check —
- * during the network fetch, or during `replaceAllBlobs` — and the only channel
+ * `importFullBackup` defers when practice happened after `syncNow`'s own check
+ * — during the network fetch, the pre-sync archive, or `replaceAllBlobs` —
+ * whether it is still unfinished or was already recorded, and the only channel
  * out of `runSync` is a thrown error, which would land in `error` phase. That
  * is the wrong answer twice over: a background merge waiting its turn is not a
  * failure, and App.tsx's retry watches `deferred`, so an `error` would leave
@@ -183,7 +198,11 @@ function makePorts(cfg: SyncConfig, intent: 'automatic' | 'deliberate'): SyncPor
       applySnapshot: async (stateText, files) => {
         const backup = JSON.parse(stateText) as BackupShape;
         backup.files = files;
-        const result = await importFullBackup(JSON.stringify(backup), intent);
+        // Deliberately NOT read inside `importFullBackup`: a manual Import or
+        // an archive restore has no earlier decision point than its own call,
+        // and a stale baseline left over from a sync run would make it refuse
+        // for no reason.
+        const result = await importFullBackup(JSON.stringify(backup), intent, syncBaselineRev ?? undefined);
         if (!result.ok) {
           if (result.deferred) pendingDeferral = result.error;
           throw new Error(result.error);
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
unfinished session for presence to see, and the recorded block is in NEITHER the pre-sync
archive (taken earlier) nor the incoming snapshot — installing it would destroy a minute
that was genuinely played with nothing holding a copy. So `importFullBackup(text, intent,
decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
in the same call as the presence check (ONE call answering both, so no await can ever be
slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
is) so the guarded window covers the remote fetch and the archive too, not just
`replaceAllBlobs`. It is passed IN, never read from module scope inside `importFullBackup`:
a manual Import or an archive restore has no earlier decision point than its own call and
defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
PRESENCE is answered first so a message that can name the blocking session still does
(ac-8). This deferral needs no retry watcher: the very write that raised it bumped `rev`,
which App.tsx's quiet-period auto-sync already watches, and the next run sees both sides
changed and offers the owner an explicit conflict with both copies preserved.

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
unfinished session for presence to see, and the recorded block is in NEITHER the pre-sync
archive (taken earlier) nor the incoming snapshot — installing it would destroy a minute
that was genuinely played with nothing holding a copy. So `importFullBackup(text, intent,
decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
in the same call as the presence check (ONE call answering both, so no await can ever be
slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
is) so the guarded window covers the remote fetch and the archive too, not just
`replaceAllBlobs`. It is passed IN, never read from module scope inside `importFullBackup`:
a manual Import or an archive restore has no earlier decision point than its own call and
defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
PRESENCE is answered first so a message that can name the blocking session still does
(ac-8). This deferral needs no retry watcher: the very write that raised it bumped `rev`,
which App.tsx's quiet-period auto-sync already watches, and the next run sees both sides
changed and offers the owner an explicit conflict with both copies preserved.

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

### README.md

````
# Practice Compass

A calm, **local‑first** music practice tracker for a serious adult learner.
Built around self‑regulated learning — *plan → focus → monitor → evaluate → adapt* —
rather than raw repetition time.

> **One item. One mode. One focus. One result. One next action.**

It works out of the box for **Persian Setar**, **Persian Tar** and **Classical Guitar**,
and for any future instrument, piece, étude, technical drill, lesson, improvisation
prompt or repertoire item.

There is no backend, no account, no audio analysis and no AI judgement.
**IndexedDB on the device is the source of truth** (app data + attached files); every
install works fully offline. Devices stay in sync through a GitHub repo you own
(atomic whole snapshots, compared by content hash, conflicts archived — see *Using
it*), and a single backup file (JSON data + embedded files) exports/imports everything
as a fallback. Hosted free on GitHub Pages;
daily home is the **MacBook**, with the **iPhone** as companion.

---

## What it does

- **Opens on YOUR session.** Today starts with "which instrument am I practising now?" —
  pick Setar and everything on screen is Setar's: one clear *Practise now* card (with a
  plain-language reason), that instrument's class work, due reviews, and pathway position.
  Other instruments never leak in; a cross-instrument Overview is one deliberate tap away.
- **Gives you a path to trust — for every instrument.** Editable **Pathways** you follow
  at your own pace, always seeing where you stand and what's ahead. No rush, no deadlines,
  no competition. Three are seeded and fully editable: **Classical Guitar Shed** (1A from
  the official syllabus with two guided routines; Levels 1–3 from the real course),
  **Setar · Radif & Repertoire** (a dastgāh/āvāz/gusheh map, teacher-driven and reorderable),
  and **Tar · Honarestān method** (the two-book conservatory curriculum, as taught on
  Khonyagar.com). Create your own; rename/reorder sections and stages; pin the stage
  you're actually in (teacher-led work doesn't move linearly).
- **Walks you through a session.** Guided routines run as a hands-free, segment-by-segment
  timer — clearly labelled as a warm-up, not logged practice.
- **Tells you what to practise next.** A deterministic recommendation engine surfaces
  three explained cards: *Best Next Focus*, *Quick Win*, and *Maintenance*.
- **Maps the whole repertoire.** Repertoire → *My repertoire* shows the works you
  actually play: radif gushehs and composed maestro pieces (a chahārmezrāb of Sabā in
  Afshāri, a pish-darāmad of Darvish Khān in Māhur) side by side under their dastgāh,
  with form and composer on each row — and guitar pieces through the same lens, grouped
  by study source. Parent works appear once; parts stay nested. Spelling variants fold
  into one group; your own text is never rewritten.
- **Creates items in one step.** Quick add stays title-only; "Add practice item" asks
  what you're adding first (gusheh, composed piece, passage, étude, technique…) and
  shows only the fields that kind needs, with study source (creatable inline), pathway
  stage, lesson and parent work connectable at creation — no create-then-edit round
  trips.
- **Stays in sync across devices — safely.** MacBook and iPhone share the same data
  through a GitHub repo you own: snapshots publish atomically (one git commit each),
  changes are compared by content hash (not clocks), both copies are archived before
  any conflict resolution, and everything is recoverable from the repo's history.
  **Practice is never destroyed by a replacement you did not aim at it** — an open
  session, running or paused, fresh or stale, ordinary or routine, and equally a block
  you started and finished while the sync was still running. Background sync defers
  quietly (saying so on screen) and resumes on its own — the moment you finish or discard
  an open session, or on its next run if the practice is already recorded, where a
  changed copy on both sides becomes an explicit choice rather than a silent overwrite. A
  deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the
  block that is in the way.
- **Shows how much you have actually practised.** A quiet minutes-and-blocks line low on
  Today, and today / this week / all time per instrument on Insights. Calendar figures,
  not rolling windows — late last night belongs to yesterday and the week starts Monday.
  Every instrument you have ever practised gets a row, retired ones included, and both
  screens keep their clock live so leaving a tab open across midnight rolls the day over.
  Neutral counts: no goal, no streak, no bar that fills.
- **Closes the loop.** The next action you chose last time is shown when you practise
  that item again, before you start playing.
- **Keeps études concrete.** Break a piece into parts (bars, phrases, one technical
  problem); the piece page always names *one* part to practise now, for 10 minutes, and
  suggests a smaller unit or new strategy when things stall — never quotas.
- **Makes starting trivial.** A quick‑start flow gets you practising in under 30 seconds
  with smart defaults (status → mode, item → focus, 10‑minute default).
- **Keeps the practice screen quiet.** Just the item, the mode, the focus and a timer.
- **Closes a block in under a minute.** One result, one observation, one next action,
  and gentle suggestions for the next review date and status change.
- **Notices patterns.** The Insights screen offers calm, neutral observations
  (balance, neglect, saturation, repeated "same" results, cross‑instrument bottlenecks…).
- **Holds everything for a piece.** Attach your teacher's PDFs, photos of scores, or
  recordings to any item, and keep free-form notes — so the app is the single source for
  your practice, not a notebook full of glued printouts.
- **Prepares your lessons.** A copyable Teacher Report summarises what you worked on,
  what improved, what's still fragile and what to ask — plus a dedicated
  **Questions for next class** list (Copy / Download / print).
- **Speaks Persian.** The built-in Setar and Tar pathways, dastgāhs, gushehs, forms and
  composers are all in Farsi (radif of Mirzā Abdollāh; the Honarestān method), rendered
  right-to-left, searchable by Latin transliteration.
- **Links your class recordings.** Full class videos stay on your NAS; each lesson holds
  a small link that opens the recording on demand — nothing large ever enters the app.

---

## Using it (MacBook + iPhone)

The app lives at **https://ethan-ghoreishi.github.io/practice-compass/** — published
automatically from `main` by GitHub Actions (`deploy.yml`). Install it once per device
and it runs as its own offline app; no terminal, no dev server, no VPN:

- **Mac (Safari):** open the URL → File → **Add to Dock**. (Chrome: install icon in the
  address bar.) It opens as a dock app, full-screen, works with no internet.
- **iPhone (Safari):** open the URL → Share → **Add to Home Screen**.

Being a PWA, each install keeps working entirely offline; an internet connection is only
used to fetch app updates and to sync data.

### Sync between devices (free, via GitHub)

Data syncs through a small private GitHub repo you own
(`ethan-ghoreishi/practice-compass-data`) — no server, no cost:

1. Create a **fine-grained personal access token**: GitHub → Settings → Developer
   settings → Fine-grained tokens → Generate new. Repository access: **only**
   `practice-compass-data`. Permissions → **Contents: Read and write**.
2. In the app on each device: **Settings → Sync (GitHub)** → paste the repo and token →
   **Connect & sync**.
3. That's it. It syncs when the app opens, shortly after changes, and when you come
   back online. If both devices changed since the last sync, the app asks which copy to
   keep — and archives the other one (in-app restore slot + an `archive/…` branch in
   the repo) before replacing anything. It never merges silently, and an interrupted
   sync never leaves a half-written copy on either side.

Manual **Export/Import backup** (one JSON file with data + attachments) remains in
Settings as a belt-and-braces fallback.

## Developing

Requires Node 20+ (developed on Node 26).

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build into dist/
npm run preview    # preview the production build
npm run lint       # eslint
npm test           # run the Vitest suite once
npm run test:watch # watch mode
```

Pushing to `main` deploys to GitHub Pages (CI runs lint + tests + build first). The prod
base path is `/practice-compass/` (override with `PC_BASE=/`).
`scripts/deploy-nas.sh` optionally mirrors the same build onto a locally mounted NAS
share for a LAN-only copy — handy, never required.

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| UI             | React 19 + TypeScript + Vite                       |
| State          | Zustand, persisted to **IndexedDB (Dexie)**        |
| Files          | Attachment blobs in IndexedDB (Dexie table)        |
| Routing        | React Router (hash router)                         |
| PWA / offline  | `vite-plugin-pwa` (Workbox)                        |
| Styling        | Hand‑written CSS design system (no framework)      |
| Tests          | Vitest (pure domain logic)                         |
| Host           | GitHub Pages (auto-deploy from `main`)             |
| Sync           | User-owned GitHub repo via the Contents API        |

The codebase is deliberately split into a **pure domain layer** (no React, fully
unit‑tested) and a thin UI layer on top.

```
src/
  domain/      pure logic: types, scoring, recommend, scheduling, insights, report, seed, io
  store/       Zustand store, persistence, lookups, session helpers
  components/   shared UI primitives, layout, icons
  pages/        one file per route
  styles/       global.css design system
```

---

## Data model

Five core objects (see [`src/domain/types.ts`](src/domain/types.ts)):

- **Instrument** — Setar, Tar, Classical Guitar, or anything you add.
- **Material** — a source/collection an item belongs to (a radif, a course, a set of
  études). `sourceType`, `parentTitle`, `section`, `status`, etc.
- **PracticeItem** — the heart of the app. A phrase, bar, exercise, technique, full
  piece, improvisation prompt or body/tension issue. Carries `status`, `importance`,
  `difficulty`, `currentProblem`, `primaryFocus`, `teacherQuestion`, review/stat
  fields, and optional nested **Persian** and **Classical‑guitar** metadata.
- **PracticeBlock** — one focused unit of practice (5–20 min): `mode`, `focus`,
  `constraint`, `result`, `observation`, `nextAction`.
- **Review** — a scheduled spaced‑review for an item (`dueDate`, `reviewType`).

Item status ladder: `new → fragile → repairing → usable → integrated → performable`,
plus `maintenance` and `dormant` for resting material.

Everything is plain JSON and round‑trips cleanly through export/import. The persisted
shape carries a `schemaVersion` for future migrations.

---

## Recommendation logic

For each item a **priority score** is computed deterministically
(see [`src/domain/scoring.ts`](src/domain/scoring.ts)):

```
priority = importance*2 + difficulty + fragility + overdue
         + teacherRelevance + neglected + lessonUrgency − saturationPenalty
```

| Component         | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `fragility`       | by status (fragile/repairing = 5 … performable = 0)            |
| `overdue`         | how many days past `nextReviewDate` (0–5)                      |
| `teacherRelevance`| +3 if an open teacher question exists                          |
| `neglected`       | days since last touched, banded 0–4                            |
| `saturationPenalty`| −3 if drilled 3×/48h **or** last 3 results all "same"         |
| `lessonUrgency`   | 3–8 if flagged *for next class*, climbing as that class nears   |

**Three cards** are then chosen (see [`src/domain/recommend.ts`](src/domain/recommend.ts)):

1. **Best Next Focus** — highest score, avoiding saturated items unless none remain.
2. **Quick Win** — difficulty ≤ 3, importance ≥ 3, status usable/fragile/repairing, not saturated.
3. **Maintenance** — integrated/performable/maintenance/dormant item that is due or neglected.

Each card explains itself in one neutral sentence, e.g.
*"Top priority — important, fragile, and 2d overdue."*

**Review scheduling** when a block closes is the SM-2 engine described under
[Review scheduling](#review-scheduling) below (see
[`src/domain/scheduling.ts`](src/domain/scheduling.ts)). There is no fixed
result-to-interval table: the gap comes from the item's own reps, ease and interval.

Status changes are **suggested, never forced** (e.g. *stable alone* on a fragile item
suggests promotion to *usable*).

---

## Repertoire: pathways and items are one thing

The **item is the only unit of work**; a pathway is a *view over your items*, not a
separate to-do list. The Repertoire tab shows the same items two ways — by pathway, or as
a filterable list.

- An item can be **placed in a pathway stage** (`stageId`); stage progress is derived
  from the mastery status of the items in it. Nothing to tick off separately.
- Each stage lays your items over a **reference catalog** of known gushes / lesson areas
  ([`pathwaySeed.ts`](src/domain/pathwaySeed.ts)) — one tap turns a suggestion into a real
  item, pre-filled with type, focus and conscious-practice guidance. Pure derivations +
  tests in [`pathways.ts`](src/domain/pathways.ts).
- **Conscious practice**: dastgāh stages carry character intros (what to listen for), each
  gushe carries a standing prompt (find the shāhed, the ist, the forud), and the practice
  screen keeps "About this piece" one tap away with the question *what is going on here?*
- **Guided routines** ([`RoutineRunner`](src/pages/RoutineRunner.tsx)) walk you through a
  session segment by segment, hands-free.
- Pathways and stages are fully editable; deleting them never deletes your items.

## Lessons (classes with a teacher)

Per-instrument lesson log matching the real workflow: record the class → rewatch →
type up notes (**Farsi welcome**: every text field is direction-aware) → create or link
the concrete practice items right on the lesson card → they appear in that instrument's
Today. Each lesson lists what was worked on (a link — unlinking never deletes the item),
and any item can be flagged *for next class*, which gives it a priority boost that
climbs as **that instrument's** class approaches.

**Small hand-outs are app attachments** (PDFs, photos, short audio — size-capped).
**Full class videos are NAS references, never bytes:** a lesson holds a small link
(title + relative NAS path, or a full HTTPS URL) that resolves against the NAS base URL
you set in Settings; the video opens only when you tap it, and never enters local
storage, sync, or backups. Removing a link never deletes the NAS file. Your logged Setar
class history (37 monthly classes) imports additively from Settings.

**Questions for next class:** flag an item *for next class* and give it a teacher
question, and it collects into a per-instrument list on the upcoming lesson and the
Teacher Report — with Copy, Download and print-friendly export (Farsi-aware). Practising
never erases a question; you remove it by editing the item.

## Review scheduling

Reviews use a **spaced-repetition engine** (SM-2 — the algorithm behind Anki), adapted to
music in [`scheduling.ts`](src/domain/scheduling.ts). Each item tracks reps, an ease factor
and its interval: every time a piece/gushe holds up, the gap before you revisit it grows;
when it slips, the gap resets so you relearn it. Importance and difficulty pull material a
little sooner. It returns a one-line rationale. Per item you can override the mode:

- **Auto** — the engine decides (default).
- **Every N days** — a fixed cadence you choose.
- **Manual** — you set each date yourself.

**A result is required to save a block.** The six options are already the first thing on
the close screen, so this adds no field — it makes a choice already there a required one.
"Save without a result" stays one tap away and records the minutes WITHOUT touching the
schedule: the item's next review date and its open review row both stand exactly as they
were. Answering nothing is not declining, and the one place every caller routes through
(`computeReviewOutcome`) returns the date and the row decision together, so the two can
never disagree.

**An abandoned clock never writes practice you did not do.** Closing a block whose timer
ran far past its target proposes the *target* rather than the wall-clock gap, with one
plain line saying why; ordinary overtime still proposes the real elapsed time, and the
figure is editable either way.

Due reviews offer three honest actions: **practise** (the only thing that completes a
review), **not now** (hidden until tomorrow, no schedule change), and **+2d** (genuinely
moves the date). Item statuses use plain language — *Not practised yet · Shaky · Fixing
problems · Coming together · Solid · Performance-ready · Keeping fresh · Resting* — with
a one-line description in the picker.

## Devices, sync & handoff

Each device keeps its **own local copy** (IndexedDB) and works fully offline. With
**Sync (GitHub)** connected in Settings, devices exchange whole snapshots through your
data repo — one git commit per snapshot, published atomically (a failed or interrupted
sync leaves the previous snapshot untouched). A brand-new empty data repo is bootstrapped
automatically on the first sync (the older builds errored with *“Git Repository is
empty”*). Sync compares content hashes three-way (like git), so pathway edits, deletions
and attachment changes all count; when both sides changed you choose explicitly, and the
losing copy is archived first — in-app ("Restore it" in Settings) and as an `archive/…`
branch in the repo. Attachments upload once each (immutable); only new or deleted files
transfer. Without sync, moving data is a manual backup export → import.

**No replacement runs over unfinished practice.** A running block lives outside the synced
database, so a mid-block device looks unchanged to the hash comparison and a remote change
would otherwise resolve to a straight pull that discarded it. Presence is what protects a
session — never whether its clock is ticking, so pausing protects rather than exposes, and
a long-abandoned clock is protected too: an implausible *duration* says nothing about
whether the session holds practice worth keeping. Automatic sync therefore reports a
distinct **waiting** state (not an error) and retries the instant the session clears,
whether it was finished or discarded. Import, Restore archive and Keep remote refuse with
a message naming the session — never a silent no-op, never a silent discard. Resolving it
is yours: Finish, correct the minutes, or Discard, all one tap from Today's In-progress
card, which labels a clock that has run far past its target.

**Four storage roles, kept distinct** (Settings explains them): **local data** is the
offline source of truth; **GitHub sync** is the small versioned multi-device transport
(one private repo per app that needs it — a phone-only app needs none); **NAS backup**
is your own independent full export (don't treat the sync repo as your only backup); and
**NAS recordings** hold the large class videos the other three never carry.

## Updates

The app updates itself: when a new build is published, an in-app banner offers
**Reload** (updates are also checked hourly and when the app regains focus). The
running build is shown at the bottom of Settings. Reinstalling is never required.

## Install as an app (PWA)

Practice Compass is an installable, offline-capable Progressive Web App (via
`vite-plugin-pwa`) — see **Using it** above for the per-device steps. Icons are
generated from [`public/icon.svg`](public/icon.svg) with `npm run gen:icons`.

## Design principles

Calm, focused, serious, elegant, fast, uncluttered — encouraging but never cheesy.

- No gamification, streaks, fake mastery %, leaderboards or guilt.
- One muted accent, soft hierarchy, generous spacing, serif headings.
- Mobile‑first, with a bottom tab bar and a one‑tap **Start** button.
- The practice screen hides all chrome to protect attention.
- Insights are neutral and useful, never nagging.

---

## Future roadmap

- CSV export
- Calendar reminders
- Teacher‑sharing PDF
- Seed Levels 1B–5 of CGS in full detail from each sub-level's syllabus

Done: ✅ PWA offline install · ✅ Pathways unified with items (catalog + one-tap add +
undo) · ✅ SM-2 spaced-repetition review with manual override, snooze & not-now ·
✅ IndexedDB source of truth · ✅ Attachments on items *and* lessons · ✅ Full backup with
files + device handoff warnings · ✅ Lesson↔item linking with per-instrument class
deadlines (Farsi-aware) · ✅ Per-instrument session workspace · ✅ Sections, stage pinning
& étude parts · ✅ Persian repertoire view (dastgāh × form × composer) · ✅ One-step item
creation · ✅ GitHub Pages hosting + device sync via GitHub · ✅ CI.

See [`docs/product-spec.md`](docs/product-spec.md) for the product thinking, and
[`CLAUDE.md`](CLAUDE.md) for the rules that keep this tool from bloating.

---

## License

MIT.
````

### src/components/Layout.tsx

```
import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { hasUnfinishedPractice } from '../domain';
import { useStore } from '../store/useStore';
import { useSyncStatus } from '../store/githubSync';
import { useViewportGuard } from './useViewportGuard';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  CompassIcon,
  ItemsIcon,
  MoonIcon,
  MoreIcon,
  PathIcon,
  PlayIcon,
  SunIcon,
  TodayIcon,
} from './icons';

export default function Layout() {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Undo iOS's layout-viewport displacement when the keyboard opens/closes.
  useViewportGuard();

  // Only <main> scrolls (the shell is fixed-height) — reset it so every
  // route opens at the top.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  // Hide chrome during focused practice to keep attention on the timer.
  const focused =
    location.pathname === '/active' ||
    location.pathname === '/close' ||
    location.pathname.startsWith('/routine');

  const isDark = theme === 'dark';
  const ThemeIcon = isDark ? SunIcon : MoonIcon;

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="wordmark">
          <CompassIcon className="mark" />
          <span>Practice Compass</span>
        </NavLink>
        <button
          className="btn btn-ghost btn-sm"
          aria-label="Toggle light or dark theme"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          <ThemeIcon width={18} height={18} />
        </button>
      </header>

      {/* Navigation sits BEFORE the page content in the DOM (screen readers
          and keyboard users reach it first); CSS places it at the visual
          bottom on phones and under the header on wide screens. Five equal,
          stable targets — Today carries the primary Start action, so the bar
          needs no raised centre button. */}
      {!focused && (
        <nav className="tabbar" aria-label="Primary">
          <div className="tabbar-inner">
            <NavLink to="/" end className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <TodayIcon />
              <span>Today</span>
            </NavLink>
            <NavLink to="/repertoire" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <PathIcon />
              <span>Repertoire</span>
            </NavLink>
            <NavLink to="/start" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <PlayIcon />
              <span>Start</span>
            </NavLink>
            <NavLink to="/lessons" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <ItemsIcon />
              <span>Lessons</span>
            </NavLink>
            <NavLink to="/more" className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
              <MoreIcon />
              <span>More</span>
            </NavLink>
          </div>
        </nav>
      )}

      <main className="main" ref={mainRef}>
        <div className={`main-inner${pageWidthClass(location.pathname)}`}>
          <UpdateBanner />
          <SyncNotice pathname={location.pathname} />
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Per-route page widths: focused practice stays narrow, Today comfortable,
 * browsing/notes screens use real desktop room (CSS caps them on phones).
 */
function pageWidthClass(pathname: string): string {
  if (pathname === '/active' || pathname === '/close' || pathname.startsWith('/routine')) return ' main-inner--narrow';
  if (
    pathname.startsWith('/repertoire') ||
    pathname.startsWith('/items') ||
    pathname.startsWith('/pathway') ||
    pathname.startsWith('/lessons') ||
    pathname.startsWith('/materials') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/insights') ||
    pathname.startsWith('/report')
  )
    return ' main-inner--wide';
  return '';
}

/**
 * Honest PWA updates: the service worker is registered in prompt mode, a new
 * build shows this banner, and one tap reloads into it — no reinstalling.
 * Updates are also checked hourly and whenever the app becomes visible
 * (installed iOS apps otherwise only check on cold launch).
 */
function UpdateBanner() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => void registration.update(), 60 * 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registration.update();
      });
    },
  });
  if (!needRefresh) return null;
  return (
    <div className="card card-accent row between small" style={{ marginBottom: 'var(--space-4)' }}>
      <span>A new version is ready.</span>
      <button className="btn btn-primary btn-sm" style={{ flex: 'none' }} onClick={() => void updateServiceWorker(true)}>
        Reload
      </button>
    </div>
  );
}

/**
 * Calm, non-blocking notice when sync needs a decision, hit an error, or is
 * WAITING. The deferral must be visible here and not only in Settings: an
 * unbounded, invisible sync outage is exactly what a forgotten block used to
 * cause. It says what it is waiting for, and Resume points at the practice
 * screen where Finish, correcting the minutes, and Discard are all one tap
 * away — the app never resolves it by discarding the practice.
 *
 * Resume is keyed on the SESSION EXISTING, not on the phase. A deferral raised
 * because practice was RECORDED mid-sync has no session to resume — offering a
 * link to /active there would be a dead control that bounces straight back,
 * and that deferral needs no tap at all: it clears itself on the next sync.
 */
function SyncNotice({ pathname }: { pathname: string }) {
  const phase = useSyncStatus((s) => s.phase);
  const message = useSyncStatus((s) => s.message);
  const unfinished = useStore((s) => hasUnfinishedPractice(s));
  if (pathname === '/settings') return null; // Settings shows the full panel.
  if (phase !== 'conflict' && phase !== 'error' && phase !== 'deferred') return null;
  if (phase === 'deferred') {
    return (
      <div className="card card-quiet row between small" style={{ marginBottom: 'var(--space-4)' }}>
        <span className="dim">Sync is waiting: {message}</span>
        {unfinished && (
          <NavLink to="/active" className="link" style={{ flex: 'none' }}>
            Resume
          </NavLink>
        )}
      </div>
    );
  }
  return (
    <div className="card card-quiet row between small" style={{ marginBottom: 'var(--space-4)' }}>
      <span className="dim">
        {phase === 'conflict' ? 'Sync needs a decision.' : `Sync problem: ${message}`}
      </span>
      <NavLink to="/settings" className="link" style={{ flex: 'none' }}>
        Open Settings
      </NavLink>
    </div>
  );
}
```

### src/domain/practiceSession.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  decideReplacement,
  deferredSyncRetry,
  hasUnfinishedPractice,
  installDatabase,
  isStaleClock,
  proposedCloseMinutes,
  type UnfinishedBlock,
  type UnfinishedRoutine,
} from './practiceSession';
import { createBlock, createInstrument } from './factories';
import { emptyDB } from './seed';
import type { PracticeDB } from './types';

const NOW = new Date('2026-06-18T12:00:00.000Z');

/**
 * A block being practised right now: 12 minutes into a 10-minute target. Past
 * its target, which is completely ordinary — practising past the target is
 * normal, so this is LIVE, not stale.
 */
function liveBlock(o: Partial<UnfinishedBlock> = {}): UnfinishedBlock {
  return { itemId: 'item-1', targetMinutes: 10, accumulatedSeconds: 12 * 60, running: true, ...o };
}

/** The same block paused — genuinely elapsed minutes, no live timestamp. */
function pausedBlock(): UnfinishedBlock {
  return liveBlock({ running: false });
}

/** A clock left running overnight: eight hours against a ten-minute target. */
function staleBlock(): UnfinishedBlock {
  return liveBlock({ accumulatedSeconds: 8 * 3600 });
}

function routine(o: Partial<UnfinishedRoutine> = {}): UnfinishedRoutine {
  return { routineId: 'routine-1', accumulatedSeconds: 5 * 60, running: true, ...o };
}

const NOTHING = { active: null, activeRoutine: null };

// --- A1: nothing replaces an unfinished session -------------------------------
//
// `active` lives outside `db`, so the revision counter never bumps while you
// practise; a mid-block device therefore looks UNCHANGED to the hash
// comparison, a remote change resolves to a straight pull, and importDB nulls
// `active`. Committed data is archived first — the in-flight block is not.
//
// The invariant is UNCONDITIONAL. PRESENCE decides regardless of running or
// paused, fresh or stale, ordinary or routine. An earlier draft let a stale
// clock stop deferring, which would have promoted a heuristic about a DURATION
// into an authority to destroy practice — a session paused at three genuine
// hours crosses any sensible threshold.
//
// Presence is not the whole guard, because it cannot see practice that was
// started AND FINISHED while the replacement was in flight: that leaves no
// session behind, only a recorded block the incoming snapshot would overwrite.
// The second blocking reason is the local REVISION moving — a counter, not a
// clock and not a heuristic.

describe('A1 · a replacement never destroys an unfinished practice session', () => {
  it('refuses a replacement for a running, a paused, and a stale unfinished session alike', () => {
    const cases: { why: string; session: { active: UnfinishedBlock | null; activeRoutine: UnfinishedRoutine | null } }[] = [
      { why: 'running ordinary block', session: { active: liveBlock(), activeRoutine: null } },
      { why: 'PAUSED block — pausing protects, it does not expose', session: { active: pausedBlock(), activeRoutine: null } },
      { why: 'STALE block — an implausible duration is never permission to discard', session: { active: staleBlock(), activeRoutine: null } },
      { why: 'running routine', session: { active: null, activeRoutine: routine() } },
      { why: 'paused routine', session: { active: null, activeRoutine: routine({ running: false }) } },
      {
        why: 'the frozen dual pair the persist merge produces — unfinished practice like any other',
        session: { active: pausedBlock(), activeRoutine: routine({ running: false }) },
      },
    ];

    for (const c of cases) {
      expect(hasUnfinishedPractice(c.session), c.why).toBe(true);
      expect(decideReplacement({ intent: 'deliberate', session: c.session }).outcome, c.why).toBe('refuse');
      expect(decideReplacement({ intent: 'automatic', session: c.session }).outcome, c.why).toBe('defer');
    }
  });

  it('allows a replacement when no unfinished practice session exists', () => {
    expect(hasUnfinishedPractice(NOTHING)).toBe(false);
    expect(decideReplacement({ intent: 'deliberate', session: NOTHING }).outcome).toBe('proceed');
    expect(decideReplacement({ intent: 'automatic', session: NOTHING }).outcome).toBe('proceed');
    // Nothing to say when nothing is in the way.
    expect(decideReplacement({ intent: 'deliberate', session: NOTHING }).message).toBe('');
  });

  it('reaches the same replacement decision for a stale session as for a live one', () => {
    // The two inputs genuinely differ — 12 minutes against 8 hours, one of
    // which `isStaleClock` calls stale — and the decision must not.
    const live = { active: liveBlock(), activeRoutine: null };
    const stale = { active: staleBlock(), activeRoutine: null };
    expect(isStaleClock(live.active.accumulatedSeconds, live.active.targetMinutes)).toBe(false);
    expect(isStaleClock(stale.active.accumulatedSeconds, stale.active.targetMinutes)).toBe(true);

    for (const intent of ['automatic', 'deliberate'] as const) {
      expect(decideReplacement({ intent, session: stale })).toEqual(decideReplacement({ intent, session: live }));
    }
  });

  it('defers automatic sync but returns an explicit refusal for a deliberate replacement', () => {
    const session = { active: liveBlock(), activeRoutine: null };
    const auto = decideReplacement({ intent: 'automatic', session, labels: { itemTitle: 'درآمد ماهور' } });
    const deliberate = decideReplacement({ intent: 'deliberate', session, labels: { itemTitle: 'درآمد ماهور' } });

    // A background merge waiting its turn is not a failure, and not silent.
    expect(auto.outcome).toBe('defer');
    expect(auto.message).toContain('درآمد ماهور');
    // A deliberate Import / Restore archive / Keep remote is told out loud —
    // never a silent no-op that looks like a broken button, never a silent
    // discard. Both name the session that is in the way.
    expect(deliberate.outcome).toBe('refuse');
    expect(deliberate.message).toContain('درآمد ماهور');
    expect(deliberate.outcome).not.toBe(auto.outcome);
  });

  it('refuses a replacement when practice was recorded on this device after the replacement was decided', () => {
    // The window presence CANNOT see. A pull is decided against local revision
    // 7; while the remote copy downloads, the pre-sync archive is written and
    // `replaceAllBlobs` runs, a block is started AND FINISHED. There is no
    // unfinished session left to find, and the recorded block is in neither
    // the archive nor the incoming snapshot — installing it would destroy a
    // minute that was genuinely played, with nothing holding a copy.
    const moved = { intent: 'automatic' as const, session: NOTHING, revision: { decidedFrom: 7, current: 8 } };
    expect(hasUnfinishedPractice(NOTHING)).toBe(false);
    expect(decideReplacement(moved).outcome).toBe('defer');
    // Waiting, not broken — and NOT on something to finish or discard, because
    // the practice is already recorded. The `rev` bump that raised this is
    // what the quiet-period auto-sync watches, so the next run offers both
    // copies as an explicit conflict.
    expect(decideReplacement(moved).message).not.toContain('discard');
    expect(decideReplacement({ ...moved, intent: 'deliberate' }).outcome).toBe('refuse');

    // Discriminating: an UNMOVED revision is not a blocker. Without this the
    // guard could be satisfied by refusing every replacement forever, which
    // would be a permanent silent sync outage — worse than the bug.
    expect(decideReplacement({ ...moved, revision: { decidedFrom: 7, current: 7 } }).outcome).toBe('proceed');
    expect(decideReplacement({ ...moved, intent: 'deliberate', revision: { decidedFrom: 7, current: 7 } }).outcome).toBe('proceed');

    // Both reasons at once: PRESENCE answers first, so the message can still
    // name the session that is in the way (ac-8).
    const both = decideReplacement({
      intent: 'deliberate',
      session: { active: liveBlock(), activeRoutine: null },
      labels: { itemTitle: 'درآمد ماهور' },
      revision: { decidedFrom: 7, current: 8 },
    });
    expect(both.outcome).toBe('refuse');
    expect(both.message).toContain('درآمد ماهور');
  });

  it('names the blocking session neutrally rather than fabricating a title', () => {
    const noTitle = decideReplacement({ intent: 'deliberate', session: { active: liveBlock(), activeRoutine: null } });
    expect(noTitle.message).toContain('a practice block');
    const r = decideReplacement({ intent: 'deliberate', session: { active: null, activeRoutine: routine() } });
    expect(r.message).toContain('a routine');
  });
});

// --- The deferred sync really resumes ----------------------------------------
//
// The trigger is the blocking condition CLEARING, not an incidental database
// write. closeSession writes a block and bumps `rev`; cancelSession is a bare
// `set({ active: null })` that writes nothing at all. Watching `rev` would
// resume after a finish and wait forever after a discard.

describe('a deferred sync resumes when the blocking session clears', () => {
  it('resumes a deferred sync when the session clears, whether it was finished or discarded', () => {
    const item = 'item-1';
    const block = createBlock(
      { practiceItemId: item, instrumentId: 'setar', durationMinutes: 12, mode: 'repair', focus: 'tone', result: 'slightly_better', startedAt: NOW.toISOString() },
      NOW,
    );

    // Practising, sync deferred.
    const practising = { active: liveBlock(), activeRoutine: null, blocks: [], rev: 4 };
    // FINISHED: a block was written, so the revision counter moved.
    const finished = { active: null, activeRoutine: null, blocks: [block], rev: 5 };
    // DISCARDED: nothing was written at all, so the revision counter did NOT.
    // This is the half the rev-watching design silently failed.
    const discarded = { active: null, activeRoutine: null, blocks: [], rev: 4 };
    expect(discarded.rev).toBe(practising.rev);
    expect(discarded.blocks).toHaveLength(0);
    expect(finished.rev).not.toBe(practising.rev);

    for (const [why, after] of [['finished', finished], ['discarded', discarded]] as const) {
      expect(
        deferredSyncRetry({
          pending: true,
          wasUnfinished: hasUnfinishedPractice(practising),
          isUnfinished: hasUnfinishedPractice(after),
        }),
        why,
      ).toBe(true);
    }
  });

  it('does not fire without a pending deferral, and not while practice is still unfinished', () => {
    expect(deferredSyncRetry({ pending: false, wasUnfinished: true, isUnfinished: false })).toBe(false);
    expect(deferredSyncRetry({ pending: true, wasUnfinished: true, isUnfinished: true })).toBe(false);
    // An ordinary load with no session must not read as a transition.
    expect(deferredSyncRetry({ pending: true, wasUnfinished: false, isUnfinished: false })).toBe(false);
  });
});

// --- A2: honest minutes ------------------------------------------------------

describe('A2 · an abandoned clock never writes practice that did not happen', () => {
  it('proposes the target for an abandoned block and the real elapsed minutes for an overrun one', () => {
    // Abandoned: eight hours against a ten-minute target. Propose the target,
    // not the fabricated gap that would otherwise poison the item's totals,
    // the instrument balance, the Teacher Report and every insight forever.
    const abandoned = proposedCloseMinutes(8 * 3600, 10);
    expect(abandoned.stale).toBe(true);
    expect(abandoned.minutes).toBe(10);

    // Genuinely overrun: twenty minutes past a ten-minute target. Practising
    // past the target is completely ordinary and still proposes the real time.
    const overrun = proposedCloseMinutes(30 * 60, 10);
    expect(overrun.stale).toBe(false);
    expect(overrun.minutes).toBe(30);
  });

  it('judges a short block against the floor and a long one against the multiple', () => {
    // A 10-minute target is not abandoned at 40 minutes (4× target) — the
    // absolute floor is what decides a short block.
    expect(isStaleClock(40 * 60, 10)).toBe(false);
    // A 90-minute target is not abandoned at 3 hours either — the multiple is
    // what decides a long one, and 3h is only 2× its target.
    expect(isStaleClock(3 * 3600, 90)).toBe(false);
    // Both thresholds crossed.
    expect(isStaleClock(9 * 3600, 90)).toBe(true);
  });
});

// --- A8: installing a new database leaves nothing pointing at the old one -----

describe('A8 · installing a replacement database clears the state that pointed at the old one', () => {
  function dbWith(instrumentIds: string[]): PracticeDB {
    return {
      ...emptyDB(),
      instruments: instrumentIds.map((id) => ({ ...createInstrument({ name: id }, NOW), id })),
    };
  }

  it('clears the running plan and drops a session instrument the new database lacks, keeping one it has', () => {
    const incoming = dbWith(['setar']);

    // Dropped: the new database has no such instrument, so keeping it would
    // scope Today to something that no longer exists.
    const dangling = installDatabase({ db: incoming, sessionInstrumentId: 'guitar' });
    expect(dangling.sessionInstrumentId).toBeNull();

    // Kept: it still resolves, so there is nothing dangling about it.
    expect(installDatabase({ db: incoming, sessionInstrumentId: 'setar' }).sessionInstrumentId).toBe('setar');
    // Kept: the cross-instrument overview is not an instrument reference.
    expect(installDatabase({ db: incoming, sessionInstrumentId: 'all' }).sessionInstrumentId).toBe('all');

    // Cleared in the SAME object as the new db — which is what makes it
    // impossible for importDB, resetDemo or clearAll to install a database
    // without the reset. (The Node environment cannot import useStore.ts, so
    // the function's SHAPE is what protects the wiring; the manual:OWNER check
    // exercises all three on device.)
    expect(dangling.activePlan).toBeNull();
    expect(dangling.active).toBeNull();
    expect(dangling.activeRoutine).toBeNull();
    expect(dangling.notNow).toEqual({ date: '', ids: [] });
    expect(dangling.db).toBe(incoming);
  });

  it('cannot return a database without the ephemeral reset beside it', () => {
    // The signature is the guarantee: every key the store must set arrives
    // together, so `set(installDatabase(...))` is the whole operation.
    const result = installDatabase({ db: dbWith(['setar']), sessionInstrumentId: null });
    expect(Object.keys(result).sort()).toEqual(
      ['active', 'activePlan', 'activeRoutine', 'db', 'notNow', 'sessionInstrumentId'].sort(),
    );
  });
});
```

### src/domain/practiceSession.ts

```
import type { ID, PracticeDB } from './types';

// ---------------------------------------------------------------------------
// Pure decisions about the unfinished practice SESSION itself — the sibling of
// practiceSignal.ts, which owns pure decisions about a running clock's
// SIGNALS (wake lock, boundary announcements). Nothing here may ever be fed
// into `shouldKeepAwake` or `nextSignal`: no wake-lock or audio outcome may
// influence a recorded minute, and no staleness verdict may influence whether
// the screen stays awake.
//
// TWO INDEPENDENT QUESTIONS live here, and conflating them is the bug this
// module exists to prevent:
//
//   PRESENCE     — does an unfinished session exist? Running or paused, fresh
//                  or stale, ordinary or routine: a session that exists is
//                  protected. This, together with whether the local database
//                  has been WRITTEN TO since a replacement was decided (a
//                  revision counter, never a clock and never a heuristic), and
//                  NOTHING else, decides whether a whole-database replacement
//                  may proceed.
//   PLAUSIBILITY — does this session's elapsed figure still look like time
//                  someone actually played? That, and ONLY that, decides what
//                  minutes are proposed at close and whether the session is
//                  worth drawing attention to.
//
// A stale verdict never touches the first question, and no threshold in this
// file is wired to a destructive path. An implausible DURATION says nothing
// about whether the session holds practice worth keeping: a session paused at
// three genuine hours would cross any sensible threshold, and discarding it
// would be a heuristic promoted into an authority to destroy data.
// ---------------------------------------------------------------------------

/**
 * The unfinished-clock shapes this module reads. Structurally compatible with
 * the store's `ActiveSession` / `ActiveRoutine` (which live in useStore.ts
 * because they are EPHEMERAL store state, never persisted domain types), and
 * declared here so the domain stays free of any store import.
 *
 * The timing fields are deliberately part of the input to `decideReplacement`
 * even though it must never read them — that is what makes "a stale session
 * blocks a replacement exactly as hard as a live one" a genuine assertion
 * over genuinely different inputs, rather than a tautology.
 */
export interface UnfinishedBlock {
  itemId: ID;
  targetMinutes: number;
  accumulatedSeconds: number;
  running: boolean;
}

export interface UnfinishedRoutine {
  routineId: ID;
  accumulatedSeconds: number;
  running: boolean;
}

export interface UnfinishedPractice {
  kind: 'block' | 'routine';
  /** What to call it in a visible message — never a fabricated title. */
  label: string;
}

export interface EphemeralPractice {
  active: UnfinishedBlock | null;
  activeRoutine: UnfinishedRoutine | null;
}

/**
 * PRESENCE, and nothing else. Never reads `running` — pausing a session must
 * protect it, not expose it — and never reads elapsed time. The frozen
 * `active` + `activeRoutine` pair the persist middleware's `merge` produces on
 * hydration is unfinished practice like any other: both are paused, both hold
 * genuinely-elapsed minutes, and the owner resolves one of them.
 */
export function hasUnfinishedPractice(s: EphemeralPractice): boolean {
  return !!s.active || !!s.activeRoutine;
}

/** Describe the unfinished session for a visible message, or null if none. */
export function unfinishedPractice(
  s: EphemeralPractice,
  labels?: { itemTitle?: string; routineName?: string },
): UnfinishedPractice | null {
  if (s.active) return { kind: 'block', label: labels?.itemTitle?.trim() || 'a practice block' };
  if (s.activeRoutine) return { kind: 'routine', label: labels?.routineName?.trim() || 'a routine' };
  return null;
}

/**
 * How a whole-database replacement is answered while practice is unfinished.
 * `defer` is quiet and retried; `refuse` is said out loud. Neither is ever a
 * silent no-op, and neither ever discards the session.
 */
export type ReplacementOutcome = 'proceed' | 'defer' | 'refuse';

export interface ReplacementDecision {
  outcome: ReplacementOutcome;
  /** Empty when the replacement proceeds; otherwise what the owner is told. */
  message: string;
}

/**
 * THE CORE SAFETY DECISION. A replacement never destroys practice the owner
 * did not aim it at. TWO INDEPENDENT REASONS block one, and both are about
 * practice that would be DESTROYED — neither is a heuristic about a duration:
 *
 *   PRESENCE — an unfinished session exists (ordinary or routine, RUNNING OR
 *              PAUSED, FRESH OR STALE). The elapsed figures on the inputs are
 *              ignored by construction: staleness is not, and can never
 *              become, permission to destroy practice.
 *   REVISION — the local database has been WRITTEN TO since this replacement
 *              was decided against it. An inbound snapshot is only safe to
 *              install over the database it was compared with; a block
 *              started AND FINISHED while the pull was in flight leaves no
 *              unfinished session behind, so presence cannot see it, and it
 *              exists in neither the pre-sync archive nor the incoming
 *              snapshot. `rev` is a monotonic COUNTER bumped on every db
 *              mutation, never a clock — no timestamp enters this decision.
 *
 * PRESENCE is answered first, so a message that can name the blocking session
 * always does.
 *
 * Automatic (background sync) and deliberate (Import, Restore archive, Keep
 * remote) are answered differently because silence would be wrong in opposite
 * directions: a background merge waiting its turn is not a failure and an
 * alert would be noise, while a deliberate choice that quietly did nothing
 * looks like a broken button.
 */
export function decideReplacement(args: {
  intent: 'automatic' | 'deliberate';
  session: EphemeralPractice;
  labels?: { itemTitle?: string; routineName?: string };
  /**
   * The local revision counter as it stood when this replacement was decided,
   * and as it stands now. Unequal means practice (or any other edit) was
   * committed on this device in between. Optional: a caller that cannot move
   * between the decision and the install has nothing to compare.
   */
  revision?: { decidedFrom: number; current: number };
}): ReplacementDecision {
  const blocking = unfinishedPractice(args.session, args.labels);
  if (blocking) {
    const what = blocking.kind === 'block' ? `an unfinished practice block (${blocking.label})` : `an unfinished routine (${blocking.label})`;
    if (args.intent === 'automatic') {
      return { outcome: 'defer', message: `Waiting on ${what} — sync will finish on its own once you finish or discard it.` };
    }
    return {
      outcome: 'refuse',
      message: `Not replaced: ${what} is still open, and replacing your data would destroy it. Finish or discard it first — Today's In-progress card leads straight there.`,
    };
  }

  if (args.revision && args.revision.current !== args.revision.decidedFrom) {
    // Nothing to finish or discard here — the practice is already recorded.
    // The automatic case heals itself without any deferral retry: the very
    // write that raised this bumped `rev`, which the quiet-period auto-sync
    // watches, and the next run sees both sides changed and offers the owner
    // an explicit choice with both copies preserved.
    if (args.intent === 'automatic') {
      return {
        outcome: 'defer',
        message: 'Waiting: practice was recorded on this device while the sync was running. Sync will run again shortly and offer you both copies.',
      };
    }
    return {
      outcome: 'refuse',
      message: 'Not replaced: practice was recorded on this device after this replacement started, and replacing your data now would destroy it. Nothing is lost — try again.',
    };
  }

  return { outcome: 'proceed', message: '' };
}

/**
 * Whether a DEFERRED sync should fire now. The trigger is the blocking
 * condition CLEARING, not an incidental database write: `closeSession` writes
 * a block (bumping the revision counter), but `cancelSession` is a bare
 * `set({ active: null })` that writes nothing at all. Watching the revision
 * would resume after a finish and wait forever after a discard.
 */
export function deferredSyncRetry(args: { pending: boolean; wasUnfinished: boolean; isUnfinished: boolean }): boolean {
  return args.pending && args.wasUnfinished && !args.isUnfinished;
}

// --- PLAUSIBILITY: what minutes to propose, and what to draw attention to ----

/**
 * A clock is stale when elapsed exceeds BOTH a generous multiple of its own
 * target AND an absolute floor — so a short block is judged against the floor
 * (a 10-minute target is not abandoned at 40 minutes) and a long one against
 * the multiple (a 90-minute target is not abandoned at 3 hours).
 *
 * These are heuristics wired to exactly two non-destructive outcomes: the
 * minutes CloseBlock proposes, and the attention state that makes a session
 * holding sync visible. Never to a destructive path.
 */
export const STALE_TARGET_MULTIPLE = 4;
export const STALE_FLOOR_SECONDS = 3 * 3600;

export function isStaleClock(elapsedSeconds: number, targetMinutes: number): boolean {
  const targetSeconds = Math.max(1, targetMinutes) * 60;
  return elapsedSeconds > targetSeconds * STALE_TARGET_MULTIPLE && elapsedSeconds > STALE_FLOOR_SECONDS;
}

export interface ProposedMinutes {
  minutes: number;
  /** True when the wall-clock figure was rejected as implausible. */
  stale: boolean;
}

/**
 * The minutes to pre-fill on the close screen. Ordinary overtime is untouched
 * — practising past the target is completely normal and still proposes the
 * real elapsed time. An abandoned clock proposes the block's own TARGET
 * instead, so a forgotten timer can never quietly write eight hours of
 * practice that did not happen. The figure is a proposal either way: it is an
 * editable field and the owner's correction always wins.
 */
export function proposedCloseMinutes(elapsedSeconds: number, targetMinutes: number): ProposedMinutes {
  const stale = isStaleClock(elapsedSeconds, targetMinutes);
  const minutes = stale ? Math.max(1, Math.round(targetMinutes)) : Math.max(1, Math.round(elapsedSeconds / 60));
  return { minutes, stale };
}

// --- Installing a replacement database ---------------------------------------

/**
 * Everything the store must set when a new database is installed. The `db` and
 * the ephemeral reset arrive in ONE object deliberately: `importDB`,
 * `resetDemo` and `clearAll` each become a single `set()` of this result, so
 * installing a database WITHOUT clearing the state that pointed at the old one
 * stops being an omission a reviewer has to catch and becomes something the
 * code cannot express. (The Node test environment cannot import useStore.ts —
 * it pulls in Dexie via ./idb — so this shape is what protects the wiring.)
 */
export interface InstalledDatabase {
  db: PracticeDB;
  active: null;
  activeRoutine: null;
  activePlan: null;
  notNow: { date: string; ids: ID[] };
  sessionInstrumentId: ID | null;
}

/**
 * Install a replacement database, clearing every piece of ephemeral state tied
 * to the one it replaces: the running plan, today's dismissed reviews, and a
 * session instrument the new database does not contain. A session instrument
 * that still resolves is KEPT, as is the cross-instrument 'all' overview —
 * there is nothing dangling about either.
 *
 * This is not a guard. Deliberate erasure (reset to demo, erase everything) is
 * aimed at destroying the data and already confirms first; refusing it would
 * be obstruction rather than safety. It must simply leave nothing pointing at
 * a database that no longer exists.
 */
export function installDatabase(args: { db: PracticeDB; sessionInstrumentId: ID | null }): InstalledDatabase {
  const { db, sessionInstrumentId } = args;
  const keepInstrument =
    sessionInstrumentId === 'all' || db.instruments.some((i) => i.id === sessionInstrumentId);
  return {
    db,
    active: null,
    activeRoutine: null,
    activePlan: null,
    notNow: { date: '', ids: [] },
    sessionInstrumentId: keepInstrument ? sessionInstrumentId : null,
  };
}
```

### src/store/backup.ts

```
import { decideReplacement, nowISO, parseImport, SCHEMA_VERSION } from '../domain';
import { allBlobs, replaceAllBlobs, type AttachmentBlob } from './idb';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Full backup = the JSON data PLUS the attachment file bytes (base64), so a
// single file is a complete, portable copy of everything. Save it to your NAS
// / iCloud; import restores data and files together.
// ---------------------------------------------------------------------------

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

interface BackupFile {
  id: string;
  ownerId: string;
  /** Legacy (schema ≤ 5) backups used itemId. */
  itemId?: string;
  mime: string;
  name: string;
  data: string; // base64
}

/** Metadata describing where/when a backup was made (for safe handoff). */
export interface BackupMeta {
  deviceName?: string;
  /** Most recent updatedAt across the data — "how new is this backup". */
  lastModified?: string;
}

const DEVICE_NAME_KEY = 'pc-device-name';

/** Per-device label; deliberately in localStorage, NOT in the backup data. */
export function getDeviceName(): string {
  try {
    return localStorage.getItem(DEVICE_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setDeviceName(name: string): void {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

const NAS_BASE_URL_KEY = 'pc-nas-base-url';

/**
 * Base URL for resolving relative class-recording paths (e.g. the NAS Tailscale
 * HTTPS root that serves the video folders). Per-device in localStorage — it is
 * environment config, never synced or written into backups, and never a place
 * for a password.
 */
export function getNasBaseUrl(): string {
  try {
    return localStorage.getItem(NAS_BASE_URL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setNasBaseUrl(url: string): void {
  try {
    localStorage.setItem(NAS_BASE_URL_KEY, url.trim());
  } catch {
    /* ignore */
  }
}

/** Most recent updatedAt/createdAt across everything — the data's "age". */
export function lastModifiedOf(db: ReturnType<typeof useStore.getState>['db']): string {
  let max = '';
  const scan = (rows: { updatedAt?: string; createdAt?: string; startedAt?: string }[]) => {
    for (const r of rows) {
      const t = r.updatedAt ?? r.startedAt ?? r.createdAt ?? '';
      if (t > max) max = t;
    }
  };
  scan(db.items);
  scan(db.blocks);
  scan(db.lessons);
  scan(db.materials);
  scan(db.pathwayStages);
  scan(db.attachments);
  return max;
}

export async function buildFullBackup(now: Date = new Date()): Promise<string> {
  const db = useStore.getState().db;
  const blobs = await allBlobs();
  const files: BackupFile[] = await Promise.all(
    blobs.map(async (b) => {
      const meta = db.attachments.find((a) => a.id === b.id);
      return {
        id: b.id,
        ownerId: b.ownerId,
        mime: meta?.mime ?? b.blob.type ?? 'application/octet-stream',
        name: meta?.name ?? 'file',
        data: await blobToBase64(b.blob),
      };
    }),
  );
  return JSON.stringify({
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(now),
    deviceName: getDeviceName() || undefined,
    lastModified: lastModifiedOf(db) || undefined,
    data: db,
    files,
  });
}

/** Peek at a backup's provenance without importing it. */
export function readBackupMeta(text: string): (BackupMeta & { exportedAt?: string }) | null {
  try {
    const parsed = JSON.parse(text) as { exportedAt?: string; deviceName?: string; lastModified?: string };
    return { exportedAt: parsed.exportedAt, deviceName: parsed.deviceName, lastModified: parsed.lastModified };
  } catch {
    return null;
  }
}

/**
 * Names for whatever practice is unfinished right now, for a visible message.
 * Lives here because this module already reads the store; used by both the
 * import refusal below and the sync deferral notice. Never fabricates a title:
 * `decideReplacement` falls back to a neutral phrase when one is missing.
 */
export function unfinishedPracticeLabels(): { itemTitle?: string; routineName?: string } {
  const { active, activeRoutine, db } = useStore.getState();
  return {
    itemTitle: active ? db.items.find((i) => i.id === active.itemId)?.title : undefined,
    routineName: activeRoutine ? db.pathwayRoutines.find((r) => r.id === activeRoutine.routineId)?.name : undefined,
  };
}

export type ImportOutcome =
  | { ok: true; fileCount: number }
  | {
      ok: false;
      error: string;
      /**
       * True when the refusal was a DEFERRAL, not a failure — an automatic sync
       * that will resume by itself. The caller must not dress this as an error:
       * `error` phase is not what App.tsx's retry watches, so reporting one
       * would turn a session that resolves in a minute into a silent outage.
       */
      deferred?: boolean;
    };

type ImportRefusal = Extract<ImportOutcome, { ok: false }>;

/**
 * Is a whole-database replacement refused right now? Read fresh each time it is
 * asked, because the answer can change mid-import — BOTH reasons can arise
 * after the replacement was decided. The intent is the caller's: a sync pull is
 * AUTOMATIC and defers quietly, everything else is DELIBERATE and refuses out
 * loud. `decidedFromRev` is the local revision the replacement was decided
 * against; a different one now means practice was committed in between and
 * installing the snapshot would destroy it.
 */
function replacementRefusal(intent: 'automatic' | 'deliberate', decidedFromRev: number): ImportRefusal | null {
  const { active, activeRoutine, rev } = useStore.getState();
  const decision = decideReplacement({
    intent,
    session: { active, activeRoutine },
    labels: unfinishedPracticeLabels(),
    revision: { decidedFrom: decidedFromRev, current: rev },
  });
  if (decision.outcome === 'proceed') return null;
  return { ok: false, error: decision.message, deferred: decision.outcome === 'defer' };
}

/**
 * Import a full backup. Decodes every file BEFORE touching any existing data —
 * a single corrupt file aborts the whole import with nothing changed, rather
 * than clearing existing blobs and silently losing the ones that fail to
 * decode. Once every file decodes cleanly, the blob replacement runs as one
 * IndexedDB transaction (`replaceAllBlobs`) and only then does the JSON `db`
 * get swapped — so a mid-write failure can never leave attachment metadata
 * pointing at blobs that no longer exist.
 *
 * A `files` key that is ENTIRELY ABSENT (not just an empty array) means this
 * isn't a full backup — e.g. a bare state-only export, or a hand-edited file.
 * That case must never be read as "zero attachments" and wipe every existing
 * blob to match; existing blobs are left untouched. A present `files: []` IS
 * treated as a real full backup with no attachments, and does replace (that's
 * the whole point of restoring to a snapshot).
 *
 * This is the chokepoint for every INBOUND replacement — manual import, a sync
 * pull, conflict-keep-remote, and archive restore all arrive here — so it is
 * where local practice is protected. The refusal is the FIRST thing this
 * function does, before the JSON is even parsed: `replaceAllBlobs` below
 * destroys every attachment blob, so a check placed after it would return
 * "nothing was changed" having already wiped them. It is ALSO the last thing
 * before `importDB`, because that first check does not span the whole call —
 * see the comment at the install itself.
 *
 * `decidedFromRev` is the local revision this replacement was decided against.
 * A sync pull passes the revision of the snapshot it actually compared, so the
 * guarded window covers the network fetch and the pre-sync archive too — a
 * block finished in there is in neither the archive nor the incoming snapshot.
 * A deliberate caller has no earlier decision point than this call, so it
 * defaults to the revision on entry.
 */
export async function importFullBackup(
  text: string,
  intent: 'automatic' | 'deliberate' = 'deliberate',
  decidedFromRev: number = useStore.getState().rev,
): Promise<ImportOutcome> {
  // A replacement reaching this function is one the owner chose (Import,
  // Restore archive, Keep remote) or a sync pull that slipped past syncNow's
  // own deferral because practice started mid-sync. Either way an unfinished
  // session — running or paused, fresh or stale, ordinary or routine — is
  // never destroyed by it, nor is a block that was started AND FINISHED since
  // the pull was decided, and never silently: every caller already surfaces
  // this error.
  const refusal = replacementRefusal(intent, decidedFromRev);
  if (refusal) return refusal;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const validated = parseImport(text);
  if (!validated.ok) return { ok: false, error: validated.error };

  const files = (parsed as { files?: BackupFile[] }).files;
  const isFullBackup = Array.isArray(files);
  const rows: AttachmentBlob[] = [];
  if (isFullBackup) {
    for (const f of files) {
      if (!f?.id || typeof f.data !== 'string') continue;
      try {
        rows.push({
          id: f.id,
          ownerId: f.ownerId ?? f.itemId ?? '',
          blob: base64ToBlob(f.data, f.mime || 'application/octet-stream'),
        });
      } catch {
        return { ok: false, error: `File "${f.name ?? f.id}" in the backup is corrupt — nothing was changed.` };
      }
    }
  }

  try {
    // Only touch attachment blobs for a genuine full backup (files array
    // present, however short). A file with no `files` key at all leaves
    // today's attachments exactly as they are.
    if (isFullBackup) await replaceAllBlobs(rows);
  } catch (e) {
    return { ok: false, error: `Could not write attachment files (${e instanceof Error ? e.message : 'unknown error'}) — nothing was changed.` };
  }

  // Checked AGAIN, in the same synchronous tick as the install — ONE call
  // answering BOTH reasons, so no await can ever be slipped between them. The
  // check at the top of this function cannot cover the whole call:
  // `replaceAllBlobs` above yields to the event loop, so during that
  // transaction a tap can start a block or a routine (which `importDB` would
  // null) — or start one AND FINISH it, which leaves no session for presence
  // to see while the recorded block sits in a `db` the incoming snapshot is
  // about to overwrite, held by no archive. The revision comparison is what
  // catches that second case. Nothing awaits between here and the install, so
  // this one is genuinely the last word. The blobs are already written by this
  // point, so the refusal says that plainly rather than claiming nothing
  // changed; the message still names the blocking session when there is one
  // (ac-8), the practice is intact, and re-running the same import afterwards
  // finishes the job.
  const late = replacementRefusal(intent, decidedFromRev);
  if (late) {
    if (!isFullBackup) return late;
    // Say what actually happened; do NOT instruct a manual re-run, because a
    // deferral reaching here is an automatic sync that re-runs itself.
    return { ...late, error: `${late.error} (Your attachment files had already been replaced from the backup — the data itself was not. The next attempt finishes the job.)` };
  }

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount: rows.length };
}
```

### src/store/githubSync.ts

```
import { create } from 'zustand';
import { decideReplacement, hashState, shortHash } from '../domain';
import { buildFullBackup, getDeviceName, importFullBackup, unfinishedPracticeLabels } from './backup';
import { loadPreSyncArchive, loadPreSyncArchiveMeta, savePreSyncArchive, type PreSyncArchiveMeta } from './idb';
import { makeGitHubRemote } from './gitRemote';
import {
  resolveSyncConflict,
  runSync,
  type LocalSnapshot,
  type RemoteSideMeta,
  type SnapshotFile,
  type SyncBook,
  type SyncPorts,
} from './syncEngine';
import { useStore } from './useStore';

// ---------------------------------------------------------------------------
// Device sync over a GitHub repo the user owns — free, no server of ours.
// This module only WIRES the tested engine (syncEngine.ts) to the real app:
// local snapshots come from the proven backup format, the remote is the Git
// Data API (gitRemote.ts), decisions compare content hashes (domain/sync.ts),
// and both sides of a conflict are preserved before anything is replaced.
//
// The token and sync bookkeeping stay in localStorage — per device, never
// inside backups or synced data.
// ---------------------------------------------------------------------------

const CONFIG_KEY = 'pc-sync-config';
const BOOK_KEY = 'pc-sync-state';

export interface SyncConfig {
  /** owner/name, e.g. "ethan-ghoreishi/practice-compass-data" */
  repo: string;
  token: string;
}

/**
 * 'deferred' is a distinct WAITING state, never an error and never a silent
 * no-op: automatic sync holds off while practice is unfinished rather than
 * replacing this device's data and destroying an in-flight block. Nothing
 * switches exhaustively on this type, and Settings compares it only for
 * equality, so a deferral falls through to the generic message in normal
 * colour — which is exactly right, because a background merge waiting its turn
 * is not a failure.
 */
export type SyncPhase = 'off' | 'idle' | 'syncing' | 'synced' | 'deferred' | 'conflict' | 'error';

export interface ConflictSide {
  deviceName?: string;
  savedAt?: string;
  rev?: number;
  hash?: string;
}

export interface SyncStatus {
  phase: SyncPhase;
  message: string;
  lastSyncAt: string | null;
  /** Short content hash of the local data (display only). */
  localHash: string;
  /** Present while phase === 'conflict'. */
  conflict?: { local: ConflictSide; remote: ConflictSide | null; reason: string };
  /** A pre-sync archive exists and can be restored. */
  archiveAvailable: boolean;
  archiveMeta?: PreSyncArchiveMeta | null;
}

export const useSyncStatus = create<SyncStatus>(() => ({
  phase: getSyncConfig() ? 'idle' : 'off',
  message: getSyncConfig() ? 'Not synced yet this session.' : 'Sync is off.',
  lastSyncAt: loadBook().lastSyncAt,
  localHash: '—',
  archiveAvailable: false,
}));

function setStatus(patch: Partial<SyncStatus>) {
  useSyncStatus.setState(patch);
}

/** Refresh the archive flag (called on init and after archive writes). */
export async function refreshArchiveStatus(): Promise<void> {
  const meta = await loadPreSyncArchiveMeta();
  setStatus({ archiveAvailable: !!meta, archiveMeta: meta });
}

// ---- Config + bookkeeping (localStorage, per device) ------------------------

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw) as SyncConfig;
    return cfg.repo && cfg.token ? cfg : null;
  } catch {
    return null;
  }
}

export function setSyncConfig(cfg: SyncConfig | null): void {
  try {
    if (cfg) localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    else {
      localStorage.removeItem(CONFIG_KEY);
      localStorage.removeItem(BOOK_KEY);
    }
  } catch {
    /* ignore */
  }
  setStatus(
    cfg
      ? { phase: 'idle', message: 'Connected — not synced yet.', conflict: undefined }
      : { phase: 'off', message: 'Sync is off.', conflict: undefined },
  );
}

function loadBook(): SyncBook {
  try {
    const raw = localStorage.getItem(BOOK_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SyncBook>;
      // Legacy bookkeeping (timestamp era) lacks lastSyncedHash → treated as
      // a first sync: identical data lands in-sync, differing data is an
      // explicit conflict. Safe either way.
      return {
        lastSyncedHash: parsed.lastSyncedHash ?? null,
        lastRemoteCommit: parsed.lastRemoteCommit ?? null,
        lastSyncAt: parsed.lastSyncAt ?? null,
      };
    }
  } catch {
    /* ignore */
  }
  return { lastSyncedHash: null, lastRemoteCommit: null, lastSyncAt: null };
}

function saveBook(book: SyncBook): void {
  try {
    localStorage.setItem(BOOK_KEY, JSON.stringify(book));
  } catch {
    /* ignore */
  }
}

// ---- Ports ------------------------------------------------------------------

interface BackupShape {
  data?: unknown;
  files: SnapshotFile[];
  [k: string]: unknown;
}

/**
 * The local revision the running sync's comparison was made against. An
 * inbound snapshot is only safe to install over the database it was compared
 * with: between this snapshot and the install sit the remote fetch and the
 * pre-sync archive, and a block started AND FINISHED in that window is in
 * NEITHER the archive nor the incoming copy, with no unfinished session left
 * for the presence guard to see. Module scope is safe for the same reason
 * `running` and `pendingDeferral` are — exactly one sync runs at a time, and
 * `buildLocalSnapshot` always precedes `applySnapshot` in both engine paths.
 */
let syncBaselineRev: number | null = null;

async function buildLocalSnapshot(): Promise<LocalSnapshot> {
  const backup = JSON.parse(await buildFullBackup()) as BackupShape;
  const files = backup.files;
  backup.files = [];
  const rev = useStore.getState().rev;
  syncBaselineRev = rev;
  return {
    stateText: JSON.stringify(backup),
    files,
    hash: await hashState(backup.data ?? {}),
    rev,
    deviceName: getDeviceName(),
  };
}

/**
 * A deferral raised INSIDE a sync run, carried back out to `applyOutcome`.
 * `importFullBackup` defers when practice happened after `syncNow`'s own check
 * — during the network fetch, the pre-sync archive, or `replaceAllBlobs` —
 * whether it is still unfinished or was already recorded, and the only channel
 * out of `runSync` is a thrown error, which would land in `error` phase. That
 * is the wrong answer twice over: a background merge waiting its turn is not a
 * failure, and App.tsx's retry watches `deferred`, so an `error` would leave
 * the sync stopped until something else happened to trigger one. Module scope
 * is safe for the same reason `running` below is: exactly one sync runs at a
 * time, and each entry point clears this first.
 */
let pendingDeferral: string | null = null;

function makePorts(cfg: SyncConfig, intent: 'automatic' | 'deliberate'): SyncPorts {
  return {
    remote: makeGitHubRemote(cfg),
    local: {
      buildSnapshot: buildLocalSnapshot,
      applySnapshot: async (stateText, files) => {
        const backup = JSON.parse(stateText) as BackupShape;
        backup.files = files;
        // Deliberately NOT read inside `importFullBackup`: a manual Import or
        // an archive restore has no earlier decision point than its own call,
        // and a stale baseline left over from a sync run would make it refuse
        // for no reason.
        const result = await importFullBackup(JSON.stringify(backup), intent, syncBaselineRev ?? undefined);
        if (!result.ok) {
          if (result.deferred) pendingDeferral = result.error;
          throw new Error(result.error);
        }
      },
      archivePreSync: async (reason) => {
        const backupText = await buildFullBackup();
        await savePreSyncArchive(
          { savedAt: new Date().toISOString(), reason, deviceName: getDeviceName() || undefined },
          backupText,
        );
        await refreshArchiveStatus();
      },
    },
    book: { load: loadBook, save: saveBook },
    now: () => new Date(),
  };
}

// ---- Public API ---------------------------------------------------------------

let running = false;

function conflictSideOfLocal(local: LocalSnapshot): ConflictSide {
  return { deviceName: local.deviceName || 'this device', rev: local.rev, hash: local.hash };
}

function conflictSideOfRemote(remote: RemoteSideMeta | null): ConflictSide | null {
  return remote ? { deviceName: remote.deviceName, savedAt: remote.savedAt, rev: remote.rev, hash: remote.hash } : null;
}

async function applyOutcome(outcome: Awaited<ReturnType<typeof runSync>>): Promise<void> {
  const at = new Date().toISOString();
  switch (outcome.kind) {
    case 'in-sync':
      setStatus({ phase: 'synced', message: 'Already in sync.', lastSyncAt: at, conflict: undefined });
      break;
    case 'pushed':
      setStatus({
        phase: 'synced',
        message: outcome.direction === 'first-push' ? 'First snapshot pushed to GitHub.' : 'Sent this device’s changes to GitHub.',
        lastSyncAt: at,
        conflict: undefined,
      });
      break;
    case 'pulled':
      setStatus({
        phase: 'synced',
        message: `Brought the GitHub copy${outcome.remote.deviceName ? ` (from “${outcome.remote.deviceName}”)` : ''} onto this device. The previous copy is archived and restorable below.`,
        lastSyncAt: at,
        conflict: undefined,
      });
      break;
    case 'conflict':
      setStatus({
        phase: 'conflict',
        message: outcome.reason,
        conflict: { local: conflictSideOfLocal(outcome.local), remote: conflictSideOfRemote(outcome.remote), reason: outcome.reason },
      });
      break;
    case 'error':
      // A run stopped by unfinished practice is WAITING, not broken.
      if (pendingDeferral) setStatus({ phase: 'deferred', message: pendingDeferral, conflict: undefined });
      else setStatus({ phase: 'error', message: outcome.message });
      break;
  }
  const local = useStore.getState();
  setStatus({ localHash: `r${local.rev} · ${shortHash(await hashState(local.db))}` });
}

export async function syncNow(): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg) return;
  if (!navigator.onLine) {
    setStatus({ phase: 'idle', message: 'Offline — will sync when back online.' });
    return;
  }
  // Checked before the deferral so a sync already in flight is never relabelled
  // as "waiting" — it is genuinely running, and importFullBackup's own guard is
  // what protects a block started mid-sync.
  if (running) return;
  // Defer QUIETLY while practice is unfinished — running or paused, fresh or
  // stale, ordinary or routine. A pull would replace this device's database and
  // silently destroy the in-flight block, which lives outside `db` and is
  // therefore invisible to the hash comparison. The deferral is visible (the
  // notice in Layout says what it is waiting on) and App.tsx retries it the
  // moment the blocking session clears — whether it was finished or discarded.
  const { active, activeRoutine } = useStore.getState();
  const decision = decideReplacement({
    intent: 'automatic',
    session: { active, activeRoutine },
    labels: unfinishedPracticeLabels(),
  });
  if (decision.outcome !== 'proceed') {
    setStatus({ phase: 'deferred', message: decision.message, conflict: undefined });
    return;
  }
  running = true;
  pendingDeferral = null;
  setStatus({ phase: 'syncing', message: 'Syncing…', conflict: undefined });
  try {
    await applyOutcome(await runSync(makePorts(cfg, 'automatic')));
  } finally {
    running = false;
  }
}

export async function resolveConflict(keep: 'local' | 'remote'): Promise<void> {
  const cfg = getSyncConfig();
  if (!cfg || running) return;
  running = true;
  // Keep-remote is DELIBERATE: it never defers, it refuses out loud.
  pendingDeferral = null;
  setStatus({ phase: 'syncing', message: keep === 'local' ? 'Keeping this device’s copy…' : 'Archiving this copy, then taking GitHub’s…' });
  try {
    await applyOutcome(await resolveSyncConflict(makePorts(cfg, 'deliberate'), keep));
  } finally {
    running = false;
  }
}

/** Restore the pre-sync archive (the copy preserved before the last replace). */
export async function restorePreSyncArchive(): Promise<{ ok: boolean; error?: string }> {
  const text = await loadPreSyncArchive();
  if (!text) return { ok: false, error: 'No archived copy exists.' };
  const result = await importFullBackup(text);
  if (!result.ok) return { ok: false, error: result.error };
  setStatus({ phase: 'idle', message: 'Archived copy restored. Sync again when ready — a differing GitHub copy will show as an explicit choice.' });
  return { ok: true };
}
```

## Check against the contract

- [ ] **ac-1** — A6 root cause, and the discriminating pair that defines it: a close carrying NO result leaves the item's next review date exactly as it was, while a close that genuinely DECLINES a review still clears it. Both halves in one test, because the whole bug is that the code cannot currently tell those two states apart. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — A6's second half, folded into the same decision: closing without a result leaves the item's open Review row OPEN, while a genuine decline still completes it. Today closeSession completes the row separately and unconditionally, which is exactly how the row and the date came apart. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THE CORE SAFETY INVARIANT, and the check the owner asked for by name: a whole-database replacement is refused while ANY unfinished practice session exists -- and the test proves the three ways an earlier design would have leaked. A RUNNING session blocks it, a PAUSED session blocks it just as hard, and a STALE session blocks it too. Staleness is not, and can never become, permission to destroy practice. _(proof: refuses a replacement for a running, a paused, and a stale unfinished session alike)_
- [ ] **ac-4** — The discriminating opposite of the check above, so the guard cannot be satisfied by simply refusing everything: with no unfinished session at all, a replacement proceeds normally. _(proof: allows a replacement when no unfinished practice session exists)_
- [ ] **ac-5** — Staleness is confined to non-destructive outcomes. The predicate separates ordinary overtime (LIVE -- practising past the target is normal) from a long-abandoned clock (STALE), and the stale verdict feeds only the proposed minutes and the attention state. Proved by asserting that the replacement decision is identical for a live and a stale session. _(proof: reaches the same replacement decision for a stale session as for a live one)_
- [ ] **ac-6** — A2's consequence for recorded minutes, both directions: an abandoned block proposes its own target rather than the fabricated wall-clock figure, while a genuinely overrun block still proposes its real elapsed minutes. _(proof: proposes the target for an abandoned block and the real elapsed minutes for an overrun one)_
- [ ] **ac-7** — Deferred automatic sync really resumes, after EVERY supported resolution path -- not just the one that happens to write to the database. A deferral pending, the retry fires when the last unfinished session clears, whether it was FINISHED (which writes a block) or DISCARDED (which writes nothing at all and bumps no revision). The discard half is the one the earlier design silently failed. _(proof: resumes a deferred sync when the session clears, whether it was finished or discarded)_
- [ ] **ac-8** — Automatic and deliberate replacement are answered differently, and neither is silent. Automatic sync reports a distinct DEFERRED state rather than an error or a success, while a deliberate Import, Restore archive or Keep remote returns an explicit refusal naming the unfinished session -- never a silent no-op and never a silent discard. _(proof: defers automatic sync but returns an explicit refusal for a deliberate replacement)_
- [ ] **ac-9** — A8's DECISION, discriminating what must be cleared from what must survive: installing a new database clears the running plan and today's dismissed reviews and drops a session instrument the new database lacks, while KEEPING one it still has and keeping the cross-instrument 'all' overview. Scope note, stated honestly: this proves the pure transform, NOT that each store action calls it -- the Node environment cannot import useStore.ts, which pulls in Dexie via ./idb. The WIRING is protected structurally instead: the transform returns the new `db` TOGETHER WITH the ephemeral patch in one object, so importDB, resetDemo and clearAll cannot install a database without it, and the manual:OWNER check exercises all three on device. _(proof: clears the running plan and drops a session instrument the new database lacks, keeping one it has)_
- [ ] **ac-10** — B1's calendar semantics, against the exact trap that makes a rolling window wrong: a block started late yesterday is NOT part of today's total even though it falls inside the last 24 hours, and a block started just after midnight today IS. _(proof: counts by calendar day, so a block from late yesterday is not part of today's total)_
- [ ] **ac-11** — The midnight-crossing rule, pinned rather than assumed: a block begun at 23:40 counts WHOLE against the day it began, with none of its minutes apportioned into the following day -- because durationMinutes is the owner's attested figure and routine blocks carry no endedAt to split by. The same rule decides the Monday boundary, so a session begun Sunday 23:30 belongs to the week that is ending. _(proof: counts a midnight-crossing block whole against the day it began, including across the Monday boundary)_
- [ ] **ac-12** — B1's week boundary: the week starts Monday 00:00 local, so Sunday's practice belongs to the week that is ending and Monday's to the one beginning. _(proof: starts the week on Monday so Sunday's practice belongs to the week that is ending)_
- [ ] **ac-13** — A10: instrument-balance percentages sum to 100 when the block list contains practice for an instrument that is not in the supplied instrument list -- the exact case Today produces by passing only active instruments with all blocks. _(proof: percentages sum to 100 when blocks exist for an instrument not in the supplied list)_
- [ ] **ac-14** — A7's selection rule: the most recent NON-EMPTY next action is returned, so a later block that recorded none does not blank out a decision that still stands, and nothing is returned when none was ever written. _(proof: returns the most recent non-empty next action and nothing when none was ever written)_
- [ ] **ac-15** — End to end in the running app, on the owner's own MacBook and iPhone. (a) Practise an item, tap Finish, try to save with no result -- Save is unavailable; use 'Save without a result' and confirm on the item that its review date and its due review are UNCHANGED. (b) Practise it again and confirm last time's next action is shown before you start playing. (c) Leave a block running overnight, reopen, tap Finish -- the proposed minutes are the target, with a plain line saying why, and the block is STILL THERE to be resolved rather than having been discarded. (d) With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, the block survives, and the sync notice says it is waiting. PAUSE the block and confirm it is still protected. Discard it and confirm sync completes on its own within a few seconds with no further tap. (e) With an unfinished block present, try Import and Restore archive from Settings: each refuses with a message naming the block, and the block is untouched. (f) The wiring the Node tests cannot reach: with a Session Plan running and an instrument selected, use Settings to Import a backup, then Reset to demo data, then Erase all data -- after EACH, confirm no stale plan is still running and the app does not show a session instrument the new database no longer contains. (g) Confirm Today's totals line sits BELOW the 'Practise now' card and that card is still fully visible without scrolling on the iPhone. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/backup.ts, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts
- **install-the-app-and-keep-it-current** — touched via src/components/Layout.tsx
- **log-a-class** — touched via src/domain/selectors.ts, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/store/backup.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Insights.tsx, src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/store/githubSync.ts, src/App.tsx
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts, src/pages/CloseBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/backup.ts, src/store/useStore.ts matched changed file(s) src/store/backup.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts matched changed file(s) src/domain/scheduling.ts, src/domain/selectors.ts, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/Layout.tsx matched changed file(s) src/components/Layout.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/selectors.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/backup.ts matched changed file(s) src/store/backup.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts matched changed file(s) src/domain/blocks.ts, src/domain/scheduling.ts, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/Today.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Insights.tsx, src/pages/Today.tsx matched changed file(s) src/pages/Insights.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/githubSync.ts, src/App.tsx matched changed file(s) src/App.tsx, src/store/githubSync.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

Shares only the PracticeItem entity, not any code path. This lane touches how a block CLOSES (scheduling.ts keep-vs-clear, blocks.ts lastNextAction) and what Today/Insights DERIVE (selectors.ts totals, instrumentBalance denominator). The three Repertoire views are built by repertoire.ts and persian.ts (groupByDastgah, isWork, repertoireWorks), neither of which is touched, and no Repertoire page is in this lane's allowed paths. The one visible consequence for an item is that a resultless close no longer erases its nextReviewDate — a correction to a field Repertoire does not display or group by.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-every-recorded-minute-is-one-you-played--9ed1/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260910-every-recorded-minute-is-one-you-played--9ed1' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-every-recorded-minute-is-one-you-played--9ed1/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-every-recorded-minute-is-one-you-played--9ed1/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
