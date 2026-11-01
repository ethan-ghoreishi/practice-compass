---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
title: Keep Setar lessons and preparation coherent from archive to next class
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/60
intent: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
tier: heavy
stage: ship
baseline:
  commit: 7c9e8e4c704dac5ebf9286ee3583972491983252
  branch: main
branch: change/20261030-keep-setar-lessons-and-preparation-coher-d2ee
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261030-keep-setar-lessons-and-preparation-coher-d2ee
builder: claude
planHash: 4ca3c02bc9c36d2aa5589f704bfdf2dcee35ae1e7308f5dae6bd2cb5767d58fd
allowedPaths:
  - AGENTS.md
  - DECISIONS.md
  - docs/setar-archive.md
  - docs/nas-topology.md
  - docs/setar-practice-reliability.md
  - docs/setar-lesson-lifecycle.md
  - package.json
  - scripts/run-setar-index.sh
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
  - scripts/setar-archive-maintenance.mjs
  - scripts/check-setar-practice-families.mjs
  - src/domain/sourceArchive.ts
  - src/domain/sourceReconcile.ts
  - src/domain/sourceReconcile.test.ts
  - src/domain/scanSetarClasses.test.ts
  - src/domain/types.ts
  - src/domain/factories.ts
  - src/domain/lessonAgenda.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/lessonReconcile.ts
  - src/domain/lessonReconcile.test.ts
  - src/domain/selectors.ts
  - src/domain/selectors.test.ts
  - src/domain/questions.ts
  - src/domain/questions.test.ts
  - src/domain/report.ts
  - src/domain/report.test.ts
  - src/domain/itemFiles.ts
  - src/domain/itemFiles.test.ts
  - src/domain/scoring.ts
  - src/domain/plan.ts
  - src/domain/setarSetup.ts
  - src/domain/setarSetup.test.ts
  - src/domain/io.ts
  - src/domain/io.test.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/index.ts
  - src/store/useStore.ts
  - src/store/notesDrafts.ts
  - src/store/idb.ts
  - src/store/backup.ts
  - src/store/archiveIndex.ts
  - src/store/archiveIndex.test.ts
  - src/components/ArchiveRefresh.tsx
  - src/components/LessonReconcile.tsx
  - src/components/LessonNotes.tsx
  - src/components/LessonAgenda.tsx
  - src/components/ClassQuestions.tsx
  - src/components/TeacherQuestionCapture.tsx
  - src/components/SetarSetupReview.tsx
  - src/components/ItemMaterial.tsx
  - src/components/practiceCue.ts
  - src/components/practiceCue.test.ts
  - src/components/metronome.ts
  - src/pages/Lessons.tsx
  - src/pages/TeacherReport.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Today.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/Settings.tsx
  - src/styles/global.css
  - tests/setar-lifecycle.test.ts
  - tests/setar-lifecycle.browser.test.ts
  - tests/setar-maintenance.test.ts
  - tests/fixtures/setar-lifecycle-source.json
  - tests/fixtures/setar-lifecycle-owner.json
  - tests/fixtures/setar-lifecycle-expected.json
  - tests/setarArchive.browser.test.ts
  - tests/setarInbound.browser.test.ts
  - tests/setar-practice-source.test.ts
  - tests/setar-practice-inbound.browser.test.ts
  - tests/setar-practice.browser.test.ts
  - tests/setar-practice-proof.test.ts
  - tests/practice-cues.browser.test.ts
  - tests/live-practice.browser.test.ts
  - tests/practice-session.browser.test.ts
  - tests/ci-browser-setup.test.ts
  - src/components/direction.test.ts
  - src/components/pressedState.test.ts
  - src/domain/plan.test.ts
  - src/domain/scoring.test.ts
  - src/components/ItemNotes.tsx
  - tests/fixtures/setar-archive.json
  - tests/fixtures/setar-practice-source-v1.json
  - tests/fixtures/setar-practice-source-expectations.json
  - tests/fixtures/setar-practice-owner-v15.json
  - tests/fixtures/setar-practice-owner-v16.json
