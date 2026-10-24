---
id: 20261023-make-practice-records-dependable-and-kee-34cc
contractId: 20261023-make-practice-records-dependable-and-kee-34cc
contractHash: 697718a85bd26deb885ec1ec572559c8bc7a5f86b4adcfaa7f241d62c161801a
createdAt: 2026-10-23T17:51:30.372Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Make practice records dependable and keep session choices aligned with the work being done

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/56
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261023-make-practice-records-dependable-and-kee-34cc

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Make practice records dependable and keep session choices aligned with the work being done

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Use the Prismatica start skill to inspect the current practice-compass repo and produce an import-ready plan for Claude to build.
> Treat this as a fresh, first-principles review of the practice/session experience. Prefer one coherent lane if safe. Diagnose root causes and choose the best UX/domain model rather than assuming my suggested solutions are correct. Recommended solutions are suggestions only. decide the best and most optimal options and solutions yourself if needed.
> Cover these issues:
> - Routine runs (solutions are suggestions only. decide the best and most optimal options and solutions yourself if needed): with my Setar “Warm up” routine containing two items, only the first item is reliably logged. If optional feedback is omitted, completed practice may not appear in that item’s Practice history. A skipped item should not be falsely logged as practised.
> - Routine clarity/control: show what items are in a routine before starting and while running it. During a run, support a sensible skip/remove flow and decide whether unused time should be redistributed or discarded.
> - Session Plan: allow the planned items to be reordered, not only swapped or removed.
> - Working notes: edits made during practice should not be lost merely because I forget to press Done; design safe autosave/draft behaviour.
> - Theory: find a coherent, low-friction way for session planning/recommendations to include useful theory study from time to time, especially for Setar/Persian music (e.g. Radif, dastgah, note functions), without bolting on an unrelated feature.
> - Scheduling/review model: rethink it deeply. The current Status/result choices and spacing can confuse progress on a small chunk with readiness of the whole work. A successful chunk can push a still-unfinished piece out by weeks/months. Material being prepared for the next class should normally keep returning appropriately until that lesson rather than disappearing because it has accumulated successful reviews. Decide the best model for chunk work, whole-work readiness, class-driven urgency, results/statuses, recommendation and next-review dates while preserving honest practice records and avoiding repetitive/noisy recommendations.
> - CI/release reliability: we repeatedly hit the GitHub Actions 10-minute Playwright browser-install timeout because azure.archive.ubuntu.com was reachable but too slow. Existing mirror protection detects dead mirrors but not this slow-mirror case. Deployment eventually succeeded after reruns. Inspect the current reliability machinery and include a bounded fix if still needed.
> Protect existing data, sync, offline/PWA behaviour, sound/wake-lock behaviour, mobile keyboard/tab fixes and previously solved flows. If saved-data semantics must change, plan migration/backward compatibility explicitly.
> Most importantly, design the plan to minimise builder↔reviewer loops: use family-level acceptance checks, test real counterexamples and missed states, distinguish product failures from harness/infrastructure failures, give Claude implementation discretion, and explicitly bound review so taste, speculative edge cases and unrelated pre-existing defects do not block. Do not over-prescribe implementation or create brittle source scanners merely to satisfy the plan. Allow the builder room to make optimal decision especially about implementation as it has direct access to the repo and changes and might have more insights.
> Review the current Flows, AGENTS/DECISIONS and existing test before deciding scope. Anticipate interactions between these changes and consolidate shared root causes. Include only owner/manual checks that automation genuinely cannot prove.
> Builder: Claude.
> Return the final Prismatica import-ready plan only.
> 
> Final owner refinements, superseding only conflicting details above:
> 1. Clarify CI lifecycle: deterministic local CI-setup proof is sufficient before review/seal. A real GitHub Actions run is post-ship evidence and must pass before merge; its absence before ship is not a review blocker.
> 2. Add one minimal OWNER product check using real Setar data: one unfinished piece being prepared for the next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. This is only to judge whether the new model and UX make sense in real practice; date/data correctness remains automated. Keep the existing native iPhone/sound check.
> 3. For note conflicts, require no silent loss or overwrite and preservation of both competing texts, but let Claude use the simplest resolution consistent with the existing conflict model rather than requiring a new explicit conflict UI.
> 4. Review Plan and Routine controls together, especially remove/skip/move-on and treatment of unused time. Choose the most coherent and user-friendly model across both so similar actions behave consistently where that makes sense and differences exist only when they have a clear product reason. Avoid making the user learn unnecessary different behaviours between Plan and Routine. Decide whether unused time is redistributed, discarded or handled another way in each relevant state, including before and during practice, based on the overall workflow rather than assuming the current Routine rule should apply to Plan. Make the resulting behaviour clear, deterministic and covered by the appropriate acceptance families. Preserve builder discretion over the exact interaction design.
> Keep the existing bounded review rules, family-level proof and other settled product decisions. Avoid adding requirements solely for theoretical edge cases or implementation preference.
> Revalidate and return the final Prismatica import-ready plan only.

## Why

One coherent heavy lane: planning, performing, recording and returning to work share the same item, practice evidence and persistence boundaries. Correct those shared meanings once rather than add a separate theory app, another routine logger or another ranking engine. The small CI repair is an explicitly requested technical companion, not a new product Flow. Retain the existing independent Plan/Routines doorways. Implementation freedom applies to structure, controls and bounded policy tuning, not to fabricating evidence or weakening data protection.

## Today

Inspected clean main dc964b3b, current Flow context, AGENTS.md, CLAUDE.md, relevant DECISIONS entries and connected domain/store/UI/tests. No code or owner database was changed and no test suite or live Actions run was executed during planning.
1. Routines: routines.ts aggregates every positive elapsed bound-item interval, including repeated bindings, into one not_logged block per item. finishRoutine saves before optional RoutineCapture. lookups.itemBlocks and ItemDetail.BlockHistory do NOT filter not_logged. The existing post-practice browser test saves two bound items, omits capture and reloads, but checks histories only after annotated capture; it does not reproduce the owner's exact missing-second-item report. A binding, transition, persistence or display failure remains to be discriminated, not asserted as a known root cause. Skip currently keeps positive elapsed time, even a few milliseconds rounded to one minute. Label-only/unbound segments intentionally produce no item block.
2. RoutineRunner's pre-start screen shows only count/total, and the live screen shows current/next rather than the full run. Today/PathwayDetail/StageDetail and RoutineDuration can start directly. Runs snapshot authoredSegments and effective segments. Edits must keep that identity relationship coherent.
3. SessionPlan preview supports swap/remove/regenerate, but no reorder. Start rejects stale rev/day; each segment then opens a real block. Allocation already protects whole-work floors and warm-up/cool-down shares; preview Remove currently reallocates its freed minutes, while running Skip leaves the other targets unchanged.
4. DurableNotes is shared by item and lesson notes. It requires Done and intentionally abandons an unsaved draft on owner change or remount, including a routine boundary. Its saveSeq, live draft ref, acknowledgement and retry protections solve other races and must survive replacing that explicit-save requirement.
5. Theory already has strand reading_theory, mapped to ordinary itemType other and focus other. The full item-kind chooser does not make it easy to create such work. Diversity can prefer another dimension but does not assure a useful theory opportunity.
6. decideReview receives item/result/date/params, not the scope of evidence or lesson preparation. Stable results can expand SR and feed preselected status suggestions, even if the owner practised only a chunk. same/slightly_better repeat the current interval, which may already be long. Positive early practice correctly keeps future dates; protected dates and one advancement/day already exist. LessonAgenda's dated preparations affect ranking and plan eligibility, not the date decision. Today and planner also differ in their same-day repeat treatment. Status mixes readiness and work intention; result has no scope in saved blocks.
7. All three suite workflows probe only a small InRelease file within five seconds before a ten-minute with-deps install. DECISIONS explicitly records the still-open alive-but-slow Azure limitation. Existing tests execute that probe against local hung/refused/missing/live endpoints but not a mirror whose small index is quick and large package transfer is slow. Some canonical Flow prose still describes older behaviour, such as lesson blur-saving and rolling class flags; code and present rules govern, and only affected truth should be reconciled.

## Instead

PRODUCT MODEL AND BUILDER CHECKLIST
[ ] First establish a committed synthetic two-item Setar Warm up counterexample through the real editor and normal start doors, with deliberately different labels and bound titles. Inspect binding, effective segments, store outcome, IndexedDB and BOTH histories with feedback omitted. Distinguish an absent block from an invisible block and from an intentionally unbound segment. If the reported missing-second-item defect is not reproduced, retain the checked-clean implementation and add the missing proof; do not invent a logger rewrite or historical repair.
[ ] Implement the unified evidence and return policy, then routine/control and note changes, then the small CI fix. The highest-leverage action is settling and testing the scope/return decision before editing its screens. Next three actions for Claude: reproduce the routine family; write the decision table and independent expected examples; implement through the existing domain/store boundaries with the focused proof route below. One lane, staged internally, not several independently changing schedulers.

A. HONEST ROUTINE RUNS
Completion is the clock/run outcome, not optional feedback. Every practised bound item reaches its own history and totals after natural completion or Finish & save, including leaving completion without feedback. Preserve at most one block per distinct item with actual aggregated minutes and no fabricated assessment. A label without an item remains visibly unbound; never infer binding by title or create an item silently. The save acknowledgement must distinguish written-to-memory from durable storage; a failed finish retains enough run/outcome state for retry without double credit and never claims the run is safely saved.
Use the shared Plan/Routine control and time policy in section B. Preserve routine boundary acknowledgement, pause/resume and the one-clock invariant. An unassessed finish and routine feedback still never complete retention reviews, advance SR or promote status.
Show an ordered, readable contents preview before the start tap, including bound item, segment label, duration, essentials and unbound status. Reach it from Today, stage, pathway and duration/essentials choices without making routine Edit the preview. While running, make the full frozen contents reachable with current/completed/skipped/pending states and the controls above; keep the clock and current item prominent, no persistent dashboard. The fitted/essentials preview must be the run actually started. Changes to the saved routine mid-run cannot replace the frozen run. No effect-started clock; every actual Start/Resume still readies sound in that tap.

B. COHERENT PLAN/ROUTINE CONTROLS AND TIME
Treat the selected time as available capacity, not a requirement to fill every minute after the owner removes work. Choose the same predictable default in both flows: removing/skipping a task or moving on early does not lengthen the others. This avoids changing the practice commitment attached to an untouched item. The state/action policy is:
- Before starting either flow, Remove from this session removes only that preview entry, records nothing, preserves the other entries' order/durations, and leaves an honest unused remainder. For a routine it never edits the saved definition; review its actual fitted/essentials contents before starting. Essentials-only drops excluded work and its time rather than silently refitting what remains.
- Reordering the Plan preview changes only order. Swap retains the slot's duration and existing eligibility/floor constraints. An explicit Regenerate or change of available Plan budget can rebuild allocations through the existing planner; an explicit routine duration choice can proportionally fit the selected contents through its existing fitter. These are deliberate time-allocation actions, not side effects of Remove. Keep the displayed preview consistent with the action the owner just chose. No new redistribution setting, refill wizard or automatic attempt to spend the remainder.
- During either session, a not-yet-started entry can be skipped or removed from this run without logging practice, changing other durations, editing a saved routine or deleting the practice item. Use consistent words and consequences for equivalent controls; a single skip/remove affordance per state is sufficient. Do not require duplicate controls or a new running-plan editor. Completed entries and their records cannot be retrospectively removed by session controls.
- For the current running or paused item, distinguish Skip without practising from Move on and keep practised time. Skip records no time/evidence for THAT occurrence, even when time has passed before the tap; make that consequence clear using the existing discard protection where appropriate. Move on keeps the actual partial practice and leaves the unused target time unallocated. Earlier real practice of a repeated routine item survives skipping a later occurrence. In Plan, route kept practice through the existing Finish/Close/Save flow, with its deliberate Save without a result option and eligible scheduling decision, then advance only after saving. In Routine, retain its lighter elapsed-time recording with optional capture after the run and no retention judgement. This existing distinction is justified by real independently closed Plan blocks versus a continuous routine, not by different meanings of Skip or kept time. Claude chooses labels, placement and the smallest reliable transition implementation.
- Finishing early or ending a session preserves already saved practice; ongoing practice is kept only through the appropriate save path, never silently discarded. Skipped, removed or unused time creates no block. Overtime is recorded only as actual practice and never charged to another entry's target. Remaining targets stay unchanged throughout the run; do not retroactively recover unused time by redistribution. If every entry is removed/skipped, present the ordinary empty/completed outcome without a blank screen or invented practice.
Show the actual planned/remaining time and any unused portion clearly, separately from available time and actual recorded practice. The total must never claim to fill the budget after a removal, and actual time must never be inferred from the original budget. Preserve generated-plan floors, role-share caps and budget limits; change only automatic redistribution after removal, not the generator's useful initial allocations.
Provide accessible Move earlier/Move later controls in the Plan preview, usable by keyboard and touch; drag is unnecessary. Move the whole segment identity with its existing minutes, role, reason and focus. It changes no ranking, database, review or budget. Owner order wins over generated role order when starting. Preserve stale rev/day and startability checks. Running-plan reordering remains excluded.

C. NOTES WITHOUT A DONE DEPENDENCY
Use the shared DurableNotes ownership model so item and lesson instances do not diverge. Edits autosave after a short quiet interval; navigation, Finish, collapse, routine boundary and switching owner must preserve the latest text for its original owner without requiring Done. Done may remain as close/flush, never the only saving path. Keep the text editable while saves settle. Acknowledged IndexedDB, not a debounce timer or updated Zustand state, is what permits Saved. Retain retry that really writes, Copy, intentional empty clearing, current-save sequence protection and correct Farsi IME composition/caret behaviour.
A draft must survive editor unmount and be recoverable after an ordinary reload once its local persistence is acknowledged. Choose the smallest local draft/write mechanism that covers rapid exits before the quiet interval, with an explicit bounded outstanding-write window. Do not promise survival of a process kill before any storage can acknowledge. Canonical working notes remain item.notes; any recovery draft is device-local, owner-typed, temporary and never another synchronised notebook. Handle the item-versus-lesson id namespace, concurrent editors and stale writes from before import/sync/restore/reset: a pending draft cannot resurrect a deleted record, write onto a replacement database, or silently overwrite newer remote text. When both texts changed, preserve both competing texts without silent loss or overwrite. Claude should use the simplest recoverable resolution consistent with the existing conflict model; a new dedicated conflict UI is not required. Notes change no practice counter, clock, review, exposure, status, sound claim or next action. Never flush a stale draft merely because blur fired.

D. SCOPED EVIDENCE AND RETURNING TO WORK
Keep the persisted status/result enum keys and old records readable. Separate three questions in the UX and decision: what this block covered, what happened there, and whether the complete ITEM is ready to be kept fresh. A result describes only the saved block's scope. The default is focused work; a whole-item retention check is an explicit, low-effort choice, never inferred from a stable button, mode, title, elapsed time or successful part. A child item can be checked as its own complete unit; nothing propagates its status, results, counters, review completion or spacing to its parent. No mandatory new text field or extra close form. Use calm labels, keep the six historical result meanings (including not_logged), and make readiness an explicit owner decision rather than a preselected automatic promotion from focused work. Suggestions are permissible when scope warrants them, but accepting one must be deliberate.
Distinguish Working on this from Keep fresh as return intentions, separate from manual/fixed/automatic date ownership. Default new and unresolved legacy automatic items to Working; an existing explicit maintenance status can retain its intention, while stable historical results or integrated/performable labels alone do not prove whole-item retention. Keep fresh is owner-controlled and reversible without recording practice or resetting historical SR. Claude may encode this with the smallest additive representation; do not build a second progress hierarchy.
Automatic Working schedules short useful returns, independent of accumulated SR intervals: choose and document a deterministic 1–3-day default policy, with weaker evidence no later than stronger evidence, rather than weeks/months after chunk success or an unchanged result. A close without assessment preserves schedule/evidence semantics; recording time alone is not a retention judgement. A due Keep fresh item expands spacing only after an explicit whole-item check with eligible stable evidence, at most once per local day. Focused work never completes that whole-item check or expands/resets its SR, even with a performable/worse result. Same is not failed recall. Preserve protected future manual, fixed-cadence and unknown-provenance dates; voluntary switching intention transfers no date authority and creates no practice. Working cadence intentionally permits an assessed close to bring an engine-owned long date forward, replacing the old positive-early-practice keep rule for Working only; Keep fresh retains that early-practice protection. A switch of intention alone keeps the stored date. All date writes and pending rows stay coupled, explicit clear stays distinct from omitted, and administrative actions never invent practice.
Lesson preparation remains an intent for its named upcoming class, not a claim of mastery or completion. An active preparation gets a near-term practice opportunity through the lesson, including when a retained review lies months away. Derive this opportunity from lessonAgenda, the lesson's real date and recent real practice using the same pure return decision consumed by Today and Plan. It may bring a suggestion earlier than a protected retention date but never silently rewrites that date. Show one primary Next practice explanation identifying whether it is working cadence, class preparation or a retention review; the retained/manual review date remains inspectable and is never falsely described as overwritten/calculated. No duplicate class-review rows, second stored class calendar or automatic carry-forward. A passed, removed, retargeted, unassigned, other-instrument or archive-origin lesson contributes no inherited deadline. Questions never add urgency.
Share eligibility, evidence interpretation and repeat suppression across Today, build, regenerate, swap and fallback. Recent genuine exposure, including unassessed routine practice, lowers repetitive suggestions today without completing preparation. On a later day the still-live class work can return; when it is the only eligible work, show an honest explained fallback rather than hide it or call it fresh. Deduplicate cards and parent/part opportunities where they represent the same intended work, without copying practice evidence between them; a separately due whole-work check remains a distinct eligible need. Urgency outranks variety. Choose and document bounded constants using counterexample fixtures, not claims of an empirically optimal music-learning algorithm. One pure decision must support preview, persistence and explanation, with the existing save-time day-refresh guarantee.

E. THEORY AS ORDINARY USEFUL WORK
Expose Theory / listening study through the existing Add practice item path, reusing reading_theory and ordinary notes, study source, lessons, references, routine bindings and block history. No third creation path, theory database, quiz, flashcard system, generated expertise or runtime AI. A theory item belongs to the selected instrument and sits in Practice list, not My repertoire merely because it names a dastgah. Reuse identity/metadata rules rather than infer musical authority from text.
Offer a small, dismissible way to add a title-only study focus relevant to the current material, such as listening to a teacher's Radif example, comparing phrases in the current dastgah, or studying note functions using the owner's source. These are prompts/questions, not asserted Persian theory or invented lesson content. Never create or seed an owned study item without the owner's tap. Use neutral built-in Farsi behind stable ids where any Persian reference prompts ship; free text stays free text.
An existing eligible theory item should occasionally surface through shared planning/recommendation logic when urgent work is covered and there is room: a bounded recent-exposure/diversity preference, not a mandatory daily slot, calendar, quota or extra panel. The proof must include a multi-session fixture where useful unpractised theory gets a turn and an opposing imminent-class/short-budget fixture where it does not displace the main work. No candidate means no filler. Keep time budgets and item floors, and do not give a small study task a whole-work floor because its label mentions Radif.

F. BOUNDED CI REPAIR
Address the known alive-but-slow Azure apt route before the with-deps install across ci.yml, deploy.yml and prismatica-gate.yml. Prefer a small deterministic bypass of that implicated mirror using the runner's supported Ubuntu source configuration and appropriate trusted alternatives over another small-file liveness/throughput heuristic. Claude may choose another bounded fallback if it demonstrably handles a fast index plus slow package transfer. Retain valid suites/components/signing/security settings; do not rewrite arbitrary repositories, disable signature/TLS checks, assume all runner layouts are identical, or leave no usable source without a clear failure. Preserve pinned-lockfile Chromium AND WebKit provisioning, aligned check steps, ten-minute install/twenty-minute job bounds, cancel-superseded behaviour and tests-before-publish. No timeout inflation, rerun-as-the-fix, skipped engine or broad caching redesign. Execute the setup logic with temporary source layouts and local fake endpoints; syntax/string checks alone cannot prove failover. Deterministic local execution of the CI-setup logic plus the required local checks is sufficient before review/seal. A real GitHub Actions run is post-ship evidence: after the normal owner-controlled ship/push, it must pass before merge. Its absence before ship is not a review/seal blocker. Keep actual runner/install failures separate from product correctness, and do not add an owner CI ritual.

G. DATA AND COMPATIBILITY
Additive semantics require the next schema version and a pure deterministic idempotent migration through migrateToCurrent/validateDB. Preserve all old blocks verbatim, including ambiguous result scope; never backfill whole-item evidence, recalculate past totals, delete routine records or infer missing practice from a routine definition. Preserve SR history even when new Working returns cease using it for long intervals. Preserve ids, enum keys, dates/provenance, commitments, user notes, attachments and bytes, source/catalogue identity and untouched fields. Legacy automatic long dates are retained as data and visibly explained; the new Working/class opportunity must make unfinished material reachable now, without bulk rewriting them on hydration. A later eligible assessed close can adopt the Working policy through the normal coupled date write.
Validate every new field and any new unfinished-run shape at every applicable door: persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore, cold-start recovery. Missing legacy scope stays unknown. Wrong types/values and too-new schemas refuse before changing memory, disk, blobs or live practice. Old clients must refuse the new schema rather than silently discard fields; explain the existing update-both-devices path without adding an update wizard. An in-progress legacy routine must remain resumable with its old accumulated time and bindings; do not reinterpret an old skip as new evidence or silently drop its elapsed practice. Tests must distinguish old dual-clock recovery from ordinary single-clock states.

H. FAMILY PROOF AND REVIEW BOUNDARY
Before first review, put the final decision table, consumer inventory, fixed fixtures with independently calculated expected outcomes and one focused command in docs/practice-session-model.md. Cover invariants in the acceptance families below across actual store mutations and rendered readers, not just helper return values. Show each reached consumer, including checked-clean consumers, and the limits of the proof. Use a compact set of purposeful counterexamples, not an unbounded Cartesian product. Expected dates/minutes/statuses must be literal or independently calculated, not obtained by calling the implementation as its own oracle.
Focused route: npx vitest run tests/practice-session-families.test.ts tests/practice-session.browser.test.ts tests/practice-session-inbound.browser.test.ts tests/ci-browser-setup.test.ts. Place each named acceptance title in exactly one test; engines/cases may loop within it. Reuse current helpers, fixtures, fake fetch and storage controls. Fix touched tests that currently assert deliberate draft loss, implicit skip credit, automatic redistribution after removal or unscoped SR expansion. Retain meaningful old negative protections. Full required checks are npm run lint, npm test and npm run build plus configured Prismatica checks. Existing direction/agent-context ledgers may be updated for changed sites/rules; create no new source scanners or implementation-shape assertions. No mandatory mutation framework, exhaustive fuzzing, repeated full-suite stress loops or second proof CLI.
Review the exact built patch and these finite behaviour/data families. A blocker needs a reproducible reachable counterexample violating an agreed invariant or an attributable regression; provide expected/actual and the affected family. Fix the shared cause and sweep its identified consumers together, then recheck that family and required checks affected by the fix. Do not reopen accepted decisions as taste, block on a preferred component architecture, invent unsupported data states or demand unrelated pre-existing cleanup. New evidence of real data loss remains a blocker. Infrastructure/setup/harness failures are separately labelled with logs and the positive event that failed; they do not establish product failure or justify loosening waits. Required local checks must have valid passing evidence before review/seal; the post-ship Actions requirement is the separate pre-merge gate specified in section F. Reuse patch-bound evidence until code relevant to it changes; do not turn review into an arbitrary round limit.
Reconcile changed Flow truth/mechanics through governed proposals for practise-todays-recommendation, run-a-session-plan, work-a-pathway-stage, adjust-how-scheduling-works, clear-a-due-review and capture-a-practice-item; log-a-class is affected by the shared editor. Preserve unmodified Flow mechanics and signatures, do not silently edit canonical records, and do not turn unrelated stale Flow wording into a discovery campaign. Update AGENTS current rules in place for autosave ownership, shared session-control/time semantics, scoped review/return and theory eligibility, with rationale in DECISIONS.
Owner checks are limited to the existing native iPhone/sound check and one minimal real-Setar product walkthrough. For the latter, use one real unfinished piece prepared for its named next class, record focused chunk practice, read its Next practice explanation, compare one Keep fresh item, and inspect one generated session plan. Judge only whether the model and UX make sense in actual practice; dates, preservation, ranking policy and minute correctness remain automated. One brief acceptance observation is sufficient, not a general taste review or a request to upload private data. All ordinary histories, note recovery, flows, budgets, offline persistence and release gates remain automated. A two-item named owner routine is still a fixture requirement, not a demand for private database access.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- A1. The owner has authorised choosing the interaction/domain model; this import is the concrete owner decision replacing Done-only notes and the old ambiguous Skip behaviour, with corresponding AGENTS edits. Builder is claude as explicitly requested.
- A2. Missing second-item logging is an owner report, not reproduced here; synthetic fixtures must resolve which boundary fails without access to private practice data.
- A3. Working returns and occasional theory are organisational defaults, not prescriptions or measured mastery; Claude chooses clear controls, module boundaries and documented bounded constants that satisfy the specified counterexamples.

**Possible conflicts**

- Present AGENTS rules explicitly require Done, drop a draft on item change, and define Skip as clamping elapsed. This proposal intentionally replaces those rules while preserving their ownership and durability protections; record the owner-approved change rather than pretending it is a refactor. Automatic Working returns also intentionally replace the current rule that only worse may bring any engine-owned future date forward; the early-date protection remains for Keep fresh and for all owner/fixed/unknown dates. Plan preview Remove currently redistributes freed minutes; this proposal deliberately makes its default consistent with the other remove/skip states, leaving time unused until a deliberate rebuild or duration choice.
- The one-date preview rule must evolve into one coherent return decision that can explain an earlier derived class/working opportunity alongside an unchanged protected review date. Do not silently create two schedulers or claim a derived suggestion was written.
- Current Flow text contains pre-existing stale details. Update only changed truth through governed proposals; canonical Flow/rule signatures require the established owner approval lifecycle. The CI companion needs no invented Flow.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Use the Prismatica start skill to inspect the current practice-compass repo and produce an import-ready plan for Claude to build.\nTreat this as a fresh, first-principles review of the practice/session experience. Prefer one coherent lane if safe. Diagnose root causes and choose the best UX/domain model rather than assuming my suggested solutions are correct. Recommended solutions are suggestions only. decide the best and most optimal options and solutions yourself if needed.\nCover these issues:\n- Routine runs (solutions are suggestions only. decide the best and most optimal options and solutions yourself if needed): with my Setar “Warm up” routine containing two items, only the first item is reliably logged. If optional feedback is omitted, completed practice may not appear in that item’s Practice history. A skipped item should not be falsely logged as practised.\n- Routine clarity/control: show what items are in a routine before starting and while running it. During a run, support a sensible skip/remove flow and decide whether unused time should be redistributed or discarded.\n- Session Plan: allow the planned items to be reordered, not only swapped or removed.\n- Working notes: edits made during practice should not be lost merely because I forget to press Done; design safe autosave/draft behaviour.\n- Theory: find a coherent, low-friction way for session planning/recommendations to include useful theory study from time to time, especially for Setar/Persian music (e.g. Radif, dastgah, note functions), without bolting on an unrelated feature.\n- Scheduling/review model: rethink it deeply. The current Status/result choices and spacing can confuse progress on a small chunk with readiness of the whole work. A successful chunk can push a still-unfinished piece out by weeks/months. Material being prepared for the next class should normally keep returning appropriately until that lesson rather than disappearing because it has accumulated successful reviews. Decide the best model for chunk work, whole-work readiness, class-driven urgency, results/statuses, recommendation and next-review dates while preserving honest practice records and avoiding repetitive/noisy recommendations.\n- CI/release reliability: we repeatedly hit the GitHub Actions 10-minute Playwright browser-install timeout because azure.archive.ubuntu.com was reachable but too slow. Existing mirror protection detects dead mirrors but not this slow-mirror case. Deployment eventually succeeded after reruns. Inspect the current reliability machinery and include a bounded fix if still needed.\nProtect existing data, sync, offline/PWA behaviour, sound/wake-lock behaviour, mobile keyboard/tab fixes and previously solved flows. If saved-data semantics must change, plan migration/backward compatibility explicitly.\nMost importantly, design the plan to minimise builder↔reviewer loops: use family-level acceptance checks, test real counterexamples and missed states, distinguish product failures from harness/infrastructure failures, give Claude implementation discretion, and explicitly bound review so taste, speculative edge cases and unrelated pre-existing defects do not block. Do not over-prescribe implementation or create brittle source scanners merely to satisfy the plan. Allow the builder room to make optimal decision especially about implementation as it has direct access to the repo and changes and might have more insights.\nReview the current Flows, AGENTS/DECISIONS and existing test before deciding scope. Anticipate interactions between these changes and consolidate shared root causes. Include only owner/manual checks that automation genuinely cannot prove.\nBuilder: Claude.\nReturn the final Prismatica import-ready plan only.\n\nFinal owner refinements, superseding only conflicting details above:\n1. Clarify CI lifecycle: deterministic local CI-setup proof is sufficient before review/seal. A real GitHub Actions run is post-ship evidence and must pass before merge; its absence before ship is not a review blocker.\n2. Add one minimal OWNER product check using real Setar data: one unfinished piece being prepared for the next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. This is only to judge whether the new model and UX make sense in real practice; date/data correctness remains automated. Keep the existing native iPhone/sound check.\n3. For note conflicts, require no silent loss or overwrite and preservation of both competing texts, but let Claude use the simplest resolution consistent with the existing conflict model rather than requiring a new explicit conflict UI.\n4. Review Plan and Routine controls together, especially remove/skip/move-on and treatment of unused time. Choose the most coherent and user-friendly model across both so similar actions behave consistently where that makes sense and differences exist only when they have a clear product reason. Avoid making the user learn unnecessary different behaviours between Plan and Routine. Decide whether unused time is redistributed, discarded or handled another way in each relevant state, including before and during practice, based on the overall workflow rather than assuming the current Routine rule should apply to Plan. Make the resulting behaviour clear, deterministic and covered by the appropriate acceptance families. Preserve builder discretion over the exact interaction design.\nKeep the existing bounded review rules, family-level proof and other settled product decisions. Avoid adding requirements solely for theoretical edge cases or implementation preference.\nRevalidate and return the final Prismatica import-ready plan only.",
  "builder": "claude",
  "summary": "Make practice records dependable and keep session choices aligned with the work being done",
  "rationale": "One coherent heavy lane: planning, performing, recording and returning to work share the same item, practice evidence and persistence boundaries. Correct those shared meanings once rather than add a separate theory app, another routine logger or another ranking engine. The small CI repair is an explicitly requested technical companion, not a new product Flow. Retain the existing independent Plan/Routines doorways. Implementation freedom applies to structure, controls and bounded policy tuning, not to fabricating evidence or weakening data protection.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "Inspected clean main dc964b3b, current Flow context, AGENTS.md, CLAUDE.md, relevant DECISIONS entries and connected domain/store/UI/tests. No code or owner database was changed and no test suite or live Actions run was executed during planning.\n1. Routines: routines.ts aggregates every positive elapsed bound-item interval, including repeated bindings, into one not_logged block per item. finishRoutine saves before optional RoutineCapture. lookups.itemBlocks and ItemDetail.BlockHistory do NOT filter not_logged. The existing post-practice browser test saves two bound items, omits capture and reloads, but checks histories only after annotated capture; it does not reproduce the owner's exact missing-second-item report. A binding, transition, persistence or display failure remains to be discriminated, not asserted as a known root cause. Skip currently keeps positive elapsed time, even a few milliseconds rounded to one minute. Label-only/unbound segments intentionally produce no item block.\n2. RoutineRunner's pre-start screen shows only count/total, and the live screen shows current/next rather than the full run. Today/PathwayDetail/StageDetail and RoutineDuration can start directly. Runs snapshot authoredSegments and effective segments. Edits must keep that identity relationship coherent.\n3. SessionPlan preview supports swap/remove/regenerate, but no reorder. Start rejects stale rev/day; each segment then opens a real block. Allocation already protects whole-work floors and warm-up/cool-down shares; preview Remove currently reallocates its freed minutes, while running Skip leaves the other targets unchanged.\n4. DurableNotes is shared by item and lesson notes. It requires Done and intentionally abandons an unsaved draft on owner change or remount, including a routine boundary. Its saveSeq, live draft ref, acknowledgement and retry protections solve other races and must survive replacing that explicit-save requirement.\n5. Theory already has strand reading_theory, mapped to ordinary itemType other and focus other. The full item-kind chooser does not make it easy to create such work. Diversity can prefer another dimension but does not assure a useful theory opportunity.\n6. decideReview receives item/result/date/params, not the scope of evidence or lesson preparation. Stable results can expand SR and feed preselected status suggestions, even if the owner practised only a chunk. same/slightly_better repeat the current interval, which may already be long. Positive early practice correctly keeps future dates; protected dates and one advancement/day already exist. LessonAgenda's dated preparations affect ranking and plan eligibility, not the date decision. Today and planner also differ in their same-day repeat treatment. Status mixes readiness and work intention; result has no scope in saved blocks.\n7. All three suite workflows probe only a small InRelease file within five seconds before a ten-minute with-deps install. DECISIONS explicitly records the still-open alive-but-slow Azure limitation. Existing tests execute that probe against local hung/refused/missing/live endpoints but not a mirror whose small index is quick and large package transfer is slow. Some canonical Flow prose still describes older behaviour, such as lesson blur-saving and rolling class flags; code and present rules govern, and only affected truth should be reconciled.",
  "desiredBehaviour": "PRODUCT MODEL AND BUILDER CHECKLIST\n[ ] First establish a committed synthetic two-item Setar Warm up counterexample through the real editor and normal start doors, with deliberately different labels and bound titles. Inspect binding, effective segments, store outcome, IndexedDB and BOTH histories with feedback omitted. Distinguish an absent block from an invisible block and from an intentionally unbound segment. If the reported missing-second-item defect is not reproduced, retain the checked-clean implementation and add the missing proof; do not invent a logger rewrite or historical repair.\n[ ] Implement the unified evidence and return policy, then routine/control and note changes, then the small CI fix. The highest-leverage action is settling and testing the scope/return decision before editing its screens. Next three actions for Claude: reproduce the routine family; write the decision table and independent expected examples; implement through the existing domain/store boundaries with the focused proof route below. One lane, staged internally, not several independently changing schedulers.\n\nA. HONEST ROUTINE RUNS\nCompletion is the clock/run outcome, not optional feedback. Every practised bound item reaches its own history and totals after natural completion or Finish & save, including leaving completion without feedback. Preserve at most one block per distinct item with actual aggregated minutes and no fabricated assessment. A label without an item remains visibly unbound; never infer binding by title or create an item silently. The save acknowledgement must distinguish written-to-memory from durable storage; a failed finish retains enough run/outcome state for retry without double credit and never claims the run is safely saved.\nUse the shared Plan/Routine control and time policy in section B. Preserve routine boundary acknowledgement, pause/resume and the one-clock invariant. An unassessed finish and routine feedback still never complete retention reviews, advance SR or promote status.\nShow an ordered, readable contents preview before the start tap, including bound item, segment label, duration, essentials and unbound status. Reach it from Today, stage, pathway and duration/essentials choices without making routine Edit the preview. While running, make the full frozen contents reachable with current/completed/skipped/pending states and the controls above; keep the clock and current item prominent, no persistent dashboard. The fitted/essentials preview must be the run actually started. Changes to the saved routine mid-run cannot replace the frozen run. No effect-started clock; every actual Start/Resume still readies sound in that tap.\n\nB. COHERENT PLAN/ROUTINE CONTROLS AND TIME\nTreat the selected time as available capacity, not a requirement to fill every minute after the owner removes work. Choose the same predictable default in both flows: removing/skipping a task or moving on early does not lengthen the others. This avoids changing the practice commitment attached to an untouched item. The state/action policy is:\n- Before starting either flow, Remove from this session removes only that preview entry, records nothing, preserves the other entries' order/durations, and leaves an honest unused remainder. For a routine it never edits the saved definition; review its actual fitted/essentials contents before starting. Essentials-only drops excluded work and its time rather than silently refitting what remains.\n- Reordering the Plan preview changes only order. Swap retains the slot's duration and existing eligibility/floor constraints. An explicit Regenerate or change of available Plan budget can rebuild allocations through the existing planner; an explicit routine duration choice can proportionally fit the selected contents through its existing fitter. These are deliberate time-allocation actions, not side effects of Remove. Keep the displayed preview consistent with the action the owner just chose. No new redistribution setting, refill wizard or automatic attempt to spend the remainder.\n- During either session, a not-yet-started entry can be skipped or removed from this run without logging practice, changing other durations, editing a saved routine or deleting the practice item. Use consistent words and consequences for equivalent controls; a single skip/remove affordance per state is sufficient. Do not require duplicate controls or a new running-plan editor. Completed entries and their records cannot be retrospectively removed by session controls.\n- For the current running or paused item, distinguish Skip without practising from Move on and keep practised time. Skip records no time/evidence for THAT occurrence, even when time has passed before the tap; make that consequence clear using the existing discard protection where appropriate. Move on keeps the actual partial practice and leaves the unused target time unallocated. Earlier real practice of a repeated routine item survives skipping a later occurrence. In Plan, route kept practice through the existing Finish/Close/Save flow, with its deliberate Save without a result option and eligible scheduling decision, then advance only after saving. In Routine, retain its lighter elapsed-time recording with optional capture after the run and no retention judgement. This existing distinction is justified by real independently closed Plan blocks versus a continuous routine, not by different meanings of Skip or kept time. Claude chooses labels, placement and the smallest reliable transition implementation.\n- Finishing early or ending a session preserves already saved practice; ongoing practice is kept only through the appropriate save path, never silently discarded. Skipped, removed or unused time creates no block. Overtime is recorded only as actual practice and never charged to another entry's target. Remaining targets stay unchanged throughout the run; do not retroactively recover unused time by redistribution. If every entry is removed/skipped, present the ordinary empty/completed outcome without a blank screen or invented practice.\nShow the actual planned/remaining time and any unused portion clearly, separately from available time and actual recorded practice. The total must never claim to fill the budget after a removal, and actual time must never be inferred from the original budget. Preserve generated-plan floors, role-share caps and budget limits; change only automatic redistribution after removal, not the generator's useful initial allocations.\nProvide accessible Move earlier/Move later controls in the Plan preview, usable by keyboard and touch; drag is unnecessary. Move the whole segment identity with its existing minutes, role, reason and focus. It changes no ranking, database, review or budget. Owner order wins over generated role order when starting. Preserve stale rev/day and startability checks. Running-plan reordering remains excluded.\n\nC. NOTES WITHOUT A DONE DEPENDENCY\nUse the shared DurableNotes ownership model so item and lesson instances do not diverge. Edits autosave after a short quiet interval; navigation, Finish, collapse, routine boundary and switching owner must preserve the latest text for its original owner without requiring Done. Done may remain as close/flush, never the only saving path. Keep the text editable while saves settle. Acknowledged IndexedDB, not a debounce timer or updated Zustand state, is what permits Saved. Retain retry that really writes, Copy, intentional empty clearing, current-save sequence protection and correct Farsi IME composition/caret behaviour.\nA draft must survive editor unmount and be recoverable after an ordinary reload once its local persistence is acknowledged. Choose the smallest local draft/write mechanism that covers rapid exits before the quiet interval, with an explicit bounded outstanding-write window. Do not promise survival of a process kill before any storage can acknowledge. Canonical working notes remain item.notes; any recovery draft is device-local, owner-typed, temporary and never another synchronised notebook. Handle the item-versus-lesson id namespace, concurrent editors and stale writes from before import/sync/restore/reset: a pending draft cannot resurrect a deleted record, write onto a replacement database, or silently overwrite newer remote text. When both texts changed, preserve both competing texts without silent loss or overwrite. Claude should use the simplest recoverable resolution consistent with the existing conflict model; a new dedicated conflict UI is not required. Notes change no practice counter, clock, review, exposure, status, sound claim or next action. Never flush a stale draft merely because blur fired.\n\nD. SCOPED EVIDENCE AND RETURNING TO WORK\nKeep the persisted status/result enum keys and old records readable. Separate three questions in the UX and decision: what this block covered, what happened there, and whether the complete ITEM is ready to be kept fresh. A result describes only the saved block's scope. The default is focused work; a whole-item retention check is an explicit, low-effort choice, never inferred from a stable button, mode, title, elapsed time or successful part. A child item can be checked as its own complete unit; nothing propagates its status, results, counters, review completion or spacing to its parent. No mandatory new text field or extra close form. Use calm labels, keep the six historical result meanings (including not_logged), and make readiness an explicit owner decision rather than a preselected automatic promotion from focused work. Suggestions are permissible when scope warrants them, but accepting one must be deliberate.\nDistinguish Working on this from Keep fresh as return intentions, separate from manual/fixed/automatic date ownership. Default new and unresolved legacy automatic items to Working; an existing explicit maintenance status can retain its intention, while stable historical results or integrated/performable labels alone do not prove whole-item retention. Keep fresh is owner-controlled and reversible without recording practice or resetting historical SR. Claude may encode this with the smallest additive representation; do not build a second progress hierarchy.\nAutomatic Working schedules short useful returns, independent of accumulated SR intervals: choose and document a deterministic 1–3-day default policy, with weaker evidence no later than stronger evidence, rather than weeks/months after chunk success or an unchanged result. A close without assessment preserves schedule/evidence semantics; recording time alone is not a retention judgement. A due Keep fresh item expands spacing only after an explicit whole-item check with eligible stable evidence, at most once per local day. Focused work never completes that whole-item check or expands/resets its SR, even with a performable/worse result. Same is not failed recall. Preserve protected future manual, fixed-cadence and unknown-provenance dates; voluntary switching intention transfers no date authority and creates no practice. Working cadence intentionally permits an assessed close to bring an engine-owned long date forward, replacing the old positive-early-practice keep rule for Working only; Keep fresh retains that early-practice protection. A switch of intention alone keeps the stored date. All date writes and pending rows stay coupled, explicit clear stays distinct from omitted, and administrative actions never invent practice.\nLesson preparation remains an intent for its named upcoming class, not a claim of mastery or completion. An active preparation gets a near-term practice opportunity through the lesson, including when a retained review lies months away. Derive this opportunity from lessonAgenda, the lesson's real date and recent real practice using the same pure return decision consumed by Today and Plan. It may bring a suggestion earlier than a protected retention date but never silently rewrites that date. Show one primary Next practice explanation identifying whether it is working cadence, class preparation or a retention review; the retained/manual review date remains inspectable and is never falsely described as overwritten/calculated. No duplicate class-review rows, second stored class calendar or automatic carry-forward. A passed, removed, retargeted, unassigned, other-instrument or archive-origin lesson contributes no inherited deadline. Questions never add urgency.\nShare eligibility, evidence interpretation and repeat suppression across Today, build, regenerate, swap and fallback. Recent genuine exposure, including unassessed routine practice, lowers repetitive suggestions today without completing preparation. On a later day the still-live class work can return; when it is the only eligible work, show an honest explained fallback rather than hide it or call it fresh. Deduplicate cards and parent/part opportunities where they represent the same intended work, without copying practice evidence between them; a separately due whole-work check remains a distinct eligible need. Urgency outranks variety. Choose and document bounded constants using counterexample fixtures, not claims of an empirically optimal music-learning algorithm. One pure decision must support preview, persistence and explanation, with the existing save-time day-refresh guarantee.\n\nE. THEORY AS ORDINARY USEFUL WORK\nExpose Theory / listening study through the existing Add practice item path, reusing reading_theory and ordinary notes, study source, lessons, references, routine bindings and block history. No third creation path, theory database, quiz, flashcard system, generated expertise or runtime AI. A theory item belongs to the selected instrument and sits in Practice list, not My repertoire merely because it names a dastgah. Reuse identity/metadata rules rather than infer musical authority from text.\nOffer a small, dismissible way to add a title-only study focus relevant to the current material, such as listening to a teacher's Radif example, comparing phrases in the current dastgah, or studying note functions using the owner's source. These are prompts/questions, not asserted Persian theory or invented lesson content. Never create or seed an owned study item without the owner's tap. Use neutral built-in Farsi behind stable ids where any Persian reference prompts ship; free text stays free text.\nAn existing eligible theory item should occasionally surface through shared planning/recommendation logic when urgent work is covered and there is room: a bounded recent-exposure/diversity preference, not a mandatory daily slot, calendar, quota or extra panel. The proof must include a multi-session fixture where useful unpractised theory gets a turn and an opposing imminent-class/short-budget fixture where it does not displace the main work. No candidate means no filler. Keep time budgets and item floors, and do not give a small study task a whole-work floor because its label mentions Radif.\n\nF. BOUNDED CI REPAIR\nAddress the known alive-but-slow Azure apt route before the with-deps install across ci.yml, deploy.yml and prismatica-gate.yml. Prefer a small deterministic bypass of that implicated mirror using the runner's supported Ubuntu source configuration and appropriate trusted alternatives over another small-file liveness/throughput heuristic. Claude may choose another bounded fallback if it demonstrably handles a fast index plus slow package transfer. Retain valid suites/components/signing/security settings; do not rewrite arbitrary repositories, disable signature/TLS checks, assume all runner layouts are identical, or leave no usable source without a clear failure. Preserve pinned-lockfile Chromium AND WebKit provisioning, aligned check steps, ten-minute install/twenty-minute job bounds, cancel-superseded behaviour and tests-before-publish. No timeout inflation, rerun-as-the-fix, skipped engine or broad caching redesign. Execute the setup logic with temporary source layouts and local fake endpoints; syntax/string checks alone cannot prove failover. Deterministic local execution of the CI-setup logic plus the required local checks is sufficient before review/seal. A real GitHub Actions run is post-ship evidence: after the normal owner-controlled ship/push, it must pass before merge. Its absence before ship is not a review/seal blocker. Keep actual runner/install failures separate from product correctness, and do not add an owner CI ritual.\n\nG. DATA AND COMPATIBILITY\nAdditive semantics require the next schema version and a pure deterministic idempotent migration through migrateToCurrent/validateDB. Preserve all old blocks verbatim, including ambiguous result scope; never backfill whole-item evidence, recalculate past totals, delete routine records or infer missing practice from a routine definition. Preserve SR history even when new Working returns cease using it for long intervals. Preserve ids, enum keys, dates/provenance, commitments, user notes, attachments and bytes, source/catalogue identity and untouched fields. Legacy automatic long dates are retained as data and visibly explained; the new Working/class opportunity must make unfinished material reachable now, without bulk rewriting them on hydration. A later eligible assessed close can adopt the Working policy through the normal coupled date write.\nValidate every new field and any new unfinished-run shape at every applicable door: persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore, cold-start recovery. Missing legacy scope stays unknown. Wrong types/values and too-new schemas refuse before changing memory, disk, blobs or live practice. Old clients must refuse the new schema rather than silently discard fields; explain the existing update-both-devices path without adding an update wizard. An in-progress legacy routine must remain resumable with its old accumulated time and bindings; do not reinterpret an old skip as new evidence or silently drop its elapsed practice. Tests must distinguish old dual-clock recovery from ordinary single-clock states.\n\nH. FAMILY PROOF AND REVIEW BOUNDARY\nBefore first review, put the final decision table, consumer inventory, fixed fixtures with independently calculated expected outcomes and one focused command in docs/practice-session-model.md. Cover invariants in the acceptance families below across actual store mutations and rendered readers, not just helper return values. Show each reached consumer, including checked-clean consumers, and the limits of the proof. Use a compact set of purposeful counterexamples, not an unbounded Cartesian product. Expected dates/minutes/statuses must be literal or independently calculated, not obtained by calling the implementation as its own oracle.\nFocused route: npx vitest run tests/practice-session-families.test.ts tests/practice-session.browser.test.ts tests/practice-session-inbound.browser.test.ts tests/ci-browser-setup.test.ts. Place each named acceptance title in exactly one test; engines/cases may loop within it. Reuse current helpers, fixtures, fake fetch and storage controls. Fix touched tests that currently assert deliberate draft loss, implicit skip credit, automatic redistribution after removal or unscoped SR expansion. Retain meaningful old negative protections. Full required checks are npm run lint, npm test and npm run build plus configured Prismatica checks. Existing direction/agent-context ledgers may be updated for changed sites/rules; create no new source scanners or implementation-shape assertions. No mandatory mutation framework, exhaustive fuzzing, repeated full-suite stress loops or second proof CLI.\nReview the exact built patch and these finite behaviour/data families. A blocker needs a reproducible reachable counterexample violating an agreed invariant or an attributable regression; provide expected/actual and the affected family. Fix the shared cause and sweep its identified consumers together, then recheck that family and required checks affected by the fix. Do not reopen accepted decisions as taste, block on a preferred component architecture, invent unsupported data states or demand unrelated pre-existing cleanup. New evidence of real data loss remains a blocker. Infrastructure/setup/harness failures are separately labelled with logs and the positive event that failed; they do not establish product failure or justify loosening waits. Required local checks must have valid passing evidence before review/seal; the post-ship Actions requirement is the separate pre-merge gate specified in section F. Reuse patch-bound evidence until code relevant to it changes; do not turn review into an arbitrary round limit.\nReconcile changed Flow truth/mechanics through governed proposals for practise-todays-recommendation, run-a-session-plan, work-a-pathway-stage, adjust-how-scheduling-works, clear-a-due-review and capture-a-practice-item; log-a-class is affected by the shared editor. Preserve unmodified Flow mechanics and signatures, do not silently edit canonical records, and do not turn unrelated stale Flow wording into a discovery campaign. Update AGENTS current rules in place for autosave ownership, shared session-control/time semantics, scoped review/return and theory eligibility, with rationale in DECISIONS.\nOwner checks are limited to the existing native iPhone/sound check and one minimal real-Setar product walkthrough. For the latter, use one real unfinished piece prepared for its named next class, record focused chunk practice, read its Next practice explanation, compare one Keep fresh item, and inspect one generated session plan. Judge only whether the model and UX make sense in actual practice; dates, preservation, ranking policy and minute correctness remain automated. One brief acceptance observation is sufficient, not a general taste review or a request to upload private data. All ordinary histories, note recovery, flows, budgets, offline persistence and release gates remain automated. A two-item named owner routine is still a fixture requirement, not a demand for private database access.",
  "mustNotChange": [
    "One item, mode, focus, result and next action per block; the latest non-empty next action remains visible before practice. Separate notes, observations, next actions and lesson agenda retain their canonical homes.",
    "Local-first offline PWA; no backend/auth/runtime paid service, gamification, audio/AI grading or guilt-driven copy. GitHub snapshot transport, conflict archives, attachment bytes, device-only secrets and unfinished-practice replacement protection remain intact.",
    "Wall-clock minutes, one active clock, gesture-primed fresh audio contexts, marker claims, visual boundaries and wake-lock lifecycle remain independent of feedback, note writes and controls. Preserve update offer/reload ownership and build-input stamp.",
    "Instrument scoping, independent Plan/Routines doorways above the recommendation, catalogue/source/term identity, explicit adoption, NAS references and archive authority boundaries remain intact.",
    "Only main scrolls, existing native keyboard/tab fixes, mixed-language direction, one h1, named accessible controls, 44px mobile targets and 390px reflow remain protected. No viewport/audio/service-worker redesign."
  ],
  "assumptions": [
    "A1. The owner has authorised choosing the interaction/domain model; this import is the concrete owner decision replacing Done-only notes and the old ambiguous Skip behaviour, with corresponding AGENTS edits. Builder is claude as explicitly requested.",
    "A2. Missing second-item logging is an owner report, not reproduced here; synthetic fixtures must resolve which boundary fails without access to private practice data.",
    "A3. Working returns and occasional theory are organisational defaults, not prescriptions or measured mastery; Claude chooses clear controls, module boundaries and documented bounded constants that satisfy the specified counterexamples."
  ],
  "possibleConflicts": [
    "Present AGENTS rules explicitly require Done, drop a draft on item change, and define Skip as clamping elapsed. This proposal intentionally replaces those rules while preserving their ownership and durability protections; record the owner-approved change rather than pretending it is a refactor. Automatic Working returns also intentionally replace the current rule that only worse may bring any engine-owned future date forward; the early-date protection remains for Keep fresh and for all owner/fixed/unknown dates. Plan preview Remove currently redistributes freed minutes; this proposal deliberately makes its default consistent with the other remove/skip states, leaving time unused until a deliberate rebuild or duration choice.",
    "The one-date preview rule must evolve into one coherent return decision that can explain an earlier derived class/working opportunity alongside an unchanged protected review date. Do not silently create two schedulers or claim a derived suggestion was written.",
    "Current Flow text contains pre-existing stale details. Update only changed truth through governed proposals; canonical Flow/rule signatures require the established owner approval lifecycle. The CI companion needs no invented Flow."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "DECISIONS.md",
      "docs/scheduling-evidence.md",
      "docs/repertoire-experience.md",
      "docs/practice-session-model.md",
      "src/domain/types.ts",
      "src/domain/factories.ts",
      "src/domain/defaults.ts",
      "src/domain/labels.ts",
      "src/domain/blocks.ts",
      "src/domain/routines.ts",
      "src/domain/scheduling.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/plan.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/selectors.ts",
      "src/domain/repertoire.ts",
      "src/domain/practiceInformation.ts",
      "src/domain/practiceSession.ts",
      "src/domain/practiceSessionModel.ts",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/insights.ts",
      "src/domain/report.ts",
      "src/domain/canonical.ts",
      "src/domain/sync.ts",
      "src/domain/index.ts",
      "src/domain/util.ts",
      "src/store/useStore.ts",
      "src/store/lookups.ts",
      "src/store/sessionHelpers.ts",
      "src/store/idb.ts",
      "src/store/backup.ts",
      "src/store/databaseInstall.ts",
      "src/store/revision.ts",
      "src/store/syncEngine.ts",
      "src/store/notesDrafts.ts",
      "src/components/ItemNotes.tsx",
      "src/components/LessonNotes.tsx",
      "src/components/RoutineDuration.tsx",
      "src/components/RoutineContents.tsx",
      "src/components/useNotesDraft.ts",
      "src/components/ItemForm.tsx",
      "src/components/QuickAdd.tsx",
      "src/components/itemKinds.ts",
      "src/components/ItemCard.tsx",
      "src/components/ItemAgenda.tsx",
      "src/components/CloseDraft.tsx",
      "src/components/closeDraft.ts",
      "src/components/format.ts",
      "src/components/SchedulingExplanation.tsx",
      "src/components/ui.tsx",
      "src/components/direction.test.ts",
      "src/components/pressedState.test.ts",
      "src/components/itemKinds.test.ts",
      "src/pages/Today.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/RoutineEdit.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/NewItem.tsx",
      "src/pages/Repertoire.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/Insights.tsx",
      "src/pages/TeacherReport.tsx",
      "src/pages/Settings.tsx",
      "src/styles/global.css",
      "src/domain/routines.test.ts",
      "src/domain/scheduling.test.ts",
      "src/domain/blocks.test.ts",
      "src/domain/plan.test.ts",
      "src/domain/recommend.test.ts",
      "src/domain/scoring.test.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/selectors.test.ts",
      "src/domain/repertoire.test.ts",
      "src/domain/io.test.ts",
      "src/domain/migrations.test.ts",
      "src/domain/practiceSession.test.ts",
      "src/store/backup.test.ts",
      "src/store/syncEngine.test.ts",
      "tests/practice-session-families.test.ts",
      "tests/practice-session.browser.test.ts",
      "tests/practice-session-inbound.browser.test.ts",
      "tests/fixtures/practice-session-v16.json",
      "tests/fixtures/practice-session-expectations.json",
      "tests/ci-browser-setup.test.ts",
      "tests/post-practice.browser.test.ts",
      "tests/practice-information.browser.test.ts",
      "tests/practice-information-inbound.browser.test.ts",
      "tests/practice-information-layout.browser.test.ts",
      "tests/lessonNotes.browser.test.ts",
      "tests/daily-practice.browser.test.ts",
      "tests/lesson-agenda.browser.test.ts",
      "tests/review-ownership.browser.test.ts",
      "tests/ui-date-refresh.browser.test.ts",
      "tests/ui-conformance.browser.test.ts",
      "tests/repertoire-viewport.browser.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/practiceBrowser.ts",
      "tests/agent-context.test.ts",
      ".github/workflows/ci.yml",
      ".github/workflows/deploy.yml",
      ".github/workflows/prismatica-gate.yml",
      "scripts/prepare-ci-browsers.sh"
    ],
    "forbid": [
      "src/domain/setarClasses.ts",
      "src/domain/sourceArchive.ts",
      "src/domain/setarSetup.ts",
      "src/domain/khonyagarData.ts",
      "src/domain/cgsData.ts",
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/nas-mirror.mjs",
      "src/components/viewport.ts",
      "src/components/useViewportGuard.ts",
      "src/components/appUpdate.ts",
      "src/components/practiceCue.ts",
      "src/components/screenAwake.ts",
      "src/components/useScreenAwake.ts",
      "src/store/gitRemote.ts",
      "src/store/githubSync.ts",
      ".prismatica/rules.md",
      ".prismatica/flows/*.md",
      "CLAUDE.md",
      "package.json",
      "package-lock.json"
    ]
  },
  "exclusions": [
    "No implementation in this planning session, private database inspection, guessed repair/backfill of lost historical practice, NAS/archive/course redesign, research claims of optimal intervals, theory curriculum or generated musical authority.",
    "No new settings dashboard, second planner/ranking engine, third creation path, routine-to-full-close wizard, running-plan reorder, automatic redistribution after session remove/skip/move-on, analytics redesign or general test-harness rewrite.",
    "No permission to submit/merge/deploy, approve signed Flow/Rule changes, erase owner data or broaden into unrelated findings. Claude follows the normal governed owner boundaries."
  ],
  "acceptance": [
    {
      "description": "Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path.",
      "test": "routine completion and history preserve all practised items without feedback"
    },
    {
      "description": "Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names.",
      "test": "routine controls distinguish skipped time from partial practice across run transitions"
    },
    {
      "description": "Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time.",
      "test": "routine contents and controls describe the exact run started from every doorway"
    },
    {
      "description": "Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks.",
      "test": "session plan reordering preserves segment identity allocation and execution order"
    },
    {
      "description": "Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow.",
      "test": "session plan move controls work by keyboard and touch without losing the draft"
    },
    {
      "description": "Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged.",
      "test": "working note drafts survive exits boundaries and reload without Done"
    },
    {
      "description": "Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave.",
      "test": "working note saves preserve newest text and refuse stale ownership across failures and replacement"
    },
    {
      "description": "Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries.",
      "test": "scoped evidence separates focused progress from whole item retention and readiness"
    },
    {
      "description": "Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale.",
      "test": "working returns stay short while protected dates and retention spacing keep their authority"
    },
    {
      "description": "An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity.",
      "test": "class preparation and shared recommendation pools return useful work without repetition noise"
    },
    {
      "description": "Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text.",
      "test": "close and review screens explain scope readiness and next practice with the date actually saved"
    },
    {
      "description": "Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares.",
      "test": "theory study uses ordinary practice items and earns bounded non urgent opportunities"
    },
    {
      "description": "Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes.",
      "test": "session model migration preserves history dates bytes and unresolved legacy meanings"
    },
    {
      "description": "Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss.",
      "test": "session model inbound doors preserve live practice and fail before replacing data"
    },
    {
      "description": "Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required.",
      "test": "ci browser setup avoids a fast index slow package mirror within the existing bounds"
    },
    {
      "description": "All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker.",
      "test": "ci release paths retain pinned dual engine provisioning and tests before publishing"
    },
    {
      "description": "One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties.",
      "test": "manual:OWNER"
    },
    {
      "description": "One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Heavy: additive saved evidence/return semantics, schema migration and unfinished-run/note durability cross hydration/import/sync boundaries. No auth or payment changes; existing tokens remain device-only."
  },
  "delta": {
    "today": "The practice loop stores unscoped results and uses them for item-wide status/spacing; routine time is separate from optional capture but skip credits any positive elapsed interval, contents are opaque, notes require Done, plan order cannot be edited, and class/theory opportunities are not consistently integrated.",
    "instead": "Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.",
    "keep": [
      "r-local-first-offline",
      "r-no-silent-data-loss",
      "r-practice-completes-reviews",
      "r-explainable-scheduling",
      "r-pure-tested-domain",
      "r-one-instrument-per-session",
      "r-quick-start",
      "r-direction-aware-text",
      "r-no-gamification",
      "r-secrets-stay-on-device",
      "r-large-files-stay-on-nas"
    ],
    "assumptions": [],
    "showMe": "The named acceptance families below, using a two-item Setar Warm up created through the real UI, literal long-gap chunk/class counterexamples, failure/reload/restore states and Chromium plus WebKit histories; one focused proof route, full required checks and one bounded native-device observation."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/scheduling-evidence.md",
    "docs/repertoire-experience.md",
    "docs/practice-session-model.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

_approved · about "practise-todays-recommendation"_

## Today

The practice loop stores unscoped results and uses them for item-wide status/spacing; routine time is separate from optional capture but skip credits any positive elapsed interval, contents are opaque, notes require Done, plan order cannot be edited, and class/theory opportunities are not consistently integrated.

## Instead

Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

## Keep

- r-local-first-offline
- r-no-silent-data-loss
- r-practice-completes-reviews
- r-explainable-scheduling
- r-pure-tested-domain
- r-one-instrument-per-session
- r-quick-start
- r-direction-aware-text
- r-no-gamification
- r-secrets-stay-on-device
- r-large-files-stay-on-nas

## New assumptions

_none_

## Show me

The named acceptance families below, using a two-item Setar Warm up created through the real UI, literal long-gap chunk/class counterexamples, failure/reload/restore states and Chromium plus WebKit histories; one focused proof route, full required checks and one bounded native-device observation.


## Flows near this scope (understand before you change them)

Compact cards — read a Flow's canonical file when your change touches it.

- **See and adjust the scheduling engine** (`adjust-how-scheduling-works`) — Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.
  touchpoints: `src/pages/Settings.tsx`, `src/pages/CloseBlock.tsx`, `src/domain/scheduling.ts`, `src/domain/plan.ts`, `src/domain/types.ts`, `src/store/useStore.ts` · canonical: `.prismatica/flows/adjust-how-scheduling-works.md`
- **Back up and restore everything** (`back-up-and-restore`) — Keep an independent copy of all practice data and files, and put it back on any device.
  touchpoints: `src/store/backup.ts`, `src/store/idb.ts`, `src/domain/io.ts`, `src/pages/Settings.tsx`, `src/store/useStore.ts` · canonical: `.prismatica/flows/back-up-and-restore.md`
- **Find something in my repertoire** (`browse-my-repertoire`) — See everything you play, grouped the way you think about it, find it by any name, and open the one you mean without losing your place.
  touchpoints: `src/pages/Repertoire.tsx`, `src/pages/ItemDetail.tsx`, `src/pages/Materials.tsx`, `src/domain/repertoire.ts`, `src/domain/persian.ts`, `src/domain/farsi.ts` · canonical: `.prismatica/flows/browse-my-repertoire.md`
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
- **See how practice is actually going** (`see-practice-patterns`) — Get a calm, neutral read on the last week or month across everything you play.
  touchpoints: `src/pages/Insights.tsx`, `src/pages/Today.tsx`, `src/domain/insights.ts`, `src/domain/io.ts` · canonical: `.prismatica/flows/see-practice-patterns.md`
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

Make practice records dependable and keep session choices aligned with the work being done

## Stay in scope — you may ONLY change

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- docs/practice-session-model.md
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/defaults.ts
- src/domain/labels.ts
- src/domain/blocks.ts
- src/domain/routines.ts
- src/domain/scheduling.ts
- src/domain/scoring.ts
- src/domain/recommend.ts
- src/domain/plan.ts
- src/domain/lessonAgenda.ts
- src/domain/selectors.ts
- src/domain/repertoire.ts
- src/domain/practiceInformation.ts
- src/domain/practiceSession.ts
- src/domain/practiceSessionModel.ts
- src/domain/migrations.ts
- src/domain/io.ts
- src/domain/insights.ts
- src/domain/report.ts
- src/domain/canonical.ts
- src/domain/sync.ts
- src/domain/index.ts
- src/domain/util.ts
- src/store/useStore.ts
- src/store/lookups.ts
- src/store/sessionHelpers.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/databaseInstall.ts
- src/store/revision.ts
- src/store/syncEngine.ts
- src/store/notesDrafts.ts
- src/components/ItemNotes.tsx
- src/components/LessonNotes.tsx
- src/components/RoutineDuration.tsx
- src/components/RoutineContents.tsx
- src/components/useNotesDraft.ts
- src/components/ItemForm.tsx
- src/components/QuickAdd.tsx
- src/components/itemKinds.ts
- src/components/ItemCard.tsx
- src/components/ItemAgenda.tsx
- src/components/CloseDraft.tsx
- src/components/closeDraft.ts
- src/components/format.ts
- src/components/SchedulingExplanation.tsx
- src/components/ui.tsx
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/components/itemKinds.test.ts
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/RoutineRunner.tsx
- src/pages/RoutineEdit.tsx
- src/pages/StartBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/NewItem.tsx
- src/pages/Repertoire.tsx
- src/pages/PathwayDetail.tsx
- src/pages/StageDetail.tsx
- src/pages/Lessons.tsx
- src/pages/Insights.tsx
- src/pages/TeacherReport.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- src/domain/routines.test.ts
- src/domain/scheduling.test.ts
- src/domain/blocks.test.ts
- src/domain/plan.test.ts
- src/domain/recommend.test.ts
- src/domain/scoring.test.ts
- src/domain/lessonAgenda.test.ts
- src/domain/selectors.test.ts
- src/domain/repertoire.test.ts
- src/domain/io.test.ts
- src/domain/migrations.test.ts
- src/domain/practiceSession.test.ts
- src/store/backup.test.ts
- src/store/syncEngine.test.ts
- tests/practice-session-families.test.ts
- tests/practice-session.browser.test.ts
- tests/practice-session-inbound.browser.test.ts
- tests/fixtures/practice-session-v16.json
- tests/fixtures/practice-session-expectations.json
- tests/ci-browser-setup.test.ts
- tests/post-practice.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/lessonNotes.browser.test.ts
- tests/daily-practice.browser.test.ts
- tests/lesson-agenda.browser.test.ts
- tests/review-ownership.browser.test.ts
- tests/ui-date-refresh.browser.test.ts
- tests/ui-conformance.browser.test.ts
- tests/repertoire-viewport.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practiceBrowser.ts
- tests/agent-context.test.ts
- .github/workflows/ci.yml
- .github/workflows/deploy.yml
- .github/workflows/prismatica-gate.yml
- scripts/prepare-ci-browsers.sh

Never touch:

- src/domain/setarClasses.ts
- src/domain/sourceArchive.ts
- src/domain/setarSetup.ts
- src/domain/khonyagarData.ts
- src/domain/cgsData.ts
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/nas-mirror.mjs
- src/components/viewport.ts
- src/components/useViewportGuard.ts
- src/components/appUpdate.ts
- src/components/practiceCue.ts
- src/components/screenAwake.ts
- src/components/useScreenAwake.ts
- src/store/gitRemote.ts
- src/store/githubSync.ts
- .prismatica/rules.md
- .prismatica/flows/*.md
- CLAUDE.md
- package.json
- package-lock.json
- One item, mode, focus, result and next action per block; the latest non-empty next action remains visible before practice. Separate notes, observations, next actions and lesson agenda retain their canonical homes.
- Local-first offline PWA; no backend/auth/runtime paid service, gamification, audio/AI grading or guilt-driven copy. GitHub snapshot transport, conflict archives, attachment bytes, device-only secrets and unfinished-practice replacement protection remain intact.
- Wall-clock minutes, one active clock, gesture-primed fresh audio contexts, marker claims, visual boundaries and wake-lock lifecycle remain independent of feedback, note writes and controls. Preserve update offer/reload ownership and build-input stamp.
- Instrument scoping, independent Plan/Routines doorways above the recommendation, catalogue/source/term identity, explicit adoption, NAS references and archive authority boundaries remain intact.
- Only main scrolls, existing native keyboard/tab fixes, mixed-language direction, one h1, named accessible controls, 44px mobile targets and 390px reflow remain protected. No viewport/audio/service-worker redesign.
- No implementation in this planning session, private database inspection, guessed repair/backfill of lost historical practice, NAS/archive/course redesign, research claims of optimal intervals, theory curriculum or generated musical authority.
- No new settings dashboard, second planner/ranking engine, third creation path, routine-to-full-close wizard, running-plan reorder, automatic redistribution after session remove/skip/move-on, analytics redesign or general test-harness rewrite.
- No permission to submit/merge/deploy, approve signed Flow/Rule changes, erase owner data or broaden into unrelated findings. Claude follows the normal governed owner boundaries.

## Definition of done

- **ac-1** — Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path. → proven by `routine completion and history preserve all practised items without feedback`
- **ac-2** — Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names. → proven by `routine controls distinguish skipped time from partial practice across run transitions`
- **ac-3** — Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time. → proven by `routine contents and controls describe the exact run started from every doorway`
- **ac-4** — Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks. → proven by `session plan reordering preserves segment identity allocation and execution order`
- **ac-5** — Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow. → proven by `session plan move controls work by keyboard and touch without losing the draft`
- **ac-6** — Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged. → proven by `working note drafts survive exits boundaries and reload without Done`
- **ac-7** — Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave. → proven by `working note saves preserve newest text and refuse stale ownership across failures and replacement`
- **ac-8** — Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries. → proven by `scoped evidence separates focused progress from whole item retention and readiness`
- **ac-9** — Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale. → proven by `working returns stay short while protected dates and retention spacing keep their authority`
- **ac-10** — An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity. → proven by `class preparation and shared recommendation pools return useful work without repetition noise`
- **ac-11** — Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text. → proven by `close and review screens explain scope readiness and next practice with the date actually saved`
- **ac-12** — Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares. → proven by `theory study uses ordinary practice items and earns bounded non urgent opportunities`
- **ac-13** — Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes. → proven by `session model migration preserves history dates bytes and unresolved legacy meanings`
- **ac-14** — Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss. → proven by `session model inbound doors preserve live practice and fail before replacing data`
- **ac-15** — Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required. → proven by `ci browser setup avoids a fast index slow package mirror within the existing bounds`
- **ac-16** — All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker. → proven by `ci release paths retain pinned dual engine provisioning and tests before publishing`
- **ac-17** — One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties. → proven by `manual:OWNER`
- **ac-18** — One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged. → proven by `manual:OWNER`

## Docs to update as part of this change

- AGENTS.md
- DECISIONS.md
- docs/scheduling-evidence.md
- docs/repertoire-experience.md
- docs/practice-session-model.md

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

