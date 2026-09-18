---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
contractId: 20260917-turn-the-setar-archive-into-trusted-less-5614
patchId: 21473d5c39f5186804b30feb8d324e44f8ee9a46
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Browser harness cancellation correlation and real WebKit event ordering
    summary: The cancellation veto still permits a genuine WebKit access-control
      page error to be excused when WebKit emits no requestfailed for that
      error. The sealed false-negative family remains open.
    counterexample: "tests/practiceBrowser.ts:225-242 consumes a same-URL
      cancellation whenever no non-cancelled failure is tracked. The rework
      records a genuine CORS-shaped README.md page error with no requestfailed.
      Put an earlier unconsumed cancellation for that exact URL inside
      CANCELLED_EXCUSE_MS, then deliver that genuine error without
      requestfailed: pageErrors at lines 403-409 drops it. The real-browser test
      supplies a genuine requestfailed and therefore does not cover this case."
  - family: ac-18 WebKit archive journey reliability
    summary: The required WebKit archive journey remains intermittently failing; a
      pre-existing harness race does not satisfy ac-18.
    counterexample: tests/setarArchive.browser.test.ts:125 names the ac-18 journey
      and line 367 requires no page errors. The reported intermittent README.md
      access-control error reaches that assertion.
      tests/practiceBrowser.ts:749-752 and 770 leave the fake main ref
      perpetually absent after bootstrap, allowing repeated README.md PUTs
      during navigation. The current Check reports journeys skipped, so it
      supplies no passing WebKit journey evidence.
createdAt: 2026-09-18T21:09:24.242Z
sealedAt: 2026-09-18T21:16:13.362Z
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
- **Diff patch-id:** `21473d5c39f5186804b30feb8d324e44f8ee9a46`

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

