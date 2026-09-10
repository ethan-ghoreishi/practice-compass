---
id: 20260910-everything-the-app-already-knows-reaches-8664
flowId: browse-my-repertoire
step: 4
today: >-
  This Flow promises the right piece is found and opened in a couple of taps,
  'from whichever way of thinking about it came first' -- step 3 narrowing to
  one instrument, step 4 filtering the practice list by search, step 5 opening
  the item. Verified at 5325ce31, each breaks differently. This Delta is
  anchored at step 4, where the failure is sharpest and reproducible, but it
  spans steps 3 to 5 of this Flow -- narrowing to one instrument, filtering by
  search, and opening the item -- and it additionally reaches the practice
  screen, which belongs to practise-todays-recommendation. A reviewer checking
  step 4 alone will find only part of the change; possibleConflicts records the
  full span.


  SEARCH DOES NOT WORK IN THE LANGUAGE THE DATA IS WRITTEN IN. Both search boxes
  filter with title.toLowerCase().includes(query), which does nothing useful for
  Persian. Reproduced by running the real modules: typing 'daramad' does not
  find درآمد, and typing 'كرشمه' with an Arabic kaf -- which is what an iOS
  Arabic keyboard produces -- does not find 'کرشمه' stored with a Persian kaf.
  So the keyboard on the phone can emit characters that will never match the
  seeded Setar and Tar data. persianSearchMatch, which folds exactly these, has
  existed and been tested this whole time and is imported by no screen.


  THE APP HAS THREE IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick
  Add and the Session Plan use the persisted session instrument. Repertoire
  keeps its own dropdown that resets to every-instrument on every visit. Lessons
  has neither and lists every instrument at once, so on the phone 40-plus Setar
  classes stack above Tar and Guitar with no way to narrow.


  AND AN ITEM NEVER SHOWS ITS OWN MATERIAL. The item page already knows which
  lessons it came from and renders them as a bare link to the lessons list --
  not to the lesson, and never to the class video or score that lesson holds.
  During practice there is nothing at all. Meanwhile adding a NAS reference
  still means typing a path from memory, even though the NAS already serves
  browsable directory listings that nothing in the app links to; and pasting a
  full URL, which does work, silently pins that reference to one device's route
  to the NAS.
instead: >-
  Everything the app already knows reaches you where you are -- and it stores
  nothing new to do it.


  Search finds what you mean: both boxes go through the existing Farsi-aware
  matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold
  together, and 'daramad' finds درآمد. Repertoire and Lessons open on the
  instrument you are actually practising, from the same session instrument every
  other screen uses, each keeping a visible way to widen to all. A piece lists
  the files that already belong to it -- the class video and score from the
  lessons it is linked to, and its own attachments -- and that same list is one
  closed disclosure away while you play, with a photo of the page inline and
  everything else an explicit open, never an embed. And you stop typing paths: a
  Browse link opens the NAS where you already configured it, and a URL you paste
  back is stored RELATIVE to that base, so the reference keeps working on every
  device whatever route that device takes to the NAS.
keep:
  - "The cross-instrument view survives: Repertoire and Lessons default to one
    instrument but both keep a visible way to widen to all, so narrowing stays a
    default you can undo rather than a capability removed."
  - The Farsi matcher itself is unchanged -- only the two screens that never
    called it.
  - Nothing new is persisted to show an item's material; it is composed from
    lesson links and attachments that already exist.
  - "Large media stays on the NAS: files are opened, never fetched into
    attachments, sync or backups."
  - Active practice stays calm -- one collapsed disclosure, closed by default,
    never above the timer.
  - No timer, wake-lock or boundary-signal behaviour changes, and no viewer
    concern can influence a recorded minute.
  - "No schema change and no CSP change: SCHEMA_VERSION stays 11 and the
    production build's policy is untouched."
  - Everything still works fully offline; an unset or unreachable NAS degrades
    to a plain explanation, never an error, and never blocks practising.
assumptions:
  - The NAS is served over the LAN by nginx at https://192.168.0.20:5010 with
    real browsable directory listings -- verified by probe, not taken from
    DECISIONS.md, which records a Tailscale mechanism that is not installed on
    this Mac.
  - Its certificate is Synology's self-signed default and does not match the IP,
    so each device accepts it once. That is infrastructure; this lane surfaces
    the consequence and does not try to solve it.
  - Whether to stay on the LAN address or move to something like Tailscale is
    your decision to make later. Storing references relative to the configured
    base is what keeps that decision free.
  - A pasted URL from a different origin is left absolute rather than rewritten
    -- it is a deliberate external link.
  - Most Setar material arrives through classes, so composing an item's files
    from its lessons covers the common case; an item with no lesson link needs a
    stored reference of its own, which is a separate schema change.
showMe: >-
  On the phone, search your practice list for a gusheh using the Persian
  keyboard -- it is found, including when the keyboard gives you an Arabic kaf
  or yeh, and typing 'daramad' finds درآمد too. Open Repertoire and Lessons:
  both are already showing the instrument you are practising, not all three, and
  both still let you widen to everything in one tap.


  Open a piece that came from a class. Its class video and score are listed
  right there on the item, and each opens on the NAS. Start a block on it and
  the same list is one tap away behind a closed disclosure -- a photo of the
  page shows inline while the timer keeps running, and the target signal still
  fires exactly as before.


  Then add a new reference without typing a path: tap Browse, find the file in
  the NAS listing, copy its URL, paste it in, save. Change your NAS base URL to
  a different form of the same host and the reference still opens -- because
  what got stored was the path, not the address of one device's route to it.
status: approved
contractId: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
createdAt: 2026-09-10T22:24:52.985Z
---

# Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

_approved · about "browse-my-repertoire" step 4_

## Today

This Flow promises the right piece is found and opened in a couple of taps, 'from whichever way of thinking about it came first' -- step 3 narrowing to one instrument, step 4 filtering the practice list by search, step 5 opening the item. Verified at 5325ce31, each breaks differently. This Delta is anchored at step 4, where the failure is sharpest and reproducible, but it spans steps 3 to 5 of this Flow -- narrowing to one instrument, filtering by search, and opening the item -- and it additionally reaches the practice screen, which belongs to practise-todays-recommendation. A reviewer checking step 4 alone will find only part of the change; possibleConflicts records the full span.

SEARCH DOES NOT WORK IN THE LANGUAGE THE DATA IS WRITTEN IN. Both search boxes filter with title.toLowerCase().includes(query), which does nothing useful for Persian. Reproduced by running the real modules: typing 'daramad' does not find درآمد, and typing 'كرشمه' with an Arabic kaf -- which is what an iOS Arabic keyboard produces -- does not find 'کرشمه' stored with a Persian kaf. So the keyboard on the phone can emit characters that will never match the seeded Setar and Tar data. persianSearchMatch, which folds exactly these, has existed and been tested this whole time and is imported by no screen.

THE APP HAS THREE IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add and the Session Plan use the persisted session instrument. Repertoire keeps its own dropdown that resets to every-instrument on every visit. Lessons has neither and lists every instrument at once, so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow.

AND AN ITEM NEVER SHOWS ITS OWN MATERIAL. The item page already knows which lessons it came from and renders them as a bare link to the lessons list -- not to the lesson, and never to the class video or score that lesson holds. During practice there is nothing at all. Meanwhile adding a NAS reference still means typing a path from memory, even though the NAS already serves browsable directory listings that nothing in the app links to; and pasting a full URL, which does work, silently pins that reference to one device's route to the NAS.

## Instead

Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

## Keep

- The cross-instrument view survives: Repertoire and Lessons default to one instrument but both keep a visible way to widen to all, so narrowing stays a default you can undo rather than a capability removed.
- The Farsi matcher itself is unchanged -- only the two screens that never called it.
- Nothing new is persisted to show an item's material; it is composed from lesson links and attachments that already exist.
- Large media stays on the NAS: files are opened, never fetched into attachments, sync or backups.
- Active practice stays calm -- one collapsed disclosure, closed by default, never above the timer.
- No timer, wake-lock or boundary-signal behaviour changes, and no viewer concern can influence a recorded minute.
- No schema change and no CSP change: SCHEMA_VERSION stays 11 and the production build's policy is untouched.
- Everything still works fully offline; an unset or unreachable NAS degrades to a plain explanation, never an error, and never blocks practising.

## New assumptions

- The NAS is served over the LAN by nginx at https://192.168.0.20:5010 with real browsable directory listings -- verified by probe, not taken from DECISIONS.md, which records a Tailscale mechanism that is not installed on this Mac.
- Its certificate is Synology's self-signed default and does not match the IP, so each device accepts it once. That is infrastructure; this lane surfaces the consequence and does not try to solve it.
- Whether to stay on the LAN address or move to something like Tailscale is your decision to make later. Storing references relative to the configured base is what keeps that decision free.
- A pasted URL from a different origin is left absolute rather than rewritten -- it is a deliberate external link.
- Most Setar material arrives through classes, so composing an item's files from its lessons covers the common case; an item with no lesson link needs a stored reference of its own, which is a separate schema change.

## Show me

On the phone, search your practice list for a gusheh using the Persian keyboard -- it is found, including when the keyboard gives you an Arabic kaf or yeh, and typing 'daramad' finds درآمد too. Open Repertoire and Lessons: both are already showing the instrument you are practising, not all three, and both still let you widen to everything in one tap.

Open a piece that came from a class. Its class video and score are listed right there on the item, and each opens on the NAS. Start a block on it and the same list is one tap away behind a closed disclosure -- a photo of the page shows inline while the timer keeps running, and the target signal still fires exactly as before.

Then add a new reference without typing a path: tap Browse, find the file in the NAS listing, copy its URL, paste it in, save. Change your NAS base URL to a different form of the same host and the reference still opens -- because what got stored was the path, not the address of one device's route to it.

