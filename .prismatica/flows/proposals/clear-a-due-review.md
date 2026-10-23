---
id: clear-a-due-review
proposalType: update
reason: "Lane 20261023-…-34cc: which close completes a due review now depends on
  the return intention and what the block covered."
proposedBy: agent
createdAt: 2026-10-23T22:12:26.384Z
status: works
presentation:
  title: Deal with a due review
  journey: Daily practice
  order: 2
truth:
  goal: Handle material that is due to come back, without ever faking that it was
    practised.
  startsWhen: Today lists 'Due reviews' for the session instrument — items whose
    review date has arrived.
  needs: []
  steps:
    - actor: Practice Compass
      action: Lists each due review with the item's title and how long it has been
        due, and hides any review dismissed earlier today.
      shows: A 'Due reviews' section with three actions per row and one line
        explaining what each does.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-23T13:34:51.646Z
        commit: 845a3ce733b48d680c0e68eb8175a9d620c3c9a8
    - actor: The musician
      action: Taps ▶ to practise it.
      shows: The active block, seeded from the item's status and focus.
      changes: "Nothing yet — the review completes only when the close decides the
        item's next date: an assessed close of an item being worked on, or a
        whole-item check of a kept-fresh one (focused work on a kept-fresh item
        leaves its check waiting)."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-23T22:12:20.000Z
    - actor: The musician
      action: Or taps 'Not now'.
      shows: The row disappears for the rest of the day and returns tomorrow.
      changes: Only a per-day dismissal list in the app's session state — no review or
        item date is touched.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-23T13:34:51.646Z
        commit: 845a3ce733b48d680c0e68eb8175a9d620c3c9a8
    - actor: The musician
      action: Or taps '+2d' to genuinely move it.
      changes: The review's due date and the item's next review date both move to two
        days from today, so nothing is left showing overdue.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-23T13:34:51.646Z
        commit: 845a3ce733b48d680c0e68eb8175a9d620c3c9a8
  endsWith: Either the item was actually practised (and its next return decided),
    or the schedule was moved honestly — never both, never neither.
  variations:
    - name: Snoozed from a stale date
      differs: The new date is counted from today, not from the old overdue date, so a
        long-ignored review does not stay in the past.
      status: works
  rules:
    - "'Not now' changes no schedule; snooze moves the real date on both the
      review and the item."
    - No action may fabricate a practice result.
  involves:
    - The musician
    - The spaced-repetition scheduler
mechanics:
  touchpoints:
    - src/pages/Today.tsx
    - src/store/useStore.ts
    - src/domain/scheduling.ts
    - src/domain/selectors.ts
  routes:
    - /
    - /active
  components:
    - Today
  entities:
    - Review
    - PracticeItem
  tests:
    - file: src/domain/scheduling.test.ts
      steps:
        - 4
---

# Proposed update: Deal with a due review

_Proposed by agent · Works now_

**Reason:** Lane 20261023-…-34cc: which close completes a due review now depends on the return intention and what the block covered.

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review completes only when the close decides the item's next date: an assessed close of an item being worked on, or a whole-item check of a kept-fresh one (focused work on a kept-fresh item leaves its check waiting).

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and its next return decided), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.variations, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=c21eb20a1bb74043 truth.goal=bd6983695096b95e truth.startsWhen=71065c8e32c152fd truth.needs=4f53cda18c2baa0c truth.steps=6b0363e7c2c29163 truth.endsWith=7ede1219f48f7cc4 truth.variations=762dcb7049a2cd82 truth.rules=5599ec45de528ebe truth.involves=35e7bedf6243499f mechanics.touchpoints=c78812bf6eb3a76a mechanics.routes=7e7459bb0c4858a1 mechanics.components=c0ad5d237976686b mechanics.entities=195e606e0b7d2abd mechanics.tests=b87555c0d7fed293 -->
