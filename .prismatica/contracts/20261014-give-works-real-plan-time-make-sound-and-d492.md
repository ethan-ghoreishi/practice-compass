---
id: 20261014-give-works-real-plan-time-make-sound-and-d492
title: Give works real plan time, make sound and updates recover, and capture
  item changes after practice
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/51
intent: 20261014-give-works-real-plan-time-make-sound-and-d492
tier: heavy
stage: prove
baseline:
  commit: ee7a091db4fb297fd1955e8e0ad9bc72578f4bf7
  branch: main
branch: change/20261014-give-works-real-plan-time-make-sound-and-d492
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261014-give-works-real-plan-time-make-sound-and-d492
builder: claude
planHash: 9c34b894976b76c930727bd66f6c27f8d9bb6f181feb68766402511eb26e7419
allowedPaths:
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
forbiddenPaths:
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
nonGoals:
  - One item · one mode · one focus · one result · one next action; closing
    stays under 60 seconds, a result is its only requirement, and every new
    control defaults to unchanged.
  - Only closing a block completes a review or advances SM-2; Save without a
    result never moves the schedule; a routine never completes a review,
    advances SM-2 or changes a date.
  - The review date shown before saving is exactly the date saved; the priority
    formula, scheduling params and their bounds are unchanged.
  - Plans stay deterministic, validated to 5–120 minutes, never over budget,
    never surfacing resting material and never stored in PracticeDB, sync or
    backups; the practised-today pool, reasons and core marking keep their
    meaning.
  - Sound is created or resumed only inside an explicit tap, plays only on a
    granted claim, and is never queued or replayed; the ring and overtime stay
    the guaranteed signal; no recorded minute, marker or wake lock depends on
    sound.
  - An update replaces code, never data; nothing reloads a window except the
    musician's Reload tap in that window; reinstalling is never the path;
    offline practice, the CSP and network endpoints are unchanged.
  - "No saved-shape change: PracticeDB, PracticeItem, PracticeBlock, Review,
    SCHEMA_VERSION 16, validateDB, migrations, sync and backup formats are
    untouched."
  - Direction-aware text, aria-pressed-with-class, contrast, one-scroller and
    journey-wait rules hold for every new control and test.
  - "Cue timing while the window is hidden or occluded (browser timer
    throttling): a separate family the owner did not report; no audio
    pre-scheduling, notifications or push."
  - Personal priority at close; status, focus or effort editing at routine
    finish; a full close per routine item.
  - Any new setting, scheduling param or bound, or a change to any knob's
    default or bounds.
  - Deploy workflow, CDN caching, service-worker strategy (stays generateSW in
    prompt mode) and dependency changes.
  - How a running plan advances, skips or revalidates, StartBlock defaults, and
    recommendations.
acceptanceChecks:
  - id: ac-1
    description: "src/domain/plan.test.ts, independently derived expectations on
      committed synthetic fixtures (Setar works with many due reviews and class
      commitments, Tar drills, Guitar pieces plus drills, parts) × budgets 5,
      10, 12, 15, 20, 25, 30, 45, 60, 90, 120 × warmupShare 0.10/0.15 × review
      windows: no work segment under 10 in a multi-segment plan and none under
      2; total ≤ budget and equal to it unless every segment is at 25; the
      anchor always seated; warm-up and cool-down never above their defined
      shares, holding a work only when that share is at least 10, and never
      carrying overflow; overflow reaches deep and lesson work before reviews,
      and the review ceiling holds while deep or lesson work can take the
      minutes; Remove and Swap obey the same floors; a persisted run without
      floors still starts; drill-only fixtures in which no warm-up or cool-down
      absorbed overflow and no segment reaches 25 equal the base allocator's
      literal outputs, captured before the change; repeated builds deep-equal.
      Red on base for the Setar fixtures (2-minute warm-up, 11–21-minute
      cool-down)."
    test: planned whole works keep the standard block and the plan adapts its
      segment count
  - id: ac-2
    description: "src/components/practiceCue.test.ts: each dead state (running with
      a frozen clock, interrupted that resume() cannot clear, suspended after a
      resolved resume, closed by the browser) plus the existing throw, reject,
      hang and constructor faults × each readying entry (start, resume, Test,
      Turn on sound): the next tap closes the old context and creates and
      resumes exactly one new one; one live context; a boundary then plays once
      on it; boundaries never create, resume or replay; an older Test request
      never plays. This is the evolved unit companion of the 2026-10-05 sound
      acceptance. Red on base: the frozen running context is reused and stays
      silent."
    test: every readying tap replaces the page's sound context and a boundary never
      revives a dead one
  - id: ac-3
    description: "tests/practice-cues.browser.test.ts, Chromium and WebKit, through
      mounted screens with CUE_PORTS extended by the dead states: after the
      context dies, the next tap through every door (Today Start, StartBlock,
      stage ▶, routine card Start and duration, plan Begin, Active Resume, Close
      Back, Routine Resume, Turn on sound, Settings Test) creates and resumes a
      fresh context inside that click on the tapped route, closes the old one,
      and the next boundary cues exactly once; recorded minutes and markers are
      unchanged. This is the 2026-10-05 one-context journey, renamed and evolved
      to one live context rather than deleted."
    test: practice sound returns at the next tap after the context dies through
      every start and resume door
  - id: ac-4
    description: "Node (closeSession with mocked idb as practiceCue.test.ts already
      does, or the pure helper it delegates to): edit present vs absent × status
      (suggested, other, unchanged) × primary focus (set, cleared, unchanged) ×
      effort (changed, unchanged) × Save, Save without a result, Discard × auto,
      interval and manual review modes: only chosen fields change, in the
      block's single write; the saved review date and type equal planNextReview
      on the pre-edit item; the block's mode and focus are untouched; Save
      without a result keeps explicit edits and drops the engine suggestion;
      Discard writes nothing; importance, notes, review fields and SR state
      change only as the review decision says."
    test: closing a block saves only the item edits the owner chose and decides the
      review from the item as practised
  - id: ac-5
    description: "tests/post-practice.browser.test.ts, Chromium and WebKit at
      390x844: Start, Finish, then the close screen shows the collapsed item
      line with current values; Change, pick status, focus and effort, Save;
      after reload the item page shows them and the saved review date equals the
      line shown before saving; an untouched close leaves those item fields
      equal; Save without a result and Discard behave as the domain acceptance
      says; direction and pressed-state ledgers cover the new controls."
    test: close screen revises status focus and effort in one tap and saves them
      with the block
  - id: ac-6
    description: "src/domain/routines.test.ts: this run's blocks vs another run's or
      older blocks vs unknown ids × each result vs not_logged vs an invalid
      value × observation present or empty × an item with a later logged block:
      only this run's blocks change; an invalid value is refused naming the
      block; lastResult moves only when the block is the item's latest logged
      one; nextReviewDate, open reviews, SR fields, srLastProgressDay, status,
      minutes and counters are unchanged; repeating the same capture is a no-op;
      the existing pure result readers (recentResults, lastResultsAllSame, the
      Insights cards, the report) see the captured result."
    test: routine capture annotates only its own run's blocks and never moves a
      review or schedule
  - id: ac-7
    description: "tests/post-practice.browser.test.ts, Chromium and WebKit: run a
      routine with two bound items and an unbound segment, Finish & save, and
      the blocks are persisted as not_logged before any capture; record a result
      for one item and a note for the other; after reload the item history shows
      them and due reviews are still due; skipping the capture leaves
      not_logged; reloading on Routine complete keeps the minutes."
    test: routine complete captures what each item showed without delaying the save
  - id: ac-8
    description: "src/components/appUpdate.test.ts with fake container, registration
      and workers: controlled vs uncontrolled page × first install of this
      page's build vs update found at registration vs later × waiting vs
      activated without waiting vs superseded by a newer waiting worker vs
      activated by another window vs a route whose code is gone × one vs
      repeated taps × /close vs another route: the offer appears exactly when
      this window runs older code (never for the first install) and clears once
      the newest build lands; one tap gives exactly one reload, after the new
      worker controls or activates, or directly when nothing waits; nothing
      reloads without a tap in that window; on /close the offer waits until the
      close is saved or discarded; remounting adds no registration, listener or
      timer; outside a production build nothing registers and nothing throws."
    test: the update offer follows the live registration and only the tapping window
      reloads
  - id: ac-9
    description: "tests/app-update.browser.test.ts, Chromium and WebKit, on real
      production builds made by the test into temp dirs outside the repo (dist/
      untouched): A and V2 from the repository with different stamps through the
      explicit override, each served from its own directory so A-only chunks are
      gone once V2 is served, plus V3, a sw.js byte-variant of V2; local server,
      no network. Rows: (A) a fresh page installs A with no offer, then is
      offered V2 while uncontrolled, found early and late; (B) a controlled
      page; (C) two windows: one tap reloads only that window, while the other
      shows the offer, and navigating it to a route whose A chunk is gone shows
      the offer in place with no page error, its own tap landing on V2 at that
      route; (D) V3 superseding a waiting V2; (E) no offer reappears across
      foreground checks while the same build is served; (F) on /close the offer
      waits until Save or Discard. Every tap reloads exactly once onto the
      newest found build; nothing reloads without a tap. Red on base for A and
      C, as the planner reproduced. Waits follow tests/journey-waits.test.ts."
    test: a published update installs on the first reload in both engines without
      loops or surprise reloads
  - id: ac-10
    description: "tests/app-update.browser.test.ts, sharing those builds: B, built
      from a temp tree holding only the inputs the stamp module lists
      (node_modules linked) with A's stamp, equals A byte for byte across every
      file, sw.js and its precache manifest included, so the build is
      deterministic and reads nothing else; V2's different stamp changes sw.js.
      In Chromium and WebKit a page on A that is served B finds no update and
      shows no offer across foreground checks. With the stamp test, this proves
      a records-, docs- or tests-only push publishes nothing a browser sees as
      new."
    test: an unchanged app rebuilds byte for byte and offers no update
  - id: ac-11
    description: "tests/app-version.test.ts in a temp git repo, driven by the stamp
      module's own input list: commits touching .prismatica/, docs/, tests/,
      other scripts or any *.md leave the stamp unchanged; a commit touching
      each listed input (src/, public/, index.html, vite.config.ts, the stamp
      module, tsconfig*.json, package.json, package-lock.json) changes it; the
      date is the commit's, not the build clock's; shallow history falls back to
      HEAD; an explicit override wins."
    test: the build stamp names the last commit that changed what ships
  - id: ac-12
    description: "OWNER, before approving (deploy.yml publishes only main; there is
      no branch preview), on the Mac through `npm run preview` at
      http://localhost:4173/practice-compass/ (a secure context,
      docs/nas-topology.md), following the procedure the builder hands over,
      which uses the stamp override in place of a code change: open the lane
      build in two windows; publish a rebuild with a new stamp: both show 'A new
      version is ready.', one Reload tap lands that window on the new build
      (Settings names it), and the other reloads only on its own tap; publish an
      unchanged rebuild: no offer appears. The iPhone's update path is observed
      after ship, not here."
    test: manual:OWNER
  - id: ac-13
    description: "OWNER, before approving: on the Mac through the same localhost
      preview, leave the app idle between blocks for a long while (or let the
      display sleep), then tap Start: the target cue is heard without closing
      the app. On the iPhone through the NAS HTTPS mirror
      (docs/nas-topology.md), Start a block and hear its cue; if no mirror
      serves, the iPhone half is environment-blocked rather than failed and is
      observed after ship. Audibility is the owner's."
    test: manual:OWNER
  - id: ac-14
    description: "OWNER, before approving, on the localhost preview holding a full
      backup exported from the production app and imported there, with sync
      never connected so no test practice reaches real history: 20-, 30- and
      45-minute Setar plans give no piece or gusheh less than 10 minutes and
      still read as a sensible session; closing a block with a status, focus and
      effort change, and capturing a routine's results, each take well under a
      minute."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/scheduling-evidence.md
  - docs/setar-practice-reliability.md
