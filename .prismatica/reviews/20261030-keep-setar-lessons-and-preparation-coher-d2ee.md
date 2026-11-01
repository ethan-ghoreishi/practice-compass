---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: d71aba3a0c14a5e4c9ff083cff704a64d7374e8c
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: unlinkKeeping can destroy recoverable originals or truncate the
      only retained copy."
    counterexample: "BOUND HEAD 235d4b33c72966dcc397563c33acdc8c61228158; patch
      d71aba3a0c14a5e4c9ff083cff704a64d7374e8c. Invariant: mutations and
      recovery preserve concurrent state and recoverable originals across
      failures and interruptions. Production function bodies with an in-memory
      filesystem reproduce: A is linked to B; another writer replaces B at
      unlink-aside; unlinkKeeping removes the last original name at
      scripts/setar-archive-maintenance.mjs:475, then openSync(aside, wx) fails
      ENOSPC at 479. Finally closes the only recovery descriptor, leaving no
      original bytes under any name. A death after unlink has the same loss
      window. A short write at 482 leaves only ORIG from ORIGINAL-BYTES because
      the writeSync return is ignored. Even successful copying drops the
      original inode, so subsequent saves through an already-open handle have no
      retained filename. ALL INSTANCES: moveExact final drop 639 (Apply forward
      and Rollback reverse), judged-failure undo 630, restore stopped-move drop
      888; putBack 509 reached by declaration mismatch 551, declaration install
      error 562, and dropName mismatch/counterpart recovery 668/672. Checked
      clean by inspection: keep retains superseded declaration inodes, own
      temporary-file cleanup, refusal of private leftovers, directory binding,
      token-specific lock release; Retry does not drop media. Extend the SAME
      exact ac-2 title, setar guided maintenance is reversible stale safe and
      idempotent without altering media, across every consumer with
      reconstruction I/O failure, short writes, interruption after unlink and
      later writes through existing handles. Retain a recoverable original
      before deleting its last name; an open descriptor alone is not a durable
      recovery copy. Limits: read-only virtual filesystem probes, no live NAS or
      real OS crash test."
  - family: maintenance-publication-matches-validated-index
    summary: "P2: failures before intent inspection still turn an unanswered
      scheduled publication into a false unchanged-branch claim."
    counterexample: "BOUND to the same HEAD and patch. Invariant: earlier
      publication uncertainty stays explicit until positive remote evidence
      excludes it; failure of a newer attempt proves only that attempt.
      Production publishIndex/takeSeat/publishStep with in-memory Git and
      filesystem reproduce a scheduled lost-answer write that records its real
      intent; the newer maintenance journal has unresolved=[]; expected-hash
      refusal at scripts/publish-setar-index.mjs:145-147 or publisher-seat
      busy/bind failure at 87-89/155 occurs before readIntents at 172.
      publishStep records failed with unresolved=[] and says the source-index
      branch is as it was at scripts/setar-archive-maintenance.mjs:740. The
      delayed scheduled write then succeeds and publishes its older index.
      Reproduced for pending update, pending create and unreadable-intent
      variants; first-getRef failure is now correctly unknown. ALL INSTANCES:
      expected-hash refusal and seat admission; publisher CLI unreadable-index
      exit 4 at 428-431; runner missing configuration/required values/work
      directory and failed scan at scripts/run-setar-index.sh:43-73; publisher
      CLI exit mapping 449-457 and publishWithRunner 982-983 feed the shared
      publishStep used by Apply, Retry and Rollback. Checked clean by probes or
      inspection: first-ref failure with pending intent, intent retention,
      lost-answer classification after ref writes, protective-ref fencing,
      unchanged path without pending intent, and preservation of earlier
      unresolved hashes already in the maintenance journal. Extend the SAME
      exact ac-2 title with scheduled predecessor plus every pre-intent exit and
      wrapper mapping, including update/create/unknown variants. Do not infer
      whole-branch certainty from current-attempt non-publication. Limits:
      synthetic transport and in-memory intent/journal, no live GitHub mutation
      or wholesale Check rerun."
createdAt: 2026-11-01T00:57:23.208Z
sealedAt: 2026-11-01T01:06:35.831Z
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
- **Diff patch-id:** `d71aba3a0c14a5e4c9ff083cff704a64d7374e8c`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: deleting a private aside can delete the last name of media or a concurrent declaration, while rename or recovery reports success.
  _counterexample:_ BOUND HEAD 17bb61029e7659d1ed1b009db07a7a8653987918; patch 00b5e6de95872873ef7c9c538cf1c3aae3c20c90. Invariant: mutations and recovery preserve concurrent state and recoverable originals, and report only what was restored. Reproduced using production function bodies in an in-memory filesystem: moveExact links A to B; at judge-drop another writer atomically replaces B; dropName checks only the captured A inode and removes its aside (scripts/setar-archive-maintenance.mjs:603-616). The original inode has zero names and forward rename returns success. Reverse rename and restore of a stopped two-name move also return success with no name retaining the original. Judged-failure undo likewise loses the concurrent in-place bytes when its retained source name is replaced. putBack links a capture back then removes the aside at 466; replacing the restored public name between those calls loses the capture's last name too. ALL INSTANCES: moveExact final drop (591), judged-failure cleanup (583), restore stopped-move drop (832), putBack used by replaceDeclaration mismatch/install-error branches (508,519) and dropName mismatch (613). Consumers: Apply, automatic restore, explicit Rollback; Retry takes the shared lock but does not drop media itself. Checked clean by inspection or control probes: ordinary forward/reverse/stopped moves, unique superseded declaration retention, immediate written tracking, static symlink refusal, bound-folder writes, no automatic private-name recovery, token-specific unlock/release, stale digest and destination refusal. Rework the whole deletion/retention family in the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media; cover replacement/removal of the retained counterpart, not only the name being dropped, and putBack's link-to-unlink interval. Limits: virtual filesystem and production functions; no disk writes, live NAS or OS crash proof.
- **maintenance-publication-matches-validated-index** — P2: a first ref-read failure reports definite non-publication without checking an older unanswered publication intent.
  _counterexample:_ BOUND to the same HEAD and patch. Invariant: earlier publication uncertainty remains explicit until positive remote evidence excludes it; a failed newer attempt does not prove the branch stayed unchanged. Reproduced with production publishIndex and publishStep plus in-memory Git/filesystem: remote P holds X; a scheduled H1 update C1 from P loses its answer and writes the real pending intent; newer maintenance has no unresolved hashes in its own journal; its first getRef throws HTTP 500. guarded is still false because readIntents follows getRef (scripts/publish-setar-index.mjs:164-182), so catch at 210-212 sets nothingPublished. publishStep records publication=failed, unresolved=[] and says the source-index branch is as it was (scripts/setar-archive-maintenance.mjs:669-684). Delayed C1 then lands and publishes H1. The intent file is retained, so a subsequent successful retry can fence it; this is a false certainty/reporting defect, not intent deletion. SWEPT: intent reads/writes/deletions, first and subsequent ref reads, updateRef/createRef, conflict/unchanged/success/lost-answer branches, CLI exit mapping, runner, publishWithRunner, publishStep, Apply/Retry/Rollback. All production entry points share the early-ref-read classification; test-only publishers without an intent cannot prove this invariant. Checked clean: protective 422 without movement once and four times, retained intent after lost answer, accepted protective write fencing the predecessor, ordinary unchanged reruns, and maintenance journal preservation when its own earlier unresolved hash exists. Extend the SAME exact ac-2 title with pending scheduled predecessor plus failed first ref read, including update/create and unknown-intent variants; do not claim branch certainty from proof about only the newer attempt. Limits: synthetic transport and in-memory intent/journal; no live GitHub mutation or full Check rerun.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index d510de9b692b9ca14bcc94dfa2b3ddeed36b7951..bdfcad4a35bcd5ab4d4e22fd948d11c3d04ca8cc 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -668,6 +668,11 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   size and SHA-256, and only then loses its old name — and any name is dropped
   only after it is first moved to a private name and judged THERE, so a file
   renamed onto it meanwhile keeps its name (put back, never overwritten). A
+  private name (a drop's, or a put-back's) is removed only while the file's
+  other name still holds it, with the file held open: that name replaced or
+  removed at any instant, the file keeps a name — back at the one being
+  dropped, or its private name, named in the refusal; its bytes from the open
+  file if its name was already gone — so no file ever loses its last name. A
   rename stays inside its session folder, and every media write runs inside
   that folder bound by inode, so a folder swapped for a link meanwhile cannot
   carry a write outside the archive. An edit, deletion or new file from
@@ -715,7 +720,8 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   ref (a commit even for unchanged content), so it can never land afterwards;
   only the branch observed elsewhere, or a later write's own acceptance,
   retires it — never a refused write (a 422 need not mean the ref moved), and
