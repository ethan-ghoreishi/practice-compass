---
id: 20260910-every-recorded-minute-is-one-you-played--9ed1
contractId: 20260910-every-recorded-minute-is-one-you-played--9ed1
contractHash: 18069ba7ae8755c1aad4fc7ec97ecb7ec00ddf235b137716ecc1e0f6f4a2356c
createdAt: 2026-09-10T10:59:33.560Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/16
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260910-every-recorded-minute-is-one-you-played--9ed1

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan the next Practice Compass lane. I want a reasonably wide but still coherent change rather than a very small single fix, optimised for actual user value, correctness, data safety, shared invariants/files, dependency relationships, reviewability and rollback safety.
> 
> Cover the critical daily-practice integrity problems, especially A1/A2 and A6 from docs/review-2026-09-10.md, and respect the coupling between sync safety and stale/abandoned running sessions rather than fixing either superficially. Close the core practice loop: surface the previous block's saved nextAction when the item is practised again, and ensure saving without a result cannot silently alter review scheduling. Give me honest practice-time visibility -- useful neutral totals such as time practised today, this week and all time, with block counts and sensible per-instrument views; calendar-day/week semantics must be correct, it must stay non-gamified, and the stale-session issue must be dealt with before I trust those numbers. Include other high-value correctness issues only where they strengthen the lane rather than making it incoherent.
> 
> Decisions I confirmed while we planned this:
> - Sync guard: defer quietly and auto-retry while practice is unfinished. A forgotten block must not stop sync indefinitely -- but the outage is bounded by MAKING IT VISIBLE and giving me a way to resolve it, never by discarding the session. Staleness itself never permits a replacement.
> - Close block: fix the silent schedule damage AND require a result, with an explicit 'save without a result' escape.
> - Totals: a compact line low on Today plus a full view on Insights; the week starts Monday.
> - Builder: claude.
> 
> Do not force every requested feature in. Explicitly preserve schema-changing/heavy work such as lesson-scoped commitments and first-class item NAS references as well-defined follow-ons, and keep the NAS browsing/viewing work, the iPhone keyboard displacement and the Farsi search wiring out of this lane unless the evidence says otherwise. Preserve the existing product principles: local-first, calm, low-admin, one instrument per session, no gamification, no silent data loss, explainable scheduling, and no timer or wake-lock behaviour altered by unrelated UI features.
> 
> Refined after reviewing the first draft of this plan:
> - An ABANDONED or stale clock must NOT become permission for a whole-database replacement to destroy an unfinished session. Staleness proves the wall-clock duration is implausible and should change the proposed minutes and the attention state; it must never authorise destruction.
> - An unfinished ordinary session or routine is never silently destroyed by an automatic database replacement, and PAUSED sessions are protected too, not only actively ticking clocks.
> - If a stale unfinished session would otherwise hold sync indefinitely, make that condition VISIBLE and give me a clear way to Finish, correct the minutes, or Discard it -- do not resolve the outage by silently losing the practice.
> - Deferred automatic sync must reliably retry once the blocking state is resolved, whether the session was finished OR discarded, without depending on an unrelated future database change.
> - Distinguish automatic from user-initiated replacement. Quiet deferral is right for background sync during practice; but Import, Restore archive and Keep remote must not silently no-op and must not silently discard practice.
> - Check that A8 covers every whole-database/reset path, not only the ones importFullBackup happens to cover.
> - Do not put state-transition logic in selectors.ts merely because it is easy to test; a small purpose-specific pure domain module is better if it is more cohesive.
> - Stress-test the calendar-total semantics against what timestamps the model actually has, and pin the choice with a discriminating test.

## Why

ONE SENTENCE HOLDS THIS LANE TOGETHER: every minute this app records is a minute you actually played, and every number it shows you is derived from those minutes honestly. Minutes are RECORDED honestly (staleness), PROTECTED from destruction (sync guard, ephemeral reset), the block's record does not corrupt something else (result gating), the record is actually USED (next action), and what is REPORTED from them is arithmetically true (calendar totals, balance denominator). Every item below is a step on that one spine.

WHY THESE SHIP TOGETHER RATHER THAN SEPARATELY. Fixing A1 alone -- 'refuse to sync while a clock is running' -- trades a bounded one-block loss for an UNBOUNDED and INVISIBLE sync outage: one block left running overnight stops device sync indefinitely, and SyncNotice (src/components/Layout.tsx:143) only renders for phase 'conflict' or 'error', so a deferral shows nowhere outside Settings. A2 is what makes that outage survivable -- but NOT, as an earlier draft of this plan had it, by letting a stale clock stop deferring. That draft was WRONG and the owner was right to reject it. Staleness proves only that a wall-clock DURATION is implausible; it proves nothing about whether the session holds practice worth keeping. A session paused at three genuine hours, or a long session the owner still means to resolve, would have crossed any sensible threshold and then been discarded by the very mechanism meant to protect it -- a heuristic quietly promoted into an authority to destroy data. The corrected invariant is unconditional: AN UNFINISHED PRACTICE SESSION -- ORDINARY OR ROUTINE, RUNNING OR PAUSED, FRESH OR STALE -- IS NEVER DESTROYED BY A REPLACEMENT THE OWNER DID NOT EXPLICITLY AIM AT IT. Staleness keeps exactly two jobs, both non-destructive: it decides the minutes CloseBlock proposes, and it raises the ATTENTION state so a session blocking sync becomes visible instead of silent. The outage is then bounded by the owner being told and given a resolution path -- Finish, correct the minutes, or Discard -- rather than by the app deciding for them. That is why the two still belong in one lane: A2's predicate is what turns A1's guard from an invisible outage into a visible, resolvable one, without ever being allowed to resolve it destructively. Shipping A1 first would ship the next entry in the review. Separately, A1's guard and A8's ephemeral reset are neighbours. importFullBackup (src/store/backup.ts:160) is the chokepoint for the four INBOUND replacements -- manual import (Settings.tsx:115), sync applySnapshot (githubSync.ts:164), conflict-keep-remote via resolveSyncConflict, and archive restore (githubSync.ts:263) -- so one guard there covers every door data comes IN through. But the owner was right to challenge the claim that it covers everything: VERIFIED, resetDemo (useStore.ts:1373, called from Settings.tsx:293) and clearAll (useStore.ts:1378, called from Settings.tsx:306) are invoked DIRECTLY on the store and never touch importFullBackup at all. There are SIX whole-database replacements, not four. That is exactly why the ephemeral reset belongs in the STORE, applied identically by importDB, resetDemo AND clearAll -- the three places a new `db` object is actually installed -- rather than in importFullBackup where it would silently miss a third of the paths. Touching those three actions twice in two lanes is worse than once.

WHAT THE CODE ACTUALLY SAYS (all verified at 0c6058e, not inherited from the review):
1. A6 is worse than reported and is the most severe item. setReviewDate is called from exactly two places -- pickResult (CloseBlock.tsx:87) and the manual date input (:230). Skip the result and reviewDate stays ''. Save then sends scheduleReview: comeBack && !!reviewDate, which is false, and computeReviewOutcome short-circuits at 'if (!scheduleReview) return { nextReviewDate: null }' (scheduling.ts:368) -- CLEARING the item's date -- while closeSession's reviews.map (useStore.ts:948) completes EVERY open review for that item unconditionally. Net effect of one skipped tap: the open review closes, the next date is erased, SM-2 state is left stale, and the item never appears under Due reviews again. And the panel says the opposite: comeBack defaults to true, so it reads 'Should this come back? Yes' above an empty date field. This breaks r-explainable-scheduling's 'the date shown before saving is exactly the date saved' -- the date shown is nothing and the date saved is cleared. The root cause is that !scheduleReview conflates 'the user declined a review' (clear) with 'the user answered nothing' (keep), and computeReviewOutcome already has the tri-state to express the difference. Fixing it there fixes it for every caller, rather than patching the one screen.
2. A1: `active` is not part of `db`, so withRevision (src/store/revision.ts:26) never bumps `rev` while you practise. A mid-block device therefore looks UNCHANGED to decideSync, so a remote change resolves to 'pull', not 'conflict', and importDB nulls `active`. archivePreSync does run before a pull, so committed data survives -- what is destroyed with no archive and no prompt is the in-flight, never-recorded block. That is narrower than 'sync eats your data' and still a direct breach of r-no-silent-data-loss.
3. A2: sessionElapsedSeconds is unbounded wall clock, so CloseBlock.tsx:41 pre-fills a fabricated figure for an abandoned block. Crucially, routines are ALREADY SAFE here: segmentElapsed clamps with Math.min(seg.seconds, ...) (routines.ts:124), so a routine left running overnight cannot fabricate minutes. Only the ordinary block path needs the pre-fill correction -- both paths still need the sync deferral. That narrowing is why routines.ts and RoutineRunner.tsx are forbidden rather than merely out of scope.
4. A7: PracticeBlock.nextAction is written on every close (CloseBlock.tsx:117) and read nowhere, ever. ActiveBlock.tsx:90 shows item.notes and item.currentProblem instead. The last step of the loop is write-only. Highest value-per-line feature in the repo, zero risk, and it shares both files with A6.
5. B1: totalMinutesInWindow (selectors.ts:152) is exported, tested and used NOWHERE -- the feature is half-built. The trap is that blocksInWindow filters on hours, so days:1 means the last 24 hours, not today, and days:7 means 168 hours, not this week. Calendar totals need a NEW helper, not a reuse of that one; getting this wrong would ship exactly the class of 'the app told me something untrue' problem this lane exists to end.
6. A10 is two lines in the same file the new totals helpers go in, and is the one existing derived number that is arithmetically wrong: instrumentBalance takes its denominator from ALL supplied blocks but only emits rows for the supplied instruments, and Today.tsx:648 passes only ACTIVE instruments with all blocks, so percentages can sum to under 100. Same file, same invariant, free to review alongside.

WHY IT IS TESTABLE WITHOUT NEW TOOLING. vitest runs environment:'node' with include:['src/**/*.test.ts'], so no component test can exist and a prior contract explicitly refused jsdom/fake-indexeddb, saying that untestable store wiring is the signal to push the decision down into a pure domain function. This plan follows that instruction rather than fighting it: every decision becomes a pure, Node-testable function in the module that actually owns it: unfinished-session presence, staleness, proposed closing minutes and the replacement transform all in the NEW src/domain/practiceSession.ts; the keep-vs-clear discrimination in scheduling.ts; the calendar totals and the balance denominator in selectors.ts, which is where derived read-only values belong; and the last-next-action selection over an item's blocks in blocks.ts. practiceSignal.ts is NOT touched and is forbidden -- verified, every one of its consumers (useScreenAwake.ts, ActiveBlock.tsx, RoutineRunner.tsx, useStore.ts) uses shouldKeepAwake, nextSignal and acknowledgeThrough exactly as they are, so forbidding the file turns 'no wake-lock or timer behaviour changes' from a promise into a mechanical guarantee. Two placements matter enough to state outright, because getting them wrong is what would send the builder back for an amendment. FIRST: both halves of A6 are ONE decision, so computeReviewOutcome in scheduling.ts returns not only what nextReviewDate becomes but ALSO whether the item's open reviews should be completed -- today closeSession decides that separately and unconditionally at useStore.ts:948, which is precisely why the date and the row can disagree. Moving it into the same return value makes 'the user answered nothing' produce keep-the-date AND leave-the-row-open from a single branch, in the one place every caller already routes through. SECOND: the ephemeral reset is a pure function in practiceSession.ts, and its SIGNATURE is what makes it safe rather than the discipline of whoever wires it. It takes the incoming PracticeDB plus the current ephemeral state and returns the COMPLETE store patch -- the new `db` TOGETHER WITH active, activeRoutine, activePlan, notNow and the surviving sessionInstrumentId -- so importDB, resetDemo and clearAll each become a single set() of its result. Installing a database WITHOUT the reset stops being an omission a reviewer has to catch and becomes something the code cannot express, because the `db` and the reset arrive in the same object. That structural point matters because the Node test setup cannot exercise useStore.ts at all (it imports ./idb and therefore Dexie), so the unit test proves the DECISION and the shape of the function is what protects the WIRING. The store and the pages become thin callers. Fourteen of the fifteen acceptance checks are automated named unit tests; the single manual:OWNER check covers what genuinely cannot be unit-tested here -- the on-device end-to-end, and the store WIRING at importDB, resetDemo and clearAll that the Node environment cannot reach.

BOUNDARY, STRESS-TESTED. Deliberately OUT: A3 (SM-2 advancing on repeated early practice) is a different invariant, needs an owner decision against r-practice-completes-reviews, and would make this lane about interval semantics as well as minute honesty. A5 (dormant eligibility) is about what to DISPLAY, not what to RECORD. A9 (wiring persianSearchMatch) belongs to browse-my-repertoire and shares no file or invariant with this -- an excellent standalone lane, not a passenger in this one. A4 and item NAS references need SCHEMA_VERSION and are heavy tier; batching them with this would make one sealed review cover unrelated migrations and make rollback coarser. All NAS work waits on the CSP/CORS finding, which is a research question, not an implementation one. The iPhone keyboard is device-specific and cannot be settled from source.

