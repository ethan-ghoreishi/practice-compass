---
id: 20260828-stop-a-just-practised-item-from-still-re-bf98
title: Stop a just-practised item from still reporting as overdue
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/1
intent: 20260828-stop-a-just-practised-item-from-still-re-bf98
tier: heavy
stage: accept
baseline:
  commit: b157aec48b78e0a8ebe94b530241bf9a7fa392cd
  branch: main
branch: change/20260828-stop-a-just-practised-item-from-still-re-bf98
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-stop-a-just-practised-item-from-still-re-bf98
builder: claude
planHash: 3c4c114ccb7ea225a7cfa53b2061f1dafe3f8f688da3d5e499582ad80e34d10a
allowedPaths:
  - src/domain/scheduling.ts
  - src/domain/scheduling.test.ts
  - src/domain/blocks.ts
  - src/domain/blocks.test.ts
  - src/store/useStore.ts
forbiddenPaths: []
nonGoals:
  - Practising (closing a block) remains the ONLY thing that completes a review
    and advances SM-2.
  - "'Not now' still changes no schedule at all — it stays a per-day dismissal
    in session state."
  - An item update that does not carry a review date must NEVER clear the review
    schedule. Neither updateItem call site passes one today, so 'absent means
    keep' protects 100% of real edits — reading absent as 'clear' would make
    every title, status, difficulty and notes edit silently wipe the item's
    schedule.
  - Snooze (+2d) still moves the real date on BOTH the review and the item,
    counted from today.
  - The review date previewed on the close screen is still exactly the date
    saved.
  - No SCHEMA_VERSION bump, no migration, and no change to the persisted shape
    of PracticeItem or Review.
  - Starting a block stays under 30 seconds, closing one under 60; no new
    required field.
  - The Session Plan advance tail in closeSession keeps working, and the plain
    no-plan flow stays behaviourally identical apart from the review-date fix
    itself.
  - DEFAULT_SCHEDULING_PARAMS and the byte-identical-defaults snapshot test stay
    green — the SM-2 rungs are not being retuned.
  - Review §2.3 — importDB skipping the migration chain. A separate lane. This
    change needs no schema bump, so it is NOT gated by it; the advisory's 'fix
    that first' applies to the feature requests that do need bumps.
  - Review §3.2 — wiring persianSearchMatch into the two search boxes. Highest
    value-per-line in the report and the natural next lane, but different files
    and a different flow.
  - Review §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent
    failure, §2.4 RoutineRunner wall clock, §3.4 frozen `now`, §3.5 seeded fake
    history.
  - "Any repair of items ALREADY stuck in the false-overdue state. The owner
    explicitly chose fix-forward-only: they clear the next time that item is
    practised. No pass over existing data."
  - "src/pages/CloseBlock.tsx — its `scheduleReview: comeBack && !!reviewDate`
    is already correct semantics; every fix in this lane lands behind it. Do not
    change the close screen."
  - Adding fake-indexeddb, jsdom, or any store test harness. If the store wiring
    feels untestable, that is the signal to move more of the decision into the
    pure domain function, not to add a dependency.
  - Retuning any SM-2 constant, interval or ease value. This lane fixes where
    dates are written, not what they are.
  - "Nothing is hard-forbidden on purpose: the frame is the five files in
    `allow`, and anything genuinely needed beyond them should be added by
    `prismatica amend` rather than worked around. The exclusions above are
    intent, not a wall."
  - "Desired rule (not yet truth): An item's next review date and its Review row
    are always written together, through one place — no code path may move one
    without the other, and 'no next review' is a state the system can express."
acceptanceChecks:
  - id: ac-1
    description: "§1.1 root cause — applyBlockStats can express 'no next review':
      null clears the date, undefined keeps the existing one. The two halves of
      the same test discriminate the states."
    test: clears nextReviewDate when passed null and keeps it when passed undefined
  - id: ac-2
    description: §1.1 — closing a block without scheduling a review leaves the item
      with NO next review date, so a just-practised item can no longer report as
      overdue.
    test: clears the item's next review date when no review is scheduled
  - id: ac-3
    description: "The discriminating opposite of the check above: closing a block
      WITH a review date still sets that exact date on the item."
    test: keeps the item's next review date when a review is scheduled
  - id: ac-4
    description: §1.2 — the item's date and its new Review row's dueDate are the
      same single value, including when no explicit date is supplied and the
      SM-2 suggestion is used. The item can never be given a date without a
      matching row.
    test: writes one date to both the item and its new review row
  - id: ac-5
    description: §1.3 — declining a review leaves srReps, srEase and srIntervalDays
      untouched, so a later accepted date is computed from real history rather
      than from declines.
    test: leaves SM-2 state untouched when no review is scheduled
  - id: ac-6
    description: §1.4 — a fixed cadence no longer overwrites the SM-2 interval base,
      so switching an item back to Auto restores its real spacing instead of
      loosening it fivefold.
    test: fixed cadence does not overwrite the SM-2 interval base
  - id: ac-7
    description: §1.5 — moving an item's review date by hand moves its open Review
      row with it, so the two sides cannot be edited apart.
    test: moves the open review row when the item's review date changes
  - id: ac-8
    description: "The regression this lane could itself introduce: updating
      unrelated item fields (title, notes, difficulty) leaves BOTH
      PracticeItem.nextReviewDate and the open Review's dueDate unchanged. This
      is the discriminating partner to the check above — together they prove
      absent = keep, ISODate = set."
    test: leaves the review schedule untouched when an item update does not include
      a review date
  - id: ac-9
    description: "Snooze is the one path that is already correct and this lane
      deliberately refactors it, so its coupled write must be pinned by a test
      rather than by the prose in mustNotChange: snoozing moves Review.dueDate
      and PracticeItem.nextReviewDate to the same date and leaves srReps, srEase
      and srIntervalDays untouched."
    test: snooze moves the same date on the item and the review without changing
      SM-2 state
  - id: ac-10
    description: "End to end in the running app: take the item Today currently
      announces as overdue, practise it, pick a result, answer No to 'Should
      this come back?', save. Today shows it with no overdue claim and no
      invented future date. Then practise it again and accept the suggested
      date: Today shows that exact date, and the row appears under Due reviews
      when it arrives."
    test: manual:OWNER
docsDelta: []
createdAt: 2026-08-28T14:34:18.728Z
amendments: []
---

# Stop a just-practised item from still reporting as overdue

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/1
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** b157aec48b78e0a8ebe94b530241bf9a7fa392cd on main _(never re-baselined)_
- **Intent:** 20260828-stop-a-just-practised-item-from-still-re-bf98

## You may only change

- src/domain/scheduling.ts
- src/domain/scheduling.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/store/useStore.ts

## Never touch

_nothing explicitly forbidden_

## Non-goals

- Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2.
- 'Not now' still changes no schedule at all — it stays a per-day dismissal in session state.
- An item update that does not carry a review date must NEVER clear the review schedule. Neither updateItem call site passes one today, so 'absent means keep' protects 100% of real edits — reading absent as 'clear' would make every title, status, difficulty and notes edit silently wipe the item's schedule.
- Snooze (+2d) still moves the real date on BOTH the review and the item, counted from today.
- The review date previewed on the close screen is still exactly the date saved.
- No SCHEMA_VERSION bump, no migration, and no change to the persisted shape of PracticeItem or Review.
- Starting a block stays under 30 seconds, closing one under 60; no new required field.
- The Session Plan advance tail in closeSession keeps working, and the plain no-plan flow stays behaviourally identical apart from the review-date fix itself.
- DEFAULT_SCHEDULING_PARAMS and the byte-identical-defaults snapshot test stay green — the SM-2 rungs are not being retuned.
- Review §2.3 — importDB skipping the migration chain. A separate lane. This change needs no schema bump, so it is NOT gated by it; the advisory's 'fix that first' applies to the feature requests that do need bumps.
- Review §3.2 — wiring persianSearchMatch into the two search boxes. Highest value-per-line in the report and the natural next lane, but different files and a different flow.
- Review §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock, §3.4 frozen `now`, §3.5 seeded fake history.
- Any repair of items ALREADY stuck in the false-overdue state. The owner explicitly chose fix-forward-only: they clear the next time that item is practised. No pass over existing data.
- src/pages/CloseBlock.tsx — its `scheduleReview: comeBack && !!reviewDate` is already correct semantics; every fix in this lane lands behind it. Do not change the close screen.
- Adding fake-indexeddb, jsdom, or any store test harness. If the store wiring feels untestable, that is the signal to move more of the decision into the pure domain function, not to add a dependency.
- Retuning any SM-2 constant, interval or ease value. This lane fixes where dates are written, not what they are.
- Nothing is hard-forbidden on purpose: the frame is the five files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around. The exclusions above are intent, not a wall.
- Desired rule (not yet truth): An item's next review date and its Review row are always written together, through one place — no code path may move one without the other, and 'no next review' is a state the system can express.

## Acceptance checks (definition of done)

- [ ] **ac-1** — §1.1 root cause — applyBlockStats can express 'no next review': null clears the date, undefined keeps the existing one. The two halves of the same test discriminate the states. _(proof: clears nextReviewDate when passed null and keeps it when passed undefined)_
- [ ] **ac-2** — §1.1 — closing a block without scheduling a review leaves the item with NO next review date, so a just-practised item can no longer report as overdue. _(proof: clears the item's next review date when no review is scheduled)_
- [ ] **ac-3** — The discriminating opposite of the check above: closing a block WITH a review date still sets that exact date on the item. _(proof: keeps the item's next review date when a review is scheduled)_
- [ ] **ac-4** — §1.2 — the item's date and its new Review row's dueDate are the same single value, including when no explicit date is supplied and the SM-2 suggestion is used. The item can never be given a date without a matching row. _(proof: writes one date to both the item and its new review row)_
- [ ] **ac-5** — §1.3 — declining a review leaves srReps, srEase and srIntervalDays untouched, so a later accepted date is computed from real history rather than from declines. _(proof: leaves SM-2 state untouched when no review is scheduled)_
- [ ] **ac-6** — §1.4 — a fixed cadence no longer overwrites the SM-2 interval base, so switching an item back to Auto restores its real spacing instead of loosening it fivefold. _(proof: fixed cadence does not overwrite the SM-2 interval base)_
- [ ] **ac-7** — §1.5 — moving an item's review date by hand moves its open Review row with it, so the two sides cannot be edited apart. _(proof: moves the open review row when the item's review date changes)_
- [ ] **ac-8** — The regression this lane could itself introduce: updating unrelated item fields (title, notes, difficulty) leaves BOTH PracticeItem.nextReviewDate and the open Review's dueDate unchanged. This is the discriminating partner to the check above — together they prove absent = keep, ISODate = set. _(proof: leaves the review schedule untouched when an item update does not include a review date)_
- [ ] **ac-9** — Snooze is the one path that is already correct and this lane deliberately refactors it, so its coupled write must be pinned by a test rather than by the prose in mustNotChange: snoozing moves Review.dueDate and PracticeItem.nextReviewDate to the same date and leaves srReps, srEase and srIntervalDays untouched. _(proof: snooze moves the same date on the item and the review without changing SM-2 state)_
- [ ] **ac-10** — End to end in the running app: take the item Today currently announces as overdue, practise it, pick a result, answer No to 'Should this come back?', save. Today shows it with no overdue claim and no invented future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews when it arrives. _(proof: manual:OWNER)_

## Docs to update

_none_

## Amendments

_none_

