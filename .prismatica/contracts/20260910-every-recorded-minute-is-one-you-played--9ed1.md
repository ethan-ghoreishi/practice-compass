---
id: 20260910-every-recorded-minute-is-one-you-played--9ed1
title: "Every recorded minute is one you played: honest close, sync-safe clocks,
  real practice totals"
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/16
intent: 20260910-every-recorded-minute-is-one-you-played--9ed1
tier: heavy
stage: build
baseline:
  commit: 0c6058e26f6c983ef137fb10ed28f03db70c5083
  branch: main
branch: change/20260910-every-recorded-minute-is-one-you-played--9ed1
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260910-every-recorded-minute-is-one-you-played--9ed1
builder: claude
planHash: 7ebf41bfd5fe15fe3f14fe2c8bab2ab724133188c82a81493bc2d404f2c0da31
allowedPaths:
  - AGENTS.md
  - CLAUDE.md
  - README.md
  - src/App.tsx
  - src/components/Layout.tsx
  - src/domain/blocks.test.ts
  - src/domain/blocks.ts
  - src/domain/index.ts
  - src/domain/practiceSession.test.ts
  - src/domain/practiceSession.ts
  - src/domain/scheduling.test.ts
  - src/domain/scheduling.ts
  - src/domain/selectors.test.ts
  - src/domain/selectors.ts
  - src/pages/ActiveBlock.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/Insights.tsx
  - src/pages/Today.tsx
  - src/store/backup.ts
  - src/store/githubSync.ts
  - src/store/useStore.ts
forbiddenPaths:
  - src/domain/types.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/sync.ts
  - src/store/syncEngine.ts
  - src/store/gitRemote.ts
  - src/domain/routines.ts
  - src/pages/RoutineRunner.tsx
  - src/components/useScreenAwake.ts
  - src/components/screenAwake.ts
  - src/domain/scoring.ts
  - src/domain/recommend.ts
  - src/domain/farsi.ts
  - src/domain/plan.ts
  - vite.config.ts
  - package.json
  - src/domain/practiceSignal.ts
  - src/domain/practiceSignal.test.ts
