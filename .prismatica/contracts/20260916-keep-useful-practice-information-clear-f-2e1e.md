---
id: 20260916-keep-useful-practice-information-clear-f-2e1e
title: Keep useful practice information clear from capture to next time
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/24
intent: 20260916-keep-useful-practice-information-clear-f-2e1e
tier: heavy
stage: ship
baseline:
  commit: d014293c205958f45e4393ebf6ae56901db83a1c
  branch: main
branch: change/20260916-keep-useful-practice-information-clear-f-2e1e
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260916-keep-useful-practice-information-clear-f-2e1e
builder: claude
planHash: ebd7d96aeddf18bbec0cf042bfbb5b32a0753cde5427ee09bcad4ab6e93d53b1
allowedPaths:
  - src/domain/types.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/io.ts
  - src/domain/io.test.ts
  - src/domain/factories.ts
  - src/domain/seed.ts
  - src/domain/seedMigration.test.ts
  - src/domain/blocks.ts
  - src/domain/blocks.test.ts
  - src/domain/labels.ts
  - src/domain/defaults.ts
  - src/domain/scheduling.ts
  - src/domain/scheduling.test.ts
  - src/domain/questions.ts
  - src/domain/questions.test.ts
  - src/domain/report.ts
  - src/domain/report.test.ts
  - src/domain/insights.ts
  - src/domain/insights.test.ts
  - src/domain/practiceInformation.ts
  - src/domain/practiceInformation.test.ts
  - src/domain/index.ts
  - src/store/useStore.ts
  - src/store/backup.ts
  - src/store/idb.ts
  - src/components/ItemNotes.tsx
  - src/components/ItemForm.tsx
  - src/components/itemFormValues.ts
  - src/components/itemFields.ts
  - src/components/ItemCard.tsx
  - src/components/ClassQuestions.tsx
  - src/components/format.ts
  - src/components/format.test.ts
  - src/components/direction.test.ts
  - src/components/ui.tsx
  - src/components/useDecisionNow.ts
  - src/pages/NewItem.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/StartBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/Lessons.tsx
  - src/pages/TeacherReport.tsx
  - src/pages/Insights.tsx
  - src/pages/Settings.tsx
  - src/styles/global.css
  - tests/practiceBrowser.ts
  - tests/practice-information.browser.test.ts
  - tests/review-ownership.browser.test.ts
  - tests/practice-information-inbound.browser.test.ts
  - tests/practice-information-layout.browser.test.ts
  - tests/daily-practice.browser.test.ts
  - tests/lesson-agenda.browser.test.ts
  - tests/fixtures/practice-information-v12.json
  - tests/fixtures/practice-information-v13.json
  - AGENTS.md
  - README.md
  - DECISIONS.md
  - docs/product-spec.md
  - docs/scheduling-evidence.md
forbiddenPaths:
  - src/components/useViewportGuard.ts
  - src/components/screenAwake.ts
  - src/components/useScreenAwake.ts
  - src/domain/practiceSignal.ts
  - src/domain/practiceSession.ts
  - src/domain/plan.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/lessonAgenda.ts
  - src/domain/farsi.ts
  - src/domain/sync.ts
  - src/store/syncEngine.ts
  - src/store/gitRemote.ts
  - src/store/githubSync.ts
  - src/store/revision.ts
  - src/components/Layout.tsx
  - package.json
  - package-lock.json
  - vite.config.ts
  - .github/**
nonGoals:
  - One item, one mode, one focus, one result, one next action. Title-only quick
    creation, under-30-second start and under-60-second close, deliberate
    unlogged escape; no new required metadata.
  - "The shipped session planner: deterministic eligibility/build/swap parity,
    short-session behaviour, warm-up inside budget, exposure/variety maths,
    urgent work, instrument scoping, stable tie-breaks and stale-plan
    protection. Today Plan and Routines remain peer doorways above the
    recommendation."
  - The shipped scheduling equations, numerical parameters and
    scientific-evidence limits. Same is not failed retention; early success
    never advances spacing; manual protection changes only by explicit date/mode
    ownership intent; once-per-local-day advancement remains.
  - Lesson-specific preparation and independent question targets, unassigned
    intent, asked/answer history, detach semantics, copy fallback and no
    question-derived urgency.
  - Practice timing, Finish freezing elapsed time, stale-duration proposal,
    running/paused/reload semantics, routine allocation, wake-lock ownership and
    signals. Editing notes cannot create, finish or pause practice.
  - Local/offline-first IndexedDB, whole-snapshot hash-based sync,
    active-session and revision guards, visible deferral/retry, explicit
    conflicts with archives, cold-start refusal/recovery and newer-schema
    refusal.
  - Farsi search, NAS references and media ownership, large-file policy,
    existing direction/contrast improvements, safe-area and input sizing. No
    backend, account, paid service, AI/audio grading, gamification or quotas.
  - No database reset, fake records, invented results or silent loss of
    meaningful new text. Owner-authorised retirement applies only to the
    enumerated dummy legacy practice-text fields. Preserve every practice block
    and its identity, duration, result and timestamps.
  - No generic testing framework, generic note/task system, useStore slice
    refactor or broad mobile-layout rewrite.
  - "Already shipped: early/repeated-review correction, same/worse distinction,
    dormant eligibility, minutes-based exposure, varied session planning,
    lesson-specific agenda migration, clipboard fallback, Farsi search,
    NAS/material work, stale-session proposed minutes, calendar totals,
    unfinished-practice sync protection, cold-start recovery and the large
    direction/contrast lane. Retest their invariants, do not reimplement them."
  - "Actual iPhone keyboard displacement/overlap and the Safari-only
    question-alignment symptom: current Chromium view did not reproduce them;
    source leaves several plausible causes. Perform the specified OWNER
    diagnostic before prescribing a separate device fix. No timeout guess and no
    dependency blocking this lane."
  - "General item relationship validation, self-parent/cycles, cross-instrument
    family identity cleanup and dangling non-agenda refs: still open in current
    code, high trust but less frequent than notes; defer to a coherent
    graph-integrity lane. Do not drop hidden family identity to conceal the
    issue."
  - "Archive-versus-delete lifecycle: current permanent deletion is explicitly
    confirmed and destroys block history; Resting already provides a
    non-destructive way to set an item aside. Changing archival semantics needs
    a separate owner decision and must not piggyback on this text migration."
  - "Broad inbound invariant framework: only this lane's surviving text and
    full-backup transport boundary are added. Existing v12 agenda/scheduling
    validation stays. No speculative validate-everything subsystem."
  - "Global live-clock sweep across untouched Repertoire/Lessons/report pages:
    source still contains mount-frozen clocks. Fix only touched decision
    controls/current context where required by these acceptance families; defer
    unrelated date displays."
  - "Full status/proficiency/lifecycle split, inferred difficulty, grading
    redesign, review algorithm replacement and new musical category quotas:
    owner chose clarified existing semantics."
  - "General sync copy cleanup and Settings reorganisation: newest-copy wording
    remains misleading, but changing unrelated sync UI is not the selected
    thesis. Settings edits here are limited to practice-choice and
    review-ownership explanations."
  - "New routine/hands-free canonical Flow project: current existing Flows
    already carry relevant mechanics. Update changed practice mechanics through
    normal governance; do not invent duplicate journeys."
  - Global accessibility sweep, universal typography/direction repair, generic
    rich text, notation tools, media viewers and history editing/deletion
    features. Address accessible names and real rendering only on affected
    surfaces.
  - "Desired rule (not yet truth): Persistent Working notes belong to an item;
    Observation and Next time belong to a recorded block; teacher questions
    belong to the existing lesson agenda. Each is used where its lifetime is
    meaningful, without copying one into another automatically."
  - "Desired rule (not yet truth): Editing practice information never changes
    elapsed time, running state, practice counts, results or spaced-repetition
    state. A bound routine change cannot transfer text between items."
  - "Desired rule (not yet truth): An explicit administrative transfer to
    automatic review management retains the pending date and spacing state; only
    subsequent eligible real practice supplies retention evidence. Ordinary item
    edits do not release custom-date protection."
  - "Desired rule (not yet truth): The v13 dummy-text retirement exception is
    enumerated and one-way. Meaningful canonical text and non-text practice
    history remain protected by the real validation, persistence and recovery
    boundaries."
acceptanceChecks:
  - id: ac-1
    description: "A1 / C1. Pure migration: exercise v12, older supported through the
      existing chain, current v13, mixed/partially retired objects and repeated
      execution. Assert exact retired-key absence and exact preservation of
      canonical Notes/Observation/Next time/questions, identity metadata, all
      non-text block/review/agenda/routine/settings facts. Include empty
      strings, absent family blocks and both retained/retired keys. New
      catalogue items retain both entry.notes and entry.about guidance. Opposite
      case: current canonical text is never reset on a second migration."
    test: practice text retirement removes only authorised legacy fields and is
      idempotent
  - id: ac-2
    description: C2. Pure validation discriminates absent/empty/valid multilingual
      strings from numbers, arrays and objects in surviving item/block text.
      Errors identify the offending record. Keep existing invalid-date/reference
      and newer-schema refusal. Do not confuse retired dummy fields with
      malformed surviving canonical fields.
    test: practice text validation rejects malformed canonical values without
      coercion
  - id: ac-3
    description: "C3. Real IndexedDB hydration in disposable browser: v12 migration,
      already-current v13 merge, partial leftovers and persisted unfinished
      observation; invalid canonical/unfinished text, too-new schema and invalid
      recovery file. Compare raw stored bytes before/after refusal, drive the
      rendered cold-start recovery control with a valid file, reload and verify
      recovery; newer-schema UI has no downgrade control. Existing
      paused-on-reload timing remains."
    test: practice information hydration and rendered recovery enforce the same
      schema boundary
  - id: ac-4
    description: C3/C4. Invoke real Settings import plus actual sync pull, Keep
      remote and archive restore orchestrators using isolated existing transport
      ports. Matrix valid old/current data, invalid canonical text, files wrong
      type, malformed/duplicate ids, invalid base64/ownership, omitted/orphan
      bytes. Check live/persisted DB and blob bytes before/after, not only
      return values. files absent preserves local bytes; valid files
      empty/nonempty replaces honestly. Include unfinished and revision-changed
      refusal; no weakening of existing late-guard semantics. Valid
      import/reload/export/reimport retains canonical model. Cold recovery is
      covered separately above. Include duplicate attachment metadata ids as
      well as duplicate payload ids. Mock the existing network/module transport
      boundary around actual githubSync entry points where needed; calling only
      runSync with a fake installer is not proof of real installation wiring.
    test: practice information replacement doors reject invalid data before database
      or blob replacement
  - id: ac-5
    description: "C5. Disposable exact-baseline v12 app and new v13 app: export full
      v12 fixture with a real small attachment, upgrade/import it, export v13,
      prove old app refuses v13 without altering bytes, then restore the
      retained v12 export and open/read the attachment. A post-upgrade test
      block exists only in the retained v13 export, making rollback limitations
      explicit. No checked-in old app bundle or real owner data modification."
    test: practice information rollback restores the original backup without
      pretending to downgrade new history
  - id: ac-6
    description: A2. Render real Item Detail and Active at desktop/390px. Edit the
      same notebook while running and paused, with timer ticks, offline mode,
      navigation, Finish/return and Discard; verify notes survive and active
      clock identifiers/running/elapsed semantics, blocks/reviews/sr state stay
      unchanged by editing. Clear notes and reload; no resurrection. Inspect
      actual IndexedDB acknowledgement, not a sleep. Reject a storage write
      through the real storage seam and verify text remains visible with
      retry/copy and no false Saved state.
    test: working notes persist across practice navigation without controlling the
      clock
  - id: ac-7
    description: "A2/A3. Render a bound routine, edit item A while time naturally
      crosses to B, also exercise Skip, unbound and missing-item segments. Notes
      never land on the wrong item; routine elapsed/allocation/signals keep
      existing behaviour and no extra blocks appear. Also switch Item Detail
      route A to B and replace same-id data while the app is running: a stale
      editor must not overwrite new content on blur. Test Farsi and English
      text."
    test: working note editors retain item ownership across routine and database
      changes
  - id: ac-8
    description: "A4. Real Active to Close to next Active journey: distinct
      notebook, scratch Observation, Next time and lesson Question; choose
      result and close, inspect persisted records, reload, inspect older block
      history via disclosure and next-session previous decision. Notebook is not
      overwritten by reflection; questions stay independent and do not change
      preparation. Empty later nextAction preserves earlier non-empty choice.
      Deliberate unlogged close preserves schedule; Close across a local-day
      change retains authored text while refreshing the existing decision."
    test: practice reflection keeps notebook observation next action and question
      distinct
  - id: ac-9
    description: "A5/A6. Pure consumer cases plus rendered/exported teacher sheet:
      later block results and current notes/status change after a selected
      historical period; period result statements stay based on in-range blocks,
      current sections are labelled, and no unproved improvement is inferred
      from absolute ranks. Question output retains targets/asked answers and
      latest-observation date but never dumps Working notes as Problem or
      rewrites past answers. Include no-block/unlogged/older-observation cases
      and ordinary/DST local date boundaries for the selected report period."
    test: practice summaries separate recorded period evidence from current context
  - id: ac-10
    description: "B1-B4. Drive full item create/edit and Start with all retained
      status/result/mode/focus enums represented in a definition table; verify
      default summaries, reachable optional controls, accessible names, distinct
      descriptions, retained rating values and title-only quick add. Pin
      representative priority, urgency-factor, warm-up eligibility and
      scheduling outputs against current fixtures, including 1/3/5
      effort/priority and Same versus Worse. A label change may not alter stored
      codes, weights, defaults or status transition behaviour. Include a
      new-status item with real blocks versus a truly untouched catalogue
      addition: wording is honest in both, with no automatic status or history
      mutation."
    test: clarified practice choices preserve existing defaults and decision inputs
  - id: ac-11
    description: "D1/D2. Pure administrative transition matrix: auto/user/unknown
      provenance; auto/manual/interval mode; future/due/past/no date;
      zero/matching/multiple agreeing/conflicting open rows; missing item;
      repeated execution. Retain pending date, normalise only explicit
      authority, preserve every sr/stat/block/completed-review fact. Restore
      missing reminder only when an item date exists; refuse ambiguous pending
      dates; no-date transfer stays unscheduled. Review today is separate and
      records no result."
    test: automatic review ownership transfer preserves dates without inventing
      evidence
  - id: ac-12
    description: "D3. Real Item Detail and full edit form: explicit transfer on
      already-auto custom/snoozed/unknown date, actual manual/interval to auto
      transition, and unrelated save while already auto. Assert identical
      intended outcomes and protected-date preservation on unrelated saves
      through live and persisted state after reload. Reopen/switch
      items/external live update while panel exists to rule out stale captured
      dates. Conflicting rows show actionable refusal; no-date auto remains
      unscheduled until explicit Review today. Button explanation never calls
      the retained date a new engine calculation."
    test: review ownership controls distinguish explicit transfer from ordinary item
      edits
  - id: ac-13
    description: D4. Real UI transfer future custom date, then actual practice early
      with Same, positive and Worse in isolated scenarios; assert persisted due
      rows/item date, no early spacing expansion and repair only after worse.
      Change custom date/snooze/Schedule again re-establishes user protection.
      Exercise due eligible close, No, unanswered/unlogged and repeated same-day
      eligible close. Let browser clock cross local midnight before Review today
      or a displayed date action, without synthetic visibility events, and check
      displayed/saved date and Today/Close explanations.
    test: released review dates obey the shipped early practice and local day rules
  - id: ac-14
    description: E1. Render changed note, item-form, Start, Close, routine-note,
      history and question-context surfaces at 390x844 and desktop in Chromium
      and WebKit. Install the matching existing Playwright browser binaries
      during setup if needed; do not silently skip an engine or report a skipped
      layout case as passing. Use Farsi, English, mixed paragraphs,
      opposite-language titles and long text. Assert own accessible names,
      selected states, keyboard activation, visible focus and actual
      text/ordinal bounding positions, no clipping/overlap/horizontal overflow,
      minimum editable font size and reduced-motion behaviour. This is browser
      rendering proof, not a claim to reproduce a physical iPhone keyboard; do
      not replace it with source regex.
    test: practice information controls render accessible directional text at phone
      and desktop widths
  - id: ac-15
    description: "OWNER subjective usability on the actual iPhone and Mac: a normal
      start stays under 30 seconds and close under 60; reading/editing Working
      notes during ordinary and bound-routine practice remains calm, clearly
      separate from block observation, and controls remain reachable with the
      keyboard. Verify understandable status/result/rating definitions and the
      retained-date automatic explanation. Record actual Farsi/English
      observations. Known residual shell/Safari symptom is separately diagnosed,
      not silently declared fixed and not cured with an untested timeout."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - README.md
  - DECISIONS.md
  - docs/product-spec.md
  - docs/scheduling-evidence.md
createdAt: 2026-09-16T00:36:48.753Z
amendments: []
---

# Keep useful practice information clear from capture to next time

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/24
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** d014293c205958f45e4393ebf6ae56901db83a1c on main _(never re-baselined)_
- **Intent:** 20260916-keep-useful-practice-information-clear-f-2e1e

## You may only change

- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/factories.ts
- src/domain/seed.ts
- src/domain/seedMigration.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/domain/labels.ts
- src/domain/defaults.ts
- src/domain/scheduling.ts
- src/domain/scheduling.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/report.ts
- src/domain/report.test.ts
- src/domain/insights.ts
- src/domain/insights.test.ts
- src/domain/practiceInformation.ts
- src/domain/practiceInformation.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/store/idb.ts
- src/components/ItemNotes.tsx
- src/components/ItemForm.tsx
- src/components/itemFormValues.ts
- src/components/itemFields.ts
- src/components/ItemCard.tsx
- src/components/ClassQuestions.tsx
- src/components/format.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/components/ui.tsx
- src/components/useDecisionNow.ts
- src/pages/NewItem.tsx
- src/pages/ItemDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- src/pages/Insights.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- tests/practiceBrowser.ts
- tests/practice-information.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/fixtures/practice-information-v12.json
- tests/fixtures/practice-information-v13.json
- AGENTS.md
- README.md
- DECISIONS.md
- docs/product-spec.md
- docs/scheduling-evidence.md

## Never touch

- src/components/useViewportGuard.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/domain/practiceSignal.ts
- src/domain/practiceSession.ts
- src/domain/plan.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/lessonAgenda.ts
- src/domain/farsi.ts
- src/domain/sync.ts
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/store/githubSync.ts
- src/store/revision.ts
- src/components/Layout.tsx
- package.json
- package-lock.json
- vite.config.ts
- .github/**

## Non-goals

- One item, one mode, one focus, one result, one next action. Title-only quick creation, under-30-second start and under-60-second close, deliberate unlogged escape; no new required metadata.
- The shipped session planner: deterministic eligibility/build/swap parity, short-session behaviour, warm-up inside budget, exposure/variety maths, urgent work, instrument scoping, stable tie-breaks and stale-plan protection. Today Plan and Routines remain peer doorways above the recommendation.
- The shipped scheduling equations, numerical parameters and scientific-evidence limits. Same is not failed retention; early success never advances spacing; manual protection changes only by explicit date/mode ownership intent; once-per-local-day advancement remains.
- Lesson-specific preparation and independent question targets, unassigned intent, asked/answer history, detach semantics, copy fallback and no question-derived urgency.
- Practice timing, Finish freezing elapsed time, stale-duration proposal, running/paused/reload semantics, routine allocation, wake-lock ownership and signals. Editing notes cannot create, finish or pause practice.
- Local/offline-first IndexedDB, whole-snapshot hash-based sync, active-session and revision guards, visible deferral/retry, explicit conflicts with archives, cold-start refusal/recovery and newer-schema refusal.
- Farsi search, NAS references and media ownership, large-file policy, existing direction/contrast improvements, safe-area and input sizing. No backend, account, paid service, AI/audio grading, gamification or quotas.
- No database reset, fake records, invented results or silent loss of meaningful new text. Owner-authorised retirement applies only to the enumerated dummy legacy practice-text fields. Preserve every practice block and its identity, duration, result and timestamps.
- No generic testing framework, generic note/task system, useStore slice refactor or broad mobile-layout rewrite.
- Already shipped: early/repeated-review correction, same/worse distinction, dormant eligibility, minutes-based exposure, varied session planning, lesson-specific agenda migration, clipboard fallback, Farsi search, NAS/material work, stale-session proposed minutes, calendar totals, unfinished-practice sync protection, cold-start recovery and the large direction/contrast lane. Retest their invariants, do not reimplement them.
- Actual iPhone keyboard displacement/overlap and the Safari-only question-alignment symptom: current Chromium view did not reproduce them; source leaves several plausible causes. Perform the specified OWNER diagnostic before prescribing a separate device fix. No timeout guess and no dependency blocking this lane.
- General item relationship validation, self-parent/cycles, cross-instrument family identity cleanup and dangling non-agenda refs: still open in current code, high trust but less frequent than notes; defer to a coherent graph-integrity lane. Do not drop hidden family identity to conceal the issue.
- Archive-versus-delete lifecycle: current permanent deletion is explicitly confirmed and destroys block history; Resting already provides a non-destructive way to set an item aside. Changing archival semantics needs a separate owner decision and must not piggyback on this text migration.
- Broad inbound invariant framework: only this lane's surviving text and full-backup transport boundary are added. Existing v12 agenda/scheduling validation stays. No speculative validate-everything subsystem.
- Global live-clock sweep across untouched Repertoire/Lessons/report pages: source still contains mount-frozen clocks. Fix only touched decision controls/current context where required by these acceptance families; defer unrelated date displays.
- Full status/proficiency/lifecycle split, inferred difficulty, grading redesign, review algorithm replacement and new musical category quotas: owner chose clarified existing semantics.
- General sync copy cleanup and Settings reorganisation: newest-copy wording remains misleading, but changing unrelated sync UI is not the selected thesis. Settings edits here are limited to practice-choice and review-ownership explanations.
- New routine/hands-free canonical Flow project: current existing Flows already carry relevant mechanics. Update changed practice mechanics through normal governance; do not invent duplicate journeys.
- Global accessibility sweep, universal typography/direction repair, generic rich text, notation tools, media viewers and history editing/deletion features. Address accessible names and real rendering only on affected surfaces.
- Desired rule (not yet truth): Persistent Working notes belong to an item; Observation and Next time belong to a recorded block; teacher questions belong to the existing lesson agenda. Each is used where its lifetime is meaningful, without copying one into another automatically.
- Desired rule (not yet truth): Editing practice information never changes elapsed time, running state, practice counts, results or spaced-repetition state. A bound routine change cannot transfer text between items.
- Desired rule (not yet truth): An explicit administrative transfer to automatic review management retains the pending date and spacing state; only subsequent eligible real practice supplies retention evidence. Ordinary item edits do not release custom-date protection.
- Desired rule (not yet truth): The v13 dummy-text retirement exception is enumerated and one-way. Meaningful canonical text and non-text practice history remain protected by the real validation, persistence and recovery boundaries.

## Acceptance checks (definition of done)

- [ ] **ac-1** — A1 / C1. Pure migration: exercise v12, older supported through the existing chain, current v13, mixed/partially retired objects and repeated execution. Assert exact retired-key absence and exact preservation of canonical Notes/Observation/Next time/questions, identity metadata, all non-text block/review/agenda/routine/settings facts. Include empty strings, absent family blocks and both retained/retired keys. New catalogue items retain both entry.notes and entry.about guidance. Opposite case: current canonical text is never reset on a second migration. _(proof: practice text retirement removes only authorised legacy fields and is idempotent)_
- [ ] **ac-2** — C2. Pure validation discriminates absent/empty/valid multilingual strings from numbers, arrays and objects in surviving item/block text. Errors identify the offending record. Keep existing invalid-date/reference and newer-schema refusal. Do not confuse retired dummy fields with malformed surviving canonical fields. _(proof: practice text validation rejects malformed canonical values without coercion)_
- [ ] **ac-3** — C3. Real IndexedDB hydration in disposable browser: v12 migration, already-current v13 merge, partial leftovers and persisted unfinished observation; invalid canonical/unfinished text, too-new schema and invalid recovery file. Compare raw stored bytes before/after refusal, drive the rendered cold-start recovery control with a valid file, reload and verify recovery; newer-schema UI has no downgrade control. Existing paused-on-reload timing remains. _(proof: practice information hydration and rendered recovery enforce the same schema boundary)_
- [ ] **ac-4** — C3/C4. Invoke real Settings import plus actual sync pull, Keep remote and archive restore orchestrators using isolated existing transport ports. Matrix valid old/current data, invalid canonical text, files wrong type, malformed/duplicate ids, invalid base64/ownership, omitted/orphan bytes. Check live/persisted DB and blob bytes before/after, not only return values. files absent preserves local bytes; valid files empty/nonempty replaces honestly. Include unfinished and revision-changed refusal; no weakening of existing late-guard semantics. Valid import/reload/export/reimport retains canonical model. Cold recovery is covered separately above. Include duplicate attachment metadata ids as well as duplicate payload ids. Mock the existing network/module transport boundary around actual githubSync entry points where needed; calling only runSync with a fake installer is not proof of real installation wiring. _(proof: practice information replacement doors reject invalid data before database or blob replacement)_
- [ ] **ac-5** — C5. Disposable exact-baseline v12 app and new v13 app: export full v12 fixture with a real small attachment, upgrade/import it, export v13, prove old app refuses v13 without altering bytes, then restore the retained v12 export and open/read the attachment. A post-upgrade test block exists only in the retained v13 export, making rollback limitations explicit. No checked-in old app bundle or real owner data modification. _(proof: practice information rollback restores the original backup without pretending to downgrade new history)_
- [ ] **ac-6** — A2. Render real Item Detail and Active at desktop/390px. Edit the same notebook while running and paused, with timer ticks, offline mode, navigation, Finish/return and Discard; verify notes survive and active clock identifiers/running/elapsed semantics, blocks/reviews/sr state stay unchanged by editing. Clear notes and reload; no resurrection. Inspect actual IndexedDB acknowledgement, not a sleep. Reject a storage write through the real storage seam and verify text remains visible with retry/copy and no false Saved state. _(proof: working notes persist across practice navigation without controlling the clock)_
- [ ] **ac-7** — A2/A3. Render a bound routine, edit item A while time naturally crosses to B, also exercise Skip, unbound and missing-item segments. Notes never land on the wrong item; routine elapsed/allocation/signals keep existing behaviour and no extra blocks appear. Also switch Item Detail route A to B and replace same-id data while the app is running: a stale editor must not overwrite new content on blur. Test Farsi and English text. _(proof: working note editors retain item ownership across routine and database changes)_
- [ ] **ac-8** — A4. Real Active to Close to next Active journey: distinct notebook, scratch Observation, Next time and lesson Question; choose result and close, inspect persisted records, reload, inspect older block history via disclosure and next-session previous decision. Notebook is not overwritten by reflection; questions stay independent and do not change preparation. Empty later nextAction preserves earlier non-empty choice. Deliberate unlogged close preserves schedule; Close across a local-day change retains authored text while refreshing the existing decision. _(proof: practice reflection keeps notebook observation next action and question distinct)_
- [ ] **ac-9** — A5/A6. Pure consumer cases plus rendered/exported teacher sheet: later block results and current notes/status change after a selected historical period; period result statements stay based on in-range blocks, current sections are labelled, and no unproved improvement is inferred from absolute ranks. Question output retains targets/asked answers and latest-observation date but never dumps Working notes as Problem or rewrites past answers. Include no-block/unlogged/older-observation cases and ordinary/DST local date boundaries for the selected report period. _(proof: practice summaries separate recorded period evidence from current context)_
- [ ] **ac-10** — B1-B4. Drive full item create/edit and Start with all retained status/result/mode/focus enums represented in a definition table; verify default summaries, reachable optional controls, accessible names, distinct descriptions, retained rating values and title-only quick add. Pin representative priority, urgency-factor, warm-up eligibility and scheduling outputs against current fixtures, including 1/3/5 effort/priority and Same versus Worse. A label change may not alter stored codes, weights, defaults or status transition behaviour. Include a new-status item with real blocks versus a truly untouched catalogue addition: wording is honest in both, with no automatic status or history mutation. _(proof: clarified practice choices preserve existing defaults and decision inputs)_
- [ ] **ac-11** — D1/D2. Pure administrative transition matrix: auto/user/unknown provenance; auto/manual/interval mode; future/due/past/no date; zero/matching/multiple agreeing/conflicting open rows; missing item; repeated execution. Retain pending date, normalise only explicit authority, preserve every sr/stat/block/completed-review fact. Restore missing reminder only when an item date exists; refuse ambiguous pending dates; no-date transfer stays unscheduled. Review today is separate and records no result. _(proof: automatic review ownership transfer preserves dates without inventing evidence)_
- [ ] **ac-12** — D3. Real Item Detail and full edit form: explicit transfer on already-auto custom/snoozed/unknown date, actual manual/interval to auto transition, and unrelated save while already auto. Assert identical intended outcomes and protected-date preservation on unrelated saves through live and persisted state after reload. Reopen/switch items/external live update while panel exists to rule out stale captured dates. Conflicting rows show actionable refusal; no-date auto remains unscheduled until explicit Review today. Button explanation never calls the retained date a new engine calculation. _(proof: review ownership controls distinguish explicit transfer from ordinary item edits)_
- [ ] **ac-13** — D4. Real UI transfer future custom date, then actual practice early with Same, positive and Worse in isolated scenarios; assert persisted due rows/item date, no early spacing expansion and repair only after worse. Change custom date/snooze/Schedule again re-establishes user protection. Exercise due eligible close, No, unanswered/unlogged and repeated same-day eligible close. Let browser clock cross local midnight before Review today or a displayed date action, without synthetic visibility events, and check displayed/saved date and Today/Close explanations. _(proof: released review dates obey the shipped early practice and local day rules)_
- [ ] **ac-14** — E1. Render changed note, item-form, Start, Close, routine-note, history and question-context surfaces at 390x844 and desktop in Chromium and WebKit. Install the matching existing Playwright browser binaries during setup if needed; do not silently skip an engine or report a skipped layout case as passing. Use Farsi, English, mixed paragraphs, opposite-language titles and long text. Assert own accessible names, selected states, keyboard activation, visible focus and actual text/ordinal bounding positions, no clipping/overlap/horizontal overflow, minimum editable font size and reduced-motion behaviour. This is browser rendering proof, not a claim to reproduce a physical iPhone keyboard; do not replace it with source regex. _(proof: practice information controls render accessible directional text at phone and desktop widths)_
- [ ] **ac-15** — OWNER subjective usability on the actual iPhone and Mac: a normal start stays under 30 seconds and close under 60; reading/editing Working notes during ordinary and bound-routine practice remains calm, clearly separate from block observation, and controls remain reachable with the keyboard. Verify understandable status/result/rating definitions and the retained-date automatic explanation. Record actual Farsi/English observations. Known residual shell/Safari symptom is separately diagnosed, not silently declared fixed and not cured with an untested timeout. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- README.md
- DECISIONS.md
- docs/product-spec.md
- docs/scheduling-evidence.md

## Amendments

_none_

