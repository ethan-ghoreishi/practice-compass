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
        laid out as warm-up, class work, review, focus and cool-down segments.
      shows: "The plan preview: each segment with its minutes, bucket, item and a
        one-sentence reason, and a total that always equals the chosen budget."
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
    - actor: The musician
      action: Swaps, removes or regenerates segments until the shape looks right.
      shows: The remaining minutes are redistributed immediately so the total still
        equals the budget.
      changes: Only a local copy of the plan — nothing is saved yet.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
    - actor: The musician
      action: Taps 'Start plan'.
      shows: "The runner: the whole list with the current segment highlighted."
      changes: The running plan is held in app state (never in the database, never
        synced), and the chosen length is remembered for this instrument.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
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
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
    - actor: The musician
      action: Finishes and saves the block as usual.
      shows: Back on the plan, that segment reads 'done' and the pointer moves to the
        next one.
      changes: The block, item stats and review schedule update exactly as in an
        unplanned block.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
    - actor: The musician
      action: Skips anything they do not want, or ends the plan at any time.
      shows: "'Session complete' once the last segment is passed."
      changes: A skipped segment logs nothing at all; ending the plan discards it and
        leaves every logged block untouched.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T22:06:48.053Z
        commit: 8764d89b70b146a109d76e63fe4c4fc51fff374b
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
    - Segment minutes always sum to the chosen budget.
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
approval:
  hash: 320d7c620942ce36a5864d5164593de288a9db7489abc20fda3e2e29fa34cec3
  at: 2026-08-31T22:05:33.129Z
  by: owner
  signature: fmZRiSSm6WxSdD0a3a5jEuFR5MJIP6qnIoLwuOCtT6UBmPXY00+xxd/oPUDXwgmRpL6sWbSNWg/FQ3I//W+sCw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine
