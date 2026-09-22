---
id: 20260922-bring-the-khonyagar-tar-course-into-its--56be
title: Bring the Khonyagar Tar course into its own Tar pathway with stable work
  identity and its complete material
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/34
intent: 20260922-bring-the-khonyagar-tar-course-into-its--56be
tier: heavy
stage: build
baseline:
  commit: 116040163e60d5d3c622e7eece04ee4595950ca0
  branch: main
branch: change/20260922-bring-the-khonyagar-tar-course-into-its--56be
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260922-bring-the-khonyagar-tar-course-into-its--56be
builder: claude
planHash: d6a117bf75c94649b1e9d56ab2a3967856af732981452f3668d16a72d5adc240
allowedPaths:
  - src/domain/khonyagarData.ts
  - src/domain/courseSeed.ts
  - src/domain/courseSeed.test.ts
  - src/domain/khonyagarCourse.test.ts
  - src/domain/pathwaySeed.ts
  - src/domain/pathways.test.ts
  - src/domain/mediaRoots.test.ts
  - src/pages/StageDetail.tsx
  - scripts/scan-khonyagar-course.mjs
  - docs/khonyagar-course.md
  - AGENTS.md
forbiddenPaths:
  - src/domain/courseData.ts
  - scripts/scan-cgs-course.mjs
  - scripts/scan-setar-classes.mjs
  - scripts/publish-setar-index.mjs
  - src/domain/migrations.ts
  - src/domain/io.ts
  - src/domain/types.ts
  - src/domain/sourceArchive.ts
  - src/domain/sourceReconcile.ts
  - src/domain/mediaRoots.ts
  - src/domain/recordings.ts
  - src/domain/itemFiles.ts
  - src/domain/pathways.ts
  - src/domain/factories.ts
  - src/domain/labels.ts
  - src/domain/seed.ts
  - src/domain/routines.ts
  - src/domain/scheduling.ts
  - src/domain/plan.ts
  - src/domain/repertoire.ts
  - src/store/useStore.ts
  - src/store/syncEngine.ts
  - src/store/githubSync.ts
  - src/pages/PathwayDetail.tsx
  - src/pages/Today.tsx
  - src/pages/Settings.tsx
  - src/pages/SessionPlan.tsx
  - src/pages/RoutineRunner.tsx
  - src/components/RoutineDuration.tsx
nonGoals:
  - "`tar-honarestan` is untouched: its ten stages, their ids, codes, titles and
    every catalogue key stay byte-identical, so any item the owner has already
    placed in them keeps its suggestion. `SEED_PATHWAY_IDS.tar` stays
    `tar-honarestan`, so the demo seed's Tar item keeps its stage."
  - "The Setar class archive and the Classical Guitar Shed course are untouched:
    `sourceArchive.ts`, `sourceReconcile.ts`, `courseData.ts`,
    `scan-setar-classes.mjs` and `scan-cgs-course.mjs` stay as they are. So does
    every CGS stage, key, work, work note, routine and routine name, and the
    title a CGS item is created with."
  - "No schema change and no migration: `SCHEMA_VERSION` stays where it is,
    `migrations.ts`, `io.ts` and `types.ts` are forbidden by scope, and nothing
    new is persisted in `PracticeDB`. The course is reference data in code."
  - "`getNasBaseUrl()` and the derived shared media root keep their current
    values and meaning. `tar-classes` is registered only because the course
    declares its own `mediaPath`, through the existing `knownSourceFolders()`
    derivation. There is no new device setting, no per-source root and no
    resolver fallback."
  - "`reseedDefaultPathways` and its Repertoire button are NOT changed. They
    already add a pathway that does not yet exist together with its stages,
    which is exactly how the new pathway reaches an existing database. A stage
    the owner deliberately deleted from an EXISTING pathway is still never
    resurrected."
  - "Every shared course function keeps its current behaviour and signature for
    CGS: `courseStageSeeds`, `courseFilesFor`, `planCatalogAddition`,
    `carriedCourseWorkItem`, `buildLevelRoutine`, `buildPositionRoutine`,
    `courseRoutineName` and `courseRoutine`. The new optional fields
    (`CourseWork.files`, `CourseWork.guidance`, `CourseWork.strand`,
    `CourseUnit.workTitle`) are absent from every CGS entry, so CGS output is
    byte-identical."
  - "Routine machinery and the Session Plan are untouched: `routines.ts`,
    `plan.ts`, `RoutineRunner.tsx`, `RoutineDuration.tsx` and `SessionPlan.tsx`
    are forbidden by scope."
  - "Work identity stays course-scoped: a Khonyagar work can never reuse, rename
    or absorb a CGS item or a Setar archive item. A Setar piece sharing its name
    stays a separate item on a separate instrument."
  - Every catalogue key, work key and stage id is pure ascii. Once shipped, a
    section key, stage id or work-row key is only ever added, never renamed or
    removed, and no work key is ever re-pointed at a different work.
    `seedMigration.test.ts` therefore passes unchanged, and no already-added
    item is ever orphaned or silently moved onto a different work.
  - "`addFromCatalog` keeps its contract: a catalogue item arrives `status:
    'new'` with zero statistics and stays losslessly removable, so
    `isLosslesslyRemovable`, the Remove affordance and the durable Undo keep
    working. An Undo still reaches only an item the tap created."
  - "No bytes enter the app: no video, PDF or image is ever attached, cached,
    synced or backed up. r-large-files-stay-on-nas holds unchanged."
  - Practising stays the only thing that completes a review or advances SM-2.
    Nothing here writes a block, a result or a schedule, and no imported section
    or work arrives with practice history.
  - 'Direction handling is unchanged: Farsi titles resolve natively through the
    existing `dir="auto"` groups. The `StageDetail.tsx` edit changes a condition
    only, and no recorded `dir` site or `direction.test.ts` inventory entry
    moves.'
  - "`scripts/scan-khonyagar-course.mjs` is a build-time tool only: stdlib,
    dry-run by default, never imported by or reachable from any runtime path in
    `src/`."
  - No dated teacher-class folder is imported, and no `Lesson` record is created
    by this lane.
  - No import of the dated teacher/class folders (`afshin-alavi`,
    `amir-sharifi`, `behrooz-hemati`, `ghasem-rahimzadeh`), and no `Lesson`
    record created. Their names, dates and instrument attribution are unresolved
    in the source itself.
  - No change to the Setar archive, or to the Classical Guitar Shed course data,
    scanner or publisher.
  - No schema change, no migration, no new persisted collection and no new
    inbound-validation door.
  - No new media root, no per-source root and no resolver fallback. The course
    declares its `mediaPath` and the existing derivation does the rest.
  - No generated Khonyagar routine, and no change to the routine machinery. The
    course's guide asks for block-shaped days built around the current lesson,
    not a tour of every section in a stage.
  - No change to the Session Plan's order, buckets or proportions to match the
    guide. That would change the plan for every instrument and is a separate
    decision. No copy in this lane claims the Session Plan follows the guide's
    blocks.
  - No UI change beyond the caption's condition in `StageDetail.tsx`. The
    existing stage, pathway and Today surfaces already render any course.
  - "No fabricated essential flags, per-section minutes or practice history. No
    translated or paraphrased guide text: it is quoted as written."
  - No transliteration of Farsi titles into keys, no positional work numbering,
    and no runtime title parsing. The grammar stays in the scanner and its
    conclusions are recorded.
  - No merge of two works on title similarity, including works that share an
    exact title (Ma'rufi's and the radif's چهارمضراب ماهور, the two رنگ شور
    sections, the three کرشمه sections). Ambiguous pairs are recorded as
    diagnostics for the owner.
  - No dastgāh, form or composer identity fields on Khonyagar entries in this
    lane. Its works group under their study source in My repertoire, and dastgāh
    grouping would be a later data change.
  - "No automatic creation of items, works, routines or stages: every one is
    created by an explicit owner action."
  - No change to `reseedDefaultPathways`, the recommendation engine, the Session
    Plan, review scheduling or SM-2.
  - "Desired rule (not yet truth): A course's work identity is explicit,
    recorded and permanent. Only an authored entry may join two sections or
    lessons into one work. Once shipped, no key an item holds is ever renamed or
    removed, and no work key is ever re-pointed at a different work; a later
    merge is an alias."
  - "Desired rule (not yet truth): A stored media path is the file's real name
    in the normalisation form the server actually serves, never the form a local
    filesystem happens to hold. A path that looks right in the repository and
    404s on the device is indistinguishable from correct until someone taps it."
  - "Desired rule (not yet truth): Repertoire comes from the works a course
    teaches, identified at the lesson. A section that teaches several works, or
    none, is never itself a repertoire piece, and a work taught inside it is
    never lost."
  - "Desired rule (not yet truth): Every identifier a course contributes is
    ascii and anchored in the source's own numbering, while every title the
    owner reads is in the course's own language."
  - "Desired rule (not yet truth): Course data accounts for its whole source:
    every section, lesson and score book exactly once. A scan that cannot
    reconcile the disk, the index and its own tables writes nothing."
acceptanceChecks:
  - id: ac-1
    description: Every media path in the generated Khonyagar data is NFC-normalised,
      which is the form the NAS serves, and lies inside the course's own folder
      with no `..` segment. A decomposed path would 404 while looking correct in
      the repository.
    test: every Khonyagar media path is NFC-normalised and inside the course folder
  - id: ac-2
    description: Every Khonyagar catalogue key, work key and stage id is pure ascii,
      while its stage codes, titles and names are Farsi. The existing ascii
      invariant holds and the display stays in the course's own language.
    test: Khonyagar keys and stage ids are pure ascii while its titles are Farsi
  - id: ac-3
    description: The generated data accounts for the whole source, with the counts
      written as literals. There are exactly 106 sections, `s001`–`s106`. The
      lesson numbers read from the section video paths are exactly 1–259, each
      exactly once, contiguous and in order within each section. Exactly the
      four score books appear and each is referenced at least once. Every work's
      files are a subset of the sections' files. Dropping, duplicating or
      misplacing one lesson fails.
    test: accounts for all 106 sections, each of the 259 lessons exactly once and
      all four score books
  - id: ac-4
    description: Work identity is anchored and permanent, checked against a literal
      ledger written in the test and never derived from the data. Every shipped
      work-row key (the key an item holds as its `catalogKey`) still exists.
      Every ledgered work key `wNNN` that still resolves names a work whose
      lessons include lesson NNN. Reordering the table changes nothing. Removing
      a shipped work row, or re-pointing any key at a work without its anchor
      lesson, fails. Joining a work that is a section into another identity is
      still allowed.
    test: every shipped Khonyagar work row still exists and every shipped work key
      keeps its anchor lesson
  - id: ac-5
    description: Every (stage id, section key) pair in a literal ledger of shipped
      pairs is still present, so a later boundary change cannot orphan an item's
      material.
    test: every shipped Khonyagar section stays in the stage it shipped in
  - id: ac-6
    description: A work taught across several sections is one repertoire item,
      titled with the work's own name whichever of its sections is added first
      (a part or a performance included). It carries every section's files, each
      distinct file exactly once.
    test: a work spanning several sections is one item titled with the work carrying
      every section's files once
  - id: ac-7
    description: Two distinct files are both kept when their titles match, and one
      file referenced from two entries appears once. Deduplication is by path,
      never by title.
    test: keeps two distinct files whose titles match and never repeats one path
  - id: ac-8
    description: A mixed section yields each work it teaches as that work's own row,
      and the section itself is no work. Section 17 yields two works, from
      lessons 109 and 110. پیش‌درآمد ابوعطا is one row carrying exactly lessons
      124 and 125, although they sit in sections 21 and 22, and neither of those
      sections is a work.
    test: a mixed section yields each work it teaches as its own row and becomes no
      work itself
  - id: ac-9
    description: No Khonyagar section carries a repertoire strand (`piece`,
      `repertoire` or `radif`) unless it carries a work identity, so a section
      title never reaches My repertoire as a fake piece.
    test: no Khonyagar section carries a repertoire strand unless it is a work
  - id: ac-10
    description: A performance or continuation section joins only the work an
      explicit table entry names. Two titles differing solely by ZWNJ or spacing
      (sections 52–55 and 56) are not merged unless an entry says so.
    test: joins a performance section only where the work table says so and never
      merges on a ZWNJ difference
  - id: ac-11
    description: Two works that share a title stay separate items. Ma'rufi's
      چهارمضراب ماهور (section 26) and the radif's (sections 95–104) resolve to
      different identities, and adding one never reuses or lists the other's
      material.
    test: keeps two distinct works that share a title apart
  - id: ac-12
    description: A Khonyagar work never reuses an item belonging to another course
      or to the Setar archive, even when the titles are identical, because work
      reuse is scoped to the course.
    test: a Khonyagar work never reuses an item from another course or instrument
  - id: ac-13
    description: Every Khonyagar stage builds an empty level routine and an empty
      position routine, even with every one of its sections added, so the stage
      offers neither routine action. Every Guitar level still builds its own
      non-empty routine exactly as before.
    test: a Khonyagar stage builds no routine while every Guitar level still builds
      its own
  - id: ac-14
    description: Every Khonyagar work's catalogue notes are its own lesson-type
      guidance from the course's guide, and never the Guitar course's English
      practice-packet sentence. Guitar works keep that sentence.
    test: a Khonyagar work carries its own guidance and never the Guitar packet note
  - id: ac-15
    description: The existing Tar Honarestan pathway keeps every stage id, code,
      title and catalogue key it has today. The Classical Guitar Shed course
      keeps every stage, key, work, work note, routine, routine name and
      item-creation title it has today.
    test: leaves the Honarestan pathway and the Guitar course entirely unchanged
  - id: ac-16
    description: The Khonyagar course declares its own media folder, so
      `tar-classes` is a known source folder derived from `COURSES`, with no new
      device setting and no change to the archive base.
    test: registers tar-classes as a known source folder without changing the
      archive base
  - id: ac-17
    description: >-
      On the owner's own Mac and iPhone:

      - the Khonyagar pathway appears after restoring default pathways;

      - a section's lesson videos and its band's score book open from a practice
      item over both the LAN and Tailscale routes;

      - the radif's چهارمضراب ماهور appears once in My repertoire, under its own
      name and carrying all seven sections' videos, while Ma'rufi's stays a
      separate suggestion and the Setar item of that name is untouched;

      - پیش‌درآمد ابوعطا is its own row beside the exercise sections that
      contain it;

      - Khonyagar stages show no routine buttons and no routine caption;

      - a 30-minute Tar session from "Plan this session" is built only from Tar
      items, with a warm-up first and a cool-down last only when an item
      qualifies, and due reviews and current work in between by priority. It is
      not expected to follow the guide's block order, and nothing on screen
      claims it does;

      - the Honarestan pathway and all Setar and Guitar data are visibly
      unchanged.
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - docs/khonyagar-course.md
createdAt: 2026-09-22T21:24:44.625Z
amendments: []
---

# Bring the Khonyagar Tar course into its own Tar pathway with stable work identity and its complete material

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/34
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 116040163e60d5d3c622e7eece04ee4595950ca0 on main _(never re-baselined)_
- **Intent:** 20260922-bring-the-khonyagar-tar-course-into-its--56be

## You may only change

- src/domain/khonyagarData.ts
- src/domain/courseSeed.ts
- src/domain/courseSeed.test.ts
- src/domain/khonyagarCourse.test.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/domain/mediaRoots.test.ts
- src/pages/StageDetail.tsx
- scripts/scan-khonyagar-course.mjs
- docs/khonyagar-course.md
- AGENTS.md

## Never touch

- src/domain/courseData.ts
- scripts/scan-cgs-course.mjs
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/types.ts
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/mediaRoots.ts
- src/domain/recordings.ts
- src/domain/itemFiles.ts
- src/domain/pathways.ts
- src/domain/factories.ts
- src/domain/labels.ts
- src/domain/seed.ts
- src/domain/routines.ts
- src/domain/scheduling.ts
- src/domain/plan.ts
- src/domain/repertoire.ts
- src/store/useStore.ts
- src/store/syncEngine.ts
- src/store/githubSync.ts
- src/pages/PathwayDetail.tsx
- src/pages/Today.tsx
- src/pages/Settings.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- src/components/RoutineDuration.tsx

## Non-goals

- `tar-honarestan` is untouched: its ten stages, their ids, codes, titles and every catalogue key stay byte-identical, so any item the owner has already placed in them keeps its suggestion. `SEED_PATHWAY_IDS.tar` stays `tar-honarestan`, so the demo seed's Tar item keeps its stage.
- The Setar class archive and the Classical Guitar Shed course are untouched: `sourceArchive.ts`, `sourceReconcile.ts`, `courseData.ts`, `scan-setar-classes.mjs` and `scan-cgs-course.mjs` stay as they are. So does every CGS stage, key, work, work note, routine and routine name, and the title a CGS item is created with.
- No schema change and no migration: `SCHEMA_VERSION` stays where it is, `migrations.ts`, `io.ts` and `types.ts` are forbidden by scope, and nothing new is persisted in `PracticeDB`. The course is reference data in code.
- `getNasBaseUrl()` and the derived shared media root keep their current values and meaning. `tar-classes` is registered only because the course declares its own `mediaPath`, through the existing `knownSourceFolders()` derivation. There is no new device setting, no per-source root and no resolver fallback.
- `reseedDefaultPathways` and its Repertoire button are NOT changed. They already add a pathway that does not yet exist together with its stages, which is exactly how the new pathway reaches an existing database. A stage the owner deliberately deleted from an EXISTING pathway is still never resurrected.
- Every shared course function keeps its current behaviour and signature for CGS: `courseStageSeeds`, `courseFilesFor`, `planCatalogAddition`, `carriedCourseWorkItem`, `buildLevelRoutine`, `buildPositionRoutine`, `courseRoutineName` and `courseRoutine`. The new optional fields (`CourseWork.files`, `CourseWork.guidance`, `CourseWork.strand`, `CourseUnit.workTitle`) are absent from every CGS entry, so CGS output is byte-identical.
- Routine machinery and the Session Plan are untouched: `routines.ts`, `plan.ts`, `RoutineRunner.tsx`, `RoutineDuration.tsx` and `SessionPlan.tsx` are forbidden by scope.
- Work identity stays course-scoped: a Khonyagar work can never reuse, rename or absorb a CGS item or a Setar archive item. A Setar piece sharing its name stays a separate item on a separate instrument.
- Every catalogue key, work key and stage id is pure ascii. Once shipped, a section key, stage id or work-row key is only ever added, never renamed or removed, and no work key is ever re-pointed at a different work. `seedMigration.test.ts` therefore passes unchanged, and no already-added item is ever orphaned or silently moved onto a different work.
- `addFromCatalog` keeps its contract: a catalogue item arrives `status: 'new'` with zero statistics and stays losslessly removable, so `isLosslesslyRemovable`, the Remove affordance and the durable Undo keep working. An Undo still reaches only an item the tap created.
- No bytes enter the app: no video, PDF or image is ever attached, cached, synced or backed up. r-large-files-stay-on-nas holds unchanged.
- Practising stays the only thing that completes a review or advances SM-2. Nothing here writes a block, a result or a schedule, and no imported section or work arrives with practice history.
- Direction handling is unchanged: Farsi titles resolve natively through the existing `dir="auto"` groups. The `StageDetail.tsx` edit changes a condition only, and no recorded `dir` site or `direction.test.ts` inventory entry moves.
- `scripts/scan-khonyagar-course.mjs` is a build-time tool only: stdlib, dry-run by default, never imported by or reachable from any runtime path in `src/`.
- No dated teacher-class folder is imported, and no `Lesson` record is created by this lane.
- No import of the dated teacher/class folders (`afshin-alavi`, `amir-sharifi`, `behrooz-hemati`, `ghasem-rahimzadeh`), and no `Lesson` record created. Their names, dates and instrument attribution are unresolved in the source itself.
- No change to the Setar archive, or to the Classical Guitar Shed course data, scanner or publisher.
- No schema change, no migration, no new persisted collection and no new inbound-validation door.
- No new media root, no per-source root and no resolver fallback. The course declares its `mediaPath` and the existing derivation does the rest.
- No generated Khonyagar routine, and no change to the routine machinery. The course's guide asks for block-shaped days built around the current lesson, not a tour of every section in a stage.
- No change to the Session Plan's order, buckets or proportions to match the guide. That would change the plan for every instrument and is a separate decision. No copy in this lane claims the Session Plan follows the guide's blocks.
- No UI change beyond the caption's condition in `StageDetail.tsx`. The existing stage, pathway and Today surfaces already render any course.
- No fabricated essential flags, per-section minutes or practice history. No translated or paraphrased guide text: it is quoted as written.
- No transliteration of Farsi titles into keys, no positional work numbering, and no runtime title parsing. The grammar stays in the scanner and its conclusions are recorded.
- No merge of two works on title similarity, including works that share an exact title (Ma'rufi's and the radif's چهارمضراب ماهور, the two رنگ شور sections, the three کرشمه sections). Ambiguous pairs are recorded as diagnostics for the owner.
- No dastgāh, form or composer identity fields on Khonyagar entries in this lane. Its works group under their study source in My repertoire, and dastgāh grouping would be a later data change.
- No automatic creation of items, works, routines or stages: every one is created by an explicit owner action.
- No change to `reseedDefaultPathways`, the recommendation engine, the Session Plan, review scheduling or SM-2.
- Desired rule (not yet truth): A course's work identity is explicit, recorded and permanent. Only an authored entry may join two sections or lessons into one work. Once shipped, no key an item holds is ever renamed or removed, and no work key is ever re-pointed at a different work; a later merge is an alias.
- Desired rule (not yet truth): A stored media path is the file's real name in the normalisation form the server actually serves, never the form a local filesystem happens to hold. A path that looks right in the repository and 404s on the device is indistinguishable from correct until someone taps it.
- Desired rule (not yet truth): Repertoire comes from the works a course teaches, identified at the lesson. A section that teaches several works, or none, is never itself a repertoire piece, and a work taught inside it is never lost.
- Desired rule (not yet truth): Every identifier a course contributes is ascii and anchored in the source's own numbering, while every title the owner reads is in the course's own language.
- Desired rule (not yet truth): Course data accounts for its whole source: every section, lesson and score book exactly once. A scan that cannot reconcile the disk, the index and its own tables writes nothing.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Every media path in the generated Khonyagar data is NFC-normalised, which is the form the NAS serves, and lies inside the course's own folder with no `..` segment. A decomposed path would 404 while looking correct in the repository. _(proof: every Khonyagar media path is NFC-normalised and inside the course folder)_
- [ ] **ac-2** — Every Khonyagar catalogue key, work key and stage id is pure ascii, while its stage codes, titles and names are Farsi. The existing ascii invariant holds and the display stays in the course's own language. _(proof: Khonyagar keys and stage ids are pure ascii while its titles are Farsi)_
- [ ] **ac-3** — The generated data accounts for the whole source, with the counts written as literals. There are exactly 106 sections, `s001`–`s106`. The lesson numbers read from the section video paths are exactly 1–259, each exactly once, contiguous and in order within each section. Exactly the four score books appear and each is referenced at least once. Every work's files are a subset of the sections' files. Dropping, duplicating or misplacing one lesson fails. _(proof: accounts for all 106 sections, each of the 259 lessons exactly once and all four score books)_
- [ ] **ac-4** — Work identity is anchored and permanent, checked against a literal ledger written in the test and never derived from the data. Every shipped work-row key (the key an item holds as its `catalogKey`) still exists. Every ledgered work key `wNNN` that still resolves names a work whose lessons include lesson NNN. Reordering the table changes nothing. Removing a shipped work row, or re-pointing any key at a work without its anchor lesson, fails. Joining a work that is a section into another identity is still allowed. _(proof: every shipped Khonyagar work row still exists and every shipped work key keeps its anchor lesson)_
- [ ] **ac-5** — Every (stage id, section key) pair in a literal ledger of shipped pairs is still present, so a later boundary change cannot orphan an item's material. _(proof: every shipped Khonyagar section stays in the stage it shipped in)_
- [ ] **ac-6** — A work taught across several sections is one repertoire item, titled with the work's own name whichever of its sections is added first (a part or a performance included). It carries every section's files, each distinct file exactly once. _(proof: a work spanning several sections is one item titled with the work carrying every section's files once)_
- [ ] **ac-7** — Two distinct files are both kept when their titles match, and one file referenced from two entries appears once. Deduplication is by path, never by title. _(proof: keeps two distinct files whose titles match and never repeats one path)_
- [ ] **ac-8** — A mixed section yields each work it teaches as that work's own row, and the section itself is no work. Section 17 yields two works, from lessons 109 and 110. پیش‌درآمد ابوعطا is one row carrying exactly lessons 124 and 125, although they sit in sections 21 and 22, and neither of those sections is a work. _(proof: a mixed section yields each work it teaches as its own row and becomes no work itself)_
- [ ] **ac-9** — No Khonyagar section carries a repertoire strand (`piece`, `repertoire` or `radif`) unless it carries a work identity, so a section title never reaches My repertoire as a fake piece. _(proof: no Khonyagar section carries a repertoire strand unless it is a work)_
- [ ] **ac-10** — A performance or continuation section joins only the work an explicit table entry names. Two titles differing solely by ZWNJ or spacing (sections 52–55 and 56) are not merged unless an entry says so. _(proof: joins a performance section only where the work table says so and never merges on a ZWNJ difference)_
- [ ] **ac-11** — Two works that share a title stay separate items. Ma'rufi's چهارمضراب ماهور (section 26) and the radif's (sections 95–104) resolve to different identities, and adding one never reuses or lists the other's material. _(proof: keeps two distinct works that share a title apart)_
- [ ] **ac-12** — A Khonyagar work never reuses an item belonging to another course or to the Setar archive, even when the titles are identical, because work reuse is scoped to the course. _(proof: a Khonyagar work never reuses an item from another course or instrument)_
- [ ] **ac-13** — Every Khonyagar stage builds an empty level routine and an empty position routine, even with every one of its sections added, so the stage offers neither routine action. Every Guitar level still builds its own non-empty routine exactly as before. _(proof: a Khonyagar stage builds no routine while every Guitar level still builds its own)_
- [ ] **ac-14** — Every Khonyagar work's catalogue notes are its own lesson-type guidance from the course's guide, and never the Guitar course's English practice-packet sentence. Guitar works keep that sentence. _(proof: a Khonyagar work carries its own guidance and never the Guitar packet note)_
- [ ] **ac-15** — The existing Tar Honarestan pathway keeps every stage id, code, title and catalogue key it has today. The Classical Guitar Shed course keeps every stage, key, work, work note, routine, routine name and item-creation title it has today. _(proof: leaves the Honarestan pathway and the Guitar course entirely unchanged)_
- [ ] **ac-16** — The Khonyagar course declares its own media folder, so `tar-classes` is a known source folder derived from `COURSES`, with no new device setting and no change to the archive base. _(proof: registers tar-classes as a known source folder without changing the archive base)_
- [ ] **ac-17** — On the owner's own Mac and iPhone:
- the Khonyagar pathway appears after restoring default pathways;
- a section's lesson videos and its band's score book open from a practice item over both the LAN and Tailscale routes;
- the radif's چهارمضراب ماهور appears once in My repertoire, under its own name and carrying all seven sections' videos, while Ma'rufi's stays a separate suggestion and the Setar item of that name is untouched;
- پیش‌درآمد ابوعطا is its own row beside the exercise sections that contain it;
- Khonyagar stages show no routine buttons and no routine caption;
- a 30-minute Tar session from "Plan this session" is built only from Tar items, with a warm-up first and a cool-down last only when an item qualifies, and due reviews and current work in between by priority. It is not expected to follow the guide's block order, and nothing on screen claims it does;
- the Honarestan pathway and all Setar and Guitar data are visibly unchanged. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- docs/khonyagar-course.md

## Amendments

_none_

