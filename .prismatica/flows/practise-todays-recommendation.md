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
    - actor: Practice Compass
      action: Scores every item of that instrument and shows the best one with a
        one-sentence reason.
      shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if
        you have time' suggestions.
      assumes: []
    - actor: The musician
      action: Taps 'Start · 10 min'.
      shows: "The active block screen: item title, mode and focus chips, a running
        ring timer."
      changes: A practice block is opened in memory with mode, focus and a 10-minute
        target derived from the item.
      assumes: []
    - actor: The musician
      action: Practises, optionally opening 'About this piece' or jotting a passing
        note; pauses and resumes as needed.
      shows: The elapsed clock, and the item's notes and current problem on request.
        While the block is genuinely running and its screen is visible, the app
        asks the device to keep the display awake (best-effort;
        feature-detected; never affects elapsed time) so the clock stays
        readable without touching anything; pausing, finishing, discarding or
        navigating away releases it, and the phone sleeps normally again.
      changes: Elapsed seconds accumulate only while the timer runs.
      assumes: []
    - actor: The musician
      action: Taps 'Finish'.
      shows: The close screen, with the minutes already filled in.
      changes: The clock is frozen first, so reflection time is not counted as practice.
      assumes: []
    - actor: The musician
      action: Picks one of the six results, optionally adds an observation, a next
        action, a body note or a teacher question, and accepts or declines the
        suggested status and review date.
      shows: A preview of the next review date with the plain reason behind it, and a
        'Why this date?' link.
      assumes: []
    - actor: The musician
      action: Taps 'Save block'.
      shows: Back to Today (or to the running plan), with the item's stats and status
        updated.
      changes: A PracticeBlock is stored; the item's counters, status, saturation flag
        and spaced-repetition state advance; any open review for the item is
        completed and the next one is scheduled on the date that was shown.
      assumes: []
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
    - name: Target reached
      differs: When elapsed reaches the block's target, the ring's silent saturation
        is replaced by a durable 'Target reached' state plus a growing overtime
        figure (elapsed minus target) — announced once, never once per render.
        The block does NOT auto-finish — practising past the target stays
        ordinary, and only Finish or Discard ends it. Whether the
        screen-wake-lock or the accompanying sound/vibration cue succeeds, fails
        or is unsupported never changes the elapsed time or the minutes
        eventually saved.
      status: works
  rules:
    - Starting a block must stay under 30 seconds and closing one under 60
      seconds; a title is the only required field.
    - Practising is the only thing that completes a review and advances spaced
      repetition.
    - The review date shown before saving is exactly the date saved.
    - A recorded minute is never affected by whether the screen-wake-lock, sound
      or vibration succeeded — only the wall clock decides elapsed time.
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
    - src/domain/practiceSignal.ts
    - src/components/useScreenAwake.ts
    - src/components/screenAwake.ts
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
    - file: src/domain/practiceSignal.test.ts
      steps:
        - 4
    - file: src/components/screenAwake.test.ts
      steps:
        - 4
approval:
  hash: bc5c4e206274e53121421504716b0da028206611df3238e4d7dcae3d16e04ef0
  at: 2026-08-31T22:05:26.192Z
  by: owner
  signature: FUgPWld95Pz6eW7U4h2AbQ59zIMzKX8FjUIS9hZsa8PV/7tvWm/4qYRSvjzueu0n4X/i4S2Wlj1s9TSRybZxAw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

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
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
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
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

