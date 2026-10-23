---
id: 20261022-refresh-the-ui-consistently-fix-confirme-3b19
title: Refresh the UI consistently, fix confirmed interaction bugs and preserve
  proven mobile behaviour
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/54
intent: 20261022-refresh-the-ui-consistently-fix-confirme-3b19
tier: heavy
stage: accept
baseline:
  commit: 24a84beeb19cfbd0e0e43682b5644c2b50657961
  branch: main
branch: change/20261022-refresh-the-ui-consistently-fix-confirme-3b19
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261022-refresh-the-ui-consistently-fix-confirme-3b19
builder: claude
planHash: bcab89c3607566173e8e0f3eae2b6cd90553ac6839b31c5f8c69da1f9c7df0bb
allowedPaths:
  - src/styles/global.css
  - src/styles/contrast.test.ts
  - src/components/ArchiveRefresh.tsx
  - src/components/Attachments.tsx
  - src/components/ClassQuestions.tsx
  - src/components/InstallHint.tsx
  - src/components/ItemCard.tsx
  - src/components/ItemForm.tsx
  - src/components/ItemMaterial.tsx
  - src/components/ItemNotes.tsx
  - src/components/LessonAgenda.tsx
  - src/components/LessonNotes.tsx
  - src/components/MusicalTermField.tsx
  - src/components/QuickAdd.tsx
  - src/components/ReferenceChoices.tsx
  - src/components/ReferenceEditor.tsx
  - src/components/RoutineDuration.tsx
  - src/components/SetarSetupReview.tsx
  - src/components/icons.tsx
  - src/components/ui.tsx
  - src/components/direction.test.ts
  - src/components/format.test.ts
  - src/components/format.ts
  - src/components/itemFields.ts
  - src/components/itemFormValues.ts
  - src/components/itemKinds.test.ts
  - src/components/itemKinds.ts
  - src/components/options.ts
  - src/components/pressedState.test.ts
  - src/components/useDecisionNow.ts
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/Insights.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/Materials.tsx
  - src/pages/More.tsx
  - src/pages/MusicTerms.tsx
  - src/pages/NewItem.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/Repertoire.tsx
  - src/pages/RoutineEdit.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/Settings.tsx
  - src/pages/StageDetail.tsx
  - src/pages/StartBlock.tsx
  - src/pages/TeacherReport.tsx
  - src/pages/Today.tsx
  - src/domain/util.ts
  - src/domain/index.ts
  - src/domain/insights.ts
  - src/domain/insights.test.ts
  - src/domain/report.ts
  - src/domain/report.test.ts
  - src/domain/questions.ts
  - src/domain/questions.test.ts
  - src/domain/repertoire.ts
  - src/domain/repertoire.test.ts
  - src/domain/routines.test.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/setarSetup.ts
  - src/store/useStore.ts
  - tests/app-update.browser.test.ts
  - tests/app-version.test.ts
  - tests/daily-practice.browser.test.ts
  - tests/journey-harness.browser.test.ts
  - tests/lesson-agenda.browser.test.ts
  - tests/lessonNotes.browser.test.ts
  - tests/musical-term-suggestions.browser.test.ts
  - tests/owned-writes.test.ts
  - tests/post-practice.browser.test.ts
  - tests/practice-cues.browser.test.ts
  - tests/practice-information-inbound.browser.test.ts
  - tests/practice-information-layout.browser.test.ts
  - tests/practice-information.browser.test.ts
  - tests/practiceBrowser.ts
  - tests/repertoire-experience.browser.test.ts
  - tests/repertoire-families.test.ts
  - tests/repertoire-inbound.browser.test.ts
  - tests/repertoire-viewport.browser.test.ts
  - tests/review-ownership.browser.test.ts
  - tests/setar-practice-inbound.browser.test.ts
  - tests/setar-practice-proof.test.ts
  - tests/setar-practice-relations.test.ts
  - tests/setar-practice-source.test.ts
  - tests/setar-practice.browser.test.ts
  - tests/setar-review-ui.browser.test.ts
  - tests/setarArchive.browser.test.ts
  - tests/setarInbound.browser.test.ts
  - tests/fixtures/practice-decisions-v11.json
  - tests/fixtures/practice-decisions-v12.json
  - tests/fixtures/practice-information-v12.json
  - tests/fixtures/practice-information-v13.json
  - tests/fixtures/repertoire-current-v15.json
  - tests/fixtures/repertoire-family-expectations.json
  - tests/fixtures/repertoire-legacy-v14.json
  - tests/fixtures/setar-archive.json
  - tests/fixtures/setar-legacy-v13.json
  - tests/fixtures/setar-practice-owner-v15.json
  - tests/fixtures/setar-practice-owner-v16.json
  - tests/fixtures/setar-practice-setup-expectations.json
  - tests/fixtures/setar-practice-source-expectations.json
  - tests/fixtures/setar-practice-source-v1.json
  - tests/fixtures/setar-review-ui.json
  - AGENTS.md
  - DECISIONS.md
  - README.md
  - src/components/closeDraft.ts
  - src/components/closeDraft.test.ts
  - src/components/SchedulingExplanation.tsx
  - tests/ui-conformance.browser.test.ts
  - tests/ui-date-refresh.browser.test.ts
  - tests/ui-refresh-store.test.ts
  - tests/ui-guidance.test.ts
  - tests/fixtures/ui-refresh.json
  - src/components/itemFormValues.test.ts
  - docs/setar-archive.md
  - docs/cgs-course.md
  - docs/khonyagar-course.md
  - docs/repertoire-experience.md
  - docs/scheduling-evidence.md
  - docs/setar-practice-reliability.md
forbiddenPaths:
  - src/components/Layout.tsx
  - src/components/viewport.ts
  - src/components/viewport.test.ts
  - src/components/useViewportGuard.ts
  - src/components/useScreenAwake.ts
  - src/components/screenAwake.ts
  - src/components/screenAwake.test.ts
  - src/components/practiceCue.ts
  - src/components/practiceCue.test.ts
  - src/components/appUpdate.ts
  - src/components/appUpdate.test.ts
  - src/App.tsx
  - src/main.tsx
  - src/domain/types.ts
  - src/domain/io.ts
  - src/domain/migrations.ts
  - src/domain/scheduling.ts
  - src/domain/scoring.ts
  - src/domain/plan.ts
  - src/domain/sync.ts
  - src/store/idb.ts
  - src/store/backup.ts
  - src/store/syncEngine.ts
  - src/store/githubSync.ts
  - tests/journey-waits.test.ts
  - tests/agent-context.test.ts
  - tests/ci-browser-setup.test.ts
  - index.html
  - vite.config.ts
  - package.json
  - package-lock.json
  - public/**
  - scripts/**
  - .github/**
  - .prismatica/**
nonGoals:
  - Today keeps switcher, then Plan, then Routines, then Practise now, with the
    recommendation above the fold at 390x844 (owner decision 2026-09-11,
    asserted by repertoire-viewport).
  - "The App-shell block of global.css (height model, overflow, safe-area
    padding, .tabbar/.tab geometry), Layout.tsx, viewport.ts and
    useViewportGuard.ts: tab colour and type may change, geometry may not."
  - "Accessible names of existing controls and the existing journey contracts
    and selectors (.list-row, .row-title, .notes-read, .page-title, .page-sub,
    pre.pre, .toast, .stat, .stat-value, .stage-unit, .stage-unit-menu-list,
    .card, .tabbar, a.tab.active, article, details/summary, main section h2):
    preserve their observable meaning; do not freeze unrelated DOM structure. An
    existing assertion changes only where this plan changes what it asserts
    (approved wording, isolated export text, ledgers at fixed sites); none is
    weakened or deleted, and no harness rule (waits, page-error capture) is
    relaxed."
  - "Practice and review semantics: a result is required, Save without a result
    keeps its meaning, review and SM-2 decisions are untouched, the date shown
    is the date saved, start stays under 30s and close under 60s, and no field
    becomes required."
  - "Saved data: no schema, SCHEMA_VERSION, validateDB, migration, sync or
    backup format change, and no new refusal on read — data already holding a
    self-parent or an empty instrument name loads as before."
  - "Direction mechanics: every dir is written literally; ltr/rtl only on span
    or bdi; nothing detects script or reorders text; unicode-bidi: plaintext
    only on .input/.textarea."
  - No new dependency, webfont, network endpoint or CSP change.
  - "Preserve the measured shell outcome: after keyboard dismissal the bottom
    tabs return to their normal position and stay reachable, including retained
    focus. Never force blur, suppress zoom, change main scroll ownership, or
    replace the standalone 100vh fix with 100dvh. Shell source exclusions do not
    excuse regressions caused by global type/spacing styles."
  - "Settings' .toast stays position: fixed, without changing its lifecycle; a
    detachment assertion does not require fixed positioning — a known exception
    to 'nothing is fixed', for its own lane."
  - The ~480 inline style objects are not normalised; consistency is judged
    against the look spec only.
  - Strings fused in components (StageDetail notices, ItemDetail/Attachments
    size notes, ArchiveRefresh 'Link to' labels whose names journeys use,
    Settings import results) and domain refusal or validation messages keep
    their current wording; a follow-up.
  - <option> text and confirm()/alert() strings (AGENTS.md).
  - Insights' tone colours, the balance bar and copy tone beyond the window
    wording; More > Keyboard trace.
  - "Release valve: a pre-existing defect that is not on this plan's list, not
    in a family one of its guards covers, and not introduced or worsened by the
    diff is recorded as a DECISIONS.md follow-up, never a blocking finding."
  - "Review standard: a blocking finding names a broken contract item — a
    mustNotChange line, an applicable AGENTS.md rule within scope, an acceptance
    check, a listed fix missing or wrong, or a regression this diff introduced.
    The look spec is judged on global.css, the shared ui.tsx primitives and the
    sites this plan names; taste and per-site polish beyond that are the owner's
    manual check."
  - The release valve applies to pre-existing out-of-scope rule violations too;
    it cannot excuse a listed fix, in-scope family failure, or
    introduced/worsened regression. Report reproducible failures together per
    review, distinguishing blockers from owner taste. Do not reopen an accepted
    implementation choice without new evidence.
  - "Desired rule (not yet truth): Screens reflow at phone width, expose named
    controls and clear heading structure, and provide usable touch targets under
    the stated UI convention and exceptions; the route sweep protects these
    outcomes."
acceptanceChecks:
  - id: ac-1
    description: "tests/ui-conformance.browser.test.ts, WebKit and Chromium at
      390x844 and Chromium at 1280x900, on a committed mixed-language fixture (a
      Farsi-named and an English-named instrument holding titles in the other
      language, and a Farsi title followed by digits). Routes: Today (session
      and Overview), Repertoire's three views, Start, Active, Close, Plan,
      Routine new and a runner, Lessons, New item, an item, a pathway, a stage,
      Study sources, Musical terms, Insights, Teacher report, More, Settings. On
      every route: no unintended horizontal scrolling or clipped content in
      page/main/content containers, including the Insights table (native
      editable text scrolling and intentional clipping of decorative content are
      not failures); every visible control has an accessible name; exactly one
      h1; shared layout primitives retain their intended row/stack geometry,
      including link-card combinations; at 390 the 44px floor holds (stars and
      in-text links excepted); no page error. It collects every failure before
      asserting, so one run names the whole inventory; red on base for B1 and
      B11-B13. Use the existing browser harness and deterministic readiness;
      share setup where safe, but reset state when a journey mutates it. Do not
      prescribe timeout/runtime budgets or detect accessible names solely from
      aria-label. Exercise representative disclosures and editable states, not
      just initial route loads. Existing named regression journeys may supply
      coverage rather than duplicating it."
    test: every route reflows, names its controls and meets the touch floor
  - id: ac-2
    description: "Same fixture, both engines at 390, positions measured rather than
      attributes read: Today's due caption reads 'due' before its day; the
      'Then, if you have time' reason and the Overview 'next:' line show their
      first word; Repertoire's 'gusheh:' precedes its value; a Farsi stage title
      and its intro share the right edge while an English one stays left;
      ItemDetail's 'Study source:' keeps its gap on the value's side; an
      Insights body and a Teacher report preview line holding a Farsi title
      followed by digits keep their English words in order; QuickAdd's Farsi
      instrument name computes rtl."
    test: mismatched languages keep their own direction on every fixed surface
  - id: ac-3
    description: "Extend src/components/direction.test.ts for the B6 structural
      families: data-title anchors, generated words with owner values, label
      separators and instrument names across files. Discover candidate sites and
      report all failures together; define the supported source shapes and
      reasoned exclusions. Prove representative seeded regressions fail for each
      added shape, supplemented by ac-2 browser geometry. No universal JSX
      analyser or parser rewrite is required; false positives are not product
      defects. Reuse the existing direction ledgers and do not hide unfixed
      in-scope sites."
    test: owner text and generated words keep their own direction
  - id: ac-4
    description: "src/domain/insights.test.ts on fixtures with Farsi and English
      titles followed by digits, windows 7 and 30: every interpolated owner
      value is isolated without changing its content or double wrapping an
      already isolated value; no title embeds a value; window wording follows
      windowDays (30 never says 'this week'); each insight's scope matches its
      data; expected wording independently encodes the approved B4 and title
      changes; other wording and stored values remain unchanged."
    test: insights isolate owner text and say which window they describe
  - id: ac-5
    description: "src/domain/report.test.ts over buildTeacherReport and
      renderClassQuestionsText: every interpolated owner value (instrument name,
      titles, questions, answers, observations) is isolated without content loss
      or double wrapping; removing only newly added wrapper marks yields the
      base output byte for byte, against expected text committed before the
      change; a Farsi title followed by digits is among the fixtures."
    test: exported class text isolates every owner value and keeps its wording
  - id: ac-6
    description: "src/domain/repertoire.test.ts, the shared parent refusal: itself,
      one of its own parts, a part as parent, an item on another instrument, and
      a work that has parts becoming a part are each refused with a reason,
      while a top-level item on the same instrument is accepted; ItemForm's
      options use it, and through the real store (idb mocked as in
      practiceCue.test.ts) updateItem refuses a self-parent while saving a valid
      parent. Cover missing parent, creation as well as update, instrument
      changes on either side of a parent/part relationship, clearing the link,
      and an unrelated edit to a legacy-invalid record. Refusal leaves the
      database and revision unchanged; valid changes save. No inbound-read
      refusal is added."
    test: a parent is refused for itself, its parts or a work with parts, and kept
      otherwise
  - id: ac-7
    description: "src/components/itemFormValues.test.ts: Persian to Guitar, Guitar
      to Persian, the same family and an unchanged instrument: only the identity
      fields the new family cannot show are dropped; every other value is kept."
    test: switching instrument family drops identity fields the new family cannot
      show
  - id: ac-8
    description: "Browser, Settings at 390, both engines: renaming an instrument to
      '  Tar 2  ' commits on blur and survives a reload as 'Tar 2'; clearing the
      name is refused with a visible reason and the saved name is still there
      after a reload. Exercise the store refusal directly as well as UI commit;
      no partial rename or unrelated field change on refusal, and Enter followed
      by blur does not apply the rename twice."
    test: an instrument rename saves trimmed on commit and an empty name is refused
  - id: ac-9
    description: "Browser, Settings at 390, both engines: each section is an h2; no
      control sits inside a closed disclosure except those ArchiveRefresh and
      SetarSetupReview already have; the priority formula is visible with live
      values; reference prose is collapsed and sections/controls remain
      discoverable by headings and keyboard; the Device copy no longer says the
      newest copy wins."
    test: Settings keeps every control in reach under headed sections
  - id: ac-10
    description: "tests/post-practice.browser.test.ts, both engines at 390: choose a
      result, type an observation and a next action, open the review controls
      and tap 'Why this date?': the explanation shows on /close with the live
      first gap, the typed text and the result are still there, and Save writes
      them. Other close inputs, including duration correction, manual review
      choice, item edits and teacher question, remain intact; shared explanation
      values follow Settings without changing the decision."
    test: why this date explains in place and keeps the close draft
  - id: ac-11
    description: "Browser test with a controlled clock and real UI: cross local
      midnight while Lessons, Repertoire and StageDetail remain mounted;
      relative dates, upcoming lessons and lesson preparation eligibility
      refresh through the existing ticking clock. Include imported future-dated
      lesson history so it does not become an upcoming class. Use explicit
      expected states, not a source ban on new Date or a frozen-time sleep.
      Inventory the known consumers; source checks may supplement, not
      substitute for this behaviour."
    test: date-dependent screens refresh across midnight without remounting
  - id: ac-12
    description: Existing src/styles/contrast.test.ts remains green for its listed
      pair-specific thresholds in all palette blocks; separately compare
      existing colour token values with the baseline, since contrast alone does
      not prove the palette is unchanged. New pairings, if any, join the
      existing coverage.
    test: every listed colour pair meets WCAG AA in every block where its tokens are
      declared
  - id: ac-13
    description: "Regression guard (existing,
      tests/repertoire-viewport.browser.test.ts): Today's order and the
      recommendation above the fold at 390x844 survive the taller controls;
      Repertoire stays reflowed, named and keyboard-reachable."
    test: the shared practice shell remains accessible and readable across layouts
  - id: ac-14
    description: "Owner on the candidate build, installed iPhone PWA AND Safari:
      repeat keyboard open/dismiss with focus retained on Close, notes and a
      lesson question; verify tabs return and remain reachable, with main scroll
      usable. Include route change, rotation, background/resume and pinch zoom,
      checking after dismissal at normal scale; record device, OS, build and
      outcome, without claiming browser fixtures prove native behaviour. On
      MacBook and iPhone in light/dark, review the small before/after packet
      against the look spec and paste a mixed-language report into Messages.
      Owner taste adjustments within the spec are a passing refinement, not a
      new reviewer family. Actual regressions remain blockers."
    test: manual:OWNER
  - id: ac-15
    description: "Browser through real controls: fill close inputs, Back, practise
      further, Finish; retain result/text/manual choices/item edits/question,
      refresh an untouched duration proposal and preserve a corrected duration.
      Save creates one block with the retained values and the displayed current
      review decision. Repeat with discard and a new session on the SAME item,
      verifying no draft leakage. Include a day/settings change while away so
      derived dates refresh rather than restoring stale calculations; old
      session completion cannot clear or overwrite a newer draft."
    test: close draft survives Back for the same block and never leaks to another
      session
  - id: ac-16
    description: Reuse the exact existing tests/repertoire-viewport.browser.test.ts
      test and src/components/viewport.test.ts fixtures unchanged in the
      required check. Preserve standalone height, safe areas, main-only
      scrolling and diagnostic trace. This guards the scripted mechanism; native
      keyboard acceptance remains manual:OWNER.
    test: viewport recovery respects focus zoom and scroll ownership
  - id: ac-17
    description: A focused test under tests/ verifies both AGENTS.md and the
      recursive CLAUDE.md import profile leave at least 3584 bytes (3.5 KiB)
      under 32768 after additions, reusing the existing counting semantics. Keep
      existing agent-context budget, prohibition and path tests unchanged and
      green. Review the short baseline-to-final disposition of condensed
      sections for semantic preservation; passing phrase checks alone is not
      sufficient.
    test: UI refresh leaves instruction headroom without losing current prohibitions
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - README.md
createdAt: 2026-10-22T22:58:35.149Z
amendments:
  - at: 2026-10-23T00:05:15.830Z
    reason: "AGENTS headroom: mechanism detail moves to subsystem docs"
    description: "allow: +docs/setar-archive.md, docs/cgs-course.md,
      docs/khonyagar-course.md, docs/repertoire-experience.md,
      docs/scheduling-evidence.md"
  - at: 2026-10-23T00:19:56.406Z
    reason: "AGENTS headroom: move hands-free practice mechanism detail to its
      subsystem doc while keeping every rule represented in AGENTS.md"
    description: "allow: +docs/setar-practice-reliability.md"
  - at: 2026-10-23T00:34:10.800Z
    reason: "AGENTS headroom: with every rule kept in AGENTS.md and subsystem
      mechanism moved to its docs, wording-only condensation leaves 3,819 bytes;
      ac-17 requires 3,584 (3.5 KiB) instead of 4,096"
    description: "checks: +ac-17|A focused test under tests/ verifies both AGENTS.md
      and the recursive CLAUDE.md import profile leave at least 3584 bytes (3.5
      KiB) under 32768 after additions, reusing the existing counting semantics.
      Keep existing agent-context budget, prohibition and path tests unchanged
      and green. Review the short baseline-to-final disposition of condensed
      sections for semantic preservation; passing phrase checks alone is not
      sufficient.|UI refresh leaves instruction headroom without losing current
      prohibitions -ac-17|A focused test under tests/ verifies both AGENTS.md
      and the recursive CLAUDE.md import profile leave at least 4096 bytes under
      32768 after additions, reusing the existing counting semantics. Keep
      existing agent-context budget, prohibition and path tests unchanged and
      green. Review the short baseline-to-final disposition of condensed
      sections for semantic preservation; passing phrase checks alone is not
      sufficient.|UI refresh leaves instruction headroom without losing current
      prohibitions"
---

# Refresh the UI consistently, fix confirmed interaction bugs and preserve proven mobile behaviour

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/54
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 24a84beeb19cfbd0e0e43682b5644c2b50657961 on main _(never re-baselined)_
- **Intent:** 20261022-refresh-the-ui-consistently-fix-confirme-3b19

## You may only change

- src/styles/global.css
- src/styles/contrast.test.ts
- src/components/ArchiveRefresh.tsx
- src/components/Attachments.tsx
- src/components/ClassQuestions.tsx
- src/components/InstallHint.tsx
- src/components/ItemCard.tsx
- src/components/ItemForm.tsx
- src/components/ItemMaterial.tsx
- src/components/ItemNotes.tsx
- src/components/LessonAgenda.tsx
- src/components/LessonNotes.tsx
- src/components/MusicalTermField.tsx
- src/components/QuickAdd.tsx
- src/components/ReferenceChoices.tsx
- src/components/ReferenceEditor.tsx
- src/components/RoutineDuration.tsx
- src/components/SetarSetupReview.tsx
- src/components/icons.tsx
- src/components/ui.tsx
- src/components/direction.test.ts
- src/components/format.test.ts
- src/components/format.ts
- src/components/itemFields.ts
- src/components/itemFormValues.ts
- src/components/itemKinds.test.ts
- src/components/itemKinds.ts
- src/components/options.ts
- src/components/pressedState.test.ts
- src/components/useDecisionNow.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Insights.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Materials.tsx
- src/pages/More.tsx
- src/pages/MusicTerms.tsx
- src/pages/NewItem.tsx
- src/pages/PathwayDetail.tsx
- src/pages/Repertoire.tsx
- src/pages/RoutineEdit.tsx
- src/pages/RoutineRunner.tsx
- src/pages/SessionPlan.tsx
- src/pages/Settings.tsx
- src/pages/StageDetail.tsx
- src/pages/StartBlock.tsx
- src/pages/TeacherReport.tsx
- src/pages/Today.tsx
- src/domain/util.ts
- src/domain/index.ts
- src/domain/insights.ts
- src/domain/insights.test.ts
- src/domain/report.ts
- src/domain/report.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/repertoire.ts
- src/domain/repertoire.test.ts
- src/domain/routines.test.ts
- src/domain/lessonAgenda.test.ts
- src/domain/setarSetup.ts
- src/store/useStore.ts
- tests/app-update.browser.test.ts
- tests/app-version.test.ts
- tests/daily-practice.browser.test.ts
- tests/journey-harness.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/musical-term-suggestions.browser.test.ts
- tests/owned-writes.test.ts
- tests/post-practice.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practiceBrowser.ts
- tests/repertoire-experience.browser.test.ts
- tests/repertoire-families.test.ts
- tests/repertoire-inbound.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice-proof.test.ts
- tests/setar-practice-relations.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-review-ui.browser.test.ts
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/fixtures/practice-decisions-v11.json
- tests/fixtures/practice-decisions-v12.json
- tests/fixtures/practice-information-v12.json
- tests/fixtures/practice-information-v13.json
- tests/fixtures/repertoire-current-v15.json
- tests/fixtures/repertoire-family-expectations.json
- tests/fixtures/repertoire-legacy-v14.json
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-legacy-v13.json
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json
- tests/fixtures/setar-practice-setup-expectations.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-source-v1.json
- tests/fixtures/setar-review-ui.json
- AGENTS.md
- DECISIONS.md
- README.md
- src/components/closeDraft.ts
- src/components/closeDraft.test.ts
- src/components/SchedulingExplanation.tsx
- tests/ui-conformance.browser.test.ts
- tests/ui-date-refresh.browser.test.ts
- tests/ui-refresh-store.test.ts
- tests/ui-guidance.test.ts
- tests/fixtures/ui-refresh.json
- src/components/itemFormValues.test.ts
- docs/setar-archive.md
- docs/cgs-course.md
- docs/khonyagar-course.md
- docs/repertoire-experience.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Never touch

- src/components/Layout.tsx
- src/components/viewport.ts
- src/components/viewport.test.ts
- src/components/useViewportGuard.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/components/screenAwake.test.ts
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/appUpdate.ts
- src/components/appUpdate.test.ts
- src/App.tsx
- src/main.tsx
- src/domain/types.ts
- src/domain/io.ts
- src/domain/migrations.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/plan.ts
- src/domain/sync.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- tests/journey-waits.test.ts
- tests/agent-context.test.ts
- tests/ci-browser-setup.test.ts
- index.html
- vite.config.ts
- package.json
- package-lock.json
- public/**
- scripts/**
- .github/**
- .prismatica/**

## Non-goals

- Today keeps switcher, then Plan, then Routines, then Practise now, with the recommendation above the fold at 390x844 (owner decision 2026-09-11, asserted by repertoire-viewport).
- The App-shell block of global.css (height model, overflow, safe-area padding, .tabbar/.tab geometry), Layout.tsx, viewport.ts and useViewportGuard.ts: tab colour and type may change, geometry may not.
- Accessible names of existing controls and the existing journey contracts and selectors (.list-row, .row-title, .notes-read, .page-title, .page-sub, pre.pre, .toast, .stat, .stat-value, .stage-unit, .stage-unit-menu-list, .card, .tabbar, a.tab.active, article, details/summary, main section h2): preserve their observable meaning; do not freeze unrelated DOM structure. An existing assertion changes only where this plan changes what it asserts (approved wording, isolated export text, ledgers at fixed sites); none is weakened or deleted, and no harness rule (waits, page-error capture) is relaxed.
- Practice and review semantics: a result is required, Save without a result keeps its meaning, review and SM-2 decisions are untouched, the date shown is the date saved, start stays under 30s and close under 60s, and no field becomes required.
- Saved data: no schema, SCHEMA_VERSION, validateDB, migration, sync or backup format change, and no new refusal on read — data already holding a self-parent or an empty instrument name loads as before.
- Direction mechanics: every dir is written literally; ltr/rtl only on span or bdi; nothing detects script or reorders text; unicode-bidi: plaintext only on .input/.textarea.
- No new dependency, webfont, network endpoint or CSP change.
- Preserve the measured shell outcome: after keyboard dismissal the bottom tabs return to their normal position and stay reachable, including retained focus. Never force blur, suppress zoom, change main scroll ownership, or replace the standalone 100vh fix with 100dvh. Shell source exclusions do not excuse regressions caused by global type/spacing styles.
- Settings' .toast stays position: fixed, without changing its lifecycle; a detachment assertion does not require fixed positioning — a known exception to 'nothing is fixed', for its own lane.
- The ~480 inline style objects are not normalised; consistency is judged against the look spec only.
- Strings fused in components (StageDetail notices, ItemDetail/Attachments size notes, ArchiveRefresh 'Link to' labels whose names journeys use, Settings import results) and domain refusal or validation messages keep their current wording; a follow-up.
- <option> text and confirm()/alert() strings (AGENTS.md).
- Insights' tone colours, the balance bar and copy tone beyond the window wording; More > Keyboard trace.
- Release valve: a pre-existing defect that is not on this plan's list, not in a family one of its guards covers, and not introduced or worsened by the diff is recorded as a DECISIONS.md follow-up, never a blocking finding.
- Review standard: a blocking finding names a broken contract item — a mustNotChange line, an applicable AGENTS.md rule within scope, an acceptance check, a listed fix missing or wrong, or a regression this diff introduced. The look spec is judged on global.css, the shared ui.tsx primitives and the sites this plan names; taste and per-site polish beyond that are the owner's manual check.
- The release valve applies to pre-existing out-of-scope rule violations too; it cannot excuse a listed fix, in-scope family failure, or introduced/worsened regression. Report reproducible failures together per review, distinguishing blockers from owner taste. Do not reopen an accepted implementation choice without new evidence.
- Desired rule (not yet truth): Screens reflow at phone width, expose named controls and clear heading structure, and provide usable touch targets under the stated UI convention and exceptions; the route sweep protects these outcomes.

## Acceptance checks (definition of done)

- [ ] **ac-1** — tests/ui-conformance.browser.test.ts, WebKit and Chromium at 390x844 and Chromium at 1280x900, on a committed mixed-language fixture (a Farsi-named and an English-named instrument holding titles in the other language, and a Farsi title followed by digits). Routes: Today (session and Overview), Repertoire's three views, Start, Active, Close, Plan, Routine new and a runner, Lessons, New item, an item, a pathway, a stage, Study sources, Musical terms, Insights, Teacher report, More, Settings. On every route: no unintended horizontal scrolling or clipped content in page/main/content containers, including the Insights table (native editable text scrolling and intentional clipping of decorative content are not failures); every visible control has an accessible name; exactly one h1; shared layout primitives retain their intended row/stack geometry, including link-card combinations; at 390 the 44px floor holds (stars and in-text links excepted); no page error. It collects every failure before asserting, so one run names the whole inventory; red on base for B1 and B11-B13. Use the existing browser harness and deterministic readiness; share setup where safe, but reset state when a journey mutates it. Do not prescribe timeout/runtime budgets or detect accessible names solely from aria-label. Exercise representative disclosures and editable states, not just initial route loads. Existing named regression journeys may supply coverage rather than duplicating it. _(proof: every route reflows, names its controls and meets the touch floor)_
- [ ] **ac-2** — Same fixture, both engines at 390, positions measured rather than attributes read: Today's due caption reads 'due' before its day; the 'Then, if you have time' reason and the Overview 'next:' line show their first word; Repertoire's 'gusheh:' precedes its value; a Farsi stage title and its intro share the right edge while an English one stays left; ItemDetail's 'Study source:' keeps its gap on the value's side; an Insights body and a Teacher report preview line holding a Farsi title followed by digits keep their English words in order; QuickAdd's Farsi instrument name computes rtl. _(proof: mismatched languages keep their own direction on every fixed surface)_
- [ ] **ac-3** — Extend src/components/direction.test.ts for the B6 structural families: data-title anchors, generated words with owner values, label separators and instrument names across files. Discover candidate sites and report all failures together; define the supported source shapes and reasoned exclusions. Prove representative seeded regressions fail for each added shape, supplemented by ac-2 browser geometry. No universal JSX analyser or parser rewrite is required; false positives are not product defects. Reuse the existing direction ledgers and do not hide unfixed in-scope sites. _(proof: owner text and generated words keep their own direction)_
- [ ] **ac-4** — src/domain/insights.test.ts on fixtures with Farsi and English titles followed by digits, windows 7 and 30: every interpolated owner value is isolated without changing its content or double wrapping an already isolated value; no title embeds a value; window wording follows windowDays (30 never says 'this week'); each insight's scope matches its data; expected wording independently encodes the approved B4 and title changes; other wording and stored values remain unchanged. _(proof: insights isolate owner text and say which window they describe)_
- [ ] **ac-5** — src/domain/report.test.ts over buildTeacherReport and renderClassQuestionsText: every interpolated owner value (instrument name, titles, questions, answers, observations) is isolated without content loss or double wrapping; removing only newly added wrapper marks yields the base output byte for byte, against expected text committed before the change; a Farsi title followed by digits is among the fixtures. _(proof: exported class text isolates every owner value and keeps its wording)_
- [ ] **ac-6** — src/domain/repertoire.test.ts, the shared parent refusal: itself, one of its own parts, a part as parent, an item on another instrument, and a work that has parts becoming a part are each refused with a reason, while a top-level item on the same instrument is accepted; ItemForm's options use it, and through the real store (idb mocked as in practiceCue.test.ts) updateItem refuses a self-parent while saving a valid parent. Cover missing parent, creation as well as update, instrument changes on either side of a parent/part relationship, clearing the link, and an unrelated edit to a legacy-invalid record. Refusal leaves the database and revision unchanged; valid changes save. No inbound-read refusal is added. _(proof: a parent is refused for itself, its parts or a work with parts, and kept otherwise)_
- [ ] **ac-7** — src/components/itemFormValues.test.ts: Persian to Guitar, Guitar to Persian, the same family and an unchanged instrument: only the identity fields the new family cannot show are dropped; every other value is kept. _(proof: switching instrument family drops identity fields the new family cannot show)_
- [ ] **ac-8** — Browser, Settings at 390, both engines: renaming an instrument to '  Tar 2  ' commits on blur and survives a reload as 'Tar 2'; clearing the name is refused with a visible reason and the saved name is still there after a reload. Exercise the store refusal directly as well as UI commit; no partial rename or unrelated field change on refusal, and Enter followed by blur does not apply the rename twice. _(proof: an instrument rename saves trimmed on commit and an empty name is refused)_
- [ ] **ac-9** — Browser, Settings at 390, both engines: each section is an h2; no control sits inside a closed disclosure except those ArchiveRefresh and SetarSetupReview already have; the priority formula is visible with live values; reference prose is collapsed and sections/controls remain discoverable by headings and keyboard; the Device copy no longer says the newest copy wins. _(proof: Settings keeps every control in reach under headed sections)_
- [ ] **ac-10** — tests/post-practice.browser.test.ts, both engines at 390: choose a result, type an observation and a next action, open the review controls and tap 'Why this date?': the explanation shows on /close with the live first gap, the typed text and the result are still there, and Save writes them. Other close inputs, including duration correction, manual review choice, item edits and teacher question, remain intact; shared explanation values follow Settings without changing the decision. _(proof: why this date explains in place and keeps the close draft)_
- [ ] **ac-11** — Browser test with a controlled clock and real UI: cross local midnight while Lessons, Repertoire and StageDetail remain mounted; relative dates, upcoming lessons and lesson preparation eligibility refresh through the existing ticking clock. Include imported future-dated lesson history so it does not become an upcoming class. Use explicit expected states, not a source ban on new Date or a frozen-time sleep. Inventory the known consumers; source checks may supplement, not substitute for this behaviour. _(proof: date-dependent screens refresh across midnight without remounting)_
- [ ] **ac-12** — Existing src/styles/contrast.test.ts remains green for its listed pair-specific thresholds in all palette blocks; separately compare existing colour token values with the baseline, since contrast alone does not prove the palette is unchanged. New pairings, if any, join the existing coverage. _(proof: every listed colour pair meets WCAG AA in every block where its tokens are declared)_
- [ ] **ac-13** — Regression guard (existing, tests/repertoire-viewport.browser.test.ts): Today's order and the recommendation above the fold at 390x844 survive the taller controls; Repertoire stays reflowed, named and keyboard-reachable. _(proof: the shared practice shell remains accessible and readable across layouts)_
- [ ] **ac-14** — Owner on the candidate build, installed iPhone PWA AND Safari: repeat keyboard open/dismiss with focus retained on Close, notes and a lesson question; verify tabs return and remain reachable, with main scroll usable. Include route change, rotation, background/resume and pinch zoom, checking after dismissal at normal scale; record device, OS, build and outcome, without claiming browser fixtures prove native behaviour. On MacBook and iPhone in light/dark, review the small before/after packet against the look spec and paste a mixed-language report into Messages. Owner taste adjustments within the spec are a passing refinement, not a new reviewer family. Actual regressions remain blockers. _(proof: manual:OWNER)_
- [ ] **ac-15** — Browser through real controls: fill close inputs, Back, practise further, Finish; retain result/text/manual choices/item edits/question, refresh an untouched duration proposal and preserve a corrected duration. Save creates one block with the retained values and the displayed current review decision. Repeat with discard and a new session on the SAME item, verifying no draft leakage. Include a day/settings change while away so derived dates refresh rather than restoring stale calculations; old session completion cannot clear or overwrite a newer draft. _(proof: close draft survives Back for the same block and never leaks to another session)_
- [ ] **ac-16** — Reuse the exact existing tests/repertoire-viewport.browser.test.ts test and src/components/viewport.test.ts fixtures unchanged in the required check. Preserve standalone height, safe areas, main-only scrolling and diagnostic trace. This guards the scripted mechanism; native keyboard acceptance remains manual:OWNER. _(proof: viewport recovery respects focus zoom and scroll ownership)_
- [ ] **ac-17** — A focused test under tests/ verifies both AGENTS.md and the recursive CLAUDE.md import profile leave at least 3584 bytes (3.5 KiB) under 32768 after additions, reusing the existing counting semantics. Keep existing agent-context budget, prohibition and path tests unchanged and green. Review the short baseline-to-final disposition of condensed sections for semantic preservation; passing phrase checks alone is not sufficient. _(proof: UI refresh leaves instruction headroom without losing current prohibitions)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- README.md

## Amendments

- 2026-10-23T00:05:15.830Z — AGENTS headroom: mechanism detail moves to subsystem docs: allow: +docs/setar-archive.md, docs/cgs-course.md, docs/khonyagar-course.md, docs/repertoire-experience.md, docs/scheduling-evidence.md
- 2026-10-23T00:19:56.406Z — AGENTS headroom: move hands-free practice mechanism detail to its subsystem doc while keeping every rule represented in AGENTS.md: allow: +docs/setar-practice-reliability.md
- 2026-10-23T00:34:10.800Z — AGENTS headroom: with every rule kept in AGENTS.md and subsystem mechanism moved to its docs, wording-only condensation leaves 3,819 bytes; ac-17 requires 3,584 (3.5 KiB) instead of 4,096: checks: +ac-17|A focused test under tests/ verifies both AGENTS.md and the recursive CLAUDE.md import profile leave at least 3584 bytes (3.5 KiB) under 32768 after additions, reusing the existing counting semantics. Keep existing agent-context budget, prohibition and path tests unchanged and green. Review the short baseline-to-final disposition of condensed sections for semantic preservation; passing phrase checks alone is not sufficient.|UI refresh leaves instruction headroom without losing current prohibitions -ac-17|A focused test under tests/ verifies both AGENTS.md and the recursive CLAUDE.md import profile leave at least 4096 bytes under 32768 after additions, reusing the existing counting semantics. Keep existing agent-context budget, prohibition and path tests unchanged and green. Review the short baseline-to-final disposition of condensed sections for semantic preservation; passing phrase checks alone is not sufficient.|UI refresh leaves instruction headroom without losing current prohibitions

