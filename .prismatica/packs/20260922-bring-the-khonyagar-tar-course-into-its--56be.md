---
id: 20260922-bring-the-khonyagar-tar-course-into-its--56be
contractId: 20260922-bring-the-khonyagar-tar-course-into-its--56be
contractHash: 17ca990514b8f65ef9e7b5c98ac6c74b8b1807d225c317996a6d4a8decd04a60
createdAt: 2026-09-22T21:24:49.862Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Bring the Khonyagar Tar course into its own Tar pathway with stable work identity and its complete material

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/34
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260922-bring-the-khonyagar-tar-course-into-its--56be

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Bring the Khonyagar Tar course into its own Tar pathway with stable work identity and its complete material

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Continue from the completed Classical Guitar Shed lane (now closed) and plan the most optimal Khonyagar/Tar lane. Claude should be the builder.
> 
> Source to inspect (available on the NAS too): /Volumes/Sandisk/video-courses/tar-classes/khonyagar-mirzapour
> 
> Treat the existing repo, the real Khonyagar folder structure/content, and the lessons learned from the CGS and Setar work as evidence rather than assumptions. Decide for yourself whether Khonyagar is best modelled as a structured course, pathway/reference data, lesson material, archive content, or a combination.
> 
> Optimise for the actual user experience of learning and practising Tar: useful course progression, repertoire where appropriate, practice material, routines/session planning, and automatic association of relevant videos/PDFs without unnecessary manual linking.
> 
> Carry forward the important correctness lessons from the CGS lane where relevant (disregard if not relevant):
> - musical-work identity should be explicit and stable rather than inferred by fuzzy title matching;
> - the same work appearing in multiple course locations should remain one repertoire item while retaining the complete material from all relevant locations;
> - distinct file paths must not be silently collapsed merely because filenames/titles match;
> - course/practice sections that contain multiple works or no single identifiable work should not become fake repertoire pieces;
> - owner edits, provenance, Undo/removal behaviour, and existing Setar/CGS data must remain safe;
> - prefer derived/reference data and existing concepts over new persisted schema or duplicated machinery where possible.
> 
> Also investigate the existing dated teacher/class folders separately rather than assuming they belong to the same model, and verify instrument attribution where ambiguous.
> 
> Keep the plan as wide as justified. Anticipate future additions/changes and reuse the multi-source media architecture from the completed CGS lane where appropriate. Prefer the smallest coherent architecture that gives a complete, useful Tar experience and minimises builder/reviewer rework.
> 
> Final validation pass (the owner's refinement, in their words):
> 
> The plan is strong and I do not want a redesign. Please make one final validation/revision pass before I import it.
> 
> In particular:
> 
> 1. Re-check work-key stability. Section ids are source-anchored (`s001`–`s106`), but make sure `w###` identities cannot change merely because the authored work table is reordered, corrected or a newly recognised work is inserted. Existing work identity must remain stable after first shipping; prefer an explicit/source-anchored authored identity rather than positional numbering if needed.
> 
> 2. Add a discriminating source-completeness invariant: the generated Khonyagar data must account for all 106 indexed sections, all 259 lesson videos exactly once at source identity level, and all four score books, with scanner/index/disk mismatches failing loudly.
> 
> 3. Re-evaluate, rather than assume, that equal-weight one-section-per-segment stage routines are the most useful application of the existing course machinery for Khonyagar, especially for 30-minute practice and stages with many sections. Use the course's own daily-practice guide as evidence. Keep the current design if it is still the best trade-off; change it only if there is a clearly better fit without unnecessary machinery.
> 
> Otherwise preserve the current architecture, scope and exclusions. Revalidate and return the updated import-ready plan.

## Why

Tar is the owner's third instrument and the only one with no real content in the app. Its pathway, `tar-honarestan`, is an honest placeholder: ten hand-authored stages whose own note says it is a framework drawn from Khonyagar's Honarestān teaching, to be filled in as the owner goes. Meanwhile the owner owns the complete Khonyagar (آزاد میرزاپور) Tar course: 259 lesson videos (~16h28m), a 106-section index and four score books, none of which the app can see.

The CGS lane built what this needs, and built it generically: `COURSES: CourseData[]` ("A second course is a second entry"), `courseStageSeeds`, `courseFilesFor` (a work's files unioned across every entry naming it, deduplicated BY PATH), `carriedCourseWorkItem` (one work, one item, scoped to its own course), `planCatalogAddition` (the study source found or created), and `knownSourceFolders()` (derived from `COURSES`). So this lane is mostly DATA plus one scanner. The code changes are small, optional additions in `courseSeed.ts` that leave CGS unchanged. A work row may carry its own `files`, `guidance` and `strand`, where today it is always a single-PDF `piece` with the Guitar packet note. A work-bearing section may carry the work's `workTitle`, and item creation uses that title. There is also one condition in `StageDetail.tsx`.

WHAT KHONYAGAR IS. It is a COURSE. It is a fixed download that does not grow, gets no renames and has no identity to reconcile against existing repertoire, so it needs no published index, digest or reconciler; it is not the Setar archive. It is also not a record of classes the owner attended, so it is not `Lesson` data. Its own `_فهرست — Index.md` states the structure and its `_راهنمای تمرین روزانه` states how to practise it.

FINDINGS FROM THE REAL SOURCE, re-measured in this pass:

1. THE NAS SERVES NFC; THE LOCAL DISK IS NFD. 78 of the 259 lesson filenames are decomposed on `/Volumes/Sandisk`. 76 of them differ from their index title by normalisation alone; `077` and `148` also by a double space. Re-probed in this pass on lesson 148: the decomposed name returns 404 text/html from the NAS and the composed one returns 206 video/mp4. Separately, `030`'s index title carries a leading space, which the earlier count missed. After NFC and whitespace collapse, every one of the 259 filenames matches its index title exactly. The rule: the stored path is the real filename NFC-normalised, and the displayed title is the index title with whitespace collapsed.

2. KEYS ARE ASCII, TITLES ARE FARSI. `seedMigration.test.ts` asserts `hasPersianScript(key) === false` over the whole catalogue and every stage id. That file is heavy-tier (`**/*migration*`) and out of scope, and it passes unchanged: it counts nothing, and it pins `SEED_PATHWAY_IDS.tar` to `tar-honarestan`, which stays.

3. WORK IDENTITY CANNOT BE INFERRED, AND IT LIVES AT THE LESSON, NOT THE SECTION. A crude title grammar over the section titles collapses every `اجرای X` into one empty stem, and it splits sections 52–55 from 56 on a ZWNJ alone (`پیش درآمد` vs `پیش‌درآمد`). The section is also the wrong unit. Works are taught INSIDE sections that are about something else:
- پیش‌درآمد ابوعطا is lessons 124 and 125, in sections 21 and 22, whose other lessons are Honarestān exercises;
- سرای امید is lessons 063 and 074, in sections 9 and 11;
- کاروان is lesson 036;
- section 17 teaches two works, in lessons 109 and 110.
The earlier rule, that a section naming no single work yields none, would have silently dropped all of these. So the authored work table records each work by the LESSON numbers that teach it, and the scanner derives the rest mechanically. A section all of whose lessons belong to one work IS that work. A work taught in lessons of a mixed section is its own catalogue row, in the stage of its first lesson, carrying exactly those lessons' videos.

4. SAME TITLE IS NOT SAME WORK. Section 26 is Musa Ma'rufi's چهارمضراب ماهور (Honarestān book 2); sections 95–97 and 101–104 are the radif's چهارمضراب ماهور; section 85, «چهارمضراب از ردیف ماهور», is a third. رنگ شور appears in both 30 and 32, and کرشمه in 25, 59 and 86–87. The source does not establish that any of these are one work, so they stay separate, and each pair is recorded as a diagnostic for the owner to confirm. A false split costs a visible duplicate that can later be joined by alias; a false merge destroys a record.

WORK IDENTITY IS STABLE AFTER FIRST SHIPPING (point 1). Items persist `catalogKey`, and a work row's catalogue key IS its work key. A key that changes meaning therefore silently moves an owner's item onto a different work. Positional numbering (`w001`, `w002`… in table order) would do exactly that on the first reorder or insertion. So a work key is `w` plus its ANCHOR LESSON, the lowest lesson number that teaches it at first shipping (`w197` for پیش‌درآمد ماهور درویش‌خان). It is written as a literal in the authored table and never computed. Reordering the table cannot touch it; a newly recognised work gets its own anchor; a correction may add lessons to a work but may not remove its anchor.

What an item actually persists decides what must never disappear. A work ROW's key is the item's `catalogKey`, so a shipped work row is never removed; a later merge gives it the existing alias (`CourseWork.workKey`) and keeps the row. A work that IS a section is held by the item as `sNNN`, and its work key lives only in the section's `workKey`, so a later merge may point that section at the other identity; the item keeps resolving, and nothing is destroyed. Two committed checks hold this, from a literal ledger written in the test and never derived from the data:
- every shipped work-row key still exists, and every ledgered key that still resolves names a work that includes its anchor lesson, so no key can ever be re-pointed at a different work;
- every shipped (stage, section) pair still exists, because a section moving stage orphans an item's material exactly as a renamed key would.
Section keys `s001`–`s106` are the index's own section numbers.

THE SOURCE IS ACCOUNTED FOR COMPLETELY, AT TWO LAYERS (point 2). The SCANNER reads the disk and the index, and exits non-zero and writes nothing on any mismatch. It requires:
- the index's declared total (۲۵۹ گفتار), the lessons it lists and the `NNN - *.mp4` files on disk to agree;
- sections 1–106, contiguous;
- every lesson listed exactly once, under one section;
- exactly 259 videos, the four listed score books and the two .md files in the folder, ignoring only dotfiles and `@eaDir`;
- every filename to match its title after NFC and whitespace collapse;
- every lesson in the work table to exist and belong to at most one work;
- the stage table to partition 1–106 into contiguous runs.
The COMMITTED DATA is then checked on its own, with 106, 259 and 4 written as literals in the test:
- lesson numbers read from the video paths are exactly 1–259, each once, contiguous and in order within each section;
- exactly the four score books appear, each referenced;
- every path is NFC and inside the course folder;
- every work's files are a subset of the sections' files.
Measured today: 106 contiguous sections, 259 lessons with no gaps, each section's lessons contiguous, and nothing else in the folder.

ROUTINES, RE-EVALUATED AGAINST THE COURSE'S OWN GUIDE, AND CHANGED (point 3). The earlier plan synthesised one routine per stage, with one equal-weight segment per section. The Daily Practice Guide contradicts that directly, and the arithmetic makes it worse:
- The guide is shaped by BLOCKS, not sections. At 30 minutes it is warm-up & tuning 4, technique/etude 7, today's lesson 10, review 6, cool-down 3, and it says "keep the order and the proportions". Its principles are one skill at a time and "2–3 loops max per session".
- Khonyagar's sections are SEQUENTIAL lessons: the guide's Block 3 is the one current گفتار. A CGS level's sections are concurrent strands practised every day for weeks. A section-per-segment routine fits the second and not the first.
- A 30-minute run over a stage of 5–18 sections gives about 1.5–6 minutes per section. With nothing essential, `fitRoutineToMinutes` drops the LATEST segments first, so a short day cuts the frontier and keeps the oldest material. That is the opposite of the guide's Quick Win (blocks 1→3→6).
- `applyRoutineRun` writes one block per bound item and applies its stats. One run therefore marks every section of the stage practised today, which removes all of them from the Session Plan's candidate pool for the day.
Two claims in the earlier text were wrong. The guide DOES name a minimum set (the Quick Win), just not per section. And fitting an equal-weight routine to 30 or 60 minutes does not reproduce the guide's 30/60 columns, which are block proportions. A third was overstated: that the existing Session Plan "already has the guide's shape". It does not, as follows.

WHAT THE SESSION PLAN ACTUALLY DOES, MEASURED. This pass ran the unchanged `buildSessionPlan` on two Tar states:
- Week one, three new sections added: 10 min gives one section for 10; 30 min gives three sections at 10 each; 60 min gives three at 20. There is no warm-up and no cool-down, because nothing is familiar or settled yet.
- A month in (one familiar section, one section due for review, the current new section, one settled piece): 30 min gives warm-up 4 → the due review 7 → the current section 15 → cool-down 4. At 60 min it gives warm-up 7, review 7, then three work segments of 16, 15 and 15, and no cool-down, because all five items were already placed.

Where it agrees with the guide:
- the warm-up comes first, at a pinned 12% share (4 of 30 minutes, the guide's own figure);
- due reviews come from the spacing schedule, which is what the guide's review ladder describes, held to 3–7 minutes (the guide gives 6);
- the cool-down comes last, the guide's golden rule;
- under 12 minutes it is one focus;
- at 30 minutes it seats at most four items, each a real block closed with a result.

Where it does not:
- The middle is ordered by priority, not technique → today's lesson → review, so a due review often comes BEFORE the new work. That breaks the guide's table, though it matches its principle 6 (retrieve cold before warming into it).
- There is no separate technique block and no ear/radif block.
- The warm-up and cool-down appear only when an item qualifies: a warm-up needs a familiar, not-too-hard item; a cool-down needs a settled item and at least 20 minutes. The guide's warm-up is tuning, open strings and a scale, which are not items.
- Minutes follow the app's bucket weights, not the guide's 30/60 columns.
- Its "lesson" bucket means preparation for a class, never the course's current گفتار.
- In week one it also splits the time evenly across what has been added — but over at most three or four items at 30 minutes, not a whole stage.

So the Session Plan is the closest EXISTING tool, not an implementation of the guide, and this lane presents it as exactly that. It stays unchanged: `plan.ts` and `SessionPlan.tsx` remain forbidden. Making it follow the guide's block order would change the plan for every instrument, which is a separate decision for the owner. The routine decision does not rest on the Session Plan; it stands on the four points above. The guide's own template reaches the owner as text, so its order is available to follow directly — tuning and open strings before starting the first segment, for example.

So every Khonyagar stage ships `routine: []`. The existing gate (`course.group.routine.length > 0`) already hides "Use this level's routine" and "Build one for where I am". The caption beneath them is gated only on `course` and would otherwise explain two buttons that are not there, so it takes the same condition. That is the one page edit in this lane. `courseRoutineName`, the routine functions and every CGS routine are untouched. The guide reaches the owner as TEXT, in its own English: its daily template and Quick Win on the pathway, and its advice for each lesson type (technique, etude, chahārmezrāb/reng, radif/gusheh, pish-daramad/tasnif) as the guidance each section and work carries into Working notes. The owner can still write any Tar routine by hand, binding segments to these items.

STRUCTURE. Units are the index's 106 sections. Stages are ten authored runs of consecutive sections, with the course's own three band names (تار مقدماتی / متوسطه / تار ۳) as the stage `group`. With routines gone, the reason for ten is no longer routine size. It is stage progress that means something (a single 61-section تار ۳ stage would read "3 of 61" for months) and a catalogue short enough to browse on a phone. The proposed runs keep every multi-section work inside one stage; they are listed in the assumptions and recorded with their evidence in `docs/khonyagar-course.md`.

A NEW PATHWAY; THE OLD ONE IS LEFT ALONE. `tar-khonyagar` is added beside `tar-honarestan`, whose ten stages, and any items placed in them, stay exactly as they are. `reseedDefaultPathways` adds any pathway that does not yet exist together with its stages, so the new pathway reaches the owner's existing database through the Repertoire button that already exists. `createSeedDB` builds from the same seed list, so a fresh install or demo reset gets it too.

THE DATED TEACHER FOLDERS ARE A DIFFERENT PROBLEM AND ARE EXCLUDED. This is unchanged from the earlier investigation: four teachers, 28 session folders, 207 files, 4.8 GB. The filenames name nothing; one folder is misspelled, one is named with a date range, one has a self-contradictory year, and `session-18-02-2026` cannot be parsed without guessing. `behrooz-hemati` sits under `tar-classes/` but carries a SETAR primer. These folders belong to `log-a-class` and the archive pipeline, once the owner has normalised them and confirmed each teacher's instrument.

## Today

The Tar pathway `tar-honarestan` exists with ten hand-authored stages and about twenty-six generic steps. Its own seed note says plainly that it is a framework to be filled in as the owner progresses. Nothing in the app knows the Khonyagar course exists.

Concretely, today:
- None of the course's 259 lesson videos, 106 sections or four score books is reachable from a practice item. A Tar item's Material section is empty, and the only way to attach anything is to type NAS links by hand, one at a time.
- The course's repertoire is not in the app, so none of it can be practised, scheduled, reviewed or shown in My repertoire. That includes the Mahur radif gushehs, پیش‌درآمد ماهور درویش‌خان, تصنیف ز من نگارم, both چهارمضراب ماهور (Ma'rufi's and the radif's), and the works taught inside other lessons, such as پیش‌درآمد ابوعطا and سرای امید.
- Several works are taught across consecutive sections: the radif's چهارمضراب ماهور spans seven, and پیش‌درآمد ماهور درویش‌خان six. Others are taught in lessons scattered across sections that are about something else. There is no way to express that each is one work.
- There is no Tar-specific practice guidance anywhere in the app, although the course ships its own daily practice guide.
- `COURSES` holds exactly one entry, `CGS_COURSE`. Every piece of course machinery the previous lane built — catalogue material, carried-forward work identity, study-source grouping and media-root registration — is available to Guitar only.
- The `tar-classes` folder is served by the NAS at the same shared media root the app already derives. Nothing declares it, so `knownSourceFolders()` does not list it and no path beneath it can resolve.

## Instead

The Khonyagar course is a second entry in `COURSES`, and the course machinery the CGS lane built applies to Tar.

- A new `tar-khonyagar` pathway presents the course's 106 sections as catalogue suggestions across ten stages, under the course's own three band headings (تار مقدماتی / متوسطه / تار ۳). Titles, stage codes and names are Farsi. Every key and id is pure ascii and anchored in the course's own numbering: `s001`–`s106` for sections, and `w` plus the anchor lesson for works. The pathway reaches the owner's existing database through the "restore default pathways" button that already exists, and fresh installs get it too.
- `tar-honarestan` is untouched: same stages, same catalogue keys, same items. The owner keeps or deletes it as they wish.
- Adding a section brings its lesson videos and its band's score book with it automatically, composed live from the catalogue by `itemFiles`, with no link ever typed. Every stored path is the real filename NFC-normalised, which is the form the NAS actually serves, so the files open with no new device setting. `tar-classes` registers itself through `knownSourceFolders()`, because the course declares its own `mediaPath`.
- Every work the authored table names reaches My repertoire once, grouped under a «خنیاگر» study source created on first use. It is titled with the WORK's own name, never a part's or a performance's label.
  - A work taught across several sections is ONE item carrying every one of those sections' files, deduplicated by path.
  - A work taught inside a mixed section is its own row, carrying exactly its own lessons.
  - A mixed section is itself no work.
  - Two works that share a title stay two works.
  - Nothing is ever merged without an explicit entry, and nothing is confused with a Setar or Guitar item of the same name.
- A work's identity never changes after it ships. Its key is anchored to a lesson and recorded literally. A later correction may join two works, as an alias on a work row or a changed identity on a section, but never by renaming, removing or re-pointing a key an item holds.
- The generated data accounts for the whole source: all 106 sections, each of the 259 lessons exactly once, and all four score books. The scanner refuses to write anything if the disk, the index and its own tables disagree.
- Practice follows the course's own guide, not a generated routine. Khonyagar stages offer no "Use this level's routine" or "Build one for where I am", and no caption for them. The guide reaches the owner as text: its daily template and Quick Win on the pathway, and its advice for each kind of lesson in the Working notes of every item created from the course. For a timed session, the existing, unchanged Session Plan builds from the Tar items the owner has added, as it does for any instrument. It puts a warm-up first and a cool-down last when an item qualifies, and due reviews and the most urgent work in between, by priority. It does not reproduce the guide's block order or minute columns, and nothing in this lane says it does. The owner can still write any Tar routine by hand.
- The dated teacher folders are not imported, and `docs/khonyagar-course.md` records exactly why and what would have to be true first.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- VERIFIED, not assumed: the NAS serves NFC while the local disk is NFD. 78 of 259 lesson filenames are decomposed. Re-probed in this pass on lesson 148: the decomposed name returns 404, the composed one 206 video/mp4. Three index titles carry stray whitespace (`030` a leading space; `077` and `148` a double space), and after NFC plus whitespace collapse all 259 filenames match their index titles exactly.
- VERIFIED: `https://192.168.0.20:5010/tar-classes/khonyagar-mirzapour/` and files beneath it resolve over the LAN route. The Tailscale route could not be probed from this machine and is covered by the owner check. Because the media root is derived per device, the iPhone needs no new configuration either.
- VERIFIED completeness baseline: the index declares ۲۵۹ گفتار and lists 259 lessons, 001–259, with no gaps, under 106 contiguous sections. Each section's lessons are contiguous and in order. The folder holds exactly 259 mp4 files, the four listed score books and the two .md files, and nothing else apart from dotfiles.
- VERIFIED: `createSeedDB` and `reseedDefaultPathways` both build from `seedPathways`, so the new pathway appears in a fresh seed as well as through the button. `seedMigration.test.ts` counts nothing and pins only Setar/Honarestān ids, so it passes unchanged. `migrations.test.ts` checks only idempotence over the seed. `pathways.test.ts` asserts `seed.pathways` has length 3 and `mediaRoots.test.ts` pins `knownSourceFolders()` to two folders; both are in scope and move to four and three.
- VERIFIED: `StageDetail.tsx` gates its two course-routine buttons on `course.group.routine.length > 0` but gates their caption on `course` alone. With `routine: []` the buttons disappear by themselves and the caption needs the same condition, which is why that page is in scope for exactly one condition.
- VERIFIED: `courseStageSeeds` writes the English `WORK_NOTE` ("Optional repertoire from the Level … practice packet") into every `CourseWork`'s notes, hard-codes `strand: 'piece'` on every work row, and `workFile` treats `CourseWork.file` as a single PDF. Khonyagar work rows need their own guidance, their own lesson videos and, for a gusheh taught inside a mixed section (گوشه کرشمه in lesson 135, section 25), the `radif` strand so it becomes a gusheh rather than a full piece. Hence the three optional `CourseWork` fields; CGS sets none of them.
- VERIFIED: every one of the 18 CGS groups has a non-empty routine (7–10 segments), so the check that Guitar levels still build their own routine is writable as stated. The course material row (`ItemMaterial.tsx`) renders generic copy ("On your NAS · video"), so Khonyagar rows need no UI change there.
- AGENTS.md's course section states in general terms that "A STAGE OFFERS TWO ROUTINES". That becomes false for Khonyagar, so the builder scopes that sentence to courses that ship a routine. It records there, not as a rule, why Khonyagar ships none, and that the Session Plan is the nearest existing tool rather than the guide's template.
- VERIFIED by running the unchanged `buildSessionPlan` on two Tar states (the outputs are quoted in the rationale). The rules that produce them, read in `plan.ts`: `segmentTarget` seats at most four segments below 45 minutes; the warm-up needs an item that is neither new nor resting, has difficulty ≤ 3, and has 3+ sessions or a familiar status; the cool-down needs an integrated, performable or maintenance item and a budget of at least 20 minutes; the middle is sorted by score, not by bucket; the warm-up's share is pinned at `round(B × 0.12)`; review segments are held to 3–7 minutes. Its `lesson` bucket is class preparation (`lessonAgenda`), which Khonyagar items carry only if the owner commits one to a class.
- VERIFIED: `stageUnits` shows `item?.title ?? entry.title`, and course order puts section 48 (a performance) and 49 (part three) before part one. Without `workTitle`, a multi-section work would enter My repertoire called «اجرای …» or «… بخش سوم», and every one of its section rows would show that label. With it, the item and all its added rows read as the work.
- VERIFIED: `courseStageId` (`${pathwayId}-${groupKey}`) must equal `stageIdFor(pathwayId, slug)`, so every Khonyagar stage key must be its own slug (lowercase ascii and hyphens).
- PROPOSED stage runs (authored; the builder confirms each against the source and records its evidence). مقدماتی: 1) s001–s005, instrument, mezrab, note values, 2/4 and 4/4, tuning; 2) s006–s013, frets, fingering and positions one to six; 3) s014–s023, 6/8, first pieces, pish-daramad and reng, ending on lesson 129 «توصیه‌های پایانی». متوسطه: 4) s024–s028, Mahur; 5) s029–s035, Shur; 6) s036–s045, Afshari, Segah, Isfahan, Dashti. تار ۳: 7) s046–s059; 8) s060–s074; 9) s075–s092; 10) s093–s106. The متوسطه/تار ۳ boundary is where the index itself changes shape, from topical multi-lesson sessions to one-gusheh and one-part sections of the Mahur radif and its pieces. No multi-section work crosses a stage boundary.
- The four score books attach by band, the one place the source itself states a band (in the PDF titles): نت ۱ on stages 1–3 and نت ۲ on 4–6. In تار ۳, نت ۳ (ردیف ماهور) goes on radif/gusheh entries and نت ۴ (قطعات ضربی) on rhythmic and composed pieces.
- Each entry's lesson type is authored in the scanner's table, which the grammar only proposes: `درس … کتاب هنرستان` → etude, `گوشه` → radif, `چهارمضراب`/`رنگ` → rhythmic piece, `پیش‌درآمد`/`تصنیف` → composed piece, anything else → technique. The type decides the strand, the band book and which of the guide's lesson-type paragraphs the entry carries. Only an entry that IS a work may carry a repertoire strand (`piece`, `repertoire` or `radif`, which becomes a gusheh work).
- The guide's text is quoted in its own English, as written. Translating it would be authoring new content.
- Roughly fifteen Khonyagar titles also appear in the owner's Setar registry (e.g. چهارپاره مرادخانی, ماهور صغیر, حصار, زنگوله, نیشابورک, دلکش). They are separate items on separate instruments and must never be deduplicated; `carriedCourseWorkItem` is already scoped to `ofThisCourse`, and an acceptance check pins it.
- The generated data is a committed literal in its own file, kept separate from the 228 KB `courseData.ts` so neither course's regeneration can disturb the other. It ships in the offline PWA bundle.
- Future Khonyagar corrections, or a third course, stay a data change: `COURSES` is the extension point, `knownSourceFolders()` derives from it, keys are only ever added, and a later work merge is an alias.

**Possible conflicts**

- Khonyagar and CGS now share `courseSeed.ts`. Every change there must keep CGS byte-identical. The sharpest points are the `WORK_NOTE` default, `workFile`'s single-PDF path and the title an item is created with.
- A path emitted in the local NFD form 404s on the NAS while looking perfectly correct in the repository and in any local file listing. This cannot be caught by eye, and is held closed by the scanner and by a pure data check over the generated file.
- `hasPersianScript` is asserted over `getCatalog()` in a heavy-tier file this lane cannot edit. A single Farsi character in any generated key or stage id fails a test the lane has no legal way to touch.
- Identity errors are silent. A merged pair destroys one work's record; a section title in My repertoire is a fake piece; a work taught inside a mixed section that is not recorded is lost repertoire; a key re-pointed after shipping moves an owner's item onto a different work; a shipped work row removed orphans the item holding its key. The checks are written to discriminate each of these.
- `courseFilesFor` deduplicates by PATH. Two genuinely different files whose titles match must both survive, and two references to one path must not appear twice.
- A section moved to another stage after shipping orphans its items' material exactly as a renamed key would, because items persist `stageId` together with `catalogKey`. The (stage, section) ledger is what stops a later boundary 'correction' from doing this.
- The new pathway arrives through `reseedDefaultPathways`, which the owner may press at any time, and through `createSeedDB` on a fresh install or demo reset. It must add the Khonyagar pathway and its stages and nothing else; in particular it must not touch `tar-honarestan`, whose pathway already exists.
- The owner's original request names routines. This lane deliberately generates none for Khonyagar, because the course's own guide argues against section routines. The existing Session Plan is the nearest tool, but it follows its own priority order and weights, not the guide's five blocks. No pathway text, doc or AGENTS.md entry may say it follows the guide; the owner check states what it really produces.
- The `StageDetail.tsx` edit must change the caption's condition only. Moving or re-wrapping its `<span dir="ltr">` would shift a recorded `direction.test.ts` site.
- Once a multi-section work is added, every one of its section rows shows the work's title. `stageUnits` already shows the item's title for an added row, so the part labels are visible only on sections not yet added. That is intended, and the owner check states it.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Continue from the completed Classical Guitar Shed lane (now closed) and plan the most optimal Khonyagar/Tar lane. Claude should be the builder.\n\nSource to inspect (available on the NAS too): /Volumes/Sandisk/video-courses/tar-classes/khonyagar-mirzapour\n\nTreat the existing repo, the real Khonyagar folder structure/content, and the lessons learned from the CGS and Setar work as evidence rather than assumptions. Decide for yourself whether Khonyagar is best modelled as a structured course, pathway/reference data, lesson material, archive content, or a combination.\n\nOptimise for the actual user experience of learning and practising Tar: useful course progression, repertoire where appropriate, practice material, routines/session planning, and automatic association of relevant videos/PDFs without unnecessary manual linking.\n\nCarry forward the important correctness lessons from the CGS lane where relevant (disregard if not relevant):\n- musical-work identity should be explicit and stable rather than inferred by fuzzy title matching;\n- the same work appearing in multiple course locations should remain one repertoire item while retaining the complete material from all relevant locations;\n- distinct file paths must not be silently collapsed merely because filenames/titles match;\n- course/practice sections that contain multiple works or no single identifiable work should not become fake repertoire pieces;\n- owner edits, provenance, Undo/removal behaviour, and existing Setar/CGS data must remain safe;\n- prefer derived/reference data and existing concepts over new persisted schema or duplicated machinery where possible.\n\nAlso investigate the existing dated teacher/class folders separately rather than assuming they belong to the same model, and verify instrument attribution where ambiguous.\n\nKeep the plan as wide as justified. Anticipate future additions/changes and reuse the multi-source media architecture from the completed CGS lane where appropriate. Prefer the smallest coherent architecture that gives a complete, useful Tar experience and minimises builder/reviewer rework.\n\nFinal validation pass (the owner's refinement, in their words):\n\nThe plan is strong and I do not want a redesign. Please make one final validation/revision pass before I import it.\n\nIn particular:\n\n1. Re-check work-key stability. Section ids are source-anchored (`s001`–`s106`), but make sure `w###` identities cannot change merely because the authored work table is reordered, corrected or a newly recognised work is inserted. Existing work identity must remain stable after first shipping; prefer an explicit/source-anchored authored identity rather than positional numbering if needed.\n\n2. Add a discriminating source-completeness invariant: the generated Khonyagar data must account for all 106 indexed sections, all 259 lesson videos exactly once at source identity level, and all four score books, with scanner/index/disk mismatches failing loudly.\n\n3. Re-evaluate, rather than assume, that equal-weight one-section-per-segment stage routines are the most useful application of the existing course machinery for Khonyagar, especially for 30-minute practice and stages with many sections. Use the course's own daily-practice guide as evidence. Keep the current design if it is still the best trade-off; change it only if there is a clearly better fit without unnecessary machinery.\n\nOtherwise preserve the current architecture, scope and exclusions. Revalidate and return the updated import-ready plan.",
  "builder": "claude",
  "summary": "Bring the Khonyagar Tar course into its own Tar pathway with stable work identity and its complete material",
  "rationale": "Tar is the owner's third instrument and the only one with no real content in the app. Its pathway, `tar-honarestan`, is an honest placeholder: ten hand-authored stages whose own note says it is a framework drawn from Khonyagar's Honarestān teaching, to be filled in as the owner goes. Meanwhile the owner owns the complete Khonyagar (آزاد میرزاپور) Tar course: 259 lesson videos (~16h28m), a 106-section index and four score books, none of which the app can see.\n\nThe CGS lane built what this needs, and built it generically: `COURSES: CourseData[]` (\"A second course is a second entry\"), `courseStageSeeds`, `courseFilesFor` (a work's files unioned across every entry naming it, deduplicated BY PATH), `carriedCourseWorkItem` (one work, one item, scoped to its own course), `planCatalogAddition` (the study source found or created), and `knownSourceFolders()` (derived from `COURSES`). So this lane is mostly DATA plus one scanner. The code changes are small, optional additions in `courseSeed.ts` that leave CGS unchanged. A work row may carry its own `files`, `guidance` and `strand`, where today it is always a single-PDF `piece` with the Guitar packet note. A work-bearing section may carry the work's `workTitle`, and item creation uses that title. There is also one condition in `StageDetail.tsx`.\n\nWHAT KHONYAGAR IS. It is a COURSE. It is a fixed download that does not grow, gets no renames and has no identity to reconcile against existing repertoire, so it needs no published index, digest or reconciler; it is not the Setar archive. It is also not a record of classes the owner attended, so it is not `Lesson` data. Its own `_فهرست — Index.md` states the structure and its `_راهنمای تمرین روزانه` states how to practise it.\n\nFINDINGS FROM THE REAL SOURCE, re-measured in this pass:\n\n1. THE NAS SERVES NFC; THE LOCAL DISK IS NFD. 78 of the 259 lesson filenames are decomposed on `/Volumes/Sandisk`. 76 of them differ from their index title by normalisation alone; `077` and `148` also by a double space. Re-probed in this pass on lesson 148: the decomposed name returns 404 text/html from the NAS and the composed one returns 206 video/mp4. Separately, `030`'s index title carries a leading space, which the earlier count missed. After NFC and whitespace collapse, every one of the 259 filenames matches its index title exactly. The rule: the stored path is the real filename NFC-normalised, and the displayed title is the index title with whitespace collapsed.\n\n2. KEYS ARE ASCII, TITLES ARE FARSI. `seedMigration.test.ts` asserts `hasPersianScript(key) === false` over the whole catalogue and every stage id. That file is heavy-tier (`**/*migration*`) and out of scope, and it passes unchanged: it counts nothing, and it pins `SEED_PATHWAY_IDS.tar` to `tar-honarestan`, which stays.\n\n3. WORK IDENTITY CANNOT BE INFERRED, AND IT LIVES AT THE LESSON, NOT THE SECTION. A crude title grammar over the section titles collapses every `اجرای X` into one empty stem, and it splits sections 52–55 from 56 on a ZWNJ alone (`پیش درآمد` vs `پیش‌درآمد`). The section is also the wrong unit. Works are taught INSIDE sections that are about something else:\n- پیش‌درآمد ابوعطا is lessons 124 and 125, in sections 21 and 22, whose other lessons are Honarestān exercises;\n- سرای امید is lessons 063 and 074, in sections 9 and 11;\n- کاروان is lesson 036;\n- section 17 teaches two works, in lessons 109 and 110.\nThe earlier rule, that a section naming no single work yields none, would have silently dropped all of these. So the authored work table records each work by the LESSON numbers that teach it, and the scanner derives the rest mechanically. A section all of whose lessons belong to one work IS that work. A work taught in lessons of a mixed section is its own catalogue row, in the stage of its first lesson, carrying exactly those lessons' videos.\n\n4. SAME TITLE IS NOT SAME WORK. Section 26 is Musa Ma'rufi's چهارمضراب ماهور (Honarestān book 2); sections 95–97 and 101–104 are the radif's چهارمضراب ماهور; section 85, «چهارمضراب از ردیف ماهور», is a third. رنگ شور appears in both 30 and 32, and کرشمه in 25, 59 and 86–87. The source does not establish that any of these are one work, so they stay separate, and each pair is recorded as a diagnostic for the owner to confirm. A false split costs a visible duplicate that can later be joined by alias; a false merge destroys a record.\n\nWORK IDENTITY IS STABLE AFTER FIRST SHIPPING (point 1). Items persist `catalogKey`, and a work row's catalogue key IS its work key. A key that changes meaning therefore silently moves an owner's item onto a different work. Positional numbering (`w001`, `w002`… in table order) would do exactly that on the first reorder or insertion. So a work key is `w` plus its ANCHOR LESSON, the lowest lesson number that teaches it at first shipping (`w197` for پیش‌درآمد ماهور درویش‌خان). It is written as a literal in the authored table and never computed. Reordering the table cannot touch it; a newly recognised work gets its own anchor; a correction may add lessons to a work but may not remove its anchor.\n\nWhat an item actually persists decides what must never disappear. A work ROW's key is the item's `catalogKey`, so a shipped work row is never removed; a later merge gives it the existing alias (`CourseWork.workKey`) and keeps the row. A work that IS a section is held by the item as `sNNN`, and its work key lives only in the section's `workKey`, so a later merge may point that section at the other identity; the item keeps resolving, and nothing is destroyed. Two committed checks hold this, from a literal ledger written in the test and never derived from the data:\n- every shipped work-row key still exists, and every ledgered key that still resolves names a work that includes its anchor lesson, so no key can ever be re-pointed at a different work;\n- every shipped (stage, section) pair still exists, because a section moving stage orphans an item's material exactly as a renamed key would.\nSection keys `s001`–`s106` are the index's own section numbers.\n\nTHE SOURCE IS ACCOUNTED FOR COMPLETELY, AT TWO LAYERS (point 2). The SCANNER reads the disk and the index, and exits non-zero and writes nothing on any mismatch. It requires:\n- the index's declared total (۲۵۹ گفتار), the lessons it lists and the `NNN - *.mp4` files on disk to agree;\n- sections 1–106, contiguous;\n- every lesson listed exactly once, under one section;\n- exactly 259 videos, the four listed score books and the two .md files in the folder, ignoring only dotfiles and `@eaDir`;\n- every filename to match its title after NFC and whitespace collapse;\n- every lesson in the work table to exist and belong to at most one work;\n- the stage table to partition 1–106 into contiguous runs.\nThe COMMITTED DATA is then checked on its own, with 106, 259 and 4 written as literals in the test:\n- lesson numbers read from the video paths are exactly 1–259, each once, contiguous and in order within each section;\n- exactly the four score books appear, each referenced;\n- every path is NFC and inside the course folder;\n- every work's files are a subset of the sections' files.\nMeasured today: 106 contiguous sections, 259 lessons with no gaps, each section's lessons contiguous, and nothing else in the folder.\n\nROUTINES, RE-EVALUATED AGAINST THE COURSE'S OWN GUIDE, AND CHANGED (point 3). The earlier plan synthesised one routine per stage, with one equal-weight segment per section. The Daily Practice Guide contradicts that directly, and the arithmetic makes it worse:\n- The guide is shaped by BLOCKS, not sections. At 30 minutes it is warm-up & tuning 4, technique/etude 7, today's lesson 10, review 6, cool-down 3, and it says \"keep the order and the proportions\". Its principles are one skill at a time and \"2–3 loops max per session\".\n- Khonyagar's sections are SEQUENTIAL lessons: the guide's Block 3 is the one current گفتار. A CGS level's sections are concurrent strands practised every day for weeks. A section-per-segment routine fits the second and not the first.\n- A 30-minute run over a stage of 5–18 sections gives about 1.5–6 minutes per section. With nothing essential, `fitRoutineToMinutes` drops the LATEST segments first, so a short day cuts the frontier and keeps the oldest material. That is the opposite of the guide's Quick Win (blocks 1→3→6).\n- `applyRoutineRun` writes one block per bound item and applies its stats. One run therefore marks every section of the stage practised today, which removes all of them from the Session Plan's candidate pool for the day.\nTwo claims in the earlier text were wrong. The guide DOES name a minimum set (the Quick Win), just not per section. And fitting an equal-weight routine to 30 or 60 minutes does not reproduce the guide's 30/60 columns, which are block proportions. A third was overstated: that the existing Session Plan \"already has the guide's shape\". It does not, as follows.\n\nWHAT THE SESSION PLAN ACTUALLY DOES, MEASURED. This pass ran the unchanged `buildSessionPlan` on two Tar states:\n- Week one, three new sections added: 10 min gives one section for 10; 30 min gives three sections at 10 each; 60 min gives three at 20. There is no warm-up and no cool-down, because nothing is familiar or settled yet.\n- A month in (one familiar section, one section due for review, the current new section, one settled piece): 30 min gives warm-up 4 → the due review 7 → the current section 15 → cool-down 4. At 60 min it gives warm-up 7, review 7, then three work segments of 16, 15 and 15, and no cool-down, because all five items were already placed.\n\nWhere it agrees with the guide:\n- the warm-up comes first, at a pinned 12% share (4 of 30 minutes, the guide's own figure);\n- due reviews come from the spacing schedule, which is what the guide's review ladder describes, held to 3–7 minutes (the guide gives 6);\n- the cool-down comes last, the guide's golden rule;\n- under 12 minutes it is one focus;\n- at 30 minutes it seats at most four items, each a real block closed with a result.\n\nWhere it does not:\n- The middle is ordered by priority, not technique → today's lesson → review, so a due review often comes BEFORE the new work. That breaks the guide's table, though it matches its principle 6 (retrieve cold before warming into it).\n- There is no separate technique block and no ear/radif block.\n- The warm-up and cool-down appear only when an item qualifies: a warm-up needs a familiar, not-too-hard item; a cool-down needs a settled item and at least 20 minutes. The guide's warm-up is tuning, open strings and a scale, which are not items.\n- Minutes follow the app's bucket weights, not the guide's 30/60 columns.\n- Its \"lesson\" bucket means preparation for a class, never the course's current گفتار.\n- In week one it also splits the time evenly across what has been added — but over at most three or four items at 30 minutes, not a whole stage.\n\nSo the Session Plan is the closest EXISTING tool, not an implementation of the guide, and this lane presents it as exactly that. It stays unchanged: `plan.ts` and `SessionPlan.tsx` remain forbidden. Making it follow the guide's block order would change the plan for every instrument, which is a separate decision for the owner. The routine decision does not rest on the Session Plan; it stands on the four points above. The guide's own template reaches the owner as text, so its order is available to follow directly — tuning and open strings before starting the first segment, for example.\n\nSo every Khonyagar stage ships `routine: []`. The existing gate (`course.group.routine.length > 0`) already hides \"Use this level's routine\" and \"Build one for where I am\". The caption beneath them is gated only on `course` and would otherwise explain two buttons that are not there, so it takes the same condition. That is the one page edit in this lane. `courseRoutineName`, the routine functions and every CGS routine are untouched. The guide reaches the owner as TEXT, in its own English: its daily template and Quick Win on the pathway, and its advice for each lesson type (technique, etude, chahārmezrāb/reng, radif/gusheh, pish-daramad/tasnif) as the guidance each section and work carries into Working notes. The owner can still write any Tar routine by hand, binding segments to these items.\n\nSTRUCTURE. Units are the index's 106 sections. Stages are ten authored runs of consecutive sections, with the course's own three band names (تار مقدماتی / متوسطه / تار ۳) as the stage `group`. With routines gone, the reason for ten is no longer routine size. It is stage progress that means something (a single 61-section تار ۳ stage would read \"3 of 61\" for months) and a catalogue short enough to browse on a phone. The proposed runs keep every multi-section work inside one stage; they are listed in the assumptions and recorded with their evidence in `docs/khonyagar-course.md`.\n\nA NEW PATHWAY; THE OLD ONE IS LEFT ALONE. `tar-khonyagar` is added beside `tar-honarestan`, whose ten stages, and any items placed in them, stay exactly as they are. `reseedDefaultPathways` adds any pathway that does not yet exist together with its stages, so the new pathway reaches the owner's existing database through the Repertoire button that already exists. `createSeedDB` builds from the same seed list, so a fresh install or demo reset gets it too.\n\nTHE DATED TEACHER FOLDERS ARE A DIFFERENT PROBLEM AND ARE EXCLUDED. This is unchanged from the earlier investigation: four teachers, 28 session folders, 207 files, 4.8 GB. The filenames name nothing; one folder is misspelled, one is named with a date range, one has a self-contradictory year, and `session-18-02-2026` cannot be parsed without guessing. `behrooz-hemati` sits under `tar-classes/` but carries a SETAR primer. These folders belong to `log-a-class` and the archive pipeline, once the owner has normalised them and confirmed each teacher's instrument.",
  "kind": "existing-flow",
  "flowId": "work-a-pathway-stage",
  "currentBehaviour": "The Tar pathway `tar-honarestan` exists with ten hand-authored stages and about twenty-six generic steps. Its own seed note says plainly that it is a framework to be filled in as the owner progresses. Nothing in the app knows the Khonyagar course exists.\n\nConcretely, today:\n- None of the course's 259 lesson videos, 106 sections or four score books is reachable from a practice item. A Tar item's Material section is empty, and the only way to attach anything is to type NAS links by hand, one at a time.\n- The course's repertoire is not in the app, so none of it can be practised, scheduled, reviewed or shown in My repertoire. That includes the Mahur radif gushehs, پیش‌درآمد ماهور درویش‌خان, تصنیف ز من نگارم, both چهارمضراب ماهور (Ma'rufi's and the radif's), and the works taught inside other lessons, such as پیش‌درآمد ابوعطا and سرای امید.\n- Several works are taught across consecutive sections: the radif's چهارمضراب ماهور spans seven, and پیش‌درآمد ماهور درویش‌خان six. Others are taught in lessons scattered across sections that are about something else. There is no way to express that each is one work.\n- There is no Tar-specific practice guidance anywhere in the app, although the course ships its own daily practice guide.\n- `COURSES` holds exactly one entry, `CGS_COURSE`. Every piece of course machinery the previous lane built — catalogue material, carried-forward work identity, study-source grouping and media-root registration — is available to Guitar only.\n- The `tar-classes` folder is served by the NAS at the same shared media root the app already derives. Nothing declares it, so `knownSourceFolders()` does not list it and no path beneath it can resolve.",
  "desiredBehaviour": "The Khonyagar course is a second entry in `COURSES`, and the course machinery the CGS lane built applies to Tar.\n\n- A new `tar-khonyagar` pathway presents the course's 106 sections as catalogue suggestions across ten stages, under the course's own three band headings (تار مقدماتی / متوسطه / تار ۳). Titles, stage codes and names are Farsi. Every key and id is pure ascii and anchored in the course's own numbering: `s001`–`s106` for sections, and `w` plus the anchor lesson for works. The pathway reaches the owner's existing database through the \"restore default pathways\" button that already exists, and fresh installs get it too.\n- `tar-honarestan` is untouched: same stages, same catalogue keys, same items. The owner keeps or deletes it as they wish.\n- Adding a section brings its lesson videos and its band's score book with it automatically, composed live from the catalogue by `itemFiles`, with no link ever typed. Every stored path is the real filename NFC-normalised, which is the form the NAS actually serves, so the files open with no new device setting. `tar-classes` registers itself through `knownSourceFolders()`, because the course declares its own `mediaPath`.\n- Every work the authored table names reaches My repertoire once, grouped under a «خنیاگر» study source created on first use. It is titled with the WORK's own name, never a part's or a performance's label.\n  - A work taught across several sections is ONE item carrying every one of those sections' files, deduplicated by path.\n  - A work taught inside a mixed section is its own row, carrying exactly its own lessons.\n  - A mixed section is itself no work.\n  - Two works that share a title stay two works.\n  - Nothing is ever merged without an explicit entry, and nothing is confused with a Setar or Guitar item of the same name.\n- A work's identity never changes after it ships. Its key is anchored to a lesson and recorded literally. A later correction may join two works, as an alias on a work row or a changed identity on a section, but never by renaming, removing or re-pointing a key an item holds.\n- The generated data accounts for the whole source: all 106 sections, each of the 259 lessons exactly once, and all four score books. The scanner refuses to write anything if the disk, the index and its own tables disagree.\n- Practice follows the course's own guide, not a generated routine. Khonyagar stages offer no \"Use this level's routine\" or \"Build one for where I am\", and no caption for them. The guide reaches the owner as text: its daily template and Quick Win on the pathway, and its advice for each kind of lesson in the Working notes of every item created from the course. For a timed session, the existing, unchanged Session Plan builds from the Tar items the owner has added, as it does for any instrument. It puts a warm-up first and a cool-down last when an item qualifies, and due reviews and the most urgent work in between, by priority. It does not reproduce the guide's block order or minute columns, and nothing in this lane says it does. The owner can still write any Tar routine by hand.\n- The dated teacher folders are not imported, and `docs/khonyagar-course.md` records exactly why and what would have to be true first.",
  "mustNotChange": [
    "`tar-honarestan` is untouched: its ten stages, their ids, codes, titles and every catalogue key stay byte-identical, so any item the owner has already placed in them keeps its suggestion. `SEED_PATHWAY_IDS.tar` stays `tar-honarestan`, so the demo seed's Tar item keeps its stage.",
    "The Setar class archive and the Classical Guitar Shed course are untouched: `sourceArchive.ts`, `sourceReconcile.ts`, `courseData.ts`, `scan-setar-classes.mjs` and `scan-cgs-course.mjs` stay as they are. So does every CGS stage, key, work, work note, routine and routine name, and the title a CGS item is created with.",
    "No schema change and no migration: `SCHEMA_VERSION` stays where it is, `migrations.ts`, `io.ts` and `types.ts` are forbidden by scope, and nothing new is persisted in `PracticeDB`. The course is reference data in code.",
    "`getNasBaseUrl()` and the derived shared media root keep their current values and meaning. `tar-classes` is registered only because the course declares its own `mediaPath`, through the existing `knownSourceFolders()` derivation. There is no new device setting, no per-source root and no resolver fallback.",
    "`reseedDefaultPathways` and its Repertoire button are NOT changed. They already add a pathway that does not yet exist together with its stages, which is exactly how the new pathway reaches an existing database. A stage the owner deliberately deleted from an EXISTING pathway is still never resurrected.",
    "Every shared course function keeps its current behaviour and signature for CGS: `courseStageSeeds`, `courseFilesFor`, `planCatalogAddition`, `carriedCourseWorkItem`, `buildLevelRoutine`, `buildPositionRoutine`, `courseRoutineName` and `courseRoutine`. The new optional fields (`CourseWork.files`, `CourseWork.guidance`, `CourseWork.strand`, `CourseUnit.workTitle`) are absent from every CGS entry, so CGS output is byte-identical.",
    "Routine machinery and the Session Plan are untouched: `routines.ts`, `plan.ts`, `RoutineRunner.tsx`, `RoutineDuration.tsx` and `SessionPlan.tsx` are forbidden by scope.",
    "Work identity stays course-scoped: a Khonyagar work can never reuse, rename or absorb a CGS item or a Setar archive item. A Setar piece sharing its name stays a separate item on a separate instrument.",
    "Every catalogue key, work key and stage id is pure ascii. Once shipped, a section key, stage id or work-row key is only ever added, never renamed or removed, and no work key is ever re-pointed at a different work. `seedMigration.test.ts` therefore passes unchanged, and no already-added item is ever orphaned or silently moved onto a different work.",
    "`addFromCatalog` keeps its contract: a catalogue item arrives `status: 'new'` with zero statistics and stays losslessly removable, so `isLosslesslyRemovable`, the Remove affordance and the durable Undo keep working. An Undo still reaches only an item the tap created.",
    "No bytes enter the app: no video, PDF or image is ever attached, cached, synced or backed up. r-large-files-stay-on-nas holds unchanged.",
    "Practising stays the only thing that completes a review or advances SM-2. Nothing here writes a block, a result or a schedule, and no imported section or work arrives with practice history.",
    "Direction handling is unchanged: Farsi titles resolve natively through the existing `dir=\"auto\"` groups. The `StageDetail.tsx` edit changes a condition only, and no recorded `dir` site or `direction.test.ts` inventory entry moves.",
    "`scripts/scan-khonyagar-course.mjs` is a build-time tool only: stdlib, dry-run by default, never imported by or reachable from any runtime path in `src/`.",
    "No dated teacher-class folder is imported, and no `Lesson` record is created by this lane."
  ],
  "assumptions": [
    "VERIFIED, not assumed: the NAS serves NFC while the local disk is NFD. 78 of 259 lesson filenames are decomposed. Re-probed in this pass on lesson 148: the decomposed name returns 404, the composed one 206 video/mp4. Three index titles carry stray whitespace (`030` a leading space; `077` and `148` a double space), and after NFC plus whitespace collapse all 259 filenames match their index titles exactly.",
    "VERIFIED: `https://192.168.0.20:5010/tar-classes/khonyagar-mirzapour/` and files beneath it resolve over the LAN route. The Tailscale route could not be probed from this machine and is covered by the owner check. Because the media root is derived per device, the iPhone needs no new configuration either.",
    "VERIFIED completeness baseline: the index declares ۲۵۹ گفتار and lists 259 lessons, 001–259, with no gaps, under 106 contiguous sections. Each section's lessons are contiguous and in order. The folder holds exactly 259 mp4 files, the four listed score books and the two .md files, and nothing else apart from dotfiles.",
    "VERIFIED: `createSeedDB` and `reseedDefaultPathways` both build from `seedPathways`, so the new pathway appears in a fresh seed as well as through the button. `seedMigration.test.ts` counts nothing and pins only Setar/Honarestān ids, so it passes unchanged. `migrations.test.ts` checks only idempotence over the seed. `pathways.test.ts` asserts `seed.pathways` has length 3 and `mediaRoots.test.ts` pins `knownSourceFolders()` to two folders; both are in scope and move to four and three.",
    "VERIFIED: `StageDetail.tsx` gates its two course-routine buttons on `course.group.routine.length > 0` but gates their caption on `course` alone. With `routine: []` the buttons disappear by themselves and the caption needs the same condition, which is why that page is in scope for exactly one condition.",
    "VERIFIED: `courseStageSeeds` writes the English `WORK_NOTE` (\"Optional repertoire from the Level … practice packet\") into every `CourseWork`'s notes, hard-codes `strand: 'piece'` on every work row, and `workFile` treats `CourseWork.file` as a single PDF. Khonyagar work rows need their own guidance, their own lesson videos and, for a gusheh taught inside a mixed section (گوشه کرشمه in lesson 135, section 25), the `radif` strand so it becomes a gusheh rather than a full piece. Hence the three optional `CourseWork` fields; CGS sets none of them.",
    "VERIFIED: every one of the 18 CGS groups has a non-empty routine (7–10 segments), so the check that Guitar levels still build their own routine is writable as stated. The course material row (`ItemMaterial.tsx`) renders generic copy (\"On your NAS · video\"), so Khonyagar rows need no UI change there.",
    "AGENTS.md's course section states in general terms that \"A STAGE OFFERS TWO ROUTINES\". That becomes false for Khonyagar, so the builder scopes that sentence to courses that ship a routine. It records there, not as a rule, why Khonyagar ships none, and that the Session Plan is the nearest existing tool rather than the guide's template.",
    "VERIFIED by running the unchanged `buildSessionPlan` on two Tar states (the outputs are quoted in the rationale). The rules that produce them, read in `plan.ts`: `segmentTarget` seats at most four segments below 45 minutes; the warm-up needs an item that is neither new nor resting, has difficulty ≤ 3, and has 3+ sessions or a familiar status; the cool-down needs an integrated, performable or maintenance item and a budget of at least 20 minutes; the middle is sorted by score, not by bucket; the warm-up's share is pinned at `round(B × 0.12)`; review segments are held to 3–7 minutes. Its `lesson` bucket is class preparation (`lessonAgenda`), which Khonyagar items carry only if the owner commits one to a class.",
    "VERIFIED: `stageUnits` shows `item?.title ?? entry.title`, and course order puts section 48 (a performance) and 49 (part three) before part one. Without `workTitle`, a multi-section work would enter My repertoire called «اجرای …» or «… بخش سوم», and every one of its section rows would show that label. With it, the item and all its added rows read as the work.",
    "VERIFIED: `courseStageId` (`${pathwayId}-${groupKey}`) must equal `stageIdFor(pathwayId, slug)`, so every Khonyagar stage key must be its own slug (lowercase ascii and hyphens).",
    "PROPOSED stage runs (authored; the builder confirms each against the source and records its evidence). مقدماتی: 1) s001–s005, instrument, mezrab, note values, 2/4 and 4/4, tuning; 2) s006–s013, frets, fingering and positions one to six; 3) s014–s023, 6/8, first pieces, pish-daramad and reng, ending on lesson 129 «توصیه‌های پایانی». متوسطه: 4) s024–s028, Mahur; 5) s029–s035, Shur; 6) s036–s045, Afshari, Segah, Isfahan, Dashti. تار ۳: 7) s046–s059; 8) s060–s074; 9) s075–s092; 10) s093–s106. The متوسطه/تار ۳ boundary is where the index itself changes shape, from topical multi-lesson sessions to one-gusheh and one-part sections of the Mahur radif and its pieces. No multi-section work crosses a stage boundary.",
    "The four score books attach by band, the one place the source itself states a band (in the PDF titles): نت ۱ on stages 1–3 and نت ۲ on 4–6. In تار ۳, نت ۳ (ردیف ماهور) goes on radif/gusheh entries and نت ۴ (قطعات ضربی) on rhythmic and composed pieces.",
    "Each entry's lesson type is authored in the scanner's table, which the grammar only proposes: `درس … کتاب هنرستان` → etude, `گوشه` → radif, `چهارمضراب`/`رنگ` → rhythmic piece, `پیش‌درآمد`/`تصنیف` → composed piece, anything else → technique. The type decides the strand, the band book and which of the guide's lesson-type paragraphs the entry carries. Only an entry that IS a work may carry a repertoire strand (`piece`, `repertoire` or `radif`, which becomes a gusheh work).",
    "The guide's text is quoted in its own English, as written. Translating it would be authoring new content.",
    "Roughly fifteen Khonyagar titles also appear in the owner's Setar registry (e.g. چهارپاره مرادخانی, ماهور صغیر, حصار, زنگوله, نیشابورک, دلکش). They are separate items on separate instruments and must never be deduplicated; `carriedCourseWorkItem` is already scoped to `ofThisCourse`, and an acceptance check pins it.",
    "The generated data is a committed literal in its own file, kept separate from the 228 KB `courseData.ts` so neither course's regeneration can disturb the other. It ships in the offline PWA bundle.",
    "Future Khonyagar corrections, or a third course, stay a data change: `COURSES` is the extension point, `knownSourceFolders()` derives from it, keys are only ever added, and a later work merge is an alias."
  ],
  "possibleConflicts": [
    "Khonyagar and CGS now share `courseSeed.ts`. Every change there must keep CGS byte-identical. The sharpest points are the `WORK_NOTE` default, `workFile`'s single-PDF path and the title an item is created with.",
    "A path emitted in the local NFD form 404s on the NAS while looking perfectly correct in the repository and in any local file listing. This cannot be caught by eye, and is held closed by the scanner and by a pure data check over the generated file.",
    "`hasPersianScript` is asserted over `getCatalog()` in a heavy-tier file this lane cannot edit. A single Farsi character in any generated key or stage id fails a test the lane has no legal way to touch.",
    "Identity errors are silent. A merged pair destroys one work's record; a section title in My repertoire is a fake piece; a work taught inside a mixed section that is not recorded is lost repertoire; a key re-pointed after shipping moves an owner's item onto a different work; a shipped work row removed orphans the item holding its key. The checks are written to discriminate each of these.",
    "`courseFilesFor` deduplicates by PATH. Two genuinely different files whose titles match must both survive, and two references to one path must not appear twice.",
    "A section moved to another stage after shipping orphans its items' material exactly as a renamed key would, because items persist `stageId` together with `catalogKey`. The (stage, section) ledger is what stops a later boundary 'correction' from doing this.",
    "The new pathway arrives through `reseedDefaultPathways`, which the owner may press at any time, and through `createSeedDB` on a fresh install or demo reset. It must add the Khonyagar pathway and its stages and nothing else; in particular it must not touch `tar-honarestan`, whose pathway already exists.",
    "The owner's original request names routines. This lane deliberately generates none for Khonyagar, because the course's own guide argues against section routines. The existing Session Plan is the nearest tool, but it follows its own priority order and weights, not the guide's five blocks. No pathway text, doc or AGENTS.md entry may say it follows the guide; the owner check states what it really produces.",
    "The `StageDetail.tsx` edit must change the caption's condition only. Moving or re-wrapping its `<span dir=\"ltr\">` would shift a recorded `direction.test.ts` site.",
    "Once a multi-section work is added, every one of its section rows shows the work's title. `stageUnits` already shows the item's title for an added row, so the part labels are visible only on sections not yet added. That is intended, and the owner check states it."
  ],
  "scope": {
    "allow": [
      "src/domain/khonyagarData.ts",
      "src/domain/courseSeed.ts",
      "src/domain/courseSeed.test.ts",
      "src/domain/khonyagarCourse.test.ts",
      "src/domain/pathwaySeed.ts",
      "src/domain/pathways.test.ts",
      "src/domain/mediaRoots.test.ts",
      "src/pages/StageDetail.tsx",
      "scripts/scan-khonyagar-course.mjs",
      "docs/khonyagar-course.md",
      "AGENTS.md"
    ],
    "forbid": [
      "src/domain/courseData.ts",
      "scripts/scan-cgs-course.mjs",
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/types.ts",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/mediaRoots.ts",
      "src/domain/recordings.ts",
      "src/domain/itemFiles.ts",
      "src/domain/pathways.ts",
      "src/domain/factories.ts",
      "src/domain/labels.ts",
      "src/domain/seed.ts",
      "src/domain/routines.ts",
      "src/domain/scheduling.ts",
      "src/domain/plan.ts",
      "src/domain/repertoire.ts",
      "src/store/useStore.ts",
      "src/store/syncEngine.ts",
      "src/store/githubSync.ts",
      "src/pages/PathwayDetail.tsx",
      "src/pages/Today.tsx",
      "src/pages/Settings.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/components/RoutineDuration.tsx"
    ]
  },
  "exclusions": [
    "No import of the dated teacher/class folders (`afshin-alavi`, `amir-sharifi`, `behrooz-hemati`, `ghasem-rahimzadeh`), and no `Lesson` record created. Their names, dates and instrument attribution are unresolved in the source itself.",
    "No change to the Setar archive, or to the Classical Guitar Shed course data, scanner or publisher.",
    "No schema change, no migration, no new persisted collection and no new inbound-validation door.",
    "No new media root, no per-source root and no resolver fallback. The course declares its `mediaPath` and the existing derivation does the rest.",
    "No generated Khonyagar routine, and no change to the routine machinery. The course's guide asks for block-shaped days built around the current lesson, not a tour of every section in a stage.",
    "No change to the Session Plan's order, buckets or proportions to match the guide. That would change the plan for every instrument and is a separate decision. No copy in this lane claims the Session Plan follows the guide's blocks.",
    "No UI change beyond the caption's condition in `StageDetail.tsx`. The existing stage, pathway and Today surfaces already render any course.",
    "No fabricated essential flags, per-section minutes or practice history. No translated or paraphrased guide text: it is quoted as written.",
    "No transliteration of Farsi titles into keys, no positional work numbering, and no runtime title parsing. The grammar stays in the scanner and its conclusions are recorded.",
    "No merge of two works on title similarity, including works that share an exact title (Ma'rufi's and the radif's چهارمضراب ماهور, the two رنگ شور sections, the three کرشمه sections). Ambiguous pairs are recorded as diagnostics for the owner.",
    "No dastgāh, form or composer identity fields on Khonyagar entries in this lane. Its works group under their study source in My repertoire, and dastgāh grouping would be a later data change.",
    "No automatic creation of items, works, routines or stages: every one is created by an explicit owner action.",
    "No change to `reseedDefaultPathways`, the recommendation engine, the Session Plan, review scheduling or SM-2."
  ],
  "acceptance": [
    {
      "description": "Every media path in the generated Khonyagar data is NFC-normalised, which is the form the NAS serves, and lies inside the course's own folder with no `..` segment. A decomposed path would 404 while looking correct in the repository.",
      "test": "every Khonyagar media path is NFC-normalised and inside the course folder"
    },
    {
      "description": "Every Khonyagar catalogue key, work key and stage id is pure ascii, while its stage codes, titles and names are Farsi. The existing ascii invariant holds and the display stays in the course's own language.",
      "test": "Khonyagar keys and stage ids are pure ascii while its titles are Farsi"
    },
    {
      "description": "The generated data accounts for the whole source, with the counts written as literals. There are exactly 106 sections, `s001`–`s106`. The lesson numbers read from the section video paths are exactly 1–259, each exactly once, contiguous and in order within each section. Exactly the four score books appear and each is referenced at least once. Every work's files are a subset of the sections' files. Dropping, duplicating or misplacing one lesson fails.",
      "test": "accounts for all 106 sections, each of the 259 lessons exactly once and all four score books"
    },
    {
      "description": "Work identity is anchored and permanent, checked against a literal ledger written in the test and never derived from the data. Every shipped work-row key (the key an item holds as its `catalogKey`) still exists. Every ledgered work key `wNNN` that still resolves names a work whose lessons include lesson NNN. Reordering the table changes nothing. Removing a shipped work row, or re-pointing any key at a work without its anchor lesson, fails. Joining a work that is a section into another identity is still allowed.",
      "test": "every shipped Khonyagar work row still exists and every shipped work key keeps its anchor lesson"
    },
    {
      "description": "Every (stage id, section key) pair in a literal ledger of shipped pairs is still present, so a later boundary change cannot orphan an item's material.",
      "test": "every shipped Khonyagar section stays in the stage it shipped in"
    },
    {
      "description": "A work taught across several sections is one repertoire item, titled with the work's own name whichever of its sections is added first (a part or a performance included). It carries every section's files, each distinct file exactly once.",
      "test": "a work spanning several sections is one item titled with the work carrying every section's files once"
    },
    {
      "description": "Two distinct files are both kept when their titles match, and one file referenced from two entries appears once. Deduplication is by path, never by title.",
      "test": "keeps two distinct files whose titles match and never repeats one path"
    },
    {
      "description": "A mixed section yields each work it teaches as that work's own row, and the section itself is no work. Section 17 yields two works, from lessons 109 and 110. پیش‌درآمد ابوعطا is one row carrying exactly lessons 124 and 125, although they sit in sections 21 and 22, and neither of those sections is a work.",
      "test": "a mixed section yields each work it teaches as its own row and becomes no work itself"
    },
    {
      "description": "No Khonyagar section carries a repertoire strand (`piece`, `repertoire` or `radif`) unless it carries a work identity, so a section title never reaches My repertoire as a fake piece.",
      "test": "no Khonyagar section carries a repertoire strand unless it is a work"
    },
    {
      "description": "A performance or continuation section joins only the work an explicit table entry names. Two titles differing solely by ZWNJ or spacing (sections 52–55 and 56) are not merged unless an entry says so.",
      "test": "joins a performance section only where the work table says so and never merges on a ZWNJ difference"
    },
    {
      "description": "Two works that share a title stay separate items. Ma'rufi's چهارمضراب ماهور (section 26) and the radif's (sections 95–104) resolve to different identities, and adding one never reuses or lists the other's material.",
      "test": "keeps two distinct works that share a title apart"
    },
    {
      "description": "A Khonyagar work never reuses an item belonging to another course or to the Setar archive, even when the titles are identical, because work reuse is scoped to the course.",
      "test": "a Khonyagar work never reuses an item from another course or instrument"
    },
    {
      "description": "Every Khonyagar stage builds an empty level routine and an empty position routine, even with every one of its sections added, so the stage offers neither routine action. Every Guitar level still builds its own non-empty routine exactly as before.",
      "test": "a Khonyagar stage builds no routine while every Guitar level still builds its own"
    },
    {
      "description": "Every Khonyagar work's catalogue notes are its own lesson-type guidance from the course's guide, and never the Guitar course's English practice-packet sentence. Guitar works keep that sentence.",
      "test": "a Khonyagar work carries its own guidance and never the Guitar packet note"
    },
    {
      "description": "The existing Tar Honarestan pathway keeps every stage id, code, title and catalogue key it has today. The Classical Guitar Shed course keeps every stage, key, work, work note, routine, routine name and item-creation title it has today.",
      "test": "leaves the Honarestan pathway and the Guitar course entirely unchanged"
    },
    {
      "description": "The Khonyagar course declares its own media folder, so `tar-classes` is a known source folder derived from `COURSES`, with no new device setting and no change to the archive base.",
      "test": "registers tar-classes as a known source folder without changing the archive base"
    },
    {
      "description": "On the owner's own Mac and iPhone:\n- the Khonyagar pathway appears after restoring default pathways;\n- a section's lesson videos and its band's score book open from a practice item over both the LAN and Tailscale routes;\n- the radif's چهارمضراب ماهور appears once in My repertoire, under its own name and carrying all seven sections' videos, while Ma'rufi's stays a separate suggestion and the Setar item of that name is untouched;\n- پیش‌درآمد ابوعطا is its own row beside the exercise sections that contain it;\n- Khonyagar stages show no routine buttons and no routine caption;\n- a 30-minute Tar session from \"Plan this session\" is built only from Tar items, with a warm-up first and a cool-down last only when an item qualifies, and due reviews and current work in between by priority. It is not expected to follow the guide's block order, and nothing on screen claims it does;\n- the Honarestan pathway and all Setar and Guitar data are visibly unchanged.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "There is no schema change, no migration and no new persisted collection: `migrations.ts`, `io.ts`, `types.ts` and the store are all forbidden by scope. But the lane causes persisted records to be created through existing paths:\n- restoring default pathways (or a fresh seed) inserts a new `Pathway` and its `PathwayStage` rows;\n- adding a suggestion creates `PracticeItem` and `Material` rows, each carrying a persisted `stageId` and `catalogKey`.\n\nThose items then accumulate real practice, so getting identity wrong would corrupt the owner's own repertoire rather than merely render badly:\n- two works merged on a title would destroy one work's record;\n- a section title reaching My repertoire would be a fake piece;\n- a work taught inside a mixed section and left out would lose real repertoire;\n- a work key re-pointed after shipping would silently move an owner's item onto a different work;\n- a Khonyagar work reusing a Setar item would cross instruments;\n- an NFD path would look correct in the repository while opening nothing.\n\nThat is why the checks discriminate rather than proving only the happy path:\n- merged-versus-separate for multi-section works and for works that share a title;\n- one-row-versus-none for works inside mixed sections;\n- kept-versus-collapsed for two same-titled files;\n- anchored-versus-moved for every shipped key and (stage, section) pair;\n- exactly-once for every lesson;\n- reused-versus-distinct across courses;\n- empty-versus-built routines for Khonyagar against CGS;\n- NFC-versus-NFD for every path.\n\nMedia configuration is unchanged and stays per device, so `r-secrets-stay-on-device` is unaffected, and no file bytes enter the app."
  },
  "delta": {
    "today": "Tar has a placeholder pathway and nothing else. `tar-honarestan` offers ten hand-authored stages of generic steps, and its own seed note says it is a framework to fill in as you go. The owner's complete Khonyagar course — 259 lesson videos (~16h28m), 106 sections and four score books — is invisible to the app. Not one video or score is reachable from a practice item, and the only way to attach one is to type NAS links by hand. Its repertoire is absent too: the Mahur radif gushehs, پیش‌درآمد ماهور درویش‌خان, تصنیف ز من نگارم, two different چهارمضراب ماهور, and works taught inside other lessons such as پیش‌درآمد ابوعطا cannot be practised, scheduled or reviewed. Works taught across several sections have no way to be one work. The course's own daily practice guide is nowhere in the app. `COURSES` holds exactly one entry, so the course machinery the Guitar lane built is available to Guitar alone.",
    "instead": "Khonyagar is a second entry in `COURSES`. A new `tar-khonyagar` pathway presents the course's 106 sections across ten stages, under its own three band headings, in Farsi, with pure-ascii keys anchored in the course's numbering. It reaches the owner's existing database through the \"restore default pathways\" button that already exists, and `tar-honarestan` is left untouched beside it. Adding a section brings its lesson videos and its band's score book with it automatically, with no link typed and no new device setting; every path is stored in the NFC form the NAS actually serves. Every work the course teaches reaches My repertoire once, under the work's own name:\n- a work taught across seven sections is ONE item carrying all seven sections' files;\n- a work taught inside an exercise section is its own row carrying exactly its own lessons, and the section is none;\n- two works that share a title stay two.\nWork keys are anchored to a lesson and never change after they ship. The data accounts for every section, every lesson exactly once and every score book, and the scanner refuses to write if the disk and the index disagree. The stages generate no routine, because the course's own guide asks for block-shaped days around the current lesson, not a tour of every section. For a timed session, the existing Session Plan builds from these items as it does for any instrument: warm-up first and cool-down last when an item qualifies, due reviews and the most urgent work in between, by priority rather than in the guide's block order. The guide reaches the owner as text: its daily template on the pathway, and its advice for each kind of lesson in every item's Working notes. The dated teacher folders are not imported, and the reasons are recorded.",
    "keep": [
      "`tar-honarestan` keeps every stage, code, title and catalogue key it has today, and any item already placed in it keeps its suggestion.",
      "The Setar class archive and the Classical Guitar Shed course are untouched: data, scanners, publisher, stages, keys, works, work notes, routines and routine names alike.",
      "Seeing where you are in a stage stays derived from item status: `stageUnits` and `itemStageState` are unchanged, and a suggestion you have not taken stays a suggestion.",
      "Taking a suggestion stays one tap, arrives honestly as \"Not practised yet\" with zero statistics, and stays losslessly removable until you practise it. An Undo still reaches only an item the tap created.",
      "Routines and the Session Plan are unchanged: the same runner, the same duration control, the same plan builder. Any Tar routine the owner writes by hand works exactly as it does today.",
      "The archive base and the derived media root keep their values and meaning, so no device needs reconfiguring and every existing reference resolves identically.",
      "`reseedDefaultPathways` and its button are unchanged, so a stage deliberately deleted from an existing pathway is still never resurrected.",
      "A Setar piece sharing a Khonyagar work's name stays a separate item on a separate instrument.",
      "No file bytes enter the app, sync or a backup, and no item, work, routine or stage is created without an explicit owner action."
    ],
    "assumptions": [
      "The NAS serves NFC while the local disk is NFD. This was verified directly, and re-probed in this pass: 404 on the decomposed form, 206 video/mp4 on the composed one. Every stored path is therefore the real filename NFC-normalised.",
      "Stage boundaries, work membership (by lesson number) and lesson types are authored decisions, recorded in `docs/khonyagar-course.md`. The source states none of them mechanically, and a crude grammar demonstrably mis-groups this data. A work's key is `w` plus its anchor lesson, written literally, so a reorder, a correction or a newly recognised work cannot move an existing identity.",
      "The Session Plan stays unchanged and is not presented as the guide's template. It shares the guide's frame (warm-up first, spaced review, cool-down last), but it orders the middle by priority and splits minutes by its own weights. Making it follow the guide's blocks would change every instrument's plan, and is left to a separate decision."
    ],
    "showMe": "Press \"restore default pathways\" on Repertoire. A new Tar pathway, «تار – آزاد میرزاپور (خنیاگر)», appears beside the Honarestān one, which is unchanged. Its note carries the course's daily practice template.\n\nOpen it: ten stages under تار مقدماتی, متوسطه and تار ۳, each listing the course's own sections in its own words.\n\nIn the first stage, add «به دست گرفتن مضراب تار و نواختن سیم‌ها». Its three lesson videos and نت ۱ are already under Material with no link typed, and tapping one plays it from the NAS. Its Working notes carry the guide's advice for a technique lesson.\n\nIn the third stage, sections 21 and 22 are exercise sessions, and پیش‌درآمد ابوعطا sits beside them as its own row. Add it, and exactly its two lessons come with it.\n\nIn the last stage, add «چهارمضراب ماهور - بخش دوم». My repertoire gains ONE item, named for the radif's چهارمضراب ماهور rather than for part two, carrying the videos of all seven sections that teach it, and each of those seven rows now reads as added. Musa Ma'rufi's چهارمضراب ماهور in stage four is still a separate suggestion, and your Setar item of the same name is untouched.\n\nThe stages offer no generated routine. For a timed session, choose \"Plan this session\" on Today for 30 minutes of Tar. In your first week, with a few new sections added, it splits the time across them, about 10 minutes each. Once some items are familiar and one is due, it looks more like: a 4-minute warm-up, the due review, the section you are learning, and a short cool-down on something settled. It orders the middle by priority, not by the guide's technique → lesson → review blocks. The guide's own order lives in the template on the pathway."
  },
  "desiredRules": [
    "A course's work identity is explicit, recorded and permanent. Only an authored entry may join two sections or lessons into one work. Once shipped, no key an item holds is ever renamed or removed, and no work key is ever re-pointed at a different work; a later merge is an alias.",
    "A stored media path is the file's real name in the normalisation form the server actually serves, never the form a local filesystem happens to hold. A path that looks right in the repository and 404s on the device is indistinguishable from correct until someone taps it.",
    "Repertoire comes from the works a course teaches, identified at the lesson. A section that teaches several works, or none, is never itself a repertoire piece, and a work taught inside it is never lost.",
    "Every identifier a course contributes is ascii and anchored in the source's own numbering, while every title the owner reads is in the course's own language.",
    "Course data accounts for its whole source: every section, lesson and score book exactly once. A scan that cannot reconcile the disk, the index and its own tables writes nothing."
  ],
  "docsDelta": [
    "AGENTS.md",
    "docs/khonyagar-course.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Khonyagar is a second entry in `COURSES`. A new `tar-khonyagar` pathway presents the course's 106 sections across ten stages, under its own three band headings, in Farsi, with pure-ascii keys anchored in the course's numbering. It reaches the owner's existing database through the "restore default pathways" button that already exists, and `tar-honarestan` is left untouched beside it. Adding a section brings its lesson videos and its band's score book with it automatically, with no link typed and no new device setting; every path is stored in the NFC form the NAS actually serves. Every work the course teaches reaches My repertoire once, under the work's own name:
- a work taught across seven sections is ONE item carrying all seven sections' files;
- a work taught inside an exercise section is its own row carrying exactly its own lessons, and the section is none;
- two works that share a title stay two.
Work keys are anchored to a lesson and never change after they ship. The data accounts for every section, every lesson exactly once and every score book, and the scanner refuses to write if the disk and the index disagree. The stages generate no routine, because the course's own guide asks for block-shaped days around the current lesson, not a tour of every section. For a timed session, the existing Session Plan builds from these items as it does for any instrument: warm-up first and cool-down last when an item qualifies, due reviews and the most urgent work in between, by priority rather than in the guide's block order. The guide reaches the owner as text: its daily template on the pathway, and its advice for each kind of lesson in every item's Working notes. The dated teacher folders are not imported, and the reasons are recorded.

_approved · about "work-a-pathway-stage"_

## Today

Tar has a placeholder pathway and nothing else. `tar-honarestan` offers ten hand-authored stages of generic steps, and its own seed note says it is a framework to fill in as you go. The owner's complete Khonyagar course — 259 lesson videos (~16h28m), 106 sections and four score books — is invisible to the app. Not one video or score is reachable from a practice item, and the only way to attach one is to type NAS links by hand. Its repertoire is absent too: the Mahur radif gushehs, پیش‌درآمد ماهور درویش‌خان, تصنیف ز من نگارم, two different چهارمضراب ماهور, and works taught inside other lessons such as پیش‌درآمد ابوعطا cannot be practised, scheduled or reviewed. Works taught across several sections have no way to be one work. The course's own daily practice guide is nowhere in the app. `COURSES` holds exactly one entry, so the course machinery the Guitar lane built is available to Guitar alone.

## Instead

Khonyagar is a second entry in `COURSES`. A new `tar-khonyagar` pathway presents the course's 106 sections across ten stages, under its own three band headings, in Farsi, with pure-ascii keys anchored in the course's numbering. It reaches the owner's existing database through the "restore default pathways" button that already exists, and `tar-honarestan` is left untouched beside it. Adding a section brings its lesson videos and its band's score book with it automatically, with no link typed and no new device setting; every path is stored in the NFC form the NAS actually serves. Every work the course teaches reaches My repertoire once, under the work's own name:
- a work taught across seven sections is ONE item carrying all seven sections' files;
- a work taught inside an exercise section is its own row carrying exactly its own lessons, and the section is none;
- two works that share a title stay two.
Work keys are anchored to a lesson and never change after they ship. The data accounts for every section, every lesson exactly once and every score book, and the scanner refuses to write if the disk and the index disagree. The stages generate no routine, because the course's own guide asks for block-shaped days around the current lesson, not a tour of every section. For a timed session, the existing Session Plan builds from these items as it does for any instrument: warm-up first and cool-down last when an item qualifies, due reviews and the most urgent work in between, by priority rather than in the guide's block order. The guide reaches the owner as text: its daily template on the pathway, and its advice for each kind of lesson in every item's Working notes. The dated teacher folders are not imported, and the reasons are recorded.

## Keep

- `tar-honarestan` keeps every stage, code, title and catalogue key it has today, and any item already placed in it keeps its suggestion.
- The Setar class archive and the Classical Guitar Shed course are untouched: data, scanners, publisher, stages, keys, works, work notes, routines and routine names alike.
- Seeing where you are in a stage stays derived from item status: `stageUnits` and `itemStageState` are unchanged, and a suggestion you have not taken stays a suggestion.
- Taking a suggestion stays one tap, arrives honestly as "Not practised yet" with zero statistics, and stays losslessly removable until you practise it. An Undo still reaches only an item the tap created.
- Routines and the Session Plan are unchanged: the same runner, the same duration control, the same plan builder. Any Tar routine the owner writes by hand works exactly as it does today.
- The archive base and the derived media root keep their values and meaning, so no device needs reconfiguring and every existing reference resolves identically.
- `reseedDefaultPathways` and its button are unchanged, so a stage deliberately deleted from an existing pathway is still never resurrected.
- A Setar piece sharing a Khonyagar work's name stays a separate item on a separate instrument.
- No file bytes enter the app, sync or a backup, and no item, work, routine or stage is created without an explicit owner action.

## New assumptions

- The NAS serves NFC while the local disk is NFD. This was verified directly, and re-probed in this pass: 404 on the decomposed form, 206 video/mp4 on the composed one. Every stored path is therefore the real filename NFC-normalised.
- Stage boundaries, work membership (by lesson number) and lesson types are authored decisions, recorded in `docs/khonyagar-course.md`. The source states none of them mechanically, and a crude grammar demonstrably mis-groups this data. A work's key is `w` plus its anchor lesson, written literally, so a reorder, a correction or a newly recognised work cannot move an existing identity.
- The Session Plan stays unchanged and is not presented as the guide's template. It shares the guide's frame (warm-up first, spaced review, cool-down last), but it orders the middle by priority and splits minutes by its own weights. Making it follow the guide's blocks would change every instrument's plan, and is left to a separate decision.

## Show me

Press "restore default pathways" on Repertoire. A new Tar pathway, «تار – آزاد میرزاپور (خنیاگر)», appears beside the Honarestān one, which is unchanged. Its note carries the course's daily practice template.

Open it: ten stages under تار مقدماتی, متوسطه and تار ۳, each listing the course's own sections in its own words.

In the first stage, add «به دست گرفتن مضراب تار و نواختن سیم‌ها». Its three lesson videos and نت ۱ are already under Material with no link typed, and tapping one plays it from the NAS. Its Working notes carry the guide's advice for a technique lesson.

In the third stage, sections 21 and 22 are exercise sessions, and پیش‌درآمد ابوعطا sits beside them as its own row. Add it, and exactly its two lessons come with it.

In the last stage, add «چهارمضراب ماهور - بخش دوم». My repertoire gains ONE item, named for the radif's چهارمضراب ماهور rather than for part two, carrying the videos of all seven sections that teach it, and each of those seven rows now reads as added. Musa Ma'rufi's چهارمضراب ماهور in stage four is still a separate suggestion, and your Setar item of the same name is untouched.

The stages offer no generated routine. For a timed session, choose "Plan this session" on Today for 30 minutes of Tar. In your first week, with a few new sections added, it splits the time across them, about 10 minutes each. Once some items are familiar and one is due, it looks more like: a 4-minute warm-up, the due review, the section you are learning, and a short cool-down on something settled. It orders the middle by priority, not by the guide's technique → lesson → review blocks. The guide's own order lives in the template on the pathway.


## Flows near this scope (understand before you change them)

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

Bring the Khonyagar Tar course into its own Tar pathway with stable work identity and its complete material

## Stay in scope — you may ONLY change

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

Never touch:

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

## Definition of done

- **ac-1** — Every media path in the generated Khonyagar data is NFC-normalised, which is the form the NAS serves, and lies inside the course's own folder with no `..` segment. A decomposed path would 404 while looking correct in the repository. → proven by `every Khonyagar media path is NFC-normalised and inside the course folder`
- **ac-2** — Every Khonyagar catalogue key, work key and stage id is pure ascii, while its stage codes, titles and names are Farsi. The existing ascii invariant holds and the display stays in the course's own language. → proven by `Khonyagar keys and stage ids are pure ascii while its titles are Farsi`
- **ac-3** — The generated data accounts for the whole source, with the counts written as literals. There are exactly 106 sections, `s001`–`s106`. The lesson numbers read from the section video paths are exactly 1–259, each exactly once, contiguous and in order within each section. Exactly the four score books appear and each is referenced at least once. Every work's files are a subset of the sections' files. Dropping, duplicating or misplacing one lesson fails. → proven by `accounts for all 106 sections, each of the 259 lessons exactly once and all four score books`
- **ac-4** — Work identity is anchored and permanent, checked against a literal ledger written in the test and never derived from the data. Every shipped work-row key (the key an item holds as its `catalogKey`) still exists. Every ledgered work key `wNNN` that still resolves names a work whose lessons include lesson NNN. Reordering the table changes nothing. Removing a shipped work row, or re-pointing any key at a work without its anchor lesson, fails. Joining a work that is a section into another identity is still allowed. → proven by `every shipped Khonyagar work row still exists and every shipped work key keeps its anchor lesson`
- **ac-5** — Every (stage id, section key) pair in a literal ledger of shipped pairs is still present, so a later boundary change cannot orphan an item's material. → proven by `every shipped Khonyagar section stays in the stage it shipped in`
- **ac-6** — A work taught across several sections is one repertoire item, titled with the work's own name whichever of its sections is added first (a part or a performance included). It carries every section's files, each distinct file exactly once. → proven by `a work spanning several sections is one item titled with the work carrying every section's files once`
- **ac-7** — Two distinct files are both kept when their titles match, and one file referenced from two entries appears once. Deduplication is by path, never by title. → proven by `keeps two distinct files whose titles match and never repeats one path`
- **ac-8** — A mixed section yields each work it teaches as that work's own row, and the section itself is no work. Section 17 yields two works, from lessons 109 and 110. پیش‌درآمد ابوعطا is one row carrying exactly lessons 124 and 125, although they sit in sections 21 and 22, and neither of those sections is a work. → proven by `a mixed section yields each work it teaches as its own row and becomes no work itself`
- **ac-9** — No Khonyagar section carries a repertoire strand (`piece`, `repertoire` or `radif`) unless it carries a work identity, so a section title never reaches My repertoire as a fake piece. → proven by `no Khonyagar section carries a repertoire strand unless it is a work`
- **ac-10** — A performance or continuation section joins only the work an explicit table entry names. Two titles differing solely by ZWNJ or spacing (sections 52–55 and 56) are not merged unless an entry says so. → proven by `joins a performance section only where the work table says so and never merges on a ZWNJ difference`
- **ac-11** — Two works that share a title stay separate items. Ma'rufi's چهارمضراب ماهور (section 26) and the radif's (sections 95–104) resolve to different identities, and adding one never reuses or lists the other's material. → proven by `keeps two distinct works that share a title apart`
- **ac-12** — A Khonyagar work never reuses an item belonging to another course or to the Setar archive, even when the titles are identical, because work reuse is scoped to the course. → proven by `a Khonyagar work never reuses an item from another course or instrument`
- **ac-13** — Every Khonyagar stage builds an empty level routine and an empty position routine, even with every one of its sections added, so the stage offers neither routine action. Every Guitar level still builds its own non-empty routine exactly as before. → proven by `a Khonyagar stage builds no routine while every Guitar level still builds its own`
- **ac-14** — Every Khonyagar work's catalogue notes are its own lesson-type guidance from the course's guide, and never the Guitar course's English practice-packet sentence. Guitar works keep that sentence. → proven by `a Khonyagar work carries its own guidance and never the Guitar packet note`
- **ac-15** — The existing Tar Honarestan pathway keeps every stage id, code, title and catalogue key it has today. The Classical Guitar Shed course keeps every stage, key, work, work note, routine, routine name and item-creation title it has today. → proven by `leaves the Honarestan pathway and the Guitar course entirely unchanged`
- **ac-16** — The Khonyagar course declares its own media folder, so `tar-classes` is a known source folder derived from `COURSES`, with no new device setting and no change to the archive base. → proven by `registers tar-classes as a known source folder without changing the archive base`
- **ac-17** — On the owner's own Mac and iPhone:
- the Khonyagar pathway appears after restoring default pathways;
- a section's lesson videos and its band's score book open from a practice item over both the LAN and Tailscale routes;
- the radif's چهارمضراب ماهور appears once in My repertoire, under its own name and carrying all seven sections' videos, while Ma'rufi's stays a separate suggestion and the Setar item of that name is untouched;
- پیش‌درآمد ابوعطا is its own row beside the exercise sections that contain it;
- Khonyagar stages show no routine buttons and no routine caption;
- a 30-minute Tar session from "Plan this session" is built only from Tar items, with a warm-up first and a cool-down last only when an item qualifies, and due reviews and current work in between by priority. It is not expected to follow the guide's block order, and nothing on screen claims it does;
- the Honarestan pathway and all Setar and Guitar data are visibly unchanged. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- docs/khonyagar-course.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

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

