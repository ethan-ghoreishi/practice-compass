---
id: log-a-class
createdAt: 2026-08-26T22:58:34.899Z
status: works
presentation:
  title: Log a class and its follow-up work
  journey: Classes
  order: 7
truth:
  goal: Record a lesson, write up what was said after rewatching it, and turn it
    into concrete work before the next one.
  startsWhen: The musician taps 'Add a class' on the Lessons screen for one instrument.
  needs:
    - At least one instrument exists
  steps:
    - actor: The musician
      action: Accepts the pre-filled class number and picks the date.
      shows: The class appears as 'Class N · date', newest first, with 'upcoming'
        while it is still ahead.
      changes: A Lesson is stored for that instrument; the number is optional and
        editable.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Rewatches the class and types the notes, in Farsi or English.
      shows: A direction-aware notes field; the list shows 'notes ✓' once there is
        text.
      changes: Notes are saved when the field loses focus.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Adds a link to the class recording and to any scores — a NAS path or a
        full https link.
      shows: The links listed video-first, then PDFs and documents, each with its kind
        icon and 'Stored on NAS'.
      changes: Only a reference (title, path, kind, notes) is stored — never the file
        itself.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Taps 'Open' on a link.
      shows: The file opens in a new tab, resolved against the NAS base URL from
        Settings.
      changes: Nothing is stored or downloaded into the app; removing a link never
        touches the NAS file.
      assumes:
        - A NAS base URL is set in Settings and the NAS is reachable from this
          device
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Links or quick-adds the practice items that came out of the class, and
        flags the ones to be ready for next time.
      shows: Each linked item with its status and a 'For next class' toggle.
      changes: The lesson keeps a link to the item (never ownership — unlinking keeps
        the item); a flagged item gains a priority boost that climbs as that
        instrument's next class approaches.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
    - actor: The musician
      action: Optionally attaches small hand-outs (a PDF, a photo, a short audio).
      shows: Files over 10 MB and any video are warned about; over 40 MB is refused
        with a clear message.
      changes: Small blobs are stored on the device and travel with backups and sync.
      assumes: []
      evidence:
        method: manual
        at: 2026-08-31T16:19:58.330Z
        commit: 017d8c3385210b8e4ec217183390ce22c487eb19
  endsWith: The class is on record, its material is real practice items, and the
    work due before the next class is prioritised automatically.
  variations:
    - name: No NAS base URL yet
      differs: The link shows 'Set your NAS base URL in Settings to open this' and the
        Open button stays disabled — never a broken link.
      status: works
    - name: Invalid base URL
      differs: An unparseable base is reported as such and nothing is opened, rather
        than resolving to a wrong in-app address.
      status: works
    - name: Import the Setar class history
      differs: Settings → 'Import Setar classes' adds the logged sessions as lessons
        with their recording and score links, additively and idempotently,
        backfilling refs missing from classes already imported.
      status: works
    - name: Wide screen
      differs: At 1000px and above the class list sits beside the open class, giving
        long Farsi notes real room.
      status: works
  rules:
    - Class videos and scores are references to the user's NAS, never bytes in
      the app, sync or backups.
    - A lesson link to an item is a link, never ownership.
    - The next class is the one sanctioned deadline — per instrument, never
      guilt-toned.
  involves:
    - The musician
    - The teacher (indirectly)
    - The NAS
mechanics:
  touchpoints:
    - src/pages/Lessons.tsx
    - src/components/Attachments.tsx
    - src/domain/recordings.ts
    - src/domain/setarClasses.ts
    - src/domain/files.ts
    - src/domain/selectors.ts
    - src/store/useStore.ts
  routes:
    - /lessons
    - /items/:id
    - /settings
  components:
    - Lessons
    - Attachments
    - QuickAdd
    - ClassQuestions
  entities:
    - Lesson
    - LessonRecording
    - PracticeItem
    - AttachmentMeta
  tests:
    - file: src/domain/selectors.test.ts
      steps:
        - 1
    - file: src/domain/recordings.test.ts
      steps:
        - 4
    - file: src/domain/files.test.ts
      steps:
        - 6
    - file: src/domain/setarClasses.test.ts
      steps:
        - 1
        - 3
approval:
  hash: 5c72d856396414a95ce41b59cea9b33c3feeba7ea4e005b5dc75dce5ee0e9322
  at: 2026-08-28T13:30:17.922Z
  by: Ethan
  signature: 85rNsnyuqrGVG1+i3HgYxJvRb1eNWlKNc4YHbFf4RBS0Mq43dNawaZO6pq+N78Eh9lp23oXdM1pQ8opavOSxCA==
  publicKey: |
    -----BEGIN PUBLIC KEY-----
    MCowBQYDK2VwAyEAxxaiErDKWXw9qQrVISVCyYQrsfvEEbOKmcLKt92Rkro=
    -----END PUBLIC KEY-----
---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS
