---
id: 20260916-keep-useful-practice-information-clear-f-2e1e
contractId: 20260916-keep-useful-practice-information-clear-f-2e1e
patchId: 3252f40ac26811528f382b8fdac8074bf0569e32
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-09-16T17:41:43.112Z
sealedAt: 2026-09-16T18:24:43.957Z
---

# Review: Keep useful practice information clear from capture to next time

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260916-keep-useful-practice-information-clear-f-2e1e
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/24
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `3252f40ac26811528f382b8fdac8074bf0569e32`

## The Delta this change was framed from

# One item notebook is readable/editable during practice; block observation, previous next action and lesson questions retain distinct lifetimes. Existing choices have plain meanings and progressive controls. Explicit automatic-date ownership transfer retains the pending date and spacing state without recording practice.

_approved · about "practise-todays-recommendation"_

## Today

Persistent working information is split across Notes, problem, strategy and specialist fields; Active reads only some of it and edits a separate block note. Close asks overlapping questions, history omits some captured text, and custom date ownership cannot be explicitly released.

## Instead

One item notebook is readable/editable during practice; block observation, previous next action and lesson questions retain distinct lifetimes. Existing choices have plain meanings and progressive controls. Explicit automatic-date ownership transfer retains the pending date and spacing state without recording practice.

## Keep

- One-instrument, quick-start, calm Active loop and honest minutes.
- Trusted planner, lesson-specific agenda, conservative early-review rules and all sync/recovery safety.

## New assumptions

- Owner explicitly permits retiring the enumerated obsolete dummy practice-text fields; future meaningful information remains protected.

## Show me

Open an item, read and edit Working notes while its timer continues, add a separate block observation, finish and choose a result/next action, then reload and practise it again: the notebook and previous decision are available and history says what happened. Repeat during a bound routine transition without notes crossing items. On the item release a custom future date to automatic control: its date stays, no practice/spacing changes, and later early Same versus Worse obey the shipped distinct rules. Restore a valid old backup through the real UI; malformed and newer data refuse before replacement.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **Attachment consistency across state-only import, full export and restore** — P1: State-only import bypasses duplicate attachment-metadata validation and can leave the app producing a backup its own importer refuses.
  _counterexample:_ Store one blob for att-1, then state-only import data containing two attachment metadata rows with id att-1 and no files property. decodeBackupFiles returns before its duplicate-metadata check, and the held-blob check succeeds for both rows. Full export emits two files with id att-1; reimport refuses the duplicate metadata or duplicate file id. Validate attachment metadata consistency for state-only imports too, and cover the real state-only import to export to reimport round-trip in the exact ac-4 test.
- **Review-date draft identity and freshness across live item changes** — P2: An untouched open date draft remains stale when a live update clears the item's pending date, so Save date can resurrect a date the current item no longer has.
  _counterexample:_ Open item A's Change review date editor while A has 2027-02-10. Before typing, apply a legitimate live update that clears A.nextReviewDate. reviewDateDraftFor returns the old draft because current is empty; pressing Save date writes 2027-02-10 back. Reconcile date removal while preserving a genuinely typed draft, and cover this live-update case in the exact ac-12 test.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 6e008ab..eacb474 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -73,6 +73,21 @@ metadata for absent bytes exports a backup it then refuses, and publishes a snap
 other device refuses too, permanently. Dropping the dangling metadata instead would be
 silent loss of the owner's own record. Both refusals name the file and change nothing.
 
+**AND AN ATTACHMENT'S IDENTITY IS CHECKED AT EVERY DOOR, NOT AT THE ONE THE CHECK HAPPENED
+TO LIVE IN.** The rule that two attachments may not share an id sat inside
+`decodeBackupFiles`, which returns on its FIRST line for a file with no `files` key — so it
+ran for a full backup and for nothing else. A sealed review reproduced the consequence: a
+state-only import (and equally a sync pull, an archive restore, or either half of
+hydration) installed two metadata rows claiming one id, and because the export emits one
+file per describing row, the device's own next full backup carried two files sharing an id
+and was refused by its own importer — the same permanent one-way trap as the two mismatches
+above, arriving through the door nobody was watching. An id is what an attachment's bytes
+are KEYED by, so two rows claiming one id are two rows claiming one file. The check is in
+`validateDB` now — the one function every inbound door already runs — and
+`decodeBackupFiles` keeps none of its own: one place, six doors, rather than six chances to
+miss it. It is deliberately bounded to attachment ids and is NOT a general duplicate-id
+sweep across every collection, which the contract's own non-goals rule out.
+
 **AND THE EXPORT IS DERIVED FROM THE CANONICAL METADATA, SO THE APP CANNOT WRITE A BACKUP
 ITS OWN IMPORTER REFUSES.** The trap has a second mouth, and closing only the inbound one
 left it open: `buildFullBackupWithRev` used to derive `files` from the blobs actually
@@ -1687,11 +1702,32 @@ reset from an effect, so there is no paint in which the box shows A's date while
 points at B. A different item DROPS it; the item's own date moving beneath an UNTOUCHED
 seed re-seeds the box, because saving a captured date would silently revert a change the
 owner never saw; the item's date moving beneath TYPED text leaves the text alone (it is
-their intent, not a stale capture) and only catches the baseline up. A box seeded with
-today on an item that has NO date is excluded from that comparison — its seed was never
-the item's date. `ReviewOwnership`'s refusal message carries the same tag, for the same
+their intent, not a stale capture) and only catches the baseline up.
+`ReviewOwnership`'s refusal message carries the same tag, for the same
 reason: a refusal about A's schedule shown under B is a statement about the wrong item.
 
