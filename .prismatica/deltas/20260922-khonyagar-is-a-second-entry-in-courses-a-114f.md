---
id: 20260922-khonyagar-is-a-second-entry-in-courses-a-114f
flowId: work-a-pathway-stage
today: "Tar has a placeholder pathway and nothing else. `tar-honarestan` offers
  ten hand-authored stages of generic steps, and its own seed note says it is a
  framework to fill in as you go. The owner's complete Khonyagar course — 259
  lesson videos (~16h28m), 106 sections and four score books — is invisible to
  the app. Not one video or score is reachable from a practice item, and the
  only way to attach one is to type NAS links by hand. Its repertoire is absent
  too: the Mahur radif gushehs, پیش‌درآمد ماهور درویش‌خان, تصنیف ز من نگارم, two
  different چهارمضراب ماهور, and works taught inside other lessons such as
  پیش‌درآمد ابوعطا cannot be practised, scheduled or reviewed. Works taught
  across several sections have no way to be one work. The course's own daily
  practice guide is nowhere in the app. `COURSES` holds exactly one entry, so
  the course machinery the Guitar lane built is available to Guitar alone."
instead: >-
  Khonyagar is a second entry in `COURSES`. A new `tar-khonyagar` pathway
  presents the course's 106 sections across ten stages, under its own three band
  headings, in Farsi, with pure-ascii keys anchored in the course's numbering.
  It reaches the owner's existing database through the "restore default
  pathways" button that already exists, and `tar-honarestan` is left untouched
  beside it. Adding a section brings its lesson videos and its band's score book
  with it automatically, with no link typed and no new device setting; every
  path is stored in the NFC form the NAS actually serves. Every work the course
  teaches reaches My repertoire once, under the work's own name:

  - a work taught across seven sections is ONE item carrying all seven sections'
  files;

  - a work taught inside an exercise section is its own row carrying exactly its
  own lessons, and the section is none;

  - two works that share a title stay two.

  Work keys are anchored to a lesson and never change after they ship. The data
  accounts for every section, every lesson exactly once and every score book,
  and the scanner refuses to write if the disk and the index disagree. The
  stages generate no routine, because the course's own guide asks for
  block-shaped days around the current lesson, not a tour of every section. For
  a timed session, the existing Session Plan builds from these items as it does
  for any instrument: warm-up first and cool-down last when an item qualifies,
  due reviews and the most urgent work in between, by priority rather than in
  the guide's block order. The guide reaches the owner as text: its daily
  template on the pathway, and its advice for each kind of lesson in every
  item's Working notes. The dated teacher folders are not imported, and the
  reasons are recorded.
keep:
  - "`tar-honarestan` keeps every stage, code, title and catalogue key it has
    today, and any item already placed in it keeps its suggestion."
  - "The Setar class archive and the Classical Guitar Shed course are untouched:
    data, scanners, publisher, stages, keys, works, work notes, routines and
    routine names alike."
  - "Seeing where you are in a stage stays derived from item status:
    `stageUnits` and `itemStageState` are unchanged, and a suggestion you have
    not taken stays a suggestion."
  - Taking a suggestion stays one tap, arrives honestly as "Not practised yet"
    with zero statistics, and stays losslessly removable until you practise it.
    An Undo still reaches only an item the tap created.
  - "Routines and the Session Plan are unchanged: the same runner, the same
    duration control, the same plan builder. Any Tar routine the owner writes by
    hand works exactly as it does today."
  - The archive base and the derived media root keep their values and meaning,
    so no device needs reconfiguring and every existing reference resolves
    identically.
  - "`reseedDefaultPathways` and its button are unchanged, so a stage
    deliberately deleted from an existing pathway is still never resurrected."
  - A Setar piece sharing a Khonyagar work's name stays a separate item on a
    separate instrument.
  - No file bytes enter the app, sync or a backup, and no item, work, routine or
    stage is created without an explicit owner action.
assumptions:
  - "The NAS serves NFC while the local disk is NFD. This was verified directly,
    and re-probed in this pass: 404 on the decomposed form, 206 video/mp4 on the
    composed one. Every stored path is therefore the real filename
    NFC-normalised."
  - Stage boundaries, work membership (by lesson number) and lesson types are
    authored decisions, recorded in `docs/khonyagar-course.md`. The source
    states none of them mechanically, and a crude grammar demonstrably
    mis-groups this data. A work's key is `w` plus its anchor lesson, written
    literally, so a reorder, a correction or a newly recognised work cannot move
    an existing identity.
  - The Session Plan stays unchanged and is not presented as the guide's
    template. It shares the guide's frame (warm-up first, spaced review,
    cool-down last), but it orders the middle by priority and splits minutes by
    its own weights. Making it follow the guide's blocks would change every
    instrument's plan, and is left to a separate decision.
showMe: >-
  Press "restore default pathways" on Repertoire. A new Tar pathway, «تار – آزاد
  میرزاپور (خنیاگر)», appears beside the Honarestān one, which is unchanged. Its
  note carries the course's daily practice template.


  Open it: ten stages under تار مقدماتی, متوسطه and تار ۳, each listing the
  course's own sections in its own words.


  In the first stage, add «به دست گرفتن مضراب تار و نواختن سیم‌ها». Its three
  lesson videos and نت ۱ are already under Material with no link typed, and
  tapping one plays it from the NAS. Its Working notes carry the guide's advice
  for a technique lesson.


  In the third stage, sections 21 and 22 are exercise sessions, and پیش‌درآمد
  ابوعطا sits beside them as its own row. Add it, and exactly its two lessons
  come with it.


  In the last stage, add «چهارمضراب ماهور - بخش دوم». My repertoire gains ONE
  item, named for the radif's چهارمضراب ماهور rather than for part two, carrying
  the videos of all seven sections that teach it, and each of those seven rows
  now reads as added. Musa Ma'rufi's چهارمضراب ماهور in stage four is still a
  separate suggestion, and your Setar item of the same name is untouched.


  The stages offer no generated routine. For a timed session, choose "Plan this
  session" on Today for 30 minutes of Tar. In your first week, with a few new
  sections added, it splits the time across them, about 10 minutes each. Once
  some items are familiar and one is due, it looks more like: a 4-minute
  warm-up, the due review, the section you are learning, and a short cool-down
  on something settled. It orders the middle by priority, not by the guide's
  technique → lesson → review blocks. The guide's own order lives in the
  template on the pathway.
status: approved
contractId: 20260922-bring-the-khonyagar-tar-course-into-its--56be
createdAt: 2026-09-22T21:24:44.625Z
---

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

