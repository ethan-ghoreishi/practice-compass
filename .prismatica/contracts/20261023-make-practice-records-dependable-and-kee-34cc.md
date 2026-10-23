---
id: 20261023-make-practice-records-dependable-and-kee-34cc
title: Make practice records dependable and keep session choices aligned with
  the work being done
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/56
intent: 20261023-make-practice-records-dependable-and-kee-34cc
tier: heavy
stage: build
baseline:
  commit: dc964b3b7eeb4099e7536ee8ed1a67db9cd37940
  branch: main
branch: change/20261023-make-practice-records-dependable-and-kee-34cc
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261023-make-practice-records-dependable-and-kee-34cc
builder: claude
planHash: fd3ddfae89092e180a6f40e09ca152eb6c92f67fdb033f42532c30dbaaa9088d
allowedPaths:
  - AGENTS.md
  - DECISIONS.md
  - docs/scheduling-evidence.md
  - docs/repertoire-experience.md
  - docs/practice-session-model.md
  - src/domain/types.ts
  - src/domain/factories.ts
  - src/domain/defaults.ts
  - src/domain/labels.ts
  - src/domain/blocks.ts
  - src/domain/routines.ts
  - src/domain/scheduling.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/plan.ts
  - src/domain/lessonAgenda.ts
  - src/domain/selectors.ts
  - src/domain/repertoire.ts
  - src/domain/practiceInformation.ts
  - src/domain/practiceSession.ts
  - src/domain/practiceSessionModel.ts
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/insights.ts
  - src/domain/report.ts
  - src/domain/canonical.ts
  - src/domain/sync.ts
  - src/domain/index.ts
  - src/domain/util.ts
  - src/store/useStore.ts
  - src/store/lookups.ts
  - src/store/sessionHelpers.ts
  - src/store/idb.ts
  - src/store/backup.ts
  - src/store/databaseInstall.ts
  - src/store/revision.ts
  - src/store/syncEngine.ts
  - src/store/notesDrafts.ts
  - src/components/ItemNotes.tsx
  - src/components/LessonNotes.tsx
  - src/components/RoutineDuration.tsx
  - src/components/RoutineContents.tsx
  - src/components/useNotesDraft.ts
  - src/components/ItemForm.tsx
  - src/components/QuickAdd.tsx
  - src/components/itemKinds.ts
  - src/components/ItemCard.tsx
  - src/components/ItemAgenda.tsx
  - src/components/CloseDraft.tsx
  - src/components/closeDraft.ts
  - src/components/format.ts
  - src/components/SchedulingExplanation.tsx
  - src/components/ui.tsx
  - src/components/direction.test.ts
  - src/components/pressedState.test.ts
  - src/components/itemKinds.test.ts
  - src/pages/Today.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/RoutineEdit.tsx
  - src/pages/StartBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/NewItem.tsx
  - src/pages/Repertoire.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/Insights.tsx
  - src/pages/TeacherReport.tsx
  - src/pages/Settings.tsx
  - src/styles/global.css
  - src/domain/routines.test.ts
  - src/domain/scheduling.test.ts
  - src/domain/blocks.test.ts
  - src/domain/plan.test.ts
  - src/domain/recommend.test.ts
  - src/domain/scoring.test.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/selectors.test.ts
  - src/domain/repertoire.test.ts
  - src/domain/io.test.ts
  - src/domain/migrations.test.ts
  - src/domain/practiceSession.test.ts
  - src/store/backup.test.ts
  - src/store/syncEngine.test.ts
  - tests/practice-session-families.test.ts
  - tests/practice-session.browser.test.ts
  - tests/practice-session-inbound.browser.test.ts
  - tests/fixtures/practice-session-v16.json
  - tests/fixtures/practice-session-expectations.json
  - tests/ci-browser-setup.test.ts
  - tests/post-practice.browser.test.ts
  - tests/practice-information.browser.test.ts
  - tests/practice-information-inbound.browser.test.ts
  - tests/practice-information-layout.browser.test.ts
  - tests/lessonNotes.browser.test.ts
  - tests/daily-practice.browser.test.ts
  - tests/lesson-agenda.browser.test.ts
  - tests/review-ownership.browser.test.ts
  - tests/ui-date-refresh.browser.test.ts
  - tests/ui-conformance.browser.test.ts
  - tests/repertoire-viewport.browser.test.ts
  - tests/practice-cues.browser.test.ts
  - tests/practiceBrowser.ts
  - tests/agent-context.test.ts
  - .github/workflows/ci.yml
  - .github/workflows/deploy.yml
  - .github/workflows/prismatica-gate.yml
  - scripts/prepare-ci-browsers.sh
