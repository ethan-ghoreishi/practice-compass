# The Classical Guitar Shed course: scanner, data and what the app does with it

The owner practises Classical Guitar daily from an offline copy of the
Classical Guitar Shed "Woodshed" course. This file is the operator runbook for
bringing that course into the app, the record of what the scanner reads and
what it deliberately does not, and the corpus baseline.

It is the sibling of `docs/setar-archive.md` and is deliberately **not** the
same machinery. That source GROWS, gets RENAMED, and carries piece identity to
reconcile against existing repertoire — which is why it needs a published index,
a content digest and a reconciler. A downloaded course has none of that: it is a
fixed tree whose own `notes.md` and `LEVEL_GUIDE.md` already state everything.
So the course sits on the rung `pathwaySeed.ts` already stands on — reference
data in code — with **no persisted graph, no new validation door, no schema
change and no migration**.

---

## 1. The shape of it

    /Volumes/Sandisk/video-courses/            ← the shared MEDIA ROOT
      setar-classes/                           ← the Setar archive (unchanged)
      classical-guitar/
        classical-guitar-shed/                 ← this course
          PRACTICE_GUIDE.md
          Level_1A/ … Level_3F/
            LEVEL_GUIDE.md                     ← core / rotation / reference + times
            1B-Syllabus-Materials-….pdf        ← target-BPM table
            00_Contrast_Cards/                 ← sub-folders, 1663 images
            03_Chords/
              notes.md                         ← title, guidance, files, checklist
              01_e939830c-ddf.mp4  …
      tar-classes/

Currently 18 levels (1A–3F), 212 sections, 688 addressable files, 61 named
packet works. The course itself continues to roughly 5F; see §5.

## 2. The scanner

    node scripts/scan-cgs-course.mjs                 # DRY RUN — reports only
    node scripts/scan-cgs-course.mjs --write         # writes src/domain/courseData.ts

Node stdlib only, no dependencies, **dry-run by default**. It is a BUILD-TIME
tool: nothing in `src/` imports it and nothing in it is reachable from any
runtime path. `--root` points it at another copy of the tree, `--media-path` at
the course's own folder beneath the media root, `--out` elsewhere.

It **discovers** the levels present — nothing is bound to eighteen of them, to
`Level_*` naming or to a section-per-folder layout — and it **reports** anything
it could not read rather than silently emitting less. Every diagnostic it
produces is committed into `courseData.ts`'s own `diagnostics` array, so the
record travels with the data.

### The grammar lives here and nowhere else

The app never parses a folder name, a `notes.md` heading or a syllabus table. It
consumes the generated data.

**Catalogue keys are ADDED, never renamed.** A section folder's base name maps
onto the key the stage already used before this course existed
(`03_Chords` → `chords`, `07_Rhythm_Study` → `rhythm-study`, `09_Piece` →
`piece`, …), so an item the owner had already added from the old generic
suggestion stays attached to the real section that replaced it. The FIRST folder
of a family takes the base key; a second one (2E's two Scales sections, 3A's two
Arpeggios sections) gets its own new key, so nothing is ever displaced.
`src/domain/pathways.test.ts` records every pre-import key and fails if one
disappears.

**Files.** `notes.md` lists videos IN ORDER, and names its sheet music and
images; that leads. Anything on disk it does not mention still follows, because
a file the app cannot see is a file the owner has to leave the app for. Video
filenames are opaque (`01_80ee0462-cc7.mp4`) but their ORDINAL is stable, so a
video is addressed by (section, ordinal) and never by meaning read out of its
name. A section holding sub-folders (the contrast-card decks) is ONE folder
reference to the section itself — never a deck-by-deck list, and never a viewer.

**Works.** A level's own STUDY is its Piece section itself: the section keeps
its `piece` key and its `piece` strand and gains the real name the course gives
it ("1B Piece — Study #1", from the H1 after a colon, else the first line of the
section's own text). The **packet works** come from the section's own Sheet
Music lists, deduplicated by file, with the composer joined into the title
("Fernando Sor — Opus 35, no.1"). A packet work's key is derived from the WORK,
not from the level, which is what makes a work carried forward across levels
(Ferrer Ejercicio runs 2C–2F) one entry the owner adds once.

**Routines** come from `LEVEL_GUIDE.md`: Core (⭐, every session) → `essential:
true`, Rotation A/B → not essential, Reference sections → not in the routine at
all. Minutes are the midpoint of the guide's own range ("8–12 min" → 10).

**Target BPMs** come from the syllabus PDF's page-1 practice table, read with
`zlib` alone. A number is attributed to the NEAREST left-column header row at or
above it whose text matches a real section of that level — and to nothing at all
otherwise.

### Deliberate deviations from the approved plan, and why

Three things the plan expected are not in the corpus. They are recorded here
rather than worked around silently.

1. **There is no `***`-marked routine in the syllabus PDFs.** The plan said the
   level routine is "transcribed from the syllabus with its `***` segments
   essential"; `grep -r '\*\*\*'` across every markdown file in the course
   returns nothing, and the 1A syllabus PDF (whose text extracts cleanly)
   contains no minute-by-minute routine at all. `LEVEL_GUIDE.md` is the real,
   uniform, machine-readable source and every level has one. Core⭐ → essential
   is the honest reading of "essential", and it is what "Short on time —
   essentials only" now filters on.
2. **Level 3 therefore gets routines too.** The plan expected Level 3 syllabi to
   carry a repertoire page and no routine, and said those stages should say so.
   That followed from believing the PDF was the source. Measured: 3A, 3D, 3E and
   3F all carry full Core/Rotation tables in their `LEVEL_GUIDE.md`. They are
   derived uniformly with every other level.
3. **BPM coverage is partial and honestly reported.** 25 values across 11 levels
   are attributed. Eight levels (1E, 1F, 2A, 2C, 2E, 2F, 3A, 3E) use a shifted
   font subset with no text positioning at all — the "+29 character-shift" case
   the plan anticipated — so their table cannot be read, and they get no BPMs
   and a diagnostic each. Nothing is guessed: a wrong tempo attached to a real
   section is worse than an absent one, and the syllabus PDF is itself linked as
   material on every level's Syllabus section. The mechanism is validated
   against ground truth — 1A's three positioned values (rhythm 80, sight-reading
   70, piece 60) reproduce the hand-authored seed exactly.

