# The Khonyagar Tar course: scanner, data and what the app does with it

The owner practises Tar from an offline copy of the complete Khonyagar course
(«تار – آزاد میرزاپور (خنیاگر)»): 259 lesson videos (~16h28m), a 106-section
index and four score books. This file is the operator runbook for bringing that
course into the app. It records what the scanner reads, every authored decision
the source does not make for itself, and the corpus baseline.

It is the second entry in `COURSES`, beside the Classical Guitar Shed
(`docs/cgs-course.md`). It uses the same machinery, and for the same reason it
is **not** the Setar archive (`docs/setar-archive.md`). A downloaded course is a
fixed tree that does not grow, gets no renames and has no identity to reconcile.
So it is reference data in code, with **no persisted graph, no new validation
door, no schema change and no migration**. It is not `Lesson` data either: it is
a course the owner follows, not a record of classes they attended.

---

## 1. The shape of it

    /Volumes/Sandisk/video-courses/            ← the shared MEDIA ROOT
      setar-classes/                           ← the Setar archive (unchanged)
      classical-guitar/…                       ← the CGS course (unchanged)
      tar-classes/
        khonyagar-mirzapour/                   ← this course, one flat folder
          _فهرست — Index.md                    ← 106 sections, 259 lessons, 4 books
          _راهنمای تمرین روزانه — Daily Practice Guide.md
          001 - اجزای ساز.mp4 … 259 - گوشه زنگوله.mp4
          نت ۱ … نت ۴ ….pdf                    ← the four score books
        afshin-alavi/ amir-sharifi/ behrooz-hemati/ ghasem-rahimzadeh/   ← NOT imported, §7

Baseline, measured when this lane was built: the index declares ۲۵۹ گفتار and
lists 259 lessons, 001–259, with no gaps, under 106 contiguous sections. Each
section's lessons are contiguous and in order. The folder holds exactly 259
mp4 files, the four listed books and the two `.md` files, and nothing else.

## 2. The scanner

    node scripts/scan-khonyagar-course.mjs            # DRY RUN — reports only
    node scripts/scan-khonyagar-course.mjs --write    # writes src/domain/khonyagarData.ts

Node stdlib only, **dry-run by default**, build-time only. Nothing in `src/`
imports it. `--root`, `--media-path` and `--out` point it elsewhere.

**A scan that cannot reconcile the disk, the index and its own tables writes
nothing.** It throws, before any output, unless every one of these holds:

- the index's declared total (۲۵۹), the lessons it lists and the `NNN - *.mp4`
  files on disk agree;
- the sections are 1–106 in order, each lesson is listed once under one section,
  and each section's lessons are contiguous;
- the folder holds exactly those videos, the four books the index lists and the
  two `.md` files (dotfiles and `@eaDir` ignored);
- every filename matches its index title after NFC and whitespace collapse;
- every work key is `w` plus a lesson that work teaches, every lesson named in
  the work table exists, and no lesson belongs to two works;
- the stage table partitions 1–106 into contiguous runs, each key naming its own
  run, and no multi-section work crosses a stage boundary;
- every work row's files are files some section already carries.

### Two facts about the real source decide every path and title

**The NAS serves NFC; the local disk is NFD.** 78 of the 259 filenames are
decomposed on `/Volumes/Sandisk`. Probed on lesson 148, the decomposed name
returns 404 text/html from the NAS and the composed one returns 206 video/mp4.
A decomposed path looks right in the repository and opens nothing. So the
stored path is the **real filename, NFC-normalised**. `khonyagarCourse.test.ts`
holds every committed path to that.

**The index is the title; the disk is the path.** Three index titles carry
stray whitespace: `030` has a leading space, and `077` and `148` a double space.
The displayed title is the index title with whitespace collapsed. After NFC and
that collapse, every filename matches its title exactly. That is also why
lessons 148 and 149 are two different files with the same displayed title.

### What is authored, and where

The scanner holds three literal tables, because the source does not state these
things mechanically, and a crude title grammar demonstrably mis-groups this
data:

1. **Stages** — ten runs of consecutive sections (§3).
2. **Works** — each work's anchored key, title, lesson type and the LESSON
   numbers that teach it (§4).
3. **Section type overrides** — corrections to the type grammar's proposal. It
   is empty today.

Everything else is derived mechanically from those tables and the index.

## 3. Stages

| Stage key (id `tar-khonyagar-<key>`) | Band (`group`) | Sections | Evidence |
|---|---|---|---|
| `s001-s005` | تار مقدماتی | 1–5 | instrument, mezrab, note values, 2/4 and 4/4, tuning |
| `s006-s013` | تار مقدماتی | 6–13 | frets, fingering, positions one to six |
| `s014-s023` | تار مقدماتی | 14–23 | 6/8, first pieces, pish-daramad and reng; ends on lesson 129 «توصیه‌های پایانی» |
| `s024-s028` | تار متوسطه | 24–28 | Mahur |
| `s029-s035` | تار متوسطه | 29–35 | Shur |
| `s036-s045` | تار متوسطه | 36–45 | Afshari, Segah, Isfahan, Dashti |
| `s046-s059` | تار ۳ | 46–59 | the Mahur radif from زیرافکن to کرشمه |
| `s060-s074` | تار ۳ | 60–74 | ز من نگارم to دلکش |
| `s075-s092` | تار ۳ | 75–92 | رنگ قهر و آشتی to رنگ کوراغلی |
| `s093-s106` | تار ۳ | 93–106 | نیشابورک to زنگوله, and the radif's چهارمضراب |

The three band names are the course's own: the score books state them in their
titles. The مقدماتی/متوسطه boundary follows the course's own closing lesson
(129). The متوسطه/تار ۳ boundary is where the index changes shape, from topical
multi-lesson sessions to one-gusheh and one-part sections of the Mahur radif and
its pieces. Ten stages rather than three keep stage progress meaningful: a
single 61-section تار ۳ stage would read "3 of 61" for months. They also keep
each catalogue short enough to browse on a phone.

Stage codes are Farsi («جلسه ۱–۵»). Stage ids and every catalogue key are pure
ascii and anchored in the index's own numbering. Section keys are `s001`–`s106`.

## 4. Works — identity lives at the lesson

Works are taught INSIDE sections that are about something else:

- پیش‌درآمد ابوعطا is lessons 124 and 125, in exercise sections 21 and 22;
- سرای امید is lessons 063 and 074, in sections 9 and 11;
- section 17 teaches two works, in lessons 109 and 110.

So each work is recorded by the lessons that teach it:

- A section **all** of whose lessons teach one work IS that work. It keeps its
  section key `sNNN`, and carries the work's identity (`workKey`) and its name
  (`workTitle`).
- A work taught in lessons of a **mixed** section is its own catalogue row
  (`CourseWork`), keyed by its work key. It sits in the stage of its first
  lesson and carries exactly those lessons' videos plus the band book.
- A mixed section is itself **no work**. It carries a practice strand
  (`technique` or `exercise`), never `piece`, `repertoire` or `radif`.

**The membership rule.** A lesson belongs to a work only when its OWN index
title names that piece or gusheh, whether it teaches it, continues it or
performs it. Context and technique lessons in the same session stay section
material: an introduction to the dastgāh, a mezrab pattern, an unnamed
Honarestān درس. Named Honarestān lessons are works, for example
«درس ۵۷ (پیش درآمد ماهور)» and «درس ۶۲ (زرد ملیجه)».

Counts today: 72 works. 71 sections are wholly one work, 30 works are rows
taught inside mixed sections, and 35 sections are practice material.

### A work's key never changes after it ships

A work key is `w` plus its **anchor lesson**, the lowest lesson that taught it
at first shipping. Examples are `w197` for پیش‌درآمد ماهور درویش‌خان and `w246`
for the radif's چهارمضراب ماهور. The key is written as a literal in the table
and never computed, so reordering the table cannot move it, and a newly
recognised work gets its own anchor. A correction may ADD lessons to a work; it
may never remove the anchor.

What an item persists decides what must never disappear:

- **A work ROW's key IS the item's `catalogKey`.** A shipped row is never
  removed. A later merge keeps the row and gives it the other identity as an
  alias (`CourseWork.workKey`).
- **A work that is a section** is held by the item as `sNNN`, and its work key
  lives only in the section's `workKey`. A later merge may point the section at
  the other identity; the item keeps resolving.
- **A section never moves stage**, because items persist `stageId` together
  with `catalogKey`.

`khonyagarCourse.test.ts` holds all three against literal ledgers written in
the test at first shipping, never derived from the data. Every shipped
(stage, work row) pair still exists. Every shipped work key that still resolves
names a work that includes its anchor lesson. Every shipped (stage, section)
pair is still present.