+**THREE FACTS NEED THREE FIELDS, AND CONFLATING TWO OF THEM EXEMPTED A WHOLE TRANSITION.**
+`seeded` used to hold "the item's date, or today when it had none", which made "this item
+has no date" indistinguishable from "this item's date happens to be today". The only way to
+stop a dateless item's today-box being re-seeded to empty was therefore to skip the
+comparison ENTIRELY whenever the item had no date — and a sealed review reproduced what
+that exemption let through: a live update (a sync pull, a review declined elsewhere) that
+CLEARS the item's pending date left the box showing, and "Save date" writing, a date the
+item no longer had. There is no exemption now. `seeded` is the item's OWN date and is empty
+when it has none, `offered` is what the box was actually filled with (that date, or today),
+and "untouched" is `text === offered`. present→different, present→absent and absent→present
+are then ONE rule instead of three cases with three answers, and a cleared date re-seeds the
+box to exactly what opening it fresh on that item would offer. `today` is passed in, because
+`format.ts` is pure and the screen already has the day it is rendered against.
+
+The browser proof is a REAL SYNC PULL (`review-ownership.browser.test.ts`, ac-12), not a
+description of one: a pull is the only thing that replaces an item's date while
+`ScheduleAgain` stays MOUNTED — an import leaves the page, and "Review today" is offered
+only when the item has no date — so the journey installs the same fake GitHub transport the
+inbound journey uses (now shared, in `tests/practiceBrowser.ts`) and triggers the app's own
+`online` listener. Both halves are checked there: an untouched box follows the item, typed
+text stands.
+
 **"Schedule again" is administration, not practice.** `scheduleAgainPlan` sets ONE date on
 the item and its pending row, CREATING the row when none is open (the case the old date
 helper could not reach, which left a declined review unreachable from the item's own
diff --git a/DECISIONS.md b/DECISIONS.md
index ee89594..fa5b25d 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -2,6 +2,33 @@
 
 Durable record of non-obvious choices. Newest first.
 
+## A check that lives in one door is a check with five doors missing (2026-09-16)
+
+Two more sealed findings, and the same shape underneath both: a rule that was genuinely
+correct, sitting somewhere only one caller reaches.
+
+**Attachment identity.** "Two attachments may not share an id" lived in
+`decodeBackupFiles` — which returns on its FIRST line when a file carries no `files` key.
+So it ran for a full backup and for nothing else: a state-only import, a sync pull, an
+archive restore and both halves of hydration all installed duplicates unchecked. Not
+cosmetic, because the export emits one file per describing row: the device's own next
+backup then carried two files sharing an id and was refused by its own importer, here and
+on every device a sync published it to. The check moved to `validateDB`, the one function
+every inbound door already runs, and `decodeBackupFiles` keeps none of its own. Bounded to
+attachment ids on purpose — an id is what the bytes are KEYED by — and not widened into a
+duplicate-id sweep over every collection, which this change's own non-goals rule out.
+
+**The review-date draft.** `seeded` held "the item's date, or today when it had none", so
+"no date" and "a date that is today" were the same value. That forced an exemption —
+skip the whole comparison when the item has no date — and the exemption is what a live
+update CLEARING the date fell into: the box went on showing, and Save date went on
+writing, a schedule the item no longer had. Fixed by separating the two facts rather than
+special-casing the symptom: `seeded` is the item's own date (empty when absent), `offered`
+is what the box was filled with, and untouched is `text === offered`. All three
+transitions — to a different date, to none, from none — are now one rule. Proved in the
+browser through a real sync pull, the only thing that changes an item's date while that
+panel stays mounted.
+
 ## A draft belongs to what it was typed for, not to whatever is on screen (2026-09-16)
 
 Two sealed findings, one rule, in two editors.
diff --git a/src/components/format.test.ts b/src/components/format.test.ts
index 293ca87..a975036 100644
--- a/src/components/format.test.ts
+++ b/src/components/format.test.ts
@@ -151,57 +151,122 @@ describe('splitLines', () => {
 });
 
 describe('reviewDateDraftFor', () => {
+  const TODAY = '2026-06-18';
   const A = { id: 'a', nextReviewDate: '2027-02-10' };
   const B = { id: 'b', nextReviewDate: '2027-05-05' };
-  const openOnA = { forItem: 'a', seeded: '2027-02-10', text: '2027-02-10' };
+  const openOnA = { forItem: 'a', seeded: '2027-02-10', offered: '2027-02-10', text: '2027-02-10' };
+  // What ScheduleAgain seeds on an item with NO date: the item's own date is
+  // empty, and the box is offered today.
+  const openOnDateless = { forItem: 'a', seeded: '', offered: TODAY, text: TODAY };
 
   it('keeps an untouched draft while its item and date are unchanged', () => {
-    expect(reviewDateDraftFor(openOnA, A)).toEqual(openOnA);
+    expect(reviewDateDraftFor(openOnA, A, TODAY)).toEqual(openOnA);
   });
 
   it('keeps text the owner typed for its own item', () => {
     const typed = { ...openOnA, text: '2027-03-01' };
-    expect(reviewDateDraftFor(typed, A)).toEqual(typed);
+    expect(reviewDateDraftFor(typed, A, TODAY)).toEqual(typed);
   });
 
   it('DROPS a draft belonging to another item, so A\'s date cannot be saved onto B', () => {
-    expect(reviewDateDraftFor(openOnA, B)).toBeNull();
-    expect(reviewDateDraftFor({ ...openOnA, text: '2027-03-01' }, B)).toBeNull();
+    expect(reviewDateDraftFor(openOnA, B, TODAY)).toBeNull();
+    expect(reviewDateDraftFor({ ...openOnA, text: '2027-03-01' }, B, TODAY)).toBeNull();
   });
 
+  // --- The item's own date moving beneath the box: ONE rule, every direction -
+  // present→different, present→absent and absent→present are the same
+  // question ("is this box still offering what the item says?") and must not
+  // be three cases with three answers. `seeded` records the item's own date
+  // (empty when it has none) and `offered` what the box was filled with, so
+  // "untouched" is decidable without exempting any transition.
+
   it('re-seeds an UNTOUCHED box when the item\'s own date moved beneath it', () => {
     // A sync pull, another tab, or a close screen moved the date. Saving the
     // captured one would silently revert a change the owner never saw.
     const moved = { ...A, nextReviewDate: '2027-04-20' };
-    expect(reviewDateDraftFor(openOnA, moved)).toEqual({
+    expect(reviewDateDraftFor(openOnA, moved, TODAY)).toEqual({
+      forItem: 'a',
+      seeded: '2027-04-20',
+      offered: '2027-04-20',
+      text: '2027-04-20',
+    });
+  });
+
+  it('re-seeds an UNTOUCHED box when the item\'s date was CLEARED beneath it', () => {
+    // The sealed counterexample. A live update (a sync pull, a declined review
+    // closed elsewhere) removes A's pending date while the panel sits open.
+    // The old rule skipped the comparison entirely whenever the item had no
+    // date, so the box went on showing 2027-02-10 and "Save date" wrote it
+    // back — resurrecting a schedule the item no longer had. It is the same
+    // "the item's date moved" case as every other, and re-seeds to what a
+    // fresh open would offer: today.
+    const cleared = { id: 'a' };
+    expect(reviewDateDraftFor(openOnA, cleared, TODAY)).toEqual({
+      forItem: 'a',
+      seeded: '',
+      offered: TODAY,
+      text: TODAY,
+    });
+    // …and it stays settled: the baseline caught up, so a later render with
+    // the same (dateless) item leaves it exactly alone rather than re-deciding.
+    const once = reviewDateDraftFor(openOnA, cleared, TODAY)!;
+    expect(reviewDateDraftFor(once, cleared, TODAY)).toEqual(once);
+  });
+
+  it('re-seeds an UNTOUCHED today-box when the item GAINED a date beneath it', () => {
+    // The mirror image, and the reason "the item has no date" cannot simply be
+    // spelled as an empty `seeded` on the text as well: the box was offered
+    // today, today is not the item's date, and the box must still follow the
+    // item when one arrives.
+    const gained = { id: 'a', nextReviewDate: '2027-04-20' };
+    expect(reviewDateDraftFor(openOnDateless, gained, TODAY)).toEqual({
       forItem: 'a',
       seeded: '2027-04-20',
+      offered: '2027-04-20',
       text: '2027-04-20',
     });
   });
 
-  it('keeps TYPED text when the item\'s date moved, and stops re-deciding it', () => {
+  it('keeps TYPED text through every move of the item\'s own date', () => {
+    // The owner's intent outranks the item's date in all three directions, and
+    // the baseline catches up each time so it is not re-decided every render.
     const typed = { ...openOnA, text: '2027-03-01' };
     const moved = { ...A, nextReviewDate: '2027-04-20' };
-    const once = reviewDateDraftFor(typed, moved);
-    expect(once).toEqual({ forItem: 'a', seeded: '2027-04-20', text: '2027-03-01' });
-    // The baseline caught up, so a later render leaves it exactly alone.
-    expect(reviewDateDraftFor(once, moved)).toEqual(once);
+    const once = reviewDateDraftFor(typed, moved, TODAY);
+    expect(once).toEqual({ forItem: 'a', seeded: '2027-04-20', offered: '2027-02-10', text: '2027-03-01' });
+    expect(reviewDateDraftFor(once, moved, TODAY)).toEqual(once);
+
+    // Cleared beneath TYPED text: the text is theirs and stands.
+    expect(reviewDateDraftFor(typed, { id: 'a' }, TODAY)).toEqual({
+      forItem: 'a',
+      seeded: '',
+      offered: '2027-02-10',
+      text: '2027-03-01',
+    });
+    // Gained beneath a typed today-box: likewise.
+    const typedOnDateless = { ...openOnDateless, text: '2027-01-01' };
+    expect(reviewDateDraftFor(typedOnDateless, { id: 'a', nextReviewDate: '2027-04-20' }, TODAY)).toEqual({
+      forItem: 'a',
+      seeded: '2027-04-20',
+      offered: TODAY,
+      text: '2027-01-01',
+    });
   });
 
-  it('leaves a box seeded with today alone on an item that has no date', () => {
-    // The seed is deliberately NOT the item's date there (it has none), so the
-    // "moved" comparison must not fire and empty the box.
-    const seededToday = { forItem: 'a', seeded: '2026-06-18', text: '2026-06-18' };
+  it('leaves a box seeded with today alone on an item that still has no date', () => {
+    // The item's date has not moved — it is absent and stays absent — so
+    // nothing here re-seeds, including across a later day: the comparison is
+    // against the ITEM, never against `today`.
     const noDate = { id: 'a' };
-    expect(reviewDateDraftFor(seededToday, noDate)).toEqual(seededToday);
-    expect(reviewDateDraftFor({ ...seededToday, text: '2027-01-01' }, noDate)).toEqual({
-      ...seededToday,
+    expect(reviewDateDraftFor(openOnDateless, noDate, TODAY)).toEqual(openOnDateless);
+    expect(reviewDateDraftFor(openOnDateless, noDate, '2026-06-19')).toEqual(openOnDateless);
+    expect(reviewDateDraftFor({ ...openOnDateless, text: '2027-01-01' }, noDate, TODAY)).toEqual({
+      ...openOnDateless,
       text: '2027-01-01',
     });
   });
 
   it('has nothing to reconcile when no draft is open', () => {
-    expect(reviewDateDraftFor(null, A)).toBeNull();
+    expect(reviewDateDraftFor(null, A, TODAY)).toBeNull();
   });
 });
diff --git a/src/components/format.ts b/src/components/format.ts
index 1a10290..f7483b6 100644
--- a/src/components/format.ts
+++ b/src/components/format.ts
@@ -162,28 +162,47 @@ export function closeOverrideDate(
  * then writes it through the CURRENT item's callback. A's 2027-02-10 lands on
  * B.
  *
- * So the draft carries the item it was opened for and the item's own date at
- * that moment, and this decides what it still means. It is the same rule
- * `ItemNotes` applies to the notebook — a draft is bound to what it was typed
- * for — expressed once, purely, where a Node test can reach it:
+ * So the draft carries the item it was opened for, the item's own date at that
+ * moment, and the value the box was actually OFFERED — and this decides what it
+ * still means. It is the same rule `ItemNotes` applies to the notebook — a
+ * draft is bound to what it was typed for — expressed once, purely, where a
+ * Node test can reach it:
  *
  *   • a DIFFERENT item  → dropped. Never re-pointed, never saved onto B.
- *   • the item's date MOVED beneath an untouched seed → re-seeded, so the
- *     panel offers what the item now says rather than a value the owner never
- *     chose and would silently revert.
+ *   • the item's own date UNCHANGED → the draft stands, whatever is in it.
+ *   • the item's date MOVED beneath an untouched box → re-seeded, so the panel
+ *     offers what the item now says rather than a value the owner never chose
+ *     and would silently revert.
  *   • the item's date moved beneath TYPED text → the text stands. It is the
  *     owner's own intent, not a stale capture; only the baseline catches up so
  *     this decision is not re-made on every later render.
  *
- * A seeded box on an item with NO date offers today, which is deliberately not
- * the item's date; that case is excluded from the "moved" comparison rather
- * than being re-seeded to empty.
+ * THREE FACTS, THREE FIELDS — and conflating two of them was a real defect.
+ * `seeded` used to hold "the item's date, or today when it had none", which
+ * made "the item has no date" indistinguishable from "the item's date happens
+ * to be today", so the only way to stop a dateless item's today-box being
+ * re-seeded to empty was to skip the comparison entirely whenever the item had
+ * no date (`if (!current) return draft`). That exemption is what a live update
+ * CLEARING the date then fell into: the box went on showing — and Save date
+ * went on writing — a date the item no longer had, a schedule the owner had
+ * every reason to believe was gone. There is no exemption now. `seeded` is the
+ * item's own date and is EMPTY when it has none, `offered` is what the box was
+ * filled with (the date, or today), and "untouched" is `text === offered`. The
+ * absent→present, present→absent and present→different transitions are then
+ * one rule rather than three cases, and a cleared date re-seeds the box to
+ * today exactly as opening it fresh on that item would.
+ *
+ * `today` is passed in rather than read from a clock here: this module is
+ * pure, and the caller already has the day the rest of its screen is rendered
+ * against.
  */
 export interface ReviewDateDraft {
   /** The item this draft was opened for. */
   forItem: string;
-  /** The item's own pending date when the box was last (re-)seeded. */
+  /** The item's OWN pending date when the box was last (re-)seeded; '' for none. */
   seeded: string;
+  /** What the box was filled with then — the item's date, or today. */
+  offered: string;
   /** What is in the box now. */
   text: string;
 }
@@ -191,12 +210,14 @@ export interface ReviewDateDraft {
 export function reviewDateDraftFor(
   draft: ReviewDateDraft | null,
   item: { id: string; nextReviewDate?: string },
+  today: string,
 ): ReviewDateDraft | null {
   if (!draft) return null;
   if (draft.forItem !== item.id) return null;
   const current = item.nextReviewDate ?? '';
-  if (!current || current === draft.seeded) return draft;
-  return draft.text === draft.seeded
-    ? { forItem: draft.forItem, seeded: current, text: current }
+  if (current === draft.seeded) return draft;
+  const offered = current || today;
+  return draft.text === draft.offered
+    ? { forItem: draft.forItem, seeded: current, offered, text: offered }
     : { ...draft, seeded: current };
 }
diff --git a/src/domain/io.test.ts b/src/domain/io.test.ts
index 1168f0c..64358c8 100644
--- a/src/domain/io.test.ts
+++ b/src/domain/io.test.ts
@@ -426,6 +426,51 @@ describe('the v12 model at every inbound door', () => {
       }),
     ).not.toThrow();
 
+    // 4c. ATTACHMENT IDENTITY, at EVERY door rather than the full-backup one.
+    //     A sealed review found the duplicate-metadata check living inside
+    //     `decodeBackupFiles`, which returns on its FIRST line for a file with
+    //     no `files` key — so a state-only import (and a sync pull, an archive
+    //     restore, and hydration) installed two attachments claiming one id
+    //     unchecked. That is a one-way trap, not an untidiness: the export
+    //     emits one file per describing row, so the device's very next full
+    //     backup carries two files sharing an id and is refused by its own
+    //     importer. The check is in `validateDB` now, so it is the same
+    //     refusal at every door — including a bare database, which is the
+    //     shape a state-only file and a sync snapshot both arrive in.
+    const withAttachment = validateDB(JSON.parse(V12_TEXT));
+    expect(withAttachment.attachments.length).toBeGreaterThan(0);
+    const duplicated = {
+      ...withAttachment,
+      attachments: [...withAttachment.attachments, { ...withAttachment.attachments[0] }],
+    };
+    expect(() => validateDB(duplicated)).toThrow(/Two attachments share the id "att-1"/);
+    // Two rows sharing an id but disagreeing about their owner is the same
+    // refusal — the id IS the identity, and the blob is keyed by it.
+    expect(() =>
+      validateDB({
+        ...withAttachment,
+        attachments: [
+          ...withAttachment.attachments,
+          { ...withAttachment.attachments[0], ownerId: 'someone-else' },
+        ],
+      }),
+    ).toThrow(/Two attachments share the id/);
+    for (const { label, payload } of [
+      { label: 'wrapped export', payload: { app: 'practice-compass', schemaVersion: SCHEMA_VERSION, data: duplicated } },
+      { label: 'bare database (state-only import, sync pull, archive restore)', payload: duplicated },
+    ]) {
+      expect(() => validateDB(payload), label).toThrow(/Two attachments share the id/);
+    }
+    // Distinct ids are untouched, and so is a database with no attachments at
+    // all — this refuses a collision, it does not police attachments.
+    expect(() =>
+      validateDB({
+        ...withAttachment,
+        attachments: [...withAttachment.attachments, { ...withAttachment.attachments[0], id: 'att-2' }],
+      }),
+    ).not.toThrow();
+    expect(() => validateDB({ ...withAttachment, attachments: [] })).not.toThrow();
+
     // 5. A NEWER schema is still refused outright rather than silently
     //    downgraded and stripped of whatever it added.
     expect(() => validateDB({ ...v12, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);
@@ -505,6 +550,22 @@ describe('the v12 model at every inbound door', () => {
     expect(useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: false });
     expect(useHydrationStatus.getState().message).toMatch(/practice item that no longer exists/);
 
+    // 7c-ii. THE SAME hydration door refuses duplicate attachment metadata.
+    //     This is the door the state-only counterexample actually ends at: an
+    //     import that installed the duplicates would hand them straight back
+    //     to `merge` on the next load. The previously live database is
+    //     preserved by reference and nothing is written back, exactly as 7c.
+    const sentinelDup = useStore.getState().db;
+    const setItemsBeforeDup = fakeStorage.setItemCalls();
+    fakeStorage.set(
+      wrap({ ...v12, attachments: [...v12.attachments, { ...v12.attachments[0] }] }, SCHEMA_VERSION),
+    );
+    await useStore.persist.rehydrate();
+    expect(useStore.getState().db).toBe(sentinelDup);
+    expect(getLastHydrationError()).toMatch(/Two attachments share the id/);
+    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeDup);
+    expect(useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: false });
+
     // 7d. A NEWER-than-supported schema is refused — never passed through
     //     migrateToCurrent and relabelled as the current version, and never
     //     written back over the (unreadable but genuinely newer) original.
diff --git a/src/domain/io.ts b/src/domain/io.ts
index 10bb11b..8094459 100644
--- a/src/domain/io.ts
+++ b/src/domain/io.ts
@@ -109,6 +109,26 @@ export function validateDB(input: unknown): PracticeDB {
     }
   }
 
+  // ATTACHMENT IDENTITY, at EVERY door rather than at one of them.
+  //
+  // `decodeBackupFiles` already refused two metadata rows sharing an id — but
+  // only ever reached that check for a FULL backup, because a `files` key that
+  // is absent returns from its first line. So the state-only door, a sync pull,
+  // an archive restore and both halves of hydration all installed duplicate
+  // attachment metadata unchecked, and the trap is the same one-way shape the
+  // held-bytes invariant exists to prevent: `buildFullBackupWithRev` emits one
+  // file per describing row, so two rows sharing an id produce two files
+  // sharing an id, and the device's own next export is a backup its own
+  // importer refuses ("Two files in the backup share the id") — on this device
+  // and on every device a sync publishes it to. An attachment's id is what its
+  // bytes are keyed by, so two records claiming one id are two records claiming
+  // the same file. Refusing here names the id and changes nothing.
+  const attachmentIds = new Set<string>();
+  for (const a of db.attachments) {
+    if (attachmentIds.has(a.id)) throw new Error(`Two attachments share the id "${a.id}".`);
+    attachmentIds.add(a.id);
+  }
+
   // The v12 model, checked BEFORE anything installs this database (§C7). This
   // is deliberately bounded to the lesson agenda and the scheduling fields it
   // shares a schema version with — the decision loop's own inputs and
diff --git a/src/pages/ItemDetail.tsx b/src/pages/ItemDetail.tsx
index ce5afb5..53d7c92 100644
--- a/src/pages/ItemDetail.tsx
+++ b/src/pages/ItemDetail.tsx
@@ -231,6 +231,7 @@ export default function ItemDetail() {
 
       <ScheduleAgain
         item={item}
+        today={todayISODate(now)}
         conflict={pendingScheduleConflict(item, db.reviews)}
         onSchedule={(date) => scheduleReviewAgain(item.id, date)}
       />
@@ -900,10 +901,18 @@ function FieldRow({ label, value }: { label: string; value: string }) {
  */
 function ScheduleAgain({
   item,
+  today,
   conflict,
   onSchedule,
 }: {
   item: PracticeItemT;
+  /**
+   * What a box would be OFFERED for an item with no date — the same day the
+   * rest of this screen is rendered against. Only consulted when the item's
+   * own date moved to absent beneath an open box; the seed below takes the
+   * true instant instead, because opening the panel is an action, not a paint.
+   */
+  today: ISODate;
   conflict: { rows: Review[]; message: string } | null;
   onSchedule: (date: ISODate) => void;
 }) {
@@ -914,7 +923,7 @@ function ScheduleAgain({
   // saves the reconciled value, so there is no paint in which the box shows
   // A's date while the Save button points at B.
   const [draft, setDraft] = useState<ReviewDateDraft | null>(null);
-  const open = reviewDateDraftFor(draft, item);
+  const open = reviewDateDraftFor(draft, item, today);
 
   return (
     <div className="stack-sm">
@@ -963,10 +972,14 @@ function ScheduleAgain({
             // Seeded when it OPENS, from the live item and the real day —
             // never once at mount, which would offer a date that has since
             // been changed elsewhere or a "today" that has since rolled over.
+            const offered = item.nextReviewDate ?? todayISODate(new Date());
             setDraft({
               forItem: item.id,
-              seeded: item.nextReviewDate ?? todayISODate(new Date()),
-              text: item.nextReviewDate ?? todayISODate(new Date()),
+              // The item's OWN date — empty when it has none, so "no date" and
+              // "a date that happens to be today" stay distinguishable.
+              seeded: item.nextReviewDate ?? '',
+              offered,
+              text: offered,
             });
           }}
         >
diff --git a/src/store/backup.ts b/src/store/backup.ts
index fbd6546..0589ff4 100644
--- a/src/store/backup.ts
+++ b/src/store/backup.ts
@@ -377,8 +377,9 @@ export async function importFullBackup(
  *   • a non-empty set — every entry must be sound, or nothing is written.
  *
  * "Sound" means: an object with a non-empty string `id`, no duplicate id, a
- * string `data` that actually base64-decodes, an owner that resolves through
- * the canonical metadata, and metadata whose own ids are unique. Bytes with no
+ * string `data` that actually base64-decodes, and an owner that resolves
+ * through the canonical metadata (whose own ids `validateDB` has already
+ * proved unique, at every door rather than this one). Bytes with no
  * matching metadata (orphans) and metadata with no bytes (omissions) are both
  * refused rather than half-installed. Legacy `itemId` ownership is still
  * accepted — normalised through the same v6 semantics the migration uses — but
@@ -395,13 +396,11 @@ function decodeBackupFiles(
     return { ok: false, error: 'The backup\'s "files" entry is not a list of files — nothing was changed.' };
   }
 
-  const metaIds = new Set<string>();
-  for (const a of attachments) {
-    if (metaIds.has(a.id)) {
-      return { ok: false, error: `Two attachments in the backup share the id "${a.id}" — nothing was changed.` };
-    }
-    metaIds.add(a.id);
-  }
+  // Metadata identity is NOT checked here. It used to be, and that was the bug:
+  // this function returns above for a state-only file, so the check ran on one
+  // door out of six. It lives in `validateDB` now — which `parseImport` has
+  // already run on this very database before this call — so every inbound door
+  // refuses two attachments sharing an id, not just a full backup.
   const metaById = new Map(attachments.map((a) => [a.id, a]));
 
   const rows: AttachmentBlob[] = [];
diff --git a/tests/practice-information-inbound.browser.test.ts b/tests/practice-information-inbound.browser.test.ts
index 6ff1025..6e1b019 100644
--- a/tests/practice-information-inbound.browser.test.ts
+++ b/tests/practice-information-inbound.browser.test.ts
@@ -3,19 +3,23 @@ import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
 import { tmpdir } from 'node:os';
 import { join } from 'node:path';
 import { describe, expect, it } from 'vitest';
-import type { Page } from 'playwright';
 import {
+  connectSync,
   exportBackup,
   goTo,
   importBackup,
   importOutcome,
+  installFakeGitHub,
+  newFakeRemote,
   openPracticeApp,
   persistedDb,
   persistedUntil,
+  publishRemote,
   readPersistedState,
   reload,
+  remoteStateText,
+  syncMessage,
   writePersistedState,
-  type PracticeApp,
 } from './practiceBrowser';
 import v12Text from './fixtures/practice-information-v12.json?raw';
 import { SCHEMA_VERSION } from '../src/domain/types';
@@ -35,138 +39,6 @@ import { hashState } from '../src/domain/canonical';
 const CLOCK = new Date('2027-01-15T09:00:00');
 const v12Db = () => (JSON.parse(v12Text) as { data: Record<string, unknown> }).data;
 
-// ---------------------------------------------------------------------------
-// A GitHub data repo that lives in this test process.
-//
-// It is installed at the REAL transport boundary — the `fetch` calls
-// `gitRemote.ts` makes to api.github.com — so everything above it runs for
-// real: `syncNow`, `resolveConflict`, `runSync`, `decideSync`, the pre-sync
-// archive, and `importFullBackup`'s own guards. Nothing in the app is stubbed
-// or bypassed, and no request ever leaves the machine.
-// ---------------------------------------------------------------------------
-
-interface FakeRemote {
-  /** The snapshot the repo currently holds, or null for an empty repo. */
-  snapshot: { stateText: string; hash: string; rev: number; deviceName?: string; savedAt: string } | null;
-  /** Every ref this repo has, so an archive branch is observable. */
-  refs: string[];
-  /** How many times each endpoint was called, so "it really went there" is checkable. */
-  calls: string[];
-}
-
-function newFakeRemote(): FakeRemote {
-  return { snapshot: null, refs: [], calls: [] };
-}
-
-/** Put a snapshot in the repo as if another device had pushed it. */
-function publishRemote(remote: FakeRemote, stateText: string, hash: string, rev: number, deviceName = 'the other device'): void {
-  remote.snapshot = { stateText, hash, rev, deviceName, savedAt: new Date().toISOString() };
-  if (!remote.refs.includes('main')) remote.refs.push('main');
-}
-
-async function installFakeGitHub(page: Page, remote: FakeRemote): Promise<void> {
-  let headCounter = 0;
-  const blobs = new Map<string, string>();
-
-  await page.route('https://api.github.com/**', async (route) => {
-    const req = route.request();
-    const url = new URL(req.url());
-    // /repos/<owner>/<name>/<rest…>
-    const rest = url.pathname.split('/').slice(4).join('/');
-    const method = req.method();
-    remote.calls.push(`${method} ${rest}`);
-    const json = (body: unknown, status = 200) =>
-      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
-    const raw = (body: string) => route.fulfill({ status: 200, contentType: 'text/plain', body });
-    const head = () => `head-${headCounter}`;
-
-    if (method === 'GET' && rest === 'git/ref/heads/main') {
-      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
-      return json({ object: { sha: head() } });
-    }
-    if (method === 'GET' && rest.startsWith('contents/manifest.json')) {
-      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
-      return raw(
-        JSON.stringify({
-          formatVersion: 2,
-          hash: remote.snapshot.hash,
-          rev: remote.snapshot.rev,
-          deviceName: remote.snapshot.deviceName,
-          savedAt: remote.snapshot.savedAt,
-          attachments: [],
-        }),
-      );
-    }
-    if (method === 'GET' && rest.startsWith('contents/state.json')) {
-      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
-      return raw(remote.snapshot.stateText);
-    }
-    if (method === 'GET' && rest.startsWith('contents/files')) return json([]);
-    if (method === 'GET' && rest.startsWith('git/blobs/')) {
-      return json({ content: blobs.get(rest.slice('git/blobs/'.length)) ?? '' });
-    }
-    if (method === 'PUT' && rest.startsWith('contents/README.md')) {
-      headCounter += 1;
-      if (!remote.refs.includes('main')) remote.refs.push('main');
-      return json({ commit: { sha: head() } });
-    }
-    if (method === 'POST' && rest === 'git/blobs') {
-      const body = req.postDataJSON() as { content: string };
-      const sha = `blob-${blobs.size}`;
-      blobs.set(sha, body.content);
-      return json({ sha });
-    }
-    if (method === 'POST' && rest === 'git/trees') return json({ sha: 'tree-1' });
-    if (method === 'POST' && rest === 'git/commits') {
-      headCounter += 1;
-      return json({ sha: head() });
-    }
-    if (method === 'POST' && rest === 'git/refs') {
-      const body = req.postDataJSON() as { ref: string };
-      remote.refs.push(body.ref.replace('refs/heads/', ''));
-      return json({});
-    }
-    if (method === 'PATCH' && rest === 'git/refs/heads/main') return json({});
-    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"not routed"}' });
-  });
-}
-
-/**
- * Wrap a database in the shape `state.json` holds: a full backup with NO file
- * payloads (attachments travel as separate git blobs).
- */
-function remoteStateText(db: unknown, deviceName = 'the other device'): string {
-  return JSON.stringify({
-    app: 'practice-compass',
-    schemaVersion: (db as { schemaVersion?: number }).schemaVersion ?? 13,
-    exportedAt: new Date().toISOString(),
-    deviceName,
-    data: db,
-    files: [],
-  });
-}
-
-// --- shared helpers ---------------------------------------------------------
-
-/** Connect sync through the REAL Settings form and run the first sync. */
-async function connectSync(app: PracticeApp): Promise<void> {
-  const { page } = app;
-  await goTo(app, '/settings');
-  // The sync form's fields sit inside a labelled group rather than carrying
-  // their own accessible names. That is pre-existing Settings markup this lane
-  // is explicitly not reshaping, so this reaches them the way they actually
-  // are rather than pretending otherwise.
-  await page.getByRole('group', { name: 'Repository' }).locator('input').fill('owner/practice-data');
-  await page.getByRole('group', { name: 'Access token' }).locator('input').fill('github_pat_fake');
-  await page.getByRole('button', { name: 'Connect & sync' }).click();
-  await page.getByRole('button', { name: 'Sync now' }).waitFor({ timeout: 20_000 });
-}
-
-/** The sync section's own status line, whatever it currently says. */
-async function syncMessage(page: Page): Promise<string> {
-  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
-}
-
 /** The one item the fixture's Farsi notebook belongs to. */
 const FARSI_ITEM = 'i-farsi';
 const FARSI_NOTES = 'یادداشتِ کاری: فرود را آهسته بگیر.';
@@ -380,7 +252,23 @@ describe('a replacement door never installs what it has not checked', () => {
             { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
             [validFile],
           ),
-          says: /attachments in the backup share the id/,
+          says: /attachments share the id/,
+        },
+        {
+          // THE SAME REFUSAL WITH NO `files` KEY AT ALL. This check used to
+          // live inside the full-backup decoder, which returns on its first
+          // line for a state-only file — so this door installed two
+          // attachments claiming one id, and the device's own next export
+          // then carried two files sharing an id and was refused by its own
+          // importer, here and on every device a sync published it to. It is
+          // refused BEFORE the state-only door's held-bytes check, because
+          // both now sit behind the one validated model.
+          name: 'duplicate attachment METADATA ids in a STATE-ONLY file',
+          text: wrap(
+            { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
+            undefined,
+          ),
+          says: /attachments share the id/,
         },
         {
           name: 'invalid canonical text in the data',
@@ -407,6 +295,19 @@ describe('a replacement door never installs what it has not checked', () => {
       await persistedUntil(app, (s) => ((s.state as { db: { items: { id: string; title: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.title), (t) => t === 'state-only import');
       expect(await attachmentText()).toBe(goodAttachment);
 
+      // …and what that door installed is a database this app can still back
+      // up: export it and restore the export. This is the round trip the
+      // state-only door used to be able to poison — one metadata row per
+      // attachment means one file per attachment, with ids that are unique
+      // because the model that describes them is.
+      await reload(app);
+      const afterStateOnly = await exportBackup(app);
+      const stateOnlyFiles = (JSON.parse(afterStateOnly) as { files: { id: string }[] }).files;
+      expect(stateOnlyFiles.map((f) => f.id)).toEqual(['att-1']);
+      await importBackup(app, 'state-only-roundtrip.json', afterStateOnly);
+      expect(await importOutcome(app)).toContain('Imported');
+      await expect.poll(() => attachmentText()).toBe(goodAttachment);
+
       // `files: []` on data that describes NO attachments IS a real full
       // backup with nothing in it, and does replace.
       await importBackup(app, 'empty-full.json', wrap({ ...db, attachments: [] }, []));
@@ -558,6 +459,17 @@ describe('a replacement door never installs what it has not checked', () => {
       await expect.poll(() => syncMessage(page)).toMatch(/notes should be text/i);
       expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);
 
+      // …and a remote snapshot is a bare database with no `files` of its own —
+      // the same shape as the state-only file above, arriving through a
+      // different door. Duplicate attachment metadata is refused here too,
+      // rather than being installed by the one door nobody was watching.
+      const attachmentRow = { id: 'att-1', ownerType: 'item', ownerId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', createdAt: CLOCK.toISOString(), size: 12 };
+      const dupDb = { ...pulledDb, attachments: [attachmentRow, { ...attachmentRow }] };
+      publishRemote(remote, remoteStateText(dupDb), await hashState(dupDb), 102);
+      await page.getByRole('button', { name: 'Sync now' }).click();
+      await expect.poll(() => syncMessage(page)).toMatch(/attachments share the id/i);
+      expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);
+
       // --- BOTH sides changed: an explicit choice, and both copies kept ----
       const localEdit = {
         ...pulledDb,
@@ -569,7 +481,7 @@ describe('a replacement door never installs what it has not checked', () => {
         ...pulledDb,
         items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: 'edited on the other device' } : i)),
       };
-      publishRemote(remote, remoteStateText(otherEdit), await hashState(otherEdit), 101);
+      publishRemote(remote, remoteStateText(otherEdit), await hashState(otherEdit), 103);
       await goTo(app, '/settings');
       await page.getByRole('button', { name: 'Sync now' }).click();
       await page.getByRole('button', { name: 'Take the GitHub copy' }).waitFor({ timeout: 20_000 });
diff --git a/tests/practiceBrowser.ts b/tests/practiceBrowser.ts
index b045a55..a86fc32 100644
--- a/tests/practiceBrowser.ts
+++ b/tests/practiceBrowser.ts
@@ -308,3 +308,133 @@ export async function persistedDb(app: PracticeApp): Promise<{
   const { state } = await readPersistedState(app);
   return (state as { db: never }).db;
 }
+
+// ---------------------------------------------------------------------------
+// A GitHub data repo that lives in this test process.
+//
+// It is installed at the REAL transport boundary — the `fetch` calls
+// `gitRemote.ts` makes to api.github.com — so everything above it runs for
+// real: `syncNow`, `resolveConflict`, `runSync`, `decideSync`, the pre-sync
+// archive, and `importFullBackup`'s own guards. Nothing in the app is stubbed
+// or bypassed, and no request ever leaves the machine.
+// ---------------------------------------------------------------------------
+
+export interface FakeRemote {
+  /** The snapshot the repo currently holds, or null for an empty repo. */
+  snapshot: { stateText: string; hash: string; rev: number; deviceName?: string; savedAt: string } | null;
+  /** Every ref this repo has, so an archive branch is observable. */
+  refs: string[];
+  /** How many times each endpoint was called, so "it really went there" is checkable. */
+  calls: string[];
+}
+
+export function newFakeRemote(): FakeRemote {
+  return { snapshot: null, refs: [], calls: [] };
+}
+
+/** Put a snapshot in the repo as if another device had pushed it. */
+export function publishRemote(remote: FakeRemote, stateText: string, hash: string, rev: number, deviceName = 'the other device'): void {
+  remote.snapshot = { stateText, hash, rev, deviceName, savedAt: new Date().toISOString() };
+  if (!remote.refs.includes('main')) remote.refs.push('main');
+}
+
+export async function installFakeGitHub(page: Page, remote: FakeRemote): Promise<void> {
+  let headCounter = 0;
+  const blobs = new Map<string, string>();
+
+  await page.route('https://api.github.com/**', async (route) => {
+    const req = route.request();
+    const url = new URL(req.url());
+    // /repos/<owner>/<name>/<rest…>
+    const rest = url.pathname.split('/').slice(4).join('/');
+    const method = req.method();
+    remote.calls.push(`${method} ${rest}`);
+    const json = (body: unknown, status = 200) =>
+      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
+    const raw = (body: string) => route.fulfill({ status: 200, contentType: 'text/plain', body });
+    const head = () => `head-${headCounter}`;
+
+    if (method === 'GET' && rest === 'git/ref/heads/main') {
+      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
+      return json({ object: { sha: head() } });
+    }
+    if (method === 'GET' && rest.startsWith('contents/manifest.json')) {
+      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
+      return raw(
+        JSON.stringify({
+          formatVersion: 2,
+          hash: remote.snapshot.hash,
+          rev: remote.snapshot.rev,
+          deviceName: remote.snapshot.deviceName,
+          savedAt: remote.snapshot.savedAt,
+          attachments: [],
+        }),
+      );
+    }
+    if (method === 'GET' && rest.startsWith('contents/state.json')) {
+      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
+      return raw(remote.snapshot.stateText);
+    }
+    if (method === 'GET' && rest.startsWith('contents/files')) return json([]);
+    if (method === 'GET' && rest.startsWith('git/blobs/')) {
+      return json({ content: blobs.get(rest.slice('git/blobs/'.length)) ?? '' });
+    }
+    if (method === 'PUT' && rest.startsWith('contents/README.md')) {
+      headCounter += 1;
+      if (!remote.refs.includes('main')) remote.refs.push('main');
+      return json({ commit: { sha: head() } });
+    }
+    if (method === 'POST' && rest === 'git/blobs') {
+      const body = req.postDataJSON() as { content: string };
+      const sha = `blob-${blobs.size}`;
+      blobs.set(sha, body.content);
+      return json({ sha });
+    }
+    if (method === 'POST' && rest === 'git/trees') return json({ sha: 'tree-1' });
+    if (method === 'POST' && rest === 'git/commits') {
+      headCounter += 1;
+      return json({ sha: head() });
+    }
+    if (method === 'POST' && rest === 'git/refs') {
+      const body = req.postDataJSON() as { ref: string };
+      remote.refs.push(body.ref.replace('refs/heads/', ''));
+      return json({});
+    }
+    if (method === 'PATCH' && rest === 'git/refs/heads/main') return json({});
+    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"not routed"}' });
+  });
+}
+
+/**
+ * Wrap a database in the shape `state.json` holds: a full backup with NO file
+ * payloads (attachments travel as separate git blobs).
+ */
+export function remoteStateText(db: unknown, deviceName = 'the other device'): string {
+  return JSON.stringify({
+    app: 'practice-compass',
+    schemaVersion: (db as { schemaVersion?: number }).schemaVersion ?? 13,
+    exportedAt: new Date().toISOString(),
+    deviceName,
+    data: db,
+    files: [],
+  });
+}
+
+/** Connect sync through the REAL Settings form and run the first sync. */
+export async function connectSync(app: PracticeApp): Promise<void> {
+  const { page } = app;
+  await goTo(app, '/settings');
+  // The sync form's fields sit inside a labelled group rather than carrying
+  // their own accessible names. That is pre-existing Settings markup this lane
+  // is explicitly not reshaping, so this reaches them the way they actually
+  // are rather than pretending otherwise.
+  await page.getByRole('group', { name: 'Repository' }).locator('input').fill('owner/practice-data');
+  await page.getByRole('group', { name: 'Access token' }).locator('input').fill('github_pat_fake');
+  await page.getByRole('button', { name: 'Connect & sync' }).click();
+  await page.getByRole('button', { name: 'Sync now' }).waitFor({ timeout: 20_000 });
+}
+
+/** The sync section's own status line, whatever it currently says. */
+export async function syncMessage(page: Page): Promise<string> {
+  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
+}
diff --git a/tests/review-ownership.browser.test.ts b/tests/review-ownership.browser.test.ts
index 77d27c8..641b64e 100644
--- a/tests/review-ownership.browser.test.ts
+++ b/tests/review-ownership.browser.test.ts
@@ -1,15 +1,22 @@
 import { describe, expect, it } from 'vitest';
 import type { Page } from 'playwright';
 import {
+  connectSync,
   goTo,
   importBackup,
   importOutcome,
+  installFakeGitHub,
+  newFakeRemote,
   openPracticeApp,
   persistedDb,
+  publishRemote,
   reload,
+  remoteStateText,
+  syncMessage,
   type PracticeApp,
 } from './practiceBrowser';
 import v12Text from './fixtures/practice-information-v12.json?raw';
+import { hashState } from '../src/domain/canonical';
 
 // ---------------------------------------------------------------------------
 // ac-12 / ac-13 — who manages a review date, and what happens after it changes
@@ -219,19 +226,12 @@ describe('handing a review date back to the app', () => {
       expect((await facts(app, ROWLESS)).nextReviewDate).toBe(rowlessOpen.nextReviewDate);
       expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe(farsiOpen.nextReviewDate);
 
-      // ONE BRANCH IS NAMED HERE BECAUSE THIS JOURNEY CANNOT REACH IT, NOT
-      // BECAUSE IT WAS MISSED. The third case `reviewDateDraftFor` decides —
-      // the item's own date MOVING beneath an UNTOUCHED box, which must
-      // re-seed rather than save a captured date — needs a control that
-      // changes `nextReviewDate` while `ScheduleAgain` stays MOUNTED. There
-      // isn't one: an import or a sync pull leaves the page (`openSettings`
-      // navigates), and "Review today" is offered only when the item has no
-      // date, where the seed already equals what it writes. It is covered by
-      // the pure case "re-seeds an UNTOUCHED box when the item's own date
-      // moved beneath it" (`src/components/format.test.ts`), which is where
-      // the decision lives; installing this journey's own fake GitHub
-      // transport to reach it in a browser is the inbound journey's job, not
-      // this one's.
+      // The remaining branch — the item's own date MOVING beneath an
+      // UNTOUCHED box — needs something that changes `nextReviewDate` while
+      // `ScheduleAgain` stays MOUNTED, which no control on this page does:
+      // an import leaves the page and "Review today" is offered only when the
+      // item has no date. A SYNC PULL is the one that does, and section 7c
+      // below drives it.
 
       // --- 7b. A LIVE UPDATE TO THE ITEM DOES NOT DISCARD TYPED TEXT ------
       // The other half of the same rule: the draft is bound to the item, not
@@ -277,6 +277,80 @@ describe('handing a review date back to the app', () => {
       await reload(app);
       expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-05-05');
 
+      // --- 7c. A LIVE UPDATE THAT CLEARS THE DATE UNDER AN OPEN BOX -------
+      // The sealed counterexample, driven end to end: a sync pull is the one
+      // thing that replaces the item's own date while this panel stays
+      // MOUNTED, so it is what proves the reconciliation rather than a
+      // description of it. The transport is the real one — `syncNow`,
+      // `decideSync` and `importFullBackup` all run; only api.github.com is
+      // answered in-process — and the trigger is the app's own `online`
+      // listener, not a test hook reaching into the store.
+      //
+      // The old rule exempted "the item has no date" from the comparison
+      // entirely, so a CLEARED date left the box showing — and "Save date"
+      // writing — a schedule the item no longer had.
+      const remote = newFakeRemote();
+      await installFakeGitHub(page, remote);
+      await connectSync(app);
+      await expect.poll(() => syncMessage(page)).toMatch(/pushed|in sync/i);
+      /** Commits this fake repo has actually received — the push, observed. */
+      const pushes = () => remote.calls.filter((c) => c.startsWith('POST git/commits')).length;
+      const pushesAtConnect = pushes();
+
+      /** Publish the local database with ROWLESS's pending date removed. */
+      const publishCleared = async (rev: number): Promise<void> => {
+        const live = await persistedDb(app);
+        const cleared = {
+          ...live,
+          // A snapshot carries attachment bytes as separate git blobs; this
+          // fake repo has none, so the snapshot must describe none either.
+          attachments: [],
+          items: live.items.map((i) => {
+            if (i.id !== ROWLESS) return i;
+            // Absent, not empty — the shape a real snapshot carries for an
+            // item with nothing scheduled.
+            const unscheduled = { ...i };
+            delete unscheduled.nextReviewDate;
+            delete unscheduled.nextReviewSource;
+            return unscheduled;
+          }),
+        };
+        publishRemote(remote, remoteStateText(cleared), await hashState(cleared), rev);
+        await goTo(app, `/items/${ROWLESS}`);
+      };
+
+      // (i) UNTOUCHED: the box follows the item, and offers what opening it
+      //     fresh on a dateless item would — today.
+      await goTo(app, `/items/${ROWLESS}`);
+      await page.getByRole('button', { name: 'Change review date' }).click();
+      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-05-05');
+      await publishCleared(201);
+      await page.evaluate(() => window.dispatchEvent(new Event('online')));
+      await expect.poll(() => page.getByLabel('Next review date').inputValue(), { timeout: 30_000 }).toBe('2027-01-15');
+      // The panel never closed — this is the same open editor, reconciled.
+      await page.getByRole('button', { name: 'Save date' }).click();
+      await reload(app);
+      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-01-15');
+
+      // (ii) TYPED: the owner's own intent outranks the update. The reload
+      //      above already triggered the app's own on-open sync, which pushes
+      //      the date just saved and re-baselines against it — so the next
+      //      published snapshot is a clean pull rather than a both-changed
+      //      conflict. Wait for that commit to have actually landed.
+      await expect.poll(pushes, { timeout: 30_000 }).toBeGreaterThan(pushesAtConnect);
+      await goTo(app, `/items/${ROWLESS}`);
+      await page.getByRole('button', { name: 'Change review date' }).click();
+      await page.getByLabel('Next review date').fill('2027-09-09');
+      await publishCleared(202);
+      await page.evaluate(() => window.dispatchEvent(new Event('online')));
+      await expect
+        .poll(async () => (await facts(app, ROWLESS)).nextReviewDate, { timeout: 30_000 })
+        .toBeUndefined();
+      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-09-09');
+      await page.getByRole('button', { name: 'Save date' }).click();
+      await reload(app);
+      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-09-09');
+
       expect(app.pageErrors.map((e) => e.message)).toEqual([]);
     } finally {
       await app.close();
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

**Secure-context constraint.** The Screen Wake Lock API requires a secure context.
Production (GitHub Pages) is HTTPS and unaffected. This repo has no branch-preview
deployment — `.github/workflows/deploy.yml` publishes only on push to `main` — so
plain-HTTP LAN serving of an unmerged branch cannot exercise this feature at all
(`navigator.wakeLock` is simply `undefined`, which looks like a bug but is an
environment gap). Before drawing any conclusion about this feature (or any future
secure-context-dependent work) from an unmerged branch, first confirm
`window.isSecureContext` and `'wakeLock' in navigator` on the actual test device, and
establish a genuine HTTPS route for it first.

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

### DECISIONS.md

```
# Decisions

Durable record of non-obvious choices. Newest first.

## A check that lives in one door is a check with five doors missing (2026-09-16)

Two more sealed findings, and the same shape underneath both: a rule that was genuinely
correct, sitting somewhere only one caller reaches.

**Attachment identity.** "Two attachments may not share an id" lived in
`decodeBackupFiles` — which returns on its FIRST line when a file carries no `files` key.
So it ran for a full backup and for nothing else: a state-only import, a sync pull, an
archive restore and both halves of hydration all installed duplicates unchecked. Not
cosmetic, because the export emits one file per describing row: the device's own next
backup then carried two files sharing an id and was refused by its own importer, here and
on every device a sync published it to. The check moved to `validateDB`, the one function
every inbound door already runs, and `decodeBackupFiles` keeps none of its own. Bounded to
attachment ids on purpose — an id is what the bytes are KEYED by — and not widened into a
duplicate-id sweep over every collection, which this change's own non-goals rule out.

**The review-date draft.** `seeded` held "the item's date, or today when it had none", so
"no date" and "a date that is today" were the same value. That forced an exemption —
skip the whole comparison when the item has no date — and the exemption is what a live
update CLEARING the date fell into: the box went on showing, and Save date went on
writing, a schedule the item no longer had. Fixed by separating the two facts rather than
special-casing the symptom: `seeded` is the item's own date (empty when absent), `offered`
is what the box was filled with, and untouched is `text === offered`. All three
transitions — to a different date, to none, from none — are now one rule. Proved in the
browser through a real sync pull, the only thing that changes an item's date while that
panel stays mounted.

## A draft belongs to what it was typed for, not to whatever is on screen (2026-09-16)

Two sealed findings, one rule, in two editors.

**Working notes.** `ItemNotes` cleared its draft and showed "Saved." whenever the
IndexedDB write it had issued settled — but the textarea stays live while that write is
acknowledged, so anything typed in that window is NEWER than what was written. Pressing
Done, typing one more word, and letting the write land threw that word away and put a
success message over the older text. A settling write now speaks only for the text it
actually CARRIED: same text ⇒ clear the draft and say saved; different ⇒ re-issue the
write for what is on screen, which is what pressing Done asked for and is what keeps the
words when the screen is LEFT mid-write. Switching ITEM is the opposite case and stays as
it was: `saveSeq` is bumped, the write says nothing, and the draft is abandoned — those
words were typed for a notebook that is no longer on screen. Try again does the same as
Done on the failure path.
Only the latest save may act (`saveSeq`, bumped by a retry and by switching item), and the
draft is read through a ref: `storageSettled()` resolves in a microtask that can land
between a keystroke and React's next render, so neither the issuing closure nor an
effect-mirrored ref is sound.

**The review date.** `ScheduleAgain` kept `open`/`date` in plain state, and `/items/A` →
`/items/B` is a route PARAMETER change — same component instance, new props — so an open
draft survived it and "Save date" wrote A's date through B's callback. The draft now
carries the item it was opened for and that item's own pending date, and
`reviewDateDraftFor` (pure, tested) reconciles it on every render: another item drops it;
an untouched seed follows a date that moved beneath it, rather than silently reverting a
change the owner never saw; text the owner typed survives, because that is intent, not a
stale capture. Deliberately NOT an effect that resets state — a derivation cannot leave a
paint in which the box shows one item's date while Save points at another.

Both are the same sentence: an editor's draft is bound to what it was typed for, and
neither time nor a route change may re-point it.

## The export is derived from the metadata, so the app cannot write a backup it refuses (2026-09-16)

Amends "A strict “metadata without bytes” refusal needs the same rule at the other door" below, which closed one mouth of that trap and left the other open. A
sealed review found the mirror case: with a blob stored locally, a valid STATE-ONLY import
whose `data` describes no attachments is accepted and — correctly, by that door's own
contract — preserves the bytes. The database now names nothing, but
`buildFullBackupWithRev` derived `files` from the blobs actually STORED, so the next full
export carried orphan bytes and `decodeBackupFiles` refused its own device's backup
("belongs to nothing this file describes"). Not exotic either: `deleteItem`,
`deleteLesson` and `resetDemo` remove metadata synchronously while their
`void deleteBlob(...)` cleanup can fail on its own.

`files` is now built from `db.attachments` ∩ the blobs held, carrying the METADATA's
`ownerId` — the field the importer validates against and writes back onto the blob row, so
the round trip is idempotent rather than a second opinion about ownership. Unreferenced
bytes stay on the device UNTOUCHED; deleting them to make the two agree is exactly what the
state-only contract forbids, and they are simply not part of the database the backup is OF.

Fixing it at the export rather than at the state-only door was the point: the door must
preserve those bytes, so the inconsistency is legitimate and it is the EXPORT that has to
be honest about which of them the backup is for.

## One canonical home per kind of practice information — schema v13 (2026-09-16)

Four things the musician writes, four homes: **Working notes** (`item.notes`) belong to the
item and last as long as it does; an **observation** and a **next action** belong to one
recorded block; a **question** belongs to a class, in the lesson agenda. Nothing copies one
into another automatically. The problem was never that any of these were missing — it was
that nineteen other persisted fields competed with them, so the same fact could be written
in two places and disagree, and the notebook that should have been in front of you while
practising was not reachable from the practice screen at all.

**The waiver, stated exactly.** `currentProblem`, `bestStrategy`, `tags`, the item's cached
`lastObservation`, the block's `bodyNote`, and fourteen Persian/Guitar WORKING-DETAIL
fields (`shahed`, `ist`, `foroud`, `phraseLabel`, `importantNote`, `ornamentIssue`,
`mezrabIssue`, `rightHandIssue`, `leftHandIssue`, `toneIssue`, `fingering`, `tempo`,
`stringNoiseIssue`, `bodyTensionNote`) are REMOVED by the v12 → v13 migration, not merged
into `notes`. The owner established that their current content is dummy test data and
waived lossless preservation for these enumerated fields only. Merging dummy text into the
one real notebook is the failure mode, not the fix — and this app's own rule is that
nothing silently loses meaningful practice, which is why the exception had to be named,
bounded and signed rather than assumed. The Persian/Guitar IDENTITY fields (`dastgahAvaz`,
`gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) are kept: they say what the piece
IS and they group the repertoire.

**What makes it safe to re-run.** `retirePracticeText` is DELETION ONLY — it never writes a
value — so a second pass over its own output is a no-op and it is structurally incapable of
resetting canonical text. It reads no clock, so two devices migrate the same database
identically on different days. It runs on EVERY inbound database rather than only one
declaring `fromVersion < 13`, for the reason `migrateToV12` already records: a database
claiming the current schema can still carry a stray retired key from a partial conversion
or a hand-edited file.

**`lastObservation` was deleted rather than replaced** because the fact is derivable:
`latestObservation(blocks)` reads the most recent block observation and returns its DATE
with it, so the teacher sheet and the question list say *when* the observation was made
instead of presenting a stale line as current. A cached copy of a derivable fact is two
facts that can disagree.

**The surviving text is checked, never coerced.** `validatePracticeText` (the four homes'
own string fields — the block's legacy `constraint` included — and nothing else) joins
`validateDB`, so every inbound door refuses the same
thing. `null` reads as ABSENT — it is what a serialiser writes for "no value" and every
reader already treats it as missing — and empty is legitimate, because emptying a notebook
is a deliberate act. A present value of the wrong type is refused with the record named:
`String({})` is how a note becomes the literal text "[object Object]". The unfinished
block's scratch observation lives outside `PracticeDB`, on the store's ephemeral `active`,
so it gets the same rule from `validateUnfinishedText` at the same hydration boundary.

**Rollback is by restoring the backup you kept, never by a down-migration**, and the check
proves it against the app that actually wrote the file: a disposable `git worktree` at the
baseline commit, served by its own Vite server, refuses the v13 export by version with its
stored bytes unchanged, and then restores the retained v12 export with its attachment
intact and readable. A block recorded after the upgrade exists only in the v13 export —
that limitation is stated rather than papered over.

## A strict "metadata without bytes" refusal needs the same rule at the other door (2026-09-16)

`decodeBackupFiles` now refuses a full backup that describes an attachment it does not
carry (it used to `continue` past unreadable entries and install metadata for bytes that
never arrived, reporting "Imported (3 files)"). Tightening that alone creates a ONE-WAY
TRAP, which is the part worth recording: an export can only carry bytes it actually holds,
so a device holding metadata for a blob it does not have exports a file it will then refuse
on import — and publishes a sync snapshot every other device refuses too. Permanent, with
no owner-visible way out.

The state-only import (`files` absent) was the one door that could create it. So the same
invariant is enforced there: **after any install, every attachment the database describes
has bytes on this device.** A state-only file naming an attachment this device does not
hold is refused, naming the file, with the local bytes and the local database untouched —
at the one moment the owner can still do something about it. `heldBlobIds()` answers that
question from the key index rather than loading every blob to ask it.

The alternative — dropping the metadata for absent bytes — was rejected: that is silent
loss of the owner's own record, which is exactly what the refusal exists to prevent.

## Handing a review date back to the engine is administration, not evidence (2026-09-16)

`transferToAutomaticReview` moves an item to `reviewMode: 'auto'` with
`nextReviewSource: 'auto'` and KEEPS the pending date byte-for-byte. Together those two
fields mean the engine now has AUTHORITY over that date — not that the date was calculated
and not that a review happened. `srReps`/`srEase`/`srIntervalDays`/`srLastProgressDay`,
every statistic, every status and every completed row are untouched, so the next eligible
close resumes from the rung the item was already on. The button's explanation must never
call the retained date a new engine calculation; that sentence is the whole point.

It REFUSES rather than guesses on an ambiguous schedule — open rows disagreeing with the
item or with each other, or rows pending with no item date — because that is a decision the
owner makes with "Change review date". `updateItem` refuses such a save WHOLE rather than
applying the other fields and dropping the transfer. An ordinary save never releases a
protected date: only this explicit control transfers ownership, and only an explicit date
change, a snooze or "Schedule again" re-establishes the owner's.

Building the rendered control surfaced a real defect: "Review today" wrote the day the
panel had been RENDERED with (`useDecisionNow` polls every 30s), so a device left open
across local midnight saved yesterday. It now resolves the day at the moment of the tap —
the same action-time guard `CloseBlock`'s Save already uses.

## `text-align: start` is not portable, and Chromium cannot show you that (2026-09-16)

The owner had reported a Safari-only question-alignment symptom that nine rounds of
Chromium checking never reproduced, and the source left several plausible causes. Driving
the same page in WebKit reproduced it immediately and it was none of them: `ClassQuestions`'
`<li dir="auto">` inherits `text-align` from an LTR ancestor, and **WebKit inherits the
RESOLVED PHYSICAL value (`left`) where Chromium inherits the LOGICAL keyword (`start`)** and
re-resolves it against the `<li>`'s own direction. Identical DOM, identical CSS, two
different pictures: a Farsi question rendered hard against the English edge while its
ordinal — a direction-aware flex child, correct on its own terms — sat on the right.

The fix is one declaration: a block whose own direction is resolved by its content must
RE-DECLARE `textAlign: 'start'` on itself. An inherited `start` is not the same thing as an
own `start`. This generalises past `ClassQuestions` and past this lane.

The durable lesson is the other half: **a direction fix verified in one engine is verified
in one engine.** `tests/practice-information-layout.browser.test.ts` now drives the changed
surfaces in Chromium AND WebKit, at 390×844 and desktop, asserting measured bounding
positions. A missing WebKit binary fails with the install command; it never skips. Two
WebKit-only environment facts encountered on the way, neither an app bug: it cannot store a
`Blob` in IndexedDB under the automation driver (so that journey seeds state-only), and it
reports `"Importing a module script failed"` for a `React.lazy` chunk whose navigation was
aborted.

## Two deliberate limits recorded rather than quietly worked around (2026-09-16)

**The iPhone keyboard/shell symptom stays an OWNER diagnostic, with zero code.** The
reported displacement is a device-and-shell interaction the browser checks above cannot
reproduce, and `useViewportGuard.ts`, the shell height, `visualViewport` scrolling and nav
positioning are all deliberately untouched here. Guessing a timeout to make a symptom go
away is exactly the change this repo's own rules forbid, and no timeout increase is
authorised. The Farsi half of that report WAS reproduced and fixed (the WebKit entry
above); the keyboard half needs the specified capture first, on the deployed revision:

- device / iOS / app version, and standalone PWA versus Safari;
- repeat focus, keyboard dismissed with the field still focused, blur, field-to-field
  focus, route exit and orientation change — on item notes, Close, and lesson questions;
- at each transition (before / during / after), timestamped: `innerHeight`,
  `visualViewport.height` / `offsetTop` / `pageTop` / `scale`, `window.scrollY`,
  `document`/`body`/`main` `scrollTop`, `document.activeElement`'s tag, and the rectangles
  of the app shell, `main`, the tab bar and the focused field.

That set is what distinguishes layout scrolling from visual-viewport displacement from
residual internal scrolling from keyboard timing from focus scroll — five different fixes.
Prescribing one before the capture would be guessing.

**A DST assertion that only runs in some timezones is not an assertion.** The report's
local-day boundary check originally ran `if (the machine's offset changes this year)`,
which never executes on a UTC CI runner and would have reported as passing having proved
nothing. It now forces `TZ=Europe/London` around that one assertion (Node re-reads `TZ` per
call) and restores it immediately, so the case genuinely runs everywhere.

## Tenth rejection: a resolved direction that never reaches the alignment, and lines that share one (2026-09-13)

Two counterexamples, one family — and both were invisible to the guard, which is the third
thing this entry fixes.

**A user-authored title under a forced physical alignment.** Repertoire's `PathwayCard`
rendered `pathway.name` inside `<button style={{ textAlign: 'left' }}>` with no
direction-resolving group between them. The browser shaped a Farsi pathway name correctly
(bidi needs no help for that) and then pinned it to the English edge, split from its own
instrument/stage caption. The inline `<span dir="auto">` already on that caption could
never have fixed it: `text-align` is a BLOCK concept, and this repo's own "an isolate must
be inline" rule exists precisely because a `<span>` never participates in one. Fixed by
wrapping the name and its caption in ONE `dir="auto"` group that also re-declares
`textAlign: 'start'` — both halves, because either alone leaves the name where it was. The
group sits INSIDE the button rather than on it (the Balance-row precedent: the progress bar
and its counter below are layout, not text). Measured against the live page: before,
the Farsi name occupied x 41–184 of a 1068px card; after, 884–1027, with its caption on the
same edge. The English card is byte-identical in layout (`start` === `left` under LTR).

Auditing the same shape across the app found two more real instances, fixed with it:
Insights' per-instrument `<th style={CELL} dir="auto">{r.instrumentName}</th>`, where
`CELL` pinned `textAlign: 'left'` over an instrument name the owner can rename to Farsi
(CELL now uses `'start'`), and RoutineRunner's "Recorded" rows, whose `dir="auto"` row sat
under a card pinning `'left'`. `center` is deliberately NOT treated as forcing: centred text
points at no edge, so it cannot misalign an RTL run — which is also what keeps this from
demanding an unrequested layout change on the deliberately centred practice screens.

**Lines of one field that are not one language.** The bulleted multi-line renderer added
for `teacherQuestion`/`currentProblem`/`lastObservation` left every bullet bare, arguing
that lines typed into one box share one direction. They do not: a musician who types a
Farsi question and an English one into the same field gets two lines whose languages
genuinely differ, and bare lines all inherit the FIRST line's direction — an English line
dragged RTL with its bullet on the wrong side, or the reverse.

The catch that argument was right about is real, though, and is why this is not simply
"isolate every line": `dir="auto"` skips any descendant carrying its own `dir`, and the
enclosing `<li dir="auto">` (and the Problem/Last-time value wrapper) has nothing else left
to hunt, since the Ninth rejection above already isolated the title. Isolating every line
would leave the whole item with no resolution source and a silent LTR fallback — the Ninth
rejection, back again. Both hold one way only: the FIRST line is the ANCHOR and stays bare
(it still follows its own language, because the direction it inherits is the one it
produced), and every line AFTER it carries its own `dir="auto"` on the row, so its text and
its bullet both follow that line alone. The two branches are written out literally rather
than as `dir={i === 0 ? undefined : 'auto'}`, because `direction.test.ts` is a source
scanner and a computed attribute is invisible to every guard in it.

Verified against the real running Teacher Report page with DELIBERATELY MISMATCHED data in
both directions (Farsi question line followed by an English one, and the reverse; an English
item title over a Farsi question, and the reverse), at a 350px forced width: each bullet's
computed `direction` and its bullet dot's measured x-position follow that line alone, while
the item's ordinal still tracks the question's first line. In the Farsi-titled item, the
bare Farsi first line computes `rtl` with its dot at x 327–333 (the right edge) and the
isolated English second line computes `ltr` with its dot at 0–6; in the English-titled item
the mirror holds — bare English line `ltr`, dot at 19–25, isolated Farsi line `rtl`, dot at
344–350 — with the ordinal at 0–11 rather than 341–350. The `direction.test.ts` checks are
shape checks over the source, so these measured figures are the only evidence that what the
shape encodes actually renders; the discovery set behind the alignment check spans four
files (Repertoire ×2, RoutineRunner, StartBlock, Today), not the counterexample's own file
alone, so it cannot pass by having quietly emptied.

**The guard.** The sealed finding was right that the existing ac-5 check only required one
direction-aware group SOMEWHERE per file, which neither counterexample could fail.
`direction.test.ts` adds two checks that assert the invariants themselves. The first
discovers, mechanically, every element carrying a title class whose body renders an opaque
data expression, and — when anything above it forces `textAlign: 'left'`/`'right'`, inline
OR through a module-level style constant it names (which is how the Insights counterexample
was written) — requires a `dir="auto"` group below that forcing element which re-declares
`textAlign: 'start'`; it also fails any `dir="auto"` group that pins a physical alignment on
itself. The second asserts the anchor shape of the multi-line renderer: exactly one bare
line branch, exactly one `dir="auto"` branch, and the isolate on the branch chosen for lines
AFTER the first. Seven mutations were confirmed to fail the suite before this was committed
— dropping the group's `textAlign: 'start'`, dropping its `dir`, making both bullets bare,
making both bullets isolated, moving the anchor to the last line, reverting `CELL` to
`'left'`, and dropping RoutineRunner's `'start'`.

## Ninth rejection: the `<li>` anchored on the optional title, not the guaranteed question (2026-09-13)

The Eighth review below concluded no further structural change was needed, using seed data
where the item's title and its `teacherQuestion` share a language (both Farsi). An OWNER
pass reported the marker was STILL not attached to the question on the real, current build
— and, tested directly against the real running app (the actual Teacher Report page, not a
synthetic clone), with a title and question set to DIFFERENT languages, this was true and
was a genuinely different, previously undiagnosed bug: the Eighth review's own conclusion
does not extend past the one language combination its evidence used.

Root cause: `<li dir="auto">`'s hunt for a first strong character skips any descendant that
carries its own `dir`. The question and the Problem/Last-time rows all already carried
their own `dir="auto"` isolates, so the hunt could only ever land on the bare TITLE —
meaning the ordinal's side was decided by the TITLE's language alone, regardless of the
QUESTION's. With matching languages this is invisible (title and question agree on which
side to hug); with an English title and a Farsi question (or the reverse), the ordinal and
title land on one side while the question — correctly right- or left-aligned by its own
independent isolate — lands on the OTHER, unattached from the marker entirely. Reproduced
both ways by temporarily setting an English title on the real seeded Farsi item via the
live store (`useStore.getState().updateItem(...)`) against the actual running page, at both
a 390px-forced real DOM width and the full desktop width.

Fixed by reversing which field is left bare: `questionsForNextClass` guarantees
`q.question` is non-empty on every row this component renders (that is its filter); `q.title`
carries no such guarantee. The title now carries its own `dir="auto"` isolate (out of the
`<li>`'s hunt, rendering in its own correct direction independently); the question is left
bare, so the `<li>`'s `dir="auto"` — and therefore the ordinal's side — always tracks it.
Verified at both widths, both mismatch directions, and confirmed the original
matching-language case is unaffected. `direction.test.ts` adds a dedicated, mutation-tested
shape check (`"the question anchors ClassQuestions' <li>..."`) asserting the title's tag
carries `dir="auto"` and the question's does not; both reverting the title and re-marking
the question were confirmed to fail it (and, independently, `GROUP_SITE_INVENTORY`'s exact
count) before this was committed. The stale `ISOLATED_VALUE_SITES` entry for the question's
old isolate was removed; no new entry was needed for the title's new one since it is a
plain `GROUP_SITE_INVENTORY` site (same tag/class the old entry already tracked).

The general lesson, restated because this is the second time this file has learned it: a
verification built entirely from matching-language seed data proves a fix holds when the
two sides AGREE and says nothing about what happens when they DISAGREE. The Seventh
rejection's row-direction fix and this Ninth rejection are the same shape of gap, closed
twice because the same seed data was trusted twice.

## Eighth review: the ragged left edge is measured, not assumed, and needed no further fix (2026-09-13)

**Scope note (superseded in part by the Ninth rejection above):** this review's conclusion
— that no further structural change was warranted — was correct only for the ragged-edge
question it actually measured, using seed data with a Farsi title AND a Farsi question. It
was not, and should not have been read as, a claim that every marker-attachment complaint
on this screenshot was closed; a real, different bug (title/question language mismatch)
was still open and is fixed above.

A follow-up OWNER pass on the same `ClassQuestions` finding read as a further complaint:
the "1." marker looked detached from the Farsi question because the Problem/Last-time
lines sat at the opposite (left) edge from the title and question — a visible asymmetry a
screenshot reads as "not attached" even where the title itself was correctly positioned.
Rather than trust that reading, both edges were measured directly against the live DOM:
the real seeded Farsi item, cloned into a fixed-width harness at 340px, with each line's
actual rendered text extent read via `Range.getClientRects()` (glyph bounds, not
`getBoundingClientRect()` on the containing boxes). Result: all four lines — title,
question, Problem, Last time — right-align flush at 330px, an 8px gap from the ordinal's
own right edge at 338px, matching the authored `gap: 8` exactly. The LEFT edges spread
across 62px-205px (143px), because the four lines differ in length and each is
right-aligned inside a box whose right edge is pinned to the ordinal regardless of the
box's own width.

A specific fix was proposed and tested before being rejected: swap the value wrapper's
`flex: 1` (`.grow`) for shrink-to-fit sizing, on the theory that a narrower box would pull
the ragged edges together. Patched live and re-measured, the result was byte-for-byte
identical — same 143px spread, same individual line positions — because for right-aligned
text, `left edge = box_right − line_width`, and `box_right` never moves: it stays flush
against the ordinal no matter how the box itself is sized. There is no flex-sizing change
that touches this, because the sizing was never the defect.

Conclusion: a ragged left edge on right-aligned lines of differing length is ordinary
typography (the same shape any right-aligned paragraph or an address block has), not a
resolvable structural defect. The actual defect the owner was reacting to was fixed by the
Seventh rejection below, before this measurement was taken: Problem/Last-time used to sit
at the FAR left (~25px, the opposite edge entirely) while title/question sat at ~330px — a
hard two-line/two-line split, not mere length variance. Once the row-direction fix made
all four lines agree on which edge they hug, what's left is ordinary variance in line
length, and no further structural or padding change is warranted. No source change
accompanies this entry; it exists so a future review does not reopen the same screenshot
and re-diagnose an already-closed gap as a new one.

## Seventh rejection: the ROW's own alignment must come from the value, not an inherited direction (2026-09-13)

A seventh sealed finding, checked on the owner's own iPhone, found the sixth rejection's
`display: 'inline-block'` fix for `ClassQuestions`' `Problem:`/`Last time:` rows still
wrong — not merely incomplete. That fix gave the VALUE its own bidi character order and
its own wrap-line alignment, but left the ROW that positions "Label: value" as a unit
BARE, so the row inherited whichever direction the TITLE above it resolved to — right for
a Farsi title, left for an English one — regardless of what script the value was actually
written in. For the common case (title and value the same language) this looked correct
by coincidence; for an English-titled item with a Farsi problem note, the whole row
stayed pinned left, exactly where the inherited direction put it, with the value's
internal shaping correct but its POSITION wrong. This is the same root cause the
"A GROUP CARRYING DIRECTION IS NOT THE SAME CLAIM AS EVERY CHILD IN IT HAVING ITS OWN"
section already named for other files, just not yet applied to a LABEL-plus-VALUE row.

Fixed by moving `dir="auto"` from the value to the ROW itself, and marking the LABEL —
never the value — with its own `dir="ltr"`. This is not because the label's text ever
changes; `dir="auto"` skips a descendant that carries its own `dir` when hunting for a
first strong character, so marking the label takes it OUT of that hunt and leaves the
(deliberately bare) value as the row's only resolution source. Marking the value too
would take BOTH out, leaving the row with nothing to resolve from and a silent fallback
to LTR regardless of the value's own script — confirmed to fail the new test when tried.
Verified across all four combinations (Farsi/English title × Farsi/English value) at both
a narrow (350px, iPhone-card-width) and a wide (700px, desktop) container: a value's own
language now determines its row's alignment independently of the title, in both
directions, at both widths. This also resolved the number/title "detachment" the same
finding reported: with all four lines (title, question, Problem, Last time) correctly
right-aligning together, the block reads as one coherent unit against the marker instead
of two aligned lines and two stray ones.

`direction.test.ts` replaces the `ISOLATED_VALUE_SITES` ledger entries for these rows
with a shape check, `isLabelFirstAutoRow` / "a label-first auto row's value stays bare":
any `dir="auto"` group whose body opens with a `<span dir="ltr">…</span>` must have no
other `dir=` anywhere else in its body, or the row has nothing left to resolve from. It is
a SHAPE check, not a ClassQuestions-specific one, so it would catch the same regression in
any future file using this pattern. Two mutations were confirmed to fail before this was
committed: marking the value `dir="auto"` too (caught by the new check and by
`GROUP_SITE_INVENTORY`'s exact-order equality), and removing the label's `dir="ltr"`
entirely — reverting to the original bug — which the PRE-EXISTING `unexemptedPhrase` check
also catches on its own (the bare "Problem" label plus the value's opaque expression reads
as a 2-word exposed phrase), giving this shape two independent guards.

## Sixth rejection: a native marker is removed, not accommodated; a value's alignment is its own (2026-09-13)

A sixth sealed finding, checked on the owner's own iPhone, found `ClassQuestions.tsx`'s
question number still escaping the card despite the third rejection's symmetric
`paddingInline` fix — proof that an outside `::marker`'s exact position for a
direction-variable `<li>` is a browser implementation detail no gutter measurement can
guarantee (jsdom cannot compute it either, which is why a padding proxy was ever trusted
to stand in for it). Fixed by removing the native marker mechanism entirely rather than
reserving room for it: `listStyle: 'none'` on the `<ol>`, with the ordinal rendered as a
real element, the FIRST child of a flex `<li dir="auto">` — flexbox's row axis is
direction-aware by specification, so the number leads on the correct side and sits inside
the content box it can never escape. The wrapper around title/question/details carries no
`dir` of its own, deliberately: `dir="auto"` skips a descendant that has its own `dir`
when hunting for a first strong character, so giving the wrapper one would leave the
`<li>` with no resolution source at all. `direction.test.ts`'s list-marker check
(`disablesNativeMarker`/`isDirectionAwareContainer`, replacing `reservesRoomOnBothSides`)
now asserts the mechanism directly — no native marker, and the `<li>` is itself a
flex/grid container — rather than measuring a proxy for it; each half was confirmed to
fail on its own when reverted. `role="list"` on the `<ol>` pays back the one accessibility
cost of removing the marker: WebKit drops an `<ol>`'s list semantics from the
accessibility tree once `list-style: none` takes its marker away, which would have gone
unnoticed here — VoiceOver on the owner's own iPhone is exactly where it would have
surfaced.

The same finding also covered `ClassQuestions`' `Problem:`/`Last time:` lines, diagnosed at
the time as a wrap-alignment gap and fixed with `display: 'inline-block'` on the value's
own isolate. A seventh sealed finding (below) found that diagnosis incomplete — the value
having its own bidi order was never the same claim as the ROW having the right
alignment — and replaced it with a different fix entirely. See "Seventh rejection" above
for what actually shipped.

## Fifth rejection: the instrument-name check had to become positive, not just a ban (2026-09-12)

A fifth sealed review found the fourth rejection's fix was still a negative check —
banning `dir="ltr"`/`"rtl"` around an instrument name — which cannot detect a name with
NO direction treatment at all, an alias beyond the two literal anchors the check knew
(`instrumentName`, `{inst}`), or a name fused into a template string before anything
renders. Real, live instances of all three: Repertoire's `PathwayCard`, Session Plan's
two page titles, wide Lessons' sidebar heading and detail-pane header, Today's
cross-instrument "in progress"/"plan"/"routine" rows (built as pre-joined template
strings), Today's instrument switcher and `EmptyState` title and "Before your … class"
heading, and ActiveBlock's/CloseBlock's own eyebrow (mis-classifying the instrument's own
name as fixed English in their own comments). Fixed by replacing the ban with a positive,
mechanically-discovering check in `direction.test.ts`: `instrumentNameOccurrences` finds
every current renderer from the SHAPES this codebase uses to produce one (the helper call,
a property read, a local alias of either via destructure-rename/const-binding/find-and-name,
or a per-item `.name` read inside an `instruments` iteration) rather than a location list,
and `resolvesOwnDirection` asserts the invariant itself — the nearest ancestor `dir` must
be `"auto"` AND nothing else may render before the name within that ancestor's body, or
the ancestor's resolution belongs to whatever precedes it, not to the name riding along
beside it. Two sites deliberately stay bare because they are already the first strong
content of their own dir="auto" ancestor (Insights.tsx's `<th>`, Today.tsx's
cross-instrument `{inst.name}` row) — isolating either would break, not fix, them, the
same reasoning that earlier reverted isolating `stage.title`. Two gaps are named rather
than silently left: `QuickAdd.tsx`'s instrument-picker button has the identical bare-name
defect but sits in a file this lane's own contract puts out of scope, so the check
explicitly excludes it instead of failing on a bug this lane cannot fix; and
`src/domain/insights.ts` fuses an instrument name into a generated sentence one layer
below where a presentation-only lane can reach, left open for its own lane. See
AGENTS.md's "A FIFTH REJECTION..." section for the full account.

## Fourth rejection: an instrument name is user text, not generated copy (2026-09-12)

A sealed review found four sites (`ItemCard.tsx`, `ItemDetail.tsx`,
`PathwayDetail.tsx`, `Repertoire.tsx`) forcing an item's or work's instrument name under
`dir="ltr"` as if it were generated metadata like `ITEM_TYPE_LABELS` sitting next to
it — but an instrument is renameable in Settings, Farsi included, so it is the owner's
own editable text and needed its own `dir="auto"` isolate instead. Auditing every
remaining `LTR_ISOLATE_SITES` entry against its real source (not just the four named)
found a fifth of the identical shape (`Today.tsx`'s "routine running" row, bundling the
instrument name and a fixed English suffix into one `dir="ltr"` span) and two with no
direction treatment at all — invisible to that audit because it can only see spans that
already carry a `dir`: the Plan doorway's mismatched-instrument row (the exact twin of
the routine row) and the weekly Balance row's instrument name, bare inside a
`.truncate` title span whose row is a CSS grid (isolating the row itself, rather than
the name, would have reversed its three columns for a Farsi instrument). All seven now
carry their own `dir="auto"`, and `direction.test.ts` bans the SHAPE going forward — any
`dir="ltr"`/`"rtl"` isolate whose body references `instrumentName` (a call, a bare
identifier, or a property access like `b.instrumentName`) fails — rather than
re-closing whichever locations a reviewer happened to enumerate.

## Third rejection: an isolate must be inline, a marker needs room on both sides, and the scanner's own blind spot (2026-09-12)

A third sealed review of the direction lane found the SAME family — mixed-content
groups, alignment, list markers, completeness — still open in `ItemMaterial.tsx`,
`Materials.tsx`, `ItemCard.tsx`, `RoutineRunner.tsx`, `Lessons.tsx`, `Repertoire.tsx` and
`ClassQuestions.tsx`, closed as three root causes rather than as seven counterexamples.

1. **A block-level isolate resolves its own alignment, independently of the group.**
   `ItemMaterial.tsx`'s detail line carried `<div className="tiny faint" dir="ltr">…
   </div>` — the isolate fixed the sentence's own bidi ordering but, because
   `text-align: start` is a per-box computed value resolved against that box's OWN
   `direction`, gave the div's `text-align` a LEFT resolution regardless of the group's
   (possibly RTL) one — the detail split from a right-aligned Farsi title exactly as
   before, one level down. Fixed by moving every such isolate to an inline `<span>`
   nested inside a `dir`-less block (the shape already used everywhere else in the
   file), and closed for good with a mechanical rule in `direction.test.ts`: no
   `dir="ltr"`/`dir="rtl"` may sit on anything but `span`/`bdi`. One rejected review
   found one file doing this; a structural ban is what stops a second file doing it
   next lane.

2. **A native list marker follows its OWN list item's direction, not the list's.**
   `ClassQuestions.tsx`'s `<ol>` reserved gutter space with `paddingInlineStart` alone
   while each `<li>` resolves its own direction via `dir="auto"` — the browser positions
   the outside `::marker` on that li's OWN start edge, so a Farsi item's marker lands on
   the right, the side the list reserved no room for, and gets pressed against or past
   the content border. Fixed with symmetric `paddingInline`. `direction.test.ts` scans
   every `<ol>`/`<ul>` for this shape now, not just this one list.

3. **The scanner itself skipped every `{…}` expression as opaque, contributing zero
   words — hiding a run built ENTIRELY from expressions.** `Materials.tsx`'s
   `{MATERIAL_SOURCE_LABELS[...]} · {MATERIAL_STATUS_LABELS[...]} ·{' '} {itemCount(...)}
   item{...}` reads as zero literal words to a scanner counting only literal text, while
   rendering three always-English fragments in a row, unisolated, next to a title that
   could resolve RTL. `unexemptedPhrase` now counts an opaque, non-JSX-bearing
   expression as ONE token (its content stays invisible from source, but its
   unisolated PRESENCE next to other content is the shape being caught); an expression
   containing its own nested JSX stays fully opaque, since its children are already
   reachable by the outer whole-file scan. That one change, plus re-auditing every
   recorded group by hand, surfaced the five named sites and further, unnamed ones of
   the identical shape: `Repertoire.tsx`'s second, near-duplicate work-count span (the
   non-Persian branch mirrors the fixed one and had simply been missed), `ActiveBlock`'s
   own mode/focus chips, `Attachments`'/`ItemDetail`'s file kind/size line,
   `StartBlock`'s/`Today`'s item-type/status labels, `StageDetail`'s strand/status
   line, `PathwayDetail`'s "Current"/"Done"/item-count badges and piece-count fallback,
   `Today`'s "routine running" indicator and its cross-instrument Overview row (a fixed
   sentence embedding the next item's own possibly-Farsi title, isolated the way
   `StageDetail`'s undo banner already does), and `Insights`' generated observation
   sentences. Two sites needed `dir="auto"` rather than `dir="ltr"` — a value authored
   independently of its neighbour, not generated copy: `RoutineRunner`'s upcoming
   segment label and `PathwayDetail`'s pathway `source`. A stage's own `title` was
   tried the same way and REVERTED: `stage.title` is not authored independently of
   `stage.code` — it is the SAME stage's fuller name, rendered only when it differs
   from the code — and a prior lane already settled that the two should AGREE on
   whichever direction the group resolves rather than one overriding the other
   (`PathwayDetail`'s stage rows, 2026-09-11 entry below: "even where a group DOES
   resolve LTR from its code, that is the point"). Isolating `stage.title` in its own
   `dir="auto"` would have pulled it OUT of the button's own auto-detection (a nested
   `dir` attribute is skipped by the HTML algorithm), which can flip the group's OWN
   resolved direction whenever `stage.code` itself has no strong character — the
   opposite of "agree." It stays a bare `<span>`, exactly like `stage.code`. Two
   flagged sites were genuine exceptions, recorded visibly in a new
   `UNEXEMPTED_PHRASE_ALLOWLIST` rather than isolated: a numeric progress counter
   (`{sp.done}/{sp.total}` — digits carry no bidi risk) and a compound "Pathway — Stage"
   breadcrumb built from two fields (one continuous label, not a title split from a
   foreign caption).

4. **`elementBody`'s depth counter did not recognise React's Fragment shorthand as an
   opening tag, only as a closing one — silently truncating the body several checks
   scan.** `</>` starts with `/`, so it matched the ordinary CLOSING-tag branch and
   decremented depth; `<>` starts with neither `/` nor a letter, so it matched nothing
   and never incremented it. Every `<>…</>` pair inside a group's body therefore
   decremented depth once more than it was ever incremented — and this codebase's own
   established shape for a conditional detail (`{stage && (<><span>…</span>
   <Link>…</Link></>)}`, `ItemDetail.tsx`'s header) uses exactly that shorthand. On
   that header, depth hit zero several tags before the `</header>` actually closes,
   so `unexemptedPhrase` silently stopped scanning before ever reaching
   `<span className="tiny faint">difficulty {item.difficulty}/5</span>` — a real,
   unisolated generated-English phrase that had been sitting in the group the whole
   time, invisible to a scanner whose whole claim is "detectable, not enumerated."
   Fixed by giving `<>` the same weight as any other opening tag; the fix surfaced
   this one concrete violation across every file the suite scans (no others were
   hiding behind it), now fixed with the same `dir="ltr"`/`dir="auto"` split as its
   sibling `row-wrap` (`instrumentName`/`ITEM_TYPE_LABELS` generated, `stage.code`/
   the material label left bare since both can be Farsi themselves) and its
   importance/difficulty/saturated row. A structural bug in the TEST's own tag
   traversal is exactly the kind of gap a purely example-driven fix cannot close —
   only re-deriving the traversal from first principles (does this construct open or
   close a nesting level?) finds it.

**A restructure, not a pure direction-only edit, in `Repertoire.tsx`'s `WorkRow`.**
Its metadata line was `[form, composer, gusheh, instrumentName, lastPractised]
.filter(Boolean).join(' · ')` — a single STRING assembled from fields in two
different authorships (Persian identity fields, genuinely Farsi; instrument name and
the last-practised phrase, generated English). A joined string has no seam to hang a
`dir=` on partway through, so isolating it correctly required rebuilding the array as
JSX nodes (`<span dir="auto">`/`<span dir="ltr">` per fragment) joined with an
explicit separator, rather than adding an attribute to existing markup. This is more
than the "direction wiring only" the contract asks of a non-loop file, but there was
no lighter way to give each fragment its own bidi base — flagged here rather than
left for a reviewer to have to notice on their own.

**The scanner's own comment-stripping had a latent bug this work exposed, not
introduced.** `stripComments` treated any `'`/`"` as a real string delimiter and
scanned forward, unbounded, for its match. Plain JSX text containing an apostrophe
(`StageDetail.tsx`: "That stage doesn't exist.") is not a string at all; hitting that
apostrophe put the scanner into a phantom "inside a string" state that swallowed
everything after it — including real comments — until an unrelated quote later
happened to close it, cascading through the rest of the file. This had been silently
true all along and only surfaced because a new comment inside the corrupted span
happened to quote `dir="ltr"` in its own prose, which the (no longer stripped) comment
then exposed to the new block-isolate scan as a phantom real attribute. Fixed at the
root: a `'`/`"` now starts a real string only if its match appears before the next
newline (every real string/attribute value here is single-line); otherwise it passes
through as ordinary text. Backtick template literals keep their unbounded, multi-line
scan. This makes every check in the file more trustworthy, not just the new ones.

## The content leads: direction on the group, and a colour list that is bounded on purpose (2026-09-11)

**Direction lives on the GROUP, never on the title.** `dir="auto"` was on 47 title
elements and on no container anywhere, so a Farsi title resolved RTL and hugged the right
edge of its cell while its own English caption hugged the left. The fix is not a new
mechanism — it is moving the SAME native attribute up one level, to the element that
holds a title together with the details belonging to it. Two consequences are worth
recording because they are not obvious:

1. `dir="auto"` resolves from the FIRST STRONG CHARACTER in the subtree, so where an
   English eyebrow precedes the title in the DOM (Today's Practise-now card, the close
   screen's header, Session Plan's minutes/bucket line) the group is drawn around
   title + details and the eyebrow is deliberately left OUTSIDE it. Wrapping the whole
   card would pin the group LTR and change nothing.
2. Direction alone does not move text. Several groups sit under an ancestor pinning
   `text-align: left` (a picker row button, the practice screen's centred column), and
   `left` is inherited as a COMPUTED value — it does not re-resolve per element. Those
   groups set `text-align: start` on themselves.

The sweep is held closed by `src/components/direction.test.ts` rather than by care, and
its exception allowlist came out EMPTY: every title on every surface had a group it could
join. `PathwayDetail`'s stage rows were the candidate exception (an ascii-looking code
like "2A" leading a Farsi title) — but the Setar and Tar seeds author stage codes in
Farsi (`نشست`, `شور`, `ماهور`), so grouping code + title is both correct and what the
owner actually sees. Even where a group DOES resolve LTR from its code, that is the point:
the code and the title then agree instead of pointing at opposite edges.

**The colour list is bounded, and the planner's "six failing tokens" was an undercount.**
The plan measured each foreground token against `--bg` only. Two tokens fail there and
were missed (`--tone-progress` 4.41, `--tone-rest` 4.26), and more importantly `--bg` is
not where several of them RENDER: `--tone-rest` only ever appears as `.badge`/`.chip`
text over its own translucent `--tone-rest-soft` fill. `src/styles/contrast.test.ts`
therefore lists the pairs each token is ACTUALLY rendered on, compositing a translucent
fill over the card it sits in, and asserts them in all three palette blocks.

That honest list moves EIGHT light tokens (`--text-faint`, `--accent`, `--gold`,
`--tone-alert`, `--tone-warn`, `--tone-progress`, `--tone-good`, `--tone-rest`) and FOUR
dark ones (`--text-faint`, `--tone-alert`, `--tone-progress`, `--tone-rest`) rather than
the six + one the plan predicted. The list was NOT trimmed to make that arithmetic come
out right: an uncovered token is supposed to be a visible omission, and dropping badges
would have left two of the five tone tokens with no coverage at all. Three of the four
dark moves are 1–7 units and imperceptible. `--accent-contrast` (white on the primary
Start button, 3.95 at HEAD) needed no move of its own — darkening `--accent` to clear AA
against the page took that pair to 5.94. Every `-soft` fill, `--text`, `--text-dim` and
`--accent-dim` are untouched, because they pass.

**Both light blocks, every time.** `global.css` declares the light palette twice — at
`:root[data-theme='light']` and again inside `@media (prefers-color-scheme: light)
{ :root:not([data-theme]) }`. The duplicate is what an owner who never picked a theme
sees, so the test asserts both blocks AND that they agree token for token.

**Reading the stylesheet needed a workaround, not a config change.** `src` is typechecked
by `tsconfig.app.json`, which does not enable node types, and Vitest blanks every `.css`
module — `?raw` included — unless `test.css` is on in `vite.config.ts`. Both files are
outside this lane's scope. So the contrast test reads the real file through a dynamic
import whose specifier the compiler cannot resolve statically. Reading the REAL file is
the whole point: a table of colours copied into the test would keep passing while the app
shipped something else. The direction test needs no such trick — `import.meta.glob` with
`?raw` works for `.tsx`, and a glob also means a NEW page is swept in automatically.

**One ReviewPlan on the close screen.** The collapsed summary line and the expanded date
field are two renderings of ONE value, with a manual correction folded into it rather
than held beside it. The guarantee had to be structural: `CloseBlock` previously called
`planNextReview` twice (once for the preview hint, once inside `pickResult` to seed the
field), which is exactly the drift r-explainable-scheduling exists to prevent. A pure
formatter (`reviewSummaryLine`) renders the line and computes nothing, so a divergent
date is unrepresentable rather than merely remembered about.

**Today's order was built the other way round, tried, and REVERTED — by design.** The
lane built Practise now directly under the instrument switcher with Plan and Routines as
two compact peer doorways beneath it, on the argument that orchestrating a session is a
choice you make INSTEAD of taking the suggestion. It shipped as one ordering change with
no data or state implication precisely so the owner's own device could settle it. It did:
on 2026-09-11 the owner judged the original order better — Plan and Routines read as
belonging at the top of the page, and recommendation-first felt less natural — so the
order went back. That reversal is a PASSING outcome of the check, not a failure of the
lane, and everything else the lane built stands.

Worth recording for whoever reads the code next: BOTH orders keep the recommendation
above the fold at 390×844, so nothing about this ordering follows from the phone
constraint or from any other rule in AGENTS.md. It is a taste judgement that only the
owner can make, and the argument for recommendation-first is genuinely available to
re-derive — which is exactly why `Today.tsx` and AGENTS.md now say, in so many words,
not to act on it without asking.

**Rejection findings, addressed (fresh review, 2026-09-11).** A sealed fresh review of
this lane's diff returned `request_changes` against two families, fixed comprehensively
rather than by patching the two cited examples:

1. **Mixed-content groups and completeness.** Grouping a Farsi title with an
   ALWAYS-ENGLISH generated detail (`buildReason`, `planSegmentReason`) under one
   `dir="auto"` fixed the ALIGNMENT but broke the detail's own bidi ordering: the Farsi
   title's resolved RTL base became the detail's base too, and FriBidi renders a trailing
   neutral character (the sentence's own full stop) using that base when nothing more
   specific claims it — so it visually jumped to the start. Fixed by nesting a
   `dir="ltr"` isolate around each such detail (Today's Practise-now card and secondary
   recommendations, ItemDetail's "practise this part now", Session Plan's segment
   list and runner) — grouping and alignment are unchanged, only the isolate's own
   internal ordering is fixed. A structurally identical bug existed the other way round
   for FREE TEXT the owner typed after a fixed English label (ActiveBlock's
   `constraint`/`problem`, "last time you decided to try"): the label was the subtree's
   first strong text, so `dir="auto"` on the whole line resolved from the label and never
   saw the owner's own (possibly Farsi) words — fixed the same way the codebase already
   excludes an eyebrow, by giving the VALUE its own nested `dir="auto"` and leaving the
   label outside it. Today's Routines doorway had the same eyebrow-first bug at the
   button level ("Resume your routine"/"Routines" decided the direction, not the routine's
   own name) — fixed by moving `dir="auto"` off the button and onto a block wrapper
   around just the name, mirroring the shape `ElsewhereSessions` already used a few lines
   above it (an inline `<span>` there would silently break `.truncate`'s ellipsis, since
   `overflow`/`text-overflow` do nothing on a non-replaced inline box). ActiveBlock's
   header stayed CENTRED despite the contract requiring Farsi right / English left on that
   screen — the page's own `text-align: center` (correct for the timer ring and buttons)
   was never overridden for the title group; it now sets `text-align: start` on itself,
   which is a deliberate LAYOUT CHANGE for English on that one screen and is documented in
   AGENTS.md as not conflicting with "English keeps its layout" elsewhere (that non-goal
   guards against a Farsi-style right-align, not against ac-6's explicit left-for-English
   requirement on Active).

   The COMPLETENESS gap: `direction.test.ts`'s "every surface has a group" check passed
   as long as ONE group survived anywhere in the file, so deleting the Practise-now card's
   own `dir="auto"` still passed because Today.tsx has several unrelated groups. Fixed
   with `GROUP_SITE_INVENTORY` — every group-level site recorded in order, duplicates
   included, asserted with `toEqual` against the live scan, so removing any ONE recorded
   site anywhere fails regardless of what else survives in the same file. Building that
   inventory surfaced a second, unrelated defect in the scanner itself: this file's own
   prose repeatedly writes the literal string `dir="auto"` in comments, and the naive
   regex scan matched those too — usually producing a site with no real enclosing tag, but
   at least once walking backward out of a long comment and mis-attributing an unrelated
   component tag from elsewhere in the file as if it were the match's real element. The
   scanner now strips `//` and `/* */` comments (copying string/template literals through
   verbatim, since that is where a REAL `dir="auto"` attribute value lives) before
   matching.

2. **CloseBlock manual-date preservation.** `pickResult` cleared the manual `override` on
   every result change — correct when the engine actually re-plans (a fresh judgement
   deserves a fresh plan, not a stale correction pinned to the old one), wrong when it
   doesn't: a manual-mode item (`item.reviewMode === 'manual'`) has no automatic plan for
   ANY result, so a date the owner had just typed in was never tied to a particular
   judgement, and clearing it turned a deliberate "come back on this date" into an
   accidental decline the moment they picked a different result. Fixed by gating the
   clear on `reviewOverrideSurvivesResultChange(item.reviewMode)`
   (`src/components/format.ts`) rather than calling `planNextReview` a second time inside
   `pickResult` — CloseBlock's single `ReviewPlan` derivation is unchanged; this is a
   boolean read of the item's own mode, not a second value that could disagree with it.
   The predicate is tested against the real engine across all six results for both a
   manual- and an auto-mode item, not asserted in prose alone.

**Second rejection, closed as a family rather than as four counterexamples
(2026-09-11).** A second sealed review found the FIRST fix's isolate pattern had not
been applied everywhere it was needed: `CloseBlock`'s own "A few seconds to capture
what happened." sat bare in the item-title group (the identical defect the first
rejection fixed elsewhere in the same file's neighbours), and `ClassQuestions`'
question/problem/last-observation carried no isolate of any kind, unlike the
`ActiveBlock` shape the first fix established. Rather than patching just those two
call sites, the whole surface list was re-audited for the same two shapes:

- **Fixed English copy/metadata bare in a group** — beyond the two named sites, the
  same "N segments · M min" phrase existed identically in THREE places
  (`Today.tsx`'s `TodayRoutineRow`, `PathwayDetail.tsx`'s `RoutineRow`,
  `StageDetail.tsx`'s `RoutineCard` — one component per surface a routine can be
  started from, never refactored into one shared component), `StaleNote`'s "Running
  far past its target…" (rendered inside two different title groups), Today's due-review
  caption ("due `relativeDay(...)`"), the NAS-reference warning sentences
  (`Lessons.tsx`, `ItemMaterial.tsx`), `ItemDetail.tsx`'s "Study source:" label and
  `StageDetail.tsx`'s "Added "…" — not practised yet." undo banner. Every one now
  carries the same nested `dir="ltr"` isolate as the first fix's `reason` spans.
- **Independently-authored values bare in a group** — `PathwayDetail.tsx`'s
  `pathway.description`/`pathway.note`, editable independently of the pathway's own
  name, needed the same `dir="auto"` isolate `ActiveBlock`'s `constraint`/`problem`
  already carry.

**The test itself was the real gap, not just the four sites.** `direction.test.ts`
proved a GROUP carries direction; it never proved a CHILD inside it does. A generic
"no bare Latin text in a group" rule would have forced changes to the already-correct
`ActiveBlock` label shape (`Constraint: ` stays bare on purpose, immediately followed
by its own isolate), so the new check (`unexemptedPhrase`) walks a group's body in
source order, judges an accumulated run of exposed text at each TAG boundary (never at
an expression boundary, or `{n} segments · {m} min` fragments into single innocent
words), and exempts a run — regardless of its length — the moment it is immediately
followed by an element carrying its own `dir=`. Two recorded ledgers
(`ISOLATED_VALUE_SITES`, `LTR_ISOLATE_SITES`) cover what no source scan can prove:
an expression's own content (`{q.currentProblem}`) is opaque from source, and a
component like `StaleNote` renders its isolate from its OWN definition, invisible from
any of its call sites. Both carry the same visibility contract as
`GROUP_SITE_INVENTORY` — a new site must be added, visibly, never inferred silently.

## Serving NAS class recordings over HTTPS (Task 3, 2026-07; CORRECTED 2026-09-10)

**Problem.** The app runs on an HTTPS origin (GitHub Pages). Class videos and scores
live on the Synology NAS under `homes/ethan/SNDK/video-courses` (on disk:
`/volume1/homes/ethan/SNDK/video-courses`). A lesson reference stores a *relative*
path (e.g. `setar-classes/session-1-…/video.mp4`); the app joins it under a **NAS
base URL** set in Settings. Two things must be true for playback:

1. The base URL must be a real `https://` origin. (A scheme-less value like
   `ds220plus.taild1d1f7.ts.net` was previously concatenated raw and treated as a
   *relative* URL against the Pages origin — so every recording opened the same
   in-app 404. Fixed in `normalizeBaseUrl` / `resolveRecording`,
   `src/domain/recordings.ts`.)
2. The folder must be served over HTTPS. DSM on `:5000` does **not** serve raw
   files, and plain `http://` links are mixed content that iOS blocks.

**What is ACTUALLY running (probed 2026-09-10, and this corrects what this record
used to claim).** This file previously recorded *Tailscale Serve on the Synology* as
the chosen mechanism, with a runbook. That is **not** what is in place, and an agent
following that runbook would have configured the wrong thing:

- There is **no Tailscale CLI and no Tailscale.app on this Mac**.
- `https://192.168.0.20:5010/` answers **HTTP 200 from nginx** and already serves
  **real browsable directory listings** (mod_autoindex-style "Index of /"), whose
  document root IS the `video-courses` folder — it lists `setar-classes/`,
  `tar-classes/` and `classical-guitar/`, and `/setar-classes/` answers 200. So the
  existing relative references already resolve against it, and a **Browse** link
  needs no server change whatsoever; the capability was already there and unused.
- The certificate is Synology's own default (`CN=synology`, issuer
  `Synology Inc. CA`) and does **not** match `192.168.0.20`. That is why this works
  on the MacBook, where the exception has been accepted, and why **each new device
  must accept the certificate once** before NAS links open there. A certificate
  prompt on the iPhone is INFRASTRUCTURE, not an app defect.

**Current base URL:** `https://192.168.0.20:5010` (LAN only).

**The app is deliberately TRANSPORT-AGNOSTIC, and that is now enforced rather than
hoped for.** A reference pasted from the NAS listing is stored **relative** to the
configured base (`relativizeReference`, `recordings.ts`, tested) instead of as the
absolute URL the browser gave you. An absolute URL would pin that reference to one
route to the NAS — dead on a phone away from home, and dead everywhere the day the
base URL changes. Because only the path is stored, **choosing the transport is a
decision that can be changed later without rewriting a single stored reference.**

**That choice is deliberately left OPEN.** Staying on the LAN address, moving to
Tailscale (`ts.net` gives a valid certificate and tailnet-only access; Go's file
server supports Range requests, so video seeking works), or putting a reverse proxy
in front are all still available. Whichever is chosen, only the Settings base URL
changes.

**Rejected alternatives.** WebDAV (auth prompts break iOS inline video); per-file
File Station share links (unmaintainable — one link per file). Also deliberately NOT
built: a `scan:nas` index feeding an in-app file picker — the NAS already renders
browsable listings, so browse → copy → paste closes most of the gap without adding a
build script, a generated reference module, a staleness story and a Mac-only
dependency. Revisit only if browsing and pasting proves insufficient in real use.

**Never modify the recordings themselves** — the app only stores references, and
removing a reference never touches the NAS file.

---

## Session Plan — algorithm & evidence (2026-07-18)

The Session Plan (`src/domain/plan.ts`) lays out a time-budgeted session as ordered
segments in five buckets (warm-up · lesson · review · deep · cool-down). It reuses the
recommendation engine's `scoreItems` — no second ranking — and is pure and deterministic.

**Decisions.**
- **Minutes always sum to the budget.** A largest-remainder split by bucket weight, each
  segment ≥ 2 min; when the budget can't seat every segment, the lowest-priority ones are
  dropped before allocation. This is the one load-bearing invariant and is tested across
  15/20/30/45/60 and the edge cases.
- **The plan runs REAL blocks, not a countdown.** The runner drives the existing
  start→active→close flow; `closeSession` advances the plan only when the closed block was
  the current segment. `RoutineRunner` (the warm-up timer) is deliberately left untouched.
- **The running plan is ephemeral** (store-only, never in `PracticeDB`) so it never syncs
  or lands in a backup as data.
- **Shares are sane defaults, adjustable, never "optimal".** Bucket minute shares come from
  `SchedulingParams` (Settings) — the app makes no claim of an ideal ratio.

**Evidence (used as rationale for the SHAPE, not as precise prescriptions).**
- Spacing effect → short, spaced segments + SM-2 (Cepeda et al. 2006; Simmons 2012).
- Contextual interference / interleaving → the no-adjacent-same-item mix and the "it feels
  harder; that's the point" framing (Shea & Morgan 1979; Carter & Grahn 2016; Stambaugh 2011).
- Retrieval practice → short review slots (Roediger & Karpicke 2006).
- Deliberate, goal-directed practice → one focus per segment (Ericsson et al. 1993;
  Duke, Simmons & Cash 2009).
- Sleep consolidation → cool-down / end-on-stability (Simmons & Duke 2006).

No claim of an optimal minute ratio is made; the shares are defaults the user can adjust.
```

### src/components/format.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  addDays,
  type BlockResult,
  createItem,
  planNextReview,
  REVIEW_TYPE_LABELS,
  type ReviewPlan,
  toISODate,
} from '../domain';
import {
  closeOverrideDate,
  relativeDay,
  reviewDateDraftFor,
  reviewOverrideSurvivesResultChange,
  reviewSummaryLine,
  splitLines,
} from './format';

const NOW = new Date('2026-06-18T12:00:00.000Z');

const ALL_RESULTS: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

/**
 * The close screen collapses the whole scheduling decision to ONE line, with
 * the date field, the review type and "Why this date?" a tap behind it. That is
 * only safe if the line and the field are two renderings of the SAME value — so
 * this asserts the formatter REPORTS a plan rather than deriving anything of its
 * own. A formatter that recomputed a date could disagree with the field; one
 * that can only read the three fields it is handed cannot.
 */
describe('reviewSummaryLine', () => {
  it("the one-line review summary reports exactly the ReviewPlan's due date, type and rationale", () => {
    // A REAL plan from the engine — the same call CloseBlock makes — so this is
    // bound to the value the screen actually holds, not a hand-written stub.
    const item = createItem({ instrumentId: 'i', title: 'درآمد شور', status: 'fragile' }, NOW);
    const plan = planNextReview({ item, result: 'worse', now: NOW });
    expect(plan).not.toBeNull();

    const line = reviewSummaryLine(plan as ReviewPlan, NOW);

    expect(line).toContain(relativeDay(plan!.dueDate, NOW));
    expect(line).toContain(REVIEW_TYPE_LABELS[plan!.reviewType]);
    expect(line).toContain(plan!.rationale);

    // …and nothing else: the line is exactly those three fields, in order.
    expect(line).toBe(
      `Review ${relativeDay(plan!.dueDate, NOW)} · ${REVIEW_TYPE_LABELS[plan!.reviewType]} · ${plan!.rationale}`,
    );
  });

  it('follows the plan it is given, so a corrected date is the date it reports', () => {
    // The screen folds a manual correction INTO the one plan value rather than
    // keeping a second date beside it. Whatever ends up in that value is what
    // the line says — there is no path by which the line keeps the engine's
    // date while the field shows another.
    const engine: ReviewPlan = {
      intervalDays: 2,
      dueDate: '2026-06-20',
      reviewType: 'repair',
      changeStrategy: false,
      rationale: 'A slip resets the interval to 2 days.',
    };
    const corrected: ReviewPlan = { ...engine, dueDate: '2026-07-01', rationale: 'The date you chose.' };

    expect(reviewSummaryLine(engine, NOW)).toBe('Review in 2 days · Repair · A slip resets the interval to 2 days.');
    expect(reviewSummaryLine(corrected, NOW)).toBe('Review in 13 days · Repair · The date you chose.');
  });
});

/**
 * A manually chosen review date must survive changing the result WHENEVER THE
 * ENGINE'S ANSWER DOES NOT DEPEND ON THE RESULT. The predicate is bound to the
 * actual engine here, not asserted in prose: it asks the engine for all six
 * results and compares the dates it gets back.
 */
describe('reviewOverrideSurvivesResultChange', () => {
  it('a manually chosen date survives changing the result when no automatic plan depends on it', () => {
    // Manual mode: no automatic plan for ANY result, ever.
    const manualItem = createItem(
      { instrumentId: 'i', title: 'درآمد شور', status: 'fragile', reviewMode: 'manual' },
      NOW,
    );
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: manualItem, result, now: NOW })).toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(manualItem, NOW)).toBe(true);

    // A PROTECTED future date: the answer is "the existing one" whatever the
    // judgement, so a date the owner typed was never tied to a result either.
    const protectedItem = {
      ...createItem({ instrumentId: 'i', title: 'Protected', status: 'fragile' }, NOW),
      nextReviewDate: toISODate(addDays(NOW, 6)),
    };
    expect(reviewOverrideSurvivesResultChange(protectedItem, NOW)).toBe(true);

    // A DUE automatic item: the engine answers differently per result, so a
    // correction made for one judgement must not be carried to another.
    const dueItem = {
      ...createItem({ instrumentId: 'i', title: 'Étude', status: 'fragile' }, NOW),
      nextReviewDate: toISODate(NOW),
      nextReviewSource: 'auto' as const,
    };
    for (const result of ALL_RESULTS) {
      expect(planNextReview({ item: dueItem, result, now: NOW })).not.toBeNull();
    }
    expect(reviewOverrideSurvivesResultChange(dueItem, NOW)).toBe(false);
  });
});

/**
 * THE SEAM between the close screen and the store. The screen shows the date
 * that will STAND — which, for a session before a review is due, is the item's
 * existing date. Handing that back as an explicit override would stamp every
 * engine-proposed date as the owner's (so nothing could ever bring it forward
 * again) and turn every "keep" into a write that completes the pending row.
 * Only a date actually typed into the field is an override.
 */
describe('closeOverrideDate', () => {
  it('passes on only a date the owner typed, never the date merely displayed', () => {
    expect(closeOverrideDate('scheduled', null)).toBeUndefined();
    expect(closeOverrideDate('scheduled', {})).toBeUndefined();
    // Changing only the review-type pills sets an override with no date.
    expect(closeOverrideDate('scheduled', { dueDate: undefined })).toBeUndefined();
    // A cleared field is a decline, handled by the answer — not a date.
    expect(closeOverrideDate('scheduled', { dueDate: '' })).toBeUndefined();
    expect(closeOverrideDate('scheduled', { dueDate: '2026-07-04' })).toBe('2026-07-04');
    // The other two answers never carry a date at all.
    expect(closeOverrideDate('declined', { dueDate: '2026-07-04' })).toBeUndefined();
    expect(closeOverrideDate('unanswered', { dueDate: '2026-07-04' })).toBeUndefined();
  });
});

describe('splitLines', () => {
  it('splits a multi-line free-text field into its trimmed, non-empty lines', () => {
    expect(splitLines('سوال اول؟\nسوال دوم؟')).toEqual(['سوال اول؟', 'سوال دوم؟']);
  });

  it('keeps a single line as one entry, and drops blank lines and surrounding whitespace', () => {
    expect(splitLines('one question')).toEqual(['one question']);
    expect(splitLines('a\n\n  \nb\n')).toEqual(['a', 'b']);
    expect(splitLines('  padded  ')).toEqual(['padded']);
  });
});

describe('reviewDateDraftFor', () => {
  const TODAY = '2026-06-18';
  const A = { id: 'a', nextReviewDate: '2027-02-10' };
  const B = { id: 'b', nextReviewDate: '2027-05-05' };
  const openOnA = { forItem: 'a', seeded: '2027-02-10', offered: '2027-02-10', text: '2027-02-10' };
  // What ScheduleAgain seeds on an item with NO date: the item's own date is
  // empty, and the box is offered today.
  const openOnDateless = { forItem: 'a', seeded: '', offered: TODAY, text: TODAY };

  it('keeps an untouched draft while its item and date are unchanged', () => {
    expect(reviewDateDraftFor(openOnA, A, TODAY)).toEqual(openOnA);
  });

  it('keeps text the owner typed for its own item', () => {
    const typed = { ...openOnA, text: '2027-03-01' };
    expect(reviewDateDraftFor(typed, A, TODAY)).toEqual(typed);
  });

  it('DROPS a draft belonging to another item, so A\'s date cannot be saved onto B', () => {
    expect(reviewDateDraftFor(openOnA, B, TODAY)).toBeNull();
    expect(reviewDateDraftFor({ ...openOnA, text: '2027-03-01' }, B, TODAY)).toBeNull();
  });

  // --- The item's own date moving beneath the box: ONE rule, every direction -
  // present→different, present→absent and absent→present are the same
  // question ("is this box still offering what the item says?") and must not
  // be three cases with three answers. `seeded` records the item's own date
  // (empty when it has none) and `offered` what the box was filled with, so
  // "untouched" is decidable without exempting any transition.

  it('re-seeds an UNTOUCHED box when the item\'s own date moved beneath it', () => {
    // A sync pull, another tab, or a close screen moved the date. Saving the
    // captured one would silently revert a change the owner never saw.
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    expect(reviewDateDraftFor(openOnA, moved, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: '2027-04-20',
      text: '2027-04-20',
    });
  });

  it('re-seeds an UNTOUCHED box when the item\'s date was CLEARED beneath it', () => {
    // The sealed counterexample. A live update (a sync pull, a declined review
    // closed elsewhere) removes A's pending date while the panel sits open.
    // The old rule skipped the comparison entirely whenever the item had no
    // date, so the box went on showing 2027-02-10 and "Save date" wrote it
    // back — resurrecting a schedule the item no longer had. It is the same
    // "the item's date moved" case as every other, and re-seeds to what a
    // fresh open would offer: today.
    const cleared = { id: 'a' };
    expect(reviewDateDraftFor(openOnA, cleared, TODAY)).toEqual({
      forItem: 'a',
      seeded: '',
      offered: TODAY,
      text: TODAY,
    });
    // …and it stays settled: the baseline caught up, so a later render with
    // the same (dateless) item leaves it exactly alone rather than re-deciding.
    const once = reviewDateDraftFor(openOnA, cleared, TODAY)!;
    expect(reviewDateDraftFor(once, cleared, TODAY)).toEqual(once);
  });

  it('re-seeds an UNTOUCHED today-box when the item GAINED a date beneath it', () => {
    // The mirror image, and the reason "the item has no date" cannot simply be
    // spelled as an empty `seeded` on the text as well: the box was offered
    // today, today is not the item's date, and the box must still follow the
    // item when one arrives.
    const gained = { id: 'a', nextReviewDate: '2027-04-20' };
    expect(reviewDateDraftFor(openOnDateless, gained, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: '2027-04-20',
      text: '2027-04-20',
    });
  });

  it('keeps TYPED text through every move of the item\'s own date', () => {
    // The owner's intent outranks the item's date in all three directions, and
    // the baseline catches up each time so it is not re-decided every render.
    const typed = { ...openOnA, text: '2027-03-01' };
    const moved = { ...A, nextReviewDate: '2027-04-20' };
    const once = reviewDateDraftFor(typed, moved, TODAY);
    expect(once).toEqual({ forItem: 'a', seeded: '2027-04-20', offered: '2027-02-10', text: '2027-03-01' });
    expect(reviewDateDraftFor(once, moved, TODAY)).toEqual(once);

    // Cleared beneath TYPED text: the text is theirs and stands.
    expect(reviewDateDraftFor(typed, { id: 'a' }, TODAY)).toEqual({
      forItem: 'a',
      seeded: '',
      offered: '2027-02-10',
      text: '2027-03-01',
    });
    // Gained beneath a typed today-box: likewise.
    const typedOnDateless = { ...openOnDateless, text: '2027-01-01' };
    expect(reviewDateDraftFor(typedOnDateless, { id: 'a', nextReviewDate: '2027-04-20' }, TODAY)).toEqual({
      forItem: 'a',
      seeded: '2027-04-20',
      offered: TODAY,
      text: '2027-01-01',
    });
  });

  it('leaves a box seeded with today alone on an item that still has no date', () => {
    // The item's date has not moved — it is absent and stays absent — so
    // nothing here re-seeds, including across a later day: the comparison is
    // against the ITEM, never against `today`.
    const noDate = { id: 'a' };
    expect(reviewDateDraftFor(openOnDateless, noDate, TODAY)).toEqual(openOnDateless);
    expect(reviewDateDraftFor(openOnDateless, noDate, '2026-06-19')).toEqual(openOnDateless);
    expect(reviewDateDraftFor({ ...openOnDateless, text: '2027-01-01' }, noDate, TODAY)).toEqual({
      ...openOnDateless,
      text: '2027-01-01',
    });
  });

  it('has nothing to reconcile when no draft is open', () => {
    expect(reviewDateDraftFor(null, A, TODAY)).toBeNull();
  });
});
```

### src/components/format.ts

```
import {
  dayDiff,
  parseISODate,
  planNextReview,
  REVIEW_TYPE_LABELS,
  type BlockResult,
  type PracticeItem,
  type ReviewAnswer,
  type ReviewPlan,
  type SchedulingParams,
} from '../domain';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function formatMinutes(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatShortDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatDateTimeISO(iso: string): string {
  return formatShortDate(new Date(iso));
}

/** Friendly relative day from an ISODate (calendar) string. */
export function relativeDay(dateISO: string, now: Date = new Date()): string {
  const diff = dayDiff(now, parseISODate(dateISO)); // +future, -past
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff === -1) return 'yesterday';
  if (diff > 1) return `in ${diff} days`;
  return `${-diff} days ago`;
}

/** Friendly relative day from a full ISO datetime. */
export function relativeFromDateTime(iso: string | undefined, now: Date = new Date()): string {
  if (!iso) return 'never';
  const diff = dayDiff(new Date(iso), now); // days since
  if (diff <= 0) return 'today';
  if (diff === 1) return 'yesterday';
  return `${diff} days ago`;
}

export function pluralize(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/**
 * A free-text field's own non-empty lines. There is no data structure for
 * "multiple questions" — a lesson-agenda question's text, `currentProblem` and
 * `lastObservation`
 * are each one `<textarea>`, so two distinct questions typed for the same
 * item live as two lines of one string. This is how a renderer tells "one
 * line" (plain text) from "several" (worth a bulleted breakdown) apart,
 * without inventing a schema change for what is still one field.
 */
export function splitLines(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * The close screen's ONE honest line for the review decision — "Review in 2
 * days · Repair · …" — read off the SAME ReviewPlan that seeds the date field
 * behind the disclosure.
 *
 * It is a pure FORMATTER, never a second derivation: it reports the plan's
 * three fields and computes no date of its own. That is what makes
 * r-explainable-scheduling's "the date shown before saving is exactly the date
 * saved" hold by construction on a screen where the decision is collapsed to a
 * line — a divergent date is unrepresentable, not merely remembered about.
 */
export function reviewSummaryLine(plan: ReviewPlan, now: Date = new Date()): string {
  return `Review ${relativeDay(plan.dueDate, now)} · ${REVIEW_TYPE_LABELS[plan.reviewType]} · ${plan.rationale}`;
}

/**
 * Whether a manual date correction on the close screen should survive picking
 * a different result.
 *
 * A correction the owner made earlier belongs to the date the PREVIOUS result
 * produced, so carrying it forward would pin a date to a judgement it was
 * never made about — unless the engine's answer does not depend on the
 * judgement at all. That is now true in several more cases than "manual mode":
 * a fixed cadence, a date the owner chose, a legacy date of unknown
 * provenance, and an ordinary automatic date that is simply not due yet all
 * produce the SAME answer for every result, so a typed-in date was never tied
 * to one of them.
 *
 * So this asks the real engine instead of naming the cases: does the plan
 * differ across the six results? It is a BOOLEAN GATE on whether an automatic
 * plan that depends on the result exists at all — not a second value that
 * could disagree with CloseBlock's single derivation.
 */
export function reviewOverrideSurvivesResultChange(
  item: PracticeItem,
  now: Date,
  params?: SchedulingParams,
): boolean {
  const dates = RESULTS_FOR_OVERRIDE_CHECK.map(
    (result) => planNextReview({ item, result, now, params })?.dueDate ?? null,
  );
  return new Set(dates).size === 1;
}

const RESULTS_FOR_OVERRIDE_CHECK: BlockResult[] = [
  'worse',
  'same',
  'slightly_better',
  'stable_alone',
  'stable_in_context',
  'performable',
];

/**
 * The date a close hands to the store as an EXPLICIT OWNER OVERRIDE.
 *
 * ONLY a date the owner actually typed into the field. The close screen shows
 * the date that will stand, which for an early session is the item's EXISTING
 * date — passing that back as an override would be catastrophically wrong in
 * two ways at once: it would stamp every engine-proposed date as user-chosen
 * (so `worse` could never bring it forward again), and it would turn every
 * "keep" decision into a write, completing the pending review row and
 * replacing it on a session that was only extra practice.
 *
 * The discriminator is `override.dueDate` specifically, not `override` itself:
 * changing only the review-type pills sets an override with no date, and that
 * is not the owner choosing a date.
 */
export function closeOverrideDate(
  answer: ReviewAnswer,
  override: { dueDate?: string } | null,
): string | undefined {
  if (answer !== 'scheduled') return undefined;
  return override?.dueDate ? override.dueDate : undefined;
}

/**
 * The open "Change review date" draft, reconciled against the item the screen
 * is ACTUALLY showing right now.
 *
 * A date editor is a panel that stays mounted across things that change what
 * it is editing. `/items/A` → `/items/B` is a route PARAMETER change, so React
 * keeps the same component instance and only the props move; an import, a sync
 * pull or another tab can likewise replace the item's own date while the panel
 * sits open. Neither remounts anything, so an untouched draft quietly becomes
 * a date belonging to something that is no longer on screen — and "Save date"
 * then writes it through the CURRENT item's callback. A's 2027-02-10 lands on
 * B.
 *
 * So the draft carries the item it was opened for, the item's own date at that
 * moment, and the value the box was actually OFFERED — and this decides what it
 * still means. It is the same rule `ItemNotes` applies to the notebook — a
 * draft is bound to what it was typed for — expressed once, purely, where a
 * Node test can reach it:
 *
 *   • a DIFFERENT item  → dropped. Never re-pointed, never saved onto B.
 *   • the item's own date UNCHANGED → the draft stands, whatever is in it.
 *   • the item's date MOVED beneath an untouched box → re-seeded, so the panel
 *     offers what the item now says rather than a value the owner never chose
 *     and would silently revert.
 *   • the item's date moved beneath TYPED text → the text stands. It is the
 *     owner's own intent, not a stale capture; only the baseline catches up so
 *     this decision is not re-made on every later render.
 *
 * THREE FACTS, THREE FIELDS — and conflating two of them was a real defect.
 * `seeded` used to hold "the item's date, or today when it had none", which
 * made "the item has no date" indistinguishable from "the item's date happens
 * to be today", so the only way to stop a dateless item's today-box being
 * re-seeded to empty was to skip the comparison entirely whenever the item had
 * no date (`if (!current) return draft`). That exemption is what a live update
 * CLEARING the date then fell into: the box went on showing — and Save date
 * went on writing — a date the item no longer had, a schedule the owner had
 * every reason to believe was gone. There is no exemption now. `seeded` is the
 * item's own date and is EMPTY when it has none, `offered` is what the box was
 * filled with (the date, or today), and "untouched" is `text === offered`. The
 * absent→present, present→absent and present→different transitions are then
 * one rule rather than three cases, and a cleared date re-seeds the box to
 * today exactly as opening it fresh on that item would.
 *
 * `today` is passed in rather than read from a clock here: this module is
 * pure, and the caller already has the day the rest of its screen is rendered
 * against.
 */
export interface ReviewDateDraft {
  /** The item this draft was opened for. */
  forItem: string;
  /** The item's OWN pending date when the box was last (re-)seeded; '' for none. */
  seeded: string;
  /** What the box was filled with then — the item's date, or today. */
  offered: string;
  /** What is in the box now. */
  text: string;
}

export function reviewDateDraftFor(
  draft: ReviewDateDraft | null,
  item: { id: string; nextReviewDate?: string },
  today: string,
): ReviewDateDraft | null {
  if (!draft) return null;
  if (draft.forItem !== item.id) return null;
  const current = item.nextReviewDate ?? '';
  if (current === draft.seeded) return draft;
  const offered = current || today;
  return draft.text === draft.offered
    ? { forItem: draft.forItem, seeded: current, offered, text: offered }
    : { ...draft, seeded: current };
}
```

### src/domain/io.test.ts

```
import { describe, expect, it, vi } from 'vitest';
import V11_TEXT from '../../tests/fixtures/practice-decisions-v11.json?raw';
import V12_TEXT from '../../tests/fixtures/practice-decisions-v12.json?raw';
import { serializeExport, validateDB, parseImport } from './io';
import { migrateToCurrent } from './migrations';
import { createSeedDB } from './seed';
import { createBlock, createItem, createLesson } from './factories';
import { blocksInWindow, nextLessonDates, nextLessonFor } from './selectors';
import { createPreparation, createQuestion, detachItem, detachLesson } from './lessonAgenda';
import { SCHEMA_VERSION, type PracticeDB } from './types';
import { addDays, nowISO, toISODate } from './util';
// The Zustand persist boundary (§C7's actual enforcement point, not just
// validateDB's own import-path callers) has no allowed dedicated store test
// file for this contract — the same situation routines.test.ts documents for
// the single-active-clock guard — so its regression coverage extends this
// ac-15 test instead of being left unproven.
import { useStore, getLastHydrationError, useHydrationStatus } from '../store/useStore';
// The cold-start refusal screen and its recovery action are rendered UI, not
// store wiring — reusing the SAME real-browser harness the two journey tests
// use (never a second import implementation, never jsdom/RTL as a new
// testing platform) is what lets this test prove the recovery action is
// actually reachable and actually works, not merely that the store computes
// the right flags.
import { openPracticeApp, readPersistedState, reload, writePersistedState } from '../../tests/practiceBrowser';

// The IndexedDB-backed persist storage doesn't exist in this test environment
// (no real indexedDB global) — same stub routines.test.ts uses, except the
// fake storage here is CONTROLLABLE per assertion: vi.hoisted keeps its state
// reachable from the mock factory (which Vitest hoists above these imports)
// without a temporal-dead-zone reference.
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  let setItemCalls = 0;
  return {
    get: () => value,
    set: (v: string | null) => {
      value = v;
    },
    recordSetItem: () => {
      setItemCalls += 1;
    },
    setItemCalls: () => setItemCalls,
  };
});
vi.mock('../store/idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../store/idb')>();
  return {
    ...actual,
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_name: string, value: string) => {
        fakeStorage.recordSetItem();
        fakeStorage.set(value);
      },
      removeItem: async () => fakeStorage.set(null),
    },
  };
});

const NOW = new Date('2026-06-18T12:00:00.000Z');

describe('validateDB — backward-compatible import', () => {
  it('round-trips a current export untouched', () => {
    const db = createSeedDB(NOW);
    const out = validateDB({ app: 'practice-compass', data: db });
    expect(out.items.length).toBe(db.items.length);
    expect(out.lessons.length).toBe(db.lessons.length);
  });

  it('folds a legacy attachment itemId into ownerType and ownerId', () => {
    const db = createSeedDB(NOW);
    const legacy = {
      ...db,
      schemaVersion: 5,
      attachments: [
        { id: 'att1', itemId: db.items[0].id, name: 'afshari.pdf', mime: 'application/pdf', size: 100, kind: 'pdf', createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(db.items[0].id);
    expect((out.attachments[0] as unknown as { itemId?: string }).itemId).toBeUndefined();
  });

  it('keeps modern owner-shaped attachments and lesson item links as-is', () => {
    const db = createSeedDB(NOW);
    const lesson = createLesson({ instrumentId: db.instruments[0].id, date: '2026-06-01' }, NOW);
    lesson.itemIds = [db.items[0].id];
    const withData = {
      ...db,
      lessons: [...db.lessons, lesson],
      attachments: [
        { id: 'a2', ownerType: 'lesson' as const, ownerId: lesson.id, name: 'notes.pdf', mime: 'application/pdf', size: 5, kind: 'pdf' as const, createdAt: '2026-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(withData);
    expect(out.attachments[0].ownerType).toBe('lesson');
    expect(out.lessons.find((l) => l.id === lesson.id)?.itemIds).toEqual([db.items[0].id]);
  });

  it('rejects unusable shapes with a readable error', () => {
    expect(parseImport('not json').ok).toBe(false);
    expect(parseImport(JSON.stringify({ items: 'nope' })).ok).toBe(false);
  });

  it('treats a missing schemaVersion as the oldest and runs the whole chain', () => {
    // Pre-v3 shaped: no `pathways` key at all, and no schemaVersion field.
    const legacy = {
      instruments: [{ id: 'i-setar', name: 'Setar', family: 'Persian', active: true, createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z' }],
      materials: [],
      items: [],
      blocks: [],
      reviews: [],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
  });

  it('places a legacy pathwaySteps item into its stage on every path', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: 'stale-stage' };
    const legacy = {
      ...db,
      schemaVersion: 4,
      items: [item],
      // Truncated to one item on purpose (this test is about pathwaySteps,
      // not lesson agenda) — the seed's OWN agenda entries would otherwise
      // dangle against every item but this one, which the strict live-itemId
      // check now (correctly) refuses.
      lessonAgenda: [],
      pathwaySteps: [{ itemId: item.id, stageId: 'correct-stage' }],
    };
    // migrateToV5's overwrite behaviour wins over the old "fill only when
    // empty" precedence — the same result whichever path the data arrived by:
    // the chain directly, and the real import entry point.
    const viaChain = migrateToCurrent(legacy as unknown as PracticeDB, 4);
    expect(viaChain.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
    const viaImport = validateDB(legacy);
    expect(viaImport.items.find((i) => i.id === item.id)?.stageId).toBe('correct-stage');
  });

  it('returns a legacy backup with no schemaVersion fully migrated', () => {
    const db = createSeedDB(NOW);
    const item = db.items[0];
    const legacy: Record<string, unknown> = {
      instruments: db.instruments,
      materials: db.materials,
      items: [{ ...item, stageId: undefined }],
      blocks: db.blocks,
      reviews: db.reviews,
      pathwaySteps: [{ itemId: item.id, stageId: 'legacy-stage' }],
      attachments: [
        { id: 'att-legacy', itemId: item.id, name: 'notes.pdf', mime: 'application/pdf', size: 10, kind: 'pdf', createdAt: '2025-01-01T00:00:00.000Z' },
      ],
    };
    const out = validateDB(legacy);
    expect(out.schemaVersion).toBe(SCHEMA_VERSION);
    expect(out.pathways.length).toBeGreaterThan(0);
    expect(out.items.find((i) => i.id === item.id)?.stageId).toBe('legacy-stage');
    expect(out.attachments[0].ownerType).toBe('item');
    expect(out.attachments[0].ownerId).toBe(item.id);
    expect(out.lessons).toEqual([]);
  });

  it('rejects a database from a newer schema version instead of downgrading it', () => {
    const db = createSeedDB(NOW);
    const fromTheFuture = {
      app: 'practice-compass' as const,
      schemaVersion: SCHEMA_VERSION + 1,
      exportedAt: nowISO(NOW),
      data: { ...db, schemaVersion: SCHEMA_VERSION + 1 },
    };
    const result = parseImport(JSON.stringify(fromTheFuture));
    expect(result.ok).toBe(false);
    expect(() => validateDB(fromTheFuture)).toThrow(/newer version/i);
  });

  it('keeps legacy pathwaySteps placements when imported through the real entry point', () => {
    const db = createSeedDB(NOW);
    const item = { ...db.items[0], stageId: undefined };
    const legacyText = JSON.stringify({
      ...db,
      schemaVersion: undefined,
      items: [item],
      // Truncated to one item on purpose (see the sibling test above).
      lessonAgenda: [],
      pathwaySteps: [{ itemId: item.id, stageId: 'from-pathway-steps' }],
    });
    const result = parseImport(legacyText);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.db.items.find((i) => i.id === item.id)?.stageId).toBe('from-pathway-steps');
    }
  });
});

describe('blocksInWindow — history stays historical', () => {
  const item = createItem({ instrumentId: 'i', title: 't' }, NOW);
  const at = (daysAgo: number) =>
    createBlock(
      {
        practiceItemId: item.id,
        instrumentId: 'i',
        durationMinutes: 10,
        mode: 'learn',
        focus: 'tone',
        result: 'slightly_better',
        startedAt: addDays(NOW, -daysAgo).toISOString(),
      },
      NOW,
    );

  it('excludes future-dated blocks from insight windows', () => {
    const blocks = [at(1), at(3), at(-2)]; // one block "from the future"
    const windowed = blocksInWindow(blocks, NOW, 7);
    expect(windowed).toHaveLength(2);
    expect(windowed.every((b) => new Date(b.startedAt) <= NOW)).toBe(true);
  });

  it('still bounds the window at N days back', () => {
    const blocks = [at(1), at(10)];
    expect(blocksInWindow(blocks, NOW, 7)).toHaveLength(1);
  });
});

describe('per-instrument lesson dates', () => {
  it('nextLessonDates maps each instrument only to its own next class', () => {
    const lessons = [
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 5)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, 30)) }, NOW),
      createLesson({ instrumentId: 'tar', date: toISODate(addDays(NOW, 2)) }, NOW),
      createLesson({ instrumentId: 'setar', date: toISODate(addDays(NOW, -10)) }, NOW), // past
    ];
    const map = nextLessonDates(lessons, NOW);
    expect(map.get('setar')).toBe(toISODate(addDays(NOW, 5)));
    expect(map.get('tar')).toBe(toISODate(addDays(NOW, 2)));
    expect(map.get('guitar')).toBeUndefined();
    expect(nextLessonFor(lessons, 'guitar', NOW)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// ac-15 — C5/C6/C7: every inbound door, and what must be refused at it
// ---------------------------------------------------------------------------

// The exact bytes the browser journeys import through the real UI.

/** The shapes `validateDB` accepts, i.e. every door an inbound database uses. */
function doors(text: string): { label: string; payload: unknown }[] {
  const wrapped = JSON.parse(text) as { data: unknown };
  return [
    { label: 'full backup (data + files)', payload: JSON.parse(text) },
    { label: 'wrapped export', payload: { app: 'practice-compass', schemaVersion: 11, data: wrapped.data } },
    { label: 'bare database', payload: wrapped.data },
  ];
}

describe('the v12 model at every inbound door', () => {
  it('all inbound paths preserve the new model or reject before replacement', async () => {
    // 1. Every door migrates identically. `importFullBackup` (manual import,
    //    sync pull, Keep remote, archive restore) and the store's own
    //    `importDB` all route through THIS function, so a door that behaved
    //    differently would have to bypass it.
    const reference = JSON.stringify(validateDB(JSON.parse(V11_TEXT)));
    for (const { label, payload } of doors(V11_TEXT)) {
      expect(JSON.stringify(validateDB(payload)), label).toBe(reference);
    }

    // 2. A CURRENT v12 database round-trips with its agenda, question history,
    //    scheduling provenance and one-advance-per-day marker intact.
    const v12 = validateDB(JSON.parse(V12_TEXT));
    const enriched: PracticeDB = {
      ...v12,
      items: v12.items.map((i) =>
        i.id === 'i-scheduled'
          ? { ...i, nextReviewSource: 'user' as const, srLastProgressDay: '2026-08-01' }
          : i,
      ),
      lessonAgenda: v12.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-farsi'
          ? { ...e, askedAt: '2026-08-02T10:00:00.000Z', answer: 'بله، زینت را سبک‌تر کن.' }
          : e,
      ),
    };
    const round = validateDB(JSON.parse(serializeExport(enriched)));
    expect(round.lessonAgenda).toEqual(enriched.lessonAgenda);
    const scheduled = round.items.find((i) => i.id === 'i-scheduled')!;
    expect(scheduled.nextReviewSource).toBe('user');
    expect(scheduled.srLastProgressDay).toBe('2026-08-01');
    expect(scheduled.srReps).toBe(3);
    expect(scheduled.reviewMode).toBe('manual');

    // 3. INVALID NEW DATA is refused with actionable detail, and nothing is
    //    filtered away quietly — dropping an entry the owner wrote is the
    //    data loss this guard exists to prevent.
    const bad = (agenda: unknown[]) => () => validateDB({ ...v12, lessonAgenda: agenda });
    const sample = v12.lessonAgenda[0];
    expect(bad([{ ...sample, kind: 'reminder' }])).toThrow(/unknown kind/);
    expect(bad([{ ...sample, id: undefined }])).toThrow(/missing an id/);
    expect(bad([sample, { ...v12.lessonAgenda[1], id: sample.id }])).toThrow(/share the id/);
    expect(bad([{ ...sample, instrumentId: '' }])).toThrow(/missing its instrument/);
    expect(bad([{ ...sample, lessonId: 'L-guitar-past' }])).toThrow(/different instrument/);
    expect(bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: '  ' }])).toThrow(/has no text/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: 'yesterday' }]),
    ).toThrow(/unreadable asked date/);
    // An IMPOSSIBLE calendar timestamp is refused too, not merely an
    // unparseable one: `Date.parse` silently NORMALISES "2026-02-30" into
    // March 2nd rather than rejecting it, so a shape check (or `Date.parse`
    // alone) happily accepted it before this. A sealed review reproduced
    // exactly this string passing.
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', askedAt: '2026-02-30T12:00:00.000Z' }]),
    ).toThrow(/unreadable asked date/);
    // A DANGLING live `lessonId` — set, but resolving to nothing — is neither
    // a real agenda entry nor an honest unassigned one: `deleteLesson` always
    // converts a live reference to a detached marker, so this app never
    // leaves one dangling, and it is refused rather than tolerated as legacy
    // debris.
    expect(bad([{ ...sample, lessonId: 'nonexistent' }])).toThrow(/class that no longer exists/);
    // A dangling `itemId` is REFUSED for the identical reason, not tolerated:
    // `deleteItem` (`useStore.ts`) always calls `detachItem` in the SAME
    // synchronous update that removes the item — a preparation naming it is
    // removed outright, and a question's `itemId` becomes
    // `detachedFromItemId` — so this app never leaves a LIVE `itemId`
    // dangling any more than a `lessonId`. A sealed review found this
    // previously tolerated on a theory the real producer above does not
    // support.
    expect(
      bad([{ kind: 'preparation', id: 'p', instrumentId: 'setar', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(
      bad([{ kind: 'question', id: 'q', instrumentId: 'setar', text: 'x', itemId: 'nonexistent' }]),
    ).toThrow(/practice item that no longer exists/);
    expect(() => validateDB({ ...v12, lessonAgenda: 'nope' })).toThrow(/must be a list/);
    // Calendar values are checked for real, not merely shape: a due date and
    // an item's own next-review date must both name a date that exists.
    expect(() =>
      validateDB({ ...v12, items: v12.items.map((i) => (i.id === 'i-scheduled' ? { ...i, nextReviewDate: '2027-99-99' } : i)) }),
    ).toThrow(/unreadable next-review date/);
    expect(() =>
      validateDB({ ...v12, reviews: v12.reviews.map((r) => ({ ...r, dueDate: '2026-02-30' })) }),
    ).toThrow(/unreadable due date/);
    // An INCOMPLETE conversion — a legacy field still set with no entry to
    // represent it — is converted rather than accepted as-is, because the
    // chain runs on every inbound database whatever version it claims.
    // Declaring schema 12 (the CURRENT version, not a legacy 11) is the real
    // counterexample: a version-gated conversion step would skip this
    // database entirely and accept the leftover field with zero questions to
    // show for it.
    const halfConverted = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'left behind' } : i)),
    });
    expect(halfConverted.lessonAgenda.some((e) => e.kind === 'question' && e.text === 'left behind')).toBe(true);
    // A generated id that already names a DIFFERENT existing question is not
    // "already represented" merely by matching id/kind/itemId — the content
    // has to agree too. Both survive under distinct ids.
    const halfConvertedConflict = validateDB({
      ...v12,
      schemaVersion: 12,
      items: v12.items.map((i) => (i.id === 'i-flag-false' ? { ...i, teacherQuestion: 'a brand new question' } : i)),
      lessonAgenda: [
        ...v12.lessonAgenda,
        {
          id: 'question:i-flag-false',
          kind: 'question' as const,
          itemId: 'i-flag-false',
          instrumentId: 'setar',
          text: 'a completely different pre-existing question',
          createdAt: '2026-08-01T09:00:00.000Z',
          updatedAt: '2026-08-01T09:00:00.000Z',
        },
      ],
    });
    const conflictEntry = halfConvertedConflict.lessonAgenda.find((e) => e.id === 'question:i-flag-false');
    expect(conflictEntry?.kind === 'question' ? conflictEntry.text : undefined).toBe(
      'a completely different pre-existing question',
    );
    expect(
      halfConvertedConflict.lessonAgenda.some(
        (e) => e.kind === 'question' && e.itemId === 'i-flag-false' && e.text === 'a brand new question',
      ),
    ).toBe(true);

    // 4. LEGITIMATE unassigned and detached historical records PASS — proven
    //    against the REAL producer, not a hand-built approximation of its
    //    shape. `detachLesson` destructures `lessonId` OUT rather than
    //    setting it undefined; a JSON round-trip must still read that as
    //    genuinely absent, not as a lingering `null`/`undefined` key.
    const attached = createPreparation({ id: 'prep:real', itemId: 'i-premigrated', instrumentId: 'setar', lessonId: 'L-setar-1', now: NOW });
    const [reallyDetached] = JSON.parse(JSON.stringify(detachLesson([attached], 'L-setar-1', NOW))) as typeof v12.lessonAgenda;
    expect(reallyDetached).not.toHaveProperty('lessonId');
    expect(reallyDetached).toMatchObject({ detachedFromLessonId: 'L-setar-1' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetached] })).not.toThrow();
    // The item-side equivalent, against the REAL producer `detachItem`
    // (`deleteItem`'s own path) rather than a hand-built approximation: it
    // destructures `itemId` OUT rather than setting it undefined, so the
    // strict live-itemId check just proven above must never see one here.
    const questionOnItem = createQuestion({ id: 'q:real', text: 'Real question', itemId: 'i-premigrated', instrumentId: 'setar', now: NOW });
    const [reallyDetachedQuestion] = JSON.parse(
      JSON.stringify(detachItem([questionOnItem], 'i-premigrated', NOW)),
    ) as typeof v12.lessonAgenda;
    expect(reallyDetachedQuestion).not.toHaveProperty('itemId');
    expect(reallyDetachedQuestion).toMatchObject({ detachedFromItemId: 'i-premigrated' });
    expect(() => validateDB({ ...v12, lessonAgenda: [reallyDetachedQuestion] })).not.toThrow();
    expect(() =>
      validateDB({
        ...v12,
        lessonAgenda: [
          { ...sample, lessonId: undefined, detachedFromLessonId: 'L-setar-past' },
          {
            kind: 'question',
            id: 'q-detached',
            instrumentId: 'setar',
            text: 'Asked about a piece I have since deleted',
            askedAt: '2026-02-01T00:00:00.000Z',
            answer: 'Yes.',
            detachedFromItemId: 'long-gone',
            createdAt: '2026-02-01T00:00:00.000Z',
            updatedAt: '2026-02-01T00:00:00.000Z',
          },
        ],
      }),
    ).not.toThrow();

    // 4c. ATTACHMENT IDENTITY, at EVERY door rather than the full-backup one.
    //     A sealed review found the duplicate-metadata check living inside
    //     `decodeBackupFiles`, which returns on its FIRST line for a file with
    //     no `files` key — so a state-only import (and a sync pull, an archive
    //     restore, and hydration) installed two attachments claiming one id
    //     unchecked. That is a one-way trap, not an untidiness: the export
    //     emits one file per describing row, so the device's very next full
    //     backup carries two files sharing an id and is refused by its own
    //     importer. The check is in `validateDB` now, so it is the same
    //     refusal at every door — including a bare database, which is the
    //     shape a state-only file and a sync snapshot both arrive in.
    const withAttachment = validateDB(JSON.parse(V12_TEXT));
    expect(withAttachment.attachments.length).toBeGreaterThan(0);
    const duplicated = {
      ...withAttachment,
      attachments: [...withAttachment.attachments, { ...withAttachment.attachments[0] }],
    };
    expect(() => validateDB(duplicated)).toThrow(/Two attachments share the id "att-1"/);
    // Two rows sharing an id but disagreeing about their owner is the same
    // refusal — the id IS the identity, and the blob is keyed by it.
    expect(() =>
      validateDB({
        ...withAttachment,
        attachments: [
          ...withAttachment.attachments,
          { ...withAttachment.attachments[0], ownerId: 'someone-else' },
        ],
      }),
    ).toThrow(/Two attachments share the id/);
    for (const { label, payload } of [
      { label: 'wrapped export', payload: { app: 'practice-compass', schemaVersion: SCHEMA_VERSION, data: duplicated } },
      { label: 'bare database (state-only import, sync pull, archive restore)', payload: duplicated },
    ]) {
      expect(() => validateDB(payload), label).toThrow(/Two attachments share the id/);
    }
    // Distinct ids are untouched, and so is a database with no attachments at
    // all — this refuses a collision, it does not police attachments.
    expect(() =>
      validateDB({
        ...withAttachment,
        attachments: [...withAttachment.attachments, { ...withAttachment.attachments[0], id: 'att-2' }],
      }),
    ).not.toThrow();
    expect(() => validateDB({ ...withAttachment, attachments: [] })).not.toThrow();

    // 5. A NEWER schema is still refused outright rather than silently
    //    downgraded and stripped of whatever it added.
    expect(() => validateDB({ ...v12, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);

    // 6. No fake repair of old data: the v11 fixture's dangling instrument
    //    reference survives exactly as it arrived.
    const migrated = validateDB(JSON.parse(V11_TEXT));
    expect(migrated.items.find((i) => i.id === 'i-dangling')?.instrumentId).toBe('gone');
    expect(migrated.lessonAgenda.find((e) => e.itemId === 'i-dangling')?.instrumentId).toBe('gone');

    // 7. THE ACTUAL PERSISTED-HYDRATION BOUNDARY — a sealed review found that
    //    every check above, however thorough, only ever exercised
    //    `validateDB`'s own import-path callers. Zustand's persist
    //    `migrate`/`merge` called `migrateToCurrent` directly, bypassing both
    //    the newer-schema guard and every §C7 semantic check above: a
    //    version=13 database hydrated successfully relabelled as
    //    schemaVersion=12 (migrateToCurrent's own final line stamps the
    //    CURRENT version unconditionally), and an already-current v12
    //    database carrying a dangling live itemId or an impossible askedAt
    //    entered live state unchanged. Drive the REAL store through its own
    //    `persist.rehydrate()` — not a hand call to `migrate`/`merge` in
    //    isolation — so the actual wiring, including zustand's own
    //    no-write-back-on-a-thrown-migrate behaviour, is what's under test.
    const wrap = (db: unknown, version: number) => JSON.stringify({ state: { db }, version });

    // 7a. Valid CURRENT v12 data hydrates normally.
    fakeStorage.set(wrap(v12, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    expect(getLastHydrationError()).toBeNull();
    expect(useStore.getState().hydrated).toBe(true);
    expect(useStore.getState().db.lessonAgenda.length).toBe(v12.lessonAgenda.length);
    // The REACTIVE signal App.tsx actually renders from agrees — a clean
    // hydration carries no refusal forward from any earlier attempt.
    expect(useHydrationStatus.getState()).toEqual({ refused: false, message: null, tooNew: false });

    // 7b. Valid OLDER data migrates then hydrates — and, unlike the refusals
    //     below, genuinely gets written back (a real upgrade worth saving).
    const setItemsBeforeUpgrade = fakeStorage.setItemCalls();
    fakeStorage.set(wrap((JSON.parse(V11_TEXT) as { data: unknown }).data, 11));
    await useStore.persist.rehydrate();
    expect(getLastHydrationError()).toBeNull();
    expect(useStore.getState().db.schemaVersion).toBe(SCHEMA_VERSION);
    expect(useStore.getState().db.items.find((i) => i.id === 'i-dangling')?.instrumentId).toBe('gone');
    expect(fakeStorage.setItemCalls()).toBeGreaterThan(setItemsBeforeUpgrade);

    // 7c. INVALID current-v12 data — the exact sealed counterexample, a
    //     dangling live itemId — is refused. The previously live database is
    //     preserved BY REFERENCE (nothing was ever `set()`), and nothing is
    //     written back over whatever is actually on disk: refusing must not
    //     itself become a write, or a refusal of genuinely newer data (7d)
    //     would silently destroy it the moment this build merely NOTICES the
    //     problem.
    const sentinel = useStore.getState().db;
    const setItemsBeforeRefusal = fakeStorage.setItemCalls();
    const badCurrent: PracticeDB = {
      ...v12,
      lessonAgenda: [
        ...v12.lessonAgenda,
        {
          kind: 'question',
          id: 'q-hydration-refused',
          instrumentId: 'setar',
          text: 'x',
          itemId: 'nonexistent',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    fakeStorage.set(wrap(badCurrent, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinel);
    expect(getLastHydrationError()).toMatch(/practice item that no longer exists/);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeRefusal);
    // The reactive signal flips too, and is distinguishable from "too new":
    // this is invalid/corrupt CURRENT-version data, not an app-update case.
    expect(useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: false });
    expect(useHydrationStatus.getState().message).toMatch(/practice item that no longer exists/);

    // 7c-ii. THE SAME hydration door refuses duplicate attachment metadata.
    //     This is the door the state-only counterexample actually ends at: an
    //     import that installed the duplicates would hand them straight back
    //     to `merge` on the next load. The previously live database is
    //     preserved by reference and nothing is written back, exactly as 7c.
    const sentinelDup = useStore.getState().db;
    const setItemsBeforeDup = fakeStorage.setItemCalls();
    fakeStorage.set(
      wrap({ ...v12, attachments: [...v12.attachments, { ...v12.attachments[0] }] }, SCHEMA_VERSION),
    );
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinelDup);
    expect(getLastHydrationError()).toMatch(/Two attachments share the id/);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeDup);
    expect(useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: false });

    // 7d. A NEWER-than-supported schema is refused — never passed through
    //     migrateToCurrent and relabelled as the current version, and never
    //     written back over the (unreadable but genuinely newer) original.
    const sentinelNewer = useStore.getState().db;
    const setItemsBeforeNewer = fakeStorage.setItemCalls();
    fakeStorage.set(wrap({ ...v12, schemaVersion: SCHEMA_VERSION + 1 }, SCHEMA_VERSION + 1));
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinelNewer);
    expect(getLastHydrationError()).toMatch(/newer version/i);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeNewer);
    // The reactive signal distinguishes THIS refusal from 7c's: `tooNew` is
    // true here, so the UI can say "update the app" instead of "this data
    // looks broken" — the two are not the same recovery instruction.
    expect(useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: true });
    expect(useHydrationStatus.getState().message).toMatch(/newer version/i);

    // 7e. REPEATED hydration stays safe: refusing the identical newer-schema
    //     data twice in a row is idempotent (same refusal, live state never
    //     mutated, and still no write-back the second time either)...
    await useStore.persist.rehydrate();
    expect(useStore.getState().db).toBe(sentinelNewer);
    expect(getLastHydrationError()).toMatch(/newer version/i);
    expect(fakeStorage.setItemCalls()).toBe(setItemsBeforeNewer);
    // ...and re-hydrating the same valid data twice in a row produces
    // byte-identical live state both times.
    fakeStorage.set(wrap(v12, SCHEMA_VERSION));
    await useStore.persist.rehydrate();
    const firstHydrate = JSON.stringify(useStore.getState().db);
    await useStore.persist.rehydrate();
    expect(JSON.stringify(useStore.getState().db)).toBe(firstHydrate);
    expect(getLastHydrationError()).toBeNull();

    // 7f/7g. THE GENUINE COLD START — a sealed review found every case above
    //     (7a-7e) runs on a store that had already hydrated successfully at
    //     least once (module import itself reads empty storage and hydrates
    //     fine before this test body even starts), so none of them prove
    //     what a device experiences the very FIRST time it ever hydrates
    //     with already-bad persisted bytes: `hydrated` never turns true,
    //     zustand's own `onFinishHydration` is wired to the success path
    //     only, and — before this fix — nothing reactive told the UI why,
    //     so `App.tsx` stayed on "Loading…" forever. `vi.resetModules()`
    //     plus a dynamic re-import gets a genuinely fresh store instance —
    //     its own never-hydrated `hydrated`/`getLastHydrationError`/
    //     `useHydrationStatus` — while `fakeStorage` (bound outside the
    //     module graph via `vi.hoisted`) still feeds it through the same
    //     mocked `idbStorage`, so this is still the REAL Zustand persistence
    //     path, not a hand call to `migrate`/`merge`.
    const coldStart = async (payload: unknown, version: number) => {
      fakeStorage.set(wrap(payload, version));
      const writesBefore = fakeStorage.setItemCalls();
      vi.resetModules();
      const fresh = await import('../store/useStore');
      await fresh.useStore.persist.rehydrate();
      expect(fresh.useStore.getState().hydrated).toBe(false);
      expect(fakeStorage.setItemCalls()).toBe(writesBefore);
      return fresh;
    };

    // 7f. Invalid CURRENT-version data, never successfully hydrated before:
    //     refused, and the REACTIVE state (not just the internal
    //     `lastHydrationError` variable) reports it as recoverable data
    //     corruption rather than a schema mismatch.
    const coldInvalid = await coldStart(badCurrent, SCHEMA_VERSION);
    expect(coldInvalid.getLastHydrationError()).toMatch(/practice item that no longer exists/);
    expect(coldInvalid.useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: false });
    expect(coldInvalid.useHydrationStatus.getState().message).toMatch(/practice item that no longer exists/);

    // 7g. A newer-than-supported schema, never successfully hydrated before:
    //     refused, and flagged distinctly as "too new" — an app update, not
    //     a data restore, is the fix this device actually needs.
    const coldNewer = await coldStart({ ...v12, schemaVersion: SCHEMA_VERSION + 1 }, SCHEMA_VERSION + 1);
    expect(coldNewer.getLastHydrationError()).toMatch(/newer version/i);
    expect(coldNewer.useHydrationStatus.getState()).toMatchObject({ refused: true, tooNew: true });
    expect(coldNewer.useHydrationStatus.getState().message).toMatch(/newer version/i);

    // 8. THE RECOVERY ROUTE ITSELF, RENDERED — a sealed review found that
    //    7f/7g above, however real the store wiring, never render `App`:
    //    the corrupt-data refusal it produces tells the owner to "use Import
    //    in Settings", but Settings — and every other route — mounts only
    //    once `hydrated` is true, which this exact refusal prevents. Drive
    //    the REAL App component in a real browser (the SAME Playwright
    //    harness the two journey tests use, never a hand call to
    //    `recoverFromRefusedHydration`), so this proves the recovery action
    //    is actually reachable and actually works, not merely that the store
    //    computes the right flags.
    const app = await openPracticeApp({ now: NOW });
    try {
      // 8a. Seed the SAME invalid-current-version bytes 7f used, straight
      //     into the real app's own IndexedDB, then reload — the very first
      //     hydration attempt this real page ever makes is a refusal.
      await writePersistedState(app, { db: badCurrent }, SCHEMA_VERSION);
      await app.page.reload();
      await app.page.getByText(/data couldn.t be loaded safely/).waitFor({ timeout: 20_000 });
      await app.page.getByText(/looks invalid or corrupted/).waitFor();
      const restoreInput = app.page.getByLabel('Restore backup file');
      await app.page.getByRole('button', { name: /Restore from backup/ }).waitFor();
      // Rendering the refusal screen — even once its recovery control has
      // mounted and become interactive — writes NOTHING on its own: the
      // refused bytes are still exactly what was seeded above.
      const beforeRecovery = await readPersistedState(app);
      expect(beforeRecovery).toEqual({ state: { db: badCurrent }, version: SCHEMA_VERSION });

      // 8b. An INVALID recovery file is rejected through REAL §C7 validation
      //     (the same dangling-itemId rule 7c/7f already exercise headlessly)
      //     — and the refused bytes already on this device are NOT silently
      //     overwritten by the failed attempt.
      await restoreInput.setInputFiles({
        name: 'bad.json',
        mimeType: 'application/json',
        buffer: Buffer.from(JSON.stringify(badCurrent), 'utf8'),
      });
      await app.page.getByText(/Import failed:/).waitFor({ timeout: 20_000 });
      await app.page.getByText(/data couldn.t be loaded safely/).waitFor();
      expect(await readPersistedState(app)).toEqual(beforeRecovery);

      // 8c. A VALID backup genuinely recovers the app — reachable BEFORE
      //     hydration ever succeeded, installed through the real store path
      //     (`recoverFromRefusedHydration` -> `importFullBackup` ->
      //     `importDB`), the identical wiring every other inbound door uses.
      // A real Settings export is a FULL backup — the data plus the bytes of
      // every file it describes — so the recovery file here carries `att-1`'s
      // bytes with it. A data-only file naming an attachment this device does
      // not hold is refused at this door like any other (see `backup.ts`): it
      // would install metadata for bytes that are nowhere, and the device's own
      // next export would then be a backup it could not import back.
      await restoreInput.setInputFiles({
        name: 'good.json',
        mimeType: 'application/json',
        buffer: Buffer.from(
          JSON.stringify({
            ...(JSON.parse(serializeExport(v12, NOW)) as object),
            files: (JSON.parse(V11_TEXT) as { files: unknown[] }).files,
          }),
          'utf8',
        ),
      });
      await app.page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 20_000 });

      // 8d. The recovery is DURABLE, not a live-state patch that a reload
      //     would lose: reloading hydrates cleanly from what was actually
      //     written, carrying the recovered agenda with it.
      await reload(app);
      const after = await readPersistedState(app);
      const afterDb = (after.state as { db: PracticeDB }).db;
      expect(afterDb.lessonAgenda.length).toBe(v12.lessonAgenda.length);

      // 8e. A NEWER-than-supported schema offers NO recovery control at
      //     all — there is no safe import/downgrade for it, only "update the
      //     app", so nothing here could let the owner mistake one for the
      //     other.
      await writePersistedState(app, { db: { ...v12, schemaVersion: SCHEMA_VERSION + 1 } }, SCHEMA_VERSION + 1);
      const beforeNewerRefusal = await readPersistedState(app);
      await app.page.reload();
      await app.page.getByText(/This device holds data saved by a newer version/).waitFor({ timeout: 20_000 });
      expect(await app.page.getByRole('button', { name: /Restore from backup/ }).count()).toBe(0);
      expect(await app.page.getByLabel('Restore backup file').count()).toBe(0);
      expect(await readPersistedState(app)).toEqual(beforeNewerRefusal);
    } finally {
      await app.close();
    }
  });
});

// ---------------------------------------------------------------------------
// ac-16 — C8: the rollout / rollback route
// ---------------------------------------------------------------------------

describe('the documented rollback route', () => {
  it('rollback fixtures preserve exports without pretending v12 can be downgraded', () => {
    // The owner's PRE-UPGRADE export restores into this build, upgrading
    // deterministically — the same result twice, whatever day it is run.
    const first = validateDB(JSON.parse(V11_TEXT));
    const second = validateDB(JSON.parse(V11_TEXT));
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.schemaVersion).toBe(SCHEMA_VERSION);

    // Attachment METADATA and the fixture's file bytes both survive the trip:
    // the metadata through the database, the bytes as the backup's own files
    // array, which `importFullBackup` writes before the data is installed.
    expect(first.attachments).toHaveLength(1);
    expect(first.attachments[0]).toMatchObject({ id: 'att-1', ownerType: 'item', ownerId: 'i-scheduled' });
    const files = (JSON.parse(V11_TEXT) as { files: { id: string; data: string }[] }).files;
    expect(files.map((f) => f.id)).toEqual(['att-1']);
    expect(atob(files[0].data)).toBe('score bytes');

    // A POST-UPGRADE export keeps everything v12 added — answers, manual
    // dates, provenance and SR state.
    const answered: PracticeDB = {
      ...first,
      lessonAgenda: first.lessonAgenda.map((e) =>
        e.kind === 'question' && e.itemId === 'i-q-only'
          ? { ...e, lessonId: 'L-setar-1', askedAt: '2027-03-05T10:00:00.000Z', answer: 'Tone first.' }
          : e,
      ),
    };
    const restored = validateDB(JSON.parse(serializeExport(answered)));
    const q = restored.lessonAgenda.find((e) => e.kind === 'question' && e.itemId === 'i-q-only')!;
    expect(q).toMatchObject({ lessonId: 'L-setar-1', answer: 'Tone first.' });
    expect(q.kind === 'question' && q.askedAt).toBe('2027-03-05T10:00:00.000Z');
    const manual = restored.items.find((i) => i.id === 'i-scheduled')!;
    expect(manual.nextReviewDate).toBe('2027-01-15');
    expect(manual.srEase).toBe(2.6);

    // THERE IS NO DOWNGRADE. An older build refuses a v12 file outright, and
    // this build must not pretend otherwise by rewriting the number or
    // dropping the new fields: the exported file says 12 and carries them.
    const exported = JSON.parse(serializeExport(answered)) as { schemaVersion: number; data: PracticeDB };
    expect(exported.schemaVersion).toBe(SCHEMA_VERSION);
    expect(exported.data.lessonAgenda.length).toBeGreaterThan(0);
    expect(() => validateDB({ ...first, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);
    // An old v11 build can only restore an explicitly chosen PRE-upgrade
    // backup — which still exists, unchanged, and still says 11.
    expect((JSON.parse(V11_TEXT) as { schemaVersion: number }).schemaVersion).toBe(11);
  });
});
```

### src/domain/io.ts

```
import type { ExportFile, PracticeDB } from './types';
import { SCHEMA_VERSION } from './types';
import { nowISO } from './util';
import { migrateToCurrent, OLDEST_SCHEMA_VERSION } from './migrations';
import { validateLessonAgenda } from './lessonAgenda';
import { validateSchedulingFields } from './scheduling';
import { validatePracticeText } from './practiceInformation';

// ---------------------------------------------------------------------------
// JSON export / import. Export wraps the full DB with app + schema metadata.
// Import validates shape "enough to avoid crashing" and accepts either a
// wrapped ExportFile or a bare DB object.
// ---------------------------------------------------------------------------

export function buildExport(db: PracticeDB, now: Date = new Date()): ExportFile {
  return {
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: nowISO(now),
    data: db,
  };
}

export function serializeExport(db: PracticeDB, now: Date = new Date()): string {
  return JSON.stringify(buildExport(db, now), null, 2);
}

const ARRAY_KEYS = [
  'instruments',
  'materials',
  'items',
  'blocks',
  'reviews',
  'pathways',
  'pathwayStages',
  'pathwayRoutines',
  'attachments',
  'lessons',
  'lessonAgenda',
] as const;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Thrown only for a schema newer than this build supports — never for
 * invalid/corrupt current-version data. Lets a caller (the hydration
 * boundary, in particular) tell "update the app" apart from "this data is
 * broken" without parsing the message text.
 */
export class SchemaTooNewError extends Error {}

/**
 * Validate and normalise an unknown object into a PracticeDB. Throws with a
 * human-readable message when the shape is unusable.
 *
 * Migration runs BEFORE normalisation, on the source shape: a fixed-allowlist
 * rebuild would drop legacy fields (`pathwaySteps`, an attachment's `itemId`)
 * before the migration chain ever got to read them. A missing schemaVersion
 * is assumed to be the oldest this app ever shipped, so the whole chain runs;
 * a schemaVersion newer than this build supports is rejected rather than
 * silently downgraded and stripped of whatever fields it added.
 */
export function validateDB(input: unknown): PracticeDB {
  if (!isRecord(input)) throw new Error('File is not a valid object.');

  // Accept a wrapped ExportFile or a bare DB.
  const raw: Record<string, unknown> = isRecord(input.data) ? (input.data as Record<string, unknown>) : input;

  for (const key of ARRAY_KEYS) {
    if (raw[key] !== undefined && !Array.isArray(raw[key])) {
      throw new Error(`Field "${key}" must be a list.`);
    }
  }

  const fromVersion = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : OLDEST_SCHEMA_VERSION;
  if (fromVersion > SCHEMA_VERSION) {
    throw new SchemaTooNewError(
      `This file is from a newer version of Practice Compass (schema ${fromVersion}) than this device supports (schema ${SCHEMA_VERSION}). Update the app before importing it.`,
    );
  }

  const migrated = migrateToCurrent(raw as unknown as PracticeDB, fromVersion);

  const db: PracticeDB = {
    schemaVersion: migrated.schemaVersion,
    instruments: migrated.instruments ?? [],
    materials: migrated.materials ?? [],
    items: migrated.items ?? [],
    blocks: migrated.blocks ?? [],
    reviews: migrated.reviews ?? [],
    pathways: migrated.pathways ?? [],
    pathwayStages: migrated.pathwayStages ?? [],
    pathwayRoutines: migrated.pathwayRoutines ?? [],
    attachments: migrated.attachments ?? [],
    lessons: migrated.lessons ?? [],
    lessonAgenda: migrated.lessonAgenda ?? [],
    // Optional scheduling knobs — a top-level object, not an array. Carry it
    // through so a user's adjusted params survive export/import round-trips.
    ...(isRecord(migrated.settings) ? { settings: migrated.settings as unknown as PracticeDB['settings'] } : {}),
  };

  // Minimal per-entity sanity: every record needs an id.
  for (const key of ARRAY_KEYS) {
    const list = db[key] as { id?: unknown }[];
    if (list.some((row) => !isRecord(row) || typeof row.id !== 'string')) {
      throw new Error(`Some entries in "${key}" are missing an id.`);
    }
  }

  // ATTACHMENT IDENTITY, at EVERY door rather than at one of them.
  //
  // `decodeBackupFiles` already refused two metadata rows sharing an id — but
  // only ever reached that check for a FULL backup, because a `files` key that
  // is absent returns from its first line. So the state-only door, a sync pull,
  // an archive restore and both halves of hydration all installed duplicate
  // attachment metadata unchecked, and the trap is the same one-way shape the
  // held-bytes invariant exists to prevent: `buildFullBackupWithRev` emits one
  // file per describing row, so two rows sharing an id produce two files
  // sharing an id, and the device's own next export is a backup its own
  // importer refuses ("Two files in the backup share the id") — on this device
  // and on every device a sync publishes it to. An attachment's id is what its
  // bytes are keyed by, so two records claiming one id are two records claiming
  // the same file. Refusing here names the id and changes nothing.
  const attachmentIds = new Set<string>();
  for (const a of db.attachments) {
    if (attachmentIds.has(a.id)) throw new Error(`Two attachments share the id "${a.id}".`);
    attachmentIds.add(a.id);
  }

  // The v12 model, checked BEFORE anything installs this database (§C7). This
  // is deliberately bounded to the lesson agenda and the scheduling fields it
  // shares a schema version with — the decision loop's own inputs and
  // outcomes — and is NOT a general repair of legacy malformed records.
  // Invalid intent is REJECTED with actionable detail, never silently filtered
  // away: dropping an entry the owner wrote is the data loss this guards.
  const agendaProblem = validateLessonAgenda(db);
  if (agendaProblem) throw new Error(agendaProblem);
  const schedulingProblem = validateSchedulingFields(db);
  if (schedulingProblem) throw new Error(schedulingProblem);
  // The practice text that SURVIVES the v13 retirement — the item's notebook
  // and a block's own observation/next action/constraint. Checked AFTER the
  // migration chain has already removed the retired keys, so a malformed
  // retired field can never be mistaken for a malformed canonical one.
  const textProblem = validatePracticeText(db);
  if (textProblem) throw new Error(textProblem);

  return db;
}

export type ImportResult =
  | { ok: true; db: PracticeDB }
  | { ok: false; error: string };

export function parseImport(rawText: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  try {
    return { ok: true, db: validateDB(parsed) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unrecognised file shape.' };
  }
}
```

### src/pages/ItemDetail.tsx

```
import { useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  attachmentPolicy,
  BLOCK_MODE_LABELS,
  FOCUS_LABELS,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  RATING_LABELS,
  REVIEW_MODE_LABELS,
  isLosslesslyRemovable,
  partsOf,
  pickNextPart,
  RESULT_LABELS,
  stallHint,
  itemFiles,
  itemOwnedAttachments,
  type BlockResult,
  type GuitarFields,
  type PersianFields,
  type PracticeItem,
  pendingScheduleConflict,
  todayISODate,
  type ISODate,
  type PracticeItem as PracticeItemT,
  type Review,
} from '../domain';
import { useStore } from '../store/useStore';
import { getMaterial, instrumentName, itemBlocks, materialLabel } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { addAttachment, formatBytes, removeAttachment } from '../store/attachments';
import ItemForm from '../components/ItemForm';
import { ItemAgenda } from '../components/LessonAgenda';
import { itemToValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { GUITAR_FIELDS, PERSIAN_FIELDS } from '../components/itemFields';
import ItemMaterial from '../components/ItemMaterial';
import ItemNotes from '../components/ItemNotes';
import { Field, OptionPills, Stars, StatusBadge, Stat } from '../components/ui';
import { ArrowLeftIcon, PlayIcon, PlusIcon } from '../components/icons';
import {
  formatMinutes,
  relativeDay,
  relativeFromDateTime,
  formatDateTimeISO,
  reviewDateDraftFor,
  type ReviewDateDraft,
} from '../components/format';
import { useDecisionNow } from '../components/useDecisionNow';

const RESULT_TONE: Record<BlockResult, string> = {
  worse: 'var(--tone-alert)',
  same: 'var(--tone-warn)',
  slightly_better: 'var(--tone-progress)',
  stable_alone: 'var(--tone-good)',
  stable_in_context: 'var(--tone-good)',
  performable: 'var(--tone-good)',
  not_logged: 'var(--text-faint)',
};

const RESULT_HEIGHT: Record<BlockResult, number> = {
  worse: 8,
  same: 14,
  slightly_better: 20,
  stable_alone: 28,
  stable_in_context: 34,
  performable: 40,
  not_logged: 6,
};

export default function ItemDetail() {
  const { id } = useParams();
  const db = useStore((s) => s.db);
  const startSession = useStore((s) => s.startSession);
  const setItemStatus = useStore((s) => s.setItemStatus);
  const updateItem = useStore((s) => s.updateItem);
  const deleteItem = useStore((s) => s.deleteItem);
  const scheduleReviewAgain = useStore((s) => s.scheduleReviewAgain);
  const navigate = useNavigate();
  const location = useLocation();
  // Explicit, safe return context: back to where the item was opened from.
  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';
  const fromLabel = from === '/' ? 'Today' : from.startsWith('/lessons') ? 'Lessons' : from.startsWith('/pathway') ? 'Stage' : from.startsWith('/items/') ? 'Piece' : 'Repertoire';
  // The date controls below decide against TODAY, so this page cannot freeze
  // its clock at mount: a tab left open across local midnight would otherwise
  // offer (and write) yesterday's "today".
  const now = useDecisionNow();
  // Arriving via "add details" (QuickAdd) opens the form straight away.
  const [editing, setEditing] = useState(Boolean((location.state as { edit?: boolean } | null)?.edit));
  // A save the store REFUSED (an ambiguous pending schedule it will not guess
  // at) has to be visible where the save happened, not swallowed.
  const [saveRefusal, setSaveRefusal] = useState<string | null>(null);

  const item = db.items.find((i) => i.id === id);
  const blocks = useMemo(() => (item ? itemBlocks(db, item.id) : []), [db, item]);

  if (!item) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">This item no longer exists.</div>
      </div>
    );
  }

  const material = getMaterial(db, item.materialId);
  const stage = item.stageId ? db.pathwayStages.find((s) => s.id === item.stageId) : undefined;
  const persianEntries = PERSIAN_FIELDS.filter((f) => item.persian?.[f.key as keyof PersianFields]);
  const guitarEntries = GUITAR_FIELDS.filter((f) => item.guitar?.[f.key as keyof GuitarFields]);
  const trend = [...blocks].reverse(); // chronological

  function start() {
    if (!item) return;
    startSession(defaultStartInput(item));
    navigate('/active');
  }

  function handleEdit(values: ItemFormValues) {
    if (!item) return;
    const refusal = updateItem(item.id, valuesToCreateInput(values));
    setSaveRefusal(refusal);
    if (!refusal) setEditing(false);
  }

  if (editing) {
    return (
      <div className="stack">
        <button className="link row" style={{ background: 'none', border: 'none' }} onClick={() => setEditing(false)}>
          <ArrowLeftIcon width={16} height={16} /> Cancel edit
        </button>
        <h1 className="page-title">Edit item</h1>
        {saveRefusal && (
          <div className="card card-quiet small" role="alert" style={{ color: 'var(--tone-warn)' }}>
            <span dir="ltr">{saveRefusal}</span>
          </div>
        )}
        <ItemForm initial={itemToValues(item)} submitLabel="Save changes" onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> {fromLabel}
      </Link>

      {/* Title and the details that belong to it in ONE group, so a Farsi
          item's name and its own metadata line align to the same edge. */}
      <header className="stack-sm" dir="auto">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <h1 className="page-title">
            {item.title}
          </h1>
          <StatusBadge status={item.status} />
        </div>
        {/* ITEM_TYPE_LABELS is generated English metadata, never user text —
            it gets its own dir="ltr" isolate. The instrument name is the
            owner's own editable text (renameable in Settings, Farsi
            included), so it gets dir="auto" instead of being pinned to a
            foreign LTR base. stage.code and the material label stay bare:
            both are user-authored and can be Farsi themselves (the Setar/Tar
            seeds author stage codes in Farsi too), so they correctly share
            the group's own resolved direction rather than being pinned to a
            foreign one. */}
        <div className="row-wrap small dim">
          <span dir="auto">{instrumentName(db, item.instrumentId)}</span>
          <span className="faint">·</span>
          <span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>
          {stage && (
            <>
              <span className="faint">·</span>
              <Link to={`/pathway/${stage.pathwayId}/${stage.id}`} className="link">
                {stage.code}
              </Link>
            </>
          )}
          {material && (
            <>
              <span className="faint">·</span>
              <span>{materialLabel(material)}</span>
            </>
          )}
        </div>
        {/* Generated English metadata, never user text — each gets its own
            dir="ltr" isolate so it can't inherit the title's RTL base. */}
        <div className="row-wrap" style={{ gap: 16, marginTop: 4 }}>
          <span className="row tiny faint" style={{ gap: 6 }}>
            <Stars value={item.importance} /> {RATING_LABELS.importance.toLowerCase()}
          </span>
          <span className="tiny faint" dir="ltr">
            {RATING_LABELS.difficulty.toLowerCase()} {item.difficulty}/5
          </span>
          {item.saturationWarning && (
            <span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>
          )}
        </div>
      </header>

      <div className="row">
        <button className="btn btn-primary btn-lg grow" onClick={start}>
          <PlayIcon /> Start a block
        </button>
        <button className="btn btn-lg" onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>

      <ConnectedTo item={item} />

      {/* Commitments and questions, each naming its own class. */}
      <ItemAgenda itemId={item.id} />

      <div className="card grid-stats">
        <Stat value={item.timesPractised} label="Blocks" />
        <Stat value={formatMinutes(item.totalMinutes)} label="Total time" />
        <Stat value={relativeFromDateTime(item.lastPractisedAt, now)} label="Last practised" />
        <Stat value={item.nextReviewDate ? relativeDay(item.nextReviewDate, now) : '—'} label="Next review" />
      </div>
      <div className="tiny faint" style={{ marginTop: -6 }}>
        {(item.reviewMode ?? 'auto') === 'manual'
          ? 'Reviews: you set the dates.'
          : (item.reviewMode ?? 'auto') === 'interval'
            ? `Reviews: every ${item.reviewIntervalDays ?? 7} days.`
            : item.srReps
              ? `Spaced repetition · ${item.srReps} good review${item.srReps === 1 ? '' : 's'} · ease ${(item.srEase ?? 2.5).toFixed(1)}.`
              : 'Reviews: spaced repetition (auto).'}
      </div>

      <ScheduleAgain
        item={item}
        today={todayISODate(now)}
        conflict={pendingScheduleConflict(item, db.reviews)}
        onSchedule={(date) => scheduleReviewAgain(item.id, date)}
      />

      <ReviewOwnership item={item} now={now} />

      <section className="stack-sm">
        <div className="section-label">Status</div>
        <OptionPills
          ariaLabel="Set status"
          value={item.status}
          onChange={(s) => setItemStatus(item.id, s)}
          options={ITEM_STATUS_ORDER.map((s) => ({ value: s, label: ITEM_STATUS_LABELS[s] }))}
        />
      </section>

      <PartsSection item={item} now={now} />

      <ConnectionsSection item={item} />

      <ItemNotes itemId={item.id} />

      <MaterialSection item={item} />

      <ItemFilesCrud itemId={item.id} />

      {trend.length > 0 && (
        <section className="stack-sm">
          <div className="section-label">Result trend</div>
          <div className="card">
            <div className="row" style={{ alignItems: 'flex-end', gap: 6, height: 48 }}>
              {trend.map((b) => (
                <span
                  key={b.id}
                  title={`${formatDateTimeISO(b.startedAt)} · ${RESULT_LABELS[b.result]}`}
                  style={{
                    width: 12,
                    height: RESULT_HEIGHT[b.result],
                    borderRadius: 3,
                    background: RESULT_TONE[b.result],
                    display: 'inline-block',
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {(persianEntries.length > 0 || guitarEntries.length > 0) && (
        <section className="stack-sm">
          <div className="section-label">Details</div>
          <div className="card grid-2">
            {persianEntries.map((f) => (
              <FieldRow key={f.key} label={f.label} value={item.persian![f.key as keyof PersianFields]!} />
            ))}
            {guitarEntries.map((f) => (
              <FieldRow key={f.key} label={f.label} value={item.guitar![f.key as keyof GuitarFields]!} />
            ))}
          </div>
        </section>
      )}

      <BlockHistory blocks={blocks} />

      <button
        className="btn btn-danger btn-sm"
        style={{ width: 'fit-content' }}
        onClick={() => {
          if (confirm(`Delete "${item.title}" and its ${blocks.length} block(s)? This cannot be undone.`)) {
            deleteItem(item.id);
            navigate(from);
          }
        }}
      >
        Delete item
      </button>
    </div>
  );
}

/**
 * Études & pieces: real practice items grouped under this one. The calm answer
 * to "where do I even start" is one concrete part, picked deterministically.
 */
function PartsSection({ item, now }: { item: PracticeItem; now: Date }) {
  const db = useStore((s) => s.db);
  const addItem = useStore((s) => s.addItem);
  const startItemSession = useStore((s) => s.startItemSession);
  const navigate = useNavigate();
  const [title, setTitle] = useState('');

  const parts = useMemo(() => partsOf(item.id, db.items), [item.id, db.items]);
  const canHaveParts =
    item.itemType === 'full_piece' || item.itemType === 'exercise' || item.itemType === 'section' || parts.length > 0;
  const next = useMemo(
    () => (parts.length > 0 ? pickNextPart(item.id, db.items, db.blocks, now) : null),
    [parts.length, item.id, db.items, db.blocks, now],
  );
  const hint = useMemo(
    () => stallHint(item, db.blocks.filter((b) => b.practiceItemId === item.id)),
    [item, db.blocks],
  );

  if (!canHaveParts) return null;

  function addPart() {
    if (!title.trim()) return;
    addItem({
      instrumentId: item.instrumentId,
      title,
      parentItemId: item.id,
      itemType: 'section',
      materialId: item.materialId,
      stageId: item.stageId,
    });
    setTitle('');
  }

  return (
    <section className="stack-sm">
      <div className="section-label">Parts</div>

      {hint && <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>{hint}</div>}

      {next && (
        <div className="card card-accent row" style={{ gap: 10 }}>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny" style={{ color: 'var(--accent)' }}>
              Practise this part now · 10 min
            </div>
            <div dir="auto">
              <div className="truncate">{next.score.item.title}</div>
              {/* next.reason is always English (buildReason) — its own
                  dir="ltr" isolate keeps its bidi base fixed regardless of
                  the title's. */}
              <div className="tiny faint truncate">
                <span dir="ltr">{next.reason}</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => {
              startItemSession(next.score.item.id);
              navigate('/active');
            }}
            aria-label={`Practise ${next.score.item.title}`}
          >
            <PlayIcon />
          </button>
        </div>
      )}

      {parts.length > 0 && (
        <div className="card card-flush list">
          {parts.map((p) => (
            <Link key={p.id} to={`/items/${p.id}`} state={{ from: `/items/${item.id}` }} className="list-row card-link" dir="auto" style={{ borderRadius: 0 }}>
              <div className="grow truncate">
                {p.title}
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
        </div>
      )}

      <div className="row" style={{ gap: 8 }}>
        <input
          className="input grow"
          dir="auto"
          aria-label="New part title"
          placeholder="Break off a part… e.g. bars 9–16, the forud"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPart()}
        />
        <button className="btn" disabled={!title.trim()} onClick={addPart}>
          Add part
        </button>
      </div>
    </section>
  );
}

/**
 * Everything that already belongs to this piece, in ONE place: the class video
 * and score from the lessons it is linked to, and its own attachments,
 * composed and deduplicated by `itemFiles` — nothing new is stored to show
 * them. Files stays below for add/remove; this section is what was previously
 * unreachable (lesson references) or split across two sections (attachments).
 */
function MaterialSection({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const files = useMemo(() => itemFiles(db, item.id), [db, item.id]);
  if (files.length === 0) return null;
  return (
    <section className="stack-sm">
      <div className="section-label">Material</div>
      <ItemMaterial itemId={item.id} />
    </section>
  );
}

/**
 * Add/remove only. Material above already shows every attachment with its
 * preview and Open action from the composed `itemFiles` list — this stays a
 * plain CRUD surface rather than a second, partial presentation of the same
 * files (the shared Attachments component still owns that full presentation
 * for a lesson's own attachments, which nothing else displays).
 */
function ItemFilesCrud({ itemId }: { itemId: string }) {
  const all = useStore((s) => s.db.attachments);
  const list = useMemo(
    () => itemOwnedAttachments(all, itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [all, itemId],
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [sizeNote, setSizeNote] = useState<string | null>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        const policy = attachmentPolicy(f.size, f.type || '');
        if (policy.level === 'block') {
          setSizeNote(`“${f.name}” (${formatBytes(f.size)}) was not added: ${policy.message}`);
          continue;
        }
        await addAttachment('item', itemId, f);
        if (policy.level === 'warn') {
          setSizeNote(`“${f.name}” is ${formatBytes(f.size)}. ${policy.message}`);
        }
      }
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <section className="stack-sm">
      <div className="row between">
        <div className="section-label">Files</div>
        <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
          <PlusIcon /> {busy ? 'Adding…' : 'Add file'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="application/pdf,image/*,audio/*" multiple hidden onChange={onFiles} />
      {sizeNote && (
        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
          {sizeNote}{' '}
          <button className="link tiny" style={{ background: 'none', border: 'none' }} onClick={() => setSizeNote(null)}>
            OK
          </button>
        </div>
      )}
      {list.length > 0 && (
        <div className="card card-flush list">
          {list.map((a) => (
            <div key={a.id} className="list-row" dir="auto">
              <div className="grow truncate">{a.name}</div>
              {/* Generated English metadata, never user text — its own
                  dir="ltr" isolate keeps it from inheriting a Farsi file
                  name's RTL base. */}
              <div className="tiny faint">
                <span dir="ltr">
                  {a.kind} · {formatBytes(a.size)}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm btn-danger"
                onClick={() => {
                  if (confirm(`Remove "${a.name}"?`)) removeAttachment(a.id);
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Concise "why does this item exist" summary near the top: study source,
 * pathway stage, lessons, parent work — the same links, at a glance, without
 * hunting through sections. Editing them happens in Connections below.
 */
function ConnectedTo({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const removeCatalogItem = useStore((s) => s.removeCatalogItem);
  const navigate = useNavigate();
  const material = item.materialId ? db.materials.find((m) => m.id === item.materialId) : undefined;
  const stage = item.stageId ? db.pathwayStages.find((s) => s.id === item.stageId) : undefined;
  const pathway = stage ? db.pathways.find((p) => p.id === stage.pathwayId) : undefined;
  const lessons = db.lessons.filter((l) => (l.itemIds ?? []).includes(item.id)).sort((a, b) => b.date.localeCompare(a.date));
  const parent = item.parentItemId ? db.items.find((i) => i.id === item.parentItemId) : undefined;
  const losslessInStage =
    !!stage && isLosslesslyRemovable(item, db.blocks.filter((b) => b.practiceItemId === item.id));

  if (!material && !stage && lessons.length === 0 && !parent) return null;

  return (
    <div className="card card-quiet stack-sm" style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-3)' }}>
      <div className="section-label" style={{ marginBottom: 0 }}>
        Connected to
      </div>
      <div className="row-wrap small" style={{ gap: 14, rowGap: 6 }}>
        {parent && (
          <span className="dim">
            Part of{' '}
            <Link to={`/items/${parent.id}`} state={{ from: `/items/${item.id}` }} className="link" dir="auto">
              {parent.title}
            </Link>
          </span>
        )}
        {material && (
          <span className="dim" dir="auto">
            <span dir="ltr">Study source: </span>
            <strong style={{ color: 'var(--text)' }}>{material.title}</strong>
          </span>
        )}
        {stage && (
          <span className="dim">
            Path:{' '}
            <Link to={`/pathway/${stage.pathwayId}/${stage.id}`} className="link" dir="auto">
              {pathway ? `${pathway.name} — ` : ''}
              {stage.code}
            </Link>
          </span>
        )}
        {lessons.length > 0 && (
          <span className="dim">
            Lessons:{' '}
            {lessons.slice(0, 3).map((l, i) => (
              <span key={l.id}>
                {i > 0 && ', '}
                <Link to="/lessons" className="link">
                  {l.date}
                </Link>
              </span>
            ))}
            {lessons.length > 3 && ` +${lessons.length - 3}`}
          </span>
        )}
      </div>
      {losslessInStage && (
        <button
          className="link tiny"
          style={{ background: 'none', border: 'none', width: 'fit-content', textAlign: 'left' }}
          onClick={() => {
            // Provably lossless (no practice logged): revert to a suggestion.
            if (removeCatalogItem(item.id)) navigate(`/pathway/${stage!.pathwayId}/${stage!.id}`);
          }}
        >
          Remove from stage (no practice logged)
        </button>
      )}
    </div>
  );
}

/**
 * Who manages this item's next review — and the one explicit way to hand that
 * back to the app.
 *
 * The transfer KEEPS the pending date. The button says so, and deliberately
 * never calls the retained date a fresh calculation: `auto` means "the app has
 * authority over this date from now on", not "the app worked this date out"
 * and not "a review happened". Nothing here records practice.
 *
 * It reads the LIVE item out of the store on every render (never a value
 * captured when the panel mounted), so reopening it, switching to another item
 * or an update arriving from elsewhere can never act on a stale date.
 */
function ReviewOwnership({ item, now: polledNow }: { item: PracticeItem; now: Date }) {
  const transfer = useStore((s) => s.useAutomaticReviewDates);
  const scheduleAgain = useStore((s) => s.scheduleReviewAgain);
  // Tagged with the item it was raised for, for the same reason the date draft
  // is: this panel survives a route parameter change, and a refusal about A
  // shown under B is a statement about the wrong item's schedule.
  const [refusal, setRefusal] = useState<{ forItem: string; message: string } | null>(null);
  // `useDecisionNow` polls at most every 30 seconds, so on a screen left open
  // across local midnight it can lag the real day — and "Review today" writes
  // a DATE. Catch that at the one instant it matters, exactly as the close
  // screen's Save does: refresh what is shown and stop, so the second tap
  // writes the day it actually is rather than the day this page was opened on.
  const [nowOverride, setNowOverride] = useState<Date | null>(null);
  const now = nowOverride ?? polledNow;
  const today = todayISODate(now);
  const mode = item.reviewMode ?? 'auto';
  const engineOwnsDate = mode === 'auto' && (!item.nextReviewDate || item.nextReviewSource === 'auto');

  return (
    <div className="stack-sm">
      <div className="section-label">Review scheduling</div>
      <div className="card card-quiet stack-sm">
        <div className="small">
          <span dir="ltr">
            {mode === 'auto'
              ? item.nextReviewDate
                ? item.nextReviewSource === 'auto'
                  ? `The app manages this: next on ${item.nextReviewDate}.`
                  : `You chose ${item.nextReviewDate}; it is protected until it comes due.`
                : 'The app manages this. Nothing is scheduled.'
              : mode === 'interval'
                ? `Fixed cadence: every ${item.reviewIntervalDays ?? 7} days.`
                : 'You set each date yourself.'}
          </span>
        </div>
        {!engineOwnsDate && (
          <button
            className="btn btn-sm"
            style={{ width: 'fit-content' }}
            onClick={() => {
              const message = transfer(item.id);
              setRefusal(message ? { forItem: item.id, message } : null);
            }}
          >
            Use automatic scheduling
          </button>
        )}
        {!engineOwnsDate && (
          <p className="tiny faint">
            <span dir="ltr">
              {item.nextReviewDate
                ? `Keeps ${item.nextReviewDate} exactly as it is and lets the app manage it from there. It records no practice and calculates no new date — real practice from here decides what changes.`
                : `Hands scheduling to the app. Nothing is scheduled yet and nothing is invented; use “${item.nextReviewDate ? 'Change review date' : 'Schedule again'}” or Review today when you want a date.`}
            </span>
          </p>
        )}
        {engineOwnsDate && !item.nextReviewDate && (
          <>
            <button
              className="btn btn-sm"
              style={{ width: 'fit-content' }}
              onClick={() => {
                const trueNow = new Date();
                if (todayISODate(trueNow) !== today) {
                  setNowOverride(trueNow);
                  return;
                }
                scheduleAgain(item.id, today);
              }}
            >
              Review today ({today})
            </button>
            <p className="tiny faint">
              <span dir="ltr">
                Puts it on today&apos;s list. Administrative only: it records no practice and no result.
              </span>
            </p>
          </>
        )}
        {refusal?.forItem === item.id && (
          <div className="small" role="alert" style={{ color: 'var(--tone-warn)' }}>
            <span dir="ltr">{refusal.message}</span>
          </div>
        )}
        <p className="tiny faint">
          <span dir="ltr">Current mode: {REVIEW_MODE_LABELS[mode]}.</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Everything a recorded block actually holds — what you noticed, what you
 * decided to try next, and any constraint the block was played under, next to
 * its date, mode, focus, result and minutes.
 *
 * `nextAction` used to be written at every close and read only at the START of
 * the next block; `observation` reached the history but `constraint` never did
 * at all. Older entries sit behind one plain disclosure rather than being
 * unreachable past the tenth block.
 */
function BlockHistory({ blocks }: { blocks: PracticeItemBlocks }) {
  const [showAll, setShowAll] = useState(false);
  const RECENT = 10;
  const shown = showAll ? blocks : blocks.slice(0, RECENT);

  return (
    <section className="stack-sm">
      <div className="section-label">Practice history</div>
      {blocks.length === 0 ? (
        <div className="card card-quiet small dim">
          <span dir="ltr">No blocks yet.</span>
        </div>
      ) : (
        <>
          <div className="card card-flush list">
            {shown.map((b) => (
              <div key={b.id} className="list-row" style={{ alignItems: 'flex-start' }}>
                <div className="grow" style={{ minWidth: 0 }}>
                  {/* Mode/focus/date/minutes are generated English metadata —
                      one dir="ltr" isolate each so a Farsi observation below
                      cannot drag them around. */}
                  <div className="small">
                    <span dir="ltr">
                      {BLOCK_MODE_LABELS[b.mode]} · {FOCUS_LABELS[b.focus]}
                    </span>
                  </div>
                  {b.observation && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Noticed: </span>
                      <span dir="auto">{b.observation}</span>
                    </div>
                  )}
                  {b.nextAction && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Decided to try next: </span>
                      <span dir="auto">{b.nextAction}</span>
                    </div>
                  )}
                  {b.constraint && (
                    <div className="tiny faint" style={{ whiteSpace: 'pre-wrap' }}>
                      <span dir="ltr">Constraint: </span>
                      <span dir="auto">{b.constraint}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <div className="tiny" style={{ color: RESULT_TONE[b.result] }}>
                    <span dir="ltr">{RESULT_LABELS[b.result]}</span>
                  </div>
                  <div className="tiny faint">
                    <span dir="ltr">
                      {formatDateTimeISO(b.startedAt)} · {b.durationMinutes}m
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {blocks.length > RECENT && (
            <button
              className="btn btn-sm"
              style={{ width: 'fit-content' }}
              aria-expanded={showAll}
              onClick={() => setShowAll((o) => !o)}
            >
              {showAll ? 'Show recent only' : `Show all ${blocks.length} blocks`}
            </button>
          )}
        </>
      )}
    </section>
  );
}

type PracticeItemBlocks = ReturnType<typeof itemBlocks>;

/** Where this item lives: its pathway stage and the lessons it appeared in. */
function ConnectionsSection({ item }: { item: PracticeItem }) {
  const db = useStore((s) => s.db);
  const placeItemInStage = useStore((s) => s.placeItemInStage);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const unlinkItemFromLesson = useStore((s) => s.unlinkItemFromLesson);

  const stages = useMemo(() => {
    const pathways = db.pathways.filter((p) => !p.instrumentId || p.instrumentId === item.instrumentId);
    return pathways.flatMap((p) =>
      db.pathwayStages
        .filter((s) => s.pathwayId === p.id)
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ stage: s, pathway: p })),
    );
  }, [db.pathways, db.pathwayStages, item.instrumentId]);

  const linkedLessons = useMemo(
    () => db.lessons.filter((l) => (l.itemIds ?? []).includes(item.id)).sort((a, b) => b.date.localeCompare(a.date)),
    [db.lessons, item.id],
  );
  const linkableLessons = useMemo(
    () =>
      db.lessons
        .filter((l) => l.instrumentId === item.instrumentId && !(l.itemIds ?? []).includes(item.id))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [db.lessons, item.instrumentId, item.id],
  );

  return (
    <section className="stack-sm">
      <div className="section-label">Connections</div>
      <div className="card stack-sm">
        <div className="field">
          <span className="field-label">Pathway stage</span>
          <select
            className="select"
            aria-label="Pathway stage this item belongs to"
            value={item.stageId ?? ''}
            onChange={(e) => placeItemInStage(item.id, e.target.value || undefined)}
          >
            <option value="">Not in a pathway</option>
            {stages.map(({ stage, pathway }) => (
              <option key={stage.id} value={stage.id}>
                {pathway.name} — {stage.code}
                {stage.title !== stage.code ? ` · ${stage.title}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field-label">Lessons this appeared in</span>
          {linkedLessons.length === 0 && <span className="tiny faint">None linked yet.</span>}
          {linkedLessons.map((l) => (
            <div key={l.id} className="row between small">
              <Link to="/lessons" className="link">
                Class on {l.date}
              </Link>
              <button
                className="btn btn-ghost btn-sm"
                title="Unlink (keeps both)"
                onClick={() => unlinkItemFromLesson(l.id, item.id)}
              >
                Unlink
              </button>
            </div>
          ))}
          {linkableLessons.length > 0 && (
            <select
              className="select"
              aria-label="Link this item to a lesson"
              value=""
              onChange={(e) => e.target.value && linkItemToLesson(e.target.value, item.id)}
            >
              <option value="">Link to a class…</option>
              {linkableLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.date}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </section>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <span className="tiny faint">{label}</span>
      <span className="small">{value}</span>
    </div>
  );
}

/**
 * Re-arm the pending review from the item itself. Deliberately administrative:
 * it writes ONE date onto the item and its review row (creating that row when
 * none is open — the case the old date helper could not reach, which left a
 * declined review unreachable from here) and does nothing else. No block, no
 * result, no statistics, no spacing progress.
 *
 * A date chosen here is the OWNER's, so the engine protects it until it comes
 * due rather than quietly moving it on the next successful session.
 */
function ScheduleAgain({
  item,
  today,
  conflict,
  onSchedule,
}: {
  item: PracticeItemT;
  /**
   * What a box would be OFFERED for an item with no date — the same day the
   * rest of this screen is rendered against. Only consulted when the item's
   * own date moved to absent beneath an open box; the seed below takes the
   * true instant instead, because opening the panel is an action, not a paint.
   */
  today: ISODate;
  conflict: { rows: Review[]; message: string } | null;
  onSchedule: (date: ISODate) => void;
}) {
  // The draft carries the item it was opened for and that item's own date at
  // the time, and `reviewDateDraftFor` decides on EVERY render what it still
  // means. Deriving it here rather than resetting it from an effect is what
  // makes a stale date unrepresentable: the panel below only ever renders and
  // saves the reconciled value, so there is no paint in which the box shows
  // A's date while the Save button points at B.
  const [draft, setDraft] = useState<ReviewDateDraft | null>(null);
  const open = reviewDateDraftFor(draft, item, today);

  return (
    <div className="stack-sm">
      {conflict && (
        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
          <span dir="ltr">{conflict.message}</span>
        </div>
      )}
      {open ? (
        <Field label="Next review">
          <input
            className="input"
            type="date"
            aria-label="Next review date"
            value={open.text}
            onChange={(e) => setDraft({ ...open, text: e.target.value })}
            style={{ maxWidth: 200 }}
          />
          <div className="row" style={{ gap: 6 }}>
            <button
              className="btn btn-sm btn-primary"
              disabled={!open.text}
              onClick={() => {
                // `open` is the reconciled draft for the item rendered in this
                // very pass, and `onSchedule` closes over that same item — so
                // the date saved is always the one this panel is showing.
                onSchedule(open.text);
                setDraft(null);
              }}
            >
              Save date
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
          <p className="tiny faint">
            <span dir="ltr">Setting a date records no practice and changes no spaced-repetition state.</span>
          </p>
        </Field>
      ) : (
        <button
          className="btn btn-sm"
          style={{ width: 'fit-content' }}
          onClick={() => {
            // Seeded when it OPENS, from the live item and the real day —
            // never once at mount, which would offer a date that has since
            // been changed elsewhere or a "today" that has since rolled over.
            const offered = item.nextReviewDate ?? todayISODate(new Date());
            setDraft({
              forItem: item.id,
              // The item's OWN date — empty when it has none, so "no date" and
              // "a date that happens to be today" stay distinguishable.
              seeded: item.nextReviewDate ?? '',
              offered,
              text: offered,
            });
          }}
        >
          {item.nextReviewDate ? 'Change review date' : 'Schedule again'}
        </button>
      )}
    </div>
  );
}
```

### src/store/backup.ts

```
import { decideReplacement, nowISO, parseImport, SCHEMA_VERSION } from '../domain';
import { allBlobs, heldBlobIds, replaceAllBlobs, type AttachmentBlob } from './idb';
import { useHydrationStatus, useStore } from './useStore';

// ---------------------------------------------------------------------------
// Full backup = the JSON data PLUS the attachment file bytes (base64), so a
// single file is a complete, portable copy of everything. Save it to your NAS
// / iCloud; import restores data and files together.
// ---------------------------------------------------------------------------

async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBlob(b64: string, mime: string): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

interface BackupFile {
  id: string;
  ownerId: string;
  /** Legacy (schema ≤ 5) backups used itemId. */
  itemId?: string;
  mime: string;
  name: string;
  data: string; // base64
}

/** Metadata describing where/when a backup was made (for safe handoff). */
export interface BackupMeta {
  deviceName?: string;
  /** Most recent updatedAt across the data — "how new is this backup". */
  lastModified?: string;
}

const DEVICE_NAME_KEY = 'pc-device-name';

/** Per-device label; deliberately in localStorage, NOT in the backup data. */
export function getDeviceName(): string {
  try {
    return localStorage.getItem(DEVICE_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setDeviceName(name: string): void {
  try {
    localStorage.setItem(DEVICE_NAME_KEY, name.trim());
  } catch {
    /* ignore */
  }
}

const NAS_BASE_URL_KEY = 'pc-nas-base-url';

/**
 * Base URL for resolving relative class-recording paths (e.g. the NAS Tailscale
 * HTTPS root that serves the video folders). Per-device in localStorage — it is
 * environment config, never synced or written into backups, and never a place
 * for a password.
 */
export function getNasBaseUrl(): string {
  try {
    return localStorage.getItem(NAS_BASE_URL_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setNasBaseUrl(url: string): void {
  try {
    localStorage.setItem(NAS_BASE_URL_KEY, url.trim());
  } catch {
    /* ignore */
  }
}

/** Most recent updatedAt/createdAt across everything — the data's "age". */
export function lastModifiedOf(db: ReturnType<typeof useStore.getState>['db']): string {
  let max = '';
  const scan = (rows: { updatedAt?: string; createdAt?: string; startedAt?: string }[]) => {
    for (const r of rows) {
      const t = r.updatedAt ?? r.startedAt ?? r.createdAt ?? '';
      if (t > max) max = t;
    }
  };
  scan(db.items);
  scan(db.blocks);
  scan(db.lessons);
  scan(db.materials);
  scan(db.pathwayStages);
  scan(db.attachments);
  return max;
}

/**
 * A backup TOGETHER WITH the local revision it was taken at, captured in ONE
 * statement before any await. `allBlobs()` below yields, and a block finished
 * during that yield bumps `rev` without entering this snapshot — pairing an
 * old copy of the data with a newer revision number. That pair is exactly what
 * the replacement guard compares, so the mismatch would make `decideReplacement`
 * (which is itself correct) answer "nothing was written since" about a database
 * that had been written to, and install the incoming copy over recorded
 * practice. The pure decision is already tested; the WIRING is protected
 * structurally, the same way `installDatabase` protects its own — the revision
 * cannot be read from anywhere but the statement that reads the database.
 */
export async function buildFullBackupWithRev(now: Date = new Date()): Promise<{ text: string; rev: number }> {
  const { db, rev } = useStore.getState();
  const blobs = await allBlobs();
  // THE EXPORT IS DERIVED FROM THE CANONICAL METADATA, NOT FROM WHATEVER BYTES
  // THIS DEVICE HAPPENS TO HOLD — so a backup this app writes is always one its
  // own importer accepts.
  //
  // `decodeBackupFiles` refuses bytes that the accompanying `data` describes
  // nowhere, and refuses an entry whose owner disagrees with its record. Both
  // are exactly what a blobs-first export can emit, because a blob can outlive
  // the metadata that named it: a state-only import must PRESERVE local bytes
  // (that is its contract) while replacing the database that described them,
  // and `deleteItem`/`deleteLesson`/`resetDemo` remove metadata synchronously
  // while their `void deleteBlob(...)` cleanup can fail on its own. Exporting
  // those leftovers made the app produce a file it then refused — and publish a
  // snapshot every other device refused too, permanently, which is the same
  // one-way trap the state-only guard below exists to prevent from the other
  // side. Unreferenced bytes are simply not part of the database this backup
  // is OF; they are left on the device untouched, never deleted to match.
  //
  // The OTHER direction — metadata this device holds no bytes for — is not
  // fixable here and is not left open either: dropping the metadata would be
  // silent loss of the owner's own record, and refusing to export would leave a
  // device unable to back up at all. It is prevented at the two doors that
  // could ever install it (`decodeBackupFiles` refuses a full backup missing
  // bytes it describes; the state-only check below refuses metadata this device
  // does not hold), and `addAttachment` writes the blob BEFORE the metadata, so
  // no in-app path produces it.
  const held = new Map(blobs.map((b) => [b.id, b]));
  const files: BackupFile[] = await Promise.all(
    db.attachments
      .filter((a) => held.has(a.id))
      .map(async (a) => {
        const b = held.get(a.id)!;
        return {
          id: a.id,
          // The METADATA's owner, which is the one the importer validates
          // against and the one it writes back onto the blob row.
          ownerId: a.ownerId,
          mime: a.mime || b.blob.type || 'application/octet-stream',
          name: a.name || 'file',
          data: await blobToBase64(b.blob),
        };
      }),
  );
  return {
    text: JSON.stringify({
      app: 'practice-compass',
      schemaVersion: SCHEMA_VERSION,
      exportedAt: nowISO(now),
      deviceName: getDeviceName() || undefined,
      lastModified: lastModifiedOf(db) || undefined,
      data: db,
      files,
    }),
    rev,
  };
}

/** The backup text alone, for the callers that never install it back. */
export async function buildFullBackup(now: Date = new Date()): Promise<string> {
  return (await buildFullBackupWithRev(now)).text;
}

/** Peek at a backup's provenance without importing it. */
export function readBackupMeta(text: string): (BackupMeta & { exportedAt?: string }) | null {
  try {
    const parsed = JSON.parse(text) as { exportedAt?: string; deviceName?: string; lastModified?: string };
    return { exportedAt: parsed.exportedAt, deviceName: parsed.deviceName, lastModified: parsed.lastModified };
  } catch {
    return null;
  }
}

/**
 * Names for whatever practice is unfinished right now, for a visible message.
 * Lives here because this module already reads the store; used by both the
 * import refusal below and the sync deferral notice. Never fabricates a title:
 * `decideReplacement` falls back to a neutral phrase when one is missing.
 */
export function unfinishedPracticeLabels(): { itemTitle?: string; routineName?: string } {
  const { active, activeRoutine, db } = useStore.getState();
  return {
    itemTitle: active ? db.items.find((i) => i.id === active.itemId)?.title : undefined,
    routineName: activeRoutine ? db.pathwayRoutines.find((r) => r.id === activeRoutine.routineId)?.name : undefined,
  };
}

export type ImportOutcome =
  | { ok: true; fileCount: number }
  | {
      ok: false;
      error: string;
      /**
       * True when the refusal was a DEFERRAL, not a failure — an automatic sync
       * that will resume by itself. The caller must not dress this as an error:
       * `error` phase is not what App.tsx's retry watches, so reporting one
       * would turn a session that resolves in a minute into a silent outage.
       */
      deferred?: boolean;
    };

type ImportRefusal = Extract<ImportOutcome, { ok: false }>;

/**
 * Is a whole-database replacement refused right now? Read fresh each time it is
 * asked, because the answer can change mid-import — BOTH reasons can arise
 * after the replacement was decided. The intent is the caller's: a sync pull is
 * AUTOMATIC and defers quietly, everything else is DELIBERATE and refuses out
 * loud. `decidedFromRev` is the local revision the replacement was decided
 * against; a different one now means practice was committed in between and
 * installing the snapshot would destroy it.
 */
function replacementRefusal(intent: 'automatic' | 'deliberate', decidedFromRev: number): ImportRefusal | null {
  const { active, activeRoutine, rev } = useStore.getState();
  const decision = decideReplacement({
    intent,
    session: { active, activeRoutine },
    labels: unfinishedPracticeLabels(),
    revision: { decidedFrom: decidedFromRev, current: rev },
  });
  if (decision.outcome === 'proceed') return null;
  return { ok: false, error: decision.message, deferred: decision.outcome === 'defer' };
}

/**
 * Import a full backup. Decodes every file BEFORE touching any existing data —
 * a single corrupt file aborts the whole import with nothing changed, rather
 * than clearing existing blobs and silently losing the ones that fail to
 * decode. Once every file decodes cleanly, the blob replacement runs as one
 * IndexedDB transaction (`replaceAllBlobs`) and only then does the JSON `db`
 * get swapped — so a mid-write failure can never leave attachment metadata
 * pointing at blobs that no longer exist.
 *
 * A `files` key that is ENTIRELY ABSENT (not just an empty array) means this
 * isn't a full backup — e.g. a bare state-only export, or a hand-edited file.
 * That case must never be read as "zero attachments" and wipe every existing
 * blob to match; existing blobs are left untouched. A present `files: []` IS
 * treated as a real full backup with no attachments, and does replace (that's
 * the whole point of restoring to a snapshot).
 *
 * This is the chokepoint for every INBOUND replacement — manual import, a sync
 * pull, conflict-keep-remote, and archive restore all arrive here — so it is
 * where local practice is protected. The refusal is the FIRST thing this
 * function does, before the JSON is even parsed: `replaceAllBlobs` below
 * destroys every attachment blob, so a check placed after it would return
 * "nothing was changed" having already wiped them. It is ALSO the last thing
 * before `importDB`, because that first check does not span the whole call —
 * see the comment at the install itself.
 *
 * `decidedFromRev` is the local revision this replacement was decided against.
 * A sync pull passes the revision of the snapshot it actually compared, so the
 * guarded window covers the network fetch and the pre-sync archive too — a
 * block finished in there is in neither the archive nor the incoming snapshot.
 * A deliberate caller has no earlier decision point than this call, so it
 * defaults to the revision on entry.
 */
export async function importFullBackup(
  text: string,
  intent: 'automatic' | 'deliberate' = 'deliberate',
  decidedFromRev: number = useStore.getState().rev,
): Promise<ImportOutcome> {
  // A replacement reaching this function is one the owner chose (Import,
  // Restore archive, Keep remote) or a sync pull that slipped past syncNow's
  // own deferral because practice started mid-sync. Either way an unfinished
  // session — running or paused, fresh or stale, ordinary or routine — is
  // never destroyed by it, nor is a block that was started AND FINISHED since
  // the pull was decided, and never silently: every caller already surfaces
  // this error.
  const refusal = replacementRefusal(intent, decidedFromRev);
  if (refusal) return refusal;

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That file is not valid JSON.' };
  }
  const validated = parseImport(text);
  if (!validated.ok) return { ok: false, error: validated.error };

  const decoded = decodeBackupFiles((parsed as { files?: unknown }).files, validated.db.attachments);
  if (!decoded.ok) return { ok: false, error: decoded.error };
  const { isFullBackup, rows } = decoded;

  // THE SAME INVARIANT, AT THE OTHER DOOR: after any install, every attachment
  // this database describes has bytes on this device.
  //
  // `decodeBackupFiles` enforces it for a full backup (metadata with no bytes
  // is refused). A state-only file carries no bytes at all, so it cannot prove
  // anything — and left unchecked it is the ONE door that can install metadata
  // for files this device does not hold. That state is a one-way trap rather
  // than a cosmetic flaw: `buildFullBackupWithRev` carries bytes for exactly the
  // attachments `data` describes and can only OMIT one whose blob it cannot
  // find, so the very next full export describes a file it does not contain —
  // refused by this device's own import, and refused by every other device a
  // sync publishes it to, permanently. Refusing here instead leaves the local bytes and the local
  // database exactly as they were and says which file is missing, which is the
  // one moment the owner can still do something about it.
  if (!isFullBackup && validated.db.attachments.length > 0) {
    const held = await heldBlobIds();
    const absent = validated.db.attachments.find((a) => !held.has(a.id));
    if (absent) {
      return {
        ok: false,
        error: `That file describes an attachment ("${absent.name || absent.id}") whose contents are not in it and not on this device — import the full backup that carries the file. Nothing was changed.`,
      };
    }
  }

  try {
    // Only touch attachment blobs for a genuine full backup (files array
    // present, however short). A file with no `files` key at all leaves
    // today's attachments exactly as they are.
    if (isFullBackup) await replaceAllBlobs(rows);
  } catch (e) {
    return { ok: false, error: `Could not write attachment files (${e instanceof Error ? e.message : 'unknown error'}) — nothing was changed.` };
  }

  // Checked AGAIN, in the same synchronous tick as the install — ONE call
  // answering BOTH reasons, so no await can ever be slipped between them. The
  // check at the top of this function cannot cover the whole call:
  // `replaceAllBlobs` above yields to the event loop, so during that
  // transaction a tap can start a block or a routine (which `importDB` would
  // null) — or start one AND FINISH it, which leaves no session for presence
  // to see while the recorded block sits in a `db` the incoming snapshot is
  // about to overwrite, held by no archive. The revision comparison is what
  // catches that second case. Nothing awaits between here and the install, so
  // this one is genuinely the last word. The blobs are already written by this
  // point, so the refusal says that plainly rather than claiming nothing
  // changed; the message still names the blocking session when there is one
  // (ac-8), the practice is intact, and re-running the same import afterwards
  // finishes the job.
  const late = replacementRefusal(intent, decidedFromRev);
  if (late) {
    if (!isFullBackup) return late;
    // Say what actually happened; do NOT instruct a manual re-run, because a
    // deferral reaching here is an automatic sync that re-runs itself.
    return { ...late, error: `${late.error} (Your attachment files had already been replaced from the backup — the data itself was not. The next attempt finishes the job.)` };
  }

  useStore.getState().importDB(parsed);
  return { ok: true, fileCount: rows.length };
}

/**
 * Decode and CHECK a full backup's `files` before a single blob is touched.
 *
 * A migration rollback is a full-backup restore, so this is the transport this
 * lane's whole recovery route depends on — and it used to `continue` past any
 * entry with no id or a non-string `data`, silently installing metadata for
 * bytes that never arrived. The file said "Imported (3 files)" and the
 * attachment was simply gone.
 *
 * Three states, kept distinct:
 *   • `files` ABSENT  — not a full backup (a bare state export, a hand-edited
 *     file). Existing blobs are left exactly as they are.
 *   • `files: []`     — a real full backup with no attachments. It DOES
 *     replace: that is what restoring to a snapshot means.
 *   • a non-empty set — every entry must be sound, or nothing is written.
 *
 * "Sound" means: an object with a non-empty string `id`, no duplicate id, a
 * string `data` that actually base64-decodes, and an owner that resolves
 * through the canonical metadata (whose own ids `validateDB` has already
 * proved unique, at every door rather than this one). Bytes with no
 * matching metadata (orphans) and metadata with no bytes (omissions) are both
 * refused rather than half-installed. Legacy `itemId` ownership is still
 * accepted — normalised through the same v6 semantics the migration uses — but
 * an owner is never GUESSED.
 */
function decodeBackupFiles(
  files: unknown,
  attachments: { id: string; ownerType: string; ownerId: string }[],
):
  | { ok: true; isFullBackup: boolean; rows: AttachmentBlob[] }
  | { ok: false; error: string } {
  if (files === undefined) return { ok: true, isFullBackup: false, rows: [] };
  if (!Array.isArray(files)) {
    return { ok: false, error: 'The backup\'s "files" entry is not a list of files — nothing was changed.' };
  }

  // Metadata identity is NOT checked here. It used to be, and that was the bug:
  // this function returns above for a state-only file, so the check ran on one
  // door out of six. It lives in `validateDB` now — which `parseImport` has
  // already run on this very database before this call — so every inbound door
  // refuses two attachments sharing an id, not just a full backup.
  const metaById = new Map(attachments.map((a) => [a.id, a]));

  const rows: AttachmentBlob[] = [];
  const seen = new Set<string>();
  for (const raw of files) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return { ok: false, error: 'A file entry in the backup is not readable — nothing was changed.' };
    }
    const f = raw as Partial<BackupFile>;
    if (typeof f.id !== 'string' || f.id.length === 0) {
      return { ok: false, error: 'A file in the backup has no id — nothing was changed.' };
    }
    if (seen.has(f.id)) {
      return { ok: false, error: `Two files in the backup share the id "${f.id}" — nothing was changed.` };
    }
    seen.add(f.id);
    if (typeof f.data !== 'string') {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup has no readable data — nothing was changed.` };
    }
    const meta = metaById.get(f.id);
    if (!meta) {
      return {
        ok: false,
        error: `File "${f.name ?? f.id}" in the backup belongs to nothing this file describes — nothing was changed.`,
      };
    }
    // Legacy (schema ≤ 5) backups carried `itemId` instead of `ownerId`; the
    // v6 migration folds that into ownerType 'item' + ownerId, so accept it
    // here through the SAME rule rather than a second interpretation.
    const owner = typeof f.ownerId === 'string' && f.ownerId ? f.ownerId : f.itemId;
    if (typeof owner !== 'string' || owner.length === 0) {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup names no owner — nothing was changed.` };
    }
    if (owner !== meta.ownerId) {
      return {
        ok: false,
        error: `File "${f.name ?? f.id}" in the backup claims a different owner than its record — nothing was changed.`,
      };
    }
    let blob: Blob;
    try {
      blob = base64ToBlob(f.data, f.mime || 'application/octet-stream');
    } catch {
      return { ok: false, error: `File "${f.name ?? f.id}" in the backup is corrupt — nothing was changed.` };
    }
    rows.push({ id: f.id, ownerId: owner, blob });
  }

  // Metadata with no bytes would install an attachment that cannot be opened.
  // An EMPTY file set on a database that describes no attachments is fine;
  // this only fires when the two genuinely disagree.
  const missing = attachments.find((a) => !seen.has(a.id));
  if (missing) {
    return {
      ok: false,
      error: `The backup describes a file ("${missing.id}") whose contents are not in it — nothing was changed.`,
    };
  }

  return { ok: true, isFullBackup: true, rows };
}

/**
 * Recover from a refused COLD-START hydration (§C7). Every other inbound door
 * (Settings' own Import, sync, Keep remote, archive restore) is reachable
 * only once `hydrated` is true — but a refused cold start is exactly the case
 * where it never becomes true, so `App.tsx`'s corrupt-data refusal screen
 * needs its own way in. This is a thin wrapper, not a second import
 * implementation: `importFullBackup` above is the SAME validated
 * install path every other door already uses, so invalid data is rejected
 * here with nothing written, exactly as it already is everywhere else.
 * `importFullBackup`'s presence/revision guard reads `useStore.getState()`,
 * which — hydration never having succeeded — is still this store's plain
 * initial state (`emptyDB()`, no active session, `rev: 0`), so there is no
 * in-progress practice a cold start could ever be protecting and the default
 * `intent`/`decidedFromRev` are already correct.
 *
 * On success it ALSO flips `hydrated` true and clears the reactive refusal
 * flag: `importFullBackup`/`importDB` install a valid `db` but have no
 * reason to know about a gate that exists only before this device's very
 * first successful hydration. `App.tsx` renders the ordinary app the moment
 * both flip — this call is the only place that needs to know about the gate
 * at all.
 */
export async function recoverFromRefusedHydration(text: string): Promise<ImportOutcome> {
  const result = await importFullBackup(text);
  if (result.ok) {
    useStore.setState({ hydrated: true });
    useHydrationStatus.setState({ refused: false, message: null, tooNew: false });
  }
  return result;
}
```

### tests/practice-information-inbound.browser.test.ts

```
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  persistedDb,
  persistedUntil,
  publishRemote,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  writePersistedState,
} from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';
import { SCHEMA_VERSION } from '../src/domain/types';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-3 / ac-4 / ac-5 — every door an inbound database can come through.
//
// Hydration, the Settings importer, a sync pull, "Take the GitHub copy", the
// archive restore and the cold-start recovery control all have to reach the
// SAME validated model — and all have to leave the previous copy alone when
// they refuse. These journeys drive the real controls and then read the app's
// OWN persisted bytes back out of IndexedDB, so "nothing was changed" is
// checked against storage rather than against a return value.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const v12Db = () => (JSON.parse(v12Text) as { data: Record<string, unknown> }).data;

/** The one item the fixture's Farsi notebook belongs to. */
const FARSI_ITEM = 'i-farsi';
const FARSI_NOTES = 'یادداشتِ کاری: فرود را آهسته بگیر.';

describe('every inbound door reaches the same validated practice model', () => {
  it('practice information hydration and rendered recovery enforce the same schema boundary', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- 1. A v12 database migrating AT HYDRATION -----------------------
      // Written straight into the app's own IndexedDB at version 12, the way a
      // device that last ran the old build actually holds it — no import door,
      // so `migrate` is what has to do the work.
      await importBackup(app, 'v12.json', v12Text);
      expect(await importOutcome(app)).toContain('Imported');
      const current = await readPersistedState(app);
      expect(current.version).toBe(SCHEMA_VERSION);
      await writePersistedState(app, { ...(current.state as object), db: v12Db() }, 12);
      await reload(app);
      let db = await persistedDb(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      const farsi = () => db.items.find((i) => i.id === FARSI_ITEM)!;
      expect('currentProblem' in farsi()).toBe(false);
      expect('tags' in farsi()).toBe(false);
      expect(farsi().notes).toBe(FARSI_NOTES);
      expect(db.blocks.every((b) => !('bodyNote' in b))).toBe(true);

      // --- 2. An ALREADY-CURRENT database with partial leftovers ----------
      // Zustand skips `migrate` entirely when the persisted version matches, so
      // this is the path a stray retired key actually survives on.
      const stateNow = await readPersistedState(app);
      const leftover = stateNow.state as { db: { items: Record<string, unknown>[] } };
      await writePersistedState(
        app,
        {
          ...(stateNow.state as object),
          db: {
            ...leftover.db,
            items: leftover.db.items.map((i) =>
              i.id === FARSI_ITEM ? { ...i, currentProblem: 'a stray leftover', tags: ['x'] } : i,
            ),
          },
          // …and an unfinished block carrying a real scratch observation.
          active: {
            itemId: FARSI_ITEM,
            instrumentId: 'setar',
            mode: 'repair',
            focus: 'tone',
            targetMinutes: 10,
            startedAt: '2027-01-15T08:40:00.000Z',
            accumulatedSeconds: 120,
            running: false,
            note: 'فرود هنوز نامطمئن',
          },
        },
        SCHEMA_VERSION,
      );
      await reload(app);
      db = await persistedDb(app);
      expect('currentProblem' in farsi()).toBe(false);
      expect('tags' in farsi()).toBe(false);
      expect(farsi().notes).toBe(FARSI_NOTES);
      // The unfinished session survived, PAUSED, with its observation intact —
      // the existing reload timing is unchanged by any of this.
      await goTo(app, '/active');
      await expect.poll(() => page.getByRole('button', { name: 'Resume' }).isVisible()).toBe(true);
      expect(await page.locator('main').innerText()).toContain('2:00');
      const unfinished = (await readPersistedState(app)).state as { active: { note?: string; running: boolean } };
      expect(unfinished.active.note).toBe('فرود هنوز نامطمئن');
      expect(unfinished.active.running).toBe(false);

      // --- 3. INVALID canonical text is refused, bytes untouched ----------
      const before = await readPersistedState(app);
      const beforeBytes = JSON.stringify(before);
      const broken = before.state as { db: { items: Record<string, unknown>[] } };
      await writePersistedState(
        app,
        {
          ...(before.state as object),
          db: {
            ...broken.db,
            items: broken.db.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)),
          },
        },
        SCHEMA_VERSION,
      );
      const written = JSON.stringify(await readPersistedState(app));
      await app.page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      const refusalText = await page.locator('body').innerText();
      expect(refusalText).toMatch(/notes/i);
      // The refusal screen offers a real way back in, and NO downgrade.
      expect(await page.getByLabel('Restore backup file').count()).toBe(1);
      // Raw stored bytes are byte-identical to what was written: rendering the
      // refusal, by itself, writes nothing.
      expect(JSON.stringify(await readPersistedState(app))).toBe(written);
      expect(written).not.toBe(beforeBytes); // the test really did change them

      // --- 4. An INVALID recovery file changes nothing --------------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'broken.json',
        mimeType: 'application/json',
        buffer: Buffer.from('{ not json', 'utf8'),
      });
      await page.waitForTimeout(300);
      expect(JSON.stringify(await readPersistedState(app))).toBe(written);

      // --- 5. A VALID recovery file gets the owner back in ---------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'good.json',
        mimeType: 'application/json',
        buffer: Buffer.from(v12Text, 'utf8'),
      });
      // The refusal screen unmounts the instant recovery succeeds — the app
      // shell (`<main>`) only exists once hydration has actually been let
      // through. The URL is still the practice route this journey was last on,
      // which the restored database has no unfinished block for, so the tab bar
      // is legitimately absent until we leave it.
      await page.locator('main').waitFor({ timeout: 20_000 });
      await goTo(app, '/');
      await reload(app);
      db = await persistedDb(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(farsi().notes).toBe(FARSI_NOTES);

      // --- 6. A NEWER schema is refused, with update guidance only -------
      const good = await readPersistedState(app);
      const goodDb = (good.state as { db: Record<string, unknown> }).db;
      await writePersistedState(
        app,
        { ...(good.state as object), db: { ...goodDb, schemaVersion: SCHEMA_VERSION + 1 } },
        SCHEMA_VERSION + 1,
      );
      const newerBytes = JSON.stringify(await readPersistedState(app));
      await app.page.reload();
      await page.getByText(/newer version/i).first().waitFor({ timeout: 20_000 });
      const tooNewText = await page.locator('body').innerText();
      expect(tooNewText).toMatch(/Update the app/i);
      // No downgrade route is offered for data this build cannot read.
      expect(await page.getByLabel('Restore backup file').count()).toBe(0);
      expect(JSON.stringify(await readPersistedState(app))).toBe(newerBytes);
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 180_000);
});

describe('a replacement door never installs what it has not checked', () => {
  it('practice information replacement doors reject invalid data before database or blob replacement', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      await importBackup(app, 'v12.json', v12Text);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      // The attachment BYTES the fixture carried, as actually stored.
      const attachmentText = () =>
        page.evaluate(
          () =>
            new Promise<string | null>((resolve, reject) => {
              const req = indexedDB.open('practice-compass');
              req.onerror = () => reject(req.error);
              req.onsuccess = () => {
                const dbh = req.result;
                const get = dbh.transaction('attachments', 'readonly').objectStore('attachments').get('att-1');
                get.onsuccess = () => {
                  const row = get.result as { blob?: Blob } | undefined;
                  if (!row?.blob) return resolve(null);
                  void row.blob.text().then((t) => {
                    dbh.close();
                    resolve(t);
                  });
                };
                get.onerror = () => reject(get.error);
              };
            }),
        );
      expect(await attachmentText()).toBe('practice-compass fixture attachment');

      const goodBytes = JSON.stringify(await readPersistedState(app));
      const goodAttachment = await attachmentText();

      // --- The malformed-`files` matrix, through the REAL Settings import ---
      // Every one must be refused with the previous database AND the previous
      // attachment bytes still exactly as they were.
      const wrap = (data: unknown, files: unknown) =>
        JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: CLOCK.toISOString(), data, ...(files === undefined ? {} : { files }) });
      const db = v12Db();
      const validFile = { id: 'att-1', ownerId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', data: 'cmVwbGFjZWQ=' };

      const refused: { name: string; text: string; says: RegExp }[] = [
        { name: 'files is not a list', text: wrap(db, { id: 'att-1' }), says: /not a list of files/ },
        { name: 'an entry is not an object', text: wrap(db, ['nope']), says: /not readable/ },
        { name: 'an entry has no id', text: wrap(db, [{ ...validFile, id: undefined }]), says: /no id/ },
        { name: 'an entry has an empty id', text: wrap(db, [{ ...validFile, id: '' }]), says: /no id/ },
        { name: 'two entries share an id', text: wrap(db, [validFile, validFile]), says: /share the id/ },
        { name: 'data is not a string', text: wrap(db, [{ ...validFile, data: 42 }]), says: /no readable data/ },
        { name: 'data is not valid base64', text: wrap(db, [{ ...validFile, data: 'not base64!!' }]), says: /corrupt/ },
        { name: 'bytes with no matching metadata', text: wrap(db, [{ ...validFile, id: 'orphan' }]), says: /belongs to nothing/ },
        { name: 'an entry names no owner', text: wrap(db, [{ ...validFile, ownerId: undefined }]), says: /names no owner/ },
        { name: 'an entry claims the wrong owner', text: wrap(db, [{ ...validFile, ownerId: 'someone-else' }]), says: /different owner/ },
        {
          name: 'metadata whose bytes were omitted',
          text: wrap(db, []),
          says: /whose contents are not in it/,
        },
        {
          name: 'duplicate attachment METADATA ids',
          text: wrap(
            { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
            [validFile],
          ),
          says: /attachments share the id/,
        },
        {
          // THE SAME REFUSAL WITH NO `files` KEY AT ALL. This check used to
          // live inside the full-backup decoder, which returns on its first
          // line for a state-only file — so this door installed two
          // attachments claiming one id, and the device's own next export
          // then carried two files sharing an id and was refused by its own
          // importer, here and on every device a sync published it to. It is
          // refused BEFORE the state-only door's held-bytes check, because
          // both now sit behind the one validated model.
          name: 'duplicate attachment METADATA ids in a STATE-ONLY file',
          text: wrap(
            { ...db, attachments: [...(db.attachments as unknown[]), (db.attachments as unknown[])[0]] },
            undefined,
          ),
          says: /attachments share the id/,
        },
        {
          name: 'invalid canonical text in the data',
          text: wrap(
            { ...db, items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)) },
            [validFile],
          ),
          says: /notes should be text/,
        },
      ];

      for (const c of refused) {
        await importBackup(app, 'bad.json', c.text);
        expect(await importOutcome(app), c.name).toMatch(/Import failed/);
        expect(await importOutcome(app), c.name).toMatch(c.says);
        expect(JSON.stringify(await readPersistedState(app)), c.name).toBe(goodBytes);
        expect(await attachmentText(), c.name).toBe(goodAttachment);
      }

      // --- The three HONEST file states -----------------------------------
      // `files` ABSENT is a state-only import: existing blobs are untouched.
      await importBackup(app, 'state-only.json', wrap({ ...db, items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'state-only import' } : i)) }, undefined));
      expect(await importOutcome(app)).toContain('Imported');
      await persistedUntil(app, (s) => ((s.state as { db: { items: { id: string; title: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.title), (t) => t === 'state-only import');
      expect(await attachmentText()).toBe(goodAttachment);

      // …and what that door installed is a database this app can still back
      // up: export it and restore the export. This is the round trip the
      // state-only door used to be able to poison — one metadata row per
      // attachment means one file per attachment, with ids that are unique
      // because the model that describes them is.
      await reload(app);
      const afterStateOnly = await exportBackup(app);
      const stateOnlyFiles = (JSON.parse(afterStateOnly) as { files: { id: string }[] }).files;
      expect(stateOnlyFiles.map((f) => f.id)).toEqual(['att-1']);
      await importBackup(app, 'state-only-roundtrip.json', afterStateOnly);
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe(goodAttachment);

      // `files: []` on data that describes NO attachments IS a real full
      // backup with nothing in it, and does replace.
      await importBackup(app, 'empty-full.json', wrap({ ...db, attachments: [] }, []));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe(null);
      const emptied = JSON.stringify(
        await persistedUntil(
          app,
          (s) => (s.state as { db: { attachments: unknown[] } }).db,
          (d) => d.attachments.length === 0,
        ),
      );

      // …and with no blob on this device, a STATE-ONLY file that DESCRIBES one
      // is refused at the one door that could install it. That state is a
      // one-way trap, not a cosmetic flaw: the device's own next full export
      // carries bytes for exactly the attachments `data` describes and can only
      // OMIT one whose blob it cannot find, so it would describe a file it does
      // not contain — refused by its own import above ("metadata whose bytes
      // were omitted") and by every device a sync published it to, permanently.
      // (The OPPOSITE mismatch — bytes nothing describes — is closed at the
      // export itself; see the orphan round trip further down.) Local bytes and the local
      // database are both left exactly as they were.
      await importBackup(app, 'state-only-dangling.json', wrap(db, undefined));
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/not in it and not on this device/);
      expect(await attachmentText()).toBe(null);
      expect(JSON.stringify((await readPersistedState(app) as { state: { db: unknown } }).state.db)).toBe(emptied);

      // A complete, non-empty set replaces honestly.
      await importBackup(app, 'full.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('replaced');

      // A LEGACY (schema ≤ 5) file entry names its owner as `itemId`; the same
      // v6 rule that migrates the metadata accepts it here.
      await importBackup(app, 'legacy.json', wrap(db, [{ id: 'att-1', itemId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', data: 'bGVnYWN5' }]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('legacy');

      // --- BYTES THE DATABASE NO LONGER DESCRIBES ------------------------
      // A state-only file must PRESERVE local blobs — that is its contract —
      // even when the database it installs describes none of them. So this
      // device is deliberately left holding bytes nothing names, and the whole
      // round trip has to survive it: the app's own full export used to derive
      // `files` from the blobs actually stored, so it emitted those orphans and
      // produced a backup its OWN importer then refused ("belongs to nothing
      // this file describes") — unrestorable here and on every device a sync
      // published it to.
      await importBackup(
        app,
        'state-only-no-attachments.json',
        wrap({ ...db, attachments: [], items: (db.items as Record<string, unknown>[]).map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'orphan bytes left behind' } : i)) }, undefined),
      );
      expect(await importOutcome(app)).toContain('Imported');
      await persistedUntil(
        app,
        (s) => (s.state as { db: { attachments: unknown[] } }).db.attachments.length,
        (n) => n === 0,
      );
      // The contract held: the bytes are still here, undeleted.
      expect(await attachmentText()).toBe('legacy');

      await reload(app);
      const orphanExport = await exportBackup(app);
      // The export describes exactly what the database describes — nothing.
      expect((JSON.parse(orphanExport) as { files: unknown[] }).files).toEqual([]);
      await importBackup(app, 'orphan-roundtrip.json', orphanExport);
      expect(await importOutcome(app)).toContain('Imported');
      // …and restoring it leaves the device consistent: no metadata, and no
      // bytes for a file nothing names still sitting there pretending.
      await expect.poll(() => attachmentText()).toBe(null);
      expect((await persistedDb(app)).items.find((i) => i.id === FARSI_ITEM)!.title).toBe('orphan bytes left behind');

      // Put the fixture's attachment back for what follows.
      await importBackup(app, 'restore-attachment.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toContain('Imported');
      await expect.poll(() => attachmentText()).toBe('replaced');

      // --- A valid round trip keeps the canonical model -------------------
      await reload(app);
      const exported = await exportBackup(app);
      await importBackup(app, 'roundtrip.json', exported);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      const after = await persistedDb(app);
      expect(after.schemaVersion).toBe(SCHEMA_VERSION);
      expect(after.items.find((i) => i.id === FARSI_ITEM)!.notes).toBe(FARSI_NOTES);
      expect(after.items.every((i) => !('currentProblem' in i) && !('tags' in i))).toBe(true);

      // --- Unfinished practice REFUSES a deliberate replacement -----------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Pause' }).click();
      const guardedBytes = JSON.stringify(await readPersistedState(app));
      await importBackup(app, 'while-practising.json', wrap(db, [validFile]));
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/unfinished|in progress|practice/i);
      expect(JSON.stringify(await readPersistedState(app))).toBe(guardedBytes);

      // ...and AUTOMATIC sync DEFERS rather than failing, saying what it waits
      // on. This drives `syncNow` itself, through the real GitHub transport.
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      await connectSync(app);
      await expect.poll(() => syncMessage(page)).toMatch(/waiting|unfinished|finish/i);
      // Nothing left the device while practice was unfinished.
      expect(remote.calls).toEqual([]);

      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- A SYNC PULL goes through the same validated install -------------
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/pushed|in sync/i);
      expect(remote.calls.some((c) => c.startsWith('POST git/commits'))).toBe(true);

      // Another device publishes a DIFFERENT, valid snapshot. Its attachment
      // set is empty and its metadata says so — a snapshot whose manifest and
      // metadata disagree is exactly what the checks above refuse, and the
      // remote is not allowed to be the one place that gets away with it.
      const local = await persistedDb(app);
      const pulledDb = {
        ...local,
        attachments: [],
        items: local.items.map((i) => (i.id === FARSI_ITEM ? { ...i, title: 'pulled from the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(pulledDb), await hashState(pulledDb), 99);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/Brought the GitHub copy/i);
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; title: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.title,
        (t) => t === 'pulled from the other device',
      );
      // The previous copy was archived first, not destroyed.
      await page.getByRole('button', { name: 'Restore it' }).waitFor({ timeout: 20_000 });

      // --- An INVALID remote snapshot is refused before it replaces --------
      const beforeBadPull = JSON.stringify(await persistedDb(app));
      const badDb = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: { was: 'an object' } } : i)),
      };
      publishRemote(remote, remoteStateText(badDb), await hashState(badDb), 100);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/notes should be text/i);
      expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);

      // …and a remote snapshot is a bare database with no `files` of its own —
      // the same shape as the state-only file above, arriving through a
      // different door. Duplicate attachment metadata is refused here too,
      // rather than being installed by the one door nobody was watching.
      const attachmentRow = { id: 'att-1', ownerType: 'item', ownerId: FARSI_ITEM, mime: 'text/plain', name: 'score.txt', createdAt: CLOCK.toISOString(), size: 12 };
      const dupDb = { ...pulledDb, attachments: [attachmentRow, { ...attachmentRow }] };
      publishRemote(remote, remoteStateText(dupDb), await hashState(dupDb), 102);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page)).toMatch(/attachments share the id/i);
      expect(JSON.stringify(await persistedDb(app))).toBe(beforeBadPull);

      // --- BOTH sides changed: an explicit choice, and both copies kept ----
      const localEdit = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: 'edited on this device' } : i)),
      };
      await importBackup(app, 'local-edit.json', wrap(localEdit, []));
      expect(await importOutcome(app)).toContain('Imported');
      const otherEdit = {
        ...pulledDb,
        items: pulledDb.items.map((i) => (i.id === FARSI_ITEM ? { ...i, notes: 'edited on the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(otherEdit), await hashState(otherEdit), 103);
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await page.getByRole('button', { name: 'Take the GitHub copy' }).waitFor({ timeout: 20_000 });
      await page.getByRole('button', { name: 'Take the GitHub copy' }).click();
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; notes?: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.notes,
        (n) => n === 'edited on the other device',
      );
      // The local copy was pushed to an archive branch AND kept on the device.
      expect(remote.refs.some((r) => r.startsWith('archive/'))).toBe(true);

      // --- The archive restore is the same validated door ------------------
      await page.getByRole('button', { name: 'Restore it' }).click();
      await persistedUntil(
        app,
        (st) => (st.state as { db: { items: { id: string; notes?: string }[] } }).db.items.find((i) => i.id === FARSI_ITEM)?.notes,
        (n) => n === 'edited on this device',
      );

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 240_000);
});

// ---------------------------------------------------------------------------
// ac-5 — C5. Rollback is an explicit export/restore, never an invented
// down-migration.
// ---------------------------------------------------------------------------

/**
 * The commit this change was cut from — the app as it was BEFORE the schema
 * moved. A disposable git worktree of it is the only honest way to test a
 * rollback: the point is what the OLD app does with a NEW file, and no
 * description of that can stand in for the old app itself. Nothing is checked
 * in: the worktree is created here and removed again.
 */
const BASELINE_COMMIT = 'd014293c205958f45e4393ebf6ae56901db83a1c';

function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // `package.json` and `package-lock.json` are untouched by this change (they
  // are forbidden paths), so the baseline's dependencies are byte-identical to
  // this checkout's — linking them is exact, and far cheaper than a second
  // install. If that ever stops being true this link is the wrong shortcut.
  symlinkSync(join(process.cwd(), 'node_modules'), join(root, 'node_modules'));
  return {
    root,
    dispose: () => {
      try {
        execFileSync('git', ['worktree', 'remove', '--force', root], { stdio: 'pipe' });
      } catch {
        rmSync(root, { recursive: true, force: true });
      }
    },
  };
}

describe('rolling back to the schema this change replaced', () => {
  it('practice information rollback restores the original backup without pretending to downgrade new history', async () => {
    const baseline = checkoutBaselineApp();
    const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
    const fresh = await openPracticeApp({ now: CLOCK });
    try {
      // --- 1. The OLD app holds real v12 data, attachment and all ---------
      await importBackup(old, 'v12.json', v12Text);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const oldDb = await persistedDb(old);
      expect(oldDb.schemaVersion).toBe(12);
      // Its practice text is still the v12 model — this is genuinely the old app.
      expect('currentProblem' in oldDb.items.find((i) => i.id === FARSI_ITEM)!).toBe(true);

      // The retained pre-upgrade backup, exported through the old app's own
      // Export button. THIS is the artefact a rollback depends on.
      const retainedV12 = await exportBackup(old);
      expect(JSON.parse(retainedV12).schemaVersion).toBe(12);

      // --- 2. Upgrade: the same file, into the new app --------------------
      await importBackup(fresh, 'retained-v12.json', retainedV12);
      expect(await importOutcome(fresh)).toContain('Imported');
      await reload(fresh);
      const upgraded = await persistedDb(fresh);
      expect(upgraded.schemaVersion).toBe(SCHEMA_VERSION);
      expect(upgraded.items.find((i) => i.id === FARSI_ITEM)!.notes).toBe(FARSI_NOTES);

      // --- 3. Practice recorded AFTER the upgrade -------------------------
      await goTo(fresh, `/items/${FARSI_ITEM}`);
      await fresh.page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(fresh, '/active');
      await fresh.page.getByRole('button', { name: 'Finish' }).click();
      await fresh.page.getByRole('button', { name: 'Stable alone' }).click();
      await fresh.page.getByRole('button', { name: 'Save block' }).click();
      await reload(fresh);
      const withNewBlock = await persistedDb(fresh);
      const postUpgradeBlocks = withNewBlock.blocks.filter((b) => !oldDb.blocks.some((o) => o.id === b.id));
      expect(postUpgradeBlocks).toHaveLength(1);
      const postUpgradeBlockId = String(postUpgradeBlocks[0].id);

      const v13Export = await exportBackup(fresh);
      expect(JSON.parse(v13Export).schemaVersion).toBe(SCHEMA_VERSION);
      // The new block exists ONLY in the v13 export. A rollback to the retained
      // v12 backup therefore LOSES it — stated here rather than glossed over.
      expect(v13Export).toContain(postUpgradeBlockId);
      expect(retainedV12).not.toContain(postUpgradeBlockId);

      // --- 4. The OLD app REFUSES the v13 file, and changes nothing -------
      const oldBytesBefore = JSON.stringify(await readPersistedState(old));
      await importBackup(old, 'v13.json', v13Export);
      expect(await importOutcome(old)).toMatch(/Import failed/);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      expect(JSON.stringify(await readPersistedState(old))).toBe(oldBytesBefore);
      // It is refused, never stamped down: nothing claims to have converted it.
      expect(await importOutcome(old)).not.toMatch(/converted|downgrad/i);

      // --- 5. Restoring the retained v12 backup works, attachment and all --
      await importBackup(old, 'retained-v12.json', retainedV12);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const restored = await persistedDb(old);
      expect(restored.schemaVersion).toBe(12);
      expect(restored.blocks.some((b) => b.id === postUpgradeBlockId)).toBe(false);
      // The attachment came back with it, and opens: its bytes are readable.
      const bytes = await old.page.evaluate(
        () =>
          new Promise<string | null>((resolve, reject) => {
            const req = indexedDB.open('practice-compass');
            req.onerror = () => reject(req.error);
            req.onsuccess = () => {
              const dbh = req.result;
              const get = dbh.transaction('attachments', 'readonly').objectStore('attachments').get('att-1');
              get.onsuccess = () => {
                const row = get.result as { blob?: Blob } | undefined;
                if (!row?.blob) return resolve(null);
                void row.blob.text().then((t) => {
                  dbh.close();
                  resolve(t);
                });
              };
              get.onerror = () => reject(get.error);
            };
          }),
      );
      expect(bytes).toBe('practice-compass fixture attachment');
      await goTo(old, `/items/${FARSI_ITEM}`);
      expect(await old.page.locator('main').innerText()).toContain('score.txt');

      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
      expect(fresh.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await fresh.close();
      await old.close();
      baseline.dispose();
    }
  }, 300_000);
});
```

### tests/practiceBrowser.ts

```
import { readFile } from 'node:fs/promises';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, webkit, type Browser, type BrowserContext, type BrowserType, type Page } from 'playwright';

// ---------------------------------------------------------------------------
// A small harness for driving the REAL app in a real browser from an ordinary
// Vitest test.
//
// Deliberately a LIBRARY, not a second test runner: the installed check engine
// traces acceptance through the Vitest report, so a standalone Playwright exit
// code would prove nothing to it. Each journey gets its own Vite dev server and
// its own browser CONTEXT, which means its own origin-scoped IndexedDB and
// localStorage — no fixture from one journey can reach the other, and neither
// can touch the owner's real data, GitHub or NAS.
//
// A missing browser is a FAILURE with a setup message, never a skip: a check
// that quietly passes because it did not run is worse than no check at all.
// ---------------------------------------------------------------------------

/** The two engines this app is actually used in: Chrome on the Mac, Safari on the iPhone. */
export type Engine = 'chromium' | 'webkit';

const ENGINES: Record<Engine, BrowserType> = { chromium, webkit };

const installHint = (engine: Engine) =>
  `The Playwright ${engine} browser is not installed. Run \`npx playwright install ${engine}\` ` +
  '(CI does this before `npm test`). This check never skips: an unverified journey is not a passing one, ' +
  'and an engine quietly missed is the same thing as an engine never checked.';

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
  /** Which engine this journey is actually running in. */
  engine: Engine;
  /** Uncaught page errors, so a broken render cannot pass as a quiet one. */
  pageErrors: Error[];
  close(): Promise<void>;
}

/**
 * Start the app and open it in a fresh, isolated browser context.
 *
 * `now` fixes the browser's clock before any script runs, so every date the
 * app derives — due reviews, lesson deadlines, the local calendar day a block
 * belongs to — is deterministic. `page.clock` can then move it forward within
 * a journey (across local midnight, for instance) exactly as a real device
 * left open overnight would experience it.
 */
export async function openPracticeApp(options: {
  now: Date;
  viewport?: { width: number; height: number };
  /** Which engine to drive. Defaults to Chromium; ac-14 drives both. */
  engine?: Engine;
  /**
   * Serve a DIFFERENT checkout of this app — used to stand up a disposable
   * copy of an older release (a git worktree at an earlier commit) so a
   * rollback can be tested against the app that actually wrote the backup,
   * rather than against a description of it. Defaults to this checkout.
   */
  root?: string;
}): Promise<PracticeApp> {
  const engine = options.engine ?? 'chromium';
  const server: ViteDevServer = await createServer({
    ...(options.root ? { root: options.root, configFile: `${options.root}/vite.config.ts` } : { configFile: 'vite.config.ts' }),
    logLevel: 'error',
    server: { port: 0, strictPort: false },
  });
  await server.listen();
  const origin = server.resolvedUrls?.local[0];
  if (!origin) {
    await server.close();
    throw new Error('The dev server started but reported no local URL.');
  }

  let browser: Browser;
  try {
    browser = await ENGINES[engine].launch();
  } catch (e) {
    await server.close();
    throw new Error(installHint(engine), { cause: e });
  }

  let context: BrowserContext;
  let page: Page;
  const pageErrors: Error[] = [];
  try {
    context = await browser.newContext({
      viewport: options.viewport ?? { width: 390, height: 844 },
      // The owner's phone. Deliberately the constraint the product is held to.
      deviceScaleFactor: 2,
    });
    page = await context.newPage();
    // ONE handler for the whole journey. The app's destructive actions ask
    // first with confirm(); an unanswered dialog blocks every later command,
    // and registering a second handler makes the first one's accept() throw.
    page.on('dialog', (d) => {
      void d.accept().catch(() => {});
    });
    // Surface a page-level error instead of letting it become a silently
    // wrong assertion later.
    page.on('pageerror', (e) => pageErrors.push(e));
    await page.clock.install({ time: options.now });
    await page.goto(origin);
    // The store hydrates from IndexedDB before anything renders. The ceiling is
    // generous because this is the COLD start: five journeys run concurrently,
    // each starting its own dev server and browser, so the first paint of the
    // last one to launch competes with four others compiling modules. A longer
    // wait cannot hide a real failure — it only refuses to call contention one.
    await page.getByRole('navigation', { name: 'Primary' }).waitFor({ timeout: 60_000 });
  } catch (e) {
    await browser.close();
    await server.close();
    throw e;
  }

  return {
    page,
    origin,
    engine,
    pageErrors,
    async close() {
      await browser.close();
      await server.close();
    },
  };
}

/**
 * Import a backup through the REAL Settings control — the same path the owner
 * uses, file picker and confirmation included. No debug hook, no direct store
 * access: a journey that seeded itself through a back door would prove nothing
 * about the door the owner actually walks through.
 */
export async function importBackup(app: PracticeApp, name: string, json: string): Promise<void> {
  const { page } = app;
  await openSettings(app);
  await page.getByLabel('Import backup file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(json, 'utf8'),
  });
  await page.getByText(/Imported \(|Import failed:/).waitFor({ timeout: 20_000 });
}

/**
 * Reach Settings the way the owner does — More → Settings. The practice
 * screens hide the tab bar (they are the one place the app asks for undivided
 * attention), so from one of those this takes the route directly instead of
 * waiting forever for a nav that is deliberately not there.
 */
export async function openSettings(app: PracticeApp): Promise<void> {
  const { page } = app;
  if (await page.getByRole('navigation', { name: 'Primary' }).isVisible()) {
    await page.getByRole('link', { name: 'More' }).click();
    // "Settings" also names a link inside Settings' own copy once the page is
    // open, so take the one on the More menu — the first in the document.
    await page.getByRole('link', { name: 'Settings' }).first().click();
  } else {
    await goTo(app, '/settings');
  }
  await page.getByLabel('Import backup file').waitFor({ state: 'attached', timeout: 20_000 });
}

/** The message the Settings import flashed — "Imported (1 file)." or a refusal. */
export async function importOutcome(app: PracticeApp): Promise<string> {
  return (await app.page.getByText(/Imported \(|Import failed:/).first().textContent()) ?? '';
}

/**
 * Go to a route the way the owner does, then wait for the app to settle.
 *
 * The practice screens (`/active`, `/close`, `/routine/…`) deliberately hide
 * the tab bar — they are the one place the app asks for undivided attention —
 * so those routes wait on their own first control instead.
 */
const FOCUSED_ROUTES = /^\/(active|close|routine)/;

export async function goTo(app: PracticeApp, hashPath: string): Promise<void> {
  await app.page.goto(`${app.origin}#${hashPath}`.replace('##', '#'));
  if (FOCUSED_ROUTES.test(hashPath)) {
    await app.page.locator('main').waitFor({ timeout: 20_000 });
    await app.page.waitForFunction(() => (document.querySelector('main')?.textContent ?? '').length > 0);
    return;
  }
  await app.page.getByRole('navigation', { name: 'Primary' }).waitFor();
}

/** Reload, proving a claim survived in IndexedDB rather than in React state. */
export async function reload(app: PracticeApp): Promise<void> {
  // The store persists to IndexedDB asynchronously (that is the whole reason
  // App gates render on `hydrated`), so a reload fired in the same tick as the
  // click can outrun the write. This wait is about the storage platform, not
  // about the app: it is real wall-clock time in Node, unaffected by the
  // page's faked clock.
  await app.page.waitForTimeout(400);
  await app.page.reload();
  await app.page.locator('main, nav[aria-label="Primary"]').first().waitFor({ timeout: 20_000 });
}

const KV_KEY = 'practice-compass';

/**
 * Read the raw bytes the app's own persist middleware would read on the next
 * open — straight out of IndexedDB's `kv` store, not a JSON export shaped for
 * the Settings importer. `{ state, version }` is exactly the shape Zustand's
 * persist middleware writes and reads (`middleware.mjs`'s `setItem`/`hydrate`).
 */
export async function readPersistedState(app: PracticeApp): Promise<{ state: unknown; version: number }> {
  return app.page.evaluate(
    (key) =>
      new Promise<{ state: unknown; version: number }>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readonly');
          const get = tx.objectStore('kv').get(key);
          get.onsuccess = () => {
            db.close();
            resolve(JSON.parse((get.result as { value: string }).value));
          };
          get.onerror = () => reject(get.error);
        };
      }),
    KV_KEY,
  );
}

/**
 * Write directly into the app's own IndexedDB `kv` store — the way an
 * ALREADY-hydrated device holds its persisted state — bypassing every
 * import/migration door entirely. The one way to reach the "persisted
 * version already matches the current schema" hydration path: Zustand's
 * persist middleware only calls `migrate` when the persisted version differs
 * from the current one, and every JSON-import door runs `validateDB`
 * regardless of what version a FILE claims.
 */
export async function writePersistedState(app: PracticeApp, state: unknown, version: number): Promise<void> {
  await app.page.evaluate(
    ({ key, state, version }) =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('practice-compass');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('kv', 'readwrite');
          tx.objectStore('kv').put({ key, value: JSON.stringify({ state, version }) });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onerror = () => reject(tx.error);
        };
      }),
    { key: KV_KEY, state, version },
  );
}

/**
 * Export a full backup through the REAL Settings control and return its text.
 * Same button the owner presses, same file the browser would save — the point
 * of a rollback test is the artefact the app actually produces, not one a test
 * rebuilt from the store.
 */
export async function exportBackup(app: PracticeApp): Promise<string> {
  const { page } = app;
  await openSettings(app);
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30_000 }),
    page.getByRole('button', { name: /Export backup/ }).click(),
  ]);
  const path = await download.path();
  return readFile(path, 'utf8');
}

/**
 * Wait until the app's OWN persisted bytes satisfy a predicate — a real
 * IndexedDB acknowledgement of a write, never a sleep. A timeout fails with
 * the state actually found, so a slow write and a missing write look different.
 */
export async function persistedUntil<T>(
  app: PracticeApp,
  read: (state: { state: unknown; version: number }) => T,
  predicate: (value: T) => boolean,
  timeoutMs = 10_000,
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let last: T | undefined;
  for (;;) {
    last = read(await readPersistedState(app));
    if (predicate(last)) return last;
    if (Date.now() > deadline) {
      throw new Error(`Persisted state never satisfied the check. Last value: ${JSON.stringify(last)}`);
    }
    await app.page.waitForTimeout(50);
  }
}

/** The database as the app has actually PERSISTED it, not as it is rendering it. */
export async function persistedDb(app: PracticeApp): Promise<{
  items: Record<string, unknown>[];
  blocks: Record<string, unknown>[];
  reviews: Record<string, unknown>[];
  lessonAgenda: Record<string, unknown>[];
  schemaVersion: number;
}> {
  const { state } = await readPersistedState(app);
  return (state as { db: never }).db;
}

// ---------------------------------------------------------------------------
// A GitHub data repo that lives in this test process.
//
// It is installed at the REAL transport boundary — the `fetch` calls
// `gitRemote.ts` makes to api.github.com — so everything above it runs for
// real: `syncNow`, `resolveConflict`, `runSync`, `decideSync`, the pre-sync
// archive, and `importFullBackup`'s own guards. Nothing in the app is stubbed
// or bypassed, and no request ever leaves the machine.
// ---------------------------------------------------------------------------

export interface FakeRemote {
  /** The snapshot the repo currently holds, or null for an empty repo. */
  snapshot: { stateText: string; hash: string; rev: number; deviceName?: string; savedAt: string } | null;
  /** Every ref this repo has, so an archive branch is observable. */
  refs: string[];
  /** How many times each endpoint was called, so "it really went there" is checkable. */
  calls: string[];
}

export function newFakeRemote(): FakeRemote {
  return { snapshot: null, refs: [], calls: [] };
}

/** Put a snapshot in the repo as if another device had pushed it. */
export function publishRemote(remote: FakeRemote, stateText: string, hash: string, rev: number, deviceName = 'the other device'): void {
  remote.snapshot = { stateText, hash, rev, deviceName, savedAt: new Date().toISOString() };
  if (!remote.refs.includes('main')) remote.refs.push('main');
}

export async function installFakeGitHub(page: Page, remote: FakeRemote): Promise<void> {
  let headCounter = 0;
  const blobs = new Map<string, string>();

  await page.route('https://api.github.com/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    // /repos/<owner>/<name>/<rest…>
    const rest = url.pathname.split('/').slice(4).join('/');
    const method = req.method();
    remote.calls.push(`${method} ${rest}`);
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    const raw = (body: string) => route.fulfill({ status: 200, contentType: 'text/plain', body });
    const head = () => `head-${headCounter}`;

    if (method === 'GET' && rest === 'git/ref/heads/main') {
      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      return json({ object: { sha: head() } });
    }
    if (method === 'GET' && rest.startsWith('contents/manifest.json')) {
      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      return raw(
        JSON.stringify({
          formatVersion: 2,
          hash: remote.snapshot.hash,
          rev: remote.snapshot.rev,
          deviceName: remote.snapshot.deviceName,
          savedAt: remote.snapshot.savedAt,
          attachments: [],
        }),
      );
    }
    if (method === 'GET' && rest.startsWith('contents/state.json')) {
      if (!remote.snapshot) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
      return raw(remote.snapshot.stateText);
    }
    if (method === 'GET' && rest.startsWith('contents/files')) return json([]);
    if (method === 'GET' && rest.startsWith('git/blobs/')) {
      return json({ content: blobs.get(rest.slice('git/blobs/'.length)) ?? '' });
    }
    if (method === 'PUT' && rest.startsWith('contents/README.md')) {
      headCounter += 1;
      if (!remote.refs.includes('main')) remote.refs.push('main');
      return json({ commit: { sha: head() } });
    }
    if (method === 'POST' && rest === 'git/blobs') {
      const body = req.postDataJSON() as { content: string };
      const sha = `blob-${blobs.size}`;
      blobs.set(sha, body.content);
      return json({ sha });
    }
    if (method === 'POST' && rest === 'git/trees') return json({ sha: 'tree-1' });
    if (method === 'POST' && rest === 'git/commits') {
      headCounter += 1;
      return json({ sha: head() });
    }
    if (method === 'POST' && rest === 'git/refs') {
      const body = req.postDataJSON() as { ref: string };
      remote.refs.push(body.ref.replace('refs/heads/', ''));
      return json({});
    }
    if (method === 'PATCH' && rest === 'git/refs/heads/main') return json({});
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"message":"not routed"}' });
  });
}

/**
 * Wrap a database in the shape `state.json` holds: a full backup with NO file
 * payloads (attachments travel as separate git blobs).
 */
export function remoteStateText(db: unknown, deviceName = 'the other device'): string {
  return JSON.stringify({
    app: 'practice-compass',
    schemaVersion: (db as { schemaVersion?: number }).schemaVersion ?? 13,
    exportedAt: new Date().toISOString(),
    deviceName,
    data: db,
    files: [],
  });
}

/** Connect sync through the REAL Settings form and run the first sync. */
export async function connectSync(app: PracticeApp): Promise<void> {
  const { page } = app;
  await goTo(app, '/settings');
  // The sync form's fields sit inside a labelled group rather than carrying
  // their own accessible names. That is pre-existing Settings markup this lane
  // is explicitly not reshaping, so this reaches them the way they actually
  // are rather than pretending otherwise.
  await page.getByRole('group', { name: 'Repository' }).locator('input').fill('owner/practice-data');
  await page.getByRole('group', { name: 'Access token' }).locator('input').fill('github_pat_fake');
  await page.getByRole('button', { name: 'Connect & sync' }).click();
  await page.getByRole('button', { name: 'Sync now' }).waitFor({ timeout: 20_000 });
}

/** The sync section's own status line, whatever it currently says. */
export async function syncMessage(page: Page): Promise<string> {
  return (await page.locator('main').innerText()).replace(/\s+/g, ' ');
}
```

### tests/review-ownership.browser.test.ts

```
import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import {
  connectSync,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  persistedDb,
  publishRemote,
  reload,
  remoteStateText,
  syncMessage,
  type PracticeApp,
} from './practiceBrowser';
import v12Text from './fixtures/practice-information-v12.json?raw';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-12 / ac-13 — who manages a review date, and what happens after it changes
// hands.
//
// Handing a date back to the engine is ADMINISTRATION: the date stays exactly
// where it is, no practice is recorded, and nothing is calculated. What
// follows is the shipped scheduling behaviour, unchanged — which is the point
// of testing the two together.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2027-01-15T09:00:00');
const FARSI_ITEM = 'i-farsi';     // manual mode, user-chosen future date 2027-02-10
const ROWLESS = 'i-rowless';      // a pending date with NO open review row
const CONFLICT = 'i-conflict';    // item and rows disagree
const NODATE = 'i-nodate';        // auto, nothing scheduled
const AUTO_DUE = 'i-auto-due';    // auto, due today

async function seeded(): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK });
  await importBackup(app, 'v12.json', v12Text);
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  return app;
}

/** Everything about an item a transfer must not invent or disturb. */
async function facts(app: PracticeApp, itemId: string) {
  const db = await persistedDb(app);
  const i = db.items.find((x) => x.id === itemId) as Record<string, unknown>;
  return {
    nextReviewDate: i.nextReviewDate,
    reviewMode: i.reviewMode,
    nextReviewSource: i.nextReviewSource,
    srReps: i.srReps,
    srEase: i.srEase,
    srIntervalDays: i.srIntervalDays,
    srLastProgressDay: i.srLastProgressDay,
    timesPractised: i.timesPractised,
    totalMinutes: i.totalMinutes,
    lastResult: i.lastResult,
    status: i.status,
    blocks: db.blocks.filter((b) => b.practiceItemId === itemId).length,
    openRows: db.reviews.filter((r) => r.practiceItemId === itemId && !r.completedAt).map((r) => r.dueDate),
    completedRows: db.reviews.filter((r) => r.practiceItemId === itemId && r.completedAt).map((r) => JSON.stringify(r)),
  };
}

const transferButton = (page: Page) => page.getByRole('button', { name: 'Use automatic scheduling' });

describe('handing a review date back to the app', () => {
  it('review ownership controls distinguish explicit transfer from ordinary item edits', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      // --- 1. A manual item with a user-chosen future date ----------------
      await goTo(app, `/items/${FARSI_ITEM}`);
      const before = await facts(app, FARSI_ITEM);
      expect(before.nextReviewDate).toBe('2027-02-10');
      expect(before.reviewMode).toBe('manual');
      const panel = await page.locator('main').innerText();
      expect(panel).toContain('You set each date yourself.');
      // The explanation never calls the retained date a fresh calculation.
      expect(panel).toContain('Keeps 2027-02-10 exactly as it is');
      expect(panel).toContain('calculates no new date');
      expect(panel).not.toMatch(/new date has been calculated|recalculated for you/i);

      await transferButton(page).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      const after = await facts(app, FARSI_ITEM);
      // THE DATE IS KEPT; only who manages it changed. Nothing else moved.
      expect(after).toEqual({ ...before, reviewMode: 'auto', nextReviewSource: 'auto' });
      expect(await page.locator('main').innerText()).toContain('The app manages this: next on 2027-02-10.');
      // Repeated transfer is a no-op: the control is simply no longer offered.
      expect(await transferButton(page).count()).toBe(0);

      // --- 2. An UNRELATED save while already auto keeps a protected date --
      // First make the date the owner's again, so there is protection to lose.
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-03-15');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('user');
      // An ordinary edit — a title change — must not release that protection.
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('textbox', { name: 'Title' }).fill('آوازِ افشاری — عبارتِ ۴ (renamed)');
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      const afterUnrelated = await facts(app, FARSI_ITEM);
      expect(afterUnrelated.nextReviewDate).toBe('2027-03-15');
      expect(afterUnrelated.nextReviewSource).toBe('user');
      expect(afterUnrelated.reviewMode).toBe('auto');
      // The explicit transfer is still OFFERED on an already-auto item whose
      // date is the owner's.
      expect(await transferButton(page).count()).toBe(1);
      await transferButton(page).click();
      await reload(app);
      await goTo(app, `/items/${FARSI_ITEM}`);
      expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe('2027-03-15');
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('auto');

      // --- 3. A pending date with NO open row gets ONE reminder back ------
      await goTo(app, `/items/${ROWLESS}`);
      const rowlessBefore = await facts(app, ROWLESS);
      expect(rowlessBefore.openRows).toEqual([]);
      await transferButton(page).click();
      await reload(app);
      const rowlessAfter = await facts(app, ROWLESS);
      expect(rowlessAfter.openRows).toEqual(['2027-02-20']);
      expect(rowlessAfter.nextReviewDate).toBe('2027-02-20');
      expect(rowlessAfter.blocks).toBe(rowlessBefore.blocks);
      expect(rowlessAfter.timesPractised).toBe(rowlessBefore.timesPractised);

      // --- 4. A CONFLICTING schedule is refused, actionably ---------------
      await goTo(app, `/items/${CONFLICT}`);
      const conflictBefore = await facts(app, CONFLICT);
      await transferButton(page).click();
      await page.getByRole('alert').waitFor({ timeout: 10_000 });
      const refusal = await page.getByRole('alert').innerText();
      expect(refusal).toMatch(/more than one pending review date/);
      expect(refusal).toMatch(/Change review date/);
      await reload(app);
      expect(await facts(app, CONFLICT)).toEqual(conflictBefore);
      // Resolving it explicitly is what the refusal actually points at.
      await goTo(app, `/items/${CONFLICT}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-03-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${CONFLICT}`);
      await transferButton(page).click();
      await reload(app);
      const conflictAfter = await facts(app, CONFLICT);
      expect(conflictAfter.nextReviewDate).toBe('2027-03-01');
      expect(conflictAfter.openRows).toEqual(['2027-03-01', '2027-03-01']);
      expect(conflictAfter.reviewMode).toBe('auto');
      expect(conflictAfter.blocks).toBe(conflictBefore.blocks);

      // --- 5. No date: auto stays UNSCHEDULED until Review today ----------
      await goTo(app, `/items/${NODATE}`);
      const nodateBefore = await facts(app, NODATE);
      expect(nodateBefore.nextReviewDate).toBeUndefined();
      expect(await page.locator('main').innerText()).toContain('The app manages this. Nothing is scheduled.');
      expect(await transferButton(page).count()).toBe(0);
      await page.getByRole('button', { name: /^Review today/ }).click();
      await reload(app);
      const nodateAfter = await facts(app, NODATE);
      expect(nodateAfter.nextReviewDate).toBe('2027-01-15');
      expect(nodateAfter.nextReviewSource).toBe('user');
      expect(nodateAfter.reviewMode).toBe('auto');
      // Administration only: no block, no result, no spacing movement.
      expect(nodateAfter.blocks).toBe(nodateBefore.blocks);
      expect(nodateAfter.lastResult).toBe(nodateBefore.lastResult);
      expect(nodateAfter.srReps).toBe(nodateBefore.srReps);

      // --- 6. The FORM is the same transition, not a quieter one ----------
      // A saved manual → auto change routes through the transfer: the date
      // stays and its management moves, exactly as the button does.
      await goTo(app, `/items/${ROWLESS}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-04-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('group', { name: 'Reminder mode' }).getByRole('button', { name: 'Manual' }).click();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      await goTo(app, `/items/${ROWLESS}`);
      expect((await facts(app, ROWLESS)).reviewMode).toBe('manual');
      await page.getByRole('button', { name: 'Edit', exact: true }).click();
      await page.getByRole('group', { name: 'Reminder mode' }).getByRole('button', { name: 'Auto', exact: true }).click();
      await page.getByRole('button', { name: 'Save changes' }).click();
      await reload(app);
      const viaForm = await facts(app, ROWLESS);
      expect(viaForm.nextReviewDate).toBe('2027-04-01');
      expect(viaForm.reviewMode).toBe('auto');
      expect(viaForm.nextReviewSource).toBe('auto');

      // --- 7. The panel always reads the LIVE item, never a stale mount ----
      // Switch items, then come back: the date shown is the current one.
      await goTo(app, `/items/${FARSI_ITEM}`);
      await goTo(app, `/items/${ROWLESS}`);
      expect(await page.locator('main').innerText()).toContain('2027-04-01');

      // --- 7a. AN OPEN DATE EDITOR BELONGS TO THE ITEM IT WAS OPENED FOR ---
      // `/items/A` → `/items/B` is a route PARAMETER change: React keeps the
      // same component and only moves the props, so a draft that survived it
      // would be saved through the NEW item's callback. A's date used to land
      // on B that way, silently replacing a schedule B's owner never touched.
      const farsiOpen = await facts(app, FARSI_ITEM);
      const rowlessOpen = await facts(app, ROWLESS);
      expect(farsiOpen.nextReviewDate).not.toBe(rowlessOpen.nextReviewDate);
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-02-10');
      await goTo(app, `/items/${ROWLESS}`);
      // The editor did not come with it — there is nothing to press Save on.
      expect(await page.getByLabel('Next review date').count()).toBe(0);
      expect(await page.getByRole('button', { name: 'Save date' }).count()).toBe(0);
      // Opening B's own editor offers B's own date, never the one carried over.
      await page.getByRole('button', { name: 'Change review date' }).click();
      expect(await page.getByLabel('Next review date').inputValue()).toBe(rowlessOpen.nextReviewDate);
      await page.getByRole('button', { name: 'Cancel' }).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe(rowlessOpen.nextReviewDate);
      expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe(farsiOpen.nextReviewDate);

      // The remaining branch — the item's own date MOVING beneath an
      // UNTOUCHED box — needs something that changes `nextReviewDate` while
      // `ScheduleAgain` stays MOUNTED, which no control on this page does:
      // an import leaves the page and "Review today" is offered only when the
      // item has no date. A SYNC PULL is the one that does, and section 7c
      // below drives it.

      // --- 7b. A LIVE UPDATE TO THE ITEM DOES NOT DISCARD TYPED TEXT ------
      // The other half of the same rule: the draft is bound to the item, not
      // frozen against every change to it. A status change re-renders this
      // page with a new item object; the date the owner typed is theirs and
      // stands, and saving writes exactly it.
      await goTo(app, `/items/${ROWLESS}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-07-07');
      await page.getByRole('group', { name: 'Set status' }).getByRole('button', { name: 'Fixing problems' }).click();
      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-07-07');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-07-07');
      // An update arriving from elsewhere (an import — what a sync pull is)
      // while the screen is open is reflected, not overwritten by it.
      const live = await persistedDb(app);
      await importBackup(
        app,
        'external.json',
        JSON.stringify({
          app: 'practice-compass',
          schemaVersion: live.schemaVersion,
          exportedAt: CLOCK.toISOString(),
          data: {
            ...live,
            attachments: [],
            items: live.items.map((i) => (i.id === ROWLESS ? { ...i, nextReviewDate: '2027-05-05', nextReviewSource: 'user' } : i)),
            reviews: live.reviews.map((r) => (r.practiceItemId === ROWLESS && !r.completedAt ? { ...r, dueDate: '2027-05-05' } : r)),
          },
          files: [],
        }),
      );
      expect(await importOutcome(app)).toContain('Imported');
      await goTo(app, `/items/${ROWLESS}`);
      expect(await page.locator('main').innerText()).toContain('2027-05-05');
      // An editor opened AFTER that update offers the new date, not the one
      // this screen was showing before it arrived.
      await page.getByRole('button', { name: 'Change review date' }).click();
      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-05-05');
      await page.getByRole('button', { name: 'Cancel' }).click();
      await transferButton(page).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-05-05');

      // --- 7c. A LIVE UPDATE THAT CLEARS THE DATE UNDER AN OPEN BOX -------
      // The sealed counterexample, driven end to end: a sync pull is the one
      // thing that replaces the item's own date while this panel stays
      // MOUNTED, so it is what proves the reconciliation rather than a
      // description of it. The transport is the real one — `syncNow`,
      // `decideSync` and `importFullBackup` all run; only api.github.com is
      // answered in-process — and the trigger is the app's own `online`
      // listener, not a test hook reaching into the store.
      //
      // The old rule exempted "the item has no date" from the comparison
      // entirely, so a CLEARED date left the box showing — and "Save date"
      // writing — a schedule the item no longer had.
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      await connectSync(app);
      await expect.poll(() => syncMessage(page)).toMatch(/pushed|in sync/i);
      /** Commits this fake repo has actually received — the push, observed. */
      const pushes = () => remote.calls.filter((c) => c.startsWith('POST git/commits')).length;
      const pushesAtConnect = pushes();

      /** Publish the local database with ROWLESS's pending date removed. */
      const publishCleared = async (rev: number): Promise<void> => {
        const live = await persistedDb(app);
        const cleared = {
          ...live,
          // A snapshot carries attachment bytes as separate git blobs; this
          // fake repo has none, so the snapshot must describe none either.
          attachments: [],
          items: live.items.map((i) => {
            if (i.id !== ROWLESS) return i;
            // Absent, not empty — the shape a real snapshot carries for an
            // item with nothing scheduled.
            const unscheduled = { ...i };
            delete unscheduled.nextReviewDate;
            delete unscheduled.nextReviewSource;
            return unscheduled;
          }),
        };
        publishRemote(remote, remoteStateText(cleared), await hashState(cleared), rev);
        await goTo(app, `/items/${ROWLESS}`);
      };

      // (i) UNTOUCHED: the box follows the item, and offers what opening it
      //     fresh on a dateless item would — today.
      await goTo(app, `/items/${ROWLESS}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-05-05');
      await publishCleared(201);
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await expect.poll(() => page.getByLabel('Next review date').inputValue(), { timeout: 30_000 }).toBe('2027-01-15');
      // The panel never closed — this is the same open editor, reconciled.
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-01-15');

      // (ii) TYPED: the owner's own intent outranks the update. The reload
      //      above already triggered the app's own on-open sync, which pushes
      //      the date just saved and re-baselines against it — so the next
      //      published snapshot is a clean pull rather than a both-changed
      //      conflict. Wait for that commit to have actually landed.
      await expect.poll(pushes, { timeout: 30_000 }).toBeGreaterThan(pushesAtConnect);
      await goTo(app, `/items/${ROWLESS}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-09-09');
      await publishCleared(202);
      await page.evaluate(() => window.dispatchEvent(new Event('online')));
      await expect
        .poll(async () => (await facts(app, ROWLESS)).nextReviewDate, { timeout: 30_000 })
        .toBeUndefined();
      expect(await page.getByLabel('Next review date').inputValue()).toBe('2027-09-09');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect((await facts(app, ROWLESS)).nextReviewDate).toBe('2027-09-09');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});

describe('after the date changes hands, the shipped rules apply', () => {
  it('released review dates obey the shipped early practice and local day rules', async () => {
    const app = await seeded();
    const { page } = app;
    try {
      /** Practise the item once and close with `result`. */
      async function practise(itemId: string, result: string): Promise<void> {
        await goTo(app, `/items/${itemId}`);
        await page.getByRole('button', { name: 'Start a block' }).click();
        await goTo(app, '/active');
        await page.getByRole('button', { name: 'Finish' }).click();
        if (result === 'none') {
          await page.getByRole('button', { name: 'Save without a result' }).click();
        } else {
          await page.getByRole('button', { name: result, exact: true }).click();
          await page.getByRole('button', { name: 'Save block' }).click();
        }
        await reload(app);
      }

      // --- Transfer a FUTURE custom date through the real control ---------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await transferButton(page).click();
      await reload(app);
      let state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect(state.nextReviewSource).toBe('auto');
      const spacing = { srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays };

      // --- EARLY practice, in isolation, one result at a time -------------
      // `same`: nothing moves — not the date, not the spacing.
      await practise(FARSI_ITEM, 'Same');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect({ srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays }).toEqual(spacing);
      expect(state.openRows).toEqual(['2027-02-10']);

      // A POSITIVE early result is real practice, not the review: the date and
      // the spacing both stand, and the pending row stays OPEN.
      await practise(FARSI_ITEM, 'Stable alone');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate).toBe('2027-02-10');
      expect({ srReps: state.srReps, srEase: state.srEase, srIntervalDays: state.srIntervalDays }).toEqual(spacing);
      expect(state.openRows).toEqual(['2027-02-10']);

      // `worse` ALONE may bring an engine-managed date forward — never later.
      await practise(FARSI_ITEM, 'Worse');
      state = await facts(app, FARSI_ITEM);
      expect(state.nextReviewDate! < '2027-02-10').toBe(true);
      const repaired = String(state.nextReviewDate);
      expect(state.openRows).toEqual([repaired]);

      // --- Choosing a date again RE-ESTABLISHES the owner's protection -----
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-02-25');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      expect((await facts(app, FARSI_ITEM)).nextReviewSource).toBe('user');
      await practise(FARSI_ITEM, 'Worse');
      // Protected: even `worse` leaves a date the owner just chose alone.
      expect((await facts(app, FARSI_ITEM)).nextReviewDate).toBe('2027-02-25');

      // --- A DUE, eligible close advances spacing — once per local day -----
      const dueBefore = await facts(app, AUTO_DUE);
      expect(dueBefore.nextReviewDate).toBe('2027-01-15');
      await practise(AUTO_DUE, 'Stable alone');
      const advanced = await facts(app, AUTO_DUE);
      expect(advanced.nextReviewDate! > '2027-01-15').toBe(true);
      expect(advanced.srReps).toBe((dueBefore.srReps as number) + 1);
      expect(advanced.srLastProgressDay).toBe('2027-01-15');
      // A SECOND eligible close the same day buys no second expansion.
      await goTo(app, `/items/${AUTO_DUE}`);
      await page.getByRole('button', { name: 'Change review date' }).click();
      await page.getByLabel('Next review date').fill('2027-01-15');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      await goTo(app, `/items/${AUTO_DUE}`);
      await transferButton(page).click();
      await reload(app);
      await practise(AUTO_DUE, 'Stable alone');
      const twice = await facts(app, AUTO_DUE);
      expect(twice.srReps).toBe(advanced.srReps);
      expect(twice.srLastProgressDay).toBe('2027-01-15');

      // --- A deliberate NO clears the pending intent ----------------------
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).click();
      await page.getByRole('button', { name: 'Same', exact: true }).click();
      await page.getByRole('button', { name: 'Change', exact: true }).click();
      await page.getByRole('group', { name: 'Should this come back?' }).getByRole('button', { name: 'No' }).click();
      await page.getByRole('button', { name: 'Save block' }).click();
      await reload(app);
      const declined = await facts(app, FARSI_ITEM);
      expect(declined.nextReviewDate).toBeUndefined();
      expect(declined.openRows).toEqual([]);

      // …while an UNANSWERED / unlogged close leaves the schedule alone.
      await goTo(app, `/items/${FARSI_ITEM}`);
      await page.getByRole('button', { name: 'Schedule again' }).click();
      await page.getByLabel('Next review date').fill('2027-06-01');
      await page.getByRole('button', { name: 'Save date' }).click();
      await reload(app);
      const armed = await facts(app, FARSI_ITEM);
      expect(armed.nextReviewDate).toBe('2027-06-01');
      expect(armed.openRows).toEqual(['2027-06-01']);
      await practise(FARSI_ITEM, 'none');
      const unanswered = await facts(app, FARSI_ITEM);
      expect(unanswered.nextReviewDate).toBe('2027-06-01');
      expect(unanswered.openRows).toEqual(['2027-06-01']);
      expect(unanswered.srReps).toBe(armed.srReps);

      // --- The local day rolls BEFORE a displayed date action -------------
      // No dispatched event: the clock simply moves, as it does on a device
      // left open overnight.
      await goTo(app, `/items/${NODATE}`);
      expect((await facts(app, NODATE)).nextReviewDate).toBeUndefined();
      await page.clock.setSystemTime(new Date('2027-01-16T01:00:00'));
      await page.getByRole('button', { name: /^Review today/ }).click();
      // The first tap REFRESHES rather than writing yesterday's "today": the
      // button now names the real day, and nothing has been scheduled.
      await expect.poll(() => page.getByRole('button', { name: /^Review today/ }).innerText()).toContain('2027-01-16');
      expect((await facts(app, NODATE)).nextReviewDate).toBeUndefined();
      await page.getByRole('button', { name: /^Review today/ }).click();
      await reload(app);
      // "Today" is the day it actually is, not the day the page was opened on.
      expect((await facts(app, NODATE)).nextReviewDate).toBe('2027-01-16');
      await goTo(app, `/items/${NODATE}`);
      expect(await page.locator('main').innerText()).toContain('2027-01-16');

      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 300_000);
});
```

## Check against the contract

- [ ] **ac-1** — A1 / C1. Pure migration: exercise v12, older supported through the existing chain, current v13, mixed/partially retired objects and repeated execution. Assert exact retired-key absence and exact preservation of canonical Notes/Observation/Next time/questions, identity metadata, all non-text block/review/agenda/routine/settings facts. Include empty strings, absent family blocks and both retained/retired keys. New catalogue items retain both entry.notes and entry.about guidance. Opposite case: current canonical text is never reset on a second migration. _(proof: practice text retirement removes only authorised legacy fields and is idempotent)_
- [ ] **ac-2** — C2. Pure validation discriminates absent/empty/valid multilingual strings from numbers, arrays and objects in surviving item/block text. Errors identify the offending record. Keep existing invalid-date/reference and newer-schema refusal. Do not confuse retired dummy fields with malformed surviving canonical fields. _(proof: practice text validation rejects malformed canonical values without coercion)_
- [ ] **ac-3** — C3. Real IndexedDB hydration in disposable browser: v12 migration, already-current v13 merge, partial leftovers and persisted unfinished observation; invalid canonical/unfinished text, too-new schema and invalid recovery file. Compare raw stored bytes before/after refusal, drive the rendered cold-start recovery control with a valid file, reload and verify recovery; newer-schema UI has no downgrade control. Existing paused-on-reload timing remains. _(proof: practice information hydration and rendered recovery enforce the same schema boundary)_
- [ ] **ac-4** — C3/C4. Invoke real Settings import plus actual sync pull, Keep remote and archive restore orchestrators using isolated existing transport ports. Matrix valid old/current data, invalid canonical text, files wrong type, malformed/duplicate ids, invalid base64/ownership, omitted/orphan bytes. Check live/persisted DB and blob bytes before/after, not only return values. files absent preserves local bytes; valid files empty/nonempty replaces honestly. Include unfinished and revision-changed refusal; no weakening of existing late-guard semantics. Valid import/reload/export/reimport retains canonical model. Cold recovery is covered separately above. Include duplicate attachment metadata ids as well as duplicate payload ids. Mock the existing network/module transport boundary around actual githubSync entry points where needed; calling only runSync with a fake installer is not proof of real installation wiring. _(proof: practice information replacement doors reject invalid data before database or blob replacement)_
- [ ] **ac-5** — C5. Disposable exact-baseline v12 app and new v13 app: export full v12 fixture with a real small attachment, upgrade/import it, export v13, prove old app refuses v13 without altering bytes, then restore the retained v12 export and open/read the attachment. A post-upgrade test block exists only in the retained v13 export, making rollback limitations explicit. No checked-in old app bundle or real owner data modification. _(proof: practice information rollback restores the original backup without pretending to downgrade new history)_
- [ ] **ac-6** — A2. Render real Item Detail and Active at desktop/390px. Edit the same notebook while running and paused, with timer ticks, offline mode, navigation, Finish/return and Discard; verify notes survive and active clock identifiers/running/elapsed semantics, blocks/reviews/sr state stay unchanged by editing. Clear notes and reload; no resurrection. Inspect actual IndexedDB acknowledgement, not a sleep. Reject a storage write through the real storage seam and verify text remains visible with retry/copy and no false Saved state. _(proof: working notes persist across practice navigation without controlling the clock)_
- [ ] **ac-7** — A2/A3. Render a bound routine, edit item A while time naturally crosses to B, also exercise Skip, unbound and missing-item segments. Notes never land on the wrong item; routine elapsed/allocation/signals keep existing behaviour and no extra blocks appear. Also switch Item Detail route A to B and replace same-id data while the app is running: a stale editor must not overwrite new content on blur. Test Farsi and English text. _(proof: working note editors retain item ownership across routine and database changes)_
- [ ] **ac-8** — A4. Real Active to Close to next Active journey: distinct notebook, scratch Observation, Next time and lesson Question; choose result and close, inspect persisted records, reload, inspect older block history via disclosure and next-session previous decision. Notebook is not overwritten by reflection; questions stay independent and do not change preparation. Empty later nextAction preserves earlier non-empty choice. Deliberate unlogged close preserves schedule; Close across a local-day change retains authored text while refreshing the existing decision. _(proof: practice reflection keeps notebook observation next action and question distinct)_
- [ ] **ac-9** — A5/A6. Pure consumer cases plus rendered/exported teacher sheet: later block results and current notes/status change after a selected historical period; period result statements stay based on in-range blocks, current sections are labelled, and no unproved improvement is inferred from absolute ranks. Question output retains targets/asked answers and latest-observation date but never dumps Working notes as Problem or rewrites past answers. Include no-block/unlogged/older-observation cases and ordinary/DST local date boundaries for the selected report period. _(proof: practice summaries separate recorded period evidence from current context)_
- [ ] **ac-10** — B1-B4. Drive full item create/edit and Start with all retained status/result/mode/focus enums represented in a definition table; verify default summaries, reachable optional controls, accessible names, distinct descriptions, retained rating values and title-only quick add. Pin representative priority, urgency-factor, warm-up eligibility and scheduling outputs against current fixtures, including 1/3/5 effort/priority and Same versus Worse. A label change may not alter stored codes, weights, defaults or status transition behaviour. Include a new-status item with real blocks versus a truly untouched catalogue addition: wording is honest in both, with no automatic status or history mutation. _(proof: clarified practice choices preserve existing defaults and decision inputs)_
- [ ] **ac-11** — D1/D2. Pure administrative transition matrix: auto/user/unknown provenance; auto/manual/interval mode; future/due/past/no date; zero/matching/multiple agreeing/conflicting open rows; missing item; repeated execution. Retain pending date, normalise only explicit authority, preserve every sr/stat/block/completed-review fact. Restore missing reminder only when an item date exists; refuse ambiguous pending dates; no-date transfer stays unscheduled. Review today is separate and records no result. _(proof: automatic review ownership transfer preserves dates without inventing evidence)_
- [ ] **ac-12** — D3. Real Item Detail and full edit form: explicit transfer on already-auto custom/snoozed/unknown date, actual manual/interval to auto transition, and unrelated save while already auto. Assert identical intended outcomes and protected-date preservation on unrelated saves through live and persisted state after reload. Reopen/switch items/external live update while panel exists to rule out stale captured dates. Conflicting rows show actionable refusal; no-date auto remains unscheduled until explicit Review today. Button explanation never calls the retained date a new engine calculation. _(proof: review ownership controls distinguish explicit transfer from ordinary item edits)_
- [ ] **ac-13** — D4. Real UI transfer future custom date, then actual practice early with Same, positive and Worse in isolated scenarios; assert persisted due rows/item date, no early spacing expansion and repair only after worse. Change custom date/snooze/Schedule again re-establishes user protection. Exercise due eligible close, No, unanswered/unlogged and repeated same-day eligible close. Let browser clock cross local midnight before Review today or a displayed date action, without synthetic visibility events, and check displayed/saved date and Today/Close explanations. _(proof: released review dates obey the shipped early practice and local day rules)_
- [ ] **ac-14** — E1. Render changed note, item-form, Start, Close, routine-note, history and question-context surfaces at 390x844 and desktop in Chromium and WebKit. Install the matching existing Playwright browser binaries during setup if needed; do not silently skip an engine or report a skipped layout case as passing. Use Farsi, English, mixed paragraphs, opposite-language titles and long text. Assert own accessible names, selected states, keyboard activation, visible focus and actual text/ordinal bounding positions, no clipping/overlap/horizontal overflow, minimum editable font size and reduced-motion behaviour. This is browser rendering proof, not a claim to reproduce a physical iPhone keyboard; do not replace it with source regex. _(proof: practice information controls render accessible directional text at phone and desktop widths)_
- [ ] **ac-15** — OWNER subjective usability on the actual iPhone and Mac: a normal start stays under 30 seconds and close under 60; reading/editing Working notes during ordinary and bound-routine practice remains calm, clearly separate from block observation, and controls remain reachable with the keyboard. Verify understandable status/result/rating definitions and the retained-date automatic explanation. Record actual Farsi/English observations. Known residual shell/Safari symptom is separately diagnosed, not silently declared fixed and not cured with an untested timeout. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/store/useStore.ts, src/domain/scheduling.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx, src/store/backup.ts
- **practise-todays-recommendation** — touched via src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/ActiveBlock.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/domain/io.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts, src/domain/types.ts, src/pages/CloseBlock.tsx, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/pages/Settings.tsx, src/store/backup.ts, src/store/idb.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts, src/domain/scheduling.ts matched changed file(s) src/domain/scheduling.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/store/useStore.ts matched changed file(s) src/pages/Lessons.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx, src/store/backup.ts matched changed file(s) src/pages/Lessons.tsx, src/pages/Settings.tsx, src/store/backup.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts matched changed file(s) src/domain/blocks.ts, src/domain/scheduling.ts, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/StartBlock.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/ActiveBlock.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts matched changed file(s) src/domain/io.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/RoutineRunner.tsx, src/store/useStore.ts matched changed file(s) src/pages/RoutineRunner.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.


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

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260916-keep-useful-practice-information-clear-f-2e1e' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260916-keep-useful-practice-information-clear-f-2e1e/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
