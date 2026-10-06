---
id: log-a-class
proposalType: update
reason: "Change 20261005-make-setar-archive-recovery-repertoire-c-e964 reads one
  association relation everywhere: a class lists the pieces its Setar archive
  names as well as the owner’s own links, and unlinking one is a single
  reversible decision."
proposedBy: agent
createdAt: 2026-10-05T23:20:16.148Z
status: works
presentation:
  title: Log a class and its follow-up work
  journey: Classes
  order: 7
truth:
  goal: Record a lesson, write up what was said after rewatching it, and turn it
    into concrete work before the next one
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
        at: 2026-10-01T20:18:28.197Z
        commit: 782c0fde5ba646c100c702624ad5177b3cf556d4
    - actor: The musician
      action: Rewatches the class and types the notes, in Farsi or English.
      shows: A direction-aware notes field; the list shows 'notes ✓' once there is
        text.
      changes: Notes are saved when the field loses focus.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:28.197Z
        commit: 782c0fde5ba646c100c702624ad5177b3cf556d4
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
        at: 2026-10-01T20:18:28.197Z
        commit: 782c0fde5ba646c100c702624ad5177b3cf556d4
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
        at: 2026-10-01T20:18:28.197Z
        commit: 782c0fde5ba646c100c702624ad5177b3cf556d4
    - actor: The musician
      action: Links or quick-adds the practice items that came out of the class, and
        flags the ones to be ready for next time.
      shows: Each linked item with its status and a 'For next class' toggle. A piece
        the class's Setar archive lists appears too, labelled '· in this class’s
        archive'; the item's own page names the same classes.
      changes: The lesson keeps a link to the item (never ownership — unlinking keeps
        the item); unlinking an archive-listed piece records only that one
        decision and linking it again lifts it — nothing is copied into the
        lesson’s own links; a flagged item gains a priority boost that climbs as
        that instrument's next class approaches.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-05T23:19:51.493Z
    - actor: The musician
      action: Optionally attaches small hand-outs (a PDF, a photo, a short audio).
      shows: Files over 10 MB and any video are warned about; over 40 MB is refused
        with a clear message.
      changes: Small blobs are stored on the device and travel with backups and sync.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-01T20:18:28.197Z
        commit: 782c0fde5ba646c100c702624ad5177b3cf556d4
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
---

# Proposed update: Log a class and its follow-up work

_Proposed by agent · Works now_

**Reason:** Change 20261005-make-setar-archive-recovery-repertoire-c-e964 reads one association relation everywhere: a class lists the pieces its Setar archive names as well as the owner’s own links, and unlinking one is a single reversible decision.

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one

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
   - Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.

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

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, truth.needs, truth.variations, truth.rules, truth.involves, mechanics.touchpoints, mechanics.routes, mechanics.components, mechanics.entities, mechanics.tests

**Removes from the current Flow:** nothing

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=a50f50323842e07a truth.goal=08d1ccc4b06c82ab truth.startsWhen=a08f46af4cb2fd0f truth.needs=58e61a4c71267edc truth.steps=bcca232e3de814c3 truth.endsWith=7b85adb0360ff475 truth.variations=9a77f59a5eb35fb9 truth.rules=7bdf54ed2b9df29a truth.involves=05c7e1544746b519 mechanics.touchpoints=f06f51e85a5558ef mechanics.routes=59cc82c20a41c0fe mechanics.components=dd5db3b41812505a mechanics.entities=3d9d1dd8b54f13d0 mechanics.tests=601711f6bd02253f -->