### Same title is not same work

Nothing is joined on title similarity, ZWNJ or spacing. Sections 52–55
(«پیش درآمد…») and 56 («پیش‌درآمد…») are one work only because the table lists
their lessons under `w197`. The scanner reports these open questions for the
owner as `diagnostics` in the generated data, rather than deciding them
silently:

- **Three چهارمضراب:** w138 (Ma'rufi's, section 26), w246 (the radif's,
  sections 95–97 and 101–104) and w235 (section 85, «چهارمضراب از ردیف ماهور»).
- **Two رنگ شور:** w148 (Ma'rufi's, section 30) and w153 (unattributed,
  section 32).
- **Three گوشه کرشمه:** w135 (section 25), w205 (section 59) and w236
  (sections 86–87, «کرشمه و تحریر»).
- **Lesson 087:** «آموزش نوایی» is recorded as a named piece, w087. It could
  instead be the Navā gusheh.
- **Section 20:** it says «دو قطعه» but names only one piece, w121; درس ۶۵
  stays section material.
- **Lesson 141:** «درس ۲۴ از کتاب دوم هنرستان» names no piece.
- **The radif's چهارمضراب books:** w235 and w246 carry the rhythmic-pieces book
  by the band rule, but their score may be in the radif book.

A false split costs a visible duplicate, which a later alias can join. A false
merge destroys a record. So the table always splits when in doubt.

### Lesson types, strands and books

The course guide names five lesson types. The scanner's grammar proposes one
for every entry:

- A work's type comes from the work table: radif (a gusheh), rhythmic
  (chahārmezrāb / reng) or composed (pish-daramad / tasnif / a named piece).
- A section that is not wholly one work is **etude** when most of its own
  non-work lessons are Honarestān درس‌ها, and **technique** otherwise.
- A section whose every lesson teaches a work, but not ONE work (section 43
  teaches two), takes its first work's type. It is still no work itself.

The type decides three things:

- **The strand.** radif → `radif` (a gusheh work); rhythmic and composed →
  `repertoire`; etude → `exercise`; technique → `technique`. Only a work may
  carry a repertoire strand.
- **The book.** Stages 1–3 carry نت ۱ and stages 4–6 carry نت ۲. In تار ۳, radif
  entries carry نت ۳ (ردیف ماهور), and rhythmic and composed entries carry نت ۴
  (قطعات ضربی).
- **The guidance.** Every section and work carries the guide's own paragraph
  for its type, quoted in its own English as written. The paragraph lands in
  the item's Working notes when the item is created. It is never the Guitar
  course's practice-packet sentence.

## 5. What the app does with it

- **The pathway.** `tar-khonyagar` is appended to the seeded pathways beside
  `tar-honarestan`, which is left exactly as it was. `reseedDefaultPathways`
  adds a pathway that does not yet exist, so "restore default pathways" on
  Repertoire brings it into an existing database. A fresh install or a demo
  reset gets it from the same seed.
- **The pathway note.** The note quotes the guide's daily template and Quick
  Win. The template's table is flattened to one line per block, in its own
  words, because the note renders as plain text.
- **Material.** Adding a section or work composes its lesson videos and its
  band book live from the catalogue (`itemFiles` → `courseFilesFor`), with no
  link typed. `tar-classes` is a known source folder because the course
  declares its `mediaPath`, so the media root the device already derives
  resolves it on the LAN and Tailscale routes alike.
- **One work, one item.** Adding any section of a multi-section work, a part or
  a performance included, creates ONE item titled with the work's own name
  (`workTitle`). The item carries every section's files, deduplicated by path.
  Every one of its section rows then reads as added under that name.
  Deduplication is by path, never by title: lessons 148 and 149 share a title
  and both stay.
- **Course-scoped identity.** Work reuse (`carriedCourseWorkItem`) only ever
  matches items in this course's own stages. A Setar or Guitar item of the same
  name is never reused, renamed or absorbed.
- **The study source.** Every item created from the course is linked to a
  «خنیاگر» study source, created on first use.
- **Practice items first, not repertoire.** No entry carries any Persian
  identity (form, dastgāh, composer or gusheh), and none is inferred from a
  title: many course pieces are simplified practice versions. Tar is a
  Persian-family instrument, so My repertoire groups its works by dastgāh and
  leaves an item with no Persian identity out. It enters My repertoire only
  when the owner curates that by hand (edit the item, pick "Composed piece",
  give it a form and/or dastgāh), and then groups like any curated Persian
  item: under its dastgāh, or under "No dastgāh yet" without one.
