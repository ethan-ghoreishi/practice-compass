---
id: 20260928-unify-repertoire-discovery-musical-metad-1516
contractId: 20260928-unify-repertoire-discovery-musical-metad-1516
patchId: 02dc26ef2cd5fa856dbfa7605d9946dd63727268
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Native iPhone bottom navigation recovers after keyboard dismissal
    summary: ac-24 remains outstanding for final HEAD b5ec595.
      docs/repertoire-experience.md:92-104 records measurements from the
      preceding standalone-height candidate and explicitly leaves final owner
      confirmation open. Sweep checked shell/tab CSS, Layout scroll ownership,
      viewport decision, guard lifecycle, trace recorder, More controls and
      browser fixtures. Their bounded mechanisms are clean; native final-build
      acceptance remains unproved.
    counterexample: The final standalone 100vh fix has no recorded passing
      owner-device acceptance covering Safari and installed PWA, Done with
      retained focus, repeated keyboard cycles, scrolling, rotation, route
      changes, background/resume and zoom, with no lifted bar, occluded editing
      or lost text. Run and record those cases on the final build before closing
      this family; no claim is made that the final patch still reproduces the
      defect.
createdAt: 2026-09-30T16:40:32.538Z
sealedAt: 2026-09-30T17:38:29.773Z
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
- **Diff patch-id:** `02dc26ef2cd5fa856dbfa7605d9946dd63727268`
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

- **Native iPhone bottom navigation recovers after keyboard dismissal** — ac-24 fails: the owner still reproduces a raised bottom bar after dismissing the keyboard on an actual iPhone. Browser geometry fixtures do not establish Safari or installed-PWA acceptance. Sweep checked shell/tab CSS, Layout, useViewportGuard, viewport decision and browser fixture; native behaviour remains failing and its mechanism unmeasured.
  _counterexample:_ On the owner's iPhone, focus and type in an input, dismiss the keyboard, and observe the Today/Repertoire/Start/Lessons/More bar remain displaced. Capture the required Safari and installed-PWA traces before claiming recovery.
- **Owned work and stage suggestion present one clear musical work** — Placing an owned item changes stageId without binding the matching reference. stageUnits then shows the unbound suggestion followed by the owned item, and Add can create another item. Sweep checked Item Detail placement, catalogue Add/Play, resolution, stage rows, progress/next-unit, explicit link, unlink, hide/restore and removal. Explicit linking is clean; the ordinary placement journey remains misleading. Preserve explicit identity choice and owner data.
  _counterexample:_ Place سیخی-ابوعطا-ردیف-میرزاعبدالله in the stage containing the سیخی reference. The stage shows both rows; tapping Add on سیخی creates a second practice item instead of making the existing relationship clear and actionable.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 8ff05404fe9cfd9a02395313f89607412d6eb2d2..80f66dfdb28accfdad2fc5b0df3fc6c4d4d2db2d 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -538,7 +538,7 @@ MEASURED, on the owner's own network (2026‑09‑18): `http://192.168.0.113:417
 `https://192.168.0.20:...` gives `isSecureContext: true` with `crypto.subtle` present,
 self-signed Synology certificate and all — **HTTPS is a secure context whether or not the
 certificate is trusted**, so a LAN NAS route needs no public certificate to work. A build
-mirrored by `scripts/deploy-nas.sh` and opened over that HTTPS origin is the genuine route;
+served over that HTTPS origin is the genuine route;
 `http://localhost` also qualifies, because browsers privilege localhost deliberately, which
 is exactly why no test here can see any of this.
 
@@ -630,7 +630,10 @@ own pace, on a route they trust. Protect that:
   suggestion, routine segment and course file, so a move, detach, deleted stage or reload
   changes nothing and Add is idempotent. Two items answering one suggestion are shown as
   candidates, never picked; **Link existing** is an explicit same-instrument choice that
-  changes only `catalogRefs`. **Unlink reference** drops one binding (the list stays PRESENT,
+  changes only `catalogRefs`. **Placing is not linking**: an item placed in a stage that answers
+  none of its suggestions is marked so on its row (with Link to a suggestion), and Add there
+  creates nothing until the owner links one or chooses Add as a new item (`unlinkedInStage`,
+  `planStageAddition`). **Unlink reference** drops one binding (the list stays PRESENT,
   even empty, so old placement never re-binds it). **Remove from pathway** clears placement
   and HIDES the item's suggestions in that pathway (`Pathway.hiddenRefs`) without unbinding —
   a radif reference is shared by the mixed and the named Setar pathways, and unbinding would
@@ -3001,7 +3004,10 @@ the app or data private). Prod base `/practice-compass/` (override with `PC_BASE
 matches the Pages project path. CI (`ci.yml`) still gates lint + tests + build. The
 installed PWA works fully offline; hosting reliability only affects updates.
 `scripts/deploy-nas.sh` remains an OPTIONAL LAN mirror — never the primary, and no
-Tailscale requirement in the main flow.
+Tailscale requirement in the main flow. **It is DESTRUCTIVE:** `rsync --delete` empties
+`PC_DEPLOY_DIR` of everything that is not the build — pointed at a folder that also holds
+media, it deleted the owner's Setar and Tar files (2026-09-30). Never recommend it without
+naming the exact, app-only destination; guarding the script needs its own lane.
 
 **Devices sync via the user's GitHub data repo** (Settings → Sync): on app open, after
 30 quiet seconds following changes (rev-driven), on returning online, and manually.
@@ -3031,13 +3037,19 @@ which stops above the home-indicator safe area, leaving the bar floating above t
 physical bottom with dead space beneath. With `100dvh` the shell reaches the true
 bottom and the bar's own `env(safe-area-inset-bottom)` padding lifts just its buttons
 clear. **The iOS software keyboard must not drift the shell:** the document never scrolls (only
-`<main>` does), so a non-zero document scroll is WebKit moving the layout viewport. `viewport.ts`
-decides from GEOMETRY alone — never focus — restoring it to 0 only once the visual viewport is
+`<main>` does), so a non-zero scroll on the document, `body` or `#root` is WebKit moving the
+shell (`overflow: hidden` stops the owner scrolling them, not a focus reveal). `viewport.ts`
+decides from GEOMETRY alone — never focus — restoring those to 0 only once the visual viewport is
 back to full height at scale 1 (keyboard dismissed, "Done" with focus retained included), never
 while it is short (intentional reveal) or zoomed, and never touching `<main>`'s scroll;
 `useViewportGuard` is the thin adapter (visual-viewport resize/scroll and visibility, no timers,
-full teardown, no-op without `visualViewport`). Browser fixtures prove the mechanism only; the
-native iPhone check is the owner's (ac-24). Five EQUAL nav tabs
+full teardown, no-op without `visualViewport`). **THE OWNER'S LIFTED BAR IS NOT THAT:** the first
+iPhone trace (installed app) showed every scroll offset at 0 while `innerHeight` — so `100dvh` —
+flipped between the full screen and the screen minus the status bar. MEASURED on iOS 27, the
+installed app's `100vh` stayed the full screen, so standalone sizes the shell `100vh`; browser
+tabs traced correctly on `100dvh` and keep it. Confirmed on one device only — ac-24 is the
+owner's. More → Keyboard trace (memory only) records geometry and what each unit and inset
+resolves to; diagnose from traces, never by adding guesses to the guard. Five EQUAL nav tabs
 (no raised centre button — Today owns the primary Start
 action); route changes scroll `<main>` to top; per-route page widths (narrow for focused
 practice, wide ~1100px for browsing/notes on desktop); serif is for headings only,
diff --git a/DECISIONS.md b/DECISIONS.md
index 30fd6e0d78d4cea97d499adcb0a4b915fc01b660..2d494ae2066870ded33762879260117b9076ee3b 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -35,6 +35,20 @@ and the proof route.
   the named Setar pathway offer عراق as untaken after the owner tidied the old mixed pathway — Add
   there would mint a duplicate. Hiding in that one pathway keeps the owner's intent and the
   shared identity.
+- **Placing is not linking, and Add beside an unlinked placement asks.** Moving an owned item
+  into a stage changes `stageId` only, so the suggestion beside it stayed untaken and Add minted a
+  second copy of the same music. Merging the two rows on a matching title or gusheh was rejected:
+  it would make text act as identity (progress, Play and Add would all follow a guess). Instead
+  ONE list (`unlinkedInStage`) marks the placed row and holds Add (`planStageAddition`) until the
+  owner links an item or chooses Add as a new item. Until then the two rows are honestly two units.
+- **The native keyboard defect is measured on the device, not guessed at in the guard.** More →
+  Keyboard trace (memory only) records what the device reports. The first installed-app trace
+  showed a HEIGHT flip (`innerHeight`/`100dvh` 852↔793, all scroll offsets 0), so the guard's
+  scroll restore cannot be the fix. The standalone-only shell height `calc(100vh +
+  env(safe-area-inset-top))` was a candidate built on UNMEASURED readings, and the next trace
+  refuted it (911, bar cut off). With every unit measured, `100vh` was the full screen on every
+  installed-app line while `dvh` flipped, so standalone uses `100vh`; tabs keep `dvh`, which
+  traced correctly. One change per trace, guard and `interactive-widget` untouched.
 - **The Undo that deleted a "fresh" item is gone.** "Not practised yet" never proved an item was
   empty — notes, files, class links and commitments all arrive before a first block.
   `removeCatalogItem` stays only because an out-of-scope test calls it; it no longer deletes.
diff --git a/README.md b/README.md
index 787a60cc3fa8e0e03403254264cda36f3f11fbff..d488659cecd03b1c8f7273b38f8deb4e733639e7 100644
--- a/README.md
+++ b/README.md
@@ -147,7 +147,9 @@ npm run test:watch # watch mode
 Pushing to `main` deploys to GitHub Pages (CI runs lint + tests + build first). The prod
 base path is `/practice-compass/` (override with `PC_BASE=/`).
 `scripts/deploy-nas.sh` optionally mirrors the same build onto a locally mounted NAS
-share for a LAN-only copy — handy, never required.
+share for a LAN-only copy — handy, never required. **Warning:** it runs `rsync --delete`, so
+EVERYTHING in `PC_DEPLOY_DIR` that is not part of the build is deleted. Point it only at a
+folder that holds nothing but this app — never at a share or folder containing media.
 
 ---
 
