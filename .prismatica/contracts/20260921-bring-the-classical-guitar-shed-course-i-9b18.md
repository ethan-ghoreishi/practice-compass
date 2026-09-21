---
id: 20260921-bring-the-classical-guitar-shed-course-i-9b18
title: Bring the Classical Guitar Shed course into the Guitar pathway with its
  material, works and position-aware routines
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/32
intent: 20260921-bring-the-classical-guitar-shed-course-i-9b18
tier: heavy
stage: prove
baseline:
  commit: 4b5a88181047f85420a450b5393e5b1997630d43
  branch: main
branch: change/20260921-bring-the-classical-guitar-shed-course-i-9b18
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260921-bring-the-classical-guitar-shed-course-i-9b18
builder: claude
planHash: 40425078b80ad0a45241fea0ce186ea78b7e6627e79805d553b24bf3ce9f2cc2
allowedPaths:
  - src/domain/courseSeed.ts
  - src/domain/courseSeed.test.ts
  - src/domain/courseData.ts
  - src/domain/mediaRoots.ts
  - src/domain/mediaRoots.test.ts
  - src/domain/pathwaySeed.ts
  - src/domain/pathways.ts
  - src/domain/pathways.test.ts
  - src/domain/routines.ts
  - src/domain/routines.test.ts
  - src/domain/itemFiles.ts
  - src/domain/itemFiles.test.ts
  - src/domain/recordings.ts
  - src/domain/recordings.test.ts
  - src/domain/factories.ts
  - src/domain/labels.ts
  - src/domain/types.ts
  - src/domain/index.ts
  - src/store/useStore.ts
  - src/store/backup.ts
  - src/components/ItemMaterial.tsx
  - src/components/RoutineDuration.tsx
  - src/components/direction.test.ts
  - src/pages/StageDetail.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/Today.tsx
  - src/pages/Settings.tsx
  - tests/daily-practice.browser.test.ts
  - scripts/scan-cgs-course.mjs
  - docs/cgs-course.md
  - docs/setar-archive.md
  - AGENTS.md
