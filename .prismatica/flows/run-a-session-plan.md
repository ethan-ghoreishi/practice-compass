---
id: run-a-session-plan
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Run a time-budgeted session
  journey: Daily practice
  order: 3
truth:
  goal: Turn the minutes actually available into an ordered session, then practise
    it block by block.
  startsWhen: The musician taps 'Plan this session' on Today and chooses a length
    (15, 20, 30, 45 or 60 minutes).
  needs: []
  steps:
    - actor: Practice Compass
      action: Builds a plan from the same priority numbers the recommendation uses,
        laid out as warm-up, class work, review, focus and cool-down segments; a
        whole work (gusheh, piece, anything with dastgāh/form/composer) gets at
        least the 10-minute standard block beside other work, drills at least 2,
        and a segment is seated only while every seated segment can still reach
        its floor. Before anything optional it seats every item prepared for the
        nearest upcoming class — practised earlier today included — at its
        floor; when they cannot all fit it seats the subset that does by
        ranking, holds class work only, and names the rest.
      shows: "The plan preview: each segment with its minutes, bucket, item and a
        one-sentence reason. The total equals the chosen budget unless every
        segment that may take minutes is at its 25-minute ceiling; the warm-up
        and cool-down never exceed their shares or take leftover minutes. A
        class-coverage card says how much of the next class's work is in, names
        anything left out and why (does not fit, or removed or swapped by the
        musician), offers the length that holds it all ('Use N min', never past
        120), and lists resting class work as resting."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
    - actor: The musician
      action: Reorders (Move earlier / Move later, by keyboard or touch), swaps,
        removes or regenerates segments until the shape looks right.
      shows: A move carries the whole segment — item, minutes, role, reason — and
        nothing else changes. A removal leaves every other segment's minutes as
        they were and shows the freed minutes as unused, offering 'Spread over
        the rest' or 'Give to one…' — each entry only up to its own ceiling, a
        cancelled choice changing nothing, leaving them needing no tap;
        Regenerate or a new length reallocates. A swap keeps the slot's minutes
        and offers only material whose floor fits it — the next class's work
        too, even in a one-row plan.
      changes: Only a local copy of the plan — nothing is saved yet.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
    - actor: The musician
      action: Taps 'Start plan' — or, when class work is left out, 'Start without N
        class items', a choice bound to exactly that coverage.
      shows: "The runner: the whole list in the musician's order, the current segment
        highlighted, with time left, unused and recorded shown separately. Start
        refuses visibly when the day, the data or the class coverage moved since
        the preview, and never starts a class item below its useful minutes."
      changes: The running plan is held in app state (never in the database, never
        synced), and the chosen length is remembered for this instrument.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
    - actor: The musician
      action: Taps 'Start' on the current segment.
      shows: The ordinary active-block screen, with the segment's minutes as the
        target — identical behaviour to an unplanned block, including the screen
        staying awake while it runs and is visible, and a durable 'Target
        reached' state with a growing overtime figure if the segment runs past
        its minutes without the musician tapping Finish.
      changes: A real practice block opens for that segment's item.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
    - actor: The musician
      action: Finishes and saves the block as usual.
      shows: Back on the plan, that segment reads 'done' with the minutes actually
        recorded, and the pointer moves to the next one; overtime is recorded as
        practised and charged to no other segment.
      changes: The block, item stats and review schedule update exactly as in an
        unplanned block.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
    - actor: The musician
      action: Skips any segment not yet started, skips the running one with 'Skip this
        one — save nothing', or ends the plan at any time; Finish (then Save,
        with or without a result) is how a shortened segment keeps what was
        practised.
      shows: "'Session complete' once the last segment is passed — saying so plainly
        when nothing was practised."
      changes: A skipped segment logs nothing at all, even after time passed in it,
        and lengthens nothing else; ending the plan discards it and leaves every
        logged block untouched.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:19.292Z
        commit: dd59c9a29d71db3a547cf242c48d367064258d3b
  endsWith: The available time was spent on real, logged practice in a sensible
    order — and the plan itself leaves no trace in the data.
  variations:
    - name: Nothing to plan
      differs: With no items for the instrument the plan is empty and says so rather
        than inventing filler.
      status: works
    - name: Everything already practised today
      differs: A plan is still produced, and the summary says plainly that everything
        has been practised today.
      status: works
    - name: Resume
      differs: While a plan runs, Today's card becomes 'Resume your plan' with the
        count of finished segments.
      status: works
  rules:
    - Segment minutes never exceed the chosen budget; minutes freed by removing
      or skipping stay unused until the musician deliberately rebuilds.
    - A plan is a view over real practice blocks — it is not a countdown and it
      is never persisted as data.
    - No scores, no 'optimal session' claims.
  involves:
    - The musician
    - The plan builder
    - The recommendation engine
