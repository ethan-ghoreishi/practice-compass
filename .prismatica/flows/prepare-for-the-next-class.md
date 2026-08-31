---
id: prepare-for-the-next-class
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Take questions and a summary to class
  journey: Classes
  order: 8
truth:
  goal: Arrive at the lesson with the questions that came up while practising, and
    a short honest account of the period.
  startsWhen: A question is written on an item (at close, or by editing it) while
    it is flagged for the next class.
  needs: []
  steps:
    - actor: Practice Compass
      action: Collects every item for that instrument that is both flagged for the
        next class and carries a question, ordered with the Persian collator.
      shows: A 'Questions for your next class' list on the upcoming lesson and on the
        Teacher report.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:06.304Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Copies, downloads or prints the questions.
      shows: A numbered plain-text export that preserves mixed Farsi and English, or a
        friendly empty state when there are none.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:06.304Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Opens the Teacher report and picks the instrument and a date range (last
        two weeks by default).
      shows: A copyable summary of what was practised, how it went and what is open.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:06.304Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Copy report'.
      shows: "'Copied ✓'."
      changes: Nothing in the data — the report is generated on the spot.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:20:06.304Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: The musician walks into the lesson with their real questions and a
    truthful summary, without having kept a separate notebook.
  variations:
    - name: A question survives practice
      differs: Practising never clears a question — only editing the item removes it.
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
approval:
  hash: 79d3ebee5b9e5cf7e13e6d61ac17e1154a9e3a662b882229ef3fd17c120b64dc
  at: 2026-08-28T13:30:18.013Z
  by: Ethan
  signature: +CvCBPI6aAq0y/89W9M1Mu4LZo3hLET/MjfgxvfVJQNWC3VDqd0/qwMAPDFMplRXyNEgYMbKaNZzhW6Rnt3FCw==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Take questions and a summary to class

_Works now · approved 2026-08-28T13:30:18.013Z by Ethan (signed)_

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question is written on an item (at close, or by editing it) while it is flagged for the next class.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.

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

- **A question survives practice** — Practising never clears a question — only editing the item removes it. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher
