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

Currently 18 levels (1A–3F), 212 sections, 688 addressable files, 59 named
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
suggestion stays attached to the real section that replaced it. Where a level
ships two folders of one family (2E's two Scales sections, 3A's two Arpeggios
sections), ONE takes the base key and the other gets its own new key, so nothing
is ever displaced. `src/domain/pathways.test.ts` records every pre-import key and
fails if one disappears.

WHICH one is not simply the lower ordinal: the key goes to the folder with real
content. 2E's `08_Sight_Reading` is an empty stub beside the real
`09_Sight_Reading`, and first-by-ordinal left an already-added item attached to a
titleless folder while the level's own routine named the other — a key that
survives but points at the wrong thing is the same failure as a key that
disappears, wearing a passing test. Ordinal order only breaks the tie. A
duplicate key is two sections claiming one item; the scanner refuses to emit one
and the same test holds the generated data to it.

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
("Fernando Sor — Opus 35, no.1").

**Where the course names NO single work — or more than one — the section is not
a work.** 3C ("Excerpts + Fur Elise, Minuet in G, Red is the Rose") and 3F
("Repertoire + Video Review") name none; 3A ("Tarrega Study in C + Canon in D")
names two, and two works cannot be one repertoire item while the packet already
offers each of them separately. All three emit `strand: 'other'` — practice on
material named elsewhere, with their real works reaching My repertoire as that
section's own packet works. The KEY stays `piece` in every case — keys are added,
never renamed — and the section keeps its own title and every file it reaches.
The change is FORWARD-ONLY, as every catalogue change is: an item already created
from that entry keeps the `itemType` stored on it, because regenerating the course
reaches an item's MATERIAL and never its stored fields.

### One musical work is one repertoire item

The section and the packet are two entries the course can name one piece by, so
each entry that is a work carries a `workKey` — its repertoire IDENTITY, separate
from its catalogue key. `courseWorkKey` (`courseSeed.ts`) is the one resolution
every surface reads — the tap, the stage row, the routine binding and the item's
composed MATERIAL — so they can never disagree, and the owner takes a work at the
level they actually meet it.

| entry | identity |
|---|---|
| a packet work | its own key, derived from the WORK — which is what already joins Ferrer Ejercicio across 2C–2F under one title |
| a Piece section naming ONE study | that study's key (`unit.workKey`), while its catalogue key stays `piece` |
| a packet entry that IS an earlier level's study | that study's key, declared in `WORK_ALIASES` |
| anything else (`chords`, `scales`, …) | none — so an ordinary per-stage key is never joined across levels |

`WORK_ALIASES` is three lines, and the course itself states each pair: 3B's "Full
course: Malagueña by Ernesto Lecuona" beside its single sheet entry (dropped
outright rather than aliased — the section is already that work at that very
level); 2E's "Full course: Carulli's Valse, Opus 50, Number 7", whose score exists
ONLY in 3F's folder and which 3F re-lists under "Recommended pieces"; and 2F's
"Full course: Fernando Sor, Etude #1, Opus 44", re-listed by 3F the same way.

**Why it is declared and not matched.** The cross-level pairs share no file at all,
so a match would have to join "Malagueña by Lecuona" to "Lecuona Malaguena" and
"Fernando Sor Etude #1 Op.44" to "Sor Etude No.1 op 44 Practice Packet" — token
fuzz whose false positive merges two genuinely different works into one repertoire
item and destroys the owner's record. `AGENTS.md` refuses exactly this shape for
the Setar archive's own path repair. The curation is verified AT SCAN TIME and a
stale entry — naming a packet work the course no longer has, or pointing at a key
that is no level's study — HARD-FAILS the scan; what `courseSeed.test.ts` holds is
the OUTCOME, that each of the three pairs resolves to one repertoire item in either
addition order.

**Why the table is three lines and not sixty.** Studies #1–#9 (1B–2D) each carry
their OWN score image inside their section ("Study #4 page 1"), and those sections'
sheet lists are the course's alternatives — 2B labels its list "Other appropriate
pieces" in so many words. "Allen Mathews — Small Etude #1" is not Study #1, and
aliasing them would be the false merge this rule exists to prevent. Only the six
"Full course: X" sections (2E, 2F, 3A, 3B, 3D, 3E) have no study sheet of their own,
and only three of those are named again elsewhere.

The same rule applies one level down, in the Sheet Music list itself: a download
there is not automatically a work. 3F's list carries "Here's the video review
checklist" beside four real pieces, and it became a repertoire work called
exactly that. Aids — a syllabus, a materials list, course notes, a checklist —
are skipped (`NOT_A_PACKET_WORK`), and they stay fully reachable as that
section's own FILES. That filter's `^click here` is LOAD-BEARING rather than
tidiness: 3D and 3E name their study's own score as an instruction ("Click here
for the materials for Chester."), and admitting one as a work would mint a
repertoire item called "Click here…" beside the section that is the real work.

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

