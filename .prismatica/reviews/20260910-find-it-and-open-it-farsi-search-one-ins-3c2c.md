---
id: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
contractId: 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
patchId: 47d8e4b1f2f840eebeb918e49ba618c1398baeec
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Item attachment ownership and CRUD safety
    summary: ItemFilesCrud selects attachments by ownerId alone, although
      AttachmentMeta ownerId is shared across item and lesson owners. The item
      CRUD surface can therefore present and remove a lesson-owned attachment
      instead of remaining scoped to the item's own attachments.
    counterexample: "Import a valid database containing an item and lesson with the
      same id, with an attachment whose ownerType is lesson and ownerId is that
      shared id. Open the item: Material correctly excludes the lesson
      attachment, but Files lists it and Remove deletes its metadata and blob."
createdAt: 2026-09-11T01:43:14.689Z
sealedAt: 2026-09-11T02:52:16.744Z
---

# Review: Find it and open it: Farsi search, one instrument in view, and every file already linked to a piece

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260910-find-it-and-open-it-farsi-search-one-ins-3c2c
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/18
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `47d8e4b1f2f840eebeb918e49ba618c1398baeec`

## The Delta this change was framed from

# Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

_approved · about "browse-my-repertoire" step 4_

## Today

This Flow promises the right piece is found and opened in a couple of taps, 'from whichever way of thinking about it came first' -- step 3 narrowing to one instrument, step 4 filtering the practice list by search, step 5 opening the item. Verified at 5325ce31, each breaks differently. This Delta is anchored at step 4, where the failure is sharpest and reproducible, but it spans steps 3 to 5 of this Flow -- narrowing to one instrument, filtering by search, and opening the item -- and it additionally reaches the practice screen, which belongs to practise-todays-recommendation. A reviewer checking step 4 alone will find only part of the change; possibleConflicts records the full span.

SEARCH DOES NOT WORK IN THE LANGUAGE THE DATA IS WRITTEN IN. Both search boxes filter with title.toLowerCase().includes(query), which does nothing useful for Persian. Reproduced by running the real modules: typing 'daramad' does not find درآمد, and typing 'كرشمه' with an Arabic kaf -- which is what an iOS Arabic keyboard produces -- does not find 'کرشمه' stored with a Persian kaf. So the keyboard on the phone can emit characters that will never match the seeded Setar and Tar data. persianSearchMatch, which folds exactly these, has existed and been tested this whole time and is imported by no screen.

THE APP HAS THREE IDEAS OF WHICH INSTRUMENT YOU ARE ON. Today, Start, Quick Add and the Session Plan use the persisted session instrument. Repertoire keeps its own dropdown that resets to every-instrument on every visit. Lessons has neither and lists every instrument at once, so on the phone 40-plus Setar classes stack above Tar and Guitar with no way to narrow.

AND AN ITEM NEVER SHOWS ITS OWN MATERIAL. The item page already knows which lessons it came from and renders them as a bare link to the lessons list -- not to the lesson, and never to the class video or score that lesson holds. During practice there is nothing at all. Meanwhile adding a NAS reference still means typing a path from memory, even though the NAS already serves browsable directory listings that nothing in the app links to; and pasting a full URL, which does work, silently pins that reference to one device's route to the NAS.

## Instead

Everything the app already knows reaches you where you are -- and it stores nothing new to do it.

Search finds what you mean: both boxes go through the existing Farsi-aware matcher, so an Arabic kaf finds a Persian kaf, spelling variants fold together, and 'daramad' finds درآمد. Repertoire and Lessons open on the instrument you are actually practising, from the same session instrument every other screen uses, each keeping a visible way to widen to all. A piece lists the files that already belong to it -- the class video and score from the lessons it is linked to, and its own attachments -- and that same list is one closed disclosure away while you play, with a photo of the page inline and everything else an explicit open, never an embed. And you stop typing paths: a Browse link opens the NAS where you already configured it, and a URL you paste back is stored RELATIVE to that base, so the reference keeps working on every device whatever route that device takes to the NAS.

## Keep

- The cross-instrument view survives: Repertoire and Lessons default to one instrument but both keep a visible way to widen to all, so narrowing stays a default you can undo rather than a capability removed.
- The Farsi matcher itself is unchanged -- only the two screens that never called it.
- Nothing new is persisted to show an item's material; it is composed from lesson links and attachments that already exist.
- Large media stays on the NAS: files are opened, never fetched into attachments, sync or backups.
- Active practice stays calm -- one collapsed disclosure, closed by default, never above the timer.
- No timer, wake-lock or boundary-signal behaviour changes, and no viewer concern can influence a recorded minute.
- No schema change and no CSP change: SCHEMA_VERSION stays 11 and the production build's policy is untouched.
- Everything still works fully offline; an unset or unreachable NAS degrades to a plain explanation, never an error, and never blocks practising.

## New assumptions

- The NAS is served over the LAN by nginx at https://192.168.0.20:5010 with real browsable directory listings -- verified by probe, not taken from DECISIONS.md, which records a Tailscale mechanism that is not installed on this Mac.
- Its certificate is Synology's self-signed default and does not match the IP, so each device accepts it once. That is infrastructure; this lane surfaces the consequence and does not try to solve it.
- Whether to stay on the LAN address or move to something like Tailscale is your decision to make later. Storing references relative to the configured base is what keeps that decision free.
- A pasted URL from a different origin is left absolute rather than rewritten -- it is a deliberate external link.
- Most Setar material arrives through classes, so composing an item's files from its lessons covers the common case; an item with no lesson link needs a stored reference of its own, which is a separate schema change.

## Show me

On the phone, search your practice list for a gusheh using the Persian keyboard -- it is found, including when the keyboard gives you an Arabic kaf or yeh, and typing 'daramad' finds درآمد too. Open Repertoire and Lessons: both are already showing the instrument you are practising, not all three, and both still let you widen to everything in one tap.

Open a piece that came from a class. Its class video and score are listed right there on the item, and each opens on the NAS. Start a block on it and the same list is one tap away behind a closed disclosure -- a photo of the page shows inline while the timer keeps running, and the target signal still fires exactly as before.

Then add a new reference without typing a path: tap Browse, find the file in the NAS listing, copy its URL, paste it in, save. Change your NAS base URL to a different form of the same host and the reference still opens -- because what got stored was the path, not the address of one device's route to it.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **Item material presentation** — ItemDetail renders the full composed Material list and then renders the same attachments again through the existing Files section. Files still provides attachment previews and Open controls, so it is a second partial presentation rather than an add/remove-only CRUD surface.
  _counterexample:_ Open an item with a linked lesson recording and a local photo. Material shows the recording and photo together, then Files shows the photo again with another preview and Open action.
- **Session-instrument filtering across Repertoire** — PathwaysView includes every unscoped General pathway whenever a session instrument is selected. General pathways can contain items from any instrument, so the narrowed view can still expose another instrument's work without selecting All.
  _counterexample:_ Place a Tar item in a General pathway, set the session instrument to Setar, and open Repertoire. The initial Pathways view still shows that General pathway and its Tar-derived progress.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index def75f8..49600fd 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -586,6 +586,15 @@ screens SEED from that value and never WRITE it: browsing another instrument's
 repertoire must not change what Today recommends. The cross-instrument view is never
 removed — only stopped from being the default you undo on every visit.
 
+**A NARROWED PATHWAYS VIEW HIDES GENERAL PATHWAYS TOO, NOT JUST OTHER INSTRUMENTS'
+OWN.** A `Pathway` with no `instrumentId` is General — cross-instrument by design — and
+can hold items from ANY instrument, so showing it while narrowed to Setar can still
+surface a Tar item's progress with no way to know it slipped through. `pathwaysForInstrumentFilter`
+(`selectors.ts`, tested) is the one place this is decided: a real filter keeps only
+pathways scoped to that exact instrument, and only the explicit `''` ("all") filter
+widens back to see General pathways too — the same opt-in-widen shape as everything else
+in this section, not a second rule.
+
 **AN ITEM'S MATERIAL IS COMPOSED, NEVER STORED.** `itemFiles(db, itemId)`
 (`src/domain/itemFiles.ts`, pure and tested) lists the NAS references of every lesson
 the item is LINKED to (`lesson.itemIds` → `lesson.recordings`), deduplicated BY PATH so
@@ -600,7 +609,11 @@ schema change and its own lane. Both the PRACTICE screen and ItemDetail render t
 composition — a reference and an attachment for the same piece are never split across two
 sections of the screen. ItemDetail's existing Files section stays below it, but only for
 add/remove: that is a CRUD concern, never a second, partial presentation of what
-`itemFiles` already composed.
+`itemFiles` already composed. It is therefore its own small list local to `ItemDetail.tsx`
+(name, size, Remove — no thumbnail, no Open), not the shared `Attachments` component used
+for a lesson's own attachments: that component's preview and Open are exactly the
+presentation Material already gives an item's files, and reusing it here would put the
+same file on screen twice.
 
 **THE TWO KINDS OPEN BY DIFFERENT MECHANISMS, SO EVERY ENTRY CARRIES WHICH IT IS.** A
 reference resolves through the configured NAS base URL; an attachment resolves to a
diff --git a/src/domain/selectors.test.ts b/src/domain/selectors.test.ts
index 4361e13..45c14db 100644
--- a/src/domain/selectors.test.ts
+++ b/src/domain/selectors.test.ts
@@ -4,13 +4,14 @@ import {
   instrumentBalance,
   itemMatchesSearch,
   nextLessonNumber,
+  pathwaysForInstrumentFilter,
   practiceTotals,
   practiceTotalsByInstrument,
   startOfWeekISODate,
   totalMinutesInWindow,
 } from './selectors';
 import { createBlock, createInstrument } from './factories';
-import type { Instrument, Lesson, PracticeBlock } from './types';
+import type { Instrument, Lesson, Pathway, PracticeBlock } from './types';
 
 function instrument(id: string): Instrument {
   return { ...createInstrument({ name: id }, new Date(2026, 0, 1)), id };
@@ -260,3 +261,29 @@ describe('defaultInstrumentFilter', () => {
     expect(defaultInstrumentFilter(undefined, instruments)).toBe('');
   });
 });
