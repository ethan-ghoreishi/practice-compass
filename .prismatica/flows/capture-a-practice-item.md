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
    breaking your concentration.
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
        at: 2026-08-31T16:19:36.157Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Or chooses 'Add practice item' for the full one-step form.
      shows: "A kind-first form: what you are adding (gusheh / composed piece / piece
        / étude / passage / technique), then only that kind's identity fields,
        then 'Connect it (optional)', then the first practice setup."
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:36.157Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Fills in identity, and optionally connects a study source (creatable
        inline), a pathway stage, a lesson and a parent work — all at creation.
      shows: Persian instruments are asked for dastgāh, gusheh, form and composer,
        with dastgāh and form offered as datalist suggestions; free text always
        wins.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:36.157Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Saves.
      shows: The item's own page, with a 'Connected to' summary near the top.
      changes: One item, linked to whatever it belongs to — links never duplicate the
        item.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:36.157Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
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
approval:
  hash: 54132080907d546ed32720a72d5030b83e16ed5df3b3827b5448c3df3fd035c2
  at: 2026-08-28T13:30:17.831Z
  by: Ethan
  signature: 3r7JivKjGCJCXJI0CnJgup/vmajsz0IE5NlH7q2i7oO4C0vSjI+oLWFxpMBOFAz1oRfcDjt7tb2WMsvbAzYABg==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

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
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

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
