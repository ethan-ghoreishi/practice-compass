---
id: clear-a-due-review
createdAt: 2026-08-26T22:58:34.899Z
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
        at: 2026-10-24T02:14:04.929Z
        commit: 92d6c3535c09cae99894483ab7f6f0e340d751e8
    - actor: The musician
      action: Taps ▶ to practise it.
      shows: The active block, seeded from the item's status and focus.
      changes: "Nothing yet — the review completes only when the close decides the
        item's next date: an assessed close of an item being worked on, or a
        whole-item check of a kept-fresh one (focused work on a kept-fresh item
        leaves its check waiting)."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:04.929Z
        commit: 92d6c3535c09cae99894483ab7f6f0e340d751e8
    - actor: The musician
      action: Or taps 'Not now'.
      shows: The row disappears for the rest of the day and returns tomorrow.
      changes: Only a per-day dismissal list in the app's session state — no review or
        item date is touched.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:04.929Z
        commit: 92d6c3535c09cae99894483ab7f6f0e340d751e8
    - actor: The musician
      action: Or taps '+2d' to genuinely move it.
      changes: The review's due date and the item's next review date both move to two
        days from today, so nothing is left showing overdue.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:04.929Z
        commit: 92d6c3535c09cae99894483ab7f6f0e340d751e8
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
approval:
  hash: 6987beaf5ea09a55a7a52bd8ba6e9269ee9d5bad1a38f05198bab85a810a220c
  at: 2026-10-24T02:13:09.212Z
  by: owner
  signature: bTkZwWPNeSw21s23huvkJxqY3wWoeM9m+z5J42wFrndsYpOUN9CfVWD8d2rKth/wHscaNXS3H8FyDSLtffOoDA==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Deal with a due review

_Works now · approved 2026-10-24T02:13:09.212Z by owner (signed)_

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
