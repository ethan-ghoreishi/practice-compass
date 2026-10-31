---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 315aece407e9bbfcc0c0515d43a407ad4facb2a2
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: archive mutations and lock recovery still permit concurrent data
      loss, simultaneous live owners and permanent lockout from interrupted
      ownership records."
    counterexample: >-
      BOUND: HEAD 3244347aa38bd768493df35a26b354f0b986aed7, patch
      315aece407e9bbfcc0c0515d43a407ad4facb2a2; this replaces the earlier
      finding for this same open ac-2 family. Invariants: prove the exact
      expected archive state at mutation; only one live operation owns mutation
      rights; interruption has a safe repeatable recovery path.

      SWEPT: scripts/setar-archive-maintenance.mjs: lstatOrNull,
      readDeclaration, eolOf, appendLine, stemOf, mediaPath,
      planMaintenance/finish, stateDir/rootIdOf,
      journalPath/readJournal/writeJournal/journalFor,
      lockPath/readLock/alive/lock/unlock, writeDeclaration, restore,
      validateAndScan, Refusal/Interrupted, applyMaintenance including automatic
      recovery, retryMaintenance, rollbackMaintenance, CLI main/isDirectRun,
      publishWithRunner child lifetime, and the independent scheduled
      runner/publisher as competing publication producers. Followed imported
      ROLES, csvCell, fileExt, isSafeRelativePath, parseAssetStem,
      parseCsvCells, parseRegistry, parseSessionFolderName, readTable and
      formatAttention/attentionReport as read-only planning/status dependencies;
      readStableSource/readSource/readRequired/readOptional/scanArchive,
      buildIndex and checkOutput/writeIndexAtomically as scan/input/output
      consumers; status/preview/no-op doors; and the existing exact ac-2 test's
      fakeGit/githubFetch, killed/deadLock, scratch/media/declarations and
      CLI/runner routes. Checked the matching ownership/recovery claims in
      docs/setar-archive.md, docs/setar-lesson-lifecycle.md,
      docs/nas-topology.md and DECISIONS.md.

      REPRODUCED BROKEN: (1) writeDeclaration (359-366) compares then
      unconditionally renames. For PIECES.csv and present/absent RENAME-LOG.csv,
      an intervening replacement is overwritten and an intervening deletion is
      recreated. Two live writers both pass the comparison and the later rename
      loses the other row. (2) restore (525-559) preflights, then reads the
      CURRENT declaration and supplies that as expected, overwriting a later row
      or recreating a later deletion. The absent-before log branch moves a
      concurrently edited log out of the archive. Both explicit rollback and
      automatic failure recovery reproduced the declaration loss. (3) Apply's
      media move (487-493) overwrites a destination appearing after its absence
      check. A source changed after preview is moved first, detected only
      afterwards, and automatic recovery then refuses with the changed file
      already moved. Rollback (548-553) similarly overwrites a new original-path
      file or moves changed renamed bytes after its preflight. By inspection,
      source/destination regularity and directory checks also remain separate
      from the actual rename, so validation is not mutation-point proof. (4)
      Locks are scoped to state directories, not the archive: two full Apply
      operations using different state directories both held locks and reached
      publication on the same archive. (5) With a dead adoption claim, cleaners
      A/B both read the dead claimant; B removes it, C claims and reads the old
      dead lock, A removes C's live claim using its stale read, then D also
      claims. C and D both rename over the lock and return ownership. Both claim
      cleanup sites (333,344) lack ownership protection; unlock's check/remove
      is consequently unsafe once ownership has split. (6) Empty, token-only,
      non-numeric, zero, negative and fractional PID records in either lock or
      claim permanently refuse repeated recovery. A truncated PID that parses as
      a different dead PID is instead adopted while its actual creator remains
      live; PID-only liveness also cannot identify a reused PID. (7) An actual
      publishWithRunner subprocess survived SIGKILL of its maintenance parent
      and observed that parent gone. Parent-only dead-lock adoption can
      therefore overlap a still-live publishing command. Independent scheduled
      jobs invoke the same publisher without sharing maintenance ownership; the
      stale-publication schedules are detailed in the companion finding.

      NEIGHBOURS CLEAN: with complete valid ownership records, one owner, no
      surviving publisher and no concurrent archive edit, 140 before/after
      mutation cuts recovered correctly: Apply register/rename 62, explicit
      rollback 46, automatic recovery with present/absent logs 32. Eight
      additional adoption cuts covered claim creation, temporary lock writing,
      lock replacement and claim cleanup; complete records recovered after
      death. Ordinary live lock/claim holders are refused unchanged; a complete
      dead claim is cleared on refusal and the next run adopts; foreign-token
      unlock leaves the lock. Sequential stale previews, declaration digests,
      media-byte/link refusals and wrong-archive binding remain effective. A
      declaration already restored to its before state is harmless; a directory
      appearing at declaration rename refuses; removing an absent-before log
      during recovery first refuses, then repeat preserves its absence.

      UNREACHABLE/CONDITIONAL: status and preview cannot mutate archive data;
      no-op Apply makes no archive edit. With a single valid owner, archive
      mutation cannot precede commitment of the prepared journal, because the
      code orders it first; a process kill during journal-temp writing leaves
      the older complete journal or no committed journal, not a truncated
      committed journal. A normal live, fully written lock cannot be adopted
      through the ordinary dead-owner branch. Those conditional facts do not
      exclude the reproduced split ownership, partial records or surviving
      child. External conflicting edits are reachable and must be preserved or
      explicitly refused, never classified as impossible.

      REWORK: close these manifestations together through archive-wide ownership
      including publisher lifetime and independent scheduled publishers,
      exact-state protection for every forward/recovery mutation, ownership-safe
      claim cleanup and an explicit safe path for ambiguous/partial ownership
      records. Extend the existing exact title 'setar guided maintenance is
      reversible stale safe and idempotent without altering media' with the
      shared cut-point and overlapping-writer matrix, covering both
      declarations, both log-presence branches, both media directions, all entry
      points and multiple state directories.
  - family: maintenance-publication-matches-validated-index
    summary: "P2: publication uncertainty is reset per invocation, pending journals
      identify the wrong attempt, and delayed publishers can republish an older
      validated index over a newer publication."
    counterexample: |-
      BOUND: same HEAD/patch and open ac-2 family. Invariant: an unresolved publication stays unknown across later failures until positive remote evidence proves the intended new or previous state; every attempt is bound to its validated index.
      SWEPT: Apply/Retry/Rollback and automatic-recovery publication transitions; validateAndScan and readStableSource/buildIndex/writeIndexAtomically; journalFor legacy normalisation, readJournal/writeJournal and all pre/post-publication journal writes; publishStep/PUBLISHED/PublishFailed; publishWithRunner including spawn/error/signal/evidence handling; run-setar-index.sh configuration, scan, --expect forwarding and exit propagation; publish-setar-index.mjs publishIndex, ExpectationRefused, nothingPublished, contentHashOf, SOURCE_INDEX_BRANCH/INDEX_PATH/PROTECTED_PREFIXES restrictions, MAX_ATTEMPTS conflict loop and CLI stdout/stderr/exit mapping; makeGitHubIndexTransport's gh/ok/json and getRef/getFile/getCommit/createBlob/createTree/createCommit/updateRef/createRef. Checked the ac-2 fake Git/fetch and CLI/runner consumers plus publication claims in docs/setar-archive.md, docs/setar-lesson-lifecycle.md, docs/nas-topology.md and DECISIONS.md. The surviving-publisher ownership defect is consolidated in the companion recovery finding; its publication-state consequence is included here.
      REPRODUCED BROKEN: (1) After an accepted createRef/updateRef with lost response, a retry failing in getRef or getFile changes unknown to failed and promises the last good index remains published, although the new index already landed. For an unaccepted but unconfirmed write or a killed pending attempt, later failures in getRef, getFile, createBlob, getCommit, createTree or createCommit cause the same certainty reset. Pre-read runner refusals/exits 2/3/4 likewise erase predecessor uncertainty for applied and rolled-back journals. Proof that THIS invocation did not publish is not proof of the remote outcome of an earlier invocation. (2) Rollback from an unknown Apply replaces the history with pending, then a pre-read failure records failed; the remote can still hold the applied index while the archive has been restored. Three successive failed retries reproduced unknown -> failed -> failed -> failed; only the subsequent positive read actually resolved the state. (3) Even a first publication failing before its branch read promises a previous good index exists when the branch/index has never existed. (4) Before remote work, Apply's applied/pending journal has no intended contentHash; Rollback's rolled-back/pending journal retains the hash of the applied state rather than the restored state being published; Retry writes no pending marker and retains the old published/not-needed state and old hash while attempting a newly scanned hash. These were observed through the actual entry points with publication paused. (5) After Retry of a changed archive is accepted with a lost response, failure to write the unknown journal leaves the older published journal intact; a new Apply is then admitted without resolving the unconfirmed attempt. A failed retry can also overwrite the original unresolved contentHash with the current scan's different hash, losing the identity of the outcome that still needs resolution. (6) Actual publishIndex was deterministically paused with old validated H1 while another publisher installed H2. Resuming before the old publisher's ref read let H1 publish over H2. A second schedule paused its first updateRef: after H2 won, the old update conflicted, but the conflict loop re-read H2 and committed old H1 on top. This applies to both an orphaned runner and the independently scheduled runner; expected-hash checking and non-force ref updates alone do not establish that the superseded validated snapshot is still the intended archive state.
      NEIGHBOURS CLEAN: all 12 Apply/Retry/Rollback x create/update x received/lost-response cases behaved correctly for the individual attempt: received writes confirm publication, lost responses remain unknown, and a following positive read of identical index bytes returns unchanged without another write. Subsequent ordinary exceptions/signalled exits preserve unknown; wrong expected hash refuses before any request; missing/wrong success evidence is not accepted. Fresh isolated pre-ref failures prove only that invocation made no ref write. Prepared/applied journal-write failure in Apply and rolling-back/rolled-back journal-write failure in Rollback prevent remote invocation and allow recovery once storage works. After confirmed publication or unchanged evidence, failure to record the journal reports that publication occurred; after an unconfirmed result, a journal-write error makes no false success return. Apply refuses an already-unconfirmed own journal, and Retry validation failure before publish preserves that journal unchanged. Complete process-interruption routing with no surviving publisher remains clean as bounded in the companion finding.
      UNREACHABLE/WHY: within one publisher attempt, createRef follows an absent getRef and updateRef follows a present getRef; getFile/getCommit cannot run in that absent-ref attempt. A positive identical-file read returns unchanged before any ref write, so later blob/tree/commit/ref failures are unreachable on that same unchanged path; those stages become reachable when the remote differs, an earlier ambiguous write did not land, or the desired archive changes. The pre-ref try/catch cannot catch a ref-write throw in that same attempt. Retry cannot reach publication from prepared or rolling-back journals, and Apply cannot do so from its own unfinished/unconfirmed journal. Therefore the certainty bugs above concern reachable histories and operation switches, not invented post-write execution of the pre-write catch.
      REWORK: make publication state carry unresolved history and the correct intended validated hash before remote work; a later failure must not manufacture evidence about a predecessor or a never-read branch. Preserve unknown through failed Retry/Rollback and journal failure until an actual positive remote observation resolves it, including repeated retries, a change in desired hash and delayed competing publishers. A resumed/conflicting publisher must not turn an older validated snapshot into a new publication over a newer state. Extend the SAME exact ac-2 title with these transition classes and journal cut points; retain the individually correct response-loss/positive-evidence cases.
      PROOF LIMITS/RISK: deterministic in-memory probes evaluated the production maintenance statements with a virtual filesystem, controlled clock and injected failure/interleaving boundaries, plus the actual pure scanner and publishIndex code. The orphan proof used the unmodified actual publishWithRunner with a bounded harmless child command. No repository files or records were written; the bound full Check, live NAS/GitHub and hardware tests were not rerun. These are source/state-system proofs, not exhaustive operating-system or power-loss tests. Current risks remain concurrent archive/media loss and false publication assurance.
createdAt: 2026-10-31T13:14:41.295Z
sealedAt: 2026-10-31T14:02:21.508Z
---

# Review: Keep Setar lessons and preparation coherent from archive to next class

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261030-keep-setar-lessons-and-preparation-coher-d2ee
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/60
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `315aece407e9bbfcc0c0515d43a407ad4facb2a2`
- **Computed by:** prismatica 0.11.0 · build sha256:a53354b36e378c8f · installed package, not registry-verified

## The Delta this change was framed from

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



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, the findings
that review recorded, and the paths the rework touched — read any file you need
from the lane. The same Check already bound to this head is not to be rerun
wholesale.

Verify each prior finding's FAMILY across every consumer in the repository, not
only the lines this rework changed: a family is closed when no instance of its
invariant survives anywhere, and a fix that reached one consumer while a sibling
still breaks it is not closed.

**Approved intent:** `.prismatica/intents/20261030-keep-setar-lessons-and-preparation-coher-d2ee.md`

**Findings from the previous review:**

- **maintenance-recovery-preserves-concurrent-state** — Interrupted publication cannot recover its dead lock. lock() adopts only a prepared journal, retry supplies no recovery journal, and recovery does not record its newly adopted lock token.
  _counterexample:_ After apply writes status applied and awaits publication, terminate the process. In-memory probes of the actual entry points with that journal and its matching dead-process lock made apply, retry and rollback all refuse, with zero writes and the lock retained. Dead locks also block published, publish-failed and rolled-back states; interruption after adopting a prepared lock leaves its token different from journal.lockToken and blocks rollback again. Sweep lock/unlock, applyMaintenance, retryMaintenance, rollbackMaintenance and publication transitions. Concurrent-declaration digest refusal, whole-restore media preflight, archive-root binding, live-lock refusal and owned unlock checked clean. Extend the existing exact ac-2 title across interruption phases rather than only after registry.
- **maintenance-publication-matches-validated-index** — A non-zero or signalled runner exit is still treated as proof that nothing published; ordinary exceptions also default to known non-publication.
  _counterexample:_ Using makeGitHubIndexTransport with fake fetch, accept the PATCH ref update and then throw for a lost response. publishIndex throws while the remote ref is already new; passing that exit-1 result through actual publishWithRunner produced nothingPublished=true. publishStep consequently promises that the last good index remains published. The same ambiguity exists for createRef, process interruption after ref acceptance and journal-write failure after successful publication. Sweep apply/retry/rollback through publishStep, runner, publisher CLI, updateRef/createRef and the new non-zero-exit claims in docs/setar-archive.md and DECISIONS.md. Pre-request expected-hash refusal, positive matching evidence, zero-exit missing/wrong evidence and unchanged handling checked clean. Extend the existing exact ac-2 title with accepted-write/lost-response and post-publication failures.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 2870eaa16f2332e5a31afa208a2a2de8d5160ae9..1c2a636101462f5e44a1e7563939b56a167c914c 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -17,15 +17,22 @@ Same lane, after the sealed review asked for changes.
   every file (and the renamed media) before writing any, and refuse otherwise.
   The per-folder lock could never see another `--state` folder; the digest
   check can.
-- **Lock ownership is a token, adoption needs a dead process.** `rollback` may
-  take over only the lock its own `prepared` journal names, and only when that
-  process is gone. Same-process interruption is not a dead process, so the
-  test kills a real child.
+- **A dead lock is adopted by any run; the journal decides.** Every run that
+  writes the archive records what it is doing (`prepared`, `rolling-back`)
+  before its first write, so a lock whose process is gone guards nothing the
+  journal does not already say. Adopting only the lock a `prepared` journal
+  named left a run killed during publication, or during a rollback or retry,
+  locked out for good. Archive state (`status`) and publication
+  (`publication`) are separate fields. Same-process interruption is not a
+  dead process, so the test kills real children.
 - **The job proves it published the validated index.** Comparing the scan's
   hash after a scan-and-publish job is too late. So the hash goes in as the
   runner's one argument (sudo keeps arguments, not environment), and the
   publisher refuses before Git. Success needs its evidence line. "The last
-  good index is still published" is said only on a non-zero exit.
+  good index is still published" is said only on proof (exit 2, 3 or 4: the
+  job stopped before its ref write). Any other failure, including a lost
+  response after GitHub accepted the ref, is unconfirmed: a non-zero exit is
+  no proof the ref did not move. `retry` settles it.
 - **The NAS is not redeployed by this rework.** The owner's call. The sudo rule
   pins the runner's exact arguments, so a redeploy must widen it in the same
   step (`docs/nas-topology.md`).
diff --git a/docs/nas-topology.md b/docs/nas-topology.md
index 697a317f0b2c989a504da034ac7c68b62b53d5f2..7e9ef0c61c9fadc2fafb3e20d58761a222d7b48d 100644
--- a/docs/nas-topology.md
+++ b/docs/nas-topology.md
@@ -254,7 +254,9 @@ binding and session-folder link refusal in the maintenance tool. Until the
 owner redeploys them, the NAS route has none of these. Redeploying needs, in
 the same step, the sudo rule to allow the one argument —
 `ethan ALL=(setar-indexer) NOPASSWD: /bin/sh /volume1/practice-compass-index/run-setar-index.sh, /bin/sh /volume1/practice-compass-index/run-setar-index.sh *`
-— or every apply ends `publish-failed` (safe: nothing published). After a
+— or every apply ends `publish-failed`, reported as unconfirmed (sudo's
+refusal is exit 1, no proof by itself; in fact nothing ran), and `retry`
+after fixing the rule. After a
 redeploy the journal of 2026‑10‑31 is an earlier version's, so `rollback`
 refuses it; undo the Session 41 registration by hand like the Session 40
 rename below.
@@ -296,9 +298,9 @@ rename below.
   `config.env` as is unless reverting `PC_NODE` too, then run
   `synoacltool -enforce-inherit` on each file.
 - **Sudo.** Delete `/etc/sudoers.d/practice-compass-maint`.
