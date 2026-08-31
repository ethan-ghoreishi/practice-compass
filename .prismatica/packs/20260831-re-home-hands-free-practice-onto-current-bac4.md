---
id: 20260831-re-home-hands-free-practice-onto-current-bac4
contractId: 20260831-re-home-hands-free-practice-onto-current-bac4
contractHash: 8d669890e06d5a0e368c9c46b375175723bf5af573ae7b9f9f8a878e93a01401
createdAt: 2026-08-31T15:49:25.899Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Re-home hands-free practice onto current main

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/10
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260831-re-home-hands-free-practice-onto-current-bac4

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Re-home hands-free practice onto current main

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Replace the completed but Git-conflicted Prismatica change `20260830-hands-free-practice-the-screen-stays-awa-65dd` by re-homing its exact reviewed non-Prismatica patch onto current clean main. This is recovery, not product redesign. Preserve the final hands-free-practice behaviour, invariants, allowed product and documentation scope, non-goals, exact named automated checks, OWNER device checks, docsDelta of exactly `CLAUDE.md` and `AGENTS.md`, and the same Flow truth obligations. Do not copy the superseded lane’s contracts, intents, deltas, packs, reports, proposals, Check evidence, reviews, decisions, ledger rows or other lifecycle/proof records. The implementation input is `/private/tmp/hands-free-practice-65dd.patch`, whose stable patch ID is `2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab`; apply that exact patch after lane creation and fail rather than redesign if it no longer applies. The replacement must run its own deterministic Check, fresh review and required OWNER decision before shipping. Keep old PR #9 open until the replacement is proven, then close it as superseded and never merge it.

## Why

The completed implementation cannot merge because the old lane and the Prismatica 0.6.0 consumer-update lane appended independent legitimate rows at the same ancestral ledger EOF. GitHub therefore reports the old PR as DIRTY even after its ledger content was reconciled. Current main contains no overlapping product-code change and the exact reviewed patch applies cleanly, so the smallest safe recovery is a fresh fixed-baseline lane from current main that replays only that non-record patch and proves it again.

## Today

Current main still has the pre-change practice experience: neither ActiveBlock nor RoutineRunner requests a Screen Wake Lock, ordinary blocks pass their target without a durable target-reached/overtime state, and routine segment boundaries change without the intended hands-free signal. The completed old lane contains the desired implementation but PR #9 cannot merge because its branch history conflicts with concurrent append-only Prismatica ledger history.

## Instead

Replay the exact preserved non-Prismatica patch onto current main. While an ordinary or routine practice clock is genuinely running and its screen is visible, hold one best-effort Screen Wake Lock; release it on pause, finish, discard, unmount or hidden state and reacquire on return to visible. Announce each intended target or routine boundary at most once using a persisted ephemeral boundary-count marker, with correct multi-boundary catch-up and silent Skip acknowledgement. Guarantee a neutral visible state change: ordinary blocks show durable target reached plus growing overtime without auto-finishing, routine arrivals remain perceptible for a defined window, and routine completion remains durable. Wake-lock, audio or vibration outcomes never affect elapsed time or saved minutes.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Verified on current clean main at f5149fa2ab017af69357d02cb4fd5c839eb5f22a: `/private/tmp/hands-free-practice-65dd.patch` applies cleanly with `git apply --check`; its 14 changed paths exactly match this proposal’s allowed scope, so no product-code overlap or redesign is currently required.
- The preserved patch is the old lane’s non-Prismatica diff only, with stable patch ID 2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab. No old lifecycle or proof record is an implementation input.
- The Screen Wake Lock API requires a secure context and the repository still has no branch-preview deployment; OWNER device checks must first establish a genuine HTTPS route and confirm `window.isSecureContext === true` and `"wakeLock" in navigator`.
- Wake lock, audio and vibration remain feature-detected best-effort capabilities. The guaranteed signal is visual; device-specific behaviour is recorded only by OWNER checks.
- `ActiveSession` and `ActiveRoutine` remain store-level ephemeral state rather than PracticeDB schema, so the optional marker requires no schema version change or data migration.

**Possible conflicts**

