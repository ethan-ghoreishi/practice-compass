---
id: 20260928-unify-repertoire-discovery-musical-metad-1516
contractId: 20260928-unify-repertoire-discovery-musical-metad-1516
patchId: 0f9598b3c67ee86a7243d073f9a933eebe4b3ceb
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-09-30T17:56:49.960Z
sealedAt: 2026-09-30T17:59:56.880Z
---

# Review: Unify repertoire discovery, musical metadata and pathways around a calmer practice interface

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260928-unify-repertoire-discovery-musical-metad-1516
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/39
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `0f9598b3c67ee86a7243d073f9a933eebe4b3ceb`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The Delta this change was framed from

# Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

_approved · about "browse-my-repertoire" step 1_

## Today

Repertoire browsing depends on separate raw-text groups and placement-based catalogue lookup; reference, owned practice and source concepts are inconsistently presented.

## Instead

Browse owned music through shared term-aware search and facets, retain browsing context, and follow or hide reference suggestions without duplicating or deleting practice data. Setar/Tar share reference definitions, not practice state.

## Keep

- Owned PracticeItem is the practice unit.
- Core practice/scheduling and local-first guarantees.
- Existing owner data and explicit additive defaults.

## New assumptions

- NAS refresh delay was external indexer timing, not an app relocation defect.

## Show me

On phone and desktop, find the same work by Farsi/Latin term or maestro, open and return without losing filters, move it out of a stage and add its reference without duplication, hide/restore suggestions, and install Tar's shared radif view with independent practice. Show unclassified works, safe legacy migration, honest failed saves and the actual iPhone keyboard recovery.



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

**Approved intent:** `.prismatica/intents/20260928-unify-repertoire-discovery-musical-metad-1516.md`

**Findings from the previous review:**

- **Native iPhone bottom navigation recovers after keyboard dismissal** — ac-24 remains outstanding for final HEAD b5ec595. docs/repertoire-experience.md:92-104 records measurements from the preceding standalone-height candidate and explicitly leaves final owner confirmation open. Sweep checked shell/tab CSS, Layout scroll ownership, viewport decision, guard lifecycle, trace recorder, More controls and browser fixtures. Their bounded mechanisms are clean; native final-build acceptance remains unproved.
  _counterexample:_ The final standalone 100vh fix has no recorded passing owner-device acceptance covering Safari and installed PWA, Done with retained focus, repeated keyboard cycles, scrolling, rotation, route changes, background/resume and zoom, with no lifted bar, occluded editing or lost text. Run and record those cases on the final build before closing this family; no claim is made that the final patch still reproduces the defect.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 80f66dfdb28accfdad2fc5b0df3fc6c4d4d2db2d..28296775ebe84fbf4dffb6177f5dba001a5755bc 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -3047,8 +3047,8 @@ full teardown, no-op without `visualViewport`). **THE OWNER'S LIFTED BAR IS NOT
 iPhone trace (installed app) showed every scroll offset at 0 while `innerHeight` — so `100dvh` —
 flipped between the full screen and the screen minus the status bar. MEASURED on iOS 27, the
 installed app's `100vh` stayed the full screen, so standalone sizes the shell `100vh`; browser
-tabs traced correctly on `100dvh` and keep it. Confirmed on one device only — ac-24 is the
-owner's. More → Keyboard trace (memory only) records geometry and what each unit and inset
+tabs traced correctly on `100dvh` and keep it. Owner-passed (ac-24, b5ec595) on one iPhone,
+iOS 27 only. More → Keyboard trace (memory only) records geometry and what each unit and inset
 resolves to; diagnose from traces, never by adding guesses to the guard. Five EQUAL nav tabs
 (no raised centre button — Today owns the primary Start
 action); route changes scroll `<main>` to top; per-route page widths (narrow for focused
diff --git a/DECISIONS.md b/DECISIONS.md
index 2d494ae2066870ded33762879260117b9076ee3b..e7da213fcff88bd274b588a0cf8125add2f59c20 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -65,7 +65,8 @@ and the proof route.
   focused, so "Done" with focus retained never restored the lifted shell, and it scrolled with
   timers. `viewport.ts` restores the document scroll only once the visual viewport is full height
   at scale 1, never touches `<main>`, and has no timers. It is proved against scripted geometry
-  in both engines; the native iPhone trace (ac-24) is outstanding until the owner records it.
+  in both engines. The native iPhone fix (standalone shell `100vh`) PASSED the owner's ac-24
+  check on build b5ec595, installed PWA and Safari, 2026-09-30 (docs/repertoire-experience.md).
 - **"Practice list" keeps its name.** The plan spoke of "All practice items"; three existing
   journeys and AGENTS.md's canonical names use "Practice list", so the view kept it.
 
diff --git a/docs/repertoire-experience.md b/docs/repertoire-experience.md
index bc09e2ca8ac36988f8e9fdfba854ff9312578c0e..4787312cd7d6774032825ebcb61b81f38941128d 100644
--- a/docs/repertoire-experience.md
+++ b/docs/repertoire-experience.md
@@ -100,9 +100,19 @@ Chrome tabs: the bar was flush and stayed so (`100dvh` = `innerH` at rest, 695 a
 never match the standalone query and are unchanged. The installed-app guard DID act once per
 dismissal here (`scrollY` 59 → 0), which was the 59 px of document the 911 shell made
 scrollable. `100vh` in standalone is still a reading from one device and one iOS version, and
-the "more persistent" report stays unexplained; ac-24 closes on the owner's confirmation, not
-on this page. The old "scroll the focused field into view after 300 ms" behaviour was removed,
-not replaced.
+the "more persistent" report stays unexplained. The old "scroll the focused field into view
+after 300 ms" behaviour was removed, not replaced.
+
+**ac-24 — PASSED on the owner's own iPhone, final build `b5ec595` (owner report, 2026-09-30).**
+Tested in BOTH the installed Practice Compass PWA and a Safari tab, each covering: typing in a
+field near the bottom, tapping Done with focus retained, repeated keyboard open/close cycles,
+scrolling, portrait/landscape rotation, route/tab changes, background/resume, and zoom where
+available. In every case the bottom navigation returned to, or stayed, flush with the physical
+bottom; no field became unusable or problematically obscured; typed text was retained. The
+device and iOS version (27.0) are those of the second-round traces above; the final-build pass is
+the owner's observation, not a further trace. Scope of the claim: plain-http layout on this one
+device and iOS version. The installed app's OFFLINE behaviour over HTTPS is not part of this
+report.
 
 **Capturing the trace (ac-24).** Three recordings — the installed app, a Safari tab, a Chrome
 tab — each started with the bar confirmed flush at the bottom (cold-start the installed app):
```

**Paths the rework touched:**

- `AGENTS.md`
- `DECISIONS.md`
- `docs/repertoire-experience.md`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
56b99dc Record ac-24 owner pass on final build b5ec595

The owner confirmed on their own iPhone, installed PWA and Safari, that the
bottom navigation stays flush through typing, Done with retained focus,
repeated keyboard cycles, scrolling, rotation, route changes,
background/resume and zoom, with no occluded field and no lost text.
Evidence and its scope (one device, iOS 27, layout over plain http, offline
HTTPS not covered) recorded in docs/repertoire-experience.md; DECISIONS.md and
AGENTS.md updated in place. No code or layout change.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

1fd54e4 Check records for 20260928-unify-repertoire-discovery-musical-metad-1516

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Check against the contract

- [ ] **ac-1** — Legacy/current/partial v15 fixtures migrate identically across clocks and repeated runs, preserve authored strings and IDs, leave deliberately empty collections empty and handle pre-v3 seeding deterministically. No new deletion waiver. _(proof: repertoire v15 migration is deterministic idempotent and lossless)_
- [ ] **ac-2** — Wrong types, duplicate new IDs, wrong-kind/dangling term refs and invalid binding/suppression records refuse installation, while unknown/ambiguous legacy strings remain exact and usable. _(proof: repertoire identity validation refuses malformed state without discarding legacy evidence)_
- [ ] **ac-3** — Curated unique aliases group Shur and شور; ambiguous names, composites and substrings never establish identity. Renamed and archived terms retain stable references; broader search matching does not change ownership. _(proof: musical term resolution separates exact identity from broad search)_
- [ ] **ac-4** — Real add/rename/alias/archive/restore/delete controls preserve references across reload, refuse referenced/built-in deletion and alias collisions, and retain drafts through failed acknowledged saves and retry. _(proof: musical term management preserves identities and reports durable saves honestly)_
- [ ] **ac-5** — Combined query/facets find terms, maestros, sources, raw text and existing archive aliases; title-only Persian full pieces remain visible, parents occur once, matching parts expose their parent and empty results are clear. _(proof: repertoire discovery includes every eligible work without duplicate parents)_
- [ ] **ac-6** — Rendered My repertoire, All practice items and Start share text matching but retain eligibility differences; switching views and back/forward preserve browse state without changing Today's session instrument. _(proof: repertoire navigation restores browse context without changing session scope)_
- [ ] **ac-7** — Reference Add/Start/row/progress/course-file consumers agree after detach, move, stage/path deletion and reload; repeat stale Add reuses one item; same generic keys across distinct contexts never conflate. _(proof: catalogue identity survives placement changes across every consumer)_
- [ ] **ac-8** — Link existing preserves all owner fields; ambiguous legacy matches and duplicates require an explicit choice, never first-match/title merging. Several references can deliberately reuse one item; cross-instrument reuse refuses. _(proof: catalogue linking preserves owner records and refuses ambiguous automatic reuse)_
- [ ] **ac-9** — Hiding/restoring survives reload and backup round trip, affects only reference visibility in its context, preserves explicitly placed and owned work, and keeps progress/next suggestion consistent without treating hidden work as done. _(proof: hidden reference suggestions never delete or complete owned practice)_
- [ ] **ac-10** — Existing additive installation restores only missing selected defaults/stages, preserves edited rows and routines and never auto-reseeds on load. Archive/restore and repeated no-op actions are idempotent. _(proof: pathway restoration remains explicit additive and lossless)_
- [ ] **ac-11** — Unlink reference and Remove from pathway retain notes, attachments, lesson/agenda/routine links, children, reviews and all history, even for a new never-practised item. No catalogue shortcut calls automatic item deletion. _(proof: pathway removal keeps enriched and never practised owner items)_
- [ ] **ac-12** — One shared contextual Persian catalogue yields independent Setar/Tar instances; duplicate gusheh names stay scoped, new gusheh items receive modal metadata, and existing Guitar/Honarestan/Khonyagar work/material identities remain intact. _(proof: Setar and Tar share reference definitions without sharing practice state)_
- [ ] **ac-13** — Upgrade leaves the old mixed Setar path, generic-form items, text, pins and routines unchanged. Explicitly adding the new radif view reuses proven bindings; Forms derives actual works from the term vocabulary and creates no generic form item. _(proof: new Persian reference views preserve existing Setar organisation)_
- [ ] **ac-14** — Today, both SessionPlan derivations, Repertoire and PathwayDetail use the same visible ordered pathway and pinned stage, including archived/deleted pins and equal-order tie cases, without changing scheduling decisions. _(proof: pathway context readers agree on visible routes and pinned stages)_
- [ ] **ac-15** — New source choices describe collections/materials; legacy kinds and hidden fields survive edit/export, session instrument defaults correctly, and known course-source renames reuse stable provenance while ambiguous candidates require choice. _(proof: study sources clarify new choices without rewriting legacy meaning)_
- [ ] **ac-16** — Every inbound door installs valid v15 and legacy fixtures consistently and refuses malformed/unsupported state before replacement: full/state-only import, fake-remote pull, Keep remote, archive restore, cold recovery and both hydration paths. Preserve existing byte/session/revision guards. _(proof: every inbound door enforces the repertoire v15 boundary)_
- [ ] **ac-17** — Export/import and content hashing preserve terms/bindings/hides and custom strings. A disposable baseline v14 reader refuses a v15 backup without replacing state/blobs; current reader accepts prior backups. _(proof: repertoire backups round trip and older readers refuse v15 safely)_
- [ ] **ac-18** — Source metadata adoption understands term-backed and literal fields while retaining raw source facts, owner edits and stale-premise refusals; archive identity/location/refresh outcomes remain unchanged for existing fixtures. _(proof: musical metadata integration preserves archive reconciliation boundaries)_
- [ ] **ac-19** — Actual rendered Chromium/WebKit phone and desktop journeys exercise browse/edit/add/link/hide/restore/Tar/source/term flows plus Today/Start/Active/Close, reload/offline/failure states and all pageerrors. Assert real saved state as well as UI. _(proof: the unified repertoire journey works in Chromium and WebKit)_
- [ ] **ac-20** — Chosen viewport mechanism handles retained focus, blur, repeated geometry changes, zoom, absent VisualViewport, route teardown and hardware-keyboard geometry without timer guesses, forced blur or scrolling loops. Expected geometry is fixture-authored, not copied from implementation. _(proof: viewport recovery respects focus zoom and scroll ownership)_
- [ ] **ac-21** — Both engines demonstrate mixed-script wrapping, labelled controls, keyboard access, focus visibility, theme contrast, reflow and accessible empty/error states at phone/desktop widths; Today preserves the owner's ordering and visible recommendation. _(proof: the shared practice shell remains accessible and readable across layouts)_
- [ ] **ac-22** — Before/after projections for term/source/reference/pathway administration leave practice history, item status/ratings/SM-2/dates, notes, reviews, agenda and unfinished block/routine/plan untouched apart from explicitly chosen organisation fields. _(proof: repertoire administration never fabricates or resets practice evidence)_
- [ ] **ac-23** — Before first review, inspect the committed consumer/invariant matrix, independent fixture expectations and reproducible focused runner; every acceptance title maps to exactly one test, both engines actually ran, and proof limits are explicit. _(proof: manual:OWNER)_
- [ ] **ac-24** — On the owner's actual iPhone Safari and installed PWA, record device/iOS version and before/after viewport traces, keyboard Done with retained focus, repeated opening/dismissal, scroll, rotation, route change, background/resume and zoom. Verify no residual lifted bar, occluded editing or lost text. Without device evidence this remains outstanding. _(proof: manual:OWNER)_
- [ ] **ac-25** — Review the coherent phone/desktop journey and partial radif labels against source evidence. Confirm useful Forms browsing, maestro discovery, screen-reader/keyboard operation, Plan then Routines ordering and start/close budgets. Keep a pre-upgrade full backup; approve migration on a disposable copy before any real upgrade. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/domain/types.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/domain/io.ts, src/store/useStore.ts
- **browse-my-repertoire** — touched via src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts
- **capture-a-practice-item** — touched via src/components/ItemForm.tsx, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts, src/domain/selectors.ts
- **log-a-class** — touched via src/domain/selectors.ts, src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/pages/StartBlock.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx, src/domain/io.ts
- **sync-devices-via-github** — touched via src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts, src/pages/Repertoire.tsx

**Possibly affected (shares a mechanic with a detected flow):**

- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/types.ts, src/store/useStore.ts matched changed file(s) src/domain/types.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/io.ts, src/store/useStore.ts matched changed file(s) src/domain/io.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Repertoire.tsx, src/pages/ItemDetail.tsx, src/pages/Materials.tsx, src/domain/repertoire.ts, src/domain/persian.ts, src/domain/farsi.ts matched changed file(s) src/domain/farsi.ts, src/domain/persian.ts, src/domain/repertoire.ts, src/pages/ItemDetail.tsx, src/pages/Materials.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/components/ItemForm.tsx, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts matched changed file(s) src/components/ItemForm.tsx, src/domain/factories.ts, src/pages/ItemDetail.tsx, src/pages/NewItem.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/store/useStore.ts, src/domain/selectors.ts matched changed file(s) src/domain/selectors.ts, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/selectors.ts, src/store/useStore.ts matched changed file(s) src/domain/selectors.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/pages/StartBlock.tsx, src/store/useStore.ts matched changed file(s) src/pages/StartBlock.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts matched changed file(s) src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## see-practice-patterns — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Today.tsx, src/domain/io.ts matched changed file(s) src/domain/io.ts, src/pages/Today.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/App.tsx matched changed file(s) src/App.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts, src/pages/Repertoire.tsx matched changed file(s) src/domain/pathwaySeed.ts, src/domain/pathways.ts, src/pages/PathwayDetail.tsx, src/pages/Repertoire.tsx, src/pages/StageDetail.tsx (+1 more). Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## install-the-app-and-keep-it-current — unchanged

Settings, the service worker, the update banner and the build stamp are untouched; the shared /settings route is only where another flow's page lives.

## point-this-device-at-the-nas — unchanged

The per-device media base, its normalisation and Settings are untouched; course material still resolves through the same mediaRoot/baseForItemFile path, only its catalogue key lookup now goes through a stable reference id.

## prepare-for-the-next-class — unchanged

lessonAgenda, its queries, ClassQuestions and LessonAgenda are untouched; PracticeItem only gains an optional catalogRefs list and term-aware metadata, neither of which the agenda or lesson urgency reads.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 manually verified

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 manually verified

### browse-my-repertoire — Works now (update proposed)

Proposed step changes:
− The musician Chooses 'My repertoire'.
−   Shows: Persian works grouped under their dastgāh — radif gushehs and composed maestro pieces side by side — and other instruments grouped by study source.
−   Changes: Nothing; this is a lens over ordinary items, not a separate store.
− Practice Compass Folds dastgāh spelling variants together, labels each group with the user's own majority spelling, and keeps parts nested under their parent work.
−   Shows: Each work appears exactly once, however many sources, stages and lessons it is linked to.
− The musician Optionally filters by form, or narrows to one instrument.
−   Shows: Form chips built from what is actually present.
− The musician Or chooses 'Practice list' and filters by search, instrument, status, type, or a quick chip (due today, for class, fragile, neglected, overworked, teacher question).
−   Shows: Items in priority order, each with its status and stats.
− The musician Opens an item.
−   Shows: Its page: status, connections, stats, result trend, recent blocks, parts, notes and files.
−   Changes: Nothing until an action is taken there.
+ The musician Opens Repertoire, or picks one of the three peer views: My repertoire, Pathways or Practice list, and one instrument (or All).
+   Shows: Works grouped by dastgāh (Persian) or study source (others); unclassified works under "No dastgāh yet"; each work once, parts nested.
+   Changes: Nothing but the URL: view, instrument, query and filters live there, and Today's session instrument is never changed.
+ Practice Compass Groups each classifying value by the shared vocabulary: a term reference, or text that is exactly one curated spelling of a term, joins that term; composites and unknown spellings stay the owner's own text.
+   Shows: «Shur» and «شور» in one group labelled with the term's name; the owner's text is never rewritten.
+ The musician Searches (title, gusheh, dastgāh/form/maestro in any spelling, study source, archive aliases) and narrows by Dastgāh, Form or Composer, or regroups by form, composer or source.
+   Shows: Facets built only from the works actually owned; a matching part shows its parent once; "No works match" with Clear filters when nothing does.
+ The musician Or chooses Practice list and filters by the same search, status, type or a quick chip.
+   Shows: Every practice item in priority order, parts included, under Practice list's own eligibility.
+ The musician Opens an item, then comes back by its back link or browser back.
+   Shows: The same view, instrument, query and filters as before.

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

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

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
− Practice Compass Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
−   Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.
− The musician Taps + on a suggestion.
−   Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
−   Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.
− The musician Undoes it, or removes it later from the row's − button, if it was added by mistake.
−   Shows: The row reverts to a suggestion.
−   Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.
+ Practice Compass Shows the stage's rows: the owner's items laid over the stage's reference suggestions, each suggestion resolved to the owner's item by its reference binding on the pathway's instrument — never by where the item sits.
+   Shows: 'n/m solid' over the visible rows; suggestions hidden in this pathway are omitted; two legacy copies answering one suggestion show as a choice.
+ The musician Taps + on a suggestion.
+   Shows: 'Added … — not practised yet.' The row now plays that item.
+   Changes: A practice item is created bound to the suggestion's reference; tapping again, after a move or a reload, hands back the same item — adding is organisation, not progress.
+ The musician Optionally uses a row's ⋯ menu: Link an existing item, Unlink reference, Remove from pathway, or Hide this suggestion (restored from 'Hidden suggestions').
+   Changes: Only organisation: Link sets one item's binding (same instrument only); Unlink drops one binding; Remove from pathway clears placement and hides the suggestion in this pathway; Hide is visibility only. Nothing is deleted — Delete practice item stays on the item's own page.
  The musician Taps ▶ on a row to practise it.
    Shows: The ordinary active block.
    Changes: A suggestion not yet added is added first, then the block opens.
− The musician Optionally pins the stage as the current one, or edits its code, title and intro.
−   Shows: Today's 'Now in:' card points at the pinned stage.
−   Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.
+ The musician Optionally pins the stage as the current one, edits it, or archives/restores the pathway.
+   Shows: Today, the Session Plan and Repertoire follow the same visible pathway and pinned stage.
+   Changes: The pathway records the pin or its archived state; deleting a stage or pathway detaches items instead of deleting them.

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260928-unify-repertoire-discovery-musical-metad-1516' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260928-unify-repertoire-discovery-musical-metad-1516/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
