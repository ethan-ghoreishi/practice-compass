---
id: 20260828-routines-you-can-create-follow-on-any-in-d7c3
contractId: 20260828-routines-you-can-create-follow-on-any-in-d7c3
contractHash: c1367619b90df0005d95fb035f2303031c39f35371afd521a6205919b676b371
createdAt: 2026-08-29T22:57:03.803Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Routines you can create, follow on any instrument, and actually log

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/5
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-routines-you-can-create-follow-on-any-in-d7c3

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
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
````

## The approved Delta this change must deliver

# Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

_approved · about "work-a-pathway-stage" step 1_

## Today

The stage promises 'guided routines if any', and 'if any' is doing an enormous amount of work. Routines exist on the Classical Guitar pathway alone; Setar and Tar have none and no way to make one, because the store has no create, update or delete for them at all and a routine cannot exist without a pathway. They are reachable only four taps deep and never from Today. Running one records nothing whatsoever: twenty minutes of real practice ends at a 'Routine complete' screen and leaves no block, no minutes, and no trace in any insight. The syllabus's own 'if rushed for time, opt for the asterisked ones' is in the data and does nothing but print the word 'essential'. And the countdown ticks a counter instead of reading the clock, so locking the phone during a hands-free routine quietly loses the time.

## Instead

Routines are ordinary editable data belonging to an instrument. You can write your own Setar warm-up, copy the guitar Stage 1 routine and adjust it, and start either from Today's plan card without going four taps deep. A segment can be bound to a real practice item, so the minutes count: finishing a routine records one honest block per item you actually worked on, with the minutes added up across its repeats, and no invented result — so nothing about how it went is fabricated and no review is silently advanced. Choosing 'short on time' keeps the asterisked segments and drops the rest, which is what the syllabus says to do. The clock keeps real time even with the phone locked.

## Keep

- Practising through the ordinary close flow stays the only thing that completes a review or advances spaced repetition — a routine records time, never a judgement.
- The Session Plan is untouched and stays a separate thing; routines are not folded into it and it is not folded into them.
- The seeded guitar routines keep running exactly as they do now for anyone who binds nothing to them.
- Starting a routine stays one tap, and binding items to segments stays optional.
- No streaks, scores or fabricated mastery on the finish screen — honest minutes and nothing else.
- Today's primary recommendation stays above the fold; the plan card gains a branch, not a new section.

## New assumptions

- A routine that repeats the same item is normal and correct — the CGS Stage 1 routine plays Chunk chords four times on purpose — so recording it must not read as four separate practice sessions.
- Recording minutes with no result is honest rather than incomplete: the user practised, and did not stop to judge how it went.

## Show me

On Setar, open Today and use the plan card to create a routine — a few named segments, two of them bound to real items, one marked essential. Run it. The timer keeps real time even if you lock the phone mid-segment. At the end, each bound item shows one new block with the minutes added up, its previous result unchanged and no new review scheduled. Run it again with 'short on time' and only the essential segments play. Then open the guitar Stage 1 routine and confirm it behaves exactly as it did before.


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

# See how practice is actually going

_Works now · approved 2026-08-28T13:30:18.074Z by Ethan (signed)_

## Goal

Get a calm, neutral read on the last week or month across everything you play.

## Starts when

The musician taps 'Overview' on Today, or opens More → Insights.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Overview' in the instrument switcher.
   - Shows: Each instrument with its next suggestion and next class, one insight of the day, and a balance bar for the last 7 days.
   - Changes: The session instrument is set to 'all' — a deliberate, secondary choice, never the default.

2. **The musician** Taps an instrument to drop back into a real session for it.
   - Shows: Today, scoped to that instrument again.
   - Changes: The session instrument is set.

3. **The musician** Opens Insights and switches the window between 7 and 30 days.
   - Shows: Neutral observations generated from the logged blocks — patterns, not a scoreboard, and an honest empty state when there is not enough history.

## Ends with

The musician knows where their time actually went, with no streaks, scores or judgement attached.

## Variations

_none_

## Rules

- No gamification: no streaks, points, badges or fabricated mastery percentages.
- Insights are neutral observations, never nags.
- Future-dated blocks never leak into a window that looks backwards.

## Involves

- The musician

---

# Keep the MacBook and iPhone in step

_Works now · approved 2026-08-28T13:30:18.104Z by Ethan (signed)_

## Goal

Practise on either device and have both hold the same data, without a server or an account.

## Starts when

In Settings → Sync the musician enters a private GitHub repo they own and a fine-grained token, and taps 'Connect & sync'.

## Needs first

- A private GitHub repo dedicated to this app's data
- A fine-grained token with Contents read/write on that repo

## Steps

1. **The musician** Enters owner/name and a token scoped to that one repo with Contents read/write.
   - Shows: The connection state, with the token kept in this browser only — never in backups or synced data.
   - Changes: The configuration is written to this device's local storage.

2. **Practice Compass** Builds a whole snapshot of the device's data and files, hashes it, and compares it three ways against the repo and the last synced hash.
   - Shows: Plain status: in sync, pushed, pulled, or a conflict — with the device name, last sync time and short content hash.

3. **Practice Compass** Publishes the snapshot atomically when this device is ahead — blobs, then tree, then commit, then a fast-forward-only reference update.
   - Shows: A brand-new empty repo is bootstrapped first; a failed bootstrap says so and leaves no partial snapshot.
   - Changes: One commit holds the manifest, the state and the attachments; a race is reported as a conflict rather than overwriting anyone.
   - Only if: The device is online and the token is valid for that repo

4. **Practice Compass** Archives the current copy on this device before applying an incoming snapshot.
   - Changes: Local data is replaced only after everything has been fetched and validated.

5. **The musician** Chooses a side when both copies changed.
   - Shows: A two-button choice; which side is newer is shown only as a hint, never applied automatically.
   - Changes: Keeping this device pushes with the GitHub copy as the parent commit, so it stays in history; taking the GitHub copy archives this device's copy both in the app and on an archive branch first.

6. **Practice Compass** Syncs again on its own when the app opens, 30 quiet seconds after changes, and when the device comes back online.
   - Shows: Unconfigured or offline, every trigger is simply a no-op.

## Ends with

Both devices hold the same practice data, every replacement was explicit, and no copy was ever destroyed.

## Variations

- **Restore the archived copy** — The pre-sync archive kept on the device can be restored from Settings after an unwanted pull. _(Works now)_
- **Legacy remote** — An older state.json + files/ remote still pulls losslessly; the next push migrates the format, keeping the old snapshot in git history. _(Works now)_
- **Sync off** — Without sync the app is fully usable offline and data moves by manual export and import. _(Works now)_

## Rules

- Decisions compare content hashes, never timestamps — newest never silently wins.
- Both copies are preserved before anything is replaced.
- The token lives only in this browser's local storage.
- No backend, no auth server, no paid service.

## Involves

- The musician
- The user's own GitHub repo
- Two devices

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

Routines you can create, follow on any instrument, and actually log

## Stay in scope — you may ONLY change

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

Never touch:

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

## Definition of done

- **ac-1** — The collision this lane exists to avoid, tested against the real seeded fixture: a routine whose 13 segments repeat one item four times produces ONE block for that item, carrying the ACTUAL elapsed running time summed across all four visits — not four blocks, and not authored minutes taken on trust. → proven by `aggregates a repeated segment into one block per item, not one per segment`
- **ac-2** — The consequence that proves it matters. After a single run of that routine the repeated item is NOT saturated — per-segment blocks would trip isSaturated's three-in-48-hours rule immediately and make the app penalise the user for following the syllabus. → proven by `leaves an item unsaturated after a routine that repeats it four times`
- **ac-3** — A routine records honest time without touching the schedule: minutes and timesPractised move, but no review is completed and srReps, srEase and srIntervalDays are untouched, because the default result is not_logged. → proven by `records routine minutes without completing a review or advancing SM-2`
- **ac-4** — The item's previously recorded result survives a routine run rather than being overwritten or invented — nothing about how the piece went is fabricated from time spent. → proven by `keeps the item's previous result after an unlogged routine block`
- **ac-5** — The syllabus's asterisk rule, honoured: with short-on-time chosen, non-essential segments are dropped and the remaining minutes are reported honestly rather than silently rescaled. → proven by `drops non-essential segments when short on time is chosen`
- **ac-6** — The discriminating partner to the check above: with short-on-time off, every segment survives in its authored order. Together they prove the filter is driven by the essential flag and nothing else. → proven by `keeps every segment when short on time is not chosen`
- **ac-7** — The v11 migration, running inside the shared migrateToCurrent chain: an existing routine gains its instrumentId backfilled from the pathway it belonged to, and a database already at v11 passes through unchanged. → proven by `backfills a routine instrument from its pathway on the shared chain`
- **ac-8** — A user's routine survives the removal of the pathway it was placed in — it is detached, not deleted — matching the rule already applied to items. → proven by `detaches a routine when its pathway is deleted instead of deleting it`
- **ac-9** — Duplicate produces an independent editable copy: editing the copy's segments leaves the original untouched, which is the 'copy Stage 1 and adjust' workflow the syllabus describes. → proven by `duplicates a routine as an independent copy`
- **ac-10** — Review §2.4: remaining time is derived from elapsed wall-clock time rather than from a count of ticks, so a run that was backgrounded for real minutes reports those minutes as gone. → proven by `derives remaining time from the wall clock rather than tick count`
- **ac-11** — Scoping: only routines belonging to the session instrument are offered, so a Setar session never surfaces a guitar routine. → proven by `offers only routines for the session instrument`
- **ac-12** — Paused time is not practice: a run that sits paused for several minutes records only the time the timer was actually running, and the pause does not consume the segment either. → proven by `excludes paused time from a routine's recorded minutes`
- **ac-13** — The catch-up edge that a naive wall-clock rewrite fails: returning after the phone was locked for longer than the current segment lands the runner on the correct LATER segment, having advanced past every boundary that elapsed, rather than moving on by one. → proven by `catches up across multiple segment boundaries after a long background interval`
- **ac-14** — A segment cut short contributes only the time actually spent, while one played through contributes its full authored duration — the discriminating pair that proves recorded time is measured, not assumed. → proven by `records a shortened segment's real time and a completed segment's full duration`
- **ac-15** — No fabrication and no invalid scoping in the migration, across all three ways a pathway can fail to name a usable instrument: a General pathway with none, a legacy pathway carrying an empty-string id (reachable from migrateToV3's `?? ''`), and one whose id does not resolve in db.instruments. Each leaves the routine unscoped; only a pathway with a real, resolvable instrument backfills. → proven by `backfills only from a resolvable instrument and never invents one`
- **ac-16** — Routine-created blocks are semantically indistinguishable from ordinary ones: mode, focus, materialId and instrumentId match exactly what starting that same item from its detail page would have produced, including the strand fallback for focus. → proven by `gives a routine block the same mode and focus as starting the item directly`
- **ac-17** — The binding lifecycle, proved at its sharpest edge: deleting a bound item unbinds it from every routine segment while the segment itself survives as an unbound countdown, so no routine is silently shortened and no itemId dangles. → proven by `unbinds a deleted item from routine segments without removing the segment`
- **ac-18** — The discriminating partner: changing a bound item's instrument unbinds it from routines that no longer match, while leaving bindings on matching routines intact. → proven by `unbinds an item whose instrument no longer matches the routine`
- **ac-19** — An instrument change on a pathway detaches an incompatible placed routine from that pathway rather than rewriting the routine's own instrument. → proven by `detaches an incompatible routine when its pathway changes instrument`
- **ac-20** — The routine-side half of the instrument lifecycle, proving both consequences at once: changing a routine's instrument clears the item bindings that no longer match AND detaches it from a pathway/stage whose instrument no longer matches, while leaving the pathway's own instrument untouched. → proven by `clears incompatible bindings and placement when a routine changes instrument`
- **ac-21** — Stage deletion is not pathway deletion, and must be proved separately rather than inferred: deleting a stage keeps the routine AND its pathwayId, clearing only stageId, so the routine stays in the pathway it still belongs to. → proven by `keeps a routine in its pathway when only its stage is deleted`
- **ac-22** — End to end in the running app. On Setar — which starts with no routines — use Today's plan card to create the first one, binding two segments to real items, then run it. Confirm: the empty state offered 'Create a routine' and preselected Setar; the timer keeps real time across locking the phone mid-segment and lands on the right segment; pausing does not burn time; after the run each bound item shows one block with the real aggregated minutes, its previous result unchanged, no new review, and the same mode and focus a normal start would give. Then run it again with 'short on time', and confirm the seeded guitar Stage 1 routine still behaves exactly as before. → proven by `manual:OWNER`

## Docs to update as part of this change

- CLAUDE.md
- AGENTS.md

## Recommended skills (quality only — never gates)

- **ui-work** — visual / front-end work — layout, styling, interaction — _(use your agent’s equivalent)_
- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Last checks passed (2026-08-29T22:38:43.630Z). Rework loops so far: 0.

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

