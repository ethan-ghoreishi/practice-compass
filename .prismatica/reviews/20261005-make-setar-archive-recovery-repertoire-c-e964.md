---
id: 20261005-make-setar-archive-recovery-repertoire-c-e964
contractId: 20261005-make-setar-archive-recovery-repertoire-c-e964
patchId: 33cf801043e6ae0e6ea55d8600a8a847b0480dc6
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: header-aware-source-metadata-drafts
    summary: "P2: formatAttention loses CSV quoting when printing registry and
      rename-log headers, so valid quoted extension headers no longer describe
      their accompanying draft rows."
    counterexample: 'The accepted header new_path,"audit,note",old_path prints as
      new_path,audit,note,old_path. Parsing that printed header with the filled
      three-cell template leaves old_path empty and assigns the old path to
      note. Instances: scripts/scan-setar-classes.mjs:945,984. Checked clean:
      parseCsvCells/readTable, new registry draft cells, raw-cell roster
      amendments, rename template column placement and downstream exact rename
      consumers. Extend setar durable intake preserves registry authority and
      exact rename evidence without changing media to quoted extension headers.'
  - family: setup-study-source-identity-and-idempotence
    summary: "P2: Required multi-group creation acknowledgement and failed-creation
      persistence proof remains absent from the named setup checks, despite the
      domain identity repair."
    counterexample: "The named browser test selects only mat-radif and never
      exercises create-group finalisation at SetarSetupReview.tsx:179-183. The
      domain test covers successful two-group creation/replay, but its
      failed-write case at setarSetup.test.ts:305 applies a kind change with an
      existing-source context. Missing proof instances: group finalisation,
      failed creation persistence, Try again and repeat/reload. Checked clean:
      deterministic group IDs, production domain creation/replay,
      existing-source instrument filtering, shared acknowledgement sequencing,
      ItemForm and Materials retries, and keyed course-source selection. Extend
      setar setup review is usable through controls and survives interruption
      and setar setup commits selected rows atomically idempotently and without
      collateral changes to those creation cases."
createdAt: 2026-10-06T11:11:06.099Z
sealedAt: 2026-10-06T11:47:56.476Z
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
- **Diff patch-id:** `33cf801043e6ae0e6ea55d8600a8a847b0480dc6`
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

- **setup-review-premise-and-acknowledgement** — P1: SetarSetupReview rebuilds before-values from the live plan for status, kind, stage, source, reference and class choices, bypassing stale-selection refusal. Its captured current key and unconditional saved reset also discard newer selections while persistence is pending. Preserve the reviewed premise/proposal and bind acknowledgement to the live draft.
  _counterexample:_ Choose Keeping fresh while an item is dormant, then sync it to repairing before Apply. The production component handler submits before={status:repairing} and writes maintenance; applySetarSetup refuses the original dormant premise. Choosing a second item while the first save is pending is cleared by the first saved callback without being written. Instances: SetarSetupReview.tsx:71,80,108-119,293-298,319. Consumers checked clean for this invariant: applySetarSetup with a carried premise, ArchiveRefresh typed metadata decisions, ui acknowledgement sequencing, ItemForm, Materials and MusicTerms live draft readers, immutable Recovery and StageDetail source actions. Extend setar setup commits selected rows atomically idempotently and without collateral changes and setar setup review is usable through controls and survives interruption; current browser drift is unrelated.
- **setup-study-source-identity-and-idempotence** — P1: Study-source creation loses group identity across acknowledgement and replay. The saved callback assigns the first selected item's materialId to every create group; new:<group> is not translated to its created id for retries, and Try again omits source finalisation.
  _counterexample:_ Create sources for two distinct declarations in one Apply. The production handler creates two distinct materials but its saved callback sets both source selectors to the first material. Replaying one original create selection against the resulting database is rejected as stale instead of a no-op. Instances: setarSetup.ts:398,511,524-537; SetarSetupReview.tsx:301-307,319. Consumers checked clean: per-group creation within one domain commit, explicit existing-source selection and instrument filtering, ItemForm createdSource retry, Materials draft.id retry, keyed course-source reuse. Extend setar setup commits selected rows atomically idempotently and without collateral changes and setar setup review is usable through controls and survives interruption to multi-group creation, failed creation persistence and unchanged replay.
- **practice-sound-pending-request-lifecycle** — P2: testPracticeSound queues unsuperseded callbacks on resume promises and calls resume twice per suspended tap. Old test/recovery requests can sound together when a later gesture resumes the context, violating the no-queued-old-tones acceptance.
  _counterexample:_ With a suspended context whose resume promises remain pending, call testPracticeSound three times: six promises accumulate and no pulse plays. Later prime the context, mark it running and resolve the earlier promises: six late oscillator pulses and three vibrations are emitted. Instances: practiceCue.ts:133-146; Settings Test practice sound; ActiveBlock SoundNote and its RoutineRunner reuse. Consumers checked clean: direct playPracticeCue while suspended, prime-only block/routine Start and Resume doors, atomic store marker claims and both boundary callers. Extend practice sound reuses one gesture primed context across all start and resume doors and practice sound keeps one context primed only by taps and never queues a cue to pending requests that later settle.
- **header-aware-source-metadata-drafts** — P2: The rename-log attention template prints the actual header but always puts old and new paths in the first two columns. Valid reordered or extended headers produce incorrect exact rename declarations.
  _counterexample:_ For new_path,timestamp,old_path, formatAttention emits <the missing path>,<its current path>,. Filling those placeholders puts the old path into new_path, the current path into timestamp and leaves old_path empty. Reversing just old_path/new_path reverses the declaration. Instance: scan-setar-classes.mjs:982-983. Consumers checked clean: readTable/buildIndex rename readers honour header names; new registry drafts map header names; roster amendments target sessions and preserve other raw cells; app rename consumers follow exact graph pairs. Extend setar durable intake preserves registry authority and exact rename evidence without changing media with reordered and extra-column rename logs.
- **setar-setup-direction-aware-values** — P2: SetarSetupReview pins independently authored before/after values and mixed evidence to LTR and puts direction on a bare item title instead of its title/detail group. The direction ledger records that title as a group, leaving the violation undetected.
  _counterexample:_ Organisation renders a Farsi gusheh, owner-written stage title or study-source title inside span dir=ltr at SetarSetupReview.tsx:240-246. Its organisation title is strong dir=auto at 234, while the containing detail group has no direction. Instances include kind/gusheh, stage and source output in show(), and evidence interpolating composer, dastgah, stage and source labels in setarSetup.ts. Consumers checked clean for the same new-value surfaces: ArchiveRefresh DifferenceRow and Recovery authored-value isolates, MusicalTermField suggestions and RoutineRunner bare-URL title group. Extend portable term and recovery controls preserve direction focus and scroll ownership to setup rows and correct direction.test.ts:195 rather than endorsing the bare title.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/setar-practice-reliability.md b/docs/setar-practice-reliability.md
index 82b6a0cebadda0a8cfb0f1616b062e001f55eef9..932da970c051998c245ccd2d7d4d5eacbacfe1b8 100644
--- a/docs/setar-practice-reliability.md
+++ b/docs/setar-practice-reliability.md
@@ -212,6 +212,10 @@ having touched nothing.
 | term suggestions back to a datalist only | `src/components/MusicalTermField.tsx` | ac-12 | failed (caught) |
 | removal from a pathway that also unbinds the item | `src/store/useStore.ts` | ac-16 | failed (caught) |
 | removal from a pathway by deleting the item | `src/store/useStore.ts` | ac-16 | failed (caught) |
