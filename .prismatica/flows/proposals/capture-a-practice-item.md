---
id: capture-a-practice-item
proposalType: update
reason: Change 20261005-make-setar-archive-recovery-repertoire-c-e964 replaces
  the native datalist (not a portable suggestion surface; it did not show on
  iPhone) with the app’s own suggestion buttons for dastgāh, form and composer.
proposedBy: agent
createdAt: 2026-10-05T23:20:16.148Z
status: works
presentation:
  title: Add a practice item
  journey: Building the library
  order: 4
truth:
  goal: Get a new piece, gusheh, étude, passage or technique into the app without
    breaking your concentration
  startsWhen: The musician wants to record something to work on — from Today, a
    stage, a lesson, the practice list, or the Start screen.
  needs: []
  steps:
    - actor: The musician
      action: Types a title into the quick-add box and presses Add.
      shows: "'Added ✓' with an 'add details' link."
      changes: A practice item exists, with the instrument taken from context (stage's
        pathway, lesson, or the current session instrument) and sensible
        defaults for everything else. From a lesson it is linked to that lesson
        at the same time.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:08.225Z
        commit: 2ac8fac00828b43057efc14798531c74a6cdf843
    - actor: The musician
      action: Or chooses 'Add practice item' for the full one-step form.
      shows: "A kind-first form: what you are adding (gusheh / composed piece / piece
        / étude / passage / technique), then only that kind's identity fields,
        then 'Connect it (optional)', then the first practice setup."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:08.225Z
        commit: 2ac8fac00828b43057efc14798531c74a6cdf843
    - actor: The musician
      action: Fills in identity, and optionally connects a study source (creatable
        inline), a pathway stage, a lesson and a parent work — all at creation.
      shows: Persian instruments are asked for dastgāh, gusheh, form and composer.
        While typing in dastgāh, form or composer, up to eight matching terms
        appear below the box as buttons — found from Farsi, Latin, an alias or a
        transliteration — beside an ‘All’ list and a clear control; a tap, click
        or Enter stores the shared term and returns focus to the box. A partial
        match is never accepted on its own, and free text always wins.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-05T23:19:51.493Z
    - actor: The musician
      action: Saves.
      shows: The item's own page, with a 'Connected to' summary near the top.
      changes: One item, linked to whatever it belongs to — links never duplicate the
        item.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:08.225Z
        commit: 2ac8fac00828b43057efc14798531c74a6cdf843
  endsWith: The thing to practise exists and can be started immediately; details
    can be filled in later, or never.
  variations:
    - name: Create while starting
      differs: The Start screen's quick create takes a title only, then begins the
        block right away; a link opens the full form and returns with the item
        preselected.
      status: works
    - name: Edit later
      differs: The same kind-first form is the item's inline edit, so nothing needs a
        second creation path.
      status: works
  rules:
    - "Exactly two creation paths, both one-step: title-only quick add, and the
      full kind-first form."
    - No required field beyond a title.
    - Free text is direction-aware so Farsi and English can be mixed anywhere.
  involves:
    - The musician
mechanics:
  touchpoints:
    - src/components/QuickAdd.tsx
    - src/components/ItemForm.tsx
    - src/components/itemKinds.ts
    - src/pages/NewItem.tsx
    - src/pages/ItemDetail.tsx
    - src/store/useStore.ts
    - src/domain/factories.ts
  routes:
    - /items/new
    - /items/:id
    - /repertoire
    - /
  components:
    - QuickAdd
    - ItemForm
    - NewItem
    - ItemDetail
  entities:
    - PracticeItem
    - Material
    - PathwayStage
    - Lesson
    - Instrument
  tests:
    - file: src/components/itemKinds.test.ts
      steps:
        - 2
        - 3
---

# Proposed update: Add a practice item

_Proposed by agent · Works now_

**Reason:** Change 20261005-make-setar-archive-recovery-repertoire-c-e964 replaces the native datalist (not a portable suggestion surface; it did not show on iPhone) with the app’s own suggestion buttons for dastgāh, form and composer.

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer. While typing in dastgāh, form or composer, up to eight matching terms appear below the box as buttons — found from Farsi, Latin, an alias or a transliteration — beside an ‘All’ list and a clear control; a tap, click or Enter stores the shared term and returns focus to the box. A partial match is never accepted on its own, and free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.variations, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=123c1904295cb80d truth.goal=ae0aec76e3f3f265 truth.startsWhen=8e9b8e2d31c3bc12 truth.needs=4f53cda18c2baa0c truth.steps=98dce9bc81812a6b truth.endsWith=8bf27a738a9e39bf truth.variations=ba19df61da5be29c truth.rules=04a4d51a4f022897 truth.involves=310ec7dc0b099c37 mechanics.touchpoints=06dcd4a7f3c35d7d mechanics.routes=036123c2981cfd45 mechanics.components=b7ddefb56716eceb mechanics.entities=c4c009fdce1ff354 mechanics.tests=e1dbf2253a8fb57a -->
