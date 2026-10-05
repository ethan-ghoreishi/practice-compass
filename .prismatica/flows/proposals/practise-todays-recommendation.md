---
id: practise-todays-recommendation
proposalType: update
reason: Change 20261005-make-setar-archive-recovery-repertoire-c-e964 readies
  the practice sound inside the Start and Resume taps on one page-lifetime
  context, replaces the single tone with a two-pulse cue, and adds a visible way
  back when sound is paused or off.
proposedBy: agent
createdAt: 2026-10-05T23:20:16.148Z
status: works
presentation:
  title: Practise what the app suggests
  journey: Daily practice
  order: 1
truth:
  goal: Practise the one thing the app suggests next and leave an honest record of
    how it went
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
        at: 2026-10-01T20:18:39.166Z
        commit: 33900caf81bdbd9656be7577231813ac86402513
    - actor: Practice Compass
      action: Scores every item of that instrument and shows the best one with a
        one-sentence reason.
      shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if
        you have time' suggestions.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:39.166Z
        commit: 33900caf81bdbd9656be7577231813ac86402513
    - actor: The musician
      action: Taps 'Start · 10 min'.
      shows: "The active block screen: item title, mode and focus chips, a running
        ring timer."
      changes: A practice block is opened in memory with mode, focus and a 10-minute
        target derived from the item. The same tap readies this page’s practice
        sound (one sound context for the page, readied only by a tap).
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-05T23:19:51.493Z
    - actor: The musician
      action: Practises, optionally opening 'About this piece' or jotting a passing
        note; pauses and resumes as needed.
      shows: The elapsed clock, and the item's notes and current problem on request.
        While the block is genuinely running and its screen is visible, the app
        asks the device to keep the display awake (best-effort;
        feature-detected; never affects elapsed time) so the clock stays
        readable without touching anything; pausing, finishing, discarding or
        navigating away releases it, and the phone sleeps normally again. Resume
        is a tap too and readies the sound again; if sound is paused or off on
        this page, a note says so and offers 'Turn on sound'.
      changes: Elapsed seconds accumulate only while the timer runs.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-05T23:19:51.493Z
    - actor: The musician
      action: Taps 'Finish'.
      shows: The close screen, with the minutes already filled in.
      changes: The clock is frozen first, so reflection time is not counted as practice.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:39.166Z
        commit: 33900caf81bdbd9656be7577231813ac86402513
    - actor: The musician
      action: Picks one of the six results, optionally adds an observation, a next
        action, a body note or a teacher question, and accepts or declines the
        suggested status and review date.
      shows: A preview of the next review date with the plain reason behind it, and a
        'Why this date?' link.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:39.166Z
        commit: 33900caf81bdbd9656be7577231813ac86402513
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
        at: 2026-10-01T20:18:39.166Z
        commit: 33900caf81bdbd9656be7577231813ac86402513
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
        screen-wake-lock or the accompanying two-pulse sound and vibration —
        readied by a Start or Resume tap, played once per granted boundary claim
        and never queued to sound late — succeeds, fails or is unsupported never
        changes the elapsed time or the minutes eventually saved.
      status: works
    - name: Test practice sound
      differs: "Settings → Practice sound: 'Test practice sound' plays the same
        two-pulse cue on demand and says whether sound is ready, paused or off
        on this page."
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
---

# Proposed update: Practise what the app suggests

_Proposed by agent · Works now_

**Reason:** Change 20261005-make-setar-archive-recovery-repertoire-c-e964 readies the practice sound inside the Start and Resume taps on one page-lifetime context, replaces the single tone with a two-pulse cue, and adds a visible way back when sound is paused or off.

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went

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
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap readies this page’s practice sound (one sound context for the page, readied only by a tap).

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again. Resume is a tap too and readies the sound again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
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
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying two-pulse sound and vibration — readied by a Start or Resume tap, played once per granted boundary claim and never queued to sound late — succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_
- **Test practice sound** — Settings → Practice sound: 'Test practice sound' plays the same two-pulse cue on demand and says whether sound is ready, paused or off on this page. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=fa60f4e5dc8d9379 truth.goal=f06ba5cce66ee569 truth.startsWhen=b3a81d2264b7bc48 truth.needs=4f53cda18c2baa0c truth.steps=20b1a80a3eeb8919 truth.endsWith=483b46c5af906a2e truth.variations=08c10ff03f6f017c truth.rules=9c62bf6e8e7d73a6 truth.involves=f3c7c539e5c88476 mechanics.touchpoints=459f506fc260d734 mechanics.routes=8c727f68010a3eb7 mechanics.components=1b936c9d47c5c0f7 mechanics.entities=c8810400be470c79 mechanics.tests=7c056574c25aa83f -->