nonGoals:
  - No unfinished practice may be lost. An unfinished session -- ordinary or
    routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a
    database replacement the owner did not explicitly aim at it. Staleness may
    change the proposed minutes and the attention state and NOTHING else; it
    must never become an authority to discard practice, and no threshold may be
    wired to a destructive path.
  - "A deferred sync must never become a silent permanent outage OR a silent
    discard. It is retried on the blocking condition CLEARING -- covering finish
    and discard alike, not an incidental database write only one of them makes
    -- and while it persists it is visible: the sync notice says what it is
    waiting for, and a stale unfinished session is labelled on Today so it can
    be resolved."
  - No schema change of any kind. SCHEMA_VERSION stays 11, no migration is
    added, and no persisted shape changes -- src/domain/types.ts and
    src/domain/migrations.ts are forbidden so this is mechanical rather than a
    promise.
  - Practising (closing a block) remains the ONLY thing that completes a review
    and advances SM-2. This lane changes when a resultless close must NOT touch
    the schedule; it never adds a new way to complete one.
  - The SM-2 rungs themselves are not retuned. DEFAULT_SCHEDULING_PARAMS and its
    byte-identical-defaults snapshot test stay green. Whether repeated early
    practice should advance reps (review A3) is a separate lane and a separate
    owner decision.
  - "'Not now' still changes no schedule at all, and snooze (+2d) still moves
    the real date on both the review and the item."
  - Starting a block stays under 30 seconds and closing one under 60. Requiring
    a result adds no new field -- the six options are already on screen; it only
    makes a choice already present a required one, and 'Save without a result'
    remains one tap away.
  - No wake-lock or timer behaviour changes. shouldKeepAwake, nextSignal,
    acknowledgeThrough, sessionElapsedSeconds, runElapsedSeconds, locateClock,
    skipCurrentSegment and aggregateItemMinutes keep their current behaviour
    exactly; useScreenAwake.ts and screenAwake.ts are forbidden. No wake-lock or
    audio outcome may influence a recorded minute, and the new staleness
    predicate must not feed the awake decision.
  - Routine runs are not touched. segmentElapsed already clamps a segment to its
    authored duration, so a routine cannot fabricate minutes; routines.ts and
    RoutineRunner.tsx are forbidden, and finishRoutine still writes at most one
    block per distinct bound item with result not_logged.
  - "The sync model itself is unchanged: whole snapshots, three-way content-hash
    comparison, explicit two-button conflicts, both copies preserved.
    decideSync, syncEngine.ts and gitRemote.ts are forbidden. Nothing here
    introduces a timestamp into a sync decision."
  - The primary recommendation stays above the fold on a 390x844 phone. The
    totals line goes BELOW it on Today, never above; PlanCard and RoutinesCard
    keep their collapsed peer-doorway shape.
  - No gamification. Totals are neutral counts of minutes and blocks with no
    goal, streak, score, progress bar, celebration or judging colour.
  - Today stays scoped to one instrument, and the cross-instrument Overview
    stays a deliberate secondary choice.
  - Everything still works fully offline and local-first. A deferred sync is a
    distinct, visible waiting state -- never an error, never a silent no-op --
    and it never blocks practising.
  - practiceSignal.ts is not edited in this lane and is forbidden, so the
    wake-lock and boundary-announcement behaviour cannot change even by
    accident. The new staleness predicate lives in practiceSession.ts and must
    never be fed into shouldKeepAwake or nextSignal.
  - "Review A3 -- SM-2 advancing reps on every closed block rather than once per
    due date, so three sessions in one afternoon can push a review from 2 days
    to 15. Verified by reading scheduling.ts:160-176, genuinely high value, and
    deliberately deferred: it changes what r-practice-completes-reviews means
    and needs its own owner decision. src/domain/scoring.ts and the SM-2 rungs
    stay untouched here."
  - Review A5 -- dormant/'Resting' items still being scored and still eligible
    for the Maintenance card, with neglect making them MORE likely the longer
    they rest. One predicate in scoring.ts fixes it, but it is about what the
    app DISPLAYS, not what it RECORDS, so it does not belong on this lane's
    spine. scoring.ts and recommend.ts are forbidden.
  - Review A9 -- persianSearchMatch is written, tested and wired to nothing
    while both search boxes use toLowerCase().includes(). Highest value-per-line
    fix in the repo and an excellent standalone lane for browse-my-repertoire,
    but it shares no file and no invariant with this one.
  - Review A4 -- lesson-scoped commitments (assignedForLesson boolean to
    assignedLessonId). Needs SCHEMA_VERSION and a migration, therefore heavy
    tier under the repo's own tierRules. Preserved as a well-defined follow-on
    rather than widening this lane.
  - First-class NAS references on practice items (review B3). Also a schema
    bump. Worth pairing with A4 in one heavy lane so the ceremony is paid once
    -- while noting the counter-argument, that bundling unrelated migrations
    makes the sealed review harder to reason about and the rollback coarser.
    Note also that rendering a linked lesson's existing references on the item
    page would deliver much of the value with NO schema change at all, and
    should be tried first.
  - "All NAS browsing and in-app viewing (review B2/B4). Blocked behind a
    research question, not an implementation one: cspPlugin in vite.config.ts is
    apply:'build', so every NAS feature works on `npm run dev` and fails
    SILENTLY on GitHub Pages. connect-src blocks a directory fetch, frame-src
    'none' blocks any in-app PDF viewer including blob:, media-src blocks NAS
    video. Cheapest real steps, in order: a plain link opening the Go file
    server's own directory listing (zero code, already served per DECISIONS.md);
    a photo/image attachment shown during practice (already allowed by img-src
    blob:, zero CSP change); then a generated path index from a generalised
    scripts/scan-setar-classes.mjs, which needs no CSP change, no CORS and works
    offline. vite.config.ts is forbidden here so no CSP token can move by
    accident."
  - Review B5 -- the iPhone bottom bar staying displaced after keyboard
    dismissal. Device-specific and unsettleable from source. The one-line first
    attempt is lengthening useViewportGuard's 80ms settle debounce past the
    ~250-300ms iOS dismissal animation; FUTURE.md already records the fallback.
    Needs its own lane with manual:OWNER evidence.
  - Review A11 (an item can be made its own parent, and family metadata survives
    an instrument switch), A13 (a malformed attachment entry is skipped then
    destroyed by replaceAllBlobs), A14 (weekly insights and the Teacher Report
    mixing 'during this period' with 'right now'), A15 (Settings claiming
    'newest copy wins' when decideSync never reads a timestamp), A16 (Field
    gives form controls no accessible name), A17 (light-theme contrast below
    AA).
  - Adding jsdom, fake-indexeddb, Playwright, or any browser/component test
    harness. vitest stays environment:'node'. If a decision feels untestable,
    push it into a pure domain function -- that is what this plan already does.
    Enabling .prismatica journeys checks is its own lane.
  - Filling .prismatica/product-map.md, and writing the missing Flows for
    running a routine and for hands-free practice.
  - "Splitting a block's minutes across a midnight or week boundary. Considered
    and rejected on evidence, not omitted: durationMinutes is the owner's
    attested figure and this lane deliberately makes it diverge from wall clock,
    and endedAt is optional and absent on routine blocks (factories.ts:168,
    applyRoutineRun passes none). Apportioning would overrule the owner's own
    correction and apply unevenly across block types. Adding an endedAt backfill
    purely for theoretical precision would need a schema change and is
    explicitly not worth it."
  - Guarding reset-to-demo and erase-everything behind the unfinished-session
    check. Those actions are AIMED at destroying the data and already confirm
    first, so refusing them would be obstruction rather than safety. They are
    still fixed here for A8 -- they must leave no ephemeral state pointing at a
    database that no longer exists. Mentioning a running block in their confirm
    text is a nice-to-have, not required by this lane.