mechanics:
  touchpoints:
    - src/pages/SessionPlan.tsx
    - src/pages/Today.tsx
    - src/pages/ActiveBlock.tsx
    - src/domain/plan.ts
    - src/domain/practiceSignal.ts
    - src/components/useScreenAwake.ts
    - src/components/screenAwake.ts
    - src/store/useStore.ts
    - src/domain/lessonAgenda.ts
    - src/components/ui.tsx
    - src/components/metronome.ts
  routes:
    - /plan
    - /active
    - /close
  components:
    - SessionPlan
    - Today
  entities:
    - SessionPlan
    - PracticeItem
    - PracticeBlock
    - Review
    - SchedulingParams
  tests:
    - file: src/domain/plan.test.ts
      steps:
        - 1
        - 2
    - file: src/domain/practiceSignal.test.ts
      steps:
        - 4
    - file: src/components/screenAwake.test.ts
      steps:
        - 4
    - file: tests/live-practice-families.test.ts
      steps:
        - 1
        - 2
        - 3
        - 6
    - file: tests/live-practice.browser.test.ts
      steps:
        - 2
        - 3
        - 4
approval:
  hash: 1326a0f62c7e2ad0500829785c62b363e743d83d051eec907b995a5c1f5a4ff2
  at: 2026-10-29T21:05:17.751Z
  by: owner
  signature: fuPGhhxihGuZv73x3a/UqO/pKzbSsFcrA+zxMZ0COxfTIaImcdPhGwOQzPCjmH/BOg258Q8pE51NDAJdzShsCA==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Run a time-budgeted session

_Works now · approved 2026-10-29T21:05:17.751Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor. Before anything optional it seats every item prepared for the nearest upcoming class — practised earlier today included — at its floor; when they cannot all fit it seats the subset that does by ranking, holds class work only, and names the rest.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes. A class-coverage card says how much of the next class's work is in, names anything left out and why (does not fit, or removed or swapped by the musician), offers the length that holds it all ('Use N min', never past 120), and lists resting class work as resting.

2. **The musician** Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
   - Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused, offering 'Spread over the rest' or 'Give to one…' — each entry only up to its own ceiling, a cancelled choice changing nothing, leaving them needing no tap; Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it — the next class's work too, even in a one-row plan.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan' — or, when class work is left out, 'Start without N class items', a choice bound to exactly that coverage.
   - Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately. Start refuses visibly when the day, the data or the class coverage moved since the preview, and never starts a class item below its useful minutes.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' with the minutes actually recorded, and the pointer moves to the next one; overtime is recorded as practised and charged to no other segment.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips any segment not yet started, skips the running one with 'Skip this one — save nothing', or ends the plan at any time; Finish (then Save, with or without a result) is how a shortened segment keeps what was practised.
   - Shows: 'Session complete' once the last segment is passed — saying so plainly when nothing was practised.
   - Changes: A skipped segment logs nothing at all, even after time passed in it, and lengthens nothing else; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes never exceed the chosen budget; minutes freed by removing or skipping stay unused until the musician deliberately rebuilds.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine
