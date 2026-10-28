---
id: 20261028-make-live-practice-easier-to-shape-prepa-1934
title: Make live practice easier to shape, prepare for class and keep in time
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/58
intent: 20261028-make-live-practice-easier-to-shape-prepa-1934
tier: heavy
stage: review
baseline:
  commit: 66888db74b90e852e33b008dc216d4b24cb04428
  branch: main
branch: change/20261028-make-live-practice-easier-to-shape-prepa-1934
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20261028-make-live-practice-easier-to-shape-prepa-1934
builder: claude
planHash: f76aaabf536f1b2a461c1c2713d34a004de059d0f4cf69dd4463244c3c0fac70
allowedPaths:
  - src/domain/index.ts
  - src/store/useStore.ts
  - src/pages/SessionPlan.tsx
  - src/pages/ActiveBlock.tsx
  - src/pages/RoutineRunner.tsx
  - src/pages/Today.tsx
  - src/pages/CloseBlock.tsx
  - src/pages/Settings.tsx
  - src/pages/ItemDetail.tsx
  - src/pages/Lessons.tsx
  - src/pages/TeacherReport.tsx
  - AGENTS.md
  - DECISIONS.md
  - docs/practice-session-model.md
  - docs/scheduling-evidence.md
  - docs/setar-practice-reliability.md
  - src/domain/plan.ts
  - src/domain/plan.test.ts
  - src/domain/scoring.ts
  - src/domain/scoring.test.ts
  - src/domain/recommend.ts
  - src/domain/recommend.test.ts
  - src/domain/practiceSessionModel.ts
  - src/domain/practiceSessionModel.test.ts
  - src/domain/lessonAgenda.ts
  - src/domain/lessonAgenda.test.ts
  - src/domain/routines.ts
  - src/domain/routines.test.ts
  - src/domain/questions.ts
  - src/domain/questions.test.ts
  - src/components/practiceCue.ts
  - src/components/practiceCue.test.ts
  - src/components/ui.tsx
  - src/components/ClassQuestions.tsx
  - src/components/LessonAgenda.tsx
  - src/components/ItemAgenda.tsx
  - src/components/direction.test.ts
  - src/components/Metronome.tsx
  - src/components/metronome.ts
  - src/components/metronome.test.ts
  - src/components/TeacherQuestionCapture.tsx
  - src/styles/global.css
  - tests/live-practice-families.test.ts
  - tests/live-practice.browser.test.ts
  - tests/practice-session-families.test.ts
  - tests/practice-session.browser.test.ts
  - tests/practice-cues.browser.test.ts
  - tests/ui-guidance.test.ts
  - tests/ui-conformance.browser.test.ts
  - tests/pressedState.test.ts
  - tests/fixtures/live-practice-expectations.json
  - .prismatica/flows/practise-todays-recommendation.md
  - .prismatica/flows/run-a-session-plan.md
  - .prismatica/flows/work-a-pathway-stage.md
  - .prismatica/flows/prepare-for-the-next-class.md
  - .prismatica/flows/adjust-how-scheduling-works.md
forbiddenPaths:
  - src/store/syncEngine.ts
  - src/store/backup.ts
  - src/store/idb.ts
  - src/store/notesDrafts.ts
  - src/domain/io.ts
  - src/domain/migrations*
  - scripts/**
  - .github/**
  - package.json
  - package-lock.json
  - .prismatica/rules.md
nonGoals:
  - One item, mode, focus, result and next action; honest focused/whole
    evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay,
    protected/unknown/manual/fixed dates and atomic review-row decisions. Class
    reservation is organisation, never retention evidence.
  - Actual elapsed logging, Routine aggregation one block per practised bound
    item, no feedback requirement, skip versus move-on, overtime, frozen run
    contents and single unfinished clock protection.
  - Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict
    behaviour, notes ownership and latest non-empty next action.
  - Offline local-first storage, schema v17 and all existing
    migrations/validation, attachment bytes, unfinished-session sync deferral,
    backups, token secrecy, archive/NAS behaviour. No new persisted collection
    or schema change is needed.
  - Plan manual order and identity, stale-start checks, existing valid budget
    boundary, default instrument scope, Today doorway order, 44px controls,
    literal direction-aware sites, mobile viewport/tab/keyboard fixes and
    only-main scrolling.
  - Visual boundary guarantees, claim-once markers, wake-lock lifecycle and
    wall-clock authority; audio failure must never block practice.
  - No general UX audit, NAS/archive/course redesign, CI overhaul, new
    persistence/migration or speculative scheduling research. Scope globs permit
    related helper/test work, not unrelated changes.
  - No music-production controls, tap-tempo requirement, sound packs, audio
    analysis, background/lock-screen playback guarantee, practice tempo history
    or per-item tempo model.
  - No automatic redistribution during running practice; no change to the saved
    Routine from run-preview edits.
acceptanceChecks:
  - id: ac-1
    description: "Plan and Routine previews: leave/spread/chosen target, repeated
      remove/transfer, full/no eligible recipients, cancelled choice, all
      removed, prior unused remainder, role caps, short-on-time/fitted Routine.
      Literal minute accounting proves no double-spend, no automatic
      reorder/regeneration and saved routine unchanged; Start uses exactly the
      preview. Running Skip/Move on/early Finish retain their old accounting.
      Exact title names one test; use table-driven cases inside it and
      supporting existing regression checks."
    test: preview time choices preserve identity order capacity and unused remainders
  - id: ac-2
    description: "Fixed local day: at least two class items and fresh competitors,
      morning ordinary assessed and Routine not_logged blocks, heavy recent
      minutes, evening build/regenerate/length change/swap. Every exact required
      item appears when floors fit; no duplicate id, no lower-priority optional
      displacement, no false repeat reason. Include manual/protected distant
      dates, working/keep-fresh and
      uncommitted/future/passed/archive/unassigned/other-instrument/resting
      counterexamples; inputs, stored dates and spacing stay untouched. Sweep
      Today and nextPractice explanations as specified. Exact title names one
      test; use table-driven cases inside it and supporting existing regression
      checks."
    test: next class work survives morning practice in every evening plan
  - id: ac-3
    description: "Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work
      at 5; several 2-minute parts; explicitly committed parent plus child, only
      parent, only child, siblings, own-due-review relative, >120 required
      minutes and equal-date lessons. Prove reserved floors, optional roles
      yield, exact omitted titles/minimum capacity, explicit partial selection
      and no silent start. Removal/swap overrides and changed
      lesson/day/revision invalidate stale coverage acknowledgement without
      destroying manual order. Exact title names one test; use table-driven
      cases inside it and supporting existing regression checks."
    test: class plan capacity exceptions name omissions before any partial start
  - id: ac-4
    description: Select-clear before Save; save-clear-save; observations retained;
      repeated saves/retries; multiple items; foreign/deleted block refused
      atomically. Clearing latest assessed block restores older result or no
      lastResult when none exists, leaves a newer assessment alone. Exact block
      minutes/scope, reviews/dates/spacing/readiness unchanged, results visible
      honestly in item/history/Insights/report consumers. Exact title names one
      test; use table-driven cases inside it and supporting existing regression
      checks.
    test: routine feedback can be cleared without changing practice or retention
  - id: ac-5
    description: "Real ordinary, Plan and Routine doors, including unbound segment;
      save/cancel/blank, no lesson, changed/deleted/cross-instrument
      lesson/item, boundary while typing, multiple questions and a later Close
      question. Assert clock identity/elapsed progression, focus and existing
      note drafts, cue markers unchanged. Inject persistence failure after
      agenda append, retry and reload: one question, retained words and truthful
      saving/failed/saved states. Verify lesson-id list/report visibility,
      unassigned fallback and unchanged preparation/ranking. Exact title names
      one test; use table-driven cases inside it and supporting existing
      regression checks."
    test: live teacher questions retain capture ownership while practice continues
  - id: ac-6
    description: "Controlled audio timeline and fake contexts: bounded tempo edits,
      start/stop, rapid toggles, denied/rejected/never-settled resume, dead
      running/suspended/interrupted/closed context, fresh readying tap/test
      replacement, old callback/remount, pause/finish/discard/navigation/hidden.
      No orphan scheduled beat, stacked loop or late burst. Cue retains
      once-only claim and priority/ducking then correct beat cadence, with
      literal timestamps/levels rather than source assertions; unavailable audio
      remains usable practice. Exact title names one test; use table-driven
      cases inside it and supporting existing regression checks."
    test: metronome scheduling and cue priority survive sound lifecycle changes
  - id: ac-7
    description: Chromium and WebKit journeys via real UI for ordinary/Plan/Routine,
      running question input and tempo controls across boundary and keyboard
      dismissal, stop/resume/reload after a finished run. Assert no extra
      minutes/blocks, notes remain durable, order/unfinished practice preserved,
      sound recovery doors work, hidden/paused metronome stops and visual cue
      remains. Reuse existing harness and conformance/direction/pressed-state
      checks without weakening them. Exact title names one test; use
      table-driven cases inside it and supporting existing regression checks.
    test: live practice tools preserve clocks notes records and mobile controls
  - id: ac-8
    description: "One bounded real-practice walkthrough with Setar: MacBook and
      iPhone Safari plus installed PWA over HTTPS, normal media volume beside
      the instrument. Check cue clearly distinguishable/audible with and without
      metronome, comfortable BPM/level edits, boundary priority, sound recovery
      after idle/interruption and quick teacher capture/keyboard return while
      timer and beat continue. Record devices/versions/output and actual
      observations; automation cannot certify speaker volume or musical
      usability. Only reproducible failures of these promised
      controls/audibility require adjustment, not an open-ended taste review."
    test: manual:OWNER
docsDelta:
  - AGENTS.md
  - DECISIONS.md
  - docs/practice-session-model.md
  - docs/scheduling-evidence.md
  - docs/setar-practice-reliability.md
createdAt: 2026-10-28T18:04:01.770Z
amendments: []
---

# Make live practice easier to shape, prepare for class and keep in time

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/58
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** 66888db74b90e852e33b008dc216d4b24cb04428 on main _(never re-baselined)_
- **Intent:** 20261028-make-live-practice-easier-to-shape-prepa-1934

## You may only change

- src/domain/index.ts
- src/store/useStore.ts
- src/pages/SessionPlan.tsx
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Today.tsx
- src/pages/CloseBlock.tsx
- src/pages/Settings.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- AGENTS.md
- DECISIONS.md
- docs/practice-session-model.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md
- src/domain/plan.ts
- src/domain/plan.test.ts
- src/domain/scoring.ts
- src/domain/scoring.test.ts
- src/domain/recommend.ts
- src/domain/recommend.test.ts
- src/domain/practiceSessionModel.ts
- src/domain/practiceSessionModel.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/ui.tsx
- src/components/ClassQuestions.tsx
- src/components/LessonAgenda.tsx
- src/components/ItemAgenda.tsx
- src/components/direction.test.ts
- src/components/Metronome.tsx
- src/components/metronome.ts
- src/components/metronome.test.ts
- src/components/TeacherQuestionCapture.tsx
- src/styles/global.css
- tests/live-practice-families.test.ts
- tests/live-practice.browser.test.ts
- tests/practice-session-families.test.ts
- tests/practice-session.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/ui-guidance.test.ts
- tests/ui-conformance.browser.test.ts
- tests/pressedState.test.ts
- tests/fixtures/live-practice-expectations.json
- .prismatica/flows/practise-todays-recommendation.md
- .prismatica/flows/run-a-session-plan.md
- .prismatica/flows/work-a-pathway-stage.md
- .prismatica/flows/prepare-for-the-next-class.md
- .prismatica/flows/adjust-how-scheduling-works.md

## Never touch

- src/store/syncEngine.ts
- src/store/backup.ts
- src/store/idb.ts
- src/store/notesDrafts.ts
- src/domain/io.ts
- src/domain/migrations*
- scripts/**
- .github/**
- package.json
- package-lock.json
- .prismatica/rules.md

## Non-goals

- One item, mode, focus, result and next action; honest focused/whole evidence; Working 1–3-day returns; Keep-fresh retention, srLastProgressDay, protected/unknown/manual/fixed dates and atomic review-row decisions. Class reservation is organisation, never retention evidence.
- Actual elapsed logging, Routine aggregation one block per practised bound item, no feedback requirement, skip versus move-on, overtime, frozen run contents and single unfinished clock protection.
- Autosaved item/lesson notes, drafts, recovery/retry/keep-both conflict behaviour, notes ownership and latest non-empty next action.
- Offline local-first storage, schema v17 and all existing migrations/validation, attachment bytes, unfinished-session sync deferral, backups, token secrecy, archive/NAS behaviour. No new persisted collection or schema change is needed.
- Plan manual order and identity, stale-start checks, existing valid budget boundary, default instrument scope, Today doorway order, 44px controls, literal direction-aware sites, mobile viewport/tab/keyboard fixes and only-main scrolling.
- Visual boundary guarantees, claim-once markers, wake-lock lifecycle and wall-clock authority; audio failure must never block practice.
- No general UX audit, NAS/archive/course redesign, CI overhaul, new persistence/migration or speculative scheduling research. Scope globs permit related helper/test work, not unrelated changes.
- No music-production controls, tap-tempo requirement, sound packs, audio analysis, background/lock-screen playback guarantee, practice tempo history or per-item tempo model.
- No automatic redistribution during running practice; no change to the saved Routine from run-preview edits.

## Acceptance checks (definition of done)

- [ ] **ac-1** — Plan and Routine previews: leave/spread/chosen target, repeated remove/transfer, full/no eligible recipients, cancelled choice, all removed, prior unused remainder, role caps, short-on-time/fitted Routine. Literal minute accounting proves no double-spend, no automatic reorder/regeneration and saved routine unchanged; Start uses exactly the preview. Running Skip/Move on/early Finish retain their old accounting. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: preview time choices preserve identity order capacity and unused remainders)_
- [ ] **ac-2** — Fixed local day: at least two class items and fresh competitors, morning ordinary assessed and Routine not_logged blocks, heavy recent minutes, evening build/regenerate/length change/swap. Every exact required item appears when floors fit; no duplicate id, no lower-priority optional displacement, no false repeat reason. Include manual/protected distant dates, working/keep-fresh and uncommitted/future/passed/archive/unassigned/other-instrument/resting counterexamples; inputs, stored dates and spacing stay untouched. Sweep Today and nextPractice explanations as specified. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: next class work survives morning practice in every evening plan)_
- [ ] **ac-3** — Literal fixtures: 2 whole works at 20 and 15 minutes; a whole work at 5; several 2-minute parts; explicitly committed parent plus child, only parent, only child, siblings, own-due-review relative, >120 required minutes and equal-date lessons. Prove reserved floors, optional roles yield, exact omitted titles/minimum capacity, explicit partial selection and no silent start. Removal/swap overrides and changed lesson/day/revision invalidate stale coverage acknowledgement without destroying manual order. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: class plan capacity exceptions name omissions before any partial start)_
- [ ] **ac-4** — Select-clear before Save; save-clear-save; observations retained; repeated saves/retries; multiple items; foreign/deleted block refused atomically. Clearing latest assessed block restores older result or no lastResult when none exists, leaves a newer assessment alone. Exact block minutes/scope, reviews/dates/spacing/readiness unchanged, results visible honestly in item/history/Insights/report consumers. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: routine feedback can be cleared without changing practice or retention)_
- [ ] **ac-5** — Real ordinary, Plan and Routine doors, including unbound segment; save/cancel/blank, no lesson, changed/deleted/cross-instrument lesson/item, boundary while typing, multiple questions and a later Close question. Assert clock identity/elapsed progression, focus and existing note drafts, cue markers unchanged. Inject persistence failure after agenda append, retry and reload: one question, retained words and truthful saving/failed/saved states. Verify lesson-id list/report visibility, unassigned fallback and unchanged preparation/ranking. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: live teacher questions retain capture ownership while practice continues)_
- [ ] **ac-6** — Controlled audio timeline and fake contexts: bounded tempo edits, start/stop, rapid toggles, denied/rejected/never-settled resume, dead running/suspended/interrupted/closed context, fresh readying tap/test replacement, old callback/remount, pause/finish/discard/navigation/hidden. No orphan scheduled beat, stacked loop or late burst. Cue retains once-only claim and priority/ducking then correct beat cadence, with literal timestamps/levels rather than source assertions; unavailable audio remains usable practice. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: metronome scheduling and cue priority survive sound lifecycle changes)_
- [ ] **ac-7** — Chromium and WebKit journeys via real UI for ordinary/Plan/Routine, running question input and tempo controls across boundary and keyboard dismissal, stop/resume/reload after a finished run. Assert no extra minutes/blocks, notes remain durable, order/unfinished practice preserved, sound recovery doors work, hidden/paused metronome stops and visual cue remains. Reuse existing harness and conformance/direction/pressed-state checks without weakening them. Exact title names one test; use table-driven cases inside it and supporting existing regression checks. _(proof: live practice tools preserve clocks notes records and mobile controls)_
- [ ] **ac-8** — One bounded real-practice walkthrough with Setar: MacBook and iPhone Safari plus installed PWA over HTTPS, normal media volume beside the instrument. Check cue clearly distinguishable/audible with and without metronome, comfortable BPM/level edits, boundary priority, sound recovery after idle/interruption and quick teacher capture/keyboard return while timer and beat continue. Record devices/versions/output and actual observations; automation cannot certify speaker volume or musical usability. Only reproducible failures of these promised controls/audibility require adjustment, not an open-ended taste review. _(proof: manual:OWNER)_

## Docs to update

- AGENTS.md
- DECISIONS.md
- docs/practice-session-model.md
- docs/scheduling-evidence.md
- docs/setar-practice-reliability.md

## Amendments

_none_