- **Browser harness cancellation correlation and real WebKit event ordering** — A genuine WebKit access-control page error can be suppressed by a nearby unrelated cancelled request. The real-browser test confirms the split error shape but does not establish requestfailed/pageerror ordering or safe association.
  _counterexample:_ tests/setarInbound.browser.test.ts:724-737 obtains a genuine CORS page error from real WebKit, then expects excusedCancellation to return true when given a nearby synthetic cancelled event. tests/practiceBrowser.ts:137-201 selects by host and pathname and timestamp, ignoring query and request identity. If a cancellation without its own page error precedes a genuine failure to the same path, and the genuine requestfailed is later, farther away, or absent when pageErrors is read, the genuine page error disappears. The ordering tests at lines 596-655 construct timestamps rather than asserting the order emitted by WebKit.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index e2d5537..d0ae4eb 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -1567,30 +1567,23 @@ later in the same journey, was swallowed and `pageErrors` said nothing. `excused
 excuses exactly one error, and only when the message is the DIAGNOSED wording (a render crash
 naming the same URL is never excused).
 
-**A WINDOW CAN NEVER TELL A CANCELLATION FROM A REAL FAILURE, BECAUSE THEY READ IDENTICALLY —
-ONLY ORDER CAN.** Made consuming and bounded by a generous ceiling, the excuse still matched by
+**A WINDOW CAN NEVER TELL A CANCELLATION FROM A REAL FAILURE, BECAUSE THEY READ IDENTICALLY.** Made consuming and bounded by a generous ceiling, the excuse still matched by
 host+path ALONE: a cancellation that produced no page error of its own stayed a live,
 unconsumed credit for the whole ceiling, spendable by ANY later error to that URL — including
 a genuine one with nothing to do with it. A sealed review reproduced exactly that. Shrinking
 the window cannot fix this; it only trades an over-broad filter for a flakier one, since a
 cancellation's spurious error and a real access-control failure are worded the same on
-purpose. `excusedCancellation` now tracks EVERY `requestfailed`, not only cancelled ones, and
-excuses a page error only when the temporally NEAREST tracked request to the exact host+path it
-names is ITSELF a cancellation. A genuine failure to that URL always fires its own
-`requestfailed` ADJACENT to its own page error, so the instant one happens it becomes the
-nearer candidate and a stale, error-less cancellation is never reached by anything but the
-specific error it was actually waiting for — which is what makes leaving it unconsumed safe
-rather than a standing credit. A TIE is never resolved in the excuse's favour: with two
-candidates the same distance away, the one that is NOT a cancellation wins.
-`CANCELLED_EXCUSE_MS` (2s, down from 30s) is now purely DEFENSIVE headroom against delivery lag
-under the contention five concurrent dev servers create, never the correlation itself.
+purpose. `excusedCancellation` tracks EVERY `requestfailed`, not only cancelled ones, so
+genuine evidence is visible to it. `CANCELLED_EXCUSE_MS` (2s, down from 30s) is purely
+DEFENSIVE headroom against delivery lag under the contention five concurrent dev servers
+create, never the correlation itself.
 
 A second, independent hole lived in the same function: `message.includes(url.host)` and
 `message.includes(url.pathname)` are substring tests, so a host that merely CONTAINS the real
 one (`evil-api.github.com`, `api.github.com.evil.test`) or a path that does
-(`state.json.bak`) passed them. The message is parsed into a real `URL` and compared by
-`host`/`pathname` EQUALITY instead — removing the ambiguity structurally rather than adding
-more boundary characters to a string test.
+(`state.json.bak`) passed them. The message is parsed into a real `URL` and compared part by
+part by EQUALITY instead (`sameResource`) — removing the ambiguity structurally rather than
+adding more boundary characters to a string test.
 
 **AND THE WHOLE EXCUSE WAS DEAD CODE UNTIL A CI RUN PRODUCED THE ERROR IT WAS WRITTEN FOR.**
 Every string above was a hand-written reconstruction; nothing had ever been measured. The same
@@ -1607,12 +1600,9 @@ two facts the harness had backwards, either of which alone made the excuse unabl
   wrong reconstruction fails to match rather than matching loosely. The whitespace the old
   regex tolerated "between the scheme and the host" is fiction: no browser emits it, and the
   apparent space was an artefact of that same split.
-- **THE PAGE ERROR COMES FIRST.** WebKit delivers the `pageerror` about a tenth of a
-  millisecond BEFORE the `requestfailed` for the same request, reproducibly. A backwards-only
-  search read an empty log. NEAREST is measured in BOTH directions now, and the sealed
-  invariant survives the correction untouched, for the same reason it held before: a genuine
-  failure's own `requestfailed` is always adjacent to its own page error, so it always
-  outranks a stale cancellation milliseconds away.
+- **THE PAGE ERROR COMES FIRST.** WebKit delivers the `pageerror` 74–359µs BEFORE the
+  `requestfailed` for the same request — six times out of six, macOS WebKit. A backwards-only
+  search read an empty log. Tracked failures are searched in BOTH directions now.
 
 So a page error is RECORDED as it arrives and JUDGED when `pageErrors` is READ — every journey
 reads it after awaited page work, which round-trips the ordered transport and so has both
@@ -1620,10 +1610,81 @@ events in hand. A judgement is made ONCE: a cancellation arriving afterwards nev
 an error already reported. And an UNEXCUSED diagnosis now carries the browser's own `errorText`
 for every tracked request to that resource and how far each sat from it
 (`cancellationEvidence`), because one bare CORS-shaped message with nothing to distinguish a
-cancellation from a real refusal is exactly what made this failure unreadable. The regression
-tests assert the measured pair verbatim, both event orders, and — driving a REAL WebKit and
-feeding its REAL error object back through the rule — that the shape can never drift back to a
-reconstruction.
+cancellation from a real refusal is exactly what made this failure unreadable. That evidence is
+deliberately BROADER than the excuse — same host and path, whatever the query, each row printing
+its own full url and saying whether it is the resource the error named — because a failure to
+the same path under a different query is exactly what the excuse must refuse to act on and
+exactly what the next CI-only failure needs to show.
+
+**AND PROXIMITY CANNOT CARRY A SAFETY CLAIM EITHER, AT ANY RESOLUTION — THE MEASUREMENT THAT
+CORRECTED THE ORDER IS THE SAME ONE THAT KILLS THE RULE IT WAS PART OF.** Nearest-wins rested on
+"a genuine failure's own `requestfailed` is always ADJACENT to its own page error, so it always
+outranks a stale cancellation". Adjacent it is — 74–359µs — which at `Date.now()` granularity
+reads as a gap of 0ms or 1ms depending on which side of a millisecond boundary the pair
+straddles. An unrelated cancellation landing in the error's OWN millisecond therefore outranks a
+genuine failure 359µs away and excuses it, and a tie-break only covers the case where the two
+land in the same millisecond. Sub-millisecond timestamps move that boundary rather than removing
+it. TWO changes replace it, and neither is a window:
+
+- **IDENTITY IS THE FULL URL — HOST, PATH AND QUERY** (`sameResource`). Host+path alone makes
+  `contents/setar/index.json?ref=<commit A>` and `?ref=<commit B>` one resource, and those are
+  two requests the app really makes one after the other, so a cancellation of one stood ready to
+  excuse a genuine failure of the other. WebKit names the FULL url in the diagnosis, query
+  included (measured), so that identity was available and simply thrown away. The FRAGMENT is
+  the one part that must be ignored, and comparing `href` would get it wrong: the message keeps
+  a fragment verbatim while `request.url()` never carries one, because a fragment is not sent.
+- **GENUINE EVIDENCE VETOES THE EXCUSE FOR THAT RESOURCE, AT ANY DISTANCE.** If any tracked
+  failure for the exact url is NOT a cancellation, nothing is excused — however far away it
+  sits, and whatever sits nearer. A genuine access-control failure always emits its own
+  `requestfailed`, so genuine evidence for this resource means the cancellation's ownership of
+  this error is unproven, and an unproven correlation is never resolved in the excuse's favour.
+  Nearest now only chooses WHICH interchangeable cancellation to consume, never WHETHER one may
+  be. The veto is scoped: a genuine failure to another resource, or to the same path under
+  another query, blocks nothing — and it expires with the ceiling, so it is not a permanent mark
+  against a url.
+
+**AND THE PAIRING THE EXCUSE EXISTS FOR HAS NEVER BEEN OBSERVED — WHICH IS WHY IT DEMANDS THE
+STRONGEST ASSOCIATION THE PLATFORM OFFERS.** This file used to state as fact that WebKit reports
+a cancelled fetch as "Fetch API cannot load … due to access control checks". Measured, five
+cancellation shapes — navigating away mid-flight, reloading mid-flight, `AbortController`, a
+same-tick `location.href`, a cancelled CORS preflight — each produced a `requestfailed` with
+`errorText: 'cancelled'` and NO page error at all, while a reply genuinely lacking CORS headers
+produces exactly that page error. A raced `route.fulfill` therefore remains a live alternative
+explanation for the CI failure, and cannot be settled from here. A cancellation being merely
+NEARBY is not evidence of anything, and the rule above is written accordingly. Playwright offers
+nothing stronger to correlate on: a `pageerror` hands a test an `Error` and no request identity,
+so url text and order are the whole of what exists.
+
+The regression tests assert the measured pair verbatim, the measured ordering, the query and the
+fragment; that a same-path-different-query cancellation excuses nothing; that genuine evidence
+vetoes at any distance; and — driving a REAL WebKit and feeding its REAL error and REAL cancelled
+request back through the rule — that the shape can never drift back to a reconstruction. One
+drives the whole WIRING end to end, a genuinely cancelled request and a real uncaught page error
+naming it, because this excuse has been dead code twice and both times only CI could tell.
+
+**AND THE FAILURE CI ACTUALLY PRODUCES IS NOT THIS ONE, WHICH IS A SEPARATE, OPEN DEFECT.**
+Instrumenting `setarArchive.browser.test.ts` through a real WebKit until it failed — reproduced
+in 2 of 6 sequential runs and 1 of 3 concurrent ones — shows the CORS-shaped page error for
+`contents/README.md` arriving with NO `request`, NO route hit and NO `requestfailed` — the fetch
+is refused before WebKit's network layer ever sees it, because the document is being torn down by
+the journey's own `page.goto` while the app's sync bootstrap PUT is being issued. IT IS NOT FIXED
+BY THE RULE ABOVE and was failing before any of it: four consecutive green runs afterwards are
+not evidence of a fix, because nothing in that change touches this cause. There
+is therefore NOTHING to correlate, and no correlation rule — the old one or this one — can
+excuse it. The remaining fix is to remove the RACE, never to widen the excuse: excusing every
+access-control diagnosis for a faked origin would suppress a whole error class at an entire
+origin on no per-event evidence at all, which is broader than the rule the sealed finding
+rejected. The amplifier is measured too: `installFakeGitHub` answers `PATCH git/refs/heads/main`
+without recording what the app pushed, so `git/ref/heads/main` 404s for ever and EVERY sync
+re-bootstraps the repo with another `PUT contents/README.md` — measured at one every one to
+three seconds for the whole journey, each one a chance to be caught by a navigation. What
+re-triggers a sync that often was NOT established (`page.clock` is installed, so what the app's
+own 30-second quiet-period timer does under it is unknown) and is deliberately not guessed at
+here. Making the fake remember the
+push was built and REVERTED: it changes what `decideSync` sees, and `setarInbound`'s pull
+journey — which publishes a remote snapshot after the app's own push — then reads "Already in
+sync" instead of pulling. That is a lane of its own, with its own journeys to re-prove; it is
+recorded here rather than left to be rediscovered from a red CI run.
 
 **WHAT `ClassQuestions` RENDERS NOW.** The narratives above are the history of one row, and
 the row changed: there is no `Problem:` line any more (`currentProblem` is retired — see the
diff --git a/tests/practiceBrowser.ts b/tests/practiceBrowser.ts
index 6113bd4..3f60bbe 100644
--- a/tests/practiceBrowser.ts
+++ b/tests/practiceBrowser.ts
@@ -30,17 +30,32 @@ const installHint = (engine: Engine) =>
 /**
  * ONE recorded outcome of a network request the harness watched, whatever the
  * browser's own words for it were. Tracking EVERY failure — not only
- * cancellations — is what lets a later, genuine failure to the same URL
- * displace a stale cancellation instead of being excused by it (see
- * `excusedCancellation`).
+ * cancellations — is what lets genuine evidence for a resource VETO the excuse
+ * for that resource (see `excusedCancellation`).
  *
- * A request the BROWSER cancelled because the test navigated away while it was
- * in flight is not an application error. WebKit reports such a fetch as
- * "Fetch API cannot load … due to access control checks", which reads exactly
- * like a CORS problem and is not one: the request is otherwise fulfilled with
- * the right CORS headers every other time. A real person navigating mid-sync
- * cancels the same request, so treating it as a page error makes a journey
- * fail for driving the app quickly.
+ * WHY THERE IS AN EXCUSE AT ALL, and exactly how far the evidence for it goes.
+ * A CI run produced `Fetch API cannot load https://api.github.com/repos/owner/
+ * practice-data/contents/README.md due to access control checks.` on two of
+ * three runners at a commit that passed on the third — a WebKit-only,
+ * CORS-shaped page error, while every other run fulfils that same request with
+ * the right CORS headers. A request the browser CANCELS because the test drove
+ * on while it was in flight is the standing explanation, and a real person
+ * navigating mid-sync cancels the same request, so failing a journey for it
+ * would be failing it for being driven quickly.
+ *
+ * That explanation is NOT measured, and this comment used to state it as fact.
+ * Driving a real WebKit here, five different cancellation shapes — navigating
+ * away mid-flight, reloading mid-flight, `AbortController`, a same-tick
+ * `location.href`, a cancelled CORS preflight — each produced a
+ * `requestfailed` with `errorText: 'cancelled'` and NO page error whatsoever.
+ * A reply that genuinely lacks CORS headers does produce exactly this page
+ * error, so a raced `route.fulfill` remains a live alternative explanation
+ * that cannot be settled from here.
+ *
+ * Which is precisely why the excuse below demands the strongest association
+ * the platform makes available and refuses on anything weaker: the pairing it
+ * exists for has never been observed, so it may never be INFERRED from a
+ * cancellation merely being nearby.
  *
  * `errorText` is kept verbatim rather than reduced to a boolean, because it is
  * the EVIDENCE a refused excuse reports (`cancellationEvidence`): when a
@@ -63,12 +78,25 @@ export interface TrackedRequestFailure {
  * never produced its own page error remained a live "credit" any LATER,
  * genuine access-control failure to that same URL could spend. That is a
  * sealed finding, not a hypothetical: a cancellation and a real failure are
- * indistinguishable by wording or by URL, so a window — however short — can
- * never be the thing that tells them apart. Only ORDER can: see
- * `excusedCancellation` below for the correlation that actually does the work.
- * What is left for this ceiling to do is bound how far apart the two events
- * may be and still be treated as one outcome, in case Node's delivery is
- * delayed under the contention several concurrent dev servers create.
+ * indistinguishable by wording, so a window — however short — can never be
+ * the thing that tells them apart.
+ *
+ * NOR CAN PROXIMITY, AT ANY RESOLUTION. Replacing the window with "whichever
+ * tracked failure sits NEAREST the error wins" was the previous attempt, and
+ * measuring it is what killed it: a genuine access-control failure emits its
+ * own `requestfailed` 74–359µs after its page error (six of six, macOS WebKit),
+ * which reads as a gap of 0ms or 1ms at `Date.now()` granularity depending on
+ * which side of a millisecond boundary the pair straddles. An unrelated
+ * cancellation to the same resource landing in the error's own millisecond
+ * therefore OUTRANKS a genuine failure 359µs away, and excuses it. Sub-
+ * millisecond timestamps would only move that boundary, not remove it.
+ *
+ * What separates them is `excusedCancellation`'s VETO — genuine evidence for
+ * the same resource forbids the excuse outright, however far away it sits —
+ * and the full-URL identity `sameResource` insists on. All this ceiling does
+ * is bound how far apart two events may be and still be considered one
+ * outcome at all, in case Node's delivery is delayed under the contention
+ * several concurrent dev servers create.
  */
 export const CANCELLED_EXCUSE_MS = 2_000;
 
@@ -76,8 +104,8 @@ export const CANCELLED_EXCUSE_MS = 2_000;
  * WebKit's one diagnosis, in the two spellings it uses (a `fetch` and an
  * `XMLHttpRequest`), anchored end to end.
  *
- * The whole point of parsing into a real `URL` and comparing `host` and
- * `pathname` by EQUALITY, rather than testing whether the message merely
+ * The whole point of parsing into a real `URL` and comparing its parts by
+ * EQUALITY (`sameResource`), rather than testing whether the message merely
  * CONTAINS a candidate's host/path as substrings, is that a substring test
  * cannot tell `api.github.com` from `evil-api.github.com` (host extended on
  * the left) or `api.github.com.evil.test` (extended on the right), nor
@@ -134,59 +162,60 @@ function reportedUrl(error: { name?: string; message: string }): URL | null {
   return null;
 }
 
-/** Index of the tracked failure closest in time to `at` for the same resource, or -1. */
-function nearestIndex(events: TrackedRequestFailure[], reported: URL, at: number): number {
-  let best = -1;
-  let bestGap = Infinity;
-  for (let i = 0; i < events.length; i++) {
-    const e = events[i];
-    const gap = Math.abs(at - e.at);
-    if (gap > CANCELLED_EXCUSE_MS) continue;
-    let url: URL;
-    try {
-      url = new URL(e.url);
-    } catch {
-      continue;
-    }
-    if (url.host !== reported.host || url.pathname !== reported.pathname) continue;
-    // A TIE is never resolved in the excuse's favour: with two candidates the
-    // same distance away, the one that is NOT a cancellation wins, so a stale
-    // cancellation landing in the same millisecond as a genuine failure cannot
-    // excuse it.
-    const better = gap < bestGap || (gap === bestGap && events[best].errorText === 'cancelled' && e.errorText !== 'cancelled');
-    if (best < 0 || better) {
-      best = i;
-      bestGap = gap;
-    }
+/**
+ * Do a tracked request's URL and the one a page error NAMES address the same
+ * resource? Host, path AND QUERY, all three by structural equality.
+ *
+ * THE QUERY IS THE PART THIS USED TO THROW AWAY, and a sealed finding is what
+ * it cost: matching host+path alone makes
+ * `contents/setar/index.json?ref=<commit A>` and `?ref=<commit B>` — two
+ * different requests the app really does make, one after the other — the same
+ * resource, so a cancellation of one stood ready to excuse a genuine failure
+ * of the other. WebKit names the FULL url in the diagnosis, query included
+ * (measured, macOS WebKit: `…/state.json?ref=main&x=1 due to access control
+ * checks.`), so this identity is available and there is no reason to discard
+ * it.
+ *
+ * THE FRAGMENT IS THE ONE PART THAT MUST BE IGNORED, and comparing `href`
+ * would get that wrong: a fragment never reaches the network, so
+ * `request.url()` drops it — while WebKit's message keeps it verbatim
+ * (measured: message `…/state.json#frag`, request url `…/state.json`). Naming
+ * `host`/`pathname`/`search` explicitly is what keeps a later tidy-up to
+ * `href` from silently killing the excuse for every fragment-bearing URL.
+ */
+function sameResource(trackedUrl: string, reported: URL): boolean {
+  let url: URL;
+  try {
+    url = new URL(trackedUrl);
+  } catch {
+    return false;
   }
-  return best;
+  return url.host === reported.host && url.pathname === reported.pathname && url.search === reported.search;
 }
 
 /**
- * The excuse correlates on ORDER, not on a window: among every tracked request
- * to the exact host+path the error names, the one that actually produced it is
- * whichever happened NEAREST IN TIME — because the browser emits the spurious
- * error and the request's own failure in the same tick, so nothing else to
- * that URL can have intervened.
+ * The excuse correlates on IDENTITY plus a VETO, never on proximity.
  *
- * NEAREST IS MEASURED IN BOTH DIRECTIONS, and that is a correction, not a
- * relaxation. This used to look only BACKWARDS, on the stated diagnosis that a
- * `requestfailed` is delivered before the `pageerror` it causes. Measured, the
- * opposite is true and reproducibly so: WebKit delivers the `pageerror` first,
- * about a tenth of a millisecond AHEAD of the `requestfailed` for the same
- * request. A backwards-only search therefore looked at an empty log and
- * excused nothing — the second reason this excuse had never once fired against
- * a real error. The sealed invariant it was written to protect is untouched by
- * the correction: a genuine failure ALWAYS emits its own `requestfailed`
- * adjacent to its own page error, so it is always the nearest candidate, and a
- * stale cancellation sitting milliseconds away can never outrank it.
+ * Among the tracked failures for the exact resource the error names, within
+ * the defensive ceiling:
  *
- * If the nearest candidate is not a cancellation at all — a genuine failure,
- * or nothing within the ceiling — this returns `false` and excuses nothing: an
- * uncertain correlation is never resolved in the excuse's favour.
+ *  - if ANY of them is NOT a cancellation, nothing is excused. A genuine
+ *    access-control failure always emits its own `requestfailed` beside its
+ *    own page error (measured: 74–359µs after it, six times out of six), so
+ *    the presence of genuine evidence for this exact resource means the
+ *    cancellation's ownership of this error is unproven — and an unproven
+ *    correlation is never resolved in the excuse's favour. This is a veto, not
+ *    a ranking: it holds however far away the genuine failure sits, which is
+ *    what the previous "whichever is nearest wins" rule could not do. At
+ *    `Date.now()` granularity a genuine pair straddling a millisecond boundary
+ *    reads as 1ms apart, so an unrelated cancellation in the error's own
+ *    millisecond used to outrank it and excuse a real failure;
+ *  - otherwise the nearest cancellation is CONSUMED, so it cannot excuse a
+ *    second error too. Nearest only chooses WHICH interchangeable cancellation
+ *    to spend here; it no longer decides WHETHER anything may be spent.
  *
- * The match is CONSUMING: the winning entry is removed, so it cannot excuse a
- * second, later error too.
+ * A message that is not the diagnosis at all — a render crash, a thrown
+ * TypeError, whatever URL it happens to name — is never excused.
  */
 export function excusedCancellation(
   events: TrackedRequestFailure[],
@@ -195,9 +224,21 @@ export function excusedCancellation(
 ): boolean {
   const reported = reportedUrl(error);
   if (!reported) return false;
-  const nearest = nearestIndex(events, reported, at);
-  if (nearest < 0 || events[nearest].errorText !== 'cancelled') return false;
-  events.splice(nearest, 1);
+  let best = -1;
+  let bestGap = Infinity;
+  for (let i = 0; i < events.length; i++) {
+    const e = events[i];
+    const gap = Math.abs(at - e.at);
+    if (gap > CANCELLED_EXCUSE_MS) continue;
+    if (!sameResource(e.url, reported)) continue;
+    if (e.errorText !== 'cancelled') return false;
+    if (gap < bestGap) {
+      best = i;
+      bestGap = gap;
+    }
+  }
+  if (best < 0) return false;
+  events.splice(best, 1);
   return true;
 }
 
@@ -219,7 +260,12 @@ export function cancellationEvidence(
 ): string {
   const reported = reportedUrl(error);
   if (!reported) return '';
-  const where = `${reported.host}${reported.pathname}`;
+  const where = `${reported.host}${reported.pathname}${reported.search}`;
+  // DELIBERATELY BROADER THAN THE EXCUSE: same host and path, whatever the
+  // query. A failure to the same path under a DIFFERENT query is exactly what
+  // the excuse must refuse to act on and exactly what the reader of a CI-only
+  // failure needs to see, so each row prints its own full url and says whether
+  // it was the same resource the error named.
   const near = events
     .filter((e) => Math.abs(at - e.at) <= CANCELLED_EXCUSE_MS)
     .filter((e) => {
@@ -230,7 +276,11 @@ export function cancellationEvidence(
         return false;
       }
     })
-    .map((e) => `${e.errorText || '(no errorText)'} at ${e.at >= at ? '+' : ''}${e.at - at}ms`);
+    .map(
+      (e) =>
+        `${e.url} — ${e.errorText || '(no errorText)'} at ${e.at >= at ? '+' : ''}${e.at - at}ms` +
+        `${sameResource(e.url, reported) ? '' : ' (different query — not the resource this error names)'}`,
+    );
   return near.length
     ? `tracked request failures for ${where}: ${near.join('; ')}`
     : `no tracked request failure for ${where} within ${CANCELLED_EXCUSE_MS}ms`;
@@ -246,9 +296,9 @@ export interface PracticeApp {
    * Uncaught page errors, so a broken render cannot pass as a quiet one.
    *
    * RESOLVED ON READ, never as each one arrives: WebKit delivers a page error
-   * about a mid-flight request BEFORE that request's own `requestfailed`, so
-   * deciding at arrival time is deciding against a log that has not been
-   * written yet. Reading this at the end of a journey — which is when a
+   * about a request BEFORE that request's own `requestfailed` (measured:
+   * 74–359µs ahead, six times out of six), so deciding at arrival time is
+   * deciding against a log that has not been written yet. Reading this at the end of a journey — which is when a
    * journey asserts on it — has every event in hand.
    */
   readonly pageErrors: Error[];
@@ -302,9 +352,9 @@ export async function openPracticeApp(options: {
   let page: Page;
   const pending: { error: Error; at: number }[] = [];
   const pageErrors: Error[] = [];
-  // EVERY requestfailed is tracked, cancelled or not — a genuine failure has
-  // to be visible to `excusedCancellation` so it can outrank a stale
-  // cancellation to the same URL, not just a cancellation itself.
+  // EVERY requestfailed is tracked, cancelled or not — genuine evidence for a
+  // resource has to be visible to `excusedCancellation` for its veto to fire,
+  // not just the cancellations.
   const requestFailures: TrackedRequestFailure[] = [];
   try {
     context = await browser.newContext({
@@ -632,7 +682,6 @@ export function publishSourceIndex(remote: FakeRemote, text: string, commit = 's
 export async function installFakeGitHub(page: Page, remote: FakeRemote): Promise<void> {
   let headCounter = 0;
   const blobs = new Map<string, string>();
-
   await page.route('https://api.github.com/**', async (route) => {
     const req = route.request();
     const url = new URL(req.url());
diff --git a/tests/setarInbound.browser.test.ts b/tests/setarInbound.browser.test.ts
index 0a9961f..ed92eba 100644
--- a/tests/setarInbound.browser.test.ts
+++ b/tests/setarInbound.browser.test.ts
@@ -511,9 +511,10 @@ describe('rolling back past the archive schema', () => {
 describe('the journey harness itself', () => {
   // The harness must not be able to hide the very failure a journey exists to
   // catch, and it must not manufacture one either. A request the browser
-  // CANCELLED (because the test navigated away mid-flight) produces a WebKit
-  // error that reads exactly like a CORS failure. Excusing it has now failed
-  // four different ways, and each test below is named for the specific way:
+  // CANCELLED (because the test drove on mid-flight) is the standing
+  // explanation for a WebKit page error that reads exactly like a CORS
+  // failure. Excusing it has now failed five different ways, and each test
+  // below is named for the specific way:
   //  - a PERMANENT set of cancelled URLs discarded every later page error
   //    whose message merely contained that pathname, so a genuine failure at
   //    the same path, later in the same journey, was swallowed and
@@ -522,9 +523,7 @@ describe('the journey harness itself', () => {
   //    generous time window, an unconsumed cancellation — one that produced
   //    no page error of its own — stayed a live "credit" for up to that whole
   //    window, spendable by a genuine, later failure to the same URL that had
-  //    nothing to do with it. A window can never tell the two apart, because
-  //    a cancellation's error and a genuine one read identically; only ORDER
-  //    can (see `excusedCancellation`'s own doc comment in `practiceBrowser.ts`);
+  //    nothing to do with it;
   //  - the excuse read the page error's `message` ALONE, which never contains
   //    the diagnosis: Playwright splits a page error at its first colon — the
   //    URL's own scheme colon — so the wording lives in `name` and only the
@@ -533,10 +532,19 @@ describe('the journey harness itself', () => {
   //  - and the correlation looked only BACKWARDS in time, on the stated
   //    diagnosis that a `requestfailed` precedes the `pageerror` it causes.
   //    Measured, WebKit delivers them the other way round. Against a real
-  //    error the log was still empty when the excuse ran.
-  // Both of the last two were exposed by the same CI run: the journey passed
-  // on one runner and failed on two others at the identical commit, because
-  // the error had simply never been produced locally before.
+  //    error the log was still empty when the excuse ran;
+  //  - and, the finding this block was last reworked for, the correlation
+  //    that replaced the window — "whichever tracked failure sits NEAREST the
+  //    error wins", on host+path — threw away the QUERY, so two different
+  //    requests to one path were one resource, and rested the whole safety
+  //    claim on PROXIMITY, which the measurement below shows cannot carry it:
+  //    a genuine failure's own `requestfailed` lands 74–359µs after its page
+  //    error, which reads as 0ms or 1ms depending on which side of a
+  //    millisecond boundary the pair straddles, so an unrelated cancellation
+  //    in the error's own millisecond outranked it.
+  // The middle two were exposed by the same CI run: the journey passed on one
+  // runner and failed on two others at the identical commit, because the
+  // error had simply never been produced locally before.
   const url = 'https://api.github.com/repos/owner/data/contents/state.json';
 
   /**
@@ -548,18 +556,34 @@ describe('the journey harness itself', () => {
     const u = new URL(target);
     return {
       name: `Fetch API cannot load ${u.protocol.replace(':', '')}`,
-      message: `/${u.host}${u.pathname} due to access control checks.`,
+      message: `/${u.host}${u.pathname}${u.search}${u.hash} due to access control checks.`,
     };
   };
   const spurious = diagnosed();
   const at = 1_000_000;
-  const cancelled = (offset = 0): TrackedRequestFailure => ({ url, at: at + offset, errorText: 'cancelled' });
-  const genuine = (offset = 0): TrackedRequestFailure => ({
-    url,
+  const cancelled = (offset = 0, target = url): TrackedRequestFailure => ({
+    url: target,
+    at: at + offset,
+    errorText: 'cancelled',
+  });
+  const genuine = (offset = 0, target = url): TrackedRequestFailure => ({
+    url: target,
     at: at + offset,
     errorText: 'Origin http://localhost:5173 is not allowed by Access-Control-Allow-Origin. Status code: 200',
   });
 
+  /**
+   * Raise the diagnosis as a REAL uncaught page error, through the app's own
+   * page. A top-level `throw` in an injected script, NOT a timer callback:
+   * every journey installs `page.clock`, so a `setTimeout` here never fires at
+   * all and the error would never be delivered.
+   */
+  const raiseDiagnosis = async (app: { page: import('playwright').Page }, target: string): Promise<void> => {
+    await app.page.addScriptTag({
+      content: `throw new Error(${JSON.stringify(`Fetch API cannot load ${target} due to access control checks.`)});`,
+    });
+  };
+
   it('reads the diagnosis as Playwright actually splits it, in both WebKit spellings', () => {
     // THE EXACT PAIR THE FAILING CI RUN REPORTED, verbatim.
     const fromCI = {
@@ -593,10 +617,54 @@ describe('the journey harness itself', () => {
     ).toBe(false);
   });
 
+  it('tells two requests to one path apart by their query, in both directions', () => {
+    // THE SEALED FINDING THIS BLOCK WAS REWORKED FOR. Host+path alone makes
+    // these one resource; they are two requests the app really does make, one
+    // after the other, when it reads the published index at two commits.
+    const refA = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-a';
+    const refB = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-b';
+
+    // A cancellation of ONE never excuses the diagnosis naming the OTHER —
+    // and the cancellation is left intact, not spent on something it does not
+    // account for.
+    const other = [cancelled(0, refA)];
+    expect(excusedCancellation(other, diagnosed(refB), at + 1)).toBe(false);
+    expect(other).toHaveLength(1);
+
+    // A query-less request is not the same resource as a query-bearing one,
+    // either way round.
+    const bare = 'https://api.github.com/repos/owner/data/contents/setar/index.json';
+    expect(excusedCancellation([cancelled(0, bare)], diagnosed(refA), at + 1)).toBe(false);
+    expect(excusedCancellation([cancelled(0, refA)], diagnosed(bare), at + 1)).toBe(false);
+    // Differing only in a query VALUE is enough; so is a differing key.
+    expect(
+      excusedCancellation([cancelled(0, `${bare}?ref=commit-a&page=2`)], diagnosed(refA), at + 1),
+    ).toBe(false);
+
+    // And the matching one still works, so this is identity, not blanket refusal.
+    const own = [cancelled(0, refA)];
+    expect(excusedCancellation(own, diagnosed(refA), at + 1)).toBe(true);
+    expect(own).toEqual([]);
+  });
+
+  it('ignores the fragment, which the message carries and the request never does', () => {
+    // MEASURED, macOS WebKit: the page error names `…/state.json#frag` while
+    // `request.url()` for the very same request reports `…/state.json` — a
+    // fragment is never sent. Comparing `href` would therefore break the
+    // excuse for every fragment-bearing URL; comparing host/path/search does
+    // not. (The app itself never fetches a fragment; this is what keeps a
+    // later tidy-up to `href` from silently killing the excuse.)
+    const own = [cancelled(0, url)];
+    expect(excusedCancellation(own, diagnosed(`${url}#frag`), at + 1)).toBe(true);
+    expect(own).toEqual([]);
+    // And the fragment does not smuggle a query past the check either.
+    expect(excusedCancellation([cancelled(0, url)], diagnosed(`${url}?ref=a#frag`), at + 1)).toBe(false);
+  });
+
   it('excuses a cancellation whose page error arrives BEFORE the requestfailed that explains it', () => {
-    // THE MEASURED ORDER: WebKit delivers the page error about a tenth of a
-    // millisecond ahead of the request's own failure. A backwards-only search
-    // saw an empty log here and excused nothing.
+    // THE MEASURED ORDER: WebKit delivers the page error 74–359µs ahead of the
+    // request's own failure. A backwards-only search saw an empty log here and
+    // excused nothing.
     const later = [cancelled(1)];
     expect(excusedCancellation(later, spurious, at)).toBe(true);
     expect(later).toEqual([]);
@@ -624,50 +692,76 @@ describe('the journey harness itself', () => {
     expect(excusedCancellation(twice, spurious, at + 40)).toBe(false);
   });
 
-  it('a cancellation that produced no page error of its own never excuses a later, genuine failure to the same URL', () => {
-    // This is the sealed finding: the cancellation happens and nothing ever
-    // reports its own page error for it — exactly the case the harness must
-    // tolerate without turning it into a standing credit for something else.
-    const events = [cancelled()];
-    // A genuine failure to the SAME url follows moments later, and IS
-    // tracked — this is what makes it outrank the stale cancellation next.
-    events.push(genuine(50));
+  it('genuine evidence for a resource vetoes the excuse for it, at any distance', () => {
+    // THE SAFETY CLAIM, and it is a VETO rather than a ranking on purpose. A
+    // genuine access-control failure always emits its own `requestfailed`
+    // beside its own page error, so genuine evidence for this exact resource
+    // means the cancellation's ownership of this error is unproven — and an
+    // unproven correlation is never resolved in the excuse's favour.
+    const events = [cancelled(), genuine(50)];
     expect(excusedCancellation(events, spurious, at + 60)).toBe(false);
-    // The stale cancellation is untouched: it lost to the more recent
-    // genuine failure, it was never spent.
+    // The stale cancellation is untouched: it was refused, never spent.
     expect(events).toContainEqual(cancelled());
+
+    // DISTANCE CANNOT BUY THE EXCUSE BACK. This is what the previous
+    // nearest-wins rule could not hold: at `Date.now()` granularity a genuine
+    // pair straddling a millisecond boundary reads as 1ms apart, so a
+    // cancellation in the error's own millisecond outranked it by 1ms and
+    // excused a real failure. Here the cancellation is as near as a tracked
+    // event can be and the genuine failure is as far as the ceiling allows.
+    const nearCancel = [cancelled(0), genuine(CANCELLED_EXCUSE_MS)];
+    expect(excusedCancellation(nearCancel, spurious, at)).toBe(false);
+    expect(nearCancel).toHaveLength(2);
+
+    // The measured shape of a real pair, exactly: page error first, its own
+    // failure 1ms later, an unrelated cancellation in the same millisecond.
+    const measured = [cancelled(0), genuine(1)];
+    expect(excusedCancellation(measured, spurious, at)).toBe(false);
+
+    // A TIE is refused for the same reason.
+    expect(excusedCancellation([cancelled(), genuine()], spurious, at)).toBe(false);
   });
 
-  it("a genuine failure reported AFTER its own page error still outranks a stale cancellation", () => {
-    // The sealed finding above, re-proved under the order the browser
-    // actually uses: the genuine failure's `requestfailed` lands a fraction
-    // of a millisecond AFTER the page error it belongs to, while a stale
-    // cancellation sits well before it. Nearest-in-either-direction is what
-    // keeps the genuine one the winner; a backwards-only search would reach
-    // the cancellation and excuse a real failure.
-    const events = [cancelled(-40), genuine(1)];
-    expect(excusedCancellation(events, spurious, at)).toBe(false);
-    expect(events).toContainEqual(cancelled(-40));
-
-    // And a TIE is never resolved in the excuse's favour either.
-    const tied = [cancelled(), genuine()];
-    expect(excusedCancellation(tied, spurious, at)).toBe(false);
+  it('a veto is scoped to the resource, so an unrelated failure never blocks a real excuse', () => {
+    // The veto must not become blanket suppression of the excuse: a genuine
+    // failure to a DIFFERENT resource — including the same path under another
+    // query — says nothing about this error.
+    const elsewhere = [
+      genuine(0, 'https://api.github.com/repos/owner/data/contents/manifest.json'),
+      genuine(0, `${url}?ref=main`),
+      genuine(0, 'https://api.example.com/repos/owner/data/contents/state.json'),
+      cancelled(1),
+    ];
+    expect(excusedCancellation(elsewhere, spurious, at)).toBe(true);
+    // Only the cancellation was consumed; the genuine rows are still tracked.
+    expect(elsewhere).toHaveLength(3);
+    expect(elsewhere.every((e) => e.errorText !== 'cancelled')).toBe(true);
+
+    // And a genuine failure to this resource OUTSIDE the ceiling is not
+    // evidence about this error at all — the ceiling bounds the veto exactly
+    // as it bounds the excuse.
+    const distant = [genuine(-CANCELLED_EXCUSE_MS - 1), cancelled(1)];
+    expect(excusedCancellation(distant, spurious, at)).toBe(true);
   });
 
-  it('a genuine failure is never excused, whether it precedes or follows a cancellation to the same URL', () => {
+  it('a genuine failure is never excused, before or after a cancellation to the same URL', () => {
     // Genuine failure arrives FIRST, with no cancellation recorded at all.
     const events = [genuine()];
     expect(excusedCancellation(events, spurious, at + 5)).toBe(false);
 
-    // A real cancellation follows and correctly excuses its OWN error.
+    // A cancellation follows — and under the VETO it still excuses nothing
+    // while that genuine failure is in the window. This assertion used to
+    // read `true`, on the nearest-wins rule: the cancellation was 10ms away
+    // and the genuine failure 110ms, so the nearer one won and a real failure
+    // to that exact resource was excused. Genuine evidence for a resource now
+    // forbids the excuse for it outright.
     events.push(cancelled(100));
-    expect(excusedCancellation(events, spurious, at + 110)).toBe(true);
+    expect(excusedCancellation(events, spurious, at + 110)).toBe(false);
 
-    // Another genuine failure follows the (now-consumed) cancellation and is
-    // never excused by it either — there is nothing left pending to excuse
-    // it with, and it would not have qualified anyway.
-    events.push(genuine(200));
-    expect(excusedCancellation(events, spurious, at + 210)).toBe(false);
+    // Once the genuine failure is old enough to be out of the window, the
+    // cancellation excuses its own error normally — the veto expires with the
+    // evidence, it is not a permanent mark against the URL.
+    expect(excusedCancellation(events, spurious, at + CANCELLED_EXCUSE_MS + 1)).toBe(true);
   });
 
   it('the excuse never matches a host or path that merely shares characters with the cancelled one', () => {
@@ -694,19 +788,20 @@ describe('the journey harness itself', () => {
     expect(excusedCancellation([cancelled(CANCELLED_EXCUSE_MS + 1)], spurious, at)).toBe(false);
   });
 
-  it('parses the diagnosis a REAL WebKit produces, and still reports it when nothing excuses it', async () => {
-    // The two defects above were both about a representation and an ORDER
-    // nobody had ever measured — the strings these tests asserted on were
-    // hand-written, and the CI run that finally produced the real thing is what
-    // exposed them. This drives an actual WebKit and reads the actual error
-    // object, so the shape can never drift back to a reconstruction.
+  it('measures what a REAL WebKit reports, and holds the rule to it', async () => {
+    // Every string and every ORDER in the tests above was once a hand-written
+    // reconstruction, and the CI run that finally produced the real thing is
+    // what exposed two of them. This drives an actual WebKit and reads actual
+    // event objects, so the shape, the query, the fragment and the ordering
+    // can never drift back to a reconstruction.
     //
     // A reply from a REAL server with no CORS headers is what makes WebKit emit
     // this diagnosis; a Playwright-fulfilled response does not go through the
     // same check, which is why the fake GitHub repo above never produces one.
     const blocked = createServer((req, res) => {
       // `?slow` never answers in time, so a reload CANCELS it — the other
-      // half of this test needs a real cancellation to the same resource.
+      // half of this test needs a REAL cancellation, with the browser's own
+      // url, errorText and arrival time.
       const reply = () => {
         res.writeHead(200, { 'content-type': 'application/json' });
         res.end('{}');
@@ -719,25 +814,56 @@ describe('the journey harness itself', () => {
     const target = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/README.md`;
     const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
     try {
-      const raw: Error[] = [];
-      app.page.on('pageerror', (e) => raw.push(e));
-      await app.page.evaluate((u) => void fetch(u).catch(() => {}), target);
-      await expect.poll(() => raw.length, { timeout: 20_000 }).toBeGreaterThan(0);
+      // BOTH streams, in arrival order, with arrival times — so the ordering
+      // this rule was corrected for is measured here rather than asserted
+      // from memory.
+      const seen: ({ kind: 'error'; error: Error; at: number } | ({ kind: 'failed'; at: number } & TrackedRequestFailure))[] = [];
+      app.page.on('pageerror', (e) => seen.push({ kind: 'error', error: e, at: Date.now() }));
+      app.page.on('requestfailed', (r) =>
+        seen.push({ kind: 'failed', at: Date.now(), url: r.url(), errorText: r.failure()?.errorText ?? '' }),
+      );
+
+      // A genuine access-control failure, with a QUERY and a FRAGMENT, so the
+      // message's treatment of both is measured rather than assumed.
+      await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?ref=main#frag`);
+      await expect.poll(() => seen.filter((e) => e.kind === 'failed').length, { timeout: 20_000 }).toBeGreaterThan(0);
+
+      const real = seen.find((e) => e.kind === 'error');
+      const realFailure = seen.find((e) => e.kind === 'failed');
+      if (real?.kind !== 'error' || realFailure?.kind !== 'failed') throw new Error('WebKit reported no pair to measure.');
 
-      const real = raw[0];
       // THE REPRESENTATION, as the browser and Playwright actually deliver it:
       // the wording is in `name`, only the tail is in `message`. This is the
       // identical split the failing CI run reported.
-      expect(real.name).toBe('Fetch API cannot load http');
-      expect(real.message).toBe(`/127.0.0.1:${port}/repos/owner/practice-data/contents/README.md due to access control checks.`);
-      // Given a cancellation for that request, THIS object is excusable — the
-      // whole point, and what matching `message` alone could never do.
-      expect(excusedCancellation([{ url: target, at: Date.now(), errorText: 'cancelled' }], real, Date.now())).toBe(
-        true,
+      expect(real.error.name).toBe('Fetch API cannot load http');
+      // The QUERY is in the message — which is the identity the excuse used to
+      // throw away — and so is the FRAGMENT, which the request itself drops.
+      expect(real.error.message).toBe(
+        `/127.0.0.1:${port}/repos/owner/practice-data/contents/README.md?ref=main#frag due to access control checks.`,
       );
+      expect(realFailure.url).toBe(`${target}?ref=main`);
+      expect(realFailure.errorText).toContain('Access-Control-Allow-Origin');
+
+      // THE OBSERVED ORDERING, measured rather than stated: the page error is
+      // delivered first, and its own request failure lands beside it, well
+      // inside the defensive ceiling. (Sub-millisecond, hence a gap of 0 or 1
+      // at this clock's granularity — which is exactly why proximity cannot
+      // be what separates a genuine failure from a cancellation.)
+      expect(seen.indexOf(real)).toBeLessThan(seen.indexOf(realFailure));
+      expect(realFailure.at - real.at).toBeLessThanOrEqual(CANCELLED_EXCUSE_MS);
+
+      // THE VETO, PROVED ON REAL EVENTS: this genuine failure is not excused,
+      // not even by a cancellation to the very same resource sitting in the
+      // error's own millisecond — the case a nearest-wins rule got wrong.
+      const log: TrackedRequestFailure[] = [
+        { url: realFailure.url, at: realFailure.at, errorText: realFailure.errorText },
+        { url: realFailure.url, at: real.at, errorText: 'cancelled' },
+      ];
+      expect(excusedCancellation(log, real.error, real.at)).toBe(false);
+      expect(log).toHaveLength(2);
 
-      // But nothing cancelled it here, so the harness KEEPS it — and says what
-      // the browser reported instead of leaving a bare CORS-shaped message.
+      // And the harness KEEPS it — saying what the browser reported instead of
+      // leaving a bare CORS-shaped message.
       const kept = app.pageErrors;
       expect(kept).toHaveLength(1);
       expect(kept[0].message).toContain('due to access control checks');
@@ -745,12 +871,31 @@ describe('the journey harness itself', () => {
       // Reading twice reports the same list, not a growing one.
       expect(app.pageErrors).toHaveLength(1);
 
-      // AND A JUDGEMENT IS MADE ONCE. A genuine refusal already reported
-      // cannot be taken back by a cancellation to the same resource that
-      // happens afterwards — here a real one, produced by reloading while a
-      // request to that same path is still in flight.
+      // A REAL CANCELLATION, from a request genuinely in flight across a
+      // reload — the browser's own url, errorText and arrival time.
       await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?slow=1`);
       await reload(app);
+      await expect
+        .poll(() => seen.some((e) => e.kind === 'failed' && e.errorText === 'cancelled'), { timeout: 20_000 })
+        .toBe(true);
+      const realCancel = seen.find((e) => e.kind === 'failed' && e.errorText === 'cancelled');
+      if (realCancel?.kind !== 'failed') throw new Error('WebKit reported no cancellation to measure.');
+      expect(realCancel.url).toBe(`${target}?slow=1`);
+
+      // IT EXCUSES ITS OWN RESOURCE AND NOTHING ELSE. No pairing of a
+      // cancellation with this page error has ever been OBSERVED — five
+      // cancellation shapes were driven through a real WebKit and each
+      // produced a `requestfailed` and no page error at all — so the
+      // diagnosis here is written against the url the browser really
+      // cancelled, rather than pretending to a pairing nothing has seen.
+      const cancelLog = () => [{ url: realCancel.url, at: realCancel.at, errorText: realCancel.errorText }];
+      expect(excusedCancellation(cancelLog(), diagnosed(realCancel.url), realCancel.at)).toBe(true);
+      // The same path WITHOUT that query is a different request instance, and
+      // this real cancellation says nothing about it.
+      expect(excusedCancellation(cancelLog(), diagnosed(target), realCancel.at)).toBe(false);
+
+      // AND A JUDGEMENT IS MADE ONCE: the genuine refusal already reported is
+      // not taken back by this real cancellation to the same host and path.
       expect(app.pageErrors).toHaveLength(1);
     } finally {
       await app.close();
@@ -758,6 +903,58 @@ describe('the journey harness itself', () => {
     }
   }, 120_000);
 
+  it('the wiring really excuses — a diagnosed error for a genuinely cancelled request never reaches pageErrors', async () => {
+    // THE EXCUSE HAS NOW BEEN DEAD CODE TWICE, and both times only CI could
+    // tell. This drives the harness END TO END: a request the browser really
+    // cancels, and a real `pageerror` delivered through the real listener,
+    // carrying the diagnosis for that exact url. `pageErrors` must stay empty
+    // — and must not, if the error names a neighbouring request instead.
+    //
+    // The error TEXT is raised in the page rather than waited for, because no
+    // cancellation shape driven through a real WebKit has ever produced one
+    // (see `TrackedRequestFailure`'s comment). Everything else here is real:
+    // the cancellation, the event objects, the listeners and the resolve path.
+    const stalled = createServer((_req, res) => {
+      setTimeout(() => {
+        res.writeHead(200, { 'content-type': 'application/json' });
+        res.end('{}');
+      }, 30_000).unref();
+    });
+    await new Promise<void>((done) => stalled.listen(0, '127.0.0.1', done));
+    const port = (stalled.address() as AddressInfo).port;
+    const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
+    try {
+      const cancellations: string[] = [];
+      app.page.on('requestfailed', (r) => {
+        if (r.failure()?.errorText === 'cancelled') cancellations.push(r.url());
+      });
+      const inFlight = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/state.json?ref=main`;
+      await app.page.evaluate((u) => void fetch(u).catch(() => {}), inFlight);
+      await reload(app);
+      await expect.poll(() => cancellations.includes(inFlight), { timeout: 20_000 }).toBe(true);
+      expect(app.pageErrors).toEqual([]);
+
+      // The diagnosis for a DIFFERENT request to the same path is kept: one
+      // cancellation excuses one resource, never a neighbour.
+      const neighbour = `${inFlight.split('?')[0]}?ref=other`;
+      await raiseDiagnosis(app, neighbour);
+      await expect.poll(() => app.pageErrors.length, { timeout: 20_000 }).toBe(1);
+      expect(app.pageErrors[0].message).toContain('?ref=other');
+      // ...and the evidence names what the harness actually saw, including the
+      // same-path cancellation it refused to spend.
+      expect(app.pageErrors[0].message).toContain('different query');
+
+      // The diagnosis for the request that WAS cancelled is excused, so the
+      // list does not grow — the wiring, not just the rule.
+      await raiseDiagnosis(app, inFlight);
+      await app.page.waitForTimeout(500);
+      expect(app.pageErrors).toHaveLength(1);
+    } finally {
+      await app.close();
+      await new Promise<void>((done) => stalled.close(() => done()));
+    }
+  }, 120_000);
+
   it('a page error it refuses to excuse says what the browser actually reported', () => {
     // The CI failure this whole rework came from was one bare CORS-shaped
     // message with nothing to distinguish a cancellation from a real refusal.
@@ -768,6 +965,16 @@ describe('the journey harness itself', () => {
     expect(withGenuine).toContain('Access-Control-Allow-Origin');
     expect(withGenuine).toContain('+1ms');
 
+    // DELIBERATELY BROADER THAN THE EXCUSE: a failure to the same path under a
+    // different query is exactly what the excuse must refuse to act on, and
+    // exactly what the reader of a CI-only failure needs to see. It is named
+    // as the different request it is.
+    const nearMiss = cancellationEvidence([cancelled(0, `${url}?ref=main`)], spurious, at);
+    expect(nearMiss).toContain('?ref=main');
+    expect(nearMiss).toContain('different query');
+    // The resource the error actually names is not labelled that way.
+    expect(cancellationEvidence([cancelled()], spurious, at)).not.toContain('different query');
+
     // NOTHING tracked at all is itself the evidence — it says so rather than
     // saying nothing.
     expect(cancellationEvidence([], spurious, at)).toMatch(/no tracked request failure/);
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

**A WINDOW CAN NEVER TELL A CANCELLATION FROM A REAL FAILURE, BECAUSE THEY READ IDENTICALLY.** Made consuming and bounded by a generous ceiling, the excuse still matched by
host+path ALONE: a cancellation that produced no page error of its own stayed a live,
unconsumed credit for the whole ceiling, spendable by ANY later error to that URL — including
a genuine one with nothing to do with it. A sealed review reproduced exactly that. Shrinking
the window cannot fix this; it only trades an over-broad filter for a flakier one, since a
cancellation's spurious error and a real access-control failure are worded the same on
purpose. `excusedCancellation` tracks EVERY `requestfailed`, not only cancelled ones, so
genuine evidence is visible to it. `CANCELLED_EXCUSE_MS` (2s, down from 30s) is purely
DEFENSIVE headroom against delivery lag under the contention five concurrent dev servers
create, never the correlation itself.

A second, independent hole lived in the same function: `message.includes(url.host)` and
`message.includes(url.pathname)` are substring tests, so a host that merely CONTAINS the real
one (`evil-api.github.com`, `api.github.com.evil.test`) or a path that does
(`state.json.bak`) passed them. The message is parsed into a real `URL` and compared part by
part by EQUALITY instead (`sameResource`) — removing the ambiguity structurally rather than
adding more boundary characters to a string test.

**AND THE WHOLE EXCUSE WAS DEAD CODE UNTIL A CI RUN PRODUCED THE ERROR IT WAS WRITTEN FOR.**
Every string above was a hand-written reconstruction; nothing had ever been measured. The same
commit passed one CI run and failed two others on `expect(app.pageErrors).toEqual([])`, and
measuring — Playwright's own WebKit locally, identical to what the failing run reported — found
two facts the harness had backwards, either of which alone made the excuse unable to fire:

- **THE DIAGNOSIS ARRIVES IN TWO HALVES.** Playwright splits every page error at its FIRST
  colon and drops one character after it (`splitErrorMessage`). The first colon here is the
  URL's own scheme colon, so the wording lands in `name` (`Fetch API cannot load https`) and
  only the tail in `message` (`/api.github.com/… due to access control checks.`). Matching
  `message` alone — which is what it did — can never succeed. The rule REJOINS the two halves
  with the dropped `:/` and also tries the unsplit form, both through one anchored regex, so a
  wrong reconstruction fails to match rather than matching loosely. The whitespace the old
  regex tolerated "between the scheme and the host" is fiction: no browser emits it, and the
  apparent space was an artefact of that same split.
- **THE PAGE ERROR COMES FIRST.** WebKit delivers the `pageerror` 74–359µs BEFORE the
  `requestfailed` for the same request — six times out of six, macOS WebKit. A backwards-only
  search read an empty log. Tracked failures are searched in BOTH directions now.

So a page error is RECORDED as it arrives and JUDGED when `pageErrors` is READ — every journey
reads it after awaited page work, which round-trips the ordered transport and so has both
events in hand. A judgement is made ONCE: a cancellation arriving afterwards never takes back
an error already reported. And an UNEXCUSED diagnosis now carries the browser's own `errorText`
for every tracked request to that resource and how far each sat from it
(`cancellationEvidence`), because one bare CORS-shaped message with nothing to distinguish a
cancellation from a real refusal is exactly what made this failure unreadable. That evidence is
deliberately BROADER than the excuse — same host and path, whatever the query, each row printing
its own full url and saying whether it is the resource the error named — because a failure to
the same path under a different query is exactly what the excuse must refuse to act on and
exactly what the next CI-only failure needs to show.

**AND PROXIMITY CANNOT CARRY A SAFETY CLAIM EITHER, AT ANY RESOLUTION — THE MEASUREMENT THAT
CORRECTED THE ORDER IS THE SAME ONE THAT KILLS THE RULE IT WAS PART OF.** Nearest-wins rested on
"a genuine failure's own `requestfailed` is always ADJACENT to its own page error, so it always
outranks a stale cancellation". Adjacent it is — 74–359µs — which at `Date.now()` granularity
reads as a gap of 0ms or 1ms depending on which side of a millisecond boundary the pair
straddles. An unrelated cancellation landing in the error's OWN millisecond therefore outranks a
genuine failure 359µs away and excuses it, and a tie-break only covers the case where the two
land in the same millisecond. Sub-millisecond timestamps move that boundary rather than removing
it. TWO changes replace it, and neither is a window:

- **IDENTITY IS THE FULL URL — HOST, PATH AND QUERY** (`sameResource`). Host+path alone makes
  `contents/setar/index.json?ref=<commit A>` and `?ref=<commit B>` one resource, and those are
  two requests the app really makes one after the other, so a cancellation of one stood ready to
  excuse a genuine failure of the other. WebKit names the FULL url in the diagnosis, query
  included (measured), so that identity was available and simply thrown away. The FRAGMENT is
  the one part that must be ignored, and comparing `href` would get it wrong: the message keeps
  a fragment verbatim while `request.url()` never carries one, because a fragment is not sent.
- **GENUINE EVIDENCE VETOES THE EXCUSE FOR THAT RESOURCE, AT ANY DISTANCE.** If any tracked
  failure for the exact url is NOT a cancellation, nothing is excused — however far away it
  sits, and whatever sits nearer. A genuine access-control failure always emits its own
  `requestfailed`, so genuine evidence for this resource means the cancellation's ownership of
  this error is unproven, and an unproven correlation is never resolved in the excuse's favour.
  Nearest now only chooses WHICH interchangeable cancellation to consume, never WHETHER one may
  be. The veto is scoped: a genuine failure to another resource, or to the same path under
  another query, blocks nothing — and it expires with the ceiling, so it is not a permanent mark
  against a url.

**AND THE PAIRING THE EXCUSE EXISTS FOR HAS NEVER BEEN OBSERVED — WHICH IS WHY IT DEMANDS THE
STRONGEST ASSOCIATION THE PLATFORM OFFERS.** This file used to state as fact that WebKit reports
a cancelled fetch as "Fetch API cannot load … due to access control checks". Measured, five
cancellation shapes — navigating away mid-flight, reloading mid-flight, `AbortController`, a
same-tick `location.href`, a cancelled CORS preflight — each produced a `requestfailed` with
`errorText: 'cancelled'` and NO page error at all, while a reply genuinely lacking CORS headers
produces exactly that page error. A raced `route.fulfill` therefore remains a live alternative
explanation for the CI failure, and cannot be settled from here. A cancellation being merely
NEARBY is not evidence of anything, and the rule above is written accordingly. Playwright offers
nothing stronger to correlate on: a `pageerror` hands a test an `Error` and no request identity,
so url text and order are the whole of what exists.

The regression tests assert the measured pair verbatim, the measured ordering, the query and the
fragment; that a same-path-different-query cancellation excuses nothing; that genuine evidence
vetoes at any distance; and — driving a REAL WebKit and feeding its REAL error and REAL cancelled
request back through the rule — that the shape can never drift back to a reconstruction. One
drives the whole WIRING end to end, a genuinely cancelled request and a real uncaught page error
naming it, because this excuse has been dead code twice and both times only CI could tell.

**AND THE FAILURE CI ACTUALLY PRODUCES IS NOT THIS ONE, WHICH IS A SEPARATE, OPEN DEFECT.**
Instrumenting `setarArchive.browser.test.ts` through a real WebKit until it failed — reproduced
in 2 of 6 sequential runs and 1 of 3 concurrent ones — shows the CORS-shaped page error for
`contents/README.md` arriving with NO `request`, NO route hit and NO `requestfailed` — the fetch
is refused before WebKit's network layer ever sees it, because the document is being torn down by
the journey's own `page.goto` while the app's sync bootstrap PUT is being issued. IT IS NOT FIXED
BY THE RULE ABOVE and was failing before any of it: four consecutive green runs afterwards are
not evidence of a fix, because nothing in that change touches this cause. There
is therefore NOTHING to correlate, and no correlation rule — the old one or this one — can
excuse it. The remaining fix is to remove the RACE, never to widen the excuse: excusing every
access-control diagnosis for a faked origin would suppress a whole error class at an entire
origin on no per-event evidence at all, which is broader than the rule the sealed finding
rejected. The amplifier is measured too: `installFakeGitHub` answers `PATCH git/refs/heads/main`
without recording what the app pushed, so `git/ref/heads/main` 404s for ever and EVERY sync
re-bootstraps the repo with another `PUT contents/README.md` — measured at one every one to
three seconds for the whole journey, each one a chance to be caught by a navigation. What
re-triggers a sync that often was NOT established (`page.clock` is installed, so what the app's
own 30-second quiet-period timer does under it is unknown) and is deliberately not guessed at
here. Making the fake remember the
push was built and REVERTED: it changes what `decideSync` sees, and `setarInbound`'s pull
journey — which publishes a remote snapshot after the app's own push — then reads "Already in
sync" instead of pulling. That is a lane of its own, with its own journeys to re-prove; it is
recorded here rather than left to be rediscovered from a red CI run.

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

**THE MEDIA BASE IS THE ARCHIVE ROOT, NOT THE MEDIA ROOT ABOVE IT.** This is the one setting
a device carries from before the archive existed, and this lane silently changed what it
must contain: legacy references were written relative to the NAS media root and began
`setar-classes/`; every reference the app writes now is relative to the ARCHIVE root and
begins `session-…`. `resolveRecording` APPENDS to the base and preserves its whole path
prefix (`/media/`, `/archives/v2/` — ac-14's own test), so it is correct either way and a
base one folder too high is not a resolver defect: it is a URL that addresses nothing.
Settings names the archive folder, shows it in the placeholder, and no longer promises that
the base can be changed freely — for a device configured before this lane, correcting it
once is required. There is deliberately NO second archive-specific base and no resolver
fallback: one base per device, ending in the archive folder, is what ac-14 and ac-20 state.

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
references are retained historical links, unflagged — and RETAINED IS NOT THE SAME CLAIM AS
LEFT IN THE OLD NAMESPACE.

**A REFRESH LEAVES AN ARCHIVE-OWNED LESSON IN ONE NAMESPACE, OR THE OWNER'S OWN FILES DIE
WHEN THE BASE IS CORRECTED.** The device media base is the archive ROOT (below), so every
stored path is archive-relative and the legacy `setar-classes/` folder segment is not part
of it. `repairReferencePath` stripped that segment only on the way to a path the index
DESCRIBES and then threw the stripped form away for a `not-described` one — so a refresh
left the described rows archive-relative and the undescribed rows legacy-prefixed, on the
same class. OWNER testing found the consequence: with the base still naming the media root
above the archive, a class recording resolved to `…:5010/session-39-…/…` and opened nothing;
correcting the base to `…:5010/setar-classes/` fixed every described row and would have
killed exactly the rows a refresh never reports — the owner's own practice takes, at
`…/setar-classes/setar-classes/…`. Saying a path in the current namespace is NOT a claim
that the file exists (no `attention` row is raised, `not-described` still says nothing), and
it is IDEMPOTENT: only a path whose text actually changes is written, so a second refresh
writes nothing and cannot bump the revision (asserted at the PLAN level, where the rule is
stated, not only on the helper). ORDER MATTERS ONCE PER DEVICE: under the old base a legacy
path still opens, so correcting the base BEFORE refreshing avoids a transient in which those
files have moved namespace and the base has not. A legacy-prefixed reference on a lesson the
archive does NOT own is still never rewritten — that rule stands — so such a reference stays
in the old namespace and is the one known gap; it is the owner's to repoint, not a
refresh's to guess at.

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

/**
 * ONE recorded outcome of a network request the harness watched, whatever the
 * browser's own words for it were. Tracking EVERY failure — not only
 * cancellations — is what lets genuine evidence for a resource VETO the excuse
 * for that resource (see `excusedCancellation`).
 *
 * WHY THERE IS AN EXCUSE AT ALL, and exactly how far the evidence for it goes.
 * A CI run produced `Fetch API cannot load https://api.github.com/repos/owner/
 * practice-data/contents/README.md due to access control checks.` on two of
 * three runners at a commit that passed on the third — a WebKit-only,
 * CORS-shaped page error, while every other run fulfils that same request with
 * the right CORS headers. A request the browser CANCELS because the test drove
 * on while it was in flight is the standing explanation, and a real person
 * navigating mid-sync cancels the same request, so failing a journey for it
 * would be failing it for being driven quickly.
 *
 * That explanation is NOT measured, and this comment used to state it as fact.
 * Driving a real WebKit here, five different cancellation shapes — navigating
 * away mid-flight, reloading mid-flight, `AbortController`, a same-tick
 * `location.href`, a cancelled CORS preflight — each produced a
 * `requestfailed` with `errorText: 'cancelled'` and NO page error whatsoever.
 * A reply that genuinely lacks CORS headers does produce exactly this page
 * error, so a raced `route.fulfill` remains a live alternative explanation
 * that cannot be settled from here.
 *
 * Which is precisely why the excuse below demands the strongest association
 * the platform makes available and refuses on anything weaker: the pairing it
 * exists for has never been observed, so it may never be INFERRED from a
 * cancellation merely being nearby.
 *
 * `errorText` is kept verbatim rather than reduced to a boolean, because it is
 * the EVIDENCE a refused excuse reports (`cancellationEvidence`): when a
 * diagnosed page error is not excused, the failure has to say what the browser
 * actually said about that request, or the next CI-only failure is as
 * unreadable as the one this fix came from.
 */
export interface TrackedRequestFailure {
  url: string;
  /** Node's clock. `page.clock` is installed and frozen; this is not page time. */
  at: number;
  /** The browser's own words. `'cancelled'` is the one — and only — excusable one. */
  errorText: string;
}

/**
 * A generous but purely DEFENSIVE ceiling — it does not do the safety work.
 * It once was the whole bound: a cancelled URL's entry stayed eligible for
 * this long, matched by host+path ALONE, so an unconsumed cancellation that
 * never produced its own page error remained a live "credit" any LATER,
 * genuine access-control failure to that same URL could spend. That is a
 * sealed finding, not a hypothetical: a cancellation and a real failure are
 * indistinguishable by wording, so a window — however short — can never be
 * the thing that tells them apart.
 *
 * NOR CAN PROXIMITY, AT ANY RESOLUTION. Replacing the window with "whichever
 * tracked failure sits NEAREST the error wins" was the previous attempt, and
 * measuring it is what killed it: a genuine access-control failure emits its
 * own `requestfailed` 74–359µs after its page error (six of six, macOS WebKit),
 * which reads as a gap of 0ms or 1ms at `Date.now()` granularity depending on
 * which side of a millisecond boundary the pair straddles. An unrelated
 * cancellation to the same resource landing in the error's own millisecond
 * therefore OUTRANKS a genuine failure 359µs away, and excuses it. Sub-
 * millisecond timestamps would only move that boundary, not remove it.
 *
 * What separates them is `excusedCancellation`'s VETO — genuine evidence for
 * the same resource forbids the excuse outright, however far away it sits —
 * and the full-URL identity `sameResource` insists on. All this ceiling does
 * is bound how far apart two events may be and still be considered one
 * outcome at all, in case Node's delivery is delayed under the contention
 * several concurrent dev servers create.
 */
export const CANCELLED_EXCUSE_MS = 2_000;

/**
 * WebKit's one diagnosis, in the two spellings it uses (a `fetch` and an
 * `XMLHttpRequest`), anchored end to end.
 *
 * The whole point of parsing into a real `URL` and comparing its parts by
 * EQUALITY (`sameResource`), rather than testing whether the message merely
 * CONTAINS a candidate's host/path as substrings, is that a substring test
 * cannot tell `api.github.com` from `evil-api.github.com` (host extended on
 * the left) or `api.github.com.evil.test` (extended on the right), nor
 * `/state.json` from `/state.json.bak` — every one of which contains the
 * genuine value as a substring. Anchoring the match to the exact text between
 * the fixed "cannot load " / " due to access control checks" phrases — the
 * only text WebKit ever puts there — removes the ambiguity outright instead
 * of trying to out-guess it with boundary characters.
 *
 * There is deliberately no tolerance for whitespace between the scheme and
 * the host. An earlier version of this regex allowed it, describing a space
 * WebKit was said to insert; measured — macOS WebKit locally and Linux WebKit
 * in CI — no such space exists, and the apparent one was an artefact of how
 * the two halves below are put back together.
 */
const DIAGNOSIS = /^(?:Fetch API|XMLHttpRequest) cannot load (https?):\/\/(\S+) due to access control checks\.?$/;

/**
 * Extract the URL a diagnosed WebKit access-control page error names, or
 * `null` if it is not that shape at all (a render crash, a thrown TypeError —
 * never excused).
 *
 * THE ERROR ARRIVES IN TWO HALVES, AND NEITHER HALF ALONE IS THE DIAGNOSIS.
 * Playwright splits every page error into `name`/`message` at the FIRST colon,
 * dropping one character after it (`splitErrorMessage`). The first colon in
 * this diagnosis is the URL's own scheme colon, so the text WebKit emitted
 *
 *     Fetch API cannot load https://api.github.com/… due to access control checks.
 *
 * reaches a test as
 *
 *     name:    'Fetch API cannot load https'
 *     message: '/api.github.com/… due to access control checks.'
 *
 * — MEASURED, identically, on macOS WebKit here and on Linux WebKit in CI.
 * Matching `message` alone (which is what this used to do) can therefore never
 * succeed against a real error, on any platform: the excuse was dead code, and
 * the first CI run that actually produced the error is what exposed it.
 * Rejoining with the dropped `:/` recovers the original text. The unsplit
 * form is tried as well, so a representation that ever stops being split is
 * still understood; both go through the same anchored regex, so a wrong
 * reconstruction simply fails to match rather than matching something loosely.
 */
function reportedUrl(error: { name?: string; message: string }): URL | null {
  for (const text of [error.message, `${error.name ?? ''}:/${error.message}`]) {
    const m = DIAGNOSIS.exec(text.trim());
    if (!m) continue;
    try {
      return new URL(`${m[1]}://${m[2]}`);
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Do a tracked request's URL and the one a page error NAMES address the same
 * resource? Host, path AND QUERY, all three by structural equality.
 *
 * THE QUERY IS THE PART THIS USED TO THROW AWAY, and a sealed finding is what
 * it cost: matching host+path alone makes
 * `contents/setar/index.json?ref=<commit A>` and `?ref=<commit B>` — two
 * different requests the app really does make, one after the other — the same
 * resource, so a cancellation of one stood ready to excuse a genuine failure
 * of the other. WebKit names the FULL url in the diagnosis, query included
 * (measured, macOS WebKit: `…/state.json?ref=main&x=1 due to access control
 * checks.`), so this identity is available and there is no reason to discard
 * it.
 *
 * THE FRAGMENT IS THE ONE PART THAT MUST BE IGNORED, and comparing `href`
 * would get that wrong: a fragment never reaches the network, so
 * `request.url()` drops it — while WebKit's message keeps it verbatim
 * (measured: message `…/state.json#frag`, request url `…/state.json`). Naming
 * `host`/`pathname`/`search` explicitly is what keeps a later tidy-up to
 * `href` from silently killing the excuse for every fragment-bearing URL.
 */
function sameResource(trackedUrl: string, reported: URL): boolean {
  let url: URL;
  try {
    url = new URL(trackedUrl);
  } catch {
    return false;
  }
  return url.host === reported.host && url.pathname === reported.pathname && url.search === reported.search;
}

/**
 * The excuse correlates on IDENTITY plus a VETO, never on proximity.
 *
 * Among the tracked failures for the exact resource the error names, within
 * the defensive ceiling:
 *
 *  - if ANY of them is NOT a cancellation, nothing is excused. A genuine
 *    access-control failure always emits its own `requestfailed` beside its
 *    own page error (measured: 74–359µs after it, six times out of six), so
 *    the presence of genuine evidence for this exact resource means the
 *    cancellation's ownership of this error is unproven — and an unproven
 *    correlation is never resolved in the excuse's favour. This is a veto, not
 *    a ranking: it holds however far away the genuine failure sits, which is
 *    what the previous "whichever is nearest wins" rule could not do. At
 *    `Date.now()` granularity a genuine pair straddling a millisecond boundary
 *    reads as 1ms apart, so an unrelated cancellation in the error's own
 *    millisecond used to outrank it and excuse a real failure;
 *  - otherwise the nearest cancellation is CONSUMED, so it cannot excuse a
 *    second error too. Nearest only chooses WHICH interchangeable cancellation
 *    to spend here; it no longer decides WHETHER anything may be spent.
 *
 * A message that is not the diagnosis at all — a render crash, a thrown
 * TypeError, whatever URL it happens to name — is never excused.
 */
export function excusedCancellation(
  events: TrackedRequestFailure[],
  error: { name?: string; message: string },
  at: number,
): boolean {
  const reported = reportedUrl(error);
  if (!reported) return false;
  let best = -1;
  let bestGap = Infinity;
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const gap = Math.abs(at - e.at);
    if (gap > CANCELLED_EXCUSE_MS) continue;
    if (!sameResource(e.url, reported)) continue;
    if (e.errorText !== 'cancelled') return false;
    if (gap < bestGap) {
      best = i;
      bestGap = gap;
    }
  }
  if (best < 0) return false;
  events.splice(best, 1);
  return true;
}

/**
 * What the harness saw around a diagnosed page error it did NOT excuse, in one
 * sentence, so the assertion that keeps it says why.
 *
 * `expect(app.pageErrors).toEqual([])` on its own reports a WebKit message
 * that reads like a CORS misconfiguration whatever actually happened — which
 * is exactly how a CI-only failure became unreadable. Naming the browser's own
 * `errorText` for every tracked request to that same resource, and how far
 * each sat from the error, turns the next one into evidence instead of a
 * guess. Non-consuming and never an excuse: it only describes.
 */
export function cancellationEvidence(
  events: TrackedRequestFailure[],
  error: { name?: string; message: string },
  at: number,
): string {
  const reported = reportedUrl(error);
  if (!reported) return '';
  const where = `${reported.host}${reported.pathname}${reported.search}`;
  // DELIBERATELY BROADER THAN THE EXCUSE: same host and path, whatever the
  // query. A failure to the same path under a DIFFERENT query is exactly what
  // the excuse must refuse to act on and exactly what the reader of a CI-only
  // failure needs to see, so each row prints its own full url and says whether
  // it was the same resource the error named.
  const near = events
    .filter((e) => Math.abs(at - e.at) <= CANCELLED_EXCUSE_MS)
    .filter((e) => {
      try {
        const url = new URL(e.url);
        return url.host === reported.host && url.pathname === reported.pathname;
      } catch {
        return false;
      }
    })
    .map(
      (e) =>
        `${e.url} — ${e.errorText || '(no errorText)'} at ${e.at >= at ? '+' : ''}${e.at - at}ms` +
        `${sameResource(e.url, reported) ? '' : ' (different query — not the resource this error names)'}`,
    );
  return near.length
    ? `tracked request failures for ${where}: ${near.join('; ')}`
    : `no tracked request failure for ${where} within ${CANCELLED_EXCUSE_MS}ms`;
}

export interface PracticeApp {
  page: Page;
  /** The dev server origin this journey is isolated on. */
  origin: string;
  /** Which engine this journey is actually running in. */
  engine: Engine;
  /**
   * Uncaught page errors, so a broken render cannot pass as a quiet one.
   *
   * RESOLVED ON READ, never as each one arrives: WebKit delivers a page error
   * about a request BEFORE that request's own `requestfailed` (measured:
   * 74–359µs ahead, six times out of six), so deciding at arrival time is
   * deciding against a log that has not been written yet. Reading this at the end of a journey — which is when a
   * journey asserts on it — has every event in hand.
   */
  readonly pageErrors: Error[];
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
  const pending: { error: Error; at: number }[] = [];
  const pageErrors: Error[] = [];
  // EVERY requestfailed is tracked, cancelled or not — genuine evidence for a
  // resource has to be visible to `excusedCancellation` for its veto to fire,
  // not just the cancellations.
  const requestFailures: TrackedRequestFailure[] = [];
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
    page.on('requestfailed', (r) => {
      requestFailures.push({ url: r.url(), at: Date.now(), errorText: r.failure()?.errorText ?? '' });
    });
    // Surface a page-level error instead of letting it become a silently
    // wrong assertion later. RECORDED here, JUDGED in `resolve()` below —
    // the request failure that explains a cancelled one has not been
    // delivered yet at this point.
    page.on('pageerror', (e) => {
      pending.push({ error: e, at: Date.now() });
    });
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

  /**
   * Drain everything that arrived since the last read: excuse each page error
   * a cancellation accounts for, and KEEP the rest — annotated with what the
   * harness actually saw around them, so a refusal to excuse is readable
   * rather than another bare CORS-shaped message. Idempotent: a drained error
   * stays resolved, so reading twice reports the same list.
   */
  const resolve = (): Error[] => {
    for (const { error, at } of pending.splice(0)) {
      if (excusedCancellation(requestFailures, error, at)) continue;
      const evidence = cancellationEvidence(requestFailures, error, at);
      if (evidence) error.message = `${error.message} [harness: ${evidence}]`;
      pageErrors.push(error);
    }
    return pageErrors;
  };

  return {
    page,
    origin,
    engine,
    get pageErrors() {
      return resolve();
    },
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
  /**
   * The published Setar source index — the ONE file on the source-index
   * branch that the NAS scanner writes and the app only ever GETs. Null until
   * something publishes it.
   */
  sourceIndex: { text: string; commit: string } | null;
}

export function newFakeRemote(): FakeRemote {
  return { snapshot: null, refs: [], calls: [], sourceIndex: null };
}

/** Put a snapshot in the repo as if another device had pushed it. */
export function publishRemote(remote: FakeRemote, stateText: string, hash: string, rev: number, deviceName = 'the other device'): void {
  remote.snapshot = { stateText, hash, rev, deviceName, savedAt: new Date().toISOString() };
  if (!remote.refs.includes('main')) remote.refs.push('main');
}

/**
 * Re-stamp an index with the digest the SCANNER would have written for it.
 *
 * The app recomputes this digest at its reader boundary and refuses an index
 * whose content and hash disagree, so a journey that edits a fixture index must
 * publish a genuinely re-scanned one — exactly what the NAS publisher does.
 * ONE implementation, here beside `publishSourceIndex`, so no journey can
 * quietly hand-edit a hash instead.
 */
export async function stampSourceIndex(index: Record<string, unknown>): Promise<string> {
  const body = { ...index };
  delete body.contentHash;
  delete body.generatedAt;
  const sorted = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(sorted);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(value as Record<string, unknown>).sort()) {
        const v = (value as Record<string, unknown>)[k];
        if (v !== undefined) out[k] = sorted(v);
      }
      return out;
    }
    return value;
  };
  const bytes = new TextEncoder().encode(JSON.stringify(sorted(body)));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const contentHash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return JSON.stringify({ ...index, contentHash });
}

/** Put a source index on the source-index branch, as the NAS publisher would. */
export function publishSourceIndex(remote: FakeRemote, text: string, commit = 'source-index-commit-1'): void {
  remote.sourceIndex = { text, commit };
  if (!remote.refs.includes('source-index')) remote.refs.push('source-index');
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
    // A FULFILLED response is still subject to the browser's own CORS check.
    // Chromium lets a routed cross-origin request through; WebKit does not, and
    // an unadorned reply surfaces as "Fetch API cannot load … due to access
    // control checks" — a harness artefact that looks exactly like an app bug.
    // The real api.github.com sends these headers, so sending them here is the
    // fake behaving like the thing it stands in for.
    const CORS = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type,Accept,X-GitHub-Api-Version',
    };
    if (method === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS, body: '' });
    const json = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', headers: CORS, body: JSON.stringify(body) });
    const raw = (body: string) => route.fulfill({ status: 200, contentType: 'text/plain', headers: CORS, body });
    const head = () => `head-${headCounter}`;

    // The source index: a branch ref, then the file AT THAT COMMIT. Reading
    // the file "on the branch" instead would be a second, later state.
    if (method === 'GET' && rest === 'git/ref/heads/source-index') {
      if (!remote.sourceIndex) return json({}, 404);
      return json({ object: { sha: remote.sourceIndex.commit } });
    }
    if (method === 'GET' && rest.startsWith('contents/setar/index.json')) {
      const ref = url.searchParams.get('ref');
      if (!remote.sourceIndex || ref !== remote.sourceIndex.commit) return json({}, 404);
      return json({
        content: Buffer.from(remote.sourceIndex.text, 'utf8').toString('base64'),
        encoding: 'base64',
        size: remote.sourceIndex.text.length,
      });
    }
    if (method === 'GET' && rest === 'git/ref/heads/main') {
      if (!remote.snapshot) return json({}, 404);
      return json({ object: { sha: head() } });
    }
    if (method === 'GET' && rest.startsWith('contents/manifest.json')) {
      if (!remote.snapshot) return json({}, 404);
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
      if (!remote.snapshot) return json({}, 404);
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
    return json({ message: 'not routed' }, 404);
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

### tests/setarInbound.browser.test.ts

```
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CANCELLED_EXCUSE_MS,
  connectSync,
  exportBackup,
  goTo,
  importBackup,
  importOutcome,
  installFakeGitHub,
  newFakeRemote,
  cancellationEvidence,
  excusedCancellation,
  openPracticeApp,
  persistedDb,
  publishRemote,
  readPersistedState,
  reload,
  remoteStateText,
  syncMessage,
  type TrackedRequestFailure,
  writePersistedState,
} from './practiceBrowser';
import INDEX_TEXT from './fixtures/setar-archive.json?raw';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import { SCHEMA_VERSION, type PracticeDB } from '../src/domain/types';
import { validateDB, serializeExport } from '../src/domain/io';
import { decodeSourceIndex } from '../src/domain/sourceArchive';
import { applyArchiveImport, planArchiveImport } from '../src/domain/sourceReconcile';
import { hashState } from '../src/domain/canonical';

// ---------------------------------------------------------------------------
// ac-16 — the archive graph through every door an inbound database uses.
//
// Settings import (full and state-only), an automatic sync pull, "Take the
// GitHub copy", the archive restore, BOTH hydration branches and the cold-start
// recovery control all run the same `validateDB`. A malformed source relation
// has to be refused at every one of them with the previous database AND the
// previous attachment bytes exactly as they were; a valid one has to survive
// all of them with the owner's own bindings, suppressions and fields intact.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-09-17T09:00:00');
const SETAR = 'inst-setar';

/** The owner's v13 data with a real, accepted graph in it — built by the real planner. */
function v14Database(): PracticeDB {
  const base = validateDB(JSON.parse(V13_SETAR_TEXT));
  const index = decodeSourceIndex(JSON.parse(INDEX_TEXT));
  const plan = planArchiveImport({ db: base, index, instrumentId: SETAR, now: CLOCK });
  const db = applyArchiveImport(base, plan);
  // An owner decision that every door must carry through untouched.
  return {
    ...db,
    archiveSources: db.archiveSources.map((s) => ({
      ...s,
      suppressions: [{ kind: 'piece' as const, ref: 'عراق', at: '2026-09-17T09:05:00.000Z' }],
    })),
    items: db.items.filter((i) => i.source?.pieceKey !== 'عراق'),
  };
}

const V14_DB = v14Database();
const V14_TEXT = serializeExport(V14_DB, CLOCK);

/**
 * The same database with ONE nested value inside the graph made malformed.
 *
 * `members[].roles` is what `repeatChains` calls `.includes` on to render an
 * item's material, so a door that accepts this persists a database whose first
 * reader throws. It is the sharpest member of the family — the nested fields a
 * production reader dereferences — and every door below is given the identical
 * bytes rather than a door-specific approximation of them.
 */
function withMalformedRoles<T extends PracticeDB>(db: T): T {
  return {
    ...db,
    archiveSources: db.archiveSources.map((src, i) =>
      i === 0
        ? {
            ...src,
            sessions: src.sessions.map((sess, j) =>
              j === 0
                ? { ...sess, members: sess.members.map((m, k) => (k === 0 ? { ...m, roles: null } : m)) }
                : sess,
            ),
          }
        : src,
    ),
  } as unknown as T;
}

const wrap = (data: unknown, files?: unknown) =>
  JSON.stringify({
    app: 'practice-compass',
    schemaVersion: SCHEMA_VERSION,
    exportedAt: CLOCK.toISOString(),
    data,
    ...(files === undefined ? {} : { files }),
  });

/**
 * A path the REFRESH repaired on an adopted legacy class: the owner's v13 file
 * stores `setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4`,
 * and the rename log moves it here. Repair produces PERSISTED archive state, so
 * it has to cross these doors like everything else.
 */
const REPAIRED_PATH = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';

interface Shape {
  items: { id: string; title: string; source?: { pieceKey: string }; references?: unknown[] }[];
  lessons: { id: string; source?: { sessionN: number }; origin?: string; recordings?: { path: string }[] }[];
  blocks: unknown[];
  archiveSources: { id: string; suppressions: { ref: string }[]; sessions: unknown[] }[];
  schemaVersion: number;
}

const shape = async (app: Parameters<typeof persistedDb>[0]) => (await persistedDb(app)) as unknown as Shape;

describe('the archive graph at every inbound door', () => {
  it('archive state crosses all real inbound doors without partial installation', async () => {
    const app = await openPracticeApp({ now: CLOCK });
    const { page } = app;
    try {
      // --- a real v14 database, through the real Settings importer --------
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(app)).toContain('Imported');
      await reload(app);
      let db = await shape(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.items.filter((i) => i.source)).toHaveLength(93);
      expect(db.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
      // The owner's suppression came through, and the piece it names is absent.
      expect(db.archiveSources[0]!.suppressions.map((s) => s.ref)).toEqual(['عراق']);
      expect(db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
      // …as did their own untouched records.
      expect(db.items.find((i) => i.id === 'own-dashti')!.title).toBe('چهارمضراب اول دشتی');
      expect(db.blocks).toHaveLength(1);
      // The REPAIRED reference survived the door, with the row the owner wrote.
      const repaired = () => db.lessons.find((l) => l.id === 'L-1')!.recordings!;
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);

      const goodBytes = JSON.stringify(await readPersistedState(app));

      // --- MALFORMED SOURCE RELATIONS, refused at the import door ---------
      const bad = V14_DB;
      const cases: { name: string; text: string; says: RegExp }[] = [
        {
          name: 'two sources share an id',
          text: wrap({ ...bad, archiveSources: [bad.archiveSources[0], bad.archiveSources[0]] }),
          says: /share the id/,
        },
        {
          name: 'a source bound to no instrument',
          text: wrap({
            ...bad,
            archiveSources: [{ ...bad.archiveSources[0]!, instrumentId: 'nobody' }],
          }),
          says: /instrument that does not exist/,
        },
        {
          name: 'a dangling item binding',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-dashti' ? { ...i, source: { archiveId: 'setar-classes', pieceKey: 'nope' } } : i,
            ),
          }),
          says: /does not describe/,
        },
        {
          name: 'two items bound to one piece',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-iraq' ? { ...i, source: bad.items.find((x) => x.source)!.source } : i,
            ),
          }),
          says: /Two items are bound/,
        },
        {
          name: 'a lesson bound to a session the source does not describe',
          text: wrap({
            ...bad,
            lessons: bad.lessons.map((l) =>
              l.id === 'L-38-upcoming' ? { ...l, source: { archiveId: 'setar-classes', sessionN: 4242 } } : l,
            ),
          }),
          says: /does not describe/,
        },
        {
          name: 'an unsafe resource path',
          text: wrap({
            ...bad,
            archiveSources: [
              {
                ...bad.archiveSources[0]!,
                sessions: bad.archiveSources[0]!.sessions.map((s, i) =>
                  i === 0 ? { ...s, resources: [{ ...s.resources[0], path: '../../etc/passwd' }] } : s,
                ),
              },
            ],
          }),
          says: /unsafe resource path/,
        },
        {
          name: 'an unsafe direct item reference',
          text: wrap({
            ...bad,
            items: bad.items.map((i) =>
              i.id === 'own-iraq'
                ? {
                    ...i,
                    references: [
                      { id: 'r', title: 'x', path: '../secret.mp4', kind: 'video', createdAt: CLOCK.toISOString() },
                    ],
                  }
                : i,
            ),
          }),
          says: /unsafe reference path/,
        },
        {
          // The sealed counterexample: a nested value no door used to check.
          name: 'a membership with an unreadable role list',
          text: wrap(withMalformedRoles(bad)),
          says: /unreadable role list/,
        },
        {
          name: 'a newer schema',
          text: wrap({ ...bad, schemaVersion: SCHEMA_VERSION + 1 }),
          says: /newer version/i,
        },
      ];

      for (const c of cases) {
        await importBackup(app, 'bad.json', c.text);
        expect(await importOutcome(app), c.name).toMatch(/Import failed/);
        expect(await importOutcome(app), c.name).toMatch(c.says);
        // NOTHING was written — not a partial graph, not a partial database.
        expect(JSON.stringify(await readPersistedState(app)), c.name).toBe(goodBytes);
      }

      // --- a STATE-ONLY import carries the graph too ----------------------
      const renamed = {
        ...V14_DB,
        items: V14_DB.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'state-only import' } : i)),
      };
      await importBackup(app, 'state-only.json', wrap(renamed));
      expect(await importOutcome(app)).toContain('Imported');
      // A v14 database is 94 pieces, 39 sessions and the whole graph, and the
      // importer validates and migrates all of it before it writes. Polled at
      // half a second rather than the shared helper's 50ms: a continuous stream
      // of read transactions on the same object store delays the very write
      // this is waiting for.
      await expect
        .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
          timeout: 60_000,
          interval: 500,
        })
        .toBe('state-only import');
      expect((await shape(app)).archiveSources).toHaveLength(1);

      // --- A SYNC PULL installs the same validated model -------------------
      const remote = newFakeRemote();
      await installFakeGitHub(page, remote);
      // The first sync PUSHES what this device holds, so the pull below is a
      // clean one-sided change rather than a conflict.
      await connectSync(app);
      const local = await persistedDb(app);
      const pulled = {
        ...local,
        items: local.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'from the other device' } : i)),
      };
      publishRemote(remote, remoteStateText(pulled), await hashState(pulled), 9999);
      await goTo(app, '/settings');
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect.poll(() => syncMessage(page), { timeout: 60_000 }).toMatch(/Brought the GitHub copy/i);
      await expect
        .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
          timeout: 60_000,
          interval: 500,
        })
        .toBe('from the other device');
      db = await shape(app);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.archiveSources[0]!.suppressions.map((s) => s.ref)).toEqual(['عراق']);
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);

      // --- A MALFORMED remote snapshot is refused, and installs nothing ----
      const beforePull = JSON.stringify(await readPersistedState(app));
      const brokenRemote = { ...pulled, archiveSources: [{ ...V14_DB.archiveSources[0]!, instrumentId: 'nobody' }] };
      publishRemote(remote, remoteStateText(brokenRemote), await hashState(brokenRemote), 10_000);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect
        .poll(async () => (await syncMessage(page)).includes('instrument that does not exist'), {
          timeout: 60_000,
          interval: 500,
        })
        .toBe(true);
      expect(JSON.stringify(await readPersistedState(app))).toBe(beforePull);

      // …and the NESTED malformation is refused by this door too, not only by
      // the import one. A pull that installed it would leave a database whose
      // own material reader throws, with nothing to undo it.
      const brokenNested = withMalformedRoles(pulled as unknown as PracticeDB);
      publishRemote(remote, remoteStateText(brokenNested), await hashState(brokenNested), 10_001);
      await page.getByRole('button', { name: 'Sync now' }).click();
      await expect
        .poll(async () => (await syncMessage(page)).includes('unreadable role list'), {
          timeout: 60_000,
          interval: 500,
        })
        .toBe(true);
      expect(JSON.stringify(await readPersistedState(app))).toBe(beforePull);

      // --- BOTH CHANGED: "Take the GitHub copy" is the same door -----------
      await goTo(app, '/items/own-dashti');
      await page.getByRole('button', { name: 'Edit' }).first().click();
      await goTo(app, '/settings');
      const keepRemote = {
        ...pulled,
        items: pulled.items.map((i) => (i.id === 'own-dashti' ? { ...i, title: 'the GitHub copy' } : i)),
      };
      publishRemote(remote, remoteStateText(keepRemote), await hashState(keepRemote), 11_000);
      await page.getByRole('button', { name: 'Sync now' }).click();
      const takeRemote = page.getByRole('button', { name: /Take the GitHub copy|Keep the GitHub copy/ });
      if ((await takeRemote.count()) > 0) {
        await takeRemote.first().click();
        await expect
          .poll(async () => (await shape(app)).items.find((i) => i.id === 'own-dashti')?.title, {
            timeout: 60_000,
            interval: 500,
          })
          .toBe('the GitHub copy');
        expect((await shape(app)).archiveSources).toHaveLength(1);
      }

      // --- THE ACTIVE/REVISION GUARD IS UNCHANGED -------------------------
      await goTo(app, '/items/own-dashti');
      await page.getByRole('button', { name: 'Start a block' }).click();
      await goTo(app, '/active');
      await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
      const duringPractice = JSON.stringify(await readPersistedState(app));
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(app)).toMatch(/Import failed/);
      expect(await importOutcome(app)).toMatch(/unfinished|practice/i);
      expect(JSON.stringify(await readPersistedState(app))).toBe(duringPractice);
      await goTo(app, '/active');
      // The harness accepts the confirm() for the whole journey.
      await page.getByRole('button', { name: 'Discard block' }).click();

      // --- A FULL EXPORT: metadata for NAS refs, no bytes ------------------
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      await reload(app);
      const exported = await exportBackup(app);
      const parsed = JSON.parse(exported) as { data: Shape; files?: unknown[] };
      expect(parsed.data.archiveSources).toHaveLength(1);
      expect(parsed.data.items.filter((i) => i.source)).toHaveLength(93);
      // The archive is DESCRIBED, never carried: no NAS bytes, and only real
      // local attachments appear in `files` (there are none here).
      expect(parsed.files ?? []).toEqual([]);
      expect(exported).toContain('session-13-03-09-2024');
      // A repaired path is exported as the archive-relative text it now is —
      // no device base, no legacy folder prefix, and no bytes.
      expect(exported).toContain(REPAIRED_PATH);
      expect(exported).not.toContain('setar-classes/session-1-26-09-2023/video-2023-09-27');
      expect(parsed.data.lessons.find((l) => l.id === 'L-1')!.recordings!.map((r) => r.path)).toContain(REPAIRED_PATH);

      // --- BOTH HYDRATION BRANCHES ----------------------------------------
      // `migrate`: a persisted database declaring the OLD version.
      const current = await readPersistedState(app);
      await writePersistedState(app, { ...(current.state as object), db: JSON.parse(V13_SETAR_TEXT).data }, 13);
      await reload(app);
      db = await shape(app);
      expect(db.schemaVersion).toBe(SCHEMA_VERSION);
      expect(db.archiveSources).toEqual([]);

      // `merge`: a persisted database declaring the CURRENT version, carrying
      // an invalid relation. Zustand skips `migrate` entirely here, which is
      // exactly why the check cannot live only there.
      await importBackup(app, 'setar-v14.json', V14_TEXT);
      await reload(app);
      const valid = await readPersistedState(app);
      const validDb = (valid.state as { db: Shape }).db;
      await writePersistedState(
        app,
        {
          ...(valid.state as object),
          db: {
            ...validDb,
            archiveSources: [{ ...validDb.archiveSources[0]!, instrumentId: 'nobody' }],
          },
        },
        SCHEMA_VERSION,
      );
      const refusedBytes = JSON.stringify(await readPersistedState(app));
      await page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      expect(await page.locator('body').innerText()).toMatch(/instrument that does not exist/);
      // Rendering the refusal writes nothing at all.
      expect(JSON.stringify(await readPersistedState(app))).toBe(refusedBytes);

      // The same hydration branch, given the NESTED malformation instead: this
      // is the door the sealed counterexample actually walked through, and a
      // database it accepted would crash the first material render.
      await writePersistedState(
        app,
        { ...(valid.state as object), db: withMalformedRoles(validDb as unknown as PracticeDB) },
        SCHEMA_VERSION,
      );
      const refusedNestedBytes = JSON.stringify(await readPersistedState(app));
      await page.reload();
      await page.getByText(/couldn’t be loaded safely/).waitFor({ timeout: 20_000 });
      expect(await page.locator('body').innerText()).toMatch(/unreadable role list/);
      expect(JSON.stringify(await readPersistedState(app))).toBe(refusedNestedBytes);

      // --- COLD-START RECOVERY gets the owner back in ----------------------
      await page.getByLabel('Restore backup file').setInputFiles({
        name: 'recover.json',
        mimeType: 'application/json',
        buffer: Buffer.from(V14_TEXT, 'utf8'),
      });
      await page.locator('main').waitFor({ timeout: 20_000 });
      await goTo(app, '/');
      await reload(app);
      db = await shape(app);
      expect(db.archiveSources).toHaveLength(1);
      expect(db.items.filter((i) => i.source)).toHaveLength(93);
      expect(repaired().map((r) => r.path)).toContain(REPAIRED_PATH);
      expect(app.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await app.close();
    }
  }, 240_000);
});

// ---------------------------------------------------------------------------
// The rollback route: the baseline app, not a description of it.
// ---------------------------------------------------------------------------

const BASELINE_COMMIT = 'b649bd09d0ffbd8bbc5955c3c891cfe01a7fa417';

function checkoutBaselineApp(): { root: string; dispose: () => void } {
  const root = join(mkdtempSync(join(tmpdir(), 'pc-setar-baseline-')), 'app');
  execFileSync('git', ['worktree', 'add', '--detach', root, BASELINE_COMMIT], { stdio: 'pipe' });
  // `package.json` here gained two scripts and nothing else; `package-lock.json`
  // is a forbidden path and is byte-identical, so the baseline's dependency
  // tree is this checkout's. Linking is exact and far cheaper than installing.
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

describe('rolling back past the archive schema', () => {
  it('the baseline app refuses a v14 file and restores its own retained backup', async () => {
    const baseline = checkoutBaselineApp();
    const old = await openPracticeApp({ now: CLOCK, root: baseline.root });
    try {
      // The v13 app holds the owner's real v13 data, and exports it itself.
      await importBackup(old, 'setar-legacy-v13.json', V13_SETAR_TEXT);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const oldDb = await persistedDb(old);
      expect(oldDb.schemaVersion).toBe(13);
      const retainedV13 = await exportBackup(old);
      expect(JSON.parse(retainedV13).schemaVersion).toBe(13);

      // IT REFUSES A v14 FILE, and writes nothing.
      const before = JSON.stringify(await readPersistedState(old));
      await importBackup(old, 'setar-v14.json', V14_TEXT);
      expect(await importOutcome(old)).toMatch(/Import failed/);
      expect(await importOutcome(old)).toMatch(/newer version/i);
      expect(JSON.stringify(await readPersistedState(old))).toBe(before);

      // …and the retained v13 backup restores INTO the baseline app, which is
      // what a rollback actually is. There is no down-migration and none is
      // pretended: the v14 file still says 14 and still carries its graph.
      await importBackup(old, 'retained-v13.json', retainedV13);
      expect(await importOutcome(old)).toContain('Imported');
      await reload(old);
      const restored = await persistedDb(old);
      expect(restored.schemaVersion).toBe(13);
      expect(restored.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
        'Teacher: keep the mezrab light on the return.',
      );
      expect(JSON.parse(V14_TEXT).schemaVersion).toBe(SCHEMA_VERSION);
      expect(JSON.parse(V14_TEXT).data.archiveSources).toHaveLength(1);
      expect(old.pageErrors.map((e) => e.message)).toEqual([]);
    } finally {
      await old.close();
      baseline.dispose();
    }
  }, 240_000);
});

describe('the journey harness itself', () => {
  // The harness must not be able to hide the very failure a journey exists to
  // catch, and it must not manufacture one either. A request the browser
  // CANCELLED (because the test drove on mid-flight) is the standing
  // explanation for a WebKit page error that reads exactly like a CORS
  // failure. Excusing it has now failed five different ways, and each test
  // below is named for the specific way:
  //  - a PERMANENT set of cancelled URLs discarded every later page error
  //    whose message merely contained that pathname, so a genuine failure at
  //    the same path, later in the same journey, was swallowed and
  //    `pageErrors` said nothing;
  //  - even made CONSUMING (one cancellation, one error) and bounded by a
  //    generous time window, an unconsumed cancellation — one that produced
  //    no page error of its own — stayed a live "credit" for up to that whole
  //    window, spendable by a genuine, later failure to the same URL that had
  //    nothing to do with it;
  //  - the excuse read the page error's `message` ALONE, which never contains
  //    the diagnosis: Playwright splits a page error at its first colon — the
  //    URL's own scheme colon — so the wording lives in `name` and only the
  //    tail lives in `message`. Every string these tests used to assert on was
  //    a hand-written reconstruction that no browser ever emits;
  //  - and the correlation looked only BACKWARDS in time, on the stated
  //    diagnosis that a `requestfailed` precedes the `pageerror` it causes.
  //    Measured, WebKit delivers them the other way round. Against a real
  //    error the log was still empty when the excuse ran;
  //  - and, the finding this block was last reworked for, the correlation
  //    that replaced the window — "whichever tracked failure sits NEAREST the
  //    error wins", on host+path — threw away the QUERY, so two different
  //    requests to one path were one resource, and rested the whole safety
  //    claim on PROXIMITY, which the measurement below shows cannot carry it:
  //    a genuine failure's own `requestfailed` lands 74–359µs after its page
  //    error, which reads as 0ms or 1ms depending on which side of a
  //    millisecond boundary the pair straddles, so an unrelated cancellation
  //    in the error's own millisecond outranked it.
  // The middle two were exposed by the same CI run: the journey passed on one
  // runner and failed on two others at the identical commit, because the
  // error had simply never been produced locally before.
  const url = 'https://api.github.com/repos/owner/data/contents/state.json';

  /**
   * The diagnosis AS A TEST ACTUALLY RECEIVES IT — the two halves Playwright
   * splits it into. Measured against Playwright's own WebKit, and identical
   * to the representation the failing CI run reported.
   */
  const diagnosed = (target = url) => {
    const u = new URL(target);
    return {
      name: `Fetch API cannot load ${u.protocol.replace(':', '')}`,
      message: `/${u.host}${u.pathname}${u.search}${u.hash} due to access control checks.`,
    };
  };
  const spurious = diagnosed();
  const at = 1_000_000;
  const cancelled = (offset = 0, target = url): TrackedRequestFailure => ({
    url: target,
    at: at + offset,
    errorText: 'cancelled',
  });
  const genuine = (offset = 0, target = url): TrackedRequestFailure => ({
    url: target,
    at: at + offset,
    errorText: 'Origin http://localhost:5173 is not allowed by Access-Control-Allow-Origin. Status code: 200',
  });

  /**
   * Raise the diagnosis as a REAL uncaught page error, through the app's own
   * page. A top-level `throw` in an injected script, NOT a timer callback:
   * every journey installs `page.clock`, so a `setTimeout` here never fires at
   * all and the error would never be delivered.
   */
  const raiseDiagnosis = async (app: { page: import('playwright').Page }, target: string): Promise<void> => {
    await app.page.addScriptTag({
      content: `throw new Error(${JSON.stringify(`Fetch API cannot load ${target} due to access control checks.`)});`,
    });
  };

  it('reads the diagnosis as Playwright actually splits it, in both WebKit spellings', () => {
    // THE EXACT PAIR THE FAILING CI RUN REPORTED, verbatim.
    const fromCI = {
      name: 'Fetch API cannot load https',
      message: '/api.github.com/repos/owner/practice-data/contents/README.md due to access control checks.',
    };
    const readme = 'https://api.github.com/repos/owner/practice-data/contents/README.md';
    expect(excusedCancellation([{ url: readme, at, errorText: 'cancelled' }], fromCI, at + 5)).toBe(true);

    // The message half ALONE is not the diagnosis and never matches: this is
    // the shape the excuse used to be handed, and why it never fired.
    expect(
      excusedCancellation([{ url: readme, at, errorText: 'cancelled' }], { message: fromCI.message }, at + 5),
    ).toBe(false);

    // An UNSPLIT representation is understood too, so this does not depend on
    // Playwright continuing to split it.
    expect(
      excusedCancellation([cancelled()], { name: 'Error', message: `Fetch API cannot load ${url} due to access control checks.` }, at + 5),
    ).toBe(true);

    // WebKit spells the same diagnosis for an XHR as well as for a fetch.
    expect(
      excusedCancellation([cancelled()], { ...spurious, name: spurious.name.replace('Fetch API', 'XMLHttpRequest') }, at + 5),
    ).toBe(true);

    // Only the DIAGNOSED wording is ever excused: a real render crash naming
    // the same URL is a page error, not a cancellation.
    expect(
      excusedCancellation([cancelled()], { name: 'TypeError', message: `undefined is not an object — ${url}` }, at + 5),
    ).toBe(false);
  });

  it('tells two requests to one path apart by their query, in both directions', () => {
    // THE SEALED FINDING THIS BLOCK WAS REWORKED FOR. Host+path alone makes
    // these one resource; they are two requests the app really does make, one
    // after the other, when it reads the published index at two commits.
    const refA = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-a';
    const refB = 'https://api.github.com/repos/owner/data/contents/setar/index.json?ref=commit-b';

    // A cancellation of ONE never excuses the diagnosis naming the OTHER —
    // and the cancellation is left intact, not spent on something it does not
    // account for.
    const other = [cancelled(0, refA)];
    expect(excusedCancellation(other, diagnosed(refB), at + 1)).toBe(false);
    expect(other).toHaveLength(1);

    // A query-less request is not the same resource as a query-bearing one,
    // either way round.
    const bare = 'https://api.github.com/repos/owner/data/contents/setar/index.json';
    expect(excusedCancellation([cancelled(0, bare)], diagnosed(refA), at + 1)).toBe(false);
    expect(excusedCancellation([cancelled(0, refA)], diagnosed(bare), at + 1)).toBe(false);
    // Differing only in a query VALUE is enough; so is a differing key.
    expect(
      excusedCancellation([cancelled(0, `${bare}?ref=commit-a&page=2`)], diagnosed(refA), at + 1),
    ).toBe(false);

    // And the matching one still works, so this is identity, not blanket refusal.
    const own = [cancelled(0, refA)];
    expect(excusedCancellation(own, diagnosed(refA), at + 1)).toBe(true);
    expect(own).toEqual([]);
  });

  it('ignores the fragment, which the message carries and the request never does', () => {
    // MEASURED, macOS WebKit: the page error names `…/state.json#frag` while
    // `request.url()` for the very same request reports `…/state.json` — a
    // fragment is never sent. Comparing `href` would therefore break the
    // excuse for every fragment-bearing URL; comparing host/path/search does
    // not. (The app itself never fetches a fragment; this is what keeps a
    // later tidy-up to `href` from silently killing the excuse.)
    const own = [cancelled(0, url)];
    expect(excusedCancellation(own, diagnosed(`${url}#frag`), at + 1)).toBe(true);
    expect(own).toEqual([]);
    // And the fragment does not smuggle a query past the check either.
    expect(excusedCancellation([cancelled(0, url)], diagnosed(`${url}?ref=a#frag`), at + 1)).toBe(false);
  });

  it('excuses a cancellation whose page error arrives BEFORE the requestfailed that explains it', () => {
    // THE MEASURED ORDER: WebKit delivers the page error 74–359µs ahead of the
    // request's own failure. A backwards-only search saw an empty log here and
    // excused nothing.
    const later = [cancelled(1)];
    expect(excusedCancellation(later, spurious, at)).toBe(true);
    expect(later).toEqual([]);

    // The other order still works: one measurement is not a proof that the
    // reverse can never happen.
    const earlier = [cancelled(-1)];
    expect(excusedCancellation(earlier, spurious, at)).toBe(true);
    expect(earlier).toEqual([]);
  });

  it('a cancellation excuses its own diagnosed error once', () => {
    const pending = [cancelled()];
    expect(excusedCancellation(pending, spurious, at + 5)).toBe(true);
    // CONSUMED — the identical error arriving again has no cancellation left
    // to account for it, which is the ORIGINAL reviewer counterexample.
    expect(pending).toEqual([]);
    expect(excusedCancellation(pending, spurious, at + 15)).toBe(false);
  });

  it('multiple cancellations to the same URL each excuse their own error and no more', () => {
    const twice = [cancelled(), cancelled(10)];
    expect(excusedCancellation(twice, spurious, at + 20)).toBe(true);
    expect(excusedCancellation(twice, spurious, at + 30)).toBe(true);
    expect(excusedCancellation(twice, spurious, at + 40)).toBe(false);
  });

  it('genuine evidence for a resource vetoes the excuse for it, at any distance', () => {
    // THE SAFETY CLAIM, and it is a VETO rather than a ranking on purpose. A
    // genuine access-control failure always emits its own `requestfailed`
    // beside its own page error, so genuine evidence for this exact resource
    // means the cancellation's ownership of this error is unproven — and an
    // unproven correlation is never resolved in the excuse's favour.
    const events = [cancelled(), genuine(50)];
    expect(excusedCancellation(events, spurious, at + 60)).toBe(false);
    // The stale cancellation is untouched: it was refused, never spent.
    expect(events).toContainEqual(cancelled());

    // DISTANCE CANNOT BUY THE EXCUSE BACK. This is what the previous
    // nearest-wins rule could not hold: at `Date.now()` granularity a genuine
    // pair straddling a millisecond boundary reads as 1ms apart, so a
    // cancellation in the error's own millisecond outranked it by 1ms and
    // excused a real failure. Here the cancellation is as near as a tracked
    // event can be and the genuine failure is as far as the ceiling allows.
    const nearCancel = [cancelled(0), genuine(CANCELLED_EXCUSE_MS)];
    expect(excusedCancellation(nearCancel, spurious, at)).toBe(false);
    expect(nearCancel).toHaveLength(2);

    // The measured shape of a real pair, exactly: page error first, its own
    // failure 1ms later, an unrelated cancellation in the same millisecond.
    const measured = [cancelled(0), genuine(1)];
    expect(excusedCancellation(measured, spurious, at)).toBe(false);

    // A TIE is refused for the same reason.
    expect(excusedCancellation([cancelled(), genuine()], spurious, at)).toBe(false);
  });

  it('a veto is scoped to the resource, so an unrelated failure never blocks a real excuse', () => {
    // The veto must not become blanket suppression of the excuse: a genuine
    // failure to a DIFFERENT resource — including the same path under another
    // query — says nothing about this error.
    const elsewhere = [
      genuine(0, 'https://api.github.com/repos/owner/data/contents/manifest.json'),
      genuine(0, `${url}?ref=main`),
      genuine(0, 'https://api.example.com/repos/owner/data/contents/state.json'),
      cancelled(1),
    ];
    expect(excusedCancellation(elsewhere, spurious, at)).toBe(true);
    // Only the cancellation was consumed; the genuine rows are still tracked.
    expect(elsewhere).toHaveLength(3);
    expect(elsewhere.every((e) => e.errorText !== 'cancelled')).toBe(true);

    // And a genuine failure to this resource OUTSIDE the ceiling is not
    // evidence about this error at all — the ceiling bounds the veto exactly
    // as it bounds the excuse.
    const distant = [genuine(-CANCELLED_EXCUSE_MS - 1), cancelled(1)];
    expect(excusedCancellation(distant, spurious, at)).toBe(true);
  });

  it('a genuine failure is never excused, before or after a cancellation to the same URL', () => {
    // Genuine failure arrives FIRST, with no cancellation recorded at all.
    const events = [genuine()];
    expect(excusedCancellation(events, spurious, at + 5)).toBe(false);

    // A cancellation follows — and under the VETO it still excuses nothing
    // while that genuine failure is in the window. This assertion used to
    // read `true`, on the nearest-wins rule: the cancellation was 10ms away
    // and the genuine failure 110ms, so the nearer one won and a real failure
    // to that exact resource was excused. Genuine evidence for a resource now
    // forbids the excuse for it outright.
    events.push(cancelled(100));
    expect(excusedCancellation(events, spurious, at + 110)).toBe(false);

    // Once the genuine failure is old enough to be out of the window, the
    // cancellation excuses its own error normally — the veto expires with the
    // evidence, it is not a permanent mark against the URL.
    expect(excusedCancellation(events, spurious, at + CANCELLED_EXCUSE_MS + 1)).toBe(true);
  });

  it('the excuse never matches a host or path that merely shares characters with the cancelled one', () => {
    // A substring test cannot tell these apart from the genuine host/path;
    // only structural URL equality can. Each of these contains the real
    // host or path as a substring while naming a DIFFERENT resource.
    for (const trap of [
      'https://evil-api.github.com/repos/owner/data/contents/state.json',
      'https://api.github.com.evil.test/repos/owner/data/contents/state.json',
      'https://api.github.com/repos/owner/data/contents/state.json.bak',
      // Another host entirely, and another path on the same host.
      'https://api.example.com/repos/owner/data/contents/state.json',
      'https://api.github.com/repos/owner/data/contents/files/x.bin',
    ]) {
      expect(excusedCancellation([cancelled()], diagnosed(trap), at + 5)).toBe(false);
    }
  });

  it('an unconsumed cancellation still expires past its now-defensive ceiling', () => {
    expect(excusedCancellation([cancelled()], spurious, at + CANCELLED_EXCUSE_MS)).toBe(true);
    expect(excusedCancellation([cancelled()], spurious, at + CANCELLED_EXCUSE_MS + 1)).toBe(false);
    // Symmetrically in the other direction, now that both are searched.
    expect(excusedCancellation([cancelled(CANCELLED_EXCUSE_MS)], spurious, at)).toBe(true);
    expect(excusedCancellation([cancelled(CANCELLED_EXCUSE_MS + 1)], spurious, at)).toBe(false);
  });

  it('measures what a REAL WebKit reports, and holds the rule to it', async () => {
    // Every string and every ORDER in the tests above was once a hand-written
    // reconstruction, and the CI run that finally produced the real thing is
    // what exposed two of them. This drives an actual WebKit and reads actual
    // event objects, so the shape, the query, the fragment and the ordering
    // can never drift back to a reconstruction.
    //
    // A reply from a REAL server with no CORS headers is what makes WebKit emit
    // this diagnosis; a Playwright-fulfilled response does not go through the
    // same check, which is why the fake GitHub repo above never produces one.
    const blocked = createServer((req, res) => {
      // `?slow` never answers in time, so a reload CANCELS it — the other
      // half of this test needs a REAL cancellation, with the browser's own
      // url, errorText and arrival time.
      const reply = () => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{}');
      };
      if (req.url?.includes('slow')) setTimeout(reply, 30_000).unref();
      else reply();
    });
    await new Promise<void>((done) => blocked.listen(0, '127.0.0.1', done));
    const port = (blocked.address() as AddressInfo).port;
    const target = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/README.md`;
    const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
    try {
      // BOTH streams, in arrival order, with arrival times — so the ordering
      // this rule was corrected for is measured here rather than asserted
      // from memory.
      const seen: ({ kind: 'error'; error: Error; at: number } | ({ kind: 'failed'; at: number } & TrackedRequestFailure))[] = [];
      app.page.on('pageerror', (e) => seen.push({ kind: 'error', error: e, at: Date.now() }));
      app.page.on('requestfailed', (r) =>
        seen.push({ kind: 'failed', at: Date.now(), url: r.url(), errorText: r.failure()?.errorText ?? '' }),
      );

      // A genuine access-control failure, with a QUERY and a FRAGMENT, so the
      // message's treatment of both is measured rather than assumed.
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?ref=main#frag`);
      await expect.poll(() => seen.filter((e) => e.kind === 'failed').length, { timeout: 20_000 }).toBeGreaterThan(0);

      const real = seen.find((e) => e.kind === 'error');
      const realFailure = seen.find((e) => e.kind === 'failed');
      if (real?.kind !== 'error' || realFailure?.kind !== 'failed') throw new Error('WebKit reported no pair to measure.');

      // THE REPRESENTATION, as the browser and Playwright actually deliver it:
      // the wording is in `name`, only the tail is in `message`. This is the
      // identical split the failing CI run reported.
      expect(real.error.name).toBe('Fetch API cannot load http');
      // The QUERY is in the message — which is the identity the excuse used to
      // throw away — and so is the FRAGMENT, which the request itself drops.
      expect(real.error.message).toBe(
        `/127.0.0.1:${port}/repos/owner/practice-data/contents/README.md?ref=main#frag due to access control checks.`,
      );
      expect(realFailure.url).toBe(`${target}?ref=main`);
      expect(realFailure.errorText).toContain('Access-Control-Allow-Origin');

      // THE OBSERVED ORDERING, measured rather than stated: the page error is
      // delivered first, and its own request failure lands beside it, well
      // inside the defensive ceiling. (Sub-millisecond, hence a gap of 0 or 1
      // at this clock's granularity — which is exactly why proximity cannot
      // be what separates a genuine failure from a cancellation.)
      expect(seen.indexOf(real)).toBeLessThan(seen.indexOf(realFailure));
      expect(realFailure.at - real.at).toBeLessThanOrEqual(CANCELLED_EXCUSE_MS);

      // THE VETO, PROVED ON REAL EVENTS: this genuine failure is not excused,
      // not even by a cancellation to the very same resource sitting in the
      // error's own millisecond — the case a nearest-wins rule got wrong.
      const log: TrackedRequestFailure[] = [
        { url: realFailure.url, at: realFailure.at, errorText: realFailure.errorText },
        { url: realFailure.url, at: real.at, errorText: 'cancelled' },
      ];
      expect(excusedCancellation(log, real.error, real.at)).toBe(false);
      expect(log).toHaveLength(2);

      // And the harness KEEPS it — saying what the browser reported instead of
      // leaving a bare CORS-shaped message.
      const kept = app.pageErrors;
      expect(kept).toHaveLength(1);
      expect(kept[0].message).toContain('due to access control checks');
      expect(kept[0].message).toContain('Access-Control-Allow-Origin');
      // Reading twice reports the same list, not a growing one.
      expect(app.pageErrors).toHaveLength(1);

      // A REAL CANCELLATION, from a request genuinely in flight across a
      // reload — the browser's own url, errorText and arrival time.
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), `${target}?slow=1`);
      await reload(app);
      await expect
        .poll(() => seen.some((e) => e.kind === 'failed' && e.errorText === 'cancelled'), { timeout: 20_000 })
        .toBe(true);
      const realCancel = seen.find((e) => e.kind === 'failed' && e.errorText === 'cancelled');
      if (realCancel?.kind !== 'failed') throw new Error('WebKit reported no cancellation to measure.');
      expect(realCancel.url).toBe(`${target}?slow=1`);

      // IT EXCUSES ITS OWN RESOURCE AND NOTHING ELSE. No pairing of a
      // cancellation with this page error has ever been OBSERVED — five
      // cancellation shapes were driven through a real WebKit and each
      // produced a `requestfailed` and no page error at all — so the
      // diagnosis here is written against the url the browser really
      // cancelled, rather than pretending to a pairing nothing has seen.
      const cancelLog = () => [{ url: realCancel.url, at: realCancel.at, errorText: realCancel.errorText }];
      expect(excusedCancellation(cancelLog(), diagnosed(realCancel.url), realCancel.at)).toBe(true);
      // The same path WITHOUT that query is a different request instance, and
      // this real cancellation says nothing about it.
      expect(excusedCancellation(cancelLog(), diagnosed(target), realCancel.at)).toBe(false);

      // AND A JUDGEMENT IS MADE ONCE: the genuine refusal already reported is
      // not taken back by this real cancellation to the same host and path.
      expect(app.pageErrors).toHaveLength(1);
    } finally {
      await app.close();
      await new Promise<void>((done) => blocked.close(() => done()));
    }
  }, 120_000);

  it('the wiring really excuses — a diagnosed error for a genuinely cancelled request never reaches pageErrors', async () => {
    // THE EXCUSE HAS NOW BEEN DEAD CODE TWICE, and both times only CI could
    // tell. This drives the harness END TO END: a request the browser really
    // cancels, and a real `pageerror` delivered through the real listener,
    // carrying the diagnosis for that exact url. `pageErrors` must stay empty
    // — and must not, if the error names a neighbouring request instead.
    //
    // The error TEXT is raised in the page rather than waited for, because no
    // cancellation shape driven through a real WebKit has ever produced one
    // (see `TrackedRequestFailure`'s comment). Everything else here is real:
    // the cancellation, the event objects, the listeners and the resolve path.
    const stalled = createServer((_req, res) => {
      setTimeout(() => {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end('{}');
      }, 30_000).unref();
    });
    await new Promise<void>((done) => stalled.listen(0, '127.0.0.1', done));
    const port = (stalled.address() as AddressInfo).port;
    const app = await openPracticeApp({ now: new Date('2026-09-17T09:00:00.000Z'), engine: 'webkit' });
    try {
      const cancellations: string[] = [];
      app.page.on('requestfailed', (r) => {
        if (r.failure()?.errorText === 'cancelled') cancellations.push(r.url());
      });
      const inFlight = `http://127.0.0.1:${port}/repos/owner/practice-data/contents/state.json?ref=main`;
      await app.page.evaluate((u) => void fetch(u).catch(() => {}), inFlight);
      await reload(app);
      await expect.poll(() => cancellations.includes(inFlight), { timeout: 20_000 }).toBe(true);
      expect(app.pageErrors).toEqual([]);

      // The diagnosis for a DIFFERENT request to the same path is kept: one
      // cancellation excuses one resource, never a neighbour.
      const neighbour = `${inFlight.split('?')[0]}?ref=other`;
      await raiseDiagnosis(app, neighbour);
      await expect.poll(() => app.pageErrors.length, { timeout: 20_000 }).toBe(1);
      expect(app.pageErrors[0].message).toContain('?ref=other');
      // ...and the evidence names what the harness actually saw, including the
      // same-path cancellation it refused to spend.
      expect(app.pageErrors[0].message).toContain('different query');

      // The diagnosis for the request that WAS cancelled is excused, so the
      // list does not grow — the wiring, not just the rule.
      await raiseDiagnosis(app, inFlight);
      await app.page.waitForTimeout(500);
      expect(app.pageErrors).toHaveLength(1);
    } finally {
      await app.close();
      await new Promise<void>((done) => stalled.close(() => done()));
    }
  }, 120_000);

  it('a page error it refuses to excuse says what the browser actually reported', () => {
    // The CI failure this whole rework came from was one bare CORS-shaped
    // message with nothing to distinguish a cancellation from a real refusal.
    // An unexcused diagnosis now carries the browser's own words for every
    // request to that resource, and how far each sat from the error.
    const withGenuine = cancellationEvidence([genuine(1)], spurious, at);
    expect(withGenuine).toContain('api.github.com/repos/owner/data/contents/state.json');
    expect(withGenuine).toContain('Access-Control-Allow-Origin');
    expect(withGenuine).toContain('+1ms');

    // DELIBERATELY BROADER THAN THE EXCUSE: a failure to the same path under a
    // different query is exactly what the excuse must refuse to act on, and
    // exactly what the reader of a CI-only failure needs to see. It is named
    // as the different request it is.
    const nearMiss = cancellationEvidence([cancelled(0, `${url}?ref=main`)], spurious, at);
    expect(nearMiss).toContain('?ref=main');
    expect(nearMiss).toContain('different query');
    // The resource the error actually names is not labelled that way.
    expect(cancellationEvidence([cancelled()], spurious, at)).not.toContain('different query');

    // NOTHING tracked at all is itself the evidence — it says so rather than
    // saying nothing.
    expect(cancellationEvidence([], spurious, at)).toMatch(/no tracked request failure/);
    // A request that failed BEFORE the error is reported with its sign.
    expect(cancellationEvidence([genuine(-7)], spurious, at)).toContain('-7ms');
    // It only ever describes: nothing is consumed and nothing is excused.
    const events = [cancelled()];
    expect(cancellationEvidence(events, spurious, at + 5)).toContain('cancelled');
    expect(events).toEqual([cancelled()]);
    // A page error that is not this diagnosis at all has nothing to say.
    expect(cancellationEvidence([cancelled()], { name: 'TypeError', message: 'boom' }, at)).toBe('');
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

If your verdict is `DO NOT SEAL`, your session is repository-read-only and cannot write the findings file itself — the owner does, from what you print. These are THREE separate copy actions, never one shell script: the JSON is DATA and must never be pasted at a normal shell prompt. Do not reconstruct or alter the path, the contract id or either command below — both commands come verbatim from Prismatica; you supply only the structured findings JSON, and it must parse as strict JSON before you present it here. End your reply with exactly these three steps, in this order, each its own fenced code block:

**1. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260917-turn-the-setar-archive-into-trusted-less-5614/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260917-turn-the-setar-archive-into-trusted-less-5614' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260917-turn-the-setar-archive-into-trusted-less-5614/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260917-turn-the-setar-archive-into-trusted-less-5614/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