- The original change remains open at PR #9 in stage ship. It is superseded evidence only: keep it open until this replacement is proven, then close it as superseded and never merge or copy its Prismatica records.
- Three existing Flows change observably and require truth proposals/reapproval in this replacement lane: `practise-todays-recommendation` for ordinary blocks, `work-a-pathway-stage` for RoutineRunner, and `run-a-session-plan` because plan segments use ActiveBlock.
- `work-a-pathway-stage` currently contains stale wording that a guided routine is not logged as practice, although bound routine segments already create honest PracticeBlocks. Correct that Flow truth during reapproval; do not change routine logging to match the stale sentence.
- The optional signal marker survives Zustand persistence but never enters PracticeDB, sync or backups; an absent marker must continue to mean that no boundary has yet been announced.
- Skip can create zero-length or repeated cumulative boundaries, so acknowledgement must clear every boundary at or before elapsed without treating zero or equality as malformed.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Replace the completed but Git-conflicted Prismatica change `20260830-hands-free-practice-the-screen-stays-awa-65dd` by re-homing its exact reviewed non-Prismatica patch onto current clean main. This is recovery, not product redesign. Preserve the final hands-free-practice behaviour, invariants, allowed product and documentation scope, non-goals, exact named automated checks, OWNER device checks, docsDelta of exactly `CLAUDE.md` and `AGENTS.md`, and the same Flow truth obligations. Do not copy the superseded lane’s contracts, intents, deltas, packs, reports, proposals, Check evidence, reviews, decisions, ledger rows or other lifecycle/proof records. The implementation input is `/private/tmp/hands-free-practice-65dd.patch`, whose stable patch ID is `2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab`; apply that exact patch after lane creation and fail rather than redesign if it no longer applies. The replacement must run its own deterministic Check, fresh review and required OWNER decision before shipping. Keep old PR #9 open until the replacement is proven, then close it as superseded and never merge it.",
  "builder": "claude",
  "summary": "Re-home hands-free practice onto current main",
  "rationale": "The completed implementation cannot merge because the old lane and the Prismatica 0.6.0 consumer-update lane appended independent legitimate rows at the same ancestral ledger EOF. GitHub therefore reports the old PR as DIRTY even after its ledger content was reconciled. Current main contains no overlapping product-code change and the exact reviewed patch applies cleanly, so the smallest safe recovery is a fresh fixed-baseline lane from current main that replays only that non-record patch and proves it again.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "Current main still has the pre-change practice experience: neither ActiveBlock nor RoutineRunner requests a Screen Wake Lock, ordinary blocks pass their target without a durable target-reached/overtime state, and routine segment boundaries change without the intended hands-free signal. The completed old lane contains the desired implementation but PR #9 cannot merge because its branch history conflicts with concurrent append-only Prismatica ledger history.",
  "desiredBehaviour": "Replay the exact preserved non-Prismatica patch onto current main. While an ordinary or routine practice clock is genuinely running and its screen is visible, hold one best-effort Screen Wake Lock; release it on pause, finish, discard, unmount or hidden state and reacquire on return to visible. Announce each intended target or routine boundary at most once using a persisted ephemeral boundary-count marker, with correct multi-boundary catch-up and silent Skip acknowledgement. Guarantee a neutral visible state change: ordinary blocks show durable target reached plus growing overtime without auto-finishing, routine arrivals remain perceptible for a defined window, and routine completion remains durable. Wake-lock, audio or vibration outcomes never affect elapsed time or saved minutes.",
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
    "The routine segment-boundary announcement is never a single-render flash. It persists for a defined presentation interval or is carried by durable on-screen state, and the ordinary block's target-reached and overtime state stays durable for as long as the block runs.",
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
  "assumptions": [
    "Verified on current clean main at f5149fa2ab017af69357d02cb4fd5c839eb5f22a: `/private/tmp/hands-free-practice-65dd.patch` applies cleanly with `git apply --check`; its 14 changed paths exactly match this proposal’s allowed scope, so no product-code overlap or redesign is currently required.",
    "The preserved patch is the old lane’s non-Prismatica diff only, with stable patch ID 2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab. No old lifecycle or proof record is an implementation input.",
    "The Screen Wake Lock API requires a secure context and the repository still has no branch-preview deployment; OWNER device checks must first establish a genuine HTTPS route and confirm `window.isSecureContext === true` and `\"wakeLock\" in navigator`.",
    "Wake lock, audio and vibration remain feature-detected best-effort capabilities. The guaranteed signal is visual; device-specific behaviour is recorded only by OWNER checks.",
    "`ActiveSession` and `ActiveRoutine` remain store-level ephemeral state rather than PracticeDB schema, so the optional marker requires no schema version change or data migration."
  ],
  "possibleConflicts": [
    "The original change remains open at PR #9 in stage ship. It is superseded evidence only: keep it open until this replacement is proven, then close it as superseded and never merge or copy its Prismatica records.",
    "Three existing Flows change observably and require truth proposals/reapproval in this replacement lane: `practise-todays-recommendation` for ordinary blocks, `work-a-pathway-stage` for RoutineRunner, and `run-a-session-plan` because plan segments use ActiveBlock.",
    "`work-a-pathway-stage` currently contains stale wording that a guided routine is not logged as practice, although bound routine segments already create honest PracticeBlocks. Correct that Flow truth during reapproval; do not change routine logging to match the stale sentence.",
    "The optional signal marker survives Zustand persistence but never enters PracticeDB, sync or backups; an absent marker must continue to mean that no boundary has yet been announced.",
    "Skip can create zero-length or repeated cumulative boundaries, so acknowledgement must clear every boundary at or before elapsed without treating zero or equality as malformed."
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
    "Do not copy any `.prismatica` lifecycle, proof or proposal artefact from the superseded lane.",
    "Do not redesign, expand or opportunistically refactor the implementation. Apply the preserved non-record patch exactly; if current main moves and the patch no longer applies, stop and report the overlap.",
    "Do not merge or rebase current main into the superseded lane, and do not merge old PR #9."
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
    "rationale": "The patch adds an optional marker to persisted ephemeral active-session and active-routine state and touches the two load-bearing practice clocks. It must prove compatibility with sessions saved before the marker existed, preserve elapsed-time and routine-block accounting exactly, and keep the marker outside PracticeDB, schema migrations, sync and backups."
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
    "While a practice clock is genuinely running and on screen, the app asks the device to keep the display awake and announces the intended end exactly once; whether that succeeds, fails or is unsupported never changes a recorded minute."
  ],
  "docsDelta": [
    "CLAUDE.md",
    "AGENTS.md"
  ]
}
```
````

## The approved Delta this change must deliver

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


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

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

---

# Practise what the app suggests

_Works now · approved 2026-08-28T13:30:17.983Z by Ethan (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Run a time-budgeted session

_Works now · approved 2026-08-28T13:30:18.043Z by Ethan (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# Work through a pathway stage

_Works now · approved 2026-08-28T13:30:18.134Z by Ethan (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown that is explicitly not logged as practice. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Re-home hands-free practice onto current main

## Stay in scope — you may ONLY change

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

Never touch:

- Any change in src/styles/global.css to the selectors .grid-2, .option, .options, .input, .textarea, .select, or to the `@media (max-width: 340px)` block. Those are the deferred layout lane's territory; the ONLY CSS permitted here is new rules for the target-reached / overtime state.
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
- Do not copy any `.prismatica` lifecycle, proof or proposal artefact from the superseded lane.
- Do not redesign, expand or opportunistically refactor the implementation. Apply the preserved non-record patch exactly; if current main moves and the patch no longer applies, stop and report the overlap.
- Do not merge or rebase current main into the superseded lane, and do not merge old PR #9.
- Desired rule (not yet truth): While a practice clock is genuinely running and on screen, the app asks the device to keep the display awake and announces the intended end exactly once; whether that succeeds, fails or is unsupported never changes a recorded minute.

## Definition of done

- **ac-1** — A clock that jumps across several segment boundaries at once (a backgrounded or locked phone waking up) announces ONCE, not once per boundary crossed. This is the counterexample that fails a per-tick implementation. → proven by `announces once when the clock jumps across several boundaries at once`
- **ac-2** — That same jump advances the marker to the number of boundaries ACTUALLY passed, not by one — so the next call does not re-announce the boundaries it skipped over. → proven by `advances the marker to the boundary actually reached, not by one`
- **ac-3** — An ordinary block's single target boundary announces exactly once; every later call at or beyond the target announces nothing. Fails if the implementation re-derives 'past target' each render instead of remembering. → proven by `announces an ordinary block target exactly once and never again`
- **ac-4** — Pausing across the target and resuming does not re-announce, because the marker persists rather than being rebuilt from the running state. → proven by `does not announce again after pausing across the target and resuming`
- **ac-5** — An absent marker (a session persisted before this change) reads as nothing announced yet, rather than throwing or silently swallowing a real boundary. → proven by `treats an absent marker as nothing announced yet`
- **ac-6** — Nothing is announced while elapsed has not yet reached the first boundary. → proven by `announces nothing before the first boundary is reached`
- **ac-7** — Once every boundary has been announced, further calls stay silent no matter how far elapsed runs past the end — an overrunning routine never announces repeatedly. → proven by `stays silent once every boundary has been announced`
- **ac-8** — The last boundary is reported as final and an intermediate one is not, so routine completion and a mere segment change are distinguishable by the caller. → proven by `reports the final boundary distinctly from an intermediate one`
- **ac-9** — A deliberate Skip advances the marker WITHOUT announcing, so the user is never told about a segment they chose to end themselves. Fails if skip routes through the announcing path. → proven by `advances the marker without announcing when a segment is skipped`
- **ac-10** — After a skip has clamped the current segment onto the elapsed value, the very next signal check stays silent — the concrete regression the acknowledge path exists to prevent. → proven by `stays silent on the boundary a skip has just clamped into place`
- **ac-11** — The announcement boundaries are the same numbers locateClock segments by, for the same run — including after a skip has clamped a segment. Fails if a second cumulative sum is computed independently and drifts. → proven by `exposes the same segment boundaries the clock advances on`
- **ac-12** — The screen is kept awake only while a clock is genuinely running AND its screen is visible. → proven by `keeps the screen awake only while a clock is running and visible`
- **ac-13** — A paused clock releases the screen — pausing to talk to a teacher lets the phone sleep normally. → proven by `does not keep the screen awake while the clock is paused`
- **ac-14** — A hidden document keeps nothing, so a backgrounded tab never holds a lock. → proven by `does not keep the screen awake while the document is hidden`
- **ac-15** — With no clock at all — including a frozen, non-running clock left by a legacy dual-clock hydration — nothing is held. → proven by `does not keep the screen awake when no clock is running`
- **ac-16** — The existing suite still passes in full — in particular every routines, scheduling, plan and migrations test — proving elapsed accounting, one-block-per-item aggregation and the single-clock guards are untouched. 267 tests pass at HEAD; the count must only grow. → proven by `aggregates a repeated segment into one block per item, not one per segment`
- **ac-17** — A routine that repeats one item four times still leaves that item unsaturated — proof this lane did not disturb block creation or the scoring family while adding the announcement. → proven by `leaves an item unsaturated after a routine that repeats it four times`
- **ac-18** — OWNER DEVICE CHECK — RUN THIS FIRST, BEFORE ANY OTHER DEVICE CHECK. The Builder must already have handed you a runnable procedure naming (a) the secure-context mechanism, (b) the exact steps to expose this lane's build to the iPhone, (c) the exact HTTPS URL, and (d) exactly how to read the two values below on the phone. Note there is no branch-preview deployment in this repo (deploy.yml runs on main only), so this route has to be established, not looked up. Open that URL on the iPhone and confirm `window.isSecureContext === true` and `'wakeLock' in navigator` is true. If either is false, STOP: the environment cannot exercise this lane, every remaining wake-lock device check is ENVIRONMENT-BLOCKED rather than failed, and device acceptance may not be recorded as complete. → proven by `manual:OWNER`
- **ac-19** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a block at the shortest REAL selectable target — 5 minutes, the minimum in DURATION_PRESETS; do not add a 1-minute option for testing — put the phone face-up on the music stand and DO NOT TOUCH IT. After 5.5 minutes confirm: (a) the display never dimmed or locked; (b) the screen shows the target-reached state with an overtime figure counting up; (c) the block did NOT auto-finish. Record whether any sound was heard. → proven by `manual:OWNER`
- **ac-20** — OWNER DEVICE CHECK (iPhone, installed PWA). Start a routine whose first two segments are 1 minute each, put the phone down and DO NOT TOUCH IT. Confirm the display stays on and the arrival at segment 2 is visibly announced without any interaction. Record whether any sound or vibration occurred. → proven by `manual:OWNER`
- **ac-21** — OWNER DEVICE CHECK (iPhone). Mid-block, tap Pause and put the phone down for 2 minutes. Confirm the display is allowed to sleep normally, then wake it and confirm the elapsed time did NOT advance during the pause. → proven by `manual:OWNER`
- **ac-22** — OWNER DEVICE CHECK (iPhone). Mid-block, switch to another app for 60 seconds, then return. Confirm the display stays awake again on return (the spec-mandated release-on-hidden is reacquired), and that elapsed reflects the full real wall-clock interval including the time away. → proven by `manual:OWNER`
- **ac-23** — OWNER DEVICE CHECK (leak check, iPhone). From a running block, exercise each exit in turn — Finish then Save, Finish then Discard, Discard block, and a nav-bar tap away — and after each confirm the phone sleeps normally on Today within its usual auto-lock interval. → proven by `manual:OWNER`
- **ac-24** — OWNER DEVICE CHECK (graceful degradation). Open the app in a browser without Screen Wake Lock support, or with the lock denied (for example on low-power mode), and run a 5-minute block (the shortest real preset). Confirm the timer runs normally, the target-reached state and overtime still appear, no error is shown, and the saved minutes are correct. → proven by `manual:OWNER`
- **ac-25** — An immediate Skip at the very start of a segment produces a zero-length effective segment and announces NOTHING — the user chose to end it and is standing at the screen. → proven by `announces nothing when a segment is skipped immediately at zero elapsed`
- **ac-26** — That immediate skip still advances the marker PAST the zero-duration boundary it created, so the boundary is never left behind to be announced on a later render. → proven by `advances the marker past a zero-duration boundary created by an immediate skip`
- **ac-27** — Several immediate skips in a row create several equal cumulative boundaries and all of them stay silent — acknowledgeThrough clears every boundary at or before the elapsed value, not just one. → proven by `stays silent across repeated zero-time skips`
- **ac-28** — After skipping, the next genuinely elapsed segment boundary still announces normally. This is the counterexample that fails an implementation which treats a zero boundary as malformed and disables the rest of the run. → proven by `still announces the next genuinely elapsed boundary after a skip`
- **ac-29** — An empty boundary list, and genuinely malformed input (negative, NaN, or out-of-order values), announce nothing and leave the marker alone — without classifying a legitimate skip-produced zero as malformed. → proven by `announces nothing for an empty or malformed boundary list`
- **ac-30** — At most one request is outstanding and at most one sentinel held, however many times the coordinator is re-enabled. → proven by `holds at most one sentinel and never stacks requests`
- **ac-31** — A rejected acquisition is harmless: no throw escapes, no state is corrupted, and a later enable can still acquire. → proven by `treats a rejected wake lock request as harmless`
- **ac-32** — Disabling while a request is still in flight releases the sentinel that resolves afterwards instead of holding it — the pending-acquisition leak. → proven by `releases a sentinel that resolves after the coordinator was disabled`
- **ac-33** — Unmounting or disabling while a sentinel is held releases it exactly once. → proven by `releases a held sentinel exactly once when disabled`
- **ac-34** — Hidden releases, and returning to visible while the clock still qualifies reacquires exactly once — not zero times, not twice. → proven by `reacquires exactly once when the document becomes visible again`
- **ac-35** — Rapid visibility and pause/resume churn neither stacks requests nor leaves a stale sentinel held once the churn settles. → proven by `leaks no sentinel across rapid visibility and pause churn`
- **ac-36** — OWNER DEVICE CHECK (perceptibility). During a routine, deliberately look away from the phone across a segment boundary and glance back a few seconds later. Confirm it is still apparent that the segment changed — a cue that has already vanished by the time you look up fails this check. → proven by `manual:OWNER`

## Docs to update as part of this change

- CLAUDE.md
- AGENTS.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

