---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 5872c7256acee8636b2119d621a7f9a281115999
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: archive mutations and lock release still trust replaceable
      pathnames rather than the exact authorised objects."
    counterexample: "HEAD d197d4a5078ba74cd089915083f0d9d5fd206672; patch
      5872c7256acee8636b2119d621a7f9a281115999. Production function bodies on an
      in-memory filesystem reproduce: after assertOwner, retarget the archive
      pathname to an external copy. replaceDeclaration(text=null), at capture,
      removes the external RENAME-LOG.csv public name and returns success while
      the real log remains; moveExact, before inFolder selects its directory,
      renames external media and returns success. rootId hashes an earlier
      resolved pathname, not a directory binding. Instances: replaceDeclaration
      520-563 via Apply registry/log 805/807 and restore 862, including
      automatic recovery 816 and Rollback 934; moveExact 601-636 via Apply 809
      and restore reverse move 874; stopped-move recovery 879-885 also selects
      its directory after the owner check. Separately, production
      readArchiveLock/releaseLock delete replacement B after record A was
      approved, for both a legacy lock file and a foreign/partial folder entry
      reused at the same name, at 408. Checked clean: token-specific
      release/unlock on a stable root, session-folder replacement after binding,
      declaration comparison/refusal, private leftovers, Retry media
      non-mutation, and original-inode retention in 30 focused retireKeeping
      failure cases. Bind archive mutations and lock housekeeping to the
      authorised directory and captured object. Extend the SAME exact ac-2
      title, setar guided maintenance is reversible stale safe and idempotent
      without altering media, across all these consumers and parent/entry
      replacements. Limits: read-only virtual filesystem probes; no live NAS or
      OS crash test."
  - family: maintenance-publication-matches-validated-index
    summary: "P2: current operator instructions still promise that failed
      publication leaves the previous index published."
    counterexample: "Same HEAD and patch. Invariant: failure proves only this
      attempt; an unanswered earlier or scheduled write can still land.
      Remaining current claims: docs/setar-archive.md:223-226, :314-315, :645;
      docs/nas-topology.md:308-310. A scheduled ref update loses its answer,
      newer maintenance publication fails before intent inspection or because
      sudo cannot run, then the scheduled update lands. Those failures cannot
      establish an unchanged branch. Reconcile every current instruction with
      the attempt-only rule. Runtime consumers checked clean: shared
      Apply/Retry/Rollback publishStep, legacy failed-state normalisation,
      expected-hash and seat admission, first-ref failure, intent
      retention/protective writes, CLI exit mapping, runner failures and
      publishWithRunner evidence handling. Six production publishStep probes
      retained unknown state and prior hashes. Keep the SAME exact ac-2 title,
      setar guided maintenance is reversible stale safe and idempotent without
      altering media, with its scheduled-predecessor/pre-intent matrix.
      Superseded dated DECISIONS entries are historical. No live GitHub mutation
      or wholesale Check rerun."
createdAt: 2026-11-01T01:37:29.014Z
sealedAt: 2026-11-01T01:49:40.700Z
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
- **Diff patch-id:** `5872c7256acee8636b2119d621a7f9a281115999`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: unlinkKeeping can destroy recoverable originals or truncate the only retained copy.
  _counterexample:_ BOUND HEAD 235d4b33c72966dcc397563c33acdc8c61228158; patch d71aba3a0c14a5e4c9ff083cff704a64d7374e8c. Invariant: mutations and recovery preserve concurrent state and recoverable originals across failures and interruptions. Production function bodies with an in-memory filesystem reproduce: A is linked to B; another writer replaces B at unlink-aside; unlinkKeeping removes the last original name at scripts/setar-archive-maintenance.mjs:475, then openSync(aside, wx) fails ENOSPC at 479. Finally closes the only recovery descriptor, leaving no original bytes under any name. A death after unlink has the same loss window. A short write at 482 leaves only ORIG from ORIGINAL-BYTES because the writeSync return is ignored. Even successful copying drops the original inode, so subsequent saves through an already-open handle have no retained filename. ALL INSTANCES: moveExact final drop 639 (Apply forward and Rollback reverse), judged-failure undo 630, restore stopped-move drop 888; putBack 509 reached by declaration mismatch 551, declaration install error 562, and dropName mismatch/counterpart recovery 668/672. Checked clean by inspection: keep retains superseded declaration inodes, own temporary-file cleanup, refusal of private leftovers, directory binding, token-specific lock release; Retry does not drop media. Extend the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, across every consumer with reconstruction I/O failure, short writes, interruption after unlink and later writes through existing handles. Retain a recoverable original before deleting its last name; an open descriptor alone is not a durable recovery copy. Limits: read-only virtual filesystem probes, no live NAS or real OS crash test.
- **maintenance-publication-matches-validated-index** — P2: failures before intent inspection still turn an unanswered scheduled publication into a false unchanged-branch claim.
  _counterexample:_ BOUND to the same HEAD and patch. Invariant: earlier publication uncertainty stays explicit until positive remote evidence excludes it; failure of a newer attempt proves only that attempt. Production publishIndex/takeSeat/publishStep with in-memory Git and filesystem reproduce a scheduled lost-answer write that records its real intent; the newer maintenance journal has unresolved=[]; expected-hash refusal at scripts/publish-setar-index.mjs:145-147 or publisher-seat busy/bind failure at 87-89/155 occurs before readIntents at 172. publishStep records failed with unresolved=[] and says the source-index branch is as it was at scripts/setar-archive-maintenance.mjs:740. The delayed scheduled write then succeeds and publishes its older index. Reproduced for pending update, pending create and unreadable-intent variants; first-getRef failure is now correctly unknown. ALL INSTANCES: expected-hash refusal and seat admission; publisher CLI unreadable-index exit 4 at 428-431; runner missing configuration/required values/work directory and failed scan at scripts/run-setar-index.sh:43-73; publisher CLI exit mapping 449-457 and publishWithRunner 982-983 feed the shared publishStep used by Apply, Retry and Rollback. Checked clean by probes or inspection: first-ref failure with pending intent, intent retention, lost-answer classification after ref writes, protective-ref fencing, unchanged path without pending intent, and preservation of earlier unresolved hashes already in the maintenance journal. Extend the SAME exact ac-2 title with scheduled predecessor plus every pre-intent exit and wrapper mapping, including update/create/unknown variants. Do not infer whole-branch certainty from current-attempt non-publication. Limits: synthetic transport and in-memory intent/journal, no live GitHub mutation or wholesale Check rerun.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index bdfcad4a35bcd5ab4d4e22fd948d11c3d04ca8cc..5843d90a9a77dcdf6beb7c742737e4033c9389c3 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -668,11 +668,18 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   size and SHA-256, and only then loses its old name — and any name is dropped
   only after it is first moved to a private name and judged THERE, so a file
   renamed onto it meanwhile keeps its name (put back, never overwritten). A
-  private name (a drop's, or a put-back's) is removed only while the file's
-  other name still holds it, with the file held open: that name replaced or
-  removed at any instant, the file keeps a name — back at the one being
-  dropped, or its private name, named in the refusal; its bytes from the open
-  file if its name was already gone — so no file ever loses its last name. A
+  private name (a drop's, or a put-back's) is retired without copying a
+  byte: the file first gets a second, hidden name `.<name>.superseded-<id>`
+  beside it (in the root or the session folder), then the file's other name
+  is judged, and only then is one of the two removed — the private name if
+  the other name holds the file, else the hidden one, the file staying at
+  the name being dropped or its private name, named in the refusal. A name
+  is removed only while another of the tool's names holds the same file, so
+  no failure, kill or concurrent write leaves it nameless (killed anywhere,
+  the private name is left for the next run to refuse on), and a program
+  holding the file open keeps writing into a named file. The hidden names
+  are the same file, no extra bytes; the operator may delete them once
+  nothing needs them. A
   rename stays inside its session folder, and every media write runs inside
   that folder bound by inode, so a folder swapped for a link meanwhile cannot
   carry a write outside the archive. An edit, deletion or new file from
@@ -730,10 +737,12 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
 - **Unconfirmed stays unconfirmed.** Before any remote work the journal names
   the attempt's validated hash and marks it open; every unconfirmed attempt's
   hash stays in `unresolved` until a positive observation of the branch.
