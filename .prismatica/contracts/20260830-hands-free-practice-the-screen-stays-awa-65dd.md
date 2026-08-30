---
id: 20260830-hands-free-practice-the-screen-stays-awa-65dd
title: "Hands-free practice: the screen stays awake while a clock runs, and the
  app announces the intended end"
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/7
intent: 20260830-hands-free-practice-the-screen-stays-awa-65dd
tier: heavy
stage: review
baseline:
  commit: cad4d3bc8b45110733f189d9b280b8c8a39587b2
  branch: main
branch: change/20260830-hands-free-practice-the-screen-stays-awa-65dd
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260830-hands-free-practice-the-screen-stays-awa-65dd
builder: claude
planHash: 19700aa64d2719cfb69731eff2b47baf1c7cce04a263d12668d51f8a519093b1
allowedPaths:
  - src/domain/practiceSignal.ts
  - src/domain/practiceSignal.test.ts
  - src/domain/routines.ts
  - src/domain/routines.test.ts
  - src/domain/index.ts
  - src/components/screenAwake.ts
  - src/components/screenAwake.test.ts
  - src/components/useScreenAwake.ts
  - src/pages/ActiveBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/store/useStore.ts
  - src/styles/global.css
  - CLAUDE.md
  - AGENTS.md
forbiddenPaths:
  - "Any change in src/styles/global.css to the selectors .grid-2, .option,
    .options, .input, .textarea, .select, or to the `@media (max-width: 340px)`
    block. Those are the deferred layout lane's territory; the ONLY CSS
    permitted here is new rules for the target-reached / overtime state."