acceptanceChecks:
  - id: ac-1
    description: "A6 root cause, and the discriminating pair that defines it: a
      close carrying NO result leaves the item's next review date exactly as it
      was, while a close that genuinely DECLINES a review still clears it. Both
      halves in one test, because the whole bug is that the code cannot
      currently tell those two states apart."
    test: keeps the item's review date when no result was chosen and still clears it
      when a review is declined
  - id: ac-2
    description: "A6's second half, folded into the same decision: closing without a
      result leaves the item's open Review row OPEN, while a genuine decline
      still completes it. Today closeSession completes the row separately and
      unconditionally, which is exactly how the row and the date came apart."
    test: leaves an open review row open when no result was chosen and still
      completes it on a genuine decline
  - id: ac-3
    description: "THE CORE SAFETY INVARIANT, and the check the owner asked for by
      name: a whole-database replacement is refused while ANY unfinished
      practice session exists -- and the test proves the three ways an earlier
      design would have leaked. A RUNNING session blocks it, a PAUSED session
      blocks it just as hard, and a STALE session blocks it too. Staleness is
      not, and can never become, permission to destroy practice."
    test: refuses a replacement for a running, a paused, and a stale unfinished
      session alike
  - id: ac-4
    description: "The discriminating opposite of the check above, so the guard
      cannot be satisfied by simply refusing everything: with no unfinished
      session at all, a replacement proceeds normally."
    test: allows a replacement when no unfinished practice session exists
  - id: ac-5
    description: Staleness is confined to non-destructive outcomes. The predicate
      separates ordinary overtime (LIVE -- practising past the target is normal)
      from a long-abandoned clock (STALE), and the stale verdict feeds only the
      proposed minutes and the attention state. Proved by asserting that the
      replacement decision is identical for a live and a stale session.
    test: reaches the same replacement decision for a stale session as for a live one
  - id: ac-6
    description: "A2's consequence for recorded minutes, both directions: an
      abandoned block proposes its own target rather than the fabricated
      wall-clock figure, while a genuinely overrun block still proposes its real
      elapsed minutes."
    test: proposes the target for an abandoned block and the real elapsed minutes
      for an overrun one
  - id: ac-7
    description: Deferred automatic sync really resumes, after EVERY supported
      resolution path -- not just the one that happens to write to the database.
      A deferral pending, the retry fires when the last unfinished session
      clears, whether it was FINISHED (which writes a block) or DISCARDED (which
      writes nothing at all and bumps no revision). The discard half is the one
      the earlier design silently failed.
    test: resumes a deferred sync when the session clears, whether it was finished
      or discarded
  - id: ac-8
    description: Automatic and deliberate replacement are answered differently, and
      neither is silent. Automatic sync reports a distinct DEFERRED state rather
      than an error or a success, while a deliberate Import, Restore archive or
      Keep remote returns an explicit refusal naming the unfinished session --
      never a silent no-op and never a silent discard.
    test: defers automatic sync but returns an explicit refusal for a deliberate
      replacement
  - id: ac-9
    description: "A8's DECISION, discriminating what must be cleared from what must
      survive: installing a new database clears the running plan and today's
      dismissed reviews and drops a session instrument the new database lacks,
      while KEEPING one it still has and keeping the cross-instrument 'all'
      overview. Scope note, stated honestly: this proves the pure transform, NOT
      that each store action calls it -- the Node environment cannot import
      useStore.ts, which pulls in Dexie via ./idb. The WIRING is protected
      structurally instead: the transform returns the new `db` TOGETHER WITH the
      ephemeral patch in one object, so importDB, resetDemo and clearAll cannot
      install a database without it, and the manual:OWNER check exercises all
      three on device."
    test: clears the running plan and drops a session instrument the new database
      lacks, keeping one it has
  - id: ac-10
    description: "B1's calendar semantics, against the exact trap that makes a
      rolling window wrong: a block started late yesterday is NOT part of
      today's total even though it falls inside the last 24 hours, and a block
      started just after midnight today IS."
    test: counts by calendar day, so a block from late yesterday is not part of
      today's total
  - id: ac-11
    description: "The midnight-crossing rule, pinned rather than assumed: a block
      begun at 23:40 counts WHOLE against the day it began, with none of its
      minutes apportioned into the following day -- because durationMinutes is
      the owner's attested figure and routine blocks carry no endedAt to split
      by. The same rule decides the Monday boundary, so a session begun Sunday
      23:30 belongs to the week that is ending."
    test: counts a midnight-crossing block whole against the day it began, including
      across the Monday boundary
  - id: ac-12
    description: "B1's week boundary: the week starts Monday 00:00 local, so
      Sunday's practice belongs to the week that is ending and Monday's to the
      one beginning."
    test: starts the week on Monday so Sunday's practice belongs to the week that is
      ending
  - id: ac-13
    description: "A10: instrument-balance percentages sum to 100 when the block list
      contains practice for an instrument that is not in the supplied instrument
      list -- the exact case Today produces by passing only active instruments
      with all blocks."
    test: percentages sum to 100 when blocks exist for an instrument not in the
      supplied list
  - id: ac-14
    description: "A7's selection rule: the most recent NON-EMPTY next action is
      returned, so a later block that recorded none does not blank out a
      decision that still stands, and nothing is returned when none was ever
      written."
    test: returns the most recent non-empty next action and nothing when none was
      ever written
  - id: ac-15
    description: "End to end in the running app, on the owner's own MacBook and
      iPhone. (a) Practise an item, tap Finish, try to save with no result --
      Save is unavailable; use 'Save without a result' and confirm on the item
      that its review date and its due review are UNCHANGED. (b) Practise it
      again and confirm last time's next action is shown before you start
      playing. (c) Leave a block running overnight, reopen, tap Finish -- the
      proposed minutes are the target, with a plain line saying why, and the
      block is STILL THERE to be resolved rather than having been discarded. (d)
      With a block running on the phone, push a change from the MacBook and
      reopen the phone: it does not replace its data, the block survives, and
      the sync notice says it is waiting. PAUSE the block and confirm it is
      still protected. Discard it and confirm sync completes on its own within a
      few seconds with no further tap. (e) With an unfinished block present, try
      Import and Restore archive from Settings: each refuses with a message
      naming the block, and the block is untouched. (f) The wiring the Node
      tests cannot reach: with a Session Plan running and an instrument
      selected, use Settings to Import a backup, then Reset to demo data, then
      Erase all data -- after EACH, confirm no stale plan is still running and
      the app does not show a session instrument the new database no longer
      contains. (g) Confirm Today's totals line sits BELOW the 'Practise now'
      card and that card is still fully visible without scrolling on the
      iPhone."
    test: manual:OWNER
