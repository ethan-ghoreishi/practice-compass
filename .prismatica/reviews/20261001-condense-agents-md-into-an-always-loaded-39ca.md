---
id: 20261001-condense-agents-md-into-an-always-loaded-39ca
contractId: 20261001-condense-agents-md-into-an-always-loaded-39ca
patchId: b043349ada2a0e5400b3a11646d92c50bf557135
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: repository-guidance-path-reachability
    summary: "The path-reachability family remains open: ac-3 passes missing targets
      through container continuations, Unicode whitespace truncation,
      context-blind backtick stripping and srcset URL splitting. Close all
      branches and extend the named proof fixtures."
    counterexample: "HEAD 174b4b9, tests/agent-context.test.ts:69-79,111-119.
      Read-only execution of the actual 'every repository path AGENTS.md names
      exists' callback passes after appending each example: > [missing]:\\n>
      docs/reviewer-missing.md\\n>\\n> [missing]; > [missing](\\n>
      docs/reviewer-missing.md); > ![missing](\\n> public/reviewer-missing.png).
      It also passes inline links, reference definitions and images whose
      destination is an existing docs/cgs-course.md or public/icon.svg followed
      by U+00A0 and reviewer-missing, because only the existing prefix is
      checked. Paired backticks around reviewer-missing after the same prefixes
      are stripped inside inline links, definitions and images; quoted HTML
      srcset has the same bypass. <img
      srcset=\"public/icon.svg,reviewer-missing.png 1x\"> and the U+00A0 variant
      also check only public/icon.svg. Sweep: one namedPaths implementation;
      CODE_SPAN/inCode, DESTINATION_START/destinationAt, HTML_TARGET/srcset and
      targetPath; ac-3 and its named fixture test; package.json npm test, ci.yml
      and deploy.yml. Clean: current named paths, genuine code spans/fences,
      ordinary/titled/angle links and images, same-line container definitions,
      plain next-line definitions, balanced/escaped parentheses, ordinary
      quoted/unquoted HTML, entities, anchors/queries, deduplication and
      specified glob exclusions. Original rejection examples now fail. All five
      existing exact test bodies pass, but the counterexamples above are absent
      from the fixtures."
createdAt: 2026-10-01T23:06:43.568Z
sealedAt: 2026-10-01T23:15:13.268Z
---

# Review: Condense AGENTS.md into an always-loaded rulebook within 32 KiB and keep it from growing back

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20261001-condense-agents-md-into-an-always-loaded-39ca
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/43
- **Risk tier:** normal — a feature or bug — full checks plus a sealed fresh-eyes review
- **Diff patch-id:** `b043349ada2a0e5400b3a11646d92c50bf557135`
- **Computed by:** prismatica 0.10.0 · build sha256:95c0f07703a730a1 · installed package, not registry-verified


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

**Approved intent:** `.prismatica/intents/20261001-condense-agents-md-into-an-always-loaded-39ca.md`

**Findings from the previous review:**

- **always-loaded-prohibition-preservation** — Six baseline agent-facing restrictions remain absent from AGENTS.md. Restore the whole family, extend the preservation guard and correct the disposition table.
  _counterexample:_ Baseline 56789a8:AGENTS.md prohibits an effect-mirrored notes ref (150-151), audio unlock on the practice screen (503-505), assigning a preserved course key merely by lower ordinal (2265-2267), putting planMinutesByInstrument in PracticeDB or sync/backup (2985-2986), viewport restoration while short or zoomed (3041-3043), and components rebuilding domain objects by hand (3102-3103). Current AGENTS.md lines 28, 61, 113-114, 53/134, 143 and 148 omit these specific restrictions. Clean consumers: ItemNotes/DurableNotes, LessonNotes, ItemDetail, ActiveBlock, RoutineRunner, useScreenAwake, the CGS scanner/runbook, store partialize, Today, SessionPlan, viewport/useViewportGuard/Layout and viewport fixtures retain their mechanisms. The five previously named bans, core loop, four hard do-nots, eleven rule ids, bounded owner decisions, named gaps, NAS tooling and AGENTS-citing consumers survive. CLAUDE.md imports AGENTS.md, but the 83-phrase preservation test passes despite these omissions.
