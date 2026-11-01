---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: d36cc5fee780763b0001fda00ad541a5b785aa16
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: a refused lock removal can still delete another writer's record
      during restoration."
    counterexample: "HEAD 725f7f554e007a5acc124ab9faf11fca0e9e8fc8; patch
      d36cc5fee780763b0001fda00ad541a5b785aa16. Invariant: recovery must
      preserve every record it is not authorised to remove, even when its public
      name changes concurrently. In removeLockEntry
      (scripts/setar-archive-maintenance.mjs:540-549), rejected record B is
      linked or recreated at its public name, then its private aside is unlinked
      unconditionally. A writer atomically saves C at the public name after that
      link and before the unlink: B loses its last name. Five file-free
      production-body probes reproduce this through operator release of a legacy
      file, folder file and legacy symlink, owned unlock, and failed
      lock-acquisition cleanup; operator release nevertheless reports nothing
      was changed. Direct consumers swept: lock cleanup line 432, unlock line
      494, legacy release line 593, folder release line 599; unlock covers
      Apply, automatic recovery, Retry and Rollback including stopped moves.
      Checked clean for the corresponding probed cases: stable release,
      lock-folder link/copy replacement, owner token-leaf replacement,
      private-folder replacement before record creation, publisher lock-parent
      replacement, and sibling putBack/retireKeeping preservation. Nineteen
      control assertions pass; five restore races lose B. Extend the SAME exact
      ac-2 title, setar guided maintenance is reversible stale safe and
      idempotent without altering media, across replacement/removal after the
      restoration link, both regular-file and symlink branches, and every
      removal caller. Preserve unapproved records under private names using the
      existing preservation rule. No files or records changed; no wholesale
      Check rerun or live NAS/GitHub/OS-crash proof."
createdAt: 2026-11-01T03:25:25.998Z
sealedAt: 2026-11-01T03:54:47.476Z
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
- **Diff patch-id:** `d36cc5fee780763b0001fda00ad541a5b785aa16`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: lock creation, ownership checks and cleanup still trust replaceable child paths beneath the bound archive.
  _counterexample:_ HEAD 3e59e7a64f0e42eb1c81ef83aab3b496cc277e10; patch 40654aa66522d370681b21d8814b44881da5d6b9. Invariant: every lock operation must address the authorised directory and exact owned or approved object. Production-body probes on an in-memory filesystem reproduce seven failing scenarios: operator release sees partial.json=A, then its release seam moves the lock folder and substitutes a symlink to an external folder containing A; removeLockEntry deletes the external entry, returns released:true and leaves the original lock. assertOwner accepts token files through symlinked or replacement real lock folders; unlock deletes their replacement files. Replacing only the token leaf on a stable parent also makes unlock delete another writer's file. lock writes outside the archive when its private directory becomes a symlink before the token write; its error cleanup recursively removes a replacement private directory containing another writer's file. readArchiveLock follows a lock directory replaced after its directory lstat, and archiveConfirmation accepts the external copied token. Instances: setar-archive-maintenance.mjs lock 405-414, assertOwner 432-435, unlock/release 448-465, removeLockEntry/releaseBound 480-547; publish-setar-index.mjs readArchiveLock 265-295 and archiveConfirmation 313-324. Consumers swept: Apply, automatic recovery, Rollback including stopped moves, Retry, operator release, maintenance and scheduled publishers. Checked clean: bound archive-root replacement, declaration/session-media directory binding, cross-run rootIno refusal, stable release, changed operator-release leaves on stable parents, and publisher refusal when the symlink already exists before inspection. Four dynamic control scenarios pass. Extend the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, across lock-parent/private-directory replacement, token-leaf replacement, creation-error cleanup and publisher read races. The attempt-only publication wording family is closed; eight focused publishStep probes preserve unknown state and prior unresolved hashes. No files or records changed; no wholesale Check rerun, live NAS, GitHub mutation or OS crash proof.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/nas-topology.md b/docs/nas-topology.md
index 50d0bafffb01d50dce03beb398c51668ad71af35..2cd67b57aa15ec8bcb04c012f1c00febd87de1bc 100644
--- a/docs/nas-topology.md
+++ b/docs/nas-topology.md
@@ -259,7 +259,7 @@ preconditions, archive binding and session-folder link refusal in the
 maintenance tool. All four files go together: the new runner passes `--root`,
 which the new publisher requires. Until the
 owner redeploys them, the NAS route has none of these. Redeploying needs, in
-the same step, the sudo rule to allow its arguments (the hash and the lock token) —
+the same step, the sudo rule to allow its arguments (the hash and the lock holder) —
 `ethan ALL=(setar-indexer) NOPASSWD: /bin/sh /volume1/practice-compass-index/run-setar-index.sh, /bin/sh /volume1/practice-compass-index/run-setar-index.sh *`
 — or every apply ends `publish-failed`, reported as unconfirmed (sudo's
 refusal is exit 1, no proof by itself; in fact nothing ran), and `retry`
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 61ceca2193530e965d196d5afbad81a845614827..b14de77253c88d4dcc8bf127a2a3146901ed4153 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -715,7 +715,14 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   private `.releasing-…` name and judged there against what was shown, removed
   only if it is that, else linked back (never over anything) or kept and
   named — a replacement at the same name, legacy lock file or folder entry
-  alike, is never removed. A lock is
+  alike, is never removed. Every lock operation addresses objects, never a
+  path that could be swapped under it: a run's ownership is the exact folder
+  and record file it made (by inode), its record is written and removed only
+  inside a folder entered and proved by inode, a release works only inside
+  the very folder shown (its id covers that folder), and the lock is read the
+  same way — a folder replaced by a link or a copy mid-read reads as held,
+  never as absent. A failed take removes only its own record, then its folder
+  only if empty. A lock is
   never adopted on a guess about a process: a run that finds one refuses and
   names it. If nothing is running (check `ps`), `release-lock` shows the
   record and `release-lock --record <id>` releases exactly that one, in any
@@ -723,7 +730,8 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   half-written means `rollback`; applied or restored but not confirmed
   published means `retry`.
 - **Publication is of the validated index, on evidence.** The job gets the
-  validated contentHash and the run's lock token as its two arguments and
+  validated contentHash and the run's lock holder (its token and the exact
+  lock it made) as its two arguments and
   refuses, before any request (exit 3), a scan that differs. After reading the
   branch and before writing anything, every publisher — the scheduled job
   too — checks the archive's lock (absent, or held by the run that asked) and
diff --git a/scripts/publish-setar-index.mjs b/scripts/publish-setar-index.mjs
index 246b8de5fe65f396dd27865a155c9ebbf3badbed..9a098449f7d880cfb46eecf70feb646707313ea7 100644
--- a/scripts/publish-setar-index.mjs
+++ b/scripts/publish-setar-index.mjs
@@ -2,7 +2,7 @@
 // Publish the scanned Setar index to ONE file on ONE branch of the private
 // data repository, and nothing else, ever.
 //
-//   node scripts/publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock token>]
+//   node scripts/publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock holder>]
 //     env: PC_INDEX_REPO=owner/name  PC_INDEX_TOKEN=<publisher token>
 //
 // On success the LAST stdout line is the evidence a caller checks:
@@ -50,7 +50,7 @@
 // Node stdlib only.
 
 import { createHash } from 'node:crypto';
-import { lstatSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
+import { closeSync, constants, fstatSync, lstatSync, openSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
 import { createServer } from 'node:net';
 import { dirname, join, resolve } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -247,73 +247,119 @@ function nothingPublished(err) {
  * The archive's maintenance lock: ONE folder in the archive root (the scanner
  * skips dotfiles) holding exactly one record, `<token>.json`. A run builds the
  * folder privately and renames it into place, which fails while a lock stands,
- * so a record is never partial; a record is removed only by its own unique
- * name, so no remover can ever take a NEWER run's lock.
+ * so a record is never partial. A lock is judged as OBJECTS, never through a
+ * path that could be replaced meanwhile: the folder is entered and proved by
+ * inode, its entries read by bare name without following a link, and the
+ * folder proved still at its name after; a holder is its token AND the exact
+ * folder and record it made.
  */
 export const ARCHIVE_LOCK = '.setar-maintenance.lock';
 
 const digestOf = (bytes) => createHash('sha256').update(bytes).digest('hex');
+const sameObject = (a, b) => Boolean(a && b && a.ino === b.ino && a.dev === b.dev);
+const lockChanged = () => new Error('The archive’s maintenance lock changed while it was read; nothing was decided on it. Try again.');
+
+/** One entry as an object: its lstat, and a file's bytes read from the very file judged (never through a link). */
+function readEntry(p) {
+  const st = lstatSync(p, { bigint: true });
+  if (!st.isFile()) return { st, bytes: null };
+  let fd;
+  try {
+    fd = openSync(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
+  } catch {
+    throw lockChanged(); // replaced by a link (or removed) since its lstat
+  }
+  try {
+    if (!sameObject(fstatSync(fd, { bigint: true }), st)) throw lockChanged();
+    return { st, bytes: readFileSync(fd) };
+  } finally {
+    closeSync(fd);
+  }
+}
 
 /**
  * The lock as it stands: null (absent, or an empty folder a release left), its
- * record `{ token, pid, host, since, digest, entries }`, or `{ unreadable }` with
- * a digest of what is there when it is not exactly one record in this tool's
- * form — never guessed into one. `entries` are what a release may remove, each
- * `[path from the root, lockEntryDigest]`: the folder's entries, or the lock's
- * own name when it is not a folder (an earlier version's file).
+ * record `{ token, pid, host, since, holder, folder, digest, entries }`, or
+ * `{ unreadable }` with a digest of what is there when it is not exactly one
+ * record in this tool's form — never guessed into one. `holder` names the
+ * token, the folder and the record file as objects; `digest` covers the folder
+ * too, so a record shown is the record of THAT folder. `entries` are what a
+ * release may remove, each `[path from the root, lockEntryDigest]`: the
+ * folder's entries, or the lock's own name when it is not a folder (an earlier
+ * version's file). A lock that changes while it is read is an error, never
+ * null: doubt reads as held. `at` is the test seam, after the folder's lstat.
  */
-export function readArchiveLock(root) {
+export function readArchiveLock(root, at = () => {}) {
   const p = join(root, ARCHIVE_LOCK);
   let st;
   try {
-    st = lstatSync(p);
+    st = lstatSync(p, { bigint: true });
   } catch (err) {
     if (err?.code === 'ENOENT') return null;
     throw err;
   }
   if (!st.isDirectory()) {
-    return { unreadable: true, entries: [[ARCHIVE_LOCK, lockEntryDigest(p)]], digest: digestOf(st.isFile() ? readFileSync(p) : st.isSymbolicLink() ? `link:${readlinkSync(p)}` : `${st.mode}`) };
+    const e = readEntry(p);
+    return { unreadable: true, entries: [[ARCHIVE_LOCK, lockEntryDigest(p)]], digest: digestOf(e.bytes ?? (e.st.isSymbolicLink() ? `link:${readlinkSync(p)}` : `${e.st.mode}`)) };
   }
-  const names = readdirSync(p).sort();
-  if (!names.length) return null;
-  const parts = names.map((n) => {
-    const e = lstatSync(join(p, n));
-    return [n, e.isFile() ? readFileSync(join(p, n)) : null];
-  });
-  const digest = digestOf(JSON.stringify(parts.map(([n, b]) => [n, b ? digestOf(b) : 'not a file'])));
-  const entries = parts.map(([n, b]) => [join(ARCHIVE_LOCK, n), b ? digestOf(b) : null]);
-  if (parts.length === 1 && parts[0][1]) {
+  at('read-lock', p);
+  const parent = statSync(root, { bigint: true });
+  const home = statSync('.', { bigint: true });
+  const back = process.cwd();
+  let parts;
+  try {
+    process.chdir(p);
+  } catch {
+    throw lockChanged();
+  }
+  try {
+    if (!sameObject(statSync('.', { bigint: true }), st)) throw lockChanged();
+    parts = readdirSync('.').sort().map((n) => [n, readEntry(n)]);
+    // Read IN the folder that was the lock — and it is still the lock, at its name, in the same archive.
+    if (!sameObject(lstatSync(join('..', ARCHIVE_LOCK), { bigint: true }), st) || !sameObject(statSync('..', { bigint: true }), parent)) throw lockChanged();
+  } finally {
+    process.chdir(back);
+    if (!sameObject(statSync('.', { bigint: true }), home)) throw new Error('The folder this ran in was moved while the archive’s lock was read; nothing was decided on it.');
+  }
+  if (!parts.length) return null;
+  const digest = digestOf(JSON.stringify([`folder ${st.ino}`, ...parts.map(([n, e]) => [n, e.bytes ? digestOf(e.bytes) : 'not a file'])]));
+  const entries = parts.map(([n, e]) => [join(ARCHIVE_LOCK, n), e.bytes ? digestOf(e.bytes) : null]);
+  if (parts.length === 1 && parts[0][1].bytes) {
     try {
-      const r = JSON.parse(parts[0][1].toString('utf8'));
-      if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && names[0] === `${r.token}.json` && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
-        return { ...r, digest, entries };
+      const r = JSON.parse(parts[0][1].bytes.toString('utf8'));
+      if (typeof r?.token === 'string' && /^[0-9a-f-]{36}$/.test(r.token) && parts[0][0] === `${r.token}.json` && Number.isInteger(r.pid) && r.pid > 0 && typeof r.host === 'string' && typeof r.since === 'string') {
+        return { ...r, holder: lockHolder(r.token, st, parts[0][1].st), folder: st, digest, entries };
       }
     } catch {
       // not a record: said as unreadable below
     }
   }
-  return { unreadable: true, digest, entries };
+  return { unreadable: true, folder: st, digest, entries };
 }
 
+/** A holder: the run's token AND the exact folder and record file it made (bigint stats), as one opaque string. */
+export const lockHolder = (token, folder, record) => `${token}:${folder.ino}:${record.ino}`;
+
 /**
  * What one lock entry IS, judged again after it is set aside: a file's bytes or
  * a link's target, by digest (as the record's digest reads it); null for
  * anything else, which is never judged and so never removed.
  */
 export function lockEntryDigest(p) {
-  const st = lstatSync(p);
-  return st.isFile() ? digestOf(readFileSync(p)) : st.isSymbolicLink() ? digestOf(`link:${readlinkSync(p)}`) : null;
+  const { st, bytes } = readEntry(p);
+  return bytes ? digestOf(bytes) : st.isSymbolicLink() ? digestOf(`link:${readlinkSync(p)}`) : null;
 }
 
 /**
  * What a publisher asks before its ref write: who holds the archive, then what
- * it scans to now. `holder` is the maintenance run's lock token; without one
- * (the scheduled job) any lock refuses.
+ * it scans to now. `holder` is the maintenance run's `lockHolder` — its token
+ * and the exact lock it made; without one (the scheduled job) any lock, or a
+ * lock that will not read still, refuses. `at` is the read's test seam.
  */
-export function archiveConfirmation(root, holder) {
+export function archiveConfirmation(root, holder, at) {
   return () => {
-    const held = readArchiveLock(root);
-    if (holder ? held?.token !== holder : held) {
+    const held = readArchiveLock(root, at);
+    if (holder ? held?.holder !== holder : held) {
       throw new Error(
         holder
           ? 'The maintenance run that asked for this publication no longer holds the archive; nothing was published.'
@@ -431,7 +477,7 @@ async function main() {
   const repo = process.env.PC_INDEX_REPO;
   const token = process.env.PC_INDEX_TOKEN;
   if (!values.index || !values.root || !repo || !token) {
-    console.error('Usage: publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock token>]');
+    console.error('Usage: publish-setar-index.mjs --index <file> --root <archive> [--expect <contentHash>] [--holder <lock holder>]');
     console.error('  PC_INDEX_REPO=owner/name PC_INDEX_TOKEN=<publisher token> must be set.');
     process.exit(2);
   }
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index 9c2732cd224821b1d4c17953b83841d42a0fc242..0beb1ea70bde9921b925bb2dff17daaee5d466ad 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -51,7 +51,7 @@ import {
   readTable,
   writeIndexAtomically,
 } from './scan-setar-classes.mjs';
-import { ARCHIVE_LOCK, lockEntryDigest, readArchiveLock } from './publish-setar-index.mjs';
+import { ARCHIVE_LOCK, lockEntryDigest, lockHolder, readArchiveLock } from './publish-setar-index.mjs';
 
 const REGISTRY = 'PIECES.csv';
 const LOG = 'RENAME-LOG.csv';
@@ -375,12 +375,16 @@ const guarded = (at) => (point, name) => {
 // never per --state folder: every route that writes the archive takes it, and
 // every publisher checks it before its ref write (`archiveConfirmation`), the
 // scheduled job included. A record is written whole in a private folder that
-// is RENAMED into place, so it is never partial, and removed only by its own
-// unique name, so no release ever takes a newer run's lock. A lock is never adopted on a guess about a process
-// (a pid can be reused, a publishing child outlives its parent): a run that
-// finds one refuses, and the operator — having seen no maintenance or
-// publication process is running, the indexer's sudo'd job included —
-// releases that exact record (`release-lock`).
+// is RENAMED into place, so it is never partial. A run's ownership is the exact
+// folder and record file it made (`owner`, by inode), never a name inside a
+// path that could be swapped: every check reads the lock as objects
+// (`readArchiveLock`), and every removal happens INSIDE a folder entered and
+// proved by inode, of an entry judged after it is set aside — so no release
+// ever takes a newer run's lock, or anything outside the archive. A lock is
+// never adopted on a guess about a process (a pid can be reused, a publishing
+// child outlives its parent): a run that finds one refuses, and the operator —
+// having seen no maintenance or publication process is running, the indexer's
+// sudo'd job included — releases that exact record (`release-lock`).
 
 const same = (a, b) => Boolean(a && b && a.ino === b.ino && a.dev === b.dev);
 const holderLine = (h) => (h.unreadable ? 'a record not in this tool’s form' : `run ${h.token.slice(0, 8)} (pid ${h.pid} on ${h.host}, since ${h.since})`);
@@ -395,43 +399,78 @@ function lockRefusal() {
 }
 
 /**
- * Take the archive's lock, or refuse. The record is written whole in a private
- * folder that is then RENAMED into place — which fails while any lock stands,
- * and replaces only the empty folder a release leaves. Returns the token that
- * proves ownership. A run that stopped mid-write left a file under one of this
- * tool's private names: it is never recovered from automatically (a name proves
- * nothing about whose file it is); the run refuses and names it.
+ * Take the archive's lock, or refuse. The record is written whole, by bare
+ * name, INSIDE the private folder this run made (entered and proved by inode,
+ * so a link put at its name is never written through), and the folder is then
+ * RENAMED into place — which fails while any lock stands, and replaces only
+ * the empty folder a release leaves. Returns the `owner`: the token and the
+ * exact folder and record, as objects. A failure removes only this run's own
+ * record, judged by inode, and then its folder only if empty — never anything
+ * another writer put there. A run that stopped mid-write left a file under one
+ * of this tool's private names: it is never recovered from automatically (a
+ * name proves nothing about whose file it is); the run refuses and names it.
+ * `at` is the test seam: before the record's write and before the rename.
  */
-function lock() {
+function lock(arc, at = noSeam) {
   const token = randomUUID();
   const tmp = `${ARCHIVE_LOCK}.${token}`;
+  const name = `${token}.json`;
   mkdirSync(tmp);
+  const folder = lstatSync(tmp, { bigint: true });
+  let record = null;
   try {
-    writeFileSync(join(tmp, `${token}.json`), `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
+    at('lock-record', tmp);
+    record = inFolder(arc, tmp, () => {
+      if (!same(statSync('.', { bigint: true }), folder)) throw new Refusal('The lock folder this run made was replaced before its record was written; nothing was changed.');
+      writeFileSync(name, `${JSON.stringify({ token, pid: process.pid, host: hostname(), since: new Date().toISOString() })}\n`, { flag: 'wx' });
+      return lstatSync(name, { bigint: true });
+    });
+    at('lock-take', tmp);
     renameSync(tmp, ARCHIVE_LOCK);
   } catch (err) {
-    rmSync(tmp, { recursive: true, force: true }); // this run's own private folder
+    try {
+      if (record) inFolder(arc, tmp, (stillBound) => same(statSync('.', { bigint: true }), folder) && removeLockEntry(name, (st) => same(st, record) && stillBound()));
+    } catch {
+      // not this run's folder any more: whatever stands there is left
+    }
+    try {
+      rmdirSync(tmp); // only ever an empty folder
+    } catch {
+      // holds something, or gone: left as it is
+    }
     if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal();
     throw err;
   }
+  const owner = { token, folder, record, holder: lockHolder(token, folder, record) };
   try {
+    if (!holds(owner)) throw new Refusal('The archive’s lock was replaced as this run took it; nothing was changed. Run release-lock to see it.');
     refuseLeftovers();
   } catch (err) {
-    unlock(token);
+    unlock(arc, owner);
     throw err;
   }
-  return token;
+  return owner;
+}
+
+/** The lock in the archive is exactly the one `owner` made: its token, folder and record, read as objects. Any doubt is "no". */
+function holds(owner) {
+  try {
+    return readArchiveLock('.')?.holder === owner.holder;
+  } catch {
+    return false;
+  }
 }
 
 /**
  * Every archive write first proves it is IN the bound archive and this run
- * still holds its lock (an operator may have released it). What follows works
- * by bare names in that archive, so nothing done to its path after this check
- * reaches the write. `owned` is the test seam, just after the check.
+ * still holds its lock (an operator may have released it, or anyone replaced
+ * the folder or its record). What follows works by bare names in that
+ * archive, so nothing done to its path after this check reaches the write.
+ * `owned` is the test seam, just after the check.
  */
 function assertOwner({ arc, owner, at }, label) {
   ensureHome(arc);
-  if (!lstatOrNull(join(ARCHIVE_LOCK, `${owner}.json`))?.isFile()) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand); it stopped before its next write.');
+  if (!holds(owner)) throw new Refusal('This run no longer holds the archive’s maintenance lock (it was released by hand, or replaced); it stopped before its next write.');
   at('owned', label);
 }
 
@@ -444,15 +483,19 @@ function dropEmptyLock() {
   }
 }
 
-/** Release THIS run's lock: only its own record, by its unique name; a newer run's is never touched. */
-function unlock(token) {
+/**
+ * Release THIS run's lock: only its own record — the very file, judged by
+ * inode — inside its own folder, entered and proved by inode. A replaced
+ * folder or record, a newer run's or anyone's, is never touched.
+ */
+function unlock(arc, owner) {
   try {
-    unlinkSync(join(ARCHIVE_LOCK, `${token}.json`));
+    ensureHome(arc);
+    inFolder(arc, ARCHIVE_LOCK, (stillBound) => same(statSync('.', { bigint: true }), owner.folder) && removeLockEntry(`${owner.token}.json`, (st) => same(st, owner.record) && stillBound()));
+    dropEmptyLock(); // only from the proved archive
   } catch (err) {
-    if (err?.code === 'ENOENT') return; // released by hand already
-    throw err;
+    if (!(err instanceof Refusal)) throw err; // not in the archive, or no real folder at the name: nothing of this run's to remove there
   }
-  dropEmptyLock();
 }
 
 /**
@@ -460,63 +503,68 @@ function unlock(token) {
  * archive can no longer be entered, the lock is left where it is — never
  * removed through another folder — and the next run names it (release-lock).
  */
-function release(arc, token) {
+function release(arc, owner) {
   try {
-    inArchive(arc, () => unlock(token));
+    inArchive(arc, () => unlock(arc, owner));
   } catch (err) {
     if (!(err instanceof Refusal)) throw err;
   }
 }
 
 /**
- * THE ONE PLACE a lock entry is removed: only while what stands at `p` is
- * exactly what the operator saw (`digest`), judged on a private name it was
- * first moved to — atomic: whatever held the name at that instant — so an
- * entry put at that name since, or replacing it in the judgement's instant,
- * is never removed: it is linked back, never over anything, or kept under the
- * private name and said. Returns whether it removed the entry. `at` is the
- * test seam, between the move and the judgement.
+ * THE ONE PLACE a lock entry is removed: `name`, a bare name in the folder the
+ * caller entered and proved, only while what stands there is exactly what may
+ * go (`isIt(lstat, path)`: the operator's digest, or a run's own record by
+ * inode), judged on a private name it was first moved to — atomic: whatever
+ * held the name at that instant — so an entry put at that name since, or
+ * replacing it in the judgement's instant, is never removed: it is linked
+ * back, never over anything, or kept under the private name and said. Returns
+ * whether it removed the entry. `at` is the test seam, between the move and
+ * the judgement.
  */
-function removeLockEntry(p, digest, at) {
-  const aside = `${p}.releasing-${randomUUID()}`;
+function removeLockEntry(name, isIt, at = noSeam, label = name) {
+  const aside = `${name}.releasing-${randomUUID()}`;
   try {
-    renameSync(p, aside);
+    renameSync(name, aside);
   } catch (err) {
     if (err?.code === 'ENOENT') return false;
     throw err;
   }
-  at('judge-release', p);
-  const st = lstatSync(aside);
-  if ((st.isFile() || st.isSymbolicLink()) && lockEntryDigest(aside) === digest) {
+  at('judge-release', label);
+  const st = lstatSync(aside, { bigint: true });
+  if (isIt(st, aside)) {
     unlinkSync(aside);
     return true;
   }
   try {
-    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), p);
-    else if (st.isFile()) linkSync(aside, p);
-    else renameSync(aside, p); // a folder: replaces only an empty one, never anyone's record
+    if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), name);
+    else if (st.isFile()) linkSync(aside, name);
+    else renameSync(aside, name); // a folder: replaces only an empty one, never anyone's record
   } catch (err) {
     if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) {
-      throw new Refusal(`The lock changed while it was being released, and a newer one now stands; what had replaced the record you saw is kept as ${aside}. Nothing else was removed.`);
+      throw new Refusal(`The lock changed while it was being released, and a newer one now stands; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}. Nothing else was removed.`);
     }
     throw err;
   }
-  if (!st.isDirectory()) unlinkSync(aside); // `p` holds that very file again
+  if (!st.isDirectory()) unlinkSync(aside); // `name` holds that very file again
   return false;
 }
 
 /**
  * The operator's explicit route for a lock no run will take: shown first, then
- * released only by its exact record (a digest prefix of what is there), whatever
- * form it is in — a dead run's, a partial or foreign one. Only the entries that
- * record named are removed, each by its own name, so a lock taken since is never
- * touched. `at` is the test seam.
+ * released only by its exact record (a digest prefix of what is there, its
+ * folder included), whatever form it is in — a dead run's, a partial or
+ * foreign one. Only the entries that record named are removed, each by its own
+ * name INSIDE the very folder shown (entered and proved by inode, never through
+ * a link put at the lock's name), so a lock taken since, or anything outside
+ * the archive, is never touched. `at` is the test seam.
  */
 export function releaseLock({ root: rootArg, record, at = noSeam }) {
-  return inArchive(bindArchive(resolve(rootArg)), () => releaseBound(record, guarded(at)));
+  const arc = bindArchive(resolve(rootArg));
+  return inArchive(arc, () => releaseBound(arc, record, guarded(at)));
 }
 
-function releaseBound(record, at) {
+function releaseBound(arc, record, at) {
   const held = readArchiveLock('.');
   if (!held) return { released: false, lines: ['The archive holds no maintenance lock. Nothing to do.'] };
   const id = held.digest.slice(0, 16);
@@ -537,8 +585,25 @@ function releaseBound(record, at) {
   if (held.entries.some(([, d]) => d === null)) {
     throw new Refusal(`The lock holds something that is not a file (${held.entries.filter(([, d]) => d === null).map(([p]) => p).join(', ')}); nothing was changed. Once no run holds it, remove it by hand.`);
   }
+  const judged = (digest, stillBound) => (st, aside) => (st.isFile() || st.isSymbolicLink()) && lockEntryDigest(aside) === digest && stillBound();
   let removed = 0;
-  for (const [p, digest] of held.entries) if (removeLockEntry(p, digest, at)) removed += 1;
+  if (!held.folder) {
+    // An earlier version's lock FILE: its one name, in the bound archive itself.
+    const [[p, digest]] = held.entries;
+    if (removeLockEntry(p, judged(digest, () => true), at)) removed += 1;
+  } else {
+    try {
+      removed = inFolder(arc, ARCHIVE_LOCK, (stillBound) => {
+        if (!same(statSync('.', { bigint: true }), held.folder)) return 0; // another folder at the name now: not the one shown
+        let n = 0;
+        for (const [p, digest] of held.entries) if (removeLockEntry(basename(p), judged(digest, stillBound), at, p)) n += 1;
+        return n;
+      });
+    } catch (err) {
+      if (!(err instanceof Refusal) || /lock changed while it was being released/.test(err.message)) throw err;
+      throw stale(); // no real folder at the lock's name any more
+    }
+  }
   dropEmptyLock();
   if (removed < held.entries.length) {
     if (!removed) throw stale();
@@ -853,14 +918,14 @@ const PUBLISHED = new Set(['unchanged', 'published', 'created']);
  * closes every open attempt; a failure this attempt proved leaves the earlier
  * open ones open, and a failure it did not prove adds itself to them.
  */
-async function publishStep(state, base, scanned, publish, token) {
+async function publishStep(state, base, scanned, publish, holder) {
   const contentHash = scanned.index.contentHash;
   const before = base.unresolved ?? [];
   const attempt = { ...base, publication: 'pending', contentHash, unresolved: [...new Set([...before, contentHash])] };
   writeJournal(state, attempt);
   let result;
   try {
-    result = await publish(scanned.text, contentHash, token);
+    result = await publish(scanned.text, contentHash, holder);
     // POSITIVE EVIDENCE or it did not happen: a publisher that returns no status has proved nothing.
     if (!PUBLISHED.has(result?.status)) throw new PublishFailed('the publisher reported no publication', false);
   } catch (err) {
@@ -898,7 +963,7 @@ async function publishStep(state, base, scanned, publish, token) {
 
 /**
  * Apply a previewed action. `previewId` must be the id the preview printed
- * against the archive as it is now. `publish(text, contentHash, lockToken)` is
+ * against the archive as it is now. `publish(text, contentHash, holder)` is
  * the existing job (CLI) or a fake Git boundary (tests). `interruptAfter` is a
  * test seam: 'copy' | 'registry' | 'log' | 'rename'; `at(point, name)` another,
  * called just before each archive write.
@@ -907,9 +972,9 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
   const root = resolve(rootArg);
   const arc = bindArchive(root);
   const state = stateDir(arc, stateArg);
-  const token = inArchive(arc, lock);
+  const owner = inArchive(arc, () => lock(arc, guarded(at)));
   // What THIS run has changed in the archive, recorded at the instant of each change: its automatic put-back judges only those.
-  const ctx = { root, arc, owner: token, at: guarded(at), written: new Set() };
+  const ctx = { root, arc, owner, at: guarded(at), written: new Set() };
   let interrupted = false;
   try {
     // Everything up to publication, in ONE bound section (no await inside).
@@ -940,7 +1005,7 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
         registry: { before: digest(registryBefore), after: digest(plan.registry ? plan.registry.after : registryBefore) },
         log: { before: digest(logBefore), after: digest(plan.log ? plan.log.after : logBefore) },
       };
-      const journal = { id: plan.id, action, copy, rootId: rootIdOf(arc), rootIno: arc.ino, logWasPresent, wrote, rename: plan.rename, lockToken: token, status: 'prepared' };
+      const journal = { id: plan.id, action, copy, rootId: rootIdOf(arc), rootIno: arc.ino, logWasPresent, wrote, rename: plan.rename, lockToken: owner.token, status: 'prepared' };
       writeFileSync(join(copy, 'manifest.json'), `${JSON.stringify(journal, null, 2)}\n`);
       writeJournal(state, journal);
       const step = (name) => {
@@ -978,9 +1043,9 @@ export async function applyMaintenance({ root: rootArg, state: stateArg, action,
     });
     if (ready.done) return ready.done;
     // 3. Publication, through the existing job.
-    return { ...(await publishStep(state, { ...ready.journal, status: 'applied', unresolved: [] }, ready.scanned, publish, token)), lines: ready.lines };
+    return { ...(await publishStep(state, { ...ready.journal, status: 'applied', unresolved: [] }, ready.scanned, publish, owner.holder)), lines: ready.lines };
   } finally {
-    if (!interrupted) release(arc, token);
+    if (!interrupted) release(arc, owner);
   }
 }
 
@@ -1052,7 +1117,7 @@ function restore(ctx, journal, beforeWriting = () => {}, only = null) {
 export async function retryMaintenance({ root: rootArg, state: stateArg, publish }) {
   const arc = bindArchive(resolve(rootArg));
   const state = stateDir(arc, stateArg);
-  const token = inArchive(arc, lock);
+  const owner = inArchive(arc, () => lock(arc));
   try {
     const [journal, scanned] = inArchive(arc, () => {
       const j = journalFor(state, arc, true);
@@ -1062,9 +1127,9 @@ export async function retryMaintenance({ root: rootArg, state: stateArg, publish
       }
       return [j, validateAndScan(arc, state, null)];
     });
-    return await publishStep(state, { ...journal, lockToken: token }, scanned, publish, token);
+    return await publishStep(state, { ...journal, lockToken: owner.token }, scanned, publish, owner.holder);
   } finally {
-    release(arc, token);
+    release(arc, owner);
   }
 }
 
@@ -1080,7 +1145,7 @@ export async function rollbackMaintenance({ root: rootArg, state: stateArg, publ
   const root = resolve(rootArg);
   const arc = bindArchive(root);
   const state = stateDir(arc, stateArg);
-  const token = inArchive(arc, lock);
+  const owner = inArchive(arc, () => lock(arc, guarded(at)));
   let interrupted = false;
   try {
     const [journal, scanned] = inArchive(arc, () => {
@@ -1092,8 +1157,8 @@ export async function rollbackMaintenance({ root: rootArg, state: stateArg, publ
             : 'There is no change here to roll back.',
         );
       }
-      restore({ root, arc, owner: token, at: guarded(at) }, j, () => {
-        writeJournal(state, { ...j, status: 'rolling-back', lockToken: token });
+      restore({ root, arc, owner, at: guarded(at) }, j, () => {
+        writeJournal(state, { ...j, status: 'rolling-back', lockToken: owner.token });
         if (interruptAfter === 'mark') {
           interrupted = true;
           throw new Interrupted('interrupted after mark');
@@ -1101,9 +1166,9 @@ export async function rollbackMaintenance({ root: rootArg, state: stateArg, publ
       });
       return [j, validateAndScan(arc, state, null)];
     });
-    return await publishStep(state, { ...journal, status: 'rolled-back', lockToken: token }, scanned, publish, token);
+    return await publishStep(state, { ...journal, status: 'rolled-back', lockToken: owner.token }, scanned, publish, owner.holder);
   } finally {
-    if (!interrupted) release(arc, token);
+    if (!interrupted) release(arc, owner);
   }
 }
 
@@ -1117,7 +1182,7 @@ export async function rollbackMaintenance({ root: rootArg, state: stateArg, publ
  * `sudo -n -u setar-indexer sh /volume1/practice-compass-index/run-setar-index.sh`);
  * without it, the runner beside this script runs as the caller.
  *
- * The validated contentHash and this run's lock token go to the job as its two
+ * The validated contentHash and this run's lock holder go to the job as its two
  * arguments (sudo keeps arguments, not environment): the job's own scan is
  * refused before any request unless it is that index, and its ref write
  * unless this run still holds the archive. Success needs the publisher's
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index da5783ee92f3e67cda6afa358ec7138469fa6b88..26e76815ede1c9eb025bcbfa167a357384044c24 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -1327,7 +1327,7 @@ describe('maintaining the Setar archive', () => {
         const x = swapper(k);
         let holder = '';
         await k.go(REG, { publish: async (text: string, hash: string, h: string) => ((holder = h), x.swap(), { status: 'published' }) });
-        expect(readArchiveLock(x.real).token).toBe(holder);
+        expect(readArchiveLock(x.real).holder).toBe(holder);
         x.unswap();
         const shown = /--record ([0-9a-f]{16})/.exec(releaseLock({ root: k.root }).lines.join('\n'))![1];
         expect(releaseLock({ root: k.root, record: shown })).toMatchObject({ released: true });
@@ -1389,6 +1389,182 @@ describe('maintaining the Setar archive', () => {
         }
       }
 
+      // --- EVERY LOCK OPERATION addresses the exact folder and object, never a path swapped under it -
+      // The lock's folder, a run's private folder or its record replaced — by a link to a folder
+      // outside the archive, by a real folder holding a copy, or the record leaf alone — at the
+      // instant between a check and its act: nothing outside is read as the lock, written or
+      // removed; no replacement anyone made is removed; no doubt reads as "no lock".
+      {
+        const dead = ['4f4f4f4f', '0000', '4000', '8000', '000000000000'].join('-');
+        const deadRecord = JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' });
+        const outside = (k: ReturnType<typeof box>, files: Record<string, string> = {}) => {
+          const ext = join(k.base, 'outside');
+          mkdirSync(ext);
+          for (const [n, t] of Object.entries(files)) writeFileSync(join(ext, n), t);
+          return ext;
+        };
+        const files = (dir: string) => Object.fromEntries(readdirSync(dir).sort().map((n) => [n, readFileSync(join(dir, n), 'utf8')]));
+        const isLink = (p: string) => lstatSync(p).isSymbolicLink();
+
+        // The OPERATOR's release: the folder shown is moved away and a link to an outside copy of
+        // record A, or a real copy of it, put at its name — at the release, or while A is judged.
+        for (const [how, point] of [['link', 'release'], ['copy', 'release'], ['link', 'judge-release'], ['copy', 'judge-release']] as const) {
+          const tag = `operator release, ${how} at ${point}`;
+          const k = box();
+          mkdirSync(k.lock);
+          writeFileSync(join(k.lock, 'partial.json'), 'record A');
+          const ext = outside(k, { 'partial.json': 'record A' });
+          const away = join(k.base, 'lock-moved-away');
+          const swap = () => {
+            renameSync(k.lock, away);
+            if (how === 'link') symlinkSync(ext, k.lock);
+            else {
+              mkdirSync(k.lock);
+              writeFileSync(join(k.lock, 'partial.json'), 'record A');
+            }
+          };
+          const id = readArchiveLock(k.root).digest.slice(0, 16);
+          const label = point === 'release' ? ARCHIVE_LOCK : join(ARCHIVE_LOCK, 'partial.json');
+          expect(() => releaseLock({ root: k.root, record: id, at: when([point, label, swap]) }), tag).toThrow(/not the record you saw/);
+          // The outside folder, the replacement and the folder shown: each exactly as it was.
+          expect([files(ext), isLink(k.lock), files(k.lock), files(away)], tag).toEqual([{ 'partial.json': 'record A' }, how === 'link', { 'partial.json': 'record A' }, { 'partial.json': 'record A' }]);
+        }
+
+        // A RUN's ownership, across every consumer: just after an owner check — Apply's registry, log
+        // and move, Rollback's registry, log and reverse move, a stopped move's recovery, the automatic
+        // put-back, and Retry at its publication — the lock folder is replaced by a link to an outside
+        // copy, by a real copy, or its record leaf alone by a copy. The run never succeeds (its next
+        // write, or its publisher, refuses), and its end removes no replacement and nothing outside.
+        const lockConsumers: [string, (k: ReturnType<typeof box>, swap: () => void) => Promise<unknown>][] = [
+          ['apply registry', (k, swap) => k.go(REG, { at: when(['owned', 'PIECES.csv', swap]) })],
+          ['apply log', (k, swap) => k.go(MOVE, { at: when(['owned', 'RENAME-LOG.csv', swap]) })],
+          ['apply move', (k, swap) => k.go(MOVE, { at: when(['owned', A, swap]) })],
+          ['rollback registry', async (k, swap) => (await k.go(REG), k.back({ at: when(['owned', 'PIECES.csv', swap]) }))],
+          ['rollback log', async (k, swap) => (await k.go(MOVE), k.back({ at: when(['owned', 'RENAME-LOG.csv', swap]) }))],
+          ['rollback reverse move', async (k, swap) => (await k.go(MOVE), k.back({ at: when(['owned', B, swap]) }))],
+          [
+            'stopped-move recovery',
+            async (k, swap) => {
+              await expect(k.go(MOVE, { at: when(['unlink', A, () => { throw new Interrupted('power cut'); }]) })).rejects.toThrow(/power cut/);
+              return k.back({ at: when(['owned', B, swap]) });
+            },
+          ],
+          ['automatic put-back', (k, swap) => k.go(MOVE, { at: when(['link', B, () => writeFileSync(k.at(A), Buffer.alloc(500, 7))], ['owned', 'RENAME-LOG.csv', swap, 2]) })],
+          [
+            'retry',
+            async (k, swap) => {
+              const failing = async (text: string, hash: string, h: string) =>
+                publishIndex({ transport: { ...k.g.transport, getRef: async () => Promise.reject(new Error('GitHub refused getRef (HTTP 500)')) }, indexText: text, expectedContentHash: hash, confirm: archiveConfirmation(k.root, h) });
+              expect(await k.go(REG, { publish: failing })).toMatchObject({ ok: false });
+              return k.again({ publish: async (text: string, hash: string, h: string) => (swap(), k.g.publish(text, hash, h)) });
+            },
+          ],
+        ];
+        for (const [consumer, run] of lockConsumers) {
+          for (const how of ['link', 'copy', 'leaf'] as const) {
+            const tag = `run ownership, ${consumer}, ${how}`;
+            const k = box();
+            let ext = '';
+            let shown: Record<string, string> = {};
+            const swap = () => {
+              const [rec] = readdirSync(k.lock);
+              const bytes = readFileSync(join(k.lock, rec!), 'utf8');
+              if (how === 'leaf') replaceWith(join(k.lock, rec!), bytes)();
+              else {
+                renameSync(k.lock, join(k.base, 'lock-moved-away'));
+                if (how === 'link') symlinkSync((ext = outside(k, { [rec!]: bytes })), k.lock);
+                else {
+                  mkdirSync(k.lock);
+                  writeFileSync(join(k.lock, rec!), bytes);
+                }
+              }
+              shown = files(k.lock);
+            };
+            const end = await run(k, swap).then(
+              (r) => r as { ok: boolean; message?: string },
+              (e: Error) => ({ ok: false, message: e.message }),
+            );
+            // A later write is refused at its own owner check; a run with none left is refused by its publisher.
+            const said =
+              consumer === 'automatic put-back'
+                ? /everything it changed was put back/
+                : ['apply log', 'rollback reverse move', 'stopped-move recovery'].includes(consumer)
+                  ? /no longer holds the archive’s maintenance lock .*stopped before its next write/
+                  : /publication could not be confirmed \(The maintenance run that asked for this publication no longer holds the archive/;
+            expect([end.ok, end.message], tag).toEqual([false, expect.stringMatching(said)]);
+            expect([files(k.lock), Object.keys(shown).length], tag).toEqual([shown, 1]);
+            if (ext) expect(files(ext), tag).toEqual(shown);
+          }
+        }
+
+        // TAKING the lock: the run's private folder is replaced by a link to an outside folder before
+        // its record is written — nothing is written outside, and no lock is taken.
+        {
+          const k = box();
+          const ext = outside(k);
+          let priv = '';
+          const at = (point: string, name: string) => {
+            if (point !== 'lock-record') return;
+            priv = name;
+            renameSync(k.at(name), join(k.base, 'private-moved-away'));
+            symlinkSync(ext, k.at(name));
+          };
+          await expect(k.go(REG, { at }), 'private folder linked').rejects.toThrow(/not a real folder in the archive/);
+          expect([readdirSync(ext), readdirSync(join(k.base, 'private-moved-away')), existsSync(k.lock), isLink(k.at(priv))], 'private folder linked').toEqual([[], [], false, true]);
+        }
+        // … or by another writer's real folder after the record is written, with the archive free
+        // (it becomes the lock: refused as replaced, kept) or already held (the take fails): the
+        // failure's cleanup removes nothing of theirs — not even a file under this run's record name.
+        for (const held of [false, true]) {
+          const tag = held ? 'private folder replaced, archive held' : 'private folder replaced, archive free';
+          const k = box();
+          if (held) {
+            mkdirSync(k.lock);
+            writeFileSync(join(k.lock, `${dead}.json`), deadRecord);
+          }
+          let priv = '';
+          const theirs = (name: string) => ({ 'theirs.txt': 'another writer', [`${name.slice(ARCHIVE_LOCK.length + 1)}.json`]: 'theirs too' });
+          const at = (point: string, name: string) => {
+            if (point !== 'lock-take') return;
+            priv = name;
+            renameSync(k.at(name), join(k.base, 'private-moved-away'));
+            mkdirSync(k.at(name));
+            for (const [n, t] of Object.entries(theirs(name))) writeFileSync(join(k.at(name), n), t);
+          };
+          await expect(k.go(REG, { at }), tag).rejects.toThrow(held ? /maintenance lock is held by run 4f4f4f4f/ : /lock was replaced as this run took it/);
+          expect(files(held ? k.at(priv) : k.lock), tag).toEqual(theirs(priv));
+          if (held) expect(files(k.lock), tag).toEqual({ [`${dead}.json`]: deadRecord });
+        }
+
+        // PUBLISHERS read the lock as objects: its folder replaced just after its lstat — by a link to
+        // an outside copy, to an EMPTY outside folder, or by a real copy — refuses the maintenance
+        // publisher and the scheduled job alike; and a real copy standing at the name is not the holder.
+        for (const how of ['link', 'empty link', 'copy'] as const) {
+          const tag = `publisher read, ${how}`;
+          const k = box();
+          mkdirSync(k.lock);
+          writeFileSync(join(k.lock, `${dead}.json`), deadRecord);
+          const holder = readArchiveLock(k.root).holder;
+          const ext = outside(k, how === 'empty link' ? {} : { [`${dead}.json`]: deadRecord });
+          const swap = () => {
+            renameSync(k.lock, join(k.base, 'lock-moved-away'));
+            if (how === 'link' || how === 'empty link') return symlinkSync(ext, k.lock);
+            mkdirSync(k.lock);
+            writeFileSync(join(k.lock, `${dead}.json`), deadRecord);
+          };
+          for (const h of [holder, undefined]) {
+            const read = (point: string) => point === 'read-lock' && swap();
+            expect(() => archiveConfirmation(k.root, h, read)(), `${tag} ${h ? 'holder' : 'scheduled'}`).toThrow(/changed while it was read/);
+            rmSync(k.lock, { recursive: !isLink(k.lock) });
+            renameSync(join(k.base, 'lock-moved-away'), k.lock);
+          }
+          if (how === 'copy') {
+            swap();
+            expect(() => archiveConfirmation(k.root, holder)(), tag).toThrow(/no longer holds the archive/);
+          }
+        }
+      }
+
       // --- A FAILED PUBLICATION proves only its own attempt, in every current instruction too -
       // An earlier or scheduled write whose answer was lost may still land, so no operator page
       // may promise that a failure leaves the branch, or "the previous index", as it was.
@@ -1428,7 +1604,7 @@ describe('maintaining the Setar archive', () => {
           }),
         ).toThrow(/not the record you saw/);
         await expect(d).rejects.toThrow(/maintenance lock is held by run/);
-        expect(readArchiveLock(k.root).token).toBe(cHolder);
+        expect(readArchiveLock(k.root).holder).toBe(cHolder);
         resume();
         expect(await c).toMatchObject({ ok: true, status: 'published' });
         expect(existsSync(k.lock)).toBe(false);
@@ -1449,7 +1625,7 @@ describe('maintaining the Setar archive', () => {
         const d2 = applyMaintenance({ root: k2.root, state: otherState, action: later, previewId: planMaintenance(k2.root, later).id, publish: async (text: string, hash: string, h: string) => ((dHolder = h), await gateD, k2.g.publish(text, hash, h)) });
         resumeC();
         expect(await c2).toMatchObject({ ok: false, message: expect.stringMatching(/no longer holds the archive/) });
-        expect(readArchiveLock(k2.root).token).toBe(dHolder);
+        expect(readArchiveLock(k2.root).holder).toBe(dHolder);
         resumeD();
         expect(await d2).toMatchObject({ ok: true, status: 'published' });
         expect(existsSync(k2.lock)).toBe(false);
```

**Paths the rework touched:**

- `docs/nas-topology.md`
- `docs/setar-archive.md`
- `scripts/publish-setar-index.mjs`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
6ec841d Setar maintenance proves every lock operation on the exact folder and record, never a swappable child path

Invariant: every operation on the archive's maintenance lock addresses the
lock folder and the exact record it owns or the operator approved, as
objects (by inode), never through a path beneath the bound archive that can
be replaced between a check and its act. Doubt reads as held, never absent.

Choke points:
- readArchiveLock (publish-setar-index.mjs) is the one reader: it enters the
  lock folder proved by inode, reads entries by bare name with O_NOFOLLOW and
  fstat identity, proves the folder still at its name in the same archive
  afterwards, and throws (never null) if anything moved. Its digest covers the
  folder's inode; a valid record carries `holder` = token + folder + record
  inodes (`lockHolder`).
- removeLockEntry is the one remover: a bare name inside a proved folder, set
  aside, judged by a predicate (operator digest, or a run's record inode, plus
  the folder still bound), else put back.

Consumers, each fixed or checked:
- lock(): record written inside its own private folder entered by inode;
  cleanup removes only its own record by inode, then rmdir (never recursive);
  ownership proved right after the rename. New seams lock-record/lock-take.
- assertOwner (every Apply/Rollback/stopped-move/put-back write): holder
  equality through readArchiveLock — catches a linked folder, a real
  replacement folder and a replaced record leaf.
- unlock/release (end of Apply, Retry, Rollback; lock's own failure path):
  inside the proved lock folder, the owner's record by inode only.
- releaseBound/releaseLock (operator): inside the very folder shown, entries
  judged with stillBound; a link or other folder at the name is stale.
- archiveConfirmation (maintenance and scheduled publishers): holder string
  compares token AND exact objects; the run passes owner.holder through
  publishWithRunner/run-setar-index.sh unchanged (opaque argument). Journ
… (truncated)

725f7f5 Setar maintenance ownership proof covers every lock consumer; a release drops the lock folder only from the proved archive

Extends the exact-lock-object invariant's proof from Apply alone to every
consumer of a run's ownership: Apply (registry, log, move), Rollback
(registry, log, reverse move), a stopped move's recovery, the automatic
put-back and Retry (swap at its publication), each against a lock folder
linked outside, replaced by a real copy, or its record leaf replaced. A
consumer with a later write is pinned to that write's own owner refusal
(a token-only ownership check is now caught); one with none left to its
publisher's holder refusal; in every case the replacement and the outside
folder are left exactly as they were.

unlock now proves it is in the bound archive before it acts, and drops the
empty lock folder only after that proof — never from a working directory a
failed re-entry or lock read left unproved.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01QFUx961GtREwqe4hYQacET
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