ROLLBACK SAFETY. No schema change, no migration, no change to any persisted shape; SCHEMA_VERSION stays 11. src/domain/types.ts and src/domain/migrations.ts are FORBIDDEN, which makes that guarantee mechanical rather than a promise. The tested sync engine, the hash comparison, the wake lock and the routine clock are all forbidden too. Every change is an additive pure function, a guard, or read-only UI, so `git revert` restores the previous behaviour with zero data consequences.

AUTOMATIC VERSUS DELIBERATE, WHICH IS A REAL DISTINCTION AND NOT A DETAIL. Background auto-sync during practice should defer QUIETLY -- it is a routine background merge and an alert would be noise. But when the owner deliberately chooses Import, Restore archive or Keep remote, silence is the wrong answer twice over: a silent no-op looks like a broken button, and a silent discard is the data loss this lane exists to end. Both get the same guard and different presentations, and VERIFIED, the second costs almost nothing: importFullBackup already returns {ok:false,error} and every deliberate caller already surfaces it -- manual import checks !result.ok (Settings.tsx:115), restoreArchive alerts it (Settings.tsx:371), and both runSync (syncEngine.ts:287) and resolveSyncConflict (syncEngine.ts:338) catch applySnapshot's throw into {kind:'error',message} which applyOutcome renders in the sync panel. So a clear refusal reaches the owner on all three deliberate paths with NO change to Settings.tsx, which is deliberately left out of scope. Automatic sync instead checks the same predicate BEFORE attempting and reports a distinct deferred state, because a deferral is not an error and must not be dressed as one.

THE RETRY, REBUILT. The earlier draft leaned on `rev`: closing a block writes to the database, which bumps the revision counter the existing 30-second quiet-period effect already watches. That is true for closeSession and for finishRoutine, but the owner correctly spotted the hole -- VERIFIED, cancelSession (useStore.ts:884) is a bare set({ active: null }) with no database write and therefore no rev bump, as is closeSession's missing-item bail-out (useStore.ts:892). Discard your block and the deferred sync waits for an unrelated future change or a future app open. Depending on an incidental side effect of one resolution path is not 'defer and retry'; it is defer and hope. The correct trigger is the blocking condition itself: an effect in App.tsx keyed on whether unfinished practice exists, firing syncNow() on the present-to-absent transition when a deferral is pending. That fires for finish, for discard, and for the missing-item path alike, because it watches the state that actually blocks rather than a proxy for one way of clearing it.

CALENDAR SEMANTICS -- CHALLENGED, AND THE CODE STRENGTHENS THE ORIGINAL CHOICE RATHER THAN OVERTURNING IT. The question was whether a block crossing midnight (or the Monday boundary) should be split across days rather than assigned whole to its startedAt day. Two facts in the model settle it against splitting. FIRST, durationMinutes is USER-EDITABLE at close and this very lane makes it diverge from wall clock ON PURPOSE -- an abandoned block proposes its target, not its elapsed gap -- so endedAt minus startedAt is NOT the authored duration, and apportioning by wall-clock overlap would silently overrule the owner's own correction with a number they never attested to. SECOND, VERIFIED at factories.ts:168, endedAt is optional and applyRoutineRun never passes one, so routine blocks HAVE no endedAt and could not be split at all; splitting would quietly apply to some blocks and not others. A block is therefore treated as one indivisible unit of attested practice belonging to the calendar day it began -- truthful, uniform, and needing no schema. This choice is now pinned by its own discriminating test rather than left as a comment, and the same rule gives the Monday boundary its answer: a session begun Sunday 23:30 belongs to the week that is ending.

MODULE PLACEMENT, CORRECTED. An earlier draft put the ephemeral-reset decision in selectors.ts because that file is pure and easy to test. Testability is not cohesion, and the owner was right to reject it: selectors.ts holds derived READ-ONLY lists, and a state-transition rule filed there would sit next to nothing it belongs with. The new src/domain/practiceSession.ts is a genuine sibling to practiceSignal.ts -- that module owns pure decisions about a running clock's SIGNALS, this one owns pure decisions about the unfinished SESSION itself: whether one exists at all (presence, never `running`, so a paused session is protected), whether its elapsed figure is still plausible, what minutes to propose when closing it, and what ephemeral state survives a database replacement. selectors.ts keeps only what it is for -- the calendar totals and the instrument-balance denominator, both genuinely derived read-only values.

## Today

Step 7 of this flow records that saving a block stores a PracticeBlock, advances the item's counters and spaced-repetition state, completes any open review and schedules the next one 'on the date that was shown', and the flow ends with 'The session is recorded honestly: one block, one result, one next action -- and the item knows when it should come back.' Four of those claims are untrue in the code at 0c6058e.

1. ONE RESULT is optional and skipping it damages the schedule. `result` starts null and Save is always enabled. setReviewDate is only reached from pickResult (CloseBlock.tsx:87) or the manual date field, so with no result reviewDate stays empty, scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate: null } and CLEARS the item's date, while closeSession completes every open review for the item regardless (useStore.ts:948). The item silently leaves the review system. The panel meanwhile reads 'Should this come back? Yes' above an empty date field, because comeBack defaults to true.
2. RECORDED HONESTLY is not guaranteed. sessionElapsedSeconds is unbounded wall clock. A block left running overnight pre-fills durationMinutes with the whole gap (CloseBlock.tsx:41), and that figure then poisons the item's totalMinutes, instrumentBalance, the Teacher Report and every insight permanently. Nothing distinguishes a locked phone during real practice from a session abandoned days ago.
3. ONE NEXT ACTION is write-only. nextAction is saved on every close and read by nothing. When the item is practised again, ActiveBlock shows item.notes and item.currentProblem instead, so the decision you deliberately made last time never reaches you.
4. The block can be destroyed before it is ever recorded. `active` lives outside `db`, so `rev` never bumps while you practise; a mid-block device looks unchanged to decideSync, a remote change resolves to pull rather than conflict, and importDB nulls `active`. Committed data is archived first, but the in-flight block is not -- it disappears with no prompt. The same replacement also leaves activePlan, notNow and a now-dangling sessionInstrumentId alive against a database that no longer contains them.

Separately, nothing in the app answers 'how much have I actually practised?'. totalMinutesInWindow is exported and tested but wired to nothing, and the one derived figure that does ship -- Today's instrument balance -- computes its denominator from all blocks while only emitting rows for active instruments, so its percentages can sum to less than 100.

## Instead

Two INDEPENDENT questions govern this lane, and conflating them is what made the first draft wrong. The first is PRESENCE: does an unfinished practice session exist? That, and only that, decides whether a database replacement may proceed -- running or paused, fresh or stale, ordinary or routine, a session that exists is protected. The second is PLAUSIBILITY: does this session's elapsed figure still look like time someone actually played? That, and only that, decides what minutes are proposed at close and whether the session is worth drawing attention to. A stale verdict never touches the first question, and no threshold is ever wired to a destructive path.

SAVING A BLOCK. Save is unavailable until you pick one of the six results; an explicit 'Save without a result' keeps not_logged reachable and deliberate rather than accidental. And underneath, at the one place every caller routes through, answering nothing is no longer read as declining: a close carrying no result LEAVES the item's next review date exactly as it was and leaves its open review OPEN, while genuinely declining a review still clears the date as it does today. These are one decision, not two: computeReviewOutcome returns whether the open reviews should be completed alongside what the date becomes, so the row and the date can no longer disagree -- today closeSession completes the row separately and unconditionally, which is exactly how they came apart. The date shown before saving is once again exactly the date saved, including when that date is 'unchanged'.

HONEST MINUTES. Closing an abandoned block proposes the block's own target rather than the fabricated elapsed figure, and says plainly why in one neutral line, so a forgotten clock can never quietly write eight hours of practice you did not do. Ordinary overtime is untouched -- practising past the target stays completely normal and still pre-fills the real elapsed time.

THE LOOP CLOSES. Practising an item again shows the next action you chose last time, at the top of the practice screen, before you start playing.

NOTHING REPLACES AN UNFINISHED SESSION. One invariant governs this, unconditionally: an unfinished practice session -- ordinary or routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a database replacement the owner did not explicitly aim at it. Presence is what counts, never `running`, so pausing protects a session rather than exposing it; and staleness never earns an exemption, because an implausible DURATION says nothing about whether the session holds practice worth keeping.

Automatic sync therefore defers while any unfinished session exists, quietly, and reports a distinct DEFERRED state rather than an error -- a background merge waiting its turn is not a failure. It retries by watching the blocking condition itself: the moment no unfinished session remains, a pending deferral fires. That covers finishing the block, DISCARDING it, and the missing-item bail-out equally, instead of relying on the database write that only one of those happens to make.

A deliberate replacement is answered differently, because silence would be wrong twice: Import, Restore archive and Keep remote all REFUSE with a plain message naming the session that blocks them and where to resolve it -- never a silent no-op that looks like a broken button, and never a silent discard. The owner is told, and the resolution path is the one that already exists: Today's In-progress card leads to the practice screen, where Finish, correct the minutes, or Discard are all one tap away.

This is where staleness earns its keep without ever being given authority: a stale unfinished session is LABELLED as such on Today's In-progress card, and the sync notice says plainly that sync is waiting on it. A session forgotten overnight can therefore no longer hold sync silently -- but it is the owner who resolves it, not the app that discards it.

When a replacement does proceed, every piece of ephemeral state tied to the old database is cleared in the same step -- the running plan, today's dismissed reviews, and a session instrument the new database does not contain -- while a session instrument that still resolves is kept, including the cross-instrument 'all' overview. This applies identically at all three places a new database is installed: importDB, resetDemo AND clearAll. The last two never pass through importFullBackup, so a fix that lived only there would silently miss them. Deliberate erasure keeps no guard -- reset-to-demo and erase-everything are aimed at destroying the data and already confirm first -- but they must leave no ephemeral state pointing at a database that no longer exists.

HONEST TOTALS. Today carries one compact line BELOW the recommendation -- minutes and block count for today, and for this week -- and Insights carries the full view: today, this week and all time, per instrument. These are calendar figures, not rolling windows: a block from late last night belongs to yesterday, and the week starts on Monday. Neutral counts only -- no target, no streak, no bar that fills, no colour that judges. The existing instrument-balance percentages sum to 100 again.

AND THE DOCUMENTATION STOPS CONTRADICTING THE CODE. README.md still carries an obsolete fixed result-to-interval table ('slightly better +2 days, stable alone +4, performable +21') at README.md:211 that SM-2 replaced long ago, 55 lines above the correct SM-2 description at :267 -- the same section whose meaning this lane changes. That table is DELETED, not updated, and the priority formula just above it gains the lesson-urgency term it has always been missing. In a repository built by agents, a stale specification does not merely mislead a reader; it gets confidently implemented. CLAUDE.md and AGENTS.md record the new invariants together, in the same commit, since they are byte-identical twins.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Staleness is a heuristic about a DURATION, not a judgement about a session's worth. It is wired to exactly two non-destructive outcomes -- the minutes CloseBlock proposes, and the attention state on Today and in the sync notice -- and to no destructive path anywhere. Exact constants are the builder's to choose and pin in tests; a clock is stale when elapsed exceeds both a generous multiple of its own target and an absolute floor, so short blocks are judged against the floor and long ones against the multiple.
- The blocking predicate is PRESENCE of an unfinished session, never whether it is `running`. Pausing must protect a session, not expose it, and a frozen dual-clock pair from the persist merge is unfinished practice like any other.
- Retrying on the blocking condition clearing needs one small effect in App.tsx keyed on whether unfinished practice exists; no polling, no timer, and no new store field beyond a pending-deferral flag alongside the existing sync bookkeeping.
- Deliberate erasure (reset-to-demo, erase-everything) keeps no guard: those actions are aimed at destroying the data and already confirm first. They must still clear ephemeral state, which is why the reset lives in the store rather than in importFullBackup.
- A block belongs whole to the calendar day it began. endedAt is optional and absent on routine blocks, and durationMinutes is user-corrected and deliberately diverges from wall clock, so apportioning across midnight would be fabricated precision rather than extra truth.
- The week starts Monday 00:00 local time (ISO-8601 and UK convention), and 'today' is the local calendar day of a block's startedAt.
- An item's most recent NON-EMPTY nextAction is the right one to surface -- a later block that recorded none should not blank out a decision that still stands.
- Requiring a result is acceptable against r-quick-start because the six options are already the first thing on the close screen; the change makes an existing choice required, it does not add a field.
- Answering the risk questions honestly (touchesSavedData: true) may raise this to heavy tier. That is the correct outcome for a data-safety lane and was accepted when planning; the forbidden-path list is what keeps the rollback trivial even so.

**Possible conflicts**

