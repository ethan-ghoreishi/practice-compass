---
id: practise-todays-recommendation
proposalType: update
reason: Class work practised earlier today stays in the shared pool until its
  class; the running block gains an opt-in metronome and an in-place teacher
  question; the boundary cue was reshaped.
proposedBy: agent
createdAt: 2026-10-28T19:05:19.093Z
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
        at: 2026-10-24T02:14:27.915Z
        commit: 8eeb7d512120468cd26ef28655ad0d8171bcb664
    - actor: Practice Compass
      action: Scores every item of that instrument from the one candidate pool Today,
        a plan's build, regeneration and swaps share — work already practised
        today (an unassessed routine block included) steps aside while anything
        else waits, except work prepared for an upcoming class, which stays
        available until that class — and shows the best one with a one-sentence
        reason.
      shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if
        you have time' suggestions; a piece and its own part never take two
        cards unless the other has its own due review; a repeat says plainly
        that nothing else is waiting, and class work practised earlier today
        says it stays available until its class.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-28T19:04:54.684Z
    - actor: The musician
      action: Taps 'Start · 10 min'.
      shows: "The active block screen: item title, mode and focus chips, a running
        ring timer."
      changes: A practice block is opened in memory with mode, focus and a 10-minute
        target derived from the item. The same tap closes the page's sound
        context and creates and resumes a fresh one, so a context that died
        while the app sat idle never outlives this tap.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:27.915Z
        commit: 8eeb7d512120468cd26ef28655ad0d8171bcb664
    - actor: The musician
      action: Practises, optionally opening 'About this piece' or jotting a passing
        note; pauses and resumes as needed.
      shows: "The elapsed clock, and the item's notes on request. While the block is
        genuinely running and its screen is visible, the app asks the device to
        keep the display awake (best-effort; feature-detected; never affects
        elapsed time); pausing, finishing, discarding or navigating away
        releases it. Resume is a tap too and readies a fresh sound context
        again; if sound is paused or off on this page, a note says so and offers
        'Turn on sound'. The item's Working notes save themselves after a short
        pause and whenever the musician leaves them — Done is optional, and a
        draft lands on the item it was typed for. An optional metronome (Start
        beat; BPM by −/+ or typed, 40–240; three levels) sounds only while the
        clock runs on a visible screen: Pause, Finish, Discard, leaving, a
        hidden page or lost sound stop it, only a tap starts it again, and a
        boundary cue mutes it briefly. '+ Ask teacher' adds one question for the
        nearest upcoming class (or unassigned) without pausing anything, saying
        'Saved' only once the device has it."
      changes: Elapsed seconds accumulate only while the timer runs. A question asked
        here is one new lesson-agenda entry; tempo and level are never recorded.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-28T19:04:54.684Z
    - actor: The musician
      action: Taps 'Finish'.
      shows: The close screen, with the minutes already filled in.
      changes: The clock is frozen first, so reflection time is not counted as practice.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:27.915Z
        commit: 8eeb7d512120468cd26ef28655ad0d8171bcb664
    - actor: The musician
      action: Says what the block covered — focused work on a part or one aspect (the
        default) or an explicit whole-item check — picks one of the six results,
        optionally adds an observation, a next action or a teacher question, and
        optionally revises the item behind one collapsed 'Status · Primary focus
        · Current effort · return' line (Change). A status suggestion or 'Keep
        it fresh' is offered only after a whole-item check, never pre-selected.
      shows: "One 'Next practice' line from the same decision that will be saved: an
        item being worked on comes back in 1–3 days, a kept-fresh item's whole
        check follows spaced repetition, and class preparation says it stays
        available until its class — practised today included — beside a review
        date that stays as stored. 'Why this date?' explains it in place."
      changes: Nothing until Save; untouched fields are never written.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-28T19:04:54.684Z
    - actor: The musician
      action: Taps 'Save block'.
      shows: Back to Today (or to the running plan), with the item's stats and status
        updated.
      changes: A PracticeBlock is stored with what it covered; the item's counters and
        saturation flag update; its next date is the one shown — spaced
        repetition advances only on a kept-fresh item's eligible whole-item
        check — and the open review completes only when that decision writes a
        date. Status and return intention change only when the musician chose
        them.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-24T02:14:27.915Z
        commit: 8eeb7d512120468cd26ef28655ad0d8171bcb664
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
        screen-wake-lock or the accompanying cue — two short rising pulses,
        readied by a Start or Resume tap, played once per granted boundary
        claim, never queued to sound late, and briefly muting the metronome —
        and vibration succeed, fail or are unsupported never changes the elapsed
        time or the minutes eventually saved.
      status: works
    - name: Test practice sound
      differs: "Settings → Practice sound: 'Test practice sound' plays the same two
        rising pulses on demand and says whether sound is ready, paused or off
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
    - "A result describes only its block's scope: readiness (a status, Keep
      fresh) changes only on the musician's tap, and focused work never moves a
      whole-item check."
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
    - src/domain/practiceSessionModel.ts
    - src/components/ItemNotes.tsx
    - src/store/notesDrafts.ts
    - src/components/practiceCue.ts
    - src/components/metronome.ts
    - src/components/TeacherQuestionCapture.tsx
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
    - file: tests/live-practice-families.test.ts
      steps:
        - 2
        - 4
        - 6
    - file: tests/live-practice.browser.test.ts
      steps:
        - 4
