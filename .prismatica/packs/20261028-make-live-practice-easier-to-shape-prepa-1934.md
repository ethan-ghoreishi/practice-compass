---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
contractId: 20261028-make-live-practice-easier-to-shape-prepa-1934
contractHash: 0c8d49a165e27b70160d05af0a6cc80e974248e4518aff78f9f2f7bfc33d077f
createdAt: 2026-10-29T01:06:57.497Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Make live practice easier to shape, prepare for class and keep in time

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/58
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261028-make-live-practice-easier-to-shape-prepa-1934

## Intent revision — supersedes the original request only where it conflicts

- **2026-10-29T01:06:45.559Z** _(Owner requires live teacher questions to autosave without a remembered Save; replace the Save-only lifecycle and strengthen ac-5 while preserving the existing lane, other accepted families and all three review findings.)_

  OWNER REQUIREMENT REVISION: durable live teacher-question capture, within this existing lane.

This revision supersedes only the explicit-Save-only capture and non-blank Cancel semantics in product rule 4 of the original approved intent. Preserve the rest of that intent, the existing lane/issue/baseline, all other acceptance families and all three sealed request_changes findings. Claude remains the builder. This is rework of the current change, not a new lane or a general product review.

Use one lifecycle for the live question, shared by quiet-interval autosave, an optional immediate Save/Done action, retry and exit flushing. Reuse lessonAgenda questions, their existing store actions, and actual device-persistence acknowledgement. No second notes system, persisted draft collection, schema, migration or new dependency is needed. The currently allowed component/store/UI/domain/test paths are sufficient; choose the smallest complete implementation after inspection. Reuse the durable-note timing convention where practical (currently 800 ms), without changing item/lesson notes or their journal.

When a non-blank question is typed, save after a short quiet interval without requiring Save, blur or another remembered action. The first write creates one independent agenda question. Further autosaves, explicit saves and retries for that capture update the same question id. Autosave leaves the editor open and editable, preserving focus and words; it does not turn each pause in typing into another question. Done may flush and close only once the latest applicable non-blank text is acknowledged. Starting another question is deliberate; CloseBlock's later question remains independent. Merely opening and closing an empty/whitespace capture creates nothing. Replace a misleading Cancel after text has been entered with the same flush/close lifecycle; closing must not silently discard a non-blank thought or undo a question already autosaved.

Keep ownership frozen from capture opening: instrument, item (absent for an unbound Routine segment) and named lesson/default or visibly unassigned. The existing explicit lesson choice is deliberate, not permission for props, a boundary, a changed day, a later lesson, navigation or an async callback to retarget words. Once the question is created, edits/retries belong to that id and its established ownership. Revalidate before creating it; invalid/deleted/moved/cross-instrument targets keep the words with a clear problem and a deliberate valid recovery choice, never a guessed replacement. Respect existing agenda deletion/detachment rules for saved questions; do not recreate a deleted question or attach it to a different item/lesson on retry.

Apply this to ordinary practice and Plan ActiveBlock, and Routine bound/unbound segments. Intermediate Routine transitions, manual Move on/Skip/Finish and the final automatic boundary must not lose or retarget an open editor. The same applies when wall-clock catch-up after background crosses several boundaries or completes the run. Preserve the open capture and its useful close/retry controls on Routine complete, including pending/failed saves; automatic success must not erase text still being edited. Flush the latest non-blank text on app-controlled exit or close, including Finish, navigation away and editor unmount. Pending/failed words and their retry route must remain recoverable across internal navigation rather than disappear with component-local state. Do not delay, pause or recalculate practice to wait for question storage. The existing result/agenda/return surfaces may provide recovery; no new workflow is prescribed.

Read the current draft directly, never from an old render or a ref mirrored later by an effect. A pending write must not own the editor. Newer edits must be saved to the same question and must not be cleared, overwritten, marked saved or closed by an earlier acknowledgement. Coalesce/sequence writes through the one lifecycle; repeated taps, autosave plus Done, exit flushing, retry and late/out-of-order outcomes must remain idempotent. Each completed attempt must settle truthfully, including editing to empty or whitespace while a previous non-blank write is pending. Blank text creates no question and does not overwrite/delete an existing non-blank question: retain the last written question, settle its acknowledgement, and make clear that the empty editor is not a newly saved question. Never remain indefinitely Saving after that write has answered.

Saved means IndexedDB acknowledged the relevant text, never just an in-memory agenda append. Failure retains the latest words, ownership and question identity, shows an actionable failure and allows a retry that really writes again even if memory is unchanged. Do not silently close on failure or spin an endless retry loop. Acknowledged autosaves and acknowledged retries survive reload with exactly one question holding the latest acknowledged non-blank words and correct ownership, visible in existing lesson-id agenda/report consumers. Test reload against disk, not memory. An interrupted or refused device write cannot be claimed durable: preserve retry/copy access while the app is alive and accurately distinguish any older acknowledged version after reload. There is no promise that a forced browser/process termination before acknowledgement can retain a write the device refused; do not invent a second persistence system to imply that guarantee.

Preserve all three review findings as required repairs: (1) required-class useful floors through preview edits and Start, including the single-row swap that currently seats a 10-minute whole work at 5 minutes, coverage/partial-start acknowledgement and live run installation; prove it within existing ac-3 without reopening its policy; (2) open live-question draft and controls surviving automatic final Routine completion, bound/unbound and background catch-up; (3) every answered question-save acknowledgement settling, especially pending-write edits to blank/whitespace. Do not edit away, dismiss or weaken the recorded findings.

Strengthen ac-5 in place, retaining its id and exact unique test title. Extend its real-UI family in tests/live-practice.browser.test.ts through Chromium and WebKit, with controlled persistence delay/failure and deterministic clock/background catch-up where needed. Supporting focused pure/state checks may supplement, never replace, reachable UI lifecycle proof. Replace assertions that encode superseded Save-only/Cancel behaviour. Update the existing family proof map and relevant capture guidance in docs/practice-session-model.md, AGENTS.md and DECISIONS.md; reconcile only affected existing Flow proposals through the normal protocol, never signed truth by hand. Document independently expected question ids/text/ownership and the saved-on-device boundary. Sweep existing agenda/list/report consumers and any callers of a shared acknowledgement helper actually changed; report unchanged consumers checked clean. All other acceptance descriptions, scope restrictions, full configured gates and the bounded owner device walkthrough remain as approved. Timer identity and elapsed logging, Plan/Routine accounting and practice records, metronome, cue claims/wake lock, focus/mode, notes/drafts, preparations/ranking and retention remain unaffected by question capture. Do not reopen unrelated accepted families.

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Make live practice easier to shape, prepare for class and keep in time

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Use the Prismatica start skill to inspect the current practice-compass repo and produce an import-ready plan for Claude to build. Treat this as one coherent review of the live practice/session experience. Diagnose current behaviour and choose the best product model rather than assuming my suggested solutions are correct. Preserve consistency between Plan, Routine and ordinary practice where similar actions should mean the same thing, while allowing justified differences.
> Cover Plan unused time: a simple choice over freed time when removing work, considering unused, spreading across remaining work or giving to a chosen item; reconcile the previous settled default and related Routine behaviour. Cover next-lesson work in every generated Plan until that lesson, including a second Setar session the same day: revisit exposure, repeat suppression and class urgency; decide whole versus parts, useful minimum time, multiple items and short budgets, with a clear bounded exception if everything cannot physically fit, without changing protected review dates or confusing preparation with retention. Make optional Routine results easy to clear. Capture teacher questions while the timer continues through the existing class-question workflow, without disturbing practice. Assess and add the smallest useful integrated metronome, with quick controls and compatible audio/PWA behaviour, and improve the quiet between-item cue.
> Inspect implementation, Flows, AGENTS/DECISIONS, prior session-control/scheduling decisions and tests. Include directly related unresolved issues or regressions only. Protect scheduling/evidence, honest records, autosaved notes, routine logging, Plan ordering, local data/sync/offline, sound/wake-lock lifecycle, mobile keyboard/tab fixes and migrations except where the requested behaviour requires a coherent change. Settle shared semantics first; consolidate causes and consumers; use a few behaviour-family checks with counterexamples and missed states; sweep consumers; include morning/evening lesson examples; distinguish product and harness failures. Leave implementation, UI detail and bounded constants to Claude. Require a reproducible reachable contract violation or attributable regression for blockers, excluding taste, speculation, architecture preferences and unrelated defects. Manual checks only for things automation cannot prove, especially real-device sound. One bounded lane. Revalidate and return the final import-ready plan only.

