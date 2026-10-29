---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
title: Make live practice easier to shape, prepare for class and keep in time
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/58
intent: 20261028-make-live-practice-easier-to-shape-prepa-1934
tier: heavy
stage: review
baseline:
  commit: 66888db74b90e852e33b008dc216d4b24cb04428
  branch: main
branch: change/20261028-make-live-practice-easier-to-shape-prepa-1934
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261028-make-live-practice-easier-to-shape-prepa-1934
builder: claude
planHash: f76aaabf536f1b2a461c1c2713d34a004de059d0f4cf69dd4463244c3c0fac70
allowedPaths:
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
forbiddenPaths:
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
nonGoals:
  - One item, mode, focus, result and next action; honest focused/whole
    evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay,
    protected/unknown/manual/fixed dates and atomic review-row decisions. Class
    reservation is organisation, never retention evidence.
  - Actual elapsed logging, Routine aggregation one block per practised bound
    item, no feedback requirement, skip versus move-on, overtime, frozen run
    contents and single unfinished clock protection.
  - Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict
    behaviour, notes ownership and latest non-empty next action.
  - Offline local-first storage, schema v17 and all existing
    migrations/validation, attachment bytes, unfinished-session sync deferral,
    backups, token secrecy, archive/NAS behaviour. No new persisted collection
    or schema change is needed.
  - Plan manual order and identity, stale-start checks, existing valid budget
    boundary, default instrument scope, Today doorway order, 44px controls,
    literal direction-aware sites, mobile viewport/tab/keyboard fixes and
    only-main scrolling.
  - Visual boundary guarantees, claim-once markers, wake-lock lifecycle and
    wall-clock authority; audio failure must never block practice.
  - No general UX audit, NAS/archive/course redesign, CI overhaul, new
    persistence/migration or speculative scheduling research. Scope globs permit
    related helper/test work, not unrelated changes.
  - No music-production controls, tap-tempo requirement, sound packs, audio
    analysis, background/lock-screen playback guarantee, practice tempo history
    or per-item tempo model.
  - No automatic redistribution during running practice; no change to the saved
    Routine from run-preview edits.
