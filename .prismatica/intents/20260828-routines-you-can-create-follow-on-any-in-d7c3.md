---
id: 20260828-routines-you-can-create-follow-on-any-in-d7c3
title: Routines you can create, follow on any instrument, and actually log
state: open
checks:
  - id: ac-1
    description: "The collision this lane exists to avoid, tested against the real
      seeded fixture: a routine whose 13 segments repeat one item four times
      produces ONE block for that item, carrying the ACTUAL elapsed running time
      summed across all four visits — not four blocks, and not authored minutes
      taken on trust."
    status: unproven
  - id: ac-2
    description: The consequence that proves it matters. After a single run of that
      routine the repeated item is NOT saturated — per-segment blocks would trip
      isSaturated's three-in-48-hours rule immediately and make the app penalise
      the user for following the syllabus.
    status: unproven
  - id: ac-3
    description: "A routine records honest time without touching the schedule:
      minutes and timesPractised move, but no review is completed and srReps,
      srEase and srIntervalDays are untouched, because the default result is
      not_logged."
    status: unproven
  - id: ac-4
    description: The item's previously recorded result survives a routine run rather
      than being overwritten or invented — nothing about how the piece went is
      fabricated from time spent.
    status: unproven
createdAt: 2026-08-28T19:37:54.903Z
---

# Approved intent: Routines you can create, follow on any instrument, and actually log

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> The migration lane is merged, so the schema bump is safe now. Take the next lane wide: practice routines — the build advisory calls it the largest gap and it is the one that affects the instrument I actually practise. Right now routines exist only on the guitar pathway, Setar and Tar have none and there is no way to make one, they are four taps deep and never appear on Today, and running a 20-minute routine records nothing at all. Make routines ordinary editable data for any instrument, let a segment be bound to a real practice item so the time counts, honour the syllabus's 'essential' asterisks with a short-on-time option, and put them on Today next to the session plan. Do not build a third session system and do not merge them with the Session Plan.

## Why

This is the largest verified gap left, and the single strongest fact in the analysis is that the user practises Setar while routines exist only for Classical Guitar — and cannot be created.

1. It is uncreatable, not merely thin. There is no addRoutine, updateRoutine or deleteRoutine anywhere in the store. The only three references to pathwayRoutines (useStore.ts:956, :984, :1021) SEED them or DELETE them as a side effect of removing a pathway or stage. The syllabus this app is built on says 'You can also design your own routine similar to these' — that sentence is the feature request, in the source material, and the app cannot honour it.

2. It records nothing, which is the crux. A 20-minute CGS routine is the user's real practice that day, but the finish screen says 'Routine complete', navigates away, and logs no block, no minutes and no item stats. It appears in no insight and no balance figure. The app's whole promise is an honest record; this is a 20-minute hole in it.

3. It is now unblocked and it is the right moment. It needs schema v11, which the just-merged migration lane exists to make safe — this is the first bump to run through the shared migrateToCurrent chain, so it also proves that lane's work under real conditions rather than only in tests.

4. The scope is genuinely wide as asked: types and a v11 migration, a new pure domain module, full store CRUD, the runner, a routine editor, the stage and pathway pages, and Today. It also absorbs review finding §2.4 (the runner counts setInterval ticks rather than the wall clock, so a locked phone loses real time) because it is the same file and a hands-free timer that silently under-counts is exactly what this lane is fixing.

## Today

Step 1 of this flow promises 'guided routines if any'. Verified state of 'if any':

• GUITAR ONLY. pathwaySeed.ts seeds routines in exactly one place (line 182), on the CGS pathway. Setar and Tar have zero. SEED_PATHWAY_IDS covers all three instruments; routines cover one.

• UNCREATABLE. No addRoutine / updateRoutine / deleteRoutine / duplicateRoutine exists in the store. The three references at useStore.ts:956, :984 and :1021 are a seed and two cascade DELETES. PathwayRoutine.pathwayId is a REQUIRED field (types.ts:417), so a standalone 'my Setar warm-up' cannot be represented at all.

• UNREACHABLE FROM TODAY. Neither Today.tsx nor its inline PlanCard (Today.tsx:106) mentions routines. The only route in is /routine/:routineId, four taps deep via Repertoire → Pathways → pathway → stage.

• RECORDS NOTHING. RoutineRunner's finish state renders 'Routine complete' and a Back button. No block, no minutes, no timesPractised, no totalMinutes.

• `essential` IS DEAD DATA. The seeded Stage 1 routine carries essential: true on two segments, faithfully mapping the syllabus's asterisks and its rule 'if rushed for time, opt for those listed with the asterisk'. The field is read in exactly one place — RoutineRunner.tsx:115 — where it renders the word 'essential'. It changes nothing.

• THE CLOCK DRIFTS (review §2.4). RoutineRunner.tsx:28-45 runs setInterval and decrements a counter. Backgrounding the tab or locking the phone loses real time, which is precisely what a hands-free routine is for. ActiveBlock already does this correctly by deriving elapsed time from segmentStartedAt.

• AND THE OBVIOUS FIX IS A TRAP. The seeded Stage 1 routine is 13 segments over ~6 distinct labels, with 'Chunk chords (right hand only)' appearing FOUR times at one minute each. Running each bound segment through the ordinary startSession → /active → /close flow would mean 13 close screens in 20 minutes, would add 4 to that item's timesPractised, and would trip isSaturated immediately (scoring.ts:96 — three blocks inside 48 hours) so the app would penalise the user for following the syllabus exactly. The Session Plan cannot express this either: plan.ts:198-244 keeps a `used` set and allows one segment per item. These are genuinely different animals.

## Instead

Routines become ordinary editable data that record real time, without a third session system.

• FULL CRUD, including duplicate. 'Copy Stage 1 and adjust' is the workflow the syllabus itself suggests.

• PER-INSTRUMENT SCOPE, WITHOUT FABRICATING ONE. PathwayRoutine gains instrumentId as OPTIONAL at the persisted-data level and REQUIRED for every newly created routine. Optional at rest is forced by the data: Pathway.instrumentId is itself optional (types.ts:356, 'undefined = general / cross-instrument') and PathwayDetail.tsx:332 offers 'General (no instrument)', so a legitimate v10 routine may sit on a pathway with no instrument. The migration must NOT invent one for those. It backfills ONLY when the pathway's instrumentId is non-empty AND resolves to an existing record in db.instruments. This is not hypothetical: migrateToV3 still assigns `instruments.find(...)?.id ?? ''`, so a pre-v3 database missing an instrument yields a pathway with instrumentId '' — copying that would scope a routine to nothing. A General pathway, an empty-string legacy id, or a dangling reference all leave the routine unscoped. Today surfaces only routines matching the session instrument, so an un-scoped legacy routine simply stays reachable from its pathway. pathwayId and stageId become OPTIONAL placement rather than identity. That is what lets 'my Setar warm-up' exist without a pathway, and it is what Today filters on. Consequently, deletion DETACHES routines instead of removing them, and the two cascades differ: deleting a PATHWAY clears both pathwayId and stageId; deleting a STAGE preserves the routine and its pathwayId and clears only stageId, so a routine is never evicted from a pathway it still legitimately belongs to. Both currently delete outright (useStore.ts:956 and :1021).

• SEGMENTS MAY BIND TO AN ITEM. RoutineSegment gains an optional itemId. Unbound segments stay exactly what they are today, a pure countdown, so the seeded CGS routines keep working untouched until the user binds them.

• THE BINDING INVARIANT: a bound itemId always references an existing PracticeItem whose instrumentId matches the routine's instrument. It is enforced at every edge, not just at binding time:
  - RoutineEdit offers only same-instrument items to bind.
  - Deleting an item unbinds it from every routine segment; the SEGMENT SURVIVES as an unbound countdown and the routine is never silently shortened.
  - Changing an item's instrument unbinds it from routines whose instrument no longer matches.
  - Changing a routine's instrument clears bindings that are no longer compatible AND, if the routine is placed in a pathway or stage whose instrument no longer matches, detaches it from that placement (pathwayId and stageId both cleared). Neither the pathway's instrument nor the routine's is silently rewritten to make them agree.
  - If changing a PATHWAY's instrument would make a placed routine incompatible, the routine is DETACHED from that pathway/stage — its own instrument is never silently rewritten.
A dangling itemId must never survive any of these operations.

• HOW A BOUND SEGMENT RECORDS — the hard part of this contract, and the thing that must not be got wrong:
  – AT MOST ONE BLOCK PER DISTINCT ITEM PER RUN. Never one per segment. The four 'Chunk chords' segments produce ONE block of four minutes, not four blocks of one.
  – Minutes are ACTUAL ELAPSED RUNNING TIME, aggregated across every visit to that item's segments — never authored minutes taken on trust. Paused time does not count. A segment skipped or cut short contributes only the time actually spent; a segment played to completion contributes its full authored duration. Reuse the existing convention rather than inventing one: sessionElapsedSeconds (useStore.ts:92-97) is already the accumulated-plus-live-since-a-timestamp pattern this needs, and CloseBlock.tsx:41 is the established seconds-to-whole-minutes rounding.
  – The result defaults to `not_logged`, and nothing is fabricated. This needs no new machinery: the existing engine already treats not_logged correctly everywhere — blocks.ts:39 keeps the item's previous meaningful result instead of overwriting it, scoring.ts:82 excludes it from lastResults so it cannot trip lastResultsAllSame, and scheduling.ts:136 makes computeReview return null. So a routine advances no review and no SM-2 state, which is correct, because the user made no judgement.
  – Finishing a routine stays under 60 seconds IN TOTAL, not 60 seconds per bound item. If a result pass is offered at all it is one optional screen for the whole run, never a close screen per segment.

• ROUTINE BLOCKS CARRY THE SAME METADATA AS ORDINARY ONES. PracticeBlock requires mode and focus (types.ts:285-286); do not invent defaults for them. Use exactly what startItemSession uses (useStore.ts:713-719): mode = defaultModeForStatus(item.status), focus = item.primaryFocus ?? (item.strand ? STRAND_TO_FOCUS[item.strand] : 'other'), materialId = item.materialId, instrumentId from the bound item. Note this is NOT defaultFocusForItem (defaults.ts:27), which is the weaker primaryFocus ?? 'other' and would silently drop the strand fallback. That expression is already duplicated at plan.ts:109 and useStore.ts:718 — reuse or extract it, but do NOT add a third copy.

• `essential` EARNS ITS KEEP. A 'short on time' option drops non-essential segments, which is the syllabus's own rule and is a few lines against data that already exists.

• REACHABLE FROM TODAY, INCLUDING THE FIRST ONE. The existing collapsed PlanCard gains one branch rather than Today growing another section, and it must handle the empty case, because Setar starts with no routines at all: when the session instrument has none the branch offers 'Create a routine'; when it has some it lists them and keeps an obvious 'New routine' action. Both route to RoutineEdit with the session instrument preselected. No extra page and no further scope is needed for this.

• THE CLOCK READS THE WALL, AND CATCHES UP. The runner derives remaining time from a start timestamp the way ActiveBlock already does. Crucially it must catch up across MULTIPLE segment boundaries at once: returning after the phone was locked for longer than the current segment has to land on the correct later segment, not advance by one per tick.

• Schema v11, added INTO the shared migrateToCurrent chain from the previous lane, backfilling instrumentId from each routine's pathway.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- Verified: pathwayRoutines appears in the store only at useStore.ts:956, :984 and :1021 — a seed and two cascade deletes. There is genuinely no create/update path to extend, so this is new store surface rather than a refactor.
- Verified: the seeded Stage 1 routine is 13 segments with 'Chunk chords (right hand only)' four times at one minute (pathwaySeed.ts:182+), which is the concrete fixture the aggregation rule must be tested against.
- Verified: isSaturated (scoring.ts:96) trips at three blocks inside 48 hours, so per-segment blocks would saturate an item within a single routine run. One block per distinct item per run keeps that honest.
- Verified: not_logged is already handled correctly in all four places it matters (blocks.ts:39, scoring.ts:82, scheduling.ts:136, factories.ts:173), so recording routine minutes without a result needs no new engine behaviour.
- Verified: plan.ts:198-244 keeps a `used` set and permits one segment per item, so the Session Plan structurally cannot express a repeated segment. That is the evidence for keeping the two systems separate rather than merging them.
- PlanCard is not a shared component — it is defined inline at Today.tsx:106 and rendered at :240 — so surfacing routines there means editing Today.tsx.
- vitest still runs with environment: 'node' and no IndexedDB shim, so the store remains not unit-testable. Aggregation, the essential filter and the wall-clock remaining-time calculation must live in a pure domain module and be tested there; the store and the runner stay thin call sites. This is the shape that worked in both previous lanes.
- A routine editor is new UI. 'One file per route' means a new src/pages/RoutineEdit.tsx and a route in src/App.tsx rather than a modal grafted onto PathwayDetail.
- Verified: Pathway.instrumentId is optional (types.ts:356) and PathwayDetail.tsx:332 offers 'General (no instrument)', so requiring instrumentId on PathwayRoutine would force the migration to fabricate one. That is why it is optional at rest and required only at creation.
- Verified: startItemSession (useStore.ts:713-719) uses primaryFocus ?? STRAND_TO_FOCUS[strand] ?? 'other', which is STRONGER than defaults.ts's defaultFocusForItem (primaryFocus ?? 'other'). Two focus defaults exist; routine blocks must use the start path's.
- Verified: RoutineRunner already has pause (setRunning(false), RoutineRunner.tsx:131), so paused time is a real state that elapsed-time aggregation has to exclude.
- Verified: migrateToV3 assigns pathway instrument ids as `instruments.find(...)?.id ?? ''` (src/domain/migrations.ts), so empty-string instrument ids are directly reachable in legacy data — the v11 backfill must test for a resolvable instrument, not merely a defined one. A dangling reference is defensive by comparison: no deleteInstrument action exists in the store, so one can only arrive by import, which validateDB does not check referentially.

**Possible conflicts**