Three further diagnostics are genuine facts about the course, not scanner
failures: 3C's and 3F's Piece sections name no single work and 3A's names two, so
all three are practice material rather than repertoire works (see **Works**); and
`Level_2E/08_Sight_Reading/` has no `notes.md`, so its title and guidance are
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
  sight-reading and reading section does not — and neither does a Piece section
  the course names no single work, or more than one, for. One musical work is
  one repertoire ITEM however many entries name it (`workKey`). The scanner, not
  the app, decides all of this (see **Works** in §2).
* **Material is COMPOSED, never stored.** An item holds only the stage and the
  catalogue key it was created from; `itemFiles` reads its files out of the
  course data every time. So re-running the scanner after a course change
  reaches every item that already exists, and the owner never types a link.
  **No bytes enter the app**: a course file is opened where it lives, exactly
  like a class recording.
  * **A work's material is the WORK's, not the entry's.** Composed from the
    item's own stage and catalogue key alone, the files depended on which entry
    the owner added FIRST: take 2E's Carulli Valse section and 3F's packet score
    was unreachable from the item; take 3F's packet entry first and 2E's own
    section material was — half a work either way, on the one item the identity
    rule exists to produce. `courseFilesFor` resolves `courseWorkKey` first and,
    where there is one, composes the files of EVERY entry in that course naming
    that work, in course order (units then works within a group), so both
    addition orders compose the same LIST and not merely the same set. An
    ordinary per-stage key carries no identity, so `chords` still composes only
    its own section. Files are deduplicated by their own PATH and by nothing
    weaker. It was their BASENAME, to keep the copy of one packet the course
    ships in each level's folder that names it (Ferrer Ejercicio runs 2C–2F)
    from appearing four times; a sealed review found that a basename is not a
    file's identity, so two genuinely different scores sharing one had the
    second silently dropped with nothing on the item saying so. Nothing in this
    data establishes content identity — a `CourseFile` is a path, a kind and a
    title — so completeness wins over tidiness: a repeated packet is one visible
    extra row, a hidden one is material the owner cannot see. A path is
    authoritative and is what `packetWorks` itself dedups on. The item's provenance is NOT rewritten
    to achieve this: `stageId`/`catalogKey` stay what the tap created them as,
    which is what keeps Undo and the row's "−" bounded to the stage that created
    the item, and nothing new is persisted. `courseSeed.test.ts` sweeps every
    identity the course names from more than one entry — enumerated from the
    generated data rather than a written list — in both addition orders.
  * **That claim is bounded to MATERIAL.** A section's guidance, its BPM line
    and its checklist are written into the item's own Working notes ONCE, at
    creation, by `itemFromCatalogEntry` — the same as every other catalogue
    entry in the app, and deliberately so: the notebook is the owner's to edit,
    and regenerating the course must never overwrite what they have written
    there. Re-running the scanner therefore updates the FILES of an existing
    item and not its notes. A new item created from the regenerated entry gets
    the new text.
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
  and duration stays independent of "Short on time". The one-minute floor is a
  REPAIR applied after the proportional split, never a minute reserved before
  it: reserving one each and sharing out only the remainder distorted every
  share for no reason (1:9 fitted to 20 came out 3:17 where 2:18 is both exact
  and legal). `RoutineDuration` carries BOTH knobs — the total and its own
  essentials-only tick — so "twenty minutes, essentials only" is one choice
  rather than two controls that could never be used together, and what it drops
  it names honestly: cutting far enough reaches the essential segments too, and
  `describeFitDrop` (pure, tested) says so instead of calling every drop
  non-essential.

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
* **One Level 1A step gets no composed course material**, and it is named rather
  than guessed at. 1A's fourteen steps are hand-authored and their keys are
  slugs of their own titles (`warm-up-stretches`), matching no course unit key
  (`warm-up`) — so the level the owner STARTS from was the one level with no
  material and, worse, the one level whose essentials 1B's "where I am" routine
  carries forward and could therefore never bind. `COURSE_LEGACY_KEYS`
  (`courseSeed.ts`, the hand-written reader — not the generated data) records
  which course section each of those keys names, and BOTH the material
  composition and the segment→item join read it. The keys themselves are
  untouched, exactly as the scanner's own rule ADDS keys and never renames one;
  every entry is asserted against the live catalogue in `courseSeed.test.ts`, so
  a stale alias fails rather than quietly aliasing nothing. Many-to-one is
  deliberate and is what the course itself says (Chunks and Thumb-chunks are
  both the one Right Hand Technique section); where a routine segment must pick
  ONE item it takes the first key in the list that has one. Thirteen of the
  fourteen resolve. "Technique primer — What is Technique" does not, because no
  course section clearly corresponds to it, and a guessed section's videos on a
  real step is the same failure as a guessed BPM on a real section.
* **An existing database keeps its old stage TITLES.** Stages are ordinary
  editable data the owner may have renamed, so nothing here rewrites one: a
  device seeded before this change still reads "1B · Arpeggios begin" rather
  than the course's own focus line, while its catalogue, material and routines
  are the new ones. §5's action only adds stages that are ABSENT. That is
  deliberate — silently retitling a stage the owner may have edited is exactly
  what "adds nothing on its own" rules out — and renaming one by hand takes a
  tap on Edit. A fresh install gets the course's titles.
