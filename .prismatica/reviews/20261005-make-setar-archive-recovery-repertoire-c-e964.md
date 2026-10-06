---
id: 20261005-make-setar-archive-recovery-repertoire-c-e964
contractId: 20261005-make-setar-archive-recovery-repertoire-c-e964
patchId: c002ddb2a6b8852cee7ffeeba657e01090a82603
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-10-06T14:23:51.888Z
sealedAt: 2026-10-06T17:24:37.626Z
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
- **Diff patch-id:** `c002ddb2a6b8852cee7ffeeba657e01090a82603`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

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

**Approved intent:** `.prismatica/intents/20261005-make-setar-archive-recovery-repertoire-c-e964.md`

**Findings from the previous review:**

- **header-aware-source-metadata-drafts** — P2: formatAttention loses CSV quoting when printing registry and rename-log headers, so valid quoted extension headers no longer describe their accompanying draft rows.
  _counterexample:_ The accepted header new_path,"audit,note",old_path prints as new_path,audit,note,old_path. Parsing that printed header with the filled three-cell template leaves old_path empty and assigns the old path to note. Instances: scripts/scan-setar-classes.mjs:945,984. Checked clean: parseCsvCells/readTable, new registry draft cells, raw-cell roster amendments, rename template column placement and downstream exact rename consumers. Extend setar durable intake preserves registry authority and exact rename evidence without changing media to quoted extension headers.
- **setup-study-source-identity-and-idempotence** — P2: Required multi-group creation acknowledgement and failed-creation persistence proof remains absent from the named setup checks, despite the domain identity repair.
  _counterexample:_ The named browser test selects only mat-radif and never exercises create-group finalisation at SetarSetupReview.tsx:179-183. The domain test covers successful two-group creation/replay, but its failed-write case at setarSetup.test.ts:305 applies a kind change with an existing-source context. Missing proof instances: group finalisation, failed creation persistence, Try again and repeat/reload. Checked clean: deterministic group IDs, production domain creation/replay, existing-source instrument filtering, shared acknowledgement sequencing, ItemForm and Materials retries, and keyed course-source selection. Extend setar setup review is usable through controls and survives interruption and setar setup commits selected rows atomically idempotently and without collateral changes to those creation cases.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index de173383c0c4b88168462b6ec2c7119246169364..0bb51f78f3ac3c819175d602412d26e669388d92 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -120,7 +120,8 @@ is archive-relative. It lists:
 
 1. **Pieces named by files but missing from PIECES.csv**: each key, the sessions
    and roles it was seen in, why it is excluded, and an UNCONFIRMED draft row built
-   against the registry's ACTUAL header (any order, any extra columns). The draft
+   against the registry's ACTUAL header (any order, any extra columns; a header cell
+   holding a comma or a quote is printed quoted, as the file writes it). The draft
    carries the identity and nothing else; no form, dastgāh, composer, source or
    session is read off a filename.
 2. **Unnamed demonstrations kept with their lesson**, saying whether the roster is
diff --git a/docs/setar-practice-reliability.md b/docs/setar-practice-reliability.md
index 932da970c051998c245ccd2d7d4d5eacbacfe1b8..b443d2ec9ac744b5c93630c3bd7ebbf67e801894 100644
--- a/docs/setar-practice-reliability.md
+++ b/docs/setar-practice-reliability.md
@@ -96,7 +96,7 @@ The owner's confirmed answers for that corpus are
 | Invariant | Writers | Consumers (each fixed or checked clean) | Proof |
 | --- | --- | --- | --- |
 | A roster is the registry's; every role-named file counts against it, registered or not | `PIECES.csv` (owner only) | scanner inventory loop (`session.named` before the type/registry filters), attribution (`rosterTrusted`), diagnostics, `attentionReport` (§2 sections 2–3) | ac-1, ac-4 |
-| A new piece is declared, never inferred | owner, from an UNCONFIRMED `--attention` draft against the actual header | scanner registry filter, `attentionReport` drafts (header order, extra columns, quoting kept), app (no filename parsing) | ac-1, ac-4 |
+| A new piece is declared, never inferred | owner, from an UNCONFIRMED `--attention` draft against the actual header | scanner registry filter, `attentionReport` drafts (header order, extra columns, quoting kept) and `formatAttention` (the header it prints is re-quoted with `csvCell`, for the registry and the rename log, so it still describes the row beneath it), app (no filename parsing) | ac-1, ac-4 |
 | `studySource` is provenance: absent = unknown, `''` = none, text verbatim; wrong type refused | scanner `parseRegistry` (only when the column exists) | digest, `decodeSourceIndex`, `parseSourceIndex` (fetch + file doors), `checkSourceGraph`, `validateDB` + v16 step, adoption (`sourceReconcile`), setup source groups, import/export/sync/restore/hydration/recovery | ac-2 (+ io companion) |
 | A rename is exact evidence or nothing | RENAME-LOG.csv (owner only) | `planArchiveImport` repair, suppression re-key, `itemFiles`/`lessonFiles`, ItemMaterial "not described" label | ac-5, ac-4 |
 | A suppression is lifted only as its exact `{kind, ref, itemId}` | `restoreArchiveSuppression` | Recovery list (ArchiveRefresh), refresh planning (`isSuppressed`), `sessionMembership` | ac-3 |
@@ -116,7 +116,11 @@ The owner's confirmed answers for that corpus are
 - **Intake:** registered / unregistered / registered-but-unlisted pieces ×
   empty / consistent / inconsistent rosters × the real 10-column header,
   a reordered header with an extra column, and an 8-column one × future,
-  non-consecutive and three-digit session numbers.
+  non-consecutive and three-digit session numbers × a header cell holding a
+  comma or a quote (registry `"teacher, ""comment"""`, rename log
+  `"audit,note"`), judged on the PRINTED header and template by a reader the
+  scanner does not own: a rescan cannot tell, because the scanner reads the
+  file's own header.
 - **Provenance:** absent, `''`, known, unknown text; `null`, number, object.
 - **Renames:** single, multi-hop, cross-session, unlogged, cyclic, forked ×
   destination present/absent × global/item-scoped hide.
@@ -125,6 +129,12 @@ The owner's confirmed answers for that corpus are
   term / alias / ambiguous / composite × `(قطعه)`, ZWNJ/hyphen, provisional.
 - **Premises:** typed empty/literal/ref × rename / meaning change / same label
   different identity × deleted / rebound / moved item / proposal drift.
+- **Study-source creation:** one group / two groups in one Apply × refused write
+  → Try again with the original `new:<group>` selections → "Saved." finalising
+  each group to ITS OWN source → reload → asking to create again (names the
+  existing source; no third). Domain: `setar setup commits selected rows
+  atomically idempotently and without collateral changes`; controls: `setar
+  setup review is usable through controls and survives interruption`.
 - **Cue doors:** Today, Start, StageDetail, PathwayDetail, RoutineDuration,
   RoutineRunner bare URL, Session Plan, Resume on Active and on Close × running /
   suspended / interrupted / throwing / hanging contexts.
@@ -216,8 +226,16 @@ having touched nothing.
 | a setup choice re-premised from the live plan | `src/components/SetarSetupReview.tsx` | ac-11 | failed (caught) |
 | a created study source forgotten once it exists (replay turns stale) | `src/domain/setarSetup.ts` | ac-10 | failed (caught) |
 | a rename template that ignores the log header | `scripts/scan-setar-classes.mjs` | ac-1 | failed (caught) |
-
-Recorded 2026-10-06: all 26 caught, every source restored byte for byte. The
+| a registry draft header printed without its CSV quoting | `scripts/scan-setar-classes.mjs` | ac-1 | failed (caught) |
+| a rename-log header printed without its CSV quoting | `scripts/scan-setar-classes.mjs` | ac-1 | failed (caught) |
+| every created study source finalised to the first group's | `src/components/SetarSetupReview.tsx` | ac-11 | failed (caught) |
+| a created study source never finalised on the screen | `src/components/SetarSetupReview.tsx` | ac-11 | failed (caught) |
+| a retry of an already-applied creation that writes nothing | `src/store/useStore.ts` | ac-10 | failed (caught) |
+
+Recorded 2026-10-06: all 35 caught, every source restored byte for byte (the
+last five were each run alone with `--only=<name>` after the second rework, at
+the assertions their findings named: the second group's selector holding the
+first group's source, and a selector left on `create` after "Saved."). The
 first run MISSED one — a cue queued on a not-running context went unnoticed by
 ac-14, whose stand-in never resumes a context after a missed boundary. The
 practiceCue companion now drives exactly that (interrupted → boundary → the
diff --git a/scripts/check-setar-practice-families.mjs b/scripts/check-setar-practice-families.mjs
index 073e8f6a7a5741b65c57a5452f045aa7207fbced..1c7fcc6a90a2a290fa2b786a9271383c58daa8bb 100644
--- a/scripts/check-setar-practice-families.mjs
+++ b/scripts/check-setar-practice-families.mjs
@@ -286,6 +286,41 @@ export const MUTATIONS = [
     replace: "    line('       <the missing path>,<its current path>');",
     test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
   },
+  {
+    name: 'a registry draft header printed without its CSV quoting',
+    file: 'scripts/scan-setar-classes.mjs',
+    find: "${r.registryHeader.map(csvCell).join(',')}",
+    replace: "${r.registryHeader.join(',')}",
+    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
+  },
+  {
+    name: 'a rename-log header printed without its CSV quoting',
+    file: 'scripts/scan-setar-classes.mjs',
+    find: "    line(`       ${logCols.map(csvCell).join(',')}`);",
+    replace: "    line(`       ${logCols.join(',')}`);",
+    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
+  },
+  {
+    name: 'every created study source finalised to the first group\'s',
+    file: 'src/components/SetarSetupReview.tsx',
+    find: 'const id = setupSourceId(instrumentId, key);',
+    replace: 'const id = setupSourceId(instrumentId, Object.keys(cur)[0]!);',
+    test: 'setar setup review is usable through controls and survives interruption',
+  },
+  {
+    name: 'a created study source never finalised on the screen',
+    file: 'src/components/SetarSetupReview.tsx',
+    find: "return [key, 'create' in v && made.some((m) => m.id === id) ? { materialId: id } : v];",
+    replace: 'return [key, v];',
+    test: 'setar setup review is usable through controls and survives interruption',
+  },
+  {
+    name: 'a retry of an already-applied creation that writes nothing',
+    file: 'src/store/useStore.ts',
+    find: '        set({ db: outcome.db });\n        return null;',
+    replace: '        if (outcome.db !== get().db) set({ db: outcome.db });\n        return null;',
+    test: 'setar setup commits selected rows atomically idempotently and without collateral changes',
+  },
 ];
 
 const isBrowser = (file) => file.includes('.browser.');
diff --git a/scripts/scan-setar-classes.mjs b/scripts/scan-setar-classes.mjs
index af8187ad2ee0c9d1de114935bce34e7e3ffe4916..b5417e4a7c6070e547dcaa5d35ec0dcd6f549d8f 100644
--- a/scripts/scan-setar-classes.mjs
+++ b/scripts/scan-setar-classes.mjs
@@ -942,7 +942,7 @@ export function formatAttention(r) {
     for (const f of n.files) line(`       ${f}`);
     line('     why it is not imported: PIECES.csv is the identity table, and an unregistered name is never guessed into a piece.');
     line('     to import it: confirm this exact spelling IS the piece (it becomes canonical_fa byte for byte), then add one row.');
-    line(`     UNCONFIRMED draft row for the header ${r.registryHeader.join(',')}:`);
+    line(`     UNCONFIRMED draft row for the header ${r.registryHeader.map(csvCell).join(',')}:`);
     line(`       ${n.draft}`);
     line('     Musical fields may stay empty. Put a session number in `sessions` only if that class taught it.');
   }
@@ -981,7 +981,7 @@ export function formatAttention(r) {
     line('     If a missing name was renamed to one of these, append ONE exact row per file to RENAME-LOG.csv:');
     // One cell per header COLUMN, by name — a reordered or extended log keeps old and new in their own columns.
     const logCols = r.logHeader.includes('old_path') && r.logHeader.includes('new_path') ? r.logHeader : ['old_path', 'new_path'];
-    line(`       ${logCols.join(',')}`);
+    line(`       ${logCols.map(csvCell).join(',')}`);
     line(`       ${logCols.map((h) => (h === 'old_path' ? '<the missing path>' : h === 'new_path' ? '<its current path>' : '')).join(',')}`);
     line('     Only you know which became which: nothing here pairs them by number, size or similarity. Unpaired, the old name stays "not described".');
   }
diff --git a/src/domain/setarSetup.test.ts b/src/domain/setarSetup.test.ts
index b9701c7aaf889825622068892791ebe98bc1afbd..8a4edf1b53ef331adc05c025a04b6b97576ef662 100644
--- a/src/domain/setarSetup.test.ts
+++ b/src/domain/setarSetup.test.ts
@@ -298,10 +298,46 @@ describe('the Setar setup review', () => {
     const lateTwo = applySetarSetup(first.db, bothCreate, bothSel.slice(0, 1), NOW);
     expect(lateTwo.ok && lateTwo.db.materials.length).toBe(first.db.materials.length);
 
+    // --- A REFUSED WRITE of a CREATION: memory keeps what it made, Try again writes it ONCE
+    // Two groups are created in one Apply and the disk refuses. What is on
+    // screen still holds the original selections (their `new:<group>` premise);
+    // Try again sends exactly those, and must be a real write of the state in
+    // memory — not stale, not a third source, each group still its OWN source.
+    const { storageSettled } = await import('../store/idb');
+    const failNext = () => (globalThis as { __failNextWrite?: () => void }).__failNextWrite!();
+    useStore.setState({ db: two });
+    failNext();
+    expect(s().commitSetarSetup({ context: bothCreate, selections: bothSel, now: NOW })).toBeNull();
+    await expect(storageSettled()).rejects.toThrow();
+    const inMemory = s().db;
+    const created = inMemory.materials.filter((m) => !two.materials.some((o) => o.id === m.id));
+    expect(created.map((m) => m.title).sort()).toEqual([EXPECT.context.declared, second].sort());
+    expect(s().commitSetarSetup({ context: bothCreate, selections: bothSel, now: NOW })).toBeNull();
+    await expect(storageSettled()).resolves.toBeUndefined();
+    expect(s().db).toBe(inMemory);
+    expect(s().db.materials).toHaveLength(two.materials.length + 2);
+    // Once "Saved." finalises the screen, each group names ITS source and every
+    // row this Apply selected reads as done; one group's source taken for both
+    // would put the other's item in conflict with the source it already has.
+    const idByTitle = (title: string) => created.find((m) => m.title === title)!.id;
+    const finalised: SetupContext = {
+      ...CTX,
+      sources: { [DECLARED]: { materialId: idByTitle(EXPECT.context.declared) }, [`declared:${second}`]: { materialId: idByTitle(second) } },
+    };
+    const sourceRows = (ctx: SetupContext) => planSetarSetup(s().db, ctx).proposals.filter((p) => p.field === 'source');
+    // (An item the owner pointed at another recension stays an exception, as it was.)
+    const done = sourceRows(finalised);
+    expect(done.filter((p) => p.state === 'proposed')).toEqual([]);
+    expect(bothSel.map((x) => done.find((p) => p.id === x.id)!.state)).toEqual(bothSel.map(() => 'correct'));
+    const bothToFirst: SetupContext = { ...CTX, sources: { [DECLARED]: finalised.sources![DECLARED]!, [`declared:${second}`]: finalised.sources![DECLARED]! } };
+    expect(sourceRows(bothToFirst).find((p) => p.itemId === secondItem)!.state).toBe('exception');
+    expect(done.find((p) => p.itemId === secondItem)!.state).toBe('correct');
+    expect(s().commitSetarSetup({ context: finalised, selections: bothSel, now: NOW })).toBeNull();
+    expect(s().db).toBe(inMemory);
+
     // --- A REFUSED WRITE: the store says nothing it cannot keep, and Try again writes
     useStore.setState({ db: OWNER });
-    const { storageSettled } = await import('../store/idb');
-    (globalThis as { __failNextWrite?: () => void }).__failNextWrite!();
+    failNext();
     expect(s().commitSetarSetup({ context: WITH_SOURCE, selections: selections.slice(0, 1), now: NOW })).toBeNull();
     await expect(storageSettled()).rejects.toThrow();
     // The retry is a REAL write of the state already in memory.
diff --git a/tests/setar-practice-proof.test.ts b/tests/setar-practice-proof.test.ts
index ad9c2b760f6f5079c2f0f6560f0b91055997aa71..7c120dc5e7e5f2ac886aaee9571738ad2868c81c 100644
--- a/tests/setar-practice-proof.test.ts
+++ b/tests/setar-practice-proof.test.ts
@@ -55,6 +55,11 @@ const REQUIRED_FAMILIES: RegExp[] = [
   /^an unconditional marker claim/,
   /^a delayed cue queued/,
   /^routine Start moved back into an effect$/,
+  /^a registry draft header printed without its CSV quoting$/,
+  /^a rename-log header printed without its CSV quoting$/,
+  /^every created study source finalised to the first group/,
+  /^a created study source never finalised on the screen$/,
+  /^a retry of an already-applied creation that writes nothing$/,
 ];
 
 describe('the Setar practice family proof route', () => {
diff --git a/tests/setar-practice-source.test.ts b/tests/setar-practice-source.test.ts
index 72a999a2e71cf590734c5f2cda112468c8a632e5..268ed400fe7cba00c18ca75a6fd065d179e5687c 100644
--- a/tests/setar-practice-source.test.ts
+++ b/tests/setar-practice-source.test.ts
@@ -136,6 +136,34 @@ function splitTop(line: string): string[] {
   return out;
 }
 
+/**
+ * One CSV line into its cells (a quote groups, `""` is a quote) and back. Written
+ * here on purpose: what the report PRINTS is judged by a reader and a writer that
+ * are not the scanner's own.
+ */
+function cellsOf(line: string): string[] {
+  const out: string[] = [];
+  let cur = '';
+  let quoted = false;
+  for (let i = 0; i < line.length; i += 1) {
+    const c = line[i]!;
+    if (quoted) {
+      if (c === '"' && line[i + 1] === '"') {
+        cur += '"';
+        i += 1;
+      } else if (c === '"') quoted = false;
+      else cur += c;
+    } else if (c === '"') quoted = true;
+    else if (c === ',') {
+      out.push(cur);
+      cur = '';
+    } else cur += c;
+  }
+  out.push(cur);
+  return out;
+}
+const csvLine = (cells: string[]) => cells.map((c) => (/[",\r\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',');
+
 const scopes = (index: Index) =>
   Object.fromEntries(index.sessions.flatMap((s) => s.resources.map((r) => [r.path, [...r.pieces].sort()])));
 const trusted = (index: Index) => Object.fromEntries(index.sessions.map((s) => [String(s.n), s.rosterTrusted]));
@@ -330,6 +358,72 @@ describe('the Setar archive intake, on temporary corpora', () => {
       expect(odd.text).toContain('       <its current path>,,<the missing path>');
       expect(odd.text).not.toContain('<the missing path>,<its current path>');
 
+      // --- A QUOTED EXTENSION HEADER: the report prints it as the file writes it ---
+      // A header cell holding a comma or a quote, printed bare, splits into two
+      // columns and shifts every cell after it — the printed header would no
+      // longer describe the printed draft. The scanner never notices (it reads
+      // the file's own header), so the PRINTED text is what is judged here.
+      const registryHeader = 'canonical_fa,form,piece,dastgah,composer,source,aliases_seen,sessions,roles_present,notes,"teacher, ""comment"""';
+      const registryCells = [...EXPECT.variants.real.header.split(','), 'teacher, "comment"'];
+      const extension = 'handed out, then "corrected"';
+      const plain = writeCorpus('real', future);
+      const quotedRegistry = writeCorpus('real', future);
+      roots.push(plain, quotedRegistry);
+      writeFileSync(
+        join(quotedRegistry, 'PIECES.csv'),
+        `${[registryHeader, ...CORPUS.registry.rows.map((r) => `${r},${csvLine([extension])}`)].join('\n')}\n`,
+      );
+      // The extra column changes no source meaning.
+      expect(scan(quotedRegistry).contentHash).toBe(scan(plain).contentHash);
+      const qr = report(quotedRegistry);
+      expect(qr.text).toContain(`UNCONFIRMED draft row for the header ${registryHeader}:`);
+      const printedDrafts = [...qr.text.matchAll(/UNCONFIRMED draft row for the header (.+):\n {7}(.+)\n/g)];
+      expect(printedDrafts.map((m) => cellsOf(m[2]!)[0]).sort()).toEqual(Object.keys(EXPECT.before.newIdentities).sort());
+      for (const m of printedDrafts) {
+        // Read by the PRINTED header: the same cells as the file's, and the
+        // draft has one cell for each — the key in canonical_fa, nothing else.
+        const header = cellsOf(m[1]!);
+        const draft = cellsOf(m[2]!);
+        expect(header).toEqual(registryCells);
+        expect(draft).toHaveLength(registryCells.length);
+        const byName = Object.fromEntries(header.map((h, i) => [h, draft[i]]));
+        expect(byName.canonical_fa).toBe(draft[0]);
+        expect(draft.slice(1).every((c) => c === '')).toBe(true);
+      }
+      // An amended row keeps its extension cell exactly as the owner wrote it.
+      expect(qr.data.rosterCandidates.find((c) => c.key === 'چهارپاره-مرادخانی')!.draft).toBe(`${EXPECT.variants.real.rosterDraft},${csvLine([extension])}`);
+
+      // The same for a rename log whose extension column holds a comma: the
+      // printed header and the template beneath it are one row's worth of columns.
+      const logHeader = 'new_path,"audit,note",old_path';
+      const logCells = ['new_path', 'audit,note', 'old_path'];
+      const quotedLog = writeCorpus('real');
+      roots.push(quotedLog);
+      writeFileSync(
+        join(quotedLog, 'RENAME-LOG.csv'),
+        `${[logHeader, ...CORPUS.renameLog.rows.map((r) => {
+          const [oldPath, newPath] = cellsOf(r);
+          return csvLine([newPath!, 'moved, by hand', oldPath!]);
+        })].join('\n')}\n`,
+      );
+      expect(scan(quotedLog).contentHash).toBe(inOrder.contentHash);
+      const ql = report(quotedLog).text.split('\n');
+      const heads = ql.flatMap((l, i) => (l === `       ${logHeader}` ? [i] : []));
+      // One printed header and template for each folder with a gap (sessions 1 and 2).
+      expect(heads).toHaveLength(2);
+      const MISSING = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';
+      const CURRENT = 'session-1-26-09-2023/نمونه-1.mp4';
+      for (const i of heads) {
+        const header = cellsOf(ql[i]!.trim());
+        expect(header).toEqual(logCells);
+        const filled = cellsOf(ql[i + 1]!.trim().replace('<the missing path>', MISSING).replace('<its current path>', CURRENT));
+        expect(filled).toHaveLength(logCells.length);
+        expect(Object.fromEntries(header.map((h, k) => [h, filled[k]]))).toEqual({ old_path: MISSING, new_path: CURRENT, 'audit,note': '' });
+      }
+      // The owner pastes that filled row; the exact chain now ends at the current name.
+      ownerAppendLog(quotedLog, [ql[heads[0]! + 1]!.trim().replace('<the missing path>', MISSING).replace('<its current path>', CURRENT)]);
+      expect(terminal(scan(quotedLog), 'session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4')).toBe(CURRENT);
+
       // --- INVALID INPUT EXPLAINS, AND NO DRAFT IS PRINTED AS CONFIRMED -------
       const bad = writeCorpus('real');
       roots.push(bad);
diff --git a/tests/setar-practice.browser.test.ts b/tests/setar-practice.browser.test.ts
index 1f646bcde2b36acd3aa89afa7afa6ed6c7eda3f0..4716623ee2a9b7cde7859d9ded2dc6479fb259a2 100644
--- a/tests/setar-practice.browser.test.ts
+++ b/tests/setar-practice.browser.test.ts
@@ -1034,7 +1034,79 @@ describe('Review Setar setup, interrupted', () => {
         await app.close();
       }
     }
-  }, 600_000);
+
+    // --- CREATING a study source for TWO groups, through the controls --------
+    // The registry declares two different study sources. The owner creates both
+    // in ONE Apply while the disk refuses, tries again, reloads and repeats.
+    // What the screen shows after "Saved." is the only trace of the group
+    // finalisation: each group must name ITS OWN source, never the first one's.
+    const FIRST_SOURCE = 'ردیف-میرزاعبدالله';
+    const SECOND_SOURCE = 'منبع-دوم-آزمون';
+    const twoGroups = structuredClone(base) as Db;
+    twoGroups.archiveSources[0]!.pieces = twoGroups.archiveSources[0]!.pieces.map((p) => (p.key === 'چهارمضراب-ماهور-صبا' ? { ...p, studySource: SECOND_SOURCE } : p));
+    for (const engine of ['chromium', 'webkit'] as Engine[]) {
+      const where = `${engine} (two created sources)`;
+      const app = await seeded(engine, { ...twoGroups, attachments: [] }, { width: 390, height: 844 });
+      const { page } = app;
+      try {
+        const before = await db(app);
+        await page.getByText('Review Setar setup').click();
+        await expect.poll(() => page.getByRole('combobox', { name: 'Instrument to review' }).inputValue()).toBe('inst-setar');
+        const firstSelect = () => page.getByRole('combobox', { name: `Study source for ${FIRST_SOURCE}` });
+        const secondSelect = () => page.getByRole('combobox', { name: `Study source for ${SECOND_SOURCE}` });
+        await firstSelect().selectOption('create');
+        await secondSelect().selectOption('create');
+        // Each row is offered against ITS OWN declared text.
+        const saba = await page.getByRole('group', { name: `Setup of ${SABA.title}` }).innerText();
+        expect(saba, where).toMatch(/Study source: none → a new study source/);
+        expect(saba, where).toContain(SECOND_SOURCE);
+
+        // A refused write is not "Saved."; what the owner chose stays on screen.
+        await breakStorage(page);
+        await page.getByRole('button', { name: /^Apply \d+ selected$/ }).click();
+        await page.getByText(/Not saved/).first().waitFor({ timeout: 10_000 });
+        expect(await page.getByText('Saved.').count(), where).toBe(0);
+        expect([await firstSelect().inputValue(), await secondSelect().inputValue()], where).toEqual(['create', 'create']);
+        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(before));
+
+        // Try again WRITES what is in memory: two sources, once.
+        await repairStorage(page);
+        await page.getByRole('button', { name: 'Try again' }).click();
+        await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
+        const after = await until(app, (x) => x, (x) => x.materials.length === before.materials.length + 2);
+        const made = after.materials.filter((m) => !before.materials.some((o) => o.id === m.id));
+        expect(made.map((m) => m.title).sort(), where).toEqual([FIRST_SOURCE, SECOND_SOURCE].sort());
+        const sourceId = (title: string) => made.find((m) => m.title === title)!.id;
+        // Each item points at the source of ITS group.
+        expect(after.items.find((i) => i.id === SABA.id)!.materialId, where).toBe(sourceId(SECOND_SOURCE));
+        expect(after.items.find((i) => i.id === MAHUR.id)!.materialId, where).toBe(sourceId(FIRST_SOURCE));
+        const moved = after.items.filter((i) => i.materialId !== before.items.find((o) => o.id === i.id)!.materialId);
+        expect(moved.filter((i) => i.materialId === sourceId(SECOND_SOURCE)).map((i) => i.id), where).toEqual([SABA.id]);
+        expect(moved.every((i) => [sourceId(FIRST_SOURCE), sourceId(SECOND_SOURCE)].includes(i.materialId!)), where).toBe(true);
+
+        // "Saved." finalised the screen: each group names its OWN source.
+        expect([await firstSelect().inputValue(), await secondSelect().inputValue()], where).toEqual([sourceId(FIRST_SOURCE), sourceId(SECOND_SOURCE)]);
+        expect(await page.getByRole('checkbox', { name: /^Study source of / }).count(), where).toBe(0);
+
+        // RELOAD and REPEAT: asking to create them again names the ones that
+        // exist — nothing is proposed, and no third source is made.
+        await reload(app);
+        await openSettings(app);
+        await page.getByText('Review Setar setup').click();
+        await firstSelect().selectOption('create');
+        await secondSelect().selectOption('create');
+        expect(await page.getByRole('checkbox', { name: /^Study source of / }).count(), where).toBe(0);
+        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(after));
+        await firstSelect().selectOption(sourceId(FIRST_SOURCE));
+        await secondSelect().selectOption(sourceId(SECOND_SOURCE));
+        expect(await page.getByRole('checkbox', { name: /^Study source of / }).count(), where).toBe(0);
+        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(after));
+        expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
+      } finally {
+        await app.close();
+      }
+    }
+  }, 900_000);
 });
 
 // ---------------------------------------------------------------------------
```

**Paths the rework touched:**

- `docs/setar-archive.md`
- `docs/setar-practice-reliability.md`
- `scripts/check-setar-practice-families.mjs`
- `scripts/scan-setar-classes.mjs`
- `src/domain/setarSetup.test.ts`
- `tests/setar-practice-proof.test.ts`
- `tests/setar-practice-source.test.ts`
- `tests/setar-practice.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
294aea7 Rework review findings: quoted headers in attention drafts, multi-group source creation proof

The attention report printed registry and rename-log headers without CSV
quoting, so a header cell holding a comma or a quote no longer described the
draft row beneath it. Headers now go through csvCell, and the named intake
test judges the printed header and template with an independent reader.

The setup checks now drive two study-source groups created in one Apply
through a refused write, Try again, group finalisation, reload and repeat,
with mutations that fail them.

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

f947129 Record the five new family mutations and the quoted-header and multi-group classes

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

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
