---
id: 20261014-give-works-real-plan-time-make-sound-and-d492
contractId: 20261014-give-works-real-plan-time-make-sound-and-d492
contractHash: 34000943dbe248af8b43fc76d7d10990e7a76428355b8d520fe33154a6b3fc6e
createdAt: 2026-10-14T01:14:55.471Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Give works real plan time, make sound and updates recover, and capture item changes after practice

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/51
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261014-give-works-real-plan-time-make-sound-and-d492

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Give works real plan time, make sound and updates recover, and capture item changes after practice

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan one coherent Practice Compass lane for these observed problems, starting from the current code and product flows rather than assuming the solution:
> 
> - Setar/Tar session plans sometimes give practice items only ~2–3 minutes. For Persian repertoire this can be too short to practise meaningfully, especially Setar. Reassess the planning/allocation logic for Setar and Tar while preserving sensible use of the total session time and avoiding arbitrary rules.
> - Practice sound on Mac is unreliable: sometimes it works, sometimes it stops working until the app is closed and reopened. Find the real failure family rather than patching one trigger.
> - On Mac, “A new version is ready” can return repeatedly even after pressing Reload several times (not sure if this issue happens on the iphone version). Diagnose the update/service-worker lifecycle and make updating reliable without creating reload loops or stale-version states.
> - After practising an item, the Save/Close block flow may be the natural moment to revise item state such as Status (and assess whether Primary focus, Personal priority / Current effort belong there too). Design the smallest useful post-practice editing experience rather than simply copying the repertoire edit form.
> - Routine plans currently finish without an equivalent chance to capture what the routine items showed. Assess whether routine items should support the same “A few seconds to capture what happened” concept, a lighter variant, or no extra step if that would harm the routine flow.
> 
> Prefer one coherent lane if these issues can be solved together cleanly; split only for a real technical or governance reason. Preserve the core Practice Compass principles: quick start/close, local-first behaviour, deterministic planning, no fake practice history, no unnecessary friction, and no change to unrelated product behaviour.
> 
> Agreed while planning:
> - Builder: Claude.
> - Plan floor: a whole work (gusheh, piece, anything with dastgāh/form/composer) never gets less than the app's existing 10-min standard block in a multi-item plan. Drills, technique and passages keep the 2-min floor. Fewer, longer segments; warm-up/cool-down never take a work below 10 or soak up leftovers. Same rule for Guitar pieces. No new setting.
> - Close screen: “Status + Primary focus + Current effort. These are the fields most likely to change as a direct result of the practice that just happened. Keep them in an optimal way that Close remains fast. Leave Personal priority to the full item edit screen, since that is a broader planning decision rather than an immediate practice outcome.”
> - Sound clue: “Not sure if it is due to the following but out of the above options, this might be the only one (if this is the reason): the app sat idle for a long time between blocks.”

## Why

One lane: the five reports meet in the practise→close loop, the plan that feeds it, the routine that parallels it and the banner over all of them. They share useStore.ts, CloseBlock/RoutineRunner, practiceCue.ts, Layout.tsx and five AGENTS.md rules with 9 bytes of headroom, so separate lanes would collide on the same files and budget; none needs a schema change or a new Flow, so there is no technical or governance reason to split. Each fix sits at the layer the evidence names: the plan allocator (material-blind floors, optional roles absorbing overflow), the sound context lifecycle (a dead context is never replaced), the update controller and build stamp (workbox-window heuristics, per-commit stamps), and two capture surfaces that reuse existing writes (closeSession's status path, the routine's own blocks). Routine capture is the assessed lighter variant: it happens after the clock stops, so it cannot harm the routine, and a full close per item would turn one finish into several forms.

## Today

