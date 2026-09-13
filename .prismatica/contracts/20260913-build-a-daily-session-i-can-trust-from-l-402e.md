---
id: 20260913-build-a-daily-session-i-can-trust-from-l-402e
title: Build a daily session I can trust, from lesson commitments to the next review
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/22
intent: 20260913-build-a-daily-session-i-can-trust-from-l-402e
tier: heavy
stage: build
baseline:
  commit: b6a4fecbad4e96af746024f7bae3df728b72f1ec
  branch: main
branch: change/20260913-build-a-daily-session-i-can-trust-from-l-402e
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260913-build-a-daily-session-i-can-trust-from-l-402e
builder: claude
planHash: 1fe86ebeaed99bb513a166cb076b963991b21f99d687fdaf3d231ffdba4ddf90
allowedPaths:
  - src/domain/scheduling.ts
  - src/domain/scheduling.test.ts
  - src/domain/scoring.ts
  - src/domain/scoring.test.ts
  - src/domain/recommend.ts
  - src/domain/recommend.test.ts
  - src/domain/plan.ts
  - src/domain/plan.test.ts
  - src/domain/blocks.ts
  - src/domain/blocks.test.ts
  - src/domain/defaults.ts
  - src/domain/selectors.ts
  - src/domain/selectors.test.ts
  - src/domain/questions.ts
  - src/domain/questions.test.ts
  - src/domain/lessonAgenda.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/report.ts
  - src/domain/insights.ts
  - src/domain/types.ts
  - src/domain/factories.ts
  - src/domain/seed.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/seedMigration.test.ts
  - src/domain/io.ts
  - src/domain/io.test.ts
  - src/domain/index.ts
  - src/domain/routines.test.ts
  - src/domain/pathways.test.ts
  - src/store/useStore.ts
  - src/store/backup.ts
  - src/pages/Today.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/TeacherReport.tsx
  - src/pages/Repertoire.tsx
  - src/pages/StageDetail.tsx
  - src/pages/NewItem.tsx
  - src/pages/Settings.tsx
  - src/components/ItemForm.tsx
  - src/components/itemFormValues.ts
  - src/components/ItemCard.tsx
  - src/components/ClassQuestions.tsx
  - src/components/format.ts
  - src/components/format.test.ts
  - src/components/direction.test.ts
  - src/components/useDecisionNow.ts
  - src/components/LessonAgenda.tsx
  - tests/daily-practice.browser.test.ts
  - tests/lesson-agenda.browser.test.ts
  - tests/practiceBrowser.ts
  - tests/fixtures/practice-decisions-v11.json
  - tests/fixtures/practice-decisions-v12.json
  - package.json
  - package-lock.json
  - vite.config.ts
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - .github/workflows/prismatica-gate.yml
  - AGENTS.md
  - docs/product-spec.md
  - docs/scheduling-evidence.md
  - src/domain/itemFiles.test.ts