## Why

One session workflow spans the Plan preview, ordinary active block and Routine runner. Fix the eligibility and time-control causes once, then add quick agenda capture and a small practice aid without reopening retention scheduling.

## Today

Inspected clean main 66888db7. In src/domain/scoring.ts candidatePool excludes every item with a block today while anything fresh exists. buildSessionPlan and swapSegment consume it, then score/segmentTarget/allocateMinutes can omit class commitments again. Lesson urgency is a bounded additive score, not a reservation. nextPractice explicitly says back tomorrow after same-day practice. tests/practice-session-families.test.ts currently asserts that the practised class item is absent from both build and swap. This is intentional October 23 policy, not an unexplained scheduling bug.
Plan Remove leaves its time unused; Routine preview Remove does likewise. The October 23 DECISIONS entry and docs/practice-session-model.md settle this explicitly. Plan moves already preserve identity and order. Running Skip discards that occurrence; Routine Move on keeps elapsed practice. These are distinct from preview allocation.
RoutineCapture offers six OptionPills without not_logged or clear; tapping a selected pill repeats its selection. captureRoutineResults already accepts not_logged, but its latest-result update returns early when clearing leaves no older assessed block, potentially retaining the cleared result in item.lastResult. This directly related reachable case needs proof and repair.
addLessonQuestion, defaultTargetLesson and lessonAgenda already provide independent per-question storage and lesson targeting. ActiveBlock and RoutineRunner have no quick question capture. CloseBlock can add a new question. The prepare-for-the-next-class Flow is stale: it still describes question text on flagged items rather than the implemented independent agenda entries.
practiceCue owns one gesture-readied context and a two-pulse 880 Hz cue (gain 0.2, exponential decay across 0.3s); no metronome exists. Cue claims prevent replay and dead contexts recover on the next readying tap. Real audibility is owner-reported, not proved by node mocks. Existing cue tests cover recovery and clock isolation.

## Instead