- TWO FLOWS ARE AFFECTED, DEFINITELY — not possibly. The Delta is filed against work-a-pathway-stage, whose step 1 owns 'guided routines if any' and which owns RoutineRunner, because the start format permits only one Delta. But PlanCard behaviour genuinely changes, so practise-todays-recommendation's step 2 (what the Today screen shows) is no longer accurate either. The Builder's Flow report MUST mark practise-todays-recommendation for reapproval rather than classifying it unchanged.
- Making pathwayId optional changes the cascade at useStore.ts:956 and :1021 from delete to detach, and every consumer that assumes a routine has a pathway — PathwayDetail, StageDetail, and RoutineRunner's back link — must handle a routine with none.
- Even with one block per item per run, a routine practised on three days inside any 48-hour window can trip the saturation warning on its bound items (three blocks / 48 hours). That may be correct behaviour or may be wrong for a daily warm-up; the builder should surface which it is rather than silently tuning isSaturated, since that function is shared with the recommendation engine.
- This is the first schema bump to run through the shared migrateToCurrent chain. If anything about v11 does not fit that chain cleanly, that is a signal about the previous lane's design and should be reported, not worked around.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "The migration lane is merged, so the schema bump is safe now. Take the next lane wide: practice routines — the build advisory calls it the largest gap and it is the one that affects the instrument I actually practise. Right now routines exist only on the guitar pathway, Setar and Tar have none and there is no way to make one, they are four taps deep and never appear on Today, and running a 20-minute routine records nothing at all. Make routines ordinary editable data for any instrument, let a segment be bound to a real practice item so the time counts, honour the syllabus's 'essential' asterisks with a short-on-time option, and put them on Today next to the session plan. Do not build a third session system and do not merge them with the Session Plan.",
  "builder": "claude",
  "summary": "Routines you can create, follow on any instrument, and actually log",
  "rationale": "This is the largest verified gap left, and the single strongest fact in the analysis is that the user practises Setar while routines exist only for Classical Guitar — and cannot be created.\n\n1. It is uncreatable, not merely thin. There is no addRoutine, updateRoutine or deleteRoutine anywhere in the store. The only three references to pathwayRoutines (useStore.ts:956, :984, :1021) SEED them or DELETE them as a side effect of removing a pathway or stage. The syllabus this app is built on says 'You can also design your own routine similar to these' — that sentence is the feature request, in the source material, and the app cannot honour it.\n\n2. It records nothing, which is the crux. A 20-minute CGS routine is the user's real practice that day, but the finish screen says 'Routine complete', navigates away, and logs no block, no minutes and no item stats. It appears in no insight and no balance figure. The app's whole promise is an honest record; this is a 20-minute hole in it.\n\n3. It is now unblocked and it is the right moment. It needs schema v11, which the just-merged migration lane exists to make safe — this is the first bump to run through the shared migrateToCurrent chain, so it also proves that lane's work under real conditions rather than only in tests.\n\n4. The scope is genuinely wide as asked: types and a v11 migration, a new pure domain module, full store CRUD, the runner, a routine editor, the stage and pathway pages, and Today. It also absorbs review finding §2.4 (the runner counts setInterval ticks rather than the wall clock, so a locked phone loses real time) because it is the same file and a hands-free timer that silently under-counts is exactly what this lane is fixing.",
  "kind": "existing-flow",
  "flowId": "work-a-pathway-stage",
  "currentBehaviour": "Step 1 of this flow promises 'guided routines if any'. Verified state of 'if any':\n\n• GUITAR ONLY. pathwaySeed.ts seeds routines in exactly one place (line 182), on the CGS pathway. Setar and Tar have zero. SEED_PATHWAY_IDS covers all three instruments; routines cover one.\n\n• UNCREATABLE. No addRoutine / updateRoutine / deleteRoutine / duplicateRoutine exists in the store. The three references at useStore.ts:956, :984 and :1021 are a seed and two cascade DELETES. PathwayRoutine.pathwayId is a REQUIRED field (types.ts:417), so a standalone 'my Setar warm-up' cannot be represented at all.\n\n• UNREACHABLE FROM TODAY. Neither Today.tsx nor its inline PlanCard (Today.tsx:106) mentions routines. The only route in is /routine/:routineId, four taps deep via Repertoire → Pathways → pathway → stage.\n\n• RECORDS NOTHING. RoutineRunner's finish state renders 'Routine complete' and a Back button. No block, no minutes, no timesPractised, no totalMinutes.\n\n• `essential` IS DEAD DATA. The seeded Stage 1 routine carries essential: true on two segments, faithfully mapping the syllabus's asterisks and its rule 'if rushed for time, opt for those listed with the asterisk'. The field is read in exactly one place — RoutineRunner.tsx:115 — where it renders the word 'essential'. It changes nothing.\n\n• THE CLOCK DRIFTS (review §2.4). RoutineRunner.tsx:28-45 runs setInterval and decrements a counter. Backgrounding the tab or locking the phone loses real time, which is precisely what a hands-free routine is for. ActiveBlock already does this correctly by deriving elapsed time from segmentStartedAt.\n\n• AND THE OBVIOUS FIX IS A TRAP. The seeded Stage 1 routine is 13 segments over ~6 distinct labels, with 'Chunk chords (right hand only)' appearing FOUR times at one minute each. Running each bound segment through the ordinary startSession → /active → /close flow would mean 13 close screens in 20 minutes, would add 4 to that item's timesPractised, and would trip isSaturated immediately (scoring.ts:96 — three blocks inside 48 hours) so the app would penalise the user for following the syllabus exactly. The Session Plan cannot express this either: plan.ts:198-244 keeps a `used` set and allows one segment per item. These are genuinely different animals.",
  "desiredBehaviour": "Routines become ordinary editable data that record real time, without a third session system.\n\n• FULL CRUD, including duplicate. 'Copy Stage 1 and adjust' is the workflow the syllabus itself suggests.\n\n• PER-INSTRUMENT SCOPE, WITHOUT FABRICATING ONE. PathwayRoutine gains instrumentId as OPTIONAL at the persisted-data level and REQUIRED for every newly created routine. Optional at rest is forced by the data: Pathway.instrumentId is itself optional (types.ts:356, 'undefined = general / cross-instrument') and PathwayDetail.tsx:332 offers 'General (no instrument)', so a legitimate v10 routine may sit on a pathway with no instrument. The migration must NOT invent one for those. It backfills ONLY when the pathway's instrumentId is non-empty AND resolves to an existing record in db.instruments. This is not hypothetical: migrateToV3 still assigns `instruments.find(...)?.id ?? ''`, so a pre-v3 database missing an instrument yields a pathway with instrumentId '' — copying that would scope a routine to nothing. A General pathway, an empty-string legacy id, or a dangling reference all leave the routine unscoped. Today surfaces only routines matching the session instrument, so an un-scoped legacy routine simply stays reachable from its pathway. pathwayId and stageId become OPTIONAL placement rather than identity. That is what lets 'my Setar warm-up' exist without a pathway, and it is what Today filters on. Consequently, deletion DETACHES routines instead of removing them, and the two cascades differ: deleting a PATHWAY clears both pathwayId and stageId; deleting a STAGE preserves the routine and its pathwayId and clears only stageId, so a routine is never evicted from a pathway it still legitimately belongs to. Both currently delete outright (useStore.ts:956 and :1021).\n\n• SEGMENTS MAY BIND TO AN ITEM. RoutineSegment gains an optional itemId. Unbound segments stay exactly what they are today, a pure countdown, so the seeded CGS routines keep working untouched until the user binds them.\n\n• THE BINDING INVARIANT: a bound itemId always references an existing PracticeItem whose instrumentId matches the routine's instrument. It is enforced at every edge, not just at binding time:\n  - RoutineEdit offers only same-instrument items to bind.\n  - Deleting an item unbinds it from every routine segment; the SEGMENT SURVIVES as an unbound countdown and the routine is never silently shortened.\n  - Changing an item's instrument unbinds it from routines whose instrument no longer matches.\n  - Changing a routine's instrument clears bindings that are no longer compatible AND, if the routine is placed in a pathway or stage whose instrument no longer matches, detaches it from that placement (pathwayId and stageId both cleared). Neither the pathway's instrument nor the routine's is silently rewritten to make them agree.\n  - If changing a PATHWAY's instrument would make a placed routine incompatible, the routine is DETACHED from that pathway/stage — its own instrument is never silently rewritten.\nA dangling itemId must never survive any of these operations.\n\n• HOW A BOUND SEGMENT RECORDS — the hard part of this contract, and the thing that must not be got wrong:\n  – AT MOST ONE BLOCK PER DISTINCT ITEM PER RUN. Never one per segment. The four 'Chunk chords' segments produce ONE block of four minutes, not four blocks of one.\n  – Minutes are ACTUAL ELAPSED RUNNING TIME, aggregated across every visit to that item's segments — never authored minutes taken on trust. Paused time does not count. A segment skipped or cut short contributes only the time actually spent; a segment played to completion contributes its full authored duration. Reuse the existing convention rather than inventing one: sessionElapsedSeconds (useStore.ts:92-97) is already the accumulated-plus-live-since-a-timestamp pattern this needs, and CloseBlock.tsx:41 is the established seconds-to-whole-minutes rounding.\n  – The result defaults to `not_logged`, and nothing is fabricated. This needs no new machinery: the existing engine already treats not_logged correctly everywhere — blocks.ts:39 keeps the item's previous meaningful result instead of overwriting it, scoring.ts:82 excludes it from lastResults so it cannot trip lastResultsAllSame, and scheduling.ts:136 makes computeReview return null. So a routine advances no review and no SM-2 state, which is correct, because the user made no judgement.\n  – Finishing a routine stays under 60 seconds IN TOTAL, not 60 seconds per bound item. If a result pass is offered at all it is one optional screen for the whole run, never a close screen per segment.\n\n• ROUTINE BLOCKS CARRY THE SAME METADATA AS ORDINARY ONES. PracticeBlock requires mode and focus (types.ts:285-286); do not invent defaults for them. Use exactly what startItemSession uses (useStore.ts:713-719): mode = defaultModeForStatus(item.status), focus = item.primaryFocus ?? (item.strand ? STRAND_TO_FOCUS[item.strand] : 'other'), materialId = item.materialId, instrumentId from the bound item. Note this is NOT defaultFocusForItem (defaults.ts:27), which is the weaker primaryFocus ?? 'other' and would silently drop the strand fallback. That expression is already duplicated at plan.ts:109 and useStore.ts:718 — reuse or extract it, but do NOT add a third copy.\n\n• `essential` EARNS ITS KEEP. A 'short on time' option drops non-essential segments, which is the syllabus's own rule and is a few lines against data that already exists.\n\n• REACHABLE FROM TODAY, INCLUDING THE FIRST ONE. The existing collapsed PlanCard gains one branch rather than Today growing another section, and it must handle the empty case, because Setar starts with no routines at all: when the session instrument has none the branch offers 'Create a routine'; when it has some it lists them and keeps an obvious 'New routine' action. Both route to RoutineEdit with the session instrument preselected. No extra page and no further scope is needed for this.\n\n• THE CLOCK READS THE WALL, AND CATCHES UP. The runner derives remaining time from a start timestamp the way ActiveBlock already does. Crucially it must catch up across MULTIPLE segment boundaries at once: returning after the phone was locked for longer than the current segment has to land on the correct later segment, not advance by one per tick.\n\n• Schema v11, added INTO the shared migrateToCurrent chain from the previous lane, backfilling instrumentId from each routine's pathway.",
  "mustNotChange": [
    "No third session system, and no merging with the Session Plan. src/domain/plan.ts is not modified, its sum-equals-budget invariant and tests stay green, and RoutineRunner remains a distinct thing from the plan runner.",
    "Practising through the ordinary close flow stays the ONLY thing that completes a review or advances SM-2. A routine records time; it never advances the schedule.",
    "Unbound segments behave exactly as they do today. The seeded CGS routines must keep running unchanged for a user who binds nothing.",
    "No seeded routines for Setar or Tar. The app makes them creatable; inventing their content would fabricate authority that belongs to the teacher.",
    "The shared migrateToCurrent chain stays the only migration path — v11 goes INTO it, never around it — and every acceptance test from the migration lane stays green.",
    "Today's primary recommendation stays above the fold at 390x844 and PlanCard stays collapsed at roughly 50px. Routines add a branch to it, not a new section.",
    "No gamification on the routine finish screen: no streak, no score, no fabricated mastery. Honest minutes and what was recorded, nothing else.",
    "Deleting a pathway or a stage must never delete a routine the user made — it detaches it, exactly as it already does for items.",
    "Starting a routine stays a one-tap action; binding an item to a segment is optional and progressive, never required to run one.",
    "No routine data may be fabricated by the migration: a routine on a General (no-instrument) pathway must survive v11 without an instrument being invented for it.",
    "A bound segment's itemId must never dangle. Item deletion, item instrument change, routine instrument change and pathway instrument change each have a defined outcome, and none of them may delete a segment or silently rewrite a routine's instrument.",
    "Instrument agreement is never achieved by rewriting: neither a pathway's instrument nor a routine's is silently changed to match the other. Incompatibility is resolved by detaching the placement."
  ],
  "assumptions": [
    "Verified: pathwayRoutines appears in the store only at useStore.ts:956, :984 and :1021 — a seed and two cascade deletes. There is genuinely no create/update path to extend, so this is new store surface rather than a refactor.",
    "Verified: the seeded Stage 1 routine is 13 segments with 'Chunk chords (right hand only)' four times at one minute (pathwaySeed.ts:182+), which is the concrete fixture the aggregation rule must be tested against.",
    "Verified: isSaturated (scoring.ts:96) trips at three blocks inside 48 hours, so per-segment blocks would saturate an item within a single routine run. One block per distinct item per run keeps that honest.",
    "Verified: not_logged is already handled correctly in all four places it matters (blocks.ts:39, scoring.ts:82, scheduling.ts:136, factories.ts:173), so recording routine minutes without a result needs no new engine behaviour.",
    "Verified: plan.ts:198-244 keeps a `used` set and permits one segment per item, so the Session Plan structurally cannot express a repeated segment. That is the evidence for keeping the two systems separate rather than merging them.",
    "PlanCard is not a shared component — it is defined inline at Today.tsx:106 and rendered at :240 — so surfacing routines there means editing Today.tsx.",
    "vitest still runs with environment: 'node' and no IndexedDB shim, so the store remains not unit-testable. Aggregation, the essential filter and the wall-clock remaining-time calculation must live in a pure domain module and be tested there; the store and the runner stay thin call sites. This is the shape that worked in both previous lanes.",
    "A routine editor is new UI. 'One file per route' means a new src/pages/RoutineEdit.tsx and a route in src/App.tsx rather than a modal grafted onto PathwayDetail.",
    "Verified: Pathway.instrumentId is optional (types.ts:356) and PathwayDetail.tsx:332 offers 'General (no instrument)', so requiring instrumentId on PathwayRoutine would force the migration to fabricate one. That is why it is optional at rest and required only at creation.",
    "Verified: startItemSession (useStore.ts:713-719) uses primaryFocus ?? STRAND_TO_FOCUS[strand] ?? 'other', which is STRONGER than defaults.ts's defaultFocusForItem (primaryFocus ?? 'other'). Two focus defaults exist; routine blocks must use the start path's.",
    "Verified: RoutineRunner already has pause (setRunning(false), RoutineRunner.tsx:131), so paused time is a real state that elapsed-time aggregation has to exclude.",
    "Verified: migrateToV3 assigns pathway instrument ids as `instruments.find(...)?.id ?? ''` (src/domain/migrations.ts), so empty-string instrument ids are directly reachable in legacy data — the v11 backfill must test for a resolvable instrument, not merely a defined one. A dangling reference is defensive by comparison: no deleteInstrument action exists in the store, so one can only arrive by import, which validateDB does not check referentially."
  ],
  "possibleConflicts": [
    "TWO FLOWS ARE AFFECTED, DEFINITELY — not possibly. The Delta is filed against work-a-pathway-stage, whose step 1 owns 'guided routines if any' and which owns RoutineRunner, because the start format permits only one Delta. But PlanCard behaviour genuinely changes, so practise-todays-recommendation's step 2 (what the Today screen shows) is no longer accurate either. The Builder's Flow report MUST mark practise-todays-recommendation for reapproval rather than classifying it unchanged.",
    "Making pathwayId optional changes the cascade at useStore.ts:956 and :1021 from delete to detach, and every consumer that assumes a routine has a pathway — PathwayDetail, StageDetail, and RoutineRunner's back link — must handle a routine with none.",
    "Even with one block per item per run, a routine practised on three days inside any 48-hour window can trip the saturation warning on its bound items (three blocks / 48 hours). That may be correct behaviour or may be wrong for a daily warm-up; the builder should surface which it is rather than silently tuning isSaturated, since that function is shared with the recommendation engine.",
    "This is the first schema bump to run through the shared migrateToCurrent chain. If anything about v11 does not fit that chain cleanly, that is a signal about the previous lane's design and should be reported, not worked around."
  ],
  "scope": {
    "allow": [
      "src/domain/types.ts",
      "src/domain/routines.ts",
      "src/domain/routines.test.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/index.ts",
      "src/domain/defaults.ts",
      "src/store/useStore.ts",
      "src/pages/RoutineRunner.tsx",
      "src/pages/RoutineEdit.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/Today.tsx",
      "src/App.tsx",
      "CLAUDE.md",
      "AGENTS.md"
    ],
    "forbid": []
  },
  "exclusions": [
    "Review §3.3 — wake lock and an end-of-block signal. ActiveBlock is otherwise untouched by this lane and wakeLock is a capability addition rather than a routines feature. It is the natural follow-up and should take both timer screens together.",
    "Review §3.5 fresh-install seeding, §3.2 persian search wiring, §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §4.2 nav shape, §4.3 dead surface, §4.4 Settings split.",
    "Build advisory §1 NAS folder picker, §2 lesson materials view, §4 item categories. §4 is the natural next lane after this one.",
    "No change to src/domain/plan.ts or the Session Plan's behaviour. The two systems stay separate by design.",
    "No seeded routine content for Setar or Tar, and no change to the CGS routine's segments.",
    "No retuning of isSaturated, scoreItems or any scheduling constant. If a routine's blocks interact badly with saturation, report it rather than adjusting the shared function inside this lane.",
    "Nothing is hard-forbidden: the frame is the files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around."
  ],
  "acceptance": [
    {
      "description": "The collision this lane exists to avoid, tested against the real seeded fixture: a routine whose 13 segments repeat one item four times produces ONE block for that item, carrying the ACTUAL elapsed running time summed across all four visits — not four blocks, and not authored minutes taken on trust.",
      "test": "aggregates a repeated segment into one block per item, not one per segment"
    },
    {
      "description": "The consequence that proves it matters. After a single run of that routine the repeated item is NOT saturated — per-segment blocks would trip isSaturated's three-in-48-hours rule immediately and make the app penalise the user for following the syllabus.",
      "test": "leaves an item unsaturated after a routine that repeats it four times"
    },
    {
      "description": "A routine records honest time without touching the schedule: minutes and timesPractised move, but no review is completed and srReps, srEase and srIntervalDays are untouched, because the default result is not_logged.",
      "test": "records routine minutes without completing a review or advancing SM-2"
    },
    {
      "description": "The item's previously recorded result survives a routine run rather than being overwritten or invented — nothing about how the piece went is fabricated from time spent.",
      "test": "keeps the item's previous result after an unlogged routine block"
    },
    {
      "description": "The syllabus's asterisk rule, honoured: with short-on-time chosen, non-essential segments are dropped and the remaining minutes are reported honestly rather than silently rescaled.",
      "test": "drops non-essential segments when short on time is chosen"
    },
    {
      "description": "The discriminating partner to the check above: with short-on-time off, every segment survives in its authored order. Together they prove the filter is driven by the essential flag and nothing else.",
      "test": "keeps every segment when short on time is not chosen"
    },
    {
      "description": "The v11 migration, running inside the shared migrateToCurrent chain: an existing routine gains its instrumentId backfilled from the pathway it belonged to, and a database already at v11 passes through unchanged.",
      "test": "backfills a routine instrument from its pathway on the shared chain"
    },
    {
      "description": "A user's routine survives the removal of the pathway it was placed in — it is detached, not deleted — matching the rule already applied to items.",
      "test": "detaches a routine when its pathway is deleted instead of deleting it"
    },
    {
      "description": "Duplicate produces an independent editable copy: editing the copy's segments leaves the original untouched, which is the 'copy Stage 1 and adjust' workflow the syllabus describes.",
      "test": "duplicates a routine as an independent copy"
    },
    {
      "description": "Review §2.4: remaining time is derived from elapsed wall-clock time rather than from a count of ticks, so a run that was backgrounded for real minutes reports those minutes as gone.",
      "test": "derives remaining time from the wall clock rather than tick count"
    },
    {
      "description": "Scoping: only routines belonging to the session instrument are offered, so a Setar session never surfaces a guitar routine.",
      "test": "offers only routines for the session instrument"
    },
    {
      "description": "Paused time is not practice: a run that sits paused for several minutes records only the time the timer was actually running, and the pause does not consume the segment either.",
      "test": "excludes paused time from a routine's recorded minutes"
    },
    {
      "description": "The catch-up edge that a naive wall-clock rewrite fails: returning after the phone was locked for longer than the current segment lands the runner on the correct LATER segment, having advanced past every boundary that elapsed, rather than moving on by one.",
      "test": "catches up across multiple segment boundaries after a long background interval"
    },
    {
      "description": "A segment cut short contributes only the time actually spent, while one played through contributes its full authored duration — the discriminating pair that proves recorded time is measured, not assumed.",
      "test": "records a shortened segment's real time and a completed segment's full duration"
    },
    {
      "description": "No fabrication and no invalid scoping in the migration, across all three ways a pathway can fail to name a usable instrument: a General pathway with none, a legacy pathway carrying an empty-string id (reachable from migrateToV3's `?? ''`), and one whose id does not resolve in db.instruments. Each leaves the routine unscoped; only a pathway with a real, resolvable instrument backfills.",
      "test": "backfills only from a resolvable instrument and never invents one"
    },
    {
      "description": "Routine-created blocks are semantically indistinguishable from ordinary ones: mode, focus, materialId and instrumentId match exactly what starting that same item from its detail page would have produced, including the strand fallback for focus.",
      "test": "gives a routine block the same mode and focus as starting the item directly"
    },
    {
      "description": "The binding lifecycle, proved at its sharpest edge: deleting a bound item unbinds it from every routine segment while the segment itself survives as an unbound countdown, so no routine is silently shortened and no itemId dangles.",
      "test": "unbinds a deleted item from routine segments without removing the segment"
    },
    {
      "description": "The discriminating partner: changing a bound item's instrument unbinds it from routines that no longer match, while leaving bindings on matching routines intact.",
      "test": "unbinds an item whose instrument no longer matches the routine"
    },
    {
      "description": "An instrument change on a pathway detaches an incompatible placed routine from that pathway rather than rewriting the routine's own instrument.",
      "test": "detaches an incompatible routine when its pathway changes instrument"
    },
    {
      "description": "The routine-side half of the instrument lifecycle, proving both consequences at once: changing a routine's instrument clears the item bindings that no longer match AND detaches it from a pathway/stage whose instrument no longer matches, while leaving the pathway's own instrument untouched.",
      "test": "clears incompatible bindings and placement when a routine changes instrument"
    },
    {
      "description": "Stage deletion is not pathway deletion, and must be proved separately rather than inferred: deleting a stage keeps the routine AND its pathwayId, clearing only stageId, so the routine stays in the pathway it still belongs to.",
      "test": "keeps a routine in its pathway when only its stage is deleted"
    },
    {
      "description": "End to end in the running app. On Setar — which starts with no routines — use Today's plan card to create the first one, binding two segments to real items, then run it. Confirm: the empty state offered 'Create a routine' and preselected Setar; the timer keeps real time across locking the phone mid-segment and lands on the right segment; pausing does not burn time; after the run each bound item shows one block with the real aggregated minutes, its previous result unchanged, no new review, and the same mode and focus a normal start would give. Then run it again with 'short on time', and confirm the seeded guitar Stage 1 routine still behaves exactly as before.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "No auth or payments exist in this app. It touches saved data in three ways: a schema bump to v11 with a backfill migration, new store surface that creates and deletes PathwayRoutine records, and a new path that writes PracticeBlock rows and updates item statistics. It also changes a cascade delete into a detach, which is the safer direction but is still a change to what deleting a pathway does to the user's data. The sharpest risk is over-recording rather than under-recording: writing one block per segment instead of one per item would inflate timesPractised, trip the saturation warning, and corrupt the honesty of the insights — which is why the first two acceptance checks pin exactly that, against the real seeded routine rather than a synthetic one. Being the first schema bump to run through the migration chain merged in the previous lane, it is also a live test of that work, and it is deliberately being taken while that lane is fresh in mind rather than months later."
  },
  "delta": {
    "step": 1,
    "today": "The stage promises 'guided routines if any', and 'if any' is doing an enormous amount of work. Routines exist on the Classical Guitar pathway alone; Setar and Tar have none and no way to make one, because the store has no create, update or delete for them at all and a routine cannot exist without a pathway. They are reachable only four taps deep and never from Today. Running one records nothing whatsoever: twenty minutes of real practice ends at a 'Routine complete' screen and leaves no block, no minutes, and no trace in any insight. The syllabus's own 'if rushed for time, opt for the asterisked ones' is in the data and does nothing but print the word 'essential'. And the countdown ticks a counter instead of reading the clock, so locking the phone during a hands-free routine quietly loses the time.",
    "instead": "Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.",
    "keep": [
      "Practising through the ordinary close flow stays the only thing that completes a review or advances spaced repetition — a routine records time, never a judgement.",
      "The Session Plan is untouched and stays a separate thing; routines are not folded into it and it is not folded into them.",
      "The seeded guitar routines keep running exactly as they do now for anyone who binds nothing to them.",
      "Starting a routine stays one tap, and binding items to segments stays optional.",
      "No streaks, scores or fabricated mastery on the finish screen — honest minutes and nothing else.",
      "Today's primary recommendation stays above the fold; the plan card gains a branch, not a new section."
    ],
    "assumptions": [
      "A routine that repeats the same item is normal and correct — the CGS Stage 1 routine plays Chunk chords four times on purpose — so recording it must not read as four separate practice sessions.",
      "Recording minutes with no result is honest rather than incomplete: the user practised, and did not stop to judge how it went."
    ],
    "showMe": "On Setar, open Today and use the plan card to create a routine — a few named segments, two of them bound to real items, one marked essential. Run it. The timer keeps real time even if you lock the phone mid-segment. At the end, each bound item shows one new block with the minutes added up, its previous result unchanged and no new review scheduled. Run it again with 'short on time' and only the essential segments play. Then open the guitar Stage 1 routine and confirm it behaves exactly as it did before."
  },
  "desiredRules": [
    "A routine records real practice time but never a judgement: it writes at most one block per item per run, aggregating repeated segments, and never completes a review or advances spaced repetition."
  ],
  "docsDelta": [
    "CLAUDE.md",
    "AGENTS.md"
  ]
}
```

