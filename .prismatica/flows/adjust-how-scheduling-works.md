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
      action: States the real priority formula, how each item comes back — working on
        it (1–3 days), kept fresh (spaced repetition on a whole-item check),
        class preparation before its class (still available after practising it
        the same day, and seated in a Session Plan whenever it fits) — and the
        spaced-repetition rungs, in plain English, filled in with the values
        currently in force.
      shows: The priority terms, the working return days, the current
        first/second/slip-reset gaps, and how importance and difficulty pull
        material sooner.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-28T19:04:54.684Z
    - actor: The musician
      action: Changes a value — a review gap, the warm-up or deep-work share of a
        plan, the shortest or longest review slot.
      shows: The explanation updates to the new numbers.
      changes: The settings are stored with the practice data, clamped to safe bounds;
        out-of-range input is never trusted.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:13:32.364Z
        commit: 67f7bd74767e6aa1f01b65d4e4af8f0b72e9c68a
    - actor: The musician
      action: Closes a block or builds a plan afterwards.
      shows: Review dates and plan shapes computed with the adjusted values.
      changes: The same settings are used for the date previewed and the date saved.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:13:32.364Z
        commit: 67f7bd74767e6aa1f01b65d4e4af8f0b72e9c68a
    - actor: The musician
      action: Taps 'Reset to recommended' whenever they want the original behaviour
        back.
      shows: "'Using the recommended defaults.'"
      changes: The settings field is dropped, so the historical constants apply exactly.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:13:32.364Z
        commit: 67f7bd74767e6aa1f01b65d4e4af8f0b72e9c68a
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
  hash: 46fbd286e3a887c581ee3e619d2cb7212b6a79c2be0c67a8b3f5de3e210c8557
  at: 2026-10-29T21:05:17.708Z
  by: owner
  signature: BqUimB/ADXAFDIR2d4qUj8k+yHZf+oEh02eA8Jmj57PJEwVFGXPYZwglYueBrk8lhXDVTfKRHn5kwHU/hCipAg==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# See and adjust the scheduling engine

_Works now · approved 2026-10-29T21:05:17.708Z by owner (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class (still available after practising it the same day, and seated in a Session Plan whenever it fits) — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the working return days, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

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