---

# Proposed update: Practise what the app suggests

_Proposed by agent · Works now_

**Reason:** Class work practised earlier today stays in the shared pool until its class; the running block gains an opt-in metronome and an in-place teacher question; the boundary cue was reshaped.

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

2. **Practice Compass** Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (an unassessed routine block included) steps aside while anything else waits, except work prepared for an upcoming class, which stays available until that class — and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review; a repeat says plainly that nothing else is waiting, and class work practised earlier today says it stays available until its class.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for. An optional metronome (Start beat; BPM by −/+ or typed, 40–240; three levels) sounds only while the clock runs on a visible screen: Pause, Finish, Discard, leaving, a hidden page or lost sound stop it, only a tap starts it again, and a boundary cue mutes it briefly. '+ Ask teacher' adds one question for the nearest upcoming class (or unassigned) without pausing anything, saying 'Saved' only once the device has it.
   - Changes: Elapsed seconds accumulate only while the timer runs. A question asked here is one new lesson-agenda entry; tempo and level are never recorded.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
   - Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says it stays available until its class — practised today included — beside a review date that stays as stored. 'Why this date?' explains it in place.
   - Changes: Nothing until Save; untouched fields are never written.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored with what it covered; the item's counters and saturation flag update; its next date is the one shown — spaced repetition advances only on a kept-fresh item's eligible whole-item check — and the open review completes only when that decision writes a date. Status and return intention change only when the musician chose them.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying cue — two short rising pulses, readied by a Start or Resume tap, played once per granted boundary claim, never queued to sound late, and briefly muting the metronome — and vibration succeed, fail or are unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_
- **Test practice sound** — Settings → Practice sound: 'Test practice sound' plays the same two rising pulses on demand and says whether sound is ready, paused or off on this page. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.
- A result describes only its block's scope: readiness (a status, Keep fresh) changes only on the musician's tap, and focused work never moves a whole-item check.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

**Kept as the current Flow has it (not mentioned by this proposal):** presentation

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=fa60f4e5dc8d9379 truth.goal=44bf058127a4cdd5 truth.startsWhen=b3a81d2264b7bc48 truth.needs=4f53cda18c2baa0c truth.steps=e93c8a1ad0bb9772 truth.endsWith=483b46c5af906a2e truth.variations=b903bcac8f291789 truth.rules=14c5a5f488d0a66e truth.involves=f3c7c539e5c88476 mechanics.touchpoints=2a2c79b1476066d6 mechanics.routes=8c727f68010a3eb7 mechanics.components=1b936c9d47c5c0f7 mechanics.entities=c8810400be470c79 mechanics.tests=7c056574c25aa83f -->
