---
id: capture-a-practice-item
proposalType: update
reason: "Lane 20261023-…-34cc: 'Theory / listening study' joins the kinds, and
  study ideas pre-fill the same form."
proposedBy: agent
createdAt: 2026-10-23T22:12:26.384Z
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
        at: 2026-10-23T13:34:41.150Z
        commit: e20a1b8fc0091b03596776a7b3f25d54753939af
    - actor: The musician
      action: Or chooses 'Add practice item' for the full one-step form.
      shows: "A kind-first form: what you are adding (gusheh / composed piece / piece
        / étude / passage / technique / theory or listening study), then only
        that kind's identity fields, then 'Connect it (optional)', then the
        first practice setup."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-23T22:12:20.000Z
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
        method: manual
        at: 2026-10-23T13:34:41.150Z
        commit: e20a1b8fc0091b03596776a7b3f25d54753939af
    - actor: The musician
      action: Saves.
      shows: The item's own page, with a 'Connected to' summary near the top.
      changes: One item, linked to whatever it belongs to — links never duplicate the
        item.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-23T13:34:41.150Z
        commit: e20a1b8fc0091b03596776a7b3f25d54753939af
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
    - name: A study idea
      differs: An item with a dastgāh offers optional study ideas (Farsi questions
        about that dastgāh, never facts); a tap opens 'Add practice item' as
        theory or listening study with the title filled in — nothing exists
        until it is saved. A study item is ordinary practice, in the Practice
        list, never a work in My repertoire.
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

**Reason:** Lane 20261023-…-34cc: 'Theory / listening study' joins the kinds, and study ideas pre-fill the same form.

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
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique / theory or listening study), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

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
- **A study idea** — An item with a dastgāh offers optional study ideas (Farsi questions about that dastgāh, never facts); a tap opens 'Add practice item' as theory or listening study with the title filled in — nothing exists until it is saved. A study item is ordinary practice, in the Practice list, never a work in My repertoire. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=123c1904295cb80d truth.goal=fc9a5f11f08f9620 truth.startsWhen=8e9b8e2d31c3bc12 truth.needs=4f53cda18c2baa0c truth.steps=106241013a6eb8ce truth.endsWith=8bf27a738a9e39bf truth.variations=ba19df61da5be29c truth.rules=04a4d51a4f022897 truth.involves=310ec7dc0b099c37 mechanics.touchpoints=06dcd4a7f3c35d7d mechanics.routes=036123c2981cfd45 mechanics.components=b7ddefb56716eceb mechanics.entities=c4c009fdce1ff354 mechanics.tests=e1dbf2253a8fb57a -->