+
+describe('pathwaysForInstrumentFilter', () => {
+  function pathway(id: string, instrumentId?: string): Pathway {
+    return {
+      id,
+      instrumentId,
+      name: id,
+      order: 0,
+      createdAt: '2026-01-01T00:00:00.000Z',
+      updatedAt: '2026-01-01T00:00:00.000Z',
+    };
+  }
+
+  it('narrows to one instrument\'s own pathways, hides a General pathway that could hold another instrument\'s items, and widens back for all', () => {
+    const setarPathway = pathway('p-setar', 'setar');
+    const tarPathway = pathway('p-tar', 'tar');
+    // General: no instrumentId, so it can hold a Tar item even while the
+    // session instrument is Setar — the counterexample this guards against.
+    const generalPathway = pathway('p-general');
+    const all = [setarPathway, tarPathway, generalPathway];
+
+    expect(pathwaysForInstrumentFilter(all, 'setar')).toEqual([setarPathway]);
+    expect(pathwaysForInstrumentFilter(all, 'tar')).toEqual([tarPathway]);
+    expect(pathwaysForInstrumentFilter(all, '')).toEqual(all);
+  });
+});
diff --git a/src/domain/selectors.ts b/src/domain/selectors.ts
index f6de040..73a15b9 100644
--- a/src/domain/selectors.ts
+++ b/src/domain/selectors.ts
@@ -3,6 +3,7 @@ import type {
   Instrument,
   ISODate,
   Lesson,
+  Pathway,
   PracticeBlock,
   PracticeItem,
   Review,
@@ -45,6 +46,19 @@ export function defaultInstrumentFilter(
   return instruments.some((i) => i.id === sessionInstrumentId) ? sessionInstrumentId : '';
 }
 
+/**
+ * Which pathways a narrowed Pathways view shows. A General pathway
+ * (`instrumentId` unset) can hold items from ANY instrument, so it stays
+ * OUT of a one-instrument view too — narrowing to Setar must not surface a
+ * General pathway's Tar-derived progress. Only the explicit '' ("all")
+ * filter widens back to see it, matching how every other narrowed screen in
+ * this lane treats the cross-instrument view as an opt-in widen, not a
+ * default leak.
+ */
+export function pathwaysForInstrumentFilter(pathways: Pathway[], filterInstrumentId: ID | ''): Pathway[] {
+  return filterInstrumentId ? pathways.filter((p) => p.instrumentId === filterInstrumentId) : pathways;
+}
+
 /** The nearest upcoming (today or later) lesson for an instrument, if any. */
 export function nextLessonFor(lessons: Lesson[], instrumentId: ID, now: Date): Lesson | undefined {
   const today = todayISODate(now);
diff --git a/src/pages/ItemDetail.tsx b/src/pages/ItemDetail.tsx
index 1ae3a33..807178d 100644
--- a/src/pages/ItemDetail.tsx
+++ b/src/pages/ItemDetail.tsx
@@ -1,6 +1,7 @@
-import { useMemo, useState } from 'react';
+import { useMemo, useRef, useState } from 'react';
 import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
 import {
+  attachmentPolicy,
   BLOCK_MODE_LABELS,
   FOCUS_LABELS,
   ITEM_STATUS_LABELS,
@@ -21,14 +22,14 @@ import {
 import { useStore } from '../store/useStore';
 import { getMaterial, instrumentName, itemBlocks, materialLabel } from '../store/lookups';
 import { defaultStartInput } from '../store/sessionHelpers';
+import { addAttachment, formatBytes, removeAttachment } from '../store/attachments';
 import ItemForm from '../components/ItemForm';
 import { itemToValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
 import { GUITAR_FIELDS, PERSIAN_FIELDS } from '../components/itemFields';
-import Attachments from '../components/Attachments';
 import ItemMaterial from '../components/ItemMaterial';
 import ItemNotes from '../components/ItemNotes';
 import { OptionPills, Stars, StatusBadge, Stat } from '../components/ui';
-import { ArrowLeftIcon, FlagIcon, PlayIcon } from '../components/icons';
+import { ArrowLeftIcon, FlagIcon, PlayIcon, PlusIcon } from '../components/icons';
 import { formatMinutes, relativeDay, relativeFromDateTime, formatDateTimeISO } from '../components/format';
 
 const RESULT_TONE: Record<BlockResult, string> = {
@@ -232,7 +233,7 @@ export default function ItemDetail() {
 
       <MaterialSection item={item} />
 
-      <Attachments ownerType="item" ownerId={item.id} />
+      <ItemFilesCrud itemId={item.id} />
 
       {trend.length > 0 && (
         <section className="stack-sm">
@@ -433,6 +434,86 @@ function MaterialSection({ item }: { item: PracticeItem }) {
   );
 }
 
+/**
+ * Add/remove only. Material above already shows every attachment with its
+ * preview and Open action from the composed `itemFiles` list — this stays a
+ * plain CRUD surface rather than a second, partial presentation of the same
+ * files (the shared Attachments component still owns that full presentation
+ * for a lesson's own attachments, which nothing else displays).
+ */
+function ItemFilesCrud({ itemId }: { itemId: string }) {
+  const all = useStore((s) => s.db.attachments);
+  const list = useMemo(
+    () => all.filter((a) => a.ownerId === itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
+    [all, itemId],
+  );
+  const fileRef = useRef<HTMLInputElement>(null);
+  const [busy, setBusy] = useState(false);
+  const [sizeNote, setSizeNote] = useState<string | null>(null);
+
+  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
+    const files = e.target.files;
+    if (!files || files.length === 0) return;
+    setBusy(true);
+    try {
+      for (const f of Array.from(files)) {
+        const policy = attachmentPolicy(f.size, f.type || '');
+        if (policy.level === 'block') {
+          setSizeNote(`“${f.name}” (${formatBytes(f.size)}) was not added: ${policy.message}`);
+          continue;
+        }
+        await addAttachment('item', itemId, f);
+        if (policy.level === 'warn') {
+          setSizeNote(`“${f.name}” is ${formatBytes(f.size)}. ${policy.message}`);
+        }
+      }
+    } finally {
+      setBusy(false);
+      if (fileRef.current) fileRef.current.value = '';
+    }
+  }
+
+  return (
+    <section className="stack-sm">
+      <div className="row between">
+        <div className="section-label">Files</div>
+        <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={busy}>
+          <PlusIcon /> {busy ? 'Adding…' : 'Add file'}
+        </button>
+      </div>
+      <input ref={fileRef} type="file" accept="application/pdf,image/*,audio/*" multiple hidden onChange={onFiles} />
+      {sizeNote && (
+        <div className="card card-quiet small" style={{ color: 'var(--tone-warn)' }}>
+          {sizeNote}{' '}
+          <button className="link tiny" style={{ background: 'none', border: 'none' }} onClick={() => setSizeNote(null)}>
+            OK
+          </button>
+        </div>
+      )}
+      {list.length > 0 && (
+        <div className="card card-flush list">
+          {list.map((a) => (
+            <div key={a.id} className="list-row">
+              <div className="grow truncate">{a.name}</div>
+              <div className="tiny faint">
+                {a.kind} · {formatBytes(a.size)}
+              </div>
+              <button
+                className="btn btn-ghost btn-sm btn-danger"
+                onClick={() => {
+                  if (confirm(`Remove "${a.name}"?`)) removeAttachment(a.id);
+                }}
+              >
+                Remove
+              </button>
+            </div>
+          ))}
+        </div>
+      )}
+    </section>
+  );
+}
+
 /**
  * Concise "why does this item exist" summary near the top: study source,
  * pathway stage, lessons, parent work — the same links, at a glance, without
diff --git a/src/pages/Repertoire.tsx b/src/pages/Repertoire.tsx
index f1adf98..e6761e3 100644
--- a/src/pages/Repertoire.tsx
+++ b/src/pages/Repertoire.tsx
@@ -15,6 +15,7 @@ import {
   nextLessonDates,
   overworkedItems,
   pathwayProgress,
+  pathwaysForInstrumentFilter,
   scoreItems,
   stageProgress,
   stageUnits,
@@ -325,10 +326,7 @@ function PathwaysView() {
   const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');
 
   const pathways = useMemo(
-    () =>
-      [...db.pathways]
-        .filter((p) => !filterInstrumentId || !p.instrumentId || p.instrumentId === filterInstrumentId)
-        .sort((a, b) => a.order - b.order),
+    () => pathwaysForInstrumentFilter(db.pathways, filterInstrumentId).slice().sort((a, b) => a.order - b.order),
     [db.pathways, filterInstrumentId],
   );
 
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

## Review actions have honest, distinct semantics

Practising (closing a block) is the ONLY thing that completes a review and advances
SM‑2. "Not now" hides a due review for the rest of today (no schedule change). Snooze
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
fields must stay direction-aware; `unicode-bidi: plaintext` handles this globally), then
create/link the concrete practice items (`lesson.itemIds` — a link, never ownership;
unlinking keeps the item). "Originated in this lesson" (`itemIds`) is separate from
"work on before the next class" (`assignedForLesson`), which gives a per-instrument
priority boost that climbs as that instrument's next lesson approaches
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

## Questions for next class

`questionsForNextClass` (`src/domain/questions.ts`, tested) collects items where
`assignedForLesson === true` AND `teacherQuestion` is non-empty, scoped to one
instrument, ordered by the Persian collator. Shown on the upcoming lesson and the
Teacher Report with Copy / Download / print-friendly export (`ClassQuestions`). A
question is NEVER auto-cleared by practising; the user edits the item to remove it.

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
Latin dastgāh names. All Farsi surfaces use `dir="auto"` + the global
`unicode-bidi: plaintext`.

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
were always in the data and were simply never composed. An item with no lesson link and
no attachments yields an EMPTY LIST, and the surfaces render nothing rather than an
empty frame. An item with no lesson link cannot reference NAS material at all — that is
the honest gap, and closing it needs a persisted item-level reference, therefore a
schema change and its own lane. Both the PRACTICE screen and ItemDetail render the WHOLE
composition — a reference and an attachment for the same piece are never split across two
sections of the screen. ItemDetail's existing Files section stays below it, but only for
add/remove: that is a CRUD concern, never a second, partial presentation of what
`itemFiles` already composed. It is therefore its own small list local to `ItemDetail.tsx`
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

`computeReview` (in `scheduling.ts`) is an **SM-2 spaced-repetition engine** adapted to
music: per item it tracks `srReps` / `srEase` / `srIntervalDays`; good reviews expand the
interval, a slip resets it, and importance/difficulty pull material a little sooner. It
supports per-item overrides (Auto / fixed cadence / Manual) and returns a plain `rationale`.
Keep it deterministic and explainable — don't turn it into an opaque model, and keep the
SM-2 tests green. Item status labels are plain-language for the user — keep the enum keys
stable and only change the display labels in `labels.ts`.

**The engine is visible AND adjustable, never magic.** `SchedulingParams`
(`src/domain/types.ts`) holds bounded knobs — the SM-2 first/second/slip-reset gaps and
the Session Plan minute shares — persisted as an OPTIONAL `PracticeDB.settings` (schema
**v10**; `undefined ⇒ DEFAULT_SCHEDULING_PARAMS`, so old backups import unchanged and
`validateDB` carries the field through). `DEFAULT_SCHEDULING_PARAMS` reproduces the
historical constants EXACTLY — `computeReview`/`planNextReview` take an optional `params`
whose default is byte-identical to before (a snapshot test guards this). Every call site
that shows OR persists a date must thread the SAME params (`db.settings`): the store into
`closeSession`, `CloseBlock` into both preview calls — the date shown must equal the date
saved. `clampSchedulingParams` enforces the bounds (never trust raw input). Settings' "How
scheduling works" section states the real priority formula and the SM-2 rungs in plain
English with live values, offers bounded inputs + "Reset to recommended", and CloseBlock's
review row links to it ("Why this date?").

## The Session Plan is a view over real blocks, not a new to-do list

The Session Plan (`src/domain/plan.ts`, pure + fully tested; `/plan` page) lays out one
time-budgeted session for the current instrument: ordered segments in five buckets
(`warmup · lesson · review · deep · cooldown`), each with minutes, a mode/focus, and a
one-sentence reason. It **reuses the same `scoreItems` priority numbers** as the
recommendation engine — no second, hidden ranking. It is organisation, never judgement:
no scores, no "optimal" claims, no gamification.

- **The invariant: segment minutes ALWAYS sum to the budget** (`buildSessionPlan`,
  `allocateMinutes` — largest-remainder split, min 2/segment, drops the lowest-priority
  segments when the budget can't seat them all). Keep it deterministic (explicit `now`,
  stable score-desc-then-id tiebreaks) and keep the sum==budget tests green across
  15/20/30/45/60 and the edge cases (0 items, 1 item, all-saturated, everything
  practised-today → falls back and says so). `redistributePlan`/`swapSegment` are the pure
  editors; the preview page tweaks a LOCAL copy before `startPlan`.
- **The plan runs REAL practice blocks — it is not a countdown.** `RoutineRunner` (the
  warm-up timer) stays untouched. The runner orchestrates the existing
  start→`/active`→`/close` flow: "Start this segment" = `beginPlanSegment` seeded from the
  segment (its minutes become the target). `closeSession` has a tail that, when a plan is
  running and the closed block was the current segment, marks it `done` and advances the
  pointer — **the plain flow (no active plan) is byte-identical to before.** Skipping logs
  nothing. Practising is still the only thing that completes a review / advances SM-2.
- **The running plan is EPHEMERAL** — `activePlan` + `planMinutesByInstrument` live in the
  store (persisted via `partialize`), **never in `PracticeDB`, so no schema bump and it
  never syncs/backs-up as data.**
- **Today's plan card stays collapsed (~50px) above "Practise now"** so the primary
  recommendation stays above the fold at 390×844 (verified). It becomes "Resume your plan"
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
  conflict-keep-remote, archive restore — runs through the one shared `migrateToCurrent`
  chain (`src/domain/migrations.ts`); persistence changes must keep it green and bump
  `SCHEMA_VERSION`. Schema **v11** backfills a routine's `instrumentId` from the pathway
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

## Roadmap items are allowed (they were designed for)

Audio recording attachment, PWA offline install, CSV export, calendar reminders, a
simple audio note per block, teacher‑sharing PDF. These extend the tool without breaking
the philosophy. Anything that contradicts the "do nots" above needs an explicit decision
from the user, recorded here.
```

### src/domain/selectors.test.ts

```
import { describe, expect, it } from 'vitest';
import {
  defaultInstrumentFilter,
  instrumentBalance,
  itemMatchesSearch,
  nextLessonNumber,
  pathwaysForInstrumentFilter,
  practiceTotals,
  practiceTotalsByInstrument,
  startOfWeekISODate,
  totalMinutesInWindow,
} from './selectors';
import { createBlock, createInstrument } from './factories';
import type { Instrument, Lesson, Pathway, PracticeBlock } from './types';

function instrument(id: string): Instrument {
  return { ...createInstrument({ name: id }, new Date(2026, 0, 1)), id };
}

function lesson(partial: Partial<Lesson> & { id: string; instrumentId: string; date: string }): Lesson {
  return { createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z', ...partial };
}

describe('nextLessonNumber', () => {
  it('is 1 when the instrument has no numbered lessons', () => {
    expect(nextLessonNumber([], 'setar')).toBe(1);
    expect(nextLessonNumber([lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01' })], 'setar')).toBe(1);
  });

  it('is max existing number + 1, scoped per instrument', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 3 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-02-01', number: 7 }),
      lesson({ id: 'c', instrumentId: 'tar', date: '2026-02-01', number: 40 }),
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(8);
    expect(nextLessonNumber(lessons, 'tar')).toBe(41);
  });

  it('ignores unnumbered lessons when computing the max', () => {
    const lessons = [
      lesson({ id: 'a', instrumentId: 'setar', date: '2026-01-01', number: 5 }),
      lesson({ id: 'b', instrumentId: 'setar', date: '2026-03-01' }), // no number
    ];
    expect(nextLessonNumber(lessons, 'setar')).toBe(6);
  });
});

// --- B1: honest calendar totals ----------------------------------------------
//
// The trap `blocksInWindow` sets is that it filters on HOURS, so days:1 means
// "the last 24 hours" and days:7 means "the last 168" — the wrong answer to
// "how much have I practised today?". These are CALENDAR figures, and the
// choice is pinned here rather than left as a comment.
//
// Local time throughout: the tests construct dates with the local `Date(y, m,
// d, h)` constructor, exactly as the helpers read them, so they hold in any
// timezone the owner's devices run in.

function pBlock(startedAt: Date, durationMinutes: number, instrumentId = 'setar'): PracticeBlock {
  return createBlock(
    {
      practiceItemId: 'item-1',
      instrumentId,
      durationMinutes,
      mode: 'repair',
      focus: 'tone',
      result: 'slightly_better',
      startedAt: startedAt.toISOString(),
    },
    startedAt,
  );
}

// Thursday 18 June 2026, 12:00 local.
const THURSDAY = new Date(2026, 5, 18, 12, 0);

describe('practiceTotals · calendar days, not rolling windows', () => {
  it("counts by calendar day, so a block from late yesterday is not part of today's total", () => {
    // Deliberately INSIDE the last 24 hours — 22:30 the previous evening is
    // only 13½ hours before "now" — and just as deliberately NOT today.
    const lateYesterday = pBlock(new Date(2026, 5, 17, 22, 30), 40);
    const justAfterMidnight = pBlock(new Date(2026, 5, 18, 0, 20), 15);

    const totals = practiceTotals([lateYesterday, justAfterMidnight], THURSDAY);
    expect(totals.today).toEqual({ minutes: 15, blocks: 1 });
    // The rolling-window helper would have swept both in — that is the bug.
    expect(totalMinutesInWindow([lateYesterday, justAfterMidnight], THURSDAY, 1)).toBe(55);
    // Both are still this week, and both are still all time.
    expect(totals.week).toEqual({ minutes: 55, blocks: 2 });
    expect(totals.allTime).toEqual({ minutes: 55, blocks: 2 });
  });

  it('counts a midnight-crossing block whole against the day it began, including across the Monday boundary', () => {
    // A block begun 23:40 on Wednesday, 40 minutes long: its minutes run past
    // midnight, and ALL of them belong to Wednesday. `durationMinutes` is the
    // figure the owner attested to and deliberately diverges from wall clock,
    // and routine blocks carry no endedAt to split by — so a block is one
    // indivisible unit of attested practice.
    const crossesMidnight = pBlock(new Date(2026, 5, 17, 23, 40), 40);
    expect(practiceTotals([crossesMidnight], THURSDAY).today).toEqual({ minutes: 0, blocks: 0 });
    expect(practiceTotals([crossesMidnight], new Date(2026, 5, 17, 23, 59)).today).toEqual({ minutes: 40, blocks: 1 });

    // The SAME rule decides the Monday boundary: begun Sunday 23:30, it
    // belongs whole to the week that is ending, with nothing carried into the
    // week that begins forty minutes later.
    const sundayNight = pBlock(new Date(2026, 5, 14, 23, 30), 40); // Sunday 14 June 2026
    const monday = new Date(2026, 5, 15, 9, 0);
    expect(practiceTotals([sundayNight], monday).week).toEqual({ minutes: 0, blocks: 0 });
    expect(practiceTotals([sundayNight], new Date(2026, 5, 14, 23, 59)).week).toEqual({ minutes: 40, blocks: 1 });
  });

  it("starts the week on Monday so Sunday's practice belongs to the week that is ending", () => {
    const sunday = new Date(2026, 5, 14, 20, 0); // Sunday 14 June 2026
    const monday = new Date(2026, 5, 15, 8, 0);
    expect(startOfWeekISODate(monday)).toBe('2026-06-15');
    expect(startOfWeekISODate(sunday)).toBe('2026-06-08'); // the week that is ending
    // Saturday is still that same week; Thursday's week began on the 15th.
    expect(startOfWeekISODate(new Date(2026, 5, 20, 8, 0))).toBe('2026-06-15');
    expect(startOfWeekISODate(THURSDAY)).toBe('2026-06-15');

    const sundayBlock = pBlock(sunday, 25);
    const mondayBlock = pBlock(monday, 30);
    // Asked on Monday: only Monday's practice is in the new week.
    expect(practiceTotals([sundayBlock, mondayBlock], monday).week).toEqual({ minutes: 30, blocks: 1 });
    // Asked on Sunday evening: Sunday's practice is in the week that is ending.
    expect(practiceTotals([sundayBlock], sunday).week).toEqual({ minutes: 25, blocks: 1 });
  });

  it('reports minutes and blocks per instrument, all time included', () => {
    const blocks = [
      pBlock(THURSDAY, 20, 'setar'),
      pBlock(new Date(2026, 5, 16, 10, 0), 30, 'setar'),
      pBlock(new Date(2026, 2, 3, 10, 0), 45, 'guitar'), // months ago
    ];
    const rows = practiceTotalsByInstrument(
      [instrument('setar'), instrument('guitar')],
      blocks,
      THURSDAY,
    );
    expect(rows.map((r) => r.instrumentId)).toEqual(['setar', 'guitar']); // most all-time minutes first
    expect(rows[0]).toMatchObject({
      today: { minutes: 20, blocks: 1 },
      week: { minutes: 50, blocks: 2 },
      allTime: { minutes: 50, blocks: 2 },
    });
    expect(rows[1]).toMatchObject({
      today: { minutes: 0, blocks: 0 },
      week: { minutes: 0, blocks: 0 },
      allTime: { minutes: 45, blocks: 1 },
    });
  });

  // Insights shows an overall "All instruments" row over EVERY block, so the
  // per-instrument rows below it have to account for every one of those
  // minutes. Passing only the ACTIVE instruments left a retired instrument's
  // history with no row at all while its minutes still sat in the total — the
  // rows silently summed to less than the figure printed above them.
  it("gives a retired instrument its own row, so the rows account for every minute in the overall total", () => {
    const retired = { ...instrument('guitar'), active: false };
    const blocks = [
      pBlock(THURSDAY, 20, 'setar'),
      pBlock(new Date(2026, 2, 3, 10, 0), 45, 'guitar'), // practised before it was retired
    ];
    const rows = practiceTotalsByInstrument([instrument('setar'), retired], blocks, THURSDAY);

    expect(rows.map((r) => r.instrumentId)).toContain('guitar');
    expect(rows.find((r) => r.instrumentId === 'guitar')?.allTime).toEqual({ minutes: 45, blocks: 1 });
    const summed = rows.reduce((n, r) => n + r.allTime.minutes, 0);
    expect(summed).toBe(practiceTotals(blocks, THURSDAY).allTime.minutes);
  });
});

// --- A10: the one shipped derived figure that was arithmetically wrong --------

describe('instrumentBalance · the denominator covers exactly the rows shown', () => {
  it('percentages sum to 100 when blocks exist for an instrument not in the supplied list', () => {
    // Exactly what Today produces: only the ACTIVE instruments, with ALL
    // blocks — including a retired instrument's, which gets no row of its own.
    const supplied = [instrument('setar'), instrument('tar')];
    const blocks = [
      pBlock(THURSDAY, 30, 'setar'),
      pBlock(THURSDAY, 20, 'tar'),
      pBlock(THURSDAY, 40, 'guitar'), // retired — no row emitted for it
    ];

    const rows = instrumentBalance(supplied, blocks, THURSDAY, 7);
    expect(rows.reduce((s, r) => s + r.percent, 0)).toBe(100);
    expect(rows.find((r) => r.instrumentId === 'setar')!.percent).toBe(60);
    expect(rows.find((r) => r.instrumentId === 'tar')!.percent).toBe(40);
    // The retired instrument's minutes are in neither a row nor the denominator.
    expect(rows.map((r) => r.instrumentId)).toEqual(['setar', 'tar']);

    // A right denominator is only half of it: rounded independently, three
    // equal shares each become 33% and total 99. The split that cannot divide
    // evenly is the one that has to sum to 100.
    const three = [instrument('setar'), instrument('tar'), instrument('guitar')];
    const thirds = instrumentBalance(
      three,
      [
        pBlock(THURSDAY, 1, 'setar'),
        pBlock(THURSDAY, 1, 'tar'),
        pBlock(THURSDAY, 1, 'guitar'),
        pBlock(THURSDAY, 40, 'santur'), // still omitted, still out of the denominator
      ],
      THURSDAY,
      7,
    );
    expect(thirds.reduce((s, r) => s + r.percent, 0)).toBe(100);
    expect(thirds.map((r) => r.percent).sort()).toEqual([33, 33, 34]);

    // And a row with no practice is never handed a leftover point.
    const lopsided = instrumentBalance(three, [pBlock(THURSDAY, 3, 'setar'), pBlock(THURSDAY, 3, 'tar')], THURSDAY, 7);
    expect(lopsided.reduce((s, r) => s + r.percent, 0)).toBe(100);
    expect(lopsided.find((r) => r.instrumentId === 'guitar')!.percent).toBe(0);
  });

  it('reports zero percent for every instrument when nothing was practised', () => {
    const rows = instrumentBalance([instrument('setar')], [], THURSDAY, 7);
    expect(rows[0]).toMatchObject({ minutes: 0, blocks: 0, percent: 0 });
  });
});

// ---------------------------------------------------------------------------
// The two search boxes (Repertoire's practice list, Start's item picker) and
// the instrument a browse screen opens on. Both are pure choices, so the
// wiring is provable in Node even though the screens themselves are not.
// ---------------------------------------------------------------------------

describe('itemMatchesSearch', () => {
  it('matches a Persian title when the query uses the Arabic kaf and still rejects an unrelated query', () => {
    const item = { title: 'کرشمه' }; // stored with the PERSIAN kaf U+06A9
    const arabicKaf = 'كرشمه'; // what an iOS Arabic keyboard emits (U+0643)

    // The predicate both screens used before this change could never match it.
    expect(item.title.toLowerCase().includes(arabicKaf.toLowerCase())).toBe(false);

    expect(itemMatchesSearch(item, arabicKaf)).toBe(true);
    expect(itemMatchesSearch(item, 'ماهور')).toBe(false);
  });

  it('finds a Persian title from its Latin transliteration and rejects an unrelated Latin query', () => {
    const item = { title: 'درآمد' };

    expect(item.title.toLowerCase().includes('daramad')).toBe(false);

    expect(itemMatchesSearch(item, 'daramad')).toBe(true);
    expect(itemMatchesSearch(item, 'qqqq')).toBe(false);
    expect(itemMatchesSearch(item, 'guitar')).toBe(false);
  });
});

describe('defaultInstrumentFilter', () => {
  it('seeds the filter from a resolvable session instrument, widens for all, and falls back when it no longer exists', () => {
    const instruments = [{ id: 'setar' }, { id: 'tar' }];

    expect(defaultInstrumentFilter('setar', instruments)).toBe('setar');
    expect(defaultInstrumentFilter('all', instruments)).toBe('');
    expect(defaultInstrumentFilter('deleted-instrument', instruments)).toBe('');
    expect(defaultInstrumentFilter(null, instruments)).toBe('');
    expect(defaultInstrumentFilter(undefined, instruments)).toBe('');
  });
});

describe('pathwaysForInstrumentFilter', () => {
  function pathway(id: string, instrumentId?: string): Pathway {
    return {
      id,
      instrumentId,
      name: id,
      order: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
  }

  it('narrows to one instrument\'s own pathways, hides a General pathway that could hold another instrument\'s items, and widens back for all', () => {
    const setarPathway = pathway('p-setar', 'setar');
    const tarPathway = pathway('p-tar', 'tar');
    // General: no instrumentId, so it can hold a Tar item even while the
    // session instrument is Setar — the counterexample this guards against.
    const generalPathway = pathway('p-general');
    const all = [setarPathway, tarPathway, generalPathway];

    expect(pathwaysForInstrumentFilter(all, 'setar')).toEqual([setarPathway]);
    expect(pathwaysForInstrumentFilter(all, 'tar')).toEqual([tarPathway]);
    expect(pathwaysForInstrumentFilter(all, '')).toEqual(all);
  });
});
```

### src/domain/selectors.ts

```
import type {
  ID,
  Instrument,
  ISODate,
  Lesson,
  Pathway,
  PracticeBlock,
  PracticeItem,
  Review,
} from './types';
import { daysSinceTouched, groupBlocksByItem, isSaturated, overdueDays } from './scoring';
import { persianSearchMatch } from './farsi';
import { addDaysISODate, dayDiff, hoursSince, parseISODate, toISODate, todayISODate } from './util';

// ---------------------------------------------------------------------------
// Derived lists used across the Today, Items and Insights screens. All pure.
// ---------------------------------------------------------------------------

/**
 * The search predicate BOTH search boxes use — Repertoire's practice list and
 * Start's item picker. The data is authored in Farsi, so `toLowerCase().includes()`
 * can never match a title typed with an Arabic kaf or yeh, which is exactly what
 * an iOS Arabic keyboard emits. Delegates to the existing, tested matcher: this
 * is the WIRING that was missing, not a second matcher.
 */
export function itemMatchesSearch(item: Pick<PracticeItem, 'title'>, query: string): boolean {
  return persianSearchMatch(item.title, query);
}

/**
 * Which instrument a browse screen (Repertoire, Lessons) OPENS on: the same
 * persisted session instrument every other screen already reads, with `''`
 * meaning every instrument. The cross-instrument view survives as an explicit
 * override — this only chooses the default.
 *
 * `instruments` must be the list the screen's own dropdown renders: a session
 * instrument that no longer resolves there (deleted, or inactive on a screen
 * that lists only active ones) falls back to every-instrument rather than
 * seeding a filter with no matching option and showing an empty screen.
 */
export function defaultInstrumentFilter(
  sessionInstrumentId: string | null | undefined,
  instruments: Pick<Instrument, 'id'>[],
): ID | '' {
  if (!sessionInstrumentId || sessionInstrumentId === 'all') return '';
  return instruments.some((i) => i.id === sessionInstrumentId) ? sessionInstrumentId : '';
}

/**
 * Which pathways a narrowed Pathways view shows. A General pathway
 * (`instrumentId` unset) can hold items from ANY instrument, so it stays
 * OUT of a one-instrument view too — narrowing to Setar must not surface a
 * General pathway's Tar-derived progress. Only the explicit '' ("all")
 * filter widens back to see it, matching how every other narrowed screen in
 * this lane treats the cross-instrument view as an opt-in widen, not a
 * default leak.
 */
export function pathwaysForInstrumentFilter(pathways: Pathway[], filterInstrumentId: ID | ''): Pathway[] {
  return filterInstrumentId ? pathways.filter((p) => p.instrumentId === filterInstrumentId) : pathways;
}

/** The nearest upcoming (today or later) lesson for an instrument, if any. */
export function nextLessonFor(lessons: Lesson[], instrumentId: ID, now: Date): Lesson | undefined {
  const today = todayISODate(now);
  return lessons
    .filter((l) => l.instrumentId === instrumentId && l.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];
}

/** A map of instrumentId → nearest upcoming lesson date. */
export function nextLessonDates(lessons: Lesson[], now: Date): Map<ID, ISODate> {
  const map = new Map<ID, ISODate>();
  const today = todayISODate(now);
  for (const l of lessons) {
    if (l.date < today) continue;
    const cur = map.get(l.instrumentId);
    if (!cur || l.date < cur) map.set(l.instrumentId, l.date);
  }
  return map;
}

/** Whole days from now until a calendar date (negative if past). */
export function daysUntil(dateISO: ISODate, now: Date): number {
  return dayDiff(now, parseISODate(dateISO));
}

export function lessonsForInstrument(lessons: Lesson[], instrumentId: ID): Lesson[] {
  return lessons.filter((l) => l.instrumentId === instrumentId).sort((a, b) => b.date.localeCompare(a.date));
}

/** Suggested next class number for an instrument: max existing + 1, or 1. */
export function nextLessonNumber(lessons: Lesson[], instrumentId: ID): number {
  const max = lessons
    .filter((l) => l.instrumentId === instrumentId && typeof l.number === 'number')
    .reduce((m, l) => Math.max(m, l.number as number), 0);
  return max + 1;
}

/** Items flagged to complete before their instrument's next lesson. */
export function assignedForLesson(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.assignedForLesson);
}

export function isDue(item: PracticeItem, now: Date): boolean {
  const d = overdueDays(item, now);
  return d !== null && d >= 0;
}

export function dueItems(items: PracticeItem[], now: Date): PracticeItem[] {
  return items
    .filter((i) => isDue(i, now))
    .sort((a, b) => (overdueDays(b, now) ?? 0) - (overdueDays(a, now) ?? 0));
}

export function fragileItems(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.status === 'fragile' || i.status === 'repairing');
}

export function neglectedImportantItems(
  items: PracticeItem[],
  now: Date,
  minImportance = 4,
  minDays = 8,
): PracticeItem[] {
  return items
    .filter((i) => i.importance >= minImportance && daysSinceTouched(i, now) >= minDays)
    .filter((i) => i.status !== 'dormant')
    .sort((a, b) => daysSinceTouched(b, now) - daysSinceTouched(a, now));
}

export function overworkedItems(
  items: PracticeItem[],
  blocks: PracticeBlock[],
  now: Date,
): PracticeItem[] {
  const byItem = groupBlocksByItem(blocks);
  return items.filter((i) => isSaturated(byItem.get(i.id) ?? [], now));
}

export function itemsWithTeacherQuestion(items: PracticeItem[]): PracticeItem[] {
  return items.filter((i) => i.teacherQuestion && i.teacherQuestion.trim().length > 0);
}

export function dueReviews(reviews: Review[], now: Date): Review[] {
  return reviews
    .filter((r) => !r.completedAt)
    .filter((r) => dayDiff(parseISODate(r.dueDate), now) >= 0)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function blocksInWindow(
  blocks: PracticeBlock[],
  now: Date,
  days: number,
): PracticeBlock[] {
  const hours = days * 24;
  // Future-dated blocks (clock skew, edited data) must not shape history.
  return blocks.filter((b) => {
    const h = hoursSince(b.startedAt, now);
    return h >= 0 && h <= hours;
  });
}

export interface InstrumentBalanceRow {
  instrumentId: ID;
  instrumentName: string;
  minutes: number;
  blocks: number;
  percent: number;
}

/** Minutes/blocks per instrument over the last `days`, including idle ones. */
export function instrumentBalance(
  instruments: Instrument[],
  blocks: PracticeBlock[],
  now: Date,
  days = 7,
): InstrumentBalanceRow[] {
  // The denominator must cover exactly the instruments that get a row.
  // Callers legitimately pass only the ACTIVE instruments alongside ALL
  // blocks (Today does), and taking the total from every block then meant a
  // retired instrument's practice sat in the denominator with no row of its
  // own — so the percentages summed to less than 100.
  const shown = new Set(instruments.map((i) => i.id));
  const windowBlocks = blocksInWindow(blocks, now, days).filter((b) => shown.has(b.instrumentId));
  const totalMinutes = windowBlocks.reduce((s, b) => s + b.durationMinutes, 0);

  const counted = instruments.map((inst) => {
    const own = windowBlocks.filter((b) => b.instrumentId === inst.id);
    return {
      instrumentId: inst.id,
      instrumentName: inst.name,
      minutes: own.reduce((s, b) => s + b.durationMinutes, 0),
      blocks: own.length,
    };
  });

  // Rounding each row on its own does NOT keep the sum at 100 even once the
  // denominator is right: three rows of one minute each round to 33% and total
  // 99. Largest remainder floors every share and hands the leftover points to
  // the largest fractions, so the emitted percentages always sum to exactly
  // 100. A row with no minutes has no fraction, so it can never be handed one.
  const percents = largestRemainder(counted.map((r) => r.minutes), totalMinutes);

  return counted.map((r, i) => ({ ...r, percent: percents[i] })).sort((a, b) => b.minutes - a.minutes);
}

/** Split 100 across `values` so the parts are whole numbers summing to 100. */
function largestRemainder(values: number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const exact = values.map((v) => (v / total) * 100);
  const out = exact.map((e) => Math.floor(e));
  let left = 100 - out.reduce((a, b) => a + b, 0);
  const byFraction = exact
    .map((e, i) => ({ i, fraction: e - Math.floor(e) }))
    .filter((x) => x.fraction > 0)
    .sort((a, b) => b.fraction - a.fraction || a.i - b.i);
  for (const { i } of byFraction) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return out;
}

export function totalMinutesInWindow(blocks: PracticeBlock[], now: Date, days: number): number {
  return blocksInWindow(blocks, now, days).reduce((s, b) => s + b.durationMinutes, 0);
}

// --- Honest practice totals --------------------------------------------------
//
// CALENDAR figures, not rolling windows. `blocksInWindow` above filters on
// HOURS, so days:1 means "the last 24 hours" and days:7 means "the last 168" —
// which is exactly the wrong answer to "how much have I practised today?": a
// block from late last night is not today's practice. These helpers are
// therefore separate rather than a reuse of that one.
//
// A block belongs WHOLE to the local calendar day it BEGAN, with none of its
// minutes apportioned into the following day. Two facts in the model settle
// that rather than convenience: `durationMinutes` is the figure the owner
// attested to at close and deliberately diverges from wall clock (an abandoned
// block proposes its target), so `endedAt - startedAt` is not the authored
// duration; and `endedAt` is optional and absent on routine blocks, so
// apportioning would quietly apply to some blocks and not others. The same
// rule decides the week boundary: a session begun Sunday 23:30 belongs to the
// week that is ending.

export interface PracticeTotal {
  minutes: number;
  blocks: number;
}

/** Monday 00:00 local — ISO-8601 and UK convention — as a calendar date. */
export function startOfWeekISODate(now: Date): ISODate {
  const mondayFirst = (now.getDay() + 6) % 7; // Sunday (0) → 6, Monday (1) → 0
  return addDaysISODate(todayISODate(now), -mondayFirst);
}

/** The local calendar day a block belongs to. */
function blockDay(b: PracticeBlock): ISODate {
  return toISODate(new Date(b.startedAt));
}

function total(blocks: PracticeBlock[]): PracticeTotal {
  return {
    minutes: blocks.reduce((s, b) => s + Math.max(0, Math.round(b.durationMinutes)), 0),
    blocks: blocks.length,
  };
}

export interface PracticeTotals {
  today: PracticeTotal;
  week: PracticeTotal;
  allTime: PracticeTotal;
}

/** Minutes and block counts for today, this week (from Monday) and all time. */
export function practiceTotals(blocks: PracticeBlock[], now: Date): PracticeTotals {
  const today = todayISODate(now);
  const weekStart = startOfWeekISODate(now);
  const days = blocks.map((b) => ({ b, day: blockDay(b) }));
  return {
    today: total(days.filter((d) => d.day === today).map((d) => d.b)),
    week: total(days.filter((d) => d.day >= weekStart && d.day <= today).map((d) => d.b)),
    allTime: total(blocks),
  };
}

export interface InstrumentTotalsRow extends PracticeTotals {
  instrumentId: ID;
  instrumentName: string;
}

/** The same calendar figures per instrument, for the full Insights view. */
export function practiceTotalsByInstrument(
  instruments: Instrument[],
  blocks: PracticeBlock[],
  now: Date,
): InstrumentTotalsRow[] {
  return instruments
    .map((inst) => ({
      instrumentId: inst.id,
      instrumentName: inst.name,
      ...practiceTotals(
        blocks.filter((b) => b.instrumentId === inst.id),
        now,
      ),
    }))
    .sort((a, b) => b.allTime.minutes - a.allTime.minutes);
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
  isLosslesslyRemovable,
  nextLessonFor,
  partsOf,
  pickNextPart,
  RESULT_LABELS,
  stallHint,
  itemFiles,
  type BlockResult,
  type GuitarFields,
  type PersianFields,
  type PracticeItem,
} from '../domain';
import { useStore } from '../store/useStore';
import { getMaterial, instrumentName, itemBlocks, materialLabel } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { addAttachment, formatBytes, removeAttachment } from '../store/attachments';
import ItemForm from '../components/ItemForm';
import { itemToValues, valuesToCreateInput, type ItemFormValues } from '../components/itemFormValues';
import { GUITAR_FIELDS, PERSIAN_FIELDS } from '../components/itemFields';
import ItemMaterial from '../components/ItemMaterial';
import ItemNotes from '../components/ItemNotes';
import { OptionPills, Stars, StatusBadge, Stat } from '../components/ui';
import { ArrowLeftIcon, FlagIcon, PlayIcon, PlusIcon } from '../components/icons';
import { formatMinutes, relativeDay, relativeFromDateTime, formatDateTimeISO } from '../components/format';

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
  const toggleAssignedForLesson = useStore((s) => s.toggleAssignedForLesson);
  const navigate = useNavigate();
  const location = useLocation();
  // Explicit, safe return context: back to where the item was opened from.
  const from = (location.state as { from?: string } | null)?.from ?? '/repertoire';
  const fromLabel = from === '/' ? 'Today' : from.startsWith('/lessons') ? 'Lessons' : from.startsWith('/pathway') ? 'Stage' : from.startsWith('/items/') ? 'Piece' : 'Repertoire';
  const now = useMemo(() => new Date(), []);
  // Arriving via "add details" (QuickAdd) opens the form straight away.
  const [editing, setEditing] = useState(Boolean((location.state as { edit?: boolean } | null)?.edit));

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
  const nextLesson = nextLessonFor(db.lessons, item.instrumentId, now);
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
    updateItem(item.id, valuesToCreateInput(values));
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="stack">
        <button className="link row" style={{ background: 'none', border: 'none' }} onClick={() => setEditing(false)}>
          <ArrowLeftIcon width={16} height={16} /> Cancel edit
        </button>
        <h1 className="page-title">Edit item</h1>
        <ItemForm initial={itemToValues(item)} submitLabel="Save changes" onSubmit={handleEdit} onCancel={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <Link to={from} className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> {fromLabel}
      </Link>

      <header className="stack-sm">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <h1 className="page-title" dir="auto">
            {item.title}
          </h1>
          <StatusBadge status={item.status} />
        </div>
        <div className="row-wrap small dim">
          <span>{instrumentName(db, item.instrumentId)}</span>
          <span className="faint">·</span>
          <span>{ITEM_TYPE_LABELS[item.itemType]}</span>
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
        <div className="row-wrap" style={{ gap: 16, marginTop: 4 }}>
          <span className="row tiny faint" style={{ gap: 6 }}>
            <Stars value={item.importance} /> importance
          </span>
          <span className="tiny faint">difficulty {item.difficulty}/5</span>
          {item.saturationWarning && <span className="tiny warn-flag">saturated — consider resting</span>}
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

      <button
        className={`btn btn-sm${item.assignedForLesson ? ' btn-primary' : ''}`}
        style={{ width: 'fit-content' }}
        onClick={() => toggleAssignedForLesson(item.id)}
        title="Prioritise this to be ready before your next class"
      >
        <FlagIcon width={14} height={14} />
        {item.assignedForLesson
          ? nextLesson
            ? `For class ${relativeDay(nextLesson.date, now)} ✓`
            : 'For next class ✓'
          : 'Complete before next class?'}
      </button>

      <ConnectedTo item={item} />

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

      <section className="stack-sm">
        <div className="section-label">Status</div>
        <OptionPills
          ariaLabel="Set status"
          value={item.status}
          onChange={(s) => setItemStatus(item.id, s)}
          options={ITEM_STATUS_ORDER.map((s) => ({ value: s, label: ITEM_STATUS_LABELS[s] }))}
        />
      </section>

      {(item.currentProblem || item.bestStrategy || item.teacherQuestion || item.lastObservation) && (
        <div className="stack-sm">
          {item.currentProblem && <DetailNote label="Current problem" text={item.currentProblem} />}
          {item.bestStrategy && <DetailNote label="Best strategy" text={item.bestStrategy} />}
          {item.teacherQuestion && <DetailNote label="Teacher question" text={item.teacherQuestion} tone="warn" />}
          {item.lastObservation && <DetailNote label="Last observation" text={item.lastObservation} />}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="row-wrap">
          {item.tags.map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      )}

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

      <section className="stack-sm">
        <div className="section-label">Recent blocks</div>
        {blocks.length === 0 ? (
          <div className="card card-quiet small dim">No blocks yet.</div>
        ) : (
          <div className="card card-flush list">
            {blocks.slice(0, 10).map((b) => (
              <div key={b.id} className="list-row">
                <div className="grow">
                  <div className="small">
                    {BLOCK_MODE_LABELS[b.mode]} · {FOCUS_LABELS[b.focus]}
                  </div>
                  {b.observation && <div className="tiny faint">{b.observation}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="tiny" style={{ color: RESULT_TONE[b.result] }}>
                    {RESULT_LABELS[b.result]}
                  </div>
                  <div className="tiny faint">
                    {formatDateTimeISO(b.startedAt)} · {b.durationMinutes}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
            <div className="truncate" dir="auto">
              {next.score.item.title}
            </div>
            <div className="tiny faint truncate">{next.reason}</div>
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
            <Link key={p.id} to={`/items/${p.id}`} state={{ from: `/items/${item.id}` }} className="list-row card-link" style={{ borderRadius: 0 }}>
              <div className="grow truncate" dir="auto">
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
    () => all.filter((a) => a.ownerId === itemId).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
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
            <div key={a.id} className="list-row">
              <div className="grow truncate">{a.name}</div>
              <div className="tiny faint">
                {a.kind} · {formatBytes(a.size)}
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
            Study source: <strong style={{ color: 'var(--text)' }}>{material.title}</strong>
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

function DetailNote({ label, text, tone }: { label: string; text: string; tone?: 'warn' }) {
  return (
    <div className="card card-quiet">
      <div className="section-label" style={{ marginBottom: 4, color: tone === 'warn' ? 'var(--tone-warn)' : undefined }}>
        {label}
      </div>
      <div className="small">{text}</div>
    </div>
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
```

### src/pages/Repertoire.tsx

```
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  defaultInstrumentFilter,
  formsPresent,
  groupBlocksByItem,
  groupByDastgah,
  isDue,
  itemMatchesSearch,
  ITEM_STATUS_LABELS,
  ITEM_STATUS_ORDER,
  ITEM_TYPE_LABELS,
  neglectedScore,
  nextLessonDates,
  overworkedItems,
  pathwayProgress,
  pathwaysForInstrumentFilter,
  scoreItems,
  stageProgress,
  stageUnits,
  repertoireWorks,
  UNCLASSIFIED_DASTGAH,
  type ItemStatus,
  type ItemType,
  type Pathway as PathwayT,
  type RepertoireWork,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import ItemCard from '../components/ItemCard';
import QuickAdd from '../components/QuickAdd';
import { Field, StatusBadge } from '../components/ui';
import { recordToOptions } from '../components/options';
import { relativeFromDateTime } from '../components/format';
import { ChevronRightIcon, ItemsIcon, PathIcon, PlusIcon } from '../components/icons';
import { EmptyState } from '../components/ui';

type View = 'paths' | 'works' | 'all';

export default function Repertoire() {
  const [view, setView] = useState<View>('paths');
  const navigate = useNavigate();

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <div className="row between">
          <h1 className="page-title">Repertoire</h1>
          <div className="row" style={{ gap: 8 }}>
            <Link to="/materials" state={{ from: '/repertoire' }} className="btn btn-ghost btn-sm">
              Study sources
            </Link>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
              <PlusIcon /> Add practice item
            </button>
          </div>
        </div>
        <p className="page-sub" style={{ margin: 0 }}>
          Practice items are what you do. Pathways, study sources and lessons simply connect the same items in
          different ways.
        </p>
        <div className="options" role="group" aria-label="Repertoire view">
          <button className={`option${view === 'paths' ? ' selected' : ''}`} aria-pressed={view === 'paths'} onClick={() => setView('paths')}>
            Pathways
          </button>
          <button
            className={`option${view === 'works' ? ' selected' : ''}`}
            aria-pressed={view === 'works'}
            onClick={() => setView('works')}
          >
            My repertoire
          </button>
          <button className={`option${view === 'all' ? ' selected' : ''}`} aria-pressed={view === 'all'} onClick={() => setView('all')}>
            Practice list
          </button>
        </div>
      </header>

      {view === 'paths' ? <PathwaysView /> : view === 'works' ? <MyRepertoireView /> : <AllItemsView />}
    </div>
  );
}

// --- My repertoire: the works you actually play -------------------------------
//
// A LENS over ordinary practice items (domain/repertoire.ts) — never a
// parallel database. Persian instruments group by dastgāh/āvāz with radif
// gushehs and composed maestro pieces side by side (a chahārmezrāb of Sabā in
// Afshāri is repertoire, not a stage); other instruments group by study
// source. Parent works appear once; parts stay nested beneath them.

function MyRepertoireView() {
  const db = useStore((s) => s.db);
  const navigate = useNavigate();
  const now = useMemo(() => new Date(), []);

  const activeInstruments = db.instruments.filter((i) => i.active);
  // Open on the instrument you are actually practising; the dropdown still
  // widens to all. This never writes sessionInstrumentId back — browsing
  // another instrument must not change what Today recommends.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [instrumentId, setInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, activeInstruments),
  );
  const [formFilter, setFormFilter] = useState('');

  const scope = useMemo(
    () => db.items.filter((i) => !instrumentId || i.instrumentId === instrumentId),
    [db.items, instrumentId],
  );
  const works = useMemo(() => repertoireWorks(scope), [scope]);
  const forms = useMemo(() => formsPresent(works), [works]);

  const filtered = useMemo(
    () => (formFilter ? works.filter((w) => (w.work.persian?.form ?? '').toLowerCase() === formFilter.toLowerCase()) : works),
    [works, formFilter],
  );

  const persianIds = useMemo(
    () => new Set(db.instruments.filter((i) => i.family === 'Persian').map((i) => i.id)),
    [db.instruments],
  );
  const persianWorks = filtered.filter((w) => persianIds.has(w.work.instrumentId));
  const otherWorks = filtered.filter((w) => !persianIds.has(w.work.instrumentId));

  // Persian works by dastgāh (works only — parts are attached to each work).
  const dastgahGroups = useMemo(() => {
    const byId = new Map(persianWorks.map((w) => [w.work.id, w]));
    return groupByDastgah(persianWorks.map((w) => w.work)).map((g) => ({
      dastgah: g.dastgah,
      works: g.items.map((i) => byId.get(i.id)!),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, instrumentId]);

  // Other instruments (e.g. Classical Guitar): group by study source.
  const sourceGroups = useMemo(() => {
    const map = new Map<string, typeof otherWorks>();
    for (const w of otherWorks) {
      const key = w.work.materialId ?? '';
      map.set(key, [...(map.get(key) ?? []), w]);
    }
    return [...map.entries()]
      .map(([materialId, ws]) => ({
        label: materialId ? (db.materials.find((m) => m.id === materialId)?.title ?? 'Unknown source') : 'No study source yet',
        works: ws,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, instrumentId, db.materials]);

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        The works and gushehs you play. Radif and composed maestro pieces sit together under their dastgāh; parts stay
        under their parent work.
      </p>

      {activeInstruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument">
          <button className={`option${!instrumentId ? ' selected' : ''}`} aria-pressed={!instrumentId} onClick={() => setInstrumentId('')}>
            All
          </button>
          {activeInstruments.map((i) => (
            <button
              key={i.id}
              className={`option${instrumentId === i.id ? ' selected' : ''}`}
              aria-pressed={instrumentId === i.id}
              onClick={() => setInstrumentId(i.id)}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}

      {forms.length > 1 && (
        <div className="row-wrap" role="group" aria-label="Filter by form">
          {forms.map((f) => (
            <button
              key={f}
              className={`chip${formFilter.toLowerCase() === f.toLowerCase() ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              aria-pressed={formFilter.toLowerCase() === f.toLowerCase()}
              onClick={() => setFormFilter((cur) => (cur.toLowerCase() === f.toLowerCase() ? '' : f))}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No works here yet">
            Add a gusheh or a composed piece (with its dastgāh, form, composer) — or a guitar piece — and it appears
            here. Technique drills stay in the Practice list.
          </EmptyState>
        </div>
      )}

      {dastgahGroups.map((g) => (
        <section key={g.dastgah} className="stack-sm">
          <div className="row between">
            <h2 className="title-md" dir="auto">
              {g.dastgah === UNCLASSIFIED_DASTGAH ? 'No dastgāh yet' : g.dastgah}
            </h2>
            <span className="tiny faint">
              {g.works.length} work{g.works.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="card card-flush list">
            {g.works.map((w) => (
              <WorkRow key={w.work.id} entry={w} db={db} now={now} />
            ))}
          </div>
        </section>
      ))}

      {otherWorks.length > 0 &&
        sourceGroups.map((g) => (
          <section key={g.label} className="stack-sm">
            <div className="row between">
              <h2 className="title-md" dir="auto">
                {g.label}
              </h2>
              <span className="tiny faint">
                {g.works.length} work{g.works.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="card card-flush list">
              {g.works.map((w) => (
                <WorkRow key={w.work.id} entry={w} db={db} now={now} />
              ))}
            </div>
          </section>
        ))}

      <button className="btn" style={{ width: 'fit-content' }} onClick={() => navigate('/items/new', { state: { from: '/repertoire' } })}>
        <PlusIcon /> Add practice item
      </button>
    </div>
  );
}

function WorkRow({
  entry,
  db,
  now,
}: {
  entry: RepertoireWork;
  db: ReturnType<typeof useStore.getState>['db'];
  now: Date;
}) {
  const { work, parts } = entry;
  const [open, setOpen] = useState(false);
  return (
    <div className="list-row" style={{ flexWrap: 'wrap' }}>
      <Link to={`/items/${work.id}`} state={{ from: '/repertoire' }} className="grow row" style={{ minWidth: 0, gap: 10 }}>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="truncate" dir="auto">
            {work.title}
          </div>
          <div className="tiny faint truncate" dir="auto">
            {[
              work.persian?.form,
              work.persian?.composer,
              work.persian?.gusheh && `gusheh: ${work.persian.gusheh}`,
              instrumentName(db, work.instrumentId),
              work.lastPractisedAt ? `last ${relativeFromDateTime(work.lastPractisedAt, now)}` : 'not practised yet',
            ]
              .filter(Boolean)
              .join(' · ')}
          </div>
        </div>
        <StatusBadge status={work.status} />
      </Link>
      {parts.length > 0 && (
        <>
          <button
            className="link tiny"
            style={{ background: 'none', border: 'none', flex: 'none' }}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? '− parts' : `${parts.length} part${parts.length === 1 ? '' : 's'} ›`}
          </button>
          {open && (
            <div className="stack-sm" style={{ width: '100%', paddingLeft: 14, marginTop: 6 }}>
              {parts.map((p) => (
                <Link key={p.id} to={`/items/${p.id}`} state={{ from: '/repertoire' }} className="row between small card-link" style={{ minWidth: 0 }}>
                  <span className="truncate dim" dir="auto">
                    {p.title}
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// --- By pathway --------------------------------------------------------------

function PathwaysView() {
  const db = useStore((s) => s.db);
  const addPathway = useStore((s) => s.addPathway);
  const reseedDefaultPathways = useStore((s) => s.reseedDefaultPathways);
  const navigate = useNavigate();

  const activeInstruments = db.instruments.filter((i) => i.active);
  // Open on the instrument you are actually practising; the toggle still
  // widens to all. This never writes sessionInstrumentId back — browsing
  // another instrument must not change what Today recommends.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [filterInstrumentId, setFilterInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, activeInstruments),
  );

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [instrumentId, setInstrumentId] = useState(db.instruments[0]?.id ?? '');

  const pathways = useMemo(
    () => pathwaysForInstrumentFilter(db.pathways, filterInstrumentId).slice().sort((a, b) => a.order - b.order),
    [db.pathways, filterInstrumentId],
  );

  function create() {
    if (!name.trim()) return;
    const id = addPathway({ name, instrumentId: instrumentId || undefined });
    setName('');
    setCreating(false);
    navigate(`/pathway/${id}`);
  }

  return (
    <div className="stack">
      <p className="page-sub" style={{ marginTop: -8 }}>
        Your items, organised along the routes you trust. Add pieces from each stage's list, at your own pace.
      </p>

      {activeInstruments.length > 1 && (
        <div className="options" role="group" aria-label="Instrument">
          <button
            className={`option${!filterInstrumentId ? ' selected' : ''}`}
            aria-pressed={!filterInstrumentId}
            onClick={() => setFilterInstrumentId('')}
          >
            All
          </button>
          {activeInstruments.map((i) => (
            <button
              key={i.id}
              className={`option${filterInstrumentId === i.id ? ' selected' : ''}`}
              aria-pressed={filterInstrumentId === i.id}
              onClick={() => setFilterInstrumentId(i.id)}
            >
              {i.name}
            </button>
          ))}
        </div>
      )}

      {pathways.map((p) => (
        <PathwayCard key={p.id} pathway={p} db={db} onOpen={() => navigate(`/pathway/${p.id}`)} />
      ))}

      {creating ? (
        <div className="card stack-sm">
          <Field label="Name">
            <input className="input" dir="auto" autoFocus placeholder="e.g. Tar · my teacher's plan" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Instrument">
            <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
              <option value="">General</option>
              {db.instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="row">
            <button className="btn btn-primary grow" disabled={!name.trim()} onClick={create}>
              Create pathway
            </button>
            <button className="btn" onClick={() => setCreating(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="row-wrap">
          <button className="btn btn-sm" onClick={() => setCreating(true)}>
            <PlusIcon /> New pathway
          </button>
          {pathways.length === 0 && (
            <button className="btn btn-sm" onClick={reseedDefaultPathways}>
              Restore default pathways
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function PathwayCard({
  pathway,
  db,
  onOpen,
}: {
  pathway: PathwayT;
  db: ReturnType<typeof useStore.getState>['db'];
  onOpen: () => void;
}) {
  const stage = currentStage(db.pathwayStages, db.items, pathway.id);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const sp = stage ? stageProgress(stageUnits(stage, db.items)) : null;

  return (
    <button className="card card-link stack-sm" style={{ width: '100%', textAlign: 'left' }} onClick={onOpen}>
      <div className="row between">
        <div className="row" style={{ gap: 8, minWidth: 0 }}>
          <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
          <span className="title-md truncate">{pathway.name}</span>
        </div>
        <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
      </div>
      <div className="tiny faint truncate">
        {pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}
        {stage ? ` · now: ${stage.code}${stage.title !== stage.code ? ` — ${stage.title}` : ''}` : ''}
      </div>
      <div className="row" style={{ gap: 8 }}>
        <span className="balance-track grow">
          <span className="balance-fill" style={{ width: `${sp?.percent ?? 0}%` }} />
        </span>
        <span className="tiny faint mono-num">
          {prog.done}/{prog.total}
        </span>
      </div>
    </button>
  );
}

// --- All items ---------------------------------------------------------------

type Quick = 'due' | 'lesson' | 'fragile' | 'neglected' | 'overworked' | 'teacher';

const QUICK: { key: Quick; label: string }[] = [
  { key: 'due', label: 'Due today' },
  { key: 'lesson', label: 'For class' },
  { key: 'fragile', label: 'Fragile' },
  { key: 'neglected', label: 'Neglected' },
  { key: 'overworked', label: 'Overworked' },
  { key: 'teacher', label: 'Teacher Q' },
];

const TYPE_OPTIONS = recordToOptions(ITEM_TYPE_LABELS);

function AllItemsView() {
  const db = useStore((s) => s.db);

  const now = useMemo(() => new Date(), []);
  const [search, setSearch] = useState('');
  // Seeded from the session instrument (never written back) against the same
  // list the dropdown below renders.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [instrumentId, setInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, db.instruments),
  );
  const [status, setStatus] = useState<ItemStatus | ''>('');
  const [type, setType] = useState<ItemType | ''>('');
  const [quick, setQuick] = useState<Set<Quick>>(new Set());

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const scored = useMemo(
    () => scoreItems(db.items, groupBlocksByItem(db.blocks), now, lessonDates),
    [db.items, db.blocks, now, lessonDates],
  );
  const overworkedIds = useMemo(
    () => new Set(overworkedItems(db.items, db.blocks, now).map((i) => i.id)),
    [db.items, db.blocks, now],
  );

  const toggleQuick = (k: Quick) =>
    setQuick((s) => {
      const next = new Set(s);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const visible = scored
    .map((s) => s.item)
    .filter((item) => {
      if (!itemMatchesSearch(item, search)) return false;
      if (instrumentId && item.instrumentId !== instrumentId) return false;
      if (status && item.status !== status) return false;
      if (type && item.itemType !== type) return false;
      if (quick.has('due') && !isDue(item, now)) return false;
      if (quick.has('lesson') && !item.assignedForLesson) return false;
      if (quick.has('fragile') && item.status !== 'fragile' && item.status !== 'repairing') return false;
      if (quick.has('neglected') && neglectedScore(item, now) < 2) return false;
      if (quick.has('overworked') && !overworkedIds.has(item.id)) return false;
      if (quick.has('teacher') && !(item.teacherQuestion && item.teacherQuestion.trim())) return false;
      return true;
    });

  return (
    <div className="stack">
      <QuickAdd />

      <div className="stack-sm">
        <input className="input" dir="auto" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="row" style={{ gap: 8 }}>
          <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            <option value="">All instruments</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value as ItemStatus | '')}>
            <option value="">Any status</option>
            {ITEM_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {ITEM_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select className="select" value={type} onChange={(e) => setType(e.target.value as ItemType | '')}>
            <option value="">Any type</option>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="row-wrap">
          {QUICK.map((q) => (
            <button
              key={q.key}
              className={`chip${quick.has(q.key) ? ' tone-progress' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => toggleQuick(q.key)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState icon={<ItemsIcon />} title="No items match">
            Try clearing a filter, or add one above — just a title is enough.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {visible.map((item) => (
            <ItemCard key={item.id} item={item} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Check against the contract

- [ ] **ac-1** — The Farsi failure that actually bites on the owner's phone, with its counterexample: a query typed with an ARABIC kaf matches a title stored with a PERSIAN kaf, while a genuinely unrelated Persian query still does not match. Proves the search screens now fold variants without becoming a match-everything filter. _(proof: matches a Persian title when the query uses the Arabic kaf and still rejects an unrelated query)_
- [ ] **ac-2** — Latin transliteration, with its counterexample: searching 'daramad' finds درآمد, and an unrelated Latin word finds nothing. Verified failing against the current toLowerCase().includes() predicate before the change. _(proof: finds a Persian title from its Latin transliteration and rejects an unrelated Latin query)_
- [ ] **ac-3** — The instrument default is a pure choice, discriminating all three states: a real session instrument seeds the filter, the explicit cross-instrument 'all' sentinel seeds the every-instrument view, and a session instrument that no longer resolves in the database falls back to every-instrument rather than to an empty screen. _(proof: seeds the filter from a resolvable session instrument, widens for all, and falls back when it no longer exists)_
- [ ] **ac-4** — An item's material is composed from links that already exist: the NAS references of every lesson the item is linked to, plus the item's own attachments, in a deterministic order. References are deduplicated BY PATH, so the same file referenced from two different lessons the item is linked to appears once, not twice. _(proof: lists a linked lesson's references with the item's attachments, deduplicating references by path)_
- [ ] **ac-5** — The counterexample that makes the composition meaningful rather than a broad sweep: references belonging to a lesson the item is NOT linked to never appear, and an item with no lessons and no attachments yields an empty list rather than an empty frame. _(proof: excludes references from lessons the item is not linked to and returns nothing when it has none)_
- [ ] **ac-6** — The two kinds of material open by completely different mechanisms -- a NAS reference resolves through the configured base URL, a local attachment through a blob -- so each composed entry carries which one it is. This is what stops a NAS reference being opened as a blob, or an attachment being pushed through the base URL and 404ing. Note the two types share no identity field (LessonRecording has path, AttachmentMeta has name), so they are never merged: deduplication is within a kind, never across them. _(proof: tags every entry with how it opens so a reference is never treated as an attachment)_
- [ ] **ac-7** — THE TRANSPORT-INDEPENDENCE RULE, three-way discriminating: a pasted URL that sits UNDER the configured base is stored RELATIVE, a pasted URL on a DIFFERENT origin is kept absolute rather than rewritten or rejected, and an already-relative path is stored unchanged. This is what keeps every reference working when the base URL changes. _(proof: stores a pasted URL under the base as relative, keeps a foreign origin absolute, and leaves a relative path alone)_
- [ ] **ac-8** — The same normalisation must never mangle input it cannot reason about: with no base URL configured, a pasted absolute URL is stored exactly as given, and a blank or unparseable base changes nothing. _(proof: stores a pasted URL unchanged when no usable base URL is configured)_
- [ ] **ac-9** — A stored reference survives a change of transport, which is the whole point: the same relative path resolves correctly under the LAN base and under a completely different base, proving no reference is pinned to one device's route to the NAS. _(proof: resolves the same relative reference correctly under two different base URLs)_
- [ ] **ac-10** — The Browse action is offered only when it can actually work, discriminating both directions: a valid configured base yields a browsable URL, while a blank or unparseable base yields none rather than a dead link or a same-origin request. _(proof: offers a browse target for a valid base and none for a blank or unparseable one)_
- [ ] **ac-11** — What may be shown inline during practice, decided as a pure property of each composed entry in itemFiles.ts rather than inline in the component, with its counterexample: a local image attachment is inline-renderable, while a PDF, an audio file and every NAS reference are open-only. This is the rule that keeps the practice screen from becoming a viewer and keeps the whole lane inside the existing production CSP -- a NAS image could not render inline under a static CSP in any case, because the NAS origin is not knowable at build time. _(proof: treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only)_
- [ ] **ac-12** — On the owner's own devices and against the PRODUCTION build, because none of this can be proven in Node. FIRST, the documentation compaction: open a fresh Claude Code session in this repo and confirm the `@AGENTS.md` import in the trimmed CLAUDE.md actually resolves, so the normative rules are still in context -- if that import silently fails, a builder would be left with an 865-byte file and no product rules at all, which is the one way this compaction could do harm. Run npm run preview (never dev -- the CSP is injected at build only) and confirm: (a) On the MacBook, an item that came from a class lists that class's video and score, and each opens on the NAS. (b) Settings' Browse link opens a real directory listing at the NAS base. (c) Copy a file URL from that listing, paste it as a lesson reference, save, and confirm the stored value is RELATIVE -- then change the base URL to a different form of the same host and confirm the reference still resolves. (d) Start a block on an item with a photo attached: the photo shows inline behind one closed disclosure, the timer keeps running while it is open, and the target signal still fires. (e) On the iPhone, Repertoire and Lessons open on the instrument you are practising and both still widen to all; search for a gusheh using the Persian keyboard and find it. (f) Also on the iPhone, tap a NAS link: if it is blocked, confirm whether the cause is the self-signed certificate prompt rather than the app, and record which -- a certificate prompt is infrastructure, not a defect in this lane. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx
- **back-up-and-restore** — touched via src/pages/Settings.tsx
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx
- **clear-a-due-review** — touched via src/domain/selectors.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/domain/recordings.ts, src/domain/selectors.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts
- **practise-todays-recommendation** — touched via src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx
- **prepare-for-the-next-class** — touched via src/pages/Lessons.tsx
- **run-a-session-plan** — touched via src/pages/ActiveBlock.tsx
- **sync-devices-via-github** — touched via src/pages/Settings.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **work-a-pathway-stage** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/selectors.ts matched changed file(s) src/domain/selectors.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/domain/recordings.ts, src/domain/selectors.ts matched changed file(s) src/domain/recordings.ts, src/domain/selectors.ts, src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/Lessons.tsx, src/domain/recordings.ts matched changed file(s) src/domain/recordings.ts, src/pages/Lessons.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/StartBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — unchanged

Insights and its selectors are untouched. This lane adds itemMatchesSearch/defaultInstrumentFilter to selectors.ts and a new pure itemFiles.ts; no existing selector, scoring input or PracticeItem field changed, and no persisted shape changed (SCHEMA_VERSION stays 11).

## work-a-pathway-stage — unchanged

StageDetail, PathwayDetail, pathways.ts and routines.ts are untouched and forbidden or out of scope. This lane only adds a Farsi-aware search predicate, an instrument-filter default, and a pure composition of existing lesson references and attachments; no PracticeItem field, stage derivation or routine behaviour changed.


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

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-find-it-and-open-it-farsi-search-one-ins-3c2c/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260910-find-it-and-open-it-farsi-search-one-ins-3c2c' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-find-it-and-open-it-farsi-search-one-ins-3c2c/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260910-find-it-and-open-it-farsi-search-one-ins-3c2c/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
