---
id: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
contractId: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
contractHash: 4c3c3d123ffae5f03783fec39ddcaaa2b4a181c3789a4840ba3f22ab06f551bc
createdAt: 2026-09-23T18:37:34.045Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/36
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260923-let-an-existing-install-add-a-missing-sh-7e4b

## Intent revisions — supersedes the original request only where it conflicts

- **2026-09-23T18:08:01.468Z** _(Sealed review finding (family: default-pathway-instrument-resolution): the reused Tar name rule reads a Persian-named Setar («سه‌تار») as Tar, so Khonyagar and Honarestān are offered and added on the Setar instrument. migrateToV3 carries the same rule for pre-v3 databases. The fix makes a name containing «سه» never Tar, in the one shared rule that both callers use. Scope widens by migrations.ts only.)_

  Resolving a default pathway's instrument must never read a Persian-named Setar («سه‌تار» or «سه تار») as Tar. seedInstrumentIds excludes any name containing «سه» from Tar, and migrateToV3 resolves through that same shared rule instead of its own copy. Everything else in the approved plan stands.

- **2026-09-23T18:36:28.837Z** _(Sibling of the sealed finding (family: default-pathway-instrument-resolution): Persian «گیتار» also contains «تار», and the Guitar rule does not recognise it, so with [«سه‌تار», «گیتار»] and no Tar the Tar courses are offered, added and pre-v3-seeded on the Guitar instrument. The fix is in the one shared classification rule: «گیتار» is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. No scope change.)_

  Resolving a default pathway's instrument must never read a Persian-named Setar («سه‌تار», «سه تار») or Guitar («گیتار») as Tar. seedInstrumentIds is one classification: «گیتار» is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. migrateToV3 resolves through that same shared rule instead of its own copy. Everything else in the approved plan stands.

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> The newly shipped tar-khonyagar pathway is present on fresh databases, but existing users cannot add it: reseedDefaultPathways() already safely adds only entirely missing default pathways, yet Repertoire.tsx renders “Restore default pathways” only when pathways.length === 0. Plan the smallest most optimal coherent fix so an existing installation can explicitly add missing shipped default pathways without overwriting, recreating or changing any existing pathway/stage/routine or user data. Prefer reusing the existing reseed behaviour and exposing the action only when useful. Include a regression test covering an existing database with other pathways but a newly shipped default pathway missing.

## Why

tar-khonyagar shipped in the seed, but an existing database only gains seeded pathways through reseedDefaultPathways, and Repertoire → Pathways shows its button only when the (instrument-filtered) pathway list is EMPTY. Every real install already has pathways, so the new course is unreachable except by a demo reset that destroys data. docs/khonyagar-course.md §5 even claims 'restore default pathways on Repertoire brings it into an existing database', which is false today. The fix reuses the reseed decision (whole missing pathways, keyed by their deterministic ids) but moves it into a pure, Node-testable domain function, because useStore.ts cannot be imported in the Node test environment (Dexie). It offers each missing pathway as its own named choice rather than one bulk button, because a default pathway the owner deliberately DELETED is absent in exactly the same way as a newly shipped one — the same reason offeredCourseLevels/planCourseLevels offer deleted stages in a list and add only what is chosen.

## Today

Repertoire → Pathways renders 'Restore default pathways' only when the filtered pathway list is empty. reseedDefaultPathways (useStore.ts) resolves the guitar/setar/tar instrument ids by name, runs seedPathways, and appends every seeded pathway whose id is absent together with its stages and placed routines. On an existing install that already has setar-radif, tar-honarestan and cgs, the newly shipped tar-khonyagar is never offered. The action also always calls set() even when it adds nothing (bumping rev and scheduling a needless sync), and appending the routines of a re-added default whose pathway the owner once deleted would duplicate the routine ids deletePathway kept (detached) — validateDB does not refuse duplicate routine ids.

## Instead

