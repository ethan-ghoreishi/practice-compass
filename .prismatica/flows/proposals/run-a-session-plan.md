---
id: run-a-session-plan
proposalType: update
reason: This lane's wake-lock and target-reached announcement apply to every
  ordinary block, including one started as a Session Plan segment on /active
  (this flow already lists that route as the mechanism for step 4). Updating
  step 4's description to state that plainly, without altering the plan's own
  invariants (minutes still sum to the budget; the plan is still not persisted).
proposedBy: agent
createdAt: 2026-08-30T13:00:33.664Z
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
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Swaps, removes or regenerates segments until the shape looks right.
      shows: The remaining minutes are redistributed immediately so the total still
        equals the budget.
      changes: Only a local copy of the plan — nothing is saved yet.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Taps 'Start plan'.
      shows: "The runner: the whole list with the current segment highlighted."
      changes: The running plan is held in app state (never in the database, never
        synced), and the chosen length is remembered for this instrument.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Taps 'Start' on the current segment.
      shows: The ordinary active-block screen, with the segment's minutes as the
        target — the screen stays awake while it runs, and reaching the
        segment's minutes visibly announces the target reached (with a growing
        overtime figure) rather than counting on unremarked.
      changes: A real practice block opens for that segment's item.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Finishes and saves the block as usual.
      shows: Back on the plan, that segment reads 'done' and the pointer moves to the
        next one.
      changes: The block, item stats and review schedule update exactly as in an
        unplanned block.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Skips anything they do not want, or ends the plan at any time.
      shows: "'Session complete' once the last segment is passed."
      changes: A skipped segment logs nothing at all; ending the plan discards it and
        leaves every logged block untouched.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
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
    - src/domain/plan.ts
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
      steps: []
---

# Proposed update: Run a time-budgeted session

_Proposed by agent · Works now_

**Reason:** This lane's wake-lock and target-reached announcement apply to every ordinary block, including one started as a Session Plan segment on /active (this flow already lists that route as the mechanism for step 4). Updating step 4's description to state that plainly, without altering the plan's own invariants (minutes still sum to the budget; the plan is still not persisted).

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
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — the screen stays awake while it runs, and reaching the segment's minutes visibly announces the target reached (with a growing overtime figure) rather than counting on unremarked.
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

