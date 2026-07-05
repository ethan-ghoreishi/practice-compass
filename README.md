# Practice Compass

A calm, **local‑first** music practice tracker for a serious adult learner.
Built around self‑regulated learning — *plan → focus → monitor → evaluate → adapt* —
rather than raw repetition time.

> **One item. One mode. One focus. One result. One next action.**

It works out of the box for **Persian Setar**, **Persian Tar** and **Classical Guitar**,
and for any future instrument, piece, étude, technical drill, lesson, improvisation
prompt or repertoire item.

There is no backend, no account, no cloud, no audio analysis and no AI judgement.
**IndexedDB on the device is the source of truth** (app data + attached files), and a
single backup file (JSON data + embedded files) exports/imports everything. It's built
**iPhone-first** and served privately from a home NAS (see *Deploy*).

---

## What it does

- **Gives you a path to trust — for every instrument.** Editable **Pathways** you follow
  at your own pace, always seeing where you stand and what's ahead. No rush, no deadlines,
  no competition. Three are seeded and fully editable: **Classical Guitar Shed** (1A from
  the official syllabus with two guided routines; Levels 1–3 from the real course),
  **Setar · Radif & Repertoire** (a dastgāh/āvāz/gusheh map, teacher-driven and reorderable),
  and **Tar · Honarestān method** (the two-book conservatory curriculum, as taught on
  Khonyagar.com). Create your own, rename, reorder, add or delete anything.
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
- **Holds everything for a piece.** Attach your teacher's PDFs, photos of scores, or
  recordings to any item, and keep free-form notes — so the app is the single source for
  your practice, not a notebook full of glued printouts.
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

## Deploy (private, on the NAS)

Like [hess](https://github.com/ethan-ghoreishi/hess), this app holds personal data (your
practice history and your teacher's files), so it is **not** published to public GitHub
Pages. It's served privately from the Synology NAS Web Station share over Tailscale:

```bash
npm run deploy   # builds and rsyncs dist/ to /Volumes/web/practice-compass/
```

Then open it on your phone (Tailscale on) at
`https://ds220plus.taild1d1f7.ts.net/practice-compass/` and **Add to Home Screen**.
GitHub Actions runs lint + tests + build on every push; deployment stays a local one-liner.
The prod base path is `/practice-compass/` (override with `PC_BASE=/`).

---

## Tech stack

| Concern        | Choice                                             |
| -------------- | -------------------------------------------------- |
| UI             | React 19 + TypeScript + Vite                       |
| State          | Zustand, persisted to **IndexedDB (Dexie)**        |
| Files          | Attachment blobs in IndexedDB (Dexie table)        |
| Routing        | React Router (hash router)                         |
| PWA / offline  | `vite-plugin-pwa` (Workbox)                        |
| Styling        | Hand‑written CSS design system (no framework)      |
| Tests          | Vitest (pure domain logic)                         |
| Host           | Private — Synology NAS (Web Station) over Tailscale |

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

## Pathways

Pathways are **structure, not gamification** — they show your honest position on a route to
mastery so you can stop deciding "what next" and just practise.

- **Editable data, one per instrument.** Pathways live in the store with full CRUD; seeds
  ([`src/domain/pathwaySeed.ts`](src/domain/pathwaySeed.ts)) are honest starting points you
  can rename, reorder, extend or delete. Pure derivations + tests are in
  [`pathways.ts`](src/domain/pathways.ts).
- **Pathway → Stages → Steps (+ guided Routines).** Each step has a strand (mezrāb, radif,
  chords, sight-reading, piece…), notes and an optional target tempo, and its own status.
- Your **current stage** is derived automatically; Today lists every pathway with its
  current stage and progress.
- **Guided routines** ([`RoutineRunner`](src/pages/RoutineRunner.tsx)) walk you through a
  session segment by segment, hands-free.
- Practising a step creates/links a normal practice item, so pathways plug straight into
  the recommendation engine, stats and teacher report.

## Review scheduling

Reviews use a **spaced-repetition engine** (SM-2 — the algorithm behind Anki), adapted to
music in [`scheduling.ts`](src/domain/scheduling.ts). Each item tracks reps, an ease factor
and its interval: every time a piece/gushe holds up, the gap before you revisit it grows;
when it slips, the gap resets so you relearn it. Importance and difficulty pull material a
little sooner. It returns a one-line rationale. Per item you can override the mode:

- **Auto** — the engine decides (default).
- **Every N days** — a fixed cadence you choose.
- **Manual** — you set each date yourself.

Item statuses use plain language — *Just started · Shaky · Fixing problems · Coming
together · Solid · Performance-ready · Keeping fresh · Resting* — with a one-line
description in the picker.

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

- CSV export
- Calendar reminders
- Teacher‑sharing PDF
- Seed Levels 1B–5 of CGS in full detail from each sub-level's syllabus

Done: ✅ PWA offline install · ✅ Editable, per-instrument pathways (Guitar / Setar / Tar) ·
✅ SM-2 spaced-repetition review with manual override · ✅ IndexedDB source of truth ·
✅ File & note attachments per item (single source of truth) · ✅ Full backup with files ·
✅ Private NAS deploy + CI.

See [`docs/product-spec.md`](docs/product-spec.md) for the product thinking, and
[`CLAUDE.md`](CLAUDE.md) for the rules that keep this tool from bloating.

---

## License

MIT.