-  a run that ends while one is still guarded is unconfirmed, never "nothing
+  a run that ends while one is still guarded — or fails before it could read
+  the branch while any record exists — is unconfirmed, never "nothing
   published". A paused or orphaned publisher therefore never puts an older index over a
   newer one. Success needs the publisher's last line
   `published-index <status> <hash>` naming that hash. The runner is the only
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index 9f42d2974bc63fcdbc55c8aba7cc5c37104d84be..fb09a75aca841e20a9af424a152eb5a35531d1e9 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -167,6 +167,10 @@ export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX
       let commitSha;
       let open = [];
       try {
+        // Until a head is OBSERVED, every recorded unanswered write may still
+        // land: a failed branch read proves nothing about them.
+        const all = intent ? readIntents(intent) : [];
+        guarded = all.length > 0;
         ref = await transport.getRef(branch);
         const head = ref?.sha ?? null;
         // An earlier write asked for and never answered can still land while
@@ -175,7 +179,6 @@ export async function publishIndex({ transport, indexText, branch = SOURCE_INDEX
         // one; a refused write never does. While one is open this write moves
         // the ref (a commit even for unchanged content), after which it cannot.
         if (intent) {
-          const all = readIntents(intent);
           open = all.filter((e) => e.unknown || (e.parent === head && e.commit !== head));
           if (open.length !== all.length) writeIntents(intent, open);
         }
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index f1259d784f3b8bd32c54116fcfb61588ead96f7f..1ae82bf4de0bb66131a05e5e7ce1995e795b948f 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -27,7 +27,7 @@
 
 import { createHash, randomUUID } from 'node:crypto';
 import { spawnSync } from 'node:child_process';
-import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
+import { closeSync, constants, copyFileSync, existsSync, fchmodSync, futimesSync, linkSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, readSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync, writeSync } from 'node:fs';
 import { hostname } from 'node:os';
 import { basename, dirname, join, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -452,18 +452,61 @@ function capture(dir, name) {
   }
 }
 
-/** Put a captured file back, never over anything that appeared meanwhile — then both are kept, and said. */
-function putBack(dir, name, aside) {
+/**
+ * THE ONE PLACE a private name of this tool is removed: only while `kept`
+ * still names the same file (a link: the same target), so a file never loses
+ * its last name. The file is held open throughout: if `kept` is replaced or
+ * removed in the instant between that judgement and the unlink, its bytes are
+ * written back under the private name from the open file. Returns whether the
+ * private name is gone and `kept` held the file after it went; on false the
+ * private name holds the file (or its bytes). `at(point, label)` is the seam.
+ */
+function unlinkKeeping(aside, kept, at, label) {
+  const st = lstatSync(aside);
+  const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
+  const fd = target === null ? openSync(aside, 'r') : null;
+  const holds = () => {
+    const k = lstatOrNull(kept);
+    return target === null ? same(k, st) : Boolean(k?.isSymbolicLink()) && readlinkSync(kept) === target;
+  };
+  try {
+    if (!holds()) return false;
+    at('unlink-aside', label);
+    rmSync(aside);
+    if (holds()) return true;
+    if (target !== null) symlinkSync(target, aside);
+    else {
+      const out = openSync(aside, 'wx');
+      try {
+        const buf = Buffer.allocUnsafe(1 << 20);
+        for (let pos = 0, n; (n = readSync(fd, buf, 0, buf.length, pos)) > 0; pos += n) writeSync(out, buf, 0, n);
+        // ponytail: mode and times kept; the owner is this tool's (chown needs root), the operator fixes it if it matters.
+        fchmodSync(out, st.mode & 0o7777);
+        futimesSync(out, st.atime, st.mtime);
+      } finally {
+        closeSync(out);
+      }
+    }
+    return false;
+  } finally {
+    if (fd !== null) closeSync(fd);
+  }
+}
+
+/** Put a captured file back, never over anything that appeared meanwhile, nor losing it if its name is replaced again — then both are kept, and said. */
+function putBack(dir, name, aside, at, label = name) {
   const st = lstatSync(aside);
+  const both = `${name} was replaced or removed while this ran; whatever stands there now is left, and the one before is kept beside it as ${basename(aside)}.`;
   try {
     if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), join(dir, name));
     else if (st.isFile()) linkSync(aside, join(dir, name));
     else throw new Refusal(`${name} was replaced by something that is not a file while this ran; it is kept as ${basename(aside)}. Put it back by hand.`);
   } catch (err) {
-    if (err?.code === 'EEXIST') throw new Refusal(`${name} was replaced while this ran; the new one stands, and the one before is kept beside it as ${basename(aside)}.`);
+    if (err?.code === 'EEXIST') throw new Refusal(both);
     throw err;
   }
-  rmSync(aside);
+  at('put-back', label);
+  if (!unlinkKeeping(aside, join(dir, name), at, label)) throw new Refusal(both);
 }
 
 /** A replaced declaration is KEPT, never unlinked, under a name no other write uses. */
@@ -505,7 +548,7 @@ function replaceDeclaration({ root, owner, at, written }, name, text, expected,
     if (!aside) throw new Refusal(`${name} was removed while this ran; nothing was put in its place.`);
     const st = lstatSync(aside);
     if (!st.isFile() || sha(readFileSync(aside)) !== expected) {
-      putBack(root, name, aside);
+      putBack(root, name, aside, at);
       throw new Refusal(`${name} changed while this ran; it was left as the other edit made it.`);
     }
     at('install', name);
@@ -516,7 +559,7 @@ function replaceDeclaration({ root, owner, at, written }, name, text, expected,
       if (tmp && err?.code === 'EEXIST') {
         throw new Refusal(`${name} was written by someone else while this ran; theirs stands, and the one it replaced is kept beside it as ${basename(keep(aside))}.`);
       }
-      putBack(root, name, aside);
+      putBack(root, name, aside, at);
       throw err;
     }
     written?.add(name);
@@ -558,8 +601,11 @@ function inFolder(root, folder, fn) {
  * moving bytes other than the recorded ones: the new name is LINKED (fails if
  * anything is there), what it names is judged (same file, recorded size and
  * SHA-256, the folder still at its name), and only then is the old name
- * removed. A judged failure removes only the name this call made — inside the
- * bound folder, wherever it now is; nothing has moved.
+ * removed — while the new name still holds the file. A judged failure removes
+ * only the name this call made, while the old name still holds the file —
+ * inside the bound folder, wherever it now is; nothing has moved. Whichever
+ * name another writer replaces meanwhile, the file keeps the other, and the
+ * refusal says which.
  */
 function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
   assertOwner(root, owner);
@@ -580,41 +626,51 @@ function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
     const bound = stillBound();
     const bytes = bound && same(a, b) && b.isFile() ? readFileSync(to) : null;
     if (!bytes || bytes.length !== expect.size || sha(bytes) !== expect.sha256) {
-      if (same(a, b)) dropName(to, a, at, join(root, toRel));
-      throw new Refusal(
-        bound
-          ? `"${fromRel}" does not hold the bytes this change recorded (it changed since the preview); nothing was moved.`
-          : `The folder of "${fromRel}" was moved or replaced while this ran; the name this run made there was removed again, and nothing outside it was touched.`,
-      );
+      const why = bound ? `"${fromRel}" does not hold the bytes this change recorded (it changed since the preview)` : `The folder of "${fromRel}" was moved or replaced while this ran`;
+      const undo = same(a, b) ? dropName(to, a, from, at, join(root, toRel), join(root, fromRel)) : 'dropped';
+      if (undo === 'kept-changed') throw new Refusal(`${why}, and "${fromRel}" was then replaced or removed; the file it named is kept as "${toRel}", and nothing was moved back.`);
+      if (undo === 'changed') {
+        written?.delete('rename');
+        throw new Refusal(`${why}, and "${toRel}" was then replaced or removed; whatever stands there is left, and nothing was moved.`);
+      }
+      throw new Refusal(bound ? `${why}; nothing was moved.` : `${why}; the name this run made there was removed again, and nothing outside it was touched.`);
     }
     at('unlink', fromRel);
-    if (!dropName(from, b, at, join(root, fromRel))) throw new Refusal(`"${fromRel}" was replaced while this ran; both files are kept, the moved one as "${toRel}".`);
+    const drop = dropName(from, b, to, at, join(root, fromRel), join(root, toRel));
+    if (drop === 'changed') throw new Refusal(`"${fromRel}" was replaced or removed while this ran; whatever stands there is left, and the moved file is kept as "${toRel}".`);
+    if (drop === 'kept-changed') {
+      written?.delete('rename');
+      throw new Refusal(`"${toRel}" was replaced or removed while this ran; whatever stands there is left, and "${fromRel}" was put back — nothing was moved.`);
+    }
   });
 }
 
 /**
  * Remove the leaf name `name` (inside a bound folder) only while it names the
- * file `inode` (an lstat) — judged on a PRIVATE name it was first moved to
- * (atomic: whatever held the name at that instant), so no file renamed onto it
- * meanwhile can lose its name. Anything else is put back, never over a newer
- * file. Returns whether the name was removed; the bytes always stay under
- * their other name. `label` is what the test seam is told.
+ * file `inode` (an lstat) AND its other name `kept` still does — judged on a
+ * PRIVATE name it was first moved to (atomic: whatever held the name at that
+ * instant), so no file renamed onto either name meanwhile, nor the file
+ * itself, can lose its last name. Anything else is put back, never over a
+ * newer file. Returns 'dropped'; 'changed' (`name` held another file, put
+ * back); or 'kept-changed' (`kept` was replaced or removed: the file is put
+ * back at `name`). `label`/`keptLabel` are what the test seam is told.
  */
-function dropName(name, inode, at, label) {
+function dropName(name, inode, kept, at, label, keptLabel) {
   const aside = `.${name}.dropping-${randomUUID()}`;
   try {
     renameSync(name, aside);
   } catch (err) {
-    if (err?.code === 'ENOENT') return false;
+    if (err?.code === 'ENOENT') return 'changed';
     throw err;
   }
   at('judge-drop', label);
   if (!same(lstatSync(aside), inode)) {
-    putBack('.', name, aside);
-    return false;
+    putBack('.', name, aside, at, label);
+    return 'changed';
   }
-  rmSync(aside);
-  return true;
+  if (unlinkKeeping(aside, kept, at, keptLabel)) return 'dropped';
+  putBack('.', name, aside, at, label);
+  return 'kept-changed';
 }
 
 /** Thrown by the test seam to stand in for a process killed mid-apply. */
@@ -829,9 +885,9 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
         const [from, to] = [r.from, r.to].map((rel) => rel.split('/')[1]);
         inFolder(root, r.from.split('/')[0], (stillBound) => {
           const kept = lstatOrNull(from);
-          if (!stillBound() || !same(kept, lstatOrNull(to)) || !dropName(to, kept, ctx.at, join(root, r.to))) {
-            throw new Refusal(`"${r.to}" changed while this ran; it is left as it is, and nothing was put back there.`);
-          }
+          const drop = stillBound() && same(kept, lstatOrNull(to)) ? dropName(to, kept, from, ctx.at, join(root, r.to), join(root, r.from)) : 'changed';
+          if (drop === 'kept-changed') throw new Refusal(`"${r.from}" was replaced or removed while this ran; the bytes stay as "${r.to}", and nothing was put back.`);
+          if (drop !== 'dropped') throw new Refusal(`"${r.to}" changed while this ran; it is left as it is, and nothing was put back there.`);
         });
       });
     } else if (!(fromSt?.isFile() && !toSt)) {
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index a7b7dc1fca5c9a1915ce294822dd180faa3895a3..075cc4664d7915f497533b3e9abcb05ca31689a4 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -1,6 +1,6 @@
 import { execFile } from 'node:child_process';
 import { createHash } from 'node:crypto';
-import { closeSync, existsSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
+import { chmodSync, closeSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
 import { tmpdir } from 'node:os';
 import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
@@ -917,6 +917,83 @@ describe('maintaining the Setar archive', () => {
         expect(await y.back()).toMatchObject({ ok: true });
         expect([sha(readFileSync(y.at(A))), existsSync(y.at(B))]).toEqual([yBytes, false]);
         for (const x of [f, u, v, g, h, w, y]) expect(leftovers(x)).toEqual([]);
+        // The OTHER name — the one a drop leaves the file under — replaced or removed at the judgement, or
+        // between the judgement and the unlink: the file never loses its last name. It goes back to the
+        // name being dropped (from the still-open file if its name was already gone), the run refuses, and
+        // says only what is true: a move's final drop, its judged-failure undo (the concurrent in-place
+        // bytes kept), a rollback's reverse move, and a stopped move's recovery alike.
+        for (const point of ['judge-drop', 'unlink-aside'] as const) {
+          for (const other of ['replace', 'remove'] as const) {
+            const tag = `${point} ${other}`;
+            type Box = ReturnType<typeof box>;
+            const hit = (x: Box, rel: string) => (other === 'replace' ? swapIn(x.at(rel), `theirs at ${rel}`) : () => rmSync(x.at(rel)));
+            const stands = (x: Box, rel: string) => (existsSync(x.at(rel)) ? readFileSync(x.at(rel), 'utf8') : null);
+            const theirs = (rel: string) => (other === 'replace' ? `theirs at ${rel}` : null);
+            /** The seam: at the drop's judgement of `dropped`, or just before the unlink judged against `kept`. */
+            const seam = (x: Box, dropped: string, kept: string, ...before: [string, string, () => void][]) =>
+              when(...before, point === 'judge-drop' ? ['judge-drop', x.at(dropped), hit(x, kept)] : ['unlink-aside', x.at(kept), hit(x, kept)]);
+            const fw = box();
+            const fwBytes = sha(readFileSync(fw.at(A)));
+            const fwDecl = declarations(fw.root);
+            const fwIno = lstatSync(fw.at(A)).ino;
+            chmodSync(fw.at(A), 0o640);
+            utimesSync(fw.at(A), 1_700_000_000, 1_700_000_000);
+            await expect(fw.go(MOVE, { at: seam(fw, A, B) }), tag).rejects.toThrow(/was replaced or removed while this ran; whatever stands there is left, and .* was put back — nothing was moved.*everything it changed was put back/s);
+            expect([sha(readFileSync(fw.at(A))), stands(fw, B), declarations(fw.root), fw.j().status, leftovers(fw)], tag).toEqual([fwBytes, theirs(B), fwDecl, 'rolled-back', []]);
+            // Caught before the unlink, it is the original file itself; only a name lost IN that instant is a copy of its bytes.
+            expect(lstatSync(fw.at(A)).ino === fwIno, tag).toBe(point === 'judge-drop');
+            expect([lstatSync(fw.at(A)).mode & 0o7777, lstatSync(fw.at(A)).mtimeMs], tag).toEqual([0o640, 1_700_000_000_000]);
+            const un = box();
+            const inPlace = sha(Buffer.alloc(500, 7));
+            await expect(un.go(MOVE, { at: seam(un, B, A, ['link', B, () => writeFileSync(un.at(A), Buffer.alloc(500, 7))]) }), tag).rejects.toThrow(/does not hold the bytes this change recorded.*was then replaced or removed; the file it named is kept as .*could not be put back automatically/s);
+            expect([sha(readFileSync(un.at(B))), stands(un, A), un.j().status, leftovers(un)], tag).toEqual([inPlace, theirs(A), 'prepared', []]);
+            const rv = box();
+            const rvBytes = sha(readFileSync(rv.at(A)));
+            expect(await rv.go(MOVE)).toMatchObject({ ok: true });
+            await expect(rv.back({ at: seam(rv, B, A) }), tag).rejects.toThrow(/was replaced or removed while this ran; whatever stands there is left, and .* was put back — nothing was moved/);
+            expect([sha(readFileSync(rv.at(B))), stands(rv, A), leftovers(rv)], tag).toEqual([rvBytes, theirs(A), []]);
+            const st = box();
+            const stBytes = sha(readFileSync(st.at(A)));
+            await expect(st.go(MOVE, { at: when(['unlink', A, cut]) })).rejects.toThrow(/power cut/);
+            await expect(st.back({ at: seam(st, B, A) }), tag).rejects.toThrow(/was replaced or removed while this ran; the bytes stay as .*nothing was put back/);
+            expect([sha(readFileSync(st.at(B))), stands(st, A), leftovers(st)], tag).toEqual([stBytes, theirs(A), []]);
+          }
+        }
+        // The name being DROPPED removed just before its drop: the moved file keeps its new name, said as such.
+        {
+          const dr = box();
+          const drBytes = sha(readFileSync(dr.at(A)));
+          await expect(dr.go(MOVE, { at: when(['unlink', A, () => rmSync(dr.at(A))]) })).rejects.toThrow(/was replaced or removed while this ran; whatever stands there is left, and the moved file is kept as/);
+          expect([existsSync(dr.at(B)) ? sha(readFileSync(dr.at(B))) : sha(readFileSync(dr.at(A))), leftovers(dr)]).toEqual([drBytes, []]);
+        }
+        // A PUT-BACK's own link-to-unlink interval: the name it just restored replaced or removed again
+        // before its private name goes — the restored file keeps that private name (its bytes from the
+        // still-open file if the name was already gone), named in the refusal; nothing is lost.
+        for (const point of ['put-back', 'unlink-aside'] as const) {
+          for (const other of ['replace', 'remove'] as const) {
+            const tag = `${point} ${other}`;
+            const d = box();
+            const again = other === 'replace' ? replaceWith(d.at('PIECES.csv'), 'a third save\n') : () => rmSync(d.at('PIECES.csv'));
+            await expect(d.go(REG, { at: when(['capture', 'PIECES.csv', replaceWith(d.at('PIECES.csv'), 'their save\n')], [point, 'PIECES.csv', again]) }), tag).rejects.toThrow(/PIECES\.csv was replaced or removed while this ran;.*kept beside it as \.PIECES\.csv\.captured-/s);
+            const set = hidden(d.root, '.PIECES.csv.captured-');
+            expect([existsSync(d.at('PIECES.csv')) ? readFileSync(d.at('PIECES.csv'), 'utf8') : null, set.map((n) => readFileSync(d.at(n), 'utf8'))], tag).toEqual([other === 'replace' ? 'a third save\n' : null, ['their save\n']]);
+            // The same interval after an install that failed for its own reason (its temp gone).
+            const ie = box();
+            const dropTemp = () => rmSync(ie.at(hidden(ie.root, '.PIECES.csv.maintenance-')[0]!));
+            const ieAgain = other === 'replace' ? replaceWith(ie.at('PIECES.csv'), 'a third save\n') : () => rmSync(ie.at('PIECES.csv'));
+            const ieDecl = declarations(ie.root).pieces;
+            await expect(ie.go(REG, { at: when(['install', 'PIECES.csv', dropTemp], [point, 'PIECES.csv', ieAgain]) }), tag).rejects.toThrow(/PIECES\.csv was replaced or removed while this ran;.*kept beside it as \.PIECES\.csv\.captured-/s);
+            expect([existsSync(ie.at('PIECES.csv')) ? readFileSync(ie.at('PIECES.csv'), 'utf8') : null, hidden(ie.root, '.PIECES.csv.captured-').map((n) => readFileSync(ie.at(n), 'utf8'))], tag).toEqual([other === 'replace' ? 'a third save\n' : null, [ieDecl]]);
+            const m = box();
+            const mBytes = sha(readFileSync(m.at(A)));
+            const third = other === 'replace' ? swapIn(m.at(A), 'a third file') : () => rmSync(m.at(A));
+            await expect(m.go(MOVE, { at: when(['unlink', A, swapIn(m.at(A), 'theirs at the old name')], [point, m.at(A), third]) }), tag).rejects.toThrow(/was replaced or removed while this ran;.*kept beside it as \..*\.dropping-/s);
+            // Theirs keeps its private name; the moved file stays as B — or, its old name free, is moved back.
+            const shaOf = (rel: string) => (existsSync(m.at(rel)) ? sha(readFileSync(m.at(rel))) : null);
+            expect([shaOf(A), shaOf(B)], tag).toEqual(other === 'replace' ? [sha('a third file'), mBytes] : [mBytes, null]);
+            expect(leftovers(m).map((n) => readFileSync(m.at(n), 'utf8')), tag).toEqual(['theirs at the old name']);
+          }
+        }
         // A run stopped with a declaration SET ASIDE: refused, named, put back by hand, then rolled back exactly.
         const t = box();
         const tDecl = declarations(t.root);
@@ -1280,6 +1357,44 @@ describe('maintaining the Setar archive', () => {
         expect(seen.every((x) => (x as { intended: boolean; scanned: boolean; publication: string }).intended && (x as { scanned: boolean }).scanned && (x as { publication: string }).publication === 'pending')).toBe(true);
         expect(seen.map((x) => (x as { status: string }).status)).toEqual(['applied', 'applied', ...Array(6).fill('applied'), 'rolled-back', 'rolled-back']);
       }
+      // A SCHEDULED write still unanswered when a newer run's FIRST branch read fails: nothing proves the
+      // branch stayed as it was, so the run is unconfirmed (open in its journal), never "published nothing"
+      // — for a pending update, a pending create, and an intent record that cannot be read.
+      for (const variant of ['update', 'create', 'unknown'] as const) {
+        const k = box();
+        const t = k.g.transport as Record<string, (...a: unknown[]) => Promise<unknown>>;
+        if (variant === 'update') expect(await k.go(REG)).toMatchObject({ ok: true, status: 'published' });
+        const lost = async () => Promise.reject(new TypeError('fetch failed: the response was lost'));
+        if (variant === 'unknown') writeFileSync(k.g.shared.intent, 'not json');
+        else {
+          await expect(publishIndex({ transport: { ...t, updateRef: lost, createRef: lost }, indexText: '{"scheduled":1}\n', intent: k.g.shared.intent })).rejects.not.toHaveProperty('nothingPublished');
+        }
+        const pending = readFileSync(k.g.shared.intent, 'utf8');
+        const before = k.g.published();
+        const readFails = async (text: string, hash: string, holder: string) =>
+          publishIndex({ transport: { ...t, getRef: async () => Promise.reject(new Error('GitHub refused getRef (HTTP 500)')) }, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(k.root, holder), intent: k.g.shared.intent });
+        const r = await k.go(variant === 'update' ? { kind: 'register', piece: 'یکی-دیگر' } : REG, { publish: readFails });
+        expect(r.message, variant).toMatch(/could not be confirmed .*may already be published/s);
+        expect(r.message, variant).not.toMatch(/as it was|published nothing/);
+        const H = scanToIndex(k.root).contentHash;
+        expect([k.j().publication, k.j().unresolved, readFileSync(k.g.shared.intent, 'utf8'), k.g.published()], variant).toEqual(['unknown', [H], pending, before]);
+        await expect(k.go({ kind: 'register', piece: 'یکی-دیگر-باز' }), variant).rejects.toThrow(/Run `retry`/);
+        // Retry and Rollback share the classification: still open, never "as it was".
+        const retried = await k.again({ publish: readFails });
+        expect([retried.message, k.j().publication, k.j().unresolved], variant).toEqual([expect.not.stringMatching(/as it was|published nothing/), 'unknown', [H]]);
+        const rolled = await k.back({ publish: readFails });
+        const H0 = scanToIndex(k.root).contentHash;
+        expect([rolled.message, k.j().status, k.j().publication, k.j().unresolved], variant).toEqual([expect.not.stringMatching(/as it was|published nothing/), 'rolled-back', 'unknown', [H, H0]]);
+        // …and the uncertainty was real: the scheduled write lands after all.
+        if (variant !== 'unknown') {
+          const [{ parent, commit }] = JSON.parse(pending) as { parent: string | null; commit: string }[];
+          expect(await (parent ? t.updateRef!(SOURCE_INDEX_BRANCH, commit, parent) : t.createRef!(SOURCE_INDEX_BRANCH, commit))).toBe('ok');
+          expect(k.g.published(), variant).toBe('{"scheduled":1}\n');
+        }
+        // Only a positive observation closes it: the retry publishes over whatever landed, and retires the record.
+        expect(await k.again({ publish: k.g.publish }), variant).toMatchObject({ ok: true });
+        expect([k.j().publication, k.j().unresolved, JSON.parse(k.g.published()!).contentHash, existsSync(k.g.shared.intent)], variant).toEqual(['published', [], H0, false]);
+      }
     } finally {
       for (const b of boxes) rmSync(b, { recursive: true, force: true });
     }
```

**Paths the rework touched:**

- `docs/setar-archive.md`
- `scripts/publish-setar-index.mjs`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
235d4b3 Setar maintenance never drops a file's last name; a failed first branch read stays unconfirmed

Family maintenance-recovery-preserves-concurrent-state.
Invariant: no private name of this tool is removed unless the file's other
name still holds it at the instant after the unlink, and a refusal says only
what is now true. One choke point, unlinkKeeping: it judges the retained
counterpart (same inode, or same link target) before the unlink, holds the
file open, and judges again after; a counterpart replaced or removed in that
instant gets the bytes written back (mode and times kept) under the private
name. dropName now judges both the dropped name and the kept counterpart and
reports dropped / changed / kept-changed; putBack routes its own unlink
through the same check (new put-back seam between link and unlink).
Consumers, each fixed and tested in the ac-2 test (judge-drop and
unlink-aside seams, counterpart replaced and removed):
- moveExact final drop (Apply forward, Rollback reverse): fixed; original
  put back at the old name, rename dropped from `written` so the automatic
  put-back restores the declarations honestly.
- moveExact judged-failure undo: fixed; concurrent in-place bytes kept at
  the new name, refusal says so, journal stays prepared.
- restore of a move stopped between its names (Rollback): fixed.
- putBack from replaceDeclaration mismatch and install-error branches, and
  from dropName mismatch: fixed; link-to-unlink interval tested for each.
- Retry: takes the lock, drops no media; checked clean by inspection.
- The new declaration temp's removal and keep() (rename, never unlink):
  checked clean; no other unlink of archive data exists in the tool.
Refusal wording now covers removal as well as replacement.

Family maintenance-publication-matches-validated-index.
Invariant: until a branch head is observed, every recorded unanswered
publication write may still land, so a failure before that observation is
never "nothing published". publishInd
… (truncated)
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