acceptanceChecks:
  - id: ac-1
    description: "Plan and Routine previews: leave/spread/chosen target, repeated
      remove/transfer, full/no eligible recipients, cancelled choice, all
      removed, prior unused remainder, role caps, short-on-time/fitted Routine.
      Literal minute accounting proves no double-spend, no automatic
      reorder/regeneration and saved routine unchanged; Start uses exactly the
      preview. Running Skip/Move on/early Finish retain their old accounting.
      Exact title names one test; use table-driven cases inside it and
      supporting existing regression checks."
    test: preview time choices preserve identity order capacity and unused remainders
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
    test: next class work survives morning practice in every evening plan
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
    test: class plan capacity exceptions name omissions before any partial start
  - id: ac-4
    description: Select-clear before Save; save-clear-save; observations retained;
      repeated saves/retries; multiple items; foreign/deleted block refused
      atomically. Clearing latest assessed block restores older result or no
      lastResult when none exists, leaves a newer assessment alone. Exact block
      minutes/scope, reviews/dates/spacing/readiness unchanged, results visible
      honestly in item/history/Insights/report consumers. Exact title names one
      test; use table-driven cases inside it and supporting existing regression
      checks.
    test: routine feedback can be cleared without changing practice or retention
  - id: ac-5
    description: "Real UI in Chromium and WebKit: prove quiet-interval autosave
      without pressing Save for ordinary, Plan and Routine (bound/unbound), then
      more typing updates the SAME question id without closing or stealing
      focus. Cover shorter-than-quiet exits; blur/close, navigation and Finish
      before autosave or while persistence is pending; intermediate boundaries,
      manual Move on/Skip/Finish, final automatic Routine completion and
      background catch-up across several boundaries through completion. The open
      draft/controls and failed/pending recovery remain available, with frozen
      original item/instrument/lesson ownership. Cover no lesson/unassigned,
      deliberate lesson choice, changed/deleted/moved/cross-instrument targets,
      midnight, and saved-question deletion/detachment without resurrection or
      silent retargeting. Opening/closing blank or whitespace creates nothing.
      After a non-blank write, clearing to empty/whitespace while pending
      creates no blank question, preserves the last non-blank record and settles
      acknowledgement truthfully, never stuck Saving. Inject delayed
      success/failure after agenda append; edit to newer non-blank text during
      the earlier write, then autosave/Done/exit/retry and late outcomes. Assert
      latest words remain editable and are neither overwritten nor
      cleared/closed by an older acknowledgement; only the relevant acknowledged
      write may show Saved. Failure retains words/ownership and an actionable
      retry across internal navigation; retry really writes when memory is
      unchanged. Repeated autosaves, immediate saves, closes and retries produce
      exactly one question per capture; a deliberately new capture and a later
      CloseBlock question stay independent. Reload after acknowledged autosave
      and after failure/retry restores exact latest acknowledged text, id and
      ownership once, shown in lesson-id lists/report; do not label
      unacknowledged or failed text durable. Assert unchanged clock
      identity/elapsed progression, practice minutes/blocks, Plan/Routine
      accounting, focus/mode, note drafts, metronome/cue markers,
      preparations/ranking and retention, allowing only their normal independent
      progression. Use deterministic state-discriminating cases inside the
      existing exact unique test; support with focused pure/lifecycle checks
      where appropriate, never substitute component probes for the reachable UI
      boundary and pending-write regressions."
    test: live teacher questions retain capture ownership while practice continues
  - id: ac-6
    description: "Controlled audio timeline and fake contexts: bounded tempo edits,
      start/stop, rapid toggles, denied/rejected/never-settled resume, dead
      running/suspended/interrupted/closed context, fresh readying tap/test
      replacement, old callback/remount, pause/finish/discard/navigation/hidden.
      No orphan scheduled beat, stacked loop or late burst. Cue retains
      once-only claim and priority/ducking then correct beat cadence, with
      literal timestamps/levels rather than source assertions; unavailable audio
      remains usable practice. Exact title names one test; use table-driven
      cases inside it and supporting existing regression checks."
    test: metronome scheduling and cue priority survive sound lifecycle changes
  - id: ac-7
    description: Chromium and WebKit journeys via real UI for ordinary/Plan/Routine,
      running question input and tempo controls across boundary and keyboard
      dismissal, stop/resume/reload after a finished run. Assert no extra
      minutes/blocks, notes remain durable, order/unfinished practice preserved,
      sound recovery doors work, hidden/paused metronome stops and visual cue
      remains. Reuse existing harness and conformance/direction/pressed-state
      checks without weakening them. Exact title names one test; use
      table-driven cases inside it and supporting existing regression checks.
    test: live practice tools preserve clocks notes records and mobile controls
  - id: ac-8
    description: "One bounded real-practice walkthrough with Setar: MacBook and
      iPhone Safari plus installed PWA over HTTPS, normal media volume beside
      the instrument. Check cue clearly distinguishable/audible with and without
      metronome, comfortable BPM/level edits, boundary priority, sound recovery
      after idle/interruption and quick teacher capture/keyboard return while
      timer and beat continue. Record devices/versions/output and actual
      observations; automation cannot certify speaker volume or musical
      usability. Only reproducible failures of these promised
      controls/audibility require adjustment, not an open-ended taste review."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/practice-session-model.md
  - docs/scheduling-evidence.md
  - docs/setar-practice-reliability.md
createdAt: 2026-10-28T18:04:01.770Z
amendments:
  - at: 2026-10-29T01:06:45.559Z
    reason: Owner requires live teacher questions to autosave without a remembered
      Save; replace the Save-only lifecycle and strengthen ac-5 while preserving
      the existing lane, other accepted families and all three review findings.
    description: "checks: +ac-5|Real UI in Chromium and WebKit: prove quiet-interval
      autosave without pressing Save for ordinary, Plan and Routine
      (bound/unbound), then more typing updates the SAME question id without
      closing or stealing focus. Cover shorter-than-quiet exits; blur/close,
      navigation and Finish before autosave or while persistence is pending;
      intermediate boundaries, manual Move on/Skip/Finish, final automatic
      Routine completion and background catch-up across several boundaries
      through completion. The open draft/controls and failed/pending recovery
      remain available, with frozen original item/instrument/lesson ownership.
      Cover no lesson/unassigned, deliberate lesson choice,
      changed/deleted/moved/cross-instrument targets, midnight, and
      saved-question deletion/detachment without resurrection or silent
      retargeting. Opening/closing blank or whitespace creates nothing. After a
      non-blank write, clearing to empty/whitespace while pending creates no
      blank question, preserves the last non-blank record and settles
      acknowledgement truthfully, never stuck Saving. Inject delayed
      success/failure after agenda append; edit to newer non-blank text during
      the earlier write, then autosave/Done/exit/retry and late outcomes. Assert
      latest words remain editable and are neither overwritten nor
      cleared/closed by an older acknowledgement; only the relevant acknowledged
      write may show Saved. Failure retains words/ownership and an actionable
      retry across internal navigation; retry really writes when memory is
      unchanged. Repeated autosaves, immediate saves, closes and retries produce
      exactly one question per capture; a deliberately new capture and a later
      CloseBlock question stay independent. Reload after acknowledged autosave
      and after failure/retry restores exact latest acknowledged text, id and
      ownership once, shown in lesson-id lists/report; do not label
      unacknowledged or failed text durable. Assert unchanged clock
      identity/elapsed progression, practice minutes/blocks, Plan/Routine
      accounting, focus/mode, note drafts, metronome/cue markers,
      preparations/ranking and retention, allowing only their normal independent
      progression. Use deterministic state-discriminating cases inside the
      existing exact unique test; support with focused pure/lifecycle checks
      where appropriate, never substitute component probes for the reachable UI
      boundary and pending-write regressions.|live teacher questions retain
      capture ownership while practice continues -ac-5|Real ordinary, Plan and
      Routine doors, including unbound segment; save/cancel/blank, no lesson,
      changed/deleted/cross-instrument lesson/item, boundary while typing,
      multiple questions and a later Close question. Assert clock
      identity/elapsed progression, focus and existing note drafts, cue markers
      unchanged. Inject persistence failure after agenda append, retry and
      reload: one question, retained words and truthful saving/failed/saved
      states. Verify lesson-id list/report visibility, unassigned fallback and
      unchanged preparation/ranking. Exact title names one test; use
      table-driven cases inside it and supporting existing regression
      checks.|live teacher questions retain capture ownership while practice
      continues; intent revised"
    intentRevision: >-
      OWNER REQUIREMENT REVISION: durable live teacher-question capture, within
      this existing lane.


      This revision supersedes only the explicit-Save-only capture and non-blank
      Cancel semantics in product rule 4 of the original approved intent.
      Preserve the rest of that intent, the existing lane/issue/baseline, all
      other acceptance families and all three sealed request_changes findings.
      Claude remains the builder. This is rework of the current change, not a
      new lane or a general product review.


      Use one lifecycle for the live question, shared by quiet-interval
      autosave, an optional immediate Save/Done action, retry and exit flushing.
      Reuse lessonAgenda questions, their existing store actions, and actual
      device-persistence acknowledgement. No second notes system, persisted
      draft collection, schema, migration or new dependency is needed. The
      currently allowed component/store/UI/domain/test paths are sufficient;
      choose the smallest complete implementation after inspection. Reuse the
      durable-note timing convention where practical (currently 800 ms), without
      changing item/lesson notes or their journal.


      When a non-blank question is typed, save after a short quiet interval
      without requiring Save, blur or another remembered action. The first write
      creates one independent agenda question. Further autosaves, explicit saves
      and retries for that capture update the same question id. Autosave leaves
      the editor open and editable, preserving focus and words; it does not turn
      each pause in typing into another question. Done may flush and close only
      once the latest applicable non-blank text is acknowledged. Starting
      another question is deliberate; CloseBlock's later question remains
      independent. Merely opening and closing an empty/whitespace capture
      creates nothing. Replace a misleading Cancel after text has been entered
      with the same flush/close lifecycle; closing must not silently discard a
      non-blank thought or undo a question already autosaved.


      Keep ownership frozen from capture opening: instrument, item (absent for
      an unbound Routine segment) and named lesson/default or visibly
      unassigned. The existing explicit lesson choice is deliberate, not
      permission for props, a boundary, a changed day, a later lesson,
      navigation or an async callback to retarget words. Once the question is
      created, edits/retries belong to that id and its established ownership.
      Revalidate before creating it; invalid/deleted/moved/cross-instrument
      targets keep the words with a clear problem and a deliberate valid
      recovery choice, never a guessed replacement. Respect existing agenda
      deletion/detachment rules for saved questions; do not recreate a deleted
      question or attach it to a different item/lesson on retry.


      Apply this to ordinary practice and Plan ActiveBlock, and Routine
      bound/unbound segments. Intermediate Routine transitions, manual Move
      on/Skip/Finish and the final automatic boundary must not lose or retarget
      an open editor. The same applies when wall-clock catch-up after background
      crosses several boundaries or completes the run. Preserve the open capture
      and its useful close/retry controls on Routine complete, including
      pending/failed saves; automatic success must not erase text still being
      edited. Flush the latest non-blank text on app-controlled exit or close,
      including Finish, navigation away and editor unmount. Pending/failed words
      and their retry route must remain recoverable across internal navigation
      rather than disappear with component-local state. Do not delay, pause or
      recalculate practice to wait for question storage. The existing
      result/agenda/return surfaces may provide recovery; no new workflow is
      prescribed.


      Read the current draft directly, never from an old render or a ref
      mirrored later by an effect. A pending write must not own the editor.
      Newer edits must be saved to the same question and must not be cleared,
      overwritten, marked saved or closed by an earlier acknowledgement.
      Coalesce/sequence writes through the one lifecycle; repeated taps,
      autosave plus Done, exit flushing, retry and late/out-of-order outcomes
      must remain idempotent. Each completed attempt must settle truthfully,
      including editing to empty or whitespace while a previous non-blank write
      is pending. Blank text creates no question and does not overwrite/delete
      an existing non-blank question: retain the last written question, settle
      its acknowledgement, and make clear that the empty editor is not a newly
      saved question. Never remain indefinitely Saving after that write has
      answered.


      Saved means IndexedDB acknowledged the relevant text, never just an
      in-memory agenda append. Failure retains the latest words, ownership and
      question identity, shows an actionable failure and allows a retry that
      really writes again even if memory is unchanged. Do not silently close on
      failure or spin an endless retry loop. Acknowledged autosaves and
      acknowledged retries survive reload with exactly one question holding the
      latest acknowledged non-blank words and correct ownership, visible in
      existing lesson-id agenda/report consumers. Test reload against disk, not
      memory. An interrupted or refused device write cannot be claimed durable:
      preserve retry/copy access while the app is alive and accurately
      distinguish any older acknowledged version after reload. There is no
      promise that a forced browser/process termination before acknowledgement
      can retain a write the device refused; do not invent a second persistence
      system to imply that guarantee.


      Preserve all three review findings as required repairs: (1) required-class
      useful floors through preview edits and Start, including the single-row
      swap that currently seats a 10-minute whole work at 5 minutes,
      coverage/partial-start acknowledgement and live run installation; prove it
      within existing ac-3 without reopening its policy; (2) open live-question
      draft and controls surviving automatic final Routine completion,
      bound/unbound and background catch-up; (3) every answered question-save
      acknowledgement settling, especially pending-write edits to
      blank/whitespace. Do not edit away, dismiss or weaken the recorded
      findings.


      Strengthen ac-5 in place, retaining its id and exact unique test title.
      Extend its real-UI family in tests/live-practice.browser.test.ts through
      Chromium and WebKit, with controlled persistence delay/failure and
      deterministic clock/background catch-up where needed. Supporting focused
      pure/state checks may supplement, never replace, reachable UI lifecycle
      proof. Replace assertions that encode superseded Save-only/Cancel
      behaviour. Update the existing family proof map and relevant capture
      guidance in docs/practice-session-model.md, AGENTS.md and DECISIONS.md;
      reconcile only affected existing Flow proposals through the normal
      protocol, never signed truth by hand. Document independently expected
      question ids/text/ownership and the saved-on-device boundary. Sweep
      existing agenda/list/report consumers and any callers of a shared
      acknowledgement helper actually changed; report unchanged consumers
      checked clean. All other acceptance descriptions, scope restrictions, full
      configured gates and the bounded owner device walkthrough remain as
      approved. Timer identity and elapsed logging, Plan/Routine accounting and
      practice records, metronome, cue claims/wake lock, focus/mode,
      notes/drafts, preparations/ranking and retention remain unaffected by
      question capture. Do not reopen unrelated accepted families.
---

# Make live practice easier to shape, prepare for class and keep in time

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/58
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 66888db74b90e852e33b008dc216d4b24cb04428 on main _(never re-baselined)_
- **Intent:** 20261028-make-live-practice-easier-to-shape-prepa-1934

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

## You may only change

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

## Never touch

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

## Non-goals

- One item, mode, focus, result and next action; honest focused/whole evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay, protected/unknown/manual/fixed dates and atomic review-row decisions. Class reservation is organisation, never retention evidence.
- Actual elapsed logging, Routine aggregation one block per practised bound item, no feedback requirement, skip versus move-on, overtime, frozen run contents and single unfinished clock protection.
- Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict behaviour, notes ownership and latest non-empty next action.
- Offline local-first storage, schema v17 and all existing migrations/validation, attachment bytes, unfinished-session sync deferral, backups, token secrecy, archive/NAS behaviour. No new persisted collection or schema change is needed.
- Plan manual order and identity, stale-start checks, existing valid budget boundary, default instrument scope, Today doorway order, 44px controls, literal direction-aware sites, mobile viewport/tab/keyboard fixes and only-main scrolling.
- Visual boundary guarantees, claim-once markers, wake-lock lifecycle and wall-clock authority; audio failure must never block practice.
- No general UX audit, NAS/archive/course redesign, CI overhaul, new persistence/migration or speculative scheduling research. Scope globs permit related helper/test work, not unrelated changes.
- No music-production controls, tap-tempo requirement, sound packs, audio analysis, background/lock-screen playback guarantee, practice tempo history or per-item tempo model.
- No automatic redistribution during running practice; no change to the saved Routine from run-preview edits.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Plan and Routine previews: leave/spread/chosen target, repeated remove/transfer, full/no eligible recipients, cancelled choice, all removed, prior unused remainder, role caps, short-on-time/fitted Routine. Literal minute accounting proves no double-spend, no automatic reorder/regeneration and saved routine unchanged; Start uses exactly the preview. Running Skip/Move on/early Finish retain their old accounting. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: preview time choices preserve identity order capacity and unused remainders)_
- [ ] **ac-2** — Fixed local day: at least two class items and fresh competitors, morning ordinary assessed and Routine not_logged blocks, heavy recent minutes, evening build/regenerate/length change/swap. Every exact required item appears when floors fit; no duplicate id, no lower-priority optional displacement, no false repeat reason. Include manual/protected distant dates, working/keep-fresh and uncommitted/future/passed/archive/unassigned/other-instrument/resting counterexamples; inputs, stored dates and spacing stay untouched. Sweep Today and nextPractice explanations as specified. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: next class work survives morning practice in every evening plan)_
- [ ] **ac-3** — Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work at 5; several 2-minute parts; explicitly committed parent plus child, only parent, only child, siblings, own-due-review relative, >120 required minutes and equal-date lessons. Prove reserved floors, optional roles yield, exact omitted titles/minimum capacity, explicit partial selection and no silent start. Removal/swap overrides and changed lesson/day/revision invalidate stale coverage acknowledgement without destroying manual order. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: class plan capacity exceptions name omissions before any partial start)_
- [ ] **ac-4** — Select-clear before Save; save-clear-save; observations retained; repeated saves/retries; multiple items; foreign/deleted block refused atomically. Clearing latest assessed block restores older result or no lastResult when none exists, leaves a newer assessment alone. Exact block minutes/scope, reviews/dates/spacing/readiness unchanged, results visible honestly in item/history/Insights/report consumers. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: routine feedback can be cleared without changing practice or retention)_
- [ ] **ac-5** — Real UI in Chromium and WebKit: prove quiet-interval autosave without pressing Save for ordinary, Plan and Routine (bound/unbound), then more typing updates the SAME question id without closing or stealing focus. Cover shorter-than-quiet exits; blur/close, navigation and Finish before autosave or while persistence is pending; intermediate boundaries, manual Move on/Skip/Finish, final automatic Routine completion and background catch-up across several boundaries through completion. The open draft/controls and failed/pending recovery remain available, with frozen original item/instrument/lesson ownership. Cover no lesson/unassigned, deliberate lesson choice, changed/deleted/moved/cross-instrument targets, midnight, and saved-question deletion/detachment without resurrection or silent retargeting. Opening/closing blank or whitespace creates nothing. After a non-blank write, clearing to empty/whitespace while pending creates no blank question, preserves the last non-blank record and settles acknowledgement truthfully, never stuck Saving. Inject delayed success/failure after agenda append; edit to newer non-blank text during the earlier write, then autosave/Done/exit/retry and late outcomes. Assert latest words remain editable and are neither overwritten nor cleared/closed by an older acknowledgement; only the relevant acknowledged write may show Saved. Failure retains words/ownership and an actionable retry across internal navigation; retry really writes when memory is unchanged. Repeated autosaves, immediate saves, closes and retries produce exactly one question per capture; a deliberately new capture and a later CloseBlock question stay independent. Reload after acknowledged autosave and after failure/retry restores exact latest acknowledged text, id and ownership once, shown in lesson-id lists/report; do not label unacknowledged or failed text durable. Assert unchanged clock identity/elapsed progression, practice minutes/blocks, Plan/Routine accounting, focus/mode, note drafts, metronome/cue markers, preparations/ranking and retention, allowing only their normal independent progression. Use deterministic state-discriminating cases inside the existing exact unique test; support with focused pure/lifecycle checks where appropriate, never substitute component probes for the reachable UI boundary and pending-write regressions. _(proof: live teacher questions retain capture ownership while practice continues)_
- [ ] **ac-6** — Controlled audio timeline and fake contexts: bounded tempo edits, start/stop, rapid toggles, denied/rejected/never-settled resume, dead running/suspended/interrupted/closed context, fresh readying tap/test replacement, old callback/remount, pause/finish/discard/navigation/hidden. No orphan scheduled beat, stacked loop or late burst. Cue retains once-only claim and priority/ducking then correct beat cadence, with literal timestamps/levels rather than source assertions; unavailable audio remains usable practice. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: metronome scheduling and cue priority survive sound lifecycle changes)_
- [ ] **ac-7** — Chromium and WebKit journeys via real UI for ordinary/Plan/Routine, running question input and tempo controls across boundary and keyboard dismissal, stop/resume/reload after a finished run. Assert no extra minutes/blocks, notes remain durable, order/unfinished practice preserved, sound recovery doors work, hidden/paused metronome stops and visual cue remains. Reuse existing harness and conformance/direction/pressed-state checks without weakening them. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: live practice tools preserve clocks notes records and mobile controls)_
- [ ] **ac-8** — One bounded real-practice walkthrough with Setar: MacBook and iPhone Safari plus installed PWA over HTTPS, normal media volume beside the instrument. Check cue clearly distinguishable/audible with and without metronome, comfortable BPM/level edits, boundary priority, sound recovery after idle/interruption and quick teacher capture/keyboard return while timer and beat continue. Record devices/versions/output and actual observations; automation cannot certify speaker volume or musical usability. Only reproducible failures of these promised controls/audibility require adjustment, not an open-ended taste review. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/practice-session-model.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Amendments

