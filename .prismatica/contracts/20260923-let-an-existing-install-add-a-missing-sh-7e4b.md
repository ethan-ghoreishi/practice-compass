---
id: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
title: Let an existing install add a missing shipped default pathway, such as
  the Khonyagar Tar course
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/36
intent: 20260923-let-an-existing-install-add-a-missing-sh-7e4b
tier: heavy
stage: ship
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
  - src/domain/migrations.ts
forbiddenPaths:
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
  - "No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, and
    no migration step is added, removed or reordered."
  - The seeded pathway/stage/routine ids, names, order values and catalogue keys
    produced by seedPathways are unchanged, and a fresh install or demo reset
    seeds exactly as before.
  - "addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged:
    stages are never added into an existing pathway by this action."
  - The 'New pathway' create flow and PathwayCard rendering are unchanged.
  - No persisted 'dismissed default pathway' record and no schema bump.
  - No change to how seeded routines are shaped (no instrumentId backfill) and
    no general duplicate-id sweep in validateDB.
  - "migrateToV3 changes in one way only: it resolves instrument ids through the
    shared seedInstrumentIds instead of its own copy. Nothing else in
    migrations.ts changes."
  - No browser journey; the Repertoire wiring is checked by the owner.
  - "The instrument-name rule changes in exactly two ways: a Persian «گیتار»
    (Persian or Arabic yeh) is recognised as Guitar, and a name recognised as
    Setar or Guitar is never Tar. Setar resolves exactly as before, and Guitar
    and Tar resolve exactly as before for every other name. ArchiveRefresh's own
    Setar filter is not touched."
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
  - id: ac-8
    description: Instruments are «سه‌تار» (listed first, as the seed lists Setar),
      «تار» and Classical Guitar. seedInstrumentIds resolves setar to «سه‌تار»
      and tar to «تار», and the spaced spelling «سه تار» resolves the same way.
      On a database missing tar-khonyagar, it is offered only on «تار»'s id, and
      pathwaysForInstrumentFilter under «سه‌تار»'s id leaves nothing offered.
      With «سه‌تار» and no Tar instrument, tar-khonyagar is not offered and
      planDefaultPathways adds nothing. The test lives in
      src/domain/pathways.test.ts.
    test: never mistakes a Persian-named Setar for Tar when offering a default
      pathway
  - id: ac-9
    description: migrateToCurrent runs over a pre-v3 database (no pathways key)
      whose instruments are «سه‌تار» then «تار». It places setar-radif on
      «سه‌تار», and tar-honarestan and tar-khonyagar on «تار», because
      migrateToV3 resolves through the same seedInstrumentIds rule. The test
      lives in src/domain/pathways.test.ts.
    test: seeds a pre-v3 database's Tar pathways on the real Tar, never a
      Persian-named Setar
  - id: ac-10
    description: Instruments are «سه‌تار» and «گیتار», with no Tar.
      seedInstrumentIds resolves setar to «سه‌تار», guitar to «گیتار» and tar to
      '', and the Arabic-yeh spelling «گيتار» resolves the same way. No Tar
      course is offered and planDefaultPathways adds none; once «تار» is added,
      both Tar courses are offered on «تار»'s id only. migrateToCurrent over a
      pre-v3 database with «سه‌تار», «گیتار» and «تار» places cgs on «گیتار» and
      both Tar pathways on «تار». The test lives in src/domain/pathways.test.ts.
    test: never mistakes a Persian-named Guitar for Tar when offering or seeding a
      default pathway
docsDelta:
  - AGENTS.md
  - docs/khonyagar-course.md