- This lane adds an additive, display-only totals view to the see-practice-patterns Flow (Insights.tsx and Today.tsx are its recorded touchpoints), but the schema carries only one Delta and the substantive change belongs to practise-todays-recommendation. Nothing that Flow already does is altered or removed -- only new neutral counts are added -- but its recorded truth will need updating afterwards, and the fresh reviewer should expect that rather than read it as scope creep. The one behavioural fix inside it, the instrument-balance denominator, corrects a figure that is currently arithmetically wrong rather than changing what the Flow promises.
- CLAUDE.md and AGENTS.md are byte-identical apart from their title line. Both are in docsDelta and must be edited together or they diverge on the first change -- this lane is the first change that edits them.
- README.md contains two contradictory descriptions of review scheduling: an obsolete fixed result-to-interval table at README.md:211 that SM-2 replaced long ago, and the correct SM-2 section at README.md:267. This lane changes review semantics right where that stale table sits, so the table must go rather than be updated.
- closeSession already carries a Session Plan advance tail. The keep-vs-clear change lands next to it, and the plain no-plan flow must stay behaviourally identical apart from the fix itself.
- vitest is environment:'node' with include:['src/**/*.test.ts'], so no component test is possible. Any decision that feels like it needs one must be pushed down into a pure domain function instead -- adding jsdom or fake-indexeddb is explicitly out of scope here, matching the prior contract's instruction.
- .prismatica/product-map.md is entirely unfilled placeholders and is handed to every agent in every pack. It is not this lane's job to fill it, but a builder reading it will find nothing.
- SyncPhase gains a 'deferred' state, and every consumer was checked rather than assumed. VERIFIED: there is no exhaustive switch on phase anywhere (githubSync.ts:195 switches on outcome.kind, not phase). Layout.tsx:156 early-returns for anything that is not 'conflict' or 'error', so it needs the edit and is in scope. Settings.tsx reads phase ONLY in narrow equality comparisons (:419 :420 :423 :430 :455), so a new phase falls through to the generic {status.message} at :420 and renders in normal colour rather than the error tone -- which is exactly right, since a deferral is not a failure. Settings.tsx therefore compiles and presents correctly with NO edit and is deliberately left out of scope. The deliberate-refusal path needs no Settings edit either: manual import already checks !result.ok (:115), restoreArchive already alerts result.error (:371), and conflict-keep-remote surfaces via applyOutcome's existing error case.
- src/domain/practiceSession.ts is a NEW module and needs one line in src/domain/index.ts, which is in scope BECAUSE every consumer imports through the barrel ('../domain'), not by file path -- without it the new module cannot be consumed at all and the build fails. The module boundary is deliberate and mechanically enforced: practiceSignal.ts owns pure decisions about a running clock's SIGNALS (wake lock, boundary announcements) and is FORBIDDEN in this lane; practiceSession.ts owns pure decisions about the unfinished SESSION -- presence, staleness, proposed closing minutes, and what survives a replacement. The staleness predicate must never be fed into shouldKeepAwake or nextSignal.
- The persist middleware's `merge` already freezes a dual active/activeRoutine pair on hydration. That frozen pair is PAUSED, not running -- and under this lane's presence-based rule it is unfinished practice like any other, so it blocks a replacement and must be resolved by the owner rather than cleared automatically. The new predicate must read it that way and must not duplicate or contradict the existing freeze.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan the next Practice Compass lane. I want a reasonably wide but still coherent change rather than a very small single fix, optimised for actual user value, correctness, data safety, shared invariants/files, dependency relationships, reviewability and rollback safety.\n\nCover the critical daily-practice integrity problems, especially A1/A2 and A6 from docs/review-2026-09-10.md, and respect the coupling between sync safety and stale/abandoned running sessions rather than fixing either superficially. Close the core practice loop: surface the previous block's saved nextAction when the item is practised again, and ensure saving without a result cannot silently alter review scheduling. Give me honest practice-time visibility -- useful neutral totals such as time practised today, this week and all time, with block counts and sensible per-instrument views; calendar-day/week semantics must be correct, it must stay non-gamified, and the stale-session issue must be dealt with before I trust those numbers. Include other high-value correctness issues only where they strengthen the lane rather than making it incoherent.\n\nDecisions I confirmed while we planned this:\n- Sync guard: defer quietly and auto-retry while practice is unfinished. A forgotten block must not stop sync indefinitely -- but the outage is bounded by MAKING IT VISIBLE and giving me a way to resolve it, never by discarding the session. Staleness itself never permits a replacement.\n- Close block: fix the silent schedule damage AND require a result, with an explicit 'save without a result' escape.\n- Totals: a compact line low on Today plus a full view on Insights; the week starts Monday.\n- Builder: claude.\n\nDo not force every requested feature in. Explicitly preserve schema-changing/heavy work such as lesson-scoped commitments and first-class item NAS references as well-defined follow-ons, and keep the NAS browsing/viewing work, the iPhone keyboard displacement and the Farsi search wiring out of this lane unless the evidence says otherwise. Preserve the existing product principles: local-first, calm, low-admin, one instrument per session, no gamification, no silent data loss, explainable scheduling, and no timer or wake-lock behaviour altered by unrelated UI features.\n\nRefined after reviewing the first draft of this plan:\n- An ABANDONED or stale clock must NOT become permission for a whole-database replacement to destroy an unfinished session. Staleness proves the wall-clock duration is implausible and should change the proposed minutes and the attention state; it must never authorise destruction.\n- An unfinished ordinary session or routine is never silently destroyed by an automatic database replacement, and PAUSED sessions are protected too, not only actively ticking clocks.\n- If a stale unfinished session would otherwise hold sync indefinitely, make that condition VISIBLE and give me a clear way to Finish, correct the minutes, or Discard it -- do not resolve the outage by silently losing the practice.\n- Deferred automatic sync must reliably retry once the blocking state is resolved, whether the session was finished OR discarded, without depending on an unrelated future database change.\n- Distinguish automatic from user-initiated replacement. Quiet deferral is right for background sync during practice; but Import, Restore archive and Keep remote must not silently no-op and must not silently discard practice.\n- Check that A8 covers every whole-database/reset path, not only the ones importFullBackup happens to cover.\n- Do not put state-transition logic in selectors.ts merely because it is easy to test; a small purpose-specific pure domain module is better if it is more cohesive.\n- Stress-test the calendar-total semantics against what timestamps the model actually has, and pin the choice with a discriminating test.",
  "builder": "claude",
  "summary": "Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals",
  "rationale": "ONE SENTENCE HOLDS THIS LANE TOGETHER: every minute this app records is a minute you actually played, and every number it shows you is derived from those minutes honestly. Minutes are RECORDED honestly (staleness), PROTECTED from destruction (sync guard, ephemeral reset), the block's record does not corrupt something else (result gating), the record is actually USED (next action), and what is REPORTED from them is arithmetically true (calendar totals, balance denominator). Every item below is a step on that one spine.\n\nWHY THESE SHIP TOGETHER RATHER THAN SEPARATELY. Fixing A1 alone -- 'refuse to sync while a clock is running' -- trades a bounded one-block loss for an UNBOUNDED and INVISIBLE sync outage: one block left running overnight stops device sync indefinitely, and SyncNotice (src/components/Layout.tsx:143) only renders for phase 'conflict' or 'error', so a deferral shows nowhere outside Settings. A2 is what makes that outage survivable -- but NOT, as an earlier draft of this plan had it, by letting a stale clock stop deferring. That draft was WRONG and the owner was right to reject it. Staleness proves only that a wall-clock DURATION is implausible; it proves nothing about whether the session holds practice worth keeping. A session paused at three genuine hours, or a long session the owner still means to resolve, would have crossed any sensible threshold and then been discarded by the very mechanism meant to protect it -- a heuristic quietly promoted into an authority to destroy data. The corrected invariant is unconditional: AN UNFINISHED PRACTICE SESSION -- ORDINARY OR ROUTINE, RUNNING OR PAUSED, FRESH OR STALE -- IS NEVER DESTROYED BY A REPLACEMENT THE OWNER DID NOT EXPLICITLY AIM AT IT. Staleness keeps exactly two jobs, both non-destructive: it decides the minutes CloseBlock proposes, and it raises the ATTENTION state so a session blocking sync becomes visible instead of silent. The outage is then bounded by the owner being told and given a resolution path -- Finish, correct the minutes, or Discard -- rather than by the app deciding for them. That is why the two still belong in one lane: A2's predicate is what turns A1's guard from an invisible outage into a visible, resolvable one, without ever being allowed to resolve it destructively. Shipping A1 first would ship the next entry in the review. Separately, A1's guard and A8's ephemeral reset are neighbours. importFullBackup (src/store/backup.ts:160) is the chokepoint for the four INBOUND replacements -- manual import (Settings.tsx:115), sync applySnapshot (githubSync.ts:164), conflict-keep-remote via resolveSyncConflict, and archive restore (githubSync.ts:263) -- so one guard there covers every door data comes IN through. But the owner was right to challenge the claim that it covers everything: VERIFIED, resetDemo (useStore.ts:1373, called from Settings.tsx:293) and clearAll (useStore.ts:1378, called from Settings.tsx:306) are invoked DIRECTLY on the store and never touch importFullBackup at all. There are SIX whole-database replacements, not four. That is exactly why the ephemeral reset belongs in the STORE, applied identically by importDB, resetDemo AND clearAll -- the three places a new `db` object is actually installed -- rather than in importFullBackup where it would silently miss a third of the paths. Touching those three actions twice in two lanes is worse than once.\n\nWHAT THE CODE ACTUALLY SAYS (all verified at 0c6058e, not inherited from the review):\n1. A6 is worse than reported and is the most severe item. setReviewDate is called from exactly two places -- pickResult (CloseBlock.tsx:87) and the manual date input (:230). Skip the result and reviewDate stays ''. Save then sends scheduleReview: comeBack && !!reviewDate, which is false, and computeReviewOutcome short-circuits at 'if (!scheduleReview) return { nextReviewDate: null }' (scheduling.ts:368) -- CLEARING the item's date -- while closeSession's reviews.map (useStore.ts:948) completes EVERY open review for that item unconditionally. Net effect of one skipped tap: the open review closes, the next date is erased, SM-2 state is left stale, and the item never appears under Due reviews again. And the panel says the opposite: comeBack defaults to true, so it reads 'Should this come back? Yes' above an empty date field. This breaks r-explainable-scheduling's 'the date shown before saving is exactly the date saved' -- the date shown is nothing and the date saved is cleared. The root cause is that !scheduleReview conflates 'the user declined a review' (clear) with 'the user answered nothing' (keep), and computeReviewOutcome already has the tri-state to express the difference. Fixing it there fixes it for every caller, rather than patching the one screen.\n2. A1: `active` is not part of `db`, so withRevision (src/store/revision.ts:26) never bumps `rev` while you practise. A mid-block device therefore looks UNCHANGED to decideSync, so a remote change resolves to 'pull', not 'conflict', and importDB nulls `active`. archivePreSync does run before a pull, so committed data survives -- what is destroyed with no archive and no prompt is the in-flight, never-recorded block. That is narrower than 'sync eats your data' and still a direct breach of r-no-silent-data-loss.\n3. A2: sessionElapsedSeconds is unbounded wall clock, so CloseBlock.tsx:41 pre-fills a fabricated figure for an abandoned block. Crucially, routines are ALREADY SAFE here: segmentElapsed clamps with Math.min(seg.seconds, ...) (routines.ts:124), so a routine left running overnight cannot fabricate minutes. Only the ordinary block path needs the pre-fill correction -- both paths still need the sync deferral. That narrowing is why routines.ts and RoutineRunner.tsx are forbidden rather than merely out of scope.\n4. A7: PracticeBlock.nextAction is written on every close (CloseBlock.tsx:117) and read nowhere, ever. ActiveBlock.tsx:90 shows item.notes and item.currentProblem instead. The last step of the loop is write-only. Highest value-per-line feature in the repo, zero risk, and it shares both files with A6.\n5. B1: totalMinutesInWindow (selectors.ts:152) is exported, tested and used NOWHERE -- the feature is half-built. The trap is that blocksInWindow filters on hours, so days:1 means the last 24 hours, not today, and days:7 means 168 hours, not this week. Calendar totals need a NEW helper, not a reuse of that one; getting this wrong would ship exactly the class of 'the app told me something untrue' problem this lane exists to end.\n6. A10 is two lines in the same file the new totals helpers go in, and is the one existing derived number that is arithmetically wrong: instrumentBalance takes its denominator from ALL supplied blocks but only emits rows for the supplied instruments, and Today.tsx:648 passes only ACTIVE instruments with all blocks, so percentages can sum to under 100. Same file, same invariant, free to review alongside.\n\nWHY IT IS TESTABLE WITHOUT NEW TOOLING. vitest runs environment:'node' with include:['src/**/*.test.ts'], so no component test can exist and a prior contract explicitly refused jsdom/fake-indexeddb, saying that untestable store wiring is the signal to push the decision down into a pure domain function. This plan follows that instruction rather than fighting it: every decision becomes a pure, Node-testable function in the module that actually owns it: unfinished-session presence, staleness, proposed closing minutes and the replacement transform all in the NEW src/domain/practiceSession.ts; the keep-vs-clear discrimination in scheduling.ts; the calendar totals and the balance denominator in selectors.ts, which is where derived read-only values belong; and the last-next-action selection over an item's blocks in blocks.ts. practiceSignal.ts is NOT touched and is forbidden -- verified, every one of its consumers (useScreenAwake.ts, ActiveBlock.tsx, RoutineRunner.tsx, useStore.ts) uses shouldKeepAwake, nextSignal and acknowledgeThrough exactly as they are, so forbidding the file turns 'no wake-lock or timer behaviour changes' from a promise into a mechanical guarantee. Two placements matter enough to state outright, because getting them wrong is what would send the builder back for an amendment. FIRST: both halves of A6 are ONE decision, so computeReviewOutcome in scheduling.ts returns not only what nextReviewDate becomes but ALSO whether the item's open reviews should be completed -- today closeSession decides that separately and unconditionally at useStore.ts:948, which is precisely why the date and the row can disagree. Moving it into the same return value makes 'the user answered nothing' produce keep-the-date AND leave-the-row-open from a single branch, in the one place every caller already routes through. SECOND: the ephemeral reset is a pure function in practiceSession.ts, and its SIGNATURE is what makes it safe rather than the discipline of whoever wires it. It takes the incoming PracticeDB plus the current ephemeral state and returns the COMPLETE store patch -- the new `db` TOGETHER WITH active, activeRoutine, activePlan, notNow and the surviving sessionInstrumentId -- so importDB, resetDemo and clearAll each become a single set() of its result. Installing a database WITHOUT the reset stops being an omission a reviewer has to catch and becomes something the code cannot express, because the `db` and the reset arrive in the same object. That structural point matters because the Node test setup cannot exercise useStore.ts at all (it imports ./idb and therefore Dexie), so the unit test proves the DECISION and the shape of the function is what protects the WIRING. The store and the pages become thin callers. Fourteen of the fifteen acceptance checks are automated named unit tests; the single manual:OWNER check covers what genuinely cannot be unit-tested here -- the on-device end-to-end, and the store WIRING at importDB, resetDemo and clearAll that the Node environment cannot reach.\n\nBOUNDARY, STRESS-TESTED. Deliberately OUT: A3 (SM-2 advancing on repeated early practice) is a different invariant, needs an owner decision against r-practice-completes-reviews, and would make this lane about interval semantics as well as minute honesty. A5 (dormant eligibility) is about what to DISPLAY, not what to RECORD. A9 (wiring persianSearchMatch) belongs to browse-my-repertoire and shares no file or invariant with this -- an excellent standalone lane, not a passenger in this one. A4 and item NAS references need SCHEMA_VERSION and are heavy tier; batching them with this would make one sealed review cover unrelated migrations and make rollback coarser. All NAS work waits on the CSP/CORS finding, which is a research question, not an implementation one. The iPhone keyboard is device-specific and cannot be settled from source.\n\nROLLBACK SAFETY. No schema change, no migration, no change to any persisted shape; SCHEMA_VERSION stays 11. src/domain/types.ts and src/domain/migrations.ts are FORBIDDEN, which makes that guarantee mechanical rather than a promise. The tested sync engine, the hash comparison, the wake lock and the routine clock are all forbidden too. Every change is an additive pure function, a guard, or read-only UI, so `git revert` restores the previous behaviour with zero data consequences.\n\nAUTOMATIC VERSUS DELIBERATE, WHICH IS A REAL DISTINCTION AND NOT A DETAIL. Background auto-sync during practice should defer QUIETLY -- it is a routine background merge and an alert would be noise. But when the owner deliberately chooses Import, Restore archive or Keep remote, silence is the wrong answer twice over: a silent no-op looks like a broken button, and a silent discard is the data loss this lane exists to end. Both get the same guard and different presentations, and VERIFIED, the second costs almost nothing: importFullBackup already returns {ok:false,error} and every deliberate caller already surfaces it -- manual import checks !result.ok (Settings.tsx:115), restoreArchive alerts it (Settings.tsx:371), and both runSync (syncEngine.ts:287) and resolveSyncConflict (syncEngine.ts:338) catch applySnapshot's throw into {kind:'error',message} which applyOutcome renders in the sync panel. So a clear refusal reaches the owner on all three deliberate paths with NO change to Settings.tsx, which is deliberately left out of scope. Automatic sync instead checks the same predicate BEFORE attempting and reports a distinct deferred state, because a deferral is not an error and must not be dressed as one.\n\nTHE RETRY, REBUILT. The earlier draft leaned on `rev`: closing a block writes to the database, which bumps the revision counter the existing 30-second quiet-period effect already watches. That is true for closeSession and for finishRoutine, but the owner correctly spotted the hole -- VERIFIED, cancelSession (useStore.ts:884) is a bare set({ active: null }) with no database write and therefore no rev bump, as is closeSession's missing-item bail-out (useStore.ts:892). Discard your block and the deferred sync waits for an unrelated future change or a future app open. Depending on an incidental side effect of one resolution path is not 'defer and retry'; it is defer and hope. The correct trigger is the blocking condition itself: an effect in App.tsx keyed on whether unfinished practice exists, firing syncNow() on the present-to-absent transition when a deferral is pending. That fires for finish, for discard, and for the missing-item path alike, because it watches the state that actually blocks rather than a proxy for one way of clearing it.\n\nCALENDAR SEMANTICS -- CHALLENGED, AND THE CODE STRENGTHENS THE ORIGINAL CHOICE RATHER THAN OVERTURNING IT. The question was whether a block crossing midnight (or the Monday boundary) should be split across days rather than assigned whole to its startedAt day. Two facts in the model settle it against splitting. FIRST, durationMinutes is USER-EDITABLE at close and this very lane makes it diverge from wall clock ON PURPOSE -- an abandoned block proposes its target, not its elapsed gap -- so endedAt minus startedAt is NOT the authored duration, and apportioning by wall-clock overlap would silently overrule the owner's own correction with a number they never attested to. SECOND, VERIFIED at factories.ts:168, endedAt is optional and applyRoutineRun never passes one, so routine blocks HAVE no endedAt and could not be split at all; splitting would quietly apply to some blocks and not others. A block is therefore treated as one indivisible unit of attested practice belonging to the calendar day it began -- truthful, uniform, and needing no schema. This choice is now pinned by its own discriminating test rather than left as a comment, and the same rule gives the Monday boundary its answer: a session begun Sunday 23:30 belongs to the week that is ending.\n\nMODULE PLACEMENT, CORRECTED. An earlier draft put the ephemeral-reset decision in selectors.ts because that file is pure and easy to test. Testability is not cohesion, and the owner was right to reject it: selectors.ts holds derived READ-ONLY lists, and a state-transition rule filed there would sit next to nothing it belongs with. The new src/domain/practiceSession.ts is a genuine sibling to practiceSignal.ts -- that module owns pure decisions about a running clock's SIGNALS, this one owns pure decisions about the unfinished SESSION itself: whether one exists at all (presence, never `running`, so a paused session is protected), whether its elapsed figure is still plausible, what minutes to propose when closing it, and what ephemeral state survives a database replacement. selectors.ts keeps only what it is for -- the calendar totals and the instrument-balance denominator, both genuinely derived read-only values.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "Step 7 of this flow records that saving a block stores a PracticeBlock, advances the item's counters and spaced-repetition state, completes any open review and schedules the next one 'on the date that was shown', and the flow ends with 'The session is recorded honestly: one block, one result, one next action -- and the item knows when it should come back.' Four of those claims are untrue in the code at 0c6058e.\n\n1. ONE RESULT is optional and skipping it damages the schedule. `result` starts null and Save is always enabled. setReviewDate is only reached from pickResult (CloseBlock.tsx:87) or the manual date field, so with no result reviewDate stays empty, scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate: null } and CLEARS the item's date, while closeSession completes every open review for the item regardless (useStore.ts:948). The item silently leaves the review system. The panel meanwhile reads 'Should this come back? Yes' above an empty date field, because comeBack defaults to true.\n2. RECORDED HONESTLY is not guaranteed. sessionElapsedSeconds is unbounded wall clock. A block left running overnight pre-fills durationMinutes with the whole gap (CloseBlock.tsx:41), and that figure then poisons the item's totalMinutes, instrumentBalance, the Teacher Report and every insight permanently. Nothing distinguishes a locked phone during real practice from a session abandoned days ago.\n3. ONE NEXT ACTION is write-only. nextAction is saved on every close and read by nothing. When the item is practised again, ActiveBlock shows item.notes and item.currentProblem instead, so the decision you deliberately made last time never reaches you.\n4. The block can be destroyed before it is ever recorded. `active` lives outside `db`, so `rev` never bumps while you practise; a mid-block device looks unchanged to decideSync, a remote change resolves to pull rather than conflict, and importDB nulls `active`. Committed data is archived first, but the in-flight block is not -- it disappears with no prompt. The same replacement also leaves activePlan, notNow and a now-dangling sessionInstrumentId alive against a database that no longer contains them.\n\nSeparately, nothing in the app answers 'how much have I actually practised?'. totalMinutesInWindow is exported and tested but wired to nothing, and the one derived figure that does ship -- Today's instrument balance -- computes its denominator from all blocks while only emitting rows for active instruments, so its percentages can sum to less than 100.",
  "desiredBehaviour": "Two INDEPENDENT questions govern this lane, and conflating them is what made the first draft wrong. The first is PRESENCE: does an unfinished practice session exist? That, and only that, decides whether a database replacement may proceed -- running or paused, fresh or stale, ordinary or routine, a session that exists is protected. The second is PLAUSIBILITY: does this session's elapsed figure still look like time someone actually played? That, and only that, decides what minutes are proposed at close and whether the session is worth drawing attention to. A stale verdict never touches the first question, and no threshold is ever wired to a destructive path.\n\nSAVING A BLOCK. Save is unavailable until you pick one of the six results; an explicit 'Save without a result' keeps not_logged reachable and deliberate rather than accidental. And underneath, at the one place every caller routes through, answering nothing is no longer read as declining: a close carrying no result LEAVES the item's next review date exactly as it was and leaves its open review OPEN, while genuinely declining a review still clears the date as it does today. These are one decision, not two: computeReviewOutcome returns whether the open reviews should be completed alongside what the date becomes, so the row and the date can no longer disagree -- today closeSession completes the row separately and unconditionally, which is exactly how they came apart. The date shown before saving is once again exactly the date saved, including when that date is 'unchanged'.\n\nHONEST MINUTES. Closing an abandoned block proposes the block's own target rather than the fabricated elapsed figure, and says plainly why in one neutral line, so a forgotten clock can never quietly write eight hours of practice you did not do. Ordinary overtime is untouched -- practising past the target stays completely normal and still pre-fills the real elapsed time.\n\nTHE LOOP CLOSES. Practising an item again shows the next action you chose last time, at the top of the practice screen, before you start playing.\n\nNOTHING REPLACES AN UNFINISHED SESSION. One invariant governs this, unconditionally: an unfinished practice session -- ordinary or routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a database replacement the owner did not explicitly aim at it. Presence is what counts, never `running`, so pausing protects a session rather than exposing it; and staleness never earns an exemption, because an implausible DURATION says nothing about whether the session holds practice worth keeping.\n\nAutomatic sync therefore defers while any unfinished session exists, quietly, and reports a distinct DEFERRED state rather than an error -- a background merge waiting its turn is not a failure. It retries by watching the blocking condition itself: the moment no unfinished session remains, a pending deferral fires. That covers finishing the block, DISCARDING it, and the missing-item bail-out equally, instead of relying on the database write that only one of those happens to make.\n\nA deliberate replacement is answered differently, because silence would be wrong twice: Import, Restore archive and Keep remote all REFUSE with a plain message naming the session that blocks them and where to resolve it -- never a silent no-op that looks like a broken button, and never a silent discard. The owner is told, and the resolution path is the one that already exists: Today's In-progress card leads to the practice screen, where Finish, correct the minutes, or Discard are all one tap away.\n\nThis is where staleness earns its keep without ever being given authority: a stale unfinished session is LABELLED as such on Today's In-progress card, and the sync notice says plainly that sync is waiting on it. A session forgotten overnight can therefore no longer hold sync silently -- but it is the owner who resolves it, not the app that discards it.\n\nWhen a replacement does proceed, every piece of ephemeral state tied to the old database is cleared in the same step -- the running plan, today's dismissed reviews, and a session instrument the new database does not contain -- while a session instrument that still resolves is kept, including the cross-instrument 'all' overview. This applies identically at all three places a new database is installed: importDB, resetDemo AND clearAll. The last two never pass through importFullBackup, so a fix that lived only there would silently miss them. Deliberate erasure keeps no guard -- reset-to-demo and erase-everything are aimed at destroying the data and already confirm first -- but they must leave no ephemeral state pointing at a database that no longer exists.\n\nHONEST TOTALS. Today carries one compact line BELOW the recommendation -- minutes and block count for today, and for this week -- and Insights carries the full view: today, this week and all time, per instrument. These are calendar figures, not rolling windows: a block from late last night belongs to yesterday, and the week starts on Monday. Neutral counts only -- no target, no streak, no bar that fills, no colour that judges. The existing instrument-balance percentages sum to 100 again.\n\nAND THE DOCUMENTATION STOPS CONTRADICTING THE CODE. README.md still carries an obsolete fixed result-to-interval table ('slightly better +2 days, stable alone +4, performable +21') at README.md:211 that SM-2 replaced long ago, 55 lines above the correct SM-2 description at :267 -- the same section whose meaning this lane changes. That table is DELETED, not updated, and the priority formula just above it gains the lesson-urgency term it has always been missing. In a repository built by agents, a stale specification does not merely mislead a reader; it gets confidently implemented. CLAUDE.md and AGENTS.md record the new invariants together, in the same commit, since they are byte-identical twins.",
  "mustNotChange": [
    "No unfinished practice may be lost. An unfinished session -- ordinary or routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a database replacement the owner did not explicitly aim at it. Staleness may change the proposed minutes and the attention state and NOTHING else; it must never become an authority to discard practice, and no threshold may be wired to a destructive path.",
    "A deferred sync must never become a silent permanent outage OR a silent discard. It is retried on the blocking condition CLEARING -- covering finish and discard alike, not an incidental database write only one of them makes -- and while it persists it is visible: the sync notice says what it is waiting for, and a stale unfinished session is labelled on Today so it can be resolved.",
    "No schema change of any kind. SCHEMA_VERSION stays 11, no migration is added, and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than a promise.",
    "Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2. This lane changes when a resultless close must NOT touch the schedule; it never adds a new way to complete one.",
    "The SM-2 rungs themselves are not retuned. DEFAULT_SCHEDULING_PARAMS and its byte-identical-defaults snapshot test stay green. Whether repeated early practice should advance reps (review A3) is a separate lane and a separate owner decision.",
    "'Not now' still changes no schedule at all, and snooze (+2d) still moves the real date on both the review and the item.",
    "Starting a block stays under 30 seconds and closing one under 60. Requiring a result adds no new field -- the six options are already on screen; it only makes a choice already present a required one, and 'Save without a result' remains one tap away.",
    "No wake-lock or timer behaviour changes. shouldKeepAwake, nextSignal, acknowledgeThrough, sessionElapsedSeconds, runElapsedSeconds, locateClock, skipCurrentSegment and aggregateItemMinutes keep their current behaviour exactly; useScreenAwake.ts and screenAwake.ts are forbidden. No wake-lock or audio outcome may influence a recorded minute, and the new staleness predicate must not feed the awake decision.",
    "Routine runs are not touched. segmentElapsed already clamps a segment to its authored duration, so a routine cannot fabricate minutes; routines.ts and RoutineRunner.tsx are forbidden, and finishRoutine still writes at most one block per distinct bound item with result not_logged.",
    "The sync model itself is unchanged: whole snapshots, three-way content-hash comparison, explicit two-button conflicts, both copies preserved. decideSync, syncEngine.ts and gitRemote.ts are forbidden. Nothing here introduces a timestamp into a sync decision.",
    "The primary recommendation stays above the fold on a 390x844 phone. The totals line goes BELOW it on Today, never above; PlanCard and RoutinesCard keep their collapsed peer-doorway shape.",
    "No gamification. Totals are neutral counts of minutes and blocks with no goal, streak, score, progress bar, celebration or judging colour.",
    "Today stays scoped to one instrument, and the cross-instrument Overview stays a deliberate secondary choice.",
    "Everything still works fully offline and local-first. A deferred sync is a distinct, visible waiting state -- never an error, never a silent no-op -- and it never blocks practising.",
    "practiceSignal.ts is not edited in this lane and is forbidden, so the wake-lock and boundary-announcement behaviour cannot change even by accident. The new staleness predicate lives in practiceSession.ts and must never be fed into shouldKeepAwake or nextSignal."
  ],
  "assumptions": [
    "Staleness is a heuristic about a DURATION, not a judgement about a session's worth. It is wired to exactly two non-destructive outcomes -- the minutes CloseBlock proposes, and the attention state on Today and in the sync notice -- and to no destructive path anywhere. Exact constants are the builder's to choose and pin in tests; a clock is stale when elapsed exceeds both a generous multiple of its own target and an absolute floor, so short blocks are judged against the floor and long ones against the multiple.",
    "The blocking predicate is PRESENCE of an unfinished session, never whether it is `running`. Pausing must protect a session, not expose it, and a frozen dual-clock pair from the persist merge is unfinished practice like any other.",
    "Retrying on the blocking condition clearing needs one small effect in App.tsx keyed on whether unfinished practice exists; no polling, no timer, and no new store field beyond a pending-deferral flag alongside the existing sync bookkeeping.",
    "Deliberate erasure (reset-to-demo, erase-everything) keeps no guard: those actions are aimed at destroying the data and already confirm first. They must still clear ephemeral state, which is why the reset lives in the store rather than in importFullBackup.",
    "A block belongs whole to the calendar day it began. endedAt is optional and absent on routine blocks, and durationMinutes is user-corrected and deliberately diverges from wall clock, so apportioning across midnight would be fabricated precision rather than extra truth.",
    "The week starts Monday 00:00 local time (ISO-8601 and UK convention), and 'today' is the local calendar day of a block's startedAt.",
    "An item's most recent NON-EMPTY nextAction is the right one to surface -- a later block that recorded none should not blank out a decision that still stands.",
    "Requiring a result is acceptable against r-quick-start because the six options are already the first thing on the close screen; the change makes an existing choice required, it does not add a field.",
    "Answering the risk questions honestly (touchesSavedData: true) may raise this to heavy tier. That is the correct outcome for a data-safety lane and was accepted when planning; the forbidden-path list is what keeps the rollback trivial even so."
  ],
  "possibleConflicts": [
    "This lane adds an additive, display-only totals view to the see-practice-patterns Flow (Insights.tsx and Today.tsx are its recorded touchpoints), but the schema carries only one Delta and the substantive change belongs to practise-todays-recommendation. Nothing that Flow already does is altered or removed -- only new neutral counts are added -- but its recorded truth will need updating afterwards, and the fresh reviewer should expect that rather than read it as scope creep. The one behavioural fix inside it, the instrument-balance denominator, corrects a figure that is currently arithmetically wrong rather than changing what the Flow promises.",
    "CLAUDE.md and AGENTS.md are byte-identical apart from their title line. Both are in docsDelta and must be edited together or they diverge on the first change -- this lane is the first change that edits them.",
    "README.md contains two contradictory descriptions of review scheduling: an obsolete fixed result-to-interval table at README.md:211 that SM-2 replaced long ago, and the correct SM-2 section at README.md:267. This lane changes review semantics right where that stale table sits, so the table must go rather than be updated.",
    "closeSession already carries a Session Plan advance tail. The keep-vs-clear change lands next to it, and the plain no-plan flow must stay behaviourally identical apart from the fix itself.",
    "vitest is environment:'node' with include:['src/**/*.test.ts'], so no component test is possible. Any decision that feels like it needs one must be pushed down into a pure domain function instead -- adding jsdom or fake-indexeddb is explicitly out of scope here, matching the prior contract's instruction.",
    ".prismatica/product-map.md is entirely unfilled placeholders and is handed to every agent in every pack. It is not this lane's job to fill it, but a builder reading it will find nothing.",
    "SyncPhase gains a 'deferred' state, and every consumer was checked rather than assumed. VERIFIED: there is no exhaustive switch on phase anywhere (githubSync.ts:195 switches on outcome.kind, not phase). Layout.tsx:156 early-returns for anything that is not 'conflict' or 'error', so it needs the edit and is in scope. Settings.tsx reads phase ONLY in narrow equality comparisons (:419 :420 :423 :430 :455), so a new phase falls through to the generic {status.message} at :420 and renders in normal colour rather than the error tone -- which is exactly right, since a deferral is not a failure. Settings.tsx therefore compiles and presents correctly with NO edit and is deliberately left out of scope. The deliberate-refusal path needs no Settings edit either: manual import already checks !result.ok (:115), restoreArchive already alerts result.error (:371), and conflict-keep-remote surfaces via applyOutcome's existing error case.",
    "src/domain/practiceSession.ts is a NEW module and needs one line in src/domain/index.ts, which is in scope BECAUSE every consumer imports through the barrel ('../domain'), not by file path -- without it the new module cannot be consumed at all and the build fails. The module boundary is deliberate and mechanically enforced: practiceSignal.ts owns pure decisions about a running clock's SIGNALS (wake lock, boundary announcements) and is FORBIDDEN in this lane; practiceSession.ts owns pure decisions about the unfinished SESSION -- presence, staleness, proposed closing minutes, and what survives a replacement. The staleness predicate must never be fed into shouldKeepAwake or nextSignal.",
    "The persist middleware's `merge` already freezes a dual active/activeRoutine pair on hydration. That frozen pair is PAUSED, not running -- and under this lane's presence-based rule it is unfinished practice like any other, so it blocks a replacement and must be resolved by the owner rather than cleared automatically. The new predicate must read it that way and must not duplicate or contradict the existing freeze."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "CLAUDE.md",
      "README.md",
      "src/App.tsx",
      "src/components/Layout.tsx",
      "src/domain/blocks.test.ts",
      "src/domain/blocks.ts",
      "src/domain/index.ts",
      "src/domain/practiceSession.test.ts",
      "src/domain/practiceSession.ts",
      "src/domain/scheduling.test.ts",
      "src/domain/scheduling.ts",
      "src/domain/selectors.test.ts",
      "src/domain/selectors.ts",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/Insights.tsx",
      "src/pages/Today.tsx",
      "src/store/backup.ts",
      "src/store/githubSync.ts",
      "src/store/useStore.ts"
    ],
    "forbid": [
      "src/domain/types.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/sync.ts",
      "src/store/syncEngine.ts",
      "src/store/gitRemote.ts",
      "src/domain/routines.ts",
      "src/pages/RoutineRunner.tsx",
      "src/components/useScreenAwake.ts",
      "src/components/screenAwake.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/farsi.ts",
      "src/domain/plan.ts",
      "vite.config.ts",
      "package.json",
      "src/domain/practiceSignal.ts",
      "src/domain/practiceSignal.test.ts"
    ]
  },
  "exclusions": [
    "Review A3 -- SM-2 advancing reps on every closed block rather than once per due date, so three sessions in one afternoon can push a review from 2 days to 15. Verified by reading scheduling.ts:160-176, genuinely high value, and deliberately deferred: it changes what r-practice-completes-reviews means and needs its own owner decision. src/domain/scoring.ts and the SM-2 rungs stay untouched here.",
    "Review A5 -- dormant/'Resting' items still being scored and still eligible for the Maintenance card, with neglect making them MORE likely the longer they rest. One predicate in scoring.ts fixes it, but it is about what the app DISPLAYS, not what it RECORDS, so it does not belong on this lane's spine. scoring.ts and recommend.ts are forbidden.",
    "Review A9 -- persianSearchMatch is written, tested and wired to nothing while both search boxes use toLowerCase().includes(). Highest value-per-line fix in the repo and an excellent standalone lane for browse-my-repertoire, but it shares no file and no invariant with this one.",
    "Review A4 -- lesson-scoped commitments (assignedForLesson boolean to assignedLessonId). Needs SCHEMA_VERSION and a migration, therefore heavy tier under the repo's own tierRules. Preserved as a well-defined follow-on rather than widening this lane.",
    "First-class NAS references on practice items (review B3). Also a schema bump. Worth pairing with A4 in one heavy lane so the ceremony is paid once -- while noting the counter-argument, that bundling unrelated migrations makes the sealed review harder to reason about and the rollback coarser. Note also that rendering a linked lesson's existing references on the item page would deliver much of the value with NO schema change at all, and should be tried first.",
    "All NAS browsing and in-app viewing (review B2/B4). Blocked behind a research question, not an implementation one: cspPlugin in vite.config.ts is apply:'build', so every NAS feature works on `npm run dev` and fails SILENTLY on GitHub Pages. connect-src blocks a directory fetch, frame-src 'none' blocks any in-app PDF viewer including blob:, media-src blocks NAS video. Cheapest real steps, in order: a plain link opening the Go file server's own directory listing (zero code, already served per DECISIONS.md); a photo/image attachment shown during practice (already allowed by img-src blob:, zero CSP change); then a generated path index from a generalised scripts/scan-setar-classes.mjs, which needs no CSP change, no CORS and works offline. vite.config.ts is forbidden here so no CSP token can move by accident.",
    "Review B5 -- the iPhone bottom bar staying displaced after keyboard dismissal. Device-specific and unsettleable from source. The one-line first attempt is lengthening useViewportGuard's 80ms settle debounce past the ~250-300ms iOS dismissal animation; FUTURE.md already records the fallback. Needs its own lane with manual:OWNER evidence.",
    "Review A11 (an item can be made its own parent, and family metadata survives an instrument switch), A13 (a malformed attachment entry is skipped then destroyed by replaceAllBlobs), A14 (weekly insights and the Teacher Report mixing 'during this period' with 'right now'), A15 (Settings claiming 'newest copy wins' when decideSync never reads a timestamp), A16 (Field gives form controls no accessible name), A17 (light-theme contrast below AA).",
    "Adding jsdom, fake-indexeddb, Playwright, or any browser/component test harness. vitest stays environment:'node'. If a decision feels untestable, push it into a pure domain function -- that is what this plan already does. Enabling .prismatica journeys checks is its own lane.",
    "Filling .prismatica/product-map.md, and writing the missing Flows for running a routine and for hands-free practice.",
    "Splitting a block's minutes across a midnight or week boundary. Considered and rejected on evidence, not omitted: durationMinutes is the owner's attested figure and this lane deliberately makes it diverge from wall clock, and endedAt is optional and absent on routine blocks (factories.ts:168, applyRoutineRun passes none). Apportioning would overrule the owner's own correction and apply unevenly across block types. Adding an endedAt backfill purely for theoretical precision would need a schema change and is explicitly not worth it.",
    "Guarding reset-to-demo and erase-everything behind the unfinished-session check. Those actions are AIMED at destroying the data and already confirm first, so refusing them would be obstruction rather than safety. They are still fixed here for A8 -- they must leave no ephemeral state pointing at a database that no longer exists. Mentioning a running block in their confirm text is a nice-to-have, not required by this lane."
  ],
  "acceptance": [
    {
      "description": "A6 root cause, and the discriminating pair that defines it: a close carrying NO result leaves the item's next review date exactly as it was, while a close that genuinely DECLINES a review still clears it. Both halves in one test, because the whole bug is that the code cannot currently tell those two states apart.",
      "test": "keeps the item's review date when no result was chosen and still clears it when a review is declined"
    },
    {
      "description": "A6's second half, folded into the same decision: closing without a result leaves the item's open Review row OPEN, while a genuine decline still completes it. Today closeSession completes the row separately and unconditionally, which is exactly how the row and the date came apart.",
      "test": "leaves an open review row open when no result was chosen and still completes it on a genuine decline"
    },
    {
      "description": "THE CORE SAFETY INVARIANT, and the check the owner asked for by name: a whole-database replacement is refused while ANY unfinished practice session exists -- and the test proves the three ways an earlier design would have leaked. A RUNNING session blocks it, a PAUSED session blocks it just as hard, and a STALE session blocks it too. Staleness is not, and can never become, permission to destroy practice.",
      "test": "refuses a replacement for a running, a paused, and a stale unfinished session alike"
    },
    {
      "description": "The discriminating opposite of the check above, so the guard cannot be satisfied by simply refusing everything: with no unfinished session at all, a replacement proceeds normally.",
      "test": "allows a replacement when no unfinished practice session exists"
    },
    {
      "description": "Staleness is confined to non-destructive outcomes. The predicate separates ordinary overtime (LIVE -- practising past the target is normal) from a long-abandoned clock (STALE), and the stale verdict feeds only the proposed minutes and the attention state. Proved by asserting that the replacement decision is identical for a live and a stale session.",
      "test": "reaches the same replacement decision for a stale session as for a live one"
    },
    {
      "description": "A2's consequence for recorded minutes, both directions: an abandoned block proposes its own target rather than the fabricated wall-clock figure, while a genuinely overrun block still proposes its real elapsed minutes.",
      "test": "proposes the target for an abandoned block and the real elapsed minutes for an overrun one"
    },
    {
      "description": "Deferred automatic sync really resumes, after EVERY supported resolution path -- not just the one that happens to write to the database. A deferral pending, the retry fires when the last unfinished session clears, whether it was FINISHED (which writes a block) or DISCARDED (which writes nothing at all and bumps no revision). The discard half is the one the earlier design silently failed.",
      "test": "resumes a deferred sync when the session clears, whether it was finished or discarded"
    },
    {
      "description": "Automatic and deliberate replacement are answered differently, and neither is silent. Automatic sync reports a distinct DEFERRED state rather than an error or a success, while a deliberate Import, Restore archive or Keep remote returns an explicit refusal naming the unfinished session -- never a silent no-op and never a silent discard.",
      "test": "defers automatic sync but returns an explicit refusal for a deliberate replacement"
    },
    {
      "description": "A8's DECISION, discriminating what must be cleared from what must survive: installing a new database clears the running plan and today's dismissed reviews and drops a session instrument the new database lacks, while KEEPING one it still has and keeping the cross-instrument 'all' overview. Scope note, stated honestly: this proves the pure transform, NOT that each store action calls it -- the Node environment cannot import useStore.ts, which pulls in Dexie via ./idb. The WIRING is protected structurally instead: the transform returns the new `db` TOGETHER WITH the ephemeral patch in one object, so importDB, resetDemo and clearAll cannot install a database without it, and the manual:OWNER check exercises all three on device.",
      "test": "clears the running plan and drops a session instrument the new database lacks, keeping one it has"
    },
    {
      "description": "B1's calendar semantics, against the exact trap that makes a rolling window wrong: a block started late yesterday is NOT part of today's total even though it falls inside the last 24 hours, and a block started just after midnight today IS.",
      "test": "counts by calendar day, so a block from late yesterday is not part of today's total"
    },
    {
      "description": "The midnight-crossing rule, pinned rather than assumed: a block begun at 23:40 counts WHOLE against the day it began, with none of its minutes apportioned into the following day -- because durationMinutes is the owner's attested figure and routine blocks carry no endedAt to split by. The same rule decides the Monday boundary, so a session begun Sunday 23:30 belongs to the week that is ending.",
      "test": "counts a midnight-crossing block whole against the day it began, including across the Monday boundary"
    },
    {
      "description": "B1's week boundary: the week starts Monday 00:00 local, so Sunday's practice belongs to the week that is ending and Monday's to the one beginning.",
      "test": "starts the week on Monday so Sunday's practice belongs to the week that is ending"
    },
    {
      "description": "A10: instrument-balance percentages sum to 100 when the block list contains practice for an instrument that is not in the supplied instrument list -- the exact case Today produces by passing only active instruments with all blocks.",
      "test": "percentages sum to 100 when blocks exist for an instrument not in the supplied list"
    },
    {
      "description": "A7's selection rule: the most recent NON-EMPTY next action is returned, so a later block that recorded none does not blank out a decision that still stands, and nothing is returned when none was ever written.",
      "test": "returns the most recent non-empty next action and nothing when none was ever written"
    },
    {
      "description": "End to end in the running app, on the owner's own MacBook and iPhone. (a) Practise an item, tap Finish, try to save with no result -- Save is unavailable; use 'Save without a result' and confirm on the item that its review date and its due review are UNCHANGED. (b) Practise it again and confirm last time's next action is shown before you start playing. (c) Leave a block running overnight, reopen, tap Finish -- the proposed minutes are the target, with a plain line saying why, and the block is STILL THERE to be resolved rather than having been discarded. (d) With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, the block survives, and the sync notice says it is waiting. PAUSE the block and confirm it is still protected. Discard it and confirm sync completes on its own within a few seconds with no further tap. (e) With an unfinished block present, try Import and Restore archive from Settings: each refuses with a message naming the block, and the block is untouched. (f) The wiring the Node tests cannot reach: with a Session Plan running and an instrument selected, use Settings to Import a backup, then Reset to demo data, then Erase all data -- after EACH, confirm no stale plan is still running and the app does not show a session instrument the new database no longer contains. (g) Confirm Today's totals line sits BELOW the 'Practise now' card and that card is still fully visible without scrolling on the iPhone.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "This lane changes what gets WRITTEN into saved practice data and guards the paths that REPLACE the whole database, so touchesSavedData is unambiguously true and is answered that way deliberately even though it may raise the tier. Specifically: it changes the minutes proposed for a closed block, changes whether a resultless close clears an item's nextReviewDate and completes its open Review row, adds an unfinished-practice guard to importFullBackup (the chokepoint for the four INBOUND replacements -- manual import, sync pull, conflict-keep-remote and archive restore), and adds a shared ephemeral reset to the three store actions that actually install a new database: importDB, resetDemo and clearAll. The last two never pass through importFullBackup, which is why the reset lives in the store rather than at that chokepoint. It touches no authentication and no payments; the GitHub token and NAS base URL are not read, written or moved.\n\nWhat bounds the risk: there is NO schema change, no migration, and no change to any persisted shape -- SCHEMA_VERSION stays 11, and src/domain/types.ts and src/domain/migrations.ts are FORBIDDEN so that is enforced by the contract rather than asserted. The tested sync engine, the content-hash comparison, the routine clock, and practiceSignal.ts itself (the wake lock and the boundary announcements) are all forbidden too. Every change is an additive pure function, a guard, or read-only UI, so a revert restores previous behaviour with zero data consequences and nothing to migrate back.\n\nThe direction of risk is worth stating plainly: every behaviour changed here currently DESTROYS or FABRICATES data. The lane makes the app write less and lose less, not more. Three genuinely new failure modes it could introduce, each answered by a discriminating check:\n(1) A DEFERRAL THAT NEVER RELEASES. Deliberately NOT solved by letting a stale session stop deferring -- that would make a heuristic into an authority to destroy practice, which an earlier draft proposed and which is now forbidden outright. It is solved by RESOLUTION and VISIBILITY: the deferral is retried the moment the unfinished session clears (finished OR discarded, proved by test), and while it persists the sync notice says so and a stale session is labelled on Today so the owner can Finish, correct the minutes, or Discard. A stale unfinished session stays protected exactly like a fresh one, and a check asserts the replacement decision is IDENTICAL for both.\n(2) A KEEP-VS-CLEAR CHANGE THAT STOPS A GENUINE DECLINE FROM CLEARING A DATE -- which is why that check tests both directions in one test rather than only the happy path.\n(3) A GUARD SO BROAD IT REFUSES EVERYTHING, turning a data-safety fix into a broken sync -- which is why a check asserts a replacement proceeds normally when no unfinished session exists."
  },
  "delta": {
    "step": 7,
    "today": "Step 7 records that saving a block completes any open review and schedules the next one 'on the date that was shown', and the flow ends 'recorded honestly: one block, one result, one next action -- and the item knows when it should come back.' Verified against the code at 0c6058e, four of those claims are false.\n\nONE RESULT is optional, and skipping it is destructive. Save is always enabled and `result` starts null. setReviewDate is reached only from pickResult or the manual date field, so with no result the date field stays empty, scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate: null } and CLEARS the item's date, and closeSession completes every open review for the item anyway. One skipped tap and the item silently leaves the review system: review closed, date erased, SM-2 state left stale, and it never appears under Due reviews again. The screen says the opposite while this happens -- 'Should this come back? Yes' sits above an empty date field, because comeBack defaults to true. 'The date shown is the date saved' is broken in the worst direction: nothing is shown and the schedule is wiped.\n\nRECORDED HONESTLY is not guaranteed. Elapsed time is unbounded wall clock, so a block left running overnight pre-fills the duration with the entire gap. Save it distractedly and eight hours of practice you did not do enter the item's totals, the instrument balance, the Teacher Report and every insight, permanently. Nothing distinguishes a phone locked during real practice from a session abandoned two days ago.\n\nONE NEXT ACTION is write-only. It is captured on every close and read by nothing, anywhere. Practise the item again and the screen shows its general notes instead, so the one thing you deliberately decided to try never reaches the moment it was written for.\n\nAnd the block can be destroyed before it is ever recorded. A running block lives outside the synced database, so the device looks unchanged to sync; a change from the other device resolves to a straight pull, and the in-flight block is discarded with no prompt and no archive. A PAUSED block is no safer than a running one. Choosing Import, Restore archive or Keep remote by hand does the same thing just as quietly. And the same replacement leaves the running plan, today's dismissed reviews and a now-dangling session instrument pointing at a database that no longer contains them -- at all three places a database is installed, since reset-to-demo and erase-everything never pass through the import path at all.",
    "instead": "Every minute the app records is a minute you actually played, and every number it shows is derived from those minutes honestly. Two separate questions do that work and are never confused: whether an unfinished session EXISTS decides whether anything may replace your data, and whether its elapsed figure is still PLAUSIBLE decides only what minutes are proposed and whether it is worth pointing at. A heuristic about duration never becomes permission to discard practice.\n\nSaving needs a result -- the six options are already on screen, and 'Save without a result' keeps not_logged deliberate rather than accidental. Underneath, at the one place every caller routes through, answering nothing no longer reads as declining: a close carrying no result leaves the item's review date exactly as it was and leaves its open review open, while genuinely declining still clears it. Closing an ABANDONED block proposes its own target rather than the fabricated figure and says plainly why, so a forgotten clock cannot write practice you did not do -- while ordinary overtime stays completely normal. Practising an item again shows the next action you chose last time, before you start playing.\n\nAnd no unfinished session is ever destroyed by a replacement you did not aim at it -- running or paused, fresh or stale, ordinary or routine. Staleness decides the minutes proposed and raises the attention state; it never becomes permission to discard practice. Automatic sync defers quietly while practice is unfinished and retries the moment that session clears, whether you finished it or discarded it. A deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the block that is in the way -- never a silent no-op, never a silent discard. A stale session blocking sync says so on Today and in the sync notice, and Resume leads straight to Finish, correct the minutes, or Discard. When a replacement does happen, the running plan, today's dismissals and a session instrument the new database lacks are cleared in the same step -- at every one of the three places a database is installed, not just the import path.\n\nAnd you can finally see how much you have practised: a compact minutes-and-blocks line for today and this week, low on Today and never above the recommendation, with today, this week and all time per instrument on Insights. Calendar figures, not rolling windows -- late last night belongs to yesterday and the week starts Monday. Neutral counts only, no target and no streak.",
    "keep": [
      "An unfinished practice session is never destroyed by a replacement you did not aim at it, and a paused session is protected exactly as much as a running one.",
      "A heuristic never becomes an authority: staleness changes what is proposed and what is shown, never what is discarded.",
      "Practising stays the only thing that completes a review and advances spaced repetition; 'Not now' still changes no schedule and snooze still moves the real date on both sides.",
      "The date previewed before saving is exactly the date saved -- now including when that date is deliberately left unchanged.",
      "Closing a block stays under 60 seconds and starting one under 30. No new field is added; requiring a result only makes a choice already on screen a required one.",
      "The SM-2 rungs are not retuned and no schema changes: SCHEMA_VERSION stays 11 with no migration.",
      "No timer or wake-lock behaviour changes, and no recorded minute is ever influenced by a wake-lock or audio outcome.",
      "Routine runs are untouched -- their minutes are already clamped per segment, and finishRoutine still records time without a judgement.",
      "The sync model stays whole-snapshot, content-hash compared, with explicit two-button conflicts and both copies preserved. No timestamp enters a sync decision.",
      "The primary recommendation stays above the fold on a 390x844 phone; the totals line sits below it.",
      "Totals stay neutral counts -- no goal, streak, score, bar or judging colour -- and everything still works fully offline."
    ],
    "assumptions": [
      "Staleness is a judgement about a DURATION, not about a session's worth. It is wired to the proposed minutes and the attention state, and to no destructive path anywhere.",
      "What blocks a replacement is the PRESENCE of an unfinished session, never whether its clock is ticking -- pausing protects, it does not expose.",
      "A deferred sync is retried by watching the blocking condition clear, so finishing and discarding both release it; neither depends on an incidental database write.",
      "Deliberate erasure -- reset to demo, erase everything -- is aimed at destroying the data and already confirms first, so it keeps no guard; it must still leave no ephemeral state behind.",
      "A block belongs whole to the calendar day it began, because its minutes are the figure you attested to and routine blocks carry no end timestamp to split by.",
      "The week starts Monday 00:00 local time.",
      "The most recent non-empty next action is the right one to surface; a later block that recorded none should not blank out a decision that still stands."
    ],
    "showMe": "Practise an item, tap Finish, and try to save without choosing a result -- Save is unavailable. Use 'Save without a result', then open the item: its next review date is UNCHANGED and its due review is still open, where today both would have silently disappeared. Practise it again and last time's next action is shown before you start playing.\n\nLeave a block running overnight, reopen and tap Finish: the proposed minutes are the block's target, not the eight-hour gap, with one plain line saying why -- and the block is still there to resolve, not discarded on your behalf. A block you genuinely played twenty minutes past its target still proposes the real elapsed time.\n\nNow the part that matters most. With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, your block is still there with its time intact, and the sync notice says it is waiting on that block. PAUSE the block -- it is still protected. Leave it overnight so it goes stale -- it is STILL protected, and now Today's In-progress card says so. Discard it, and sync completes on its own within a few seconds without you touching anything. Then try Import or Restore archive with a block unfinished: each refuses out loud, names the block, and leaves it exactly where it was.\n\nFinally, glance at Today: below the 'Practise now' card -- still fully visible without scrolling -- a quiet line reads today's and this week's minutes and block counts, and Insights shows the same per instrument including all time. No goal, no streak, no bar."
  },
  "desiredRules": [],
  "docsDelta": [
    "CLAUDE.md",
    "AGENTS.md",
    "README.md"
  ]
}
```
````

## The approved Delta this change must deliver

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


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Install the app and keep it current

_Works now · approved 2026-08-28T13:30:17.892Z by Ethan (signed)_

## Goal

Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.

## Starts when

The musician opens the app's web address on a device and installs it to the home screen or dock.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Installs the app from its web address.
   - Shows: It opens like an app, full screen, with the navigation bar reaching the bottom of the phone.
   - Changes: The app's files are cached on the device; practice data stays in the device's own database.

2. **The musician** Practises with no network at all.
   - Shows: Everything works — recommendations, blocks, reviews, notes.
   - Changes: Nothing is special-cased for being offline; only syncing and opening NAS files need a network.

3. **Practice Compass** Checks for a new build every hour and whenever the app is brought back to the foreground.
   - Shows: A calm 'A new version is ready.' banner with a Reload button — never an automatic reload in the middle of a session.
   - Changes: Nothing until the musician chooses to reload.

4. **The musician** Taps Reload when it suits them.
   - Shows: The app restarts on the new version; Settings shows the build it is running.
   - Changes: Nothing in the practice data — an update replaces code, never data.

## Ends with

Both devices run the current version, neither needed reinstalling, and neither needs a network to practise.

## Variations

- **Offline when a check is due** — The check simply does nothing and tries again later — no error, no interruption. _(Works now)_
- **Not now** — Ignoring the banner keeps the current version running for as long as the musician likes; the offer comes back. _(Works now)_

## Rules

- Reinstalling is never the update path.
- An update never interrupts a running block — the reload is always the musician's choice.
- Every core flow works with no network.

## Involves

- The musician

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

---

# Point this device at the NAS

_Works now · approved 2026-08-28T13:30:17.952Z by Ethan (signed)_

## Goal

Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.

## Starts when

In Settings → NAS recordings the musician sets the base URL that serves their recordings folder.

## Needs first

- The recordings folder is served over the network from the NAS and is reachable from this device at some web address

## Steps

1. **The musician** Types the address that serves the recordings folder.
   - Shows: 'Resolves to: …/…' once it is valid, or 'That doesn’t look like a valid web address' if it is not; a host typed without a scheme is completed to https:// when the field loses focus.
   - Changes: The address is stored in this device's local storage. It is environment configuration, not practice data and not a secret: it never enters the database, a backup or a sync snapshot.

2. **The musician** Taps 'Test link' to open a known recording and confirm the address works.
   - Shows: The file opens in a new tab, or the app says the base URL isn’t valid and opens nothing.
   - Changes: Nothing is stored or downloaded — the app fetches a recording only when someone explicitly opens it.

3. **Practice Compass** Resolves every relative recording and score path in every lesson against this address from then on.
   - Shows: 'Open' beside each link; with no address it reads 'Set your NAS base URL in Settings to open this' and stays disabled — never a broken or wrong link.
   - Changes: Nothing in the data; resolving is pure and happens on demand.

## Ends with

This device can open class videos and scores on demand, while the app itself still holds nothing but links.

## Variations

- **Every device sets its own address** — The address is per-device and never syncs, so each device holds whatever address reaches the NAS from where it is — a new device simply has none until it is given one. _(Works now)_
- **The NAS is not reachable right now** — Opening a link fails in the browser like any unreachable address. Nothing in the app changes, no data is lost, and every other flow keeps working offline. _(Works now)_
- **Links that need no address** — A recording stored as a complete https address opens with no base URL set at all. _(Works now)_
- **A bad address** — An unparseable or non-http(s) address is reported as invalid and nothing is opened — it is never silently resolved to an in-app route. _(Works now)_

## Rules

- The NAS address is per-device configuration — never synced, never in a backup, never a password.
- The app stores links to recordings and scores, never their bytes.
- An unusable address is reported, never resolved to a wrong link.
- A recording is fetched only when the musician explicitly opens it — never at startup.

## Involves

- The musician
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Take questions and a summary to class

_Works now · approved 2026-08-28T13:30:18.013Z by Ethan (signed)_

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question is written on an item (at close, or by editing it) while it is flagged for the next class.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.

2. **The musician** Copies, downloads or prints the questions.
   - Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.

3. **The musician** Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
   - Shows: A copyable summary of what was practised, how it went and what is open.

4. **The musician** Taps 'Copy report'.
   - Shows: 'Copied ✓'.
   - Changes: Nothing in the data — the report is generated on the spot.

## Ends with

The musician walks into the lesson with their real questions and a truthful summary, without having kept a separate notebook.

## Variations

- **A question survives practice** — Practising never clears a question — only editing the item removes it. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher

---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician

---

# Keep the MacBook and iPhone in step

_Works now · approved 2026-08-28T13:30:18.104Z by Ethan (signed)_

## Goal

Practise on either device and have both hold the same data, without a server or an account.

## Starts when

In Settings → Sync the musician enters a private GitHub repo they own and a fine-grained token, and taps 'Connect & sync'.

## Needs first

- A private GitHub repo dedicated to this app's data
- A fine-grained token with Contents read/write on that repo

## Steps

1. **The musician** Enters owner/name and a token scoped to that one repo with Contents read/write.
   - Shows: The connection state, with the token kept in this browser only — never in backups or synced data.
   - Changes: The configuration is written to this device's local storage.

2. **Practice Compass** Builds a whole snapshot of the device's data and files, hashes it, and compares it three ways against the repo and the last synced hash.
   - Shows: Plain status: in sync, pushed, pulled, or a conflict — with the device name, last sync time and short content hash.

3. **Practice Compass** Publishes the snapshot atomically when this device is ahead — blobs, then tree, then commit, then a fast-forward-only reference update.
   - Shows: A brand-new empty repo is bootstrapped first; a failed bootstrap says so and leaves no partial snapshot.
   - Changes: One commit holds the manifest, the state and the attachments; a race is reported as a conflict rather than overwriting anyone.
   - Only if: The device is online and the token is valid for that repo

4. **Practice Compass** Archives the current copy on this device before applying an incoming snapshot.
   - Changes: Local data is replaced only after everything has been fetched and validated.

5. **The musician** Chooses a side when both copies changed.
   - Shows: A two-button choice; which side is newer is shown only as a hint, never applied automatically.
   - Changes: Keeping this device pushes with the GitHub copy as the parent commit, so it stays in history; taking the GitHub copy archives this device's copy both in the app and on an archive branch first.

6. **Practice Compass** Syncs again on its own when the app opens, 30 quiet seconds after changes, and when the device comes back online.
   - Shows: Unconfigured or offline, every trigger is simply a no-op.

## Ends with

Both devices hold the same practice data, every replacement was explicit, and no copy was ever destroyed.

## Variations

- **Restore the archived copy** — The pre-sync archive kept on the device can be restored from Settings after an unwanted pull. _(Works now)_
- **Legacy remote** — An older state.json + files/ remote still pulls losslessly; the next push migrates the format, keeping the old snapshot in git history. _(Works now)_
- **Sync off** — Without sync the app is fully usable offline and data moves by manual export and import. _(Works now)_

## Rules

- Decisions compare content hashes, never timestamps — newest never silently wins.
- Both copies are preserved before anything is replaced.
- The token lives only in this browser's local storage.
- No backend, no auth server, no paid service.

## Involves

- The musician
- The user's own GitHub repo
- Two devices

---

# Work through a pathway stage

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals

## Stay in scope — you may ONLY change

- AGENTS.md
- CLAUDE.md
- README.md
- src/App.tsx
- src/components/Layout.tsx
- src/domain/blocks.test.ts
- src/domain/blocks.ts
- src/domain/index.ts
- src/domain/practiceSession.test.ts
- src/domain/practiceSession.ts
- src/domain/scheduling.test.ts
- src/domain/scheduling.ts
- src/domain/selectors.test.ts
- src/domain/selectors.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Insights.tsx
- src/pages/Today.tsx
- src/store/backup.ts
- src/store/githubSync.ts
- src/store/useStore.ts

Never touch:

- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/sync.ts
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/domain/routines.ts
- src/pages/RoutineRunner.tsx
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/farsi.ts
- src/domain/plan.ts
- vite.config.ts
- package.json
- src/domain/practiceSignal.ts
- src/domain/practiceSignal.test.ts
- No unfinished practice may be lost. An unfinished session -- ordinary or routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a database replacement the owner did not explicitly aim at it. Staleness may change the proposed minutes and the attention state and NOTHING else; it must never become an authority to discard practice, and no threshold may be wired to a destructive path.
- A deferred sync must never become a silent permanent outage OR a silent discard. It is retried on the blocking condition CLEARING -- covering finish and discard alike, not an incidental database write only one of them makes -- and while it persists it is visible: the sync notice says what it is waiting for, and a stale unfinished session is labelled on Today so it can be resolved.
- No schema change of any kind. SCHEMA_VERSION stays 11, no migration is added, and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than a promise.
- Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2. This lane changes when a resultless close must NOT touch the schedule; it never adds a new way to complete one.
- The SM-2 rungs themselves are not retuned. DEFAULT_SCHEDULING_PARAMS and its byte-identical-defaults snapshot test stay green. Whether repeated early practice should advance reps (review A3) is a separate lane and a separate owner decision.
- 'Not now' still changes no schedule at all, and snooze (+2d) still moves the real date on both the review and the item.
- Starting a block stays under 30 seconds and closing one under 60. Requiring a result adds no new field -- the six options are already on screen; it only makes a choice already present a required one, and 'Save without a result' remains one tap away.
- No wake-lock or timer behaviour changes. shouldKeepAwake, nextSignal, acknowledgeThrough, sessionElapsedSeconds, runElapsedSeconds, locateClock, skipCurrentSegment and aggregateItemMinutes keep their current behaviour exactly; useScreenAwake.ts and screenAwake.ts are forbidden. No wake-lock or audio outcome may influence a recorded minute, and the new staleness predicate must not feed the awake decision.
- Routine runs are not touched. segmentElapsed already clamps a segment to its authored duration, so a routine cannot fabricate minutes; routines.ts and RoutineRunner.tsx are forbidden, and finishRoutine still writes at most one block per distinct bound item with result not_logged.
- The sync model itself is unchanged: whole snapshots, three-way content-hash comparison, explicit two-button conflicts, both copies preserved. decideSync, syncEngine.ts and gitRemote.ts are forbidden. Nothing here introduces a timestamp into a sync decision.
- The primary recommendation stays above the fold on a 390x844 phone. The totals line goes BELOW it on Today, never above; PlanCard and RoutinesCard keep their collapsed peer-doorway shape.
- No gamification. Totals are neutral counts of minutes and blocks with no goal, streak, score, progress bar, celebration or judging colour.
- Today stays scoped to one instrument, and the cross-instrument Overview stays a deliberate secondary choice.
- Everything still works fully offline and local-first. A deferred sync is a distinct, visible waiting state -- never an error, never a silent no-op -- and it never blocks practising.
- practiceSignal.ts is not edited in this lane and is forbidden, so the wake-lock and boundary-announcement behaviour cannot change even by accident. The new staleness predicate lives in practiceSession.ts and must never be fed into shouldKeepAwake or nextSignal.
- Review A3 -- SM-2 advancing reps on every closed block rather than once per due date, so three sessions in one afternoon can push a review from 2 days to 15. Verified by reading scheduling.ts:160-176, genuinely high value, and deliberately deferred: it changes what r-practice-completes-reviews means and needs its own owner decision. src/domain/scoring.ts and the SM-2 rungs stay untouched here.
- Review A5 -- dormant/'Resting' items still being scored and still eligible for the Maintenance card, with neglect making them MORE likely the longer they rest. One predicate in scoring.ts fixes it, but it is about what the app DISPLAYS, not what it RECORDS, so it does not belong on this lane's spine. scoring.ts and recommend.ts are forbidden.
- Review A9 -- persianSearchMatch is written, tested and wired to nothing while both search boxes use toLowerCase().includes(). Highest value-per-line fix in the repo and an excellent standalone lane for browse-my-repertoire, but it shares no file and no invariant with this one.
- Review A4 -- lesson-scoped commitments (assignedForLesson boolean to assignedLessonId). Needs SCHEMA_VERSION and a migration, therefore heavy tier under the repo's own tierRules. Preserved as a well-defined follow-on rather than widening this lane.
- First-class NAS references on practice items (review B3). Also a schema bump. Worth pairing with A4 in one heavy lane so the ceremony is paid once -- while noting the counter-argument, that bundling unrelated migrations makes the sealed review harder to reason about and the rollback coarser. Note also that rendering a linked lesson's existing references on the item page would deliver much of the value with NO schema change at all, and should be tried first.
- All NAS browsing and in-app viewing (review B2/B4). Blocked behind a research question, not an implementation one: cspPlugin in vite.config.ts is apply:'build', so every NAS feature works on `npm run dev` and fails SILENTLY on GitHub Pages. connect-src blocks a directory fetch, frame-src 'none' blocks any in-app PDF viewer including blob:, media-src blocks NAS video. Cheapest real steps, in order: a plain link opening the Go file server's own directory listing (zero code, already served per DECISIONS.md); a photo/image attachment shown during practice (already allowed by img-src blob:, zero CSP change); then a generated path index from a generalised scripts/scan-setar-classes.mjs, which needs no CSP change, no CORS and works offline. vite.config.ts is forbidden here so no CSP token can move by accident.
- Review B5 -- the iPhone bottom bar staying displaced after keyboard dismissal. Device-specific and unsettleable from source. The one-line first attempt is lengthening useViewportGuard's 80ms settle debounce past the ~250-300ms iOS dismissal animation; FUTURE.md already records the fallback. Needs its own lane with manual:OWNER evidence.
- Review A11 (an item can be made its own parent, and family metadata survives an instrument switch), A13 (a malformed attachment entry is skipped then destroyed by replaceAllBlobs), A14 (weekly insights and the Teacher Report mixing 'during this period' with 'right now'), A15 (Settings claiming 'newest copy wins' when decideSync never reads a timestamp), A16 (Field gives form controls no accessible name), A17 (light-theme contrast below AA).
- Adding jsdom, fake-indexeddb, Playwright, or any browser/component test harness. vitest stays environment:'node'. If a decision feels untestable, push it into a pure domain function -- that is what this plan already does. Enabling .prismatica journeys checks is its own lane.
- Filling .prismatica/product-map.md, and writing the missing Flows for running a routine and for hands-free practice.
- Splitting a block's minutes across a midnight or week boundary. Considered and rejected on evidence, not omitted: durationMinutes is the owner's attested figure and this lane deliberately makes it diverge from wall clock, and endedAt is optional and absent on routine blocks (factories.ts:168, applyRoutineRun passes none). Apportioning would overrule the owner's own correction and apply unevenly across block types. Adding an endedAt backfill purely for theoretical precision would need a schema change and is explicitly not worth it.
- Guarding reset-to-demo and erase-everything behind the unfinished-session check. Those actions are AIMED at destroying the data and already confirm first, so refusing them would be obstruction rather than safety. They are still fixed here for A8 -- they must leave no ephemeral state pointing at a database that no longer exists. Mentioning a running block in their confirm text is a nice-to-have, not required by this lane.

## Definition of done

- **ac-1** — A6 root cause, and the discriminating pair that defines it: a close carrying NO result leaves the item's next review date exactly as it was, while a close that genuinely DECLINES a review still clears it. Both halves in one test, because the whole bug is that the code cannot currently tell those two states apart. → proven by `keeps the item's review date when no result was chosen and still clears it when a review is declined`
- **ac-2** — A6's second half, folded into the same decision: closing without a result leaves the item's open Review row OPEN, while a genuine decline still completes it. Today closeSession completes the row separately and unconditionally, which is exactly how the row and the date came apart. → proven by `leaves an open review row open when no result was chosen and still completes it on a genuine decline`
- **ac-3** — THE CORE SAFETY INVARIANT, and the check the owner asked for by name: a whole-database replacement is refused while ANY unfinished practice session exists -- and the test proves the three ways an earlier design would have leaked. A RUNNING session blocks it, a PAUSED session blocks it just as hard, and a STALE session blocks it too. Staleness is not, and can never become, permission to destroy practice. → proven by `refuses a replacement for a running, a paused, and a stale unfinished session alike`
- **ac-4** — The discriminating opposite of the check above, so the guard cannot be satisfied by simply refusing everything: with no unfinished session at all, a replacement proceeds normally. → proven by `allows a replacement when no unfinished practice session exists`
- **ac-5** — Staleness is confined to non-destructive outcomes. The predicate separates ordinary overtime (LIVE -- practising past the target is normal) from a long-abandoned clock (STALE), and the stale verdict feeds only the proposed minutes and the attention state. Proved by asserting that the replacement decision is identical for a live and a stale session. → proven by `reaches the same replacement decision for a stale session as for a live one`
- **ac-6** — A2's consequence for recorded minutes, both directions: an abandoned block proposes its own target rather than the fabricated wall-clock figure, while a genuinely overrun block still proposes its real elapsed minutes. → proven by `proposes the target for an abandoned block and the real elapsed minutes for an overrun one`
- **ac-7** — Deferred automatic sync really resumes, after EVERY supported resolution path -- not just the one that happens to write to the database. A deferral pending, the retry fires when the last unfinished session clears, whether it was FINISHED (which writes a block) or DISCARDED (which writes nothing at all and bumps no revision). The discard half is the one the earlier design silently failed. → proven by `resumes a deferred sync when the session clears, whether it was finished or discarded`
- **ac-8** — Automatic and deliberate replacement are answered differently, and neither is silent. Automatic sync reports a distinct DEFERRED state rather than an error or a success, while a deliberate Import, Restore archive or Keep remote returns an explicit refusal naming the unfinished session -- never a silent no-op and never a silent discard. → proven by `defers automatic sync but returns an explicit refusal for a deliberate replacement`
- **ac-9** — A8's DECISION, discriminating what must be cleared from what must survive: installing a new database clears the running plan and today's dismissed reviews and drops a session instrument the new database lacks, while KEEPING one it still has and keeping the cross-instrument 'all' overview. Scope note, stated honestly: this proves the pure transform, NOT that each store action calls it -- the Node environment cannot import useStore.ts, which pulls in Dexie via ./idb. The WIRING is protected structurally instead: the transform returns the new `db` TOGETHER WITH the ephemeral patch in one object, so importDB, resetDemo and clearAll cannot install a database without it, and the manual:OWNER check exercises all three on device. → proven by `clears the running plan and drops a session instrument the new database lacks, keeping one it has`
- **ac-10** — B1's calendar semantics, against the exact trap that makes a rolling window wrong: a block started late yesterday is NOT part of today's total even though it falls inside the last 24 hours, and a block started just after midnight today IS. → proven by `counts by calendar day, so a block from late yesterday is not part of today's total`
- **ac-11** — The midnight-crossing rule, pinned rather than assumed: a block begun at 23:40 counts WHOLE against the day it began, with none of its minutes apportioned into the following day -- because durationMinutes is the owner's attested figure and routine blocks carry no endedAt to split by. The same rule decides the Monday boundary, so a session begun Sunday 23:30 belongs to the week that is ending. → proven by `counts a midnight-crossing block whole against the day it began, including across the Monday boundary`
- **ac-12** — B1's week boundary: the week starts Monday 00:00 local, so Sunday's practice belongs to the week that is ending and Monday's to the one beginning. → proven by `starts the week on Monday so Sunday's practice belongs to the week that is ending`
- **ac-13** — A10: instrument-balance percentages sum to 100 when the block list contains practice for an instrument that is not in the supplied instrument list -- the exact case Today produces by passing only active instruments with all blocks. → proven by `percentages sum to 100 when blocks exist for an instrument not in the supplied list`
- **ac-14** — A7's selection rule: the most recent NON-EMPTY next action is returned, so a later block that recorded none does not blank out a decision that still stands, and nothing is returned when none was ever written. → proven by `returns the most recent non-empty next action and nothing when none was ever written`
- **ac-15** — End to end in the running app, on the owner's own MacBook and iPhone. (a) Practise an item, tap Finish, try to save with no result -- Save is unavailable; use 'Save without a result' and confirm on the item that its review date and its due review are UNCHANGED. (b) Practise it again and confirm last time's next action is shown before you start playing. (c) Leave a block running overnight, reopen, tap Finish -- the proposed minutes are the target, with a plain line saying why, and the block is STILL THERE to be resolved rather than having been discarded. (d) With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, the block survives, and the sync notice says it is waiting. PAUSE the block and confirm it is still protected. Discard it and confirm sync completes on its own within a few seconds with no further tap. (e) With an unfinished block present, try Import and Restore archive from Settings: each refuses with a message naming the block, and the block is untouched. (f) The wiring the Node tests cannot reach: with a Session Plan running and an instrument selected, use Settings to Import a backup, then Reset to demo data, then Erase all data -- after EACH, confirm no stale plan is still running and the app does not show a session instrument the new database no longer contains. (g) Confirm Today's totals line sits BELOW the 'Practise now' card and that card is still fully visible without scrolling on the iPhone. → proven by `manual:OWNER`

## Docs to update as part of this change

- CLAUDE.md
- AGENTS.md
- README.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

