---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 5bfcc426a6e77c829dd4c3147829c5a5f469be19
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: maintenance-recovery-preserves-concurrent-state
    summary: "P1: refused lock restoration still destroys an unapproved record
      during interruption or failed recreation, and loses later writes to its
      original file."
    counterexample: "HEAD 155d7066f8d1d9085129f9398f9fbe634191b5fe; patch
      5bfcc426a6e77c829dd4c3147829c5a5f469be19. Invariant: recovery preserves
      every record it is not authorised to remove, including its original file
      and later open-handle writes, throughout interruption and I/O failure. In
      scripts/setar-archive-maintenance.mjs:559-571, rejected B is restored at
      its public name; a writer replaces or removes that name; unlinkSync(aside)
      removes B's last name before recreation. A process cut or ENOSPC during
      recreation leaves no B. Successful regular-file recreation makes a new
      inode, so later writes through a handle already open on B are lost when
      that handle closes. File-free execution of the current production helper
      with a modelled filesystem reproduced ten byte-loss cases across regular
      files/symlinks and replacement/removal; fourteen clean controls passed.
      All direct consumers swept: failed lock-acquisition cleanup :432, owned
      unlock :494, operator legacy release :615 and folder release :621. Owned
      unlock covers Apply, automatic recovery, Retry and Rollback, including
      stopped moves. Checked clean for corresponding controls: stable refused
      restoration, authorised removal with a newer public record, occupied-name
      refusal, and sibling putBack/retireKeeping under replacement/removal and
      interruption; publisher lock readers perform no removal. The new test
      block at tests/setar-maintenance.test.ts:1392 checks only resulting
      bytes/targets, omitting original-file identity, later open-handle saves
      and the destructive gap. Extend the SAME exact ac-2 title, setar guided
      maintenance is reversible stale safe and idempotent without altering
      media, across these cases and every removal caller. Keep an independently
      named original before retiring any name, using the existing preservation
      rule. No files or records changed; no wholesale Check rerun or live
      NAS/GitHub/OS-crash proof."
createdAt: 2026-11-01T04:06:42.781Z
sealedAt: 2026-11-01T12:25:13.564Z
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
- **Diff patch-id:** `5bfcc426a6e77c829dd4c3147829c5a5f469be19`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: a refused lock removal can still delete another writer's record during restoration.
  _counterexample:_ HEAD 725f7f554e007a5acc124ab9faf11fca0e9e8fc8; patch d36cc5fee780763b0001fda00ad541a5b785aa16. Invariant: recovery must preserve every record it is not authorised to remove, even when its public name changes concurrently. In removeLockEntry (scripts/setar-archive-maintenance.mjs:540-549), rejected record B is linked or recreated at its public name, then its private aside is unlinked unconditionally. A writer atomically saves C at the public name after that link and before the unlink: B loses its last name. Five file-free production-body probes reproduce this through operator release of a legacy file, folder file and legacy symlink, owned unlock, and failed lock-acquisition cleanup; operator release nevertheless reports nothing was changed. Direct consumers swept: lock cleanup line 432, unlock line 494, legacy release line 593, folder release line 599; unlock covers Apply, automatic recovery, Retry and Rollback including stopped moves. Checked clean for the corresponding probed cases: stable release, lock-folder link/copy replacement, owner token-leaf replacement, private-folder replacement before record creation, publisher lock-parent replacement, and sibling putBack/retireKeeping preservation. Nineteen control assertions pass; five restore races lose B. Extend the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, across replacement/removal after the restoration link, both regular-file and symlink branches, and every removal caller. Preserve unapproved records under private names using the existing preservation rule. No files or records changed; no wholesale Check rerun or live NAS/GitHub/OS-crash proof.

**What changed since the previously reviewed head:**

```diff
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index 0beb1ea70bde9921b925bb2dff17daaee5d466ad..ed75138446b971b0c650eb3498013ef605223764 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -30,7 +30,7 @@
 
 import { createHash, randomUUID } from 'node:crypto';
 import { spawnSync } from 'node:child_process';
-import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
+import { closeSync, constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
 import { hostname } from 'node:os';
 import { basename, dirname, join, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -429,7 +429,7 @@ function lock(arc, at = noSeam) {
     renameSync(tmp, ARCHIVE_LOCK);
   } catch (err) {
     try {
-      if (record) inFolder(arc, tmp, (stillBound) => same(statSync('.', { bigint: true }), folder) && removeLockEntry(name, (st) => same(st, record) && stillBound()));
+      if (record) inFolder(arc, tmp, (stillBound) => same(statSync('.', { bigint: true }), folder) && removeLockEntry(name, (st) => same(st, record) && stillBound(), at, join(tmp, name)));
     } catch {
       // not this run's folder any more: whatever stands there is left
     }
@@ -441,7 +441,7 @@ function lock(arc, at = noSeam) {
     if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR'].includes(err?.code)) throw lockRefusal();
     throw err;
   }
-  const owner = { token, folder, record, holder: lockHolder(token, folder, record) };
+  const owner = { token, folder, record, holder: lockHolder(token, folder, record), at };
   try {
     if (!holds(owner)) throw new Refusal('The archive’s lock was replaced as this run took it; nothing was changed. Run release-lock to see it.');
     refuseLeftovers();
@@ -491,7 +491,7 @@ function dropEmptyLock() {
 function unlock(arc, owner) {
   try {
     ensureHome(arc);
-    inFolder(arc, ARCHIVE_LOCK, (stillBound) => same(statSync('.', { bigint: true }), owner.folder) && removeLockEntry(`${owner.token}.json`, (st) => same(st, owner.record) && stillBound()));
+    inFolder(arc, ARCHIVE_LOCK, (stillBound) => same(statSync('.', { bigint: true }), owner.folder) && removeLockEntry(`${owner.token}.json`, (st) => same(st, owner.record) && stillBound(), owner.at, join(ARCHIVE_LOCK, `${owner.token}.json`)));
     dropEmptyLock(); // only from the proved archive
   } catch (err) {
     if (!(err instanceof Refusal)) throw err; // not in the archive, or no real folder at the name: nothing of this run's to remove there
@@ -519,8 +519,11 @@ function release(arc, owner) {
  * held the name at that instant — so an entry put at that name since, or
  * replacing it in the judgement's instant, is never removed: it is linked
  * back, never over anything, or kept under the private name and said. Returns
- * whether it removed the entry. `at` is the test seam, between the move and
- * the judgement.
+ * whether it removed the entry. An entry linked back is unlinked from its
+ * private name only once `name` is proved to hold it after; a writer who
+ * replaced or removed `name` meanwhile leaves it recreated under the private
+ * name and said. `at` is the test seam: between the move and the judgement,
+ * and after the link back (`restored`).
  */
 function removeLockEntry(name, isIt, at = noSeam, label = name) {
   const aside = `${name}.releasing-${randomUUID()}`;
@@ -536,18 +539,37 @@ function removeLockEntry(name, isIt, at = noSeam, label = name) {
     unlinkSync(aside);
     return true;
   }
+  const kept = (stands = true) => new Refusal(`The lock changed while it was being released${stands ? ', and a newer one now stands' : ''}; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}. Nothing else was removed.`);
   try {
     if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), name);
     else if (st.isFile()) linkSync(aside, name);
     else renameSync(aside, name); // a folder: replaces only an empty one, never anyone's record
   } catch (err) {
-    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) {
-      throw new Refusal(`The lock changed while it was being released, and a newer one now stands; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}. Nothing else was removed.`);
-    }
+    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) throw kept();
     throw err;
   }
-  if (!st.isDirectory()) unlinkSync(aside); // `name` holds that very file again
-  return false;
+  if (st.isDirectory()) return false;
+  // `name` holds that entry again, but a writer may replace it before the private name goes. The
+  // entry is held open (its inode can't be reused) and its target read; once the private name is
+  // gone, if `name` no longer holds it, it is recreated under that private name — never over anything — and said.
+  const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
+  const fd = target === null ? openSync(aside, 'r') : null;
+  try {
+    at('restored', label);
+    unlinkSync(aside);
+    let now = null;
+    try {
+      now = lstatSync(name, { bigint: true });
+      if (target === null ? same(now, st) : now.isSymbolicLink() && readlinkSync(name) === target) return false;
+    } catch {
+      // gone, or replaced as it was read: not back
+    }
+    if (target === null) writeFileSync(aside, readFileSync(fd), { flag: 'wx' });
+    else symlinkSync(target, aside);
+    throw kept(Boolean(now));
+  } finally {
+    if (fd !== null) closeSync(fd);
+  }
 }
 
 /**
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index 26e76815ede1c9eb025bcbfa167a357384044c24..c0508e49e04c7ad0e029907da11f32e8486b7f44 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -1,8 +1,8 @@
 import { execFile } from 'node:child_process';
 import { createHash } from 'node:crypto';
-import { chmodSync, closeSync, cpSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
+import { chmodSync, closeSync, cpSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
 import { tmpdir } from 'node:os';
-import { dirname, join } from 'node:path';
+import { basename, dirname, join } from 'node:path';
 import { promisify } from 'node:util';
 import { describe, expect, it, vi } from 'vitest';
 // @ts-expect-error — untyped operator tools; these are the real ones.
@@ -1389,6 +1389,86 @@ describe('maintaining the Setar archive', () => {
         }
       }
 
+      // --- A REJECTED entry linked back survives a writer at its name ------
+      // After the entry a removal refused is linked back at its name, another writer replaces that
+      // name or removes it before the private name goes: through every removal caller — the
+      // operator's release of a legacy file, a folder file or a legacy link, a run's own release,
+      // and a failed take's cleanup — and for a file and a link alike, the entry is never lost: it
+      // stays under its private name, said (the operator's release says it; a run's end keeps it).
+      {
+        type Kept = { kind: 'file' | 'link'; v: string };
+        /** Another writer's atomic save of a file, or of a link, at `p`. */
+        const put = (p: string, { kind, v }: Kept) => {
+          if (kind === 'file') return replaceWith(p, v)();
+          symlinkSync(v, `${p}.editor`);
+          renameSync(`${p}.editor`, p);
+        };
+        const show = (p: string) => {
+          try {
+            return lstatSync(p).isSymbolicLink() ? `link:${readlinkSync(p)}` : `file:${readFileSync(p, 'utf8')}`;
+          } catch {
+            return null;
+          }
+        };
+        const C: Kept = { kind: 'file', v: 'record C' };
+        const after = (p: string, edit: 'replace' | 'remove') => () => (edit === 'remove' ? rmSync(p) : put(p, C));
+        /** What stands at the public name, and every entry kept under a private name beside it. */
+        const outcome = (p: string) => [show(p), readdirSync(dirname(p)).filter((n) => n.includes('.releasing-')).map((n) => show(join(dirname(p), n)))];
+        for (const edit of ['replace', 'remove'] as const) {
+          const stands = edit === 'replace' ? 'file:record C' : null;
+          const said = new RegExp(`lock changed while it was being released${edit === 'replace' ? ', and a newer one now stands' : ''}; what had replaced the record you saw is kept as .*\\.releasing-`);
+          // The OPERATOR's release: A shown, B put at its name before the release, the writer at the link back.
+          for (const [form, A, B] of [
+            ['legacy file', { kind: 'file', v: 'record A' }, { kind: 'file', v: 'record B' }],
+            ['folder file', { kind: 'file', v: 'record A' }, { kind: 'file', v: 'record B' }],
+            ['legacy link', { kind: 'link', v: 'to-a' }, { kind: 'link', v: 'to-b' }],
+          ] as const) {
+            const tag = `operator release, ${form}, ${edit}`;
+            const k = box();
+            const inFolder = form === 'folder file';
+            if (inFolder) mkdirSync(k.lock);
+            const p = inFolder ? join(k.lock, 'partial.json') : k.lock;
+            put(p, A);
+            const id = readArchiveLock(k.root).digest.slice(0, 16);
+            const label = inFolder ? join(ARCHIVE_LOCK, 'partial.json') : ARCHIVE_LOCK;
+            expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, () => put(p, B)], ['restored', label, after(p, edit)]) }), tag).toThrow(said);
+            expect(outcome(p), tag).toEqual([stands, [`${B.kind}:${B.v}`]]);
+          }
+          for (const B of [{ kind: 'file', v: 'record B' }, { kind: 'link', v: 'to-b' }] as const) {
+            // A RUN's own release: its record leaf replaced by B just after an owner check.
+            {
+              const tag = `run release, ${B.kind}, ${edit}`;
+              const k = box();
+              let p = '';
+              const at = (point: string, name: string) => {
+                if (point === 'owned' && name === 'PIECES.csv') put((p = join(k.lock, readdirSync(k.lock)[0]!)), B);
+                if (point === 'restored' && p && name === join(ARCHIVE_LOCK, basename(p))) after(p, edit)();
+              };
+              const end = await k.go(REG, { at }).then(
+                (r) => r as { ok: boolean },
+                () => ({ ok: false }),
+              );
+              expect([end.ok, outcome(p)], tag).toEqual([false, [stands, [`${B.kind}:${B.v}`]]]);
+            }
+            // A failed TAKE's cleanup: the archive held, the private record replaced by B before the take.
+            {
+              const tag = `take cleanup, ${B.kind}, ${edit}`;
+              const k = box();
+              const dead = ['5f5f5f5f', '0000', '4000', '8000', '000000000000'].join('-');
+              mkdirSync(k.lock);
+              writeFileSync(join(k.lock, `${dead}.json`), JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' }));
+              let p = '';
+              const at = (point: string, name: string) => {
+                if (point === 'lock-take') put((p = join(k.at(name), `${name.slice(ARCHIVE_LOCK.length + 1)}.json`)), B);
+                if (point === 'restored' && p && name === join(basename(dirname(p)), basename(p))) after(p, edit)();
+              };
+              await expect(k.go(REG, { at }), tag).rejects.toThrow(/maintenance lock is held by run 5f5f5f5f/);
+              expect(outcome(p), tag).toEqual([stands, [`${B.kind}:${B.v}`]]);
+            }
+          }
+        }
+      }
+
       // --- EVERY LOCK OPERATION addresses the exact folder and object, never a path swapped under it -
       // The lock's folder, a run's private folder or its record replaced — by a link to a folder
       // outside the archive, by a real folder holding a copy, or the record leaf alone — at the
```

**Paths the rework touched:**

- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
155d706 Setar maintenance keeps a refused lock entry when its name is replaced or removed after the link back

Invariant: a lock-entry removal preserves every entry it is not authorised to
remove, even when that entry's public name changes after it is linked back.
removeLockEntry now holds a refused file open (no inode reuse) or its link
target, drops the private name, and only then proves the public name still
holds it; otherwise it recreates the entry under the private name (never over
anything) and refuses, saying where it is kept.

Consumers (all route through removeLockEntry, the one choke point):
- operator release-lock, legacy file / folder file / legacy link: fixed, tested
- a run's own unlock (Apply, Rollback, Retry, automatic recovery, stopped
  moves all end there): fixed, tested via the seam now carried on the owner
- failed lock-acquisition cleanup: fixed, tested
- folder entry restored by rename (atomic, no second name): checked clean

Proof: the ac-2 test gains a block racing a writer (replace / remove) at the
new `restored` seam, file and link, through every caller; it fails on the
previous code (B lost) and passes now.

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