createdAt: 2026-09-23T16:49:32.299Z
amendments:
  - at: 2026-09-23T18:08:01.468Z
    reason: "Sealed review finding (family: default-pathway-instrument-resolution):
      the reused Tar name rule reads a Persian-named Setar («سه‌تار») as Tar, so
      Khonyagar and Honarestān are offered and added on the Setar instrument.
      migrateToV3 carries the same rule for pre-v3 databases. The fix makes a
      name containing «سه» never Tar, in the one shared rule that both callers
      use. Scope widens by migrations.ts only."
    description: "allow: +src/domain/migrations.ts; forbid:
      -src/domain/migrations.ts; non-goals: +No schema change: SCHEMA_VERSION
      stays 14, PracticeDB gains no field, and no migration step is added,
      removed or reordered., migrateToV3 changes in one way only: it resolves
      instrument ids through the shared seedInstrumentIds instead of its own
      copy. Nothing else in migrations.ts changes., The instrument-name rule
      changes in exactly one way: a name containing «سه» is never Tar. Guitar
      and Setar resolve exactly as before, and so does Tar for every name
      without «سه». ArchiveRefresh's own Setar filter is not touched. -No schema
      change: SCHEMA_VERSION stays 14, PracticeDB gains no field, no migration
      is added, and migrateToV3 keeps its own instrument-id resolution
      untouched., No change to migrateToV3's own copy of the instrument-id
      resolution.; checks: +ac-8|Instruments are «سه‌تار» (listed first, as the
      seed lists Setar), «تار» and Classical Guitar. seedInstrumentIds resolves
      setar to «سه‌تار» and tar to «تار», and the spaced spelling «سه تار»
      resolves the same way. On a database missing tar-khonyagar, it is offered
      only on «تار»'s id, and pathwaysForInstrumentFilter under «سه‌تار»'s id
      leaves nothing offered. With «سه‌تار» and no Tar instrument, tar-khonyagar
      is not offered and planDefaultPathways adds nothing. The test lives in
      src/domain/pathways.test.ts.|never mistakes a Persian-named Setar for Tar
      when offering a default pathway, ac-9|migrateToCurrent runs over a pre-v3
      database (no pathways key) whose instruments are «سه‌تار» then «تار». It
      places setar-radif on «سه‌تار», and tar-honarestan and tar-khonyagar on
      «تار», because migrateToV3 resolves through the same seedInstrumentIds
      rule. The test lives in src/domain/pathways.test.ts.|seeds a pre-v3
      database's Tar pathways on the real Tar, never a Persian-named Setar;
      intent revised"
    intentRevision: Resolving a default pathway's instrument must never read a
      Persian-named Setar («سه‌تار» or «سه تار») as Tar. seedInstrumentIds
      excludes any name containing «سه» from Tar, and migrateToV3 resolves
      through that same shared rule instead of its own copy. Everything else in
      the approved plan stands.
  - at: 2026-09-23T18:36:28.837Z
    reason: "Sibling of the sealed finding (family:
      default-pathway-instrument-resolution): Persian «گیتار» also contains
      «تار», and the Guitar rule does not recognise it, so with [«سه‌تار»,
      «گیتار»] and no Tar the Tar courses are offered, added and pre-v3-seeded
      on the Guitar instrument. The fix is in the one shared classification
      rule: «گیتار» is recognised as Guitar, and a name recognised as Setar or
      Guitar is never Tar. No scope change."
    description: "non-goals: +The instrument-name rule changes in exactly two ways:
      a Persian «گیتار» (Persian or Arabic yeh) is recognised as Guitar, and a
      name recognised as Setar or Guitar is never Tar. Setar resolves exactly as
      before, and Guitar and Tar resolve exactly as before for every other name.
      ArchiveRefresh's own Setar filter is not touched. -The instrument-name
      rule changes in exactly one way: a name containing «سه» is never Tar.
      Guitar and Setar resolve exactly as before, and so does Tar for every name
      without «سه». ArchiveRefresh's own Setar filter is not touched.; checks:
      +ac-10|Instruments are «سه‌تار» and «گیتار», with no Tar.
      seedInstrumentIds resolves setar to «سه‌تار», guitar to «گیتار» and tar to
      '', and the Arabic-yeh spelling «گيتار» resolves the same way. No Tar
      course is offered and planDefaultPathways adds none; once «تار» is added,
      both Tar courses are offered on «تار»'s id only. migrateToCurrent over a
      pre-v3 database with «سه‌تار», «گیتار» and «تار» places cgs on «گیتار» and
      both Tar pathways on «تار». The test lives in
      src/domain/pathways.test.ts.|never mistakes a Persian-named Guitar for Tar
      when offering or seeding a default pathway; intent revised"
    intentRevision: "Resolving a default pathway's instrument must never read a
      Persian-named Setar («سه‌تار», «سه تار») or Guitar («گیتار») as Tar.
      seedInstrumentIds is one classification: «گیتار» is recognised as Guitar,
      and a name recognised as Setar or Guitar is never Tar. migrateToV3
      resolves through that same shared rule instead of its own copy. Everything
      else in the approved plan stands."
