---
id: browse-my-repertoire
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Find something in my repertoire
  journey: Building the library
  order: 6
truth:
  goal: See everything you play, grouped the way you think about it, find it by
    any name, and open the one you mean without losing your place.
  startsWhen: The musician opens Repertoire (My repertoire by default, on the
    instrument being practised) or comes back to it from a piece.
  needs: []
  steps:
    - actor: The musician
      action: "Opens Repertoire, or picks one of the three peer views: My repertoire,
        Pathways or Practice list, and one instrument (or All)."
      shows: Works grouped by dastgāh (Persian) or study source (others); unclassified
        works under "No dastgāh yet"; each work once, parts nested.
      changes: "Nothing but the URL: view, instrument, query and filters live there,
        and Today's session instrument is never changed."
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: Practice Compass
      action: "Groups each classifying value by the shared vocabulary: a term
        reference, or text that is exactly one curated spelling of a term, joins
        that term; composites and unknown spellings stay the owner's own text."
      shows: «Shur» and «شور» in one group labelled with the term's name; the owner's
        text is never rewritten.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: Searches (title, gusheh, dastgāh/form/maestro in any spelling, study
        source, archive aliases) and narrows by Dastgāh, Form or Composer, or
        regroups by form, composer or source.
      shows: Facets built only from the works actually owned; a matching part shows
        its parent once; "No works match" with Clear filters when nothing does.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: Or chooses Practice list and filters by the same search, status, type or
        a quick chip.
      shows: Every practice item in priority order, parts included, under Practice
        list's own eligibility.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
    - actor: The musician
      action: Opens an item, then comes back by its back link or browser back.
      shows: The same view, instrument, query and filters as before.
      assumes: []
      evidence:
        method: inferred
        at: 2026-09-29T02:00:00.000Z
  endsWith: The musician found the piece they meant and is back where they were,
    with nothing stored differently.
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
  hash: 6dcacf73222002da377340a3771d81526322e55ffc5ee2bfc012ce9c0e6ac7d2
  at: 2026-09-30T18:18:49.400Z
  by: owner
  signature: JnYD8cmDI+uzY7ypnIFKv8Yhg1AS5SGLrGDCPXI+0KrVh6Vin87plwha0ioBc0SILjnkKrhtHTveFTUnQCPKBg==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Find something in my repertoire

_Works now · approved 2026-09-30T18:18:49.400Z by owner (signed)_

## Goal

See everything you play, grouped the way you think about it, find it by any name, and open the one you mean without losing your place.

## Starts when

The musician opens Repertoire (My repertoire by default, on the instrument being practised) or comes back to it from a piece.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Opens Repertoire, or picks one of the three peer views: My repertoire, Pathways or Practice list, and one instrument (or All).
   - Shows: Works grouped by dastgāh (Persian) or study source (others); unclassified works under "No dastgāh yet"; each work once, parts nested.
   - Changes: Nothing but the URL: view, instrument, query and filters live there, and Today's session instrument is never changed.

2. **Practice Compass** Groups each classifying value by the shared vocabulary: a term reference, or text that is exactly one curated spelling of a term, joins that term; composites and unknown spellings stay the owner's own text.
   - Shows: «Shur» and «شور» in one group labelled with the term's name; the owner's text is never rewritten.

3. **The musician** Searches (title, gusheh, dastgāh/form/maestro in any spelling, study source, archive aliases) and narrows by Dastgāh, Form or Composer, or regroups by form, composer or source.
   - Shows: Facets built only from the works actually owned; a matching part shows its parent once; "No works match" with Clear filters when nothing does.

4. **The musician** Or chooses Practice list and filters by the same search, status, type or a quick chip.
   - Shows: Every practice item in priority order, parts included, under Practice list's own eligibility.

5. **The musician** Opens an item, then comes back by its back link or browser back.
   - Shows: The same view, instrument, query and filters as before.

## Ends with

The musician found the piece they meant and is back where they were, with nothing stored differently.

## Variations

- **No dastgāh yet** — Works with Persian identity but no dastgāh sit in an explicit 'No dastgāh yet' group at the end. _(Works now)_
- **Technique stays out** — Drills and generic exercises are not works — they live in the Practice list only. _(Works now)_

## Rules

- 'My repertoire' is a derived lens, never a parallel database of pieces.
- Links never duplicate an item.
- Study sources stay simple: instrument, one clear name, kind, status, note.

## Involves

- The musician

