---
id: 20260913-build-a-daily-session-i-can-trust-from-l-402e
contractId: 20260913-build-a-daily-session-i-can-trust-from-l-402e
patchId: ef11455be76b2cd5550634cfc82fa943f9f7951d
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: C7 new-model inbound validation
    summary: The cold-start refusal is visible but its corrupt-data recovery
      instruction is unreachable.
    counterexample: At src/App.tsx:107-140, every refused hydration remains behind
      the !hydrated full-app gate. The corrupt-data branch at src/App.tsx:123
      tells the owner to use Import in Settings, but Settings and every route
      are rendered only after hydrated becomes true, which this refusal
      deliberately prevents. The owner therefore still has no actionable in-app
      recovery route. The exact named test at src/domain/io.test.ts:548-574
      asserts only the fresh store's hydration and reactive status; it never
      renders App or proves that the instructed recovery action is reachable.
      Complete the sealed family with a safe reachable recovery action while
      preserving refused bytes, and exercise the rendered cold-start refusal and
      that action.
createdAt: 2026-09-14T18:03:53.701Z
sealedAt: 2026-09-14T18:09:53.543Z
---

# Review: Build a daily session I can trust, from lesson commitments to the next review

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260913-build-a-daily-session-i-can-trust-from-l-402e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/22
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `ef11455be76b2cd5550634cfc82fa943f9f7951d`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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

## The Delta this change was framed from

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



## Files in this diff

- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- AGENTS.md
- docs/product-spec.md
- docs/scheduling-evidence.md
- package-lock.json
- package.json
- src/App.tsx
- src/components/ClassQuestions.tsx
- src/components/ItemCard.tsx
- src/components/ItemForm.tsx
- src/components/LessonAgenda.tsx
- src/components/direction.test.ts
- src/components/format.test.ts
- src/components/format.ts
- src/components/itemFormValues.ts
- src/components/useDecisionNow.ts
- src/domain/blocks.test.ts
- src/domain/factories.ts
- src/domain/index.ts
- src/domain/insights.ts
- src/domain/io.test.ts
- src/domain/io.ts
- src/domain/itemFiles.test.ts
- src/domain/lessonAgenda.test.ts
- src/domain/lessonAgenda.ts
- src/domain/migrations.test.ts
- src/domain/migrations.ts
- src/domain/plan.test.ts
- src/domain/plan.ts
- src/domain/questions.test.ts
- src/domain/questions.ts
- src/domain/recommend.test.ts
- src/domain/recommend.ts
- src/domain/report.ts
- src/domain/routines.test.ts
- src/domain/scheduling.test.ts
- src/domain/scheduling.ts
- src/domain/scoring.test.ts
- src/domain/scoring.ts
- src/domain/seed.ts
- src/domain/selectors.ts
- src/domain/types.ts
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Repertoire.tsx
- src/pages/SessionPlan.tsx
- src/pages/Settings.tsx
- src/pages/StageDetail.tsx
- src/pages/TeacherReport.tsx
- src/pages/Today.tsx
- src/store/useStore.ts
- tests/daily-practice.browser.test.ts
- tests/fixtures/practice-decisions-v11.json
- tests/fixtures/practice-decisions-v12.json
- tests/lesson-agenda.browser.test.ts
- tests/practiceBrowser.ts
- vite.config.ts

## Check against the contract

- [ ] **ac-1** — A1/A2/A3. Against the real pure close transition, table all three stable results, a future date, due date, first schedule and repeated same-day closes. Early successes preserve date/open-row identity/reps/ease/base while real block stats change; a due stable result advances once; explicit clear/re-arm and reload cannot enable a second same-day advance. Undefined/not_logged and routine exposure never advance. Distinguish the actual permitted and forbidden cases, not just a default result. _(proof: early successful practice preserves the pending review and spacing state)_
- [ ] **ac-2** — A3/A4. same and slightly_better before due preserve the schedule and SR state; neither is described as a slip. Due same/slightly_better repeat rather than expand/reset the interval. worse may shorten an automatic future review with min(existing,repair), never postpone it even on repetition. Verify a repair setting modified by importance/difficulty explains the final saved date, not the raw setting. _(proof: only deterioration can bring an automatic review forward)_
- [ ] **ac-3** — A5/C6. Table auto-date manual override, manual mode, fixed cadence, snoozed date and unknown legacy provenance with positive/same/worse results before/at/after due. Protected future dates remain exact. Manual no-new-date preserves pending state unless explicit No. Fixed due scheduling uses fixed cadence without SR change. An explicit date edit is respected even when different from the engine. _(proof: manual and fixed dates survive extra practice without advancing spacing)_
- [ ] **ac-4** — A6. Exercise real shared transitions for explicit decline, unanswered, scheduled-without-date, initial schedule, no-open-row Schedule again, existing-open-row edit and snooze. Assert item/open-row dates agree, no duplicate pending review is created by repetition, completed history is unchanged, and administrative actions create no block/result/SR progress. Conflicting legacy pending dates must be reported rather than silently discarded. _(proof: decline unanswered and schedule again make distinct pending review transitions)_
- [ ] **ac-5** — B3/C2. Compare dormant vs active and preparation vs question-only/unassigned/past/other-instrument agenda entries across recommend, plan and swap. Resting-only automatic pools are honestly empty, never resurrected by fallback. Direct explicit item practice remains possible. A question alone changes no practice priority; only a specific current/future lesson preparation contributes its own urgency. _(proof: recommendations exclude resting items and question only urgency)_
- [ ] **ac-6** — B5. Equal minutes/time split into one vs several blocks have equal exposure; longer recent practice cannot count as less exposure. Include routine/not_logged blocks, future timestamps, UTC/local midnight, DST and old same results. Recent penalties decay; old same can yield a strategy hint but not permanent saturation or selection exclusion. _(proof: recent exposure measures minutes and decays independently of old same results)_
- [ ] **ac-7** — B2/B4. At 5 and 10 minutes a tomorrow-lesson usable item with higher true urgency beats an unrelated new deep item; one main focus uses the budget. With no urgent work, an ordinary usable/improvisation/rhythm/theory item remains eligible without fabricated mastery or category requirements. Wrong-instrument candidates never enter the plan. _(proof: short sessions choose the most useful anchor before optional roles)_
- [ ] **ac-8** — B1/B2. Table 5/10/12/15/20/45/60/120 minutes; familiar Radif/piece and familiar technique candidates versus unfamiliar demanding exercise. No mandatory warm-up in short sessions or when unsuitable. When present it is first, within the total, its bounded share is real, and useful main work remains. No special warm-up entity/tag is required; routine data is unchanged. Invalid budgets reject cleanly. _(proof: warm up uses familiar existing material within the chosen budget)_
- [ ] **ac-9** — B4/B5/B6. A fixed multi-day fixture with lesson work, due maintenance and existing diverse/absent metadata shows urgent work selected when needed, recently exposed equivalents yielding to fresh useful work, maintenance remaining reachable as repeated urgent exposure accumulates, and missing categories never filled artificially. Same input and permutations of storage arrays produce identical selections and reasons using stable ids. Document the numeric policy and fixture outputs. _(proof: session variety responds to exposure without quotas or losing urgent work)_
- [ ] **ac-10** — B2/B3/B7. Exercise initial build, swap, regenerate, remove and all-practised fallback with the same candidates. No dormant/wrong-instrument candidate bypass, duplicate item, or selected-but-described-as-skipped item. Allocations never exceed the budget and normally use it fully when suitable eligible work exists; an honest remainder is allowed when filling it would require unsuitable repetition, fabricated filler or stretching work beyond sensible allocation. All segments remain feasible and positive; dropping/redistributing cannot attach another role's minutes/reason to the wrong item. Reasons identify the actual lesson, final date or repeat/exposure trade-off. _(proof: build swap and redistribution preserve candidate identity and honest reasons)_
- [ ] **ac-11** — B7. Rehydrate a partially done/skipped plan, change/delete/move a pending item, and attempt to begin with another unfinished ordinary/routine session. Completed progress and real blocks survive; invalid pending work cannot start under another instrument; skipping/ending logs nothing. Live relevant changes cannot silently start stale preview decisions. Use actual store wiring in the browser journey as well as any extracted pure transition. _(proof: plan transitions preserve progress and refuse stale cross instrument starts)_
- [ ] **ac-12** — C1/C2. One item has a question for lesson A and preparation for lesson B. Query each lesson, Today, item and report: no question-derived urgency, no duplicated next-class agenda, no mutation of Lesson.itemIds. Several same-instrument future lessons remain distinct. No future lesson produces visible unassigned capture; same-instrument target validation rejects mismatches. _(proof: lesson preparation and questions have independent specific targets)_
- [ ] **ac-13** — C3/C4. Mark asked with/without answer, reopen, pass the lesson date, reschedule it, delete it and move/delete an associated item. Text/answer/former target identification survives detachment. Asked entries never reappear automatically; unasked past entries remain on that lesson, and only explicit carry-forward changes target. None of these actions logs practice or completes a review. _(proof: asked questions remain historical without automatic carry forward)_
- [ ] **ac-14** — C5. v11 fixtures include true/false/missing flags, question-only items, multiline Farsi/English, empty text, no future lessons, several future lessons, ids resembling generated ids and partially migrated entries. Convert each legacy intention once to the correct unassigned kind, preserve text verbatim, invent no asked state/answer/target, and produce the same result on different days and repeated applications. Already-current empty collections remain empty. Unrelated data and SR state are byte-equivalent. _(proof: legacy lesson intent migrates unassigned exactly once without losing text)_
- [ ] **ac-15** — C5/C6/C7. Exercise pure migration and actual hydration/import wiring for bare/wrapped/full backups, sync-intent import, Keep remote and archive restore delegation. Current v12 round trips retain agenda/history/provenance/marker; invalid new fields/targets/dates/duplicates, incomplete conversion and newer schemas fail before database/blob replacement. Legitimate unassigned or detached historical records pass. Presence/revision guards remain effective; no fake repair of old data. _(proof: all inbound paths preserve the new model or reject before replacement)_
- [ ] **ac-16** — C8. Export/import both pre-upgrade v11 and post-upgrade v12 fixtures, including attachment metadata and valid fixture bytes, lesson answers, manual dates and SR state. Verify deterministic upgrade and complete v12 retention after restore. Prove newer-version rejection remains; do not rewrite schemaVersion or omit new fields as a supposed downgrade. Documentation states old-build restore cannot retain later v12 edits. _(proof: rollback fixtures preserve exports without pretending v12 can be downgraded)_
- [ ] **ac-17** — A/B integration. One uniquely named Vitest test drives the actual app in an isolated Playwright browser at a 390x844 viewport: choose 5 then 30 minutes, inspect explanation/total/warm-up suitability and urgent work, start/finish/save, reload and rebuild. Assert the rendered date equals persisted item/pending review and successful extra practice does not advance again. Include within-test branches for same vs worse, manual date/result change, explicit No then item-level Schedule again, and unanswered save. Move the test clock across local midnight and mutate relevant fixture state to prove live preview/close revalidation without losing the draft. Use accessible controls, not production debug hooks or source regex. _(proof: daily practice browser journey preserves the decision across close and rebuild)_
- [ ] **ac-18** — C integration. One uniquely named Vitest test imports the legacy fixture through real UI, reloads to verify visible unassigned intent, targets question and preparation independently across two future lessons, marks asked and adds an answer, then verifies historical retention and no next-class repetition. Simulate clipboard rejection and assert accessible feedback plus selectable/download fallback. Check Farsi question with English title and the reverse through real DOM layout/direction, and keyboard-accessible names of changed controls. Exercise invalid new-model import and assert old data stays present. _(proof: lesson agenda browser journey retains questions after the targeted class)_
- [ ] **ac-19** — Musical/real-device acceptance only: using representative Setar and Guitar data, inspect 5/20/45-minute outputs and the published reasons. Confirm warm-up suitability, useful variety without quotas, urgency without repetitive crowding-out, quick start under 30 seconds and ordinary close under 60 seconds, and legible mixed Farsi/English on the actual phone. Confirm one-time unassigned migration is understandable. This is not permission to change scheduler policy or a claim that desktop automation reproduces the iPhone keyboard bug; deterministic checks above must already pass. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx, vite.config.ts
- **log-a-class** — touched via src/pages/Lessons.tsx, src/domain/selectors.ts, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx, src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/StageDetail.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/plan.ts, src/domain/scheduling.ts, src/domain/types.ts, src/pages/CloseBlock.tsx, src/pages/Settings.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts matched changed file(s) src/domain/scheduling.ts, src/domain/selectors.ts, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, vite.config.ts matched changed file(s) src/pages/Settings.tsx, vite.config.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/selectors.ts, src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts matched changed file(s) src/domain/recommend.ts, src/domain/scheduling.ts, src/domain/scoring.ts, src/pages/CloseBlock.tsx, src/pages/Today.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts matched changed file(s) src/domain/plan.ts, src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts matched changed file(s) src/domain/insights.ts, src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StageDetail.tsx, src/store/useStore.ts matched changed file(s) src/pages/StageDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### install-the-app-and-keep-it-current — Works now

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

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

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260913-build-a-daily-session-i-can-trust-from-l-402e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260913-build-a-daily-session-i-can-trust-from-l-402e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
