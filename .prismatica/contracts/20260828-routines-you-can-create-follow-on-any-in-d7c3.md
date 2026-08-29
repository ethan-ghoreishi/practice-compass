---
id: 20260828-routines-you-can-create-follow-on-any-in-d7c3
title: Routines you can create, follow on any instrument, and actually log
issue: https://github.com/ethan-ghoreishi/practice-compass/issues/5
intent: 20260828-routines-you-can-create-follow-on-any-in-d7c3
tier: heavy
stage: review
baseline:
  commit: a8ad01a8c187b768773a3f95ab497a232c30e8a1
  branch: main
branch: change/20260828-routines-you-can-create-follow-on-any-in-d7c3
worktree: /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-routines-you-can-create-follow-on-any-in-d7c3
builder: claude
planHash: 7fb099a119e3367384fe68252aafcb3a42d0ea71df71eec4df2b40f6df926d1e
allowedPaths:
  - src/domain/types.ts
  - src/domain/routines.ts
  - src/domain/routines.test.ts
  - src/domain/migrations.ts
  - src/domain/migrations.test.ts
  - src/domain/index.ts
  - src/domain/defaults.ts
  - src/store/useStore.ts
  - src/pages/RoutineRunner.tsx
  - src/pages/RoutineEdit.tsx
  - src/pages/PathwayDetail.tsx
  - src/pages/StageDetail.tsx
  - src/pages/Today.tsx
  - src/App.tsx
  - CLAUDE.md
  - AGENTS.md
  - src/pages/ActiveBlock.tsx
forbiddenPaths: []
nonGoals:
  - No third session system, and no merging with the Session Plan.
    src/domain/plan.ts is not modified, its sum-equals-budget invariant and
    tests stay green, and RoutineRunner remains a distinct thing from the plan
    runner.
  - Practising through the ordinary close flow stays the ONLY thing that
    completes a review or advances SM-2. A routine records time; it never
    advances the schedule.
  - Unbound segments behave exactly as they do today. The seeded CGS routines
    must keep running unchanged for a user who binds nothing.
  - No seeded routines for Setar or Tar. The app makes them creatable; inventing
    their content would fabricate authority that belongs to the teacher.
  - The shared migrateToCurrent chain stays the only migration path — v11 goes
    INTO it, never around it — and every acceptance test from the migration lane
    stays green.
  - Today's primary recommendation stays above the fold at 390x844 and PlanCard
    stays collapsed at roughly 50px. Routines add a branch to it, not a new
    section.
  - "No gamification on the routine finish screen: no streak, no score, no
    fabricated mastery. Honest minutes and what was recorded, nothing else."
  - Deleting a pathway or a stage must never delete a routine the user made — it
    detaches it, exactly as it already does for items.
  - Starting a routine stays a one-tap action; binding an item to a segment is
    optional and progressive, never required to run one.
  - "No routine data may be fabricated by the migration: a routine on a General
    (no-instrument) pathway must survive v11 without an instrument being
    invented for it."
  - A bound segment's itemId must never dangle. Item deletion, item instrument
    change, routine instrument change and pathway instrument change each have a
    defined outcome, and none of them may delete a segment or silently rewrite a
    routine's instrument.
  - "Instrument agreement is never achieved by rewriting: neither a pathway's
    instrument nor a routine's is silently changed to match the other.
    Incompatibility is resolved by detaching the placement."
  - Review §3.3 — wake lock and an end-of-block signal. ActiveBlock is otherwise
    untouched by this lane and wakeLock is a capability addition rather than a
    routines feature. It is the natural follow-up and should take both timer
    screens together.
  - Review §3.5 fresh-install seeding, §3.2 persian search wiring, §3.1 touch
    targets, §2.1 class-work fallback, §2.2 attachment silent failure, §4.2 nav
    shape, §4.3 dead surface, §4.4 Settings split.
  - Build advisory §1 NAS folder picker, §2 lesson materials view, §4 item
    categories. §4 is the natural next lane after this one.
  - No change to src/domain/plan.ts or the Session Plan's behaviour. The two
    systems stay separate by design.
  - No seeded routine content for Setar or Tar, and no change to the CGS
    routine's segments.
  - No retuning of isSaturated, scoreItems or any scheduling constant. If a
    routine's blocks interact badly with saturation, report it rather than
    adjusting the shared function inside this lane.
  - "Nothing is hard-forbidden: the frame is the files in `allow`, and anything
    genuinely needed beyond them should be added by `prismatica amend` rather
    than worked around."
  - "Desired rule (not yet truth): A routine records real practice time but
    never a judgement: it writes at most one block per item per run, aggregating
    repeated segments, and never completes a review or advances spaced
    repetition."
  - >-
    Supersedes the earlier 'Routines add a branch to PlanCard, not a new
    section' constraint. Session Plan and Routines may instead be two compact
    peer doorway controls with independent state, provided they remain separate
    systems and the primary recommendation remains above the fold at 390×844.

    3.
  - At 390×844, collapsed Session Plan and Routines peer doorways are both
    visible without pushing the primary 'Practise now' recommendation below the
    fold.
acceptanceChecks:
  - id: ac-1
    description: "The collision this lane exists to avoid, tested against the real
      seeded fixture: a routine whose 13 segments repeat one item four times
      produces ONE block for that item, carrying the ACTUAL elapsed running time
      summed across all four visits — not four blocks, and not authored minutes
      taken on trust."
    test: aggregates a repeated segment into one block per item, not one per segment
  - id: ac-2
    description: The consequence that proves it matters. After a single run of that
      routine the repeated item is NOT saturated — per-segment blocks would trip
      isSaturated's three-in-48-hours rule immediately and make the app penalise
      the user for following the syllabus.
    test: leaves an item unsaturated after a routine that repeats it four times
  - id: ac-3
    description: "A routine records honest time without touching the schedule:
      minutes and timesPractised move, but no review is completed and srReps,
      srEase and srIntervalDays are untouched, because the default result is
      not_logged."
    test: records routine minutes without completing a review or advancing SM-2
  - id: ac-4
    description: The item's previously recorded result survives a routine run rather
      than being overwritten or invented — nothing about how the piece went is
      fabricated from time spent.
    test: keeps the item's previous result after an unlogged routine block
  - id: ac-5
    description: "The syllabus's asterisk rule, honoured: with short-on-time chosen,
      non-essential segments are dropped and the remaining minutes are reported
      honestly rather than silently rescaled."
    test: drops non-essential segments when short on time is chosen
  - id: ac-6
    description: "The discriminating partner to the check above: with short-on-time
      off, every segment survives in its authored order. Together they prove the
      filter is driven by the essential flag and nothing else."
    test: keeps every segment when short on time is not chosen
  - id: ac-7
    description: "The v11 migration, running inside the shared migrateToCurrent
      chain: an existing routine gains its instrumentId backfilled from the
      pathway it belonged to, and a database already at v11 passes through
      unchanged."
    test: backfills a routine instrument from its pathway on the shared chain
  - id: ac-8
    description: A user's routine survives the removal of the pathway it was placed
      in — it is detached, not deleted — matching the rule already applied to
      items.
    test: detaches a routine when its pathway is deleted instead of deleting it
  - id: ac-9
    description: "Duplicate produces an independent editable copy: editing the
      copy's segments leaves the original untouched, which is the 'copy Stage 1
      and adjust' workflow the syllabus describes."
    test: duplicates a routine as an independent copy
  - id: ac-10
    description: "Review §2.4: remaining time is derived from elapsed wall-clock
      time rather than from a count of ticks, so a run that was backgrounded for
      real minutes reports those minutes as gone."
    test: derives remaining time from the wall clock rather than tick count
  - id: ac-11
    description: "Scoping: only routines belonging to the session instrument are
      offered, so a Setar session never surfaces a guitar routine."
    test: offers only routines for the session instrument
  - id: ac-12
    description: "Paused time is not practice: a run that sits paused for several
      minutes records only the time the timer was actually running, and the
      pause does not consume the segment either."
    test: excludes paused time from a routine's recorded minutes
  - id: ac-13
    description: "The catch-up edge that a naive wall-clock rewrite fails: returning
      after the phone was locked for longer than the current segment lands the
      runner on the correct LATER segment, having advanced past every boundary
      that elapsed, rather than moving on by one."
    test: catches up across multiple segment boundaries after a long background
      interval
  - id: ac-14
    description: A segment cut short contributes only the time actually spent, while
      one played through contributes its full authored duration — the
      discriminating pair that proves recorded time is measured, not assumed.
    test: records a shortened segment's real time and a completed segment's full
      duration
  - id: ac-15
    description: "No fabrication and no invalid scoping in the migration, across all
      three ways a pathway can fail to name a usable instrument: a General
      pathway with none, a legacy pathway carrying an empty-string id (reachable
      from migrateToV3's `?? ''`), and one whose id does not resolve in
      db.instruments. Each leaves the routine unscoped; only a pathway with a
      real, resolvable instrument backfills."
    test: backfills only from a resolvable instrument and never invents one
  - id: ac-16
    description: "Routine-created blocks are semantically indistinguishable from
      ordinary ones: mode, focus, materialId and instrumentId match exactly what
      starting that same item from its detail page would have produced,
      including the strand fallback for focus."
    test: gives a routine block the same mode and focus as starting the item directly
  - id: ac-17
    description: "The binding lifecycle, proved at its sharpest edge: deleting a
      bound item unbinds it from every routine segment while the segment itself
      survives as an unbound countdown, so no routine is silently shortened and
      no itemId dangles."
    test: unbinds a deleted item from routine segments without removing the segment
  - id: ac-18
    description: "The discriminating partner: changing a bound item's instrument
      unbinds it from routines that no longer match, while leaving bindings on
      matching routines intact."
    test: unbinds an item whose instrument no longer matches the routine
  - id: ac-19
    description: An instrument change on a pathway detaches an incompatible placed
      routine from that pathway rather than rewriting the routine's own
      instrument.
    test: detaches an incompatible routine when its pathway changes instrument
  - id: ac-20
    description: "The routine-side half of the instrument lifecycle, proving both
      consequences at once: changing a routine's instrument clears the item
      bindings that no longer match AND detaches it from a pathway/stage whose
      instrument no longer matches, while leaving the pathway's own instrument
      untouched."
    test: clears incompatible bindings and placement when a routine changes
      instrument
  - id: ac-21
    description: "Stage deletion is not pathway deletion, and must be proved
      separately rather than inferred: deleting a stage keeps the routine AND
      its pathwayId, clearing only stageId, so the routine stays in the pathway
      it still belongs to."
    test: keeps a routine in its pathway when only its stage is deleted
  - id: ac-22
    description: "End to end in the running app. On Setar — which starts with no
      routines — use Today's plan card to create the first one, binding two
      segments to real items, then run it. Confirm: the empty state offered
      'Create a routine' and preselected Setar; the timer keeps real time across
      locking the phone mid-segment and lands on the right segment; pausing does
      not burn time; after the run each bound item shows one block with the real
      aggregated minutes, its previous result unchanged, no new review, and the
      same mode and focus a normal start would give. Then run it again with
      'short on time', and confirm the seeded guitar Stage 1 routine still
      behaves exactly as before."
    test: manual:OWNER
docsDelta:
  - CLAUDE.md
  - AGENTS.md
createdAt: 2026-08-28T19:37:54.903Z
amendments:
  - at: 2026-08-28T22:26:37.006Z
    reason: "OWNER manual ac-22 showed that nesting routines inside the Session Plan
      doorway made routines read as subordinate to choosing a plan duration,
      caused them to be hidden again on return to Today, and made key routine
      actions hard to discover. Replace the single nested doorway with two
      compact peer doorway pills for Session Plan and Routines, each with
      independent state. This changes the recorded UI shape but preserves the
      underlying constraints: the systems remain separate, Today stays compact,
      and the primary recommendation remains above the fold at 390x844, verified
      live."
    description: >-
      non-goals += Supersedes the earlier 'Routines add a branch to PlanCard,
      not a new section' constraint. Session Plan and Routines may instead be
      two compact peer doorway controls with independent state, provided they
      remain separate systems and the primary recommendation remains above the
      fold at 390×844.

      3., At 390×844, collapsed Session Plan and Routines peer doorways are both
      visible without pushing the primary 'Practise now' recommendation below
      the fold.
  - at: 2026-08-29T22:37:00.830Z
    reason: OWNER manual testing found that ActiveBlock's Discard action uniquely
      returns to Today even when a Session Plan is active, while CloseBlock
      already returns Save/Discard to /plan. Allow ActiveBlock.tsx so this
      navigation can follow the existing Plan-aware convention without changing
      plan.ts or Session Plan semantics.
    description: allow += src/pages/ActiveBlock.tsx
---

# Routines you can create, follow on any instrument, and actually log

- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/5
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Baseline:** a8ad01a8c187b768773a3f95ab497a232c30e8a1 on main _(never re-baselined)_
- **Intent:** 20260828-routines-you-can-create-follow-on-any-in-d7c3

## You may only change

- src/domain/types.ts
- src/domain/routines.ts
- src/domain/routines.test.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/index.ts
- src/domain/defaults.ts
- src/store/useStore.ts
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/Today.tsx
- src/App.tsx
- CLAUDE.md
- AGENTS.md
- src/pages/ActiveBlock.tsx

## Never touch

_nothing explicitly forbidden_

## Non-goals

- No third session system, and no merging with the Session Plan. src/domain/plan.ts is not modified, its sum-equals-budget invariant and tests stay green, and RoutineRunner remains a distinct thing from the plan runner.
- Practising through the ordinary close flow stays the ONLY thing that completes a review or advances SM-2. A routine records time; it never advances the schedule.
- Unbound segments behave exactly as they do today. The seeded CGS routines must keep running unchanged for a user who binds nothing.
- No seeded routines for Setar or Tar. The app makes them creatable; inventing their content would fabricate authority that belongs to the teacher.
- The shared migrateToCurrent chain stays the only migration path — v11 goes INTO it, never around it — and every acceptance test from the migration lane stays green.
- Today's primary recommendation stays above the fold at 390x844 and PlanCard stays collapsed at roughly 50px. Routines add a branch to it, not a new section.
- No gamification on the routine finish screen: no streak, no score, no fabricated mastery. Honest minutes and what was recorded, nothing else.
- Deleting a pathway or a stage must never delete a routine the user made — it detaches it, exactly as it already does for items.
- Starting a routine stays a one-tap action; binding an item to a segment is optional and progressive, never required to run one.
- No routine data may be fabricated by the migration: a routine on a General (no-instrument) pathway must survive v11 without an instrument being invented for it.
- A bound segment's itemId must never dangle. Item deletion, item instrument change, routine instrument change and pathway instrument change each have a defined outcome, and none of them may delete a segment or silently rewrite a routine's instrument.
- Instrument agreement is never achieved by rewriting: neither a pathway's instrument nor a routine's is silently changed to match the other. Incompatibility is resolved by detaching the placement.
- Review §3.3 — wake lock and an end-of-block signal. ActiveBlock is otherwise untouched by this lane and wakeLock is a capability addition rather than a routines feature. It is the natural follow-up and should take both timer screens together.
- Review §3.5 fresh-install seeding, §3.2 persian search wiring, §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §4.2 nav shape, §4.3 dead surface, §4.4 Settings split.
- Build advisory §1 NAS folder picker, §2 lesson materials view, §4 item categories. §4 is the natural next lane after this one.
- No change to src/domain/plan.ts or the Session Plan's behaviour. The two systems stay separate by design.
- No seeded routine content for Setar or Tar, and no change to the CGS routine's segments.
- No retuning of isSaturated, scoreItems or any scheduling constant. If a routine's blocks interact badly with saturation, report it rather than adjusting the shared function inside this lane.
- Nothing is hard-forbidden: the frame is the files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around.
- Desired rule (not yet truth): A routine records real practice time but never a judgement: it writes at most one block per item per run, aggregating repeated segments, and never completes a review or advances spaced repetition.
- Supersedes the earlier 'Routines add a branch to PlanCard, not a new section' constraint. Session Plan and Routines may instead be two compact peer doorway controls with independent state, provided they remain separate systems and the primary recommendation remains above the fold at 390×844.
3.
- At 390×844, collapsed Session Plan and Routines peer doorways are both visible without pushing the primary 'Practise now' recommendation below the fold.

## Acceptance checks (definition of done)

- [ ] **ac-1** — The collision this lane exists to avoid, tested against the real seeded fixture: a routine whose 13 segments repeat one item four times produces ONE block for that item, carrying the ACTUAL elapsed running time summed across all four visits — not four blocks, and not authored minutes taken on trust. _(proof: aggregates a repeated segment into one block per item, not one per segment)_
- [ ] **ac-2** — The consequence that proves it matters. After a single run of that routine the repeated item is NOT saturated — per-segment blocks would trip isSaturated's three-in-48-hours rule immediately and make the app penalise the user for following the syllabus. _(proof: leaves an item unsaturated after a routine that repeats it four times)_
- [ ] **ac-3** — A routine records honest time without touching the schedule: minutes and timesPractised move, but no review is completed and srReps, srEase and srIntervalDays are untouched, because the default result is not_logged. _(proof: records routine minutes without completing a review or advancing SM-2)_
- [ ] **ac-4** — The item's previously recorded result survives a routine run rather than being overwritten or invented — nothing about how the piece went is fabricated from time spent. _(proof: keeps the item's previous result after an unlogged routine block)_
- [ ] **ac-5** — The syllabus's asterisk rule, honoured: with short-on-time chosen, non-essential segments are dropped and the remaining minutes are reported honestly rather than silently rescaled. _(proof: drops non-essential segments when short on time is chosen)_
- [ ] **ac-6** — The discriminating partner to the check above: with short-on-time off, every segment survives in its authored order. Together they prove the filter is driven by the essential flag and nothing else. _(proof: keeps every segment when short on time is not chosen)_
- [ ] **ac-7** — The v11 migration, running inside the shared migrateToCurrent chain: an existing routine gains its instrumentId backfilled from the pathway it belonged to, and a database already at v11 passes through unchanged. _(proof: backfills a routine instrument from its pathway on the shared chain)_
- [ ] **ac-8** — A user's routine survives the removal of the pathway it was placed in — it is detached, not deleted — matching the rule already applied to items. _(proof: detaches a routine when its pathway is deleted instead of deleting it)_
- [ ] **ac-9** — Duplicate produces an independent editable copy: editing the copy's segments leaves the original untouched, which is the 'copy Stage 1 and adjust' workflow the syllabus describes. _(proof: duplicates a routine as an independent copy)_
- [ ] **ac-10** — Review §2.4: remaining time is derived from elapsed wall-clock time rather than from a count of ticks, so a run that was backgrounded for real minutes reports those minutes as gone. _(proof: derives remaining time from the wall clock rather than tick count)_
- [ ] **ac-11** — Scoping: only routines belonging to the session instrument are offered, so a Setar session never surfaces a guitar routine. _(proof: offers only routines for the session instrument)_
- [ ] **ac-12** — Paused time is not practice: a run that sits paused for several minutes records only the time the timer was actually running, and the pause does not consume the segment either. _(proof: excludes paused time from a routine's recorded minutes)_
- [ ] **ac-13** — The catch-up edge that a naive wall-clock rewrite fails: returning after the phone was locked for longer than the current segment lands the runner on the correct LATER segment, having advanced past every boundary that elapsed, rather than moving on by one. _(proof: catches up across multiple segment boundaries after a long background interval)_
- [ ] **ac-14** — A segment cut short contributes only the time actually spent, while one played through contributes its full authored duration — the discriminating pair that proves recorded time is measured, not assumed. _(proof: records a shortened segment's real time and a completed segment's full duration)_
- [ ] **ac-15** — No fabrication and no invalid scoping in the migration, across all three ways a pathway can fail to name a usable instrument: a General pathway with none, a legacy pathway carrying an empty-string id (reachable from migrateToV3's `?? ''`), and one whose id does not resolve in db.instruments. Each leaves the routine unscoped; only a pathway with a real, resolvable instrument backfills. _(proof: backfills only from a resolvable instrument and never invents one)_
- [ ] **ac-16** — Routine-created blocks are semantically indistinguishable from ordinary ones: mode, focus, materialId and instrumentId match exactly what starting that same item from its detail page would have produced, including the strand fallback for focus. _(proof: gives a routine block the same mode and focus as starting the item directly)_
- [ ] **ac-17** — The binding lifecycle, proved at its sharpest edge: deleting a bound item unbinds it from every routine segment while the segment itself survives as an unbound countdown, so no routine is silently shortened and no itemId dangles. _(proof: unbinds a deleted item from routine segments without removing the segment)_
- [ ] **ac-18** — The discriminating partner: changing a bound item's instrument unbinds it from routines that no longer match, while leaving bindings on matching routines intact. _(proof: unbinds an item whose instrument no longer matches the routine)_
- [ ] **ac-19** — An instrument change on a pathway detaches an incompatible placed routine from that pathway rather than rewriting the routine's own instrument. _(proof: detaches an incompatible routine when its pathway changes instrument)_
- [ ] **ac-20** — The routine-side half of the instrument lifecycle, proving both consequences at once: changing a routine's instrument clears the item bindings that no longer match AND detaches it from a pathway/stage whose instrument no longer matches, while leaving the pathway's own instrument untouched. _(proof: clears incompatible bindings and placement when a routine changes instrument)_
- [ ] **ac-21** — Stage deletion is not pathway deletion, and must be proved separately rather than inferred: deleting a stage keeps the routine AND its pathwayId, clearing only stageId, so the routine stays in the pathway it still belongs to. _(proof: keeps a routine in its pathway when only its stage is deleted)_
- [ ] **ac-22** — End to end in the running app. On Setar — which starts with no routines — use Today's plan card to create the first one, binding two segments to real items, then run it. Confirm: the empty state offered 'Create a routine' and preselected Setar; the timer keeps real time across locking the phone mid-segment and lands on the right segment; pausing does not burn time; after the run each bound item shows one block with the real aggregated minutes, its previous result unchanged, no new review, and the same mode and focus a normal start would give. Then run it again with 'short on time', and confirm the seeded guitar Stage 1 routine still behaves exactly as before. _(proof: manual:OWNER)_

## Docs to update

- CLAUDE.md
- AGENTS.md

## Amendments

- 2026-08-28T22:26:37.006Z — OWNER manual ac-22 showed that nesting routines inside the Session Plan doorway made routines read as subordinate to choosing a plan duration, caused them to be hidden again on return to Today, and made key routine actions hard to discover. Replace the single nested doorway with two compact peer doorway pills for Session Plan and Routines, each with independent state. This changes the recorded UI shape but preserves the underlying constraints: the systems remain separate, Today stays compact, and the primary recommendation remains above the fold at 390x844, verified live.: non-goals += Supersedes the earlier 'Routines add a branch to PlanCard, not a new section' constraint. Session Plan and Routines may instead be two compact peer doorway controls with independent state, provided they remain separate systems and the primary recommendation remains above the fold at 390×844.
3., At 390×844, collapsed Session Plan and Routines peer doorways are both visible without pushing the primary 'Practise now' recommendation below the fold.
- 2026-08-29T22:37:00.830Z — OWNER manual testing found that ActiveBlock's Discard action uniquely returns to Today even when a Session Plan is active, while CloseBlock already returns Save/Discard to /plan. Allow ActiveBlock.tsx so this navigation can follow the existing Plan-aware convention without changing plan.ts or Session Plan semantics.: allow += src/pages/ActiveBlock.tsx