Two pure functions in src/domain/pathwaySeed.ts carry the decision. offeredDefaultPathways(db, now) returns the shipped default pathways whose deterministic id is absent from db.pathways AND whose instrument resolves on this device (same name-matching rule the store uses today, moved beside seedPathways); a default whose instrument does not resolve is not offered, so the app never creates a new unscoped ('' instrument) pathway. planDefaultPathways(db, pathwayIds, now) returns the next pathways/pathwayStages/pathwayRoutines: every existing element kept as a reference-identical prefix, plus exactly the CHOSEN offered pathways with their seeded stages and placed routines, skipping any seeded stage or routine whose id already exists anywhere; ids that are not offered (already present, never shipped) are ignored; when nothing is added it returns the SAME arrays. reseedDefaultPathways becomes (pathwayIds: string[]) => void, applies the plan in one set(), and returns without writing when the plan is a no-op. Repertoire → Pathways drops the empty-only 'Restore default pathways' button and instead renders, beside 'New pathway', one button per offered default that passes the current instrument filter (pathwaysForInstrumentFilter, so what is shown and what is added are the same set): fixed English label 'Add default pathway: ' followed by the pathway name in its own <span dir="auto">, no dir on the button. Tapping one adds that pathway only; its button then disappears. Nothing is shown when nothing is offered.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- A default pathway the owner deleted is offered again as its own named button (the offeredCourseLevels precedent: a deleted record reappears in a LIST, never in the data). Recording a dismissal would need persisted state and a schema change, which is out of scope.
- Seeded routines keep the shape seedPathways gives them today (no instrumentId stamped); a fresh seed uses the same output, so an added pathway matches a fresh install.
- An owner who renamed their Tar/Setar/Guitar instrument to a name the existing matching rule does not recognise will not be offered that instrument's default; previously the empty-state restore would have created it with an empty instrument id, which is worse.
- The per-pathway buttons replace the empty-state 'Restore default pathways' button; on an empty 'All' view that means one button per shipped pathway (four today).

**Possible conflicts**

