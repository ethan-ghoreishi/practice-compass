---
id: 20260913-build-a-daily-session-i-can-trust-from-l-402e
contractId: 20260913-build-a-daily-session-i-can-trust-from-l-402e
contractHash: e99ba11850b5cb0ab65613772a8e6ede221e6da2127640d851482ee9d5bb6e8c
createdAt: 2026-09-13T22:02:58.685Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Build a daily session I can trust, from lesson commitments to the next review

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/22
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260913-build-a-daily-session-i-can-trust-from-l-402e

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Build a daily session I can trust, from lesson commitments to the next review

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Given my available time, Practice Compass builds a useful, varied session from actual practice needs and lesson-specific commitments, explains its choices, and preserves trustworthy review dates after extra practice. Items and questions can target lessons independently, with an honest migration and focused browser regression journeys.
> 
> Agreed refinements: successful early practice preserves the existing due date and spacing state; only genuinely negative evidence may bring an automatic review forward, never postpone it. In particular, same is not failed retention: no improvement is distinct from deterioration or recall failure. Manual dates remain authoritative. Preserve legacy lesson commitments and questions visibly unassigned until explicitly assigned once. Questions target lessons independently of item preparation, with asked status and an optional answer. Warm-up uses familiar existing items inside the total budget, is optional and omitted for very short sessions. Variety uses recent minutes and existing musical metadata, protects urgent work, and introduces neither category quotas nor substantial new manual tagging. Include a simple item-level Schedule again action. Keep this as one wide/heavy lane, organised into separated decision families with narrow acceptance tests for scheduling, session composition and lesson migration. Builder: claude.

## Why

THESIS AND CHOICE
Make the complete daily decision loop trustworthy: lesson intent supplies priority, the planner spends the available minutes, practice updates exposure, and the close decides the next review without manufacturing retention evidence.

Candidate comparison, grounded in current main (qualitative judgements, not measured delivery estimates):
1. Complete daily decision loop, including lesson-specific inputs: highest correctness/trust and daily-session usefulness; one substantial lane before reliance; coherent through the shared input-selection-outcome chain; moderate migration risk; one-time legacy assignment and low ongoing administration; strong testability when split into the three families below; reviewer comprehension moderate, improved by independent state tables and named counterexamples. SELECTED.
2. Scheduling and selection only: high trust/value, quickest useful correction, strong coherence, low migration risk and administration, easiest testing/review. Rejected as next complete answer because the planner would still consume rolling lesson commitments and question-derived urgency, requiring a follow-up before its reasons were trustworthy.
3. Lesson-specific preparation and question lifecycle only: high class-work trust/value, exceptionally coherent, moderate migration risk and one-time administration, good testability/review. Rejected as the next lane because the repeated-review and short-session defects would remain in the daily loop.
A fourth storage-integrity/archival lane is important but does not answer the session decision question. Width is justified only where it closes this chain.

SCIENTIFIC BASIS AND LIMITS
Retain a corrected, conservative SM-2-style spacing heuristic rather than replace it for novelty. Do not call it an experimentally validated optimum for instrumental learning. Existing results are relative judgements, not measured cold-recall tests; repeated successful blocks within one spacing opportunity cannot count as independent retained successes. No new required rating field, AI grading or inferred recall failure is allowed.
Primary music research inspected:
- Simmons (2012), Distributed Practice and Procedural Memory Consolidation in Musicians' Skill Learning, https://doi.org/10.1177/0022429411424798 : a 29-participant keyboard-sequence study supports taking between-session consolidation seriously; it does not validate SM-2 intervals.
- Katz, Adamek and Wiseheart (2021), Optimizing song retention through the spacing effect, https://doi.org/10.1186/s41235-021-00345-7 : supports spacing for song memory, with limits on generalising from combined words/music to instrumental material.
- Carter and Grahn (2016), https://doi.org/10.3389/fpsyg.2016.01251 : interleaved clarinet practice had some favourable findings, with mixed raters and limited aggregate significance.
- Mathias and Goldman, How Does Increasing Contextual Interference in a Musical Practice Session Affect Acquisition and Retention?, https://doi.org/10.1177/00224294231222801 : blocked practice performed best at the delayed retention test in their advanced-violin study. This argues against universal forced interleaving.
- Wiseheart, D'Souza and Chae (2017), https://doi.org/10.1371/journal.pone.0182986 : no spacing benefit under the tested short-lag novice-piano conditions.
The inference for this product is distributed revisiting, protected periods of focused work, and useful variety sensitive to task/history, not random rotation, universal switching or experimentally ordained minute ratios. Publish the actual result mapping, eligibility, coefficients, tie-breaks and limits in docs/scheduling-evidence.md and explain them accurately in Settings. Remove the unsupported implication in plan.ts that a compulsory stable cool-down is established by sleep-consolidation research. Exact numerical defaults are product heuristics, not scientific findings.

## Today

BASELINE AND VALIDATION
Clean main b6a4fecbad4e96af746024f7bae3df728b72f1ec, verified against remote refs/heads/main. Context snapshot b6c24ec263caf3f1d62ae88bea56a0e11b7e145734f17784d9f2043e1d1eea83; no pending proposals or open changes. npm test -- --reporter=dot passed 358 tests in 30 files on this HEAD. Read current scheduling/recommendation/scoring/plan/store/close/lesson/question/migration callers and tests, relevant rules/Flows, and the shipped 20260910 correctness and NAS/search/material records and 20260911 direction/UI records. The supplied review-2026-09-10.md itself was not accessible; the owner's catalogue and records supplied leads, not current truth.

Current-function executions reproduced: three stable_in_context closes on 2026-09-13 propose 2026-09-15, 2026-09-19 and 2026-09-29; a five-minute plan picks a new deep-work item before considering a higher-priority usable item assigned for tomorrow; recommend selects a dormant-only candidate; three January same results are still saturated in September; swap can return an item excluded as already practised by build; a three-day slip setting at low importance/difficulty yields a four-day date with a three-day explanation. These were direct domain probes, not a saved user session. Vite emitted incidental WebSocket/dependency-scan warnings during probes; the reported functions executed and returned these results.
Live local Chrome inspection of current app: Today exposes independent Plan/Routines doorways; the 30-minute seed-data plan used 23 minutes Focus and 7 minutes Review; Lessons displayed the current instrument-level question on its upcoming lesson. This inspected local UI, not the owner's installed iPhone or production data.

FAMILY A: scheduling.ts increments srReps on each successful scheduled close with no due eligibility; maps same to failure and slightly_better to successful retention; interval mode also moves dates from every close. computeReviewOutcome can complete rows without resolving a new date. Dates have no provenance to distinguish manual overrides in auto mode. CloseBlock has a single preview value, but the store recomputes spacing independently at save time; midnight or a changed item can produce inconsistent interpretation. updateItem's date helper only updates existing rows, so no-row Schedule again needs a real creation path. ItemDetail exposes no date action.
FAMILY B: plan.ts already has time budgeting, warmup/lesson/review/deep/cooldown roles, deterministic functions, swaps and redistribution. However warm-up eligibility is based on type/strand alone, deep work is preselected before urgent work for short budgets, usable unassigned material has no normal work pool, same-day detection slices UTC timestamps against a local date, exposure is block-count based, and an all-practised fallback can claim to skip items it selects. scoreItems ties outside the middle pool depend on input order. Dormant items are scored and gain neglect. swap uses a different eligibility policy. SessionPlan freezes now and uses generatedAt to detect reseeding although it never changes; current data or instrument changes can leave a stale editable preview. beginPlanSegment does not recheck instrument identity after an item moves. Routines already log honest bound-item exposure without advancing reviews, and remain independent; existing item types/strands/focus/study sources cover Radif, technique, improvisation, rhythm and theory without a new required taxonomy.
FAMILY C: assignedForLesson is still an item boolean; teacherQuestion is one mutable string. A question adds three priority points independently of actual preparation. questionsForNextClass requires BOTH fields and filters by instrument, not lesson; every future lesson can show the same list. No asked/answer history exists; practice can overwrite the item's question. Copy catches failure silently. Lesson.itemIds is origin/worked-on linkage, not a preparation commitment. Lessons and TeacherReport freeze now. Schema is v11; the shared migration chain already covers rehydration and inbound replacement, but validateDB checks very little beyond arrays and ids.

ALREADY SHIPPED, NOT TO REIMPLEMENT
The 20260910 correctness work fixed unanswered versus declined review outcomes, last non-empty next action, calendar totals/live clocks on Today and Insights, replacement presence/revision guards and remembered sync retries. The NAS/search/material lane fixed Farsi search, instrument-scoped browsing, NAS resolution and attachment ownership. The direction/UI lane fixed grouped mixed-direction content, readable rows, contrast, the single CloseBlock preview and manual-mode date survival across result changes. Its explicit remaining-findings catalogue confirms these new scheduling/lesson issues were deliberately outside its scope. Existing test success is baseline regression evidence, not proof that the defects above are absent.

## Instead

ONE LANE, THREE DECISION FAMILIES
Use the existing run-a-session-plan Flow as the primary Delta. Treat scheduling and lesson Flows as affected parts of this same change; reconcile them through the ordinary Prismatica impact protocol after implementation, not by editing signed canonical truth as code. Build the three families below within one contract and migration, with the named tests forming independently reviewable boundaries. No prerequisite feature lane or deferred policy decision is needed.

A. SCHEDULING: PRACTICE IS EXPOSURE; ELIGIBLE RETENTION EVIDENCE ADVANCES SPACING
A1. Make the pure decision return date disposition, pending-review transition, spacing transition and rationale together. Preview and save consume the same decision semantics, including explicit manual override provenance. Keep date display, explanation and persistence consistent. A close whose relevant item/schedule or local day changed since preview must refresh the decision visibly without losing the draft; do not silently apply a different one.
A2. Eligible automatic spacing progress requires a logged stable_alone, stable_in_context or performable result, at/after the pending due date (or the first scheduling opportunity where no date exists), and at most one progress event per item per local calendar day. Persist the minimal last-progress marker needed so clear/re-arm, rehydrate, sync and repeated closes cannot evade this limit. It is an administrative eligibility marker, not a measured retention score. Missing/undefined/not_logged results never advance spacing. Routine exposure never becomes a retention judgement.
A3. Before a future due date, successful extra practice records real minutes/result/observation/next action but preserves the date, existing pending review and all spacing state. same and slightly_better are not evidence of failed recall and cannot reset or shorten an existing review. At a due automatic review they may repeat the current interval (initial configured interval if none), without increasing repetitions/ease or describing deterioration. stable results may use the existing bounded SM-2 expansion only when eligible. Retain bounded first/second/slip settings and stable-result ease behaviour unless the documented result mapping requires the explicit change described here; do not retrospectively rewrite historical results or try to reconstruct supposedly correct old SR state.
A4. Only worse, the existing explicitly negative result, may trigger early repair: for an automatic date use the earlier of the existing due date and the configured repair proposal, never postpone it. Reset spacing only on that explicit negative evidence. Do not infer recall failure from same, duration, mode, item difficulty, a teacher question or a stale clock. A repeated negative close must never slide tomorrow's repair further into the future. The rationale uses the final actual interval/date after modifiers, never an unmodified setting. Explicit date edits by the owner may change a date in either direction and must be distinguished from automatic scheduling.
A5. Manual-mode dates and explicitly user-chosen pending dates (including date edits/snooze) remain authoritative until due or deliberately changed/cleared. Early practice, including worse, does not override them. Reaching a date alone never advances spacing. Manual mode with no newly selected date must preserve the existing pending schedule unless the owner explicitly declines; an empty automatic proposal is not an implicit No. Once a pending manually chosen date is actually dealt with, future proposals follow the item's chosen review mode. Fixed cadence preserves a future date on extra practice and, when due and deliberately scheduled, uses its configured interval without altering SM-2 state.
A6. Preserve the existing honest tri-state: unanswered changes no schedule; explicit No clears the pending schedule without a fake result or spacing progress; explicit Schedule again/set date on ItemDetail creates or updates the pending review without practice/stat changes. No remains a decision about the pending review, not an unrequested permanent ban on practising the item. The action must work when no open row exists. Maintain one authoritative pending date across item and open rows; due lists, snooze, direct date edits, close and planner must agree. Existing completed history stays intact. Do not silently discard conflicting legacy open rows: normalise compatible duplicates without fabricating completion, or surface an actionable conflict before a destructive rewrite. This invariant is bounded to scheduling data, not a general database sanitiser.

