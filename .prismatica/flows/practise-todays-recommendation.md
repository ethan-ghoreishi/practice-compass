---
id: practise-todays-recommendation
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Practise what the app suggests
  journey: Daily practice
  order: 1
truth:
  goal: Practise the one thing the app suggests next and leave an honest record of
    how it went.
  startsWhen: The musician opens Today, picks the instrument they are practising,
    and sees a single 'Practise now' card.
  needs: []
  steps:
    - actor: The musician
      action: Taps their instrument in the switcher at the top of Today.
      shows: "Everything below is scoped to that instrument: recommendation, class
        work, due reviews, pathway position."
      changes: The chosen instrument is remembered as the session instrument.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: Practice Compass
      action: Scores every item of that instrument and shows the best one with a
        one-sentence reason.
      shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if
        you have time' suggestions.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Start · 10 min'.
      shows: "The active block screen: item title, mode and focus chips, a running
        ring timer."
      changes: A practice block is opened in memory with mode, focus and a 10-minute
        target derived from the item.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Practises, optionally opening 'About this piece' or jotting a passing
        note; pauses and resumes as needed.
      shows: The elapsed clock, and the item's notes and current problem on request.
      changes: Elapsed seconds accumulate only while the timer runs.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Finish'.
      shows: The close screen, with the minutes already filled in.
      changes: The clock is frozen first, so reflection time is not counted as practice.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Picks one of the six results, optionally adds an observation, a next
        action, a body note or a teacher question, and accepts or declines the
        suggested status and review date.
      shows: A preview of the next review date with the plain reason behind it, and a
        'Why this date?' link.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Save block'.
      shows: Back to Today (or to the running plan), with the item's stats and status
        updated.
      changes: A PracticeBlock is stored; the item's counters, status, saturation flag
        and spaced-repetition state advance; any open review for the item is
        completed and the next one is scheduled on the date that was shown.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:13.465Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: "The session is recorded honestly: one block, one result, one next
    action — and the item knows when it should come back."
  variations:
    - name: Choose something else
      differs: From 'Choose something else to practise…' the Start screen takes
        instrument → item → mode/focus/duration, with a title-only quick create
        for something that does not exist yet.
      status: works
    - name: Start from an item or a stage
      differs: "'Start a block' on an item, or ▶ on a pathway stage row, opens the
        same block with defaults taken from the item's status and focus."
      status: works
    - name: Discard
      differs: "'Discard block' (during) or 'Discard without saving' (at close) throws
        the block away — nothing is logged and no schedule moves."
      status: works
  rules:
    - Starting a block must stay under 30 seconds and closing one under 60
      seconds; a title is the only required field.
    - Practising is the only thing that completes a review and advances spaced
      repetition.
    - The review date shown before saving is exactly the date saved.
  involves:
    - The musician
    - The recommendation engine
    - The spaced-repetition scheduler
mechanics:
  touchpoints:
    - src/pages/Today.tsx
    - src/pages/StartBlock.tsx
    - src/pages/ActiveBlock.tsx
    - src/pages/CloseBlock.tsx
    - src/store/useStore.ts
    - src/domain/recommend.ts
    - src/domain/scoring.ts
    - src/domain/scheduling.ts
    - src/domain/blocks.ts
  routes:
    - /
    - /start
    - /active
    - /close
  components:
    - Today
    - StartBlock
    - ActiveBlock
    - CloseBlock
    - ItemCard
    - QuickAdd
  entities:
    - PracticeItem
    - PracticeBlock
    - Review
    - Instrument
  tests:
    - file: src/domain/recommend.test.ts
      steps:
        - 2
    - file: src/domain/scoring.test.ts
      steps:
        - 2
    - file: src/domain/blocks.test.ts
      steps:
        - 7
    - file: src/domain/scheduling.test.ts
      steps:
        - 6
        - 7
approval:
  hash: 13b7e15d09d645c70ebe03ca0b8929ed5df229d9bc010f18c84b59a4518d37d8
  at: 2026-08-28T13:30:17.983Z
  by: Ethan
  signature: 4JcTJQTO+6b06NqVwxsarAqynlVDrJb/FE0rgn1kWP+2zIhZgeAknzL1/ONfrnCCd33BQiLEd8LVFFgWKccWAw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Practise what the app suggests

_Works now · approved 2026-08-28T13:30:17.983Z by Ethan (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler
