---
id: see-practice-patterns
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: See how practice is actually going
  journey: Looking back
  order: 9
truth:
  goal: Get a calm, neutral read on the last week or month across everything you
    play.
  startsWhen: The musician taps 'Overview' on Today, or opens More → Insights.
  needs: []
  steps:
    - actor: The musician
      action: Taps 'Overview' in the instrument switcher.
      shows: Each instrument with its next suggestion and next class, one insight of
        the day, and a balance bar for the last 7 days.
      changes: The session instrument is set to 'all' — a deliberate, secondary
        choice, never the default.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:14.788Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps an instrument to drop back into a real session for it.
      shows: Today, scoped to that instrument again.
      changes: The session instrument is set.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:14.788Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Opens Insights and switches the window between 7 and 30 days.
      shows: Neutral observations generated from the logged blocks — patterns, not a
        scoreboard, and an honest empty state when there is not enough history.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:14.788Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: The musician knows where their time actually went, with no streaks,
    scores or judgement attached.
  variations: []
  rules:
    - "No gamification: no streaks, points, badges or fabricated mastery
      percentages."
    - Insights are neutral observations, never nags.
    - Future-dated blocks never leak into a window that looks backwards.
  involves:
    - The musician
mechanics:
  touchpoints:
    - src/pages/Insights.tsx
    - src/pages/Today.tsx
    - src/domain/insights.ts
    - src/domain/io.ts
  routes:
    - /insights
    - /
    - /more
  components:
    - Insights
    - Today
    - More
  entities:
    - PracticeBlock
    - PracticeItem
    - Instrument
  tests:
    - file: src/domain/io.test.ts
      steps:
        - 3
approval:
  hash: d1952a7f00f8a54077b28d8a52507c21f54c07712aed4e99bc01e4d17d9c9946
  at: 2026-08-28T13:30:18.074Z
  by: Ethan
  signature: BXT5Zg+J0mdKerwO8vDevReJbi/akhvW0/z6SiulMWrWrwEWkrub33ThBE3FR65RxWxl89CURY7c5ouhr2W9BQ==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician
