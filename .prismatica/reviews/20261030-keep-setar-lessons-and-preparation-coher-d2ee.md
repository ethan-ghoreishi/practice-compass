---
id: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
contractId: 20261030-keep-setar-lessons-and-preparation-coher-d2ee
patchId: 31a9461ec314222d759ccf55428e86cd5181f6b1
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-11-01T12:51:30.671Z
sealedAt: 2026-11-01T14:37:37.273Z
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
- **Diff patch-id:** `31a9461ec314222d759ccf55428e86cd5181f6b1`
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

- **maintenance-recovery-preserves-concurrent-state** — P1: refused lock restoration still destroys an unapproved record during interruption or failed recreation, and loses later writes to its original file.
  _counterexample:_ HEAD 155d7066f8d1d9085129f9398f9fbe634191b5fe; patch 5bfcc426a6e77c829dd4c3147829c5a5f469be19. Invariant: recovery preserves every record it is not authorised to remove, including its original file and later open-handle writes, throughout interruption and I/O failure. In scripts/setar-archive-maintenance.mjs:559-571, rejected B is restored at its public name; a writer replaces or removes that name; unlinkSync(aside) removes B's last name before recreation. A process cut or ENOSPC during recreation leaves no B. Successful regular-file recreation makes a new inode, so later writes through a handle already open on B are lost when that handle closes. File-free execution of the current production helper with a modelled filesystem reproduced ten byte-loss cases across regular files/symlinks and replacement/removal; fourteen clean controls passed. All direct consumers swept: failed lock-acquisition cleanup :432, owned unlock :494, operator legacy release :615 and folder release :621. Owned unlock covers Apply, automatic recovery, Retry and Rollback, including stopped moves. Checked clean for corresponding controls: stable refused restoration, authorised removal with a newer public record, occupied-name refusal, and sibling putBack/retireKeeping under replacement/removal and interruption; publisher lock readers perform no removal. The new test block at tests/setar-maintenance.test.ts:1392 checks only resulting bytes/targets, omitting original-file identity, later open-handle saves and the destructive gap. Extend the SAME exact ac-2 title, setar guided maintenance is reversible stale safe and idempotent without altering media, across these cases and every removal caller. Keep an independently named original before retiring any name, using the existing preservation rule. No files or records changed; no wholesale Check rerun or live NAS/GitHub/OS-crash proof.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index b14de77253c88d4dcc8bf127a2a3146901ed4153..b0d45dde7e25ebf8af6bd1eba45ccaa001044372 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -713,8 +713,11 @@ $M release-lock [--record <id>]   # a lock no run holds: shown, then released by
   publisher checks it; a release removes only that exact record, so it never
   takes a newer run's lock: each entry the operator saw is first moved to a
   private `.releasing-…` name and judged there against what was shown, removed
-  only if it is that, else linked back (never over anything) or kept and
-  named — a replacement at the same name, legacy lock file or folder entry
+  only if it is that. Anything else keeps that private name — the tool never
+  unlinks it, so its very file survives a cut, a failure or a writer at the
+  lock's name — and is linked back as well (never over anything) and named;
+  the operator removes the spare name once the lock's name holds that same
+  file (`ls -li`; for a link, the same `readlink` target) — a replacement at the same name, legacy lock file or folder entry
   alike, is never removed. Every lock operation addresses objects, never a
   path that could be swapped under it: a run's ownership is the exact folder
   and record file it made (by inode), its record is written and removed only
diff --git a/scripts/setar-archive-maintenance.mjs b/scripts/setar-archive-maintenance.mjs
index ed75138446b971b0c650eb3498013ef605223764..84c472e6f3993fa64a47055162db2b9ac0eac55e 100644
--- a/scripts/setar-archive-maintenance.mjs
+++ b/scripts/setar-archive-maintenance.mjs
@@ -30,7 +30,7 @@
 
 import { createHash, randomUUID } from 'node:crypto';
 import { spawnSync } from 'node:child_process';
