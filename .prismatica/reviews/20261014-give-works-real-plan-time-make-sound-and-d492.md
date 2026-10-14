---
id: 20261014-give-works-real-plan-time-make-sound-and-d492
contractId: 20261014-give-works-real-plan-time-make-sound-and-d492
patchId: 995cbd90e022364fb531812f5a736347112b3f92
reviewer: claude
state: sealed
verdict: approve
createdAt: 2026-10-14T14:49:23.548Z
sealedAt: 2026-10-14T15:09:15.465Z
---

# Review: Give works real plan time, make sound and updates recover, and capture item changes after practice

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261014-give-works-real-plan-time-make-sound-and-d492
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/51
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `995cbd90e022364fb531812f5a736347112b3f92`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified

## The Delta this change was framed from

# Close revises Status, Primary focus and Current effort behind one collapsed line, every Start or Resume tap readies fresh sound, plans give every whole work at least the standard 10-minute block, Routine complete can record what each item showed, and one Reload tap lands the newest build in the window that asked.

_approved · about "practise-todays-recommendation"_

## Today

Close changes Status only by accepting one of three suggestions, the practice sound can die for good after a long idle, and around this flow plans give works 2–3-minute slots, routine finishes record no result, and the update banner sticks or reloads windows nobody tapped.

## Instead

Close revises Status, Primary focus and Current effort behind one collapsed line, every Start or Resume tap readies fresh sound, plans give every whole work at least the standard 10-minute block, Routine complete can record what each item showed, and one Reload tap lands the newest build in the window that asked.

## Keep

- One item, one mode, one focus, one result, one next action; closing stays under a minute.
- Only closing a block completes a review; the date shown is the date saved.
- Recorded minutes never depend on sound, the wake lock or updates.

## New assumptions

_none_

## Show me

Run the Node route and the three browser journeys named in the plan in Chromium and WebKit: the 20-minute Setar fixture loses its 2-minute warm-up, a dead context recovers at the next Start, the uncontrolled-page update lands on one tap while an unchanged rebuild offers nothing, and close and routine captures persist through reload. Then the three OWNER checks.



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

**Approved intent:** `.prismatica/intents/20261014-give-works-real-plan-time-make-sound-and-d492.md`

**Findings from the previous review:**

