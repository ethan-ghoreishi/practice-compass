# Practice Compass

A calm, **local‑first** music practice tracker for a serious adult learner.
Built around self‑regulated learning — *plan → focus → monitor → evaluate → adapt* —
rather than raw repetition time.

> **One item. One mode. One focus. One result. One next action.**

It works out of the box for **Persian Setar**, **Persian Tar** and **Classical Guitar**,
and for any future instrument, piece, étude, technical drill, lesson, improvisation
prompt or repertoire item.

There is no backend, no account, no cloud, no audio analysis and no AI judgement.
Everything lives in your browser's `localStorage`, and you can export/import a JSON
backup at any time.

---

## What it does

- **Gives you a path to trust.** A built-in **Pathway** follows the Classical Guitar Shed
  "Woodshed" program — Levels 1–5, sub-levels (1A, 1B…), each a set of steps. You always
  see exactly where you stand and what's ahead, and you move on at your own pace. No rush,
  no deadlines, no competition. Level 1A is seeded in full from the official syllabus
  (with its two 20-minute guided routines); Levels 1–3 (18 sub-levels) are mapped from the
  real course structure.
- **Walks you through a session.** Guided routines run as a hands-free, segment-by-segment
  timer — just follow along.
- **Tells you what to practise next.** A deterministic recommendation engine surfaces
  three explained cards: *Best Next Focus*, *Quick Win*, and *Maintenance*.
- **Makes starting trivial.** A quick‑start flow gets you practising in under 30 seconds
  with smart defaults (status → mode, item → focus, 10‑minute default).
- **Keeps the practice screen quiet.** Just the item, the mode, the focus and a timer.
- **Closes a block in under a minute.** One result, one observation, one next action,
  and gentle suggestions for the next review date and status change.
- **Notices patterns.** The Insights screen offers calm, neutral observations
  (balance, neglect, saturation, repeated "same" results, cross‑instrument bottlenecks…).
- **Prepares your lessons.** A copyable Teacher Report summarises what you worked on,
  what improved, what's still fragile and what to ask.

---

## Running it

Requires Node 20+ (developed on Node 26).

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build into dist/
npm run preview    # preview the production build
npm run lint       # eslint
npm test           # run the Vitest suite once
npm run test:watch # watch mode
```

The app is a static single‑page app — `npm run build` produces a `dist/` folder you
can host anywhere (it uses hash routing, so it works from any path or even `file://`).

---

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| UI             | React 19 + TypeScript + Vite            |
| State          | Zustand with `persist` → `localStorage` |
| Routing        | React Router (hash router)              |
| Styling        | Hand‑written CSS design system (no framework) |
| Tests          | Vitest (pure domain logic)              |

The codebase is deliberately split into a **pure domain layer** (no React, fully
unit‑tested) and a thin UI layer on top.

```
src/
  domain/      pure logic: types, scoring, recommend, scheduling, insights, report, seed, io
  store/       Zustand store, persistence, lookups, session helpers
  components/   shared UI primitives, layout, icons
  pages/        one file per route
  styles/       global.css design system
```

---

## Data model

Five core objects (see [`src/domain/types.ts`](src/domain/types.ts)):

- **Instrument** — Setar, Tar, Classical Guitar, or anything you add.
- **Material** — a source/collection an item belongs to (a radif, a course, a set of
  études). `sourceType`, `parentTitle`, `section`, `status`, etc.
- **PracticeItem** — the heart of the app. A phrase, bar, exercise, technique, full
  piece, improvisation prompt or body/tension issue. Carries `status`, `importance`,
  `difficulty`, `currentProblem`, `primaryFocus`, `teacherQuestion`, review/stat
  fields, and optional nested **Persian** and **Classical‑guitar** metadata.
- **PracticeBlock** — one focused unit of practice (5–20 min): `mode`, `focus`,
  `constraint`, `result`, `observation`, `nextAction`.
- **Review** — a scheduled spaced‑review for an item (`dueDate`, `reviewType`).

Item status ladder: `new → fragile → repairing → usable → integrated → performable`,
plus `maintenance` and `dormant` for resting material.

Everything is plain JSON and round‑trips cleanly through export/import. The persisted
shape carries a `schemaVersion` for future migrations.

