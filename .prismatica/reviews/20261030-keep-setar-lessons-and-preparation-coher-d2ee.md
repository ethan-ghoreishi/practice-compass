---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 00b5e6de95872873ef7c9c538cf1c3aae3c20c90
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: deleting a private aside can delete the last name of media or a
      concurrent declaration, while rename or recovery reports success."
    counterexample: "BOUND HEAD 17bb61029e7659d1ed1b009db07a7a8653987918; patch
      00b5e6de95872873ef7c9c538cf1c3aae3c20c90. Invariant: mutations and
      recovery preserve concurrent state and recoverable originals, and report
      only what was restored. Reproduced using production function bodies in an
      in-memory filesystem: moveExact links A to B; at judge-drop another writer
      atomically replaces B; dropName checks only the captured A inode and
      removes its aside (scripts/setar-archive-maintenance.mjs:603-616). The
      original inode has zero names and forward rename returns success. Reverse
      rename and restore of a stopped two-name move also return success with no
      name retaining the original. Judged-failure undo likewise loses the
      concurrent in-place bytes when its retained source name is replaced.
      putBack links a capture back then removes the aside at 466; replacing the
      restored public name between those calls loses the capture's last name
      too. ALL INSTANCES: moveExact final drop (591), judged-failure cleanup
      (583), restore stopped-move drop (832), putBack used by replaceDeclaration
      mismatch/install-error branches (508,519) and dropName mismatch (613).
      Consumers: Apply, automatic restore, explicit Rollback; Retry takes the
      shared lock but does not drop media itself. Checked clean by inspection or
      control probes: ordinary forward/reverse/stopped moves, unique superseded
      declaration retention, immediate written tracking, static symlink refusal,
      bound-folder writes, no automatic private-name recovery, token-specific
      unlock/release, stale digest and destination refusal. Rework the whole
      deletion/retention family in the SAME exact ac-2 title, setar guided
      maintenance is reversible stale safe and idempotent without altering
      media; cover replacement/removal of the retained counterpart, not only the
      name being dropped, and putBack's link-to-unlink interval. Limits: virtual
      filesystem and production functions; no disk writes, live NAS or OS crash
      proof."
  - family: maintenance-publication-matches-validated-index
    summary: "P2: a first ref-read failure reports definite non-publication without
      checking an older unanswered publication intent."
    counterexample: "BOUND to the same HEAD and patch. Invariant: earlier
      publication uncertainty remains explicit until positive remote evidence
      excludes it; a failed newer attempt does not prove the branch stayed
      unchanged. Reproduced with production publishIndex and publishStep plus
      in-memory Git/filesystem: remote P holds X; a scheduled H1 update C1 from
      P loses its answer and writes the real pending intent; newer maintenance
      has no unresolved hashes in its own journal; its first getRef throws HTTP
      500. guarded is still false because readIntents follows getRef
      (scripts/publish-setar-index.mjs:164-182), so catch at 210-212 sets
      nothingPublished. publishStep records publication=failed, unresolved=[]
      and says the source-index branch is as it was
      (scripts/setar-archive-maintenance.mjs:669-684). Delayed C1 then lands and
      publishes H1. The intent file is retained, so a subsequent successful
      retry can fence it; this is a false certainty/reporting defect, not intent
      deletion. SWEPT: intent reads/writes/deletions, first and subsequent ref
      reads, updateRef/createRef, conflict/unchanged/success/lost-answer
      branches, CLI exit mapping, runner, publishWithRunner, publishStep,
      Apply/Retry/Rollback. All production entry points share the early-ref-read
      classification; test-only publishers without an intent cannot prove this
      invariant. Checked clean: protective 422 without movement once and four
      times, retained intent after lost answer, accepted protective write
      fencing the predecessor, ordinary unchanged reruns, and maintenance
      journal preservation when its own earlier unresolved hash exists. Extend
      the SAME exact ac-2 title with pending scheduled predecessor plus failed
      first ref read, including update/create and unknown-intent variants; do
      not claim branch certainty from proof about only the newer attempt.
      Limits: synthetic transport and in-memory intent/journal; no live GitHub
      mutation or full Check rerun."
createdAt: 2026-11-01T00:20:14.467Z
sealedAt: 2026-11-01T00:30:18.488Z
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
- **Diff patch-id:** `00b5e6de95872873ef7c9c538cf1c3aae3c20c90`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: recovery can still lose concurrent declarations or media names, displace a live lock, write through a replaced session folder, and falsely report that an edit was put back.
  _counterexample:_ BOUND: HEAD 69fb8a87fd08243a9bfa77eb3d011d873d686630; patch b90395b404306d256f1d96b8e305f5d61dcf426c. Invariant: mutations and recovery preserve concurrent state and exact ownership, stay inside the authorised archive, and report only what was restored. REPRODUCED in memory using production function bodies: (1) replaceDeclaration names retained originals .<name>.superseded-<owner> (scripts/setar-archive-maintenance.mjs:511). Apply and automatic restore reuse that owner, so restoration replaces the retained original inode with the after-edit inode. A concurrent save through an open handle to the original loses its last name. Reproduced for PIECES.csv and RENAME-LOG.csv, including applyMaintenance after an injected scan failure; it reports everything put back. (2) An I/O error at that post-install rename leaves the new declaration installed, but written.add has not run (710-714). Automatic restore skips it and writes rolled-back/not-needed (724-731). Actual applyMaintenance returned everything was put back with registry still after. The finally cleanup can likewise throw after installation. (3) A concurrent replacement of the media source with a file having another hard link, followed by interruption at judge-drop, leaves its public name on an aside. recoverDrops deletes that aside solely because nlink > 1 (459), then restore succeeds by moving our original back over the now-missing public name. The concurrent file remains only at its unrelated alias. All three dropName consumers inherit the recovery heuristic: moveExact final drop, judged-failure undo, and restore of a stopped two-name move. (4) recoverCaptures and recoverDrops infer ownership from names (433,455), without journal/inode claims. An unrelated .PIECES.csv.captured-unrelated was installed as PIECES.csv and its original name removed. (5) Swapping a checked session directory for a symlink at moveExact's link seam (529) makes linkSync and its cleanup write in the outside directory before the late realFolders check refuses. Both forward and reverse moves share this path; dropName and recovery also use re-resolved directory paths. (6) Two releaseLock calls reading the same old record can interleave with new operations: first releases old; C acquires; the stale second releaser captures C's live lock; D acquires in the gap; restoring C then fails because D stands. Both lock calls returned, C's lock was displaced, and stale release refused only afterwards. removeLockIf's capture-before-judge is shared with unlock (349-367). SWEPT: all declaration writes, both log-presence branches, all media/drop consumers, capture/putBack/recoverCaptures/recoverDrops, lock/assertOwner/removeLockIf/unlock/releaseLock, Apply automatic restore, explicit Rollback, Retry's lock-time recovery, state/journal/copy helpers, CLI and scanner/publisher neighbours. CLEAN BY INSPECTION or focused probes: ordinary atomic lock acquisition, static symlink refusals, pre-existing destination refusal, sequential stale digests, restore before/after digest preflight, archive binding, private-copy digest checks, and normal one-write retention. Status/preview do not directly mutate; no-op Apply and Retry still enter lock-time recovery. REWORK: close these siblings together in the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, including automatic recovery, I/O failures after mutation, hard-linked replacements, unclaimed recovery files, folder changes, and stale lock release. LIMITS: virtual filesystem and injected scan/planning failures for orchestration; no disk writes, full Check rerun, live NAS or OS crash proof.
- **maintenance-publication-matches-validated-index** — P2: a rejected newer ref write clears an older unanswered write, allowing unchanged success followed by the delayed stale publication.
  _counterexample:_ BOUND: same HEAD/patch. Invariant: an older unanswered ref write remains guarded until positive remote evidence or a successful newer ref movement prevents it landing. REPRODUCED with real publishIndex bodies, real scanner-built indexes and an in-memory Git/filesystem: remote P holds H0; old H1 write C1 from P loses its answer and remains delayed, with its intent recorded. Archive returns to H0. Next publisher sees C1's intent and constructs protective C2 from P, but updateRef answers HTTP 422 without moving P. Line 202 unconditionally removes the intent. Its next loop sees P still holding H0 and returns unchanged at 170. Delayed C1 then fast-forwards P successfully and publishes stale H1 after the newer success. Desired hash b10199745f4121a22fed906c5655d4bb847bde0638ea1e03cdd9453cb9451184; final stale hash f225d0cdbc59fac794d6887456fd283ebf47cf891915d463d6ae59f546bc785a. This is a reachable transport answer: makeGitHubIndexTransport maps any 422 to a conflict string (358), and GitHub documents 422 for validation failure or endpoint spam, not proof of ref movement. The fakeGit in tests/setar-maintenance.test.ts:81 models 422 only as a different current head, so the current ac-2 matrix misses this case. SWEPT: readIntent/writeIntent, every intent deletion, publishIndex conflict/unchanged/received/lost-answer branches, real getRef/getFile/blob/tree/commit/updateRef/createRef transport, takeSeat, archiveConfirmation, CLI main, scheduled runner, publishWithRunner, publishStep and Apply/Retry/Rollback journal transitions. All production entry points share the bug, including rollback/retry whose desired index is already remote. Test-only callers in archiveIndex.test.ts, setar-lifecycle.test.ts and setar-practice.browser.test.ts omit intent and cannot prove this recovery invariant. CLEAN: received ref writes followed by unchanged repeats (probed, no extra commit), expected-hash refusal before requests, retained intent on thrown ref writes, serial seat lifetime while publisher lives, and publishStep's sticky unresolved hashes on ordinary failed retries. Positive unchanged evidence becomes insufficient in the reproduced history. REWORK: preserve predecessor uncertainty through rejected protective writes until actual remote/ref evidence makes every delayed predecessor unable to land. Extend the SAME exact ac-2 title with rejection without ref movement and a delayed predecessor, alongside real ref-advance conflict and lost-response neighbours. LIMITS: synthetic transport and in-memory intent filesystem, no live GitHub mutation or full rerun.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index a60a01941c8eac34f4caf6c93a5284a4a8a200f2..49aa456e136fc2b38649dab467aff7ddcc9b38bf 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -2,6 +2,36 @@
 
 Durable record of non-obvious choices. Newest first.
 
+## Setar maintenance stops and asks rather than recover on a guess (2026-10-31)
+
+Same lane, third sealed rejection; this supersedes the recovery and lock
+bullets below. The owner's direction: the tool is used rarely, so a smaller
+automatic surface that is correct beats recovery that guesses.
+
+- **No automatic recovery from a private name.** A file under one of the
+  tool's private names (`.<declaration>.captured-…`, `.<leaf>.dropping-…`)
+  proves nothing about whose it is; deleting a "second name" or installing a
+  capture lost someone's file. Every run now refuses while one exists, naming
+  each with the `mv -n` that puts it back; `rollback`'s exact judgement then
+  finishes. Only a killed run leaves one, and that run already needs a hand
+  `release-lock`.
+- **A write is recorded the instant the archive changes**, so a failure after
+  it (keeping the replaced file, cleanup, the scan) is judged by the automatic
+  put-back, which says "put back" only when it did. Every set-aside copy gets
+  its own name, so no put-back can displace a kept file a handle still writes.
+- **The lock is a folder holding one `<token>.json`**, renamed into place and
+  released only by unlinking that exact name: no release, stale or concurrent,
+  can take a newer run's lock (POSIX has no compare-and-delete by path; unique
+  names make one).
+- **A rename stays inside one session folder**, and every media write runs in
+  that folder bound by inode (its leaf names only), so swapping the folder for
+  a link cannot carry a write outside.
+- **An unanswered ref write is retired only by evidence.** A non-force write
+  from P can land only while the branch is at P: it stays guarded until the
+  branch is observed elsewhere or a later write is accepted. A refused write
+  (GitHub's 422 can mean validation, not movement) never retires it, and a run
+  that ends while one is guarded never claims "nothing published".
+
 ## Setar maintenance: one owner per archive, writes proved at the write, publication open until observed (2026-10-31)
 
 Same lane, second sealed rejection; this supersedes the dead-lock adoption
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 0625aabe21008691115948de80096e6eeb0b6a1c..d510de9b692b9ca14bcc94dfa2b3ddeed36b7951 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -661,22 +661,33 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   proves, AT the write, the exact state it expects: a declaration is moved
   aside (atomic), its bytes judged, and the new one linked in, which never
   overwrites; the declaration it replaced is KEPT beside it as
-  `.<name>.superseded-<run>` (the scanner skips dotfiles), never unlinked, so a
-  program still holding it open writes into a kept file whenever it writes. A
+  `.<name>.superseded-<id>` (the scanner skips dotfiles; a fresh id for every
+  write), never unlinked, so a program still holding it open writes into a
+  kept file whenever it writes. A
   media file gets its new name by link (never over anything), is judged by
   size and SHA-256, and only then loses its old name — and any name is dropped
   only after it is first moved to a private name and judged THERE, so a file
-  renamed onto it meanwhile keeps its name (put back, never overwritten); a
-  run stopped there has the next run put that file back at its name, or drop
-  the private name when it is a second name of the moved file. An
-  edit, deletion or new file from anyone else at that instant is kept and the
-  run refuses. A failure while editing, and `rollback`, put back only what THIS
-  change wrote — judged first, and proved again at each write against what
-  this change wrote, never a fresh read. A run stopped with a declaration set
-  aside has it put back by the next run; one stopped between a move's two
-  names has the new name dropped by `rollback`.
-- **One owner per archive.** The lock is one dotfile in the archive's root,
-  shared by every `--state` folder, and every publisher checks it. A lock is
+  renamed onto it meanwhile keeps its name (put back, never overwritten). A
+  rename stays inside its session folder, and every media write runs inside
+  that folder bound by inode, so a folder swapped for a link meanwhile cannot
+  carry a write outside the archive. An edit, deletion or new file from
+  anyone else at that instant is kept and the run refuses. A failure after
+  the archive changed, and `rollback`, put back only what THIS change wrote —
+  each write recorded the instant it is made, judged first, and proved again
+  at each write against what this change wrote, never a fresh read; "put
+  back" is said only when it was.
+- **A stopped run is finished by hand, never on a guess.** A run killed in
+  the middle of a write leaves a file under a private name
+  (`.<declaration>.captured-…` in the root, `.<file>.dropping-…` in a session
+  folder). Nothing recovers it automatically — a name proves nothing about
+  whose file it is — so every run refuses while one exists, naming each with
+  the `mv -n` that puts it back (never over anything); then `rollback`
+  finishes from the journal (it drops the new name of a move stopped between
+  its two names).
+- **One owner per archive.** The lock is one dot-folder in the archive's root
+  holding one `<run>.json`, shared by every `--state` folder, and every
+  publisher checks it; a release removes only that exact record, so it never
+  takes a newer run's lock. A lock is
   never adopted on a guess about a process: a run that finds one refuses and
   names it. If nothing is running (check `ps`), `release-lock` shows the
   record and `release-lock --record <id>` releases exactly that one, in any
@@ -700,9 +711,12 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   `unchanged` one included, is made after the older write was answered. A
   write asked for but never answered (its publisher died, or lost the answer)
   is recorded first in `setar-publish-intent.json` in the job's work folder;
-  unless the branch already holds that commit, the next publisher moves the
-  ref (a commit even for unchanged content), so it can never land afterwards.
-  A paused or orphaned publisher therefore never puts an older index over a
+  while the branch is still at that write's parent, every publisher moves the
+  ref (a commit even for unchanged content), so it can never land afterwards;
+  only the branch observed elsewhere, or a later write's own acceptance,
+  retires it — never a refused write (a 422 need not mean the ref moved), and
+  a run that ends while one is still guarded is unconfirmed, never "nothing
+  published". A paused or orphaned publisher therefore never puts an older index over a
   newer one. Success needs the publisher's last line
   `published-index <status> <hash>` naming that hash. The runner is the only
   entry point on the NAS: its work folder holds the intent record every
diff --git a/docs/setar-lesson-lifecycle.md b/docs/setar-lesson-lifecycle.md
index 68b6eed6738921789e757e58df63ac1fea1c7e00..c9f74075cf8371487dcb07eae4dee4c9eb7e4702 100644
--- a/docs/setar-lesson-lifecycle.md
+++ b/docs/setar-lesson-lifecycle.md
@@ -170,10 +170,13 @@ Three maintenance invariants. **Every archive write proves the exact state
 it expects at the write** (capture-by-rename then link for declarations, link
 then judge, then drop the old name only from a private aside; the replaced
 declaration is kept, never unlinked); consumers: apply's registry/log/rename,
-the automatic put-back and `rollback` (expecting what THIS change wrote),
-recovery of a capture a stopped run left. **One owner per archive**: one lock
-in the archive root, never adopted on a guess, released only by its exact
-record (`release-lock`); consumers: apply, retry, rollback across `--state`
+the automatic put-back and `rollback` (expecting what THIS change wrote,
+recorded the instant it is written); a file a stopped run left under a private
+name is never recovered automatically — every run refuses, naming it, until
+the operator puts it back by hand. **One owner per archive**: one lock
+folder in the archive root holding one `<run>.json`, never adopted on a guess,
+released only by that exact record's own name (`release-lock`, a run's own
+release), so no release takes a newer run's lock; consumers: apply, retry, rollback across `--state`
 folders, every publisher's pre-write check (scheduled job, maintenance child,
 orphan). **Publication is open until observed**: each attempt's validated
 hash is written as open before remote work, `unresolved` survives every later
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index ec01d98755df378ed02aa7ed792b9f11f7e21eb9..9f42d2974bc63fcdbc55c8aba7cc5c37104d84be 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -28,9 +28,11 @@
 // newer decision — even an `unchanged` one that moves no ref — is always made
 // after the older publisher's write has been answered. A write asked for but
 // never answered (its publisher died, or the answer was lost) is recorded
-// first in `setar-publish-intent.json` beside the index: the next publisher,
-// unless the branch already holds that commit, moves the ref (a commit even
-// for unchanged content), so the unanswered write can never land after it.
+// first in `setar-publish-intent.json` beside the index: while the branch is
+// still at that write's parent, every later publisher moves the ref (a commit
+// even for unchanged content), so it can never land after them; only the
+// branch observed elsewhere, or a later write's own success, retires it —
+// never a refused write.
 //
 // WHY A SEPARATE BRANCH. The app's own sync writes main's whole tree with no
 // base_tree, so a sidecar placed beside state.json disappears on the next
@@ -48,7 +50,7 @@
 // Node stdlib only.
 
 import { createHash } from 'node:crypto';
-import { readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
+import { lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
 import { createServer } from 'node:net';
 import { dirname, join, resolve } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -91,17 +93,23 @@ export async function takeSeat({ port = DEFAULT_SEAT_PORT, wait = 0, onBusy }) {
   }
 }
 
-/** A ref write asked for and not yet answered: `{ parent, commit }`, or null. Unreadable counts as open. */
-const readIntent = (file) => {
+/**
+ * Ref writes asked for and not yet answered, each `{ parent, commit }`: a
+ * non-force write from `parent` can land only while the branch is AT `parent`.
+ * Unreadable counts as one that may land on any head.
+ */
+const readIntents = (file) => {
+  let v;
   try {
-    return JSON.parse(readFileSync(file, 'utf8'));
+    v = JSON.parse(readFileSync(file, 'utf8'));
   } catch (err) {
-    if (err?.code === 'ENOENT') return null;
-    return { parent: undefined, commit: undefined };
+    return err?.code === 'ENOENT' ? [] : [{ unknown: true }];
   }
+  return (Array.isArray(v) ? v : [v]).map((e) => (typeof e?.commit === 'string' && (e.parent === null || typeof e.parent === 'string') ? { parent: e.parent, commit: e.commit } : { unknown: true }));
 };
-const writeIntent = (file, intent) => {
-  writeFileSync(`${file}.tmp`, `${JSON.stringify(intent)}\n`);
+const writeIntents = (file, list) => {
+  if (!list.length) return rmSync(file, { force: true });
+  writeFileSync(`${file}.tmp`, `${JSON.stringify(list)}\n`);
   renameSync(`${file}.tmp`, file);
 };
 
@@ -153,19 +161,27 @@ export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX
 
   async function attempts() {
     let lastConflict = null;
+    let guarded = false;
     for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
       let ref;
       let commitSha;
+      let open = [];
       try {
         ref = await transport.getRef(branch);
-        // An earlier ref write asked for and never answered may still land —
-        // unless the branch already shows it did, this write moves the ref
-        // (even for unchanged content), after which that one never can.
-        const unanswered = intent ? readIntent(intent) : null;
-        const mustMove = Boolean(unanswered) && ref?.sha !== unanswered.commit;
-        if (unanswered && !mustMove) rmSync(intent, { force: true });
+        const head = ref?.sha ?? null;
+        // An earlier write asked for and never answered can still land while
+        // the branch is at its parent (and has not already landed). Only an
+        // OBSERVED head elsewhere, or this run's own accepted write, retires
+        // one; a refused write never does. While one is open this write moves
+        // the ref (a commit even for unchanged content), after which it cannot.
+        if (intent) {
+          const all = readIntents(intent);
+          open = all.filter((e) => e.unknown || (e.parent === head && e.commit !== head));
+          if (open.length !== all.length) writeIntents(intent, open);
+        }
+        guarded = open.length > 0;
 
-        if (ref && !mustMove) {
+        if (ref && !guarded) {
           const current = await transport.getFile(ref.sha, path);
           if (current && current.text === indexText) return { status: 'unchanged', commit: ref.sha };
         }
@@ -190,20 +206,26 @@ export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX
         // every other publisher waits for this one's seat.
         await confirmed();
         // Recorded BEFORE it is asked for: if no answer comes, the next publisher knows.
-        if (intent) writeIntent(intent, { parent: ref?.sha ?? null, commit: commitSha });
+        if (intent) writeIntents(intent, [...open, { parent: head, commit: commitSha }]);
       } catch (err) {
-        throw nothingPublished(err);
+        // Nothing of THIS run was asked for; an earlier unanswered write still may land.
+        throw guarded ? err : nothingPublished(err);
       }
 
-      // A conflict answer is GitHub refusing the write; a throw here is unknown (the intent stays).
+      // A conflict answer is GitHub refusing THIS write; a throw here is unknown (the intent stays).
       const outcome = ref
         ? await transport.updateRef(branch, commitSha, ref.sha)
         : await transport.createRef(branch, commitSha);
-      if (intent) rmSync(intent, { force: true });
-      if (outcome === 'ok') return { status: ref ? 'published' : 'created', commit: commitSha };
+      if (outcome === 'ok') {
+        // The branch is at a commit no earlier write had as its parent: none of them can land now.
+        if (intent) rmSync(intent, { force: true });
+        return { status: ref ? 'published' : 'created', commit: commitSha };
+      }
       lastConflict = outcome;
     }
-    throw nothingPublished(new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`));
+    const e = new Error(`Another publisher updated the index while this one was writing (${lastConflict}); nothing was overwritten.`);
+    // Every write of this run was refused — but one asked for earlier may still land: unknown, never "nothing".
+    throw guarded ? e : nothingPublished(e);
   }
 }
 
@@ -218,33 +240,54 @@ function nothingPublished(err) {
   return e;
 }
 
-/** The archive's maintenance lock: ONE file in the archive root, which the scanner skips (a dotfile). */
+/**
+ * The archive's maintenance lock: ONE folder in the archive root (the scanner
+ * skips dotfiles) holding exactly one record, `<token>.json`. A run builds the
+ * folder privately and renames it into place, which fails while a lock stands,
+ * so a record is never partial; a record is removed only by its own unique
+ * name, so no remover can ever take a NEWER run's lock.
+ */
 export const ARCHIVE_LOCK = '.setar-maintenance.lock';
 
+const digestOf = (bytes) => createHash('sha256').update(bytes).digest('hex');
+
 /**
- * The lock as it stands: null (absent), its record, or `{ unreadable }` with
- * the digest of bytes that are not a complete record in this tool's form —
- * never guessed into one. A record is written whole before it is linked into
- * place, so a partial one is never this tool's.
+ * The lock as it stands: null (absent, or an empty folder a release left), its
+ * record `{ token, pid, host, since, digest, names }`, or `{ unreadable }` with
+ * a digest of what is there when it is not exactly one record in this tool's
+ * form — never guessed into one. `names` are the entries a release removes;
+ * null for something at the lock's name that is not a folder.
  */
 export function readArchiveLock(root) {
-  let bytes;
+  const p = join(root, ARCHIVE_LOCK);
+  let st;
   try {
-    bytes = readFileSync(join(root, ARCHIVE_LOCK));
+    st = lstatSync(p);
   } catch (err) {
     if (err?.code === 'ENOENT') return null;
     throw err;
   }
-  const digest = createHash('sha256').update(bytes).digest('hex');
-  try {
-    const r = JSON.parse(bytes.toString('utf8'));
-    if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
-      return { ...r, digest };
+  if (!st.isDirectory()) {
+    return { unreadable: true, names: null, digest: digestOf(st.isFile() ? readFileSync(p) : st.isSymbolicLink() ? `link:${readlinkSync(p)}` : `${st.mode}`) };
+  }
+  const names = readdirSync(p).sort();
+  if (!names.length) return null;
+  const parts = names.map((n) => {
+    const e = lstatSync(join(p, n));
+    return [n, e.isFile() ? readFileSync(join(p, n)) : null];
+  });
+  const digest = digestOf(JSON.stringify(parts.map(([n, b]) => [n, b ? digestOf(b) : 'not a file'])));
+  if (parts.length === 1 && parts[0][1]) {
+    try {
+      const r = JSON.parse(parts[0][1].toString('utf8'));
+      if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && names[0] === `${r.token}.json` && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
+        return { ...r, digest, names };
+      }
+    } catch {
+      // not a record: said as unreadable below
     }
-  } catch {
-    // not a record: said as unreadable below
   }
-  return { unreadable: true, digest };
+  return { unreadable: true, digest, names };
 }
 
 /**
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index bc52b9fd07181c4e3a15bdd65c3e973d96822bc2..f1259d784f3b8bd32c54116fcfb61588ead96f7f 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -27,7 +27,7 @@
 
 import { createHash, randomUUID } from 'node:crypto';
 import { spawnSync } from 'node:child_process';
-import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
+import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
 import { hostname } from 'node:os';
 import { basename, dirname, join, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -53,6 +53,8 @@ import { ARCHIVE_LOCK, readArchiveLock } from './publish-setar-index.mjs';
 const REGISTRY = 'PIECES.csv';
 const LOG = 'RENAME-LOG.csv';
 const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
+/** The test seams' default: `at(point, name)` is called just before each archive write. */
+const noSeam = () => {};
 
 /** A refusal: nothing was changed. */
 export class Refusal extends Error {}
@@ -192,6 +194,7 @@ export function planMaintenance(rootArg, action) {
       }
     }
     if (from === to) throw new Refusal('The old and new names are the same.');
+    if (from.split('/')[0] !== to.split('/')[0]) throw new Refusal('A rename stays inside its session folder (both names in the same session-N-DD-MM-YYYY folder).');
     const parsed = parseAssetStem(stemOf(to));
     if (!parsed) throw new Refusal(`"${to}" carries no known role; name it <role>-<piece>.<ext>.`);
     if (parsed.piece && !byKey.has(parsed.piece)) {
@@ -295,8 +298,9 @@ function journalFor(state, root, recovering) {
 // ONE lock per ARCHIVE (`ARCHIVE_LOCK` in its root, which the scanner skips),
 // never per --state folder: every route that writes the archive takes it, and
 // every publisher checks it before its ref write (`archiveConfirmation`), the
-// scheduled job included. A record is written whole and LINKED into place, so
-// it is never partial. A lock is never adopted on a guess about a process
+// scheduled job included. A record is written whole in a private folder that
+// is RENAMED into place, so it is never partial, and removed only by its own
+// unique name, so no release ever takes a newer run's lock. A lock is never adopted on a guess about a process
 // (a pid can be reused, a publishing child outlives its parent): a run that
 // finds one refuses, and the operator — having seen no maintenance or
 // publication process is running, the indexer's sudo'd job included —
@@ -314,22 +318,28 @@ function lockRefusal(root) {
   );
 }
 
-/** Take the archive's lock, or refuse. Returns the token that proves ownership. */
+/**
+ * Take the archive's lock, or refuse. The record is written whole in a private
+ * folder that is then RENAMED into place — which fails while any lock stands,
+ * and replaces only the empty folder a release leaves. Returns the token that
+ * proves ownership. A run that stopped mid-write left a file under one of this
+ * tool's private names: it is never recovered from automatically (a name proves
+ * nothing about whose file it is); the run refuses and names it.
+ */
 function lock(root) {
   const token = randomUUID();
   const tmp = join(root, `${ARCHIVE_LOCK}.${token}`);
-  writeFileSync(tmp, `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
+  mkdirSync(tmp);
   try {
-    linkSync(tmp, join(root, ARCHIVE_LOCK));
+    writeFileSync(join(tmp, `${token}.json`), `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
+    renameSync(tmp, join(root, ARCHIVE_LOCK));
   } catch (err) {
-    if (err?.code === 'EEXIST') throw lockRefusal(root);
+    rmSync(tmp, { recursive: true, force: true }); // this run's own private folder
+    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal(root);
     throw err;
-  } finally {
-    rmSync(tmp, { force: true });
   }
   try {
-    recoverCaptures(root);
-    recoverDrops(root);
+    refuseLeftovers(root);
   } catch (err) {
     unlock(root, token);
     throw err;
@@ -339,40 +349,37 @@ function lock(root) {
 
 /** Every archive write first proves this run still holds the lock (an operator may have released it). */
 function assertOwner(root, owner) {
-  if (readArchiveLock(root)?.token !== owner) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
+  if (!lstatOrNull(join(root, ARCHIVE_LOCK, `${owner}.json`))?.isFile()) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
 }
 
-/**
- * Remove the lock only while it is the one judged: it is MOVED aside first
- * (atomic), then judged; anything else is put back, never over a newer lock.
- */
-function removeLockIf(root, judge) {
-  const aside = capture(root, ARCHIVE_LOCK);
-  if (!aside) return false;
-  let record = null;
+/** Remove the lock's folder once empty — never one holding anyone's record. */
+function dropEmptyLock(root) {
   try {
-    const bytes = readFileSync(aside);
-    record = { digest: sha(bytes), token: (() => { try { return JSON.parse(bytes.toString('utf8'))?.token; } catch { return undefined; } })() };
+    rmdirSync(join(root, ARCHIVE_LOCK));
   } catch {
-    // unreadable: judged as no record
+    // not empty (a newer run holds it), already gone, or not a folder: left as it is
   }
-  if (!record || !judge(record)) {
-    putBack(root, ARCHIVE_LOCK, aside);
-    return false;
+}
+
+/** Release THIS run's lock: only its own record, by its unique name; a newer run's is never touched. */
+function unlock(root, token) {
+  try {
+    unlinkSync(join(root, ARCHIVE_LOCK, `${token}.json`));
+  } catch (err) {
+    if (err?.code === 'ENOENT') return; // released by hand already
+    throw err;
   }
-  rmSync(aside);
-  return true;
+  dropEmptyLock(root);
 }
-const unlock = (root, token) => {
-  if (readArchiveLock(root)?.token === token) removeLockIf(root, (r) => r.token === token);
-};
 
 /**
  * The operator's explicit route for a lock no run will take: shown first, then
- * released only by its exact record (a digest prefix of its bytes), whatever
- * form it is in — a dead run's, a partial or foreign one.
+ * released only by its exact record (a digest prefix of what is there), whatever
+ * form it is in — a dead run's, a partial or foreign one. Only the entries that
+ * record named are removed, each by its own name, so a lock taken since is never
+ * touched. `at` is the test seam.
  */
-export function releaseLock({ root: rootArg, record }) {
+export function releaseLock({ root: rootArg, record, at = noSeam }) {
   const root = resolve(rootArg);
   const held = readArchiveLock(root);
   if (!held) return { released: false, lines: ['The archive holds no maintenance lock. Nothing to do.'] };
@@ -387,19 +394,57 @@ export function releaseLock({ root: rootArg, record }) {
       ],
     };
   }
-  if (record !== id || !removeLockIf(root, (r) => r.digest === held.digest)) {
-    throw new Refusal('The lock is not the record you saw (it changed or was released since); nothing was changed. Run release-lock again to see it.');
+  const stale = () => new Refusal('The lock is not the record you saw (it changed or was released since); nothing was changed. Run release-lock again to see it.');
+  if (record !== id) throw stale();
+  at('release', ARCHIVE_LOCK);
+  let removed = 0;
+  // Something at the lock's name that is not a folder is never this version's lock: unlink removes only it.
+  for (const p of held.names ? held.names.map((n) => join(root, ARCHIVE_LOCK, n)) : [join(root, ARCHIVE_LOCK)]) {
+    try {
+      unlinkSync(p);
+      removed += 1;
+    } catch (err) {
+      if (err?.code !== 'ENOENT') throw err;
+    }
   }
+  dropEmptyLock(root);
+  if (!removed) throw stale();
   return { released: true, lines: [`Released the lock of ${holderLine(held)}. The next run says what, if anything, it left to finish.`] };
 }
 
+/**
+ * A run stopped in the middle of a write leaves a file under one of this
+ * tool's private names: a declaration set aside (`.<name>.captured-…`, root)
+ * or a media name being dropped (`.<leaf>.dropping-…`, a session folder).
+ * Nothing guesses whose it is. The run refuses, naming each, and the operator
+ * renames it back — never over anything — before running again; the journal's
+ * own exact judgement (`rollback`) then finishes.
+ */
+function refuseLeftovers(root) {
+  const found = [];
+  for (const d of readdirSync(root, { withFileTypes: true })) {
+    if (d.isFile() || d.isSymbolicLink()) {
+      const m = /^\.(PIECES\.csv|RENAME-LOG\.csv)\.captured-/.exec(d.name);
+      if (m) found.push(`  mv -n '${d.name}' '${m[1]}'   (if ${m[1]} is there, it is the copy a write replaced: mv -n '${d.name}' '${d.name.replace('.captured-', '.superseded-')}')`);
+    } else if (d.isDirectory() && parseSessionFolderName(d.name)) {
+      for (const f of readdirSync(join(root, d.name))) {
+        const m = /^\.(.+)\.dropping-/.exec(f);
+        if (m) found.push(`  mv -n '${d.name}/${f}' '${d.name}/${m[1]}'   (if that name is taken, keep both and compare them)`);
+      }
+    }
+  }
+  if (found.length) {
+    throw new Refusal(`A run stopped in the middle of a write and left a file under a private name; nothing was changed. Put each back by hand, never over anything, then run again:\n${found.join('\n')}`);
+  }
+}
+
 // --- writing the archive, exactly --------------------------------------------
 
-/** Move whatever is at `name` aside — atomic: exactly what was there at that instant — or null when nothing was. */
-function capture(root, name, owner = randomUUID()) {
-  const aside = join(root, `.${name}.captured-${owner}`);
+/** Move whatever is at `name` aside — atomic: exactly what was there at that instant — or null when nothing was. A fresh name every time. */
+function capture(dir, name) {
+  const aside = join(dir, `.${name}.captured-${randomUUID()}`);
   try {
-    renameSync(join(root, name), aside);
+    renameSync(join(dir, name), aside);
     return aside;
   } catch (err) {
     if (err?.code === 'ENOENT') return null;
@@ -408,11 +453,11 @@ function capture(root, name, owner = randomUUID()) {
 }
 
 /** Put a captured file back, never over anything that appeared meanwhile — then both are kept, and said. */
-function putBack(root, name, aside) {
+function putBack(dir, name, aside) {
   const st = lstatSync(aside);
   try {
-    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), join(root, name));
-    else if (st.isFile()) linkSync(aside, join(root, name));
+    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), join(dir, name));
+    else if (st.isFile()) linkSync(aside, join(dir, name));
     else throw new Refusal(`${name} was replaced by something that is not a file while this ran; it is kept as ${basename(aside)}. Put it back by hand.`);
   } catch (err) {
     if (err?.code === 'EEXIST') throw new Refusal(`${name} was replaced while this ran; the new one stands, and the one before is kept beside it as ${basename(aside)}.`);
@@ -421,46 +466,12 @@ function putBack(root, name, aside) {
   rmSync(aside);
 }
 
-/**
- * A run that stopped between moving a declaration aside and putting one in its
- * place left it missing: put back THIS tool's own capture, never a guess. A
- * capture beside a present declaration is what that run replaced (or what a
- * hand edit displaced): renamed `superseded`, kept, never a candidate again.
- * Runs under the lock, before anything else.
- */
-function recoverCaptures(root) {
-  for (const name of [REGISTRY, LOG]) {
-    const caps = readdirSync(root).filter((f) => f.startsWith(`.${name}.captured-`));
-    if (!caps.length) continue;
-    if (lstatOrNull(join(root, name))) {
-      for (const c of caps) renameSync(join(root, c), join(root, c.replace('.captured-', '.superseded-')));
-      continue;
-    }
-    if (caps.length > 1) throw new Refusal(`${name} is missing, and ${caps.length} copies set aside by interrupted runs exist (${caps.join(', ')}); nothing was changed. Put the right one back by hand.`);
-    putBack(root, name, join(root, caps[0]));
-  }
-}
-
-/**
- * A run stopped inside `dropName` left a media name on its private aside. A
- * second name of a file still named elsewhere is dropped (the bytes stay
- * there: the drop it was making). The ONLY name of a file — someone else's,
- * renamed onto the public name in that instant — is put back at that name,
- * never over a newer one; if it is taken, it is kept and named. Under the lock.
- */
-function recoverDrops(root) {
-  for (const d of readdirSync(root, { withFileTypes: true })) {
-    if (!d.isDirectory()) continue;
-    for (const f of readdirSync(join(root, d.name))) {
-      const m = /^\.(.+)\.dropping-[0-9a-f-]{36}$/.exec(f);
-      if (!m) continue;
-      const aside = join(root, d.name, f);
-      const st = lstatSync(aside);
-      if (st.isFile() && st.nlink > 1) rmSync(aside);
-      else putBack(join(root, d.name), m[1], aside);
-    }
-  }
-}
+/** A replaced declaration is KEPT, never unlinked, under a name no other write uses. */
+const keep = (aside) => {
+  const kept = aside.replace('.captured-', '.superseded-');
+  renameSync(aside, kept);
+  return kept;
+};
 
 /**
  * Replace a declaration (or, with `text` null, take it out of the archive) only
@@ -468,12 +479,14 @@ function recoverDrops(root) {
  * THE WRITE: the file is first moved aside (what was there at that instant;
  * a later save makes a new file), its bytes judged, and the new one LINKED into
  * place, which never overwrites. Replaced, deleted, created or a link: put
- * back and refused, nothing anyone wrote lost. `at` is the test seam.
+ * back and refused, nothing anyone wrote lost. The instant the archive changes
+ * it is recorded in `written`, so a later failure is judged, never skipped.
+ * `at` is the test seam.
  */
-function replaceDeclaration({ root, owner, at }, name, text, expected, keepDir) {
+function replaceDeclaration({ root, owner, at, written }, name, text, expected, keepDir) {
   assertOwner(root, owner);
   const p = join(root, name);
-  const tmp = text === null ? null : join(root, `.${name}.maintenance-${owner}`);
+  const tmp = text === null ? null : join(root, `.${name}.maintenance-${randomUUID()}`);
   if (tmp) writeFileSync(tmp, text, { flag: 'wx' });
   try {
     at('capture', name);
@@ -485,9 +498,10 @@ function replaceDeclaration({ root, owner, at }, name, text, expected, keepDir)
         if (err?.code === 'EEXIST') throw new Refusal(`${name} appeared while this ran; it was left as the other edit made it.`);
         throw err;
       }
+      written?.add(name);
       return;
     }
-    const aside = capture(root, name, owner);
+    const aside = capture(root, name);
     if (!aside) throw new Refusal(`${name} was removed while this ran; nothing was put in its place.`);
     const st = lstatSync(aside);
     if (!st.isFile() || sha(readFileSync(aside)) !== expected) {
@@ -497,73 +511,106 @@ function replaceDeclaration({ root, owner, at }, name, text, expected, keepDir)
     at('install', name);
     try {
       if (tmp) linkSync(tmp, p);
-      else copyFileSync(aside, join(keepDir, `${name}.written-${owner}`), constants.COPYFILE_EXCL);
+      else copyFileSync(aside, join(keepDir, `${name}.written-${randomUUID()}`), constants.COPYFILE_EXCL);
     } catch (err) {
       if (tmp && err?.code === 'EEXIST') {
-        throw new Refusal(`${name} was written by someone else while this ran; theirs stands, and the one it replaced is kept beside it as ${basename(aside)}.`);
+        throw new Refusal(`${name} was written by someone else while this ran; theirs stands, and the one it replaced is kept beside it as ${basename(keep(aside))}.`);
       }
       putBack(root, name, aside);
       throw err;
     }
+    written?.add(name);
+    at('keep', name);
     // The replaced file is KEPT, never unlinked: a program still holding it
     // open writes into this inode whenever it writes, so nothing it saves is
     // ever lost — it lands in the kept copy, beside the declaration.
-    renameSync(aside, aside.replace('.captured-', '.superseded-'));
+    keep(aside);
   } finally {
     if (tmp) rmSync(tmp, { force: true });
   }
 }
 
 /**
- * Give one media file a new name, never overwriting and never moving bytes
- * other than the recorded ones: the new name is LINKED (fails if anything is
- * there), what it names is judged (same file, recorded size and SHA-256, both
- * folders still real), and only then is the old name removed. A judged
- * failure removes only the name this call made; nothing has moved.
+ * Run `fn(stillBound)` INSIDE one session folder, bound by its inode: it must
+ * be a real folder directly in the archive at the instant this starts (never a
+ * link), and every name `fn` touches is a bare leaf resolved against that
+ * bound folder — never the folder's path again, so swapping the folder for a
+ * link cannot carry a write outside. `stillBound()` says whether the folder
+ * still stands at its name; `fn` asks before each step that commits anything.
  */
-function moveExact({ root, owner, at }, fromRel, toRel, expect) {
-  assertOwner(root, owner);
-  const from = mediaPath(root, fromRel);
-  const to = mediaPath(root, toRel);
-  if (!lstatOrNull(from)?.isFile()) throw new Refusal(`"${fromRel}" is not a regular file in the archive any more; nothing was moved.`);
-  at('link', toRel);
+// ponytail: process-wide cwd, the only stdlib way to resolve names against a
+// bound directory (Node has no linkat/openat); the tool is single-threaded.
+function inFolder(root, folder, fn) {
+  const st = lstatOrNull(join(root, folder));
+  if (!st?.isDirectory()) throw new Refusal(`The folder "${folder}" is not a real folder in the archive (a link is never followed); nothing was moved.`);
+  const back = process.cwd();
+  process.chdir(join(root, folder));
   try {
-    linkSync(from, to);
-  } catch (err) {
-    if (err?.code === 'EEXIST') throw new Refusal(`"${toRel}" appeared while this ran; nothing is ever overwritten, and nothing was moved.`);
-    if (err?.code === 'ENOENT') throw new Refusal(`"${fromRel}" went away while this ran; nothing was moved.`);
-    throw err;
-  }
-  const a = lstatOrNull(from);
-  const b = lstatOrNull(to);
-  const realFolders = [fromRel, toRel].every((rel) => lstatOrNull(join(root, rel.split('/')[0]))?.isDirectory());
-  const bytes = same(a, b) && b.isFile() ? readFileSync(to) : null;
-  if (!realFolders || !bytes || bytes.length !== expect.size || sha(bytes) !== expect.sha256) {
-    if (same(a, b)) dropName(to, a, at);
-    throw new Refusal(`"${fromRel}" does not hold the bytes this change recorded (it changed since the preview, or its folder moved); nothing was moved.`);
+    if (!same(statSync('.'), st)) throw new Refusal(`The folder "${folder}" changed while this ran; nothing was moved.`);
+    return fn(() => same(lstatOrNull(join(root, folder)), st));
+  } finally {
+    process.chdir(back);
   }
-  at('unlink', fromRel);
-  if (!dropName(from, b, at)) throw new Refusal(`"${fromRel}" was replaced while this ran; both files are kept, the moved one as "${toRel}".`);
 }
 
 /**
- * Remove the name `path` only while it names the file `inode` (an lstat) —
- * judged on a PRIVATE name it was first moved to (atomic: whatever held the
- * name at that instant), so no file renamed onto `path` meanwhile can lose its
- * name. Anything else is put back, never over a newer file. Returns whether
- * the name was removed; the bytes always stay under their other name.
+ * Give one media file a new name in its folder, never overwriting and never
+ * moving bytes other than the recorded ones: the new name is LINKED (fails if
+ * anything is there), what it names is judged (same file, recorded size and
+ * SHA-256, the folder still at its name), and only then is the old name
+ * removed. A judged failure removes only the name this call made — inside the
+ * bound folder, wherever it now is; nothing has moved.
  */
-function dropName(path, inode, at) {
-  const aside = join(dirname(path), `.${basename(path)}.dropping-${randomUUID()}`);
+function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
+  assertOwner(root, owner);
+  const [from, to] = [fromRel, toRel].map((rel) => rel.split('/')[1]);
+  inFolder(root, fromRel.split('/')[0], (stillBound) => {
+    if (!lstatOrNull(from)?.isFile()) throw new Refusal(`"${fromRel}" is not a regular file in the archive any more; nothing was moved.`);
+    at('link', toRel);
+    try {
+      linkSync(from, to);
+    } catch (err) {
+      if (err?.code === 'EEXIST') throw new Refusal(`"${toRel}" appeared while this ran; nothing is ever overwritten, and nothing was moved.`);
+      if (err?.code === 'ENOENT') throw new Refusal(`"${fromRel}" went away while this ran; nothing was moved.`);
+      throw err;
+    }
+    written?.add('rename');
+    const a = lstatOrNull(from);
+    const b = lstatOrNull(to);
+    const bound = stillBound();
+    const bytes = bound && same(a, b) && b.isFile() ? readFileSync(to) : null;
+    if (!bytes || bytes.length !== expect.size || sha(bytes) !== expect.sha256) {
+      if (same(a, b)) dropName(to, a, at, join(root, toRel));
+      throw new Refusal(
+        bound
+          ? `"${fromRel}" does not hold the bytes this change recorded (it changed since the preview); nothing was moved.`
+          : `The folder of "${fromRel}" was moved or replaced while this ran; the name this run made there was removed again, and nothing outside it was touched.`,
+      );
+    }
+    at('unlink', fromRel);
+    if (!dropName(from, b, at, join(root, fromRel))) throw new Refusal(`"${fromRel}" was replaced while this ran; both files are kept, the moved one as "${toRel}".`);
+  });
+}
+
+/**
+ * Remove the leaf name `name` (inside a bound folder) only while it names the
+ * file `inode` (an lstat) — judged on a PRIVATE name it was first moved to
+ * (atomic: whatever held the name at that instant), so no file renamed onto it
+ * meanwhile can lose its name. Anything else is put back, never over a newer
+ * file. Returns whether the name was removed; the bytes always stay under
+ * their other name. `label` is what the test seam is told.
+ */
+function dropName(name, inode, at, label) {
+  const aside = `.${name}.dropping-${randomUUID()}`;
   try {
-    renameSync(path, aside);
+    renameSync(name, aside);
   } catch (err) {
     if (err?.code === 'ENOENT') return false;
     throw err;
   }
-  at('judge-drop', path);
+  at('judge-drop', label);
   if (!same(lstatSync(aside), inode)) {
-    putBack(dirname(path), basename(path), aside);
+    putBack('.', name, aside);
     return false;
   }
   rmSync(aside);
@@ -649,7 +696,6 @@ async function publishStep(state, base, scanned, publish, token) {
 
 // --- applying ---------------------------------------------------------------
 
-const noSeam = () => {};
 
 /**
  * Apply a previewed action. `previewId` must be the id the preview printed
@@ -662,7 +708,8 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
   const root = resolve(rootArg);
   const state = stateDir(root, stateArg);
   const token = lock(root);
-  const ctx = { root, owner: token, at };
+  // What THIS run has changed in the archive, recorded at the instant of each change: its automatic put-back judges only those.
+  const ctx = { root, owner: token, at, written: new Set() };
   let interrupted = false;
   try {
     const prior = journalFor(state, root);
@@ -704,31 +751,26 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
 
     // 2. The edit, each write proved against what the plan saw. Any failure is put back, automatically.
     let scanned;
-    // What THIS run has written so far: its automatic put-back judges only those.
-    const written = new Set();
     try {
       if (plan.registry) replaceDeclaration(ctx, REGISTRY, plan.registry.after, digest(plan.registry.before));
-      if (plan.registry) written.add(REGISTRY);
       step('registry');
       if (plan.log) replaceDeclaration(ctx, LOG, plan.log.after, digest(plan.log.before));
-      if (plan.log) written.add(LOG);
       step('log');
-      // A refused move has moved nothing (or kept both files, said so); only a finished one is ours to undo.
       if (plan.rename) moveExact(ctx, plan.rename.from, plan.rename.to, plan.rename);
-      if (plan.rename) written.add('rename');
       step('rename');
+      at('scan', 'archive');
       scanned = validateAndScan(root, state, action);
     } catch (err) {
       if (err instanceof Interrupted) throw err;
       try {
-        restore(ctx, journal, undefined, written);
+        restore({ ...ctx, written: null }, journal, undefined, ctx.written);
       } catch (why) {
         // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
         throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
       }
       // This run published nothing, and the archive is as it was before it.
       writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed', unresolved: [] });
-      throw new Refusal(`The change did not validate (${err.message}); everything was put back from the private copy.`);
+      throw new Refusal(`The change did not validate (${err.message}); ${ctx.written.size ? 'everything it changed was put back from the private copy' : 'it had changed nothing in the archive'}.`);
     }
     // 3. Publication, through the existing job.
     return { ...(await publishStep(state, { ...journal, status: 'applied', unresolved: [] }, scanned, publish, token)), lines: plan.lines };
@@ -780,12 +822,17 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
     if (!fromSt && toSt?.isFile()) {
       if (!holds(r.to)) throw new Refusal(`"${r.to}" no longer holds the renamed bytes; it is left as it is.`);
       steps.unshift(() => moveExact(ctx, r.to, r.from, r));
-    } else if (same(fromSt, toSt) && toSt.isFile() && holds(r.to)) {
-      // A move stopped between its two names: the new name is the one to drop.
+    } else if (same(fromSt, toSt) && toSt.isFile()) {
+      // A move stopped between its two names: the new name is the one to drop — the bytes stay at the old one, whatever they are.
       steps.unshift(() => {
         assertOwner(root, ctx.owner);
-        const kept = lstatOrNull(mediaPath(root, r.from));
-        if (same(kept, lstatOrNull(mediaPath(root, r.to)))) dropName(mediaPath(root, r.to), kept, ctx.at);
+        const [from, to] = [r.from, r.to].map((rel) => rel.split('/')[1]);
+        inFolder(root, r.from.split('/')[0], (stillBound) => {
+          const kept = lstatOrNull(from);
+          if (!stillBound() || !same(kept, lstatOrNull(to)) || !dropName(to, kept, ctx.at, join(root, r.to))) {
+            throw new Refusal(`"${r.to}" changed while this ran; it is left as it is, and nothing was put back there.`);
+          }
+        });
       });
     } else if (!(fromSt?.isFile() && !toSt)) {
       throw new Refusal(`"${r.from}" and "${r.to}" are neither as this change left them nor as they were; they are left as they are.`);
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index 5057dad03292a62ba8db2a2e7c209e77e6e0a87c..a7b7dc1fca5c9a1915ce294822dd180faa3895a3 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -1,6 +1,6 @@
 import { execFile } from 'node:child_process';
 import { createHash } from 'node:crypto';
-import { closeSync, existsSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
+import { closeSync, existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
 import { tmpdir } from 'node:os';
 import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
@@ -10,7 +10,7 @@ import { applyMaintenance, Interrupted, planMaintenance, releaseLock, retryMaint
 // @ts-expect-error — see above.
 import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
 // @ts-expect-error — see above.
-import { archiveConfirmation, ARCHIVE_LOCK, DEFAULT_SEAT_PORT, makeGitHubIndexTransport, publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
+import { archiveConfirmation, ARCHIVE_LOCK, DEFAULT_SEAT_PORT, makeGitHubIndexTransport, publishIndex, readArchiveLock, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
 import { followRenames } from '../src/domain/sourceReconcile';
 import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
 import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };
@@ -62,6 +62,7 @@ function fakeGit(root: string) {
   const commits = new Map<string, Record<string, string>>([['c-main', { 'state.json': 'practice data' }]]);
   let n = 0;
   let failing = false;
+  let refusing = 0;
   let requests = 0;
   const transport = {
     getRef: async (b: string) => ((requests += 1), refs.has(b) ? { sha: refs.get(b)! } : null),
@@ -78,7 +79,8 @@ function fakeGit(root: string) {
       commits.set(s, JSON.parse(treeSha));
       return s;
     },
-    updateRef: async (b: string, s: string, e: string) => (refs.get(b) === e ? (refs.set(b, s), 'ok') : 'HTTP 422'),
+    // GitHub may answer 422 WITHOUT the ref having moved (validation, endpoint spam): `refuse(n)` models that.
+    updateRef: async (b: string, s: string, e: string) => (refusing > 0 ? ((refusing -= 1), 'HTTP 422') : refs.get(b) === e ? (refs.set(b, s), 'ok') : 'HTTP 422'),
     createRef: async (b: string, s: string) => (refs.has(b) ? 'HTTP 422' : (refs.set(b, s), 'ok')),
   };
   const calls: string[] = [];
@@ -97,6 +99,7 @@ function fakeGit(root: string) {
     commits: () => n,
     main: () => [refs.get('main'), commits.get('c-main')],
     fail: (on: boolean) => (failing = on),
+    refuse: (n: number) => (refusing = n),
     calls,
   };
 }
@@ -172,6 +175,8 @@ describe('maintaining the Setar archive', () => {
         [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S40}/video.mp4` }, /no known role/],
         [{ kind: 'rename', from: `${S41}/نمونه-${NEW_PIECE}.mp4`, to: `${S41}/نمونه-نامعلوم.mp4` }, /not registered/],
         [{ kind: 'rename', from: `${S40}/missing.mp4`, to: `${S40}/نمونه-2.mp4` }, /not in the archive/],
+        // A move stays in one folder: every write is then made inside that ONE bound folder.
+        [{ kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` }, /stays inside its session folder/],
       ];
       for (const [action, why] of refusals) expect(() => planMaintenance(root, action), JSON.stringify(action)).toThrow(why);
       expect([media(root), declarations(root), git.calls]).toEqual([media0, decl0, []]);
@@ -186,8 +191,7 @@ describe('maintaining the Setar archive', () => {
       renameSync(join(root, S39), outside);
       writeFileSync(join(outside, 'نمونه.mp4'), 'outside bytes');
       symlinkSync(outside, join(root, S39));
-      expect(() => planMaintenance(root, { kind: 'rename', from: `${S39}/نمونه.mp4`, to: `${S40}/نمونه-2.mp4` })).toThrow(/not a real folder/);
-      expect(() => planMaintenance(root, { kind: 'rename', from: `${S40}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` })).toThrow(/not a real folder/);
+      expect(() => planMaintenance(root, { kind: 'rename', from: `${S39}/نمونه.mp4`, to: `${S39}/نمونه-2.mp4` })).toThrow(/not a real folder/);
       expect(readFileSync(join(outside, 'نمونه.mp4'), 'utf8')).toBe('outside bytes');
       rmSync(join(root, S39));
       rmSync(join(outside, 'نمونه.mp4'));
@@ -375,13 +379,13 @@ describe('maintaining the Setar archive', () => {
       const another = { kind: 'register', piece: 'یکی-دیگر' };
       /** Every entry point refuses the dead run's lock and changes nothing; then the operator releases it. */
       const lockedOut = async (phase: string) => {
-        const held = readFileSync(lockFile, 'utf8');
+        const held = readArchiveLock(root)?.digest;
         const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
         const archiveNow = [declarations(root), media(root)];
         for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
           await expect(entry(), phase).rejects.toThrow(/maintenance lock is held by run/);
         }
-        expect([readFileSync(lockFile, 'utf8'), readFileSync(join(state, 'journal.json'), 'utf8'), declarations(root), media(root)], phase).toEqual([held, journalNow, ...archiveNow]);
+        expect([readArchiveLock(root)?.digest, readFileSync(join(state, 'journal.json'), 'utf8'), declarations(root), media(root)], phase).toEqual([held, journalNow, ...archiveNow]);
         release();
       };
       const settled = { decl: declarations(root), media: media(root), index: git.published(), commits: git.commits() };
@@ -417,7 +421,7 @@ describe('maintaining the Setar archive', () => {
       expect(await killed('applyMaintenance', moveArgs(), 'log')).toBe(7);
       release();
       expect(await killed('rollbackMaintenance', {}, 'mark')).toBe(7);
-      expect(journal()).toMatchObject({ status: 'rolling-back', lockToken: JSON.parse(readFileSync(lockFile, 'utf8')).token });
+      expect(journal()).toMatchObject({ status: 'rolling-back', lockToken: readArchiveLock(root).token });
       await lockedOut('rollback mark');
       await expect(apply(another)).rejects.toThrow(/rollback did not finish. Run `rollback`/);
       await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(/rollback did not finish; run `rollback`/);
@@ -459,8 +463,15 @@ describe('maintaining the Setar archive', () => {
         JSON.stringify({ token: deadRun, pid: gone, host: 'h', since: 's' }).slice(0, -12), // truncated
       ];
       const journalNow = readFileSync(join(state, 'journal.json'), 'utf8');
-      for (const record of records) {
-        writeFileSync(lockFile, record);
+      /** A record as an earlier version (a file at the lock's name) or as this one (the lock's folder) would hold it. */
+      const plant = (record: string, asFolder: boolean) => {
+        if (!asFolder) return writeFileSync(lockFile, record);
+        mkdirSync(lockFile);
+        writeFileSync(join(lockFile, `${deadRun}.json`), record);
+      };
+      const planted = (asFolder: boolean) => readFileSync(asFolder ? join(lockFile, `${deadRun}.json`) : lockFile, 'utf8');
+      for (const [record, asFolder] of records.flatMap((r) => [[r, false], [r, true]] as const)) {
+        plant(record, asFolder);
         for (const entry of [() => apply(another), () => retryMaintenance({ root, state, publish: git.publish }), () => rollbackMaintenance({ root, state, publish: git.publish })]) {
           await expect(entry(), record).rejects.toThrow(/maintenance lock is held by a record not in this tool’s form.*release-lock --record/);
         }
@@ -469,14 +480,14 @@ describe('maintaining the Setar archive', () => {
           nothingPublished: true,
           message: expect.stringMatching(/A maintenance run holds the archive; nothing was published/),
         });
-        expect([readFileSync(lockFile, 'utf8'), readFileSync(join(state, 'journal.json'), 'utf8')], record).toEqual([record, journalNow]);
+        expect([planted(asFolder), readFileSync(join(state, 'journal.json'), 'utf8')], record).toEqual([record, journalNow]);
         // A record other than the one shown is never released.
         expect(() => releaseLock({ root, record: '0'.repeat(16) }), record).toThrow(/not the record you saw/);
-        expect(readFileSync(lockFile, 'utf8')).toBe(record);
+        expect(planted(asFolder)).toBe(record);
         release();
       }
       // A COMPLETE record of a dead run is no different: shown, then released by hand, never adopted.
-      writeFileSync(lockFile, JSON.stringify({ token: deadRun, pid: gone, host: 'h', since: 's' }));
+      plant(JSON.stringify({ token: deadRun, pid: gone, host: 'h', since: 's' }), true);
       await expect(retryMaintenance({ root, state, publish: git.publish })).rejects.toThrow(new RegExp(`held by run ${deadRun.slice(0, 8)} \\(pid ${gone}`));
       release();
       expect(await retryMaintenance({ root, state, publish: git.publish })).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
@@ -682,7 +693,7 @@ describe('maintaining the Setar archive', () => {
           const pre = { media: media(k.root), index: k.g.published() };
           const theirs = `theirs,${edit}\n`;
           const out = k.go(action, { at: when(['capture', name, edit === 'replace' ? replaceWith(k.at(name), theirs) : () => rmSync(k.at(name))]) });
-          await expect(out, `${name} ${edit}`).rejects.toThrow(edit === 'replace' ? /changed while this ran; it was left as the other edit made it.*put back/s : /was removed while this ran.*put back/s);
+          await expect(out, `${name} ${edit}`).rejects.toThrow(edit === 'replace' ? /changed while this ran; it was left as the other edit made it.*it had changed nothing in the archive/s : /was removed while this ran.*it had changed nothing in the archive/s);
           expect(edit === 'replace' ? readFileSync(k.at(name), 'utf8') : existsSync(k.at(name)), `${name} ${edit}`).toBe(edit === 'replace' ? theirs : false);
           expect([media(k.root), k.g.published(), k.g.calls, existsSync(k.lock)], `${name} ${edit}`).toEqual([pre.media, pre.index, [], false]);
           expect(k.j(), `${name} ${edit}`).toMatchObject({ status: 'rolled-back', publication: 'not-needed' });
@@ -699,10 +710,10 @@ describe('maintaining the Setar archive', () => {
         const decl = declarations(r.root);
         await expect(r.go(REG, { at: when(['install', 'PIECES.csv', () => writeFileSync(r.at('PIECES.csv'), 'saved meanwhile\n')]) })).rejects.toThrow(/written by someone else while this ran; theirs stands/);
         expect(readFileSync(r.at('PIECES.csv'), 'utf8')).toBe('saved meanwhile\n');
-        const kept = hidden(r.root, '.PIECES.csv.captured-');
-        expect(kept.map((f) => readFileSync(r.at(f), 'utf8'))).toEqual([decl.pieces]);
-        // The next run never takes that kept copy for the declaration: it is renamed superseded, kept —
-        // beside the one this run replaced, which is kept too (never unlinked).
+        const kept = hidden(r.root, '.PIECES.csv.superseded-');
+        expect([kept.map((f) => readFileSync(r.at(f), 'utf8')), hidden(r.root, '.PIECES.csv.captured-')]).toEqual([[decl.pieces], []]);
+        // The next run never takes that kept copy for the declaration: it stays kept —
+        // beside the one this run replaces, which is kept too (never unlinked).
         writeFileSync(r.at('PIECES.csv'), decl.pieces);
         expect(await r.go(REG)).toMatchObject({ ok: true, status: 'published' });
         expect([hidden(r.root, '.PIECES.csv.captured-'), hidden(r.root, '.PIECES.csv.superseded-').map((f) => readFileSync(r.at(f), 'utf8'))]).toEqual([[], [decl.pieces, decl.pieces]]);
@@ -844,41 +855,206 @@ describe('maintaining the Setar archive', () => {
         }]) })).rejects.toThrow(/power cut/);
         expect(await v.back({ at: when(['judge-drop', v.at(B), swapIn(v.at(B), 'swapped in at the new name')]) })).toMatchObject({ ok: true });
         expect([sha(readFileSync(v.at(A))), readFileSync(v.at(B), 'utf8')]).toEqual([vBytes, 'swapped in at the new name']);
-        // A run STOPPED at that judgement leaves a name on its private aside: the next run puts back
-        // someone else's file (the only name it has), or drops a second name of ours — at all three sites.
+        // A run STOPPED at that judgement leaves a name on its private aside. Nothing recovers it
+        // automatically (a name proves nothing about whose file it is): every entry point refuses,
+        // naming it, and the operator renames it back — never over anything; then `rollback` judges.
         const cut = () => {
           throw new Interrupted('power cut at the drop');
         };
+        const leftovers = (x: { root: string }) => [
+          ...hidden(x.root, '.PIECES.csv.captured-'),
+          ...hidden(x.root, '.RENAME-LOG.csv.captured-'),
+          ...readdirSync(join(x.root, S39)).filter((n) => n.includes('.dropping-')).map((n) => `${S39}/${n}`),
+        ];
+        /** Every entry point refuses while a private name is left, changing nothing; then the operator renames each back. */
+        const handBack = async (x: ReturnType<typeof box>) => {
+          const left = leftovers(x);
+          expect(left.length).toBeGreaterThan(0);
+          const now = [declarations(x.root), media(x.root), readFileSync(join(x.state, 'journal.json'), 'utf8')];
+          for (const entry of [() => x.back(), () => x.again(), () => x.go({ kind: 'register', piece: 'یکی-دیگر' })]) {
+            await expect(entry()).rejects.toThrow(/stopped in the middle of a write and left a file under a private name; nothing was changed/);
+          }
+          await expect(x.back()).rejects.toThrow(new RegExp(left.map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')));
+          expect([declarations(x.root), media(x.root), readFileSync(join(x.state, 'journal.json'), 'utf8'), existsSync(x.lock)]).toEqual([...now, false]);
+          for (const f of left) {
+            const name = f.replace(/^(.*\/)?\.(.+)\.(captured|dropping)-.*$/, '$1$2');
+            if (existsSync(x.at(name))) renameSync(x.at(f), x.at(f.replace('.captured-', '.superseded-')));
+            else renameSync(x.at(f), x.at(name));
+          }
+          expect(leftovers(x)).toEqual([]);
+        };
+        // Someone else's file renamed onto the old name in that instant — and it has ANOTHER hard
+        // link elsewhere: it is never deleted for being "a second name"; it keeps its public name.
         const g = box();
         const gBytes = sha(readFileSync(g.at(A)));
-        await expect(g.go(MOVE, { at: when(['unlink', A, swapIn(g.at(A), 'theirs at the old name')], ['judge-drop', g.at(A), cut]) })).rejects.toThrow(/power cut/);
+        const alias = join(g.base, 'their-alias.mp4');
+        writeFileSync(alias, 'theirs at the old name');
+        await expect(g.go(MOVE, { at: when(['unlink', A, () => {
+          linkSync(alias, `${g.at(A)}.saved`);
+          renameSync(`${g.at(A)}.saved`, g.at(A));
+        }], ['judge-drop', g.at(A), cut]) })).rejects.toThrow(/power cut/);
+        const theirAside = leftovers(g)[0]!;
+        expect([readFileSync(g.at(theirAside), 'utf8'), lstatSync(g.at(theirAside)).nlink]).toEqual(['theirs at the old name', 2]);
+        await handBack(g);
         await expect(g.back()).rejects.toThrow(/neither as this change left them nor as they were/);
-        expect([readFileSync(g.at(A), 'utf8'), sha(readFileSync(g.at(B)))]).toEqual(['theirs at the old name', gBytes]);
+        expect([readFileSync(g.at(A), 'utf8'), lstatSync(g.at(A)).ino, sha(readFileSync(g.at(B)))]).toEqual(['theirs at the old name', lstatSync(alias).ino, gBytes]);
         const h = box();
         const hBytes = sha(readFileSync(h.at(A)));
         await expect(h.go(MOVE, { at: when(['judge-drop', h.at(A), cut]) })).rejects.toThrow(/power cut/);
+        await handBack(h);
         expect(await h.back()).toMatchObject({ ok: true });
         expect([sha(readFileSync(h.at(A))), existsSync(h.at(B))]).toEqual([hBytes, false]);
         const w = box();
         await expect(w.go(MOVE, { at: when(['link', B, () => writeFileSync(w.at(A), Buffer.alloc(500, 7))], ['judge-drop', w.at(B), cut]) })).rejects.toThrow(/power cut/);
+        await handBack(w);
         expect(await w.back()).toMatchObject({ ok: true });
         expect([sha(readFileSync(w.at(A))), existsSync(w.at(B))]).toEqual([sha(Buffer.alloc(500, 7)), false]);
         const y = box();
         const yBytes = sha(readFileSync(y.at(A)));
         await expect(y.go(MOVE, { at: when(['unlink', A, cut]) })).rejects.toThrow(/power cut/);
         await expect(y.back({ at: when(['judge-drop', y.at(B), cut]) })).rejects.toThrow(/power cut/);
+        await handBack(y);
         expect(await y.back()).toMatchObject({ ok: true });
         expect([sha(readFileSync(y.at(A))), existsSync(y.at(B))]).toEqual([yBytes, false]);
-        for (const x of [f, u, v, g, h, w, y]) expect(readdirSync(join(x.root, S39)).filter((n) => n.includes('.dropping-'))).toEqual([]);
-        // A run stopped with a declaration SET ASIDE: the next run puts back that exact capture first.
+        for (const x of [f, u, v, g, h, w, y]) expect(leftovers(x)).toEqual([]);
+        // A run stopped with a declaration SET ASIDE: refused, named, put back by hand, then rolled back exactly.
         const t = box();
         const tDecl = declarations(t.root);
         await expect(t.go(REG, { at: when(['install', 'PIECES.csv', () => {
           throw new Interrupted('power cut with the registry set aside');
         }]) })).rejects.toThrow(/power cut/);
         expect([existsSync(t.at('PIECES.csv')), hidden(t.root, '.PIECES.csv.captured-').length]).toEqual([false, 1]);
+        const tSet = hidden(t.root, '.PIECES.csv.captured-')[0]!;
+        await expect(t.back()).rejects.toThrow(/stopped in the middle of a write/);
+        renameSync(t.at(tSet), t.at('PIECES.csv'));
         expect(await t.back()).toMatchObject({ ok: true });
-        expect([declarations(t.root), hidden(t.root, '.PIECES.csv.captured-')]).toEqual([tDecl, []]);
+        expect([declarations(t.root), leftovers(t)]).toEqual([tDecl, []]);
+        // A file under a private name that THIS tool never wrote is never taken for the
+        // declaration — not even with the declaration missing: refused, kept, nothing installed.
+        for (const missing of [true, false]) {
+          const n = box();
+          const nDecl = declarations(n.root);
+          if (missing) renameSync(n.at('PIECES.csv'), join(n.base, 'PIECES.csv.away'));
+          writeFileSync(n.at('.PIECES.csv.captured-unrelated'), 'not this tool’s\n');
+          await expect(n.again()).rejects.toThrow(/\.PIECES\.csv\.captured-unrelated/);
+          await expect(n.back()).rejects.toThrow(/\.PIECES\.csv\.captured-unrelated/);
+          expect([existsSync(n.at('PIECES.csv')), readFileSync(n.at('.PIECES.csv.captured-unrelated'), 'utf8')]).toEqual([!missing, 'not this tool’s\n']);
+          if (!missing) expect(declarations(n.root)).toEqual(nDecl);
+        }
+      }
+
+      // --- FAILURES AFTER A WRITE: put back exactly, said only when true, nothing kept is ever lost -
+      {
+        // An I/O error AFTER the new registry is in place (keeping the replaced one fails): the
+        // write is already recorded, so the automatic put-back judges it — never "nothing needed".
+        const k = box();
+        const decl = declarations(k.root);
+        const eio = Object.assign(new Error('EIO: i/o error (injected)'), { code: 'EIO' });
+        await expect(k.go(REG, { at: when(['keep', 'PIECES.csv', () => {
+          throw eio;
+        }]) })).rejects.toThrow(/did not validate \(EIO.*everything it changed was put back from the private copy/s);
+        expect([declarations(k.root), k.j().status, k.g.calls]).toEqual([decl, 'rolled-back', []]);
+        // The registry that write replaced is still under its private name: the next run names it.
+        await expect(k.go(REG)).rejects.toThrow(/\.PIECES\.csv\.captured-/);
+        renameSync(k.at(hidden(k.root, '.PIECES.csv.captured-')[0]!), k.at(hidden(k.root, '.PIECES.csv.captured-')[0]!.replace('.captured-', '.superseded-')));
+        expect(await k.go(REG)).toMatchObject({ ok: true, status: 'published' });
+        // A program holding the ORIGINAL registry open while apply writes AND its automatic
+        // put-back writes again (a scan failure): each replaced file keeps its own name, so the
+        // program's later save is kept — never displaced by the put-back's own kept copy.
+        const o = box();
+        const before = readFileSync(o.at('PIECES.csv'), 'utf8');
+        const fd = openSync(o.at('PIECES.csv'), 'r+');
+        try {
+          await expect(o.go(REG, { at: when(['scan', 'archive', () => {
+            throw new Error('the scan failed (injected)');
+          }]) })).rejects.toThrow(/did not validate \(the scan failed.*everything it changed was put back/s);
+          writeSync(fd, 'saved through the open file\n', Buffer.byteLength(before));
+        } finally {
+          closeSync(fd);
+        }
+        expect([readFileSync(o.at('PIECES.csv'), 'utf8'), o.j().status]).toEqual([before, 'rolled-back']);
+        expect(hidden(o.root, '.PIECES.csv.superseded-').map((f) => readFileSync(o.at(f), 'utf8')).sort()).toEqual(
+          [`${before}saved through the open file\n`, `${before}${NEW_PIECE},,,,,,,41,,\n`].sort(),
+        );
+      }
+
+      // --- A SESSION FOLDER SWAPPED FOR A LINK mid-move: nothing is written outside the archive -
+      {
+        const k = box();
+        const moved = join(k.base, 'moved-39');
+        const decoy = join(k.base, 'decoy');
+        mkdirSync(decoy);
+        writeFileSync(join(decoy, A.split('/')[1]!), 'an unrelated folder');
+        await expect(k.go(MOVE, { at: when(['link', B, () => {
+          renameSync(k.at(S39), moved);
+          symlinkSync(decoy, k.at(S39));
+        }]) })).rejects.toThrow(/moved or replaced while this ran/);
+        // The unrelated folder is exactly as it was; the real folder, wherever it went, holds only what it held.
+        expect(readdirSync(decoy)).toEqual([A.split('/')[1]]);
+        expect(readdirSync(moved).filter((n) => n === B.split('/')[1] || n.includes('.dropping-'))).toEqual([]);
+        expect(existsSync(join(moved, A.split('/')[1]!))).toBe(true);
+        expect(k.j().status).toBe('prepared'); // its put-back refused the link too: `rollback` once the folder is back
+        rmSync(k.at(S39));
+        renameSync(moved, k.at(S39));
+        expect(await k.back()).toMatchObject({ ok: true });
+      }
+
+      // --- RELEASES never take a NEWER run's lock --------------------------
+      {
+        // Two operators release the same dead record; between the first's release and the
+        // second's removal, run C takes the archive (and D tries): C's lock is never moved.
+        const k = box();
+        const dead = ['2f2f2f2f', '0000', '4000', '8000', '000000000000'].join('-');
+        mkdirSync(k.lock);
+        writeFileSync(join(k.lock, `${dead}.json`), JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' }));
+        const id = readArchiveLock(k.root).digest.slice(0, 16);
+        let resume!: () => void;
+        const gate = new Promise<void>((r) => (resume = r));
+        let c: Promise<unknown> | undefined;
+        let d: Promise<unknown> | undefined;
+        let cHolder = '';
+        const cPublish = async (text: string, hash: string, h: string) => {
+          cHolder = h;
+          await gate;
+          return k.g.publish(text, hash, h);
+        };
+        expect(() =>
+          releaseLock({
+            root: k.root,
+            record: id,
+            at: when(['release', ARCHIVE_LOCK, () => {
+              expect(releaseLock({ root: k.root, record: id })).toMatchObject({ released: true });
+              c = k.go(REG, { publish: cPublish });
+              d = k.go({ kind: 'register', piece: 'یکی-دیگر' });
+            }]),
+          }),
+        ).toThrow(/not the record you saw/);
+        await expect(d).rejects.toThrow(/maintenance lock is held by run/);
+        expect(readArchiveLock(k.root).token).toBe(cHolder);
+        resume();
+        expect(await c).toMatchObject({ ok: true, status: 'published' });
+        expect(existsSync(k.lock)).toBe(false);
+        // A run whose lock was released by hand, while ANOTHER run now holds the archive: its own
+        // release at the end removes only its own record — the newer run's lock stands.
+        const k2 = box();
+        const otherState = join(k2.base, 'other-state');
+        mkdirSync(otherState);
+        let resumeC!: () => void;
+        const gateC = new Promise<void>((r) => (resumeC = r));
+        let resumeD!: () => void;
+        const gateD = new Promise<void>((r) => (resumeD = r));
+        let dHolder = '';
+        const c2 = k2.go(REG, { publish: async (text: string, hash: string, h: string) => (await gateC, k2.g.publish(text, hash, h)) });
+        const shown = /--record ([0-9a-f]{16})/.exec(releaseLock({ root: k2.root }).lines.join('\n'))![1];
+        expect(releaseLock({ root: k2.root, record: shown })).toMatchObject({ released: true });
+        const later = { kind: 'register', piece: 'ردیف-بعدی' };
+        const d2 = applyMaintenance({ root: k2.root, state: otherState, action: later, previewId: planMaintenance(k2.root, later).id, publish: async (text: string, hash: string, h: string) => ((dHolder = h), await gateD, k2.g.publish(text, hash, h)) });
+        resumeC();
+        expect(await c2).toMatchObject({ ok: false, message: expect.stringMatching(/no longer holds the archive/) });
+        expect(readArchiveLock(k2.root).token).toBe(dHolder);
+        resumeD();
+        expect(await d2).toMatchObject({ ok: true, status: 'published' });
+        expect(existsSync(k2.lock)).toBe(false);
       }
 
       // --- PUBLISHERS answer to the archive's owner, the scheduled job included -
@@ -901,9 +1077,11 @@ describe('maintaining the Setar archive', () => {
         // An orphaned publisher of that run, once its lock is gone (or another run's): refused.
         const later = `${JSON.stringify(scanToIndex(k.root), null, 2)} \n`;
         await expect(publishIndex({ transport: k.g.transport, indexText: later, confirm: archiveConfirmation(k.root, holder) })).rejects.toThrow(/no longer holds the archive/);
-        writeFileSync(k.lock, JSON.stringify({ token: ['1f1f1f1f', '0000', '4000', '8000', '000000000000'].join('-'), pid: process.pid, host: 'h', since: 's' }));
+        const another = ['1f1f1f1f', '0000', '4000', '8000', '000000000000'].join('-');
+        mkdirSync(k.lock);
+        writeFileSync(join(k.lock, `${another}.json`), JSON.stringify({ token: another, pid: process.pid, host: 'h', since: 's' }));
         await expect(publishIndex({ transport: k.g.transport, indexText: later, confirm: archiveConfirmation(k.root, holder) })).rejects.toThrow(/no longer holds the archive/);
-        rmSync(k.lock);
+        rmSync(k.lock, { recursive: true });
       }
       // An OLDER validated index never lands over a newer one, wherever the old (scheduled) publisher
       // stalls — at its ref read, before its commit, or with its ref write already asked for (after
@@ -999,6 +1177,36 @@ describe('maintaining the Setar archive', () => {
         expect(await publishIndex({ transport: t, indexText: x!, confirm: archiveConfirmation(k.root), ...k.g.shared }), lands).toMatchObject({ status: 'unchanged' });
         expect(k.g.commits(), lands).toBe(commits + 1);
       }
+      // GitHub REFUSES the protective write without the ref having moved (a 422 that is not a
+      // conflict): the older unanswered write is still guarded — never "unchanged" while it can
+      // land. Refused once, the next attempt moves the ref; refused every time, the outcome stays
+      // unconfirmed, and once the old write lands the next run publishes over it.
+      for (const refusals of [1, 4]) {
+        const k = box();
+        expect(await k.go({ kind: 'roster', session: 40, pieces: ['ضربی-سه-گاه-لطفی'] })).toMatchObject({ ok: true });
+        const x = k.g.published();
+        writeFileSync(k.at(added), 'a file added by hand');
+        const h1 = `${JSON.stringify(scanToIndex(k.root), null, 2)}\n`;
+        const t = k.g.transport;
+        let late!: () => Promise<string>;
+        const dying = { ...t, updateRef: async (b: string, s: string, e: string) => ((late = () => t.updateRef(b, s, e)), Promise.reject(new TypeError('fetch failed: the publisher died'))) };
+        await expect(publishIndex({ transport: dying, indexText: h1, confirm: archiveConfirmation(k.root), ...k.g.shared })).rejects.not.toHaveProperty('nothingPublished');
+        rmSync(k.at(added)); // the archive is X again, which the branch still holds
+        k.g.refuse(refusals);
+        const settledNow = await k.again();
+        if (refusals === 1) {
+          expect(settledNow, 'refused once').toMatchObject({ ok: true, publication: { status: 'published' } });
+          expect([await late(), k.g.published(), existsSync(k.g.shared.intent)], 'refused once').toEqual(['HTTP 422', x, false]);
+        } else {
+          expect(settledNow, 'refused always').toMatchObject({ ok: false, message: expect.stringMatching(/could not be confirmed.*may already be published/s) });
+          expect([existsSync(k.g.shared.intent), k.j().publication], 'refused always').toEqual([true, 'unknown']);
+          expect(await late(), 'refused always').toBe('ok'); // the old write lands after all
+          expect(JSON.parse(k.g.published()!).contentHash).toBe(JSON.parse(h1).contentHash);
+          expect(await k.again(), 'refused always').toMatchObject({ ok: true, publication: { status: 'published' } });
+          expect([k.g.published(), existsSync(k.g.shared.intent)], 'refused always').toEqual([x, false]);
+        }
+        expect(await k.again()).toMatchObject({ ok: true, publication: { status: 'unchanged' } });
+      }
 
       // --- PUBLICATION STATE: open until a positive observation; every attempt bound to its index -
       {
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/setar-archive.md`
- `docs/setar-lesson-lifecycle.md`
- `scripts/publish-setar-index.mjs`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
2bdccda Setar maintenance stops and asks instead of recovering on a guess

Owner direction: the tool is used rarely, so cut the automatic recovery that
kept generating cases rather than harden it again.

Invariant (maintenance recovery): every mutation and every recovery preserves
concurrent state and exact ownership, stays inside the authorised archive,
and reports only what it actually restored.
Consumers enumerated and closed:
- lock-time recovery (recoverCaptures, recoverDrops): DELETED. Any file under
  a private name (.<decl>.captured-*, <session>/.<leaf>.dropping-*) makes
  every entry point (apply, retry, rollback) refuse, naming each with the
  mv -n that puts it back; nothing is installed or deleted on a name.
- replaceDeclaration (apply registry/log, automatic put-back, rollback,
  log removal): every capture, temp and written-copy name is fresh, so no
  put-back displaces a kept file a handle still writes; the write is recorded
  in `written` the instant the archive changes, so a failure after it (keep
  rename, cleanup, scan) is judged by the put-back; the install-time EEXIST
  aside is kept as superseded at once. Apply's message says "put back" only
  when it changed something.
- dropName's three callers (moveExact final drop, its judged-failure undo,
  restore of a move stopped between its names): run inside inFolder, bound
  by inode with leaf names only; moveExact checks the folder still stands
  before judging and undoes inside the bound folder; the stopped-move drop
  throws instead of returning success when it could not drop. Renames are
  refused across session folders at planning.
- lock / assertOwner / unlock / releaseLock / archiveConfirmation: the lock is
  a folder holding one <token>.json renamed into place; release removes only
  the exact names it judged, so no stale or concurrent release (nor a run's
  own unlock) can take a newer run's lock. A legacy file at the lock's name
  reads as a record not in this tool's form.

Invariant (publi
… (truncated)

17bb610 Record passing check for the maintenance-recovery rework

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
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
