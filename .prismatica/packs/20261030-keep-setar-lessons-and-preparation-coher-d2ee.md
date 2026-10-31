---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractHash: 93e75f191f4fc48917ff1544c3b0fa7a01dcd524491910e7efa0194c5c0581e5
createdAt: 2026-10-30T22:18:59.718Z
skills:
  - ui-work
  - build
  - simplify
---

# Build brief: Keep Setar lessons and preparation coherent from archive to next class

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/60
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20261030-keep-setar-lessons-and-preparation-coher-d2ee

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Keep Setar lessons and preparation coherent from archive to next class

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Make the Setar lesson lifecycle reliable as one coherent lane: NAS archive, scanner and published index, Refresh, Lessons, and preparation for the next class. Builder: claude. Diagnose the real causes using the supplied screenshots, PIECES.csv, setar-index.json, run-setar-index.sh, current code/history/Flows/DECISIONS/tests and read-only NAS inspection before implementing. Correct sessions 40/41, reconcile the duplicate Class 41 into one lesson without losing user-authored information, and make future class preparation work before any media exists. Choose the narrowest economical identity/reconciliation and source-of-truth design, then sweep every consumer. Make ongoing new-piece, roster and rename maintenance guided and reliable, with actionable Refresh messages. The builder is authorised to carry out necessary conservative, reversible NAS metadata/configuration/runtime/index repairs itself: inspect exact paths and effective configuration first, preserve/version small metadata and config privately, use dry runs and scratch output, preserve all media and app data, prove the published index before importing it, and document rollback. Do not delegate required NAS edits to the owner. Preserve notes, questions and answers, commitments, practice/history, schedules and retention, attachment metadata and bytes, offline data, sync decisions and deliberate archive suppressions. Refresh and reconciliation must remain idempotent across repeated refresh, reload and compatible sync. Include only directly related lifecycle defects. Fix long-open practice audio recovery and the load-sensitive CI test assertion only where current evidence supports a small repair. Settle shared rules before implementation, use a small number of realistic source-to-index-to-store/browser behaviour-family checks, and reserve owner acceptance for physical-device results automation cannot establish. Reviewer blockers must be reproducible reachable contract violations or attributable regressions; consolidate shared causes and exclude taste, speculative states, preferred architecture and unrelated pre-existing defects. Revalidate the final import-ready plan; do not implement or import it in this planning session. Final clarifications: create a future lesson in Compass as soon as its date is known, with commitments/questions before media; do not require or recommend an empty future NAS folder. After the lesson happens, create the normal session-N-DD-MM-YYYY folder and add recording/materials; the scheduled scanner discovers supported files and publishes, then Refresh offers/binds that session to the existing lesson, idempotently. Normal maintenance must not require hand-editing PIECES.csv or RENAME-LOG.csv: the guided route asks only for facts that cannot safely be inferred and, once confirmed, performs safe edits, rollback copies, validation and publication itself. Correctly named supported material for an existing registered piece needs only adding to the correct session folder; unsupported types/forms must be surfaced clearly. Filenames never silently invent musical identities. Preserve the Session 40 stacked-role diagnosis and exact rename provenance unless implementation evidence disproves it. Give source/index, reconciliation, future-class UI, persistence/sync, audio and CI distinct acceptance responsibilities, removing duplicate assertions while retaining all substantive coverage and reviewer-blocker rules. Keep all other settled architecture and NAS decisions.

## Why

This is an existing lesson journey with three connected boundaries: declared source identity, binding that source to an app-owned lesson, and preserving that lesson as preparation becomes history. Repairing only the CSV or hiding the duplicate would leave the lifecycle failure intact. Retain the existing small published-index transport and canonical registry; remove manual CSV editing from the normal maintenance interface with one guided operator route rather than adding a service or another source of truth.

## Today

Verified at clean main 7c9e8e4. The downloaded CSV and index byte hashes match the NAS runtime inputs/output; all three deployed runtime scripts match this checkout. A read-only scan of the mounted archive reproduces contentHash 0e268c0441060cc1dd8aaa4fc7288405140856793b80da7c3bcbda00a89d9c6e. The production wrapper reads PC_ARCHIVE_ROOT from its protected runtime config and PIECES.csv/RENAME-LOG.csv under that root, in the SNDK/video-courses/setar-classes tree mirrored on Sandisk. The Downloads files are evidence copies, not a second authority. Session 41's named demonstration is absent because its exact key is genuinely unregistered. Session 40 already has the two correct canonical rows and session-40 memberships; parseAssetStem correctly reads the compound role تمرین-من, leaving نت-چهارمضراب-چهارگاه-عبادی as the alleged piece in the malformed filename. That false key also invalidates the roster for the unnamed demonstration. Do not add a bogus registry identity or strip nested roles heuristically. The scanner inventories files, so an empty session-42-24-11-2026 folder contributes no session. Add a class already creates a future app Lesson without media. planArchiveImport auto-adopts only instrument+date+number+source-path evidence, creates another lesson when the manual preparation has no reference, and skips a session entirely once a binding exists. The owner's exported schema-17 backup confirms two Class 41 rows for 2026-10-27: the manual row carries two item links, two preparations and two open questions; the archive row has no authored notes, item links, recordings, agenda or attachments. Its recording is composed from the source graph, not stored in Lesson.recordings. DECISIONS 2026-09-17 deliberately rejects number-only matching and prevents archive-only historical imports becoming future deadlines. The log-a-class Flow still mentions the obsolete bundled importer and next-class toggle. NAS task id 3 is enabled, owned by setar-indexer, and invokes the expected wrapper, but its repetition ends at 00:45: it runs four times around midnight, not every 15 minutes all day. Runtime/config modes are 777 with inherited ACL access including group http; assess effective access and narrow only this job's files. Existing audio code already renews contexts on practice Start/Resume/Test, but SoundNote hides recovery whenever state is ready, Settings disables Test when unavailable, and metronome Start reuses a running context. A falsely running silent context has no practice-screen recovery tap. ci-browser-setup.test.ts still requires routed.ms < 3500 with a 2-second hung probe despite real routing assertions; scheduler/process overhead can fail that inequality. No current hardware audio failure or loaded CI failure was reproduced during planning.

## Instead

Shared decisions, settled before implementation:
1. One real lesson has one app record. Source identity stays (archiveId, sessionN), scoped to the archive's instrument; its source date helps find candidates but is not a second mutable lesson identity. Existing bindings and deliberate separate/skip decisions win. Keep deterministic IDs for genuinely new archive lessons; adopting an existing owner lesson keeps that lesson's ID. Exact path evidence may still auto-adopt uniquely. Same instrument/date/number without paths must produce a clear match proposal instead of silently creating a competing lesson. Number alone, date alone, another instrument, another date/year, multiple candidates or a stale premise never auto-merge. Also examine an already-bound session for the existing manual counterpart, rather than skipping the reconciliation opportunity. A deliberate Keep separate is durable and stops repeated prompts.
2. Provide a supported consolidation for the known Class 41 pair and the same reachable family. Prefer the existing owner lesson as survivor to minimise reference rewrites. Transfer the source binding and retain composed archive files; combine all authored information without last-write-wins loss. Preserve both distinct notes if both exist, explicit item links, agenda entry IDs/text/asked state/answers/targets, references with their authored metadata, attachment IDs and bytes and any lesson references actually found by the consumer sweep. Never call ordinary deleteLesson to perform consolidation: that deletes attachments, detaches agenda and writes a session suppression. Consolidation must not mean a deletion/restore cycle. Resolve genuine conflicts visibly before a write; do not merge weakly matched records automatically or copy questions to another class. Account for live notes/question capture and pending recovery drafts on either record, interrupted/failed persistence, rebase and retry. Use existing durability primitives; either preserve/resolve the affected draft or refuse visibly with its words retained. Do not create a general-purpose merge engine. The owner has already identified the current pair as the same lesson; deliver the actual repair path, not instructions to delete a row manually.
3. The normal owner workflow is explicit: (a) as soon as its date is known, create the future lesson in Compass through the existing offline Add a class path, then add commitments/questions before any archive folder or media exists; (b) do not require or recommend empty future NAS folders, dummy media, prior publication or recurring scheduling; (c) when the lesson later happens, create its normal session-N-DD-MM-YYYY folder and add the class recording/materials; (d) the scheduled NAS scanner automatically discovers supported material and publishes the index; (e) Refresh offers/binds that archive session to the existing Compass lesson through the identity rules above instead of creating a duplicate; (f) unchanged scans and repeated Refresh are idempotent. Class 42 is 2026-11-24, number 42; leave the existing empty folder harmless. Separate source provenance from scheduling intent: binding source material to an explicitly planned lesson must not itself remove its legitimate upcoming status if its date is still ahead; a newly imported archive-only history lesson stays historical even with a misleading future device date. After the class date passes its commitments/questions remain historical on that same lesson, never automatically carried forward. Sweep nextLessonFor, defaultTargetLesson, preparationDatesByItem, requiredClassWork, scoring/recommendations/plans, capture guards, Lessons badges and Teacher report so every reader agrees.
4. Keep PIECES.csv and the exact append-only rename log beside the production archive as the single source of canonical piece/roster and rename facts. They are adequate for 106 current identities and the existing validated publisher; moving them creates another synchronisation boundary without solving the demonstrated failures. Retain byte-exact canonical keys and search-only aliases. Provide ONE small guided, preview-first operator maintenance route over these existing declarations, reusing the scanner's grammar, CSV reader and validation. It should name normal actions such as register a genuinely new piece, confirm what a class taught, or record/correct one exact filename rename. Normal maintenance must never require the owner to hand-edit PIECES.csv or RENAME-LOG.csv. Once the owner confirms the facts and preview, this route performs the mechanical registry/rename changes, private rollback copy, validation, scratch scan and publication itself; it must not stop at CSV draft rows, editing instructions or a request to run the NAS job separately. A failed publish leaves the last good published index in place and a clear safe retry using the retained repair state. Ask only for facts that cannot be inferred safely, show an existing-piece/filename mistake as a different action from a new identity, preserve extra CSV columns and unrelated rows, detect stale previews/concurrent edits, take a private rollback copy before applying and make repeat execution a no-op. For ordinary correctly named supported material belonging to an already registered piece, adding the file to the correct session folder is the only owner action: no metadata step. Automatically discover/index the normal supported Setar lesson types and naming forms, including the current .mp4, .pdf and .jpg contract; check the real inventory for any further ordinary forms rather than promising an unverified format list. Surface any unsupported type or naming form with its relative path and a plain next action, never silently omit it or require scanner-internal knowledge. Keep all existing role and attribution limits, especially the deliberate exclusion of personal practice takes. A filename alone must never silently establish a new musical identity. Do not infer an unnamed demonstration's attribution from filenames. Avoid a second registry, browser filesystem dependence, app NAS writes, crawling, new backend, or a general file manager. Claude chooses the CLI/prompt/input structure and bounded implementation details. Refresh must distinguish malformed naming, unregistered identity, unconfirmed roster, deliberate suppression, and publication failure/delay; give exact relative file/session context and a clear next action through that route, with technical filenames relegated to details. Unsupported/unregistered source material must not be silently misattributed or fabricated as practice. Keep verified existing files usable and explain why any excluded file needs action. Fetch/accept/change times must be labelled by what is actually known, never claimed as a recent successful scan.
5. Claude performs the real NAS repair, not just fixture edits: re-read the task/config and resolve real paths/symlinks and the Drive pairing; back up affected small declarations, runtime/config and task definition privately with modes/ACLs; register پیش-درامد-ابوعطا-لطفی for session 41 with only supported facts (musical fields may remain blank); preserve the Session 40 diagnosis unless implementation evidence disproves it: تمرین-من-نت-چهارمضراب-چهارگاه-عبادی.mp4 stacks role-like prefixes, and its intended registered identity is چهارمضراب-چهارگاه-عبادی. Correct that exact archive filename conservatively, preserving its bytes and adding the precise rename continuation, or use an equally exact non-destructive declared repair if demonstrated safer. Do not create a canonical نت-prefixed duplicate. Confirm the current session-40 roster now permits its unnamed demo attribution; personal practice takes must never become shared lesson/item resources. Do not remove/recreate session 42. Correct the existing task to run throughout the day at a modest interval, default 15 minutes, and verify its actual generated schedule/next trigger. Narrow effective access to the job's existing token-bearing config/runtime, including inherited ACLs, while preserving the task's required access and existing credentials; no unrelated NAS permission sweep. Use a scratch scan and attention report first. Deploy any required compatible app reader before a changed index format, update runtime files together only if changed, run the real job as its intended account, verify the commit-pinned published index through the app decoder, and compare expected sessions/resources/rosters/diagnostics and media preservation BEFORE any Compass import. A second run should make no source-index commit when semantics are unchanged. Collect redacted real-operation evidence and rollback instructions; preserve credentials and actual archive-root paths outside committed docs, fixtures, logs and app data. Roll back metadata/task/runtime using the saved copies and republish the previous validated semantic index with a new commit, not destructive history rewriting. No broad deletion, destructive mirroring, speculative bulk renames, or data-repo main writes by the publisher.
6. Keep the two economical companions bounded. Verify current sound callers and tests; expose a retry/recovery gesture when output is silent despite ready, and after a transient unavailable state, using the existing fresh-in-gesture context mechanism. Inspect metronome Start's reuse only within this same recovery path. No sound detection, audio analysis, automatic background recovery, queued old cues or promise of audibility; clocks, marker claims, metronome ownership and recorded minutes remain intact. Replace the CI harness's loaded-machine speed race with behavioural proof of per-probe curl bounds, correct routing/failure and a generous finite deadlock guard. Retain actual workflow/install/probe safeguards, healthy/dead/slow mirror cases and both browser engines; no production CI timeout increase, skip, retry-until-green or weakening real routing assertions.
Delivery checklist and next three actions: [1, highest leverage] write the short identity/ownership/consumer matrix and independent fixture expectations in docs/setar-lesson-lifecycle.md before code; [2] implement the shared reconciliation/maintenance boundary and its focused source-to-store proof; [3] complete safe live NAS repair/publication verification and the two-engine user journeys, then prepare one consolidated review. Keep structure and UI details at Claude's discretion. The family proof document must map each invariant to every producer/consumer, state the equivalence classes and their interactions (source known/unknown/malformed; bound/unbound/duplicate/separate/suppressed; planned/historical; stable/stale/in-flight; saved/failed/reloaded/synced), and list independently derived expected identities, references, text and bytes. Put the new pipeline/reconciliation family tests in tests/setar-lifecycle.test.ts, the two new visible/boundary families in tests/setar-lifecycle.browser.test.ts, and the operator family in tests/setar-maintenance.test.ts. Each acceptance title occurs exactly once, with state/engine matrices inside it. Acceptance ownership is explicit: source/index owns sessions 40/41 and the empty-42 negative boundary; reconciliation owns the full Class 41 consolidation and preservation matrix plus its decision UI; future-class UI owns app-created Class 42 and later real session-42 binding; persistence/sync owns already-reconciled state across durable boundaries; maintenance owns operator mutation/publication/rollback; audio and CI own their existing bounded concerns. Reuse the independent fixture expectations between families without repeating another family's full scenario or preservation assertions. Boundary handovers get only the minimal assertion needed to prove the next consumer received the correct state; do not remove substantive coverage or turn tests into order-dependent suites. Add one focused browser companion for reconciliation UI only, named exactly "setar duplicate lesson repair exposes the same reconciliation decision in both browsers", in tests/setar-lifecycle.browser.test.ts; do not repeat its full preservation matrix in the future-class browser family. Use one focused reproducible route: npx vitest run tests/setar-lifecycle.test.ts tests/setar-lifecycle.browser.test.ts tests/setar-maintenance.test.ts tests/practice-cues.browser.test.ts tests/ci-browser-setup.test.ts, with the exact acceptance titles and any existing companions identified by name; do not add a new framework or broad mutation campaign. Run the repository's required lint, tests and build once after fixes, then repeat only where changes or failures warrant. The document must distinguish synthetic transport/AudioContext/clock proof from live NAS operation and physical-device output. Before the first review, sweep every identified consumer and record both changed and checked-clean paths, not only the diff. Reviewer blockers must state the reachable setup, reproduction, expected invariant, observed violation and attributable cause; report all sibling manifestations of a shared cause together. Reopen only for another reachable in-contract failure or attributable regression; do not trade semantic proof for a green test title. Update affected Flow truth/mechanics through the governed proposal protocol, particularly log-a-class and prepare-for-the-next-class, without hand-editing approvals.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- The exported 2026-10-30 MacBook backup is evidence of the reported pair, not permission to overwrite newer production data; re-read and validate the current state at repair time.
- Existing NAS authentication supplied by the owner or the authenticated DSM session is used privately. Never copy credentials into the plan, issue, contract, repo, fixtures or logs. Necessary NAS edits are builder work, not an owner acceptance task.

**Possible conflicts**

- Existing sourceReconcile tests intentionally expect same-date/number pathless lessons to create a second row; replace that expectation with a visible identity decision while retaining the real Class 38 different-date counterexample and explicit separate/skip semantics.
- Existing docs say only the owner edits metadata and describe midnight scheduling as roughly every 15 minutes. The owner now explicitly authorises conservative builder metadata/config/index repairs and a safe guided maintenance tool. Reconcile those statements in place, including any directly affected AGENTS rule, without weakening scanner read-only behaviour. The current AGENTS history/ownership wording must distinguish archive-only imports from source binding to an owner-planned lesson; amend the exact affected current rule in place and keep its byte budget.
- Attaching an archive source currently forces origin=archive. Preserve the history guard for archive-only records while preventing provenance alone from cancelling an owner-planned future class. If the chosen durable representation changes the schema, bump it and migrate/validate every inbound door with no clock-dependent guessing.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Make the Setar lesson lifecycle reliable as one coherent lane: NAS archive, scanner and published index, Refresh, Lessons, and preparation for the next class. Builder: claude. Diagnose the real causes using the supplied screenshots, PIECES.csv, setar-index.json, run-setar-index.sh, current code/history/Flows/DECISIONS/tests and read-only NAS inspection before implementing. Correct sessions 40/41, reconcile the duplicate Class 41 into one lesson without losing user-authored information, and make future class preparation work before any media exists. Choose the narrowest economical identity/reconciliation and source-of-truth design, then sweep every consumer. Make ongoing new-piece, roster and rename maintenance guided and reliable, with actionable Refresh messages. The builder is authorised to carry out necessary conservative, reversible NAS metadata/configuration/runtime/index repairs itself: inspect exact paths and effective configuration first, preserve/version small metadata and config privately, use dry runs and scratch output, preserve all media and app data, prove the published index before importing it, and document rollback. Do not delegate required NAS edits to the owner. Preserve notes, questions and answers, commitments, practice/history, schedules and retention, attachment metadata and bytes, offline data, sync decisions and deliberate archive suppressions. Refresh and reconciliation must remain idempotent across repeated refresh, reload and compatible sync. Include only directly related lifecycle defects. Fix long-open practice audio recovery and the load-sensitive CI test assertion only where current evidence supports a small repair. Settle shared rules before implementation, use a small number of realistic source-to-index-to-store/browser behaviour-family checks, and reserve owner acceptance for physical-device results automation cannot establish. Reviewer blockers must be reproducible reachable contract violations or attributable regressions; consolidate shared causes and exclude taste, speculative states, preferred architecture and unrelated pre-existing defects. Revalidate the final import-ready plan; do not implement or import it in this planning session. Final clarifications: create a future lesson in Compass as soon as its date is known, with commitments/questions before media; do not require or recommend an empty future NAS folder. After the lesson happens, create the normal session-N-DD-MM-YYYY folder and add recording/materials; the scheduled scanner discovers supported files and publishes, then Refresh offers/binds that session to the existing lesson, idempotently. Normal maintenance must not require hand-editing PIECES.csv or RENAME-LOG.csv: the guided route asks only for facts that cannot safely be inferred and, once confirmed, performs safe edits, rollback copies, validation and publication itself. Correctly named supported material for an existing registered piece needs only adding to the correct session folder; unsupported types/forms must be surfaced clearly. Filenames never silently invent musical identities. Preserve the Session 40 stacked-role diagnosis and exact rename provenance unless implementation evidence disproves it. Give source/index, reconciliation, future-class UI, persistence/sync, audio and CI distinct acceptance responsibilities, removing duplicate assertions while retaining all substantive coverage and reviewer-blocker rules. Keep all other settled architecture and NAS decisions.",
  "builder": "claude",
  "summary": "Keep Setar lessons and preparation coherent from archive to next class",
  "rationale": "This is an existing lesson journey with three connected boundaries: declared source identity, binding that source to an app-owned lesson, and preserving that lesson as preparation becomes history. Repairing only the CSV or hiding the duplicate would leave the lifecycle failure intact. Retain the existing small published-index transport and canonical registry; remove manual CSV editing from the normal maintenance interface with one guided operator route rather than adding a service or another source of truth.",
  "kind": "existing-flow",
  "flowId": "log-a-class",
  "currentBehaviour": "Verified at clean main 7c9e8e4. The downloaded CSV and index byte hashes match the NAS runtime inputs/output; all three deployed runtime scripts match this checkout. A read-only scan of the mounted archive reproduces contentHash 0e268c0441060cc1dd8aaa4fc7288405140856793b80da7c3bcbda00a89d9c6e. The production wrapper reads PC_ARCHIVE_ROOT from its protected runtime config and PIECES.csv/RENAME-LOG.csv under that root, in the SNDK/video-courses/setar-classes tree mirrored on Sandisk. The Downloads files are evidence copies, not a second authority. Session 41's named demonstration is absent because its exact key is genuinely unregistered. Session 40 already has the two correct canonical rows and session-40 memberships; parseAssetStem correctly reads the compound role تمرین-من, leaving نت-چهارمضراب-چهارگاه-عبادی as the alleged piece in the malformed filename. That false key also invalidates the roster for the unnamed demonstration. Do not add a bogus registry identity or strip nested roles heuristically. The scanner inventories files, so an empty session-42-24-11-2026 folder contributes no session. Add a class already creates a future app Lesson without media. planArchiveImport auto-adopts only instrument+date+number+source-path evidence, creates another lesson when the manual preparation has no reference, and skips a session entirely once a binding exists. The owner's exported schema-17 backup confirms two Class 41 rows for 2026-10-27: the manual row carries two item links, two preparations and two open questions; the archive row has no authored notes, item links, recordings, agenda or attachments. Its recording is composed from the source graph, not stored in Lesson.recordings. DECISIONS 2026-09-17 deliberately rejects number-only matching and prevents archive-only historical imports becoming future deadlines. The log-a-class Flow still mentions the obsolete bundled importer and next-class toggle. NAS task id 3 is enabled, owned by setar-indexer, and invokes the expected wrapper, but its repetition ends at 00:45: it runs four times around midnight, not every 15 minutes all day. Runtime/config modes are 777 with inherited ACL access including group http; assess effective access and narrow only this job's files. Existing audio code already renews contexts on practice Start/Resume/Test, but SoundNote hides recovery whenever state is ready, Settings disables Test when unavailable, and metronome Start reuses a running context. A falsely running silent context has no practice-screen recovery tap. ci-browser-setup.test.ts still requires routed.ms < 3500 with a 2-second hung probe despite real routing assertions; scheduler/process overhead can fail that inequality. No current hardware audio failure or loaded CI failure was reproduced during planning.",
  "desiredBehaviour": "Shared decisions, settled before implementation:\n1. One real lesson has one app record. Source identity stays (archiveId, sessionN), scoped to the archive's instrument; its source date helps find candidates but is not a second mutable lesson identity. Existing bindings and deliberate separate/skip decisions win. Keep deterministic IDs for genuinely new archive lessons; adopting an existing owner lesson keeps that lesson's ID. Exact path evidence may still auto-adopt uniquely. Same instrument/date/number without paths must produce a clear match proposal instead of silently creating a competing lesson. Number alone, date alone, another instrument, another date/year, multiple candidates or a stale premise never auto-merge. Also examine an already-bound session for the existing manual counterpart, rather than skipping the reconciliation opportunity. A deliberate Keep separate is durable and stops repeated prompts.\n2. Provide a supported consolidation for the known Class 41 pair and the same reachable family. Prefer the existing owner lesson as survivor to minimise reference rewrites. Transfer the source binding and retain composed archive files; combine all authored information without last-write-wins loss. Preserve both distinct notes if both exist, explicit item links, agenda entry IDs/text/asked state/answers/targets, references with their authored metadata, attachment IDs and bytes and any lesson references actually found by the consumer sweep. Never call ordinary deleteLesson to perform consolidation: that deletes attachments, detaches agenda and writes a session suppression. Consolidation must not mean a deletion/restore cycle. Resolve genuine conflicts visibly before a write; do not merge weakly matched records automatically or copy questions to another class. Account for live notes/question capture and pending recovery drafts on either record, interrupted/failed persistence, rebase and retry. Use existing durability primitives; either preserve/resolve the affected draft or refuse visibly with its words retained. Do not create a general-purpose merge engine. The owner has already identified the current pair as the same lesson; deliver the actual repair path, not instructions to delete a row manually.\n3. The normal owner workflow is explicit: (a) as soon as its date is known, create the future lesson in Compass through the existing offline Add a class path, then add commitments/questions before any archive folder or media exists; (b) do not require or recommend empty future NAS folders, dummy media, prior publication or recurring scheduling; (c) when the lesson later happens, create its normal session-N-DD-MM-YYYY folder and add the class recording/materials; (d) the scheduled NAS scanner automatically discovers supported material and publishes the index; (e) Refresh offers/binds that archive session to the existing Compass lesson through the identity rules above instead of creating a duplicate; (f) unchanged scans and repeated Refresh are idempotent. Class 42 is 2026-11-24, number 42; leave the existing empty folder harmless. Separate source provenance from scheduling intent: binding source material to an explicitly planned lesson must not itself remove its legitimate upcoming status if its date is still ahead; a newly imported archive-only history lesson stays historical even with a misleading future device date. After the class date passes its commitments/questions remain historical on that same lesson, never automatically carried forward. Sweep nextLessonFor, defaultTargetLesson, preparationDatesByItem, requiredClassWork, scoring/recommendations/plans, capture guards, Lessons badges and Teacher report so every reader agrees.\n4. Keep PIECES.csv and the exact append-only rename log beside the production archive as the single source of canonical piece/roster and rename facts. They are adequate for 106 current identities and the existing validated publisher; moving them creates another synchronisation boundary without solving the demonstrated failures. Retain byte-exact canonical keys and search-only aliases. Provide ONE small guided, preview-first operator maintenance route over these existing declarations, reusing the scanner's grammar, CSV reader and validation. It should name normal actions such as register a genuinely new piece, confirm what a class taught, or record/correct one exact filename rename. Normal maintenance must never require the owner to hand-edit PIECES.csv or RENAME-LOG.csv. Once the owner confirms the facts and preview, this route performs the mechanical registry/rename changes, private rollback copy, validation, scratch scan and publication itself; it must not stop at CSV draft rows, editing instructions or a request to run the NAS job separately. A failed publish leaves the last good published index in place and a clear safe retry using the retained repair state. Ask only for facts that cannot be inferred safely, show an existing-piece/filename mistake as a different action from a new identity, preserve extra CSV columns and unrelated rows, detect stale previews/concurrent edits, take a private rollback copy before applying and make repeat execution a no-op. For ordinary correctly named supported material belonging to an already registered piece, adding the file to the correct session folder is the only owner action: no metadata step. Automatically discover/index the normal supported Setar lesson types and naming forms, including the current .mp4, .pdf and .jpg contract; check the real inventory for any further ordinary forms rather than promising an unverified format list. Surface any unsupported type or naming form with its relative path and a plain next action, never silently omit it or require scanner-internal knowledge. Keep all existing role and attribution limits, especially the deliberate exclusion of personal practice takes. A filename alone must never silently establish a new musical identity. Do not infer an unnamed demonstration's attribution from filenames. Avoid a second registry, browser filesystem dependence, app NAS writes, crawling, new backend, or a general file manager. Claude chooses the CLI/prompt/input structure and bounded implementation details. Refresh must distinguish malformed naming, unregistered identity, unconfirmed roster, deliberate suppression, and publication failure/delay; give exact relative file/session context and a clear next action through that route, with technical filenames relegated to details. Unsupported/unregistered source material must not be silently misattributed or fabricated as practice. Keep verified existing files usable and explain why any excluded file needs action. Fetch/accept/change times must be labelled by what is actually known, never claimed as a recent successful scan.\n5. Claude performs the real NAS repair, not just fixture edits: re-read the task/config and resolve real paths/symlinks and the Drive pairing; back up affected small declarations, runtime/config and task definition privately with modes/ACLs; register پیش-درامد-ابوعطا-لطفی for session 41 with only supported facts (musical fields may remain blank); preserve the Session 40 diagnosis unless implementation evidence disproves it: تمرین-من-نت-چهارمضراب-چهارگاه-عبادی.mp4 stacks role-like prefixes, and its intended registered identity is چهارمضراب-چهارگاه-عبادی. Correct that exact archive filename conservatively, preserving its bytes and adding the precise rename continuation, or use an equally exact non-destructive declared repair if demonstrated safer. Do not create a canonical نت-prefixed duplicate. Confirm the current session-40 roster now permits its unnamed demo attribution; personal practice takes must never become shared lesson/item resources. Do not remove/recreate session 42. Correct the existing task to run throughout the day at a modest interval, default 15 minutes, and verify its actual generated schedule/next trigger. Narrow effective access to the job's existing token-bearing config/runtime, including inherited ACLs, while preserving the task's required access and existing credentials; no unrelated NAS permission sweep. Use a scratch scan and attention report first. Deploy any required compatible app reader before a changed index format, update runtime files together only if changed, run the real job as its intended account, verify the commit-pinned published index through the app decoder, and compare expected sessions/resources/rosters/diagnostics and media preservation BEFORE any Compass import. A second run should make no source-index commit when semantics are unchanged. Collect redacted real-operation evidence and rollback instructions; preserve credentials and actual archive-root paths outside committed docs, fixtures, logs and app data. Roll back metadata/task/runtime using the saved copies and republish the previous validated semantic index with a new commit, not destructive history rewriting. No broad deletion, destructive mirroring, speculative bulk renames, or data-repo main writes by the publisher.\n6. Keep the two economical companions bounded. Verify current sound callers and tests; expose a retry/recovery gesture when output is silent despite ready, and after a transient unavailable state, using the existing fresh-in-gesture context mechanism. Inspect metronome Start's reuse only within this same recovery path. No sound detection, audio analysis, automatic background recovery, queued old cues or promise of audibility; clocks, marker claims, metronome ownership and recorded minutes remain intact. Replace the CI harness's loaded-machine speed race with behavioural proof of per-probe curl bounds, correct routing/failure and a generous finite deadlock guard. Retain actual workflow/install/probe safeguards, healthy/dead/slow mirror cases and both browser engines; no production CI timeout increase, skip, retry-until-green or weakening real routing assertions.\nDelivery checklist and next three actions: [1, highest leverage] write the short identity/ownership/consumer matrix and independent fixture expectations in docs/setar-lesson-lifecycle.md before code; [2] implement the shared reconciliation/maintenance boundary and its focused source-to-store proof; [3] complete safe live NAS repair/publication verification and the two-engine user journeys, then prepare one consolidated review. Keep structure and UI details at Claude's discretion. The family proof document must map each invariant to every producer/consumer, state the equivalence classes and their interactions (source known/unknown/malformed; bound/unbound/duplicate/separate/suppressed; planned/historical; stable/stale/in-flight; saved/failed/reloaded/synced), and list independently derived expected identities, references, text and bytes. Put the new pipeline/reconciliation family tests in tests/setar-lifecycle.test.ts, the two new visible/boundary families in tests/setar-lifecycle.browser.test.ts, and the operator family in tests/setar-maintenance.test.ts. Each acceptance title occurs exactly once, with state/engine matrices inside it. Acceptance ownership is explicit: source/index owns sessions 40/41 and the empty-42 negative boundary; reconciliation owns the full Class 41 consolidation and preservation matrix plus its decision UI; future-class UI owns app-created Class 42 and later real session-42 binding; persistence/sync owns already-reconciled state across durable boundaries; maintenance owns operator mutation/publication/rollback; audio and CI own their existing bounded concerns. Reuse the independent fixture expectations between families without repeating another family's full scenario or preservation assertions. Boundary handovers get only the minimal assertion needed to prove the next consumer received the correct state; do not remove substantive coverage or turn tests into order-dependent suites. Add one focused browser companion for reconciliation UI only, named exactly \"setar duplicate lesson repair exposes the same reconciliation decision in both browsers\", in tests/setar-lifecycle.browser.test.ts; do not repeat its full preservation matrix in the future-class browser family. Use one focused reproducible route: npx vitest run tests/setar-lifecycle.test.ts tests/setar-lifecycle.browser.test.ts tests/setar-maintenance.test.ts tests/practice-cues.browser.test.ts tests/ci-browser-setup.test.ts, with the exact acceptance titles and any existing companions identified by name; do not add a new framework or broad mutation campaign. Run the repository's required lint, tests and build once after fixes, then repeat only where changes or failures warrant. The document must distinguish synthetic transport/AudioContext/clock proof from live NAS operation and physical-device output. Before the first review, sweep every identified consumer and record both changed and checked-clean paths, not only the diff. Reviewer blockers must state the reachable setup, reproduction, expected invariant, observed violation and attributable cause; report all sibling manifestations of a shared cause together. Reopen only for another reachable in-contract failure or attributable regression; do not trade semantic proof for a green test title. Update affected Flow truth/mechanics through the governed proposal protocol, particularly log-a-class and prepare-for-the-next-class, without hand-editing approvals.",
  "mustNotChange": [
    "User-authored notes and pending drafts, question text/asked history/answers, commitments and targets, explicit item links, attachment metadata and bytes, practice blocks and results, scheduling/retention provenance and statistics, unrelated instruments, active clock/plan/routine, sync conflict/archive protections and offline operation must survive. No whole-database replacement for reconciliation.",
    "Deliberate piece/session/link/resource suppressions, exact rename identity, registry canonical keys and source graph validation remain authoritative. Refresh never fabricates practice or clears questions, never completes a review, never treats not-described or an unreachable NAS as deleted.",
    "All media remains on the NAS with byte preservation; large-file references do not become attachments, backups or sync payloads. Keep the existing separate source-index branch and commit-pinned hash-verified fetch; no secrets in committed artefacts or source index.",
    "Keep the one-item practice loop, direction-aware mixed Farsi/English, mobile accessibility/reflow and secure-context requirements. No general scheduling, sync, schema or product redesign."
  ],
  "assumptions": [
    "The exported 2026-10-30 MacBook backup is evidence of the reported pair, not permission to overwrite newer production data; re-read and validate the current state at repair time.",
    "Existing NAS authentication supplied by the owner or the authenticated DSM session is used privately. Never copy credentials into the plan, issue, contract, repo, fixtures or logs. Necessary NAS edits are builder work, not an owner acceptance task."
  ],
  "possibleConflicts": [
    "Existing sourceReconcile tests intentionally expect same-date/number pathless lessons to create a second row; replace that expectation with a visible identity decision while retaining the real Class 38 different-date counterexample and explicit separate/skip semantics.",
    "Existing docs say only the owner edits metadata and describe midnight scheduling as roughly every 15 minutes. The owner now explicitly authorises conservative builder metadata/config/index repairs and a safe guided maintenance tool. Reconcile those statements in place, including any directly affected AGENTS rule, without weakening scanner read-only behaviour. The current AGENTS history/ownership wording must distinguish archive-only imports from source binding to an owner-planned lesson; amend the exact affected current rule in place and keep its byte budget.",
    "Attaching an archive source currently forces origin=archive. Preserve the history guard for archive-only records while preventing provenance alone from cancelling an owner-planned future class. If the chosen durable representation changes the schema, bump it and migrate/validate every inbound door with no clock-dependent guessing."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "DECISIONS.md",
      "docs/setar-archive.md",
      "docs/nas-topology.md",
      "docs/setar-practice-reliability.md",
      "docs/setar-lesson-lifecycle.md",
      "package.json",
      "scripts/run-setar-index.sh",
      "scripts/scan-setar-classes.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/setar-archive-maintenance.mjs",
      "scripts/check-setar-practice-families.mjs",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/sourceReconcile.test.ts",
      "src/domain/scanSetarClasses.test.ts",
      "src/domain/types.ts",
      "src/domain/factories.ts",
      "src/domain/lessonAgenda.ts",
      "src/domain/lessonAgenda.test.ts",
      "src/domain/lessonReconcile.ts",
      "src/domain/lessonReconcile.test.ts",
      "src/domain/selectors.ts",
      "src/domain/selectors.test.ts",
      "src/domain/questions.ts",
      "src/domain/questions.test.ts",
      "src/domain/report.ts",
      "src/domain/report.test.ts",
      "src/domain/itemFiles.ts",
      "src/domain/itemFiles.test.ts",
      "src/domain/scoring.ts",
      "src/domain/plan.ts",
      "src/domain/setarSetup.ts",
      "src/domain/setarSetup.test.ts",
      "src/domain/io.ts",
      "src/domain/io.test.ts",
      "src/domain/migrations.ts",
      "src/domain/migrations.test.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/store/notesDrafts.ts",
      "src/store/idb.ts",
      "src/store/backup.ts",
      "src/store/archiveIndex.ts",
      "src/store/archiveIndex.test.ts",
      "src/components/ArchiveRefresh.tsx",
      "src/components/LessonReconcile.tsx",
      "src/components/LessonNotes.tsx",
      "src/components/LessonAgenda.tsx",
      "src/components/ClassQuestions.tsx",
      "src/components/TeacherQuestionCapture.tsx",
      "src/components/SetarSetupReview.tsx",
      "src/components/ItemMaterial.tsx",
      "src/components/practiceCue.ts",
      "src/components/practiceCue.test.ts",
      "src/components/metronome.ts",
      "src/pages/Lessons.tsx",
      "src/pages/TeacherReport.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/Today.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/Settings.tsx",
      "src/styles/global.css",
      "tests/setar-lifecycle.test.ts",
      "tests/setar-lifecycle.browser.test.ts",
      "tests/setar-maintenance.test.ts",
      "tests/fixtures/setar-lifecycle-source.json",
      "tests/fixtures/setar-lifecycle-owner.json",
      "tests/fixtures/setar-lifecycle-expected.json",
      "tests/setarArchive.browser.test.ts",
      "tests/setarInbound.browser.test.ts",
      "tests/setar-practice-source.test.ts",
      "tests/setar-practice-inbound.browser.test.ts",
      "tests/setar-practice.browser.test.ts",
      "tests/setar-practice-proof.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/live-practice.browser.test.ts",
      "tests/practice-session.browser.test.ts",
      "tests/ci-browser-setup.test.ts",
      "src/components/direction.test.ts",
      "src/components/pressedState.test.ts",
      "src/domain/plan.test.ts",
      "src/domain/scoring.test.ts",
      "src/components/ItemNotes.tsx",
      "tests/fixtures/setar-archive.json",
      "tests/fixtures/setar-practice-source-v1.json",
      "tests/fixtures/setar-practice-source-expectations.json",
      "tests/fixtures/setar-practice-owner-v15.json",
      "tests/fixtures/setar-practice-owner-v16.json"
    ],
    "forbid": [
      ".github/workflows/**",
      "vite.config.ts",
      "package-lock.json",
      "src/store/syncEngine.ts",
      "src/domain/setarClasses.ts"
    ]
  },
  "exclusions": [
    "No general product audit, redesigned archive transport, NAS crawler/service, fingerprinting/automatic fuzzy identity, second metadata database, recurring lesson system, automatic question carry-forward or generic record merge framework.",
    "No mass media normalisation, broad NAS permissions changes, destructive sync/mirror, republishing personal backup data, production app-database overwrite or automatic whole-snapshot/per-field sync merge. External job repairs are tightly bounded operational work recorded with private rollback evidence, not absolute paths added to repository scope.",
    "No reimplementation of already-shipped audio renewal or CI routing. Change only demonstrated reachable recovery affordances and the test harness timing race; hardware sound guarantees and unrelated old defects are out of scope."
  ],
  "acceptance": [
    {
      "description": "New exact unique focused Node family, owning source/index semantics. Use sanitised committed temporary corpora independently transcribed from actual evidence, not a private backup or scanner-derived expectations. Run the real scanner, shared digest/graph decoder and publisher against a local fake Git boundary, then a thin clean-store import proving downstream source interpretation. Before repair prove session 40's existing correct registry identity versus its stacked-role filename, refused unnamed-demo attribution, session 41's genuine missing registration and excluded demo. After correction prove exact session-40 roster/attribution and session-41 recording plus correctly scoped demo, without shared personal takes or invented musical identity. An empty session-42 folder produces no indexed session, imported lesson or deadline. Cover ordinary supported types/forms discovered without metadata action, explicit unsupported/unregistered diagnostics, failed/partial inventory, exact rename-chain resolution, retained-not-described resources, corrected metadata and unchanged scan/publication rerun. Expected piece memberships and resource paths are hand-written; publisher targets stay isolated from practice data. Do not create or consolidate the duplicate Class 41 or exercise the app-created future Class 42 lifecycle here: those have their own families.",
      "test": "setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42"
    },
    {
      "description": "New exact unique operator-mutation family on scratch trees. Drive the guided route through fact/preview confirmation, then let it perform the registry/rename edits, private rollback copy, validation, scan and publication automatically, with no hand-edited CSV or separate owner-run publication step. Exercise genuine new registration, existing-key/malformed-name correction, confirmed roster and exact rename continuation while preserving nonempty extra columns and unrelated rows. Invalid/ambiguous input, symlinks, stale preview/concurrent edit, interrupted apply and failed publication must retain recoverable originals, keep the last good published index, and expose a safe retry; repeat execution makes no duplicate rows, rename forks or unnecessary commit. Prove mechanical edits, byte preservation, publication invocation/result and rollback here; reuse the source/index family's exact content oracle rather than re-running its full sessions 40/41 attribution matrix. Separately Claude must execute and record redacted live pre/post NAS checks: actual config/task authority, intended-account run, full-day schedule/next trigger, effective job permissions, corrected scan hash, commit-pinned published graph accepted by the app decoder, second-run no-commit result, affected-file byte preservation and a concrete rollback manifest. Scratch proof does not establish production repair: supply actual outputs without credentials or archive-root paths in committed evidence. Do not mark this complete with owner repair instructions.",
      "test": "setar guided maintenance is reversible stale safe and idempotent without altering media"
    },
    {
      "description": "New exact unique stateful Node/store family, owning full duplicate consolidation and preservation. Reproduce the real Class 41 shape with manual ID, two linked items, two commitments/two questions and a separate already-bound empty archive row. Through the supported repair obtain exactly one survivor retaining the manual ID and archive material. Extend this fixture with both-sided distinct notes, asked answers, authored references sharing a path but carrying distinct metadata, lesson attachments/bytes, historical links and recovery drafts. Assert complete preservation/rebinding without deleteLesson side effects or new suppressions. Cover first-time pathless counterpart, unique exact-path adoption, bound-session duplicate, durable keep-separate/skip, wrong instrument/date/number, the real Class 38 same-number/different-date counterexample, multiple candidates, pending notes/question saves, stale decisions, failed IndexedDB acknowledgement/retry and repeat Refresh with unchanged rev when no work remains. Ambiguity changes nothing silently; every entry stays reachable. Independently declare expected ownership/reference sets. The exact named browser companion in the proof route checks only that the real review/confirm/keep-separate controls reach this decision and display the surviving lesson and composed media in both engines; the full preservation matrix belongs here. Do not repeat Class 42 creation or transport round-trips in this family.",
      "test": "setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh"
    },
    {
      "description": "New exact unique future-class browser family in Chromium and WebKit at phone and desktop sizes, using roles/names and storage-aware helpers. With no NAS access, folder or media, create Class 42 dated 2026-11-24 in Compass, select it, commit work and capture a question. Prove its ID/date/intent agree across Lessons, item/class associations, Teacher report and practice capture. Advance to the lesson date/past it explicitly, add the real session-42 recording/materials to a scratch normal session folder, pass the scanner-produced published index to Refresh, resolve its match proposal and prove the archive binds to the original Compass lesson with the same commitments/question and composed files, not a second lesson. Repeated Refresh retains that one binding. In a focused branch, material arriving while the owner-planned date remains ahead must not cancel its legitimate upcoming status; distinguish archive-only future-dated history. Crossing midnight preserves past lesson intent/history without automatic question carry-forward. Own the visible actionable source/maintenance messages here, using minimal diagnostic fixtures rather than reproducing sessions 40/41 parser expectations. Do not repeat Class 41 consolidation, its preservation matrix, keep-separate matrices or persistence/sync round-trips. No UI source-regex or debug hook substitutes for this journey.",
      "test": "setar future class preparation and later media use one lesson across every visible consumer"
    },
    {
      "description": "New exact unique durable-boundary family in Chromium and WebKit, starting from an independently declared already-reconciled fixture. Do not perform the Class 41 merge again. Exercise repaired schema state, supported older-schema data if representation changes, persist migrate+merge, ordinary/full-backup import, sync pull, Keep remote and archive restore through existing entry points with mocked transport. Validate at every inbound door. At each handover check the canonical lesson/source binding and representative authored agenda/text and attachment ownership/bytes; retain suppression and explicit-separate decisions through acknowledged save and cold reload. A subsequent Refresh must neither recreate a removed duplicate nor restore hidden/unlinked material. Own malformed graph/duplicate binding/missing described attachment-byte refusal at inbound install boundaries; stale reconciliation previews and failed merge acknowledgements remain in the reconciliation family. Include unfinished practice and in-flight note/question writes where replacement interacts with this lane, preserving existing replacement guards and whole-snapshot conflicts. WebKit seeds state only; prove blob claims through Node/Chromium byte checks/full-backup paths. This checks persistence of the independently expected result, not the full consolidation algorithm or another copy of its preservation matrix.",
      "test": "setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material"
    },
    {
      "description": "Reuse this exact existing browser title, extending its behaviour family rather than creating a duplicate title. On a long-lived mounted ordinary/planned block and routine, instrument suspended, interrupted, closed, falsely-running silent and transient constructor-failure contexts. Verify a recovery/Test gesture is reachable even when reported ready or unavailable and creates/resumes the fresh context synchronously; no reload, late stale pulse, second scheduler or timer/history/marker mutation. Verify metronome interaction, pending/rejected resumes and hidden/visible return using existing cue/metronome companions. If current behaviour already passes a case, keep it. Automation proves calls/lifecycle and accessible recovery, never speaker output.",
      "test": "practice sound returns at the next tap after the context dies through every start and resume door"
    },
    {
      "description": "Reuse this exact existing title. Replace tight total-duration inequalities with deterministic invocation/behaviour assertions plus a finite generous deadlock guard. The real script still runs against local fast-index/slow-package, hung, refused, missing-suite and healthy mirrors and verifies resulting sources, failure exit and unchanged third-party/signature settings. Assert each probe receives the existing curl limit and workflows retain their install/job bounds and two-engine requirement, including negative cases. Artificial harness/process overhead must not fail correct routing; removing a probe bound or bypass/failure safeguard must fail. No unrelated production routing rewrite or CI timeout increase.",
      "test": "ci browser setup avoids a fast index slow package mirror within the existing bounds"
    },
    {
      "description": "Only the physical-device claims: on the built revision in isolated preview data, hear the cue on Mac and native iPhone Safari/installed PWA after a normal idle/background/lock interruption and recover using the visible gesture without relaunch; confirm NAS recording/demo opening and playback on the real device where automated networking/player checks cannot prove it. Record platform/build/output route and limits. Claude performs all metadata/task/index repair and ordinary automated regression work; do not substitute owner NAS editing, duplicate cleanup, sync migration testing or a general product walkthrough for those proofs. If no sound code/affordance changes prove necessary, do not manufacture an unrelated audio acceptance burden.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": true,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "Heavy: saved lesson identity consolidation and all references/drafts/attachment ownership, untrusted archive metadata and inbound graph validation, plus conservative production NAS configuration/index repairs. Existing token-bearing runtime permissions are narrowed without changing credentials or expanding access. Failure can orphan authored information or publish misleading source facts, so state-discriminating pipeline, persistence and rollback proof is required."
  },
  "delta": {
    "today": "Add a class creates an independent lesson; Refresh adopts only exact path-backed matches and skips already-bound sessions, leaving the reported pathless manual Class 41 beside its archive twin. Normal source attention directs the musician to manual CSV edits; an empty NAS folder does not create a preparable lesson.",
    "instead": "Create and prepare one future app lesson without media, then bind later archive facts to that lesson through a safe identity decision. Reconcile the existing Class 41 pair without losing authored data; preserve planned-versus-historical intent, source suppressions and exact identities. Provide a guided authoritative maintenance route that performs confirmed metadata/rename edits, validation, rollback copying and publication without hand-editing CSV, with honest actionable Refresh messages, backed by a verified conservatively repaired NAS publication job.",
    "keep": [
      "NAS media stays external and opens only on a tap.",
      "The app-owned lesson ID, agenda history and durable notes remain authoritative; source facts never establish practice.",
      "Weak matches require a decision; historical archive imports never manufacture future urgency."
    ],
    "assumptions": [],
    "showMe": "Run the seven exact named automated acceptance families above and inspect the redacted live NAS repair/publication/rollback evidence; reserve only native-device sound and media playback for manual owner acceptance."
  },
  "desiredRules": [],
  "docsDelta": [
    "docs/setar-archive.md",
    "docs/nas-topology.md",
    "docs/setar-practice-reliability.md",
    "docs/setar-lesson-lifecycle.md",
    "DECISIONS.md",
    "AGENTS.md"
  ]
}
```
````

## The approved Delta this change must deliver

# Create and prepare one future app lesson without media, then bind later archive facts to that lesson through a safe identity decision. Reconcile the existing Class 41 pair without losing authored data; preserve planned-versus-historical intent, source suppressions and exact identities. Provide a guided authoritative maintenance route that performs confirmed metadata/rename edits, validation, rollback copying and publication without hand-editing CSV, with honest actionable Refresh messages, backed by a verified conservatively repaired NAS publication job.

_approved · about "log-a-class"_

## Today

Add a class creates an independent lesson; Refresh adopts only exact path-backed matches and skips already-bound sessions, leaving the reported pathless manual Class 41 beside its archive twin. Normal source attention directs the musician to manual CSV edits; an empty NAS folder does not create a preparable lesson.

## Instead

Create and prepare one future app lesson without media, then bind later archive facts to that lesson through a safe identity decision. Reconcile the existing Class 41 pair without losing authored data; preserve planned-versus-historical intent, source suppressions and exact identities. Provide a guided authoritative maintenance route that performs confirmed metadata/rename edits, validation, rollback copying and publication without hand-editing CSV, with honest actionable Refresh messages, backed by a verified conservatively repaired NAS publication job.

## Keep

- NAS media stays external and opens only on a tap.
- The app-owned lesson ID, agenda history and durable notes remain authoritative; source facts never establish practice.
- Weak matches require a decision; historical archive imports never manufacture future urgency.

## New assumptions

_none_

## Show me

Run the seven exact named automated acceptance families above and inspect the redacted live NAS repair/publication/rollback evidence; reserve only native-device sound and media playback for manual owner acceptance.


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
  touchpoints: `src/pages/Today.tsx`, `src/pages/StartBlock.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/CloseBlock.tsx`, `src/store/useStore.ts`, `src/domain/recommend.ts`, `src/domain/scoring.ts`, `src/domain/scheduling.ts`, `src/domain/blocks.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/domain/practiceSessionModel.ts`, `src/components/ItemNotes.tsx`, `src/store/notesDrafts.ts`, `src/components/practiceCue.ts`, `src/components/metronome.ts`, `src/components/TeacherQuestionCapture.tsx` · canonical: `.prismatica/flows/practise-todays-recommendation.md`
- **Take questions and a summary to class** (`prepare-for-the-next-class`) — Arrive at the lesson with the questions that came up while practising, and a short honest account of the period.
  touchpoints: `src/pages/TeacherReport.tsx`, `src/components/ClassQuestions.tsx`, `src/domain/questions.ts`, `src/domain/report.ts`, `src/pages/Lessons.tsx`, `src/pages/CloseBlock.tsx`, `src/components/TeacherQuestionCapture.tsx`, `src/pages/ActiveBlock.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/lessonAgenda.ts` · canonical: `.prismatica/flows/prepare-for-the-next-class.md`
- **Run a time-budgeted session** (`run-a-session-plan`) — Turn the minutes actually available into an ordered session, then practise it block by block.
  touchpoints: `src/pages/SessionPlan.tsx`, `src/pages/Today.tsx`, `src/pages/ActiveBlock.tsx`, `src/domain/plan.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/domain/lessonAgenda.ts`, `src/components/ui.tsx`, `src/components/metronome.ts` · canonical: `.prismatica/flows/run-a-session-plan.md`
- **See how practice is actually going** (`see-practice-patterns`) — Get a calm, neutral read on the last week or month across everything you play.
  touchpoints: `src/pages/Insights.tsx`, `src/pages/Today.tsx`, `src/domain/insights.ts`, `src/domain/io.ts` · canonical: `.prismatica/flows/see-practice-patterns.md`
- **Keep the MacBook and iPhone in step** (`sync-devices-via-github`) — Practise on either device and have both hold the same data, without a server or an account.
  touchpoints: `src/store/syncEngine.ts`, `src/store/githubSync.ts`, `src/store/gitRemote.ts`, `src/domain/sync.ts`, `src/domain/canonical.ts`, `src/store/revision.ts`, `src/pages/Settings.tsx`, `src/App.tsx` · canonical: `.prismatica/flows/sync-devices-via-github.md`
- **Work through a pathway stage** (`work-a-pathway-stage`) — Follow a route you trust — see where you are, take the next suggestion into your own items once, and practise it
  touchpoints: `src/pages/PathwayDetail.tsx`, `src/pages/StageDetail.tsx`, `src/pages/RoutineRunner.tsx`, `src/domain/pathways.ts`, `src/domain/pathwaySeed.ts`, `src/domain/routines.ts`, `src/domain/practiceSignal.ts`, `src/components/useScreenAwake.ts`, `src/components/screenAwake.ts`, `src/store/useStore.ts`, `src/pages/Repertoire.tsx`, `src/components/metronome.ts`, `src/components/TeacherQuestionCapture.tsx` · canonical: `.prismatica/flows/work-a-pathway-stage.md`

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

Keep Setar lessons and preparation coherent from archive to next class

## Stay in scope — you may ONLY change

- AGENTS.md
- DECISIONS.md
- docs/setar-archive.md
- docs/nas-topology.md
- docs/setar-practice-reliability.md
- docs/setar-lesson-lifecycle.md
- package.json
- scripts/run-setar-index.sh
- scripts/scan-setar-classes.mjs
- scripts/publish-setar-index.mjs
- scripts/setar-archive-maintenance.mjs
- scripts/check-setar-practice-families.mjs
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.ts
- src/domain/sourceReconcile.test.ts
- src/domain/scanSetarClasses.test.ts
- src/domain/types.ts
- src/domain/factories.ts
- src/domain/lessonAgenda.ts
- src/domain/lessonAgenda.test.ts
- src/domain/lessonReconcile.ts
- src/domain/lessonReconcile.test.ts
- src/domain/selectors.ts
- src/domain/selectors.test.ts
- src/domain/questions.ts
- src/domain/questions.test.ts
- src/domain/report.ts
- src/domain/report.test.ts
- src/domain/itemFiles.ts
- src/domain/itemFiles.test.ts
- src/domain/scoring.ts
- src/domain/plan.ts
- src/domain/setarSetup.ts
- src/domain/setarSetup.test.ts
- src/domain/io.ts
- src/domain/io.test.ts
- src/domain/migrations.ts
- src/domain/migrations.test.ts
- src/domain/index.ts
- src/store/useStore.ts
- src/store/notesDrafts.ts
- src/store/idb.ts
- src/store/backup.ts
- src/store/archiveIndex.ts
- src/store/archiveIndex.test.ts
- src/components/ArchiveRefresh.tsx
- src/components/LessonReconcile.tsx
- src/components/LessonNotes.tsx
- src/components/LessonAgenda.tsx
- src/components/ClassQuestions.tsx
- src/components/TeacherQuestionCapture.tsx
- src/components/SetarSetupReview.tsx
- src/components/ItemMaterial.tsx
- src/components/practiceCue.ts
- src/components/practiceCue.test.ts
- src/components/metronome.ts
- src/pages/Lessons.tsx
- src/pages/TeacherReport.tsx
- src/pages/ItemDetail.tsx
- src/pages/Today.tsx
- src/pages/SessionPlan.tsx
- src/pages/CloseBlock.tsx
- src/pages/ActiveBlock.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Settings.tsx
- src/styles/global.css
- tests/setar-lifecycle.test.ts
- tests/setar-lifecycle.browser.test.ts
- tests/setar-maintenance.test.ts
- tests/fixtures/setar-lifecycle-source.json
- tests/fixtures/setar-lifecycle-owner.json
- tests/fixtures/setar-lifecycle-expected.json
- tests/setarArchive.browser.test.ts
- tests/setarInbound.browser.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice.browser.test.ts
- tests/setar-practice-proof.test.ts
- tests/practice-cues.browser.test.ts
- tests/live-practice.browser.test.ts
- tests/practice-session.browser.test.ts
- tests/ci-browser-setup.test.ts
- src/components/direction.test.ts
- src/components/pressedState.test.ts
- src/domain/plan.test.ts
- src/domain/scoring.test.ts
- src/components/ItemNotes.tsx
- tests/fixtures/setar-archive.json
- tests/fixtures/setar-practice-source-v1.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json

Never touch:

- .github/workflows/**
- vite.config.ts
- package-lock.json
- src/store/syncEngine.ts
- src/domain/setarClasses.ts
- User-authored notes and pending drafts, question text/asked history/answers, commitments and targets, explicit item links, attachment metadata and bytes, practice blocks and results, scheduling/retention provenance and statistics, unrelated instruments, active clock/plan/routine, sync conflict/archive protections and offline operation must survive. No whole-database replacement for reconciliation.
- Deliberate piece/session/link/resource suppressions, exact rename identity, registry canonical keys and source graph validation remain authoritative. Refresh never fabricates practice or clears questions, never completes a review, never treats not-described or an unreachable NAS as deleted.
- All media remains on the NAS with byte preservation; large-file references do not become attachments, backups or sync payloads. Keep the existing separate source-index branch and commit-pinned hash-verified fetch; no secrets in committed artefacts or source index.
- Keep the one-item practice loop, direction-aware mixed Farsi/English, mobile accessibility/reflow and secure-context requirements. No general scheduling, sync, schema or product redesign.
- No general product audit, redesigned archive transport, NAS crawler/service, fingerprinting/automatic fuzzy identity, second metadata database, recurring lesson system, automatic question carry-forward or generic record merge framework.
- No mass media normalisation, broad NAS permissions changes, destructive sync/mirror, republishing personal backup data, production app-database overwrite or automatic whole-snapshot/per-field sync merge. External job repairs are tightly bounded operational work recorded with private rollback evidence, not absolute paths added to repository scope.
- No reimplementation of already-shipped audio renewal or CI routing. Change only demonstrated reachable recovery affordances and the test harness timing race; hardware sound guarantees and unrelated old defects are out of scope.

## Definition of done

- **ac-1** — New exact unique focused Node family, owning source/index semantics. Use sanitised committed temporary corpora independently transcribed from actual evidence, not a private backup or scanner-derived expectations. Run the real scanner, shared digest/graph decoder and publisher against a local fake Git boundary, then a thin clean-store import proving downstream source interpretation. Before repair prove session 40's existing correct registry identity versus its stacked-role filename, refused unnamed-demo attribution, session 41's genuine missing registration and excluded demo. After correction prove exact session-40 roster/attribution and session-41 recording plus correctly scoped demo, without shared personal takes or invented musical identity. An empty session-42 folder produces no indexed session, imported lesson or deadline. Cover ordinary supported types/forms discovered without metadata action, explicit unsupported/unregistered diagnostics, failed/partial inventory, exact rename-chain resolution, retained-not-described resources, corrected metadata and unchanged scan/publication rerun. Expected piece memberships and resource paths are hand-written; publisher targets stay isolated from practice data. Do not create or consolidate the duplicate Class 41 or exercise the app-created future Class 42 lifecycle here: those have their own families. → proven by `setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42`
- **ac-2** — New exact unique operator-mutation family on scratch trees. Drive the guided route through fact/preview confirmation, then let it perform the registry/rename edits, private rollback copy, validation, scan and publication automatically, with no hand-edited CSV or separate owner-run publication step. Exercise genuine new registration, existing-key/malformed-name correction, confirmed roster and exact rename continuation while preserving nonempty extra columns and unrelated rows. Invalid/ambiguous input, symlinks, stale preview/concurrent edit, interrupted apply and failed publication must retain recoverable originals, keep the last good published index, and expose a safe retry; repeat execution makes no duplicate rows, rename forks or unnecessary commit. Prove mechanical edits, byte preservation, publication invocation/result and rollback here; reuse the source/index family's exact content oracle rather than re-running its full sessions 40/41 attribution matrix. Separately Claude must execute and record redacted live pre/post NAS checks: actual config/task authority, intended-account run, full-day schedule/next trigger, effective job permissions, corrected scan hash, commit-pinned published graph accepted by the app decoder, second-run no-commit result, affected-file byte preservation and a concrete rollback manifest. Scratch proof does not establish production repair: supply actual outputs without credentials or archive-root paths in committed evidence. Do not mark this complete with owner repair instructions. → proven by `setar guided maintenance is reversible stale safe and idempotent without altering media`
- **ac-3** — New exact unique stateful Node/store family, owning full duplicate consolidation and preservation. Reproduce the real Class 41 shape with manual ID, two linked items, two commitments/two questions and a separate already-bound empty archive row. Through the supported repair obtain exactly one survivor retaining the manual ID and archive material. Extend this fixture with both-sided distinct notes, asked answers, authored references sharing a path but carrying distinct metadata, lesson attachments/bytes, historical links and recovery drafts. Assert complete preservation/rebinding without deleteLesson side effects or new suppressions. Cover first-time pathless counterpart, unique exact-path adoption, bound-session duplicate, durable keep-separate/skip, wrong instrument/date/number, the real Class 38 same-number/different-date counterexample, multiple candidates, pending notes/question saves, stale decisions, failed IndexedDB acknowledgement/retry and repeat Refresh with unchanged rev when no work remains. Ambiguity changes nothing silently; every entry stays reachable. Independently declare expected ownership/reference sets. The exact named browser companion in the proof route checks only that the real review/confirm/keep-separate controls reach this decision and display the surviving lesson and composed media in both engines; the full preservation matrix belongs here. Do not repeat Class 42 creation or transport round-trips in this family. → proven by `setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh`
- **ac-4** — New exact unique future-class browser family in Chromium and WebKit at phone and desktop sizes, using roles/names and storage-aware helpers. With no NAS access, folder or media, create Class 42 dated 2026-11-24 in Compass, select it, commit work and capture a question. Prove its ID/date/intent agree across Lessons, item/class associations, Teacher report and practice capture. Advance to the lesson date/past it explicitly, add the real session-42 recording/materials to a scratch normal session folder, pass the scanner-produced published index to Refresh, resolve its match proposal and prove the archive binds to the original Compass lesson with the same commitments/question and composed files, not a second lesson. Repeated Refresh retains that one binding. In a focused branch, material arriving while the owner-planned date remains ahead must not cancel its legitimate upcoming status; distinguish archive-only future-dated history. Crossing midnight preserves past lesson intent/history without automatic question carry-forward. Own the visible actionable source/maintenance messages here, using minimal diagnostic fixtures rather than reproducing sessions 40/41 parser expectations. Do not repeat Class 41 consolidation, its preservation matrix, keep-separate matrices or persistence/sync round-trips. No UI source-regex or debug hook substitutes for this journey. → proven by `setar future class preparation and later media use one lesson across every visible consumer`
- **ac-5** — New exact unique durable-boundary family in Chromium and WebKit, starting from an independently declared already-reconciled fixture. Do not perform the Class 41 merge again. Exercise repaired schema state, supported older-schema data if representation changes, persist migrate+merge, ordinary/full-backup import, sync pull, Keep remote and archive restore through existing entry points with mocked transport. Validate at every inbound door. At each handover check the canonical lesson/source binding and representative authored agenda/text and attachment ownership/bytes; retain suppression and explicit-separate decisions through acknowledged save and cold reload. A subsequent Refresh must neither recreate a removed duplicate nor restore hidden/unlinked material. Own malformed graph/duplicate binding/missing described attachment-byte refusal at inbound install boundaries; stale reconciliation previews and failed merge acknowledgements remain in the reconciliation family. Include unfinished practice and in-flight note/question writes where replacement interacts with this lane, preserving existing replacement guards and whole-snapshot conflicts. WebKit seeds state only; prove blob claims through Node/Chromium byte checks/full-backup paths. This checks persistence of the independently expected result, not the full consolidation algorithm or another copy of its preservation matrix. → proven by `setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material`
- **ac-6** — Reuse this exact existing browser title, extending its behaviour family rather than creating a duplicate title. On a long-lived mounted ordinary/planned block and routine, instrument suspended, interrupted, closed, falsely-running silent and transient constructor-failure contexts. Verify a recovery/Test gesture is reachable even when reported ready or unavailable and creates/resumes the fresh context synchronously; no reload, late stale pulse, second scheduler or timer/history/marker mutation. Verify metronome interaction, pending/rejected resumes and hidden/visible return using existing cue/metronome companions. If current behaviour already passes a case, keep it. Automation proves calls/lifecycle and accessible recovery, never speaker output. → proven by `practice sound returns at the next tap after the context dies through every start and resume door`
- **ac-7** — Reuse this exact existing title. Replace tight total-duration inequalities with deterministic invocation/behaviour assertions plus a finite generous deadlock guard. The real script still runs against local fast-index/slow-package, hung, refused, missing-suite and healthy mirrors and verifies resulting sources, failure exit and unchanged third-party/signature settings. Assert each probe receives the existing curl limit and workflows retain their install/job bounds and two-engine requirement, including negative cases. Artificial harness/process overhead must not fail correct routing; removing a probe bound or bypass/failure safeguard must fail. No unrelated production routing rewrite or CI timeout increase. → proven by `ci browser setup avoids a fast index slow package mirror within the existing bounds`
- **ac-8** — Only the physical-device claims: on the built revision in isolated preview data, hear the cue on Mac and native iPhone Safari/installed PWA after a normal idle/background/lock interruption and recover using the visible gesture without relaunch; confirm NAS recording/demo opening and playback on the real device where automated networking/player checks cannot prove it. Record platform/build/output route and limits. Claude performs all metadata/task/index repair and ordinary automated regression work; do not substitute owner NAS editing, duplicate cleanup, sync migration testing or a general product walkthrough for those proofs. If no sound code/affordance changes prove necessary, do not manufacture an unrelated audio acceptance burden. → proven by `manual:OWNER`

## Docs to update as part of this change

- docs/setar-archive.md
- docs/nas-topology.md
- docs/setar-practice-reliability.md
- docs/setar-lesson-lifecycle.md
- DECISIONS.md
- AGENTS.md

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