1. Plans: allocateMinutes floors every segment at 2 min whatever the material. The warm-up is pinned at round(B×0.12) (2 min at 15–20, 3 at 25) and the cool-down's low weight leaves it 2–6 min, so the familiar gushehs and pieces Setar fills those roles with get 2–3 minutes (docs/scheduling-evidence.md's own 20-minute example warms up on a darāmad for 2). Review minutes above reviewSlotMax overflow into the cool-down: a synthetic Setar library with many due reviews plans 20 min as warm-up 2 / review 7 / cool-down 11 and 40 min as 5/7/7/21. The segment count comes from a budget table alone; Remove re-spreads the same way.
2. Sound: practiceCue.ts keeps one page-lifetime AudioContext. A tap resumes it only when its state is not 'running' and replaces it only when 'closed', so a context left 'running' but silent, or 'suspended'/'interrupted' in a way resume() cannot clear (the owner's clue: long idle between blocks), is reused by every later Start and the cue stays silent until the app is reopened. The tests' stand-in only models a resume() that works.
3. Updates: Layout's UpdateBanner uses vite-plugin-pwa's useRegisterSW (workbox-window). Reproduced by the planner on a production build in Playwright Chromium and WebKit: on an uncontrolled page (first launch after install, or after a hard reload) an update shows the banner with no waiting worker and Reload does nothing however often it is tapped; with two windows open, Reload in one silently reloads the other. Controlled single-window updates, and a newer waiting worker superseding an older one, do work. Separately, vite.config.ts stamps HEAD's SHA and the build date into the entry chunk, so every push to main publishes a new service worker, including the records-only 'approve pending Atlas records' pushes that follow most merges (deploy history: a second deploy 6–60 minutes after merges), and the banner returns with nothing new behind it.
4. Close: status changes only by accepting suggestStatusAfterBlock's suggestion (three cases); Primary focus and Current effort are editable only on the item page.
5. Routines: finishRoutine writes one not_logged block per bound item and Routine complete lists minutes only; what the items showed cannot be recorded.

## Instead

1. Plans (plan.ts; build, Remove and Swap share one allocator). Floors: in a multi-segment plan a segment on a whole work (isWork: a top-level gusheh, full piece or item with Persian identity) gets at least DEFAULT_DURATION_MINUTES (the 10-minute standard block), and no review clamp, Swap or Remove takes it below that; other material keeps MIN_SEGMENT_MINUTES (2); a one-segment plan still takes the whole budget (≤25). Seating: a segment is seated only while every seated segment can still reach its floor; optional roles go first, then the lowest-priority work; the anchor always stays. Optional roles never exceed their share: the warm-up's is its pinned round(B×warmupShare); the cool-down's is its weighted split of the minutes after the warm-up plus at most one rounding minute, computed with it seated. A work fills an optional role only when that share is at least 10; otherwise the role goes to suitable non-work material or is omitted. Overflow: minutes beyond floors and shares go to deep and lesson work first, then to reviews (each up to 25); as today, the review-slot ceiling holds while deep or lesson work can take the minutes; neither review clamping nor capped work ever feeds a warm-up or cool-down; anything left is the existing honest remainder, which therefore still only appears when every seated segment is at 25. Swap offers only candidates whose floor fits the slot; Remove re-allocates under the same rules; the floor is fixed on the segment when planned (an optional field: a running plan persisted before the change has none and still runs). Same rule on every instrument; drill-only plans keep today's minutes exactly wherever no warm-up or cool-down used to absorb overflow and no segment reached 25. docs/scheduling-evidence.md §5 publishes the floor, the optional-role and overflow rules and regenerated representative outputs; Settings' review-slot hints say the ceiling holds while other planned work can use the minutes and that a whole work's review gets at least 10.
2. Sound (practiceCue.ts): every readying tap (Start, Resume on Active, Close and Routine, Test practice sound, Turn on sound) closes the page's current context and creates and resumes a fresh one synchronously inside that tap, so a dead context never outlives the next tap. At most one live context; a boundary still plays only on the current running context after a granted claim and never creates, resumes or replays; an older tap's pending Test never plays. The previous lane's sound browser test and its unit companion evolve into this lane's two sound acceptances (renamed, not duplicated); scripts/check-setar-practice-families.mjs (acceptance rows, mutation owners, and the anchor of every mutation whose code this lane edits in practiceCue.ts, useStore.ts and RoutineRunner.tsx) and docs/setar-practice-reliability.md move with them, so tests/setar-practice-proof.test.ts still finds every mutation exactly once with an owner. The stand-in also models a context that starts suspended inside a tap, so dropping the in-tap resume() still fails. New code never duplicates a mutation's find text (for example the store's `set({ db: outcome.db });` / `return null;` anchor).
3. Updates: one app-owned controller replaces useRegisterSW, started with the page rather than with Layout (one registration, one set of listeners and one hourly, foreground and reconnect check per page; injectRegister false; generateSW prompt mode and its SKIP_WAITING handler kept). It is inert outside a production build and absorbs a failed registration calmly, so dev-server journeys see no registration and no page error. Whenever this window runs older code than the newest build the device has found (a waiting worker; a newer worker active since this page loaded, never the first install of this page's own build; or a route whose code an update removed) it shows the existing 'A new version is ready.' with Reload; a missing route shows it in place of the route instead of breaking. Only a Reload tap reloads, only its own window, exactly once, landing on that newest build: SKIP_WAITING first when a worker waits, then reload once the new worker controls or activates; directly otherwise; repeated taps never stack. Nothing else reloads a window: not another window's update, not a missing route. The offer waits while a close is unsaved (/close) and appears right after Save or Discard; it also shows on the refused-hydration screen that asks for an update. The build stamp becomes the date and SHA of the last commit that changed a file the production build reads (src/, public/, index.html, vite.config.ts and the stamp module, tsconfig*.json, package*.json; one list, exported by the stamp module; HEAD when history is shallow; an explicit override wins, for tests and owner checks). With a deterministic build from those inputs, records-, docs- and tests-only pushes publish byte-identical files and so no offer; Settings still names the stamp.
4. Close (CloseBlock, closeSession): one collapsed line under the minutes shows Status · Primary focus · Current effort with Change; an engine-suggested status shows there as the pending change, pre-selected as today. Expanded, it reuses ItemDetail's status pills, ItemForm's focus select (including None) and the effort RatingInput. Edits are saved in the block's single write by key presence (untouched fields are not written; clearing focus is a write). The review decision and its preview use the item as practised, so the date shown is the date saved; the block's own mode and focus are never rewritten. Save and Save without a result keep explicit edits (the engine's suggestion only with a result); Discard writes nothing. Personal priority stays on the item page.
5. Routines: Routine complete optionally records, per recorded item, one of the six results and a one-line observation, written onto that run's own blocks (ids returned by the finish that created them) with acknowledged persistence. lastResult follows only while that block is the item's latest logged one; no review, SM-2 state, date, status or minutes change; nothing is required, and Back leaves the minutes saved. Captured results are real evidence for every result reader (item history, lastResult, the close screen's three-same hint and its suppression of the status suggestion, Insights' repeated and improved cards, the teacher report, class-question context) and never reach the review decision; docs/scheduling-evidence.md §6's routine row says so.
6. AGENTS.md rules change in place (sound context, routine not_logged, plan floor, close edits, update reload and build stamp); CLAUDE.md+AGENTS.md stay ≤32,768 bytes (9 bytes of headroom at base: condense, never drop an anchored prohibition). DECISIONS.md gets a dated entry; docs/setar-practice-reliability.md's sound rows follow the new invariant.

Proof route: Node, `npx vitest run src/domain/plan.test.ts src/domain/blocks.test.ts src/domain/routines.test.ts src/components/practiceCue.test.ts src/components/appUpdate.test.ts tests/app-version.test.ts`, on committed synthetic fixtures with fixed clocks; browsers, `npx vitest run tests/practice-cues.browser.test.ts tests/post-practice.browser.test.ts tests/app-update.browser.test.ts`, in Chromium and WebKit. Limits: fake audio proves context lifecycle, not audibility; a local service worker proves the lifecycle, not GitHub Pages' CDN; both remain OWNER. Before first review, show each family test red on the base commit wherever the base can run it, and show these partial fixes failing their acceptance: a floor on warm-ups only, an instrument-keyed floor, overflow still into the cool-down, renewal only when closed or at a boundary, workbox-window kept with a reload fallback, an automatic reload when a route's code is missing, an offer on a first install, a HEAD-based stamp, a review computed from the edited item, and routine annotation by item instead of block. Stop when every acceptance passes, npm test, lint, typecheck, build and secrets pass, and the three OWNER checks are handed back; rework fixes the named failing row and its family, not wholesale reruns.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The Mac sound failure is a dead AudioContext surviving into later blocks; long idle between blocks is the owner's only clue, and no automation can prove audibility.
- The owner's Mac app may be Safari's Add to Dock or a Chrome-installed app; both engines reproduced the update failures identically, and the fixes are engine-agnostic.
- isWork is the app's existing definition of a musical work, so Tar course drills and passages keep the 2-minute floor while gushehs and pieces on every instrument get 10.
- Routine capture lives on the Routine complete screen only; leaving or reloading that screen forgoes the capture, never the minutes already saved.
- The first update onto this lane's build is still offered by the old banner each device is running; where that page is uncontrolled its Reload may do nothing (the defect fixed here), and closing and reopening the app once installs it. Every later update goes through the new controller.
- 'Newest' means the newest build this device has found (checked hourly, on return to the foreground and on reconnect); a Reload tap never waits on the network.

**Possible conflicts**

- Reverses part of DECISIONS.md 2026-10-05 ('one page-lifetime context'); the owner's report is the new evidence. That lane's family script and proof test pin the sound tests' titles and quote practiceCue.ts code, so they move together (see desired 2).
- AGENTS.md has 9 bytes of headroom and five rules change; condensing must not drop a prohibition tests/agent-context.test.ts anchors.
- Plans change on every instrument with works (Guitar pieces too): fewer, longer segments, and Setar warm-ups mostly disappear below about 80 minutes (at the default 12% share) unless a familiar drill exists.
- Flow text goes stale and is reconciled after building, with no new Flow: practise-todays-recommendation steps 3–6, run-a-session-plan steps 1–2, work-a-pathway-stage's routine finish, install-the-app-and-keep-it-current steps 3–4.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan one coherent Practice Compass lane for these observed problems, starting from the current code and product flows rather than assuming the solution:\n\n- Setar/Tar session plans sometimes give practice items only ~2–3 minutes. For Persian repertoire this can be too short to practise meaningfully, especially Setar. Reassess the planning/allocation logic for Setar and Tar while preserving sensible use of the total session time and avoiding arbitrary rules.\n- Practice sound on Mac is unreliable: sometimes it works, sometimes it stops working until the app is closed and reopened. Find the real failure family rather than patching one trigger.\n- On Mac, “A new version is ready” can return repeatedly even after pressing Reload several times (not sure if this issue happens on the iphone version). Diagnose the update/service-worker lifecycle and make updating reliable without creating reload loops or stale-version states.\n- After practising an item, the Save/Close block flow may be the natural moment to revise item state such as Status (and assess whether Primary focus, Personal priority / Current effort belong there too). Design the smallest useful post-practice editing experience rather than simply copying the repertoire edit form.\n- Routine plans currently finish without an equivalent chance to capture what the routine items showed. Assess whether routine items should support the same “A few seconds to capture what happened” concept, a lighter variant, or no extra step if that would harm the routine flow.\n\nPrefer one coherent lane if these issues can be solved together cleanly; split only for a real technical or governance reason. Preserve the core Practice Compass principles: quick start/close, local-first behaviour, deterministic planning, no fake practice history, no unnecessary friction, and no change to unrelated product behaviour.\n\nAgreed while planning:\n- Builder: Claude.\n- Plan floor: a whole work (gusheh, piece, anything with dastgāh/form/composer) never gets less than the app's existing 10-min standard block in a multi-item plan. Drills, technique and passages keep the 2-min floor. Fewer, longer segments; warm-up/cool-down never take a work below 10 or soak up leftovers. Same rule for Guitar pieces. No new setting.\n- Close screen: “Status + Primary focus + Current effort. These are the fields most likely to change as a direct result of the practice that just happened. Keep them in an optimal way that Close remains fast. Leave Personal priority to the full item edit screen, since that is a broader planning decision rather than an immediate practice outcome.”\n- Sound clue: “Not sure if it is due to the following but out of the above options, this might be the only one (if this is the reason): the app sat idle for a long time between blocks.”",
  "builder": "claude",
  "summary": "Give works real plan time, make sound and updates recover, and capture item changes after practice",
  "rationale": "One lane: the five reports meet in the practise→close loop, the plan that feeds it, the routine that parallels it and the banner over all of them. They share useStore.ts, CloseBlock/RoutineRunner, practiceCue.ts, Layout.tsx and five AGENTS.md rules with 9 bytes of headroom, so separate lanes would collide on the same files and budget; none needs a schema change or a new Flow, so there is no technical or governance reason to split. Each fix sits at the layer the evidence names: the plan allocator (material-blind floors, optional roles absorbing overflow), the sound context lifecycle (a dead context is never replaced), the update controller and build stamp (workbox-window heuristics, per-commit stamps), and two capture surfaces that reuse existing writes (closeSession's status path, the routine's own blocks). Routine capture is the assessed lighter variant: it happens after the clock stops, so it cannot harm the routine, and a full close per item would turn one finish into several forms.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "1. Plans: allocateMinutes floors every segment at 2 min whatever the material. The warm-up is pinned at round(B×0.12) (2 min at 15–20, 3 at 25) and the cool-down's low weight leaves it 2–6 min, so the familiar gushehs and pieces Setar fills those roles with get 2–3 minutes (docs/scheduling-evidence.md's own 20-minute example warms up on a darāmad for 2). Review minutes above reviewSlotMax overflow into the cool-down: a synthetic Setar library with many due reviews plans 20 min as warm-up 2 / review 7 / cool-down 11 and 40 min as 5/7/7/21. The segment count comes from a budget table alone; Remove re-spreads the same way.\n2. Sound: practiceCue.ts keeps one page-lifetime AudioContext. A tap resumes it only when its state is not 'running' and replaces it only when 'closed', so a context left 'running' but silent, or 'suspended'/'interrupted' in a way resume() cannot clear (the owner's clue: long idle between blocks), is reused by every later Start and the cue stays silent until the app is reopened. The tests' stand-in only models a resume() that works.\n3. Updates: Layout's UpdateBanner uses vite-plugin-pwa's useRegisterSW (workbox-window). Reproduced by the planner on a production build in Playwright Chromium and WebKit: on an uncontrolled page (first launch after install, or after a hard reload) an update shows the banner with no waiting worker and Reload does nothing however often it is tapped; with two windows open, Reload in one silently reloads the other. Controlled single-window updates, and a newer waiting worker superseding an older one, do work. Separately, vite.config.ts stamps HEAD's SHA and the build date into the entry chunk, so every push to main publishes a new service worker, including the records-only 'approve pending Atlas records' pushes that follow most merges (deploy history: a second deploy 6–60 minutes after merges), and the banner returns with nothing new behind it.\n4. Close: status changes only by accepting suggestStatusAfterBlock's suggestion (three cases); Primary focus and Current effort are editable only on the item page.\n5. Routines: finishRoutine writes one not_logged block per bound item and Routine complete lists minutes only; what the items showed cannot be recorded.",
  "desiredBehaviour": "1. Plans (plan.ts; build, Remove and Swap share one allocator). Floors: in a multi-segment plan a segment on a whole work (isWork: a top-level gusheh, full piece or item with Persian identity) gets at least DEFAULT_DURATION_MINUTES (the 10-minute standard block), and no review clamp, Swap or Remove takes it below that; other material keeps MIN_SEGMENT_MINUTES (2); a one-segment plan still takes the whole budget (≤25). Seating: a segment is seated only while every seated segment can still reach its floor; optional roles go first, then the lowest-priority work; the anchor always stays. Optional roles never exceed their share: the warm-up's is its pinned round(B×warmupShare); the cool-down's is its weighted split of the minutes after the warm-up plus at most one rounding minute, computed with it seated. A work fills an optional role only when that share is at least 10; otherwise the role goes to suitable non-work material or is omitted. Overflow: minutes beyond floors and shares go to deep and lesson work first, then to reviews (each up to 25); as today, the review-slot ceiling holds while deep or lesson work can take the minutes; neither review clamping nor capped work ever feeds a warm-up or cool-down; anything left is the existing honest remainder, which therefore still only appears when every seated segment is at 25. Swap offers only candidates whose floor fits the slot; Remove re-allocates under the same rules; the floor is fixed on the segment when planned (an optional field: a running plan persisted before the change has none and still runs). Same rule on every instrument; drill-only plans keep today's minutes exactly wherever no warm-up or cool-down used to absorb overflow and no segment reached 25. docs/scheduling-evidence.md §5 publishes the floor, the optional-role and overflow rules and regenerated representative outputs; Settings' review-slot hints say the ceiling holds while other planned work can use the minutes and that a whole work's review gets at least 10.\n2. Sound (practiceCue.ts): every readying tap (Start, Resume on Active, Close and Routine, Test practice sound, Turn on sound) closes the page's current context and creates and resumes a fresh one synchronously inside that tap, so a dead context never outlives the next tap. At most one live context; a boundary still plays only on the current running context after a granted claim and never creates, resumes or replays; an older tap's pending Test never plays. The previous lane's sound browser test and its unit companion evolve into this lane's two sound acceptances (renamed, not duplicated); scripts/check-setar-practice-families.mjs (acceptance rows, mutation owners, and the anchor of every mutation whose code this lane edits in practiceCue.ts, useStore.ts and RoutineRunner.tsx) and docs/setar-practice-reliability.md move with them, so tests/setar-practice-proof.test.ts still finds every mutation exactly once with an owner. The stand-in also models a context that starts suspended inside a tap, so dropping the in-tap resume() still fails. New code never duplicates a mutation's find text (for example the store's `set({ db: outcome.db });` / `return null;` anchor).\n3. Updates: one app-owned controller replaces useRegisterSW, started with the page rather than with Layout (one registration, one set of listeners and one hourly, foreground and reconnect check per page; injectRegister false; generateSW prompt mode and its SKIP_WAITING handler kept). It is inert outside a production build and absorbs a failed registration calmly, so dev-server journeys see no registration and no page error. Whenever this window runs older code than the newest build the device has found (a waiting worker; a newer worker active since this page loaded, never the first install of this page's own build; or a route whose code an update removed) it shows the existing 'A new version is ready.' with Reload; a missing route shows it in place of the route instead of breaking. Only a Reload tap reloads, only its own window, exactly once, landing on that newest build: SKIP_WAITING first when a worker waits, then reload once the new worker controls or activates; directly otherwise; repeated taps never stack. Nothing else reloads a window: not another window's update, not a missing route. The offer waits while a close is unsaved (/close) and appears right after Save or Discard; it also shows on the refused-hydration screen that asks for an update. The build stamp becomes the date and SHA of the last commit that changed a file the production build reads (src/, public/, index.html, vite.config.ts and the stamp module, tsconfig*.json, package*.json; one list, exported by the stamp module; HEAD when history is shallow; an explicit override wins, for tests and owner checks). With a deterministic build from those inputs, records-, docs- and tests-only pushes publish byte-identical files and so no offer; Settings still names the stamp.\n4. Close (CloseBlock, closeSession): one collapsed line under the minutes shows Status · Primary focus · Current effort with Change; an engine-suggested status shows there as the pending change, pre-selected as today. Expanded, it reuses ItemDetail's status pills, ItemForm's focus select (including None) and the effort RatingInput. Edits are saved in the block's single write by key presence (untouched fields are not written; clearing focus is a write). The review decision and its preview use the item as practised, so the date shown is the date saved; the block's own mode and focus are never rewritten. Save and Save without a result keep explicit edits (the engine's suggestion only with a result); Discard writes nothing. Personal priority stays on the item page.\n5. Routines: Routine complete optionally records, per recorded item, one of the six results and a one-line observation, written onto that run's own blocks (ids returned by the finish that created them) with acknowledged persistence. lastResult follows only while that block is the item's latest logged one; no review, SM-2 state, date, status or minutes change; nothing is required, and Back leaves the minutes saved. Captured results are real evidence for every result reader (item history, lastResult, the close screen's three-same hint and its suppression of the status suggestion, Insights' repeated and improved cards, the teacher report, class-question context) and never reach the review decision; docs/scheduling-evidence.md §6's routine row says so.\n6. AGENTS.md rules change in place (sound context, routine not_logged, plan floor, close edits, update reload and build stamp); CLAUDE.md+AGENTS.md stay ≤32,768 bytes (9 bytes of headroom at base: condense, never drop an anchored prohibition). DECISIONS.md gets a dated entry; docs/setar-practice-reliability.md's sound rows follow the new invariant.\n\nProof route: Node, `npx vitest run src/domain/plan.test.ts src/domain/blocks.test.ts src/domain/routines.test.ts src/components/practiceCue.test.ts src/components/appUpdate.test.ts tests/app-version.test.ts`, on committed synthetic fixtures with fixed clocks; browsers, `npx vitest run tests/practice-cues.browser.test.ts tests/post-practice.browser.test.ts tests/app-update.browser.test.ts`, in Chromium and WebKit. Limits: fake audio proves context lifecycle, not audibility; a local service worker proves the lifecycle, not GitHub Pages' CDN; both remain OWNER. Before first review, show each family test red on the base commit wherever the base can run it, and show these partial fixes failing their acceptance: a floor on warm-ups only, an instrument-keyed floor, overflow still into the cool-down, renewal only when closed or at a boundary, workbox-window kept with a reload fallback, an automatic reload when a route's code is missing, an offer on a first install, a HEAD-based stamp, a review computed from the edited item, and routine annotation by item instead of block. Stop when every acceptance passes, npm test, lint, typecheck, build and secrets pass, and the three OWNER checks are handed back; rework fixes the named failing row and its family, not wholesale reruns.",
  "mustNotChange": [
    "One item · one mode · one focus · one result · one next action; closing stays under 60 seconds, a result is its only requirement, and every new control defaults to unchanged.",
    "Only closing a block completes a review or advances SM-2; Save without a result never moves the schedule; a routine never completes a review, advances SM-2 or changes a date.",
    "The review date shown before saving is exactly the date saved; the priority formula, scheduling params and their bounds are unchanged.",
    "Plans stay deterministic, validated to 5–120 minutes, never over budget, never surfacing resting material and never stored in PracticeDB, sync or backups; the practised-today pool, reasons and core marking keep their meaning.",
    "Sound is created or resumed only inside an explicit tap, plays only on a granted claim, and is never queued or replayed; the ring and overtime stay the guaranteed signal; no recorded minute, marker or wake lock depends on sound.",
    "An update replaces code, never data; nothing reloads a window except the musician's Reload tap in that window; reinstalling is never the path; offline practice, the CSP and network endpoints are unchanged.",
    "No saved-shape change: PracticeDB, PracticeItem, PracticeBlock, Review, SCHEMA_VERSION 16, validateDB, migrations, sync and backup formats are untouched.",
    "Direction-aware text, aria-pressed-with-class, contrast, one-scroller and journey-wait rules hold for every new control and test."
  ],
  "assumptions": [
    "The Mac sound failure is a dead AudioContext surviving into later blocks; long idle between blocks is the owner's only clue, and no automation can prove audibility.",
    "The owner's Mac app may be Safari's Add to Dock or a Chrome-installed app; both engines reproduced the update failures identically, and the fixes are engine-agnostic.",
    "isWork is the app's existing definition of a musical work, so Tar course drills and passages keep the 2-minute floor while gushehs and pieces on every instrument get 10.",
    "Routine capture lives on the Routine complete screen only; leaving or reloading that screen forgoes the capture, never the minutes already saved.",
    "The first update onto this lane's build is still offered by the old banner each device is running; where that page is uncontrolled its Reload may do nothing (the defect fixed here), and closing and reopening the app once installs it. Every later update goes through the new controller.",
    "'Newest' means the newest build this device has found (checked hourly, on return to the foreground and on reconnect); a Reload tap never waits on the network."
  ],
  "possibleConflicts": [
    "Reverses part of DECISIONS.md 2026-10-05 ('one page-lifetime context'); the owner's report is the new evidence. That lane's family script and proof test pin the sound tests' titles and quote practiceCue.ts code, so they move together (see desired 2).",
    "AGENTS.md has 9 bytes of headroom and five rules change; condensing must not drop a prohibition tests/agent-context.test.ts anchors.",
    "Plans change on every instrument with works (Guitar pieces too): fewer, longer segments, and Setar warm-ups mostly disappear below about 80 minutes (at the default 12% share) unless a familiar drill exists.",
    "Flow text goes stale and is reconciled after building, with no new Flow: practise-todays-recommendation steps 3–6, run-a-session-plan steps 1–2, work-a-pathway-stage's routine finish, install-the-app-and-keep-it-current steps 3–4."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "DECISIONS.md",
      "README.md",
      "docs/scheduling-evidence.md",
      "docs/setar-practice-reliability.md",
      "vite.config.ts",
      "tsconfig.node.json",
      "scripts/app-version.mjs",
      "src/main.tsx",
      "src/App.tsx",
      "src/vite-env.d.ts",
      "src/domain/plan.ts",
      "src/domain/plan.test.ts",
      "src/domain/blocks.ts",
      "src/domain/blocks.test.ts",
      "src/domain/routines.ts",
      "src/domain/routines.test.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/pages/CloseBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/Settings.tsx",
      "src/components/practiceCue.ts",
      "src/components/practiceCue.test.ts",
      "scripts/check-setar-practice-families.mjs",
      "src/components/appUpdate.ts",
      "src/components/appUpdate.test.ts",
      "src/components/Layout.tsx",
      "src/components/ui.tsx",
      "src/components/direction.test.ts",
      "src/components/pressedState.test.ts",
      "src/styles/global.css",
      "tests/practice-cues.browser.test.ts",
      "tests/post-practice.browser.test.ts",
      "tests/app-update.browser.test.ts",
      "tests/app-version.test.ts",
      "tests/practiceBrowser.ts",
      "tests/daily-practice.browser.test.ts",
      "tests/practice-information.browser.test.ts",
      "tests/practice-information-layout.browser.test.ts",
      "tests/review-ownership.browser.test.ts"
    ],
    "forbid": [
      ".github/**",
      "public/**",
      "package.json",
      "package-lock.json",
      "src/domain/types.ts",
      "src/domain/io.ts",
      "src/domain/migrations.ts",
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/practiceSignal.ts",
      "tests/journey-waits.test.ts",
      "tests/agent-context.test.ts",
      "tests/ci-browser-setup.test.ts",
      "tests/setar-practice-proof.test.ts"
    ]
  },
  "exclusions": [
    "Cue timing while the window is hidden or occluded (browser timer throttling): a separate family the owner did not report; no audio pre-scheduling, notifications or push.",
    "Personal priority at close; status, focus or effort editing at routine finish; a full close per routine item.",
    "Any new setting, scheduling param or bound, or a change to any knob's default or bounds.",
    "Deploy workflow, CDN caching, service-worker strategy (stays generateSW in prompt mode) and dependency changes.",
    "How a running plan advances, skips or revalidates, StartBlock defaults, and recommendations."
  ],
  "acceptance": [
    {
      "description": "src/domain/plan.test.ts, independently derived expectations on committed synthetic fixtures (Setar works with many due reviews and class commitments, Tar drills, Guitar pieces plus drills, parts) × budgets 5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120 × warmupShare 0.10/0.15 × review windows: no work segment under 10 in a multi-segment plan and none under 2; total ≤ budget and equal to it unless every segment is at 25; the anchor always seated; warm-up and cool-down never above their defined shares, holding a work only when that share is at least 10, and never carrying overflow; overflow reaches deep and lesson work before reviews, and the review ceiling holds while deep or lesson work can take the minutes; Remove and Swap obey the same floors; a persisted run without floors still starts; drill-only fixtures in which no warm-up or cool-down absorbed overflow and no segment reaches 25 equal the base allocator's literal outputs, captured before the change; repeated builds deep-equal. Red on base for the Setar fixtures (2-minute warm-up, 11–21-minute cool-down).",
      "test": "planned whole works keep the standard block and the plan adapts its segment count"
    },
    {
      "description": "src/components/practiceCue.test.ts: each dead state (running with a frozen clock, interrupted that resume() cannot clear, suspended after a resolved resume, closed by the browser) plus the existing throw, reject, hang and constructor faults × each readying entry (start, resume, Test, Turn on sound): the next tap closes the old context and creates and resumes exactly one new one; one live context; a boundary then plays once on it; boundaries never create, resume or replay; an older Test request never plays. This is the evolved unit companion of the 2026-10-05 sound acceptance. Red on base: the frozen running context is reused and stays silent.",
      "test": "every readying tap replaces the page's sound context and a boundary never revives a dead one"
    },
    {
      "description": "tests/practice-cues.browser.test.ts, Chromium and WebKit, through mounted screens with CUE_PORTS extended by the dead states: after the context dies, the next tap through every door (Today Start, StartBlock, stage ▶, routine card Start and duration, plan Begin, Active Resume, Close Back, Routine Resume, Turn on sound, Settings Test) creates and resumes a fresh context inside that click on the tapped route, closes the old one, and the next boundary cues exactly once; recorded minutes and markers are unchanged. This is the 2026-10-05 one-context journey, renamed and evolved to one live context rather than deleted.",
      "test": "practice sound returns at the next tap after the context dies through every start and resume door"
    },
    {
      "description": "Node (closeSession with mocked idb as practiceCue.test.ts already does, or the pure helper it delegates to): edit present vs absent × status (suggested, other, unchanged) × primary focus (set, cleared, unchanged) × effort (changed, unchanged) × Save, Save without a result, Discard × auto, interval and manual review modes: only chosen fields change, in the block's single write; the saved review date and type equal planNextReview on the pre-edit item; the block's mode and focus are untouched; Save without a result keeps explicit edits and drops the engine suggestion; Discard writes nothing; importance, notes, review fields and SR state change only as the review decision says.",
      "test": "closing a block saves only the item edits the owner chose and decides the review from the item as practised"
    },
    {
      "description": "tests/post-practice.browser.test.ts, Chromium and WebKit at 390x844: Start, Finish, then the close screen shows the collapsed item line with current values; Change, pick status, focus and effort, Save; after reload the item page shows them and the saved review date equals the line shown before saving; an untouched close leaves those item fields equal; Save without a result and Discard behave as the domain acceptance says; direction and pressed-state ledgers cover the new controls.",
      "test": "close screen revises status focus and effort in one tap and saves them with the block"
    },
    {
      "description": "src/domain/routines.test.ts: this run's blocks vs another run's or older blocks vs unknown ids × each result vs not_logged vs an invalid value × observation present or empty × an item with a later logged block: only this run's blocks change; an invalid value is refused naming the block; lastResult moves only when the block is the item's latest logged one; nextReviewDate, open reviews, SR fields, srLastProgressDay, status, minutes and counters are unchanged; repeating the same capture is a no-op; the existing pure result readers (recentResults, lastResultsAllSame, the Insights cards, the report) see the captured result.",
      "test": "routine capture annotates only its own run's blocks and never moves a review or schedule"
    },
    {
      "description": "tests/post-practice.browser.test.ts, Chromium and WebKit: run a routine with two bound items and an unbound segment, Finish & save, and the blocks are persisted as not_logged before any capture; record a result for one item and a note for the other; after reload the item history shows them and due reviews are still due; skipping the capture leaves not_logged; reloading on Routine complete keeps the minutes.",
      "test": "routine complete captures what each item showed without delaying the save"
    },
    {
      "description": "src/components/appUpdate.test.ts with fake container, registration and workers: controlled vs uncontrolled page × first install of this page's build vs update found at registration vs later × waiting vs activated without waiting vs superseded by a newer waiting worker vs activated by another window vs a route whose code is gone × one vs repeated taps × /close vs another route: the offer appears exactly when this window runs older code (never for the first install) and clears once the newest build lands; one tap gives exactly one reload, after the new worker controls or activates, or directly when nothing waits; nothing reloads without a tap in that window; on /close the offer waits until the close is saved or discarded; remounting adds no registration, listener or timer; outside a production build nothing registers and nothing throws.",
      "test": "the update offer follows the live registration and only the tapping window reloads"
    },
    {
      "description": "tests/app-update.browser.test.ts, Chromium and WebKit, on real production builds made by the test into temp dirs outside the repo (dist/ untouched): A and V2 from the repository with different stamps through the explicit override, each served from its own directory so A-only chunks are gone once V2 is served, plus V3, a sw.js byte-variant of V2; local server, no network. Rows: (A) a fresh page installs A with no offer, then is offered V2 while uncontrolled, found early and late; (B) a controlled page; (C) two windows: one tap reloads only that window, while the other shows the offer, and navigating it to a route whose A chunk is gone shows the offer in place with no page error, its own tap landing on V2 at that route; (D) V3 superseding a waiting V2; (E) no offer reappears across foreground checks while the same build is served; (F) on /close the offer waits until Save or Discard. Every tap reloads exactly once onto the newest found build; nothing reloads without a tap. Red on base for A and C, as the planner reproduced. Waits follow tests/journey-waits.test.ts.",
      "test": "a published update installs on the first reload in both engines without loops or surprise reloads"
    },
    {
      "description": "tests/app-update.browser.test.ts, sharing those builds: B, built from a temp tree holding only the inputs the stamp module lists (node_modules linked) with A's stamp, equals A byte for byte across every file, sw.js and its precache manifest included, so the build is deterministic and reads nothing else; V2's different stamp changes sw.js. In Chromium and WebKit a page on A that is served B finds no update and shows no offer across foreground checks. With the stamp test, this proves a records-, docs- or tests-only push publishes nothing a browser sees as new.",
      "test": "an unchanged app rebuilds byte for byte and offers no update"
    },
    {
      "description": "tests/app-version.test.ts in a temp git repo, driven by the stamp module's own input list: commits touching .prismatica/, docs/, tests/, other scripts or any *.md leave the stamp unchanged; a commit touching each listed input (src/, public/, index.html, vite.config.ts, the stamp module, tsconfig*.json, package.json, package-lock.json) changes it; the date is the commit's, not the build clock's; shallow history falls back to HEAD; an explicit override wins.",
      "test": "the build stamp names the last commit that changed what ships"
    },
    {
      "description": "OWNER, before approving (deploy.yml publishes only main; there is no branch preview), on the Mac through `npm run preview` at http://localhost:4173/practice-compass/ (a secure context, docs/nas-topology.md), following the procedure the builder hands over, which uses the stamp override in place of a code change: open the lane build in two windows; publish a rebuild with a new stamp: both show 'A new version is ready.', one Reload tap lands that window on the new build (Settings names it), and the other reloads only on its own tap; publish an unchanged rebuild: no offer appears. The iPhone's update path is observed after ship, not here.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER, before approving: on the Mac through the same localhost preview, leave the app idle between blocks for a long while (or let the display sleep), then tap Start: the target cue is heard without closing the app. On the iPhone through the NAS HTTPS mirror (docs/nas-topology.md), Start a block and hear its cue; if no mirror serves, the iPhone half is environment-blocked rather than failed and is observed after ship. Audibility is the owner's.",
      "test": "manual:OWNER"
    },
    {
      "description": "OWNER, before approving, on the localhost preview holding a full backup exported from the production app and imported there, with sync never connected so no test practice reaches real history: 20-, 30- and 45-minute Setar plans give no piece or gusheh less than 10 minutes and still read as a sensible session; closing a block with a status, focus and effort change, and capturing a routine's results, each take well under a minute.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Writes saved practice data without changing its shape: item status, primary focus and effort at close; results and observations on a routine's own blocks. Adds an optional floor field to persisted running-plan segments, and changes the code path that reloads pages on update. No schema bump, no migration, no sync or backup format change."
  },
  "delta": {
    "today": "Close changes Status only by accepting one of three suggestions, the practice sound can die for good after a long idle, and around this flow plans give works 2–3-minute slots, routine finishes record no result, and the update banner sticks or reloads windows nobody tapped.",
    "instead": "Close revises Status, Primary focus and Current effort behind one collapsed line, every Start or Resume tap readies fresh sound, plans give every whole work at least the standard 10-minute block, Routine complete can record what each item showed, and one Reload tap lands the newest build in the window that asked.",
    "keep": [
      "One item, one mode, one focus, one result, one next action; closing stays under a minute.",
      "Only closing a block completes a review; the date shown is the date saved.",
      "Recorded minutes never depend on sound, the wake lock or updates."
    ],
    "assumptions": [],
    "showMe": "Run the Node route and the three browser journeys named in the plan in Chromium and WebKit: the 20-minute Setar fixture loses its 2-minute warm-up, a dead context recovers at the next Start, the uncontrolled-page update lands on one tap while an unchanged rebuild offers nothing, and close and routine captures persist through reload. Then the three OWNER checks."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/scheduling-evidence.md",
    "docs/setar-practice-reliability.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Close revises Status, Primary focus and Current effort behind one collapsed line, every Start or Resume tap readies fresh sound, plans give every whole work at least the standard 10-minute block, Routine complete can record what each item showed, and one Reload tap lands the newest build in the window that asked.

_approved · about "practise-todays-recommendation"_

## Today

Close changes Status only by accepting one of three suggestions, the practice sound can die for good after a long idle, and around this flow plans give works 2–3-minute slots, routine finishes record no result, and the update banner sticks or reloads windows nobody tapped.

## Instead

Close revises Status, Primary focus and Current effort behind one collapsed line, every Start or Resume tap readies fresh sound, plans give every whole work at least the standard 10-minute block, Routine complete can record what each item showed, and one Reload tap lands the newest build in the window that asked.

## Keep

- One item, one mode, one focus, one result, one next action; closing stays under a minute.
- Only closing a block completes a review; the date shown is the date saved.
- Recorded minutes never depend on sound, the wake lock or updates.

## New assumptions

_none_

## Show me

Run the Node route and the three browser journeys named in the plan in Chromium and WebKit: the 20-minute Setar fixture loses its 2-minute warm-up, a dead context recovers at the next Start, the uncontrolled-page update lands on one tap while an unchanged rebuild offers nothing, and close and routine captures persist through reload. Then the three OWNER checks.


## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **See and adjust the scheduling engine** (`adjust-how-scheduling-works`) — Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/CloseBlock.tsx`, `src/domain/scheduling.ts`, `src/domain/plan.ts`, `src/domain/types.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/adjust-how-scheduling-works.md`
- **Back up and restore everything** (`back-up-and-restore`) — Keep an independent copy of all practice data and files, and put it back on any device.
  touchpoints: `src/store/backup.ts`, `src/store/idb.ts`, `src/domain/io.ts`, `src/pages/Settings.tsx`, `src/store/useStore.ts` · canonical: `.prismatica/flows/back-up-and-restore.md`
- **Add a practice item** (`capture-a-practice-item`) — Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration
  touchpoints: `src/components/QuickAdd.tsx`, `src/components/ItemForm.tsx`, `src/components/itemKinds.ts`, `src/pages/NewItem.tsx`, `src/pages/ItemDetail.tsx`, `src/store/useStore.ts`, `src/domain/factories.ts` · canonical: `.prismatica/flows/capture-a-practice-item.md`
- **Deal with a due review** (`clear-a-due-review`) — Handle material that is due to come back, without ever faking that it was practised.
  touchpoints: `src/pages/Today.tsx`, `src/store/useStore.ts`, `src/domain/scheduling.ts`, `src/domain/selectors.ts` · canonical: `.prismatica/flows/clear-a-due-review.md`
- **Install the app and keep it current** (`install-the-app-and-keep-it-current`) — Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.
  touchpoints: `src/components/Layout.tsx`, `src/pages/Settings.tsx`, `vite.config.ts` · canonical: `.prismatica/flows/install-the-app-and-keep-it-current.md`
- **Log a class and its follow-up work** (`log-a-class`) — Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one
  touchpoints: `src/pages/Lessons.tsx`, `src/components/Attachments.tsx`, `src/domain/recordings.ts`, `src/domain/setarClasses.ts`, `src/domain/files.ts`, `src/domain/selectors.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/log-a-class.md`
- **Point this device at the NAS** (`point-this-device-at-the-nas`) — Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/Lessons.tsx`, `src/domain/recordings.ts`, `src/store/backup.ts` · canonical: `.prismatica/flows/point-this-device-at-the-nas.md`
- **Practise what the app suggests** (`practise-todays-recommendation`) — Practise the one thing the app suggests next and leave an honest record of how it went
  touchpoints: `src/pages/Today.tsx`, `src/pages/StartBlock.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/CloseBlock.tsx`, `src/store/useStore.ts`, `src/domain/recommend.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts`, `src/domain/blocks.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts` · canonical: `.prismatica/flows/practise-todays-recommendation.md`
- **Take questions and a summary to class** (`prepare-for-the-next-class`) — Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.
  touchpoints: `src/pages/TeacherReport.tsx`, `src/components/ClassQuestions.tsx`, `src/domain/questions.ts`, `src/domain/report.ts`, `src/pages/Lessons.tsx`, `src/pages/CloseBlock.tsx` · canonical: `.prismatica/flows/prepare-for-the-next-class.md`
- **Run a time-budgeted session** (`run-a-session-plan`) — Turn the minutes actually available into an ordered session, then practise it block by block.
  touchpoints: `src/pages/SessionPlan.tsx`, `src/pages/Today.tsx`, `src/pages/ActiveBlock.tsx`, `src/domain/plan.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/run-a-session-plan.md`
- **Keep the MacBook and iPhone in step** (`sync-devices-via-github`) — Practise on either device and have both hold the same data, without a server or an account.
  touchpoints: `src/store/syncEngine.ts`, `src/store/githubSync.ts`, `src/store/gitRemote.ts`, `src/domain/sync.ts`, `src/domain/canonical.ts`, `src/store/revision.ts`, `src/pages/Settings.tsx`, `src/App.tsx` · canonical: `.prismatica/flows/sync-devices-via-github.md`
- **Work through a pathway stage** (`work-a-pathway-stage`) — Follow a route you trust — see where you are, take the next suggestion into your own items once, and practise it
  touchpoints: `src/pages/PathwayDetail.tsx`, `src/pages/StageDetail.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/pathways.ts`, `src/domain/pathwaySeed.ts`, `src/domain/routines.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/pages/Repertoire.tsx` · canonical: `.prismatica/flows/work-a-pathway-stage.md`

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

Give works real plan time, make sound and updates recover, and capture item changes after practice

## Stay in scope — you may ONLY change

- AGENTS.md
- DECISIONS.md
- README.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md
- vite.config.ts
- tsconfig.node.json
- scripts/app-version.mjs
- src/main.tsx
- src/App.tsx
- src/vite-env.d.ts
- src/domain/plan.ts
- src/domain/plan.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/pages/CloseBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/SessionPlan.tsx
- src/pages/ActiveBlock.tsx
- src/pages/Settings.tsx
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- scripts/check-setar-practice-families.mjs
- src/components/appUpdate.ts
- src/components/appUpdate.test.ts
- src/components/Layout.tsx
- src/components/ui.tsx
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/styles/global.css
- tests/practice-cues.browser.test.ts
- tests/post-practice.browser.test.ts
- tests/app-update.browser.test.ts
- tests/app-version.test.ts
- tests/practiceBrowser.ts
- tests/daily-practice.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/review-ownership.browser.test.ts

Never touch:

- .github/**
- public/**
- package.json
- package-lock.json
- src/domain/types.ts
- src/domain/io.ts
- src/domain/migrations.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/practiceSignal.ts
- tests/journey-waits.test.ts
- tests/agent-context.test.ts
- tests/ci-browser-setup.test.ts
- tests/setar-practice-proof.test.ts
- One item · one mode · one focus · one result · one next action; closing stays under 60 seconds, a result is its only requirement, and every new control defaults to unchanged.
- Only closing a block completes a review or advances SM-2; Save without a result never moves the schedule; a routine never completes a review, advances SM-2 or changes a date.
- The review date shown before saving is exactly the date saved; the priority formula, scheduling params and their bounds are unchanged.
- Plans stay deterministic, validated to 5–120 minutes, never over budget, never surfacing resting material and never stored in PracticeDB, sync or backups; the practised-today pool, reasons and core marking keep their meaning.
- Sound is created or resumed only inside an explicit tap, plays only on a granted claim, and is never queued or replayed; the ring and overtime stay the guaranteed signal; no recorded minute, marker or wake lock depends on sound.
- An update replaces code, never data; nothing reloads a window except the musician's Reload tap in that window; reinstalling is never the path; offline practice, the CSP and network endpoints are unchanged.
- No saved-shape change: PracticeDB, PracticeItem, PracticeBlock, Review, SCHEMA_VERSION 16, validateDB, migrations, sync and backup formats are untouched.
- Direction-aware text, aria-pressed-with-class, contrast, one-scroller and journey-wait rules hold for every new control and test.
- Cue timing while the window is hidden or occluded (browser timer throttling): a separate family the owner did not report; no audio pre-scheduling, notifications or push.
- Personal priority at close; status, focus or effort editing at routine finish; a full close per routine item.
- Any new setting, scheduling param or bound, or a change to any knob's default or bounds.
- Deploy workflow, CDN caching, service-worker strategy (stays generateSW in prompt mode) and dependency changes.
- How a running plan advances, skips or revalidates, StartBlock defaults, and recommendations.

## Definition of done

- **ac-1** — src/domain/plan.test.ts, independently derived expectations on committed synthetic fixtures (Setar works with many due reviews and class commitments, Tar drills, Guitar pieces plus drills, parts) × budgets 5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120 × warmupShare 0.10/0.15 × review windows: no work segment under 10 in a multi-segment plan and none under 2; total ≤ budget and equal to it unless every segment is at 25; the anchor always seated; warm-up and cool-down never above their defined shares, holding a work only when that share is at least 10, and never carrying overflow; overflow reaches deep and lesson work before reviews, and the review ceiling holds while deep or lesson work can take the minutes; Remove and Swap obey the same floors; a persisted run without floors still starts; drill-only fixtures in which no warm-up or cool-down absorbed overflow and no segment reaches 25 equal the base allocator's literal outputs, captured before the change; repeated builds deep-equal. Red on base for the Setar fixtures (2-minute warm-up, 11–21-minute cool-down). → proven by `planned whole works keep the standard block and the plan adapts its segment count`
- **ac-2** — src/components/practiceCue.test.ts: each dead state (running with a frozen clock, interrupted that resume() cannot clear, suspended after a resolved resume, closed by the browser) plus the existing throw, reject, hang and constructor faults × each readying entry (start, resume, Test, Turn on sound): the next tap closes the old context and creates and resumes exactly one new one; one live context; a boundary then plays once on it; boundaries never create, resume or replay; an older Test request never plays. This is the evolved unit companion of the 2026-10-05 sound acceptance. Red on base: the frozen running context is reused and stays silent. → proven by `every readying tap replaces the page's sound context and a boundary never revives a dead one`
- **ac-3** — tests/practice-cues.browser.test.ts, Chromium and WebKit, through mounted screens with CUE_PORTS extended by the dead states: after the context dies, the next tap through every door (Today Start, StartBlock, stage ▶, routine card Start and duration, plan Begin, Active Resume, Close Back, Routine Resume, Turn on sound, Settings Test) creates and resumes a fresh context inside that click on the tapped route, closes the old one, and the next boundary cues exactly once; recorded minutes and markers are unchanged. This is the 2026-10-05 one-context journey, renamed and evolved to one live context rather than deleted. → proven by `practice sound returns at the next tap after the context dies through every start and resume door`
- **ac-4** — Node (closeSession with mocked idb as practiceCue.test.ts already does, or the pure helper it delegates to): edit present vs absent × status (suggested, other, unchanged) × primary focus (set, cleared, unchanged) × effort (changed, unchanged) × Save, Save without a result, Discard × auto, interval and manual review modes: only chosen fields change, in the block's single write; the saved review date and type equal planNextReview on the pre-edit item; the block's mode and focus are untouched; Save without a result keeps explicit edits and drops the engine suggestion; Discard writes nothing; importance, notes, review fields and SR state change only as the review decision says. → proven by `closing a block saves only the item edits the owner chose and decides the review from the item as practised`
- **ac-5** — tests/post-practice.browser.test.ts, Chromium and WebKit at 390x844: Start, Finish, then the close screen shows the collapsed item line with current values; Change, pick status, focus and effort, Save; after reload the item page shows them and the saved review date equals the line shown before saving; an untouched close leaves those item fields equal; Save without a result and Discard behave as the domain acceptance says; direction and pressed-state ledgers cover the new controls. → proven by `close screen revises status focus and effort in one tap and saves them with the block`
- **ac-6** — src/domain/routines.test.ts: this run's blocks vs another run's or older blocks vs unknown ids × each result vs not_logged vs an invalid value × observation present or empty × an item with a later logged block: only this run's blocks change; an invalid value is refused naming the block; lastResult moves only when the block is the item's latest logged one; nextReviewDate, open reviews, SR fields, srLastProgressDay, status, minutes and counters are unchanged; repeating the same capture is a no-op; the existing pure result readers (recentResults, lastResultsAllSame, the Insights cards, the report) see the captured result. → proven by `routine capture annotates only its own run's blocks and never moves a review or schedule`
- **ac-7** — tests/post-practice.browser.test.ts, Chromium and WebKit: run a routine with two bound items and an unbound segment, Finish & save, and the blocks are persisted as not_logged before any capture; record a result for one item and a note for the other; after reload the item history shows them and due reviews are still due; skipping the capture leaves not_logged; reloading on Routine complete keeps the minutes. → proven by `routine complete captures what each item showed without delaying the save`
- **ac-8** — src/components/appUpdate.test.ts with fake container, registration and workers: controlled vs uncontrolled page × first install of this page's build vs update found at registration vs later × waiting vs activated without waiting vs superseded by a newer waiting worker vs activated by another window vs a route whose code is gone × one vs repeated taps × /close vs another route: the offer appears exactly when this window runs older code (never for the first install) and clears once the newest build lands; one tap gives exactly one reload, after the new worker controls or activates, or directly when nothing waits; nothing reloads without a tap in that window; on /close the offer waits until the close is saved or discarded; remounting adds no registration, listener or timer; outside a production build nothing registers and nothing throws. → proven by `the update offer follows the live registration and only the tapping window reloads`
- **ac-9** — tests/app-update.browser.test.ts, Chromium and WebKit, on real production builds made by the test into temp dirs outside the repo (dist/ untouched): A and V2 from the repository with different stamps through the explicit override, each served from its own directory so A-only chunks are gone once V2 is served, plus V3, a sw.js byte-variant of V2; local server, no network. Rows: (A) a fresh page installs A with no offer, then is offered V2 while uncontrolled, found early and late; (B) a controlled page; (C) two windows: one tap reloads only that window, while the other shows the offer, and navigating it to a route whose A chunk is gone shows the offer in place with no page error, its own tap landing on V2 at that route; (D) V3 superseding a waiting V2; (E) no offer reappears across foreground checks while the same build is served; (F) on /close the offer waits until Save or Discard. Every tap reloads exactly once onto the newest found build; nothing reloads without a tap. Red on base for A and C, as the planner reproduced. Waits follow tests/journey-waits.test.ts. → proven by `a published update installs on the first reload in both engines without loops or surprise reloads`
- **ac-10** — tests/app-update.browser.test.ts, sharing those builds: B, built from a temp tree holding only the inputs the stamp module lists (node_modules linked) with A's stamp, equals A byte for byte across every file, sw.js and its precache manifest included, so the build is deterministic and reads nothing else; V2's different stamp changes sw.js. In Chromium and WebKit a page on A that is served B finds no update and shows no offer across foreground checks. With the stamp test, this proves a records-, docs- or tests-only push publishes nothing a browser sees as new. → proven by `an unchanged app rebuilds byte for byte and offers no update`
- **ac-11** — tests/app-version.test.ts in a temp git repo, driven by the stamp module's own input list: commits touching .prismatica/, docs/, tests/, other scripts or any *.md leave the stamp unchanged; a commit touching each listed input (src/, public/, index.html, vite.config.ts, the stamp module, tsconfig*.json, package.json, package-lock.json) changes it; the date is the commit's, not the build clock's; shallow history falls back to HEAD; an explicit override wins. → proven by `the build stamp names the last commit that changed what ships`
- **ac-12** — OWNER, before approving (deploy.yml publishes only main; there is no branch preview), on the Mac through `npm run preview` at http://localhost:4173/practice-compass/ (a secure context, docs/nas-topology.md), following the procedure the builder hands over, which uses the stamp override in place of a code change: open the lane build in two windows; publish a rebuild with a new stamp: both show 'A new version is ready.', one Reload tap lands that window on the new build (Settings names it), and the other reloads only on its own tap; publish an unchanged rebuild: no offer appears. The iPhone's update path is observed after ship, not here. → proven by `manual:OWNER`
- **ac-13** — OWNER, before approving: on the Mac through the same localhost preview, leave the app idle between blocks for a long while (or let the display sleep), then tap Start: the target cue is heard without closing the app. On the iPhone through the NAS HTTPS mirror (docs/nas-topology.md), Start a block and hear its cue; if no mirror serves, the iPhone half is environment-blocked rather than failed and is observed after ship. Audibility is the owner's. → proven by `manual:OWNER`
- **ac-14** — OWNER, before approving, on the localhost preview holding a full backup exported from the production app and imported there, with sync never connected so no test practice reaches real history: 20-, 30- and 45-minute Setar plans give no piece or gusheh less than 10 minutes and still read as a sensible session; closing a block with a status, focus and effort change, and capturing a routine's results, each take well under a minute. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before the first review

Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Say in your commit message where it lives.

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

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.

