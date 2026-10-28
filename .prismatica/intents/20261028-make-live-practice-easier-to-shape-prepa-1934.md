---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
title: Make live practice easier to shape, prepare for class and keep in time
state: open
checks:
  - id: ac-1
    description: "Plan and Routine previews: leave/spread/chosen target, repeated
      remove/transfer, full/no eligible recipients, cancelled choice, all
      removed, prior unused remainder, role caps, short-on-time/fitted Routine.
      Literal minute accounting proves no double-spend, no automatic
      reorder/regeneration and saved routine unchanged; Start uses exactly the
      preview. Running Skip/Move on/early Finish retain their old accounting.
      Exact title names one test; use table-driven cases inside it and
      supporting existing regression checks."
    status: unproven
  - id: ac-2
    description: "Fixed local day: at least two class items and fresh competitors,
      morning ordinary assessed and Routine not_logged blocks, heavy recent
      minutes, evening build/regenerate/length change/swap. Every exact required
      item appears when floors fit; no duplicate id, no lower-priority optional
      displacement, no false repeat reason. Include manual/protected distant
      dates, working/keep-fresh and
      uncommitted/future/passed/archive/unassigned/other-instrument/resting
      counterexamples; inputs, stored dates and spacing stay untouched. Sweep
      Today and nextPractice explanations as specified. Exact title names one
      test; use table-driven cases inside it and supporting existing regression
      checks."
    status: unproven
  - id: ac-3
    description: "Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work
      at 5; several 2-minute parts; explicitly committed parent plus child, only
      parent, only child, siblings, own-due-review relative, >120 required
      minutes and equal-date lessons. Prove reserved floors, optional roles
      yield, exact omitted titles/minimum capacity, explicit partial selection
      and no silent start. Removal/swap overrides and changed
      lesson/day/revision invalidate stale coverage acknowledgement without
      destroying manual order. Exact title names one test; use table-driven
      cases inside it and supporting existing regression checks."
    status: unproven
  - id: ac-4
    description: Select-clear before Save; save-clear-save; observations retained;
      repeated saves/retries; multiple items; foreign/deleted block refused
      atomically. Clearing latest assessed block restores older result or no
      lastResult when none exists, leaves a newer assessment alone. Exact block
      minutes/scope, reviews/dates/spacing/readiness unchanged, results visible
      honestly in item/history/Insights/report consumers. Exact title names one
      test; use table-driven cases inside it and supporting existing regression
      checks.
    status: unproven
createdAt: 2026-10-28T18:04:01.770Z
---

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

