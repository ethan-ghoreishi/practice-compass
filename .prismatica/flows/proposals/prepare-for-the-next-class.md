---
id: prepare-for-the-next-class
proposalType: update
reason: "Issue #60: a planned class keeps its questions and upcoming status when
  the archive binds to it, and its questions stay its history after the date."
proposedBy: agent
createdAt: 2026-10-30T23:13:41.047Z
status: works
presentation:
  title: Take questions and a summary to class
  journey: Classes
  order: 8
truth:
  goal: Arrive at the lesson with the questions that came up while practising, and
    a short honest account of the period.
  startsWhen: A question comes up — asked from a running block or routine ('+ Ask
    teacher'), at Close, or from the item or lesson page.
  needs: []
  steps:
    - actor: Practice Compass
      action: Keeps each question as its own lesson-agenda entry aimed at the class it
        names — the nearest upcoming one by default, changeable, or visibly
        unassigned — and collects a class's open questions by that lesson's id,
        ordered with the Persian collator.
      shows: A 'Questions for your next class' list on the lesson and on the Teacher
        report. A question asked mid-practice saves itself after a short pause
        and says 'Saved' only once the device stored it; its words survive a
        failed write, leaving the screen and the run ending.
      changes: One new open question per capture — later typing, Done and Try again
        update that same entry, never a second — never a preparation commitment
        and never a change to practice priority.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:05.794Z
        commit: b862cbb97909e8df72db35bd426499d358217f18
    - actor: The musician
      action: Copies, downloads or prints the questions.
      shows: A numbered plain-text export that preserves mixed Farsi and English, or a
        friendly empty state when there are none.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:05.794Z
        commit: b862cbb97909e8df72db35bd426499d358217f18
    - actor: The musician
      action: Opens the Teacher report and picks the instrument and a date range (last
        two weeks by default).
      shows: A copyable summary of what was practised, how it went and what is open.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:05.794Z
        commit: b862cbb97909e8df72db35bd426499d358217f18
    - actor: The musician
      action: Taps 'Copy report'.
      shows: "'Copied ✓'."
      changes: Nothing in the data — the report is generated on the spot.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:07:05.794Z
        commit: b862cbb97909e8df72db35bd426499d358217f18
  endsWith: The musician walks into the lesson with their real questions and a
    truthful summary, without having kept a separate notebook.
  variations:
    - name: A question survives practice
      differs: Practising never clears a question — it leaves the open list only when
        marked asked, and then stays with the class it was asked at.
      status: works
    - name: Asked mid-practice
      differs: "'+ Ask teacher' on an ordinary or planned block or a running routine
        captures one line without pausing the clock, the beat or the notes. Who
        it is about is fixed when the field opens, so a routine boundary never
        moves it; an unbound segment asks about the instrument; a class that
        stops being upcoming before the first save is refused with the words
        kept and an 'unassigned' choice; Try again after a failed write rewrites
        the same question, never a second; a question removed elsewhere is never
        recreated except by 'Save as a new question'."
      status: works
    - name: A planned class gets its archive material
      differs: Binding the archive session to the class planned in Compass keeps its
        id, its questions and its upcoming status until its date; once the date
        passes its questions stay that class’s history and are never carried to
        the next one.
      status: works
  rules:
    - A question is never auto-cleared by practising.
    - Reports state what happened; they never grade.
  involves:
    - The musician
    - The teacher
mechanics:
  touchpoints:
    - src/pages/TeacherReport.tsx
    - src/components/ClassQuestions.tsx
    - src/domain/questions.ts
    - src/domain/report.ts
    - src/pages/Lessons.tsx
    - src/pages/CloseBlock.tsx
    - src/components/TeacherQuestionCapture.tsx
    - src/pages/ActiveBlock.tsx
    - src/pages/RoutineRunner.tsx
    - src/domain/lessonAgenda.ts
  routes:
    - /report
    - /lessons
    - /more
  components:
    - TeacherReport
    - ClassQuestions
    - Lessons
  entities:
    - PracticeItem
    - Lesson
    - PracticeBlock
  tests:
    - file: src/domain/questions.test.ts
      steps:
        - 1
        - 2
    - file: tests/live-practice.browser.test.ts
      steps:
        - 1
---

# Proposed update: Take questions and a summary to class

_Proposed by agent · Works now_

**Reason:** Issue #60: a planned class keeps its questions and upcoming status when the archive binds to it, and its questions stay its history after the date.

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question comes up — asked from a running block or routine ('+ Ask teacher'), at Close, or from the item or lesson page.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Keeps each question as its own lesson-agenda entry aimed at the class it names — the nearest upcoming one by default, changeable, or visibly unassigned — and collects a class's open questions by that lesson's id, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the lesson and on the Teacher report. A question asked mid-practice saves itself after a short pause and says 'Saved' only once the device stored it; its words survive a failed write, leaving the screen and the run ending.
   - Changes: One new open question per capture — later typing, Done and Try again update that same entry, never a second — never a preparation commitment and never a change to practice priority.

2. **The musician** Copies, downloads or prints the questions.
   - Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.

3. **The musician** Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
   - Shows: A copyable summary of what was practised, how it went and what is open.

4. **The musician** Taps 'Copy report'.
   - Shows: 'Copied ✓'.
   - Changes: Nothing in the data — the report is generated on the spot.

## Ends with

The musician walks into the lesson with their real questions and a truthful summary, without having kept a separate notebook.

## Variations

- **A question survives practice** — Practising never clears a question — it leaves the open list only when marked asked, and then stays with the class it was asked at. _(Works now)_
- **Asked mid-practice** — '+ Ask teacher' on an ordinary or planned block or a running routine captures one line without pausing the clock, the beat or the notes. Who it is about is fixed when the field opens, so a routine boundary never moves it; an unbound segment asks about the instrument; a class that stops being upcoming before the first save is refused with the words kept and an 'unassigned' choice; Try again after a failed write rewrites the same question, never a second; a question removed elsewhere is never recreated except by 'Save as a new question'. _(Works now)_
- **A planned class gets its archive material** — Binding the archive session to the class planned in Compass keeps its id, its questions and its upcoming status until its date; once the date passes its questions stay that class’s history and are never carried to the next one. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=944dd105a65d47ad truth.goal=b26f5f671db8d28f truth.startsWhen=cb309b4a24a626e5 truth.needs=4f53cda18c2baa0c truth.steps=cac785896825bce1 truth.endsWith=dca700e90f2164f6 truth.variations=2ed978e6af83062a truth.rules=c0c124dd61207977 truth.involves=994c3840888a2210 mechanics.touchpoints=9e38d021ce3ca5e8 mechanics.routes=89330890e96418c9 mechanics.components=af84f3a7063b3e4e mechanics.entities=890e567ebc9cf98e mechanics.tests=00e0973c6aed0583 -->