forbiddenPaths:
  - src/domain/setarClasses.ts
  - src/domain/sourceArchive.ts
  - src/domain/setarSetup.ts
  - src/domain/khonyagarData.ts
  - src/domain/cgsData.ts
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
  - scripts/nas-mirror.mjs
  - src/components/viewport.ts
  - src/components/useViewportGuard.ts
  - src/components/appUpdate.ts
  - src/components/practiceCue.ts
  - src/components/screenAwake.ts
  - src/components/useScreenAwake.ts
  - src/store/gitRemote.ts
  - src/store/githubSync.ts
  - .prismatica/rules.md
  - .prismatica/flows/*.md
  - CLAUDE.md
  - package.json
  - package-lock.json
nonGoals:
  - One item, mode, focus, result and next action per block; the latest
    non-empty next action remains visible before practice. Separate notes,
    observations, next actions and lesson agenda retain their canonical homes.
  - Local-first offline PWA; no backend/auth/runtime paid service, gamification,
    audio/AI grading or guilt-driven copy. GitHub snapshot transport, conflict
    archives, attachment bytes, device-only secrets and unfinished-practice
    replacement protection remain intact.
  - Wall-clock minutes, one active clock, gesture-primed fresh audio contexts,
    marker claims, visual boundaries and wake-lock lifecycle remain independent
    of feedback, note writes and controls. Preserve update offer/reload
    ownership and build-input stamp.
  - Instrument scoping, independent Plan/Routines doorways above the
    recommendation, catalogue/source/term identity, explicit adoption, NAS
    references and archive authority boundaries remain intact.
  - Only main scrolls, existing native keyboard/tab fixes, mixed-language
    direction, one h1, named accessible controls, 44px mobile targets and 390px
    reflow remain protected. No viewport/audio/service-worker redesign.
  - No implementation in this planning session, private database inspection,
    guessed repair/backfill of lost historical practice, NAS/archive/course
    redesign, research claims of optimal intervals, theory curriculum or
    generated musical authority.
  - No new settings dashboard, second planner/ranking engine, third creation
    path, routine-to-full-close wizard, running-plan reorder, automatic
    redistribution after session remove/skip/move-on, analytics redesign or
    general test-harness rewrite.
  - No permission to submit/merge/deploy, approve signed Flow/Rule changes,
    erase owner data or broaden into unrelated findings. Claude follows the
    normal governed owner boundaries.
acceptanceChecks:
  - id: ac-1
    description: "Two differently named bound Setar items created through the real
      editor: natural completion and early Finish, omitted/partial/full optional
      capture, leave completion and reload. Assert BOTH persisted blocks and
      BOTH item histories/totals, truthful not-assessed presentation and
      untouched reviews/SR. Repeat binding aggregates into one block; an unbound
      segment stays unlogged. Include the reported first-item-only shape and
      identify any checked-clean path."
    test: routine completion and history preserve all practised items without
      feedback
  - id: ac-2
    description: "Table-driven store/domain proof of the shared session-control
      policy for Plan and Routine: remove before start, skip/remove
      not-yet-started work during a session, active/paused skip with elapsed
      time, keep partial practice through move-on, first/middle/final/all
      removal, repeated routine item after an earlier real occurrence, duplicate
      finish and reload/resume. Skips create zero practice; kept partial time is
      real; remaining order/targets stay unchanged and freed time is visibly
      unused. Explicit Plan regeneration/budget change and routine duration
      fitting can allocate again. Cover actual overtime without borrowing
      another target, protected completed records, and empty/completed outcomes.
      Plan move-on saves through Close before advancing; Routine keeps its
      lighter recording with no retention judgement. Finish write failure/retry
      retains a recoverable outcome and counts each real item once. Use
      independently expected minute totals for both flows, not just identical
      function names."
    test: routine controls distinguish skipped time from partial practice across run
      transitions
  - id: ac-3
    description: "Chromium/WebKit: Today, stage, pathway, bare URL and
      duration/essentials doors show/reach actual bound contents before
      starting. Start only from a tap; preview matches frozen run, full list
      states remain available while running, editing saved routine does not
      shift active identities, removing/skipping does not edit the saved routine
      or delete items. Named mobile controls and empty/unbound states are
      covered. Include preview removal and essentials filtering: the shorter
      contents/time shown are the ones started; no automatic refill of removed
      time."
    test: routine contents and controls describe the exact run started from every
      doorway
  - id: ac-4
    description: "Domain plus store: first/last/no-op/empty/single moves, repeated
      moves then swap/remove, and start/close sequence execute owner order with
      identical moved-segment minutes/roles/reasons/focus and no invented block.
      Remove leaves other allocations unchanged and shows unused capacity;
      explicit regeneration/budget choice is the allocation boundary, preserving
      generator floors/shares/caps. Cross-check pre-start and running
      skip/remove/move-on with the shared control family. Reorder logs no
      practice and cannot bypass deleted/moved-item, revision or day checks."
    test: session plan reordering preserves segment identity allocation and
      execution order
  - id: ac-5
    description: "Chromium/WebKit at phone and desktop widths: reorder with named
      keyboard/touch controls, keep focus usable and start/finish in displayed
      order. In the same finite journey, compare Plan and Routine removal before
      start, pending skip and early move-on: equivalent actions have consistent
      meanings, remaining durations do not silently increase,
      actual/remaining/unused time is truthful, and actual practice is kept
      through the appropriate existing save path. Check empty/completed outcomes
      and explicit regeneration/duration fitting without a new control wizard.
      Revision/day staleness stays visible without silently re-sorting edits; no
      drag dependency or horizontal overflow."
    test: session plan move controls work by keyboard and touch without losing the
      draft
  - id: ac-6
    description: "Chromium/WebKit: item detail, active block, bound routine and
      shared lesson editor; type then immediately navigate, collapse, Finish,
      cross a natural boundary, change item/lesson and ordinary reload. After
      acknowledged persistence recover exact latest text for the original owner,
      including clear-to-empty and Farsi composition. New owner never
      displays/saves the prior draft. Done is optional; practice facts and clock
      remain unchanged."
    test: working note drafts survive exits boundaries and reload without Done
  - id: ac-7
    description: Delay/reorder/reject acknowledgements, type during a pending save,
      retry after store memory already changed, two editors with equal
      item/lesson ids, and import/sync/restore/reset/delete underneath an
      editor. Saved never precedes durability; newer words survive, failed text
      remains recoverable with retry/Copy, stale writes cannot resurrect records
      or overwrite replacement/remote notes, both competing texts remain
      preserved and recoverable under the simplest resolution consistent with
      the existing conflict model, without requiring a new conflict UI. Exercise
      rapid exit before debounce, not just waiting for autosave.
    test: working note saves preserve newest text and refuse stale ownership across
      failures and replacement
  - id: ac-8
    description: "Fixed decision table: all six results plus not_logged crossed with
      focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh;
      whole child versus parent; due/future/unscheduled; same-day double close.
      Focused performable never promotes whole readiness or
      expands/resets/completes retention. Explicit whole stable can advance when
      eligible; same is neutral; no-assessment/routine capture/admin changes
      never fabricate retention. Store outcomes, not merely helpers, prove the
      boundaries."
    test: scoped evidence separates focused progress from whole item retention and
      readiness
  - id: ac-9
    description: Literal high-SR unfinished-piece fixture (for example reps 8,
      interval 90) with focused success and same produces the documented 1–3-day
      Working return rather than repeating/expanding 90 days. A real explicit
      due whole-item check in Keep fresh retains honest spaced progression.
      Include user/manual/fixed/unknown future protection, auto future, due, no
      date, deliberate clear versus omitted, switching intention, repeated
      decline/rearm/reload and once-per-local-day progress. Match one preview
      decision to the exact saved item/open-row outcome and rationale.
    test: working returns stay short while protected dates and retention spacing
      keep their authority
  - id: ac-10
    description: An unfinished/retained item committed to a class in four days with
      a 90-day review returns as class preparation without overwriting its
      protected date. Heavy practice today reduces repeats when an alternative
      exists; it returns on a later eligible day until its named lesson,
      including after a routine without feedback. Test only-candidate honest
      fallback, near versus later class,
      retarget/delete/pass/unassigned/archive/other-instrument classes,
      question-only entries, dormant exclusion, equal-score stable ties and
      parent/part opportunities. Today/build/regenerate/swap/fallback consume
      the same eligibility/return policy; urgency beats diversity.
    test: class preparation and shared recommendation pools return useful work
      without repetition noise
  - id: ac-11
    description: "Chromium/WebKit: focused versus explicit whole, unchanged and
      stable results on a high-SR unfinished piece, explicit readiness decision,
      class opportunity versus protected retention date, manual correction, no
      result, Back, local midnight and ordinary/plan entry. History preserves
      evidence scope; Why this date uses the same decision. No preselected
      whole-readiness promotion, lost close draft, duplicated date derivation or
      required extra text."
    test: close and review screens explain scope readiness and next practice with
      the date actually saved
  - id: ac-12
    description: Create/edit Theory through the existing full Add path, with a
      title-only default and optional source; no auto-creation on
      load/regenerate. Fixed multi-session library shows an eligible
      reading_theory task being offered when urgent needs are covered, lowers
      its repeat after actual practice, and excludes it when
      absent/resting/other-instrument. Opposing short-budget and imminent-class
      fixtures keep the urgent anchor. Reorder/swap/routine/direct practice
      record normal blocks with scope, do not misclassify theory as repertoire,
      invent musical facts or violate minute floors/shares.
    test: theory study uses ordinary practice items and earns bounded non urgent
      opportunities
  - id: ac-13
    description: "Committed pre-upgrade v16 fixture plus supported older chain:
      migration is deterministic, clock-free and idempotent. Old
      blocks/ids/results/notes/counters/SR/dates/provenance/commitments/referen\
      ces/catalogue and attachment bytes survive; no whole scope/readiness or
      missing routine block is inferred. Cover current/new fields, missing
      legacy scope, invalid type/value, duplicate ids and too-new data. New
      schema round-trips through exports and canonical hashing; equal inputs on
      different dates produce equal data/hashes."
    test: session model migration preserves history dates bytes and unresolved
      legacy meanings
  - id: ac-14
    description: Real store/browser inbound family across persist migrate AND merge,
      state/full import, sync pull/Keep remote, archive restore and cold-start
      recovery. Valid migrated/new data survives reload; malformed or too-new
      new semantics refuse without changing memory/disk/blobs. Active
      paused/running block/routine presence continues to defer/refuse
      replacement; fresh/legacy in-progress routines and dual-clock recovery
      preserve actual accumulated time. Full attachment bytes are proved outside
      WebKit Blob seeding. Update both-device compatibility is explicit; no
      older-schema silent field loss.
    test: session model inbound doors preserve live practice and fail before
      replacing data
  - id: ac-15
    description: Execute the actual setup against temporary mirror+file and
      direct-source layouts with fast-index/slow-package, dead/refused, missing
      suite, healthy fallback, no matching Azure source, missing list and
      all-unavailable cases. Demonstrate the chosen bypass/fallback prevents
      reliance on the known slow route, preserves
      suites/components/signatures/third-party sources, and ends clearly within
      its own bound. No source-text heuristic alone, global apt changes in tests
      or longer install timeout. Deterministic local proof satisfies this
      acceptance before review/seal; a pre-ship live Actions run is not
      required.
    test: ci browser setup avoids a fast index slow package mirror within the
      existing bounds
  - id: ac-16
    description: All three real suite workflows use the same bounded setup and
      lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy
      check parity, PR-only Gate, cancellation, job/install bounds and
      tests-before-deploy. Adapt existing runner tests to execution semantics,
      with missing-engine/late-setup/bypassed-check negative fixtures; no new
      bespoke YAML/source scanner. Prove the setup and gate wiring locally
      before review/seal. The real Actions run is post-ship evidence and must
      pass before merge; its absence before ship is not a blocker.
    test: ci release paths retain pinned dual engine provisioning and tests before
      publishing
  - id: ac-17
    description: "One bounded native-device regression pass on the built HTTPS
      candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit
      mixed Farsi/English notes while a routine changes item, dismiss the
      keyboard and use all five tabs, pause/resume after genuine idle and
      observe a real boundary cue/display wake. Record device/iOS/build and
      actual audible/wake outcome. No new calibration target, repeated UX taste
      sign-off or real NAS/media mutation; desktop WebKit cannot prove these
      physical/native properties."
    test: manual:OWNER
  - id: ac-18
    description: "One minimal OWNER product walkthrough using real Setar data on the
      built candidate: one unfinished piece being prepared for its named next
      class, focused chunk practice, its Next practice explanation, one Keep
      fresh item and one generated session plan. Record a brief judgement of
      whether the model and UX make sense for real practice. This is product
      acceptance only; do not manually recalculate dates, audit data
      correctness, supply a private export or broaden into a fresh product/taste
      review. Keep the separate native iPhone/sound check unchanged."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/scheduling-evidence.md
  - docs/repertoire-experience.md
  - docs/practice-session-model.md
createdAt: 2026-10-23T17:51:23.985Z
amendments: []
---

# Make practice records dependable and keep session choices aligned with the work being done

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/56
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** dc964b3b7eeb4099e7536ee8ed1a67db9cd37940 on main _(never re-baselined)_
- **Intent:** 20261023-make-practice-records-dependable-and-kee-34cc

## You may only change

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- docs/practice-session-model.md
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/defaults.ts
- src/domain/labels.ts
- src/domain/blocks.ts
- src/domain/routines.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/lessonAgenda.ts
- src/domain/selectors.ts
- src/domain/repertoire.ts
- src/domain/practiceInformation.ts
- src/domain/practiceSession.ts
- src/domain/practiceSessionModel.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/insights.ts
- src/domain/report.ts
- src/domain/canonical.ts
- src/domain/sync.ts
- src/domain/index.ts
- src/domain/util.ts
- src/store/useStore.ts
- src/store/lookups.ts
- src/store/sessionHelpers.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/databaseInstall.ts
- src/store/revision.ts
- src/store/syncEngine.ts
- src/store/notesDrafts.ts
- src/components/ItemNotes.tsx
- src/components/LessonNotes.tsx
- src/components/RoutineDuration.tsx
- src/components/RoutineContents.tsx
- src/components/useNotesDraft.ts
- src/components/ItemForm.tsx
- src/components/QuickAdd.tsx
- src/components/itemKinds.ts
- src/components/ItemCard.tsx
- src/components/ItemAgenda.tsx
- src/components/CloseDraft.tsx
- src/components/closeDraft.ts
- src/components/format.ts
- src/components/SchedulingExplanation.tsx
- src/components/ui.tsx
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/components/itemKinds.test.ts
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/NewItem.tsx
- src/pages/Repertoire.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Insights.tsx
- src/pages/TeacherReport.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- src/domain/routines.test.ts
- src/domain/scheduling.test.ts
- src/domain/blocks.test.ts
- src/domain/plan.test.ts
- src/domain/recommend.test.ts
- src/domain/scoring.test.ts
- src/domain/lessonAgenda.test.ts
- src/domain/selectors.test.ts
- src/domain/repertoire.test.ts
- src/domain/io.test.ts
- src/domain/migrations.test.ts
- src/domain/practiceSession.test.ts
- src/store/backup.test.ts
- src/store/syncEngine.test.ts
- tests/practice-session-families.test.ts
- tests/practice-session.browser.test.ts
- tests/practice-session-inbound.browser.test.ts
- tests/fixtures/practice-session-v16.json
- tests/fixtures/practice-session-expectations.json
- tests/ci-browser-setup.test.ts
- tests/post-practice.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/ui-date-refresh.browser.test.ts
- tests/ui-conformance.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practiceBrowser.ts
- tests/agent-context.test.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- scripts/prepare-ci-browsers.sh

## Never touch

- src/domain/setarClasses.ts
- src/domain/sourceArchive.ts
- src/domain/setarSetup.ts
- src/domain/khonyagarData.ts
- src/domain/cgsData.ts
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/nas-mirror.mjs
- src/components/viewport.ts
- src/components/useViewportGuard.ts
- src/components/appUpdate.ts
- src/components/practiceCue.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/store/gitRemote.ts
- src/store/githubSync.ts
- .prismatica/rules.md
- .prismatica/flows/*.md
- CLAUDE.md
- package.json
- package-lock.json

## Non-goals

- One item, mode, focus, result and next action per block; the latest non-empty next action remains visible before practice. Separate notes, observations, next actions and lesson agenda retain their canonical homes.
- Local-first offline PWA; no backend/auth/runtime paid service, gamification, audio/AI grading or guilt-driven copy. GitHub snapshot transport, conflict archives, attachment bytes, device-only secrets and unfinished-practice replacement protection remain intact.
- Wall-clock minutes, one active clock, gesture-primed fresh audio contexts, marker claims, visual boundaries and wake-lock lifecycle remain independent of feedback, note writes and controls. Preserve update offer/reload ownership and build-input stamp.
- Instrument scoping, independent Plan/Routines doorways above the recommendation, catalogue/source/term identity, explicit adoption, NAS references and archive authority boundaries remain intact.
- Only main scrolls, existing native keyboard/tab fixes, mixed-language direction, one h1, named accessible controls, 44px mobile targets and 390px reflow remain protected. No viewport/audio/service-worker redesign.
- No implementation in this planning session, private database inspection, guessed repair/backfill of lost historical practice, NAS/archive/course redesign, research claims of optimal intervals, theory curriculum or generated musical authority.
- No new settings dashboard, second planner/ranking engine, third creation path, routine-to-full-close wizard, running-plan reorder, automatic redistribution after session remove/skip/move-on, analytics redesign or general test-harness rewrite.
- No permission to submit/merge/deploy, approve signed Flow/Rule changes, erase owner data or broaden into unrelated findings. Claude follows the normal governed owner boundaries.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path. _(proof: routine completion and history preserve all practised items without feedback)_
- [ ] **ac-2** — Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names. _(proof: routine controls distinguish skipped time from partial practice across run transitions)_
- [ ] **ac-3** — Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time. _(proof: routine contents and controls describe the exact run started from every doorway)_
- [ ] **ac-4** — Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks. _(proof: session plan reordering preserves segment identity allocation and execution order)_
- [ ] **ac-5** — Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow. _(proof: session plan move controls work by keyboard and touch without losing the draft)_
- [ ] **ac-6** — Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged. _(proof: working note drafts survive exits boundaries and reload without Done)_
- [ ] **ac-7** — Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave. _(proof: working note saves preserve newest text and refuse stale ownership across failures and replacement)_
- [ ] **ac-8** — Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries. _(proof: scoped evidence separates focused progress from whole item retention and readiness)_
- [ ] **ac-9** — Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale. _(proof: working returns stay short while protected dates and retention spacing keep their authority)_
- [ ] **ac-10** — An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity. _(proof: class preparation and shared recommendation pools return useful work without repetition noise)_
- [ ] **ac-11** — Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text. _(proof: close and review screens explain scope readiness and next practice with the date actually saved)_
- [ ] **ac-12** — Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares. _(proof: theory study uses ordinary practice items and earns bounded non urgent opportunities)_
- [ ] **ac-13** — Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes. _(proof: session model migration preserves history dates bytes and unresolved legacy meanings)_
- [ ] **ac-14** — Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss. _(proof: session model inbound doors preserve live practice and fail before replacing data)_
- [ ] **ac-15** — Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-16** — All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker. _(proof: ci release paths retain pinned dual engine provisioning and tests before publishing)_
- [ ] **ac-17** — One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties. _(proof: manual:OWNER)_
- [ ] **ac-18** — One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- docs/practice-session-model.md

## Amendments

_none_

