---
id: 20260921-each-level-offers-what-the-course-actual-f13f
flowId: work-a-pathway-stage
today: "The Classical Guitar Shed pathway has a stage for every level the owner
  owns but almost no content. Levels 1B-3F each offer the same eight generic
  suggestions from `cgsOutline()` with one boilerplate sentence apiece, no
  course material, no named works and no routine. Adding the generic “Piece”
  suggestion creates a work literally called “Piece” in My repertoire, because
  `strand: 'piece'` maps to `itemType: 'full_piece'`. No course file reaches a
  practice item even though the whole tree is already served by the NAS:
  `itemFiles` composes only the Setar archive graph, hand-entered references and
  linked lessons, so a Guitar item's Material section is empty. The one NAS
  setting names the Setar archive folder and nothing knows that the folder above
  it is the shared `video-courses` root that also holds `classical-guitar`.
  Sixteen levels have no routine and there is no way to get one for a level you
  are part-way through — the owner is at 1B `05_Scales` and assembles that by
  hand every day. A routine runs only at its authored length. And a level bought
  later could never reach an existing database: `reseedDefaultPathways` adds
  stages only for pathways that do not yet exist, `addStage` mints a random id
  no catalogue could be keyed to, and there is no action that means “add the
  levels I have just bought”."
instead: "Each level offers what the course actually teaches there: its real
  sections with their guidance and syllabus BPMs, keeping the existing keys
  wherever a real section maps onto one. The level's own study and the named
  packet works with their composers are their own entries and become the only
  things that reach My repertoire, grouped under a “Classical Guitar Shed” study
  source created on first use; a work carried forward across levels is
  introduced once and reused, never duplicated. Every item created from the
  course carries its section's videos, scores, images and contrast-card folder
  automatically, composed live from the catalogue and never stored on the item,
  resolving under the one shared media root derived from the archive base the
  owner already set — shown on screen, overridable, and honestly unavailable
  rather than a dead link when there is none. A stage offers “Use this level's
  routine”, transcribed from the syllabus with its `***` segments essential, and
  “Build one for where I am” — the previous level's essentials plus only the
  sections actually added — both written as ordinary editable routines. Any
  routine can be run at a chosen total: its authored length is the default,
  changing it scales the segments proportionally, and too short a time drops
  non-essential segments before essential ones. Buying Levels 4A-5F later is a
  data change: the stage list comes from the generated course data, and a
  course-scoped “Add new levels from this course” action adds only the missing
  ones, without redefining the existing “restore default pathways” button or
  touching stages the owner edited."
keep:
  - Seeing where you are in a stage stays derived from item status exactly as it
    is now — `stageUnits` and `itemStageState` are unchanged, and a suggestion
    you have not taken stays a suggestion.
  - Taking a suggestion into your own items stays one tap, arrives honestly as
    “Not practised yet” with zero statistics, and stays losslessly removable
    until you practise it.
  - "Running a routine is unchanged: the same runner, the same frozen segment
    list, the same boundary signals, the same at-most-one-block-per-bound-item
    recording. Only segment minutes are ever scaled."
  - “Short on time — essentials only” keeps its exact meaning and stays
    independent of duration.
  - Level 1A keeps its fourteen hand-authored steps and both of its existing
    routines, byte for byte.
  - "Every Setar and Tar pathway, stage, catalogue entry and routine is
    untouched, and so is the whole Setar archive: its index, scanner, publisher,
    refresh and adoption flow."
  - The configured archive base keeps its value and meaning, so no device needs
    reconfiguring and every existing lesson reference resolves identically.
  - The Session Plan is untouched and remains a separate peer; only its 5-120
    minute bound is shared.
  - Today keeps its doorway order, its card heights and its above-the-fold
    recommendation.
  - No file bytes enter the app, sync or a backup, and no item, routine, stage
    or study source is ever created without an explicit owner action.
assumptions:
  - The guitar tree is already served by the NAS — verified directly, including
    a real 1B lesson video returning 206 video/mp4 — so no mirroring is needed
    and no new device setting is required.
  - Course material is derived from the catalogue rather than copied onto items,
    so re-running the scanner after a course change reaches items that already
    exist.
showMe: "Open Pathways → Classical Guitar Shed → Level 1B. Instead of eight
  generic rows it lists the level's real sections — Chords (C, G7), Split Chunks
  P-IM and P-MA, I/M Alternation at 60 bpm, Finger-Walking, Rhythm Practice #1,
  Sight-Reading, Study #1 — plus the level's named works (Sor Op.35 No.1,
  Carulli Op.241 No.1, Ode to Joy and the rest of the packet). Add “Split
  Chunks” and open it: its four lesson videos and the level syllabus PDF are
  already under Material, no link ever typed, and tapping one opens it from the
  NAS — Settings shows the media root it derived from your archive base, with
  Browse to confirm. Add Study #1 and it appears in My repertoire under
  “Classical Guitar Shed”; add Finger-Walking and it does not. Back on the
  stage, press “Build one for where I am”: because only the sections up to
  05_Scales have been added, the routine is 1A's essentials followed by just
  those 1B segments — Piece, Rhythm and Sight-Reading are simply absent, not
  skipped. It is an ordinary routine: reorder it, retime it, or set today's
  duration to 12 minutes and watch the segments scale in proportion, the
  non-essential ones dropping first while the asterisked ones stay. “Short on
  time” still does what it always did."
status: approved
contractId: 20260921-bring-the-classical-guitar-shed-course-i-9b18
createdAt: 2026-09-21T22:37:01.810Z
---

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