B. SESSION COMPOSITION: USEFUL WORK WITHIN THE TIME AVAILABLE
B1. Reuse real items, statuses, existing focus/strand/type and valid study-source/pathway metadata. Do not add a warm-up entity, mandatory tags or an activity checklist. Warm-up is a session role that an ordinary familiar Radif item, suitable etude/technique or known piece can fill. Prefer lower-demand material with evidence of familiarity; technique/exercise alone is not evidence of suitability. With no suitable candidate, omit warm-up honestly. Routines remain an independent, explicitly authored route, not automatically nested into plans.
B2. Accept finite whole-minute budgets from 5 through 120, retain existing presets and add 5/10 plus an optional native number entry. Reject invalid/non-finite budgets at the boundary rather than loop or silently exceed them. Under 12 minutes use one useful main focus, no separate warm-up or compulsory finish segment. From 12 minutes allow a warm-up only if at least five minutes of useful main work remains. Warm-up consumes the total; use the existing bounded warmupShare as a real allocation target, rounded to whole minutes and bounded by segment feasibility. A cool-down is optional familiar work, not a scientific requirement or a slot to fill. A nonempty plan should use as much of the chosen budget as is musically useful, without exceeding it. Normally it should use the full budget when suitable eligible work exists, but it may leave an honest remainder when filling the remaining minutes would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. Empty eligibility yields an honest empty plan. Existing remove/redistribute behaviour may redistribute across remaining valid items but must preserve their identity and role.
B3. Use a shared candidate policy for Today recommendation, initial plan, regeneration and swaps. Dormant/Resting items are excluded from proactive recommendations and all automatic pools/fallbacks; direct deliberate practice remains available, and existing due data is not silently erased. A simple explicit status change can reactivate an item. Question-only agenda entries add no practice urgency. A real future/today lesson preparation entry provides urgency from its OWN lesson date; past/unassigned commitments provide none. A later commitment cannot inherit the earlier lesson's deadline. Resolve same-day ties by stable ids, not array order or random rotation.
B4. Select the main anchor from actual urgency before optional role decoration. A short session must not preselect new deep work ahead of a more urgent due/lesson item. Usable material, improvisation, rhythm and theory remain eligible useful work even when they fit none of the old deep/cooldown buckets. Default mode/focus comes from existing shared helpers, not a third copy or a label-implied judgement.
B5. Replace permanent count/stall saturation as a selection authority with bounded, decaying recent exposure derived from valid nonnegative minutes and local calendar days. Include normal and routine-bound blocks equally; ignore future timestamps for past exposure. Three old same results can still justify a calm strategy hint but not an everlasting eligibility penalty. More recent real exposure cannot increase priority merely because it was split into more blocks. Use existing musical dimensions as a modest marginal diversity preference across selected work and recent days, subordinate to real needs. No mandatory category counts, round-robin calendar, random choice, opaque optimiser or new user-maintained taxonomy. Missing metadata must still yield a useful plan. Important urgent work must remain reachable after practice; recently touched non-urgent work should yield to comparably useful fresh work. Maintenance must not disappear indefinitely behind the same repeatedly practised urgent item: bound its urgency advantage and recent-exposure discount and prove this with a multi-day fixture. Do not claim a universal optimal ratio.
B6. Publish a compact deterministic policy table (eligibility, urgency, exposure windows/decay, diversity contribution, stable tie-break, allocation) in docs/scheduling-evidence.md. Retain existing weights where they satisfy the named counterexamples; adjust only those necessary, with exact numbers and representative 5/10/20/45/60-minute outputs so reviewers can calculate the answer. The tests below constrain outcomes and monotonicity; do not encode a quota merely to satisfy one fixture. The planner chooses defaults without asking the owner to supervise weights.
B7. Reasons derive from the same decision record as the selected item/role/date and name the decisive need, actual lesson, exposure trade-off or honest repeat fallback. A selected fallback cannot be described as skipped; a usable item is not automatically described as already secure. Pure functions take explicit now; changed decision screens refresh at local-day/visibility boundaries. Refresh a preview when relevant data/instrument/budget changes while preserving valid explicit swaps/removals when possible; mark invalid drafts for regeneration rather than silently starting stale work. Preserve an active plan's completed/skipped progress across reload; before starting its next item, revalidate live existence and instrument and do not replace any unfinished block/routine. A changed/deleted/moved item is visibly skipped or requires a valid replacement, never played under the wrong instrument. Ending/skipping logs nothing. Logged minutes may differ from planned minutes; never falsify either to meet the budget.

C. LESSON INTENT: SPECIFIC TARGETS, INDEPENDENT QUESTIONS, HONEST HISTORY
C1. Replace the rolling boolean and mutable single-question source with one coherent, typed lesson-agenda model. Prefer a small discriminated collection: preparation entries link an item to a lesson; question entries carry their own text, optional item link, lesson target and open/asked lifecycle with optional answer. Both carry instrument identity; targetless entries are explicitly unassigned. This is a relationship/question collection, not a second practice task system. Lesson.itemIds retains its existing originated/worked-on meaning. Do not introduce separate independently toggleable booleans for next-class, asked, archived and completed.
C2. New entries default to the nearest upcoming lesson on that instrument, with the specific date/name visible and an optional change of target. With no future lesson, capture unassigned rather than invent a lesson. The owner may explicitly target different future lessons. A question can arise in CloseBlock or ItemDetail without marking its item for preparation; multiple questions must not overwrite each other. Editing the item cannot silently recreate or discard asked questions. Show and manage open questions in the item, lesson and report surfaces using the one canonical collection, with relevant Repertoire/Stage/ItemCard filters/badges updated.
C3. Marking asked is explicit and reversible, with an optional teacher answer; it never logs practice or changes item urgency. Asked entries stay with that lesson, disappear from upcoming/open lists, and are not copied into other lessons. Unasked questions remain visible on the past lesson after its date passes; carry-forward is an explicit move/copy decision, not an automatic next-class rule. Preparation urgency ends after the targeted local calendar date; date-only lessons remain today through that day. Rescheduling the same lesson preserves identity and moves its urgency; deleting or retargeting a lesson/instrument cannot silently reassign entries. Preserve text/answers and the former lesson/item identification when detaching; open detached intent becomes visibly unassigned, asked history stays historical. Removing a preparation link does not delete the item or its practice. Cancelling a question is an explicit question action, never a side effect of practice.
C4. Questions on a selected lesson are selected by lesson id, not instrument alone. Teacher Report distinguishes open/unassigned questions from the chosen lesson's agenda/history; do not silently portray current questions as events within an old report range. Limit report changes to this new question/commitment model and accurate labelling of its context, not a broad Insights rewrite. Copy failure produces accessible feedback and a selectable text/download fallback; successful copy is announced. Preserve Farsi/English grouping, independent question direction and the accessible in-box ordinal pattern.
C5. Single schema v11 -> v12 migration in the existing shared chain. Convert each true legacy assignedForLesson to exactly one UNASSIGNED preparation entry; convert each nonempty teacherQuestion to exactly one UNASSIGNED open question regardless of the boolean. Never infer a target from nextLessonFor(now), creation time or today's clock; migration must be identical on devices run on different days. Preserve multiline question text as ONE question rather than splitting at newlines. Preserve old text verbatim, ids, lesson.itemIds, recordings, attachments, blocks, review history, item stats and SR state. Deterministic collision-safe migration ids and presence-aware conversion make reapplication idempotent, including deliberately empty current collections; remove legacy fields only after their content is represented. No permanent dual-read/write compatibility layer. New seed data must use the current model directly.
C6. Add only minimal schedule metadata needed by Family A: distinguish automatic/user-chosen/legacy-unknown pending date provenance and last spacing-progress day. Do not guess legacy date provenance or invent a prior retention event. Existing future dates with unknown provenance are conservatively protected from automatic early changes until dealt with or explicitly changed. Existing SR values are preserved; repair is prospective. The conversion shares v12 because these are the inputs and outcomes of this same decision loop.
C7. Validate the new model and scheduling invariants before installing an inbound DB and before replacement touches blobs: valid dates/enums/finite values, unique identities, valid same-instrument targets where present, permissible unassigned/history states and coherent pending schedule. On invalid new data, reject with actionable detail and keep the installed state; never silently filter away intent. Follow the existing migration route for hydration, bare/wrapped JSON, full backup, automatic sync, Keep remote and archive restore. Tests must exercise the real entry wiring, including already-current, partial legacy, repeated, invalid and newer-version states, not just the pure migration function. Keep presence/revision replacement guards intact. This is not a general repair of all legacy malformed records.
C8. Rollout/rollback: document an OWNER pre-upgrade full export and verified fixture restore; update all devices before resuming cross-device sync of v12. Do not change schema numbers to downgrade. Keep a v12-capable build or forward-fix for any post-upgrade data; an older v11 build can only restore an explicitly chosen pre-upgrade backup and cannot preserve post-upgrade edits, so export those first and state the limitation. Prove export/import round trips retain the new agenda, answers and scheduling state and that the older-version rejection boundary remains. No automated destructive rollback or release/deployment in this lane.

VERIFICATION AND REVIEW ORGANISATION
Keep pure scheduling, exposure, selection and migration logic outside React. Use existing Vitest for the narrow named cases below, plus two real-browser journeys surfaced as uniquely named Vitest tests (using a small Playwright library harness, so existing Prismatica JSON traceability can bind their results). The installed check engine traces acceptance through the unit Vitest report; a standalone Playwright success exit is insufficient. Allow one test-only browser dependency and one small harness, no generic testing platform. Each journey uses an isolated origin/context and synthetic fixtures, no personal data or GitHub/NAS access. Drive rendered controls and assert user-visible text plus persisted outcomes after reload; do not substitute source-regex or JSX-shape checks. Browser absence is a test failure with a setup message, never a skip. Install the pinned browser in all three existing CI/check/deploy verification jobs before npm test/Prismatica gate; preserve their deploy and permission semantics. Document the local setup command. Changed controls must have accessible names so tests and assistive technology can operate them by role/name.
Use within-test tables/loops where a family has many states, keeping each acceptance title globally unique rather than parameterising it into ambiguous duplicates. The three family unit groups should pass independently, followed by the two integration journeys and the ordinary typecheck/lint/unit/build/secrets checks. A review must inspect runtime persistence and every caller, not equate a ledger or green source guard with semantic coverage. One OWNER check covers subjective musical suitability and real-phone interaction speed; deterministic behaviours are automated. No test can establish an objectively optimal musical session or guarantee zero future review cycles.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The owner explicitly approved the final request and all three policy choices in this conversation, then required no improvement to remain distinct from deterioration and asked for separate decision families inside one heavy lane.
- Existing metadata is enough for useful default selection, but cannot prove physiological warm-up suitability or an objectively optimal session. Unknown metadata is not fabricated; owner correction remains optional.
- The single agenda collection is a concrete small implementation recommendation; an equivalently small typed representation is acceptable only if all specified lifecycle, migration and consumer invariants remain expressible and tested. No independent compatibility layers or generic task system.
- Existing whole-database replacement paths already share migration. Testing must prove actual wiring; pure-function tests and prior records alone do not prove entry-point safety.
- Browser checks will run as real uniquely named Vitest tests because current Prismatica acceptance traceability consumes the unit JSON report. No Prismatica upgrade or new external service is needed.

**Possible conflicts**