nonGoals:
  - Elapsed-time accounting. `sessionElapsedSeconds`, `runElapsedSeconds`,
    `locateClock`, `skipCurrentSegment`, `segmentElapsed` and
    `aggregateItemMinutes` keep their current behaviour byte-for-byte.
    Acquiring, failing to acquire, holding, or releasing a wake lock must never
    add or remove a single recorded second, and the announcement must never
    write to `accumulatedSeconds` or `runningSince`.
  - An ordinary block never auto-finishes at its target. Reaching the target
    announces and starts counting overtime; only the user's Finish or Discard
    ends a block. Practising past the target stays ordinary, unremarked-upon
    behaviour.
  - "A routine still records at most one PracticeBlock per distinct bound item
    per run, with `result: 'not_logged'`, completing no review and advancing no
    SM-2 state."
  - The single-active-practice-clock invariant and every one of its guards —
    `startSession`/`resumeSession` refusing while `activeRoutine` is set,
    `startRoutineRun`/`resumeRoutineRun` refusing while `active` is set, the
    persist `merge` freezing a legacy dual pair, and the redirects in
    ActiveBlock/RoutineRunner/Today/StageDetail — stay exactly as they are. A
    frozen (non-running) clock holds no wake lock and announces nothing.
  - "`SCHEMA_VERSION` stays 11 and `PracticeDB` is not touched. The marker lives
    only on the store's ephemeral `active`/`activeRoutine`; it must never reach
    IndexedDB's `kv` database, a sync snapshot, or an export/backup."
  - No gamification of any kind. The announcement is a neutral state change and
    a number — never a streak, score, badge, celebration, or congratulatory
    copy.
  - "Domain purity: `src/domain/practiceSignal.ts` stays free of React, free of
    side effects, and free of any `navigator`/`window`/`document` reference.
    Every platform call lives in the component-layer glue."
  - "The app shell stays a fixed-height flex column in which only `<main>`
    scrolls, with nothing `position: fixed/sticky`. Any CSS added for the
    target-reached state must not introduce a fixed or sticky element."
  - "The existing layout rules in src/styles/global.css are untouched —
    specifically .grid-2, .option, .options, .input/.textarea/.select and the
    `@media (max-width: 340px)` stacking fallback. This lane adds new rules for
    the target-reached and overtime state and changes no existing selector."
  - The routine segment-boundary announcement is never a single-render flash. It
    persists for a defined presentation interval or is carried by durable
    on-screen state, and the ordinary block's target-reached and overtime state
    stays durable for as long as the block runs.
  - "THE TWO SCREENSHOT LAYOUT BUGS ARE DEFERRED, NOT MISSED, and are the
    recommended next lane: (a) CloseBlock's review-type pills overlapping the
    Next review date input, and (b) the bottom nav bar riding up after the first
    data entry and staying stuck there. Both have been diagnosed and the owner
    holds the diagnosis; neither belongs in this lane, because they are a layout
    invariant rather than a timer one. Do not attempt either here, and do not
    touch the CSS selectors named in `scope.forbid` even incidentally."
  - The practice-time totals gap (how long did I practise today / this week /
    overall) is confirmed real — only per-item `item.totalMinutes` exists, and
    there is no app-wide total — but it is a separate product/analytics lane
    over derived block history and must not be attached here.
  - "`persianSearchMatch` is defined and tested in `src/domain/farsi.ts` but has
    zero call sites outside its own test; wiring it into search stays out of
    this lane."
  - "The stale frozen `now`: ten pages compute `const now = useMemo(() => new
    Date(), [])` at mount (Today.tsx:53, CloseBlock.tsx:36, Insights.tsx:17,
    ItemDetail.tsx:65, Lessons.tsx:39 and :331, Repertoire.tsx:93 and :426,
    SessionPlan.tsx:41, TeacherReport.tsx:16). This is Review §3.4 and is
    genuinely outstanding, but it is a separate freshness invariant. This lane
    must not start refreshing `now` anywhere."
  - No background or push notifications, no Notification permission prompt, and
    no service-worker involvement in the announcement. The signal exists only
    while a practice screen is mounted and visible; building a background alarm
    is a different capability with different consent implications.
  - No change to `src/domain/plan.ts`, `src/domain/scoring.ts`,
    `src/domain/scheduling.ts` or `src/domain/blocks.ts`. Do not retune
    `isSaturated`, priority scoring, or any SM-2 constant.
  - No new npm dependency, no audio or media asset file, and no change to the
    PWA manifest or service-worker configuration.
  - Do not seed, author, or alter any Setar/Tar/Guitar routine or catalogue
    content.
  - Do not restructure the app shell, the nav bar, or `useViewportGuard` while
    adding the target-reached CSS.
  - Do not absorb any other finding from the 27 Aug Review or the 28 Aug Build
    Advisory — specifically not §2.1 class-work fallback, §2.2 attachment-blob
    feedback, §3.1 touch targets, §4.1 the duplicated CLAUDE.md/AGENTS.md pair
    (which stay byte-identical apart from line 1 and must both be edited here,
    but are not otherwise reorganised), §4.3 dead surface, §4.5 Farsi-aware
    sorting, Advisory §1 NAS folder/index workflow, Advisory §2 lesson-derived
    materials, or Advisory §4 the strand/category model.
  - Do not weaken the production CSP, the service worker, or any production
    security setting in order to make device testing easier, and do not add an
    HTTPS dev dependency to the shipped build. The secure-context route for
    testing is an environment the owner provides, not a code change in this
    lane.
  - The secure-context testing route is an environment the Builder establishes
    and documents for the owner — not a shipped feature. Do not add an HTTPS dev
    dependency to the production build, do not weaken the CSP or service worker,
    and do not repurpose `scripts/deploy-nas.sh` (plain rsync, no TLS) into a
    security-relevant path.
  - "Desired rule (not yet truth): While a practice clock is genuinely running
    and on screen, the app asks the device to keep the display awake and
    announces the intended end exactly once — and whether that succeeds, fails
    or is unsupported never changes a single recorded minute."
acceptanceChecks:
  - id: ac-1
    description: A clock that jumps across several segment boundaries at once (a
      backgrounded or locked phone waking up) announces ONCE, not once per
      boundary crossed. This is the counterexample that fails a per-tick
      implementation.
    test: announces once when the clock jumps across several boundaries at once
  - id: ac-2
    description: That same jump advances the marker to the number of boundaries
      ACTUALLY passed, not by one — so the next call does not re-announce the
      boundaries it skipped over.
    test: advances the marker to the boundary actually reached, not by one
  - id: ac-3
    description: An ordinary block's single target boundary announces exactly once;
      every later call at or beyond the target announces nothing. Fails if the
      implementation re-derives 'past target' each render instead of
      remembering.
    test: announces an ordinary block target exactly once and never again
  - id: ac-4
    description: Pausing across the target and resuming does not re-announce,
      because the marker persists rather than being rebuilt from the running
      state.
    test: does not announce again after pausing across the target and resuming
  - id: ac-5
    description: An absent marker (a session persisted before this change) reads as
      nothing announced yet, rather than throwing or silently swallowing a real
      boundary.
    test: treats an absent marker as nothing announced yet
  - id: ac-6
    description: Nothing is announced while elapsed has not yet reached the first boundary.
    test: announces nothing before the first boundary is reached
  - id: ac-7
    description: Once every boundary has been announced, further calls stay silent
      no matter how far elapsed runs past the end — an overrunning routine never
      announces repeatedly.
    test: stays silent once every boundary has been announced
  - id: ac-8
    description: The last boundary is reported as final and an intermediate one is
      not, so routine completion and a mere segment change are distinguishable
      by the caller.
    test: reports the final boundary distinctly from an intermediate one
  - id: ac-9
    description: A deliberate Skip advances the marker WITHOUT announcing, so the
      user is never told about a segment they chose to end themselves. Fails if
      skip routes through the announcing path.
    test: advances the marker without announcing when a segment is skipped
  - id: ac-10
    description: After a skip has clamped the current segment onto the elapsed
      value, the very next signal check stays silent — the concrete regression
      the acknowledge path exists to prevent.
    test: stays silent on the boundary a skip has just clamped into place
  - id: ac-11
    description: The announcement boundaries are the same numbers locateClock
      segments by, for the same run — including after a skip has clamped a
      segment. Fails if a second cumulative sum is computed independently and
      drifts.
    test: exposes the same segment boundaries the clock advances on
  - id: ac-12
    description: The screen is kept awake only while a clock is genuinely running
      AND its screen is visible.
    test: keeps the screen awake only while a clock is running and visible
  - id: ac-13
    description: A paused clock releases the screen — pausing to talk to a teacher
      lets the phone sleep normally.
    test: does not keep the screen awake while the clock is paused
  - id: ac-14
    description: A hidden document keeps nothing, so a backgrounded tab never holds a lock.
    test: does not keep the screen awake while the document is hidden
  - id: ac-15
    description: With no clock at all — including a frozen, non-running clock left
      by a legacy dual-clock hydration — nothing is held.
    test: does not keep the screen awake when no clock is running
  - id: ac-16
    description: The existing suite still passes in full — in particular every
      routines, scheduling, plan and migrations test — proving elapsed
      accounting, one-block-per-item aggregation and the single-clock guards are
      untouched. 267 tests pass at HEAD; the count must only grow.
    test: aggregates a repeated segment into one block per item, not one per segment
  - id: ac-17
    description: A routine that repeats one item four times still leaves that item
      unsaturated — proof this lane did not disturb block creation or the
      scoring family while adding the announcement.
    test: leaves an item unsaturated after a routine that repeats it four times
  - id: ac-18
    description: "OWNER DEVICE CHECK — RUN THIS FIRST, BEFORE ANY OTHER DEVICE
      CHECK. The Builder must already have handed you a runnable procedure
      naming (a) the secure-context mechanism, (b) the exact steps to expose
      this lane's build to the iPhone, (c) the exact HTTPS URL, and (d) exactly
      how to read the two values below on the phone. Note there is no
      branch-preview deployment in this repo (deploy.yml runs on main only), so
      this route has to be established, not looked up. Open that URL on the
      iPhone and confirm `window.isSecureContext === true` and `'wakeLock' in
      navigator` is true. If either is false, STOP: the environment cannot
      exercise this lane, every remaining wake-lock device check is
      ENVIRONMENT-BLOCKED rather than failed, and device acceptance may not be
      recorded as complete."
    test: manual:OWNER
  - id: ac-19
    description: "OWNER DEVICE CHECK (iPhone, installed PWA). Start a block at the
      shortest REAL selectable target — 5 minutes, the minimum in
      DURATION_PRESETS; do not add a 1-minute option for testing — put the phone
      face-up on the music stand and DO NOT TOUCH IT. After 5.5 minutes confirm:
      (a) the display never dimmed or locked; (b) the screen shows the
      target-reached state with an overtime figure counting up; (c) the block
      did NOT auto-finish. Record whether any sound was heard."
    test: manual:OWNER
  - id: ac-20
    description: OWNER DEVICE CHECK (iPhone, installed PWA). Start a routine whose
      first two segments are 1 minute each, put the phone down and DO NOT TOUCH
      IT. Confirm the display stays on and the arrival at segment 2 is visibly
      announced without any interaction. Record whether any sound or vibration
      occurred.
    test: manual:OWNER
  - id: ac-21
    description: OWNER DEVICE CHECK (iPhone). Mid-block, tap Pause and put the phone
      down for 2 minutes. Confirm the display is allowed to sleep normally, then
      wake it and confirm the elapsed time did NOT advance during the pause.
    test: manual:OWNER
  - id: ac-22
    description: OWNER DEVICE CHECK (iPhone). Mid-block, switch to another app for
      60 seconds, then return. Confirm the display stays awake again on return
      (the spec-mandated release-on-hidden is reacquired), and that elapsed
      reflects the full real wall-clock interval including the time away.
    test: manual:OWNER
  - id: ac-23
    description: OWNER DEVICE CHECK (leak check, iPhone). From a running block,
      exercise each exit in turn — Finish then Save, Finish then Discard,
      Discard block, and a nav-bar tap away — and after each confirm the phone
      sleeps normally on Today within its usual auto-lock interval.
    test: manual:OWNER
  - id: ac-24
    description: OWNER DEVICE CHECK (graceful degradation). Open the app in a
      browser without Screen Wake Lock support, or with the lock denied (for
      example on low-power mode), and run a 5-minute block (the shortest real
      preset). Confirm the timer runs normally, the target-reached state and
      overtime still appear, no error is shown, and the saved minutes are
      correct.
    test: manual:OWNER
  - id: ac-25
    description: An immediate Skip at the very start of a segment produces a
      zero-length effective segment and announces NOTHING — the user chose to
      end it and is standing at the screen.
    test: announces nothing when a segment is skipped immediately at zero elapsed
  - id: ac-26
    description: That immediate skip still advances the marker PAST the
      zero-duration boundary it created, so the boundary is never left behind to
      be announced on a later render.
    test: advances the marker past a zero-duration boundary created by an immediate
      skip
  - id: ac-27
    description: Several immediate skips in a row create several equal cumulative
      boundaries and all of them stay silent — acknowledgeThrough clears every
      boundary at or before the elapsed value, not just one.
    test: stays silent across repeated zero-time skips
  - id: ac-28
    description: After skipping, the next genuinely elapsed segment boundary still
      announces normally. This is the counterexample that fails an
      implementation which treats a zero boundary as malformed and disables the
      rest of the run.
    test: still announces the next genuinely elapsed boundary after a skip
  - id: ac-29
    description: An empty boundary list, and genuinely malformed input (negative,
      NaN, or out-of-order values), announce nothing and leave the marker alone
      — without classifying a legitimate skip-produced zero as malformed.
    test: announces nothing for an empty or malformed boundary list
  - id: ac-30
    description: At most one request is outstanding and at most one sentinel held,
      however many times the coordinator is re-enabled.
    test: holds at most one sentinel and never stacks requests
  - id: ac-31
    description: "A rejected acquisition is harmless: no throw escapes, no state is
      corrupted, and a later enable can still acquire."
    test: treats a rejected wake lock request as harmless
  - id: ac-32
    description: Disabling while a request is still in flight releases the sentinel
      that resolves afterwards instead of holding it — the pending-acquisition
      leak.
    test: releases a sentinel that resolves after the coordinator was disabled
  - id: ac-33
    description: Unmounting or disabling while a sentinel is held releases it exactly once.
    test: releases a held sentinel exactly once when disabled
  - id: ac-34
    description: Hidden releases, and returning to visible while the clock still
      qualifies reacquires exactly once — not zero times, not twice.
    test: reacquires exactly once when the document becomes visible again
  - id: ac-35
    description: Rapid visibility and pause/resume churn neither stacks requests nor
      leaves a stale sentinel held once the churn settles.
    test: leaks no sentinel across rapid visibility and pause churn
  - id: ac-36
    description: OWNER DEVICE CHECK (perceptibility). During a routine, deliberately
      look away from the phone across a segment boundary and glance back a few
      seconds later. Confirm it is still apparent that the segment changed — a
      cue that has already vanished by the time you look up fails this check.
    test: manual:OWNER
docsDelta:
  - CLAUDE.md
  - AGENTS.md
createdAt: 2026-08-30T12:14:22.169Z
amendments:
  - at: 2026-08-30T23:34:31.431Z
    reason: Repair the malformed legacy docsDelta accepted before Prismatica
      validated documentation requirements as exact repository-relative paths.
    description: "docs: +CLAUDE.md, AGENTS.md -Add a section to CLAUDE.md (and the
      identical AGENTS.md) stating the hands-free invariant: while a practice
      clock is running AND its screen is visible, the app holds a screen wake
      lock; pause, finish, discard, unmount and hidden all release it; there is
      exactly one owner of the lock (`useScreenAwake`) so two can never be held
      at once; reacquisition on `visibilitychange` is required by the Screen
      Wake Lock specification, not a browser workaround; and no wake-lock
      outcome may ever influence elapsed time., Document the announcement policy
      in both files: `nextSignal`/`acknowledgeThrough`/`shouldKeepAwake` in
      `src/domain/practiceSignal.ts` are pure and tested; the marker is a COUNT
      OF BOUNDARIES ALREADY ANNOUNCED living on the store's ephemeral
      `active`/`activeRoutine` (never in `PracticeDB`, so no schema bump, no
      migration, and never synced or backed up); an absent marker reads as
      nothing announced yet; a multi-boundary catch-up announces ONCE and
      advances the marker to the boundary actually reached; and a deliberate
      Skip acknowledges without announcing., Record that the visual state change
      is the guaranteed signal and that audio/vibration are feature-detected
      best-effort only — with the reasons: `navigator.vibrate` is unimplemented
      in Safari on iOS, and the WebAudio unlock gesture lives on the pages that
      START a block rather than on the practice screen, which hands-free
      practice by definition never taps., Record that an ordinary block never
      auto-finishes at its target: reaching the target announces and begins
      counting overtime, and only the user's Finish or Discard ends a block.,
      Record the secure-context constraint in both files: Screen Wake Lock needs
      a secure context, so plain-HTTP LAN serving cannot exercise it and a
      device check must confirm `window.isSecureContext` and `'wakeLock' in
      navigator` before concluding anything about the implementation., Note in
      both files that there is no branch-preview deployment (deploy.yml
      publishes on main only), so any future wake-lock or other
      secure-context-dependent work must establish an HTTPS route for device
      testing before device acceptance can be claimed."
---

# Hands-free practice: the screen stays awake while a clock runs, and the app announces the intended end

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/7
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** cad4d3bc8b45110733f189d9b280b8c8a39587b2 on main _(never re-baselined)_
- **Intent:** 20260830-hands-free-practice-the-screen-stays-awa-65dd

## You may only change

- src/domain/practiceSignal.ts
- src/domain/practiceSignal.test.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/index.ts
- src/components/screenAwake.ts
- src/components/screenAwake.test.ts
- src/components/useScreenAwake.ts
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/store/useStore.ts
- src/styles/global.css
- CLAUDE.md
- AGENTS.md

## Never touch

- Any change in src/styles/global.css to the selectors .grid-2, .option, .options, .input, .textarea, .select, or to the `@media (max-width: 340px)` block. Those are the deferred layout lane's territory; the ONLY CSS permitted here is new rules for the target-reached / overtime state.

## Non-goals

- Elapsed-time accounting. `sessionElapsedSeconds`, `runElapsedSeconds`, `locateClock`, `skipCurrentSegment`, `segmentElapsed` and `aggregateItemMinutes` keep their current behaviour byte-for-byte. Acquiring, failing to acquire, holding, or releasing a wake lock must never add or remove a single recorded second, and the announcement must never write to `accumulatedSeconds` or `runningSince`.
- An ordinary block never auto-finishes at its target. Reaching the target announces and starts counting overtime; only the user's Finish or Discard ends a block. Practising past the target stays ordinary, unremarked-upon behaviour.
- A routine still records at most one PracticeBlock per distinct bound item per run, with `result: 'not_logged'`, completing no review and advancing no SM-2 state.
- The single-active-practice-clock invariant and every one of its guards — `startSession`/`resumeSession` refusing while `activeRoutine` is set, `startRoutineRun`/`resumeRoutineRun` refusing while `active` is set, the persist `merge` freezing a legacy dual pair, and the redirects in ActiveBlock/RoutineRunner/Today/StageDetail — stay exactly as they are. A frozen (non-running) clock holds no wake lock and announces nothing.
- `SCHEMA_VERSION` stays 11 and `PracticeDB` is not touched. The marker lives only on the store's ephemeral `active`/`activeRoutine`; it must never reach IndexedDB's `kv` database, a sync snapshot, or an export/backup.
- No gamification of any kind. The announcement is a neutral state change and a number — never a streak, score, badge, celebration, or congratulatory copy.
- Domain purity: `src/domain/practiceSignal.ts` stays free of React, free of side effects, and free of any `navigator`/`window`/`document` reference. Every platform call lives in the component-layer glue.
- The app shell stays a fixed-height flex column in which only `<main>` scrolls, with nothing `position: fixed/sticky`. Any CSS added for the target-reached state must not introduce a fixed or sticky element.
- The existing layout rules in src/styles/global.css are untouched — specifically .grid-2, .option, .options, .input/.textarea/.select and the `@media (max-width: 340px)` stacking fallback. This lane adds new rules for the target-reached and overtime state and changes no existing selector.
- The routine segment-boundary announcement is never a single-render flash. It persists for a defined presentation interval or is carried by durable on-screen state, and the ordinary block's target-reached and overtime state stays durable for as long as the block runs.
- THE TWO SCREENSHOT LAYOUT BUGS ARE DEFERRED, NOT MISSED, and are the recommended next lane: (a) CloseBlock's review-type pills overlapping the Next review date input, and (b) the bottom nav bar riding up after the first data entry and staying stuck there. Both have been diagnosed and the owner holds the diagnosis; neither belongs in this lane, because they are a layout invariant rather than a timer one. Do not attempt either here, and do not touch the CSS selectors named in `scope.forbid` even incidentally.
- The practice-time totals gap (how long did I practise today / this week / overall) is confirmed real — only per-item `item.totalMinutes` exists, and there is no app-wide total — but it is a separate product/analytics lane over derived block history and must not be attached here.
- `persianSearchMatch` is defined and tested in `src/domain/farsi.ts` but has zero call sites outside its own test; wiring it into search stays out of this lane.
- The stale frozen `now`: ten pages compute `const now = useMemo(() => new Date(), [])` at mount (Today.tsx:53, CloseBlock.tsx:36, Insights.tsx:17, ItemDetail.tsx:65, Lessons.tsx:39 and :331, Repertoire.tsx:93 and :426, SessionPlan.tsx:41, TeacherReport.tsx:16). This is Review §3.4 and is genuinely outstanding, but it is a separate freshness invariant. This lane must not start refreshing `now` anywhere.
- No background or push notifications, no Notification permission prompt, and no service-worker involvement in the announcement. The signal exists only while a practice screen is mounted and visible; building a background alarm is a different capability with different consent implications.
- No change to `src/domain/plan.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts` or `src/domain/blocks.ts`. Do not retune `isSaturated`, priority scoring, or any SM-2 constant.
- No new npm dependency, no audio or media asset file, and no change to the PWA manifest or service-worker configuration.
- Do not seed, author, or alter any Setar/Tar/Guitar routine or catalogue content.
- Do not restructure the app shell, the nav bar, or `useViewportGuard` while adding the target-reached CSS.
- Do not absorb any other finding from the 27 Aug Review or the 28 Aug Build Advisory — specifically not §2.1 class-work fallback, §2.2 attachment-blob feedback, §3.1 touch targets, §4.1 the duplicated CLAUDE.md/AGENTS.md pair (which stay byte-identical apart from line 1 and must both be edited here, but are not otherwise reorganised), §4.3 dead surface, §4.5 Farsi-aware sorting, Advisory §1 NAS folder/index workflow, Advisory §2 lesson-derived materials, or Advisory §4 the strand/category model.
- Do not weaken the production CSP, the service worker, or any production security setting in order to make device testing easier, and do not add an HTTPS dev dependency to the shipped build. The secure-context route for testing is an environment the owner provides, not a code change in this lane.
- The secure-context testing route is an environment the Builder establishes and documents for the owner — not a shipped feature. Do not add an HTTPS dev dependency to the production build, do not weaken the CSP or service worker, and do not repurpose `scripts/deploy-nas.sh` (plain rsync, no TLS) into a security-relevant path.
- Desired rule (not yet truth): While a practice clock is genuinely running and on screen, the app asks the device to keep the display awake and announces the intended end exactly once — and whether that succeeds, fails or is unsupported never changes a single recorded minute.

## Acceptance checks (definition of done)

- [ ] **ac-1** — A clock that jumps across several segment boundaries at once (a backgrounded or locked phone waking up) announces ONCE, not once per boundary crossed. This is the counterexample that fails a per-tick implementation. _(proof: announces once when the clock jumps across several boundaries at once)_
- [ ] **ac-2** — That same jump advances the marker to the number of boundaries ACTUALLY passed, not by one — so the next call does not re-announce the boundaries it skipped over. _(proof: advances the marker to the boundary actually reached, not by one)_
- [ ] **ac-3** — An ordinary block's single target boundary announces exactly once; every later call at or beyond the target announces nothing. Fails if the implementation re-derives 'past target' each render instead of remembering. _(proof: announces an ordinary block target exactly once and never again)_
- [ ] **ac-4** — Pausing across the target and resuming does not re-announce, because the marker persists rather than being rebuilt from the running state. _(proof: does not announce again after pausing across the target and resuming)_
- [ ] **ac-5** — An absent marker (a session persisted before this change) reads as nothing announced yet, rather than throwing or silently swallowing a real boundary. _(proof: treats an absent marker as nothing announced yet)_
- [ ] **ac-6** — Nothing is announced while elapsed has not yet reached the first boundary. _(proof: announces nothing before the first boundary is reached)_
- [ ] **ac-7** — Once every boundary has been announced, further calls stay silent no matter how far elapsed runs past the end — an overrunning routine never announces repeatedly. _(proof: stays silent once every boundary has been announced)_
- [ ] **ac-8** — The last boundary is reported as final and an intermediate one is not, so routine completion and a mere segment change are distinguishable by the caller. _(proof: reports the final boundary distinctly from an intermediate one)_
- [ ] **ac-9** — A deliberate Skip advances the marker WITHOUT announcing, so the user is never told about a segment they chose to end themselves. Fails if skip routes through the announcing path. _(proof: advances the marker without announcing when a segment is skipped)_
- [ ] **ac-10** — After a skip has clamped the current segment onto the elapsed value, the very next signal check stays silent — the concrete regression the acknowledge path exists to prevent. _(proof: stays silent on the boundary a skip has just clamped into place)_
- [ ] **ac-11** — The announcement boundaries are the same numbers locateClock segments by, for the same run — including after a skip has clamped a segment. Fails if a second cumulative sum is computed independently and drifts. _(proof: exposes the same segment boundaries the clock advances on)_
- [ ] **ac-12** — The screen is kept awake only while a clock is genuinely running AND its screen is visible. _(proof: keeps the screen awake only while a clock is running and visible)_
- [ ] **ac-13** — A paused clock releases the screen — pausing to talk to a teacher lets the phone sleep normally. _(proof: does not keep the screen awake while the clock is paused)_
- [ ] **ac-14** — A hidden document keeps nothing, so a backgrounded tab never holds a lock. _(proof: does not keep the screen awake while the document is hidden)_
- [ ] **ac-15** — With no clock at all — including a frozen, non-running clock left by a legacy dual-clock hydration — nothing is held. _(proof: does not keep the screen awake when no clock is running)_
- [ ] **ac-16** — The existing suite still passes in full — in particular every routines, scheduling, plan and migrations test — proving elapsed accounting, one-block-per-item aggregation and the single-clock guards are untouched. 267 tests pass at HEAD; the count must only grow. _(proof: aggregates a repeated segment into one block per item, not one per segment)_
- [ ] **ac-17** — A routine that repeats one item four times still leaves that item unsaturated — proof this lane did not disturb block creation or the scoring family while adding the announcement. _(proof: leaves an item unsaturated after a routine that repeats it four times)_
- [ ] **ac-18** — OWNER DEVICE CHECK — RUN THIS FIRST, BEFORE ANY OTHER DEVICE CHECK. The Builder must already have handed you a runnable procedure naming (a) the secure-context mechanism, (b) the exact steps to expose this lane's build to the iPhone, (c) the exact HTTPS URL, and (d) exactly how to read the two values below on the phone. Note there is no branch-preview deployment in this repo (deploy.yml runs on main only), so this route has to be established, not looked up. Open that URL on the iPhone and confirm `window.isSecureContext === true` and `'wakeLock' in navigator` is true. If either is false, STOP: the environment cannot exercise this lane, every remaining wake-lock device check is ENVIRONMENT-BLOCKED rather than failed, and device acceptance may not be recorded as complete. _(proof: manual:OWNER)_
- [ ] **ac-19** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a block at the shortest REAL selectable target — 5 minutes, the minimum in DURATION_PRESETS; do not add a 1-minute option for testing — put the phone face-up on the music stand and DO NOT TOUCH IT. After 5.5 minutes confirm: (a) the display never dimmed or locked; (b) the screen shows the target-reached state with an overtime figure counting up; (c) the block did NOT auto-finish. Record whether any sound was heard. _(proof: manual:OWNER)_
- [ ] **ac-20** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a routine whose first two segments are 1 minute each, put the phone down and DO NOT TOUCH IT. Confirm the display stays on and the arrival at segment 2 is visibly announced without any interaction. Record whether any sound or vibration occurred. _(proof: manual:OWNER)_
- [ ] **ac-21** — OWNER DEVICE CHECK (iPhone). Mid-block, tap Pause and put the phone down for 2 minutes. Confirm the display is allowed to sleep normally, then wake it and confirm the elapsed time did NOT advance during the pause. _(proof: manual:OWNER)_
- [ ] **ac-22** — OWNER DEVICE CHECK (iPhone). Mid-block, switch to another app for 60 seconds, then return. Confirm the display stays awake again on return (the spec-mandated release-on-hidden is reacquired), and that elapsed reflects the full real wall-clock interval including the time away. _(proof: manual:OWNER)_
- [ ] **ac-23** — OWNER DEVICE CHECK (leak check, iPhone). From a running block, exercise each exit in turn — Finish then Save, Finish then Discard, Discard block, and a nav-bar tap away — and after each confirm the phone sleeps normally on Today within its usual auto-lock interval. _(proof: manual:OWNER)_
- [ ] **ac-24** — OWNER DEVICE CHECK (graceful degradation). Open the app in a browser without Screen Wake Lock support, or with the lock denied (for example on low-power mode), and run a 5-minute block (the shortest real preset). Confirm the timer runs normally, the target-reached state and overtime still appear, no error is shown, and the saved minutes are correct. _(proof: manual:OWNER)_
- [ ] **ac-25** — An immediate Skip at the very start of a segment produces a zero-length effective segment and announces NOTHING — the user chose to end it and is standing at the screen. _(proof: announces nothing when a segment is skipped immediately at zero elapsed)_
- [ ] **ac-26** — That immediate skip still advances the marker PAST the zero-duration boundary it created, so the boundary is never left behind to be announced on a later render. _(proof: advances the marker past a zero-duration boundary created by an immediate skip)_
- [ ] **ac-27** — Several immediate skips in a row create several equal cumulative boundaries and all of them stay silent — acknowledgeThrough clears every boundary at or before the elapsed value, not just one. _(proof: stays silent across repeated zero-time skips)_
- [ ] **ac-28** — After skipping, the next genuinely elapsed segment boundary still announces normally. This is the counterexample that fails an implementation which treats a zero boundary as malformed and disables the rest of the run. _(proof: still announces the next genuinely elapsed boundary after a skip)_
- [ ] **ac-29** — An empty boundary list, and genuinely malformed input (negative, NaN, or out-of-order values), announce nothing and leave the marker alone — without classifying a legitimate skip-produced zero as malformed. _(proof: announces nothing for an empty or malformed boundary list)_
- [ ] **ac-30** — At most one request is outstanding and at most one sentinel held, however many times the coordinator is re-enabled. _(proof: holds at most one sentinel and never stacks requests)_
- [ ] **ac-31** — A rejected acquisition is harmless: no throw escapes, no state is corrupted, and a later enable can still acquire. _(proof: treats a rejected wake lock request as harmless)_
- [ ] **ac-32** — Disabling while a request is still in flight releases the sentinel that resolves afterwards instead of holding it — the pending-acquisition leak. _(proof: releases a sentinel that resolves after the coordinator was disabled)_
- [ ] **ac-33** — Unmounting or disabling while a sentinel is held releases it exactly once. _(proof: releases a held sentinel exactly once when disabled)_
- [ ] **ac-34** — Hidden releases, and returning to visible while the clock still qualifies reacquires exactly once — not zero times, not twice. _(proof: reacquires exactly once when the document becomes visible again)_
- [ ] **ac-35** — Rapid visibility and pause/resume churn neither stacks requests nor leaves a stale sentinel held once the churn settles. _(proof: leaks no sentinel across rapid visibility and pause churn)_
- [ ] **ac-36** — OWNER DEVICE CHECK (perceptibility). During a routine, deliberately look away from the phone across a segment boundary and glance back a few seconds later. Confirm it is still apparent that the segment changed — a cue that has already vanished by the time you look up fails this check. _(proof: manual:OWNER)_

## Docs to update

- CLAUDE.md
- AGENTS.md

## Amendments

- 2026-08-30T23:34:31.431Z — Repair the malformed legacy docsDelta accepted before Prismatica validated documentation requirements as exact repository-relative paths.: docs: +CLAUDE.md, AGENTS.md -Add a section to CLAUDE.md (and the identical AGENTS.md) stating the hands-free invariant: while a practice clock is running AND its screen is visible, the app holds a screen wake lock; pause, finish, discard, unmount and hidden all release it; there is exactly one owner of the lock (`useScreenAwake`) so two can never be held at once; reacquisition on `visibilitychange` is required by the Screen Wake Lock specification, not a browser workaround; and no wake-lock outcome may ever influence elapsed time., Document the announcement policy in both files: `nextSignal`/`acknowledgeThrough`/`shouldKeepAwake` in `src/domain/practiceSignal.ts` are pure and tested; the marker is a COUNT OF BOUNDARIES ALREADY ANNOUNCED living on the store's ephemeral `active`/`activeRoutine` (never in `PracticeDB`, so no schema bump, no migration, and never synced or backed up); an absent marker reads as nothing announced yet; a multi-boundary catch-up announces ONCE and advances the marker to the boundary actually reached; and a deliberate Skip acknowledges without announcing., Record that the visual state change is the guaranteed signal and that audio/vibration are feature-detected best-effort only — with the reasons: `navigator.vibrate` is unimplemented in Safari on iOS, and the WebAudio unlock gesture lives on the pages that START a block rather than on the practice screen, which hands-free practice by definition never taps., Record that an ordinary block never auto-finishes at its target: reaching the target announces and begins counting overtime, and only the user's Finish or Discard ends a block., Record the secure-context constraint in both files: Screen Wake Lock needs a secure context, so plain-HTTP LAN serving cannot exercise it and a device check must confirm `window.isSecureContext` and `'wakeLock' in navigator` before concluding anything about the implementation., Note in both files that there is no branch-preview deployment (deploy.yml publishes on main only), so any future wake-lock or other secure-context-dependent work must establish an HTTPS route for device testing before device acceptance can be claimed.