---

## Recommendation logic

For each item a **priority score** is computed deterministically
(see [`src/domain/scoring.ts`](src/domain/scoring.ts)):

```
priority = importance*2 + difficulty + fragility + overdue
         + teacherRelevance + neglected − saturationPenalty
```

| Component         | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| `fragility`       | by status (fragile/repairing = 5 … performable = 0)            |
| `overdue`         | how many days past `nextReviewDate` (0–5)                      |
| `teacherRelevance`| +3 if an open teacher question exists                          |
| `neglected`       | days since last touched, banded 0–4                            |
| `saturationPenalty`| −3 if drilled 3×/48h **or** last 3 results all "same"         |

**Three cards** are then chosen (see [`src/domain/recommend.ts`](src/domain/recommend.ts)):

1. **Best Next Focus** — highest score, avoiding saturated items unless none remain.
2. **Quick Win** — difficulty ≤ 3, importance ≥ 3, status usable/fragile/repairing, not saturated.
3. **Maintenance** — integrated/performable/maintenance/dormant item that is due or neglected.

Each card explains itself in one neutral sentence, e.g.
*"Top priority — important, fragile, and 2d overdue."*

**Review scheduling** when a block closes (see [`src/domain/scheduling.ts`](src/domain/scheduling.ts)):

| Result             | Next review        |
| ------------------ | ------------------ |
| worse / same       | tomorrow (same ⇒ "try a new strategy") |
| slightly better    | +2 days            |
| stable alone       | +4 days            |
| stable in context  | +7 days            |
| performable        | +21 days           |
| maintenance work   | +30 days           |

Status changes are **suggested, never forced** (e.g. *stable alone* on a fragile item
suggests promotion to *usable*).

---

## The Pathway (curriculum)

The pathway is **structure, not gamification** — it shows your honest position on a fixed
route to mastery so you can stop deciding "what next" and just practise.

- Content lives in code ([`src/domain/curriculum.ts`](src/domain/curriculum.ts)); only your
  *progress* is persisted, so the path can be improved without data migrations.
- **Levels → Stages (sub-levels) → Steps.** Each step has a strand (warm-up, right hand,
  chords, rhythm, sight-reading, piece…), guidance notes and an optional target tempo.
- Your **current stage** is derived automatically (the first stage that isn't complete);
  Today shows it with a "practise the next step" button.
- **Guided routines** ([`RoutineRunner`](src/pages/RoutineRunner.tsx)) walk you through a
  20-minute session segment by segment.
- Practising a step creates/links a normal practice item, so the pathway plugs straight
  into the recommendation engine, stats and teacher report.
- Outline stages (everything past 1A) seed one step per real practice area; add your own
  steps from each CGS sub-level's materials as you reach it. Pure helpers and tests live in
  [`curriculumProgress.ts`](src/domain/curriculumProgress.ts).

## Install as an app (PWA)

Practice Compass is an installable, offline-capable Progressive Web App (via
`vite-plugin-pwa`). After `npm run build && npm run preview` (or any host), open it on
your phone and choose **Add to Home Screen** — it launches full-screen, works offline, and
keeps all data on the device. Icons are generated from [`public/icon.svg`](public/icon.svg)
with `npm run gen:icons`.

## Design principles

Calm, focused, serious, elegant, fast, uncluttered — encouraging but never cheesy.

- No gamification, streaks, fake mastery %, leaderboards or guilt.
- One muted accent, soft hierarchy, generous spacing, serif headings.
- Mobile‑first, with a bottom tab bar and a one‑tap **Start** button.
- The practice screen hides all chrome to protect attention.
- Insights are neutral and useful, never nagging.

---

## Future roadmap

- Audio recording attachment per block
- CSV export
- Calendar reminders
- Simple audio note per practice block
- Teacher‑sharing PDF
- Seed Levels 1B–5 in full detail from each sub-level's syllabus

Done: ✅ PWA offline install · ✅ Trustable curriculum / pathway.

See [`docs/product-spec.md`](docs/product-spec.md) for the product thinking, and
[`CLAUDE.md`](CLAUDE.md) for the rules that keep this tool from bloating.

---

## License

MIT.
