---
id: work-a-pathway-stage
proposalType: update
reason: "This lane adds a screen wake lock (RoutineRunner holds it while
  genuinely running and visible; releases on pause/hidden/unmount) and a
  visible, non-flash segment-boundary announcement to the Guided routine
  variation. While updating this variation's truth, also correcting wording that
  was already stale independently of this lane: the v11 routines lane made bound
  segments record real PracticeBlocks with honest minutes, so 'explicitly not
  logged as practice' has not been true since v11 — this lane changes no
  routine-logging behaviour, only the wording."
proposedBy: agent
createdAt: 2026-08-30T13:00:33.664Z
status: works
presentation:
  title: Work through a pathway stage
  journey: Building the library
  order: 5
truth:
  goal: Follow a route you trust — see where you are, take the next suggestion
    into your own items, and practise it.
  startsWhen: From Repertoire → Pathways (or the 'Now in:' card on Today) the
    musician opens a pathway and then a stage.
  needs: []
  steps:
    - actor: Practice Compass
      action: "Shows the stage's rows: your own items laid over the stage's reference
        catalogue, with progress derived from item status."
      shows: A progress bar reading 'n/m solid', guided routines if any, and one line
        of metadata per row — greyed rows are labelled reference suggestions.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Taps + on a suggestion.
      shows: The row becomes a real item, honestly marked 'Not practised yet', with a
        lingering Undo card.
      changes: A practice item is created from the catalogue entry, carrying its
        stable catalogue key — adding is organisation, not progress.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Undoes it, or removes it later from the row's − button, if it was added
        by mistake.
      shows: The row reverts to a suggestion.
      changes: The item is deleted only while it is provably untouched (catalogue
        item, still 'not practised', zero blocks); the check is re-run against
        live data, so anything practised is kept.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Taps ▶ on a row to practise it.
      shows: The ordinary active block.
      changes: A suggestion not yet added is added first, then the block opens.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
    - actor: The musician
      action: Optionally pins the stage as the current one, or edits its code, title
        and intro.
      shows: Today's 'Now in:' card points at the pinned stage.
      changes: The pathway records the pinned stage; deleting a stage detaches items
        instead of deleting them.
      assumes: []
      evidence:
        method: inferred
        at: 2026-08-30T12:54:05.664Z
  endsWith: The next piece of the route is now a real practice item with real
    practice behind it, and the stage's progress reflects it honestly.
  variations:
    - name: Teacher jumps around
      differs: A pinned current stage always beats 'first incomplete stage', because
        teacher-led work does not go in order.
      status: works
    - name: Guided routine
      differs: "A stage routine runs as a segmented countdown: while it is genuinely
        running and its screen is visible, the app holds a screen wake lock so
        it stays readable hands-free; pausing, finishing or navigating away
        releases it. Arriving at a new segment is visibly announced (not a
        silent swap) for a defined window, and reaching the last segment ends on
        the existing 'Routine complete' screen. A segment bound to a practice
        item records real, honest minutes as one block per item (result:
        'not_logged', so it completes no review and advances no SM-2 state); an
        unbound segment is a plain warm-up timer."
      status: works
    - name: Off-catalogue items
      differs: Anything quick-added inside the stage appears in the same list and in
        recommendations.
      status: works
  rules:
    - The item is the only unit of work — a pathway is a view over items, never
      a parallel to-do list.
    - The catalogue is reference data in code, labelled as an aid, never a fixed
      syllabus.
    - Adding from the catalogue is losslessly reversible until the moment it is
      practised.
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
    - src/store/useStore.ts
    - src/domain/practiceSignal.ts
    - src/components/screenAwake.ts
    - src/components/useScreenAwake.ts
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
      steps: []
    - file: src/domain/practiceSignal.test.ts
      steps: []
    - file: src/domain/routines.test.ts
      steps: []
    - file: src/components/screenAwake.test.ts
      steps: []
---

# Proposed update: Work through a pathway stage

_Proposed by agent · Works now_

**Reason:** This lane adds a screen wake lock (RoutineRunner holds it while genuinely running and visible; releases on pause/hidden/unmount) and a visible, non-flash segment-boundary announcement to the Guided routine variation. While updating this variation's truth, also correcting wording that was already stale independently of this lane: the v11 routines lane made bound segments record real PracticeBlocks with honest minutes, so 'explicitly not logged as practice' has not been true since v11 — this lane changes no routine-logging behaviour, only the wording.

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented countdown: while it is genuinely running and its screen is visible, the app holds a screen wake lock so it stays readable hands-free; pausing, finishing or navigating away releases it. Arriving at a new segment is visibly announced (not a silent swap) for a defined window, and reaching the last segment ends on the existing 'Routine complete' screen. A segment bound to a practice item records real, honest minutes as one block per item (result: 'not_logged', so it completes no review and advances no SM-2 state); an unbound segment is a plain warm-up timer. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.

## Involves

- The musician
- The pathway catalogue

