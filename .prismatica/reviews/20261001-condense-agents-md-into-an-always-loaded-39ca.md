---
id: 20261001-condense-agents-md-into-an-always-loaded-39ca
contractId: 20261001-condense-agents-md-into-an-always-loaded-39ca
patchId: 96b8f438b0a24f91b3eb200aae60c52a2649a38c
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: always-loaded-prohibition-preservation
    summary: Six baseline agent-facing restrictions remain absent from AGENTS.md.
      Restore the whole family, extend the preservation guard and correct the
      disposition table.
    counterexample: "Baseline 56789a8:AGENTS.md prohibits an effect-mirrored notes
      ref (150-151), audio unlock on the practice screen (503-505), assigning a
      preserved course key merely by lower ordinal (2265-2267), putting
      planMinutesByInstrument in PracticeDB or sync/backup (2985-2986), viewport
      restoration while short or zoomed (3041-3043), and components rebuilding
      domain objects by hand (3102-3103). Current AGENTS.md lines 28, 61,
      113-114, 53/134, 143 and 148 omit these specific restrictions. Clean
      consumers: ItemNotes/DurableNotes, LessonNotes, ItemDetail, ActiveBlock,
      RoutineRunner, useScreenAwake, the CGS scanner/runbook, store partialize,
      Today, SessionPlan, viewport/useViewportGuard/Layout and viewport fixtures
      retain their mechanisms. The five previously named bans, core loop, four
      hard do-nots, eleven rule ids, bounded owner decisions, named gaps, NAS
      tooling and AGENTS-citing consumers survive. CLAUDE.md imports AGENTS.md,
      but the 83-phrase preservation test passes despite these omissions."
  - family: repository-guidance-path-reachability
    summary: namedPaths still fails open across inline links/images, reference
      definitions and HTML targets. Close all extraction branches and extend the
      focused proof route.
    counterexample: "Read-only execution of the actual ac-3 body passes with
      appended [missing](docs/(reviewer-missing).md), [missing]:
      docs/(reviewer-missing).md or ![missing](public/(reviewer-missing).png):
      extraction checks only existing docs/ or public/.
      [missing](docs/cgs-course.md(reviewer-missing)) checks an existing prefix
      file and passes. Reference definitions under > or - are omitted, as are <a
      href=docs/reviewer-missing.md> and <img src=public/reviewer-missing.png>.
      Sweep found one namedPaths implementation, three LINK_TARGETS branches,
      ac-3 and its fixture test; npm test feeds ci.yml and deploy.yml. Clean
      cases: code spans/fences, ordinary/titled/angle links, simple top-level
      references, quoted HTML, anchor/query/line stripping, deduplication and
      specified glob exclusions. All five named guards pass on current text;
      original rejection examples correctly fail, but these independent family
      cases are absent from the proof fixtures."
createdAt: 2026-10-01T22:39:51.704Z
sealedAt: 2026-10-01T22:49:12.122Z
---

# Review: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261001-condense-agents-md-into-an-always-loaded-39ca
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/43
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Diff patch-id:** `96b8f438b0a24f91b3eb200aae60c52a2649a38c`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified


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

**Approved intent:** `.prismatica/intents/20261001-condense-agents-md-into-an-always-loaded-39ca.md`

**Findings from the previous review:**

- **always-loaded-prohibition-preservation** — Restore agent-facing prohibitions omitted from AGENTS.md; a runbook or code comment does not satisfy the approved requirement that every such prohibition remains always loaded.
  _counterexample:_ At baseline 56789a8:AGENTS.md, lines 2443-2445 ban a contrast-card viewer, flashcard player and deck-by-deck list; lines 2888-2889 and 2993 ban optimal Session Plan claims; lines 1719-1721 forbid material/viewer concerns affecting recorded minutes, wake locks or boundary announcements; lines 1567-1569 prohibit a computed multiline dir attribute that the source scanner cannot see; lines 2230-2231 prohibit a course scanner being imported or reachable from runtime. These prohibitions are absent from current AGENTS.md sections Material (284-288), Courses (324-338), Session Plan (363-370) and Direction-aware text (267-273). Sweep checked all 25 baseline sections and current rulebook; retained constraints checked clean include four hard do-nots, all 11 rule ids, bounded owner decisions, named open gaps, NAS tooling safety and AGENTS-citing consumers. Existing docs/cgs-course.md, docs/scheduling-evidence.md, src/domain/plan.ts, src/components/ItemMaterial.tsx, src/components/ClassQuestions.tsx, src/components/direction.test.ts and both course scanner files retain or implement the relevant restrictions; they do not repair the missing always-loaded instructions. DECISIONS.md disposition rows 44-47 and 50 should accurately account for preservation.
- **repository-guidance-path-reachability** — The ac-3 named test silently accepts missing files in ordinary Markdown link forms and misclassifies anchor text as a path glob; close the whole path-extraction family and provide a focused reproducible proof route.
  _counterexample:_ Read-only in-memory execution of the actual tests/agent-context.test.ts body shows that appending [missing](docs/reviewer-missing.md "Guide"), [missing](<docs/reviewer-missing.md>), or `docs/reviewer-missing.md#part[0]` to AGENTS.md leaves 'every repository path AGENTS.md names exists' passing although the file does not exist. Line 68 omits titled links, line 72 rejects angle-delimited targets and filters glob characters before line 73 removes anchors. Plain dangling paths correctly fail. Repository sweep found one namedPaths implementation and one consumer, the ac-3 test at lines 90-93; npm test and CI/deploy consume that result. Clean siblings: current size/import and required-anchor tests pass, baseline size mutation and removed core anchor fail, and the simple dangling-path mutation fails. No committed parser family proof route is identified in the change commit.

**What changed since the previously reviewed head:**

````diff
diff --git a/AGENTS.md b/AGENTS.md
index 343107cefff77d0494d13537956f6b3f09605113..4304fd0b121c5fe90eff7ddaf0cf407ce6514788 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -4,422 +4,149 @@ The contract for anyone, human or AI, extending this app; its value is what it r
 
 ## The core loop
 
-Preserve **one item · one mode · one focus · one result · one next action.** A change that
-blurs the loop or adds a second thing to think about per step is wrong, however useful.
-The loop closes: `ActiveBlock` shows the most recent NON-EMPTY `nextAction` before you play
-(`lastNextAction`, `src/domain/blocks.ts`). Anything the app asks you to record, it must use.
+Preserve **one item · one mode · one focus · one result · one next action.** A change that blurs the loop or adds a second thing to think about per step is wrong, however useful. The loop closes: `ActiveBlock` shows the latest NON-EMPTY `nextAction` before you play (`lastNextAction`). Anything the app asks you to record, it must use.
 
 ## Hard do-nots (only an explicit owner decision, recorded here, changes one)
 
-- **No gamification** (r-no-gamification): no streaks, points, badges, XP, leaderboards,
-  confetti or fake "mastery %". Progress is honest status, results and neutral counts.
-- **No backend, no auth server, no service of our own** (r-local-first-offline).
-  IndexedDB is the source of truth on each device and everything works offline. Free tiers
-  only; no paid services.
-  **Owner decision 2026-07-11:** device sync IS sanctioned, via the owner's own GitHub data
-  repo - see "Sync" below. Never a custom server, never a NAS backend replacing it.
-- **No AI or audio analysis** in v1: no tone scoring, pitch detection, posture tracking or
-  "AI teacher". The app organises; it does not grade.
+- **No gamification** (r-no-gamification): no streaks, points, badges, XP, leaderboards, confetti or fake "mastery %". Progress is honest status, results and neutral counts.
+- **No backend, no auth server, no service of our own** (r-local-first-offline). IndexedDB is the source of truth on each device and everything works offline. Free tiers only; no paid services. **Owner decision 2026-07-11:** device sync IS sanctioned, via the owner's own GitHub data repo - see "Sync" below. Never a custom server, never a NAS backend replacing it.
+- **No AI or audio analysis** in v1: no tone scoring, pitch detection, posture tracking or "AI teacher". The app organises; it does not grade.
 - **No guilt-driven copy.** Insights are neutral observations, never nags.
 
 ## How to change this file
 
