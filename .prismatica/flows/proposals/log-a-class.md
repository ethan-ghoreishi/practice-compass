---
id: log-a-class
proposalType: update
reason: "Issue #60: a class planned in Compass binds to its later archive
  session as ONE lesson; the obsolete bundled importer and the For-next-class
  toggle are gone from the app."
proposedBy: agent
createdAt: 2026-10-30T23:13:41.047Z
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
        at: 2026-10-29T21:06:34.532Z
        commit: de7881e74b40926f06088028875f5183b506f7a9
    - actor: The musician
      action: Rewatches the class and types the notes, in Farsi or English.
      shows: A direction-aware notes field; the list shows 'notes ✓' once there is
        text, and 'Saved.' only once the device has stored them.
      changes: Notes save themselves after a short pause and whenever the musician
        leaves the class — never merely because the field loses focus; Done is
        optional. Words still unsaved when the page reloads are written to that
        class afterwards, and a class whose notes changed meanwhile keeps both
        texts.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:06:34.532Z
        commit: de7881e74b40926f06088028875f5183b506f7a9
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
        at: 2026-10-29T21:06:34.532Z
        commit: de7881e74b40926f06088028875f5183b506f7a9
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
        at: 2026-10-29T21:06:34.532Z
        commit: de7881e74b40926f06088028875f5183b506f7a9
    - actor: The musician
      action: Links or quick-adds the practice items that came out of the class, and
        commits the ones to be ready for a class with 'Prepare for Class N ·
        date'.
      shows: Each linked item with its status; a piece the class’s Setar archive lists
        appears too, labelled '· in this class’s archive'; the item’s own page
        names the same classes.
      changes: The lesson keeps a link to the item (never ownership — unlinking keeps
        the item); unlinking an archive-listed piece records only that one
        decision; a preparation names that one class, whose date is the deadline
        that raises the item’s priority as it nears.
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-30T23:13:30.267Z
    - actor: The musician
      action: Optionally attaches small hand-outs (a PDF, a photo, a short audio).
      shows: Files over 10 MB and any video are warned about; over 40 MB is refused
        with a clear message.
      changes: Small blobs are stored on the device and travel with backups and sync.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-29T21:06:34.532Z
        commit: de7881e74b40926f06088028875f5183b506f7a9
    - actor: The musician
      action: After the class, puts its recording and material in the ordinary
        session-N-DD-MM-YYYY folder on the NAS; the scheduled job publishes the
        index; Refresh Setar archive asks whether that session is the class
        planned in Compass.
      shows: "'Is this the class you planned in Compass?' with Link / Create
        separately / Skip, and anything the archive could not read grouped by
        the one action it needs (register, roster, rename, file type)."
      changes: "Link binds the session to the SAME lesson: its id, commitments,
        questions and notes stay; the archive’s files are composed onto it; it
        stays upcoming until its date. Repeating Refresh changes nothing."
      assumes:
        - The NAS job has published the session
      evidence:
        method: inferred
        at: 2026-10-30T23:13:30.267Z
  endsWith: The class is on record once, with its archive material, its material
    is real practice items, and the work due before the next class is
    prioritised automatically.
  variations:
    - name: No NAS base URL yet
      differs: The link shows 'Set your NAS base URL in Settings to open this' and the
        Open button stays disabled — never a broken link.
      status: works
    - name: Invalid base URL
      differs: An unparseable base is reported as such and nothing is opened, rather
        than resolving to a wrong in-app address.
      status: works
    - name: A class that appears twice
      differs: A session already imported beside the owner’s planned class of the same
        date and number is offered as Combine into my class (the owner’s lesson
        survives with every note, link, agenda entry and attachment of both;
        nothing deleted or hidden) or Keep separate (remembered). Unsaved words
        on the archive copy refuse the combine, kept.
      status: works
    - name: Archive-only history
      differs: A session no planned class matches arrives as a historical lesson,
        never upcoming even when its date is ahead of the device clock.
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
    - "One real class is one lesson: the archive binds to the owner’s lesson,
      never a competing copy."
  involves:
    - The musician
    - The teacher (indirectly)
    - The NAS
mechanics:
  touchpoints:
    - src/pages/Lessons.tsx
    - src/components/Attachments.tsx
    - src/domain/setarClasses.ts
    - src/components/ArchiveRefresh.tsx
    - src/components/LessonReconcile.tsx
    - src/domain/recordings.ts
    - src/domain/sourceReconcile.ts
    - src/domain/lessonReconcile.ts
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
    - file: tests/setar-lifecycle.browser.test.ts
      steps:
        - 1
        - 5
        - 7
    - file: tests/setar-lifecycle.test.ts
      steps:
        - 7
---

# Proposed update: Log a class and its follow-up work

_Proposed by agent · Works now_

**Reason:** Issue #60: a class planned in Compass binds to its later archive session as ONE lesson; the obsolete bundled importer and the For-next-class toggle are gone from the app.

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
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text, and 'Saved.' only once the device has stored them.
   - Changes: Notes save themselves after a short pause and whenever the musician leaves the class — never merely because the field loses focus; Done is optional. Words still unsaved when the page reloads are written to that class afterwards, and a class whose notes changed meanwhile keeps both texts.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and commits the ones to be ready for a class with 'Prepare for Class N · date'.
   - Shows: Each linked item with its status; a piece the class’s Setar archive lists appears too, labelled '· in this class’s archive'; the item’s own page names the same classes.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision; a preparation names that one class, whose date is the deadline that raises the item’s priority as it nears.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

7. **The musician** After the class, puts its recording and material in the ordinary session-N-DD-MM-YYYY folder on the NAS; the scheduled job publishes the index; Refresh Setar archive asks whether that session is the class planned in Compass.
   - Shows: 'Is this the class you planned in Compass?' with Link / Create separately / Skip, and anything the archive could not read grouped by the one action it needs (register, roster, rename, file type).
   - Changes: Link binds the session to the SAME lesson: its id, commitments, questions and notes stay; the archive’s files are composed onto it; it stays upcoming until its date. Repeating Refresh changes nothing.
   - Only if: The NAS job has published the session

## Ends with

The class is on record once, with its archive material, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **A class that appears twice** — A session already imported beside the owner’s planned class of the same date and number is offered as Combine into my class (the owner’s lesson survives with every note, link, agenda entry and attachment of both; nothing deleted or hidden) or Keep separate (remembered). Unsaved words on the archive copy refuse the combine, kept. _(Works now)_
- **Archive-only history** — A session no planned class matches arrives as a historical lesson, never upcoming even when its date is ahead of the device clock. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.
- One real class is one lesson: the archive binds to the owner’s lesson, never a competing copy.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

**Kept as the current Flow has it (not mentioned by this proposal):** presentation, mechanics.routes, mechanics.components, mechanics.entities

**Removes from the current Flow (deliberately — approving drops these):**
- truth.variations: Import the Setar class history

<!-- prismatica:completed-against status=2fc8ad4541cd957b presentation=a50f50323842e07a truth.goal=a79f055034a65ff1 truth.startsWhen=a08f46af4cb2fd0f truth.needs=58e61a4c71267edc truth.steps=93b1cb8f2185caf4 truth.endsWith=7b85adb0360ff475 truth.variations=9a77f59a5eb35fb9 truth.rules=7bdf54ed2b9df29a truth.involves=05c7e1544746b519 mechanics.touchpoints=f06f51e85a5558ef mechanics.routes=59cc82c20a41c0fe mechanics.components=dd5db3b41812505a mechanics.entities=3d9d1dd8b54f13d0 mechanics.tests=601711f6bd02253f -->