PRODUCT RULES
1. Time is capacity; reuse is an explicit preview edit. In both Plan and Routine preview, Remove immediately leaves the freed minutes visibly unused and offers a compact optional action to spread those minutes across surviving work or give them to one chosen surviving entry. Leaving/dismissing it needs no further tap. Show the allocation before Start. Never regenerate, add candidates, reorder, change identities or mutate the saved routine as a side effect. Distribute deterministically within existing useful bounds, respecting Plan optional-role shares and ceilings; unavailable capacity stays visibly unused, with no disabled dead-end action when nothing can take it. Transfer only available freed time once, even after repeated removes/choices. Subsequent explicit rebuild/length change deliberately replaces the preview. Running Skip, Remove, early Finish and Move on continue to free time without reallocating it: running clocks and already agreed boundaries are frozen. An ordinary block has no allocation list. This replaces the preview portion of October 23's rule; it does not reinstate automatic redistribution.
2. Reserve required class work, do not merely boost its score. Required means existing non-resting items explicitly prepared for the nearest upcoming non-archive lesson on the session instrument (all classes tied on that nearest date); later-class commitments retain their own bounded urgency, never inherit this guarantee. Questions, unassigned entries, past/deleted/archive/other-instrument lessons confer no obligation. Practised earlier today, including unassessed Routine minutes, and heavy recent exposure cannot remove required items from any fresh build, regeneration or length change. Reserve these before optional roles, variety, study turns, ordinary anchor preferences and segment-count heuristics. Keep the published score/exposure model for ordering and discretionary choices; do not invent a larger urgency multiplier or a second score.
One segment per exact item even when several preparations/reviews name it. A preparation on a whole item means that item, not automatically one of its parts; a preparation on a part means that exact part and never proves the parent. Retain 10 useful minutes for a whole work and 2 for a part/drill as the current starting policy. A non-committed parent/part must not duplicate a reserved family member unless its own due review requires it. If both parent and part are explicitly prepared, they are two deliberate commitments and can both be seated, clearly identified; no cross-item evidence or invented coverage. Unrelated sibling parts remain distinct. Do not fabricate or silently select a new chunk to make the arithmetic fit.
When required floors fit the budget, every required item is seated, even if this removes all optional roles or exceeds the old segment count. When they do not, show all omitted required items, the minimum budget needed and a direct budget-change route. Starting a partial Plan requires an explicit choice/acknowledgement of the actual subset and omissions, not a generic hidden warning; select the useful subset deterministically with existing ranking and allow owner adjustment. Never pad with optional work while an omitted required item could fit. No sub-floor token slots; if no required item fits, explain that and require a larger budget before starting this class Plan (ordinary practice remains available). Thus two 10-minute works at budget 20 both appear; budget 15 needs a visible partial choice; a lone whole work at budget 5 needs 10. Invalid budgets remain refused within the existing 5–120 boundary; requirements beyond 120 use the same explicit partial exception, never an impossible increase prompt. Manual remove/swap is an explicit override, reflected in coverage; it is not silently repaired or silently labelled complete. Start rechecks relevant live data/day/revision and omissions, so edited commitments cannot slip through an old acknowledgement.
Shared eligibility must admit live class commitments despite same-day practice across Today/build/regeneration/swap; only Plan promises reserved coverage for the nearest lesson. Today still offers a small ranked suggestion, not every commitment. nextPractice, ItemDetail, CloseBlock, reasons, summaries and Settings must accurately describe class work as available again this session until its class, never back tomorrow solely because it was practised. Do not claim nothing else eligible is waiting when fresh candidates coexist with reserved repeats. Passed/removed/retargeted commitments lose the guarantee immediately. Resting commitments stay out and are explained as such in class coverage, never silently reactivated.
3. Optional Routine assessment has an explicit Clear result action returning to not assessed/not_logged, before and after saving, independently per recorded item. Clear preserves observation text unless separately edited, minutes, scope, ownership and other items. Repeated save/clear/retry is idempotent. Derive item.lastResult honestly from remaining assessed history when the cleared block was the latest: retain a later assessment, restore an earlier one or remove the summary if none exists. Never invent same, rewrite old blocks, advance a review, change readiness or alter retention.
4. A compact Ask teacher entry is available while practising an ordinary or planned block and a Routine. One short text field, current item/instrument inferred, nearest upcoming lesson visibly named by existing defaultTargetLesson; no lesson means visibly unassigned. Allow changing target without making it mandatory. For an unbound Routine segment capture an instrument question, never guess an item. Save appends one independent agenda question and acknowledges actual device persistence; failure keeps words and retry must not duplicate a question already added in memory. Blank/cancel writes nothing. Freeze capture ownership when opened: a Routine boundary or live deletion/reassignment while typing must not silently retarget the words. Keep the draft and explain/refuse a now-invalid target; offer deliberate unassigned capture where valid. Multiple questions coexist and Close's later question remains independent. No prep commitment or ranking change. Opening/typing/saving/closing never pauses or restarts practice or audio, steals focus on a boundary, remounts notes, changes mode/focus/markers or manipulates main scroll. Explicit opening may focus the input; keyboard dismissal restores usable controls through existing viewport behaviour.
5. Add a small opt-in metronome to ActiveBlock (ordinary and Plan) and RoutineRunner: start/stop, visible BPM with quick +/- and direct entry, and a modest level control, no meter/subdivision/accent/presets/recording/analysis. Default off, a sensible tempo and bounded range (80 BPM, 40–240 are acceptable starting values; Claude may tune bounded constants). Local ephemeral tempo/level can carry across practice screens, never into practice records, migrations, backups or sync. It runs only for a visible running practice screen, stops on pause, Finish, discard, navigation away, hidden page or lost audio readiness; returning/resuming leaves it off until a tap. A Routine boundary alone keeps the beat going. Text capture does not stop it. Metronome controls do not ready/replace a context on every BPM edit: retain the fresh-context rule on existing readying taps and coordinate context replacement with scheduled beat cancellation. Start uses a gesture; never auto-revive sound from an effect. No stacked schedulers, old-context beats, late burst/catch-up, leaked nodes or double beats after rapid edits, remounts or failed resume. Schedule by the audio timeline independently of the practice wall clock, not the UI's one-second tick. Web Audio scheduling reference: [MDN advanced techniques](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques).
Improve cue recognisability/audible energy by inspecting waveform, envelope and level, not merely maximising gain; retain a distinct short boundary pattern and unchanged once-only marker claims/visual fallback. Boundary cues take audible priority over the metronome (briefly duck/mute its ticks), then restore the selected beat without a burst. Sound test in Settings and the active-screen recovery tap use the same actual cue; a late old test cannot play after a newer context. No guaranteed background audio or speaker audibility claim. The owner calibrates actual volume beside Setar on MacBook and iPhone Safari/installed PWA.
DELIVERY AND PROOF
Before first review, extend docs/practice-session-model.md with a concise family proof map: invariants, every consumer below, committed fixed-clock fixtures, independently calculated identities/minutes/dates/records, focused named test commands and limits. Use the acceptance families, not a second exhaustive product specification. Sweep candidatePool/scoreItems/preparationDatesByItem/defaultTargetLesson/nextPractice through recommend/recommendForInstrument, build, regenerate, length change, swap, Today, ItemDetail, CloseBlock, Settings; time edits through preview/start/resume/accounting and Routine fitting/short-on-time/all start doors; capture through store/persistence, Lessons/ClassQuestions/ItemAgenda/TeacherReport and Close; sound through all Start/Resume/Test/recovery doors and both active screens. Trace unchanged consumers and report checked clean; change them only where required. Update stale tests rather than preserving superseded policy assertions.
Reconcile current AGENTS rules in place, add a dated DECISIONS explanation superseding the two prior decisions precisely, and update the three named docs. Through Prismatica's proposal protocol reconcile affected Flows: practise-todays-recommendation, run-a-session-plan, work-a-pathway-stage, prepare-for-the-next-class and adjust-how-scheduling-works where its explanation changes. Do not hand-edit signed approval/truth to bypass governance. The stale teacher-question Flow is included only to align this changed journey.
Claude owns component design, helper boundaries, UI copy/detail and bounded allocation/audio constants within these rules; no dependency is needed for a basic oscillator metronome. Review blocks only on a reproducible reachable violation of these rules/acceptance or an attributable regression, with state, action, expected and actual evidence. Hypothetical edge cases, alternate constants within the bounds, preferred architecture and unrelated old defects cannot reopen the lane. Browser installation/server/CI/harness failures are reported separately and resolved as proof availability, never passed off as product failures or silently skipped. Use existing event-driven Chromium/WebKit harnesses, full npm test plus configured lint/typecheck/build/secrets gates. Local automated proof precedes fresh review; real device audio/keyboard judgement is the single bounded owner walkthrough.
Focused proof route: place the new named pure/controlled-audio families in tests/live-practice-families.test.ts and the real-UI families in tests/live-practice.browser.test.ts, with literal fixed-clock expectations in tests/fixtures/live-practice-expectations.json; npx vitest run tests/live-practice-families.test.ts tests/live-practice.browser.test.ts tests/practice-cues.browser.test.ts tests/practice-session-families.test.ts tests/practice-session.browser.test.ts is the reproducible family route, followed by the required full checks. Each acceptance title occurs once, even when its test loops through both engines. Real acoustic output is outside that route. Scope lists concrete optional helper paths because wildcard secret intersections are refused; these are permissions, not instructions to create all those files or impose an architecture. Generated governed proposal records use the normal Prismatica protocol.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- A1: Preparation entries on the nearest lesson date express the required next-class set; mere lesson links and questions do not. Explicit manual preview edits can override a generated proposal, with visible coverage.
- A2: Foreground, unaccented beats are enough to replace the separate metronome app for this lane; device audibility remains a manual acceptance result.

**Possible conflicts**