createdAt: 2026-10-14T01:14:50.664Z
amendments: []
---

# Give works real plan time, make sound and updates recover, and capture item changes after practice

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/51
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** ee7a091db4fb297fd1955e8e0ad9bc72578f4bf7 on main _(never re-baselined)_
- **Intent:** 20261014-give-works-real-plan-time-make-sound-and-d492

## You may only change

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

## Never touch

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

## Non-goals

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

## Acceptance checks (definition of done)

- [ ] **ac-1** — src/domain/plan.test.ts, independently derived expectations on committed synthetic fixtures (Setar works with many due reviews and class commitments, Tar drills, Guitar pieces plus drills, parts) × budgets 5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120 × warmupShare 0.10/0.15 × review windows: no work segment under 10 in a multi-segment plan and none under 2; total ≤ budget and equal to it unless every segment is at 25; the anchor always seated; warm-up and cool-down never above their defined shares, holding a work only when that share is at least 10, and never carrying overflow; overflow reaches deep and lesson work before reviews, and the review ceiling holds while deep or lesson work can take the minutes; Remove and Swap obey the same floors; a persisted run without floors still starts; drill-only fixtures in which no warm-up or cool-down absorbed overflow and no segment reaches 25 equal the base allocator's literal outputs, captured before the change; repeated builds deep-equal. Red on base for the Setar fixtures (2-minute warm-up, 11–21-minute cool-down). _(proof: planned whole works keep the standard block and the plan adapts its segment count)_
- [ ] **ac-2** — src/components/practiceCue.test.ts: each dead state (running with a frozen clock, interrupted that resume() cannot clear, suspended after a resolved resume, closed by the browser) plus the existing throw, reject, hang and constructor faults × each readying entry (start, resume, Test, Turn on sound): the next tap closes the old context and creates and resumes exactly one new one; one live context; a boundary then plays once on it; boundaries never create, resume or replay; an older Test request never plays. This is the evolved unit companion of the 2026-10-05 sound acceptance. Red on base: the frozen running context is reused and stays silent. _(proof: every readying tap replaces the page's sound context and a boundary never revives a dead one)_
- [ ] **ac-3** — tests/practice-cues.browser.test.ts, Chromium and WebKit, through mounted screens with CUE_PORTS extended by the dead states: after the context dies, the next tap through every door (Today Start, StartBlock, stage ▶, routine card Start and duration, plan Begin, Active Resume, Close Back, Routine Resume, Turn on sound, Settings Test) creates and resumes a fresh context inside that click on the tapped route, closes the old one, and the next boundary cues exactly once; recorded minutes and markers are unchanged. This is the 2026-10-05 one-context journey, renamed and evolved to one live context rather than deleted. _(proof: practice sound returns at the next tap after the context dies through every start and resume door)_
- [ ] **ac-4** — Node (closeSession with mocked idb as practiceCue.test.ts already does, or the pure helper it delegates to): edit present vs absent × status (suggested, other, unchanged) × primary focus (set, cleared, unchanged) × effort (changed, unchanged) × Save, Save without a result, Discard × auto, interval and manual review modes: only chosen fields change, in the block's single write; the saved review date and type equal planNextReview on the pre-edit item; the block's mode and focus are untouched; Save without a result keeps explicit edits and drops the engine suggestion; Discard writes nothing; importance, notes, review fields and SR state change only as the review decision says. _(proof: closing a block saves only the item edits the owner chose and decides the review from the item as practised)_
- [ ] **ac-5** — tests/post-practice.browser.test.ts, Chromium and WebKit at 390x844: Start, Finish, then the close screen shows the collapsed item line with current values; Change, pick status, focus and effort, Save; after reload the item page shows them and the saved review date equals the line shown before saving; an untouched close leaves those item fields equal; Save without a result and Discard behave as the domain acceptance says; direction and pressed-state ledgers cover the new controls. _(proof: close screen revises status focus and effort in one tap and saves them with the block)_
- [ ] **ac-6** — src/domain/routines.test.ts: this run's blocks vs another run's or older blocks vs unknown ids × each result vs not_logged vs an invalid value × observation present or empty × an item with a later logged block: only this run's blocks change; an invalid value is refused naming the block; lastResult moves only when the block is the item's latest logged one; nextReviewDate, open reviews, SR fields, srLastProgressDay, status, minutes and counters are unchanged; repeating the same capture is a no-op; the existing pure result readers (recentResults, lastResultsAllSame, the Insights cards, the report) see the captured result. _(proof: routine capture annotates only its own run's blocks and never moves a review or schedule)_
- [ ] **ac-7** — tests/post-practice.browser.test.ts, Chromium and WebKit: run a routine with two bound items and an unbound segment, Finish & save, and the blocks are persisted as not_logged before any capture; record a result for one item and a note for the other; after reload the item history shows them and due reviews are still due; skipping the capture leaves not_logged; reloading on Routine complete keeps the minutes. _(proof: routine complete captures what each item showed without delaying the save)_
- [ ] **ac-8** — src/components/appUpdate.test.ts with fake container, registration and workers: controlled vs uncontrolled page × first install of this page's build vs update found at registration vs later × waiting vs activated without waiting vs superseded by a newer waiting worker vs activated by another window vs a route whose code is gone × one vs repeated taps × /close vs another route: the offer appears exactly when this window runs older code (never for the first install) and clears once the newest build lands; one tap gives exactly one reload, after the new worker controls or activates, or directly when nothing waits; nothing reloads without a tap in that window; on /close the offer waits until the close is saved or discarded; remounting adds no registration, listener or timer; outside a production build nothing registers and nothing throws. _(proof: the update offer follows the live registration and only the tapping window reloads)_
- [ ] **ac-9** — tests/app-update.browser.test.ts, Chromium and WebKit, on real production builds made by the test into temp dirs outside the repo (dist/ untouched): A and V2 from the repository with different stamps through the explicit override, each served from its own directory so A-only chunks are gone once V2 is served, plus V3, a sw.js byte-variant of V2; local server, no network. Rows: (A) a fresh page installs A with no offer, then is offered V2 while uncontrolled, found early and late; (B) a controlled page; (C) two windows: one tap reloads only that window, while the other shows the offer, and navigating it to a route whose A chunk is gone shows the offer in place with no page error, its own tap landing on V2 at that route; (D) V3 superseding a waiting V2; (E) no offer reappears across foreground checks while the same build is served; (F) on /close the offer waits until Save or Discard. Every tap reloads exactly once onto the newest found build; nothing reloads without a tap. Red on base for A and C, as the planner reproduced. Waits follow tests/journey-waits.test.ts. _(proof: a published update installs on the first reload in both engines without loops or surprise reloads)_
- [ ] **ac-10** — tests/app-update.browser.test.ts, sharing those builds: B, built from a temp tree holding only the inputs the stamp module lists (node_modules linked) with A's stamp, equals A byte for byte across every file, sw.js and its precache manifest included, so the build is deterministic and reads nothing else; V2's different stamp changes sw.js. In Chromium and WebKit a page on A that is served B finds no update and shows no offer across foreground checks. With the stamp test, this proves a records-, docs- or tests-only push publishes nothing a browser sees as new. _(proof: an unchanged app rebuilds byte for byte and offers no update)_
- [ ] **ac-11** — tests/app-version.test.ts in a temp git repo, driven by the stamp module's own input list: commits touching .prismatica/, docs/, tests/, other scripts or any *.md leave the stamp unchanged; a commit touching each listed input (src/, public/, index.html, vite.config.ts, the stamp module, tsconfig*.json, package.json, package-lock.json) changes it; the date is the commit's, not the build clock's; shallow history falls back to HEAD; an explicit override wins. _(proof: the build stamp names the last commit that changed what ships)_
- [ ] **ac-12** — OWNER, before approving (deploy.yml publishes only main; there is no branch preview), on the Mac through `npm run preview` at http://localhost:4173/practice-compass/ (a secure context, docs/nas-topology.md), following the procedure the builder hands over, which uses the stamp override in place of a code change: open the lane build in two windows; publish a rebuild with a new stamp: both show 'A new version is ready.', one Reload tap lands that window on the new build (Settings names it), and the other reloads only on its own tap; publish an unchanged rebuild: no offer appears. The iPhone's update path is observed after ship, not here. _(proof: manual:OWNER)_
- [ ] **ac-13** — OWNER, before approving: on the Mac through the same localhost preview, leave the app idle between blocks for a long while (or let the display sleep), then tap Start: the target cue is heard without closing the app. On the iPhone through the NAS HTTPS mirror (docs/nas-topology.md), Start a block and hear its cue; if no mirror serves, the iPhone half is environment-blocked rather than failed and is observed after ship. Audibility is the owner's. _(proof: manual:OWNER)_
- [ ] **ac-14** — OWNER, before approving, on the localhost preview holding a full backup exported from the production app and imported there, with sync never connected so no test practice reaches real history: 20-, 30- and 45-minute Setar plans give no piece or gusheh less than 10 minutes and still read as a sensible session; closing a block with a status, focus and effort change, and capturing a routine's results, each take well under a minute. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Amendments

_none_

