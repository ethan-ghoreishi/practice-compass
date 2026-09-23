---
id: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
contractId: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
patchId: 3ec81b9515d41c41fb069d62c07a5d9df635f2d8
reviewer: claude
state: sealed
verdict: request_changes
findings:
  - family: default-pathway-instrument-resolution
    summary: seedInstrumentIds' Tar rule accepts any name containing «تار» that is
      not /setar/i, so a Persian-named Setar («سه‌تار») resolves as Tar and Tar
      defaults are offered and added on the Setar instrument; migrateToV3
      carries the same rule for pre-v3 databases.
    counterexample: "Instruments [«سه‌تار» (Setar, listed first as the seed lists
      it), «تار»], database missing tar-khonyagar: seedInstrumentIds(...).tar is
      «سه‌تار»'s id, so offeredDefaultPathways offers tar-khonyagar with
      instrumentId = «سه‌تار»'s id. Repertoire then shows 'Add default pathway:
      تار – آزاد میرزاپور (خنیاگر)' under Setar and not under Tar, and one tap
      persists a Tar course on the Setar instrument. With «سه‌تار» and no Tar
      instrument at all, it is still offered (on Setar) instead of not at all."
createdAt: 2026-09-23T17:38:08.934Z
sealedAt: 2026-09-23T18:07:04.845Z
---

# Review: Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260923-let-an-existing-install-add-a-missing-sh-7e4b
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/36
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `3ec81b9515d41c41fb069d62c07a5d9df635f2d8`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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

## The Delta this change was framed from

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



## Files in this diff

- AGENTS.md
- docs/khonyagar-course.md
- src/components/direction.test.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/pages/Repertoire.tsx
- src/store/useStore.ts

## Check against the contract

- [ ] **ac-1** — On an existing database built from the shipped seed minus tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner pathway, a renamed seeded pathway with a pinned stage, an owner stage and an owner routine), exactly tar-khonyagar is offered, on the Tar instrument's id. _(proof: offers only the shipped default pathway an existing database is missing)_
- [ ] **ac-2** — Planning tar-khonyagar keeps every existing pathway, stage and routine as a reference-identical prefix and appends that pathway with all of its seeded stages and no routines. _(proof: adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched)_
- [ ] **ac-3** — With every default present nothing is offered and the plan returns the very same arrays, so the store writes nothing and rev does not move. _(proof: offers nothing and returns the same collections when every default pathway is present)_
- [ ] **ac-4** — With two defaults missing, choosing one adds only that one; an id already present or never shipped adds nothing. _(proof: adds only the pathway chosen and ignores an id that is present or was never shipped)_
- [ ] **ac-5** — Re-adding a default the owner deleted appends its pathway and stages but never a second routine with an id the owner's detached routine already holds, and that routine is left exactly as it was. The fixture detaches the deleted pathway's routines with the real detachRoutinesFromPathway (routines.ts), never a hand-built shape. _(proof: never duplicates or re-places a routine the owner kept after deleting a default pathway)_
- [ ] **ac-6** — A default whose instrument does not resolve on this device (no Classical Guitar instrument) is not offered and cannot be planned. _(proof: does not offer a default pathway whose instrument this device does not have)_
- [ ] **ac-7** — On a real existing install, Repertoire → Pathways shows 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but not under Setar or Guitar; tapping it adds the pathway, the button disappears, the Farsi name reads right-to-left, and every existing pathway is unchanged. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/store/useStore.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **work-a-pathway-stage** — touched via src/domain/pathwaySeed.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx matched changed file(s) src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## point-this-device-at-the-nas — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## prepare-for-the-next-class — unchanged

Shares only the PracticeItem entity by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## see-practice-patterns — unchanged

Shares only the PracticeItem entity by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways.

## sync-devices-via-github — unchanged

Shares only the /settings route by inference. Nothing in this change touches Settings, a PracticeItem, or any collection other than pathways/stages/routines; the only store action changed is reseedDefaultPathways, reached solely from Repertoire → Pathways. Adding a default pathway replaces db once and bumps rev like any edit, so it syncs through the unchanged engine; a no-op tap now writes nothing, so it no longer schedules a needless sync.

## work-a-pathway-stage — truth-proposed

Repertoire → Pathways now offers each shipped default pathway this install lacks as its own 'Add default pathway: <name>' button (approved Delta 20260923-before-step-1-repertoire-pathways-offers-8b03). Steps 1-5 are unchanged; the lane's update proposal adds that variation and the Repertoire touchpoint. Proven by the six named tests in src/domain/pathways.test.ts; the rendered wiring is ac-7, the owner's manual check.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260923-let-an-existing-install-add-a-missing-sh-7e4b/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