- **The update offer waits while a close is unsaved (/close); on /close it shows only when the close screen's own code is missing** — offerShownOn (src/components/appUpdate.ts) unhides the banner on /close whenever missingRoute is set, and routeCodeMissing() / page() (src/App.tsx) record no route identity, so a missing chunk for ANY route shows 'A new version is ready.' with Reload over an unsaved close, contradicting the contract and offerShownOn's own doc ('unless the close screen's own code is the route that is missing'). Instances: offerShownOn, routeCodeMissing, page(). The unit test 'the update offer follows the live registration and only the tapping window reloads' asserts '/close included', locking in the page-wide behaviour; row F of 'a published update installs on the first reload in both engines without loops or surprise reloads' covers only a waiting worker. Checked clean: LayoutUpdateBanner (sole caller), the refused-hydration UpdateBanner.
  _counterexample:_ Window W has loaded ActiveBlock and CloseBlock. Another window taps Reload (V2 activates, A chunks purged), or W is uncontrolled and the server serves V2. In W open More -> its chunk 404s -> missingRoute=true. Today -> Start -> Finish -> /close renders from the cached module and offerShownOn(state,'/close') is true: the banner and Reload sit over the unsaved close, and Reload drops the chosen result, observation and next action.
- **Before first review the approved proof route's named partial fixes are shown failing their acceptance, and subtle work says where its family proof lives** — Of the ten partial fixes the contract requires shown failing, only 'renewal only when closed or at a boundary' is recorded. Unrecorded: floor on warm-ups only, instrument-keyed floor, overflow still into the cool-down, workbox-window kept with a reload fallback, automatic reload when a route's code is missing, offer on a first install, HEAD-based stamp, review computed from the edited item, routine annotation by item instead of block. DECISIONS.md points at a lane commit message containing this proof, but no such recorded proof exists. Subtle work also needs clear family-proof pointers.
  _counterexample:_ The lane commits, ledger and recorded check evidence contain no run for the nine named partial fixes, while DECISIONS.md points to proof in a commit message that does not exist.
- **Only a route whose code an update removed becomes the update offer, and the controller is inert outside a production build** — page() in src/App.tsx catches every rejection of lazy route imports, including genuine page-load bugs and development errors, and calls routeCodeMissing(). routeCodeMissing has no production guard. A real page bug can therefore become 'A new version is ready.' and reload back into the same failure, while development journeys may lose the original page error.
  _counterexample:_ A page module throws while loading: instead of surfacing that error, the app records a missing route and shows the update offer. In production Reload lands on the same faulty build and can repeat the offer.
- **A whole work fills an optional role (warm-up, cool-down) only when that role's share is at least 10** — swapSegment checks a candidate work's floor against the slot's current rounded minutes, not the optional role's underlying share. A cool-down with a share of 9 can be rounded to 10 and then accept a whole work. The swap proof checks minutes but not the role-share rule.
  _counterexample:_ At a 38-minute budget, after removing two works, a settled drill cool-down can have a share of 9 but be rounded to 10. Swap then accepts a gusheh because its 10-minute floor fits the displayed 10, even though the cool-down share is below 10.

**What changed since the previously reviewed head:**

```diff
diff --git a/DECISIONS.md b/DECISIONS.md
index 9ac4c83119bc4c43725e0c755639c4a41b3913ac..9fb6263bf62cf56fb509c274fa4c138de01b7e63 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -31,7 +31,10 @@ banner over all of them; none needed a schema change.
   and reloaded other windows. `appUpdate.ts` registers once per page, offers
   only when this window runs older code (an uncontrolled page checks whether a
   worker precaches its own entry chunk), and reloads only the tapping window,
-  once. A missing route's code shows the offer, never an automatic reload.
+  once. A route whose code an update removed (its import failed AND the app
+  now serves another entry) shows the offer in its place, never an automatic
+  reload; any other import failure is the page's own error and surfaces as
+  itself. On /close the offer waits unless the close screen's own code is gone.
   The stamp is the last commit that changed a build input
   (`scripts/app-version.mjs`), so records-only pushes publish byte-identical
   files and no offer. Rejected: keeping workbox-window with a reload fallback;
@@ -44,8 +47,46 @@ banner over all of them; none needed a schema change.
   review. A full close per routine item was rejected as turning one finish
   into several forms.
 
-Proof: `docs/scheduling-evidence.md` §5–6, `docs/setar-practice-reliability.md`
-§1b and §6, and the lane's commit message (each partial fix and its failing check).
+Where each family's proof lives (one named test each; run it with
+`npx vitest run <file> -t "<title>"`), and its limits:
+
+- Plan floors and role shares: ac-1 in `src/domain/plan.test.ts`, on committed
+  synthetic fixtures (Setar, Tar, Guitar, parts, Tar plus one work) swept over
+  every budget, warm-up share and review window, through build, Remove (once
+  and twice) and Swap; numbers in `docs/scheduling-evidence.md` §5. Limit:
+  synthetic libraries — the owner's own is ac-14.
+- Sound: ac-2 (`practiceCue.test.ts`) and ac-3 (`practice-cues.browser.test.ts`),
+  `docs/setar-practice-reliability.md` §1b and §6,
+  `node scripts/check-setar-practice-families.mjs --mutations`. Limit: a fake
+  context proves its lifecycle, never audibility (ac-13).
+- Updates and stamp: ac-8 (fake container), ac-9 and ac-10 (real builds on a
+  local server, both engines), ac-11 (a temp git repo). Limit: no Pages CDN,
+  no installed iPhone (ac-12).
+- Close edits: ac-4 through the store's real `closeSession`; ac-5 in browsers.
+  Routine capture: ac-6 and ac-7. Their readers: `docs/scheduling-evidence.md` §6.
+
+Red on base (ee7a091): ac-1 — "Setar … 12 min … s-shahnaz is a work: expected
+2 to be ≥ 10"; ac-2 and ac-3 — `docs/setar-practice-reliability.md` §1b; ac-9
+— row A times out waiting for the Reload's load, row C reloads the other window.
+The base cannot run the others: ac-4–8, ac-10 and ac-11 drive what it does not
+have (`itemEdits`, `captureRoutineResults`, `appUpdate.ts`, the stamp module).
+
+The named partial fixes, each applied alone to a clean tree at 0b6e065 and run
+against only its acceptance test (restored with `git checkout` after). Every
+one FAILS:
+
+| Partial fix (exact change) | Test | Fails with |
+|---|---|---|
+| Floor on warm-ups only (`buildSessionPlan` passes 2 for every other bucket) | ac-1 | Setar 12 min: "s-l1 is a work: expected 6 ≥ 10" |
+| Instrument-keyed floor (`segmentFloor` only for `setar`) | ac-1 | Guitar 12 min: "g-piece2 is a work: expected 3 ≥ 10" |
+| Overflow still into the cool-down (cool-down capped at 25, in the overflow list) | ac-1 | Setar 120 min: "cool-down: expected 25 ≤ 13" |
+| Renewal only when closed or at a boundary | ac-2 | the 2026-10-14 mutation run (`docs/setar-practice-reliability.md` §6) |
+| workbox-window kept with a reload fallback (`useRegisterSW`, `updateServiceWorker(true)` then `location.reload()` after 1.5 s) | ac-9 | row A, V2 found early: no offer (Chromium, 20 s timeout) |
+| Automatic reload when a route's code is missing (`location.reload()` in `routeCodeMissing`) | ac-8 | "expected [ {offer: true…}, 1 ] to equal [ …, 0 ]" |
+| Offer on a first install (every worker read as newer) | ac-8 | "own first install: expected true to be false" |
+| HEAD-based stamp (`git log -1 HEAD`, no pathspec) | ac-11 | ".prismatica/records/change.md: expected '2020-03-02·8bd935f' to be '2020-03-01·e4d7e81'" |
+| Review computed from the edited item (`computeReviewOutcome` given `applyCloseEdits(item, …)`) | ac-4 | "auto · status suggested · focus set · effort changed · save · edit present" |
+| Routine annotation by item instead of block (a capture applied to every block of its item) | ac-6 | "run-A · worse · observation" — a block outside the run changed |
 
 ## Browser journeys wait on events; CI and the Gate are bounded and run once (2026-10-08)
 
diff --git a/docs/scheduling-evidence.md b/docs/scheduling-evidence.md
index 0f8684374b7059731300e91d579d56147ec5c561..9748b0f635cc413374c8b03968b4844c870b0a98 100644
--- a/docs/scheduling-evidence.md
+++ b/docs/scheduling-evidence.md
@@ -162,7 +162,9 @@ stated in the summary — which therefore appears only when every segment that
 may take minutes is at 25.
 
 Remove re-spreads under the same rules; Swap offers only material whose floor
-fits the slot. The floor is fixed on each segment when it is planned
+fits the slot — in a warm-up or cool-down, the role's share, never the minutes a
+rounding pass lifted above it (a whole work cools down only on a share of 10).
+The floor is fixed on each segment when it is planned
 (`floorMinutes`); a running plan persisted before floors existed has none and
 still runs. A plan of drills alone keeps exactly the minutes it had wherever no
 warm-up or cool-down absorbed overflow and nothing reached 25
diff --git a/src/App.tsx b/src/App.tsx
index d6fe1f198d90b2f73d98c20c88b00c023051e324..f59e582c5a82c3b746445d05f97304898267d789 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -12,38 +12,39 @@ import { recoverFromRefusedHydration } from './store/backup';
 // chunks anyway so offline still has everything.
 import Today from './pages/Today';
 /**
- * A route loaded on demand. If its code is gone — an update replaced the
- * build this window started from — the route renders nothing and Layout's
- * update offer stands in its place instead of a broken screen. It never
- * reloads by itself.
+ * A route loaded on demand, named by its path. If an update removed its code
+ * — the app now serves another build than this window started from — the
+ * route renders nothing and Layout's update offer stands in its place instead
+ * of a broken screen; it never reloads by itself. Any other failure is the
+ * page's own and is thrown as itself.
  */
 const NoRoute = () => null;
-function page(load: () => Promise<{ default: React.ComponentType }>) {
+function page(route: string, load: () => Promise<{ default: React.ComponentType }>) {
   return lazy(() =>
-    load().catch(() => {
-      routeCodeMissing();
+    load().catch(async (error: unknown) => {
+      if (!(await routeCodeMissing(route))) throw error;
       return { default: NoRoute };
     }),
   );
 }
-const StartBlock = page(() => import('./pages/StartBlock'));
-const ActiveBlock = page(() => import('./pages/ActiveBlock'));
-const CloseBlock = page(() => import('./pages/CloseBlock'));
-const ItemDetail = page(() => import('./pages/ItemDetail'));
-const NewItem = page(() => import('./pages/NewItem'));
-const Materials = page(() => import('./pages/Materials'));
-const Insights = page(() => import('./pages/Insights'));
-const Repertoire = page(() => import('./pages/Repertoire'));
-const PathwayDetail = page(() => import('./pages/PathwayDetail'));
-const StageDetail = page(() => import('./pages/StageDetail'));
-const Lessons = page(() => import('./pages/Lessons'));
-const RoutineRunner = page(() => import('./pages/RoutineRunner'));
-const RoutineEdit = page(() => import('./pages/RoutineEdit'));
-const SessionPlan = page(() => import('./pages/SessionPlan'));
-const TeacherReport = page(() => import('./pages/TeacherReport'));
-const Settings = page(() => import('./pages/Settings'));
-const More = page(() => import('./pages/More'));
-const MusicTerms = page(() => import('./pages/MusicTerms'));
+const StartBlock = page('/start', () => import('./pages/StartBlock'));
+const ActiveBlock = page('/active', () => import('./pages/ActiveBlock'));
+const CloseBlock = page('/close', () => import('./pages/CloseBlock'));
+const ItemDetail = page('/items/:id', () => import('./pages/ItemDetail'));
+const NewItem = page('/items/new', () => import('./pages/NewItem'));
+const Materials = page('/materials', () => import('./pages/Materials'));
+const Insights = page('/insights', () => import('./pages/Insights'));
+const Repertoire = page('/repertoire', () => import('./pages/Repertoire'));
+const PathwayDetail = page('/pathway/:pathwayId', () => import('./pages/PathwayDetail'));
+const StageDetail = page('/pathway/:pathwayId/:stageId', () => import('./pages/StageDetail'));
+const Lessons = page('/lessons', () => import('./pages/Lessons'));
+const RoutineRunner = page('/routine/:routineId', () => import('./pages/RoutineRunner'));
+const RoutineEdit = page('/routine/:routineId/edit', () => import('./pages/RoutineEdit'));
+const SessionPlan = page('/plan', () => import('./pages/SessionPlan'));
+const TeacherReport = page('/report', () => import('./pages/TeacherReport'));
+const Settings = page('/settings', () => import('./pages/Settings'));
+const More = page('/more', () => import('./pages/More'));
+const MusicTerms = page('/terms', () => import('./pages/MusicTerms'));
 
 /**
  * The one recovery action reachable from a refused COLD-START hydration
diff --git a/src/components/appUpdate.test.ts b/src/components/appUpdate.test.ts
index 570d7a55759f8cc3887d25ae7281fa74d55248f9..ae0d9a5f178e5670303e707373b1d6ac9d5a81d1 100644
--- a/src/components/appUpdate.test.ts
+++ b/src/components/appUpdate.test.ts
@@ -5,10 +5,12 @@ import { afterEach, describe, expect, it, vi } from 'vitest';
 // install, wait, activate (by this window's tap, another window's, or as a
 // first install), get superseded, and a route's code goes missing. `fetch`
 // answers with the server's current sw.js, which precaches that build's entry
-// chunk — the identity an uncontrolled page checks.
+// chunk — the identity an uncontrolled page checks — and its index.html, which
+// names that entry: the evidence that a route's failed code was an update's.
 // ---------------------------------------------------------------------------
 
 type Build = string;
+const indexHtml = (b: Build) => `<!doctype html><script type="module" crossorigin src="/assets/index-${b}.js"></script>`;
 const swText = (b: Build) => `define(["./workbox"],function(s){s.precacheAndRoute([{url:"index.html",revision:"${b}"},{url:"assets/index-${b}.js",revision:null}])});`;
 
 class FakeWorker extends EventTarget {
@@ -35,6 +37,8 @@ class FakeWorker extends EventTarget {
 class World {
   server: Build;
   registerFails = false;
+  offline = false;
+  fetched = 0;
   reloads = 0;
   listeners = 0;
   intervals = 0;
@@ -121,7 +125,11 @@ async function openPage(world: World, opts: { controller?: FakeWorker | null; pr
     Object.assign(doc, { visibilityState: 'visible', querySelector: () => ({ getAttribute: () => `/assets/index-${world.page}.js` }) }),
   );
   vi.stubGlobal('location', { href: 'https://app.test/#/', reload: () => (world.reloads += 1) });
-  vi.stubGlobal('fetch', async () => ({ text: async () => swText(world.server) }));
+  vi.stubGlobal('fetch', async (url: string) => {
+    world.fetched += 1;
+    if (world.offline) throw new TypeError('Failed to fetch');
+    return { ok: true, text: async () => (String(url).endsWith('sw.js') ? swText(world.server) : indexHtml(world.server)) };
+  });
   vi.stubGlobal('setInterval', () => (world.intervals += 1));
   const m = await import('./appUpdate');
   m.startAppUpdates({ production: opts.production ?? true });
@@ -147,6 +155,9 @@ describe('the update controller', () => {
       const world = new World('A');
       const page = await openPage(world, { production: false });
       expect([world.container.registered, world.listeners, world.intervals, page.offer()]).toEqual([0, 0, 0, false]);
+      // A route that fails to load in development is its own error, never an update.
+      world.server = 'V2';
+      expect([await page.m.routeCodeMissing('/more'), page.m.readAppUpdate(), world.fetched]).toEqual([false, { offer: false, missingRoutes: [] }, 0]);
       const bare = await openPage(new World('A'), { noServiceWorker: true });
       expect(bare.offer()).toBe(false);
       const refusing = new World('A');
@@ -268,17 +279,34 @@ describe('the update controller', () => {
         expect([v2.posted, world.reloads]).toEqual([[], 1]);
       }
 
-      // --- A ROUTE WHOSE CODE IS GONE: the offer, never a reload by itself ---
+      // --- A ROUTE WHOSE CODE IS GONE: only an update's removal is the offer,
+      // never a reload by itself, and never over an unsaved close for another route's code
       for (const controlled of [true, false]) {
         const world = new World('A');
         const a = new FakeWorker('A', world);
         world.installed(a);
         const page = await openPage(world, { controller: controlled ? a : null });
+        const now = () => page.m.readAppUpdate();
         expect(page.offer()).toBe(false);
-        page.m.routeCodeMissing();
-        expect([page.m.readAppUpdate(), world.reloads]).toEqual([{ offer: true, missingRoute: true }, 0]);
-        // A missing route shows the offer in its place, /close included.
-        expect(page.m.offerShownOn(page.m.readAppUpdate(), '/close')).toBe(true);
+        // The app still serves this page's build: the failure is the page's own.
+        expect(await page.m.routeCodeMissing('/more')).toBe(false);
+        // Unreachable: nothing proves an update either.
+        world.server = 'V2';
+        world.offline = true;
+        expect(await page.m.routeCodeMissing('/more')).toBe(false);
+        expect([now(), world.reloads]).toEqual([{ offer: false, missingRoutes: [] }, 0]);
+        // Another build is served: More's code was removed by an update.
+        world.offline = false;
+        expect(await page.m.routeCodeMissing('/more')).toBe(true);
+        expect([now(), world.reloads]).toEqual([{ offer: true, missingRoutes: ['/more'] }, 0]);
+        expect(page.m.offerShownOn(now(), '/more'), 'in place of the missing route').toBe(true);
+        // The close screen's code still loaded: the offer waits until Save or Discard.
+        expect(page.m.offerShownOn(now(), '/close'), "another route's code over /close").toBe(false);
+        expect(page.m.offerShownOn(now(), '/'), 'after Save or Discard').toBe(true);
+        // The close screen's OWN code gone: the offer stands in for it.
+        expect(await page.m.routeCodeMissing('/close')).toBe(true);
+        expect(page.m.offerShownOn(now(), '/close'), "the close screen's own code").toBe(true);
+        expect(world.reloads).toBe(0);
         await tap(page, taps);
         expect(world.reloads).toBe(1);
       }
diff --git a/src/components/appUpdate.ts b/src/components/appUpdate.ts
index 0e7503148fe032b9c9da48402786c1e60317e340..227d2d131cd1691cad0c7dbab1a8aeac89d4c73d 100644
--- a/src/components/appUpdate.ts
+++ b/src/components/appUpdate.ts
@@ -10,7 +10,10 @@ import { useSyncExternalStore } from 'react';
 //   • a worker waiting to take over, or one activated since this page loaded,
 //     that is not this page's own build — never the first install of the
 //     build this page is already running;
-//   • a route whose code an update removed (`routeCodeMissing`).
+//   • a route whose code an update removed (`routeCodeMissing`): its import
+//     failed AND the app now serves a build whose entry is not this page's.
+//     Any other failure — the page's own bug, the dev server, the network —
+//     is not an update and surfaces as itself.
 // Only the Reload tap reloads, only its own window, exactly once: a waiting
 // worker is told to SKIP_WAITING first, and the reload follows once it
 // controls or activates; otherwise the reload is direct. Nothing else ever
@@ -29,14 +32,14 @@ import { useSyncExternalStore } from 'react';
 export interface UpdateState {
   /** This window runs older code than the newest build found. */
   offer: boolean;
-  /** A route's code is gone: the offer stands in for that route. */
-  missingRoute: boolean;
+  /** Routes whose code an update removed: the offer stands in for each. */
+  missingRoutes: readonly string[];
 }
 
 type Identity = 'mine' | 'newer' | 'pending';
 
 const HOURLY_MS = 60 * 60 * 1000;
-const INITIAL: UpdateState = { offer: false, missingRoute: false };
+const INITIAL: UpdateState = { offer: false, missingRoutes: [] };
 
 let state: UpdateState = INITIAL;
 const listeners = new Set<() => void>();
@@ -49,14 +52,13 @@ const identities = new WeakMap<ServiceWorker, Identity>();
 
 function publish(next: Partial<UpdateState>): void {
   const merged = { ...state, ...next };
-  if (merged.offer === state.offer && merged.missingRoute === state.missingRoute) return;
+  if (merged.offer === state.offer && merged.missingRoutes === state.missingRoutes) return;
   state = merged;
   for (const fn of listeners) fn();
 }
 
-/** This page's entry script, relative to the app's base — the name a worker precaches it under. */
-function pageEntry(base: string): string | null {
-  const src = document.querySelector('script[type="module"][src]')?.getAttribute('src');
+/** An entry script's name relative to the app's base — the name a worker precaches it under. */
+function entryName(src: string | null | undefined, base: string): string | null {
   if (!src) return null;
   const path = new URL(src, location.href).pathname;
   const basePath = new URL(base, location.href).pathname;
@@ -67,7 +69,7 @@ function evaluate(): void {
   const reg = registration;
   if (!reg) return;
   const newest = reg.waiting ?? reg.active;
-  publish({ offer: state.missingRoute || (!!newest && identities.get(newest) === 'newer') });
+  publish({ offer: state.missingRoutes.length > 0 || (!!newest && identities.get(newest) === 'newer') });
 }
 
 function identify(worker: ServiceWorker): void {
@@ -129,7 +131,7 @@ export function startAppUpdates(options: { production?: boolean } = {}): void {
   if (typeof navigator === 'undefined' || !navigator.serviceWorker) return;
   started = true;
   const base = import.meta.env.BASE_URL;
-  entry = pageEntry(base);
+  entry = entryName(document.querySelector('script[type="module"][src]')?.getAttribute('src'), base);
   loadController = navigator.serviceWorker.controller;
   try {
     navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).then(wire, () => undefined);
@@ -162,18 +164,36 @@ export function reloadToUpdate(): void {
   waiting.postMessage({ type: 'SKIP_WAITING' });
 }
 
-/** A route's code failed to load: an update removed it. Offer the update in its place — never reload. */
-export function routeCodeMissing(): void {
-  publish({ missingRoute: true, offer: true });
+/**
+ * `route`'s code failed to load. True — and the update offered in its place,
+ * never a reload — only when an update removed it: this production page's
+ * controller runs, and the app now serves an entry that is not this page's
+ * (a controlled page asks its worker's precache, an uncontrolled one the
+ * network). False otherwise, so the caller rethrows the original error.
+ * Never throws.
+ */
+export async function routeCodeMissing(route: string): Promise<boolean> {
+  if (!started || !entry) return false;
+  const base = import.meta.env.BASE_URL;
+  let served: string | null = null;
+  try {
+    const r = await fetch(`${base}index.html`, { cache: 'no-store' });
+    if (r.ok) served = entryName(/<script\b[^>]*\btype="module"[^>]*\bsrc="([^"]+)"/.exec(await r.text())?.[1], base);
+  } catch {
+    // Unreachable: nothing proves an update.
+  }
+  if (served === null || served === entry) return false;
+  if (!state.missingRoutes.includes(route)) publish({ missingRoutes: [...state.missingRoutes, route], offer: true });
+  return true;
 }
 
 /**
  * Whether the banner shows on this route. It waits while a close is unsaved
  * (/close) and appears the moment Save or Discard leaves it — unless the close
- * screen's own code is the route that is missing.
+ * screen's own code is missing, when the offer stands in for it.
  */
 export function offerShownOn(s: UpdateState, pathname: string): boolean {
-  return s.offer && (pathname !== '/close' || s.missingRoute);
+  return s.offer && (pathname !== '/close' || s.missingRoutes.includes('/close'));
 }
 
 function subscribe(fn: () => void): () => void {
diff --git a/src/domain/plan.test.ts b/src/domain/plan.test.ts
index 187614bacc85eeb7863a726b00e41db341406210..a797aff5d57af4f80dd933395761fb5e386afa4e 100644
--- a/src/domain/plan.test.ts
+++ b/src/domain/plan.test.ts
@@ -766,7 +766,15 @@ function fixtures(): Fixture[] {
     items: setar.items.filter((i) => !['s-l1', 's-l2', 's-new'].includes(i.id)),
     preparationDates: new Map(),
   };
-  return [setar, setarReviews, tar, guitar, parts];
+  // The drill library with one settled work beside it: once two Removes leave
+  // a drill cool-down rounded up to 10 on a share of 9, that work fits the
+  // slot's minutes but not the role's share.
+  const tarWork: Fixture = {
+    ...tar,
+    name: 'Tar drills and one settled work',
+    items: [...tar.items, fixtureItem(T, 't-work', { itemType: 'gusheh', persian: { dastgahAvaz: 'ماهور', gusheh: 'درآمد' }, status: 'maintenance', difficulty: 2, timesPractised: 15, importance: 2 })],
+  };
+  return [setar, setarReviews, tar, guitar, parts, tarWork];
 }
 
 const BUDGETS = [5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120];
@@ -912,8 +920,12 @@ function coolShare(B: number, share: number, buckets: string[]): number {
 }
 const render = (plan: SessionPlan) => plan.segments.map((x) => `${x.itemId}:${x.bucket}:${x.minutes}`).join(' ');
 
-/** Every rule a seated plan must keep, whichever door (build, Remove) produced it. */
-function expectFloorsAndShares(plan: SessionPlan, f: Fixture, B: number, share: number, max: number, label: string) {
+/**
+ * Every rule a seated plan must keep, whichever door (build, Remove, Swap)
+ * produced it. A swap keeps the slot's minutes, so a swapped plan is held to
+ * the floors and role shares but not re-judged against the review ceiling.
+ */
+function expectFloorsAndShares(plan: SessionPlan, f: Fixture, B: number, share: number, max: number, label: string, swapped = false) {
   const items = new Map(f.items.map((i) => [i.id, i]));
   const segs = plan.segments;
   const buckets = segs.map((x) => x.bucket);
@@ -938,7 +950,7 @@ function expectFloorsAndShares(plan: SessionPlan, f: Fixture, B: number, share:
   }
   const work = segs.filter((x) => x.bucket === 'deep' || x.bucket === 'lesson');
   // The review ceiling holds while deep or lesson work could take the minutes.
-  for (const r of segs.filter((x) => x.bucket === 'review')) {
+  for (const r of swapped ? [] : segs.filter((x) => x.bucket === 'review')) {
     const ceiling = Math.max(max, expectWork(items.get(r.itemId)!) ? 10 : MIN_SEGMENT_MINUTES);
     if (r.minutes > ceiling) expect(work.every((x) => x.minutes === MAX_SEGMENT_MINUTES), `${label} review over its ceiling`).toBe(true);
   }
@@ -982,29 +994,39 @@ describe('whole works keep the standard block', () => {
             for (const seg of plan.segments) {
               expect(seg.floorMinutes, `${label} ${seg.itemId} floor`).toBe(expectWork(items.get(seg.itemId)!) ? 10 : MIN_SEGMENT_MINUTES);
             }
-            // REMOVE re-allocates under the same rules.
+            // SWAP offers only material whose floor fits the slot — and, in a
+            // warm-up or cool-down, the role's own share, not its rounded
+            // minutes — whether the plan is fresh or already trimmed by Remove.
+            const expectSwaps = (p: SessionPlan, at: string) =>
+              p.segments.forEach((seg, i) => {
+                const swapped = swapSegment(p, i, args);
+                expect(swapped.segments[i].minutes, `${at} swap ${i}`).toBe(seg.minutes);
+                expectFloorsAndShares(swapped, f, B, share, window[1], `${at} swap ${i}`, true);
+              });
+            expectSwaps(plan, label);
+            // REMOVE re-allocates under the same rules, twice over.
+            const remove = (p: SessionPlan, i: number) => redistributePlan({ ...p, segments: p.segments.filter((__, j) => j !== i) }, args.params);
             if (plan.segments.length > 1) {
               plan.segments.forEach((_, i) => {
-                const removed = redistributePlan({ ...plan, segments: plan.segments.filter((__, j) => j !== i) }, args.params);
+                const removed = remove(plan, i);
                 expect(removed.segments.length, `${label} remove ${i}`).toBe(plan.segments.length - 1);
                 expectFloorsAndShares(removed, f, B, share, window[1], `${label} remove ${i}`);
+                expectSwaps(removed, `${label} remove ${i}`);
+                removed.segments.forEach((__, k) => {
+                  if (removed.segments.length < 2) return;
+                  const twice = remove(removed, k);
+                  expectFloorsAndShares(twice, f, B, share, window[1], `${label} remove ${i} then ${k}`);
+                  expectSwaps(twice, `${label} remove ${i} then ${k}`);
+                });
               });
             }
-            // SWAP offers only material whose floor fits the slot.
-            plan.segments.forEach((seg, i) => {
-              const swapped = swapSegment(plan, i, args).segments[i];
-              expect(swapped.minutes, `${label} swap ${i}`).toBe(seg.minutes);
-              if (plan.segments.length > 1) {
-                expect(expectWork(items.get(swapped.itemId)!) ? 10 : MIN_SEGMENT_MINUTES, `${label} swap ${i}`).toBeLessThanOrEqual(seg.minutes);
-              }
-            });
 
             // DRILL-ONLY: where the base plan's warm-up and cool-down stayed
             // within their shares (nothing above the warm-up's share or the
             // cool-down's floored split — the review clamp used to push its
             // excess there) and no segment reached 25, the minutes are
             // exactly the base allocator's.
-            if (f.instrumentId === 'tar') {
+            if (f.name === 'Tar drills only') {
               const base = BASE_TAR[`${B}|${share}|${window.join('-')}`];
               const segs = base.split(' ').map((x) => x.split(':'));
               const buckets = segs.map((x) => x[1]);
@@ -1034,6 +1056,15 @@ describe('whole works keep the standard block', () => {
     // only on its own weighted split — never on leftovers.
     expect(render(buildSessionPlan(sweepArgs(reviewDay, 90, 0.12, [3, 7])))).toMatch(/^s-shahnaz:warmup:11 .* s-daramad:cooldown:10$/);
 
+    // The reviewer's case: two Removes leave the drill cool-down at 10 minutes
+    // on a share of 9; Swap may not hand that role the settled work.
+    const tarWork = fixtures()[5];
+    const twArgs = sweepArgs(tarWork, 45, 0.15, [3, 7]);
+    const drop1 = (p: SessionPlan) => redistributePlan({ ...p, segments: p.segments.filter((_, j) => j !== 1) }, twArgs.params);
+    const trimmed = drop1(drop1(buildSessionPlan(twArgs)));
+    expect([render(trimmed), coolShare(45, 0.15, trimmed.segments.map((x) => x.bucket))]).toEqual(['t-scale:warmup:7 t-frag:deep:25 t-tremolo:cooldown:10', 9]);
+    expect(swapSegment(trimmed, 2, twArgs).segments[2].itemId).not.toBe('t-work');
+
     // A RUNNING PLAN persisted before floors existed still re-spreads and starts.
     const [setar] = fixtures();
     const built = buildSessionPlan(sweepArgs(setar, 45, 0.12, [3, 7]));
diff --git a/src/domain/plan.ts b/src/domain/plan.ts
index f10cdbeba7675f21306cb1a549455b0811c02784..79743019a0f0f2a54110bb225062178aef9992e7 100644
--- a/src/domain/plan.ts
+++ b/src/domain/plan.ts
@@ -767,7 +767,8 @@ export function redistributePlan(plan: SessionPlan, params?: SchedulingParams):
 
 /**
  * Swap segment `index` for the next-best alternative, keeping its minutes and
- * its role — offered only material whose floor fits those minutes. Uses the SAME eligibility policy, candidate pool and warm-up
+ * its role — offered only material whose floor fits those minutes and, in a
+ * warm-up or cool-down, that role's share. Uses the SAME eligibility policy, candidate pool and warm-up
  * exclusions as the build — a swap that could reach material the build
  * excluded is a second, hidden policy, and it used to hand back an item
  * already practised today (or a due/lesson-committed item as a "warm-up")
@@ -811,11 +812,21 @@ export function swapSegment(
       .map((r) => [r.practiceItemId, r.dueDate] as const),
   );
 
+  // Only material whose floor fits the slot: a two-minute warm-up is never
+  // handed a whole work. An optional role is judged by its SHARE, as the build
+  // and the allocator judge it — never by minutes rounding lifted above it.
+  // A one-segment plan has no floors.
+  const params = args.params ?? DEFAULT_SCHEDULING_PARAMS;
+  const others = plan.segments.filter((_, i) => i !== index).map((s) => s.bucket);
+  const room =
+    target.bucket === 'warmup'
+      ? Math.min(target.minutes, warmupShareMinutes(plan.budgetMinutes, params))
+      : target.bucket === 'cooldown'
+        ? Math.min(target.minutes, cooldownShareMinutes(plan.budgetMinutes, params, others))
+        : target.minutes;
   const eligible = (s: ItemScore): boolean => {
     if (inUse.has(s.item.id) || exclude.has(s.item.id)) return false;
-    // Only material whose floor fits the slot: a two-minute warm-up is never
-    // handed a whole work. A one-segment plan has no floors.
-    if (plan.segments.length > 1 && segmentFloor(s.item) > target.minutes) return false;
+    if (plan.segments.length > 1 && segmentFloor(s.item) > room) return false;
     switch (target.bucket) {
       case 'warmup':
         // Same exclusions as the build's own warm-up pool: a due review or a
diff --git a/tests/app-update.browser.test.ts b/tests/app-update.browser.test.ts
index a03b8e26b696a763c8f31c201b5eb634c937ab70..8cf54e3e65a756b01fcaa5a8412fcf08312a7254 100644
--- a/tests/app-update.browser.test.ts
+++ b/tests/app-update.browser.test.ts
@@ -426,6 +426,58 @@ describe('taking a new version', () => {
           await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
           expect([w.loads() - loadsBeforeF, w.errors.map((e) => e.message)]).toEqual([0, []]);
           await ctx.close();
+
+          // …and when ANOTHER route's code is gone. An uncontrolled window
+          // fetches its code from the server: it practises once under A (the
+          // practice and close screens' code now loaded), then V2 is served.
+          // More's code is gone — the offer in its place — yet the close
+          // screen still runs, so on /close the offer waits all the same.
+          h.serve(b.A);
+          ctx = await fresh();
+          w = await openWindow(ctx, h);
+          await untilActive(w);
+          expect((await runs(w)).controlled, `${engine} F: uncontrolled`).toBe(false);
+          const loadsBeforeF2 = w.loads();
+          const practiseToClose = async () => {
+            await w.page.getByRole('navigation', { name: /Which instrument/ }).getByRole('button', { name: 'Setar', exact: true }).click();
+            await w.page.getByRole('button', { name: /Start · 10 min/ }).click();
+            await w.page.getByRole('button', { name: 'Finish' }).click();
+            await w.page.getByRole('button', { name: 'Discard without saving' }).waitFor();
+          };
+          await practiseToClose();
+          await w.page.getByRole('button', { name: 'Discard without saving' }).click();
+          await w.page.getByRole('navigation', { name: 'Primary' }).waitFor();
+          h.serve(b.V2);
+          await w.page.getByRole('link', { name: 'More' }).click();
+          await w.page.locator('a.tab.active', { hasText: 'More' }).waitFor();
+          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
+          await w.page.getByRole('link', { name: 'Today' }).click();
+          await w.page.locator('a.tab.active', { hasText: 'Today' }).waitFor();
+          await practiseToClose();
+          await quietWindow(w.app, 1_500);
+          expect(await w.page.getByText(OFFER).count(), `${engine} F: another route's code over /close`).toBe(0);
+          await w.page.getByRole('button', { name: 'Discard without saving' }).click();
+          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
+          expect([w.loads() - loadsBeforeF2, w.errors.map((e) => e.message)]).toEqual([0, []]);
+          await ctx.close();
+
+          // The close screen's OWN code gone (practice started under A, V2
+          // served before Finish): the offer stands in for it, no page error.
+          h.serve(b.A);
+          ctx = await fresh();
+          w = await openWindow(ctx, h);
+          await untilActive(w);
+          const loadsBeforeF3 = w.loads();
+          await w.page.getByRole('navigation', { name: /Which instrument/ }).getByRole('button', { name: 'Setar', exact: true }).click();
+          await w.page.getByRole('button', { name: /Start · 10 min/ }).click();
+          await w.page.getByRole('button', { name: 'Finish' }).waitFor();
+          h.serve(b.V2);
+          await w.page.getByRole('button', { name: 'Finish' }).click();
+          await w.page.getByText(OFFER).waitFor({ timeout: 20_000 });
+          await quietWindow(w.app, 1_500);
+          expect(await w.page.getByRole('button', { name: 'Discard without saving' }).count(), `${engine} F: close code gone`).toBe(0);
+          expect([w.loads() - loadsBeforeF3, w.errors.map((e) => e.message)]).toEqual([0, []]);
+          await ctx.close();
         } finally {
           await h.close();
         }
```

**Paths the rework touched:**

- `DECISIONS.md`
- `docs/scheduling-evidence.md`
- `src/App.tsx`
- `src/components/appUpdate.test.ts`
- `src/components/appUpdate.ts`
- `src/domain/plan.test.ts`
- `src/domain/plan.ts`
- `tests/app-update.browser.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
6da9a1a Swap judges an optional role by its share, not its rounded minutes

Finding (sealed review): "A whole work fills an optional role (warm-up,
cool-down) only when that role's share is at least 10". swapSegment checked a
candidate's floor against the slot's minutes, which the allocator may lift one
rounding minute above the cool-down's share.

Instances found: swapSegment (fixed: a warm-up or cool-down candidate's floor
must fit min(minutes, the role's share), computed by the same
warmupShareMinutes / cooldownShareMinutes the build and allocator use).
Consumers checked clean: buildSessionPlan's warm-up pool (pinned share) and
cool-down pool (cooldownShareMinutes with it seated), allocateMinutes' seating
(fits() drops a role whose share is under its floor), redistributePlan (the
same allocator), SessionPlan.tsx (passes the build's clamped params to build,
Remove and Swap alike).

Proof: ac-1's named test "planned whole works keep the standard block and the
plan adapts its segment count" (src/domain/plan.test.ts) now holds every
swapped plan — fresh, after one Remove and after two — to the same floors and
role shares as a built one, over a new fixture (Tar drills plus one settled
work), and pins the reviewer's literal case: 45 min, share 0.15, two Removes
leave the drill cool-down at 10 on a share of 9; Swap may not seat the work.
Red on the previous head ("cool-down on a work: expected 9 to be >= 10").

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

0b6e065 Only an update's removal is a missing route, and it knows which route

Findings (sealed review):
- "The update offer waits while a close is unsaved (/close); on /close it
  shows only when the close screen's own code is missing"
- "Only a route whose code an update removed becomes the update offer, and the
  controller is inert outside a production build"

Instances found and fixed:
- offerShownOn (src/components/appUpdate.ts): showed on /close whenever ANY
  route was missing; now only when '/close' is among the missing routes.
- routeCodeMissing: recorded no route and needed no evidence; now takes the
  route, returns whether an update removed it — the controller runs (so never
  outside a production build) AND the app now serves an index.html whose entry
  is not this page's (a controlled page reads its worker's precache, an
  uncontrolled one the network) — and never throws. Unreachable or same
  entry: false.