- Owner request intentionally supersedes October 23 preview-only reallocation restrictions and same-day suppression of class preparation. Update rules, decisions, explanations and tests together; preserve running-time and retention semantics.
- Required class coverage can exceed available time; the explicit partial-Plan exception is the only automatic-generation omission policy. It must not become a hidden once-per-day quota.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Use the Prismatica start skill to inspect the current practice-compass repo and produce an import-ready plan for Claude to build. Treat this as one coherent review of the live practice/session experience. Diagnose current behaviour and choose the best product model rather than assuming my suggested solutions are correct. Preserve consistency between Plan, Routine and ordinary practice where similar actions should mean the same thing, while allowing justified differences.\nCover Plan unused time: a simple choice over freed time when removing work, considering unused, spreading across remaining work or giving to a chosen item; reconcile the previous settled default and related Routine behaviour. Cover next-lesson work in every generated Plan until that lesson, including a second Setar session the same day: revisit exposure, repeat suppression and class urgency; decide whole versus parts, useful minimum time, multiple items and short budgets, with a clear bounded exception if everything cannot physically fit, without changing protected review dates or confusing preparation with retention. Make optional Routine results easy to clear. Capture teacher questions while the timer continues through the existing class-question workflow, without disturbing practice. Assess and add the smallest useful integrated metronome, with quick controls and compatible audio/PWA behaviour, and improve the quiet between-item cue.\nInspect implementation, Flows, AGENTS/DECISIONS, prior session-control/scheduling decisions and tests. Include directly related unresolved issues or regressions only. Protect scheduling/evidence, honest records, autosaved notes, routine logging, Plan ordering, local data/sync/offline, sound/wake-lock lifecycle, mobile keyboard/tab fixes and migrations except where the requested behaviour requires a coherent change. Settle shared semantics first; consolidate causes and consumers; use a few behaviour-family checks with counterexamples and missed states; sweep consumers; include morning/evening lesson examples; distinguish product and harness failures. Leave implementation, UI detail and bounded constants to Claude. Require a reproducible reachable contract violation or attributable regression for blockers, excluding taste, speculation, architecture preferences and unrelated defects. Manual checks only for things automation cannot prove, especially real-device sound. One bounded lane. Revalidate and return the final import-ready plan only.",
  "builder": "claude",
  "summary": "Make live practice easier to shape, prepare for class and keep in time",
  "rationale": "One session workflow spans the Plan preview, ordinary active block and Routine runner. Fix the eligibility and time-control causes once, then add quick agenda capture and a small practice aid without reopening retention scheduling.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "Inspected clean main 66888db7. In src/domain/scoring.ts candidatePool excludes every item with a block today while anything fresh exists. buildSessionPlan and swapSegment consume it, then score/segmentTarget/allocateMinutes can omit class commitments again. Lesson urgency is a bounded additive score, not a reservation. nextPractice explicitly says back tomorrow after same-day practice. tests/practice-session-families.test.ts currently asserts that the practised class item is absent from both build and swap. This is intentional October 23 policy, not an unexplained scheduling bug.\nPlan Remove leaves its time unused; Routine preview Remove does likewise. The October 23 DECISIONS entry and docs/practice-session-model.md settle this explicitly. Plan moves already preserve identity and order. Running Skip discards that occurrence; Routine Move on keeps elapsed practice. These are distinct from preview allocation.\nRoutineCapture offers six OptionPills without not_logged or clear; tapping a selected pill repeats its selection. captureRoutineResults already accepts not_logged, but its latest-result update returns early when clearing leaves no older assessed block, potentially retaining the cleared result in item.lastResult. This directly related reachable case needs proof and repair.\naddLessonQuestion, defaultTargetLesson and lessonAgenda already provide independent per-question storage and lesson targeting. ActiveBlock and RoutineRunner have no quick question capture. CloseBlock can add a new question. The prepare-for-the-next-class Flow is stale: it still describes question text on flagged items rather than the implemented independent agenda entries.\npracticeCue owns one gesture-readied context and a two-pulse 880 Hz cue (gain 0.2, exponential decay across 0.3s); no metronome exists. Cue claims prevent replay and dead contexts recover on the next readying tap. Real audibility is owner-reported, not proved by node mocks. Existing cue tests cover recovery and clock isolation.",
  "desiredBehaviour": "PRODUCT RULES\n1. Time is capacity; reuse is an explicit preview edit. In both Plan and Routine preview, Remove immediately leaves the freed minutes visibly unused and offers a compact optional action to spread those minutes across surviving work or give them to one chosen surviving entry. Leaving/dismissing it needs no further tap. Show the allocation before Start. Never regenerate, add candidates, reorder, change identities or mutate the saved routine as a side effect. Distribute deterministically within existing useful bounds, respecting Plan optional-role shares and ceilings; unavailable capacity stays visibly unused, with no disabled dead-end action when nothing can take it. Transfer only available freed time once, even after repeated removes/choices. Subsequent explicit rebuild/length change deliberately replaces the preview. Running Skip, Remove, early Finish and Move on continue to free time without reallocating it: running clocks and already agreed boundaries are frozen. An ordinary block has no allocation list. This replaces the preview portion of October 23's rule; it does not reinstate automatic redistribution.\n2. Reserve required class work, do not merely boost its score. Required means existing non-resting items explicitly prepared for the nearest upcoming non-archive lesson on the session instrument (all classes tied on that nearest date); later-class commitments retain their own bounded urgency, never inherit this guarantee. Questions, unassigned entries, past/deleted/archive/other-instrument lessons confer no obligation. Practised earlier today, including unassessed Routine minutes, and heavy recent exposure cannot remove required items from any fresh build, regeneration or length change. Reserve these before optional roles, variety, study turns, ordinary anchor preferences and segment-count heuristics. Keep the published score/exposure model for ordering and discretionary choices; do not invent a larger urgency multiplier or a second score.\nOne segment per exact item even when several preparations/reviews name it. A preparation on a whole item means that item, not automatically one of its parts; a preparation on a part means that exact part and never proves the parent. Retain 10 useful minutes for a whole work and 2 for a part/drill as the current starting policy. A non-committed parent/part must not duplicate a reserved family member unless its own due review requires it. If both parent and part are explicitly prepared, they are two deliberate commitments and can both be seated, clearly identified; no cross-item evidence or invented coverage. Unrelated sibling parts remain distinct. Do not fabricate or silently select a new chunk to make the arithmetic fit.\nWhen required floors fit the budget, every required item is seated, even if this removes all optional roles or exceeds the old segment count. When they do not, show all omitted required items, the minimum budget needed and a direct budget-change route. Starting a partial Plan requires an explicit choice/acknowledgement of the actual subset and omissions, not a generic hidden warning; select the useful subset deterministically with existing ranking and allow owner adjustment. Never pad with optional work while an omitted required item could fit. No sub-floor token slots; if no required item fits, explain that and require a larger budget before starting this class Plan (ordinary practice remains available). Thus two 10-minute works at budget 20 both appear; budget 15 needs a visible partial choice; a lone whole work at budget 5 needs 10. Invalid budgets remain refused within the existing 5–120 boundary; requirements beyond 120 use the same explicit partial exception, never an impossible increase prompt. Manual remove/swap is an explicit override, reflected in coverage; it is not silently repaired or silently labelled complete. Start rechecks relevant live data/day/revision and omissions, so edited commitments cannot slip through an old acknowledgement.\nShared eligibility must admit live class commitments despite same-day practice across Today/build/regeneration/swap; only Plan promises reserved coverage for the nearest lesson. Today still offers a small ranked suggestion, not every commitment. nextPractice, ItemDetail, CloseBlock, reasons, summaries and Settings must accurately describe class work as available again this session until its class, never back tomorrow solely because it was practised. Do not claim nothing else eligible is waiting when fresh candidates coexist with reserved repeats. Passed/removed/retargeted commitments lose the guarantee immediately. Resting commitments stay out and are explained as such in class coverage, never silently reactivated.\n3. Optional Routine assessment has an explicit Clear result action returning to not assessed/not_logged, before and after saving, independently per recorded item. Clear preserves observation text unless separately edited, minutes, scope, ownership and other items. Repeated save/clear/retry is idempotent. Derive item.lastResult honestly from remaining assessed history when the cleared block was the latest: retain a later assessment, restore an earlier one or remove the summary if none exists. Never invent same, rewrite old blocks, advance a review, change readiness or alter retention.\n4. A compact Ask teacher entry is available while practising an ordinary or planned block and a Routine. One short text field, current item/instrument inferred, nearest upcoming lesson visibly named by existing defaultTargetLesson; no lesson means visibly unassigned. Allow changing target without making it mandatory. For an unbound Routine segment capture an instrument question, never guess an item. Save appends one independent agenda question and acknowledges actual device persistence; failure keeps words and retry must not duplicate a question already added in memory. Blank/cancel writes nothing. Freeze capture ownership when opened: a Routine boundary or live deletion/reassignment while typing must not silently retarget the words. Keep the draft and explain/refuse a now-invalid target; offer deliberate unassigned capture where valid. Multiple questions coexist and Close's later question remains independent. No prep commitment or ranking change. Opening/typing/saving/closing never pauses or restarts practice or audio, steals focus on a boundary, remounts notes, changes mode/focus/markers or manipulates main scroll. Explicit opening may focus the input; keyboard dismissal restores usable controls through existing viewport behaviour.\n5. Add a small opt-in metronome to ActiveBlock (ordinary and Plan) and RoutineRunner: start/stop, visible BPM with quick +/- and direct entry, and a modest level control, no meter/subdivision/accent/presets/recording/analysis. Default off, a sensible tempo and bounded range (80 BPM, 40–240 are acceptable starting values; Claude may tune bounded constants). Local ephemeral tempo/level can carry across practice screens, never into practice records, migrations, backups or sync. It runs only for a visible running practice screen, stops on pause, Finish, discard, navigation away, hidden page or lost audio readiness; returning/resuming leaves it off until a tap. A Routine boundary alone keeps the beat going. Text capture does not stop it. Metronome controls do not ready/replace a context on every BPM edit: retain the fresh-context rule on existing readying taps and coordinate context replacement with scheduled beat cancellation. Start uses a gesture; never auto-revive sound from an effect. No stacked schedulers, old-context beats, late burst/catch-up, leaked nodes or double beats after rapid edits, remounts or failed resume. Schedule by the audio timeline independently of the practice wall clock, not the UI's one-second tick. Web Audio scheduling reference: [MDN advanced techniques](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Advanced_techniques).\nImprove cue recognisability/audible energy by inspecting waveform, envelope and level, not merely maximising gain; retain a distinct short boundary pattern and unchanged once-only marker claims/visual fallback. Boundary cues take audible priority over the metronome (briefly duck/mute its ticks), then restore the selected beat without a burst. Sound test in Settings and the active-screen recovery tap use the same actual cue; a late old test cannot play after a newer context. No guaranteed background audio or speaker audibility claim. The owner calibrates actual volume beside Setar on MacBook and iPhone Safari/installed PWA.\nDELIVERY AND PROOF\nBefore first review, extend docs/practice-session-model.md with a concise family proof map: invariants, every consumer below, committed fixed-clock fixtures, independently calculated identities/minutes/dates/records, focused named test commands and limits. Use the acceptance families, not a second exhaustive product specification. Sweep candidatePool/scoreItems/preparationDatesByItem/defaultTargetLesson/nextPractice through recommend/recommendForInstrument, build, regenerate, length change, swap, Today, ItemDetail, CloseBlock, Settings; time edits through preview/start/resume/accounting and Routine fitting/short-on-time/all start doors; capture through store/persistence, Lessons/ClassQuestions/ItemAgenda/TeacherReport and Close; sound through all Start/Resume/Test/recovery doors and both active screens. Trace unchanged consumers and report checked clean; change them only where required. Update stale tests rather than preserving superseded policy assertions.\nReconcile current AGENTS rules in place, add a dated DECISIONS explanation superseding the two prior decisions precisely, and update the three named docs. Through Prismatica's proposal protocol reconcile affected Flows: practise-todays-recommendation, run-a-session-plan, work-a-pathway-stage, prepare-for-the-next-class and adjust-how-scheduling-works where its explanation changes. Do not hand-edit signed approval/truth to bypass governance. The stale teacher-question Flow is included only to align this changed journey.\nClaude owns component design, helper boundaries, UI copy/detail and bounded allocation/audio constants within these rules; no dependency is needed for a basic oscillator metronome. Review blocks only on a reproducible reachable violation of these rules/acceptance or an attributable regression, with state, action, expected and actual evidence. Hypothetical edge cases, alternate constants within the bounds, preferred architecture and unrelated old defects cannot reopen the lane. Browser installation/server/CI/harness failures are reported separately and resolved as proof availability, never passed off as product failures or silently skipped. Use existing event-driven Chromium/WebKit harnesses, full npm test plus configured lint/typecheck/build/secrets gates. Local automated proof precedes fresh review; real device audio/keyboard judgement is the single bounded owner walkthrough.\nFocused proof route: place the new named pure/controlled-audio families in tests/live-practice-families.test.ts and the real-UI families in tests/live-practice.browser.test.ts, with literal fixed-clock expectations in tests/fixtures/live-practice-expectations.json; npx vitest run tests/live-practice-families.test.ts tests/live-practice.browser.test.ts tests/practice-cues.browser.test.ts tests/practice-session-families.test.ts tests/practice-session.browser.test.ts is the reproducible family route, followed by the required full checks. Each acceptance title occurs once, even when its test loops through both engines. Real acoustic output is outside that route. Scope lists concrete optional helper paths because wildcard secret intersections are refused; these are permissions, not instructions to create all those files or impose an architecture. Generated governed proposal records use the normal Prismatica protocol.",
  "mustNotChange": [
    "One item, mode, focus, result and next action; honest focused/whole evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay, protected/unknown/manual/fixed dates and atomic review-row decisions. Class reservation is organisation, never retention evidence.",
    "Actual elapsed logging, Routine aggregation one block per practised bound item, no feedback requirement, skip versus move-on, overtime, frozen run contents and single unfinished clock protection.",
    "Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict behaviour, notes ownership and latest non-empty next action.",
    "Offline local-first storage, schema v17 and all existing migrations/validation, attachment bytes, unfinished-session sync deferral, backups, token secrecy, archive/NAS behaviour. No new persisted collection or schema change is needed.",
    "Plan manual order and identity, stale-start checks, existing valid budget boundary, default instrument scope, Today doorway order, 44px controls, literal direction-aware sites, mobile viewport/tab/keyboard fixes and only-main scrolling.",
    "Visual boundary guarantees, claim-once markers, wake-lock lifecycle and wall-clock authority; audio failure must never block practice."
  ],
  "assumptions": [
    "A1: Preparation entries on the nearest lesson date express the required next-class set; mere lesson links and questions do not. Explicit manual preview edits can override a generated proposal, with visible coverage.",
    "A2: Foreground, unaccented beats are enough to replace the separate metronome app for this lane; device audibility remains a manual acceptance result."
  ],
  "possibleConflicts": [
    "Owner request intentionally supersedes October 23 preview-only reallocation restrictions and same-day suppression of class preparation. Update rules, decisions, explanations and tests together; preserve running-time and retention semantics.",
    "Required class coverage can exceed available time; the explicit partial-Plan exception is the only automatic-generation omission policy. It must not become a hidden once-per-day quota."
  ],
  "scope": {
    "allow": [
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/pages/SessionPlan.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/Today.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/Settings.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/TeacherReport.tsx",
      "AGENTS.md",
      "DECISIONS.md",
      "docs/practice-session-model.md",
      "docs/scheduling-evidence.md",
      "docs/setar-practice-reliability.md",
      "src/domain/plan.ts",
      "src/domain/plan.test.ts",
      "src/domain/scoring.ts",
      "src/domain/scoring.test.ts",
      "src/domain/recommend.ts",
      "src/domain/recommend.test.ts",
      "src/domain/practiceSessionModel.ts",
      "src/domain/practiceSessionModel.test.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/routines.ts",
      "src/domain/routines.test.ts",
      "src/domain/questions.ts",
      "src/domain/questions.test.ts",
      "src/components/practiceCue.ts",
      "src/components/practiceCue.test.ts",
      "src/components/ui.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/LessonAgenda.tsx",
      "src/components/ItemAgenda.tsx",
      "src/components/direction.test.ts",
      "src/components/Metronome.tsx",
      "src/components/metronome.ts",
      "src/components/metronome.test.ts",
      "src/components/TeacherQuestionCapture.tsx",
      "src/styles/global.css",
      "tests/live-practice-families.test.ts",
      "tests/live-practice.browser.test.ts",
      "tests/practice-session-families.test.ts",
      "tests/practice-session.browser.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/ui-guidance.test.ts",
      "tests/ui-conformance.browser.test.ts",
      "tests/pressedState.test.ts",
      "tests/fixtures/live-practice-expectations.json",
      ".prismatica/flows/practise-todays-recommendation.md",
      ".prismatica/flows/run-a-session-plan.md",
      ".prismatica/flows/work-a-pathway-stage.md",
      ".prismatica/flows/prepare-for-the-next-class.md",
      ".prismatica/flows/adjust-how-scheduling-works.md"
    ],
    "forbid": [
      "src/store/syncEngine.ts",
      "src/store/backup.ts",
      "src/store/idb.ts",
      "src/store/notesDrafts.ts",
      "src/domain/io.ts",
      "src/domain/migrations*",
      "scripts/**",
      ".github/**",
      "package.json",
      "package-lock.json",
      ".prismatica/rules.md"
    ]
  },
  "exclusions": [
    "No general UX audit, NAS/archive/course redesign, CI overhaul, new persistence/migration or speculative scheduling research. Scope globs permit related helper/test work, not unrelated changes.",
    "No music-production controls, tap-tempo requirement, sound packs, audio analysis, background/lock-screen playback guarantee, practice tempo history or per-item tempo model.",
    "No automatic redistribution during running practice; no change to the saved Routine from run-preview edits."
  ],
  "acceptance": [
    {
      "description": "Plan and Routine previews: leave/spread/chosen target, repeated remove/transfer, full/no eligible recipients, cancelled choice, all removed, prior unused remainder, role caps, short-on-time/fitted Routine. Literal minute accounting proves no double-spend, no automatic reorder/regeneration and saved routine unchanged; Start uses exactly the preview. Running Skip/Move on/early Finish retain their old accounting. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "preview time choices preserve identity order capacity and unused remainders"
    },
    {
      "description": "Fixed local day: at least two class items and fresh competitors, morning ordinary assessed and Routine not_logged blocks, heavy recent minutes, evening build/regenerate/length change/swap. Every exact required item appears when floors fit; no duplicate id, no lower-priority optional displacement, no false repeat reason. Include manual/protected distant dates, working/keep-fresh and uncommitted/future/passed/archive/unassigned/other-instrument/resting counterexamples; inputs, stored dates and spacing stay untouched. Sweep Today and nextPractice explanations as specified. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "next class work survives morning practice in every evening plan"
    },
    {
      "description": "Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work at 5; several 2-minute parts; explicitly committed parent plus child, only parent, only child, siblings, own-due-review relative, >120 required minutes and equal-date lessons. Prove reserved floors, optional roles yield, exact omitted titles/minimum capacity, explicit partial selection and no silent start. Removal/swap overrides and changed lesson/day/revision invalidate stale coverage acknowledgement without destroying manual order. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "class plan capacity exceptions name omissions before any partial start"
    },
    {
      "description": "Select-clear before Save; save-clear-save; observations retained; repeated saves/retries; multiple items; foreign/deleted block refused atomically. Clearing latest assessed block restores older result or no lastResult when none exists, leaves a newer assessment alone. Exact block minutes/scope, reviews/dates/spacing/readiness unchanged, results visible honestly in item/history/Insights/report consumers. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "routine feedback can be cleared without changing practice or retention"
    },
    {
      "description": "Real ordinary, Plan and Routine doors, including unbound segment; save/cancel/blank, no lesson, changed/deleted/cross-instrument lesson/item, boundary while typing, multiple questions and a later Close question. Assert clock identity/elapsed progression, focus and existing note drafts, cue markers unchanged. Inject persistence failure after agenda append, retry and reload: one question, retained words and truthful saving/failed/saved states. Verify lesson-id list/report visibility, unassigned fallback and unchanged preparation/ranking. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "live teacher questions retain capture ownership while practice continues"
    },
    {
      "description": "Controlled audio timeline and fake contexts: bounded tempo edits, start/stop, rapid toggles, denied/rejected/never-settled resume, dead running/suspended/interrupted/closed context, fresh readying tap/test replacement, old callback/remount, pause/finish/discard/navigation/hidden. No orphan scheduled beat, stacked loop or late burst. Cue retains once-only claim and priority/ducking then correct beat cadence, with literal timestamps/levels rather than source assertions; unavailable audio remains usable practice. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "metronome scheduling and cue priority survive sound lifecycle changes"
    },
    {
      "description": "Chromium and WebKit journeys via real UI for ordinary/Plan/Routine, running question input and tempo controls across boundary and keyboard dismissal, stop/resume/reload after a finished run. Assert no extra minutes/blocks, notes remain durable, order/unfinished practice preserved, sound recovery doors work, hidden/paused metronome stops and visual cue remains. Reuse existing harness and conformance/direction/pressed-state checks without weakening them. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.",
      "test": "live practice tools preserve clocks notes records and mobile controls"
    },
    {
      "description": "One bounded real-practice walkthrough with Setar: MacBook and iPhone Safari plus installed PWA over HTTPS, normal media volume beside the instrument. Check cue clearly distinguishable/audible with and without metronome, comfortable BPM/level edits, boundary priority, sound recovery after idle/interruption and quick teacher capture/keyboard return while timer and beat continue. Record devices/versions/output and actual observations; automation cannot certify speaker volume or musical usability. Only reproducible failures of these promised controls/audibility require adjustment, not an open-ended taste review.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Teacher questions append to the existing agenda; clearing Routine feedback edits owned blocks and latest-result summaries. Risk is ownership, duplicate retries and honest evidence, not new schema or transport. Audio lifecycle must remain isolated from clock, notes and records."
  },
  "delta": {
    "today": "Automatic Plans can omit already-practised next-class items; preview removal only leaves unused time; Routine result pills cannot be cleared; questions wait until close; practice has no metronome and its cue is reportedly too quiet.",
    "instead": "One coherent session model provides explicit preview-time reuse, required next-class Plan coverage with visible capacity exceptions, reversible optional feedback, in-place agenda questions and an opt-in metronome sharing a recoverable, distinguishable practice cue.",
    "keep": [
      "Real records and retention dates retain their current authority.",
      "Plan and Routine share preview allocation semantics while preserving separate close/logging models."
    ],
    "assumptions": [],
    "showMe": "Prove the named acceptance families against committed fixed-clock fixtures, including a morning Routine or ordinary block followed by an evening Plan, capacity failure and explicit override, failed question persistence/retry, feedback clear with no older result, and audio interruption without any clock or record change."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/practice-session-model.md",
    "docs/scheduling-evidence.md",
    "docs/setar-practice-reliability.md"
  ]
}
```
````

## The approved Delta this change must deliver

# One coherent session model provides explicit preview-time reuse, required next-class Plan coverage with visible capacity exceptions, reversible optional feedback, in-place agenda questions and an opt-in metronome sharing a recoverable, distinguishable practice cue.

_approved · about "practise-todays-recommendation"_

## Today

Automatic Plans can omit already-practised next-class items; preview removal only leaves unused time; Routine result pills cannot be cleared; questions wait until close; practice has no metronome and its cue is reportedly too quiet.

## Instead

One coherent session model provides explicit preview-time reuse, required next-class Plan coverage with visible capacity exceptions, reversible optional feedback, in-place agenda questions and an opt-in metronome sharing a recoverable, distinguishable practice cue.

## Keep

- Real records and retention dates retain their current authority.
- Plan and Routine share preview allocation semantics while preserving separate close/logging models.

## New assumptions

_none_

## Show me

Prove the named acceptance families against committed fixed-clock fixtures, including a morning Routine or ordinary block followed by an evening Plan, capacity failure and explicit override, failed question persistence/retry, feedback clear with no older result, and audio interruption without any clock or record change.


## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **See and adjust the scheduling engine** (`adjust-how-scheduling-works`) — Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/CloseBlock.tsx`, `src/domain/scheduling.ts`, `src/domain/plan.ts`, `src/domain/types.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/adjust-how-scheduling-works.md`
- **Back up and restore everything** (`back-up-and-restore`) — Keep an independent copy of all practice data and files, and put it back on any device.
  touchpoints: `src/store/backup.ts`, `src/store/idb.ts`, `src/domain/io.ts`, `src/pages/Settings.tsx`, `src/store/useStore.ts` · canonical: `.prismatica/flows/back-up-and-restore.md`
- **Find something in my repertoire** (`browse-my-repertoire`) — See everything you play, grouped the way you think about it, find it by any name, and open the one you mean without losing your place.
  touchpoints: `src/pages/Repertoire.tsx`, `src/pages/ItemDetail.tsx`, `src/pages/Materials.tsx`, `src/domain/repertoire.ts`, `src/domain/persian.ts`, `src/domain/farsi.ts` · canonical: `.prismatica/flows/browse-my-repertoire.md`
- **Add a practice item** (`capture-a-practice-item`) — Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration
  touchpoints: `src/components/QuickAdd.tsx`, `src/components/ItemForm.tsx`, `src/components/itemKinds.ts`, `src/pages/NewItem.tsx`, `src/pages/ItemDetail.tsx`, `src/store/useStore.ts`, `src/domain/factories.ts` · canonical: `.prismatica/flows/capture-a-practice-item.md`
- **Deal with a due review** (`clear-a-due-review`) — Handle material that is due to come back, without ever faking that it was practised.
  touchpoints: `src/pages/Today.tsx`, `src/store/useStore.ts`, `src/domain/scheduling.ts`, `src/domain/selectors.ts` · canonical: `.prismatica/flows/clear-a-due-review.md`
- **Install the app and keep it current** (`install-the-app-and-keep-it-current`) — Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.
  touchpoints: `src/components/Layout.tsx`, `src/pages/Settings.tsx`, `vite.config.ts` · canonical: `.prismatica/flows/install-the-app-and-keep-it-current.md`