---

# Let an existing install add a missing shipped default pathway, such as the Khonyagar Tar course

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/36
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** e49d248c663aeab2dfd86a5ee97b03815027375e on main _(never re-baselined)_
- **Intent:** 20260923-let-an-existing-install-add-a-missing-sh-7e4b

## Intent revisions — supersedes the original request only where it conflicts

- **2026-09-23T18:08:01.468Z** _(Sealed review finding (family: default-pathway-instrument-resolution): the reused Tar name rule reads a Persian-named Setar («سه‌تار») as Tar, so Khonyagar and Honarestān are offered and added on the Setar instrument. migrateToV3 carries the same rule for pre-v3 databases. The fix makes a name containing «سه» never Tar, in the one shared rule that both callers use. Scope widens by migrations.ts only.)_

  Resolving a default pathway's instrument must never read a Persian-named Setar («سه‌تار» or «سه تار») as Tar. seedInstrumentIds excludes any name containing «سه» from Tar, and migrateToV3 resolves through that same shared rule instead of its own copy. Everything else in the approved plan stands.

- **2026-09-23T18:36:28.837Z** _(Sibling of the sealed finding (family: default-pathway-instrument-resolution): Persian «گیتار» also contains «تار», and the Guitar rule does not recognise it, so with [«سه‌تار», «گیتار»] and no Tar the Tar courses are offered, added and pre-v3-seeded on the Guitar instrument. The fix is in the one shared classification rule: «گیتار» is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. No scope change.)_

  Resolving a default pathway's instrument must never read a Persian-named Setar («سه‌تار», «سه تار») or Guitar («گیتار») as Tar. seedInstrumentIds is one classification: «گیتار» is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. migrateToV3 resolves through that same shared rule instead of its own copy. Everything else in the approved plan stands.

## You may only change

- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/store/useStore.ts
- src/pages/Repertoire.tsx
- src/components/direction.test.ts
- AGENTS.md
- docs/khonyagar-course.md
- src/domain/migrations.ts

## Never touch

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
- No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, and no migration step is added, removed or reordered.
- The seeded pathway/stage/routine ids, names, order values and catalogue keys produced by seedPathways are unchanged, and a fresh install or demo reset seeds exactly as before.
- addCourseLevels / offeredCourseLevels / planCourseLevels are unchanged: stages are never added into an existing pathway by this action.
- The 'New pathway' create flow and PathwayCard rendering are unchanged.
- No persisted 'dismissed default pathway' record and no schema bump.
- No change to how seeded routines are shaped (no instrumentId backfill) and no general duplicate-id sweep in validateDB.
- migrateToV3 changes in one way only: it resolves instrument ids through the shared seedInstrumentIds instead of its own copy. Nothing else in migrations.ts changes.
- No browser journey; the Repertoire wiring is checked by the owner.
- The instrument-name rule changes in exactly two ways: a Persian «گیتار» (Persian or Arabic yeh) is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. Setar resolves exactly as before, and Guitar and Tar resolve exactly as before for every other name. ArchiveRefresh's own Setar filter is not touched.