forbiddenPaths:
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/sourceArchive.ts
  - src/domain/sourceReconcile.ts
  - src/domain/scheduling.ts
  - src/domain/sync.ts
  - src/domain/canonical.ts
  - src/domain/plan.ts
  - src/domain/repertoire.ts
  - src/domain/recommend.ts
  - src/domain/scoring.ts
  - src/store/syncEngine.ts
  - src/store/githubSync.ts
  - src/store/gitRemote.ts
  - src/pages/CloseBlock.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/RoutineRunner.tsx
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
nonGoals:
  - "The Setar class archive keeps working exactly as it does now: no change to
    `sourceArchive.ts`, `sourceReconcile.ts`, the published index format, the
    scanner, the publisher, or the refresh/adoption flow."
  - "`getNasBaseUrl()` keeps its stored value and its meaning — it still names
    the Setar archive folder. Every existing lesson reference,
    `relativizeReference`, `archiveRootUrl`, `ReferenceEditor`, `Lessons` and
    `ArchiveRefresh` resolve byte-identically. The shared media root is DERIVED
    from it and never rewrites it."
  - "No schema change and no migration: `SCHEMA_VERSION` stays 14,
    `migrations.ts` and `io.ts` are forbidden by scope, and nothing new is
    persisted in `PracticeDB`. Catalogue, course data and syllabus routines are
    reference data in code; the media-root override is per-device localStorage."
  - Level 1A's fourteen hand-authored steps and both of its existing routines
    stay exactly as they are.
  - Stage ids and every catalogue key that existing data may reference stay
    byte-stable; a key is only ever added, never renamed, so no already-added
    item is orphaned from its suggestion.
  - "`reseedDefaultPathways` and its Repertoire button are NOT changed: they
    keep adding stages only for pathways that do not yet exist. Adding course
    levels is a separate, course-scoped action that never adds a stage on its
    own — it offers the levels the course has and the pathway does not, and adds
    only those the owner selects, so a stage they deliberately deleted can never
    be recreated without them choosing it."
  - "`isWork`, `repertoireWorks` and `repertoire.ts` are not changed — the
    repertoire fix is upstream, in what the catalogue declares."
  - "No bytes enter the app: no video, PDF, image or contrast card is ever
    attached, cached, synced or backed up. r-large-files-stay-on-nas holds
    unchanged."
  - "`addFromCatalog` keeps its contract: a catalogue item arrives `status:
    'new'` with zero statistics and stays losslessly removable, so
    `isLosslesslyRemovable` and the Remove affordance keep working."
  - "Running a routine is otherwise unchanged: the same runner, the same frozen
    segment list, the same boundary signals, the same
    at-most-one-block-per-bound-item recording. Only the segment MINUTES may be
    scaled, never a label, note, essential flag or bound item."
  - "`segmentsForRun` keeps its exact meaning and signature — duration is a
    second, independent knob, not a replacement for essentials-only."
  - "The Session Plan is not touched and its allocator is not reused: `plan.ts`
    is forbidden, and only `validateBudgetMinutes` is imported from it so the
    duration control shares the 5-120 bound."
  - Practising stays the only thing that completes a review or advances SM-2;
    nothing here writes a block, a result or a schedule.
  - "Today keeps its layout: the two doorway cards stay above the
    recommendation, both stay collapsed at about 50px, and the primary
    recommendation stays above the fold at 390x844."
  - No recorded `dir` site is removed or reordered; any new group or isolate is
    added to `direction.test.ts`'s recorded inventories visibly, never silently.
  - "`scripts/scan-cgs-course.mjs` is a build-time tool only — stdlib, dry-run
    by default, never imported by or reachable from any runtime path in `src/`."
  - Starting a block stays under 30 seconds and closing one under 60; no
    required field is added anywhere.
  - No contrast-card viewer, flashcard player or media player of any kind — one
    folder reference per level's warm-up entry and nothing more.
  - No second source-archive grammar, no published index, no scanner running
    inside the app, and no change to the Setar archive's scanner, publisher or
    refresh.
  - "No per-source media roots and no resolver fallback: one shared root,
    derived, with an override."
  - No content for CGS levels the owner does not own. The architecture makes
    4A-5F a data change; no placeholder stage, catalogue entry or routine is
    created for them.
  - No Khonyagar/Tar course data, no Tar teacher-class import, no ArtistWorks
    import.
  - No schema change, no migration, no new persisted collection and no new
    inbound-validation door.
  - No change to the recommendation engine, the Session Plan, review scheduling
    or SM-2.
  - "No automatic creation of items, routines or stages: every one is created by
    an explicit owner action."
  - No change to Today's doorway order, card heights or above-the-fold behaviour.
  - No change to `reseedDefaultPathways` or the existing “restore default
    pathways” button.
  - "Desired rule (not yet truth): Course material is composed from the course's
    own published structure and never hand-linked or copied onto an item: a
    practice item created from a course catalogue entry shows that section's
    files because the catalogue says so, so regenerating the course reaches
    every item that already exists."
  - "Desired rule (not yet truth): There is ONE media root per device and every
    source is a folder beneath it, so a stored reference is always relative to
    its own source and adding a source never needs a new device setting, a
    per-source root or a resolver fallback."
  - "Desired rule (not yet truth): A course entry becomes repertoire only when
    the course itself names a specific work; sections that teach a skill are
    practice material and never appear in My repertoire, and a work carried
    forward across levels is introduced once and reused rather than suggested
    again."
  - "Desired rule (not yet truth): A routine's authored minutes are proportions,
    not a fixed length: it may be fitted to any session duration by scaling
    those proportions, dropping non-essential segments before essential ones,
    and never altering a segment's label, note, essential flag or bound item."
acceptanceChecks:
  - id: ac-1
    description: A level's own study and its named packet works become repertoire
      works; every drill, exercise, rhythm, sight-reading and reading section
      from the same level does not.
    test: a level's study and packet works are repertoire works and its drill
      sections are not
  - id: ac-2
    description: A work carried forward across levels is suggested once. Adding it
      from a later level reuses the existing item rather than creating a second
      work in My repertoire.
    test: reuses a carried-forward work when it is added from a later level instead
      of duplicating it
  - id: ac-3
    description: Course material is composed live from the catalogue for a
      catalogue-linked item, and nothing is written onto the item — so
      regenerated course data reaches items that already exist.
    test: composes a catalogue item's course files without storing any reference on
      the item
  - id: ac-4
    description: A course file resolves under the shared media root joined with the
      course's own media path, while an archive reference resolves against the
      unchanged archive base — both from the real configured values.
    test: resolves a course file under the shared media root and leaves archive
      resolution unchanged
  - id: ac-5
    description: The media root is derived from the archive base, an explicit
      override wins over the derivation when set, and a base whose last segment
      names no known source yields no root at all rather than a guess.
    test: prefers an explicit media root over the derived one and derives nothing
      from an unrecognised base
  - id: ac-6
    description: "With no media root derivable or set, a course file is honestly
      unavailable rather than a dead link: the resolver reports no-base and the
      material row offers no open action."
    test: reports no-base for a course file when no media root is derivable or set
  - id: ac-7
    description: The position routine is the previous level's essential segments
      plus only the current level's segments whose catalogue item the owner has
      actually added.
    test: builds a position routine from added current-level items plus the previous
      level's essentials
  - id: ac-8
    description: A current-level segment whose catalogue item has not been added is
      absent from the position routine, while the level's full routine still
      contains it.
    test: omits a current-level segment whose catalogue item has not been added
  - id: ac-9
    description: A segment is joined to its item by stage and catalogue key
      together, so an identically-keyed entry in another level is never matched.
    test: joins a segment to its item by stage and catalogue key together, never by
      key alone
  - id: ac-10
    description: Adding one of a level's optional repertoire works changes nothing
      about the position routine, while adding one of its practice sections adds
      that section's segments — because a segment is matched by its OWN declared
      catalogue key, never by how many items the stage now holds.
    test: ignores an added repertoire work when building the position routine and
      includes an added practice section
  - id: ac-11
    description: Fitting a routine to a target total yields minutes summing exactly
      to that target, and returns the routine unchanged when the target equals
      its authored total.
    test: fits a routine to a target total exactly and leaves it unchanged at its
      authored total
  - id: ac-12
    description: When the target cannot seat every segment at a one-minute floor,
      non-essential segments are dropped before essential ones, and every
      surviving segment keeps its label, note, essential flag and bound item.
    test: drops a non-essential segment before an essential one and preserves every
      surviving segment's identity
  - id: ac-13
    description: Adding new course levels OFFERS only the levels genuinely absent
      from the pathway — never one already present under a title the owner
      renamed — and adds nothing that was not explicitly selected, so a stage
      they deliberately deleted is offered again but never recreated on its own.
      The store applies that decision as a single set() of its result, so the
      shape protects the wiring the Node environment cannot import.
    test: offers only the course levels absent from an existing pathway and never a
      renamed one already present
  - id: ac-14
    description: Resolving a course entry's study source returns the existing
      Material when one already matches and mints a new one only when none does,
      so a second course item can never create a duplicate source. The store
      applies that decision as a single set() of its result.
    test: returns an existing study source when one matches and mints one only when
      none does
  - id: ac-15
    description: Every CGS stage id and catalogue key that existing data may
      reference is unchanged by the course import, so no already-added item is
      detached from its suggestion.
    test: CGS stage ids and catalog keys stay stable across the course import
  - id: ac-16
    description: "On the owner's own Mac and iPhone: Level 1B shows its real
      sections, 'Build one for where I am' matches the sections already added,
      running it at a changed duration keeps the syllabus proportions, a course
      video and a score open from a practice item over both the LAN and
      Tailscale routes, and the level's study appears in My repertoire while no
      exercise does."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - docs/cgs-course.md
  - docs/setar-archive.md
createdAt: 2026-09-21T22:37:01.810Z
amendments: []
---

# Bring the Classical Guitar Shed course into the Guitar pathway with its material, works and position-aware routines

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/32
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 4b5a88181047f85420a450b5393e5b1997630d43 on main _(never re-baselined)_
- **Intent:** 20260921-bring-the-classical-guitar-shed-course-i-9b18

## You may only change

- src/domain/courseSeed.ts
- src/domain/courseSeed.test.ts
- src/domain/courseData.ts
- src/domain/mediaRoots.ts
- src/domain/mediaRoots.test.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.ts
- src/domain/pathways.test.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/itemFiles.ts
- src/domain/itemFiles.test.ts
- src/domain/recordings.ts
- src/domain/recordings.test.ts
- src/domain/factories.ts
- src/domain/labels.ts
- src/domain/types.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/components/ItemMaterial.tsx
- src/components/RoutineDuration.tsx
- src/components/direction.test.ts
- src/pages/StageDetail.tsx
- src/pages/PathwayDetail.tsx
- src/pages/Today.tsx
- src/pages/Settings.tsx
- tests/daily-practice.browser.test.ts
- scripts/scan-cgs-course.mjs
- docs/cgs-course.md
- docs/setar-archive.md
- AGENTS.md

## Never touch

- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/scheduling.ts
- src/domain/sync.ts
- src/domain/canonical.ts
- src/domain/plan.ts
- src/domain/repertoire.ts
- src/domain/recommend.ts
- src/domain/scoring.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- src/store/gitRemote.ts
- src/pages/CloseBlock.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs

## Non-goals

- The Setar class archive keeps working exactly as it does now: no change to `sourceArchive.ts`, `sourceReconcile.ts`, the published index format, the scanner, the publisher, or the refresh/adoption flow.
- `getNasBaseUrl()` keeps its stored value and its meaning — it still names the Setar archive folder. Every existing lesson reference, `relativizeReference`, `archiveRootUrl`, `ReferenceEditor`, `Lessons` and `ArchiveRefresh` resolve byte-identically. The shared media root is DERIVED from it and never rewrites it.
- No schema change and no migration: `SCHEMA_VERSION` stays 14, `migrations.ts` and `io.ts` are forbidden by scope, and nothing new is persisted in `PracticeDB`. Catalogue, course data and syllabus routines are reference data in code; the media-root override is per-device localStorage.
- Level 1A's fourteen hand-authored steps and both of its existing routines stay exactly as they are.
- Stage ids and every catalogue key that existing data may reference stay byte-stable; a key is only ever added, never renamed, so no already-added item is orphaned from its suggestion.
- `reseedDefaultPathways` and its Repertoire button are NOT changed: they keep adding stages only for pathways that do not yet exist. Adding course levels is a separate, course-scoped action that never adds a stage on its own — it offers the levels the course has and the pathway does not, and adds only those the owner selects, so a stage they deliberately deleted can never be recreated without them choosing it.
- `isWork`, `repertoireWorks` and `repertoire.ts` are not changed — the repertoire fix is upstream, in what the catalogue declares.
- No bytes enter the app: no video, PDF, image or contrast card is ever attached, cached, synced or backed up. r-large-files-stay-on-nas holds unchanged.
- `addFromCatalog` keeps its contract: a catalogue item arrives `status: 'new'` with zero statistics and stays losslessly removable, so `isLosslesslyRemovable` and the Remove affordance keep working.
- Running a routine is otherwise unchanged: the same runner, the same frozen segment list, the same boundary signals, the same at-most-one-block-per-bound-item recording. Only the segment MINUTES may be scaled, never a label, note, essential flag or bound item.
- `segmentsForRun` keeps its exact meaning and signature — duration is a second, independent knob, not a replacement for essentials-only.
- The Session Plan is not touched and its allocator is not reused: `plan.ts` is forbidden, and only `validateBudgetMinutes` is imported from it so the duration control shares the 5-120 bound.
- Practising stays the only thing that completes a review or advances SM-2; nothing here writes a block, a result or a schedule.
- Today keeps its layout: the two doorway cards stay above the recommendation, both stay collapsed at about 50px, and the primary recommendation stays above the fold at 390x844.
- No recorded `dir` site is removed or reordered; any new group or isolate is added to `direction.test.ts`'s recorded inventories visibly, never silently.
- `scripts/scan-cgs-course.mjs` is a build-time tool only — stdlib, dry-run by default, never imported by or reachable from any runtime path in `src/`.
- Starting a block stays under 30 seconds and closing one under 60; no required field is added anywhere.
- No contrast-card viewer, flashcard player or media player of any kind — one folder reference per level's warm-up entry and nothing more.
- No second source-archive grammar, no published index, no scanner running inside the app, and no change to the Setar archive's scanner, publisher or refresh.
- No per-source media roots and no resolver fallback: one shared root, derived, with an override.
- No content for CGS levels the owner does not own. The architecture makes 4A-5F a data change; no placeholder stage, catalogue entry or routine is created for them.
- No Khonyagar/Tar course data, no Tar teacher-class import, no ArtistWorks import.
- No schema change, no migration, no new persisted collection and no new inbound-validation door.
- No change to the recommendation engine, the Session Plan, review scheduling or SM-2.
- No automatic creation of items, routines or stages: every one is created by an explicit owner action.
- No change to Today's doorway order, card heights or above-the-fold behaviour.
- No change to `reseedDefaultPathways` or the existing “restore default pathways” button.
- Desired rule (not yet truth): Course material is composed from the course's own published structure and never hand-linked or copied onto an item: a practice item created from a course catalogue entry shows that section's files because the catalogue says so, so regenerating the course reaches every item that already exists.
- Desired rule (not yet truth): There is ONE media root per device and every source is a folder beneath it, so a stored reference is always relative to its own source and adding a source never needs a new device setting, a per-source root or a resolver fallback.
- Desired rule (not yet truth): A course entry becomes repertoire only when the course itself names a specific work; sections that teach a skill are practice material and never appear in My repertoire, and a work carried forward across levels is introduced once and reused rather than suggested again.
- Desired rule (not yet truth): A routine's authored minutes are proportions, not a fixed length: it may be fitted to any session duration by scaling those proportions, dropping non-essential segments before essential ones, and never altering a segment's label, note, essential flag or bound item.

## Acceptance checks (definition of done)

- [ ] **ac-1** — A level's own study and its named packet works become repertoire works; every drill, exercise, rhythm, sight-reading and reading section from the same level does not. _(proof: a level's study and packet works are repertoire works and its drill sections are not)_
- [ ] **ac-2** — A work carried forward across levels is suggested once. Adding it from a later level reuses the existing item rather than creating a second work in My repertoire. _(proof: reuses a carried-forward work when it is added from a later level instead of duplicating it)_
- [ ] **ac-3** — Course material is composed live from the catalogue for a catalogue-linked item, and nothing is written onto the item — so regenerated course data reaches items that already exist. _(proof: composes a catalogue item's course files without storing any reference on the item)_
- [ ] **ac-4** — A course file resolves under the shared media root joined with the course's own media path, while an archive reference resolves against the unchanged archive base — both from the real configured values. _(proof: resolves a course file under the shared media root and leaves archive resolution unchanged)_
- [ ] **ac-5** — The media root is derived from the archive base, an explicit override wins over the derivation when set, and a base whose last segment names no known source yields no root at all rather than a guess. _(proof: prefers an explicit media root over the derived one and derives nothing from an unrecognised base)_
- [ ] **ac-6** — With no media root derivable or set, a course file is honestly unavailable rather than a dead link: the resolver reports no-base and the material row offers no open action. _(proof: reports no-base for a course file when no media root is derivable or set)_
- [ ] **ac-7** — The position routine is the previous level's essential segments plus only the current level's segments whose catalogue item the owner has actually added. _(proof: builds a position routine from added current-level items plus the previous level's essentials)_
- [ ] **ac-8** — A current-level segment whose catalogue item has not been added is absent from the position routine, while the level's full routine still contains it. _(proof: omits a current-level segment whose catalogue item has not been added)_
- [ ] **ac-9** — A segment is joined to its item by stage and catalogue key together, so an identically-keyed entry in another level is never matched. _(proof: joins a segment to its item by stage and catalogue key together, never by key alone)_
- [ ] **ac-10** — Adding one of a level's optional repertoire works changes nothing about the position routine, while adding one of its practice sections adds that section's segments — because a segment is matched by its OWN declared catalogue key, never by how many items the stage now holds. _(proof: ignores an added repertoire work when building the position routine and includes an added practice section)_
- [ ] **ac-11** — Fitting a routine to a target total yields minutes summing exactly to that target, and returns the routine unchanged when the target equals its authored total. _(proof: fits a routine to a target total exactly and leaves it unchanged at its authored total)_
- [ ] **ac-12** — When the target cannot seat every segment at a one-minute floor, non-essential segments are dropped before essential ones, and every surviving segment keeps its label, note, essential flag and bound item. _(proof: drops a non-essential segment before an essential one and preserves every surviving segment's identity)_
- [ ] **ac-13** — Adding new course levels OFFERS only the levels genuinely absent from the pathway — never one already present under a title the owner renamed — and adds nothing that was not explicitly selected, so a stage they deliberately deleted is offered again but never recreated on its own. The store applies that decision as a single set() of its result, so the shape protects the wiring the Node environment cannot import. _(proof: offers only the course levels absent from an existing pathway and never a renamed one already present)_
- [ ] **ac-14** — Resolving a course entry's study source returns the existing Material when one already matches and mints a new one only when none does, so a second course item can never create a duplicate source. The store applies that decision as a single set() of its result. _(proof: returns an existing study source when one matches and mints one only when none does)_
- [ ] **ac-15** — Every CGS stage id and catalogue key that existing data may reference is unchanged by the course import, so no already-added item is detached from its suggestion. _(proof: CGS stage ids and catalog keys stay stable across the course import)_
- [ ] **ac-16** — On the owner's own Mac and iPhone: Level 1B shows its real sections, 'Build one for where I am' matches the sections already added, running it at a changed duration keeps the syllabus proportions, a course video and a score open from a practice item over both the LAN and Tailscale routes, and the level's study appears in My repertoire while no exercise does. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- docs/cgs-course.md
- docs/setar-archive.md

## Amendments

_none_