+| a Test sound request that plays after a later tap | `src/components/practiceCue.ts` | ac-14 | failed (caught) |
+| a setup choice re-premised from the live plan | `src/components/SetarSetupReview.tsx` | ac-11 | failed (caught) |
+| a created study source forgotten once it exists (replay turns stale) | `src/domain/setarSetup.ts` | ac-10 | failed (caught) |
+| a rename template that ignores the log header | `scripts/scan-setar-classes.mjs` | ac-1 | failed (caught) |
 
 Recorded 2026-10-06: all 26 caught, every source restored byte for byte. The
 first run MISSED one — a cue queued on a not-running context went unnoticed by
diff --git a/scripts/check-setar-practice-families.mjs b/scripts/check-setar-practice-families.mjs
index 9d1dce2a8907adc7e4efda5659a35141b318c17f..073e8f6a7a5741b65c57a5452f045aa7207fbced 100644
--- a/scripts/check-setar-practice-families.mjs
+++ b/scripts/check-setar-practice-families.mjs
@@ -209,7 +209,7 @@ export const MUTATIONS = [
   {
     name: 'no resume or state gate in the prime',
     file: 'src/components/practiceCue.ts',
-    find: "    if (context.state !== 'running') {\n      // INVOKED now, inside the gesture; its promise is only observed.\n      Promise.resolve(context.resume()).then(update, update);\n    }",
+    find: "    if (context.state !== 'running') {\n      // INVOKED now, inside the gesture; its promise is only observed.\n      resumed = Promise.resolve(context.resume()).then(update, update);\n    }",
     replace: '',
     test: 'practice sound reuses one gesture primed context across all start and resume doors',
   },
@@ -258,6 +258,34 @@ export const MUTATIONS = [
     replace: '      removeFromPathway: (itemId, pathwayId) => {\n        if (pathwayId) { get().deleteItem(itemId); return null; }',
     test: 'pathway removal and restoration visibly retain the existing owned item',
   },
+  {
+    name: 'a Test sound request that plays after a later tap',
+    file: 'src/components/practiceCue.ts',
+    find: "    if (mine === gesture && c === context && c.state === 'running') playPracticeCue();",
+    replace: "    if (c === context && c.state === 'running') playPracticeCue();",
+    test: 'practice sound keeps one context primed only by taps and never queues a cue',
+  },
+  {
+    name: 'a setup choice re-premised from the live plan',
+    file: 'src/components/SetarSetupReview.tsx',
+    find: '    const sent = selectionsOf(draftRef.current);',
+    replace: '    const sent = selectionsOf(draftRef.current).map((x) => ({ ...x, before: plan.proposals.find((p) => p.id === x.id)?.before ?? x.before }));',
+    test: 'setar setup review is usable through controls and survives interruption',
+  },
+  {
+    name: 'a created study source forgotten once it exists (replay turns stale)',
+    file: 'src/domain/setarSetup.ts',
+    find: '  return db.materials.some((m) => m.id === made) ? { materialId: made } : v;',
+    replace: '  return v;',
+    test: 'setar setup commits selected rows atomically idempotently and without collateral changes',
+  },
+  {
+    name: 'a rename template that ignores the log header',
+    file: 'scripts/scan-setar-classes.mjs',
+    find: "    line(`       ${logCols.map((h) => (h === 'old_path' ? '<the missing path>' : h === 'new_path' ? '<its current path>' : '')).join(',')}`);",
+    replace: "    line('       <the missing path>,<its current path>');",
+    test: 'setar durable intake preserves registry authority and exact rename evidence without changing media',
+  },
 ];
 
 const isBrowser = (file) => file.includes('.browser.');
diff --git a/scripts/scan-setar-classes.mjs b/scripts/scan-setar-classes.mjs
index 893d8b54b1c9f0bf349362b05cf89fb1c8f77424..af8187ad2ee0c9d1de114935bce34e7e3ffe4916 100644
--- a/scripts/scan-setar-classes.mjs
+++ b/scripts/scan-setar-classes.mjs
@@ -979,8 +979,10 @@ export function formatAttention(r) {
     line(g.unlogged.length ? '     files in that folder that no log row names:' : '     every file in that folder is already named by the log.');
     for (const u of g.unlogged) line(`       ${u}`);
     line('     If a missing name was renamed to one of these, append ONE exact row per file to RENAME-LOG.csv:');
-    line(`       ${(r.logHeader.length ? r.logHeader : ['old_path', 'new_path']).join(',')}`);
-    line(`       <the missing path>,<its current path>${r.logHeader.length > 2 ? ','.repeat(r.logHeader.length - 2) : ''}`);
+    // One cell per header COLUMN, by name — a reordered or extended log keeps old and new in their own columns.
+    const logCols = r.logHeader.includes('old_path') && r.logHeader.includes('new_path') ? r.logHeader : ['old_path', 'new_path'];
+    line(`       ${logCols.join(',')}`);
+    line(`       ${logCols.map((h) => (h === 'old_path' ? '<the missing path>' : h === 'new_path' ? '<its current path>' : '')).join(',')}`);
     line('     Only you know which became which: nothing here pairs them by number, size or similarity. Unpaired, the old name stays "not described".');
   }
   line();
diff --git a/src/components/SetarSetupReview.tsx b/src/components/SetarSetupReview.tsx
index 76a361923b299b254bedf3ffeea34ddddbde1f0c..e385bb0c05586d8368f8e41e1c9c10e4d7ddd1d8 100644
--- a/src/components/SetarSetupReview.tsx
+++ b/src/components/SetarSetupReview.tsx
@@ -1,9 +1,10 @@
-import { useMemo, useState, type ReactNode } from 'react';
+import { useMemo, useRef, useState, type ReactNode } from 'react';
 import { useStore } from '../store/useStore';
 import {
   ITEM_STATUS_LABELS,
   SETAR_ARCHIVE_ID,
   archiveFor,
+  setupSourceId,
   canonicalStringify,
   planSetarSetup,
   type ID,
@@ -38,25 +39,64 @@ const KIND: Record<string, string> = {
   improvisation: 'improvisation',
 };
 
-function show(db: PracticeDB, v: SetupValue | undefined): string {
-  if (!v) return '—';
-  if ('status' in v) return ITEM_STATUS_LABELS[v.status];
-  if ('itemType' in v) return `${KIND[v.itemType] ?? v.itemType}${v.gusheh ? ` · ${v.gusheh}` : ''}`;
+/** A value as text, split into generated English and the owner's own words. */
+type Part = { text: string; authored?: boolean };
+function parts(db: PracticeDB, v: SetupValue | undefined): Part[] {
+  if (!v) return [{ text: '—' }];
+  if ('status' in v) return [{ text: ITEM_STATUS_LABELS[v.status] }];
+  if ('itemType' in v) return [{ text: `${KIND[v.itemType] ?? v.itemType}${v.gusheh ? ' · ' : ''}` }, ...(v.gusheh ? [{ text: v.gusheh, authored: true }] : [])];
   if ('stageId' in v) {
-    const st = v.stageId ? db.pathwayStages.find((s) => s.id === v.stageId) : undefined;
-    return v.stageId ? (st ? `${st.code}${st.title !== st.code ? ` · ${st.title}` : ''}` : 'another stage') : 'not placed';
+    if (!v.stageId) return [{ text: 'not placed' }];
+    const st = db.pathwayStages.find((s) => s.id === v.stageId);
+    return st ? [{ text: `${st.code}${st.title !== st.code ? ` · ${st.title}` : ''}`, authored: true }] : [{ text: 'another stage' }];
   }
   if ('materialId' in v) {
-    if (!v.materialId) return 'none';
-    if (v.materialId.startsWith('new:')) return 'a new study source';
-    return db.materials.find((m) => m.id === v.materialId)?.title ?? 'another study source';
+    if (!v.materialId) return [{ text: 'none' }];
+    if (v.materialId.startsWith('new:')) return [{ text: 'a new study source' }];
+    const title = db.materials.find((m) => m.id === v.materialId)?.title;
+    return title ? [{ text: title, authored: true }] : [{ text: 'another study source' }];
   }
-  if ('catalogRefs' in v) return v.catalogRefs?.length ? `answers ${v.catalogRefs.length}` : 'answers none';
-  return v.linked ? 'linked' : 'unlinked';
+  if ('catalogRefs' in v) return [{ text: v.catalogRefs?.length ? `answers ${v.catalogRefs.length}` : 'answers none' }];
+  return [{ text: v.linked ? 'linked' : 'unlinked' }];
+}
+const show = (db: PracticeDB, v: SetupValue | undefined): string => parts(db, v).map((x) => x.text).join('');
+
+/** The same value for the screen: generated English isolated LTR, the owner's words each resolving their own direction. */
+function Value({ db, v }: { db: PracticeDB; v: SetupValue | undefined }) {
+  return (
+    <>
+      {parts(db, v).map((x, i) =>
+        x.authored ? (
+          <span key={i} dir="auto">
+            {x.text}
+          </span>
+        ) : (
+          <span key={i} dir="ltr">
+            {x.text}
+          </span>
+        ),
+      )}
+    </>
+  );
 }
 
 const same = (a: unknown, b: unknown) => canonicalStringify(a) === canonicalStringify(b);
 
+/** What the owner chose AND the value they saw when they chose it — the premise a commit is checked against. */
+type Pick = { before: SetupValue; after: SetupValue };
+interface Draft {
+  /** id → the pick (null: deliberately left as it is). */
+  choices: Record<string, Pick | null>;
+  /** The rows SHOWN when choosing began, with the premise they were shown with: only these may be selected by default — a row that arrives later is shown, never auto-joined. */
+  seen: Record<string, Pick> | null;
+}
+
+const selectionsOf = (d: Draft): SetupSelection[] =>
+  [...new Set([...Object.keys(d.seen ?? {}), ...Object.keys(d.choices)])].flatMap((id) => {
+    const pick = id in d.choices ? d.choices[id] : d.seen?.[id];
+    return pick && !same(pick.after, pick.before) ? [{ id, before: pick.before, after: pick.after }] : [];
+  });
+
 export default function SetarSetupReview() {
   const db = useStore((s) => s.db);
   const commit = useStore((s) => s.commitSetarSetup);
@@ -67,23 +107,31 @@ export default function SetarSetupReview() {
   const [instrumentId, setInstrumentId] = useState<ID>(archive?.instrumentId ?? '');
   const [pathwayId, setPathwayId] = useState<ID>('');
   const [sources, setSources] = useState<NonNullable<SetupContext['sources']>>({});
-  // id → the value chosen (null: deliberately left as it is).
-  const [choices, setChoices] = useState<Record<string, SetupValue | null>>({});
-  // The rows SHOWN when the owner started choosing: only these may be
-  // selected by default — a row that arrives later is shown, never auto-joined.
-  const [seen, setSeen] = useState<Set<string> | null>(null);
+  // The draft is written by the handlers (state for the screen, a ref for the
+  // save that settles later) — never mirrored from an effect.
+  const [draft, setDraftState] = useState<Draft>({ choices: {}, seen: null });
+  const draftRef = useRef(draft);
+  const setDraft = (next: Draft) => {
+    draftRef.current = next;
+    setDraftState(next);
+  };
 
   const context: SetupContext = useMemo(
     () => ({ instrumentId, ...(pathwayId ? { pathwayId } : {}), sources }),
     [instrumentId, pathwayId, sources],
   );
   const plan = useMemo(() => (instrumentId ? planSetarSetup(db, context) : null), [db, context, instrumentId]);
-  // Derived once per review (React's guarded set-during-render pattern).
-  if (plan && !seen) setSeen(new Set(plan.proposals.map((p) => p.id)));
+  // Derived once per review (React's guarded set-during-render pattern): each
+  // proposed row is selected with the premise it is SHOWN with.
+  if (plan && !draft.seen) {
+    setDraft({
+      ...draft,
+      seen: Object.fromEntries(plan.proposals.flatMap((p) => (p.state === 'proposed' && p.after ? [[p.id, { before: p.before, after: p.after }]] : []))),
+    });
+  }
 
   const restart = () => {
-    setChoices({});
-    setSeen(null);
+    setDraft({ choices: {}, seen: null });
     saves.reset('setup');
   };
 
@@ -105,21 +153,41 @@ export default function SetarSetupReview() {
     );
   }
 
-  const chosenFor = (p: SetupProposal): SetupValue | undefined => {
-    if (p.id in choices) return choices[p.id] ?? undefined;
-    return p.state === 'proposed' && seen?.has(p.id) ? p.after : undefined;
-  };
-  const choose = (id: string, v: SetupValue | null) => setChoices((c) => ({ ...c, [id]: v }));
+  const chosenFor = (p: SetupProposal): Pick | undefined => (p.id in draft.choices ? (draft.choices[p.id] ?? undefined) : draft.seen?.[p.id]);
+  // The pick carries what the owner SAW (`p.before` NOW is what the store checks it against).
+  const choose = (p: SetupProposal, after: SetupValue | null) =>
+    setDraft({ ...draftRef.current, choices: { ...draftRef.current.choices, [p.id]: after ? { before: p.before, after } : null } });
   const status = plan.proposals.filter((p) => p.field === 'status');
   const rows = plan.proposals.filter((p) => p.field !== 'status');
   const byItem = new Map<ID, SetupProposal[]>();
   for (const p of rows) byItem.set(p.itemId, [...(byItem.get(p.itemId) ?? []), p]);
-  const selections: SetupSelection[] = plan.proposals.flatMap((p) => {
-    const after = chosenFor(p);
-    return after && !same(after, p.before) ? [{ id: p.id, before: p.before, after }] : [];
-  });
+  const selections = selectionsOf(draft);
   const title = (id: ID) => db.items.find((i) => i.id === id)?.title ?? id;
 
+  // ONE save, for what is on screen NOW: the settle reads the live draft, so a
+  // second item chosen while this write is pending is written next, never cleared.
+  const save = () => {
+    const sent = selectionsOf(draftRef.current);
+    saves.run('setup', canonicalStringify(sent), () => commit({ context, selections: sent }), {
+      current: () => canonicalStringify(selectionsOf(draftRef.current)),
+      again: save,
+      saved: () => {
+        setDraft({ choices: {}, seen: null });
+        // A source made here is, from now on, THAT group's source — each group
+        // its own — so a rerun reads it as done rather than making another.
+        const made = useStore.getState().db.materials;
+        setSources((cur) =>
+          Object.fromEntries(
+            Object.entries(cur).map(([key, v]) => {
+              const id = setupSourceId(instrumentId, key);
+              return [key, 'create' in v && made.some((m) => m.id === id) ? { materialId: id } : v];
+            }),
+          ),
+        );
+      },
+    });
+  };
+
   return (
     <SetupShell>
       <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
@@ -193,13 +261,11 @@ export default function SetarSetupReview() {
           type="button"
           className="btn btn-sm"
           style={{ alignSelf: 'flex-start' }}
-          onClick={() =>
-            setChoices((c) => {
-              const next = { ...c };
-              for (const p of status) if (p.state !== 'correct' && !/—/.test(p.evidence)) next[p.id] = p.choices[0]!.after;
-              return next;
-            })
-          }
+          onClick={() => {
+            const choices = { ...draftRef.current.choices };
+            for (const p of status) if (p.state !== 'correct' && !/—/.test(p.evidence)) choices[p.id] = { before: p.before, after: p.choices[0]!.after };
+            setDraft({ ...draftRef.current, choices });
+          }}
         >
           Choose every item without a note
         </button>
@@ -211,10 +277,10 @@ export default function SetarSetupReview() {
                 aria-label={`Keeping fresh: ${title(p.itemId)}`}
                 disabled={p.state === 'correct'}
                 checked={p.state === 'correct' || !!chosenFor(p)}
-                onChange={(e) => choose(p.id, e.target.checked ? p.choices[0]!.after : null)}
+                onChange={(e) => choose(p, e.target.checked ? p.choices[0]!.after : null)}
               />
-              <span className="small grow" style={{ textAlign: 'start' }}>
-                <span dir="auto">{title(p.itemId)}</span>{' '}
+              <span className="small grow" dir="auto" style={{ textAlign: 'start' }}>
+                <span>{title(p.itemId)}</span>{' '}
                 <span className="tiny faint" dir="ltr">
                   {p.evidence}
                 </span>
@@ -230,17 +296,19 @@ export default function SetarSetupReview() {
           const open = ps.filter((p) => p.state !== 'correct');
           if (open.length === 0) return null;
           return (
-            <div key={itemId} className="card card-quiet stack-sm" role="group" aria-label={`Setup of ${title(itemId)}`}>
-              <strong className="small" dir="auto" style={{ textAlign: 'start' }}>
-                {title(itemId)}
-              </strong>
+            <div key={itemId} className="card card-quiet stack-sm" role="group" dir="auto" aria-label={`Setup of ${title(itemId)}`} style={{ textAlign: 'start' }}>
+              <strong className="small">{title(itemId)}</strong>
               {open.map((p) => (
                 <div key={p.id} className="stack-sm">
                   <div className="tiny" style={{ textAlign: 'start' }}>
-                    <span dir="ltr">
-                      {FIELD[p.field]}: {show(db, p.before)}
-                      {p.state === 'proposed' ? ` → ${show(db, p.after)}` : ''}
-                    </span>
+                    <span dir="ltr">{FIELD[p.field]}: </span>
+                    <Value db={db} v={p.before} />
+                    {p.state === 'proposed' ? (
+                      <>
+                        <span dir="ltr"> → </span>
+                        <Value db={db} v={p.after} />
+                      </>
+                    ) : null}
                   </div>
                   <div className="tiny faint" style={{ textAlign: 'start' }}>
                     <span dir="ltr">{p.evidence}</span>
@@ -251,7 +319,7 @@ export default function SetarSetupReview() {
                         type="checkbox"
                         aria-label={`${FIELD[p.field]} of ${title(itemId)}: ${show(db, p.after)}`}
                         checked={!!chosenFor(p)}
-                        onChange={(e) => choose(p.id, e.target.checked ? p.after! : null)}
+                        onChange={(e) => choose(p, e.target.checked ? p.after! : null)}
                       />
                       <span dir="ltr">Apply</span>
                     </label>
@@ -259,10 +327,10 @@ export default function SetarSetupReview() {
                     <select
                       className="input"
                       aria-label={`${FIELD[p.field]} of ${title(itemId)}`}
-                      value={p.choices.findIndex((c) => same(c.after, chosenFor(p)))}
+                      value={p.choices.findIndex((c) => same(c.after, chosenFor(p)?.after))}
                       onChange={(e) => {
                         const i = Number(e.target.value);
-                        choose(p.id, i < 0 ? null : p.choices[i]!.after);
+                        choose(p, i < 0 ? null : p.choices[i]!.after);
                       }}
                     >
                       <option value={-1}>Leave it as it is</option>
@@ -284,40 +352,15 @@ export default function SetarSetupReview() {
       </div>
 
       <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
-        <button
-          type="button"
-          className="btn btn-primary"
-          disabled={selections.length === 0}
-          onClick={() => {
-            const key = canonicalStringify(selections);
-            saves.run('setup', key, () => commit({ context, selections }), {
-              current: () => key,
-              again: () => undefined,
-              saved: () => {
-                setChoices({});
-                setSeen(null);
-                // A study source made here is named from now on, so a rerun
-                // reads it as done rather than making another.
-                setSources((s) =>
-                  Object.fromEntries(
-                    Object.entries(s).map(([k, v]) => {
-                      if (!('create' in v)) return [k, v];
-                      const madeFor = selections.find((x) => x.id.startsWith('source:'));
-                      const id = madeFor ? useStore.getState().db.items.find((i) => i.id === madeFor.id.split(':')[1])?.materialId : undefined;
-                      return [k, id ? { materialId: id } : v];
-                    }),
-                  ),
-                );
-              },
-            });
-          }}
-        >
+        <button type="button" className="btn btn-primary" disabled={selections.length === 0} onClick={save}>
           Apply {selections.length} selected
         </button>
-        <SaveStatus
-          ack={saves.states.setup}
-          onRetry={() => saves.run('setup', saves.states.setup!.carried, () => commit({ context, selections }))}
-        />
+        <SaveStatus ack={saves.states.setup} onRetry={save} />
+        {saves.states.setup?.status === 'refused' ? (
+          <button type="button" className="btn btn-sm" onClick={restart}>
+            Look again
+          </button>
+        ) : null}
       </div>
     </SetupShell>
   );
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index 4b795752a21b5cf183761cc89e9d0a73c7911fcf..2f4d57d566d08d5e96422de788cf39cd8933ae07 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -188,11 +188,14 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceEditor.tsx", tagName: "li", classValue: "row between" },
-  // Review Setar setup (this lane): a declared source's own text, then each
-  // item's own title in the Keeping fresh list and on its organisation card.
+  // Review Setar setup (this lane): a declared source's own text, an owner's
+  // value in a before/after line (its own isolate), then the two GROUPS —
+  // a Keeping fresh row and an organisation card — each resolving from its
+  // bare title, the group's first strong text.
   { file: "components/SetarSetupReview.tsx", tagName: "span", classValue: "" },
   { file: "components/SetarSetupReview.tsx", tagName: "span", classValue: "" },
-  { file: "components/SetarSetupReview.tsx", tagName: "strong", classValue: "small" },
+  { file: "components/SetarSetupReview.tsx", tagName: "span", classValue: "small grow" },
+  { file: "components/SetarSetupReview.tsx", tagName: "div", classValue: "card card-quiet stack-sm" },
   { file: "pages/ActiveBlock.tsx", tagName: "div", classValue: "eyebrow" },
   { file: "pages/ActiveBlock.tsx", tagName: "div", classValue: "stack-sm" },
   { file: "pages/ActiveBlock.tsx", tagName: "span", classValue: "" },
@@ -663,6 +666,8 @@ const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
   // value the archive proposes are authored independently of each other.
   { file: 'components/ArchiveRefresh.tsx', snippet: "<span dir=\"auto\">{sg.from || '—'}</span>" },
   { file: 'components/ArchiveRefresh.tsx', snippet: '<span dir="auto">{sg.to}</span>' },
+  // Review Setar setup: each owner-authored before/after value, in its own isolate.
+  { file: 'components/SetarSetupReview.tsx', snippet: '<span key={i} dir="auto">' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="auto">{b.constraint}</span>' },
   // Instrument names used to be tracked here too, one exact snippet per site.
   // A sealed review found that shape structurally insufficient FOUR times
@@ -711,6 +716,9 @@ const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
  * call site can see whether its OWN return value is isolated.
  */
 const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
+  // Review Setar setup: generated labels and evidence (authored values inside it carry their own bidi isolate).
+  { file: 'components/SetarSetupReview.tsx', snippet: '<span dir="ltr">{p.evidence}</span>' },
+  { file: 'components/SetarSetupReview.tsx', snippet: '<span key={i} dir="ltr">' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{recs.best.reason}</span>' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{rec.reason}</span>' },
   { file: 'pages/Today.tsx', snippet: 'due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>' },
diff --git a/src/components/practiceCue.test.ts b/src/components/practiceCue.test.ts
index 7dd9f51a4e72f423fea702177eea26c27874cc78..ac43ecbf104a864783c4265049851f226708c53f 100644
--- a/src/components/practiceCue.test.ts
+++ b/src/components/practiceCue.test.ts
@@ -10,7 +10,7 @@ import { afterEach, describe, expect, it, vi } from 'vitest';
 
 type Log = { e: string; [k: string]: unknown }[];
 
-function fakeAudio(log: Log, opts: { ctorThrows?: boolean; resume?: 'ok' | 'throws' | 'rejects' | 'hangs' } = {}) {
+function fakeAudio(log: Log, opts: { ctorThrows?: boolean; resume?: 'ok' | 'throws' | 'rejects' | 'hangs' | 'manual' } = {}) {
   class Ctx {
     state: string = 'suspended';
     currentTime = 5;
@@ -32,6 +32,8 @@ function fakeAudio(log: Log, opts: { ctorThrows?: boolean; resume?: 'ok' | 'thro
       if (opts.resume === 'throws') throw new Error('refused');
       if (opts.resume === 'rejects') return Promise.reject(new Error('rejected'));
       if (opts.resume === 'hangs') return new Promise(() => undefined);
+      // Settles only when the test says so — never changes the state itself.
+      if (opts.resume === 'manual') return new Promise<void>((done) => log.push({ e: 'pending', done }));
       this.setState('running');
       return Promise.resolve();
     }
@@ -158,6 +160,34 @@ describe('the practice sound module', () => {
     cue.testPracticeSound();
     await flush();
     expect(log.filter((x) => x.e === 'start')).toHaveLength(2);
+
+    // --- PENDING REQUESTS never sound late ---------------------------------
+    // Three taps whose resume has not settled: ONE resume each (not two), and
+    // when the context is later readied by another tap and the old promises
+    // finally settle, no earlier request plays.
+    log = [];
+    cue = await load(log, { resume: 'manual' });
+    cue.testPracticeSound();
+    cue.testPracticeSound();
+    cue.testPracticeSound();
+    expect(log.filter((x) => x.e === 'resume')).toHaveLength(3);
+    const settle = () => log.filter((x) => x.e === 'pending').forEach((x) => (x.done as () => void)());
+    const ctx2 = log.find((x) => x.e === 'ctor')!.ctx as { setState(s: string): void };
+    ctx2.setState('running'); // a later gesture readied it
+    cue.primePracticeSound(); // that tap supersedes every pending Test request
+    settle();
+    await flush();
+    expect(log.filter((x) => x.e === 'start')).toEqual([]);
+    expect(log.filter((x) => x.e === 'vibrate')).toEqual([]);
+    // The LATEST tap's own request does play when its resume lands.
+    log = [];
+    cue = await load(log, { resume: 'manual' });
+    cue.testPracticeSound();
+    cue.testPracticeSound();
+    (log.find((x) => x.e === 'ctor')!.ctx as { setState(s: string): void }).setState('running');
+    settle();
+    await flush();
+    expect(log.filter((x) => x.e === 'start')).toHaveLength(2); // the latest request only
   });
 });
 
diff --git a/src/components/practiceCue.ts b/src/components/practiceCue.ts
index cabc9a4aa088ac9829eb7b70ff773df1b53d4c28..a4601eab56117bcd6c3431df72e3c9f3395196f6 100644
--- a/src/components/practiceCue.ts
+++ b/src/components/practiceCue.ts
@@ -29,6 +29,9 @@ type Ctor = new () => AudioContext;
 let context: AudioContext | null = null;
 let refused = false;
 let state: PracticeSoundState = 'off';
+// Bumped by every tap that readies the sound: a Test sound request whose
+// resume lands after a LATER tap is an old request, and plays nothing.
+let gesture = 0;
 const listeners = new Set<() => void>();
 
 function audioCtor(): Ctor | undefined {
@@ -58,12 +61,15 @@ function update(): void {
  * one was closed — only then, so two never coexist), and asks a suspended one
  * to resume. A refusal, a rejection or a promise that never settles is
  * absorbed: starting practice never waits on sound, and never fails for it.
+ * Returns the one resume this tap asked for (it settles, never rejects), if any.
  */
-export function primePracticeSound(): void {
+export function primePracticeSound(): Promise<void> | undefined {
+  gesture += 1;
+  let resumed: Promise<void> | undefined;
   const Ctx = audioCtor();
   if (!Ctx) {
     update();
-    return;
+    return undefined;
   }
   try {
     if (!context || context.state === 'closed') {
@@ -76,7 +82,7 @@ export function primePracticeSound(): void {
     }
     if (context.state !== 'running') {
       // INVOKED now, inside the gesture; its promise is only observed.
-      Promise.resolve(context.resume()).then(update, update);
+      resumed = Promise.resolve(context.resume()).then(update, update);
     }
   } catch {
     // A constructor that throws, or a resume() that throws: unavailable until
@@ -84,6 +90,7 @@ export function primePracticeSound(): void {
     refused = !context;
   }
   update();
+  return resumed;
 }
 
 /** The cue's shape, in one place: two short 880 Hz pulses. */
@@ -131,25 +138,20 @@ export function playPracticeCue(): void {
  * touches no clock, marker, record or wake lock.
  */
 export function testPracticeSound(): void {
-  primePracticeSound();
+  const resumed = primePracticeSound();
+  const mine = gesture;
   const c = context;
   if (!c) return;
   if (c.state === 'running') {
     playPracticeCue();
     return;
   }
-  // The resume this very tap asked for: play when (and only if) it lands. A
-  // resume that throws, rejects or never settles simply plays nothing.
-  try {
-    Promise.resolve(c.resume()).then(
-      () => {
-        if (c === context && c.state === 'running') playPracticeCue();
-      },
-      () => undefined,
-    );
-  } catch {
-    // best-effort only
-  }
+  // The resume this very tap asked for (never a second one): play when, and
+  // only if, it lands while this is still the latest tap. A resume that throws,
+  // rejects or never settles plays nothing, and an older tap's never plays late.
+  resumed?.then(() => {
+    if (mine === gesture && c === context && c.state === 'running') playPracticeCue();
+  });
 }
 
 function subscribe(fn: () => void): () => void {
diff --git a/src/domain/setarSetup.test.ts b/src/domain/setarSetup.test.ts
index 44269f711577a0dc79cd824c326c5f275761977b..b9701c7aaf889825622068892791ebe98bc1afbd 100644
--- a/src/domain/setarSetup.test.ts
+++ b/src/domain/setarSetup.test.ts
@@ -273,6 +273,31 @@ describe('the Setar setup review', () => {
     expect(s().commitSetarSetup({ context: named, selections: again.filter((p) => p.state === 'correct').map((p) => ({ id: p.id, before: p.before, after: p.before })), now: NOW })).toBeNull();
     expect(s().db).toBe(afterCreate);
 
+    // --- TWO DISTINCT GROUPS created in ONE apply keep their own identity ------
+    // Each declared text is its own study source; replaying the very same
+    // selections (a retry after a refused write, a second tab) names the
+    // sources already made — a no-op, never stale and never a second source.
+    const two = structuredClone(OWNER) as PracticeDB;
+    const second = 'منبع-دوم-آزمون';
+    two.archiveSources[0]!.pieces = two.archiveSources[0]!.pieces.map((p) => (p.key === 'چهارمضراب-ماهور-صبا' ? { ...p, studySource: second } : p));
+    const bothCreate: SetupContext = { ...CTX, sources: { [DECLARED]: { create: true }, [`declared:${second}`]: { create: true } } };
+    const bothSel = planSetarSetup(two, bothCreate).proposals.filter((p) => p.field === 'source' && p.state === 'proposed').map((p) => sel(p));
+    const secondItem = idOf(two, 'چهارمضراب-ماهور-صبا');
+    expect(bothSel.some((x) => x.id === `source:${secondItem}`)).toBe(true);
+    const first = applySetarSetup(two, bothCreate, bothSel, NOW);
+    if (!first.ok) throw new Error(first.reason);
+    const madeTwo = first.db.materials.filter((m) => !two.materials.some((o) => o.id === m.id));
+    expect(madeTwo.map((m) => m.title).sort()).toEqual([EXPECT.context.declared, second].sort());
+    const materialOf = (db: PracticeDB, itemId: string) => db.items.find((i) => i.id === itemId)!.materialId;
+    expect(materialOf(first.db, secondItem)).toBe(madeTwo.find((m) => m.title === second)!.id);
+    expect(materialOf(first.db, idOf(two, 'درامد-ماهور-ردیف-میرزاعبدالله'))).toBe(madeTwo.find((m) => m.title === EXPECT.context.declared)!.id);
+    const replay = applySetarSetup(first.db, bothCreate, bothSel, NOW);
+    if (!replay.ok) throw new Error(replay.reason);
+    expect(replay.db).toBe(first.db);
+    // A group whose source exists but a later row arrives: it joins THAT source, once.
+    const lateTwo = applySetarSetup(first.db, bothCreate, bothSel.slice(0, 1), NOW);
+    expect(lateTwo.ok && lateTwo.db.materials.length).toBe(first.db.materials.length);
+
     // --- A REFUSED WRITE: the store says nothing it cannot keep, and Try again writes
     useStore.setState({ db: OWNER });
     const { storageSettled } = await import('../store/idb');
diff --git a/src/domain/setarSetup.ts b/src/domain/setarSetup.ts
index 81798189eaec5f9e91e701503a134437b2b31f79..83d7f456cfd20027b6091e4a5ec656cb12038933 100644
--- a/src/domain/setarSetup.ts
+++ b/src/domain/setarSetup.ts
@@ -1,6 +1,6 @@
 import type { ID, ItemStatus, ItemType, Material, Pathway, PracticeDB, PracticeItem } from './types';
 import type { SourcePiece } from './sourceArchive';
-import { archiveFor, lessonAssociations, sessionMembership } from './sourceArchive';
+import { archiveFor, lessonAssociations, sessionMembership, setupSourceId } from './sourceArchive';
 import { MIRZA_ABDOLLAH_RADIF } from './referenceCatalog';
 import { catalogForStage, stageIdFor } from './pathwaySeed';
 import { catalogReferenceId, resolveCatalogReference } from './courseSeed';
@@ -25,6 +25,15 @@ import { ITEM_STATUS_LABELS } from './labels';
 // ---------------------------------------------------------------------------
 
 /** The kinds the registry's own form vocabulary can establish. */
+/**
+ * An independently authored value inside generated English evidence, wrapped
+ * in a first-strong BIDI ISOLATE (U+2068…U+2069) — the native counterpart of
+ * `dir="auto"` — so a Farsi form, composer, stage or source title resolves its
+ * own direction instead of inheriting the sentence's. Nothing here detects a
+ * script or reorders text.
+ */
+const iso = (value: string): string => `\u2068${value}\u2069`;
+
 export type PieceKind = Extract<ItemType, 'gusheh' | 'full_piece' | 'exercise' | 'improvisation'>;
 
 export type KindFamily =
@@ -69,7 +78,7 @@ export function classifyPiece(piece: Pick<SourcePiece, 'form' | 'composer' | 'pr
   if (form === 'درامد') return { kind: 'gusheh', family: 'radif-daramad', why: 'The registry names it a درامد — the opening gusheh of its dastgāh.' };
   if (form === 'چهارپاره') {
     return composer
-      ? { kind: null, family: 'composed-chaharpareh', why: `A چهارپاره attributed to ${composer}: a radif section or a composed piece — yours to say.` }
+      ? { kind: null, family: 'composed-chaharpareh', why: `A چهارپاره attributed to ${iso(composer)}: a radif section or a composed piece — yours to say.` }
       : { kind: 'gusheh', family: 'radif-chaharpareh', why: 'A چهارپاره with no composer: a section of the radif.' };
   }
   if (form === 'رنگ' && !composer) {
@@ -81,9 +90,9 @@ export function classifyPiece(piece: Pick<SourcePiece, 'form' | 'composer' | 'pr
     return { kind: 'improvisation', family: 'improvisation', why: 'The registry names it a بداهه — your own improvisation, not a composed work.' };
   }
   if (COMPOSED_FORMS.has(form) || (form === 'رنگ' && composer)) {
-    return { kind: 'full_piece', family: 'composed', why: `The registry names it a ${form}${composer ? ` by ${composer}` : ''}.` };
+    return { kind: 'full_piece', family: 'composed', why: `The registry names it a ${iso(form)}${composer ? ` by ${iso(composer)}` : ''}.` };
   }
-  return { kind: null, family: 'unknown', why: form ? `The registry's form «${form}» does not say what kind of item this is.` : 'The registry gives no form.' };
+  return { kind: null, family: 'unknown', why: form ? `The registry's form «${iso(form)}» does not say what kind of item this is.` : 'The registry gives no form.' };
 }
 
 /** What the import USED to seed — `full_piece` for every non-گوشه — so a seeded value is told from an owner's choice. */
@@ -190,7 +199,7 @@ export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
   const stageIds = new Set(pathway ? db.pathwayStages.filter((s) => s.pathwayId === pathway.id).map((s) => s.id) : []);
   const stageName = (id: ID | undefined) => {
     const st = id ? db.pathwayStages.find((s) => s.id === id) : undefined;
-    return st ? `${st.code}${st.title && st.title !== st.code ? ` · ${st.title}` : ''}` : 'a stage of another pathway';
+    return st ? iso(`${st.code}${st.title && st.title !== st.code ? ` · ${st.title}` : ''}`) : 'a stage of another pathway';
   };
   const materials = db.materials.filter((m) => m.instrumentId === instrumentId);
   const pieceOf = (item: PracticeItem): SourcePiece | undefined =>
@@ -307,9 +316,9 @@ export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
           continue;
         }
         target = radifStageFor(pathway.id, r.term.id);
-        why = `A gusheh of ${r.term.name}.`;
+        why = `A gusheh of ${iso(r.term.name)}.`;
         if (!target || !stageIds.has(target)) {
-          exception(`A gusheh of ${r.term.name}, but this pathway has no stage for it.`);
+          exception(`A gusheh of ${iso(r.term.name)}, but this pathway has no stage for it.`);
           continue;
         }
       } else if (kind === 'full_piece') {
@@ -395,7 +404,9 @@ export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
     if (!key) continue;
     const choice = ctx.sources?.[key];
     const before: SetupValue = { materialId: i.materialId ?? null };
-    const target = choice && 'materialId' in choice ? choice.materialId : choice ? `new:${key}` : undefined;
+    // A source this review already made for the group is THE source, not a second.
+    const made = setupSourceId(instrumentId, key);
+    const target = choice && 'materialId' in choice ? choice.materialId : choice ? (materials.some((m) => m.id === made) ? made : `new:${key}`) : undefined;
     const label = groups.get(key)!.label;
     const id = `source:${i.id}`;
     if (!target) continue; // the group's own question comes first
@@ -405,7 +416,7 @@ export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
       const piece = pieceOf(i);
       return piece ? classifyPiece(piece) : undefined;
     })();
-    const why = key.startsWith('declared:') ? `The registry declares it from «${label}».` : `It answers a ${MIRZA_ABDOLLAH_RADIF.name} reference.`;
+    const why = key.startsWith('declared:') ? `The registry declares it from «${iso(label)}».` : `It answers a ${iso(MIRZA_ABDOLLAH_RADIF.name)} reference.`;
     if (i.materialId === target) {
       push({ id, itemId: i.id, field: 'source', state: 'correct', before, after, choices: [], evidence: why });
     } else if (reading?.family === 'composed-chaharpareh' || reading?.family === 'radif-reng' || reading?.family === 'provisional') {
@@ -419,7 +430,7 @@ export function planSetarSetup(db: PracticeDB, ctx: SetupContext): SetupPlan {
         state: 'exception',
         before,
         choices: [{ label: 'Use this study source instead', after }],
-        evidence: `${why} You set «${current?.title ?? 'another source'}»; that stays unless you choose.`,
+        evidence: `${why} You set «${iso(current?.title ?? 'another source')}»; that stays unless you choose.`,
       });
     } else {
       push({ id, itemId: i.id, field: 'source', state: 'proposed', before, after, choices: [], evidence: why });
@@ -467,6 +478,12 @@ export type SetupOutcome =
 
 const same = (a: unknown, b: unknown) => canonicalStringify(a) === canonicalStringify(b);
 
+function existingSource(db: PracticeDB, instrumentId: ID, v: SetupValue): SetupValue {
+  if (!('materialId' in v) || !v.materialId?.startsWith('new:')) return v;
+  const made = setupSourceId(instrumentId, v.materialId.slice('new:'.length));
+  return db.materials.some((m) => m.id === made) ? { materialId: made } : v;
+}
+
 /** What a selection's field holds NOW — so a row that vanished because it is done reads as done. */
 function currentOf(db: PracticeDB, id: string): SetupValue | undefined {
   const [field, itemId, lessonId] = id.split(':');
@@ -503,7 +520,9 @@ export function applySetarSetup(db: PracticeDB, ctx: SetupContext, selections: S
   const byId = new Map(plan.proposals.map((p) => [p.id, p]));
   const stale: string[] = [];
   const todo: { p: SetupProposal; after: SetupValue }[] = [];
-  for (const sel of selections) {
+  for (const chosen of selections) {
+    // `new:<group>` names the source to MAKE; once it exists it is that source.
+    const sel = { ...chosen, after: existingSource(db, ctx.instrumentId, chosen.after) };
     const p = byId.get(sel.id);
     const offered = p ? [...(p.after && p.state === 'proposed' ? [p.after] : []), ...p.choices.map((c) => c.after)] : [];
     // ALREADY DONE is not stale: the field holds exactly what was chosen —
@@ -526,13 +545,16 @@ export function applySetarSetup(db: PracticeDB, ctx: SetupContext, selections: S
     if (!target.startsWith('new:')) return target;
     const key = target.slice('new:'.length);
     if (!created.has(key)) {
-      const group = plan.sourceGroups.find((g) => g.key === key)!;
-      const m = createMaterial(
-        { instrumentId: ctx.instrumentId, title: group.label, sourceType: group.kind === 'reference' ? 'radif' : 'other' },
-        now,
-      );
-      materials = [...materials, m];
-      created.set(key, m.id);
+      const id = setupSourceId(ctx.instrumentId, key);
+      if (!materials.some((x) => x.id === id)) {
+        const group = plan.sourceGroups.find((g) => g.key === key)!;
+        const m = createMaterial(
+          { instrumentId: ctx.instrumentId, title: group.label, sourceType: group.kind === 'reference' ? 'radif' : 'other' },
+          now,
+        );
+        materials = [...materials, { ...m, id }];
+      }
+      created.set(key, id);
     }
     return created.get(key)!;
   };
diff --git a/src/domain/sourceArchive.ts b/src/domain/sourceArchive.ts
index d1b2cd4f96939806a92474fdb06f3d0ffa7d2299..4451cceb62eef52152a9ca312387c68a88818c58 100644
--- a/src/domain/sourceArchive.ts
+++ b/src/domain/sourceArchive.ts
@@ -207,6 +207,16 @@ export function sourceResourceId(archiveId: string, path: string): ID {
   return `src-${stableHash(`${archiveId}${NUL}asset${NUL}${path}`)}`;
 }
 
+/**
+ * Deterministic id for the study source "Review Setar setup" creates for one
+ * evidence group of one instrument — so the same selection, replayed, names
+ * the source it already made instead of making (or refusing) another. It is
+ * the group's key, never a title, that decides it; never cross-instrument.
+ */
+export function setupSourceId(instrumentId: ID, groupKey: string): ID {
+  return `src-${stableHash(`${instrumentId}${NUL}setup-source${NUL}${groupKey}`)}`;
+}
+
 // --- decoding --------------------------------------------------------------
 
 /** The fixed role vocabulary, byte-exact from the archive's own contract. */
diff --git a/tests/setar-practice-source.test.ts b/tests/setar-practice-source.test.ts
index 479bbca626f3b1478bf18f8667ceefe614c0ad7c..72a999a2e71cf590734c5f2cda112468c8a632e5 100644
--- a/tests/setar-practice-source.test.ts
+++ b/tests/setar-practice-source.test.ts
@@ -310,6 +310,26 @@ describe('the Setar archive intake, on temporary corpora', () => {
       expect(moved['session-2-24-10-2023/نت-درآمد-شور-ردیف-میرزاعبدالله-2.pdf']).toEqual(['درآمد-شور-ردیف-میرزاعبدالله']);
       expect(moved['session-2-24-10-2023/نت-کرشمه-شور-ردیف-میرزاعبدالله.pdf']).toBeUndefined();
 
+      // --- A REORDERED, EXTENDED RENAME LOG: the template follows the header ---
+      // `new_path,timestamp,old_path` is a valid log. The same pairs mean the
+      // same thing, and the printed row puts each path in ITS OWN column — the
+      // old path in old_path, the current path in new_path, timestamp empty.
+      const reordered = writeCorpus('real');
+      roots.push(reordered);
+      const inOrder = scan(reordered);
+      writeFileSync(
+        join(reordered, 'RENAME-LOG.csv'),
+        `${['new_path,timestamp,old_path', ...CORPUS.renameLog.rows.map((r) => {
+          const [oldPath, newPath, at] = r.split(',');
+          return `${newPath},${at},${oldPath}`;
+        })].join('\n')}\n`,
+      );
+      expect(scan(reordered).contentHash).toBe(inOrder.contentHash);
+      const odd = report(reordered);
+      expect(odd.text).toContain('new_path,timestamp,old_path');
+      expect(odd.text).toContain('       <its current path>,,<the missing path>');
+      expect(odd.text).not.toContain('<the missing path>,<its current path>');
+
       // --- INVALID INPUT EXPLAINS, AND NO DRAFT IS PRINTED AS CONFIRMED -------
       const bad = writeCorpus('real');
       roots.push(bad);
diff --git a/tests/setar-practice.browser.test.ts b/tests/setar-practice.browser.test.ts
index 3f2d453f3333df50253639bfec72af69f0e61058..1f646bcde2b36acd3aa89afa7afa6ed6c7eda3f0 100644
--- a/tests/setar-practice.browser.test.ts
+++ b/tests/setar-practice.browser.test.ts
@@ -979,6 +979,56 @@ describe('Review Setar setup, interrupted', () => {
         // The row the owner cleared is offered again, as a proposal, not applied.
         expect(await page.getByRole('group', { name: `Setup of ${TORK2.title}` }).getByRole('checkbox', { name: /^Place of / }).count(), where).toBe(1);
         expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(after));
+
+        // --- THE PREMISE the owner saw is the one the commit checks ------------
+        // Keeping fresh is chosen for a RESTING item; another device then moves
+        // it to Repairing. Apply must refuse the dormant premise it was shown,
+        // never rebuild it from the live row and write maintenance over it.
+        await page.getByText(/Keeping fresh — choose which items/).click();
+        await fresh(JANG.title).check();
+        const drift = structuredClone(await db(app)) as Db;
+        drift.items.find((i) => i.id === JANG.id)!.status = 'repairing';
+        publishRemote(remote, remoteStateText(drift), await hashState(drift), 100);
+        await page.getByRole('button', { name: 'Sync now' }).click();
+        await until(app, (x) => x.items.find((i) => i.id === JANG.id)!.status, (v) => v === 'repairing');
+        const drifted = await db(app);
+        await page.getByRole('button', { name: /^Apply \d+ selected$/ }).click();
+        await page.getByText(/changed since the review was shown/).waitFor({ timeout: 10_000 });
+        expect(JSON.stringify(await db(app)), where).toBe(JSON.stringify(drifted));
+        expect(await page.getByText('Saved.').count(), where).toBe(0);
+        await page.getByRole('button', { name: 'Look again' }).click();
+        // Looking again starts from what is there now: the stale choice is gone.
+        expect(await fresh(JANG.title).isChecked(), where).toBe(false);
+
+        // --- A SECOND CHOICE made while the first save is pending is not lost ---
+        // Hold IndexedDB so the first write cannot settle, choose another item,
+        // then let storage answer: "Saved." may only speak for what was written,
+        // so the newer choice is written next instead of being cleared unseen.
+        await fresh(SABA.title).check();
+        await page.evaluate(
+          () =>
+            new Promise<void>((resolve) => {
+              const w = window as unknown as { __held?: boolean };
+              const open = indexedDB.open('practice-compass');
+              open.onsuccess = () => {
+                const store = open.result.transaction('kv', 'readwrite').objectStore('kv');
+                w.__held = true;
+                const ping = () => {
+                  if (w.__held) store.get('__hold').onsuccess = ping;
+                };
+                ping();
+                resolve();
+              };
+            }),
+        );
+        await page.getByRole('button', { name: /^Apply \d+ selected$/ }).click();
+        await page.getByText('Saving…').first().waitFor({ timeout: 10_000 });
+        await fresh(JANG.title).check();
+        await page.evaluate(() => ((window as unknown as { __held?: boolean }).__held = false));
+        await until(app, (x) => x.items.find((i) => i.id === JANG.id)!.status, (v) => v === 'maintenance');
+        const settled = await db(app);
+        expect([settled.items.find((i) => i.id === SABA.id)!.status, settled.items.find((i) => i.id === JANG.id)!.status], where).toEqual(['maintenance', 'maintenance']);
+        await page.getByText('Saved.').first().waitFor({ timeout: 10_000 });
         expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
       } finally {
         await app.close();
@@ -1334,6 +1384,47 @@ describe('recovery and difference controls, on a phone', () => {
           expect((await focused(page)).name, where).toMatch(/^Restore /);
           facts = await layoutFacts(page);
           expect([facts.pageScrolls, facts.sideways, facts.pinned], where).toEqual([false, false, []]);
+
+          // --- REVIEW SETAR SETUP: each row a group, each value its own direction
+          // A Farsi title beside English generated copy and a Farsi stage; an
+          // English title beside Farsi values. The group resolves from its bare
+          // title, the owner's values from themselves, the generated copy is LTR.
+          await page.getByText('Review Setar setup').click();
+          if (await page.getByText('Which instrument is your Setar?').count()) {
+            await page.locator('details', { hasText: 'Which instrument is your Setar?' }).last().locator('select').selectOption('inst-setar');
+          }
+          await page.getByRole('combobox', { name: 'Pathway to place items in' }).selectOption('setar-radif');
+          await page.getByRole('combobox', { name: 'Study source for ردیف-میرزاعبدالله' }).selectOption('mat-radif');
+          const MAHUR_TITLE = by(DARAMAD_MAHUR).title;
+          const facts4 = async (title: string) => {
+            const card = page.getByRole('group', { name: `Setup of ${title}` });
+            await card.waitFor({ timeout: 10_000 });
+            return card.evaluate((el) => {
+              const strong = el.querySelector('strong')!;
+              const cs = getComputedStyle(el);
+              return {
+                direction: cs.direction,
+                align: cs.textAlign,
+                titleDir: strong.getAttribute('dir'),
+                bareTitleFirst: el.firstElementChild === strong,
+                owner: [...el.querySelectorAll('span[dir="auto"]')].map((n) => [n.textContent ?? '', getComputedStyle(n).direction]),
+                generated: [...el.querySelectorAll('span[dir="ltr"]')].map((n) => getComputedStyle(n).direction),
+              };
+            });
+          };
+          for (const [title, want, hasValue] of [[MAHUR_TITLE, 'rtl', true], [LONG_EN, 'ltr', false]] as const) {
+            const f = await facts4(title);
+            expect(f.direction, `${where}: ${title} resolves from its own title`).toBe(want);
+            expect([f.align, f.titleDir, f.bareTitleFirst], `${where}: ${title}`).toEqual(['start', null, true]);
+            expect(f.generated.every((d) => d === 'ltr'), where).toBe(true);
+            // An owner's Farsi value reads RTL even inside an English-titled card, and vice versa.
+            expect(f.owner.filter(([t]) => /[؀-ۿ]/.test(t)).every(([, d]) => d === 'rtl'), `${where}: ${title}`).toBe(true);
+            if (hasValue) expect(f.owner.length, `${where}: ${title} shows an owner value`).toBeGreaterThan(0);
+          }
+          // The evidence's embedded owner words sit in bidi isolates (U+2068..U+2069) inside LTR copy.
+          expect(await page.getByRole('group', { name: `Setup of ${MAHUR_TITLE}` }).innerText(), where).toMatch(/\u2068[^\u2069]+\u2069/);
+          facts = await layoutFacts(page);
+          expect([facts.pageScrolls, facts.sideways, facts.pinned], where).toEqual([false, false, []]);
           expect(app.pageErrors.map((e) => e.message), where).toEqual([]);
         } finally {
           await app.close();
```

**Paths the rework touched:**

- `docs/setar-practice-reliability.md`
- `scripts/check-setar-practice-families.mjs`
- `scripts/scan-setar-classes.mjs`
- `src/components/SetarSetupReview.tsx`
- `src/components/direction.test.ts`
- `src/components/practiceCue.test.ts`
- `src/components/practiceCue.ts`
- `src/domain/setarSetup.test.ts`
- `src/domain/setarSetup.ts`
- `src/domain/sourceArchive.ts`
- `tests/setar-practice-source.test.ts`
- `tests/setar-practice.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
9d0e8ff Rework review findings: setup premises, source identity, sound requests, rename template, setup direction

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>

241b9a4 Record the four new family mutations

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