- page() (src/App.tsx): names each route; rethrows the original error unless
  routeCodeMissing proves an update, so a page's own bug or a dev error
  surfaces as itself instead of becoming "A new version is ready.".
Consumers checked clean: LayoutUpdateBanner (sole offerShownOn caller), the
refused-hydration UpdateBanner (reads `offer` only), evaluate() (offer while
any route is missing), reloadToUpdate (unchanged).

Proof:
- ac-8 "the update offer follows the live registration and only the tapping
  window reloads" (src/components/appUpdate.test.ts): the "/close included"
  assertion is replaced — another route's missing code keeps /close clear, the
  close screen's own shows the offer; same build served, or unreachable, is
  not an update; outside production nothing is fetched or recorded. Red with
  the old page-wide rule ("another route's code over /close") and with the
  evidence check dropped.
- ac-9 "a published update installs on the first reload in both engines
  without loops or surprise reloads" (tests/app-update.browser.test.ts), row
 
… (truncated)

1c6a472 Record each named partial fix failing its acceptance, and where each family's proof lives

Finding (sealed review): "Before first review the approved proof route's named
partial fixes are shown failing their acceptance, and subtle work says where
its family proof lives".

DECISIONS.md's 2026-10-14 entry pointed at a commit message that held no such
proof. It now records, for every partial fix the approved proof route names,
the exact change, the one named acceptance test it was run against and the
assertion that failed — each applied alone to a clean tree at 0b6e065 and
restored with git checkout:

