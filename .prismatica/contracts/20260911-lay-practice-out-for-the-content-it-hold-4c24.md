---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
title: Lay practice out for the content it holds — Persian-aware cards, roomier
  rows, a calmer close screen
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/20
intent: 20260911-lay-practice-out-for-the-content-it-hold-4c24
tier: heavy
stage: review
baseline:
  commit: 7a71179772f679d37791796cdd0ef64e8b1d2f49
  branch: main
branch: change/20260911-lay-practice-out-for-the-content-it-hold-4c24
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260911-lay-practice-out-for-the-content-it-hold-4c24
builder: claude
planHash: 8043ac40153f789a8be6e7fdb99241009bebd966dcc07a8296a5001f926b322c
allowedPaths:
  - src/pages/Today.tsx
  - src/pages/StartBlock.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/Repertoire.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/Materials.tsx
  - src/pages/Insights.tsx
  - src/pages/TeacherReport.tsx
  - src/components/ItemCard.tsx
  - src/components/ItemMaterial.tsx
  - src/components/ClassQuestions.tsx
  - src/components/Attachments.tsx
  - src/components/ui.tsx
  - src/components/format.ts
  - src/components/format.test.ts
  - src/components/direction.test.ts
  - src/styles/global.css
  - src/styles/contrast.test.ts
  - AGENTS.md
  - DECISIONS.md
forbiddenPaths:
  - src/domain/**
  - src/store/**
  - src/App.tsx
  - src/main.tsx
  - src/components/Layout.tsx
  - src/components/useViewportGuard.ts
  - src/components/useScreenAwake.ts
  - src/components/screenAwake.ts
  - src/pages/Settings.tsx
  - src/pages/More.tsx
  - src/pages/NewItem.tsx
  - vite.config.ts
  - index.html
  - package.json
  - .prismatica/**
  - .github/**
nonGoals:
  - "No file under src/domain/** or src/store/** changes: computeReview,
    computeReviewOutcome, completeOpenReviewsFor, resolveReviewDate, scoreItems,
    recommend, buildSessionPlan and every other decision stay byte-identical.
    This lane is presentation only."
  - No schema change, no SCHEMA_VERSION bump, no migration — nothing this lane
    does is persisted.
  - CloseBlock derives the review date ONCE. There is a single ReviewPlan value
    in that component; the collapsed summary line and the expanded date field
    are two renderings of it, and clampSchedulingParams(db.settings) is threaded
    into that one derivation. A second planNextReview call, or a date computed
    anywhere but from that value, is the drift r-explainable-scheduling exists
    to prevent — the guarantee must be that a divergent date is UNREPRESENTABLE,
    not that both call sites were remembered. (CloseBlock.tsx:79 and :94 are two
    derivations today.)
  - A result stays REQUIRED to save a block, and 'Save without a result' stays
    reachable and deliberate so not_logged is still a real choice; a resultless
    close still leaves the item's review date AND its open Review row untouched.
  - "r-quick-start holds: starting stays under 30 seconds, closing under 60, and
    no new required field is introduced anywhere."
  - The Active screen stays a practice screen — no dashboard, no viewer, no new
    panel. useScreenAwake/screenAwake and nextSignal are untouched, and nothing
    in this lane may influence a recorded minute.
  - "The shell stays the next lane's territory: the 100dvh height model with its
    100vh @supports fallback, overflow:hidden on html/body/#root, only <main>
    scrolling, and the .tabbar rules in global.css are all untouched, as is
    src/components/useViewportGuard.ts."
  - "r-no-gamification: no re-layout introduces a streak, score, badge,
    fabricated percentage, bar that fills or colour that judges."
  - Direction stays native — dir="auto" resolved by the browser. No hand-rolled
    direction detection and no reordering of Farsi text in JavaScript.
  - "The primary recommendation stays above the fold at 390x844, and
    r-one-instrument-per-session holds: no other instrument's work appears
    inside a session."
  - "Both search boxes keep filtering through itemMatchesSearch. English-only
    content (Classical Guitar) keeps its LAYOUT exactly as it is today — same
    left alignment, same order, same grouping; the direction work must be a
    no-op for it. The ONE intended difference on English screens is the
    colour-token correction, which is global by nature and applies to every
    screen in both languages: six failing tokens move, every passing token is
    left untouched, and no layout, spacing or type changes with them."
  - Session Plan and Routines remain two independent peer doorways with their
    own open/close state and their own resume takeovers — moving them below the
    recommendation must not nest one inside the other.
  - Any title that genuinely cannot be grouped is recorded as an explicit, named
    exception in the direction test's allowlist and in AGENTS.md. Silently
    leaving a title ungrouped, or satisfying the test by deleting dir="auto"
    without moving it to a group, both fail the lane — the second would break
    Farsi rendering outright.
  - "The iOS keyboard / bottom-nav drift, and everything in
    src/components/useViewportGuard.ts and src/components/Layout.tsx. Agreed as
    its own device lane, next: its three candidate causes have three different
    fixes, and choosing between them needs an instrumented readout the owner
    takes on the real iPhone before a line is written."
  - "jsdom, .test.tsx and browser journeys as a general capability. Reassessed
    for this lane specifically and deliberately not added — checks.journeys
    stays false — because the bulk of the work is direction layout, which jsdom
    cannot evaluate at all (no dir=auto resolution, no text-align computation),
    so it would assert only where an attribute sits. The ONE exception is named
    in the assumptions: if CloseBlock cannot be collapsed to a single
    ReviewPlan, jsdom may be added for that single two-places-one-value
    assertion and nothing else. The keyboard lane is where a pure, port-injected
    extraction genuinely pays, following the repo's own screenAwake.ts
    precedent."
  - Settings' structure (4594px, exactly one heading element, sections as
    unlabelled divs). Real, and both an IA and an accessibility problem — but it
    belongs to adjust-how-scheduling-works and back-up-and-restore, not to the
    practice loop.
  - Repertoire's header (the 'Add practice item' button wrapping to three lines
    at 390px) and its two explanatory ontology paragraphs. Belongs to
    browse-my-repertoire. In Repertoire.tsx and the other non-loop files, ONLY
    the direction wiring changes.
  - SM-2 advancing once per closed block rather than once per due date, so
    practising the same item three times in an afternoon pushes its next review
    from 2 days to about 15. Still open and still wrong, but it changes what
    r-practice-completes-reviews MEANS and therefore needs a signed owner
    decision of its own. Named here so it is not lost — it should be the lane
    after the keyboard.
  - "Still-open findings that belong to no part of this sentence:
    dormant/'Resting' items still scored and still gaining neglect, ItemForm
    allowing an item to become its own parent and leaving stale family metadata
    on an instrument switch, a malformed backup attachment being skipped and
    then destroyed, frozen 'now' on
    CloseBlock/ItemDetail/Lessons/Repertoire/SessionPlan/TeacherReport (and the
    SessionPlan reseed that can therefore never fire), Insights and the Teacher
    report mixing 'during this period' with 'right now', Settings describing
    sync as 'newest copy wins', Field giving single controls no accessible name,
    and .prismatica/product-map.md still holding placeholders."
  - src/components/ItemForm.tsx, src/components/QuickAdd.tsx and
    src/pages/RoutineEdit.tsx are deliberately outside scope. The corrected
    inventory shows they hold 15 free-text FIELD sites and zero display-text
    sites between them — their dir="auto" usage is already correct and must not
    be touched.
  - 'Desired rule (not yet truth): Layout follows the direction of the content
    it shows: a title and the details that belong to it sit in one group that
    carries dir="auto", so a Persian item reads as one block instead of
    splitting across the card. Direction is resolved natively by the browser,
    never detected in JavaScript, and it lives on the group or on a free-text
    field — never bare on a title element.'
  - "Desired rule (not yet truth): Colour is checked by a test, not by eye: the
    foreground tokens the app renders small text in are asserted at WCAG AA
    (4.5:1) against the background tokens they are actually rendered on, in
    every block where those tokens are declared. The checked pairs are listed
    explicitly in the test, so a token that is not covered is a visible omission
    rather than a silent one."
acceptanceChecks:
  - id: ac-1
    description: "REGRESSION GUARD, stated as such: the tri-state close decision is
      pure and sits in forbidden territory, so this test cannot fail from this
      lane's edits — it exists to prove the restructure did not reach past its
      scope. It discriminates 'no result chosen' (item's next review date kept)
      from 'review genuinely declined' (date cleared), the two states a skipped
      tap used to conflate."
    test: keeps the item's review date when no result was chosen and still clears it
      when a review is declined
  - id: ac-2
    description: "REGRESSION GUARD, same standing as the previous one: a resultless
      close leaves the item's open Review row OPEN while a genuine decline
      completes it. Green today and must stay green; it proves scope was
      respected, not that the new wiring is correct."
    test: leaves an open review row open when no result was chosen and still
      completes it on a genuine decline
  - id: ac-3
    description: THIS is the check that guards the restructure. CloseBlock is
      collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports
      exactly that plan's dueDate, reviewType and rationale — so the collapsed
      line and the expanded date field are two renderings of one value and a
      divergent date becomes unrepresentable, the way installDatabase's
      signature makes an un-reset install unrepresentable. New formatter in
      src/components/format.ts, tested in a new src/components/format.test.ts
      under the existing node environment.
    test: the one-line review summary reports exactly the ReviewPlan's due date,
      type and rationale
  - id: ac-4
    description: "An explicitly listed set of (foreground token, background token)
      pairs — the ones the app actually renders small text in, written out in
      the test so a reviewer can see exactly what is and is not covered — meets
      WCAG AA (4.5:1). The list must include the two pairs measured as failing
      at HEAD: --accent-contrast on --accent (the primary Start button's own
      label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark).
      Ratios are computed from the shipped stylesheet and asserted in EVERY
      block where those tokens are declared, not the first: global.css declares
      the light palette twice — at :root[data-theme='light'] (line 80) and again
      inside @media (prefers-color-scheme: light) { :root:not([data-theme]) }
      (line 114) — and the duplicate is what an owner who has never picked a
      theme actually sees. A regression in either block fails the suite. The
      claim is bounded to the listed pairs; it is not a claim about every
      theoretically possible combination. New test in
      src/styles/contrast.test.ts."
    test: every listed colour pair meets WCAG AA in every block where its tokens are
      declared
  - id: ac-5
    description: "The direction sweep is provably complete rather than spot-checked,
      which is what stops a reviewer later finding 'PathwayDetail was a stated
      surface but one title was missed'. The test scans the source and asserts
      BOTH halves: (a) no element carrying a title class (truncate, title-md,
      page-title, stage-unit-title) carries dir=\"auto\" directly any more — a
      missed title still has it and fails; and (b) every file on the recorded
      surface list carries direction on at least one group element that is
      neither a title nor an input/textarea — so a whole skipped file fails, and
      'fixing' it by deleting the attribute fails too. Genuine exceptions live
      in an explicit allowlist inside the test, so they are visible to the
      reviewer. New test in src/components/direction.test.ts."
    test: 'direction lives on the group: no title element carries dir="auto", and
      every listed surface has one'
  - id: ac-6
    description: "On the owner's iPhone, in the INSTALLED PWA, Farsi and English are
      discriminated correctly rather than uniformly re-aligned: a Farsi item's
      title AND its own details both align to the right edge, while an English
      item's title and details both stay on the left — checked on Today (the
      Practise-now card, a due-review row and the class row), Start, Active,
      Close, Repertoire and Lessons. A card where the title and its details
      still point at opposite edges fails, and so does an English card that has
      started aligning right. This check is deliberately REPRESENTATIVE, not
      exhaustive: completeness across all 16 surfaces is the automated direction
      test's job, and this one proves that what the test enforces actually
      renders correctly on the device."
    test: manual:OWNER
  - id: ac-7
    description: "On the owner's iPhone at 390x844 with the recommendation moved
      above the two doorways: Practise now is the first thing under the
      instrument switcher, 'Plan this session' and 'Routines' are both still
      reachable without scrolling and still open independently, and the owner
      judges the new order better than the old. If it reads worse, the order
      reverts before the lane ships — that reversal is a passing outcome of this
      check, not a failure of the lane."
    test: manual:OWNER
  - id: ac-8
    description: "The saved-data boundary, end to end on the restructured screen —
      the one check that can actually fail from this lane's edits. Close three
      blocks on the same item and discriminate the outcomes: (a) 'Save without a
      result' leaves the item's next review date unchanged and leaves it listed
      under Due reviews; (b) choosing a result saves EXACTLY the date the
      collapsed line showed before saving, verified by reopening the item; (c)
      opening the controls and answering 'Should this come back? No' clears the
      date and removes it from Due reviews. If the restructure has rewired the
      tri-state mapping, (a) and (c) stop differing — which is the bug this app
      already paid a heavy lane to fix once."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
createdAt: 2026-09-11T18:59:47.538Z
amendments: []
---

# Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/20
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 7a71179772f679d37791796cdd0ef64e8b1d2f49 on main _(never re-baselined)_
- **Intent:** 20260911-lay-practice-out-for-the-content-it-hold-4c24

## You may only change

- src/pages/Today.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Repertoire.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Materials.tsx
- src/pages/Insights.tsx
- src/pages/TeacherReport.tsx
- src/components/ItemCard.tsx
- src/components/ItemMaterial.tsx
- src/components/ClassQuestions.tsx
- src/components/Attachments.tsx
- src/components/ui.tsx
- src/components/format.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/styles/global.css
- src/styles/contrast.test.ts
- AGENTS.md
- DECISIONS.md

## Never touch

- src/domain/**
- src/store/**
- src/App.tsx
- src/main.tsx
- src/components/Layout.tsx
- src/components/useViewportGuard.ts
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/pages/Settings.tsx
- src/pages/More.tsx
- src/pages/NewItem.tsx
- vite.config.ts
- index.html
- package.json
- .prismatica/**
- .github/**

## Non-goals

- No file under src/domain/** or src/store/** changes: computeReview, computeReviewOutcome, completeOpenReviewsFor, resolveReviewDate, scoreItems, recommend, buildSessionPlan and every other decision stay byte-identical. This lane is presentation only.
- No schema change, no SCHEMA_VERSION bump, no migration — nothing this lane does is persisted.
- CloseBlock derives the review date ONCE. There is a single ReviewPlan value in that component; the collapsed summary line and the expanded date field are two renderings of it, and clampSchedulingParams(db.settings) is threaded into that one derivation. A second planNextReview call, or a date computed anywhere but from that value, is the drift r-explainable-scheduling exists to prevent — the guarantee must be that a divergent date is UNREPRESENTABLE, not that both call sites were remembered. (CloseBlock.tsx:79 and :94 are two derivations today.)
- A result stays REQUIRED to save a block, and 'Save without a result' stays reachable and deliberate so not_logged is still a real choice; a resultless close still leaves the item's review date AND its open Review row untouched.
- r-quick-start holds: starting stays under 30 seconds, closing under 60, and no new required field is introduced anywhere.
- The Active screen stays a practice screen — no dashboard, no viewer, no new panel. useScreenAwake/screenAwake and nextSignal are untouched, and nothing in this lane may influence a recorded minute.
- The shell stays the next lane's territory: the 100dvh height model with its 100vh @supports fallback, overflow:hidden on html/body/#root, only <main> scrolling, and the .tabbar rules in global.css are all untouched, as is src/components/useViewportGuard.ts.
- r-no-gamification: no re-layout introduces a streak, score, badge, fabricated percentage, bar that fills or colour that judges.
- Direction stays native — dir="auto" resolved by the browser. No hand-rolled direction detection and no reordering of Farsi text in JavaScript.
- The primary recommendation stays above the fold at 390x844, and r-one-instrument-per-session holds: no other instrument's work appears inside a session.
- Both search boxes keep filtering through itemMatchesSearch. English-only content (Classical Guitar) keeps its LAYOUT exactly as it is today — same left alignment, same order, same grouping; the direction work must be a no-op for it. The ONE intended difference on English screens is the colour-token correction, which is global by nature and applies to every screen in both languages: six failing tokens move, every passing token is left untouched, and no layout, spacing or type changes with them.
- Session Plan and Routines remain two independent peer doorways with their own open/close state and their own resume takeovers — moving them below the recommendation must not nest one inside the other.
- Any title that genuinely cannot be grouped is recorded as an explicit, named exception in the direction test's allowlist and in AGENTS.md. Silently leaving a title ungrouped, or satisfying the test by deleting dir="auto" without moving it to a group, both fail the lane — the second would break Farsi rendering outright.
- The iOS keyboard / bottom-nav drift, and everything in src/components/useViewportGuard.ts and src/components/Layout.tsx. Agreed as its own device lane, next: its three candidate causes have three different fixes, and choosing between them needs an instrumented readout the owner takes on the real iPhone before a line is written.
- jsdom, .test.tsx and browser journeys as a general capability. Reassessed for this lane specifically and deliberately not added — checks.journeys stays false — because the bulk of the work is direction layout, which jsdom cannot evaluate at all (no dir=auto resolution, no text-align computation), so it would assert only where an attribute sits. The ONE exception is named in the assumptions: if CloseBlock cannot be collapsed to a single ReviewPlan, jsdom may be added for that single two-places-one-value assertion and nothing else. The keyboard lane is where a pure, port-injected extraction genuinely pays, following the repo's own screenAwake.ts precedent.
- Settings' structure (4594px, exactly one heading element, sections as unlabelled divs). Real, and both an IA and an accessibility problem — but it belongs to adjust-how-scheduling-works and back-up-and-restore, not to the practice loop.
- Repertoire's header (the 'Add practice item' button wrapping to three lines at 390px) and its two explanatory ontology paragraphs. Belongs to browse-my-repertoire. In Repertoire.tsx and the other non-loop files, ONLY the direction wiring changes.
- SM-2 advancing once per closed block rather than once per due date, so practising the same item three times in an afternoon pushes its next review from 2 days to about 15. Still open and still wrong, but it changes what r-practice-completes-reviews MEANS and therefore needs a signed owner decision of its own. Named here so it is not lost — it should be the lane after the keyboard.
- Still-open findings that belong to no part of this sentence: dormant/'Resting' items still scored and still gaining neglect, ItemForm allowing an item to become its own parent and leaving stale family metadata on an instrument switch, a malformed backup attachment being skipped and then destroyed, frozen 'now' on CloseBlock/ItemDetail/Lessons/Repertoire/SessionPlan/TeacherReport (and the SessionPlan reseed that can therefore never fire), Insights and the Teacher report mixing 'during this period' with 'right now', Settings describing sync as 'newest copy wins', Field giving single controls no accessible name, and .prismatica/product-map.md still holding placeholders.
- src/components/ItemForm.tsx, src/components/QuickAdd.tsx and src/pages/RoutineEdit.tsx are deliberately outside scope. The corrected inventory shows they hold 15 free-text FIELD sites and zero display-text sites between them — their dir="auto" usage is already correct and must not be touched.
- Desired rule (not yet truth): Layout follows the direction of the content it shows: a title and the details that belong to it sit in one group that carries dir="auto", so a Persian item reads as one block instead of splitting across the card. Direction is resolved natively by the browser, never detected in JavaScript, and it lives on the group or on a free-text field — never bare on a title element.
- Desired rule (not yet truth): Colour is checked by a test, not by eye: the foreground tokens the app renders small text in are asserted at WCAG AA (4.5:1) against the background tokens they are actually rendered on, in every block where those tokens are declared. The checked pairs are listed explicitly in the test, so a token that is not covered is a visible omission rather than a silent one.

## Acceptance checks (definition of done)

- [ ] **ac-1** — REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment. _(proof: the one-line review summary reports exactly the ReviewPlan's due date, type and rationale)_
- [ ] **ac-4** — An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts. _(proof: every listed colour pair meets WCAG AA in every block where its tokens are declared)_
- [ ] **ac-5** — The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir="auto" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts. _(proof: direction lives on the group: no title element carries dir="auto", and every listed surface has one)_
- [ ] **ac-6** — On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device. _(proof: manual:OWNER)_
- [ ] **ac-7** — On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane. _(proof: manual:OWNER)_
- [ ] **ac-8** — The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md

## Amendments

_none_

