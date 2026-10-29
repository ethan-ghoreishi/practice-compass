---
id: capture-a-practice-item
createdAt: 2026-08-26T22:58:34.899Z
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
        at: 2026-10-29T21:06:02.807Z
        commit: 6d71c6eda6936d987c4f2312221ac312cc8dcc30
    - actor: The musician
      action: Or chooses 'Add practice item' for the full one-step form.
      shows: "A kind-first form: what you are adding (gusheh / composed piece / piece
        / étude / passage / technique / theory or listening study), then only
        that kind's identity fields, then 'Connect it (optional)', then the
        first practice setup."
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:06:02.807Z
        commit: 6d71c6eda6936d987c4f2312221ac312cc8dcc30
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
        at: 2026-10-29T21:06:02.807Z
        commit: 6d71c6eda6936d987c4f2312221ac312cc8dcc30
    - actor: The musician
      action: Saves.
      shows: The item's own page, with a 'Connected to' summary near the top.
      changes: One item, linked to whatever it belongs to — links never duplicate the
        item.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:06:02.807Z
        commit: 6d71c6eda6936d987c4f2312221ac312cc8dcc30
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
approval:
  hash: 42cd58fd38634a08a6c2d111247fee85e986e3336ed840b9582a88c16a8a679c
  at: 2026-10-24T02:13:09.201Z
  by: owner
  signature: tZ2oNWZtpJInSXKPXV/RTfLzsLIXb88uH/JYVYjP4aEmTwC3QdCtGjPab4irWvIxHUC69dH4Q1rvsnA+b7mnAA==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Add a practice item

_Works now · approved 2026-10-24T02:13:09.201Z by owner (signed)_

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
