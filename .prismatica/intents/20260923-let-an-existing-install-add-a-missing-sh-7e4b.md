---
id: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
title: Let an existing install add a missing shipped default pathway, such as
  the Khonyagar Tar course
state: open
checks:
  - id: ac-1
    description: On an existing database built from the shipped seed minus
      tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner
      pathway, a renamed seeded pathway with a pinned stage, an owner stage and
      an owner routine), exactly tar-khonyagar is offered, on the Tar
      instrument's id.
    status: unproven
  - id: ac-2
    description: Planning tar-khonyagar keeps every existing pathway, stage and
      routine as a reference-identical prefix and appends that pathway with all
      of its seeded stages and no routines.
    status: unproven
  - id: ac-3
    description: With every default present nothing is offered and the plan returns
      the very same arrays, so the store writes nothing and rev does not move.
    status: unproven
  - id: ac-4
    description: With two defaults missing, choosing one adds only that one; an id
      already present or never shipped adds nothing.
    status: unproven
createdAt: 2026-09-23T16:49:32.299Z
---

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