- AGENTS.md currently says to keep historical SM-2 defaults/results green and describes same as a reset. The owner has now explicitly authorised the result/eligibility correction; update those precise statements and obsolete expectations, retaining unrelated regression checks.
- r-practice-completes-reviews must remain only-practice authority, but not every close is independent spacing evidence. Express the refined eligibility/administrative date semantics through the governed rule/Flow process rather than treating existing broad prose as proof.
- AGENTS.md and questions.ts currently prescribe boolean-gated next-class questions and clearing by editing the item. The agreed independent lesson question lifecycle supersedes that model; remove stale documentation rather than leaving contradictory sources.
- The previous UI contract suggested the keyboard lane next. The owner now explicitly chose the higher-value decision lane; the iPhone diagnostic remains separate and can be taken alongside it.
- No tests can prove musical optimality or eliminate all reviewer iterations. Concrete counterexamples, published policy, migration fixtures and rendered persistence journeys bound the claims.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Given my available time, Practice Compass builds a useful, varied session from actual practice needs and lesson-specific commitments, explains its choices, and preserves trustworthy review dates after extra practice. Items and questions can target lessons independently, with an honest migration and focused browser regression journeys.\n\nAgreed refinements: successful early practice preserves the existing due date and spacing state; only genuinely negative evidence may bring an automatic review forward, never postpone it. In particular, same is not failed retention: no improvement is distinct from deterioration or recall failure. Manual dates remain authoritative. Preserve legacy lesson commitments and questions visibly unassigned until explicitly assigned once. Questions target lessons independently of item preparation, with asked status and an optional answer. Warm-up uses familiar existing items inside the total budget, is optional and omitted for very short sessions. Variety uses recent minutes and existing musical metadata, protects urgent work, and introduces neither category quotas nor substantial new manual tagging. Include a simple item-level Schedule again action. Keep this as one wide/heavy lane, organised into separated decision families with narrow acceptance tests for scheduling, session composition and lesson migration. Builder: claude.",
  "builder": "claude",
  "summary": "Build a daily session I can trust, from lesson commitments to the next review",
  "rationale": "THESIS AND CHOICE\nMake the complete daily decision loop trustworthy: lesson intent supplies priority, the planner spends the available minutes, practice updates exposure, and the close decides the next review without manufacturing retention evidence.\n\nCandidate comparison, grounded in current main (qualitative judgements, not measured delivery estimates):\n1. Complete daily decision loop, including lesson-specific inputs: highest correctness/trust and daily-session usefulness; one substantial lane before reliance; coherent through the shared input-selection-outcome chain; moderate migration risk; one-time legacy assignment and low ongoing administration; strong testability when split into the three families below; reviewer comprehension moderate, improved by independent state tables and named counterexamples. SELECTED.\n2. Scheduling and selection only: high trust/value, quickest useful correction, strong coherence, low migration risk and administration, easiest testing/review. Rejected as next complete answer because the planner would still consume rolling lesson commitments and question-derived urgency, requiring a follow-up before its reasons were trustworthy.\n3. Lesson-specific preparation and question lifecycle only: high class-work trust/value, exceptionally coherent, moderate migration risk and one-time administration, good testability/review. Rejected as the next lane because the repeated-review and short-session defects would remain in the daily loop.\nA fourth storage-integrity/archival lane is important but does not answer the session decision question. Width is justified only where it closes this chain.\n\nSCIENTIFIC BASIS AND LIMITS\nRetain a corrected, conservative SM-2-style spacing heuristic rather than replace it for novelty. Do not call it an experimentally validated optimum for instrumental learning. Existing results are relative judgements, not measured cold-recall tests; repeated successful blocks within one spacing opportunity cannot count as independent retained successes. No new required rating field, AI grading or inferred recall failure is allowed.\nPrimary music research inspected:\n- Simmons (2012), Distributed Practice and Procedural Memory Consolidation in Musicians' Skill Learning, https://doi.org/10.1177/0022429411424798 : a 29-participant keyboard-sequence study supports taking between-session consolidation seriously; it does not validate SM-2 intervals.\n- Katz, Adamek and Wiseheart (2021), Optimizing song retention through the spacing effect, https://doi.org/10.1186/s41235-021-00345-7 : supports spacing for song memory, with limits on generalising from combined words/music to instrumental material.\n- Carter and Grahn (2016), https://doi.org/10.3389/fpsyg.2016.01251 : interleaved clarinet practice had some favourable findings, with mixed raters and limited aggregate significance.\n- Mathias and Goldman, How Does Increasing Contextual Interference in a Musical Practice Session Affect Acquisition and Retention?, https://doi.org/10.1177/00224294231222801 : blocked practice performed best at the delayed retention test in their advanced-violin study. This argues against universal forced interleaving.\n- Wiseheart, D'Souza and Chae (2017), https://doi.org/10.1371/journal.pone.0182986 : no spacing benefit under the tested short-lag novice-piano conditions.\nThe inference for this product is distributed revisiting, protected periods of focused work, and useful variety sensitive to task/history, not random rotation, universal switching or experimentally ordained minute ratios. Publish the actual result mapping, eligibility, coefficients, tie-breaks and limits in docs/scheduling-evidence.md and explain them accurately in Settings. Remove the unsupported implication in plan.ts that a compulsory stable cool-down is established by sleep-consolidation research. Exact numerical defaults are product heuristics, not scientific findings.",
  "kind": "existing-flow",
  "flowId": "run-a-session-plan",
  "currentBehaviour": "BASELINE AND VALIDATION\nClean main b6a4fecbad4e96af746024f7bae3df728b72f1ec, verified against remote refs/heads/main. Context snapshot b6c24ec263caf3f1d62ae88bea56a0e11b7e145734f17784d9f2043e1d1eea83; no pending proposals or open changes. npm test -- --reporter=dot passed 358 tests in 30 files on this HEAD. Read current scheduling/recommendation/scoring/plan/store/close/lesson/question/migration callers and tests, relevant rules/Flows, and the shipped 20260910 correctness and NAS/search/material records and 20260911 direction/UI records. The supplied review-2026-09-10.md itself was not accessible; the owner's catalogue and records supplied leads, not current truth.\n\nCurrent-function executions reproduced: three stable_in_context closes on 2026-09-13 propose 2026-09-15, 2026-09-19 and 2026-09-29; a five-minute plan picks a new deep-work item before considering a higher-priority usable item assigned for tomorrow; recommend selects a dormant-only candidate; three January same results are still saturated in September; swap can return an item excluded as already practised by build; a three-day slip setting at low importance/difficulty yields a four-day date with a three-day explanation. These were direct domain probes, not a saved user session. Vite emitted incidental WebSocket/dependency-scan warnings during probes; the reported functions executed and returned these results.\nLive local Chrome inspection of current app: Today exposes independent Plan/Routines doorways; the 30-minute seed-data plan used 23 minutes Focus and 7 minutes Review; Lessons displayed the current instrument-level question on its upcoming lesson. This inspected local UI, not the owner's installed iPhone or production data.\n\nFAMILY A: scheduling.ts increments srReps on each successful scheduled close with no due eligibility; maps same to failure and slightly_better to successful retention; interval mode also moves dates from every close. computeReviewOutcome can complete rows without resolving a new date. Dates have no provenance to distinguish manual overrides in auto mode. CloseBlock has a single preview value, but the store recomputes spacing independently at save time; midnight or a changed item can produce inconsistent interpretation. updateItem's date helper only updates existing rows, so no-row Schedule again needs a real creation path. ItemDetail exposes no date action.\nFAMILY B: plan.ts already has time budgeting, warmup/lesson/review/deep/cooldown roles, deterministic functions, swaps and redistribution. However warm-up eligibility is based on type/strand alone, deep work is preselected before urgent work for short budgets, usable unassigned material has no normal work pool, same-day detection slices UTC timestamps against a local date, exposure is block-count based, and an all-practised fallback can claim to skip items it selects. scoreItems ties outside the middle pool depend on input order. Dormant items are scored and gain neglect. swap uses a different eligibility policy. SessionPlan freezes now and uses generatedAt to detect reseeding although it never changes; current data or instrument changes can leave a stale editable preview. beginPlanSegment does not recheck instrument identity after an item moves. Routines already log honest bound-item exposure without advancing reviews, and remain independent; existing item types/strands/focus/study sources cover Radif, technique, improvisation, rhythm and theory without a new required taxonomy.\nFAMILY C: assignedForLesson is still an item boolean; teacherQuestion is one mutable string. A question adds three priority points independently of actual preparation. questionsForNextClass requires BOTH fields and filters by instrument, not lesson; every future lesson can show the same list. No asked/answer history exists; practice can overwrite the item's question. Copy catches failure silently. Lesson.itemIds is origin/worked-on linkage, not a preparation commitment. Lessons and TeacherReport freeze now. Schema is v11; the shared migration chain already covers rehydration and inbound replacement, but validateDB checks very little beyond arrays and ids.\n\nALREADY SHIPPED, NOT TO REIMPLEMENT\nThe 20260910 correctness work fixed unanswered versus declined review outcomes, last non-empty next action, calendar totals/live clocks on Today and Insights, replacement presence/revision guards and remembered sync retries. The NAS/search/material lane fixed Farsi search, instrument-scoped browsing, NAS resolution and attachment ownership. The direction/UI lane fixed grouped mixed-direction content, readable rows, contrast, the single CloseBlock preview and manual-mode date survival across result changes. Its explicit remaining-findings catalogue confirms these new scheduling/lesson issues were deliberately outside its scope. Existing test success is baseline regression evidence, not proof that the defects above are absent.",
  "desiredBehaviour": "ONE LANE, THREE DECISION FAMILIES\nUse the existing run-a-session-plan Flow as the primary Delta. Treat scheduling and lesson Flows as affected parts of this same change; reconcile them through the ordinary Prismatica impact protocol after implementation, not by editing signed canonical truth as code. Build the three families below within one contract and migration, with the named tests forming independently reviewable boundaries. No prerequisite feature lane or deferred policy decision is needed.\n\nA. SCHEDULING: PRACTICE IS EXPOSURE; ELIGIBLE RETENTION EVIDENCE ADVANCES SPACING\nA1. Make the pure decision return date disposition, pending-review transition, spacing transition and rationale together. Preview and save consume the same decision semantics, including explicit manual override provenance. Keep date display, explanation and persistence consistent. A close whose relevant item/schedule or local day changed since preview must refresh the decision visibly without losing the draft; do not silently apply a different one.\nA2. Eligible automatic spacing progress requires a logged stable_alone, stable_in_context or performable result, at/after the pending due date (or the first scheduling opportunity where no date exists), and at most one progress event per item per local calendar day. Persist the minimal last-progress marker needed so clear/re-arm, rehydrate, sync and repeated closes cannot evade this limit. It is an administrative eligibility marker, not a measured retention score. Missing/undefined/not_logged results never advance spacing. Routine exposure never becomes a retention judgement.\nA3. Before a future due date, successful extra practice records real minutes/result/observation/next action but preserves the date, existing pending review and all spacing state. same and slightly_better are not evidence of failed recall and cannot reset or shorten an existing review. At a due automatic review they may repeat the current interval (initial configured interval if none), without increasing repetitions/ease or describing deterioration. stable results may use the existing bounded SM-2 expansion only when eligible. Retain bounded first/second/slip settings and stable-result ease behaviour unless the documented result mapping requires the explicit change described here; do not retrospectively rewrite historical results or try to reconstruct supposedly correct old SR state.\nA4. Only worse, the existing explicitly negative result, may trigger early repair: for an automatic date use the earlier of the existing due date and the configured repair proposal, never postpone it. Reset spacing only on that explicit negative evidence. Do not infer recall failure from same, duration, mode, item difficulty, a teacher question or a stale clock. A repeated negative close must never slide tomorrow's repair further into the future. The rationale uses the final actual interval/date after modifiers, never an unmodified setting. Explicit date edits by the owner may change a date in either direction and must be distinguished from automatic scheduling.\nA5. Manual-mode dates and explicitly user-chosen pending dates (including date edits/snooze) remain authoritative until due or deliberately changed/cleared. Early practice, including worse, does not override them. Reaching a date alone never advances spacing. Manual mode with no newly selected date must preserve the existing pending schedule unless the owner explicitly declines; an empty automatic proposal is not an implicit No. Once a pending manually chosen date is actually dealt with, future proposals follow the item's chosen review mode. Fixed cadence preserves a future date on extra practice and, when due and deliberately scheduled, uses its configured interval without altering SM-2 state.\nA6. Preserve the existing honest tri-state: unanswered changes no schedule; explicit No clears the pending schedule without a fake result or spacing progress; explicit Schedule again/set date on ItemDetail creates or updates the pending review without practice/stat changes. No remains a decision about the pending review, not an unrequested permanent ban on practising the item. The action must work when no open row exists. Maintain one authoritative pending date across item and open rows; due lists, snooze, direct date edits, close and planner must agree. Existing completed history stays intact. Do not silently discard conflicting legacy open rows: normalise compatible duplicates without fabricating completion, or surface an actionable conflict before a destructive rewrite. This invariant is bounded to scheduling data, not a general database sanitiser.\n\nB. SESSION COMPOSITION: USEFUL WORK WITHIN THE TIME AVAILABLE\nB1. Reuse real items, statuses, existing focus/strand/type and valid study-source/pathway metadata. Do not add a warm-up entity, mandatory tags or an activity checklist. Warm-up is a session role that an ordinary familiar Radif item, suitable etude/technique or known piece can fill. Prefer lower-demand material with evidence of familiarity; technique/exercise alone is not evidence of suitability. With no suitable candidate, omit warm-up honestly. Routines remain an independent, explicitly authored route, not automatically nested into plans.\nB2. Accept finite whole-minute budgets from 5 through 120, retain existing presets and add 5/10 plus an optional native number entry. Reject invalid/non-finite budgets at the boundary rather than loop or silently exceed them. Under 12 minutes use one useful main focus, no separate warm-up or compulsory finish segment. From 12 minutes allow a warm-up only if at least five minutes of useful main work remains. Warm-up consumes the total; use the existing bounded warmupShare as a real allocation target, rounded to whole minutes and bounded by segment feasibility. A cool-down is optional familiar work, not a scientific requirement or a slot to fill. A nonempty plan should use as much of the chosen budget as is musically useful, without exceeding it. Normally it should use the full budget when suitable eligible work exists, but it may leave an honest remainder when filling the remaining minutes would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. Empty eligibility yields an honest empty plan. Existing remove/redistribute behaviour may redistribute across remaining valid items but must preserve their identity and role.\nB3. Use a shared candidate policy for Today recommendation, initial plan, regeneration and swaps. Dormant/Resting items are excluded from proactive recommendations and all automatic pools/fallbacks; direct deliberate practice remains available, and existing due data is not silently erased. A simple explicit status change can reactivate an item. Question-only agenda entries add no practice urgency. A real future/today lesson preparation entry provides urgency from its OWN lesson date; past/unassigned commitments provide none. A later commitment cannot inherit the earlier lesson's deadline. Resolve same-day ties by stable ids, not array order or random rotation.\nB4. Select the main anchor from actual urgency before optional role decoration. A short session must not preselect new deep work ahead of a more urgent due/lesson item. Usable material, improvisation, rhythm and theory remain eligible useful work even when they fit none of the old deep/cooldown buckets. Default mode/focus comes from existing shared helpers, not a third copy or a label-implied judgement.\nB5. Replace permanent count/stall saturation as a selection authority with bounded, decaying recent exposure derived from valid nonnegative minutes and local calendar days. Include normal and routine-bound blocks equally; ignore future timestamps for past exposure. Three old same results can still justify a calm strategy hint but not an everlasting eligibility penalty. More recent real exposure cannot increase priority merely because it was split into more blocks. Use existing musical dimensions as a modest marginal diversity preference across selected work and recent days, subordinate to real needs. No mandatory category counts, round-robin calendar, random choice, opaque optimiser or new user-maintained taxonomy. Missing metadata must still yield a useful plan. Important urgent work must remain reachable after practice; recently touched non-urgent work should yield to comparably useful fresh work. Maintenance must not disappear indefinitely behind the same repeatedly practised urgent item: bound its urgency advantage and recent-exposure discount and prove this with a multi-day fixture. Do not claim a universal optimal ratio.\nB6. Publish a compact deterministic policy table (eligibility, urgency, exposure windows/decay, diversity contribution, stable tie-break, allocation) in docs/scheduling-evidence.md. Retain existing weights where they satisfy the named counterexamples; adjust only those necessary, with exact numbers and representative 5/10/20/45/60-minute outputs so reviewers can calculate the answer. The tests below constrain outcomes and monotonicity; do not encode a quota merely to satisfy one fixture. The planner chooses defaults without asking the owner to supervise weights.\nB7. Reasons derive from the same decision record as the selected item/role/date and name the decisive need, actual lesson, exposure trade-off or honest repeat fallback. A selected fallback cannot be described as skipped; a usable item is not automatically described as already secure. Pure functions take explicit now; changed decision screens refresh at local-day/visibility boundaries. Refresh a preview when relevant data/instrument/budget changes while preserving valid explicit swaps/removals when possible; mark invalid drafts for regeneration rather than silently starting stale work. Preserve an active plan's completed/skipped progress across reload; before starting its next item, revalidate live existence and instrument and do not replace any unfinished block/routine. A changed/deleted/moved item is visibly skipped or requires a valid replacement, never played under the wrong instrument. Ending/skipping logs nothing. Logged minutes may differ from planned minutes; never falsify either to meet the budget.\n\nC. LESSON INTENT: SPECIFIC TARGETS, INDEPENDENT QUESTIONS, HONEST HISTORY\nC1. Replace the rolling boolean and mutable single-question source with one coherent, typed lesson-agenda model. Prefer a small discriminated collection: preparation entries link an item to a lesson; question entries carry their own text, optional item link, lesson target and open/asked lifecycle with optional answer. Both carry instrument identity; targetless entries are explicitly unassigned. This is a relationship/question collection, not a second practice task system. Lesson.itemIds retains its existing originated/worked-on meaning. Do not introduce separate independently toggleable booleans for next-class, asked, archived and completed.\nC2. New entries default to the nearest upcoming lesson on that instrument, with the specific date/name visible and an optional change of target. With no future lesson, capture unassigned rather than invent a lesson. The owner may explicitly target different future lessons. A question can arise in CloseBlock or ItemDetail without marking its item for preparation; multiple questions must not overwrite each other. Editing the item cannot silently recreate or discard asked questions. Show and manage open questions in the item, lesson and report surfaces using the one canonical collection, with relevant Repertoire/Stage/ItemCard filters/badges updated.\nC3. Marking asked is explicit and reversible, with an optional teacher answer; it never logs practice or changes item urgency. Asked entries stay with that lesson, disappear from upcoming/open lists, and are not copied into other lessons. Unasked questions remain visible on the past lesson after its date passes; carry-forward is an explicit move/copy decision, not an automatic next-class rule. Preparation urgency ends after the targeted local calendar date; date-only lessons remain today through that day. Rescheduling the same lesson preserves identity and moves its urgency; deleting or retargeting a lesson/instrument cannot silently reassign entries. Preserve text/answers and the former lesson/item identification when detaching; open detached intent becomes visibly unassigned, asked history stays historical. Removing a preparation link does not delete the item or its practice. Cancelling a question is an explicit question action, never a side effect of practice.\nC4. Questions on a selected lesson are selected by lesson id, not instrument alone. Teacher Report distinguishes open/unassigned questions from the chosen lesson's agenda/history; do not silently portray current questions as events within an old report range. Limit report changes to this new question/commitment model and accurate labelling of its context, not a broad Insights rewrite. Copy failure produces accessible feedback and a selectable text/download fallback; successful copy is announced. Preserve Farsi/English grouping, independent question direction and the accessible in-box ordinal pattern.\nC5. Single schema v11 -> v12 migration in the existing shared chain. Convert each true legacy assignedForLesson to exactly one UNASSIGNED preparation entry; convert each nonempty teacherQuestion to exactly one UNASSIGNED open question regardless of the boolean. Never infer a target from nextLessonFor(now), creation time or today's clock; migration must be identical on devices run on different days. Preserve multiline question text as ONE question rather than splitting at newlines. Preserve old text verbatim, ids, lesson.itemIds, recordings, attachments, blocks, review history, item stats and SR state. Deterministic collision-safe migration ids and presence-aware conversion make reapplication idempotent, including deliberately empty current collections; remove legacy fields only after their content is represented. No permanent dual-read/write compatibility layer. New seed data must use the current model directly.\nC6. Add only minimal schedule metadata needed by Family A: distinguish automatic/user-chosen/legacy-unknown pending date provenance and last spacing-progress day. Do not guess legacy date provenance or invent a prior retention event. Existing future dates with unknown provenance are conservatively protected from automatic early changes until dealt with or explicitly changed. Existing SR values are preserved; repair is prospective. The conversion shares v12 because these are the inputs and outcomes of this same decision loop.\nC7. Validate the new model and scheduling invariants before installing an inbound DB and before replacement touches blobs: valid dates/enums/finite values, unique identities, valid same-instrument targets where present, permissible unassigned/history states and coherent pending schedule. On invalid new data, reject with actionable detail and keep the installed state; never silently filter away intent. Follow the existing migration route for hydration, bare/wrapped JSON, full backup, automatic sync, Keep remote and archive restore. Tests must exercise the real entry wiring, including already-current, partial legacy, repeated, invalid and newer-version states, not just the pure migration function. Keep presence/revision replacement guards intact. This is not a general repair of all legacy malformed records.\nC8. Rollout/rollback: document an OWNER pre-upgrade full export and verified fixture restore; update all devices before resuming cross-device sync of v12. Do not change schema numbers to downgrade. Keep a v12-capable build or forward-fix for any post-upgrade data; an older v11 build can only restore an explicitly chosen pre-upgrade backup and cannot preserve post-upgrade edits, so export those first and state the limitation. Prove export/import round trips retain the new agenda, answers and scheduling state and that the older-version rejection boundary remains. No automated destructive rollback or release/deployment in this lane.\n\nVERIFICATION AND REVIEW ORGANISATION\nKeep pure scheduling, exposure, selection and migration logic outside React. Use existing Vitest for the narrow named cases below, plus two real-browser journeys surfaced as uniquely named Vitest tests (using a small Playwright library harness, so existing Prismatica JSON traceability can bind their results). The installed check engine traces acceptance through the unit Vitest report; a standalone Playwright success exit is insufficient. Allow one test-only browser dependency and one small harness, no generic testing platform. Each journey uses an isolated origin/context and synthetic fixtures, no personal data or GitHub/NAS access. Drive rendered controls and assert user-visible text plus persisted outcomes after reload; do not substitute source-regex or JSX-shape checks. Browser absence is a test failure with a setup message, never a skip. Install the pinned browser in all three existing CI/check/deploy verification jobs before npm test/Prismatica gate; preserve their deploy and permission semantics. Document the local setup command. Changed controls must have accessible names so tests and assistive technology can operate them by role/name.\nUse within-test tables/loops where a family has many states, keeping each acceptance title globally unique rather than parameterising it into ambiguous duplicates. The three family unit groups should pass independently, followed by the two integration journeys and the ordinary typecheck/lint/unit/build/secrets checks. A review must inspect runtime persistence and every caller, not equate a ledger or green source guard with semantic coverage. One OWNER check covers subjective musical suitability and real-phone interaction speed; deterministic behaviours are automated. No test can establish an objectively optimal musical session or guarantee zero future review cycles.",
  "mustNotChange": [
    "One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.",
    "Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.",
    "One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.",
    "Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.",
    "No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.",
    "Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.",
    "Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards.",
    "No scope creep through allowed shared files: Settings only scheduler explanation/local setup/migration guidance; Repertoire/Stage/ItemCard/Insights only new agenda/eligibility consumer adaptation; backup only new-model preflight validation/wiring. No broad information architecture, report engine, archive or import overhaul.",
    "CI workflow edits only install/run the required browser checks. Do not change triggers, permissions, deploy targets, Prismatica version pins or governance bypasses. No publish, merge, start-import or owner decisions by the builder.",
    "Canonical Flow/Rule records remain governed by Prismatica owner/protocol boundaries, not hand-edited as an implementation shortcut. Desired rule changes below are proposals until properly accepted."
  ],
  "assumptions": [
    "The owner explicitly approved the final request and all three policy choices in this conversation, then required no improvement to remain distinct from deterioration and asked for separate decision families inside one heavy lane.",
    "Existing metadata is enough for useful default selection, but cannot prove physiological warm-up suitability or an objectively optimal session. Unknown metadata is not fabricated; owner correction remains optional.",
    "The single agenda collection is a concrete small implementation recommendation; an equivalently small typed representation is acceptable only if all specified lifecycle, migration and consumer invariants remain expressible and tested. No independent compatibility layers or generic task system.",
    "Existing whole-database replacement paths already share migration. Testing must prove actual wiring; pure-function tests and prior records alone do not prove entry-point safety.",
    "Browser checks will run as real uniquely named Vitest tests because current Prismatica acceptance traceability consumes the unit JSON report. No Prismatica upgrade or new external service is needed."
  ],
  "possibleConflicts": [
    "AGENTS.md currently says to keep historical SM-2 defaults/results green and describes same as a reset. The owner has now explicitly authorised the result/eligibility correction; update those precise statements and obsolete expectations, retaining unrelated regression checks.",
    "r-practice-completes-reviews must remain only-practice authority, but not every close is independent spacing evidence. Express the refined eligibility/administrative date semantics through the governed rule/Flow process rather than treating existing broad prose as proof.",
    "AGENTS.md and questions.ts currently prescribe boolean-gated next-class questions and clearing by editing the item. The agreed independent lesson question lifecycle supersedes that model; remove stale documentation rather than leaving contradictory sources.",
    "The previous UI contract suggested the keyboard lane next. The owner now explicitly chose the higher-value decision lane; the iPhone diagnostic remains separate and can be taken alongside it.",
    "No tests can prove musical optimality or eliminate all reviewer iterations. Concrete counterexamples, published policy, migration fixtures and rendered persistence journeys bound the claims."
  ],
  "scope": {
    "allow": [
      "src/domain/scheduling.ts",
      "src/domain/scheduling.test.ts",
      "src/domain/scoring.ts",
      "src/domain/scoring.test.ts",
      "src/domain/recommend.ts",
      "src/domain/recommend.test.ts",
      "src/domain/plan.ts",
      "src/domain/plan.test.ts",
      "src/domain/blocks.ts",
      "src/domain/blocks.test.ts",
      "src/domain/defaults.ts",
      "src/domain/selectors.ts",
      "src/domain/selectors.test.ts",
      "src/domain/questions.ts",
      "src/domain/questions.test.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/report.ts",
      "src/domain/insights.ts",
      "src/domain/types.ts",
      "src/domain/factories.ts",
      "src/domain/seed.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/seedMigration.test.ts",
      "src/domain/io.ts",
      "src/domain/io.test.ts",
      "src/domain/index.ts",
      "src/domain/routines.test.ts",
      "src/domain/pathways.test.ts",
      "src/store/useStore.ts",
      "src/store/backup.ts",
      "src/pages/Today.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/TeacherReport.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/NewItem.tsx",
      "src/pages/Settings.tsx",
      "src/components/ItemForm.tsx",
      "src/components/itemFormValues.ts",
      "src/components/ItemCard.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/format.ts",
      "src/components/format.test.ts",
      "src/components/direction.test.ts",
      "src/components/useDecisionNow.ts",
      "src/components/LessonAgenda.tsx",
      "tests/daily-practice.browser.test.ts",
      "tests/lesson-agenda.browser.test.ts",
      "tests/practiceBrowser.ts",
      "tests/fixtures/practice-decisions-v11.json",
      "tests/fixtures/practice-decisions-v12.json",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      ".github/workflows/prismatica-gate.yml",
      "AGENTS.md",
      "docs/product-spec.md",
      "docs/scheduling-evidence.md"
    ],
    "forbid": [
      "src/store/gitRemote.ts",
      "src/store/githubSync.ts",
      "src/store/syncEngine.ts",
      "src/store/idb.ts",
      "src/domain/sync.ts",
      "src/domain/canonical.ts",
      "src/components/useViewportGuard.ts",
      "src/components/Layout.tsx",
      "src/components/screenAwake.ts",
      "src/components/useScreenAwake.ts",
      "src/domain/practiceSignal.ts",
      "src/pages/ActiveBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/RoutineEdit.tsx",
      "src/domain/routines.ts",
      "src/domain/pathwaySeed.ts",
      "src/styles/global.css",
      "public/**",
      "scripts/deploy-nas.sh"
    ]
  },
  "exclusions": [
    "iPhone keyboard/bottom-navigation displacement: explicitly deferred in the last lane to a diagnostic OWNER readout. Do the diagnostic before or alongside this lane; no timeout, shell or viewport fix here. It is not a dependency of scheduling implementation.",
    "General inbound database validation and malformed attachment import loss: still open (backup skips malformed file rows before replacement). This lane validates its new data before mutation and tests valid full-backup round trips, but does not claim to repair all corrupt historical imports. A separate storage-integrity lane should follow; do not use a malformed backup as the rollout recovery copy.",
    "General item self-parenting/stale instrument-family metadata repair: still open. New agenda references must be valid, and planner metadata use must tolerate malformed/dangling links safely, but no broad item-model cleanup or historical metadata rewrite.",
    "Retrospective Insights/Teacher Report mixing period blocks with current result/status/stall state: confirmed in current source and deferred except for honest new question/lesson context. No historical analytics redesign.",
    "Settings newest-copy-wins wording and broad form naming/Settings accessibility/remaining direction exceptions: confirmed or explicitly excluded by the last lane. Correct accessible names and direction of changed controls only; do not reopen the shipped visual lane or restructure Settings.",
    "Archive-vs-delete redesign: item deletion currently confirms removal of its block history. Preserve ordinary explicit deletion semantics, except preserving/detaching the new question agenda honestly; a non-destructive item archive is a separate owner decision.",
    "New learning algorithm for novelty, physiological warm-up prescription, random rotation, activity quotas, required activity tags, generic test infrastructure, artificial mastery metrics, and routine nesting/automatic routine expansion into plans.",
    "Reimplementation of shipped correctness, NAS/search/material and direction/UI fixes, general clock refresh outside the changed decision surfaces, and product-map placeholder cleanup."
  ],
  "acceptance": [
    {
      "description": "A1/A2/A3. Against the real pure close transition, table all three stable results, a future date, due date, first schedule and repeated same-day closes. Early successes preserve date/open-row identity/reps/ease/base while real block stats change; a due stable result advances once; explicit clear/re-arm and reload cannot enable a second same-day advance. Undefined/not_logged and routine exposure never advance. Distinguish the actual permitted and forbidden cases, not just a default result.",
      "test": "early successful practice preserves the pending review and spacing state"
    },
    {
      "description": "A3/A4. same and slightly_better before due preserve the schedule and SR state; neither is described as a slip. Due same/slightly_better repeat rather than expand/reset the interval. worse may shorten an automatic future review with min(existing,repair), never postpone it even on repetition. Verify a repair setting modified by importance/difficulty explains the final saved date, not the raw setting.",
      "test": "only deterioration can bring an automatic review forward"
    },
    {
      "description": "A5/C6. Table auto-date manual override, manual mode, fixed cadence, snoozed date and unknown legacy provenance with positive/same/worse results before/at/after due. Protected future dates remain exact. Manual no-new-date preserves pending state unless explicit No. Fixed due scheduling uses fixed cadence without SR change. An explicit date edit is respected even when different from the engine.",
      "test": "manual and fixed dates survive extra practice without advancing spacing"
    },
    {
      "description": "A6. Exercise real shared transitions for explicit decline, unanswered, scheduled-without-date, initial schedule, no-open-row Schedule again, existing-open-row edit and snooze. Assert item/open-row dates agree, no duplicate pending review is created by repetition, completed history is unchanged, and administrative actions create no block/result/SR progress. Conflicting legacy pending dates must be reported rather than silently discarded.",
      "test": "decline unanswered and schedule again make distinct pending review transitions"
    },
    {
      "description": "B3/C2. Compare dormant vs active and preparation vs question-only/unassigned/past/other-instrument agenda entries across recommend, plan and swap. Resting-only automatic pools are honestly empty, never resurrected by fallback. Direct explicit item practice remains possible. A question alone changes no practice priority; only a specific current/future lesson preparation contributes its own urgency.",
      "test": "recommendations exclude resting items and question only urgency"
    },
    {
      "description": "B5. Equal minutes/time split into one vs several blocks have equal exposure; longer recent practice cannot count as less exposure. Include routine/not_logged blocks, future timestamps, UTC/local midnight, DST and old same results. Recent penalties decay; old same can yield a strategy hint but not permanent saturation or selection exclusion.",
      "test": "recent exposure measures minutes and decays independently of old same results"
    },
    {
      "description": "B2/B4. At 5 and 10 minutes a tomorrow-lesson usable item with higher true urgency beats an unrelated new deep item; one main focus uses the budget. With no urgent work, an ordinary usable/improvisation/rhythm/theory item remains eligible without fabricated mastery or category requirements. Wrong-instrument candidates never enter the plan.",
      "test": "short sessions choose the most useful anchor before optional roles"
    },
    {
      "description": "B1/B2. Table 5/10/12/15/20/45/60/120 minutes; familiar Radif/piece and familiar technique candidates versus unfamiliar demanding exercise. No mandatory warm-up in short sessions or when unsuitable. When present it is first, within the total, its bounded share is real, and useful main work remains. No special warm-up entity/tag is required; routine data is unchanged. Invalid budgets reject cleanly.",
      "test": "warm up uses familiar existing material within the chosen budget"
    },
    {
      "description": "B4/B5/B6. A fixed multi-day fixture with lesson work, due maintenance and existing diverse/absent metadata shows urgent work selected when needed, recently exposed equivalents yielding to fresh useful work, maintenance remaining reachable as repeated urgent exposure accumulates, and missing categories never filled artificially. Same input and permutations of storage arrays produce identical selections and reasons using stable ids. Document the numeric policy and fixture outputs.",
      "test": "session variety responds to exposure without quotas or losing urgent work"
    },
    {
      "description": "B2/B3/B7. Exercise initial build, swap, regenerate, remove and all-practised fallback with the same candidates. No dormant/wrong-instrument candidate bypass, duplicate item, or selected-but-described-as-skipped item. Allocations never exceed the budget and normally use it fully when suitable eligible work exists; an honest remainder is allowed when filling it would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. All segments remain feasible and positive; dropping/redistributing cannot attach another role's minutes/reason to the wrong item. Reasons identify the actual lesson, final date or repeat/exposure trade-off.",
      "test": "build swap and redistribution preserve candidate identity and honest reasons"
    },
    {
      "description": "B7. Rehydrate a partially done/skipped plan, change/delete/move a pending item, and attempt to begin with another unfinished ordinary/routine session. Completed progress and real blocks survive; invalid pending work cannot start under another instrument; skipping/ending logs nothing. Live relevant changes cannot silently start stale preview decisions. Use actual store wiring in the browser journey as well as any extracted pure transition.",
      "test": "plan transitions preserve progress and refuse stale cross instrument starts"
    },
    {
      "description": "C1/C2. One item has a question for lesson A and preparation for lesson B. Query each lesson, Today, item and report: no question-derived urgency, no duplicated next-class agenda, no mutation of Lesson.itemIds. Several same-instrument future lessons remain distinct. No future lesson produces visible unassigned capture; same-instrument target validation rejects mismatches.",
      "test": "lesson preparation and questions have independent specific targets"
    },
    {
      "description": "C3/C4. Mark asked with/without answer, reopen, pass the lesson date, reschedule it, delete it and move/delete an associated item. Text/answer/former target identification survives detachment. Asked entries never reappear automatically; unasked past entries remain on that lesson, and only explicit carry-forward changes target. None of these actions logs practice or completes a review.",
      "test": "asked questions remain historical without automatic carry forward"
    },
    {
      "description": "C5. v11 fixtures include true/false/missing flags, question-only items, multiline Farsi/English, empty text, no future lessons, several future lessons, ids resembling generated ids and partially migrated entries. Convert each legacy intention once to the correct unassigned kind, preserve text verbatim, invent no asked state/answer/target, and produce the same result on different days and repeated applications. Already-current empty collections remain empty. Unrelated data and SR state are byte-equivalent.",
      "test": "legacy lesson intent migrates unassigned exactly once without losing text"
    },
    {
      "description": "C5/C6/C7. Exercise pure migration and actual hydration/import wiring for bare/wrapped/full backups, sync-intent import, Keep remote and archive restore delegation. Current v12 round trips retain agenda/history/provenance/marker; invalid new fields/targets/dates/duplicates, incomplete conversion and newer schemas fail before database/blob replacement. Legitimate unassigned or detached historical records pass. Presence/revision guards remain effective; no fake repair of old data.",
      "test": "all inbound paths preserve the new model or reject before replacement"
    },
    {
      "description": "C8. Export/import both pre-upgrade v11 and post-upgrade v12 fixtures, including attachment metadata and valid fixture bytes, lesson answers, manual dates and SR state. Verify deterministic upgrade and complete v12 retention after restore. Prove newer-version rejection remains; do not rewrite schemaVersion or omit new fields as a supposed downgrade. Documentation states old-build restore cannot retain later v12 edits.",
      "test": "rollback fixtures preserve exports without pretending v12 can be downgraded"
    },
    {
      "description": "A/B integration. One uniquely named Vitest test drives the actual app in an isolated Playwright browser at a 390x844 viewport: choose 5 then 30 minutes, inspect explanation/total/warm-up suitability and urgent work, start/finish/save, reload and rebuild. Assert the rendered date equals persisted item/pending review and successful extra practice does not advance again. Include within-test branches for same vs worse, manual date/result change, explicit No then item-level Schedule again, and unanswered save. Move the test clock across local midnight and mutate relevant fixture state to prove live preview/close revalidation without losing the draft. Use accessible controls, not production debug hooks or source regex.",
      "test": "daily practice browser journey preserves the decision across close and rebuild"
    },
    {
      "description": "C integration. One uniquely named Vitest test imports the legacy fixture through real UI, reloads to verify visible unassigned intent, targets question and preparation independently across two future lessons, marks asked and adds an answer, then verifies historical retention and no next-class repetition. Simulate clipboard rejection and assert accessible feedback plus selectable/download fallback. Check Farsi question with English title and the reverse through real DOM layout/direction, and keyboard-accessible names of changed controls. Exercise invalid new-model import and assert old data stays present.",
      "test": "lesson agenda browser journey retains questions after the targeted class"
    },
    {
      "description": "Musical/real-device acceptance only: using representative Setar and Guitar data, inspect 5/20/45-minute outputs and the published reasons. Confirm warm-up suitability, useful variety without quotas, urgency without repetitive crowding-out, quick start under 30 seconds and ordinary close under 60 seconds, and legible mixed Farsi/English on the actual phone. Confirm one-time unassigned migration is understandable. This is not permission to change scheduler policy or a claim that desktop automation reproduces the iPhone keyboard bug; deterministic checks above must already pass.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Heavy: schema v12 migrates lesson intent and minimal review-decision metadata; scheduling changes future dates and review transitions. Lossless/idempotent migration, preflight rejection, all inbound paths, export/restore and explicit rollback limitations require state-discriminating checks. No auth/payment/transport change."
  },
  "delta": {
    "today": "The time-budgeted session selects from role pools using rolling item lesson flags, permanent/count-based saturation and sometimes stale inputs; each successful close can advance spacing again, and teacher questions are mutable instrument-level strings.",
    "instead": "For the chosen instrument and available minutes, construct an explainable useful session from current exposure and specific lesson preparation, with optional familiar warm-up within the budget and no category quotas. Run normal practice blocks, preserve authoritative manual/early review dates and advance spacing only on eligible evidence. Questions target lessons independently and retain asked/answer history through one honest migration.",
    "keep": [
      "One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.",
      "Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.",
      "One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.",
      "Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.",
      "No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.",
      "Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.",
      "Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards."
    ],
    "assumptions": [
      "Existing run-a-session-plan is the primary Flow; practise-todays-recommendation, clear-a-due-review, adjust-how-scheduling-works, log-a-class, prepare-for-the-next-class and back-up-and-restore have explicit affected behaviour. Other mapped consumers require scoped impact reconciliation, not invented new journeys."
    ],
    "showMe": "Demonstrate the two named real-browser journeys after the three decision families pass independently, then an OWNER musical/phone check at 5/20/45 minutes. Show exact saved dates, independent lesson targets, unassigned legacy data, retained asked answers and unchanged practice history."
  },
  "desiredRules": [
    "Only actual practice may complete a review or provide spacing evidence; successful extra practice before the due opportunity does not advance spacing or move its date, and same is not deterioration. Administrative date actions never fabricate practice or progress.",
    "Manually chosen pending dates remain authoritative; an automatic early repair needs explicitly negative evidence and may only bring the date forward. All renderings and writes derive from the same decision.",
    "A session spends only the available minutes on eligible same-instrument items, with optional suitable warm-up and history-sensitive useful variety, never mandatory activity quotas or substantial new tagging.",
    "Every preparation or question commitment names its specific lesson or is visibly unassigned; questions do not imply item preparation, and asked questions retain their lesson history without automatic carry-forward.",
    "Migration preserves historical intent without guessing targets or scheduling provenance, is idempotent across all inbound paths, and rejects invalid new data before replacement."
  ],
  "docsDelta": [
    "AGENTS.md",
    "docs/product-spec.md",
    "docs/scheduling-evidence.md"
  ]
}
```
````

## The approved Delta this change must deliver

# For the chosen instrument and available minutes, construct an explainable useful session from current exposure and specific lesson preparation, with optional familiar warm-up within the budget and no category quotas. Run normal practice blocks, preserve authoritative manual/early review dates and advance spacing only on eligible evidence. Questions target lessons independently and retain asked/answer history through one honest migration.

_approved · about "run-a-session-plan"_

## Today

The time-budgeted session selects from role pools using rolling item lesson flags, permanent/count-based saturation and sometimes stale inputs; each successful close can advance spacing again, and teacher questions are mutable instrument-level strings.

## Instead

For the chosen instrument and available minutes, construct an explainable useful session from current exposure and specific lesson preparation, with optional familiar warm-up within the budget and no category quotas. Run normal practice blocks, preserve authoritative manual/early review dates and advance spacing only on eligible evidence. Questions target lessons independently and retain asked/answer history through one honest migration.

## Keep

- One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.
- Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.
- One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.
- Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.
- No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.
- Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.
- Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards.

## New assumptions

- Existing run-a-session-plan is the primary Flow; practise-todays-recommendation, clear-a-due-review, adjust-how-scheduling-works, log-a-class, prepare-for-the-next-class and back-up-and-restore have explicit affected behaviour. Other mapped consumers require scoped impact reconciliation, not invented new journeys.

## Show me

Demonstrate the two named real-browser journeys after the three decision families pass independently, then an OWNER musical/phone check at 5/20/45 minutes. Show exact saved dates, independent lesson targets, unassigned legacy data, retained asked answers and unchanged practice history.


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

# Find something in my repertoire

_Works now · approved 2026-08-28T13:30:17.801Z by Ethan (signed)_

## Goal

See everything you play, grouped the way you think about it, and open the one you mean.

## Starts when

The musician opens Repertoire and picks one of the three views: Pathways, My repertoire, or Practice list.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Chooses 'My repertoire'.
   - Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
   - Changes: Nothing; this is a lens over ordinary items, not a separate store.

2. **Practice Compass** Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
   - Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.

3. **The musician** Optionally filters by form, or narrows to one instrument.
   - Shows: Form chips built from what is actually present.

4. **The musician** Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
   - Shows: Items in priority order, each with its status and stats.

5. **The musician** Opens an item.
   - Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
   - Changes: Nothing until an action is taken there.

## Ends with

The right piece is found and opened in a couple of taps, from whichever way of thinking about it came first.

## Variations

- **No dastgāh yet** — Works with Persian identity but no dastgāh sit in an explicit 'No dastgāh yet' group at the end. _(Works now)_
- **Technique stays out** — Drills and generic exercises are not works — they live in the Practice list only. _(Works now)_

## Rules

- 'My repertoire' is a derived lens, never a parallel database of pieces.
- Links never duplicate an item.
- Study sources stay simple: instrument, one clear name, kind, status, note.

## Involves

- The musician

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

# Install the app and keep it current

_Works now · approved 2026-08-28T13:30:17.892Z by Ethan (signed)_

## Goal

Run the app installed on each device, practise with no network at all, and take new versions without ever reinstalling.

## Starts when

The musician opens the app's web address on a device and installs it to the home screen or dock.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Installs the app from its web address.
   - Shows: It opens like an app, full screen, with the navigation bar reaching the bottom of the phone.
   - Changes: The app's files are cached on the device; practice data stays in the device's own database.

2. **The musician** Practises with no network at all.
   - Shows: Everything works — recommendations, blocks, reviews, notes.
   - Changes: Nothing is special-cased for being offline; only syncing and opening NAS files need a network.

3. **Practice Compass** Checks for a new build every hour and whenever the app is brought back to the foreground.
   - Shows: A calm 'A new version is ready.' banner with a Reload button — never an automatic reload in the middle of a session.
   - Changes: Nothing until the musician chooses to reload.

4. **The musician** Taps Reload when it suits them.
   - Shows: The app restarts on the new version; Settings shows the build it is running.
   - Changes: Nothing in the practice data — an update replaces code, never data.

## Ends with

Both devices run the current version, neither needed reinstalling, and neither needs a network to practise.

## Variations

- **Offline when a check is due** — The check simply does nothing and tries again later — no error, no interruption. _(Works now)_
- **Not now** — Ignoring the banner keeps the current version running for as long as the musician likes; the offer comes back. _(Works now)_

## Rules

- Reinstalling is never the update path.
- An update never interrupts a running block — the reload is always the musician's choice.
- Every core flow works with no network.

## Involves

- The musician

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

# Point this device at the NAS

_Works now · approved 2026-08-28T13:30:17.952Z by Ethan (signed)_

## Goal

Give this device the address that turns a class recording or score link into a file it can actually open — without any of those files entering the app.

## Starts when

In Settings → NAS recordings the musician sets the base URL that serves their recordings folder.

## Needs first

- The recordings folder is served over the network from the NAS and is reachable from this device at some web address

## Steps

1. **The musician** Types the address that serves the recordings folder.
   - Shows: 'Resolves to: …/…' once it is valid, or 'That doesn’t look like a valid web address' if it is not; a host typed without a scheme is completed to https:// when the field loses focus.
   - Changes: The address is stored in this device's local storage. It is environment configuration, not practice data and not a secret: it never enters the database, a backup or a sync snapshot.

2. **The musician** Taps 'Test link' to open a known recording and confirm the address works.
   - Shows: The file opens in a new tab, or the app says the base URL isn’t valid and opens nothing.
   - Changes: Nothing is stored or downloaded — the app fetches a recording only when someone explicitly opens it.

3. **Practice Compass** Resolves every relative recording and score path in every lesson against this address from then on.
   - Shows: 'Open' beside each link; with no address it reads 'Set your NAS base URL in Settings to open this' and stays disabled — never a broken or wrong link.
   - Changes: Nothing in the data; resolving is pure and happens on demand.

## Ends with

This device can open class videos and scores on demand, while the app itself still holds nothing but links.

## Variations

- **Every device sets its own address** — The address is per-device and never syncs, so each device holds whatever address reaches the NAS from where it is — a new device simply has none until it is given one. _(Works now)_
- **The NAS is not reachable right now** — Opening a link fails in the browser like any unreachable address. Nothing in the app changes, no data is lost, and every other flow keeps working offline. _(Works now)_
- **Links that need no address** — A recording stored as a complete https address opens with no base URL set at all. _(Works now)_
- **A bad address** — An unparseable or non-http(s) address is reported as invalid and nothing is opened — it is never silently resolved to an in-app route. _(Works now)_

## Rules

- The NAS address is per-device configuration — never synced, never in a backup, never a password.
- The app stores links to recordings and scores, never their bytes.
- An unusable address is reported, never resolved to a wrong link.
- A recording is fetched only when the musician explicitly opens it — never at startup.

## Involves

- The musician
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-31T22:05:26.192Z by owner (signed)_

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
   - Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
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
- **Target reached** — When elapsed reaches the block's target, the ring's silent saturation is replaced by a durable 'Target reached' state plus a growing overtime figure (elapsed minus target) — announced once, never once per render. The block does NOT auto-finish — practising past the target stays ordinary, and only Finish or Discard ends it. Whether the screen-wake-lock or the accompanying sound/vibration cue succeeds, fails or is unsupported never changes the elapsed time or the minutes eventually saved. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.
- A recorded minute is never affected by whether the screen-wake-lock, sound or vibration succeeded — only the wall clock decides elapsed time.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Take questions and a summary to class

_Works now · approved 2026-08-28T13:30:18.013Z by Ethan (signed)_

## Goal

Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.

## Starts when

A question is written on an item (at close, or by editing it) while it is flagged for the next class.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Collects every item for that instrument that is both flagged for the next class and carries a question, ordered with the Persian collator.
   - Shows: A 'Questions for your next class' list on the upcoming lesson and on the Teacher report.

2. **The musician** Copies, downloads or prints the questions.
   - Shows: A numbered plain-text export that preserves mixed Farsi and English, or a friendly empty state when there are none.

3. **The musician** Opens the Teacher report and picks the instrument and a date range (last two weeks by default).
   - Shows: A copyable summary of what was practised, how it went and what is open.

4. **The musician** Taps 'Copy report'.
   - Shows: 'Copied ✓'.
   - Changes: Nothing in the data — the report is generated on the spot.

## Ends with

The musician walks into the lesson with their real questions and a truthful summary, without having kept a separate notebook.

## Variations

- **A question survives practice** — Practising never clears a question — only editing the item removes it. _(Works now)_

## Rules

- A question is never auto-cleared by practising.
- Reports state what happened; they never grade.

## Involves

- The musician
- The teacher

---

# Run a time-budgeted session

_Works now · approved 2026-08-31T22:05:33.129Z by owner (signed)_

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
   - Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
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

_Works now · approved 2026-08-31T22:05:33.178Z by owner (signed)_

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
- **Guided routine** — A stage routine runs as a segmented warm-up countdown. A segment bound to a real item creates an honest PracticeBlock when the run finishes (result stays 'not_logged', so no review completes and no spaced-repetition state advances — the practice itself IS recorded); a segment with no bound item is pure warm-up and logs nothing at all. While the run is genuinely active and its screen is visible, the app keeps the display awake, and arriving at a new segment is visibly announced — once, and staying perceptible for a few seconds, never a single-render flash. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.
- A routine records at most one PracticeBlock per distinct bound item per run, never one per segment repeat.

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

Build a daily session I can trust, from lesson commitments to the next review

## Stay in scope — you may ONLY change

- src/domain/scheduling.ts
- src/domain/scheduling.test.ts
- src/domain/scoring.ts
- src/domain/scoring.test.ts
- src/domain/recommend.ts
- src/domain/recommend.test.ts
- src/domain/plan.ts
- src/domain/plan.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/domain/defaults.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/report.ts
- src/domain/insights.ts
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/seed.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/seedMigration.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/index.ts
- src/domain/routines.test.ts
- src/domain/pathways.test.ts
- src/store/useStore.ts
- src/store/backup.ts
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- src/pages/Repertoire.tsx
- src/pages/StageDetail.tsx
- src/pages/NewItem.tsx
- src/pages/Settings.tsx
- src/components/ItemForm.tsx
- src/components/itemFormValues.ts
- src/components/ItemCard.tsx
- src/components/ClassQuestions.tsx
- src/components/format.ts
- src/components/format.test.ts
- src/components/direction.test.ts
- src/components/useDecisionNow.ts
- src/components/LessonAgenda.tsx
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/practiceBrowser.ts
- tests/fixtures/practice-decisions-v11.json
- tests/fixtures/practice-decisions-v12.json
- package.json
- package-lock.json
- vite.config.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- AGENTS.md
- docs/product-spec.md
- docs/scheduling-evidence.md
- src/domain/itemFiles.test.ts

Never touch:

- src/store/gitRemote.ts
- src/store/githubSync.ts
- src/store/syncEngine.ts
- src/store/idb.ts
- src/domain/sync.ts
- src/domain/canonical.ts
- src/components/useViewportGuard.ts
- src/components/Layout.tsx
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/domain/practiceSignal.ts
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/domain/routines.ts
- src/domain/pathwaySeed.ts
- src/styles/global.css
- public/**
- scripts/deploy-nas.sh
- One item, one mode, one focus, one result, one next action. Active remains calm and unchanged; Finish pauses time and the last nonempty next action remains visible before practice.
- Local/offline first, no backend, authentication service, paid service, AI/audio judgement, gamification, quotas or guilt-driven copy. Large media remains NAS references.
- One instrument per session. Plan and Routines remain independent collapsed peer doorways ABOVE the recommendation; keep the recommendation above the fold at 390x844. Do not reverse the owner's shipped ordering decision.
- Only real practice changes practice totals; no administrative action fabricates a block, result, completion or retention success. Preserve unanswered versus deliberate No, non-destructive Not now and honest snooze semantics.
- No silent data loss or guessed migration intent. Preserve old data and new question history, do not infer old manual date provenance or retroactively rebuild SR histories. Explicit user dates remain authoritative.
- Keep every existing sync presence/revision guard, deferred retry, whole-snapshot conflict/archive mechanism, clock accounting, wake-lock/signal behaviour and routine recording semantics unchanged.
- Preserve existing Farsi-aware search, direction-aware user-authored values, accessible in-box question ordinals and contrast. Any changed renderers are verified in the browser, not only with source guards.
- No scope creep through allowed shared files: Settings only scheduler explanation/local setup/migration guidance; Repertoire/Stage/ItemCard/Insights only new agenda/eligibility consumer adaptation; backup only new-model preflight validation/wiring. No broad information architecture, report engine, archive or import overhaul.
- CI workflow edits only install/run the required browser checks. Do not change triggers, permissions, deploy targets, Prismatica version pins or governance bypasses. No publish, merge, start-import or owner decisions by the builder.
- Canonical Flow/Rule records remain governed by Prismatica owner/protocol boundaries, not hand-edited as an implementation shortcut. Desired rule changes below are proposals until properly accepted.
- iPhone keyboard/bottom-navigation displacement: explicitly deferred in the last lane to a diagnostic OWNER readout. Do the diagnostic before or alongside this lane; no timeout, shell or viewport fix here. It is not a dependency of scheduling implementation.
- General inbound database validation and malformed attachment import loss: still open (backup skips malformed file rows before replacement). This lane validates its new data before mutation and tests valid full-backup round trips, but does not claim to repair all corrupt historical imports. A separate storage-integrity lane should follow; do not use a malformed backup as the rollout recovery copy.
- General item self-parenting/stale instrument-family metadata repair: still open. New agenda references must be valid, and planner metadata use must tolerate malformed/dangling links safely, but no broad item-model cleanup or historical metadata rewrite.
- Retrospective Insights/Teacher Report mixing period blocks with current result/status/stall state: confirmed in current source and deferred except for honest new question/lesson context. No historical analytics redesign.
- Settings newest-copy-wins wording and broad form naming/Settings accessibility/remaining direction exceptions: confirmed or explicitly excluded by the last lane. Correct accessible names and direction of changed controls only; do not reopen the shipped visual lane or restructure Settings.
- Archive-vs-delete redesign: item deletion currently confirms removal of its block history. Preserve ordinary explicit deletion semantics, except preserving/detaching the new question agenda honestly; a non-destructive item archive is a separate owner decision.
- New learning algorithm for novelty, physiological warm-up prescription, random rotation, activity quotas, required activity tags, generic test infrastructure, artificial mastery metrics, and routine nesting/automatic routine expansion into plans.
- Reimplementation of shipped correctness, NAS/search/material and direction/UI fixes, general clock refresh outside the changed decision surfaces, and product-map placeholder cleanup.
- Desired rule (not yet truth): Only actual practice may complete a review or provide spacing evidence; successful extra practice before the due opportunity does not advance spacing or move its date, and same is not deterioration. Administrative date actions never fabricate practice or progress.
- Desired rule (not yet truth): Manually chosen pending dates remain authoritative; an automatic early repair needs explicitly negative evidence and may only bring the date forward. All renderings and writes derive from the same decision.
- Desired rule (not yet truth): A session spends only the available minutes on eligible same-instrument items, with optional suitable warm-up and history-sensitive useful variety, never mandatory activity quotas or substantial new tagging.
- Desired rule (not yet truth): Every preparation or question commitment names its specific lesson or is visibly unassigned; questions do not imply item preparation, and asked questions retain their lesson history without automatic carry-forward.
- Desired rule (not yet truth): Migration preserves historical intent without guessing targets or scheduling provenance, is idempotent across all inbound paths, and rejects invalid new data before replacement.

## Definition of done

- **ac-1** — A1/A2/A3. Against the real pure close transition, table all three stable results, a future date, due date, first schedule and repeated same-day closes. Early successes preserve date/open-row identity/reps/ease/base while real block stats change; a due stable result advances once; explicit clear/re-arm and reload cannot enable a second same-day advance. Undefined/not_logged and routine exposure never advance. Distinguish the actual permitted and forbidden cases, not just a default result. → proven by `early successful practice preserves the pending review and spacing state`
- **ac-2** — A3/A4. same and slightly_better before due preserve the schedule and SR state; neither is described as a slip. Due same/slightly_better repeat rather than expand/reset the interval. worse may shorten an automatic future review with min(existing,repair), never postpone it even on repetition. Verify a repair setting modified by importance/difficulty explains the final saved date, not the raw setting. → proven by `only deterioration can bring an automatic review forward`
- **ac-3** — A5/C6. Table auto-date manual override, manual mode, fixed cadence, snoozed date and unknown legacy provenance with positive/same/worse results before/at/after due. Protected future dates remain exact. Manual no-new-date preserves pending state unless explicit No. Fixed due scheduling uses fixed cadence without SR change. An explicit date edit is respected even when different from the engine. → proven by `manual and fixed dates survive extra practice without advancing spacing`
- **ac-4** — A6. Exercise real shared transitions for explicit decline, unanswered, scheduled-without-date, initial schedule, no-open-row Schedule again, existing-open-row edit and snooze. Assert item/open-row dates agree, no duplicate pending review is created by repetition, completed history is unchanged, and administrative actions create no block/result/SR progress. Conflicting legacy pending dates must be reported rather than silently discarded. → proven by `decline unanswered and schedule again make distinct pending review transitions`
- **ac-5** — B3/C2. Compare dormant vs active and preparation vs question-only/unassigned/past/other-instrument agenda entries across recommend, plan and swap. Resting-only automatic pools are honestly empty, never resurrected by fallback. Direct explicit item practice remains possible. A question alone changes no practice priority; only a specific current/future lesson preparation contributes its own urgency. → proven by `recommendations exclude resting items and question only urgency`
- **ac-6** — B5. Equal minutes/time split into one vs several blocks have equal exposure; longer recent practice cannot count as less exposure. Include routine/not_logged blocks, future timestamps, UTC/local midnight, DST and old same results. Recent penalties decay; old same can yield a strategy hint but not permanent saturation or selection exclusion. → proven by `recent exposure measures minutes and decays independently of old same results`
- **ac-7** — B2/B4. At 5 and 10 minutes a tomorrow-lesson usable item with higher true urgency beats an unrelated new deep item; one main focus uses the budget. With no urgent work, an ordinary usable/improvisation/rhythm/theory item remains eligible without fabricated mastery or category requirements. Wrong-instrument candidates never enter the plan. → proven by `short sessions choose the most useful anchor before optional roles`
- **ac-8** — B1/B2. Table 5/10/12/15/20/45/60/120 minutes; familiar Radif/piece and familiar technique candidates versus unfamiliar demanding exercise. No mandatory warm-up in short sessions or when unsuitable. When present it is first, within the total, its bounded share is real, and useful main work remains. No special warm-up entity/tag is required; routine data is unchanged. Invalid budgets reject cleanly. → proven by `warm up uses familiar existing material within the chosen budget`
- **ac-9** — B4/B5/B6. A fixed multi-day fixture with lesson work, due maintenance and existing diverse/absent metadata shows urgent work selected when needed, recently exposed equivalents yielding to fresh useful work, maintenance remaining reachable as repeated urgent exposure accumulates, and missing categories never filled artificially. Same input and permutations of storage arrays produce identical selections and reasons using stable ids. Document the numeric policy and fixture outputs. → proven by `session variety responds to exposure without quotas or losing urgent work`
- **ac-10** — B2/B3/B7. Exercise initial build, swap, regenerate, remove and all-practised fallback with the same candidates. No dormant/wrong-instrument candidate bypass, duplicate item, or selected-but-described-as-skipped item. Allocations never exceed the budget and normally use it fully when suitable eligible work exists; an honest remainder is allowed when filling it would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. All segments remain feasible and positive; dropping/redistributing cannot attach another role's minutes/reason to the wrong item. Reasons identify the actual lesson, final date or repeat/exposure trade-off. → proven by `build swap and redistribution preserve candidate identity and honest reasons`
- **ac-11** — B7. Rehydrate a partially done/skipped plan, change/delete/move a pending item, and attempt to begin with another unfinished ordinary/routine session. Completed progress and real blocks survive; invalid pending work cannot start under another instrument; skipping/ending logs nothing. Live relevant changes cannot silently start stale preview decisions. Use actual store wiring in the browser journey as well as any extracted pure transition. → proven by `plan transitions preserve progress and refuse stale cross instrument starts`
- **ac-12** — C1/C2. One item has a question for lesson A and preparation for lesson B. Query each lesson, Today, item and report: no question-derived urgency, no duplicated next-class agenda, no mutation of Lesson.itemIds. Several same-instrument future lessons remain distinct. No future lesson produces visible unassigned capture; same-instrument target validation rejects mismatches. → proven by `lesson preparation and questions have independent specific targets`
- **ac-13** — C3/C4. Mark asked with/without answer, reopen, pass the lesson date, reschedule it, delete it and move/delete an associated item. Text/answer/former target identification survives detachment. Asked entries never reappear automatically; unasked past entries remain on that lesson, and only explicit carry-forward changes target. None of these actions logs practice or completes a review. → proven by `asked questions remain historical without automatic carry forward`
- **ac-14** — C5. v11 fixtures include true/false/missing flags, question-only items, multiline Farsi/English, empty text, no future lessons, several future lessons, ids resembling generated ids and partially migrated entries. Convert each legacy intention once to the correct unassigned kind, preserve text verbatim, invent no asked state/answer/target, and produce the same result on different days and repeated applications. Already-current empty collections remain empty. Unrelated data and SR state are byte-equivalent. → proven by `legacy lesson intent migrates unassigned exactly once without losing text`
- **ac-15** — C5/C6/C7. Exercise pure migration and actual hydration/import wiring for bare/wrapped/full backups, sync-intent import, Keep remote and archive restore delegation. Current v12 round trips retain agenda/history/provenance/marker; invalid new fields/targets/dates/duplicates, incomplete conversion and newer schemas fail before database/blob replacement. Legitimate unassigned or detached historical records pass. Presence/revision guards remain effective; no fake repair of old data. → proven by `all inbound paths preserve the new model or reject before replacement`
- **ac-16** — C8. Export/import both pre-upgrade v11 and post-upgrade v12 fixtures, including attachment metadata and valid fixture bytes, lesson answers, manual dates and SR state. Verify deterministic upgrade and complete v12 retention after restore. Prove newer-version rejection remains; do not rewrite schemaVersion or omit new fields as a supposed downgrade. Documentation states old-build restore cannot retain later v12 edits. → proven by `rollback fixtures preserve exports without pretending v12 can be downgraded`
- **ac-17** — A/B integration. One uniquely named Vitest test drives the actual app in an isolated Playwright browser at a 390x844 viewport: choose 5 then 30 minutes, inspect explanation/total/warm-up suitability and urgent work, start/finish/save, reload and rebuild. Assert the rendered date equals persisted item/pending review and successful extra practice does not advance again. Include within-test branches for same vs worse, manual date/result change, explicit No then item-level Schedule again, and unanswered save. Move the test clock across local midnight and mutate relevant fixture state to prove live preview/close revalidation without losing the draft. Use accessible controls, not production debug hooks or source regex. → proven by `daily practice browser journey preserves the decision across close and rebuild`
- **ac-18** — C integration. One uniquely named Vitest test imports the legacy fixture through real UI, reloads to verify visible unassigned intent, targets question and preparation independently across two future lessons, marks asked and adds an answer, then verifies historical retention and no next-class repetition. Simulate clipboard rejection and assert accessible feedback plus selectable/download fallback. Check Farsi question with English title and the reverse through real DOM layout/direction, and keyboard-accessible names of changed controls. Exercise invalid new-model import and assert old data stays present. → proven by `lesson agenda browser journey retains questions after the targeted class`
- **ac-19** — Musical/real-device acceptance only: using representative Setar and Guitar data, inspect 5/20/45-minute outputs and the published reasons. Confirm warm-up suitability, useful variety without quotas, urgency without repetitive crowding-out, quick start under 30 seconds and ordinary close under 60 seconds, and legible mixed Farsi/English on the actual phone. Confirm one-time unassigned migration is understandable. This is not permission to change scheduler policy or a claim that desktop automation reproduces the iPhone keyboard bug; deterministic checks above must already pass. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- docs/product-spec.md
- docs/scheduling-evidence.md

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