- AGENTS.md's 'BUYING LEVELS 4A-5F LATER' paragraph says reseedDefaultPathways and its Repertoire button 'ARE NOT CHANGED'; its substance (only whole missing pathways, never stages into an existing one) still holds, but the sentence must be rewritten.
- src/components/direction.test.ts keeps an exact GROUP_SITE_INVENTORY (and value-isolate ledgers) of every dir="auto" site in Repertoire.tsx; the new name isolate must be recorded there in source order or the suite fails.
- Comments in src/domain/courseSeed.ts and src/pages/PathwayDetail.tsx refer to reseedDefaultPathways as not additive to existing pathways; they remain true and are deliberately left alone.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "The newly shipped tar-khonyagar pathway is present on fresh databases, but existing users cannot add it: reseedDefaultPathways() already safely adds only entirely missing default pathways, yet Repertoire.tsx renders “Restore default pathways” only when pathways.length === 0. Plan the smallest most optimal coherent fix so an existing installation can explicitly add missing shipped default pathways without overwriting, recreating or changing any existing pathway/stage/routine or user data. Prefer reusing the existing reseed behaviour and exposing the action only when useful. Include a regression test covering an existing database with other pathways but a newly shipped default pathway missing.",
  "builder": "claude",
  "summary": "Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course",
  "rationale": "tar-khonyagar shipped in the seed, but an existing database only gains seeded pathways through reseedDefaultPathways, and Repertoire → Pathways shows its button only when the (instrument-filtered) pathway list is EMPTY. Every real install already has pathways, so the new course is unreachable except by a demo reset that destroys data. docs/khonyagar-course.md §5 even claims 'restore default pathways on Repertoire brings it into an existing database', which is false today. The fix reuses the reseed decision (whole missing pathways, keyed by their deterministic ids) but moves it into a pure, Node-testable domain function, because useStore.ts cannot be imported in the Node test environment (Dexie). It offers each missing pathway as its own named choice rather than one bulk button, because a default pathway the owner deliberately DELETED is absent in exactly the same way as a newly shipped one — the same reason offeredCourseLevels/planCourseLevels offer deleted stages in a list and add only what is chosen.",
  "kind": "existing-flow",
  "flowId": "work-a-pathway-stage",
  "currentBehaviour": "Repertoire → Pathways renders 'Restore default pathways' only when the filtered pathway list is empty. reseedDefaultPathways (useStore.ts) resolves the guitar/setar/tar instrument ids by name, runs seedPathways, and appends every seeded pathway whose id is absent together with its stages and placed routines. On an existing install that already has setar-radif, tar-honarestan and cgs, the newly shipped tar-khonyagar is never offered. The action also always calls set() even when it adds nothing (bumping rev and scheduling a needless sync), and appending the routines of a re-added default whose pathway the owner once deleted would duplicate the routine ids deletePathway kept (detached) — validateDB does not refuse duplicate routine ids.",
  "desiredBehaviour": "Two pure functions in src/domain/pathwaySeed.ts carry the decision. offeredDefaultPathways(db, now) returns the shipped default pathways whose deterministic id is absent from db.pathways AND whose instrument resolves on this device (same name-matching rule the store uses today, moved beside seedPathways); a default whose instrument does not resolve is not offered, so the app never creates a new unscoped ('' instrument) pathway. planDefaultPathways(db, pathwayIds, now) returns the next pathways/pathwayStages/pathwayRoutines: every existing element kept as a reference-identical prefix, plus exactly the CHOSEN offered pathways with their seeded stages and placed routines, skipping any seeded stage or routine whose id already exists anywhere; ids that are not offered (already present, never shipped) are ignored; when nothing is added it returns the SAME arrays. reseedDefaultPathways becomes (pathwayIds: string[]) => void, applies the plan in one set(), and returns without writing when the plan is a no-op. Repertoire → Pathways drops the empty-only 'Restore default pathways' button and instead renders, beside 'New pathway', one button per offered default that passes the current instrument filter (pathwaysForInstrumentFilter, so what is shown and what is added are the same set): fixed English label 'Add default pathway: ' followed by the pathway name in its own <span dir=\"auto\">, no dir on the button. Tapping one adds that pathway only; its button then disappears. Nothing is shown when nothing is offered.",
  "mustNotChange": [
    "No existing pathway, stage or routine is overwritten, re-ordered, re-placed or touched — including renamed seeded pathways, a pinned currentStageId, owner-added stages and detached routines.",
    "No item, block, review, lesson, agenda entry, attachment or setting is changed by adding a default pathway.",
    "Pathways are never added without an explicit tap naming that pathway; nothing is added on load, hydration, import or sync.",
    "No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, no migration is added, and migrateToV3 keeps its own instrument-id resolution untouched.",
    "The seeded pathway/stage/routine ids, names, order values and catalogue keys produced by seedPathways are unchanged, and a fresh install or demo reset seeds exactly as before.",
    "addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged: stages are never added into an existing pathway by this action.",
    "The 'New pathway' create flow and PathwayCard rendering are unchanged."
  ],
  "assumptions": [
    "A default pathway the owner deleted is offered again as its own named button (the offeredCourseLevels precedent: a deleted record reappears in a LIST, never in the data). Recording a dismissal would need persisted state and a schema change, which is out of scope.",
    "Seeded routines keep the shape seedPathways gives them today (no instrumentId stamped); a fresh seed uses the same output, so an added pathway matches a fresh install.",
    "An owner who renamed their Tar/Setar/Guitar instrument to a name the existing matching rule does not recognise will not be offered that instrument's default; previously the empty-state restore would have created it with an empty instrument id, which is worse.",
    "The per-pathway buttons replace the empty-state 'Restore default pathways' button; on an empty 'All' view that means one button per shipped pathway (four today)."
  ],
  "possibleConflicts": [
    "AGENTS.md's 'BUYING LEVELS 4A-5F LATER' paragraph says reseedDefaultPathways and its Repertoire button 'ARE NOT CHANGED'; its substance (only whole missing pathways, never stages into an existing one) still holds, but the sentence must be rewritten.",
    "src/components/direction.test.ts keeps an exact GROUP_SITE_INVENTORY (and value-isolate ledgers) of every dir=\"auto\" site in Repertoire.tsx; the new name isolate must be recorded there in source order or the suite fails.",
    "Comments in src/domain/courseSeed.ts and src/pages/PathwayDetail.tsx refer to reseedDefaultPathways as not additive to existing pathways; they remain true and are deliberately left alone."
  ],
  "scope": {
    "allow": [
      "src/domain/pathwaySeed.ts",
      "src/domain/pathways.test.ts",
      "src/store/useStore.ts",
      "src/pages/Repertoire.tsx",
      "src/components/direction.test.ts",
      "AGENTS.md",
      "docs/khonyagar-course.md"
    ],
    "forbid": [
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/types.ts",
      "src/domain/seed.ts",
      "src/domain/courseSeed.ts",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "src/pages/PathwayDetail.tsx",
      "scripts/**",
      ".prismatica/rules.md"
    ]
  },
  "exclusions": [
    "No persisted 'dismissed default pathway' record and no schema bump.",
    "No change to how seeded routines are shaped (no instrumentId backfill) and no general duplicate-id sweep in validateDB.",
    "No change to migrateToV3's own copy of the instrument-id resolution.",
    "No browser journey; the Repertoire wiring is checked by the owner."
  ],
  "acceptance": [
    {
      "description": "On an existing database built from the shipped seed minus tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner pathway, a renamed seeded pathway with a pinned stage, an owner stage and an owner routine), exactly tar-khonyagar is offered, on the Tar instrument's id.",
      "test": "offers only the shipped default pathway an existing database is missing"
    },
    {
      "description": "Planning tar-khonyagar keeps every existing pathway, stage and routine as a reference-identical prefix and appends that pathway with all of its seeded stages and no routines.",
      "test": "adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched"
    },
    {
      "description": "With every default present nothing is offered and the plan returns the very same arrays, so the store writes nothing and rev does not move.",
      "test": "offers nothing and returns the same collections when every default pathway is present"
    },
    {
      "description": "With two defaults missing, choosing one adds only that one; an id already present or never shipped adds nothing.",
      "test": "adds only the pathway chosen and ignores an id that is present or was never shipped"
    },
    {
      "description": "Re-adding a default the owner deleted appends its pathway and stages but never a second routine with an id the owner's detached routine already holds, and that routine is left exactly as it was. The fixture detaches the deleted pathway's routines with the real detachRoutinesFromPathway (routines.ts), never a hand-built shape.",
      "test": "never duplicates or re-places a routine the owner kept after deleting a default pathway"
    },
    {
      "description": "A default whose instrument does not resolve on this device (no Classical Guitar instrument) is not offered and cannot be planned.",
      "test": "does not offer a default pathway whose instrument this device does not have"
    },
    {
      "description": "On a real existing install, Repertoire → Pathways shows 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but not under Setar or Guitar; tapping it adds the pathway, the button disappears, the Farsi name reads right-to-left, and every existing pathway is unchanged.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "It appends pathway, stage and routine records to the persisted PracticeDB (IndexedDB, then synced). It never edits or removes existing records, adds no field and needs no migration; the boundary it must hold — add only the chosen missing pathway, never duplicate or re-place an existing id, write nothing on a no-op — is covered by discriminating Node tests."
  },
  "delta": {
    "today": "Before step 1, Repertoire → Pathways only offers 'Restore default pathways' when the list is empty, so an existing install can never get a newly shipped default pathway such as the Khonyagar Tar course.",
    "instead": "Before step 1, Repertoire → Pathways offers each shipped default pathway this install lacks (and whose instrument it has, within the current instrument filter) as its own 'Add default pathway: <name>' button; tapping one adds exactly that pathway with its stages and routines, changing nothing that already exists.",
    "keep": [
      "Opening a pathway and then a stage works exactly as in step 1.",
      "Existing pathways, stages, routines and items are untouched by adding a default pathway.",
      "A fresh install or demo reset seeds the same pathways as before."
    ],
    "assumptions": [
      "A deliberately deleted default pathway is offered again by name, never re-added on its own."
    ],
    "showMe": "Open Repertoire → Pathways on an install that has the Setar, Tar Honarestān and Classical Guitar pathways but not the Khonyagar one: an 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' button sits beside 'New pathway'; tap it and the course appears as a pathway card and the button is gone."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "docs/khonyagar-course.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Before step 1, Repertoire → Pathways offers each shipped default pathway this install lacks (and whose instrument it has, within the current instrument filter) as its own 'Add default pathway: <name>' button; tapping one adds exactly that pathway with its stages and routines, changing nothing that already exists.

_approved · about "work-a-pathway-stage"_

## Today

Before step 1, Repertoire → Pathways only offers 'Restore default pathways' when the list is empty, so an existing install can never get a newly shipped default pathway such as the Khonyagar Tar course.

## Instead

Before step 1, Repertoire → Pathways offers each shipped default pathway this install lacks (and whose instrument it has, within the current instrument filter) as its own 'Add default pathway: <name>' button; tapping one adds exactly that pathway with its stages and routines, changing nothing that already exists.

## Keep

- Opening a pathway and then a stage works exactly as in step 1.
- Existing pathways, stages, routines and items are untouched by adding a default pathway.
- A fresh install or demo reset seeds the same pathways as before.

## New assumptions

- A deliberately deleted default pathway is offered again by name, never re-added on its own.

## Show me

Open Repertoire → Pathways on an install that has the Setar, Tar Honarestān and Classical Guitar pathways but not the Khonyagar one: an 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' button sits beside 'New pathway'; tap it and the course appears as a pathway card and the button is gone.


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage

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

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# Work through a pathway stage

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

## Stay in scope — you may ONLY change

- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/store/useStore.ts
- src/pages/Repertoire.tsx
- src/components/direction.test.ts
- AGENTS.md
- docs/khonyagar-course.md
- src/domain/migrations.ts

Never touch:

- src/domain/io.ts
- src/domain/types.ts
- src/domain/seed.ts
- src/domain/courseSeed.ts
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- src/pages/PathwayDetail.tsx
- scripts/**
- .prismatica/rules.md
- No existing pathway, stage or routine is overwritten, re-ordered, re-placed or touched — including renamed seeded pathways, a pinned currentStageId, owner-added stages and detached routines.
- No item, block, review, lesson, agenda entry, attachment or setting is changed by adding a default pathway.
- Pathways are never added without an explicit tap naming that pathway; nothing is added on load, hydration, import or sync.
- No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, and no migration step is added, removed or reordered.
- The seeded pathway/stage/routine ids, names, order values and catalogue keys produced by seedPathways are unchanged, and a fresh install or demo reset seeds exactly as before.
- addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged: stages are never added into an existing pathway by this action.
- The 'New pathway' create flow and PathwayCard rendering are unchanged.
- No persisted 'dismissed default pathway' record and no schema bump.
- No change to how seeded routines are shaped (no instrumentId backfill) and no general duplicate-id sweep in validateDB.
- migrateToV3 changes in one way only: it resolves instrument ids through the shared seedInstrumentIds instead of its own copy. Nothing else in migrations.ts changes.
- No browser journey; the Repertoire wiring is checked by the owner.
- The instrument-name rule changes in exactly two ways: a Persian «گیتار» (Persian or Arabic yeh) is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. Setar resolves exactly as before, and Guitar and Tar resolve exactly as before for every other name. ArchiveRefresh's own Setar filter is not touched.

## Definition of done

- **ac-1** — On an existing database built from the shipped seed minus tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner pathway, a renamed seeded pathway with a pinned stage, an owner stage and an owner routine), exactly tar-khonyagar is offered, on the Tar instrument's id. → proven by `offers only the shipped default pathway an existing database is missing`
- **ac-2** — Planning tar-khonyagar keeps every existing pathway, stage and routine as a reference-identical prefix and appends that pathway with all of its seeded stages and no routines. → proven by `adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched`
- **ac-3** — With every default present nothing is offered and the plan returns the very same arrays, so the store writes nothing and rev does not move. → proven by `offers nothing and returns the same collections when every default pathway is present`
- **ac-4** — With two defaults missing, choosing one adds only that one; an id already present or never shipped adds nothing. → proven by `adds only the pathway chosen and ignores an id that is present or was never shipped`
- **ac-5** — Re-adding a default the owner deleted appends its pathway and stages but never a second routine with an id the owner's detached routine already holds, and that routine is left exactly as it was. The fixture detaches the deleted pathway's routines with the real detachRoutinesFromPathway (routines.ts), never a hand-built shape. → proven by `never duplicates or re-places a routine the owner kept after deleting a default pathway`
- **ac-6** — A default whose instrument does not resolve on this device (no Classical Guitar instrument) is not offered and cannot be planned. → proven by `does not offer a default pathway whose instrument this device does not have`
- **ac-7** — On a real existing install, Repertoire → Pathways shows 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but not under Setar or Guitar; tapping it adds the pathway, the button disappears, the Farsi name reads right-to-left, and every existing pathway is unchanged. → proven by `manual:OWNER`
- **ac-8** — Instruments are «سه‌تار» (listed first, as the seed lists Setar), «تار» and Classical Guitar. seedInstrumentIds resolves setar to «سه‌تار» and tar to «تار», and the spaced spelling «سه تار» resolves the same way. On a database missing tar-khonyagar, it is offered only on «تار»'s id, and pathwaysForInstrumentFilter under «سه‌تار»'s id leaves nothing offered. With «سه‌تار» and no Tar instrument, tar-khonyagar is not offered and planDefaultPathways adds nothing. The test lives in src/domain/pathways.test.ts. → proven by `never mistakes a Persian-named Setar for Tar when offering a default pathway`
- **ac-9** — migrateToCurrent runs over a pre-v3 database (no pathways key) whose instruments are «سه‌تار» then «تار». It places setar-radif on «سه‌تار», and tar-honarestan and tar-khonyagar on «تار», because migrateToV3 resolves through the same seedInstrumentIds rule. The test lives in src/domain/pathways.test.ts. → proven by `seeds a pre-v3 database's Tar pathways on the real Tar, never a Persian-named Setar`
- **ac-10** — Instruments are «سه‌تار» and «گیتار», with no Tar. seedInstrumentIds resolves setar to «سه‌تار», guitar to «گیتار» and tar to '', and the Arabic-yeh spelling «گيتار» resolves the same way. No Tar course is offered and planDefaultPathways adds none; once «تار» is added, both Tar courses are offered on «تار»'s id only. migrateToCurrent over a pre-v3 database with «سه‌تار», «گیتار» and «تار» places cgs on «گیتار» and both Tar pathways on «تار». The test lives in src/domain/pathways.test.ts. → proven by `never mistakes a Persian-named Guitar for Tar when offering or seeding a default pathway`

## Docs to update as part of this change

- AGENTS.md
- docs/khonyagar-course.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Last checks passed (2026-09-23T17:35:59.707Z). Rework loops so far: 0.

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