docsDelta:
  - CLAUDE.md
  - AGENTS.md
  - README.md
createdAt: 2026-09-10T10:59:25.623Z
amendments: []
---

# Every recorded minute is one you played: honest close, sync-safe clocks, real practice totals

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/16
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 0c6058e26f6c983ef137fb10ed28f03db70c5083 on main _(never re-baselined)_
- **Intent:** 20260910-every-recorded-minute-is-one-you-played--9ed1

## You may only change

- AGENTS.md
- CLAUDE.md
- README.md
- src/App.tsx
- src/components/Layout.tsx
- src/domain/blocks.test.ts
- src/domain/blocks.ts
- src/domain/index.ts
- src/domain/practiceSession.test.ts
- src/domain/practiceSession.ts
- src/domain/scheduling.test.ts
- src/domain/scheduling.ts
- src/domain/selectors.test.ts
- src/domain/selectors.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/Insights.tsx
- src/pages/Today.tsx
- src/store/backup.ts
- src/store/githubSync.ts
- src/store/useStore.ts

## Never touch

- src/domain/types.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/sync.ts
- src/store/syncEngine.ts
- src/store/gitRemote.ts
- src/domain/routines.ts
- src/pages/RoutineRunner.tsx
- src/components/useScreenAwake.ts
- src/components/screenAwake.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/farsi.ts
- src/domain/plan.ts
- vite.config.ts
- package.json
- src/domain/practiceSignal.ts
- src/domain/practiceSignal.test.ts