- **Log a class and its follow-up work** (`log-a-class`) — Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one
  touchpoints: `src/pages/Lessons.tsx`, `src/components/Attachments.tsx`, `src/domain/recordings.ts`, `src/domain/setarClasses.ts`, `src/domain/files.ts`, `src/domain/selectors.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/log-a-class.md`
- **Point this device at the NAS** (`point-this-device-at-the-nas`) — Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/Lessons.tsx`, `src/domain/recordings.ts`, `src/store/backup.ts` · canonical: `.prismatica/flows/point-this-device-at-the-nas.md`
- **Practise what the app suggests** (`practise-todays-recommendation`) — Practise the one thing the app suggests next and leave an honest record of how it went
  touchpoints: `src/pages/Today.tsx`, `src/pages/StartBlock.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/CloseBlock.tsx`, `src/store/useStore.ts`, `src/domain/recommend.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts`, `src/domain/blocks.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/domain/practiceSessionModel.ts`, `src/components/ItemNotes.tsx`, `src/store/notesDrafts.ts` · canonical: `.prismatica/flows/practise-todays-recommendation.md`
- **Take questions and a summary to class** (`prepare-for-the-next-class`) — Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.
  touchpoints: `src/pages/TeacherReport.tsx`, `src/components/ClassQuestions.tsx`, `src/domain/questions.ts`, `src/domain/report.ts`, `src/pages/Lessons.tsx`, `src/pages/CloseBlock.tsx` · canonical: `.prismatica/flows/prepare-for-the-next-class.md`
- **Run a time-budgeted session** (`run-a-session-plan`) — Turn the minutes actually available into an ordered session, then practise it block by block.
  touchpoints: `src/pages/SessionPlan.tsx`, `src/pages/Today.tsx`, `src/pages/ActiveBlock.tsx`, `src/domain/plan.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/run-a-session-plan.md`
- **See how practice is actually going** (`see-practice-patterns`) — Get a calm, neutral read on the last week or month across everything you play.
  touchpoints: `src/pages/Insights.tsx`, `src/pages/Today.tsx`, `src/domain/insights.ts`, `src/domain/io.ts` · canonical: `.prismatica/flows/see-practice-patterns.md`
- **Keep the MacBook and iPhone in step** (`sync-devices-via-github`) — Practise on either device and have both hold the same data, without a server or an account.
  touchpoints: `src/store/syncEngine.ts`, `src/store/githubSync.ts`, `src/store/gitRemote.ts`, `src/domain/sync.ts`, `src/domain/canonical.ts`, `src/store/revision.ts`, `src/pages/Settings.tsx`, `src/App.tsx` · canonical: `.prismatica/flows/sync-devices-via-github.md`
- **Work through a pathway stage** (`work-a-pathway-stage`) — Follow a route you trust — see where you are, take the next suggestion into your own items once, and practise it
  touchpoints: `src/pages/PathwayDetail.tsx`, `src/pages/StageDetail.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/pathways.ts`, `src/domain/pathwaySeed.ts`, `src/domain/routines.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/pages/Repertoire.tsx` · canonical: `.prismatica/flows/work-a-pathway-stage.md`

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

Make live practice easier to shape, prepare for class and keep in time

## Stay in scope — you may ONLY change

- src/domain/index.ts
- src/store/useStore.ts
- src/pages/SessionPlan.tsx
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Today.tsx
- src/pages/CloseBlock.tsx
- src/pages/Settings.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- AGENTS.md
- DECISIONS.md
- docs/practice-session-model.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md
- src/domain/plan.ts
- src/domain/plan.test.ts
- src/domain/scoring.ts
- src/domain/scoring.test.ts
- src/domain/recommend.ts
- src/domain/recommend.test.ts
- src/domain/practiceSessionModel.ts
- src/domain/practiceSessionModel.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/ui.tsx
- src/components/ClassQuestions.tsx
- src/components/LessonAgenda.tsx
- src/components/ItemAgenda.tsx
- src/components/direction.test.ts
- src/components/Metronome.tsx
- src/components/metronome.ts
- src/components/metronome.test.ts
- src/components/TeacherQuestionCapture.tsx
- src/styles/global.css
- tests/live-practice-families.test.ts
- tests/live-practice.browser.test.ts
- tests/practice-session-families.test.ts
- tests/practice-session.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/ui-guidance.test.ts
- tests/ui-conformance.browser.test.ts
- tests/pressedState.test.ts
- tests/fixtures/live-practice-expectations.json
- .prismatica/flows/practise-todays-recommendation.md
- .prismatica/flows/run-a-session-plan.md
- .prismatica/flows/work-a-pathway-stage.md
- .prismatica/flows/prepare-for-the-next-class.md
- .prismatica/flows/adjust-how-scheduling-works.md

Never touch:

- src/store/syncEngine.ts
- src/store/backup.ts
- src/store/idb.ts
- src/store/notesDrafts.ts
- src/domain/io.ts
- src/domain/migrations*
- scripts/**
- .github/**
- package.json
- package-lock.json
- .prismatica/rules.md
- One item, mode, focus, result and next action; honest focused/whole evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay, protected/unknown/manual/fixed dates and atomic review-row decisions. Class reservation is organisation, never retention evidence.
- Actual elapsed logging, Routine aggregation one block per practised bound item, no feedback requirement, skip versus move-on, overtime, frozen run contents and single unfinished clock protection.
- Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict behaviour, notes ownership and latest non-empty next action.
- Offline local-first storage, schema v17 and all existing migrations/validation, attachment bytes, unfinished-session sync deferral, backups, token secrecy, archive/NAS behaviour. No new persisted collection or schema change is needed.
- Plan manual order and identity, stale-start checks, existing valid budget boundary, default instrument scope, Today doorway order, 44px controls, literal direction-aware sites, mobile viewport/tab/keyboard fixes and only-main scrolling.
- Visual boundary guarantees, claim-once markers, wake-lock lifecycle and wall-clock authority; audio failure must never block practice.
- No general UX audit, NAS/archive/course redesign, CI overhaul, new persistence/migration or speculative scheduling research. Scope globs permit related helper/test work, not unrelated changes.
- No music-production controls, tap-tempo requirement, sound packs, audio analysis, background/lock-screen playback guarantee, practice tempo history or per-item tempo model.
- No automatic redistribution during running practice; no change to the saved Routine from run-preview edits.

## Definition of done

- **ac-1** — Plan and Routine previews: leave/spread/chosen target, repeated remove/transfer, full/no eligible recipients, cancelled choice, all removed, prior unused remainder, role caps, short-on-time/fitted Routine. Literal minute accounting proves no double-spend, no automatic reorder/regeneration and saved routine unchanged; Start uses exactly the preview. Running Skip/Move on/early Finish retain their old accounting. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `preview time choices preserve identity order capacity and unused remainders`
- **ac-2** — Fixed local day: at least two class items and fresh competitors, morning ordinary assessed and Routine not_logged blocks, heavy recent minutes, evening build/regenerate/length change/swap. Every exact required item appears when floors fit; no duplicate id, no lower-priority optional displacement, no false repeat reason. Include manual/protected distant dates, working/keep-fresh and uncommitted/future/passed/archive/unassigned/other-instrument/resting counterexamples; inputs, stored dates and spacing stay untouched. Sweep Today and nextPractice explanations as specified. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `next class work survives morning practice in every evening plan`
- **ac-3** — Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work at 5; several 2-minute parts; explicitly committed parent plus child, only parent, only child, siblings, own-due-review relative, >120 required minutes and equal-date lessons. Prove reserved floors, optional roles yield, exact omitted titles/minimum capacity, explicit partial selection and no silent start. Removal/swap overrides and changed lesson/day/revision invalidate stale coverage acknowledgement without destroying manual order. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `class plan capacity exceptions name omissions before any partial start`
- **ac-4** — Select-clear before Save; save-clear-save; observations retained; repeated saves/retries; multiple items; foreign/deleted block refused atomically. Clearing latest assessed block restores older result or no lastResult when none exists, leaves a newer assessment alone. Exact block minutes/scope, reviews/dates/spacing/readiness unchanged, results visible honestly in item/history/Insights/report consumers. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `routine feedback can be cleared without changing practice or retention`
- **ac-5** — Real UI in Chromium and WebKit: prove quiet-interval autosave without pressing Save for ordinary, Plan and Routine (bound/unbound), then more typing updates the SAME question id without closing or stealing focus. Cover shorter-than-quiet exits; blur/close, navigation and Finish before autosave or while persistence is pending; intermediate boundaries, manual Move on/Skip/Finish, final automatic Routine completion and background catch-up across several boundaries through completion. The open draft/controls and failed/pending recovery remain available, with frozen original item/instrument/lesson ownership. Cover no lesson/unassigned, deliberate lesson choice, changed/deleted/moved/cross-instrument targets, midnight, and saved-question deletion/detachment without resurrection or silent retargeting. Opening/closing blank or whitespace creates nothing. After a non-blank write, clearing to empty/whitespace while pending creates no blank question, preserves the last non-blank record and settles acknowledgement truthfully, never stuck Saving. Inject delayed success/failure after agenda append; edit to newer non-blank text during the earlier write, then autosave/Done/exit/retry and late outcomes. Assert latest words remain editable and are neither overwritten nor cleared/closed by an older acknowledgement; only the relevant acknowledged write may show Saved. Failure retains words/ownership and an actionable retry across internal navigation; retry really writes when memory is unchanged. Repeated autosaves, immediate saves, closes and retries produce exactly one question per capture; a deliberately new capture and a later CloseBlock question stay independent. Reload after acknowledged autosave and after failure/retry restores exact latest acknowledged text, id and ownership once, shown in lesson-id lists/report; do not label unacknowledged or failed text durable. Assert unchanged clock identity/elapsed progression, practice minutes/blocks, Plan/Routine accounting, focus/mode, note drafts, metronome/cue markers, preparations/ranking and retention, allowing only their normal independent progression. Use deterministic state-discriminating cases inside the existing exact unique test; support with focused pure/lifecycle checks where appropriate, never substitute component probes for the reachable UI boundary and pending-write regressions. → proven by `live teacher questions retain capture ownership while practice continues`
- **ac-6** — Controlled audio timeline and fake contexts: bounded tempo edits, start/stop, rapid toggles, denied/rejected/never-settled resume, dead running/suspended/interrupted/closed context, fresh readying tap/test replacement, old callback/remount, pause/finish/discard/navigation/hidden. No orphan scheduled beat, stacked loop or late burst. Cue retains once-only claim and priority/ducking then correct beat cadence, with literal timestamps/levels rather than source assertions; unavailable audio remains usable practice. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `metronome scheduling and cue priority survive sound lifecycle changes`
- **ac-7** — Chromium and WebKit journeys via real UI for ordinary/Plan/Routine, running question input and tempo controls across boundary and keyboard dismissal, stop/resume/reload after a finished run. Assert no extra minutes/blocks, notes remain durable, order/unfinished practice preserved, sound recovery doors work, hidden/paused metronome stops and visual cue remains. Reuse existing harness and conformance/direction/pressed-state checks without weakening them. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. → proven by `live practice tools preserve clocks notes records and mobile controls`
- **ac-8** — One bounded real-practice walkthrough with Setar: MacBook and iPhone Safari plus installed PWA over HTTPS, normal media volume beside the instrument. Check cue clearly distinguishable/audible with and without metronome, comfortable BPM/level edits, boundary priority, sound recovery after idle/interruption and quick teacher capture/keyboard return while timer and beat continue. Record devices/versions/output and actual observations; automation cannot certify speaker volume or musical usability. Only reproducible failures of these promised controls/audibility require adjustment, not an open-ended taste review. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- docs/practice-session-model.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Last checks passed (2026-10-28T23:19:39.287Z). Rework loops so far: 0.

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

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

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

