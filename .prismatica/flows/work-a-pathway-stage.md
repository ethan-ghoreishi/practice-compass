---
id: work-a-pathway-stage
createdAt: 2026-08-26T22:58:34.899Z
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
    - actor: The musician
      action: Taps + on a suggestion.
      shows: The row becomes a real item, honestly marked 'Not practised yet', with a
        lingering Undo card.
      changes: A practice item is created from the catalogue entry, carrying its
        stable catalogue key — adding is organisation, not progress.
      assumes: []
    - actor: The musician
      action: Undoes it, or removes it later from the row's − button, if it was added
        by mistake.
      shows: The row reverts to a suggestion.
      changes: The item is deleted only while it is provably untouched (catalogue
        item, still 'not practised', zero blocks); the check is re-run against
        live data, so anything practised is kept.
      assumes: []
    - actor: The musician
      action: Taps ▶ on a row to practise it.
      shows: The ordinary active block.
      changes: A suggestion not yet added is added first, then the block opens.
      assumes: []
    - actor: The musician
      action: Optionally pins the stage as the current one, or edits its code, title
        and intro.
      shows: Today's 'Now in:' card points at the pinned stage.
      changes: The pathway records the pinned stage; deleting a stage detaches items
        instead of deleting them.
      assumes: []
  endsWith: The next piece of the route is now a real practice item with real
    practice behind it, and the stage's progress reflects it honestly.
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
approval:
  hash: 57dc3293be5068d38c9b0f5f06702b222f63e92f850f9f078a9c2efbbe01d874
  at: 2026-08-31T22:05:33.178Z
  by: owner
  signature: S2VdV6tq1iBCWAXpz9nGJ0+KiwGrL0istCHY4nyBA/NrLRuQCE3AVxchozFGgGDvDFpijySQRsncL7KVR/39BQ==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Work through a pathway stage

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

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
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue

