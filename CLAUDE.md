# CLAUDE.md — development rules for Practice Compass

This file is the contract for anyone (human or AI) extending this app. Read it before
adding features. The whole value of the tool comes from what it *refuses* to do.

## The one rule above all

Preserve the core loop: **one item · one mode · one focus · one result · one next action.**
If a change blurs that loop or adds a second thing to think about per step, it's wrong —
even if it's "useful".

## Keep admin overhead low

- Starting a block must stay **under 30 seconds**; closing one **under 60 seconds**.
  Any new field in those flows must be optional and have a smart default.
- Never add a required field beyond an item title.
- Rich metadata stays progressive: hidden until the user asks for it.

## Prioritise the quick‑start flow

- Smart defaults are a feature, not a convenience. Status → mode, item → focus,
  10‑minute duration. If you add a concept, give it a sensible default too.
- Inline item creation must keep working from the Start screen and from recommendations.

## Hard "do nots" (require explicit user instruction to change)

- ❌ **No gamification** — no streaks, points, badges, XP, leaderboards, confetti,
  or fake "mastery %". Progress is shown as honest status + result, nothing else.
- ❌ **No backend / auth / cloud sync** in v1. The app is local‑first; data lives in
  `localStorage` and moves via JSON export/import only.
- ❌ **No AI or audio analysis** in v1 — no tone scoring, pitch detection, posture
  tracking, or "AI teacher" judgement. The app organises; it does not grade.
- ❌ **No guilt‑driven copy.** Insights are neutral observations, never nags.

## The Pathway is a trust anchor — keep it that way

Pathways exist so the user can **stop deciding what's next and just practise**, at their
own pace, on a route they trust. Protect that:

- **Structure, not gamification.** Show honest position (steps done / current / ahead).
  Never add streaks, scores, deadlines, "you're behind" nudges, or a fabricated mastery %.
- **Pathways are editable data, one per instrument.** They live in the store
  (`pathways`, `pathwayStages`, `pathwaySteps`, `pathwayRoutines`) with full CRUD — the
  user can rename, reorder, add, and delete anything. Don't hardcode pathways back into code.
- **Seeds are honest starting points, never fabricated authority.** Guitar = CGS (1A from
  the real syllabus; 1B–3F from the real course structure). Setar = a radif/dastgāh map
  (teacher-driven, explicitly "reorder me"). Tar = the Honarestān two-book method. Keep
  Persian content grounded in real pedagogy and clearly editable; don't invent specific
  lesson names as if canonical. Default seed step ids are stable (used by the v2→v3 migration).
- **Calm, self-paced copy.** "Move on when it feels right, not by a deadline" is the voice.

## Review scheduling stays explainable

`planNextReview` (in `scheduling.ts`) blends status (mastery), importance, difficulty and
the last result into one interval, and supports per-item overrides (Auto / fixed cadence /
Manual). Keep it deterministic and explainable (it returns a `rationale`); don't turn it
into an opaque model. Item status labels are plain-language for the user — keep the enum
keys stable and only change the display labels in `labels.ts`.

## Architecture rules

- **Domain logic stays pure.** Everything in `src/domain/` must be free of React and
  side effects, and must take an explicit `now: Date` instead of calling `new Date()`
  internally. This keeps it deterministic and unit‑testable.
- **The recommendation engine stays deterministic and explainable.** Every recommended
  card must produce a one‑sentence reason from the same numbers that ranked it. No
  hidden heuristics, no models.
- **The store is the only place that mutates data.** UI components call store actions;
  they never touch `localStorage` or rebuild domain objects by hand.
- **One file per route** under `src/pages/`. Shared UI primitives live in
  `src/components/`. Pure helpers go in their own non‑component modules (this also keeps
  React Fast Refresh and the `react-refresh` lint rule happy).

## When you add a feature

1. Add/extend the **types** in `src/domain/types.ts` and bump `SCHEMA_VERSION` if the
   persisted shape changes (add a migration in the store's `persist` config).
2. Put the logic in a **pure domain module** with **tests** (`*.test.ts`). The required
   coverage — priority scoring, recommendation selection, review scheduling, stat
   updates, saturation — must stay green.
3. Only then wire up the UI.
4. Run `npm run build`, `npm run lint`, `npm test` and fix everything before finishing.

## Tests are not optional

`npm test` must pass. The suite guards the behaviour that makes the recommendations
trustworthy; if you change the scoring formula or scheduling intervals, update the tests
in the same change and make sure they still describe correct behaviour.

## Roadmap items are allowed (they were designed for)

Audio recording attachment, PWA offline install, CSV export, calendar reminders, a
simple audio note per block, teacher‑sharing PDF. These extend the tool without breaking
the philosophy. Anything that contradicts the "do nots" above needs an explicit decision
from the user, recorded here.
