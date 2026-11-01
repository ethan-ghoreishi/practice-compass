---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 40654aa66522d370681b21d8814b44881da5d6b9
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: lock creation, ownership checks and cleanup still trust
      replaceable child paths beneath the bound archive."
    counterexample: "HEAD 3e59e7a64f0e42eb1c81ef83aab3b496cc277e10; patch
      40654aa66522d370681b21d8814b44881da5d6b9. Invariant: every lock operation
      must address the authorised directory and exact owned or approved object.
      Production-body probes on an in-memory filesystem reproduce seven failing
      scenarios: operator release sees partial.json=A, then its release seam
      moves the lock folder and substitutes a symlink to an external folder
      containing A; removeLockEntry deletes the external entry, returns
      released:true and leaves the original lock. assertOwner accepts token
      files through symlinked or replacement real lock folders; unlock deletes
      their replacement files. Replacing only the token leaf on a stable parent
      also makes unlock delete another writer's file. lock writes outside the
      archive when its private directory becomes a symlink before the token
      write; its error cleanup recursively removes a replacement private
      directory containing another writer's file. readArchiveLock follows a lock
      directory replaced after its directory lstat, and archiveConfirmation
      accepts the external copied token. Instances:
      setar-archive-maintenance.mjs lock 405-414, assertOwner 432-435,
      unlock/release 448-465, removeLockEntry/releaseBound 480-547;
      publish-setar-index.mjs readArchiveLock 265-295 and archiveConfirmation
      313-324. Consumers swept: Apply, automatic recovery, Rollback including
      stopped moves, Retry, operator release, maintenance and scheduled
      publishers. Checked clean: bound archive-root replacement,
      declaration/session-media directory binding, cross-run rootIno refusal,
      stable release, changed operator-release leaves on stable parents, and
      publisher refusal when the symlink already exists before inspection. Four
      dynamic control scenarios pass. Extend the SAME exact ac-2 title, setar
      guided maintenance is reversible stale safe and idempotent without
      altering media, across lock-parent/private-directory replacement,
      token-leaf replacement, creation-error cleanup and publisher read races.
      The attempt-only publication wording family is closed; eight focused
      publishStep probes preserve unknown state and prior unresolved hashes. No
      files or records changed; no wholesale Check rerun, live NAS, GitHub
      mutation or OS crash proof."
createdAt: 2026-11-01T02:44:44.264Z
sealedAt: 2026-11-01T02:51:42.976Z
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
- **Diff patch-id:** `40654aa66522d370681b21d8814b44881da5d6b9`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: archive mutations and lock release still trust replaceable pathnames rather than the exact authorised objects.
  _counterexample:_ HEAD d197d4a5078ba74cd089915083f0d9d5fd206672; patch 5872c7256acee8636b2119d621a7f9a281115999. Production function bodies on an in-memory filesystem reproduce: after assertOwner, retarget the archive pathname to an external copy. replaceDeclaration(text=null), at capture, removes the external RENAME-LOG.csv public name and returns success while the real log remains; moveExact, before inFolder selects its directory, renames external media and returns success. rootId hashes an earlier resolved pathname, not a directory binding. Instances: replaceDeclaration 520-563 via Apply registry/log 805/807 and restore 862, including automatic recovery 816 and Rollback 934; moveExact 601-636 via Apply 809 and restore reverse move 874; stopped-move recovery 879-885 also selects its directory after the owner check. Separately, production readArchiveLock/releaseLock delete replacement B after record A was approved, for both a legacy lock file and a foreign/partial folder entry reused at the same name, at 408. Checked clean: token-specific release/unlock on a stable root, session-folder replacement after binding, declaration comparison/refusal, private leftovers, Retry media non-mutation, and original-inode retention in 30 focused retireKeeping failure cases. Bind archive mutations and lock housekeeping to the authorised directory and captured object. Extend the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, across all these consumers and parent/entry replacements. Limits: read-only virtual filesystem probes; no live NAS or OS crash test.
- **maintenance-publication-matches-validated-index** — P2: current operator instructions still promise that failed publication leaves the previous index published.
  _counterexample:_ Same HEAD and patch. Invariant: failure proves only this attempt; an unanswered earlier or scheduled write can still land. Remaining current claims: docs/setar-archive.md:223-226, :314-315, :645; docs/nas-topology.md:308-310. A scheduled ref update loses its answer, newer maintenance publication fails before intent inspection or because sudo cannot run, then the scheduled update lands. Those failures cannot establish an unchanged branch. Reconcile every current instruction with the attempt-only rule. Runtime consumers checked clean: shared Apply/Retry/Rollback publishStep, legacy failed-state normalisation, expected-hash and seat admission, first-ref failure, intent retention/protective writes, CLI exit mapping, runner failures and publishWithRunner evidence handling. Six production publishStep probes retained unknown state and prior hashes. Keep the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, with its scheduled-predecessor/pre-intent matrix. Superseded dated DECISIONS entries are historical. No live GitHub mutation or wholesale Check rerun.

**What changed since the previously reviewed head:**

````diff
diff --git a/docs/nas-topology.md b/docs/nas-topology.md
index 425ae28372fd401db05019b638d7a01faad58424..50d0bafffb01d50dce03beb398c51668ad71af35 100644
--- a/docs/nas-topology.md
+++ b/docs/nas-topology.md
@@ -306,8 +306,10 @@ rename below.
   `synoacltool -enforce-inherit` on each file.
 - **Sudo.** Delete `/etc/sudoers.d/practice-compass-maint`.
   - A DSM update may remove it too. The failure is safe: the job never runs,
-    the last good index stays published, and an apply ends `publish-failed`
-    (reported as unconfirmed). Reinstall the one line and run `… retry`.
+    so that attempt publishes nothing, and an apply ends `publish-failed`
+    (reported as unconfirmed — an earlier or scheduled write may still land,
+    so the branch is not known to be unchanged). Reinstall the one line and
+    run `… retry`.
 
 **Still broader than needed (recorded, not changed):** through the runtime
 share's inherited ACE, `setar-indexer` can write its own scripts and
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 5843d90a9a77dcdf6beb7c742737e4033c9389c3..61ceca2193530e965d196d5afbad81a845614827 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -220,10 +220,13 @@ target is refused before a request is made.
 - The branch ref advances **non-force** from the commit that was read, with
   `expected_head_sha`, so a racing publisher loses the update rather than
   overwriting it; the retry re-reads before deciding anything.
-- An interruption before the ref advances leaves the previous index published —
-  a blob and a commit nothing points at are invisible. Such a failure exits 4.
-  A failure of the ref write itself (a lost response, a 5xx) may have landed:
-  exit 1, said as unknown, and a rerun makes no commit if it did.
+- An interruption before the ref advances means THIS attempt moved nothing — a
+  blob and a commit nothing points at are invisible. Such a failure exits 4. It
+  proves nothing about the branch: an earlier or scheduled write whose answer
+  was lost may still land, so what the branch holds stays unconfirmed until it
+  is observed (`retry`). A failure of the ref write itself (a lost response, a
+  5xx) may have landed: exit 1, said as unknown, and a rerun makes no commit if
+  it did.
 - Error messages are built from the HTTP status and the endpoint name only.
   **No token, no repository URL and no archive path ever reaches a log.**
 
@@ -311,8 +314,9 @@ with `main` unchanged, and the behaviour when the token is revoked.
 Disable the scheduled task. The app keeps the source graph it last accepted and
 goes on working offline from it. To go back to an earlier index,
 `git push --force-with-lease` an earlier `source-index` commit. Neither touches
-the app's own data on `main`. Revoking the token stops publication and leaves the
-last good index exactly where it is.
+the app's own data on `main`. Revoking the token stops every LATER request; a
+write already sent may still land, so the branch is whatever GitHub shows, read
+there before deciding anything.
 
 ---
 
@@ -642,7 +646,7 @@ $M rename --from session-40-…/old.mp4 --to session-40-…/new.mp4
 #   … each prints "Preview <id>"; the same command with --apply <id> then does it all:
 #   private copy of both declarations → edit → validate (the scanner's own grammar)
 #   → scratch scan → publish through run-setar-index.sh
-$M retry      # publication failed: the archive is valid, the old index still published — publish again
+$M retry      # publication unconfirmed: the archive is valid, the branch unknown (an earlier or scheduled write may land) — publish again
 $M rollback   # put the last change back from its private copy and publish that
 $M release-lock [--record <id>]   # a lock no run holds: shown, then released by its exact record
 ```
@@ -680,8 +684,16 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   holding the file open keeps writing into a named file. The hidden names
   are the same file, no extra bytes; the operator may delete them once
   nothing needs them. A
-  rename stays inside its session folder, and every media write runs inside
-  that folder bound by inode, so a folder swapped for a link meanwhile cannot
+  rename stays inside its session folder. The ARCHIVE itself is bound too:
+  each run records the directory `--root` names when it starts (its inode and
+  real path) and does every read-then-write with its working directory on that
+  directory, by bare names — the lock, the declarations, the session folder a
+  move selects, the media — so the archive moved away and another folder (even
+  an exact copy, lock and all) put at its path is never written; re-entering
+  is proved by inode, else the run refuses and its lock stays in the real
+  archive for `release-lock`. The journal records that directory's inode, so
+  a later `rollback` or `retry` refuses another folder at the path too. Every media write runs inside its session folder
+  bound by inode the same way, so a folder swapped for a link meanwhile cannot
   carry a write outside the archive. An edit, deletion or new file from
   anyone else at that instant is kept and the run refuses. A failure after
   the archive changed, and `rollback`, put back only what THIS change wrote —
@@ -699,7 +711,11 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
 - **One owner per archive.** The lock is one dot-folder in the archive's root
   holding one `<run>.json`, shared by every `--state` folder, and every
   publisher checks it; a release removes only that exact record, so it never
-  takes a newer run's lock. A lock is
+  takes a newer run's lock: each entry the operator saw is first moved to a
+  private `.releasing-…` name and judged there against what was shown, removed
+  only if it is that, else linked back (never over anything) or kept and
+  named — a replacement at the same name, legacy lock file or folder entry
+  alike, is never removed. A lock is
   never adopted on a guess about a process: a run that finds one refuses and
   names it. If nothing is running (check `ps`), `release-lock` shows the
   record and `release-lock --record <id>` releases exactly that one, in any
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index e06d7b8e6250ce8986ee6972977927e8f970b6a8..246b8de5fe65f396dd27865a155c9ebbf3badbed 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -256,10 +256,11 @@ const digestOf = (bytes) => createHash('sha256').update(bytes).digest('hex');
 
 /**
  * The lock as it stands: null (absent, or an empty folder a release left), its
- * record `{ token, pid, host, since, digest, names }`, or `{ unreadable }` with
+ * record `{ token, pid, host, since, digest, entries }`, or `{ unreadable }` with
  * a digest of what is there when it is not exactly one record in this tool's
- * form — never guessed into one. `names` are the entries a release removes;
- * null for something at the lock's name that is not a folder.
+ * form — never guessed into one. `entries` are what a release may remove, each
+ * `[path from the root, lockEntryDigest]`: the folder's entries, or the lock's
+ * own name when it is not a folder (an earlier version's file).
  */
 export function readArchiveLock(root) {
   const p = join(root, ARCHIVE_LOCK);
@@ -271,7 +272,7 @@ export function readArchiveLock(root) {
     throw err;
   }
   if (!st.isDirectory()) {
-    return { unreadable: true, names: null, digest: digestOf(st.isFile() ? readFileSync(p) : st.isSymbolicLink() ? `link:${readlinkSync(p)}` : `${st.mode}`) };
+    return { unreadable: true, entries: [[ARCHIVE_LOCK, lockEntryDigest(p)]], digest: digestOf(st.isFile() ? readFileSync(p) : st.isSymbolicLink() ? `link:${readlinkSync(p)}` : `${st.mode}`) };
   }
   const names = readdirSync(p).sort();
   if (!names.length) return null;
@@ -280,17 +281,28 @@ export function readArchiveLock(root) {
     return [n, e.isFile() ? readFileSync(join(p, n)) : null];
   });
   const digest = digestOf(JSON.stringify(parts.map(([n, b]) => [n, b ? digestOf(b) : 'not a file'])));
+  const entries = parts.map(([n, b]) => [join(ARCHIVE_LOCK, n), b ? digestOf(b) : null]);
   if (parts.length === 1 && parts[0][1]) {
     try {
       const r = JSON.parse(parts[0][1].toString('utf8'));
       if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && names[0] === `${r.token}.json` && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
-        return { ...r, digest, names };
+        return { ...r, digest, entries };
       }
     } catch {
       // not a record: said as unreadable below
     }
   }
-  return { unreadable: true, digest, names };
+  return { unreadable: true, digest, entries };
+}
+
+/**
+ * What one lock entry IS, judged again after it is set aside: a file's bytes or
+ * a link's target, by digest (as the record's digest reads it); null for
+ * anything else, which is never judged and so never removed.
+ */
+export function lockEntryDigest(p) {
+  const st = lstatSync(p);
+  return st.isFile() ? digestOf(readFileSync(p)) : st.isSymbolicLink() ? digestOf(`link:${readlinkSync(p)}`) : null;
 }
 
 /**
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index 2ec6088f22d9a8156e8a2db15cea5041db4ecc13..9c2732cd224821b1d4c17953b83841d42a0fc242 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -51,7 +51,7 @@ import {
   readTable,
   writeIndexAtomically,
 } from './scan-setar-classes.mjs';
-import { ARCHIVE_LOCK, readArchiveLock } from './publish-setar-index.mjs';
+import { ARCHIVE_LOCK, lockEntryDigest, readArchiveLock } from './publish-setar-index.mjs';
 
 const REGISTRY = 'PIECES.csv';
 const LOG = 'RENAME-LOG.csv';
@@ -241,12 +241,12 @@ function finish(plan, registryText, logText) {
 
 // --- the private state folder -----------------------------------------------
 
-function stateDir(rootArg, stateArg) {
+function stateDir(arc, stateArg) {
   if (!stateArg) throw new Refusal('Give a private --state folder outside the archive; it holds the rollback copies.');
   const st = lstatOrNull(stateArg);
   if (!st?.isDirectory()) throw new Refusal('The --state folder must already exist as a real folder (a link is never written through).');
   const state = realpathSync.native(stateArg).normalize('NFC');
-  const root = realpathSync.native(resolve(rootArg)).normalize('NFC');
+  const root = arc.path.normalize('NFC');
   if (state === root || state.startsWith(root + sep)) throw new Refusal('The --state folder must be OUTSIDE the archive: rollback copies are private.');
   return state;
 }
@@ -258,8 +258,8 @@ const writeJournal = (state, j) => {
   renameSync(`${journalPath(state)}.tmp`, journalPath(state));
 };
 
-/** Which archive a --state folder serves: a digest, never the path itself. */
-const rootIdOf = (root) => sha(realpathSync.native(root).normalize('NFC'));
+/** Which archive a --state folder serves: a digest of the BOUND archive's real path (`bindArchive`), never the path itself. */
+const rootIdOf = (arc) => sha(arc.path.normalize('NFC'));
 
 /**
  * The journal, refused when it was written for another archive. One from an
@@ -274,7 +274,7 @@ const rootIdOf = (root) => sha(realpathSync.native(root).normalize('NFC'));
  * validated hashes of every attempt whose remote outcome is NOT known — kept
  * until a positive observation of the branch, never reset by a later failure.
  */
-function journalFor(state, root, recovering) {
+function journalFor(state, arc, recovering) {
   let j = readJournal(state);
   if (!j) return null;
   if (!j.rootId) {
@@ -283,7 +283,11 @@ function journalFor(state, root, recovering) {
     }
     return null;
   }
-  if (j.rootId !== rootIdOf(root)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
+  if (j.rootId !== rootIdOf(arc)) throw new Refusal('This --state folder belongs to another archive; nothing was changed. Use that archive’s own --state folder.');
+  // Across runs too, the archive is the DIRECTORY the change was made in, never whatever now stands at its path.
+  if (j.rootIno !== undefined && j.rootIno !== arc.ino) {
+    throw new Refusal('The folder at this archive’s path is not the one this change was made in (it was moved, or another folder put there); nothing was changed. Put the archive back where it was, then run this again.');
+  }
   // Earlier versions of this lane folded status and publication together; read them conservatively.
   if (j.status === 'published') j = { ...j, status: 'applied', publication: 'published' };
   else if (j.status === 'publish-failed') j = { ...j, status: 'applied', publication: 'unknown' };
@@ -297,6 +301,74 @@ function journalFor(state, root, recovering) {
   return { ...j, unresolved: j.unresolved ?? open };
 }
 
+// --- the archive, bound -------------------------------------------------------
+//
+// Node has no openat/linkat, and a pathname can be replaced at any instant: an
+// archive renamed away, another folder (an external copy) put at its path. So
+// the tool never writes THROUGH the archive's path. `bindArchive` records the
+// directory `--root` names when the run starts — its device and inode, and the
+// real path it had — and every read-then-write runs inside `inArchive`, with the
+// process's working directory ON that directory and every name a bare relative
+// one, resolved by the kernel against the directory itself. Entering is proved
+// by inode, never assumed: a path that names another folder now is refused, and
+// nothing more is done. A section never spans an `await` (another run in the
+// same process may move the working directory meanwhile).
+
+const statOrNull = (p) => {
+  try {
+    return statSync(p);
+  } catch {
+    return null;
+  }
+};
+
+/** THE authorised archive: what `root` names at this instant, by inode, with its real path. */
+export function bindArchive(root) {
+  const back = process.cwd();
+  process.chdir(root);
+  try {
+    // `ino` (exact, as text) is what a journal records across runs; never the device, which a remount may renumber.
+    return { path: realpathSync.native('.'), home: statSync('.'), ino: statSync('.', { bigint: true }).ino.toString() };
+  } finally {
+    process.chdir(back);
+  }
+}
+
+const movedRefusal = () => new Refusal('The archive folder was moved, or another folder put at its path, while this ran; nothing more was done in it. Put it back where it was, then run `rollback`.');
+
+/** The working directory IS the bound archive, and its recorded path still names it (the scanner reads through a path). */
+function ensureHome(arc) {
+  if (!same(statSync('.'), arc.home) || !same(statOrNull(arc.path), arc.home)) throw movedRefusal();
+}
+
+/** Into the bound archive by its recorded path, proved by inode, or refused. */
+function enter(arc) {
+  try {
+    process.chdir(arc.path);
+  } catch {
+    throw movedRefusal();
+  }
+  ensureHome(arc);
+}
+
+/** Run `fn` with the working directory on the bound archive; the caller's is restored after. */
+export function inArchive(arc, fn) {
+  const back = process.cwd();
+  try {
+    enter(arc);
+    return fn();
+  } finally {
+    process.chdir(back);
+  }
+}
+
+/** A test seam may start a nested run, which restores the working directory by path: it is proved unchanged after, or this run stops. */
+const guarded = (at) => (point, name) => {
+  const here = statSync('.');
+  at(point, name);
+  if (!same(statSync('.'), here)) throw new Refusal('The folder this run works in changed under it; nothing more was done.');
+};
+
 // --- who owns the archive ----------------------------------------------------
 //
 // ONE lock per ARCHIVE (`ARCHIVE_LOCK` in its root, which the scanner skips),
@@ -313,8 +385,8 @@ function journalFor(state, root, recovering) {
 const same = (a, b) => Boolean(a && b && a.ino === b.ino && a.dev === b.dev);
 const holderLine = (h) => (h.unreadable ? 'a record not in this tool’s form' : `run ${h.token.slice(0, 8)} (pid ${h.pid} on ${h.host}, since ${h.since})`);
 
-function lockRefusal(root) {
-  const held = readArchiveLock(root);
+function lockRefusal() {
+  const held = readArchiveLock('.');
   if (!held) return new Refusal('Another maintenance run was just releasing the archive’s lock; nothing was changed. Try again.');
   return new Refusal(
     `The archive’s maintenance lock is held by ${holderLine(held)}; nothing was changed. If that run is still going, wait for it. ` +
@@ -330,50 +402,107 @@ function lockRefusal(root) {
  * tool's private names: it is never recovered from automatically (a name proves
  * nothing about whose file it is); the run refuses and names it.
  */
-function lock(root) {
+function lock() {
   const token = randomUUID();
-  const tmp = join(root, `${ARCHIVE_LOCK}.${token}`);
+  const tmp = `${ARCHIVE_LOCK}.${token}`;
   mkdirSync(tmp);
   try {
     writeFileSync(join(tmp, `${token}.json`), `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
-    renameSync(tmp, join(root, ARCHIVE_LOCK));
+    renameSync(tmp, ARCHIVE_LOCK);
   } catch (err) {
     rmSync(tmp, { recursive: true, force: true }); // this run's own private folder
-    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal(root);
+    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal();
     throw err;
   }
   try {
-    refuseLeftovers(root);
+    refuseLeftovers();
   } catch (err) {
-    unlock(root, token);
+    unlock(token);
     throw err;
   }
   return token;
 }
 
-/** Every archive write first proves this run still holds the lock (an operator may have released it). */
-function assertOwner(root, owner) {
-  if (!lstatOrNull(join(root, ARCHIVE_LOCK, `${owner}.json`))?.isFile()) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
+/**
+ * Every archive write first proves it is IN the bound archive and this run
+ * still holds its lock (an operator may have released it). What follows works
+ * by bare names in that archive, so nothing done to its path after this check
+ * reaches the write. `owned` is the test seam, just after the check.
+ */
+function assertOwner({ arc, owner, at }, label) {
+  ensureHome(arc);
+  if (!lstatOrNull(join(ARCHIVE_LOCK, `${owner}.json`))?.isFile()) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
+  at('owned', label);
 }
 
 /** Remove the lock's folder once empty — never one holding anyone's record. */
-function dropEmptyLock(root) {
+function dropEmptyLock() {
   try {
-    rmdirSync(join(root, ARCHIVE_LOCK));
+    rmdirSync(ARCHIVE_LOCK);
   } catch {
     // not empty (a newer run holds it), already gone, or not a folder: left as it is
   }
 }
 
 /** Release THIS run's lock: only its own record, by its unique name; a newer run's is never touched. */
-function unlock(root, token) {
+function unlock(token) {
   try {
-    unlinkSync(join(root, ARCHIVE_LOCK, `${token}.json`));
+    unlinkSync(join(ARCHIVE_LOCK, `${token}.json`));
   } catch (err) {
     if (err?.code === 'ENOENT') return; // released by hand already
     throw err;
   }
-  dropEmptyLock(root);
+  dropEmptyLock();
+}
+
+/**
+ * A run's end: its own record released INSIDE the bound archive. When the
+ * archive can no longer be entered, the lock is left where it is — never
+ * removed through another folder — and the next run names it (release-lock).
+ */
+function release(arc, token) {
+  try {
+    inArchive(arc, () => unlock(token));
+  } catch (err) {
+    if (!(err instanceof Refusal)) throw err;
+  }
+}
+
+/**
+ * THE ONE PLACE a lock entry is removed: only while what stands at `p` is
+ * exactly what the operator saw (`digest`), judged on a private name it was
+ * first moved to — atomic: whatever held the name at that instant — so an
+ * entry put at that name since, or replacing it in the judgement's instant,
+ * is never removed: it is linked back, never over anything, or kept under the
+ * private name and said. Returns whether it removed the entry. `at` is the
+ * test seam, between the move and the judgement.
+ */
+function removeLockEntry(p, digest, at) {
+  const aside = `${p}.releasing-${randomUUID()}`;
+  try {
+    renameSync(p, aside);
+  } catch (err) {
+    if (err?.code === 'ENOENT') return false;
+    throw err;
+  }
+  at('judge-release', p);
+  const st = lstatSync(aside);
+  if ((st.isFile() || st.isSymbolicLink()) && lockEntryDigest(aside) === digest) {
+    unlinkSync(aside);
+    return true;
+  }
+  try {
+    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), p);
+    else if (st.isFile()) linkSync(aside, p);
+    else renameSync(aside, p); // a folder: replaces only an empty one, never anyone's record
+  } catch (err) {
+    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) {
+      throw new Refusal(`The lock changed while it was being released, and a newer one now stands; what had replaced the record you saw is kept as ${aside}. Nothing else was removed.`);
+    }
+    throw err;
+  }
+  if (!st.isDirectory()) unlinkSync(aside); // `p` holds that very file again
+  return false;
 }
 
 /**
@@ -384,8 +513,11 @@ function unlock(root, token) {
  * touched. `at` is the test seam.
  */
 export function releaseLock({ root: rootArg, record, at = noSeam }) {
-  const root = resolve(rootArg);
-  const held = readArchiveLock(root);
+  return inArchive(bindArchive(resolve(rootArg)), () => releaseBound(record, guarded(at)));
+}
+
+function releaseBound(record, at) {
+  const held = readArchiveLock('.');
   if (!held) return { released: false, lines: ['The archive holds no maintenance lock. Nothing to do.'] };
   const id = held.digest.slice(0, 16);
   if (!record) {
@@ -401,18 +533,17 @@ export function releaseLock({ root: rootArg, record, at = noSeam }) {
   const stale = () => new Refusal('The lock is not the record you saw (it changed or was released since); nothing was changed. Run release-lock again to see it.');
   if (record !== id) throw stale();
   at('release', ARCHIVE_LOCK);
+  // Only a file or a link can be judged again; anything else is the operator's to remove by hand.
+  if (held.entries.some(([, d]) => d === null)) {
+    throw new Refusal(`The lock holds something that is not a file (${held.entries.filter(([, d]) => d === null).map(([p]) => p).join(', ')}); nothing was changed. Once no run holds it, remove it by hand.`);
+  }
   let removed = 0;
-  // Something at the lock's name that is not a folder is never this version's lock: unlink removes only it.
-  for (const p of held.names ? held.names.map((n) => join(root, ARCHIVE_LOCK, n)) : [join(root, ARCHIVE_LOCK)]) {
-    try {
-      unlinkSync(p);
-      removed += 1;
-    } catch (err) {
-      if (err?.code !== 'ENOENT') throw err;
-    }
+  for (const [p, digest] of held.entries) if (removeLockEntry(p, digest, at)) removed += 1;
+  dropEmptyLock();
+  if (removed < held.entries.length) {
+    if (!removed) throw stale();
+    throw new Refusal(`Part of the lock changed since you saw it: ${removed} of its ${held.entries.length} entries, still exactly as shown, were removed; the rest is left as it is. Run release-lock again to see it.`);
   }
-  dropEmptyLock(root);
-  if (!removed) throw stale();
   return { released: true, lines: [`Released the lock of ${holderLine(held)}. The next run says what, if anything, it left to finish.`] };
 }
 
@@ -424,14 +555,16 @@ export function releaseLock({ root: rootArg, record, at = noSeam }) {
  * renames it back — never over anything — before running again; the journal's
  * own exact judgement (`rollback`) then finishes.
  */
-function refuseLeftovers(root) {
+function refuseLeftovers() {
   const found = [];
-  for (const d of readdirSync(root, { withFileTypes: true })) {
+  for (const d of readdirSync('.', { withFileTypes: true })) {
+    // A lock a release-lock set aside and stopped before judging — a file, a link or a newer run's folder alike.
+    if (d.name.startsWith(`${ARCHIVE_LOCK}.releasing-`)) found.push(`  mv -n '${d.name}' '${ARCHIVE_LOCK}'   (a lock record a release set aside; then run release-lock to see it)`);
     if (d.isFile() || d.isSymbolicLink()) {
       const m = /^\.(PIECES\.csv|RENAME-LOG\.csv)\.captured-/.exec(d.name);
       if (m) found.push(`  mv -n '${d.name}' '${m[1]}'   (if ${m[1]} is there, it is the copy a write replaced: mv -n '${d.name}' '${d.name.replace('.captured-', '.superseded-')}')`);
     } else if (d.isDirectory() && parseSessionFolderName(d.name)) {
-      for (const f of readdirSync(join(root, d.name))) {
+      for (const f of readdirSync(d.name)) {
         const m = /^\.(.+)\.dropping-/.exec(f);
         if (m) found.push(`  mv -n '${d.name}/${f}' '${d.name}/${m[1]}'   (if that name is taken, keep both and compare them)`);
       }
@@ -517,10 +650,12 @@ const keep = (aside) => {
  * it is recorded in `written`, so a later failure is judged, never skipped.
  * `at` is the test seam.
  */
-function replaceDeclaration({ root, owner, at, written }, name, text, expected, keepDir) {
-  assertOwner(root, owner);
-  const p = join(root, name);
-  const tmp = text === null ? null : join(root, `.${name}.maintenance-${randomUUID()}`);
+function replaceDeclaration(ctx, name, text, expected, keepDir) {
+  const { at, written } = ctx;
+  assertOwner(ctx, name);
+  // Bare names, inside the bound archive (`inArchive`): never its path again.
+  const p = name;
+  const tmp = text === null ? null : `.${name}.maintenance-${randomUUID()}`;
   if (tmp) writeFileSync(tmp, text, { flag: 'wx' });
   try {
     at('capture', name);
@@ -535,11 +670,11 @@ function replaceDeclaration({ root, owner, at, written }, name, text, expected,
       written?.add(name);
       return;
     }
-    const aside = capture(root, name);
+    const aside = capture('.', name);
     if (!aside) throw new Refusal(`${name} was removed while this ran; nothing was put in its place.`);
     const st = lstatSync(aside);
     if (!st.isFile() || sha(readFileSync(aside)) !== expected) {
-      putBack(root, name, aside, at);
+      putBack('.', name, aside, at);
       throw new Refusal(`${name} changed while this ran; it was left as the other edit made it.`);
     }
     at('install', name);
@@ -550,7 +685,7 @@ function replaceDeclaration({ root, owner, at, written }, name, text, expected,
       if (tmp && err?.code === 'EEXIST') {
         throw new Refusal(`${name} was written by someone else while this ran; theirs stands, and the one it replaced is kept beside it as ${basename(keep(aside))}.`);
       }
-      putBack(root, name, aside, at);
+      putBack('.', name, aside, at);
       throw err;
     }
     written?.add(name);
@@ -565,25 +700,34 @@ function replaceDeclaration({ root, owner, at, written }, name, text, expected,
 }
 
 /**
- * Run `fn(stillBound)` INSIDE one session folder, bound by its inode: it must
- * be a real folder directly in the archive at the instant this starts (never a
- * link), and every name `fn` touches is a bare leaf resolved against that
- * bound folder — never the folder's path again, so swapping the folder for a
- * link cannot carry a write outside. `stillBound()` says whether the folder
- * still stands at its name; `fn` asks before each step that commits anything.
+ * Run `fn(stillBound)` INSIDE one session folder of the BOUND archive
+ * (`inArchive`), bound by its inode: it must be a real folder directly in that
+ * archive at the instant this starts (never a link), selected by its bare name
+ * against the archive itself, and every name `fn` touches is a bare leaf
+ * resolved against that bound folder — never a path again, so swapping the
+ * folder for a link, or the archive's path for another folder, cannot carry a
+ * write outside. `stillBound()` says whether the folder still stands at its
+ * name in the bound archive, judged through its own `..`; `fn` asks before
+ * each step that commits anything. Back in the archive by `..`, proved, or by
+ * its recorded path, proved, or refused.
  */
 // ponytail: process-wide cwd, the only stdlib way to resolve names against a
 // bound directory (Node has no linkat/openat); the tool is single-threaded.
-function inFolder(root, folder, fn) {
-  const st = lstatOrNull(join(root, folder));
+function inFolder(arc, folder, fn) {
+  const st = lstatOrNull(folder);
   if (!st?.isDirectory()) throw new Refusal(`The folder "${folder}" is not a real folder in the archive (a link is never followed); nothing was moved.`);
-  const back = process.cwd();
-  process.chdir(join(root, folder));
+  process.chdir(folder);
   try {
     if (!same(statSync('.'), st)) throw new Refusal(`The folder "${folder}" changed while this ran; nothing was moved.`);
-    return fn(() => same(lstatOrNull(join(root, folder)), st));
+    // The entry first, then its parent: a folder moved out between the two is caught by the second.
+    return fn(() => same(lstatOrNull(join('..', folder)), st) && same(statSync('..'), arc.home));
   } finally {
-    process.chdir(back);
+    try {
+      process.chdir('..');
+    } catch {
+      // the folder is gone: back by the archive's path below
+    }
+    if (!same(statSync('.'), arc.home)) enter(arc);
   }
 }
 
@@ -598,10 +742,12 @@ function inFolder(root, folder, fn) {
  * name another writer replaces meanwhile, the file keeps the other, and the
  * refusal says which.
  */
-function moveExact({ root, owner, at, written }, fromRel, toRel, expect) {
-  assertOwner(root, owner);
+function moveExact(ctx, fromRel, toRel, expect) {
+  // `root` is the archive's given path, ONLY for what the test seam is told.
+  const { root, arc, at, written } = ctx;
+  assertOwner(ctx, fromRel);
   const [from, to] = [fromRel, toRel].map((rel) => rel.split('/')[1]);
-  inFolder(root, fromRel.split('/')[0], (stillBound) => {
+  inFolder(arc, fromRel.split('/')[0], (stillBound) => {
     if (!lstatOrNull(from)?.isFile()) throw new Refusal(`"${fromRel}" is not a regular file in the archive any more; nothing was moved.`);
     at('link', toRel);
     try {
@@ -671,14 +817,17 @@ export class Interrupted extends Error {}
 // --- validation, scan and publication ---------------------------------------
 
 /** Scan the archive now (the scanner's two-read rule), check the action took, write the scratch index. */
-function validateAndScan(root, state, action) {
-  const index = buildIndex(readStableSource(root));
+function validateAndScan(arc, state, action) {
+  // The scanner reads through a path (the working directory's): proved to be the bound archive before and after.
+  ensureHome(arc);
+  const index = buildIndex(readStableSource('.'));
+  ensureHome(arc);
   if (action?.kind === 'register' && !index.pieces.some((p) => p.key === action.piece)) throw new Error('The registry does not show the new piece after the edit.');
   if (action?.kind === 'roster' && !action.pieces.every((k) => index.pieces.find((p) => p.key === k)?.sessions.includes(action.session))) {
     throw new Error('The registry does not show the roster after the edit.');
   }
   const text = `${JSON.stringify(index, null, 2)}\n`;
-  writeIndexAtomically(join(state, 'scratch-index.json'), text, root);
+  writeIndexAtomically(join(state, 'scratch-index.json'), text, '.');
   return { index, text };
 }
 
@@ -756,76 +905,82 @@ async function publishStep(state, base, scanned, publish, token) {
  */
 export async function applyMaintenance({ root: rootArg, state: stateArg, action, previewId, publish, interruptAfter, at = noSeam }) {
   const root = resolve(rootArg);
-  const state = stateDir(root, stateArg);
-  const token = lock(root);
+  const arc = bindArchive(root);
+  const state = stateDir(arc, stateArg);
+  const token = inArchive(arc, lock);
   // What THIS run has changed in the archive, recorded at the instant of each change: its automatic put-back judges only those.
-  const ctx = { root, owner: token, at, written: new Set() };
+  const ctx = { root, arc, owner: token, at: guarded(at), written: new Set() };
   let interrupted = false;
   try {
-    const prior = journalFor(state, root);
-    if (prior?.status === 'prepared' || prior?.status === 'rolling-back') {
-      throw new Refusal(`An earlier ${prior.status === 'prepared' ? 'apply' : 'rollback'} did not finish. Run \`rollback\` first; nothing else was changed.`);
-    }
-    if (prior && !['published', 'not-needed'].includes(prior.publication)) {
-      throw new Refusal('An earlier change is not yet published (or its publication is unconfirmed). Run `retry` first; nothing else was changed.');
-    }
-    const plan = planMaintenance(root, action);
-    if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
-    if (plan.noop) return { ok: true, status: 'unchanged', lines: plan.lines };
-
-    // 1. The private rollback copy, BEFORE any edit.
-    const copy = join(state, `${new Date().toISOString().replace(/[:.]/g, '-')}-${plan.id}`);
-    mkdirSync(copy);
-    // BOTH declarations, whatever this action edits: a rollback restores the pair as it was.
-    const registryBefore = readDeclaration(root, REGISTRY, true);
-    const logBefore = readDeclaration(root, LOG, false);
-    const logWasPresent = logBefore !== null;
-    writeFileSync(join(copy, REGISTRY), registryBefore, { flag: 'wx' });
-    if (logWasPresent) writeFileSync(join(copy, LOG), logBefore, { flag: 'wx' });
-    // What this change WROTE, by digest: the only state a restore may undo.
-    const digest = (t) => (t === null ? null : sha(t));
-    const wrote = {
-      registry: { before: digest(registryBefore), after: digest(plan.registry ? plan.registry.after : registryBefore) },
-      log: { before: digest(logBefore), after: digest(plan.log ? plan.log.after : logBefore) },
-    };
-    const journal = { id: plan.id, action, copy, rootId: rootIdOf(root), logWasPresent, wrote, rename: plan.rename, lockToken: token, status: 'prepared' };
-    writeFileSync(join(copy, 'manifest.json'), `${JSON.stringify(journal, null, 2)}\n`);
-    writeJournal(state, journal);
-    const step = (name) => {
-      if (interruptAfter === name) {
-        interrupted = true;
-        throw new Interrupted(`interrupted after ${name}`);
+    // Everything up to publication, in ONE bound section (no await inside).
+    const ready = inArchive(arc, () => {
+      const prior = journalFor(state, arc);
+      if (prior?.status === 'prepared' || prior?.status === 'rolling-back') {
+        throw new Refusal(`An earlier ${prior.status === 'prepared' ? 'apply' : 'rollback'} did not finish. Run \`rollback\` first; nothing else was changed.`);
       }
-    };
-    step('copy');
+      if (prior && !['published', 'not-needed'].includes(prior.publication)) {
+        throw new Refusal('An earlier change is not yet published (or its publication is unconfirmed). Run `retry` first; nothing else was changed.');
+      }
+      const plan = planMaintenance('.', action);
+      if (plan.id !== previewId) throw new Refusal('The archive changed since that preview (or the preview is for something else). Preview again; nothing was changed.');
+      if (plan.noop) return { done: { ok: true, status: 'unchanged', lines: plan.lines } };
 
-    // 2. The edit, each write proved against what the plan saw. Any failure is put back, automatically.
-    let scanned;
-    try {
-      if (plan.registry) replaceDeclaration(ctx, REGISTRY, plan.registry.after, digest(plan.registry.before));
-      step('registry');
-      if (plan.log) replaceDeclaration(ctx, LOG, plan.log.after, digest(plan.log.before));
-      step('log');
-      if (plan.rename) moveExact(ctx, plan.rename.from, plan.rename.to, plan.rename);
-      step('rename');
-      at('scan', 'archive');
-      scanned = validateAndScan(root, state, action);
-    } catch (err) {
-      if (err instanceof Interrupted) throw err;
+      // 1. The private rollback copy, BEFORE any edit.
+      const copy = join(state, `${new Date().toISOString().replace(/[:.]/g, '-')}-${plan.id}`);
+      mkdirSync(copy);
+      // BOTH declarations, whatever this action edits: a rollback restores the pair as it was.
+      const registryBefore = readDeclaration('.', REGISTRY, true);
+      const logBefore = readDeclaration('.', LOG, false);
+      const logWasPresent = logBefore !== null;
+      writeFileSync(join(copy, REGISTRY), registryBefore, { flag: 'wx' });
+      if (logWasPresent) writeFileSync(join(copy, LOG), logBefore, { flag: 'wx' });
+      // What this change WROTE, by digest: the only state a restore may undo.
+      const digest = (t) => (t === null ? null : sha(t));
+      const wrote = {
+        registry: { before: digest(registryBefore), after: digest(plan.registry ? plan.registry.after : registryBefore) },
+        log: { before: digest(logBefore), after: digest(plan.log ? plan.log.after : logBefore) },
+      };
+      const journal = { id: plan.id, action, copy, rootId: rootIdOf(arc), rootIno: arc.ino, logWasPresent, wrote, rename: plan.rename, lockToken: token, status: 'prepared' };
+      writeFileSync(join(copy, 'manifest.json'), `${JSON.stringify(journal, null, 2)}\n`);
+      writeJournal(state, journal);
+      const step = (name) => {
+        if (interruptAfter === name) {
+          interrupted = true;
+          throw new Interrupted(`interrupted after ${name}`);
+        }
+      };
+      step('copy');
+
+      // 2. The edit, each write proved against what the plan saw. Any failure is put back, automatically.
       try {
-        restore({ ...ctx, written: null }, journal, undefined, ctx.written);
-      } catch (why) {
-        // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
-        throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
+        if (plan.registry) replaceDeclaration(ctx, REGISTRY, plan.registry.after, digest(plan.registry.before));
+        step('registry');
+        if (plan.log) replaceDeclaration(ctx, LOG, plan.log.after, digest(plan.log.before));
+        step('log');
+        if (plan.rename) moveExact(ctx, plan.rename.from, plan.rename.to, plan.rename);
+        step('rename');
+        ctx.at('scan', 'archive');
+        return { journal, scanned: validateAndScan(arc, state, action), lines: plan.lines };
+      } catch (err) {
+        if (err instanceof Interrupted) throw err;
+        try {
+          // Back in the bound archive first: a failure inside a session folder may have left the working directory anywhere.
+          enter(arc);
+          restore({ ...ctx, written: null }, journal, undefined, ctx.written);
+        } catch (why) {
+          // The journal stays `prepared`: `rollback` is still offered, never a false "put back".
+          throw new Refusal(`The change did not validate (${err.message}), and it could not be put back automatically (${why.message}). The private copy is kept; check, then run \`rollback\`.`);
+        }
+        // This run published nothing, and the archive is as it was before it.
+        writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed', unresolved: [] });
+        throw new Refusal(`The change did not validate (${err.message}); ${ctx.written.size ? 'everything it changed was put back from the private copy' : 'it had changed nothing in the archive'}.`);
       }
-      // This run published nothing, and the archive is as it was before it.
-      writeJournal(state, { ...journal, status: 'rolled-back', publication: 'not-needed', unresolved: [] });
-      throw new Refusal(`The change did not validate (${err.message}); ${ctx.written.size ? 'everything it changed was put back from the private copy' : 'it had changed nothing in the archive'}.`);
-    }
+    });
+    if (ready.done) return ready.done;
     // 3. Publication, through the existing job.
-    return { ...(await publishStep(state, { ...journal, status: 'applied', unresolved: [] }, scanned, publish, token)), lines: plan.lines };
+    return { ...(await publishStep(state, { ...ready.journal, status: 'applied', unresolved: [] }, ready.scanned, publish, token)), lines: ready.lines };
   } finally {
-    if (!interrupted) unlock(root, token);
+    if (!interrupted) release(arc, token);
   }
 }
 
@@ -839,9 +994,10 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
  * limits the judgement to what that run is known to have written.
  */
 function restore(ctx, journal, beforeWriting = () => {}, only = null) {
+  // Inside the bound archive (`inArchive`): every read and write by bare name; `root` only labels the test seam.
   const { root } = ctx;
   const current = (name) => {
-    const t = readDeclaration(root, name, false);
+    const t = readDeclaration('.', name, false);
     return t === null ? null : sha(t);
   };
   const steps = [];
@@ -863,10 +1019,10 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
   }
   const r = only && !only.has('rename') ? null : journal.rename;
   if (r) {
-    const fromSt = lstatOrNull(mediaPath(root, r.from));
-    const toSt = lstatOrNull(mediaPath(root, r.to));
+    const fromSt = lstatOrNull(mediaPath('.', r.from));
+    const toSt = lstatOrNull(mediaPath('.', r.to));
     const holds = (rel) => {
-      const bytes = readFileSync(mediaPath(root, rel));
+      const bytes = readFileSync(mediaPath('.', rel));
       return bytes.length === r.size && sha(bytes) === r.sha256;
     };
     if (!fromSt && toSt?.isFile()) {
@@ -875,9 +1031,9 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
     } else if (same(fromSt, toSt) && toSt.isFile()) {
       // A move stopped between its two names: the new name is the one to drop — the bytes stay at the old one, whatever they are.
       steps.unshift(() => {
-        assertOwner(root, ctx.owner);
+        assertOwner(ctx, r.to);
         const [from, to] = [r.from, r.to].map((rel) => rel.split('/')[1]);
-        inFolder(root, r.from.split('/')[0], (stillBound) => {
+        inFolder(ctx.arc, r.from.split('/')[0], (stillBound) => {
           const kept = lstatOrNull(from);
           const drop = stillBound() && same(kept, lstatOrNull(to)) ? dropName(to, kept, from, ctx.at, join(root, r.to), join(root, r.from)) : 'changed';
           if (drop === 'kept-changed') throw new Refusal(`"${r.from}" was replaced or removed while this ran; the bytes stay as "${r.to}", and nothing was put back.`);
@@ -894,18 +1050,21 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
 
 /** Validate, scan and publish again from the retained state — after a failed, unconfirmed or interrupted publication. */
 export async function retryMaintenance({ root: rootArg, state: stateArg, publish }) {
-  const root = resolve(rootArg);
-  const state = stateDir(root, stateArg);
-  const token = lock(root);
+  const arc = bindArchive(resolve(rootArg));
+  const state = stateDir(arc, stateArg);
+  const token = inArchive(arc, lock);
   try {
-    const journal = journalFor(state, root, true);
-    if (!journal) throw new Refusal('Nothing has been applied here yet.');
-    if (journal.status === 'prepared' || journal.status === 'rolling-back') {
-      throw new Refusal(`The last ${journal.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
-    }
-    return await publishStep(state, { ...journal, lockToken: token }, validateAndScan(root, state, null), publish, token);
+    const [journal, scanned] = inArchive(arc, () => {
+      const j = journalFor(state, arc, true);
+      if (!j) throw new Refusal('Nothing has been applied here yet.');
+      if (j.status === 'prepared' || j.status === 'rolling-back') {
+        throw new Refusal(`The last ${j.status === 'prepared' ? 'apply' : 'rollback'} did not finish; run \`rollback\`.`);
+      }
+      return [j, validateAndScan(arc, state, null)];
+    });
+    return await publishStep(state, { ...journal, lockToken: token }, scanned, publish, token);
   } finally {
-    unlock(root, token);
+    release(arc, token);
   }
 }
 
@@ -919,29 +1078,32 @@ export async function retryMaintenance({ root: rootArg, state: stateArg, publish
  */
 export async function rollbackMaintenance({ root: rootArg, state: stateArg, publish, interruptAfter, at = noSeam }) {
   const root = resolve(rootArg);
-  const state = stateDir(root, stateArg);
-  const token = lock(root);
+  const arc = bindArchive(root);
+  const state = stateDir(arc, stateArg);
+  const token = inArchive(arc, lock);
   let interrupted = false;
   try {
-    const journal = journalFor(state, root, true);
-    if (!journal || journal.status === 'rolled-back') {
-      throw new Refusal(
-        journal && !['published', 'not-needed'].includes(journal.publication)
-          ? 'The last change is already rolled back but not yet published; run `retry`.'
-          : 'There is no change here to roll back.',
-      );
-    }
-    restore({ root, owner: token, at }, journal, () => {
-      writeJournal(state, { ...journal, status: 'rolling-back', lockToken: token });
-      if (interruptAfter === 'mark') {
-        interrupted = true;
-        throw new Interrupted('interrupted after mark');
+    const [journal, scanned] = inArchive(arc, () => {
+      const j = journalFor(state, arc, true);
+      if (!j || j.status === 'rolled-back') {
+        throw new Refusal(
+          j && !['published', 'not-needed'].includes(j.publication)
+            ? 'The last change is already rolled back but not yet published; run `retry`.'
+            : 'There is no change here to roll back.',
+        );
       }
+      restore({ root, arc, owner: token, at: guarded(at) }, j, () => {
+        writeJournal(state, { ...j, status: 'rolling-back', lockToken: token });
+        if (interruptAfter === 'mark') {
+          interrupted = true;
+          throw new Interrupted('interrupted after mark');
+        }
+      });
+      return [j, validateAndScan(arc, state, null)];
     });
-    const scanned = validateAndScan(root, state, null);
     return await publishStep(state, { ...journal, status: 'rolled-back', lockToken: token }, scanned, publish, token);
   } finally {
-    if (!interrupted) unlock(root, token);
+    if (!interrupted) release(arc, token);
   }
 }
 
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index 6f033966593ec9feb7959e5a8f5fe05ec517cf26..da5783ee92f3e67cda6afa358ec7138469fa6b88 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -1,12 +1,12 @@
 import { execFile } from 'node:child_process';
 import { createHash } from 'node:crypto';
-import { chmodSync, closeSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
+import { chmodSync, closeSync, cpSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
 import { tmpdir } from 'node:os';
 import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
 import { describe, expect, it, vi } from 'vitest';
 // @ts-expect-error — untyped operator tools; these are the real ones.
-import { applyMaintenance, Interrupted, planMaintenance, publishWithRunner, releaseLock, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
+import { applyMaintenance, bindArchive, inArchive, Interrupted, planMaintenance, publishWithRunner, releaseLock, retryMaintenance, rollbackMaintenance } from '../scripts/setar-archive-maintenance.mjs';
 // @ts-expect-error — see above.
 import { scanToIndex } from '../scripts/scan-setar-classes.mjs';
 // @ts-expect-error — see above.
@@ -1202,6 +1202,201 @@ describe('maintaining the Setar archive', () => {
         expect(await k.back()).toMatchObject({ ok: true });
       }
 
+      // --- THE ARCHIVE IS BOUND: its path replaced never carries a write ---
+      // The authorised archive is the DIRECTORY the run bound, never its path. Whatever moves the
+      // archive away and puts another folder there — here an exact external copy, its lock record
+      // and all — that copy is never touched, and no run reports success over it.
+      /** Every entry under `dir`, dotfiles and the lock included, by what it holds. */
+      const tree = (dir: string) =>
+        (readdirSync(dir, { recursive: true }) as string[])
+          .sort()
+          .map((n) => {
+            const st = lstatSync(join(dir, n));
+            return `${n}:${st.isFile() ? sha(readFileSync(join(dir, n))) : st.isDirectory() ? 'dir' : 'link'}`;
+          })
+          .join('\n');
+      const swapper = (k: ReturnType<typeof box>) => {
+        const real = join(k.base, 'the-real-archive');
+        let outside: string | null = null;
+        return {
+          swap: () => {
+            renameSync(k.root, real);
+            cpSync(real, k.root, { recursive: true, verbatimSymlinks: true });
+            outside = tree(k.root);
+          },
+          /** The external copy exactly as it was made, then the archive back at its path. */
+          unswap: () => {
+            expect(outside).not.toBeNull();
+            expect(tree(k.root)).toBe(outside);
+            rmSync(k.root, { recursive: true });
+            renameSync(real, k.root);
+            outside = null;
+          },
+          real,
+        };
+      };
+      // The PRIMITIVE first: a section is bound to the directory, not to the path it was entered by.
+      {
+        const k = box();
+        const x = swapper(k);
+        const arc = bindArchive(k.root);
+        const cwd = process.cwd();
+        inArchive(arc, () => {
+          x.swap();
+          writeFileSync('probe', 'written by bare name');
+        });
+        expect(process.cwd()).toBe(cwd);
+        expect([existsSync(join(x.real, 'probe')), existsSync(join(k.root, 'probe'))]).toEqual([true, false]);
+        // Entering again by the recorded path finds another folder: refused, nothing run.
+        let ran = false;
+        expect(() => inArchive(arc, () => (ran = true))).toThrow(/moved, or another folder put at its path/);
+        expect(ran).toBe(false);
+        rmSync(join(x.real, 'probe'));
+        x.unswap();
+        expect(inArchive(arc, () => readFileSync('PIECES.csv', 'utf8'))).toBe(SOURCE.registryBefore);
+      }
+      // Then EVERY archive write, its path replaced just after its owner check: Apply's registry,
+      // its log (present, and created when absent) and its move; Rollback's registry, its log taken
+      // out again (text null), its reverse move; a stopped move's recovery; and the automatic put-back.
+      // The write lands in the bound archive or not at all, the run refuses, and once the archive is
+      // back at its path, `rollback` leaves it exactly as it was before the change.
+      {
+        const before = (k: ReturnType<typeof box>) => ({ d: existsSync(k.at('RENAME-LOG.csv')) ? declarations(k.root) : readFileSync(k.at('PIECES.csv'), 'utf8'), m: media(k.root) });
+        const consumers: [string, boolean, (k: ReturnType<typeof box>, swap: () => void) => Promise<unknown>][] = [
+          ['apply registry', true, (k, swap) => k.go(REG, { at: when(['owned', 'PIECES.csv', swap]) })],
+          ['apply log', true, (k, swap) => k.go(MOVE, { at: when(['owned', 'RENAME-LOG.csv', swap]) })],
+          ['apply absent log', false, (k, swap) => k.go(MOVE, { at: when(['owned', 'RENAME-LOG.csv', swap]) })],
+          ['apply move', true, (k, swap) => k.go(MOVE, { at: when(['owned', A, swap]) })],
+          ['apply move, folder selected', true, (k, swap) => k.go(MOVE, { at: when(['link', B, swap]) })],
+          ['rollback registry', true, async (k, swap) => (await k.go(REG), k.back({ at: when(['owned', 'PIECES.csv', swap]) }))],
+          ['rollback log taken out', false, async (k, swap) => (await k.go(MOVE), k.back({ at: when(['owned', 'RENAME-LOG.csv', swap]) }))],
+          ['rollback reverse move', true, async (k, swap) => (await k.go(MOVE), k.back({ at: when(['owned', B, swap]) }))],
+          [
+            'stopped-move recovery',
+            true,
+            async (k, swap) => {
+              await expect(k.go(MOVE, { at: when(['unlink', A, () => { throw new Interrupted('power cut'); }]) })).rejects.toThrow(/power cut/);
+              return k.back({ at: when(['owned', B, swap]) });
+            },
+          ],
+          [
+            'automatic put-back',
+            true,
+            (k, swap) => k.go(MOVE, { at: when(['link', B, () => writeFileSync(k.at(A), Buffer.alloc(500, 7))], ['owned', 'RENAME-LOG.csv', swap, 2]) }),
+          ],
+        ];
+        for (const [name, withLog, run] of consumers) {
+          const k = box(withLog);
+          const was = before(k);
+          const x = swapper(k);
+          // The put-back was already past its owner check: it finishes IN the bound archive, and says so.
+          const said = name === 'automatic put-back' ? /everything it changed was put back from the private copy/ : /moved, or another folder put at its path|could not be put back automatically/;
+          await expect(run(k, x.swap), name).rejects.toThrow(said);
+          x.unswap();
+          // The run could not re-enter its archive to release its own record: it stands there, for the operator.
+          if (existsSync(k.lock)) {
+            const shown = /--record ([0-9a-f]{16})/.exec(releaseLock({ root: k.root }).lines.join('\n'))![1];
+            expect(releaseLock({ root: k.root, record: shown }), name).toMatchObject({ released: true });
+          }
+          // Put back from wherever it stopped: an unfinished apply or rollback finishes; one that put itself back is done.
+          if (['prepared', 'rolling-back', 'applied'].includes(k.j().status)) expect(await k.back(), name).toMatchObject({ ok: true });
+          // The automatic put-back's own media write (500 bytes of 7s) is the test's, not the run's: it stays.
+          const after = before(k);
+          expect(after.d, name).toEqual(was.d);
+          if (name !== 'automatic put-back') expect(after.m, name).toEqual(was.m);
+          expect([existsSync(k.lock), readdirSync(k.root).filter((n) => n.includes('.captured-') || n.includes('.maintenance-'))], name).toEqual([false, []]);
+        }
+      }
+      // Across runs too: a change applied, then its archive moved away and a copy put at its path —
+      // neither `rollback` nor `retry` acts on the copy; once the archive is back, `rollback` does.
+      {
+        const k = box();
+        const was = { d: declarations(k.root), m: media(k.root) };
+        expect(await k.go(MOVE)).toMatchObject({ ok: true });
+        const x = swapper(k);
+        x.swap();
+        for (const next of [() => k.back(), () => k.again()]) await expect(next()).rejects.toThrow(/not the one this change was made in/);
+        x.unswap();
+        expect(await k.back()).toMatchObject({ ok: true });
+        expect({ d: declarations(k.root), m: media(k.root) }).toEqual(was);
+      }
+      // A run's own release, its archive moved while it published: its record is never removed
+      // through the folder now at the path — the lock stays in the bound archive for the operator.
+      {
+        const k = box();
+        const x = swapper(k);
+        let holder = '';
+        await k.go(REG, { publish: async (text: string, hash: string, h: string) => ((holder = h), x.swap(), { status: 'published' }) });
+        expect(readArchiveLock(x.real).token).toBe(holder);
+        x.unswap();
+        const shown = /--record ([0-9a-f]{16})/.exec(releaseLock({ root: k.root }).lines.join('\n'))![1];
+        expect(releaseLock({ root: k.root, record: shown })).toMatchObject({ released: true });
+        // And the operator's release binds the same way: its archive moved at the release, the copy keeps its lock.
+        await k.go(REG, { publish: async () => ({ status: 'published' }) }).catch(() => undefined);
+        mkdirSync(k.lock);
+        const dead = ['3f3f3f3f', '0000', '4000', '8000', '000000000000'].join('-');
+        writeFileSync(join(k.lock, `${dead}.json`), JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' }));
+        const id = readArchiveLock(k.root).digest.slice(0, 16);
+        expect(releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, x.swap]) })).toMatchObject({ released: true });
+        expect([existsSync(join(x.real, ARCHIVE_LOCK)), readArchiveLock(k.root).token]).toEqual([false, dead]);
+        x.unswap();
+      }
+
+      // --- A RELEASE removes only the exact entry the operator saw -----------
+      // A legacy lock FILE, or a folder entry reused at the same name, replaced after the record was
+      // shown (at the release) or in the instant it is judged: the replacement is never removed.
+      {
+        const lockOf = (k: ReturnType<typeof box>, asFolder: boolean, text: string) => {
+          if (!asFolder) return writeFileSync(k.lock, text);
+          mkdirSync(k.lock, { recursive: true });
+          writeFileSync(join(k.lock, 'partial.json'), text);
+        };
+        const entry = (k: ReturnType<typeof box>, asFolder: boolean) => (asFolder ? join(k.lock, 'partial.json') : k.lock);
+        for (const asFolder of [false, true]) {
+          const tag = asFolder ? 'folder entry' : 'legacy file';
+          // Replaced after it was shown: refused, the replacement stands byte for byte.
+          const k = box();
+          lockOf(k, asFolder, 'record A');
+          const id = readArchiveLock(k.root).digest.slice(0, 16);
+          const replace = () => replaceWith(entry(k, asFolder), 'record B')();
+          expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, replace]) }), tag).toThrow(/not the record you saw/);
+          expect(readFileSync(entry(k, asFolder), 'utf8'), tag).toBe('record B');
+          expect(readdirSync(k.root).filter((n) => n.includes('.releasing-')), tag).toEqual([]);
+          // A taken in its judgement's instant, B put at the freed name meanwhile: A alone is removed.
+          const k2 = box();
+          lockOf(k2, asFolder, 'record A');
+          const id2 = readArchiveLock(k2.root).digest.slice(0, 16);
+          const p2 = entry(k2, asFolder);
+          expect(releaseLock({ root: k2.root, record: id2, at: when(['judge-release', asFolder ? join(ARCHIVE_LOCK, 'partial.json') : ARCHIVE_LOCK, () => writeFileSync(p2, 'record B')]) }), tag).toMatchObject({ released: true });
+          expect(readFileSync(p2, 'utf8'), tag).toBe('record B');
+          // B replaced A after it was shown AND C took the name while B was judged: B is never removed,
+          // kept under its private name and said; a legacy one blocks the next run until put back.
+          const k3 = box();
+          lockOf(k3, asFolder, 'record A');
+          const id3 = readArchiveLock(k3.root).digest.slice(0, 16);
+          const p3 = entry(k3, asFolder);
+          const label = asFolder ? join(ARCHIVE_LOCK, 'partial.json') : ARCHIVE_LOCK;
+          expect(() =>
+            releaseLock({ root: k3.root, record: id3, at: when(['release', ARCHIVE_LOCK, () => replaceWith(p3, 'record B')()], ['judge-release', label, () => writeFileSync(p3, 'record C')]) }),
+          ).toThrow(/a newer one now stands; what had replaced the record you saw is kept as .*\.releasing-/);
+          const dir = asFolder ? k3.lock : k3.root;
+          const kept = readdirSync(dir).filter((n) => n.includes('.releasing-'));
+          expect([readFileSync(p3, 'utf8'), kept.map((n) => readFileSync(join(dir, n), 'utf8'))], tag).toEqual(['record C', ['record B']]);
+          if (!asFolder) {
+            rmSync(p3);
+            await expect(k3.go(REG), tag).rejects.toThrow(new RegExp(`mv -n '${kept[0]!.replace(/\./g, '\\.')}' '\\${ARCHIVE_LOCK}'`));
+          }
+        }
+      }
+
+      // --- A FAILED PUBLICATION proves only its own attempt, in every current instruction too -
+      // An earlier or scheduled write whose answer was lost may still land, so no operator page
+      // may promise that a failure leaves the branch, or "the previous index", as it was.
+      for (const doc of ['docs/setar-archive.md', 'docs/nas-topology.md']) {
+        const text = readFileSync(join(process.cwd(), doc), 'utf8').replace(/\s+/g, ' ');
+        expect(text, doc).not.toMatch(/(previous|old|last good) index (still |stays |remains )?(published|exactly where)|leaves the (previous|last good) index/i);
+      }
+
       // --- RELEASES never take a NEWER run's lock --------------------------
       {
         // Two operators release the same dead record; between the first's release and the
````

**Paths the rework touched:**

- `docs/nas-topology.md`
- `docs/setar-archive.md`
- `scripts/publish-setar-index.mjs`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
3e59e7a Setar maintenance writes only inside the archive directory it bound; a lock release removes only the exact entry shown

Invariant (archive binding): every archive read-then-write and every lock
housekeeping step acts on the directory --root named when the run started,
by inode, never on whatever its pathname names later. bindArchive records
the directory (inode + real path); inArchive runs a synchronous section with
the working directory ON it and bare names only, re-entry proved by inode
or refused; no section spans an await. inFolder selects its session folder
by bare name against the bound archive, judges stillBound through its own
"..", and returns by ".." (proved) or the recorded path (proved), else
refuses. assertOwner proves home + lock before each write (new `owned`
seam just after it). rootId hashes the bound archive's real path.

Consumers, each routed and covered:
- lock / assertOwner / unlock / dropEmptyLock / refuseLeftovers: bare names
  in the bound archive; a run's end-of-run release that cannot re-enter
  leaves its lock in the real archive for release-lock (never removed
  through another folder).
- replaceDeclaration: create-when-absent link, capture/judge/install/keep,
  and text=null (log taken out) — via Apply registry, Apply log (present and
  absent), Rollback registry, Rollback log removal, automatic put-back.
- moveExact: Apply move (retarget after owner check, and after the folder
  was selected) and Rollback reverse move.
- restore's stopped-move recovery: owner check then bound folder selection.
- validateAndScan: home proved before and after the scan (the scanner reads
  through a path), so a retarget never scans or publishes another folder.
- journalFor / stateDir: from the binding, not a re-resolved pathname; the
  journal records the bound directory's inode (exact, as text; never the
  device, which a remount may renumber), so the binding spans runs: rollback
  and retry refuse a different folder at the archive's path (journa
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
