# Practice Compass

A calm, **local‑first** music practice tracker for a serious adult learner.
Built around self‑regulated learning — *plan → focus → monitor → evaluate → adapt* —
rather than raw repetition time.

> **One item. One mode. One focus. One result. One next action.**

It works out of the box for **Persian Setar**, **Persian Tar** and **Classical Guitar**,
and for any future instrument, piece, étude, technical drill, lesson, improvisation
prompt or repertoire item.

There is no backend, no account, no audio analysis and no AI judgement.
**IndexedDB on the device is the source of truth** (app data + attached files); every
install works fully offline. Devices stay in sync through a GitHub repo you own
(whole snapshots, newest wins — see *Using it*), and a single backup file (JSON data +
embedded files) exports/imports everything as a fallback. Hosted free on GitHub Pages;
daily home is the **MacBook**, with the **iPhone** as companion.

---

## What it does

- **Opens on YOUR session.** Today starts with "which instrument am I practising now?" —
  pick Setar and everything on screen is Setar's: one clear *Practise now* card (with a
  plain-language reason), that instrument's class work, due reviews, and pathway position.
  Other instruments never leak in; a cross-instrument Overview is one deliberate tap away.
- **Gives you a path to trust — for every instrument.** Editable **Pathways** you follow
  at your own pace, always seeing where you stand and what's ahead. No rush, no deadlines,
  no competition. Three are seeded and fully editable: **Classical Guitar Shed** (1A from
  the official syllabus with two guided routines; Levels 1–3 from the real course),
  **Setar · Radif & Repertoire** (a dastgāh/āvāz/gusheh map, teacher-driven and reorderable),
  and **Tar · Honarestān method** (the two-book conservatory curriculum, as taught on
  Khonyagar.com). Create your own; rename/reorder sections and stages; pin the stage
  you're actually in (teacher-led work doesn't move linearly).
- **Walks you through a session.** Guided routines run as a hands-free, segment-by-segment
  timer — clearly labelled as a warm-up, not logged practice.
- **Tells you what to practise next.** A deterministic recommendation engine surfaces
  three explained cards: *Best Next Focus*, *Quick Win*, and *Maintenance*.
- **Maps the whole Persian repertoire.** Repertoire → *Persian pieces* groups every item
  by dastgāh/āvāz — radif gushehs and composed maestro pieces (a chahār-mezrāb of Sabā in
  Afshāri, a pish-darāmad of Darvish Khān in Māhur) side by side, with form and composer
  on each row. Spelling variants fold into one group; your own text is never rewritten.
- **Creates items in one step.** Quick Add stays title-only; the full form sets type,
  source (creatable inline), pathway stage, focus, importance, difficulty and Persian
  identity together — no create-then-edit round trips.
- **Stays in sync across devices.** MacBook and iPhone share the same data through a
  GitHub repo you own — free, automatic, offline-tolerant, with honest newest-wins
  semantics and explicit conflict choices.
- **Keeps études concrete.** Break a piece into parts (bars, phrases, one technical
  problem); the piece page always names *one* part to practise now, for 10 minutes, and
  suggests a smaller unit or new strategy when things stall — never quotas.
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

## Using it (MacBook + iPhone)

The app lives at **https://ethan-ghoreishi.github.io/practice-compass/** — published
automatically from `main` by GitHub Actions (`deploy.yml`). Install it once per device
and it runs as its own offline app; no terminal, no dev server, no VPN:

- **Mac (Safari):** open the URL → File → **Add to Dock**. (Chrome: install icon in the
  address bar.) It opens as a dock app, full-screen, works with no internet.
- **iPhone (Safari):** open the URL → Share → **Add to Home Screen**.

Being a PWA, each install keeps working entirely offline; an internet connection is only
used to fetch app updates and to sync data.

### Sync between devices (free, via GitHub)

Data syncs through a small private GitHub repo you own
(`ethan-ghoreishi/practice-compass-data`) — no server, no cost:

1. Create a **fine-grained personal access token**: GitHub → Settings → Developer
   settings → Fine-grained tokens → Generate new. Repository access: **only**
   `practice-compass-data`. Permissions → **Contents: Read and write**.
2. In the app on each device: **Settings → Sync (GitHub)** → paste the repo and token →
   **Connect & sync**.
3. That's it. It syncs when the app opens and shortly after changes (whole snapshots,
   newest wins). If both devices changed since the last sync, the app shows both
   timestamps and asks which copy to keep — it never merges silently.

Manual **Export/Import backup** (one JSON file with data + attachments) remains in
Settings as a belt-and-braces fallback.

## Developing

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

Pushing to `main` deploys to GitHub Pages (CI runs lint + tests + build first). The prod
base path is `/practice-compass/` (override with `PC_BASE=/`).
`scripts/deploy-nas.sh` optionally mirrors the same build onto a locally mounted NAS
share for a LAN-only copy — handy, never required.

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
| Host           | GitHub Pages (auto-deploy from `main`)             |
| Sync           | User-owned GitHub repo via the Contents API        |

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

## Repertoire: pathways and items are one thing

The **item is the only unit of work**; a pathway is a *view over your items*, not a
separate to-do list. The Repertoire tab shows the same items two ways — by pathway, or as
a filterable list.

- An item can be **placed in a pathway stage** (`stageId`); stage progress is derived
  from the mastery status of the items in it. Nothing to tick off separately.
- Each stage lays your items over a **reference catalog** of known gushes / lesson areas
  ([`pathwaySeed.ts`](src/domain/pathwaySeed.ts)) — one tap turns a suggestion into a real
  item, pre-filled with type, focus and conscious-practice guidance. Pure derivations +
  tests in [`pathways.ts`](src/domain/pathways.ts).
- **Conscious practice**: dastgāh stages carry character intros (what to listen for), each
  gushe carries a standing prompt (find the shāhed, the ist, the forud), and the practice
  screen keeps "About this piece" one tap away with the question *what is going on here?*
- **Guided routines** ([`RoutineRunner`](src/pages/RoutineRunner.tsx)) walk you through a
  session segment by segment, hands-free.
- Pathways and stages are fully editable; deleting them never deletes your items.

## Lessons (classes with a teacher)

Per-instrument lesson log matching the real workflow: record the class → rewatch →
type up notes (**Farsi welcome**: every text field is direction-aware) → create or link
the concrete practice items right on the lesson card → they appear in that instrument's
Today. Each lesson lists what was worked on (a link — unlinking never deletes the item),
can hold its own attachments (hand-out PDFs, photos; class videos stay in your session
folders), and any item can be flagged *for next class*, which gives it a priority boost
that climbs as **that instrument's** class approaches. Works for every instrument, ready
for future Tar / Guitar teachers.

## Review scheduling

Reviews use a **spaced-repetition engine** (SM-2 — the algorithm behind Anki), adapted to
music in [`scheduling.ts`](src/domain/scheduling.ts). Each item tracks reps, an ease factor
and its interval: every time a piece/gushe holds up, the gap before you revisit it grows;
when it slips, the gap resets so you relearn it. Importance and difficulty pull material a
little sooner. It returns a one-line rationale. Per item you can override the mode:

- **Auto** — the engine decides (default).
- **Every N days** — a fixed cadence you choose.
- **Manual** — you set each date yourself.

Due reviews offer three honest actions: **practise** (the only thing that completes a
review), **not now** (hidden until tomorrow, no schedule change), and **+2d** (genuinely
moves the date). Item statuses use plain language — *Not practised yet · Shaky · Fixing
problems · Coming together · Solid · Performance-ready · Keeping fresh · Resting* — with
a one-line description in the picker.

## Devices, sync & handoff

Each device keeps its **own local copy** (IndexedDB) and works fully offline. With
**Sync (GitHub)** connected in Settings, devices exchange whole snapshots through your
data repo: newest copy wins, per-device names in the commit log, and an explicit
two-button choice when both sides changed. Attachments upload once each (immutable);
only new or deleted files transfer. Without sync, moving data is a manual backup
export → import, with a warning before an older backup overwrites newer local data.

## Install as an app (PWA)

Practice Compass is an installable, offline-capable Progressive Web App (via
`vite-plugin-pwa`) — see **Using it** above for the per-device steps. Icons are
generated from [`public/icon.svg`](public/icon.svg) with `npm run gen:icons`.

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

Done: ✅ PWA offline install · ✅ Pathways unified with items (catalog + one-tap add +
undo) · ✅ SM-2 spaced-repetition review with manual override, snooze & not-now ·
✅ IndexedDB source of truth · ✅ Attachments on items *and* lessons · ✅ Full backup with
files + device handoff warnings · ✅ Lesson↔item linking with per-instrument class
deadlines (Farsi-aware) · ✅ Per-instrument session workspace · ✅ Sections, stage pinning
& étude parts · ✅ Persian repertoire view (dastgāh × form × composer) · ✅ One-step item
creation · ✅ GitHub Pages hosting + device sync via GitHub · ✅ CI.

See [`docs/product-spec.md`](docs/product-spec.md) for the product thinking, and
[`CLAUDE.md`](CLAUDE.md) for the rules that keep this tool from bloating.

---

## License

MIT.
