---
id: adjust-how-scheduling-works
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: See and adjust the scheduling engine
  journey: Trusting the engine
  order: 10
truth:
  goal: Understand exactly why an item was recommended and a date chosen — and
    change the numbers if they do not suit you.
  startsWhen: The musician follows 'Why this date?' from the close screen, or
    opens Settings → 'How scheduling works'.
  needs: []
  steps:
    - actor: Practice Compass
      action: States the real priority formula and the spaced-repetition rungs in
        plain English, filled in with the values currently in force.
      shows: The priority terms, the current first/second/slip-reset gaps, and how
        importance and difficulty pull material sooner.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T19:26:47.830Z
        commit: 0e9b176af0981d8a3f13b3987419a4c013a08ae4
    - actor: The musician
      action: Changes a value — a review gap, the warm-up or deep-work share of a
        plan, the shortest or longest review slot.
      shows: The explanation updates to the new numbers.
      changes: The settings are stored with the practice data, clamped to safe bounds;
        out-of-range input is never trusted.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T19:26:47.830Z
        commit: 0e9b176af0981d8a3f13b3987419a4c013a08ae4
    - actor: The musician
      action: Closes a block or builds a plan afterwards.
      shows: Review dates and plan shapes computed with the adjusted values.
      changes: The same settings are used for the date previewed and the date saved.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T19:26:47.830Z
        commit: 0e9b176af0981d8a3f13b3987419a4c013a08ae4
    - actor: The musician
      action: Taps 'Reset to recommended' whenever they want the original behaviour
        back.
      shows: "'Using the recommended defaults.'"
      changes: The settings field is dropped, so the historical constants apply exactly.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T19:26:47.830Z
        commit: 0e9b176af0981d8a3f13b3987419a4c013a08ae4
  endsWith: The engine is understood and, if wanted, tuned — and it still produces
    the same date it showed.
  variations:
    - name: Never customised
      differs: With no settings stored the defaults reproduce the original constants
        exactly, so old backups import unchanged.
      status: works
    - name: Per-item override
      differs: An individual item can be set to a fixed cadence or to manual dates
        instead of automatic spaced repetition.
      status: works
  rules:
    - Scheduling is deterministic and explainable — visible and adjustable,
      never magic.
    - Bounds are enforced on every stored value.
  involves:
    - The musician
    - The spaced-repetition scheduler
    - The plan builder
mechanics:
  touchpoints:
    - src/pages/Settings.tsx
    - src/pages/CloseBlock.tsx
    - src/domain/scheduling.ts
    - src/domain/plan.ts
    - src/domain/types.ts
    - src/store/useStore.ts
  routes:
    - /settings
    - /close
    - /plan
  components:
    - Settings
    - CloseBlock
  entities:
    - SchedulingParams
    - PracticeItem
    - Review
  tests:
    - file: src/domain/scheduling.test.ts
      steps:
        - 1
        - 2
    - file: src/domain/plan.test.ts
      steps:
        - 3
approval:
  hash: afa1699c9add3be9b8e2ffd3927383c32b80b5fde17abce91620b3c39edfa74f
  at: 2026-08-28T13:30:17.733Z
  by: Ethan
  signature: XixTzelA8JWpOo3FdDV7wtrIzTd/EAsuP9Twg9BlE43CqELTaHiEZPllCsFUPu2aADPbBLZndSuUI39y7sGiDg==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder
