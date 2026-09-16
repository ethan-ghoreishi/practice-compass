---
id: 20260916-keep-useful-practice-information-clear-f-2e1e
contractId: 20260916-keep-useful-practice-information-clear-f-2e1e
patchId: c6ffd91370cab9baacf59baa148c7aaee2f0cb77
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Attachment consistency across state-only import, full export and restore
    summary: "P1: State-only import bypasses duplicate attachment-metadata
      validation and can leave the app producing a backup its own importer
      refuses."
    counterexample: Store one blob for att-1, then state-only import data containing
      two attachment metadata rows with id att-1 and no files property.
      decodeBackupFiles returns before its duplicate-metadata check, and the
      held-blob check succeeds for both rows. Full export emits two files with
      id att-1; reimport refuses the duplicate metadata or duplicate file id.
      Validate attachment metadata consistency for state-only imports too, and
      cover the real state-only import to export to reimport round-trip in the
      exact ac-4 test.
  - family: Review-date draft identity and freshness across live item changes
    summary: "P2: An untouched open date draft remains stale when a live update
      clears the item's pending date, so Save date can resurrect a date the
      current item no longer has."
    counterexample: Open item A's Change review date editor while A has 2027-02-10.
      Before typing, apply a legitimate live update that clears
      A.nextReviewDate. reviewDateDraftFor returns the old draft because current
      is empty; pressing Save date writes 2027-02-10 back. Reconcile date
      removal while preserving a genuinely typed draft, and cover this
      live-update case in the exact ac-12 test.
createdAt: 2026-09-16T16:59:45.157Z
sealedAt: 2026-09-16T17:05:48.469Z
---

# Review: Keep useful practice information clear from capture to next time

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260916-keep-useful-practice-information-clear-f-2e1e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/24
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `c6ffd91370cab9baacf59baa148c7aaee2f0cb77`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Keep useful practice information clear from capture to next time

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Practice Compass keeps persistent working notes easy to read and edit while practising, keeps observations, next actions and lesson questions distinct, clarifies existing practice choices, and lets me return a review to automatic scheduling without changing its pending date or inventing practice. Simplify obsolete dummy practice-text data with a small schema migration, protect real history and the shipped decision loop, and prove the behaviour through focused rendered and inbound-boundary tests.

## Why

ONE PRODUCT THESIS
The few things the musician records should have clear ownership, be available when playing, and never require supervising the scheduler.

OWNER DECISIONS, SETTLED 2026-09-16
1. One persistent Working notes field, readable/editable during Active. Block Observation, Next time and lesson Question remain separate concepts.
2. Existing note/question/observation content is dummy test data. Lossless preservation of retired practice-text fields is explicitly waived where simplification benefits the model. Do not build legacy archives, conflict-merging machinery or permanent compatibility fields to preserve it. This is a bounded migration exception, NOT permission to reset practice history, ratings, reviews, commitments or future meaningful text.
3. Retain existing algorithm inputs and maths. Importance means changeable personal priority; Difficulty means changeable current effort. Optional inputs are progressively disclosed, never inferred automatically.
4. Returning to automatic scheduling keeps the pending date, releases its protection, switches manual/fixed-cadence mode to auto if necessary, and records no practice. With no date, the separate explicit Review today action is available.
5. Claude builds. The unexplained iPhone viewport defect is a separate diagnostic task, not a hidden prerequisite of this lane.

CANDIDATE COMPARISON
Qualitative planning judgement, not measured delivery estimates. Rank 1: coherent capture-to-reuse lane, including date ownership. Daily value very high; trust high; simplification high; coherence high; migration risk moderate but bounded by explicit dummy-text retirement; mobile value high for note editing and shorter forms; ongoing administration low; reviewer comprehension high when split into A-E below. SELECTED.
Rank 2: general import-integrity, archival and retrospective truth. Trust very high; daily value medium; simplification low; coherence good only as a data-integrity lane; migration risk moderate if archival added; mobile value low; maintenance moderate; reviewer comprehension good. Its bounded malformed-backup refusal earns inclusion only at this lane's actual migration/restore boundary; general graph validation and archival do not.
Rank 3: full status/result/priority model redesign. Daily value potentially high but uncertain; trust risk high because ranking, spacing and warm-up eligibility depend on these inputs; simplification potentially high; coherence high; migration/semantic risk high; mobile value medium; administration uncertain; reviewer comprehension poorest. Owner explicitly chose clarification over this redesign.
Rank 4: iPhone viewport and Safari layout diagnosis. Mobile value high; correctness benefit potentially high; schema risk none; excellent bounded scope once diagnosed; present cause uncertain. Run diagnostics separately before specifying a fix.

WHY HEAVY IS JUSTIFIED
A UI-only lane could expose existing Notes in Active and improve labels with no migration. It would leave obsolete problem/strategy/specialist text and the cached last observation as competing homes. Retiring those persisted fields cleanly warrants schema v12 to v13, using the existing migration chain and validation doors. No new note entity, generic notebook/task system, external service or new scheduling algorithm is justified.

REVIEWER PRE-MORTEM
A correct migration helper can still be bypassed by current-version hydration, sync, archive restore or corrupt-start recovery: C1-C3 exercise those actual boundaries. A correct note editor can write to the wrong item after a routine boundary or overwrite newer content on blur: A2-A3 exercise both. A correct automatic-mode button can be bypassed by ItemForm or accidentally triggered by an unrelated auto-mode save: D2-D3 distinguish these. A green RTL source guard can still render on the wrong edge: E1 inspects actual text geometry. An exported field can remain practically write-only behind the newest ten blocks: A4 exercises older history. A transferred date can retain a false reason, or a stale page can act on another item's date: D1-D3 assert explanation and identity as well as values. No acceptance family is proved primarily by source regex or JSX shape.

REMAINING FINDINGS, RANKED FOR THIS LANE
1. Malformed full-backup entries: potential silent byte loss, highest severity, occasional workflow, bounded validation risk; include because full-backup migration/rollback must be trustworthy.
2. Malformed surviving practice text and editor persistence/identity: crash or lost/overwritten information, everyday use, high trust and low administration; include at actual boundaries.
3. Active notebook access and duplicated text capture: very frequent practical friction, strongest simplification, small schema retirement risk after the dummy-data waiver; central scope.
4. Manual date ownership control: everyday interpretability/trust, small administrative transition, no new evidence; include.
5. Historical result versus current context: reproducible false statement, periodic use, bounded query/copy correction within the information lifecycle; include narrowly.
6. Self-parenting/family/other graph invariants: potentially disappearing items in repertoire, infrequent editing/import path, wider reference semantics; defer as a coherent integrity lane.
7. iPhone keyboard and Safari alignment: frequent reported usability issue, high diagnostic uncertainty, no source-established mechanism; diagnose separately before fixing.
8. Permanent deletion: real history loss but explicit confirmation and non-destructive Resting alternative; defer the owner-dependent archival model.
9. Untouched stale-day displays and misleading sync wording: still open, varying frequency; only touched decision/context clocks and practice-model documentation belong here.


## Today

BASELINE AND EVIDENCE
Clean local main and origin/main verified at d014293c205958f45e4393ebf6ae56901db83a1c. Fresh Prismatica context snapshot 209143d6c9954774e4722e715b388010bf7a230b8142d24b18cc651320e4d009, no pending proposals/open lanes. 20260913 trusted-daily-session lane is shipped and owner-approved with patch fd6cd73ca467e1f6d07681b89a67f1faed10a396; 20260911 direction/UI lane with patch 1c85fc6fb59ab1a22cac40bb123696586ae4fa69. Read their records, current AGENTS, Rules and relevant canonical Flows. Routine and hands-free mechanics are already represented within existing Flows; lack of separate Flow titles is not proof of absent coverage.
Historical catalogue /Users/Ehsan/Downloads/review-2026-09-10.md was read as leads only. It names old baseline 0c6058e and 294 tests; neither is current. Baseline verification here: 333 tests passed across the full run and focused rerun of the three browser-containing suites. Initially Playwright was absent from installed node_modules despite being declared; npm ci --offline restored it without changing tracked files. The three browser tests then needed unsandboxed localhost/browser access. 330 passed in the ordinary run and all 16 tests in those three suites passed on focused rerun, covering all 333 unique tests. This is test evidence, not a claim that every defect is absent.
Live current-main app inspected on a local demo origin: Item Detail, Start before/after item selection, Active disclosures and Lessons at 390x844 in Chromium. Start exposes seven modes and eighteen focus options after item selection. Active exposes read-only piece information plus an unrelated quick-note textarea. Current Farsi question ordinal and question/details resolve RTL and align at start in Chromium. No actual iPhone keyboard/Safari diagnosis was obtained. Automatic approval review refused the synthetic demo note/Finish interaction; the audit block was discarded without saving. Close persistence evidence is from current source tracing and the existing passing isolated browser journey, not that refused interaction.

COMPLETE PRACTICE-INFORMATION INVENTORY AND CONSUMERS
- PracticeItem.title, instrumentId, itemType: identity and grouping; quick add/full form; all lists, selection, Active and history. Keep.
- materialId, stageId, parentItemId, lesson.itemIds, strand, catalogKey: source/path/part/origin structure and planner/default context; full form and connection/pathway controls; repertoire, pathway views, plan and defaults. Keep; lesson origin is not preparation.
- Persian identity: dastgahAvaz, gusheh, form, composer; Guitar identity: lessonNumber, barRange. Full form, detail/repertoire grouping and reference context. Keep as progressive identity metadata.
- Item notes: persistent notebook, edited only by ItemNotes on Item Detail, saved on blur; read in Active About this piece. ItemForm does not currently expose this same field. Make this the single Working notes home.
- currentProblem: ItemForm; displayed ItemCard, Item Detail and Active; copied into question/report context. No ranking/date input. bestStrategy: ItemForm and Item Detail only. Retire both as separate inputs.
- Persian working detail: phraseLabel, shahed, ist, foroud, importantNote, ornamentIssue, mezrabIssue. Guitar working detail: rightHandIssue, leftHandIssue, toneIssue, fingering, tempo, stringNoiseIssue, bodyTensionNote. Entered in form, rendered as Detail rows, not used in scheduling and not available in Active. Retire these specialised practice-text fields; their future content belongs in Working notes. Numeric routine/catalogue BPM is a different field and stays.
- tags: comma-split form input and Item Detail chips; no current search/ranking/plan consumer. Retire the separate tag input/storage, without adding replacement tagging duties.
- status: manual item/form choice and optional accepted Close suggestion; drives default mode, fragility, pathway progress and eligibility. new/fragile/repairing/usable/integrated/performable/maintenance/dormant are not eight rungs of one compulsory achievement ladder. Keep enum/behaviour and clarify confidence versus work intention.
- importance/difficulty: manual 1-5, default 3. Ranking uses importance*2 + difficulty; review urgency factor uses both; warm-up eligibility excludes high difficulty. They are consequential owner estimates, not intrinsic immutable properties. Keep values and weights, explain and progressively disclose them.
- primaryFocus and per-block mode/focus: defaults and descriptions of what was practised; focus also feeds observations/Insights. Keep existing choices and saved values. Hide optional changes behind the chosen default summary on Start.
- active.note: unfinished block scratch observation, entered during Active, seeds Close observation; not persistent item notes. Keep but label its destination clearly.
- PracticeBlock.observation: one block's historical observation; cached to item.lastObservation, shown in recent history and question context. Keep the block field; retire the duplicate item cache and derive the latest non-empty observation from real blocks, labelled with its date. No text parsing or inferred judgement.
- PracticeBlock.nextAction: future intention recorded with that block; latest non-empty already appears early in Active via lastNextAction. Keep this shipped behaviour and expose it in historical block detail too. It is not a second item-notes field or a new task lifecycle.
- PracticeBlock.bodyNote: Close optional input, stored but not rendered in current history. Retire the separate input/storage under the dummy-data waiver. Future body/tension observations can be ordinary Observation or Working notes according to their intended lifetime.
- PracticeBlock.constraint: legacy/optional authored practice constraint, displayed in Active when present; ordinary Start currently supplies undefined. Keep existing values and expose them in block detail; do not add another required capture control.
- result: worse/same/slightly_better are relative judgements; stable_alone/stable_in_context/performable are demonstrated stability levels. These drive the shipped spacing decision and optional status suggestion, not just a colour. not_logged is a deliberate escape/routine outcome. Keep codes, ranking and behaviour; clarify their questions and examples.
- minutes: owner-attested duration, proposed by the stale-clock guard; preserve existing semantics. Status suggestion remains optional. Review answer/date/type/mode are separate scheduling intent with existing provenance; keep collapsed explanation and one ReviewPlan derivation.
- lessonAgenda question.text/answer/askedAt/lessonId and independent preparation entries: teacher agenda and retained lesson history, entered through Close, item and lesson surfaces. Keep canonical v12 collection and independence. Do not migrate questions into item notes or recreate the rolling teacherQuestion field.
- Lesson.notes; recording/reference title/path/notes; Material.title/sourceName/parentTitle/section/teacherOrSource/notes/status; Pathway name/source/description/note; Stage code/title/group/intro; Routine name and segment label/minutes/essential/itemId: distinct lesson, source or authored route/instruction context. Keep with their current owners and consumers, never absorb these into an item's notebook. Bound routine items can access their own Working notes; unbound countdowns remain unlogged.
- Attachments: names/ownership/media references are reference data, not practice text. Preserve bytes and ownership; no media/storage redesign.

CURRENT CORRECTNESS FINDINGS
Executable pure-domain probes against this HEAD confirmed: validateDB accepts a non-string item notes object; validateDB accepts an item parented to itself; buildReportData reports improvement from current lastResult even when the requested period has only a worse block. Source confirms ItemForm can offer self as parent, retains incompatible family metadata after an instrument switch, and backup.ts skips malformed files before replaceAllBlobs. Source also confirms ItemDetail/Lessons/Repertoire/TeacherReport still have some mount-frozen clocks, Settings says newest copy wins, and deleteItem deliberately deletes blocks with a count-bearing confirmation. These are separately classified below, not treated as already reproduced iPhone defects.
Stale elapsed-time protection, calendar totals, early-success preservation, same versus worse, dormant recommendation exclusion, minutes-based exposure, lesson-specific commitments/questions, clipboard fallback, Farsi search, attachment ownership, single Close derivation, live Close/plan dates and cold-start recovery are shipped. Preserve rather than reimplement them.

## Instead

A. ONE CANONICAL HOME FOR EACH KIND OF INFORMATION
A1. Reuse PracticeItem.notes, displayed as Working notes. No new workingNotes alias, note collection or rich-text dependency. Full creation/edit, Item Detail and Active all target the same field. One title-only quick add and one full form remain. Retire currentProblem, bestStrategy, tags and the fourteen specialist working-detail fields listed in the inventory. Identity fields stay distinct. Catalogue item creation must put BOTH existing catalogue entry.notes guidance and entry.about guidance into the one notes field when present; moving away from currentProblem must not drop newly-created catalogue guidance.
A2. Reuse/extend ItemNotes as the shared editor: calm collapsed entry point, readable expanded notes while the timer runs, obvious Edit/Done, multiline plain text with independent Farsi/English paragraph direction. Notes remain useful after Finish, Discard, navigation and reload because they belong to the item, not the block. Done closes editing, not practice. Avoid blur-only saving, stale local copies and misleading Cancel semantics over already-saved text. A timer tick, store update, date change or item switch cannot reset the caret, overwrite fresh text or save A's text into B. Emptying notes is deliberate and persists; absent and empty are not grounds to resurrect retired text. Do not announce Saved before durable acknowledgement; a failed persistence operation retains visible text and offers retry/copy, never silent success. Use existing IndexedDB/Zustand plumbing, not a new persistence framework.
A3. The same access applies to the current bound item in RoutineRunner. Unbound segments have no fictitious item notebook. An automatic or skipped segment boundary must not transfer an open editor's text to the next item; no focus trap, invisible pause, timer reset, extra block or changed minute allocation. Keep the authored routine segment instruction separate from item notes.
A4. Active's quick capture is explicitly an Observation for this block, not Working notes. It seeds Close; editing persistent notes does not change it. Close retains Result, Observation and Next time as the main reflection, then optional status/review/question controls. Remove Body/tension as a separate field. Preserve the chosen observation, next action and question through preview refreshes, and never create a question from arbitrary notes. Block history exposes observation, nextAction and any legacy constraint with date/mode/focus/result/minutes; older entries are reachable through simple progressive disclosure. Derive latest observation from blocks rather than item.lastObservation. Keep lastNextAction's latest NON-EMPTY behaviour and label it as a previous decision rather than an inferred current task.
A5. Adapt every currentProblem/lastObservation consumer. Cards and teacher question exports must not dump the entire personal notebook into a preview or teacher sheet. Remove automatic Problem context; show a clearly labelled latest block observation with its date only where that context already belongs. It is current context, not an answer to a past question or evidence that the question was asked. Lesson question text, optional answers, targets and lifecycle remain unchanged. Working notes can always be opened on the item.
A6. Bound the existing history/current-state reporting defect as part of truthful reuse: period-specific result statements come from the recorded blocks inside the selected period, never current item.lastResult. Do not claim improvement merely because an absolute stable result has a higher rank; report the result actually recorded. Current status, open questions, repeated-current-pattern and suggested-next-work sections must explicitly say Current where they use present state. Keep existing calendar-versus-rolling definitions; do not invent historical status snapshots, analytics, new metrics or a reporting subsystem. Later practice may change Current sections but not results attributed to an earlier period. Existing user-selected report dates remain selected; refreshing current context must not silently change the historical period.

B. FEWER DECISIONS, HONEST WORDING, SAME ALGORITHMS
B1. Use an explicit definition table in docs/product-spec.md and concise in-context help. Item status answers how this item currently stands/how the owner is working on it, not how the last ten minutes went. new is New material, still being established rather than a claim that its practice count is zero; fragile unreliable; repairing actively addressing a known problem; usable holds together but not reliably in context; integrated reliable in context; performable ready to play for someone; maintenance deliberately maintaining learned work; dormant deliberately set aside. Preserve existing enum values, defaults, scoring, pathway/mastery and accepted-suggestion transitions. Do not claim perfect scientific separation between neighbouring statuses or force a user through every status. Current new status can survive recorded practice, so never label that case Not practised yet solely from its enum. Preserve the catalogue's honest Not practised yet presentation for genuinely untouched additions, using its existing untouched-item evidence rather than inventing a practice event or automatic status promotion.
B2. Close asks for the most concrete result actually demonstrated. Clarify stable_alone as the chosen passage/task holding together in isolation, stable_in_context as holding together joined to its surrounding musical context, performable as ready to play for someone; these remain the existing evidence categories. For change short of those claims, same means no meaningful change, slightly_better some improvement, worse genuine deterioration or recall difficulty. Do not turn same, fatigue, an empty field or a missing rating into failed retention automatically. Keep one selection, not an additional proficiency questionnaire. Retain deliberate Save without a result and its unchanged-review semantics. No AI judgement.
B3. Labels Personal priority and Current effort (with the stored names importance/difficulty retained) have anchored 1/3/5 descriptions and meaningful intermediate levels. Priority is how much the owner currently wants this in the mix; effort is how demanding it currently feels at the intended level. Both can change, need not be maintained on a schedule and default to 3. Lesson urgency remains the independent preparation deadline. Explain briefly that the estimates influence selection/review and high effort excludes easy warm-up; never pretend they are inferred measurements. Keep all numerical effects unchanged.
B4. Start leads with selected item, duration, a readable default mode/focus summary and Begin practice. Optional Change practice approach reveals the existing mode/focus choices with clear definitions. Keep all seven modes and eighteen focus values; no forced taxonomy merge, new mandatory selection or extra creation path. Mode describes what approach to use; focus describes what to attend to. Item setup uses progressive optional status/priority/effort/focus/review controls. New/changed controls have their own accessible names and visible selected state, not merely a named parent group. Preserve quick title-only creation and direct recommendation/plan starts.

C. SMALL SCHEMA CHANGE, REAL INBOUND SAFETY
C1. Bump PracticeDB SCHEMA_VERSION 12 to 13 and add one deterministic, clock-free, idempotent retirement pass in migrations.ts after existing migrations. Discard ONLY retired currentProblem, bestStrategy, tags, item.lastObservation, the fourteen specialist working-detail keys and block.bodyNote. Keep existing item.notes, block.observation/nextAction/constraint and lessonAgenda questions/answers without transformation; retaining these costs no compatibility machinery. Keep Persian/Guitar identity keys, all block records and numeric facts, ids/references/timestamps, ratings/status, review state/provenance, sr state/marker, agenda commitments, routines, settings, media metadata and bytes. Remove empty family containers only when truly empty; do not drop their identity. Retired keys are removed even in already-current or partially converted input, so no dual truth survives. Do not rerun destructive reset behaviour on future canonical text. Existing v2-v12 migration steps remain, including v12 lesson-intent conversion; the owner waiver does not authorise ripping out that already-shipped history machinery.
C2. Extend shared validation for this lane's surviving practice-text inputs before install: optional strings must really be strings; present wrong types are rejected with useful item/block identification, never coerced to [object Object]. Validate the unfinished observation text at the real persisted-state hydration boundary too, because it lives outside PracticeDB. Existing scheduling/agenda and newer-schema refusal stay authoritative. A newer schema is refused before any retirement pass or relabelling. No general graph repair, guessed reference relinking or arbitrary input truncation.
C3. Actual hydration (migrate AND current-version merge), Settings import, sync pull, Keep remote, archive restore and corrupt-start recovery must reach the same validated model before replacing state. Preserve existing unfinished-session and revision-race guards. A valid schema conversion must survive persisted reload and export/reimport. Invalid input leaves the previous live DB, persisted bytes and attachment bytes unchanged; corrupt cold start stays visible and recoverable through the existing rendered control, while too-new data has update guidance only.
C4. Because a migration rollback uses a full backup, close the narrow existing malformed-file hole at importFullBackup: a PRESENT files property of the wrong type, malformed entry, empty/non-string or duplicate file id, duplicate attachment metadata id, invalid data/base64, or invalid metadata association is refused before replaceAllBlobs. Validate ownership against canonical metadata; retain supported legacy itemId blob ownership by normalising through existing semantics. Do not silently skip entries or guess owners. Distinguish files absent (state-only import, existing blobs untouched), files:[] (explicit empty full backup), and a complete non-empty set. A full backup must not install metadata for omitted bytes or orphan bytes without matching metadata. Keep remote NAS references out of this file set. Scope this to transport integrity of this lane's backup/restore invariant, not a general attachment feature.
C5. Rollback is an explicit export/restore procedure, not an invented down-migration. Before upgrading owner data, retain a schema-v12 full backup and attachment bytes outside the upgraded app. v12 cannot safely read v13 and must refuse it; do not stamp a v13 file down to 12. Test a disposable exact-baseline app restoring its pre-upgrade backup and reopening its attachment. Keep a v13 export before any rollback; practice recorded since upgrade will not exist in the v12 backup and must not be silently sacrificed or represented as automatically converted. Updating forward is the recovery path for newer-schema refusal. No startup backup writes or extra archival system are introduced.

D. EXPLICIT TRANSFER OF REVIEW OWNERSHIP
D1. Add one pure administrative transition and store action for Use automatic scheduling, consuming the LIVE item/open reviews, not captured component state. Keep the existing pending calendar date unchanged; set mode auto and transfer the pending date's management to the engine using the existing nextReviewSource field. Document that auto denotes engine-managed authority, not proof that this date was mathematically generated or that a review occurred. Show the existing date and explain: date retained, future real practice determines changes. Update any open-row reason that would falsely claim manual protection or a computed interval; never fabricate a result. Spacing reps/ease/base/last-progress-day, block counts/minutes/results, statuses and completed historical reviews remain byte-for-byte unchanged.
D2. Matching pending rows retain their date. If an item has a pending date but no open row, restore that one administrative reminder without creating a block or completing anything. Multiple agreeing open rows need not be historically rewritten. If item/open rows disagree, or rows exist without an item date, refuse the transfer with an actionable choice of which existing date to keep; do not guess. Existing Change review date can resolve the conflict explicitly before transfer. With no pending item date and no open rows, switching to auto leaves it unscheduled and source absent. Offer separate Review today; this invokes honest administrative scheduling with today's live local date and user source, preserves the current mode, and manufactures no retention evidence. No-date mode transfer and Review today are distinguishable operations.
D3. Item Detail and the existing item edit form must tell the same story. An actual saved mode transition manual/interval to auto routes through the same transition; an unrelated save while already auto MUST preserve a protected user date. The explicit transfer remains available on an already-auto item with a custom/snoozed/unknown-provenance date. No fourth field or parallel scheduler. Changing to manual/fixed cadence does not invent a new date or spacing state. Future cadence rules remain unchanged. Repeated transfer is idempotent, and date controls re-open using current item/date rather than stale mount state.
D4. After transfer, shipped rules apply: early positive/neutral results keep the date and spacing; worse alone may bring an engine-managed future date forward, never postpone it; manually setting/snoozing/re-arming a date makes it protected again; due eligible practice advances at most once per local day; deliberate No clears pending intent and unanswered/not_logged does not. Item, open row, due list, recommendation reason and Close preview/save must agree. Use existing useDecisionNow where the touched date controls need a live day, with the same action-time stale-preview protection as Close. Do not broaden this to every stale page.

E. BOUNDED FORM/MOBILE RELIABILITY
E1. Make the changed editors and choices usable at 390x844 and desktop without horizontal overflow, overlapping controls or lost focus. Working notes and observations preserve multiline text and independent Farsi/English direction/alignment, including mixed paragraphs and opposite-language item titles. Keep 16px editable inputs, 44px targets where applicable, safe areas, reduced motion, contrast improvements and keyboard-accessible disclosure. Explicit local logical alignment is allowed where rendered evidence shows inherited alignment is wrong. ClassQuestions changes are bounded to the retired-context adaptation and actual rendered direction coverage, not a presumed cure for the owner's un-reproduced Safari symptom.
E2. No changes to useViewportGuard, shell height, visualViewport scrolling or nav positioning in this lane. Separate OWNER diagnostic before any such fix: on the current deployed revision, record device/iOS/app version and standalone versus Safari; repeat focus, keyboard dismiss with field still focused, blur, field-to-field focus, route exit and orientation on item notes, Close and lesson questions. Capture timestamps with innerHeight, visualViewport.height/offsetTop/pageTop/scale, window.scrollY, document/body/main scrollTop, activeElement tag and app/main/tabbar/field rectangles before/during/after transitions. For the Farsi symptom also capture computed direction/textAlign on the ordinal, li, wrappers and each line plus an actual screenshot. This distinguishes layout scrolling, visual viewport displacement, residual internal scrolling, keyboard timing, focus scroll and local CSS. Do this before the separate device lane, preferably while this lane builds; no timeout increase is authorised by this contract.

DELIVERY AND HOSTILE-REVIEW CHECKLIST
[ ] Land A-E as one coherent implementation, reviewed by family rather than one giant journey.
[ ] Use the exact unique acceptance titles below, with table-driven cases inside each test as appropriate, not dynamically expanded duplicate titles. Existing browser tests run through Vitest; extend the existing Playwright-as-library harness only as needed.
[ ] Browser tests drive real controls and inspect live AND persisted state after the actual write settles. Never use a fixed sleep as persistence proof. Let browser clock passage trigger real scheduled handlers for day/segment changes; do not manually dispatch events that hide the race.
[ ] Keep pure migration/selection/ownership decisions outside React. Use real IndexedDB/browser paths for persistence, import and recovery. For sync/archive tests, invoke actual orchestrators with isolated fake transport at the existing port, no live GitHub writes. Intercept/answer each relevant dialog deliberately rather than globally accepting every dialog.
[ ] Run full required Prismatica checks once on the finished implementation, then rerun only named affected checks for rework plus required final checks. Do not weaken existing tests or substitute JSX guards for interaction evidence.
[ ] Reconcile changed Flow mechanics/Rules through Prismatica's normal governed workflow, without rewriting unrelated signed records. Update the exact docsDelta files, including stale README formula/question claims, newly retired fields, ownership semantics and the dummy-data exception. No separate Flow is needed for note editing inside practice.
Highest-leverage first step: implement the canonical notes/retirement decision and its real boundary fixtures before screen polish. Next: wire the shared editors and ownership controls with browser tests. Third: run the adversarial family audit, device usability acceptance and full checks. No hidden prerequisite from the deferred viewport lane.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The existing bare item.notes field is the smallest sufficient canonical notebook; a new persisted alias would add no product value.
- Persisting notes during a bound routine is the same item-note invariant, not a new routine planning feature.
- The owner dummy-text waiver permits discarding the explicitly retired practice-text fields, including display-only tags; retained canonical fields need no destructive reset.
- The existing test harness and installed Playwright package suffice. The layout family requires its matching Chromium and WebKit binaries; install those during test setup if absent, without adding a framework/package or silently skipping coverage.

**Possible conflicts**

- Old AGENTS/README descriptions name currentProblem/bestStrategy/lastObservation and specialised notes; replace those descriptions with the canonical field ownership, rather than append contradictory rules.
- nextReviewSource has historically been described as origin. Administrative transfer needs precise authority wording so auto never falsely claims a newly computed date or practice event.
- r-quick-start says title is the only required field anywhere, while shipped Close requires a result or deliberate Save without a result. Document that existing distinction rather than weaken Close or add requirements.
- Owner data-retirement permission supersedes the original lossless-text request only for the enumerated dummy fields; future text and non-text history remain protected.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Practice Compass keeps persistent working notes easy to read and edit while practising, keeps observations, next actions and lesson questions distinct, clarifies existing practice choices, and lets me return a review to automatic scheduling without changing its pending date or inventing practice. Simplify obsolete dummy practice-text data with a small schema migration, protect real history and the shipped decision loop, and prove the behaviour through focused rendered and inbound-boundary tests.",
  "builder": "claude",
  "summary": "Keep useful practice information clear from capture to next time",
  "rationale": "ONE PRODUCT THESIS\nThe few things the musician records should have clear ownership, be available when playing, and never require supervising the scheduler.\n\nOWNER DECISIONS, SETTLED 2026-09-16\n1. One persistent Working notes field, readable/editable during Active. Block Observation, Next time and lesson Question remain separate concepts.\n2. Existing note/question/observation content is dummy test data. Lossless preservation of retired practice-text fields is explicitly waived where simplification benefits the model. Do not build legacy archives, conflict-merging machinery or permanent compatibility fields to preserve it. This is a bounded migration exception, NOT permission to reset practice history, ratings, reviews, commitments or future meaningful text.\n3. Retain existing algorithm inputs and maths. Importance means changeable personal priority; Difficulty means changeable current effort. Optional inputs are progressively disclosed, never inferred automatically.\n4. Returning to automatic scheduling keeps the pending date, releases its protection, switches manual/fixed-cadence mode to auto if necessary, and records no practice. With no date, the separate explicit Review today action is available.\n5. Claude builds. The unexplained iPhone viewport defect is a separate diagnostic task, not a hidden prerequisite of this lane.\n\nCANDIDATE COMPARISON\nQualitative planning judgement, not measured delivery estimates. Rank 1: coherent capture-to-reuse lane, including date ownership. Daily value very high; trust high; simplification high; coherence high; migration risk moderate but bounded by explicit dummy-text retirement; mobile value high for note editing and shorter forms; ongoing administration low; reviewer comprehension high when split into A-E below. SELECTED.\nRank 2: general import-integrity, archival and retrospective truth. Trust very high; daily value medium; simplification low; coherence good only as a data-integrity lane; migration risk moderate if archival added; mobile value low; maintenance moderate; reviewer comprehension good. Its bounded malformed-backup refusal earns inclusion only at this lane's actual migration/restore boundary; general graph validation and archival do not.\nRank 3: full status/result/priority model redesign. Daily value potentially high but uncertain; trust risk high because ranking, spacing and warm-up eligibility depend on these inputs; simplification potentially high; coherence high; migration/semantic risk high; mobile value medium; administration uncertain; reviewer comprehension poorest. Owner explicitly chose clarification over this redesign.\nRank 4: iPhone viewport and Safari layout diagnosis. Mobile value high; correctness benefit potentially high; schema risk none; excellent bounded scope once diagnosed; present cause uncertain. Run diagnostics separately before specifying a fix.\n\nWHY HEAVY IS JUSTIFIED\nA UI-only lane could expose existing Notes in Active and improve labels with no migration. It would leave obsolete problem/strategy/specialist text and the cached last observation as competing homes. Retiring those persisted fields cleanly warrants schema v12 to v13, using the existing migration chain and validation doors. No new note entity, generic notebook/task system, external service or new scheduling algorithm is justified.\n\nREVIEWER PRE-MORTEM\nA correct migration helper can still be bypassed by current-version hydration, sync, archive restore or corrupt-start recovery: C1-C3 exercise those actual boundaries. A correct note editor can write to the wrong item after a routine boundary or overwrite newer content on blur: A2-A3 exercise both. A correct automatic-mode button can be bypassed by ItemForm or accidentally triggered by an unrelated auto-mode save: D2-D3 distinguish these. A green RTL source guard can still render on the wrong edge: E1 inspects actual text geometry. An exported field can remain practically write-only behind the newest ten blocks: A4 exercises older history. A transferred date can retain a false reason, or a stale page can act on another item's date: D1-D3 assert explanation and identity as well as values. No acceptance family is proved primarily by source regex or JSX shape.\n\nREMAINING FINDINGS, RANKED FOR THIS LANE\n1. Malformed full-backup entries: potential silent byte loss, highest severity, occasional workflow, bounded validation risk; include because full-backup migration/rollback must be trustworthy.\n2. Malformed surviving practice text and editor persistence/identity: crash or lost/overwritten information, everyday use, high trust and low administration; include at actual boundaries.\n3. Active notebook access and duplicated text capture: very frequent practical friction, strongest simplification, small schema retirement risk after the dummy-data waiver; central scope.\n4. Manual date ownership control: everyday interpretability/trust, small administrative transition, no new evidence; include.\n5. Historical result versus current context: reproducible false statement, periodic use, bounded query/copy correction within the information lifecycle; include narrowly.\n6. Self-parenting/family/other graph invariants: potentially disappearing items in repertoire, infrequent editing/import path, wider reference semantics; defer as a coherent integrity lane.\n7. iPhone keyboard and Safari alignment: frequent reported usability issue, high diagnostic uncertainty, no source-established mechanism; diagnose separately before fixing.\n8. Permanent deletion: real history loss but explicit confirmation and non-destructive Resting alternative; defer the owner-dependent archival model.\n9. Untouched stale-day displays and misleading sync wording: still open, varying frequency; only touched decision/context clocks and practice-model documentation belong here.\n",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "BASELINE AND EVIDENCE\nClean local main and origin/main verified at d014293c205958f45e4393ebf6ae56901db83a1c. Fresh Prismatica context snapshot 209143d6c9954774e4722e715b388010bf7a230b8142d24b18cc651320e4d009, no pending proposals/open lanes. 20260913 trusted-daily-session lane is shipped and owner-approved with patch fd6cd73ca467e1f6d07681b89a67f1faed10a396; 20260911 direction/UI lane with patch 1c85fc6fb59ab1a22cac40bb123696586ae4fa69. Read their records, current AGENTS, Rules and relevant canonical Flows. Routine and hands-free mechanics are already represented within existing Flows; lack of separate Flow titles is not proof of absent coverage.\nHistorical catalogue /Users/Ehsan/Downloads/review-2026-09-10.md was read as leads only. It names old baseline 0c6058e and 294 tests; neither is current. Baseline verification here: 333 tests passed across the full run and focused rerun of the three browser-containing suites. Initially Playwright was absent from installed node_modules despite being declared; npm ci --offline restored it without changing tracked files. The three browser tests then needed unsandboxed localhost/browser access. 330 passed in the ordinary run and all 16 tests in those three suites passed on focused rerun, covering all 333 unique tests. This is test evidence, not a claim that every defect is absent.\nLive current-main app inspected on a local demo origin: Item Detail, Start before/after item selection, Active disclosures and Lessons at 390x844 in Chromium. Start exposes seven modes and eighteen focus options after item selection. Active exposes read-only piece information plus an unrelated quick-note textarea. Current Farsi question ordinal and question/details resolve RTL and align at start in Chromium. No actual iPhone keyboard/Safari diagnosis was obtained. Automatic approval review refused the synthetic demo note/Finish interaction; the audit block was discarded without saving. Close persistence evidence is from current source tracing and the existing passing isolated browser journey, not that refused interaction.\n\nCOMPLETE PRACTICE-INFORMATION INVENTORY AND CONSUMERS\n- PracticeItem.title, instrumentId, itemType: identity and grouping; quick add/full form; all lists, selection, Active and history. Keep.\n- materialId, stageId, parentItemId, lesson.itemIds, strand, catalogKey: source/path/part/origin structure and planner/default context; full form and connection/pathway controls; repertoire, pathway views, plan and defaults. Keep; lesson origin is not preparation.\n- Persian identity: dastgahAvaz, gusheh, form, composer; Guitar identity: lessonNumber, barRange. Full form, detail/repertoire grouping and reference context. Keep as progressive identity metadata.\n- Item notes: persistent notebook, edited only by ItemNotes on Item Detail, saved on blur; read in Active About this piece. ItemForm does not currently expose this same field. Make this the single Working notes home.\n- currentProblem: ItemForm; displayed ItemCard, Item Detail and Active; copied into question/report context. No ranking/date input. bestStrategy: ItemForm and Item Detail only. Retire both as separate inputs.\n- Persian working detail: phraseLabel, shahed, ist, foroud, importantNote, ornamentIssue, mezrabIssue. Guitar working detail: rightHandIssue, leftHandIssue, toneIssue, fingering, tempo, stringNoiseIssue, bodyTensionNote. Entered in form, rendered as Detail rows, not used in scheduling and not available in Active. Retire these specialised practice-text fields; their future content belongs in Working notes. Numeric routine/catalogue BPM is a different field and stays.\n- tags: comma-split form input and Item Detail chips; no current search/ranking/plan consumer. Retire the separate tag input/storage, without adding replacement tagging duties.\n- status: manual item/form choice and optional accepted Close suggestion; drives default mode, fragility, pathway progress and eligibility. new/fragile/repairing/usable/integrated/performable/maintenance/dormant are not eight rungs of one compulsory achievement ladder. Keep enum/behaviour and clarify confidence versus work intention.\n- importance/difficulty: manual 1-5, default 3. Ranking uses importance*2 + difficulty; review urgency factor uses both; warm-up eligibility excludes high difficulty. They are consequential owner estimates, not intrinsic immutable properties. Keep values and weights, explain and progressively disclose them.\n- primaryFocus and per-block mode/focus: defaults and descriptions of what was practised; focus also feeds observations/Insights. Keep existing choices and saved values. Hide optional changes behind the chosen default summary on Start.\n- active.note: unfinished block scratch observation, entered during Active, seeds Close observation; not persistent item notes. Keep but label its destination clearly.\n- PracticeBlock.observation: one block's historical observation; cached to item.lastObservation, shown in recent history and question context. Keep the block field; retire the duplicate item cache and derive the latest non-empty observation from real blocks, labelled with its date. No text parsing or inferred judgement.\n- PracticeBlock.nextAction: future intention recorded with that block; latest non-empty already appears early in Active via lastNextAction. Keep this shipped behaviour and expose it in historical block detail too. It is not a second item-notes field or a new task lifecycle.\n- PracticeBlock.bodyNote: Close optional input, stored but not rendered in current history. Retire the separate input/storage under the dummy-data waiver. Future body/tension observations can be ordinary Observation or Working notes according to their intended lifetime.\n- PracticeBlock.constraint: legacy/optional authored practice constraint, displayed in Active when present; ordinary Start currently supplies undefined. Keep existing values and expose them in block detail; do not add another required capture control.\n- result: worse/same/slightly_better are relative judgements; stable_alone/stable_in_context/performable are demonstrated stability levels. These drive the shipped spacing decision and optional status suggestion, not just a colour. not_logged is a deliberate escape/routine outcome. Keep codes, ranking and behaviour; clarify their questions and examples.\n- minutes: owner-attested duration, proposed by the stale-clock guard; preserve existing semantics. Status suggestion remains optional. Review answer/date/type/mode are separate scheduling intent with existing provenance; keep collapsed explanation and one ReviewPlan derivation.\n- lessonAgenda question.text/answer/askedAt/lessonId and independent preparation entries: teacher agenda and retained lesson history, entered through Close, item and lesson surfaces. Keep canonical v12 collection and independence. Do not migrate questions into item notes or recreate the rolling teacherQuestion field.\n- Lesson.notes; recording/reference title/path/notes; Material.title/sourceName/parentTitle/section/teacherOrSource/notes/status; Pathway name/source/description/note; Stage code/title/group/intro; Routine name and segment label/minutes/essential/itemId: distinct lesson, source or authored route/instruction context. Keep with their current owners and consumers, never absorb these into an item's notebook. Bound routine items can access their own Working notes; unbound countdowns remain unlogged.\n- Attachments: names/ownership/media references are reference data, not practice text. Preserve bytes and ownership; no media/storage redesign.\n\nCURRENT CORRECTNESS FINDINGS\nExecutable pure-domain probes against this HEAD confirmed: validateDB accepts a non-string item notes object; validateDB accepts an item parented to itself; buildReportData reports improvement from current lastResult even when the requested period has only a worse block. Source confirms ItemForm can offer self as parent, retains incompatible family metadata after an instrument switch, and backup.ts skips malformed files before replaceAllBlobs. Source also confirms ItemDetail/Lessons/Repertoire/TeacherReport still have some mount-frozen clocks, Settings says newest copy wins, and deleteItem deliberately deletes blocks with a count-bearing confirmation. These are separately classified below, not treated as already reproduced iPhone defects.\nStale elapsed-time protection, calendar totals, early-success preservation, same versus worse, dormant recommendation exclusion, minutes-based exposure, lesson-specific commitments/questions, clipboard fallback, Farsi search, attachment ownership, single Close derivation, live Close/plan dates and cold-start recovery are shipped. Preserve rather than reimplement them.",
  "desiredBehaviour": "A. ONE CANONICAL HOME FOR EACH KIND OF INFORMATION\nA1. Reuse PracticeItem.notes, displayed as Working notes. No new workingNotes alias, note collection or rich-text dependency. Full creation/edit, Item Detail and Active all target the same field. One title-only quick add and one full form remain. Retire currentProblem, bestStrategy, tags and the fourteen specialist working-detail fields listed in the inventory. Identity fields stay distinct. Catalogue item creation must put BOTH existing catalogue entry.notes guidance and entry.about guidance into the one notes field when present; moving away from currentProblem must not drop newly-created catalogue guidance.\nA2. Reuse/extend ItemNotes as the shared editor: calm collapsed entry point, readable expanded notes while the timer runs, obvious Edit/Done, multiline plain text with independent Farsi/English paragraph direction. Notes remain useful after Finish, Discard, navigation and reload because they belong to the item, not the block. Done closes editing, not practice. Avoid blur-only saving, stale local copies and misleading Cancel semantics over already-saved text. A timer tick, store update, date change or item switch cannot reset the caret, overwrite fresh text or save A's text into B. Emptying notes is deliberate and persists; absent and empty are not grounds to resurrect retired text. Do not announce Saved before durable acknowledgement; a failed persistence operation retains visible text and offers retry/copy, never silent success. Use existing IndexedDB/Zustand plumbing, not a new persistence framework.\nA3. The same access applies to the current bound item in RoutineRunner. Unbound segments have no fictitious item notebook. An automatic or skipped segment boundary must not transfer an open editor's text to the next item; no focus trap, invisible pause, timer reset, extra block or changed minute allocation. Keep the authored routine segment instruction separate from item notes.\nA4. Active's quick capture is explicitly an Observation for this block, not Working notes. It seeds Close; editing persistent notes does not change it. Close retains Result, Observation and Next time as the main reflection, then optional status/review/question controls. Remove Body/tension as a separate field. Preserve the chosen observation, next action and question through preview refreshes, and never create a question from arbitrary notes. Block history exposes observation, nextAction and any legacy constraint with date/mode/focus/result/minutes; older entries are reachable through simple progressive disclosure. Derive latest observation from blocks rather than item.lastObservation. Keep lastNextAction's latest NON-EMPTY behaviour and label it as a previous decision rather than an inferred current task.\nA5. Adapt every currentProblem/lastObservation consumer. Cards and teacher question exports must not dump the entire personal notebook into a preview or teacher sheet. Remove automatic Problem context; show a clearly labelled latest block observation with its date only where that context already belongs. It is current context, not an answer to a past question or evidence that the question was asked. Lesson question text, optional answers, targets and lifecycle remain unchanged. Working notes can always be opened on the item.\nA6. Bound the existing history/current-state reporting defect as part of truthful reuse: period-specific result statements come from the recorded blocks inside the selected period, never current item.lastResult. Do not claim improvement merely because an absolute stable result has a higher rank; report the result actually recorded. Current status, open questions, repeated-current-pattern and suggested-next-work sections must explicitly say Current where they use present state. Keep existing calendar-versus-rolling definitions; do not invent historical status snapshots, analytics, new metrics or a reporting subsystem. Later practice may change Current sections but not results attributed to an earlier period. Existing user-selected report dates remain selected; refreshing current context must not silently change the historical period.\n\nB. FEWER DECISIONS, HONEST WORDING, SAME ALGORITHMS\nB1. Use an explicit definition table in docs/product-spec.md and concise in-context help. Item status answers how this item currently stands/how the owner is working on it, not how the last ten minutes went. new is New material, still being established rather than a claim that its practice count is zero; fragile unreliable; repairing actively addressing a known problem; usable holds together but not reliably in context; integrated reliable in context; performable ready to play for someone; maintenance deliberately maintaining learned work; dormant deliberately set aside. Preserve existing enum values, defaults, scoring, pathway/mastery and accepted-suggestion transitions. Do not claim perfect scientific separation between neighbouring statuses or force a user through every status. Current new status can survive recorded practice, so never label that case Not practised yet solely from its enum. Preserve the catalogue's honest Not practised yet presentation for genuinely untouched additions, using its existing untouched-item evidence rather than inventing a practice event or automatic status promotion.\nB2. Close asks for the most concrete result actually demonstrated. Clarify stable_alone as the chosen passage/task holding together in isolation, stable_in_context as holding together joined to its surrounding musical context, performable as ready to play for someone; these remain the existing evidence categories. For change short of those claims, same means no meaningful change, slightly_better some improvement, worse genuine deterioration or recall difficulty. Do not turn same, fatigue, an empty field or a missing rating into failed retention automatically. Keep one selection, not an additional proficiency questionnaire. Retain deliberate Save without a result and its unchanged-review semantics. No AI judgement.\nB3. Labels Personal priority and Current effort (with the stored names importance/difficulty retained) have anchored 1/3/5 descriptions and meaningful intermediate levels. Priority is how much the owner currently wants this in the mix; effort is how demanding it currently feels at the intended level. Both can change, need not be maintained on a schedule and default to 3. Lesson urgency remains the independent preparation deadline. Explain briefly that the estimates influence selection/review and high effort excludes easy warm-up; never pretend they are inferred measurements. Keep all numerical effects unchanged.\nB4. Start leads with selected item, duration, a readable default mode/focus summary and Begin practice. Optional Change practice approach reveals the existing mode/focus choices with clear definitions. Keep all seven modes and eighteen focus values; no forced taxonomy merge, new mandatory selection or extra creation path. Mode describes what approach to use; focus describes what to attend to. Item setup uses progressive optional status/priority/effort/focus/review controls. New/changed controls have their own accessible names and visible selected state, not merely a named parent group. Preserve quick title-only creation and direct recommendation/plan starts.\n\nC. SMALL SCHEMA CHANGE, REAL INBOUND SAFETY\nC1. Bump PracticeDB SCHEMA_VERSION 12 to 13 and add one deterministic, clock-free, idempotent retirement pass in migrations.ts after existing migrations. Discard ONLY retired currentProblem, bestStrategy, tags, item.lastObservation, the fourteen specialist working-detail keys and block.bodyNote. Keep existing item.notes, block.observation/nextAction/constraint and lessonAgenda questions/answers without transformation; retaining these costs no compatibility machinery. Keep Persian/Guitar identity keys, all block records and numeric facts, ids/references/timestamps, ratings/status, review state/provenance, sr state/marker, agenda commitments, routines, settings, media metadata and bytes. Remove empty family containers only when truly empty; do not drop their identity. Retired keys are removed even in already-current or partially converted input, so no dual truth survives. Do not rerun destructive reset behaviour on future canonical text. Existing v2-v12 migration steps remain, including v12 lesson-intent conversion; the owner waiver does not authorise ripping out that already-shipped history machinery.\nC2. Extend shared validation for this lane's surviving practice-text inputs before install: optional strings must really be strings; present wrong types are rejected with useful item/block identification, never coerced to [object Object]. Validate the unfinished observation text at the real persisted-state hydration boundary too, because it lives outside PracticeDB. Existing scheduling/agenda and newer-schema refusal stay authoritative. A newer schema is refused before any retirement pass or relabelling. No general graph repair, guessed reference relinking or arbitrary input truncation.\nC3. Actual hydration (migrate AND current-version merge), Settings import, sync pull, Keep remote, archive restore and corrupt-start recovery must reach the same validated model before replacing state. Preserve existing unfinished-session and revision-race guards. A valid schema conversion must survive persisted reload and export/reimport. Invalid input leaves the previous live DB, persisted bytes and attachment bytes unchanged; corrupt cold start stays visible and recoverable through the existing rendered control, while too-new data has update guidance only.\nC4. Because a migration rollback uses a full backup, close the narrow existing malformed-file hole at importFullBackup: a PRESENT files property of the wrong type, malformed entry, empty/non-string or duplicate file id, duplicate attachment metadata id, invalid data/base64, or invalid metadata association is refused before replaceAllBlobs. Validate ownership against canonical metadata; retain supported legacy itemId blob ownership by normalising through existing semantics. Do not silently skip entries or guess owners. Distinguish files absent (state-only import, existing blobs untouched), files:[] (explicit empty full backup), and a complete non-empty set. A full backup must not install metadata for omitted bytes or orphan bytes without matching metadata. Keep remote NAS references out of this file set. Scope this to transport integrity of this lane's backup/restore invariant, not a general attachment feature.\nC5. Rollback is an explicit export/restore procedure, not an invented down-migration. Before upgrading owner data, retain a schema-v12 full backup and attachment bytes outside the upgraded app. v12 cannot safely read v13 and must refuse it; do not stamp a v13 file down to 12. Test a disposable exact-baseline app restoring its pre-upgrade backup and reopening its attachment. Keep a v13 export before any rollback; practice recorded since upgrade will not exist in the v12 backup and must not be silently sacrificed or represented as automatically converted. Updating forward is the recovery path for newer-schema refusal. No startup backup writes or extra archival system are introduced.\n\nD. EXPLICIT TRANSFER OF REVIEW OWNERSHIP\nD1. Add one pure administrative transition and store action for Use automatic scheduling, consuming the LIVE item/open reviews, not captured component state. Keep the existing pending calendar date unchanged; set mode auto and transfer the pending date's management to the engine using the existing nextReviewSource field. Document that auto denotes engine-managed authority, not proof that this date was mathematically generated or that a review occurred. Show the existing date and explain: date retained, future real practice determines changes. Update any open-row reason that would falsely claim manual protection or a computed interval; never fabricate a result. Spacing reps/ease/base/last-progress-day, block counts/minutes/results, statuses and completed historical reviews remain byte-for-byte unchanged.\nD2. Matching pending rows retain their date. If an item has a pending date but no open row, restore that one administrative reminder without creating a block or completing anything. Multiple agreeing open rows need not be historically rewritten. If item/open rows disagree, or rows exist without an item date, refuse the transfer with an actionable choice of which existing date to keep; do not guess. Existing Change review date can resolve the conflict explicitly before transfer. With no pending item date and no open rows, switching to auto leaves it unscheduled and source absent. Offer separate Review today; this invokes honest administrative scheduling with today's live local date and user source, preserves the current mode, and manufactures no retention evidence. No-date mode transfer and Review today are distinguishable operations.\nD3. Item Detail and the existing item edit form must tell the same story. An actual saved mode transition manual/interval to auto routes through the same transition; an unrelated save while already auto MUST preserve a protected user date. The explicit transfer remains available on an already-auto item with a custom/snoozed/unknown-provenance date. No fourth field or parallel scheduler. Changing to manual/fixed cadence does not invent a new date or spacing state. Future cadence rules remain unchanged. Repeated transfer is idempotent, and date controls re-open using current item/date rather than stale mount state.\nD4. After transfer, shipped rules apply: early positive/neutral results keep the date and spacing; worse alone may bring an engine-managed future date forward, never postpone it; manually setting/snoozing/re-arming a date makes it protected again; due eligible practice advances at most once per local day; deliberate No clears pending intent and unanswered/not_logged does not. Item, open row, due list, recommendation reason and Close preview/save must agree. Use existing useDecisionNow where the touched date controls need a live day, with the same action-time stale-preview protection as Close. Do not broaden this to every stale page.\n\nE. BOUNDED FORM/MOBILE RELIABILITY\nE1. Make the changed editors and choices usable at 390x844 and desktop without horizontal overflow, overlapping controls or lost focus. Working notes and observations preserve multiline text and independent Farsi/English direction/alignment, including mixed paragraphs and opposite-language item titles. Keep 16px editable inputs, 44px targets where applicable, safe areas, reduced motion, contrast improvements and keyboard-accessible disclosure. Explicit local logical alignment is allowed where rendered evidence shows inherited alignment is wrong. ClassQuestions changes are bounded to the retired-context adaptation and actual rendered direction coverage, not a presumed cure for the owner's un-reproduced Safari symptom.\nE2. No changes to useViewportGuard, shell height, visualViewport scrolling or nav positioning in this lane. Separate OWNER diagnostic before any such fix: on the current deployed revision, record device/iOS/app version and standalone versus Safari; repeat focus, keyboard dismiss with field still focused, blur, field-to-field focus, route exit and orientation on item notes, Close and lesson questions. Capture timestamps with innerHeight, visualViewport.height/offsetTop/pageTop/scale, window.scrollY, document/body/main scrollTop, activeElement tag and app/main/tabbar/field rectangles before/during/after transitions. For the Farsi symptom also capture computed direction/textAlign on the ordinal, li, wrappers and each line plus an actual screenshot. This distinguishes layout scrolling, visual viewport displacement, residual internal scrolling, keyboard timing, focus scroll and local CSS. Do this before the separate device lane, preferably while this lane builds; no timeout increase is authorised by this contract.\n\nDELIVERY AND HOSTILE-REVIEW CHECKLIST\n[ ] Land A-E as one coherent implementation, reviewed by family rather than one giant journey.\n[ ] Use the exact unique acceptance titles below, with table-driven cases inside each test as appropriate, not dynamically expanded duplicate titles. Existing browser tests run through Vitest; extend the existing Playwright-as-library harness only as needed.\n[ ] Browser tests drive real controls and inspect live AND persisted state after the actual write settles. Never use a fixed sleep as persistence proof. Let browser clock passage trigger real scheduled handlers for day/segment changes; do not manually dispatch events that hide the race.\n[ ] Keep pure migration/selection/ownership decisions outside React. Use real IndexedDB/browser paths for persistence, import and recovery. For sync/archive tests, invoke actual orchestrators with isolated fake transport at the existing port, no live GitHub writes. Intercept/answer each relevant dialog deliberately rather than globally accepting every dialog.\n[ ] Run full required Prismatica checks once on the finished implementation, then rerun only named affected checks for rework plus required final checks. Do not weaken existing tests or substitute JSX guards for interaction evidence.\n[ ] Reconcile changed Flow mechanics/Rules through Prismatica's normal governed workflow, without rewriting unrelated signed records. Update the exact docsDelta files, including stale README formula/question claims, newly retired fields, ownership semantics and the dummy-data exception. No separate Flow is needed for note editing inside practice.\nHighest-leverage first step: implement the canonical notes/retirement decision and its real boundary fixtures before screen polish. Next: wire the shared editors and ownership controls with browser tests. Third: run the adversarial family audit, device usability acceptance and full checks. No hidden prerequisite from the deferred viewport lane.",
  "mustNotChange": [
    "One item, one mode, one focus, one result, one next action. Title-only quick creation, under-30-second start and under-60-second close, deliberate unlogged escape; no new required metadata.",
    "The shipped session planner: deterministic eligibility/build/swap parity, short-session behaviour, warm-up inside budget, exposure/variety maths, urgent work, instrument scoping, stable tie-breaks and stale-plan protection. Today Plan and Routines remain peer doorways above the recommendation.",
    "The shipped scheduling equations, numerical parameters and scientific-evidence limits. Same is not failed retention; early success never advances spacing; manual protection changes only by explicit date/mode ownership intent; once-per-local-day advancement remains.",
    "Lesson-specific preparation and independent question targets, unassigned intent, asked/answer history, detach semantics, copy fallback and no question-derived urgency.",
    "Practice timing, Finish freezing elapsed time, stale-duration proposal, running/paused/reload semantics, routine allocation, wake-lock ownership and signals. Editing notes cannot create, finish or pause practice.",
    "Local/offline-first IndexedDB, whole-snapshot hash-based sync, active-session and revision guards, visible deferral/retry, explicit conflicts with archives, cold-start refusal/recovery and newer-schema refusal.",
    "Farsi search, NAS references and media ownership, large-file policy, existing direction/contrast improvements, safe-area and input sizing. No backend, account, paid service, AI/audio grading, gamification or quotas.",
    "No database reset, fake records, invented results or silent loss of meaningful new text. Owner-authorised retirement applies only to the enumerated dummy legacy practice-text fields. Preserve every practice block and its identity, duration, result and timestamps.",
    "No generic testing framework, generic note/task system, useStore slice refactor or broad mobile-layout rewrite."
  ],
  "assumptions": [
    "The existing bare item.notes field is the smallest sufficient canonical notebook; a new persisted alias would add no product value.",
    "Persisting notes during a bound routine is the same item-note invariant, not a new routine planning feature.",
    "The owner dummy-text waiver permits discarding the explicitly retired practice-text fields, including display-only tags; retained canonical fields need no destructive reset.",
    "The existing test harness and installed Playwright package suffice. The layout family requires its matching Chromium and WebKit binaries; install those during test setup if absent, without adding a framework/package or silently skipping coverage."
  ],
  "possibleConflicts": [
    "Old AGENTS/README descriptions name currentProblem/bestStrategy/lastObservation and specialised notes; replace those descriptions with the canonical field ownership, rather than append contradictory rules.",
    "nextReviewSource has historically been described as origin. Administrative transfer needs precise authority wording so auto never falsely claims a newly computed date or practice event.",
    "r-quick-start says title is the only required field anywhere, while shipped Close requires a result or deliberate Save without a result. Document that existing distinction rather than weaken Close or add requirements.",
    "Owner data-retirement permission supersedes the original lossless-text request only for the enumerated dummy fields; future text and non-text history remain protected."
  ],
  "scope": {
    "allow": [
      "src/domain/types.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/io.ts",
      "src/domain/io.test.ts",
      "src/domain/factories.ts",
      "src/domain/seed.ts",
      "src/domain/seedMigration.test.ts",
      "src/domain/blocks.ts",
      "src/domain/blocks.test.ts",
      "src/domain/labels.ts",
      "src/domain/defaults.ts",
      "src/domain/scheduling.ts",
      "src/domain/scheduling.test.ts",
      "src/domain/questions.ts",
      "src/domain/questions.test.ts",
      "src/domain/report.ts",
      "src/domain/report.test.ts",
      "src/domain/insights.ts",
      "src/domain/insights.test.ts",
      "src/domain/practiceInformation.ts",
      "src/domain/practiceInformation.test.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/store/backup.ts",
      "src/store/idb.ts",
      "src/components/ItemNotes.tsx",
      "src/components/ItemForm.tsx",
      "src/components/itemFormValues.ts",
      "src/components/itemFields.ts",
      "src/components/ItemCard.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/format.ts",
      "src/components/format.test.ts",
      "src/components/direction.test.ts",
      "src/components/ui.tsx",
      "src/components/useDecisionNow.ts",
      "src/pages/NewItem.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/TeacherReport.tsx",
      "src/pages/Insights.tsx",
      "src/pages/Settings.tsx",
      "src/styles/global.css",
      "tests/practiceBrowser.ts",
      "tests/practice-information.browser.test.ts",
      "tests/review-ownership.browser.test.ts",
      "tests/practice-information-inbound.browser.test.ts",
      "tests/practice-information-layout.browser.test.ts",
      "tests/daily-practice.browser.test.ts",
      "tests/lesson-agenda.browser.test.ts",
      "tests/fixtures/practice-information-v12.json",
      "tests/fixtures/practice-information-v13.json",
      "AGENTS.md",
      "README.md",
      "DECISIONS.md",
      "docs/product-spec.md",
      "docs/scheduling-evidence.md"
    ],
    "forbid": [
      "src/components/useViewportGuard.ts",
      "src/components/screenAwake.ts",
      "src/components/useScreenAwake.ts",
      "src/domain/practiceSignal.ts",
      "src/domain/practiceSession.ts",
      "src/domain/plan.ts",
      "src/domain/scoring.ts",
      "src/domain/recommend.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/farsi.ts",
      "src/domain/sync.ts",
      "src/store/syncEngine.ts",
      "src/store/gitRemote.ts",
      "src/store/githubSync.ts",
      "src/store/revision.ts",
      "src/components/Layout.tsx",
      "package.json",
      "package-lock.json",
      "vite.config.ts",
      ".github/**"
    ]
  },
  "exclusions": [
    "Already shipped: early/repeated-review correction, same/worse distinction, dormant eligibility, minutes-based exposure, varied session planning, lesson-specific agenda migration, clipboard fallback, Farsi search, NAS/material work, stale-session proposed minutes, calendar totals, unfinished-practice sync protection, cold-start recovery and the large direction/contrast lane. Retest their invariants, do not reimplement them.",
    "Actual iPhone keyboard displacement/overlap and the Safari-only question-alignment symptom: current Chromium view did not reproduce them; source leaves several plausible causes. Perform the specified OWNER diagnostic before prescribing a separate device fix. No timeout guess and no dependency blocking this lane.",
    "General item relationship validation, self-parent/cycles, cross-instrument family identity cleanup and dangling non-agenda refs: still open in current code, high trust but less frequent than notes; defer to a coherent graph-integrity lane. Do not drop hidden family identity to conceal the issue.",
    "Archive-versus-delete lifecycle: current permanent deletion is explicitly confirmed and destroys block history; Resting already provides a non-destructive way to set an item aside. Changing archival semantics needs a separate owner decision and must not piggyback on this text migration.",
    "Broad inbound invariant framework: only this lane's surviving text and full-backup transport boundary are added. Existing v12 agenda/scheduling validation stays. No speculative validate-everything subsystem.",
    "Global live-clock sweep across untouched Repertoire/Lessons/report pages: source still contains mount-frozen clocks. Fix only touched decision controls/current context where required by these acceptance families; defer unrelated date displays.",
    "Full status/proficiency/lifecycle split, inferred difficulty, grading redesign, review algorithm replacement and new musical category quotas: owner chose clarified existing semantics.",
    "General sync copy cleanup and Settings reorganisation: newest-copy wording remains misleading, but changing unrelated sync UI is not the selected thesis. Settings edits here are limited to practice-choice and review-ownership explanations.",
    "New routine/hands-free canonical Flow project: current existing Flows already carry relevant mechanics. Update changed practice mechanics through normal governance; do not invent duplicate journeys.",
    "Global accessibility sweep, universal typography/direction repair, generic rich text, notation tools, media viewers and history editing/deletion features. Address accessible names and real rendering only on affected surfaces."
  ],
  "acceptance": [
    {
      "description": "A1 / C1. Pure migration: exercise v12, older supported through the existing chain, current v13, mixed/partially retired objects and repeated execution. Assert exact retired-key absence and exact preservation of canonical Notes/Observation/Next time/questions, identity metadata, all non-text block/review/agenda/routine/settings facts. Include empty strings, absent family blocks and both retained/retired keys. New catalogue items retain both entry.notes and entry.about guidance. Opposite case: current canonical text is never reset on a second migration.",
      "test": "practice text retirement removes only authorised legacy fields and is idempotent"
    },
    {
      "description": "C2. Pure validation discriminates absent/empty/valid multilingual strings from numbers, arrays and objects in surviving item/block text. Errors identify the offending record. Keep existing invalid-date/reference and newer-schema refusal. Do not confuse retired dummy fields with malformed surviving canonical fields.",
      "test": "practice text validation rejects malformed canonical values without coercion"
    },
    {
      "description": "C3. Real IndexedDB hydration in disposable browser: v12 migration, already-current v13 merge, partial leftovers and persisted unfinished observation; invalid canonical/unfinished text, too-new schema and invalid recovery file. Compare raw stored bytes before/after refusal, drive the rendered cold-start recovery control with a valid file, reload and verify recovery; newer-schema UI has no downgrade control. Existing paused-on-reload timing remains.",
      "test": "practice information hydration and rendered recovery enforce the same schema boundary"
    },
    {
      "description": "C3/C4. Invoke real Settings import plus actual sync pull, Keep remote and archive restore orchestrators using isolated existing transport ports. Matrix valid old/current data, invalid canonical text, files wrong type, malformed/duplicate ids, invalid base64/ownership, omitted/orphan bytes. Check live/persisted DB and blob bytes before/after, not only return values. files absent preserves local bytes; valid files empty/nonempty replaces honestly. Include unfinished and revision-changed refusal; no weakening of existing late-guard semantics. Valid import/reload/export/reimport retains canonical model. Cold recovery is covered separately above. Include duplicate attachment metadata ids as well as duplicate payload ids. Mock the existing network/module transport boundary around actual githubSync entry points where needed; calling only runSync with a fake installer is not proof of real installation wiring.",
      "test": "practice information replacement doors reject invalid data before database or blob replacement"
    },
    {
      "description": "C5. Disposable exact-baseline v12 app and new v13 app: export full v12 fixture with a real small attachment, upgrade/import it, export v13, prove old app refuses v13 without altering bytes, then restore the retained v12 export and open/read the attachment. A post-upgrade test block exists only in the retained v13 export, making rollback limitations explicit. No checked-in old app bundle or real owner data modification.",
      "test": "practice information rollback restores the original backup without pretending to downgrade new history"
    },
    {
      "description": "A2. Render real Item Detail and Active at desktop/390px. Edit the same notebook while running and paused, with timer ticks, offline mode, navigation, Finish/return and Discard; verify notes survive and active clock identifiers/running/elapsed semantics, blocks/reviews/sr state stay unchanged by editing. Clear notes and reload; no resurrection. Inspect actual IndexedDB acknowledgement, not a sleep. Reject a storage write through the real storage seam and verify text remains visible with retry/copy and no false Saved state.",
      "test": "working notes persist across practice navigation without controlling the clock"
    },
    {
      "description": "A2/A3. Render a bound routine, edit item A while time naturally crosses to B, also exercise Skip, unbound and missing-item segments. Notes never land on the wrong item; routine elapsed/allocation/signals keep existing behaviour and no extra blocks appear. Also switch Item Detail route A to B and replace same-id data while the app is running: a stale editor must not overwrite new content on blur. Test Farsi and English text.",
      "test": "working note editors retain item ownership across routine and database changes"
    },
    {
      "description": "A4. Real Active to Close to next Active journey: distinct notebook, scratch Observation, Next time and lesson Question; choose result and close, inspect persisted records, reload, inspect older block history via disclosure and next-session previous decision. Notebook is not overwritten by reflection; questions stay independent and do not change preparation. Empty later nextAction preserves earlier non-empty choice. Deliberate unlogged close preserves schedule; Close across a local-day change retains authored text while refreshing the existing decision.",
      "test": "practice reflection keeps notebook observation next action and question distinct"
    },
    {
      "description": "A5/A6. Pure consumer cases plus rendered/exported teacher sheet: later block results and current notes/status change after a selected historical period; period result statements stay based on in-range blocks, current sections are labelled, and no unproved improvement is inferred from absolute ranks. Question output retains targets/asked answers and latest-observation date but never dumps Working notes as Problem or rewrites past answers. Include no-block/unlogged/older-observation cases and ordinary/DST local date boundaries for the selected report period.",
      "test": "practice summaries separate recorded period evidence from current context"
    },
    {
      "description": "B1-B4. Drive full item create/edit and Start with all retained status/result/mode/focus enums represented in a definition table; verify default summaries, reachable optional controls, accessible names, distinct descriptions, retained rating values and title-only quick add. Pin representative priority, urgency-factor, warm-up eligibility and scheduling outputs against current fixtures, including 1/3/5 effort/priority and Same versus Worse. A label change may not alter stored codes, weights, defaults or status transition behaviour. Include a new-status item with real blocks versus a truly untouched catalogue addition: wording is honest in both, with no automatic status or history mutation.",
      "test": "clarified practice choices preserve existing defaults and decision inputs"
    },
    {
      "description": "D1/D2. Pure administrative transition matrix: auto/user/unknown provenance; auto/manual/interval mode; future/due/past/no date; zero/matching/multiple agreeing/conflicting open rows; missing item; repeated execution. Retain pending date, normalise only explicit authority, preserve every sr/stat/block/completed-review fact. Restore missing reminder only when an item date exists; refuse ambiguous pending dates; no-date transfer stays unscheduled. Review today is separate and records no result.",
      "test": "automatic review ownership transfer preserves dates without inventing evidence"
    },
    {
      "description": "D3. Real Item Detail and full edit form: explicit transfer on already-auto custom/snoozed/unknown date, actual manual/interval to auto transition, and unrelated save while already auto. Assert identical intended outcomes and protected-date preservation on unrelated saves through live and persisted state after reload. Reopen/switch items/external live update while panel exists to rule out stale captured dates. Conflicting rows show actionable refusal; no-date auto remains unscheduled until explicit Review today. Button explanation never calls the retained date a new engine calculation.",
      "test": "review ownership controls distinguish explicit transfer from ordinary item edits"
    },
    {
      "description": "D4. Real UI transfer future custom date, then actual practice early with Same, positive and Worse in isolated scenarios; assert persisted due rows/item date, no early spacing expansion and repair only after worse. Change custom date/snooze/Schedule again re-establishes user protection. Exercise due eligible close, No, unanswered/unlogged and repeated same-day eligible close. Let browser clock cross local midnight before Review today or a displayed date action, without synthetic visibility events, and check displayed/saved date and Today/Close explanations.",
      "test": "released review dates obey the shipped early practice and local day rules"
    },
    {
      "description": "E1. Render changed note, item-form, Start, Close, routine-note, history and question-context surfaces at 390x844 and desktop in Chromium and WebKit. Install the matching existing Playwright browser binaries during setup if needed; do not silently skip an engine or report a skipped layout case as passing. Use Farsi, English, mixed paragraphs, opposite-language titles and long text. Assert own accessible names, selected states, keyboard activation, visible focus and actual text/ordinal bounding positions, no clipping/overlap/horizontal overflow, minimum editable font size and reduced-motion behaviour. This is browser rendering proof, not a claim to reproduce a physical iPhone keyboard; do not replace it with source regex.",
      "test": "practice information controls render accessible directional text at phone and desktop widths"
    },
    {
      "description": "OWNER subjective usability on the actual iPhone and Mac: a normal start stays under 30 seconds and close under 60; reading/editing Working notes during ordinary and bound-routine practice remains calm, clearly separate from block observation, and controls remain reachable with the keyboard. Verify understandable status/result/rating definitions and the retained-date automatic explanation. Record actual Farsi/English observations. Known residual shell/Safari symptom is separately diagnosed, not silently declared fixed and not cured with an untested timeout.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Heavy: schema v12 to v13 retires owner-authorised dummy fields, updates text ownership and review-date authority, and exercises actual hydration/import/sync/restore boundaries. A tested pre-upgrade full-backup rollback is required; no automatic down-migration or fabricated retention evidence."
  },
  "delta": {
    "today": "Persistent working information is split across Notes, problem, strategy and specialist fields; Active reads only some of it and edits a separate block note. Close asks overlapping questions, history omits some captured text, and custom date ownership cannot be explicitly released.",
    "instead": "One item notebook is readable/editable during practice; block observation, previous next action and lesson questions retain distinct lifetimes. Existing choices have plain meanings and progressive controls. Explicit automatic-date ownership transfer retains the pending date and spacing state without recording practice.",
    "keep": [
      "One-instrument, quick-start, calm Active loop and honest minutes.",
      "Trusted planner, lesson-specific agenda, conservative early-review rules and all sync/recovery safety."
    ],
    "assumptions": [
      "Owner explicitly permits retiring the enumerated obsolete dummy practice-text fields; future meaningful information remains protected."
    ],
    "showMe": "Open an item, read and edit Working notes while its timer continues, add a separate block observation, finish and choose a result/next action, then reload and practise it again: the notebook and previous decision are available and history says what happened. Repeat during a bound routine transition without notes crossing items. On the item release a custom future date to automatic control: its date stays, no practice/spacing changes, and later early Same versus Worse obey the shipped distinct rules. Restore a valid old backup through the real UI; malformed and newer data refuse before replacement."
  },
  "desiredRules": [
    "Persistent Working notes belong to an item; Observation and Next time belong to a recorded block; teacher questions belong to the existing lesson agenda. Each is used where its lifetime is meaningful, without copying one into another automatically.",
    "Editing practice information never changes elapsed time, running state, practice counts, results or spaced-repetition state. A bound routine change cannot transfer text between items.",
    "An explicit administrative transfer to automatic review management retains the pending date and spacing state; only subsequent eligible real practice supplies retention evidence. Ordinary item edits do not release custom-date protection.",
    "The v13 dummy-text retirement exception is enumerated and one-way. Meaningful canonical text and non-text practice history remain protected by the real validation, persistence and recovery boundaries."
  ],
  "docsDelta": [
    "AGENTS.md",
    "README.md",
    "DECISIONS.md",
    "docs/product-spec.md",
    "docs/scheduling-evidence.md"
  ]
}
```
````

## The Delta this change was framed from

# One item notebook is readable/editable during practice; block observation, previous next action and lesson questions retain distinct lifetimes. Existing choices have plain meanings and progressive controls. Explicit automatic-date ownership transfer retains the pending date and spacing state without recording practice.

_approved · about "practise-todays-recommendation"_

## Today

Persistent working information is split across Notes, problem, strategy and specialist fields; Active reads only some of it and edits a separate block note. Close asks overlapping questions, history omits some captured text, and custom date ownership cannot be explicitly released.

## Instead

One item notebook is readable/editable during practice; block observation, previous next action and lesson questions retain distinct lifetimes. Existing choices have plain meanings and progressive controls. Explicit automatic-date ownership transfer retains the pending date and spacing state without recording practice.

## Keep

- One-instrument, quick-start, calm Active loop and honest minutes.
- Trusted planner, lesson-specific agenda, conservative early-review rules and all sync/recovery safety.

## New assumptions

- Owner explicitly permits retiring the enumerated obsolete dummy practice-text fields; future meaningful information remains protected.

## Show me

Open an item, read and edit Working notes while its timer continues, add a separate block observation, finish and choose a result/next action, then reload and practise it again: the notebook and previous decision are available and history says what happened. Repeat during a bound routine transition without notes crossing items. On the item release a custom future date to automatic control: its date stays, no practice/spacing changes, and later early Same versus Worse obey the shipped distinct rules. Restore a valid old backup through the real UI; malformed and newer data refuse before replacement.



## Files in this diff

- AGENTS.md
- DECISIONS.md
- README.md
- docs/product-spec.md
- docs/scheduling-evidence.md
- src/components/ClassQuestions.tsx
- src/components/ItemCard.tsx
- src/components/ItemForm.tsx
- src/components/ItemNotes.tsx
- src/components/direction.test.ts
- src/components/format.test.ts
- src/components/format.ts
- src/components/itemFields.ts
- src/components/itemFormValues.ts
- src/components/ui.tsx
- src/domain/blocks.test.ts
- src/domain/blocks.ts
- src/domain/factories.ts
- src/domain/index.ts
- src/domain/io.test.ts
- src/domain/io.ts
- src/domain/labels.ts
- src/domain/migrations.test.ts
- src/domain/migrations.ts
- src/domain/practiceInformation.test.ts
- src/domain/practiceInformation.ts
- src/domain/questions.test.ts
- src/domain/questions.ts
- src/domain/report.ts
- src/domain/scheduling.test.ts
- src/domain/scheduling.ts
- src/domain/seed.ts
- src/domain/types.ts
- src/pages/ActiveBlock.tsx
- src/pages/CloseBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Settings.tsx
- src/pages/StartBlock.tsx
- src/pages/TeacherReport.tsx
- src/store/backup.ts
- src/store/idb.ts
- src/store/useStore.ts
- src/styles/global.css
- tests/fixtures/practice-information-v12.json
- tests/fixtures/practice-information-v13.json
- tests/lesson-agenda.browser.test.ts
- tests/practice-information-inbound.browser.test.ts
- tests/practice-information-layout.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/practiceBrowser.ts
- tests/review-ownership.browser.test.ts

## Check against the contract

- [ ] **ac-1** — A1 / C1. Pure migration: exercise v12, older supported through the existing chain, current v13, mixed/partially retired objects and repeated execution. Assert exact retired-key absence and exact preservation of canonical Notes/Observation/Next time/questions, identity metadata, all non-text block/review/agenda/routine/settings facts. Include empty strings, absent family blocks and both retained/retired keys. New catalogue items retain both entry.notes and entry.about guidance. Opposite case: current canonical text is never reset on a second migration. _(proof: practice text retirement removes only authorised legacy fields and is idempotent)_
- [ ] **ac-2** — C2. Pure validation discriminates absent/empty/valid multilingual strings from numbers, arrays and objects in surviving item/block text. Errors identify the offending record. Keep existing invalid-date/reference and newer-schema refusal. Do not confuse retired dummy fields with malformed surviving canonical fields. _(proof: practice text validation rejects malformed canonical values without coercion)_
- [ ] **ac-3** — C3. Real IndexedDB hydration in disposable browser: v12 migration, already-current v13 merge, partial leftovers and persisted unfinished observation; invalid canonical/unfinished text, too-new schema and invalid recovery file. Compare raw stored bytes before/after refusal, drive the rendered cold-start recovery control with a valid file, reload and verify recovery; newer-schema UI has no downgrade control. Existing paused-on-reload timing remains. _(proof: practice information hydration and rendered recovery enforce the same schema boundary)_
- [ ] **ac-4** — C3/C4. Invoke real Settings import plus actual sync pull, Keep remote and archive restore orchestrators using isolated existing transport ports. Matrix valid old/current data, invalid canonical text, files wrong type, malformed/duplicate ids, invalid base64/ownership, omitted/orphan bytes. Check live/persisted DB and blob bytes before/after, not only return values. files absent preserves local bytes; valid files empty/nonempty replaces honestly. Include unfinished and revision-changed refusal; no weakening of existing late-guard semantics. Valid import/reload/export/reimport retains canonical model. Cold recovery is covered separately above. Include duplicate attachment metadata ids as well as duplicate payload ids. Mock the existing network/module transport boundary around actual githubSync entry points where needed; calling only runSync with a fake installer is not proof of real installation wiring. _(proof: practice information replacement doors reject invalid data before database or blob replacement)_
- [ ] **ac-5** — C5. Disposable exact-baseline v12 app and new v13 app: export full v12 fixture with a real small attachment, upgrade/import it, export v13, prove old app refuses v13 without altering bytes, then restore the retained v12 export and open/read the attachment. A post-upgrade test block exists only in the retained v13 export, making rollback limitations explicit. No checked-in old app bundle or real owner data modification. _(proof: practice information rollback restores the original backup without pretending to downgrade new history)_
- [ ] **ac-6** — A2. Render real Item Detail and Active at desktop/390px. Edit the same notebook while running and paused, with timer ticks, offline mode, navigation, Finish/return and Discard; verify notes survive and active clock identifiers/running/elapsed semantics, blocks/reviews/sr state stay unchanged by editing. Clear notes and reload; no resurrection. Inspect actual IndexedDB acknowledgement, not a sleep. Reject a storage write through the real storage seam and verify text remains visible with retry/copy and no false Saved state. _(proof: working notes persist across practice navigation without controlling the clock)_
- [ ] **ac-7** — A2/A3. Render a bound routine, edit item A while time naturally crosses to B, also exercise Skip, unbound and missing-item segments. Notes never land on the wrong item; routine elapsed/allocation/signals keep existing behaviour and no extra blocks appear. Also switch Item Detail route A to B and replace same-id data while the app is running: a stale editor must not overwrite new content on blur. Test Farsi and English text. _(proof: working note editors retain item ownership across routine and database changes)_
- [ ] **ac-8** — A4. Real Active to Close to next Active journey: distinct notebook, scratch Observation, Next time and lesson Question; choose result and close, inspect persisted records, reload, inspect older block history via disclosure and next-session previous decision. Notebook is not overwritten by reflection; questions stay independent and do not change preparation. Empty later nextAction preserves earlier non-empty choice. Deliberate unlogged close preserves schedule; Close across a local-day change retains authored text while refreshing the existing decision. _(proof: practice reflection keeps notebook observation next action and question distinct)_
- [ ] **ac-9** — A5/A6. Pure consumer cases plus rendered/exported teacher sheet: later block results and current notes/status change after a selected historical period; period result statements stay based on in-range blocks, current sections are labelled, and no unproved improvement is inferred from absolute ranks. Question output retains targets/asked answers and latest-observation date but never dumps Working notes as Problem or rewrites past answers. Include no-block/unlogged/older-observation cases and ordinary/DST local date boundaries for the selected report period. _(proof: practice summaries separate recorded period evidence from current context)_
- [ ] **ac-10** — B1-B4. Drive full item create/edit and Start with all retained status/result/mode/focus enums represented in a definition table; verify default summaries, reachable optional controls, accessible names, distinct descriptions, retained rating values and title-only quick add. Pin representative priority, urgency-factor, warm-up eligibility and scheduling outputs against current fixtures, including 1/3/5 effort/priority and Same versus Worse. A label change may not alter stored codes, weights, defaults or status transition behaviour. Include a new-status item with real blocks versus a truly untouched catalogue addition: wording is honest in both, with no automatic status or history mutation. _(proof: clarified practice choices preserve existing defaults and decision inputs)_
- [ ] **ac-11** — D1/D2. Pure administrative transition matrix: auto/user/unknown provenance; auto/manual/interval mode; future/due/past/no date; zero/matching/multiple agreeing/conflicting open rows; missing item; repeated execution. Retain pending date, normalise only explicit authority, preserve every sr/stat/block/completed-review fact. Restore missing reminder only when an item date exists; refuse ambiguous pending dates; no-date transfer stays unscheduled. Review today is separate and records no result. _(proof: automatic review ownership transfer preserves dates without inventing evidence)_
- [ ] **ac-12** — D3. Real Item Detail and full edit form: explicit transfer on already-auto custom/snoozed/unknown date, actual manual/interval to auto transition, and unrelated save while already auto. Assert identical intended outcomes and protected-date preservation on unrelated saves through live and persisted state after reload. Reopen/switch items/external live update while panel exists to rule out stale captured dates. Conflicting rows show actionable refusal; no-date auto remains unscheduled until explicit Review today. Button explanation never calls the retained date a new engine calculation. _(proof: review ownership controls distinguish explicit transfer from ordinary item edits)_
- [ ] **ac-13** — D4. Real UI transfer future custom date, then actual practice early with Same, positive and Worse in isolated scenarios; assert persisted due rows/item date, no early spacing expansion and repair only after worse. Change custom date/snooze/Schedule again re-establishes user protection. Exercise due eligible close, No, unanswered/unlogged and repeated same-day eligible close. Let browser clock cross local midnight before Review today or a displayed date action, without synthetic visibility events, and check displayed/saved date and Today/Close explanations. _(proof: released review dates obey the shipped early practice and local day rules)_
- [ ] **ac-14** — E1. Render changed note, item-form, Start, Close, routine-note, history and question-context surfaces at 390x844 and desktop in Chromium and WebKit. Install the matching existing Playwright browser binaries during setup if needed; do not silently skip an engine or report a skipped layout case as passing. Use Farsi, English, mixed paragraphs, opposite-language titles and long text. Assert own accessible names, selected states, keyboard activation, visible focus and actual text/ordinal bounding positions, no clipping/overlap/horizontal overflow, minimum editable font size and reduced-motion behaviour. This is browser rendering proof, not a claim to reproduce a physical iPhone keyboard; do not replace it with source regex. _(proof: practice information controls render accessible directional text at phone and desktop widths)_
- [ ] **ac-15** — OWNER subjective usability on the actual iPhone and Mac: a normal start stays under 30 seconds and close under 60; reading/editing Working notes during ordinary and bound-routine practice remains calm, clearly separate from block observation, and controls remain reachable with the keyboard. Verify understandable status/result/rating definitions and the retained-date automatic explanation. Record actual Farsi/English observations. Known residual shell/Safari symptom is separately diagnosed, not silently declared fixed and not cured with an untested timeout. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/store/useStore.ts, src/domain/scheduling.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx, src/store/backup.ts
- **practise-todays-recommendation** — touched via src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/domain/io.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts, src/domain/types.ts, src/pages/CloseBlock.tsx, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/backup.ts, src/store/idb.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts, src/domain/scheduling.ts matched changed file(s) src/domain/scheduling.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/store/useStore.ts matched changed file(s) src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx, src/store/backup.ts matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx, src/store/backup.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts matched changed file(s) src/domain/blocks.ts, src/domain/scheduling.ts, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/StartBlock.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts matched changed file(s) src/domain/io.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260916-keep-useful-practice-information-clear-f-2e1e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
