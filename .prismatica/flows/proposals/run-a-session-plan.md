---
id: run-a-session-plan
proposalType: update
reason: "Lane 20260831-re-home-hands-free-practice-onto-current-bac4 added a
  Screen Wake Lock and a durable target-reached/overtime state to
  src/pages/ActiveBlock.tsx, the same screen a Session Plan segment opens in
  step 4 of this flow (see src/domain/practiceSignal.ts,
  src/components/useScreenAwake.ts, src/components/screenAwake.ts). Step 4
  did not describe either — flagged by this lane's sealed review (family:
  flow-truth-reapproval), and named in the approved plan's own
  possibleConflicts ('plan segments use ActiveBlock'). This proposal adds
  that observable behaviour to step 4. It is a PROPOSAL only: no manual
  re-verification of this flow's other steps was performed in this lane, and
  no evidence is claimed here beyond what the code and its own unit tests
  show."
proposedBy: agent
createdAt: 2026-08-31T20:40:29.000Z
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
    - actor: The musician
      action: Swaps, removes or regenerates segments until the shape looks right.
      shows: The remaining minutes are redistributed immediately so the total still
        equals the budget.
      changes: Only a local copy of the plan — nothing is saved yet.
      assumes: []
    - actor: The musician
      action: Taps 'Start plan'.
      shows: "The runner: the whole list with the current segment highlighted."
      changes: The running plan is held in app state (never in the database, never
        synced), and the chosen length is remembered for this instrument.
      assumes: []
    - actor: The musician
      action: Taps 'Start' on the current segment.
      shows: The ordinary active-block screen, with the segment's minutes as the
        target — identical behaviour to an unplanned block, including the
        screen staying awake while it runs and is visible, and a durable
        'Target reached' state with a growing overtime figure if the segment
        runs past its minutes without the musician tapping Finish.
      changes: A real practice block opens for that segment's item.
      assumes: []
    - actor: The musician
      action: Finishes and saves the block as usual.
      shows: Back on the plan, that segment reads 'done' and the pointer moves to the
        next one.
      changes: The block, item stats and review schedule update exactly as in an
        unplanned block.
      assumes: []
    - actor: The musician
      action: Skips anything they do not want, or ends the plan at any time.
      shows: "'Session complete' once the last segment is passed."
      changes: A skipped segment logs nothing at all; ending the plan discards it and
        leaves every logged block untouched.
      assumes: []
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
---

Proposed update — see the flow's own record for the current canonical body.
This body is regenerated deterministically by `prismatica flow approve` and is
not read for data.
