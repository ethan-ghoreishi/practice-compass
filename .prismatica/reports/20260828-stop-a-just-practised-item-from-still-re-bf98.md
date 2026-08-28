---
contractId: 20260828-stop-a-just-practised-item-from-still-re-bf98
at: 2026-08-28T14:59:34.300Z
by: agent
none: false
entries:
  - flowId: adjust-how-scheduling-works
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/domain/scheduling.ts,
      src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts,
      src/store/useStore.ts. Derived from the diff alone — this says nothing
      about whether any test ran or whether behaviour changed."
    steps: []
    reverify: []
  - flowId: back-up-and-restore
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: capture-a-practice-item
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: log-a-class
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: run-a-session-plan
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: work-a-pathway-stage
    status: mechanics-updated
    reason: "Mapped implementation touched: touchpoint(s) src/store/useStore.ts
      matched changed file(s) src/store/useStore.ts. Derived from the diff alone
      — this says nothing about whether any test ran or whether behaviour
      changed."
    steps: []
    reverify: []
  - flowId: practise-todays-recommendation
    status: truth-proposed
    reason: "Step 7 claims the next review 'is scheduled on the date that was
      shown'. Before this change that was false whenever the user declined a
      review (§1.1: the item kept its old, now-overdue date) or accepted the
      SM-2 suggestion without an explicit override (§1.2: the item's date and
      the new Review row's date could diverge). computeReviewOutcome
      (scheduling.ts) now computes ONE date used for both the item and the new
      Review row, and closeSession/applyBlockStats route the item's write
      through it verbatim — so step 7's claim holds by construction. Pinned by
      scheduling.test.ts: 'clears the item's next review date when no review is
      scheduled', 'keeps the item's next review date when a review is
      scheduled', 'writes one date to both the item and its new review row'.
      Verified live in the browser (Afshari darāmad opening, previously 63 days
      overdue): declining showed no overdue claim and the item dropped out of
      Due reviews; accepting showed the exact previewed date and an IndexedDB
      dump confirmed item.nextReviewDate === the new open Review row's dueDate."
    steps:
      - 7
    reverify: []
  - flowId: clear-a-due-review
    status: unchanged
    reason: "This lane deliberately refactors snoozeReview to route through the
      shared resolveReviewDate/applyReviewDateToRows coupling (the model every
      other write now follows) rather than its own bespoke logic, but its
      observable behaviour is unchanged: '+2d' still moves the review's dueDate
      and the item's nextReviewDate to the same date, counted from today, with
      SM-2 state (srReps/srEase/srIntervalDays) untouched. 'Not now' is
      untouched entirely — notNowReview was not modified. Pinned by
      scheduling.test.ts 'snooze moves the same date on the item and the review
      without changing SM-2 state', which builds an item with SM-2 fields set
      and asserts both writes land on the same date while those three fields are
      unchanged."
    steps: []
    reverify: []
  - flowId: browse-my-repertoire
    status: unchanged
    reason: Shares the PracticeItem entity only because closeSession/updateItem now
      write nextReviewDate/srReps/srEase/srIntervalDays more precisely;
      Repertoire's views (Pathways/My repertoire/Practice list) group and list
      items by identity, status and kind, none of which this lane touches. No
      file this flow maps to (repertoire.ts, Repertoire.tsx) changed.
    steps: []
    reverify: []
  - flowId: install-the-app-and-keep-it-current
    status: unchanged
    reason: Shares the /settings route only because 'How scheduling works' also
      lives there; PWA install/update mechanics (service worker, version banner)
      are untouched — no file this flow maps to changed.
    steps: []
    reverify: []
  - flowId: point-this-device-at-the-nas
    status: unchanged
    reason: Shares the /settings route only because 'How scheduling works' also
      lives there; the NAS base URL setting and recording-link resolution are
      untouched — no file this flow maps to changed.
    steps: []
    reverify: []
  - flowId: prepare-for-the-next-class
    status: unchanged
    reason: Shares the PracticeItem entity because closeSession still writes
      assignedForLesson/teacherQuestion, but that pass-through code
      (input.teacherQuestion !== undefined) is untouched by this diff — only the
      review-date decision changed. No file this flow maps to (questions.ts,
      ClassQuestions) changed.
    steps: []
    reverify: []
  - flowId: see-practice-patterns
    status: unchanged
    reason: Shares the PracticeItem entity because Insights reads item stats, but
      scoring.ts, insights.ts and report.ts are untouched — this lane only
      changes how nextReviewDate/SM-2 state are written, not how they're read
      for insights. No file this flow maps to changed.
    steps: []
    reverify: []
  - flowId: sync-devices-via-github
    status: unchanged
    reason: Shares the /settings route only because 'How scheduling works' also
      lives there; the sync engine hash-compares whatever PracticeItem/Review
      state exists and is agnostic to which code wrote it — canonical.ts,
      syncEngine.ts and gitRemote.ts are untouched.
    steps: []
    reverify: []
---

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/scheduling.ts, src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — truth-proposed

Step 7 claims the next review 'is scheduled on the date that was shown'. Before this change that was false whenever the user declined a review (§1.1: the item kept its old, now-overdue date) or accepted the SM-2 suggestion without an explicit override (§1.2: the item's date and the new Review row's date could diverge). computeReviewOutcome (scheduling.ts) now computes ONE date used for both the item and the new Review row, and closeSession/applyBlockStats route the item's write through it verbatim — so step 7's claim holds by construction. Pinned by scheduling.test.ts: 'clears the item's next review date when no review is scheduled', 'keeps the item's next review date when a review is scheduled', 'writes one date to both the item and its new review row'. Verified live in the browser (Afshari darāmad opening, previously 63 days overdue): declining showed no overdue claim and the item dropped out of Due reviews; accepting showed the exact previewed date and an IndexedDB dump confirmed item.nextReviewDate === the new open Review row's dueDate.

Steps: 7

## clear-a-due-review — unchanged

This lane deliberately refactors snoozeReview to route through the shared resolveReviewDate/applyReviewDateToRows coupling (the model every other write now follows) rather than its own bespoke logic, but its observable behaviour is unchanged: '+2d' still moves the review's dueDate and the item's nextReviewDate to the same date, counted from today, with SM-2 state (srReps/srEase/srIntervalDays) untouched. 'Not now' is untouched entirely — notNowReview was not modified. Pinned by scheduling.test.ts 'snooze moves the same date on the item and the review without changing SM-2 state', which builds an item with SM-2 fields set and asserts both writes land on the same date while those three fields are unchanged.

## browse-my-repertoire — unchanged

Shares the PracticeItem entity only because closeSession/updateItem now write nextReviewDate/srReps/srEase/srIntervalDays more precisely; Repertoire's views (Pathways/My repertoire/Practice list) group and list items by identity, status and kind, none of which this lane touches. No file this flow maps to (repertoire.ts, Repertoire.tsx) changed.

## install-the-app-and-keep-it-current — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; PWA install/update mechanics (service worker, version banner) are untouched — no file this flow maps to changed.

## point-this-device-at-the-nas — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; the NAS base URL setting and recording-link resolution are untouched — no file this flow maps to changed.

## prepare-for-the-next-class — unchanged

Shares the PracticeItem entity because closeSession still writes assignedForLesson/teacherQuestion, but that pass-through code (input.teacherQuestion !== undefined) is untouched by this diff — only the review-date decision changed. No file this flow maps to (questions.ts, ClassQuestions) changed.

## see-practice-patterns — unchanged

Shares the PracticeItem entity because Insights reads item stats, but scoring.ts, insights.ts and report.ts are untouched — this lane only changes how nextReviewDate/SM-2 state are written, not how they're read for insights. No file this flow maps to changed.

## sync-devices-via-github — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; the sync engine hash-compares whatever PracticeItem/Review state exists and is agnostic to which code wrote it — canonical.ts, syncEngine.ts and gitRemote.ts are untouched.

## Read these claims with this in mind

- **clear-a-due-review** — reported unaffected, but its own mapped tests changed here: src/domain/scheduling.test.ts

A test can change for refactoring or coverage without any behaviour change, and
behaviour can change without a test moving — so this decides nothing. It is here
because a reviewer weighing "unaffected" should be weighing it against this.

