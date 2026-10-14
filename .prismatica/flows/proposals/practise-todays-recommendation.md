---
id: practise-todays-recommendation
proposalType: update
reason: "Close revises Status, Primary focus and Current effort in the block's one write, and every Start or Resume tap readies a fresh sound context."
proposedBy: agent
createdAt: "2026-10-14T12:00:00.000Z"
status: works
truth:
  goal: Practise the one thing the app suggests next and leave an honest record of
    how it went
  startsWhen: The musician opens Today, picks the instrument they are practising,
    and sees a single 'Practise now' card.
  needs: []
  steps:
    - actor: The musician
      action: Taps their instrument in the switcher at the top of Today.
      shows: "Everything below is scoped to that instrument: recommendation, class
        work, due reviews, pathway position."
      changes: The chosen instrument is remembered as the session instrument.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:51.362Z
        commit: e99a73606a47b5892b3b038fa782a76efcb5ab1e
    - actor: Practice Compass
      action: Scores every item of that instrument and shows the best one with a
        one-sentence reason.
      shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if
        you have time' suggestions.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:51.362Z
        commit: e99a73606a47b5892b3b038fa782a76efcb5ab1e
    - actor: "The musician"
      action: "Taps 'Start · 10 min'."
      shows: "The active block screen: item title, mode and focus chips, a running ring timer."
      changes: "A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-14T12:00:00.000Z
    - actor: "The musician"
      action: "Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed."
      shows: "The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'."
      changes: "Elapsed seconds accumulate only while the timer runs."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-14T12:00:00.000Z
    - actor: The musician
      action: Taps 'Finish'.
      shows: The close screen, with the minutes already filled in.
      changes: The clock is frozen first, so reflection time is not counted as practice.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:51.362Z
        commit: e99a73606a47b5892b3b038fa782a76efcb5ab1e
    - actor: "The musician"
      action: "Picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort' line (Change) — an engine-suggested status shows there pre-selected as the pending change."
      shows: "A preview of the next review date with the plain reason behind it, and a 'Why this date?' link; the date is decided from the item as practised, so revising the item never moves it."
      changes: "Nothing until Save; untouched fields are never written."
      assumes: []
      evidence:
        method: inferred
        at: 2026-10-14T12:00:00.000Z
    - actor: The musician
      action: Taps 'Save block'.
      shows: Back to Today (or to the running plan), with the item's stats and status
        updated.
      changes: A PracticeBlock is stored; the item's counters, status, saturation flag
        and spaced-repetition state advance; any open review for the item is
        completed and the next one is scheduled on the date that was shown.
      assumes: []
      evidence:
        method: manual
        at: 2026-10-06T21:39:51.362Z
        commit: e99a73606a47b5892b3b038fa782a76efcb5ab1e
  endsWith: "The session is recorded honestly: one block, one result, one next
    action — and the item knows when it should come back."
  variations:
    - name: Choose something else
      differs: From 'Choose something else to practise…' the Start screen takes
        instrument → item → mode/focus/duration, with a title-only quick create
        for something that does not exist yet.
      status: works
    - name: Start from an item or a stage
      differs: "'Start a block' on an item, or ▶ on a pathway stage row, opens the
        same block with defaults taken from the item's status and focus."
      status: works
    - name: Discard
      differs: "'Discard block' (during) or 'Discard without saving' (at close) throws
        the block away — nothing is logged and no schedule moves."
      status: works
    - name: Target reached
      differs: When elapsed reaches the block's target, the ring's silent saturation
        is replaced by a durable 'Target reached' state plus a growing overtime
        figure (elapsed minus target) — announced once, never once per render.
        The block does NOT auto-finish — practising past the target stays
        ordinary, and only Finish or Discard ends it. Whether the
        screen-wake-lock or the accompanying two-pulse sound and vibration —
        readied by a Start or Resume tap, played once per granted boundary claim
        and never queued to sound late — succeeds, fails or is unsupported never
        changes the elapsed time or the minutes eventually saved.
      status: works
    - name: Test practice sound
      differs: "Settings → Practice sound: 'Test practice sound' plays the same
        two-pulse cue on demand and says whether sound is ready, paused or off
        on this page."
      status: works
  rules:
    - Starting a block must stay under 30 seconds and closing one under 60
      seconds; a title is the only required field.
    - Practising is the only thing that completes a review and advances spaced
      repetition.
    - The review date shown before saving is exactly the date saved.
    - A recorded minute is never affected by whether the screen-wake-lock, sound
      or vibration succeeded — only the wall clock decides elapsed time.
  involves:
    - The musician
    - The recommendation engine
    - The spaced-repetition scheduler
---

Update proposed by change 20261014-give-works-real-plan-time-make-sound-and-d492; mechanics unchanged.
