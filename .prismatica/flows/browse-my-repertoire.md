---
id: browse-my-repertoire
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Find something in my repertoire
  journey: Building the library
  order: 6
truth:
  goal: See everything you play, grouped the way you think about it, and open the
    one you mean.
  startsWhen: "The musician opens Repertoire and picks one of the three views:
    Pathways, My repertoire, or Practice list."
  needs: []
  steps:
    - actor: The musician
      action: Chooses 'My repertoire'.
      shows: Persian works grouped under their dastgāh — radif gushehs and composed
        maestro pieces side by side — and other instruments grouped by study
        source.
      changes: Nothing; this is a lens over ordinary items, not a separate store.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:22:06.902Z
        commit: 33eec40d3b6a7b1c8a7fa53682a58561740c0507
    - actor: Practice Compass
      action: Folds dastgāh spelling variants together, labels each group with the
        user's own majority spelling, and keeps parts nested under their parent
        work.
      shows: Each work appears exactly once, however many sources, stages and lessons
        it is linked to.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:22:06.902Z
        commit: 33eec40d3b6a7b1c8a7fa53682a58561740c0507
    - actor: The musician
      action: Optionally filters by form, or narrows to one instrument.
      shows: Form chips built from what is actually present.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:22:06.902Z
        commit: 33eec40d3b6a7b1c8a7fa53682a58561740c0507
    - actor: The musician
      action: Or chooses 'Practice list' and filters by search, instrument, status,
        type, or a quick chip (due today, for class, fragile, neglected,
        overworked, teacher question).
      shows: Items in priority order, each with its status and stats.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:22:06.902Z
        commit: 33eec40d3b6a7b1c8a7fa53682a58561740c0507
    - actor: The musician
      action: Opens an item.
      shows: "Its page: status, connections, stats, result trend, recent blocks,
        parts, notes and files."
      changes: Nothing until an action is taken there.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:22:06.902Z
        commit: 33eec40d3b6a7b1c8a7fa53682a58561740c0507
  endsWith: The right piece is found and opened in a couple of taps, from
    whichever way of thinking about it came first.
  variations:
    - name: No dastgāh yet
      differs: Works with Persian identity but no dastgāh sit in an explicit 'No
        dastgāh yet' group at the end.
      status: works
    - name: Technique stays out
      differs: Drills and generic exercises are not works — they live in the Practice
        list only.
      status: works
  rules:
    - "'My repertoire' is a derived lens, never a parallel database of pieces."
    - Links never duplicate an item.
    - "Study sources stay simple: instrument, one clear name, kind, status,
      note."
  involves:
    - The musician
mechanics:
  touchpoints:
    - src/pages/Repertoire.tsx
    - src/pages/ItemDetail.tsx
    - src/pages/Materials.tsx
    - src/domain/repertoire.ts
    - src/domain/persian.ts
    - src/domain/farsi.ts
  routes:
    - /repertoire
    - /items/:id
    - /materials
  components:
    - Repertoire
    - ItemDetail
    - Materials
    - ItemCard
  entities:
    - PracticeItem
    - Material
    - Instrument
  tests:
    - file: src/domain/repertoire.test.ts
      steps:
        - 1
        - 2
    - file: src/domain/persian.test.ts
      steps:
        - 2
approval:
  hash: cb9d8394744e5713b7d083e940a3f3756ceac2bcb59990e1782be80083cf8b8c
  at: 2026-08-28T13:30:17.801Z
  by: Ethan
  signature: q4xKQtb4h3/lcsS7YOVSmle3z9LAMdGgzjDhAp35KWb1IB0V8CzlM/+HWrooUNByW7KRmQwYUjHzHYAalH0FDw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Find something in my repertoire

_Works now · approved 2026-08-28T13:30:17.801Z by Ethan (signed)_

## Goal

See everything you play, grouped the way you think about it, and open the one you mean.

## Starts when

The musician opens Repertoire and picks one of the three views: Pathways, My repertoire, or Practice list.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Chooses 'My repertoire'.
   - Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
   - Changes: Nothing; this is a lens over ordinary items, not a separate store.

2. **Practice Compass** Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
   - Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.

3. **The musician** Optionally filters by form, or narrows to one instrument.
   - Shows: Form chips built from what is actually present.

4. **The musician** Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
   - Shows: Items in priority order, each with its status and stats.

5. **The musician** Opens an item.
   - Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
   - Changes: Nothing until an action is taken there.

## Ends with

The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.

## Variations

- **No dastgāh yet** — Works with Persian identity but no dastgāh sit in an explicit 'No dastgāh yet' group at the end. _(Works now)_
- **Technique stays out** — Drills and generic exercises are not works — they live in the Practice list only. _(Works now)_

## Rules

- 'My repertoire' is a derived lens, never a parallel database of pieces.
- Links never duplicate an item.
- Study sources stay simple: instrument, one clear name, kind, status, note.

## Involves

- The musician