-  "This attempt published nothing; the branch is as it was" is said only when
-  the job proved it (exit 2, 3 or 4) AND no earlier attempt is open. Exit 1
-  or any other code, a signal, a lost response, an exit 0 without evidence,
-  or a proved failure after an open attempt is reported as unconfirmed. A
+  A failure is always unconfirmed: "this attempt published nothing" is said
+  only when the job proved it (exit 2, 3 or 4), and never "the branch is as
+  it was" — a proof covers that attempt, while another publisher's unanswered
+  write (the scheduled job's, in a record this run cannot read) may still
+  land. Exit 1 or any other code, a signal, a lost response or an exit 0
+  without evidence leaves the attempt itself open too. A
   publication the journal then fails to record is reported as published.
   Every case: `retry`, which makes no commit if the branch already holds the
   index.
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index fb09a75aca841e20a9af424a152eb5a35531d1e9..e06d7b8e6250ce8986ee6972977927e8f970b6a8 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -127,9 +127,9 @@ const writeIntents = (file, list) => {
  * - The ref only ever advances NON-FORCE from the commit that was read, so a
  *   second publisher racing this one loses the update-ref rather than
  *   overwriting it, and the retry re-reads before deciding anything.
- * - An interruption before the ref advances leaves the previous index as the
- *   published one: a blob and a commit nothing points at are invisible. Such
- *   a failure carries `nothingPublished: true`. A throw FROM the ref write (a
+ * - An interruption before the ref advances publishes nothing of THIS run: a
+ *   blob and a commit nothing points at are invisible. Such a failure carries
+ *   `nothingPublished: true` — a claim about this run, never the branch. A throw FROM the ref write (a
  *   lost response, a 5xx) does not: GitHub may have accepted it.
  */
 export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX_BRANCH, path = INDEX_PATH, message, expectedContentHash, confirm, seat, intent }) {
@@ -427,7 +427,7 @@ async function main() {
   try {
     indexText = readFileSync(values.index, 'utf8');
   } catch {
-    console.error('Could not read the scanned index; the published one is unchanged.');
+    console.error('Could not read the scanned index; this run published nothing.');
     process.exit(4);
   }
   try {
@@ -453,7 +453,8 @@ async function main() {
     // Never the URL, never the token, never the archive root.
     console.error(`Publish failed: ${err.message}`);
     if (err?.nothingPublished) {
-      console.error('This run published nothing; the source-index branch is as it was.');
+      // About THIS run only: another publisher's unanswered write may still land.
+      console.error('This run published nothing.');
       process.exit(4);
     }
     console.error('It may already be published; running the job again makes no new commit if so.');
diff --git a/scripts/run-setar-index.sh b/scripts/run-setar-index.sh
index 906192e6e10af8a5286c69ad10d5b2f329b2f5d8..3f45667c03d9cf634a7ad84ebd667f8aecf8f49b 100755
--- a/scripts/run-setar-index.sh
+++ b/scripts/run-setar-index.sh
@@ -28,9 +28,10 @@
 #
 # WHAT THIS JOB MAY DO: read the archive, write ONE scratch file in its own
 # runtime directory, and update source-index/setar/index.json. Nothing else.
-# Exits that PROVE nothing was published: 2 (configuration refused, nothing
-# ran), 3 (the scan was not the validated index) and 4 (the scan, or the
-# publisher before its ref write, failed). Any other failure may have come after GitHub accepted the
+# Exits that PROVE this run published nothing — never that the branch is as it
+# was, since another run's unanswered write may still land: 2 (configuration
+# refused, nothing ran), 3 (the scan was not the validated index) and 4 (the
+# scan, or the publisher before its ref write, failed). Any other failure may have come after GitHub accepted the
 # ref: unknown, and running the job again is safe (unchanged makes no commit).
 #
 # ROLLBACK: disable the scheduled task. The app keeps the source graph it last
@@ -45,12 +46,12 @@ if [ -r "$CONFIG" ]; then
   # shellcheck disable=SC1090
   . "$CONFIG"
 else
-  echo "No readable config at $CONFIG; nothing was published." >&2
+  echo "No readable config at $CONFIG; this run published nothing." >&2
   exit 2
 fi
 
 for v in PC_ARCHIVE_ROOT PC_INDEX_REPO PC_INDEX_TOKEN; do
-  eval "[ -n \"\${$v:-}\" ]" || { echo "$v is not set; nothing was published." >&2; exit 2; }
+  eval "[ -n \"\${$v:-}\" ]" || { echo "$v is not set; this run published nothing." >&2; exit 2; }
 done
 export PC_INDEX_REPO PC_INDEX_TOKEN PC_INDEX_SEAT_PORT  # the seat port, if set, must be the same for every publisher here
 
@@ -67,9 +68,9 @@ if [ ! -d "$WORK" ]; then
   exit 2
 fi
 
-# Scan first. If it fails, stop here: the published index is still the good one.
+# Scan first. If it fails, stop here: this run publishes nothing.
 "$NODE" "$HERE/scan-setar-classes.mjs" --root "$PC_ARCHIVE_ROOT" --out "$OUT" || {
-  echo "The scan failed; nothing was published." >&2
+  echo "The scan failed; this run published nothing." >&2
   exit 4
 }
 
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index 1ae82bf4de0bb66131a05e5e7ce1995e795b948f..2ec6088f22d9a8156e8a2db15cea5041db4ecc13 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -21,13 +21,16 @@
 //
 // The scanner stays read-only; this is the only writer, and it writes only
 // PIECES.csv, RENAME-LOG.csv, the one file a `rename` names, its own dotfiles
-// in the archive root (the archive's lock, a write's temp and capture) and its
-// own --state folder. Every write is proved against the exact state it expects
+// in the archive root (the archive's lock, a write's temp and capture) and in
+// that file's folder, and its own --state folder. A name it takes away stays
+// as a hidden `.<name>.superseded-<id>` (the same file, no bytes copied), and
+// a private name is removed only while another of its names holds the same
+// file, so nothing anyone has open loses its file. Every write is proved against the exact state it expects
 // at the moment it is made, under the archive's one lock. Node stdlib only.
 
 import { createHash, randomUUID } from 'node:crypto';
 import { spawnSync } from 'node:child_process';
-import { closeSync, constants, copyFileSync, existsSync, fchmodSync, futimesSync, linkSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, readSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync, writeSync } from 'node:fs';
+import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
 import { hostname } from 'node:os';
 import { basename, dirname, join, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -266,7 +269,8 @@ const rootIdOf = (root) => sha(realpathSync.native(root).normalize('NFC'));
  *
  * `status` says what the ARCHIVE holds (prepared | applied | rolling-back |
  * rolled-back), `publication` what is known of the source-index branch
- * (pending | published | failed | unknown | not-needed), and `unresolved` the
+ * (pending | published | unknown | not-needed; an older journal's `failed` reads
+ * as unknown), and `unresolved` the
  * validated hashes of every attempt whose remote outcome is NOT known — kept
  * until a positive observation of the branch, never reset by a later failure.
  */
@@ -286,7 +290,7 @@ function journalFor(state, root, recovering) {
   else if (j.status === 'applied' || j.status === 'rolled-back') {
     if (!j.publication) j = { ...j, publication: 'pending' };
     else if (j.publication === 'unchanged' || j.publication === 'created') j = { ...j, publication: 'published' };
-    else if (j.publication === 'publish-failed') j = { ...j, publication: 'unknown' };
+    else if (j.publication === 'publish-failed' || j.publication === 'failed') j = { ...j, publication: 'unknown' };
   }
   // An open attempt from before `unresolved` existed stays open, under its hash if it recorded one.
   const open = ['pending', 'unknown'].includes(j.publication) ? [j.contentHash ?? 'unrecorded'] : [];
@@ -453,44 +457,31 @@ function capture(dir, name) {
 }
 
 /**
- * THE ONE PLACE a private name of this tool is removed: only while `kept`
- * still names the same file (a link: the same target), so a file never loses
- * its last name. The file is held open throughout: if `kept` is replaced or
- * removed in the instant between that judgement and the unlink, its bytes are
- * written back under the private name from the open file. Returns whether the
- * private name is gone and `kept` held the file after it went; on false the
- * private name holds the file (or its bytes). `at(point, label)` is the seam.
+ * THE ONE PLACE a private name of this tool is retired, its bytes never
+ * copied: the file first gets a SECOND private name, a hidden `.superseded-`
+ * one (the scanner skips dotfiles; a fresh id, never the `mv -n` target a
+ * refusal suggests), then `kept` is judged to still name the same file (a
+ * link: the same target), and only then is ONE of the two removed — `aside`
+ * when `kept` holds it (the hidden name stays), else the hidden one (false:
+ * `aside` still holds the very file). A name is removed only while another
+ * private name of this tool holds the same file, so no failure, kill or
+ * concurrent replacement leaves it without a name — killed anywhere, `aside`
+ * is still there for the next run to refuse on and name — and a program
+ * holding it open keeps writing into a named file. `at` is the seam, between
+ * the second name and the judgement.
  */
-function unlinkKeeping(aside, kept, at, label) {
+function retireKeeping(aside, kept, at, label) {
   const st = lstatSync(aside);
   const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
-  const fd = target === null ? openSync(aside, 'r') : null;
-  const holds = () => {
-    const k = lstatOrNull(kept);
-    return target === null ? same(k, st) : Boolean(k?.isSymbolicLink()) && readlinkSync(kept) === target;
-  };
-  try {
-    if (!holds()) return false;
-    at('unlink-aside', label);
-    rmSync(aside);
-    if (holds()) return true;
-    if (target !== null) symlinkSync(target, aside);
-    else {
-      const out = openSync(aside, 'wx');
-      try {
-        const buf = Buffer.allocUnsafe(1 << 20);
-        for (let pos = 0, n; (n = readSync(fd, buf, 0, buf.length, pos)) > 0; pos += n) writeSync(out, buf, 0, n);
-        // ponytail: mode and times kept; the owner is this tool's (chown needs root), the operator fixes it if it matters.
-        fchmodSync(out, st.mode & 0o7777);
-        futimesSync(out, st.atime, st.mtime);
-      } finally {
-        closeSync(out);
-      }
-    }
-    return false;
-  } finally {
-    if (fd !== null) closeSync(fd);
-  }
+  const retained = aside.replace(/\.(captured|dropping)-[^/]*$/, `.superseded-${randomUUID()}`);
+  // A link is re-made, never hard-linked: link(2) follows a symlink on macOS.
+  if (target === null) linkSync(aside, retained);
+  else symlinkSync(target, retained);
+  at('retain-aside', label);
+  const k = lstatOrNull(kept);
+  const holds = target === null ? same(k, st) : Boolean(k?.isSymbolicLink()) && readlinkSync(kept) === target;
+  rmSync(holds ? aside : retained);
+  return holds;
 }
 
 /** Put a captured file back, never over anything that appeared meanwhile, nor losing it if its name is replaced again — then both are kept, and said. */
@@ -506,7 +497,7 @@ function putBack(dir, name, aside, at, label = name) {
     throw err;
   }
   at('put-back', label);
-  if (!unlinkKeeping(aside, join(dir, name), at, label)) throw new Refusal(both);
+  if (!retireKeeping(aside, join(dir, name), at, label)) throw new Refusal(both);
 }
 
 /** A replaced declaration is KEPT, never unlinked, under a name no other write uses. */
@@ -601,7 +592,7 @@ function inFolder(root, folder, fn) {
  * moving bytes other than the recorded ones: the new name is LINKED (fails if
  * anything is there), what it names is judged (same file, recorded size and
  * SHA-256, the folder still at its name), and only then is the old name
- * removed — while the new name still holds the file. A judged failure removes
+ * retired to a hidden `.superseded-` name of the same file — while the new name still holds it. A judged failure removes
  * only the name this call made, while the old name still holds the file —
  * inside the bound folder, wherever it now is; nothing has moved. Whichever
  * name another writer replaces meanwhile, the file keeps the other, and the
@@ -633,7 +624,7 @@ function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
         written?.delete('rename');
         throw new Refusal(`${why}, and "${toRel}" was then replaced or removed; whatever stands there is left, and nothing was moved.`);
       }
-      throw new Refusal(bound ? `${why}; nothing was moved.` : `${why}; the name this run made there was removed again, and nothing outside it was touched.`);
+      throw new Refusal(bound ? `${why}; nothing was moved.` : `${why}; the name this run made there was taken out again (kept hidden beside it), and nothing outside it was touched.`);
     }
     at('unlink', fromRel);
     const drop = dropName(from, b, to, at, join(root, fromRel), join(root, toRel));
@@ -646,7 +637,8 @@ function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
 }
 
 /**
- * Remove the leaf name `name` (inside a bound folder) only while it names the
+ * Take the leaf name `name` away (inside a bound folder; kept hidden:
+ * `retireKeeping`) only while it names the
  * file `inode` (an lstat) AND its other name `kept` still does — judged on a
  * PRIVATE name it was first moved to (atomic: whatever held the name at that
  * instant), so no file renamed onto either name meanwhile, nor the file
@@ -668,7 +660,7 @@ function dropName(name, inode, kept, at, label, keptLabel) {
     putBack('.', name, aside, at, label);
     return 'changed';
   }
-  if (unlinkKeeping(aside, kept, at, keptLabel)) return 'dropped';
+  if (retireKeeping(aside, kept, at, keptLabel)) return 'dropped';
   putBack('.', name, aside, at, label);
   return 'kept-changed';
 }
@@ -692,9 +684,10 @@ function validateAndScan(root, state, action) {
 
 /**
  * Publication failed. `nothingPublished` is a CLAIM about THIS attempt only,
- * made when the job proved it (it refused or failed before its ref write);
- * every other failure — a non-zero or signalled exit, a lost response, an
- * ordinary exception — is UNKNOWN and said so, never promised.
+ * made when the job proved it (it refused or failed before its ref write) —
+ * never about the branch, which another publisher may still change; every
+ * other failure — a non-zero or signalled exit, a lost response, an ordinary
+ * exception — leaves this attempt itself open too.
  */
 export class PublishFailed extends Error {
   constructor(message, nothingPublished) {
@@ -722,23 +715,24 @@ async function publishStep(state, base, scanned, publish, token) {
     // POSITIVE EVIDENCE or it did not happen: a publisher that returns no status has proved nothing.
     if (!PUBLISHED.has(result?.status)) throw new PublishFailed('the publisher reported no publication', false);
   } catch (err) {
+    // A proof covers THIS attempt only, never the branch: another publisher's
+    // unanswered write (the scheduled job's, recorded where this run cannot
+    // read) may still land. So a failure is always `unknown` until a positive
+    // observation of the branch.
     const proved = err?.nothingPublished === true;
     const unresolved = proved ? before : attempt.unresolved;
-    const publication = unresolved.length ? 'unknown' : 'failed';
     const why = err?.message ?? 'unknown';
     try {
-      writeJournal(state, { ...attempt, publication, unresolved });
+      writeJournal(state, { ...attempt, publication: 'unknown', unresolved });
     } catch (e) {
-      throw new Error(`Publication ${publication === 'failed' ? 'failed' : 'could not be confirmed'} (${why}), and the private journal could not record that (${e.message}); it still says pending, which counts as unconfirmed. Run \`retry\`.`);
+      throw new Error(`Publication could not be confirmed (${why}), and the private journal could not record that (${e.message}); it still says pending, which counts as unconfirmed. Run \`retry\`.`);
     }
+    const earlier = before.length ? 'an earlier attempt is still unconfirmed and may have been published' : 'what the source-index branch holds is not confirmed (an earlier or scheduled publication may still land)';
     return {
       ok: false,
       status: 'publish-failed',
       contentHash,
-      message:
-        publication === 'failed'
-          ? `The archive is valid, but publication failed (${why}). This attempt published nothing, so the source-index branch is as it was. Run \`retry\` to publish again.`
-          : `The archive is valid, but publication could not be confirmed (${why}); ${proved ? 'this attempt published nothing, but an earlier attempt is still unconfirmed and may have been published' : 'it may already be published'}. Run \`retry\`: it makes no new commit if the source-index branch already holds this index.`,
+      message: `The archive is valid, but publication could not be confirmed (${why}); ${proved ? `this attempt published nothing, but ${earlier}` : 'it may already be published'}. Run \`retry\`: it publishes this index, and makes no new commit if the source-index branch already holds it.`,
     };
   }
   // Published: a failure to RECORD it is never reported as a failure to publish.
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index 075cc4664d7915f497533b3e9abcb05ca31689a4..6f033966593ec9feb7959e5a8f5fe05ec517cf26 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -6,11 +6,11 @@ import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
 import { describe, expect, it, vi } from 'vitest';
 // @ts-expect-error — untyped operator tools; these are the real ones.
-import { applyMaintenance, Interrupted, planMaintenance, releaseLock, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
+import { applyMaintenance, Interrupted, planMaintenance, publishWithRunner, releaseLock, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
 // @ts-expect-error — see above.
 import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
 // @ts-expect-error — see above.
-import { archiveConfirmation, ARCHIVE_LOCK, DEFAULT_SEAT_PORT, makeGitHubIndexTransport, publishIndex, readArchiveLock, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../scripts/publish-setar-index.mjs';
+import { archiveConfirmation, ARCHIVE_LOCK, DEFAULT_SEAT_PORT, makeGitHubIndexTransport, publishIndex, readArchiveLock, SOURCE_INDEX_BRANCH, INDEX_PATH, takeSeat } from '../scripts/publish-setar-index.mjs';
 import { followRenames } from '../src/domain/sourceReconcile';
 import SOURCE from './fixtures/setar-lifecycle-source.json' with { type: 'json' };
 import EXPECTED from './fixtures/setar-lifecycle-expected.json' with { type: 'json' };
@@ -46,14 +46,16 @@ function scratch() {
   return { base, root, state };
 }
 
-/** Every media byte, by path — what "without altering media" is checked against. */
+/** Every media byte, by path, as the scanner sees it (dotfiles skipped) — what "without altering media" is checked against. */
 function media(root: string): Record<string, string> {
   const out: Record<string, string> = {};
   for (const d of readdirSync(root).filter((n) => n.startsWith('session-'))) {
-    for (const f of readdirSync(join(root, d))) out[`${d}/${f}`] = sha(readFileSync(join(root, d, f)));
+    for (const f of readdirSync(join(root, d)).filter((n) => !n.startsWith('.'))) out[`${d}/${f}`] = sha(readFileSync(join(root, d, f)));
   }
   return out;
 }
+/** The hidden names a run retired in a session folder (never unlinked): each must be the inode of a file still there. */
+const retained = (root: string, folder: string) => readdirSync(join(root, folder)).filter((n) => n.includes('.superseded-'));
 const declarations = (root: string) => ({ pieces: readFileSync(join(root, 'PIECES.csv'), 'utf8'), log: readFileSync(join(root, 'RENAME-LOG.csv'), 'utf8') });
 
 /** A fake Git boundary; its `publish` is the real publisher, confirming against `root` before every ref write. */
@@ -258,6 +260,8 @@ describe('maintaining the Setar archive', () => {
       expect(await apply({ kind: 'rename', from, to })).toMatchObject({ ok: true, status: 'unchanged' });
       const unmoved = Object.fromEntries(Object.entries(media0).filter(([path]) => path !== from));
       expect(media(root)).toEqual({ ...unmoved, [to]: media0[from] });
+      // The old name is never unlinked: it is retired to ONE hidden name of the very same file (no bytes copied).
+      expect(retained(root, from.split('/')[0]!).map((n) => lstatSync(join(root, from.split('/')[0]!, n)).ino)).toEqual([lstatSync(join(root, to)).ino]);
 
       // --- AN EXACT CONTINUATION, and no fork or loop ever -----------------
       const a = `${S39}/نمونه-ضربی-سه-گاه-لطفی.mp4`;
@@ -345,7 +349,9 @@ describe('maintaining the Setar archive', () => {
       git.fail(true);
       const failed = await apply({ kind: 'roster', session: 41, pieces: [z] });
       expect(failed).toMatchObject({ ok: false, status: 'publish-failed' });
-      expect(failed.message).toMatch(/This attempt published nothing, so the source-index branch is as it was.*retry/s);
+      // A proof covers THIS attempt only, never the branch: unconfirmed, never "as it was".
+      expect(failed.message).toMatch(/this attempt published nothing, but what the source-index branch holds is not confirmed.*retry/s);
+      expect(failed.message).not.toMatch(/as it was/);
       expect(git.published()).toBe(good);
       await expect(apply({ kind: 'register', piece: 'یکی-دیگر' })).rejects.toThrow(/retry/);
       git.fail(false);
@@ -570,7 +576,8 @@ describe('maintaining the Setar archive', () => {
       const done = await cli(['register', '--piece', 'یکی-دیگر', '--apply', id!]);
       // No config here, so the job itself refuses: the change stands, validated, with a retry.
       expect(done.code).toBe(1);
-      expect(done.out).toMatch(/publication failed .*NAS job exited 2.*retry/s);
+      expect(done.out).toMatch(/could not be confirmed .*NAS job exited 2 before publishing: No readable config.*this run published nothing.*this attempt published nothing, but what the source-index branch holds is not confirmed.*retry/s);
+      expect(done.out).not.toMatch(/as it was/);
       expect(declarations(root).pieces).toContain('یکی-دیگر,');
 
       // --- THE REAL WRAPPER publishes only the validated index, on evidence -
@@ -614,7 +621,7 @@ describe('maintaining the Setar archive', () => {
       mkdirSync(noArchive);
       writeFileSync(join(noArchive, 'config.env'), `PC_ARCHIVE_ROOT=${join(noArchive, 'missing')}\nPC_INDEX_REPO=nobody/nothing\nPC_INDEX_TOKEN=not-a-token\nPC_INDEX_WORKDIR=${noArchive}\n`);
       const scanFailed = await via(undefined, { PC_INDEX_CONFIG: join(noArchive, 'config.env') });
-      expect([scanFailed.code, scanFailed.out]).toEqual([1, expect.stringMatching(/exited 4 before publishing: The scan failed; nothing was published.*an earlier attempt is still unconfirmed/s)]);
+      expect([scanFailed.code, scanFailed.out]).toEqual([1, expect.stringMatching(/exited 4 before publishing: The scan failed; this run published nothing.*an earlier attempt is still unconfirmed/s)]);
       // The REAL runner, configured for ANOTHER archive root, refuses before
       // any request — the published index is untouched, and it says so.
       const otherArchive = scratch();
@@ -697,7 +704,8 @@ describe('maintaining the Setar archive', () => {
           expect(edit === 'replace' ? readFileSync(k.at(name), 'utf8') : existsSync(k.at(name)), `${name} ${edit}`).toBe(edit === 'replace' ? theirs : false);
           expect([media(k.root), k.g.published(), k.g.calls, existsSync(k.lock)], `${name} ${edit}`).toEqual([pre.media, pre.index, [], false]);
           expect(k.j(), `${name} ${edit}`).toMatchObject({ status: 'rolled-back', publication: 'not-needed' });
-          expect(hidden(k.root, `.${name}`), `${name} ${edit}`).toEqual([]);
+          // Theirs, put back, keeps the private name it was judged on as a hidden name of the SAME file — never unlinked.
+          expect(hidden(k.root, `.${name}`).map((f) => lstatSync(k.at(f)).ino), `${name} ${edit}`).toEqual(edit === 'replace' ? [lstatSync(k.at(name)).ino] : []);
         }
       }
       {
@@ -878,7 +886,7 @@ describe('maintaining the Setar archive', () => {
           expect([declarations(x.root), media(x.root), readFileSync(join(x.state, 'journal.json'), 'utf8'), existsSync(x.lock)]).toEqual([...now, false]);
           for (const f of left) {
             const name = f.replace(/^(.*\/)?\.(.+)\.(captured|dropping)-.*$/, '$1$2');
-            if (existsSync(x.at(name))) renameSync(x.at(f), x.at(f.replace('.captured-', '.superseded-')));
+            if (existsSync(x.at(name))) renameSync(x.at(f), x.at(f.replace(/\.(captured|dropping)-/, '.superseded-')));
             else renameSync(x.at(f), x.at(name));
           }
           expect(leftovers(x)).toEqual([]);
@@ -918,47 +926,165 @@ describe('maintaining the Setar archive', () => {
         expect([sha(readFileSync(y.at(A))), existsSync(y.at(B))]).toEqual([yBytes, false]);
         for (const x of [f, u, v, g, h, w, y]) expect(leftovers(x)).toEqual([]);
         // The OTHER name — the one a drop leaves the file under — replaced or removed at the judgement, or
-        // between the judgement and the unlink: the file never loses its last name. It goes back to the
-        // name being dropped (from the still-open file if its name was already gone), the run refuses, and
-        // says only what is true: a move's final drop, its judged-failure undo (the concurrent in-place
-        // bytes kept), a rollback's reverse move, and a stopped move's recovery alike.
-        for (const point of ['judge-drop', 'unlink-aside'] as const) {
+        // after the private name was retired: the file never loses its last name. The VERY file (its inode,
+        // never a copy of its bytes) goes back to the name being dropped, the run refuses, and says only
+        // what is true: a move's final drop, its judged-failure undo (the concurrent in-place bytes kept), a
+        // rollback's reverse move, and a stopped move's recovery alike. A handle opened before the run
+        // writes into that file after it.
+        for (const point of ['judge-drop', 'retain-aside'] as const) {
           for (const other of ['replace', 'remove'] as const) {
             const tag = `${point} ${other}`;
             type Box = ReturnType<typeof box>;
             const hit = (x: Box, rel: string) => (other === 'replace' ? swapIn(x.at(rel), `theirs at ${rel}`) : () => rmSync(x.at(rel)));
             const stands = (x: Box, rel: string) => (existsSync(x.at(rel)) ? readFileSync(x.at(rel), 'utf8') : null);
             const theirs = (rel: string) => (other === 'replace' ? `theirs at ${rel}` : null);
-            /** The seam: at the drop's judgement of `dropped`, or just before the unlink judged against `kept`. */
+            /** The seam: at the drop's judgement of `dropped`, or after its private name was retired, before `kept` is judged. */
             const seam = (x: Box, dropped: string, kept: string, ...before: [string, string, () => void][]) =>
-              when(...before, point === 'judge-drop' ? ['judge-drop', x.at(dropped), hit(x, kept)] : ['unlink-aside', x.at(kept), hit(x, kept)]);
+              when(...before, point === 'judge-drop' ? ['judge-drop', x.at(dropped), hit(x, kept)] : ['retain-aside', x.at(kept), hit(x, kept)]);
             const fw = box();
             const fwBytes = sha(readFileSync(fw.at(A)));
             const fwDecl = declarations(fw.root);
             const fwIno = lstatSync(fw.at(A)).ino;
             chmodSync(fw.at(A), 0o640);
             utimesSync(fw.at(A), 1_700_000_000, 1_700_000_000);
+            const fwFd = openSync(fw.at(A), 'r+');
             await expect(fw.go(MOVE, { at: seam(fw, A, B) }), tag).rejects.toThrow(/was replaced or removed while this ran; whatever stands there is left, and .* was put back — nothing was moved.*everything it changed was put back/s);
             expect([sha(readFileSync(fw.at(A))), stands(fw, B), declarations(fw.root), fw.j().status, leftovers(fw)], tag).toEqual([fwBytes, theirs(B), fwDecl, 'rolled-back', []]);
-            // Caught before the unlink, it is the original file itself; only a name lost IN that instant is a copy of its bytes.
-            expect(lstatSync(fw.at(A)).ino === fwIno, tag).toBe(point === 'judge-drop');
+            // At either instant it is the original file itself: nothing is ever reconstructed from bytes.
+            expect(lstatSync(fw.at(A)).ino, tag).toBe(fwIno);
             expect([lstatSync(fw.at(A)).mode & 0o7777, lstatSync(fw.at(A)).mtimeMs], tag).toEqual([0o640, 1_700_000_000_000]);
+            writeSync(fwFd, 'later', 0);
+            closeSync(fwFd);
+            expect(readFileSync(fw.at(A)).subarray(0, 5).toString(), tag).toBe('later');
             const un = box();
             const inPlace = sha(Buffer.alloc(500, 7));
+            const unIno = lstatSync(un.at(A)).ino;
             await expect(un.go(MOVE, { at: seam(un, B, A, ['link', B, () => writeFileSync(un.at(A), Buffer.alloc(500, 7))]) }), tag).rejects.toThrow(/does not hold the bytes this change recorded.*was then replaced or removed; the file it named is kept as .*could not be put back automatically/s);
-            expect([sha(readFileSync(un.at(B))), stands(un, A), un.j().status, leftovers(un)], tag).toEqual([inPlace, theirs(A), 'prepared', []]);
+            expect([sha(readFileSync(un.at(B))), stands(un, A), un.j().status, leftovers(un), lstatSync(un.at(B)).ino], tag).toEqual([inPlace, theirs(A), 'prepared', [], unIno]);
             const rv = box();
             const rvBytes = sha(readFileSync(rv.at(A)));
+            const rvIno = lstatSync(rv.at(A)).ino;
             expect(await rv.go(MOVE)).toMatchObject({ ok: true });
             await expect(rv.back({ at: seam(rv, B, A) }), tag).rejects.toThrow(/was replaced or removed while this ran; whatever stands there is left, and .* was put back — nothing was moved/);
-            expect([sha(readFileSync(rv.at(B))), stands(rv, A), leftovers(rv)], tag).toEqual([rvBytes, theirs(A), []]);
+            expect([sha(readFileSync(rv.at(B))), stands(rv, A), leftovers(rv), lstatSync(rv.at(B)).ino], tag).toEqual([rvBytes, theirs(A), [], rvIno]);
             const st = box();
             const stBytes = sha(readFileSync(st.at(A)));
+            const stIno = lstatSync(st.at(A)).ino;
             await expect(st.go(MOVE, { at: when(['unlink', A, cut]) })).rejects.toThrow(/power cut/);
             await expect(st.back({ at: seam(st, B, A) }), tag).rejects.toThrow(/was replaced or removed while this ran; the bytes stay as .*nothing was put back/);
-            expect([sha(readFileSync(st.at(B))), stands(st, A), leftovers(st)], tag).toEqual([stBytes, theirs(A), []]);
+            expect([sha(readFileSync(st.at(B))), stands(st, A), leftovers(st), lstatSync(st.at(B)).ino], tag).toEqual([stBytes, theirs(A), [], stIno]);
           }
         }
+        // A run KILLED inside a retirement — after the second name, before either goes — at every consumer,
+        // alone or with the file's other name replaced in that same instant: the file is never without a
+        // private name of this tool. The next run refuses and names it, and that name is the VERY file (its
+        // inode, never a copy). Put back by hand, Rollback finishes — or, where the archive is not as any
+        // change left it, refuses and leaves it so — and the file still has a name.
+        {
+          type Box = ReturnType<typeof box>;
+          const inoOf = (x: Box, rel: string) => lstatSync(x.at(rel)).ino;
+          const named = (x: Box, ino: number) =>
+            ['', S39].flatMap((d) => readdirSync(x.at(d)).map((n) => (d ? `${d}/${n}` : n))).filter((rel) => lstatSync(x.at(rel)).ino === ino);
+          type Consumer = { name: string; finishes: boolean; kept: (x: Box) => string; go: (x: Box, seam: () => void) => Promise<number> };
+          const consumers: Consumer[] = [
+            { name: "apply's final drop", finishes: true, kept: (x) => x.at(B), go: async (x, seam) => {
+                const ino = inoOf(x, A);
+                await expect(x.go(MOVE, { at: when(['retain-aside', x.at(B), seam]) })).rejects.toThrow(/power cut/);
+                return ino;
+              },
+            },
+            {
+              name: 'the judged-failure undo',
+              finishes: true,
+              kept: (x) => x.at(A),
+              go: async (x, seam) => {
+                const ino = inoOf(x, A);
+                await expect(x.go(MOVE, { at: when(['link', B, () => writeFileSync(x.at(A), Buffer.alloc(500, 7))], ['retain-aside', x.at(A), seam]) })).rejects.toThrow(/power cut/);
+                return ino;
+              },
+            },
+            { name: "rollback's reverse move", finishes: true, kept: (x) => x.at(A), go: async (x, seam) => {
+                const ino = inoOf(x, A);
+                expect(await x.go(MOVE)).toMatchObject({ ok: true });
+                await expect(x.back({ at: when(['retain-aside', x.at(A), seam]) })).rejects.toThrow(/power cut/);
+                return ino;
+              },
+            },
+            {
+              name: "a stopped move's recovery",
+              finishes: true,
+              kept: (x) => x.at(A),
+              go: async (x, seam) => {
+                const ino = inoOf(x, A);
+                await expect(x.go(MOVE, { at: when(['unlink', A, cut]) })).rejects.toThrow(/power cut/);
+                await expect(x.back({ at: when(['retain-aside', x.at(A), seam]) })).rejects.toThrow(/power cut/);
+                return ino;
+              },
+            },
+            {
+              name: 'a put-back after a declaration changed',
+              finishes: false,
+              kept: (x) => x.at('PIECES.csv'),
+              go: async (x, seam) => {
+                let theirs = 0;
+                const save = () => (replaceWith(x.at('PIECES.csv'), `${SOURCE.registryBefore}their-save,,,,,,,,,\n`)(), (theirs = inoOf(x, 'PIECES.csv')));
+                await expect(x.go(REG, { at: when(['capture', 'PIECES.csv', save], ['retain-aside', 'PIECES.csv', seam]) })).rejects.toThrow(/power cut/);
+                return theirs;
+              },
+            },
+            {
+              name: 'a put-back after an install failed',
+              finishes: true,
+              kept: (x) => x.at('PIECES.csv'),
+              go: async (x, seam) => {
+                const ino = inoOf(x, 'PIECES.csv');
+                await expect(x.go(REG, { at: when(['install', 'PIECES.csv', () => rmSync(x.at(hidden(x.root, '.PIECES.csv.maintenance-')[0]!))], ['retain-aside', 'PIECES.csv', seam]) })).rejects.toThrow(/power cut/);
+                return ino;
+              },
+            },
+            {
+              name: 'a put-back after a name changed at its drop',
+              finishes: false,
+              kept: (x) => x.at(A),
+              go: async (x, seam) => {
+                let theirs = 0;
+                const swap = () => (swapIn(x.at(A), 'theirs at the old name')(), (theirs = inoOf(x, A)));
+                await expect(x.go(MOVE, { at: when(['unlink', A, swap], ['retain-aside', x.at(A), seam]) })).rejects.toThrow(/power cut/);
+                return theirs;
+              },
+            },
+          ];
+          for (const c of consumers) {
+            for (const replaced of [false, true]) {
+              const tag = `${c.name}${replaced ? ', its other name replaced' : ''}`;
+              const x = box();
+              const ino = await c.go(x, () => {
+                // A declaration replaced by another valid registry, so every entry point can still read it.
+                if (replaced) swapIn(c.kept(x), c.kept(x).endsWith('PIECES.csv') ? `${SOURCE.registryBefore}a-third-save,,,,,,,,,\n` : 'a third file')();
+                cut();
+              });
+              // The refusal names a private name, and that name is the very file.
+              expect(leftovers(x).map((rel) => inoOf(x, rel)), tag).toEqual([ino]);
+              await handBack(x);
+              expect(named(x, ino).length, tag).toBeGreaterThan(0);
+              if (c.finishes && !replaced) {
+                expect(await x.back(), tag).toMatchObject({ ok: true });
+                expect(named(x, ino).filter((rel) => !rel.includes('.superseded-')), tag).toEqual([c.name.includes('install') ? 'PIECES.csv' : A]);
+              } else {
+                await expect(x.back(), tag).rejects.toThrow(/left exactly as it is|neither as this change left them nor as they were/);
+              }
+              expect(named(x, ino).length, tag).toBeGreaterThan(0);
+            }
+          }
+          // A handle opened before a SUCCESSFUL move writes, after it, into the file at its new name — and its
+          // retired old name is a hidden name of that same file, never a copy.
+          const ok = box();
+          const okFd = openSync(ok.at(A), 'r+');
+          expect(await ok.go(MOVE)).toMatchObject({ ok: true });
+          writeSync(okFd, 'later', 0);
+          closeSync(okFd);
+          expect([readFileSync(ok.at(B)).subarray(0, 5).toString(), retained(ok.root, S39).map((n) => lstatSync(ok.at(`${S39}/${n}`)).ino)]).toEqual(['later', [lstatSync(ok.at(B)).ino]]);
+        }
         // The name being DROPPED removed just before its drop: the moved file keeps its new name, said as such.
         {
           const dr = box();
@@ -969,7 +1095,7 @@ describe('maintaining the Setar archive', () => {
         // A PUT-BACK's own link-to-unlink interval: the name it just restored replaced or removed again
         // before its private name goes — the restored file keeps that private name (its bytes from the
         // still-open file if the name was already gone), named in the refusal; nothing is lost.
-        for (const point of ['put-back', 'unlink-aside'] as const) {
+        for (const point of ['put-back', 'retain-aside'] as const) {
           for (const other of ['replace', 'remove'] as const) {
             const tag = `${point} ${other}`;
             const d = box();
@@ -1305,11 +1431,11 @@ describe('maintaining the Setar archive', () => {
         };
         const hashNow = () => scanToIndex(k.root).contentHash as string;
 
-        // A FIRST publication failing before its branch read: "as it was" — no promise that any index exists.
+        // A FIRST publication failing before its branch read: this attempt proved nothing published, the branch unconfirmed.
         const first = await k.go(REG, { publish: spy(failing('getRef')) });
-        expect(first.message).toMatch(/This attempt published nothing, so the source-index branch is as it was/);
-        expect(first.message).not.toMatch(/last good|previous|still the published/);
-        expect([k.j().publication, k.j().unresolved, k.g.published()]).toEqual(['failed', [], null]);
+        expect(first.message).toMatch(/this attempt published nothing, but what the source-index branch holds is not confirmed/);
+        expect(first.message).not.toMatch(/as it was|last good|previous|still the published/);
+        expect([k.j().publication, k.j().unresolved, k.g.published()]).toEqual(['unknown', [], null]);
         // Accepted, response lost: unknown, bound to H.
         const H = hashNow();
         expect(await k.again({ publish: spy(lossy) })).toMatchObject({ ok: false, message: expect.stringMatching(/may already be published/) });
@@ -1395,6 +1521,93 @@ describe('maintaining the Setar archive', () => {
         expect(await k.again({ publish: k.g.publish }), variant).toMatchObject({ ok: true });
         expect([k.j().publication, k.j().unresolved, JSON.parse(k.g.published()!).contentHash, existsSync(k.g.shared.intent)], variant).toEqual(['published', [], H0, false]);
       }
+      // The same SCHEDULED predecessor, and a newer run whose publication fails BEFORE the publisher reads
+      // any record — an expected-hash refusal, a busy seat or one that throws, the publisher CLI's unreadable index,
+      // the real runner's refused configuration, missing value, missing work folder and failed scan, and the
+      // wrapper's every proving exit (2, 3, 4). Each proves only that THIS attempt published nothing: Apply,
+      // Retry and Rollback alike stay unconfirmed, never "the branch is as it was" — and the scheduled
+      // write can indeed still land, until a retry publishes over it.
+      {
+        const PUBLISHER = join(process.cwd(), 'scripts', 'publish-setar-index.mjs');
+        const withEnv = (env: Record<string, string | undefined>, inner: (text: string, hash: string, holder: string) => Promise<unknown>) => async (text: string, hash: string, holder: string) => {
+          const saved = Object.fromEntries(Object.keys(env).map((key) => [key, process.env[key]]));
+          const put = (e: Record<string, string | undefined>) => Object.entries(e).forEach(([key, v]) => (v === undefined ? delete process.env[key] : (process.env[key] = v)));
+          put(env);
+          try {
+            return await inner(text, hash, holder);
+          } finally {
+            put(saved);
+          }
+        };
+        type Box = ReturnType<typeof box>;
+        const runner = (k: Box, config: string | null, extra: Record<string, string> = {}) => {
+          const file = join(k.base, `config-${Object.keys(extra).join('-') || 'plain'}.env`);
+          if (config !== null) writeFileSync(file, config);
+          return withEnv({ PC_MAINT_PUBLISH: undefined, PC_INDEX_CONFIG: config === null ? join(k.base, 'no-config.env') : file, ...extra }, publishWithRunner(k.root));
+        };
+        const full = (k: Box, archive: string) => `PC_ARCHIVE_ROOT=${archive}\nPC_INDEX_REPO=o/r\nPC_INDEX_TOKEN=t\n`;
+        const stubExit = (k: Box, code: number) => {
+          const stub = join(k.base, 'exit-job.mjs');
+          writeFileSync(stub, `process.stderr.write('refused\\n'); process.exit(${code});`);
+          return withEnv({ PC_MAINT_PUBLISH: `node ${JSON.stringify(stub)}` }, publishWithRunner(k.root));
+        };
+        const direct = (k: Box, opts: (hash: string) => object) => async (text: string, hash: string, holder: string) =>
+          publishIndex({ transport: k.g.transport, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(k.root, holder), intent: k.g.shared.intent, ...opts(hash) });
+        const modes: [string, (k: Box) => (text: string, hash: string, holder: string) => Promise<unknown>][] = [
+          ['expected-hash refusal', (k) => direct(k, (hash) => ({ expectedContentHash: hash.replace(/./, (c) => (c === 'f' ? '0' : 'f')) }))],
+          ['seat busy', (k) => async (text, hash, holder) => {
+            const leave = await takeSeat({ port: DEFAULT_SEAT_PORT + 3 });
+            try {
+              return await direct(k, () => ({ seat: { port: DEFAULT_SEAT_PORT + 3, wait: 0 } }))(text, hash, holder);
+            } finally {
+              await leave();
+            }
+          }],
+          // A seat that throws before it listens proves nothing (unproved: "may already be published"); a listen
+          // error other than busy carries the same `nothingPublished` as a busy seat, so it reads as the busy case.
+          ['seat throws before listening', (k) => direct(k, () => ({ seat: { port: 70_000, wait: 0 } }))],
+          ['runner without config', (k) => runner(k, null)],
+          ['runner missing a value', (k) => runner(k, `PC_ARCHIVE_ROOT=${k.root}\nPC_INDEX_REPO=o/r\n`)],
+          ['runner without work folder', (k) => runner(k, full(k, k.root), { PC_INDEX_WORKDIR: join(k.base, 'no-such-folder') })],
+          ['runner scan fails', (k) => runner(k, full(k, join(k.base, 'no-archive')), { PC_INDEX_WORKDIR: k.base })],
+          ['publisher cannot read its index', (k) => withEnv({ PC_MAINT_PUBLISH: `f() { PC_INDEX_REPO=o/r PC_INDEX_TOKEN=t node ${JSON.stringify(PUBLISHER)} --index ${JSON.stringify(join(k.base, 'missing.json'))} --root ${JSON.stringify(k.root)} --expect "$1" --holder "$2"; }; f` }, publishWithRunner(k.root))],
+          ['job exit 2', (k) => stubExit(k, 2)],
+          ['job exit 3', (k) => stubExit(k, 3)],
+          ['job exit 4', (k) => stubExit(k, 4)],
+        ];
+        for (const variant of ['update', 'create', 'unknown'] as const) {
+          for (const [mode, make] of modes) {
+            const tag = `${variant} / ${mode}`;
+            const k = box();
+            const t = k.g.transport as Record<string, (...a: unknown[]) => Promise<unknown>>;
+            if (variant === 'update') expect(await k.go(REG), tag).toMatchObject({ ok: true, status: 'published' });
+            const lost = async () => Promise.reject(new TypeError('fetch failed: the response was lost'));
+            if (variant === 'unknown') writeFileSync(k.g.shared.intent, 'not json');
+            else await expect(publishIndex({ transport: { ...t, updateRef: lost, createRef: lost }, indexText: '{"scheduled":1}\n', intent: k.g.shared.intent }), tag).rejects.not.toHaveProperty('nothingPublished');
+            const pending = readFileSync(k.g.shared.intent, 'utf8');
+            const fails = make(k);
+            const outcomes = [
+              await k.go(variant === 'update' ? { kind: 'register', piece: 'یکی-دیگر' } : REG, { publish: fails }),
+              await k.again({ publish: fails }),
+              await k.back({ publish: fails }),
+            ];
+            for (const [i, r] of outcomes.entries()) {
+              const said = mode === 'seat throws before listening' ? /could not be confirmed .*may already be published/s : /could not be confirmed .*this attempt published nothing, but/s;
+              expect(r, `${tag} #${i}`).toMatchObject({ ok: false, message: expect.stringMatching(said) });
+              expect(r.message, `${tag} #${i}`).not.toMatch(/as it was|still the good|published one is unchanged/);
+            }
+            expect([k.j().status, k.j().publication, readFileSync(k.g.shared.intent, 'utf8')], tag).toEqual(['rolled-back', 'unknown', pending]);
+            await expect(k.go({ kind: 'register', piece: 'یکی-دیگر-باز' }), tag).rejects.toThrow(/Run `retry`/);
+            if (variant !== 'unknown') {
+              const [{ parent, commit }] = JSON.parse(pending) as { parent: string | null; commit: string }[];
+              expect(await (parent ? t.updateRef!(SOURCE_INDEX_BRANCH, commit, parent) : t.createRef!(SOURCE_INDEX_BRANCH, commit)), tag).toBe('ok');
+              expect(k.g.published(), tag).toBe('{"scheduled":1}\n');
+            }
+            expect(await k.again({ publish: k.g.publish }), tag).toMatchObject({ ok: true });
+            expect([k.j().publication, k.j().unresolved, JSON.parse(k.g.published()!).contentHash, existsSync(k.g.shared.intent)], tag).toEqual(['published', [], scanToIndex(k.root).contentHash, false]);
+          }
+        }
+      }
     } finally {
       for (const b of boxes) rmSync(b, { recursive: true, force: true });
     }
```

**Paths the rework touched:**

- `docs/setar-archive.md`
- `scripts/publish-setar-index.mjs`
- `scripts/run-setar-index.sh`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
f13db3c Setar maintenance retires names by rename, never unlink; a failed publish claims only its own attempt

Two invariant families, each closed at its one shared primitive.

1. A file never loses its last name, and the original inode (not a copy of
   its bytes) is what survives. The private-name retirement every
   maintenance path goes through no longer unlinks and no longer rebuilds a
   file from an open descriptor. It renames the private name to a hidden
   `.superseded-` name (the scanner skips dotfiles, and a rename never
   lowers the link count), then judges the other name. If that name was
   replaced or removed, it renames back and returns false, so callers keep
   their put-back contract. With no copy path left, ENOSPC, short writes,
   a kill mid-step and later writes through handles opened earlier cannot
   lose data. The old read/write/fchmod/futimes reconstruction is deleted.
   Consumers, all routed through it and each exercised in ac-2: Apply's
   final drop, the judged-failure undo, Rollback's reverse move, restore of
   a stopped move, and putBack after a declaration mismatch, after an
   install error, and after a changed name at a drop. Checked clean:
   replaced declarations (already kept), the tool's own temp and lock
   cleanup, and leftover refusal (it still matches only `.captured-` and
   `.dropping-`, so retained names never block a run).

2. A publication failure proves only that this attempt published nothing.
   It never shows the branch is unchanged, because another publisher (the
   scheduled job) may have an unanswered write in a record this run cannot
   read. publishStep now records every failure as `unknown`. The older
   `failed` value is still read as unknown. Messages keep the
   proved/unproved distinction for the attempt and never say the branch is
   "as it was". The publisher CLI (an unreadable index, and its proved
   exit 4) and the runner's comments and messages make the same narrower
   claim. Consumers: Apply, Ret
… (truncated)

d197d4a Setar maintenance removes a private name only while a second one holds the file

Tightens the name-retirement invariant from the previous commit. The file
must always have a private name of the tool's own, so that a kill at any
instant leaves something the next run refuses on and names.

The rename-first retirement had a gap. If the other name was replaced and
the process died before the rename back, the original was left only under
a hidden `.superseded-` name. No run would refuse on it, and Rollback could
not point to it. Retirement now first hard-links a second, hidden name
(with a fresh id), then judges the other name, then removes exactly one:
the private name when the other name holds the file, otherwise the hidden
one. Between those steps the file always has at least one private name, and
no bytes are ever copied.

ac-2 now kills the run inside the retirement at every consumer, both alone
and with the file's other name replaced in the same instant. The
consumers are: Apply's final drop, the judged-failure undo, Rollback's
reverse move, restore of a stopped move, and the three put-back routes
(declaration changed, install failed, name changed at its drop). Each time
it checks four things:

- the refusal names exactly one private name;
- that name is the original inode;
- after putting it back by hand, Rollback either finishes or refuses,
  leaving the archive as it is;
- the file still has a name.

This matrix fails against the previous commit's version.

The publication matrix's port-70000 mode is relabelled as a seat that
throws before listening. It is an unproved failure ("may already be
published"), and the test now asserts exactly that. A listen error other
than busy carries the same proved flag as a busy seat, so it falls in the
busy case already covered.

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
