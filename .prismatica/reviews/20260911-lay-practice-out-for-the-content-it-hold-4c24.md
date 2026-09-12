---
id: 20260911-lay-practice-out-for-the-content-it-hold-4c24
contractId: 20260911-lay-practice-out-for-the-content-it-hold-4c24
patchId: 932971aeca7b573cf4a0a4c745157fe83ffad40a
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: "r-direction-aware-text: independently-authored values and isolate
      semantics"
    summary: The fourth rework still does not close the instrument-name family. It
      fixes seven enumerated sites, but several current renderers still leave
      editable instrument names bare, mix them into generated English strings,
      or force their containing card left. The new test only rejects
      instrumentName references already inside dir="ltr" or dir="rtl"; it cannot
      detect a missing dir="auto" isolate, aliases such as inst.name, or names
      interpolated into strings before rendering.
    counterexample: Rename an instrument to "سه‌تار (ایرانی).". Repertoire's
      PathwayCard forces textAlign:'left' and renders the name bare beside
      "now:" at src/pages/Repertoire.tsx:452-462. Session Plan embeds it bare in
      generated English headings at src/pages/SessionPlan.tsx:114 and :200. Wide
      Lessons leaves inst.name bare at src/pages/Lessons.tsx:143-148 and
      combines another bare name with lessonLabel at :226-230. Today's
      cross-instrument rows construct mixed strings before rendering at
      src/pages/Today.tsx:176, :185 and :198, so the name and English suffix
      cannot be independently isolated. ActiveBlock.tsx:86 and
      CloseBlock.tsx:196 also render the editable name bare while their comments
      still describe the eyebrow as English. All pass
      src/components/direction.test.ts:829 because that check examines only
      existing dir="ltr"/"rtl" elements and matches only instrumentName or the
      single {inst} alias. Fix and positively cover every current
      instrument-name renderer, including missing-isolate and alias/property
      forms, rather than adding only these examples to another enumerated list.
createdAt: 2026-09-12T10:48:56.272Z
sealedAt: 2026-09-12T11:00:44.674Z
---

# Review: Lay practice out for the content it holds — Persian-aware cards, roomier rows, a calmer close screen

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260911-lay-practice-out-for-the-content-it-hold-4c24
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/20
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `932971aeca7b573cf4a0a4c745157fe83ffad40a`

## The Delta this change was framed from

# The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

_approved · about "practise-todays-recommendation"_

## Today

Today shows two orchestration doorways before the app's actual answer, and from that card onward the app lays Persian content out backwards. A Farsi title resolves to direction:rtl and hugs the right edge of its cell while the English eyebrow above it, the reason below it and the 'due N days ago' caption under it all hug the left edge of the same cell — 80 dir="auto" attributes across 17 files and not one of them on a container. The due-review row leaves its title 113px of a 356px row, so a Farsi title truncates after about 13 characters. The close screen runs 1689px at 390x844 with the scheduling engine's controls — a native date field, a rationale paragraph squeezed into roughly 100px, and five review-type pills stacked vertically — fully expanded before the musician has said how it went. And in light theme the label on the primary Start button sits at 3.95:1, below AA.

## Instead

The content leads. A title and the details that belong to it sit in one group that carries the direction, so a Farsi item reads as one right-aligned block and an English item looks exactly as it does today — resolved natively by dir="auto", never by hand. The due-review row gives the title the room and keeps all three actions with their existing distinct meanings. Practise now moves directly under the instrument switcher, with Plan and Routines as two compact peer doorways beneath it. The close screen leads with how it went, what you noticed and what to try next time, and collapses the whole scheduling decision into one honest line carrying the date and type that will actually be saved, one tap from the full controls — computed from the same ReviewPlan that seeds the date field, so the date shown is still the date saved. And every small-text colour pair meets AA in both themes, with a test that recomputes the ratios from the shipped stylesheet so it cannot quietly regress.

## Keep

- A result stays required to save, and 'Save without a result' stays a reachable, deliberate way to record not_logged.
- A resultless close still changes no schedule: the item's date stays and its open Review row stays open; only a genuine decline clears and completes.
- Practising stays the only thing that completes a review and advances SM-2; 'Not now' still only hides for the day and '+2d' still moves the real date on both sides.
- Starting stays under 30 seconds, closing under 60, and a title stays the only required field anywhere.
- The Active screen stays deliberately empty — the ring, the elapsed figure, the two controls and the two existing disclosures. The wake lock and the boundary announcement are untouched and no recorded minute is affected.
- Session Plan and Routines stay two independent peer doorways, each with its own state and its own resume takeover; neither becomes a child of the other.
- No streak, score, badge, fabricated percentage or judging colour appears anywhere in the re-layout.
- English content renders exactly as it does today, and the shell — its 100dvh height model and its tab bar — is left entirely to the next lane.

## New assumptions

_none_

## Show me

On the iPhone, open Today on Setar. Practise now is the first thing under the instrument switcher, and the Farsi title with its English reason now sit as one right-aligned block instead of splitting across the card. Scroll to a due review: the Farsi title is legible instead of cut to a few characters, and its 'due N days ago' caption sits under it on the same edge. Switch to Classical Guitar — 'Study in C — full run' looks exactly as it always has, left-aligned. Start a block, finish it: the close screen asks how it went, what you noticed and what to try next time, and the whole review decision is one line, 'Review in 2 days · Repair', with a tap to open the date and type if you want them. Open it and the date is the same date the line just told you. Then switch to light theme and read the small grey metadata lines and the Start button's own label — both are legible now, and a test in the suite will fail if either ever drifts back.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **r-direction-aware-text: independently-authored values and isolate semantics** — The rework incorrectly classifies user-authored instrument names as generated English metadata and forces them to LTR. This leaves the mixed-content direction family incomplete, while the named source test explicitly accepts the broken sites.
  _counterexample:_ Set an instrument name to "سه‌تار (ایرانی)." and view an item card or item detail. src/components/ItemCard.tsx:33 and src/pages/ItemDetail.tsx:140 render instrumentName(...) inside dir="ltr", giving the Persian value the wrong bidi base. The same error appears in src/pages/PathwayDetail.tsx:100 and src/pages/Repertoire.tsx:286. Instrument names are editable user content and require their own dir="auto" isolate. src/components/direction.test.ts records these sites in LTR_ISOLATE_SITES, so the named direction test passes rather than detecting the semantic misclassification.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 1206eec..c181d57 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -811,16 +811,18 @@ fixed one exactly and had been missed), `ActiveBlock.tsx`'s mode/focus chips (th
 practice screen itself), `Attachments.tsx`'s and `ItemDetail.tsx`'s file kind/size line,
 `StartBlock.tsx`'s and `Today.tsx`'s item-type/status labels, `StageDetail.tsx`'s
 strand/status `meta` line, `PathwayDetail.tsx`'s "Current"/"Done"/item-count badges and
-its piece-count fallback, `Today.tsx`'s "routine running" indicator and its cross-
-instrument Overview row (a fixed sentence embedding the next item's own possibly-Farsi
-title — isolated the same way `StageDetail`'s undo banner already does, whole sentence
-under one `dir="ltr"`), and `Insights.tsx`'s generated observation sentences (several of
-which also embed an item's own title mid-sentence). One further site needed the OTHER
-isolate — `dir="auto"` for a value authored independently of its neighbour, not
-`dir="ltr"` for generated copy: `RoutineRunner.tsx`'s "Next: {label}" (the upcoming
-segment's own name). `PathwayDetail.tsx`'s pathway `source` field got the same
-treatment (free text beside the generated instrument name), but its stage's own
-`title` was tried the same way and REVERTED: `stage.title` is not authored
+its piece-count fallback, `Today.tsx`'s "routine running" indicator (at the time, one
+`dir="ltr"` isolate covering the whole phrase — a sealed review later found that this
+wrongly pinned the instrument name inside it too; see below) and its cross-instrument
+Overview row (a fixed sentence embedding the next item's own possibly-Farsi title —
+isolated the same way `StageDetail`'s undo banner already does, whole sentence under one
+`dir="ltr"`), and `Insights.tsx`'s generated observation sentences (several of which also
+embed an item's own title mid-sentence). One further site needed the OTHER isolate —
+`dir="auto"` for a value authored independently of its neighbour, not `dir="ltr"` for
+generated copy: `RoutineRunner.tsx`'s "Next: {label}" (the upcoming segment's own name).
+`PathwayDetail.tsx`'s pathway `source` field got the same treatment (free text beside the
+instrument name, at the time itself still wrongly isolated as `dir="ltr"` — see below),
+but its stage's own `title` was tried the same way and REVERTED: `stage.title` is not authored
 independently of `stage.code`, it is the SAME stage's own fuller name, and this file
 already settles (a few paragraphs up) that the two must AGREE on whichever direction
 the group resolves — isolating `stage.title` would have pulled it OUT of the button's
@@ -846,10 +848,11 @@ throughout every previous pass of this lane, invisible to a scanner whose entire
 is "detectable, not enumerated." Fixed by giving `<>` the same weight as any other
 opening tag. Re-running the FULL suite after the fix surfaced exactly this one
 violation — nothing else in the currently-scanned files was hiding behind the same
-bug — now closed with the same `dir="ltr"` (`instrumentName`, `ITEM_TYPE_LABELS`,
-"difficulty N/5", "saturated — consider resting") the rest of this section already
-established, while `stage.code` and the material label stay bare for the same reason
-`stage.title` does two paragraphs up. The lesson generalises beyond this one bug: an
+bug — now closed with the same `dir="ltr"` (at the time, `instrumentName` sat in this
+same list too — a sealed review later found that wrong; see below — plus
+`ITEM_TYPE_LABELS`, "difficulty N/5", "saturated — consider resting") the rest of this
+section already established, while `stage.code` and the material label stay bare for the
+same reason `stage.title` does two paragraphs up. The lesson generalises beyond this one bug: an
 example-driven fix only ever closes the examples in front of it; only re-deriving a
 shared helper's own correctness from what it claims to do (does `<>` open or close a
 nesting level? — the answer was always "both, and this code only handled one") finds
@@ -888,6 +891,33 @@ out of the comment and mis-attributing an unrelated tag") was silently possible
 file containing a stray apostrophe in plain prose, this codebase's Setar/Tar seed data
 included.
 
+**AN INSTRUMENT NAME IS THE OWNER'S OWN EDITABLE TEXT, NEVER GENERATED COPY — GETTING
+THIS BACKWARDS IS A CLASSIFICATION MISTAKE, NOT A MISSED LOCATION.** A sealed review
+found four sites (`ItemCard.tsx`, `ItemDetail.tsx`, `PathwayDetail.tsx`,
+`Repertoire.tsx`) pinning an item's or work's instrument name under `dir="ltr"` right
+alongside genuinely generated metadata like `ITEM_TYPE_LABELS` — Settings lets an
+instrument be renamed, Farsi included, so forcing a renamed instrument to LTR gives it
+the wrong bidi base, the exact defect every other isolate in this file exists to
+prevent. Auditing every remaining `LTR_ISOLATE_SITES` entry against its real source
+(not just the four named) found a fifth of the identical shape — `Today.tsx`'s "routine
+running" row bundled the instrument name and the fixed English suffix into ONE
+`dir="ltr"` span — and two more with no direction treatment AT ALL, invisible to that
+same audit because it can only see spans that already carry a `dir`: the Plan doorway's
+mismatched-instrument row (the exact twin of the routine row, same bundling, just
+missing the isolate rather than misusing it) and the weekly Balance row's instrument
+name, sitting bare inside a `.truncate` title span. All seven now isolate the
+instrument name on its own `dir="auto"` — nested one level in for the Balance row
+rather than on `.balance-row` itself, because that row is a CSS GRID and giving IT a
+resolved RTL direction would reverse its three columns for a Farsi instrument, flipping
+the bar and percentage to the other side. The fix generalises past these seven
+locations: `direction.test.ts` now also fails if any `dir="ltr"`/`"rtl"` isolate's body
+references `instrumentName` — a call, a bare identifier, or a property access like
+`b.instrumentName` all match, not only the call form (the widened check was itself the
+product of a caught regression: an earlier `\binstrumentName\(` version missed the
+Balance row's own property-access form) — or ItemCard's own `inst` alias for it, so a
+future regression anywhere in the file is caught by the SHAPE, not by whichever site a reviewer
+happened to name.
+
 **SEARCH GOES THROUGH THE FARSI-AWARE MATCHER AT EVERY SURFACE.** The data is
 authored in Farsi, so `title.toLowerCase().includes(query)` is not a search — it is
 a filter that can never match what the owner's keyboard emits: an iOS Arabic keyboard
diff --git a/DECISIONS.md b/DECISIONS.md
index 1eae4dd..c8a8efa 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -2,6 +2,26 @@
 
 Durable record of non-obvious choices. Newest first.
 
+## Fourth rejection: an instrument name is user text, not generated copy (2026-09-12)
+
+A sealed review found four sites (`ItemCard.tsx`, `ItemDetail.tsx`,
+`PathwayDetail.tsx`, `Repertoire.tsx`) forcing an item's or work's instrument name under
+`dir="ltr"` as if it were generated metadata like `ITEM_TYPE_LABELS` sitting next to
+it — but an instrument is renameable in Settings, Farsi included, so it is the owner's
+own editable text and needed its own `dir="auto"` isolate instead. Auditing every
+remaining `LTR_ISOLATE_SITES` entry against its real source (not just the four named)
+found a fifth of the identical shape (`Today.tsx`'s "routine running" row, bundling the
+instrument name and a fixed English suffix into one `dir="ltr"` span) and two with no
+direction treatment at all — invisible to that audit because it can only see spans that
+already carry a `dir`: the Plan doorway's mismatched-instrument row (the exact twin of
+the routine row) and the weekly Balance row's instrument name, bare inside a
+`.truncate` title span whose row is a CSS grid (isolating the row itself, rather than
+the name, would have reversed its three columns for a Farsi instrument). All seven now
+carry their own `dir="auto"`, and `direction.test.ts` bans the SHAPE going forward — any
+`dir="ltr"`/`"rtl"` isolate whose body references `instrumentName` (a call, a bare
+identifier, or a property access like `b.instrumentName`) fails — rather than
+re-closing whichever locations a reviewer happened to enumerate.
+
 ## Third rejection: an isolate must be inline, a marker needs room on both sides, and the scanner's own blind spot (2026-09-12)
 
 A third sealed review of the direction lane found the SAME family — mixed-content
diff --git a/src/components/ItemCard.tsx b/src/components/ItemCard.tsx
index ec0725a..4a0afbd 100644
--- a/src/components/ItemCard.tsx
+++ b/src/components/ItemCard.tsx
@@ -23,14 +23,18 @@ export default function ItemCard({ item, now = new Date() }: { item: PracticeIte
       <div className="row between" style={{ alignItems: 'flex-start' }}>
         <div className="grow" dir="auto">
           <div className="title-md">{item.title}</div>
-          {/* Instrument name, item-type and focus labels are generated
-              metadata, never user text — each gets its own dir="ltr" isolate
-              so it can't inherit a Farsi title's RTL base. Each stays its
-              own flex item (not merged under one wrapper) so the row's
-              existing gap spacing is unaffected — this is a direction-only
-              change. */}
+          {/* Item-type and focus labels are generated metadata, never user
+              text — each gets its own dir="ltr" isolate so it can't inherit
+              a Farsi title's RTL base. The instrument name is the OWNER'S OWN
+              editable text (Settings lets it be renamed, e.g. into Farsi), so
+              it gets dir="auto" instead — forcing it LTR would give a Farsi
+              instrument name the wrong bidi base, the exact defect this
+              isolate exists to prevent for everything else on the line. Each
+              stays its own flex item (not merged under one wrapper) so the
+              row's existing gap spacing is unaffected — this is a
+              direction-only change. */}
           <div className="row-wrap small dim" style={{ marginTop: 3 }}>
-            <span dir="ltr">{inst}</span>
+            <span dir="auto">{inst}</span>
             <span className="faint">·</span>
             <span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>
             {item.primaryFocus && (
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index 3de8633..606a5ae 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -136,6 +136,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
   { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
   { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'grow' },
+  { file: 'components/ItemCard.tsx', tagName: 'span', classValue: '' },
   { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'small dim' },
   { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
   { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
@@ -148,6 +149,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/Insights.tsx', tagName: 'th', classValue: 'dim' },
   { file: 'pages/Insights.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/ItemDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
+  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'list-row card-link' },
   { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: 'list-row' },
@@ -162,6 +164,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/Materials.tsx', tagName: 'div', classValue: 'grow' },
   { file: 'pages/PathwayDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
   { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
+  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/PathwayDetail.tsx', tagName: 'p', classValue: 'page-sub' },
   { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'card card-quiet small dim' },
   { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'small dim' },
@@ -173,6 +176,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
+  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Repertoire.tsx', tagName: 'link', classValue: 'row between small card-link' },
   { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'row between' },
   { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: '' },
@@ -187,8 +191,10 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/TeacherReport.tsx', tagName: 'pre', classValue: 'pre' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
+  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
+  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'button', classValue: 'grow' },
@@ -196,6 +202,7 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
   { file: 'pages/Today.tsx', tagName: 'link', classValue: 'list-row card-link' },
   { file: 'pages/Today.tsx', tagName: 'div', classValue: 'grow' },
+  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
 ];
 
 // --- reading the source -----------------------------------------------------
@@ -550,6 +557,29 @@ const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.form}</span>' },
   { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.composer}</span>' },
   { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.gusheh}</span>' },
+  // Instrument names are the OWNER'S OWN editable text (renameable in
+  // Settings, Farsi included), never generated copy — a sealed review found
+  // four sites forcing them to dir="ltr" as if they were generated metadata,
+  // and this file's own audit of every remaining LTR_ISOLATE_SITES entry
+  // found a fifth (Today.tsx's "routine running" row) with the identical
+  // defect. All five now isolate the instrument name on its own dir="auto".
+  { file: 'components/ItemCard.tsx', snippet: '<span dir="auto">{inst}</span>' },
+  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="auto">{instrumentName(db, item.instrumentId)}</span>' },
+  {
+    file: 'pages/PathwayDetail.tsx',
+    snippet: "<span dir=\"auto\">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>",
+  },
+  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{instrumentName(db, work.instrumentId)}</span>' },
+  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{instrumentName(db, running?.instrumentId)}</span>' },
+  // Same audit, two more sites with no dir treatment at all rather than a
+  // forced dir="ltr" one — just as wrong, and easier to miss because nothing
+  // in the source marked them. PlanCard's mismatched-instrument row was the
+  // exact twin of the RoutinesCard row above it; the weekly balance row's
+  // instrument name sits inside a CSS GRID (.balance-row), so its isolate is
+  // nested one level in rather than on the row, or a Farsi name would flip
+  // the grid's three columns.
+  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span>' },
+  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{b.instrumentName}</span>' },
 ];
 
 /**
@@ -567,7 +597,8 @@ const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/Today.tsx', snippet: 'due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">Running far past its target' },
-  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{instrumentName(db, running?.instrumentId)} routine running ▸</span>' },
+  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> routine running ▸</span>' },
+  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> plan running ▸</span>' },
   { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
   {
     file: 'pages/Today.tsx',
@@ -576,7 +607,6 @@ const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{next.reason}</span>' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">Study source: </span>' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">\n                  {a.kind} · {formatBytes(a.size)}' },
-  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{instrumentName(db, item.instrumentId)}</span>' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">difficulty {item.difficulty}/5</span>' },
   { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>' },
@@ -586,10 +616,6 @@ const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
   { file: 'pages/StageDetail.tsx', snippet: '{routine.segments.length} segments · {total} min{bound' },
   { file: 'pages/StageDetail.tsx', snippet: '<span dir="ltr">{meta.join(\' · \')}</span>' },
   { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
-  {
-    file: 'pages/PathwayDetail.tsx',
-    snippet: "<span dir=\"ltr\">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>",
-  },
   { file: 'pages/PathwayDetail.tsx', snippet: "<span className=\"badge tone-progress\" dir=\"ltr\">{isPinned ? 'Current · pinned' : 'Current'}</span>" },
   { file: 'pages/PathwayDetail.tsx', snippet: '<span className="badge tone-good" dir="ltr">Done</span>' },
   { file: 'pages/PathwayDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems' },
@@ -609,11 +635,9 @@ const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
     file: 'pages/Repertoire.tsx',
     snippet: '<span className="tiny faint" dir="ltr">\n              {g.works.length} work',
   },
-  { file: 'pages/Repertoire.tsx', snippet: '<span dir="ltr">{instrumentName(db, work.instrumentId)}</span>' },
   { file: 'pages/Repertoire.tsx', snippet: '<span dir="ltr">\n                {work.lastPractisedAt' },
   { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n            On your NAS' },
   { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n              On this device' },
-  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{inst}</span>' },
   { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
   { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{FOCUS_LABELS[item.primaryFocus]}</span>' },
   { file: 'components/Attachments.tsx', snippet: '<span dir="ltr">\n            {att.kind} · {formatBytes(att.size)}' },
@@ -789,6 +813,35 @@ describe('direction lives on the group', () => {
     expect(violations).toEqual([]);
   });
 
+  // A sealed review found FOUR sites forcing an instrument name — the OWNER'S
+  // OWN editable text, never generated copy — under dir="ltr" as if it were
+  // metadata like ITEM_TYPE_LABELS sitting next to it. Auditing the rest of
+  // LTR_ISOLATE_SITES by hand found three more of the identical shape. A
+  // location list closes only the sites that happened to exist today; this
+  // bans the SHAPE, so a future dir="ltr"/"rtl" wrapped around an instrument
+  // name fails here regardless of which file it turns up in. The pattern is
+  // deliberately NOT anchored to a call — `\binstrumentName\(` alone missed
+  // `{b.instrumentName}` (a property access, no call, no parenthesis) in the
+  // very same audit that added this test — so it also matches a bare
+  // `instrumentName` identifier, covering a property access and a value
+  // passed through as a prop (e.g. `TeacherReport.tsx`'s local `instrumentName`
+  // variable), not just a direct call.
+  it('no dir="ltr"/"rtl" isolate wraps an instrument name', () => {
+    const violations: string[] = [];
+    for (const file of sourceFiles()) {
+      const src = stripComments(SOURCES[file]);
+      for (const site of isolateSites(file)) {
+        const openAt = src.lastIndexOf('<', site.at);
+        const body = elementBody(src, site.text, openAt);
+        const bodyText = src.slice(body.start, body.end);
+        if (/\binstrumentName\b|\{inst\}/.test(bodyText)) {
+          violations.push(`${file}:${site.line} — an instrument name sits inside a dir="ltr"/"rtl" isolate`);
+        }
+      }
+    }
+    expect(violations).toEqual([]);
+  });
+
   it('a list containing a direction-variable item reserves marker room on both sides', () => {
     const violations = sourceFiles()
       .flatMap(listSites)
diff --git a/src/pages/ItemDetail.tsx b/src/pages/ItemDetail.tsx
index fe55765..c6ba3fb 100644
--- a/src/pages/ItemDetail.tsx
+++ b/src/pages/ItemDetail.tsx
@@ -130,14 +130,17 @@ export default function ItemDetail() {
           </h1>
           <StatusBadge status={item.status} />
         </div>
-        {/* instrumentName/ITEM_TYPE_LABELS are generated English metadata,
-            never user text — each gets its own dir="ltr" isolate. stage.code
-            and the material label stay bare: both are user-authored and can
-            be Farsi themselves (the Setar/Tar seeds author stage codes in
-            Farsi too), so they correctly share the group's own resolved
-            direction rather than being pinned to a foreign one. */}
+        {/* ITEM_TYPE_LABELS is generated English metadata, never user text —
+            it gets its own dir="ltr" isolate. The instrument name is the
+            owner's own editable text (renameable in Settings, Farsi
+            included), so it gets dir="auto" instead of being pinned to a
+            foreign LTR base. stage.code and the material label stay bare:
+            both are user-authored and can be Farsi themselves (the Setar/Tar
+            seeds author stage codes in Farsi too), so they correctly share
+            the group's own resolved direction rather than being pinned to a
+            foreign one. */}
         <div className="row-wrap small dim">
-          <span dir="ltr">{instrumentName(db, item.instrumentId)}</span>
+          <span dir="auto">{instrumentName(db, item.instrumentId)}</span>
           <span className="faint">·</span>
           <span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>
           {stage && (
diff --git a/src/pages/PathwayDetail.tsx b/src/pages/PathwayDetail.tsx
index d2ee7d0..a8d8c8f 100644
--- a/src/pages/PathwayDetail.tsx
+++ b/src/pages/PathwayDetail.tsx
@@ -93,11 +93,14 @@ export default function PathwayDetail() {
       ) : (
         <header className="stack-sm" dir="auto">
           <h1 className="page-title">{pathway.name}</h1>
-          {/* The instrument name is generated metadata (its own dir="ltr"
-              isolate); pathway.source is authored independently (its own
-              dir="auto" isolate) — never one isolate speaking for both. */}
+          {/* The instrument name is the owner's own editable text (renameable
+              in Settings, Farsi included) — its own dir="auto" isolate, same
+              as pathway.source right after it, so neither is pinned to a
+              foreign LTR base or speaks for the other. The 'General'
+              fallback (no instrument) is plain ASCII and resolves the same
+              way under dir="auto". */}
           <div className="tiny faint">
-            <span dir="ltr">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
+            <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
             {pathway.source && (
               <>
                 {' · '}
diff --git a/src/pages/Repertoire.tsx b/src/pages/Repertoire.tsx
index f18c151..9fe9da3 100644
--- a/src/pages/Repertoire.tsx
+++ b/src/pages/Repertoire.tsx
@@ -268,10 +268,12 @@ function WorkRow({
           <div className="truncate">
             {work.title}
           </div>
-          {/* form/composer/gusheh are authored independently of the work's
-              own title (their own dir="auto" isolates); the instrument name
-              and last-practised phrase are generated metadata (their own
-              dir="ltr" isolates) — never one isolate speaking for all of
+          {/* form/composer/gusheh and the instrument name are all authored
+              independently of the work's own title (their own dir="auto"
+              isolates — the instrument name is the owner's own editable
+              text, renameable in Settings, Farsi included, never generated
+              copy); the last-practised phrase is generated metadata (its own
+              dir="ltr" isolate) — never one isolate speaking for all of
               them, and never joined into one bare string that inherits
               whichever direction the title happened to resolve. */}
           <div className="tiny faint truncate">
@@ -283,7 +285,7 @@ function WorkRow({
                   gusheh: <span dir="auto">{work.persian.gusheh}</span>
                 </span>
               ) : null,
-              <span dir="ltr">{instrumentName(db, work.instrumentId)}</span>,
+              <span dir="auto">{instrumentName(db, work.instrumentId)}</span>,
               <span dir="ltr">
                 {work.lastPractisedAt ? `last ${relativeFromDateTime(work.lastPractisedAt, now)}` : 'not practised yet'}
               </span>,
diff --git a/src/pages/Today.tsx b/src/pages/Today.tsx
index 24d37b7..86f866a 100644
--- a/src/pages/Today.tsx
+++ b/src/pages/Today.tsx
@@ -256,7 +256,14 @@ function PlanCard({ instrumentId }: { instrumentId: string }) {
     return (
       <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate('/plan')}>
         <span style={{ fontWeight: 600, opacity: 0.7 }}>Plan this session</span>
-        <span className="faint small">{instrumentName(db, activePlan.instrumentId)} plan running ▸</span>
+        {/* Same split as the Routines doorway below: the instrument name is
+            the owner's own editable text (its own dir="auto" isolate, never
+            bare alongside fixed English), and "plan running ▸" keeps its own
+            dir="ltr" isolate as generated page copy. */}
+        <span className="faint small">
+          <span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span>
+          <span dir="ltr"> plan running ▸</span>
+        </span>
       </button>
     );
   }
@@ -334,13 +341,17 @@ function RoutinesCard({ instrumentId }: { instrumentId: string }) {
       <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(to)}>
         <span style={{ fontWeight: 600, opacity: 0.7 }}>Routines</span>
         <div dir="auto" style={{ minWidth: 0 }}>
-          {/* Fixed English page copy, never user text — its own dir="ltr"
-              isolate. Inline (span), not dir="ltr" on this block: a block
-              isolate resolves its OWN text-align independently of the
+          {/* The instrument name is the owner's own editable text (renameable
+              in Settings, Farsi included) — its own dir="auto" isolate, not
+              lumped into the fixed English suffix that follows it. "routine
+              running ▸" is page copy, never user text, so it keeps its own
+              dir="ltr" isolate. Both inline (span), not dir on this block: a
+              block isolate resolves its OWN text-align independently of the
               group, which is the exact split a rejected review found
               elsewhere in this lane. */}
           <div className="faint small truncate">
-            <span dir="ltr">{instrumentName(db, running?.instrumentId)} routine running ▸</span>
+            <span dir="auto">{instrumentName(db, running?.instrumentId)}</span>
+            <span dir="ltr"> routine running ▸</span>
           </div>
         </div>
       </button>
@@ -868,7 +879,16 @@ function OverviewView({ now }: { now: Date }) {
           ) : (
             balance.map((b) => (
               <div key={b.instrumentId} className="balance-row">
-                <span className="small truncate">{b.instrumentName}</span>
+                {/* The instrument name is the owner's own editable text — its
+                    own dir="auto" isolate, nested inside .truncate rather than
+                    on it (a title class may never carry dir="auto" directly).
+                    Not on the row itself: .balance-row is a CSS grid and
+                    giving it a resolved RTL direction would reverse its three
+                    columns, jumping the bar and percentage to the other side
+                    for a Farsi instrument — this isolates the text only. */}
+                <span className="small truncate">
+                  <span dir="auto">{b.instrumentName}</span>
+                </span>
                 <span className="balance-track">
                   <span className="balance-fill" style={{ width: `${b.percent}%` }} />
                 </span>
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
a manual- and an auto-mode item) reads `item.reviewMode` directly rather than calling
`planNextReview` a second time inside `pickResult` — CloseBlock keeps its single
derivation; this is a boolean gate on whether one exists at all, not a second value that
could disagree with it.

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
  - A detail that is FREE TEXT the owner typed (ActiveBlock's `constraint`/`problem`,
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
- **An independently-authored value** — a question, a problem, an observation, a
  pathway's own description or note — carries its own `dir="auto"` isolate for the same
  reason `ActiveBlock`'s `constraint`/`problem`/`previousNextAction` already do: its
  language cannot be assumed from the title sitting next to it. The counterexample:
  `ClassQuestions`' question/problem/last-observation sat bare in the title's `<li>`
  group with no isolate of any kind — unlike `ActiveBlock`'s established shape (a fixed
  English label left bare, immediately followed by the value in its own `dir="auto"`),
  which `ClassQuestions` now matches rather than inventing a third pattern.

**THIS IS DELIBERATELY NOT "no bare Latin text in a group."** A short fixed label
immediately followed by its own isolate — `Constraint: ` before
`<span dir="auto">{value}</span>`, `Problem: ` before the same shape in
`ClassQuestions` — stays bare on purpose; flagging it would force a change to an
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
expression whose content is opaque, like `{q.currentProblem}`) needing `dir="auto"`, or
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

**A NATIVE LIST MARKER FOLLOWS ITS OWN LIST ITEM'S DIRECTION, NOT THE LIST'S.** The same
review found `ClassQuestions.tsx`'s `<ol>` reserving gutter space with
`paddingInlineStart` alone while each `<li>` resolves its OWN direction via `dir="auto"`:
the browser positions each `<li>`'s outside `::marker` on THAT li's own start edge, so a
Farsi item's marker lands on the RIGHT — the side the `<ol>` reserved no room for — and
gets pressed against or past the content border on both Mac and iPhone. Fixed with
`paddingInline` (both sides) instead of `paddingInlineStart`, so the marker has room
whichever side it lands on; `direction.test.ts` now scans every `<ol>`/`<ul>` on the
recorded surfaces and fails if one contains a `dir="auto"` `<li>` without symmetric room
on both sides — a shape check, not a location list, so a future list with the same
mismatch fails on its own.

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

### DECISIONS.md

```
# Decisions

Durable record of non-obvious choices. Newest first.

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

### src/components/ItemCard.tsx

```
import { Link } from 'react-router-dom';
import {
  FOCUS_LABELS,
  ITEM_TYPE_LABELS,
  itemOwnedAttachments,
  type PracticeItem,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Stars, StatusBadge } from './ui';
import { ClockIcon, FlagIcon, PaperclipIcon } from './icons';
import { formatMinutes, relativeDay, relativeFromDateTime } from './format';

export default function ItemCard({ item, now = new Date() }: { item: PracticeItem; now?: Date }) {
  const db = useStore((s) => s.db);
  const inst = instrumentName(db, item.instrumentId);
  // ownerId alone can collide with a lesson's id, so count only via the
  // shared ownerType+ownerId predicate — never a lesson's own attachment.
  const fileCount = itemOwnedAttachments(db.attachments, item.id).length;

  return (
    <Link to={`/items/${item.id}`} state={{ from: '/repertoire' }} className="card card-link">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="grow" dir="auto">
          <div className="title-md">{item.title}</div>
          {/* Item-type and focus labels are generated metadata, never user
              text — each gets its own dir="ltr" isolate so it can't inherit
              a Farsi title's RTL base. The instrument name is the OWNER'S OWN
              editable text (Settings lets it be renamed, e.g. into Farsi), so
              it gets dir="auto" instead — forcing it LTR would give a Farsi
              instrument name the wrong bidi base, the exact defect this
              isolate exists to prevent for everything else on the line. Each
              stays its own flex item (not merged under one wrapper) so the
              row's existing gap spacing is unaffected — this is a
              direction-only change. */}
          <div className="row-wrap small dim" style={{ marginTop: 3 }}>
            <span dir="auto">{inst}</span>
            <span className="faint">·</span>
            <span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>
            {item.primaryFocus && (
              <>
                <span className="faint">·</span>
                <span dir="ltr">{FOCUS_LABELS[item.primaryFocus]}</span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.currentProblem && (
        <div className="small dim" dir="auto" style={{ marginTop: 8 }}>
          {item.currentProblem}
        </div>
      )}

      <div className="row-wrap tiny faint" style={{ marginTop: 10, gap: 12, rowGap: 6 }}>
        <span className="row" style={{ gap: 5 }}>
          <Stars value={item.importance} /> <span>importance</span>
        </span>
        <span>difficulty {item.difficulty}/5</span>
        <span className="mono-num">{item.timesPractised}× · {formatMinutes(item.totalMinutes)}</span>
        <span>last {relativeFromDateTime(item.lastPractisedAt, now)}</span>
        {item.nextReviewDate && (
          <span className="row" style={{ gap: 4 }}>
            <ClockIcon width={12} height={12} /> review {relativeDay(item.nextReviewDate, now)}
          </span>
        )}
        {item.teacherQuestion && (
          <span className="row warn-flag" style={{ gap: 4 }}>
            <FlagIcon width={12} height={12} /> teacher
          </span>
        )}
        {fileCount > 0 && (
          <span className="row" style={{ gap: 4 }}>
            <PaperclipIcon width={12} height={12} /> {fileCount}
          </span>
        )}
        {item.saturationWarning && <span className="warn-flag">saturated</span>}
      </div>
    </Link>
  );
}
```

### src/components/direction.test.ts

```
import { describe, expect, it } from 'vitest';

/**
 * Layout follows the direction of the content it shows.
 *
 * A title and the details that belong to it sit in ONE group that carries
 * `dir="auto"`, so a Persian item reads as one right-aligned block instead of
 * splitting across the card — the title hugging one edge while its own caption
 * hugs the other. Direction is resolved natively by the browser from the first
 * strong character; nothing here detects or reorders text in JavaScript.
 *
 * The completion boundary is mechanical, not a matter of care. After this lane
 * `dir="auto"` appears on GROUPS and on free-text FIELDS — never bare on a
 * title element. This test asserts BOTH halves, so a missed title fails and a
 * whole skipped file fails; "fixing" a file by DELETING the attribute fails
 * too, which is important because that would break Farsi rendering outright.
 *
 * jsdom cannot evaluate any of this — it resolves no `dir=auto` and computes no
 * `text-align` — so this reads the source instead, and the owner's device check
 * (ac-6) is what proves the rendering. This test proves COMPLETENESS.
 */

/**
 * Every page and shared component, as source text. Read through Vite's raw
 * loader rather than node:fs: `src` is compiled without node types, and a glob
 * means a NEW file is swept in automatically rather than needing to be
 * remembered.
 */
const under = (dir: string, modules: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(modules).map(([path, source]) => [`${dir}/${path.split('/').pop()}`, source as string]),
  );

const SOURCES: Record<string, string> = {
  ...under('pages', import.meta.glob('../pages/*.tsx', { query: '?raw', import: 'default', eager: true })),
  ...under('components', import.meta.glob('./*.tsx', { query: '?raw', import: 'default', eager: true })),
};

/** Classes that mark an element as a TITLE — direction may not sit on these. */
const TITLE_CLASSES = ['truncate', 'title-md', 'page-title', 'stage-unit-title'];

/** Native controls own their own text; direction on them is a FIELD, not a group. */
const FIELD_TAGS = ['input', 'textarea', 'select'];

/**
 * Every surface that renders user-authored text and must therefore carry
 * direction on at least one group. Recorded here (and in AGENTS.md) so the next
 * lane inherits the list rather than re-deriving it.
 */
const SURFACES = [
  'pages/Today.tsx',
  'pages/StartBlock.tsx',
  'pages/ActiveBlock.tsx',
  'pages/CloseBlock.tsx',
  'pages/Repertoire.tsx',
  'pages/ItemDetail.tsx',
  'pages/Lessons.tsx',
  'pages/PathwayDetail.tsx',
  'pages/StageDetail.tsx',
  'pages/SessionPlan.tsx',
  'pages/RoutineRunner.tsx',
  'pages/Materials.tsx',
  'pages/Insights.tsx',
  'pages/TeacherReport.tsx',
  'components/ItemCard.tsx',
  'components/ItemMaterial.tsx',
  'components/ClassQuestions.tsx',
  'components/Attachments.tsx',
];

/**
 * Titles that genuinely have no group to join, listed so the exception is
 * VISIBLE to a reviewer rather than silently left behind. Each entry must still
 * match a real site — a stale entry fails the test below.
 */
const ALLOWED_TITLE_SITES: { file: string; snippet: string; why: string }[] = [
  // EMPTY, and that is the finding: every title on every surface turned out to
  // have a group it could join — the catalogue row's own text column, the row a
  // lone title shares with its badge, or a wrapper drawn around the title and
  // the caption beneath it. An entry here would be a title the sweep could not
  // reach; the list is kept (and asserted below) so the next one is visible
  // rather than silent.
];

/**
 * Genuine exceptions to `unexemptedPhrase`'s 2+-token rule, visible for the
 * same reason `ALLOWED_TITLE_SITES` is: a stale entry (its `tagSnippet` no
 * longer found on the named group) fails the test below, so an exception
 * can't quietly outlive the code it was written for. Both entries here are
 * TWO+ opaque data expressions that read as a single compound VALUE, not a
 * title split from a foreign caption — the shape this whole family exists to
 * catch:
 * - `{sp.done}/{sp.total}` (PathwayDetail's stage progress) is a numeric
 *   counter ("3/5") — digits carry no bidi risk on their own, unlike an
 *   English WORD dropped into an RTL run.
 * - `` `${pathway.name} — ` `` followed by `{stage.code}` (ItemDetail's
 *   breadcrumb) is one continuous "Pathway — Stage" label built from two
 *   fields, exactly the same kind of compound anchor a lone title already
 *   forms with the badge it sits next to elsewhere in this file — there is
 *   no separate "caption" here to have its own opinion about direction.
 */
const UNEXEMPTED_PHRASE_ALLOWLIST: { file: string; tagSnippet: string; why: string }[] = [
  {
    file: 'pages/PathwayDetail.tsx',
    tagSnippet: '<button className="grow" dir="auto"',
    why: '{sp.done}/{sp.total} is a numeric progress counter, not English words',
  },
  {
    file: 'pages/ItemDetail.tsx',
    tagSnippet: 'stage.pathwayId',
    why: 'pathway name + stage code is one compound breadcrumb label, not a title plus a foreign caption',
  },
];

/**
 * Every group-level `dir="auto"` site, recorded in source order — duplicates
 * included, because three bare `<div dir="auto">` in the same file (Today.tsx
 * has several) are three separate SITES, not one collapsed entry. This is
 * what "every listed surface has A group" (below) cannot see: a file keeps
 * passing that check as long as ONE of its groups survives, so deleting the
 * Practise-now card's own `dir="auto"` — the exact regression a rejected
 * review found — left Today.tsx's other, unrelated groups to vouch for it.
 * Comparing the WHOLE ordered inventory instead means removing any one of
 * these sites — anywhere in any file — shrinks or reorders the array and
 * fails here, whether or not that file has other groups left.
 *
 * Same visibility contract as ALLOWED_TITLE_SITES: this is a recorded ledger,
 * not a derivation, so a legitimate new group site must be added here (the
 * "keeps every recorded group site current" test below fails until it is),
 * exactly as a title exception must be added to the allowlist above.
 */
const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string }[] = [
  { file: 'components/Attachments.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'components/ClassQuestions.tsx', tagName: 'li', classValue: '' },
  { file: 'components/ClassQuestions.tsx', tagName: 'div', classValue: 'small' },
  { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ClassQuestions.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemCard.tsx', tagName: 'span', classValue: '' },
  { file: 'components/ItemCard.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'components/ItemMaterial.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/ActiveBlock.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/CloseBlock.tsx', tagName: 'div', classValue: 'stack-sm' },
  { file: 'pages/Insights.tsx', tagName: 'th', classValue: 'dim' },
  { file: 'pages/Insights.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'div', classValue: 'list-row' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/ItemDetail.tsx', tagName: 'span', classValue: 'dim' },
  { file: 'pages/ItemDetail.tsx', tagName: 'link', classValue: 'link' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Lessons.tsx', tagName: 'div', classValue: 'tiny dim' },
  { file: 'pages/Lessons.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Materials.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Materials.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'header', classValue: 'stack-sm' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'p', classValue: 'page-sub' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'card card-quiet small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: 'small dim' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/PathwayDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'section', classValue: 'stack-sm' },
  { file: 'pages/Repertoire.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Repertoire.tsx', tagName: 'link', classValue: 'row between small card-link' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'row between' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'div', classValue: 'tiny faint' },
  { file: 'pages/RoutineRunner.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/SessionPlan.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: 'card card-quiet row between small' },
  { file: 'pages/StageDetail.tsx', tagName: 'button', classValue: 'stage-unit-text' },
  { file: 'pages/StageDetail.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/StartBlock.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/TeacherReport.tsx', tagName: 'pre', classValue: 'pre' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'button', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: '' },
  { file: 'pages/Today.tsx', tagName: 'link', classValue: 'list-row card-link' },
  { file: 'pages/Today.tsx', tagName: 'div', classValue: 'grow' },
  { file: 'pages/Today.tsx', tagName: 'span', classValue: '' },
];

// --- reading the source -----------------------------------------------------

function sourceFiles(): string[] {
  return Object.keys(SOURCES).sort();
}

interface Site {
  file: string;
  line: number;
  tagName: string;
  classValue: string;
  text: string;
  at: number;
}

/** The opening tag that an index sits inside, brace- and quote-aware. */
function enclosingTag(src: string, at: number): string {
  const start = src.lastIndexOf('<', at);
  let depth = 0;
  let i = start + 1;
  while (i < src.length) {
    const c = src[i];
    if (c === '{') depth += 1;
    else if (c === '}') depth -= 1;
    else if (c === '"' || c === "'") {
      const end = src.indexOf(c, i + 1);
      if (end < 0) break;
      i = end;
    } else if (c === '>' && depth === 0) break;
    i += 1;
  }
  return src.slice(start, i + 1);
}

/** The raw text of a tag's className attribute (string or expression). */
function classNameOf(tag: string): string {
  const at = tag.indexOf('className=');
  if (at < 0) return '';
  const from = at + 'className='.length;
  const opener = tag[from];
  if (opener === '"' || opener === "'") {
    const end = tag.indexOf(opener, from + 1);
    return end < 0 ? tag.slice(from + 1) : tag.slice(from + 1, end);
  }
  if (opener !== '{') return '';
  let depth = 0;
  for (let i = from; i < tag.length; i += 1) {
    if (tag[i] === '{') depth += 1;
    else if (tag[i] === '}') {
      depth -= 1;
      if (depth === 0) return tag.slice(from + 1, i);
    }
  }
  return tag.slice(from + 1);
}

/**
 * Blank out `//` and `/* *\/` comments before scanning — a prose comment that
 * mentions `dir="auto"` (this file is full of them, and rightly so) is not an
 * attribute, and matching it anyway produces a phantom site: at best one with
 * no enclosing tag, at worst `enclosingTag` walking backward out of the
 * comment and mis-picking an unrelated real tag from earlier in the file.
 * String and template literals are copied through verbatim — that is where a
 * REAL `dir="auto"` attribute value lives — and every character removed is
 * replaced with a space (newlines kept as newlines) so line numbers and
 * offsets into the rest of the source are unaffected.
 *
 * A `'`/`"` is treated as a real string delimiter only if its MATCHING quote
 * shows up before the next newline. A genuine JS string/JSX attribute value
 * in this codebase is always single-line, so this is a safe bound — and it
 * is a NECESSARY one: plain JSX text containing an apostrophe ("That stage
 * doesn't exist.") is not a string at all, and treating it as one made the
 * scanner consume every real comment and tag after it — including this
 * file's OWN prose, once a comment happened to quote `dir="ltr"` inside that
 * unterminated span — as literal, unstripped text. A backtick template
 * literal has no such single-line guarantee in general (this codebase's
 * few multi-line ones are template literals), so it keeps the unbounded
 * scan.
 */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const two = src.slice(i, i + 2);
    if (two === '//') {
      while (i < src.length && src[i] !== '\n') {
        out += ' ';
        i += 1;
      }
    } else if (two === '/*') {
      out += '  ';
      i += 2;
      while (i < src.length && src.slice(i, i + 2) !== '*/') {
        out += src[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      out += '  ';
      i += 2;
    } else if (src[i] === '"' || src[i] === "'") {
      const quote = src[i];
      const lineEnd = src.indexOf('\n', i + 1);
      const searchEnd = lineEnd < 0 ? src.length : lineEnd;
      const close = src.indexOf(quote, i + 1);
      if (close < 0 || close > searchEnd) {
        // No same-line match — an apostrophe/quote in plain text, not a
        // real string. Pass it through and keep scanning normally right
        // after it, so a later quote on the same or a later line gets its
        // own fresh (and likely correct) chance to pair up.
        out += src[i];
        i += 1;
        continue;
      }
      out += quote;
      i += 1;
      while (i < close) {
        if (src[i] === '\\' && i + 1 < close) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      out += src[i];
      i += 1;
    } else if (src[i] === '`') {
      const quote = src[i];
      out += quote;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < src.length) {
          out += src[i] + src[i + 1];
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      if (i < src.length) {
        out += src[i];
        i += 1;
      }
    } else {
      out += src[i];
      i += 1;
    }
  }
  return out;
}

function directionSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="auto"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
      at,
    });
  }
  return sites;
}

const isTitle = (site: Site) => TITLE_CLASSES.some((c) => new RegExp(`\\b${c}\\b`).test(site.classValue));
const isField = (site: Site) => FIELD_TAGS.includes(site.tagName);
const isGroup = (site: Site) => !isTitle(site) && !isField(site);

const allowed = (site: Site) =>
  ALLOWED_TITLE_SITES.some((e) => e.file === site.file && site.text.includes(e.snippet));

// --- mixed-content groups: a child's OWN bidi base, not just the group's ---
//
// A rejected review found that the inventory above proves a GROUP carries
// direction, but nothing proved that a fixed English sentence or an
// independently-authored value sitting INSIDE that group has a bidi base of
// its own. A Farsi title makes the whole group resolve RTL; anything else in
// that subtree with no `dir` of its own is exposed to that same RTL base —
// which is exactly right for a caption that belongs to the title (that is
// the whole point of grouping), but wrong for fixed page copy or a separately
// authored value that could be a different script entirely.
//
// This can't be reduced to "no bare Latin text in a group": a short fixed
// label immediately followed by its own isolate — `Constraint: ` before
// `<span dir="auto">{value}</span>`, the established shape ActiveBlock set —
// is deliberately left bare, and flagging it would force changes to an
// already-correct, already-reviewed pattern. What actually breaks is a real
// PHRASE (2+ words) that reaches the end of the group with nothing to isolate
// it: `unexemptedPhrase` walks a group's body in source order, accumulating
// exposed literal text (skipping `{…}` expressions, whose content is opaque
// from source) into a run, and clears that run the moment it is immediately
// followed by an element carrying its own `dir=` — the run is exempted
// regardless of length, because whatever risk existed is now the isolate's
// to own. Only a run that survives to the end of the group's body, and that
// reads as a real phrase, is flagged.

/**
 * The element's body span: from just after its own opening tag's `>` to just
 * after its matching closing tag (empty for a self-closing tag). Depth
 * tracking is generic — any opened tag increases it, any closed tag
 * decreases it — since well-formed JSX nests properly regardless of name.
 *
 * A React Fragment shorthand (`<>…</>`) is EVERY bit as much an opening/
 * closing pair as a named tag, and must be counted as one: `</>` starts with
 * `/` so the CLOSING branch below already matched it (correctly decrementing
 * depth), but `<>` starts with neither `/` nor a letter, so it fell through
 * unmatched and never incremented depth. Every `<>…</>` pair inside a body
 * therefore decremented depth ONE MORE TIME than it was ever incremented —
 * on a group whose conditional content used a fragment (`{cond && (<>…
 * </>)}`, the shape `{stage && (<><span>…</span><Link>…</Link></>)}` already
 * uses in this codebase), depth hit zero several tags before the group's
 * REAL close, silently truncating the body `unexemptedPhrase` scans and
 * hiding every violation after that point — exactly the kind of gap a
 * "detectable, not enumerated" claim must not have.
 */
function elementBody(src: string, tag: string, openAt: number): { start: number; end: number } {
  const start = openAt + tag.length;
  if (tag.endsWith('/>')) return { start, end: start };
  let depth = 1;
  let i = start;
  while (i < src.length && depth > 0) {
    if (src[i] === '<') {
      if (src[i + 1] === '/') {
        const close = src.indexOf('>', i);
        i = close < 0 ? src.length : close + 1;
        depth -= 1;
        continue;
      }
      if (src[i + 1] === '>') {
        // Fragment shorthand open, <>. Its close, </>, is matched by the
        // ordinary closing-tag branch above, so this one must increment.
        i += 2;
        depth += 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const inner = enclosingTag(src, i);
        i += inner.length;
        if (!inner.endsWith('/>')) depth += 1;
        continue;
      }
    }
    i += 1;
  }
  return { start, end: i };
}

/**
 * The first exposed, unexempted 2+-token run in a group's body, or null when
 * everything either belongs to an isolate or never accumulates a real phrase.
 * See the block comment above for what "exempted" means.
 *
 * A DATA expression (`{item.title}`, `{ITEM_TYPE_LABELS[item.itemType]}`,
 * `{formatBytes(a.size)}`) counts as ONE opaque token — its actual rendered
 * text is invisible from source, but its mere PRESENCE, unisolated, next to
 * other content is exactly the shape a rejected review found live in the
 * app: `{MATERIAL_SOURCE_LABELS[...]} · {MATERIAL_STATUS_LABELS[...]} ·{' '}
 * {itemCount(...)} item{...}` reads as zero words to a scanner that only
 * counts literal text, yet renders three always-English fragments in a row.
 * Treating each such expression as a token turns that invisible run into a
 * 3+-token hit without ever needing to know what the labels actually say.
 * An expression that contains its own nested JSX (`{cond && <div dir="auto">
 * …</div>}`) is left fully opaque (zero contribution) as before — its
 * children are independent elements, already reachable by the outer scan
 * over the whole file, and forcing them through this same linear buffer
 * would require a real JSX parser this file deliberately doesn't have.
 */
function unexemptedPhrase(src: string, bodyStart: number, bodyEnd: number): string | null {
  let buffer = '';
  // A run is judged at each TAG boundary (open or close) — two adjacent but
  // unrelated elements (e.g. two one-word buttons, "Edit" and "Delete") must
  // never concatenate into a false 2-word phrase. An EXPRESSION boundary does
  // NOT judge the run: `{n} segments · {m} min` is one generated phrase split
  // across two expressions, and judging at each `{` would fragment it into
  // single, individually-innocent words, hiding the real violation.
  const flush = (): string | null => {
    const words = buffer.trim().match(/[A-Za-z]+/g) ?? [];
    buffer = '';
    return words.length >= 2 ? words.join(' ') : null;
  };
  let i = bodyStart;
  while (i < bodyEnd) {
    const c = src[i];
    if (c === '{') {
      const exprStart = i + 1;
      let depth = 1;
      i += 1;
      while (i < bodyEnd && depth > 0) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') depth -= 1;
        i += 1;
      }
      const exprText = src.slice(exprStart, i - 1);
      if (!/<[A-Za-z]/.test(exprText)) buffer += ' X ';
      continue;
    }
    if (c === '<') {
      if (src[i + 1] === '/') {
        const hit = flush();
        if (hit) return hit;
        const close = src.indexOf('>', i);
        i = close < 0 ? bodyEnd : close + 1;
        continue;
      }
      if (/[A-Za-z]/.test(src[i + 1] ?? '')) {
        const hit = flush();
        if (hit) return hit;
        const tag = enclosingTag(src, i);
        if (/\sdir="(auto|ltr|rtl)"/.test(tag)) {
          const body = elementBody(src, tag, i);
          i = body.end; // exempted: leads into its own isolate, whatever its length
        } else {
          i += tag.length; // transparent: its children are scanned in the same pass
        }
        continue;
      }
    }
    buffer += c;
    i += 1;
  }
  return flush();
}

/**
 * Independently-authored values (case ii: a question, a note, an observation
 * — content whose own language cannot be assumed from the title next to it)
 * that carry their own `dir=` isolate, so they resolve from their OWN content
 * rather than the group's. Unlike the fixed-copy phrases above, these are
 * plain expressions (`{q.currentProblem}`, `{pathway.note}`) — their value is
 * opaque from source, so completeness here is a recorded ledger, not a
 * derivation, exactly like ALLOWED_TITLE_SITES and GROUP_SITE_INVENTORY: a
 * legitimate new one must be added, visibly, rather than left silent.
 */
const ISOLATED_VALUE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{active.constraint}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{previousNextAction}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span dir="auto">{problem}</span>' },
  { file: 'components/ClassQuestions.tsx', snippet: '<div className="small" dir="auto">' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="auto">{q.currentProblem}</span>' },
  { file: 'components/ClassQuestions.tsx', snippet: '<span dir="auto">{q.lastObservation}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<p className="page-sub" dir="auto">' },
  { file: 'pages/PathwayDetail.tsx', snippet: 'card-quiet small dim" dir="auto" style={{ marginTop: 4 }}' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="auto">{pathway.source}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<div className="tiny faint" dir="auto">' },
  { file: 'pages/RoutineRunner.tsx', snippet: 'Next: <span dir="auto">{next.label}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.form}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.composer}</span>' },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{work.persian.gusheh}</span>' },
  // Instrument names are the OWNER'S OWN editable text (renameable in
  // Settings, Farsi included), never generated copy — a sealed review found
  // four sites forcing them to dir="ltr" as if they were generated metadata,
  // and this file's own audit of every remaining LTR_ISOLATE_SITES entry
  // found a fifth (Today.tsx's "routine running" row) with the identical
  // defect. All five now isolate the instrument name on its own dir="auto".
  { file: 'components/ItemCard.tsx', snippet: '<span dir="auto">{inst}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="auto">{instrumentName(db, item.instrumentId)}</span>' },
  {
    file: 'pages/PathwayDetail.tsx',
    snippet: "<span dir=\"auto\">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>",
  },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="auto">{instrumentName(db, work.instrumentId)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{instrumentName(db, running?.instrumentId)}</span>' },
  // Same audit, two more sites with no dir treatment at all rather than a
  // forced dir="ltr" one — just as wrong, and easier to miss because nothing
  // in the source marked them. PlanCard's mismatched-instrument row was the
  // exact twin of the RoutinesCard row above it; the weekly balance row's
  // instrument name sits inside a CSS GRID (.balance-row), so its isolate is
  // nested one level in rather than on the row, or a Farsi name would flip
  // the grid's three columns.
  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="auto">{b.instrumentName}</span>' },
];

/**
 * Fixed English copy or generated metadata (case i: `buildReason`,
 * `relativeDay`, a hardcoded sentence) that is ALWAYS English by
 * construction, wrapped in its own `dir="ltr"` isolate so a Farsi title's RTL
 * base can't drag its trailing punctuation to the visual start. Recorded for
 * the same reason as ISOLATED_VALUE_SITES: a call like `StaleNote` renders
 * from a different function than its call site, so no source scan at the
 * call site can see whether its OWN return value is isolated.
 */
const LTR_ISOLATE_SITES: { file: string; snippet: string }[] = [
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{recs.best.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{rec.reason}</span>' },
  { file: 'pages/Today.tsx', snippet: 'due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">Running far past its target' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> routine running ▸</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr"> plan running ▸</span>' },
  { file: 'pages/Today.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  {
    file: 'pages/Today.tsx',
    snippet: '<span dir="ltr">\n                        {recs.best ? `next: ${recs.best.score.item.title}`',
  },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{next.reason}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">Study source: </span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">\n                  {a.kind} · {formatBytes(a.size)}' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">difficulty {item.difficulty}/5</span>' },
  { file: 'pages/ItemDetail.tsx', snippet: '<span className="tiny warn-flag" dir="ltr">saturated — consider resting</span>' },
  { file: 'pages/SessionPlan.tsx', snippet: '<span dir="ltr">{seg.reason}</span>' },
  { file: 'pages/CloseBlock.tsx', snippet: '<span dir="ltr">A few seconds to capture what happened.</span>' },
  { file: 'pages/StageDetail.tsx', snippet: '<span className="truncate" dir="ltr">' },
  { file: 'pages/StageDetail.tsx', snippet: '{routine.segments.length} segments · {total} min{bound' },
  { file: 'pages/StageDetail.tsx', snippet: '<span dir="ltr">{meta.join(\' · \')}</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span dir="ltr">{routine.segments.length} segments · {total} min</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span className=\"badge tone-progress\" dir=\"ltr\">{isPinned ? 'Current · pinned' : 'Current'}</span>" },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="badge tone-good" dir="ltr">Done</span>' },
  { file: 'pages/PathwayDetail.tsx', snippet: '<span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems' },
  { file: 'pages/PathwayDetail.tsx', snippet: "<span dir=\"ltr\">{sp.total} piece{sp.total === 1 ? '' : 's'}</span>" },
  { file: 'pages/Lessons.tsx', snippet: '<span className="badge tone-progress" dir="ltr">' },
  { file: 'pages/Lessons.tsx', snippet: '<span className="tiny faint" dir="ltr">no class planned</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{meta}</span>' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Set your NAS base URL in' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">\n                    Your NAS base URL isn’t a valid web address' },
  { file: 'pages/Lessons.tsx', snippet: '<span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>' },
  { file: 'pages/RoutineRunner.tsx', snippet: '<span className="tiny faint" dir="ltr">{minutes} min</span>' },
  { file: 'pages/StartBlock.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'pages/Insights.tsx', snippet: '<span dir="ltr">{insight.body}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{BLOCK_MODE_LABELS[active.mode]}</span>' },
  { file: 'pages/ActiveBlock.tsx', snippet: '<span className="chip" dir="ltr">{FOCUS_LABELS[active.focus]}</span>' },
  {
    file: 'pages/Repertoire.tsx',
    snippet: '<span className="tiny faint" dir="ltr">\n              {g.works.length} work',
  },
  { file: 'pages/Repertoire.tsx', snippet: '<span dir="ltr">\n                {work.lastPractisedAt' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n            On your NAS' },
  { file: 'components/ItemMaterial.tsx', snippet: '<span dir="ltr">\n              On this device' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{ITEM_TYPE_LABELS[item.itemType]}</span>' },
  { file: 'components/ItemCard.tsx', snippet: '<span dir="ltr">{FOCUS_LABELS[item.primaryFocus]}</span>' },
  { file: 'components/Attachments.tsx', snippet: '<span dir="ltr">\n            {att.kind} · {formatBytes(att.size)}' },
  {
    file: 'pages/Materials.tsx',
    snippet: '<span dir="ltr">\n                          {MATERIAL_SOURCE_LABELS[m.sourceType]}',
  },
];

// --- an isolate must be INLINE, never a block that resolves its own align --
//
// A rejected review found `ItemMaterial.tsx` fixing a Farsi title's detail
// line with `<div className="tiny faint" dir="ltr">…</div>` — a BLOCK
// carrying the isolate directly. `text-align: start`, inherited from the
// group, is a per-BOX computed value: it resolves against that box's OWN
// `direction`, not the group's. Give the block its own `dir="ltr"` and its
// `text-align: start` resolves LEFT regardless of the group's (possibly RTL)
// resolved direction — splitting the detail from a right-aligned Farsi title
// exactly as before, just relocated. An INLINE isolate (`<span dir="ltr">`)
// never has this problem: `text-align` is a block-level concept, so a span's
// own `dir` only isolates the Unicode bidi algorithm's treatment of the text
// inside it and never touches which edge the enclosing block aligns to. This
// is therefore not a location to enumerate but a SHAPE to ban outright: no
// `dir="ltr"`/`dir="rtl"` may ever sit on a tag other than `span`/`bdi`,
// full stop, so this class of bug cannot come back in any file, named here
// or not.
const INLINE_ISOLATE_TAGS = ['span', 'bdi'];

function isolateSites(file: string): Site[] {
  const src = stripComments(SOURCES[file]);
  const sites: Site[] = [];
  for (const match of src.matchAll(/dir="(?:ltr|rtl)"/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tagName: (/^<\s*([A-Za-z][\w.]*)/.exec(tag)?.[1] ?? '').toLowerCase(),
      classValue: classNameOf(tag),
      text: tag,
      at,
    });
  }
  return sites;
}

// --- a native list marker must stay inside the card on EITHER side ---------
//
// A rejected review found `ClassQuestions.tsx`'s `<ol>` reserving gutter
// space with `paddingInlineStart` alone while its `<li>`s each resolve their
// OWN direction via `dir="auto"`: the browser positions each `<li>`'s
// outside `::marker` on ITS OWN start edge, not the `<ol>`'s, so a Farsi
// item's marker lands on the right — the side the `<ol>` reserved no room
// for — and gets pressed against or past the content border. This scans
// every `<ol>`/`<ul>` in the recorded surfaces (not just the one known
// today) and requires symmetric room on both sides whenever a directionally
// variable `<li>` could put the marker on either one.
function listSites(file: string): { file: string; line: number; tag: string; hasAutoLi: boolean }[] {
  const src = stripComments(SOURCES[file]);
  const sites: { file: string; line: number; tag: string; hasAutoLi: boolean }[] = [];
  for (const match of src.matchAll(/<(ol|ul)\b/g)) {
    const at = match.index!;
    const tag = enclosingTag(src, at);
    if (tag.endsWith('/>')) continue;
    const body = elementBody(src, tag, at);
    const bodyText = src.slice(body.start, body.end);
    sites.push({
      file,
      line: src.slice(0, at).split('\n').length,
      tag,
      hasAutoLi: /<li\b[^>]*\sdir="auto"/.test(bodyText),
    });
  }
  return sites;
}

/** True when the list's own inline style leaves room for a marker on either
 *  side: explicit `paddingInline`, an equal start+end pair, or a marker that
 *  never sits in a separate gutter at all (`listStylePosition: 'inside'`). */
function reservesRoomOnBothSides(tag: string): boolean {
  const style = tag.match(/style=\{\{([^}]*)\}\}/)?.[1] ?? '';
  if (/listStylePosition\s*:\s*['"]inside['"]/.test(style)) return true;
  if (/\bpaddingInline\s*:/.test(style)) return true;
  const hasStart = /paddingInlineStart\s*:|paddingLeft\s*:/.test(style);
  const hasEnd = /paddingInlineEnd\s*:|paddingRight\s*:/.test(style);
  return hasStart === hasEnd; // both set, or neither — never start-only
}

// --- the check --------------------------------------------------------------

describe('direction lives on the group', () => {
  it('direction lives on the group: no title element carries dir="auto", and every listed surface has one', () => {
    const all = sourceFiles().flatMap(directionSites);

    // (a) A title that still carries direction is a site the sweep missed: its
    //     own caption still aligns to the opposite edge.
    const onTitles = all
      .filter((s) => isTitle(s) && !allowed(s))
      .map((s) => `${s.file}:${s.line} — dir="auto" on a title (class "${s.classValue.trim()}")`);
    expect(onTitles).toEqual([]);

    // (b) A surface with no group at all is a whole file the sweep skipped —
    //     and deleting the attribute instead of moving it fails here too.
    const withoutGroup = SURFACES.filter(
      (file) => !all.some((s) => s.file === file && isGroup(s)),
    ).map((file) => `${file} — renders user text but carries direction on no group`);
    expect(withoutGroup).toEqual([]);
  });

  it('keeps every listed exception real, so the allowlist cannot rot', () => {
    const all = sourceFiles().flatMap(directionSites);
    for (const entry of ALLOWED_TITLE_SITES) {
      const hit = all.some((s) => s.file === entry.file && s.text.includes(entry.snippet) && isTitle(s));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.snippet})`).toBe(true);
    }
  });

  it('keeps every recorded group site current — removing any ONE of them fails, even when its file has others', () => {
    const inventory = sourceFiles()
      .flatMap(directionSites)
      .filter(isGroup)
      .map(({ file, tagName, classValue }) => ({ file, tagName, classValue }));
    expect(inventory).toEqual(GROUP_SITE_INVENTORY);
  });

  it('no fixed English phrase in a group inherits the title\'s bidi base unisolated', () => {
    const exempt = (file: string, tagText: string) =>
      UNEXEMPTED_PHRASE_ALLOWLIST.some((e) => e.file === file && tagText.includes(e.tagSnippet));
    const violations: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of directionSites(file).filter(isGroup)) {
        if (exempt(file, site.text)) continue;
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const phrase = unexemptedPhrase(src, body.start, body.end);
        if (phrase) violations.push(`${file}:${site.line} — "${phrase}" is exposed to the group's bidi base`);
      }
    }
    expect(violations).toEqual([]);
  });

  it('keeps every listed unexempted-phrase exception real, so it cannot rot', () => {
    for (const entry of UNEXEMPTED_PHRASE_ALLOWLIST) {
      const hit = sourceFiles()
        .filter((f) => f === entry.file)
        .flatMap(directionSites)
        .filter(isGroup)
        .some((s) => s.text.includes(entry.tagSnippet));
      expect(hit, `allowlisted exception no longer exists: ${entry.file} (${entry.tagSnippet})`).toBe(true);
    }
  });

  it('keeps every independently-authored value isolated from the group it sits in', () => {
    for (const entry of ISOLATED_VALUE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('keeps every fixed-English / generated-metadata site isolated from the group it sits in', () => {
    for (const entry of LTR_ISOLATE_SITES) {
      const hit = SOURCES[entry.file]?.includes(entry.snippet);
      expect(hit, `missing or moved: ${entry.file} — ${entry.snippet}`).toBe(true);
    }
  });

  it('a bidi isolate is always inline (span/bdi), never a block that resolves its own alignment', () => {
    const violations = sourceFiles()
      .flatMap(isolateSites)
      .filter((s) => !INLINE_ISOLATE_TAGS.includes(s.tagName))
      .map((s) => `${s.file}:${s.line} — dir="ltr"/"rtl" on a <${s.tagName}>, not an inline span`);
    expect(violations).toEqual([]);
  });

  // A sealed review found FOUR sites forcing an instrument name — the OWNER'S
  // OWN editable text, never generated copy — under dir="ltr" as if it were
  // metadata like ITEM_TYPE_LABELS sitting next to it. Auditing the rest of
  // LTR_ISOLATE_SITES by hand found three more of the identical shape. A
  // location list closes only the sites that happened to exist today; this
  // bans the SHAPE, so a future dir="ltr"/"rtl" wrapped around an instrument
  // name fails here regardless of which file it turns up in. The pattern is
  // deliberately NOT anchored to a call — `\binstrumentName\(` alone missed
  // `{b.instrumentName}` (a property access, no call, no parenthesis) in the
  // very same audit that added this test — so it also matches a bare
  // `instrumentName` identifier, covering a property access and a value
  // passed through as a prop (e.g. `TeacherReport.tsx`'s local `instrumentName`
  // variable), not just a direct call.
  it('no dir="ltr"/"rtl" isolate wraps an instrument name', () => {
    const violations: string[] = [];
    for (const file of sourceFiles()) {
      const src = stripComments(SOURCES[file]);
      for (const site of isolateSites(file)) {
        const openAt = src.lastIndexOf('<', site.at);
        const body = elementBody(src, site.text, openAt);
        const bodyText = src.slice(body.start, body.end);
        if (/\binstrumentName\b|\{inst\}/.test(bodyText)) {
          violations.push(`${file}:${site.line} — an instrument name sits inside a dir="ltr"/"rtl" isolate`);
        }
      }
    }
    expect(violations).toEqual([]);
  });

  it('a list containing a direction-variable item reserves marker room on both sides', () => {
    const violations = sourceFiles()
      .flatMap(listSites)
      .filter((s) => s.hasAutoLi && !reservesRoomOnBothSides(s.tag))
      .map((s) => `${s.file}:${s.line} — <ol>/<ul> reserves gutter on only one side for a marker that can land on either`);
    expect(violations).toEqual([]);
  });
});
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
  itemOwnedAttachments,
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
            <Stars value={item.importance} /> importance
          </span>
          <span className="tiny faint" dir="ltr">difficulty {item.difficulty}/5</span>
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

### src/pages/PathwayDetail.tsx

```
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  currentStage,
  groupStages,
  pathwayProgress,
  routinesOfPathway,
  stageProgress,
  stagesOfPathway,
  stageUnits,
  type PathwayRoutine,
  type PathwayStage,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Field } from '../components/ui';
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, PlayIcon, PlusIcon } from '../components/icons';

export default function PathwayDetail() {
  const { pathwayId } = useParams();
  const db = useStore((s) => s.db);
  const updatePathway = useStore((s) => s.updatePathway);
  const deletePathway = useStore((s) => s.deletePathway);
  const addStage = useStore((s) => s.addStage);
  const moveStage = useStore((s) => s.moveStage);
  const renameSection = useStore((s) => s.renameSection);
  const navigate = useNavigate();

  const pathway = db.pathways.find((p) => p.id === pathwayId);
  const stages = useMemo(() => (pathway ? stagesOfPathway(db.pathwayStages, pathway.id) : []), [db.pathwayStages, pathway]);
  // Routines placed on the pathway itself (no stage) — stage-scoped ones show on their stage instead.
  const pathwayRoutines = useMemo(
    () => (pathway ? routinesOfPathway(db.pathwayRoutines, pathway.id).filter((r) => !r.stageId) : []),
    [db.pathwayRoutines, pathway],
  );

  const [editing, setEditing] = useState(false);
  const [addingStage, setAddingStage] = useState(false);
  const [stageCode, setStageCode] = useState('');
  const [stageTitle, setStageTitle] = useState('');
  /** '' = no section; '__new__' = create a new section name. */
  const [stageGroup, setStageGroup] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [renamingGroup, setRenamingGroup] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!pathway) {
    return (
      <div className="stack">
        <Link to="/repertoire" className="link">
          ← Back to repertoire
        </Link>
        <div className="card">That pathway doesn’t exist.</div>
      </div>
    );
  }

  const current = currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId);
  const prog = pathwayProgress(db.pathwayStages, db.items, pathway.id);
  const grouped = groupStages(stages);
  const groupNames = [...new Set(stages.map((s) => s.group).filter((g): g is string => !!g))];

  function submitStage() {
    if (!stageTitle.trim() && !stageCode.trim()) return;
    const group = stageGroup === '__new__' ? newGroupName.trim() : stageGroup;
    addStage(pathway!.id, {
      code: stageCode || stageTitle.slice(0, 6),
      title: stageTitle || stageCode,
      group: group || undefined,
    });
    setStageCode('');
    setStageTitle('');
    setNewGroupName('');
    setAddingStage(false);
  }

  return (
    <div className="stack-lg">
      <Link to="/repertoire" className="link row" style={{ gap: 4, width: 'fit-content' }}>
        <ArrowLeftIcon width={16} height={16} /> Repertoire
      </Link>

      {editing ? (
        <PathwayEditForm
          pathway={pathway}
          instruments={db.instruments}
          onSave={(patch) => {
            updatePathway(pathway.id, patch);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <header className="stack-sm" dir="auto">
          <h1 className="page-title">{pathway.name}</h1>
          {/* The instrument name is the owner's own editable text (renameable
              in Settings, Farsi included) — its own dir="auto" isolate, same
              as pathway.source right after it, so neither is pinned to a
              foreign LTR base or speaks for the other. The 'General'
              fallback (no instrument) is plain ASCII and resolves the same
              way under dir="auto". */}
          <div className="tiny faint">
            <span dir="auto">{pathway.instrumentId ? instrumentName(db, pathway.instrumentId) : 'General'}</span>
            {pathway.source && (
              <>
                {' · '}
                <span dir="auto">{pathway.source}</span>
              </>
            )}
          </div>
          {/* description/note are authored independently of the pathway's own
              name (a user can edit either on its own) — their own dir="auto"
              isolates resolve from their own content, not from pathway.name's. */}
          {pathway.description && (
            <p className="page-sub" dir="auto">
              {pathway.description}
            </p>
          )}
          {pathway.note && (
            <div className="card card-quiet small dim" dir="auto" style={{ marginTop: 4 }}>
              {pathway.note}
            </div>
          )}
          <div className="row" style={{ gap: 8, marginTop: 4 }}>
            <button className="btn btn-sm" onClick={() => setEditing(true)}>
              Edit
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm(`Delete the pathway “${pathway.name}” and all its stages? Your practice items are kept.`)) {
                  deletePathway(pathway.id);
                  navigate('/repertoire');
                }
              }}
            >
              Delete
            </button>
          </div>
        </header>
      )}

      {current && (
        <article className="card card-accent stack-sm">
          <div className="row between">
            <span className="eyebrow">You are here</span>
            <span className="tiny faint mono-num">
              {prog.done}/{prog.total} solid
            </span>
          </div>
          <div className="title-md" style={{ fontSize: '1.2rem' }}>
            {current.code}
            {current.title !== current.code ? ` · ${current.title}` : ''}
          </div>
          <Link to={`/pathway/${pathway.id}/${current.id}`} className="btn btn-primary">
            Continue this stage
          </Link>
        </article>
      )}

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Guided routines</div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate(`/routine/new?instrument=${pathway.instrumentId ?? ''}&pathway=${pathway.id}`)}
          >
            <PlusIcon /> New routine
          </button>
        </div>
        {pathwayRoutines.map((r) => (
          <RoutineRow
            key={r.id}
            routine={r}
            onStart={(short) => navigate(`/routine/${r.id}${short ? '?short=1' : ''}`)}
            onEdit={() => navigate(`/routine/${r.id}/edit`)}
          />
        ))}
        {pathwayRoutines.length === 0 && <div className="card card-quiet small dim">No pathway-level routines — stage routines show on their stage.</div>}
      </section>

      <section className="stack-sm">
        <div className="row between">
          <div className="section-label">Stages</div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAddingStage((a) => !a)}>
            <PlusIcon /> Add stage
          </button>
        </div>

        {addingStage && (
          <div className="card stack-sm">
            <div className="grid-2">
              <Field label="Short code">
                <input className="input" dir="auto" placeholder="e.g. 2A / Shur" value={stageCode} onChange={(e) => setStageCode(e.target.value)} />
              </Field>
              <Field label="Section" hint="Which part of the path this stage sits in.">
                <select className="select" value={stageGroup} onChange={(e) => setStageGroup(e.target.value)} aria-label="Section for the new stage">
                  <option value="">No section</option>
                  {groupNames.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                  <option value="__new__">New section…</option>
                </select>
              </Field>
            </div>
            {stageGroup === '__new__' && (
              <Field label="New section name">
                <input className="input" dir="auto" placeholder="e.g. Book 3" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} />
              </Field>
            )}
            <Field label="Title">
              <input className="input" dir="auto" value={stageTitle} onChange={(e) => setStageTitle(e.target.value)} />
            </Field>
            <button className="btn btn-primary" onClick={submitStage}>
              Add stage
            </button>
          </div>
        )}

        {grouped.map((g, gi) => (
          <div key={gi} className="stack-sm">
            {g.group &&
              (renamingGroup === g.group ? (
                <div className="row" style={{ gap: 8, marginTop: gi ? 8 : 0 }}>
                  <input
                    className="input grow"
                    dir="auto"
                    value={renameValue}
                    autoFocus
                    aria-label={`Rename section ${g.group}`}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && renameValue.trim()) {
                        renameSection(pathway.id, g.group, renameValue);
                        setRenamingGroup(null);
                      }
                      if (e.key === 'Escape') setRenamingGroup(null);
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={!renameValue.trim()}
                    onClick={() => {
                      renameSection(pathway.id, g.group, renameValue);
                      setRenamingGroup(null);
                    }}
                  >
                    Save
                  </button>
                  <button className="btn btn-sm" onClick={() => setRenamingGroup(null)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="row between" style={{ marginTop: gi ? 8 : 0 }}>
                  <div className="small dim" style={{ fontWeight: 600 }} dir="auto">
                    {g.group}
                  </div>
                  <button
                    className="link tiny"
                    style={{ background: 'none', border: 'none' }}
                    onClick={() => {
                      setRenamingGroup(g.group!);
                      setRenameValue(g.group!);
                    }}
                  >
                    rename
                  </button>
                </div>
              ))}
            {g.stages.map((stage) => (
              <StageRow
                key={stage.id}
                stage={stage}
                num={stages.findIndex((s) => s.id === stage.id) + 1}
                db={db}
                isCurrent={stage.id === current?.id}
                isPinned={pathway.currentStageId === stage.id}
                onOpen={() => navigate(`/pathway/${pathway.id}/${stage.id}`)}
                onMove={(d) => moveStage(stage.id, d)}
              />
            ))}
          </div>
        ))}

        {stages.length === 0 && <div className="card card-quiet small dim">No stages yet — add the first one above.</div>}
      </section>
    </div>
  );
}

function StageRow({
  stage,
  num,
  db,
  isCurrent,
  isPinned,
  onOpen,
  onMove,
}: {
  stage: PathwayStage;
  num: number;
  db: ReturnType<typeof useStore.getState>['db'];
  isCurrent: boolean;
  isPinned: boolean;
  onOpen: () => void;
  onMove: (dir: -1 | 1) => void;
}) {
  const sp = stageProgress(stageUnits(stage, db.items));
  return (
    <div className={`card list-row${isCurrent ? ' card-accent' : ''}`} style={{ padding: 'var(--space-3) var(--space-4)' }}>
      <div
        className="stage-badge"
        style={{
          background: sp.complete ? 'var(--tone-good-soft)' : isCurrent ? 'var(--accent-soft)' : 'var(--surface-2)',
          color: sp.complete ? 'var(--tone-good)' : isCurrent ? 'var(--accent)' : 'var(--text-dim)',
        }}
      >
        {sp.complete ? <CheckIcon width={18} height={18} /> : num}
      </div>
      <button className="grow" dir="auto" style={{ background: 'none', border: 'none', textAlign: 'start', cursor: 'pointer', color: 'inherit' }} onClick={onOpen}>
        {/* stage.code leads (the group's own anchor); the badges after it are
            fixed English, never user text — each gets its own dir="ltr"
            isolate so it can't inherit stage.code's RTL base. */}
        <div className="row" style={{ gap: 8 }}>
          <span>{stage.code}</span>
          {isCurrent && (
            <span className="badge tone-progress" dir="ltr">{isPinned ? 'Current · pinned' : 'Current'}</span>
          )}
          {sp.complete && <span className="badge tone-good" dir="ltr">Done</span>}
          {sp.addedItems > 0 && !sp.complete && (
            <span className="tiny faint" dir="ltr">{sp.addedItems} item{sp.addedItems === 1 ? '' : 's'}</span>
          )}
        </div>
        {/* stage.title is the SAME stage's own fuller name, not a value
            authored independently of stage.code — it stays bare, exactly
            like stage.code's own span above, so the two agree on whichever
            direction the group resolves rather than one silently
            overriding the other. The piece-count fallback (rendered only
            when title and code are the same) is generated English and
            gets its own dir="ltr" isolate. */}
        <div className="tiny faint">
          {stage.title !== stage.code ? (
            <span>{stage.title}</span>
          ) : (
            <span dir="ltr">{sp.total} piece{sp.total === 1 ? '' : 's'}</span>
          )}
        </div>
        <div className="row" style={{ gap: 8, marginTop: 6 }}>
          <span className="balance-track grow" style={{ maxWidth: 180 }}>
            <span className="balance-fill" style={{ width: `${sp.percent}%` }} />
          </span>
          <span className="tiny faint mono-num">
            {sp.done}/{sp.total}
          </span>
        </div>
      </button>
      <div className="stack" style={{ gap: 2 }}>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(-1)} aria-label="Move up">
          ↑
        </button>
        <button className="btn btn-ghost btn-sm" style={{ minHeight: 22, padding: '0 6px' }} onClick={() => onMove(1)} aria-label="Move down">
          ↓
        </button>
      </div>
      <ChevronRightIcon width={16} height={16} className="faint" onClick={onOpen} style={{ cursor: 'pointer' }} />
    </div>
  );
}

function RoutineRow({
  routine,
  onStart,
  onEdit,
}: {
  routine: PathwayRoutine;
  onStart: (shortOnTime: boolean) => void;
  onEdit: () => void;
}) {
  const total = routine.segments.reduce((s, x) => s + x.minutes, 0);
  const hasEssential = routine.segments.some((s) => s.essential);
  return (
    <article className="card stack-sm">
      <div className="row between">
        <div dir="auto">
          <div className="title-md" style={{ fontSize: '1.02rem' }}>
            {routine.name}
          </div>
          {/* Generated English metadata, never user text — its own dir="ltr"
              isolate keeps it from inheriting a Farsi routine name's RTL base. */}
          <div className="tiny faint">
            <span dir="ltr">{routine.segments.length} segments · {total} min</span>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={onEdit}>
            Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onStart(false)}>
            <PlayIcon /> Start
          </button>
        </div>
      </div>
      {hasEssential && (
        <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }} onClick={() => onStart(true)}>
          Short on time — essentials only
        </button>
      )}
    </article>
  );
}

function PathwayEditForm({
  pathway,
  instruments,
  onSave,
  onCancel,
}: {
  pathway: { name: string; instrumentId?: string; source?: string; description?: string; note?: string };
  instruments: { id: string; name: string }[];
  onSave: (patch: { name: string; instrumentId?: string; source?: string; description?: string; note?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(pathway.name);
  const [instrumentId, setInstrumentId] = useState(pathway.instrumentId ?? '');
  const [source, setSource] = useState(pathway.source ?? '');
  const [description, setDescription] = useState(pathway.description ?? '');
  const [note, setNote] = useState(pathway.note ?? '');
  return (
    <div className="card stack">
      <Field label="Name">
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Instrument">
        <select className="select" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
          <option value="">General (no instrument)</option>
          {instruments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Based on / reference" hint="Where this route comes from — e.g. CGS syllabus, your teacher's plan.">
        <input className="input" dir="auto" value={source} onChange={(e) => setSource(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="How you'll use it">
        <textarea className="textarea" value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="row">
        <button
          className="btn btn-primary grow"
          disabled={!name.trim()}
          onClick={() => onSave({ name: name.trim(), instrumentId: instrumentId || undefined, source: source.trim() || undefined, description: description.trim() || undefined, note: note.trim() || undefined })}
        >
          Save
        </button>
        <button className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
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
        <section key={g.dastgah} className="stack-sm" dir="auto">
          <div className="row between">
            <h2 className="title-md">
              {g.dastgah === UNCLASSIFIED_DASTGAH ? 'No dastgāh yet' : g.dastgah}
            </h2>
            {/* Generated English metadata, never user text — its own
                dir="ltr" isolate keeps it from inheriting the dastgāh
                heading's RTL base. */}
            <span className="tiny faint" dir="ltr">
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
          <section key={g.label} className="stack-sm" dir="auto">
            <div className="row between">
              <h2 className="title-md">
                {g.label}
              </h2>
              {/* Generated English metadata, never user text — its own
                  dir="ltr" isolate keeps it from inheriting the group
                  heading's RTL base. */}
              <span className="tiny faint" dir="ltr">
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
        <div className="grow" dir="auto" style={{ minWidth: 0 }}>
          <div className="truncate">
            {work.title}
          </div>
          {/* form/composer/gusheh and the instrument name are all authored
              independently of the work's own title (their own dir="auto"
              isolates — the instrument name is the owner's own editable
              text, renameable in Settings, Farsi included, never generated
              copy); the last-practised phrase is generated metadata (its own
              dir="ltr" isolate) — never one isolate speaking for all of
              them, and never joined into one bare string that inherits
              whichever direction the title happened to resolve. */}
          <div className="tiny faint truncate">
            {[
              work.persian?.form ? <span dir="auto">{work.persian.form}</span> : null,
              work.persian?.composer ? <span dir="auto">{work.persian.composer}</span> : null,
              work.persian?.gusheh ? (
                <span>
                  gusheh: <span dir="auto">{work.persian.gusheh}</span>
                </span>
              ) : null,
              <span dir="auto">{instrumentName(db, work.instrumentId)}</span>,
              <span dir="ltr">
                {work.lastPractisedAt ? `last ${relativeFromDateTime(work.lastPractisedAt, now)}` : 'not practised yet'}
              </span>,
            ]
              .filter(Boolean)
              .map((node, i) => (
                <span key={i}>
                  {i > 0 ? ' · ' : ''}
                  {node}
                </span>
              ))}
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
                <Link key={p.id} to={`/items/${p.id}`} state={{ from: '/repertoire' }} className="row between small card-link" dir="auto" style={{ minWidth: 0 }}>
                  <span className="truncate dim">
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

### src/pages/Today.tsx

```
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  currentStage,
  daysUntil,
  dueReviews,
  fragileItems,
  generateInsights,
  instrumentBalance,
  isStaleClock,
  practiceTotals,
  insightOfTheDay,
  nextLessonDates,
  recommend,
  recommendForInstrument,
  routinesForInstrument,
  stageProgress,
  stageUnits,
  todayISODate,
  ITEM_STATUS_LABELS,
  type PathwayRoutine,
  type PracticeItem,
  type Recommendation,
} from '../domain';
import { sessionElapsedSeconds, useStore, type ActiveSession } from '../store/useStore';
import { getItem, instrumentName } from '../store/lookups';
import { defaultStartInput } from '../store/sessionHelpers';
import { EmptyState, StatusBadge } from '../components/ui';
import { ChevronRightIcon, MusicIcon, PathIcon, PlayIcon, PlusIcon, SparkIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import InstallHint from '../components/InstallHint';
import QuickAdd from '../components/QuickAdd';

// ---------------------------------------------------------------------------
// Today is a session workspace: "I am practising X now." Everything on screen
// belongs to X — its next recommendation first, then its class work, reviews
// and pathway position. The cross-instrument overview is a deliberate,
// secondary choice, never the default.
// ---------------------------------------------------------------------------

export default function Today() {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const setSessionInstrument = useStore((s) => s.setSessionInstrument);

  const instruments = useMemo(() => db.instruments.filter((i) => i.active), [db.instruments]);
  // Last chosen instrument, else the first active one — never "all" by default.
  const selected =
    sessionInstrumentId === 'all'
      ? null
      : (instruments.find((i) => i.id === sessionInstrumentId) ?? instruments[0] ?? null);
  const overview = sessionInstrumentId === 'all';

  // A LIVE clock, not one frozen at mount. Today is a screen that stays open:
  // with a fixed `now`, Sunday's blocks kept counting as "today" and "this
  // week" after midnight, and a running block that crossed the stale threshold
  // never gained its label. A minute is fine granularity for both a calendar
  // rollover and a three-hour floor, and re-deriving the recommendations that
  // often costs nothing at this data size (it also correctly un-hides "Not
  // now" items once the date rolls over).
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="stack-lg">
      <nav className="options" aria-label="Which instrument are you practising?">
        {instruments.map((i) => (
          <button
            key={i.id}
            className={`option${!overview && selected?.id === i.id ? ' selected' : ''}`}
            aria-pressed={!overview && selected?.id === i.id}
            onClick={() => setSessionInstrument(i.id)}
          >
            {i.name}
          </button>
        ))}
        <button
          className={`option${overview ? ' selected' : ''}`}
          aria-pressed={overview}
          onClick={() => setSessionInstrument('all')}
          title="Cross-instrument overview"
        >
          Overview
        </button>
      </nav>

      {active && !overview && selected && active.instrumentId === selected.id && (
        <Link to="/active" className="card card-accent card-link row between">
          <div>
            <div className="eyebrow">In progress</div>
            <div dir="auto">
              <div className="title-md">{getItem(db, active.itemId)?.title ?? 'Practice block'}</div>
              <StaleNote active={active} now={now} />
            </div>
          </div>
          <span className="btn btn-primary btn-sm">
            <PlayIcon /> Resume
          </span>
        </Link>
      )}

      <ElsewhereSessions selectedInstrumentId={overview ? null : (selected?.id ?? null)} now={now} />

      {overview || !selected ? (
        <OverviewView now={now} />
      ) : (
        <SessionView instrumentId={selected.id} instrumentName={selected.name} now={now} />
      )}

      {/* One-time, dismissible, hidden once installed — after the session, never in its place. */}
      <InstallHint />
    </div>
  );
}

// --- A session belongs to whichever instrument it was started for ------------
// `active`/`activePlan`/`activeRoutine` never masquerade as the selected
// instrument's own work. When one belongs to a DIFFERENT instrument than the
// one Today is scoped to, it shows here as an explicit "still running
// elsewhere" row (never silently hidden — that would invite overwriting it)
// rather than taking over that instrument's own Plan/Routines doorway.

/**
 * Staleness earns its keep WITHOUT being given authority: a clock forgotten
 * overnight is what holds sync, so it is labelled wherever that block is shown
 * so it can be resolved. It is never a reason to discard it — the owner
 * finishes it, corrects the minutes, or discards it.
 *
 * It renders in BOTH places the ordinary block can appear, and those two are
 * exhaustive: the In-progress card when the block belongs to the instrument
 * Today is scoped to, and the "still running elsewhere" row when it does not
 * (which includes Overview, where nothing is selected). Labelling only the
 * first left the same stale block silent after switching instrument — and with
 * no GitHub sync configured there is no deferral notice to say it either.
 *
 * A stale ROUTINE deliberately carries no such note: a run has no single
 * target to judge an elapsed figure against, `segmentElapsed` already clamps
 * each segment to its authored duration so a routine cannot fabricate minutes,
 * and routines.ts is not this lane's to change.
 */
function StaleNote({ active, now }: { active: ActiveSession; now: Date }) {
  if (!isStaleClock(sessionElapsedSeconds(active, now), active.targetMinutes)) return null;
  // Fixed English page copy, rendered inside both the In-progress card's and
  // ElsewhereSessions' title groups — its own dir="ltr" isolate keeps its
  // bidi base fixed regardless of the item's title, so a Farsi title's RTL
  // base can't drag its trailing full stop to the visual start.
  return (
    <div className="tiny faint">
      <span dir="ltr">Running far past its target — finish it, correct the minutes, or discard it.</span>
    </div>
  );
}

function ElsewhereSessions({
  selectedInstrumentId,
  now,
}: {
  selectedInstrumentId: string | null;
  now: Date;
}) {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activePlan = useStore((s) => s.activePlan);
  const activeRoutine = useStore((s) => s.activeRoutine);

  const rows: { key: string; label: string; detail: string; to: string; note?: ReactNode }[] = [];

  if (active && active.instrumentId !== selectedInstrumentId) {
    rows.push({
      key: 'active',
      label: getItem(db, active.itemId)?.title ?? 'Practice block',
      detail: `${instrumentName(db, active.instrumentId)} · in progress`,
      to: '/active',
      note: <StaleNote active={active} now={now} />,
    });
  }
  if (activePlan && activePlan.instrumentId !== selectedInstrumentId) {
    const done = activePlan.segments.filter((s) => s.status === 'done').length;
    rows.push({
      key: 'plan',
      label: `${instrumentName(db, activePlan.instrumentId)} plan`,
      detail: `${done} of ${activePlan.segments.length} done`,
      to: '/plan',
    });
  }
  if (activeRoutine) {
    const routine = db.pathwayRoutines.find((r) => r.id === activeRoutine.routineId);
    // A legacy routine with no instrumentId isn't foreign to anything —
    // never invent the instrument it's masquerading as.
    if (routine?.instrumentId && routine.instrumentId !== selectedInstrumentId) {
      rows.push({
        key: 'routine',
        label: routine.name,
        detail: `${instrumentName(db, routine.instrumentId)} routine`,
        to: `/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`,
      });
    }
  }

  if (rows.length === 0) return null;

  return (
    <div className="stack-sm">
      {rows.map((r) => (
        <Link key={r.key} to={r.to} className="card card-quiet card-link row between">
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="tiny faint">{r.detail}</div>
            <div dir="auto">
              <div className="small truncate">{r.label}</div>
              {r.note}
            </div>
          </div>
          <span className="tiny faint" style={{ flex: 'none' }}>
            Resume ▸
          </span>
        </Link>
      ))}
    </div>
  );
}

// --- Session Plan and Routines: two independent, peer doorways ---------------
// Deliberately separate cards, not a shared panel — a time-budgeted Session
// Plan and following a routine are peer choices, not one subordinate to the
// other. Each starts collapsed so "Practise now" stays above the fold at
// 390×844, and each carries its own open/close state and its own "resume"
// takeover, matching the existing `active`/`activePlan` pattern.

const PLAN_DURATIONS = [15, 20, 30, 45, 60] as const;

function PlanCard({ instrumentId }: { instrumentId: string }) {
  const db = useStore((s) => s.db);
  const activePlan = useStore((s) => s.activePlan);
  const planMinutes = useStore((s) => s.planMinutesByInstrument);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (activePlan && activePlan.instrumentId === instrumentId) {
    const done = activePlan.segments.filter((s) => s.status === 'done').length;
    return (
      <button className="card card-accent row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate('/plan')}>
        <span style={{ fontWeight: 600 }}>Resume your plan</span>
        <span className="small">{done} of {activePlan.segments.length} · {activePlan.budgetMinutes} min ▸</span>
      </button>
    );
  }
  if (activePlan) {
    // A different instrument's plan is running. Starting a new plan here
    // would dead-end at that plan anyway (`/plan` always shows whichever one
    // is active) — so this doorway stays visibly blocked rather than
    // offering a duration picker that can't actually start anything.
    return (
      <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate('/plan')}>
        <span style={{ fontWeight: 600, opacity: 0.7 }}>Plan this session</span>
        {/* Same split as the Routines doorway below: the instrument name is
            the owner's own editable text (its own dir="auto" isolate, never
            bare alongside fixed English), and "plan running ▸" keeps its own
            dir="ltr" isolate as generated page copy. */}
        <span className="faint small">
          <span dir="auto">{instrumentName(db, activePlan.instrumentId)}</span>
          <span dir="ltr"> plan running ▸</span>
        </span>
      </button>
    );
  }

  const defaultMinutes = planMinutes[instrumentId] ?? 20;

  if (!open) {
    return (
      <button
        className="card card-quiet row between"
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        aria-expanded={false}
      >
        <span style={{ fontWeight: 600 }}>Plan this session</span>
        <span className="faint small">choose a length ▸</span>
      </button>
    );
  }

  return (
    <section className="card card-quiet stack-sm">
      <div className="row between">
        <span style={{ fontWeight: 600 }}>How long today?</span>
        <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => setOpen(false)} aria-label="Collapse">✕</button>
      </div>
      <div className="options">
        {PLAN_DURATIONS.map((m) => (
          <button
            key={m}
            className={`option${m === defaultMinutes ? ' selected' : ''}`}
            onClick={() => navigate(`/plan?minutes=${m}`)}
          >
            {m} min
          </button>
        ))}
      </div>
    </section>
  );
}

function RoutinesCard({ instrumentId }: { instrumentId: string }) {
  const db = useStore((s) => s.db);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const routines = useStore((s) => s.db.pathwayRoutines);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const myRoutines = routinesForInstrument(routines, instrumentId);

  if (activeRoutine) {
    const running = routines.find((r) => r.id === activeRoutine.routineId);
    // A legacy routine with no instrumentId isn't foreign to anything.
    const matches = !running?.instrumentId || running.instrumentId === instrumentId;
    const to = `/routine/${activeRoutine.routineId}${activeRoutine.shortOnTime ? '?short=1' : ''}`;
    // dir="auto" sits on a wrapper around the routine's OWN name, not on the
    // whole button: with it on the button, "Resume your routine"/"Routines" —
    // the fixed English label — is the first strong text in the subtree, so
    // auto-detection resolved LTR from that label and never saw the Farsi
    // name that follows.
    if (matches) {
      return (
        <button className="card card-accent row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(to)}>
          <span style={{ fontWeight: 600 }}>Resume your routine</span>
          <div dir="auto" style={{ minWidth: 0 }}>
            <div className="small truncate">{running?.name ?? 'Routine'} ▸</div>
          </div>
        </button>
      );
    }
    // A different instrument's routine is running. Starting another one here
    // would just bounce back to it (RoutineRunner's own otherActive redirect)
    // — so this doorway stays visibly blocked rather than offering a Start
    // that can't actually start anything.
    return (
      <button className="card card-quiet row between" style={{ width: '100%', cursor: 'pointer' }} onClick={() => navigate(to)}>
        <span style={{ fontWeight: 600, opacity: 0.7 }}>Routines</span>
        <div dir="auto" style={{ minWidth: 0 }}>
          {/* The instrument name is the owner's own editable text (renameable
              in Settings, Farsi included) — its own dir="auto" isolate, not
              lumped into the fixed English suffix that follows it. "routine
              running ▸" is page copy, never user text, so it keeps its own
              dir="ltr" isolate. Both inline (span), not dir on this block: a
              block isolate resolves its OWN text-align independently of the
              group, which is the exact split a rejected review found
              elsewhere in this lane. */}
          <div className="faint small truncate">
            <span dir="auto">{instrumentName(db, running?.instrumentId)}</span>
            <span dir="ltr"> routine running ▸</span>
          </div>
        </div>
      </button>
    );
  }

  if (!open) {
    return (
      <button
        className="card card-quiet row between"
        style={{ width: '100%', cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        aria-expanded={false}
      >
        <span style={{ fontWeight: 600 }}>Routines</span>
        <span className="faint small">
          {myRoutines.length > 0 ? `${myRoutines.length} saved ▸` : 'follow a set warm-up ▸'}
        </span>
      </button>
    );
  }

  return (
    <section className="card card-quiet stack-sm">
      <div className="row between">
        <span style={{ fontWeight: 600 }}>Routines</span>
        <button className="btn btn-ghost" style={{ minWidth: 44, minHeight: 44, padding: 0 }} onClick={() => setOpen(false)} aria-label="Collapse">✕</button>
      </div>
      {myRoutines.length === 0 ? (
        <button className="btn" style={{ width: '100%' }} onClick={() => navigate(`/routine/new?instrument=${instrumentId}`)}>
          <PlusIcon /> Create a routine
        </button>
      ) : (
        <div className="stack-sm">
          {myRoutines.map((r) => (
            <TodayRoutineRow key={r.id} routine={r} />
          ))}
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/routine/new?instrument=${instrumentId}`)}>
            <PlusIcon /> New routine
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * Same shape as StageDetail's RoutineCard / PathwayDetail's RoutineRow (name +
 * segment summary, Edit, Start, and — when the routine has an essential
 * segment — a visible "short on time" entry point). This is the ONLY place an
 * unplaced routine (no pathway/stage) is reachable at all, so it needs the
 * same Edit/Start/short-on-time affordances those pages give a placed one.
 */
function TodayRoutineRow({ routine }: { routine: PathwayRoutine }) {
  const navigate = useNavigate();
  const total = routine.segments.reduce((sum, seg) => sum + seg.minutes, 0);
  const hasEssential = routine.segments.some((seg) => seg.essential);
  return (
    <article className="card stack-sm">
      <div className="row between">
        <div dir="auto" style={{ minWidth: 0 }}>
          <div className="truncate">{routine.name}</div>
          {/* Generated English metadata, never user text — its own dir="ltr"
              isolate keeps it from inheriting a Farsi routine name's RTL base. */}
          <div className="tiny faint">
            <span dir="ltr">{routine.segments.length} segments · {total} min</span>
          </div>
        </div>
        <div className="row" style={{ gap: 6 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/routine/${routine.id}/edit`)}>
            Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/routine/${routine.id}`)} aria-label={`Start ${routine.name}`}>
            <PlayIcon width={16} height={16} />
          </button>
        </div>
      </div>
      {hasEssential && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: 'flex-end' }}
          onClick={() => navigate(`/routine/${routine.id}?short=1`)}
        >
          Short on time — essentials only
        </button>
      )}
    </article>
  );
}

// --- The per-instrument session ----------------------------------------------

function SessionView({
  instrumentId,
  instrumentName: name,
  now,
}: {
  instrumentId: string;
  instrumentName: string;
  now: Date;
}) {
  const db = useStore((s) => s.db);
  const active = useStore((s) => s.active);
  const activeRoutine = useStore((s) => s.activeRoutine);
  const notNow = useStore((s) => s.notNow);
  const startSession = useStore((s) => s.startSession);
  const startItemSession = useStore((s) => s.startItemSession);
  const notNowReview = useStore((s) => s.notNowReview);
  const snoozeReview = useStore((s) => s.snoozeReview);
  const navigate = useNavigate();

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const recs = useMemo(
    () => recommendForInstrument(instrumentId, db.items, db.blocks, now, lessonDates),
    [instrumentId, db.items, db.blocks, now, lessonDates],
  );

  const items = useMemo(() => db.items.filter((i) => i.instrumentId === instrumentId), [db.items, instrumentId]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const lessonDate = lessonDates.get(instrumentId);
  const classWork = useMemo(
    () => (lessonDate ? items.filter((i) => i.assignedForLesson) : []),
    [items, lessonDate],
  );

  const hiddenToday = notNow.date === todayISODate(now) ? new Set(notNow.ids) : new Set<string>();
  const reviews = useMemo(
    () =>
      dueReviews(db.reviews, now).filter((r) => {
        const item = itemById.get(r.practiceItemId);
        return item && !hiddenToday.has(r.id);
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db.reviews, now, itemById, notNow],
  );

  const pathway = useMemo(
    () => db.pathways.find((p) => p.instrumentId === instrumentId),
    [db.pathways, instrumentId],
  );
  const stage = pathway
    ? currentStage(db.pathwayStages, db.items, pathway.id, pathway.currentStageId)
    : null;
  const stageSp = stage ? stageProgress(stageUnits(stage, db.items)) : null;

  const fragile = useMemo(() => fragileItems(items), [items]);

  const start = (item: PracticeItem) => {
    // A different item is already active: don't silently swap it out from
    // under the user (startSession would just no-op) — the in-progress
    // banner above is the resolve path. Same for a running routine — the
    // Routines doorway's "Resume your routine" is that resolve path.
    if (active && active.itemId !== item.id) return;
    if (activeRoutine) return;
    startSession(defaultStartInput(item));
    navigate('/active');
  };

  if (items.length === 0) {
    return (
      <div className="stack">
        <div className="card">
          <EmptyState icon={<MusicIcon />} title={`Nothing for ${name} yet`}>
            Add your first piece or exercise below — a title is enough.
          </EmptyState>
        </div>
        <QuickAdd />
      </div>
    );
  }

  const secondary = [recs.quickWin, recs.maintenance].filter(Boolean) as Recommendation[];

  return (
    <div className="stack-lg">
      {/* 0 · Two collapsed, peer doorways — a time-budgeted plan and a
             routine are separate systems, neither subordinate to the other.
             Both start collapsed (~50px) so the primary recommendation stays
             above the fold at 390×844, and each carries its own open/close
             state and its own resume takeover.

             They sit ABOVE the recommendation by OWNER judgement. This lane
             built the other order — recommendation first, doorways beneath —
             and the owner tried it on their own iPhone (2026‑09‑11) and
             preferred this one: Plan and Routines read as belonging at the top
             of the page, and the recommendation-first version felt less
             natural. Ordering here is the owner's call, not a derivation, so
             do not "fix" it back without one. */}
      <PlanCard instrumentId={instrumentId} />
      <RoutinesCard instrumentId={instrumentId} />

      {/* 1 · The one thing to practise now — above the fold. The English
             eyebrow stays outside the direction group: dir="auto" resolves from
             the first strong character, so a Farsi title and its own reason
             read as one right-aligned block. `reason` is always English
             (buildReason is a system-generated sentence, never user text), so
             it carries its own dir="ltr" isolate: grouped with the title for
             ALIGNMENT (the group's own resolved direction still governs where
             the paragraph sits), but with its OWN bidi base fixed to LTR so a
             Farsi title's RTL base can't drag the reason's trailing full stop
             to the visual start. */}
      {recs.best && (
        <article className="card card-accent">
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="eyebrow">Practise now</span>
            <StatusBadge status={recs.best.score.item.status} />
          </div>
          <div dir="auto">
            <Link to={`/items/${recs.best.score.item.id}`} state={{ from: '/' }} style={{ color: 'var(--text)' }}>
              <h2 className="title-md" style={{ fontSize: '1.3rem' }}>
                {recs.best.score.item.title}
              </h2>
            </Link>
            <p className="reason" style={{ marginTop: 6 }}>
              <span dir="ltr">{recs.best.reason}</span>
            </p>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn btn-primary btn-lg grow" onClick={() => start(recs.best!.score.item)}>
              <PlayIcon /> Start · 10 min
            </button>
            <Link to={`/items/${recs.best.score.item.id}`} state={{ from: '/' }} className="btn btn-lg">
              Details
            </Link>
          </div>
        </article>
      )}

      {/* 2 · Honest totals — BELOW the recommendation, never above it, so
             "Practise now" stays above the fold at 390×844. Neutral counts of
             minutes and blocks: no target, no streak, no bar that fills. */}
      <PractisedLine instrumentId={instrumentId} now={now} />

      {/* 3 · A calm sketch of the session. */}
      {secondary.length > 0 && (
        <section className="card card-quiet stack-sm">
          <div className="section-label">Then, if you have time</div>
          {secondary.map((rec) => (
            <div key={rec.kind} className="row" style={{ gap: 10 }}>
              <button
                className="grow"
                dir="auto"
                style={{ background: 'none', border: 'none', textAlign: 'start', cursor: 'pointer', color: 'inherit', minWidth: 0, padding: 0 }}
                onClick={() => start(rec.score.item)}
              >
                <span className="truncate">{rec.score.item.title}</span>
                {/* rec.reason is always English (buildReason) — its own dir="ltr"
                    isolate keeps its bidi base fixed regardless of the title's. */}
                <div className="tiny faint truncate">
                  <span dir="ltr">{rec.reason}</span>
                </div>
              </button>
              <button className="btn btn-sm" onClick={() => start(rec.score.item)} aria-label={`Practise ${rec.score.item.title}`}>
                <PlayIcon />
              </button>
            </div>
          ))}
        </section>
      )}

      {/* 4 · Class commitments for THIS instrument only. */}
      {lessonDate && classWork.length > 0 && (
        <section className="stack-sm">
          <h2 className="title-md">
            Before your {name} class
            <span className="dim" style={{ fontWeight: 400 }}>
              {' '}
              · {daysUntil(lessonDate, now) <= 0 ? 'today' : `in ${daysUntil(lessonDate, now)} day${daysUntil(lessonDate, now) === 1 ? '' : 's'}`}
            </span>
          </h2>
          <div className="card card-flush list">
            {classWork.map((item) => (
              <div key={item.id} className="list-row">
                <Link to={`/items/${item.id}`} state={{ from: '/' }} className="grow" dir="auto" style={{ minWidth: 0 }}>
                  <div className="truncate">{item.title}</div>
                  {/* Generated English metadata, never user text — its own
                      dir="ltr" isolate keeps it from inheriting a Farsi
                      title's RTL base. */}
                  <div className="tiny faint">
                    <span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>
                  </div>
                </Link>
                <button className="btn btn-sm btn-primary" onClick={() => start(item)} aria-label={`Practise ${item.title}`}>
                  <PlayIcon />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5 · Due reviews, with honest actions. */}
      {reviews.length > 0 && (
        <section className="stack-sm">
          <div className="row between">
            <h2 className="title-md">Due reviews</h2>
            <span className="faint small">{reviews.length}</span>
          </div>
          <div className="card card-flush list">
            {reviews.map((r) => {
              const item = itemById.get(r.practiceItemId)!;
              return (
                // The item's NAME is what this row exists to identify. Three
                // controls used to leave it 113px of a 356px row — about 13
                // characters of a Farsi title. Now the title claims a whole
                // line whenever the three actions cannot sit beside it, and it
                // wraps instead of truncating. All three keep their existing,
                // deliberately distinct meanings: this is layout only.
                <div key={r.id} className="list-row" style={{ flexWrap: 'wrap' }}>
                  <div dir="auto" style={{ flex: '1 1 220px', minWidth: 0, textAlign: 'start' }}>
                    <div>{item.title}</div>
                    {/* relativeDay is always English ("today"/"3 days ago") —
                        its own dir="ltr" isolate keeps it from inheriting a
                        Farsi title's RTL base. */}
                    <div className="tiny faint">
                      due <span dir="ltr">{relativeDay(r.dueDate, now)}</span>
                    </div>
                  </div>
                  <div className="row" style={{ flex: 'none', marginInlineStart: 'auto' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Hide for the rest of today (no schedule change)"
                      onClick={() => notNowReview(r.id)}
                    >
                      Not now
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Move the review 2 days from today"
                      onClick={() => snoozeReview(r.id)}
                    >
                      +2d
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => {
                        if (active && active.itemId !== item.id) return;
                        if (activeRoutine) return;
                        startItemSession(item.id);
                        navigate('/active');
                      }}
                      aria-label={`Review ${item.title}`}
                    >
                      <PlayIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="tiny faint">Practising completes a review; “Not now” hides it until tomorrow; “+2d” moves its date.</div>
        </section>
      )}

      {/* 6 · Where you are on this instrument's path. */}
      {pathway && stage && (
        <Link
          to={`/pathway/${pathway.id}/${stage.id}`}
          className="card card-link row"
          style={{ gap: 10 }}
        >
          <PathIcon width={16} height={16} style={{ color: 'var(--accent)', flex: 'none' }} />
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="truncate">
              <span className="dim">Now in:</span> {stage.code}
              {stage.title !== stage.code ? ` · ${stage.title}` : ''}
            </div>
            {stageSp && (
              <div className="row" style={{ gap: 8, marginTop: 6 }}>
                <span className="balance-track grow" style={{ maxWidth: 180 }}>
                  <span className="balance-fill" style={{ width: `${stageSp.percent}%` }} />
                </span>
                <span className="tiny faint mono-num">
                  {stageSp.done}/{stageSp.total}
                </span>
              </div>
            )}
          </div>
          <ChevronRightIcon width={16} height={16} className="faint" style={{ flex: 'none' }} />
        </Link>
      )}

      {/* 7 · Shaky material, quick capture, and the open-ended start. */}
      {fragile.length > 0 && (
        <section className="stack-sm">
          <h2 className="title-md">Shaky right now</h2>
          <div className="card card-flush list">
            {fragile.slice(0, 4).map((item) => (
              <Link key={item.id} to={`/items/${item.id}`} state={{ from: '/' }} className="list-row card-link" dir="auto" style={{ borderRadius: 0 }}>
                <div className="grow truncate">{item.title}</div>
                <StatusBadge status={item.status} />
                <ChevronRightIcon width={16} height={16} className="faint" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <QuickAdd />

      <Link to="/start" className="btn btn-block">
        Choose something else to practise…
      </Link>
    </div>
  );
}

/**
 * How much you have actually practised — one quiet line for today and this
 * week, scoped to the session instrument like everything else on this screen.
 * CALENDAR figures: a block from late last night belongs to yesterday, and the
 * week starts Monday. Neutral counts only — the moment this grows a goal, a
 * streak or a bar that fills, it stops being an observation and starts being a
 * judgement.
 */
function PractisedLine({ instrumentId, now }: { instrumentId: string; now: Date }) {
  const db = useStore((s) => s.db);
  const totals = useMemo(
    () => practiceTotals(db.blocks.filter((b) => b.instrumentId === instrumentId), now),
    [db.blocks, instrumentId, now],
  );
  // Gated on ALL TIME, not this week: once there is any practice to report, a
  // quiet "0 min today" on a fresh Monday is the honest answer, where hiding
  // the line entirely would read as a missing feature.
  if (totals.allTime.blocks === 0) return null;
  return (
    <p className="tiny faint">
      Practised today: {totals.today.minutes} min · {blockCount(totals.today.blocks)}. This week:{' '}
      {totals.week.minutes} min · {blockCount(totals.week.blocks)}.{' '}
      <Link to="/insights" className="link">
        All time
      </Link>
    </p>
  );
}

function blockCount(n: number): string {
  return `${n} block${n === 1 ? '' : 's'}`;
}

// --- The deliberate cross-instrument overview ---------------------------------

function OverviewView({ now }: { now: Date }) {
  const db = useStore((s) => s.db);
  const setSessionInstrument = useStore((s) => s.setSessionInstrument);
  const navigate = useNavigate();

  const lessonDates = useMemo(() => nextLessonDates(db.lessons, now), [db.lessons, now]);
  const balance = useMemo(
    () => instrumentBalance(db.instruments.filter((i) => i.active), db.blocks, now, 7),
    [db.instruments, db.blocks, now],
  );
  const insight = useMemo(() => insightOfTheDay(generateInsights(db, now), now), [db, now]);

  return (
    <div className="stack-lg">
      <p className="page-sub" style={{ marginTop: -8 }}>
        A calm look across all instruments. Pick one above when you sit down to practise.
      </p>

      <section className="stack-sm">
        <h2 className="title-md">Each instrument, at a glance</h2>
        <div className="card card-flush list">
          {db.instruments
            .filter((i) => i.active)
            .map((inst) => {
              const recs = recommend(
                db.items.filter((x) => x.instrumentId === inst.id),
                db.blocks.filter((b) => b.instrumentId === inst.id),
                now,
                lessonDates,
              );
              const lessonDate = lessonDates.get(inst.id);
              return (
                <button
                  key={inst.id}
                  className="list-row card-link"
                  style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}
                  onClick={() => {
                    setSessionInstrument(inst.id);
                    navigate('/');
                  }}
                >
                  <div className="grow" dir="auto" style={{ minWidth: 0, textAlign: 'start' }}>
                    <div>{inst.name}</div>
                    {/* Fixed English copy with the next item's own
                        (possibly Farsi) title embedded mid-sentence — its
                        own dir="ltr" isolate fixes the sentence's bidi base
                        regardless of the embedded title, the same shape
                        StageDetail's undo banner already uses. */}
                    <div className="tiny faint truncate">
                      <span dir="ltr">
                        {recs.best ? `next: ${recs.best.score.item.title}` : 'nothing queued'}
                        {lessonDate ? ` · class ${relativeDay(lessonDate, now)}` : ''}
                      </span>
                    </div>
                  </div>
                  <ChevronRightIcon width={16} height={16} className="faint" />
                </button>
              );
            })}
        </div>
      </section>

      {insight && (
        <section className="card">
          <div className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
            <SparkIcon width={20} height={20} style={{ color: 'var(--gold)', flex: 'none', marginTop: 2 }} />
            <div>
              <div className="section-label" style={{ marginBottom: 4 }}>
                Insight
              </div>
              <div>{insight.body}</div>
            </div>
          </div>
        </section>
      )}

      <section className="stack-sm">
        <h2 className="title-md">Balance · last 7 days</h2>
        <div className="card stack-sm">
          {balance.every((b) => b.minutes === 0) ? (
            <div className="small dim">No practice logged in the last 7 days yet.</div>
          ) : (
            balance.map((b) => (
              <div key={b.instrumentId} className="balance-row">
                {/* The instrument name is the owner's own editable text — its
                    own dir="auto" isolate, nested inside .truncate rather than
                    on it (a title class may never carry dir="auto" directly).
                    Not on the row itself: .balance-row is a CSS grid and
                    giving it a resolved RTL direction would reverse its three
                    columns, jumping the bar and percentage to the other side
                    for a Farsi instrument — this isolates the text only. */}
                <span className="small truncate">
                  <span dir="auto">{b.instrumentName}</span>
                </span>
                <span className="balance-track">
                  <span className="balance-fill" style={{ width: `${b.percent}%` }} />
                </span>
                <span className="tiny faint mono-num" style={{ textAlign: 'right' }}>
                  {b.percent}%
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <Link to="/insights" className="btn btn-block">
        More insights →
      </Link>
    </div>
  );
}
```

## Check against the contract

- [ ] **ac-1** — REGRESSION GUARD, stated as such: the tri-state close decision is pure and sits in forbidden territory, so this test cannot fail from this lane's edits — it exists to prove the restructure did not reach past its scope. It discriminates 'no result chosen' (item's next review date kept) from 'review genuinely declined' (date cleared), the two states a skipped tap used to conflate. _(proof: keeps the item's review date when no result was chosen and still clears it when a review is declined)_
- [ ] **ac-2** — REGRESSION GUARD, same standing as the previous one: a resultless close leaves the item's open Review row OPEN while a genuine decline completes it. Green today and must stay green; it proves scope was respected, not that the new wiring is correct. _(proof: leaves an open review row open when no result was chosen and still completes it on a genuine decline)_
- [ ] **ac-3** — THIS is the check that guards the restructure. CloseBlock is collapsed to a SINGLE ReviewPlan value, and the new pure formatter reports exactly that plan's dueDate, reviewType and rationale — so the collapsed line and the expanded date field are two renderings of one value and a divergent date becomes unrepresentable, the way installDatabase's signature makes an un-reset install unrepresentable. New formatter in src/components/format.ts, tested in a new src/components/format.test.ts under the existing node environment. _(proof: the one-line review summary reports exactly the ReviewPlan's due date, type and rationale)_
- [ ] **ac-4** — An explicitly listed set of (foreground token, background token) pairs — the ones the app actually renders small text in, written out in the test so a reviewer can see exactly what is and is not covered — meets WCAG AA (4.5:1). The list must include the two pairs measured as failing at HEAD: --accent-contrast on --accent (the primary Start button's own label, 3.95 in light) and --text-faint on --bg (2.89 light, 3.68 dark). Ratios are computed from the shipped stylesheet and asserted in EVERY block where those tokens are declared, not the first: global.css declares the light palette twice — at :root[data-theme='light'] (line 80) and again inside @media (prefers-color-scheme: light) { :root:not([data-theme]) } (line 114) — and the duplicate is what an owner who has never picked a theme actually sees. A regression in either block fails the suite. The claim is bounded to the listed pairs; it is not a claim about every theoretically possible combination. New test in src/styles/contrast.test.ts. _(proof: every listed colour pair meets WCAG AA in every block where its tokens are declared)_
- [ ] **ac-5** — The direction sweep is provably complete rather than spot-checked, which is what stops a reviewer later finding 'PathwayDetail was a stated surface but one title was missed'. The test scans the source and asserts BOTH halves: (a) no element carrying a title class (truncate, title-md, page-title, stage-unit-title) carries dir="auto" directly any more — a missed title still has it and fails; and (b) every file on the recorded surface list carries direction on at least one group element that is neither a title nor an input/textarea — so a whole skipped file fails, and 'fixing' it by deleting the attribute fails too. Genuine exceptions live in an explicit allowlist inside the test, so they are visible to the reviewer. New test in src/components/direction.test.ts. _(proof: direction lives on the group: no title element carries dir="auto", and every listed surface has one)_
- [ ] **ac-6** — On the owner's iPhone, in the INSTALLED PWA, Farsi and English are discriminated correctly rather than uniformly re-aligned: a Farsi item's title AND its own details both align to the right edge, while an English item's title and details both stay on the left — checked on Today (the Practise-now card, a due-review row and the class row), Start, Active, Close, Repertoire and Lessons. A card where the title and its details still point at opposite edges fails, and so does an English card that has started aligning right. This check is deliberately REPRESENTATIVE, not exhaustive: completeness across all 16 surfaces is the automated direction test's job, and this one proves that what the test enforces actually renders correctly on the device. _(proof: manual:OWNER)_
- [ ] **ac-7** — On the owner's iPhone at 390x844 with the recommendation moved above the two doorways: Practise now is the first thing under the instrument switcher, 'Plan this session' and 'Routines' are both still reachable without scrolling and still open independently, and the owner judges the new order better than the old. If it reads worse, the order reverts before the lane ships — that reversal is a passing outcome of this check, not a failure of the lane. _(proof: manual:OWNER)_
- [ ] **ac-8** — The saved-data boundary, end to end on the restructured screen — the one check that can actually fail from this lane's edits. Close three blocks on the same item and discriminate the outcomes: (a) 'Save without a result' leaves the item's next review date unchanged and leaves it listed under Due reviews; (b) choosing a result saves EXACTLY the date the collapsed line showed before saving, verified by reopening the item; (c) opening the controls and answering 'Should this come back? No' clears the date and removes it from Due reviews. If the restructure has rewired the tri-state mapping, (a) and (c) stop differing — which is the bug this app already paid a heavy lane to fix once. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/CloseBlock.tsx
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx
- **capture-a-practice-item** — touched via src/pages/ItemDetail.tsx
- **clear-a-due-review** — touched via src/pages/Today.tsx
- **log-a-class** — touched via src/pages/Lessons.tsx, src/components/Attachments.tsx
- **point-this-device-at-the-nas** — touched via src/pages/Lessons.tsx
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx
- **prepare-for-the-next-class** — touched via src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx
- **see-practice-patterns** — touched via src/pages/Insights.tsx, src/pages/Today.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **back-up-and-restore** — shares route "/settings" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx matched changed file(s) src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/pages/Repertoire.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/ItemDetail.tsx matched changed file(s) src/pages/ItemDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx matched changed file(s) src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx, src/components/Attachments.tsx matched changed file(s) src/components/Attachments.tsx, src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Lessons.tsx matched changed file(s) src/pages/Lessons.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/pages/StartBlock.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx matched changed file(s) src/components/ClassQuestions.tsx, src/pages/CloseBlock.tsx, src/pages/Lessons.tsx, src/pages/TeacherReport.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx matched changed file(s) src/pages/ActiveBlock.tsx, src/pages/SessionPlan.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Insights.tsx, src/pages/Today.tsx matched changed file(s) src/pages/Insights.tsx, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx matched changed file(s) src/pages/PathwayDetail.tsx, src/pages/RoutineRunner.tsx, src/pages/StageDetail.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — unchanged

Settings.tsx is a forbidden path in this lane and was not touched; the only file these flows share with this diff is src/styles/global.css, where eight light and four dark colour tokens moved to clear WCAG AA. Nothing about exporting, importing or restoring an archive changed — no control, copy, route or store action differs.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx, index.html, vite.config.ts and the service-worker registration are all forbidden paths in this lane and were not touched. The only shared file is src/styles/global.css, and only colour tokens moved there — the update banner, the build stamp and the install flow are byte-identical.

## sync-devices-via-github — unchanged

src/store/** and src/domain/** are forbidden in this lane and unchanged, so decideSync, the snapshot format, the conflict flow and the PAT handling are byte-identical. The only shared file is src/styles/global.css, where colour tokens moved for contrast; SyncNotice lives in Layout.tsx, also untouched.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### browse-my-repertoire — Works now

Touchpoints: src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts

Evidence: 5 steps: 5 manually verified

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 manually verified

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260911-lay-practice-out-for-the-content-it-hold-4c24' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260911-lay-practice-out-for-the-content-it-hold-4c24/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