Two further diagnostics are genuine facts about the course, not scanner
failures: 3C's and 3F's Piece sections name no single work ("Excerpts + Fur
Elise, Minuet in G, Red is the Rose"; "Repertoire + Video Review"), so those
sections keep their own titles rather than being given a fabricated study name;
and `Level_2E/08_Sight_Reading/` has no `notes.md`, so its title and guidance are
unavailable while its three PDFs still reach the app.

## 3. The generated data

`src/domain/courseData.ts` is the scanner's OUTPUT and is **never edited by
hand**. `src/domain/courseSeed.ts` is the hand-written reader beside it. A
course change is answered by re-running the scanner and committing new data.

It is ~222 KB of committed literal that ships in the offline PWA bundle, and
would roughly double if the course reaches 5F. Per-strand practice checklists
are deduplicated to one per strand (`CGS_CHECKLISTS`); per-section guidance,
titles, file lists and routines are kept in full.

The shape is ordered **groups of units**, not "levels", and how many there are
is data — which is also the shape a flat, index-driven source (Khonyagar's 106
sections) needs, so a second course is a second reader plus data and never new
machinery.

## 4. What the app does with it

* **The stages and their catalogue** come from `courseStageSeeds()` through
  `pathwaySeed.ts`. Level 1A keeps its fourteen hand-authored steps byte for
  byte; every other level is the course's own sections plus its named packet
  works.
* **Repertoire** follows from the strand alone, and `repertoire.ts` is
  unchanged: the level's own study and the packet works carry `strand: 'piece'`
  → `itemType: 'full_piece'` → `isWork`. Every drill, exercise, rhythm,
  sight-reading and reading section does not.
* **Material is COMPOSED, never stored.** An item holds only the stage and the
  catalogue key it was created from; `itemFiles` reads its files out of the
  course data every time. So re-running the scanner after a course change
  reaches every item that already exists, and the owner never types a link.
  **No bytes enter the app**: a course file is opened where it lives, exactly
  like a class recording.
* **Files resolve under the shared media root**, derived from the archive base
  the owner already set. See `docs/setar-archive.md` for why that is not a
  second base and not a resolver fallback.
* **A study source is found or created on first use**, so every course item
  groups under one "Classical Guitar Shed" source in My repertoire and a second
  item can never mint a duplicate.
* **A stage offers two routines.** "Use this level's routine" is the syllabus's
  own; "Build one for where I am" is the previous level's essential segments
  plus only the current level's sections the owner has actually added, joined on
  `(stageId, catalogKey)` together. Both write an **ordinary editable routine** —
  neither is a live view — and a segment the position marker leaves out is one
  edit away from being added back.
* **Any routine runs at a chosen total.** `fitRoutineToMinutes` scales
  proportionally and drops non-essential segments before essential ones. The
  authored length is the default, so doing nothing behaves exactly as before,
  and duration stays independent of "Short on time".

## 5. Buying Levels 4A–5F later

It is a data change, not a code change:

1. Download the new levels into the same tree.
2. `node scripts/scan-cgs-course.mjs` — read the diagnostics.
3. `node scripts/scan-cgs-course.mjs --write`, commit, ship.
4. Open the pathway → **Add new levels from this course** → tick the ones you
   want.

No migration and no schema change. That last action is deliberately **separate**
from the existing "restore default pathways" button, which is unchanged: it adds
nothing on its own, it OFFERS the levels the course has and the pathway does
not, keyed by the stage's deterministic id rather than its title. So a level the
owner renamed is never offered again, and a stage they deliberately **deleted**
reappears in a list — never in the pathway — and only if they choose it.

## 6. What is NOT here

* No published index, no content digest, no reconciler, no scanner running
  inside the app, and no second source-archive grammar.
* No contrast-card viewer, flashcard player or media player of any kind.
* No Khonyagar/Tar course data and no ArtistWorks import. The group/unit shape
  and the shared media root were chosen so either becomes a second reader plus
  data; Khonyagar's four teacher folders are real dated classes belonging to the
  lessons flow, and `behrooz-hemati` carries a Setar book, so its instrument
  needs confirming before anything is imported.
* No content for levels the owner does not own — no placeholder stage,
  catalogue entry or routine exists for 4A–5F.
* **Level 1A's items get no composed course material**, because its catalogue is
  hand-authored and its keys do not map onto the course's section folders. That
  is the price of keeping 1A byte-for-byte as the contract requires, and it is
  the one known gap.