- a floor on warm-ups only, an instrument-keyed floor, overflow still into the
  cool-down: ac-1 (plan.test.ts) fails on each;
- renewal only when closed or at a boundary: ac-2, already in the recorded
  mutation run (docs/setar-practice-reliability.md §6);
- workbox-window kept with a reload fallback: ac-9 fails at row A, V2 found
  early (no offer), in Chromium;
- an automatic reload on a missing route, an offer on a first install: ac-8;
- a HEAD-based stamp: ac-11;
- a review computed from the edited item: ac-4 (the store's real closeSession);
- routine annotation by item instead of block: ac-6.

It also records red on base for ac-1 (base plan.ts: a 2-minute warm-up on a
Setar gusheh at 12 min), alongside the existing ac-2/ac-3 and ac-9 records, and
names each family's one proof route with its limits (synthetic libraries, fake
audio, local service worker, temp git repo; the OWNER checks cover the rest).

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

e0a8666 Refile the Flow Report after the review rework

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>

c87bda7 DECISIONS: say why the base cannot run the remaining acceptances

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

## Check against the contract

- [ ] **ac-1** — src/domain/plan.test.ts, independently derived expectations on committed synthetic fixtures (Setar works with many due reviews and class commitments, Tar drills, Guitar pieces plus drills, parts) × budgets 5, 10, 12, 15, 20, 25, 30, 45, 60, 90, 120 × warmupShare 0.10/0.15 × review windows: no work segment under 10 in a multi-segment plan and none under 2; total ≤ budget and equal to it unless every segment is at 25; the anchor always seated; warm-up and cool-down never above their defined shares, holding a work only when that share is at least 10, and never carrying overflow; overflow reaches deep and lesson work before reviews, and the review ceiling holds while deep or lesson work can take the minutes; Remove and Swap obey the same floors; a persisted run without floors still starts; drill-only fixtures in which no warm-up or cool-down absorbed overflow and no segment reaches 25 equal the base allocator's literal outputs, captured before the change; repeated builds deep-equal. Red on base for the Setar fixtures (2-minute warm-up, 11–21-minute cool-down). _(proof: planned whole works keep the standard block and the plan adapts its segment count)_
- [ ] **ac-2** — src/components/practiceCue.test.ts: each dead state (running with a frozen clock, interrupted that resume() cannot clear, suspended after a resolved resume, closed by the browser) plus the existing throw, reject, hang and constructor faults × each readying entry (start, resume, Test, Turn on sound): the next tap closes the old context and creates and resumes exactly one new one; one live context; a boundary then plays once on it; boundaries never create, resume or replay; an older Test request never plays. This is the evolved unit companion of the 2026-10-05 sound acceptance. Red on base: the frozen running context is reused and stays silent. _(proof: every readying tap replaces the page's sound context and a boundary never revives a dead one)_
- [ ] **ac-3** — tests/practice-cues.browser.test.ts, Chromium and WebKit, through mounted screens with CUE_PORTS extended by the dead states: after the context dies, the next tap through every door (Today Start, StartBlock, stage ▶, routine card Start and duration, plan Begin, Active Resume, Close Back, Routine Resume, Turn on sound, Settings Test) creates and resumes a fresh context inside that click on the tapped route, closes the old one, and the next boundary cues exactly once; recorded minutes and markers are unchanged. This is the 2026-10-05 one-context journey, renamed and evolved to one live context rather than deleted. _(proof: practice sound returns at the next tap after the context dies through every start and resume door)_
- [ ] **ac-4** — Node (closeSession with mocked idb as practiceCue.test.ts already does, or the pure helper it delegates to): edit present vs absent × status (suggested, other, unchanged) × primary focus (set, cleared, unchanged) × effort (changed, unchanged) × Save, Save without a result, Discard × auto, interval and manual review modes: only chosen fields change, in the block's single write; the saved review date and type equal planNextReview on the pre-edit item; the block's mode and focus are untouched; Save without a result keeps explicit edits and drops the engine suggestion; Discard writes nothing; importance, notes, review fields and SR state change only as the review decision says. _(proof: closing a block saves only the item edits the owner chose and decides the review from the item as practised)_
- [ ] **ac-5** — tests/post-practice.browser.test.ts, Chromium and WebKit at 390x844: Start, Finish, then the close screen shows the collapsed item line with current values; Change, pick status, focus and effort, Save; after reload the item page shows them and the saved review date equals the line shown before saving; an untouched close leaves those item fields equal; Save without a result and Discard behave as the domain acceptance says; direction and pressed-state ledgers cover the new controls. _(proof: close screen revises status focus and effort in one tap and saves them with the block)_
- [ ] **ac-6** — src/domain/routines.test.ts: this run's blocks vs another run's or older blocks vs unknown ids × each result vs not_logged vs an invalid value × observation present or empty × an item with a later logged block: only this run's blocks change; an invalid value is refused naming the block; lastResult moves only when the block is the item's latest logged one; nextReviewDate, open reviews, SR fields, srLastProgressDay, status, minutes and counters are unchanged; repeating the same capture is a no-op; the existing pure result readers (recentResults, lastResultsAllSame, the Insights cards, the report) see the captured result. _(proof: routine capture annotates only its own run's blocks and never moves a review or schedule)_
- [ ] **ac-7** — tests/post-practice.browser.test.ts, Chromium and WebKit: run a routine with two bound items and an unbound segment, Finish & save, and the blocks are persisted as not_logged before any capture; record a result for one item and a note for the other; after reload the item history shows them and due reviews are still due; skipping the capture leaves not_logged; reloading on Routine complete keeps the minutes. _(proof: routine complete captures what each item showed without delaying the save)_
- [ ] **ac-8** — src/components/appUpdate.test.ts with fake container, registration and workers: controlled vs uncontrolled page × first install of this page's build vs update found at registration vs later × waiting vs activated without waiting vs superseded by a newer waiting worker vs activated by another window vs a route whose code is gone × one vs repeated taps × /close vs another route: the offer appears exactly when this window runs older code (never for the first install) and clears once the newest build lands; one tap gives exactly one reload, after the new worker controls or activates, or directly when nothing waits; nothing reloads without a tap in that window; on /close the offer waits until the close is saved or discarded; remounting adds no registration, listener or timer; outside a production build nothing registers and nothing throws. _(proof: the update offer follows the live registration and only the tapping window reloads)_
- [ ] **ac-9** — tests/app-update.browser.test.ts, Chromium and WebKit, on real production builds made by the test into temp dirs outside the repo (dist/ untouched): A and V2 from the repository with different stamps through the explicit override, each served from its own directory so A-only chunks are gone once V2 is served, plus V3, a sw.js byte-variant of V2; local server, no network. Rows: (A) a fresh page installs A with no offer, then is offered V2 while uncontrolled, found early and late; (B) a controlled page; (C) two windows: one tap reloads only that window, while the other shows the offer, and navigating it to a route whose A chunk is gone shows the offer in place with no page error, its own tap landing on V2 at that route; (D) V3 superseding a waiting V2; (E) no offer reappears across foreground checks while the same build is served; (F) on /close the offer waits until Save or Discard. Every tap reloads exactly once onto the newest found build; nothing reloads without a tap. Red on base for A and C, as the planner reproduced. Waits follow tests/journey-waits.test.ts. _(proof: a published update installs on the first reload in both engines without loops or surprise reloads)_
- [ ] **ac-10** — tests/app-update.browser.test.ts, sharing those builds: B, built from a temp tree holding only the inputs the stamp module lists (node_modules linked) with A's stamp, equals A byte for byte across every file, sw.js and its precache manifest included, so the build is deterministic and reads nothing else; V2's different stamp changes sw.js. In Chromium and WebKit a page on A that is served B finds no update and shows no offer across foreground checks. With the stamp test, this proves a records-, docs- or tests-only push publishes nothing a browser sees as new. _(proof: an unchanged app rebuilds byte for byte and offers no update)_
- [ ] **ac-11** — tests/app-version.test.ts in a temp git repo, driven by the stamp module's own input list: commits touching .prismatica/, docs/, tests/, other scripts or any *.md leave the stamp unchanged; a commit touching each listed input (src/, public/, index.html, vite.config.ts, the stamp module, tsconfig*.json, package.json, package-lock.json) changes it; the date is the commit's, not the build clock's; shallow history falls back to HEAD; an explicit override wins. _(proof: the build stamp names the last commit that changed what ships)_
- [ ] **ac-12** — OWNER, before approving (deploy.yml publishes only main; there is no branch preview), on the Mac through `npm run preview` at http://localhost:4173/practice-compass/ (a secure context, docs/nas-topology.md), following the procedure the builder hands over, which uses the stamp override in place of a code change: open the lane build in two windows; publish a rebuild with a new stamp: both show 'A new version is ready.', one Reload tap lands that window on the new build (Settings names it), and the other reloads only on its own tap; publish an unchanged rebuild: no offer appears. The iPhone's update path is observed after ship, not here. _(proof: manual:OWNER)_
- [ ] **ac-13** — OWNER, before approving: on the Mac through the same localhost preview, leave the app idle between blocks for a long while (or let the display sleep), then tap Start: the target cue is heard without closing the app. On the iPhone through the NAS HTTPS mirror (docs/nas-topology.md), Start a block and hear its cue; if no mirror serves, the iPhone half is environment-blocked rather than failed and is observed after ship. Audibility is the owner's. _(proof: manual:OWNER)_
- [ ] **ac-14** — OWNER, before approving, on the localhost preview holding a full backup exported from the production app and imported there, with sync never connected so no test practice reaches real history: 20-, 30- and 45-minute Setar plans give no piece or gusheh less than 10 minutes and still read as a sensible session; closing a block with a status, focus and effort change, and capturing a routine's results, each take well under a minute. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/plan.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts
- **log-a-class** — touched via src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx
- **practise-todays-recommendation** — touched via src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/blocks.ts
- **prepare-for-the-next-class** — touched via src/pages/CloseBlock.tsx
- **run-a-session-plan** — touched via src/domain/plan.ts, src/store/useStore.ts
- **sync-devices-via-github** — touched via src/pages/Settings.tsx, src/App.tsx
- **work-a-pathway-stage** — touched via src/pages/RoutineRunner.tsx, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/plan.ts, src/store/useStore.ts matched changed file(s) src/domain/plan.ts, src/pages/CloseBlock.tsx, src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/store/useStore.ts matched changed file(s) src/pages/Settings.tsx, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## clear-a-due-review — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## point-this-device-at-the-nas — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx matched changed file(s) src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## prepare-for-the-next-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/CloseBlock.tsx matched changed file(s) src/pages/CloseBlock.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## sync-devices-via-github — mechanics-updated

Mapped implementation touched: touchpoint(s) src/pages/Settings.tsx, src/App.tsx matched changed file(s) src/App.tsx, src/pages/Settings.tsx. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## browse-my-repertoire — unchanged

The plan now reads isWork (repertoire.ts) to choose a segment's floor; isWork and every repertoire screen, grouping and search are unchanged.

## see-practice-patterns — unchanged

Insights reads results exactly as before; a result captured on Routine complete is an ordinary block result it already understands, and no Insights code, card or step changed.

## practise-todays-recommendation — truth-proposed

Behaviour changed as the approved plan says; an update proposal is at .prismatica/flows/proposals/practise-todays-recommendation.md

## run-a-session-plan — truth-proposed

Behaviour changed as the approved plan says; an update proposal is at .prismatica/flows/proposals/run-a-session-plan.md

## install-the-app-and-keep-it-current — truth-proposed

Behaviour changed as the approved plan says; an update proposal is at .prismatica/flows/proposals/install-the-app-and-keep-it-current.md

## work-a-pathway-stage — truth-proposed

Behaviour changed as the approved plan says; an update proposal is at .prismatica/flows/proposals/work-a-pathway-stage.md


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

### install-the-app-and-keep-it-current — Works now (update proposed)

Proposed step changes:
  The musician Installs the app from its web address.
    Shows: It opens like an app, full screen, with the navigation bar reaching the bottom of the phone.
    Changes: The app's files are cached on the device; practice data stays in the device's own database.
  The musician Practises with no network at all.
    Shows: Everything works — recommendations, blocks, reviews, notes.
    Changes: Nothing is special-cased for being offline; only syncing and opening NAS files need a network.
− Practice Compass Checks for a new build every hour and whenever the app is brought back to the foreground.
−   Shows: A calm 'A new version is ready.' banner with a Reload button — never an automatic reload in the middle of a session.
−   Changes: Nothing until the musician chooses to reload.
− The musician Taps Reload when it suits them.
−   Shows: The app restarts on the new version; Settings shows the build it is running.
−   Changes: Nothing in the practice data — an update replaces code, never data.
+ Practice Compass Registers its worker once per page and checks for a new build every hour, whenever the app returns to the foreground and on reconnect.
+   Shows: A calm 'A new version is ready.' banner with a Reload button only when this window runs older code than the newest build found — never for the first install of the build it already runs, never an automatic reload, and not while a close is unsaved (it appears right after Save or Discard). A route whose code an update removed shows the banner in its place.
+   Changes: Nothing until the musician chooses to reload. A push that changes no file the build reads publishes byte-identical files, so no banner appears.
+ The musician Taps Reload when it suits them.
+   Shows: This window — only this one — restarts once on the newest build found; Settings shows that build's stamp (the last commit that changed what ships). Other open windows keep their offer until their own tap.
+   Changes: Nothing in the practice data — an update replaces code, never data.

Touchpoints: src/components/Layout.tsx, src/pages/Settings.tsx, vite.config.ts

Evidence: 4 steps: 4 manually verified

### log-a-class — Works now

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
−   Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap readies this page’s practice sound (one sound context for the page, readied only by a tap).
− The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
−   Shows: The elapsed clock, and the item's notes and current problem on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time) so the clock stays readable without touching anything; pausing, finishing, discarding or navigating away releases it, and the phone sleeps normally again. Resume is a tap too and readies the sound again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
−   Changes: Elapsed seconds accumulate only while the timer runs.
+ The musician Taps 'Start · 10 min'.
+   Shows: The active block screen: item title, mode and focus chips, a running ring timer.
+   Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item. The same tap closes the page's sound context and creates and resumes a fresh one, so a context that died while the app sat idle never outlives this tap.
+ The musician Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
+   Shows: The elapsed clock, and the item's notes on request. While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake (best-effort; feature-detected; never affects elapsed time); pausing, finishing, discarding or navigating away releases it. Resume is a tap too and readies a fresh sound context again; if sound is paused or off on this page, a note says so and offers 'Turn on sound'.
+   Changes: Elapsed seconds accumulate only while the timer runs.
  The musician Taps 'Finish'.
    Shows: The close screen, with the minutes already filled in.
    Changes: The clock is frozen first, so reflection time is not counted as practice.
− The musician Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
−   Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.
+ The musician Picks one of the six results, optionally adds an observation, a next action or a teacher question, and optionally revises the item behind one collapsed 'Status · Primary focus · Current effort' line (Change) — an engine-suggested status shows there pre-selected as the pending change.
+   Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link; the date is decided from the item as practised, so revising the item never moves it.
+   Changes: Nothing until Save; untouched fields are never written.
  The musician Taps 'Save block'.
    Shows: Back to Today (or to the running plan), with the item's stats and status updated.
    Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts

Evidence: 7 steps: 7 manually verified

### prepare-for-the-next-class — Works now

Touchpoints: src/pages/TeacherReport.tsx, src/components/ClassQuestions.tsx, src/domain/questions.ts, src/domain/report.ts, src/pages/Lessons.tsx, src/pages/CloseBlock.tsx

Evidence: 4 steps: 4 manually verified

### run-a-session-plan — Works now (update proposed)

Proposed step changes:
− Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
−   Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.
− The musician Swaps, removes or regenerates segments until the shape looks right.
−   Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
−   Changes: Only a local copy of the plan — nothing is saved yet.
+ Practice Compass Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments; a whole work (gusheh, piece, anything with dastgāh/form/composer) gets at least the 10-minute standard block beside other work, drills at least 2, and a segment is seated only while every seated segment can still reach its floor.
+   Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason. The total equals the chosen budget unless every segment that may take minutes is at its 25-minute ceiling; the warm-up and cool-down never exceed their shares or take leftover minutes.
+ The musician Swaps, removes or regenerates segments until the shape looks right.
+   Shows: A removal re-spreads the minutes under the same floors and shares; a swap offers only material whose floor fits the slot.
+   Changes: Only a local copy of the plan — nothing is saved yet.
  The musician Taps 'Start plan'.
    Shows: The runner: the whole list with the current segment highlighted.
    Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.
  The musician Taps 'Start' on the current segment.
    Shows: The ordinary active-block screen, with the segment's minutes as the target — identical behaviour to an unplanned block, including the screen staying awake while it runs and is visible, and a durable 'Target reached' state with a growing overtime figure if the segment runs past its minutes without the musician tapping Finish.
    Changes: A real practice block opens for that segment's item.
  The musician Finishes and saves the block as usual.
    Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
    Changes: The block, item stats and review schedule update exactly as in an unplanned block.
  The musician Skips anything they do not want, or ends the plan at any time.
    Shows: 'Session complete' once the last segment is passed.
    Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/pages/ActiveBlock.tsx, src/domain/plan.ts, src/domain/practiceSignal.ts, src/components/useScreenAwake.ts, src/components/screenAwake.ts, src/store/useStore.ts

Evidence: 6 steps: 6 manually verified

### sync-devices-via-github — Works now

Touchpoints: src/store/syncEngine.ts, src/store/githubSync.ts, src/store/gitRemote.ts, src/domain/sync.ts, src/domain/canonical.ts, src/store/revision.ts, src/pages/Settings.tsx, src/App.tsx

Evidence: 6 steps: 6 manually verified

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

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261014-give-works-real-plan-time-make-sound-and-d492/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
