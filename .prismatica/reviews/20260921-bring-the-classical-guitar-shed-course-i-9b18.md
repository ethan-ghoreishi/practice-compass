---
id: 20260921-bring-the-classical-guitar-shed-course-i-9b18
contractId: 20260921-bring-the-classical-guitar-shed-course-i-9b18
patchId: b771e105b84674a6c178dc94b19c91f58d15e8ee
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: carried-work identity and reversible catalogue actions
    summary: Study sections and packet entries for the same work still create
      independent repertoire items.
    counterexample: On HEAD 742d461, planCatalogAddition creates distinct full_piece
      items for cgs-3b/piece and cgs-3b/work-lecuona-malaguena, both referencing
      the same score PDF. Adding cgs-2e/piece followed by
      cgs-3f/work-carulli-valse-op-50-no-7-1 also duplicates Carulli Valse Op.50
      No.7. courseSeed.ts:556-561 only reuses identical packet keys. Sweep both
      addition orders, stage display, material/routine bindings and reversible
      actions while preserving existing keys.
  - family: specific-work repertoire classification
    summary: A section containing two distinct works still becomes one full_piece
      repertoire item.
    counterexample: On HEAD 742d461, cgs-3a/piece is titled Tarrega Study in C +
      Canon in D and itemFromCatalogEntry makes isWork true. studiesFrom splits
      two names, but scan-cgs-course.mjs:579 rejoins them and retains strand
      piece because skipped is null. The stage already offers both individual
      packet works. Apply the no-single-work rule to multi-study sections while
      preserving the section key and material access.
createdAt: 2026-09-22T00:41:35.948Z
sealedAt: 2026-09-22T00:50:00.371Z
---

# Review: Bring the Classical Guitar Shed course into the Guitar pathway with its material, works and position-aware routines

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260921-bring-the-classical-guitar-shed-course-i-9b18
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/32
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `b771e105b84674a6c178dc94b19c91f58d15e8ee`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Bring the Classical Guitar Shed course into the Guitar pathway with its material, works and position-aware routines

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Import and integrate the Classical Guitar Shed course into Practice Compass (and assess Khonyagar/Tar where it materially affects the architecture, without forcing it into this lane unless that is the better design).
> 
> - Classical Guitar repertoire: each level contains genuine pieces that could belong in my own Classical Guitar repertoire, alongside exercises/practice material that should not. Work out the most useful and sustainable distinction and how those pieces should enter and behave in Practice Compass.
> - Learning material: work out the best long-term way for the relevant CGS videos, PDFs and other files to be associated with practice items/course material after this lane. Do not default to manual link entry if a safer and more maintainable source-aware approach is possible.
> - Partial progression and routines: support the reality that I may be part-way through a level while maintaining selected material from earlier levels. Use the course's own structure and guidance where useful, but optimise for actual day-to-day practice.
> - Routine duration: I would ideally like a generated/selected routine to have a default total length, but also let me change the overall duration easily, somewhat like "Plan this session". Work out whether this should reuse existing session-planning logic, scale routine segments, offer presets, or another simpler/most optimal approach. Avoid duplicating concepts unnecessarily and preserve the usefulness of essentials / "Short on time".
> - Future CGS levels: I currently only own/download Levels 1A-3F, but Classical Guitar Shed appears to continue to around 5F / ~30 levels. I may buy the remaining levels later, probably not for quite some time. Assess whether the proposed course-data/scanner architecture makes adding future levels straightforward. Avoid premature work for content I do not yet have, but if a small architectural improvement now would make later expansion substantially cleaner or safer, incorporate it.
> - NAS/media: verify the actual media-root situation rather than assuming. My NAS exposes video-courses through https://192.168.0.20:5010/ (Mac) and https://ds220plus.taild1d1f7.ts.net/media (iPhone/Tailscale); the tree contains setar, tar and classical-guitar folders. Determine the actual URL mapping and whether one shared video-courses root plus source-relative paths is cleaner than separate per-source roots. Preserve existing Setar behaviour and device-local configuration.
> - Flexibility and future change: anticipate progressing through levels, revisiting old material, course-file changes, new repertoire, different course structures, additional Guitar/Tar sources and future media access. Reconsider any assumption that depends on the course having exactly 18 levels or a fixed source layout. Avoid brittle assumptions or unnecessary new machinery.
> 
> Investigate whether existing pathway, catalogue, routine, repertoire, source/media and practice-item concepts can be extended cleanly before introducing new concepts or schemas. Prefer a complete, coherent user experience over a narrowly minimal diff, while keeping complexity justified. Anticipate issues up front so the builder and reviewer do not go back and forth.

## Why

The owner practises Classical Guitar daily from an offline copy of the Classical Guitar Shed "Woodshed" course (currently Levels 1A-3F: 193 lesson sections, 431 videos, 108 PDFs), and is part-way through Level 1B (`05_Scales`). The app already seeds a CGS pathway with every one of those levels as a stage — but only Level 1A has real content. Levels 1B-3F carry eight generic placeholders each ("Chords", "Arpeggios", "Piece"...) produced by `cgsOutline()` with one boilerplate sentence, no course material, no named works and no routine. The pathway that is meant to be the trust anchor tells the owner nothing they do not already know, and everything useful — which video, which score, which piece, what to do today — lives outside the app.

Five findings from reading the real folders, probing the real NAS and reading the real code decided this design.

FIRST, the course is not an archive and must not reuse the Setar archive machinery. `sourceArchive.ts`'s own comment says so. The Setar index exists because that source GROWS, gets RENAMED, and carries piece identity to reconcile against existing repertoire. The Shed is a downloaded course with no dates, no roster and nothing to reconcile — and its metadata is already on disk: every one of the 237 `notes.md` files lists its own section title, guidance, videos and sheet music BY NAME, and every `LEVEL_GUIDE.md` encodes core/rotation/reference with time budgets. There is no filename to parse and nothing to publish. So the course belongs on the rung `pathwaySeed.ts` already stands on: reference data in code, generated by a stdlib scanner, with no persisted graph, no new validation door and no schema change.

SECOND, the repertoire distinction is already in the type system and is being got WRONG by the current seed, not by the app. `isWork` = top-level AND (`full_piece` | `gusheh` | Persian identity), and `STRAND_TO_ITEM_TYPE` maps `strand: 'piece'` to `full_piece` — so today's generic "Piece" suggestion, if added, creates a repertoire work literally titled "Piece". The correct distinction is derivable from the source rather than curated: each Piece section's H1 names the level's OWN study ("1A Piece ... The Forest Glade", "2D Piece: Study #9") and its "## Sheet Music" list names the optional packet works with their composers (Sor Op.35 No.1, Carulli Op.241 No.1, Bach Minuet in G, Ferrer Ejercicio — around sixty across the course). Those are works; every drill, exercise, rhythm, sight-reading and reading section is practice material and must never reach repertoire. `repertoire.ts` and `isWork` need no change.

THIRD, the partial-level problem needs no new stored concept, because the course already solves it and the app already records the position. Level 1A ships TWO progressive routines ("Stage #1", "Stage #2" — Stage #2 introduces material Stage #1 has not met), 1E and 1F ship two rotation routines each, every level's routine opens with "Review Right Hand Movements (see list above)", and each level's Main Practice Areas list enumerates the carried-forward skills by name. The previous-level maintenance the owner already does by instinct is written into the syllabus rather than invented here. And "up to the folder I have watched" is already recorded: the catalogue-to-item flow IS the position marker, and `stageUnits`/`itemStageState` already render it.

FOURTH — and this reverses an assumption an earlier draft of this plan made — THE GUITAR TREE IS ALREADY SERVED, and there is ONE shared media root, not one per source. Probed directly: `https://192.168.0.20:5010/` returns 200 and IS the `video-courses` root; `setar-classes/`, `classical-guitar/` and `tar-classes/` all return 200 beneath it; and a real lesson video, `classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4`, returns `206 video/mp4`. The owner's iPhone reaches the same tree at `https://ds220plus.taild1d1f7.ts.net/media`. So the configured Setar base is exactly `<media root>/setar-classes` — root plus source folder — which is why `docs/setar-archive.md`'s own worked example uses a `/media/` path prefix. Separate per-source roots would therefore be a mistake: they would add one device setting per course forever, to describe folders that already sit side by side under one root the device is already configured to reach. One shared root plus a course-relative path is both simpler and more flexible, and it means adding Khonyagar or ArtistWorks later needs no device configuration at all. Better still, the root need not be asked for: it is the parent of the archive base the owner already set, so it is DERIVED by default and shown on screen with a Browse action, with an explicit override field for the case where the derivation does not apply. The archive base itself, and every Setar and lesson code path that reads it, is left byte-for-byte untouched.

FIFTH, nothing should be bound to eighteen levels or to this course's particular layout. The Shed continues to roughly 5F, and the owner may buy more. Two cheap changes make that a data change instead of a code change. (a) The generated course data is shaped as ordered GROUPS of UNITS with a `mediaPath`, not as "levels" — which costs nothing now and is also the shape Khonyagar's flat 106-section index needs, so a second course is a second reader plus data, never new machinery. (b) nothing today can add a level to a pathway that already exists: `reseedDefaultPathways` adds stages only for pathways that do not exist yet (`newIds.has(x.pathwayId)`), and `addStage` mints a random `newId()` that could never match the deterministic `stageIdFor('cgs','4a')` the catalogue is keyed by. The answer is a SEPARATE, course-scoped action on the pathway — “Add new levels from this course” — and deliberately NOT an extension of `reseedDefaultPathways`. Making that shipped button additive would change what it does to every existing pathway, and because a stage the owner DELIBERATELY DELETED has an absent deterministic id exactly like a never-seeded one, it would silently resurrect it. The new action cannot do that, because it does not add anything on its own: it OFFERS the course levels absent from the pathway and adds only the ones the owner selects. A deleted stage therefore reappears in a list, never in the pathway, and only if they choose it. That is the difference between “re-run the scanner, ship, tick the new levels” and “write a migration” when Levels 4A-5F arrive.

Routine duration follows the same discipline: extend, do not duplicate. `startRoutineRun(routineId, shortOnTime, authoredSegments)` ALREADY takes the segments from its caller, so fitting a routine to a chosen total needs no store change at all — the caller passes scaled segments and the runner freezes them exactly as it freezes authored ones. The Session Plan's `allocateMinutes` is deliberately NOT reused: it allocates by bucket priority with a pinned warm-up share and a 2-25 minute clamp, which would distort a 1-minute syllabus segment and entangle two systems the app keeps as separate peers on purpose. What IS reused is `validateBudgetMinutes` and its 5-120 bound, imported from `plan.ts`, so the duration control rejects exactly what "Plan this session" rejects. The new `fitRoutineToMinutes` scales proportionally to the authored minutes — preserving the syllabus's own proportions, which is the whole point of a curriculum routine — and when the target cannot seat every segment at a one-minute floor it drops using the routine's own existing priority: non-essential first, latest first, so the `***` rule keeps meaning what it means. It composes with `segmentsForRun` rather than replacing it: essentials-only is a content decision, duration is a time decision, and they stay two independent knobs.

Khonyagar is assessed and deliberately NOT built. It is a better-structured source than the Shed (259 videos with clean Farsi titles already in the filenames, a 106-section index, four score PDFs, and a Tar pathway seed that already names it), which is exactly why it should follow as a data lane rather than widen this one — the group/unit course shape and the shared media root are chosen so it needs no new machinery. Its four teacher folders are real dated classes belonging to `log-a-class`, and `behrooz-hemati` carries a Setar book, so its instrument needs confirming first.

## Today

The Classical Guitar Shed pathway exists with a stage for every level the owner owns (1A-3F) but is nearly empty of real content. Levels 1B-3F each show the same eight generic suggestions produced by `cgsOutline()` in `pathwaySeed.ts`, each carrying one boilerplate sentence. Only Level 1A has hand-authored steps, and only Level 1A has routines.

Concretely, today:
- Adding the generic "Piece" suggestion creates a practice item literally titled "Piece" with `itemType: 'full_piece'`, so `isWork` is true and it appears in My repertoire as a work called "Piece". The course's real works — The Forest Glade, Study #1, Sor Op.35 No.1, Bach Minuet in G, Ferrer Ejercicio and around sixty more, each already named with its composer in the course's own `notes.md` — are not in the app at all.
- No course file reaches a practice item, even though the whole tree is already served by the NAS. `itemFiles` composes only what the Setar archive graph scopes to a piece, the item's own hand-entered references, and the references of linked lessons; a Guitar item has none of those, so its Material section is empty and the owner leaves the app to find the video or the score.
- There is one NAS setting per device and it names the Setar archive folder. Nothing knows that the folder above it is the shared `video-courses` root that also holds `classical-guitar` and `tar-classes`, and `isSafeRelativeReference` refuses `..`, so no guitar path can be expressed at all.
- Sixteen of the eighteen levels have no routine, and there is no way to get one for a level you are only part-way through. The owner is at Level 1B section `05_Scales` and assembles this by hand outside the app each day.
- A routine runs at exactly its authored length. `segmentsForRun` can drop non-essential segments, but there is no way to say "run this in 12 minutes" or "give me 45 today".
- New levels cannot reach an existing database. `reseedDefaultPathways` adds stages only for pathways that do not already exist, and `addStage` mints a random id that no catalogue entry could ever be keyed to.
- Nothing links a Guitar item to a study source, so any Guitar work groups in My repertoire under "No study source yet".

## Instead

Each Classical Guitar Shed level offers what the course itself teaches there, the day's practice can be built from where the owner actually is and run for the time they actually have, and buying more levels later is a data change.

- A stage lists the level's real sections from the course's own `notes.md` — title, practice guidance and the syllabus target BPM — instead of eight generic placeholders. Existing catalogue keys are preserved wherever a real section maps onto one, so items already added stay attached to their suggestion.
- The level's own study (The Forest Glade, Study #1, Study #9...) and the named packet works with their composers are their OWN catalogue entries and become `full_piece` items, so they — and only they — appear in My repertoire, grouped under a "Classical Guitar Shed" study source that `addFromCatalog` finds-or-creates on first use. Every drill, exercise, reading and sight-reading section stays `technique`/`exercise`/`body`/`other` and never reaches repertoire. A work carried forward across levels (Ferrer Ejercicio runs 2C-2F) is introduced once, and adding it from a later level reuses the existing item rather than creating a second work.
- Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed LIVE from the catalogue by `itemFiles` and never written onto the item — so regenerating the course data reaches items that already exist, and the owner never types a link. Files stay on the NAS: no bytes enter the app, sync or a backup.
- Those files resolve under the ONE shared media root the device already reaches, joined with the course's own `mediaPath`. The root is derived from the archive base the owner already configured, shown on screen with a Browse action, and overridable if the derivation does not apply. The archive base and every Setar and lesson code path that reads it are untouched, and no new device setting is needed for any future course.
- A stage offers "Use this level's routine" (the syllabus's own routine, with the `***` segments marked essential so "Short on time" keeps working) and "Build one for where I am" — the previous level's essentials plus only the current level's sections the owner has actually added, joined on stage and catalogue key together. Both write an ordinary, editable routine; neither is a live view, and Level 1A's two existing routines are untouched.
- Any routine can be run at a chosen total. Its authored length is the default, so doing nothing behaves exactly as today; changing it scales the segments proportionally so the syllabus's own proportions survive, and when the time is too short to seat them all it drops non-essential segments before essential ones. Duration and "Short on time" stay two independent knobs with their existing meanings.
- When the owner later buys Levels 4A-5F, re-running the scanner and shipping the regenerated data is enough: the pathway's stage list comes from that data, and a course-scoped "Add new levels from this course" action on the pathway adds only the levels genuinely missing, leaving every stage they have edited alone. The existing "restore default pathways" button is not redefined.
- Level 3 stages, whose syllabi carry a New/Detailing/Maintenance repertoire page and no minute-by-minute routine, say so and lean on item status and the Session Plan rather than being given a fabricated routine.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- VERIFIED, not assumed: `https://192.168.0.20:5010/` returns 200 and is the `video-courses` root; `setar-classes/`, `classical-guitar/` and `tar-classes/` each return 200 beneath it; and `classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4` returns `206 video/mp4`. The guitar tree is already served — an earlier draft of this plan wrongly assumed it was not, and required the owner to mirror it. No mirroring is needed.
- The owner's iPhone reaches the same tree at `https://ds220plus.taild1d1f7.ts.net/media`, which could not be probed from this machine (not on the tailnet). Because the media root is derived from whatever archive base that device already has, the iPhone needs no new configuration either; the Browse action is how the owner confirms it.
- The media root is derived as the parent of the configured archive base, and only when the base's last segment is a folder a known source declares. When it is not, nothing is guessed: the derived value is empty, Settings shows the explicit override field, and a course file reports `no-base` and offers no open action.
- Course data is split so the generated part is obvious and never hand-edited: `src/domain/courseData.ts` is the scanner's OUTPUT (the literal — groups, units, titles, guidance, syllabus BPMs, file lists, works, routines, `mediaPath`) and `src/domain/courseSeed.ts` is the hand-written module that reads it and builds stages, catalogue entries and routines. A course change is answered by re-running the scanner and committing new data, never by editing it by hand.
- The data is shaped as ordered GROUPS of UNITS, not as 'levels', and the number of them is data. Nothing in the app is bound to eighteen levels, to `Level_*` folder naming or to a section-per-folder layout — the scanner DISCOVERS the levels present and must report any it could not read rather than silently emitting fewer.
- Adding Levels 4A-5F later is therefore: re-run the scanner, ship the regenerated data, open the pathway and use the course-scoped “Add new levels from this course” action, which lists the levels the course has and the pathway does not and adds only the ones ticked. No migration and no schema change, and no change to `reseedDefaultPathways` or its Repertoire button.
- The generated data is a large committed literal (~153 KB of section notes on disk). Per-strand practice checklists are repeated boilerplate (~63 KB of that) and are deduplicated to one per strand; per-section guidance (~55 KB), titles, file lists and routines are kept. It ships in the offline PWA bundle, and roughly doubles if the course later reaches 5F.
- Video filenames are opaque (`01_80ee0462-cc7.mp4`) but their ORDINAL is stable and `notes.md` lists them in order, so the scanner addresses a video by (unit, ordinal) and never parses meaning out of a filename. PDF names are stable and meaningful and are used as given. If the owner re-downloads the course and those names change, re-running the scanner is the answer — and it reaches every existing item, because material is derived from the catalogue rather than stored on items.
- Level 3 syllabi genuinely contain no sample routine — they carry a New/Detailing/Maintenance repertoire page instead. Treating that honestly, rather than fabricating a routine for symmetry, is deliberate.
- Two of the syllabus PDFs need care: 2D's routine page uses a uniform +29 character-shift font subset and decodes trivially, and the Level 3 set has no routine to extract. The scanner reports any level whose syllabus it could not read.
- `src/domain/repertoire.ts` and `src/domain/plan.ts` are in `forbid` to say they must not be EDITED, not that they cannot be imported — the acceptance checks call `isWork`/`repertoireWorks`, and the duration control imports `validateBudgetMinutes`. The precedent is the Farsi-search contract, which forbade `src/domain/farsi.ts` while its whole design imported and called `persianSearchMatch` from it.
- Khonyagar/Tar is assessed and deliberately excluded. The group/unit course shape and the shared media root are chosen so it becomes a second reader plus data with no new machinery. Its four teacher folders are real dated classes belonging to `log-a-class`, and `behrooz-hemati` carries a Setar book so its instrument needs confirming before anything is imported.
- ArtistWorks (`classical-guitar/artist-works/`) was noticed and is not planned for.
- The catalogue-key stability check lives in `src/domain/pathways.test.ts`, NOT in `seedMigration.test.ts`: that filename matches this repo's own `**/*migration*` heavy-tier rule (verified against `.prismatica/config.json`), and putting it in scope would escalate the whole lane to heavy for a test that has nothing to do with a migration. `pathways.test.ts` is already in scope and has no such awkwardness.
- `tests/daily-practice.browser.test.ts` is in scope — named exactly, not as a `tests/**` glob, which this repo's secret-glob rule rejects — because this lane touches `src/pages/Today.tsx` and that journey drives it by role and name, so adding the duration control to Today's routine rows may need the journey's selectors repaired. No new journey is required: every other acceptance check is a pure unit test, because the two store-applied decisions are extracted as pure functions in `courseSeed.ts` and applied by a single `set()`.
- If a device's archive base is the LEGACY one-folder-too-high value (the media root itself, with no source segment), the derivation yields nothing, course files report `no-base` and offer no open action. That is correct and not a new failure: Setar references are already broken in exactly that state, so correcting the archive base once fixes both.
- Catalogue-to-item addition remains a sound position marker even though optional repertoire works are added from the same stage: a routine segment declares its OWN catalogue key and is matched on `(stageId, catalogKey)`, so it is never decided by how many items the stage holds. Adding “Sor Op.35 No.1” therefore enables no segment, and the course's own syllabus routines bear this out — 1B's twenty-minute routine contains no piece segment at all, only practice areas. No new progress concept is introduced. Two consequences are deliberate and cost nothing: an item the owner created by hand with no catalogue key is not one of the course's sections and enables no segment, and because the generated routine is ORDINARY EDITABLE DATA, a segment the marker leaves out is one edit away from being added back.

**Possible conflicts**

- `docs/setar-archive.md` and AGENTS.md state normatively that there is deliberately NO second archive-specific base and no resolver fallback. This lane does not add one — it adds a shared root ABOVE the archive folder, derived from it — but the wording must say exactly that, or it reads as the fallback those sections warn against.
- `STRAND_TO_ITEM_TYPE` maps `strand: 'piece'` to `itemType: 'full_piece'`, so any catalogue entry given the `piece` strand becomes a repertoire work. Only the level's own study and the named packet works may carry that strand; a section that merely CONTAINS pieces must not.
- `CatalogEntry.key` is unique per stage, not globally — `chords` exists in every level. The position routine spans two stages by construction, so any join must use (stageId, catalogKey) together, exactly as `addFromCatalog` already does. A global key lookup silently matches the wrong level's item.
- Works repeat across levels (Ferrer Ejercicio in 2C/2D/2E/2F, Ja Nuns Hons Pris likewise, Round the Corner Sally in 1C and 2B). Suggesting one per level would duplicate the owner's repertoire; it must be introduced once and named as carried-forward text thereafter.
- Replacing a generic catalogue key with a differently-named one would orphan an item the owner has already added — it would still show in the stage as a non-catalogue unit, but silently detached from its suggestion. Keys are added, never renamed.
- Proportional scaling alone cannot reach a short total: scaling a 26-minute routine to 10 minutes floors every segment at 1 minute and overshoots. Dropping is therefore part of the fit, and it must follow the routine's OWN priority (non-essential first, latest first) rather than the Session Plan's bucket priority.
- The contrast-card decks are 1663 images and the owner's own guide calls them the highest-value warm-up at this level. The obvious trap is building a flashcard viewer inside a practice timer. They are one folder reference on one warm-up entry per level, nothing more.
- Adding a duration control to Today's routine rows touches a file governed by the above-the-fold rule and by `direction.test.ts`'s recorded site inventory. One shared component keeps all three routine surfaces consistent; any new `dir` site must be added to the recorded inventory visibly.
- Adding course levels must not be folded into `reseedDefaultPathways`: that button currently does nothing to an existing pathway, and making it additive would resurrect a stage the owner deliberately deleted, since a deleted stage's deterministic id is absent exactly like a never-seeded one. A separate course-scoped action changes no shipped behaviour.
- Two decisions in this lane live in the store (`useStore.ts`), which the Node test environment cannot import because it pulls in Dexie via `./idb`. Both are therefore extracted as pure functions in `courseSeed.ts` and applied by the store as a single `set()` of the result — the same shape-protects-the-wiring pattern `installDatabase` already uses.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Import and integrate the Classical Guitar Shed course into Practice Compass (and assess Khonyagar/Tar where it materially affects the architecture, without forcing it into this lane unless that is the better design).\n\n- Classical Guitar repertoire: each level contains genuine pieces that could belong in my own Classical Guitar repertoire, alongside exercises/practice material that should not. Work out the most useful and sustainable distinction and how those pieces should enter and behave in Practice Compass.\n- Learning material: work out the best long-term way for the relevant CGS videos, PDFs and other files to be associated with practice items/course material after this lane. Do not default to manual link entry if a safer and more maintainable source-aware approach is possible.\n- Partial progression and routines: support the reality that I may be part-way through a level while maintaining selected material from earlier levels. Use the course's own structure and guidance where useful, but optimise for actual day-to-day practice.\n- Routine duration: I would ideally like a generated/selected routine to have a default total length, but also let me change the overall duration easily, somewhat like \"Plan this session\". Work out whether this should reuse existing session-planning logic, scale routine segments, offer presets, or another simpler/most optimal approach. Avoid duplicating concepts unnecessarily and preserve the usefulness of essentials / \"Short on time\".\n- Future CGS levels: I currently only own/download Levels 1A-3F, but Classical Guitar Shed appears to continue to around 5F / ~30 levels. I may buy the remaining levels later, probably not for quite some time. Assess whether the proposed course-data/scanner architecture makes adding future levels straightforward. Avoid premature work for content I do not yet have, but if a small architectural improvement now would make later expansion substantially cleaner or safer, incorporate it.\n- NAS/media: verify the actual media-root situation rather than assuming. My NAS exposes video-courses through https://192.168.0.20:5010/ (Mac) and https://ds220plus.taild1d1f7.ts.net/media (iPhone/Tailscale); the tree contains setar, tar and classical-guitar folders. Determine the actual URL mapping and whether one shared video-courses root plus source-relative paths is cleaner than separate per-source roots. Preserve existing Setar behaviour and device-local configuration.\n- Flexibility and future change: anticipate progressing through levels, revisiting old material, course-file changes, new repertoire, different course structures, additional Guitar/Tar sources and future media access. Reconsider any assumption that depends on the course having exactly 18 levels or a fixed source layout. Avoid brittle assumptions or unnecessary new machinery.\n\nInvestigate whether existing pathway, catalogue, routine, repertoire, source/media and practice-item concepts can be extended cleanly before introducing new concepts or schemas. Prefer a complete, coherent user experience over a narrowly minimal diff, while keeping complexity justified. Anticipate issues up front so the builder and reviewer do not go back and forth.",
  "builder": "claude",
  "summary": "Bring the Classical Guitar Shed course into the Guitar pathway with its material, works and position-aware routines",
  "rationale": "The owner practises Classical Guitar daily from an offline copy of the Classical Guitar Shed \"Woodshed\" course (currently Levels 1A-3F: 193 lesson sections, 431 videos, 108 PDFs), and is part-way through Level 1B (`05_Scales`). The app already seeds a CGS pathway with every one of those levels as a stage — but only Level 1A has real content. Levels 1B-3F carry eight generic placeholders each (\"Chords\", \"Arpeggios\", \"Piece\"...) produced by `cgsOutline()` with one boilerplate sentence, no course material, no named works and no routine. The pathway that is meant to be the trust anchor tells the owner nothing they do not already know, and everything useful — which video, which score, which piece, what to do today — lives outside the app.\n\nFive findings from reading the real folders, probing the real NAS and reading the real code decided this design.\n\nFIRST, the course is not an archive and must not reuse the Setar archive machinery. `sourceArchive.ts`'s own comment says so. The Setar index exists because that source GROWS, gets RENAMED, and carries piece identity to reconcile against existing repertoire. The Shed is a downloaded course with no dates, no roster and nothing to reconcile — and its metadata is already on disk: every one of the 237 `notes.md` files lists its own section title, guidance, videos and sheet music BY NAME, and every `LEVEL_GUIDE.md` encodes core/rotation/reference with time budgets. There is no filename to parse and nothing to publish. So the course belongs on the rung `pathwaySeed.ts` already stands on: reference data in code, generated by a stdlib scanner, with no persisted graph, no new validation door and no schema change.\n\nSECOND, the repertoire distinction is already in the type system and is being got WRONG by the current seed, not by the app. `isWork` = top-level AND (`full_piece` | `gusheh` | Persian identity), and `STRAND_TO_ITEM_TYPE` maps `strand: 'piece'` to `full_piece` — so today's generic \"Piece\" suggestion, if added, creates a repertoire work literally titled \"Piece\". The correct distinction is derivable from the source rather than curated: each Piece section's H1 names the level's OWN study (\"1A Piece ... The Forest Glade\", \"2D Piece: Study #9\") and its \"## Sheet Music\" list names the optional packet works with their composers (Sor Op.35 No.1, Carulli Op.241 No.1, Bach Minuet in G, Ferrer Ejercicio — around sixty across the course). Those are works; every drill, exercise, rhythm, sight-reading and reading section is practice material and must never reach repertoire. `repertoire.ts` and `isWork` need no change.\n\nTHIRD, the partial-level problem needs no new stored concept, because the course already solves it and the app already records the position. Level 1A ships TWO progressive routines (\"Stage #1\", \"Stage #2\" — Stage #2 introduces material Stage #1 has not met), 1E and 1F ship two rotation routines each, every level's routine opens with \"Review Right Hand Movements (see list above)\", and each level's Main Practice Areas list enumerates the carried-forward skills by name. The previous-level maintenance the owner already does by instinct is written into the syllabus rather than invented here. And \"up to the folder I have watched\" is already recorded: the catalogue-to-item flow IS the position marker, and `stageUnits`/`itemStageState` already render it.\n\nFOURTH — and this reverses an assumption an earlier draft of this plan made — THE GUITAR TREE IS ALREADY SERVED, and there is ONE shared media root, not one per source. Probed directly: `https://192.168.0.20:5010/` returns 200 and IS the `video-courses` root; `setar-classes/`, `classical-guitar/` and `tar-classes/` all return 200 beneath it; and a real lesson video, `classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4`, returns `206 video/mp4`. The owner's iPhone reaches the same tree at `https://ds220plus.taild1d1f7.ts.net/media`. So the configured Setar base is exactly `<media root>/setar-classes` — root plus source folder — which is why `docs/setar-archive.md`'s own worked example uses a `/media/` path prefix. Separate per-source roots would therefore be a mistake: they would add one device setting per course forever, to describe folders that already sit side by side under one root the device is already configured to reach. One shared root plus a course-relative path is both simpler and more flexible, and it means adding Khonyagar or ArtistWorks later needs no device configuration at all. Better still, the root need not be asked for: it is the parent of the archive base the owner already set, so it is DERIVED by default and shown on screen with a Browse action, with an explicit override field for the case where the derivation does not apply. The archive base itself, and every Setar and lesson code path that reads it, is left byte-for-byte untouched.\n\nFIFTH, nothing should be bound to eighteen levels or to this course's particular layout. The Shed continues to roughly 5F, and the owner may buy more. Two cheap changes make that a data change instead of a code change. (a) The generated course data is shaped as ordered GROUPS of UNITS with a `mediaPath`, not as \"levels\" — which costs nothing now and is also the shape Khonyagar's flat 106-section index needs, so a second course is a second reader plus data, never new machinery. (b) nothing today can add a level to a pathway that already exists: `reseedDefaultPathways` adds stages only for pathways that do not exist yet (`newIds.has(x.pathwayId)`), and `addStage` mints a random `newId()` that could never match the deterministic `stageIdFor('cgs','4a')` the catalogue is keyed by. The answer is a SEPARATE, course-scoped action on the pathway — “Add new levels from this course” — and deliberately NOT an extension of `reseedDefaultPathways`. Making that shipped button additive would change what it does to every existing pathway, and because a stage the owner DELIBERATELY DELETED has an absent deterministic id exactly like a never-seeded one, it would silently resurrect it. The new action cannot do that, because it does not add anything on its own: it OFFERS the course levels absent from the pathway and adds only the ones the owner selects. A deleted stage therefore reappears in a list, never in the pathway, and only if they choose it. That is the difference between “re-run the scanner, ship, tick the new levels” and “write a migration” when Levels 4A-5F arrive.\n\nRoutine duration follows the same discipline: extend, do not duplicate. `startRoutineRun(routineId, shortOnTime, authoredSegments)` ALREADY takes the segments from its caller, so fitting a routine to a chosen total needs no store change at all — the caller passes scaled segments and the runner freezes them exactly as it freezes authored ones. The Session Plan's `allocateMinutes` is deliberately NOT reused: it allocates by bucket priority with a pinned warm-up share and a 2-25 minute clamp, which would distort a 1-minute syllabus segment and entangle two systems the app keeps as separate peers on purpose. What IS reused is `validateBudgetMinutes` and its 5-120 bound, imported from `plan.ts`, so the duration control rejects exactly what \"Plan this session\" rejects. The new `fitRoutineToMinutes` scales proportionally to the authored minutes — preserving the syllabus's own proportions, which is the whole point of a curriculum routine — and when the target cannot seat every segment at a one-minute floor it drops using the routine's own existing priority: non-essential first, latest first, so the `***` rule keeps meaning what it means. It composes with `segmentsForRun` rather than replacing it: essentials-only is a content decision, duration is a time decision, and they stay two independent knobs.\n\nKhonyagar is assessed and deliberately NOT built. It is a better-structured source than the Shed (259 videos with clean Farsi titles already in the filenames, a 106-section index, four score PDFs, and a Tar pathway seed that already names it), which is exactly why it should follow as a data lane rather than widen this one — the group/unit course shape and the shared media root are chosen so it needs no new machinery. Its four teacher folders are real dated classes belonging to `log-a-class`, and `behrooz-hemati` carries a Setar book, so its instrument needs confirming first.",
  "kind": "existing-flow",
  "flowId": "work-a-pathway-stage",
  "currentBehaviour": "The Classical Guitar Shed pathway exists with a stage for every level the owner owns (1A-3F) but is nearly empty of real content. Levels 1B-3F each show the same eight generic suggestions produced by `cgsOutline()` in `pathwaySeed.ts`, each carrying one boilerplate sentence. Only Level 1A has hand-authored steps, and only Level 1A has routines.\n\nConcretely, today:\n- Adding the generic \"Piece\" suggestion creates a practice item literally titled \"Piece\" with `itemType: 'full_piece'`, so `isWork` is true and it appears in My repertoire as a work called \"Piece\". The course's real works — The Forest Glade, Study #1, Sor Op.35 No.1, Bach Minuet in G, Ferrer Ejercicio and around sixty more, each already named with its composer in the course's own `notes.md` — are not in the app at all.\n- No course file reaches a practice item, even though the whole tree is already served by the NAS. `itemFiles` composes only what the Setar archive graph scopes to a piece, the item's own hand-entered references, and the references of linked lessons; a Guitar item has none of those, so its Material section is empty and the owner leaves the app to find the video or the score.\n- There is one NAS setting per device and it names the Setar archive folder. Nothing knows that the folder above it is the shared `video-courses` root that also holds `classical-guitar` and `tar-classes`, and `isSafeRelativeReference` refuses `..`, so no guitar path can be expressed at all.\n- Sixteen of the eighteen levels have no routine, and there is no way to get one for a level you are only part-way through. The owner is at Level 1B section `05_Scales` and assembles this by hand outside the app each day.\n- A routine runs at exactly its authored length. `segmentsForRun` can drop non-essential segments, but there is no way to say \"run this in 12 minutes\" or \"give me 45 today\".\n- New levels cannot reach an existing database. `reseedDefaultPathways` adds stages only for pathways that do not already exist, and `addStage` mints a random id that no catalogue entry could ever be keyed to.\n- Nothing links a Guitar item to a study source, so any Guitar work groups in My repertoire under \"No study source yet\".",
  "desiredBehaviour": "Each Classical Guitar Shed level offers what the course itself teaches there, the day's practice can be built from where the owner actually is and run for the time they actually have, and buying more levels later is a data change.\n\n- A stage lists the level's real sections from the course's own `notes.md` — title, practice guidance and the syllabus target BPM — instead of eight generic placeholders. Existing catalogue keys are preserved wherever a real section maps onto one, so items already added stay attached to their suggestion.\n- The level's own study (The Forest Glade, Study #1, Study #9...) and the named packet works with their composers are their OWN catalogue entries and become `full_piece` items, so they — and only they — appear in My repertoire, grouped under a \"Classical Guitar Shed\" study source that `addFromCatalog` finds-or-creates on first use. Every drill, exercise, reading and sight-reading section stays `technique`/`exercise`/`body`/`other` and never reaches repertoire. A work carried forward across levels (Ferrer Ejercicio runs 2C-2F) is introduced once, and adding it from a later level reuses the existing item rather than creating a second work.\n- Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed LIVE from the catalogue by `itemFiles` and never written onto the item — so regenerating the course data reaches items that already exist, and the owner never types a link. Files stay on the NAS: no bytes enter the app, sync or a backup.\n- Those files resolve under the ONE shared media root the device already reaches, joined with the course's own `mediaPath`. The root is derived from the archive base the owner already configured, shown on screen with a Browse action, and overridable if the derivation does not apply. The archive base and every Setar and lesson code path that reads it are untouched, and no new device setting is needed for any future course.\n- A stage offers \"Use this level's routine\" (the syllabus's own routine, with the `***` segments marked essential so \"Short on time\" keeps working) and \"Build one for where I am\" — the previous level's essentials plus only the current level's sections the owner has actually added, joined on stage and catalogue key together. Both write an ordinary, editable routine; neither is a live view, and Level 1A's two existing routines are untouched.\n- Any routine can be run at a chosen total. Its authored length is the default, so doing nothing behaves exactly as today; changing it scales the segments proportionally so the syllabus's own proportions survive, and when the time is too short to seat them all it drops non-essential segments before essential ones. Duration and \"Short on time\" stay two independent knobs with their existing meanings.\n- When the owner later buys Levels 4A-5F, re-running the scanner and shipping the regenerated data is enough: the pathway's stage list comes from that data, and a course-scoped \"Add new levels from this course\" action on the pathway adds only the levels genuinely missing, leaving every stage they have edited alone. The existing \"restore default pathways\" button is not redefined.\n- Level 3 stages, whose syllabi carry a New/Detailing/Maintenance repertoire page and no minute-by-minute routine, say so and lean on item status and the Session Plan rather than being given a fabricated routine.",
  "mustNotChange": [
    "The Setar class archive keeps working exactly as it does now: no change to `sourceArchive.ts`, `sourceReconcile.ts`, the published index format, the scanner, the publisher, or the refresh/adoption flow.",
    "`getNasBaseUrl()` keeps its stored value and its meaning — it still names the Setar archive folder. Every existing lesson reference, `relativizeReference`, `archiveRootUrl`, `ReferenceEditor`, `Lessons` and `ArchiveRefresh` resolve byte-identically. The shared media root is DERIVED from it and never rewrites it.",
    "No schema change and no migration: `SCHEMA_VERSION` stays 14, `migrations.ts` and `io.ts` are forbidden by scope, and nothing new is persisted in `PracticeDB`. Catalogue, course data and syllabus routines are reference data in code; the media-root override is per-device localStorage.",
    "Level 1A's fourteen hand-authored steps and both of its existing routines stay exactly as they are.",
    "Stage ids and every catalogue key that existing data may reference stay byte-stable; a key is only ever added, never renamed, so no already-added item is orphaned from its suggestion.",
    "`reseedDefaultPathways` and its Repertoire button are NOT changed: they keep adding stages only for pathways that do not yet exist. Adding course levels is a separate, course-scoped action that never adds a stage on its own — it offers the levels the course has and the pathway does not, and adds only those the owner selects, so a stage they deliberately deleted can never be recreated without them choosing it.",
    "`isWork`, `repertoireWorks` and `repertoire.ts` are not changed — the repertoire fix is upstream, in what the catalogue declares.",
    "No bytes enter the app: no video, PDF, image or contrast card is ever attached, cached, synced or backed up. r-large-files-stay-on-nas holds unchanged.",
    "`addFromCatalog` keeps its contract: a catalogue item arrives `status: 'new'` with zero statistics and stays losslessly removable, so `isLosslesslyRemovable` and the Remove affordance keep working.",
    "Running a routine is otherwise unchanged: the same runner, the same frozen segment list, the same boundary signals, the same at-most-one-block-per-bound-item recording. Only the segment MINUTES may be scaled, never a label, note, essential flag or bound item.",
    "`segmentsForRun` keeps its exact meaning and signature — duration is a second, independent knob, not a replacement for essentials-only.",
    "The Session Plan is not touched and its allocator is not reused: `plan.ts` is forbidden, and only `validateBudgetMinutes` is imported from it so the duration control shares the 5-120 bound.",
    "Practising stays the only thing that completes a review or advances SM-2; nothing here writes a block, a result or a schedule.",
    "Today keeps its layout: the two doorway cards stay above the recommendation, both stay collapsed at about 50px, and the primary recommendation stays above the fold at 390x844.",
    "No recorded `dir` site is removed or reordered; any new group or isolate is added to `direction.test.ts`'s recorded inventories visibly, never silently.",
    "`scripts/scan-cgs-course.mjs` is a build-time tool only — stdlib, dry-run by default, never imported by or reachable from any runtime path in `src/`.",
    "Starting a block stays under 30 seconds and closing one under 60; no required field is added anywhere."
  ],
  "assumptions": [
    "VERIFIED, not assumed: `https://192.168.0.20:5010/` returns 200 and is the `video-courses` root; `setar-classes/`, `classical-guitar/` and `tar-classes/` each return 200 beneath it; and `classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4` returns `206 video/mp4`. The guitar tree is already served — an earlier draft of this plan wrongly assumed it was not, and required the owner to mirror it. No mirroring is needed.",
    "The owner's iPhone reaches the same tree at `https://ds220plus.taild1d1f7.ts.net/media`, which could not be probed from this machine (not on the tailnet). Because the media root is derived from whatever archive base that device already has, the iPhone needs no new configuration either; the Browse action is how the owner confirms it.",
    "The media root is derived as the parent of the configured archive base, and only when the base's last segment is a folder a known source declares. When it is not, nothing is guessed: the derived value is empty, Settings shows the explicit override field, and a course file reports `no-base` and offers no open action.",
    "Course data is split so the generated part is obvious and never hand-edited: `src/domain/courseData.ts` is the scanner's OUTPUT (the literal — groups, units, titles, guidance, syllabus BPMs, file lists, works, routines, `mediaPath`) and `src/domain/courseSeed.ts` is the hand-written module that reads it and builds stages, catalogue entries and routines. A course change is answered by re-running the scanner and committing new data, never by editing it by hand.",
    "The data is shaped as ordered GROUPS of UNITS, not as 'levels', and the number of them is data. Nothing in the app is bound to eighteen levels, to `Level_*` folder naming or to a section-per-folder layout — the scanner DISCOVERS the levels present and must report any it could not read rather than silently emitting fewer.",
    "Adding Levels 4A-5F later is therefore: re-run the scanner, ship the regenerated data, open the pathway and use the course-scoped “Add new levels from this course” action, which lists the levels the course has and the pathway does not and adds only the ones ticked. No migration and no schema change, and no change to `reseedDefaultPathways` or its Repertoire button.",
    "The generated data is a large committed literal (~153 KB of section notes on disk). Per-strand practice checklists are repeated boilerplate (~63 KB of that) and are deduplicated to one per strand; per-section guidance (~55 KB), titles, file lists and routines are kept. It ships in the offline PWA bundle, and roughly doubles if the course later reaches 5F.",
    "Video filenames are opaque (`01_80ee0462-cc7.mp4`) but their ORDINAL is stable and `notes.md` lists them in order, so the scanner addresses a video by (unit, ordinal) and never parses meaning out of a filename. PDF names are stable and meaningful and are used as given. If the owner re-downloads the course and those names change, re-running the scanner is the answer — and it reaches every existing item, because material is derived from the catalogue rather than stored on items.",
    "Level 3 syllabi genuinely contain no sample routine — they carry a New/Detailing/Maintenance repertoire page instead. Treating that honestly, rather than fabricating a routine for symmetry, is deliberate.",
    "Two of the syllabus PDFs need care: 2D's routine page uses a uniform +29 character-shift font subset and decodes trivially, and the Level 3 set has no routine to extract. The scanner reports any level whose syllabus it could not read.",
    "`src/domain/repertoire.ts` and `src/domain/plan.ts` are in `forbid` to say they must not be EDITED, not that they cannot be imported — the acceptance checks call `isWork`/`repertoireWorks`, and the duration control imports `validateBudgetMinutes`. The precedent is the Farsi-search contract, which forbade `src/domain/farsi.ts` while its whole design imported and called `persianSearchMatch` from it.",
    "Khonyagar/Tar is assessed and deliberately excluded. The group/unit course shape and the shared media root are chosen so it becomes a second reader plus data with no new machinery. Its four teacher folders are real dated classes belonging to `log-a-class`, and `behrooz-hemati` carries a Setar book so its instrument needs confirming before anything is imported.",
    "ArtistWorks (`classical-guitar/artist-works/`) was noticed and is not planned for.",
    "The catalogue-key stability check lives in `src/domain/pathways.test.ts`, NOT in `seedMigration.test.ts`: that filename matches this repo's own `**/*migration*` heavy-tier rule (verified against `.prismatica/config.json`), and putting it in scope would escalate the whole lane to heavy for a test that has nothing to do with a migration. `pathways.test.ts` is already in scope and has no such awkwardness.",
    "`tests/daily-practice.browser.test.ts` is in scope — named exactly, not as a `tests/**` glob, which this repo's secret-glob rule rejects — because this lane touches `src/pages/Today.tsx` and that journey drives it by role and name, so adding the duration control to Today's routine rows may need the journey's selectors repaired. No new journey is required: every other acceptance check is a pure unit test, because the two store-applied decisions are extracted as pure functions in `courseSeed.ts` and applied by a single `set()`.",
    "If a device's archive base is the LEGACY one-folder-too-high value (the media root itself, with no source segment), the derivation yields nothing, course files report `no-base` and offer no open action. That is correct and not a new failure: Setar references are already broken in exactly that state, so correcting the archive base once fixes both.",
    "Catalogue-to-item addition remains a sound position marker even though optional repertoire works are added from the same stage: a routine segment declares its OWN catalogue key and is matched on `(stageId, catalogKey)`, so it is never decided by how many items the stage holds. Adding “Sor Op.35 No.1” therefore enables no segment, and the course's own syllabus routines bear this out — 1B's twenty-minute routine contains no piece segment at all, only practice areas. No new progress concept is introduced. Two consequences are deliberate and cost nothing: an item the owner created by hand with no catalogue key is not one of the course's sections and enables no segment, and because the generated routine is ORDINARY EDITABLE DATA, a segment the marker leaves out is one edit away from being added back."
  ],
  "possibleConflicts": [
    "`docs/setar-archive.md` and AGENTS.md state normatively that there is deliberately NO second archive-specific base and no resolver fallback. This lane does not add one — it adds a shared root ABOVE the archive folder, derived from it — but the wording must say exactly that, or it reads as the fallback those sections warn against.",
    "`STRAND_TO_ITEM_TYPE` maps `strand: 'piece'` to `itemType: 'full_piece'`, so any catalogue entry given the `piece` strand becomes a repertoire work. Only the level's own study and the named packet works may carry that strand; a section that merely CONTAINS pieces must not.",
    "`CatalogEntry.key` is unique per stage, not globally — `chords` exists in every level. The position routine spans two stages by construction, so any join must use (stageId, catalogKey) together, exactly as `addFromCatalog` already does. A global key lookup silently matches the wrong level's item.",
    "Works repeat across levels (Ferrer Ejercicio in 2C/2D/2E/2F, Ja Nuns Hons Pris likewise, Round the Corner Sally in 1C and 2B). Suggesting one per level would duplicate the owner's repertoire; it must be introduced once and named as carried-forward text thereafter.",
    "Replacing a generic catalogue key with a differently-named one would orphan an item the owner has already added — it would still show in the stage as a non-catalogue unit, but silently detached from its suggestion. Keys are added, never renamed.",
    "Proportional scaling alone cannot reach a short total: scaling a 26-minute routine to 10 minutes floors every segment at 1 minute and overshoots. Dropping is therefore part of the fit, and it must follow the routine's OWN priority (non-essential first, latest first) rather than the Session Plan's bucket priority.",
    "The contrast-card decks are 1663 images and the owner's own guide calls them the highest-value warm-up at this level. The obvious trap is building a flashcard viewer inside a practice timer. They are one folder reference on one warm-up entry per level, nothing more.",
    "Adding a duration control to Today's routine rows touches a file governed by the above-the-fold rule and by `direction.test.ts`'s recorded site inventory. One shared component keeps all three routine surfaces consistent; any new `dir` site must be added to the recorded inventory visibly.",
    "Adding course levels must not be folded into `reseedDefaultPathways`: that button currently does nothing to an existing pathway, and making it additive would resurrect a stage the owner deliberately deleted, since a deleted stage's deterministic id is absent exactly like a never-seeded one. A separate course-scoped action changes no shipped behaviour.",
    "Two decisions in this lane live in the store (`useStore.ts`), which the Node test environment cannot import because it pulls in Dexie via `./idb`. Both are therefore extracted as pure functions in `courseSeed.ts` and applied by the store as a single `set()` of the result — the same shape-protects-the-wiring pattern `installDatabase` already uses."
  ],
  "scope": {
    "allow": [
      "src/domain/courseSeed.ts",
      "src/domain/courseSeed.test.ts",
      "src/domain/courseData.ts",
      "src/domain/mediaRoots.ts",
      "src/domain/mediaRoots.test.ts",
      "src/domain/pathwaySeed.ts",
      "src/domain/pathways.ts",
      "src/domain/pathways.test.ts",
      "src/domain/routines.ts",
      "src/domain/routines.test.ts",
      "src/domain/itemFiles.ts",
      "src/domain/itemFiles.test.ts",
      "src/domain/recordings.ts",
      "src/domain/recordings.test.ts",
      "src/domain/factories.ts",
      "src/domain/labels.ts",
      "src/domain/types.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/store/backup.ts",
      "src/components/ItemMaterial.tsx",
      "src/components/RoutineDuration.tsx",
      "src/components/direction.test.ts",
      "src/pages/StageDetail.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/Today.tsx",
      "src/pages/Settings.tsx",
      "tests/daily-practice.browser.test.ts",
      "scripts/scan-cgs-course.mjs",
      "docs/cgs-course.md",
      "docs/setar-archive.md",
      "AGENTS.md"
    ],
    "forbid": [
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/scheduling.ts",
      "src/domain/sync.ts",
      "src/domain/canonical.ts",
      "src/domain/plan.ts",
      "src/domain/repertoire.ts",
      "src/domain/recommend.ts",
      "src/domain/scoring.ts",
      "src/store/syncEngine.ts",
      "src/store/githubSync.ts",
      "src/store/gitRemote.ts",
      "src/pages/CloseBlock.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/RoutineRunner.tsx",
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs"
    ]
  },
  "exclusions": [
    "No contrast-card viewer, flashcard player or media player of any kind — one folder reference per level's warm-up entry and nothing more.",
    "No second source-archive grammar, no published index, no scanner running inside the app, and no change to the Setar archive's scanner, publisher or refresh.",
    "No per-source media roots and no resolver fallback: one shared root, derived, with an override.",
    "No content for CGS levels the owner does not own. The architecture makes 4A-5F a data change; no placeholder stage, catalogue entry or routine is created for them.",
    "No Khonyagar/Tar course data, no Tar teacher-class import, no ArtistWorks import.",
    "No schema change, no migration, no new persisted collection and no new inbound-validation door.",
    "No change to the recommendation engine, the Session Plan, review scheduling or SM-2.",
    "No automatic creation of items, routines or stages: every one is created by an explicit owner action.",
    "No change to Today's doorway order, card heights or above-the-fold behaviour.",
    "No change to `reseedDefaultPathways` or the existing “restore default pathways” button."
  ],
  "acceptance": [
    {
      "description": "A level's own study and its named packet works become repertoire works; every drill, exercise, rhythm, sight-reading and reading section from the same level does not.",
      "test": "a level's study and packet works are repertoire works and its drill sections are not"
    },
    {
      "description": "A work carried forward across levels is suggested once. Adding it from a later level reuses the existing item rather than creating a second work in My repertoire.",
      "test": "reuses a carried-forward work when it is added from a later level instead of duplicating it"
    },
    {
      "description": "Course material is composed live from the catalogue for a catalogue-linked item, and nothing is written onto the item — so regenerated course data reaches items that already exist.",
      "test": "composes a catalogue item's course files without storing any reference on the item"
    },
    {
      "description": "A course file resolves under the shared media root joined with the course's own media path, while an archive reference resolves against the unchanged archive base — both from the real configured values.",
      "test": "resolves a course file under the shared media root and leaves archive resolution unchanged"
    },
    {
      "description": "The media root is derived from the archive base, an explicit override wins over the derivation when set, and a base whose last segment names no known source yields no root at all rather than a guess.",
      "test": "prefers an explicit media root over the derived one and derives nothing from an unrecognised base"
    },
    {
      "description": "With no media root derivable or set, a course file is honestly unavailable rather than a dead link: the resolver reports no-base and the material row offers no open action.",
      "test": "reports no-base for a course file when no media root is derivable or set"
    },
    {
      "description": "The position routine is the previous level's essential segments plus only the current level's segments whose catalogue item the owner has actually added.",
      "test": "builds a position routine from added current-level items plus the previous level's essentials"
    },
    {
      "description": "A current-level segment whose catalogue item has not been added is absent from the position routine, while the level's full routine still contains it.",
      "test": "omits a current-level segment whose catalogue item has not been added"
    },
    {
      "description": "A segment is joined to its item by stage and catalogue key together, so an identically-keyed entry in another level is never matched.",
      "test": "joins a segment to its item by stage and catalogue key together, never by key alone"
    },
    {
      "description": "Adding one of a level's optional repertoire works changes nothing about the position routine, while adding one of its practice sections adds that section's segments — because a segment is matched by its OWN declared catalogue key, never by how many items the stage now holds.",
      "test": "ignores an added repertoire work when building the position routine and includes an added practice section"
    },
    {
      "description": "Fitting a routine to a target total yields minutes summing exactly to that target, and returns the routine unchanged when the target equals its authored total.",
      "test": "fits a routine to a target total exactly and leaves it unchanged at its authored total"
    },
    {
      "description": "When the target cannot seat every segment at a one-minute floor, non-essential segments are dropped before essential ones, and every surviving segment keeps its label, note, essential flag and bound item.",
      "test": "drops a non-essential segment before an essential one and preserves every surviving segment's identity"
    },
    {
      "description": "Adding new course levels OFFERS only the levels genuinely absent from the pathway — never one already present under a title the owner renamed — and adds nothing that was not explicitly selected, so a stage they deliberately deleted is offered again but never recreated on its own. The store applies that decision as a single set() of its result, so the shape protects the wiring the Node environment cannot import.",
      "test": "offers only the course levels absent from an existing pathway and never a renamed one already present"
    },
    {
      "description": "Resolving a course entry's study source returns the existing Material when one already matches and mints a new one only when none does, so a second course item can never create a duplicate source. The store applies that decision as a single set() of its result.",
      "test": "returns an existing study source when one matches and mints one only when none does"
    },
    {
      "description": "Every CGS stage id and catalogue key that existing data may reference is unchanged by the course import, so no already-added item is detached from its suggestion.",
      "test": "CGS stage ids and catalog keys stay stable across the course import"
    },
    {
      "description": "On the owner's own Mac and iPhone: Level 1B shows its real sections, 'Build one for where I am' matches the sections already added, running it at a changed duration keeps the syllabus proportions, a course video and a score open from a practice item over both the LAN and Tailscale routes, and the level's study appears in My repertoire while no exercise does.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "No schema change, no migration and no new persisted collection — `SCHEMA_VERSION` stays 14 and `migrations.ts` and `io.ts` are forbidden by scope. But the lane creates and links persisted records through new code paths: `addFromCatalog` gains a find-or-create for the study source `Material`, two new actions write `PathwayRoutine` rows, and a new course-scoped action can insert `PathwayStage` rows into a pathway the owner already has and may have edited — which is why it offers a list and adds only what they select, rather than adding on its own. Items created from the course are ordinary items that then accumulate real practice, so getting identity wrong — a duplicated carried-forward work, a segment joined to another level's item, a second study source, an overwritten stage — would corrupt the owner's own repertoire, practice record or pathway rather than merely render badly. That is why the checks discriminate rather than only proving the happy path: reuse-versus-duplicate for the work and the study source, offered-versus-added and absent-versus-present for a course level, present-versus-absent for an unadded segment, correct-versus-cross-level for the join, essential-versus-non-essential for the duration drop, and override-versus-derived-versus-nothing for the media root. Media configuration stays per-device localStorage, so `r-secrets-stay-on-device` is unaffected, and no file bytes ever enter the app."
  },
  "delta": {
    "today": "The Classical Guitar Shed pathway has a stage for every level the owner owns but almost no content. Levels 1B-3F each offer the same eight generic suggestions from `cgsOutline()` with one boilerplate sentence apiece, no course material, no named works and no routine. Adding the generic “Piece” suggestion creates a work literally called “Piece” in My repertoire, because `strand: 'piece'` maps to `itemType: 'full_piece'`. No course file reaches a practice item even though the whole tree is already served by the NAS: `itemFiles` composes only the Setar archive graph, hand-entered references and linked lessons, so a Guitar item's Material section is empty. The one NAS setting names the Setar archive folder and nothing knows that the folder above it is the shared `video-courses` root that also holds `classical-guitar`. Sixteen levels have no routine and there is no way to get one for a level you are part-way through — the owner is at 1B `05_Scales` and assembles that by hand every day. A routine runs only at its authored length. And a level bought later could never reach an existing database: `reseedDefaultPathways` adds stages only for pathways that do not yet exist, `addStage` mints a random id no catalogue could be keyed to, and there is no action that means “add the levels I have just bought”.",
    "instead": "Each level offers what the course actually teaches there: its real sections with their guidance and syllabus BPMs, keeping the existing keys wherever a real section maps onto one. The level's own study and the named packet works with their composers are their own entries and become the only things that reach My repertoire, grouped under a “Classical Guitar Shed” study source created on first use; a work carried forward across levels is introduced once and reused, never duplicated. Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed live from the catalogue and never stored on the item, resolving under the one shared media root derived from the archive base the owner already set — shown on screen, overridable, and honestly unavailable rather than a dead link when there is none. A stage offers “Use this level's routine”, transcribed from the syllabus with its `***` segments essential, and “Build one for where I am” — the previous level's essentials plus only the sections actually added — both written as ordinary editable routines. Any routine can be run at a chosen total: its authored length is the default, changing it scales the segments proportionally, and too short a time drops non-essential segments before essential ones. Buying Levels 4A-5F later is a data change: the stage list comes from the generated course data, and a course-scoped “Add new levels from this course” action adds only the missing ones, without redefining the existing “restore default pathways” button or touching stages the owner edited.",
    "keep": [
      "Seeing where you are in a stage stays derived from item status exactly as it is now — `stageUnits` and `itemStageState` are unchanged, and a suggestion you have not taken stays a suggestion.",
      "Taking a suggestion into your own items stays one tap, arrives honestly as “Not practised yet” with zero statistics, and stays losslessly removable until you practise it.",
      "Running a routine is unchanged: the same runner, the same frozen segment list, the same boundary signals, the same at-most-one-block-per-bound-item recording. Only segment minutes are ever scaled.",
      "“Short on time — essentials only” keeps its exact meaning and stays independent of duration.",
      "Level 1A keeps its fourteen hand-authored steps and both of its existing routines, byte for byte.",
      "Every Setar and Tar pathway, stage, catalogue entry and routine is untouched, and so is the whole Setar archive: its index, scanner, publisher, refresh and adoption flow.",
      "The configured archive base keeps its value and meaning, so no device needs reconfiguring and every existing lesson reference resolves identically.",
      "The Session Plan is untouched and remains a separate peer; only its 5-120 minute bound is shared.",
      "Today keeps its doorway order, its card heights and its above-the-fold recommendation.",
      "No file bytes enter the app, sync or a backup, and no item, routine, stage or study source is ever created without an explicit owner action."
    ],
    "assumptions": [
      "The guitar tree is already served by the NAS — verified directly, including a real 1B lesson video returning 206 video/mp4 — so no mirroring is needed and no new device setting is required.",
      "Course material is derived from the catalogue rather than copied onto items, so re-running the scanner after a course change reaches items that already exist."
    ],
    "showMe": "Open Pathways → Classical Guitar Shed → Level 1B. Instead of eight generic rows it lists the level's real sections — Chords (C, G7), Split Chunks P-IM and P-MA, I/M Alternation at 60 bpm, Finger-Walking, Rhythm Practice #1, Sight-Reading, Study #1 — plus the level's named works (Sor Op.35 No.1, Carulli Op.241 No.1, Ode to Joy and the rest of the packet). Add “Split Chunks” and open it: its four lesson videos and the level syllabus PDF are already under Material, no link ever typed, and tapping one opens it from the NAS — Settings shows the media root it derived from your archive base, with Browse to confirm. Add Study #1 and it appears in My repertoire under “Classical Guitar Shed”; add Finger-Walking and it does not. Back on the stage, press “Build one for where I am”: because only the sections up to 05_Scales have been added, the routine is 1A's essentials followed by just those 1B segments — Piece, Rhythm and Sight-Reading are simply absent, not skipped. It is an ordinary routine: reorder it, retime it, or set today's duration to 12 minutes and watch the segments scale in proportion, the non-essential ones dropping first while the asterisked ones stay. “Short on time” still does what it always did."
  },
  "desiredRules": [
    "Course material is composed from the course's own published structure and never hand-linked or copied onto an item: a practice item created from a course catalogue entry shows that section's files because the catalogue says so, so regenerating the course reaches every item that already exists.",
    "There is ONE media root per device and every source is a folder beneath it, so a stored reference is always relative to its own source and adding a source never needs a new device setting, a per-source root or a resolver fallback.",
    "A course entry becomes repertoire only when the course itself names a specific work; sections that teach a skill are practice material and never appear in My repertoire, and a work carried forward across levels is introduced once and reused rather than suggested again.",
    "A routine's authored minutes are proportions, not a fixed length: it may be fitted to any session duration by scaling those proportions, dropping non-essential segments before essential ones, and never altering a segment's label, note, essential flag or bound item."
  ],
  "docsDelta": [
    "AGENTS.md",
    "docs/cgs-course.md",
    "docs/setar-archive.md"
  ]
}
```
````

## The Delta this change was framed from

# Each level offers what the course actually teaches there: its real sections with their guidance and syllabus BPMs, keeping the existing keys wherever a real section maps onto one. The level's own study and the named packet works with their composers are their own entries and become the only things that reach My repertoire, grouped under a “Classical Guitar Shed” study source created on first use; a work carried forward across levels is introduced once and reused, never duplicated. Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed live from the catalogue and never stored on the item, resolving under the one shared media root derived from the archive base the owner already set — shown on screen, overridable, and honestly unavailable rather than a dead link when there is none. A stage offers “Use this level's routine”, transcribed from the syllabus with its `***` segments essential, and “Build one for where I am” — the previous level's essentials plus only the sections actually added — both written as ordinary editable routines. Any routine can be run at a chosen total: its authored length is the default, changing it scales the segments proportionally, and too short a time drops non-essential segments before essential ones. Buying Levels 4A-5F later is a data change: the stage list comes from the generated course data, and a course-scoped “Add new levels from this course” action adds only the missing ones, without redefining the existing “restore default pathways” button or touching stages the owner edited.

_approved · about "work-a-pathway-stage"_

## Today

The Classical Guitar Shed pathway has a stage for every level the owner owns but almost no content. Levels 1B-3F each offer the same eight generic suggestions from `cgsOutline()` with one boilerplate sentence apiece, no course material, no named works and no routine. Adding the generic “Piece” suggestion creates a work literally called “Piece” in My repertoire, because `strand: 'piece'` maps to `itemType: 'full_piece'`. No course file reaches a practice item even though the whole tree is already served by the NAS: `itemFiles` composes only the Setar archive graph, hand-entered references and linked lessons, so a Guitar item's Material section is empty. The one NAS setting names the Setar archive folder and nothing knows that the folder above it is the shared `video-courses` root that also holds `classical-guitar`. Sixteen levels have no routine and there is no way to get one for a level you are part-way through — the owner is at 1B `05_Scales` and assembles that by hand every day. A routine runs only at its authored length. And a level bought later could never reach an existing database: `reseedDefaultPathways` adds stages only for pathways that do not yet exist, `addStage` mints a random id no catalogue could be keyed to, and there is no action that means “add the levels I have just bought”.

## Instead

Each level offers what the course actually teaches there: its real sections with their guidance and syllabus BPMs, keeping the existing keys wherever a real section maps onto one. The level's own study and the named packet works with their composers are their own entries and become the only things that reach My repertoire, grouped under a “Classical Guitar Shed” study source created on first use; a work carried forward across levels is introduced once and reused, never duplicated. Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed live from the catalogue and never stored on the item, resolving under the one shared media root derived from the archive base the owner already set — shown on screen, overridable, and honestly unavailable rather than a dead link when there is none. A stage offers “Use this level's routine”, transcribed from the syllabus with its `***` segments essential, and “Build one for where I am” — the previous level's essentials plus only the sections actually added — both written as ordinary editable routines. Any routine can be run at a chosen total: its authored length is the default, changing it scales the segments proportionally, and too short a time drops non-essential segments before essential ones. Buying Levels 4A-5F later is a data change: the stage list comes from the generated course data, and a course-scoped “Add new levels from this course” action adds only the missing ones, without redefining the existing “restore default pathways” button or touching stages the owner edited.

## Keep

- Seeing where you are in a stage stays derived from item status exactly as it is now — `stageUnits` and `itemStageState` are unchanged, and a suggestion you have not taken stays a suggestion.
- Taking a suggestion into your own items stays one tap, arrives honestly as “Not practised yet” with zero statistics, and stays losslessly removable until you practise it.
- Running a routine is unchanged: the same runner, the same frozen segment list, the same boundary signals, the same at-most-one-block-per-bound-item recording. Only segment minutes are ever scaled.
- “Short on time — essentials only” keeps its exact meaning and stays independent of duration.
- Level 1A keeps its fourteen hand-authored steps and both of its existing routines, byte for byte.
- Every Setar and Tar pathway, stage, catalogue entry and routine is untouched, and so is the whole Setar archive: its index, scanner, publisher, refresh and adoption flow.
- The configured archive base keeps its value and meaning, so no device needs reconfiguring and every existing lesson reference resolves identically.
- The Session Plan is untouched and remains a separate peer; only its 5-120 minute bound is shared.
- Today keeps its doorway order, its card heights and its above-the-fold recommendation.
- No file bytes enter the app, sync or a backup, and no item, routine, stage or study source is ever created without an explicit owner action.

## New assumptions

- The guitar tree is already served by the NAS — verified directly, including a real 1B lesson video returning 206 video/mp4 — so no mirroring is needed and no new device setting is required.
- Course material is derived from the catalogue rather than copied onto items, so re-running the scanner after a course change reaches items that already exist.

## Show me

Open Pathways → Classical Guitar Shed → Level 1B. Instead of eight generic rows it lists the level's real sections — Chords (C, G7), Split Chunks P-IM and P-MA, I/M Alternation at 60 bpm, Finger-Walking, Rhythm Practice #1, Sight-Reading, Study #1 — plus the level's named works (Sor Op.35 No.1, Carulli Op.241 No.1, Ode to Joy and the rest of the packet). Add “Split Chunks” and open it: its four lesson videos and the level syllabus PDF are already under Material, no link ever typed, and tapping one opens it from the NAS — Settings shows the media root it derived from your archive base, with Browse to confirm. Add Study #1 and it appears in My repertoire under “Classical Guitar Shed”; add Finger-Walking and it does not. Back on the stage, press “Build one for where I am”: because only the sections up to 05_Scales have been added, the routine is 1A's essentials followed by just those 1B segments — Piece, Rhythm and Sight-Reading are simply absent, not skipped. It is an ordinary routine: reorder it, retime it, or set today's duration to 12 minutes and watch the segments scale in proportion, the non-essential ones dropping first while the asterisked ones stay. “Short on time” still does what it always did.



## Files in this diff

- AGENTS.md
- docs/cgs-course.md
- docs/setar-archive.md
- scripts/scan-cgs-course.mjs
- src/components/ItemMaterial.tsx
- src/components/RoutineDuration.tsx
- src/components/direction.test.ts
- src/domain/courseData.ts
- src/domain/courseSeed.test.ts
- src/domain/courseSeed.ts
- src/domain/index.ts
- src/domain/itemFiles.ts
- src/domain/mediaRoots.test.ts
- src/domain/mediaRoots.ts
- src/domain/pathwaySeed.ts
- src/domain/pathways.test.ts
- src/domain/pathways.ts
- src/domain/routines.test.ts
- src/domain/routines.ts
- src/pages/PathwayDetail.tsx
- src/pages/Settings.tsx
- src/pages/StageDetail.tsx
- src/pages/Today.tsx
- src/store/backup.ts
- src/store/useStore.ts

## Check against the contract

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

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/backup.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/store/backup.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## browse-my-repertoire — unchanged

No change to repertoire.ts, isWork, repertoireWorks or any of the three Repertoire views; the only shared thing with this lane is the PracticeItem entity. What a course item IS was fixed upstream, in what the catalogue declares: a Classical Guitar Shed level's own study section and its named packet works now carry strand 'piece' (so isWork is true, exactly as this flow has always treated a full piece), and every drill, exercise, rhythm, sight-reading and reading section carries a non-piece strand and stays out of repertoire — where the old generic 'Piece' placeholder wrongly created a work literally titled 'Piece'. src/domain/courseSeed.test.ts's "a level's study and packet works are repertoire works and its drill sections are not" asserts that against the real generated data through this flow's own isWork/repertoireWorks. One observable consequence, considered and deliberate: a course item now carries a materialId for the found-or-created 'Classical Guitar Shed' study source, so it groups under that source here instead of under 'No study source yet'. That is this flow's existing grouping rule applied to data that finally has a source, not a change to the rule. Verified in the running app: the item's Connected-to reads 'Study source: Classical Guitar Shed'.

## prepare-for-the-next-class — unchanged

Nothing in this lane touches lessonAgenda.ts, questions.ts, Lessons.tsx, LessonAgenda.tsx or ClassQuestions.tsx — none of them is in the contract's allowed paths and none appears in the diff. The only link is the shared PracticeItem entity, and this lane adds no field to it and changes no field it already had: an item created from a course catalogue entry differs from one created from any other catalogue entry only in carrying a materialId for the course's study source. lessonUrgencyScore, preparationDatesByItem, detachItem and every commitment/question rule are untouched, so committing a course item to a class, asking a question about it and marking that asked all behave exactly as they did. The full lesson-agenda browser journey (tests/lesson-agenda.browser.test.ts) passes unchanged.

## work-a-pathway-stage — truth-proposed

This is the flow the approved Delta is about, and what a stage OFFERS genuinely changes. A Classical Guitar Shed level from 1B on now lists the level's real sections read out of the course's own tree (courseData.ts, generated by scripts/scan-cgs-course.mjs) with their guidance, the syllabus target BPM where it could be read, and the level's named packet works — instead of eight generic placeholders. An item created from one carries its section's videos, scores and contrast-card folder in Material, composed LIVE by itemFiles from the catalogue and written nowhere. A course stage also offers two new actions, 'Use this level's routine' and 'Build one for where I am', both of which write an ORDINARY EDITABLE routine rather than a live view. Every existing step and rule of the flow is intact: the item is still the only unit of work, the catalogue is still reference data in code labelled as an aid, adding is still one tap arriving honestly as 'Not practised yet' with zero statistics and a durable Undo, isLosslesslyRemovable and the Remove affordance still work, stageUnits/itemStageState/stageProgress are untouched, and a routine still records at most one block per distinct bound item. Level 1A keeps its fourteen hand-authored steps and both routines byte for byte. Every pre-import stage id and catalogue key is preserved so an already-added item stays attached to its suggestion — asserted by src/domain/pathways.test.ts's "CGS stage ids and catalog keys stay stable across the course import". Verified in the running app at localhost: 1B lists its real sections, adding 1B Scales showed its lesson video under Material resolving to https://192.168.0.20:5010/classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4, and 'Build one for where I am' produced 1A's three essentials plus only 1B Scales.

## point-this-device-at-the-nas — mechanics-updated

Settings gains a second, read-mostly panel beneath the existing archive base: the SHARED MEDIA ROOT, derived as the folder above that base, shown on screen with its own Browse and an optional per-device override in localStorage (pc-media-root). The existing archive base is untouched in value and in meaning — getNasBaseUrl/setNasBaseUrl, normalizeBaseUrl, relativizeReference, archiveRootUrl, describeArchiveAccess, ReferenceEditor, Lessons and ArchiveRefresh all read and write exactly the same string they did, and every stored lesson reference resolves byte-identically (asserted in courseSeed.test.ts's "resolves a course file under the shared media root and leaves archive resolution unchanged", which checks both bases against the owner's real Mac and Tailscale values). This is NOT the second archive-specific base or the resolver fallback docs/setar-archive.md rules out: nothing resolves against two bases in turn — each composed reference carries root: 'archive' | 'media' and baseForItemFile picks exactly one — and nothing is guessed, since the derivation applies only when the base's last segment names a folder a shipped source declares and otherwise yields no root at all. A device on the LEGACY base one folder too high gets no media root, and a course file then reports no-base and offers no open action; that is not a new failure, since Setar references are already broken in that state and correcting the base once fixes both. docs/setar-archive.md now says all of this in its own words. No credential, no query, no fragment: normalizeBaseUrl still refuses them, and the root stays device-local, out of sync and out of backups.

## capture-a-practice-item — mechanics-updated

addFromCatalog now routes its whole decision through the pure planCatalogAddition (courseSeed.ts) and applies it as a single set() — the same shape-protects-the-wiring pattern installDatabase uses, because the Node test environment cannot import useStore.ts (Dexie via ./idb). Its existing contract is unchanged: an item still arrives status 'new' with zero statistics, still carries its catalogue key, still reuses an item already created from that (stageId, catalogKey), and stays losslessly removable. Two rules ride on top, both only for a stage a course owns: a packet work carried forward across levels is reused across stages rather than duplicated (its key is derived from the work, so the ordinary per-stage reuse is untouched and a 'chords' item in 1B can never be reused by 2B's), and the item is given the materialId of the course's found-or-created 'Classical Guitar Shed' study source. Because the source is resolved in the same pure value and installed in the same set(), a second course item can never mint a duplicate. Both are tested in courseSeed.test.ts. Quick add, the full 'Add practice item' form and every other creation path are untouched, and no required field is added anywhere.

## practise-todays-recommendation — mechanics-updated

Today's Routines doorway rows gain one extra affordance, 'Run it for a different length', shared with the stage and pathway routine surfaces through the single RoutineDuration component. It is COLLAPSED to one ghost button until tapped, and it sits inside the Routines card, which itself starts collapsed — so Today's layout is unchanged: both doorways stay above the recommendation, both stay at about 50px collapsed, and the primary recommendation stays above the fold at 390x844 (verified in the running app at that width: the instrument switcher, 'Plan this session · choose a length', 'Routines · 1 saved' and then PRACTISE NOW). Choosing a length starts the run with proportionally scaled segments (fitRoutineToMinutes) and navigates; the ordinary Start button and 'Short on time — essentials only' are untouched and keep their exact meanings, and doing nothing behaves exactly as before because the authored total returns the segments unchanged. Nothing about the recommendation engine, scoring, reviews or the practice totals line is touched.

## adjust-how-scheduling-works — unchanged

Settings.tsx and useStore.ts appear in the diff, but nothing in either change touches scheduling. scheduling.ts is forbidden by this contract and is not in the diff; decideReview, planNextReview, computeReviewOutcome, SchedulingParams, clampSchedulingParams and the 'How scheduling works' section are all untouched. Settings' only change is a new media-root panel appended after the NAS section and before ArchiveRefresh; useStore's changes are addFromCatalog's routing through a pure planner and two new course actions that write only pathwayStages and pathwayRoutines. Nothing here writes a block, a result, a review row or any SM-2 value.

## clear-a-due-review — unchanged

Today.tsx and useStore.ts appear in the diff but nothing in this lane touches reviews. Today's only change is adding the shared RoutineDuration control to its Routines doorway rows; the due-review row, 'Not now', snooze and the review actions are byte-identical. In the store, no new or changed action writes a Review, a nextReviewDate or any SM-2 field, and scheduling.ts is forbidden and absent from the diff. Practising stays the only thing that can complete a review or advance spacing — a routine run still records blocks with the factory-default not_logged result, and fitting a routine to a duration changes only segment minutes.

## back-up-and-restore — unchanged

backup.ts gains three device-local localStorage helpers for the optional media-root override (getMediaRootOverride/setMediaRootOverride/getMediaRoot) and nothing else. buildFullBackup, buildFullBackupWithRev, decodeBackupFiles, importFullBackup, replaceAllBlobs, recoverFromRefusedHydration and the archive-restore path are untouched, and SCHEMA_VERSION stays 14. Nothing new is persisted in PracticeDB, so no backup gains or loses a field; the media root is per-device environment config exactly like the archive base and stays out of exports, backups and sync. The rollback journey and the inbound journey both pass unchanged.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx is in the diff only because the media-root panel was appended to it; the install hints, the service-worker update banner, the build stamp and every PWA concern are untouched, and vite.config.ts, the CSP and the workflows are not in the diff at all. One measured consequence worth stating plainly: the generated course data is a ~222 KB committed literal that ships in the offline bundle, so the precache grew and now stands at 42 entries / 1021.93 KiB. The app still installs and works fully offline; this is the cost the approved plan named.

## log-a-class — unchanged

useStore.ts is in the diff but no lesson action changed. addLesson, updateLesson, deleteLesson, unlinkItemFromLesson, the recordings/ReferenceEditor path and every LessonRecording rule are untouched, and Lessons.tsx, LessonNotes.tsx and Attachments.tsx are not in the diff. The archive base a lesson reference resolves against keeps its exact value and meaning, so every existing class recording and score opens at the identical URL. The lesson-agenda browser journey passes unchanged.

## run-a-session-plan — unchanged

plan.ts, SessionPlan.tsx and CloseBlock.tsx are all forbidden by this contract and none is in the diff. The Session Plan's allocator is deliberately NOT reused for routine duration — allocateMinutes allocates by bucket priority with a pinned warm-up share and a 2-25 minute clamp, which would distort a one-minute syllabus segment — so fitRoutineToMinutes is its own pure function in routines.ts. The ONLY thing shared is validateBudgetMinutes and its 5-120 bound, imported so the duration control rejects exactly what 'Plan this session' rejects. Today.tsx's Plan doorway is untouched and still sits above the recommendation, collapsed.

## sync-devices-via-github — unchanged

syncEngine.ts, githubSync.ts, gitRemote.ts, canonical.ts, sync.ts, io.ts and migrations.ts are all forbidden by this contract and none is in the diff. SCHEMA_VERSION stays 14 and nothing new is persisted in PracticeDB: the course catalogue, its data and the syllabus routines are reference data in code, and the media-root override is per-device localStorage, so no snapshot gains a field and no content hash changes shape. The two new store actions write only into existing collections (pathwayStages, pathwayRoutines, items, materials) through the ordinary revision-bumping middleware. The inbound sync browser journey passes unchanged.

## see-practice-patterns — unchanged

Insights.tsx, insights.ts, selectors.ts and scoring.ts are not in the diff. practiceTotals, practiceTotalsByInstrument, instrumentBalance and every generated observation are untouched, and nothing in this lane writes a block, a minute or a result — a routine run still records what it always did. Today's practice-totals line is unchanged.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### install-the-app-and-keep-it-current — Works now

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now

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

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260921-bring-the-classical-guitar-shed-course-i-9b18/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260921-bring-the-classical-guitar-shed-course-i-9b18' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260921-bring-the-classical-guitar-shed-course-i-9b18/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260921-bring-the-classical-guitar-shed-course-i-9b18/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
