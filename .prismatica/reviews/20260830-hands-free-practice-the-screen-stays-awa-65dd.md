---
id: 20260830-hands-free-practice-the-screen-stays-awa-65dd
contractId: 20260830-hands-free-practice-the-screen-stays-awa-65dd
patchId: d78233ea948de6fd91e166b12d1b99d55b9cc0a1
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Non-running clock signal suppression
    summary: ActiveBlock and RoutineRunner evaluate nextSignal and play the cue even
      when the active clock is paused or frozen. The wake-lock predicate checks
      running, but the announcement path does not, contrary to the contract
      requirement that a frozen non-running clock announces nothing.
    counterexample: Hydrate a legacy dual-clock state whose ordinary block or
      routine is already beyond a boundary, has running=false after merge
      freezes it, and has signalledThrough absent. Opening its practice screen
      calls nextSignal, advances the marker and invokes playSignalCue despite no
      clock running.
createdAt: 2026-08-30T23:40:00.971Z
sealedAt: 2026-08-30T23:46:43.494Z
---

# Review: Hands-free practice: the screen stays awake while a clock runs, and the app announces the intended end

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260830-hands-free-practice-the-screen-stays-awa-65dd
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/7
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `d78233ea948de6fd91e166b12d1b99d55b9cc0a1`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Hands-free practice: the screen stays awake while a clock runs, and the app announces the intended end

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> On the real phone, while actively practising a Routine, the screen is allowed to sleep/lock normally. This was explicitly excluded from the Routines lane so that it could be handled coherently across both RoutineRunner and the ordinary ActiveBlock, rather than implemented only for routines. The original Review §3.3 already identified the same gap: practice screens allow the display to sleep; the user is supposed to be able to practise hands-free without watching/touching the clock; there is also no clear target/end signal on the ordinary practice timer.
> 
> Investigate the complete timer experience rather than merely sprinkling navigator.wakeLock.request() into two components. Consider at least: ActiveBlock and RoutineRunner together; feature detection / graceful unsupported behaviour; acquiring while actively practising; releasing when appropriate; reacquiring after visibility changes where the platform invalidates a lock; pause/resume/finish/discard/navigation lifecycle; avoiding leaked wake locks; the distinction between keeping the display awake and elapsed wall-clock accounting; an appropriate target/segment-completion signal so hands-free practice actually tells the user when the intended time is reached; iPhone/PWA/browser constraints before choosing audio, vibration, visual signalling, or combinations; whether the signal should occur at an ordinary block target, routine segment boundary, routine completion, or some subset — decide from the product behaviour rather than assuming all need identical treatment. Do not turn this into gamification.
> 
> For timer/device work specifically, do not claim browser/device behaviour from assumption: verify the relevant platform/API constraints or mark them OWNER/device checks. Provide a wide lane but ensure edge cases will not emerge during review: identify the underlying invariant/product promise, not just symptoms; inspect every relevant entry/mutation/lifecycle edge up front; use pure domain logic + named tests wherever appropriate; explicitly identify affected Flows and require truth reapproval where behaviour changes; make OWNER-only device/manual checks precise and executable rather than vague; include counterexample-driven tests that would fail if the implementation reverted to the currently-broken behaviour; and state explicit exclusions so the builder cannot absorb adjacent Review findings opportunistically.

## Why

The app's whole practice loop assumes you put the device down and play. Both practice clocks currently break that assumption in the same two ways, and neither can be fixed properly on one surface alone — which is exactly why this was deferred out of the routines lane rather than done half-way there.

1. NEITHER screen asks the device to stay awake. `grep -rn 'wakeLock' src/` returns nothing. On the owner's iPhone the display sleeps mid-block and mid-routine, so the timer the user is supposed to be able to glance at is simply not there.

2. NEITHER screen tells you when the intended time is reached. `ActiveBlock.tsx:57` caps the ring at `Math.min(elapsed / targetSeconds, 1)` and the clock counts on past the target with no state change at all — there is no 'you are at 10 minutes' moment and no overtime readout. `RoutineRunner.tsx` is worse for hands-free use: `locateClock` advances from one segment to the next silently, so a routine you are not watching moves through its segments with nothing to tell you to change what you are doing. The routines lane made the wall-clock catch-up mathematically correct across a background/lock interval (`runElapsedSeconds`/`locateClock`), which means the accounting is right but the user is the last to know.

These are one promise, not two features: a visual end-signal is worthless if the screen is off, and a lit screen is worthless if it never says you are done. Fixing them together, behind one shared pure policy, is what makes this a durable invariant rather than two components each growing their own timer folklore.

It outranks the other surviving candidates because the more serious-sounding ones do not survive inspection at HEAD (cad4d3b): the routines run cannot over-credit minutes (`segmentElapsed` clamps with `Math.min(seg.seconds, ...)` in routines.ts:113); the review date shown is genuinely the date saved (`CloseBlock.handleSave` passes `nextReviewDate: reviewDate` explicitly into `closeSession`); and the inbound migration chain is unified as claimed. The remaining candidates — practice-time totals, persianSearchMatch wiring, the stale frozen `now`, and the two screenshot layout bugs — are all real but each is a different invariant, and folding any of them in here would produce exactly the grab-bag lane the owner asked to avoid.

## Today

VERIFIED AT HEAD cad4d3b (clean tree, schema v11, 267 tests passing in 23 files).

SCREEN SLEEP. There is no Screen Wake Lock usage anywhere in the app: `grep -rn 'wakeLock\|WakeLock' src/` returns no hits. `src/pages/ActiveBlock.tsx` and `src/pages/RoutineRunner.tsx` each run only a bare `setInterval(..., 1000)` to force a re-render (ActiveBlock.tsx:22-26, RoutineRunner.tsx:100-104). Nothing asks the platform to keep the display on, so on the owner's iPhone the screen dims and locks during a block and during a routine.

NO TARGET SIGNAL ON AN ORDINARY BLOCK. `ActiveBlock.tsx:57` computes `deg = Math.min(elapsed / targetSeconds, 1) * 360`. The ring silently saturates at the target and the readout stays `formatClock(elapsed)` over a static `of {targetMinutes}:00` (lines 92-93). Passing the target produces no visual change, no overtime figure, and no other signal of any kind.

NO BOUNDARY SIGNAL ON A ROUTINE. `RoutineRunner.tsx:110` derives the current segment purely by reading the wall clock through `locateClock(segs, elapsedSeconds)`. Segments therefore change over silently; the only acknowledgement of the run ending is the effect at lines 121-124 that calls `finish()` once `clock.finished`. A user who is playing rather than watching gets no cue at a segment boundary at all — the one place a routine most needs to tell them to change activity.

WHY THE ACCOUNTING IS ALREADY FINE. Both clocks are wall-clock, not tick counts: `sessionElapsedSeconds` over `ActiveSession.accumulatedSeconds`/`segmentStartedAt`, and `runElapsedSeconds(accumulatedSeconds, runningSince, running, now)` at routines.ts:77-85. A background or lock interval is therefore already accounted for correctly on wake, and `segmentElapsed` (routines.ts:112-114) clamps each segment with `Math.min(seg.seconds, ...)` so an overshoot past the run total can never over-credit minutes. This lane must not disturb any of that.

NO PLACE TO REMEMBER WHAT WAS ANNOUNCED. `ActiveSession` (useStore.ts:89-105) and `ActiveRoutine` (useStore.ts:137-155) carry no notion of a signal having been given. Both are persisted through the store's `partialize` (useStore.ts:1360-1370) but neither lives in `PracticeDB`.

## Instead

ONE PROMISE: while a practice clock is genuinely running and its screen is visible, the app asks the device to keep the display awake, and it announces the moment the intended time is reached — exactly once per boundary, without the user touching or watching anything. No wake-lock outcome, success or failure, may ever change a recorded minute.

--- 1. A PURE, TESTED POLICY (src/domain/practiceSignal.ts, new, re-exported from src/domain/index.ts) ---
The decision of WHETHER to announce must be a pure function with an explicit marker argument, not a `useRef` hidden in a component — otherwise none of the behaviour below is reachable from a test, since vitest here is `environment: 'node'` with `include: ['src/**/*.test.ts']` (no DOM, and a `.test.tsx` would not even run).

  `nextSignal(marker: number | undefined, elapsedSeconds: number, boundarySeconds: number[])` returns `{ announce: boolean; marker: number; final: boolean }`, where the marker is A COUNT OF BOUNDARIES ALREADY ANNOUNCED. It announces at most ONCE per call: if elapsed has passed more boundaries than the marker records, it announces once and advances the marker to the number actually passed. This single rule is what makes the background/lock catch-up correct — a phone that wakes up four segments later announces once and lands on the right segment, never four times and never zero. `final` is true when the last boundary has been passed (routine complete / block target on an ordinary block, which has exactly one boundary).

  `acknowledgeThrough(marker, elapsedSeconds, boundarySeconds)` advances the marker to the current count WITHOUT announcing. This is what a deliberate Skip uses: the user is standing at the screen and chose to end the segment, so telling them it ended is noise. Without this, `skipRoutineRun` would clamp the current segment (`skipCurrentSegment` sets its `.seconds` to exactly the elapsed value) and the very next render would see a freshly-passed boundary and announce it.

  BOUNDARY SEMANTICS — ZERO AND EQUAL BOUNDARIES ARE LEGITIMATE, NOT MALFORMED. The input is the run's ordered cumulative END boundaries, which are NON-DECREASING rather than strictly increasing. `skipCurrentSegment` sets the current segment's effective duration to `elapsedSeconds - bounds[i]`, so a user who skips the moment a segment begins produces an effective duration of exactly 0 — and repeated immediate skips produce SEVERAL equal cumulative boundaries in a row. Treating a list containing a zero or a repeated value as invalid would silently disable every remaining announcement for the rest of that run, which is a worse failure than the one it would be guarding against. `nextSignal` and `acknowledgeThrough` must therefore handle equal and zero-length boundaries as ordinary input, counting how many boundaries are at or before the current elapsed value.

  `acknowledgeThrough` must acknowledge ALL boundaries at or before the current elapsed value, not just one — otherwise two immediate skips in a row would leave an unacknowledged boundary behind for `nextSignal` to announce on the next render.

  Defensive handling is kept only for genuinely malformed input — an empty list, or values that are negative, NaN, or out of order. A negative boundary is unreachable in practice (`locateClock` guarantees `elapsed >= bounds[i]` for the current index, so the skip subtraction cannot go below zero); an empty list is the honest no-boundaries case. Neither may be conflated with a legitimate skip-produced zero.

  `shouldKeepAwake({ hasClock, running, visible })` — a pure predicate, true only when all three hold. Paused means the display may sleep; hidden means we hold nothing.

  An ABSENT marker (`undefined`) reads as zero, i.e. nothing announced yet. This is the honest reading for a session persisted before this change: if such a session is already past its target, the user gets ONE announcement when the practice screen is next opened. That is a true statement (they are past target), merely delayed — never a false one — and it is preferable to seeding the marker from live elapsed time, which would silently swallow a genuine boundary.

--- 2. BOUNDARIES COME FROM THE SAME SEGMENTATION THE CLOCK USES ---
`src/domain/routines.ts` already computes cumulative segment boundaries in a private `boundaries()` helper used by `locateClock`, `skipCurrentSegment` and `aggregateItemMinutes`. Export it (or a thin named wrapper) rather than recomputing a second cumulative sum in the runner: the announcement boundaries and the clock's own segment edges must be the same numbers by construction, not by coincidence. An ordinary block's boundary array is simply `[targetMinutes * 60]`.

--- 3. THE MARKER IS STORE STATE, NOT COMPONENT STATE ---
Add an optional `signalledThrough?: number` to `ActiveSession` and `ActiveRoutine` in `src/store/useStore.ts`, with a store action to advance it. Component state would re-announce every time the user navigates away from `/active` or `/routine/:id` and back — and the routines lane deliberately moved the whole run into the store precisely so navigation loses nothing. NO `SCHEMA_VERSION` BUMP AND NO MIGRATION: neither object is part of `PracticeDB`, so this field never enters IndexedDB's `kv` database, never syncs, and never appears in a backup or export. It is persisted only through the store's existing `partialize`, which is why the absent-marker rule above is required rather than optional.

--- 4. THE WAKE LOCK: ONE SHARED OWNER, NEVER TWO, AND ITS LIFECYCLE IS TESTED ---
`shouldKeepAwake` is only a predicate; it is NOT evidence for the asynchronous ownership behaviour promised below. Every risk that actually matters here — a stacked request, a leaked sentinel, an acquisition that resolves after the user already pressed Pause — lives in the async glue, so that glue must not be locked inside a React hook where no test can reach it.

Split it in two, following the precedent the sync engine already sets in this codebase (a port-injected, fully unit-tested engine with the transport behind an interface):
  • `src/components/screenAwake.ts` — a plain, non-React coordinator holding the entire ownership state machine, with `acquire`/`release` INJECTED as ports. No `navigator`, no `window`, no `document`. Because it takes its primitives as arguments, its whole lifecycle is reachable from an ordinary Node `.test.ts` with NO jsdom and NO new dependency. (A non-component helper module beside its own test in `src/components/` is an established shape here — see `itemKinds.ts` / `itemKinds.test.ts`.)
  • `src/components/useScreenAwake.ts` — a thin React/browser adapter that supplies the real `navigator.wakeLock.request` / `sentinel.release` ports, wires `visibilitychange`, and does nothing else worth testing.

The coordinator must guarantee, and its tests must prove:
  • FEATURE-DETECT (`'wakeLock' in navigator`) and be a total no-op where absent — the timer, the announcement and every recorded minute behave identically with or without the API.
  • CATCH a rejected request. `WakeLockSentinel` acquisition can reject for reasons entirely outside the app (low battery, a platform or user setting). A rejection must be swallowed silently and must never break the timer, throw into React, or block the visual announcement.
  • REACQUIRE on `visibilitychange` back to visible. The Screen Wake Lock specification requires the platform to release the lock when the document becomes hidden, so re-requesting on return is required by the spec, not a guess about any particular browser.
  • RELEASE on pause, on unmount (navigation away, Finish, Discard, routine completion), and whenever `shouldKeepAwake` turns false — so no lock is ever leaked and the device sleeps normally the moment practice stops.
  • NOT STACK requests across rapid visibility or pause/resume toggles: at most one outstanding request and one held sentinel at any time.
  • NEVER STRAND A PENDING ACQUISITION. If the clock is paused, hidden, or unmounted WHILE a request is still in flight, the sentinel that subsequently resolves must be released immediately rather than held — the single likeliest way to leak a lock and keep a phone awake after practice has stopped.

--- 5. THE ANNOUNCEMENT ITSELF: VISUAL IS THE GUARANTEE ---
The VISUAL state change is the contractual signal and is always delivered:
  • Ordinary block at target: the ring reaches full and visibly changes state, the readout says the target is reached, and an overtime figure appears and keeps counting (`formatClock(elapsed - targetSeconds)`). The block MUST NOT auto-finish — practising past the target is ordinary and honest, and closing is the user's decision.
  • Routine segment boundary: the runner already re-renders onto the new segment; make that arrival visibly announced rather than a silent swap. A ONE-RENDER TRANSIENT IS EXPLICITLY UNACCEPTABLE: a musician glancing up from the instrument a few seconds later must still be able to see that the segment changed. The announcement must therefore either persist for a short, defined presentation interval, or be carried by another durable changed state on the screen. The builder chooses whichever is cleanest for the existing UI; what is fixed is that a boundary is perceptible after the render in which it fired, and that the treatment stays neutral — a state change, never a celebration.
  • Routine completion: `final` — the existing terminal 'Routine complete' screen with its recorded minutes is the durable evidence and already exists; it must simply not be reached silently.
AUDIO AND VIBRATION ARE BEST-EFFORT ONLY, feature-detected, wrapped so failure is silent, and NOT part of any automated acceptance check. Two honest constraints drive this: `navigator.vibrate` is not implemented in Safari on iOS at all; and a WebAudio context on iOS needs a user gesture to unlock, but the gesture that starts a block happens on Today / StageDetail / SessionPlan, not on the practice screen — and hands-free practice by definition has no tap on the practice screen to unlock with. Widening the frame to those three pages to unlock audio at the start gesture is deliberately NOT in this lane. The OWNER device checks below therefore RECORD what audio actually did on the real device rather than asserting it.
Neutral and non-gamified throughout: a state change and a number. No streak, no score, no celebration, no confetti, no 'well done'.

--- 6. HANDOFF OBLIGATION: THE OWNER MUST BE ABLE TO ACTUALLY RUN THE DEVICE CHECKS ---
The Screen Wake Lock API requires a secure context, and this repo has no verified secure route for an unmerged branch (see `assumptions`). Listing possible approaches is not enough: BEFORE handing the checkpoint back for OWNER device acceptance, the Builder must inspect the actual development and deployment environment available here and hand the owner a runnable procedure containing ALL FOUR of:
  (a) the exact secure-context mechanism chosen, and why it is available in this environment;
  (b) the exact commands or steps to expose THIS lane's build to the iPhone;
  (c) the exact HTTPS URL to open on the phone;
  (d) the exact practical way to read `window.isSecureContext` and `'wakeLock' in navigator` on that device — an on-screen readout, a Safari Web Inspector step, or equivalent — since a phone has no console by default.
No production dependency may be added and no production security setting weakened to achieve this.

IF NO USABLE SECURE ROUTE EXISTS, the Builder must say so plainly and report the wake-lock OWNER checks as ENVIRONMENT-BLOCKED — never as implementation failures, and never as passed. Device acceptance must not be claimed as complete in that case. The automated checks stand on their own regardless; it is only the device-observable half that is blocked.

--- 7. FLOW TRUTH ---
This lane changes observable behaviour on BOTH practice surfaces, but the answer schema carries exactly one `flowId` and one `delta`. The Delta is filed against `practise-todays-recommendation` step 4 (the running clock). `work-a-pathway-stage` (whose 'Guided routine' variation covers `RoutineRunner`) AND `run-a-session-plan` (whose segments run as ordinary blocks on `/active`, a route it already lists) ALSO change observably and MUST BOTH be reapproved in this lane via `prismatica flow`, rather than through this Delta. All three reapprovals are required before this change ships; see `possibleConflicts` for a stale sentence in that flow the owner should read carefully while reapproving it.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Verified at HEAD cad4d3bc8b45110733f189d9b280b8c8a39587b2 with a clean working tree, no open changes and no pending proposals; `npx vitest run` reports 267 tests passing across 23 files.
- Verified absent, not assumed: `grep -rn 'wakeLock\|WakeLock' src/` returns zero hits at HEAD, so there is no existing wake-lock code to reconcile with.
- The Screen Wake Lock specification requires the user agent to release a held lock when the document becomes hidden. Reacquisition on `visibilitychange` is therefore mandated by the specification, not inferred from any one browser's behaviour.
- `navigator.vibrate` is not implemented in Safari on iOS. Vibration is treated as a feature-detected bonus for other platforms and is never relied upon for the owner's own device.
- Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is NOT asserted by this contract. The implementation feature-detects and degrades silently, and the OWNER device checks below establish what actually happens on the real device.
- Whether any audio cue is audible on the owner's iPhone is likewise NOT asserted: the WebAudio unlock gesture lives on Today/StageDetail/SessionPlan, which are deliberately out of frame. The OWNER device check records the observed result rather than asserting one.
- `ActiveSession` and `ActiveRoutine` are defined in `src/store/useStore.ts` (lines 89-105 and 137-155), not in `src/domain/types.ts`, so adding the marker needs no change to the domain types module.
- The store itself is not unit-testable here: vitest runs with `environment: 'node'` and `include: ['src/**/*.test.ts']`, and there is no IndexedDB shim or jsdom. The invariant this lane holds to is therefore NOT that every automated check lives in `src/domain/` — it is that all automated logic is exercised through NON-DOM, dependency-free testable modules that run in the EXISTING Node vitest environment, with no jsdom and no new dependency. Two shapes qualify: pure domain modules (`src/domain/practiceSignal.ts`), and plain non-React component-layer helper modules (`src/components/screenAwake.ts`, which is deliberately NOT part of `src/domain/` — it is browser-lifecycle machinery, kept testable by taking its `acquire`/`release` primitives as injected ports, and sits beside its own test exactly as `itemKinds.ts`/`itemKinds.test.ts` already does). Genuinely browser-only behaviour is never asserted by an automated check; it remains OWNER device acceptance.
- Verified, and it constrains the OWNER checks: a 1-minute ORDINARY block is not selectable — StartBlock offers only DURATION_PRESETS ([5,10,15,20,30]) and the default is 10, so the shortest real ordinary target is 5 minutes and no 1-minute option may be added for testing. One-minute ROUTINE segments are genuinely authorable and already exist: RoutineEdit floors segment minutes at `Math.max(1, ...)`, and the seeded CGS Stage 1 routine contains several `minutes: 1` segments.
- The Screen Wake Lock API requires a SECURE CONTEXT. Production is unaffected (GitHub Pages is HTTPS), but the LAN route previously used to test on the phone is not: `http://192.168.x.x` is not a secure context, and `scripts/deploy-nas.sh` is a plain rsync into a NAS web root with no TLS. `http://localhost` would qualify but is not reachable from the phone. An unmerged branch tested that way would therefore show `navigator.wakeLock === undefined` and look like an implementation failure when it is an environment failure.
- VERIFIED, NOT ASSUMED: this repository currently has NO secure-context route for an UNMERGED branch. `.github/workflows/deploy.yml` publishes to GitHub Pages only on `push: branches: [main]` (plus a manual `workflow_dispatch` that targets the single `pages` concurrency group, i.e. it would publish the branch AS production); `ci.yml` checks branches and pull requests but publishes nothing; and there is no HTTPS dev tooling in the repo (no basic-ssl, no mkcert, no `server.https` in vite.config.ts). No branch-preview URL may therefore be assumed to exist — establishing a route is part of this lane's handoff obligation below, not a given.

**Possible conflicts**