- 2026-10-29T01:06:45.559Z — Owner requires live teacher questions to autosave without a remembered Save; replace the Save-only lifecycle and strengthen ac-5 while preserving the existing lane, other accepted families and all three review findings.: checks: +ac-5|Real UI in Chromium and WebKit: prove quiet-interval autosave without pressing Save for ordinary, Plan and Routine (bound/unbound), then more typing updates the SAME question id without closing or stealing focus. Cover shorter-than-quiet exits; blur/close, navigation and Finish before autosave or while persistence is pending; intermediate boundaries, manual Move on/Skip/Finish, final automatic Routine completion and background catch-up across several boundaries through completion. The open draft/controls and failed/pending recovery remain available, with frozen original item/instrument/lesson ownership. Cover no lesson/unassigned, deliberate lesson choice, changed/deleted/moved/cross-instrument targets, midnight, and saved-question deletion/detachment without resurrection or silent retargeting. Opening/closing blank or whitespace creates nothing. After a non-blank write, clearing to empty/whitespace while pending creates no blank question, preserves the last non-blank record and settles acknowledgement truthfully, never stuck Saving. Inject delayed success/failure after agenda append; edit to newer non-blank text during the earlier write, then autosave/Done/exit/retry and late outcomes. Assert latest words remain editable and are neither overwritten nor cleared/closed by an older acknowledgement; only the relevant acknowledged write may show Saved. Failure retains words/ownership and an actionable retry across internal navigation; retry really writes when memory is unchanged. Repeated autosaves, immediate saves, closes and retries produce exactly one question per capture; a deliberately new capture and a later CloseBlock question stay independent. Reload after acknowledged autosave and after failure/retry restores exact latest acknowledged text, id and ownership once, shown in lesson-id lists/report; do not label unacknowledged or failed text durable. Assert unchanged clock identity/elapsed progression, practice minutes/blocks, Plan/Routine accounting, focus/mode, note drafts, metronome/cue markers, preparations/ranking and retention, allowing only their normal independent progression. Use deterministic state-discriminating cases inside the existing exact unique test; support with focused pure/lifecycle checks where appropriate, never substitute component probes for the reachable UI boundary and pending-write regressions.|live teacher questions retain capture ownership while practice continues -ac-5|Real ordinary, Plan and Routine doors, including unbound segment; save/cancel/blank, no lesson, changed/deleted/cross-instrument lesson/item, boundary while typing, multiple questions and a later Close question. Assert clock identity/elapsed progression, focus and existing note drafts, cue markers unchanged. Inject persistence failure after agenda append, retry and reload: one question, retained words and truthful saving/failed/saved states. Verify lesson-id list/report visibility, unassigned fallback and unchanged preparation/ranking. Exact title names one test; use table-driven cases inside it and supporting existing regression checks.|live teacher questions retain capture ownership while practice continues; intent revised

