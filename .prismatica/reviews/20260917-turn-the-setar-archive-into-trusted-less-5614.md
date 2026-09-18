---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
contractId: 20260917-turn-the-setar-archive-into-trusted-less-5614
patchId: 18bac9c00b90646a72f07ff57aaa6a8b2297229e
reviewer: unassigned
state: sealed
verdict: request_changes
findings:
  - family: Device archive media-base resolution
    summary: "P1: Real OWNER testing shows Setar archive resources are imported with
      correct archive-relative paths, but the production resolver omits the
      Setar archive-root segment when composing NAS URLs, so all imported Setar
      media links are unusable with the current device configuration."
    counterexample: The imported resource path `session-39-01-09-2026/ضبط-کلاس.mp4`
      is correct. The real file opens at
      `https://192.168.0.20:5010/setar-classes/session-39-01-09-2026/ضبط-کلاس.mp4`,
      but Practice Compass resolves it as
      `https://192.168.0.20:5010/session-39-01-09-2026/ضبط-کلاس.mp4`. Manually
      inserting `/setar-classes/` makes the link work. Determine whether the
      defect is device configuration, archive-specific base mapping, resolver
      composition, legacy media-root interaction, or another cause, and fix the
      authoritative model without rewriting archive-relative source identity.
createdAt: 2026-09-18T15:23:04.529Z
sealedAt: 2026-09-18T15:23:19.573Z
---

# Review: Turn the Setar archive into trusted lessons and useful practice material

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260917-turn-the-setar-archive-into-trusted-less-5614
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/29
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `18bac9c00b90646a72f07ff57aaa6a8b2297229e`

## The Delta this change was framed from

# Refresh the NAS-published private Setar index into historical lessons and canonical items with useful attributed material, exact reconciliation, portable references and safe incremental updates.

_approved · about "log-a-class"_

## Today

Import Setar classes uses a stale37-session bundled seed, broken renamed reference and broad lesson-material inheritance.

## Instead

Refresh the NAS-published private Setar index into historical lessons and canonical items with useful attributed material, exact reconciliation, portable references and safe incremental updates.

## Keep

- Existing manual lesson and agenda flow
- Honest practice and scheduling history
- Offline data, backup and GitHub conflict safety
- External NAS media and device-local bases

## New assumptions

_none_

## Show me

Empty import ->39 historical lessons -> canonical item with correct source metadata and useful demo/score -> direct practice and open material -> repeat no-op -> fixture lesson40 delta -> same asset on Mac and iPhone -> actionable known exception, with no personal-material clutter or fabricated practice.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **OWNER ac-19 live GitHub integration and archive refresh** — P1: The real NAS publisher successfully created source-index/setar/index.json with data main unchanged, but the production app now throws `Cannot read properties of undefined (reading 'digest')` in both normal GitHub Sync and Refresh Setar archive.
  _counterexample:_ During manual OWNER ac-19 against the real private practice-compass-data repository, the NAS task successfully published branch source-index with setar/index.json. The data main branch remained unchanged at 7b47648f4772f453794491633e0ba16602198c35. In the app, pressing Sync now produces `Cannot read properties of undefined (reading 'digest')`, and pressing Refresh Setar archive produces the identical error before any index is accepted. No data was replaced. Reproduce against the real production response shapes and fix the shared failing path without modifying owner data or weakening sync/archive safety.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index a303387..412cfb1 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -518,15 +518,58 @@ reachable from an ordinary Node test. `src/components/useScreenAwake.ts` is the
 React/browser adapter that feature-detects (`'wakeLock' in navigator`) and supplies the
 real port, and wires `visibilitychange`.
 
-**Secure-context constraint.** The Screen Wake Lock API requires a secure context.
-Production (GitHub Pages) is HTTPS and unaffected. This repo has no branch-preview
-deployment — `.github/workflows/deploy.yml` publishes only on push to `main` — so
-plain-HTTP LAN serving of an unmerged branch cannot exercise this feature at all
-(`navigator.wakeLock` is simply `undefined`, which looks like a bug but is an
-environment gap). Before drawing any conclusion about this feature (or any future
-secure-context-dependent work) from an unmerged branch, first confirm
-`window.isSecureContext` and `'wakeLock' in navigator` on the actual test device, and
-establish a genuine HTTPS route for it first.
+**Secure-context constraint, and it is NOT only the wake lock.** This note began as a
+wake-lock note and was read as one, which is how the same environment gap came back as a
+production-looking failure. THREE of this app's capabilities are withheld outside a secure
+context, and plain http:// on a LAN address is not one:
+
+- `navigator.wakeLock` — `undefined`, so hands-free practice cannot be exercised at all.
+- **`crypto.subtle` — `undefined`, while `crypto` itself is still present.** This is the
+  sharp one, because nothing about it reads as an environment gap: `sha256Hex`
+  (`canonical.ts`) is the content-identity hash behind BOTH whole-state sync comparison
+  and `parseSourceIndex`'s recomputation of the published index digest, so Sync now and
+  Refresh Setar archive fail TOGETHER, in one shared function, with the property stack
+  trace `Cannot read properties of undefined (reading 'digest')`.
+- The **service worker**, therefore the installed PWA and its offline capability — the
+  app's core promise — does not register at all.
+
+MEASURED, on the owner's own network (2026‑09‑18): `http://192.168.0.113:4173/` gives
+`isSecureContext: false`, `typeof crypto.subtle === 'undefined'`; the NAS over
+`https://192.168.0.20:...` gives `isSecureContext: true` with `crypto.subtle` present,
+self-signed Synology certificate and all — **HTTPS is a secure context whether or not the
+certificate is trusted**, so a LAN NAS route needs no public certificate to work. A build
+mirrored by `scripts/deploy-nas.sh` and opened over that HTTPS origin is the genuine route;
+`http://localhost` also qualifies, because browsers privilege localhost deliberately, which
+is exactly why no test here can see any of this.
+
+Production (GitHub Pages) is HTTPS and unaffected, and so is the installed iPhone PWA. This
+repo has no branch-preview deployment — `.github/workflows/deploy.yml` publishes only on
+push to `main` — so plain-HTTP LAN serving of an unmerged branch cannot exercise any of the
+three. Before drawing any conclusion about a secure-context-dependent feature from an
+unmerged branch, confirm `window.isSecureContext` on the ACTUAL test device and establish a
+genuine HTTPS route first.
+
+**The answer to this is a route, never a fallback.** `parseSourceIndex` REFUSES with a named,
+actionable sentence (`INSECURE_CONTEXT_REFUSAL`, `sourceArchive.ts`) checked BEFORE the
+file's own size/JSON/structure/digest order, because it is a fact about the DEVICE and no
+file can pass on a device that cannot hash — sending the owner to fix an index that is
+perfectly good is the failure mode a file-shaped error message produces. It does NOT hash
+some other way and carry on: the digest is the refresh IDENTITY (skipping it is how altered
+content gets reported "Already current"), and a pure-JS fallback would repair one of the
+three capabilities above while implying plain http:// were supported. `src/store/archiveIndex.test.ts`
+holds this closed with `crypto.subtle` removed exactly as a browser removes it, at the
+GitHub refresh — the one entry point the UI actually reaches — and at `readIndexFile`
+beside it, which is the same decoder and currently has NO production caller (an
+unwired fallback, noted here rather than left to be discovered as dead code).
+
+**SYNC IS NOT FIXED BY THIS AND CANNOT BE, IN THIS LANE.** `hashState` reaches
+`crypto.subtle` through the same `sha256Hex`, so over plain http:// **Sync now still
+throws the raw `Cannot read properties of undefined (reading 'digest')`** —
+`canonical.ts` is outside this change's allowed paths and `githubSync.ts`/`syncEngine.ts`
+are forbidden by it. That failure is confined to a non-secure origin, where the app is
+not the installed PWA and has no offline capability either; on HTTPS it does not arise.
+Giving Sync the same named refusal is a separate lane, and is a WORDING change at a
+boundary, never a second hash.
 
 ## Hard "do nots" (require explicit user instruction to change)
 
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index 8ba9e0b..9069489 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -264,6 +264,46 @@ The owner's own `تمرین-من` recordings are evidence, not material: their
 membership and role survive in the graph, the files themselves never become a
 piece's material.
 
+### Open the app over HTTPS, or Refresh cannot verify anything
+
+Refresh recomputes the index's `contentHash` before trusting a byte of it, and
+that needs `crypto.subtle`, which **browsers expose only in a secure context**.
+Open the app over plain `http://` at a LAN address and `crypto` is still there
+while `crypto.subtle` is not, so Refresh — and **Sync now**, which hashes the
+whole database through the same function — both refuse.
+
+Measured on this network, 2026‑09‑18:
+
+| Origin | `isSecureContext` | `crypto.subtle` |
+| --- | --- | --- |
+| `http://192.168.0.113:4173/` (Mac LAN preview) | `false` | absent |
+| `https://192.168.0.20:5010/` (NAS, self-signed) | `true` | present |
+| `http://localhost:4173/` | `true` | present |
+| GitHub Pages (production) | `true` | present |
+
+So: **production and the installed iPhone PWA are unaffected** — both are HTTPS.
+Only a branch build served from a LAN address over plain HTTP hits this, and the
+fix is the route, not a setting:
+
+- **On the Mac — verified.** `http://localhost:4173` is already a secure context;
+  browsers privilege localhost on purpose, which is also why no automated check
+  in this repo can ever see this failure.
+- **For a phone — candidate route, NOT yet verified end to end.** Mirror the build
+  to the NAS (`npm run deploy`) and open it over `https://192.168.0.20/practice-compass/`.
+  What is measured: that origin is HTTPS and therefore a secure context, and a
+  self-signed Synology certificate does not change that — accept the browser
+  warning once. What is NOT measured: the mirror itself. On 2026‑09‑18 that URL
+  answered **403**, and `deploy-nas.sh`'s target share (`/Volumes/web`) was not
+  mounted on the Mac, so the build behind it is stale or absent and the script had
+  no destination. Mount the share, run `npm run deploy`, and confirm the page loads
+  and reports `window.isSecureContext === true` before treating this route as good.
+  Per ac-19's own rule, record the NAS mapping you actually find rather than
+  assuming a `/Volumes` path works.
+
+Refresh says this in as many words rather than crashing, and it says it before it
+looks at the file at all — on a device that cannot hash, no index can pass, and a
+file-shaped error would send you to republish an index that is perfectly good.
+
 ---
 
 ## 6. Notes for whoever changes this next
diff --git a/src/domain/sourceArchive.ts b/src/domain/sourceArchive.ts
index b156fab..6f1241c 100644
--- a/src/domain/sourceArchive.ts
+++ b/src/domain/sourceArchive.ts
@@ -484,6 +484,42 @@ export function decodeSourceIndex(input: unknown): SourceIndex {
   };
 }
 
+/**
+ * The message a device that cannot hash anything gets, instead of a TypeError.
+ *
+ * Exported so the reader boundary and its test name ONE string rather than two
+ * copies of a sentence that must stay identical.
+ */
+export const INSECURE_CONTEXT_REFUSAL =
+  'This device opened the app over an insecure connection (plain http://), so the browser withholds the ' +
+  'cryptography needed to verify the index against its own content hash. Open the app over https:// (or ' +
+  'localhost) and refresh again. Nothing was changed.';
+
+/**
+ * WebCrypto EXISTS ONLY IN A SECURE CONTEXT, and this app can be opened outside
+ * one — a build served from a LAN address over plain http:// is the ordinary way
+ * an unmerged branch reaches a phone. There `globalThis.crypto` is present but
+ * `crypto.subtle` is `undefined`, so `sha256Hex` threw
+ * `Cannot read properties of undefined (reading 'digest')` — a stack trace about
+ * a property, handed to the owner in place of the one fact they can act on.
+ *
+ * This is a precondition of the DEVICE, not a defect in the FILE, which is why
+ * it is checked BEFORE the size/JSON/structure order below rather than folded
+ * into it: a device that cannot compute a digest cannot verify ANY index, so
+ * reporting the first thing that happens to be wrong with the file would send
+ * the owner to fix a file that is fine. It is also why this refuses rather than
+ * degrading to an unverified read — `contentHash` is the refresh identity, and
+ * skipping it is how altered content gets reported "Already current".
+ *
+ * Deliberately NOT a fallback implementation: the hash is only one of this
+ * app's secure-context dependencies (the service worker that makes it work
+ * offline is another), so hashing without one would leave the app still broken
+ * while implying plain http:// were supported.
+ */
+function requireDigest(): void {
+  if (!globalThis.crypto?.subtle) throw new Error(INSECURE_CONTEXT_REFUSAL);
+}
+
 /**
  * The scanner's own digest, recomputed here: SHA-256 over the key-sorted JSON
  * of the SEMANTIC body — everything but `contentHash` and the clock-bearing
@@ -514,9 +550,13 @@ async function computeIndexDigest(parsed: Record<string, unknown>): Promise<stri
  * that build an index object in memory call it directly and have no transport.
  *
  * Order matters: size → parse → structure → digest, so a structurally broken
- * file reports the error the owner can act on rather than a hash mismatch.
+ * file reports the error the owner can act on rather than a hash mismatch. The
+ * secure-context precondition sits ahead of all four, for the reason
+ * `requireDigest` records: it is a fact about the DEVICE, and no file can pass
+ * on a device that cannot hash.
  */
 export async function parseSourceIndex(text: string): Promise<SourceIndex> {
+  requireDigest();
   if (text.length > MAX_INDEX_BYTES) throw new Error('That index file is too large to be a Setar archive index.');
   let parsed: unknown;
   try {
diff --git a/src/store/archiveIndex.test.ts b/src/store/archiveIndex.test.ts
index e08aa95..cbbe9ac 100644
--- a/src/store/archiveIndex.test.ts
+++ b/src/store/archiveIndex.test.ts
@@ -7,7 +7,7 @@ import { contentHash as indexDigest } from '../../scripts/scan-setar-classes.mjs
 import { fetchPublishedIndex, readIndexFile } from './archiveIndex';
 import indexFixture from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
 import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
-import { decodeSourceIndex } from '../domain/sourceArchive';
+import { decodeSourceIndex, INSECURE_CONTEXT_REFUSAL } from '../domain/sourceArchive';
 import { validateDB } from '../domain/io';
 import { createItem } from '../domain/factories';
 import type { PracticeDB } from '../domain/types';
@@ -452,6 +452,67 @@ describe('publishing and reading the source index', () => {
     const lean = await readIndexFile(withDigest(withoutOptional));
     expect(lean.ok).toBe(true);
   });
+
+  // --- THE DEVICE, NOT THE FILE ------------------------------------------
+  // Found by OWNER acceptance testing, not by any check here: an unmerged
+  // branch reaches a phone as a LAN build over plain http://, and WebCrypto
+  // exists only in a SECURE CONTEXT. `globalThis.crypto` is still there, but
+  // `crypto.subtle` is `undefined`, so recomputing the index digest threw
+  // `Cannot read properties of undefined (reading 'digest')` — handed to the
+  // owner as the explanation of their archive. Both doors onto the decoder are
+  // checked below: the GitHub refresh, which is the one the UI reaches, and
+  // `readIndexFile`, the same decoder behind a fallback nothing wires up yet.
+  //
+  // Every automated check missed it because every one of them runs where
+  // `crypto.subtle` exists: Node has it unconditionally, and the browser
+  // journeys are served from localhost, which browsers privilege as secure
+  // precisely so that http://localhost development works.
+  it('an insecure context refuses by naming itself, not by a property stack trace', async () => {
+    const text = JSON.stringify({ ...indexFixture, contentHash: indexDigest(indexFixture as Record<string, unknown>) });
+    // The REAL GitHub reply shape for this file: base64 `content`, `encoding`
+    // and `size`, exactly as api.github.com answers a contents request.
+    const github = async (url: string | URL | Request) =>
+      String(url).includes('/git/ref/heads/')
+        ? new Response(JSON.stringify({ object: { sha: 'c0ffee'.repeat(6) + 'aa' } }), { status: 200 })
+        : new Response(
+            JSON.stringify({
+              content: Buffer.from(text, 'utf8').toString('base64'),
+              encoding: 'base64',
+              size: text.length,
+            }),
+            { status: 200 },
+          );
+    const refresh = () =>
+      fetchPublishedIndex({ repo: 'owner/data', token: 'device-token', fetchImpl: github as typeof fetch });
+
+    // Both paths succeed on THIS device, so nothing below is about the file.
+    expect((await refresh()).ok).toBe(true);
+    expect((await readIndexFile(text)).ok).toBe(true);
+
+    // An insecure context, exactly as a browser presents one: `crypto` is
+    // present and `crypto.subtle` is not.
+    const secure = globalThis.crypto;
+    vi.stubGlobal('crypto', { getRandomValues: secure.getRandomValues.bind(secure) });
+    try {
+      expect(globalThis.crypto.subtle).toBeUndefined();
+      for (const result of [await refresh(), await readIndexFile(text)]) {
+        expect(result.ok).toBe(false);
+        if (result.ok) throw new Error('expected refusal');
+        // The one fact the owner can act on — and never the shape of the crash.
+        expect(result.error).toBe(INSECURE_CONTEXT_REFUSAL);
+        expect(result.error).toMatch(/https:\/\//);
+        expect(result.error).not.toMatch(/digest|undefined|Cannot read/i);
+        // Refusing is not reporting a broken file: the owner must not be sent
+        // to republish an index that is perfectly good.
+        expect(result.error).not.toMatch(/content hash.*altered|not valid JSON/i);
+      }
+    } finally {
+      vi.unstubAllGlobals();
+    }
+
+    // And the refusal was about the device alone: the SAME bytes pass again.
+    expect((await refresh()).ok).toBe(true);
+  });
 });
 
 // ---------------------------------------------------------------------------
```

**Full current text of every file the rework touched:**

### AGENTS.md

```
# AGENTS.md — development rules for Practice Compass

This file is the contract for anyone (human or AI) extending this app. Read it before
adding features. The whole value of the tool comes from what it *refuses* to do.

## The one rule above all

Preserve the core loop: **one item · one mode · one focus · one result · one next action.**
If a change blurs that loop or adds a second thing to think about per step, it's wrong —
even if it's "useful".

**The loop CLOSES: the next action is read, not just written.** `PracticeBlock.nextAction`
was captured on every close and read nowhere, so the one thing deliberately decided last
time never reached the moment it was written for. `ActiveBlock` now shows it at the top,
before you start playing, via `lastNextAction` (`blocks.ts`, tested) — the most recent
NON-EMPTY one, so a later block that recorded none does not blank out a decision that
still stands. Anything the app asks you to record, it must eventually USE.

## One canonical home per kind of information (schema v13)

Four homes, and nothing may compete with them (`src/domain/practiceInformation.ts`, pure
and tested; the list of retired keys lives there, not in prose):

- **`PracticeItem.notes` — "Working notes".** The item's ONE notebook: what this piece
  is, what your teacher said, what to watch. It has the item's lifetime, and it is
  readable AND editable *while practising* — the point of writing something down is that
  it reaches you at the moment it was written for.
- **`PracticeBlock.observation`** — what happened in ONE recorded block.
- **`PracticeBlock.nextAction`** — the one thing to try next time, decided at that
  block's close and read at the next one. (`PracticeBlock.constraint` — a legacy,
  optional authored condition shown on the practice screen and in block history — belongs
  to the block too, and is validated with the other two. Ordinary Start supplies none;
  existing values are kept and displayed, never a new capture control.)
- **`lessonAgenda`** — questions for a teacher and commitments to a class (its own
  section below).

Nothing copies one into another automatically. Reflection at the close screen never
overwrites the notebook; the notebook is never dumped into a teacher sheet.

**A DERIVED VALUE IS NOT A FIFTH HOME.** The item's most recent block observation is
read straight from the blocks (`latestObservation`, `blocks.ts`, tested) and rendered
WITH ITS DATE wherever current context is wanted. It used to be cached onto the item as
`lastObservation`, which is how one fact became two that could disagree. Derive it; never
store it back.

**v12 → v13 RETIRES the fields that competed, and that exception is BOUNDED AND ONE-WAY.**
`currentProblem`, `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the
fourteen Persian/Guitar WORKING-DETAIL fields (`shahed`, `ist`, `foroud`, `ornamentIssue`,
`mezrabIssue`, `phraseLabel`, `importantNote`, `rightHandIssue`, `leftHandIssue`,
`toneIssue`, `fingering`, `tempo`, `stringNoiseIssue`, `bodyTensionNote`) are REMOVED, not
migrated into `notes` — the owner settled (2026‑09‑16, `DECISIONS.md`) that their content
was dummy test data, and merging dummy text into the one canonical notebook is the failure
mode, not the fix. The Persian/Guitar IDENTITY fields (`dastgahAvaz`, `gusheh`, `form`,
`composer`, `lessonNumber`, `barRange`) stay: they say what the piece IS and they group the
repertoire. This waiver covers exactly those enumerated fields and nothing else. It is NOT
permission to reset practice history, ratings, reviews, commitments, or any future
meaningful text.

`retirePracticeText` is DELETION ONLY — it never writes a value — which is what makes it
idempotent and makes re-running it incapable of resetting current canonical text. It reads
no clock, so two devices migrate the same database identically on different days, and it
runs on EVERY inbound database rather than only one declaring `fromVersion < 13`, for the
reason `migrateToV12` already records for itself: a database claiming the current schema
can still carry a stray retired key from a partial conversion or a hand-edited file.

**AFTER ANY INSTALL, EVERY ATTACHMENT THE DATABASE DESCRIBES HAS BYTES ON THIS DEVICE.**
One invariant, enforced at both doors: `decodeBackupFiles` refuses a FULL backup that
describes a file it does not carry, and `importFullBackup` refuses a STATE-ONLY file
(`files` absent) that names an attachment whose blob is not already here. Refusing only the
first is a one-way trap — a full export carries bytes for exactly the attachments `data`
describes and can only OMIT one whose blob it cannot find, so a device left holding
metadata for absent bytes exports a backup it then refuses, and publishes a snapshot every
other device refuses too, permanently. Dropping the dangling metadata instead would be
silent loss of the owner's own record. Both refusals name the file and change nothing.

**AND AN ATTACHMENT'S IDENTITY IS CHECKED AT EVERY DOOR, NOT AT THE ONE THE CHECK HAPPENED
TO LIVE IN.** The rule that two attachments may not share an id sat inside
`decodeBackupFiles`, which returns on its FIRST line for a file with no `files` key — so it
ran for a full backup and for nothing else. A sealed review reproduced the consequence: a
state-only import (and equally a sync pull, an archive restore, or either half of
hydration) installed two metadata rows claiming one id, and because the export emits one
file per describing row, the device's own next full backup carried two files sharing an id
and was refused by its own importer — the same permanent one-way trap as the two mismatches
above, arriving through the door nobody was watching. An id is what an attachment's bytes
are KEYED by, so two rows claiming one id are two rows claiming one file. The check is in
`validateDB` now — the one function every inbound door already runs — and
`decodeBackupFiles` keeps none of its own: one place, six doors, rather than six chances to
miss it. It is deliberately bounded to attachment ids and is NOT a general duplicate-id
sweep across every collection, which the contract's own non-goals rule out.

**AND THE EXPORT IS DERIVED FROM THE CANONICAL METADATA, SO THE APP CANNOT WRITE A BACKUP
ITS OWN IMPORTER REFUSES.** The trap has a second mouth, and closing only the inbound one
left it open: `buildFullBackupWithRev` used to derive `files` from the blobs actually
STORED, which is the opposite mismatch — bytes the database describes nowhere.
`decodeBackupFiles` refuses those as orphans ("belongs to nothing this file describes"), so
the export was unrestorable here and on every device a sync published it to. They are not
exotic: a state-only import MUST preserve local blobs (that is its own contract) while
replacing the database that named them, and `deleteItem`/`deleteLesson`/`resetDemo` drop
metadata synchronously while their `void deleteBlob(...)` cleanup can fail on its own. So
`files` is built from `db.attachments` ∩ the blobs held, carrying the METADATA's `ownerId`
— the one the importer validates against and writes back onto the blob row, so an
export→import round trip is idempotent rather than a second opinion about ownership.
Unreferenced bytes are not part of the database the backup is OF; they stay on the device
UNTOUCHED, never deleted to make the two agree, because deleting them is exactly what the
state-only contract forbids. The opposite mismatch is not fixable at export — dropping the
metadata is silent loss, refusing to export leaves a device unable to back up at all — and
is instead prevented at the two doors above, `addAttachment` writing the blob BEFORE its
metadata.

**THE SURVIVING TEXT IS VALIDATED AT EVERY INBOUND DOOR, AND NEVER COERCED.**
`validatePracticeText` (the four homes' own string fields — the block's `constraint`
included — and nothing else) runs inside
`validateDB`, so every door — import, sync pull, Keep remote, archive restore, cold-start
recovery, and BOTH halves of the persist middleware — refuses the same thing. Absent and
EMPTY are both legitimate (emptying a notebook is a deliberate act); `null` reads as
absent, because that is what a serialiser writes for "no value" and every reader already
treats it as missing. A present value of the wrong type is REFUSED with the record named,
never coerced: `String({})` is how a note becomes the literal text "[object Object]" and
the owner's real words are gone. The unfinished block's scratch observation lives OUTSIDE
`PracticeDB` (on the store's ephemeral `active`) so that function never sees it — it gets
the same rule and the same refusal from `validateUnfinishedText`, called by the same
hydration hooks.

**ONE EDITOR FOR THE NOTEBOOK, AND IT NEVER LOSES WHAT YOU JUST TYPED.**
`src/components/ItemNotes.tsx` is the only way Working notes are edited — Item Detail, the
practice screen and a bound routine segment all render that one component, so there is
never a second copy of the text or a second way to write it:

- **Saving is EXPLICIT (a Done button), never blur-only.** Blur-only saving makes a stale
  copy authoritative the moment anything steals focus.
- **"Saved" waits for IndexedDB to acknowledge the write** (`storageSettled()`,
  `src/store/idb.ts` — the persist adapter's own in-flight write, not a sleep). A FAILED
  write keeps the text on screen with Try again and Copy, and never shows a Saved state.
  Try again must work from the failed state: the store has already accepted the value, so
  a "nothing changed, skip the write" shortcut would make the retry a silent no-op.
- **The draft is TAGGED with the item it was typed for** and dropped rather than written
  when that changes. A timer tick, a store update from elsewhere, or a routine crossing
  into the next bound segment re-renders this component constantly; without the tag, a
  stale editor can commit A's words onto B.
- **AN IN-FLIGHT WRITE NEVER OWNS THE EDITOR.** The textarea stays live while IndexedDB
  acknowledges, so words typed in that window are NEWER than the ones being written. A
  settling write may only speak for the text it actually CARRIED: it clears the draft and
  says "Saved." when the draft is still exactly that text, and otherwise re-issues the
  write for what is on screen now. Clearing the draft on whatever settles — which is what
  it did — dropped those words and put a success message over the older ones, and letting
  the newer text simply sit there unsaved would lose it the moment the screen was left. The
  same rule holds on the failure path: Try again writes what is on screen NOW, not the text
  that failed. Only the LATEST save may act at all (`saveSeq` — ONE ownership test, not a
  second `forItem` comparison nothing could ever make disagree with it), and the draft is
  read through a REF, never the closure the write was issued in nor a ref mirrored by an
  effect: `storageSettled()` resolves in a microtask that can land between a keystroke and
  React's next render. LEAVING THE SCREEN AND SWITCHING ITEM ARE OPPOSITE CASES, and both
  are checked: unmounting (a different route) keeps the ref alive through the write's own
  closure, so words typed while it settled are saved on the way out; switching ITEM bumps
  `saveSeq` and the write says nothing at all, because those words were typed for a
  notebook that is no longer the one on screen — the pre-existing tag rule above, not a
  new exception to it.
- **Editing notes changes nothing else.** Not the clock, the elapsed figure, the running
  state, a block, a result, a review or any SM‑2 value.

## Keep admin overhead low

- Starting a block must stay **under 30 seconds**; closing one **under 60 seconds**.
  Any new field in those flows must be optional and have a smart default.
- Never add a required field beyond an item title.
- Rich metadata stays progressive: hidden until the user asks for it.

## Prioritise the quick‑start flow

- Smart defaults are a feature, not a convenience. Status → mode, item → focus,
  10‑minute duration. If you add a concept, give it a sensible default too.
- Inline item creation must keep working from the Start screen and from recommendations.
- **Exactly two creation paths, both one-step.** Quick add = title only (Start's
  inline create is also title-only, with a link to the full form that returns to Start
  with the item preselected). The full form ("Add practice item", `/items/new`, also
  inline edit) is KIND-FIRST: it asks what you're adding (gusheh / composed piece /
  piece / étude / passage / technique — `src/components/itemKinds.ts`, tested) and
  shows only that kind's identity fields, in three groups: "What are you adding? /
  Connect it (optional) / First practice setup". Connections (study source with inline
  create, pathway stage, lesson, parent work) are settable AT creation — no
  create-then-edit round trips, and never a third half-detailed path. Item detail
  shows a "Connected to" summary near the top.

## Today is a session workspace, scoped to one instrument

The user practises one instrument at a time ("I'm practising Setar now"). Today is
driven by a persisted `sessionInstrumentId`: the switcher at the top picks the
instrument, everything below it (recommendation, class work, reviews, pathway position,
quick add, Start) is scoped to that instrument, and the primary recommendation must stay
above the fold on a 390×844 phone. The cross‑instrument "Overview" is a deliberate,
secondary choice — never the default. Never hard‑code a morning/evening schedule and
never surface another instrument's work inside a session. The Session Plan and
Routines are two independent, peer doorway cards (`PlanCard`/`RoutinesCard` in
`Today.tsx`) — a time-budgeted session and following a routine are separate systems,
and OWNER acceptance testing (2026‑08‑28) found nesting routines inside the Session
Plan's expanded panel read as routines being subordinate to picking a duration, so
they were pulled out into their own doorway. Both start collapsed (~50px) so the
primary recommendation stays above the fold; each has its own open/close state and
its own "Resume your plan"/"Resume your routine" takeover. Routines are scoped to the
session instrument (`routinesForInstrument`), each row showing Edit and — when a
segment is essential — a visible "Short on time — essentials only" button, plus "New
routine" ("Create a routine" when there are none yet). Today is the ONLY surface an
unplaced routine is reachable from at all, so its rows carry the same Edit/Start/
short-on-time affordances StageDetail's `RoutineCard`/PathwayDetail's `RoutineRow`
give a placed one.

**THE TWO DOORWAYS SIT ABOVE THE RECOMMENDATION, AND THAT IS AN OWNER JUDGEMENT, NOT A
DERIVATION.** The 2026‑09‑11 lane BUILT the other order — Practise now directly under
the instrument switcher, with Plan and Routines beneath it — on the argument that
orchestrating a session is a choice you make INSTEAD of taking the suggestion. The owner
tried it on their own iPhone and preferred the original: Plan and Routines read as
belonging at the top of the page, and recommendation-first felt less natural. The order
reverted before the lane shipped, which is a PASSING outcome of that check, not a
failure. Both orders keep the recommendation above the fold at 390×844, so nothing here
follows from the phone constraint — do not re-derive this ordering from first principles
and quietly flip it back. It changes only when the owner says so.

## Review actions have honest, distinct semantics

Practising (closing a block) is the ONLY thing that can complete a review or advance
SM‑2 — but it does not always do either. **Practice is exposure; only eligible retention
evidence advances spacing.** A good session on an item whose review is not yet due is real
practice (minutes, result, observation, next action all recorded) and is not the review it
was scheduled for: `decideReview` KEEPS the date, leaves `srReps`/`srEase`/`srIntervalDays`
untouched and leaves the pending row OPEN. `srLastProgressDay` holds that to at most one
advance per local calendar day, so re-arming a date or reloading cannot buy a second.
Nothing else may complete a review at all. "Not now" hides a due review for the rest of
today (no schedule change). Snooze
(+2d) genuinely moves the due date on both the review and the item — never fabricate a
result, and never leave a stale overdue item after an action. The Finish button freezes
the clock (`pauseSession`) before the close screen; reflection time is not counted.

**ANSWERING NOTHING IS NOT DECLINING.** A result is REQUIRED to save a block — the six
options are already the first thing on the close screen, so this adds no field (r-quick-start
holds: it makes a choice already present a required one), and "Save without a result" keeps
`not_logged` reachable and DELIBERATE. `computeReviewOutcome` takes a tri-state
`ReviewAnswer` (`'scheduled' | 'declined' | 'unanswered'`) and returns
`completeOpenReviews` ALONGSIDE `nextReviewDate`, because they are ONE decision: a close
carrying no result keeps the item's date AND leaves its open Review row OPEN, while a
genuine decline still clears the date and completes the row. `closeSession` must never
decide the row separately — completing every open row unconditionally, next to a
`!scheduleReview` branch that cleared the date, is exactly how one skipped tap used to
erase the next date, close the open review, leave SM‑2 state stale and drop the item out
of Due reviews for good, all while the panel read "Should this come back? Yes" above an
empty date field. The row transform is `completeOpenReviewsFor` (`scheduling.ts`, tested)
so the array change is reachable from a Node test; `CloseBlock` states the mapping in one
place and the escape hatch forces `'unanswered'` even when a result had already filled in
a date. r-explainable-scheduling's "the date shown is the date saved" now includes when
that date is deliberately left UNCHANGED.

**THE CLOSE SCREEN LEADS WITH THE MUSICIAN'S WORDS, AND DERIVES THE DATE ONCE.** How it
went, what you noticed and what to try next time are always visible and come BEFORE the
minutes and the scheduler. The whole scheduling decision is ONE honest line — "Review in
2 days · Repair · …" — with the date field, the review-type choice, "Why this date?" and
the come-back Yes/No a single tap behind it. (It used to run 1689px at 390×844, with the
engine's controls fully expanded before a result had been chosen, and a two-column grid
whose right column stacked five review-type pills vertically.)

There is exactly ONE `ReviewPlan` value in that component (`review`, a `useMemo`): the
engine's plan for the chosen result with any manual correction folded INTO it. The
collapsed line, the date field and the value handed to `closeSession` are three
renderings of THAT object, so a divergent date is UNREPRESENTABLE rather than merely
guarded against — there used to be a second `planNextReview` call seeding the field from
a different invocation than the preview. `clampSchedulingParams(db.settings)` is threaded
into that one derivation. The line itself comes from `reviewSummaryLine`
(`src/components/format.ts`, tested): a pure FORMATTER that reports the plan's `dueDate`,
`reviewType` and `rationale` and computes no date of its own. Once the owner sets their
own date the rationale becomes "The date you chose." — quoting the engine's reason would
explain a number it did not pick. Never reintroduce a second derivation here.

**A MANUALLY CHOSEN DATE SURVIVES CHANGING THE RESULT WHEN NO AUTOMATIC PLAN EXISTS.**
`pickResult` clears the manual `override` on every fresh result — a correction made
earlier belonged to the date the PREVIOUS result's plan produced, so carrying it forward
would pin a date to a judgement it was never made about. But a manual-mode item
(`item.reviewMode === 'manual'`) has NO automatic plan for ANY result — `computeReview`
returns `null` unconditionally in manual mode, before it even looks at `result` — so the
owner's typed-in date was never tied to a particular judgement in the first place, and
clearing it on every result change silently threw away a date they had just chosen. The
restructure once did exactly that (`setOverride(null)` unconditionally), turning a
deliberate "come back on this date" into an accidental decline the moment the musician
changed which result they picked. `reviewOverrideSurvivesResultChange`
(`src/components/format.ts`, tested against the real engine across all six results, both
a manual- and an auto-mode item) asks the ENGINE whether its answer depends on the
judgement at all: it calls `planNextReview` once per result and returns true when all six
produce the same date. Reading `item.reviewMode === 'manual'` directly — which is what it
used to do — was a PROXY for that question, correct only while manual mode was the sole
way an item could have no per-result plan. It is not any more: a protected pending date
(one the owner chose, or a snooze) is kept for every result too, so a mode check would
clear a just-typed date on an auto-mode item whose date was never tied to a judgement
either. Calling the engine is still a boolean GATE on whether a per-result plan exists at
all, never a second value CloseBlock could render — CloseBlock keeps its single
derivation, and this function returns no date.

**THE DUE-REVIEW ROW GIVES THE ITEM'S NAME THE ROOM.** "Not now" + "+2d" + ▶ used to take
243px of a 356px row, leaving the title 113px — about 13 characters of a Farsi name, the
one thing the row exists to identify. The text now claims a whole line whenever the three
actions cannot sit beside it (`flex: 1 1 220px` with `flex-wrap`) and WRAPS instead of
truncating. All three actions keep their existing, deliberately distinct meanings: this
is layout only.

## Nothing replaces an unfinished practice session

`src/domain/practiceSession.ts` (pure, tested) is the sibling of `practiceSignal.ts`: that
module owns pure decisions about a running clock's SIGNALS, this one owns pure decisions
about the unfinished SESSION. Two INDEPENDENT questions live there and must never be
conflated:

- **PRESENCE** (`hasUnfinishedPractice`, `decideReplacement`) — does an unfinished session
  exist? That, and ONLY that, decides whether a whole-database replacement may proceed.
  Never `running`, so PAUSING PROTECTS A SESSION RATHER THAN EXPOSING IT; the frozen
  `active`+`activeRoutine` pair the persist `merge` produces is unfinished practice like
  any other.
- **PLAUSIBILITY** (`isStaleClock`, `proposedCloseMinutes`) — does this session's elapsed
  figure still look like time someone played? That decides the minutes `CloseBlock`
  proposes and the ATTENTION state, and NOTHING else.

**A HEURISTIC ABOUT A DURATION NEVER BECOMES AN AUTHORITY TO DESTROY PRACTICE.** A stale
verdict must never be wired to a destructive path, and `decideReplacement` must keep
reaching the SAME decision for a stale session as for a live one (a session paused at
three genuine hours crosses any sensible threshold — discarding it would lose real
practice). Staleness may never be fed into `shouldKeepAwake` or `nextSignal` either.

`active` lives outside `db`, so `withRevision` never bumps `rev` while you practise: a
mid-block device looks UNCHANGED to `decideSync`, a remote change resolves to `pull`, and
the in-flight block is destroyed with no archive and no prompt. So: AUTOMATIC sync
(`syncNow`) checks the predicate BEFORE attempting and reports a distinct `deferred`
SyncPhase — a background merge waiting its turn is not an error and must not be dressed as
one — while DELIBERATE replacement (Import, Restore archive, Keep remote) gets an explicit
refusal naming the session. The guard for the inbound paths is the FIRST statement of
`importFullBackup` (`backup.ts`), before the JSON is even parsed: `replaceAllBlobs` below
it destroys every attachment blob, so a check placed after it would wipe them while
returning "nothing was changed". Every deliberate caller already surfaces
`{ok:false,error}`, so no `Settings.tsx` change is needed.

The inbound guard is checked TWICE, and the second one is what makes it hold: the first
check is `importFullBackup`'s opening statement, but `await replaceAllBlobs(...)` below it
yields to the event loop, so a tap that starts a block while that transaction is in flight
would reach `importDB` — which nulls `active`/`activeRoutine` — with no guard between. The
second check sits in the same synchronous tick as the install, with nothing awaited in
between, so it is genuinely the last word. It refuses honestly: the blobs are already
written by then, so the message says so and invites re-running the import rather than
claiming nothing changed. Both checks take the CALLER'S INTENT (`importFullBackup(text,
intent)`), because a sync pull that reaches them is still AUTOMATIC — `syncNow` checked
before the network fetch, and practice can begin during it. It defers, and `githubSync.ts`
carries that verdict back out to `applyOutcome` (`pendingDeferral`, module scope for the
same reason `running` is) so the phase is `deferred`, never `error`: App.tsx's retry
watches `deferred`, so an `error` here would stop sync until something else happened to
trigger one — the silent outage this lane exists to prevent. Ordering is NOT reversed to fix
this — `replaceAllBlobs` is one
IndexedDB transaction, so a failed blob write rolls back and leaves blobs and `db` alike
untouched, which installing the `db` first would give up.

PRESENCE IS NOT THE WHOLE GUARD. `decideReplacement` has TWO blocking reasons, and both
are about practice that would be DESTROYED — neither is a heuristic about a duration. The
second is the local REVISION: an inbound snapshot may only be installed over the database
it was compared with. A block started AND FINISHED while a pull is in flight leaves no
unfinished session for presence to see. That block is not in the incoming snapshot, and —
if it landed after the pre-sync archive was taken — not in the only other copy either, so
installing the snapshot would destroy a minute that was genuinely played. So `importFullBackup(text, intent,
decidedFromRev)` compares the `rev` the replacement was DECIDED against with the `rev` now,
in the same call as the presence check (ONE call answering both, so no await can ever be
slipped between them). `rev` is a monotonic counter bumped on every db mutation, never a
clock — no timestamp enters a sync decision. It only moves on a user action: `useSyncStatus`
is a separate store and no effect or timer writes `db`, so a quiet sync run never trips it.
The baseline is anchored where the decision was actually made — `buildLocalSnapshot` in
`githubSync.ts` records it (`syncBaselineRev`, module scope for the same reason `running`
is) so the guarded window covers the remote fetch and the archive too, not just
`replaceAllBlobs`. It does NOT read that number from the store itself: it takes the one
`buildFullBackupWithRev` (`backup.ts`) returns, captured in the SAME statement as the
database (`const { db, rev } = useStore.getState()`) and before `allBlobs()` yields. Read
after that await, the baseline would pair an OLD copy of the data with a NEWER revision
number, and a block finished while the attachment blobs were being read would make
`decideReplacement` — which is itself correct — answer "nothing was written since" about a
database that had been written to. The pure decision is tested; this WIRING is protected
structurally, the same way `installDatabase`'s is: the revision is not reachable from
anywhere but the statement that reads the database. It is passed IN, never read from module scope inside `importFullBackup`:
a manual Import or an archive restore has no earlier decision point than its own call and
defaults to the `rev` on entry, and a stale baseline would make it refuse for no reason.
PRESENCE is answered first so a message that can name the blocking session still does
(ac-8). This deferral needs no retry watcher of its own — there is no blocking session for
the presence retry to watch clear, but the very write that raised it bumped `rev`, which
App.tsx's quiet-period auto-sync already watches, and the next run sees both sides changed
and offers the owner an explicit conflict with both copies preserved. That trigger is only
reliable because A SYNC REQUEST ARRIVING WHILE ONE RUNS IS REMEMBERED, NEVER DROPPED
(`rerunWanted` in `githubSync.ts`: `syncNow` sets it instead of returning into nothing, and
the run loops once more when it is set). `running` used to make such a request a silent
no-op, so a run outlasting the 30-second quiet period swallowed the single retry that
revision had scheduled and then deferred for that very revision — permanently waiting on a
condition nothing was watching. Remembering the request fixes that at the root, for every
trigger (open, quiet period, back online, deferral cleared) rather than for one
counterexample, and cannot spin: the flag is cleared at the top of each lap, so another lap
needs a genuinely new request that arrived during the previous one. `resolveConflict` drains
it too — a request that arrived while the owner was deciding is owed a run just the same.

A stale clock is labelled wherever the block appears on Today — the In-progress card AND
the "still running elsewhere" row (`StaleNote`) — because those two are exhaustive and
labelling only the first left the same block silent after switching instrument or choosing
Overview, where with no GitHub sync configured no deferral notice exists either. A stale
ROUTINE carries no such note: a run has no single target to judge an elapsed figure
against, and `segmentElapsed` already clamps each segment to its authored duration.

The deferral is VISIBLE and BOUNDED, never a silent permanent outage: `SyncNotice`
(`Layout.tsx`) renders `deferred` and says what it is waiting on, Today labels a stale
clock wherever the block is shown, and the resolution is the owner's — Finish, correct the minutes, or
Discard. The RETRY watches the BLOCKING CONDITION CLEARING (`deferredSyncRetry`, an effect
in `App.tsx` keyed on presence), never `rev`: `closeSession` writes a block and bumps the
counter but `cancelSession` is a bare `set({ active: null })` that writes nothing, so a
rev-watching retry resumes after a finish and waits forever after a discard. Seed the
previous-presence ref with the CURRENT presence, or an ordinary load reads as a
present→absent transition and fires a spurious sync.

**Installing a database clears the ephemeral state that pointed at the old one.**
`installDatabase` returns the new `db` TOGETHER WITH `active`/`activeRoutine`/`activePlan`
nulled, `notNow` reset and a `sessionInstrumentId` that survives only if it still resolves
(`'all'` always survives). Its SIGNATURE is the guarantee: `importDB`, `resetDemo` and
`clearAll` are each a single `set()` of its result, so installing a database WITHOUT the
reset is something the code cannot express — which matters because the Node environment
cannot import `useStore.ts` (it pulls in Dexie via `./idb`), so the unit test proves the
DECISION and the shape protects the WIRING. There are SIX whole-database replacements, not
four: `resetDemo` and `clearAll` are called directly on the store and never touch
`importFullBackup`, so a fix living only there would silently miss two of the three install
points. Deliberate erasure keeps NO guard — those actions are aimed at destroying the data
and already confirm first, so refusing them would be obstruction, not safety.

## Practice totals are calendar figures, not rolling windows

`practiceTotals` / `practiceTotalsByInstrument` / `startOfWeekISODate` (`selectors.ts`,
tested) answer "how much have I practised?" — a compact minutes-and-blocks line low on
Today (BELOW the recommendation, never above: "Practise now" stays above the fold at
390×844) and the full today / this week / all time per-instrument view on Insights. Do NOT
reuse `blocksInWindow`/`totalMinutesInWindow` for these: they filter on HOURS, so `days:1`
means the last 24 hours and `days:7` the last 168 — a block from late last night is not
today's practice. The week starts **Monday 00:00 local**.

**A block belongs WHOLE to the local calendar day it BEGAN**, with none of its minutes
apportioned across midnight or the Monday boundary. This was challenged and the code
settles it: `durationMinutes` is the figure the owner ATTESTED to and this lane makes it
diverge from wall clock on purpose (an abandoned block proposes its target), so
`endedAt - startedAt` is not the authored duration; and `endedAt` is optional and ABSENT on
routine blocks (`applyRoutineRun` passes none), so apportioning would apply to some blocks
and not others. Splitting would overrule the owner's own correction with a number they
never attested to. Totals stay NEUTRAL COUNTS — no goal, streak, score, bar that fills or
colour that judges. Relatedly, `instrumentBalance` takes its denominator from only the
blocks belonging to the instruments it emits rows for, so the percentages sum to 100 when
a caller passes active instruments with all blocks (Today does).

A calendar figure needs a LIVE clock: Today and Insights tick `now` once a minute
(`setInterval` in each page) rather than freezing it at mount, or a screen left open across
midnight keeps reporting yesterday's blocks as today's — and a running block never gains
its stale label. Insights passes ALL of `db.instruments` to `practiceTotalsByInstrument`,
not just the active ones, because its "All instruments" row counts every block: filtering
to active instruments left a retired instrument's history with no row while its minutes
stayed in the total. Rows with no practice are dropped at the call site, so the selector's
"one row per supplied instrument" contract is unchanged.

## Hands-free practice: the screen stays awake, and the app announces the end

The practice loop assumes you put the device down and play. While a practice clock —
an ordinary block (`ActiveBlock`) or a routine run (`RoutineRunner`) — is genuinely
RUNNING and its screen is VISIBLE, the app holds a Screen Wake Lock so the clock stays
readable without touching anything; pausing, finishing, discarding, unmounting
(navigating away) and the document going hidden all release it. WHETHER to hold the
lock is a pure, tested predicate — `shouldKeepAwake({ hasClock, running, visible })`
(`src/domain/practiceSignal.ts`) — true only when all three hold. There is exactly ONE
owner of the lock (`useScreenAwake`, wired once per practice screen), so two can never
be held at once. Reacquiring on `visibilitychange` back to visible is required by the
Screen Wake Lock specification (the platform releases a held lock the moment the
document becomes hidden) — not a browser-specific workaround. No wake-lock outcome,
success, rejection, or unsupported, may ever influence a recorded minute: the whole
elapsed-time family (`sessionElapsedSeconds`, `runElapsedSeconds`, `locateClock`,
`skipCurrentSegment`, `aggregateItemMinutes`) stays exactly as it was before this
existed.

**The decision of WHEN to announce is pure and tested** (`src/domain/practiceSignal.ts`):
`nextSignal(marker, elapsedSeconds, boundarySeconds)` announces AT MOST ONCE per call —
if elapsed has passed more boundaries than the marker records, it announces once and
advances the marker to the number ACTUALLY passed, never by one. This is what makes a
background/lock catch-up correct: a phone that wakes up several boundaries later
announces once and lands on the right one. The marker is a COUNT OF BOUNDARIES ALREADY
ANNOUNCED, living as an optional `signalledThrough?: number` on the store's EPHEMERAL
`active`/`activeRoutine` (useStore.ts) — never in `PracticeDB`, so no `SCHEMA_VERSION`
bump, no migration, and it never syncs or lands in a backup. An ABSENT marker reads as
zero (nothing announced yet) — the honest reading for a session persisted before this
feature existed. Boundaries are the run's ordered cumulative END boundaries: an ordinary
block passes `[targetMinutes * 60]`; a routine passes `segmentBoundaries(segs)`
(`src/domain/routines.ts`) — the SAME numbers `locateClock` advances on, by construction,
not a second cumulative sum recomputed in the runner. A deliberate Skip calls
`acknowledgeThrough` instead, which advances the marker to match elapsed WITHOUT
announcing — the user ended the segment themselves, so telling them it ended is noise —
and clears every boundary at or before elapsed (not just one), since Skip can produce a
zero-length or repeated boundary that is legitimate input, never malformed.

**The visual state change is the guaranteed signal**, always delivered regardless of the
wake lock or any device capability: an ordinary block reaching its target shows a
durable "target reached" ring state and a growing overtime figure
(`formatClock(elapsed - targetSeconds)`) for as long as the block runs — it does NOT
auto-finish; practising past the target is ordinary, and only Finish or Discard ends a
block. A routine segment boundary is perceptible for a defined window after arrival
(never a single-render flash), and routine completion is already durably shown by the
existing "Routine complete" screen. Audio and vibration (`playSignalCue`,
`useScreenAwake.ts`) are FEATURE-DETECTED BEST-EFFORT ONLY, wrapped so any failure is
silent, and are never part of any automated check: `navigator.vibrate` is unimplemented
in Safari on iOS, and a WebAudio context needs a user-gesture unlock that happens on the
page that starts the clock (Today/StageDetail/SessionPlan) — never on the practice
screen itself, which hands-free practice, by definition, never taps. It may therefore be
silent on the owner's own iPhone; the OWNER device checks record what was actually heard
rather than asserting it. Widening the frame to unlock audio at the start gesture is a
separate lane. Neutral and non-gamified throughout: a state change and a number, never a
streak, score, or
celebration.

**The wake lock itself is one shared, port-injected coordinator**
(`src/components/screenAwake.ts`) — no `navigator`/`window`/`document`, so its whole
ownership state machine (at most one outstanding request and one held sentinel; a
rejected or unsupported acquisition swallowed silently; a pending acquisition that
resolves after being disabled released immediately rather than stranded held) is
reachable from an ordinary Node test. `src/components/useScreenAwake.ts` is the thin
React/browser adapter that feature-detects (`'wakeLock' in navigator`) and supplies the
real port, and wires `visibilitychange`.

**Secure-context constraint, and it is NOT only the wake lock.** This note began as a
wake-lock note and was read as one, which is how the same environment gap came back as a
production-looking failure. THREE of this app's capabilities are withheld outside a secure
context, and plain http:// on a LAN address is not one:

- `navigator.wakeLock` — `undefined`, so hands-free practice cannot be exercised at all.
- **`crypto.subtle` — `undefined`, while `crypto` itself is still present.** This is the
  sharp one, because nothing about it reads as an environment gap: `sha256Hex`
  (`canonical.ts`) is the content-identity hash behind BOTH whole-state sync comparison
  and `parseSourceIndex`'s recomputation of the published index digest, so Sync now and
  Refresh Setar archive fail TOGETHER, in one shared function, with the property stack
  trace `Cannot read properties of undefined (reading 'digest')`.
- The **service worker**, therefore the installed PWA and its offline capability — the
  app's core promise — does not register at all.

MEASURED, on the owner's own network (2026‑09‑18): `http://192.168.0.113:4173/` gives
`isSecureContext: false`, `typeof crypto.subtle === 'undefined'`; the NAS over
`https://192.168.0.20:...` gives `isSecureContext: true` with `crypto.subtle` present,
self-signed Synology certificate and all — **HTTPS is a secure context whether or not the
certificate is trusted**, so a LAN NAS route needs no public certificate to work. A build
mirrored by `scripts/deploy-nas.sh` and opened over that HTTPS origin is the genuine route;
`http://localhost` also qualifies, because browsers privilege localhost deliberately, which
is exactly why no test here can see any of this.

Production (GitHub Pages) is HTTPS and unaffected, and so is the installed iPhone PWA. This
repo has no branch-preview deployment — `.github/workflows/deploy.yml` publishes only on
push to `main` — so plain-HTTP LAN serving of an unmerged branch cannot exercise any of the
three. Before drawing any conclusion about a secure-context-dependent feature from an
unmerged branch, confirm `window.isSecureContext` on the ACTUAL test device and establish a
genuine HTTPS route first.

**The answer to this is a route, never a fallback.** `parseSourceIndex` REFUSES with a named,
actionable sentence (`INSECURE_CONTEXT_REFUSAL`, `sourceArchive.ts`) checked BEFORE the
file's own size/JSON/structure/digest order, because it is a fact about the DEVICE and no
file can pass on a device that cannot hash — sending the owner to fix an index that is
perfectly good is the failure mode a file-shaped error message produces. It does NOT hash
some other way and carry on: the digest is the refresh IDENTITY (skipping it is how altered
content gets reported "Already current"), and a pure-JS fallback would repair one of the
three capabilities above while implying plain http:// were supported. `src/store/archiveIndex.test.ts`
holds this closed with `crypto.subtle` removed exactly as a browser removes it, at the
GitHub refresh — the one entry point the UI actually reaches — and at `readIndexFile`
beside it, which is the same decoder and currently has NO production caller (an
unwired fallback, noted here rather than left to be discovered as dead code).

**SYNC IS NOT FIXED BY THIS AND CANNOT BE, IN THIS LANE.** `hashState` reaches
`crypto.subtle` through the same `sha256Hex`, so over plain http:// **Sync now still
throws the raw `Cannot read properties of undefined (reading 'digest')`** —
`canonical.ts` is outside this change's allowed paths and `githubSync.ts`/`syncEngine.ts`
are forbidden by it. That failure is confined to a non-secure origin, where the app is
not the installed PWA and has no offline capability either; on HTTPS it does not arise.
Giving Sync the same named refusal is a separate lane, and is a WORDING change at a
boundary, never a second hash.

## Hard "do nots" (require explicit user instruction to change)

- ❌ **No gamification** — no streaks, points, badges, XP, leaderboards, confetti,
  or fake "mastery %". Progress is shown as honest status + result, nothing else.
- ❌ **No backend, no auth server, no service of our own.** The app is local‑first:
  **IndexedDB (Dexie) is the source of truth** on each device (app state in the `kv`
  table, attachment blobs in the `attachments` table) and everything works offline.
  **Amended by explicit user decision (2026‑07‑11):** device sync IS sanctioned — via
  the **user's own GitHub repo**. The engine (`src/store/syncEngine.ts`, port-injected
  and fully unit-tested; GitHub transport in `gitRemote.ts`; wiring in `githubSync.ts`)
  publishes whole snapshots ATOMICALLY with the Git Data API: blobs → tree → commit →
  fast-forward-only ref update, so a race or partial failure never leaves a broken
  remote. A brand-new EMPTY data repo is bootstrapped first via the Contents API
  (`RemotePort.initialize()`) — the git-data endpoints 409 on an empty repo — then the
  first snapshot commits as a child of that bootstrap commit; init failures surface a
  clear message with the manual README fallback and never leave a partial snapshot. Decisions are three-way CONTENT-HASH comparisons (`decideSync` +
  `canonicalStringify`/`hashState` in `src/domain/`), never timestamps — pathway-only
  edits and deletions sync like everything else, and a store middleware
  (`src/store/revision.ts`) bumps a `rev` counter on every db mutation. Both-changed =
  explicit two-button conflict ("newest" is a hint, never an auto-winner), and BOTH
  copies are preserved before any replace: the local copy goes to an in-app restore
  slot (idb) and an `archive/…` branch; the remote copy stays reachable as the parent
  commit. Legacy `state.json`+`files/` remotes stay readable; the first new push
  migrates the format with the old snapshot kept in git history. Never a silent merge,
  never per-field magic, never a custom server. Manual export/import stays as the
  fallback. Free tiers only; no paid services.
- ❌ **No AI or audio analysis** in v1 — no tone scoring, pitch detection, posture
  tracking, or "AI teacher" judgement. The app organises; it does not grade.
- ❌ **No guilt‑driven copy.** Insights are neutral observations, never nags.

## The Pathway is a trust anchor — keep it that way

Pathways exist so the user can **stop deciding what's next and just practise**, at their
own pace, on a route they trust. Protect that:

- **The item is the only unit of work — pathways are a view over items.** There is no
  separate "step" object. A `PracticeItem` may carry a `stageId` (placing it inside a
  pathway stage), a `strand`, and a `catalogKey`. Stage progress is *derived* from the
  mastery status of the items in it (`itemStageState` in `pathways.ts`). Never reintroduce
  a parallel to-do list next to items.
- **The catalog is reference data in code, not persisted.** `pathwaySeed.ts` defines
  per-stage `CatalogEntry` suggestions (gushes, lesson areas) with `about` guidance for
  conscious practice; `addFromCatalog` turns one into a real item with one tap. The new
  item is honestly **"Not practised yet"** (status `new`, zero stats) with an immediate
  Undo — adding is organisation, not progress. Label suggestions as reference aids, never
  canonical. Improving the catalog needs no migration; keep entry keys stable per stage.
- **Adding from the catalog is losslessly reversible.** The Undo is DURABLE (persists until
  dismissed or the item is practised — no timeout), and a fresh catalog item shows a "Remove"
  affordance on its row and in the item's "Connected to". `isLosslesslyRemovable`
  (`pathways.ts`, tested) gates this: `catalogKey` set AND status `new` AND zero blocks AND
  `timesPractised === 0`. The store's `removeCatalogItem` re-checks the predicate against
  LIVE blocks before delegating to `deleteItem`; once anything is logged, only the ordinary
  delete-with-confirm remains. This is the one place a stage row grows a second 44×44 action
  (− beside ▶); it disappears the moment the item is practised.
- **Structure, not gamification.** Show honest position (items solid / in progress /
  suggestions remaining). No streaks, scores, or fabricated mastery %.
- **Pathways/stages stay editable data** (`pathways`, `pathwayStages`, `pathwayRoutines`)
  with full CRUD. Sections are the stages' `group` string (rename via `renameSection`;
  new stages pick their section explicitly). Deleting a stage/pathway must never delete
  items — only detach them, and clear any stale `currentStageId` pin.
- **Routines are ordinary editable data belonging to an instrument** (`src/domain/routines.ts`,
  tested; CRUD in `src/store/useStore.ts`; editor at `src/pages/RoutineEdit.tsx`, route
  `/routine/new` or `/routine/:id/edit`). `PathwayRoutine.instrumentId` is optional at rest
  (a pre-v11 or General-pathway routine may have none — never fabricated) but REQUIRED for
  every routine created from now on; editing an already-unscoped legacy routine (e.g. just
  renaming it) must not invent one either — `RoutineEdit.tsx` defaults the Instrument field
  to the existing routine's own value (possibly none), never to `instruments[0]`, and only a
  brand-new routine requires a choice before Save is enabled. `pathwayId`/`stageId` are
  optional PLACEMENT, not identity, so a routine can exist unplaced ("my Setar warm-up");
  deleting a pathway or stage DETACHES its routines (clears the placement) rather than
  deleting them — pathway deletion clears both `pathwayId` and `stageId`, stage deletion
  clears only `stageId`. `RoutineSegment.itemId` optionally binds a segment to a real
  `PracticeItem`; a bound itemId must always match the routine's instrument, enforced at
  every edge (item deleted → unbind everywhere; item's instrument changes → unbind from
  now-mismatched routines; routine's instrument changes → clear mismatched bindings and
  detach an incompatible placement; pathway's instrument changes → detach an incompatible
  placed routine) — never by silently rewriting either side's instrument. `retargetRoutineInstrument`
  (`routines.ts`) is the one place these invariants are checked, and the store's `addRoutine`/
  `updateRoutine` call it UNCONDITIONALLY on every create and every save, not only when the
  instrument changed — a form is never trusted on faith for bindings or placement it didn't
  actually re-derive. That check also covers a `pathwayId`/`stageId` that doesn't actually
  resolve, not just one whose instrument mismatches: `addRoutine`/`updateRoutine` look up the
  routine's claimed pathway AND stage live and pass both into `retargetRoutineInstrument`,
  which never treats an unresolved `pathwayId` as an unscoped (therefore "compatible") General
  pathway just because the lookup came back `undefined` — a placement pointing at a pathway
  that no longer exists is cleared entirely, and a `stageId` that resolves to a *different*
  pathway's stage is cleared on its own, leaving an otherwise-valid `pathwayId` placement
  untouched. This is deliberately a save-time check, not a live one: editing a
  routine while it is ACTIVELY RUNNING (unbinding an item, changing the instrument) is
  allowed with no "is this active" guard, because `RoutineRunner.tsx` freezes the run's
  segment list (`activeRoutine.authoredSegments`/`segs`) at start and never re-derives it
  from the routine's current data — so a mid-run edit can never shorten or desync the
  in-flight run, and `finishRoutine` still records the genuinely-elapsed minutes against
  whatever item was actually practised. Discarding that instead would silently lose real
  practice, which nothing in this app is allowed to do. Finishing a run writes **at most one
  block per distinct bound item, never one per segment** — `aggregateItemMinutes` sums the
  ACTUAL elapsed running time across every visit to that item's segments (the seeded CGS
  Stage 1 routine repeats "Chunk chords" four times on purpose). The block's result stays
  the factory default `not_logged`: a routine records time, never a judgement, and never
  completes a review or advances SM-2. `focusForItem` (`src/domain/defaults.ts`) is the
  shared strong focus default — the same one `startItemSession` uses — so a routine block
  is indistinguishable from starting that item directly; do not reintroduce a third copy of
  that fallback expression. The run in progress lives in the store as `activeRoutine`
  (ephemeral — never in `PracticeDB`, same shape as `active`/`activePlan`), not component
  state: navigating away (nav-bar tap, browser back) never silently loses genuinely-elapsed
  bound-item practice, matching how an active block already survives navigation, and only
  one routine can run at a time — starting a different one while another is active redirects
  to resume it instead of overwriting its in-flight time. More generally, only ONE practice
  clock of any kind runs at a time, enforced by the START **and** RESUME half of both:
  `startSession` (so `startItemSession` and Session Plan's `beginPlanSegment`, which both
  route through it) and `resumeSession` both refuse while `activeRoutine` is set;
  `startRoutineRun` and `resumeRoutineRun` both refuse while `active` is set — the same
  guard pair in each shared function covers every caller, rather than trusting each page to
  check both. Resume needs the same guard as start: `active`/`activeRoutine` are both
  persisted (`partialize`), so a dual state can reach a device from before this guard
  existed, and resuming either clock without checking the other would tick both at once, the
  same bug as a fresh concurrent start. Without either half, an ordinary block and a routine
  could run concurrently and log the same wall-clock interval twice. Guarding start and resume
  is not enough on its own: those guards only run on an in-app action, but the persisted dual
  state itself re-enters the store on every load through the persist middleware's `merge` —
  the only path by which a whole `active`+`activeRoutine` pair can reach live state without
  going through either guard (`importDB`/`resetDemo`/`clearAll` all explicitly null both, and
  a sync pull replaces only `db`) — so `merge` is the one place this closes for good. If
  `merge` finds both `active` and `activeRoutine` set, it freezes both (the same
  accumulate-and-stop transform `pauseSession`/`pauseRoutineRun` already do): each keeps
  whatever time had genuinely elapsed, but neither is left `running` with a live timestamp to
  keep ticking from, so a stale dual state can never silently double-log time going FORWARD
  again. The historical overlap up to the moment of the freeze is deliberately left on both
  sides rather than guessed away — there is no way to know from the data alone which of the
  two was the "real" one, and discarding either would silently lose genuinely-elapsed practice,
  which nothing in this app is allowed to do; it becomes a stale pair the ordinary finish/
  discard flow (and then the same start/resume guards) makes the user resolve one of, same as
  any other unclosed block. `RoutineRunner.tsx`'s "an ordinary block is already running"
  redirect applies even to the routine the store considers "mine": once both can exist as a
  frozen (not just running) pair, showing the routine screen just because it's the active one
  would land the user on a Resume button that silently no-ops (`resumeRoutineRun` refuses
  while `active` exists) — redirecting unconditionally to `/active` gives one deterministic
  screen to resolve first, instead of a dead button on whichever screen they happened to load.
  The pages that start a
  clock (`Today.tsx`, `StageDetail.tsx`, `RoutineRunner.tsx`, and — for the out-of-scope
  pages that still `navigate('/active')` after a now-blocked start — `ActiveBlock.tsx`
  itself) resolve the conflict by redirecting to whichever clock is actually running instead
  of leaving the user on a dead screen. `RoutineRunner.tsx` derives
  remaining time from a wall-clock elapsed-seconds value (`runElapsedSeconds`/`locateClock`
  in `routines.ts`), the same accumulated-plus-live-since-a-timestamp shape as
  `sessionElapsedSeconds` — so pausing genuinely freezes it and a backgrounded/locked phone
  catches up across MULTIPLE segment boundaries at once rather than losing time or advancing
  one tick at a time. Skip clamps the current segment's effective duration to whatever
  actually elapsed (never the full authored minutes); a segment played to completion keeps
  its full duration. Choosing "short on time" (`segmentsForRun`) drops every non-essential
  segment, honouring the syllabus's asterisk rule. "Finish routine" (mid-run) always saves
  whatever bound-item time has genuinely elapsed via the same `finishRoutine` path as natural
  completion — never a separate discard — with a caption stating that plainly, since ending
  early must never silently fabricate or silently lose practice. Today's Routines card is
  documented in its own bullet above.
- **The current stage is the user's choice.** Teacher-led work jumps around:
  `Pathway.currentStageId` (pin) always wins; "first incomplete stage" is only the
  fallback. Never treat linear order as truth for Setar/Tar.
- **Pieces can have parts** (`parentItemId`): parts are ordinary items grouped under a
  piece/étude, with a deterministic "practise this part now" pick (`pickNextPart`) and a
  calm stall hint (`stallHint`) — smaller unit or new strategy, never quotas.
- **"My repertoire" is a DERIVED lens, not new structure.** Repertoire has exactly
  three views: **Pathways · My repertoire · Practice list**. A "work" is any top-level
  item with Persian identity (dastgāh/form/composer/gusheh) or a full piece/gusheh type
  (`isWork`/`repertoireWorks` in `src/domain/repertoire.ts`, tested). Persian works
  group by dastgāh via `groupByDastgah` (`src/domain/persian.ts` — folds spelling
  variants, labels with the user's own majority spelling, standard dastgāh order) with
  radif gushehs and composed maestro pieces side by side; other instruments group by
  study source. Parent works appear ONCE; parts stay nested (never standalone
  duplicates). Form/composer are compact metadata + filter chips, never a deep
  hierarchy. Dastgāh/form suggestions are datalists (reference aids), free text always
  wins. Never invent a parallel "pieces" object or a guitar-specific model.
- **Sources stay simple.** A Material is instrument + one clear name + kind + status +
  note. Piece-level detail (dastgāh, gusheh, composer, teacher) belongs on items, never
  on sources — the removed parent-title/section/teacher-source fields must not return.
  Sources are reached from Repertoire (not More), and are creatable inline from the
  item form.
- **Seeds are honest starting points, never fabricated authority.** Guitar = CGS. Setar =
  a radif/dastgāh map (teacher-driven, explicitly "reorder me"). Tar = the Honarestān
  method. Dastgāh intros use standard characterisations; per-gushe `about` text stays a
  generic conscious-practice prompt (shāhed / ist / forud) — the teacher's account is the
  authority, never invent specifics as if canonical.
- **Calm, self-paced copy.** "Move on when it feels right, not by a deadline" is the voice.

## Lessons (classes) and the deadline exception

`Lesson` records (per instrument, date + free-form notes) support the user's real
workflow: record the class, rewatch it, type up notes (often **in Farsi** — all free-text
fields must stay direction-aware; `.input`/`.textarea` carry `unicode-bidi: plaintext`,
which is the only place that rule is set — it is NOT global, and display text gets its
direction from the grouping rule below), then
create/link the concrete practice items (`lesson.itemIds` — a link, never ownership;
unlinking keeps the item). "Originated in this lesson" (`itemIds`) is separate from
"prepare this FOR that class" — a `preparation` entry in the lesson agenda (see below),
which gives a priority boost climbing towards ITS OWN class's date
(`lessonUrgencyScore`). This is the one sanctioned "deadline" in the app — a monthly
class is a real commitment, not a manufactured streak. Keep it per-instrument and
generic (future Tar/Guitar teachers), never guilt-toned. Attachments belong to an item
OR a lesson (`AttachmentMeta.ownerType/ownerId`; blobs keyed by `ownerId` in Dexie) for
SMALL files (PDFs/photos/short audio, size-capped). **Full class videos — and score
PDFs/docs — are NAS references, never bytes:** `Lesson.recordings` (`LessonRecording`)
holds title + a relative NAS path (or full https URL) + size/notes + an optional `kind`
(`LessonFileKind` = video/pdf/doc/audio; schema **v9** stamps legacy refs `kind:'video'`).
`resolveRecording` (`src/domain/recordings.ts`, tested) returns a discriminated
`ok|no-base|bad-base|empty` result — the scheme-less-base bug is fixed by
`normalizeBaseUrl` (prepends `https://`, rejects non-http(s), validates via `new URL`);
`resolveRecordingUrl`/`needsBaseUrl` are thin wrappers. It joins the ref under the
per-device NAS base URL (Settings, localStorage) and opens only on explicit tap — never at
startup, never in IndexedDB/sync/backups; a `bad-base` never `window.open`s. Removing a
reference never touches the NAS file. Lessons carry an optional `number`
(`nextLessonNumber` prefills it, editable, never required; shown as "Class N · date"); refs
render video-first then scores/docs with kind icons. The user's Setar class history imports
additively via `buildSetarClassLessons` (`src/domain/setarClasses.ts`, tested) →
`importSetarClasses`, which also **backfills** missing refs (video + one per PDF/doc,
path-deduped) onto already-imported lessons — idempotent. `SETAR_CLASS_SESSIONS` lives
between `// [scan:begin]`/`// [scan:end]` markers and is regenerated from the real NAS
folder by `npm run scan:setar` (`scripts/scan-setar-classes.mjs`, stdlib, dry-run by
default; pure helpers unit-tested) — references only, never copying bytes.

## Lesson commitments and questions are ONE typed collection (schema v12)

`PracticeDB.lessonAgenda` is the single home for "prepare this before that class" and
"ask this at that class" (`src/domain/lessonAgenda.ts`, pure and tested; queries in
`questions.ts`; UI in `src/components/LessonAgenda.tsx`). It replaced the item's rolling
`assignedForLesson` boolean and its single mutable `teacherQuestion` string, neither of
which could name WHICH class it meant or hold more than one answer.

- **Two kinds, one discriminated union.** `preparation` links an item to a lesson;
  `question` carries its own text, an OPTIONAL item, a lesson target and an open → asked
  lifecycle with an optional answer. Never separate independently toggleable booleans
  for next-class / asked / archived / completed.
- **A commitment names ITS OWN class, and that class's date is its only deadline.**
  `preparationDatesByItem` is the ONLY channel by which lesson intent reaches practice
  priority. A commitment for March never inherits January's deadline, a past commitment
  carries none, and an unassigned one carries none.
- **A QUESTION CHANGES NO PRACTICE PRIORITY, EVER.** It used to add three points and
  quietly reorder the day around a note to self.
- **An entry with no lesson is visibly UNASSIGNED, never guessed onto a class.** New
  entries default to the nearest upcoming lesson on that instrument with the date named
  on screen; with no future lesson they are captured unassigned.
- **Questions are selected BY LESSON ID** (`questionsForLessonId` /
  `openQuestionsForLessonId`), not by instrument — every future class used to show the
  identical list. `ClassQuestions` still exports them (Copy / Download / print), and a
  refused clipboard now says so in a live region and offers a selectable textarea.
- **Asked is explicit and reversible, and stays HISTORY.** Marking asked logs no
  practice and changes no urgency; the entry leaves the open lists, stays with the class
  it was asked at, and is never copied forward. An unasked question on a past class
  stays there until the owner explicitly moves it (`retargetEntry`).
- **Detaching preserves identity.** Deleting a lesson leaves its entries unassigned with
  `detachedFromLessonId` set; deleting an item removes its preparations (a commitment to
  prepare something that no longer exists means nothing) but KEEPS its questions with
  `detachedFromItemId` — a question and the teacher's answer are the owner's record of a
  class, not a property of the item. Nothing here deletes an item or its practice.
- **A question is never cleared by practising.** `CloseBlock` can raise one; it becomes
  its OWN entry and never overwrites another, and raising it does not commit the item to
  a class.

**The v11 → v12 migration converts legacy intent exactly once, and guesses nothing.**
`migrateToV12` turns each `assignedForLesson === true` into ONE unassigned preparation
and each non-empty `teacherQuestion` into ONE unassigned question — whatever the boolean
said, because the two were always independent facts. It reads NO clock (its timestamps
come from the item's own), so the same database migrates identically on two devices run
on different days. Multiline text stays ONE question. Ids are deterministic
(`prep:<itemId>` / `question:<itemId>`, with a `~2` suffix only when an unrelated entry
already owns one), the conversion is presence-aware, and the legacy fields are removed
only once their content is represented — so it is idempotent, including over an
already-current database whose agenda is legitimately empty.

**"REPRESENTED" MEANS SAME CONTENT, NOT MERELY A MATCHING ID.** A sealed review found
`represented()` treated a matching generated `id`/`kind`/`itemId` alone as proof a
question was already there — so a legacy `teacherQuestion` whose generated id happened to
already name a DIFFERENT existing question (partial migration, a hand-edited file, an
interrupted write) was silently DROPPED, because the pre-existing entry with the same id
looked like "already represented". A preparation carries no content beyond the link
itself, so any matching entry genuinely represents it, but a question's content IS its
text: `represented()` now also compares that text, and a same-id/different-text match
falls through to `freeId` exactly like an unrelated collision, so BOTH questions survive
under distinct ids. This step also now runs on EVERY inbound database, not only one
declaring `fromVersion < 12`: a database claiming the CURRENT schema can still carry a
stray `assignedForLesson`/`teacherQuestion` from an incomplete conversion, and gating on
the declared version silently accepted that leftover with nothing to show for it. Running
it unconditionally costs nothing extra on genuinely current data — it is a no-op wherever
neither legacy field survives.

**Inbound validation rejects invalid NEW intent and tolerates legacy debris — but only
where "legacy debris" is actually true.** `validateLessonAgenda` + `validateSchedulingFields`
run inside `validateDB`, before `replaceAllBlobs` and before any install: unknown kinds,
missing ids, duplicate ids, a missing instrument, empty question text, unreadable dates
and a target that RESOLVES to a different instrument all refuse the import with
actionable detail. A DANGLING `lessonId` is REFUSED: this app never leaves one dangling on
its own — `deleteLesson` always converts a live `lessonId` to `detachedFromLessonId` (see
`detachLesson`), so a `lessonId` that is neither absent nor resolving is invalid new
intent, not legacy debris to wave through. A sealed review reproduced `validateDB`
accepting `lessonId: 'nonexistent'` before this.

**A DANGLING LIVE `itemId` IS REFUSED FOR THE IDENTICAL REASON, NOT TOLERATED.** This
section previously tolerated it on the theory that the v11→v12 migration mints entries
from `db.items` at the moment it runs, so an item deleted afterwards could leave its own
agenda entries pointing at nothing. A sealed review found that theory does not hold
against the app's own REAL producer: `deleteItem` (`useStore.ts`) always calls
`detachItem` in the SAME synchronous update that removes the item — a preparation naming
it is removed outright, and a question's `itemId` is converted to `detachedFromItemId` —
so there is no in-app path that leaves a live `itemId` dangling any more than there is for
`lessonId`. Preparations and questions alike now require a PRESENT `itemId` to resolve to
a real item. A GENUINELY DETACHED record — `detachedFromItemId` set, `itemId` absent — is
unaffected: `detachItem` destructures `itemId` OUT rather than setting it `undefined`
(the same shape `detachLesson` already used for `lessonId`), so this strict check never
sees one to reject, and `io.test.ts` proves that against the real `detachItem` producer,
not a hand-built approximation of its shape.

**CALENDAR VALUES ARE CHECKED FOR REAL VALIDITY, INCLUDING A QUESTION'S OWN `askedAt`.**
`nextReviewDate`/`srLastProgressDay`/a review's `dueDate` (`isValidISODate`,
`scheduling.ts`) and a question's `askedAt` (`isValidISODateTime`, `lessonAgenda.ts`) all
round-trip their calendar components through `Date.UTC` rather than trusting a shape
regex or `Date.parse` alone: `/^\d{4}-\d{2}-\d{2}$/` (or its date-time equivalent) happily
matches `"2027-99-99"` and `"2026-02-30T12:00:00.000Z"`, and `Date.parse` silently
NORMALISES an out-of-range day (February 30th becomes March 2nd) rather than rejecting
it. A sealed review reproduced `askedAt` accepting exactly that string — the date-only
check had already been fixed once, but its date-TIME sibling in a different file had not.
The two checks stay small and separately owned, one per file, rather than merged into a
shared import.

**THE HYDRATION BOUNDARY ENFORCES ALL OF THIS TOO, NOT ONLY `validateDB`'S IMPORT-PATH
CALLERS.** A sealed review found Zustand's own persist `migrate`/`merge` (`useStore.ts`)
called `migrateToCurrent` directly, bypassing everything above: a persisted schema NEWER
than this build understands got silently stamped down to `SCHEMA_VERSION` by
`migrateToCurrent`'s own final line and hydrated anyway, and an already-current v12
database carrying a dangling live `itemId` or an impossible `askedAt` entered live state
unchanged — reproduced through the real Zustand `persist.rehydrate()`, not merely
`validateDB` called by hand. Both hooks now call `validateDB` itself — the SAME function,
not a parallel check — so hydration refuses exactly what every other inbound door already
refuses. Letting it THROW there (never caught) is deliberate: `hydrate()` only calls its
own raw `set()` once `migrate`/`merge` return normally, and only persists the result back
to storage after THAT — a thrown validation error rejects the whole promise chain before
either happens, so a refused hydration leaves BOTH the live state and whatever is actually
on disk exactly as they were, never a downgraded-and-relabelled or partially-installed
in-between. The gate that flips `hydrated: true` deliberately stays UNFLIPPED on a refusal
rather than forcing it open: every external call to `useStore.setState` — the only way to
flip it — is itself wrapped by this same persist middleware to re-persist the current
state immediately afterwards, so forcing it open here would write the live (fallback)
database straight back over the very data a refusal, above all a genuinely newer schema,
exists to protect. `getLastHydrationError()` (`useStore.ts`) still surfaces WHY, as a
plain module variable rather than store state, for the identical reason — recording it
through `setState` would trigger that same destructive write.

**A REFUSED HYDRATION IS SURFACED TO THE UI, AND THE OWNER HAS A REAL WAY BACK IN.**
`hydrated` never turns true on a refusal (zustand's own `onFinishHydration` fires only on
the success path), so without a separate signal `App.tsx` stayed on "Loading…" forever
with no visible reason. `onRehydrateStorage` also writes to `useHydrationStatus`
(`useStore.ts`) — a second, UNPERSISTED store (the same shape `useSyncStatus` already
uses) — distinguishing a genuinely newer schema (`tooNew`, an app-update problem) from
invalid/corrupt current-version data (an owner-fixable one). `App.tsx` renders an
explanation instead of the spinner whenever `!hydrated && hydrationStatus.refused`, reading
`useHydrationStatus` only and never writing to `useStore` on its own, so simply SHOWING
this screen touches neither the live nor the persisted database.

A sealed review found the first version of this screen actionable in wording only: it told
the owner to "use Import in Settings", but Settings — like every other route — mounts only
once `hydrated` is true, which this exact refusal prevents. There was no way back in.
`ColdStartRecovery` (`App.tsx`) closes that: a file control rendered directly on the
refusal screen, shown ONLY for the invalid/corrupt-data case — never for `tooNew`, which
has no safe import/downgrade and keeps the plain "update the app" guidance. It calls
`recoverFromRefusedHydration` (`store/backup.ts`), a thin wrapper over `importFullBackup`
rather than a second import implementation, so an invalid recovery file is rejected through
the SAME §C7 validation every other inbound door already uses, with nothing written. On
success it additionally flips `hydrated` true and clears the reactive refusal flag —
`importFullBackup`/`importDB` install a valid `db` but have no reason to know about a gate
that exists only before this device's very first successful hydration. The bytes already on
disk are never touched by anything except that explicit, validated recovery: rendering the
screen, and a rejected recovery attempt, both leave them exactly as they were.

## Persian text is canonical, and direction-aware

Built-in Setar/Tar data (pathway/section/stage names, catalogue gushehs, forms,
composers, study sources, seeded items) is authored in **Farsi**; generic app UI and
Classical Guitar stay English. STABLE ascii identifiers are decoupled from Farsi
display: `StageSeed.slug` / `StepSeed.key` in `pathwaySeed.ts` keep stage ids and
catalog keys byte-stable (fall back to `slug(code)`/`slug(title)` for English seeds), so
the Farsi conversion needs no migration. `src/domain/farsi.ts` (tested) provides
`normalizePersian` (fold Arabic↔Persian yeh/kaf, digits, ZWNJ, whitespace — preserves
آ), `faCollator` for sorting, and Latin transliteration aliases for search
(`persianSearchMatch`); `groupByDastgah` folds spelling variants and ranks by Farsi or
Latin dastgāh names. Every Farsi surface resolves its direction NATIVELY, via
`dir="auto"` — never by detecting a script in JavaScript and never by reordering text.
Free-text FIELDS also carry `unicode-bidi: plaintext` (set on `.input`/`.textarea` in
`global.css`, and nowhere else — this was previously described here as global, which was
never true).

**LAYOUT FOLLOWS THE DIRECTION OF THE CONTENT IT SHOWS.** A title and the details that
belong to it sit in ONE group carrying `dir="auto"`, so a Persian item reads as one
right-aligned block. Before 2026‑09‑11 direction sat on the TITLE alone at 47 sites and
on no container anywhere: a Farsi title resolved RTL and hugged the right edge of its
cell while its own "due 14 days ago" caption, carrying no direction at all, hugged the
left — the app looked polished in English and broken on the two instruments whose seeded
data is entirely Farsi. The rule is now mechanical, not a matter of care:

- `dir="auto"` appears on GROUPS (the element holding a title together with the details
  that belong to it) and on free-text FIELDS — **never bare on a title element**
  (`truncate`, `title-md`, `page-title`, `stage-unit-title`).
- The group is drawn so the TITLE is the first strong text inside it. Where an English
  eyebrow precedes the title in the DOM — Today's Practise-now card, the close screen's
  header, Session Plan's minutes/bucket line, ItemDetail's "practise this part now",
  Today's Routines doorway ("Resume your routine"/"Routines" precedes the routine's own
  name), ActiveBlock's "Last time you decided to try:"/"Working on:" — the group wraps
  title + details and LEAVES THE EYEBROW OUT, because `dir="auto"` resolves from the
  first strong character in the subtree. Getting this backwards doesn't just mis-align:
  Today's Routines buttons carried `dir="auto"` on the whole button, so the fixed English
  label — not the Farsi routine name that followed it — decided the resolved direction,
  and the button never read the name at all.
- **A detail that mixes languages needs its OWN nested `dir` inside the group, not the
  group's resolved direction.** Two different cases, two different attributes:
  - A detail that is ALWAYS ENGLISH BY CONSTRUCTION — `buildReason`/`planSegmentReason`'s
    generated sentences (Today's recommendation reason, ItemDetail's "practise this part
    now" reason, Session Plan's segment reason) — carries its own `dir="ltr"` isolate
    around the whole sentence, nested inside the group. Grouped under a Farsi title, that
    div/paragraph still resolves RTL and the detail still sits in the same right-aligned
    block (nothing about ALIGNMENT changes) — but the isolate fixes the sentence's OWN
    bidi base to LTR, so the title's RTL base can no longer drag the sentence's trailing
    full stop to the visual start (FriBidi renders a trailing neutral character using the
    surrounding base direction when nothing more specific claims it). `dir="ltr"` here is
    a static fact about content that is never user text, not detection.
  - A detail that is FREE TEXT the owner typed (ActiveBlock's `constraint`,
    the "last time you decided to try" note) sitting after a fixed English label —
    `Constraint: `, `Working on: `, `Last time you decided to try: ` — carries its own
    `dir="auto"` around just the value, not the label. The label would otherwise be the
    subtree's first strong text (the same eyebrow bug as above) and pin the whole line to
    English regardless of what the owner actually typed.
- A group that sits under an ancestor pinning `text-align: left` OR `text-align: center`
  must set `text-align: start` on itself, or its own direction never reaches the
  alignment — ActiveBlock's whole screen centres its timer and buttons regardless of
  language (that stays, it isn't text), but the title group overrides back to `start`
  so ac-6's "English stays left, Farsi goes right" actually holds on that screen. This
  is a deliberate LAYOUT CHANGE for English on Active specifically (centred → left) and
  does not conflict with "English keeps its layout exactly as it is today" elsewhere in
  this file: that non-goal protects English from being flipped to a Farsi-style
  right-align, it was never a promise that Active's pre-existing centring was sacred —
  ac-6 names Active as a checked surface with exactly this expectation.
- Group HEADINGS that render Farsi (the dastgāh sections, Materials' instrument sections)
  take direction on the SECTION, so a heading can no longer disagree with the rows
  beneath it.
- A lone title with no caption of its own takes the group it shares with its badge or
  action — the row itself.
- OUT of scope by construction: `<option>` contents (the native control owns their
  rendering) and titles inside `confirm()`/toast template strings (plain strings, not
  laid-out blocks). `ItemForm.tsx`, `QuickAdd.tsx` and `RoutineEdit.tsx` hold field sites
  only and are correct as they are.

`src/components/direction.test.ts` holds this closed and records the surface list, so a
missed title FAILS and a whole skipped file FAILS — and "fixing" one by deleting the
attribute fails too, since that would break Farsi rendering outright. Genuine exceptions
live in that test's explicit allowlist AND here; **the allowlist is currently EMPTY**,
because every title on every surface turned out to have a group it could join. An
exception must always be VISIBLE, never silent.

**"a whole skipped file fails" is not the same guarantee as "a deleted site fails."** A
per-FILE check ("does this file have at least one group somewhere") stays green as long
as one group survives anywhere in the file — so deleting the Practise-now card's own
`dir="auto"` from Today.tsx, which carries several other unrelated groups, passed that
check even though the one thing it was there to prove had broken. `GROUP_SITE_INVENTORY`
in that test is the fix: every group-level site, recorded in file-then-source order,
DUPLICATES INCLUDED (three bare `<div dir="auto">` in Today.tsx are three sites, not one
collapsed entry, or removing one of the three would still pass a de-duplicated list), and
asserted with `toEqual` against the live scan. Deleting any one recorded site — anywhere,
in any file — shrinks or reorders that array and fails, regardless of what else survives
in the same file. It carries the same visibility contract as the title allowlist: a
legitimate new group site must be added to the recorded array (a test fails until it is),
never inferred silently. The scanner also strips `//` and `/* */` comments before
matching — this file's own prose repeatedly writes the literal string `dir="auto"`, and
matching inside a comment either produces a site with no real enclosing tag or, worse,
walks backward out of the comment and mis-attributes an unrelated tag from earlier in the
file.

**A GROUP CARRYING DIRECTION IS NOT THE SAME CLAIM AS EVERY CHILD IN IT HAVING ITS OWN.**
A sealed review rejected the first pass at this section for exactly that gap: the
inventory above proves a title and its details share ONE resolved direction (the fix this
whole rule exists for), but it says nothing about a CHILD inside that group whose own
bidi base needs to be independent of the title's — a Farsi title makes the group resolve
RTL, and anything else in that subtree with no `dir` of its own is exposed to that same
RTL base. That is exactly right for a caption that belongs to the title (the point of
grouping), but wrong for two other shapes:

- **Fixed English page copy or generated metadata** — a hardcoded sentence
  (`CloseBlock`'s "A few seconds to capture what happened.", `StaleNote`'s "Running far
  past its target…"), or a phrase built from numbers and English words
  (`{n} segments · {m} min`, `due {relativeDay(...)}`) — is never user text and never
  changes language, so it carries its own `dir="ltr"` isolate, nested inside the group,
  the same shape already established for `reason` props (Today/ItemDetail/SessionPlan).
  The counterexample the review found: `CloseBlock.tsx`'s "A few seconds…" sentence sat
  bare in the item-title group, so a Farsi title made its trailing full stop render at
  the visual start — the same defect this section already fixed once, reappearing one
  level down. `TodayRoutineRow`/`PathwayDetail`'s `RoutineRow`/`StageDetail`'s
  `RoutineCard` all render the identical "N segments · M min" phrase and all needed the
  same isolate — a fix applied to one occurrence of a repeated pattern and not the
  others is exactly the kind of gap this closure exists to catch.
- **An independently-authored value** — a question, an observation, a
  pathway's own description or note — carries its own `dir="auto"` isolate for the same
  reason `ActiveBlock`'s `constraint`/`previousNextAction` already do: its
  language cannot be assumed from the title sitting next to it. The counterexample:
  `ClassQuestions`' question and last-observation values sat bare in the title's `<li>`
  group with no isolate of any kind — unlike `ActiveBlock`'s established shape (a fixed
  English label left bare, immediately followed by the value in its own `dir="auto"`),
  which `ClassQuestions` now matches rather than inventing a third pattern.

**THIS IS DELIBERATELY NOT "no bare Latin text in a group."** A short fixed label
immediately followed by its own isolate — `Constraint: ` before
`<span dir="auto">{value}</span>`, and `ClassQuestions`' own dated
`Last observed …` caption above the same shape — stays bare on purpose; flagging it would force a change to an
already-correct, already-reviewed pattern. What actually breaks is a real PHRASE that
reaches the end of a group's rendered content with nothing to isolate it — which is
what `src/components/direction.test.ts`'s `unexemptedPhrase` scans for mechanically: it
walks a group's body in source order, accumulating exposed literal text, and clears
that accumulation the moment it is immediately followed by any element carrying its own
`dir=` — regardless of the accumulated text's length, which is what keeps the
`ActiveBlock` label shape passing. Only a run that survives to a TAG boundary (not an
expression boundary — `{n} segments · {m} min` is one generated phrase split across two
expressions and must not fragment into single, individually-innocent words) and reads
as two or more words is flagged. This is the "detectable, not enumerated" half the
rejected review asked for: a NEW hardcoded sentence dropped into a group without its own
isolate fails this test on its own, the same way a missed title already failed the
group-vs-title test above.

What that scan cannot see from source — an independently-authored VALUE (an
expression whose content is opaque, like `{q.lastObservation.text}`) needing `dir="auto"`, or
a component like `StaleNote` whose OWN return value needs to be isolated regardless of
which title group calls it — is a recorded ledger instead, `ISOLATED_VALUE_SITES` and
`LTR_ISOLATE_SITES` in the same test file, carrying the identical visibility contract as
`GROUP_SITE_INVENTORY`: a legitimate new one must be added, visibly, or the test fails
until it is.

**AN ISOLATE MUST BE INLINE. A BLOCK CARRYING ONE RESOLVES ITS OWN ALIGNMENT,
INDEPENDENTLY OF THE GROUP.** A third rejected review found `ItemMaterial.tsx`'s NAS/
device detail line isolated with `<div className="tiny faint" dir="ltr">…</div>` — the
isolate correctly fixed the sentence's own bidi ordering, but moved the BUG rather than
fixing it: `text-align: start`, inherited from the group, is a per-box COMPUTED value
that resolves against THAT box's OWN `direction` — give the div its own `dir="ltr"` and
its `text-align: start` resolves LEFT regardless of the group's (possibly RTL) resolved
direction, splitting the detail from a right-aligned Farsi title exactly as before, just
relocated one level down. An inline isolate (`<span dir="ltr">`, nested inside a block
that carries no `dir` of its own) never has this problem: `text-align` only governs how a
BLOCK aligns its own content, and a `<span>` is not itself a block — even where a flex
container blockifies it into a flex item, that item sizes to its content, so there is no
extra width for its own `text-align` to act on. Its `dir` therefore only ever isolates the
Unicode bidi algorithm's treatment of the text inside it, never which edge anything
visually sits on — the established shape throughout this file was always the span form,
and the block form was a new, narrower regression in one fix. `direction.test.ts` now
bans the shape mechanically rather than by care: no
`dir="ltr"`/`dir="rtl"` may sit on any tag but `span`/`bdi`, full stop, so this class of
bug cannot resurface in any file, named here or not — one location fixed and the anti-
pattern deleted are two different guarantees, and only the second is durable.

**A NATIVE LIST MARKER'S OWN LOGICAL POSITION IS NOT SOMETHING A GUTTER MEASUREMENT CAN
GUARANTEE.** The third rejection found `ClassQuestions.tsx`'s `<ol>` reserving gutter
space with `paddingInlineStart` alone while each `<li>` resolves its OWN direction via
`dir="auto"`, and fixed it with symmetric `paddingInline` instead, reasoning that a
marker landing on either side would then have room. A SIXTH SEALED FINDING, checked on
the owner's own iPhone, found the number still escaping the card even with that room
reserved: an outside `::marker`'s exact position for a direction-variable list item is a
browser implementation detail — exactly the class of thing jsdom cannot compute either,
which is why a padding measurement was ever trusted to stand in for it — not a distance a
gutter can be sized against. The fix stops accommodating the native marker and removes it
instead: `listStyle: 'none'` on the `<ol>`, with the ordinal rendered as a real element,
the FIRST child of a flex `<li dir="auto">`. Flexbox's row axis is direction-aware BY
SPECIFICATION (`flex-direction: row`'s start is the writing mode's own start, not a fixed
physical side), so the number leads on the right for a Farsi question and on the left for
an English one — and because it is now an ordinary flex child inside the `<li>`'s own
content box, rather than a marker rendered in the padding area outside it, it can no
longer escape the card on any device. It carries no `dir` of its own (a digit is
bidi-neutral, so `dir="auto"` on the `<li>` skips it and still resolves from the title as
before) and neither does the wrapper around title/question/details: `dir="auto"` skips a
descendant that carries its own `dir` when hunting for a first strong character, so
giving the wrapper one would leave the `<li>` with no resolution source at all — the same
class of regression the `stage.title` revert and the instrument-name checks above already
found. `direction.test.ts` now asserts the mechanism directly rather than a proxy for it:
every `<ol>`/`<ul>` containing a `dir="auto"` `<li>` must disable the native marker
outright, and that `<li>` must itself be a flex/grid container able to reorder its own
content — a shape check on the fix itself, not a measurement around a browser behaviour
nothing here can verify.

Removing the native marker has an accessibility cost the visual fix alone doesn't pay
back: WebKit drops an `<ol>`'s own list semantics from the accessibility tree once
`list-style: none` removes its marker, so VoiceOver on the owner's own iPhone — the exact
device this fix targets — would stop announcing "list, N items" or a question's position
in it. `role="list"` on the `<ol>` restores that; the visible ordinal carries
`aria-hidden` so it is not announced a second time on top of it.

**A ROW'S OWN ALIGNMENT COMES FROM THE VALUE, NEVER FROM A LABEL MARKED OUT OF THE HUNT.**
The sixth finding also covered `ClassQuestions`' `Problem:`/`Last time:` lines, diagnosed
at the time as a WRAP-alignment gap: the established shape — a fixed English label left
bare, immediately followed by the value in its own `dir="auto"` isolate — gives the
value's own CHARACTERS correct bidi order, but a plain inline span has no width of its own
to align a wrapped line within, so a long value was given `display: 'inline-block'` +
`textAlign: 'start'` to align its OWN wrapped lines independent of whatever surrounded it.

A SEVENTH SEALED FINDING found that diagnosis addressed the wrong claim. Giving the value
its own wrap-line alignment is not the same claim as giving the ROW — the element that
actually positions "Label: value" as a unit — the right alignment in the first place. The
row itself was left BARE in both the original and the wrap-alignment fix, so it inherited
whichever direction the TITLE above it resolved to, regardless of what script the VALUE
was written in. For a Farsi title with a Farsi value this looked right by coincidence
(inherited-from-title happened to match the value); for an English-titled item with a
Farsi problem note, the whole row stayed pinned left — the label's inherited position, not
the value's own — with the value's internal characters shaping correctly but its overall
POSITION wrong regardless of whether it wrapped. This is exactly the "a group carrying
direction is not the same claim as every child in it having its own" family two sections
up, just not yet applied to a row whose OWN direction, not merely a child's bidi base,
needed to track an independently-authored value.

The fix moves `dir="auto"` from the value to the ROW, and marks the LABEL — never the
value — with its own `dir="ltr"`. Not because the label's text ever changes: `dir="auto"`
skips a descendant that carries its own `dir` when hunting for a first strong character
(the exact mechanism the eyebrow/title split above already relies on), so marking the
label takes it OUT of that hunt and leaves the deliberately bare value as the row's only
candidate. Marking the value too would take BOTH out, leaving the row with nothing to
resolve from and a silent fallback to LTR no matter what the value says — confirmed to
fail the new check when tried, alongside the opposite mutation (removing the label's
`dir="ltr"` entirely, reverting to the original bug), which the pre-existing
`unexemptedPhrase` check also independently catches. Verified across all four
title/value language combinations at both a 350px (iPhone-card-width) and a 700px
(desktop) container width: a value's own language determines its row's alignment
independent of the title, in both directions, at both widths — and with all four lines
(title, question, Problem, Last time) now agreeing, the block reads as one attached unit
against the marker rather than two aligned lines and two stray ones.

`direction.test.ts` replaces the two `ISOLATED_VALUE_SITES` snippet entries with a SHAPE
check, `isLabelFirstAutoRow`: any `dir="auto"` group whose body opens with a
`<span dir="ltr">…</span>` must have no other `dir=` anywhere else in its body. It is not
anchored to `ClassQuestions.tsx` — it would catch the identical regression in any future
file adopting this label-first-row pattern, the same "shape, not a location list"
discipline the instrument-name and native-marker checks above already established. This
is deliberately NOT generalised to `ActiveBlock`'s
`constraint`/`previousNextAction` or `RoutineRunner`'s `Next:` label, which use
the older bare-label-then-isolate shape: those fields sit directly under their own title
in this app's real data (never independently mismatched), so the failure this fixes does
not arise for them, and touching files this lane's own brief did not name would be scope
the sealed finding never asked for.

**THE MARKER/TITLE GAP AND THE RAGGED LEFT EDGE ARE TWO DIFFERENT CLAIMS, AND ONLY ONE OF
THEM WAS EVER BROKEN.** A follow-up OWNER pass on this same finding read as a second,
distinct complaint — the ordinal "looked" detached from a Farsi question because the
Problem/Last-time lines sat at the opposite (left) edge while the title and question sat
right, an asymmetry a screenshot reads as "the number is not attached" even though the
title itself was never the problem. Measured directly against the live DOM (real seeded
Farsi data, cloned at a 340px container width, text extents read via
`Range.getClientRects()`, not `getBoundingClientRect()` on the boxes): the ordinal's right
edge sits at 338px, the title/question/Problem/Last-time lines all right-align flush
against 330px — an 8px gap matching the authored `gap: 8` on every one of the four lines,
not just the title. The remaining LEFT edges spread across a 143px range (62px-205px),
because the four lines are different lengths and each is right-aligned within a box whose
own right edge is pinned to the ordinal regardless of the box's width. That spread is
mathematically invariant to how the box is sized: left edge = box_right minus line_width,
and box_right never moves, so switching the wrapper from `flex: 1` (this file's `.grow`)
to shrink-to-fit was tried and measured byte-for-byte identical before and after — proof
that no flex-sizing change can touch it, because there is nothing wrong with the sizing to
begin with. A ragged left edge on right-aligned lines of differing length is ordinary
typography (the same thing an address block or a right-aligned caption does), not a
resolvable defect, and the row-direction fix above is what actually closed the gap the
owner was reacting to for THAT screenshot: before it, Problem/Last-time sat at the FAR left
(~25px, the opposite edge entirely) while title/question sat at ~330px — a hard
two-line/two-line split, not mere length variance. Once all four lines agree on which edge
they hug, the remaining spread is length variance, and no further padding or flex-sizing
change was warranted for it specifically. **This measurement is scoped to the ragged-edge
question alone and is NOT a claim that every marker-attachment complaint was closed** — a
NINTH finding below, on the exact same screenshot's underlying data, found a real,
different structural bug in how the `<li>` itself picks its resolved direction. Read that
finding for the actual fix; do not re-derive "nothing more to do here" from this measurement
a second time.

**THE `<li>`'S RESOLVED DIRECTION WAS ANCHORED ON THE WRONG CANDIDATE — THE OPTIONAL TITLE,
NOT THE GUARANTEED QUESTION.** All of the verification above — this file's and the
Seventh/Eighth findings' — used seed data where an item's title and its teacher question
(then an item field, now a `lessonAgenda` entry) happen to share a language. That is exactly the one condition under which the underlying
bug is invisible: `<li dir="auto">`'s hunt for a first strong character skips any
descendant that carries its OWN `dir` (the same skip mechanism used throughout this file),
and both the question and the Problem/Last-time rows already carried their own `dir="auto"`
isolates — so the hunt could only ever land on the bare TITLE. Whichever language the TITLE
happened to be in decided which side the ordinal rendered on, regardless of the question's
own language. An OWNER pass with a title and question in DIFFERENT languages (reproduced
directly against the live running app — the real Teacher Report page, not a clone — by
temporarily setting an English title on the real seeded Farsi item via the store) showed
this concretely: the ordinal and title landed together on the English side, while the
question — right-aligned by its own independent `dir="auto"`, correctly, on its own terms —
sat at the FAR OPPOSITE edge, unattached from the marker entirely. The reverse combination
(Farsi title, English question) reproduced the mirror image. Neither combination is exotic:
an item's title is free text the owner chooses for their own reasons and has no obligation
to share a language with a teacher's question about it.

The fix reverses which of the two is left bare. The lesson-agenda query behind this list
(`openQuestionsForLessonId`, formerly `questionsForNextClass`) guarantees `q.question` is
non-empty on every row this component ever renders — a question entry has no meaning
without its text; `q.title` carries no such guarantee and is authored completely independently.
The title now carries its OWN `dir="auto"` isolate (the same skip mechanism, deliberately
applied to the OTHER field this time), so it renders in its own correct direction but is
taken OUT of the `<li>`'s hunt; the question is left bare, so it is what the `<li>`'s
`dir="auto"` actually finds — the marker now always tracks the question, the one field
guaranteed present, never the optional title. Structural, not padding: this is the same
skip mechanism this file already relies on throughout, applied to the correct field.
Verified directly against the real, running page
(not a synthetic clone) at both a 390px (real DOM node, width forced via the live element's
own style, not `resize_window` — which does not affect layout in this environment — so the
SAME component tree is exercised, just narrower) and the full desktop width: an English
title with a Farsi question now attaches the marker to the question (right) with the title
independently left-aligned; a Farsi title with an English question attaches the marker to
the question (left) with the title independently right-aligned; the original matching-language
case (both Farsi) is unaffected. `direction.test.ts` records this as a dedicated,
mutation-tested shape check (`"the question anchors ClassQuestions' <li>..."`) asserting the
title's tag carries `dir="auto"` and the question's does not — confirmed to fail under both
reverted mutations (title bare again; question marked again) before being committed.

**THE LESSON THIS FILE KEEPS RELEARNING:** matching-language seed data proves a fix works
when title and value AGREE, and says nothing about what happens when they DISAGREE — the
Seventh finding's row-direction fix and this Ninth finding are the same shape of gap,
found twice because the same seed data was trusted twice. Any future verification of a
mixed-language surface in this file should deliberately construct a MISMATCHED case, not
only the matching one already in the seed.

**THE SOURCE SCANNER'S OWN BLIND SPOT WAS THE BIGGER GAP.** `unexemptedPhrase` skipped
every `{…}` expression as fully opaque, contributing zero words — which is exactly
right for a single expression like a title, but means a run built ENTIRELY from
expressions (`{MATERIAL_SOURCE_LABELS[m.sourceType]} · {MATERIAL_STATUS_LABELS[m.status]}
·{' '} {itemCount(m.id)} item{…}`) read as zero words to the scanner while rendering
three always-English fragments in a row, unisolated, in a group whose title could
resolve RTL. This is precisely why the named counterexamples (`Materials.tsx`,
`ItemCard.tsx`, `RoutineRunner.tsx`, `Lessons.tsx`, `Repertoire.tsx`) passed a test that
was supposed to catch them. Fixed by counting an opaque, non-JSX-bearing expression as
ONE token rather than zero — its actual text stays invisible from source, but its mere
UNISOLATED PRESENCE next to other content is what the shape is; an expression whose own
content contains nested JSX (`{cond && <div dir="auto">…</div>}`) stays fully opaque, its
children already reachable by the outer whole-file scan. That single change, plus
re-auditing every recorded group's body by hand, found the five named sites AND several
more of the identical shape the review did not enumerate: `Repertoire.tsx`'s SECOND,
near-duplicate dastgāh-count span (the non-Persian `sourceGroups` branch mirrors the
fixed one exactly and had been missed), `ActiveBlock.tsx`'s mode/focus chips (the
practice screen itself), `Attachments.tsx`'s and `ItemDetail.tsx`'s file kind/size line,
`StartBlock.tsx`'s and `Today.tsx`'s item-type/status labels, `StageDetail.tsx`'s
strand/status `meta` line, `PathwayDetail.tsx`'s "Current"/"Done"/item-count badges and
its piece-count fallback, `Today.tsx`'s "routine running" indicator (at the time, one
`dir="ltr"` isolate covering the whole phrase — a sealed review later found that this
wrongly pinned the instrument name inside it too; see below) and its cross-instrument
Overview row (a fixed sentence embedding the next item's own possibly-Farsi title —
isolated the same way `StageDetail`'s undo banner already does, whole sentence under one
`dir="ltr"`), and `Insights.tsx`'s generated observation sentences (several of which also
embed an item's own title mid-sentence). One further site needed the OTHER isolate —
`dir="auto"` for a value authored independently of its neighbour, not `dir="ltr"` for
generated copy: `RoutineRunner.tsx`'s "Next: {label}" (the upcoming segment's own name).
`PathwayDetail.tsx`'s pathway `source` field got the same treatment (free text beside the
instrument name, at the time itself still wrongly isolated as `dir="ltr"` — see below),
but its stage's own `title` was tried the same way and REVERTED: `stage.title` is not authored
independently of `stage.code`, it is the SAME stage's own fuller name, and this file
already settles (a few paragraphs up) that the two must AGREE on whichever direction
the group resolves — isolating `stage.title` would have pulled it OUT of the button's
own `dir="auto"` detection (a nested `dir` is skipped by the HTML auto algorithm),
which can flip the group's resolved direction whenever `stage.code` itself carries no
strong character. It stays a bare `<span>`, exactly like `stage.code`.

**RE-DERIVING THE TEST'S OWN TAG TRAVERSAL FROM FIRST PRINCIPLES FOUND A DEEPER GAP
THAN ANY SINGLE MISSED FILE.** `elementBody` (the helper both `unexemptedPhrase` and
the isolate-skip logic use to find where an element's content ends) tracked nesting
depth by incrementing on every opening tag and decrementing on every closing one —
except a React Fragment shorthand, `<>`, starts with neither `/` nor a letter, so it
matched NEITHER branch and never incremented depth, while its own close, `</>`, starts
with `/` and DID match the closing branch, decrementing it. Every `<>…</>` pair inside
a body therefore owed depth one MORE decrement than it was ever given an increment for
— and this codebase's own established shape for a conditional detail
(`{stage && (<><span>…</span><Link>…</Link></>)}`, exactly what `ItemDetail.tsx`'s
header uses) hits that shape twice. On that header, depth reached zero several tags
before the real `</header>`, so `unexemptedPhrase` silently stopped scanning before
ever reaching `<span className="tiny faint">difficulty {item.difficulty}/5</span>` — a
real, unisolated generated-English phrase that had been sitting in the group
throughout every previous pass of this lane, invisible to a scanner whose entire claim
is "detectable, not enumerated." Fixed by giving `<>` the same weight as any other
opening tag. Re-running the FULL suite after the fix surfaced exactly this one
violation — nothing else in the currently-scanned files was hiding behind the same
bug — now closed with the same `dir="ltr"` (at the time, `instrumentName` sat in this
same list too — a sealed review later found that wrong; see below — plus
`ITEM_TYPE_LABELS`, "difficulty N/5", "saturated — consider resting") the rest of this
section already established, while `stage.code` and the material label stay bare for the
same reason `stage.title` does two paragraphs up. The lesson generalises beyond this one bug: an
example-driven fix only ever closes the examples in front of it; only re-deriving a
shared helper's own correctness from what it claims to do (does `<>` open or close a
nesting level? — the answer was always "both, and this code only handled one") finds
what a location list, however carefully audited, cannot.

Two sites the stronger scanner flagged are recorded, VISIBLY, as genuine exceptions in
`UNEXEMPTED_PHRASE_ALLOWLIST` rather than isolated: `PathwayDetail.tsx`'s stage-progress
counter (`{sp.done}/{sp.total}`, e.g. "3/5") is digits only — numbers carry no bidi risk
the way an English WORD dropped into an RTL run does — and `ItemDetail.tsx`'s
pathway-plus-stage breadcrumb (`` `${pathway.name} — ` `` immediately followed by
`{stage.code}`) is one continuous compound LABEL built from two fields, not a title
split from an unrelated caption; there is no separate "caption" here with an opinion of
its own about direction. The allowlist carries the same visibility contract as
`ALLOWED_TITLE_SITES` — a stale entry (naming a site that no longer exists) fails its own
test.

**THE SCANNER'S OWN COMMENT-STRIPPING HAD A LATENT BUG THAT THIS WORK EXPOSED.**
`stripComments` treated any `'`/`"` as a real string delimiter and scanned forward,
unbounded, for its match — correct for a real JS string, wrong for plain JSX TEXT
containing an apostrophe (`StageDetail.tsx`: "That stage doesn't exist."). Hitting that
apostrophe outside any real string put the scanner into a phantom "inside a string"
state that swallowed everything after it — real comments included — until an unrelated
quote character somewhere later happened to close it, cascading into a chain of further
phantom strings for the rest of the file. This had been silently true all along; it only
surfaced now because a newly added comment happened to be inside the corrupted span and
happened to quote `dir="ltr"` in its own prose, which the (no longer stripped) comment
then exposed to the `dir="ltr"`/`dir="rtl"` block-isolate scan as if it were a real
attribute. Fixed at the root rather than by rewording the comment: a `'`/`"` now only
starts a real string if its matching quote appears before the next newline (every real
string/attribute value in this codebase is single-line); otherwise it is passed through
as ordinary text and scanning resumes normally right after it. Backtick template
literals keep their original unbounded, multi-line scan. This makes EVERY check in this
file more trustworthy, not just the new ones — the exact failure mode the file's own
`stripComments` docstring already warned about ("worst, `enclosingTag` walking backward
out of the comment and mis-attributing an unrelated tag") was silently possible for any
file containing a stray apostrophe in plain prose, this codebase's Setar/Tar seed data
included.

**AN INSTRUMENT NAME IS THE OWNER'S OWN EDITABLE TEXT, NEVER GENERATED COPY — GETTING
THIS BACKWARDS IS A CLASSIFICATION MISTAKE, NOT A MISSED LOCATION.** A sealed review
found four sites (`ItemCard.tsx`, `ItemDetail.tsx`, `PathwayDetail.tsx`,
`Repertoire.tsx`) pinning an item's or work's instrument name under `dir="ltr"` right
alongside genuinely generated metadata like `ITEM_TYPE_LABELS` — Settings lets an
instrument be renamed, Farsi included, so forcing a renamed instrument to LTR gives it
the wrong bidi base, the exact defect every other isolate in this file exists to
prevent. Auditing every remaining `LTR_ISOLATE_SITES` entry against its real source
(not just the four named) found a fifth of the identical shape — `Today.tsx`'s "routine
running" row bundled the instrument name and the fixed English suffix into ONE
`dir="ltr"` span — and two more with no direction treatment AT ALL, invisible to that
same audit because it can only see spans that already carry a `dir`: the Plan doorway's
mismatched-instrument row (the exact twin of the routine row, same bundling, just
missing the isolate rather than misusing it) and the weekly Balance row's instrument
name, sitting bare inside a `.truncate` title span. All seven now isolate the
instrument name on its own `dir="auto"` — nested one level in for the Balance row
rather than on `.balance-row` itself, because that row is a CSS GRID and giving IT a
resolved RTL direction would reverse its three columns for a Farsi instrument, flipping
the bar and percentage to the other side. The fix generalises past these seven
locations: `direction.test.ts` now also fails if any `dir="ltr"`/`"rtl"` isolate's body
references `instrumentName` — a call, a bare identifier, or a property access like
`b.instrumentName` all match, not only the call form (the widened check was itself the
product of a caught regression: an earlier `\binstrumentName\(` version missed the
Balance row's own property-access form) — or ItemCard's own `inst` alias for it, so a
future regression anywhere in the file is caught by the SHAPE, not by whichever site a reviewer
happened to name.

**A FIFTH REJECTION FOUND THE SHAPE-BAN STILL WASN'T ENOUGH, BECAUSE IT WAS ONLY EVER A
NEGATIVE CHECK.** Banning `dir="ltr"`/`"rtl"` around an instrument name catches nothing
about a name rendered with NO direction treatment at all, an alias beyond the two literal
anchors the check happened to know (`instrumentName`, `{inst}`), or a name fused into a
template string (`` `${instrumentName(db, x)} plan` ``) before anything could render it —
three shapes a fourth sealed review found live in the app (Repertoire's `PathwayCard`,
Session Plan's two page titles, wide Lessons' sidebar heading and its detail-pane header,
Today's cross-instrument "in progress"/"plan"/"routine" rows, Today's `EmptyState` title
and "Before your … class" heading, and ActiveBlock's/CloseBlock's own eyebrow — the last
two mis-classifying the instrument's own name as "the English eyebrow" in their own
comments). `direction.test.ts` now asserts the invariant itself rather than banning one
way of getting it wrong: `instrumentNameOccurrences` DISCOVERS every current renderer
mechanically — the `instrumentName(db, id)` call, a bare `.instrumentName` property read,
a LOCAL ALIAS of either (a destructured, renamed prop; a `const X = instrumentName(...)`
binding; a `const X = …instruments….find(...)?.name` binding, generalised past the literal
spelling "instrumentName" so a differently-named local is still caught), and a per-item
`.name` read inside an `instruments.map`/`.filter().map` callback or an inline
`instruments.find(...)?.name` — rather than requiring each to be re-listed by hand.
`resolvesOwnDirection` then asserts the POSITIVE invariant: the name's nearest ancestor
`dir` must be `"auto"`, AND nothing else may render before it within that SAME ancestor's
body — a `dir="auto"` ancestor resolves from whichever strong character comes FIRST in
its subtree, so an item's own title (or anything else) preceding the name inside the same
auto group claims that resolution for itself, exactly the classification mistake this
whole family exists to catch. `isFusedIntoTemplate` separately catches the template-fusion
shape. A declaration/binding site (the alias's own introduction) and a value forwarded as
a JSX ATTRIBUTE (`instrumentName={x}`, prop-drilling rather than a DOM text render — the
receiving component is checked wherever IT renders the value; `ClassQuestions` never does)
are both excluded, visibly, in the check's own comments rather than by a silent gap.

Two real sites deliberately stay BARE and must keep passing exactly as they are:
Insights.tsx's `<th dir="auto">{r.instrumentName}</th>` and Today.tsx's cross-instrument
`<div className="grow" dir="auto">…<div>{inst.name}</div>…` row. Both already resolve
correctly because the name is genuinely the FIRST strong content of their own dir="auto"
ancestor; wrapping either in a nested isolate would BREAK, not fix, them — `dir="auto"`
skips a descendant that already carries its own `dir` when hunting for a first strong
character, so the ancestor would lose its only resolution source and silently fall back to
LTR for a Farsi instrument, the same reasoning this file already used once to revert
isolating `stage.title`. The completion gate for this check was empirical, not assumed:
each discovery shape above was mutated back to its broken form in turn and confirmed to
fail the test before being reverted, and the check itself asserts it discovers a non-zero
set of sites overall, so a regression that makes every pattern silently stop matching
cannot masquerade as "nothing to report."

Two gaps are named here because this lane cannot close them, not because they were missed.
`src/components/QuickAdd.tsx`'s instrument-picker button renders `{i.name}` with no
direction treatment at all — a real instance of this same defect — but `QuickAdd.tsx`,
`ItemForm.tsx` and `RoutineEdit.tsx` are this lane's own contract's declared non-goal
("their dir=\"auto\" usage is already correct and must not be touched"), so
`direction.test.ts`'s instrument-name check explicitly excludes all three rather than
either silently passing over a real bug or failing a check this lane cannot act on.
Separately, `src/domain/insights.ts` (a forbidden path here) bakes
`${r.instrumentName} ${r.percent}%` for every instrument into one generated sentence
before Today or Insights ever renders it — the identical "fused into a string" defect,
sitting one layer below where a presentation-only lane can reach it. Today.tsx's own
render of that sentence (`insight.body`) was still tightened to match Insights.tsx's
existing inline `<span dir="ltr">` isolate (it was previously a bare, undirected block),
but the embedded instrument name inside that generated sentence stays open pending a
domain-layer fix and its own lane.

**A RESOLVED DIRECTION THAT NEVER REACHES THE ALIGNMENT IS NOT A FIX, AND NEITHER IS ONE
WITH NOTHING TO RESOLVE FROM.** A tenth sealed finding named two counterexamples, both in
this same family, and both invisible to the guard as it stood.

Repertoire's `PathwayCard` rendered a user-authored `pathway.name` inside
`<button style={{ textAlign: 'left' }}>` with NO direction-resolving group between them. A
Farsi pathway name shaped correctly — the browser's bidi algorithm needs no help for that —
and then sat pinned to the English edge, split from its own instrument/stage caption
underneath. The inline `<span dir="auto">` already on that caption could never have fixed
it: `text-align` is a BLOCK concept, which is exactly why this file's own "an isolate must
be INLINE" rule exists. The fix is ONE group carrying `dir="auto"` AND re-declaring
`textAlign: 'start'`, sitting INSIDE the button (the Balance-row precedent — the chevron row
and the progress bar are layout, not text). Either half alone leaves the name where it was:
a group with no `start` resolves a direction the alignment never hears about, and a `start`
with no group has no direction to resolve. The same shape, audited across the app, was live
in two more places and fixed with it — Insights' `<th style={CELL} dir="auto">` (CELL pinned
`textAlign: 'left'` over an instrument name the owner can rename to Farsi; it is `'start'`
now) and RoutineRunner's "Recorded" rows under a card pinning `'left'`. `center` is
deliberately NOT a forcing value: centred text points at no edge, so it cannot misalign an
RTL run, and excluding it is also what keeps this rule from demanding an unrequested layout
change on the deliberately centred practice screens.

**EVERY LINE OF A MULTI-LINE FREE-TEXT FIELD RESOLVES ITS OWN DIRECTION — EXCEPT THE ONE
THAT ANCHORS THE GROUP.** `ClassQuestions`' bulleted renderer for the question text and for the item's most
recent block observation (one `<textarea>` each, so several
distinct questions live as several lines of one string; `splitLines` in `format.ts`, tested)
first shipped with every bullet bare, on the argument that lines typed into one box in one
sitting share one direction. They do not — a Farsi question and an English one go into the
same field — and bare lines all inherit the FIRST line's direction, dragging an English line
RTL with its bullet on the wrong side, or the reverse. But the catch that argument was right
about is real, and is why this is not simply "isolate every line": `dir="auto"` skips any
descendant carrying its own `dir`, and the enclosing `<li dir="auto">` (and the dated
last-observation value wrapper) has nothing else left to hunt once the title is isolated —
isolating every line would leave the item with no resolution source and a silent LTR
fallback, which is the ninth finding all over again. Both hold ONE way only: the FIRST line
is the ANCHOR and stays BARE — it still follows its own language, because the direction it
inherits is the direction it produced — and every line AFTER it carries its own `dir="auto"`
on the row, so that line's text and its bullet follow it alone. The two branches are written
out LITERALLY (never `dir={i === 0 ? undefined : 'auto'}`): `direction.test.ts` is a source
scanner, and a computed attribute is invisible to every guard in it.

`direction.test.ts` holds both closed with checks that assert the invariants rather than the
presence of a group somewhere in a file — which is what the finding correctly said ac-5's
own check could never fail on. The first discovers every element carrying a title class
whose body renders an opaque data expression, and, when anything above it forces
`textAlign: 'left'`/`'right'` — inline OR through a module-level style constant it names,
the shape the Insights counterexample was actually written in — requires a `dir="auto"`
group below that forcing element which re-declares `textAlign: 'start'`; it also fails any
`dir="auto"` group that pins a physical alignment on ITSELF. The second asserts the anchor
shape directly: exactly one bare branch, exactly one `dir="auto"` branch, and the isolate on
the branch chosen for lines AFTER the first. Seven mutations were confirmed to fail before
either was committed. Verification used DELIBERATELY MISMATCHED languages in both directions
against the real running pages — the lesson this file keeps relearning, applied before the
fact this time rather than after.

**`text-align: start` IS NOT PORTABLE ACROSS ENGINES, AND CHROMIUM CANNOT SHOW YOU THAT.**
Every finding above was checked in Chromium. An eleventh, checked in BOTH engines, found
the owner's long-reported Safari-only question-alignment symptom and it was none of the
causes previously guessed at: `ClassQuestions`' `<li dir="auto">` inherits `text-align`
from an LTR ancestor, and WebKit inherits the RESOLVED PHYSICAL value (`left`) where
Chromium inherits the LOGICAL keyword (`start`) and re-resolves it against the `<li>`'s own
direction. So a Farsi question rendered hard against the ENGLISH edge while its ordinal —
a direction-aware flex child, correct on its own terms — sat on the right. Identical DOM,
identical CSS, two different pictures, and the Chromium-only checks that had passed nine
times could never have seen it. The fix is one declaration: a block whose own direction is
resolved by its content must RE-DECLARE `textAlign: 'start'` on itself, exactly as the
tenth finding's rule already requires under an ancestor that pins a physical alignment —
an inherited `start` is not the same thing as an own `start`.

The general rule: **a direction fix verified in one engine is verified in one engine.**
`tests/practice-information-layout.browser.test.ts` drives the changed surfaces in Chromium
AND WebKit at 390×844 and desktop and asserts measured bounding positions, so this class of
divergence fails a check rather than waiting for the next screenshot. A missing WebKit
binary FAILS with `npx playwright install webkit`; it never skips. Two WebKit-only
environment facts that are NOT app bugs: it cannot store a `Blob` in IndexedDB under the
automation driver (so that journey seeds state-only), and it reports
`"Importing a module script failed"` for a `React.lazy` chunk whose navigation was aborted.

A THIRD, of the same kind: a request the browser CANCELS because the test navigated away
while it was in flight is reported by WebKit as
`"Fetch API cannot load … due to access control checks"` — which reads exactly like a CORS
problem and is not one. Instrumented, the only difference between a passing and a failing run
of the same journey was one `requestfailed` with `errorText: 'cancelled'` for a request
fulfilled with the right CORS headers every other time. A real person navigating mid-sync
cancels the same request, so `openPracticeApp` (`tests/practiceBrowser.ts`) does not count it
as a page error.

**AND THAT EXCUSE IS BOUNDED, OR THE HARNESS HIDES THE FAILURE THE JOURNEY EXISTS TO CATCH.**
It first shipped as a PERMANENT set of cancelled URLs, with every later page error whose
message merely CONTAINED that pathname discarded — so a genuine failure at the same path,
later in the same journey, was swallowed and `pageErrors` said nothing. `excusedCancellation`
(`tests/practiceBrowser.ts`, tested) is the whole rule and it is CONSUMING: one cancellation
excuses exactly one error, and only when the message is the DIAGNOSED wording (a render crash
naming the same URL is never excused).

**A WINDOW CAN NEVER TELL A CANCELLATION FROM A REAL FAILURE, BECAUSE THEY READ IDENTICALLY —
ONLY ORDER CAN.** Made consuming and bounded by a generous ceiling, the excuse still matched by
host+path ALONE: a cancellation that produced no page error of its own stayed a live,
unconsumed credit for the whole ceiling, spendable by ANY later error to that URL — including
a genuine one with nothing to do with it. A sealed review reproduced exactly that. Shrinking
the window cannot fix this; it only trades an over-broad filter for a flakier one, since a
cancellation's spurious error and a real access-control failure are worded the same on
purpose. `excusedCancellation` now tracks EVERY `requestfailed`, not only cancelled ones
(`TrackedRequestFailure.cancelled`), and excuses a page error only when the temporally NEAREST
tracked request to the exact host+path it names is ITSELF a cancellation. A genuine failure to
that URL always fires its own `requestfailed` before its own page error, so the instant one
happens it becomes the nearer candidate and a stale, error-less cancellation is never reached
by anything but the specific error it was actually waiting for — which is what makes leaving
it unconsumed safe rather than a standing credit. `CANCELLED_EXCUSE_MS` (2s, down from 30s) is
now purely DEFENSIVE headroom against delivery lag under the contention five concurrent dev
servers create, never the correlation itself.

A second, independent hole lived in the same function: `message.includes(url.host)` and
`message.includes(url.pathname)` are substring tests, so a host that merely CONTAINS the real
one (`evil-api.github.com`, `api.github.com.evil.test`) or a path that does
(`state.json.bak`) passed them. The message is parsed into a real `URL` (stripping the space
WebKit inserts after the scheme) and compared by `host`/`pathname` EQUALITY instead — removing
the ambiguity structurally rather than adding more boundary characters to a string test.

**WHAT `ClassQuestions` RENDERS NOW.** The narratives above are the history of one row, and
the row changed: there is no `Problem:` line any more (`currentProblem` is retired — see the
canonical-homes section at the top of this file). Each `<li dir="auto">` is the ordinal, the
title in its OWN `dir="auto"` isolate, the question left BARE so it anchors the `<li>`, and
— when the item has one — the most recent block observation under a stacked, isolated
`<span dir="ltr">Last observed YYYY-MM-DD</span>` caption. Read the seventh and tenth
findings for why the caption stacks above the value instead of sitting inline with it; read
the ninth for why the question, not the title, is what the `<li>` resolves from.

**SEARCH GOES THROUGH THE FARSI-AWARE MATCHER AT EVERY SURFACE.** The data is
authored in Farsi, so `title.toLowerCase().includes(query)` is not a search — it is
a filter that can never match what the owner's keyboard emits: an iOS Arabic keyboard
produces the ARABIC kaf (U+0643) and the seeded titles hold the PERSIAN kaf (U+06A9),
and no amount of case folding bridges those. Both search boxes — Repertoire's practice
list and Start's item picker — filter through `itemMatchesSearch` (`selectors.ts`,
tested), the one wrapper over the existing `persianSearchMatch`. It is a WRAPPER, not
a second matcher: `farsi.ts` keeps its behaviour exactly, and the wrapper exists so
the WIRING is reachable from a Node test in a repo whose vitest environment is
`'node'` and can therefore never render a screen. A new search surface calls it too.

## Everything the app already knows reaches you where you are

Which instrument you are practising, which piece you mean when you type it in Farsi,
and which class files are already linked to a piece — none of that may sit one screen
away from where you need it, and NONE of it is new stored data.

**A BROWSE SCREEN OPENS ON THE INSTRUMENT YOU ARE PRACTISING, AND STILL WIDENS.**
Repertoire (all three views — Pathways, My repertoire, Practice list) and Lessons seed
their instrument filter from the SAME persisted `sessionInstrumentId` Today, Start, Quick
Add, New Item and the Session Plan already read, via `defaultInstrumentFilter`
(`selectors.ts`, tested): a resolvable session instrument seeds the filter, the `'all'`
sentinel seeds the every-instrument view, and a session instrument that no longer
resolves IN THE LIST THAT SCREEN'S OWN DROPDOWN RENDERS falls back to every-instrument
rather than seeding a value with no matching option and showing an empty screen. These
screens SEED from that value and never WRITE it: browsing another instrument's
repertoire must not change what Today recommends. The cross-instrument view is never
removed — only stopped from being the default you undo on every visit.

**A NARROWED PATHWAYS VIEW HIDES GENERAL PATHWAYS TOO, NOT JUST OTHER INSTRUMENTS'
OWN.** A `Pathway` with no `instrumentId` is General — cross-instrument by design — and
can hold items from ANY instrument, so showing it while narrowed to Setar can still
surface a Tar item's progress with no way to know it slipped through. `pathwaysForInstrumentFilter`
(`selectors.ts`, tested) is the one place this is decided: a real filter keeps only
pathways scoped to that exact instrument, and only the explicit `''` ("all") filter
widens back to see General pathways too — the same opt-in-widen shape as everything else
in this section, not a second rule.

**AN ITEM'S MATERIAL IS COMPOSED, NEVER STORED.** `itemFiles(db, itemId)`
(`src/domain/itemFiles.ts`, pure and tested) lists the NAS references of every lesson
the item is LINKED to (`lesson.itemIds` → `lesson.recordings`), deduplicated BY PATH so
a file referenced from two of those lessons appears once, followed by the item's own
attachments — lessons newest first, kind order within a lesson, attachments oldest
first. Nothing is persisted to make this view work and no new field exists; these links
were always in the data and were simply never composed. An attachment's `ownerId` is not
an item id on its own — a lesson's attachments share the same id space, so a lesson and an
item can collide on id — so ownership is decided by `ownerType` AND `ownerId` TOGETHER, via
one shared `attachmentsOwnedBy(attachments, ownerType, ownerId)` predicate (`itemFiles.ts`,
exported and tested), with `itemOwnedAttachments` as its item-scoped wrapper. EVERY surface
that lists, counts or removes attachments reuses it rather than re-deriving the check:
Material's composition here, ItemDetail's Files CRUD list below, the shared `Attachments`
component (a lesson's own file list, `ownerType="lesson"`), `ItemCard`'s file-count badge, and
`deleteItem`/`deleteLesson` (`useStore.ts`) choosing which attachment metadata AND blobs to
destroy — so no read, count or delete can cross-contaminate the other owner type on a
colliding id. An item with no lesson link and no attachments yields an EMPTY LIST, and the
surfaces render nothing rather than an
empty frame. An item with no lesson link cannot reference NAS material at all — that is
the honest gap, and closing it needs a persisted item-level reference, therefore a
schema change and its own lane. Both the PRACTICE screen and ItemDetail render the WHOLE
composition — a reference and an attachment for the same piece are never split across two
sections of the screen. ItemDetail's existing Files section stays below it, but only for
add/remove: that is a CRUD concern, never a second, partial presentation of what
`itemFiles` already composed. It selects its list via the SAME `itemOwnedAttachments`
predicate rather than filtering `ownerId` alone, so it can never present or remove a
lesson's attachment that happens to share the item's id. It is therefore its own small
list local to `ItemDetail.tsx`
(name, size, Remove — no thumbnail, no Open), not the shared `Attachments` component used
for a lesson's own attachments: that component's preview and Open are exactly the
presentation Material already gives an item's files, and reusing it here would put the
same file on screen twice.

**THE TWO KINDS OPEN BY DIFFERENT MECHANISMS, SO EVERY ENTRY CARRIES WHICH IT IS.** A
reference resolves through the configured NAS base URL; an attachment resolves to a
blob on this device. `ItemFile` is a discriminated union on `source`
(`'reference' | 'attachment'`) so the compiler — not a component's care — is what stops
a reference being opened as a blob or an attachment being pushed through the base URL
and 404ing. They share no identity field (a reference has a `path`, an attachment a
`name`), so they are never merged and deduplication is WITHIN a kind, never across.

**WHAT MAY RENDER INLINE IS A PURE PROPERTY OF THE ENTRY, decided in `itemFiles.ts`.**
`inline` is true only for a LOCAL IMAGE attachment; every PDF, audio file and every NAS
reference is open-only. Written inline in a component that rule would be unreachable
from a Node test, and it is exactly the rule that keeps the practice screen a practice
screen and the whole feature inside the existing production CSP: `blob:` images are
already permitted, while a NAS origin is not knowable at build time and so could never
render under a static policy in any case. Large media stays on the NAS — files are
OPENED, never fetched into attachments, IndexedDB, sync or a backup.

**MATERIAL DURING PRACTICE IS ONE CLOSED DISCLOSURE, BELOW THE TIMER.** `ActiveBlock`
offers it only when `itemFiles` is non-empty, renders nothing until it is opened (a
closed disclosure does zero async work), and sits in the same shape as "About this
piece" — not a panel, not a viewer, not a dashboard. No material or viewer concern may
influence a recorded minute, the wake lock, or a boundary announcement: the
elapsed-time family, `shouldKeepAwake` and `nextSignal` are untouched by any of this.

**A NAS REFERENCE IS STORED RELATIVE TO THE CONFIGURED BASE, so it stays portable.**
An absolute URL saved verbatim is PINNED TO ONE ROUTE to the NAS: it dies on a phone
away from home, and everywhere at once if the base URL ever changes.
`relativizeReference(base, pasted)` (`recordings.ts`, tested) rewrites a pasted URL that
sits UNDER the configured base into the path beneath it — requiring the path BOUNDARY
(`base + '/'`, so `…/media` never swallows `…/mediaXYZ/`) and comparing normalised URLs,
not raw strings. It DECODES per segment because `resolveRecording` re-encodes on the way
out; a Farsi filename copied percent-encoded from a directory listing would otherwise be
double-escaped into a dead link. Everything else is stored EXACTLY as given, because
guessing is worse than mangling nothing: a different origin is a deliberate external
link, a URL carrying a query or fragment is not a plain file path, and a blank or
unparseable base is not something to reason from. This is what makes the transport
(LAN address today, something else later) a decision that can be CHANGED WITHOUT
REWRITING A SINGLE STORED REFERENCE — and it is the only thing this lane writes
differently: the TEXT of an existing `LessonRecording.path`, its type and meaning
unchanged.

**BROWSE IS OFFERED ONLY WHERE IT CAN WORK.** Settings and the lesson add-reference form
open the NAS listing at `normalizeBaseUrl(base)`; a blank or unparseable base yields no
target and the action is disabled with a plain explanation, never a dead link or a
same-origin request. A missing or unreachable NAS degrades to a disabled or absent
action — never an error state, and never anything that blocks practising. Everything
still works fully offline; the base URL stays per-device in localStorage, out of
exports, backups and synced data.

## The Setar archive is a SOURCE: it describes, it never testifies

A read-only Node scanner on the NAS (`scripts/scan-setar-classes.mjs`, stdlib only) turns
the normalised Setar class archive into a deterministic, CLOCK-FREE JSON index;
`scripts/publish-setar-index.mjs` commits it to ONE file on ONE branch of the existing
private data repo (`source-index` / `setar/index.json`); the app GETs it with the GitHub
connection it already has and reconciles it purely. `docs/setar-archive.md` is the operator
runbook, the corpus baseline and the recorded source hashes.

**AND ONE SCAN IS ONE CONSISTENT VIEW OF EVERY INPUT, OR NONE.** The registry was the only
input re-read after the walk, which made the guarantee exactly as narrow as the file it
named — and the MEDIA is what a non-atomic NAS copy actually perturbs. Move a resource out
before its folder is enumerated and put it back while later folders are walked: PIECES.csv
never changes, the scan publishes an index that omits the file, and the next Refresh marks
still-present material `unavailable`. The rename log had the identical exposure, read once
and compared against nothing. `readSource` is now every input in ONE place, the whole of it
is read TWICE and the two readings compared (sizes included, so a file still being copied is
caught too), and any difference refuses before anything is written. It is a CONSISTENCY
check, not atomicity: a perturbation stable across both readings agrees with itself and is
indistinguishable from the archive genuinely being in that state. What it removes is the
transient, which is what a copy in flight looks like.

**AND A READ FAILURE IS NEVER VALID EMPTY SOURCE DATA — WHICH IS WHAT MADE THE TWO-READ
CHECK LOOK CLEAN OVER A FALSE VIEW.** `catch { renameLogText = '' }` turned every failure to
read RENAME-LOG.csv — a permission change, an I/O error, a mount that went away mid-copy —
into an archive that has no rename log. Both readings then AGREED, the consistency check
passed, and the scan published an index with no renames at all: a file that moved during
that window is flagged `unavailable` and its saved references can never be repaired. Absence
is an OBSERVATION (`{present:false}`, ENOENT only) and travels in the compared reading as
one; anything else fails the scan. A required input is required outright, so a missing or
unreadable PIECES.csv refuses rather than yielding an empty registry, and a present-but-EMPTY
log — what a zero-byte copy in flight looks like — is refused by `readTable` exactly as the
registry would be.

**AND THE WALK SAYS WHAT IT COULD NOT TAKE IN.** Two readings agree about a file neither of
them looked at, so the consistency check is blind by construction to anything the walk drops
in silence. A symbolic link is still never FOLLOWED — a link out of the archive is a path
this scanner has no authority over — and a session-named entry that is not a directory is
still never opened; both are now `diagnostics` rows in the published index instead of
vanishing, because an index quietly narrower than the archive is the same "partial view sold
as complete" this whole section exists to refuse. Dotfiles, `@eaDir` and out-of-scope root
folders stay silent: they are not archive content, and saying so 258 times is noise. It is a
DIAGNOSTIC and not a refusal for the same reason a rename cycle is: a symlink is a stable
property of the archive, not a transient, so refusing would leave the archive permanently
unindexable until the owner went and deleted it — where the two-read check refuses only what
disagrees with itself between two readings a moment apart.
Finally, the compared reading carries each file's `mtimeMs`, which `buildIndex` never reads —
a file edited IN PLACE at the same byte length changes no size and no CSV, and would
otherwise be invisible to a check whose whole job is catching a mutation mid-scan. The
determinism rule is untouched: altered mtimes still produce a byte-identical index.

**THE APP NEVER PARSES A FILENAME.** The grammar — longest role prefix at a hyphen boundary,
trailing digits as a part number, embedded digits and `-و-` as piece identity, never a
token-0 split, never a largest-file heuristic — lives ONCE, in the scanner, because the app
consumes an index rather than a directory. `src/domain/sourceArchive.ts` decodes and
validates that index; a version newer than this build understands is REFUSED rather than
read leniently.

**AND THE DECLARED DIGEST IS RECOMPUTED, NEVER TAKEN ON FAITH.** `contentHash` is not a
checksum the app may skip past: it is the REFRESH IDENTITY. `planArchiveImport` compares it
with the hash already accepted to conclude nothing has changed, so content altered under a
RETAINED old hash was reported "Already current" and its changed facts silently ignored —
a sealed review reproduced it by editing one composer. `parseSourceIndex` (now async)
recomputes the SCANNER's own digest — SHA-256 over `canonicalStringify` of the body minus
`contentHash` and `generatedAt`, byte-for-byte `scan-setar-classes.mjs`'s `contentHash` /
`canonicalJson` — and refuses a mismatch. It is the ONE boundary the GitHub fetch and the
file fallback both pass through, so neither door can be given the check separately and miss
it. `decodeSourceIndex` stays synchronous and digest-free on purpose: it is the STRUCTURAL
decoder, and order inside `parseSourceIndex` is size → parse → structure → digest, so a
broken file reports the error the owner can act on rather than a hash mismatch.

**AND A VALID DIGEST SAYS THE FILE IS THE ONE THE SCANNER WROTE — NEVER THAT IT IS WELL
FORMED.** The decoder NORMALISES before the graph's grammar runs, so the grammar only ever
sees the decoder's own output: `resources: null` decoded to a session with no resources —
a perfectly valid EMPTY LIST by the time the grammar saw it — and six files became zero
behind a correct hash. Every absent-tolerant read had that shape, the scalars included
(`part: "3"` became `null`, a wrong-typed `size` vanished, `rosterTrusted: 'yes'` became a
boolean the grammar was happy with). `list` / `num` / `bool` (`sourceArchive.ts`) are the
one rule instead: ABSENT is a default, PRESENT-AND-WRONG is a refusal naming the record —
the same treatment `validatePracticeText` gives the owner's own words, and never a
coercion.

**AND THAT RULE HAD TO REACH THE STRINGS TOO.** It closed the lists and the scalars and left
every string field with a default exactly as it was: `str(raw.form ?? '')` still read ABSENT
and PRESENT-AND-NULL as the same thing, so a resource `title: null`, a piece's `form`,
`composer` or `notes`, and a diagnostic's own `path` all decoded to `''` — an untitled row
the grammar was perfectly happy with. `text()` is that one rule for strings: `undefined` is
a default, anything else that is not text is refused naming the record. `part` and `group`
stay genuinely nullable, because the scanner emits `null` for both; `size` does not, and a
present null is refused BY THE DECODER rather than spread into its own output as a value the
declared type does not admit and left for the grammar to catch downstream.

**ARCHIVE EVIDENCE MAY ESTABLISH REPERTOIRE MEMBERSHIP, HISTORICAL LESSON PROVENANCE AND
SOURCE MATERIAL. IT MAY NEVER ESTABLISH RECORDED PRACTICE, A RESULT, EXPOSURE, REVIEW
COMPLETION OR SCHEDULING PROGRESS.** An imported item carries zero minutes, no
`lastPractisedAt`, no result, no review row, no SM-2 state, no pathway placement and no
catalogue identity. The owner's own `تمرین-من` recordings are the sharpest case: their
membership and role survive in the graph as provenance (the six-session
`پیش-درامد-سه-گاه-فروتن` chain is six CLASSES, never six weeks and never practice), and the
files themselves are never a resource anywhere.

**A CLASS RECORDING BELONGS TO ITS LESSON; A NAMED SCORE BELONGS TO ITS PIECE; AN UNNAMED
DEMONSTRATION BELONGS TO EVERY CANONICAL MEMBER OF ITS SESSION.** That last one is the
archive's own rule (`CRAWLER-BRIEF.md` §4): the teacher records the week's pieces in one
take, so there is no single piece to attribute it to and the information simply does not
exist in the filename. The ROSTER is the registry's answer to "what was assigned at class
N", never a set inferred from the files present — and when the two disagree, the unnamed
demo is NOT expanded across a guessed set; the disagreement is reported instead.

**IDENTITY IS BYTE-EXACT AND TRANSPORT-INDEPENDENT.** `canonical_fa` is the join key,
unfolded and untransliterated; `aliases_seen` is literal SEARCH data (`itemMatchesSearch`
takes them, `persianSearchMatch` unchanged) and is NEVER consulted to decide which piece a
record is. App ids are deterministic hashes of the source identity (`sourceItemId`,
`sourceLessonId`), so two devices importing the same index separately agree on which record
is which. Asset paths are stored RELATIVE TO THE ARCHIVE ROOT, so changing the transport
rewrites no stored record; each device configures its own base once.

**EXACT BINDINGS WIN; WEAK EQUIVALENCES ASK.** A record already bound to a source identity
IS that entity, whatever its title or date has since been edited to. A legacy class is
auto-adopted only on instrument + date + number + EXACT source-path evidence — the owner's
real upcoming class 38 (2026‑09‑27) and archive session 38 (2026‑08‑04) are the live
counterexample to merging on a number. An exact title or literal-alias match produces
Link / Create separately / Skip, never an automatic merge and never "pick the first
candidate"; a built-in `catalogKey` (`iraq`) is never equated with a canonical key (عراق).

**NEW IMPORTED PIECES ARRIVE RESTING** (`status: 'dormant'`), as an administrative import
policy stated BEFORE the import: ninety-four live candidates would flood Today and every
session plan. They stay searchable, stay in My repertoire and start directly.

**AN IMPORTED CLASS IS HISTORY EVEN WHEN ITS DATE IS IN THE FUTURE.** The archive runs to
September 2026, so a device whose clock is behind it holds future-dated records of classes
that already happened. `isUpcomingLesson` (`sourceArchive.ts`) checks `origin === 'archive'`
BEFORE the date, and it is the ONE predicate `nextLessonFor`, `nextLessonDates`,
`defaultTargetLesson`, `preparationDatesByItem` and every Lessons badge / default selection /
question sheet go through. A plain `date >= today` anywhere here turns thirty-nine pieces of
history into thirty-nine deadlines.

**THE COMMIT IS ONE MUTATION, REBASED, VALIDATED AND ACKNOWLEDGED.**
`commitArchiveImport` (`useStore.ts`) re-plans against the database as it is NOW — a note
saved or a block finished while the index was being fetched is never lost — refuses with
`stale` when the rebase raises a NEW question OR when a DECISION'S OWN PREMISE HAS MOVED,
runs the whole proposed database through
`validateDB` before installing any of it, and waits for IndexedDB to acknowledge. A FAILED
write reports `unsaved` and the retry WRITES AGAIN even though the in-memory graph already
matches, because "Already current" over data that was never saved is the lie this guards.
It never calls `importDB`/`installDatabase`/`resetDemo`/`clearAll` and never touches a blob:
a refresh ADDS to the database, it does not replace it, so the running clock, the routine,
the plan, `notNow` and `sessionInstrumentId` are all untouched. An unchanged refresh returns
the SAME database object, so it cannot bump the revision or churn a timestamp.

**AN OWNER'S RECONCILIATION ANSWER IS A DECISION TOO, AND A SKIP IS PERSISTED.** A sealed
review found three halves of this missing. SKIP lived only in the preview's own `decisions`
argument, so "no, not this one" survived exactly as long as the screen did — a reload, or
the next refresh, asked the identical question again with nothing in the database to show it
had ever been answered; `planArchiveImport` writes a `piece`/`session` suppression for it
now, the same record every other deliberate removal writes, which a refresh, a reload and a
sync all already respect (idempotent, so answering twice does not grow the list). CREATE
SEPARATELY was honoured for an item and silently dropped for a LESSON, so two
indistinguishable legacy classes re-asked for ever. And a decision taken against an
ALREADY-CURRENT index — a skip, or one registry field applied — was reported "Already
current" and thrown away unwritten, because `commitArchiveImport` judged it by
`summary.unchanged`, which answers about the INDEX alone. The store asks
`applyArchiveImport` itself now (it returns the SAME OBJECT when a plan changes nothing),
so there is one source of truth for that question and it is the function that does the
writing. `applyArchiveImport` counts a field decision only when the plan actually OFFERS
that field, so both sides of the preview/commit boundary mean the same thing by "nothing to
do". An OFFER is not a change: an unanswered suggestion writes nothing and says so.
Suggestions are RENDERED in `ArchiveRefresh.tsx` — one control per field, the owner's
current value and the archive's proposal each resolving their own direction — and a decision
is keyed by `piece:field`, because keying by piece alone made choosing a composer evict the
dastgāh choice made a moment earlier. What is DURABLE here is the suppression a skip writes
and the value an applied field writes — never the in-flight selection itself: an unpressed
suggestion is component state, and it is re-derived from the graph on the next refresh
precisely because nothing about it was stored.

**AND A DECISION IS ABOUT THE STATE THE OWNER SAW, NOT MERELY ABOUT ITS TARGET.** A new
QUESTION is not the only way a rebase invalidates an answer, and refusing only on that let
the opposite case through silently: choose the archive's composer over an EMPTY field, then
type one of your own before pressing Apply, and the rebase found nothing to ask about and
wrote the registry value over the words just written. An `apply-field` decision therefore
carries `from` — the value of the owner's it was chosen against — and
`decisionMatchesSuggestion` is the ONE test both the plan's summary and
`applyArchiveImport`'s write use, so a preview and a commit cannot mean different things by
"this still applies". A LINK decision has a premise too: `link-item`/`link-lesson` may only
adopt a record that is still UNBOUND and still this instrument's — the same conditions the
candidate list was built from — because a target bound elsewhere, moved or deleted since
would otherwise be silently rebound, or fall through and CREATE a record instead of linking
one, which is not the action the owner chose. Both kinds land in `plan.staleDecisions`, one
channel rather than two, and the commit refuses on either whether or not `rev` moved. The
screen DROPS a stale decision rather than re-submitting it for ever, and re-previews: the
question, or the suggestion's real current value, is shown as it is now.

**AND A DECISION NAMES ITS RECORD, NOT ONLY ITS PIECE — AND EVERY DECISION IS ACCOUNTED
FOR.** The premise rule above closed the case where the owner's VALUE moved and left the two
cases where the RECORD did. Both loops open with "already bound? nothing to decide" /
"already suppressed? nothing to decide", so a decision about a record that became bound
between the preview and the commit was never looked at at all: no adoption, no question, and
an EMPTY `staleDecisions`, so the commit reported success for an action it had not performed.
An `apply-field` decision was worse than ignored — keyed by piece and value alone, it was
REDIRECTED onto whichever record held that piece by commit time, and a sync installing a
database where the same piece is bound to item B, also with an empty composer, took a choice
made about A.

So `apply-field` carries `itemId` (identity) as well as `from` (premise), and
`decisionMatchesSuggestion` compares all four; and `planArchiveImport` marks every decision
it ACTS on and sweeps the rest. An unmarked decision is either an action that has ALREADY
HAPPENED — the same answer still in hand on the next preview — or an answer to a question
that no longer stands, which is stale. That already-done branch is LOOP PREVENTION rather
than politeness: `ArchiveRefresh` drops a stale decision and re-previews, and a realised
action can never be consumed by a loop that skips its own record, so without it the same
decision would go stale for ever. The sweep is why this holds for Link, Create, Skip and
apply-field together instead of a stale check bolted inside each early return, and the
premise rule above is now one of its outcomes rather than a second mechanism beside it.

**AND A STORED PATH HAS ONE READING.** Adoption evidence and path repair both have to
decide what file a stored reference names, and they used to decide it differently:
`hasSourcePathEvidence` stripped the legacy prefix and followed the rename log, while
`repairReferencePath` also understood a full URL under this device's verified base. So a
class whose references were saved as full links carried perfectly good evidence that
nothing recognised — adoptable by one rule and unfixable by the other. `readArchiveRelative`
is that one reading, and both go through it.

**AND THAT WAS ONLY HALF OF IT: THE RENAME CHAIN HAD THREE READINGS.** Repair followed the
whole logged chain, adoption took a SINGLE HOP, and a suppression took none at all — so one
log gave three different answers about one file. With A→B→C logged, B in session 1 and C in
session 2, a unique legacy class was adopted AS SESSION 1 on the strength of B and then had
that very reference repaired into session 2: bound to one class, pointing at another's
files. `followRenames` is that one reading now (a CYCLE is reported, never walked — a log
that loops says nothing about where the file is), and three things use it: evidence, repair,
and the owner's own hides.

**AND "REPORTED" HAD TO BE UNIGNORABLE.** `followRenames` handed back
`{ path, cycle: true }` — a perfectly usable-looking path beside a flag — and only ONE of its
three callers read the flag: adoption refused it, while the suppression re-key and
`retainMissing` walked straight past it. Hide A, publish A->B and B->A, and the re-key moved
the owner's hide onto B: A came back into view and the wrong file went dark. It returns
`string | null` now, so there is no way to drop the verdict and still have a path. A hide
stays exactly where the owner put it, a row the incoming index no longer lists keeps its
provenance flagged rather than being deleted on the strength of a destination nothing can
read, and repair says "the rename log loops on this path" instead of rewriting to an
arbitrary stop on the loop. The SCANNER diagnoses the topology in the first place, and it is
ONE rule rather than a mechanism per shape: A REPLACEMENT NAME IS PUBLISHED ONLY WHERE THE
LOG DETERMINES IT UNIQUELY AND TERMINALLY. A loop names no file; a path given TWO
destinations names no file either; and a chain walking into either cannot say where it
ended. All of them are dropped with a diagnostic (ac-12's own rule: cycles and multiple
destinations DIAGNOSE, never guess), so a published index carries neither, and the app still
refuses to read one from any other source — `checkSourceGraph` rejects a second row for one
`from` at the decoder AND at the persisted door. The fork case had exactly the defect the
loop rule exists to prevent, said the other way round: the scanner published the FIRST
destination and diagnosed the second as "not applied", so the app was handed a mapping the
log cannot support and used it as EXACT IDENTITY — repairing an authored reference onto it
and re-keying an owner's hide onto it. The diagnostic names every destination it saw, once
and in sorted order, because `diagnostics` is inside `contentHash` and a shuffled log must
still produce the same index. An ordinary chain beside a loop or a fork still publishes: one
bad topology does not cost the archive its good provenance.

A RESOURCE SUPPRESSION IS KEYED BY PATH, so left on the old name
a hidden file simply reappeared under the new one while the old row sat there flagged
unavailable. Re-keying it is not editing an owner decision — it is the same decision about
the same bytes said in the archive's current words, the `itemId` scope carried untouched and
`suppressionKey` de-duplicating the result. For the same reason a renamed row is DROPPED
from the retained graph instead of flagged `unavailable`: the log says exactly where the
bytes went, so that file moved, it did not disappear. The comparison is against every path
the incoming graph describes, ACROSS sessions — a rename can move a file into a DIFFERENT
session (the log's own A→B→C shape does exactly that), and asking only "is it still in this
session" flagged such a file as gone while the same bytes sat in the graph under their new
name. Safe to drop, where a piece or a
session would not be: only those carry item/lesson bindings, so no binding can dangle on a
resource row, and a manual unclassified lesson's own reference reaches material through the
LESSON, never through this graph. A file that really is gone still keeps its provenance,
flagged, exactly as before.

**A DELETION IS A DECISION, AND IT IS RECORDED IN THE SAME MUTATION.** `deleteItem`,
`deleteLesson` and `unlinkItemFromLesson` write a narrowly scoped `SourceSuppression`
alongside the change, so a refresh, a reload, a hydration and a sync all respect it rather
than resurrecting what the owner removed. Hiding a resource carries the ITEM id, so a
demonstration shared by eight pieces stays available to the other seven. Lifting a
suppression (`resetArchiveSuppression`) permits reimport. Moving an archive-bound item to
another instrument is REFUSED with an actionable message rather than emitting a graph
`validateDB` would reject at every door.

**ONE COMPOSITION FOR MATERIAL, SCOPED BY THE GRAPH.** `itemFiles` (`itemFiles.ts`) now
composes, in order: what the archive scopes to this piece (corrections first, clean scores
retained, demonstration parts as one ordered group, each row carrying its session and role
as provenance), then the owner's own DIRECT item references, then the references of LINKED
lessons that are NOT archive-bound. An archive-bound lesson contributes nothing through the
link route — its files reached the list already, correctly scoped — which is what stops a
class recording and someone's practice takes from landing on a piece. A manual, unclassified
lesson still contributes everything it has, because nothing knows the scope and inventing
one would be a guess.

**A LESSON IS THE OPPOSITE CASE: EVERY FILE ON IT HAS EXACTLY ONE SECTION THAT RENDERS IT.**
An ITEM's material is composed from OTHER records — linked lessons, the graph — that the
item's own page has no section for, which is precisely why `itemFiles` must stay the whole
composition. A LESSON owns its own references and its own attachments, and its page already
renders each in the section that can edit and remove them. `lessonFiles` composed those as
well, so an authored NAS reference the index describes nowhere — the owner's own practice
takes on an adopted class — and every local attachment were rendered TWICE: once above,
where nothing can be done with them, and once again where they live. `lessonFiles` is now
the ARCHIVE's contribution alone (an archive-bound class keeps no copy of its session's
files, so nothing else can show them); "Class recording & scores" keeps the owner's
references, `Attachments` keeps the attachments, and each Remove button is NAMED after its
own file rather than saying "Remove this link" three times over.

**AND "HAS A RECORDING" IS ABOUT THE CLASS, NOT ABOUT THAT ARRAY.** An imported historical
class keeps no copy of its session's files, so `lesson.recordings` is empty and the
empty-state card invited the owner to add a class recording directly beneath the one already
playing above it. That state is read through the same composition the section above renders
— not the session's `hasClassRecording` flag — so a class recording the owner has HIDDEN does
not count as one that is there.

**SCHEMA v14 IS ADDITIVE, AND THE WHOLE GRAPH IS VALIDATED AT EVERY DOOR.**
`migrateToV14` adds an EMPTY `archiveSources` and changes nothing else; it is unconditional
and idempotent for the reason `migrateToV12` and `retirePracticeText` already are.
`archiveSources` is in `validateDB`'s ARRAY_KEYS *and* in its reconstructed return value — a
new collection left out of that object literal is silently dropped on the way in.
`validateArchiveSources` refuses duplicate source ids, duplicate piece keys, duplicate
session numbers, wrong types, unsafe paths, invalid part groups, dangling or duplicated
item/lesson bindings, an instrument mismatch and an unsafe direct reference, naming the
record. A resource marked `unavailable` is a VALID state — the file is gone from the NAS and
its provenance is kept — not a dangling reference.

**THE NESTED GRAPH HAS ONE GRAMMAR — AND THE DECODER RUNS IT OVER ITS OWN OUTPUT, WHICH IS
NOT THE SAME CLAIM AS RUNNING IT OVER WHAT ARRIVED.** (A later sealed review found exactly
that gap; the `list`/`num`/`bool` rule above is what closes it, and the grammar below is
what the decoder's OUTPUT and every persisted graph are both held to.) `decodeSourceIndex` and
`validateArchiveSources` used to state the shape separately, and the second stated LESS of
it: it checked a resource's path and its part group and walked straight past
`members[].roles`, `piece.aliases`, a resource's `kind`/`title`/`pieces`, a session's
`folder` and `roster`, and the rename and diagnostic rows entirely. A sealed review set
`members[0].roles` to `null` in an imported file: every door ACCEPTED and PERSISTED it, and
the first production reader to touch it — `repeatChains`, doing `m.roles.includes(...)` —
threw while rendering material. `planArchiveImport` had the identical exposure through
`new Set([piece.key, ...piece.aliases])`. `checkSourceGraph` (`sourceArchive.ts`) is that
grammar in ONE place; the decoder runs it over its own normalised output and
`validateArchiveSources` runs it over every persisted source, so a reader may dereference
any field the grammar admits and nothing else can reach the database. The fix is the
GRAMMAR, never a defensive guard in a component: a reader written against a validated graph
is the point of validating it. `unavailable` stays legal on a piece, a session and a
resource, and a suppression's `itemId` and `at` are checked too — a non-string `itemId`
silently widens a hide scoped to ONE item.

**AND A GRAMMAR OF FIELD TYPES SAYS EVERY VALUE IS READABLE, NEVER THAT THE GRAPH AGREES
WITH ITSELF.** A resource physically sitting in class 2's folder, listed under class 1, is
type-perfect at every door and attributes someone else's file to the wrong class on every
screen that reads it. So `checkSourceGraph` also checks the RELATIONS, and the same four at
both doors: a resource's path is `<that session's folder>/<name>` and nothing else; a
resource attributed to a piece has that piece's membership recorded for that ROLE, so no
file can surface as a piece's material with nothing in the graph saying it belongs to it; a
`group` belongs only to a demonstration, and the parts sharing one are material for the same
pieces with distinct part numbers, so an arbitrary group cannot invent one logical resource
out of unrelated files; and `hasClassRecording` agrees with whether a class-role resource is
actually there, which itself may never name a piece.

These run over what the source still DESCRIBES. `unavailable` is retained provenance about
what it has STOPPED describing — a piece dropped from the registry, a file deleted from the
NAS — so holding those rows to the current source's internal agreement is a category error,
and would make every refresh after a removal refuse at every door. The group's LABEL format
is deliberately not asserted: that is the scanner's grammar, and this file's own rule is
that the grammar lives once.

**AND THE RECORD'S OWN FIELDS ARE CHECKED, NOT ONLY ITS NESTED GRAPH.** `acceptedAt` was
the one persisted field with no check at all, while Settings renders it
(`acceptedAt.slice(0, 16)`) to say when the index last changed — so a v14 import carrying
`acceptedAt: null` was accepted, persisted, and then threw while the screen drew. It is
held to a REAL calendar instant (`isValidSourceDateTime`, a local sibling of
`isValidSourceDate` rather than a shared import, for the reason `askedAt` and `dueDate`
already keep their checks one per file): a shape regex matches
`"2026-02-30T12:00:00.000Z"` and `Date.parse` silently normalises it into March. `renames`
and `diagnostics` are required AT REST where the grammar tolerates them absent, because the
decoder always emits both and the planner reads them unguarded. A suppression's `at` is
provenance only — nothing reads it back as a date — so it is held to being real text and no
further. The fix is this DOOR, never a guard in `ArchiveRefresh.tsx`.

**A BASE IS AN ORIGIN AND A PATH, AND NOTHING ELSE.** Everything appends a path AFTER the
base, so a credential, a query or a fragment in it is not untidiness:
`https://user:pass@nas.example/media?token=secret` made "Open archive root"
`…?token=secret/` and a file `…?token=secret/session-1/x.mp4` — a password on screen in
every device URL, addressing no file at all. `normalizeBaseUrl` REFUSES all four
(`username`, `password`, `search`, `hash`) rather than stripping them, because a rewritten
base names a different server and only the owner can say what they meant; the media
sentence says WHY. That is the whole family in one place: `resolveRecording`,
`relativizeReference`, `archiveRootUrl`, `describeArchiveAccess` and the reconciler's
`verifiedBase` (through `archiveRootUrl`) all pass through it. A stored ABSOLUTE url is
still opened as the owner saved it — their own authored link, not this device's configured
base, and nothing here mints one.

**TRANSPORT IS PER DEVICE AND NEVER SYNCED.** `resolveRecording` encodes each Farsi segment
ONCE and now REFUSES an unsafe relative path outright (`status: 'unsafe'`); the Mac base
(`https://192.168.0.20:5010/setar-classes/`), the iPhone base and any future base resolve
the same stored path with each one's own path prefix preserved. `relativizeReference` will
not store a pasted URL whose decoded form steps OUT of the base — it keeps the pasted text
exactly as given instead. The arbitrary-clip "Test link" is gone: a single clip proves
nothing (it fails for a renamed file and passes for a base whose other thousand files are
unreachable), so Settings opens the ARCHIVE ROOT and `describeArchiveAccess` states the
index and the media as two separate facts. Reading the index proves GitHub answered and
says nothing about the NAS; a certificate rejection, a blocked cross-origin request and an
outage are indistinguishable from a web page, so none of them is ever called absence.

**THE 67 LEGACY PATHS ARE REPAIRED EXACTLY, OR DIAGNOSED.** `src/domain/setarClasses.ts` is
FROZEN — no longer a workflow, now the ledger of what the old bundled importer wrote — and
`repairReferencePath` maps all 67 through the archive's own 257-row rename log. No fuzzy
matching by title, size or modification time; a cycle, a missing target or an ambiguous
mapping is reported. A full URL converts only under a VERIFIED base, and one carrying a
query or fragment is left alone. Where an old and a current row now point at one physical
file, BOTH rows survive with their own titles and notes: deleting one deletes something the
owner wrote.

**AND THE REFRESH ITSELF DOES IT — a helper with no production caller repairs nothing.**
The rename log is published WITH the index, so the one moment the app can repair a stored
path is the moment it accepts a new graph; a sealed review found a uniquely adoptable
legacy class being adopted and left pointing at names the archive renamed years ago — bound
and broken. `planArchiveImport` now runs `repairLessonReferences` in ONE pass over the
lessons this archive OWNS: the ones this plan adopts and the ones already bound. A lesson
the archive has no claim on is not something a refresh may rewrite. The pass produces the
objects the plan SHOWS (`adoptedLessons`) and the ones it installs (`repairedLessons`), so a
preview cannot display an old path while the commit writes a new one. `verifiedBase` is
threaded from the device's own configured media base, so a stored full URL under it converts
and everything else stays exactly as the owner saved it.
A cycle, a rename whose destination is gone and an unsafe path become plan `attention`
rows — but `not-described` does NOT (see `RepairReason`): the index deliberately describes
only material scoped to pieces and classes, so 125 of the archive's 258 files (the owner's
own practice takes) are absent from it BY CONSTRUCTION, and a path it never names and never
renamed is outside what it knows, never evidence that the file is gone. Those three personal
references are retained historical links, untouched and unflagged.

**LESSON NOTES ARE THE SAME DURABLE EDITOR AS THE ITEM NOTEBOOK.** `DurableNotes`
(exported from `ItemNotes.tsx`) is the one implementation — explicit Done, a draft tagged
with the record it was typed for, "Saved." only after IndexedDB acknowledges, retry and copy
on failure, and an in-flight write that never owns the textarea — and `LessonNotes.tsx` is a
thin wrapper over it. The defect it fixes was NOT in an editor: `updateLesson` read
`patch.notes ?? l.notes`, which cannot tell an OMITTED patch field from a deliberately empty
one, so clearing a class's notes wrote the previous notes straight back. The store decides
on the PRESENCE of the key now, the same distinction `resolveReviewDate` already makes for a
date.

**SECRETS.** The NAS publisher's credential is a SEPARATE, repository-scoped token
(Contents write + metadata read, no workflow or admin scope) living only in the NAS
runtime's protected configuration. GitHub does not issue branch-scoped tokens: the
branch/path restriction is a property of `publish-setar-index.mjs`, and must never be
described as credential isolation. The app's own browser token and each device's media base
stay device-local exactly as before. No credential and no archive root enters a source
archive, a committed file, a manifest, app data, a log, sync or a backup.

## Review scheduling stays explainable

`decideReview` (in `scheduling.ts`) is the ONE pure decision behind closing a block: the
date disposition, the SM-2 transition and the sentence that explains them, together.
`planNextReview` previews it, `computeReviewOutcome` turns it into the write, and the
close screen renders it — three renderings of one value, never three derivations. Per
item it tracks `srReps` / `srEase` / `srIntervalDays`, plus `nextReviewSource` (who chose
the current date) and `srLastProgressDay` (the one-advance-per-day marker). Every number
is published in `docs/scheduling-evidence.md`.

**PRACTICE IS EXPOSURE; ONLY ELIGIBLE RETENTION EVIDENCE ADVANCES SPACING.** Eligible
means ALL THREE of: a logged `stable_alone` / `stable_in_context` / `performable`; at or
after the pending due date (or the first opportunity, when no date exists); and spacing
not already advanced today. Each of those independently blocks an advance. A missing,
`undefined` or `not_logged` result never advances — which is exactly what a routine block
is, so routine exposure can never become a retention judgement.

**`same` IS NOT FAILED RECALL.** This engine used to map it to a quality of 2, which fell
into the slip branch and reset a schedule the musician had every reason to trust. No
improvement is distinct from deterioration. Before a due date, `same` and
`slightly_better` change nothing; AT a due automatic review they REPEAT the current gap
(the configured first gap if there is none) without touching repetitions or ease, and
neither is ever described as a slip.

**ONLY `worse` MAY BRING AN AUTOMATIC DATE FORWARD**, to the EARLIER of the existing date
and the repair proposal — never later, so a repeated negative close cannot slide
tomorrow's repair into next week. Nothing else is read as failure: not duration, not
mode, not difficulty, not a teacher question, not a stale clock.

**A DATE THE OWNER OWNS IS NOT THE ENGINE'S TO MOVE.** A FUTURE date is PROTECTED when
the owner chose it (typed, snoozed, or re-armed — `nextReviewSource: 'user'`), when the
item is on a fixed cadence, or when its provenance predates this field and is therefore
unknown. Early practice, `worse` included, leaves it exactly where it is. Protection ends
when the date comes due: it is then the review, whoever chose it. Manual mode with no
newly chosen date preserves the pending schedule — an empty automatic proposal is not an
implicit "no".

**ONE ADVANCE PER ITEM PER LOCAL CALENDAR DAY**, recorded as `srLastProgressDay`. It is
an administrative eligibility marker, never a measured retention score: clearing and
re-arming the date, a reload, a sync, or simply closing a second block cannot buy a
second expansion.

**THE RATIONALE REPORTS THE FINAL SAVED DATE.** It used to quote the raw setting: a
three-day repair gap on an easy, unimportant item produced a four-day date and said
"three days".

**A CLOSE THAT ONLY KEEPS A DATE COMPLETES NOTHING.** `ReviewOutcome.completeOpenReviews`
is false for a `keep`, so extra practice before a review leaves that pending row OPEN —
it is not the review it was scheduled for. `closeOverrideDate` (`format.ts`, tested) is
the seam that makes this hold: the close screen SHOWS the date that will stand, which for
an early session is the item's existing one, and passing that back as an explicit
override would both stamp every engine-proposed date as the owner's and turn every keep
into a write. Only a date actually typed into the field is an override.

**AN OPEN DATE EDITOR IS BOUND TO THE ITEM AND THE DATE IT WAS OPENED FOR.** The same rule
as the notebook's draft tag, on the panel that edits a review date
(`reviewDateDraftFor`, `format.ts`, tested; used by `ScheduleAgain` in `ItemDetail.tsx`).
`/items/A` → `/items/B` is a route PARAMETER change: React keeps the same component
instance and only moves the props, so an open draft survived it and "Save date" wrote it
through the NEW item's callback — A's 2027‑02‑10 landing on B, silently replacing a
schedule B's owner never touched. The draft therefore carries `forItem` AND the item's own
pending date at the moment it was seeded, and is reconciled on EVERY render rather than
reset from an effect, so there is no paint in which the box shows A's date while Save
points at B. A different item DROPS it; the item's own date moving beneath an UNTOUCHED
seed re-seeds the box, because saving a captured date would silently revert a change the
owner never saw; the item's date moving beneath TYPED text leaves the text alone (it is
their intent, not a stale capture) and only catches the baseline up.
`ReviewOwnership`'s refusal message carries the same tag, for the same
reason: a refusal about A's schedule shown under B is a statement about the wrong item.

**THREE FACTS NEED THREE FIELDS, AND CONFLATING TWO OF THEM EXEMPTED A WHOLE TRANSITION.**
`seeded` used to hold "the item's date, or today when it had none", which made "this item
has no date" indistinguishable from "this item's date happens to be today". The only way to
stop a dateless item's today-box being re-seeded to empty was therefore to skip the
comparison ENTIRELY whenever the item had no date — and a sealed review reproduced what
that exemption let through: a live update (a sync pull, a review declined elsewhere) that
CLEARS the item's pending date left the box showing, and "Save date" writing, a date the
item no longer had. There is no exemption now. `seeded` is the item's OWN date and is empty
when it has none, `offered` is what the box was actually filled with (that date, or today),
and "untouched" is `text === offered`. present→different, present→absent and absent→present
are then ONE rule instead of three cases with three answers, and a cleared date re-seeds the
box to exactly what opening it fresh on that item would offer. `today` is passed in, because
`format.ts` is pure and the screen already has the day it is rendered against.

The browser proof is a REAL SYNC PULL (`review-ownership.browser.test.ts`, ac-12), not a
description of one: a pull is the only thing that replaces an item's date while
`ScheduleAgain` stays MOUNTED — an import leaves the page, and "Review today" is offered
only when the item has no date — so the journey installs the same fake GitHub transport the
inbound journey uses (now shared, in `tests/practiceBrowser.ts`) and triggers the app's own
`online` listener. Both halves are checked there: an untouched box follows the item, typed
text stands.

**"Schedule again" is administration, not practice.** `scheduleAgainPlan` sets ONE date on
the item and its pending row, CREATING the row when none is open (the case the old date
helper could not reach, which left a declined review unreachable from the item's own
screen). No block, no result, no statistics, no SM-2 movement.
`pendingScheduleConflict` REPORTS legacy open rows that disagree rather than silently
discarding one.

**HANDING A DATE BACK TO THE ENGINE IS ALSO ADMINISTRATION, AND IT KEEPS THE DATE.**
"Use automatic scheduling" (`transferToAutomaticReview`, `scheduling.ts`, tested) transfers
WHO MANAGES the next review and nothing else. The pending calendar date is kept EXACTLY as
it is; `reviewMode` becomes `'auto'` and `nextReviewSource` becomes `'auto'`, which together
mean the ENGINE now has authority over that date — never that the date was mathematically
generated, and never that a review happened. No block is written, no result is invented, and
`srReps`/`srEase`/`srIntervalDays`/`srLastProgressDay`, every statistic, every status and
every completed review row are left byte-for-byte alone. Only later ELIGIBLE real practice
supplies retention evidence. **The button's explanation must never call the retained date a
new calculation** — that is the one sentence this whole transition exists to be honest about.

It REFUSES rather than guesses when the schedule is ambiguous: open rows that disagree with
the item or with each other, or rows pending with no item date at all, are a decision the
owner has to make (the existing "Change review date" makes it), and the refusal says which.
With no date and no open rows the item simply becomes unscheduled under automatic
management — `nextReviewSource` stays ABSENT, because there is no date whose provenance it
could describe — and stays that way until an explicit "Review today". It is idempotent, and
it is reached ONLY by that explicit control: an ORDINARY item save never releases a
protected date, so editing a title cannot quietly hand the engine a date the owner chose.
`updateItem` routes the whole change through it and refuses the save WHOLE on an ambiguous
schedule, rather than applying the other fields and dropping the transfer.

"Review today" is separate, and records no practice: it sets today's date on the item and
its row. It resolves the day at the moment of the ACTION, not from the polled `now` — the
same guard `CloseBlock`'s Save already uses, and for the same reason: a screen left open
across local midnight would otherwise write the day it was rendered on rather than the day
the owner tapped.

Keep it deterministic and explainable — don't turn it into an opaque model. Item status
labels are plain-language for the user — keep the enum keys stable and only change the
display labels in `labels.ts`.

**The engine is visible AND adjustable, never magic.** `SchedulingParams`
(`src/domain/types.ts`) holds bounded knobs — the SM-2 first/second/slip-reset gaps and
the Session Plan minute shares — persisted as an OPTIONAL `PracticeDB.settings` (schema
**v10**; `undefined ⇒ DEFAULT_SCHEDULING_PARAMS`, so old backups import unchanged and
`validateDB` carries the field through). `DEFAULT_SCHEDULING_PARAMS` reproduces the
historical constants EXACTLY — `decideReview`/`planNextReview` take an optional `params`
whose default is byte-identical to before (a snapshot test guards this). Every call site
that shows OR persists a date must thread the SAME params (`db.settings`): the store into
`closeSession`, `CloseBlock` into both preview calls — the date shown must equal the date
saved. `clampSchedulingParams` enforces the bounds (never trust raw input). Settings' "How
scheduling works" section states the real priority formula and the SM-2 rungs in plain
English with live values, offers bounded inputs + "Reset to recommended", and CloseBlock's
review row links to it ("Why this date?").

**"THE DATE SHOWN EQUALS THE DATE SAVED" ALSO HAS TO SURVIVE THE SAVE ITSELF, NOT JUST
THE RENDER.** `CloseBlock`'s `now` (`useDecisionNow`) only refreshes every 30 seconds plus
visibility/focus, while `closeSession` used to compute its OWN fresh `new Date()` at call
time — so a Save clicked in the narrow window after the local day had genuinely rolled,
but before either the poll or a visibility event caught up, could write a decision
`computeReviewOutcome` recomputed for TODAY while the screen had only ever shown
YESTERDAY's. A sealed review named this gap explicitly. `closeSession` now takes the
screen's own `now` (`CloseSessionInput.now`, defaulting to `new Date()` only for the rare
caller with no prior decision to keep in step) instead of reading a fresh clock at module
scope, so once a save actually proceeds it writes EXACTLY the value just previewed —
never a second, independently-computed one. The day check itself lives in `CloseBlock`:
`handleSave` compares the true instant against `now` first, and on a mismatch sets a
local `nowOverride` and returns WITHOUT calling `closeSession` — refreshing the decision
visibly (the date field, the rationale, everything derived from `now` recomputes) while
the draft (result, observation, next action) is untouched, so the very next
Save simply works. This is deliberately a small, local override rather than a change to
`useDecisionNow`'s shared contract — `SessionPlan.tsx` and `LessonAgenda.tsx` also read
that hook and neither needed this.

## The Session Plan is a view over real blocks, not a new to-do list

The Session Plan (`src/domain/plan.ts`, pure + fully tested; `/plan` page) lays out one
time-budgeted session for the current instrument: ordered segments in five buckets
(`warmup · lesson · review · deep · cooldown`), each with minutes, a mode/focus, and a
one-sentence reason. It **reuses the same `scoreItems` priority numbers** as the
recommendation engine — no second, hidden ranking. It is organisation, never judgement:
no scores, no "optimal" claims, no gamification.

- **The invariant: minutes NEVER exceed the budget, and normally use all of it**
  (`buildSessionPlan`, `allocateMinutes` — weighted split, min 2 and max 25 per segment,
  drops the lowest-priority segments when the budget can't seat them all). An HONEST
  REMAINDER is allowed and stated in the summary: two items and two hours is not a reason
  to propose a sixty-minute block on each. Budgets are whole minutes from 5 to 120;
  anything else (non-finite, zero, out of range) is REJECTED at the boundary
  (`validateBudgetMinutes`) rather than clamped into a session the owner never chose.
  Keep it deterministic (explicit `now`, stable score-desc-then-id tiebreaks) and keep
  the edge cases green (0 items, 1 item, resting-only, everything practised-today →
  repeats honestly and says so). `redistributePlan`/`swapSegment` are the pure editors and
  preserve each segment's identity, role and reason; the preview page tweaks a LOCAL copy
  before `startPlan`.
- **THE ANCHOR COMES FROM REAL URGENCY, BEFORE ANY ROLE DECORATION.** A five-minute
  session used to pre-select new deep work and only then consider an item committed for
  tomorrow's class. Under 12 minutes the session is ONE useful main focus, no warm-up and
  no cool-down. Usable material, improvisation, rhythm and theory are ordinary useful
  work even though they fit none of the old buckets.
- **Warm-up is a ROLE an ordinary familiar item fills, never a tag.** `isWarmupSuitable`
  wants low demand (difficulty ≤ 3) AND evidence of familiarity (a settled status or 3+
  real sessions) — an unfamiliar demanding étude is not a warm-up because it is labelled
  "technique". It never consumes a due review or a class commitment, its share
  (`warmupShare`) is a PINNED allocation target rather than a weight, and with nothing
  suitable it is omitted honestly.
- **ONE eligibility policy** (`isProactiveCandidate`) across Today, the initial build,
  regeneration, swaps and every fallback: resting material never surfaces in a
  suggestion, and a fallback never widens to reach it. Direct, deliberate practice of a
  resting item stays available and its review data is untouched.
- **A SWAP SHARES THE BUILD'S OWN CANDIDATE POOL, NOT JUST ITS ELIGIBILITY POLICY.** A
  sealed review found `swapSegment` filtering by `isProactiveCandidate` alone and then
  searching `scored` directly — bypassing the build's OWN practised-today exclusion
  (`candidatePool`, shared by both now) and the warm-up pool's extra due/lesson
  exclusions. Concretely: three same-instrument usable items scored 5/4/3 with the
  middle one practised one minute ago today; a five-minute build correctly stepped past
  it for the fresher lowest-scoring one, but Swap handed it right back because fresh
  work scored lower — the exact material the build had just deliberately set aside, with
  an ordinary "focus" reason as if nothing were off. A warm-up swap could likewise reach
  a candidate that was due for review or committed to a class, which the build's own
  warm-up pool excludes on purpose (that slot belongs to the actual need, never spent as
  a warm-up). `candidatePool` (`plan.ts`) is now the ONE practised-today/repeat-fallback
  computation both `buildSessionPlan` and `swapSegment` draw from, and swap's own
  eligibility switch repeats the warm-up bucket's due/lesson exclusion verbatim. Swap
  deliberately does NOT replay the build's diversity preference (a tie-break among
  segments chosen together in one pass, which a single substitution has none of) — see
  `swapSegment`'s own docstring for why that is a documented choice, not an oversight.
- **Over-practice is bounded, decaying recent MINUTES**, not a block count and not a run
  of identical results (`recentExposureMinutes`, `exposurePenalty`). Three "same" results
  in January are a strategy hint in January, not a permanent penalty in September, and
  one 30-minute session is the same exposure as three 10-minute ones. A modest diversity
  preference (≤ 2 points, from the item's existing strand/type) is subordinate to every
  real need.
- **A preview is rebuilt for what it is FOR** — instrument and budget — and is marked as
  needing regeneration when the underlying practice data changes beneath it, rather than
  silently starting stale work. `beginPlanSegment` revalidates the item LIVE
  (`planSegmentStartable`): deleted or moved to another instrument ⇒ visibly skipped,
  another clock running ⇒ refused. Skipping logs nothing.
- **A PLAN CAN GO STALE WITH NO DATABASE WRITE AT ALL: THE CLOCK MOVING PAST IT.**
  `SessionPlan.tsx` tracked staleness only via `rev` (the store's mutation counter) and a
  `seedKey` of `instrumentId|budget` — neither moves when a preview is simply left open
  across local midnight. A sealed review reproduced this: yesterday's segments, reasons
  and "for today's class" labels stayed on screen and startable with the Start button
  enabled, because `build` (the live recomputation) had quietly changed underneath while
  nothing told the visible `plan` state to notice. The preview now also tracks the LOCAL
  CALENDAR DAY it was built for (`baseDay`, set alongside `baseRev`) and is `stale`
  whenever `rev` OR the day has moved — the same "mark it, don't silently rewrite it"
  treatment `rev` already got, so a deliberate swap or removal survives a midnight
  exactly as it survives any other change underneath the plan.
- **THE PASSIVE `stale` FLAG ABOVE STILL LAGS THE TRUE INSTANT BY UP TO ITS OWN POLL
  INTERVAL — STARTING A PLAN CANNOT TRUST IT ALONE.** `stale` is derived from
  `useDecisionNow`'s own `now`, which refreshes at most every 30 seconds plus
  visibility/focus — a real device left untouched across local midnight, with no event to
  fire and no poll due yet, still reads `stale === false` and shows an ENABLED Start
  button for up to that whole window. A sealed review reproduced this against the real
  wiring: build at 23:59:59, click Start at 00:00:01 with no dispatched event, and the old
  code installed yesterday's selections. Starting a plan is an authority boundary, so
  `start()` (`SessionPlan.tsx`) checks a FRESH `new Date()` against `baseDay` directly —
  via the extracted pure `planPreviewDayHasPassed(baseDay, now)` (`plan.ts`), the same rule
  `stale`'s own day comparison already applies, just evaluated against the true instant
  instead of the polled one — before ever calling `startPlan`. A mismatch refuses the
  start and sets a small local `nowOverride` (the same shape `CloseBlock`'s own Save-race
  guard already uses) so `now`/`today`/`stale` immediately catch up and the existing
  banner and disabled button render — a visible refusal, never a silent no-op click. This
  does not touch the `rev`-based half of `stale`: a store mutation already re-renders the
  subscribed component synchronously, so only the CLOCK side of staleness can lag behind a
  click in the first place.
- **The plan runs REAL practice blocks — it is not a countdown.** `RoutineRunner` (the
  warm-up timer) stays untouched. The runner orchestrates the existing
  start→`/active`→`/close` flow: "Start this segment" = `beginPlanSegment` seeded from the
  segment (its minutes become the target). `closeSession` has a tail that, when a plan is
  running and the closed block was the current segment, marks it `done` and advances the
  pointer — **the plain flow (no active plan) is byte-identical to before.** Skipping logs
  nothing. Practising is still the only thing that CAN complete a review or advance SM-2,
  and a plan segment closed before that item's review is due keeps the date and the
  spacing state exactly as an ordinary early session does.
- **The running plan is EPHEMERAL** — `activePlan` + `planMinutesByInstrument` live in the
  store (persisted via `partialize`), **never in `PracticeDB`, so no schema bump and it
  never syncs/backs-up as data.**
- **Today's plan card stays collapsed (~50px) above "Practise now"** so the primary
  recommendation stays above the fold at 390×844 (verified). Putting it BELOW the
  recommendation was built and tried in the 2026‑09‑11 lane and the owner preferred it
  where it is — see "Today is a session workspace" above. It becomes "Resume your plan"
  while one runs. The evidence behind the bucket shape (spacing, interleaving, retrieval
  practice, end-on-stability) is cited soberly in `plan.ts` and `DECISIONS.md` — sane
  defaults, adjustable via `SchedulingParams`, never dressed up as an optimum.

## Device & infrastructure

**MacBook-first in daily use** (laptop open while practising — notes, files, webcam as
mirror), iPhone as the companion; the phone constraint still binds (primary
recommendation above the fold at 390×844). Both run the **same installed PWA** served
from **GitHub Pages** (`.github/workflows/deploy.yml` publishes `dist/` on every push to
main; the repo is public by explicit user decision, 2026‑07‑11 — the user does not need
the app or data private). Prod base `/practice-compass/` (override with `PC_BASE`)
matches the Pages project path. CI (`ci.yml`) still gates lint + tests + build. The
installed PWA works fully offline; hosting reliability only affects updates.
`scripts/deploy-nas.sh` remains an OPTIONAL LAN mirror — never the primary, and no
Tailscale requirement in the main flow.

**Devices sync via the user's GitHub data repo** (Settings → Sync): on app open, after
30 quiet seconds following changes (rev-driven), on returning online, and manually.
Status shows device name, last sync, current revision + short content hash, plain
errors, and a "restore archived copy" recovery action. The UI must stay honest about
the model: whole snapshots, hash-compared, explicit conflicts, both sides preserved.
The PAT is scoped to the single data repo (Contents R/W) and lives only in
localStorage — never in backups or synced data.

**Attachment size policy is enforced, not claimed** (`attachmentPolicy` in
`src/domain/files.ts`, tested): warn over 10 MB and for any video, refuse over 40 MB
with a clear message. Class videos live on the NAS as recording references, never the app.

**Hybrid storage — keep the roles distinct (Settings explains them):** LOCAL data
(IndexedDB) is the source of truth and works offline. GITHUB SYNC is the small,
versioned multi-device state transport — one private data repo per app that genuinely
needs it; a phone-only app uses local + NAS backup and needs no GitHub repo. NAS BACKUP
is the user's own independent full export — never treat sync git history as the only
backup. NAS RECORDINGS hold the large videos the other three must never carry. Do not
replace GitHub sync with a NAS backend, and do not fold recordings into sync/backup.

**The app shell is a fixed-height flex column and only `<main>` scrolls** — nothing is
`position: fixed/sticky`, so the nav bar cannot drift. The shell height is **`100dvh`
(dynamic viewport) with a `100vh` fallback via `@supports`**, NOT `height: 100%`: in an
installed iOS PWA with `viewport-fit=cover`, `100%` resolves to the layout viewport
which stops above the home-indicator safe area, leaving the bar floating above the
physical bottom with dead space beneath. With `100dvh` the shell reaches the true
bottom and the bar's own `env(safe-area-inset-bottom)` padding lifts just its buttons
clear. **The iOS software keyboard must not drift the shell:** `useViewportGuard`
(`src/components/useViewportGuard.ts`, wired once in `Layout`) listens to `visualViewport`
and, when no editable is focused, resets any layout-viewport displacement to 0; on focus it
scrolls the field into `<main>` instead. It is a no-op without `visualViewport` and must
stay pure glue — never restructure the shell to "fix" the keyboard. Five EQUAL nav tabs
(no raised centre button — Today owns the primary Start
action); route changes scroll `<main>` to top; per-route page widths (narrow for focused
practice, wide ~1100px for browsing/notes on desktop); serif is for headings only,
controls/nav/metadata are sans. Pathway catalogue rows use a stable
`[state · minmax(0,1fr) · one 44×44 action]` grid so adding a suggestion swaps only the
action icon (+→▶) without reflowing the text; status shows once (no duplicate badge);
detach lives in the item's "Connected to", not the row. The service worker registers in PROMPT mode: updates show an in-app "new version
→ Reload" banner (checked hourly and on visibilitychange) and the build stamp
(`__APP_VERSION__`) is visible in Settings — reinstalling is never the update path.
The public build ships a restrictive CSP meta (self + api.github.com only), injected
at build time (`cspPlugin` in vite.config.ts). Pages deploys ONLY behind lint + tests
+ build (deploy.yml single dependency chain).

**Canonical names in user-facing copy:** practice item (the only unit of work) ·
Study source (where an item comes from: radif, method book, collection, course,
teacher handout — nothing else) · Pathways / My repertoire / Practice list (the three
Repertoire views) · "Add practice item" (full form) · "Based on / reference" (a
pathway's provenance) · "Connect it (optional)" (the links group). A practice item may
link to a study source, a stage, lessons and a parent work at once; links never
duplicate the item.

## Colour is checked by a test, not by eye

`src/styles/contrast.test.ts` computes WCAG ratios from the SHIPPED stylesheet and fails
the suite if a listed pair drops below AA for small text (4.5:1). The checked
(foreground token, background token) pairs are written out explicitly in that test, so a
token that is NOT covered is a visible omission rather than a silent one; the claim is
bounded to those pairs and is not a claim about every possible combination. A
translucent background (`--tone-*-soft` behind a `.badge`/`.chip`, `--accent-soft`
behind a selected option) is composited over the opaque surface the pair names — badges
are the only place `--tone-rest` renders at all, so an opaque pair for it would be a
fiction.

Every block that declares the palette is asserted, not just the first: `global.css`
declares the light palette TWICE — at `:root[data-theme='light']` and again inside
`@media (prefers-color-scheme: light) { :root:not([data-theme]) }` — and the duplicate is
what an owner who has never picked a theme actually sees. **Move a light token in both
blocks or the test fails.** Only tokens that FAIL a listed pair move; every passing token
is left untouched (all five `-soft` fills, `--text`, `--text-dim`, `--accent-dim` and
`--accent-contrast` are unchanged), and no layout, spacing or type changes with them.

## Architecture rules

- **Domain logic stays pure.** Everything in `src/domain/` must be free of React and
  side effects, and must take an explicit `now: Date` instead of calling `new Date()`
  internally. This keeps it deterministic and unit‑testable.
- **The recommendation engine stays deterministic and explainable.** Every recommended
  card must produce a one‑sentence reason from the same numbers that ranked it. No
  hidden heuristics, no models.
- **The store is the only place that mutates app data.** UI components call store actions;
  they never touch IndexedDB or rebuild domain objects by hand. Attachment **blobs** are the
  one exception: they live in IndexedDB via `src/store/idb.ts` and the `attachments.ts`
  service (too big for the reactive JSON); only their lightweight metadata sits in the store.
- **Storage is async.** The store hydrates from IndexedDB after load; `App` gates render on
  `hydrated`. Every inbound database — rehydration, manual import, sync pull,
  conflict-keep-remote, archive restore — runs through the one shared `validateDB`
  (`src/domain/io.ts`), which itself runs the `migrateToCurrent` chain
  (`src/domain/migrations.ts`) plus the newer-schema guard and the §C7 semantic checks;
  persistence changes must keep it green and bump `SCHEMA_VERSION`. Rehydration reaches it
  via BOTH halves of the persist middleware — `migrate` when the persisted version differs
  from the current one, `merge` UNCONDITIONALLY otherwise — because Zustand skips `migrate`
  entirely once the persisted version already matches, which would otherwise let an
  already-current database carry a stray legacy field, or genuinely invalid data, forever
  (a sealed review reproduced exactly this — see the lesson-agenda section above for the
  legacy-field fix, and "THE HYDRATION BOUNDARY ENFORCES ALL OF THIS TOO" above for the
  validation/newer-schema fix and why re-running either a second time is safe). Schema
  **v13** retires the competing practice-text fields (`retirePracticeText`; see "One
  canonical home per kind of information" at the top of this file for the enumerated,
  one-way waiver) and adds `validatePracticeText`/`validateUnfinishedText` to the §C7
  checks. Schema
  **v12** converts legacy lesson intent into `lessonAgenda` and
  adds the two scheduling-metadata fields (`nextReviewSource`, `srLastProgressDay`) —
  neither is ever guessed for old data, so an existing future date keeps UNKNOWN
  provenance and is protected accordingly. Schema **v11** backfills a routine's `instrumentId` from the pathway
  it belonged to — but only when that pathway names an instrument that actually resolves
  in `db.instruments` (a General pathway, a legacy empty-string id, or a dangling
  reference all leave the routine honestly unscoped rather than inventing one), and never
  overwrites a routine that already has one.
- **One file per route** under `src/pages/`. Shared UI primitives live in
  `src/components/`. Pure helpers go in their own non‑component modules (this also keeps
  React Fast Refresh and the `react-refresh` lint rule happy).

## Tests are not optional

`npm test` must pass. The suite guards the behaviour that makes the recommendations
trustworthy; if you change the scoring formula or scheduling intervals, update the tests
in the same change and make sure they still describe correct behaviour.

**Two of them drive the REAL app in a real browser.**
`tests/daily-practice.browser.test.ts` and `tests/lesson-agenda.browser.test.ts` are
ordinary Vitest tests using Playwright as a LIBRARY through `tests/practiceBrowser.ts`,
so their results land in the same report everything else does — a standalone Playwright
run would prove nothing to the check engine. Each starts its own Vite dev server and its
own browser CONTEXT (its own IndexedDB, its own localStorage, no GitHub and no NAS), at a
390×844 viewport, with the clock fixed so every derived date is deterministic. They seed
themselves by importing a fixture through the real Settings control and drive rendered
controls by role and name — never a debug hook, never a source regex.

Local setup, once: `npx playwright install chromium`. **A missing browser FAILS these
tests with that instruction; it never skips them** — a check that quietly passes because
it did not run is worse than no check at all. All three CI workflows install the browser
before `npm test` for the same reason.

`tests/fixtures/practice-decisions-v11.json` is the legacy (pre-agenda) database; the
v12 one is its migrated output plus the scheduling state a v12 build writes.
`practice-information-v12.json` is a full backup — attachment bytes included — carrying
every retired field, and `practice-information-v13.json` is its `validateDB` output, so
the retirement is asserted against real bytes rather than a hand-written expectation. The
unit tests read the SAME bytes the journeys import, through Vite's `?raw`.

**Six journeys now, not two**, all through the same harness — plus the rendered
cold-start recovery inside `src/domain/io.test.ts`, which drives the real `App` in the
same way. The two named above, plus
`practice-information.browser.test.ts`, `practice-information-inbound.browser.test.ts`,
`review-ownership.browser.test.ts` and `practice-information-layout.browser.test.ts` (the
two-engine one). The inbound journey drives the REAL sync orchestrators against a fake
GitHub installed at the `fetch` boundary (`page.route('https://api.github.com/**')`) — the
real transport, real `syncNow`/`resolveConflict`/`restorePreSyncArchive`, no live writes —
and the rollback journey stands up a DISPOSABLE checkout of the baseline commit
(`git worktree add --detach`, `node_modules` symlinked, served by a second Vite server via
`openPracticeApp`'s `root` option) so "the old app refuses the new file" is proved against
the app that actually wrote the backup, not a description of it.

## Roadmap items are allowed (they were designed for)

Audio recording attachment, PWA offline install, CSV export, calendar reminders, a
simple audio note per block, teacher‑sharing PDF. These extend the tool without breaking
the philosophy. Anything that contradicts the "do nots" above needs an explicit decision
from the user, recorded here.
```

### docs/setar-archive.md

````
# The Setar archive: scanner, index and refresh

How the normalised Setar class archive becomes historical lessons, canonical
repertoire items and useful practice material — and exactly how the unattended
part of it is installed, run and rolled back.

Nothing here writes to the archive. Ever.

---

## 1. The shape of it

```
NAS (read-only)                     GitHub (private data repo)        App
┌────────────────────────┐          ┌───────────────────────┐        ┌──────────────┐
│ setar-classes/         │  scan    │ branch: source-index  │  GET   │ Refresh      │
│   session-N-DD-MM-YYYY │ ───────▶ │   setar/index.json    │ ─────▶ │ Setar archive│
│   PIECES.csv           │ publish  └───────────────────────┘        └──────────────┘
│   RENAME-LOG.csv       │                     ▲                            │
└────────────────────────┘                     │                            ▼
         ▲                            branch: main (app data)     one validated
         │ media, opened directly              UNTOUCHED           store mutation
         └──────────────────────────────────────────────────────────────┘
```

Three separations do the work:

- **The app never parses a filename.** The grammar lives once, in the scanner.
- **The index is on its OWN branch.** The app's sync writes `main`'s whole tree
  with no `base_tree`, so a sidecar next to `state.json` would disappear on the
  next sync. `source-index` is outside that, and outside `archive/…` recovery
  branches too.
- **Media never travels.** Only paths do. Each device resolves them through its
  own base URL, so changing the transport rewrites no stored record.

---

## 2. The scanner

`scripts/scan-setar-classes.mjs` — Node stdlib only, no dependencies, read-only
over the archive.

```sh
node scripts/scan-setar-classes.mjs --root /volume1/media/setar-classes --out /volume1/practice-compass-index/setar-index.json
node scripts/scan-setar-classes.mjs --root <archive>            # to stdout
```

It reads `PIECES.csv` (the canonical registry) with a real quoting-aware CSV
parser, walks the `session-N-DD-MM-YYYY` folders, applies the filename grammar
from the archive's own `CRAWLER-BRIEF.md`, and emits a **clock-free** JSON index
with a `contentHash` over its semantic body. The same archive always produces
byte-identical output: no mtimes, no directory-order luck, no `generatedAt`.

What it refuses outright (and produces no index for): a malformed or ambiguous
registry, a duplicate canonical key, two folders claiming one session number, an
unsafe path, more than 5000 files, **any input that changed during the scan** —
the registry, the rename log or the media inventory, all three read twice and
compared, sizes included, so a file still being copied is caught too. That is a
CONSISTENCY check, not atomicity: a perturbation that is stable across both
readings agrees with itself, and from here is indistinguishable from the archive
genuinely being in that state. What it removes is the transient — which is what a
copy in flight looks like, and what would otherwise publish an index missing a
file that is still there.

A READ FAILURE IS NOT AN OBSERVATION. `PIECES.csv` is required, so anything that
stops it being read — missing, unreadable, a directory where a file should be —
refuses the scan. `RENAME-LOG.csv` is optional, and "absent" means ENOENT and
nothing else: it travels in the compared reading as `{present:false}`, never as
empty text, because `catch { text = '' }` made a permission change or an I/O
error agree with itself across both readings and publish an index with no
renames at all. A present but EMPTY log is refused like an empty registry — a
zero-byte file is what a copy in flight looks like.

Each file's `mtimeMs` is part of the compared reading and is never read by the
index builder, so a file edited IN PLACE at the same byte length fails the scan
while altered mtimes still produce a byte-identical index.

What it reports and skips: a file with no known role, an unknown piece, an
unsupported extension, a class recording claiming a piece, an unnamed demo in a
session whose roster and filenames disagree, a symbolic link (never followed —
but never silently dropped either, since two readings agree about a file neither
of them looked at), a session-named entry that is not a real directory, and
every rename row whose destination this log does not determine. That is ONE
rule, not two: a replacement name is published only where the log names it
UNIQUELY and TERMINALLY. A loop names no file; a path the log gives TWO
destinations names no file either; and a chain walking into either of those
cannot say where it ended. Every such row is dropped with a diagnostic rather
than published — the fork case used to publish its FIRST destination and
diagnose the second as "not applied", which handed the app an identity this log
cannot support. An ordinary chain beside a loop or a fork still publishes.
Dotfiles, `@eaDir` and out-of-scope root folders stay silent: they are not
archive content.

The output is written **outside the archive** via a temp file + rename, and the
scanner refuses an `--out` path inside `--root`.

### Corpus baseline

Verified directly against the real archive on 2026‑09‑17:

| | |
|---|---|
| sessions | 39 |
| files in session folders | 258 |
| parseable | 257 |
| known exception | 1 (`session-16-26-11-2024/video-2024-10-29-15-32-35.mp4`) |
| canonical pieces | 94 |
| personal recordings (`تمرین-من`) | 125 |
| useful resources | 132 (45 class · 57 demo clips · 24 notation · 6 corrections) |
| logical demonstrations | 37 |
| rename-log rows | 257 |

Source hashes (sha256), so a changed input is visible rather than assumed:

```
PIECES.csv        1f68366e32f0f5ddc8b8db0c1027893b724e16d496f0dca0502fa0a0cd133524
RENAME-PLAN.csv   795faf11c1538e69905e245e9c45d0b13ebcd3469a1b18a2db097786e576b39c
RENAME-LOG.csv    0c276d5e50fc93904ecfb76c71b1c78dca1cda2610f1569f28c9828013278373
CRAWLER-BRIEF.md  ee76dbc17351fdcc33662b7c467652f5b90728005ef48071bdb35bcf8843a9bc
sorted path inventory (LF-joined, trailing newline)
                  0286b07549ad55b0f84166dc2c7b8c2d5949f96a282f03ebaa5837ebf5b22ae7
```

These are evidence of one corpus, not a limit: sessions 40+ need no code change.

---

## 3. The publisher

`scripts/publish-setar-index.mjs` writes **one file on one branch**:
`source-index` / `setar/index.json`. Both are fixed in the code, and every other
target is refused before a request is made.

- **Unchanged content makes no commit.** The index is clock-free, so identical
  bytes mean an identical archive.
- The branch ref advances **non-force** from the commit that was read, with
  `expected_head_sha`, so a racing publisher loses the update rather than
  overwriting it; the retry re-reads before deciding anything.
- An interruption before the ref advances leaves the previous index published —
  a blob and a commit nothing points at are invisible.
- Error messages are built from the HTTP status and the endpoint name only.
  **No token, no repository URL and no archive path ever reaches a log.**

### The credential

A GitHub token scoped to **this one private repository**, with **Contents:
write** and **Metadata: read**, and no workflow or admin permission.

> GitHub does not issue branch-scoped tokens. The branch and path restriction is
> a property of *this code* (and, optionally, of repository rules). It must not
> be described as credential isolation.

It lives in the NAS runtime's own protected configuration file and nowhere
else — never in the archive, the app, a backup, sync, a commit or a log line.
The app's own GitHub connection (Settings → Sync) is a *different* credential and
is used here for **GETs only**.

---

## 4. Installing the unattended job on the NAS

The production host is the Synology NAS, not the Mac. The Mac can run the same
two scripts by hand; that is the development fallback, not the deployment.

1. **Runtime.** Install a supported Node runtime (Package Center → Node.js).
   Record the actual binary path — `which node` under the task's own shell — and
   set `PC_NODE` if it is not on `PATH`.
2. **Directories.** Create a runtime/output directory *outside* the archive,
   e.g. `/volume1/practice-compass-index/`, owned by a non-admin service user.
   Copy `scripts/scan-setar-classes.mjs`, `scripts/publish-setar-index.mjs` and
   `scripts/run-setar-index.sh` into it.
3. **Permissions.** Give that user **read-only** access to the archive share and
   read/write to the runtime directory only.
4. **Configuration.** Create `config.env` in the runtime directory, `chmod 600`:

   ```sh
   PC_ARCHIVE_ROOT=/volume1/<share>/setar-classes   # the REAL mount, not /Volumes/…
   PC_INDEX_REPO=<owner>/practice-compass-data
   PC_INDEX_TOKEN=<the publisher token>
   ```

   The real internal mount path is discovered during installation. **Do not
   assume the Mac's `/Volumes/...` path exists on DSM.**
5. **Schedule.** DSM → Control Panel → Task Scheduler → Create → Scheduled Task
   → User-defined script. Run as the service user, every **15 minutes**, command:

   ```sh
   sh /volume1/practice-compass-index/run-setar-index.sh
   ```

   Enable "Send run details by email" only on error: the script prints counts and
   a truncated commit id, never a secret.
6. **Verify.** Run the task once by hand and confirm: a commit on `source-index`,
   `main` unchanged (`git log --oneline main` has no new entry), and the app's
   Refresh finding the new index. Then confirm an **unattended** run with the Mac
   off.

### What has been exercised, and what only the owner can

`run-setar-index.sh` was run end to end on the Mac against the real archive with a
deliberately invalid `PC_INDEX_TOKEN` (2026‑09‑17). It scanned the live corpus to the same
content hash as every other run (`924125427f61`), wrote `setar-index.json` into the runtime
directory, failed the publish with `GitHub refused the branch reference (HTTP 401)`, exited
non-zero so a scheduler reports it, and left the archive byte-for-byte untouched. The
output contains **no token, no repository name, no API URL and no archive path** — checked,
not assumed.

What that cannot prove, and what the OWNER has to confirm on the NAS itself: the real
internal mount path, the DSM Node runtime, the service user's read-only permissions, the
scheduled task firing unattended with the Mac off, a real publish landing on `source-index`
with `main` unchanged, and the behaviour when the token is revoked.

### Rollback

Disable the scheduled task. The app keeps the source graph it last accepted and
goes on working offline from it. To go back to an earlier index,
`git push --force-with-lease` an earlier `source-index` commit. Neither touches
the app's own data on `main`. Revoking the token stops publication and leaves the
last good index exactly where it is.

---

## 5. What the app does with it

**Refresh Setar archive** (Settings, reachable from Lessons) fetches the branch
ref, then the file **at that commit**, validates it, shows what would change, and
applies the lot in one store mutation.

- **Refresh means "the latest published index", not "rescan the NAS now."** The
  UI says when the index was last *fetched* and last *changed*. It never says
  "last scanned", because nothing here can know that.
- **Exact source binding wins.** A record already bound to a source identity *is*
  that entity, whatever its title or date has since been edited to.
- A legacy class is auto-adopted only on **instrument + date + number + exact
  source-path evidence**. Date alone, number alone or title alone cannot merge.
- An exact title or literal alias match produces **Link / Create separately /
  Skip** — never an automatic merge, and never "pick the first candidate".
- New pieces arrive **resting**, by explicit import policy, so ninety-four items
  do not flood Today. They stay searchable and directly startable.
- **Nothing about practice is ever seeded**: no minutes, no result, no review
  date, no SM‑2 state. An imported class is history even when its date is in the
  future relative to this device's clock.
- Deleting, unlinking or hiding records a narrowly scoped **suppression** in the
  same mutation, so a refresh, a reload and a sync all respect it. A hide follows
  its file through the rename log, so a renamed resource does not reappear —
  including when the rename moves it into a different session's folder, where
  the old row is dropped rather than reported missing. A rename LOOP names no
  file, so a hide stays exactly where you put it and nothing is re-keyed.
- **A decision is about the state you saw, and about the record you saw it on.**
  If the value you chose the archive's over has changed since — or the record you
  chose to link or apply a field to has been deleted, bound elsewhere or moved
  instrument — the commit refuses and re-previews rather than applying an answer
  to a question that no longer stands, or handing it to some other record.
- **Every file on a class has exactly one section.** The archive's own session
  material is composed for you (an imported class keeps no copy of it, so nothing
  else can show it); your own links and attachments stay in the sections that can
  edit and remove them, and are never repeated above. An imported class recording
  counts as a recording, so you are not invited to add the video already playing.
- **Your media base is an address and a folder.** A base carrying a username,
  password, `?query` or `#fragment` is refused, not silently cleaned up: every
  file URL is built by appending a path to it.

The owner's own `تمرین-من` recordings are evidence, not material: their
membership and role survive in the graph, the files themselves never become a
piece's material.

### Open the app over HTTPS, or Refresh cannot verify anything

Refresh recomputes the index's `contentHash` before trusting a byte of it, and
that needs `crypto.subtle`, which **browsers expose only in a secure context**.
Open the app over plain `http://` at a LAN address and `crypto` is still there
while `crypto.subtle` is not, so Refresh — and **Sync now**, which hashes the
whole database through the same function — both refuse.

Measured on this network, 2026‑09‑18:

| Origin | `isSecureContext` | `crypto.subtle` |
| --- | --- | --- |
| `http://192.168.0.113:4173/` (Mac LAN preview) | `false` | absent |
| `https://192.168.0.20:5010/` (NAS, self-signed) | `true` | present |
| `http://localhost:4173/` | `true` | present |
| GitHub Pages (production) | `true` | present |

So: **production and the installed iPhone PWA are unaffected** — both are HTTPS.
Only a branch build served from a LAN address over plain HTTP hits this, and the
fix is the route, not a setting:

- **On the Mac — verified.** `http://localhost:4173` is already a secure context;
  browsers privilege localhost on purpose, which is also why no automated check
  in this repo can ever see this failure.
- **For a phone — candidate route, NOT yet verified end to end.** Mirror the build
  to the NAS (`npm run deploy`) and open it over `https://192.168.0.20/practice-compass/`.
  What is measured: that origin is HTTPS and therefore a secure context, and a
  self-signed Synology certificate does not change that — accept the browser
  warning once. What is NOT measured: the mirror itself. On 2026‑09‑18 that URL
  answered **403**, and `deploy-nas.sh`'s target share (`/Volumes/web`) was not
  mounted on the Mac, so the build behind it is stale or absent and the script had
  no destination. Mount the share, run `npm run deploy`, and confirm the page loads
  and reports `window.isSecureContext === true` before treating this route as good.
  Per ac-19's own rule, record the NAS mapping you actually find rather than
  assuming a `/Volumes` path works.

Refresh says this in as many words rather than crashing, and it says it before it
looks at the file at all — on a device that cannot hash, no index can pass, and a
file-shaped error would send you to republish an index that is perfectly good.

---

## 6. Notes for whoever changes this next

- **`scripts/setar-index.test.mjs` is deliberately absent.** Vitest's `include`
  is `src/**/*.test.ts` and `tests/**/*.test.ts` (and `vite.config.ts` is a
  forbidden path in the lane that built this), so a test file under `scripts/`
  would never run. The scanner and publisher are tested from
  `src/domain/scanSetarClasses.test.ts` and `src/store/archiveIndex.test.ts`,
  which import the `.mjs` modules directly.
- **`src/domain/sourceArchive.test.ts` is deliberately absent too.** The decoder, the
  deterministic ids, the suppression queries and `validateArchiveSources` are all exercised
  where they are actually used — `scanSetarClasses.test.ts` (the grammar that feeds it),
  `io.test.ts` (the validation boundary every door runs), `sourceReconcile.test.ts` and
  `archiveIndex.test.ts` (the store). A fourth file asserting the same functions in
  isolation would add a place to forget, not a place to look.
- **`src/domain/setarClasses.ts` is frozen.** It is no longer a workflow; it is
  the ledger of the 67 obsolete paths the old bundled importer wrote, and the
  reference-repair check runs against all 67 of them.
- `npm test` must never need the NAS, the Sandisk drive or the network. The
  checked-in fixture `tests/fixtures/setar-archive.json` is the real corpus with
  registry notes trimmed to their first sentence.
````

### src/domain/sourceArchive.ts

```
import type { ID, ISODate, ISODateTime, LessonRecording, PracticeDB } from './types';
import { canonicalStringify, sha256Hex } from './canonical';

// ---------------------------------------------------------------------------
// The Setar class archive as the APP sees it.
//
// The app never parses a filename. A read-only scanner (scripts/scan-setar-
// classes.mjs) publishes a deterministic JSON index; everything here decodes
// that index, keeps the accepted graph, and answers questions about it.
//
// Pure: no React, no clock, no network. The decoder is a TRUST BOUNDARY — it
// refuses what it cannot vouch for rather than coercing it, because every
// identity downstream (which lesson, which piece, which file) is taken from
// this data verbatim.
// ---------------------------------------------------------------------------

export const INDEX_FORMAT = 'setar-archive-index';
export const INDEX_VERSION = 1;
/** The one archive this lane knows. Tar/Guitar do not share this grammar. */
export const SETAR_ARCHIVE_ID = 'setar-classes';

/** A published index larger than this is refused rather than parsed. */
export const MAX_INDEX_BYTES = 4 * 1024 * 1024;

// --- the published index ---------------------------------------------------

export interface SourcePiece {
  /** `canonical_fa` — the BYTE-EXACT join key. Never folded or transliterated. */
  key: string;
  form: string;
  piece: string;
  dastgah: string;
  composer: string;
  /** Literal historical spellings, for SEARCH only — never for identity. */
  aliases: string[];
  sessions: number[];
  notes: string;
  provisional?: boolean;
  mediumConfidence?: boolean;
  /** The source no longer describes this piece; its provenance is kept. */
  unavailable?: boolean;
}

export type SourceRole = string;
export type SourceKind = 'video' | 'score' | 'photo';

export interface SourceResource {
  /** Archive-RELATIVE path. Never an absolute URL: transport is per device. */
  path: string;
  role: SourceRole;
  kind: SourceKind;
  title: string;
  part?: number | null;
  size?: number;
  /** Canonical piece keys this resource is material for. Empty = lesson-level. */
  pieces: string[];
  /** Parts of ONE logical demonstration share a group. */
  group?: string | null;
  unavailable?: boolean;
}

export interface SourceMember {
  key: string;
  roles: SourceRole[];
}

export interface SourceSession {
  n: number;
  date: ISODate;
  folder: string;
  roster: string[];
  rosterTrusted: boolean;
  hasClassRecording: boolean;
  resources: SourceResource[];
  members: SourceMember[];
  unavailable?: boolean;
}

export interface SourceRename {
  from: string;
  to: string;
}

export interface SourceDiagnostic {
  path: string;
  reason: string;
}

export interface SourceIndex {
  format: typeof INDEX_FORMAT;
  version: number;
  archiveId: string;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  contentHash: string;
}

// --- what the database keeps ----------------------------------------------

/** An owner decision that a refresh, a reload and a sync must all respect. */
export interface SourceSuppression {
  /** `piece` / `session` / `resource` (a hidden file), `link` (item-to-lesson). */
  kind: 'piece' | 'session' | 'resource' | 'link';
  /** Piece key, session number, resource path, or `sessionN:pieceKey`. */
  ref: string;
  /** A resource hidden on ONE item only — never on its siblings. */
  itemId?: ID;
  at: ISODateTime;
}

/**
 * The last accepted source graph, persisted so material, provenance and the
 * next refresh all work offline. One row per archive; items and lessons carry
 * only a KEY into it, so a resource is never copied per item.
 */
export interface ArchiveSource {
  id: ID;
  instrumentId: ID;
  indexHash: string;
  acceptedAt: ISODateTime;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  suppressions: SourceSuppression[];
}

/** An item's binding to a canonical piece in an archive. */
export interface ItemSourceRef {
  archiveId: ID;
  pieceKey: string;
}

/** A lesson's binding to one archive session. */
export interface LessonSourceRef {
  archiveId: ID;
  sessionN: number;
}

// --- path safety -----------------------------------------------------------

/**
 * An archive path is a relative POSIX path of plain segments. Traversal,
 * absolute paths, backslashes, URL schemes, credentials and percent-encoded
 * separators are REFUSED, never sanitised: a rewritten path names a different
 * file, and this graph is an identity table.
 *
 * Deliberately a small copy of the scanner's own predicate rather than an
 * import — `scripts/` is a Node operator tool that must not be pulled into the
 * browser bundle, and this rule is eight lines.
 */
export function isSafeSourcePath(p: unknown): p is string {
  if (typeof p !== 'string' || !p) return false;
  if (p.length > 1024) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
  if (p.startsWith('/') || p.includes('\\')) return false;
  if (/%2f|%5c/i.test(p)) return false;
  if (p.includes('@')) return false; // no user:pass@host smuggled in
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
}

// --- deterministic identity ------------------------------------------------

const NUL = String.fromCharCode(0);

/**
 * FNV-1a over the UTF-8 bytes, twice, for a stable 64-bit hex digest. Two
 * devices importing the same source must MINT THE SAME ID for the same logical
 * entity, or the next sync sees two records for one piece. A readable
 * `src:<archive>:piece:<farsi key>` would be equally deterministic but puts
 * Farsi into every route parameter; this keeps ids ASCII.
 */
function stableHash(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (const byte of bytes) {
    a = Math.imul(a ^ byte, 0x01000193) >>> 0;
    b = Math.imul(b ^ byte, 0x85ebca6b) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

/** Deterministic id for the item a canonical piece becomes. */
export function sourceItemId(archiveId: string, pieceKey: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}piece${NUL}${pieceKey}`)}`;
}

/** Deterministic id for the historical lesson an archive session becomes. */
export function sourceLessonId(archiveId: string, sessionN: number): ID {
  return `src-${stableHash(`${archiveId}${NUL}session${NUL}${sessionN}`)}`;
}

/** Deterministic id for a resource reference minted from the graph. */
export function sourceResourceId(archiveId: string, path: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}asset${NUL}${path}`)}`;
}

// --- decoding --------------------------------------------------------------

/** The fixed role vocabulary, byte-exact from the archive's own contract. */
export const SOURCE_ROLES: readonly string[] = [
  'ضبط-کلاس', // class recording
  'تمرین-من', // my practice
  'تصحیح', // corrected notation
  'تکلیف', // homework
  'جزوه', // handout
  'نمونه', // teacher demonstration
  'نت', // clean notation
];

/**
 * Plain-English names for the archive's own role words, for UI copy only.
 * The Farsi word stays the identity everywhere else — this is a LABEL map,
 * exactly like `ITEM_STATUS_LABELS`, and never a second vocabulary.
 */
export const SOURCE_ROLE_LABELS: Record<string, string> = {
  [SOURCE_ROLES[0]!]: 'class recording',
  [SOURCE_ROLES[1]!]: 'my practice',
  [SOURCE_ROLES[2]!]: 'teacher’s corrections',
  [SOURCE_ROLES[3]!]: 'homework',
  [SOURCE_ROLES[4]!]: 'handout',
  [SOURCE_ROLES[5]!]: 'teacher’s demonstration',
  [SOURCE_ROLES[6]!]: 'notation',
};

export const CLASS_ROLE = SOURCE_ROLES[0];
export const PERSONAL_ROLE = SOURCE_ROLES[1];
export const CORRECTION_ROLE = SOURCE_ROLES[2];
export const DEMO_ROLE = SOURCE_ROLES[5];
export const NOTATION_ROLE = SOURCE_ROLES[6];

const ROLE_SET = new Set<string>(SOURCE_ROLES);
const KIND_SET = new Set<string>(['video', 'score', 'photo']);
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, what: string): string {
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function strList(v: unknown, what: string): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`${what} must be a list of text.`);
  return v as string[];
}

/**
 * ABSENT IS A DEFAULT; PRESENT-AND-WRONG IS A REFUSAL. Never a coercion.
 *
 * The decoder NORMALISES before `checkSourceGraph` runs, so the grammar only
 * ever sees what these produce — which is why `Array.isArray(x) ? x : []` was
 * not a tolerance but a silent erasure: a session whose `resources` arrived as
 * `null` decoded to a session with NO resources, passed the grammar (it is a
 * valid empty list by then) and turned six files into zero. The same held for
 * every scalar: `part: "3"` became `null`, a wrong-typed `size` vanished, and
 * `rosterTrusted: 'yes'` became a boolean the grammar was happy with.
 *
 * These three are that rule in one place, and they throw NAMING the record —
 * the same treatment `validatePracticeText` gives the owner's own words.
 */
function list(v: unknown, what: string): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error(`${what} must be a list.`);
  return v;
}

/**
 * OPTIONAL TEXT. `str(raw.form ?? '')` read ABSENT and PRESENT-AND-NULL as the
 * same thing and quietly produced `''` for both — the very normalisation the
 * list/num/bool rule above exists to stop, left in place for every string
 * field that has a default. A resource `title: null` became an untitled row
 * the grammar was perfectly happy with. Absent is a default; null is a value,
 * and a wrong one.
 */
function text(v: unknown, what: string): string {
  if (v === undefined) return '';
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function num(v: unknown, what: string): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

/** A number that is genuinely a number — no `null`, unlike an optional part. */
function size(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

function bool(v: unknown, what: string, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (typeof v !== 'boolean') throw new Error(`${what} must be true or false.`);
  return v;
}

/** A real calendar day, not merely four-two-two digits ("2026-02-30" is not). */
export function isValidSourceDate(v: unknown): v is ISODate {
  if (typeof v !== 'string') return false;
  const m = DATE_RE.exec(v);
  if (!m) return false;
  const [, y, mo, d] = m;
  const t = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return t.getUTCFullYear() === Number(y) && t.getUTCMonth() === Number(mo) - 1 && t.getUTCDate() === Number(d);
}

/** A real calendar instant — the date-time sibling of {@link isValidSourceDate}. */
export function isValidSourceDateTime(v: unknown): v is ISODateTime {
  if (typeof v !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
  if (!m) return false;
  if (!isValidSourceDate(v.slice(0, 10))) return false;
  return !Number.isNaN(Date.parse(v));
}

/**
 * Validate an unknown published index into a {@link SourceIndex}, or throw with
 * a message the owner can act on.
 *
 * A NEWER version is refused rather than read leniently: a future scanner may
 * mean something different by the same field, and this graph decides which
 * file is which piece.
 */
export function decodeSourceIndex(input: unknown): SourceIndex {
  if (!isRecord(input)) throw new Error('The source index is not a valid object.');
  if (input.format !== INDEX_FORMAT) throw new Error('That file is not a Setar archive index.');
  if (typeof input.version !== 'number' || !Number.isInteger(input.version)) {
    throw new Error('The source index has no usable version.');
  }
  if (input.version > INDEX_VERSION) {
    throw new Error(
      `This index was written by a newer scanner (version ${input.version}) than this app understands (version ${INDEX_VERSION}). Update the app.`,
    );
  }
  if (input.version < INDEX_VERSION) {
    throw new Error(`This index is from an older scanner (version ${input.version}). Re-run the scanner.`);
  }
  const archiveId = str(input.archiveId, 'The index archive id');
  if (!archiveId.trim()) throw new Error('The index archive id is empty.');
  if (typeof input.contentHash !== 'string' || !/^[0-9a-f]{64}$/.test(input.contentHash)) {
    throw new Error('The index carries no usable content hash.');
  }

  if (!Array.isArray(input.pieces)) throw new Error('The index has no piece registry.');
  if (!Array.isArray(input.sessions)) throw new Error('The index has no sessions.');

  const pieces: SourcePiece[] = [];
  const keys = new Set<string>();
  for (const raw of input.pieces) {
    if (!isRecord(raw)) throw new Error('A registry entry is not an object.');
    const key = str(raw.key, 'A registry entry key');
    if (!key.trim()) throw new Error('A registry entry has an empty canonical key.');
    if (keys.has(key)) throw new Error(`Two registry entries share the canonical key "${key}".`);
    keys.add(key);
    const sessions = list(raw.sessions, `Registry entry "${key}" sessions`);
    if (sessions.some((n) => typeof n !== 'number' || !Number.isInteger(n) || n < 1)) {
      throw new Error(`Registry entry "${key}" has an invalid session number.`);
    }
    pieces.push({
      key,
      form: text(raw.form, `Registry entry "${key}" form`),
      piece: text(raw.piece, `Registry entry "${key}" piece`),
      dastgah: text(raw.dastgah, `Registry entry "${key}" dastgah`),
      composer: text(raw.composer, `Registry entry "${key}" composer`),
      aliases: strList(raw.aliases, `Registry entry "${key}" aliases`),
      sessions: sessions as number[],
      notes: text(raw.notes, `Registry entry "${key}" notes`),
      ...(bool(raw.provisional, `Registry entry "${key}" provisional`, false) ? { provisional: true } : {}),
      ...(bool(raw.mediumConfidence, `Registry entry "${key}" confidence`, false) ? { mediumConfidence: true } : {}),
    });
  }

  const sessions: SourceSession[] = [];
  const seenN = new Set<number>();
  const seenPaths = new Set<string>();
  for (const raw of input.sessions) {
    if (!isRecord(raw)) throw new Error('A session entry is not an object.');
    const n = raw.n;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) throw new Error('A session has no usable number.');
    if (seenN.has(n)) throw new Error(`Two entries claim session ${n}.`);
    seenN.add(n);
    if (!isValidSourceDate(raw.date)) throw new Error(`Session ${n} has an unreadable date.`);
    const folder = str(raw.folder, `Session ${n} folder`);
    if (!isSafeSourcePath(folder)) throw new Error(`Session ${n} has an unsafe folder path.`);
    const roster = strList(raw.roster, `Session ${n} roster`);
    for (const k of roster) {
      if (!keys.has(k)) throw new Error(`Session ${n} lists piece "${k}", which is not in the registry.`);
    }
    const resources: SourceResource[] = [];
    for (const r of list(raw.resources, `Session ${n} resources`)) {
      if (!isRecord(r)) throw new Error(`Session ${n} has a resource that is not an object.`);
      const path = r.path;
      if (!isSafeSourcePath(path)) throw new Error(`Session ${n} has an unsafe resource path.`);
      if (seenPaths.has(path)) throw new Error(`Two resources share the path "${path}".`);
      seenPaths.add(path);
      const role = str(r.role, 'A resource role');
      if (!ROLE_SET.has(role)) throw new Error(`Resource "${path}" has an unknown role.`);
      const kind = str(r.kind, 'A resource kind');
      if (!KIND_SET.has(kind)) throw new Error(`Resource "${path}" has an unknown kind "${kind}".`);
      const forPieces = strList(r.pieces, `Resource "${path}" pieces`);
      for (const k of forPieces) {
        if (!keys.has(k)) throw new Error(`Resource "${path}" names piece "${k}", which is not in the registry.`);
      }
      resources.push({
        path,
        role,
        kind: kind as SourceKind,
        title: text(r.title, `Resource "${path}" title`),
        part: num(r.part, `Resource "${path}" part`),
        // `part` and `group` are genuinely nullable in the published format —
        // the scanner emits `null` for both — so null stays legal THERE and
        // nowhere else. `size` it always emits as a number, and a present null
        // is refused HERE rather than spread into the output as a value the
        // declared type does not admit and left for the grammar to catch.
        ...(r.size === undefined ? {} : { size: size(r.size, `Resource "${path}" size`) }),
        pieces: forPieces,
        group: r.group === undefined || r.group === null ? null : str(r.group, `Resource "${path}" group`),
      });
    }
    const members: SourceMember[] = [];
    for (const m of list(raw.members, `Session ${n} members`)) {
      if (!isRecord(m)) throw new Error(`Session ${n} has a membership that is not an object.`);
      const key = str(m.key, 'A membership key');
      if (!keys.has(key)) throw new Error(`Session ${n} claims piece "${key}", which is not in the registry.`);
      const roles = strList(m.roles, `Membership "${key}" roles`);
      for (const role of roles) if (!ROLE_SET.has(role)) throw new Error(`Membership "${key}" has an unknown role.`);
      members.push({ key, roles });
    }
    sessions.push({
      n,
      date: raw.date as ISODate,
      folder,
      roster,
      rosterTrusted: bool(raw.rosterTrusted, `Session ${n} roster trust`, true),
      hasClassRecording: bool(raw.hasClassRecording, `Session ${n} class recording`, false),
      resources,
      members,
    });
  }

  const renames: SourceRename[] = [];
  const froms = new Set<string>();
  for (const r of list(input.renames, 'The rename log')) {
    if (!isRecord(r)) throw new Error('A rename entry is not an object.');
    if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) throw new Error('A rename entry carries an unsafe path.');
    if (froms.has(r.from)) throw new Error(`The index maps "${r.from}" to more than one destination.`);
    froms.add(r.from);
    renames.push({ from: r.from, to: r.to });
  }

  const diagnostics: SourceDiagnostic[] = [];
  for (const d of list(input.diagnostics, 'The diagnostic list')) {
    if (!isRecord(d)) throw new Error('A diagnostic entry is not an object.');
    diagnostics.push({
      path: text(d.path, 'A diagnostic path'),
      reason: text(d.reason, 'A diagnostic reason'),
    });
  }

  // The decoder's own normalisation, held to the SAME grammar the persisted
  // graph is held to. Every field below has just been built here, so this can
  // only fail if the two ever drift — which is exactly what it exists to stop.
  const bad = checkSourceGraph({ pieces, sessions, renames, diagnostics }, 'The source index');
  if (bad) throw new Error(bad);

  return {
    format: INDEX_FORMAT,
    version: INDEX_VERSION,
    archiveId,
    pieces,
    sessions,
    renames,
    diagnostics,
    contentHash: input.contentHash,
  };
}

/**
 * The message a device that cannot hash anything gets, instead of a TypeError.
 *
 * Exported so the reader boundary and its test name ONE string rather than two
 * copies of a sentence that must stay identical.
 */
export const INSECURE_CONTEXT_REFUSAL =
  'This device opened the app over an insecure connection (plain http://), so the browser withholds the ' +
  'cryptography needed to verify the index against its own content hash. Open the app over https:// (or ' +
  'localhost) and refresh again. Nothing was changed.';

/**
 * WebCrypto EXISTS ONLY IN A SECURE CONTEXT, and this app can be opened outside
 * one — a build served from a LAN address over plain http:// is the ordinary way
 * an unmerged branch reaches a phone. There `globalThis.crypto` is present but
 * `crypto.subtle` is `undefined`, so `sha256Hex` threw
 * `Cannot read properties of undefined (reading 'digest')` — a stack trace about
 * a property, handed to the owner in place of the one fact they can act on.
 *
 * This is a precondition of the DEVICE, not a defect in the FILE, which is why
 * it is checked BEFORE the size/JSON/structure order below rather than folded
 * into it: a device that cannot compute a digest cannot verify ANY index, so
 * reporting the first thing that happens to be wrong with the file would send
 * the owner to fix a file that is fine. It is also why this refuses rather than
 * degrading to an unverified read — `contentHash` is the refresh identity, and
 * skipping it is how altered content gets reported "Already current".
 *
 * Deliberately NOT a fallback implementation: the hash is only one of this
 * app's secure-context dependencies (the service worker that makes it work
 * offline is another), so hashing without one would leave the app still broken
 * while implying plain http:// were supported.
 */
function requireDigest(): void {
  if (!globalThis.crypto?.subtle) throw new Error(INSECURE_CONTEXT_REFUSAL);
}

/**
 * The scanner's own digest, recomputed here: SHA-256 over the key-sorted JSON
 * of the SEMANTIC body — everything but `contentHash` and the clock-bearing
 * `generatedAt`. Byte-for-byte the definition in `scripts/scan-setar-classes.mjs`
 * (`contentHash` / `canonicalJson`), and `canonicalStringify` produces exactly
 * that serialisation for JSON-derived data.
 */
async function computeIndexDigest(parsed: Record<string, unknown>): Promise<string> {
  const body = { ...parsed };
  delete body.contentHash;
  delete body.generatedAt;
  return sha256Hex(canonicalStringify(body));
}

/**
 * Read published index TEXT: size, JSON, structure, and finally the DIGEST.
 *
 * `contentHash` is not a checksum the app may take on faith — it is the
 * REFRESH IDENTITY. `planArchiveImport` compares it against the hash already
 * accepted to decide that nothing has changed, so content altered in transit
 * (or in the repository) under a retained old hash would be reported "Already
 * current" and the changed facts silently ignored. Recomputing it here, at the
 * ONE boundary both the GitHub fetch and the file fallback pass through, makes
 * that fail closed instead.
 *
 * `decodeSourceIndex` stays synchronous and digest-free on purpose: it is the
 * STRUCTURAL decoder, and the digest is a transport-integrity concern. Tests
 * that build an index object in memory call it directly and have no transport.
 *
 * Order matters: size → parse → structure → digest, so a structurally broken
 * file reports the error the owner can act on rather than a hash mismatch. The
 * secure-context precondition sits ahead of all four, for the reason
 * `requireDigest` records: it is a fact about the DEVICE, and no file can pass
 * on a device that cannot hash.
 */
export async function parseSourceIndex(text: string): Promise<SourceIndex> {
  requireDigest();
  if (text.length > MAX_INDEX_BYTES) throw new Error('That index file is too large to be a Setar archive index.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const index = decodeSourceIndex(parsed);
  const actual = await computeIndexDigest(parsed as Record<string, unknown>);
  if (actual !== index.contentHash) {
    throw new Error(
      'This index does not match its own content hash — it was altered after the scanner wrote it. Nothing was changed.',
    );
  }
  return index;
}

// --- what counts as an UPCOMING class ---------------------------------------

/**
 * THE one predicate for "is this lesson still ahead of me". Every caller that
 * asks about the next class — the badges, the default question target, the
 * commitment deadline that reaches practice priority — goes through this.
 *
 * A lesson imported from a source archive is a record of a class that ALREADY
 * HAPPENED. Its date can still be in the future relative to this device's
 * clock (the archive runs to September 2026 and a device may be behind it, or
 * the owner may simply be importing early), and a plain `date >= today` then
 * turns thirty-nine pieces of history into thirty-nine deadlines: urgency on
 * items nobody committed to anything, and a question sheet defaulting to a
 * class that is over. `origin: 'archive'` is checked FIRST, before the date,
 * because no date can make history upcoming.
 */
export function isUpcomingLesson(lesson: { date: ISODate; origin?: string }, todayISO: ISODate): boolean {
  if (lesson.origin === 'archive') return false;
  return lesson.date >= todayISO;
}

// --- queries over the accepted graph ---------------------------------------

export function archiveFor(db: PracticeDB, archiveId: string): ArchiveSource | undefined {
  return db.archiveSources?.find((a) => a.id === archiveId);
}

function suppressed(source: ArchiveSource, kind: SourceSuppression['kind'], ref: string, itemId?: ID): boolean {
  return source.suppressions.some(
    (s) => s.kind === kind && s.ref === ref && (s.itemId === undefined || s.itemId === itemId),
  );
}

/** Sessions a canonical piece appears in, numerically ordered. */
export function sessionsForPiece(source: ArchiveSource, pieceKey: string): SourceSession[] {
  return source.sessions.filter((s) => s.members.some((m) => m.key === pieceKey)).sort((a, b) => a.n - b.n);
}

/**
 * Consecutive runs of sessions a piece was practised in. Six sessions in a row
 * is six CLASSES worth of provenance — never six weeks, and never practice
 * this app recorded.
 */
export function repeatChains(source: ArchiveSource, pieceKey: string): number[][] {
  // A REPEAT is the student having been asked to play the piece again: its own
  // practice recording, in consecutive sessions. Membership alone is the wrong
  // input — an unnamed demonstration gives every piece in its session
  // membership, so a chain read from membership would report a repeat nobody
  // was asked for.
  const ns = source.sessions
    .filter((s) => s.members.some((m) => m.key === pieceKey && m.roles.includes(PERSONAL_ROLE)))
    .sort((a, b) => a.n - b.n)
    .map((s) => s.n);
  const chains: number[][] = [];
  for (const n of ns) {
    const last = chains[chains.length - 1];
    if (last && last[last.length - 1] === n - 1) last.push(n);
    else chains.push([n]);
  }
  return chains.filter((c) => c.length > 1);
}

export interface ScopedResource extends SourceResource {
  sessionN: number;
  sessionDate: ISODate;
}

/**
 * Every archive resource that is USEFUL PRACTICE MATERIAL for one piece, in
 * session order. A class recording stays with its lesson, a resource the owner
 * hid on THIS item is dropped for this item only, and a suppressed session or
 * piece contributes nothing.
 */
export function resourcesForPiece(source: ArchiveSource, pieceKey: string, itemId?: ID): ScopedResource[] {
  if (suppressed(source, 'piece', pieceKey)) return [];
  const out: ScopedResource[] = [];
  for (const s of sessionsForPiece(source, pieceKey)) {
    if (suppressed(source, 'session', String(s.n))) continue;
    for (const r of s.resources) {
      if (!r.pieces.includes(pieceKey)) continue;
      if (suppressed(source, 'resource', r.path, itemId)) continue;
      out.push({ ...r, sessionN: s.n, sessionDate: s.date });
    }
  }
  return out;
}

/** Everything an archive session contributes to its own lesson, in role order. */
export function resourcesForSession(source: ArchiveSource, sessionN: number): SourceResource[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.resources.filter((r) => !suppressed(source, 'resource', r.path));
}

/** Turn a graph resource into the app's ordinary NAS reference shape. */
export function resourceReference(archiveId: string, r: SourceResource, date?: ISODate): LessonRecording {
  return {
    id: sourceResourceId(archiveId, r.path),
    title: r.title,
    path: r.path,
    kind: r.kind === 'video' ? 'video' : r.kind === 'score' ? 'pdf' : 'doc',
    ...(date ? { date } : {}),
    ...(r.size ? { sizeBytes: r.size } : {}),
    createdAt: '1970-01-01T00:00:00.000Z',
  };
}

// --- the graph's own grammar, in ONE place ---------------------------------

/**
 * THE grammar of a source graph — every nested field, one definition.
 *
 * `decodeSourceIndex` and `validateArchiveSources` used to state this
 * separately, and the second stated LESS of it: it checked a resource's path
 * and its part group and then walked straight past `members[].roles`,
 * `piece.aliases`, a resource's `kind`, `title` and `pieces`, a session's
 * `folder` and `roster`, and the rename and diagnostic rows entirely. A
 * database carrying `members[0].roles: null` was therefore accepted and
 * PERSISTED by every inbound door, and the first production reader to touch it
 * — `repeatChains`, doing `m.roles.includes(...)` — threw while rendering
 * material. `planArchiveImport` had the same exposure through
 * `new Set([piece.key, ...piece.aliases])`, which throws on a non-iterable.
 *
 * Both callers run THIS function now, so the decoder and the persisted-graph
 * validator cannot drift apart again: a reader may dereference any field this
 * grammar admits, and nothing else can reach the database.
 *
 * `unavailable` stays legal on a piece, a session and a resource — a file gone
 * from the NAS with its provenance kept is a VALID state, not a broken graph.
 */
function checkSourceGraph(
  graph: { pieces: unknown; sessions: unknown; renames?: unknown; diagnostics?: unknown },
  label: string,
): string | null {
  const text = (v: unknown) => typeof v === 'string';
  const textList = (v: unknown) => Array.isArray(v) && v.every(text);
  const flag = (v: unknown) => v === undefined || typeof v === 'boolean';

  if (!Array.isArray(graph.pieces)) return `${label} has no piece registry.`;
  if (!Array.isArray(graph.sessions)) return `${label} has no sessions.`;

  const keys = new Set<string>();
  for (const raw of graph.pieces) {
    if (!isRecord(raw)) return `${label} has a registry entry that is not an object.`;
    const p = raw as Partial<SourcePiece>;
    if (typeof p.key !== 'string' || !p.key) return `${label} has a piece with no canonical key.`;
    if (keys.has(p.key)) return `${label} has two pieces keyed "${p.key}".`;
    keys.add(p.key);
    for (const field of ['form', 'piece', 'dastgah', 'composer', 'notes'] as const) {
      if (!text(p[field])) return `Piece "${p.key}" has an unreadable ${field}.`;
    }
    // SEARCH data, read as `[...piece.aliases]` by the reconciler: a value
    // that is not a list of text takes the whole refresh down with a TypeError.
    if (!textList(p.aliases)) return `Piece "${p.key}" has an unreadable alias list.`;
    if (!Array.isArray(p.sessions) || p.sessions.some((n) => !Number.isInteger(n) || (n as number) < 1)) {
      return `Piece "${p.key}" has an invalid session number.`;
    }
    if (!flag(p.provisional) || !flag(p.mediumConfidence) || !flag(p.unavailable)) {
      return `Piece "${p.key}" has an unreadable flag.`;
    }
  }

  const ns = new Set<number>();
  const paths = new Set<string>();
  for (const raw of graph.sessions) {
    if (!isRecord(raw)) return `${label} has a session entry that is not an object.`;
    const sess = raw as Partial<SourceSession>;
    if (typeof sess.n !== 'number' || !Number.isInteger(sess.n) || sess.n < 1) {
      return `${label} has a session with no number.`;
    }
    if (ns.has(sess.n)) return `${label} has two entries for session ${sess.n}.`;
    ns.add(sess.n);
    if (!isValidSourceDate(sess.date)) return `${label} session ${sess.n} has an unreadable date.`;
    if (!isSafeSourcePath(sess.folder)) return `${label} session ${sess.n} has an unsafe folder path.`;
    if (!textList(sess.roster)) return `${label} session ${sess.n} has an unreadable roster.`;
    for (const k of sess.roster as string[]) {
      if (!keys.has(k)) return `${label} session ${sess.n} lists piece "${k}", which it does not describe.`;
    }
    if (typeof sess.rosterTrusted !== 'boolean' || typeof sess.hasClassRecording !== 'boolean' || !flag(sess.unavailable)) {
      return `${label} session ${sess.n} has an unreadable flag.`;
    }

    if (!Array.isArray(sess.resources)) return `${label} session ${sess.n} has no resource list.`;
    for (const rawRes of sess.resources) {
      if (!isRecord(rawRes)) return `${label} session ${sess.n} has a resource that is not an object.`;
      const r = rawRes as Partial<SourceResource>;
      if (!isSafeSourcePath(r.path)) return `${label} has an unsafe resource path.`;
      if (paths.has(r.path)) return `${label} lists "${r.path}" twice.`;
      paths.add(r.path);
      if (typeof r.role !== 'string' || !ROLE_SET.has(r.role)) return `Resource "${r.path}" has an unknown role.`;
      if (typeof r.kind !== 'string' || !KIND_SET.has(r.kind)) return `Resource "${r.path}" has an unknown kind.`;
      if (!text(r.title)) return `Resource "${r.path}" has an unreadable title.`;
      if (!(r.part === null || r.part === undefined || typeof r.part === 'number')) {
        return `Resource "${r.path}" has an unreadable part number.`;
      }
      if (!(r.size === undefined || typeof r.size === 'number')) return `Resource "${r.path}" has an unreadable size.`;
      if (!textList(r.pieces)) return `Resource "${r.path}" has an unreadable piece list.`;
      for (const k of r.pieces as string[]) {
        if (!keys.has(k)) return `Resource "${r.path}" names piece "${k}", which this source does not describe.`;
      }
      // A demonstration's parts form ONE group; anything but a plain label
      // here would let a part claim membership of an arbitrary structure.
      if (!(r.group === null || r.group === undefined || typeof r.group === 'string')) {
        return `Resource "${r.path}" has an invalid part group.`;
      }
      if (!flag(r.unavailable)) return `Resource "${r.path}" has an unreadable flag.`;
    }

    if (!Array.isArray(sess.members)) return `${label} session ${sess.n} has no membership list.`;
    for (const rawMember of sess.members) {
      if (!isRecord(rawMember)) return `${label} session ${sess.n} has a membership that is not an object.`;
      const m = rawMember as Partial<SourceMember>;
      if (typeof m.key !== 'string' || !keys.has(m.key)) {
        return `${label} session ${sess.n} claims an unknown piece.`;
      }
      // `repeatChains` reads `roles.includes(...)` on every one of these.
      if (!textList(m.roles)) return `${label} session ${sess.n} gives piece "${m.key}" an unreadable role list.`;
      for (const role of m.roles as string[]) {
        if (!ROLE_SET.has(role)) return `${label} session ${sess.n} gives piece "${m.key}" an unknown role.`;
      }
    }

    // --- SEMANTIC RELATIONS, not merely field types ------------------------
    //
    // A field-type grammar says every value is READABLE; it says nothing about
    // whether the graph agrees with itself. A resource physically sitting in
    // class 2's folder, listed under class 1, is type-perfect and attributes
    // someone else's file to the wrong lesson on every screen that reads it —
    // and an arbitrary `group` on a non-demonstration invents a logical
    // resource out of unrelated files.
    //
    // Scoped to what the source still DESCRIBES. `unavailable` is retained
    // provenance about what it has STOPPED describing — a piece dropped from
    // the registry, a file deleted from the NAS — so holding those rows to the
    // current source's internal agreement is a category error, and would make
    // every refresh after a removal refuse at every door.
    if (!sess.unavailable) {
      const live = (sess.resources as SourceResource[]).filter((r) => !r.unavailable);
      const rolesFor = new Map<string, Set<string>>();
      for (const m of sess.members as SourceMember[]) rolesFor.set(m.key, new Set(m.roles));
      const groups = new Map<string, SourceResource[]>();
      let classRecordings = 0;
      for (const r of live) {
        const segs = r.path.split('/');
        if (segs.length !== 2 || segs[0] !== sess.folder) {
          return `${label} session ${sess.n} lists "${r.path}", which is not a file in its own folder.`;
        }
        if (r.role === CLASS_ROLE) {
          classRecordings += 1;
          if (r.pieces.length > 0) return `Resource "${r.path}" is a class recording and cannot name a piece.`;
        }
        for (const k of r.pieces) {
          if (!rolesFor.get(k)?.has(r.role)) {
            return `${label} session ${sess.n} gives "${r.path}" to piece "${k}" without recording that membership.`;
          }
        }
        if (r.group !== null && r.group !== undefined) {
          if (r.role !== DEMO_ROLE) return `Resource "${r.path}" carries a part group but is not a demonstration.`;
          groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
        }
      }
      if (classRecordings > 0 !== sess.hasClassRecording) {
        return `${label} session ${sess.n} disagrees with itself about having a class recording.`;
      }
      // Parts of ONE demonstration: the same material, told in order. Parts
      // that are material for different pieces are not one resource, and two
      // parts with one number have no order to be read in.
      for (const [g, parts] of groups) {
        const pieces = [...parts[0]!.pieces].sort().join(NUL);
        const numbers = new Set<number | null>();
        for (const r of parts) {
          if ([...r.pieces].sort().join(NUL) !== pieces) {
            return `${label} session ${sess.n} has a part group "${g}" whose parts belong to different pieces.`;
          }
          const part = r.part ?? null;
          if (numbers.has(part)) return `${label} session ${sess.n} has two parts numbered alike in "${g}".`;
          numbers.add(part);
        }
      }
    }
  }

  if (graph.renames !== undefined) {
    if (!Array.isArray(graph.renames)) return `${label} has an unreadable rename log.`;
    const froms = new Set<string>();
    for (const rawRename of graph.renames) {
      if (!isRecord(rawRename)) return `${label} has a rename entry that is not an object.`;
      const r = rawRename as Partial<SourceRename>;
      if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) return `${label} has a rename with an unsafe path.`;
      if (froms.has(r.from)) return `${label} maps "${r.from}" to more than one destination.`;
      froms.add(r.from);
    }
  }

  if (graph.diagnostics !== undefined) {
    if (!Array.isArray(graph.diagnostics)) return `${label} has an unreadable diagnostic list.`;
    for (const rawDiag of graph.diagnostics) {
      if (!isRecord(rawDiag)) return `${label} has a diagnostic entry that is not an object.`;
      const d = rawDiag as Partial<SourceDiagnostic>;
      if (!text(d.path) || !text(d.reason)) return `${label} has an unreadable diagnostic entry.`;
    }
  }

  return null;
}

// --- inbound validation (C7) -----------------------------------------------

/**
 * The v14 graph, checked at EVERY inbound door through `validateDB`. Invalid
 * structure is REFUSED with the record named, never coerced or dropped: a
 * binding that points at nothing is a claim about which file is which piece,
 * and silently discarding it loses the owner's own reconciliation decisions.
 *
 * A source entity marked `unavailable` is a VALID state (the file is gone from
 * the NAS, its provenance is kept) — not a dangling reference.
 */
export function validateArchiveSources(db: PracticeDB): string | null {
  const sources = db.archiveSources ?? [];
  const ids = new Set<string>();
  const instrumentIds = new Set(db.instruments.map((i) => i.id));
  const byId = new Map<string, ArchiveSource>();

  for (const s of sources) {
    if (typeof s?.id !== 'string' || !s.id.trim()) return 'An archive source has no id.';
    if (ids.has(s.id)) return `Two archive sources share the id "${s.id}".`;
    ids.add(s.id);
    byId.set(s.id, s);
    if (typeof s.instrumentId !== 'string' || !instrumentIds.has(s.instrumentId)) {
      return `Archive source "${s.id}" is bound to an instrument that does not exist.`;
    }
    if (typeof s.indexHash !== 'string') return `Archive source "${s.id}" has no index hash.`;
    // THE RECORD'S OWN FIELDS, not merely its nested graph. `acceptedAt` is
    // read back by Settings (`acceptedAt.slice(0, 16)`) to say when the index
    // last changed, so a non-string here crashes the screen that renders it —
    // and the fix belongs at this door, never as a guard in the component.
    // Checked for REAL validity for the same reason `askedAt` is: a shape
    // regex matches "2026-02-30T12:00:00.000Z" and `Date.parse` silently
    // normalises it into March. Deliberately a local check beside
    // `isValidSourceDate` rather than an import — this file's own pattern.
    if (!isValidSourceDateTime(s.acceptedAt)) return `Archive source "${s.id}" has an unreadable accepted time.`;
    if (!Array.isArray(s.pieces) || !Array.isArray(s.sessions)) return `Archive source "${s.id}" is missing its graph.`;
    // Required AT REST, where `checkSourceGraph` tolerates them absent: the
    // decoder always emits both, and `planArchiveImport` reads
    // `index.renames`/`source.renames` unguarded.
    if (!Array.isArray(s.renames)) return `Archive source "${s.id}" has no rename log.`;
    if (!Array.isArray(s.diagnostics)) return `Archive source "${s.id}" has no diagnostic list.`;
    if (!Array.isArray(s.suppressions)) return `Archive source "${s.id}" has no suppression list.`;

    // THE WHOLE NESTED GRAPH, through the one grammar the decoder also uses.
    const bad = checkSourceGraph(s, `Archive source "${s.id}"`);
    if (bad) return bad;

    for (const sup of s.suppressions) {
      if (!['piece', 'session', 'resource', 'link'].includes(sup?.kind)) {
        return `Archive source "${s.id}" has a suppression of an unknown kind.`;
      }
      if (typeof sup.ref !== 'string' || !sup.ref) return `Archive source "${s.id}" has a suppression with no target.`;
      // An owner decision carries the id it was scoped to and the moment it
      // was taken; both are read back — a resource hidden on ONE item is
      // decided by comparing `itemId`, so a non-string silently widens it.
      if (!(sup.itemId === undefined || (typeof sup.itemId === 'string' && sup.itemId !== ''))) {
        return `Archive source "${s.id}" has a suppression with an unreadable item.`;
      }
      // `at` is provenance only — nothing reads it back as a date — so it is
      // held to being real text and no further.
      if (typeof sup.at !== 'string' || !sup.at) return `Archive source "${s.id}" has a suppression with no timestamp.`;
    }
  }

  // Bindings: exactly one live record per source identity, resolving to a real
  // entity of the right instrument.
  const itemBindings = new Set<string>();
  for (const item of db.items) {
    const ref = item.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.pieceKey !== 'string') {
      return `Item "${item.title}" has an unreadable archive binding.`;
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `Item "${item.title}" is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.pieces.some((p) => p.key === ref.pieceKey)) {
      return `Item "${item.title}" is bound to piece "${ref.pieceKey}", which archive "${ref.archiveId}" does not describe.`;
    }
    if (item.instrumentId !== source.instrumentId) {
      return `Item "${item.title}" is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.pieceKey}`;
    if (itemBindings.has(k)) return `Two items are bound to piece "${ref.pieceKey}".`;
    itemBindings.add(k);
  }

  const lessonBindings = new Set<string>();
  for (const lesson of db.lessons) {
    const ref = lesson.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.sessionN !== 'number') {
      return 'A lesson has an unreadable archive binding.';
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `A lesson is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.sessions.some((s) => s.n === ref.sessionN)) {
      return `A lesson is bound to session ${ref.sessionN}, which archive "${ref.archiveId}" does not describe.`;
    }
    if (lesson.instrumentId !== source.instrumentId) {
      return `A lesson is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.sessionN}`;
    if (lessonBindings.has(k)) return `Two lessons are bound to session ${ref.sessionN}.`;
    lessonBindings.add(k);
  }

  // Manual item references: the same path rules as every other NAS reference.
  for (const item of db.items) {
    for (const r of item.references ?? []) {
      if (typeof r?.path !== 'string' || !r.path.trim()) return `Item "${item.title}" has a reference with no path.`;
      if (!/^https?:\/\//i.test(r.path) && !isSafeSourcePath(r.path)) {
        return `Item "${item.title}" has an unsafe reference path.`;
      }
    }
  }
  return null;
}

/**
 * The canonical pieces an archive session is associated with, honouring an
 * owner's explicit unlink of ONE piece from ONE class.
 *
 * Derived from the graph, never stored on the lesson: a session's membership
 * is a source fact, and copying it into `lesson.itemIds` would make one fact
 * two that can disagree.
 */
export function membersForSession(source: ArchiveSource, sessionN: number): SourceMember[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.members.filter((m) => !suppressed(source, 'link', `${sessionN}:${m.key}`));
}
```

### src/store/archiveIndex.test.ts

```
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — no types for the .mjs operator tool; the decision is pure.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../../scripts/publish-setar-index.mjs';
// @ts-expect-error — the SCANNER's own digest definition, so the app is checked
// against the real producer rather than a restatement of it in the test.
import { contentHash as indexDigest } from '../../scripts/scan-setar-classes.mjs';
import { fetchPublishedIndex, readIndexFile } from './archiveIndex';
import indexFixture from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
import { decodeSourceIndex, INSECURE_CONTEXT_REFUSAL } from '../domain/sourceArchive';
import { validateDB } from '../domain/io';
import { createItem } from '../domain/factories';
import type { PracticeDB } from '../domain/types';

// ---------------------------------------------------------------------------
// The persist storage, CONTROLLABLE per assertion — the same stub io.test.ts
// uses, plus a settle promise this test can reject on demand. A failed
// IndexedDB write is the one thing `commitArchiveImport` must never mistake
// for a success, and it cannot be provoked in a real browser on purpose.
// ---------------------------------------------------------------------------
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  let failNextWrite = false;
  return {
    get: () => value,
    set: (v: string | null) => {
      value = v;
    },
    failNext: () => {
      failNextWrite = true;
    },
    takeFailure: () => {
      const f = failNextWrite;
      failNextWrite = false;
      return f;
    },
  };
});
vi.mock('./idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./idb')>();
  let settle: Promise<void> = Promise.resolve();
  return {
    ...actual,
    // Dexie itself has no IndexedDB to talk to in this environment, and
    // `clearAll` reaches for the blob store. Stubbed so a deliberate erasure
    // does not raise an unhandled rejection that would mask a real one.
    clearBlobs: async () => undefined,
    deleteBlob: async () => undefined,
    allBlobs: async () => [],
    heldBlobIds: async () => new Set<string>(),
    storageSettled: () => settle,
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_name: string, value: string) => {
        if (fakeStorage.takeFailure()) {
          settle = Promise.reject(new Error('the device refused the write'));
          // Mark it handled here so the rejection reaches only the one caller
          // that is waiting on it, exactly as the real adapter does.
          void settle.catch(() => undefined);
          return;
        }
        fakeStorage.set(value);
        settle = Promise.resolve();
      },
      removeItem: async () => fakeStorage.set(null),
    },
  };
});
// Imported AFTER the mock declaration on purpose: the store's persist
// middleware binds its storage at module load.
const { useStore } = await import('./useStore');

// ---------------------------------------------------------------------------
// A fake git repository, small enough to assert against exactly. It records
// EVERY write, so "this publisher cannot touch practice data" is a checked
// property of the calls made, not a claim about intent.
// ---------------------------------------------------------------------------

interface FakeRepo {
  refs: Map<string, string>;
  commits: Map<string, { treeSha: string; parents: string[] }>;
  trees: Map<string, Record<string, string>>;
  blobs: Map<string, string>;
  writes: { kind: string; target: string }[];
  n: number;
}

function newRepo(): FakeRepo {
  const repo: FakeRepo = {
    refs: new Map(),
    commits: new Map(),
    trees: new Map(),
    blobs: new Map(),
    writes: [],
    n: 0,
  };
  // The app's own data branch, exactly as the sync engine leaves it. Nothing in
  // this test may change any of these three.
  const tree = { 'state.json': 'blob-state', 'manifest.json': 'blob-manifest', 'files/a.pdf': 'blob-file' };
  repo.trees.set('tree-main', tree);
  repo.commits.set('commit-main', { treeSha: 'tree-main', parents: [] });
  repo.refs.set('main', 'commit-main');
  repo.refs.set('archive/2026-09-01', 'commit-main');
  return repo;
}

function transportFor(repo: FakeRepo, opts: { failAfterCommit?: boolean; raceOnce?: () => void } = {}) {
  const id = (p: string) => `${p}-${(repo.n += 1)}`;
  return {
    async getRef(branch: string) {
      const sha = repo.refs.get(branch);
      return sha ? { sha } : null;
    },
    async getCommit(sha: string) {
      return { treeSha: repo.commits.get(sha)!.treeSha };
    },
    async getFile(sha: string, path: string) {
      const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
      const blob = tree[path];
      return blob ? { text: repo.blobs.get(blob)! } : null;
    },
    async createBlob(text: string) {
      const sha = id('blob');
      repo.blobs.set(sha, text);
      repo.writes.push({ kind: 'blob', target: sha });
      return sha;
    },
    async createTree({ baseTreeSha, path, blobSha }: { baseTreeSha: string | null; path: string; blobSha: string }) {
      const sha = id('tree');
      repo.trees.set(sha, { ...(baseTreeSha ? repo.trees.get(baseTreeSha) : {}), [path]: blobSha });
      repo.writes.push({ kind: 'tree', target: path });
      return sha;
    },
    async createCommit({ treeSha, parents }: { treeSha: string; parents: string[] }) {
      const sha = id('commit');
      repo.commits.set(sha, { treeSha, parents });
      repo.writes.push({ kind: 'commit', target: treeSha });
      return sha;
    },
    async updateRef(branch: string, sha: string, expectedSha: string) {
      opts.raceOnce?.();
      if (opts.failAfterCommit) throw new Error('network dropped');
      // NON-FORCE: the ref only advances from the commit that was read.
      if (repo.refs.get(branch) !== expectedSha) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
    async createRef(branch: string, sha: string) {
      if (opts.failAfterCommit) throw new Error('network dropped');
      if (repo.refs.has(branch)) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
  };
}

const publishedText = (repo: FakeRepo) => {
  const sha = repo.refs.get(SOURCE_INDEX_BRANCH);
  if (!sha) return null;
  const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
  return repo.blobs.get(tree[INDEX_PATH]) ?? null;
};

// A credential-shaped placeholder — never a real token, and never a
// contiguous 16+ char [A-Za-z0-9_-] run (the space keeps it that way) — used
// only to prove no credential text reaches anything the publisher's output
// touches.
const NEVER_LEAKED_CREDENTIAL = 'publisher credential placeholder';
const ROOT = '/volume1/media/setar-classes';

describe('publishing and reading the source index', () => {
  it('source index publication cannot replace practice data or lose a concurrent update', async () => {
    const repo = newRepo();
    const first = `${JSON.stringify(indexFixture, null, 1)}\n`;

    // --- first publish: creates the branch, main untouched -----------------
    const created = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(created.status).toBe('created');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(created.commit);
    expect(publishedText(repo)).toBe(first);
    expect(repo.refs.get('main')).toBe('commit-main');
    expect(repo.refs.get('archive/2026-09-01')).toBe('commit-main');
    expect(repo.trees.get('tree-main')).toEqual({
      'state.json': 'blob-state',
      'manifest.json': 'blob-manifest',
      'files/a.pdf': 'blob-file',
    });
    // Every ref this publisher advanced, and every path it wrote.
    expect(repo.writes.filter((w) => w.kind === 'ref').map((w) => w.target)).toEqual([SOURCE_INDEX_BRANCH]);
    expect(repo.writes.filter((w) => w.kind === 'tree').map((w) => w.target)).toEqual([INDEX_PATH]);
    expect(repo.writes.some((w) => /state\.json|manifest\.json|^files\//.test(w.target))).toBe(false);

    // --- an identical scan makes NO commit ---------------------------------
    const before = repo.refs.get(SOURCE_INDEX_BRANCH);
    const writesBefore = repo.writes.length;
    const again = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(again.status).toBe('unchanged');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(before);
    expect(repo.writes).toHaveLength(writesBefore);

    // --- a changed scan advances the branch, and only it --------------------
    const changed = `${JSON.stringify({ ...indexFixture, diagnostics: [{ path: 'x', reason: 'y' }] }, null, 1)}\n`;
    const second = await publishIndex({ transport: transportFor(repo), indexText: changed });
    expect(second.status).toBe('published');
    expect(publishedText(repo)).toBe(changed);
    expect(repo.commits.get(second.commit)!.parents).toEqual([before]);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- interrupted BEFORE the ref advances: the old index still stands ----
    const head = repo.refs.get(SOURCE_INDEX_BRANCH);
    const interrupted = `${JSON.stringify({ ...indexFixture, archiveId: 'half-written' }, null, 1)}\n`;
    await expect(
      publishIndex({ transport: transportFor(repo, { failAfterCommit: true }), indexText: interrupted }),
    ).rejects.toThrow(/network dropped/);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(head);
    expect(publishedText(repo)).toBe(changed);

    // --- racing a second publisher: nothing is overwritten ------------------
    // The other publisher lands its own commit between this one's read and its
    // update. Non-force, so this update is refused; the retry re-reads and,
    // because the other publisher wrote exactly what this one has, it settles
    // on "unchanged" rather than clobbering.
    const rival = `${JSON.stringify({ ...indexFixture, archiveId: 'setar-classes' }, null, 1)}\n`;
    let raced = false;
    const race = () => {
      if (raced) return;
      raced = true;
      const blob = 'blob-rival';
      repo.blobs.set(blob, rival);
      repo.trees.set('tree-rival', { [INDEX_PATH]: blob });
      repo.commits.set('commit-rival', { treeSha: 'tree-rival', parents: [repo.refs.get(SOURCE_INDEX_BRANCH)!] });
      repo.refs.set(SOURCE_INDEX_BRANCH, 'commit-rival');
    };
    const afterRace = await publishIndex({ transport: transportFor(repo, { raceOnce: race }), indexText: rival });
    expect(afterRace.status).toBe('unchanged');
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe('commit-rival');
    // A racing publisher with DIFFERENT content gives up rather than force it.
    let always = true;
    const alwaysRace = () => {
      if (!always) return;
      repo.commits.set(`commit-rival-${(repo.n += 1)}`, { treeSha: 'tree-rival', parents: [] });
      repo.refs.set(SOURCE_INDEX_BRANCH, `commit-rival-${repo.n}`);
    };
    await expect(
      publishIndex({ transport: transportFor(repo, { raceOnce: alwaysRace }), indexText: changed }),
    ).rejects.toThrow(/nothing was overwritten/);
    always = false;

    // --- the target is fixed in CODE, not by trusting the caller ------------
    for (const branch of ['main', 'master', 'archive/2026-09-01', 'source-index-2']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, branch })).rejects.toThrow(
        /only writes/,
      );
    }
    for (const path of ['state.json', 'manifest.json', 'files/a.pdf', 'setar/other.json']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, path })).rejects.toThrow(
        /only writes "setar\/index\.json"/,
      );
    }

    // --- the READER pins the file to the branch's own commit ----------------
    const requests: string[] = [];
    const publishedCommit = repo.refs.get(SOURCE_INDEX_BRANCH)!;
    const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      requests.push(href);
      // The reader must never send anything but a GET.
      expect(init?.method ?? 'GET').toBe('GET');
      if (href.includes('/git/ref/heads/')) {
        return new Response(JSON.stringify({ object: { sha: publishedCommit } }), { status: 200 });
      }
      const m = /contents\/(.+)\?ref=(.+)$/.exec(href)!;
      const tree = repo.trees.get(repo.commits.get(m[2])!.treeSha)!;
      const text = repo.blobs.get(tree[decodeURIComponent(m[1])])!;
      return new Response(
        JSON.stringify({ content: Buffer.from(text, 'utf8').toString('base64'), encoding: 'base64', size: text.length }),
        { status: 200 },
      );
    };
    const got = await fetchPublishedIndex({ repo: 'owner/data', token: 'device-token', fetchImpl: fakeFetch as typeof fetch });
    expect(got.ok).toBe(true);
    if (!got.ok) throw new Error(got.error);
    expect(got.value.commitSha).toBe(publishedCommit);
    expect(got.value.index.archiveId).toBe('setar-classes');
    // The content request names the COMMIT, not the branch: a publish landing
    // between the two calls cannot hand back half of one index and half of
    // another.
    expect(requests[1]).toContain(`?ref=${publishedCommit}`);
    expect(requests[1]).not.toContain(SOURCE_INDEX_BRANCH);
    expect(requests.every((r) => r.startsWith('https://api.github.com/'))).toBe(true);

    // --- authentication and network failures change nothing -----------------
    const refuse = async () => new Response('no', { status: 401 });
    const denied = await fetchPublishedIndex({ repo: 'owner/data', token: 'bad', fetchImpl: refuse as typeof fetch });
    expect(denied.ok).toBe(false);
    if (denied.ok) throw new Error('expected refusal');
    expect(denied.error).toMatch(/refused/i);
    const offline = async () => {
      throw new Error('offline');
    };
    const down = await fetchPublishedIndex({ repo: 'owner/data', token: 't', fetchImpl: offline as typeof fetch });
    expect(down.ok).toBe(false);
    if (down.ok) throw new Error('expected refusal');
    expect(down.error).toMatch(/already imported is unaffected/);
    // The published index and the app's data branch are exactly as they were.
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- no credential and no archive root in anything that travels ---------
    const everything = JSON.stringify([
      [...repo.blobs.values()],
      [...repo.trees.values()],
      [...repo.commits.keys()],
      requests,
      denied.error,
      down.error,
    ]);
    expect(everything).not.toContain(NEVER_LEAKED_CREDENTIAL);
    expect(everything).not.toContain(ROOT);
    expect(everything).not.toContain('/Volumes/');

    // The file-import fallback goes through the SAME decoder.
    expect((await readIndexFile(rival)).ok).toBe(true);
    const badFile = await readIndexFile('{"format":"setar-archive-index","version":99}');
    expect(badFile.ok).toBe(false);
    if (badFile.ok) throw new Error('expected refusal');
    expect(badFile.error).toMatch(/newer scanner/);

    // --- THE DECLARED DIGEST IS RECOMPUTED, NOT TAKEN ON FAITH -------------
    // `contentHash` is the REFRESH IDENTITY: `planArchiveImport` compares it
    // against the hash already accepted to conclude that nothing has changed.
    // So content altered under a RETAINED old hash would be reported "Already
    // current" and its changed facts silently ignored. Both doors recompute
    // the scanner's own digest and fail closed.
    const original = JSON.parse(rival) as typeof indexFixture;
    const altered = {
      ...original,
      pieces: original.pieces.map((piece, i) => (i === 0 ? { ...piece, composer: 'somebody-else' } : piece)),
    };
    // The hash it still carries is the one the scanner wrote for the ORIGINAL.
    expect(altered.contentHash).toBe(original.contentHash);
    const alteredText = JSON.stringify(altered);
    const tampered = await readIndexFile(alteredText);
    expect(tampered.ok).toBe(false);
    if (tampered.ok) throw new Error('expected refusal');
    expect(tampered.error).toMatch(/does not match its own content hash/);

    // The GitHub door refuses the identical bytes, through the same boundary.
    const tamperedFetch = async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/git/ref/heads/')) {
        return new Response(JSON.stringify({ object: { sha: publishedCommit } }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          content: Buffer.from(alteredText, 'utf8').toString('base64'),
          encoding: 'base64',
          size: alteredText.length,
        }),
        { status: 200 },
      );
    };
    const fetchedTampered = await fetchPublishedIndex({
      repo: 'owner/data',
      token: 'device-token',
      fetchImpl: tamperedFetch as typeof fetch,
    });
    expect(fetchedTampered.ok).toBe(false);
    if (fetchedTampered.ok) throw new Error('expected refusal');
    expect(fetchedTampered.error).toMatch(/does not match its own content hash/);

    // Re-scanned content — a NEW digest for the new facts — is accepted, so
    // this is an integrity gate and not a freeze on the archive ever changing.
    const rescanned = await readIndexFile(JSON.stringify({ ...altered, contentHash: indexDigest(altered) }));
    expect(rescanned.ok).toBe(true);
    if (!rescanned.ok) throw new Error(rescanned.error);
    expect(rescanned.value.index.pieces[0]!.composer).toBe('somebody-else');
    expect(rescanned.value.index.contentHash).not.toBe(original.contentHash);

    // A STRUCTURALLY broken file still reports the structural error rather
    // than a hash mismatch: the owner can act on the first, never the second.
    const brokenStructure = await readIndexFile(JSON.stringify({ ...original, sessions: 'not a list' }));
    expect(brokenStructure.ok).toBe(false);
    if (brokenStructure.ok) throw new Error('expected refusal');
    expect(brokenStructure.error).toMatch(/no sessions/);

    // --- A WRONG-TYPED FIELD IS REFUSED, NEVER COERCED TO EMPTY ------------
    // A digest proves the file is the one the scanner wrote; it says nothing
    // about the file being well formed. The decoder normalises BEFORE the
    // graph's grammar runs, so `resources: null` decoded to a session with no
    // resources — a perfectly valid empty list by the time the grammar saw it
    // — and six files became zero with a VALID digest on the front. Every
    // absent-tolerant read in the decoder had the same shape.
    const withDigest = (body: Record<string, unknown>) =>
      JSON.stringify({ ...body, contentHash: indexDigest(body) });
    const sessionZero = original.sessions[0]!;
    const erasures: [string, Record<string, unknown>][] = [
      ['must be a list', { ...sessionZero, resources: null }],
      ['must be a list', { ...sessionZero, members: null }],
      ['must be true or false', { ...sessionZero, rosterTrusted: 'yes' }],
      ['must be true or false', { ...sessionZero, hasClassRecording: 1 }],
    ];
    for (const [message, session0] of erasures) {
      const bad = await readIndexFile(
        withDigest({ ...original, sessions: [session0, ...original.sessions.slice(1)] }),
      );
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    const withResource = (over: Record<string, unknown>) => ({
      ...original,
      sessions: [
        { ...sessionZero, resources: [{ ...sessionZero.resources[0]!, ...over }, ...sessionZero.resources.slice(1)] },
        ...original.sessions.slice(1),
      ],
    });
    for (const [message, over] of [
      ['must be a number', { part: '2' }],
      ['must be a number', { size: '10mb' }],
      ['must be text', { group: 42 }],
    ] as [string, Record<string, unknown>][]) {
      const bad = await readIndexFile(withDigest(withResource(over)));
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    for (const [message, over] of [
      ['must be a list', { sessions: null }],
      ['must be true or false', { provisional: 'yes' }],
    ] as [string, Record<string, unknown>][]) {
      const bad = await readIndexFile(
        withDigest({ ...original, pieces: [{ ...original.pieces[0]!, ...over }, ...original.pieces.slice(1)] }),
      );
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    for (const over of [{ renames: null }, { diagnostics: null }]) {
      const bad = await readIndexFile(withDigest({ ...original, ...over }));
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain('must be a list');
    }
    // ABSENT still reads as absent: the tolerance that was correct stays.
    const withoutOptional = { ...(original as Record<string, unknown>) };
    delete withoutOptional.renames;
    delete withoutOptional.diagnostics;
    const lean = await readIndexFile(withDigest(withoutOptional));
    expect(lean.ok).toBe(true);
  });

  // --- THE DEVICE, NOT THE FILE ------------------------------------------
  // Found by OWNER acceptance testing, not by any check here: an unmerged
  // branch reaches a phone as a LAN build over plain http://, and WebCrypto
  // exists only in a SECURE CONTEXT. `globalThis.crypto` is still there, but
  // `crypto.subtle` is `undefined`, so recomputing the index digest threw
  // `Cannot read properties of undefined (reading 'digest')` — handed to the
  // owner as the explanation of their archive. Both doors onto the decoder are
  // checked below: the GitHub refresh, which is the one the UI reaches, and
  // `readIndexFile`, the same decoder behind a fallback nothing wires up yet.
  //
  // Every automated check missed it because every one of them runs where
  // `crypto.subtle` exists: Node has it unconditionally, and the browser
  // journeys are served from localhost, which browsers privilege as secure
  // precisely so that http://localhost development works.
  it('an insecure context refuses by naming itself, not by a property stack trace', async () => {
    const text = JSON.stringify({ ...indexFixture, contentHash: indexDigest(indexFixture as Record<string, unknown>) });
    // The REAL GitHub reply shape for this file: base64 `content`, `encoding`
    // and `size`, exactly as api.github.com answers a contents request.
    const github = async (url: string | URL | Request) =>
      String(url).includes('/git/ref/heads/')
        ? new Response(JSON.stringify({ object: { sha: 'c0ffee'.repeat(6) + 'aa' } }), { status: 200 })
        : new Response(
            JSON.stringify({
              content: Buffer.from(text, 'utf8').toString('base64'),
              encoding: 'base64',
              size: text.length,
            }),
            { status: 200 },
          );
    const refresh = () =>
      fetchPublishedIndex({ repo: 'owner/data', token: 'device-token', fetchImpl: github as typeof fetch });

    // Both paths succeed on THIS device, so nothing below is about the file.
    expect((await refresh()).ok).toBe(true);
    expect((await readIndexFile(text)).ok).toBe(true);

    // An insecure context, exactly as a browser presents one: `crypto` is
    // present and `crypto.subtle` is not.
    const secure = globalThis.crypto;
    vi.stubGlobal('crypto', { getRandomValues: secure.getRandomValues.bind(secure) });
    try {
      expect(globalThis.crypto.subtle).toBeUndefined();
      for (const result of [await refresh(), await readIndexFile(text)]) {
        expect(result.ok).toBe(false);
        if (result.ok) throw new Error('expected refusal');
        // The one fact the owner can act on — and never the shape of the crash.
        expect(result.error).toBe(INSECURE_CONTEXT_REFUSAL);
        expect(result.error).toMatch(/https:\/\//);
        expect(result.error).not.toMatch(/digest|undefined|Cannot read/i);
        // Refusing is not reporting a broken file: the owner must not be sent
        // to republish an index that is perfectly good.
        expect(result.error).not.toMatch(/content hash.*altered|not valid JSON/i);
      }
    } finally {
      vi.unstubAllGlobals();
    }

    // And the refusal was about the device alone: the SAME bytes pass again.
    expect((await refresh()).ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ac-11 — the commit boundary, against the REAL store.
// ---------------------------------------------------------------------------

const INDEX = decodeSourceIndex(indexFixture);
const SETAR = 'inst-setar';
const NOW = new Date('2026-09-17T09:00:00.000Z');

function loadOwnerData(): PracticeDB {
  const db = validateDB(JSON.parse(V13_SETAR_TEXT));
  useStore.setState({ db, active: null, activeRoutine: null, activePlan: null, sessionInstrumentId: SETAR });
  return db;
}

const commit = (decidedFromRev: number) =>
  useStore.getState().commitArchiveImport({ index: INDEX, instrumentId: SETAR, decidedFromRev, now: NOW });

describe('committing an archive import', () => {
  it('archive commits survive interruption and never apply a stale preview', async () => {
    loadOwnerData();

    // --- ONE mutation, validated first, acknowledged by storage -------------
    const { plan, rev } = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(plan.newItems).toHaveLength(94);
    const applied = await commit(rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    // The storage adapter holds the WHOLE new state, not a partial one.
    const persisted = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    expect(persisted.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(persisted.state.db.archiveSources).toHaveLength(1);

    // --- an unchanged refresh writes NOTHING, and churns no revision --------
    const quietRev = useStore.getState().rev;
    const again = await commit(quietRev);
    expect(again).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().rev).toBe(quietRev);

    // --- a REVISION CHANGE during the fetch rebases without losing edits ----
    loadOwnerData();
    const stale = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    // The owner edits a notebook while the index is being read.
    useStore.getState().updateItem('own-dashti', { notes: 'edited while the index was being read' });
    expect(useStore.getState().rev).not.toBe(stale.rev);
    const rebased = await commit(stale.rev);
    expect(rebased).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'edited while the index was being read',
    );
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);

    // --- a rebase that raises a NEW question refuses, and changes nothing ---
    loadOwnerData();
    const before = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(before.plan.questions).toEqual([]);
    // An item appears with a canonical title while the index is being read —
    // now there IS something to decide, and it is not this code's decision.
    useStore.getState().addItem({ instrumentId: SETAR, title: 'عراق' });
    const itemsBefore = useStore.getState().db.items.length;
    const refused = await commit(before.rev);
    expect(refused).toMatchObject({ ok: false, status: 'stale' });
    expect(useStore.getState().db.items).toHaveLength(itemsBefore);
    expect(useStore.getState().db.archiveSources).toEqual([]);
    // Answering it explicitly lets the same index through.
    const answered = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'عراق' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(answered).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(0);

    // --- A RUNNING SESSION IS UNTOUCHED, and one that FINISHES is kept ------
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    const activeBefore = useStore.getState().active;
    expect(activeBefore).not.toBeNull();
    const duringPractice = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const withClock = await commit(duringPractice.rev);
    expect(withClock).toMatchObject({ ok: true, status: 'applied' });
    // Not replaced, not nulled, not restarted: the same object, still running.
    expect(useStore.getState().active).toBe(activeBefore);
    expect(useStore.getState().activeRoutine).toBeNull();
    expect(useStore.getState().activePlan).toBeNull();
    expect(useStore.getState().sessionInstrumentId).toBe(SETAR);

    loadOwnerData();
    const beforeBlock = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().closeSession({ durationMinutes: 12, result: 'same', answer: 'unanswered', now: NOW });
    const blocksAfterClose = useStore.getState().db.blocks.length;
    expect(blocksAfterClose).toBe(2);
    const afterBlock = await commit(beforeBlock.rev);
    expect(afterBlock).toMatchObject({ ok: true, status: 'applied' });
    // The minute played while the index was being read is still there.
    expect(useStore.getState().db.blocks).toHaveLength(2);

    // --- A FAILED WRITE IS REPORTED, and the retry really writes -----------
    loadOwnerData();
    const toFail = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const persistedBefore = fakeStorage.get();
    fakeStorage.failNext();
    const unsaved = await commit(toFail.rev);
    expect(unsaved).toMatchObject({ ok: false, status: 'unsaved' });
    expect(unsaved.message).toMatch(/could not save/i);
    // The store holds the graph; the DISK does not. A reload before the
    // acknowledgement therefore yields the PREVIOUS complete state.
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(fakeStorage.get()).toBe(persistedBefore);

    // THE RETRY IS THE POINT: the in-memory index hash already matches, so a
    // "nothing changed" shortcut would answer "Already current" over data that
    // was never saved.
    const retry = await commit(useStore.getState().rev);
    expect(retry).toMatchObject({ ok: true, status: 'applied' });
    const afterRetry = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    // A COMPLETE state, not a delta: the graph, the owner's items, the blocks.
    expect(afterRetry.state.db.archiveSources).toHaveLength(1);
    expect(afterRetry.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(afterRetry.state.db.blocks).toHaveLength(1);
    expect(afterRetry.state.db.lessonAgenda).toHaveLength(1);

    // --- reload AFTER the acknowledgement yields the NEW complete state -----
    // The bytes on disk at the moment of the acknowledgement, replayed through
    // the app's own hydration. (Every `setState` re-persists, so the captured
    // text is put back first — otherwise this would only prove that the store
    // can read what it has just written.)
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'Teacher: keep the mezrab light on the return.',
    );

    // --- a graph this device would REFUSE to import is never written -------
    loadOwnerData();
    const broken = { ...INDEX, sessions: INDEX.sessions.map((s) => ({ ...s, n: 1 })) };
    const refusedGraph = await useStore.getState().commitArchiveImport({
      index: broken,
      instrumentId: SETAR,
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(refusedGraph.ok).toBe(false);
    expect(refusedGraph.status).toBe('refused');
    expect(useStore.getState().db.archiveSources).toEqual([]);

    // --- AN OWNER DECISION SURVIVES COMMIT, RELOAD AND THE NEXT REFRESH ----
    // The whole lifecycle, not the helper: a rendered choice becomes a
    // decision, the commit persists it, a real rehydration reads it back, and
    // the NEXT refresh — carrying no decisions at all — honours it.
    loadOwnerData();
    useStore.getState().addItem({ instrumentId: SETAR, title: 'عراق' });
    const asked = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(asked.plan.questions.some((q) => q.pieceKey === 'عراق')).toBe(true);
    const skipped = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'عراق' }],
      decidedFromRev: asked.rev,
      now: NOW,
    });
    expect(skipped).toMatchObject({ ok: true, status: 'applied' });

    // Reload: the bytes actually on disk, back through the app's hydration.
    const skipDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(skipDisk);
    await useStore.persist.rehydrate();
    const reloadedSource = useStore.getState().db.archiveSources[0]!;
    expect(reloadedSource.suppressions.filter((x) => x.kind === 'piece' && x.ref === 'عراق')).toHaveLength(1);
    expect(useStore.getState().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    // The owner's own record is untouched and still theirs.
    expect(useStore.getState().db.items.find((i) => i.title === 'عراق')!.source).toBeUndefined();

    // The NEXT refresh asks nothing and writes nothing.
    const afterReload = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(afterReload.plan.questions).toEqual([]);
    const quiet = await commit(afterReload.rev);
    expect(quiet).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);

    // --- A FIELD DECISION AGAINST AN ALREADY-CURRENT INDEX IS NOT "current" -
    // The index has not moved; the owner has only just answered. Judging
    // "Already current" by the index hash alone reported exactly that and
    // dropped the answer before it could ever be written.
    const boundWithComposer = useStore
      .getState()
      .db.items.find((i) => i.source && (i.persian?.composer ?? '') !== '')!;
    useStore.getState().updateItem(boundWithComposer.id, { persian: { ...boundWithComposer.persian, composer: '' } });
    const composer = boundWithComposer.persian!.composer!;
    const pieceKey = boundWithComposer.source!.pieceKey;
    const offered = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(offered.plan.suggestions.some((x) => x.pieceKey === pieceKey && x.field === 'composer')).toBe(true);
    // An OFFER is not a change: unanswered, this refresh genuinely writes
    // nothing, and says so. The owner's DECISION is what makes it a write.
    expect(offered.plan.summary.unchanged).toBe(true);
    const answered2 = useStore.getState().previewArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
      now: NOW,
    });
    expect(answered2.plan.summary.unchanged).toBe(false);
    // Left unanswered, the same refresh really is a no-op.
    const declined = await commit(useStore.getState().rev);
    expect(declined).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().db.items.find((i) => i.id === boundWithComposer.id)!.persian?.composer).toBe('');
    // Answered, it is applied — and acknowledged by storage.
    const appliedField = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(appliedField).toMatchObject({ ok: true, status: 'applied' });
    const persistedField = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    expect(persistedField.state.db.items.find((i) => i.id === boundWithComposer.id)!.persian?.composer).toBe(composer);
    // Nothing else moved with it.
    expect(useStore.getState().db.items.find((i) => i.id === boundWithComposer.id)!.title).toBe(
      boundWithComposer.title,
    );
    expect(useStore.getState().db.blocks).toHaveLength(1);

    // --- A DECISION WHOSE PREMISE MOVED IS REFUSED, NOT APPLIED ------------
    // The counterexample, through the REAL store: preview an empty composer,
    // choose the archive's value, then write your own before pressing Apply.
    // No new QUESTION appears, so the rebase guard alone let this through and
    // the registry value replaced the words just typed.
    const second = useStore.getState().db.items.find((i) => i.source && i.id !== boundWithComposer.id && (i.persian?.composer ?? '') !== '')!;
    useStore.getState().updateItem(second.id, { persian: { ...second.persian, composer: '' } });
    const secondKey = second.source!.pieceKey;
    const seen = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const choice = [
      // Bound to the RECORD as well as the piece and the premise: a rebase that
      // finds the piece on a different item must not hand it that answer.
      { kind: 'apply-field' as const, pieceKey: secondKey, itemId: second.id, field: 'composer' as const, from: '' },
    ];
    useStore.getState().updateItem(second.id, {
      persian: { ...second.persian, composer: 'Owner wrote this during refresh' },
    });
    const refusedStale = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: choice,
      decidedFromRev: seen.rev,
      now: NOW,
    });
    expect(refusedStale).toMatchObject({ ok: false, status: 'stale' });
    expect(refusedStale.staleDecisions).toEqual(choice);
    expect(useStore.getState().db.items.find((i) => i.id === second.id)!.persian?.composer).toBe(
      'Owner wrote this during refresh',
    );
    // Re-answered against what is actually there now, it applies.
    const reAnswered = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ ...choice[0]!, from: 'Owner wrote this during refresh' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(reAnswered).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.find((i) => i.id === second.id)!.persian?.composer).toBe(
      second.persian!.composer,
    );

    // --- A DECISION IS BOUND TO ITS RECORD, THROUGH A REAL COMMIT ---------
    // The other half of the same family, and the one an already-bound early
    // `continue` hid completely: the piece is held by a DIFFERENT record by
    // the time Apply runs. A field decision keyed by piece alone was written
    // to that other record (its composer was empty too, so nothing about the
    // VALUE would have caught it), and a Link decision was skipped in silence
    // — `staleDecisions` empty, the commit reporting success for an action it
    // never performed.
    const movedPiece = useStore.getState().db.items.find((i) => i.source && i.id !== second.id)!;
    const movedKey = movedPiece.source!.pieceKey;
    const decoy = createItem({ instrumentId: SETAR, title: 'A different record' }, NOW);
    useStore.setState((st) => ({
      db: {
        ...st.db,
        items: [
          // The approved record loses the binding; another record takes it.
          ...st.db.items.map((i) => (i.id === movedPiece.id ? { ...i, source: undefined } : i)),
          { ...decoy, source: { archiveId: 'setar-classes', pieceKey: movedKey } },
        ],
      },
    }));
    for (const decisions of [
      [{ kind: 'link-item' as const, pieceKey: movedKey, itemId: movedPiece.id }],
      [
        {
          kind: 'apply-field' as const,
          pieceKey: movedKey,
          itemId: movedPiece.id,
          field: 'composer' as const,
          from: movedPiece.persian?.composer ?? '',
        },
      ],
    ]) {
      const refused = await useStore.getState().commitArchiveImport({
        index: INDEX,
        instrumentId: SETAR,
        decisions,
        decidedFromRev: useStore.getState().rev,
        now: NOW,
      });
      expect(refused).toMatchObject({ ok: false, status: 'stale' });
      expect(refused.staleDecisions).toEqual(decisions);
    }
    // Neither record was touched by either refusal.
    expect(useStore.getState().db.items.find((i) => i.id === movedPiece.id)!.source).toBeUndefined();
    expect(useStore.getState().db.items.find((i) => i.id === decoy.id)!.persian?.composer ?? '').toBe('');

    // --- refresh NEVER runs a whole-database import or reset ---------------
    // `importDB`, `resetDemo` and `clearAll` each null the active session and
    // reset `notNow`/`sessionInstrumentId`; every assertion above shows those
    // intact across a commit. The source, too, says so:
    const storeSource = await (await import('node:fs/promises')).readFile('src/store/useStore.ts', 'utf8');
    const from = storeSource.indexOf('commitArchiveImport: async');
    expect(from).toBeGreaterThan(0);
    const body = storeSource.slice(from, storeSource.indexOf('hideArchiveResource: (', from));
    expect(body.length).toBeGreaterThan(200);
    // Comments stripped first — this action's own docstring NAMES the things
    // it must not call, and a scan that matched prose would be checking the
    // comment rather than the code.
    const code = body.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/importDB|installDatabase|resetDemo|clearAll|replaceAllBlobs|addAttachment/);
    // ONE db mutation in the whole action.
    expect(code.match(/\bset\(/g) ?? []).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ac-9 — an import may establish membership and provenance. Never practice.
// ---------------------------------------------------------------------------

describe('what an archive import may and may not establish', () => {
  it('archive import cannot fabricate practice or next-class urgency', async () => {
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().notNowReview('rev-1');
    const beforeState = useStore.getState();
    const before = JSON.parse(JSON.stringify(beforeState.db)) as PracticeDB;
    const activeBefore = beforeState.active;
    const notNowBefore = JSON.parse(JSON.stringify(beforeState.notNow)) as unknown;

    const applied = await commit(useStore.getState().rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    const after = useStore.getState();

    // --- EVERY existing record, byte for byte ------------------------------
    expect(after.db.blocks).toEqual(before.blocks);
    expect(after.db.reviews).toEqual(before.reviews);
    expect(after.db.lessonAgenda).toEqual(before.lessonAgenda);
    expect(after.db.materials).toEqual(before.materials);
    expect(after.db.pathways).toEqual(before.pathways);
    expect(after.db.pathwayStages).toEqual(before.pathwayStages);
    expect(after.db.pathwayRoutines).toEqual(before.pathwayRoutines);
    expect(after.db.attachments).toEqual(before.attachments);
    for (const original of before.items) {
      const now = after.db.items.find((i) => i.id === original.id)!;
      expect(now).toEqual(original);
    }
    // ...and the ephemeral session state the owner is standing in.
    expect(after.active).toBe(activeBefore);
    expect(after.activeRoutine).toBeNull();
    expect(after.activePlan).toBeNull();
    expect(after.notNow).toEqual(notNowBefore);
    expect(after.sessionInstrumentId).toBe(SETAR);

    // --- NEW items carry no practice at all ---------------------------------
    const fresh = after.db.items.filter((i) => i.source);
    expect(fresh).toHaveLength(94);
    for (const item of fresh) {
      expect(item.timesPractised).toBe(0);
      expect(item.totalMinutes).toBe(0);
      expect(item.lastPractisedAt).toBeUndefined();
      expect(item.lastResult).toBeUndefined();
      expect(item.nextReviewDate).toBeUndefined();
      expect(item.nextReviewSource).toBeUndefined();
      expect(item.srReps).toBeUndefined();
      expect(item.srEase).toBeUndefined();
      expect(item.srIntervalDays).toBeUndefined();
      expect(item.srLastProgressDay).toBeUndefined();
      // RESTING by explicit import policy: 94 pieces must not flood Today.
      expect(item.status).toBe('dormant');
      // No pathway placement, no catalogue identity, no material invented.
      expect(item.stageId).toBeUndefined();
      expect(item.catalogKey).toBeUndefined();
      expect(item.materialId).toBeUndefined();
    }
    // No review row and no agenda entry was created for any of them.
    expect(after.db.reviews.filter((r) => fresh.some((i) => i.id === r.practiceItemId))).toEqual([]);
    expect(after.db.lessonAgenda).toHaveLength(1);
    expect(after.db.blocks.filter((b) => fresh.some((i) => i.id === b.practiceItemId))).toEqual([]);

    // A resting item is still DIRECTLY startable — resting is administrative,
    // not a lock.
    const araq = after.db.items.find((i) => i.source?.pieceKey === 'عراق')!;
    useStore.getState().cancelSession();
    useStore.getState().startItemSession(araq.id);
    expect(useStore.getState().active?.itemId).toBe(araq.id);
    useStore.getState().cancelSession();

    // --- THE OWNER'S OWN RECORDINGS ARE EVIDENCE, NOT MATERIAL -------------
    const source = useStore.getState().db.archiveSources[0]!;
    // 125 personal files in the real corpus, and not one of them is a resource.
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);
    // Their membership and role survive — that is the whole of what they leave.
    const chainPiece = 'پیش-درامد-سه-گاه-فروتن';
    const { repeatChains } = await import('../domain/sourceArchive');
    // The longest repeat chain in the real archive. It is read from the
    // PERSONAL role — a piece is a repeat because the student was asked to play
    // it again, not because an unnamed demonstration gave it membership of a
    // session (which would report a repeat nobody was asked for).
    expect(repeatChains(source, chainPiece)).toEqual([[22, 23, 24, 25, 26, 27]]);
    // The real counterexample: پیش-درامد-ماهور-هرمزی is a MEMBER of sessions
    // 16, 17 and 18, but the student only recorded themselves playing it in 17
    // and 18 — session 16's membership comes from a correction and a
    // demonstration. Read from membership the chain would be three classes
    // long; read from what was actually asked for again, it is two.
    const hormozi = 'پیش-درامد-ماهور-هرمزی';
    expect(source.sessions.filter((s) => s.members.some((m) => m.key === hormozi)).map((s) => s.n)).toEqual([
      16, 17, 18,
    ]);
    expect(repeatChains(source, hormozi)).toEqual([[17, 18]]);
    const chainItem = useStore.getState().db.items.find((i) => i.source?.pieceKey === chainPiece)!;
    // Six classes of provenance, and still zero recorded practice.
    expect(chainItem.timesPractised).toBe(0);
    expect(chainItem.totalMinutes).toBe(0);
    const material = (await import('../domain/itemFiles')).itemFiles(useStore.getState().db, chainItem.id);
    expect(material.every((f) => f.source !== 'reference' || !f.path.includes('تمرین-من'))).toBe(true);

    // --- HISTORY NEVER BECOMES THE NEXT CLASS ------------------------------
    const { nextLessonFor } = await import('../domain/selectors');
    const { preparationDatesByItem, defaultTargetLesson } = await import('../domain/lessonAgenda');
    const db = useStore.getState().db;
    expect(db.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
    expect(nextLessonFor(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, NOW).values()]).toEqual([]);

    // AND ON A DEVICE WHOSE CLOCK IS BEHIND THE ARCHIVE. Read from 1 June 2026,
    // the last three imported classes are all in the FUTURE and all NEARER than
    // the owner's own next class — the exact case a plain `date >= today` turns
    // into a deadline. They are still history.
    const EARLIER = new Date('2026-06-01T09:00:00.000Z');
    const futureHistory = db.lessons.filter((l) => l.origin === 'archive' && l.date > '2026-06-01');
    expect(futureHistory.map((l) => l.date).sort()).toEqual(['2026-06-09', '2026-07-09', '2026-08-04', '2026-09-01']);
    expect(nextLessonFor(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, EARLIER).values()]).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ac-8 — an owner's deletion is a decision a refresh has to respect.
// ---------------------------------------------------------------------------

describe('deletions, unlinking and hiding', () => {
  it('archive deletions and unlinking remain respected after refresh and reload', async () => {
    loadOwnerData();
    await commit(useStore.getState().rev);
    const store = () => useStore.getState();
    const itemFor = (key: string) => store().db.items.find((i) => i.source?.pieceKey === key)!;
    const lessonFor = (n: number) => store().db.lessons.find((l) => l.source?.sessionN === n)!;
    const suppressions = () => store().db.archiveSources[0]!.suppressions;

    // --- deleteItem records the decision IN THE SAME mutation --------------
    const araqId = itemFor('عراق').id;
    store().deleteItem(araqId);
    expect(store().db.items.some((i) => i.id === araqId)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'piece', ref: 'عراق' }));

    // --- deleteLesson likewise ---------------------------------------------
    const lesson13 = lessonFor(13).id;
    store().deleteLesson(lesson13);
    expect(store().db.lessons.some((l) => l.id === lesson13)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'session', ref: '13' }));

    // --- REFRESHING THE SAME SOURCE MUST NOT BRING THEM BACK ---------------
    const again = await commit(store().rev);
    expect(again.ok).toBe(true);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);

    // ...nor may a RELOAD, which replays the persisted bytes through hydration.
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    await commit(store().rev);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);

    // --- lifting a suppression lets the next refresh bring it back ----------
    store().resetArchiveSuppression('setar-classes', 'piece', 'عراق');
    const restored = await commit(store().rev);
    expect(restored).toMatchObject({ ok: true, status: 'applied' });
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(true);

    // --- HIDING A SHARED DEMO IS SCOPED TO ONE ITEM ------------------------
    const { itemFiles } = await import('../domain/itemFiles');
    const sharedDemo = 'session-13-03-09-2024/نمونه-1.mp4';
    const oneMember = itemFor('کرشمه-در-عراق');
    const otherMember = itemFor('حزین-در-عراق');
    // Session 13 was suppressed above and is back only for the piece; re-run a
    // refresh so its resources are present for both members.
    store().resetArchiveSuppression('setar-classes', 'session', '13');
    await commit(store().rev);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(true);
    store().hideArchiveResource('setar-classes', sharedDemo, oneMember.id);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(false);
    // Its seven siblings still have it.
    expect(itemFiles(store().db, otherMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(
      true,
    );

    // --- unlinking an item from an archive class is remembered -------------
    const lesson28 = lessonFor(28);
    const zendan = itemFor('به-زندان-شوشتری');
    store().unlinkItemFromLesson(lesson28.id, zendan.id);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'link', ref: `28:${'به-زندان-شوشتری'}` }));
    const { membersForSession } = await import('../domain/sourceArchive');
    expect(membersForSession(store().db.archiveSources[0]!, 28).some((m) => m.key === 'به-زندان-شوشتری')).toBe(false);

    // --- a MANUAL reference is removed without touching the archive --------
    store().addItemReference(zendan.id, { title: 'my own copy', path: 'session-28-28-10-2025/نت-به-زندان-شوشتری.pdf' });
    const added = store().db.items.find((i) => i.id === zendan.id)!.references![0]!;
    const suppressionsBefore = suppressions().length;
    store().removeItemReference(zendan.id, added.id);
    expect(store().db.items.find((i) => i.id === zendan.id)!.references).toEqual([]);
    // Removing an owner's own link says nothing about the archive.
    expect(suppressions()).toHaveLength(suppressionsBefore);

    // --- a catalogue removal of a bound item is still lossless -------------
    const catalogueItem = itemFor('چهار-پاره');
    expect(store().removeCatalogItem(catalogueItem.id)).toBe(false); // no catalogKey
    expect(store().db.items.some((i) => i.id === catalogueItem.id)).toBe(true);

    // --- MOVING A BOUND ITEM TO ANOTHER INSTRUMENT IS REFUSED --------------
    useStore.setState((s) => ({
      db: {
        ...s.db,
        instruments: [
          ...s.db.instruments,
          { ...s.db.instruments[0]!, id: 'inst-tar', name: 'Tar' },
        ],
      },
    }));
    const boundId = itemFor('به-زندان-شوشتری').id;
    const refusal = store().updateItem(boundId, { instrumentId: 'inst-tar' });
    expect(refusal).toMatch(/Detach it from the archive/);
    expect(store().db.items.find((i) => i.id === boundId)!.instrumentId).toBe(SETAR);
    // No invalid graph was emitted: the database still validates.
    expect(() => validateDB(store().db)).not.toThrow();

    // --- a PARTIAL binding is refused, never healed by duplication ---------
    expect(() =>
      validateDB({
        ...store().db,
        items: store().db.items.map((i) =>
          i.id === boundId ? { ...i, source: { archiveId: 'setar-classes', pieceKey: 'not-a-real-piece' } } : i,
        ),
      }),
    ).toThrow(/does not describe/);

    // --- clearing everything takes the source state with it ----------------
    store().clearAll();
    expect(store().db.archiveSources).toEqual([]);
    expect(store().db.items).toEqual([]);
    expect(store().active).toBeNull();
  });
});
```

## Check against the contract

- [ ] **ac-1** — Use real PIECES.csv rows including quoted commas, doubled quotes, aliases, provisional and MEDIUM caveats. Preserve canonical_fa byte identity, embedded digits and -و-. Reject duplicate/empty canonical keys, malformed quoting, missing headers, invalid session numbers and unknown manifest versions. aliases_seen is literal search data, never a wildcard or reconciliation heuristic; real forms هفت-ضربی and چهارپاره are supported without inventing categorical facts. _(proof: setar registry keeps exact Farsi keys and rejects ambiguous CSV input)_
- [ ] **ac-2** — Assert all seven real brief examples exactly, role boundary longest match, parts numeric, the embedded دشتی-1-علیزاده digit and پریچهر-و-پریزاد stay inside one canonical name. Known session16 video exception produces actionable diagnostic and no guessed role. Unknown piece/role/ext and named class recordings are surfaced, not relabelled. No largest-file heuristic. _(proof: setar filenames preserve compound roles and report unhandled assets)_
- [ ] **ac-3** — Session13 unnamed two-part demo belongs to all eight canonical pieces; session28 named demo only به-زندان-شوشتری and no fabricated class recording; session27 class parts ordered numerically. Folder membership rather than mtime. Provisional session7 and34/35 preserved. Six-session personal repeat chain22..27 is provenance, never six weeks or practice evidence. On roster disagreement do not expand unnamed demos to a guessed set. _(proof: setar session material follows exact roster and demonstration attribution)_
- [ ] **ac-4** — Deterministic filesystem inventory fixture, shuffled directory order and altered mtimes yield same semantic index. Numeric session order9 before10. Ignore dotfiles/root out-of-scope folders/NAS @eaDir; do not follow symlinks or unsafe relative paths. Reject traversal, escaped separators, URL schemes, duplicate asset/session identities and oversize inputs. Missing root or changed registry/inventory during scan does not replace last good output. Output is atomically published outside archive; no source write API. _(proof: setar scanning is bounded read-only and produces stable complete indexes)_
- [ ] **ac-5** — Transport stub exercises first index publish, identical scan no commit, changed scan, interruption before ref advance, race with second publisher. All writes confined to designated source-index branch; never state.json, manifest.json or files/ on data main or archive/ recovery branches. Reader pins file fetch to the read branch commit. Authentication/network errors leave old index and app data intact; no token/root URL in payloads or logs. Publisher target branch is fixed source-index and path setar/index.json. Token is scoped to this private repository with only required Contents write and metadata read, no workflow/admin permission; GitHub does not make such a token branch-scoped, so code target restrictions and optional repository rules must not be described as credential isolation. App reuses its existing local GitHub connection only for GETs; no publisher token reaches the browser. Unchanged content means no commit; UI says index last changed/fetched, never falsely last scanned. _(proof: source index publication cannot replace practice data or lose a concurrent update)_
- [ ] **ac-6** — First empty import produces39 historical lessons94 canonical items; repeat no duplicates. Existing source bindings win across edited titles/dates. Unique legacy lesson with exact source-reference evidence/date+number can be adopted; date-only, number-only or title-only equivalence cannot auto-merge. Exact manual title/alias candidates require owner Link/Create/Skip; multiple candidates do not pick first. Existing upcoming class38 on2026-09-27 survives separate from archive38 on2026-08-04. catalogKey iraq never equals Setar canonical key عراق. Source/instrument binding explicit and persistent. Deterministic namespaced IDs on new records ensure two devices importing the same source separately identify the same logical entities, while existing owner records retain their IDs after explicit binding. Whole-snapshot GitHub conflicts still require the existing owner choice; no automatic merge of divergent practice databases. _(proof: setar reconciliation binds exact identities without merging owner records)_
- [ ] **ac-7** — Exercise one newlesson40, added score existinglesson, changed registry metadata, exact logged path rename, missing file, missing registry row, unresolved previous candidates and same manifest with a new owner decision. Source metadata/availability updates; item/lesson authored fields seeded once then preserved including deliberate empty values. Later metadata improvement shown for explicit selective apply, never notes overwrite. Missing source retains provenance and flags unavailable, never deletes owner data. Unchanged refresh does not bump db revision or churn timestamps. A canonical key change is a new identity requiring owner decision, never inferred from metadata; exact asset rename chains alone may preserve an asset identity. Missing files only follow a validated complete scan, not timeout, partially copied input or unreachable mount. _(proof: archive refresh preserves owner edits and applies only the new source delta)_
- [ ] **ac-8** — Actual mutation actions deleteItem, removeCatalogItem, deleteLesson, unlinkItemFromLesson, remove manual ref and hide imported material update only applicable suppression/binding in same store mutation. Retry identical source after reload/sync cannot resurrect deliberately suppressed record/link. Shared demo hidden for one item remains available to others. Moving an archive-bound item to another instrument refuses or explicitly detaches before mutation; no invalid graph emitted. Clear/reset remove source state with DB. Partial/imported dangling bindings refused instead of duplicate healing. _(proof: archive deletions and unlinking remain respected after refresh and reload)_
- [ ] **ac-9** — Compare complete pre/post blocks,reviews,lessonAgenda,existing item counters/results/all scheduling fields,active+routine+plan,notNow and sessionInstrument. New items have zero totals,no lastPractice/result/review/SM2; source personal files create only membership/roles/repeat provenance. No new material/agenda/pathway commitments inferred. New library items start resting by explicit import policy so Today/plan pools are not flooded, yet direct Start works. No personal recordings in item/active material. _(proof: archive import cannot fabricate practice or next-class urgency)_
- [ ] **ac-10** — One shared upcoming predicate used by nextLessonFor,nextLessonDates,defaultTargetLesson,preparationDatesByItem and wide/mobile Lessons badges/default selection/question sheet. Test source historical lesson dated past/today/future versus ordinary real upcoming lesson on same dates; imported historical records never create urgency/default question target. Preserve existing manually authored agenda and normal upcoming lesson semantics. _(proof: historical source lessons never become upcoming through sibling selectors)_
- [ ] **ac-11** — Real store action with controlled persistence: validate and prepare before a single db set; no per-file app commits/no blob copying. Revision change, source change, owner-choice change, active session starting and finishing during fetch cause rebase/repreview or refusal without lost edits. IndexedDB failed save reports unsaved and retry persists complete current state even if in-memory index hash already matches; no false Already current. Reload before/after acknowledgement yields previous complete or new complete state. Refresh never calls whole-DB import/reset. _(proof: archive commits survive interruption and never apply a stale preview)_
- [ ] **ac-12** — All67 legacy seed paths map through exact257-row RENAME-LOG, no fuzzy URL/title/mtime matching. Full URL converts only under explicitly verified current device prefix with segment-wise decode; foreign/query/fragment links remain untouched. Old/current pairs for session1 classpart1 and firstDashti score show one physical resource without deleting either authored row/notes. Existing3 personal references remain retained historical links outside item/active list. Missing targets/cycles/multiple destinations diagnose, never guess. _(proof: exact Setar rename repair preserves saved references and their metadata)_
- [ ] **ac-13** — One shared composition for ItemDetail/Active and new direct item links plus lesson composition. Corrections prominent but clean scores retained; logical demo ordered parts one group; resources from earlier repeat-chain lessons remain reachable; named scores/demo never bleed to sibling pieces; whole class video stays lesson-only. Existing manual unclassified lesson references remain accessible without inventing scope. Direct NAS link works without any lesson and uses same resolver as legacy/source refs. External links never go through attachment blob APIs. _(proof: practice material shows only useful correctly scoped archive resources)_
- [ ] **ac-14** — Same sourceId+relative asset resolves via independently configured Mac/iPhone roots and a changed future base; stored data/export/hash unchanged. Config device-local, never synced. Preserve base path prefixes; reject unsafe path/scheme/traversal/credentials and double-encoded separators; encode each raw Farsi segment once. Root/index capability check never relies on a media filename. Distinguish readable published index from unverified media reachability; do not claim CORS/cert/network failures are absence. _(proof: source transport changes preserve archive identity and encode Farsi once)_
- [ ] **ac-15** — v13->v14 additive empty-source migration with source keys/manual refs/history marker as chosen representation; legacy baseline fields unchanged apart from schema. Run whole oldest-supported chain, repeated migration and current-declared inbound. validateDB retains/validates every new persisted field with duplicate source keys, wrong types, dangling/mismatched refs,wrong instrument,unsafe paths,unknown format/newer schema refused before mutation. Missing source file is valid unavailable state, not dangling graph. Successful output revalidates and roundtrips export unchanged. New collection is included in validateDB's reconstructed return value, not merely accepted on input. Legacy current-version stray fields do not bypass validation. Reject duplicate bindings and resource graph cycles/invalid part group membership. Preserve surviving practice text and attachment guarantees. _(proof: archive schema migration and validation preserve the whole source graph)_
- [ ] **ac-16** — Use existing browser/fakeGitHub harness to drive Settings full/state import, automatic pull, Keep remote, archive restore, both hydration branches and cold-start recovery. Same malformed source relation rejected with pre/post persisted DB+blobs checked; valid source bindings/suppressions/user fields survive. Existing active/revision guards retained. Full export includes metadata only for NAS refs and only real local attachment bytes. Real baseline v13 checkout refuses v14 file without writes; retained v13 backup restores there. No format2 sync-engine rewrite. _(proof: archive state crosses all real inbound doors without partial installation)_
- [ ] **ac-17** — Reproduce current empty-save bug through real editor and store then verify fixed reload. Reuse current ItemNotes durability model: explicit Done, preserved unsaved draft on refresh, tagged lesson ID, storage acknowledgement before Saved, failed-write retry/copy, typing during pending write, latest-save ownership, item/lesson switch and route unmount. Existing Working notes/Observation/Next time and timers remain unchanged. _(proof: lesson notes can be cleared and saved durably without cross-lesson drafts)_
- [ ] **ac-18** — Rendered controls with frozen time and checked-in corpus-derived metadata fixture. Refresh -> historical lesson -> proper class/score/demo -> canonical item -> useful material -> direct Start -> open material with practice context unchanged. Historical phone rows initially compact/collapsed, Farsi wraps and mixed labels isolate correctly, keyboard controls and accessible names present. Alias search works in Repertoire and Start through existing Farsi matcher; identity matching never uses it. Repeat refresh then add fixturelesson40 only delta; invalid file actionable; persisted reload verifies no duplicates/history fabrication. Both engines mandatory; missing engine fails, not skip. _(proof: setar archive journey works on phone and desktop in Chromium and WebKit)_
- [ ] **ac-19** — Actual corpus read-only: baseline39/258/257/1/94 with125personal and132useful files, 37logical demos; all CSV+inventory hashes recorded. Verify known exception/session28/provisional rows and full rename coverage. Future lesson delta tested with disposable fixture outside Sandisk, not a mutation of source archive. Publisher runtime/location and scheduling must be installed and exercised, not left as a runbook-only hidden prerequisite. Primary production host is the NAS, explicitly approved by OWNER: install supported Node runtime and a DSM scheduled task (default every15 minutes), read-only source permissions and restricted separate runtime/output directory. Provision publisher-only repository-scoped credentials outside app data and verify unattended run with Mac off. Verify main branch unchanged after index publication; revocation and failed scan retain last good index. Record actual NAS filesystem mapping/runtime rather than assuming /Volumes paths work there. _(proof: manual:OWNER)_
- [ ] **ac-20** — Real Mac and iPhone journey using archive bases https://192.168.0.20:5010/setar-classes/ and OWNER-provided https://ds220plus.taild1d1f7.ts.net/media/setar-classes/. Verify same Farsi demo and score open, video range/seek works, changing base changes no source IDs or backup data. iPhone path is owner-confirmed mapping awaiting device playback verification, not a Mac-probed fact. Mac requires no Tailscale. Do not disable certificate validation in shipped code. Show published-index retrieval separately from media access; unavailable NAS or GitHub preserves imported material metadata. Never mark iPhone passed from LAN-only/emulated tests. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx, src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts, src/domain/selectors.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/selectors.ts, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts
- **practise-todays-recommendation** — touched via src/pages/StartBlock.tsx, src/store/useStore.ts
- **prepare-for-the-next-class** — touched via src/pages/Lessons.tsx
- **run-a-session-plan** — touched via src/store/useStore.ts
- **see-practice-patterns** — touched via src/domain/io.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx, src/store/useStore.ts matched changed file(s) src/pages/ItemDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts, src/domain/selectors.ts matched changed file(s) src/domain/selectors.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/recordings.ts, src/domain/selectors.ts, src/domain/setarClasses.ts, src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts matched changed file(s) src/domain/recordings.ts, src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StartBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/StartBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts matched changed file(s) src/domain/io.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.


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

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### point-this-device-at-the-nas — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts, src/store/backup.ts

Evidence: 3 steps: 3 manually verified

### practise-todays-recommendation — Works now

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

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

## Also look for

- Anything outside the contract's scope or non-goals.
- Silent failures, swallowed errors, missing edge cases.
- Secrets, unsafe defaults, and anything risky for the tier.

## How to finish

Review only — change no files, run no fixes, write no records. Judge the diff
itself: the builder's summary, an earlier review and a green test run are all
claims about the code, not evidence about it.

End your reply with exactly `SAFE TO SEAL` or `DO NOT SEAL` on its own
final line, and say why. That is a recommendation to the owner, who records
the outcome — sealing is never the reviewer's to do.

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260917-turn-the-setar-archive-into-trusted-less-5614/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