-- It holds CURRENT rules only, each stated once, as an imperative plus where it is
-  enforced. Edit a rule in place when it changes; edit this file only then.
-- Never append how a rule was found (review findings, counterexamples, measurements,
-  rejected attempts). The why goes in a dated `DECISIONS.md` entry; mechanism goes in the
-  subsystem's `docs/*.md` or the enforcing code's comment. Text removed on 2026-10-01
-  stays readable at commit 56789a8.
-- CLAUDE.md plus its imports, and this file alone, must each stay <= 32,768 bytes
-  (`tests/agent-context.test.ts`, and Prismatica's instruction-budget check). Make room by
-  condensing in place; subsystem detail may move to its doc; a prohibition aimed at agents
-  stays here.
+- CURRENT rules only, each once, as an imperative plus where it is enforced; edit this file only when a rule changes, in place.
+- Never append how a rule was found (findings, counterexamples, measurements, rejected attempts): the why goes in a dated `DECISIONS.md` entry, mechanism in the subsystem's `docs/*.md` or the enforcing code's comment. Text removed on 2026-10-01 is at 56789a8.
+- CLAUDE.md plus its imports, and this file alone, each stay <= 32,768 bytes (`tests/agent-context.test.ts`, Prismatica's instruction-budget check): condense in place; subsystem detail may move to its doc; a prohibition aimed at agents stays here (that test anchors those restored on 2026-10-01).
 - Owner-approved rule ids (`r-*`) sit beside the text that elaborates them.
 
 ## Practice information has one home per kind (schema v13)
 
-- Four homes (`src/domain/practiceInformation.ts`): `PracticeItem.notes` ("Working
-  notes", the item's one notebook, editable while practising); `PracticeBlock.observation`;
-  `PracticeBlock.nextAction` (decided at close, read at the next block); `lessonAgenda`.
-  The legacy `PracticeBlock.constraint` is kept, shown and validated, with no new capture
-  control. Nothing copies one home into another.
-- A derived value is not a fifth home: read the latest observation from blocks
-  (`latestObservation`) and show it with its date; never store it back on the item.
-- **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`,
-  `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen
-  Persian/Guitar working-detail fields (`shahed`, `ist`, `foroud`, `ornamentIssue`,
-  `mezrabIssue`, `phraseLabel`, `importantNote`, `rightHandIssue`, `leftHandIssue`,
-  `toneIssue`, `fingering`, `tempo`, `stringNoiseIssue`, `bodyTensionNote`) are REMOVED, not
-  merged into `notes` (their content was dummy data). Identity fields (`dastgahAvaz`,
-  `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. The waiver covers exactly
-  those fields and is NOT permission to reset practice history, ratings, reviews,
-  commitments or any future meaningful text. `retirePracticeText` only deletes, reads no
-  clock and runs on every inbound database.
-- `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block):
-  absent, empty and `null` are legitimate; a wrong type is refused naming the record, never
-  coerced.
-- Notes are edited only through `src/components/ItemNotes.tsx` (lesson notes reuse its
-  `DurableNotes`). Save on an explicit Done, never on blur; "Saved." waits for IndexedDB
-  (`storageSettled()`); a failed write keeps the text with Try again (which always writes)
-  and Copy. The draft is tagged with its item and dropped when the item changes; an
-  in-flight write never owns the editor and only the latest save acts (`saveSeq`).
-  Editing notes changes nothing else (clock, block, result, review, SM-2).
-- After any install every attachment the database describes has bytes on this device
-  (r-no-silent-data-loss): `decodeBackupFiles` and `importFullBackup` refuse a file that
-  would break that, naming it and changing nothing; `validateDB` refuses duplicate
-  attachment ids. The export (`buildFullBackupWithRev`) is built from the metadata, so the
-  app never writes a backup it refuses; unreferenced blobs are left untouched, never
-  deleted, and `addAttachment` writes the blob before its metadata.
+- Four homes (`practiceInformation.ts`): `PracticeItem.notes` ("Working notes", the item's one notebook, editable while practising), `PracticeBlock.observation`, `PracticeBlock.nextAction`, `lessonAgenda`. Legacy `PracticeBlock.constraint` is kept, shown and validated, never newly captured. Nothing copies one home into another; the latest observation is derived (`latestObservation`) and shown dated, never stored back.
+- **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`, `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen Persian/Guitar working-detail fields (`shahed`, `ist`, `foroud`, `ornamentIssue`, `mezrabIssue`, `phraseLabel`, `importantNote`, `rightHandIssue`, `leftHandIssue`, `toneIssue`, `fingering`, `tempo`, `stringNoiseIssue`, `bodyTensionNote`) are REMOVED, not merged into `notes` (their content was dummy data). Identity fields (`dastgahAvaz`, `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. The waiver covers exactly those fields and is NOT permission to reset practice history, ratings, reviews, commitments or any future meaningful text. `retirePracticeText` only deletes, reads no clock and runs on every inbound database.
+- `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block): absent, empty and `null` are legitimate; a wrong type is refused naming the record, never coerced.
+- Notes are edited only in `src/components/ItemNotes.tsx` (lessons reuse `DurableNotes`): explicit Done, never on blur; "Saved." waits for IndexedDB; a failed write keeps the text with Try again (always writes) and Copy. The draft is tagged with its item, dropped when it changes, read through a ref, never a closure; an in-flight write never owns the editor; only the latest save acts (`saveSeq`). Editing notes changes nothing else (clock, block, result, review, SM-2).
+- After any install every attachment the database describes has bytes here (r-no-silent-data-loss): `decodeBackupFiles` and `importFullBackup` refuse a file that breaks that, naming it, changing nothing; `validateDB` refuses duplicate attachment ids. The export is built from metadata (`buildFullBackupWithRev`), so never refused; unreferenced blobs are never deleted; `addAttachment` writes the blob first.
 
 ## Quick start, low admin (r-quick-start)
 
-- Starting a block stays under 30 seconds and closing one under 60. Never add a required
-  field beyond an item title; every new field is optional with a smart default; rich
-  metadata stays hidden until asked for.
-- Smart defaults: status -> mode, item -> focus, 10-minute duration; `focusForItem`
-  (`src/domain/defaults.ts`) is the only focus default.
-- Exactly two one-step creation paths: Quick add (title only, also inline from Start and
-  recommendations) and the kind-first full form "Add practice item"
-  (`src/components/itemKinds.ts`: "What are you adding? / Connect it (optional) / First
-  practice setup"), where every connection is settable at creation. Never a third path.
-  Item detail shows "Connected to" near the top.
+- Starting a block stays under 30 seconds, closing one under 60. Never add a required field beyond an item title; a new field is optional with a smart default (status -> mode, item -> focus via `focusForItem` only, 10 minutes); rich metadata stays hidden until asked for.
+- Exactly two one-step creation paths, never a third: Quick add (title only, also inline from Start and recommendations) and the kind-first "Add practice item" (`itemKinds.ts`: "What are you adding? / Connect it (optional) / First practice setup"), every connection settable at creation. Item detail shows "Connected to" near the top.
 
 ## Today is a session workspace for one instrument (r-one-instrument-per-session)
 
-- A persisted `sessionInstrumentId` drives Today; everything below the switcher is scoped
-  to it; the cross-instrument Overview is a deliberate secondary choice, never the default.
-  Never hard-code a morning/evening schedule; never show another instrument's work inside
-  a session. The primary recommendation stays above the fold at 390x844.
-- Session Plan and Routines are two independent peer doorway cards (`PlanCard`,
-  `RoutinesCard` in `src/pages/Today.tsx`; owner acceptance 2026-08-28), each collapsed
-  (~50px) with its own state and Resume takeover. Today is the only home of an unplaced
-  routine, so its rows carry Edit, Start and "Short on time - essentials only".
-- **Owner decision 2026-09-11:** the two doorways sit ABOVE the recommendation. It is a
-  taste judgement, not a derivation (both orders fit above the fold). Do not re-derive or
-  flip it; it changes only when the owner says so.
+- A persisted `sessionInstrumentId` scopes everything below Today's switcher; the cross-instrument Overview is a deliberate secondary choice, never the default. Never hard-code a morning/evening schedule or show another instrument's work in a session. The primary recommendation stays above the fold at 390x844.
+- Session Plan and Routines are independent peer doorway cards (`PlanCard`, `RoutinesCard`; owner acceptance 2026-08-28), each collapsed (~50px) with its own state and Resume. Today is an unplaced routine's only home: Edit, Start and "Short on time - essentials only".
+- **Owner decision 2026-09-11:** the two doorways sit ABOVE the recommendation. It is a taste judgement, not a derivation (both orders fit above the fold). Do not re-derive or flip it; it changes only when the owner says so.
 
 ## Closing a block and review actions (r-practice-completes-reviews)
 
-- Only closing a block can complete a review or advance SM-2, and not always. "Not now"
-  hides a due review for today, schedule unchanged; Snooze (+2d) moves the date on both
-  the review and the item. Never fabricate a result or leave a stale overdue item. Finish
-  freezes the clock (`pauseSession`) first.
-- A result is required to save; "Save without a result" keeps `not_logged` deliberate.
-  `computeReviewOutcome` (`ReviewAnswer`: scheduled, declined, unanswered) returns the date
-  and `completeOpenReviews` as ONE decision: no result keeps the date and the open row; a
-  decline clears the date and completes the row. `closeSession` never decides the row alone.
-- The close screen leads with the musician's words, then minutes and ONE scheduling line,
-  controls a tap behind. `CloseBlock` holds one `ReviewPlan` that line, field and save all
-  render (`reviewSummaryLine` computes no date). Never reintroduce a second derivation. A
-  new result clears a typed date unless `reviewOverrideSurvivesResultChange` says the
-  engine's date does not depend on it. Save uses the screen's `now` and, if the day
-  rolled, refreshes visibly instead of saving.
+- Only closing a block can complete a review or advance SM-2, and not always. "Not now" hides a due review for today, schedule unchanged; Snooze (+2d) moves the date on review and item. Never fabricate a result or leave a stale overdue item. Finish freezes the clock (`pauseSession`) first.
+- A result is required to save; "Save without a result" keeps `not_logged` deliberate. `computeReviewOutcome` returns the date and `completeOpenReviews` as ONE decision (no result keeps both; a decline clears the date, completes the row); `closeSession` never decides the row alone.
+- The close screen (`CloseBlock`) leads with the musician's words, then minutes and ONE scheduling line, controls a tap behind, all rendering one `ReviewPlan` (`reviewSummaryLine` computes no date); never a second derivation. A new result clears a typed date unless `reviewOverrideSurvivesResultChange` says the engine's date ignores it; only a typed date is an override (`closeOverrideDate`). Save uses the screen's `now`; if the day rolled it refreshes visibly instead.
 - The due-review row wraps the title, never truncates it; its actions keep their meanings.
 
 ## Unfinished practice is never replaced (r-no-silent-data-loss)
 
-- PRESENCE of unfinished practice, paused or running (`decideReplacement`,
-  `src/domain/practiceSession.ts`), alone decides whether a whole-database replacement may
-  proceed. A stale-clock verdict (`isStaleClock`) only proposes minutes and labels the
-  block (`StaleNote`, wherever Today shows it); never wire it to a destructive path,
-  `shouldKeepAwake` or `nextSignal`.
-- Automatic sync defers (`deferred` phase, never `error`); Import, Restore archive and Keep
-  remote refuse naming the session. `importFullBackup(text, intent, decidedFromRev)` checks
-  presence first and again, with the local `rev` (a counter, never a clock), in the same
-  tick as the install; sync's baseline rev is captured in the same statement as its db.
-  A sync requested mid-run is remembered (`rerunWanted`), never dropped; the deferred retry
-  watches presence clearing (`deferredSyncRetry`, `src/App.tsx`), never `rev`.
-- `installDatabase` returns the new db with ephemeral state (`active`, `activeRoutine`,
-  `activePlan`, `notNow`, an unresolvable `sessionInstrumentId`) reset; `importDB`,
-  `resetDemo` and `clearAll` are each one `set()` of it. Deliberate erasure keeps no guard.
+- PRESENCE of unfinished practice, paused or running (`decideReplacement`), alone decides whether a whole-database replacement may proceed. A stale clock (`isStaleClock`) only proposes minutes and is labelled (`StaleNote`) wherever Today shows it; never wire it to a destructive path, `shouldKeepAwake` or `nextSignal`.
+- Automatic sync defers (`deferred`, never `error`); Import, Restore archive and Keep remote refuse naming the session. `importFullBackup(text, intent, decidedFromRev)` checks presence, then again with the local `rev` (a counter, never a clock) in the install's tick, never installing before `replaceAllBlobs`; `decidedFromRev` is passed in (sync captures it with its db), never read from module scope. A mid-run sync request is remembered (`rerunWanted`), never dropped; the deferred retry (`deferredSyncRetry`, seeded with current presence) watches presence clearing, never `rev`.
+- `active`, `activeRoutine` and `activePlan` are ephemeral, never in `PracticeDB`; `installDatabase` resets them, `notNow` and an unresolvable `sessionInstrumentId`, and `importDB`, `resetDemo` and `clearAll` are each one `set()` of it. Deliberate erasure keeps no guard.
 
 ## Practice totals are calendar figures
 
-`practiceTotals`/`practiceTotalsByInstrument` (`src/domain/selectors.ts`) count local
-calendar days, week from Monday 00:00, never `blocksInWindow`/`totalMinutesInWindow`
-(rolling hours). A block belongs whole to the day it began. Totals stay neutral counts
-and sit below the recommendation on Today. Today and Insights tick `now` each
-minute; Insights counts every instrument and drops empty rows.
+`practiceTotals`/`practiceTotalsByInstrument` count local calendar days, week from Monday 00:00, never rolling hours (`blocksInWindow`, `totalMinutesInWindow`); a block belongs whole to the day it began. They are neutral counts (no goal, filling bar or judging colour) below the recommendation. Today and Insights tick `now` each minute; Insights counts every instrument and drops empty rows.
 
 ## Hands-free practice
 
-- While a practice clock runs and its screen is visible, hold one Screen Wake Lock
-  (`shouldKeepAwake`, `src/domain/practiceSignal.ts`; one owner, `useScreenAwake`).
-  `nextSignal` announces each boundary at most once per call (marker `signalledThrough`,
-  ephemeral only); Skip calls `acknowledgeThrough`. The guaranteed signal is visual (target
-  ring, overtime figure); a block never auto-finishes; audio and vibration are best-effort
-  and never asserted. None of this may change a recorded minute.
-- The wake lock, `crypto.subtle` (`sha256Hex`: sync and archive refresh) and the service
-  worker need a secure context, which plain `http://` on a LAN address is not. Confirm
-  `window.isSecureContext` on the real device over HTTPS before concluding anything from an
-  unmerged branch. The answer is a route, never a fallback hash: `parseSourceIndex` refuses
-  with `INSECURE_CONTEXT_REFUSAL` before reading the file.
-- **Open gaps:** Sync over plain http still throws the raw `Cannot read properties of
-  undefined (reading 'digest')` (a wording fix in its own lane, never a second hash), and
-  `readIndexFile` (`src/store/archiveIndex.ts`) has no production caller.
+- A running clock on a visible screen holds one Screen Wake Lock (`shouldKeepAwake`; one owner, `useScreenAwake`). `nextSignal` announces at most once per call, moving the ephemeral `signalledThrough` to the boundaries passed, never by one; routine boundaries are `segmentBoundaries`, never a second sum; Skip calls `acknowledgeThrough`. The guaranteed signal is visual (target ring, overtime figure; a routine boundary shows for a window, never one render); a block never auto-finishes; audio and vibration are best-effort, never asserted. None of this changes a minute.
+- The wake lock, `crypto.subtle` (`sha256Hex`) and the service worker need a secure context, which LAN `http://` is not: confirm `window.isSecureContext` on the device over HTTPS before judging an unmerged branch. The answer is a route, never a fallback hash: `parseSourceIndex` refuses first (`INSECURE_CONTEXT_REFUSAL`).
+- **Open gaps:** Sync over plain http still throws the raw `Cannot read properties of undefined (reading 'digest')` (a wording fix in its own lane, never a second hash); `readIndexFile` (`src/store/archiveIndex.ts`) has no production caller.
 
 ## Pathways, routines and repertoire
 
-- The practice item is the only unit of work; pathways are a view, with stage progress
-  derived (`itemStageState`, `src/domain/pathways.ts`). Never a parallel to-do list,
-  "pieces" object or guitar-specific model. Pieces may have parts (`parentItemId`),
-  never quotas.
-- The catalogue is reference data in code (`src/domain/pathwaySeed.ts`): suggestions are
-  reference aids, never canonical; keys stay stable per stage. `addFromCatalog` creates an
-  honest "Not practised yet" item (status `new`, zero stats).
-- Suggestions bind by stable reference id (`catalogReferenceId`,
-  `src/domain/referenceCatalog.ts`), never by title or placement, held in `catalogRefs`;
-  one resolver, `resolveCatalogReference`, drives every surface (who reads and writes what:
-  `docs/repertoire-experience.md`). Two items answering one suggestion are candidates,
-  never picked; placing is not linking (`unlinkedInStage`). Unlink, Remove from pathway
-  (`Pathway.hiddenRefs`) and Hide never delete; Delete practice item is the only
-  destructive action. Undecided legacy evidence is settled or refused, never promoted or
-  lost; every write passes `identityRefusal` (`src/store/useStore.ts`); validity never
-  reads an instrument's name.
-- Pathways, stages and routines are editable; deleting a stage or pathway only detaches
-  its items and routines and clears a stale pin.
-- The current stage is the owner's choice: a `currentStageId` pin wins while its stage
-  exists. One route selector (`visiblePathways`/`primaryPathway`/`pathwayPosition`) serves
-  every surface. Never treat linear order as truth for Setar/Tar.
-- A routine (`src/domain/routines.ts`) belongs to an instrument, required for new ones and
-  never invented for a legacy one; a bound segment item always matches it, checked by
-  `retargetRoutineInstrument` on every create and save, never by rewriting an instrument.
-  A run freezes its segments at start, writes at most one block per bound item
-  (`aggregateItemMinutes`, result `not_logged`) and never completes a review. Skip clamps
-  to elapsed; "Short on time" (`segmentsForRun`) drops non-essentials; Finish always saves.
-- Only ONE practice clock runs at a time: block and routine start/resume each refuse while
-  the other exists, and the persist `merge` freezes both if it finds both, losing neither.
-  Pages redirect to the running clock. Elapsed time is wall-clock (`locateClock`).
-- My repertoire is a derived lens: three peer views (My repertoire, the default; Pathways;
-  Practice list) share one instrument selector; browse state lives in the URL
-  (`readBrowseState`, `browseParams`) and never writes `sessionInstrumentId`.
-  `discoverRepertoire` (`src/domain/repertoire.ts`) shows every work once. A work is a
-  top-level item with a work identity (`isWork`): any dastgah/avaz, form, composer or
-  gusheh, or the type `full_piece`/`gusheh` (how Guitar pieces qualify). A work with no
-  dastgah sits under "No dastgah yet"; technique, exercise and study material stay out.
-- Dastgah/Avaz, Form and Composer share one vocabulary (`src/domain/musicTerms.ts`) with
-  ids never derived from a label; a field holds one `{termId}` or the owner's literal text;
-  identity is exact (`resolveValue`), transliteration is search only. An edit that would
-  change an unedited value's meaning (`reclassifiedItems`) or take another term's spelling
-  is refused; only unused custom terms delete. Gusheh titles are not terms. Saves report
-  through `useAcknowledgedSaves` (`src/components/ui.tsx`).
-- A study source is the material an item is studied FROM (`src/domain/studySources.ts`).
-  Never deduplicate sources by title or share them across instruments; a shipped course's
-  source is keyed (`sourceKey`), once per instrument, and an unproven match is asked.
-- Seeds are honest starting points, never fabricated authority: Guitar = Classical Guitar
-  Shed; Setar = the named Mirza Abdollah radif pathway on a new install (an upgraded device
-  keeps its mixed pathway and is offered the named one); Tar = the Honarestan method and
-  Khonyagar, with the radif offered. `MIRZA_ABDOLLAH_RADIF` is one explicitly PARTIAL
-  definition. Forms is a lens in My repertoire, never a pathway. Per-gusheh `about` text
-  stays a generic prompt: never invent specifics; the teacher's account is the authority.
-  Copy is calm and self-paced: "Move on when it feels right, not by a deadline".
+- The practice item is the only unit of work; pathways are a view with derived progress (`itemStageState`). Never a parallel to-do list, "pieces" object or guitar-specific model. Pieces may have parts (`parentItemId`), never quotas.
+- The catalogue is reference data in code (`pathwaySeed.ts`): suggestions are reference aids, never canonical; keys stay stable per stage. `addFromCatalog` makes an honest "Not practised yet" item (`new`, zero stats) in one `set()`, never a second `addMaterial`.
+- Suggestions bind by stable reference id (`catalogReferenceId`, in `catalogRefs`), never by title or placement; one resolver, `resolveCatalogReference`, drives every surface (`docs/repertoire-experience.md`). Two items answering one suggestion are candidates, never picked; placing is not linking (`unlinkedInStage`). Unlink, Remove from pathway (`hiddenRefs`) and Hide never delete; hidden suggestions count for nothing; an empty stage is never complete; Delete practice item is the only destructive action. Undecided legacy evidence is settled or refused, never promoted or lost; every write passes `identityRefusal`, never overruling another item's legacy answer (`legacyClaimRefusal`); validity never reads an instrument's name.
+- Pathways, stages and routines are editable; deleting a stage or pathway only detaches its items and routines and clears a stale pin. A `currentStageId` pin wins while its stage exists; one route selector (`visiblePathways`/`primaryPathway`/`pathwayPosition`) serves every surface; never treat linear order as truth for Setar/Tar.
+- A routine belongs to an instrument, required for new ones, never invented for a legacy one; a bound segment item always matches it, checked by `retargetRoutineInstrument` on every create and save (an unresolved placement is cleared, never read as General), never by rewriting an instrument. A run freezes its segments, writes at most one block per bound item (`aggregateItemMinutes`, `not_logged`) and never completes a review or advances SM-2. Skip clamps to elapsed; "Short on time" (`segmentsForRun`) drops non-essentials; Finish always saves.
+- ONE practice clock at a time: block and routine start/resume each refuse while the other exists; the persist `merge` freezes both if it finds both, losing neither. Pages redirect to the running clock. Elapsed time is wall-clock (`locateClock`).
+- My repertoire is a derived lens (`discoverRepertoire`; views, URL state and grouping in `docs/repertoire-experience.md`): every work once; browsing never writes `sessionInstrumentId`; technique, exercise and study material stay out.
+- Dastgah/Avaz, Form and Composer share one vocabulary (`musicTerms.ts`), ids never derived from a label; legacy text is never rewritten, nothing reseeds; identity is exact (`resolveValue`), transliteration search only. An edit changing an unedited value's meaning (`reclassifiedItems`) or taking another term's spelling is refused; only unused custom terms delete; gusheh titles are not terms. Saves report through `useAcknowledgedSaves`; nothing closes before acknowledgement.
+- A study source is the material an item is studied FROM, never a person, pathway or lesson (`studySources.ts`); never deduplicate sources by title or share them across instruments. A shipped course's source is keyed (`sourceKey`) once per instrument (a second is refused, never silently un-keyed); an unproven match is asked.
+- Seeds are honest starting points, never fabricated authority (`pathwaySeed.ts`); an upgraded Setar device keeps its mixed pathway and is only offered the named radif. `MIRZA_ABDOLLAH_RADIF` is explicitly PARTIAL. Forms is a lens, never a pathway. Per-gusheh `about` text stays a generic prompt, never invented specifics; the teacher is the authority. Copy is calm and self-paced ("Move on when it feels right, not by a deadline").
 
 ## Lessons, the agenda and NAS references (r-large-files-stay-on-nas)
 
-- A `Lesson` is per instrument; `lesson.itemIds` is a link, never ownership. A
-  preparation's own class date is the ONE sanctioned deadline (`lessonUrgencyScore`),
-  never guilt-toned.
-- Small files are attachments owned by an item OR a lesson, decided by `ownerType` AND
-  `ownerId` together (`attachmentsOwnedBy`, `src/domain/itemFiles.ts`, used by every list,
-  count and delete). Attachment size policy (`attachmentPolicy`, `src/domain/files.ts`):
-  warn over 10 MB and for any video, refuse over 40 MB.
-- Class videos and score PDFs are NAS references (`Lesson.recordings`), never bytes in
-  IndexedDB, sync or a backup. `resolveRecording` (`src/domain/recordings.ts`) joins a
-  relative path to the per-device base and opens only on an explicit tap. Removing a
-  reference never touches the NAS file.
-- `lessonAgenda` (`src/domain/lessonAgenda.ts`) is the one home for "prepare this for
-  that class" (`preparation`) and "ask this at that class" (`question`, open -> asked with
-  an optional answer): one typed union, never independent booleans. A commitment's own
-  class date is its only deadline (`preparationDatesByItem`); a question changes no
-  practice priority, ever. An entry with no lesson is visibly unassigned, never guessed;
-  new ones default to the nearest upcoming lesson, date named. Questions are selected by
-  lesson id. Asked is explicit, reversible history. Deleting a lesson detaches its entries;
-  deleting an item removes its preparations and keeps its questions. Practising never
-  clears a question.
-- `migrateToV12` converts legacy `assignedForLesson`/`teacherQuestion` once, guessing
-  nothing and reading no clock; "represented" means the same text. `validateDB` refuses
-  invalid new intent, including a dangling live `lessonId` or `itemId`. Validate calendar
-  values by round-trip (`isValidISODate`, `isValidISODateTime`).
+- A `Lesson` is per instrument; `lesson.itemIds` links, never owns. A preparation's own class date is the ONE sanctioned deadline (`lessonUrgencyScore`, `preparationDatesByItem`), never guilt-toned.
+- Attachments belong to an item OR a lesson by `ownerType` AND `ownerId` (`attachmentsOwnedBy`, used by every list, count and delete); `attachmentPolicy` warns over 10 MB and for any video, refuses over 40 MB. A lesson's own files render once, in their own sections (`lessonFiles` is only the archive's).
+- Class videos and score PDFs are NAS references (`Lesson.recordings`), never bytes in IndexedDB, sync or a backup. `resolveRecording` joins a relative path to the per-device base and opens only on an explicit tap, never with a bad base. Removing a reference never touches the NAS file.
+- `lessonAgenda` is the one home for class preparations and questions (open -> asked, optional answer): one typed union, never independent booleans. A question never changes practice priority. An entry with no lesson is visibly unassigned, never guessed; new ones default to the nearest upcoming lesson, date named. Questions are selected by lesson id. Asked is explicit, reversible history that logs no practice and is never copied forward. Deleting a lesson detaches its entries; deleting an item removes its preparations, keeps its questions. Practising never clears a question; one raised at close is a new entry, never overwriting another.
+- `migrateToV12` converts legacy `assignedForLesson`/`teacherQuestion` once, guessing nothing, reading no clock; "represented" means the same text. `validateDB` refuses invalid new intent, including a dangling live `lessonId` or `itemId`. Calendar values are validated by round-trip (`isValidISODate`, `isValidISODateTime`), one check per file, never a shared import.
 
 ## Direction-aware text (r-direction-aware-text)
 
-- Built-in Setar/Tar data is authored in Farsi behind stable ascii ids (`slug`/`key` in
-  `src/domain/pathwaySeed.ts`); generic UI and Classical Guitar stay English.
-  Every search surface goes through `itemMatchesSearch` (Farsi-aware, `farsi.ts`).
-- Direction is resolved natively with `dir="auto"`, never by detecting script in
-  JavaScript or reordering text. Free-text fields get `unicode-bidi: plaintext` only via
-  `.input`/`.textarea` in `src/styles/global.css`.
-- Put `dir="auto"` on GROUPS (a title with its details) and fields, never bare on a title
-  element; the title must be the group's first strong text, so an English eyebrow stays
-  outside the group. Inside a group, always-English generated copy gets an inline
-  `dir="ltr"` isolate and an independently authored value its own `dir="auto"`. An isolate
-  is inline: `dir="ltr"`/`"rtl"` only on `span`/`bdi`. Never isolate the element a group
-  resolves from (`dir="auto"` skips descendants that carry a `dir`).
-- An instrument name is owner text: it resolves its own direction and is never pinned LTR
-  or fused into a template string. `<option>` text and `confirm()`/toast strings are out
-  of scope.
-- A content-directed block re-declares `textAlign: 'start'` on itself (WebKit inherits the
-  physical value), and so does a group under an ancestor pinning left/right. Active is a
-  deliberate case: its title group is start-aligned, so English moves from centred to left
-  there; that does not conflict with "English keeps its layout" elsewhere.
-- Lists of `dir="auto"` items drop the native marker (`role="list"`, ordinal as a flex
-  child). In `src/components/ClassQuestions.tsx` the guaranteed question, not the optional
-  title, anchors each item; in multi-line text the first line anchors and later lines
-  carry their own `dir="auto"`.
-- `src/components/direction.test.ts` enforces this and records the surface list and site
-  ledgers; a new site is added there visibly. Its title allowlist is currently EMPTY; an
-  exception goes there AND here.
-  Verify mixed-language surfaces with deliberately MISMATCHED languages, in both engines
-  (`tests/practice-information-layout.browser.test.ts`).
-- **Open gaps:** `src/components/QuickAdd.tsx`'s instrument picker renders the name with no
-  direction (the instrument-name check excludes `ItemForm.tsx`, `QuickAdd.tsx`,
-  `RoutineEdit.tsx`); `src/domain/insights.ts` fuses instrument names into one sentence
-  that `Today.tsx` renders under `dir="ltr"`. Each needs its own lane.
+- Built-in Setar/Tar data is Farsi behind stable ascii ids (`slug`/`key`); generic UI and Classical Guitar stay English. Every search goes through `itemMatchesSearch` (one wrapper over `farsi.ts`, never a second matcher).
+- Direction resolves natively with `dir="auto"`, never by detecting script in JavaScript or reordering text; `unicode-bidi: plaintext` only on `.input`/`.textarea`.
+- Put `dir="auto"` on GROUPS (a title with its details) and fields, never bare on a title element; the title is the group's first strong text (an English eyebrow stays outside). Inside a group, always-English generated copy gets an inline `dir="ltr"` isolate, an independently authored value its own `dir="auto"`. Isolates are inline: `dir="ltr"`/`"rtl"` only on `span`/`bdi`. Never isolate the element a group resolves from (`dir="auto"` skips descendants that carry a `dir`).
+- An instrument name is owner text: it resolves its own direction, never pinned LTR or fused into a template string. `<option>` text and `confirm()`/toast strings are out of scope.
+- A content-directed block re-declares `textAlign: 'start'` on itself (WebKit inherits the physical value), as does a group under an ancestor pinning left/right. Active is a deliberate case: its title group is start-aligned, so English moves from centred to left there; that does not conflict with "English keeps its layout" elsewhere.
+- `dir="auto"` list items drop the native marker (`role="list"`, ordinal as a flex child); in `ClassQuestions.tsx` the guaranteed question, not the optional title, anchors each item; in multi-line text the first line anchors, later lines carry `dir="auto"`.
+- `src/components/direction.test.ts` enforces this and records the surface list; a new site joins its ledgers visibly. It scans source, so write every `dir` literally, never computed. Its title allowlist is currently EMPTY; an exception goes there AND here. Verify mixed-language surfaces with deliberately MISMATCHED languages, in both engines (`tests/practice-information-layout.browser.test.ts`).
+- **Open gaps:** `src/components/QuickAdd.tsx`'s instrument picker renders the name with no direction (the instrument-name check excludes `ItemForm.tsx`, `QuickAdd.tsx`, `RoutineEdit.tsx`); `src/domain/insights.ts` fuses instrument names into one sentence that `Today.tsx` renders under `dir="ltr"`. Each needs its own lane.
 
 ## Material reaches you where you are
 
-- Browse screens (Repertoire, Lessons) seed their instrument filter from
-  `sessionInstrumentId` (`defaultInstrumentFilter`) and never write it; a narrowed Pathways
-  view hides General pathways too (`pathwaysForInstrumentFilter`); every door out keeps it.
-- An item's material is composed, never stored (`itemFiles`, `src/domain/itemFiles.ts`):
-  archive-scoped files, the item's own references, linked non-archive lessons' references
-  (deduplicated by path), then attachments. Only a local image renders inline; practice
-  shows material as one closed disclosure below the timer. An item with no lesson link has
-  no NAS material (gap: a schema change in its own lane).
-- Store a NAS reference relative to the configured base (`relativizeReference`); keep
-  anything else exactly as given. A base is an origin and a path only (`normalizeBaseUrl`
-  refuses credentials, query and fragment). Browse is offered only where it can work; a
-  missing NAS never blocks practising.
+- Browse screens (Repertoire, Lessons) seed their instrument filter from `sessionInstrumentId` (`defaultInstrumentFilter`), never write it, never remove the cross-instrument view; a narrowed Pathways view hides General pathways too (`pathwaysForInstrumentFilter`); every door out keeps the filter.
+- An item's material is composed, never stored (`itemFiles`, deduplicated by path); linked lessons contribute only when not archive-bound; references and attachments never merge or split across sections; ItemDetail's Files list only adds and removes. Only a local image renders inline. Practice shows material as one closed disclosure below the timer, never a panel, viewer or dashboard; no material or viewer concern may touch a recorded minute, the wake lock or a boundary announcement. An item with no lesson link has no NAS material (gap: a schema change in its own lane).
+- Store a NAS reference relative to the base (`relativizeReference`), anything else exactly as given. A base is an origin and a path: `normalizeBaseUrl` refuses credentials, query and fragment, never strips them. Browse is offered only where it works, never as a dead link or an error; a missing NAS never blocks practising.
 
 ## The Setar archive is a source: it describes, never testifies
 
-Runbook and detail: `docs/setar-archive.md`; app side `src/domain/sourceReconcile.ts`.
-
-- The grammar lives once, in the scanner; the app never parses a filename. The app
-  recomputes the index digest (`parseSourceIndex`), its decoder refuses a present but
-  wrong-typed value, and `checkSourceGraph` is the one grammar at every door. Fix the
-  grammar or the door, never with a guard in a component.
-- Archive evidence may establish repertoire membership, lesson provenance and source
-  material, never practice, a result, exposure, review completion or scheduling progress.
-  New imported pieces arrive resting. An imported class is history even when future-dated:
-  every upcoming-lesson test goes through `isUpcomingLesson`, never a bare date compare.
-- Exact bindings win; weak equivalences ask (Link / Create separately / Skip), never merge.
-  Decisions, Skips and deletions persist; one whose premise moved is refused as stale. The
-  commit re-plans, validates, waits for IndexedDB and never replaces the database.
-- Repair legacy paths exactly through the rename log or diagnose them; no fuzzy matching by
-  title, size or modification time. A refresh rewrites references only on lessons the
-  archive owns. **Open gap:** a legacy `setar-classes/` reference on a lesson the archive
-  does not own stays in the old namespace; it is the owner's to repoint.
-- One media base per device, naming the archive folder: no second archive-specific base,
-  no resolver fallback. The shared media root is derived from it
-  (`src/domain/mediaRoots.ts`), never guessed; each reference resolves against exactly one.
-- The NAS publisher's token is separate and repository-scoped, kept only in the NAS
-  runtime; the branch restriction is the script's, never called credential isolation. No
-  credential or archive root enters a committed file, app data, a log, sync or a backup.
+Runbook and detail: `docs/setar-archive.md`; app side `sourceReconcile.ts`.
+
+- The grammar lives once, in the scanner; the app never parses a filename. The scanner never follows a symlink, treats a failed read as empty, splits on token 0 or picks the largest file; a rename loop or fork is diagnosed, never walked. The app refuses a newer index version, recomputes the digest (`parseSourceIndex`), refuses a present but wrong-typed value, and `checkSourceGraph` is the one grammar at every door. Fix the grammar or the door, never with a guard in a component.
+- Archive evidence may establish repertoire membership, lesson provenance and source material, never practice, a result, exposure, review completion or scheduling progress. The owner's own practice takes are never a resource; a roster is the registry's, never inferred from files; an unnamed demo never spreads over a guessed set. An imported class is history even when future-dated: upcoming-lesson tests go through `isUpcomingLesson`, never a bare date compare. Imported pieces arrive resting.
+- Exact bindings win; weak equivalences ask (Link / Create separately / Skip), never merge; `aliases_seen` is search only, never identity; a built-in `catalogKey` never equals a canonical key. Decisions, Skips and deletions persist; one whose premise moved is refused as stale; an unanswered offer writes nothing. The commit re-plans, validates, waits for IndexedDB, never replaces the database or touches a blob. Moving an archive-bound item to another instrument is refused.
+- Repair legacy paths exactly through the rename log or diagnose them; no fuzzy matching by title, size or modification time; `not-described` never means gone; two rows naming one file both survive. A refresh rewrites references only on lessons the archive owns. **Open gap:** a legacy `setar-classes/` reference on a lesson the archive does not own stays in the old namespace; it is the owner's to repoint.
+- One media base per device, naming the archive folder: no second archive-specific base, no resolver fallback. The shared media root is derived from it (`src/domain/mediaRoots.ts`), never guessed; each reference resolves against exactly one; an undecodable base is unrecognised, never thrown. An unreachable NAS is never called absent (`describeArchiveAccess`).
+- The NAS publisher's token is separate and repository-scoped (Contents write, no workflow or admin scope), kept only in the NAS runtime; the branch restriction is the script's, never called credential isolation. No credential or archive root enters a committed file, app data, a log, sync or a backup.
 
 ## Courses are reference data in code
 
 Runbooks: `docs/cgs-course.md`, `docs/khonyagar-course.md`.
 
-- A course never reuses the Setar archive machinery: no persisted graph, no inbound door,
-  no schema change. Its scanner is the only grammar; generated data
-  (`src/domain/courseData.ts`, `src/domain/khonyagarData.ts`) is never edited by hand.
-- Catalogue keys are added, never renamed (`src/domain/pathways.test.ts` holds them); a
-  section never moves stage; a work key never changes meaning.
-- One musical work is one repertoire item. Identity is DECLARED (`courseWorkKey`,
-  `carriedCourseWorkItem`), never matched by name. Material is composed from the catalogue
-  (deduplicated by path); guidance is copied into notes once and never overwritten.
-- Only the owner adds levels or shipped defaults: offered by deterministic id
-  (`offeredCourseLevels`, `offeredDefaultPathways`), added only when chosen;
-  `reseedDefaultPathways` never adds a stage to an existing pathway.
-- Routine minutes scale proportionally (`fitRoutineToMinutes`); essentials-only is a
-  separate choice and drops are named honestly (`describeFitDrop`). Khonyagar ships no
-  routine; nothing may claim the Session Plan follows its guide. A Khonyagar item carries
-  no Persian identity inferred from a title.
+- A course never reuses the Setar archive machinery: no persisted graph, no inbound door, no schema change. Its scanner is the only grammar, never imported by or reachable from runtime; what it cannot read (a BPM, a section) is absent with a diagnostic, never guessed; it refuses a duplicate key. Generated data (`courseData.ts`, `khonyagarData.ts`) is never hand-edited; legacy key aliases live in hand-written `courseSeed.ts` (`COURSE_LEGACY_KEYS`). Stored paths are NFC.
+- Catalogue keys are added, never renamed (`pathways.test.ts`); a section never moves stage; a work key never changes meaning; a shipped work row is never removed (literal ledgers, never derived from the data). An ordinary key matches per stage (`stageId`+`catalogKey`); only a declared work key crosses stages.
+- One musical work is one repertoire item. Identity is DECLARED (`courseWorkKey`, `carriedCourseWorkItem`), never matched by name, ZWNJ or space; only an entry naming one work becomes repertoire, never a drill, an aid or two works. Material is composed from the catalogue (deduplicated by path, never basename) and opened where it lives; contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list. Guidance is copied into notes once; regeneration never rewrites notes or stored fields.
+- Only the owner adds levels or shipped defaults, offered by deterministic id (`offeredCourseLevels`, `offeredDefaultPathways`), added only when chosen, never on load, hydration, import or sync; `reseedDefaultPathways` never adds a stage to an existing pathway; `seedInstrumentIds` never reads Setar or Guitar as Tar.
+- Routine fitting (`fitRoutineToMinutes`) never reuses `allocateMinutes` and names its drops honestly (`describeFitDrop`). Khonyagar ships no routine and creates no `Lesson`; nothing may claim the Session Plan follows its guide. A Khonyagar item carries no Persian identity inferred from a title.
 
 ## Review scheduling stays explainable (r-explainable-scheduling)
 
-Numbers: `docs/scheduling-evidence.md`. One pure decision, `decideReview`
-(`src/domain/scheduling.ts`); preview, write and screen render it.
-
-- Practice is exposure; only eligible retention evidence (a stable result, due, not
-  already advanced today via `srLastProgressDay`) advances spacing. `same` is not failure.
-  Only `worse` may bring an automatic date forward, never later. A future date the owner
-  owns (or of unknown provenance) is protected until due. A keep completes nothing.
-- An open date editor is bound to the item and date it was opened for
-  (`reviewDateDraftFor`). "Schedule again", "Use automatic scheduling"
-  (`transferToAutomaticReview`, keeps the date) and "Review today" are administration and
-  record no practice; ambiguous schedules are refused, never guessed. Never describe a
-  retained date as a new calculation.
-- Bounded params (`SchedulingParams`, `clampSchedulingParams`) are threaded wherever a date
-  is shown or saved. The published priority formula, `importance*2 + difficulty +
-  fragility + overdue + neglected + lessonUrgency - exposurePenalty`, is what the code
-  computes (`src/domain/scoring.test.ts`) and what Settings shows with live values. Keep it
-  deterministic, never an opaque model. Keep status enum keys stable; change only their
-  labels (`src/domain/labels.ts`).
+Numbers: `docs/scheduling-evidence.md`. One pure decision, `decideReview` (`scheduling.ts`), which preview, write and screen render.
+
+- Practice is exposure; only eligible retention evidence (a stable result, due, not yet advanced today: `srLastProgressDay`) advances spacing. `same` is not failure; only `worse` may bring an automatic date forward, never later; nothing else reads as failure. A future date the owner owns (or of unknown provenance) is protected until due, and manual mode with no new date keeps it. A keep completes nothing.
+- An open date editor is bound to its item and date (`reviewDateDraftFor`, reconciled each render, never from an effect). "Schedule again", "Use automatic scheduling" (`transferToAutomaticReview`, keeps the date) and "Review today" (day read at the tap) are administration and record no practice; an ordinary item save never releases a protected date; ambiguous schedules are refused, never guessed. Never describe a retained date as a new calculation.
+- Bounded params (`SchedulingParams`, `clampSchedulingParams`) are threaded wherever a date is shown or saved. The published priority formula, `importance*2 + difficulty + fragility + overdue + neglected + lessonUrgency - exposurePenalty`, is what the code computes (`src/domain/scoring.test.ts`) and Settings shows with live values. Keep it deterministic, never an opaque model. Keep status enum keys stable; change only labels (`labels.ts`).
 
 ## The Session Plan is a view over real blocks
 
-`src/domain/plan.ts` reuses the same `scoreItems` priorities (numbers:
-`docs/scheduling-evidence.md`). Minutes never exceed the budget; a budget outside 5-120 is
-rejected, never clamped (`validateBudgetMinutes`); one `isProactiveCandidate` policy and one
-`candidatePool` serve build and swap; resting material never surfaces; warm-up is a role
-for familiar easy items; a diversity preference stays subordinate to real needs. A plan is
-stale when `rev` or the local day moves, and Start rechecks the day. It runs real blocks,
-revalidating each segment's item at start; skipping logs nothing. `activePlan` is
-ephemeral and never synced.
+`plan.ts` reuses the same `scoreItems` priorities, never a second ranking: no scores, no "optimal" claims, its evidence never dressed up as an optimum. Minutes never exceed the budget; a budget outside 5-120 is rejected, never clamped (`validateBudgetMinutes`); one `isProactiveCandidate` policy and one `candidatePool` serve build and swap; resting material never surfaces, even by fallback; warm-up is a role for familiar easy items, never a due review or class commitment; a diversity preference stays subordinate to real needs. A plan is stale when `rev` or the local day moves; Start rechecks the day and refuses visibly. It runs real blocks, revalidating each segment's item at start; skipping logs nothing.
 
 ## Device, sync and infrastructure
 
-- MacBook-first, iPhone companion, one installed PWA served by GitHub Pages, deployed only
-  behind lint, tests and build (`.github/workflows/deploy.yml`). **Owner decision
-  2026-07-11:** the repo is public.
-- **Sync** (r-no-silent-data-loss): whole snapshots to the owner's GitHub data repo,
-  committed atomically (`src/store/syncEngine.ts`); decisions by content hash
-  (`decideSync`, `hashState`), never timestamps. Both-changed is an explicit two-button
-  conflict and both copies are preserved before any replace. Never a silent merge or
-  per-field magic. Manual export/import stays the fallback.
-- **Secrets** (r-secrets-stay-on-device): the GitHub token (scoped to the one data repo)
-  and NAS base URL live only in this browser's localStorage, never in exports, backups or
-  sync.
-- Keep storage roles distinct: IndexedDB (truth), GitHub sync (transport), NAS backup
-  (independent export), NAS recordings (media).
-- Repository tools change only what they can prove they wrote (a folder they created, a
-  marker's claims, a scanner's own output; a path's name proves nothing), never delete,
-  never write through a link and never exit 0 without running. `docs/nas-topology.md` maps
-  what each path reaches; `scripts/nas-mirror.mjs` is an optional HTTPS mirror for an
-  unmerged build, never the primary.
-- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`; installed standalone
-  `100vh`, owner-passed on iOS 27). Diagnose keyboard drift from traces, never guesses
-  (`src/components/viewport.ts`). Five equal nav tabs; Today owns Start. The service worker
-  prompts (in-app Reload), never a reinstall. The build ships a CSP of self plus
-  api.github.com only.
-- Canonical names: practice item, Study source, Pathways / My repertoire / Practice list,
-  "Add practice item", "Based on / reference", "Connect it (optional)".
+- MacBook-first, iPhone companion, one installed PWA on GitHub Pages, deployed only behind lint, tests and build (`.github/workflows/deploy.yml`). **Owner decision 2026-07-11:** the repo is public.
+- **Sync** (r-no-silent-data-loss): whole snapshots to the owner's GitHub data repo, committed atomically (`syncEngine.ts`); decisions by content hash (`decideSync`, `hashState`), never timestamps. Both-changed is an explicit two-button conflict ("newest" is a hint, never an auto-winner), both copies preserved before any replace. Never a silent merge or per-field magic. Manual export/import stays the fallback.
+- **Secrets** (r-secrets-stay-on-device): the GitHub token (scoped to the one data repo) and NAS base URL live only in this browser's localStorage, never in exports, backups or sync.
+- Keep storage roles distinct: IndexedDB (truth), GitHub sync (transport, never the only backup), NAS backup (independent export), NAS recordings (media).
+- Repository tools change only what they can prove they wrote (a folder they created, a marker's claims, a scanner's own output; a path's name proves nothing), never delete, never write through a link and never exit 0 without running. `docs/nas-topology.md` maps what each path reaches; `scripts/nas-mirror.mjs` is an optional HTTPS mirror for an unmerged build, never the primary.
+- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`, never `height: 100%`; installed standalone `100vh`, owner-passed on iOS 27). `viewport.ts` judges keyboard drift by geometry, never focus, never touching `<main>`'s scroll; diagnose from traces, never guesses. Five equal nav tabs; Today owns Start; a catalogue row shows its status once. The service worker prompts (in-app Reload), never a reinstall. The build ships a CSP of self plus api.github.com only.
+- Canonical names: practice item, Study source, Pathways / My repertoire / Practice list, "Add practice item", "Based on / reference", "Connect it (optional)"; links never duplicate the item.
 
 ## Architecture and tests
 
-- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now`
-  (r-pure-tested-domain). Recommendations carry a one-sentence reason from the numbers that
-  ranked them. Only the store mutates app data; attachment blobs live in
-  `src/store/attachments.ts`. One file per route under `src/pages/`; pure helpers go in
-  non-component modules.
-- Every inbound database (rehydration via both persist `migrate` and `merge`, import, sync
-  pull, Keep remote, archive restore, cold-start recovery) runs `validateDB`
-  (`src/domain/io.ts`) and its migrations; schema changes bump `SCHEMA_VERSION` (now 15). A
-  refused hydration leaves memory and disk untouched and offers recovery only for invalid,
-  never too-new, data.
-- Colour contrast is checked by `src/styles/contrast.test.ts`; change a light token in
-  both of its blocks.
-- `npm test` must pass; update tests with any scoring or scheduling change. Browser
-  journeys are Vitest tests driving Playwright as a library, each with its own dev server
-  and browser context and no live GitHub or NAS (GitHub is faked at the `fetch` boundary).
-  They drive rendered controls by role and name, never a debug hook or a source regex, and
-  fail, never skip, when a browser is missing (`npx playwright install chromium webkit`).
-  WebKit cannot store a Blob in IndexedDB under automation, so its journeys seed
-  state-only. Harness rules (`tests/practiceBrowser.ts`; read `DECISIONS.md` 2026-09-29
-  first): keep every page error, never `goTo` the route you are on, `connectSync` waits for
-  the enabled Sync now, a private Vite cache per server, the fake GitHub remembers `main`
-  after bootstrap, and a cold-start timeout is a question, never a number to raise.
-- Roadmap items that fit (audio notes, CSV export, reminders, teacher PDF) are allowed;
-  contradicting a do-not needs an explicit owner decision recorded here.
+- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now` (r-pure-tested-domain). Recommendations carry a one-sentence reason from the numbers that ranked them. Only the store (blobs: `attachments.ts`) mutates app data; components never touch IndexedDB; a patch tells an omitted field from an empty one by key presence, never `??`. One file per route under `src/pages/`; pure helpers go in non-component modules.
+- Every inbound database (both persist `migrate` and `merge`, import, sync pull, Keep remote, archive restore, cold-start recovery) runs `validateDB` (`io.ts`) and its migrations, which read no clock and guess nothing; a new collection goes in its `ARRAY_KEYS` and returned object; schema changes bump `SCHEMA_VERSION` (now 15). A refused hydration leaves memory and disk untouched: its throw is never caught, `hydrated` never forced open, nothing set through `setState`; recovery (`importFullBackup`, never a second importer) is offered only for invalid, never too-new, data.
+- Colour contrast is checked by `contrast.test.ts`; change a light token in both of its blocks, and only one that fails a listed pair.
+- `npm test` must pass; update tests with any scoring or scheduling change. Browser journeys are Vitest tests using Playwright as a library (own dev server and context, no live GitHub or NAS; GitHub faked at `fetch`), driving controls by role and name, never a debug hook or source regex; a missing browser fails them, never skips (`npx playwright install chromium webkit`). WebKit cannot store a Blob in IndexedDB under automation, so its journeys seed state-only. Harness (`tests/practiceBrowser.ts`; read `DECISIONS.md` 2026-09-29 first): keep every page error, never `goTo` the current route, `connectSync` waits for an enabled Sync now, one private Vite cache per server, the fake GitHub remembers `main` after bootstrap, a cold-start timeout is a question, never a number to raise.
+- Roadmap items that fit (audio notes, CSV export, reminders, teacher PDF) are allowed; contradicting a do-not needs an explicit owner decision recorded here.
diff --git a/DECISIONS.md b/DECISIONS.md
index c2d1c38079a30f0605cc5169f09de0f5307eaa72..598f5a1f783317bb6174ebe3994b6227b7beb502 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -14,8 +14,8 @@ lane's own baseline, not a ceiling: it arrived on 2026-09-27 with the file at ~2
 grandfathered the debt and let a lane regrow up to its baseline; `prismatica doctor` only warns;
 and a direct push to main is never checked. Nothing was missing or misconfigured. Landing under
 32 KiB turns the same ratchet into a ceiling for every later lane, and `tests/agent-context.test.ts`
-puts the same cap (plus the core loop, the hard do-nots, every `r-*` id and every named path) on
-`npm test`, which deploy.yml runs on every push to main.
+puts the same cap (plus the core loop, the hard do-nots, every `r-*` id, every restored
+prohibition and every named path) on `npm test`, which deploy.yml runs on every push to main.
 
 **Authoring rule.** AGENTS.md holds current rules only, each once, as an imperative plus where it
 is enforced; a lane edits it only when a current rule changes. The why goes here, dated;
@@ -23,8 +23,16 @@ mechanism goes to the subsystem's `docs/*.md` or the enforcing code's comment. R
 counterexamples, measurements and rejected attempts were deleted, not relocated: the full text is
 `git show 56789a8:AGENTS.md`. No rule changed meaning and every dated owner decision kept its force.
 
-**Disposition.** Lines are 56789a8's AGENTS.md. "A:" is a heading in the new AGENTS.md; every row
-also dropped its review narrative, which the dated entries below already record.
+**Prohibitions stay loaded.** The first pass left some agent-facing prohibitions only in a runbook
+or a code comment, and review rejected that: a session that never opens the doc never sees the
+ban. A sweep of all 25 baseline sections restored every one, and `tests/agent-context.test.ts`
+anchors the 83 restored phrases. The cost is headroom: the Claude profile is now 31,469 of
+32,768 bytes (about 1.3 KiB free, down from 2 KiB), with each rule on one line. The cap still
+holds in `npm test`; the next lane makes room by condensing in place.
+
+**Disposition.** Lines are 56789a8's AGENTS.md. "A:" is a heading in the new AGENTS.md, which
+holds every agent-facing prohibition of that section; the other homes hold only mechanism. Every
+row also dropped its review narrative, which the dated entries below already record.
 
 | Baseline section (lines) | Rules now live | Dropped as stale |
 | --- | --- | --- |
@@ -38,16 +46,16 @@ also dropped its review narrative, which the dated entries below already record.
 | Practice totals (425-455) | A: Practice totals; `selectors.ts` comments (balance denominator) | - |
 | Hands-free practice (456-573) | A: Hands-free practice; `screenAwake.ts`, `useScreenAwake.ts` (audio, gesture unlock), `practiceSignal.ts`; secure-context table in docs/setar-archive.md §5 | - |
 | Hard "do nots" (574-603) | A: Hard do-nots; A: Device, sync (Sync); transport steps in `syncEngine.ts`, `gitRemote.ts` | - |
-| The Pathway is a trust anchor (604-811) | A: Pathways, routines and repertoire; docs/repertoire-experience.md (reader/writer matrix, source kinds); `routines.ts`, `useStore.ts`, `RoutineRunner.tsx`, `musicTerms.ts`, `pathwaySeed.ts` comments | - |
+| The Pathway is a trust anchor (604-811) | A: Pathways, routines and repertoire; docs/repertoire-experience.md (reader/writer matrix, source kinds, the three views, URL state, grouping); seed list in `pathwaySeed.ts`; `routines.ts`, `useStore.ts`, `RoutineRunner.tsx`, `musicTerms.ts`, `pathwaySeed.ts` comments | - |
 | Lessons and the deadline exception (812-846) | A: Lessons, the agenda and NAS references; `recordings.ts` (resolver); `Lessons.tsx` (class number, video-first order) | The one-tap Setar class import and `npm run scan:setar` regenerating `SETAR_CLASS_SESSIONS`: replaced by Refresh Setar archive; `setarClasses.ts` is a frozen ledger (docs/setar-archive.md §6) |
 | Lesson commitments and questions, v12 (847-998) | A: Lessons, the agenda and NAS references; A: Architecture and tests (hydration); `lessonAgenda.ts`, `migrations.ts`, `useStore.ts`, `App.tsx` comments; `ClassQuestions.tsx` (exports, refused clipboard) | - |
-| Persian text, direction-aware (999-1636) | A: Direction-aware text; A: Architecture and tests (WebKit harness); `direction.test.ts` ledgers and comments (headings, lone titles, label-first rows, the two `UNEXEMPTED_PHRASE_ALLOWLIST` exceptions with reasons); `farsi.ts`; `tests/practiceBrowser.ts` | Eleven findings' narratives and the scanner's own bug history (fixed in `direction.test.ts`) |
-| Everything the app already knows (1637-1747) | A: Material reaches you where you are; `itemFiles.ts`, `recordings.ts`, `selectors.ts` comments; Files list in `ItemDetail.tsx` | - |
-| The Setar archive is a SOURCE (1748-2225) | A: The Setar archive is a source; docs/setar-archive.md §2, §5, §6; `scan-setar-classes.mjs`, `sourceArchive.ts`, `sourceReconcile.ts` comments | - |
-| A COURSE is reference data in code (2226-2638) | A: Courses are reference data in code; docs/cgs-course.md §2-§6; `courseSeed.ts`, `pathwaySeed.ts` (offered defaults), `routines.ts` (`fitRoutineToMinutes`) comments | - |
+| Persian text, direction-aware (999-1636) | A: Direction-aware text (incl. `dir` written literally, never computed); A: Architecture and tests (WebKit harness); `direction.test.ts` ledgers and comments (headings, lone titles, label-first rows, the two `UNEXEMPTED_PHRASE_ALLOWLIST` exceptions with reasons); `farsi.ts`; `tests/practiceBrowser.ts` | Eleven findings' narratives and the scanner's own bug history (fixed in `direction.test.ts`) |
+| Everything the app already knows (1637-1747) | A: Material reaches you where you are (incl. never a panel, viewer or dashboard; nothing touches a minute, the wake lock or an announcement); composition order in `itemFiles.ts`; `recordings.ts`, `selectors.ts` comments; Files list in `ItemDetail.tsx` | - |
+| The Setar archive is a SOURCE (1748-2225) | A: The Setar archive is a source (incl. the scanner's symlink, read-failure and rename-loop bans, roster, alias and blob bans); docs/setar-archive.md §2, §5, §6; `scan-setar-classes.mjs`, `sourceArchive.ts`, `sourceReconcile.ts` comments | - |
+| A COURSE is reference data in code (2226-2638) | A: Courses are reference data in code (incl. scanner never reachable from runtime; contrast cards never a viewer, flashcard player or deck list); docs/cgs-course.md §2-§6 (routine proportions §4); `courseSeed.ts`, `pathwaySeed.ts` (offered defaults), `routines.ts` (`fitRoutineToMinutes`) comments | - |
 | The Khonyagar Tar course (2639-2717) | A: Courses are reference data in code; docs/khonyagar-course.md | - |
 | Review scheduling (2718-2881) | A: Review scheduling stays explainable; docs/scheduling-evidence.md §6-§7; `scheduling.ts`, `format.ts` comments | - |
-| The Session Plan (2882-2994) | A: The Session Plan is a view over real blocks; docs/scheduling-evidence.md §1-§5; `plan.ts`, `SessionPlan.tsx` (day staleness) | - |
+| The Session Plan (2882-2994) | A: The Session Plan is a view over real blocks (incl. no "optimal" claims); docs/scheduling-evidence.md §1-§5; `plan.ts`, `SessionPlan.tsx` (day staleness) | - |
 | Device & infrastructure (2995-3072) | A: Device, sync and infrastructure; docs/nas-topology.md; `viewport.ts`; `vite.config.ts` (CSP, base, prompt-mode worker, build stamp); `Layout.tsx` (equal tabs, scroll to top, per-route widths with `global.css`, which also holds the fonts); `App.tsx` (sync triggers); `Settings.tsx` (sync status, restore); catalogue row grid in `global.css` (`.stage-unit`) with its one status line in `StageDetail.tsx`, detach under Connected to in `ItemDetail.tsx` | - |
 | Colour is checked by a test (3073-3092) | A: Architecture and tests; `contrast.test.ts` comments | - |
 | Architecture rules (3093-3138) | A: Architecture and tests; per-version detail in `migrations.ts` | - |
diff --git a/tests/agent-context.test.ts b/tests/agent-context.test.ts
index bf38a26612c90543cc2afc6a8dfe2fe241a26276..2039b7f20703ee0415c2757d252a3f8630c5caae 100644
--- a/tests/agent-context.test.ts
+++ b/tests/agent-context.test.ts
@@ -61,16 +61,42 @@ const APP_RULE_IDS = [
 
 const PATH_ROOTS = ['src/', 'tests/', 'scripts/', 'docs/', 'public/', '.github/'];
 
-/** Repository paths named in code spans (any whitespace-separated token) or as link targets. */
+// A code span (or fence) is a backtick run closed by a run of the same length.
+const CODE_SPAN = /(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g;
+// A link destination is `<...>` or a run without spaces; a title may follow it.
+const DESTINATION = String.raw`(<[^>\n]*>|[^\s<>()]+)`;
+const LINK_TARGETS = [
+  new RegExp(String.raw`\]\(\s*${DESTINATION}`, 'g'), // [text](dest "title"), ![alt](dest)
+  new RegExp(String.raw`^ {0,3}\[[^\]\n]+\]:\s*${DESTINATION}`, 'gm'), // [label]: dest "title"
+  /\b(?:href|src)\s*=\s*["']([^"']+)["']/g, // <a href="dest">, <img src="dest">
+];
+
+/**
+ * Repository paths AGENTS.md names: every whitespace-separated token of a code span or
+ * fence, and every link destination (inline, angle-bracketed, titled, a reference
+ * definition, or an HTML href/src). Anchors, queries, line suffixes and trailing
+ * punctuation are stripped BEFORE globs are skipped. A backtick left unpaired throws:
+ * it would shift every span after it, so the text cannot be read reliably.
+ */
 function namedPaths(text: string): string[] {
+  const spans = [...text.matchAll(CODE_SPAN)];
+  const prose = text.replace(CODE_SPAN, ' ');
+  if (prose.includes('`')) throw new Error(`unpaired backtick near: ${prose.slice(prose.indexOf('`'), prose.indexOf('`') + 60)}`);
   const tokens = [
-    ...[...text.matchAll(/`([^`\n]+)`/g)].flatMap(([, span]) => span.split(/\s+/)),
-    ...[...text.matchAll(/\]\(([^)\s]+)\)/g)].map(([, target]) => target),
+    ...spans.flatMap(([, , span]) => span.split(/\s+/)),
+    ...LINK_TARGETS.flatMap((re) => [...prose.matchAll(re)].map(([, target]) => target)),
   ];
   const paths = tokens
-    .map((t) => t.replace(/^\.\//, ''))
-    .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t))
-    .map((t) => t.replace(/[#?].*$/, '').replace(/:L?\d+(-L?\d+)?$/, '').replace(/[),.;:]+$/, ''));
+    .map((t) => t.replace(/^[<('"]+|[>'"]+$/g, ''))
+    .map((t) => {
+      try {
+        return decodeURI(t);
+      } catch {
+        return t;
+      }
+    })
+    .map((t) => t.replace(/^\.?\//, '').replace(/[#?].*$/, '').replace(/[),.;:]+$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''))
+    .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t));
   return [...new Set(paths)];
 }
 
@@ -92,3 +118,140 @@ it('every repository path AGENTS.md names exists', () => {
   expect(paths.length).toBeGreaterThan(0);
   expect(paths.filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
 });
+
+// The proof route for namedPaths: one Markdown form per row, each expectation written
+// by hand from what CommonMark says the text names, not from running namedPaths.
+// Bare prose paths are out of scope by the contract (backticks or link targets only).
+it('namedPaths reads a repository path out of every Markdown form that can name one', () => {
+  const cases: [string, string[]][] = [
+    ['`docs/a.md`', ['docs/a.md']],
+    ['see `src/x.ts and tests/y.ts` here', ['src/x.ts', 'tests/y.ts']],
+    ['``docs/a.md``', ['docs/a.md']],
+    ['```\nscripts/run.mjs --dry\n```', ['scripts/run.mjs']],
+    ['`src/x.ts:12`, `src/y.ts:L10-L20`.', ['src/x.ts', 'src/y.ts']],
+    ['(`.github/workflows/deploy.yml`).', ['.github/workflows/deploy.yml']],
+    ['`docs/a.md#part[0]`', ['docs/a.md']],
+    ['[t](docs/a.md)', ['docs/a.md']],
+    ['[t](docs/a.md "Guide")', ['docs/a.md']],
+    ["[t](docs/a.md 'Guide')", ['docs/a.md']],
+    ['[t](docs/a.md (Guide))', ['docs/a.md']],
+    ['[t](<docs/a b.md>)', ['docs/a b.md']],
+    ['[t](<docs/a.md> "Guide")', ['docs/a.md']],
+    ['[t]( ./docs/a.md#part )', ['docs/a.md']],
+    ['[t](docs/a%20b.md?plain=1)', ['docs/a b.md']],
+    ['![alt](public/icon.png)', ['public/icon.png']],
+    ['[ref]: docs/a.md "Guide"', ['docs/a.md']],
+    ['text\n   [ref]: <docs/a.md>', ['docs/a.md']],
+    ['<a href="docs/a.md">a</a> <img src="public/i.png">', ['docs/a.md', 'public/i.png']],
+    ['`docs/a.md` and [t](docs/a.md)', ['docs/a.md']],
+    ['`src/**/*.ts` `src/{a,b}.ts` `src/[id].ts`', []],
+    ['`README.md` [x](https://example.com/src/a.ts) `importFullBackup(text, intent)`', []],
+    ['`[x](docs/a.md)`', []],
+  ];
+  for (const [markdown, expected] of cases) expect(namedPaths(markdown), markdown).toEqual(expected);
+  expect(() => namedPaths('`docs/a.md` and a stray ` tick')).toThrow(/unpaired backtick/);
+});
+
+// Every agent-facing prohibition the 2026-10-01 rework restored from the baseline
+// (56789a8) sweep, one short exact phrase each. Condensing may reword around them; deleting
+// one fails here. A rule that genuinely changes edits its phrase here in the same lane.
+const RESTORED_PROHIBITIONS = [
+  // Practice information, closing a block, unfinished practice, totals, hands-free
+  'read through a ref, never a closure',
+  'only a typed date is an override (`closeOverrideDate`)',
+  'never installing before `replaceAllBlobs`',
+  '`decidedFromRev` is passed in (sync captures it with its db), never read from module scope',
+  'seeded with current presence',
+  '`active`, `activeRoutine` and `activePlan` are ephemeral, never in `PracticeDB`',
+  'no goal, filling bar or judging colour',
+  'to the boundaries passed, never by one',
+  'routine boundaries are `segmentBoundaries`, never a second sum',
+  'a routine boundary shows for a window, never one render',
+  // Pathways, routines and repertoire
+  'never a second `addMaterial`',
+  'hidden suggestions count for nothing; an empty stage is never complete',
+  "never overruling another item's legacy answer (`legacyClaimRefusal`)",
+  'an unresolved placement is cleared, never read as General',
+  'never completes a review or advances SM-2',
+  'legacy text is never rewritten, nothing reseeds',
+  'nothing closes before acknowledgement',
+  'never a person, pathway or lesson',
+  'a second is refused, never silently un-keyed',
+  // Lessons and the agenda
+  "`lessonFiles` is only the archive's",
+  'never with a bad base',
+  'logs no practice and is never copied forward',
+  'one raised at close is a new entry, never overwriting another',
+  'one check per file, never a shared import',
+  // Direction-aware text
+  'never a second matcher',
+  'write every `dir` literally, never computed',
+  // Material
+  'never remove the cross-instrument view',
+  'references and attachments never merge or split across sections',
+  "ItemDetail's Files list only adds and removes",
+  'never a panel, viewer or dashboard; no material or viewer concern may touch a recorded minute, the wake lock or a boundary announcement',
+  'never strips them',
+  'never as a dead link or an error',
+  // The Setar archive
+  'The scanner never follows a symlink, treats a failed read as empty, splits on token 0 or picks the largest file',
+  'a rename loop or fork is diagnosed, never walked',
+  'The app refuses a newer index version',
+  "The owner's own practice takes are never a resource",
+  "a roster is the registry's, never inferred from files; an unnamed demo never spreads over a guessed set",
+  '`aliases_seen` is search only, never identity',
+  'a built-in `catalogKey` never equals a canonical key',
+  'an unanswered offer writes nothing',
+  'never replaces the database or touches a blob',
+  'Moving an archive-bound item to another instrument is refused',
+  '`not-described` never means gone; two rows naming one file both survive',
+  'an undecodable base is unrecognised, never thrown',
+  'An unreachable NAS is never called absent',
+  'no workflow or admin scope',
+  // Courses
+  'never imported by or reachable from runtime',
+  'absent with a diagnostic, never guessed; it refuses a duplicate key',
+  'legacy key aliases live in hand-written `courseSeed.ts`',
+  'Stored paths are NFC',
+  'a shipped work row is never removed (literal ledgers, never derived from the data)',
+  'only a declared work key crosses stages',
+  'never matched by name, ZWNJ or space',
+  'only an entry naming one work becomes repertoire, never a drill, an aid or two works',
+  'never basename',
+  'contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list',
+  'regeneration never rewrites notes or stored fields',
+  'never on load, hydration, import or sync',
+  '`seedInstrumentIds` never reads Setar or Guitar as Tar',
+  'never reuses `allocateMinutes`',
+  'creates no `Lesson`',
+  // Review scheduling and the Session Plan
+  'nothing else reads as failure',
+  'manual mode with no new date keeps it',
+  'reconciled each render, never from an effect',
+  'day read at the tap',
+  'an ordinary item save never releases a protected date',
+  'no scores, no "optimal" claims, its evidence never dressed up as an optimum',
+  'resting material never surfaces, even by fallback',
+  'never a due review or class commitment',
+  'Start rechecks the day and refuses visibly',
+  // Device, sync, architecture and tests
+  '"newest" is a hint, never an auto-winner',
+  'never the only backup',
+  'never `height: 100%`',
+  "by geometry, never focus, never touching `<main>`'s scroll",
+  'a catalogue row shows its status once',
+  'links never duplicate the item',
+  'components never touch IndexedDB',
+  'by key presence, never `??`',
+  'which read no clock and guess nothing',
+  'a new collection goes in its `ARRAY_KEYS` and returned object',
+  'its throw is never caught, `hydrated` never forced open, nothing set through `setState`',
+  'never a second importer',
+  'only one that fails a listed pair',
+];
+
+it('AGENTS.md keeps every agent-facing prohibition restored from the baseline sweep', () => {
+  const text = readFileSync(AGENTS, 'utf8').replace(/\s+/g, ' ');
+  expect(new Set(RESTORED_PROHIBITIONS).size).toBe(RESTORED_PROHIBITIONS.length);
+  expect(RESTORED_PROHIBITIONS.filter((phrase) => !text.includes(phrase))).toEqual([]);
+});
````

**Paths the rework touched:**

- `AGENTS.md`
- `DECISIONS.md`
- `tests/agent-context.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
0be46c3 Rework: keep every agent-facing prohibition in AGENTS.md; read every Markdown path form

Family always-loaded-prohibition-preservation
Invariant: any never / no / must-not that limits what a later change may build, write,
store, sync, import or match lives in AGENTS.md itself, even where a runbook or a code
comment also states it.
Sweep: every line of all 25 sections of 56789a8:AGENTS.md (3,186 lines) checked against the
rulebook. 83 prohibitions were missing; each is restored, condensed in place, in its own
section: practice information, closing a block, unfinished practice, totals, hands-free
(10); pathways, routines and repertoire (9); lessons and the agenda (5); direction-aware
text (2); material (6); the Setar archive (14); courses (15); scheduling and the Session
Plan (9); device, sync, architecture and tests (13).
Checked clean, unchanged: the core loop, the four hard do-nots, all 11 r-* ids, every dated
owner decision and its bounds (sync 2026-07-11, public repo, doorways 2026-08-28/09-11, v13
waiver), the named open gaps, the NAS-tooling rule, and each fact code or docs cite AGENTS.md
for (direction.test.ts surface list, empty allowlist and QuickAdd exclusion; Today.tsx's
insights.ts gap; plan.ts "subordinate to real needs"; scoring.test.ts formula; mediaRoots.ts
single base, no fallback; the WebKit Blob limit; cgs-course.md's fuzzy-match refusal;
DECISIONS' Active text-align note and "Practice list").
Guard: new named test "AGENTS.md keeps every agent-facing prohibition restored from the
baseline sweep" anchors all 83 phrases; deleting the contrast-card or computed-dir phrase
fails it. To fit, each rule is one line and mechanism the docs already state left AGENTS.md
(repertoire views and URL state, routine proportions, the seed list). DECISIONS' entry
records this, the disposition rows say the A: heading holds each section's prohibitions,
and the profile is 31,469 of 32,768 bytes.

Family repository-guidance-path-reachability
Invariant: every repos
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes. _(proof: the instructions every agent session loads at the repository root fit in 32768 bytes)_
- [ ] **ac-2** — Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it. _(proof: AGENTS.md states the core loop, every hard do-not and each owner-approved app rule)_
- [ ] **ac-3** — Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it. _(proof: every repository path AGENTS.md names exists)_
- [ ] **ac-4** — In a new Claude Code session started in the lane worktree there is no "...-char limit" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

_none_

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

_No flows affected — reported by agent at 2026-10-01T22:20:05.480Z._


**Gaps between detected and reported:**

_None — the report matches what was detected._

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261001-condense-agents-md-into-an-always-loaded-39ca' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