## Non-goals

- No unfinished practice may be lost. An unfinished session -- ordinary or routine, RUNNING OR PAUSED, fresh or stale -- is never destroyed by a database replacement the owner did not explicitly aim at it. Staleness may change the proposed minutes and the attention state and NOTHING else; it must never become an authority to discard practice, and no threshold may be wired to a destructive path.
- A deferred sync must never become a silent permanent outage OR a silent discard. It is retried on the blocking condition CLEARING -- covering finish and discard alike, not an incidental database write only one of them makes -- and while it persists it is visible: the sync notice says what it is waiting for, and a stale unfinished session is labelled on Today so it can be resolved.
- No schema change of any kind. SCHEMA_VERSION stays 11, no migration is added, and no persisted shape changes -- src/domain/types.ts and src/domain/migrations.ts are forbidden so this is mechanical rather than a promise.
- Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2. This lane changes when a resultless close must NOT touch the schedule; it never adds a new way to complete one.
- The SM-2 rungs themselves are not retuned. DEFAULT_SCHEDULING_PARAMS and its byte-identical-defaults snapshot test stay green. Whether repeated early practice should advance reps (review A3) is a separate lane and a separate owner decision.
- 'Not now' still changes no schedule at all, and snooze (+2d) still moves the real date on both the review and the item.
- Starting a block stays under 30 seconds and closing one under 60. Requiring a result adds no new field -- the six options are already on screen; it only makes a choice already present a required one, and 'Save without a result' remains one tap away.
- No wake-lock or timer behaviour changes. shouldKeepAwake, nextSignal, acknowledgeThrough, sessionElapsedSeconds, runElapsedSeconds, locateClock, skipCurrentSegment and aggregateItemMinutes keep their current behaviour exactly; useScreenAwake.ts and screenAwake.ts are forbidden. No wake-lock or audio outcome may influence a recorded minute, and the new staleness predicate must not feed the awake decision.
- Routine runs are not touched. segmentElapsed already clamps a segment to its authored duration, so a routine cannot fabricate minutes; routines.ts and RoutineRunner.tsx are forbidden, and finishRoutine still writes at most one block per distinct bound item with result not_logged.
- The sync model itself is unchanged: whole snapshots, three-way content-hash comparison, explicit two-button conflicts, both copies preserved. decideSync, syncEngine.ts and gitRemote.ts are forbidden. Nothing here introduces a timestamp into a sync decision.
- The primary recommendation stays above the fold on a 390x844 phone. The totals line goes BELOW it on Today, never above; PlanCard and RoutinesCard keep their collapsed peer-doorway shape.
- No gamification. Totals are neutral counts of minutes and blocks with no goal, streak, score, progress bar, celebration or judging colour.
- Today stays scoped to one instrument, and the cross-instrument Overview stays a deliberate secondary choice.
- Everything still works fully offline and local-first. A deferred sync is a distinct, visible waiting state -- never an error, never a silent no-op -- and it never blocks practising.
- practiceSignal.ts is not edited in this lane and is forbidden, so the wake-lock and boundary-announcement behaviour cannot change even by accident. The new staleness predicate lives in practiceSession.ts and must never be fed into shouldKeepAwake or nextSignal.
- Review A3 -- SM-2 advancing reps on every closed block rather than once per due date, so three sessions in one afternoon can push a review from 2 days to 15. Verified by reading scheduling.ts:160-176, genuinely high value, and deliberately deferred: it changes what r-practice-completes-reviews means and needs its own owner decision. src/domain/scoring.ts and the SM-2 rungs stay untouched here.
- Review A5 -- dormant/'Resting' items still being scored and still eligible for the Maintenance card, with neglect making them MORE likely the longer they rest. One predicate in scoring.ts fixes it, but it is about what the app DISPLAYS, not what it RECORDS, so it does not belong on this lane's spine. scoring.ts and recommend.ts are forbidden.
- Review A9 -- persianSearchMatch is written, tested and wired to nothing while both search boxes use toLowerCase().includes(). Highest value-per-line fix in the repo and an excellent standalone lane for browse-my-repertoire, but it shares no file and no invariant with this one.
- Review A4 -- lesson-scoped commitments (assignedForLesson boolean to assignedLessonId). Needs SCHEMA_VERSION and a migration, therefore heavy tier under the repo's own tierRules. Preserved as a well-defined follow-on rather than widening this lane.
- First-class NAS references on practice items (review B3). Also a schema bump. Worth pairing with A4 in one heavy lane so the ceremony is paid once -- while noting the counter-argument, that bundling unrelated migrations makes the sealed review harder to reason about and the rollback coarser. Note also that rendering a linked lesson's existing references on the item page would deliver much of the value with NO schema change at all, and should be tried first.
- All NAS browsing and in-app viewing (review B2/B4). Blocked behind a research question, not an implementation one: cspPlugin in vite.config.ts is apply:'build', so every NAS feature works on `npm run dev` and fails SILENTLY on GitHub Pages. connect-src blocks a directory fetch, frame-src 'none' blocks any in-app PDF viewer including blob:, media-src blocks NAS video. Cheapest real steps, in order: a plain link opening the Go file server's own directory listing (zero code, already served per DECISIONS.md); a photo/image attachment shown during practice (already allowed by img-src blob:, zero CSP change); then a generated path index from a generalised scripts/scan-setar-classes.mjs, which needs no CSP change, no CORS and works offline. vite.config.ts is forbidden here so no CSP token can move by accident.
- Review B5 -- the iPhone bottom bar staying displaced after keyboard dismissal. Device-specific and unsettleable from source. The one-line first attempt is lengthening useViewportGuard's 80ms settle debounce past the ~250-300ms iOS dismissal animation; FUTURE.md already records the fallback. Needs its own lane with manual:OWNER evidence.
- Review A11 (an item can be made its own parent, and family metadata survives an instrument switch), A13 (a malformed attachment entry is skipped then destroyed by replaceAllBlobs), A14 (weekly insights and the Teacher Report mixing 'during this period' with 'right now'), A15 (Settings claiming 'newest copy wins' when decideSync never reads a timestamp), A16 (Field gives form controls no accessible name), A17 (light-theme contrast below AA).
- Adding jsdom, fake-indexeddb, Playwright, or any browser/component test harness. vitest stays environment:'node'. If a decision feels untestable, push it into a pure domain function -- that is what this plan already does. Enabling .prismatica journeys checks is its own lane.
- Filling .prismatica/product-map.md, and writing the missing Flows for running a routine and for hands-free practice.
- Splitting a block's minutes across a midnight or week boundary. Considered and rejected on evidence, not omitted: durationMinutes is the owner's attested figure and this lane deliberately makes it diverge from wall clock, and endedAt is optional and absent on routine blocks (factories.ts:168, applyRoutineRun passes none). Apportioning would overrule the owner's own correction and apply unevenly across block types. Adding an endedAt backfill purely for theoretical precision would need a schema change and is explicitly not worth it.
- Guarding reset-to-demo and erase-everything behind the unfinished-session check. Those actions are AIMED at destroying the data and already confirm first, so refusing them would be obstruction rather than safety. They are still fixed here for A8 -- they must leave no ephemeral state pointing at a database that no longer exists. Mentioning a running block in their confirm text is a nice-to-have, not required by this lane.