forbiddenPaths:
  - src/store/gitRemote.ts
  - src/store/githubSync.ts
  - src/store/syncEngine.ts
  - src/store/idb.ts
  - src/domain/sync.ts
  - src/domain/canonical.ts
  - src/components/useViewportGuard.ts
  - src/components/Layout.tsx
  - src/components/screenAwake.ts
  - src/components/useScreenAwake.ts
  - src/domain/practiceSignal.ts
  - src/pages/ActiveBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/RoutineEdit.tsx
  - src/domain/routines.ts
  - src/domain/pathwaySeed.ts
  - src/styles/global.css
  - public/**
  - scripts/deploy-nas.sh
nonGoals:
  - One item, one mode, one focus, one result, one next action. Active remains
    calm and unchanged; Finish pauses time and the last nonempty next action
    remains visible before practice.
  - Local/offline first, no backend, authentication service, paid service,
    AI/audio judgement, gamification, quotas or guilt-driven copy. Large media
    remains NAS references.
  - One instrument per session. Plan and Routines remain independent collapsed
    peer doorways ABOVE the recommendation; keep the recommendation above the
    fold at 390x844. Do not reverse the owner's shipped ordering decision.
  - Only real practice changes practice totals; no administrative action
    fabricates a block, result, completion or retention success. Preserve
    unanswered versus deliberate No, non-destructive Not now and honest snooze
    semantics.
  - No silent data loss or guessed migration intent. Preserve old data and new
    question history, do not infer old manual date provenance or retroactively
    rebuild SR histories. Explicit user dates remain authoritative.
  - Keep every existing sync presence/revision guard, deferred retry,
    whole-snapshot conflict/archive mechanism, clock accounting,
    wake-lock/signal behaviour and routine recording semantics unchanged.
  - Preserve existing Farsi-aware search, direction-aware user-authored values,
    accessible in-box question ordinals and contrast. Any changed renderers are
    verified in the browser, not only with source guards.
  - "No scope creep through allowed shared files: Settings only scheduler
    explanation/local setup/migration guidance;
    Repertoire/Stage/ItemCard/Insights only new agenda/eligibility consumer
    adaptation; backup only new-model preflight validation/wiring. No broad
    information architecture, report engine, archive or import overhaul."
  - CI workflow edits only install/run the required browser checks. Do not
    change triggers, permissions, deploy targets, Prismatica version pins or
    governance bypasses. No publish, merge, start-import or owner decisions by
    the builder.
  - Canonical Flow/Rule records remain governed by Prismatica owner/protocol
    boundaries, not hand-edited as an implementation shortcut. Desired rule
    changes below are proposals until properly accepted.
  - "iPhone keyboard/bottom-navigation displacement: explicitly deferred in the
    last lane to a diagnostic OWNER readout. Do the diagnostic before or
    alongside this lane; no timeout, shell or viewport fix here. It is not a
    dependency of scheduling implementation."
  - "General inbound database validation and malformed attachment import loss:
    still open (backup skips malformed file rows before replacement). This lane
    validates its new data before mutation and tests valid full-backup round
    trips, but does not claim to repair all corrupt historical imports. A
    separate storage-integrity lane should follow; do not use a malformed backup
    as the rollout recovery copy."
  - "General item self-parenting/stale instrument-family metadata repair: still
    open. New agenda references must be valid, and planner metadata use must
    tolerate malformed/dangling links safely, but no broad item-model cleanup or
    historical metadata rewrite."
  - "Retrospective Insights/Teacher Report mixing period blocks with current
    result/status/stall state: confirmed in current source and deferred except
    for honest new question/lesson context. No historical analytics redesign."
  - "Settings newest-copy-wins wording and broad form naming/Settings
    accessibility/remaining direction exceptions: confirmed or explicitly
    excluded by the last lane. Correct accessible names and direction of changed
    controls only; do not reopen the shipped visual lane or restructure
    Settings."
  - "Archive-vs-delete redesign: item deletion currently confirms removal of its
    block history. Preserve ordinary explicit deletion semantics, except
    preserving/detaching the new question agenda honestly; a non-destructive
    item archive is a separate owner decision."
  - New learning algorithm for novelty, physiological warm-up prescription,
    random rotation, activity quotas, required activity tags, generic test
    infrastructure, artificial mastery metrics, and routine nesting/automatic
    routine expansion into plans.
  - Reimplementation of shipped correctness, NAS/search/material and
    direction/UI fixes, general clock refresh outside the changed decision
    surfaces, and product-map placeholder cleanup.
  - "Desired rule (not yet truth): Only actual practice may complete a review or
    provide spacing evidence; successful extra practice before the due
    opportunity does not advance spacing or move its date, and same is not
    deterioration. Administrative date actions never fabricate practice or
    progress."
  - "Desired rule (not yet truth): Manually chosen pending dates remain
    authoritative; an automatic early repair needs explicitly negative evidence
    and may only bring the date forward. All renderings and writes derive from
    the same decision."
  - "Desired rule (not yet truth): A session spends only the available minutes
    on eligible same-instrument items, with optional suitable warm-up and
    history-sensitive useful variety, never mandatory activity quotas or
    substantial new tagging."
  - "Desired rule (not yet truth): Every preparation or question commitment
    names its specific lesson or is visibly unassigned; questions do not imply
    item preparation, and asked questions retain their lesson history without
    automatic carry-forward."
  - "Desired rule (not yet truth): Migration preserves historical intent without
    guessing targets or scheduling provenance, is idempotent across all inbound
    paths, and rejects invalid new data before replacement."
acceptanceChecks:
  - id: ac-1
    description: A1/A2/A3. Against the real pure close transition, table all three
      stable results, a future date, due date, first schedule and repeated
      same-day closes. Early successes preserve date/open-row
      identity/reps/ease/base while real block stats change; a due stable result
      advances once; explicit clear/re-arm and reload cannot enable a second
      same-day advance. Undefined/not_logged and routine exposure never advance.
      Distinguish the actual permitted and forbidden cases, not just a default
      result.
    test: early successful practice preserves the pending review and spacing state
  - id: ac-2
    description: A3/A4. same and slightly_better before due preserve the schedule
      and SR state; neither is described as a slip. Due same/slightly_better
      repeat rather than expand/reset the interval. worse may shorten an
      automatic future review with min(existing,repair), never postpone it even
      on repetition. Verify a repair setting modified by importance/difficulty
      explains the final saved date, not the raw setting.
    test: only deterioration can bring an automatic review forward
  - id: ac-3
    description: A5/C6. Table auto-date manual override, manual mode, fixed cadence,
      snoozed date and unknown legacy provenance with positive/same/worse
      results before/at/after due. Protected future dates remain exact. Manual
      no-new-date preserves pending state unless explicit No. Fixed due
      scheduling uses fixed cadence without SR change. An explicit date edit is
      respected even when different from the engine.
    test: manual and fixed dates survive extra practice without advancing spacing
  - id: ac-4
    description: A6. Exercise real shared transitions for explicit decline,
      unanswered, scheduled-without-date, initial schedule, no-open-row Schedule
      again, existing-open-row edit and snooze. Assert item/open-row dates
      agree, no duplicate pending review is created by repetition, completed
      history is unchanged, and administrative actions create no block/result/SR
      progress. Conflicting legacy pending dates must be reported rather than
      silently discarded.
    test: decline unanswered and schedule again make distinct pending review
      transitions
  - id: ac-5
    description: B3/C2. Compare dormant vs active and preparation vs
      question-only/unassigned/past/other-instrument agenda entries across
      recommend, plan and swap. Resting-only automatic pools are honestly empty,
      never resurrected by fallback. Direct explicit item practice remains
      possible. A question alone changes no practice priority; only a specific
      current/future lesson preparation contributes its own urgency.
    test: recommendations exclude resting items and question only urgency
  - id: ac-6
    description: B5. Equal minutes/time split into one vs several blocks have equal
      exposure; longer recent practice cannot count as less exposure. Include
      routine/not_logged blocks, future timestamps, UTC/local midnight, DST and
      old same results. Recent penalties decay; old same can yield a strategy
      hint but not permanent saturation or selection exclusion.
    test: recent exposure measures minutes and decays independently of old same
      results
  - id: ac-7
    description: B2/B4. At 5 and 10 minutes a tomorrow-lesson usable item with
      higher true urgency beats an unrelated new deep item; one main focus uses
      the budget. With no urgent work, an ordinary
      usable/improvisation/rhythm/theory item remains eligible without
      fabricated mastery or category requirements. Wrong-instrument candidates
      never enter the plan.
    test: short sessions choose the most useful anchor before optional roles
  - id: ac-8
    description: B1/B2. Table 5/10/12/15/20/45/60/120 minutes; familiar Radif/piece
      and familiar technique candidates versus unfamiliar demanding exercise. No
      mandatory warm-up in short sessions or when unsuitable. When present it is
      first, within the total, its bounded share is real, and useful main work
      remains. No special warm-up entity/tag is required; routine data is
      unchanged. Invalid budgets reject cleanly.
    test: warm up uses familiar existing material within the chosen budget
  - id: ac-9
    description: B4/B5/B6. A fixed multi-day fixture with lesson work, due
      maintenance and existing diverse/absent metadata shows urgent work
      selected when needed, recently exposed equivalents yielding to fresh
      useful work, maintenance remaining reachable as repeated urgent exposure
      accumulates, and missing categories never filled artificially. Same input
      and permutations of storage arrays produce identical selections and
      reasons using stable ids. Document the numeric policy and fixture outputs.
    test: session variety responds to exposure without quotas or losing urgent work
  - id: ac-10
    description: B2/B3/B7. Exercise initial build, swap, regenerate, remove and
      all-practised fallback with the same candidates. No
      dormant/wrong-instrument candidate bypass, duplicate item, or
      selected-but-described-as-skipped item. Allocations never exceed the
      budget and normally use it fully when suitable eligible work exists; an
      honest remainder is allowed when filling it would require unsuitable
      repetition, fabricated filler or stretching work beyond sensible
      allocation. All segments remain feasible and positive;
      dropping/redistributing cannot attach another role's minutes/reason to the
      wrong item. Reasons identify the actual lesson, final date or
      repeat/exposure trade-off.
    test: build swap and redistribution preserve candidate identity and honest
      reasons
  - id: ac-11
    description: B7. Rehydrate a partially done/skipped plan, change/delete/move a
      pending item, and attempt to begin with another unfinished
      ordinary/routine session. Completed progress and real blocks survive;
      invalid pending work cannot start under another instrument;
      skipping/ending logs nothing. Live relevant changes cannot silently start
      stale preview decisions. Use actual store wiring in the browser journey as
      well as any extracted pure transition.
    test: plan transitions preserve progress and refuse stale cross instrument starts
  - id: ac-12
    description: "C1/C2. One item has a question for lesson A and preparation for
      lesson B. Query each lesson, Today, item and report: no question-derived
      urgency, no duplicated next-class agenda, no mutation of Lesson.itemIds.
      Several same-instrument future lessons remain distinct. No future lesson
      produces visible unassigned capture; same-instrument target validation
      rejects mismatches."
    test: lesson preparation and questions have independent specific targets
  - id: ac-13
    description: C3/C4. Mark asked with/without answer, reopen, pass the lesson
      date, reschedule it, delete it and move/delete an associated item.
      Text/answer/former target identification survives detachment. Asked
      entries never reappear automatically; unasked past entries remain on that
      lesson, and only explicit carry-forward changes target. None of these
      actions logs practice or completes a review.
    test: asked questions remain historical without automatic carry forward
  - id: ac-14
    description: C5. v11 fixtures include true/false/missing flags, question-only
      items, multiline Farsi/English, empty text, no future lessons, several
      future lessons, ids resembling generated ids and partially migrated
      entries. Convert each legacy intention once to the correct unassigned
      kind, preserve text verbatim, invent no asked state/answer/target, and
      produce the same result on different days and repeated applications.
      Already-current empty collections remain empty. Unrelated data and SR
      state are byte-equivalent.
    test: legacy lesson intent migrates unassigned exactly once without losing text
  - id: ac-15
    description: C5/C6/C7. Exercise pure migration and actual hydration/import
      wiring for bare/wrapped/full backups, sync-intent import, Keep remote and
      archive restore delegation. Current v12 round trips retain
      agenda/history/provenance/marker; invalid new
      fields/targets/dates/duplicates, incomplete conversion and newer schemas
      fail before database/blob replacement. Legitimate unassigned or detached
      historical records pass. Presence/revision guards remain effective; no
      fake repair of old data.
    test: all inbound paths preserve the new model or reject before replacement
  - id: ac-16
    description: C8. Export/import both pre-upgrade v11 and post-upgrade v12
      fixtures, including attachment metadata and valid fixture bytes, lesson
      answers, manual dates and SR state. Verify deterministic upgrade and
      complete v12 retention after restore. Prove newer-version rejection
      remains; do not rewrite schemaVersion or omit new fields as a supposed
      downgrade. Documentation states old-build restore cannot retain later v12
      edits.
    test: rollback fixtures preserve exports without pretending v12 can be downgraded
  - id: ac-17
    description: "A/B integration. One uniquely named Vitest test drives the actual
      app in an isolated Playwright browser at a 390x844 viewport: choose 5 then
      30 minutes, inspect explanation/total/warm-up suitability and urgent work,
      start/finish/save, reload and rebuild. Assert the rendered date equals
      persisted item/pending review and successful extra practice does not
      advance again. Include within-test branches for same vs worse, manual
      date/result change, explicit No then item-level Schedule again, and
      unanswered save. Move the test clock across local midnight and mutate
      relevant fixture state to prove live preview/close revalidation without
      losing the draft. Use accessible controls, not production debug hooks or
      source regex."
    test: daily practice browser journey preserves the decision across close and
      rebuild
  - id: ac-18
    description: C integration. One uniquely named Vitest test imports the legacy
      fixture through real UI, reloads to verify visible unassigned intent,
      targets question and preparation independently across two future lessons,
      marks asked and adds an answer, then verifies historical retention and no
      next-class repetition. Simulate clipboard rejection and assert accessible
      feedback plus selectable/download fallback. Check Farsi question with
      English title and the reverse through real DOM layout/direction, and
      keyboard-accessible names of changed controls. Exercise invalid new-model
      import and assert old data stays present.
    test: lesson agenda browser journey retains questions after the targeted class
  - id: ac-19
    description: "Musical/real-device acceptance only: using representative Setar
      and Guitar data, inspect 5/20/45-minute outputs and the published reasons.
      Confirm warm-up suitability, useful variety without quotas, urgency
      without repetitive crowding-out, quick start under 30 seconds and ordinary
      close under 60 seconds, and legible mixed Farsi/English on the actual
      phone. Confirm one-time unassigned migration is understandable. This is
      not permission to change scheduler policy or a claim that desktop
      automation reproduces the iPhone keyboard bug; deterministic checks above
      must already pass."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - docs/product-spec.md
  - docs/scheduling-evidence.md
createdAt: 2026-09-13T20:48:36.452Z
amendments:
  - at: 2026-09-13T21:54:28.281Z
    reason: "PracticeDB.lessonAgenda is now required by this lane. The existing
      itemFiles test fixture therefore needs lessonAgenda: [] to remain
      type-correct. This is a one-line fixture compatibility update only and
      does not change item-files behaviour."
    description: "allow: +src/domain/itemFiles.test.ts"
---

# Build a daily session I can trust, from lesson commitments to the next review

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/22
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** b6a4fecbad4e96af746024f7bae3df728b72f1ec on main _(never re-baselined)_
- **Intent:** 20260913-build-a-daily-session-i-can-trust-from-l-402e

## You may only change

- src/domain/scheduling.ts
- src/domain/scheduling.test.ts
- src/domain/scoring.ts
- src/domain/scoring.test.ts
- src/domain/recommend.ts
- src/domain/recommend.test.ts
- src/domain/plan.ts
- src/domain/plan.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/domain/defaults.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/report.ts
- src/domain/insights.ts
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/seed.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/seedMigration.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/index.ts
- src/domain/routines.test.ts
- src/domain/pathways.test.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- src/pages/Repertoire.tsx
- src/pages/StageDetail.tsx
- src/pages/NewItem.tsx
- src/pages/Settings.tsx
- src/components/ItemForm.tsx
- src/components/itemFormValues.ts
- src/components/ItemCard.tsx
- src/components/ClassQuestions.tsx
- src/components/format.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/components/useDecisionNow.ts
- src/components/LessonAgenda.tsx
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/practiceBrowser.ts
- tests/fixtures/practice-decisions-v11.json
- tests/fixtures/practice-decisions-v12.json
- package.json
- package-lock.json
- vite.config.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- AGENTS.md
- docs/product-spec.md
- docs/scheduling-evidence.md
- src/domain/itemFiles.test.ts

## Never touch

- src/store/gitRemote.ts
- src/store/githubSync.ts
- src/store/syncEngine.ts
- src/store/idb.ts
- src/domain/sync.ts
- src/domain/canonical.ts
- src/components/useViewportGuard.ts
- src/components/Layout.tsx
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/domain/practiceSignal.ts
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/domain/routines.ts
- src/domain/pathwaySeed.ts
- src/styles/global.css
- public/**
- scripts/deploy-nas.sh

## Non-goals

- One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.
- Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.
- One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.
- Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.
- No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.
- Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.
- Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards.
- No scope creep through allowed shared files: Settings only scheduler explanation/local setup/migration guidance; Repertoire/Stage/ItemCard/Insights only new agenda/eligibility consumer adaptation; backup only new-model preflight validation/wiring. No broad information architecture, report engine, archive or import overhaul.
- CI workflow edits only install/run the required browser checks. Do not change triggers, permissions, deploy targets, Prismatica version pins or governance bypasses. No publish, merge, start-import or owner decisions by the builder.
- Canonical Flow/Rule records remain governed by Prismatica owner/protocol boundaries, not hand-edited as an implementation shortcut. Desired rule changes below are proposals until properly accepted.
- iPhone keyboard/bottom-navigation displacement: explicitly deferred in the last lane to a diagnostic OWNER readout. Do the diagnostic before or alongside this lane; no timeout, shell or viewport fix here. It is not a dependency of scheduling implementation.
- General inbound database validation and malformed attachment import loss: still open (backup skips malformed file rows before replacement). This lane validates its new data before mutation and tests valid full-backup round trips, but does not claim to repair all corrupt historical imports. A separate storage-integrity lane should follow; do not use a malformed backup as the rollout recovery copy.
- General item self-parenting/stale instrument-family metadata repair: still open. New agenda references must be valid, and planner metadata use must tolerate malformed/dangling links safely, but no broad item-model cleanup or historical metadata rewrite.
- Retrospective Insights/Teacher Report mixing period blocks with current result/status/stall state: confirmed in current source and deferred except for honest new question/lesson context. No historical analytics redesign.
- Settings newest-copy-wins wording and broad form naming/Settings accessibility/remaining direction exceptions: confirmed or explicitly excluded by the last lane. Correct accessible names and direction of changed controls only; do not reopen the shipped visual lane or restructure Settings.
- Archive-vs-delete redesign: item deletion currently confirms removal of its block history. Preserve ordinary explicit deletion semantics, except preserving/detaching the new question agenda honestly; a non-destructive item archive is a separate owner decision.
- New learning algorithm for novelty, physiological warm-up prescription, random rotation, activity quotas, required activity tags, generic test infrastructure, artificial mastery metrics, and routine nesting/automatic routine expansion into plans.
- Reimplementation of shipped correctness, NAS/search/material and direction/UI fixes, general clock refresh outside the changed decision surfaces, and product-map placeholder cleanup.
- Desired rule (not yet truth): Only actual practice may complete a review or provide spacing evidence; successful extra practice before the due opportunity does not advance spacing or move its date, and same is not deterioration. Administrative date actions never fabricate practice or progress.
- Desired rule (not yet truth): Manually chosen pending dates remain authoritative; an automatic early repair needs explicitly negative evidence and may only bring the date forward. All renderings and writes derive from the same decision.
- Desired rule (not yet truth): A session spends only the available minutes on eligible same-instrument items, with optional suitable warm-up and history-sensitive useful variety, never mandatory activity quotas or substantial new tagging.
- Desired rule (not yet truth): Every preparation or question commitment names its specific lesson or is visibly unassigned; questions do not imply item preparation, and asked questions retain their lesson history without automatic carry-forward.
- Desired rule (not yet truth): Migration preserves historical intent without guessing targets or scheduling provenance, is idempotent across all inbound paths, and rejects invalid new data before replacement.

## Acceptance checks (definition of done)

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

## Docs to update

- AGENTS.md
- docs/product-spec.md
- docs/scheduling-evidence.md

## Amendments

- 2026-09-13T21:54:28.281Z — PracticeDB.lessonAgenda is now required by this lane. The existing itemFiles test fixture therefore needs lessonAgenda: [] to remain type-correct. This is a one-line fixture compatibility update only and does not change item-files behaviour.: allow: +src/domain/itemFiles.test.ts