-import { closeSync, constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
+import { constants, copyFileSync, existsSync, linkSync, lstatSync, mkdirSync, readdirSync, readFileSync, readlinkSync, realpathSync, renameSync, rmdirSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
 import { hostname } from 'node:os';
 import { basename, dirname, join, resolve, sep } from 'node:path';
 import { fileURLToPath } from 'node:url';
@@ -517,13 +517,15 @@ function release(arc, owner) {
  * go (`isIt(lstat, path)`: the operator's digest, or a run's own record by
  * inode), judged on a private name it was first moved to — atomic: whatever
  * held the name at that instant — so an entry put at that name since, or
- * replacing it in the judgement's instant, is never removed: it is linked
- * back, never over anything, or kept under the private name and said. Returns
- * whether it removed the entry. An entry linked back is unlinked from its
- * private name only once `name` is proved to hold it after; a writer who
- * replaced or removed `name` meanwhile leaves it recreated under the private
- * name and said. `at` is the test seam: between the move and the judgement,
- * and after the link back (`restored`).
+ * replacing it in the judgement's instant, is never removed. Returns whether
+ * it removed the entry. A refused file or link is NEVER unlinked from its
+ * private name — no call removes a name only while another still stands, so
+ * that name is what keeps its very inode (and an open handle's later writes)
+ * through any cut or failure. It is linked back at `name` as well (never over
+ * anything: the lock stays held for the publisher, which reads only that
+ * name), and said. A refused folder is one atomic move back, or kept. `at` is
+ * the test seam: after the move (`judge-release`) and before the link back
+ * (`restore`).
  */
 function removeLockEntry(name, isIt, at = noSeam, label = name) {
   const aside = `${name}.releasing-${randomUUID()}`;
@@ -539,37 +541,22 @@ function removeLockEntry(name, isIt, at = noSeam, label = name) {
     unlinkSync(aside);
     return true;
   }
-  const kept = (stands = true) => new Refusal(`The lock changed while it was being released${stands ? ', and a newer one now stands' : ''}; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}. Nothing else was removed.`);
+  at('restore', label);
+  let back = true;
   try {
     if (st.isSymbolicLink()) symlinkSync(readlinkSync(aside), name);
     else if (st.isFile()) linkSync(aside, name);
-    else renameSync(aside, name); // a folder: replaces only an empty one, never anyone's record
-  } catch (err) {
-    if (['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) throw kept();
-    throw err;
-  }
-  if (st.isDirectory()) return false;
-  // `name` holds that entry again, but a writer may replace it before the private name goes. The
-  // entry is held open (its inode can't be reused) and its target read; once the private name is
-  // gone, if `name` no longer holds it, it is recreated under that private name — never over anything — and said.
-  const target = st.isSymbolicLink() ? readlinkSync(aside) : null;
-  const fd = target === null ? openSync(aside, 'r') : null;
-  try {
-    at('restored', label);
-    unlinkSync(aside);
-    let now = null;
-    try {
-      now = lstatSync(name, { bigint: true });
-      if (target === null ? same(now, st) : now.isSymbolicLink() && readlinkSync(name) === target) return false;
-    } catch {
-      // gone, or replaced as it was read: not back
+    else {
+      renameSync(aside, name); // a folder: replaces only an empty one, never anyone's record
+      return false;
     }
-    if (target === null) writeFileSync(aside, readFileSync(fd), { flag: 'wx' });
-    else symlinkSync(target, aside);
-    throw kept(Boolean(now));
-  } finally {
-    if (fd !== null) closeSync(fd);
+  } catch (err) {
+    if (!['EEXIST', 'ENOTEMPTY', 'ENOTDIR', 'EISDIR'].includes(err?.code)) throw err;
+    back = false;
   }
+  throw new Refusal(
+    `The lock changed while it was being released${back ? '' : ', and a newer one now stands'}; what had replaced the record you saw is kept as ${label.replace(/[^/]*$/, aside)}${back ? `, and again at ${label}` : ''}. Nothing was removed.`,
+  );
 }
 
 /**
@@ -609,6 +596,7 @@ function releaseBound(arc, record, at) {
   }
   const judged = (digest, stillBound) => (st, aside) => (st.isFile() || st.isSymbolicLink()) && lockEntryDigest(aside) === digest && stillBound();
   let removed = 0;
+  const kept = [];
   if (!held.folder) {
     // An earlier version's lock FILE: its one name, in the bound archive itself.
     const [[p, digest]] = held.entries;
@@ -618,7 +606,15 @@ function releaseBound(arc, record, at) {
       removed = inFolder(arc, ARCHIVE_LOCK, (stillBound) => {
         if (!same(statSync('.', { bigint: true }), held.folder)) return 0; // another folder at the name now: not the one shown
         let n = 0;
-        for (const [p, digest] of held.entries) if (removeLockEntry(basename(p), judged(digest, stillBound), at, p)) n += 1;
+        // Each entry judged on its own: one refused (kept, said below) never stops the rest.
+        for (const [p, digest] of held.entries) {
+          try {
+            if (removeLockEntry(basename(p), judged(digest, stillBound), at, p)) n += 1;
+          } catch (err) {
+            if (!(err instanceof Refusal)) throw err;
+            kept.push(err.message.replace(/ Nothing was removed\.$/, ''));
+          }
+        }
         return n;
       });
     } catch (err) {
@@ -627,6 +623,9 @@ function releaseBound(arc, record, at) {
     }
   }
   dropEmptyLock();
+  if (kept.length) {
+    throw new Refusal(`${kept.join(' ')} ${removed ? `${removed} of its ${held.entries.length} entries, still exactly as shown, were removed; nothing else was.` : 'Nothing was removed.'}`);
+  }
   if (removed < held.entries.length) {
     if (!removed) throw stale();
     throw new Refusal(`Part of the lock changed since you saw it: ${removed} of its ${held.entries.length} entries, still exactly as shown, were removed; the rest is left as it is. Run release-lock again to see it.`);
@@ -646,7 +645,7 @@ function refuseLeftovers() {
   const found = [];
   for (const d of readdirSync('.', { withFileTypes: true })) {
     // A lock a release-lock set aside and stopped before judging — a file, a link or a newer run's folder alike.
-    if (d.name.startsWith(`${ARCHIVE_LOCK}.releasing-`)) found.push(`  mv -n '${d.name}' '${ARCHIVE_LOCK}'   (a lock record a release set aside; then run release-lock to see it)`);
+    if (d.name.startsWith(`${ARCHIVE_LOCK}.releasing-`)) found.push(`  mv -n '${d.name}' '${ARCHIVE_LOCK}'   (a lock record a release set aside; if ${ARCHIVE_LOCK} is that very entry again — ls -li shows one inode, or for a link readlink shows one target — rm only this name instead; then run release-lock to see it)`);
     if (d.isFile() || d.isSymbolicLink()) {
       const m = /^\.(PIECES\.csv|RENAME-LOG\.csv)\.captured-/.exec(d.name);
       if (m) found.push(`  mv -n '${d.name}' '${m[1]}'   (if ${m[1]} is there, it is the copy a write replaced: mv -n '${d.name}' '${d.name.replace('.captured-', '.superseded-')}')`);
diff --git a/tests/setar-maintenance.test.ts b/tests/setar-maintenance.test.ts
index c0508e49e04c7ad0e029907da11f32e8486b7f44..ec6358b0b5264ee291bb45efb16d8dc0c9c91d4d 100644
--- a/tests/setar-maintenance.test.ts
+++ b/tests/setar-maintenance.test.ts
@@ -2,7 +2,7 @@ import { execFile } from 'node:child_process';
 import { createHash } from 'node:crypto';
 import { chmodSync, closeSync, cpSync, existsSync, utimesSync, linkSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync, writeSync, appendFileSync, renameSync } from 'node:fs';
 import { tmpdir } from 'node:os';
-import { basename, dirname, join } from 'node:path';
+import { dirname, join } from 'node:path';
 import { promisify } from 'node:util';
 import { describe, expect, it, vi } from 'vitest';
 // @ts-expect-error — untyped operator tools; these are the real ones.
@@ -1354,14 +1354,15 @@ describe('maintaining the Setar archive', () => {
         const entry = (k: ReturnType<typeof box>, asFolder: boolean) => (asFolder ? join(k.lock, 'partial.json') : k.lock);
         for (const asFolder of [false, true]) {
           const tag = asFolder ? 'folder entry' : 'legacy file';
-          // Replaced after it was shown: refused, the replacement stands byte for byte.
+          // Replaced after it was shown: refused, the replacement stands byte for byte — that very file, also kept under its private name.
           const k = box();
           lockOf(k, asFolder, 'record A');
           const id = readArchiveLock(k.root).digest.slice(0, 16);
           const replace = () => replaceWith(entry(k, asFolder), 'record B')();
-          expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, replace]) }), tag).toThrow(/not the record you saw/);
-          expect(readFileSync(entry(k, asFolder), 'utf8'), tag).toBe('record B');
-          expect(readdirSync(k.root).filter((n) => n.includes('.releasing-')), tag).toEqual([]);
+          expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, replace]) }), tag).toThrow(/is kept as .*\.releasing-.*, and again at/);
+          const keptDir = asFolder ? k.lock : k.root;
+          const spare = readdirSync(keptDir).filter((n) => n.includes('.releasing-'));
+          expect([readFileSync(entry(k, asFolder), 'utf8'), spare.length, spare.length && lstatSync(join(keptDir, spare[0]!)).ino === lstatSync(entry(k, asFolder)).ino], tag).toEqual(['record B', 1, true]);
           // A taken in its judgement's instant, B put at the freed name meanwhile: A alone is removed.
           const k2 = box();
           lockOf(k2, asFolder, 'record A');
@@ -1385,85 +1386,140 @@ describe('maintaining the Setar archive', () => {
           if (!asFolder) {
             rmSync(p3);
             await expect(k3.go(REG), tag).rejects.toThrow(new RegExp(`mv -n '${kept[0]!.replace(/\./g, '\\.')}' '\\${ARCHIVE_LOCK}'`));
+            await expect(k3.go(REG), tag).rejects.toThrow(/ls -li shows one inode, or for a link readlink shows one target — rm only this name instead/);
           }
         }
       }
 
-      // --- A REJECTED entry linked back survives a writer at its name ------
-      // After the entry a removal refused is linked back at its name, another writer replaces that
-      // name or removes it before the private name goes: through every removal caller — the
-      // operator's release of a legacy file, a folder file or a legacy link, a run's own release,
-      // and a failed take's cleanup — and for a file and a link alike, the entry is never lost: it
-      // stays under its private name, said (the operator's release says it; a run's end keeps it).
+      // A folder lock of TWO entries, one replaced after it was shown: the other, still exactly as
+      // shown, is removed; the replaced one is kept (and stands) — and the release says exactly that.
       {
-        type Kept = { kind: 'file' | 'link'; v: string };
+        const k = box();
+        mkdirSync(k.lock);
+        writeFileSync(join(k.lock, 'a.json'), 'record A');
+        writeFileSync(join(k.lock, 'b.json'), 'record B');
+        const id = readArchiveLock(k.root).digest.slice(0, 16);
+        expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, replaceWith(join(k.lock, 'b.json'), 'record B2')]) })).toThrow(
+          /is kept as .*b\.json\.releasing-.*, and again at .*b\.json\. 1 of its 2 entries, still exactly as shown, were removed; nothing else was\./,
+        );
+        const left = readdirSync(k.lock).sort();
+        expect([left.length, left[0], left[1]?.startsWith('b.json.releasing-'), readFileSync(join(k.lock, 'b.json'), 'utf8')]).toEqual([2, 'b.json', true, 'record B2']);
+      }
+
+      // --- A REFUSED entry keeps its very file, whatever happens around it --
+      // An entry a removal refused is never unlinked from the private name it was moved to: through
+      // every removal caller — the operator's release of a legacy file, a folder file or a legacy
+      // link, a run's own release, a failed take's cleanup — for a file and a link alike, with the
+      // run cut (or the disk full) after the move or before the link back, and the lock's name then
+      // replaced or removed by another writer: B's original inode keeps a private name, and a save
+      // through a handle already open on B lands in that kept file.
+      {
+        type Entry = { kind: 'file' | 'link'; v: string };
         /** Another writer's atomic save of a file, or of a link, at `p`. */
-        const put = (p: string, { kind, v }: Kept) => {
+        const put = (p: string, { kind, v }: Entry) => {
           if (kind === 'file') return replaceWith(p, v)();
           symlinkSync(v, `${p}.editor`);
           renameSync(`${p}.editor`, p);
         };
-        const show = (p: string) => {
-          try {
-            return lstatSync(p).isSymbolicLink() ? `link:${readlinkSync(p)}` : `file:${readFileSync(p, 'utf8')}`;
-          } catch {
-            return null;
-          }
-        };
-        const C: Kept = { kind: 'file', v: 'record C' };
-        const after = (p: string, edit: 'replace' | 'remove') => () => (edit === 'remove' ? rmSync(p) : put(p, C));
-        /** What stands at the public name, and every entry kept under a private name beside it. */
-        const outcome = (p: string) => [show(p), readdirSync(dirname(p)).filter((n) => n.includes('.releasing-')).map((n) => show(join(dirname(p), n)))];
-        for (const edit of ['replace', 'remove'] as const) {
-          const stands = edit === 'replace' ? 'file:record C' : null;
-          const said = new RegExp(`lock changed while it was being released${edit === 'replace' ? ', and a newer one now stands' : ''}; what had replaced the record you saw is kept as .*\\.releasing-`);
-          // The OPERATOR's release: A shown, B put at its name before the release, the writer at the link back.
-          for (const [form, A, B] of [
-            ['legacy file', { kind: 'file', v: 'record A' }, { kind: 'file', v: 'record B' }],
-            ['folder file', { kind: 'file', v: 'record A' }, { kind: 'file', v: 'record B' }],
-            ['legacy link', { kind: 'link', v: 'to-a' }, { kind: 'link', v: 'to-b' }],
-          ] as const) {
-            const tag = `operator release, ${form}, ${edit}`;
-            const k = box();
-            const inFolder = form === 'folder file';
-            if (inFolder) mkdirSync(k.lock);
-            const p = inFolder ? join(k.lock, 'partial.json') : k.lock;
-            put(p, A);
+        const dead = ['5f5f5f5f', '0000', '4000', '8000', '000000000000'].join('-');
+        type Caller = { name: string; kinds: Entry['kind'][]; said: RegExp; run: (k: ReturnType<typeof box>, B: Entry, placed: (p: string) => void, at: (point: string, name: string) => void) => Promise<unknown> };
+        const operator = (folder: boolean): Caller => ({
+          name: `operator release, ${folder ? 'folder' : 'legacy'}`,
+          kinds: folder ? ['file'] : ['file', 'link'],
+          said: /lock changed while it was being released; what had replaced the record you saw is kept as .*\.releasing-.*, and again at/,
+          run: async (k, B, placed, at) => {
+            if (folder) mkdirSync(k.lock);
+            const p = folder ? join(k.lock, 'partial.json') : k.lock;
+            put(p, B.kind === 'file' ? { kind: 'file', v: 'record A' } : { kind: 'link', v: 'to-a' });
             const id = readArchiveLock(k.root).digest.slice(0, 16);
-            const label = inFolder ? join(ARCHIVE_LOCK, 'partial.json') : ARCHIVE_LOCK;
-            expect(() => releaseLock({ root: k.root, record: id, at: when(['release', ARCHIVE_LOCK, () => put(p, B)], ['restored', label, after(p, edit)]) }), tag).toThrow(said);
-            expect(outcome(p), tag).toEqual([stands, [`${B.kind}:${B.v}`]]);
-          }
-          for (const B of [{ kind: 'file', v: 'record B' }, { kind: 'link', v: 'to-b' }] as const) {
-            // A RUN's own release: its record leaf replaced by B just after an owner check.
-            {
-              const tag = `run release, ${B.kind}, ${edit}`;
-              const k = box();
-              let p = '';
-              const at = (point: string, name: string) => {
-                if (point === 'owned' && name === 'PIECES.csv') put((p = join(k.lock, readdirSync(k.lock)[0]!)), B);
-                if (point === 'restored' && p && name === join(ARCHIVE_LOCK, basename(p))) after(p, edit)();
-              };
-              const end = await k.go(REG, { at }).then(
-                (r) => r as { ok: boolean },
-                () => ({ ok: false }),
-              );
-              expect([end.ok, outcome(p)], tag).toEqual([false, [stands, [`${B.kind}:${B.v}`]]]);
-            }
-            // A failed TAKE's cleanup: the archive held, the private record replaced by B before the take.
-            {
-              const tag = `take cleanup, ${B.kind}, ${edit}`;
-              const k = box();
-              const dead = ['5f5f5f5f', '0000', '4000', '8000', '000000000000'].join('-');
+            return releaseLock({ root: k.root, record: id, at: (point, name) => (point === 'release' ? (put(p, B), placed(p)) : at(point, name)) });
+          },
+        });
+        const callers: Caller[] = [
+          operator(false),
+          operator(true),
+          {
+            name: 'run release',
+            kinds: ['file', 'link'],
+            said: /publication could not be confirmed|no longer holds/,
+            run: (k, B, placed, at) =>
+              k.go(REG, {
+                at: (point: string, name: string) => {
+                  if (point === 'owned' && name === 'PIECES.csv') {
+                    const p = join(k.lock, readdirSync(k.lock)[0]!);
+                    put(p, B);
+                    placed(p);
+                  }
+                  at(point, name);
+                },
+              }).then((r) => {
+                if ((r as { ok: boolean }).ok) throw new Error('the run succeeded');
+                throw new Error((r as { message: string }).message);
+              }),
+          },
+          {
+            name: 'take cleanup',
+            kinds: ['file', 'link'],
+            said: /maintenance lock is held by run 5f5f5f5f/,
+            run: (k, B, placed, at) => {
               mkdirSync(k.lock);
               writeFileSync(join(k.lock, `${dead}.json`), JSON.stringify({ token: dead, pid: 1, host: 'h', since: 's' }));
-              let p = '';
-              const at = (point: string, name: string) => {
-                if (point === 'lock-take') put((p = join(k.at(name), `${name.slice(ARCHIVE_LOCK.length + 1)}.json`)), B);
-                if (point === 'restored' && p && name === join(basename(dirname(p)), basename(p))) after(p, edit)();
-              };
-              await expect(k.go(REG, { at }), tag).rejects.toThrow(/maintenance lock is held by run 5f5f5f5f/);
-              expect(outcome(p), tag).toEqual([stands, [`${B.kind}:${B.v}`]]);
+              return k.go(REG, {
+                at: (point: string, name: string) => {
+                  if (point === 'lock-take') {
+                    const p = join(k.at(name), `${name.slice(ARCHIVE_LOCK.length + 1)}.json`);
+                    put(p, B);
+                    placed(p);
+                  }
+                  at(point, name);
+                },
+              });
+            },
+          },
+        ];
+        const faults = {
+          none: null,
+          'cut after the move': ['judge-release', () => new Interrupted('power cut')],
+          'cut before the link back': ['restore', () => new Interrupted('power cut')],
+          'disk full at the link back': ['restore', () => Object.assign(new Error('no space left on device'), { code: 'ENOSPC' })],
+        } as const;
+        for (const caller of callers) {
+          for (const kind of caller.kinds) {
+            const B: Entry = kind === 'file' ? { kind, v: 'record B' } : { kind, v: 'to-b' };
+            for (const [fault, how] of Object.entries(faults)) {
+              for (const edit of ['replace', 'remove'] as const) {
+                const tag = `${caller.name}, ${kind}, ${fault}, writer ${edit}s`;
+                const k = box();
+                let p = '';
+                let ino = 0;
+                let fd: number | undefined;
+                const placed = (at: string) => {
+                  p = at;
+                  ino = lstatSync(p).ino;
+                  if (kind === 'file') fd = openSync(p, 'a'); // someone's handle, already open on B
+                };
+                const at = (point: string, name: string) => {
+                  if (how && point === how[0] && p && name === p.slice(k.root.length + 1)) throw how[1]();
+                };
+                const end = await caller.run(k, B, placed, at).then(
+                  () => 'returned',
+                  (e: Error) => e.message,
+                );
+                // A failed take's cleanup swallows its own failure and says the lock is held; the others stop with the fault.
+                expect(end, tag).toMatch(!how || caller.name === 'take cleanup' ? caller.said : /power cut|no space left/);
+                // Another writer at the lock's name, then a save through the handle already open on B.
+                if (edit === 'remove') rmSync(p, { force: true });
+                else put(p, { kind: 'file', v: 'record C' });
+                if (fd !== undefined) {
+                  writeSync(fd, ' saved later');
+                  closeSync(fd);
+                }
+                const dir = dirname(p);
+                const keeping = readdirSync(dir).filter((n) => lstatSync(join(dir, n)).ino === ino);
+                expect(keeping, tag).toEqual([expect.stringMatching(/\.releasing-/)]);
+                const kept = join(dir, keeping[0]!);
+                expect(kind === 'file' ? readFileSync(kept, 'utf8') : readlinkSync(kept), tag).toBe(kind === 'file' ? 'record B saved later' : 'to-b');
+              }
             }
           }
         }
@@ -1505,9 +1561,17 @@ describe('maintaining the Setar archive', () => {
           };
           const id = readArchiveLock(k.root).digest.slice(0, 16);
           const label = point === 'release' ? ARCHIVE_LOCK : join(ARCHIVE_LOCK, 'partial.json');
-          expect(() => releaseLock({ root: k.root, record: id, at: when([point, label, swap]) }), tag).toThrow(/not the record you saw/);
-          // The outside folder, the replacement and the folder shown: each exactly as it was.
-          expect([files(ext), isLink(k.lock), files(k.lock), files(away)], tag).toEqual([{ 'partial.json': 'record A' }, how === 'link', { 'partial.json': 'record A' }, { 'partial.json': 'record A' }]);
+          expect(() => releaseLock({ root: k.root, record: id, at: when([point, label, swap]) }), tag).toThrow(point === 'release' ? /not the record you saw/ : /is kept as .*\.releasing-.*, and again at/);
+          // The outside folder and the replacement exactly as they were; the folder shown keeps record A
+          // (refused while judged, it also keeps its private name: that very file, never unlinked).
+          const spare = Object.keys(files(away)).filter((n) => n.includes('.releasing-'));
+          expect([files(ext), isLink(k.lock), files(k.lock), files(away)], tag).toEqual([
+            { 'partial.json': 'record A' },
+            how === 'link',
+            { 'partial.json': 'record A' },
+            { 'partial.json': 'record A', ...Object.fromEntries(spare.map((n) => [n, 'record A'])) },
+          ]);
+          expect(spare.length, tag).toBe(point === 'release' ? 0 : 1);
         }
 
         // A RUN's ownership, across every consumer: just after an owner check — Apply's registry, log
@@ -1572,7 +1636,9 @@ describe('maintaining the Setar archive', () => {
                   ? /no longer holds the archive’s maintenance lock .*stopped before its next write/
                   : /publication could not be confirmed \(The maintenance run that asked for this publication no longer holds the archive/;
             expect([end.ok, end.message], tag).toEqual([false, expect.stringMatching(said)]);
-            expect([files(k.lock), Object.keys(shown).length], tag).toEqual([shown, 1]);
+            // A replaced record leaf is refused at the run's release: that very file stands, and keeps its private name too.
+            const spare = Object.keys(files(k.lock)).filter((n) => n.includes('.releasing-'));
+            expect([files(k.lock), Object.keys(shown).length, spare.length], tag).toEqual([{ ...shown, ...Object.fromEntries(spare.map((n) => [n, Object.values(shown)[0]])) }, 1, how === 'leaf' ? 1 : 0]);
             if (ext) expect(files(ext), tag).toEqual(shown);
           }
         }
```

**Paths the rework touched:**

- `docs/setar-archive.md`
- `scripts/setar-archive-maintenance.mjs`
- `tests/setar-maintenance.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
92c420b Setar maintenance never unlinks a refused lock entry's private name

Invariant: a lock-entry removal preserves every entry it is not authorised to
remove — its very file (inode), and writes through a handle already open on
it — through a process cut, an I/O failure, or a writer at the lock's name.

Method change: no filesystem call removes a name only while another name
still holds the same file, so any check-then-unlink leaves a gap. The
previous round's prove-then-unlink-then-recreate is removed. The atomic move
to the private `.releasing-` name is now the entry's guaranteed name: a
refused file or link is never unlinked from it. It is also linked back at the
lock's name (never over anything), because the scheduled publisher reads only
that name, and the release says both names. A refused folder is still one
atomic move back. The leftover instruction (refuseLeftovers) and
docs/setar-archive.md say how to drop the spare name once the lock's name
holds that same file.

Consumers, all through removeLockEntry (the one choke point):
- operator release-lock, legacy file / folder file / legacy link: fixed, tested
- a run's own unlock (Apply, Rollback, Retry, automatic recovery, stopped
  moves): fixed, tested
- failed lock-acquisition cleanup: fixed, tested
- publisher lock readers: perform no removal, checked clean

Proof (ac-2 test): every caller x file/link x {no fault, cut after the move,
cut before the link back, ENOSPC at the link back} x writer replaces/removes
the lock's name afterwards; asserts B's original inode keeps exactly one
private name and that a later save through an open handle lands in it.
Mutation-checked: the original unconditional unlink and the previous round's
recreate both lose B for every caller and kind. Existing stable-restore and
leaf-replacement assertions were rewritten to the new kept-spare behaviour.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

8f2898b Setar maintenance judges each lock entry on its own and says exactly what a release removed

Same invariant family (a release preserves and honestly reports every entry
it is not authorised to remove): with refused entries now always kept and
said, a multi-entry folder release stopped at the first refusal and claimed
nothing was removed after removing earlier entries. releaseBound now judges
every entry, keeps each refused one, and says how many were removed and where
each refused one is kept. The leftover instruction (refuseLeftovers) and
docs/setar-archive.md say how to recognise a spare name for a link: the same
readlink target, since a relinked link never shares the spare's inode.

Proof (ac-2 test): a two-entry folder lock with one entry replaced after it
was shown: the other is removed, the replaced one stands and is kept, and the
refusal says "1 of its 2 entries". The legacy leftover refusal names the
readlink check.

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