## Acceptance checks (definition of done)

- [ ] **ac-1** — A6 root cause, and the discriminating pair that defines it: a close carrying NO result leaves the item's next review date exactly as it was, while a close that genuinely DECLINES a review still clears it. Both halves in one test, because the whole bug is that the code cannot currently tell those two states apart. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — A6's second half, folded into the same decision: closing without a result leaves the item's open Review row OPEN, while a genuine decline still completes it. Today closeSession completes the row separately and unconditionally, which is exactly how the row and the date came apart. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THE CORE SAFETY INVARIANT, and the check the owner asked for by name: a whole-database replacement is refused while ANY unfinished practice session exists -- and the test proves the three ways an earlier design would have leaked. A RUNNING session blocks it, a PAUSED session blocks it just as hard, and a STALE session blocks it too. Staleness is not, and can never become, permission to destroy practice. _(proof: refuses a replacement for a running, a paused, and a stale unfinished session alike)_
- [ ] **ac-4** — The discriminating opposite of the check above, so the guard cannot be satisfied by simply refusing everything: with no unfinished session at all, a replacement proceeds normally. _(proof: allows a replacement when no unfinished practice session exists)_
- [ ] **ac-5** — Staleness is confined to non-destructive outcomes. The predicate separates ordinary overtime (LIVE -- practising past the target is normal) from a long-abandoned clock (STALE), and the stale verdict feeds only the proposed minutes and the attention state. Proved by asserting that the replacement decision is identical for a live and a stale session. _(proof: reaches the same replacement decision for a stale session as for a live one)_
- [ ] **ac-6** — A2's consequence for recorded minutes, both directions: an abandoned block proposes its own target rather than the fabricated wall-clock figure, while a genuinely overrun block still proposes its real elapsed minutes. _(proof: proposes the target for an abandoned block and the real elapsed minutes for an overrun one)_
- [ ] **ac-7** — Deferred automatic sync really resumes, after EVERY supported resolution path -- not just the one that happens to write to the database. A deferral pending, the retry fires when the last unfinished session clears, whether it was FINISHED (which writes a block) or DISCARDED (which writes nothing at all and bumps no revision). The discard half is the one the earlier design silently failed. _(proof: resumes a deferred sync when the session clears, whether it was finished or discarded)_
- [ ] **ac-8** — Automatic and deliberate replacement are answered differently, and neither is silent. Automatic sync reports a distinct DEFERRED state rather than an error or a success, while a deliberate Import, Restore archive or Keep remote returns an explicit refusal naming the unfinished session -- never a silent no-op and never a silent discard. _(proof: defers automatic sync but returns an explicit refusal for a deliberate replacement)_
- [ ] **ac-9** — A8's DECISION, discriminating what must be cleared from what must survive: installing a new database clears the running plan and today's dismissed reviews and drops a session instrument the new database lacks, while KEEPING one it still has and keeping the cross-instrument 'all' overview. Scope note, stated honestly: this proves the pure transform, NOT that each store action calls it -- the Node environment cannot import useStore.ts, which pulls in Dexie via ./idb. The WIRING is protected structurally instead: the transform returns the new `db` TOGETHER WITH the ephemeral patch in one object, so importDB, resetDemo and clearAll cannot install a database without it, and the manual:OWNER check exercises all three on device. _(proof: clears the running plan and drops a session instrument the new database lacks, keeping one it has)_
- [ ] **ac-10** — B1's calendar semantics, against the exact trap that makes a rolling window wrong: a block started late yesterday is NOT part of today's total even though it falls inside the last 24 hours, and a block started just after midnight today IS. _(proof: counts by calendar day, so a block from late yesterday is not part of today's total)_
- [ ] **ac-11** — The midnight-crossing rule, pinned rather than assumed: a block begun at 23:40 counts WHOLE against the day it began, with none of its minutes apportioned into the following day -- because durationMinutes is the owner's attested figure and routine blocks carry no endedAt to split by. The same rule decides the Monday boundary, so a session begun Sunday 23:30 belongs to the week that is ending. _(proof: counts a midnight-crossing block whole against the day it began, including across the Monday boundary)_
- [ ] **ac-12** — B1's week boundary: the week starts Monday 00:00 local, so Sunday's practice belongs to the week that is ending and Monday's to the one beginning. _(proof: starts the week on Monday so Sunday's practice belongs to the week that is ending)_
- [ ] **ac-13** — A10: instrument-balance percentages sum to 100 when the block list contains practice for an instrument that is not in the supplied instrument list -- the exact case Today produces by passing only active instruments with all blocks. _(proof: percentages sum to 100 when blocks exist for an instrument not in the supplied list)_
- [ ] **ac-14** — A7's selection rule: the most recent NON-EMPTY next action is returned, so a later block that recorded none does not blank out a decision that still stands, and nothing is returned when none was ever written. _(proof: returns the most recent non-empty next action and nothing when none was ever written)_
- [ ] **ac-15** — End to end in the running app, on the owner's own MacBook and iPhone. (a) Practise an item, tap Finish, try to save with no result -- Save is unavailable; use 'Save without a result' and confirm on the item that its review date and its due review are UNCHANGED. (b) Practise it again and confirm last time's next action is shown before you start playing. (c) Leave a block running overnight, reopen, tap Finish -- the proposed minutes are the target, with a plain line saying why, and the block is STILL THERE to be resolved rather than having been discarded. (d) With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, the block survives, and the sync notice says it is waiting. PAUSE the block and confirm it is still protected. Discard it and confirm sync completes on its own within a few seconds with no further tap. (e) With an unfinished block present, try Import and Restore archive from Settings: each refuses with a message naming the block, and the block is untouched. (f) The wiring the Node tests cannot reach: with a Session Plan running and an instrument selected, use Settings to Import a backup, then Reset to demo data, then Erase all data -- after EACH, confirm no stale plan is still running and the app does not show a session instrument the new database no longer contains. (g) Confirm Today's totals line sits BELOW the 'Practise now' card and that card is still fully visible without scrolling on the iPhone. _(proof: manual:OWNER)_

## Docs to update

- CLAUDE.md
- AGENTS.md
- README.md

## Amendments

_none_

