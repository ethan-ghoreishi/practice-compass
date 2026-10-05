---
id: 20261005-make-setar-archive-recovery-repertoire-c-e964
contractId: 20261005-make-setar-archive-recovery-repertoire-c-e964
patchId: 8ff4619f521ec0849e6c30c2b31329b6f0cc5ae5
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: setup-review-premise-and-acknowledgement
    summary: "P1: SetarSetupReview rebuilds before-values from the live plan for
      status, kind, stage, source, reference and class choices, bypassing
      stale-selection refusal. Its captured current key and unconditional saved
      reset also discard newer selections while persistence is pending. Preserve
      the reviewed premise/proposal and bind acknowledgement to the live draft."
    counterexample: "Choose Keeping fresh while an item is dormant, then sync it to
      repairing before Apply. The production component handler submits
      before={status:repairing} and writes maintenance; applySetarSetup refuses
      the original dormant premise. Choosing a second item while the first save
      is pending is cleared by the first saved callback without being written.
      Instances: SetarSetupReview.tsx:71,80,108-119,293-298,319. Consumers
      checked clean for this invariant: applySetarSetup with a carried premise,
      ArchiveRefresh typed metadata decisions, ui acknowledgement sequencing,
      ItemForm, Materials and MusicTerms live draft readers, immutable Recovery
      and StageDetail source actions. Extend setar setup commits selected rows
      atomically idempotently and without collateral changes and setar setup
      review is usable through controls and survives interruption; current
      browser drift is unrelated."
  - family: setup-study-source-identity-and-idempotence
    summary: "P1: Study-source creation loses group identity across acknowledgement
      and replay. The saved callback assigns the first selected item's
      materialId to every create group; new:<group> is not translated to its
      created id for retries, and Try again omits source finalisation."
    counterexample: "Create sources for two distinct declarations in one Apply. The
      production handler creates two distinct materials but its saved callback
      sets both source selectors to the first material. Replaying one original
      create selection against the resulting database is rejected as stale
      instead of a no-op. Instances: setarSetup.ts:398,511,524-537;
      SetarSetupReview.tsx:301-307,319. Consumers checked clean: per-group
      creation within one domain commit, explicit existing-source selection and
      instrument filtering, ItemForm createdSource retry, Materials draft.id
      retry, keyed course-source reuse. Extend setar setup commits selected rows
      atomically idempotently and without collateral changes and setar setup
      review is usable through controls and survives interruption to multi-group
      creation, failed creation persistence and unchanged replay."
  - family: practice-sound-pending-request-lifecycle
    summary: "P2: testPracticeSound queues unsuperseded callbacks on resume promises
      and calls resume twice per suspended tap. Old test/recovery requests can
      sound together when a later gesture resumes the context, violating the
      no-queued-old-tones acceptance."
    counterexample: "With a suspended context whose resume promises remain pending,
      call testPracticeSound three times: six promises accumulate and no pulse
      plays. Later prime the context, mark it running and resolve the earlier
      promises: six late oscillator pulses and three vibrations are emitted.
      Instances: practiceCue.ts:133-146; Settings Test practice sound;
      ActiveBlock SoundNote and its RoutineRunner reuse. Consumers checked
      clean: direct playPracticeCue while suspended, prime-only block/routine
      Start and Resume doors, atomic store marker claims and both boundary
      callers. Extend practice sound reuses one gesture primed context across
      all start and resume doors and practice sound keeps one context primed
      only by taps and never queues a cue to pending requests that later
      settle."
  - family: header-aware-source-metadata-drafts
    summary: "P2: The rename-log attention template prints the actual header but
      always puts old and new paths in the first two columns. Valid reordered or
      extended headers produce incorrect exact rename declarations."
    counterexample: "For new_path,timestamp,old_path, formatAttention emits <the
      missing path>,<its current path>,. Filling those placeholders puts the old
      path into new_path, the current path into timestamp and leaves old_path
      empty. Reversing just old_path/new_path reverses the declaration.
      Instance: scan-setar-classes.mjs:982-983. Consumers checked clean:
      readTable/buildIndex rename readers honour header names; new registry
      drafts map header names; roster amendments target sessions and preserve
      other raw cells; app rename consumers follow exact graph pairs. Extend
      setar durable intake preserves registry authority and exact rename
      evidence without changing media with reordered and extra-column rename
      logs."
  - family: setar-setup-direction-aware-values
    summary: "P2: SetarSetupReview pins independently authored before/after values
      and mixed evidence to LTR and puts direction on a bare item title instead
      of its title/detail group. The direction ledger records that title as a
      group, leaving the violation undetected."
    counterexample: "Organisation renders a Farsi gusheh, owner-written stage title
      or study-source title inside span dir=ltr at SetarSetupReview.tsx:240-246.
      Its organisation title is strong dir=auto at 234, while the containing
      detail group has no direction. Instances include kind/gusheh, stage and
      source output in show(), and evidence interpolating composer, dastgah,
      stage and source labels in setarSetup.ts. Consumers checked clean for the
      same new-value surfaces: ArchiveRefresh DifferenceRow and Recovery
      authored-value isolates, MusicalTermField suggestions and RoutineRunner
      bare-URL title group. Extend portable term and recovery controls preserve
      direction focus and scroll ownership to setup rows and correct
      direction.test.ts:195 rather than endorsing the bare title."
createdAt: 2026-10-05T23:38:10.517Z
sealedAt: 2026-10-05T23:53:49.238Z
---

# Review: Make Setar archive recovery, repertoire corrections and iPhone practice reliable

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261005-make-setar-archive-recovery-repertoire-c-e964
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/45
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `8ff4619f521ec0849e6c30c2b31329b6f0cc5ae5`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

````yaml
# Approved intent: Make Setar archive recovery, repertoire corrections and iPhone practice reliable

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Plan one broad but coherent Practice Compass lane, with Claude as builder, for the seven current owner-facing issues below. Planning only in this session; do not implement.
> 
> 1. Session 40: after adding session-40-29-09-2026, Refresh imports its videos but excludes نت-پیش-درامد-چهارگاه-فروتن.pdf and نت-چهارمضراب-چهارگاه-عبادی.pdf and their practice items. It reports both piece keys absent from the registry, with 0 additions/updates/decisions and 2 needing attention. Rerunning the NAS task does not help. Deleting Class 40 and refreshing does not restore it. Trace scan → publication → refresh → bindings/suppression → Lessons/items and provide low-admin recovery, distinguishing intended behaviour from defects.
> 2. Session 1: after renaming ضبط-کلاس-1 through ضبط-کلاس-3 to نمونه-1 through نمونه-3 and indexing/refreshing, the class retains old names and expected items lack the files. Trace exact rename provenance and refresh rather than assuming a defect.
> 3. Refresh repeatedly offers بسته-نگار-بیات-ترک-ردیف-میرزاعبدالله gusheh بسته‌نگار → بسته-نگار, and جنگ-شهنازی and صلح-شهنازی form ضربی → (قطعه), despite deliberate owner edits. Establish authority and avoid stale/meaningless repeated choices while preserving those edits.
> 4. iPhone Form and Dastgāh/Āvāz inputs offer no predefined terms while typing; Musical terms is correct and MacBook works. Investigate cross-device input/UI causes.
> 5. Provide a sufficiently clear timer target signal using existing boundary/audio/vibration/PWA behaviour within iPhone platform limits. No second timer or unsupported alarm guarantee.
> 6. Make accidental pathway additions safely reversible: + becomes green Play and the owner sees only deletion as an inverse. Assess the intended model; do not assume deletion.
> 7. Safely bring current Setar data towards Keeping fresh, correct stages in سه‌تار · ردیف و رپرتوار, correct class associations, Gusheh (radif)/Composed piece classification and ردیف میرزا عبدالله study source where appropriate. Identify exceptions and provide an idempotent, reviewable approach, without a blanket migration or unrelated data overwrite.
> 
> Read current AGENTS.md, DECISIONS.md, docs/tests and recent history first. Treat reports as symptoms. Trace every implementation/consumer and the invariant/failure family, search siblings/counterexamples/platform variants/stale parallel paths, and identify wrong-layer or false-confidence tests. Include only still-real material adjacent defects sharing these flows. Every acceptance must have a reproducible proof route and state-discriminating regression/family/mutation evidence where useful before the first reviewer pass. Preserve user data, compatibility and deliberate edits. Automate practical proof and keep OWNER testing minimal and restricted to what automation cannot establish. Planning and automated investigation of real NAS/Setar media are read-only. Never propose destructive media operations, the retired deployment path or rsync --delete. Return only validated import-ready Prismatica Start JSON.
> 
> Revision: keep this as ONE broad HEAVY lane covering all existing scope and preserve the investigation, root-cause findings, acceptance and OWNER checks. Session 40 and Session 1 are concrete regressions, not the limit. Provide a predictable low-admin intake path for Session 41, 42 and later, new identities, added/changed files and occasional renames, without another code lane or developer-generated worksheet. Retain the registry unless evidence justifies otherwise; identify the minimal safe authority/input and make any required maintenance generic, clear and actionable. Prove synthetic future numbers and identities. Re-check actual Start/Resume → boundary → nextSignal/acknowledgement → existing audio/vibration/visual behaviour, creation/resume/lifecycle/routing, Mac and iPhone Safari/PWA before prescribing a correction. Use the smallest evidence-supported fix within the single clock/boundary model. Automated proof covers signalling mechanics and exactly-once behaviour; OWNER covers actual audibility/platform behaviour. No locked/background/iOS alarm guarantee. Sweep consumers, siblings and stale tests, and design focused regression/mutation proof before the first review.

## Why

One source-to-owned-practice lane. Reuse exact source identity, accepted-graph baselines, scoped suppressions, durable catalogue bindings and the existing clock. Correct missing provenance/consumer wiring and expose existing safe recovery/inverse actions. A reusable scanner attention report keeps ongoing source declarations low-admin. Portable suggestions and correctly reached gesture-enabled cues complete the same musician-facing loop. A narrowly additive saved field and reviewable batch corrections justify HEAVY scrutiny, with family proof available before the first independent review.

## Today

Investigated clean main 93dadcb10cbda2650a53829b76538bcd6b25e133, current AGENTS.md, DECISIONS.md 2026-09-17/29 and 2026-10-01, docs/setar-archive.md, docs/nas-topology.md, docs/repertoire-experience.md and relevant source/tests/history. September archive reworks established exact rename chains, graph validation and durable suppression; c021b46 introduced reference/vocabulary semantics and 97953e7 protected media-adjacent tools.

Read-only scanToIndex on the mounted Sandisk copy, 2026-10-05: 104 pieces, 40 sessions, hash b5c2e94976db0e6a89f33e927a1653176e933fd266a0de6ff2e4bc08bdc5e718, exactly the two reported Session 40 diagnostics. Both canonical keys are missing from PIECES.csv; roster 40 is empty. Unknown named PDFs are deliberately excluded; class video stays lesson-level, and the unnamed demo has no piece scope. In-memory addition of correctly ordered registry rows with session 40 membership indexes both scores and scopes the demo to both. The actual CSV has ten columns including source and roles_present: appending the scanner's eight required columns in that order would misplace sessions. The scanner drops the source column, although 69 rows explicitly declare ردیف-میرزاعبدالله.

Class deletion deliberately persists a session suppression. resetArchiveSuppression/withoutSuppression have no production UI; tests restore by calling the store directly. Reset currently matches kind/ref alone, so exposing it unchanged would also clear sibling item-scoped hides. Lifting suppression cannot recover deleted authored notes/files.

Session 1's current local index correctly emits نمونه-1/2/3, ordered and scoped to رنگ-ماهور-درویش-خان and چهارمضراب-اول-دشتی-صبا. RENAME-LOG.csv stops historical video paths at ضبط-کلاس-N, without continuations to نمونه-N. Unlogged old resources are intentionally retained as unavailable; authored recording titles intentionally survive path repair. The live DSM runtime, latest GitHub publication and private browser database were not accessed. Older published state, missing item source bindings and suppression remain alternatives for the reported missing material, not confirmed resolver defects.

planArchiveImport offers every unequal registry field each refresh rather than comparing it with the accepted source baseline. Literals use byte equality; only term references compare semantic identity. There is no Keep mine choice; the authority-claiming heading is misleading for a spelling difference or generic (قطعه). A separate sibling bug is reproduced in memory: label-based decisionMatchesSuggestion accepts a term-a → term-b premise change when labels match. Such ambiguous imported vocabularies pass validateMusicTerms, and the existing metadata test explicitly endorses label fallback.

MusicalTermField relies entirely on native datalist names. Browser journeys fill finished names and prove storage, not visible partial-query selection. That is a platform-dependent UI exposure, not proof of the precise iPhone failure.

Rechecked the full cue path on this HEAD. startItemSession delegates to startSession; beginPlanSegment also starts that same block. Block and routine Start/Resume store methods establish/resume wall-clock state and contain no audio creation or resume. Today/StageDetail/PathwayDetail routine Start buttons navigate and RoutineRunner starts from an effect; RoutineDuration already starts inside its click handler. SessionPlan first creates a pending plan, then its explicit Begin starts each real block. ActiveBlock and RoutineRunner tick while running, compute elapsed wall time, call nextSignal in an effect, write signalledThrough, then call playSignalCue. Routine Skip calls acknowledgeThrough; block target remains visual/overtime and does not auto-finish, whereas routine natural completion keeps its existing save behaviour. No sound is intended while paused.

