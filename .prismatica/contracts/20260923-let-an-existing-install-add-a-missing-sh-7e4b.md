---
id: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
title: Let an existing install add a missing shipped default pathway, such as
  the Khonyagar Tar course
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/36
intent: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
tier: heavy
stage: build
baseline:
  commit: e49d248c663aeab2dfd86a5ee97b03815027375e
  branch: main
branch: change/20260923-let-an-existing-install-add-a-missing-sh-7e4b
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260923-let-an-existing-install-add-a-missing-sh-7e4b
builder: claude
planHash: e6fc700757844f71801d34389b9e7abcef4adfd016131775259dc061da48a924
allowedPaths:
  - src/domain/pathwaySeed.ts
  - src/domain/pathways.test.ts
  - src/store/useStore.ts
  - src/pages/Repertoire.tsx
  - src/components/direction.test.ts
  - AGENTS.md
  - docs/khonyagar-course.md
forbiddenPaths:
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/types.ts
  - src/domain/seed.ts
  - src/domain/courseSeed.ts
  - src/domain/courseData.ts
  - src/domain/khonyagarData.ts
  - src/pages/PathwayDetail.tsx
  - scripts/**
  - .prismatica/rules.md
nonGoals:
  - No existing pathway, stage or routine is overwritten, re-ordered, re-placed
    or touched — including renamed seeded pathways, a pinned currentStageId,
    owner-added stages and detached routines.
  - No item, block, review, lesson, agenda entry, attachment or setting is
    changed by adding a default pathway.
  - Pathways are never added without an explicit tap naming that pathway;
    nothing is added on load, hydration, import or sync.
  - "No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, no
    migration is added, and migrateToV3 keeps its own instrument-id resolution
    untouched."
  - The seeded pathway/stage/routine ids, names, order values and catalogue keys
    produced by seedPathways are unchanged, and a fresh install or demo reset
    seeds exactly as before.
  - "addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged:
    stages are never added into an existing pathway by this action."
  - The 'New pathway' create flow and PathwayCard rendering are unchanged.
  - No persisted 'dismissed default pathway' record and no schema bump.
  - No change to how seeded routines are shaped (no instrumentId backfill) and
    no general duplicate-id sweep in validateDB.
  - No change to migrateToV3's own copy of the instrument-id resolution.
  - No browser journey; the Repertoire wiring is checked by the owner.
acceptanceChecks:
  - id: ac-1
    description: On an existing database built from the shipped seed minus
      tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner
      pathway, a renamed seeded pathway with a pinned stage, an owner stage and
      an owner routine), exactly tar-khonyagar is offered, on the Tar
      instrument's id.
    test: offers only the shipped default pathway an existing database is missing
  - id: ac-2
    description: Planning tar-khonyagar keeps every existing pathway, stage and
      routine as a reference-identical prefix and appends that pathway with all
      of its seeded stages and no routines.
    test: adds the chosen missing pathway with its stages and leaves every existing
      pathway, stage and routine untouched
  - id: ac-3
    description: With every default present nothing is offered and the plan returns
      the very same arrays, so the store writes nothing and rev does not move.
    test: offers nothing and returns the same collections when every default pathway
      is present
  - id: ac-4
    description: With two defaults missing, choosing one adds only that one; an id
      already present or never shipped adds nothing.
    test: adds only the pathway chosen and ignores an id that is present or was
      never shipped
  - id: ac-5
    description: Re-adding a default the owner deleted appends its pathway and
      stages but never a second routine with an id the owner's detached routine
      already holds, and that routine is left exactly as it was. The fixture
      detaches the deleted pathway's routines with the real
      detachRoutinesFromPathway (routines.ts), never a hand-built shape.
    test: never duplicates or re-places a routine the owner kept after deleting a
      default pathway
  - id: ac-6
    description: A default whose instrument does not resolve on this device (no
      Classical Guitar instrument) is not offered and cannot be planned.
    test: does not offer a default pathway whose instrument this device does not have
  - id: ac-7
    description: "On a real existing install, Repertoire → Pathways shows 'Add
      default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but
      not under Setar or Guitar; tapping it adds the pathway, the button
      disappears, the Farsi name reads right-to-left, and every existing pathway
      is unchanged."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - docs/khonyagar-course.md
createdAt: 2026-09-23T16:49:32.299Z
amendments: []
---

# Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/36
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** e49d248c663aeab2dfd86a5ee97b03815027375e on main _(never re-baselined)_
- **Intent:** 20260923-let-an-existing-install-add-a-missing-sh-7e4b

## You may only change

- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/store/useStore.ts
- src/pages/Repertoire.tsx
- src/components/direction.test.ts
- AGENTS.md
- docs/khonyagar-course.md

## Never touch

- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/types.ts
- src/domain/seed.ts
- src/domain/courseSeed.ts
- src/domain/courseData.ts
- src/domain/khonyagarData.ts
- src/pages/PathwayDetail.tsx
- scripts/**
- .prismatica/rules.md

## Non-goals

- No existing pathway, stage or routine is overwritten, re-ordered, re-placed or touched — including renamed seeded pathways, a pinned currentStageId, owner-added stages and detached routines.
- No item, block, review, lesson, agenda entry, attachment or setting is changed by adding a default pathway.
- Pathways are never added without an explicit tap naming that pathway; nothing is added on load, hydration, import or sync.
- No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, no migration is added, and migrateToV3 keeps its own instrument-id resolution untouched.
- The seeded pathway/stage/routine ids, names, order values and catalogue keys produced by seedPathways are unchanged, and a fresh install or demo reset seeds exactly as before.
- addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged: stages are never added into an existing pathway by this action.
- The 'New pathway' create flow and PathwayCard rendering are unchanged.
- No persisted 'dismissed default pathway' record and no schema bump.
- No change to how seeded routines are shaped (no instrumentId backfill) and no general duplicate-id sweep in validateDB.
- No change to migrateToV3's own copy of the instrument-id resolution.
- No browser journey; the Repertoire wiring is checked by the owner.

## Acceptance checks (definition of done)

- [ ] **ac-1** — On an existing database built from the shipped seed minus tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner pathway, a renamed seeded pathway with a pinned stage, an owner stage and an owner routine), exactly tar-khonyagar is offered, on the Tar instrument's id. _(proof: offers only the shipped default pathway an existing database is missing)_
- [ ] **ac-2** — Planning tar-khonyagar keeps every existing pathway, stage and routine as a reference-identical prefix and appends that pathway with all of its seeded stages and no routines. _(proof: adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched)_
- [ ] **ac-3** — With every default present nothing is offered and the plan returns the very same arrays, so the store writes nothing and rev does not move. _(proof: offers nothing and returns the same collections when every default pathway is present)_
- [ ] **ac-4** — With two defaults missing, choosing one adds only that one; an id already present or never shipped adds nothing. _(proof: adds only the pathway chosen and ignores an id that is present or was never shipped)_
- [ ] **ac-5** — Re-adding a default the owner deleted appends its pathway and stages but never a second routine with an id the owner's detached routine already holds, and that routine is left exactly as it was. The fixture detaches the deleted pathway's routines with the real detachRoutinesFromPathway (routines.ts), never a hand-built shape. _(proof: never duplicates or re-places a routine the owner kept after deleting a default pathway)_
- [ ] **ac-6** — A default whose instrument does not resolve on this device (no Classical Guitar instrument) is not offered and cannot be planned. _(proof: does not offer a default pathway whose instrument this device does not have)_
- [ ] **ac-7** — On a real existing install, Repertoire → Pathways shows 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but not under Setar or Guitar; tapping it adds the pathway, the button disappears, the Farsi name reads right-to-left, and every existing pathway is unchanged. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- docs/khonyagar-course.md

## Amendments

_none_

