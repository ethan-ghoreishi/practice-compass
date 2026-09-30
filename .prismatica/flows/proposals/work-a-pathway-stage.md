---
id: work-a-pathway-stage
proposalType: update
reason: This change binds suggestions to owned items by reference identity (so
  moves never duplicate), replaces the deleting Undo and the row "−" with Link /
  Unlink / Remove from pathway / Hide, and routes every screen through one
  pathway selector.
proposedBy: agent
createdAt: 2026-09-29T10:34:58.606Z
status: works
presentation:
  title: Work through a pathway stage
  journey: Building the library
  order: 5
truth:
  goal: Follow a route you trust — see where you are, take the next suggestion
    into your own items once, and practise it.
  startsWhen: From Repertoire → Pathways (or the 'Now in:' card on Today) the
    musician opens a pathway and then a stage.
  needs: []
  steps:
    - actor: Practice Compass
      action: "Shows the stage's rows: the owner's items laid over the stage's
        reference suggestions, each suggestion resolved to the owner's item by
        its reference binding on the pathway's instrument — never by where the
        item sits."
      shows: "'n/m solid' over the visible rows; suggestions hidden in this pathway
        are omitted; two legacy copies answering one suggestion show as a
        choice."
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: Taps + on a suggestion.
      shows: "'Added … — not practised yet.' The row now plays that item."
      changes: A practice item is created bound to the suggestion's reference; tapping
        again, after a move or a reload, hands back the same item — adding is
        organisation, not progress.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: "Optionally uses a row's ⋯ menu: Link an existing item, Unlink
        reference, Remove from pathway, or Hide this suggestion (restored from
        'Hidden suggestions')."
      changes: "Only organisation: Link sets one item's binding (same instrument
        only); Unlink drops one binding; Remove from pathway clears placement
        and hides the suggestion in this pathway; Hide is visibility only.
        Nothing is deleted — Delete practice item stays on the item's own page."
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: Taps ▶ on a row to practise it.
      shows: The ordinary active block.
      changes: A suggestion not yet added is added first, then the block opens.
      assumes: []
      evidence:
        method: manual
        at: 2026-09-23T20:22:04.930Z
        commit: 368cdd9970bb5fd143ed73e90a8fd9eafdf9c621
    - actor: The musician
      action: Optionally pins the stage as the current one, edits it, or
        archives/restores the pathway.
      shows: Today, the Session Plan and Repertoire follow the same visible pathway
        and pinned stage.
      changes: The pathway records the pin or its archived state; deleting a stage or
        pathway detaches items instead of deleting them.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
  endsWith: The next piece of the route is a real practice item — taken once —
    with real practice behind it, and the stage's progress reflects it honestly.
  variations:
    - name: Teacher jumps around
      differs: A pinned current stage always beats 'first incomplete stage', because
        teacher-led work does not go in order.
      status: works
    - name: Guided routine
      differs: A stage routine runs as a segmented warm-up countdown. A segment bound
        to a real item creates an honest PracticeBlock when the run finishes
        (result stays 'not_logged', so no review completes and no
        spaced-repetition state advances — the practice itself IS recorded); a
        segment with no bound item is pure warm-up and logs nothing at all.
        While the run is genuinely active and its screen is visible, the app
        keeps the display awake, and arriving at a new segment is visibly
        announced — once, and staying perceptible for a few seconds, never a
        single-render flash.
      status: works
    - name: Off-catalogue items
      differs: Anything quick-added inside the stage appears in the same list and in
        recommendations.
      status: works
    - name: A default pathway this install lacks
      differs: "Before step 1, Repertoire → Pathways offers each shipped default
        pathway this install does not have — one newly shipped since the
        database was made, such as the Khonyagar Tar course, or one the owner
        deleted — as its own 'Add default pathway: <name>' button beside 'New
        pathway', only when this device has that pathway's instrument and only
        within the current instrument filter. Tapping one adds exactly that
        pathway with its seeded stages and any seeded routine whose id is not
        already held; nothing that exists is changed, nothing is added without
        that tap, and the button then disappears."
      status: works
  rules:
    - The item is the only unit of work — a pathway is a view over items, never
      a parallel to-do list.
    - The catalogue is reference data in code, labelled as an aid, never a fixed
      syllabus.
    - Adding from the catalogue is losslessly reversible until the moment it is
      practised.
    - A routine records at most one PracticeBlock per distinct bound item per
      run, never one per segment repeat.
  involves:
    - The musician
    - The pathway catalogue
mechanics:
  touchpoints:
    - src/pages/PathwayDetail.tsx
    - src/pages/StageDetail.tsx
    - src/pages/RoutineRunner.tsx
    - src/domain/pathways.ts
    - src/domain/pathwaySeed.ts
    - src/domain/routines.ts
    - src/domain/practiceSignal.ts
    - src/components/useScreenAwake.ts
    - src/components/screenAwake.ts
    - src/store/useStore.ts
    - src/pages/Repertoire.tsx
  routes:
    - /repertoire
    - /pathway/:pathwayId
    - /pathway/:pathwayId/:stageId
    - /routine/:routineId
  components:
    - PathwayDetail
    - StageDetail
    - RoutineRunner
    - QuickAdd
  entities:
    - Pathway
    - PathwayStage
    - PathwayRoutine
    - PracticeItem
  tests:
    - file: src/domain/pathways.test.ts
      steps:
        - 1
        - 2
        - 3
        - 5
    - file: src/domain/routines.test.ts
      steps:
        - 4
    - file: src/domain/practiceSignal.test.ts
      steps:
        - 4
    - file: src/components/screenAwake.test.ts
      steps:
        - 4
---

# Proposed update: Work through a pathway stage

_Proposed by agent · Works now_

**Reason:** This change binds suggestions to owned items by reference identity (so moves never duplicate), replaces the deleting Undo and the row "−" with Link / Unlink / Remove from pathway / Hide, and routes every screen through one pathway selector.

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items once, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: the owner's items laid over the stage's reference suggestions, each suggestion resolved to the owner's item by its reference binding on the pathway's instrument — never by where the item sits.
   - Shows: 'n/m solid' over the visible rows; suggestions hidden in this pathway are omitted; two legacy copies answering one suggestion show as a choice.

2. **The musician** Taps + on a suggestion.
   - Shows: 'Added … — not practised yet.' The row now plays that item.
   - Changes: A practice item is created bound to the suggestion's reference; tapping again, after a move or a reload, hands back the same item — adding is organisation, not progress.

3. **The musician** Optionally uses a row's ⋯ menu: Link an existing item, Unlink reference, Remove from pathway, or Hide this suggestion (restored from 'Hidden suggestions').
   - Changes: Only organisation: Link sets one item's binding (same instrument only); Unlink drops one binding; Remove from pathway clears placement and hides the suggestion in this pathway; Hide is visibility only. Nothing is deleted — Delete practice item stays on the item's own page.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, edits it, or archives/restores the pathway.
   - Shows: Today, the Session Plan and Repertoire follow the same visible pathway and pinned stage.
   - Changes: The pathway records the pin or its archived state; deleting a stage or pathway detaches items instead of deleting them.

## Ends with

The next piece of the route is a real practice item — taken once — with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_
- **A default pathway this install lacks** — Before step 1, Repertoire → Pathways offers each shipped default pathway this install does not have — one newly shipped since the database was made, such as the Khonyagar Tar course, or one the owner deleted — as its own 'Add default pathway: <name>' button beside 'New pathway', only when this device has that pathway's instrument and only within the current instrument filter. Tapping one adds exactly that pathway with its seeded stages and any seeded routine whose id is not already held; nothing that exists is changed, nothing is added without that tap, and the button then disappears. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.variations, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=f6fd73ce53f8d951 truth.goal=7e8e46aa44f8bd04 truth.startsWhen=e7940a96cbec0b4d truth.needs=4f53cda18c2baa0c truth.steps=65a09667e2130346 truth.endsWith=b14f68eb1a7e83e5 truth.variations=f1a3df06a02e98b1 truth.rules=a4112e83c8821353 truth.involves=0192fd98dbd5076b mechanics.touchpoints=af67c0d7d9a6e502 mechanics.routes=0fd93f05f88319b0 mechanics.components=bdee7b6ef565e2cf mechanics.entities=946f0611b327b3e7 mechanics.tests=35a4f7c1f8a2d1e8 -->
