---
id: 20261023-make-practice-records-dependable-and-kee-34cc
contractId: 20261023-make-practice-records-dependable-and-kee-34cc
patchId: 6f72700abead19f0b088a6057abcf902ba96f67d
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: notes-recovery-idempotence
    summary: "P2: Recovery bases can lag or rewind across editor lifetimes and later
      successful whole-state writes, so reload duplicates the latest notes
      instead of recovering them exactly once (ItemNotes.tsx:163,171,238,248;
      notesDrafts.ts:61-67; useStore.ts:1873-1900,2618-2639; idb.ts:106-120)."
    counterexample: "Same HEAD 5ca41e2; one consolidated family. For both item and
      lesson owners: (1) Hold write A over original; unmount/reopen, type A plus
      more, acknowledge old A, then type A plus more again. The old callback
      rebases shared recovery to A, but the new editor rewinds it to original;
      reload before debounce or after refusing the newer write appends the
      latest text to A. (2) Start hydration replay of A and open/type in its
      editor before replay acknowledges; further typing after acknowledgement
      causes the same rewind. (3) Refuse a note write A; restore storage and let
      an ordinary store action persist the full state containing A; continue
      editing, then reload before debounce. Disk holds A but recovery still uses
      original, causing duplication. Repeat (3) with a refused kept-both
      conflict save: replay duplicates both preserved texts. Item/Routine Pause
      and linking a lesson item provide reachable ordinary persistence paths.
      Current component, recovery, replay and save-decision code reproduced
      these variants in memory for both owner kinds. Affected consumers:
      ItemDetail, ActiveBlock, keyed RoutineRunner and Lessons; editor/hydration
      acknowledgements, beginEdit/type, saveNotes conflict re-hold and
      subsequent whole-state persistence. Checked clean within scope:
      same-editor overlapping acknowledgements, token protection of newer
      drafts, successful explicit retry, item/lesson separation and gone-record
      refusal. Extend the exact test working note saves preserve newest text and
      refuse stale ownership across failures and replacement with these
      lifecycle cases for both owners and engines, including kept-both text.
      Close this one recovery-base family rather than only the remount symptom."
createdAt: 2026-10-23T23:31:17.241Z
sealedAt: 2026-10-23T23:43:02.852Z
---

# Review: Make practice records dependable and keep session choices aligned with the work being done

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261023-make-practice-records-dependable-and-kee-34cc
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/56
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `6f72700abead19f0b088a6057abcf902ba96f67d`
- **Computed by:** prismatica 0.11.0 · build sha256:a53354b36e378c8f · installed package, not registry-verified

## The Delta this change was framed from

# Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

_approved · about "practise-todays-recommendation"_

## Today

The practice loop stores unscoped results and uses them for item-wide status/spacing; routine time is separate from optional capture but skip credits any positive elapsed interval, contents are opaque, notes require Done, plan order cannot be edited, and class/theory opportunities are not consistently integrated.

## Instead

Use the scoped evidence and Working/Keep fresh return model in this proposal throughout the existing practice loop and its routine/plan entry paths. Record completed routine practice durably without requiring feedback; explicit skips log nothing; show contents and preserve item-bound autosaved notes. Use consistent remove/skip/move-on meanings across Plan and Routine, leaving unused time unallocated unless the owner deliberately rebuilds or changes duration. Reorder preview segments and include ordinary theory study through the shared eligibility/return policy. Keep class opportunities distinct from protected retention dates and fix the known slow apt route as bounded technical work.

## Keep

- r-local-first-offline
- r-no-silent-data-loss
- r-practice-completes-reviews
- r-explainable-scheduling
- r-pure-tested-domain
- r-one-instrument-per-session
- r-quick-start
- r-direction-aware-text
- r-no-gamification
- r-secrets-stay-on-device
- r-large-files-stay-on-nas

## New assumptions

_none_

## Show me

The named acceptance families below, using a two-item Setar Warm up created through the real UI, literal long-gap chunk/class counterexamples, failure/reload/restore states and Chromium plus WebKit histories; one focused proof route, full required checks and one bounded native-device observation.



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

**Approved intent:** `.prismatica/intents/20261023-make-practice-records-dependable-and-kee-34cc.md`

**Findings from the previous review:**

- **notes-recovery-idempotence** — P2: Overlapping note-save acknowledgements leave stale recovery bases and can delete a newer draft by text alone (ItemNotes.tsx:167-175,241; notesDrafts.ts:44-47; useStore.ts:2618-2626). Recovery must reproduce the latest owner draft exactly once.
  _counterexample:_ Both item and lesson owners: hold save A, type A plus more, acknowledge A, refuse the automatically queued newer write, then reload. The recovery copy still has the pre-A base, so replay appends A plus more to A; a previously kept-both save duplicates both competing texts. Also queue saves first then second, type first again before either acknowledgement, acknowledge first then second, and refuse the resulting third write. The old first acknowledgement drops the newest first draft; disk holds second and reload loses the latest first edit. Affects ItemDetail, ActiveBlock and RoutineRunner through ItemNotes, and Lessons through LessonNotes/DurableNotes, plus hydration replay. Checked clean: ordinary and conflicting save failure followed by successful Try again, item/lesson id separation, and gone-record refusal. Extend the exact test working note saves preserve newest text and refuse stale ownership across failures and replacement with both acknowledgement/failure/reload sequences for both owners; rework the entire recovery-base and draft-drop family.

**What changed since the previously reviewed head:**

```diff
diff --git a/docs/practice-session-model.md b/docs/practice-session-model.md
index e38aed2075e586d4917a9d11c62b08b36c8d95f4..0bd07c303410a89a89f18cf4ec88c0d479dd5d0b 100644
--- a/docs/practice-session-model.md
+++ b/docs/practice-session-model.md
@@ -154,7 +154,12 @@ draft kept on the device. After a reload, held drafts replay through the same
 decision before the app opens. Item and lesson ids never share a draft. When a
 write kept both texts, the device copy becomes that kept-both text, based on
 what the store held, so a retry or a reload never replays the old draft onto it
-a second time.
+a second time. The copy always holds the latest words typed, based on what
+IndexedDB last acknowledged: every landed write (editor or replay, through
+`noteWriteIssued`/`settleNoteDraft`) re-bases it on the text that landed, and
+it is dropped only when that text IS its words and no later write of the record
+is in flight — never by text alone. Overlapping acknowledgements followed by a
+refused write therefore replay the newest words exactly once.
 
 ## 9. Data and compatibility
 
diff --git a/src/components/ItemNotes.tsx b/src/components/ItemNotes.tsx
index c6607f095843f52f59445251b572f9413fcfb9cc..1043f2b7045aeb7bf36bd07f944c3108e9b19d3c 100644
--- a/src/components/ItemNotes.tsx
+++ b/src/components/ItemNotes.tsx
@@ -1,7 +1,7 @@
 import { useEffect, useRef, useState } from 'react';
 import { useStore, type NoteOwner, type NoteSaveOutcome } from '../store/useStore';
 import { storageSettled } from '../store/idb';
-import { dropNoteDraft, holdNoteDraft } from '../store/notesDrafts';
+import { heldNoteDraft, holdNoteDraft, noteWriteIssued, settleNoteDraft } from '../store/notesDrafts';
 
 // ---------------------------------------------------------------------------
 // Working notes — the item's ONE notebook, and the one editor for it (a
@@ -116,12 +116,14 @@ export function DurableNotes({
   /** Which write may still speak: only the latest acts on its outcome. */
   const saveSeq = useRef(0);
   /**
-   * The text IndexedDB last acknowledged for this record — what the device
-   * copy (`notesDrafts.ts`) is based on, so a replay after a reload compares
-   * against what was really on disk. The in-memory draft's `base` moves
-   * sooner: at each write, because the store holds that text from then on.
+   * The text IndexedDB last acknowledged for the record `key` — what the
+   * device copy (`notesDrafts.ts`) is based on, so a replay after a reload
+   * compares against what was really on disk. It moves on EVERY landed write
+   * of that record (they land in order), whoever issued it. The in-memory
+   * draft's `base` moves sooner: at each write, because the store holds that
+   * text from then on.
    */
-  const durable = useRef('');
+  const durable = useRef({ key: '', text: '' });
 
   function applyDraft(next: Draft | null) {
     draftRef.current = next;
@@ -151,21 +153,22 @@ export function DurableNotes({
     // Unchanged text writes nothing of its own — so a retry after a failed
     // write still WRITES, rather than reporting the old failure again.
     if (outcome === 'unchanged') persistAgain();
+    const token = noteWriteIssued(d.owner);
     // From here the STORE holds this text, whatever IndexedDB says, so what is
     // typed next is based on it — and when both texts were kept, the editor
     // shows what the record now holds.
     const after = outcome === 'merged' ? storedNotes(d.owner) : d.text;
     // The store re-held the device copy as the kept-both text over `prior`;
     // what is typed next is held over the same base.
-    if (outcome === 'merged') durable.current = prior;
+    if (outcome === 'merged' && durable.current.key === keyOf(d.owner)) durable.current.text = prior;
     const current = draftRef.current;
     if (current && keyOf(current.owner) === keyOf(d.owner)) {
       applyDraft({ ...current, base: after, ...(outcome === 'merged' ? { text: after } : {}) });
     }
     void storageSettled().then(
       () => {
-        dropNoteDraft(d.owner, after);
-        if (speak && saveSeq.current === seq) durable.current = after;
+        settleNoteDraft(d.owner, token, after);
+        if (durable.current.key === keyOf(d.owner)) durable.current.text = after;
         if (!speak || saveSeq.current !== seq) return;
         const now = draftRef.current;
         if (!now || keyOf(now.owner) !== keyOf(d.owner)) return;
@@ -228,7 +231,11 @@ export function DurableNotes({
 
   function beginEdit() {
     closing.current = false;
-    durable.current = saved;
+    // A copy still describing the text shown is based on what is really on
+    // disk (a write of it may still be in flight); otherwise — none held, or
+    // the record replaced since — the stored text is.
+    const held = heldNoteDraft(owner);
+    durable.current = { key: ownerKey, text: held && held.text === saved ? held.base : saved };
     setState({ phase: 'idle' });
     applyDraft({ owner, text: saved, base: saved });
   }
@@ -238,7 +245,7 @@ export function DurableNotes({
     if (!current || keyOf(current.owner) !== ownerKey) return;
     const next = { ...current, text };
     applyDraft(next);
-    holdNoteDraft(next.owner, { text: next.text, base: durable.current });
+    holdNoteDraft(next.owner, { text: next.text, base: durable.current.text });
     if (quietTimer.current) clearTimeout(quietTimer.current);
     quietTimer.current = setTimeout(() => {
       const d = draftRef.current;
diff --git a/src/store/notesDrafts.ts b/src/store/notesDrafts.ts
index 6a04b516f45292648f663343da88c37b89c32eb1..d45fde2d7e3c8d22dc655859770c14c6e92e725a 100644
--- a/src/store/notesDrafts.ts
+++ b/src/store/notesDrafts.ts
@@ -6,9 +6,9 @@ import type { NoteOwner } from './useStore';
 // Canonical notes live ONLY in the item or lesson (`notes`, through the
 // store). This is a temporary, owner-typed safety net for the gap before the
 // canonical write is acknowledged by IndexedDB: written synchronously on every
-// keystroke (localStorage acknowledges at once), dropped once the canonical
-// write it describes has landed, and replayed through the store's ordinary
-// `saveNotes` decision after a reload that interrupted it. It is never part of
+// keystroke (localStorage acknowledges at once), re-based on each canonical
+// write that lands, dropped once the latest one holds its words, and replayed
+// through the store's ordinary `saveNotes` decision after a reload that interrupted it. It is never part of
 // PracticeDB, a backup, an export or sync, and it never decides anything on
 // its own: `saveNotes` compares its `base` with what is stored, so a draft can
 // never silently overwrite newer text or recreate a deleted record.
@@ -40,16 +40,46 @@ export function holdNoteDraft(owner: NoteOwner, draft: NoteDraft): boolean {
   }
 }
 
-/** Forget this owner's draft — only while it still holds `text`, so newer words typed meanwhile survive. */
-export function dropNoteDraft(owner: NoteOwner, text: string): void {
+/** How many canonical writes of each owner's notes were issued — which one may drop the copy. */
+const issued = new Map<string, number>();
+
+/** A canonical write of this owner's notes was just issued; settle it with the returned token. */
+export function noteWriteIssued(owner: NoteOwner): number {
+  const n = (issued.get(keyFor(owner)) ?? 0) + 1;
+  issued.set(keyFor(owner), n);
+  return n;
+}
+
+/**
+ * The write `token` landed, so IndexedDB now holds `written` (writes land in
+ * order). The copy always holds the latest words typed: it is dropped only
+ * when those are exactly what landed AND no later write is still in flight —
+ * never by text alone — and otherwise re-based on what landed, so a replay
+ * compares against what is really on disk and reproduces the latest words
+ * exactly once.
+ */
+export function settleNoteDraft(owner: NoteOwner, token: number, written: string): void {
   try {
     const raw = localStorage.getItem(keyFor(owner));
-    if (raw && (JSON.parse(raw) as NoteDraft).text === text) localStorage.removeItem(keyFor(owner));
+    if (!raw) return;
+    const held = JSON.parse(raw) as NoteDraft;
+    if (held.text === written && issued.get(keyFor(owner)) === token) localStorage.removeItem(keyFor(owner));
+    else if (held.base !== written) holdNoteDraft(owner, { text: held.text, base: written });
   } catch {
     /* the safety net is best-effort; the canonical write already landed */
   }
 }
 
+/** This owner's held draft, if any. */
+export function heldNoteDraft(owner: NoteOwner): NoteDraft | null {
+  try {
+    const draft = JSON.parse(localStorage.getItem(keyFor(owner)) ?? 'null') as NoteDraft | null;
+    return draft && typeof draft.text === 'string' && typeof draft.base === 'string' ? draft : null;
+  } catch {
+    return null;
+  }
+}
+
 /** Every held draft, for replay after a reload. Unreadable entries are skipped, never thrown. */
 export function heldNoteDrafts(): { owner: NoteOwner; draft: NoteDraft }[] {
   const out: { owner: NoteOwner; draft: NoteDraft }[] = [];
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index da347b37f995f796584fdfa45da8b100122d24b2..8609dffedffcd2f34d759c2f8c570bbc95406313 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -1,7 +1,7 @@
 import { create } from 'zustand';
 import { createJSONStorage, persist } from 'zustand/middleware';
 import { clearBlobs, deleteBlob, idbStorage, storageSettled, storageWasEmpty } from './idb';
-import { dropNoteDraft, heldNoteDrafts, holdNoteDraft } from './notesDrafts';
+import { heldNoteDrafts, holdNoteDraft, noteWriteIssued, settleNoteDraft } from './notesDrafts';
 import { withRevision } from './revision';
 import { primePracticeSound } from '../components/practiceCue';
 import {
@@ -2612,8 +2612,8 @@ export const useHydrationStatus = create<HydrationStatus>(() => ({
  * Notes typed before a reload interrupted their canonical write are replayed
  * through the ordinary `saveNotes` decision — so a draft whose record is gone
  * stays on the device and recreates nothing, and one whose stored text changed
- * meanwhile keeps both. Each local copy is dropped once its write is
- * acknowledged.
+ * meanwhile keeps both. Each local copy is settled by its write's
+ * acknowledgement (`settleNoteDraft`), exactly like the editor's.
  */
 function replayNoteDrafts() {
   for (const { owner, draft } of heldNoteDrafts()) {
@@ -2622,8 +2622,9 @@ function replayNoteDrafts() {
     const { db } = useStore.getState();
     const record = owner.kind === 'item' ? db.items.find((i) => i.id === owner.id) : db.lessons.find((l) => l.id === owner.id);
     const written = outcome === 'merged' ? (record?.notes ?? '') : draft.text;
+    const token = noteWriteIssued(owner);
     void storageSettled().then(
-      () => dropNoteDraft(owner, written),
+      () => settleNoteDraft(owner, token, written),
       () => undefined,
     );
   }
diff --git a/tests/practice-session.browser.test.ts b/tests/practice-session.browser.test.ts
index 55ceefcf5db77d94f0bcb02b1e097c0001afc66e..d3e68506e1ff652cde1cd2e1fac28aa0b6b870f5 100644
--- a/tests/practice-session.browser.test.ts
+++ b/tests/practice-session.browser.test.ts
@@ -857,6 +857,94 @@ describe('notes without a Done dependency', () => {
           (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes,
           (n) => n === kept('their class words', 'my class words — and more'),
         );
+
+        // --- OVERLAPPING acknowledgements, then the next write refused --------
+        // For an item and for a class alike, a reload reproduces the newest
+        // words exactly once: a landed write re-bases the device copy, and an
+        // older acknowledgement never drops words typed after it.
+        const replaceOnDisk = async (change: (d: Db) => Db) => {
+          const st = (await readPersistedState(app)).state as { db: Db };
+          await writePersistedState(app, { ...st, db: change(st.db) }, SCHEMA_VERSION);
+        };
+        const owners = [
+          {
+            open: async () => {
+              await show(app, `/items/${PIECE}`);
+              await editShownNotes(page);
+              return notesBox(page);
+            },
+            landed: (want: string) => notesOf(app, PIECE, want),
+            replace: (theirs: string) =>
+              replaceOnDisk((d) => ({ ...d, items: d.items.map((i) => (i.id === PIECE ? { ...i, notes: theirs } : i)) })),
+          },
+          {
+            open: async () => {
+              await show(app, '/lessons');
+              const c = page.getByRole('article').filter({ hasText: 'Class 37' });
+              await c.getByRole('button', { name: /Class 37/ }).first().click();
+              await c.getByRole('button', { name: 'Edit Class notes' }).click();
+              return c.getByRole('textbox', { name: 'Class notes' });
+            },
+            landed: (want: string) =>
+              persistedUntil(app, (s) => (s.state as { db: Db }).db.lessons.find((l) => l.id === TWIN)?.notes, (n) => n === want),
+            replace: (theirs: string) =>
+              replaceOnDisk((d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === TWIN ? { ...l, notes: theirs } : l)) })),
+          },
+        ];
+        const refuseAfterRelease = async () => {
+          await breakStorage(page);
+          await releaseStorage(page);
+          await page.getByText(/Not saved/).waitFor();
+          await repairStorage(page);
+          await reload(app);
+        };
+        for (const [n, owner] of owners.entries()) {
+          // Held write A; more typed; A lands; the queued newer write refused.
+          let box = await owner.open();
+          await holdStorage(page);
+          await box.fill(`A${n}`);
+          await page.clock.runFor(1_000);
+          await page.getByText('Saving…').waitFor();
+          await box.fill(`A${n} — and more`);
+          await refuseAfterRelease();
+          await owner.landed(`A${n} — and more`);
+
+          // The same over a kept-both text: words refused, the record replaced
+          // underneath, the kept-both replay refused at load — then the overlap.
+          box = await owner.open();
+          await breakStorage(page);
+          await box.fill(`mine${n}`);
+          await page.clock.runFor(1_000);
+          await page.getByText(/Not saved/).waitFor();
+          await repairStorage(page);
+          await owner.replace(`theirs${n}`);
+          await page.evaluate(() => localStorage.setItem('pc-test-refuse-writes', '1'));
+          await reload(app);
+          await repairStorage(page);
+          await page.evaluate(() => localStorage.removeItem('pc-test-refuse-writes'));
+          box = await owner.open();
+          expect(await box.inputValue(), engine).toBe(kept(`theirs${n}`, `mine${n}`));
+          await holdStorage(page);
+          await box.fill(kept(`theirs${n}`, `mine${n} — and more`));
+          await page.clock.runFor(1_000);
+          await page.getByText('Saving…').waitFor();
+          await box.fill(kept(`theirs${n}`, `mine${n} — and more, still`));
+          await refuseAfterRelease();
+          await owner.landed(kept(`theirs${n}`, `mine${n} — and more, still`));
+
+          // Two writes queued, the first words typed again before either lands;
+          // first lands, then second, and the write carrying them is refused.
+          box = await owner.open();
+          await holdStorage(page);
+          await box.fill(`first${n}`);
+          await page.clock.runFor(1_000);
+          await page.getByText('Saving…').waitFor();
+          await box.fill(`second${n}`);
+          await page.clock.runFor(1_000);
+          await box.fill(`first${n}`);
+          await refuseAfterRelease();
+          await owner.landed(`first${n}`);
+        }
         expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
       } finally {
         await app.close();
```

**Paths the rework touched:**

- `docs/practice-session-model.md`
- `src/components/ItemNotes.tsx`
- `src/store/notesDrafts.ts`
- `src/store/useStore.ts`
- `tests/practice-session.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
5ca41e2 Rework review findings: settle note recovery copies by write, never by text

notes-recovery-idempotence. Invariant: the device copy of notes being typed
always holds the newest words, based on the text IndexedDB last acknowledged
for that record; only the latest issued write of that record may drop it, and
only when what landed is exactly those words. One choke point in
notesDrafts.ts: every canonical notes write takes a per-owner token
(noteWriteIssued); its acknowledgement (settleNoteDraft) drops the copy or
re-bases it on the landed text. Writes land in order, so the last settle is
what is on disk.

Consumers, each fixed or checked:
- DurableNotes.write acknowledgement (ItemDetail, ActiveBlock, RoutineRunner
  via ItemNotes; Lessons via LessonNotes/DurableNotes): fixed, settles by token;
  the editor's own disk-text ref is now keyed by record and moves on every
  landed write of it, not just the latest speaking one.
- beginEdit seed: fixed, takes the held copy's base only while that copy still
  describes the text shown (re-open while a write is in flight), else stored.
- type() hold: reads the keyed disk text.
- saveNotes kept-both re-hold: checked clean, based on record.notes.
- replayNoteDrafts (hydration): fixed, same token and settle path.
- dropNoteDraft: removed; no other hold/drop callers (grep, tsc).

Proof (family plan lives in the named browser test, both engines): "working
note saves preserve newest text and refuse stale ownership across failures and
replacement" now runs, for an item and for a class, (1) held write, more typed,
ack, refused newer write, reload; (2) the same over a kept-both text produced
by a refused replay at load; (3) two queued writes, first words retyped, acks
in order, refused third write, reload — each asserting the newest words exactly
once on disk. Mutation checks: on the previous code it fails with the
duplicate; with the drop reverted to text alone it fails losing the retyped
words. Limits: one competing writer per 
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Two differently named bound Setar items created through the real editor: natural completion and early Finish, omitted/partial/full optional capture, leave completion and reload. Assert BOTH persisted blocks and BOTH item histories/totals, truthful not-assessed presentation and untouched reviews/SR. Repeat binding aggregates into one block; an unbound segment stays unlogged. Include the reported first-item-only shape and identify any checked-clean path. _(proof: routine completion and history preserve all practised items without feedback)_
- [ ] **ac-2** — Table-driven store/domain proof of the shared session-control policy for Plan and Routine: remove before start, skip/remove not-yet-started work during a session, active/paused skip with elapsed time, keep partial practice through move-on, first/middle/final/all removal, repeated routine item after an earlier real occurrence, duplicate finish and reload/resume. Skips create zero practice; kept partial time is real; remaining order/targets stay unchanged and freed time is visibly unused. Explicit Plan regeneration/budget change and routine duration fitting can allocate again. Cover actual overtime without borrowing another target, protected completed records, and empty/completed outcomes. Plan move-on saves through Close before advancing; Routine keeps its lighter recording with no retention judgement. Finish write failure/retry retains a recoverable outcome and counts each real item once. Use independently expected minute totals for both flows, not just identical function names. _(proof: routine controls distinguish skipped time from partial practice across run transitions)_
- [ ] **ac-3** — Chromium/WebKit: Today, stage, pathway, bare URL and duration/essentials doors show/reach actual bound contents before starting. Start only from a tap; preview matches frozen run, full list states remain available while running, editing saved routine does not shift active identities, removing/skipping does not edit the saved routine or delete items. Named mobile controls and empty/unbound states are covered. Include preview removal and essentials filtering: the shorter contents/time shown are the ones started; no automatic refill of removed time. _(proof: routine contents and controls describe the exact run started from every doorway)_
- [ ] **ac-4** — Domain plus store: first/last/no-op/empty/single moves, repeated moves then swap/remove, and start/close sequence execute owner order with identical moved-segment minutes/roles/reasons/focus and no invented block. Remove leaves other allocations unchanged and shows unused capacity; explicit regeneration/budget choice is the allocation boundary, preserving generator floors/shares/caps. Cross-check pre-start and running skip/remove/move-on with the shared control family. Reorder logs no practice and cannot bypass deleted/moved-item, revision or day checks. _(proof: session plan reordering preserves segment identity allocation and execution order)_
- [ ] **ac-5** — Chromium/WebKit at phone and desktop widths: reorder with named keyboard/touch controls, keep focus usable and start/finish in displayed order. In the same finite journey, compare Plan and Routine removal before start, pending skip and early move-on: equivalent actions have consistent meanings, remaining durations do not silently increase, actual/remaining/unused time is truthful, and actual practice is kept through the appropriate existing save path. Check empty/completed outcomes and explicit regeneration/duration fitting without a new control wizard. Revision/day staleness stays visible without silently re-sorting edits; no drag dependency or horizontal overflow. _(proof: session plan move controls work by keyboard and touch without losing the draft)_
- [ ] **ac-6** — Chromium/WebKit: item detail, active block, bound routine and shared lesson editor; type then immediately navigate, collapse, Finish, cross a natural boundary, change item/lesson and ordinary reload. After acknowledged persistence recover exact latest text for the original owner, including clear-to-empty and Farsi composition. New owner never displays/saves the prior draft. Done is optional; practice facts and clock remain unchanged. _(proof: working note drafts survive exits boundaries and reload without Done)_
- [ ] **ac-7** — Delay/reorder/reject acknowledgements, type during a pending save, retry after store memory already changed, two editors with equal item/lesson ids, and import/sync/restore/reset/delete underneath an editor. Saved never precedes durability; newer words survive, failed text remains recoverable with retry/Copy, stale writes cannot resurrect records or overwrite replacement/remote notes, both competing texts remain preserved and recoverable under the simplest resolution consistent with the existing conflict model, without requiring a new conflict UI. Exercise rapid exit before debounce, not just waiting for autosave. _(proof: working note saves preserve newest text and refuse stale ownership across failures and replacement)_
- [ ] **ac-8** — Fixed decision table: all six results plus not_logged crossed with focused/explicit-whole/legacy-unknown evidence on Working/Keep fresh; whole child versus parent; due/future/unscheduled; same-day double close. Focused performable never promotes whole readiness or expands/resets/completes retention. Explicit whole stable can advance when eligible; same is neutral; no-assessment/routine capture/admin changes never fabricate retention. Store outcomes, not merely helpers, prove the boundaries. _(proof: scoped evidence separates focused progress from whole item retention and readiness)_
- [ ] **ac-9** — Literal high-SR unfinished-piece fixture (for example reps 8, interval 90) with focused success and same produces the documented 1–3-day Working return rather than repeating/expanding 90 days. A real explicit due whole-item check in Keep fresh retains honest spaced progression. Include user/manual/fixed/unknown future protection, auto future, due, no date, deliberate clear versus omitted, switching intention, repeated decline/rearm/reload and once-per-local-day progress. Match one preview decision to the exact saved item/open-row outcome and rationale. _(proof: working returns stay short while protected dates and retention spacing keep their authority)_
- [ ] **ac-10** — An unfinished/retained item committed to a class in four days with a 90-day review returns as class preparation without overwriting its protected date. Heavy practice today reduces repeats when an alternative exists; it returns on a later eligible day until its named lesson, including after a routine without feedback. Test only-candidate honest fallback, near versus later class, retarget/delete/pass/unassigned/archive/other-instrument classes, question-only entries, dormant exclusion, equal-score stable ties and parent/part opportunities. Today/build/regenerate/swap/fallback consume the same eligibility/return policy; urgency beats diversity. _(proof: class preparation and shared recommendation pools return useful work without repetition noise)_
- [ ] **ac-11** — Chromium/WebKit: focused versus explicit whole, unchanged and stable results on a high-SR unfinished piece, explicit readiness decision, class opportunity versus protected retention date, manual correction, no result, Back, local midnight and ordinary/plan entry. History preserves evidence scope; Why this date uses the same decision. No preselected whole-readiness promotion, lost close draft, duplicated date derivation or required extra text. _(proof: close and review screens explain scope readiness and next practice with the date actually saved)_
- [ ] **ac-12** — Create/edit Theory through the existing full Add path, with a title-only default and optional source; no auto-creation on load/regenerate. Fixed multi-session library shows an eligible reading_theory task being offered when urgent needs are covered, lowers its repeat after actual practice, and excludes it when absent/resting/other-instrument. Opposing short-budget and imminent-class fixtures keep the urgent anchor. Reorder/swap/routine/direct practice record normal blocks with scope, do not misclassify theory as repertoire, invent musical facts or violate minute floors/shares. _(proof: theory study uses ordinary practice items and earns bounded non urgent opportunities)_
- [ ] **ac-13** — Committed pre-upgrade v16 fixture plus supported older chain: migration is deterministic, clock-free and idempotent. Old blocks/ids/results/notes/counters/SR/dates/provenance/commitments/references/catalogue and attachment bytes survive; no whole scope/readiness or missing routine block is inferred. Cover current/new fields, missing legacy scope, invalid type/value, duplicate ids and too-new data. New schema round-trips through exports and canonical hashing; equal inputs on different dates produce equal data/hashes. _(proof: session model migration preserves history dates bytes and unresolved legacy meanings)_
- [ ] **ac-14** — Real store/browser inbound family across persist migrate AND merge, state/full import, sync pull/Keep remote, archive restore and cold-start recovery. Valid migrated/new data survives reload; malformed or too-new new semantics refuse without changing memory/disk/blobs. Active paused/running block/routine presence continues to defer/refuse replacement; fresh/legacy in-progress routines and dual-clock recovery preserve actual accumulated time. Full attachment bytes are proved outside WebKit Blob seeding. Update both-device compatibility is explicit; no older-schema silent field loss. _(proof: session model inbound doors preserve live practice and fail before replacing data)_
- [ ] **ac-15** — Execute the actual setup against temporary mirror+file and direct-source layouts with fast-index/slow-package, dead/refused, missing suite, healthy fallback, no matching Azure source, missing list and all-unavailable cases. Demonstrate the chosen bypass/fallback prevents reliance on the known slow route, preserves suites/components/signatures/third-party sources, and ends clearly within its own bound. No source-text heuristic alone, global apt changes in tests or longer install timeout. Deterministic local proof satisfies this acceptance before review/seal; a pre-ship live Actions run is not required. _(proof: ci browser setup avoids a fast index slow package mirror within the existing bounds)_
- [ ] **ac-16** — All three real suite workflows use the same bounded setup and lockfile-resolved Chromium/WebKit install before checks; retain CI/deploy check parity, PR-only Gate, cancellation, job/install bounds and tests-before-deploy. Adapt existing runner tests to execution semantics, with missing-engine/late-setup/bypassed-check negative fixtures; no new bespoke YAML/source scanner. Prove the setup and gate wiring locally before review/seal. The real Actions run is post-ship evidence and must pass before merge; its absence before ship is not a blocker. _(proof: ci release paths retain pinned dual engine provisioning and tests before publishing)_
- [ ] **ac-17** — One bounded native-device regression pass on the built HTTPS candidate: iPhone Safari AND installed PWA, 390px-class viewport, edit mixed Farsi/English notes while a routine changes item, dismiss the keyboard and use all five tabs, pause/resume after genuine idle and observe a real boundary cue/display wake. Record device/iOS/build and actual audible/wake outcome. No new calibration target, repeated UX taste sign-off or real NAS/media mutation; desktop WebKit cannot prove these physical/native properties. _(proof: manual:OWNER)_
- [ ] **ac-18** — One minimal OWNER product walkthrough using real Setar data on the built candidate: one unfinished piece being prepared for its named next class, focused chunk practice, its Next practice explanation, one Keep fresh item and one generated session plan. Record a brief judgement of whether the model and UX make sense for real practice. This is product acceptance only; do not manually recalculate dates, audit data correctness, supply a private export or broaden into a fresh product/taste review. Keep the separate native iPhone/sound check unchanged. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx, src/domain/repertoire.ts
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/io.ts
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx, src/domain/repertoire.ts matched changed file(s) src/domain/repertoire.ts, src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, the service worker, Layout and app-update code are untouched; the shared /settings route is only where the scheduling explanation also renders.

## point-this-device-at-the-nas — unchanged

No NAS base, reference or recording code changed; the shared /settings route is incidental.

## sync-devices-via-github — unchanged

syncEngine, githubSync and gitRemote are untouched; a pulled snapshot goes through the same validateDB, which now also checks the v17 fields (proved by session model inbound doors preserve live practice and fail before replacing data). As with every schema bump, both devices update before syncing; an older build refuses a v17 snapshot whole.

## practise-todays-recommendation — truth-proposed

Scoped results (focused/whole), Working/Keep-fresh returns, the shared candidate pool and autosaving notes change steps 2, 4, 6 and 7; update proposal in this lane.

## run-a-session-plan — truth-proposed

Preview Move earlier/later, removal without redistribution, skipping any pending or the running segment, and separate time figures change steps 2, 3, 5, 6 and the budget rule; update proposal in this lane.

## work-a-pathway-stage — truth-proposed

Routine contents preview before Start, running list with Move on / Skip / Remove, and unlabelled bound segments kept change the Guided routine variation; update proposal in this lane.

## adjust-how-scheduling-works — truth-proposed

The explanation now states Working returns, Keep-fresh whole checks and class preparation (step 1); update proposal in this lane.

## clear-a-due-review — truth-proposed

Which close completes a due review now depends on return intention and block scope (step 2, endsWith); update proposal in this lane.

## capture-a-practice-item — truth-proposed

Theory / listening study joins the kind-first form and study ideas pre-fill it (step 2, new variation); update proposal in this lane.

## log-a-class — truth-proposed

Class notes autosave and replay after reload instead of saving on blur (step 2); update proposal in this lane.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now (update proposed)

Proposed step changes:
− Practice Compass States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
−   Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
+ Practice Compass States the real priority formula, how each item comes back — working on it (1–3 days), kept fresh (spaced repetition on a whole-item check), class preparation before its class — and the spaced-repetition rungs, in plain English, filled in with the values currently in force.
+   Shows: The priority terms, the working return days, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.
  The musician Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
    Shows: The explanation updates to the new numbers.
    Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.
  The musician Closes a block or builds a plan afterwards.
    Shows: Review dates and plan shapes computed with the adjusted values.
    Changes: The same settings are used for the date previewed and the date saved.
  The musician Taps 'Reset to recommended' whenever they want the original behaviour back.
    Shows: 'Using the recommended defaults.'
    Changes: The settings field is dropped, so the historical constants apply exactly.

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
− The musician Or chooses 'Add practice item' for the full one-step form.
−   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
+ The musician Or chooses 'Add practice item' for the full one-step form.
+   Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique / theory or listening study), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.
  The musician Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
    Shows: Persian instruments are asked for dastgāh, gusheh, form and composer. While typing in dastgāh, form or composer, up to eight matching terms appear below the box as buttons — found from Farsi, Latin, an alias or a transliteration — beside an ‘All’ list and a clear control; a tap, click or Enter stores the shared term and returns focus to the box. A partial match is never accepted on its own, and free text always wins.
  The musician Saves.
    Shows: The item's own page, with a 'Connected to' summary near the top.
    Changes: One item, linked to whatever it belongs to — links never duplicate the item.

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now (update proposed)

Proposed step changes:
  Practice Compass Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
    Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.
− The musician Taps ▶ to practise it.
−   Shows: The active block, seeded from the item's status and focus.
−   Changes: Nothing yet — the review only completes when the block is closed.
+ The musician Taps ▶ to practise it.
+   Shows: The active block, seeded from the item's status and focus.
+   Changes: Nothing yet — the review completes only when the close decides the item's next date: an assessed close of an item being worked on, or a whole-item check of a kept-fresh one (focused work on a kept-fresh item leaves its check waiting).
  The musician Or taps 'Not now'.
    Shows: The row disappears for the rest of the day and returns tomorrow.
    Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.
  The musician Or taps '+2d' to genuinely move it.
    Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now (update proposed)

Proposed step changes:
  The musician Accepts the pre-filled class number and picks the date.
    Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
    Changes: A Lesson is stored for that instrument; the number is optional and editable.
− The musician Rewatches the class and types the notes, in Farsi or English.
−   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
−   Changes: Notes are saved when the field loses focus.
+ The musician Rewatches the class and types the notes, in Farsi or English.
+   Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text, and 'Saved.' only once the device has stored them.
+   Changes: Notes save themselves after a short pause and whenever the musician leaves the class — never merely because the field loses focus; Done is optional. Words still unsaved when the page reloads are written to that class afterwards, and a class whose notes changed meanwhile keeps both texts.
  The musician Adds a link to the class recording and to any scores — a NAS path or a full https link.
    Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
    Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.
  The musician Taps 'Open' on a link.
    Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
    Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
    Only if: A NAS base URL is set in Settings and the NAS is reachable from this device
  The musician Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
    Shows: Each linked item with its status and a 'For next class' toggle. A piece the class's Setar archive lists appears too, labelled '· in this class’s archive'; the item's own page names the same classes.
    Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); unlinking an archive-listed piece records only that one decision and linking it again lifts it — nothing is copied into the lesson’s own links; a flagged item gains a priority boost that climbs as that instrument's next class approaches.
  The musician Optionally attaches small hand-outs (a PDF, a photo, a short audio).
    Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
    Changes: Small blobs are stored on the device and travel with backups and sync.

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### practise-todays-recommendation — Works now (update proposed)

Proposed step changes:
  The musician Taps their instrument in the switcher at the top of Today.
    Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
    Changes: The chosen instrument is remembered as the session instrument.
− Practice Compass Scores every item of that instrument and shows the best one with a one-sentence reason.
−   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.
+ Practice Compass Scores every item of that instrument from the one candidate pool Today, a plan's build, regeneration and swaps share — work already practised today (class work and an unassessed routine block included) steps aside while anything else waits — and shows the best one with a one-sentence reason.
+   Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions; a piece and its own part never take two cards unless the other has its own due review, and a repeat says plainly that nothing else is waiting.
  The musician Taps 'Start · 10 min'.
    Shows: The active block screen: item title, mode and focus chips, a running ring timer.
    Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'. The item's Working notes save themselves after a short pause and whenever the musician leaves them — Done is optional, and a draft lands on the item it was typed for.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
− The musician Picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort' line (Change) — an engine-suggested status shows there pre-selected as the pending change.
−   Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link; the date is decided from the item as practised, so revising the item never moves it.
−   Changes: Nothing until Save; untouched fields are never written.
− The musician Taps 'Save block'.
−   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
−   Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.
+ The musician Says what the block covered — focused work on a part or one aspect (the default) or an explicit whole-item check — picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort · return' line (Change). A status suggestion or 'Keep it fresh' is offered only after a whole-item check, never pre-selected.
+   Shows: One 'Next practice' line from the same decision that will be saved: an item being worked on comes back in 1–3 days, a kept-fresh item's whole check follows spaced repetition, and class preparation says when the item is wanted before its class — beside a review date that stays as stored. 'Why this date?' explains it in place.
+   Changes: Nothing until Save; untouched fields are never written.
+ The musician Taps 'Save block'.
+   Shows: Back to Today (or to the running plan), with the item's stats and status updated.
+   Changes: A PracticeBlock is stored with what it covered; the item's counters and saturation flag update; its next date is the one shown — spaced repetition advances only on a kept-fresh item's eligible whole-item check — and the open review completes only when that decision writes a date. Status and return intention change only when the musician chose them.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
  Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
    Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.
− The musician Swaps, removes or regenerates segments until the shape looks right.
−   Shows: A removal re-spreads the minutes under the same floors and shares; a swap offers only material whose floor fits the slot.
−   Changes: Only a local copy of the plan — nothing is saved yet.
− The musician Taps 'Start plan'.
−   Shows: The runner: the whole list with the current segment highlighted.
−   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
+ The musician Reorders (Move earlier / Move later, by keyboard or touch), swaps, removes or regenerates segments until the shape looks right.
+   Shows: A move carries the whole segment — item, minutes, role, reason — and nothing else changes. A removal leaves every other segment's minutes as they were and shows the freed minutes as unused; only Regenerate or a new length reallocates. A swap keeps the slot's minutes and offers only material whose floor fits it.
+   Changes: Only a local copy of the plan — nothing is saved yet.
+ The musician Taps 'Start plan'.
+   Shows: The runner: the whole list in the musician's order, the current segment highlighted, with time left, unused and recorded shown separately.
+   Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
  The musician Taps 'Start' on the current segment.
    Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
    Changes: A real practice block opens for that segment's item.
− The musician Finishes and saves the block as usual.
−   Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
−   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
− The musician Skips anything they do not want, or ends the plan at any time.
−   Shows: 'Session complete' once the last segment is passed.
−   Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.
+ The musician Finishes and saves the block as usual.
+   Shows: Back on the plan, that segment reads 'done' with the minutes actually recorded, and the pointer moves to the next one; overtime is recorded as practised and charged to no other segment.
+   Changes: The block, item stats and review schedule update exactly as in an unplanned block.
+ The musician Skips any segment not yet started, skips the running one with 'Skip this one — save nothing', or ends the plan at any time; Finish (then Save, with or without a result) is how a shortened segment keeps what was practised.
+   Shows: 'Session complete' once the last segment is passed — saying so plainly when nothing was practised.
+   Changes: A skipped segment logs nothing at all, even after time passed in it, and lengthens nothing else; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### see-practice-patterns — Works now

Touchpoints: src/pages/Insights.tsx, src/pages/Today.tsx, src/domain/insights.ts, src/domain/io.ts

Evidence: 3 steps: 3 manually verified

### work-a-pathway-stage — Works now (update proposed)

Proposed step changes:
(no step changes)

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261023-make-practice-records-dependable-and-kee-34cc' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261023-make-practice-records-dependable-and-kee-34cc/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