A tone IS intended: playSignalCue attempts vibrate(80), creates a NEW AudioContext/webkitAudioContext at the boundary, connects oscillator → gain → destination, schedules 880 Hz with gain 0.2 decaying over 0.3 seconds, and closes only on oscillator onended. There is no resume() or gesture prime anywhere in this path. Read-only Node execution of the actual extracted effects/cue with fake running and suspended ports at 59/60/61 seconds reaches marker → vibrate → oscillator exactly once per ordinary observation in both screens; a suspended port is never resumed. This establishes call reachability in that bounded harness, not mounted React or hardware audibility. Suspended audio time may not advance to onended, so per-boundary contexts can remain allocated. Replaying the same captured effect after the store has immutably replaced its active record produces TWO cue attempts: the setters unconditionally write, without a claim result. src/main.tsx uses StrictMode; a mounted development/remount regression must prove this family rather than assuming the pure nextSignal tests cover effect replay.

On Mac, policy/site activation may allow a fresh context to run, so missing sound is not universally an unlock diagnosis. On iPhone Safari, delayed context creation without a gesture is vulnerable to autoplay restrictions; interruption can suspend audio again. Installed PWA uses the same cue code and supplies no native alarm route. The graph is connected correctly; 0.3-second decay is potentially easy to miss, but current evidence cannot determine the owner's hardware volume, mute/output routing, interrupted state or exact browser policy. There is no existing local notification/service-worker alarm implementation. Existing pure signal and wake tests prove decisions, not gesture integration or sound. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) support gesture creation/resume; [AudioContext state documentation](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) and [WebKit interruption report](https://bugs.webkit.org/show_bug.cgi?id=273511) support lifecycle variants, not a claim that the owner's version has that exact bug.

StageDetail already has safe Remove from pathway, Unlink reference and hidden Restore under ⋯. The inverse exists but is poorly exposed, or the owner runs an older build. membersForSession already derives archive associations and respects unlink suppression but has no production consumer: Lessons and ItemDetail inspect itemIds only. itemFiles independently requires the correct source binding. Classification tests also miss real registry exceptions: six radif درامد variants, two distinct چهارپاره contexts, اتود-وزیری, تمرین-دشتی-1-علیزاده and personal-only بداهه-درامد-افشاری. itemForPiece treats every non-گوشه as full_piece. A composer-attributed چهارپاره-مرادخانی also declares radif source, demonstrating that provenance is not sufficient kind authority. Keeping fresh describes learned material; archive presence proves no learning.

Additional reproduced scanner sibling: buildIndex with roster [known], an unnamed demo and an unregistered named score diagnoses the score but leaves rosterTrusted=true and assigns the demo to known. The excluded filename vanished before roster consistency was evaluated. This is a real false-attribution defect, unlike intentional exclusion of the PDF.
The scanner already accepts arbitrary session-N-DD-MM-YYYY folders and stable registered identities. Ongoing intake is primarily source declaration, not per-session code. Named registered material is scoped exactly; an unnamed demo additionally needs a confirmed roster. A new path has no identity relation to an old path without the log. Replacing bytes at the same path retains the reference and opens the current NAS bytes, even if semantic index fields/hash do not change. File omissions are retained as not described, not proof of deletion. These cases require distinct guidance rather than a Session-40-only worksheet.

## Instead

One lane anchored in work-a-pathway-stage, also affecting existing log-a-class, capture-a-practice-item, browse-my-repertoire, practise-todays-recommendation, run-a-session-plan, back-up-and-restore and sync-devices-via-github. Reconcile those existing Flow descriptions after building; introduce no new top-level Flow.

1. Recover through existing archive mechanisms. Keep exact registry identity, unknown-piece exclusion and suppression of deliberately deleted entities. Fix scanner roster trust at its shared attribution boundary: retain recognised named-piece disagreement evidence before filtering unsupported/unregistered assets. A conflicting named piece, including one absent from the registry, prevents unnamed-demo expansion; keep the demo lesson-level and diagnose the uncertainty. Never invent the missing roster from filenames. Add a collapsed recovery disclosure to ArchiveRefresh listing suppressed sessions/pieces/links/resources with precise global or item scope. Restore only the chosen tuple, including itemId, with persistence acknowledgement and stale-preview revalidation, then use normal preview/commit to re-import current source entities. Preserve all other decisions. Explain that source re-import does not recover deleted notes/attachments. Surface diagnostics and suppressed counts even for an already-current graph; distinguish pending/completed changes and metadata choices, and never call Refresh a NAS rescan.

Make intake durable for all normal future sessions/file changes. Retain PIECES.csv as the byte-exact identity and declared-roster authority, and RENAME-LOG.csv as exact path provenance. Reuse the existing scanner, parsers and stable two-read source observation; add an optional read-only --attention mode in scripts/scan-setar-classes.mjs. It emits an actionable report/drafts to stdout only, refuses --out in this mode, and never edits registry, log or media. Normal scheduled scan/publication remains unchanged. This is an operator aid, not a second scanner, importer, persistent ledger or general registry editor. Report paths are archive-relative; no credential/root enters logs or app data.

The report groups each missing canonical key with observed sessions/roles/files and explains why it is excluded; emits a clearly UNCONFIRMED new-row draft against the registry's ACTUAL header; distinguishes existing-key roster amendments from new identity; and exposes invalid naming, unsupported assets, inconsistent/empty roster attribution and invalid rename-chain evidence with the minimal safe action. Observations are candidates, never a confirmed roster. A row needs only an owner-confirmed exact identity; optional musical fields can remain unknown. Confirm assigned session membership only when needed for unnamed-demo attribution or when declaring actual teaching assignment. No learned status, type, study source or musical meaning is inferred from filename components. For an existing row, preserve all other session declarations, cells, quoting and additional columns; no eight-column positional append. Reuse CSV escaping for copyable drafts and show what must be confirmed before use. For renames, expose current relative paths and the existing old reference/log chain, with a reusable old_path,new_path template. The owner supplies the exact old→new pair; do not suggest a guessed match from size, numbers or similarity. Missing old-path evidence is explicitly unresolved. Keep the app free of filename/reason parsing: the scanner writes actionable diagnostic wording and ArchiveRefresh renders it plus the generic runbook route, current relative references and binding/suppression explanations.

Document one reusable owner checklist in docs/setar-archive.md, linked from the collapsed attention/recovery surface: (a) ordinary supported files for registered identities require only the existing NAS job/latest publication then Refresh; named files need no redundant per-file registration; (b) a genuinely new identity requires one confirmed registry declaration, using the on-demand report rather than a developer worksheet; (c) unnamed demos remain lesson-level until an independently confirmed roster is declared, with empty versus inconsistent roster explained; (d) a renamed/moved file needs one append-only, exact log continuation if old references/hides are to follow it, after checking existing chains/forks; (e) additions and valid role changes propagate from the new index, same-path byte replacement opens the current NAS file, and omitted paths remain not described with explicit hide/repoint choices. Deliberate suppressions still require explicit restoration. No routine intake requires a code edit, reseeding or another lane. Distinguish scan failure, old runtime, successful unchanged publication, stale published hash, missing registry evidence, unresolved binding and suppression, so repeated task runs are not prescribed for a declaration problem.

Keep the two Session 40 registration proposals and three Session 1 log continuations as worked regression examples of that SAME workflow, not its implementation or ceiling. Musical metadata remains owner/teacher-confirmed. Validate generic drafts and owner-confirmed changes only on temporary corpora, including sessions 41, 42 and a non-consecutive number, new arbitrary identities, and repeat runs. Only the owner applies reviewed source metadata; automated investigation/testing is read-only against real media/registry/logs. Existing NAS task then Refresh suffices after compatible runtime update.

2. Exact rename propagation remains shared. Logged chains update source-generated names/roles/scopes and owned lesson reference paths, while preserving authored titles, notes, rows and ids. Never infer unlogged mappings from part numbers, basename, size, mtime or similarity. Unavailable rows say Not described by the latest index, not that NAS bytes are certainly gone. Distinguish generated old resources from authored old labels, show binding/suppression explanations and reuse Link/Create separately/Skip for uncertain owned records.

Wire one shared association selector over explicit lesson.itemIds plus membersForSession resolved through exact bound item identities and instrument, deduplicated by id. Consume it in Lessons, ItemDetail Connected to, its lesson summary, Connections and linkable lists. Label archive associations as provenance, not practice or preparation. Derived Unlink uses the existing narrow link suppression; derived Relink clears that suppression rather than copying membership into itemIds. Manual links remain authored. Association unlinking does not delete independently scoped item material; hiding material is separate.

3. Owner fields remain authoritative after seeding. Offer normal-refresh metadata only when the relevant proposed field changed from the last accepted source field. Unchanged source values never challenge later owner edits. Reuse the accepted graph as the durable baseline, with Use archive value / Keep my value and explicit Apply wording that retains unchosen owner fields while accepting source facts. Do not add a metadata-decision ledger. First adoption preserves owner fields, with any optional comparison before adoption rather than recurring next refresh. An optional Review differences action can inspect already-existing mismatches without changing them.

Resolve both literals and refs through existing unique term resolution for dastgah/form/composer; ambiguous/unknown/composite values stay literal. Do not normalise arbitrary gusheh spellings or source identity: بسته‌نگار remains exact owner text. Exact (قطعه) is generic and cannot improve an existing specific form such as ضربی. Use the heading Archive metadata differs. Bind each choice to record id, typed current value and exact proposed value; labels are not identity. Changes to target, field, relevant term meaning or proposal require a fresh preview. Preview/commit summaries agree and no-op refreshes preserve object identity/rev.

4. Carry PIECES.csv's optional source as SourcePiece.studySource through scanner, semantic digest, decoder, checkSourceGraph, accepted/retained graph and exports. Missing is unknown legacy evidence; present empty is explicit empty evidence; present wrong types refuse. Do not infer it from keys, titles or notes. Keep index v1 as a backwards-compatible additive optional field: actual base-reader proof must show older readers safely ignore it without changing existing meanings, and new readers accept old indexes. Bump PracticeDB to schema 16 for the persisted field; migration only advances the version and retains absence, without clock reads, reseeding or item repairs. Base v15 DB readers refuse v16 safely. Deploy compatible app first, then copy all three NAS runtime files using the existing runbook.

5. Add optional Review Setar setup alongside archive recovery, using the actual current device database. Select instrument/pathway explicitly where identity is uncertain; never infer a different Setar instrument from a renamed label. Show per-field before/after/evidence, already-correct rows and exceptions. Bulk accept evidenced proposals; unresolved cases stay unselected with an explicit choice. A separate owner-selected Keeping fresh batch covers only displayed current Setar item ids, with unrecorded/new, resting, fragile/repairing, techniques and parts visible for exclusion. This is not a migration or future import policy.

Kind proposals distinguish ordinary gushehs, six radif daramad variants, radif versus composer-attributed chaharpareh, etudes/exercises, personal improvisation, parts and unknown/provisional/composite identities. Declared source provenance alone never establishes kind. Change itemType/gusheh only when selected; retain form/composer/dastgah unless separately selected. The same classification policy seeds new explicit تمرین/اتود as exercise, clear composed works as full_piece and ordinary گوشه as gusheh, asks about ambiguous kinds, and keeps personal-only improvisation as source evidence without silently minting a composed repertoire work. Never delete pre-existing exceptions.

Propose radif placement from resolved modal context in the selected mixed Setar pathway, composed work in its existing composed/forms stage, and explicit exceptions for technical items, parts, custom/missing stages, composite modal identity or conflicting deliberate placement. Placement does not imply catalogue linking. Link only an owner-confirmed stable reference through existing legacy/identity refusal; generic form-category suggestions do not identify individual works and the partial radif catalogue may lack a match. Preserve reference/hidden intent. Propose ردیف میرزا عبدالله from declared studySource or confirmed radif references; choose an existing same-instrument Material explicitly, or create one once after selection. Duplicate candidates, conflicting materialId, different recensions and composed variants are reviewed, never deduplicated by title. Class associations use the shared relation, with manual additions/suppression changes selected explicitly.

Commit only displayed selected ids/fields in one validated store mutation, checking rev and exact before-values, acknowledging persistence and providing a retry that really writes. Preserve active block/routine/plan snapshots, notes, blocks, reviews, dates/provenance, ratings/counters, attachments/bytes, unrelated instruments/items and all unselected fields. A completed rerun is a no-op. Nothing runs automatically on load, hydration, import, sync or ordinary Refresh.

6. Replace native-datalist dependence in every MusicalTermField consumer with one portable suggestions surface alongside free text, with no UA branch or dependency. Reuse vocabulary, termSuggestions and existing search aliases/normalisation for bounded visible matching native buttons and an explicit browse-all choice. Selection stores stable term id. Preserve unedited literals, aliases, clearing, unknown/composite/ambiguous text, composition events, touch/focus/Tab/screen-reader use, archived-term policy, direction and main-only scroll on new/edit forms. Do not automatically accept partial matches. Primary platform evidence: [WebKit datalist regression](https://bugs.webkit.org/show_bug.cgi?id=305719). This motivates independence from the native popup; it does not prove the owner's exact iOS defect.

7. Correct the evidenced gesture/context lifecycle gap in the EXISTING cue, rather than replacing the timer or nextSignal. Before behaviour edits, reproduce the actual screen/marker/cue path through mounted browser controls with instrumented AudioContext, vibration and fixed wall time; preserve the red/current trace alongside the correction. The in-memory evidence above is not a substitute for that route. Record constructor, state, synchronous resume invocation, oscillator scheduling/routing and marker claim in order, with explicit limits on what fake ports and browser audio graphs prove.

Use one page-lifetime AudioContext shared by the existing cue callers, created lazily and resumed synchronously during actual Start/Resume/Test sound click handlers, before any await/navigation. Do not create a fresh context in the later boundary effect or close the shared context after each oscillator. Keep the connected oscillator/gain path; clean up short-lived nodes. Treat running as engine readiness, never proof of audible hardware output. Rejected, hanging, suspended, interrupted, closed or unsupported states do not block starting/practising, throw a page error, queue an old cue or silently claim readiness. A closed context can be replaced only on an explicit gesture after its predecessor is closed; do not keep parallel contexts or retry/recreate forever. State changes can update a calm unavailable/interrupted indication and a one-tap sound recovery on the practice screen; they cannot unlock from render/effect or replay consumed boundaries. Do not force an audio-session category, play continuous/silent background audio or add a workaround dependency without new concrete evidence.

Sweep Today recommendation/review/direct starts, StartBlock, ItemDetail/next item, StageDetail, routine cards/duration/essentials, pending/initial/later Session Plan segments, ActiveBlock Resume, CloseBlock Resume, RoutineRunner Resume and direct routine URLs. Starting a pending plan alone does not start its clock: each actual Begin must retain gesture activation. Routine card Start remains one tap: move actual start into the originating click handler using existing segmentsForRun, as RoutineDuration already does, then navigate; a bare routine URL offers explicit Start rather than silently starting from an effect. Existing running routes resume/redirect without replacing work; navigating to an already running clock does not restart it. Update the existing routine-notes browser journey's initial direct-route assumption to click Start, retaining its cross-boundary ownership proof.

Strengthen acknowledgement at the existing store marker setters, not with another timer/counter. Have an atomic claim return whether this call advanced the marker for the still-current captured clock; only a successful claim attempts the cue. Reject stale/replaced/paused clock claims, repeated effect setup and already-consumed boundaries. A refused claim advances nothing, so current valid observation can reconcile. Preserve nextSignal's at-most-one catch-up announcement and acknowledgeThrough's silent Skip. Audio failure still consumes the valid announcement and preserves the visual cue; sound recovery never retries historical boundaries. Verify synchronous/repeated effects, navigation/remount, interruption, final routine save and cancellation/replacement interleavings before review.

Settings Test practice sound uses that same context/cue and changes no practice record, minutes, marker, result or wake lock. Address clarity with a short, bounded two-pulse cue using the existing oscillator/envelope, not a new sound asset/system. The current 880 Hz/0.2/0.3-second cue is the measured starting point; prove scheduling/envelope/routing automatically and certify normal-volume distinguishability only on real devices. Keep pulse count/duration/gain in one small implementation, not a configurable cue library or an A/B product flow. Actual device failure is diagnosed using recorded context state and output/mute/volume/interruption, then corrected at the evidenced layer; do not treat louder gain as a permission fix.

Retain persistent block target/overtime, routine arrival window and best-effort vibration, single wake-lock ownership, existing minutes and routine completion. Edit AGENTS.md's audio rule in place to permit explicit Start/Resume/Test/recovery gestures including Resume on an active screen, while forbidding effect/render unlock. Mac policy, iPhone Safari and installed PWA have separate real-device outcomes; unsupported vibration and media-volume/mute/output routing are not promised away. Hidden/locked execution and timely sound cannot be guaranteed; foreground catch-up remains the same wall-clock/marker decision. [AudioContext interruption/state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) informs recovery limits; [Apple Web Push requirements](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) do not provide an offline local alarm. Add no notification/push service. The native phone timer may be mentioned only as an optional external locked-screen alarm, never integrated as a second practice clock.

8. Make Remove from pathway (keeps item) visible after Add and clearly available on owned rows, reusing planRemoveFromPathway. Explain this pathway's hide/detach while retaining the library item, bindings and data; retain Play as primary. Hidden Restore resolves the same owned item, never creates it again. Keep advanced Unlink and destructive Delete distinct. Ambiguous legacy evidence refuses visibly. Sweep ordinary, shared-radif and course references plus progress/next/Today/plan/routine consumers.

Build checklist / next three actions: (1, highest leverage) commit independent family fixtures, expected outcomes and reader/writer matrix before behaviour edits, reproducing failures at their actual layers. (2) Build source decoding/reconciliation, shared association and selected-patch review before recovery UI; prove each local writer remains inbound-valid. (3) Wire portable terms, sound gestures and visible safe removal; run the focused route, targeted mutations and required lint/typecheck/npm test/build/secrets checks. Before first review, docs/setar-practice-reliability.md maps every invariant/consumer/equivalence class/interaction to the exact named acceptance and command. Rework addresses the named failure and sweeps its family, not endless unchanged wholesale reruns.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- A1: Sandisk inspection proves this local corpus only. Live DSM runtime/publication and private browser state were not read; bounded runtime comparison and actual-device review distinguish those alternatives.
- A2: Registry authority covers exact identity, declared provenance and roster. Musical meaning/learning and deliberate metadata remain the owner's/teacher's authority.
- A3: Keeping fresh is a selected batch over current listed ids with visible exceptions, not automatic eligibility for future imports.

**Possible conflicts**

- The schema has one anchor flowId. Supporting affected existing Flows named above require post-build reconciliation, not a fictional new Flow.
- Current audio instructions prohibit unlock on practice screens. Change that rule only to permit explicit Start/Resume/Test gestures; no hard do-not is waived.
- Radif provenance includes a composed chaharpareh and the shipped selection is partial. Leave uncertain kind/recension/reference/stage unselected; invent no repertoire authority.
- Old v15 devices refuse v16 snapshots. Update both production devices before sharing new state; an isolated preview must not connect to real sync. NAS runtime copies require an explicit update.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Plan one broad but coherent Practice Compass lane, with Claude as builder, for the seven current owner-facing issues below. Planning only in this session; do not implement.\n\n1. Session 40: after adding session-40-29-09-2026, Refresh imports its videos but excludes نت-پیش-درامد-چهارگاه-فروتن.pdf and نت-چهارمضراب-چهارگاه-عبادی.pdf and their practice items. It reports both piece keys absent from the registry, with 0 additions/updates/decisions and 2 needing attention. Rerunning the NAS task does not help. Deleting Class 40 and refreshing does not restore it. Trace scan → publication → refresh → bindings/suppression → Lessons/items and provide low-admin recovery, distinguishing intended behaviour from defects.\n2. Session 1: after renaming ضبط-کلاس-1 through ضبط-کلاس-3 to نمونه-1 through نمونه-3 and indexing/refreshing, the class retains old names and expected items lack the files. Trace exact rename provenance and refresh rather than assuming a defect.\n3. Refresh repeatedly offers بسته-نگار-بیات-ترک-ردیف-میرزاعبدالله gusheh بسته‌نگار → بسته-نگار, and جنگ-شهنازی and صلح-شهنازی form ضربی → (قطعه), despite deliberate owner edits. Establish authority and avoid stale/meaningless repeated choices while preserving those edits.\n4. iPhone Form and Dastgāh/Āvāz inputs offer no predefined terms while typing; Musical terms is correct and MacBook works. Investigate cross-device input/UI causes.\n5. Provide a sufficiently clear timer target signal using existing boundary/audio/vibration/PWA behaviour within iPhone platform limits. No second timer or unsupported alarm guarantee.\n6. Make accidental pathway additions safely reversible: + becomes green Play and the owner sees only deletion as an inverse. Assess the intended model; do not assume deletion.\n7. Safely bring current Setar data towards Keeping fresh, correct stages in سه‌تار · ردیف و رپرتوار, correct class associations, Gusheh (radif)/Composed piece classification and ردیف میرزا عبدالله study source where appropriate. Identify exceptions and provide an idempotent, reviewable approach, without a blanket migration or unrelated data overwrite.\n\nRead current AGENTS.md, DECISIONS.md, docs/tests and recent history first. Treat reports as symptoms. Trace every implementation/consumer and the invariant/failure family, search siblings/counterexamples/platform variants/stale parallel paths, and identify wrong-layer or false-confidence tests. Include only still-real material adjacent defects sharing these flows. Every acceptance must have a reproducible proof route and state-discriminating regression/family/mutation evidence where useful before the first reviewer pass. Preserve user data, compatibility and deliberate edits. Automate practical proof and keep OWNER testing minimal and restricted to what automation cannot establish. Planning and automated investigation of real NAS/Setar media are read-only. Never propose destructive media operations, the retired deployment path or rsync --delete. Return only validated import-ready Prismatica Start JSON.\n\nRevision: keep this as ONE broad HEAVY lane covering all existing scope and preserve the investigation, root-cause findings, acceptance and OWNER checks. Session 40 and Session 1 are concrete regressions, not the limit. Provide a predictable low-admin intake path for Session 41, 42 and later, new identities, added/changed files and occasional renames, without another code lane or developer-generated worksheet. Retain the registry unless evidence justifies otherwise; identify the minimal safe authority/input and make any required maintenance generic, clear and actionable. Prove synthetic future numbers and identities. Re-check actual Start/Resume → boundary → nextSignal/acknowledgement → existing audio/vibration/visual behaviour, creation/resume/lifecycle/routing, Mac and iPhone Safari/PWA before prescribing a correction. Use the smallest evidence-supported fix within the single clock/boundary model. Automated proof covers signalling mechanics and exactly-once behaviour; OWNER covers actual audibility/platform behaviour. No locked/background/iOS alarm guarantee. Sweep consumers, siblings and stale tests, and design focused regression/mutation proof before the first review.",
  "builder": "claude",
  "summary": "Make Setar archive recovery, repertoire corrections and iPhone practice reliable",
  "rationale": "One source-to-owned-practice lane. Reuse exact source identity, accepted-graph baselines, scoped suppressions, durable catalogue bindings and the existing clock. Correct missing provenance/consumer wiring and expose existing safe recovery/inverse actions. A reusable scanner attention report keeps ongoing source declarations low-admin. Portable suggestions and correctly reached gesture-enabled cues complete the same musician-facing loop. A narrowly additive saved field and reviewable batch corrections justify HEAVY scrutiny, with family proof available before the first independent review.",
  "kind": "existing-flow",
  "flowId": "work-a-pathway-stage",
  "currentBehaviour": "Investigated clean main 93dadcb10cbda2650a53829b76538bcd6b25e133, current AGENTS.md, DECISIONS.md 2026-09-17/29 and 2026-10-01, docs/setar-archive.md, docs/nas-topology.md, docs/repertoire-experience.md and relevant source/tests/history. September archive reworks established exact rename chains, graph validation and durable suppression; c021b46 introduced reference/vocabulary semantics and 97953e7 protected media-adjacent tools.\n\nRead-only scanToIndex on the mounted Sandisk copy, 2026-10-05: 104 pieces, 40 sessions, hash b5c2e94976db0e6a89f33e927a1653176e933fd266a0de6ff2e4bc08bdc5e718, exactly the two reported Session 40 diagnostics. Both canonical keys are missing from PIECES.csv; roster 40 is empty. Unknown named PDFs are deliberately excluded; class video stays lesson-level, and the unnamed demo has no piece scope. In-memory addition of correctly ordered registry rows with session 40 membership indexes both scores and scopes the demo to both. The actual CSV has ten columns including source and roles_present: appending the scanner's eight required columns in that order would misplace sessions. The scanner drops the source column, although 69 rows explicitly declare ردیف-میرزاعبدالله.\n\nClass deletion deliberately persists a session suppression. resetArchiveSuppression/withoutSuppression have no production UI; tests restore by calling the store directly. Reset currently matches kind/ref alone, so exposing it unchanged would also clear sibling item-scoped hides. Lifting suppression cannot recover deleted authored notes/files.\n\nSession 1's current local index correctly emits نمونه-1/2/3, ordered and scoped to رنگ-ماهور-درویش-خان and چهارمضراب-اول-دشتی-صبا. RENAME-LOG.csv stops historical video paths at ضبط-کلاس-N, without continuations to نمونه-N. Unlogged old resources are intentionally retained as unavailable; authored recording titles intentionally survive path repair. The live DSM runtime, latest GitHub publication and private browser database were not accessed. Older published state, missing item source bindings and suppression remain alternatives for the reported missing material, not confirmed resolver defects.\n\nplanArchiveImport offers every unequal registry field each refresh rather than comparing it with the accepted source baseline. Literals use byte equality; only term references compare semantic identity. There is no Keep mine choice; the authority-claiming heading is misleading for a spelling difference or generic (قطعه). A separate sibling bug is reproduced in memory: label-based decisionMatchesSuggestion accepts a term-a → term-b premise change when labels match. Such ambiguous imported vocabularies pass validateMusicTerms, and the existing metadata test explicitly endorses label fallback.\n\nMusicalTermField relies entirely on native datalist names. Browser journeys fill finished names and prove storage, not visible partial-query selection. That is a platform-dependent UI exposure, not proof of the precise iPhone failure.\n\nRechecked the full cue path on this HEAD. startItemSession delegates to startSession; beginPlanSegment also starts that same block. Block and routine Start/Resume store methods establish/resume wall-clock state and contain no audio creation or resume. Today/StageDetail/PathwayDetail routine Start buttons navigate and RoutineRunner starts from an effect; RoutineDuration already starts inside its click handler. SessionPlan first creates a pending plan, then its explicit Begin starts each real block. ActiveBlock and RoutineRunner tick while running, compute elapsed wall time, call nextSignal in an effect, write signalledThrough, then call playSignalCue. Routine Skip calls acknowledgeThrough; block target remains visual/overtime and does not auto-finish, whereas routine natural completion keeps its existing save behaviour. No sound is intended while paused.\n\nA tone IS intended: playSignalCue attempts vibrate(80), creates a NEW AudioContext/webkitAudioContext at the boundary, connects oscillator → gain → destination, schedules 880 Hz with gain 0.2 decaying over 0.3 seconds, and closes only on oscillator onended. There is no resume() or gesture prime anywhere in this path. Read-only Node execution of the actual extracted effects/cue with fake running and suspended ports at 59/60/61 seconds reaches marker → vibrate → oscillator exactly once per ordinary observation in both screens; a suspended port is never resumed. This establishes call reachability in that bounded harness, not mounted React or hardware audibility. Suspended audio time may not advance to onended, so per-boundary contexts can remain allocated. Replaying the same captured effect after the store has immutably replaced its active record produces TWO cue attempts: the setters unconditionally write, without a claim result. src/main.tsx uses StrictMode; a mounted development/remount regression must prove this family rather than assuming the pure nextSignal tests cover effect replay.\n\nOn Mac, policy/site activation may allow a fresh context to run, so missing sound is not universally an unlock diagnosis. On iPhone Safari, delayed context creation without a gesture is vulnerable to autoplay restrictions; interruption can suspend audio again. Installed PWA uses the same cue code and supplies no native alarm route. The graph is connected correctly; 0.3-second decay is potentially easy to miss, but current evidence cannot determine the owner's hardware volume, mute/output routing, interrupted state or exact browser policy. There is no existing local notification/service-worker alarm implementation. Existing pure signal and wake tests prove decisions, not gesture integration or sound. [Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) support gesture creation/resume; [AudioContext state documentation](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) and [WebKit interruption report](https://bugs.webkit.org/show_bug.cgi?id=273511) support lifecycle variants, not a claim that the owner's version has that exact bug.\n\nStageDetail already has safe Remove from pathway, Unlink reference and hidden Restore under ⋯. The inverse exists but is poorly exposed, or the owner runs an older build. membersForSession already derives archive associations and respects unlink suppression but has no production consumer: Lessons and ItemDetail inspect itemIds only. itemFiles independently requires the correct source binding. Classification tests also miss real registry exceptions: six radif درامد variants, two distinct چهارپاره contexts, اتود-وزیری, تمرین-دشتی-1-علیزاده and personal-only بداهه-درامد-افشاری. itemForPiece treats every non-گوشه as full_piece. A composer-attributed چهارپاره-مرادخانی also declares radif source, demonstrating that provenance is not sufficient kind authority. Keeping fresh describes learned material; archive presence proves no learning.\n\nAdditional reproduced scanner sibling: buildIndex with roster [known], an unnamed demo and an unregistered named score diagnoses the score but leaves rosterTrusted=true and assigns the demo to known. The excluded filename vanished before roster consistency was evaluated. This is a real false-attribution defect, unlike intentional exclusion of the PDF.\nThe scanner already accepts arbitrary session-N-DD-MM-YYYY folders and stable registered identities. Ongoing intake is primarily source declaration, not per-session code. Named registered material is scoped exactly; an unnamed demo additionally needs a confirmed roster. A new path has no identity relation to an old path without the log. Replacing bytes at the same path retains the reference and opens the current NAS bytes, even if semantic index fields/hash do not change. File omissions are retained as not described, not proof of deletion. These cases require distinct guidance rather than a Session-40-only worksheet.",
  "desiredBehaviour": "One lane anchored in work-a-pathway-stage, also affecting existing log-a-class, capture-a-practice-item, browse-my-repertoire, practise-todays-recommendation, run-a-session-plan, back-up-and-restore and sync-devices-via-github. Reconcile those existing Flow descriptions after building; introduce no new top-level Flow.\n\n1. Recover through existing archive mechanisms. Keep exact registry identity, unknown-piece exclusion and suppression of deliberately deleted entities. Fix scanner roster trust at its shared attribution boundary: retain recognised named-piece disagreement evidence before filtering unsupported/unregistered assets. A conflicting named piece, including one absent from the registry, prevents unnamed-demo expansion; keep the demo lesson-level and diagnose the uncertainty. Never invent the missing roster from filenames. Add a collapsed recovery disclosure to ArchiveRefresh listing suppressed sessions/pieces/links/resources with precise global or item scope. Restore only the chosen tuple, including itemId, with persistence acknowledgement and stale-preview revalidation, then use normal preview/commit to re-import current source entities. Preserve all other decisions. Explain that source re-import does not recover deleted notes/attachments. Surface diagnostics and suppressed counts even for an already-current graph; distinguish pending/completed changes and metadata choices, and never call Refresh a NAS rescan.\n\nMake intake durable for all normal future sessions/file changes. Retain PIECES.csv as the byte-exact identity and declared-roster authority, and RENAME-LOG.csv as exact path provenance. Reuse the existing scanner, parsers and stable two-read source observation; add an optional read-only --attention mode in scripts/scan-setar-classes.mjs. It emits an actionable report/drafts to stdout only, refuses --out in this mode, and never edits registry, log or media. Normal scheduled scan/publication remains unchanged. This is an operator aid, not a second scanner, importer, persistent ledger or general registry editor. Report paths are archive-relative; no credential/root enters logs or app data.\n\nThe report groups each missing canonical key with observed sessions/roles/files and explains why it is excluded; emits a clearly UNCONFIRMED new-row draft against the registry's ACTUAL header; distinguishes existing-key roster amendments from new identity; and exposes invalid naming, unsupported assets, inconsistent/empty roster attribution and invalid rename-chain evidence with the minimal safe action. Observations are candidates, never a confirmed roster. A row needs only an owner-confirmed exact identity; optional musical fields can remain unknown. Confirm assigned session membership only when needed for unnamed-demo attribution or when declaring actual teaching assignment. No learned status, type, study source or musical meaning is inferred from filename components. For an existing row, preserve all other session declarations, cells, quoting and additional columns; no eight-column positional append. Reuse CSV escaping for copyable drafts and show what must be confirmed before use. For renames, expose current relative paths and the existing old reference/log chain, with a reusable old_path,new_path template. The owner supplies the exact old→new pair; do not suggest a guessed match from size, numbers or similarity. Missing old-path evidence is explicitly unresolved. Keep the app free of filename/reason parsing: the scanner writes actionable diagnostic wording and ArchiveRefresh renders it plus the generic runbook route, current relative references and binding/suppression explanations.\n\nDocument one reusable owner checklist in docs/setar-archive.md, linked from the collapsed attention/recovery surface: (a) ordinary supported files for registered identities require only the existing NAS job/latest publication then Refresh; named files need no redundant per-file registration; (b) a genuinely new identity requires one confirmed registry declaration, using the on-demand report rather than a developer worksheet; (c) unnamed demos remain lesson-level until an independently confirmed roster is declared, with empty versus inconsistent roster explained; (d) a renamed/moved file needs one append-only, exact log continuation if old references/hides are to follow it, after checking existing chains/forks; (e) additions and valid role changes propagate from the new index, same-path byte replacement opens the current NAS file, and omitted paths remain not described with explicit hide/repoint choices. Deliberate suppressions still require explicit restoration. No routine intake requires a code edit, reseeding or another lane. Distinguish scan failure, old runtime, successful unchanged publication, stale published hash, missing registry evidence, unresolved binding and suppression, so repeated task runs are not prescribed for a declaration problem.\n\nKeep the two Session 40 registration proposals and three Session 1 log continuations as worked regression examples of that SAME workflow, not its implementation or ceiling. Musical metadata remains owner/teacher-confirmed. Validate generic drafts and owner-confirmed changes only on temporary corpora, including sessions 41, 42 and a non-consecutive number, new arbitrary identities, and repeat runs. Only the owner applies reviewed source metadata; automated investigation/testing is read-only against real media/registry/logs. Existing NAS task then Refresh suffices after compatible runtime update.\n\n2. Exact rename propagation remains shared. Logged chains update source-generated names/roles/scopes and owned lesson reference paths, while preserving authored titles, notes, rows and ids. Never infer unlogged mappings from part numbers, basename, size, mtime or similarity. Unavailable rows say Not described by the latest index, not that NAS bytes are certainly gone. Distinguish generated old resources from authored old labels, show binding/suppression explanations and reuse Link/Create separately/Skip for uncertain owned records.\n\nWire one shared association selector over explicit lesson.itemIds plus membersForSession resolved through exact bound item identities and instrument, deduplicated by id. Consume it in Lessons, ItemDetail Connected to, its lesson summary, Connections and linkable lists. Label archive associations as provenance, not practice or preparation. Derived Unlink uses the existing narrow link suppression; derived Relink clears that suppression rather than copying membership into itemIds. Manual links remain authored. Association unlinking does not delete independently scoped item material; hiding material is separate.\n\n3. Owner fields remain authoritative after seeding. Offer normal-refresh metadata only when the relevant proposed field changed from the last accepted source field. Unchanged source values never challenge later owner edits. Reuse the accepted graph as the durable baseline, with Use archive value / Keep my value and explicit Apply wording that retains unchosen owner fields while accepting source facts. Do not add a metadata-decision ledger. First adoption preserves owner fields, with any optional comparison before adoption rather than recurring next refresh. An optional Review differences action can inspect already-existing mismatches without changing them.\n\nResolve both literals and refs through existing unique term resolution for dastgah/form/composer; ambiguous/unknown/composite values stay literal. Do not normalise arbitrary gusheh spellings or source identity: بسته‌نگار remains exact owner text. Exact (قطعه) is generic and cannot improve an existing specific form such as ضربی. Use the heading Archive metadata differs. Bind each choice to record id, typed current value and exact proposed value; labels are not identity. Changes to target, field, relevant term meaning or proposal require a fresh preview. Preview/commit summaries agree and no-op refreshes preserve object identity/rev.\n\n4. Carry PIECES.csv's optional source as SourcePiece.studySource through scanner, semantic digest, decoder, checkSourceGraph, accepted/retained graph and exports. Missing is unknown legacy evidence; present empty is explicit empty evidence; present wrong types refuse. Do not infer it from keys, titles or notes. Keep index v1 as a backwards-compatible additive optional field: actual base-reader proof must show older readers safely ignore it without changing existing meanings, and new readers accept old indexes. Bump PracticeDB to schema 16 for the persisted field; migration only advances the version and retains absence, without clock reads, reseeding or item repairs. Base v15 DB readers refuse v16 safely. Deploy compatible app first, then copy all three NAS runtime files using the existing runbook.\n\n5. Add optional Review Setar setup alongside archive recovery, using the actual current device database. Select instrument/pathway explicitly where identity is uncertain; never infer a different Setar instrument from a renamed label. Show per-field before/after/evidence, already-correct rows and exceptions. Bulk accept evidenced proposals; unresolved cases stay unselected with an explicit choice. A separate owner-selected Keeping fresh batch covers only displayed current Setar item ids, with unrecorded/new, resting, fragile/repairing, techniques and parts visible for exclusion. This is not a migration or future import policy.\n\nKind proposals distinguish ordinary gushehs, six radif daramad variants, radif versus composer-attributed chaharpareh, etudes/exercises, personal improvisation, parts and unknown/provisional/composite identities. Declared source provenance alone never establishes kind. Change itemType/gusheh only when selected; retain form/composer/dastgah unless separately selected. The same classification policy seeds new explicit تمرین/اتود as exercise, clear composed works as full_piece and ordinary گوشه as gusheh, asks about ambiguous kinds, and keeps personal-only improvisation as source evidence without silently minting a composed repertoire work. Never delete pre-existing exceptions.\n\nPropose radif placement from resolved modal context in the selected mixed Setar pathway, composed work in its existing composed/forms stage, and explicit exceptions for technical items, parts, custom/missing stages, composite modal identity or conflicting deliberate placement. Placement does not imply catalogue linking. Link only an owner-confirmed stable reference through existing legacy/identity refusal; generic form-category suggestions do not identify individual works and the partial radif catalogue may lack a match. Preserve reference/hidden intent. Propose ردیف میرزا عبدالله from declared studySource or confirmed radif references; choose an existing same-instrument Material explicitly, or create one once after selection. Duplicate candidates, conflicting materialId, different recensions and composed variants are reviewed, never deduplicated by title. Class associations use the shared relation, with manual additions/suppression changes selected explicitly.\n\nCommit only displayed selected ids/fields in one validated store mutation, checking rev and exact before-values, acknowledging persistence and providing a retry that really writes. Preserve active block/routine/plan snapshots, notes, blocks, reviews, dates/provenance, ratings/counters, attachments/bytes, unrelated instruments/items and all unselected fields. A completed rerun is a no-op. Nothing runs automatically on load, hydration, import, sync or ordinary Refresh.\n\n6. Replace native-datalist dependence in every MusicalTermField consumer with one portable suggestions surface alongside free text, with no UA branch or dependency. Reuse vocabulary, termSuggestions and existing search aliases/normalisation for bounded visible matching native buttons and an explicit browse-all choice. Selection stores stable term id. Preserve unedited literals, aliases, clearing, unknown/composite/ambiguous text, composition events, touch/focus/Tab/screen-reader use, archived-term policy, direction and main-only scroll on new/edit forms. Do not automatically accept partial matches. Primary platform evidence: [WebKit datalist regression](https://bugs.webkit.org/show_bug.cgi?id=305719). This motivates independence from the native popup; it does not prove the owner's exact iOS defect.\n\n7. Correct the evidenced gesture/context lifecycle gap in the EXISTING cue, rather than replacing the timer or nextSignal. Before behaviour edits, reproduce the actual screen/marker/cue path through mounted browser controls with instrumented AudioContext, vibration and fixed wall time; preserve the red/current trace alongside the correction. The in-memory evidence above is not a substitute for that route. Record constructor, state, synchronous resume invocation, oscillator scheduling/routing and marker claim in order, with explicit limits on what fake ports and browser audio graphs prove.\n\nUse one page-lifetime AudioContext shared by the existing cue callers, created lazily and resumed synchronously during actual Start/Resume/Test sound click handlers, before any await/navigation. Do not create a fresh context in the later boundary effect or close the shared context after each oscillator. Keep the connected oscillator/gain path; clean up short-lived nodes. Treat running as engine readiness, never proof of audible hardware output. Rejected, hanging, suspended, interrupted, closed or unsupported states do not block starting/practising, throw a page error, queue an old cue or silently claim readiness. A closed context can be replaced only on an explicit gesture after its predecessor is closed; do not keep parallel contexts or retry/recreate forever. State changes can update a calm unavailable/interrupted indication and a one-tap sound recovery on the practice screen; they cannot unlock from render/effect or replay consumed boundaries. Do not force an audio-session category, play continuous/silent background audio or add a workaround dependency without new concrete evidence.\n\nSweep Today recommendation/review/direct starts, StartBlock, ItemDetail/next item, StageDetail, routine cards/duration/essentials, pending/initial/later Session Plan segments, ActiveBlock Resume, CloseBlock Resume, RoutineRunner Resume and direct routine URLs. Starting a pending plan alone does not start its clock: each actual Begin must retain gesture activation. Routine card Start remains one tap: move actual start into the originating click handler using existing segmentsForRun, as RoutineDuration already does, then navigate; a bare routine URL offers explicit Start rather than silently starting from an effect. Existing running routes resume/redirect without replacing work; navigating to an already running clock does not restart it. Update the existing routine-notes browser journey's initial direct-route assumption to click Start, retaining its cross-boundary ownership proof.\n\nStrengthen acknowledgement at the existing store marker setters, not with another timer/counter. Have an atomic claim return whether this call advanced the marker for the still-current captured clock; only a successful claim attempts the cue. Reject stale/replaced/paused clock claims, repeated effect setup and already-consumed boundaries. A refused claim advances nothing, so current valid observation can reconcile. Preserve nextSignal's at-most-one catch-up announcement and acknowledgeThrough's silent Skip. Audio failure still consumes the valid announcement and preserves the visual cue; sound recovery never retries historical boundaries. Verify synchronous/repeated effects, navigation/remount, interruption, final routine save and cancellation/replacement interleavings before review.\n\nSettings Test practice sound uses that same context/cue and changes no practice record, minutes, marker, result or wake lock. Address clarity with a short, bounded two-pulse cue using the existing oscillator/envelope, not a new sound asset/system. The current 880 Hz/0.2/0.3-second cue is the measured starting point; prove scheduling/envelope/routing automatically and certify normal-volume distinguishability only on real devices. Keep pulse count/duration/gain in one small implementation, not a configurable cue library or an A/B product flow. Actual device failure is diagnosed using recorded context state and output/mute/volume/interruption, then corrected at the evidenced layer; do not treat louder gain as a permission fix.\n\nRetain persistent block target/overtime, routine arrival window and best-effort vibration, single wake-lock ownership, existing minutes and routine completion. Edit AGENTS.md's audio rule in place to permit explicit Start/Resume/Test/recovery gestures including Resume on an active screen, while forbidding effect/render unlock. Mac policy, iPhone Safari and installed PWA have separate real-device outcomes; unsupported vibration and media-volume/mute/output routing are not promised away. Hidden/locked execution and timely sound cannot be guaranteed; foreground catch-up remains the same wall-clock/marker decision. [AudioContext interruption/state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state) informs recovery limits; [Apple Web Push requirements](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) do not provide an offline local alarm. Add no notification/push service. The native phone timer may be mentioned only as an optional external locked-screen alarm, never integrated as a second practice clock.\n\n8. Make Remove from pathway (keeps item) visible after Add and clearly available on owned rows, reusing planRemoveFromPathway. Explain this pathway's hide/detach while retaining the library item, bindings and data; retain Play as primary. Hidden Restore resolves the same owned item, never creates it again. Keep advanced Unlink and destructive Delete distinct. Ambiguous legacy evidence refuses visibly. Sweep ordinary, shared-radif and course references plus progress/next/Today/plan/routine consumers.\n\nBuild checklist / next three actions: (1, highest leverage) commit independent family fixtures, expected outcomes and reader/writer matrix before behaviour edits, reproducing failures at their actual layers. (2) Build source decoding/reconciliation, shared association and selected-patch review before recovery UI; prove each local writer remains inbound-valid. (3) Wire portable terms, sound gestures and visible safe removal; run the focused route, targeted mutations and required lint/typecheck/npm test/build/secrets checks. Before first review, docs/setar-practice-reliability.md maps every invariant/consumer/equivalence class/interaction to the exact named acceptance and command. Rework addresses the named failure and sweeps its family, not endless unchanged wholesale reruns.",
  "mustNotChange": [
    "One item, one mode, one focus, one result, one next action; two ordinary creation doors; optional low-admin metadata.",
    "Byte-exact source keys, deterministic source ids, stable catalogue refs, legacy text, and distinct placement/binding/owned work.",
    "Archive facts never fabricate learning, recorded practice, results, reviews, progress or deadlines; imported classes remain history.",
    "Review scheduling authority, only-close review advancement, unfinished-practice replacement guards and attachment-byte safety.",
    "IndexedDB truth, explicit whole-snapshot GitHub conflicts, independent backups, device-local secrets/base, free/offline operation and current CSP.",
    "Shared pure domain decisions, acknowledged saves, existing wall-clock/marker/skip rules and single wake-lock ownership.",
    "Real-media read-only investigation/testing, no symlink following, fabricated filename identity, destructive archive operations, retired deployment or rsync --delete."
  ],
  "assumptions": [
    "A1: Sandisk inspection proves this local corpus only. Live DSM runtime/publication and private browser state were not read; bounded runtime comparison and actual-device review distinguish those alternatives.",
    "A2: Registry authority covers exact identity, declared provenance and roster. Musical meaning/learning and deliberate metadata remain the owner's/teacher's authority.",
    "A3: Keeping fresh is a selected batch over current listed ids with visible exceptions, not automatic eligibility for future imports."
  ],
  "possibleConflicts": [
    "The schema has one anchor flowId. Supporting affected existing Flows named above require post-build reconciliation, not a fictional new Flow.",
    "Current audio instructions prohibit unlock on practice screens. Change that rule only to permit explicit Start/Resume/Test gestures; no hard do-not is waived.",
    "Radif provenance includes a composed chaharpareh and the shipped selection is partial. Leave uncertain kind/recension/reference/stage unselected; invent no repertoire authority.",
    "Old v15 devices refuse v16 snapshots. Update both production devices before sharing new state; an isolated preview must not connect to real sync. NAS runtime copies require an explicit update."
  ],
  "scope": {
    "allow": [
      "AGENTS.md",
      "DECISIONS.md",
      "docs/setar-archive.md",
      "docs/nas-topology.md",
      "docs/repertoire-experience.md",
      "docs/setar-practice-reliability.md",
      "scripts/scan-setar-classes.mjs",
      "scripts/check-setar-practice-families.mjs",
      "src/domain/sourceArchive.ts",
      "src/domain/sourceReconcile.ts",
      "src/domain/setarSetup.ts",
      "src/domain/itemFiles.ts",
      "src/domain/musicTerms.ts",
      "src/domain/types.ts",
      "src/domain/migrations.ts",
      "src/domain/io.ts",
      "src/domain/index.ts",
      "src/store/useStore.ts",
      "src/store/archiveIndex.ts",
      "src/components/ArchiveRefresh.tsx",
      "src/components/SetarSetupReview.tsx",
      "src/components/MusicalTermField.tsx",
      "src/components/ItemMaterial.tsx",
      "src/components/practiceCue.ts",
      "src/components/useScreenAwake.ts",
      "src/components/RoutineDuration.tsx",
      "src/pages/Lessons.tsx",
      "src/pages/ItemDetail.tsx",
      "src/pages/StageDetail.tsx",
      "src/pages/PathwayDetail.tsx",
      "src/pages/Today.tsx",
      "src/pages/StartBlock.tsx",
      "src/pages/ActiveBlock.tsx",
      "src/pages/CloseBlock.tsx",
      "src/pages/RoutineRunner.tsx",
      "src/pages/SessionPlan.tsx",
      "src/pages/Settings.tsx",
      "src/styles/global.css",
      "src/domain/sourceReconcile.test.ts",
      "src/domain/setarSetup.test.ts",
      "src/domain/io.test.ts",
      "src/domain/migrations.test.ts",
      "src/domain/musicTerms.test.ts",
      "src/domain/practiceSignal.test.ts",
      "src/domain/referenceCatalog.test.ts",
      "src/domain/itemFiles.test.ts",
      "src/store/archiveIndex.test.ts",
      "src/components/practiceCue.test.ts",
      "src/components/screenAwake.test.ts",
      "src/components/direction.test.ts",
      "tests/setar-practice-source.test.ts",
      "tests/setar-practice-inbound.browser.test.ts",
      "tests/setar-practice.browser.test.ts",
      "tests/setar-practice-relations.test.ts",
      "tests/setar-practice-proof.test.ts",
      "tests/musical-term-suggestions.browser.test.ts",
      "tests/practice-cues.browser.test.ts",
      "tests/setarArchive.browser.test.ts",
      "tests/setarInbound.browser.test.ts",
      "tests/repertoire-experience.browser.test.ts",
      "tests/repertoire-inbound.browser.test.ts",
      "tests/agent-context.test.ts",
      "tests/owned-writes.test.ts",
      "tests/fixtures/setar-practice-source-v1.json",
      "tests/fixtures/setar-practice-source-expectations.json",
      "tests/fixtures/setar-practice-owner-v15.json",
      "tests/fixtures/setar-practice-owner-v16.json",
      "tests/fixtures/setar-practice-setup-expectations.json",
      "tests/practice-information.browser.test.ts"
    ],
    "forbid": [
      ".github/**",
      "src/domain/courseData.ts",
      "src/domain/khonyagarData.ts",
      "scripts/deploy-nas.sh",
      "scripts/nas-mirror.mjs",
      "scripts/publish-setar-index.mjs",
      "scripts/run-setar-index.sh",
      "package.json",
      "package-lock.json"
    ]
  },
  "exclusions": [
    "No backend/push service/auth/native app/paid service/dependency, second timer, audio analysis or background alarm guarantee.",
    "No fingerprinting, fuzzy relocation, archive identity/protocol redesign, app NAS crawler, branch/path changes, sync redesign or second importer. Optional studySource is the only saved shape extension.",
    "No automatic bulk repair, title merge/source deduplication, deletion as an inverse, overwrite of unrelated fields or interpretation of source prose as authority.",
    "No live media/registry/log/browser-data/GitHub writes by the planner or automated builder investigation; only the owner applies reviewed generic source metadata drafts and selected private-data changes.",
    "No general cleanup, viewport redesign, canon expansion, course regeneration, infrastructure redesign or unrelated AGENTS open-gap fixes.",
    "No unwired readIndexFile UI, generalized registry administration, metadata-decision ledger or new recovery-history collection."
  ],
  "acceptance": [
    {
      "description": "tests/setar-practice-source.test.ts: run the scanner's generic --attention CLI on temporary corpora, stdout-only versus refused --out, checking a normal unchanged scan has identical source semantics. Use real/reordered/quoted ten-column headers with extra columns and existing notes/roster cells. Report new key/observed session/role, clearly unconfirmed drafts and minimal actionable next step; apply independently authored OWNER-confirmed metadata patches on temp fixtures only, then rescan. Session 40's two keys and Session 1's three continuations remain regressions. Add parameterised 41/42/non-consecutive future numbers and wholly new identities; known piece/new session requires no redundant registration for named files, whereas unnamed demos require a confirmed roster. No developer-generated per-session worksheet, hard-coded future key or inferred roster may pass. Cross unknown/registered keys, absent/correct/inconsistent rosters, numeric demo parts, personal takes, duplicate keys, quoted commas, cycle/fork/cross-session moves, same-path role-compatible byte replacement, additions/omissions and interrupted reads. Independently authored expectations prove scopes and unchanged fixture media bytes under report/scan; only fixture owner steps change source metadata. Unknown recognised named files with empty/non-empty registry rosters block inferred demo attribution even if filtered earlier; correct registration plus confirmed roster restores it. Invalid inputs explain or fail safely without publishing a partial draft as confirmed. Repeating a correct report/scan/owner patch is idempotent. Removing disagreement checks or substituting positional CSV append must fail this named test.",
      "test": "setar durable intake preserves registry authority and exact rename evidence without changing media"
    },
    {
      "description": "One named acceptance in tests/setar-practice-inbound.browser.test.ts owns the matrix, with uniquely named supporting domain tests. Missing/empty/known/unknown versus null/number/object studySource runs through scanner/digest, parseSourceIndex, fetch/file decoder, checkSourceGraph, validateDB, both persist migrate/merge, state/full import, pull, Keep remote, archive restore and cold recovery. Base-HEAD reader accepts the additive v1 index without changed old meanings and safely refuses v16 DB. Clock-free idempotent migration retains missing evidence. Compare canonical export/hash and attachment bytes, malformed refusal before blob replacement, too-new refusal and unfinished-practice guards. Chromium blobs; WebKit state-only.",
      "test": "setar study provenance survives compatible indexes and every saved data boundary"
    },
    {
      "description": "tests/setar-practice.browser.test.ts: Chromium/WebKit × phone/desktop × piece/session/link/global-resource/item-scoped-resource × current/missing entity. Include one shared path hidden on two different items, deletion versus manual class, stale preview and failed-save/retry/reload/reinstall. Only selected tuple clears; Class 40 source facts return once without claiming recovery of deleted notes/files. Normal Refresh never resurrects suppressed data, and no-op UI still shows attention counts. Include future sessions and simultaneous source changes; generic restoration is never special-cased to 40.",
      "test": "setar recovery restores only the selected suppression through owner controls"
    },
    {
      "description": "tests/setar-practice.browser.test.ts: actual scanner-built fixture → injected publisher → fake GitHub SHA-pinned fetch → digest/graph → controls/commit → Lessons and both pieces. Cross unchanged/interrupted/racing publication, intentionally stale publication, refused digest and Skip/link/hide. Each PDF scopes to its piece, demo to confirmed roster, class recording to lesson, personal takes to no material list. Verify commit/hash displayed and unrelated practice preserved. No live credential/network/NAS request. Repeat the full control journey with independently constructed Session 41/42/non-consecutive folders and new keys: attention → generic report/draft → explicit fixture owner confirmation → scanner → injected existing publisher → SHA-pinned refresh → source-bound item/lesson material. Add registered PDFs/videos, unnamed demos, role change, multi-hop exact rename, omissions and same-path byte replacement. A unchanged semantic hash on same-size replacement is intentional: the reference still targets current NAS bytes, with no fingerprint/cache identity invention. Temporary fake media endpoints/targets may prove resolver mechanics, never live NAS audibility/reachability. Unresolved keys/rosters/renames show the minimal safe action and import only the independently supported facts; no fresh code lane is needed. Future-dated imported lessons remain archive history, new items remain dormant with zero practice, and neither roster nor catalogue placement implies a preparation deadline or review progress.",
      "test": "setar publish fetch and refresh carry source corrections to lessons and item material"
    },
    {
      "description": "src/domain/sourceReconcile.test.ts: source-generated resources/authored refs/legacy prefixes/verified and foreign URLs × single/multi-hop/cross-session/unlogged/cyclic/forked renames × absent/present destination × global/item-scoped hide. Independently assert adoption, retainMissing, path repair, suppression re-key, lessonFiles/itemFiles. Generated Class 1 names/roles/scopes change only on exact evidence; authored ids/titles/notes survive. Unlogged rows remain labelled not described. Repeat is a no-op; degraded→full source recovers without owner loss. Cross future session numbers/new keys and namespace-compatible role changes; app parsing a filename or silently matching disappeared/added paths cannot pass.",
      "test": "setar rename consumers preserve authored metadata and never infer missing provenance"
    },
    {
      "description": "tests/setar-practice-relations.test.ts: explicit/derived/both/unresolved membership × same title/different id/instrument × unavailable/deleted entities × suppression scopes. One selector serves Lessons, Connected to, lesson summary, Connections and linkable choices without duplicate ids. Browser companion drives Unlink/Relink/reload: derived relink clears only its link suppression, never copies source membership into itemIds/agenda. Independently scoped material and authored manual associations remain.",
      "test": "setar association readers agree without copying source membership into owner history"
    },
    {
      "description": "src/domain/sourceReconcile.test.ts: every field × unchanged/changed relevant source/unrelated hash churn/first adoption/disappearance/reappearance × empty/literal/ref/unique alias/ambiguous/composite × generic (قطعه)/gusheh hyphen-ZWNJ/provisional confidence. Keep reported بسته‌نگار and ضربی exactly. Keep mine settles through repeat/reload/reinstall using accepted graph; Review differences stays opt-in. Assert summaries/write agreement, object identity and rev on no-op.",
      "test": "setar metadata refresh offers only new meaningful source proposals"
    },
    {
      "description": "src/store/archiveIndex.test.ts with uniquely named control companion: all four fields × typed empty/literal/ref × term rename/meaning change/same-label different-id × deleted/rebound/moved item/proposal drift/unrelated notes. UI passes typed premise/proposal; stale choices cause fresh preview and zero overwrite. Correct the existing test endorsing label identity. Chosen fields write once, untouched fields survive and failed persistence retries durably.",
      "test": "setar metadata choices refuse every changed identity and premise before a write"
    },
    {
      "description": "src/domain/setarSetup.test.ts: independently declared ordinary gushehs/six daramads/two chaharpareh contexts/etude/exercise/personal-only improv/parts/technique/unknown/provisional/composite × missing/custom/conflicting stages × partial/missing/shared Setar-Tar refs × duplicate/other-recension materials. Status, kind, placement, reference, source and class proposals stay separate. Radif provenance alone cannot classify kind and form-category refs never identify works. New import defaults preserve dormant/zero practice; pre-existing exceptions are reviewed, never deleted.",
      "test": "setar setup proposals distinguish learning organisation and source evidence"
    },
    {
      "description": "src/domain/setarSetup.test.ts plus store support: correct/selected/excluded/later-arriving rows × instrument/pathway/rev/typed-premise drift × conflicting legacy/live refs × validation/save failure and retry. Apply exact displayed ids/fields in one set. Compare ALL untouched notes/history/reviews/dates/provenance/ratings/counts/clocks/routines/plans/attachments and bytes. Create selected source once, never cross-instrument/title-deduplicate. Written states pass validateDB round-trip; completed repeat has same object/rev.",
      "test": "setar setup commits selected rows atomically idempotently and without collateral changes"
    },
    {
      "description": "tests/setar-practice.browser.test.ts: synthetic owner-shaped fixtures, actual review controls, distinct Keeping fresh batch/exclusions and duplicate-source/ambiguous-stage choices. Change unrelated data during preview, fail/retry save, reload and repeat in both engines. Evidence/before/after visible; Saved waits for acknowledgement. No private owner dump, debug hook or source-regex journey; no unseen row joins selection.",
      "test": "setar setup review is usable through controls and survives interruption"
    },
    {
      "description": "tests/musical-term-suggestions.browser.test.ts: new/edit × three fields × phone/desktop × Chromium/WebKit. Type partial Farsi/Latin/name/alias; select VISIBLE matches by touch/click/keyboard; browse all/clear/unknown/composite/ambiguous/composition input. Include custom/renamed/archived terms, preserved other literals, focus/blur and no premature submit, reload/offline. Finished-name fill or option-markup existence cannot pass.",
      "test": "musical term suggestions can be found and selected while typing in both engines"
    },
    {
      "description": "One exact test in tests/setar-practice.browser.test.ts with uniquely named term companion: both engines/light-dark/390x844/long mismatched-language text/large text/keyboard focus/44px actions. Extend literal-dir ledgers; verify independently directed values and start alignment. Only main scrolls; no fixed/sticky/guessed viewport workaround; drafts remain usable. Existing contrast and instruction budget gates stay green.",
      "test": "portable term and recovery controls preserve direction focus and scroll ownership"
    },
    {
      "description": "One acceptance in tests/practice-cues.browser.test.ts, supported by src/components/practiceCue.test.ts: BEFORE behaviour edits, drive current mounted Start/Resume and natural target controls and record the evidenced marker→cue→new context/no resume failure, rather than inferring integration from a pure signal test. Corrected entry matrix covers Today recommendation/review/direct, StartBlock, item/next, stage, routine cards/duration/essentials, pending-plan creation versus each initial/later Begin, ActiveBlock/CloseBlock/RoutineRunner Resume, Settings Test sound and practice-screen sound recovery. Inject AudioContext/vibration/wake ports and observe constructor/resume invocation synchronously inside the click before awaits/navigation; later boundaries reuse the same context. Observe oscillator→gain→destination, bounded two-pulse start/stop/envelope and node cleanup. Bare routine URL requires Start; card Start remains one tap; existing clock routes never replace/restart work. Update and rerun the existing routine Working-notes journey without dropping ownership assertions. Running/suspended/interrupted/closed/unsupported/constructor throw/resume throw/reject/never-settle/concurrent repeated gestures and refused-dual-clock cases cannot leak/stack contexts, block practice, falsely claim audible output, queue old tones or change saved data. Test/recovery cue changes neither clocks/markers/wake lock nor history. Add one smoke route using the real browser WebAudio engine with normal policy, observing running state and scheduled completion; no forced autoplay flag or hardware-audibility assertion. Real PWA speaker/mute behaviour remains OWNER.",
      "test": "practice sound reuses one gesture primed context across all start and resume doors"
    },
    {
      "description": "tests/practice-cues.browser.test.ts: fixed-clock block/plan/routine × natural target/intermediate/final/pause-resume/zero-time repeated skips/multi-boundary background catch-up/reload/absent marker. Drive actual mounted screens and record marker claim, visual state, cue attempt and saved outcome in order. Normal foreground reached boundaries produce exactly one claim/cue attempt; jump across multiple boundaries produces ONE catch-up attempt, not one per missed boundary. Replay the same captured effect, development StrictMode setup/remount, navigation, concurrent observation, stale/replaced/paused clock, final-save/cancel interleavings and a failed/pending/interrupted audio path. Only an atomic still-current-clock claim may attempt sound; consumed boundaries never replay on audio recovery or Resume, and Skip never cues. Persistent visual target/overtime/window survives unsupported sound. Independent wall-clock expectations match ALL saved minutes/results/reviews; blocks never auto-finish and existing routine completion/working-note ownership remains unchanged. Include actual store-marker methods, not an in-test model or source regex. Pure nextSignal/wake checks support mechanics; they cannot certify mounted effect exactly-once or hardware audibility.",
      "test": "practice cues preserve wall clock boundaries and every recorded minute"
    },
    {
      "description": "tests/setar-practice.browser.test.ts: Add→visible Remove→hidden Restore→Play, fresh/enriched/practised × ordinary/shared radif/course × second pathway × placed-unlinked/ambiguous legacy. Same id, notes/history/reviews/files/source/class/routine links survive. Only selected pathway visibility/placement changes; bindings stay; repeat Add/Restore cannot duplicate. Sweep stage/progress/next/currentStage/Today/plan/routine visibility. Unlink/Delete remain distinct.",
      "test": "pathway removal and restoration visibly retain the existing owned item"
    },
    {
      "description": "tests/setar-practice-proof.test.ts checks the focused runner's list/manifest mode without recursively running itself. node scripts/check-setar-practice-families.mjs resolves titles one-to-one and runs committed fixtures/fixed seeds/clocks and both-engine control companions through practiceBrowser; missing browsers fail, all page errors remain, private Vite caches. Before first review record named failure for individually dropping provenance at scanner/decoder/inbound sites, widening restoration scope, missing relation consumer, same-label premises, reoffering unchanged metadata, bypassing selected-patch guard, omitted gesture door, datalist-only selection and delete/unbind removal. Restore each temporary mutation; source scans/documentation alone cannot prove behaviour. Extend mutations to a hard-coded session ceiling/key, auto-confirmed roster/draft, malformed header-preservation, unlogged rename guess, per-boundary context recreation, missing resume/state gate, unconditional marker claim or effect replay, queued delayed sound, and moving routine Start back into an effect. Each targeted mutation must fail the corresponding focused behavioural check and leave unrelated tests out of the proof argument. Include the future-intake report and actual pre-fix cue trace in the reader/writer matrix before implementation.",
      "test": "setar practice family proof rejects targeted partial fixes before review"
    },
    {
      "description": "Preserve one bounded real-device session: Mac normal browser plus iPhone Safari and installed PWA over verified secure context, recording build/browser/iOS/keyboard/output route and volume. iPhone checks partial Farsi/Latin term selection/draft retention/native keyboard dismissal. On each platform use Test sound, then short foreground block and routine boundaries, Pause/Resume and one background/lock-return interruption. Compare actual audibility/clear two-pulse recognition at normal media volume with the visual cue; record observed mute/output/interruption behaviour and recovery gesture with context state, never a locked-screen deadline guarantee. Starting a routine from its card stays one tap. Hardware/OS policy/native keyboard are the only reasons this is OWNER: all entry wiring, waveform scheduling, boundaries, persistence and interruption mechanics are automated. Unmerged v16 preview uses isolated data/origin with no real sync; retain native Safari versus installed PWA evidence separately.",
      "test": "manual:OWNER"
    },
    {
      "description": "Preserve one bounded live recovery/intent check: owner uses the SAME generic intake report/runbook that future sessions use, reviews/applies the two confirmed Session 40 registry declarations/roster and three Session 1 exact log continuations, updates all three NAS runtime files after compatible app deployment, runs the existing job and compares publication/commit/hash with Refresh. Explicitly restore Class 40 and open both PDFs/three ordered demos from Lessons and intended source-bound items on Mac/iPhone. Review actual private-data exceptions before selected Setar correction. No additional real future class is required for OWNER: synthetic future numbers/new identities/changed files and report/actions are automated. Builder supplies generic read-only comparison/reporting rather than a bespoke repair worksheet; real DSM/Drive/media reachability, genuine old→new declarations and musical intent remain OWNER. Re-import cannot recover deleted notes/bytes; independent backup is needed. No automated media/registry/log writes, retired deployment, deletion or credential logging.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "HEAVY: saved schema/provenance, scoped durable restoration and selected bulk metadata/placement/source writes cross identity and transaction boundaries. Real media is read-only; auth/publisher targeting and payment concerns are unchanged."
  },
  "delta": {
    "today": "Taking archive-backed work into a pathway is difficult to understand and reverse: omissions/suppressions are opaque, class associations invisible, unchanged source fields repeatedly challenge owner edits and native suggestions/audio differ across devices.",
    "instead": "Import ordinary future sessions predictably, see the minimal safe declaration for missing source evidence, restore only what you choose, review Setar organisation without rewriting practice, retain deliberate metadata, remove/restore pathway membership while keeping the owned item, choose terms on either device and hear a gesture-enabled cue with an honest visual fallback.",
    "keep": [
      "Owned items remain the only practice units.",
      "Exact source/catalogue identity and explicit choices govern reuse.",
      "Source evidence never fabricates learning or practice; media stays on the NAS."
    ],
    "assumptions": [],
    "showMe": "Run node scripts/check-setar-practice-families.mjs on committed independent fixtures and both browser engines: generic intake report with future numbers/new identities plus scan/publish/fetch/refresh, scoped restore, associations, selected repairs/refusals, metadata deltas, visible term selection, actual Start/Resume/marker-claim/cue ports and effect replay, and Add/remove/restore. Provide focused mutation failures before review; reserve only native-device and live-source/owner-intent checks for OWNER."
  },
  "desiredRules": [],
  "docsDelta": [
    "AGENTS.md",
    "DECISIONS.md",
    "docs/setar-archive.md",
    "docs/nas-topology.md",
    "docs/repertoire-experience.md",
    "docs/setar-practice-reliability.md"
  ]
}
```
````

## The Delta this change was framed from

# Import ordinary future sessions predictably, see the minimal safe declaration for missing source evidence, restore only what you choose, review Setar organisation without rewriting practice, retain deliberate metadata, remove/restore pathway membership while keeping the owned item, choose terms on either device and hear a gesture-enabled cue with an honest visual fallback.

_approved · about "work-a-pathway-stage"_

## Today

Taking archive-backed work into a pathway is difficult to understand and reverse: omissions/suppressions are opaque, class associations invisible, unchanged source fields repeatedly challenge owner edits and native suggestions/audio differ across devices.

## Instead

Import ordinary future sessions predictably, see the minimal safe declaration for missing source evidence, restore only what you choose, review Setar organisation without rewriting practice, retain deliberate metadata, remove/restore pathway membership while keeping the owned item, choose terms on either device and hear a gesture-enabled cue with an honest visual fallback.

## Keep

- Owned items remain the only practice units.
- Exact source/catalogue identity and explicit choices govern reuse.
- Source evidence never fabricates learning or practice; media stays on the NAS.

## New assumptions

_none_

## Show me

Run node scripts/check-setar-practice-families.mjs on committed independent fixtures and both browser engines: generic intake report with future numbers/new identities plus scan/publish/fetch/refresh, scoped restore, associations, selected repairs/refusals, metadata deltas, visible term selection, actual Start/Resume/marker-claim/cue ports and effect replay, and Add/remove/restore. Provide focused mutation failures before review; reserve only native-device and live-source/owner-intent checks for OWNER.



## Files in this diff

- AGENTS.md
- DECISIONS.md
- docs/nas-topology.md
- docs/repertoire-experience.md
- docs/setar-archive.md
- docs/setar-practice-reliability.md
- scripts/check-setar-practice-families.mjs
- scripts/scan-setar-classes.mjs
- src/components/ArchiveRefresh.tsx
- src/components/ItemMaterial.tsx
- src/components/MusicalTermField.tsx
- src/components/SetarSetupReview.tsx
- src/components/direction.test.ts
- src/components/practiceCue.test.ts
- src/components/practiceCue.ts
- src/components/useScreenAwake.ts
- src/domain/index.ts
- src/domain/io.test.ts
- src/domain/migrations.ts
- src/domain/setarSetup.test.ts
- src/domain/setarSetup.ts
- src/domain/sourceArchive.ts
- src/domain/sourceReconcile.test.ts
- src/domain/sourceReconcile.ts
- src/domain/types.ts
- src/pages/ActiveBlock.tsx
- src/pages/ItemDetail.tsx
- src/pages/Lessons.tsx
- src/pages/PathwayDetail.tsx
- src/pages/RoutineRunner.tsx
- src/pages/Settings.tsx
- src/pages/StageDetail.tsx
- src/pages/Today.tsx
- src/store/archiveIndex.test.ts
- src/store/useStore.ts
- src/styles/global.css
- tests/agent-context.test.ts
- tests/fixtures/setar-practice-owner-v15.json
- tests/fixtures/setar-practice-owner-v16.json
- tests/fixtures/setar-practice-setup-expectations.json
- tests/fixtures/setar-practice-source-expectations.json
- tests/fixtures/setar-practice-source-v1.json
- tests/musical-term-suggestions.browser.test.ts
- tests/practice-cues.browser.test.ts
- tests/practice-information.browser.test.ts
- tests/setar-practice-inbound.browser.test.ts
- tests/setar-practice-proof.test.ts
- tests/setar-practice-relations.test.ts
- tests/setar-practice-source.test.ts
- tests/setar-practice.browser.test.ts
- tests/setarArchive.browser.test.ts

## Check against the contract

- [ ] **ac-1** — tests/setar-practice-source.test.ts: run the scanner's generic --attention CLI on temporary corpora, stdout-only versus refused --out, checking a normal unchanged scan has identical source semantics. Use real/reordered/quoted ten-column headers with extra columns and existing notes/roster cells. Report new key/observed session/role, clearly unconfirmed drafts and minimal actionable next step; apply independently authored OWNER-confirmed metadata patches on temp fixtures only, then rescan. Session 40's two keys and Session 1's three continuations remain regressions. Add parameterised 41/42/non-consecutive future numbers and wholly new identities; known piece/new session requires no redundant registration for named files, whereas unnamed demos require a confirmed roster. No developer-generated per-session worksheet, hard-coded future key or inferred roster may pass. Cross unknown/registered keys, absent/correct/inconsistent rosters, numeric demo parts, personal takes, duplicate keys, quoted commas, cycle/fork/cross-session moves, same-path role-compatible byte replacement, additions/omissions and interrupted reads. Independently authored expectations prove scopes and unchanged fixture media bytes under report/scan; only fixture owner steps change source metadata. Unknown recognised named files with empty/non-empty registry rosters block inferred demo attribution even if filtered earlier; correct registration plus confirmed roster restores it. Invalid inputs explain or fail safely without publishing a partial draft as confirmed. Repeating a correct report/scan/owner patch is idempotent. Removing disagreement checks or substituting positional CSV append must fail this named test. _(proof: setar durable intake preserves registry authority and exact rename evidence without changing media)_
- [ ] **ac-2** — One named acceptance in tests/setar-practice-inbound.browser.test.ts owns the matrix, with uniquely named supporting domain tests. Missing/empty/known/unknown versus null/number/object studySource runs through scanner/digest, parseSourceIndex, fetch/file decoder, checkSourceGraph, validateDB, both persist migrate/merge, state/full import, pull, Keep remote, archive restore and cold recovery. Base-HEAD reader accepts the additive v1 index without changed old meanings and safely refuses v16 DB. Clock-free idempotent migration retains missing evidence. Compare canonical export/hash and attachment bytes, malformed refusal before blob replacement, too-new refusal and unfinished-practice guards. Chromium blobs; WebKit state-only. _(proof: setar study provenance survives compatible indexes and every saved data boundary)_
- [ ] **ac-3** — tests/setar-practice.browser.test.ts: Chromium/WebKit × phone/desktop × piece/session/link/global-resource/item-scoped-resource × current/missing entity. Include one shared path hidden on two different items, deletion versus manual class, stale preview and failed-save/retry/reload/reinstall. Only selected tuple clears; Class 40 source facts return once without claiming recovery of deleted notes/files. Normal Refresh never resurrects suppressed data, and no-op UI still shows attention counts. Include future sessions and simultaneous source changes; generic restoration is never special-cased to 40. _(proof: setar recovery restores only the selected suppression through owner controls)_
- [ ] **ac-4** — tests/setar-practice.browser.test.ts: actual scanner-built fixture → injected publisher → fake GitHub SHA-pinned fetch → digest/graph → controls/commit → Lessons and both pieces. Cross unchanged/interrupted/racing publication, intentionally stale publication, refused digest and Skip/link/hide. Each PDF scopes to its piece, demo to confirmed roster, class recording to lesson, personal takes to no material list. Verify commit/hash displayed and unrelated practice preserved. No live credential/network/NAS request. Repeat the full control journey with independently constructed Session 41/42/non-consecutive folders and new keys: attention → generic report/draft → explicit fixture owner confirmation → scanner → injected existing publisher → SHA-pinned refresh → source-bound item/lesson material. Add registered PDFs/videos, unnamed demos, role change, multi-hop exact rename, omissions and same-path byte replacement. A unchanged semantic hash on same-size replacement is intentional: the reference still targets current NAS bytes, with no fingerprint/cache identity invention. Temporary fake media endpoints/targets may prove resolver mechanics, never live NAS audibility/reachability. Unresolved keys/rosters/renames show the minimal safe action and import only the independently supported facts; no fresh code lane is needed. Future-dated imported lessons remain archive history, new items remain dormant with zero practice, and neither roster nor catalogue placement implies a preparation deadline or review progress. _(proof: setar publish fetch and refresh carry source corrections to lessons and item material)_
- [ ] **ac-5** — src/domain/sourceReconcile.test.ts: source-generated resources/authored refs/legacy prefixes/verified and foreign URLs × single/multi-hop/cross-session/unlogged/cyclic/forked renames × absent/present destination × global/item-scoped hide. Independently assert adoption, retainMissing, path repair, suppression re-key, lessonFiles/itemFiles. Generated Class 1 names/roles/scopes change only on exact evidence; authored ids/titles/notes survive. Unlogged rows remain labelled not described. Repeat is a no-op; degraded→full source recovers without owner loss. Cross future session numbers/new keys and namespace-compatible role changes; app parsing a filename or silently matching disappeared/added paths cannot pass. _(proof: setar rename consumers preserve authored metadata and never infer missing provenance)_
- [ ] **ac-6** — tests/setar-practice-relations.test.ts: explicit/derived/both/unresolved membership × same title/different id/instrument × unavailable/deleted entities × suppression scopes. One selector serves Lessons, Connected to, lesson summary, Connections and linkable choices without duplicate ids. Browser companion drives Unlink/Relink/reload: derived relink clears only its link suppression, never copies source membership into itemIds/agenda. Independently scoped material and authored manual associations remain. _(proof: setar association readers agree without copying source membership into owner history)_
- [ ] **ac-7** — src/domain/sourceReconcile.test.ts: every field × unchanged/changed relevant source/unrelated hash churn/first adoption/disappearance/reappearance × empty/literal/ref/unique alias/ambiguous/composite × generic (قطعه)/gusheh hyphen-ZWNJ/provisional confidence. Keep reported بسته‌نگار and ضربی exactly. Keep mine settles through repeat/reload/reinstall using accepted graph; Review differences stays opt-in. Assert summaries/write agreement, object identity and rev on no-op. _(proof: setar metadata refresh offers only new meaningful source proposals)_
- [ ] **ac-8** — src/store/archiveIndex.test.ts with uniquely named control companion: all four fields × typed empty/literal/ref × term rename/meaning change/same-label different-id × deleted/rebound/moved item/proposal drift/unrelated notes. UI passes typed premise/proposal; stale choices cause fresh preview and zero overwrite. Correct the existing test endorsing label identity. Chosen fields write once, untouched fields survive and failed persistence retries durably. _(proof: setar metadata choices refuse every changed identity and premise before a write)_
- [ ] **ac-9** — src/domain/setarSetup.test.ts: independently declared ordinary gushehs/six daramads/two chaharpareh contexts/etude/exercise/personal-only improv/parts/technique/unknown/provisional/composite × missing/custom/conflicting stages × partial/missing/shared Setar-Tar refs × duplicate/other-recension materials. Status, kind, placement, reference, source and class proposals stay separate. Radif provenance alone cannot classify kind and form-category refs never identify works. New import defaults preserve dormant/zero practice; pre-existing exceptions are reviewed, never deleted. _(proof: setar setup proposals distinguish learning organisation and source evidence)_
- [ ] **ac-10** — src/domain/setarSetup.test.ts plus store support: correct/selected/excluded/later-arriving rows × instrument/pathway/rev/typed-premise drift × conflicting legacy/live refs × validation/save failure and retry. Apply exact displayed ids/fields in one set. Compare ALL untouched notes/history/reviews/dates/provenance/ratings/counts/clocks/routines/plans/attachments and bytes. Create selected source once, never cross-instrument/title-deduplicate. Written states pass validateDB round-trip; completed repeat has same object/rev. _(proof: setar setup commits selected rows atomically idempotently and without collateral changes)_
- [ ] **ac-11** — tests/setar-practice.browser.test.ts: synthetic owner-shaped fixtures, actual review controls, distinct Keeping fresh batch/exclusions and duplicate-source/ambiguous-stage choices. Change unrelated data during preview, fail/retry save, reload and repeat in both engines. Evidence/before/after visible; Saved waits for acknowledgement. No private owner dump, debug hook or source-regex journey; no unseen row joins selection. _(proof: setar setup review is usable through controls and survives interruption)_
- [ ] **ac-12** — tests/musical-term-suggestions.browser.test.ts: new/edit × three fields × phone/desktop × Chromium/WebKit. Type partial Farsi/Latin/name/alias; select VISIBLE matches by touch/click/keyboard; browse all/clear/unknown/composite/ambiguous/composition input. Include custom/renamed/archived terms, preserved other literals, focus/blur and no premature submit, reload/offline. Finished-name fill or option-markup existence cannot pass. _(proof: musical term suggestions can be found and selected while typing in both engines)_
- [ ] **ac-13** — One exact test in tests/setar-practice.browser.test.ts with uniquely named term companion: both engines/light-dark/390x844/long mismatched-language text/large text/keyboard focus/44px actions. Extend literal-dir ledgers; verify independently directed values and start alignment. Only main scrolls; no fixed/sticky/guessed viewport workaround; drafts remain usable. Existing contrast and instruction budget gates stay green. _(proof: portable term and recovery controls preserve direction focus and scroll ownership)_
- [ ] **ac-14** — One acceptance in tests/practice-cues.browser.test.ts, supported by src/components/practiceCue.test.ts: BEFORE behaviour edits, drive current mounted Start/Resume and natural target controls and record the evidenced marker→cue→new context/no resume failure, rather than inferring integration from a pure signal test. Corrected entry matrix covers Today recommendation/review/direct, StartBlock, item/next, stage, routine cards/duration/essentials, pending-plan creation versus each initial/later Begin, ActiveBlock/CloseBlock/RoutineRunner Resume, Settings Test sound and practice-screen sound recovery. Inject AudioContext/vibration/wake ports and observe constructor/resume invocation synchronously inside the click before awaits/navigation; later boundaries reuse the same context. Observe oscillator→gain→destination, bounded two-pulse start/stop/envelope and node cleanup. Bare routine URL requires Start; card Start remains one tap; existing clock routes never replace/restart work. Update and rerun the existing routine Working-notes journey without dropping ownership assertions. Running/suspended/interrupted/closed/unsupported/constructor throw/resume throw/reject/never-settle/concurrent repeated gestures and refused-dual-clock cases cannot leak/stack contexts, block practice, falsely claim audible output, queue old tones or change saved data. Test/recovery cue changes neither clocks/markers/wake lock nor history. Add one smoke route using the real browser WebAudio engine with normal policy, observing running state and scheduled completion; no forced autoplay flag or hardware-audibility assertion. Real PWA speaker/mute behaviour remains OWNER. _(proof: practice sound reuses one gesture primed context across all start and resume doors)_
- [ ] **ac-15** — tests/practice-cues.browser.test.ts: fixed-clock block/plan/routine × natural target/intermediate/final/pause-resume/zero-time repeated skips/multi-boundary background catch-up/reload/absent marker. Drive actual mounted screens and record marker claim, visual state, cue attempt and saved outcome in order. Normal foreground reached boundaries produce exactly one claim/cue attempt; jump across multiple boundaries produces ONE catch-up attempt, not one per missed boundary. Replay the same captured effect, development StrictMode setup/remount, navigation, concurrent observation, stale/replaced/paused clock, final-save/cancel interleavings and a failed/pending/interrupted audio path. Only an atomic still-current-clock claim may attempt sound; consumed boundaries never replay on audio recovery or Resume, and Skip never cues. Persistent visual target/overtime/window survives unsupported sound. Independent wall-clock expectations match ALL saved minutes/results/reviews; blocks never auto-finish and existing routine completion/working-note ownership remains unchanged. Include actual store-marker methods, not an in-test model or source regex. Pure nextSignal/wake checks support mechanics; they cannot certify mounted effect exactly-once or hardware audibility. _(proof: practice cues preserve wall clock boundaries and every recorded minute)_
- [ ] **ac-16** — tests/setar-practice.browser.test.ts: Add→visible Remove→hidden Restore→Play, fresh/enriched/practised × ordinary/shared radif/course × second pathway × placed-unlinked/ambiguous legacy. Same id, notes/history/reviews/files/source/class/routine links survive. Only selected pathway visibility/placement changes; bindings stay; repeat Add/Restore cannot duplicate. Sweep stage/progress/next/currentStage/Today/plan/routine visibility. Unlink/Delete remain distinct. _(proof: pathway removal and restoration visibly retain the existing owned item)_
- [ ] **ac-17** — tests/setar-practice-proof.test.ts checks the focused runner's list/manifest mode without recursively running itself. node scripts/check-setar-practice-families.mjs resolves titles one-to-one and runs committed fixtures/fixed seeds/clocks and both-engine control companions through practiceBrowser; missing browsers fail, all page errors remain, private Vite caches. Before first review record named failure for individually dropping provenance at scanner/decoder/inbound sites, widening restoration scope, missing relation consumer, same-label premises, reoffering unchanged metadata, bypassing selected-patch guard, omitted gesture door, datalist-only selection and delete/unbind removal. Restore each temporary mutation; source scans/documentation alone cannot prove behaviour. Extend mutations to a hard-coded session ceiling/key, auto-confirmed roster/draft, malformed header-preservation, unlogged rename guess, per-boundary context recreation, missing resume/state gate, unconditional marker claim or effect replay, queued delayed sound, and moving routine Start back into an effect. Each targeted mutation must fail the corresponding focused behavioural check and leave unrelated tests out of the proof argument. Include the future-intake report and actual pre-fix cue trace in the reader/writer matrix before implementation. _(proof: setar practice family proof rejects targeted partial fixes before review)_
- [ ] **ac-18** — Preserve one bounded real-device session: Mac normal browser plus iPhone Safari and installed PWA over verified secure context, recording build/browser/iOS/keyboard/output route and volume. iPhone checks partial Farsi/Latin term selection/draft retention/native keyboard dismissal. On each platform use Test sound, then short foreground block and routine boundaries, Pause/Resume and one background/lock-return interruption. Compare actual audibility/clear two-pulse recognition at normal media volume with the visual cue; record observed mute/output/interruption behaviour and recovery gesture with context state, never a locked-screen deadline guarantee. Starting a routine from its card stays one tap. Hardware/OS policy/native keyboard are the only reasons this is OWNER: all entry wiring, waveform scheduling, boundaries, persistence and interruption mechanics are automated. Unmerged v16 preview uses isolated data/origin with no real sync; retain native Safari versus installed PWA evidence separately. _(proof: manual:OWNER)_
- [ ] **ac-19** — Preserve one bounded live recovery/intent check: owner uses the SAME generic intake report/runbook that future sessions use, reviews/applies the two confirmed Session 40 registry declarations/roster and three Session 1 exact log continuations, updates all three NAS runtime files after compatible app deployment, runs the existing job and compares publication/commit/hash with Refresh. Explicitly restore Class 40 and open both PDFs/three ordered demos from Lessons and intended source-bound items on Mac/iPhone. Review actual private-data exceptions before selected Setar correction. No additional real future class is required for OWNER: synthetic future numbers/new identities/changed files and report/actions are automated. Builder supplies generic read-only comparison/reporting rather than a bespoke repair worksheet; real DSM/Drive/media reachability, genuine old→new declarations and musical intent remain OWNER. Re-import cannot recover deleted notes/bytes; independent backup is needed. No automated media/registry/log writes, retired deployment, deletion or credential logging. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx, src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/store/useStore.ts, src/components/useScreenAwake.ts
- **prepare-for-the-next-class** — touched via src/pages/Lessons.tsx
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/components/useScreenAwake.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/components/useScreenAwake.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/components/useScreenAwake.ts, src/store/useStore.ts matched changed file(s) src/components/useScreenAwake.ts, src/pages/ActiveBlock.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — truth-proposed

Dastgāh, form and composer now show the app's own suggestion buttons while typing (no native datalist); proposal updates step 3.

Steps: 3

## work-a-pathway-stage — truth-proposed

Remove from pathway is offered in the notice right after Add and first in the row menu; Restore says the same item answers; a routine starts from the card tap. Proposal updates steps 2-3 and the Guided routine variation.

Steps: 2, 3

## practise-todays-recommendation — truth-proposed

Start and Resume taps ready one page-lifetime practice sound; the cue is two pulses, claimed once per boundary, never queued; Turn on sound and Test practice sound recover it. Proposal updates steps 3-4 and the Target reached variation, adds Test practice sound.

Steps: 3, 4

## log-a-class — truth-proposed

A class lists the pieces its Setar archive names beside the owner's links, through one association relation; unlink/relink of an archive-listed piece is one reversible decision. Proposal updates step 5.

Steps: 5


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

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now (update proposed)

Proposed step changes:
  The musician Types a title into the quick-add box and presses Add.
    Shows: 'Added ✓' with an 'add details' link.
    Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.
  The musician Or chooses 'Add practice item' for the full one-step form.
    Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
− The musician Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
−   Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.
+ The musician Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
+   Shows: Persian instruments are asked for dastgāh, gusheh, form and composer. While typing in dastgāh, form or composer, up to eight matching terms appear below the box as buttons — found from Farsi, Latin, an alias or a transliteration — beside an ‘All’ list and a clear control; a tap, click or Enter stores the shared term and returns focus to the box. A partial match is never accepted on its own, and free text always wins.
  The musician Saves.
    Shows: The item's own page, with a 'Connected to' summary near the top.
    Changes: One item, linked to whatever it belongs to — links never duplicate the item.

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### install-the-app-and-keep-it-current — Works now

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now (update proposed)

Proposed step changes:
  The musician Accepts the pre-filled class number and picks the date.
    Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
    Changes: A Lesson is stored for that instrument; the number is optional and editable.
  The musician Rewatches the class and types the notes, in Farsi or English.
    Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
    Changes: Notes are saved when the field loses focus.
  The musician Adds a link to the class recording and to any scores — a NAS path or a full https link.
    Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
    Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.
  The musician Taps 'Open' on a link.
    Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
    Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
    Only if: A NAS base URL is set in Settings and the NAS is reachable from this device
− The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
−   Shows: Each linked item with its status and a 'For next class' toggle.
−   Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.
+ The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
+   Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
+   Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.
  The musician Optionally attaches small hand-outs (a PDF, a photo, a short audio).
    Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
    Changes: Small blobs are stored on the device and travel with backups and sync.

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
  Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
    Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
− The musician Taps 'Start · 10 min'.
−   Shows: The active block screen: item title, mode and focus chips, a running ring timer.
−   Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Taps 'Start · 10 min'.
+   Shows: The active block screen: item title, mode and focus chips, a running ring timer.
+   Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap readies this page’s practice sound (one sound context for the page, readied only by a tap).
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again. Resume is a tap too and readies the sound again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
  The musician Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
    Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.
  The musician Taps 'Save block'.
    Shows: Back to Today (or to the running plan), with the item's stats and status updated.
    Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

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

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
  Practice Compass Shows the stage's rows: the owner's items laid over the stage's reference suggestions, each suggestion resolved to the owner's item by its reference binding on the pathway's instrument — never by where the item sits.
    Shows: 'n/m solid' over the visible rows; suggestions hidden in this pathway are omitted; two legacy copies answering one suggestion show as a choice.
− The musician Taps + on a suggestion.
−   Shows: 'Added … — not practised yet.' The row now plays that item.
−   Changes: A practice item is created bound to the suggestion's reference; tapping again, after a move or a reload, hands back the same item — adding is organisation, not progress.
− The musician Optionally uses a row's ⋯ menu: Link an existing item, Unlink reference, Remove from pathway, or Hide this suggestion (restored from 'Hidden suggestions').
−   Changes: Only organisation: Link sets one item's binding (same instrument only); Unlink drops one binding; Remove from pathway clears placement and hides the suggestion in this pathway; Hide is visibility only. Nothing is deleted — Delete practice item stays on the item's own page.
+ The musician Taps + on a suggestion.
+   Shows: 'Added … — not practised yet.' The row now plays that item, and the same notice offers 'Remove from pathway' — the item is kept.
+   Changes: A practice item is created bound to the suggestion's reference; tapping again, after a move or a reload, hands back the same item — adding is organisation, not progress.
+ The musician Optionally uses a row's ⋯ menu: Remove from pathway (first, set apart from Unlink), Link an existing item, Unlink reference, or Hide this suggestion (restored from 'Hidden suggestions').
+   Changes: Only organisation: Link sets one item's binding (same instrument only); Unlink drops one binding; Remove from pathway clears placement and hides the suggestion in this pathway; Hide is visibility only. Nothing is deleted — Delete practice item stays on the item's own page. Restoring a removed suggestion answers with the same item again, and says so — nothing new is made.
  The musician Taps ▶ on a row to practise it.
    Shows: The ordinary active block.
    Changes: A suggestion not yet added is added first, then the block opens.
  The musician Optionally pins the stage as the current one, edits it, or archives/restores the pathway.
    Shows: Today, the Session Plan and Repertoire follow the same visible pathway and pinned stage.
    Changes: The pathway records the pin or its archived state; deleting a stage or pathway detaches items instead of deleting them.

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## The builder's family proof plan

The builder was asked for one before this review: Family proof plan, before the first review: for subtle work — a parser, a resolver, a provider or transaction boundary, a record another reader must still parse — name each invariant, every consumer of it, its equivalence classes and how they interact, and prove them against independently derived expected results on one reproducible, focused route (committed fixtures, fixed seeds). Point to that route and its limits rather than pasting it. Routine work needs none of this. Find
where its commit messages say it lives; subtle work without one, or a plan
whose expected results come only from the implementation under test, is a
finding.

## Close each family in this round

A counterexample is one instance of an invariant. For every finding: name the
invariant it breaks (its family), sweep the repository for every instance of
that invariant — each consumer, sibling function and caller, not only this
diff — and list every instance you found plus the consumers you checked and
found clean. One round that names the whole family saves a round per instance.

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261005-make-setar-archive-recovery-repertoire-c-e964/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261005-make-setar-archive-recovery-repertoire-c-e964' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261005-make-setar-archive-recovery-repertoire-c-e964/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261005-make-setar-archive-recovery-repertoire-c-e964/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