## Acceptance checks (definition of done)

- [ ] **ac-1** — On an existing database built from the shipped seed minus tar-khonyagar (real Setar/Tar/Classical Guitar instruments, plus an owner pathway, a renamed seeded pathway with a pinned stage, an owner stage and an owner routine), exactly tar-khonyagar is offered, on the Tar instrument's id. _(proof: offers only the shipped default pathway an existing database is missing)_
- [ ] **ac-2** — Planning tar-khonyagar keeps every existing pathway, stage and routine as a reference-identical prefix and appends that pathway with all of its seeded stages and no routines. _(proof: adds the chosen missing pathway with its stages and leaves every existing pathway, stage and routine untouched)_
- [ ] **ac-3** — With every default present nothing is offered and the plan returns the very same arrays, so the store writes nothing and rev does not move. _(proof: offers nothing and returns the same collections when every default pathway is present)_
- [ ] **ac-4** — With two defaults missing, choosing one adds only that one; an id already present or never shipped adds nothing. _(proof: adds only the pathway chosen and ignores an id that is present or was never shipped)_
- [ ] **ac-5** — Re-adding a default the owner deleted appends its pathway and stages but never a second routine with an id the owner's detached routine already holds, and that routine is left exactly as it was. The fixture detaches the deleted pathway's routines with the real detachRoutinesFromPathway (routines.ts), never a hand-built shape. _(proof: never duplicates or re-places a routine the owner kept after deleting a default pathway)_
- [ ] **ac-6** — A default whose instrument does not resolve on this device (no Classical Guitar instrument) is not offered and cannot be planned. _(proof: does not offer a default pathway whose instrument this device does not have)_
- [ ] **ac-7** — On a real existing install, Repertoire → Pathways shows 'Add default pathway: تار – آزاد میرزاپور (خنیاگر)' under All and under Tar but not under Setar or Guitar; tapping it adds the pathway, the button disappears, the Farsi name reads right-to-left, and every existing pathway is unchanged. _(proof: manual:OWNER)_
- [ ] **ac-8** — Instruments are «سه‌تار» (listed first, as the seed lists Setar), «تار» and Classical Guitar. seedInstrumentIds resolves setar to «سه‌تار» and tar to «تار», and the spaced spelling «سه تار» resolves the same way. On a database missing tar-khonyagar, it is offered only on «تار»'s id, and pathwaysForInstrumentFilter under «سه‌تار»'s id leaves nothing offered. With «سه‌تار» and no Tar instrument, tar-khonyagar is not offered and planDefaultPathways adds nothing. The test lives in src/domain/pathways.test.ts. _(proof: never mistakes a Persian-named Setar for Tar when offering a default pathway)_
- [ ] **ac-9** — migrateToCurrent runs over a pre-v3 database (no pathways key) whose instruments are «سه‌تار» then «تار». It places setar-radif on «سه‌تار», and tar-honarestan and tar-khonyagar on «تار», because migrateToV3 resolves through the same seedInstrumentIds rule. The test lives in src/domain/pathways.test.ts. _(proof: seeds a pre-v3 database's Tar pathways on the real Tar, never a Persian-named Setar)_
- [ ] **ac-10** — Instruments are «سه‌تار» and «گیتار», with no Tar. seedInstrumentIds resolves setar to «سه‌تار», guitar to «گیتار» and tar to '', and the Arabic-yeh spelling «گيتار» resolves the same way. No Tar course is offered and planDefaultPathways adds none; once «تار» is added, both Tar courses are offered on «تار»'s id only. migrateToCurrent over a pre-v3 database with «سه‌تار», «گیتار» and «تار» places cgs on «گیتار» and both Tar pathways on «تار». The test lives in src/domain/pathways.test.ts. _(proof: never mistakes a Persian-named Guitar for Tar when offering or seeding a default pathway)_

## Docs to update

- AGENTS.md
- docs/khonyagar-course.md

## Amendments

- 2026-09-23T18:08:01.468Z — Sealed review finding (family: default-pathway-instrument-resolution): the reused Tar name rule reads a Persian-named Setar («سه‌تار») as Tar, so Khonyagar and Honarestān are offered and added on the Setar instrument. migrateToV3 carries the same rule for pre-v3 databases. The fix makes a name containing «سه» never Tar, in the one shared rule that both callers use. Scope widens by migrations.ts only.: allow: +src/domain/migrations.ts; forbid: -src/domain/migrations.ts; non-goals: +No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, and no migration step is added, removed or reordered., migrateToV3 changes in one way only: it resolves instrument ids through the shared seedInstrumentIds instead of its own copy. Nothing else in migrations.ts changes., The instrument-name rule changes in exactly one way: a name containing «سه» is never Tar. Guitar and Setar resolve exactly as before, and so does Tar for every name without «سه». ArchiveRefresh's own Setar filter is not touched. -No schema change: SCHEMA_VERSION stays 14, PracticeDB gains no field, no migration is added, and migrateToV3 keeps its own instrument-id resolution untouched., No change to migrateToV3's own copy of the instrument-id resolution.; checks: +ac-8|Instruments are «سه‌تار» (listed first, as the seed lists Setar), «تار» and Classical Guitar. seedInstrumentIds resolves setar to «سه‌تار» and tar to «تار», and the spaced spelling «سه تار» resolves the same way. On a database missing tar-khonyagar, it is offered only on «تار»'s id, and pathwaysForInstrumentFilter under «سه‌تار»'s id leaves nothing offered. With «سه‌تار» and no Tar instrument, tar-khonyagar is not offered and planDefaultPathways adds nothing. The test lives in src/domain/pathways.test.ts.|never mistakes a Persian-named Setar for Tar when offering a default pathway, ac-9|migrateToCurrent runs over a pre-v3 database (no pathways key) whose instruments are «سه‌تار» then «تار». It places setar-radif on «سه‌تار», and tar-honarestan and tar-khonyagar on «تار», because migrateToV3 resolves through the same seedInstrumentIds rule. The test lives in src/domain/pathways.test.ts.|seeds a pre-v3 database's Tar pathways on the real Tar, never a Persian-named Setar; intent revised
- 2026-09-23T18:36:28.837Z — Sibling of the sealed finding (family: default-pathway-instrument-resolution): Persian «گیتار» also contains «تار», and the Guitar rule does not recognise it, so with [«سه‌تار», «گیتار»] and no Tar the Tar courses are offered, added and pre-v3-seeded on the Guitar instrument. The fix is in the one shared classification rule: «گیتار» is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. No scope change.: non-goals: +The instrument-name rule changes in exactly two ways: a Persian «گیتار» (Persian or Arabic yeh) is recognised as Guitar, and a name recognised as Setar or Guitar is never Tar. Setar resolves exactly as before, and Guitar and Tar resolve exactly as before for every other name. ArchiveRefresh's own Setar filter is not touched. -The instrument-name rule changes in exactly one way: a name containing «سه» is never Tar. Guitar and Setar resolve exactly as before, and so does Tar for every name without «سه». ArchiveRefresh's own Setar filter is not touched.; checks: +ac-10|Instruments are «سه‌تار» and «گیتار», with no Tar. seedInstrumentIds resolves setar to «سه‌تار», guitar to «گیتار» and tar to '', and the Arabic-yeh spelling «گيتار» resolves the same way. No Tar course is offered and planDefaultPathways adds none; once «تار» is added, both Tar courses are offered on «تار»'s id only. migrateToCurrent over a pre-v3 database with «سه‌تار», «گیتار» and «تار» places cgs on «گیتار» and both Tar pathways on «تار». The test lives in src/domain/pathways.test.ts.|never mistakes a Persian-named Guitar for Tar when offering or seeding a default pathway; intent revised

