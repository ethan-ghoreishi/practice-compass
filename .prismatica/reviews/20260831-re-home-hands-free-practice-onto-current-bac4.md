---
id: 20260831-re-home-hands-free-practice-onto-current-bac4
contractId: 20260831-re-home-hands-free-practice-onto-current-bac4
patchId: 2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab
reviewer: claude
state: sealed
verdict: request_changes
findings:
  - family: flow-truth-reapproval
    summary: The three Flows the approved plan itself named as needing truth
      reapproval for this lane's new observable behaviour —
      practise-todays-recommendation, work-a-pathway-stage, run-a-session-plan —
      were not actually updated to describe it. No touchpoint in any of them
      mentions the Screen Wake Lock, the durable target-reached/overtime state,
      or the segment-arrival cue.
    counterexample: grep -n "wake\|overtime\|target reached\|announc"
      .prismatica/flows/practise-todays-recommendation.md
      .prismatica/flows/work-a-pathway-stage.md
      .prismatica/flows/run-a-session-plan.md returns zero matches, even though
      src/pages/ActiveBlock.tsx now renders a durable 'Target reached ·
      +overtime' state and src/pages/RoutineRunner.tsx now renders a 'New
      segment · ...' arrival cue — both new, user-visible states this lane
      added.
  - family: stale-flow-wording-not-corrected
    summary: The plan's own possibleConflicts explicitly required correcting
      work-a-pathway-stage.md's stale sentence that a guided routine is
      'explicitly not logged as practice' during this lane's reapproval, since
      bound routine segments already create honest PracticeBlocks. That exact
      stale sentence is still present, uncorrected, in the shipped diff, and now
      directly contradicts CLAUDE.md/AGENTS.md's own new Hands-free section in
      this same commit.
    counterexample: ".prismatica/flows/work-a-pathway-stage.md lines 77-78 and 179
      still read 'A stage routine runs as a segmented warm-up countdown that is
      explicitly not logged as practice', while CLAUDE.md (this diff) and the
      pre-existing Routines section both state bound segments create real,
      honest PracticeBlocks (result: 'not_logged' is a review/SM-2 flag, not an
      absence of a logged block)."
  - family: unverified-flow-evidence
    summary: "Every 'method: manual' evidence stamp added across all 14 touched Flow
      files cites a commit hash that is not an ancestor of this lane's own
      branch, and the entire .prismatica/flows/ directory in this commit is
      byte-identical to current main's tip — indicating this 'reapproval'
      evidence was carried over unchanged from an unrelated main-branch
      maintenance process ('approve pending Atlas records') rather than produced
      by genuinely re-verifying this change's own new behaviour."
    counterexample: git diff HEAD main -- .prismatica/flows/ is empty; git
      merge-base --is-ancestor 017d8c3385210b8e4ec217183390ce22c487eb19 HEAD
      fails (not an ancestor), yet practise-todays-recommendation.md,
      run-a-session-plan.md and work-a-pathway-stage.md all cite that commit as
      the 'manual' verification evidence for steps this lane changed.
createdAt: 2026-08-31T19:56:11.632Z
sealedAt: 2026-08-31T20:22:50.984Z
---

# Review: Re-home hands-free practice onto current main

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260831-re-home-hands-free-practice-onto-current-bac4
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/10
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `2f48e0c32a3ffbea8667aafb0bb2e3466dca05ab`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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

## browse-my-repertoire — unchanged

--none

## install-the-app-and-keep-it-current — unchanged

--none

## point-this-device-at-the-nas — unchanged

--none

## prepare-for-the-next-class — unchanged

--none

## see-practice-patterns — unchanged

--none

## sync-devices-via-github — unchanged

--none

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

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/RoutineRunner.tsx, src/store/useStore.ts matched changed file(s) src/pages/RoutineRunner.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

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

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260831-re-home-hands-free-practice-onto-current-bac4/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