- GOVERNANCE FINDING, surfaced not absorbed: `work-a-pathway-stage`'s approved truth still describes a stage routine as 'a segmented warm-up countdown that is explicitly not logged as practice' (variation 'Guided routine', and the same wording in step 1's `shows`). The v11 routines lane changed that — bound segments now write real PracticeBlocks with honest minutes. That sentence is already stale at HEAD, independently of this lane. Since this lane requires that flow to be reapproved anyway, the owner should correct that wording in the same reapproval. This lane must NOT change any routine-logging behaviour to match the stale text.
- THREE FLOWS CHANGE OBSERVABLY AND ALL THREE REQUIRE TRUTH REAPPROVAL IN THIS LANE, but the answer schema carries only one `flowId`: (1) `practise-todays-recommendation` — the primary Delta, filed here; (2) `work-a-pathway-stage` — its 'Guided routine' variation covers RoutineRunner; (3) `run-a-session-plan` — its segments execute as ordinary blocks on `/active` (the flow already lists that route), so they gain the wake lock and the target-reached state too. Flows (2) and (3) must be reapproved via `prismatica flow`, NOT skimmed and NOT deferred; nothing in the governance record enforces this, so it is a condition of shipping stated here.
- The signal marker is persisted through zustand's `partialize` into browser storage. A device that has an in-flight `active` or `activeRoutine` saved from before this change will hydrate it with `signalledThrough === undefined`; the absent-marker rule is what makes that safe, and it is covered by a named test rather than left to inference.
- `skipRoutineRun` clamps the current segment's duration to whatever actually elapsed, which MOVES a boundary onto the current elapsed value. Unless the skip path advances the marker via `acknowledgeThrough`, the next render would see a newly-passed boundary and announce a segment the user deliberately ended themselves.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "On the real phone, while actively practising a Routine, the screen is allowed to sleep/lock normally. This was explicitly excluded from the Routines lane so that it could be handled coherently across both RoutineRunner and the ordinary ActiveBlock, rather than implemented only for routines. The original Review §3.3 already identified the same gap: practice screens allow the display to sleep; the user is supposed to be able to practise hands-free without watching/touching the clock; there is also no clear target/end signal on the ordinary practice timer.\n\nInvestigate the complete timer experience rather than merely sprinkling navigator.wakeLock.request() into two components. Consider at least: ActiveBlock and RoutineRunner together; feature detection / graceful unsupported behaviour; acquiring while actively practising; releasing when appropriate; reacquiring after visibility changes where the platform invalidates a lock; pause/resume/finish/discard/navigation lifecycle; avoiding leaked wake locks; the distinction between keeping the display awake and elapsed wall-clock accounting; an appropriate target/segment-completion signal so hands-free practice actually tells the user when the intended time is reached; iPhone/PWA/browser constraints before choosing audio, vibration, visual signalling, or combinations; whether the signal should occur at an ordinary block target, routine segment boundary, routine completion, or some subset — decide from the product behaviour rather than assuming all need identical treatment. Do not turn this into gamification.\n\nFor timer/device work specifically, do not claim browser/device behaviour from assumption: verify the relevant platform/API constraints or mark them OWNER/device checks. Provide a wide lane but ensure edge cases will not emerge during review: identify the underlying invariant/product promise, not just symptoms; inspect every relevant entry/mutation/lifecycle edge up front; use pure domain logic + named tests wherever appropriate; explicitly identify affected Flows and require truth reapproval where behaviour changes; make OWNER-only device/manual checks precise and executable rather than vague; include counterexample-driven tests that would fail if the implementation reverted to the currently-broken behaviour; and state explicit exclusions so the builder cannot absorb adjacent Review findings opportunistically.",
  "builder": "claude",
  "summary": "Hands-free practice: the screen stays awake while a clock runs, and the app announces the intended end",
  "rationale": "The app's whole practice loop assumes you put the device down and play. Both practice clocks currently break that assumption in the same two ways, and neither can be fixed properly on one surface alone — which is exactly why this was deferred out of the routines lane rather than done half-way there.\n\n1. NEITHER screen asks the device to stay awake. `grep -rn 'wakeLock' src/` returns nothing. On the owner's iPhone the display sleeps mid-block and mid-routine, so the timer the user is supposed to be able to glance at is simply not there.\n\n2. NEITHER screen tells you when the intended time is reached. `ActiveBlock.tsx:57` caps the ring at `Math.min(elapsed / targetSeconds, 1)` and the clock counts on past the target with no state change at all — there is no 'you are at 10 minutes' moment and no overtime readout. `RoutineRunner.tsx` is worse for hands-free use: `locateClock` advances from one segment to the next silently, so a routine you are not watching moves through its segments with nothing to tell you to change what you are doing. The routines lane made the wall-clock catch-up mathematically correct across a background/lock interval (`runElapsedSeconds`/`locateClock`), which means the accounting is right but the user is the last to know.\n\nThese are one promise, not two features: a visual end-signal is worthless if the screen is off, and a lit screen is worthless if it never says you are done. Fixing them together, behind one shared pure policy, is what makes this a durable invariant rather than two components each growing their own timer folklore.\n\nIt outranks the other surviving candidates because the more serious-sounding ones do not survive inspection at HEAD (cad4d3b): the routines run cannot over-credit minutes (`segmentElapsed` clamps with `Math.min(seg.seconds, ...)` in routines.ts:113); the review date shown is genuinely the date saved (`CloseBlock.handleSave` passes `nextReviewDate: reviewDate` explicitly into `closeSession`); and the inbound migration chain is unified as claimed. The remaining candidates — practice-time totals, persianSearchMatch wiring, the stale frozen `now`, and the two screenshot layout bugs — are all real but each is a different invariant, and folding any of them in here would produce exactly the grab-bag lane the owner asked to avoid.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "VERIFIED AT HEAD cad4d3b (clean tree, schema v11, 267 tests passing in 23 files).\n\nSCREEN SLEEP. There is no Screen Wake Lock usage anywhere in the app: `grep -rn 'wakeLock\\|WakeLock' src/` returns no hits. `src/pages/ActiveBlock.tsx` and `src/pages/RoutineRunner.tsx` each run only a bare `setInterval(..., 1000)` to force a re-render (ActiveBlock.tsx:22-26, RoutineRunner.tsx:100-104). Nothing asks the platform to keep the display on, so on the owner's iPhone the screen dims and locks during a block and during a routine.\n\nNO TARGET SIGNAL ON AN ORDINARY BLOCK. `ActiveBlock.tsx:57` computes `deg = Math.min(elapsed / targetSeconds, 1) * 360`. The ring silently saturates at the target and the readout stays `formatClock(elapsed)` over a static `of {targetMinutes}:00` (lines 92-93). Passing the target produces no visual change, no overtime figure, and no other signal of any kind.\n\nNO BOUNDARY SIGNAL ON A ROUTINE. `RoutineRunner.tsx:110` derives the current segment purely by reading the wall clock through `locateClock(segs, elapsedSeconds)`. Segments therefore change over silently; the only acknowledgement of the run ending is the effect at lines 121-124 that calls `finish()` once `clock.finished`. A user who is playing rather than watching gets no cue at a segment boundary at all — the one place a routine most needs to tell them to change activity.\n\nWHY THE ACCOUNTING IS ALREADY FINE. Both clocks are wall-clock, not tick counts: `sessionElapsedSeconds` over `ActiveSession.accumulatedSeconds`/`segmentStartedAt`, and `runElapsedSeconds(accumulatedSeconds, runningSince, running, now)` at routines.ts:77-85. A background or lock interval is therefore already accounted for correctly on wake, and `segmentElapsed` (routines.ts:112-114) clamps each segment with `Math.min(seg.seconds, ...)` so an overshoot past the run total can never over-credit minutes. This lane must not disturb any of that.\n\nNO PLACE TO REMEMBER WHAT WAS ANNOUNCED. `ActiveSession` (useStore.ts:89-105) and `ActiveRoutine` (useStore.ts:137-155) carry no notion of a signal having been given. Both are persisted through the store's `partialize` (useStore.ts:1360-1370) but neither lives in `PracticeDB`.",
  "desiredBehaviour": "ONE PROMISE: while a practice clock is genuinely running and its screen is visible, the app asks the device to keep the display awake, and it announces the moment the intended time is reached — exactly once per boundary, without the user touching or watching anything. No wake-lock outcome, success or failure, may ever change a recorded minute.\n\n--- 1. A PURE, TESTED POLICY (src/domain/practiceSignal.ts, new, re-exported from src/domain/index.ts) ---\nThe decision of WHETHER to announce must be a pure function with an explicit marker argument, not a `useRef` hidden in a component — otherwise none of the behaviour below is reachable from a test, since vitest here is `environment: 'node'` with `include: ['src/**/*.test.ts']` (no DOM, and a `.test.tsx` would not even run).\n\n  `nextSignal(marker: number | undefined, elapsedSeconds: number, boundarySeconds: number[])` returns `{ announce: boolean; marker: number; final: boolean }`, where the marker is A COUNT OF BOUNDARIES ALREADY ANNOUNCED. It announces at most ONCE per call: if elapsed has passed more boundaries than the marker records, it announces once and advances the marker to the number actually passed. This single rule is what makes the background/lock catch-up correct — a phone that wakes up four segments later announces once and lands on the right segment, never four times and never zero. `final` is true when the last boundary has been passed (routine complete / block target on an ordinary block, which has exactly one boundary).\n\n  `acknowledgeThrough(marker, elapsedSeconds, boundarySeconds)` advances the marker to the current count WITHOUT announcing. This is what a deliberate Skip uses: the user is standing at the screen and chose to end the segment, so telling them it ended is noise. Without this, `skipRoutineRun` would clamp the current segment (`skipCurrentSegment` sets its `.seconds` to exactly the elapsed value) and the very next render would see a freshly-passed boundary and announce it.\n\n  BOUNDARY SEMANTICS — ZERO AND EQUAL BOUNDARIES ARE LEGITIMATE, NOT MALFORMED. The input is the run's ordered cumulative END boundaries, which are NON-DECREASING rather than strictly increasing. `skipCurrentSegment` sets the current segment's effective duration to `elapsedSeconds - bounds[i]`, so a user who skips the moment a segment begins produces an effective duration of exactly 0 — and repeated immediate skips produce SEVERAL equal cumulative boundaries in a row. Treating a list containing a zero or a repeated value as invalid would silently disable every remaining announcement for the rest of that run, which is a worse failure than the one it would be guarding against. `nextSignal` and `acknowledgeThrough` must therefore handle equal and zero-length boundaries as ordinary input, counting how many boundaries are at or before the current elapsed value.\n\n  `acknowledgeThrough` must acknowledge ALL boundaries at or before the current elapsed value, not just one — otherwise two immediate skips in a row would leave an unacknowledged boundary behind for `nextSignal` to announce on the next render.\n\n  Defensive handling is kept only for genuinely malformed input — an empty list, or values that are negative, NaN, or out of order. A negative boundary is unreachable in practice (`locateClock` guarantees `elapsed >= bounds[i]` for the current index, so the skip subtraction cannot go below zero); an empty list is the honest no-boundaries case. Neither may be conflated with a legitimate skip-produced zero.\n\n  `shouldKeepAwake({ hasClock, running, visible })` — a pure predicate, true only when all three hold. Paused means the display may sleep; hidden means we hold nothing.\n\n  An ABSENT marker (`undefined`) reads as zero, i.e. nothing announced yet. This is the honest reading for a session persisted before this change: if such a session is already past its target, the user gets ONE announcement when the practice screen is next opened. That is a true statement (they are past target), merely delayed — never a false one — and it is preferable to seeding the marker from live elapsed time, which would silently swallow a genuine boundary.\n\n--- 2. BOUNDARIES COME FROM THE SAME SEGMENTATION THE CLOCK USES ---\n`src/domain/routines.ts` already computes cumulative segment boundaries in a private `boundaries()` helper used by `locateClock`, `skipCurrentSegment` and `aggregateItemMinutes`. Export it (or a thin named wrapper) rather than recomputing a second cumulative sum in the runner: the announcement boundaries and the clock's own segment edges must be the same numbers by construction, not by coincidence. An ordinary block's boundary array is simply `[targetMinutes * 60]`.\n\n--- 3. THE MARKER IS STORE STATE, NOT COMPONENT STATE ---\nAdd an optional `signalledThrough?: number` to `ActiveSession` and `ActiveRoutine` in `src/store/useStore.ts`, with a store action to advance it. Component state would re-announce every time the user navigates away from `/active` or `/routine/:id` and back — and the routines lane deliberately moved the whole run into the store precisely so navigation loses nothing. NO `SCHEMA_VERSION` BUMP AND NO MIGRATION: neither object is part of `PracticeDB`, so this field never enters IndexedDB's `kv` database, never syncs, and never appears in a backup or export. It is persisted only through the store's existing `partialize`, which is why the absent-marker rule above is required rather than optional.\n\n--- 4. THE WAKE LOCK: ONE SHARED OWNER, NEVER TWO, AND ITS LIFECYCLE IS TESTED ---\n`shouldKeepAwake` is only a predicate; it is NOT evidence for the asynchronous ownership behaviour promised below. Every risk that actually matters here — a stacked request, a leaked sentinel, an acquisition that resolves after the user already pressed Pause — lives in the async glue, so that glue must not be locked inside a React hook where no test can reach it.\n\nSplit it in two, following the precedent the sync engine already sets in this codebase (a port-injected, fully unit-tested engine with the transport behind an interface):\n  • `src/components/screenAwake.ts` — a plain, non-React coordinator holding the entire ownership state machine, with `acquire`/`release` INJECTED as ports. No `navigator`, no `window`, no `document`. Because it takes its primitives as arguments, its whole lifecycle is reachable from an ordinary Node `.test.ts` with NO jsdom and NO new dependency. (A non-component helper module beside its own test in `src/components/` is an established shape here — see `itemKinds.ts` / `itemKinds.test.ts`.)\n  • `src/components/useScreenAwake.ts` — a thin React/browser adapter that supplies the real `navigator.wakeLock.request` / `sentinel.release` ports, wires `visibilitychange`, and does nothing else worth testing.\n\nThe coordinator must guarantee, and its tests must prove:\n  • FEATURE-DETECT (`'wakeLock' in navigator`) and be a total no-op where absent — the timer, the announcement and every recorded minute behave identically with or without the API.\n  • CATCH a rejected request. `WakeLockSentinel` acquisition can reject for reasons entirely outside the app (low battery, a platform or user setting). A rejection must be swallowed silently and must never break the timer, throw into React, or block the visual announcement.\n  • REACQUIRE on `visibilitychange` back to visible. The Screen Wake Lock specification requires the platform to release the lock when the document becomes hidden, so re-requesting on return is required by the spec, not a guess about any particular browser.\n  • RELEASE on pause, on unmount (navigation away, Finish, Discard, routine completion), and whenever `shouldKeepAwake` turns false — so no lock is ever leaked and the device sleeps normally the moment practice stops.\n  • NOT STACK requests across rapid visibility or pause/resume toggles: at most one outstanding request and one held sentinel at any time.\n  • NEVER STRAND A PENDING ACQUISITION. If the clock is paused, hidden, or unmounted WHILE a request is still in flight, the sentinel that subsequently resolves must be released immediately rather than held — the single likeliest way to leak a lock and keep a phone awake after practice has stopped.\n\n--- 5. THE ANNOUNCEMENT ITSELF: VISUAL IS THE GUARANTEE ---\nThe VISUAL state change is the contractual signal and is always delivered:\n  • Ordinary block at target: the ring reaches full and visibly changes state, the readout says the target is reached, and an overtime figure appears and keeps counting (`formatClock(elapsed - targetSeconds)`). The block MUST NOT auto-finish — practising past the target is ordinary and honest, and closing is the user's decision.\n  • Routine segment boundary: the runner already re-renders onto the new segment; make that arrival visibly announced rather than a silent swap. A ONE-RENDER TRANSIENT IS EXPLICITLY UNACCEPTABLE: a musician glancing up from the instrument a few seconds later must still be able to see that the segment changed. The announcement must therefore either persist for a short, defined presentation interval, or be carried by another durable changed state on the screen. The builder chooses whichever is cleanest for the existing UI; what is fixed is that a boundary is perceptible after the render in which it fired, and that the treatment stays neutral — a state change, never a celebration.\n  • Routine completion: `final` — the existing terminal 'Routine complete' screen with its recorded minutes is the durable evidence and already exists; it must simply not be reached silently.\nAUDIO AND VIBRATION ARE BEST-EFFORT ONLY, feature-detected, wrapped so failure is silent, and NOT part of any automated acceptance check. Two honest constraints drive this: `navigator.vibrate` is not implemented in Safari on iOS at all; and a WebAudio context on iOS needs a user gesture to unlock, but the gesture that starts a block happens on Today / StageDetail / SessionPlan, not on the practice screen — and hands-free practice by definition has no tap on the practice screen to unlock with. Widening the frame to those three pages to unlock audio at the start gesture is deliberately NOT in this lane. The OWNER device checks below therefore RECORD what audio actually did on the real device rather than asserting it.\nNeutral and non-gamified throughout: a state change and a number. No streak, no score, no celebration, no confetti, no 'well done'.\n\n--- 6. HANDOFF OBLIGATION: THE OWNER MUST BE ABLE TO ACTUALLY RUN THE DEVICE CHECKS ---\nThe Screen Wake Lock API requires a secure context, and this repo has no verified secure route for an unmerged branch (see `assumptions`). Listing possible approaches is not enough: BEFORE handing the checkpoint back for OWNER device acceptance, the Builder must inspect the actual development and deployment environment available here and hand the owner a runnable procedure containing ALL FOUR of:\n  (a) the exact secure-context mechanism chosen, and why it is available in this environment;\n  (b) the exact commands or steps to expose THIS lane's build to the iPhone;\n  (c) the exact HTTPS URL to open on the phone;\n  (d) the exact practical way to read `window.isSecureContext` and `'wakeLock' in navigator` on that device — an on-screen readout, a Safari Web Inspector step, or equivalent — since a phone has no console by default.\nNo production dependency may be added and no production security setting weakened to achieve this.\n\nIF NO USABLE SECURE ROUTE EXISTS, the Builder must say so plainly and report the wake-lock OWNER checks as ENVIRONMENT-BLOCKED — never as implementation failures, and never as passed. Device acceptance must not be claimed as complete in that case. The automated checks stand on their own regardless; it is only the device-observable half that is blocked.\n\n--- 7. FLOW TRUTH ---\nThis lane changes observable behaviour on BOTH practice surfaces, but the answer schema carries exactly one `flowId` and one `delta`. The Delta is filed against `practise-todays-recommendation` step 4 (the running clock). `work-a-pathway-stage` (whose 'Guided routine' variation covers `RoutineRunner`) AND `run-a-session-plan` (whose segments run as ordinary blocks on `/active`, a route it already lists) ALSO change observably and MUST BOTH be reapproved in this lane via `prismatica flow`, rather than through this Delta. All three reapprovals are required before this change ships; see `possibleConflicts` for a stale sentence in that flow the owner should read carefully while reapproving it.",
  "mustNotChange": [
    "Elapsed-time accounting. `sessionElapsedSeconds`, `runElapsedSeconds`, `locateClock`, `skipCurrentSegment`, `segmentElapsed` and `aggregateItemMinutes` keep their current behaviour byte-for-byte. Acquiring, failing to acquire, holding, or releasing a wake lock must never add or remove a single recorded second, and the announcement must never write to `accumulatedSeconds` or `runningSince`.",
    "An ordinary block never auto-finishes at its target. Reaching the target announces and starts counting overtime; only the user's Finish or Discard ends a block. Practising past the target stays ordinary, unremarked-upon behaviour.",
    "A routine still records at most one PracticeBlock per distinct bound item per run, with `result: 'not_logged'`, completing no review and advancing no SM-2 state.",
    "The single-active-practice-clock invariant and every one of its guards — `startSession`/`resumeSession` refusing while `activeRoutine` is set, `startRoutineRun`/`resumeRoutineRun` refusing while `active` is set, the persist `merge` freezing a legacy dual pair, and the redirects in ActiveBlock/RoutineRunner/Today/StageDetail — stay exactly as they are. A frozen (non-running) clock holds no wake lock and announces nothing.",
    "`SCHEMA_VERSION` stays 11 and `PracticeDB` is not touched. The marker lives only on the store's ephemeral `active`/`activeRoutine`; it must never reach IndexedDB's `kv` database, a sync snapshot, or an export/backup.",
    "No gamification of any kind. The announcement is a neutral state change and a number — never a streak, score, badge, celebration, or congratulatory copy.",
    "Domain purity: `src/domain/practiceSignal.ts` stays free of React, free of side effects, and free of any `navigator`/`window`/`document` reference. Every platform call lives in the component-layer glue.",
    "The app shell stays a fixed-height flex column in which only `<main>` scrolls, with nothing `position: fixed/sticky`. Any CSS added for the target-reached state must not introduce a fixed or sticky element.",
    "The existing layout rules in src/styles/global.css are untouched — specifically .grid-2, .option, .options, .input/.textarea/.select and the `@media (max-width: 340px)` stacking fallback. This lane adds new rules for the target-reached and overtime state and changes no existing selector.",
    "The routine segment-boundary announcement is never a single-render flash. It persists for a defined presentation interval or is carried by durable on-screen state, and the ordinary block's target-reached and overtime state stays durable for as long as the block runs."
  ],
  "assumptions": [
    "Verified at HEAD cad4d3bc8b45110733f189d9b280b8c8a39587b2 with a clean working tree, no open changes and no pending proposals; `npx vitest run` reports 267 tests passing across 23 files.",
    "Verified absent, not assumed: `grep -rn 'wakeLock\\|WakeLock' src/` returns zero hits at HEAD, so there is no existing wake-lock code to reconcile with.",
    "The Screen Wake Lock specification requires the user agent to release a held lock when the document becomes hidden. Reacquisition on `visibilitychange` is therefore mandated by the specification, not inferred from any one browser's behaviour.",
    "`navigator.vibrate` is not implemented in Safari on iOS. Vibration is treated as a feature-detected bonus for other platforms and is never relied upon for the owner's own device.",
    "Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is NOT asserted by this contract. The implementation feature-detects and degrades silently, and the OWNER device checks below establish what actually happens on the real device.",
    "Whether any audio cue is audible on the owner's iPhone is likewise NOT asserted: the WebAudio unlock gesture lives on Today/StageDetail/SessionPlan, which are deliberately out of frame. The OWNER device check records the observed result rather than asserting one.",
    "`ActiveSession` and `ActiveRoutine` are defined in `src/store/useStore.ts` (lines 89-105 and 137-155), not in `src/domain/types.ts`, so adding the marker needs no change to the domain types module.",
    "The store itself is not unit-testable here: vitest runs with `environment: 'node'` and `include: ['src/**/*.test.ts']`, and there is no IndexedDB shim or jsdom. The invariant this lane holds to is therefore NOT that every automated check lives in `src/domain/` — it is that all automated logic is exercised through NON-DOM, dependency-free testable modules that run in the EXISTING Node vitest environment, with no jsdom and no new dependency. Two shapes qualify: pure domain modules (`src/domain/practiceSignal.ts`), and plain non-React component-layer helper modules (`src/components/screenAwake.ts`, which is deliberately NOT part of `src/domain/` — it is browser-lifecycle machinery, kept testable by taking its `acquire`/`release` primitives as injected ports, and sits beside its own test exactly as `itemKinds.ts`/`itemKinds.test.ts` already does). Genuinely browser-only behaviour is never asserted by an automated check; it remains OWNER device acceptance.",
    "Verified, and it constrains the OWNER checks: a 1-minute ORDINARY block is not selectable — StartBlock offers only DURATION_PRESETS ([5,10,15,20,30]) and the default is 10, so the shortest real ordinary target is 5 minutes and no 1-minute option may be added for testing. One-minute ROUTINE segments are genuinely authorable and already exist: RoutineEdit floors segment minutes at `Math.max(1, ...)`, and the seeded CGS Stage 1 routine contains several `minutes: 1` segments.",
    "The Screen Wake Lock API requires a SECURE CONTEXT. Production is unaffected (GitHub Pages is HTTPS), but the LAN route previously used to test on the phone is not: `http://192.168.x.x` is not a secure context, and `scripts/deploy-nas.sh` is a plain rsync into a NAS web root with no TLS. `http://localhost` would qualify but is not reachable from the phone. An unmerged branch tested that way would therefore show `navigator.wakeLock === undefined` and look like an implementation failure when it is an environment failure.",
    "VERIFIED, NOT ASSUMED: this repository currently has NO secure-context route for an UNMERGED branch. `.github/workflows/deploy.yml` publishes to GitHub Pages only on `push: branches: [main]` (plus a manual `workflow_dispatch` that targets the single `pages` concurrency group, i.e. it would publish the branch AS production); `ci.yml` checks branches and pull requests but publishes nothing; and there is no HTTPS dev tooling in the repo (no basic-ssl, no mkcert, no `server.https` in vite.config.ts). No branch-preview URL may therefore be assumed to exist — establishing a route is part of this lane's handoff obligation below, not a given."
  ],
  "possibleConflicts": [
    "GOVERNANCE FINDING, surfaced not absorbed: `work-a-pathway-stage`'s approved truth still describes a stage routine as 'a segmented warm-up countdown that is explicitly not logged as practice' (variation 'Guided routine', and the same wording in step 1's `shows`). The v11 routines lane changed that — bound segments now write real PracticeBlocks with honest minutes. That sentence is already stale at HEAD, independently of this lane. Since this lane requires that flow to be reapproved anyway, the owner should correct that wording in the same reapproval. This lane must NOT change any routine-logging behaviour to match the stale text.",
    "THREE FLOWS CHANGE OBSERVABLY AND ALL THREE REQUIRE TRUTH REAPPROVAL IN THIS LANE, but the answer schema carries only one `flowId`: (1) `practise-todays-recommendation` — the primary Delta, filed here; (2) `work-a-pathway-stage` — its 'Guided routine' variation covers RoutineRunner; (3) `run-a-session-plan` — its segments execute as ordinary blocks on `/active` (the flow already lists that route), so they gain the wake lock and the target-reached state too. Flows (2) and (3) must be reapproved via `prismatica flow`, NOT skimmed and NOT deferred; nothing in the governance record enforces this, so it is a condition of shipping stated here.",
    "The signal marker is persisted through zustand's `partialize` into browser storage. A device that has an in-flight `active` or `activeRoutine` saved from before this change will hydrate it with `signalledThrough === undefined`; the absent-marker rule is what makes that safe, and it is covered by a named test rather than left to inference.",
    "`skipRoutineRun` clamps the current segment's duration to whatever actually elapsed, which MOVES a boundary onto the current elapsed value. Unless the skip path advances the marker via `acknowledgeThrough`, the next render would see a newly-passed boundary and announce a segment the user deliberately ended themselves."
  ],
  "scope": {
    "allow": [
      "src/domain/practiceSignal.ts",
      "src/domain/practiceSignal.test.ts",
      "src/domain/routines.ts",
      "src/domain/routines.test.ts",
      "src/domain/index.ts",
      "src/components/screenAwake.ts",
      "src/components/screenAwake.test.ts",
      "src/components/useScreenAwake.ts",
      "src/pages/ActiveBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/store/useStore.ts",
      "src/styles/global.css",
      "CLAUDE.md",
      "AGENTS.md"
    ],
    "forbid": [
      "Any change in src/styles/global.css to the selectors .grid-2, .option, .options, .input, .textarea, .select, or to the `@media (max-width: 340px)` block. Those are the deferred layout lane's territory; the ONLY CSS permitted here is new rules for the target-reached / overtime state."
    ]
  },
  "exclusions": [
    "THE TWO SCREENSHOT LAYOUT BUGS ARE DEFERRED, NOT MISSED, and are the recommended next lane: (a) CloseBlock's review-type pills overlapping the Next review date input, and (b) the bottom nav bar riding up after the first data entry and staying stuck there. Both have been diagnosed and the owner holds the diagnosis; neither belongs in this lane, because they are a layout invariant rather than a timer one. Do not attempt either here, and do not touch the CSS selectors named in `scope.forbid` even incidentally.",
    "The practice-time totals gap (how long did I practise today / this week / overall) is confirmed real — only per-item `item.totalMinutes` exists, and there is no app-wide total — but it is a separate product/analytics lane over derived block history and must not be attached here.",
    "`persianSearchMatch` is defined and tested in `src/domain/farsi.ts` but has zero call sites outside its own test; wiring it into search stays out of this lane.",
    "The stale frozen `now`: ten pages compute `const now = useMemo(() => new Date(), [])` at mount (Today.tsx:53, CloseBlock.tsx:36, Insights.tsx:17, ItemDetail.tsx:65, Lessons.tsx:39 and :331, Repertoire.tsx:93 and :426, SessionPlan.tsx:41, TeacherReport.tsx:16). This is Review §3.4 and is genuinely outstanding, but it is a separate freshness invariant. This lane must not start refreshing `now` anywhere.",
    "No background or push notifications, no Notification permission prompt, and no service-worker involvement in the announcement. The signal exists only while a practice screen is mounted and visible; building a background alarm is a different capability with different consent implications.",
    "No change to `src/domain/plan.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts` or `src/domain/blocks.ts`. Do not retune `isSaturated`, priority scoring, or any SM-2 constant.",
    "No new npm dependency, no audio or media asset file, and no change to the PWA manifest or service-worker configuration.",
    "Do not seed, author, or alter any Setar/Tar/Guitar routine or catalogue content.",
    "Do not restructure the app shell, the nav bar, or `useViewportGuard` while adding the target-reached CSS.",
    "Do not absorb any other finding from the 27 Aug Review or the 28 Aug Build Advisory — specifically not §2.1 class-work fallback, §2.2 attachment-blob feedback, §3.1 touch targets, §4.1 the duplicated CLAUDE.md/AGENTS.md pair (which stay byte-identical apart from line 1 and must both be edited here, but are not otherwise reorganised), §4.3 dead surface, §4.5 Farsi-aware sorting, Advisory §1 NAS folder/index workflow, Advisory §2 lesson-derived materials, or Advisory §4 the strand/category model.",
    "Do not weaken the production CSP, the service worker, or any production security setting in order to make device testing easier, and do not add an HTTPS dev dependency to the shipped build. The secure-context route for testing is an environment the owner provides, not a code change in this lane.",
    "The secure-context testing route is an environment the Builder establishes and documents for the owner — not a shipped feature. Do not add an HTTPS dev dependency to the production build, do not weaken the CSP or service worker, and do not repurpose `scripts/deploy-nas.sh` (plain rsync, no TLS) into a security-relevant path."
  ],
  "acceptance": [
    {
      "description": "A clock that jumps across several segment boundaries at once (a backgrounded or locked phone waking up) announces ONCE, not once per boundary crossed. This is the counterexample that fails a per-tick implementation.",
      "test": "announces once when the clock jumps across several boundaries at once"
    },
    {
      "description": "That same jump advances the marker to the number of boundaries ACTUALLY passed, not by one — so the next call does not re-announce the boundaries it skipped over.",
      "test": "advances the marker to the boundary actually reached, not by one"
    },
    {
      "description": "An ordinary block's single target boundary announces exactly once; every later call at or beyond the target announces nothing. Fails if the implementation re-derives 'past target' each render instead of remembering.",
      "test": "announces an ordinary block target exactly once and never again"
    },
    {
      "description": "Pausing across the target and resuming does not re-announce, because the marker persists rather than being rebuilt from the running state.",
      "test": "does not announce again after pausing across the target and resuming"
    },
    {
      "description": "An absent marker (a session persisted before this change) reads as nothing announced yet, rather than throwing or silently swallowing a real boundary.",
      "test": "treats an absent marker as nothing announced yet"
    },
    {
      "description": "Nothing is announced while elapsed has not yet reached the first boundary.",
      "test": "announces nothing before the first boundary is reached"
    },
    {
      "description": "Once every boundary has been announced, further calls stay silent no matter how far elapsed runs past the end — an overrunning routine never announces repeatedly.",
      "test": "stays silent once every boundary has been announced"
    },
    {
      "description": "The last boundary is reported as final and an intermediate one is not, so routine completion and a mere segment change are distinguishable by the caller.",
      "test": "reports the final boundary distinctly from an intermediate one"
    },
    {
      "description": "A deliberate Skip advances the marker WITHOUT announcing, so the user is never told about a segment they chose to end themselves. Fails if skip routes through the announcing path.",
      "test": "advances the marker without announcing when a segment is skipped"
    },
    {
      "description": "After a skip has clamped the current segment onto the elapsed value, the very next signal check stays silent — the concrete regression the acknowledge path exists to prevent.",
      "test": "stays silent on the boundary a skip has just clamped into place"
    },
    {
      "description": "The announcement boundaries are the same numbers locateClock segments by, for the same run — including after a skip has clamped a segment. Fails if a second cumulative sum is computed independently and drifts.",
      "test": "exposes the same segment boundaries the clock advances on"
    },
    {
      "description": "The screen is kept awake only while a clock is genuinely running AND its screen is visible.",
      "test": "keeps the screen awake only while a clock is running and visible"
    },
    {
      "description": "A paused clock releases the screen — pausing to talk to a teacher lets the phone sleep normally.",
      "test": "does not keep the screen awake while the clock is paused"
    },
    {
      "description": "A hidden document keeps nothing, so a backgrounded tab never holds a lock.",
      "test": "does not keep the screen awake while the document is hidden"
    },
    {
      "description": "With no clock at all — including a frozen, non-running clock left by a legacy dual-clock hydration — nothing is held.",
      "test": "does not keep the screen awake when no clock is running"
    },
    {
      "description": "The existing suite still passes in full — in particular every routines, scheduling, plan and migrations test — proving elapsed accounting, one-block-per-item aggregation and the single-clock guards are untouched. 267 tests pass at HEAD; the count must only grow.",
      "test": "aggregates a repeated segment into one block per item, not one per segment"
    },
    {
      "description": "A routine that repeats one item four times still leaves that item unsaturated — proof this lane did not disturb block creation or the scoring family while adding the announcement.",
      "test": "leaves an item unsaturated after a routine that repeats it four times"
    },
    {
      "description": "OWNER DEVICE CHECK — RUN THIS FIRST, BEFORE ANY OTHER DEVICE CHECK. The Builder must already have handed you a runnable procedure naming (a) the secure-context mechanism, (b) the exact steps to expose this lane's build to the iPhone, (c) the exact HTTPS URL, and (d) exactly how to read the two values below on the phone. Note there is no branch-preview deployment in this repo (deploy.yml runs on main only), so this route has to be established, not looked up. Open that URL on the iPhone and confirm `window.isSecureContext === true` and `'wakeLock' in navigator` is true. If either is false, STOP: the environment cannot exercise this lane, every remaining wake-lock device check is ENVIRONMENT-BLOCKED rather than failed, and device acceptance may not be recorded as complete.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (iPhone, installed PWA). Start a block at the shortest REAL selectable target — 5 minutes, the minimum in DURATION_PRESETS; do not add a 1-minute option for testing — put the phone face-up on the music stand and DO NOT TOUCH IT. After 5.5 minutes confirm: (a) the display never dimmed or locked; (b) the screen shows the target-reached state with an overtime figure counting up; (c) the block did NOT auto-finish. Record whether any sound was heard.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (iPhone, installed PWA). Start a routine whose first two segments are 1 minute each, put the phone down and DO NOT TOUCH IT. Confirm the display stays on and the arrival at segment 2 is visibly announced without any interaction. Record whether any sound or vibration occurred.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (iPhone). Mid-block, tap Pause and put the phone down for 2 minutes. Confirm the display is allowed to sleep normally, then wake it and confirm the elapsed time did NOT advance during the pause.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (iPhone). Mid-block, switch to another app for 60 seconds, then return. Confirm the display stays awake again on return (the spec-mandated release-on-hidden is reacquired), and that elapsed reflects the full real wall-clock interval including the time away.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (leak check, iPhone). From a running block, exercise each exit in turn — Finish then Save, Finish then Discard, Discard block, and a nav-bar tap away — and after each confirm the phone sleeps normally on Today within its usual auto-lock interval.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER DEVICE CHECK (graceful degradation). Open the app in a browser without Screen Wake Lock support, or with the lock denied (for example on low-power mode), and run a 5-minute block (the shortest real preset). Confirm the timer runs normally, the target-reached state and overtime still appear, no error is shown, and the saved minutes are correct.",
      "test": "manual:OWNER"
    },
    {
      "description": "An immediate Skip at the very start of a segment produces a zero-length effective segment and announces NOTHING — the user chose to end it and is standing at the screen.",
      "test": "announces nothing when a segment is skipped immediately at zero elapsed"
    },
    {
      "description": "That immediate skip still advances the marker PAST the zero-duration boundary it created, so the boundary is never left behind to be announced on a later render.",
      "test": "advances the marker past a zero-duration boundary created by an immediate skip"
    },
    {
      "description": "Several immediate skips in a row create several equal cumulative boundaries and all of them stay silent — acknowledgeThrough clears every boundary at or before the elapsed value, not just one.",
      "test": "stays silent across repeated zero-time skips"
    },
    {
      "description": "After skipping, the next genuinely elapsed segment boundary still announces normally. This is the counterexample that fails an implementation which treats a zero boundary as malformed and disables the rest of the run.",
      "test": "still announces the next genuinely elapsed boundary after a skip"
    },
    {
      "description": "An empty boundary list, and genuinely malformed input (negative, NaN, or out-of-order values), announce nothing and leave the marker alone — without classifying a legitimate skip-produced zero as malformed.",
      "test": "announces nothing for an empty or malformed boundary list"
    },
    {
      "description": "At most one request is outstanding and at most one sentinel held, however many times the coordinator is re-enabled.",
      "test": "holds at most one sentinel and never stacks requests"
    },
    {
      "description": "A rejected acquisition is harmless: no throw escapes, no state is corrupted, and a later enable can still acquire.",
      "test": "treats a rejected wake lock request as harmless"
    },
    {
      "description": "Disabling while a request is still in flight releases the sentinel that resolves afterwards instead of holding it — the pending-acquisition leak.",
      "test": "releases a sentinel that resolves after the coordinator was disabled"
    },
    {
      "description": "Unmounting or disabling while a sentinel is held releases it exactly once.",
      "test": "releases a held sentinel exactly once when disabled"
    },
    {
      "description": "Hidden releases, and returning to visible while the clock still qualifies reacquires exactly once — not zero times, not twice.",
      "test": "reacquires exactly once when the document becomes visible again"
    },
    {
      "description": "Rapid visibility and pause/resume churn neither stacks requests nor leaves a stale sentinel held once the churn settles.",
      "test": "leaks no sentinel across rapid visibility and pause churn"
    },
    {
      "description": "OWNER DEVICE CHECK (perceptibility). During a routine, deliberately look away from the phone across a segment boundary and glance back a few seconds later. Confirm it is still apparent that the segment changed — a cue that has already vanished by the time you look up fails this check.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Declared TRUE deliberately, on the narrow and honest reading. This lane adds an optional `signalledThrough?: number` to `ActiveSession` and `ActiveRoutine`, which are persisted through the store's `partialize` into browser storage and survive a reload. That is saved state, so a device can hydrate an in-flight clock written by an older build with the field absent — which is why the absent-marker semantic is specified explicitly above and pinned by its own named test rather than left to inference.\n\nWhat it does NOT touch, and what the reviewer should verify: `SCHEMA_VERSION` stays 11; `PracticeDB` gains no field; `src/domain/migrations.ts` and `src/domain/io.ts` are not in scope at all; nothing new enters IndexedDB's `kv` table, a GitHub sync snapshot, or an export/backup, because `active` and `activeRoutine` have never been part of the database. No migration is required and none may be added.\n\nThe other risk worth naming is the one this lane most has to be careful about: it sits directly on the two practice clocks, whose elapsed-time accounting is the app's most load-bearing correctness property and was hardened only one lane ago. That is why `mustNotChange` freezes the whole elapsed-time family byte-for-byte, why the wake lock is required to be incapable of influencing a recorded minute, and why the announcement is a read-only observer of the clock rather than a participant in it. Everything device-dependent is quarantined into feature-detected glue that degrades to a silent no-op, and into explicit `manual:OWNER` checks that record observed behaviour rather than asserting it."
  },
  "delta": {
    "step": 4,
    "today": "The musician practises while the block runs, pausing and resuming as needed, and the screen shows the elapsed clock. Nothing asks the device to keep the display awake, so on a phone the screen dims and locks mid-block and the clock is simply not there to glance at. Reaching the 10-minute target changes nothing at all: the ring silently saturates at full (`Math.min(elapsed / targetSeconds, 1)`) and the readout keeps counting with no indication that the intended time has arrived.",
    "instead": "While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.",
    "keep": [
      "Elapsed seconds still accumulate only while the timer runs, from the wall clock, exactly as now.",
      "Finish still freezes the clock before the close screen, so reflection time is not counted.",
      "The review date shown before saving is still exactly the date saved.",
      "Starting a block stays under 30 seconds; nothing new is required of the user to get the screen to stay awake.",
      "Practising is still the only thing that completes a review and advances spaced repetition."
    ],
    "assumptions": [
      "Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is established by an OWNER device check, not asserted by this contract; the implementation feature-detects and degrades to a silent no-op.",
      "The specification requires the platform to release a wake lock when the document becomes hidden, so reacquiring on return to visible is mandated behaviour rather than a browser-specific workaround."
    ],
    "showMe": "On the iPhone with the app installed: start a block at the shortest real preset (5 minutes) from Today, put the phone face-up on the music stand and do not touch it. The display stays on for the whole block; at 5:00 the screen visibly changes to say the target is reached and starts counting overtime; the block is still running and waiting for you to Finish. Tap Pause and leave it: the phone now sleeps normally, and when you wake it the elapsed time has not moved."
  },
  "desiredRules": [
    "While a practice clock is genuinely running and on screen, the app asks the device to keep the display awake and announces the intended end exactly once — and whether that succeeds, fails or is unsupported never changes a single recorded minute."
  ],
  "docsDelta": [
    "Add a section to CLAUDE.md (and the identical AGENTS.md) stating the hands-free invariant: while a practice clock is running AND its screen is visible, the app holds a screen wake lock; pause, finish, discard, unmount and hidden all release it; there is exactly one owner of the lock (`useScreenAwake`) so two can never be held at once; reacquisition on `visibilitychange` is required by the Screen Wake Lock specification, not a browser workaround; and no wake-lock outcome may ever influence elapsed time.",
    "Document the announcement policy in both files: `nextSignal`/`acknowledgeThrough`/`shouldKeepAwake` in `src/domain/practiceSignal.ts` are pure and tested; the marker is a COUNT OF BOUNDARIES ALREADY ANNOUNCED living on the store's ephemeral `active`/`activeRoutine` (never in `PracticeDB`, so no schema bump, no migration, and never synced or backed up); an absent marker reads as nothing announced yet; a multi-boundary catch-up announces ONCE and advances the marker to the boundary actually reached; and a deliberate Skip acknowledges without announcing.",
    "Record that the visual state change is the guaranteed signal and that audio/vibration are feature-detected best-effort only — with the reasons: `navigator.vibrate` is unimplemented in Safari on iOS, and the WebAudio unlock gesture lives on the pages that START a block rather than on the practice screen, which hands-free practice by definition never taps.",
    "Record that an ordinary block never auto-finishes at its target: reaching the target announces and begins counting overtime, and only the user's Finish or Discard ends a block.",
    "Record the secure-context constraint in both files: Screen Wake Lock needs a secure context, so plain-HTTP LAN serving cannot exercise it and a device check must confirm `window.isSecureContext` and `'wakeLock' in navigator` before concluding anything about the implementation.",
    "Note in both files that there is no branch-preview deployment (deploy.yml publishes on main only), so any future wake-lock or other secure-context-dependent work must establish an HTTPS route for device testing before device acceptance can be claimed."
  ]
}
```
````

## The Delta this change was framed from

# While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

_approved · about "practise-todays-recommendation" step 4_

## Today

The musician practises while the block runs, pausing and resuming as needed, and the screen shows the elapsed clock. Nothing asks the device to keep the display awake, so on a phone the screen dims and locks mid-block and the clock is simply not there to glance at. Reaching the 10-minute target changes nothing at all: the ring silently saturates at full (`Math.min(elapsed / targetSeconds, 1)`) and the readout keeps counting with no indication that the intended time has arrived.

## Instead

While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

## Keep

- Elapsed seconds still accumulate only while the timer runs, from the wall clock, exactly as now.
- Finish still freezes the clock before the close screen, so reflection time is not counted.
- The review date shown before saving is still exactly the date saved.
- Starting a block stays under 30 seconds; nothing new is required of the user to get the screen to stay awake.
- Practising is still the only thing that completes a review and advances spaced repetition.

## New assumptions

- Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is established by an OWNER device check, not asserted by this contract; the implementation feature-detects and degrades to a silent no-op.
- The specification requires the platform to release a wake lock when the document becomes hidden, so reacquiring on return to visible is mandated behaviour rather than a browser-specific workaround.

## Show me

On the iPhone with the app installed: start a block at the shortest real preset (5 minutes) from Today, put the phone face-up on the music stand and do not touch it. The display stays on for the whole block; at 5:00 the screen visibly changes to say the target is reached and starts counting overtime; the block is still running and waiting for you to Finish. Tap Pause and leave it: the phone now sleeps normally, and when you wake it the elapsed time has not moved.



## Files in this diff

- AGENTS.md
- CLAUDE.md
- src/components/screenAwake.test.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/domain/index.ts
- src/domain/practiceSignal.test.ts
- src/domain/practiceSignal.ts
- src/domain/routines.test.ts
- src/domain/routines.ts
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/store/useStore.ts
- src/styles/global.css

## Check against the contract

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

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

This lane only adds an ephemeral signalledThrough marker to ActiveSession/ActiveRoutine in useStore.ts (never PracticeDB) and the wake-lock/announcement glue on ActiveBlock/RoutineRunner. PracticeItem's own shape, fields and repertoire grouping are untouched — the shared entity is coincidental to useStore.ts being a single large file.

## install-the-app-and-keep-it-current — unchanged

This lane adds no PWA manifest, service-worker, or install-prompt changes (explicitly excluded). The shared /settings route is coincidental to useStore.ts being a single large file; no Settings UI or update-banner behaviour changed.

## point-this-device-at-the-nas — unchanged

No NAS base URL, recordings, or Settings NAS UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file.

## prepare-for-the-next-class — unchanged

No lesson, teacherQuestion, or assignedForLesson logic was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file — this lane's only PracticeItem-adjacent change is an ephemeral, never-persisted-to-PracticeDB signal marker on the active session/routine, unrelated to lesson prep.

## see-practice-patterns — unchanged

No insights/report aggregation code was touched. The shared PracticeItem entity is coincidental to useStore.ts being a single large file.

## sync-devices-via-github — unchanged

No sync engine, GitHub transport, or Settings sync UI code was touched. The shared /settings route is coincidental to useStore.ts being a single large file; the new signalledThrough marker lives only on ephemeral active/activeRoutine state, which was never synced before and still is not.

## work-a-pathway-stage — truth-proposed

RoutineRunner now holds a screen wake lock and visibly announces a segment boundary instead of swapping silently; filed as an update proposal (.prismatica/flows/proposals/work-a-pathway-stage.md) that also corrects the stale 'not logged as practice' wording in the Guided routine variation.

## run-a-session-plan — truth-proposed

Session Plan segments run as ordinary blocks on /active, which now gain the same wake-lock and target-reached announcement as an unplanned block; filed as an update proposal (.prismatica/flows/proposals/run-a-session-plan.md) updating step 4's description.

## practise-todays-recommendation — truth-proposed

Step 4 now states the screen wake lock and target-reached/overtime announcement, carrying the already-approved Delta's wording into the flow's own truth via an update proposal (.prismatica/flows/proposals/practise-todays-recommendation.md).


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 code inferred

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 code inferred

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 code inferred

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
  Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
    Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes and current problem on request.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app holds a screen wake lock so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it. Reaching the target visibly announces it once, with a growing overtime figure — the block does not auto-finish.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
  The musician Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
    Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.
  The musician Taps 'Save block'.
    Shows: Back to Today (or to the running plan), with the item's stats and status updated.
    Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
  Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
    Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.
  The musician Swaps, removes or regenerates segments until the shape looks right.
    Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
    Changes: Only a local copy of the plan — nothing is saved yet.
  The musician Taps 'Start plan'.
    Shows: The runner: the whole list with the current segment highlighted.
    Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
− The musician Taps 'Start' on the current segment.
−   Shows: The ordinary active-block screen, with the segment's minutes as the target.
−   Changes: A real practice block opens for that segment's item.
+ The musician Taps 'Start' on the current segment.
+   Shows: The ordinary active-block screen, with the segment's minutes as the target — the screen stays awake while it runs, and reaching the segment's minutes visibly announces the target reached (with a growing overtime figure) rather than counting on unremarked.
+   Changes: A real practice block opens for that segment's item.
  The musician Finishes and saves the block as usual.
    Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
    Changes: The block, item stats and review schedule update exactly as in an unplanned block.
  The musician Skips anything they do not want, or ends the plan at any time.
    Shows: 'Session complete' once the last segment is passed.
    Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260830-hands-free-practice-the-screen-stays-awa-65dd' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260830-hands-free-practice-the-screen-stays-awa-65dd/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
