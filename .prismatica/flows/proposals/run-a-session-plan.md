---
id: run-a-session-plan
proposalType: update
reason: "Lane 20261023-…-34cc: preview reordering, removal without
  redistribution, skipping any pending segment, and honest time figures change
  steps 2, 3, 5 and 6 and the budget rule."
proposedBy: agent
createdAt: 2026-10-23T22:12:26.384Z
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
        its floor.
      shows: "The plan preview: each segment with its minutes, bucket, item and a
        one-sentence reason. The total equals the chosen budget unless every
        segment that may take minutes is at its 25-minute ceiling; the warm-up
        and cool-down never exceed their shares or take leftover minutes."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-23T13:36:12.589Z
        commit: 564c0b9d553bc7d788d36bc21fc78d548b613a49
    - actor: The musician
      action: Reorders (Move earlier / Move later, by keyboard or touch), swaps,
        removes or regenerates segments until the shape looks right.
      shows: A move carries the whole segment — item, minutes, role, reason — and
        nothing else changes. A removal leaves every other segment's minutes as
        they were and shows the freed minutes as unused; only Regenerate or a
        new length reallocates. A swap keeps the slot's minutes and offers only
        material whose floor fits it.
      changes: Only a local copy of the plan — nothing is saved yet.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-23T22:12:20.000Z
    - actor: The musician
      action: Taps 'Start plan'.
      shows: "The runner: the whole list in the musician's order, the current segment
        highlighted, with time left, unused and recorded shown separately."
      changes: The running plan is held in app state (never in the database, never
        synced), and the chosen length is remembered for this instrument.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-23T22:12:20.000Z
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
        at: 2026-10-23T13:36:12.589Z
        commit: 564c0b9d553bc7d788d36bc21fc78d548b613a49
    - actor: The musician
      action: Finishes and saves the block as usual.
      shows: Back on the plan, that segment reads 'done' with the minutes actually
        recorded, and the pointer moves to the next one; overtime is recorded as
        practised and charged to no other segment.
      changes: The block, item stats and review schedule update exactly as in an
        unplanned block.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-23T22:12:20.000Z
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
        method: inferred
        at: 2026-10-23T22:12:20.000Z
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
---

# Proposed update: Run a time-budgeted session

_Proposed by agent · Works now_

**Reason:** Lane 20261023-…-34cc: preview reordering, removal without redistribution, skipping any pending segment, and honest time figures change steps 2, 3, 5 and 6 and the budget rule.

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.

2. **The musician** Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
   - Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused; only Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately.
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

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.variations, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow (deliberately — approving drops these):**
- truth.rules: Segment minutes always sum to the chosen budget.

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=299b7f05c5f5ed4c truth.goal=13721b72f2645533 truth.startsWhen=4afe5d34ea7d916c truth.needs=4f53cda18c2baa0c truth.steps=7aa2f57ae1d47d63 truth.endsWith=9d24ce4e066e7458 truth.variations=8f351fa693b38b29 truth.rules=014f51ca9829a8eb truth.involves=fc65ef98a982c72f mechanics.touchpoints=6b8c15aef61a7065 mechanics.routes=27e17e879b3578d6 mechanics.components=58b4ddf493e4b639 mechanics.entities=e0287dad40885d18 mechanics.tests=d251047090006c6d -->