diff --git a/docs/repertoire-experience.md b/docs/repertoire-experience.md
index 00291f077e655e5e4b04cac6f2b341e45b244f58..bc09e2ca8ac36988f8e9fdfba854ff9312578c0e 100644
--- a/docs/repertoire-experience.md
+++ b/docs/repertoire-experience.md
@@ -19,7 +19,7 @@ again after. Synthetic data only; the owner's database was never opened.
 | Repertoire | Opened on **Pathways**. Three views held separate state, each with its own instrument filter; a form chip row with no search; "Study sources" and a wrapping "Add practice item" crowded the header. | Opens on **My repertoire**. One instrument selector for all three peer views (My repertoire · Pathways · Practice list); view, instrument, query, facets and grouping live in the URL, so opening a work and coming back — or browser back/forward — restores them. One primary action (Add practice item, prefilled with the browsed instrument and form). |
 | My repertoire | Grouped by folded raw text («Shur» and «شور» apart); title-only full pieces silently missing; no search, no composer filter. | Search (title, gusheh, term names and spellings, source, archive aliases) + Dastgāh/Form/Composer facets from the owner's own works + group by dastgāh/form/composer/source. Every work exactly once; a matching part shows its parent; unclassified works under "No dastgāh yet"; "No works match" is announced and distinct from an empty library; Clear filters. |
 | Pathways | Card ignored the pinned stage; archived pathways invisible with no way back. | Card shows the pinned stage ("pinned"), same resolver as Today; archived pathways listed under "Archived pathways" with Restore; shipped defaults (incl. the two named radif pathways) offered by name. |
-| Stage | Every suggestion row carried the generic gusheh prompt (visually heavy); an Undo/"−" deleted a "fresh" item. | Calm rows; a 44×44 "⋯" menu per row: Link an existing item…, Hide this suggestion, Unlink reference, Remove from pathway — none deletes. Ambiguous legacy copies show "N of your items answer this — choose one". Hidden suggestions listed with Restore. |
+| Stage | Every suggestion row carried the generic gusheh prompt (visually heavy); an Undo/"−" deleted a "fresh" item. | Calm rows; a 44×44 "⋯" menu per row: Link an existing item…, Hide this suggestion, Unlink reference, Remove from pathway — none deletes. Ambiguous legacy copies show "N of your items answer this — choose one". An item placed in the stage that answers no suggestion says so ("placed here · answers no suggestion", menu: Link to a suggestion…), and Add beside it asks "Is “…” already in this stage?" — Link it, or Add as a new item — instead of minting a second copy. Hidden suggestions listed with Restore. |
 | Item form | Dastgāh/Form as free text with Latin-only datalists; composer free text. | The three fields read the shared vocabulary: picking a term links it ("Shared term"); an alias shows "Your spelling — grouped as …"; anything else stays the owner's text. |
 | Study sources | Twelve kinds mixing collections, pieces, activities and lessons; new sources defaulted to the first instrument. | Five kinds with an example each (Radif · Method book · Collection · Course · Other); an older kind stays selectable on its own source; new sources start on the browsed/session instrument. |
 | More | Insights, Teacher report, Settings. | + Musical terms (add, rename, spellings, archive/restore, delete unused custom) and Study sources. |
@@ -43,7 +43,7 @@ Reference ids: `stage:<stageId>:<key>` · `course:<courseId>:work:<identity>` ·
 | --- | --- | --- |
 | Term values on items | `ItemForm` (`MusicalTermField` → `valueFromInput`), `itemFromCatalogEntry` (radif entries carry `{termId}`), archive adoption (`sourceReconcile`, raw registry TEXT only), migration (never — legacy text is kept) | `resolveValue`/`valueLabel`/`valueGroup`/`valueSearchTexts` → `groupByDastgah`, `discoverRepertoire`, `repertoireSearchTexts` (Practice list, Start), `ItemDetail` details, `WorkRow`, `MusicalTermField`, archive suggestion comparison (`fieldAlreadySays`), `isWork`/`hasPersianIdentity`, `kindFromItem`, `validateMusicTerms` |
 | `musicTerms` | `addTerm`/`updateTerm`/`deleteTerm` (store, via `planAddTerm`/`planUpdateTerm`/`planDeleteTerm`; an update is refused when `reclassifiedItems` finds an unedited value whose meaning would change, a delete while `itemsUsingTerm` — ambiguous claimants included — is non-empty; MusicTerms' Delete reads `planDeleteTerm` itself), `migrateToV15` (empty list only) | `vocabulary()` everywhere above, `searchAliasTable`, MusicTerms page, `validateDB` |
-| `catalogRefs` | `planCatalogAddition` (Add), `planLinkReference`, `planUnlinkReference`, `planRemoveFromPathway`, and — through `settleLegacyEvidence` (unique legacy decided, ambiguous refused) — every placement writer: `updateItem` (stage/key/instrument), `placeItemInStage`, `deleteStage`, `deletePathway`; `bindLegacyReferences` (v15 migration, fitting evidence only). Every one passes `identityRefusal` before `set()`; a link or instrument move may not overrule another item's legacy answer (`legacyClaimRefusal`) | `resolveCatalogReference` → `stageUnits`/`hiddenUnits`/`stageProgress`/`currentStage`/`nextUnitInStage`/`pathwayProgress`, `planCatalogAddition` reuse, `carriedCourseWorkItem`, routine segment binding (`unitItem`), `itemReferences` → `itemFiles` course material, `validateReferences` |
+| `catalogRefs` | `planStageAddition` → `planCatalogAddition` (Add; creates nothing while `unlinkedInStage` lists items placed there that answer no suggestion, unless the owner chose Add as a new item), `planLinkReference`, `planUnlinkReference`, `planRemoveFromPathway`, and — through `settleLegacyEvidence` (unique legacy decided, ambiguous refused) — every placement writer: `updateItem` (stage/key/instrument), `placeItemInStage`, `deleteStage`, `deletePathway`; `bindLegacyReferences` (v15 migration, fitting evidence only). Every one passes `identityRefusal` before `set()`; a link or instrument move may not overrule another item's legacy answer (`legacyClaimRefusal`) | `resolveCatalogReference` → `stageUnits`/`hiddenUnits`/`stageProgress`/`currentStage`/`nextUnitInStage`/`pathwayProgress`, `planCatalogAddition` reuse, `carriedCourseWorkItem`, routine segment binding (`unitItem`), `itemReferences` → `itemFiles` course material, `validateReferences` |
 | `hiddenRefs` | `planSetReferenceHidden` (Hide/Restore), `planRemoveFromPathway` | `pathwayStageContext` → every stage consumer above; `validateReferences` (scope = the pathway's shipped definition) |
 | Pathway route | `updatePathway` (archived, pin), `deleteStage` (clears pin) | `visiblePathways`/`primaryPathway`/`pathwayPosition` → Today, SessionPlan (build + editor), Repertoire cards, PathwayDetail |
 | `sourceKey` | `resolveCourseSource` (mint/adopt), `chooseCourseSource` (via `planChooseCourseSource`, answering the derived `courseSourceQuestions` for exactly the items it names — StageDetail renders it; `planCatalogAddition` returns its candidates on first AND repeat Add) and `updateMaterial` (both refused by `sourceKeyClash` when the instrument already holds the key), `backfillCourseSourceKeys` (v15) | `findCourseSource`, `validateStudySources` |
@@ -77,11 +77,49 @@ and is driven in Chromium and WebKit through a scripted `visualViewport` whose g
 written by hand per state (keyboard up, Done with retained focus, blur, zoom, hardware keyboard,
 rotation-shaped heights, background/resume, absent `visualViewport`, route changes).
 
-**Not measured:** a native iPhone. No device trace was available to this lane, so the owner's
-reported lifted tab bar is **not claimed fixed**; ac-24 (Safari + installed PWA traces) remains
-outstanding. The old "scroll the focused field into view after 300 ms" behaviour was removed,
-not replaced: WebKit's own reveal is the accommodation, and the owner check will show whether
-anything more is needed.
+**First native trace (2026-09-29, installed app, `standalone: true`, plain http).** The lifted
+bar is a **height flip, not a scroll displacement**: in the bad state every scroll offset
+(`scrollY`, `html`, `body`, `root`) is 0 and the guard correctly decides `none`. What moves is
+`innerH` — and `100dvh` with it, so the shell height — between 852 (full screen, bar flush at the
+bottom) and 793 (screen minus the 59 px status bar, bar lifted by exactly that), while `clientH`
+stayed 793 on every portrait line. The recording STARTED at 793, the keyboard left it at 793,
+and it only reached 852 after rotation; returning to portrait flipped 852↔793 every frame for
+~1.8 s and settled on either. So the keyboard is not shown to CAUSE the bad state here.
+
+The guard's `body`/`#root` restore (a real, fixture-proved blind spot) never fired in this trace
+and is not the fix for this defect.
+
+**Second round (2026-09-30, iOS 27.0; installed app, Safari tab, Chrome tab; plain http).** The
+traces now record what each unit RESOLVES to. Installed app: `100vh` = `100lvh` = 852 (the full
+screen) on every portrait line, keyboard included, and 393 in landscape; `100svh` = 793;
+`100dvh` = 852 at rest but 793 while the keyboard is up (and lagging at 793 into landscape);
+top inset 59, bottom 34. So the first candidate, `calc(100vh + inset-top)`, measured **911** —
+the bar cut off, exactly as the owner saw — and is replaced: the installed app now sizes the
+shell `100vh`, the one reading that was the physical screen height throughout. Safari and
+Chrome tabs: the bar was flush and stayed so (`100dvh` = `innerH` at rest, 695 and 665); tabs
+never match the standalone query and are unchanged. The installed-app guard DID act once per
+dismissal here (`scrollY` 59 → 0), which was the 59 px of document the 911 shell made
+scrollable. `100vh` in standalone is still a reading from one device and one iOS version, and
+the "more persistent" report stays unexplained; ac-24 closes on the owner's confirmation, not
+on this page. The old "scroll the focused field into view after 300 ms" behaviour was removed,
+not replaced.
+
+**Capturing the trace (ac-24).** Three recordings — the installed app, a Safari tab, a Chrome
+tab — each started with the bar confirmed flush at the bottom (cold-start the installed app):
+More → Keyboard trace → Start recording; focus a field and type, tap Done without touching
+anything else, then tap away, rotate once and back; return to More → Stop recording → Copy
+trace. Note the iOS version from Settings → General → About: the user agent freezes it. The first line names the device, iOS
+(user agent), whether it ran standalone, the build and `secure`. Layout geometry does not need
+HTTPS, so these traces were taken over plain http; the installed app's offline half of ac-24
+does, and needs a safe HTTPS route the owner chooses (never `scripts/deploy-nas.sh` aimed at a
+folder holding media — its `rsync --delete` deletes everything else there). Each further line is one
+event, labelled by its source (`vv:resize`, `window:scroll`, `root:scroll`, `document:focusout`…;
+`<main>`'s own scrolling is not an event), with both viewports
+(`innerH`, `vvH`, `vvTop`, `scale`), every shell offset (`scrollY`, `html`, `body`, `root`,
+`main`), the bar's `barTop`/`barBottom`, the focused element, and — at each guard evaluation —
+its decision and any `restore`. A lifted bar shows as `barBottom` less than `innerH` with the
+keyboard gone (`vvH ≈ innerH`); which offset is non-zero at that moment names the mechanism.
+The trace lives in memory only and is never saved, synced or backed up.
 
 ## Proof
 
diff --git a/src/components/ReferenceChoices.tsx b/src/components/ReferenceChoices.tsx
index c6d7e4059da45b6c5129b83ab7bdd7e5262c52bc..21dac0f00eb78b722018eefe068a90d426f98c4a 100644
--- a/src/components/ReferenceChoices.tsx
+++ b/src/components/ReferenceChoices.tsx
@@ -15,6 +15,7 @@ export function ItemChoice({
   sameTitle,
   onChoose,
   onCancel,
+  alternative,
 }: {
   heading: string;
   explanation: string;
@@ -23,6 +24,8 @@ export function ItemChoice({
   sameTitle?: (item: PracticeItem) => boolean;
   onChoose: (itemId: string) => string | null | void;
   onCancel: () => void;
+  /** A deliberate way out that is not one of the items (e.g. "Add as a new item"). */
+  alternative?: { label: string; run: () => string | null | void };
 }) {
   const [refusal, setRefusal] = useState<string | null>(null);
   return (
@@ -56,6 +59,55 @@ export function ItemChoice({
           {refusal}
         </p>
       )}
+      {alternative && (
+        <button className="btn btn-sm" style={{ width: 'fit-content' }} onClick={() => setRefusal(alternative.run() || null)}>
+          {alternative.label}
+        </button>
+      )}
+      <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
+        Cancel
+      </button>
+    </div>
+  );
+}
+
+/**
+ * The same explicit choice from the ITEM's side: which suggestion an item the
+ * owner placed in a stage answers. Only suggestions nothing answers yet are
+ * offered; nothing happens until one is picked.
+ */
+export function SuggestionChoice({
+  itemTitle,
+  suggestions,
+  onChoose,
+  onCancel,
+}: {
+  itemTitle: string;
+  suggestions: { ref: string; title: string }[];
+  onChoose: (ref: string) => string | null | void;
+  onCancel: () => void;
+}) {
+  const [refusal, setRefusal] = useState<string | null>(null);
+  const heading = `Which suggestion is “${itemTitle}”?`;
+  return (
+    <div className="card card-quiet stack-sm" role="region" aria-label={heading}>
+      <div className="small" style={{ fontWeight: 600 }}>
+        Which suggestion is <span dir="auto">“{itemTitle}”</span>?
+      </div>
+      <p className="tiny dim" style={{ margin: 0 }}>
+        Choose the suggestion this item is. Nothing about the item changes except that it now answers it.
+      </p>
+      {suggestions.length === 0 && <p className="tiny dim">Every suggestion here is already answered.</p>}
+      {suggestions.map((u) => (
+        <button key={u.ref} className="btn btn-block" style={{ textAlign: 'start' }} onClick={() => setRefusal(onChoose(u.ref) || null)}>
+          <span dir="auto">{u.title}</span>
+        </button>
+      ))}
+      {refusal && (
+        <p className="tiny" role="alert" style={{ color: 'var(--tone-alert)', margin: 0 }}>
+          {refusal}
+        </p>
+      )}
       <button className="btn btn-ghost btn-sm" style={{ width: 'fit-content' }} onClick={onCancel}>
         Cancel
       </button>
diff --git a/src/components/direction.test.ts b/src/components/direction.test.ts
index e507132fd34a608069715c75900cfd0605a1663b..933047c0d3d536f63ded7400cd4c62f2284d6336 100644
--- a/src/components/direction.test.ts
+++ b/src/components/direction.test.ts
@@ -172,6 +172,9 @@ const GROUP_SITE_INVENTORY: { file: string; tagName: string; classValue: string
   { file: "components/MusicalTermField.tsx", tagName: "span", classValue: "" },
   // Link existing / which item is it / which source: each candidate's own title.
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
+  // SuggestionChoice: the item's title, then each suggestion's.
+  { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
+  { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
   { file: "components/ReferenceChoices.tsx", tagName: "span", classValue: "" },
diff --git a/src/components/useViewportGuard.ts b/src/components/useViewportGuard.ts
index 2e8550c49581b1794ecac6132e6821bf52459d98..5cb3c265371959b181bf689efff9c668218f5d57 100644
--- a/src/components/useViewportGuard.ts
+++ b/src/components/useViewportGuard.ts
@@ -1,14 +1,26 @@
 import { useEffect } from 'react';
-import { startViewportGuard } from './viewport';
+import { decideViewport, startViewportGuard, type ViewportGeometry } from './viewport';
 
 // ---------------------------------------------------------------------------
 // The thin browser adapter for `viewport.ts`: supplies the real visual
-// viewport, document scroll and visibility events, starts the guard once for
-// the shell, and tears every listener down on unmount. No decision lives here
-// — see `decideViewport` for when the document scroll is put back, and why a
-// focused field no longer blocks it.
+// viewport, document and shell scroll offsets and visibility events, starts
+// the guard once for the shell, and tears every listener down on unmount. No
+// decision lives here — see `decideViewport` for when the offsets are put
+// back, and why a focused field no longer blocks it.
 // ---------------------------------------------------------------------------
 
+const root = () => document.getElementById('root');
+
+function geometry(): ViewportGeometry {
+  return {
+    layoutHeight: window.innerHeight,
+    visualHeight: window.visualViewport?.height ?? window.innerHeight,
+    scale: window.visualViewport?.scale ?? 1,
+    documentScroll: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop,
+    shellScroll: Math.max(document.body.scrollTop, root()?.scrollTop ?? 0),
+  };
+}
+
 export function useViewportGuard(): void {
   useEffect(
     () =>
@@ -21,18 +33,181 @@ export function useViewportGuard(): void {
           document.addEventListener('visibilitychange', handler);
           return () => document.removeEventListener('visibilitychange', handler);
         },
-        geometry: () => ({
-          layoutHeight: window.innerHeight,
-          visualHeight: window.visualViewport?.height ?? window.innerHeight,
-          scale: window.visualViewport?.scale ?? 1,
-          documentScroll: window.scrollY || document.documentElement.scrollTop || document.body.scrollTop,
-        }),
+        geometry: () => {
+          const g = geometry();
+          traceNote('guard', g);
+          return g;
+        },
         restoreDocument: () => {
+          traceNote('restore');
           window.scrollTo(0, 0);
           document.documentElement.scrollTop = 0;
           document.body.scrollTop = 0;
+          const r = root();
+          if (r) r.scrollTop = 0;
         },
       }),
     [],
   );
 }
+
+// ---------------------------------------------------------------------------
+// KEYBOARD TRACE — an opt-in recorder for the owner's own iPhone (More →
+// Keyboard trace). The lifted-bar report is a NATIVE behaviour no browser
+// fixture reproduces, so this writes down what the device actually reports at
+// every event that can move it: both viewports, every scroll offset in the
+// shell, the bar's position and the focused element. Memory only — never in
+// the database, a backup or sync — and nothing here changes what the guard
+// does. Recording outlives route changes and backgrounding (module scope);
+// a relaunch of the app ends it.
+// ---------------------------------------------------------------------------
+
+let trace: string[] = [];
+// Hidden fixed-position probes: what each viewport unit and safe-area inset
+// actually RESOLVES to on this device, read per line (clientHeight is not a
+// measurement of 100vh). Present only while recording.
+const PROBES = ['100vh', '100svh', '100lvh', '100dvh', '100%'] as const;
+let probes: HTMLElement[] = [];
+let insetProbe: HTMLElement | null = null;
+
+function addProbes(): void {
+  const make = (css: string) => {
+    const el = document.createElement('div');
+    el.setAttribute('aria-hidden', 'true');
+    el.style.cssText = `position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;${css}`;
+    document.body.append(el);
+    return el;
+  };
+  probes = PROBES.map((h) => make(`height:${h}`));
+  insetProbe = make('height:0;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)');
+}
+
+function removeProbes(): void {
+  probes.forEach((el) => el.remove());
+  insetProbe?.remove();
+  probes = [];
+  insetProbe = null;
+}
+
+function probeReadings(): Record<string, number | null> {
+  const out: Record<string, number | null> = {};
+  PROBES.forEach((h, i) => {
+    out[h.replace('100', '').replace('%', 'pct')] = probes[i] ? Math.round(probes[i].getBoundingClientRect().height * 10) / 10 : null;
+  });
+  const cs = insetProbe ? getComputedStyle(insetProbe) : null;
+  out.insetTop = cs ? parseFloat(cs.paddingTop) : null;
+  out.insetBottom = cs ? parseFloat(cs.paddingBottom) : null;
+  out.screenH = screen.height;
+  return out;
+}
+let stopTrace: (() => void) | null = null;
+let t0 = 0;
+// ponytail: fixed cap so a forgotten recording cannot grow without bound; raise if a real capture needs more.
+const TRACE_LIMIT = 5000;
+
+function snapshot(event: string, extra?: unknown): string {
+  const vv = window.visualViewport;
+  const main = document.querySelector('main');
+  const bar = document.querySelector('.tabbar')?.getBoundingClientRect();
+  const active = document.activeElement as HTMLElement | null;
+  const r = (n: number | undefined) => (n === undefined ? null : Math.round(n * 10) / 10);
+  return JSON.stringify({
+    t: Math.round(performance.now() - t0),
+    ev: event,
+    innerH: window.innerHeight,
+    clientH: document.documentElement.clientHeight,
+    vvH: r(vv?.height),
+    vvTop: r(vv?.offsetTop),
+    vvPageTop: r(vv?.pageTop),
+    scale: r(vv?.scale),
+    scrollY: r(window.scrollY),
+    html: document.documentElement.scrollTop,
+    body: document.body.scrollTop,
+    root: root()?.scrollTop ?? null,
+    main: main?.scrollTop ?? null,
+    htmlH: r(document.documentElement.getBoundingClientRect().height),
+    barTop: r(bar?.top),
+    barBottom: r(bar?.bottom),
+    focus: active && active !== document.body ? `${active.tagName.toLowerCase()}:${active.getAttribute('aria-label') ?? active.getAttribute('name') ?? ''}` : null,
+    vis: document.visibilityState,
+    ...probeReadings(),
+    ...(extra ? { decision: decideViewport(extra as ViewportGeometry) } : {}),
+  });
+}
+
+/** Append one line; at the cap, say so ONCE rather than silently dropping the rest. */
+function record(line: () => string): void {
+  if (trace.length < TRACE_LIMIT) trace.push(line());
+  else if (trace.length === TRACE_LIMIT) trace.push(JSON.stringify({ ev: 'trace-full', limit: TRACE_LIMIT }));
+}
+
+function traceNote(event: string, g?: ViewportGeometry): void {
+  if (stopTrace) record(() => snapshot(event, g));
+}
+
+export function isTracingViewport(): boolean {
+  return stopTrace !== null;
+}
+
+export function isViewportTraceFull(): boolean {
+  return trace.length > TRACE_LIMIT;
+}
+
+/**
+ * Start recording (clears any earlier trace). The header names the device, the
+ * mode, the build and whether this is a secure context, so a pasted trace says
+ * which app produced it. Each line's `ev` names its SOURCE (`vv:resize`,
+ * `window:scroll`, `root:scroll`…). `<main>`'s own scrolling is not an event
+ * here — it is the owner's, and its offset is in every line anyway.
+ */
+export function startViewportTrace(): void {
+  if (stopTrace) return;
+  t0 = performance.now();
+  trace = [
+    JSON.stringify({
+      ua: navigator.userAgent,
+      standalone: window.matchMedia('(display-mode: standalone)').matches,
+      secure: window.isSecureContext,
+      build: typeof __APP_VERSION__ === 'undefined' ? null : __APP_VERSION__,
+      screen: `${screen.width}x${screen.height}`,
+      dpr: window.devicePixelRatio,
+      at: new Date().toISOString(),
+    }),
+  ];
+  const on = (target: EventTarget | null | undefined, source: string, type: string) => {
+    const fn = () => record(() => snapshot(`${source}:${type}`));
+    target?.addEventListener(type, fn, { passive: true });
+    return () => target?.removeEventListener(type, fn);
+  };
+  const vv = window.visualViewport;
+  const offs = [
+    on(vv, 'vv', 'resize'),
+    on(vv, 'vv', 'scroll'),
+    on(window, 'window', 'resize'),
+    on(window, 'window', 'scroll'),
+    on(window, 'window', 'orientationchange'),
+    on(document.body, 'body', 'scroll'),
+    on(root(), 'root', 'scroll'),
+    on(document, 'document', 'focusin'),
+    on(document, 'document', 'focusout'),
+    on(document, 'document', 'visibilitychange'),
+  ];
+  addProbes();
+  stopTrace = () => {
+    offs.forEach((off) => off());
+    removeProbes();
+  };
+  trace.push(snapshot('start'));
+}
+
+export function stopViewportTrace(): void {
+  if (!stopTrace) return;
+  record(() => snapshot('stop'));
+  stopTrace();
+  stopTrace = null;
+}
+
+/** The recorded trace, one JSON object per line. */
+export function viewportTraceText(): string {
+  return trace.join('\n');
+}
diff --git a/src/components/viewport.test.ts b/src/components/viewport.test.ts
index f175a86934a644720571536285b6574cc108ed00..dc6dcc6848d83c4f1be713dae52ed620d69060de 100644
--- a/src/components/viewport.test.ts
+++ b/src/components/viewport.test.ts
@@ -15,6 +15,11 @@ const CASES: { name: string; g: ViewportGeometry; want: 'none' | 'restore' }[] =
   { name: 'zoomed with a full-height window', g: { layoutHeight: 844, scale: 1.5, visualHeight: 562.7, documentScroll: 120 }, want: 'none' },
   { name: 'hardware keyboard: no visual change, no displacement', g: { ...PHONE, visualHeight: 844, documentScroll: 0 }, want: 'none' },
   { name: 'rotated to landscape, displaced', g: { layoutHeight: 390, scale: 1, visualHeight: 390, documentScroll: 60 }, want: 'restore' },
+  // A reveal that scrolled a SHELL box (#root/body) leaves the document at 0.
+  { name: 'shell box scrolled, keyboard gone', g: { ...PHONE, visualHeight: 844, documentScroll: 0, shellScroll: 180 }, want: 'restore' },
+  { name: 'shell box scrolled, keyboard still up', g: { ...PHONE, visualHeight: 508, documentScroll: 0, shellScroll: 180 }, want: 'none' },
+  { name: 'shell box scrolled, pinch-zoomed', g: { layoutHeight: 844, scale: 2, visualHeight: 422, documentScroll: 0, shellScroll: 180 }, want: 'none' },
+  { name: 'shell at rest', g: { ...PHONE, visualHeight: 844, documentScroll: 0, shellScroll: 0 }, want: 'none' },
 ];
 
 describe('the layout viewport restore', () => {
diff --git a/src/components/viewport.ts b/src/components/viewport.ts
index b4e977e584f93a00bcb9fdc3931de4bbcbbcdb84..10e67de0f0f6c0cf6fe38fd7db057eba67a52c80 100644
--- a/src/components/viewport.ts
+++ b/src/components/viewport.ts
@@ -12,12 +12,20 @@
 // is back to the full layout height it is RESIDUAL displacement — the lifted
 // tab bar — and is put back to zero.
 //
+// The same holds for `body` and `#root`: `overflow: hidden` stops the OWNER
+// scrolling them, not the browser — a focus reveal may scroll every scroll
+// container above the field, and a box scrolled that way stays scrolled with
+// the document offset reading zero. Any offset on them is displacement too.
+//
 // Keyboard presence is read from GEOMETRY, never from focus: "Done" on the
 // iOS keyboard hides it and leaves the field focused, which is exactly the
 // case a focus-gated guard never corrected. There is no timer, no forced
 // blur, no zoom lock, and `<main>`'s own scroll position is never touched.
 // Browser fixtures prove this mechanism; they cannot prove the native iPhone
-// keyboard, which stays an owner-device check.
+// keyboard. The owner's first device trace showed their lifted bar is NOT a
+// scroll offset at all — every offset was 0 while the viewport HEIGHT flipped
+// — so this guard does not address it; see the standalone shell height in
+// global.css and the opt-in trace in `useViewportGuard.ts`.
 // ---------------------------------------------------------------------------
 
 export interface ViewportGeometry {
@@ -29,6 +37,11 @@ export interface ViewportGeometry {
   scale: number;
   /** How far the DOCUMENT is scrolled (`window.scrollY`). */
   documentScroll: number;
+  /**
+   * The largest offset of the shell's own non-scrolling boxes (`body`,
+   * `#root`) — never `<main>`, the one box the owner scrolls. Absent reads 0.
+   */
+  shellScroll?: number;
 }
 
 /**
@@ -43,14 +56,14 @@ export type ViewportAction = 'none' | 'restore';
 /**
  * What to do about the document's scroll offset, from geometry alone.
  *
- *  - no offset             → nothing to correct
+ *  - no offset (document or shell) → nothing to correct
  *  - zoomed (scale ≠ 1)    → the owner's zoom; never fought
  *  - visual viewport short → the keyboard (or any panel) is still up; WebKit's
  *                            reveal is intentional, leave it
  *  - otherwise             → residual displacement: restore to zero
  */
 export function decideViewport(g: ViewportGeometry): ViewportAction {
-  if (!(g.documentScroll > 0)) return 'none';
+  if (!(g.documentScroll > 0) && !((g.shellScroll ?? 0) > 0)) return 'none';
   if (Math.abs(g.scale - 1) > 0.001) return 'none';
   if (g.visualHeight * g.scale < g.layoutHeight - ROUNDING_PX) return 'none';
   return 'restore';
@@ -66,7 +79,7 @@ export interface ViewportPort {
   /** Subscribe to the page becoming visible again; returns the unsubscribe. */
   onVisible(fn: () => void): () => void;
   geometry(): ViewportGeometry;
-  /** Put the DOCUMENT scroll back to zero. Never `<main>`. */
+  /** Put the document and the shell's non-scrolling boxes back to zero. Never `<main>`. */
   restoreDocument(): void;
 }
 
diff --git a/src/domain/courseSeed.ts b/src/domain/courseSeed.ts
index 4c5c72d632020883ac22d2f02f7aae6ed0b5396f..7748d1bb6cba0e10ca924af819bc8014d67568d6 100644
--- a/src/domain/courseSeed.ts
+++ b/src/domain/courseSeed.ts
@@ -626,11 +626,17 @@ export interface CatalogAddition {
    * one explicitly.
    */
   candidates?: PracticeItem[];
+  /**
+   * Set by `planStageAddition` (`pathways.ts`) when items placed in the stage
+   * answer no suggestion: nothing is created until the owner links one or asks
+   * for a new item.
+   */
+  placed?: PracticeItem[];
   /** Set when the course's own study source needs the owner's choice. */
   sourceCandidates?: Material[];
 }
 
-interface CatalogAdditionDB {
+export interface CatalogAdditionDB {
   items: PracticeItem[];
   materials: Material[];
 }
diff --git a/src/domain/pathways.ts b/src/domain/pathways.ts
index 2b964c4600aa1f166242f03697903918aad021dd..398a8d75e592f8ef93c39a304b54fdc0f0e40909 100644
--- a/src/domain/pathways.ts
+++ b/src/domain/pathways.ts
@@ -9,7 +9,15 @@ import type {
   StepStrand,
 } from './types';
 import { catalogForStage, knownReference, pathwayReferenceIds } from './pathwaySeed';
-import { catalogReferenceId, itemReferences, legacyReferenceOf, resolveCatalogReference } from './courseSeed';
+import {
+  catalogReferenceId,
+  itemReferences,
+  legacyReferenceOf,
+  planCatalogAddition,
+  resolveCatalogReference,
+  type CatalogAddition,
+  type CatalogAdditionDB,
+} from './courseSeed';
 import { nowISO } from './util';
 
 // ---------------------------------------------------------------------------
@@ -50,6 +58,12 @@ export interface StageUnit {
    * owner links one explicitly.
    */
   candidates?: PracticeItem[];
+  /**
+   * An item PLACED in this stage that answers none of its suggestions
+   * (`unlinkedInStage`). Shown as its own row, said to be unlinked, with a way
+   * to link it — never merged into a suggestion on the strength of a title.
+   */
+  unlinked?: boolean;
   state: StageState;
 }
 
@@ -107,13 +121,64 @@ export function stageUnits(stage: PathwayStage, items: PracticeItem[], ctx: Stag
     if (unit.item) shown.add(unit.item.id);
     units.push(unit);
   }
+  const unlinked = new Set(unlinkedInStage(stage.id, items, ctx.instrumentId).map((i) => i.id));
   for (const it of itemsInStage(items, stage.id)) {
     if (shown.has(it.id)) continue;
-    units.push({ key: it.id, title: it.title, strand: it.strand, item: it, state: itemStageState(it) });
+    units.push({
+      key: it.id,
+      title: it.title,
+      strand: it.strand,
+      item: it,
+      ...(unlinked.has(it.id) ? { unlinked: true } : {}),
+      state: itemStageState(it),
+    });
   }
   return units;
 }
 
+/**
+ * The owner's items PLACED in a stage — on its pathway's instrument — that
+ * answer none of the stage's suggestions, hidden ones included. Placing an item
+ * is organisation and changes no identity, so such an item may well BE one of
+ * the suggestions beside it; only the owner can say. It is the ONE list both
+ * the stage rows (`unlinked`) and Add (`planStageAddition`) read, so a row can
+ * never look unrelated while Add quietly mints a second item beside it.
+ */
+export function unlinkedInStage(stageId: ID, items: PracticeItem[], instrumentId?: ID): PracticeItem[] {
+  const refs = new Set(catalogForStage(stageId).map((e) => catalogReferenceId(stageId, e.key)));
+  if (!refs.size) return [];
+  return items.filter(
+    (i) =>
+      i.stageId === stageId &&
+      (!instrumentId || i.instrumentId === instrumentId) &&
+      !itemReferences(i).some((r) => refs.has(r)),
+  );
+}
+
+/**
+ * ADD from a stage: `planCatalogAddition`, except that a suggestion nothing
+ * answers yet is NOT created while items the owner placed in that stage answer
+ * no suggestion — any of them may be this music, and a second item would be a
+ * silent duplicate. The plan returns them as `placed` and writes nothing; the
+ * owner links one (`planLinkReference`) or asks for a new item explicitly
+ * (`separate`). A bound or ambiguous suggestion is decided exactly as before.
+ */
+export function planStageAddition(
+  db: CatalogAdditionDB,
+  stageId: ID,
+  entryKey: string,
+  entry: CatalogEntry | undefined,
+  instrumentId: ID,
+  now: Date,
+  separate = false,
+): CatalogAddition {
+  if (!separate && resolveCatalogReference(catalogReferenceId(stageId, entryKey), instrumentId, db.items).status === 'absent') {
+    const placed = unlinkedInStage(stageId, db.items, instrumentId);
+    if (placed.length) return { items: db.items, materials: db.materials, itemId: '', created: false, placed };
+  }
+  return planCatalogAddition(db, stageId, entryKey, entry, instrumentId, now);
+}
+
 /** The suggestions this stage's pathway hides — listed so each can be restored. */
 export function hiddenUnits(stage: PathwayStage, items: PracticeItem[], ctx: StageContext): StageUnit[] {
   if (!ctx.hidden?.size) return [];
diff --git a/src/domain/referenceCatalog.test.ts b/src/domain/referenceCatalog.test.ts
index 037fc302d203061c3b3bba014286abe3128d13ef..072b87d1505e4e16ebebeb0327875a861c397115 100644
--- a/src/domain/referenceCatalog.test.ts
+++ b/src/domain/referenceCatalog.test.ts
@@ -26,8 +26,10 @@ import {
   planLinkReference,
   planRemoveFromPathway,
   settleLegacyEvidence,
+  planStageAddition,
   stageProgress,
   stageUnits,
+  unlinkedInStage,
 } from './pathways';
 import { itemFiles } from './itemFiles';
 import { serializeExport, validateDB } from './io';
@@ -239,6 +241,80 @@ describe('catalogue identity', () => {
     expect(resolveCatalogReference('radif:mirza-abdollah:afshari:iraq', 'inst-tar', db.items).status).toBe('absent');
     // …and nothing on the stage page links by title on its own.
     expect(stageUnits(stage, db.items, { instrumentId: 'inst-setar' }).find((u) => u.key === 'kereshmeh')!.item).toBeUndefined();
+
+    // 7. PLACING AN OWNED ITEM IS NOT LINKING IT — and Add beside it never mints
+    //    a silent second copy. The ordinary journey: an item the owner already
+    //    has is given a stage from Item Detail (stageId only, through the same
+    //    settle step every placement write passes).
+    const every = everyPathway();
+    const abuAta = stageIdFor(SEED_PATHWAY_IDS.setar, 'abu-ata');
+    const sayakhi = catalogReferenceId(abuAta, 'sayakhi');
+    const owned: PracticeItem = {
+      ...db.items.find((i) => i.id === 'it-title-only')!,
+      id: 'it-sayakhi-owned',
+      instrumentId: 's',
+      title: 'سیخی-ابوعطا-ردیف-میرزاعبدالله',
+      notes: 'teacher: slower in the second phrase',
+      timesPractised: 3,
+      stageId: undefined,
+      catalogKey: undefined,
+      catalogRefs: undefined,
+    };
+    const before: PracticeDB = { ...every, items: [owned] };
+    const placedWrite = settleLegacyEvidence(before, [{ ...owned, stageId: abuAta }], NOW);
+    expect(placedWrite.ok).toBe(true);
+    const placedDb: PracticeDB = { ...before, items: placedWrite.ok ? placedWrite.items : [] };
+    const placedItem = placedDb.items[0];
+    expect(placedItem.catalogRefs).toBeUndefined(); // placement decided no identity
+    const abuStage = stageOf(placedDb, abuAta);
+    const setarCtx = pathwayStageContext(placedDb.pathways.find((p) => p.id === SEED_PATHWAY_IDS.setar));
+
+    // The stage says so: the suggestion is untaken, and the placed item's own
+    // row names it as answering no suggestion (one clear flag, never a merge).
+    expect(unlinkedInStage(abuAta, placedDb.items, 's').map((i) => i.id)).toEqual(['it-sayakhi-owned']);
+    const rows = stageUnits(abuStage, placedDb.items, setarCtx);
+    expect(rows.find((u) => u.key === 'sayakhi')!.item).toBeUndefined();
+    expect(rows.filter((u) => u.item?.id === 'it-sayakhi-owned').map((u) => u.unlinked)).toEqual([true]);
+    // …a Tar instance never counts a Setar item placed beside its stages.
+    expect(unlinkedInStage(abuAta, placedDb.items, 't')).toEqual([]);
+
+    // Add (and Play, which adds through the same planner) on ANY untaken
+    // suggestion of that stage creates NOTHING while the placed item is
+    // unlinked: it hands the item back to be chosen.
+    for (const key of ['sayakhi', 'hejaz']) {
+      const entry = catalogForStage(abuAta).find((e) => e.key === key);
+      const asked = planStageAddition(placedDb, abuAta, key, entry, 's', NOW);
+      expect([asked.created, asked.itemId, asked.items], key).toEqual([false, '', placedDb.items]);
+      expect(asked.placed!.map((i) => i.id), key).toEqual(['it-sayakhi-owned']);
+    }
+    const sayakhiEntry = catalogForStage(abuAta).find((e) => e.key === 'sayakhi');
+
+    // LINK is the owner's explicit answer: one item, every owner field kept,
+    // one row, and Add now reuses it.
+    const linkedPlaced = planLinkReference(placedDb, sayakhi, 'it-sayakhi-owned', 's', NOW);
+    expect(linkedPlaced.ok).toBe(true);
+    const linkedDb: PracticeDB = { ...placedDb, items: linkedPlaced.ok ? linkedPlaced.items : [] };
+    expect(linkedDb.items).toHaveLength(1);
+    expect(strip(linkedDb.items[0])).toEqual(strip(placedItem));
+    const linkedRows = stageUnits(abuStage, linkedDb.items, setarCtx);
+    expect(linkedRows.filter((u) => u.item?.id === 'it-sayakhi-owned').map((u) => [u.key, u.unlinked])).toEqual([['sayakhi', undefined]]);
+    const reAdd = planStageAddition(linkedDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW);
+    expect([reAdd.created, reAdd.itemId, reAdd.items, reAdd.placed]).toEqual([false, 'it-sayakhi-owned', linkedDb.items, undefined]);
+    // The stage's OTHER suggestions are no longer held: the placed item now
+    // answers one of them, so Add creates exactly what was asked for.
+    const hejaz = planStageAddition(linkedDb, abuAta, 'hejaz', catalogForStage(abuAta).find((e) => e.key === 'hejaz'), 's', NOW);
+    expect([hejaz.created, hejaz.items.length, hejaz.placed]).toEqual([true, 2, undefined]);
+
+    // "Add as a new item" is the other explicit answer: one new item, bound,
+    // the placed one untouched — and a second Add reuses the new one.
+    const separate = planStageAddition(placedDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW, true);
+    expect(separate.created).toBe(true);
+    expect(separate.items).toHaveLength(2);
+    expect(separate.items[0]).toBe(placedItem);
+    const separateDb: PracticeDB = { ...placedDb, items: separate.items, materials: separate.materials };
+    const again = planStageAddition(separateDb, abuAta, 'sayakhi', sayakhiEntry, 's', NOW);
+    expect([again.created, again.itemId, again.items]).toEqual([false, separate.itemId, separate.items]);
+    expect(() => validateDB({ ...separateDb })).not.toThrow();
   });
 
   it('Setar and Tar share reference definitions without sharing practice state', () => {
diff --git a/src/pages/More.tsx b/src/pages/More.tsx
index 7ca6fd1516abc583ad8b786c319b2685d55045c9..b0d317b2b7384471c1e9dd373967f146576bf8a9 100644
--- a/src/pages/More.tsx
+++ b/src/pages/More.tsx
@@ -1,4 +1,6 @@
+import { useState } from 'react';
 import { Link } from 'react-router-dom';
+import { isTracingViewport, isViewportTraceFull, startViewportTrace, stopViewportTrace, viewportTraceText } from '../components/useViewportGuard';
 import {
   ChevronRightIcon,
   FolderIcon,
@@ -37,9 +39,76 @@ export default function More() {
         ))}
       </div>
 
+      <KeyboardTrace />
+
       <p className="tiny faint" style={{ textAlign: 'center' }}>
         Practice Compass · local-first · one item, one focus.
       </p>
     </div>
   );
 }
+
+/**
+ * The iPhone keyboard check (docs/repertoire-experience.md): record what the
+ * device reports while the keyboard opens and closes, then copy it. Memory
+ * only — nothing here is saved, synced or backed up.
+ */
+function KeyboardTrace() {
+  const [recording, setRecording] = useState(isTracingViewport);
+  const [text, setText] = useState('');
+  const [copied, setCopied] = useState<string | null>(null);
+  return (
+    <details className="card card-quiet">
+      <summary className="small">Keyboard trace</summary>
+      <div className="stack-sm" style={{ marginTop: 8 }}>
+        <p className="tiny dim" style={{ margin: 0 }}>
+          For checking the bottom bar after the keyboard closes. Start, use the app as usual — type, tap Done, rotate,
+          switch screens, leave and come back — then return here, stop and copy. Kept in memory only.
+        </p>
+        <div className="row" style={{ gap: 8 }}>
+          <button
+            className="btn btn-sm"
+            onClick={() => {
+              if (recording) {
+                stopViewportTrace();
+                setText(viewportTraceText());
+              } else {
+                startViewportTrace();
+                setText('');
+                setCopied(null);
+              }
+              setRecording(isTracingViewport());
+            }}
+          >
+            {recording ? 'Stop recording' : 'Start recording'}
+          </button>
+          {text && (
+            <button
+              className="btn btn-sm"
+              onClick={() =>
+                navigator.clipboard?.writeText(text).then(
+                  () => setCopied('Copied.'),
+                  () => setCopied('Copy was refused — select the text below instead.'),
+                ) ?? setCopied('Copy is unavailable — select the text below instead.')
+              }
+            >
+              Copy trace
+            </button>
+          )}
+        </div>
+        {recording && <p className="tiny" role="status">Recording…</p>}
+        {text && isViewportTraceFull() && (
+          <p className="tiny" role="alert">
+            The trace filled up and later events were not recorded — start again and keep the session shorter.
+          </p>
+        )}
+        {copied && (
+          <p className="tiny" role="status">
+            {copied}
+          </p>
+        )}
+        {text && <textarea className="textarea" readOnly aria-label="Keyboard trace" value={text} rows={6} />}
+      </div>
+    </details>
+  );
+}
diff --git a/src/pages/StageDetail.tsx b/src/pages/StageDetail.tsx
index 66df98c71e31424a4b020d8367898aef5f2f2995..b19e4ed97d5412d59f11b70032922b7d8d424781 100644
--- a/src/pages/StageDetail.tsx
+++ b/src/pages/StageDetail.tsx
@@ -11,6 +11,7 @@ import {
   STRAND_LABELS,
   type CourseSourceQuestion,
   type PathwayRoutine,
+  type PracticeItem,
   type StageUnit,
   courseSourceQuestions,
   courseStage,
@@ -21,7 +22,7 @@ import { useStore } from '../store/useStore';
 import QuickAdd from '../components/QuickAdd';
 import RoutineDuration from '../components/RoutineDuration';
 import { Field, useAcknowledgedSaves } from '../components/ui';
-import { ItemChoice, SourceChoice } from '../components/ReferenceChoices';
+import { ItemChoice, SourceChoice, SuggestionChoice } from '../components/ReferenceChoices';
 import { ArrowLeftIcon, CheckIcon, PlayIcon, PlusIcon } from '../components/icons';
 
 export default function StageDetail() {
@@ -72,7 +73,16 @@ export default function StageDetail() {
   const [refusal, setRefusal] = useState<string | null>(null);
   // An explicit choice in progress: which item a suggestion is, or which
   // study source a course is.
-  const [choosing, setChoosing] = useState<{ unit: StageUnit; mode: 'link' | 'ambiguous' } | null>(null);
+  // `placed`: Add found items placed in this stage that answer no suggestion —
+  // the owner says whether one of them IS this music before anything is made.
+  const [choosing, setChoosing] = useState<{
+    unit: StageUnit;
+    mode: 'link' | 'ambiguous' | 'placed';
+    placed?: PracticeItem[];
+    then?: 'practise';
+  } | null>(null);
+  // An unlinked placed item, asked the other way round: which suggestion is it?
+  const [linkingItem, setLinkingItem] = useState<PracticeItem | null>(null);
   // Which study source the course is: a question DERIVED from saved data
   // (`courseSourceQuestions`), so Play, a cancelled prompt, leaving the page
   // or a reload never loses it. "Decide later" only quiets it for this visit.
@@ -121,8 +131,8 @@ export default function StageDetail() {
     setEditing(false);
   }
 
-  function addSuggestion(unit: StageUnit) {
-    const result = addFromCatalog(stage!.id, unit.key);
+  function addSuggestion(unit: StageUnit, separate = false) {
+    const result = addFromCatalog(stage!.id, unit.key, separate);
     setRefusal(result.refusal ?? null);
     if (result.refusal) return;
     // Two of the owner's items already answer this suggestion: nothing was
@@ -131,13 +141,23 @@ export default function StageDetail() {
       setChoosing({ unit, mode: 'ambiguous' });
       return;
     }
+    if (result.placed) {
+      setChoosing({ unit, mode: 'placed', placed: result.placed });
+      return;
+    }
+    setChoosing(null);
     setNotice(result.created ? `Added “${unit.title}” to your items — not practised yet.` : `“${unit.title}” is already one of your items.`);
     // The tap asked about this suggestion's course source: show the question
     // again even if it was put off earlier in this visit.
     if (result.sourceCandidates) setSourceDeferred(false);
   }
 
-  function practise(unit: StageUnit) {
+  function start(itemId: string) {
+    startItemSession(itemId);
+    navigate('/active');
+  }
+
+  function practise(unit: StageUnit, separate = false) {
     // A routine is running: resolve it there rather than trying to start a
     // block alongside it — startItemSession would just no-op and leave the
     // user on a dead "no block in progress" screen.
@@ -147,18 +167,21 @@ export default function StageDetail() {
     }
     // Practice starts at once. A study-source question this raises is not
     // asked here — it is derived from saved data and waits on this stage.
-    const added = unit.item ? null : addFromCatalog(stage!.id, unit.key);
+    const added = unit.item ? null : addFromCatalog(stage!.id, unit.key, separate);
     if (added?.refusal) {
       setRefusal(added.refusal);
       return;
     }
+    if (added?.placed) {
+      setChoosing({ unit, mode: 'placed', placed: added.placed, then: 'practise' });
+      return;
+    }
     const itemId = unit.item?.id ?? added?.id;
     if (!itemId) {
       setChoosing({ unit, mode: 'ambiguous' });
       return;
     }
-    startItemSession(itemId);
-    navigate('/active');
+    start(itemId);
   }
 
   return (
@@ -340,24 +363,63 @@ export default function StageDetail() {
             choosing?.unit.key === u.key ? (
               <ItemChoice
                 key={u.key}
-                heading={choosing.mode === 'ambiguous' ? `Which item is “${u.title}”?` : `Link an existing item to “${u.title}”`}
+                heading={
+                  choosing.mode === 'ambiguous'
+                    ? `Which item is “${u.title}”?`
+                    : choosing.mode === 'placed'
+                      ? `Is “${u.title}” already in this stage?`
+                      : `Link an existing item to “${u.title}”`
+                }
                 explanation={
                   choosing.mode === 'ambiguous'
                     ? 'More than one of your items answers this suggestion. Choose the one it is — every item stays exactly as it is.'
-                    : 'Choose one of your items on this instrument. Nothing about it changes except that it now answers this suggestion.'
+                    : choosing.mode === 'placed'
+                      ? 'You placed these items in this stage, and none of them answers a suggestion yet. If one of them is this music, link it — nothing else about it changes. Otherwise add a new item.'
+                      : 'Choose one of your items on this instrument. Nothing about it changes except that it now answers this suggestion.'
+                }
+                items={
+                  choosing.mode === 'ambiguous'
+                    ? u.candidates ?? []
+                    : choosing.mode === 'placed'
+                      ? choosing.placed ?? []
+                      : linkCandidates(db.items, ctx.instrumentId, u.entry?.title ?? u.title)
                 }
-                items={choosing.mode === 'ambiguous' ? u.candidates ?? [] : linkCandidates(db.items, ctx.instrumentId, u.entry?.title ?? u.title)}
                 sameTitle={(i) => i.title.trim() === (u.entry?.title ?? u.title).trim()}
                 onChoose={(itemId) => {
                   const refusal = pathway && u.ref ? linkReference(pathway.id, u.ref, itemId) : 'This suggestion cannot be linked.';
                   if (!refusal) {
+                    const then = choosing.then;
                     setChoosing(null);
                     setNotice(`Linked — “${db.items.find((i) => i.id === itemId)?.title ?? ''}” now answers this suggestion.`);
+                    if (then === 'practise') start(itemId);
                   }
                   return refusal;
                 }}
+                alternative={
+                  choosing.mode === 'placed'
+                    ? {
+                        label: 'Add as a new item',
+                        run: () => (choosing.then === 'practise' ? practise(u, true) : addSuggestion(u, true)),
+                      }
+                    : undefined
+                }
                 onCancel={() => setChoosing(null)}
               />
+            ) : linkingItem && u.item?.id === linkingItem.id ? (
+              <SuggestionChoice
+                key={u.key}
+                itemTitle={u.title}
+                suggestions={units.filter((x) => !x.item && !x.candidates && x.ref).map((x) => ({ ref: x.ref!, title: x.title }))}
+                onChoose={(ref) => {
+                  const refusal = pathway ? linkReference(pathway.id, ref, linkingItem.id) : 'This suggestion cannot be linked.';
+                  if (!refusal) {
+                    setLinkingItem(null);
+                    setNotice(`Linked — “${linkingItem.title}” now answers this suggestion.`);
+                  }
+                  return refusal;
+                }}
+                onCancel={() => setLinkingItem(null)}
+              />
             ) : (
               <UnitRow
                 key={u.key}
@@ -367,6 +429,7 @@ export default function StageDetail() {
                 onPractise={() => practise(u)}
                 onAdd={() => addSuggestion(u)}
                 onChoose={() => setChoosing({ unit: u, mode: u.candidates ? 'ambiguous' : 'link' })}
+                onLinkToSuggestion={u.unlinked && pathway ? () => setLinkingItem(u.item!) : undefined}
                 onHide={pathway && u.ref ? () => setReferenceHidden(pathway.id, u.ref!, true) : undefined}
                 onUnlink={u.item && u.ref ? () => unlinkReference(u.item!.id, u.ref!) : undefined}
                 onRemoveFromPathway={u.item && pathway ? () => setRefusal(removeFromPathway(u.item!.id, pathway.id)) : undefined}
@@ -426,6 +489,7 @@ function UnitRow({
   onHide,
   onUnlink,
   onRemoveFromPathway,
+  onLinkToSuggestion,
 }: {
   unit: StageUnit;
   returnTo: string;
@@ -437,6 +501,7 @@ function UnitRow({
   onHide?: () => void;
   onUnlink?: () => void;
   onRemoveFromPathway?: () => void;
+  onLinkToSuggestion?: () => void;
 }) {
   const navigate = useNavigate();
   const item = unit.item;
@@ -447,6 +512,7 @@ function UnitRow({
   // what the suggestion needs. The status lives here alone.
   const meta = [
     unit.strand ? STRAND_LABELS[unit.strand] : null,
+    unit.unlinked ? 'placed here · answers no suggestion' : null,
     item ? ITEM_STATUS_LABELS[item.status] : ambiguous ? `${unit.candidates!.length} of your items answer this — choose one` : 'suggestion',
     item && committedItemIds.has(item.id) ? 'for class' : null,
   ].filter(Boolean);
@@ -455,6 +521,7 @@ function UnitRow({
   const menu: { label: string; run: () => void }[] = [
     ...(!item && !ambiguous ? [{ label: 'Link an existing item…', run: onChoose }] : []),
     ...(!item && onHide ? [{ label: 'Hide this suggestion', run: onHide }] : []),
+    ...(item && onLinkToSuggestion ? [{ label: 'Link to a suggestion…', run: onLinkToSuggestion }] : []),
     ...(item && onUnlink ? [{ label: 'Unlink reference (keeps the item)', run: onUnlink }] : []),
     ...(item && onRemoveFromPathway ? [{ label: 'Remove from pathway (keeps the item)', run: onRemoveFromPathway }] : []),
   ];
diff --git a/src/store/useStore.ts b/src/store/useStore.ts
index 8799bcc1074269bef9c6b0d16dd2e97cf849cebe..7da3235b23c386b4cd966a2a2a346a94f8a2c396 100644
--- a/src/store/useStore.ts
+++ b/src/store/useStore.ts
@@ -48,7 +48,7 @@ import {
   courseForPathway,
   courseRoutine,
   courseStage,
-  planCatalogAddition,
+  planStageAddition,
   planChooseCourseSource,
   planCourseLevels,
   itemOwnedAttachments,
@@ -469,7 +469,16 @@ interface StoreState {
   addFromCatalog: (
     stageId: ID,
     entryKey: string,
-  ) => { id: ID; created: boolean; candidates?: PracticeItem[]; sourceCandidates?: Material[]; refusal?: string };
+    /** The owner explicitly asked for a NEW item beside the unlinked ones placed in the stage. */
+    separate?: boolean,
+  ) => {
+    id: ID;
+    created: boolean;
+    candidates?: PracticeItem[];
+    placed?: PracticeItem[];
+    sourceCandidates?: Material[];
+    refusal?: string;
+  };
   /**
    * Write one of a course stage's own routines — the level's, or one built for
    * where the owner actually is — as an ordinary editable routine. Returns its
@@ -1400,7 +1409,7 @@ export const useStore = create<StoreState>()(
         set((s) => ({ db: { ...s.db, lessonAgenda: s.db.lessonAgenda.filter((e) => e.id !== id) } }));
       },
 
-      addFromCatalog: (stageId, entryKey) => {
+      addFromCatalog: (stageId, entryKey, separate = false) => {
         const { db } = get();
         const entry = catalogForStage(stageId).find((e) => e.key === entryKey);
         const stage = db.pathwayStages.find((s) => s.id === stageId);
@@ -1416,7 +1425,7 @@ export const useStore = create<StoreState>()(
         // test environment cannot import this file (Dexie, through ./idb), so
         // the decision is proved in courseSeed.test.ts and this SHAPE is what
         // protects the wiring.
-        const plan = planCatalogAddition(db, stageId, entryKey, entry, instrumentId, new Date());
+        const plan = planStageAddition(db, stageId, entryKey, entry, instrumentId, new Date(), separate);
         // Reuse and an ambiguous answer change nothing — no set(), no revision.
         // A write reload would refuse is never applied (a backstop: the plan
         // itself creates a binding only where nothing on that instrument holds it).
@@ -1430,6 +1439,7 @@ export const useStore = create<StoreState>()(
           id: plan.itemId,
           created: plan.created,
           ...(plan.candidates ? { candidates: plan.candidates } : {}),
+          ...(plan.placed ? { placed: plan.placed } : {}),
           ...(plan.sourceCandidates ? { sourceCandidates: plan.sourceCandidates } : {}),
         };
       },
diff --git a/src/styles/global.css b/src/styles/global.css
index 85b08e30bb437e4668c112b15d1361c550168d6d..5c993a48b8cef8b5a8af1d6fb188a09c0264039f 100644
--- a/src/styles/global.css
+++ b/src/styles/global.css
@@ -209,6 +209,22 @@ body,
     height: 100dvh;
   }
 }
+/* INSTALLED APP ONLY. Measured on the owner's iPhone (iOS 27, standalone,
+   docs/repertoire-experience.md): `100dvh` flips between the full screen
+   (852) and the screen minus the status bar (793) — during the keyboard, after
+   rotation, and sometimes stuck there, which is the lifted bar — while `100vh`
+   (= `100lvh`) resolved to the full screen on every portrait line, keyboard
+   included, and to the landscape height after rotation. So the installed app
+   is sized from `vh`. (`100vh + safe-area-inset-top` was tried and measured
+   911: the bar cut off.) Browser tabs never match this query and keep `dvh`,
+   which traced correctly there. */
+@media (display-mode: standalone) {
+  html,
+  body,
+  #root {
+    height: 100vh;
+  }
+}
 
 .app {
   height: 100%;
diff --git a/tests/repertoire-experience.browser.test.ts b/tests/repertoire-experience.browser.test.ts
index e4e250970573a0ddb041752ae22e279728ca1754..2d8eb548b3ebf8929e1249bbb3af5b104a42c898 100644
--- a/tests/repertoire-experience.browser.test.ts
+++ b/tests/repertoire-experience.browser.test.ts
@@ -526,6 +526,26 @@ describe('the whole repertoire experience, in both engines', () => {
           await until(app, (d) => d.pathways.find((p) => p.id === 'setar-radif-mirza')!.hiddenRefs ?? [], (h) => h.length === 0);
           expect((await db(app)).items.length, where).toBe(itemsBefore);
 
+          // PLACING an owned item beside a suggestion is not linking it — and
+          // Add never mints a silent second copy: it asks, and Link answers.
+          await goTo(app, '/items/it-title-only');
+          await page.getByRole('combobox', { name: 'Pathway stage this item belongs to' }).selectOption('setar-radif-mirza-abu-ata');
+          await until(app, (d) => d.items.find((i) => i.id === 'it-title-only')!.stageId, (x) => x === 'setar-radif-mirza-abu-ata');
+          await goTo(app, '/pathway/setar-radif-mirza/setar-radif-mirza-abu-ata');
+          expect(await page.locator('.stage-unit', { hasText: 'Untitled tasnif' }).innerText(), where).toContain('answers no suggestion');
+          await page.getByRole('button', { name: 'Add سیخی to your items' }).click();
+          const asked = page.getByRole('region', { name: 'Is “سیخی” already in this stage?' });
+          await asked.getByRole('button', { name: /Untitled tasnif/ }).click();
+          const linkedPlaced = await until(
+            app,
+            (d) => d.items.find((i) => i.id === 'it-title-only')!.catalogRefs,
+            (r) => !!r?.includes('radif:mirza-abdollah:abu-ata:sayakhi'),
+          );
+          expect(linkedPlaced, where).toEqual(['radif:mirza-abdollah:abu-ata:sayakhi']);
+          expect((await db(app)).items.length, where).toBe(itemsBefore);
+          await page.getByRole('button', { name: 'Practise Untitled tasnif' }).waitFor();
+          expect(await page.locator('.stage-unit', { hasText: 'Untitled tasnif' }).count(), where).toBe(1);
+
           // TAR shares the definition, never the practice.
           await goTo(app, '/repertoire?view=paths&inst=inst-tar');
           await page.getByRole('button', { name: /Add default pathway: تار · ردیف میرزا عبدالله/ }).click();
diff --git a/tests/repertoire-viewport.browser.test.ts b/tests/repertoire-viewport.browser.test.ts
index 2e3da6d8ea938f2222cbd39636a4158cdcce44a6..1fa8244cb14fa0227eec3946b1240f61e004dff8 100644
--- a/tests/repertoire-viewport.browser.test.ts
+++ b/tests/repertoire-viewport.browser.test.ts
@@ -143,6 +143,30 @@ describe('the iPhone keyboard, as geometry', () => {
         expect(await g.restores(), `${engine}: residual after scroll`).toBe(3);
         expect(await page.evaluate(() => document.querySelector('main')!.scrollTop), engine).toBe(mainBefore);
 
+        // SHELL BOXES: `overflow: hidden` stops the owner scrolling #root, not
+        // the browser — a reveal can scroll it, which LIFTS the bar while the
+        // document offset reads 0. A spacer makes #root scrollable so the
+        // lifted bar is real, not a number; it is removed afterwards.
+        const barBottom = () => page.evaluate(() => document.querySelector('.tabbar')!.getBoundingClientRect().bottom);
+        const rootScroll = () => page.evaluate(() => document.getElementById('root')!.scrollTop);
+        const restingBottom = await barBottom();
+        await page.evaluate(() => {
+          const spacer = document.createElement('div');
+          spacer.id = 'lift-spacer';
+          spacer.style.height = '2000px';
+          document.getElementById('root')!.append(spacer);
+          document.getElementById('root')!.scrollTop = 150;
+        });
+        expect(await barBottom(), `${engine}: bar lifted by #root`).toBe(restingBottom - 150);
+        await g.set(508, 1, 0);
+        await g.fire('resize');
+        expect([await g.restores(), await rootScroll()], `${engine}: shell, keyboard up`).toEqual([3, 150]);
+        await g.set(844, 1, 0);
+        await g.fire('resize');
+        expect([await g.restores(), await rootScroll(), await barBottom()], `${engine}: shell, keyboard gone`).toEqual([4, 0, restingBottom]);
+        expect(await page.evaluate(() => document.querySelector('main')!.scrollTop), engine).toBe(mainBefore);
+        await page.evaluate(() => document.getElementById('lift-spacer')!.remove());
+
         // ROUTE CHANGES tear nothing down twice and add nothing: still ONE guard.
         for (const route of ['/', '/lessons', '/repertoire?view=paths', '/terms', '/start']) {
           await goTo(app, route);
@@ -151,7 +175,36 @@ describe('the iPhone keyboard, as geometry', () => {
         // BACK FROM THE BACKGROUND with residual displacement: one restore.
         await g.set(844, 1, 70);
         await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
-        expect(await g.restores(), `${engine}: resume`).toBe(4);
+        expect(await g.restores(), `${engine}: resume`).toBe(5);
+
+        // THE OWNER'S TRACE (More → Keyboard trace) writes down what a device
+        // reports at each event, and changes nothing the guard does.
+        await goTo(app, '/more');
+        await page.locator('summary', { hasText: 'Keyboard trace' }).click();
+        await page.getByRole('button', { name: 'Start recording' }).click();
+        await g.set(508, 1, 120);
+        await g.fire('resize');
+        await g.set(844, 1, 120);
+        await g.fire('resize');
+        expect(await g.restores(), `${engine}: traced restore`).toBe(6);
+        await page.evaluate(() => {
+          const main = document.querySelector('main')!;
+          main.scrollTop = 40;
+          main.dispatchEvent(new Event('scroll'));
+        });
+        await page.getByRole('button', { name: 'Stop recording' }).click();
+        const lines = (await page.getByRole('textbox', { name: 'Keyboard trace' }).inputValue()).split('\n').map((l) => JSON.parse(l));
+        expect(lines[0], engine).toMatchObject({ ua: expect.any(String), secure: true, build: expect.any(String) });
+        expect(lines.some((l) => l.ev === 'vv:resize' && l.vvH === 508), `${engine}: keyboard-up sample`).toBe(true);
+        // Every line carries what the viewport units and insets RESOLVE to.
+        for (const key of ['vh', 'svh', 'lvh', 'dvh', 'pct', 'insetTop', 'insetBottom', 'screenH']) {
+          expect(typeof lines[1][key], `${engine}: probe ${key}`).toBe('number');
+        }
+        expect(await page.locator('body > div[aria-hidden="true"][style*="visibility"]').count(), `${engine}: probes removed`).toBe(0);
+        // <main>'s own scrolling is the owner's and never fills the trace.
+        expect(lines.some((l) => /main/.test(l.ev ?? '')), engine).toBe(false);
+        expect(lines.some((l) => l.ev === 'restore'), `${engine}: guard action recorded`).toBe(true);
+        expect(await g.listeners(), `${engine}: recorder torn down`).toBe(2);
         expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
       } finally {
         await app.close();
```

**Paths the rework touched:**

- `AGENTS.md`
- `DECISIONS.md`
- `README.md`
- `docs/repertoire-experience.md`
- `src/components/ReferenceChoices.tsx`
- `src/components/direction.test.ts`
- `src/components/useViewportGuard.ts`
- `src/components/viewport.test.ts`
- `src/components/viewport.ts`
- `src/domain/courseSeed.ts`
- `src/domain/pathways.ts`
- `src/domain/referenceCatalog.test.ts`
- `src/pages/More.tsx`
- `src/pages/StageDetail.tsx`
- `src/store/useStore.ts`
- `src/styles/global.css`
- `tests/repertoire-experience.browser.test.ts`
- `tests/repertoire-viewport.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
b80b741 Rework: placed items vs. stage suggestions; measurable native keyboard shell

Family 1 — an owned item placed in a stage and the suggestion beside it must
read as one clear, actionable relationship; Add must never mint a silent second
copy. Invariant: placement decides no identity, so while an item placed in a
stage answers none of its suggestions, the stage says so and Add there creates
nothing until the owner links an item or explicitly asks for a new one. Title or
gusheh equality is never used to merge rows (text is not identity).
Choke point: `unlinkedInStage` (pathways.ts), read by both the rows and Add
(`planStageAddition`, wrapping `planCatalogAddition`; `separate` = explicit
"Add as a new item").
Consumers:
- stageUnits — placed row flagged `unlinked` (fixed); hiddenUnits — unchanged,
  a hidden suggestion's item answers it (checked clean)
- stageProgress / nextUnitInStage / currentStage / pathwayProgress and the
  Today, Repertoire and PathwayDetail progress readers — counts unchanged: an
  unlinked item and an untaken suggestion are two units until linked (checked)
- StageDetail Add and Play — routed through planStageAddition; new "Is “…”
  already in this stage?" choice (Link / Add as a new item), Play starts the
  linked or new item (fixed)
- StageDetail placed row — "placed here · answers no suggestion" and "Link to a
  suggestion…" (SuggestionChoice) (fixed)
- Link / Unlink / Remove from pathway — unchanged planners (checked clean)
- Item Detail placement (placeItemInStage → settleLegacyEvidence) — still
  decides no identity; now surfaced on the stage instead of hidden (checked)
- store addFromCatalog — passes `separate`, returns `placed` (fixed)
Proof: ac-8 test (referenceCatalog.test.ts) §7 — placement, both rows, Add on
two suggestions creates nothing, Link keeps every owner field and collapses to
one row, re-Add reuses, Add-as-new creates one bound item and then reuses,
Tar instance unaffected; ac-19 browser journey places a real item via 
… (truncated)

d23fafc Keyboard trace: label event sources, never drop lines silently, stamp the build

The trace is what ac-24 rests on, so it must be able to name the mechanism:
each line's event now names its source (vv/window/body/root/document), <main>'s
own scrolling no longer fills it, a full trace says so on screen and in the
text, and the header carries the build and isSecureContext so a pasted trace
proves which app over which origin produced it. ac-20 asserts all three.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

59c00ca iPhone bar: trace shows a height flip; standalone shell candidate + unit probes

The owner's first installed-app trace (iOS, standalone, http) falsified the
scroll-displacement reading: in the lifted state every scroll offset is 0 and
the guard correctly decides none. innerHeight — and so 100dvh, the shell
height — flips between 852 (bar flush) and 793 (screen minus the 59px status
bar, bar lifted by exactly that), and after rotation flips every frame for
~1.8s; the base viewport height (clientHeight) is 793 on every portrait line.
The recording started in the bad state, so the keyboard is not shown to cause
it.

- global.css: standalone-only shell height calc(100vh + safe-area-inset-top),
  a CANDIDATE sized from the one stable reading instead of dvh. Browser tabs,
  the guard and the interactive-widget meta are untouched so the next trace
  isolates this one change. Not claimed fixed; ac-24 stays outstanding.
- Keyboard trace: each line now records what 100vh/svh/lvh/dvh/100% and the
  safe-area insets actually resolve to, plus screen.height (the candidate's two
  unmeasured inputs). ac-20 asserts the probe fields and their removal.
- Docs revised in place: the body/#root restore is a real blind spot but not
  this defect; procedure asks for installed-app, Safari-tab and Chrome-tab
  traces from a confirmed-good start.

Playwright cannot emulate display-mode: standalone, so the CSS candidate has no
browser proof; the device trace is the proof.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

b5ec595 iPhone bar: standalone shell sized 100vh, from measured units; warn on deploy-nas.sh

The second round of owner traces (iOS 27.0; installed app, Safari tab,
Chrome tab) measured what each unit resolves to. Installed app: 100vh =
100lvh = 852 (the physical screen) on every portrait line, keyboard included,
393 in landscape; 100dvh flips to 793 with the keyboard and lags into
landscape; insets 59/34. The previous candidate calc(100vh + inset-top)
therefore measured 911 and cut the bar off — refuted as predicted. Standalone
now uses 100vh; browser tabs, which traced flush on 100dvh, are unchanged.
The guard and the interactive-widget meta stay untouched.

scripts/deploy-nas.sh runs rsync --delete on PC_DEPLOY_DIR and deleted the
owner's Setar/Tar media when pointed at a folder holding them. The script is
outside this lane's scope, so it is not changed here; AGENTS.md, README and
the ac-24 procedure now warn instead of recommending it.

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