-  - A DSM update may remove it too. The failure is safe: an apply ends
-    `publish-failed`, and the last good index stays published. Reinstall the
-    one line and run `… retry`.
+  - A DSM update may remove it too. The failure is safe: the job never runs,
+    the last good index stays published, and an apply ends `publish-failed`
+    (reported as unconfirmed). Reinstall the one line and run `… retry`.
 
 **Still broader than needed (recorded, not changed):** through the runtime
 share's inherited ACE, `setar-indexer` can write its own scripts and
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 391edf8498c39bb2020de568db752d5165deb398..608e51341936ffdc48e4e09a639ddcb6cea09e58 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -221,7 +221,9 @@ target is refused before a request is made.
   `expected_head_sha`, so a racing publisher loses the update rather than
   overwriting it; the retry re-reads before deciding anything.
 - An interruption before the ref advances leaves the previous index published —
-  a blob and a commit nothing points at are invisible.
+  a blob and a commit nothing points at are invisible. Such a failure exits 4.
+  A failure of the ref write itself (a lost response, a 5xx) may have landed:
+  exit 1, said as unknown, and a rerun makes no commit if it did.
 - Error messages are built from the HTTP status and the endpoint name only.
   **No token, no repository URL and no archive path ever reaches a log.**
 
@@ -659,17 +661,28 @@ $M rollback   # put the last change back from its private copy and publish that
   `rollback`, put back only what THIS change wrote: every file is judged
   first, and a declaration changed since (another `--state` folder's row, a
   hand edit), a renamed file whose bytes changed, or a moved folder refuses the
-  whole restore with nothing written. `rollback` takes the lock like every
-  run; it adopts only the lock its own interrupted apply left (that apply's
-  journal names it and its process is gone), and no run removes a lock it does
-  not hold. Media bytes are only ever renamed, checked by size and SHA-256.
+  whole restore with nothing written. Every run takes the lock and reads the
+  journal under it. A lock whose process is gone is adopted by any run,
+  because every run that writes the archive first records what it is doing
+  (apply `prepared`, rollback `rolling-back`, each with its own token): the
+  journal then decides. Half-written means `rollback`; applied or restored but
+  not confirmed published means `retry`. A run killed in any phase, a
+  rollback or retry included, leaves a state one of those finishes. No run
+  takes a live lock or removes one it does not hold. Media bytes are only
+  ever renamed, checked by size and SHA-256.
 - **Publication is of the validated index, on evidence.** The job gets the
   validated contentHash as its one argument and refuses, before any request
   (exit 3), a scan that differs — another configured root, an archive changed
   since. Success needs the publisher's last line `published-index <status>
-  <hash>` naming that hash. A non-zero exit leaves the last good index
-  published, and says so; an exit 0 without that evidence is reported as
-  unconfirmed, never as published or as "nothing changed". Either way: `retry`.
+  <hash>` naming that hash. "The last good index is still published" is said
+  only on proof: the job's exit 2 (configuration refused), 3 (not the
+  validated index) or 4 (the scan, or the publisher before its ref write,
+  failed). Every other outcome — exit 1 or any other code, a signal, a lost
+  response after GitHub accepted the ref, an exit 0 without the evidence — is
+  reported as unconfirmed, never as published or as "nothing changed". A
+  publication the journal then fails to record is reported as published.
+  Every case: `retry`, which makes no commit if the branch already holds the
+  index.
 - **Repeat is a no-op**, and an unchanged archive makes no commit.
 - Ordinary, correctly named supported files for registered pieces need
   NOTHING: put them in the session folder; the job publishes; Refresh.
diff --git a/docs/setar-lesson-lifecycle.md b/docs/setar-lesson-lifecycle.md
index adf6ccd69c6d9a294cc1a6cb965a9d5bfdc95484..95cfcd9138b6b39e35fb3d73198a42a7613c2864 100644
--- a/docs/setar-lesson-lifecycle.md
+++ b/docs/setar-lesson-lifecycle.md
@@ -165,3 +165,18 @@ validated index and must print its evidence. Recovery (`rollback`, and the
 automatic put-back of a failed apply) undoes only what that change wrote,
 judging every file before writing any, under the lock, for its own archive
 only. Repeat runs are no-ops.
+
+Two maintenance invariants, each over every phase. **A killed run is always
+recoverable**: any later run adopts a dead lock (one adopter per token) and
+the journal decides: half-written means `rollback`, unconfirmed means `retry`.
+The consumers are lock/unlock, apply, retry and rollback, the automatic
+put-back and the journal's status/publication split. Its classes are a kill
+after copy, registry, log or rename, during publication, after rollback's
+mark, during rollback's or retry's publication, and before any journal.
+**"Nothing published" is said only on proof**: the job's exit 2/3/4, or a
+publisher failure before its ref write. A lost ref-write response, any other
+exit, a signal, or an exit 0 without evidence is unconfirmed. A journal write
+failing after publication still reports published. The consumers are
+publishIndex, updateRef/createRef, the publisher CLI, the runner,
+publishWithRunner and publishStep. ac-2 proves both with real killed
+children, the real transport over a fake `fetch`, and the real runner.
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index 9b26e68d0004b816001b03339e95cdcc99dce88e..8e5cbb0b6b7a2b05c24e82bdd4a960c52b90720a 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -8,7 +8,9 @@
 // On success the LAST stdout line is the evidence a caller checks:
 //   published-index <unchanged|published|created> <contentHash>
 // `--expect` refuses, before any request, an index whose contentHash is not
-// the one the caller validated (exit 3: nothing was published).
+// the one the caller validated (exit 3: nothing was published). Exit 2: usage
+// refused; exit 4: it failed before its ref write (nothing was published). Any other failure,
+// exit 1 included, may have come after GitHub accepted the ref: unknown.
 //
 // WHY A SEPARATE BRANCH. The app's own sync writes main's whole tree with no
 // base_tree, so a sidecar placed beside state.json disappears on the next
@@ -53,7 +55,9 @@ const MAX_ATTEMPTS = 4;
  *   second publisher racing this one loses the update-ref rather than
  *   overwriting it, and the retry re-reads before deciding anything.
  * - An interruption before the ref advances leaves the previous index as the
- *   published one: a blob and a commit nothing points at are invisible.
+ *   published one: a blob and a commit nothing points at are invisible. Such
+ *   a failure carries `nothingPublished: true`. A throw FROM the ref write (a
+ *   lost response, a 5xx) does not: GitHub may have accepted it.
  */
 export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX_BRANCH, path = INDEX_PATH, message, expectedContentHash }) {
   if (branch !== SOURCE_INDEX_BRANCH) throw new Error(`This publisher only writes the "${SOURCE_INDEX_BRANCH}" branch.`);
@@ -72,33 +76,48 @@ export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX
 
   let lastConflict = null;
   for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
-    const ref = await transport.getRef(branch);
+    let ref;
+    let commitSha;
+    try {
+      ref = await transport.getRef(branch);
 
-    if (ref) {
-      const current = await transport.getFile(ref.sha, path);
-      if (current && current.text === indexText) return { status: 'unchanged', commit: ref.sha };
-    }
+      if (ref) {
+        const current = await transport.getFile(ref.sha, path);
+        if (current && current.text === indexText) return { status: 'unchanged', commit: ref.sha };
+      }
 
-    const blobSha = await transport.createBlob(indexText);
-    const baseTreeSha = ref ? (await transport.getCommit(ref.sha)).treeSha : null;
-    const treeSha = await transport.createTree({ baseTreeSha, path, blobSha });
-    const commitSha = await transport.createCommit({
-      message: message ?? 'Update Setar source index',
-      treeSha,
-      parents: ref ? [ref.sha] : [],
-    });
+      const blobSha = await transport.createBlob(indexText);
+      const baseTreeSha = ref ? (await transport.getCommit(ref.sha)).treeSha : null;
+      const treeSha = await transport.createTree({ baseTreeSha, path, blobSha });
+      commitSha = await transport.createCommit({
+        message: message ?? 'Update Setar source index',
+        treeSha,
+        parents: ref ? [ref.sha] : [],
+      });
+    } catch (err) {
+      throw nothingPublished(err);
+    }
 
+    // A conflict answer is GitHub refusing the write; a throw here is unknown.
     const outcome = ref
       ? await transport.updateRef(branch, commitSha, ref.sha)
       : await transport.createRef(branch, commitSha);
     if (outcome === 'ok') return { status: ref ? 'published' : 'created', commit: commitSha };
     lastConflict = outcome;
   }
-  throw new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`);
+  throw nothingPublished(new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`));
 }
 
 /** Refused before any request: nothing was published. */
-export class ExpectationRefused extends Error {}
+export class ExpectationRefused extends Error {
+  nothingPublished = true;
+}
+
+function nothingPublished(err) {
+  const e = err instanceof Error ? err : new Error(String(err));
+  e.nothingPublished = true;
+  return e;
+}
 
 function contentHashOf(indexText) {
   try {
@@ -216,7 +235,7 @@ async function main() {
     indexText = readFileSync(values.index, 'utf8');
   } catch {
     console.error('Could not read the scanned index; the published one is unchanged.');
-    process.exit(1);
+    process.exit(4);
   }
   try {
     const result = await publishIndex({ transport: makeGitHubIndexTransport({ repo, token }), indexText, expectedContentHash: values.expect });
@@ -233,7 +252,11 @@ async function main() {
     }
     // Never the URL, never the token, never the archive root.
     console.error(`Publish failed: ${err.message}`);
-    console.error('The previously published index is still the one the app reads.');
+    if (err?.nothingPublished) {
+      console.error('The previously published index is still the one the app reads.');
+      process.exit(4);
+    }
+    console.error('It may already be published; running the job again makes no new commit if so.');
     process.exit(1);
   }
 }
diff --git a/scripts/run-setar-index.sh b/scripts/run-setar-index.sh
index 3a3fe44ab6c351b535f3d2a3df5e8a72586e8b54..3c639a3486d5761b1d198ba3fb3918b70b3e0648 100755
--- a/scripts/run-setar-index.sh
+++ b/scripts/run-setar-index.sh
@@ -22,8 +22,10 @@
 #
 # WHAT THIS JOB MAY DO: read the archive, write ONE scratch file in its own
 # runtime directory, and update source-index/setar/index.json. Nothing else.
-# A failed scan or a failed publish leaves the last published index in place,
-# which is what the app keeps reading.
+# Exits that PROVE nothing was published: 2 (configuration refused, nothing
+# ran), 3 (the scan was not the validated index) and 4 (the scan, or the
+# publisher before its ref write, failed). Any other failure may have come after GitHub accepted the
+# ref: unknown, and running the job again is safe (unchanged makes no commit).
 #
 # ROLLBACK: disable the scheduled task. The app keeps the source graph it last
 # accepted and goes on working offline; `git push --force-with-lease` of an
@@ -41,9 +43,9 @@ else
   exit 2
 fi
 
-: "${PC_ARCHIVE_ROOT:?PC_ARCHIVE_ROOT is not set}"
-: "${PC_INDEX_REPO:?PC_INDEX_REPO is not set}"
-: "${PC_INDEX_TOKEN:?PC_INDEX_TOKEN is not set}"
+for v in PC_ARCHIVE_ROOT PC_INDEX_REPO PC_INDEX_TOKEN; do
+  eval "[ -n \"\${$v:-}\" ]" || { echo "$v is not set; nothing was published." >&2; exit 2; }
+done
 export PC_INDEX_REPO PC_INDEX_TOKEN
 
 HERE=$(cd "$(dirname "$0")" && pwd)
@@ -60,7 +62,10 @@ if [ ! -d "$WORK" ]; then
 fi
 
 # Scan first. If it fails, stop here: the published index is still the good one.
-"$NODE" "$HERE/scan-setar-classes.mjs" --root "$PC_ARCHIVE_ROOT" --out "$OUT"
+"$NODE" "$HERE/scan-setar-classes.mjs" --root "$PC_ARCHIVE_ROOT" --out "$OUT" || {
+  echo "The scan failed; nothing was published." >&2
+  exit 4
+}
 
 # Then publish. An unchanged index makes no commit. Its last stdout line,
 # `published-index <status> <contentHash>`, is the evidence a caller checks.
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index 99c7edb42dbe42ab37b183ddebb22ea207f6b1d7..e06d4665a004d6c2e98021812129d4ff0a68a828 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -266,6 +266,17 @@ function journalFor(state, root, recovering) {
     return null;
   }
   if (j.rootId !== rootIdOf(root)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
+  // `status` says what the ARCHIVE holds (prepared | applied | rolling-back |
+  // rolled-back), `publication` whether the source-index branch says it
+  // (pending | published | failed | unknown | not-needed). An earlier version
+  // of this lane folded the two into one status; read it conservatively.
+  if (j.status === 'published') return { ...j, status: 'applied', publication: 'published' };
+  if (j.status === 'publish-failed') return { ...j, status: 'applied', publication: 'unknown' };
+  if (j.status === 'applied' || j.status === 'rolled-back') {
+    if (!j.publication) return { ...j, publication: 'pending' };
+    if (j.publication === 'unchanged' || j.publication === 'created') return { ...j, publication: 'published' };
+    if (j.publication === 'publish-failed') return { ...j, publication: 'unknown' };
+  }
   return j;
 }
 
@@ -280,6 +291,8 @@ const readLock = (state) => {
   }
 };
 const alive = (pid) => {
+  // A lock not in this tool's form names no process that could be judged gone.
+  if (!Number.isInteger(pid) || pid < 1) return true;
   try {
     process.kill(pid, 0);
     return true;
@@ -290,11 +303,13 @@ const alive = (pid) => {
 
 /**
  * Take the --state folder's lock; returns the token that proves ownership.
- * `recover` (rollback only) may ADOPT exactly one other lock: the one an
- * interrupted apply left, named by its own `prepared` journal, whose process
- * is gone. A live holder's lock is never taken, and never removed.
+ * A lock whose process is gone is ADOPTED by any run: every run that writes
+ * the archive first records in the journal what it is doing (apply:
+ * `prepared`, rollback: `rolling-back`), so the journal — read under the
+ * lock, never the dead token — decides what may happen next. A live holder's
+ * lock is never taken, and never removed.
  */
-function lock(state, recover) {
+function lock(state) {
   const token = randomUUID();
   try {
     writeFileSync(lockPath(state), `${token} ${process.pid}`, { flag: 'wx' });
@@ -303,12 +318,33 @@ function lock(state, recover) {
     if (err?.code !== 'EEXIST') throw err;
   }
   const held = readLock(state);
-  if (recover && held && recover.status === 'prepared' && held.token === recover.lockToken && !alive(held.pid)) {
-    writeFileSync(`${lockPath(state)}.${token}`, `${token} ${process.pid}`, { flag: 'wx' });
-    renameSync(`${lockPath(state)}.${token}`, lockPath(state));
-    return token;
+  if (held && !alive(held.pid)) {
+    // ONE adopter per dead token: the claim is exclusive, and the lock is
+    // re-read under it, so a second adopter (or a slow one that read the lock
+    // before another adopted it) refuses instead of renaming over a live lock.
+    const claim = `${lockPath(state)}.adopt.${held.token}`;
+    try {
+      writeFileSync(claim, `${token} ${process.pid}`, { flag: 'wx' });
+    } catch (err) {
+      if (err?.code !== 'EEXIST') throw err;
+      const by = Number(readFileSync(claim, 'utf8').split(' ')[1]);
+      // ponytail: a claimer killed mid-adoption is cleared here and this run
+      // refuses; the next run adopts. A per-claim lease if that ever recurs.
+      if (!alive(by)) rmSync(claim, { force: true });
+      throw new Refusal('Another run is taking over an interrupted run’s lock; nothing was changed. Try again.');
+    }
+    try {
+      const again = readLock(state);
+      if (again?.token === held.token && !alive(again.pid)) {
+        writeFileSync(`${lockPath(state)}.${token}`, `${token} ${process.pid}`, { flag: 'wx' });
+        renameSync(`${lockPath(state)}.${token}`, lockPath(state));
+        return token;
+      }
+    } finally {
+      rmSync(claim, { force: true });
+    }
   }
-  throw new Refusal('Another maintenance run holds the lock, or one was interrupted. Run `rollback` to put the last change back (or `retry` if it was applied), then try again.');
+  throw new Refusal('Another maintenance run holds the lock; nothing was changed. Try again when it has finished.');
 }
 /** Remove the lock only if it is still OURS. */
 const unlock = (state, token) => {
@@ -349,8 +385,9 @@ function validateAndScan(root, state, action) {
 
 /**
  * Publication failed. `nothingPublished` is a CLAIM, made only when the job
- * proved it (it refused or failed before its atomic ref update); otherwise the
- * outcome is unknown and said so, never promised.
+ * proved it (it refused or failed before its ref write); every other failure —
+ * a non-zero or signalled exit, a lost response, an ordinary exception — is
+ * UNKNOWN and said so, never promised.
  */
 export class PublishFailed extends Error {
   constructor(message, nothingPublished) {
@@ -361,25 +398,32 @@ export class PublishFailed extends Error {
 const PUBLISHED = new Set(['unchanged', 'published', 'created']);
 
 async function publishStep(state, journal, scanned, publish) {
+  const contentHash = scanned.index.contentHash;
+  let result;
   try {
-    const result = await publish(scanned.text, scanned.index.contentHash);
+    result = await publish(scanned.text, contentHash);
     // POSITIVE EVIDENCE or it did not happen: a publisher that returns no
     // status has proved nothing.
     if (!PUBLISHED.has(result?.status)) throw new PublishFailed('the publisher reported no publication', false);
-    writeJournal(state, { ...journal, status: 'published', contentHash: scanned.index.contentHash, publication: result.status });
-    return { ok: true, status: 'published', contentHash: scanned.index.contentHash, publication: result };
   } catch (err) {
-    writeJournal(state, { ...journal, status: 'publish-failed', contentHash: scanned.index.contentHash });
-    const known = !(err instanceof PublishFailed) || err.nothingPublished;
+    const known = err?.nothingPublished === true;
+    writeJournal(state, { ...journal, publication: known ? 'failed' : 'unknown', contentHash });
     return {
       ok: false,
       status: 'publish-failed',
-      contentHash: scanned.index.contentHash,
+      contentHash,
       message: known
         ? `The archive is changed and valid, but publication failed (${err?.message ?? 'unknown'}). The last good index is still the published one. Run \`retry\` to publish again.`
-        : `The archive is changed and valid, but publication could not be confirmed (${err.message}). Check what the source-index branch now holds, then run \`retry\`.`,
+        : `The archive is changed and valid, but publication could not be confirmed (${err?.message ?? 'unknown'}); it may already be published. Run \`retry\`: it makes no new commit if the source-index branch already holds this index.`,
     };
   }
+  // Published: a failure to RECORD it is never reported as a failure to publish.
+  try {
+    writeJournal(state, { ...journal, publication: 'published', contentHash });
+  } catch (err) {
+    throw new Error(`Index ${contentHash.slice(0, 12)} was published, but the private journal could not record it (${err.message}). Run \`retry\` to record it; it makes no new commit.`);
+  }
+  return { ok: true, status: 'published', contentHash, publication: result };
 }
 
 // --- applying ---------------------------------------------------------------
@@ -397,12 +441,11 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
   let interrupted = false;
   try {
     const prior = journalFor(state, root);
-    if (prior && (prior.status === 'prepared' || prior.status === 'publish-failed')) {
-      throw new Refusal(
-        prior.status === 'prepared'
-          ? 'An earlier apply did not finish. Run `rollback` first; nothing else was changed.'
-          : 'An earlier change is applied but not yet published. Run `retry` first.',
-      );
+    if (prior?.status === 'prepared' || prior?.status === 'rolling-back') {
+      throw new Refusal(`An earlier ${prior.status === 'prepared' ? 'apply' : 'rollback'} did not finish. Run \`rollback\` first; nothing else was changed.`);
+    }
+    if (prior && !['published', 'not-needed'].includes(prior.publication)) {
+      throw new Refusal('An earlier change is not yet published (or its publication is unconfirmed). Run `retry` first; nothing else was changed.');
     }
     const plan = planMaintenance(root, action);
     if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
@@ -459,10 +502,11 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
         // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
         throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
       }
-      writeJournal(state, { ...journal, status: 'rolled-back' });
+      // Back as it was before, which the last good index already says.
+      writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed' });
       throw new Refusal(`The change did not validate (${err.message}); everything was put back from the private copy.`);
     }
-    const applied = { ...journal, status: 'applied' };
+    const applied = { ...journal, status: 'applied', publication: 'pending' };
     writeJournal(state, applied);
     // 3. Publication, through the existing job.
     return { ...(await publishStep(state, applied, scanned, publish)), lines: plan.lines };
@@ -478,7 +522,7 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
  * else (another run's row, a hand edit) refuses the whole restore. The renamed
  * file moves back only from its recorded name with its recorded bytes.
  */
-function restore(root, journal) {
+function restore(root, journal, beforeWriting = () => {}) {
   const current = (name) => {
     const t = readDeclaration(root, name, false);
     return t === null ? null : sha(t);
@@ -511,40 +555,60 @@ function restore(root, journal) {
       throw new Refusal(`"${r.from}" and "${r.to}" are neither as this change left them nor as they were; they are left as they are.`);
     }
   }
+  beforeWriting();
   for (const s of steps) s();
 }
 
-/** Validate, scan and publish again from the retained state — after a failed publication. */
+/** Validate, scan and publish again from the retained state — after a failed, unconfirmed or interrupted publication. */
 export async function retryMaintenance({ root: rootArg, state: stateArg, publish }) {
   const root = resolve(rootArg);
   const state = stateDir(root, stateArg);
   const token = lock(state);
   try {
     const journal = journalFor(state, root, true);
-    if (!journal || journal.status === 'prepared') throw new Refusal(journal ? 'The last apply did not finish; run `rollback`.' : 'Nothing has been applied here yet.');
-    return await publishStep(state, journal, validateAndScan(root, state, null), publish);
+    if (!journal) throw new Refusal('Nothing has been applied here yet.');
+    if (journal.status === 'prepared' || journal.status === 'rolling-back') {
+      throw new Refusal(`The last ${journal.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
+    }
+    return await publishStep(state, { ...journal, lockToken: token }, validateAndScan(root, state, null), publish);
   } finally {
     unlock(state, token);
   }
 }
 
-/** Put the last change back from its private copy, then publish the restored archive. */
-export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish }) {
+/**
+ * Put the last change back from its private copy, then publish the restored
+ * archive. The lock comes FIRST and the journal is read under it; the journal
+ * says `rolling-back`, with this run's token, before the first write, so an
+ * interruption anywhere leaves a state the next `rollback` finishes.
+ * `interruptAfter: 'mark'` is the test seam for that.
+ */
+export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish, interruptAfter }) {
   const root = resolve(rootArg);
   const state = stateDir(root, stateArg);
-  const journal = journalFor(state, root, true);
-  if (!journal || journal.status === 'rolled-back') throw new Refusal('There is no change here to roll back.');
-  const token = lock(state, journal);
+  const token = lock(state);
+  let interrupted = false;
   try {
-    restore(root, journal);
-    const back = { ...journal, status: 'rolled-back' };
+    const journal = journalFor(state, root, true);
+    if (!journal || journal.status === 'rolled-back') {
+      throw new Refusal(
+        journal && !['published', 'not-needed'].includes(journal.publication)
+          ? 'The last change is already rolled back but not yet published; run `retry`.'
+          : 'There is no change here to roll back.',
+      );
+    }
+    restore(root, journal, () => {
+      writeJournal(state, { ...journal, status: 'rolling-back', lockToken: token });
+      if (interruptAfter === 'mark') {
+        interrupted = true;
+        throw new Interrupted('interrupted after mark');
+      }
+    });
+    const back = { ...journal, status: 'rolled-back', publication: 'pending', lockToken: token };
     writeJournal(state, back);
-    const scanned = validateAndScan(root, state, null);
-    const out = await publishStep(state, back, scanned, publish);
-    writeJournal(state, { ...back, publication: out.status });
-    return out;
+    return await publishStep(state, back, validateAndScan(root, state, null), publish);
   } finally {
-    unlock(state, token);
+    if (!interrupted) unlock(state, token);
   }
 }
 
@@ -569,10 +633,14 @@ export function publishWithRunner(expectedRoot) {
     const custom = process.env.PC_MAINT_PUBLISH;
     const out = spawnSync('sh', custom ? ['-c', `${custom} "$@"`, 'sh', contentHash] : [runner, contentHash], { encoding: 'utf8', env: process.env });
     const last = (t) => (t || '').trim().split('\n').pop();
-    // A non-zero exit is the job's own proof that its ref never moved: it
-    // stops at a failed scan, a refused expectation or a failed atomic update.
+    // Only the job's own refusals PROVE nothing was published: 2 (its
+    // configuration refused, nothing ran), 3 (the scan is not the validated
+    // index, refused before any request) and 4 (the scan, or the publisher
+    // before its ref write, failed). Any other exit, a signal or a failed
+    // spawn may have come after GitHub accepted the ref: unknown.
     if (out.status === 3) throw new PublishFailed(`the job scanned a different index than the validated ${contentHash.slice(0, 12)} — is its archive root ${expectedRoot}? (${last(out.stderr)})`, true);
-    if (out.status !== 0) throw new PublishFailed(`the NAS job exited ${out.status}: ${last(out.stderr)}`, true);
+    if (out.status === 2 || out.status === 4) throw new PublishFailed(`the NAS job exited ${out.status} before publishing: ${last(out.stderr)}`, true);
+    if (out.status !== 0) throw new PublishFailed(`the NAS job ${out.status === null ? `was stopped (${out.signal ?? out.error?.message ?? 'no exit status'})` : `exited ${out.status}`}: ${last(out.stderr)}`, false);
     const evidence = /^published-index (unchanged|published|created) ([0-9a-f]{64})$/.exec(last(out.stdout));
     if (!evidence) throw new PublishFailed('the job exited 0 without its publication evidence line', false);
     if (evidence[2] !== contentHash) throw new PublishFailed(`the job reports index ${evidence[2].slice(0, 12)}, not the validated ${contentHash.slice(0, 12)}`, false);
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index 27459273e387f07ae7e0ee0640c7ed8443032c16..a553b415d9fdac66b88fe013fbf16b883fc3a997 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -4,13 +4,13 @@ import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync,
 import { tmpdir } from 'node:os';
 import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
-import { describe, expect, it } from 'vitest';
+import { describe, expect, it, vi } from 'vitest';
 // @ts-expect-error — untyped operator tools; these are the real ones.
 import { applyMaintenance, planMaintenance, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
 // @ts-expect-error — see above.
 import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
 // @ts-expect-error — see above.
-import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
+import { makeGitHubIndexTransport, publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
 import { followRenames } from '../src/domain/sourceReconcile';
 import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
 import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };
@@ -96,6 +96,38 @@ function fakeGit() {
   };
 }
 
+type Transport = ReturnType<typeof fakeGit>['transport'];
+/**
+ * GitHub's REST surface over a fake store, for the REAL transport. A request
+ * named in `lose` is carried out and then its response is lost — GitHub
+ * accepted it, this process never hears so.
+ */
+function githubFetch(t: Transport, lose: Set<string>) {
+  return async (url: string, init: { method?: string; body?: string } = {}) => {
+    const method = init.method ?? 'GET';
+    const ep = url.split('/repos/o/r/')[1]!;
+    const body = init.body ? JSON.parse(init.body) : {};
+    const reply = (status: number, json: unknown = {}) => ({ ok: status < 300, status, json: async () => json });
+    let res;
+    if (method === 'GET' && ep.startsWith('git/ref/heads/')) {
+      const r = await t.getRef(ep.slice(14));
+      res = r ? reply(200, { object: { sha: r.sha } }) : reply(404);
+    } else if (method === 'GET' && ep.startsWith('contents/')) {
+      const [path, ref] = ep.slice(9).split('?ref=');
+      const f = await t.getFile(ref!, path!);
+      res = f ? reply(200, { content: Buffer.from(f.text).toString('base64') }) : reply(404);
+    } else if (method === 'GET' && ep.startsWith('git/commits/')) res = reply(200, { tree: { sha: (await t.getCommit(ep.slice(12))).treeSha } });
+    else if (ep === 'git/blobs') res = reply(201, { sha: await t.createBlob(body.content) });
+    else if (ep === 'git/trees') res = reply(201, { sha: await t.createTree({ baseTreeSha: body.base_tree ?? null, path: body.tree[0].path, blobSha: body.tree[0].sha }) });
+    else if (ep === 'git/commits') res = reply(201, { sha: await t.createCommit({ treeSha: body.tree }) });
+    else if (method === 'PATCH') res = reply((await t.updateRef(ep.slice(15), body.sha, body.expected_head_sha)) === 'ok' ? 200 : 422);
+    else if (ep === 'git/refs') res = reply((await t.createRef(body.ref.slice(11), body.sha)) === 'ok' ? 201 : 422);
+    else throw new Error(`unexpected ${method} ${ep}`);
+    if (lose.delete(method === 'PATCH' ? 'PATCH' : `${method} ${ep}`)) throw new TypeError('fetch failed: the response was lost');
+    return res;
+  };
+}
+
 const sessionsOf = (text: string, ns: number[]) =>
   (JSON.parse(text) as { sessions: { n: number; roster: string[]; rosterTrusted: boolean; resources: { path: string; role: string; pieces: string[] }[] }[] }).sessions
     .filter((s) => ns.includes(s.n))
@@ -310,6 +342,179 @@ describe('maintaining the Setar archive', () => {
       expect(JSON.parse(git.published()!).contentHash).toBe(JSON.parse(good!).contentHash);
       expect(git.main()).toEqual(['c-main', { 'state.json': 'practice data' }]);
 
+      // --- A RUN KILLED IN ANY PHASE: every entry point recovers its dead lock -
+      // A REAL child process dies at each phase of apply, rollback and retry.
+      // Its lock stays behind; each entry point adopts it (the journal, not the
+      // dead token, decides), refuses only what the journal forbids, and the
+      // route the refusal names finishes the job.
+      const lockFile = join(state, 'lock');
+      const journal = () => JSON.parse(readFileSync(join(state, 'journal.json'), 'utf8'));
+      const killed = (fn: string, args: object, interruptAfter?: string) =>
+        run(
+          'node',
+          ['--input-type=module', '-e', `const m = await import(${JSON.stringify(TOOL)}); const a = JSON.parse(process.env.RUN); await m.${fn}({ ...a, publish: async () => { process.kill(process.pid, 'SIGKILL'); await new Promise(() => {}); } }).catch((e) => { process.exitCode = e instanceof m.Interrupted ? 7 : 1; });`],
+          { env: { ...process.env, RUN: JSON.stringify({ root, state, ...args, ...(interruptAfter ? { interruptAfter } : {}) }) } },
+        ).then(() => 0, (e: { code: number | null; signal?: string }) => e.signal ?? e.code);
+      /** The dead run's lock, put back before each entry point so each must adopt it itself. */
+      const deadLock = () => {
+        const text = readFileSync(lockFile, 'utf8');
+        expect(Number(text.split(' ')[1])).not.toBe(process.pid);
+        return () => (existsSync(lockFile) ? undefined : writeFileSync(lockFile, text));
+      };
+      const c2 = `${S39}/نمونه-ضربی-سه-گاه-لطفی-5.mp4`;
+      const move = { kind: 'rename', from: c, to: c2 };
+      const moveArgs = () => ({ action: move, previewId: planMaintenance(root, move).id });
+      const another = { kind: 'register', piece: 'یکی-دیگر' };
+      const settled = { decl: declarations(root), media: media(root), index: git.published(), commits: git.commits() };
+      const isSettled = () => expect([declarations(root), media(root), git.published(), git.commits()]).toEqual([settled.decl, settled.media, settled.index, settled.commits]);
+
+      // Apply killed before publication: the archive half-written, `prepared`.
+      for (const phase of ['copy', 'registry', 'log', 'rename']) {
+        expect(await killed('applyMaintenance', moveArgs(), phase), phase).toBe(7);
+        expect(journal().status, phase).toBe('prepared');
+        const plant = deadLock();
+        await expect(apply(another), phase).rejects.toThrow(/apply did not finish. Run `rollback`/);
+        expect(existsSync(lockFile), phase).toBe(false); // adopted, then released: it was ours
+        plant();
+        await expect(retryMaintenance({ root, state, publish: git.publish }), phase).rejects.toThrow(/did not finish; run `rollback`/);
+        plant();
+        expect(await rollbackMaintenance({ root, state, publish: git.publish }), phase).toMatchObject({ ok: true });
+        isSettled(); // put back exactly; the unchanged index made no commit
+      }
+      // Apply killed DURING publication: applied, publication pending. Both routes work.
+      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
+      expect(journal()).toMatchObject({ status: 'applied', publication: 'pending' });
+      let plant = deadLock();
+      await expect(apply(another)).rejects.toThrow(/not yet published .*Run `retry`/);
+      plant();
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
+      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
+      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
+      settled.index = git.published();
+      settled.commits = git.commits();
+      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
+      deadLock()();
+      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
+      isSettled();
+      // Rollback killed after marking itself, before its first write: the mark
+      // carries ITS token, and the next rollback adopts it.
+      expect(await killed('applyMaintenance', moveArgs(), 'log')).toBe(7);
+      expect(await killed('rollbackMaintenance', {}, 'mark')).toBe(7);
+      expect(journal()).toMatchObject({ status: 'rolling-back', lockToken: readFileSync(lockFile, 'utf8').split(' ')[0] });
+      plant = deadLock();
+      await expect(apply(another)).rejects.toThrow(/rollback did not finish. Run `rollback`/);
+      plant();
+      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/rollback did not finish; run `rollback`/);
+      plant();
+      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
+      isSettled();
+      // Rollback killed DURING its publication: restored, not yet published.
+      expect(await killed('applyMaintenance', moveArgs(), 'rename')).toBe(7);
+      expect(await killed('rollbackMaintenance', {})).toBe('SIGKILL');
+      expect(journal()).toMatchObject({ status: 'rolled-back', publication: 'pending' });
+      expect([declarations(root), media(root)]).toEqual([settled.decl, settled.media]);
+      plant = deadLock();
+      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
+      plant();
+      await expect(rollbackMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/already rolled back but not yet published; run `retry`/);
+      plant();
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+      isSettled();
+      // Retry killed during ITS publication, after adopting apply's dead lock.
+      expect(await killed('applyMaintenance', moveArgs())).toBe('SIGKILL');
+      expect(await killed('retryMaintenance', {})).toBe('SIGKILL');
+      plant = deadLock();
+      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
+      plant();
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, status: 'published' });
+      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
+      settled.index = git.published();
+      settled.commits = git.commits();
+      // A run killed before it wrote any journal left only its lock: the
+      // finished journal stands, and the next run proceeds.
+      const gone = await run('node', ['-e', 'console.log(process.pid)']).then((o) => o.stdout.trim());
+      writeFileSync(lockFile, `never-journaled ${gone}`);
+      // ONE adopter at a time: while another live run holds the claim on that
+      // dead lock, every entry point refuses and writes nothing; a claim left
+      // by a dead claimer is cleared by the refusal, and the next run adopts.
+      const claim = join(state, 'lock.adopt.never-journaled');
+      writeFileSync(claim, `live-claimer ${process.pid}`);
+      const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
+      for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
+        await expect(entry()).rejects.toThrow(/taking over an interrupted run’s lock/);
+      }
+      expect([readFileSync(lockFile, 'utf8'), readFileSync(join(state, 'journal.json'), 'utf8'), existsSync(claim)]).toEqual([`never-journaled ${gone}`, journalNow, true]);
+      isSettled();
+      writeFileSync(claim, `dead-claimer ${gone}`);
+      await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/taking over/);
+      expect(existsSync(claim)).toBe(false);
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+      expect(existsSync(lockFile)).toBe(false);
+      isSettled();
+
+      // --- GITHUB ACCEPTED THE WRITE, THE RESPONSE WAS LOST: unknown, never "nothing" -
+      // The REAL transport over a fake GitHub. updateRef lands, its answer is
+      // lost: publication is unconfirmed (the branch DOES hold the new index),
+      // and `retry` settles it without a second commit.
+      const lose = new Set<string>();
+      const viaGitHub = (text: string, hash: string) => publishIndex({ transport: makeGitHubIndexTransport({ repo: 'o/r', token: 't' }), indexText: text, expectedContentHash: hash });
+      try {
+        vi.stubGlobal('fetch', githubFetch(git.transport, lose));
+        lose.add('PATCH');
+        const lost = await applyMaintenance({ root, state, ...moveArgs(), publish: viaGitHub });
+        expect(lost).toMatchObject({ ok: false, status: 'publish-failed' });
+        expect(lost.message).toMatch(/could not be confirmed \(fetch failed.*may already be published.*Run `retry`/s);
+        expect(lost.message).not.toMatch(/last good index/);
+        expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
+        expect(journal().publication).toBe('unknown');
+        await expect(apply(another)).rejects.toThrow(/unconfirmed\)\. Run `retry`/);
+        const landed = git.commits();
+        expect(await retryMaintenance({ root, state, publish: viaGitHub })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+        expect(git.commits()).toBe(landed);
+        // createRef likewise, on a repository with no source-index branch yet —
+        // through ROLLBACK's publication this time.
+        const fresh = fakeGit();
+        vi.stubGlobal('fetch', githubFetch(fresh.transport, lose));
+        lose.add('POST git/refs');
+        const lostCreate = await rollbackMaintenance({ root, state, publish: viaGitHub });
+        expect(lostCreate).toMatchObject({ ok: false, status: 'publish-failed' });
+        expect(lostCreate.message).toMatch(/could not be confirmed.*may already be published/s);
+        expect(lostCreate.message).not.toMatch(/last good index/);
+        expect(JSON.parse(fresh.published()!).contentHash).toBe(scanToIndex(root).contentHash);
+        expect(await retryMaintenance({ root, state, publish: viaGitHub })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+        expect(fresh.commits()).toBe(1);
+        // A failure BEFORE the ref write is proved: the last good index stands.
+        fresh.fail(true);
+        await expect(viaGitHub(fresh.published()!, JSON.parse(fresh.published()!).contentHash.replace(/./, 'x'))).rejects.toMatchObject({ nothingPublished: true });
+        await expect(publishIndex({ transport: makeGitHubIndexTransport({ repo: 'o/r', token: 't' }), indexText: `${fresh.published()} ` })).rejects.toMatchObject({ nothingPublished: true });
+        fresh.fail(false);
+      } finally {
+        vi.unstubAllGlobals();
+      }
+      // The rollback above went to `fresh`; say it to `git` too.
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
+      settled.index = git.published();
+      settled.commits = git.commits();
+      isSettled();
+
+      // --- PUBLISHED, BUT THE JOURNAL COULD NOT RECORD IT: said as published --
+      const thenBlockJournal = async (text: string, hash: string) => {
+        const out = await git.publish(text, hash);
+        mkdirSync(join(state, 'journal.json.tmp')); // the journal's next write fails
+        return out;
+      };
+      const unrecorded = applyMaintenance({ root, state, ...moveArgs(), publish: thenBlockJournal });
+      await expect(unrecorded).rejects.toThrow(/was published, but the private journal could not record it .*Run `retry` to record it/s);
+      rmSync(join(state, 'journal.json.tmp'), { recursive: true });
+      expect(JSON.parse(git.published()!).contentHash).toBe(scanToIndex(root).contentHash);
+      expect(journal()).toMatchObject({ status: 'applied', publication: 'pending' });
+      await expect(apply(another)).rejects.toThrow(/Run `retry`/);
+      const recorded = git.commits();
+      expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+      expect([git.commits(), journal().publication]).toEqual([recorded, 'published']);
+      expect(await rollbackMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true });
+      expect([declarations(root), media(root)]).toEqual([settled.decl, settled.media]);
+
       // --- THE CLI asks, then publishes through the existing job itself ----
       const cli = (args: string[]) =>
         run('node', [TOOL, '--root', root, '--state', state, ...args], { env: { ...process.env, PC_INDEX_CONFIG: join(base, 'no-config.env') } }).then(
@@ -344,6 +549,28 @@ describe('maintaining the Setar archive', () => {
       writeFileSync(stub, `console.log('published-index published ' + (process.env.WRONG ? '0'.repeat(64) : process.argv[2]));`);
       const wrong = await via(`node ${JSON.stringify(stub)}`, { WRONG: '1' });
       expect([wrong.code, wrong.out]).toEqual([1, expect.stringMatching(/reports index 000000000000, not the validated/)]);
+      // Only the job's own refusals (exit 2, 3, 4) prove nothing was published.
+      // Any other exit, or a job killed by a signal, may have come after GitHub
+      // accepted the ref: unconfirmed, never "the last good index is still".
+      const exits = join(base, 'exit-job.mjs');
+      writeFileSync(exits, `process.stderr.write('stopped\\n'); process.exit(Number(process.env.EXIT));`);
+      for (const [code, says] of [
+        ['1', /could not be confirmed \(the NAS job exited 1: stopped\).*may already be published/s],
+        ['137', /could not be confirmed \(the NAS job exited 137/],
+        ['4', /publication failed \(the NAS job exited 4 before publishing: stopped\).*last good index is still the published one/s],
+      ] as const) {
+        const r = await via(`node ${JSON.stringify(exits)}`, { EXIT: code });
+        expect([r.code, r.out], code).toEqual([1, expect.stringMatching(says)]);
+        if (code !== '4') expect(r.out, code).not.toMatch(/last good index/);
+      }
+      const signalled = await via('kill -9 $$;:');
+      expect([signalled.code, signalled.out]).toEqual([1, expect.stringMatching(/could not be confirmed \(the NAS job was stopped \(SIGKILL\)/)]);
+      // The REAL runner whose scan fails stops before publishing: exit 4, proved.
+      const noArchive = join(base, 'scan-fails');
+      mkdirSync(noArchive);
+      writeFileSync(join(noArchive, 'config.env'), `PC_ARCHIVE_ROOT=${join(noArchive, 'missing')}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${noArchive}\n`);
+      const scanFailed = await via(undefined, { PC_INDEX_CONFIG: join(noArchive, 'config.env') });
+      expect([scanFailed.code, scanFailed.out]).toEqual([1, expect.stringMatching(/exited 4 before publishing: The scan failed; nothing was published.*last good index is still the published one/s)]);
       // The REAL runner, configured for ANOTHER archive root, refuses before
       // any request — the published index is untouched, and it says so.
       const otherArchive = scratch();
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/nas-topology.md`
- `docs/setar-archive.md`
- `docs/setar-lesson-lifecycle.md`
- `scripts/publish-setar-index.mjs`
- `scripts/run-setar-index.sh`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
3244347 Keep Setar lessons and preparation coherent from archive to next class
```

## Check against the contract

- [ ] **ac-1** — New exact unique focused Node family, owning source/index semantics. Use sanitised committed temporary corpora independently transcribed from actual evidence, not a private backup or scanner-derived expectations. Run the real scanner, shared digest/graph decoder and publisher against a local fake Git boundary, then a thin clean-store import proving downstream source interpretation. Before repair prove session 40's existing correct registry identity versus its stacked-role filename, refused unnamed-demo attribution, session 41's genuine missing registration and excluded demo. After correction prove exact session-40 roster/attribution and session-41 recording plus correctly scoped demo, without shared personal takes or invented musical identity. An empty session-42 folder produces no indexed session, imported lesson or deadline. Cover ordinary supported types/forms discovered without metadata action, explicit unsupported/unregistered diagnostics, failed/partial inventory, exact rename-chain resolution, retained-not-described resources, corrected metadata and unchanged scan/publication rerun. Expected piece memberships and resource paths are hand-written; publisher targets stay isolated from practice data. Do not create or consolidate the duplicate Class 41 or exercise the app-created future Class 42 lifecycle here: those have their own families. _(proof: setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42)_
- [ ] **ac-2** — New exact unique operator-mutation family on scratch trees. Drive the guided route through fact/preview confirmation, then let it perform the registry/rename edits, private rollback copy, validation, scan and publication automatically, with no hand-edited CSV or separate owner-run publication step. Exercise genuine new registration, existing-key/malformed-name correction, confirmed roster and exact rename continuation while preserving nonempty extra columns and unrelated rows. Invalid/ambiguous input, symlinks, stale preview/concurrent edit, interrupted apply and failed publication must retain recoverable originals, keep the last good published index, and expose a safe retry; repeat execution makes no duplicate rows, rename forks or unnecessary commit. Prove mechanical edits, byte preservation, publication invocation/result and rollback here; reuse the source/index family's exact content oracle rather than re-running its full sessions 40/41 attribution matrix. Separately Claude must execute and record redacted live pre/post NAS checks: actual config/task authority, intended-account run, full-day schedule/next trigger, effective job permissions, corrected scan hash, commit-pinned published graph accepted by the app decoder, second-run no-commit result, affected-file byte preservation and a concrete rollback manifest. Scratch proof does not establish production repair: supply actual outputs without credentials or archive-root paths in committed evidence. Do not mark this complete with owner repair instructions. _(proof: setar guided maintenance is reversible stale safe and idempotent without altering media)_
- [ ] **ac-3** — New exact unique stateful Node/store family, owning full duplicate consolidation and preservation. Reproduce the real Class 41 shape with manual ID, two linked items, two commitments/two questions and a separate already-bound empty archive row. Through the supported repair obtain exactly one survivor retaining the manual ID and archive material. Extend this fixture with both-sided distinct notes, asked answers, authored references sharing a path but carrying distinct metadata, lesson attachments/bytes, historical links and recovery drafts. Assert complete preservation/rebinding without deleteLesson side effects or new suppressions. Cover first-time pathless counterpart, unique exact-path adoption, bound-session duplicate, durable keep-separate/skip, wrong instrument/date/number, the real Class 38 same-number/different-date counterexample, multiple candidates, pending notes/question saves, stale decisions, failed IndexedDB acknowledgement/retry and repeat Refresh with unchanged rev when no work remains. Ambiguity changes nothing silently; every entry stays reachable. Independently declare expected ownership/reference sets. The exact named browser companion in the proof route checks only that the real review/confirm/keep-separate controls reach this decision and display the surviving lesson and composed media in both engines; the full preservation matrix belongs here. Do not repeat Class 42 creation or transport round-trips in this family. _(proof: setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh)_
- [ ] **ac-4** — New exact unique future-class browser family in Chromium and WebKit at phone and desktop sizes, using roles/names and storage-aware helpers. With no NAS access, folder or media, create Class 42 dated 2026-11-24 in Compass, select it, commit work and capture a question. Prove its ID/date/intent agree across Lessons, item/class associations, Teacher report and practice capture. Advance to the lesson date/past it explicitly, add the real session-42 recording/materials to a scratch normal session folder, pass the scanner-produced published index to Refresh, resolve its match proposal and prove the archive binds to the original Compass lesson with the same commitments/question and composed files, not a second lesson. Repeated Refresh retains that one binding. In a focused branch, material arriving while the owner-planned date remains ahead must not cancel its legitimate upcoming status; distinguish archive-only future-dated history. Crossing midnight preserves past lesson intent/history without automatic question carry-forward. Own the visible actionable source/maintenance messages here, using minimal diagnostic fixtures rather than reproducing sessions 40/41 parser expectations. Do not repeat Class 41 consolidation, its preservation matrix, keep-separate matrices or persistence/sync round-trips. No UI source-regex or debug hook substitutes for this journey. _(proof: setar future class preparation and later media use one lesson across every visible consumer)_
- [ ] **ac-5** — New exact unique durable-boundary family in Chromium and WebKit, starting from an independently declared already-reconciled fixture. Do not perform the Class 41 merge again. Exercise repaired schema state, supported older-schema data if representation changes, persist migrate+merge, ordinary/full-backup import, sync pull, Keep remote and archive restore through existing entry points with mocked transport. Validate at every inbound door. At each handover check the canonical lesson/source binding and representative authored agenda/text and attachment ownership/bytes; retain suppression and explicit-separate decisions through acknowledged save and cold reload. A subsequent Refresh must neither recreate a removed duplicate nor restore hidden/unlinked material. Own malformed graph/duplicate binding/missing described attachment-byte refusal at inbound install boundaries; stale reconciliation previews and failed merge acknowledgements remain in the reconciliation family. Include unfinished practice and in-flight note/question writes where replacement interacts with this lane, preserving existing replacement guards and whole-snapshot conflicts. WebKit seeds state only; prove blob claims through Node/Chromium byte checks/full-backup paths. This checks persistence of the independently expected result, not the full consolidation algorithm or another copy of its preservation matrix. _(proof: setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material)_
- [ ] **ac-6** — Reuse this exact existing browser title, extending its behaviour family rather than creating a duplicate title. On a long-lived mounted ordinary/planned block and routine, instrument suspended, interrupted, closed, falsely-running silent and transient constructor-failure contexts. Verify a recovery/Test gesture is reachable even when reported ready or unavailable and creates/resumes the fresh context synchronously; no reload, late stale pulse, second scheduler or timer/history/marker mutation. Verify metronome interaction, pending/rejected resumes and hidden/visible return using existing cue/metronome companions. If current behaviour already passes a case, keep it. Automation proves calls/lifecycle and accessible recovery, never speaker output. _(proof: practice sound returns at the next tap after the context dies through every start and resume door)_
- [ ] **ac-7** — Reuse this exact existing title. Replace tight total-duration inequalities with deterministic invocation/behaviour assertions plus a finite generous deadlock guard. The real script still runs against local fast-index/slow-package, hung, refused, missing-suite and healthy mirrors and verifies resulting sources, failure exit and unchanged third-party/signature settings. Assert each probe receives the existing curl limit and workflows retain their install/job bounds and two-engine requirement, including negative cases. Artificial harness/process overhead must not fail correct routing; removing a probe bound or bypass/failure safeguard must fail. No unrelated production routing rewrite or CI timeout increase. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-8** — Only the physical-device claims: on the built revision in isolated preview data, hear the cue on Mac and native iPhone Safari/installed PWA after a normal idle/background/lock interruption and recover using the visible gesture without relaunch; confirm NAS recording/demo opening and playback on the real device where automated networking/player checks cannot prove it. Record platform/build/output route and limits. Claude performs all metadata/task/index repair and ordinary automated regression work; do not substitute owner NAS editing, duplicate cleanup, sync migration testing or a general product walkthrough for those proofs. If no sound code/affordance changes prove necessary, do not manufacture an unrelated audio acceptance burden. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **back-up-and-restore** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts, src/components/practiceCue.ts
- **prepare-for-the-next-class** — touched via src/pages/Lessons.tsx, src/pages/ActiveBlock.tsx
- **run-a-session-plan** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/store/useStore.ts matched changed file(s) src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts, src/components/practiceCue.ts matched changed file(s) src/components/practiceCue.ts, src/pages/ActiveBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

No repertoire code changed; items imported from the archive are seeded exactly as before (resting), and no item field or search path was touched.

## see-practice-patterns — unchanged

No insight, block or totals code changed; lesson reconciliation never writes practice blocks, minutes or results.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

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

### log-a-class — Works now (update proposed)

Proposed step changes:
  The musician Accepts the pre-filled class number and picks the date.
    Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
    Changes: A Lesson is stored for that instrument; the number is optional and editable.
  The musician Rewatches the class and types the notes, in Farsi or English.
    Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text, and 'Saved.' only once the device has stored them.
    Changes: Notes save themselves after a short pause and whenever the musician leaves the class — never merely because the field loses focus; Done is optional. Words still unsaved when the page reloads are written to that class afterwards, and a class whose notes changed meanwhile keeps both texts.
  The musician Adds a link to the class recording and to any scores — a NAS path or a full https link.
    Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
    Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.
  The musician Taps 'Open' on a link.
    Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
    Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
    Only if: A NAS base URL is set in Settings and the NAS is reachable from this device
− The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
−   Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
−   Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.
+ The musician Links or quick-adds the practice items that came out of the class, and commits the ones to be ready for a class with 'Prepare for Class N · date'.
+   Shows: Each linked item with its status; a piece the class’s Setar archive lists appears too, labelled '· in this class’s archive'; the item’s own page names the same classes.
+   Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision; a preparation names that one class, whose date is the deadline that raises the item’s priority as it nears.
  The musician Optionally attaches small hand-outs (a PDF, a photo, a short audio).
    Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
    Changes: Small blobs are stored on the device and travel with backups and sync.
+ The musician After the class, puts its recording and material in the ordinary session-N-DD-MM-YYYY folder on the NAS; the scheduled job publishes the index; Refresh Setar archive asks whether that session is the class planned in Compass.
+   Shows: 'Is this the class you planned in Compass?' with Link / Create separately / Skip, and anything the archive could not read grouped by the one action it needs (register, roster, rename, file type).
+   Changes: Link binds the session to the SAME lesson: its id, commitments, questions and notes stay; the archive’s files are composed onto it; it stays upcoming until its date. Repeating Refresh changes nothing.
+   Only if: The NAS job has published the session

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/domain/practiceSessionModel.ts, src/components/ItemNotes.tsx, src/store/notesDrafts.ts, src/components/practiceCue.ts, src/components/metronome.ts, src/components/TeacherQuestionCapture.tsx

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now (update proposed)

Proposed step changes:
(no step changes)

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx, src/components/TeacherQuestionCapture.tsx, src/pages/ActiveBlock.tsx, src/pages/RoutineRunner.tsx, src/domain/lessonAgenda.ts

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/domain/lessonAgenda.ts, src/components/ui.tsx, src/components/metronome.ts

Evidence: 6 steps: 6 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts, src/pages/Repertoire.tsx, src/components/metronome.ts, src/components/TeacherQuestionCapture.tsx

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261030-keep-setar-lessons-and-preparation-coher-d2ee/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261030-keep-setar-lessons-and-preparation-coher-d2ee' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261030-keep-setar-lessons-and-preparation-coher-d2ee/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261030-keep-setar-lessons-and-preparation-coher-d2ee/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