- **repository-guidance-path-reachability** — namedPaths still fails open across inline links/images, reference definitions and HTML targets. Close all extraction branches and extend the focused proof route.
  _counterexample:_ Read-only execution of the actual ac-3 body passes with appended [missing](docs/(reviewer-missing).md), [missing]: docs/(reviewer-missing).md or ![missing](public/(reviewer-missing).png): extraction checks only existing docs/ or public/. [missing](docs/cgs-course.md(reviewer-missing)) checks an existing prefix file and passes. Reference definitions under > or - are omitted, as are <a href=docs/reviewer-missing.md> and <img src=public/reviewer-missing.png>. Sweep found one namedPaths implementation, three LINK_TARGETS branches, ac-3 and its fixture test; npm test feeds ci.yml and deploy.yml. Clean cases: code spans/fences, ordinary/titled/angle links, simple top-level references, quoted HTML, anchor/query/line stripping, deduplication and specified glob exclusions. All five named guards pass on current text; original rejection examples correctly fail, but these independent family cases are absent from the proof fixtures.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 4304fd0b121c5fe90eff7ddaf0cf407ce6514788..9de5bdcfe70983d5ae495c884e5bbbda3d267cde 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -25,7 +25,7 @@ Preserve **one item · one mode · one focus · one result · one next action.**
 - Four homes (`practiceInformation.ts`): `PracticeItem.notes` ("Working notes", the item's one notebook, editable while practising), `PracticeBlock.observation`, `PracticeBlock.nextAction`, `lessonAgenda`. Legacy `PracticeBlock.constraint` is kept, shown and validated, never newly captured. Nothing copies one home into another; the latest observation is derived (`latestObservation`) and shown dated, never stored back.
 - **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`, `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen Persian/Guitar working-detail fields (`shahed`, `ist`, `foroud`, `ornamentIssue`, `mezrabIssue`, `phraseLabel`, `importantNote`, `rightHandIssue`, `leftHandIssue`, `toneIssue`, `fingering`, `tempo`, `stringNoiseIssue`, `bodyTensionNote`) are REMOVED, not merged into `notes` (their content was dummy data). Identity fields (`dastgahAvaz`, `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. The waiver covers exactly those fields and is NOT permission to reset practice history, ratings, reviews, commitments or any future meaningful text. `retirePracticeText` only deletes, reads no clock and runs on every inbound database.
 - `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block): absent, empty and `null` are legitimate; a wrong type is refused naming the record, never coerced.
-- Notes are edited only in `src/components/ItemNotes.tsx` (lessons reuse `DurableNotes`): explicit Done, never on blur; "Saved." waits for IndexedDB; a failed write keeps the text with Try again (always writes) and Copy. The draft is tagged with its item, dropped when it changes, read through a ref, never a closure; an in-flight write never owns the editor; only the latest save acts (`saveSeq`). Editing notes changes nothing else (clock, block, result, review, SM-2).
+- Notes are edited only in `src/components/ItemNotes.tsx` (lessons reuse `DurableNotes`): explicit Done, never on blur; "Saved." waits for IndexedDB; a failed write keeps the text with Try again (always writes) and Copy. The draft is tagged with its item, dropped when it changes, read through a ref, never a closure or a ref an effect mirrors; an in-flight write never owns the editor; only the latest save acts (`saveSeq`). Editing notes changes nothing else (clock, block, result, review, SM-2).
 - After any install every attachment the database describes has bytes here (r-no-silent-data-loss): `decodeBackupFiles` and `importFullBackup` refuse a file that breaks that, naming it, changing nothing; `validateDB` refuses duplicate attachment ids. The export is built from metadata (`buildFullBackupWithRev`), so never refused; unreferenced blobs are never deleted; `addAttachment` writes the blob first.
 
 ## Quick start, low admin (r-quick-start)
@@ -58,7 +58,7 @@ Preserve **one item · one mode · one focus · one result · one next action.**
 
 ## Hands-free practice
 
-- A running clock on a visible screen holds one Screen Wake Lock (`shouldKeepAwake`; one owner, `useScreenAwake`). `nextSignal` announces at most once per call, moving the ephemeral `signalledThrough` to the boundaries passed, never by one; routine boundaries are `segmentBoundaries`, never a second sum; Skip calls `acknowledgeThrough`. The guaranteed signal is visual (target ring, overtime figure; a routine boundary shows for a window, never one render); a block never auto-finishes; audio and vibration are best-effort, never asserted. None of this changes a minute.
+- A running clock on a visible screen holds one Screen Wake Lock (`shouldKeepAwake`; one owner, `useScreenAwake`). `nextSignal` announces at most once per call, moving the ephemeral `signalledThrough` to the boundaries passed, never by one; routine boundaries are `segmentBoundaries`, never a second sum; Skip calls `acknowledgeThrough`. The guaranteed signal is visual (target ring, overtime figure; a routine boundary shows for a window, never one render); a block never auto-finishes; audio and vibration are best-effort, never asserted; audio unlocks on the page that starts the clock, never on the practice screen. None of this changes a minute.
 - The wake lock, `crypto.subtle` (`sha256Hex`) and the service worker need a secure context, which LAN `http://` is not: confirm `window.isSecureContext` on the device over HTTPS before judging an unmerged branch. The answer is a route, never a fallback hash: `parseSourceIndex` refuses first (`INSECURE_CONTEXT_REFUSAL`).
 - **Open gaps:** Sync over plain http still throws the raw `Cannot read properties of undefined (reading 'digest')` (a wording fix in its own lane, never a second hash); `readIndexFile` (`src/store/archiveIndex.ts`) has no production caller.
 
@@ -116,7 +116,7 @@ Runbook and detail: `docs/setar-archive.md`; app side `sourceReconcile.ts`.
 Runbooks: `docs/cgs-course.md`, `docs/khonyagar-course.md`.
 
 - A course never reuses the Setar archive machinery: no persisted graph, no inbound door, no schema change. Its scanner is the only grammar, never imported by or reachable from runtime; what it cannot read (a BPM, a section) is absent with a diagnostic, never guessed; it refuses a duplicate key. Generated data (`courseData.ts`, `khonyagarData.ts`) is never hand-edited; legacy key aliases live in hand-written `courseSeed.ts` (`COURSE_LEGACY_KEYS`). Stored paths are NFC.
-- Catalogue keys are added, never renamed (`pathways.test.ts`); a section never moves stage; a work key never changes meaning; a shipped work row is never removed (literal ledgers, never derived from the data). An ordinary key matches per stage (`stageId`+`catalogKey`); only a declared work key crosses stages.
+- Catalogue keys are added, never renamed (`pathways.test.ts`); a section never moves stage; a work key never changes meaning; a shipped work row is never removed (literal ledgers, never derived from the data). An ordinary key matches per stage (`stageId`+`catalogKey`); only a declared work key crosses stages. Of two folders of one family, a preserved key goes to the one with real content, never merely the lower ordinal.
 - One musical work is one repertoire item. Identity is DECLARED (`courseWorkKey`, `carriedCourseWorkItem`), never matched by name, ZWNJ or space; only an entry naming one work becomes repertoire, never a drill, an aid or two works. Material is composed from the catalogue (deduplicated by path, never basename) and opened where it lives; contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list. Guidance is copied into notes once; regeneration never rewrites notes or stored fields.
 - Only the owner adds levels or shipped defaults, offered by deterministic id (`offeredCourseLevels`, `offeredDefaultPathways`), added only when chosen, never on load, hydration, import or sync; `reseedDefaultPathways` never adds a stage to an existing pathway; `seedInstrumentIds` never reads Setar or Guitar as Tar.
 - Routine fitting (`fitRoutineToMinutes`) never reuses `allocateMinutes` and names its drops honestly (`describeFitDrop`). Khonyagar ships no routine and creates no `Lesson`; nothing may claim the Session Plan follows its guide. A Khonyagar item carries no Persian identity inferred from a title.
@@ -131,7 +131,7 @@ Numbers: `docs/scheduling-evidence.md`. One pure decision, `decideReview` (`sche
 
 ## The Session Plan is a view over real blocks
 
-`plan.ts` reuses the same `scoreItems` priorities, never a second ranking: no scores, no "optimal" claims, its evidence never dressed up as an optimum. Minutes never exceed the budget; a budget outside 5-120 is rejected, never clamped (`validateBudgetMinutes`); one `isProactiveCandidate` policy and one `candidatePool` serve build and swap; resting material never surfaces, even by fallback; warm-up is a role for familiar easy items, never a due review or class commitment; a diversity preference stays subordinate to real needs. A plan is stale when `rev` or the local day moves; Start rechecks the day and refuses visibly. It runs real blocks, revalidating each segment's item at start; skipping logs nothing.
+`plan.ts` reuses the same `scoreItems` priorities, never a second ranking: no scores, no "optimal" claims, its evidence never dressed up as an optimum. Minutes never exceed the budget; a budget outside 5-120 is rejected, never clamped (`validateBudgetMinutes`); one `isProactiveCandidate` policy and one `candidatePool` serve build and swap; resting material never surfaces, even by fallback; warm-up is a role for familiar easy items, never a due review or class commitment; a diversity preference stays subordinate to real needs. A plan is stale when `rev` or the local day moves; Start rechecks the day and refuses visibly. It runs real blocks, revalidating each segment's item at start; skipping logs nothing. The running plan (`activePlan`, `planMinutesByInstrument`) is store state, never in `PracticeDB`, sync or a backup.
 
 ## Device, sync and infrastructure
 
@@ -140,12 +140,12 @@ Numbers: `docs/scheduling-evidence.md`. One pure decision, `decideReview` (`sche
 - **Secrets** (r-secrets-stay-on-device): the GitHub token (scoped to the one data repo) and NAS base URL live only in this browser's localStorage, never in exports, backups or sync.
 - Keep storage roles distinct: IndexedDB (truth), GitHub sync (transport, never the only backup), NAS backup (independent export), NAS recordings (media).
 - Repository tools change only what they can prove they wrote (a folder they created, a marker's claims, a scanner's own output; a path's name proves nothing), never delete, never write through a link and never exit 0 without running. `docs/nas-topology.md` maps what each path reaches; `scripts/nas-mirror.mjs` is an optional HTTPS mirror for an unmerged build, never the primary.
-- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`, never `height: 100%`; installed standalone `100vh`, owner-passed on iOS 27). `viewport.ts` judges keyboard drift by geometry, never focus, never touching `<main>`'s scroll; diagnose from traces, never guesses. Five equal nav tabs; Today owns Start; a catalogue row shows its status once. The service worker prompts (in-app Reload), never a reinstall. The build ships a CSP of self plus api.github.com only.
+- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`, never `height: 100%`; installed standalone `100vh`, owner-passed on iOS 27). `viewport.ts` judges keyboard drift by geometry, never focus, never touching `<main>`'s scroll, restoring only at full height and scale 1, never while the viewport is short or zoomed; diagnose from traces, never guesses. Five equal nav tabs; Today owns Start; a catalogue row shows its status once. The service worker prompts (in-app Reload), never a reinstall. The build ships a CSP of self plus api.github.com only.
 - Canonical names: practice item, Study source, Pathways / My repertoire / Practice list, "Add practice item", "Based on / reference", "Connect it (optional)"; links never duplicate the item.
 
 ## Architecture and tests
 
-- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now` (r-pure-tested-domain). Recommendations carry a one-sentence reason from the numbers that ranked them. Only the store (blobs: `attachments.ts`) mutates app data; components never touch IndexedDB; a patch tells an omitted field from an empty one by key presence, never `??`. One file per route under `src/pages/`; pure helpers go in non-component modules.
+- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now` (r-pure-tested-domain). Recommendations carry a one-sentence reason from the numbers that ranked them. Only the store (blobs: `attachments.ts`) mutates app data; components never touch IndexedDB or rebuild domain objects by hand; a patch tells an omitted field from an empty one by key presence, never `??`. One file per route under `src/pages/`; pure helpers go in non-component modules.
 - Every inbound database (both persist `migrate` and `merge`, import, sync pull, Keep remote, archive restore, cold-start recovery) runs `validateDB` (`io.ts`) and its migrations, which read no clock and guess nothing; a new collection goes in its `ARRAY_KEYS` and returned object; schema changes bump `SCHEMA_VERSION` (now 15). A refused hydration leaves memory and disk untouched: its throw is never caught, `hydrated` never forced open, nothing set through `setState`; recovery (`importFullBackup`, never a second importer) is offered only for invalid, never too-new, data.
 - Colour contrast is checked by `contrast.test.ts`; change a light token in both of its blocks, and only one that fails a listed pair.
 - `npm test` must pass; update tests with any scoring or scheduling change. Browser journeys are Vitest tests using Playwright as a library (own dev server and context, no live GitHub or NAS; GitHub faked at `fetch`), driving controls by role and name, never a debug hook or source regex; a missing browser fails them, never skips (`npx playwright install chromium webkit`). WebKit cannot store a Blob in IndexedDB under automation, so its journeys seed state-only. Harness (`tests/practiceBrowser.ts`; read `DECISIONS.md` 2026-09-29 first): keep every page error, never `goTo` the current route, `connectSync` waits for an enabled Sync now, one private Vite cache per server, the fake GitHub remembers `main` after bootstrap, a cold-start timeout is a question, never a number to raise.
diff --git a/DECISIONS.md b/DECISIONS.md
index 598f5a1f783317bb6174ebe3994b6227b7beb502..ce02af3d6b05d83647fbba8fe21dd92da80ba7e8 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -25,9 +25,11 @@ counterexamples, measurements and rejected attempts were deleted, not relocated:
 
 **Prohibitions stay loaded.** The first pass left some agent-facing prohibitions only in a runbook
 or a code comment, and review rejected that: a session that never opens the doc never sees the
-ban. A sweep of all 25 baseline sections restored every one, and `tests/agent-context.test.ts`
-anchors the 83 restored phrases. The cost is headroom: the Claude profile is now 31,469 of
-32,768 bytes (about 1.3 KiB free, down from 2 KiB), with each rule on one line. The cap still
+ban. A sweep of all 25 baseline sections restored 83; a second review found six more, each a
+rule whose main clause survived while a second negated qualifier did not (`nor`, `never merely`,
+`never while`, `or ... by hand`), so the second sweep read the baseline for exactly that shape.
+`tests/agent-context.test.ts` anchors all 89 phrases. The cost is headroom: the Claude profile is
+now 31,926 of 32,768 bytes (842 free, down from 2 KiB), with each rule on one line. The cap still
 holds in `npm test`; the next lane makes room by condensing in place.
 
 **Disposition.** Lines are 56789a8's AGENTS.md. "A:" is a heading in the new AGENTS.md, which
@@ -37,14 +39,14 @@ row also dropped its review narrative, which the dated entries below already rec
 | Baseline section (lines) | Rules now live | Dropped as stale |
 | --- | --- | --- |
 | The one rule above all (6-18) | A: The core loop | - |
-| One canonical home, v13 (19-160) | A: Practice information has one home per kind; `practiceInformation.ts`, `ItemNotes.tsx` (editor), `backup.ts` and `io.ts` (attachment doors) comments | - |
+| One canonical home, v13 (19-160) | A: Practice information has one home per kind (incl. never a ref an effect mirrors); `practiceInformation.ts`, `ItemNotes.tsx` (editor), `backup.ts` and `io.ts` (attachment doors) comments | - |
 | Keep admin overhead low (161-167) | A: Quick start, low admin | - |
 | Prioritise the quick-start flow (168-183) | A: Quick start, low admin | - |
 | Today is a session workspace (184-217) | A: Today is a session workspace (owner decisions 2026-08-28, 2026-09-11) | - |
 | Review actions (218-300) | A: Closing a block and review actions; `CloseBlock.tsx`, `format.ts` comments; due-review row in `Today.tsx` | - |
 | Nothing replaces an unfinished session (301-424) | A: Unfinished practice is never replaced; `practiceSession.ts`, `backup.ts`, `githubSync.ts`, `App.tsx` (deferred retry), `useStore.ts` (`installDatabase`) comments | - |
 | Practice totals (425-455) | A: Practice totals; `selectors.ts` comments (balance denominator) | - |
-| Hands-free practice (456-573) | A: Hands-free practice; `screenAwake.ts`, `useScreenAwake.ts` (audio, gesture unlock), `practiceSignal.ts`; secure-context table in docs/setar-archive.md §5 | - |
+| Hands-free practice (456-573) | A: Hands-free practice (incl. audio never unlocked on the practice screen); `screenAwake.ts`, `useScreenAwake.ts` (audio, gesture unlock), `practiceSignal.ts`; secure-context table in docs/setar-archive.md §5 | - |
 | Hard "do nots" (574-603) | A: Hard do-nots; A: Device, sync (Sync); transport steps in `syncEngine.ts`, `gitRemote.ts` | - |
 | The Pathway is a trust anchor (604-811) | A: Pathways, routines and repertoire; docs/repertoire-experience.md (reader/writer matrix, source kinds, the three views, URL state, grouping); seed list in `pathwaySeed.ts`; `routines.ts`, `useStore.ts`, `RoutineRunner.tsx`, `musicTerms.ts`, `pathwaySeed.ts` comments | - |
 | Lessons and the deadline exception (812-846) | A: Lessons, the agenda and NAS references; `recordings.ts` (resolver); `Lessons.tsx` (class number, video-first order) | The one-tap Setar class import and `npm run scan:setar` regenerating `SETAR_CLASS_SESSIONS`: replaced by Refresh Setar archive; `setarClasses.ts` is a frozen ledger (docs/setar-archive.md §6) |
@@ -52,13 +54,13 @@ row also dropped its review narrative, which the dated entries below already rec
 | Persian text, direction-aware (999-1636) | A: Direction-aware text (incl. `dir` written literally, never computed); A: Architecture and tests (WebKit harness); `direction.test.ts` ledgers and comments (headings, lone titles, label-first rows, the two `UNEXEMPTED_PHRASE_ALLOWLIST` exceptions with reasons); `farsi.ts`; `tests/practiceBrowser.ts` | Eleven findings' narratives and the scanner's own bug history (fixed in `direction.test.ts`) |
 | Everything the app already knows (1637-1747) | A: Material reaches you where you are (incl. never a panel, viewer or dashboard; nothing touches a minute, the wake lock or an announcement); composition order in `itemFiles.ts`; `recordings.ts`, `selectors.ts` comments; Files list in `ItemDetail.tsx` | - |
 | The Setar archive is a SOURCE (1748-2225) | A: The Setar archive is a source (incl. the scanner's symlink, read-failure and rename-loop bans, roster, alias and blob bans); docs/setar-archive.md §2, §5, §6; `scan-setar-classes.mjs`, `sourceArchive.ts`, `sourceReconcile.ts` comments | - |
-| A COURSE is reference data in code (2226-2638) | A: Courses are reference data in code (incl. scanner never reachable from runtime; contrast cards never a viewer, flashcard player or deck list); docs/cgs-course.md §2-§6 (routine proportions §4); `courseSeed.ts`, `pathwaySeed.ts` (offered defaults), `routines.ts` (`fitRoutineToMinutes`) comments | - |
+| A COURSE is reference data in code (2226-2638) | A: Courses are reference data in code (incl. scanner never reachable from runtime; contrast cards never a viewer, flashcard player or deck list; a preserved key never goes merely to the lower ordinal); docs/cgs-course.md §2-§6 (routine proportions §4); `courseSeed.ts`, `pathwaySeed.ts` (offered defaults), `routines.ts` (`fitRoutineToMinutes`) comments | - |
 | The Khonyagar Tar course (2639-2717) | A: Courses are reference data in code; docs/khonyagar-course.md | - |
 | Review scheduling (2718-2881) | A: Review scheduling stays explainable; docs/scheduling-evidence.md §6-§7; `scheduling.ts`, `format.ts` comments | - |
-| The Session Plan (2882-2994) | A: The Session Plan is a view over real blocks (incl. no "optimal" claims); docs/scheduling-evidence.md §1-§5; `plan.ts`, `SessionPlan.tsx` (day staleness) | - |
-| Device & infrastructure (2995-3072) | A: Device, sync and infrastructure; docs/nas-topology.md; `viewport.ts`; `vite.config.ts` (CSP, base, prompt-mode worker, build stamp); `Layout.tsx` (equal tabs, scroll to top, per-route widths with `global.css`, which also holds the fonts); `App.tsx` (sync triggers); `Settings.tsx` (sync status, restore); catalogue row grid in `global.css` (`.stage-unit`) with its one status line in `StageDetail.tsx`, detach under Connected to in `ItemDetail.tsx` | - |
+| The Session Plan (2882-2994) | A: The Session Plan is a view over real blocks (incl. no "optimal" claims; the running plan never in `PracticeDB`, sync or a backup); docs/scheduling-evidence.md §1-§5; `plan.ts`, `SessionPlan.tsx` (day staleness) | - |
+| Device & infrastructure (2995-3072) | A: Device, sync and infrastructure (incl. no viewport restore while short or zoomed); docs/nas-topology.md; `viewport.ts`; `vite.config.ts` (CSP, base, prompt-mode worker, build stamp); `Layout.tsx` (equal tabs, scroll to top, per-route widths with `global.css`, which also holds the fonts); `App.tsx` (sync triggers); `Settings.tsx` (sync status, restore); catalogue row grid in `global.css` (`.stage-unit`) with its one status line in `StageDetail.tsx`, detach under Connected to in `ItemDetail.tsx` | - |
 | Colour is checked by a test (3073-3092) | A: Architecture and tests; `contrast.test.ts` comments | - |
-| Architecture rules (3093-3138) | A: Architecture and tests; per-version detail in `migrations.ts` | - |
+| Architecture rules (3093-3138) | A: Architecture and tests (incl. components never rebuild domain objects by hand); per-version detail in `migrations.ts` | - |
 | Tests are not optional (3139-3180) | A: Architecture and tests; `vite.config.ts` (journeys run inside Vitest); `tests/practiceBrowser.ts`; fixture roles in the journeys' own comments | - |
 | Roadmap items are allowed (3181-3186) | A: Architecture and tests | - |
 
diff --git a/tests/agent-context.test.ts b/tests/agent-context.test.ts
index 2039b7f20703ee0415c2757d252a3f8630c5caae..d63c3458e5e9a57db61b5883bdd8c1cdf5977659 100644
--- a/tests/agent-context.test.ts
+++ b/tests/agent-context.test.ts
@@ -63,39 +63,64 @@ const PATH_ROOTS = ['src/', 'tests/', 'scripts/', 'docs/', 'public/', '.github/'
 
 // A code span (or fence) is a backtick run closed by a run of the same length.
 const CODE_SPAN = /(?<!`)(`+)(?!`)([\s\S]*?[^`])\1(?!`)/g;
-// A link destination is `<...>` or a run without spaces; a title may follow it.
-const DESTINATION = String.raw`(<[^>\n]*>|[^\s<>()]+)`;
-const LINK_TARGETS = [
-  new RegExp(String.raw`\]\(\s*${DESTINATION}`, 'g'), // [text](dest "title"), ![alt](dest)
-  new RegExp(String.raw`^ {0,3}\[[^\]\n]+\]:\s*${DESTINATION}`, 'gm'), // [label]: dest "title"
-  /\b(?:href|src)\s*=\s*["']([^"']+)["']/g, // <a href="dest">, <img src="dest">
-];
+// Where a link destination starts: an inline link or image `](`, or a reference definition
+// `]:` read anywhere, so one inside a block quote, a list or any indent is never missed
+// (reading one that is not a definition only checks one more path).
+const DESTINATION_START = /\]\(\s*|\]:\s*/g;
+// An HTML target, quoted or not, in any case; srcset lists several.
+const HTML_TARGET = /\b(href|src|srcset|poster)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
+const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
+
+/** The link destination at `i`: `<...>`, or a run without spaces whose parentheses balance. */
+function destinationAt(text: string, i: number): string {
+  if (text[i] === '<') return /^<([^>\n]*)>/.exec(text.slice(i))?.[1] ?? '';
+  let depth = 0;
+  let end = i;
+  for (; end < text.length && !/\s/.test(text[end]); end++) {
+    if (text[end] === '\\') end++; // an escaped character never opens or closes
+    else if (text[end] === '(') depth++;
+    else if (text[end] === ')' && --depth < 0) break;
+  }
+  return text.slice(i, end);
+}
+
+/** A link target as the path it names: escapes and entities decoded, anchor and query dropped. */
+function targetPath(target: string): string {
+  const unescaped = target.replace(/\\([!-/:-@[-`{-~])|&(#x[0-9a-f]+|#\d+|\w+);/gi, (all, escaped, entity: string) => {
+    if (escaped) return escaped;
+    if (entity[0] === '#') return String.fromCodePoint(entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1)));
+    if (entity in ENTITIES) return ENTITIES[entity];
+    throw new Error(`undecoded entity ${all} in ${target}`);
+  });
+  const path = unescaped.replace(/[#?].*$/, '');
+  try {
+    return decodeURI(path);
+  } catch {
+    return path;
+  }
+}
 
 /**
  * Repository paths AGENTS.md names: every whitespace-separated token of a code span or
- * fence, and every link destination (inline, angle-bracketed, titled, a reference
- * definition, or an HTML href/src). Anchors, queries, line suffixes and trailing
- * punctuation are stripped BEFORE globs are skipped. A backtick left unpaired throws:
- * it would shift every span after it, so the text cannot be read reliably.
+ * fence, and every link target (an inline link or image, a reference definition, an HTML
+ * href/src/srcset/poster). Anchors, queries and, in code, line suffixes and trailing
+ * punctuation are stripped BEFORE globs are skipped. A backtick left unpaired throws: it
+ * would shift every span after it, so the text cannot be read reliably.
  */
 function namedPaths(text: string): string[] {
   const spans = [...text.matchAll(CODE_SPAN)];
   const prose = text.replace(CODE_SPAN, ' ');
   if (prose.includes('`')) throw new Error(`unpaired backtick near: ${prose.slice(prose.indexOf('`'), prose.indexOf('`') + 60)}`);
-  const tokens = [
-    ...spans.flatMap(([, , span]) => span.split(/\s+/)),
-    ...LINK_TARGETS.flatMap((re) => [...prose.matchAll(re)].map(([, target]) => target)),
-  ];
-  const paths = tokens
-    .map((t) => t.replace(/^[<('"]+|[>'"]+$/g, ''))
-    .map((t) => {
-      try {
-        return decodeURI(t);
-      } catch {
-        return t;
-      }
-    })
-    .map((t) => t.replace(/^\.?\//, '').replace(/[#?].*$/, '').replace(/[),.;:]+$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''))
+  const inCode = spans
+    .flatMap(([, , span]) => span.split(/\s+/))
+    .map((t) => t.replace(/^[<('"]+|[>'"]+$/g, '').replace(/[#?].*$/, '').replace(/[),.;:]+$/, '').replace(/(:L?\d+(-L?\d+)?)+$/, ''));
+  const html = [...prose.matchAll(HTML_TARGET)].flatMap(([, name, ...values]) => {
+    const value = values.find((v) => v !== undefined) ?? '';
+    return name.toLowerCase() === 'srcset' ? value.split(',').map((c) => c.trim().split(/\s+/)[0]) : [value];
+  });
+  const linked = [...[...prose.matchAll(DESTINATION_START)].map((m) => destinationAt(prose, m.index + m[0].length)), ...html].map(targetPath);
+  const paths = [...inCode, ...linked]
+    .map((t) => t.replace(/^\.?\//, ''))
     .filter((t) => PATH_ROOTS.some((root) => t.startsWith(root)) && !/[*{[]/.test(t));
   return [...new Set(paths)];
 }
@@ -147,13 +172,41 @@ it('namedPaths reads a repository path out of every Markdown form that can name
     ['`src/**/*.ts` `src/{a,b}.ts` `src/[id].ts`', []],
     ['`README.md` [x](https://example.com/src/a.ts) `importFullBackup(text, intent)`', []],
     ['`[x](docs/a.md)`', []],
+    // Balanced and escaped parentheses belong to the destination; the link's own close does not.
+    ['[t](docs/(a).md)', ['docs/(a).md']],
+    ['[t](docs/a(b(c)).md "Guide")', ['docs/a(b(c)).md']],
+    ['[t](docs/a\\(b.md)', ['docs/a(b.md']],
+    ['(see [t](docs/a.md))', ['docs/a.md']],
+    ['![alt](public/(i).png)', ['public/(i).png']],
+    ['[ref]: docs/(a).md', ['docs/(a).md']],
+    // A reference definition inside any container, or with its destination on the next line.
+    ['> [ref]: docs/a.md', ['docs/a.md']],
+    ['- [ref]: docs/a.md', ['docs/a.md']],
+    ['1. > - [ref]: <docs/a.md>', ['docs/a.md']],
+    ['- item\n\n      [ref]: docs/a.md', ['docs/a.md']],
+    ['[ref]:\n  docs/a.md', ['docs/a.md']],
+    // HTML targets unquoted, in any case, and every srcset candidate.
+    ['<a href=docs/a.md>a</a> <img src=public/i.png>', ['docs/a.md', 'public/i.png']],
+    ["<IMG SRC = 'public/i.png'>", ['public/i.png']],
+    ['<img srcset="public/a.png 1x, public/b.png 2x"> <video poster=public/p.png>', ['public/a.png', 'public/b.png', 'public/p.png']],
+    // Entities and backslash escapes decode before the path is read.
+    ['[t](docs&#47;a.md) <a href="docs&#x2F;b.md">', ['docs/a.md', 'docs/b.md']],
+    ['[t](docs/a&amp;b.md) [u](docs/\\_c.md)', ['docs/a&b.md', 'docs/_c.md']],
+    // The 2026-10-01 review's counterexamples, each naming a file that is not the existing prefix.
+    ['[missing](docs/(reviewer-missing).md)', ['docs/(reviewer-missing).md']],
+    ['[missing]: docs/(reviewer-missing).md', ['docs/(reviewer-missing).md']],
+    ['![missing](public/(reviewer-missing).png)', ['public/(reviewer-missing).png']],
+    ['[missing](docs/cgs-course.md(reviewer-missing))', ['docs/cgs-course.md(reviewer-missing)']],
+    ['> [missing]: docs/reviewer-missing.md', ['docs/reviewer-missing.md']],
+    ['<a href=docs/reviewer-missing.md> <img src=public/reviewer-missing.png>', ['docs/reviewer-missing.md', 'public/reviewer-missing.png']],
   ];
   for (const [markdown, expected] of cases) expect(namedPaths(markdown), markdown).toEqual(expected);
   expect(() => namedPaths('`docs/a.md` and a stray ` tick')).toThrow(/unpaired backtick/);
+  expect(() => namedPaths('[t](docs&sol;a.md)')).toThrow(/undecoded entity/);
 });
 
-// Every agent-facing prohibition the 2026-10-01 rework restored from the baseline
-// (56789a8) sweep, one short exact phrase each. Condensing may reword around them; deleting
+// Every agent-facing prohibition the 2026-10-01 reworks restored from the baseline
+// (56789a8) sweeps, one short exact phrase each. Condensing may reword around them; deleting
 // one fails here. A rule that genuinely changes edits its phrase here in the same lane.
 const RESTORED_PROHIBITIONS = [
   // Practice information, closing a block, unfinished practice, totals, hands-free
@@ -248,6 +301,13 @@ const RESTORED_PROHIBITIONS = [
   'its throw is never caught, `hydrated` never forced open, nothing set through `setState`',
   'never a second importer',
   'only one that fails a listed pair',
+  // The second sweep (a sentence whose main clause survived but a second negated qualifier did not)
+  'never a closure or a ref an effect mirrors',
+  'audio unlocks on the page that starts the clock, never on the practice screen',
+  'a preserved key goes to the one with real content, never merely the lower ordinal',
+  '`planMinutesByInstrument`) is store state, never in `PracticeDB`, sync or a backup',
+  'never while the viewport is short or zoomed',
+  'components never touch IndexedDB or rebuild domain objects by hand',
 ];
 
 it('AGENTS.md keeps every agent-facing prohibition restored from the baseline sweep', () => {
```

**Paths the rework touched:**

- `AGENTS.md`
- `DECISIONS.md`
- `tests/agent-context.test.ts`

**The builder's rework commit messages — claims to verify against the diff, never evidence:**

```
174b4b9 Rework: keep each rule's second negated qualifier loaded; read every link-destination form

Family always-loaded-prohibition-preservation
Invariant: every agent-facing negation in 56789a8:AGENTS.md survives in AGENTS.md, including
a qualifier that rides on a rule whose main clause was kept.
Method change: the first sweep matched rules by their main clause, so a sentence counted as
kept even when a second negation in it (nor, never merely, never while, or ... by hand) was
dropped. The second sweep grepped the baseline for that shape. Restored, each by extending the
clause already in place: an effect-mirrored notes ref; audio unlock on the practice screen; a
preserved course key by lower ordinal; planMinutesByInstrument in PracticeDB, sync or backup;
viewport restore while short or zoomed; components rebuilding domain objects by hand. Checked
clean by the same grep: lessonId neither absent nor resolving (dangling-id rule), the
hydration screen writing nothing (setState rule), focusForItem's third copy (only rule),
generated course data never hand-edited, the routine run's activeRoutine (ephemeral rule).
Guard: the six phrases join RESTORED_PROHIBITIONS (89); deleting any one fails it. The
DECISIONS disposition rows for the six sections name them; the profile is 31,926 bytes.

Family repository-guidance-path-reachability
Invariant: every path a link target names is the one checked, never a prefix of it and
never skipped.
Consumers: namedPaths is the single implementation with one caller (ac-3); its three
extraction branches are now: (1) inline links and images and (2) reference definitions share
destinationAt, which reads <...> or a space-free run with balanced, escapable parentheses at
any depth; definitions are read wherever `]:` occurs, so block quotes, lists and any indent
are covered; (3) HTML href/src/srcset/poster, quoted or not, any case. Link targets decode
backslash escapes and entities (an unknown named entity throws) before anchors/queries go;
trail
… (truncated)
```

## Check against the contract

- [ ] **ac-1** — Meaningful reduction that holds: the Claude profile (CLAUDE.md plus every file it @-imports) and the Codex profile (AGENTS.md alone) each total <= 32,768 bytes, down from 245,540 and 244,675. It fails on the baseline tree and runs in npm test on every push, main included via deploy.yml. Limit: it measures the working tree and @path tokens only; Prismatica's instruction-budget check stays the authority on other import shapes and committed bytes. _(proof: the instructions every agent session loads at the repository root fit in 32768 bytes)_
- [ ] **ac-2** — Required guidance stays in the always-loaded file: AGENTS.md contains the core-loop line (one item · one mode · one focus · one result · one next action), the four hard do-nots (No gamification, No backend, No AI or audio analysis, No guilt) and the 11 owner-approved rule ids, hardcoded in the test rather than read from .prismatica/rules.md so a later rules approval on main cannot break deploy. Deleting any anchor fails it. _(proof: AGENTS.md states the core loop, every hard do-not and each owner-approved app rule)_
- [ ] **ac-3** — Moved guidance stays reachable: every path AGENTS.md names in backticks or a link target under src/, tests/, scripts/, docs/, public/ or .github/ exists (anchor and line suffixes stripped, globs skipped); a pointer to a missing file fails it. _(proof: every repository path AGENTS.md names exists)_
- [ ] **ac-4** — In a new Claude Code session started in the lane worktree there is no "...-char limit" notice, /doctor shows no large instruction-file warning, /context shows the memory-files figure far below main's (note both), and `prismatica doctor` lists both profiles at or under 32,768 bytes with no warning. The owner then picks any two baseline sections and finds each rule in the home the DECISIONS.md disposition table names, or listed there as dropped with a reason. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

_none_

**Possibly affected (shares a mechanic with a detected flow):**

_none_

**What the agent reported:**

_No flows affected — reported by agent at 2026-10-01T22:20:05.480Z._


**Gaps between detected and reported:**

_None — the report matches what was detected._

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20261001-condense-agents-md-into-an-always-loaded-39ca' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20261001-condense-agents-md-into-an-always-loaded-39ca/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory. A finding names an invariant: sweep the repository for every instance of it and list each one found plus the consumers checked clean, in one round — not one counterexample at a time.