- **Where work rows sit.** A work row renders after the stage's sections, not
  physically between the sections that teach it: `courseStageSeeds` emits units
  then works for every course, and reordering it would change the Guitar
  course. So in stage 3, پیش‌درآمد ابوعطا sits in the same stage list as
  sections 21 and 22, at its end.

## 6. Routines, and what the Session Plan really does

**Every Khonyagar stage ships `routine: []`.** StageDetail therefore shows
neither "Use this level's routine", "Build one for where I am" nor their
caption. The owner can still write any Tar routine by hand, binding segments to
these items. There are four reasons, and all of them come from the course's own
guide:

1. **The guide is shaped by blocks, not sections.** Its 30-minute day is
   warm-up & tuning 4, technique/etude 7, today's lesson 10, review 6 and
   cool-down 3, and it says to keep that order and those proportions. It also
   says "2–3 loops max per session".
2. **Khonyagar's sections are sequential lessons.** The guide's Block 3 is the
   one current گفتار. A CGS level's sections are concurrent strands practised
   daily for weeks.
3. **A section-per-segment routine inverts the guide's minimum day.** A
   30-minute run over a stage of 5–18 sections gives about 1.5–6 minutes per
   section. With nothing essential, `fitRoutineToMinutes` drops the LATEST
   segments first, cutting the frontier and keeping the oldest material. The
   guide's Quick Win (blocks 1 → 3 → 6) is the opposite.
4. **One run marks a whole stage practised.** `applyRoutineRun` writes a block
   per bound item, so one run would mark every section practised today and
   empty the Session Plan's candidate pool for the day.

**The Session Plan is the nearest existing tool, not the guide's template.** It
is unchanged, and it builds from the Tar items the owner has added, as it does
for any instrument:

- The warm-up comes first, at a pinned 12% share, but only when a familiar,
  not-too-hard item qualifies.
- Due reviews come from the spacing schedule.
- The cool-down comes last, but only with a settled item and at least 20
  minutes.
- The middle is ordered by **priority**, not by the guide's technique → lesson
  → review blocks, so a due review often comes before the new work.
- There is no separate technique block and no ear/radif block.
- Minutes follow the app's own weights, not the guide's 30/60 columns.
- Its "lesson" bucket means preparing for a class, never the course's current
  گفتار.

In week one, with only new sections added, it splits the time evenly across at
most three or four of them. Making it follow the guide's block order would
change the plan for every instrument; that is a separate decision for the owner.

## 7. What is NOT here

- **The dated teacher folders** (`afshin-alavi`, `amir-sharifi`,
  `behrooz-hemati`, `ghasem-rahimzadeh`) are not imported, and no `Lesson`
  record is created. They are four teachers and 28 sub-folders (26 session
  folders, plus `radif-mirza-hoesingholi` and `to-be-organised`), 207 files and
  about 4.8 GB. The filenames name nothing. One folder is misspelled
  (`seission-6-…`), several are named with a date range, one range has a
  self-contradictory year (`session-2-02-12-2024-23-12-2025`), and
  `session-18-02-2026` and `session-9` cannot be placed without guessing.
  `behrooz-hemati` sits under `tar-classes/` but carries a SETAR primer
  («دستور سه‌تار ابتدایی»). Two things must be true before they can be
  imported: the owner has normalised them, and each teacher's instrument is
  confirmed. They then belong to the class-logging flow and the archive
  pipeline, not to this course.
- No Persian identity (form, dastgāh, composer or gusheh) on Khonyagar
  entries, and none inferred from a title. The owner curates that metadata
  by hand, and My repertoire's routing is unchanged.
- No generated routine, and no change to the routine machinery or the Session
  Plan.

## 8. Changing it later

A correction is a data change: edit the scanner's tables, re-run it with
`--write`, and commit the regenerated `khonyagarData.ts`. The rules:

- Keys are only ever added.
- A shipped work row stays; a later merge is an alias on it.
- A section never moves stage.
- A work never loses its anchor lesson.

The ledgers in `khonyagarCourse.test.ts` fail if any of these is broken. A new
work, or a newly recognised one, gets its own anchored key and is added to the
ledgers.