forbiddenPaths:
  - .github/workflows/**
  - vite.config.ts
  - package-lock.json
  - src/store/syncEngine.ts
  - src/domain/setarClasses.ts
nonGoals:
  - User-authored notes and pending drafts, question text/asked history/answers,
    commitments and targets, explicit item links, attachment metadata and bytes,
    practice blocks and results, scheduling/retention provenance and statistics,
    unrelated instruments, active clock/plan/routine, sync conflict/archive
    protections and offline operation must survive. No whole-database
    replacement for reconciliation.
  - Deliberate piece/session/link/resource suppressions, exact rename identity,
    registry canonical keys and source graph validation remain authoritative.
    Refresh never fabricates practice or clears questions, never completes a
    review, never treats not-described or an unreachable NAS as deleted.
  - All media remains on the NAS with byte preservation; large-file references
    do not become attachments, backups or sync payloads. Keep the existing
    separate source-index branch and commit-pinned hash-verified fetch; no
    secrets in committed artefacts or source index.
  - Keep the one-item practice loop, direction-aware mixed Farsi/English, mobile
    accessibility/reflow and secure-context requirements. No general scheduling,
    sync, schema or product redesign.
  - No general product audit, redesigned archive transport, NAS crawler/service,
    fingerprinting/automatic fuzzy identity, second metadata database, recurring
    lesson system, automatic question carry-forward or generic record merge
    framework.
  - No mass media normalisation, broad NAS permissions changes, destructive
    sync/mirror, republishing personal backup data, production app-database
    overwrite or automatic whole-snapshot/per-field sync merge. External job
    repairs are tightly bounded operational work recorded with private rollback
    evidence, not absolute paths added to repository scope.
  - No reimplementation of already-shipped audio renewal or CI routing. Change
    only demonstrated reachable recovery affordances and the test harness timing
    race; hardware sound guarantees and unrelated old defects are out of scope.
acceptanceChecks:
  - id: ac-1
    description: "New exact unique focused Node family, owning source/index
      semantics. Use sanitised committed temporary corpora independently
      transcribed from actual evidence, not a private backup or scanner-derived
      expectations. Run the real scanner, shared digest/graph decoder and
      publisher against a local fake Git boundary, then a thin clean-store
      import proving downstream source interpretation. Before repair prove
      session 40's existing correct registry identity versus its stacked-role
      filename, refused unnamed-demo attribution, session 41's genuine missing
      registration and excluded demo. After correction prove exact session-40
      roster/attribution and session-41 recording plus correctly scoped demo,
      without shared personal takes or invented musical identity. An empty
      session-42 folder produces no indexed session, imported lesson or
      deadline. Cover ordinary supported types/forms discovered without metadata
      action, explicit unsupported/unregistered diagnostics, failed/partial
      inventory, exact rename-chain resolution, retained-not-described
      resources, corrected metadata and unchanged scan/publication rerun.
      Expected piece memberships and resource paths are hand-written; publisher
      targets stay isolated from practice data. Do not create or consolidate the
      duplicate Class 41 or exercise the app-created future Class 42 lifecycle
      here: those have their own families."
    test: setar source pipeline indexes sessions 40 and 41 without creating a lesson
      from empty session 42
  - id: ac-2
    description: "New exact unique operator-mutation family on scratch trees. Drive
      the guided route through fact/preview confirmation, then let it perform
      the registry/rename edits, private rollback copy, validation, scan and
      publication automatically, with no hand-edited CSV or separate owner-run
      publication step. Exercise genuine new registration,
      existing-key/malformed-name correction, confirmed roster and exact rename
      continuation while preserving nonempty extra columns and unrelated rows.
      Invalid/ambiguous input, symlinks, stale preview/concurrent edit,
      interrupted apply and failed publication must retain recoverable
      originals, keep the last good published index, and expose a safe retry;
      repeat execution makes no duplicate rows, rename forks or unnecessary
      commit. Prove mechanical edits, byte preservation, publication
      invocation/result and rollback here; reuse the source/index family's exact
      content oracle rather than re-running its full sessions 40/41 attribution
      matrix. Separately Claude must execute and record redacted live pre/post
      NAS checks: actual config/task authority, intended-account run, full-day
      schedule/next trigger, effective job permissions, corrected scan hash,
      commit-pinned published graph accepted by the app decoder, second-run
      no-commit result, affected-file byte preservation and a concrete rollback
      manifest. Scratch proof does not establish production repair: supply
      actual outputs without credentials or archive-root paths in committed
      evidence. Do not mark this complete with owner repair instructions."
    test: setar guided maintenance is reversible stale safe and idempotent without
      altering media
  - id: ac-3
    description: New exact unique stateful Node/store family, owning full duplicate
      consolidation and preservation. Reproduce the real Class 41 shape with
      manual ID, two linked items, two commitments/two questions and a separate
      already-bound empty archive row. Through the supported repair obtain
      exactly one survivor retaining the manual ID and archive material. Extend
      this fixture with both-sided distinct notes, asked answers, authored
      references sharing a path but carrying distinct metadata, lesson
      attachments/bytes, historical links and recovery drafts. Assert complete
      preservation/rebinding without deleteLesson side effects or new
      suppressions. Cover first-time pathless counterpart, unique exact-path
      adoption, bound-session duplicate, durable keep-separate/skip, wrong
      instrument/date/number, the real Class 38 same-number/different-date
      counterexample, multiple candidates, pending notes/question saves, stale
      decisions, failed IndexedDB acknowledgement/retry and repeat Refresh with
      unchanged rev when no work remains. Ambiguity changes nothing silently;
      every entry stays reachable. Independently declare expected
      ownership/reference sets. The exact named browser companion in the proof
      route checks only that the real review/confirm/keep-separate controls
      reach this decision and display the surviving lesson and composed media in
      both engines; the full preservation matrix belongs here. Do not repeat
      Class 42 creation or transport round-trips in this family.
    test: setar lesson reconciliation preserves both owners through decisions
      failures retries and repeat refresh
  - id: ac-4
    description: New exact unique future-class browser family in Chromium and WebKit
      at phone and desktop sizes, using roles/names and storage-aware helpers.
      With no NAS access, folder or media, create Class 42 dated 2026-11-24 in
      Compass, select it, commit work and capture a question. Prove its
      ID/date/intent agree across Lessons, item/class associations, Teacher
      report and practice capture. Advance to the lesson date/past it
      explicitly, add the real session-42 recording/materials to a scratch
      normal session folder, pass the scanner-produced published index to
      Refresh, resolve its match proposal and prove the archive binds to the
      original Compass lesson with the same commitments/question and composed
      files, not a second lesson. Repeated Refresh retains that one binding. In
      a focused branch, material arriving while the owner-planned date remains
      ahead must not cancel its legitimate upcoming status; distinguish
      archive-only future-dated history. Crossing midnight preserves past lesson
      intent/history without automatic question carry-forward. Own the visible
      actionable source/maintenance messages here, using minimal diagnostic
      fixtures rather than reproducing sessions 40/41 parser expectations. Do
      not repeat Class 41 consolidation, its preservation matrix, keep-separate
      matrices or persistence/sync round-trips. No UI source-regex or debug hook
      substitutes for this journey.
    test: setar future class preparation and later media use one lesson across every
      visible consumer
  - id: ac-5
    description: New exact unique durable-boundary family in Chromium and WebKit,
      starting from an independently declared already-reconciled fixture. Do not
      perform the Class 41 merge again. Exercise repaired schema state,
      supported older-schema data if representation changes, persist
      migrate+merge, ordinary/full-backup import, sync pull, Keep remote and
      archive restore through existing entry points with mocked transport.
      Validate at every inbound door. At each handover check the canonical
      lesson/source binding and representative authored agenda/text and
      attachment ownership/bytes; retain suppression and explicit-separate
      decisions through acknowledged save and cold reload. A subsequent Refresh
      must neither recreate a removed duplicate nor restore hidden/unlinked
      material. Own malformed graph/duplicate binding/missing described
      attachment-byte refusal at inbound install boundaries; stale
      reconciliation previews and failed merge acknowledgements remain in the
      reconciliation family. Include unfinished practice and in-flight
      note/question writes where replacement interacts with this lane,
      preserving existing replacement guards and whole-snapshot conflicts.
      WebKit seeds state only; prove blob claims through Node/Chromium byte
      checks/full-backup paths. This checks persistence of the independently
      expected result, not the full consolidation algorithm or another copy of
      its preservation matrix.
    test: setar reconciled lessons survive reload backup and compatible sync without
      resurrecting removed material
  - id: ac-6
    description: Reuse this exact existing browser title, extending its behaviour
      family rather than creating a duplicate title. On a long-lived mounted
      ordinary/planned block and routine, instrument suspended, interrupted,
      closed, falsely-running silent and transient constructor-failure contexts.
      Verify a recovery/Test gesture is reachable even when reported ready or
      unavailable and creates/resumes the fresh context synchronously; no
      reload, late stale pulse, second scheduler or timer/history/marker
      mutation. Verify metronome interaction, pending/rejected resumes and
      hidden/visible return using existing cue/metronome companions. If current
      behaviour already passes a case, keep it. Automation proves
      calls/lifecycle and accessible recovery, never speaker output.
    test: practice sound returns at the next tap after the context dies through
      every start and resume door
  - id: ac-7
    description: Reuse this exact existing title. Replace tight total-duration
      inequalities with deterministic invocation/behaviour assertions plus a
      finite generous deadlock guard. The real script still runs against local
      fast-index/slow-package, hung, refused, missing-suite and healthy mirrors
      and verifies resulting sources, failure exit and unchanged
      third-party/signature settings. Assert each probe receives the existing
      curl limit and workflows retain their install/job bounds and two-engine
      requirement, including negative cases. Artificial harness/process overhead
      must not fail correct routing; removing a probe bound or bypass/failure
      safeguard must fail. No unrelated production routing rewrite or CI timeout
      increase.
    test: ci browser setup avoids a fast index slow package mirror within the
      existing bounds
  - id: ac-8
    description: "Only the physical-device claims: on the built revision in isolated
      preview data, hear the cue on Mac and native iPhone Safari/installed PWA
      after a normal idle/background/lock interruption and recover using the
      visible gesture without relaunch; confirm NAS recording/demo opening and
      playback on the real device where automated networking/player checks
      cannot prove it. Record platform/build/output route and limits. Claude
      performs all metadata/task/index repair and ordinary automated regression
      work; do not substitute owner NAS editing, duplicate cleanup, sync
      migration testing or a general product walkthrough for those proofs. If no
      sound code/affordance changes prove necessary, do not manufacture an
      unrelated audio acceptance burden."
    test: manual:OWNER
docsDelta:
  - docs/setar-archive.md
  - docs/nas-topology.md
  - docs/setar-practice-reliability.md
  - docs/setar-lesson-lifecycle.md
  - DECISIONS.md
  - AGENTS.md
createdAt: 2026-10-30T22:16:43.327Z
amendments: []
---

# Keep Setar lessons and preparation coherent from archive to next class

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/60
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 7c9e8e4c704dac5ebf9286ee3583972491983252 on main _(never re-baselined)_
- **Intent:** 20261030-keep-setar-lessons-and-preparation-coher-d2ee

## You may only change

- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/nas-topology.md
- docs/setar-practice-reliability.md
- docs/setar-lesson-lifecycle.md
- package.json
- scripts/run-setar-index.sh
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/setar-archive-maintenance.mjs
- scripts/check-setar-practice-families.mjs
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/sourceReconcile.test.ts
- src/domain/scanSetarClasses.test.ts
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/lessonReconcile.ts
- src/domain/lessonReconcile.test.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/report.ts
- src/domain/report.test.ts
- src/domain/itemFiles.ts
- src/domain/itemFiles.test.ts
- src/domain/scoring.ts
- src/domain/plan.ts
- src/domain/setarSetup.ts
- src/domain/setarSetup.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/store/notesDrafts.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/archiveIndex.ts
- src/store/archiveIndex.test.ts
- src/components/ArchiveRefresh.tsx
- src/components/LessonReconcile.tsx
- src/components/LessonNotes.tsx
- src/components/LessonAgenda.tsx
- src/components/ClassQuestions.tsx
- src/components/TeacherQuestionCapture.tsx
- src/components/SetarSetupReview.tsx
- src/components/ItemMaterial.tsx
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/metronome.ts
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- src/pages/ItemDetail.tsx
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/CloseBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- tests/setar-lifecycle.test.ts
- tests/setar-lifecycle.browser.test.ts
- tests/setar-maintenance.test.ts
- tests/fixtures/setar-lifecycle-source.json
- tests/fixtures/setar-lifecycle-owner.json
- tests/fixtures/setar-lifecycle-expected.json
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-practice-proof.test.ts
- tests/practice-cues.browser.test.ts
- tests/live-practice.browser.test.ts
- tests/practice-session.browser.test.ts
- tests/ci-browser-setup.test.ts
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/domain/plan.test.ts
- src/domain/scoring.test.ts
- src/components/ItemNotes.tsx
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-practice-source-v1.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json

## Never touch

- .github/workflows/**
- vite.config.ts
- package-lock.json
- src/store/syncEngine.ts
- src/domain/setarClasses.ts

## Non-goals

- User-authored notes and pending drafts, question text/asked history/answers, commitments and targets, explicit item links, attachment metadata and bytes, practice blocks and results, scheduling/retention provenance and statistics, unrelated instruments, active clock/plan/routine, sync conflict/archive protections and offline operation must survive. No whole-database replacement for reconciliation.
- Deliberate piece/session/link/resource suppressions, exact rename identity, registry canonical keys and source graph validation remain authoritative. Refresh never fabricates practice or clears questions, never completes a review, never treats not-described or an unreachable NAS as deleted.
- All media remains on the NAS with byte preservation; large-file references do not become attachments, backups or sync payloads. Keep the existing separate source-index branch and commit-pinned hash-verified fetch; no secrets in committed artefacts or source index.
- Keep the one-item practice loop, direction-aware mixed Farsi/English, mobile accessibility/reflow and secure-context requirements. No general scheduling, sync, schema or product redesign.
- No general product audit, redesigned archive transport, NAS crawler/service, fingerprinting/automatic fuzzy identity, second metadata database, recurring lesson system, automatic question carry-forward or generic record merge framework.
- No mass media normalisation, broad NAS permissions changes, destructive sync/mirror, republishing personal backup data, production app-database overwrite or automatic whole-snapshot/per-field sync merge. External job repairs are tightly bounded operational work recorded with private rollback evidence, not absolute paths added to repository scope.
- No reimplementation of already-shipped audio renewal or CI routing. Change only demonstrated reachable recovery affordances and the test harness timing race; hardware sound guarantees and unrelated old defects are out of scope.

## Acceptance checks (definition of done)

- [ ] **ac-1** — New exact unique focused Node family, owning source/index semantics. Use sanitised committed temporary corpora independently transcribed from actual evidence, not a private backup or scanner-derived expectations. Run the real scanner, shared digest/graph decoder and publisher against a local fake Git boundary, then a thin clean-store import proving downstream source interpretation. Before repair prove session 40's existing correct registry identity versus its stacked-role filename, refused unnamed-demo attribution, session 41's genuine missing registration and excluded demo. After correction prove exact session-40 roster/attribution and session-41 recording plus correctly scoped demo, without shared personal takes or invented musical identity. An empty session-42 folder produces no indexed session, imported lesson or deadline. Cover ordinary supported types/forms discovered without metadata action, explicit unsupported/unregistered diagnostics, failed/partial inventory, exact rename-chain resolution, retained-not-described resources, corrected metadata and unchanged scan/publication rerun. Expected piece memberships and resource paths are hand-written; publisher targets stay isolated from practice data. Do not create or consolidate the duplicate Class 41 or exercise the app-created future Class 42 lifecycle here: those have their own families. _(proof: setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42)_
- [ ] **ac-2** — New exact unique operator-mutation family on scratch trees. Drive the guided route through fact/preview confirmation, then let it perform the registry/rename edits, private rollback copy, validation, scan and publication automatically, with no hand-edited CSV or separate owner-run publication step. Exercise genuine new registration, existing-key/malformed-name correction, confirmed roster and exact rename continuation while preserving nonempty extra columns and unrelated rows. Invalid/ambiguous input, symlinks, stale preview/concurrent edit, interrupted apply and failed publication must retain recoverable originals, keep the last good published index, and expose a safe retry; repeat execution makes no duplicate rows, rename forks or unnecessary commit. Prove mechanical edits, byte preservation, publication invocation/result and rollback here; reuse the source/index family's exact content oracle rather than re-running its full sessions 40/41 attribution matrix. Separately Claude must execute and record redacted live pre/post NAS checks: actual config/task authority, intended-account run, full-day schedule/next trigger, effective job permissions, corrected scan hash, commit-pinned published graph accepted by the app decoder, second-run no-commit result, affected-file byte preservation and a concrete rollback manifest. Scratch proof does not establish production repair: supply actual outputs without credentials or archive-root paths in committed evidence. Do not mark this complete with owner repair instructions. _(proof: setar guided maintenance is reversible stale safe and idempotent without altering media)_
- [ ] **ac-3** — New exact unique stateful Node/store family, owning full duplicate consolidation and preservation. Reproduce the real Class 41 shape with manual ID, two linked items, two commitments/two questions and a separate already-bound empty archive row. Through the supported repair obtain exactly one survivor retaining the manual ID and archive material. Extend this fixture with both-sided distinct notes, asked answers, authored references sharing a path but carrying distinct metadata, lesson attachments/bytes, historical links and recovery drafts. Assert complete preservation/rebinding without deleteLesson side effects or new suppressions. Cover first-time pathless counterpart, unique exact-path adoption, bound-session duplicate, durable keep-separate/skip, wrong instrument/date/number, the real Class 38 same-number/different-date counterexample, multiple candidates, pending notes/question saves, stale decisions, failed IndexedDB acknowledgement/retry and repeat Refresh with unchanged rev when no work remains. Ambiguity changes nothing silently; every entry stays reachable. Independently declare expected ownership/reference sets. The exact named browser companion in the proof route checks only that the real review/confirm/keep-separate controls reach this decision and display the surviving lesson and composed media in both engines; the full preservation matrix belongs here. Do not repeat Class 42 creation or transport round-trips in this family. _(proof: setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh)_
- [ ] **ac-4** — New exact unique future-class browser family in Chromium and WebKit at phone and desktop sizes, using roles/names and storage-aware helpers. With no NAS access, folder or media, create Class 42 dated 2026-11-24 in Compass, select it, commit work and capture a question. Prove its ID/date/intent agree across Lessons, item/class associations, Teacher report and practice capture. Advance to the lesson date/past it explicitly, add the real session-42 recording/materials to a scratch normal session folder, pass the scanner-produced published index to Refresh, resolve its match proposal and prove the archive binds to the original Compass lesson with the same commitments/question and composed files, not a second lesson. Repeated Refresh retains that one binding. In a focused branch, material arriving while the owner-planned date remains ahead must not cancel its legitimate upcoming status; distinguish archive-only future-dated history. Crossing midnight preserves past lesson intent/history without automatic question carry-forward. Own the visible actionable source/maintenance messages here, using minimal diagnostic fixtures rather than reproducing sessions 40/41 parser expectations. Do not repeat Class 41 consolidation, its preservation matrix, keep-separate matrices or persistence/sync round-trips. No UI source-regex or debug hook substitutes for this journey. _(proof: setar future class preparation and later media use one lesson across every visible consumer)_
- [ ] **ac-5** — New exact unique durable-boundary family in Chromium and WebKit, starting from an independently declared already-reconciled fixture. Do not perform the Class 41 merge again. Exercise repaired schema state, supported older-schema data if representation changes, persist migrate+merge, ordinary/full-backup import, sync pull, Keep remote and archive restore through existing entry points with mocked transport. Validate at every inbound door. At each handover check the canonical lesson/source binding and representative authored agenda/text and attachment ownership/bytes; retain suppression and explicit-separate decisions through acknowledged save and cold reload. A subsequent Refresh must neither recreate a removed duplicate nor restore hidden/unlinked material. Own malformed graph/duplicate binding/missing described attachment-byte refusal at inbound install boundaries; stale reconciliation previews and failed merge acknowledgements remain in the reconciliation family. Include unfinished practice and in-flight note/question writes where replacement interacts with this lane, preserving existing replacement guards and whole-snapshot conflicts. WebKit seeds state only; prove blob claims through Node/Chromium byte checks/full-backup paths. This checks persistence of the independently expected result, not the full consolidation algorithm or another copy of its preservation matrix. _(proof: setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material)_
- [ ] **ac-6** — Reuse this exact existing browser title, extending its behaviour family rather than creating a duplicate title. On a long-lived mounted ordinary/planned block and routine, instrument suspended, interrupted, closed, falsely-running silent and transient constructor-failure contexts. Verify a recovery/Test gesture is reachable even when reported ready or unavailable and creates/resumes the fresh context synchronously; no reload, late stale pulse, second scheduler or timer/history/marker mutation. Verify metronome interaction, pending/rejected resumes and hidden/visible return using existing cue/metronome companions. If current behaviour already passes a case, keep it. Automation proves calls/lifecycle and accessible recovery, never speaker output. _(proof: practice sound returns at the next tap after the context dies through every start and resume door)_
- [ ] **ac-7** — Reuse this exact existing title. Replace tight total-duration inequalities with deterministic invocation/behaviour assertions plus a finite generous deadlock guard. The real script still runs against local fast-index/slow-package, hung, refused, missing-suite and healthy mirrors and verifies resulting sources, failure exit and unchanged third-party/signature settings. Assert each probe receives the existing curl limit and workflows retain their install/job bounds and two-engine requirement, including negative cases. Artificial harness/process overhead must not fail correct routing; removing a probe bound or bypass/failure safeguard must fail. No unrelated production routing rewrite or CI timeout increase. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-8** — Only the physical-device claims: on the built revision in isolated preview data, hear the cue on Mac and native iPhone Safari/installed PWA after a normal idle/background/lock interruption and recover using the visible gesture without relaunch; confirm NAS recording/demo opening and playback on the real device where automated networking/player checks cannot prove it. Record platform/build/output route and limits. Claude performs all metadata/task/index repair and ordinary automated regression work; do not substitute owner NAS editing, duplicate cleanup, sync migration testing or a general product walkthrough for those proofs. If no sound code/affordance changes prove necessary, do not manufacture an unrelated audio acceptance burden. _(proof: manual:OWNER)_

## Docs to update

- docs/setar-archive.md
- docs/nas-topology.md
- docs/setar-practice-reliability.md
- docs/setar-lesson-lifecycle.md
- DECISIONS.md
- AGENTS.md

## Amendments

_none_

