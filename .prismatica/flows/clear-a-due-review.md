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
        method: inferred
        at: 2026-08-26T22:39:18.645Z
    - actor: The musician
      action: Taps ▶ to practise it.
      shows: The active block, seeded from the item's status and focus.
      changes: Nothing yet — the review only completes when the block is closed.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-26T22:39:18.645Z
    - actor: The musician
      action: Or taps 'Not now'.
      shows: The row disappears for the rest of the day and returns tomorrow.
      changes: Only a per-day dismissal list in the app's session state — no review or
        item date is touched.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-26T22:39:18.645Z
    - actor: The musician
      action: Or taps '+2d' to genuinely move it.
      changes: The review's due date and the item's next review date both move to two
        days from today, so nothing is left showing overdue.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-26T22:39:18.645Z
  endsWith: Either the item was actually practised (and spaced repetition
    advanced), or the schedule was moved honestly — never both, never neither.
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
  hash: c27230bdffa873db6ce0efd7a258cd0d87837e1a34ad7cd4c75792bc979552a2
  at: 2026-08-28T13:30:17.861Z
  by: Ethan
  signature: ZGgL5lp7AkhMiwSWpFJRatuAquFsoZ7ojlPbmEFMw9q1QfVAzNS/FcUB1H9s+TV7SdikVAl8xxKZwPyFdkeGCw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

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
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

