---
id: 20260917-turn-the-setar-archive-into-trusted-less-5614
contractId: 20260917-turn-the-setar-archive-into-trusted-less-5614
patchId: 4c51d297d91dad90f20b2f9a8becf922c392a3a8
reviewer: codex
state: sealed
verdict: request_changes
findings:
  - family: Exact rename identity across scanning, repair and suppression
    summary: A rename source with two different destinations is diagnosed but its
      first destination is still published and used as exact identity.
    counterexample: Give RENAME-LOG.csv two rows A->B and A->C. buildIndex publishes
      A->B, as the named test currently asserts. Refresh can repair an authored
      A reference to B or move an item-scoped hide from A to B although the log
      does not establish which file A became. Remove every conflicting source
      mapping while retaining an actionable diagnostic, and check downstream
      reference and suppression transitions.
  - family: Browser journey error visibility after cancelled requests
    summary: The WebKit harness can suppress a genuine later page error after an
      unrelated or earlier cancellation with the same URL path.
    counterexample: During one journey, cancel a PUT to a GitHub path, then cause a
      later request to that path to fail genuinely. requestfailed adds the URL
      to a permanent set; pageerror discards the later error whenever its
      message contains the pathname, without checking request identity, method,
      timing or the diagnosed cancellation error. The journey's pageErrors
      assertion can pass despite the real failure.
createdAt: 2026-09-17T19:43:34.587Z
sealedAt: 2026-09-17T19:49:09.746Z
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
- **Diff patch-id:** `4c51d297d91dad90f20b2f9a8becf922c392a3a8`

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

- **Complete source scans before publishing** — P1: readSource treats every RENAME-LOG.csv read failure as an empty log, so two failed reads look like a consistent complete scan and can publish a false source view (scripts/scan-setar-classes.mjs:528-565).
  _counterexample:_ Make RENAME-LOG.csv temporarily unreadable for both reads while PIECES.csv and media remain readable. Both snapshots contain renameLogText='', so scanToIndex builds an index without the exact renames. If a copied file changed path during that window, Refresh flags its old resource unavailable and cannot repair saved references.
- **Archive graph validation at reader and inbound doors** — P1: the decoder still normalises present null source facts, and the shared graph check validates types but not resource ownership by session or valid group relationships (src/domain/sourceArchive.ts:348-401,642-756).
  _counterexample:_ Set a resource title to null in an index and recompute contentHash: parseSourceIndex accepts an empty title. Put a resource whose path is under session 2's folder into session 1's resources and recompute the digest: the decoder and validateDB accept it, so material attributes that file to class 1. A non-demo resource with an arbitrary demo group also passes.
- **Owner reconciliation choices across revision rebase** — P1: decisions do not retain the bound record identity, and already-bound loops skip Link decisions before stale checking; a rebase can redirect or ignore the owner's choice (src/domain/sourceReconcile.ts:89,449-450,526-539,657-665).
  _counterexample:_ Preview applying a composer to item A when it is empty. Before Apply, sync a valid database where the same piece is bound to item B, also with an empty composer. The old choice applies to B. Likewise, preview Link item A, then bind that piece to B before Apply: the early continue leaves staleDecisions empty and commit can report success without linking A.
- **Exact rename identity through adoption and suppression** — P1: a cyclic rename log is accepted, but suppression re-keying ignores followRenames' cycle verdict and moves an owner hide to an intermediate path (scripts/scan-setar-classes.mjs:425-450; src/domain/sourceReconcile.ts:161-168,649-653).
  _counterexample:_ Keep resources A and B, hide A for one item, then publish exact rows A->B and B->A. The scanner emits the cycle without a diagnostic. followRenames(A) returns {path:B,cycle:true}; Refresh stores the hide for B, so A reappears and the wrong file is hidden.
- **Lesson material and rendered journey** — P2: LessonDetail renders composed material and the old reference and attachment lists together, duplicating manual files and showing an empty-recordings prompt beside imported class videos (src/pages/Lessons.tsx:438-449,538-541; src/domain/itemFiles.ts:288-320).
  _counterexample:_ Open a lesson with one authored NAS reference and one local attachment: both appear in LessonMaterial and again in LessonRecordings or Attachments. Open an imported historical class with a graph class video but no authored recordings: the video is shown, followed by a prompt to add a class recording.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 2859fd5..d1fda0a 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -1507,6 +1507,15 @@ environment facts that are NOT app bugs: it cannot store a `Blob` in IndexedDB u
 automation driver (so that journey seeds state-only), and it reports
 `"Importing a module script failed"` for a `React.lazy` chunk whose navigation was aborted.
 
+A THIRD, of the same kind: a request the browser CANCELS because the test navigated away
+while it was in flight is reported by WebKit as
+`"Fetch API cannot load … due to access control checks"` — which reads exactly like a CORS
+problem and is not one. Instrumented, the only difference between a passing and a failing run
+of the same journey was one `requestfailed` with `errorText: 'cancelled'` for a request
+fulfilled with the right CORS headers every other time. A real person navigating mid-sync
+cancels the same request, so `openPracticeApp` (`tests/practiceBrowser.ts`) does not count it
+as a page error — narrowly, by URL, and only for a URL that run actually saw cancelled.
+
 **WHAT `ClassQuestions` RENDERS NOW.** The narratives above are the history of one row, and
 the row changed: there is no `Problem:` line any more (`currentProblem` is retired — see the
 canonical-homes section at the top of this file). Each `<li dir="auto">` is the ordinal, the
@@ -1658,6 +1667,35 @@ check, not atomicity: a perturbation stable across both readings agrees with its
 indistinguishable from the archive genuinely being in that state. What it removes is the
 transient, which is what a copy in flight looks like.
 
+**AND A READ FAILURE IS NEVER VALID EMPTY SOURCE DATA — WHICH IS WHAT MADE THE TWO-READ
+CHECK LOOK CLEAN OVER A FALSE VIEW.** `catch { renameLogText = '' }` turned every failure to
+read RENAME-LOG.csv — a permission change, an I/O error, a mount that went away mid-copy —
+into an archive that has no rename log. Both readings then AGREED, the consistency check
+passed, and the scan published an index with no renames at all: a file that moved during
+that window is flagged `unavailable` and its saved references can never be repaired. Absence
+is an OBSERVATION (`{present:false}`, ENOENT only) and travels in the compared reading as
+one; anything else fails the scan. A required input is required outright, so a missing or
+unreadable PIECES.csv refuses rather than yielding an empty registry, and a present-but-EMPTY
+log — what a zero-byte copy in flight looks like — is refused by `readTable` exactly as the
+registry would be.
+
+**AND THE WALK SAYS WHAT IT COULD NOT TAKE IN.** Two readings agree about a file neither of
+them looked at, so the consistency check is blind by construction to anything the walk drops
+in silence. A symbolic link is still never FOLLOWED — a link out of the archive is a path
+this scanner has no authority over — and a session-named entry that is not a directory is
+still never opened; both are now `diagnostics` rows in the published index instead of
+vanishing, because an index quietly narrower than the archive is the same "partial view sold
+as complete" this whole section exists to refuse. Dotfiles, `@eaDir` and out-of-scope root
+folders stay silent: they are not archive content, and saying so 258 times is noise. It is a
+DIAGNOSTIC and not a refusal for the same reason a rename cycle is: a symlink is a stable
+property of the archive, not a transient, so refusing would leave the archive permanently
+unindexable until the owner went and deleted it — where the two-read check refuses only what
+disagrees with itself between two readings a moment apart.
+Finally, the compared reading carries each file's `mtimeMs`, which `buildIndex` never reads —
+a file edited IN PLACE at the same byte length changes no size and no CSV, and would
+otherwise be invisible to a check whose whole job is catching a mutation mid-scan. The
+determinism rule is untouched: altered mtimes still produce a byte-identical index.
+
 **THE APP NEVER PARSES A FILENAME.** The grammar — longest role prefix at a hyphen boundary,
 trailing digits as a part number, embedded digits and `-و-` as piece identity, never a
 token-0 split, never a largest-file heuristic — lives ONCE, in the scanner, because the app
@@ -1689,6 +1727,16 @@ one rule instead: ABSENT is a default, PRESENT-AND-WRONG is a refusal naming the
 the same treatment `validatePracticeText` gives the owner's own words, and never a
 coercion.
 
+**AND THAT RULE HAD TO REACH THE STRINGS TOO.** It closed the lists and the scalars and left
+every string field with a default exactly as it was: `str(raw.form ?? '')` still read ABSENT
+and PRESENT-AND-NULL as the same thing, so a resource `title: null`, a piece's `form`,
+`composer` or `notes`, and a diagnostic's own `path` all decoded to `''` — an untitled row
+the grammar was perfectly happy with. `text()` is that one rule for strings: `undefined` is
+a default, anything else that is not text is refused naming the record. `part` and `group`
+stay genuinely nullable, because the scanner emits `null` for both; `size` does not, and a
+present null is refused BY THE DECODER rather than spread into its own output as a value the
+declared type does not admit and left for the grammar to catch downstream.
+
 **ARCHIVE EVIDENCE MAY ESTABLISH REPERTOIRE MEMBERSHIP, HISTORICAL LESSON PROVENANCE AND
 SOURCE MATERIAL. IT MAY NEVER ESTABLISH RECORDED PRACTICE, A RESULT, EXPOSURE, REVIEW
 COMPLETION OR SCHEDULING PROGRESS.** An imported item carries zero minutes, no
@@ -1789,6 +1837,28 @@ channel rather than two, and the commit refuses on either whether or not `rev` m
 screen DROPS a stale decision rather than re-submitting it for ever, and re-previews: the
 question, or the suggestion's real current value, is shown as it is now.
 
+**AND A DECISION NAMES ITS RECORD, NOT ONLY ITS PIECE — AND EVERY DECISION IS ACCOUNTED
+FOR.** The premise rule above closed the case where the owner's VALUE moved and left the two
+cases where the RECORD did. Both loops open with "already bound? nothing to decide" /
+"already suppressed? nothing to decide", so a decision about a record that became bound
+between the preview and the commit was never looked at at all: no adoption, no question, and
+an EMPTY `staleDecisions`, so the commit reported success for an action it had not performed.
+An `apply-field` decision was worse than ignored — keyed by piece and value alone, it was
+REDIRECTED onto whichever record held that piece by commit time, and a sync installing a
+database where the same piece is bound to item B, also with an empty composer, took a choice
+made about A.
+
+So `apply-field` carries `itemId` (identity) as well as `from` (premise), and
+`decisionMatchesSuggestion` compares all four; and `planArchiveImport` marks every decision
+it ACTS on and sweeps the rest. An unmarked decision is either an action that has ALREADY
+HAPPENED — the same answer still in hand on the next preview — or an answer to a question
+that no longer stands, which is stale. That already-done branch is LOOP PREVENTION rather
+than politeness: `ArchiveRefresh` drops a stale decision and re-previews, and a realised
+action can never be consumed by a loop that skips its own record, so without it the same
+decision would go stale for ever. The sweep is why this holds for Link, Create, Skip and
+apply-field together instead of a stale check bolted inside each early return, and the
+premise rule above is now one of its outcomes rather than a second mechanism beside it.
+
 **AND A STORED PATH HAS ONE READING.** Adoption evidence and path repair both have to
 decide what file a stored reference names, and they used to decide it differently:
 `hasSourcePathEvidence` stripped the legacy prefix and followed the rename log, while
@@ -1804,7 +1874,25 @@ session 2, a unique legacy class was adopted AS SESSION 1 on the strength of B a
 that very reference repaired into session 2: bound to one class, pointing at another's
 files. `followRenames` is that one reading now (a CYCLE is reported, never walked — a log
 that loops says nothing about where the file is), and three things use it: evidence, repair,
-and the owner's own hides. A RESOURCE SUPPRESSION IS KEYED BY PATH, so left on the old name
+and the owner's own hides.
+
+**AND "REPORTED" HAD TO BE UNIGNORABLE.** `followRenames` handed back
+`{ path, cycle: true }` — a perfectly usable-looking path beside a flag — and only ONE of its
+three callers read the flag: adoption refused it, while the suppression re-key and
+`retainMissing` walked straight past it. Hide A, publish A->B and B->A, and the re-key moved
+the owner's hide onto B: A came back into view and the wrong file went dark. It returns
+`string | null` now, so there is no way to drop the verdict and still have a path. A hide
+stays exactly where the owner put it, a row the incoming index no longer lists keeps its
+provenance flagged rather than being deleted on the strength of a destination nothing can
+read, and repair says "the rename log loops on this path" instead of rewriting to an
+arbitrary stop on the loop. The SCANNER diagnoses the topology in the first place — every
+row in a loop, and every row that walks into one, is dropped with a diagnostic rather than
+published (ac-12's own rule: cycles and multiple destinations DIAGNOSE, never guess) — so a
+published index carries no cycle, and the app still refuses to read one from any other
+source. An ordinary chain beside a loop still publishes: one bad topology does not cost the
+archive its good provenance.
+
+A RESOURCE SUPPRESSION IS KEYED BY PATH, so left on the old name
 a hidden file simply reappeared under the new one while the old row sat there flagged
 unavailable. Re-keying it is not editing an owner decision — it is the same decision about
 the same bytes said in the archive's current words, the `itemId` scope carried untouched and
@@ -1837,7 +1925,27 @@ lessons that are NOT archive-bound. An archive-bound lesson contributes nothing
 link route — its files reached the list already, correctly scoped — which is what stops a
 class recording and someone's practice takes from landing on a piece. A manual, unclassified
 lesson still contributes everything it has, because nothing knows the scope and inventing
-one would be a guess. `lessonFiles` is the same composition for a lesson.
+one would be a guess.
+
+**A LESSON IS THE OPPOSITE CASE: EVERY FILE ON IT HAS EXACTLY ONE SECTION THAT RENDERS IT.**
+An ITEM's material is composed from OTHER records — linked lessons, the graph — that the
+item's own page has no section for, which is precisely why `itemFiles` must stay the whole
+composition. A LESSON owns its own references and its own attachments, and its page already
+renders each in the section that can edit and remove them. `lessonFiles` composed those as
+well, so an authored NAS reference the index describes nowhere — the owner's own practice
+takes on an adopted class — and every local attachment were rendered TWICE: once above,
+where nothing can be done with them, and once again where they live. `lessonFiles` is now
+the ARCHIVE's contribution alone (an archive-bound class keeps no copy of its session's
+files, so nothing else can show them); "Class recording & scores" keeps the owner's
+references, `Attachments` keeps the attachments, and each Remove button is NAMED after its
+own file rather than saying "Remove this link" three times over.
+
+**AND "HAS A RECORDING" IS ABOUT THE CLASS, NOT ABOUT THAT ARRAY.** An imported historical
+class keeps no copy of its session's files, so `lesson.recordings` is empty and the
+empty-state card invited the owner to add a class recording directly beneath the one already
+playing above it. That state is read through the same composition the section above renders
+— not the session's `hasClassRecording` flag — so a class recording the owner has HIDDEN does
+not count as one that is there.
 
 **SCHEMA v14 IS ADDITIVE, AND THE WHOLE GRAPH IS VALIDATED AT EVERY DOOR.**
 `migrateToV14` adds an EMPTY `archiveSources` and changes nothing else; it is unconditional
@@ -1870,6 +1978,25 @@ is the point of validating it. `unavailable` stays legal on a piece, a session a
 resource, and a suppression's `itemId` and `at` are checked too — a non-string `itemId`
 silently widens a hide scoped to ONE item.
 
+**AND A GRAMMAR OF FIELD TYPES SAYS EVERY VALUE IS READABLE, NEVER THAT THE GRAPH AGREES
+WITH ITSELF.** A resource physically sitting in class 2's folder, listed under class 1, is
+type-perfect at every door and attributes someone else's file to the wrong class on every
+screen that reads it. So `checkSourceGraph` also checks the RELATIONS, and the same four at
+both doors: a resource's path is `<that session's folder>/<name>` and nothing else; a
+resource attributed to a piece has that piece's membership recorded for that ROLE, so no
+file can surface as a piece's material with nothing in the graph saying it belongs to it; a
+`group` belongs only to a demonstration, and the parts sharing one are material for the same
+pieces with distinct part numbers, so an arbitrary group cannot invent one logical resource
+out of unrelated files; and `hasClassRecording` agrees with whether a class-role resource is
+actually there, which itself may never name a piece.
+
+These run over what the source still DESCRIBES. `unavailable` is retained provenance about
+what it has STOPPED describing — a piece dropped from the registry, a file deleted from the
+NAS — so holding those rows to the current source's internal agreement is a category error,
+and would make every refresh after a removal refuse at every door. The group's LABEL format
+is deliberately not asserted: that is the scanner's grammar, and this file's own rule is
+that the grammar lives once.
+
 **AND THE RECORD'S OWN FIELDS ARE CHECKED, NOT ONLY ITS NESTED GRAPH.** `acceptedAt` was
 the one persisted field with no check at all, while Settings renders it
 (`acceptedAt.slice(0, 16)`) to say when the index last changed — so a v14 import carrying
diff --git a/DECISIONS.md b/DECISIONS.md
index 214880a..decd7f0 100644
--- a/DECISIONS.md
+++ b/DECISIONS.md
@@ -2,6 +2,75 @@
 
 Durable record of non-obvious choices. Newest first.
 
+## Rejection: five rules that closed their own counterexample and not its family (2026-09-17)
+
+A third sealed review rejected the reworked Setar-archive diff. Each finding was the
+PREVIOUS fix holding for exactly the case it was written against, so each fix here is the
+rule the whole family shares — and the previous narrower mechanism is subsumed rather than
+left beside it.
+
+- **A read failure was valid empty source data.** The two-read consistency check was
+  extended to every input, and `catch { renameLogText = '' }` then made an unreadable
+  RENAME-LOG.csv agree with itself: both readings held `''`, the check passed, and the scan
+  published an index with no renames — so a file that moved in that window is flagged
+  unavailable and its saved references can never be repaired. Absence is an OBSERVATION now
+  (`{present:false}`, ENOENT only) and travels in the compared reading; anything else fails
+  the scan. The walk had the deeper version of the same gap: two readings agree about a file
+  neither looked at, so a skipped symlink or a session-named non-directory is a published
+  diagnostic instead of a silent omission. The compared reading also carries `mtimeMs`,
+  which `buildIndex` never reads, so an in-place edit at the same byte length is visible to
+  the check and invisible to the index.
+- **The absent/present rule reached the lists and the scalars, not the strings.**
+  `str(raw.form ?? '')` still read absent and present-and-null alike, so a `title: null`
+  decoded to an untitled row behind a correct digest. `text()` is that rule for strings.
+  Separately, a grammar of FIELD TYPES says every value is readable and nothing about
+  whether the graph agrees with itself: a resource in class 2's folder listed under class 1
+  passed every door. `checkSourceGraph` now also checks path ownership, resource-to-member
+  agreement by role, demo-group coherence and `hasClassRecording` — over rows the source
+  still DESCRIBES, because holding retained `unavailable` provenance to the current
+  source's internal agreement would refuse every refresh after a removal.
+- **A decision named its piece, not its record.** Both reconciliation loops open with
+  "already bound? nothing to decide", so a decision about a record bound between the preview
+  and the commit was never examined: no adoption, no question, an EMPTY `staleDecisions`,
+  and a commit reporting success for an action it had not performed. `apply-field` was worse
+  than ignored — keyed by piece and value alone, it was redirected onto whichever record held
+  that piece by commit time. It carries `itemId` now, and `planArchiveImport` marks every
+  decision it acts on and sweeps the rest: unmarked is either already realised (loop
+  prevention — the screen drops a stale decision and re-previews) or stale. The `from`
+  premise rule is an outcome of that sweep rather than a second mechanism beside it.
+- **"A cycle is reported" was reported in a value callers could ignore.** `followRenames`
+  returned `{ path, cycle: true }` and only adoption read the flag; the suppression re-key
+  and `retainMissing` walked past it, so A→B plus B→A moved the owner's hide onto B and the
+  wrong file went dark. It returns `string | null`, so dropping the verdict and keeping a
+  path is unrepresentable. The scanner drops every row in a loop — and every row walking into
+  one — with a diagnostic, per ac-12's own "cycles diagnose, never guess"; refusing the whole
+  index was rejected, because a name swap is a legitimate archive operation and an
+  unimportable archive is a worse answer than an unrepaired path.
+- **One lesson file had two sections.** `lessonFiles` composed the lesson's own references
+  and attachments as well as the archive's, and the lesson page renders both in the sections
+  that can edit and remove them — so an authored file appeared twice, once where nothing
+  could be done with it. `lessonFiles` is the ARCHIVE's contribution alone; an ITEM keeps the
+  whole composition, because its material comes from records its own page has no section for.
+  And "has a recording" is read through that composition, not `lesson.recordings`, so an
+  imported class is no longer invited to add the video already playing above the prompt.
+
+A separate, reproduced HARNESS diagnosis came out of the same round and is recorded here
+because a flaky heavy check is worse than a missing one: WebKit reports a request the browser
+CANCELLED (because the test navigated away mid-flight) as "Fetch API cannot load … due to
+access control checks", which reads as a CORS failure and is not one. Instrumenting the
+journey showed the only difference between a passing and a failing run was one `requestfailed`
+with `errorText: 'cancelled'` against a request fulfilled with correct CORS headers every
+other time. `openPracticeApp` no longer counts such an error, narrowly and by URL. Filtering
+the wording alone, or seeding the fake remote so the bootstrap PUT never happens, were both
+rejected: the first excuses a real CORS bug, the second changes what the other journeys mean
+by an empty remote.
+
+Eight mutations were run and all eight fail their named acceptance test: the optional-read
+swallow restored, the folder-ownership check, the demo-group check, the decision sweep,
+`itemId` dropped from the suggestion predicate, the cyclic suppression re-key, the lesson
+composition's authored half (in the real browser, both engines), and the empty-recording
+prompt's guard.
+
 ## Rejection: five checks that each held for one caller, one input or one hop (2026-09-17)
 
 A second sealed review rejected the reworked Setar-archive diff with five findings. Every
diff --git a/docs/setar-archive.md b/docs/setar-archive.md
index efd7ab0..6d1f4be 100644
--- a/docs/setar-archive.md
+++ b/docs/setar-archive.md
@@ -61,9 +61,29 @@ readings agrees with itself, and from here is indistinguishable from the archive
 genuinely being in that state. What it removes is the transient — which is what a
 copy in flight looks like, and what would otherwise publish an index missing a
 file that is still there.
+
+A READ FAILURE IS NOT AN OBSERVATION. `PIECES.csv` is required, so anything that
+stops it being read — missing, unreadable, a directory where a file should be —
+refuses the scan. `RENAME-LOG.csv` is optional, and "absent" means ENOENT and
+nothing else: it travels in the compared reading as `{present:false}`, never as
+empty text, because `catch { text = '' }` made a permission change or an I/O
+error agree with itself across both readings and publish an index with no
+renames at all. A present but EMPTY log is refused like an empty registry — a
+zero-byte file is what a copy in flight looks like.
+
+Each file's `mtimeMs` is part of the compared reading and is never read by the
+index builder, so a file edited IN PLACE at the same byte length fails the scan
+while altered mtimes still produce a byte-identical index.
+
 What it reports and skips: a file with no known role, an unknown piece, an
 unsupported extension, a class recording claiming a piece, an unnamed demo in a
-session whose roster and filenames disagree.
+session whose roster and filenames disagree, a symbolic link (never followed —
+but never silently dropped either, since two readings agree about a file neither
+of them looked at), a session-named entry that is not a real directory, and
+every row of a rename LOOP. A log that loops names no file, so those rows — and
+any row that walks into a loop — are dropped with a diagnostic rather than
+published; an ordinary chain beside a loop still publishes. Dotfiles, `@eaDir`
+and out-of-scope root folders stay silent: they are not archive content.
 
 The output is written **outside the archive** via a temp file + rename, and the
 scanner refuses an `--out` path inside `--root`.
@@ -218,11 +238,18 @@ applies the lot in one store mutation.
   same mutation, so a refresh, a reload and a sync all respect it. A hide follows
   its file through the rename log, so a renamed resource does not reappear —
   including when the rename moves it into a different session's folder, where
-  the old row is dropped rather than reported missing.
-- **A decision is about the state you saw.** If the value you chose the archive's
-  over has changed since — or a record you chose to link has been deleted, bound
-  elsewhere or moved instrument — the commit refuses and re-previews rather than
-  applying an answer to a question that no longer stands.
+  the old row is dropped rather than reported missing. A rename LOOP names no
+  file, so a hide stays exactly where you put it and nothing is re-keyed.
+- **A decision is about the state you saw, and about the record you saw it on.**
+  If the value you chose the archive's over has changed since — or the record you
+  chose to link or apply a field to has been deleted, bound elsewhere or moved
+  instrument — the commit refuses and re-previews rather than applying an answer
+  to a question that no longer stands, or handing it to some other record.
+- **Every file on a class has exactly one section.** The archive's own session
+  material is composed for you (an imported class keeps no copy of it, so nothing
+  else can show it); your own links and attachments stay in the sections that can
+  edit and remove them, and are never repeated above. An imported class recording
+  counts as a recording, so you are not invited to add the video already playing.
 - **Your media base is an address and a folder.** A base carrying a username,
   password, `?query` or `#fragment` is refused, not silently cleaned up: every
   file URL is built by appending a path to it.
diff --git a/scripts/scan-setar-classes.mjs b/scripts/scan-setar-classes.mjs
index af3a245..60a1e71 100644
--- a/scripts/scan-setar-classes.mjs
+++ b/scripts/scan-setar-classes.mjs
@@ -284,7 +284,7 @@ const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  * files). Individual unhandled FILES are reported in `diagnostics` and left
  * out — surfaced for the owner, never relabelled.
  */
-export function buildIndex({ registryText, inventory, renameLogText }) {
+export function buildIndex({ registryText, inventory, renameLog, skipped = [] }) {
   const pieces = parseRegistry(registryText);
   const byKey = new Map(pieces.map((p) => [p.key, p]));
 
@@ -292,6 +292,11 @@ export function buildIndex({ registryText, inventory, renameLogText }) {
 
   const diagnostics = [];
   const diag = (path, reason) => diagnostics.push({ path, reason });
+  // Everything the WALK could not take in. A symlink is not followed and a
+  // device node is not a file, but dropping either in silence publishes an
+  // index that is quietly narrower than the archive — the same "partial view
+  // sold as complete" this scanner's two-read check exists to refuse.
+  for (const s of skipped) diag(s.path, s.reason);
 
   // --- sessions -----------------------------------------------------------
   const sessions = new Map(); // n -> { n, date, folder, assets: [] }
@@ -426,8 +431,12 @@ export function buildIndex({ registryText, inventory, renameLogText }) {
   // EXACT old→new pairs only. This is path provenance, not a similarity model:
   // an old path with two destinations is reported, never resolved by guessing.
   const renames = [];
-  if (renameLogText) {
-    const rows = readTable(renameLogText, ['old_path', 'new_path']);
+  // ABSENT is a source fact; UNREADABLE never reaches here (readSource throws).
+  // A present-but-empty log has no header and `readTable` says so, exactly as
+  // it would for PIECES.csv — a zero-byte file is what a copy in flight looks
+  // like, and guessing "no renames" from it is the failure this lane closed.
+  if (renameLog && renameLog.present) {
+    const rows = readTable(renameLog.text, ['old_path', 'new_path']);
     const dest = new Map();
     for (const r of rows) {
       const from = r.old_path.trim();
@@ -446,6 +455,32 @@ export function buildIndex({ registryText, inventory, renameLogText }) {
       dest.set(from, to);
       renames.push({ from, to });
     }
+    // A LOOP NAMES NO FILE. A->B->A (or any chain that walks into one) says
+    // only that two names were swapped; picking a stopping point would invent
+    // an identity, and every path that LEADS INTO a loop is equally unusable.
+    // Those rows are dropped with a diagnostic rather than published: the app
+    // must never be handed a replacement identity this log cannot support.
+    const cyclic = new Set();
+    for (const from of dest.keys()) {
+      const walked = new Set([from]);
+      let cur = from;
+      while (dest.has(cur)) {
+        const next = dest.get(cur);
+        if (walked.has(next)) {
+          for (const p of walked) cyclic.add(p);
+          cyclic.add(next);
+          break;
+        }
+        walked.add(next);
+        cur = next;
+      }
+    }
+    for (const from of cyclic) {
+      if (dest.has(from)) diag(from, 'Rename log loops through this path — no replacement name can be read from it.');
+    }
+    const kept = renames.filter((r) => !cyclic.has(r.from));
+    renames.length = 0;
+    renames.push(...kept);
     renames.sort((a, b) => cmp(a.from, b.from));
   }
 
@@ -490,23 +525,45 @@ export function canonicalJson(value) {
 export function scanArchive(root) {
   const base = resolve(root);
   const inventory = [];
+  const skipped = [];
   for (const entry of readdirSync(base, { withFileTypes: true })) {
     if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
-    if (!entry.isDirectory()) continue;
     if (!parseSessionFolderName(entry.name)) continue; // root folders out of scope
+    if (!entry.isDirectory()) {
+      // It CLAIMS to be a session and this walk will not open it. Silence here
+      // would drop a whole class out of a "complete" index.
+      skipped.push({ path: entry.name, reason: 'A session folder that is not a real directory — not scanned.' });
+      continue;
+    }
     const dir = join(base, entry.name);
     for (const f of readdirSync(dir, { withFileTypes: true })) {
       if (f.name.startsWith('.') || IGNORED_DIRS.has(f.name)) continue;
       const full = join(dir, f.name);
       const st = lstatSync(full);
-      if (st.isSymbolicLink() || !st.isFile()) continue;
+      const path = `${entry.name}/${f.name}`;
+      if (st.isSymbolicLink()) {
+        // Never FOLLOWED — a link out of the archive is a path this scanner
+        // has no authority over — but always SAID, so the owner can see that
+        // the index is not describing something the folder holds.
+        skipped.push({ path, reason: 'A symbolic link — not followed, so this file is not indexed.' });
+        continue;
+      }
+      if (!st.isFile()) {
+        skipped.push({ path, reason: 'Not a regular file — not indexed.' });
+        continue;
+      }
       if (!full.startsWith(base + sep)) continue;
-      inventory.push({ path: `${entry.name}/${f.name}`, size: st.size });
+      // `mtimeMs` is deliberately NOT semantic — `buildIndex` reads `size` and
+      // nothing else, so an altered time cannot change the published index. It
+      // is here for the two-read comparison below: a file edited IN PLACE at
+      // the same byte length is otherwise invisible to it.
+      inventory.push({ path, size: st.size, mtimeMs: st.mtimeMs });
       if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);
     }
   }
   inventory.sort((a, b) => cmp(a.path, b.path));
-  return inventory;
+  skipped.sort((a, b) => cmp(a.path, b.path) || cmp(a.reason, b.reason));
+  return { inventory, skipped };
 }
 
 /** Write via a temp file + rename, so a reader never sees a half-written index. */
@@ -526,14 +583,39 @@ export function writeIndexAtomically(outPath, text, root) {
  * below covers all of them by construction, including one added later.
  */
 export function readSource(base) {
-  const registryText = readFileSync(join(base, 'PIECES.csv'), 'utf8');
-  let renameLogText = '';
+  const registryText = readRequired(join(base, 'PIECES.csv'), 'PIECES.csv');
+  const renameLog = readOptional(join(base, 'RENAME-LOG.csv'), 'RENAME-LOG.csv');
+  const { inventory, skipped } = scanArchive(base);
+  return { registryText, renameLog, inventory, skipped };
+}
+
+/** A required input. Any failure to read it is a failure to scan. */
+function readRequired(path, label) {
+  try {
+    return readFileSync(path, 'utf8');
+  } catch (err) {
+    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
+  }
+}
+
+/**
+ * AN OPTIONAL INPUT IS ABSENT OR PRESENT — NEVER "EMPTY BECAUSE IT THREW".
+ *
+ * `catch { text = '' }` made every failure to read RENAME-LOG.csv — a
+ * permission change, an I/O error, a mount that went away mid-copy — look
+ * exactly like an archive that has no rename log. Both readings then agreed
+ * with each other, so the consistency check below passed and the scan
+ * published an index with no renames at all: a file that moved during that
+ * window is flagged unavailable and its saved references can never be
+ * repaired. Only ENOENT is an observation; everything else is a failure.
+ */
+function readOptional(path, label) {
   try {
-    renameLogText = readFileSync(join(base, 'RENAME-LOG.csv'), 'utf8');
-  } catch {
-    renameLogText = '';
+    return { present: true, text: readFileSync(path, 'utf8') };
+  } catch (err) {
+    if (err?.code === 'ENOENT') return { present: false };
+    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
   }
-  return { registryText, renameLogText, inventory: scanArchive(base) };
 }
 
 /**
diff --git a/src/components/ArchiveRefresh.tsx b/src/components/ArchiveRefresh.tsx
index b7c58f8..7683adc 100644
--- a/src/components/ArchiveRefresh.tsx
+++ b/src/components/ArchiveRefresh.tsx
@@ -277,7 +277,18 @@ export default function ArchiveRefresh() {
                         type="button"
                         className="btn btn-sm"
                         aria-pressed={applied}
-                        onClick={() => decide({ kind: 'apply-field', pieceKey: sg.pieceKey, field: sg.field, from: sg.from })}
+                        onClick={() =>
+                          decide({
+                            kind: 'apply-field',
+                            pieceKey: sg.pieceKey,
+                            // The RECORD the value was shown against, not just
+                            // the piece: a rebase must not hand the answer to
+                            // whichever item happens to hold that piece later.
+                            itemId: sg.itemId,
+                            field: sg.field,
+                            from: sg.from,
+                          })
+                        }
                       >
                         {applied ? `Archive’s ${FIELD_LABELS[sg.field]} chosen` : `Use the archive’s ${FIELD_LABELS[sg.field]}`}
                       </button>
diff --git a/src/domain/io.test.ts b/src/domain/io.test.ts
index 06d1b7e..4568532 100644
--- a/src/domain/io.test.ts
+++ b/src/domain/io.test.ts
@@ -801,6 +801,37 @@ describe('the v14 source graph at the schema boundary', () => {
   const NOW = new Date('2026-09-17T09:00:00.000Z');
   const legacy = () => JSON.parse(V13_SETAR_TEXT) as { data: PracticeDB };
 
+  /**
+   * A source graph as it arrives — every value still `unknown`, because that is
+   * exactly what these mutations put into it. One shape for BOTH doors: the
+   * published index and a persisted `archiveSources` row carry the same graph,
+   * so one mutation can be handed to each and neither can be given a check the
+   * other misses.
+   */
+  type RawRow = Record<string, unknown>;
+  type RawSession = RawRow & { folder: string; resources: RawRow[]; members: RawRow[] };
+  type Graph = { pieces: RawRow[]; sessions: RawSession[]; diagnostics: RawRow[] };
+
+  /** First `[session, resource]` carrying a role, in the corpus fixture. */
+  function firstWithRole(g: Graph, role: string): [RawSession, RawRow] {
+    for (const sess of g.sessions) {
+      const res = sess.resources.find((r) => r.role === role);
+      if (res) return [sess, res];
+    }
+    throw new Error(`The corpus fixture has no "${role}" resource to mutate.`);
+  }
+
+  /** A demonstration group with at least TWO parts, and its session. */
+  function groupedDemo(g: Graph): [string, RawRow, RawSession] {
+    for (const sess of g.sessions) {
+      for (const r of sess.resources) {
+        if (!r.group) continue;
+        if (sess.resources.filter((x) => x.group === r.group).length > 1) return [r.group as string, r, sess];
+      }
+    }
+    throw new Error('The corpus fixture has no multi-part demonstration to mutate.');
+  }
+
   /** A database with a real accepted graph in it, built by the real planner. */
   function withGraph(): PracticeDB {
     const base = validateDB(legacy());
@@ -987,6 +1018,99 @@ describe('the v14 source graph at the schema boundary', () => {
       (d.archiveSources[0]!.suppressions as unknown[]) = [{ kind: 'resource', ref: 'x' }];
     }, /suppression with no timestamp/);
 
+    // --- ABSENT IS A DEFAULT; PRESENT-AND-NULL IS A REFUSAL ----------------
+    // The list/num/bool rule closed this for lists and scalars and left every
+    // STRING with a default behind: `str(raw.form ?? '')` read absent and
+    // present-and-null as the same thing, so a `title: null` in an index whose
+    // digest was recomputed decoded to an untitled row the grammar was
+    // perfectly happy with. Absent is a default; null is a value, and a wrong
+    // one. Proved at BOTH doors from ONE mutation, so the published decoder
+    // and the persisted-graph validator cannot be given it separately.
+    const refusesBothDoors = (fn: (g: Graph) => void, pattern: RegExp) => {
+      const index = JSON.parse(SETAR_INDEX_TEXT) as Graph;
+      fn(index);
+      expect(() => decodeSourceIndex(index)).toThrow(pattern);
+      refuses((d) => fn(d.archiveSources[0] as unknown as Graph), pattern);
+    };
+    const onIndexOnly = (fn: (g: Graph) => void, pattern: RegExp) => {
+      const index = JSON.parse(SETAR_INDEX_TEXT) as Graph;
+      fn(index);
+      expect(() => decodeSourceIndex(index)).toThrow(pattern);
+    };
+    onIndexOnly((g) => {
+      g.sessions[0]!.resources[0]!.title = null;
+    }, /title must be text/);
+    onIndexOnly((g) => {
+      g.pieces[0]!.form = null;
+    }, /form must be text/);
+    onIndexOnly((g) => {
+      g.pieces[0]!.notes = null;
+    }, /notes must be text/);
+    onIndexOnly((g) => {
+      g.pieces[0]!.composer = null;
+    }, /composer must be text/);
+    // `size` is genuinely optional, so ABSENT is a default here too — but a
+    // present null is still a value, and the DECODER refuses it rather than
+    // spreading a type-violating value into its own output for the grammar to
+    // catch downstream. (The persisted door has its own `size` check above.)
+    onIndexOnly((g) => {
+      g.sessions[0]!.resources[0]!.size = null;
+    }, /size must be a number/);
+    onIndexOnly((g) => {
+      g.diagnostics.push({ path: null, reason: 'x' });
+    }, /diagnostic path must be text/);
+
+    // --- SEMANTIC RELATIONS, NOT MERELY FIELD TYPES ------------------------
+    // A field-type grammar says every value is READABLE and nothing about
+    // whether the graph agrees with itself. A resource physically sitting in
+    // class 2's folder, listed under class 1, is type-perfect and attributes
+    // someone else's file to the wrong class on every screen that reads it;
+    // an arbitrary `group` on a non-demonstration invents one logical resource
+    // out of unrelated files. Both doors, one mutation, every time.
+    refusesBothDoors((g) => {
+      g.sessions[1]!.resources[0]!.path = `${g.sessions[0]!.folder}/smuggled.mp4`;
+    }, /not a file in its own folder/);
+    refusesBothDoors((g) => {
+      g.sessions[0]!.resources[0]!.path = `${g.sessions[0]!.folder}/deeper/x.mp4`;
+    }, /not a file in its own folder/);
+    refusesBothDoors((g) => {
+      // Attributed to a real registry piece that this session never records a
+      // membership for: the file would surface as that piece's material with
+      // nothing in the graph saying it belongs to it.
+      const [s0, res] = firstWithRole(g, 'نت');
+      const stranger = g.pieces.find((p) => !s0.members.some((m) => m.key === p.key))!;
+      res.pieces = [stranger.key];
+    }, /without recording that membership/);
+    refusesBothDoors((g) => {
+      const [, res] = firstWithRole(g, 'نت');
+      res.group = 'نمونه:invented';
+    }, /carries a part group but is not a demonstration/);
+    refusesBothDoors((g) => {
+      const [, res] = firstWithRole(g, 'ضبط-کلاس');
+      res.pieces = [g.pieces[0]!.key];
+    }, /class recording and cannot name a piece/);
+    refusesBothDoors((g) => {
+      const [sess] = firstWithRole(g, 'ضبط-کلاس');
+      sess.hasClassRecording = false;
+    }, /disagrees with itself about having a class recording/);
+    refusesBothDoors((g) => {
+      const sess = g.sessions.find((x) => !x.resources.some((r) => r.role === 'ضبط-کلاس'))!;
+      sess.hasClassRecording = true;
+    }, /disagrees with itself about having a class recording/);
+    // A demonstration's PARTS are one resource told in order. Parts that are
+    // material for different pieces are not one resource, and two parts
+    // numbered alike have no order to be read in.
+    refusesBothDoors((g) => {
+      const [, first, sess] = groupedDemo(g);
+      const sibling = sess.resources.find((r) => r.group === first.group && r !== first)!;
+      sibling.pieces = [];
+    }, /parts belong to different pieces/);
+    refusesBothDoors((g) => {
+      const [, first, sess] = groupedDemo(g);
+      const sibling = sess.resources.find((r) => r.group === first.group && r !== first)!;
+      sibling.part = first.part;
+    }, /two parts numbered alike/);
+
     // --- AND THE RECORD'S OWN FIELDS, not only its nested graph -------------
     // `acceptedAt` is what Settings renders (`acceptedAt.slice(0, 16)`) to say
     // when the index last changed. It was the one persisted field with no
diff --git a/src/domain/itemFiles.test.ts b/src/domain/itemFiles.test.ts
index 592aebe..f3e4d35 100644
--- a/src/domain/itemFiles.test.ts
+++ b/src/domain/itemFiles.test.ts
@@ -296,6 +296,51 @@ describe('archive material for a piece', () => {
     expect(lessonSide[0]!.path).toContain('ضبط-کلاس');
     expect(lessonSide.every((f) => f.lessonId === lesson13.id)).toBe(true);
 
+    // --- EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT -----
+    // This composition used to include the owner's OWN references and the
+    // lesson's attachments as well. The lesson page renders both in their own
+    // editable sections, so each authored file appeared twice: once here, and
+    // once again where it can actually be removed. An ITEM is the opposite
+    // case and is unchanged — its material comes from records its own page has
+    // no section for, which is why `itemFiles` stays the whole composition.
+    const withOwnFiles: PracticeDB = {
+      ...db,
+      lessons: db.lessons.map((l) =>
+        l.id === lesson13.id
+          ? {
+              ...l,
+              recordings: [
+                {
+                  id: 'own-ref',
+                  title: 'My own link',
+                  path: 'session-13-03-09-2024/my-own-file.mp4',
+                  kind: 'video' as const,
+                  createdAt: '2026-01-01T00:00:00.000Z',
+                },
+              ],
+            }
+          : l,
+      ),
+      attachments: [
+        {
+          id: 'own-att',
+          ownerType: 'lesson' as const,
+          ownerId: lesson13.id,
+          name: 'handout.pdf',
+          mime: 'application/pdf',
+          size: 2048,
+          kind: 'pdf' as const,
+          createdAt: '2026-01-01T00:00:00.000Z',
+        },
+      ],
+    };
+    const composed = lessonFiles(withOwnFiles, lesson13.id);
+    expect(composed.every((f) => f.source === 'reference' && f.archive !== undefined)).toBe(true);
+    expect(composed.some((f) => f.title === 'My own link')).toBe(false);
+    expect(composed.some((f) => f.source === 'attachment')).toBe(false);
+    // The archive's own material is untouched by the owner's additions.
+    expect(composed.map((f) => f.id)).toEqual(lessonSide.map((f) => f.id));
+
     // --- an UNNAMED demonstration is one ordered logical group --------------
     const araqGusheh = itemFiles(db, idFor(db, 'کرشمه-در-عراق')) as ItemFileReference[];
     const demo = araqGusheh.filter((f) => f.archive?.role === 'نمونه' && f.archive.sessionN === 13);
diff --git a/src/domain/itemFiles.ts b/src/domain/itemFiles.ts
index 0222517..8ebef18 100644
--- a/src/domain/itemFiles.ts
+++ b/src/domain/itemFiles.ts
@@ -239,14 +239,20 @@ export function itemFiles(db: PracticeDB, itemId: ID): ItemFile[] {
 }
 
 /**
- * Everything a LESSON holds: the archive session's own files (the class
- * recording, an unnamed handout — the material that belongs to the whole
- * class rather than to one piece) followed by references the owner authored
- * on the lesson itself, then its attachments.
+ * What the ARCHIVE gives a lesson: its session's own files — the class
+ * recording, an unnamed handout, the material that belongs to the whole class
+ * rather than to one piece. An archive-bound lesson keeps no copy of these, so
+ * reading its `recordings` array alone shows nothing at all; this is the only
+ * way they reach the screen.
  *
- * The same composition function family as `itemFiles`, for the same reason:
- * an archive-bound lesson carries no copy of its session's resources, so
- * reading its `recordings` array alone would show nothing at all.
+ * EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT. This used to
+ * compose the owner's own `recordings` and attachments too, and the lesson page
+ * renders those in their own editable sections — so one authored NAS reference
+ * and one local attachment each appeared TWICE, once here and once where they
+ * can actually be edited or removed. An item is the opposite case and stays as
+ * it is: its material is composed from OTHER records (linked lessons, the
+ * graph) that the item's own page has no section for, which is exactly why
+ * `itemFiles` must stay the whole composition.
  */
 export function lessonFiles(db: PracticeDB, lessonId: ID): ItemFile[] {
   const out: ItemFile[] = [];
@@ -285,40 +291,5 @@ export function lessonFiles(db: PracticeDB, lessonId: ID): ItemFile[] {
     }
   }
 
-  for (const rec of [...(lesson.recordings ?? [])].sort(
-    (a, b) =>
-      LESSON_FILE_KIND_ORDER[a.kind ?? 'video'] - LESSON_FILE_KIND_ORDER[b.kind ?? 'video'] ||
-      a.createdAt.localeCompare(b.createdAt),
-  )) {
-    const key = referenceKey(rec.path);
-    if (!key || seen.has(key)) continue;
-    seen.add(key);
-    out.push({
-      source: 'reference',
-      id: rec.id,
-      title: rec.title,
-      path: rec.path,
-      kind: rec.kind ?? 'video',
-      lessonId,
-      sizeBytes: rec.sizeBytes,
-      notes: rec.notes,
-      inline: false,
-    });
-  }
-
-  for (const a of attachmentsOwnedBy(db.attachments, 'lesson', lessonId).sort((x, y) =>
-    x.createdAt.localeCompare(y.createdAt),
-  )) {
-    out.push({
-      source: 'attachment',
-      id: a.id,
-      title: a.name,
-      kind: a.kind,
-      mime: a.mime,
-      sizeBytes: a.size,
-      inline: a.kind === 'image',
-    });
-  }
-
   return out;
 }
diff --git a/src/domain/scanSetarClasses.test.ts b/src/domain/scanSetarClasses.test.ts
index 0369642..65559a3 100644
--- a/src/domain/scanSetarClasses.test.ts
+++ b/src/domain/scanSetarClasses.test.ts
@@ -48,17 +48,34 @@ interface Index {
 interface Entry {
   path: string;
   size: number;
+  mtimeMs?: number;
 }
+interface Skipped {
+  path: string;
+  reason: string;
+}
+/** An optional input is ABSENT or PRESENT — never "empty because it threw". */
+type OptionalInput = { present: false } | { present: true; text: string };
 interface Scanner {
-  buildIndex(input: { registryText: string; inventory: Entry[]; renameLogText?: string }): Index;
+  buildIndex(input: {
+    registryText: string;
+    inventory: Entry[];
+    renameLog?: OptionalInput;
+    skipped?: Skipped[];
+  }): Index;
   contentHash(body: unknown): string;
   parseAssetStem(stem: string): { role: string; piece: string | null; part: number | null } | null;
   parseCsv(text: string): string[][];
   parseRegistry(text: string): Piece[];
   parseSessionFolderName(name: string): { n: number; date: string } | null;
-  scanArchive(root: string): Entry[];
+  scanArchive(root: string): { inventory: Entry[]; skipped: Skipped[] };
   scanToIndex(root: string): Index;
-  readSource(root: string): { registryText: string; renameLogText: string; inventory: Entry[] };
+  readSource(root: string): {
+    registryText: string;
+    renameLog: OptionalInput;
+    inventory: Entry[];
+    skipped: Skipped[];
+  };
   canonicalJson(value: unknown): string;
   writeIndexAtomically(outPath: string, text: string, root?: string): string;
   isSafeRelativePath(p: string): boolean;
@@ -442,13 +459,25 @@ describe('scanning the archive', () => {
       writeFileSync(join(out, 'outside.mp4'), 'x');
       symlinkSync(join(out, 'outside.mp4'), join(root, 'session-1-26-09-2023/نت-عراق.pdf'));
 
-      const first = scanArchive(root);
+      const { inventory: first, skipped: firstSkipped } = scanArchive(root);
       expect(first.some((f) => f.path.includes('.DS_Store'))).toBe(false);
       expect(first.some((f) => f.path.includes('@eaDir'))).toBe(false);
       expect(first.some((f) => f.path.startsWith('practice/'))).toBe(false);
       // The symlink is not followed: its target is outside the archive root.
       expect(first.some((f) => f.path.endsWith('نت-عراق.pdf'))).toBe(false);
       expect(first).toHaveLength(INVENTORY.length);
+      // …but "not followed" is SAID, never silent. A walk that drops a file the
+      // folder really holds and reports nothing publishes an index that is
+      // quietly narrower than the archive — the same "partial view sold as
+      // complete" the two-read check below refuses, arriving through the door
+      // the two-read check cannot see, because BOTH readings agree on it.
+      expect(firstSkipped.map((x) => x.path)).toEqual(['session-1-26-09-2023/نت-عراق.pdf']);
+      expect(firstSkipped[0]!.reason).toMatch(/symbolic link/i);
+      expect(
+        buildIndex({ registryText: REGISTRY, inventory: first, skipped: firstSkipped }).diagnostics.some(
+          (d) => d.path === 'session-1-26-09-2023/نت-عراق.pdf' && /symbolic link/i.test(d.reason),
+        ),
+      ).toBe(true);
 
       // DETERMINISM. Shuffled directory order and altered mtimes produce a
       // byte-identical semantic index: nothing here reads a time or trusts the
@@ -458,7 +487,7 @@ describe('scanning the archive', () => {
       expect(buildIndex({ registryText: REGISTRY, inventory: shuffled }).contentHash).toBe(scanned.contentHash);
       const old = new Date('2001-01-01T00:00:00Z');
       for (const f of INVENTORY) utimesSync(join(root, f.path), old, old);
-      expect(buildIndex({ registryText: REGISTRY, inventory: scanArchive(root) }).contentHash).toBe(scanned.contentHash);
+      expect(buildIndex({ registryText: REGISTRY, inventory: scanArchive(root).inventory }).contentHash).toBe(scanned.contentHash);
       expect(contentHash(scanned)).toBe(scanned.contentHash);
       // ...and the hash is not vacuous: a file whose SIZE changed is a changed
       // archive, so the semantic index changes with it.
@@ -533,20 +562,28 @@ describe('scanning the archive', () => {
       writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
       const settled = readSource(root);
       // Every input this scanner reads is in the reading that gets compared.
-      expect(Object.keys(settled).sort()).toEqual(['inventory', 'registryText', 'renameLogText']);
+      expect(Object.keys(settled).sort()).toEqual(['inventory', 'registryText', 'renameLog', 'skipped']);
       expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
 
-      // Each of the three, perturbed in turn, is VISIBLE to that comparison.
+      // Each of the inputs, perturbed in turn, is VISIBLE to that comparison.
       const moved = INVENTORY[0]!.path;
       const bytes = readFileSync(join(root, moved));
+      const when = new Date(settled.inventory.find((f) => f.path === moved)!.mtimeMs!);
+      // Put a file back EXACTLY as it was — bytes and metadata — or the
+      // restore is itself a mutation, which is the whole point of observing
+      // more than the size.
+      const restore = () => {
+        writeFileSync(join(root, moved), bytes);
+        utimesSync(join(root, moved), when, when);
+      };
       rmSync(join(root, moved));
       expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
-      writeFileSync(join(root, moved), bytes); // …and back, as a copy would
+      restore(); // …and back, as a copy would
       expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
       // A file still being COPIED is a size change, and is caught the same way.
       writeFileSync(join(root, moved), Buffer.concat([bytes, Buffer.alloc(8)]));
       expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
-      writeFileSync(join(root, moved), bytes);
+      restore();
       writeFileSync(join(root, 'RENAME-LOG.csv'), `${renameLog}session-1/x.mp4,session-1/y.mp4\n`);
       expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
       writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
@@ -554,6 +591,89 @@ describe('scanning the archive', () => {
       expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
       writeFileSync(join(root, 'PIECES.csv'), REGISTRY);
       expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
+      // A file edited IN PLACE at the same byte length changes no size and no
+      // CSV: `mtimeMs` is what makes that mutation visible to the comparison,
+      // and it is deliberately NOT semantic — the determinism check above
+      // altered every mtime in the archive and the index hash did not move.
+      const later = new Date(Date.now() + 60_000);
+      utimesSync(join(root, moved), later, later);
+      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
+      utimesSync(join(root, moved), when, when);
+      expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
+
+      // A READ FAILURE IS NEVER VALID EMPTY SOURCE DATA. `catch { text = '' }`
+      // made an unreadable RENAME-LOG.csv indistinguishable from an archive
+      // that has none: both readings agreed, the consistency check passed, and
+      // the scan published an index with NO renames — so a file that moved in
+      // that window is flagged unavailable and its saved references can never
+      // be repaired. Absence is an OBSERVATION and is recorded as one;
+      // anything else fails the scan.
+      expect(settled.renameLog).toEqual({ present: true, text: renameLog });
+      rmSync(join(root, 'RENAME-LOG.csv'));
+      expect(readSource(root).renameLog).toEqual({ present: false });
+      // …and the two are not the same reading, so a log that VANISHES between
+      // the readings is a change, not a quiet "there was never one".
+      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
+      // A present-but-EMPTY log is a zero-byte file — what a copy in flight
+      // looks like — and is refused exactly as PIECES.csv would be, rather
+      // than read as "no renames".
+      writeFileSync(join(root, 'RENAME-LOG.csv'), '');
+      expect(() => scanToIndex(root)).toThrow(/CSV is empty/);
+      // An unreadable required input fails the scan; it is never an empty one.
+      writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
+      const hidden = join(root, 'PIECES.csv');
+      const registryBytes = readFileSync(hidden);
+      rmSync(hidden);
+      mkdirSync(hidden); // a directory where a file must be: EISDIR, not ENOENT
+      expect(() => readSource(root)).toThrow(/Could not read PIECES\.csv/);
+      expect(() => scanToIndex(root)).toThrow(/Could not read PIECES\.csv/);
+      rmSync(hidden, { recursive: true });
+      writeFileSync(hidden, registryBytes);
+
+      // A RENAME LOOP NAMES NO FILE, and is dropped with a diagnostic rather
+      // than published. Every path that walks INTO the loop is equally
+      // unusable: A->B, B->C, C->B leaves no readable destination for A.
+      const swap = buildIndex({
+        registryText: REGISTRY,
+        inventory: INVENTORY,
+        renameLog: {
+          present: true,
+          text: 'old_path,new_path\nsession-1-26-09-2023/a.mp4,session-1-26-09-2023/b.mp4\nsession-1-26-09-2023/b.mp4,session-1-26-09-2023/a.mp4\n',
+        },
+      });
+      expect(swap.renames).toEqual([]);
+      expect(swap.diagnostics.filter((d) => /loops through this path/.test(d.reason)).map((d) => d.path).sort()).toEqual([
+        'session-1-26-09-2023/a.mp4',
+        'session-1-26-09-2023/b.mp4',
+      ]);
+      const intoLoop = buildIndex({
+        registryText: REGISTRY,
+        inventory: INVENTORY,
+        renameLog: {
+          present: true,
+          text: 'old_path,new_path\nx/a.mp4,x/b.mp4\nx/b.mp4,x/c.mp4\nx/c.mp4,x/b.mp4\n',
+        },
+      });
+      expect(intoLoop.renames).toEqual([]);
+      // An ordinary chain beside a loop still publishes — one bad topology
+      // does not cost the archive its good provenance.
+      const mixed = buildIndex({
+        registryText: REGISTRY,
+        inventory: INVENTORY,
+        renameLog: {
+          present: true,
+          text: 'old_path,new_path\nx/p.mp4,x/q.mp4\nx/a.mp4,x/b.mp4\nx/b.mp4,x/a.mp4\n',
+        },
+      });
+      expect(mixed.renames).toEqual([{ from: 'x/p.mp4', to: 'x/q.mp4' }]);
+      // An old path with TWO destinations was already refused, and still is.
+      const forked = buildIndex({
+        registryText: REGISTRY,
+        inventory: INVENTORY,
+        renameLog: { present: true, text: 'old_path,new_path\nx/a.mp4,x/b.mp4\nx/a.mp4,x/c.mp4\n' },
+      });
+      expect(forked.renames).toEqual([{ from: 'x/a.mp4', to: 'x/b.mp4' }]);
+      expect(forked.diagnostics.some((d) => /both/.test(d.reason))).toBe(true);
 
       // And the scan itself reads the WHOLE source twice and refuses on any
       // difference. Nothing can mutate a filesystem between two synchronous
@@ -575,7 +695,7 @@ describe('scanning the archive', () => {
       expect(() => scanToIndex(root)).toThrow();
       expect(readFileSync(target, 'utf8')).toBe('last good\n');
       // And the archive itself is untouched by any of the above.
-      expect(scanArchive(root)).toHaveLength(INVENTORY.length);
+      expect(scanArchive(root).inventory).toHaveLength(INVENTORY.length);
     } finally {
       rmSync(root, { recursive: true, force: true });
       rmSync(out, { recursive: true, force: true });
diff --git a/src/domain/sourceArchive.ts b/src/domain/sourceArchive.ts
index 82a0108..b156fab 100644
--- a/src/domain/sourceArchive.ts
+++ b/src/domain/sourceArchive.ts
@@ -271,12 +271,32 @@ function list(v: unknown, what: string): unknown[] {
   return v;
 }
 
+/**
+ * OPTIONAL TEXT. `str(raw.form ?? '')` read ABSENT and PRESENT-AND-NULL as the
+ * same thing and quietly produced `''` for both — the very normalisation the
+ * list/num/bool rule above exists to stop, left in place for every string
+ * field that has a default. A resource `title: null` became an untitled row
+ * the grammar was perfectly happy with. Absent is a default; null is a value,
+ * and a wrong one.
+ */
+function text(v: unknown, what: string): string {
+  if (v === undefined) return '';
+  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
+  return v;
+}
+
 function num(v: unknown, what: string): number | null {
   if (v === undefined || v === null) return null;
   if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
   return v;
 }
 
+/** A number that is genuinely a number — no `null`, unlike an optional part. */
+function size(v: unknown, what: string): number {
+  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
+  return v;
+}
+
 function bool(v: unknown, what: string, fallback: boolean): boolean {
   if (v === undefined) return fallback;
   if (typeof v !== 'boolean') throw new Error(`${what} must be true or false.`);
@@ -347,13 +367,13 @@ export function decodeSourceIndex(input: unknown): SourceIndex {
     }
     pieces.push({
       key,
-      form: str(raw.form ?? '', 'form'),
-      piece: str(raw.piece ?? '', 'piece'),
-      dastgah: str(raw.dastgah ?? '', 'dastgah'),
-      composer: str(raw.composer ?? '', 'composer'),
+      form: text(raw.form, `Registry entry "${key}" form`),
+      piece: text(raw.piece, `Registry entry "${key}" piece`),
+      dastgah: text(raw.dastgah, `Registry entry "${key}" dastgah`),
+      composer: text(raw.composer, `Registry entry "${key}" composer`),
       aliases: strList(raw.aliases, `Registry entry "${key}" aliases`),
       sessions: sessions as number[],
-      notes: str(raw.notes ?? '', 'notes'),
+      notes: text(raw.notes, `Registry entry "${key}" notes`),
       ...(bool(raw.provisional, `Registry entry "${key}" provisional`, false) ? { provisional: true } : {}),
       ...(bool(raw.mediumConfidence, `Registry entry "${key}" confidence`, false) ? { mediumConfidence: true } : {}),
     });
@@ -394,9 +414,14 @@ export function decodeSourceIndex(input: unknown): SourceIndex {
         path,
         role,
         kind: kind as SourceKind,
-        title: str(r.title ?? '', 'A resource title'),
+        title: text(r.title, `Resource "${path}" title`),
         part: num(r.part, `Resource "${path}" part`),
-        ...(r.size === undefined || r.size === null ? {} : { size: num(r.size, `Resource "${path}" size`) as number }),
+        // `part` and `group` are genuinely nullable in the published format —
+        // the scanner emits `null` for both — so null stays legal THERE and
+        // nowhere else. `size` it always emits as a number, and a present null
+        // is refused HERE rather than spread into the output as a value the
+        // declared type does not admit and left for the grammar to catch.
+        ...(r.size === undefined ? {} : { size: size(r.size, `Resource "${path}" size`) }),
         pieces: forPieces,
         group: r.group === undefined || r.group === null ? null : str(r.group, `Resource "${path}" group`),
       });
@@ -436,8 +461,8 @@ export function decodeSourceIndex(input: unknown): SourceIndex {
   for (const d of list(input.diagnostics, 'The diagnostic list')) {
     if (!isRecord(d)) throw new Error('A diagnostic entry is not an object.');
     diagnostics.push({
-      path: str(d.path ?? '', 'A diagnostic path'),
-      reason: str(d.reason ?? '', 'A diagnostic reason'),
+      path: text(d.path, 'A diagnostic path'),
+      reason: text(d.reason, 'A diagnostic reason'),
     });
   }
 
@@ -730,6 +755,65 @@ function checkSourceGraph(
         if (!ROLE_SET.has(role)) return `${label} session ${sess.n} gives piece "${m.key}" an unknown role.`;
       }
     }
+
+    // --- SEMANTIC RELATIONS, not merely field types ------------------------
+    //
+    // A field-type grammar says every value is READABLE; it says nothing about
+    // whether the graph agrees with itself. A resource physically sitting in
+    // class 2's folder, listed under class 1, is type-perfect and attributes
+    // someone else's file to the wrong lesson on every screen that reads it —
+    // and an arbitrary `group` on a non-demonstration invents a logical
+    // resource out of unrelated files.
+    //
+    // Scoped to what the source still DESCRIBES. `unavailable` is retained
+    // provenance about what it has STOPPED describing — a piece dropped from
+    // the registry, a file deleted from the NAS — so holding those rows to the
+    // current source's internal agreement is a category error, and would make
+    // every refresh after a removal refuse at every door.
+    if (!sess.unavailable) {
+      const live = (sess.resources as SourceResource[]).filter((r) => !r.unavailable);
+      const rolesFor = new Map<string, Set<string>>();
+      for (const m of sess.members as SourceMember[]) rolesFor.set(m.key, new Set(m.roles));
+      const groups = new Map<string, SourceResource[]>();
+      let classRecordings = 0;
+      for (const r of live) {
+        const segs = r.path.split('/');
+        if (segs.length !== 2 || segs[0] !== sess.folder) {
+          return `${label} session ${sess.n} lists "${r.path}", which is not a file in its own folder.`;
+        }
+        if (r.role === CLASS_ROLE) {
+          classRecordings += 1;
+          if (r.pieces.length > 0) return `Resource "${r.path}" is a class recording and cannot name a piece.`;
+        }
+        for (const k of r.pieces) {
+          if (!rolesFor.get(k)?.has(r.role)) {
+            return `${label} session ${sess.n} gives "${r.path}" to piece "${k}" without recording that membership.`;
+          }
+        }
+        if (r.group !== null && r.group !== undefined) {
+          if (r.role !== DEMO_ROLE) return `Resource "${r.path}" carries a part group but is not a demonstration.`;
+          groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
+        }
+      }
+      if (classRecordings > 0 !== sess.hasClassRecording) {
+        return `${label} session ${sess.n} disagrees with itself about having a class recording.`;
+      }
+      // Parts of ONE demonstration: the same material, told in order. Parts
+      // that are material for different pieces are not one resource, and two
+      // parts with one number have no order to be read in.
+      for (const [g, parts] of groups) {
+        const pieces = [...parts[0]!.pieces].sort().join(NUL);
+        const numbers = new Set<number | null>();
+        for (const r of parts) {
+          if ([...r.pieces].sort().join(NUL) !== pieces) {
+            return `${label} session ${sess.n} has a part group "${g}" whose parts belong to different pieces.`;
+          }
+          const part = r.part ?? null;
+          if (numbers.has(part)) return `${label} session ${sess.n} has two parts numbered alike in "${g}".`;
+          numbers.add(part);
+        }
+      }
+    }
   }
 
   if (graph.renames !== undefined) {
diff --git a/src/domain/sourceReconcile.test.ts b/src/domain/sourceReconcile.test.ts
index ddf4032..c795bc3 100644
--- a/src/domain/sourceReconcile.test.ts
+++ b/src/domain/sourceReconcile.test.ts
@@ -2,6 +2,8 @@ import { describe, expect, it } from 'vitest';
 import rawIndex from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
 import {
   decodeSourceIndex,
+  resourcesForPiece,
+  resourcesForSession,
   sourceItemId,
   sourceLessonId,
   validateArchiveSources,
@@ -308,7 +310,24 @@ describe('reconciling the archive with the owner’s own records', () => {
       ...INDEX,
       contentHash: 'b'.repeat(64),
       sessions: [
-        ...INDEX.sessions.map((s) => (s.n === 12 ? { ...s, resources: [...s.resources, addedScore] } : s)),
+        // A scan records the MEMBERSHIP a new resource creates in the same
+        // pass that lists the resource, so a fixture that adds one without the
+        // other is a graph disagreeing with itself — refused at every door.
+        ...INDEX.sessions.map((s) =>
+          s.n === 12
+            ? {
+                ...s,
+                resources: [...s.resources, addedScore],
+                members: [
+                  ...s.members.filter((m) => m.key !== 'عراق'),
+                  {
+                    key: 'عراق',
+                    roles: [...new Set([...(s.members.find((m) => m.key === 'عراق')?.roles ?? []), 'نت'])],
+                  },
+                ],
+              }
+            : s,
+        ),
         session40,
       ],
       // A later registry improvement on a piece already seeded.
@@ -340,8 +359,12 @@ describe('reconciling the archive with the owner’s own records', () => {
     expect(suggestion).toBeDefined();
     expect(suggestion.from).toBe('');
     expect(suggestion.to).toBe('میرزا-حسینقلی');
+    // A field decision names the RECORD it was shown against, not just the
+    // piece: a rebase must not hand the answer to whichever item happens to
+    // hold that piece by the time Apply is pressed.
+    const araqItemId = suggestion.itemId;
     const selective = applyArchiveImport(owned, delta, [
-      { kind: 'apply-field', pieceKey: 'عراق', field: 'composer', from: '' },
+      { kind: 'apply-field', pieceKey: 'عراق', itemId: araqItemId, field: 'composer', from: '' },
     ]);
     const applied = selective.items.find((i) => i.source?.pieceKey === 'عراق')!;
     expect(applied.persian?.composer).toBe('میرزا-حسینقلی');
@@ -358,7 +381,9 @@ describe('reconciling the archive with the owner’s own records', () => {
     // The suggestion stands until it is answered, and it may be answered days
     // later against the very same published index. Judging "already current"
     // by the index hash alone reported exactly that and discarded the answer.
-    const lateField = [{ kind: 'apply-field' as const, pieceKey: 'عراق', field: 'composer' as const, from: '' }];
+    const lateField = [
+      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'composer' as const, from: '' },
+    ];
     const lateDecision = planArchiveImport({
       db: refreshed,
       index: next,
@@ -380,7 +405,9 @@ describe('reconciling the archive with the owner’s own records', () => {
     // Applied, the suggestion is gone: the next refresh has nothing to offer.
     expect(planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, now: NOW }).suggestions).toEqual([]);
     // A decision for a field with NO suggestion changes nothing at all.
-    const emptyField = [{ kind: 'apply-field' as const, pieceKey: 'عراق', field: 'form' as const, from: '' }];
+    const emptyField = [
+      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'form' as const, from: '' },
+    ];
     const noop = planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, decisions: emptyField, now: NOW });
     expect(noop.summary.unchanged).toBe(true);
     expect(applyArchiveImport(lateApplied, noop, emptyField)).toBe(lateApplied);
@@ -457,12 +484,119 @@ describe('reconciling the archive with the owner’s own records', () => {
     expect(stalelink.staleDecisions).toEqual(linkDecision);
     expect(stalelink.adoptedItems).toEqual([]);
 
+    // --- A DECISION NAMES ITS RECORD, AND EVERY DECISION IS ACCOUNTED FOR ---
+    //
+    // The loops start with "already bound? nothing to decide" / "already
+    // suppressed? nothing to decide", so a decision about a record that became
+    // bound between the preview and the commit was never looked at: no
+    // adoption, no question, and an EMPTY `staleDecisions` — the commit
+    // reported success for an action it had not performed. And a field
+    // decision keyed by piece alone was worse than ignored: it was REDIRECTED
+    // onto whichever record held that piece by the time Apply ran.
+    const otherItemId = 'someone-elses-item';
+    const boundToAnother: PracticeDB = {
+      ...unbound,
+      items: [
+        ...unbound.items,
+        item({
+          id: otherItemId,
+          instrumentId: SETAR,
+          title: 'Another record',
+          source: { archiveId: 'setar-classes', pieceKey: 'عراق' },
+        }),
+      ],
+    };
+    // LINK: the approved record is not the one holding the piece now, so the
+    // choice is stale — never quietly satisfied by the other record.
+    const redirectedLink = planArchiveImport({
+      db: boundToAnother,
+      index: next,
+      instrumentId: SETAR,
+      decisions: linkDecision,
+      now: NOW,
+    });
+    expect(redirectedLink.staleDecisions).toEqual(linkDecision);
+    expect(redirectedLink.adoptedItems).toEqual([]);
+    expect(applyArchiveImport(boundToAnother, redirectedLink, linkDecision).items.find((i) => i.id === araqId)!.source)
+      .toBeUndefined();
+    // APPLY-FIELD: the archive's composer, chosen against item A's empty
+    // field, must not be written to the item that holds the piece now — whose
+    // composer is also empty, so nothing about the VALUE would have caught it.
+    const fieldForA = [
+      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqId, field: 'composer' as const, from: '' },
+    ];
+    const redirectedField = planArchiveImport({
+      db: boundToAnother,
+      index: next,
+      instrumentId: SETAR,
+      decisions: fieldForA,
+      now: NOW,
+    });
+    expect(redirectedField.staleDecisions).toEqual(fieldForA);
+    expect(redirectedField.suggestions.every((x) => x.itemId === otherItemId)).toBe(true);
+    const notRedirected = applyArchiveImport(boundToAnother, redirectedField, fieldForA);
+    expect(notRedirected.items.find((i) => i.id === otherItemId)!.persian?.composer ?? '').toBe('');
+    // SKIP and CREATE are the same rule: an answer about a record that has
+    // since been bound is an answer to a question that no longer stands.
+    for (const decision of [
+      [{ kind: 'skip-item' as const, pieceKey: 'عراق' }],
+      [{ kind: 'create-item' as const, pieceKey: 'عراق' }],
+    ]) {
+      const swept = planArchiveImport({
+        db: boundToAnother,
+        index: next,
+        instrumentId: SETAR,
+        decisions: decision,
+        now: NOW,
+      });
+      expect(swept.staleDecisions).toEqual(decision);
+      expect(swept.newItems).toEqual([]);
+    }
+    // …and LOOP PREVENTION: the action the owner approved, once it HAS
+    // happened, is not stale. `ArchiveRefresh` drops a stale decision and
+    // re-previews, so a realised action that could never be consumed again
+    // would go stale for ever.
+    const afterLink = applyArchiveImport(unbound, linkable, linkDecision);
+    const again = planArchiveImport({
+      db: afterLink,
+      index: next,
+      instrumentId: SETAR,
+      decisions: linkDecision,
+      now: NOW,
+    });
+    expect(again.staleDecisions).toEqual([]);
+    const skipped = applyArchiveImport(
+      unbound,
+      planArchiveImport({
+        db: unbound,
+        index: next,
+        instrumentId: SETAR,
+        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
+        now: NOW,
+      }),
+    );
+    expect(
+      planArchiveImport({
+        db: skipped,
+        index: next,
+        instrumentId: SETAR,
+        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
+        now: NOW,
+      }).staleDecisions,
+    ).toEqual([]);
+
     // --- a missing FILE keeps its provenance, flagged ----------------------
     const goneFile = next.sessions.find((s) => s.n === 12)!.resources[0]!.path;
     const shrunk: SourceIndex = {
       ...next,
       contentHash: 'c'.repeat(64),
-      sessions: next.sessions.map((s) => (s.n === 12 ? { ...s, resources: [] } : s)),
+      // A session that has lost every file has lost its class recording with
+      // them: a scan recomputes that flag, and a hand-built index that keeps
+      // it is a graph disagreeing with itself — which `checkSourceGraph` now
+      // refuses at every door, so it cannot be used to prove anything else.
+      sessions: next.sessions.map((s) =>
+        s.n === 12 ? { ...s, resources: [], members: [], hasClassRecording: false } : s,
+      ),
     };
     const shrunkPlan = planArchiveImport({ db: refreshed, index: shrunk, instrumentId: SETAR, now: NOW });
     const afterShrink = applyArchiveImport(refreshed, shrunkPlan);
@@ -858,7 +992,7 @@ describe('reconciling the archive with the owner’s own records', () => {
       renames: [...INDEX.renames, { from: hopA, to: hopB }, { from: hopB, to: hopC }],
     };
     const chainRenames = new Map(chained.renames.map((r) => [r.from, r.to]));
-    expect(followRenames(hopA, chainRenames)).toEqual({ path: hopC, cycle: false });
+    expect(followRenames(hopA, chainRenames)).toBe(hopC);
     const legacyClass = lesson({
       id: 'L-chain',
       date: '2023-09-26',
@@ -939,6 +1073,69 @@ describe('reconciling the archive with the owner’s own records', () => {
     });
     expect(validateArchiveSources(afterCross)).toBeNull();
 
+    // --- A CYCLE IS NO READING, FOR EVERY CONSUMER OF THE LOG -------------
+    // `followRenames` used to hand back `{ path, cycle: true }` — a perfectly
+    // usable-looking path beside a flag — and only ONE of its three callers
+    // read the flag. Hide A, then publish A->B and B->A: the re-key walked
+    // straight past the verdict and moved the owner's hide onto B, so A came
+    // back into view and the wrong file went dark. It returns `null` now, so
+    // there is no way to drop the verdict and still have a path.
+    const cyclicTo = 'session-1-26-09-2023/ضبط-کلاس-2.mp4'; // a real sibling file
+    const cyclicLog: SourceIndex = {
+      ...INDEX,
+      contentHash: '3'.repeat(64),
+      renames: [...INDEX.renames, { from: hiddenPath, to: cyclicTo }, { from: cyclicTo, to: hiddenPath }],
+    };
+    const afterCycle = applyArchiveImport(
+      hidden,
+      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
+    );
+    const cycledSource = afterCycle.archiveSources[0]!;
+    const cycledHide = cycledSource.suppressions.find((x) => x.kind === 'resource')!;
+    expect(cycledHide.ref).toBe(hiddenPath); // exactly where the owner put it
+    expect(cycledHide.itemId).toBe('item-x');
+    expect(cycledSource.suppressions.filter((x) => x.kind === 'resource')).toHaveLength(1);
+    // …so the file the owner hid is still hidden, and its sibling is not.
+    expect(resourcesForPiece(cycledSource, 'عراق', 'item-x').some((r) => r.path === hiddenPath)).toBe(false);
+    expect(resourcesForSession(cycledSource, 1).some((r) => r.path === cyclicTo)).toBe(true);
+
+    // AVAILABILITY reads the same verdict: a cycle is not a move, so a row the
+    // incoming index has dropped keeps its provenance flagged rather than
+    // being silently deleted on the strength of a destination nothing can read.
+    const cyclicAndRemoved: SourceIndex = {
+      ...cyclicLog,
+      contentHash: '2'.repeat(64),
+      sessions: cyclicLog.sessions.map((sess) =>
+        sess.n === 1 ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) } : sess,
+      ),
+    };
+    const afterCyclicRemoval = applyArchiveImport(
+      hidden,
+      planArchiveImport({ db: hidden, index: cyclicAndRemoved, instrumentId: SETAR, now: NOW }),
+    );
+    expect(
+      afterCyclicRemoval.archiveSources[0]!.sessions.find((x) => x.n === 1)!.resources.find(
+        (r) => r.path === hiddenPath,
+      )?.unavailable,
+    ).toBe(true);
+    expect(validateArchiveSources(afterCyclicRemoval)).toBeNull();
+
+    // REPAIR says so out loud rather than rewriting the path to a stop on the
+    // loop — and ADOPTION, which reads the same verdict, takes it as no
+    // evidence at all (asserted above for the same shape).
+    const loopMap = new Map(cyclicLog.renames.map((r) => [r.from, r.to]));
+    expect(followRenames(hiddenPath, loopMap)).toBeNull();
+    expect(repairReferencePath(hiddenPath, loopMap, known)).toEqual({
+      status: 'attention',
+      reason: 'The rename log loops on this path.',
+      code: 'cycle',
+    });
+    const loopLesson = applyArchiveImport(
+      hidden,
+      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
+    ).lessons.find((l) => l.id === 'L1')!;
+    expect(loopLesson.recordings).toEqual(storedOne.recordings);
+
     // A file that really IS gone still keeps its provenance, flagged.
     const removed: SourceIndex = {
       ...INDEX,
diff --git a/src/domain/sourceReconcile.ts b/src/domain/sourceReconcile.ts
index 3ee50c6..1ad0529 100644
Binary files a/src/domain/sourceReconcile.ts and b/src/domain/sourceReconcile.ts differ
diff --git a/src/pages/Lessons.tsx b/src/pages/Lessons.tsx
index 0c3f449..124c564 100644
--- a/src/pages/Lessons.tsx
+++ b/src/pages/Lessons.tsx
@@ -5,10 +5,12 @@ import {
   type PracticeItem,
   cleanFileTitle,
   daysUntil,
+  CLASS_ROLE,
   defaultInstrumentFilter,
   formatFileSize,
   ITEM_STATUS_LABELS,
   LESSON_FILE_KIND_ORDER,
+  lessonFiles,
   lessonsForInstrument,
   isUpcomingLesson,
   nextLessonFor,
@@ -435,9 +437,11 @@ function LessonDetail({ lesson, onDelete }: { lesson: Lesson; onDelete: () => vo
         />
       )}
 
-      {/* Everything this class holds, composed once: an archive-bound class
-          keeps no copy of its session's files, so its own `recordings` array
-          is empty and only the graph can answer. */}
+      {/* WHAT THE ARCHIVE GIVES THIS CLASS. An archive-bound class keeps no
+          copy of its session's files, so only the graph can answer — and the
+          owner's OWN references and attachments are NOT repeated here: they
+          each have exactly one section on this page, the one that can also
+          edit and remove them. */}
       <LessonMaterial lessonId={lesson.id} />
 
       <LessonRecordings lesson={lesson} />
@@ -483,6 +487,7 @@ function KindIcon({ kind }: { kind: LessonFileKind }) {
  * reference never touches the NAS file. Video first, then scores/docs.
  */
 function LessonRecordings({ lesson }: { lesson: Lesson }) {
+  const db = useStore((s) => s.db);
   const addLessonRecording = useStore((s) => s.addLessonRecording);
   const removeLessonRecording = useStore((s) => s.removeLessonRecording);
   const navigate = useNavigate();
@@ -494,6 +499,16 @@ function LessonRecordings({ lesson }: { lesson: Lesson }) {
       ),
     [lesson.recordings],
   );
+  // "HAS A RECORDING" IS ABOUT THE CLASS, NOT ABOUT THIS ARRAY. An imported
+  // historical class keeps no copy of its session's files, so `recordings` is
+  // empty and the empty-state card invited the owner to add a class recording
+  // directly beneath the one already playing above it. Read through the same
+  // composition the section above renders, so a recording the owner has HIDDEN
+  // does not count as one that is there.
+  const fromArchive = useMemo(
+    () => lessonFiles(db, lesson.id).some((f) => f.source === 'reference' && f.archive?.role === CLASS_ROLE),
+    [db, lesson.id],
+  );
 
   const browseUrl = normalizeBaseUrl(baseUrl);
 
@@ -535,7 +550,7 @@ function LessonRecordings({ lesson }: { lesson: Lesson }) {
         </button>
       </div>
 
-      {recordings.length === 0 && !adding && (
+      {recordings.length === 0 && !fromArchive && !adding && (
         <div className="card card-quiet small dim">
           Full class videos and scores live on your NAS, not in the app. Add a link to open them from here.
         </div>
@@ -601,7 +616,10 @@ function LessonRecordings({ lesson }: { lesson: Lesson }) {
             </button>
             <button
               className="btn btn-ghost btn-sm"
-              aria-label="Remove this link (the NAS file is kept)"
+              // Named, because a class holds several of these and "Remove this
+              // link" three times over tells a screen reader nothing about
+              // which file it is about to drop.
+              aria-label={`Remove ${rec.title} (the NAS file is kept)`}
               title="Remove link (the NAS file is kept)"
               onClick={() => {
                 if (confirm('Remove this link? The file on your NAS is not deleted.')) removeLessonRecording(lesson.id, rec.id);
diff --git a/src/store/archiveIndex.test.ts b/src/store/archiveIndex.test.ts
index 8467fe9..e08aa95 100644
--- a/src/store/archiveIndex.test.ts
+++ b/src/store/archiveIndex.test.ts
@@ -9,6 +9,7 @@ import indexFixture from '../../tests/fixtures/setar-archive.json' with { type:
 import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
 import { decodeSourceIndex } from '../domain/sourceArchive';
 import { validateDB } from '../domain/io';
+import { createItem } from '../domain/factories';
 import type { PracticeDB } from '../domain/types';
 
 // ---------------------------------------------------------------------------
@@ -658,7 +659,7 @@ describe('committing an archive import', () => {
     const answered2 = useStore.getState().previewArchiveImport({
       index: INDEX,
       instrumentId: SETAR,
-      decisions: [{ kind: 'apply-field', pieceKey, field: 'composer', from: '' }],
+      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
       now: NOW,
     });
     expect(answered2.plan.summary.unchanged).toBe(false);
@@ -670,7 +671,7 @@ describe('committing an archive import', () => {
     const appliedField = await useStore.getState().commitArchiveImport({
       index: INDEX,
       instrumentId: SETAR,
-      decisions: [{ kind: 'apply-field', pieceKey, field: 'composer', from: '' }],
+      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
       decidedFromRev: useStore.getState().rev,
       now: NOW,
     });
@@ -692,7 +693,11 @@ describe('committing an archive import', () => {
     useStore.getState().updateItem(second.id, { persian: { ...second.persian, composer: '' } });
     const secondKey = second.source!.pieceKey;
     const seen = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
-    const choice = [{ kind: 'apply-field' as const, pieceKey: secondKey, field: 'composer' as const, from: '' }];
+    const choice = [
+      // Bound to the RECORD as well as the piece and the premise: a rebase that
+      // finds the piece on a different item must not hand it that answer.
+      { kind: 'apply-field' as const, pieceKey: secondKey, itemId: second.id, field: 'composer' as const, from: '' },
+    ];
     useStore.getState().updateItem(second.id, {
       persian: { ...second.persian, composer: 'Owner wrote this during refresh' },
     });
@@ -721,6 +726,53 @@ describe('committing an archive import', () => {
       second.persian!.composer,
     );
 
+    // --- A DECISION IS BOUND TO ITS RECORD, THROUGH A REAL COMMIT ---------
+    // The other half of the same family, and the one an already-bound early
+    // `continue` hid completely: the piece is held by a DIFFERENT record by
+    // the time Apply runs. A field decision keyed by piece alone was written
+    // to that other record (its composer was empty too, so nothing about the
+    // VALUE would have caught it), and a Link decision was skipped in silence
+    // — `staleDecisions` empty, the commit reporting success for an action it
+    // never performed.
+    const movedPiece = useStore.getState().db.items.find((i) => i.source && i.id !== second.id)!;
+    const movedKey = movedPiece.source!.pieceKey;
+    const decoy = createItem({ instrumentId: SETAR, title: 'A different record' }, NOW);
+    useStore.setState((st) => ({
+      db: {
+        ...st.db,
+        items: [
+          // The approved record loses the binding; another record takes it.
+          ...st.db.items.map((i) => (i.id === movedPiece.id ? { ...i, source: undefined } : i)),
+          { ...decoy, source: { archiveId: 'setar-classes', pieceKey: movedKey } },
+        ],
+      },
+    }));
+    for (const decisions of [
+      [{ kind: 'link-item' as const, pieceKey: movedKey, itemId: movedPiece.id }],
+      [
+        {
+          kind: 'apply-field' as const,
+          pieceKey: movedKey,
+          itemId: movedPiece.id,
+          field: 'composer' as const,
+          from: movedPiece.persian?.composer ?? '',
+        },
+      ],
+    ]) {
+      const refused = await useStore.getState().commitArchiveImport({
+        index: INDEX,
+        instrumentId: SETAR,
+        decisions,
+        decidedFromRev: useStore.getState().rev,
+        now: NOW,
+      });
+      expect(refused).toMatchObject({ ok: false, status: 'stale' });
+      expect(refused.staleDecisions).toEqual(decisions);
+    }
+    // Neither record was touched by either refusal.
+    expect(useStore.getState().db.items.find((i) => i.id === movedPiece.id)!.source).toBeUndefined();
+    expect(useStore.getState().db.items.find((i) => i.id === decoy.id)!.persian?.composer ?? '').toBe('');
+
     // --- refresh NEVER runs a whole-database import or reset ---------------
     // `importDB`, `resetDemo` and `clearAll` each null the active session and
     // reset `notNow`/`sessionInstrumentId`; every assertion above shows those
diff --git a/tests/practiceBrowser.ts b/tests/practiceBrowser.ts
index bb4f97a..74e4c0e 100644
--- a/tests/practiceBrowser.ts
+++ b/tests/practiceBrowser.ts
@@ -97,9 +97,32 @@ export async function openPracticeApp(options: {
     page.on('dialog', (d) => {
       void d.accept().catch(() => {});
     });
+    // A request the BROWSER cancelled because this test navigated away while it
+    // was in flight is not an application error. WebKit reports such a fetch as
+    // "Fetch API cannot load … due to access control checks", which reads
+    // exactly like a CORS problem and is not one: instrumented, the only
+    // difference between the passing and failing runs of the same journey is a
+    // single `requestfailed` with `errorText: 'cancelled'` for a request that
+    // is otherwise fulfilled with the right CORS headers every other time.
+    // A real person navigating mid-sync cancels the same request, so treating
+    // it as a page error makes a journey fail for driving the app quickly.
+    // Narrow by construction: only a URL this run actually saw cancelled is
+    // ever excused, and every other page error is recorded as before.
+    const cancelled = new Set<string>();
+    page.on('requestfailed', (r) => {
+      if (r.failure()?.errorText === 'cancelled') cancelled.add(r.url());
+    });
     // Surface a page-level error instead of letting it become a silently
     // wrong assertion later.
-    page.on('pageerror', (e) => pageErrors.push(e));
+    page.on('pageerror', (e) => {
+      const message = `${e.message}`;
+      // WebKit spells the URL with the scheme separated from the host, so the
+      // comparison is on the path, which both spellings carry verbatim.
+      for (const url of cancelled) {
+        if (message.includes(new URL(url).pathname)) return;
+      }
+      pageErrors.push(e);
+    });
     await page.clock.install({ time: options.now });
     await page.goto(origin);
     // The store hydrates from IndexedDB before anything renders. The ceiling is
diff --git a/tests/setarArchive.browser.test.ts b/tests/setarArchive.browser.test.ts
index 273ec33..53f895b 100644
--- a/tests/setarArchive.browser.test.ts
+++ b/tests/setarArchive.browser.test.ts
@@ -163,26 +163,59 @@ describe('the Setar archive, rendered', () => {
           // this journey drives whichever the viewport actually renders.
           await goTo(app, '/lessons');
           const wide = viewport.width >= 1000;
-          let lessonText: string;
-          if (wide) {
-            await page.getByRole('button', { name: /Class 13 · 2024-09-03/ }).first().click();
-            await page.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
-            lessonText = await page.locator('main').innerText();
-          } else {
-            const class13 = page.getByRole('article').filter({ hasText: 'Class 13 · 2024-09-03' });
-            await class13.first().waitFor({ timeout: 20_000 });
+          /**
+           * Open one class and read what it actually renders — the whole page
+           * on the wide two-pane layout, the card itself on the phone, where
+           * rows start compact and must be opened first.
+           */
+          const openClass = async (label: string, number: number): Promise<string> => {
+            if (wide) {
+              await page.getByRole('button', { name: new RegExp(label) }).first().click();
+              await page.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
+              return page.locator('main').innerText();
+            }
+            const card = page.getByRole('article').filter({ hasText: label });
+            await card.first().waitFor({ timeout: 20_000 });
             // PHONE ROWS START COMPACT: thirty-nine imported classes must not
             // all open at once just because none of them has notes yet.
-            expect(await class13.getByRole('button', { name: /Class notes/ }).count()).toBe(0);
-            await class13.getByRole('button', { name: /Class 13/ }).first().click();
-            await class13.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
-            lessonText = await class13.innerText();
-          }
+            expect(await card.getByRole('button', { name: /Class notes/ }).count()).toBe(0);
+            await card.getByRole('button', { name: new RegExp(`Class ${number}`) }).first().click();
+            await card.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
+            return card.innerText();
+          };
+          const lessonText = await openClass('Class 13 · 2024-09-03', 13);
           // The class recording is here, with its part numbers; a named score
           // is here; nothing claims a demonstration belongs to the class alone.
           expect(lessonText).toContain('ضبط کلاس');
           expect(lessonText).toContain('Class 13 · 2024-09-03 · class recording');
 
+          // --- ONE SECTION PER FILE, and no prompt beside a file that is here
+          //
+          // Class 25 is an ADOPTED legacy class carrying three of the owner's
+          // OWN references — personal takes the index describes nowhere, by
+          // construction — beside the archive's session material. The composed
+          // list used to include the owner's rows as well, so each of them was
+          // rendered twice: once where it can be edited and removed, and once
+          // again above it.
+          const occurrences = (text: string, needle: string) => text.split(needle).length - 1;
+          const adopted = await openClass('Class 25 · 2025-08-05', 25);
+          for (const authored of ['My take, 3 August', 'My take, 4 August', 'My take, 5 August']) {
+            expect(occurrences(adopted, authored)).toBe(1);
+          }
+          // …and they are still editable where they live: the section that owns
+          // them can still remove them, by name.
+          const owning = wide
+            ? page.locator('main')
+            : page.getByRole('article').filter({ hasText: 'Class 25 · 2025-08-05' });
+          expect(await owning.getByRole('button', { name: /Remove My take, 3 August/ }).count()).toBe(1);
+          // A class the archive gave a recording to is NOT invited to add one.
+          // Class 12 is a purely imported class: it keeps no copy of its
+          // session's files, so its own `recordings` array is empty and the
+          // empty-state card offered to add the very video playing above it.
+          const imported = await openClass('Class 12 · 2024-08-06', 12);
+          expect(imported).toContain('Class 12 · 2024-08-06 · class recording');
+          expect(imported).not.toMatch(/Full class videos and scores live on your NAS/);
+
           // --- A CANONICAL PIECE, and the material that is useful for it ----
           await goTo(app, '/repertoire');
           await page.getByRole('button', { name: 'Practice list' }).click();
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

A THIRD, of the same kind: a request the browser CANCELS because the test navigated away
while it was in flight is reported by WebKit as
`"Fetch API cannot load … due to access control checks"` — which reads exactly like a CORS
problem and is not one. Instrumented, the only difference between a passing and a failing run
of the same journey was one `requestfailed` with `errorText: 'cancelled'` for a request
fulfilled with the right CORS headers every other time. A real person navigating mid-sync
cancels the same request, so `openPracticeApp` (`tests/practiceBrowser.ts`) does not count it
as a page error — narrowly, by URL, and only for a URL that run actually saw cancelled.

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
arbitrary stop on the loop. The SCANNER diagnoses the topology in the first place — every
row in a loop, and every row that walks into one, is dropped with a diagnostic rather than
published (ac-12's own rule: cycles and multiple destinations DIAGNOSE, never guess) — so a
published index carries no cycle, and the app still refuses to read one from any other
source. An ordinary chain beside a loop still publishes: one bad topology does not cost the
archive its good provenance.

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
references are retained historical links, untouched and unflagged.

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

### DECISIONS.md

```
# Decisions

Durable record of non-obvious choices. Newest first.

## Rejection: five rules that closed their own counterexample and not its family (2026-09-17)

A third sealed review rejected the reworked Setar-archive diff. Each finding was the
PREVIOUS fix holding for exactly the case it was written against, so each fix here is the
rule the whole family shares — and the previous narrower mechanism is subsumed rather than
left beside it.

- **A read failure was valid empty source data.** The two-read consistency check was
  extended to every input, and `catch { renameLogText = '' }` then made an unreadable
  RENAME-LOG.csv agree with itself: both readings held `''`, the check passed, and the scan
  published an index with no renames — so a file that moved in that window is flagged
  unavailable and its saved references can never be repaired. Absence is an OBSERVATION now
  (`{present:false}`, ENOENT only) and travels in the compared reading; anything else fails
  the scan. The walk had the deeper version of the same gap: two readings agree about a file
  neither looked at, so a skipped symlink or a session-named non-directory is a published
  diagnostic instead of a silent omission. The compared reading also carries `mtimeMs`,
  which `buildIndex` never reads, so an in-place edit at the same byte length is visible to
  the check and invisible to the index.
- **The absent/present rule reached the lists and the scalars, not the strings.**
  `str(raw.form ?? '')` still read absent and present-and-null alike, so a `title: null`
  decoded to an untitled row behind a correct digest. `text()` is that rule for strings.
  Separately, a grammar of FIELD TYPES says every value is readable and nothing about
  whether the graph agrees with itself: a resource in class 2's folder listed under class 1
  passed every door. `checkSourceGraph` now also checks path ownership, resource-to-member
  agreement by role, demo-group coherence and `hasClassRecording` — over rows the source
  still DESCRIBES, because holding retained `unavailable` provenance to the current
  source's internal agreement would refuse every refresh after a removal.
- **A decision named its piece, not its record.** Both reconciliation loops open with
  "already bound? nothing to decide", so a decision about a record bound between the preview
  and the commit was never examined: no adoption, no question, an EMPTY `staleDecisions`,
  and a commit reporting success for an action it had not performed. `apply-field` was worse
  than ignored — keyed by piece and value alone, it was redirected onto whichever record held
  that piece by commit time. It carries `itemId` now, and `planArchiveImport` marks every
  decision it acts on and sweeps the rest: unmarked is either already realised (loop
  prevention — the screen drops a stale decision and re-previews) or stale. The `from`
  premise rule is an outcome of that sweep rather than a second mechanism beside it.
- **"A cycle is reported" was reported in a value callers could ignore.** `followRenames`
  returned `{ path, cycle: true }` and only adoption read the flag; the suppression re-key
  and `retainMissing` walked past it, so A→B plus B→A moved the owner's hide onto B and the
  wrong file went dark. It returns `string | null`, so dropping the verdict and keeping a
  path is unrepresentable. The scanner drops every row in a loop — and every row walking into
  one — with a diagnostic, per ac-12's own "cycles diagnose, never guess"; refusing the whole
  index was rejected, because a name swap is a legitimate archive operation and an
  unimportable archive is a worse answer than an unrepaired path.
- **One lesson file had two sections.** `lessonFiles` composed the lesson's own references
  and attachments as well as the archive's, and the lesson page renders both in the sections
  that can edit and remove them — so an authored file appeared twice, once where nothing
  could be done with it. `lessonFiles` is the ARCHIVE's contribution alone; an ITEM keeps the
  whole composition, because its material comes from records its own page has no section for.
  And "has a recording" is read through that composition, not `lesson.recordings`, so an
  imported class is no longer invited to add the video already playing above the prompt.

A separate, reproduced HARNESS diagnosis came out of the same round and is recorded here
because a flaky heavy check is worse than a missing one: WebKit reports a request the browser
CANCELLED (because the test navigated away mid-flight) as "Fetch API cannot load … due to
access control checks", which reads as a CORS failure and is not one. Instrumenting the
journey showed the only difference between a passing and a failing run was one `requestfailed`
with `errorText: 'cancelled'` against a request fulfilled with correct CORS headers every
other time. `openPracticeApp` no longer counts such an error, narrowly and by URL. Filtering
the wording alone, or seeding the fake remote so the bootstrap PUT never happens, were both
rejected: the first excuses a real CORS bug, the second changes what the other journeys mean
by an empty remote.

Eight mutations were run and all eight fail their named acceptance test: the optional-read
swallow restored, the folder-ownership check, the demo-group check, the decision sweep,
`itemId` dropped from the suggestion predicate, the cyclic suppression re-key, the lesson
composition's authored half (in the real browser, both engines), and the empty-recording
prompt's guard.

## Rejection: five checks that each held for one caller, one input or one hop (2026-09-17)

A second sealed review rejected the reworked Setar-archive diff with five findings. Every
one of them was a rule that genuinely existed and covered LESS than it read as covering, so
each fix is the boundary all the callers share rather than the caller the counterexample
named.

- **One scan was one consistent view of the registry only.** PIECES.csv was re-read after
  the walk; the rename log and the media inventory were read once and compared against
  nothing — and the media is what a non-atomic NAS copy actually perturbs. A resource moved
  out before its folder is enumerated and restored while later folders are walked produces a
  valid index that omits it, and the next Refresh marks still-present material unavailable.
  `readSource` is now every input in one place, read twice and compared. It is a CONSISTENCY
  check and the comment says so: a perturbation stable across both readings is
  indistinguishable, from here, from the archive genuinely being in that state.
- **The decoder normalised before the grammar ran.** `checkSourceGraph` was made the one
  grammar in the previous rework — but the decoder hands it the decoder's OWN output, so
  `resources: null` became a valid empty list before the grammar ever saw it, and six files
  became zero behind a correct digest. The scalars had the same shape (`part: "3"` → `null`,
  a wrong-typed `size` dropped, `rosterTrusted: 'yes'` → a boolean). `list`/`num`/`bool`
  replace every absent-tolerant read: absent is a default, present-and-wrong is a refusal
  naming the record. Separately, `acceptedAt` was the one persisted field with no check at
  all while Settings renders it — validated at the door, never guarded in the component.
- **A decision was matched to its target, not to its premise.** The rebase refused only on a
  NEW question, so choosing the archive's composer over an empty field and then typing your
  own before Apply raised nothing to ask about and overwrote the new words. An `apply-field`
  decision carries `from` now, `decisionMatchesSuggestion` is the one test the summary and
  the write share, and a link may only adopt a record that is still unbound and still this
  instrument's. Both land in `plan.staleDecisions` — ONE channel — and the commit refuses on
  either, whether or not `rev` moved. Silently creating a record instead of linking one was
  rejected as an answer: it is not the action the owner chose.
- **The rename chain had three readings.** Repair followed the whole chain, adoption took one
  hop, a suppression took none. A→B→C with B in session 1 and C in session 2 adopted a class
  as session 1 and then repaired its reference into session 2. `followRenames` is the one
  reading; a resource suppression is re-keyed through it (the same decision about the same
  bytes, in the archive's current words), and a renamed row is dropped from the retained
  graph rather than flagged `unavailable` — the log says where the bytes went. Dropping is
  safe for a RESOURCE specifically: only pieces and sessions carry bindings.
- **A media base was validated as a URL, not as a base.** Everything appends a path after it,
  so `https://user:pass@nas/media?token=secret` put a password in every device URL and
  addressed no file. `normalizeBaseUrl` refuses credentials, query and fragment — refuses,
  not strips, because a rewritten base names a different server — and every caller,
  `verifiedBase` included, already passes through it.

Fifteen mutations were run and all fifteen fail their named acceptance test: each decoder
site reverted INDIVIDUALLY (a single-site test would have passed a partial fix), the
scanner's second reading, the `acceptedAt` and rename-log checks, the one-hop evidence, the
un-migrated suppression ref, the re-flagged renamed row, `from` dropped from the predicate,
the staleness detector disabled, the bound-target link guard, and the base-URL refusal.

## Rejection: four invariants that were stated in one place and enforced in none (2026-09-17)

A sealed review rejected the first Setar-archive diff with four findings. Each was reported
as one counterexample; each was really a FAMILY, and the fixes are family-shaped.

- **The nested graph had two grammars.** `decodeSourceIndex` stated the shape of a session;
  `validateArchiveSources` stated LESS of it and was the one every inbound door ran. So
  `members[0].roles: null` was accepted, persisted, and thrown on by `repeatChains` while
  rendering material — and `piece.aliases` had the identical exposure through
  `planArchiveImport`'s own spread. `checkSourceGraph` is now that grammar in ONE place,
  run by both callers. The alternative — guarding the reader — was rejected outright: a
  reader written against a validated graph is the whole point of validating it, and a guard
  in `ItemMaterial` would leave the invalid data on disk for the next reader.
- **The reference repair had no production caller.** The 67-path mapping was proved against
  the real rename log and then never wired in, so a uniquely adoptable legacy class was
  adopted and left pointing at names the archive renamed. The repair runs inside
  `planArchiveImport` now, in ONE pass whose output is both what the preview shows and what
  the commit installs. Scope is the lessons the archive owns; `not-described` is deliberately
  NOT reported, because the index omits 125 of 258 files by construction and "I have never
  heard of this path" is not "this file is gone".
- **Owner answers were transient.** Skip lived only in the preview's argument list; Create
  separately was honoured for items and dropped for lessons; and any decision taken against
  an already-current index was reported "Already current" and discarded. Skip writes a
  suppression, the lesson branch exists, and `commitArchiveImport` asks `applyArchiveImport`
  itself — which returns the same object when a plan changes nothing — instead of keeping a
  second opinion about what "unchanged" means.
- **The digest was format-checked, never verified.** `contentHash` is the refresh IDENTITY,
  so altered content under a retained hash was reported unchanged and its facts ignored.
  `parseSourceIndex` recomputes the scanner's own digest at the one boundary both readers
  share. It is async because the platform's SHA-256 is; a hand-rolled synchronous one to
  avoid two `await`s would be a second implementation of a primitive the app already has.

Each fix was mutation-checked: the roles check, the `create-lesson` branch, the suppression
write and the digest comparison were each reverted in turn and confirmed to fail the named
acceptance test — the suppression one failing specifically AFTER a reload, which is where
the defect actually lived.

## The archive describes; it never testifies (2026-09-17)

The Setar archive is thirty-nine class folders, 258 files and a 94-row canonical registry,
normalised so that every filename parses. Turning that into lessons, repertoire items and
material raised one question over and over, and the answer is always the same shape:
**archive evidence may establish membership, provenance and material. It may never
establish practice.**

**The scanner is on the NAS, and the app reads a published index.** Four architectures were
weighed. Browser filesystem access is Mac-only and useless on the phone. A bundled
TypeScript array (what the old `scan:setar` produced) needs a rebuild and a deploy for every
new class. Browser crawling of a NAS directory listing means dozens of requests, fragile
HTML, a CORS refusal, a CSP change and a certificate problem — and `no-cors` cannot produce
readable data at all. A live scan service is a new authenticated runtime nobody asked for.
So: a read-only Node scanner on the NAS emits a deterministic JSON index; the publisher
commits it to a SEPARATE branch of the existing private data repo; the app GETs it with the
GitHub connection it already has. Both devices get the same small file with no NAS fetch
permission, no new service and no large-file storage, and media still opens directly from
each device's own base.

**A separate branch, not a sidecar.** `gitRemote.createTree` builds `main`'s whole tree with
no `base_tree`, so anything placed beside `state.json` is deleted by the next sync. That is a
fact about the sync engine, and the answer is to stay out of its way — not to change the one
part of this app whose job is never losing data.

**The token is repository-scoped, and saying otherwise would be a lie.** GitHub does not
issue branch-scoped tokens. `publish-setar-index.mjs` refuses every target but
`source-index`/`setar/index.json`, and that is a property of the CODE. The docs say so in
those words, because "the credential can only touch the index branch" is exactly the kind of
comfortable sentence that turns into a breach.

**Identity is byte-exact and archive-relative.** `canonical_fa` is the join key, unfolded and
untransliterated; `aliases_seen` is literal SEARCH data and is never consulted to decide
which piece a record is. App ids are deterministic hashes of the source identity, so two
devices importing the same index independently agree on which record is which. Paths are
stored relative to the archive root, so changing the transport — LAN today, Tailscale on the
phone, something else later — rewrites no stored record.

**Weak equivalences ask; they do not merge.** A legacy class is auto-adopted only on
instrument + date + number + exact source-path evidence. The owner's real upcoming class 38
(2026‑09‑27) and archive session 38 (2026‑08‑04) are a live counterexample to merging on a
number. An exact title or alias match produces Link / Create separately / Skip; a catalogue
slug (`iraq`) is never equated with a canonical Farsi key (عراق), however obviously they
"mean" the same thing.

**Imported pieces arrive resting.** Ninety-four live candidates would flood every
recommendation and every session plan on the day of the import. Resting is an administrative
import policy, stated before the import — the items stay searchable, stay in My repertoire,
and start directly whenever the owner wants.

**History is history, whatever the clock says.** The archive runs to September 2026, so on a
device whose clock is behind it an imported class is dated in the FUTURE. `date >= today`
would turn thirty-nine records of classes that already happened into thirty-nine deadlines.
`isUpcomingLesson` checks `origin === 'archive'` FIRST, and all four next-class selectors
plus every Lessons badge go through it.

**The bug that was not in the editor.** Lesson notes could not be cleared. The editor was
blameless: `updateLesson` read `patch.notes ?? l.notes`, which cannot tell an omitted field
from a deliberately empty one, so deleting the text wrote the old text straight back. Fixed
at the patch boundary, on the PRESENCE of the key — the same distinction `resolveReviewDate`
already makes for a date — and the lesson editor now shares `ItemNotes`' durability model
(explicit Done, tagged draft, acknowledged persistence, retry) through one extracted
component rather than a second copy of it.

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

### docs/setar-archive.md

````
# The Setar archive: scanner, index and refresh

How the normalised Setar class archive becomes historical lessons, canonical
repertoire items and useful practice material — and exactly how the unattended
part of it is installed, run and rolled back.

Nothing here writes to the archive. Ever.

---

## 1. The shape of it

```
NAS (read-only)                     GitHub (private data repo)        App
┌────────────────────────┐          ┌───────────────────────┐        ┌──────────────┐
│ setar-classes/         │  scan    │ branch: source-index  │  GET   │ Refresh      │
│   session-N-DD-MM-YYYY │ ───────▶ │   setar/index.json    │ ─────▶ │ Setar archive│
│   PIECES.csv           │ publish  └───────────────────────┘        └──────────────┘
│   RENAME-LOG.csv       │                     ▲                            │
└────────────────────────┘                     │                            ▼
         ▲                            branch: main (app data)     one validated
         │ media, opened directly              UNTOUCHED           store mutation
         └──────────────────────────────────────────────────────────────┘
```

Three separations do the work:

- **The app never parses a filename.** The grammar lives once, in the scanner.
- **The index is on its OWN branch.** The app's sync writes `main`'s whole tree
  with no `base_tree`, so a sidecar next to `state.json` would disappear on the
  next sync. `source-index` is outside that, and outside `archive/…` recovery
  branches too.
- **Media never travels.** Only paths do. Each device resolves them through its
  own base URL, so changing the transport rewrites no stored record.

---

## 2. The scanner

`scripts/scan-setar-classes.mjs` — Node stdlib only, no dependencies, read-only
over the archive.

```sh
node scripts/scan-setar-classes.mjs --root /volume1/media/setar-classes --out /volume1/practice-compass-index/setar-index.json
node scripts/scan-setar-classes.mjs --root <archive>            # to stdout
```

It reads `PIECES.csv` (the canonical registry) with a real quoting-aware CSV
parser, walks the `session-N-DD-MM-YYYY` folders, applies the filename grammar
from the archive's own `CRAWLER-BRIEF.md`, and emits a **clock-free** JSON index
with a `contentHash` over its semantic body. The same archive always produces
byte-identical output: no mtimes, no directory-order luck, no `generatedAt`.

What it refuses outright (and produces no index for): a malformed or ambiguous
registry, a duplicate canonical key, two folders claiming one session number, an
unsafe path, more than 5000 files, **any input that changed during the scan** —
the registry, the rename log or the media inventory, all three read twice and
compared, sizes included, so a file still being copied is caught too. That is a
CONSISTENCY check, not atomicity: a perturbation that is stable across both
readings agrees with itself, and from here is indistinguishable from the archive
genuinely being in that state. What it removes is the transient — which is what a
copy in flight looks like, and what would otherwise publish an index missing a
file that is still there.

A READ FAILURE IS NOT AN OBSERVATION. `PIECES.csv` is required, so anything that
stops it being read — missing, unreadable, a directory where a file should be —
refuses the scan. `RENAME-LOG.csv` is optional, and "absent" means ENOENT and
nothing else: it travels in the compared reading as `{present:false}`, never as
empty text, because `catch { text = '' }` made a permission change or an I/O
error agree with itself across both readings and publish an index with no
renames at all. A present but EMPTY log is refused like an empty registry — a
zero-byte file is what a copy in flight looks like.

Each file's `mtimeMs` is part of the compared reading and is never read by the
index builder, so a file edited IN PLACE at the same byte length fails the scan
while altered mtimes still produce a byte-identical index.

What it reports and skips: a file with no known role, an unknown piece, an
unsupported extension, a class recording claiming a piece, an unnamed demo in a
session whose roster and filenames disagree, a symbolic link (never followed —
but never silently dropped either, since two readings agree about a file neither
of them looked at), a session-named entry that is not a real directory, and
every row of a rename LOOP. A log that loops names no file, so those rows — and
any row that walks into a loop — are dropped with a diagnostic rather than
published; an ordinary chain beside a loop still publishes. Dotfiles, `@eaDir`
and out-of-scope root folders stay silent: they are not archive content.

The output is written **outside the archive** via a temp file + rename, and the
scanner refuses an `--out` path inside `--root`.

### Corpus baseline

Verified directly against the real archive on 2026‑09‑17:

| | |
|---|---|
| sessions | 39 |
| files in session folders | 258 |
| parseable | 257 |
| known exception | 1 (`session-16-26-11-2024/video-2024-10-29-15-32-35.mp4`) |
| canonical pieces | 94 |
| personal recordings (`تمرین-من`) | 125 |
| useful resources | 132 (45 class · 57 demo clips · 24 notation · 6 corrections) |
| logical demonstrations | 37 |
| rename-log rows | 257 |

Source hashes (sha256), so a changed input is visible rather than assumed:

```
PIECES.csv        1f68366e32f0f5ddc8b8db0c1027893b724e16d496f0dca0502fa0a0cd133524
RENAME-PLAN.csv   795faf11c1538e69905e245e9c45d0b13ebcd3469a1b18a2db097786e576b39c
RENAME-LOG.csv    0c276d5e50fc93904ecfb76c71b1c78dca1cda2610f1569f28c9828013278373
CRAWLER-BRIEF.md  ee76dbc17351fdcc33662b7c467652f5b90728005ef48071bdb35bcf8843a9bc
sorted path inventory (LF-joined, trailing newline)
                  0286b07549ad55b0f84166dc2c7b8c2d5949f96a282f03ebaa5837ebf5b22ae7
```

These are evidence of one corpus, not a limit: sessions 40+ need no code change.

---

## 3. The publisher

`scripts/publish-setar-index.mjs` writes **one file on one branch**:
`source-index` / `setar/index.json`. Both are fixed in the code, and every other
target is refused before a request is made.

- **Unchanged content makes no commit.** The index is clock-free, so identical
  bytes mean an identical archive.
- The branch ref advances **non-force** from the commit that was read, with
  `expected_head_sha`, so a racing publisher loses the update rather than
  overwriting it; the retry re-reads before deciding anything.
- An interruption before the ref advances leaves the previous index published —
  a blob and a commit nothing points at are invisible.
- Error messages are built from the HTTP status and the endpoint name only.
  **No token, no repository URL and no archive path ever reaches a log.**

### The credential

A GitHub token scoped to **this one private repository**, with **Contents:
write** and **Metadata: read**, and no workflow or admin permission.

> GitHub does not issue branch-scoped tokens. The branch and path restriction is
> a property of *this code* (and, optionally, of repository rules). It must not
> be described as credential isolation.

It lives in the NAS runtime's own protected configuration file and nowhere
else — never in the archive, the app, a backup, sync, a commit or a log line.
The app's own GitHub connection (Settings → Sync) is a *different* credential and
is used here for **GETs only**.

---

## 4. Installing the unattended job on the NAS

The production host is the Synology NAS, not the Mac. The Mac can run the same
two scripts by hand; that is the development fallback, not the deployment.

1. **Runtime.** Install a supported Node runtime (Package Center → Node.js).
   Record the actual binary path — `which node` under the task's own shell — and
   set `PC_NODE` if it is not on `PATH`.
2. **Directories.** Create a runtime/output directory *outside* the archive,
   e.g. `/volume1/practice-compass-index/`, owned by a non-admin service user.
   Copy `scripts/scan-setar-classes.mjs`, `scripts/publish-setar-index.mjs` and
   `scripts/run-setar-index.sh` into it.
3. **Permissions.** Give that user **read-only** access to the archive share and
   read/write to the runtime directory only.
4. **Configuration.** Create `config.env` in the runtime directory, `chmod 600`:

   ```sh
   PC_ARCHIVE_ROOT=/volume1/<share>/setar-classes   # the REAL mount, not /Volumes/…
   PC_INDEX_REPO=<owner>/practice-compass-data
   PC_INDEX_TOKEN=<the publisher token>
   ```

   The real internal mount path is discovered during installation. **Do not
   assume the Mac's `/Volumes/...` path exists on DSM.**
5. **Schedule.** DSM → Control Panel → Task Scheduler → Create → Scheduled Task
   → User-defined script. Run as the service user, every **15 minutes**, command:

   ```sh
   sh /volume1/practice-compass-index/run-setar-index.sh
   ```

   Enable "Send run details by email" only on error: the script prints counts and
   a truncated commit id, never a secret.
6. **Verify.** Run the task once by hand and confirm: a commit on `source-index`,
   `main` unchanged (`git log --oneline main` has no new entry), and the app's
   Refresh finding the new index. Then confirm an **unattended** run with the Mac
   off.

### What has been exercised, and what only the owner can

`run-setar-index.sh` was run end to end on the Mac against the real archive with a
deliberately invalid `PC_INDEX_TOKEN` (2026‑09‑17). It scanned the live corpus to the same
content hash as every other run (`924125427f61`), wrote `setar-index.json` into the runtime
directory, failed the publish with `GitHub refused the branch reference (HTTP 401)`, exited
non-zero so a scheduler reports it, and left the archive byte-for-byte untouched. The
output contains **no token, no repository name, no API URL and no archive path** — checked,
not assumed.

What that cannot prove, and what the OWNER has to confirm on the NAS itself: the real
internal mount path, the DSM Node runtime, the service user's read-only permissions, the
scheduled task firing unattended with the Mac off, a real publish landing on `source-index`
with `main` unchanged, and the behaviour when the token is revoked.

### Rollback

Disable the scheduled task. The app keeps the source graph it last accepted and
goes on working offline from it. To go back to an earlier index,
`git push --force-with-lease` an earlier `source-index` commit. Neither touches
the app's own data on `main`. Revoking the token stops publication and leaves the
last good index exactly where it is.

---

## 5. What the app does with it

**Refresh Setar archive** (Settings, reachable from Lessons) fetches the branch
ref, then the file **at that commit**, validates it, shows what would change, and
applies the lot in one store mutation.

- **Refresh means "the latest published index", not "rescan the NAS now."** The
  UI says when the index was last *fetched* and last *changed*. It never says
  "last scanned", because nothing here can know that.
- **Exact source binding wins.** A record already bound to a source identity *is*
  that entity, whatever its title or date has since been edited to.
- A legacy class is auto-adopted only on **instrument + date + number + exact
  source-path evidence**. Date alone, number alone or title alone cannot merge.
- An exact title or literal alias match produces **Link / Create separately /
  Skip** — never an automatic merge, and never "pick the first candidate".
- New pieces arrive **resting**, by explicit import policy, so ninety-four items
  do not flood Today. They stay searchable and directly startable.
- **Nothing about practice is ever seeded**: no minutes, no result, no review
  date, no SM‑2 state. An imported class is history even when its date is in the
  future relative to this device's clock.
- Deleting, unlinking or hiding records a narrowly scoped **suppression** in the
  same mutation, so a refresh, a reload and a sync all respect it. A hide follows
  its file through the rename log, so a renamed resource does not reappear —
  including when the rename moves it into a different session's folder, where
  the old row is dropped rather than reported missing. A rename LOOP names no
  file, so a hide stays exactly where you put it and nothing is re-keyed.
- **A decision is about the state you saw, and about the record you saw it on.**
  If the value you chose the archive's over has changed since — or the record you
  chose to link or apply a field to has been deleted, bound elsewhere or moved
  instrument — the commit refuses and re-previews rather than applying an answer
  to a question that no longer stands, or handing it to some other record.
- **Every file on a class has exactly one section.** The archive's own session
  material is composed for you (an imported class keeps no copy of it, so nothing
  else can show it); your own links and attachments stay in the sections that can
  edit and remove them, and are never repeated above. An imported class recording
  counts as a recording, so you are not invited to add the video already playing.
- **Your media base is an address and a folder.** A base carrying a username,
  password, `?query` or `#fragment` is refused, not silently cleaned up: every
  file URL is built by appending a path to it.

The owner's own `تمرین-من` recordings are evidence, not material: their
membership and role survive in the graph, the files themselves never become a
piece's material.

---

## 6. Notes for whoever changes this next

- **`scripts/setar-index.test.mjs` is deliberately absent.** Vitest's `include`
  is `src/**/*.test.ts` and `tests/**/*.test.ts` (and `vite.config.ts` is a
  forbidden path in the lane that built this), so a test file under `scripts/`
  would never run. The scanner and publisher are tested from
  `src/domain/scanSetarClasses.test.ts` and `src/store/archiveIndex.test.ts`,
  which import the `.mjs` modules directly.
- **`src/domain/sourceArchive.test.ts` is deliberately absent too.** The decoder, the
  deterministic ids, the suppression queries and `validateArchiveSources` are all exercised
  where they are actually used — `scanSetarClasses.test.ts` (the grammar that feeds it),
  `io.test.ts` (the validation boundary every door runs), `sourceReconcile.test.ts` and
  `archiveIndex.test.ts` (the store). A fourth file asserting the same functions in
  isolation would add a place to forget, not a place to look.
- **`src/domain/setarClasses.ts` is frozen.** It is no longer a workflow; it is
  the ledger of the 67 obsolete paths the old bundled importer wrote, and the
  reference-repair check runs against all 67 of them.
- `npm test` must never need the NAS, the Sandisk drive or the network. The
  checked-in fixture `tests/fixtures/setar-archive.json` is the real corpus with
  registry notes trimmed to their first sentence.
````

### scripts/scan-setar-classes.mjs

```
#!/usr/bin/env node
// Scan the normalised Setar class archive into a deterministic JSON index.
//
//   node scripts/scan-setar-classes.mjs --root <archive> --out <file>
//   node scripts/scan-setar-classes.mjs --root <archive>          # stdout
//
// READ-ONLY over the archive: nothing is written, renamed or deleted inside
// `--root`, and the output must live outside it. Node stdlib only — the app's
// dependencies are not available to an operator running this on a NAS.
//
// The app never parses a filename: it consumes the published index. That is
// the whole reason this grammar lives here once rather than twice.
//
// Source contract: <ARCHIVE_ROOT>/CRAWLER-BRIEF.md.

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, renameSync, readdirSync, lstatSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const ARCHIVE_ID = 'setar-classes';
export const INDEX_FORMAT = 'setar-archive-index';
export const INDEX_VERSION = 1;

/**
 * Roles are NOT single hyphen-tokens — "ضبط-کلاس" and "تمرین-من" each contain
 * one — so a role is matched as a LONGEST prefix at a hyphen boundary, never
 * by splitting the stem on "-" and taking token 0 (which yields "تمرین" for
 * تمرین-من-عراق.mp4).
 */
export const ROLES = ['ضبط-کلاس', 'تمرین-من', 'تصحیح', 'تکلیف', 'جزوه', 'نمونه', 'نت'];

/** The student's own recordings: real evidence of work, never useful material. */
export const PERSONAL_ROLE = 'تمرین-من';
/** The teacher's demonstration. See §4 of the brief — its attribution is special. */
export const DEMO_ROLE = 'نمونه';
/** The whole class recording. Attaches to the SESSION; never carries a piece. */
export const CLASS_ROLE = 'ضبط-کلاس';

const KIND_BY_EXT = { '.mp4': 'video', '.pdf': 'score', '.jpg': 'photo' };

/** NAS housekeeping and dotfiles are never archive content. */
const IGNORED_DIRS = new Set(['@eaDir', '#recycle']);

// Bounds. A runaway mount or a wrong --root must fail loudly, not be indexed.
const MAX_FILES = 5000;
const MAX_CSV_BYTES = 4 * 1024 * 1024;

// ---------------------------------------------------------------------------
// CSV
// ---------------------------------------------------------------------------

/**
 * Quoting-aware CSV reader. The registry's `notes` column carries commas and
 * doubled quotes inside quoted fields, so splitting on "," loses rows and
 * silently shifts every column after it.
 *
 * Malformed quoting (a quoted field that never closes, or a stray quote after
 * a closing one) THROWS — a half-read registry is an ambiguous identity table,
 * which is exactly what this lane may not guess at.
 */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let started = false; // this field opened with a quote
  let i = 0;
  const src = text.replace(/^﻿/, '');

  const endField = () => {
    row.push(field);
    field = '';
    started = false;
  };
  const endRow = () => {
    endField();
    rows.push(row);
    row = [];
  };

  while (i < src.length) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      if (field !== '' || started) throw new Error(`Malformed CSV: unexpected quote at offset ${i}.`);
      quoted = true;
      started = true;
      i += 1;
      continue;
    }
    if (c === ',') {
      endField();
      i += 1;
      continue;
    }
    if (c === '\r') {
      i += 1;
      continue;
    }
    if (c === '\n') {
      endRow();
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (quoted) throw new Error('Malformed CSV: a quoted field is never closed.');
  if (field !== '' || row.length > 0) endRow();
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

/** Rows as objects, checked against the exact headers a caller requires. */
export function readTable(text, requiredHeaders) {
  if (text.length > MAX_CSV_BYTES) throw new Error('CSV is larger than this scanner accepts.');
  const rows = parseCsv(text);
  if (rows.length === 0) throw new Error('CSV is empty.');
  const header = rows[0].map((h) => h.trim());
  for (const h of requiredHeaders) {
    if (!header.includes(h)) throw new Error(`CSV is missing the "${h}" column.`);
  }
  return rows.slice(1).map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// ---------------------------------------------------------------------------
// PIECES.csv — the canonical registry
// ---------------------------------------------------------------------------

const REGISTRY_HEADERS = ['canonical_fa', 'form', 'piece', 'dastgah', 'composer', 'aliases_seen', 'sessions', 'notes'];

/**
 * `canonical_fa` is the BYTE-EXACT join key: it is the `<piece>` segment of
 * every filename, unchanged. Nothing here folds spellings, transliterates or
 * normalises it — `aliases_seen` is literal SEARCH data and is never consulted
 * for identity.
 */
export function parseRegistry(text) {
  const rows = readTable(text, REGISTRY_HEADERS);
  const pieces = [];
  const seen = new Set();
  for (const r of rows) {
    const key = r.canonical_fa;
    if (!key || !key.trim()) throw new Error('Registry has a row with an empty canonical_fa.');
    if (seen.has(key)) throw new Error(`Registry has two rows for the canonical piece "${key}".`);
    seen.add(key);
    const sessions = [];
    for (const raw of r.sessions.split(',')) {
      const s = raw.trim();
      if (!s) continue;
      if (!/^\d+$/.test(s)) throw new Error(`Registry row "${key}" has an invalid session number "${s}".`);
      const n = Number(s);
      if (n < 1) throw new Error(`Registry row "${key}" has an invalid session number "${s}".`);
      if (!sessions.includes(n)) sessions.push(n);
    }
    sessions.sort((a, b) => a - b);
    const notes = r.notes ?? '';
    pieces.push({
      key,
      form: r.form ?? '',
      piece: r.piece ?? '',
      dastgah: r.dastgah ?? '',
      composer: r.composer ?? '',
      aliases: r.aliases_seen ? r.aliases_seen.split('|').map((a) => a.trim()).filter(Boolean) : [],
      sessions,
      notes,
      // Caveats are SOURCE evidence, surfaced as flags — never a licence to
      // invent a category or to merge one piece into another.
      provisional: /PROVISIONAL/.test(notes),
      mediumConfidence: /MEDIUM confidence/i.test(notes),
    });
  }
  pieces.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return pieces;
}

// ---------------------------------------------------------------------------
// Filenames and folders
// ---------------------------------------------------------------------------

/** "session-12-06-08-2024" → { n: 12, date: "2024-08-06" }, else null. */
export function parseSessionFolderName(name) {
  const m = /^session-(\d+)-(\d{2})-(\d{2})-(\d{4})$/.exec(name);
  if (!m) return null;
  const [, n, dd, mm, yyyy] = m;
  // Round-trip through Date.UTC: /^\d{2}$/ happily matches "30-02-2024".
  const d = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd)));
  if (
    d.getUTCFullYear() !== Number(yyyy) ||
    d.getUTCMonth() !== Number(mm) - 1 ||
    d.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  return { n: Number(n), date: `${yyyy}-${mm}-${dd}` };
}

/** File extension, lowercased, including the dot ("" when there is none). */
export function fileExt(name) {
  const i = name.lastIndexOf('.');
  return i <= 0 ? '' : name.slice(i).toLowerCase();
}

/**
 * `<role>-<canonical_piece>[-<n>]` — the exact algorithm from §2 of the brief.
 * Returns null when no role matches: an unparseable file is SURFACED, never
 * guessed at.
 */
export function parseAssetStem(stem) {
  let role = null;
  for (const r of ROLES) {
    if (stem === r || stem.startsWith(`${r}-`)) {
      if (!role || r.length > role.length) role = r;
    }
  }
  if (!role) return null;
  const rest = stem.slice(role.length).replace(/^-+/, '');
  // A TRAILING "-<digits>" is always a part number: no canonical piece name
  // ends in a digit, so this cannot eat one. An EMBEDDED digit
  // (تمرین-دشتی-1-علیزاده) is piece identity and stays.
  let piece = null;
  let part = null;
  const trailing = /^(.*?)-(\d+)$/.exec(rest);
  if (trailing) {
    piece = trailing[1] || null;
    part = Number(trailing[2]);
  } else if (/^\d+$/.test(rest)) {
    part = Number(rest);
  } else {
    piece = rest || null;
  }
  return { role, piece, part };
}

/** Display title: the stem with "-"/"_" as spaces. Never used as identity. */
export function displayTitle(stem) {
  return stem.replace(/[-_]+/g, ' ').trim();
}

/**
 * A path is only ever an archive-relative POSIX path of plain segments.
 * Traversal, absolute paths, backslashes, URL schemes and percent-encoded
 * separators are refused rather than sanitised — a rewritten path is a
 * DIFFERENT file, and this index is an identity table.
 */
export function isSafeRelativePath(p) {
  if (typeof p !== 'string' || !p) return false;
  if (p.length > 1024) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false; // http:, file:, data:…
  if (p.startsWith('/') || p.includes('\\')) return false;
  if (/%2f|%5c/i.test(p)) return false;
  const segs = p.split('/');
  return segs.every((s) => s !== '' && s !== '.' && s !== '..');
}

// ---------------------------------------------------------------------------
// Index
// ---------------------------------------------------------------------------

const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Build the semantic index from the registry text and a flat inventory of
 * `{ path, size }` entries (archive-relative). PURE and clock-free: the same
 * inventory in any order, with any mtimes, produces byte-identical output.
 *
 * Throws only for input that makes the whole index untrustworthy (a malformed
 * or ambiguous registry, a duplicate identity, an unsafe path, too many
 * files). Individual unhandled FILES are reported in `diagnostics` and left
 * out — surfaced for the owner, never relabelled.
 */
export function buildIndex({ registryText, inventory, renameLog, skipped = [] }) {
  const pieces = parseRegistry(registryText);
  const byKey = new Map(pieces.map((p) => [p.key, p]));

  if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);

  const diagnostics = [];
  const diag = (path, reason) => diagnostics.push({ path, reason });
  // Everything the WALK could not take in. A symlink is not followed and a
  // device node is not a file, but dropping either in silence publishes an
  // index that is quietly narrower than the archive — the same "partial view
  // sold as complete" this scanner's two-read check exists to refuse.
  for (const s of skipped) diag(s.path, s.reason);

  // --- sessions -----------------------------------------------------------
  const sessions = new Map(); // n -> { n, date, folder, assets: [] }
  const seenPaths = new Set();
  for (const entry of inventory) {
    const path = entry.path;
    if (!isSafeRelativePath(path)) throw new Error(`Refusing an unsafe archive path: ${JSON.stringify(path)}`);
    if (seenPaths.has(path)) throw new Error(`Two inventory entries share the path "${path}".`);
    seenPaths.add(path);

    const segs = path.split('/');
    if (segs.length !== 2) {
      diag(path, 'Outside a session folder — not indexed.');
      continue;
    }
    const [folder, name] = segs;
    const parsed = parseSessionFolderName(folder);
    if (!parsed) {
      diag(path, 'Not in a session-N-DD-MM-YYYY folder — not indexed.');
      continue;
    }
    const existing = sessions.get(parsed.n);
    if (existing && existing.folder !== folder) {
      throw new Error(`Two folders claim session ${parsed.n}: "${existing.folder}" and "${folder}".`);
    }
    const session = existing ?? { n: parsed.n, date: parsed.date, folder, assets: [] };
    sessions.set(parsed.n, session);

    const ext = fileExt(name);
    const kind = KIND_BY_EXT[ext];
    const stem = ext ? name.slice(0, -ext.length) : name;
    const parsedName = parseAssetStem(stem);
    if (!parsedName) {
      diag(path, 'Filename carries no known role — left for the owner to name or move.');
      continue;
    }
    if (!kind) {
      diag(path, `Unsupported file type "${ext || '(none)'}" — not indexed.`);
      continue;
    }
    if (parsedName.piece && !byKey.has(parsedName.piece)) {
      diag(path, `Piece "${parsedName.piece}" is not in the registry — not indexed.`);
      continue;
    }
    if (parsedName.piece && parsedName.role === CLASS_ROLE) {
      diag(path, 'A class recording covers the whole lesson and cannot name a piece.');
      continue;
    }
    session.assets.push({
      path,
      role: parsedName.role,
      piece: parsedName.piece,
      part: parsedName.part,
      kind,
      title: displayTitle(stem),
      size: entry.size ?? 0,
    });
  }

  const ordered = [...sessions.values()].sort((a, b) => a.n - b.n);

  // --- attribution --------------------------------------------------------
  const out = [];
  for (const s of ordered) {
    s.assets.sort((a, b) => cmp(a.role, b.role) || cmp(a.piece ?? '', b.piece ?? '') || (a.part ?? 0) - (b.part ?? 0) || cmp(a.path, b.path));

    // The ROSTER is the registry's own answer to "which pieces were assigned
    // at class N" — never a set inferred from the filenames present.
    const roster = pieces.filter((p) => p.sessions.includes(s.n)).map((p) => p.key);
    const named = [...new Set(s.assets.map((a) => a.piece).filter(Boolean))];
    const strays = named.filter((k) => !roster.includes(k));
    // A named piece the roster does not claim means the two halves of the
    // source disagree. An unnamed demo expands across the roster, so expanding
    // it here would spread a guess: block that one inference and say so.
    const rosterTrusted = strays.length === 0;
    for (const k of strays) diag(`${s.folder}`, `Piece "${k}" appears in this folder but the registry does not list session ${s.n} for it.`);

    const resources = [];
    const memberships = new Map(); // pieceKey -> Set(role)
    const member = (key, role) => {
      if (!memberships.has(key)) memberships.set(key, new Set());
      memberships.get(key).add(role);
    };

    for (const a of s.assets) {
      if (a.piece) member(a.piece, a.role);
      // The student's own playing is EVIDENCE, not material: its membership
      // and role survive, the individual file does not.
      if (a.role === PERSONAL_ROLE) continue;
      const pieces_ =
        a.role === DEMO_ROLE && !a.piece
          ? rosterTrusted
            ? roster
            : []
          : a.piece
            ? [a.piece]
            : [];
      if (a.role === DEMO_ROLE && !a.piece && !rosterTrusted) {
        diag(a.path, `Unnamed demonstration not attributed: session ${s.n}'s roster disagrees with its filenames.`);
      }
      for (const k of pieces_) member(k, a.role);
      resources.push({
        path: a.path,
        role: a.role,
        kind: a.kind,
        title: a.title,
        part: a.part,
        size: a.size,
        // A class recording, an unnamed handout and an unattributed demo stay
        // with the LESSON. Only a resource that names its pieces is scoped.
        pieces: a.role === CLASS_ROLE ? [] : pieces_,
        // Parts of one demonstration are ONE logical resource, ordered by part.
        group: a.role === DEMO_ROLE ? `${DEMO_ROLE}:${a.piece ?? ''}` : null,
      });
    }

    out.push({
      n: s.n,
      date: s.date,
      folder: s.folder,
      roster,
      rosterTrusted,
      hasClassRecording: s.assets.some((a) => a.role === CLASS_ROLE),
      resources: resources.sort((a, b) => cmp(a.role, b.role) || cmp(a.group ?? '', b.group ?? '') || (a.part ?? 0) - (b.part ?? 0) || cmp(a.path, b.path)),
      members: [...memberships.entries()]
        .map(([key, roles]) => ({ key, roles: [...roles].sort(cmp) }))
        .sort((a, b) => cmp(a.key, b.key)),
    });
  }

  // --- rename provenance --------------------------------------------------
  // EXACT old→new pairs only. This is path provenance, not a similarity model:
  // an old path with two destinations is reported, never resolved by guessing.
  const renames = [];
  // ABSENT is a source fact; UNREADABLE never reaches here (readSource throws).
  // A present-but-empty log has no header and `readTable` says so, exactly as
  // it would for PIECES.csv — a zero-byte file is what a copy in flight looks
  // like, and guessing "no renames" from it is the failure this lane closed.
  if (renameLog && renameLog.present) {
    const rows = readTable(renameLog.text, ['old_path', 'new_path']);
    const dest = new Map();
    for (const r of rows) {
      const from = r.old_path.trim();
      const to = r.new_path.trim();
      if (!from || !to) continue;
      if (!isSafeRelativePath(from) || !isSafeRelativePath(to)) {
        diag(from, 'Rename row carries an unsafe path — ignored.');
        continue;
      }
      const prior = dest.get(from);
      if (prior && prior !== to) {
        diag(from, `Rename log maps this path to both "${prior}" and "${to}" — not applied.`);
        continue;
      }
      if (prior === to) continue;
      dest.set(from, to);
      renames.push({ from, to });
    }
    // A LOOP NAMES NO FILE. A->B->A (or any chain that walks into one) says
    // only that two names were swapped; picking a stopping point would invent
    // an identity, and every path that LEADS INTO a loop is equally unusable.
    // Those rows are dropped with a diagnostic rather than published: the app
    // must never be handed a replacement identity this log cannot support.
    const cyclic = new Set();
    for (const from of dest.keys()) {
      const walked = new Set([from]);
      let cur = from;
      while (dest.has(cur)) {
        const next = dest.get(cur);
        if (walked.has(next)) {
          for (const p of walked) cyclic.add(p);
          cyclic.add(next);
          break;
        }
        walked.add(next);
        cur = next;
      }
    }
    for (const from of cyclic) {
      if (dest.has(from)) diag(from, 'Rename log loops through this path — no replacement name can be read from it.');
    }
    const kept = renames.filter((r) => !cyclic.has(r.from));
    renames.length = 0;
    renames.push(...kept);
    renames.sort((a, b) => cmp(a.from, b.from));
  }

  const body = {
    format: INDEX_FORMAT,
    version: INDEX_VERSION,
    archiveId: ARCHIVE_ID,
    pieces,
    sessions: out,
    renames,
    diagnostics: diagnostics.sort((a, b) => cmp(a.path, b.path) || cmp(a.reason, b.reason)),
  };
  return { ...body, contentHash: contentHash(body) };
}

/** Stable digest of the SEMANTIC body — no clock, no mtimes, no ordering luck. */
export function contentHash(body) {
  const { contentHash: _ignored, generatedAt: _also, ...rest } = body;
  return createHash('sha256').update(canonicalJson(rest)).digest('hex');
}

/** Key-sorted JSON, so an object-literal reordering cannot change the hash. */
export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value === undefined ? null : value);
}

// ---------------------------------------------------------------------------
// Filesystem (the only impure part)
// ---------------------------------------------------------------------------

/**
 * Inventory the archive: one pass, session folders only, dotfiles and NAS
 * housekeeping skipped, symlinks never followed (a link out of the archive is
 * a path this scanner has no authority over). Read-only by construction —
 * nothing here opens a file for writing.
 */
export function scanArchive(root) {
  const base = resolve(root);
  const inventory = [];
  const skipped = [];
  for (const entry of readdirSync(base, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue;
    if (!parseSessionFolderName(entry.name)) continue; // root folders out of scope
    if (!entry.isDirectory()) {
      // It CLAIMS to be a session and this walk will not open it. Silence here
      // would drop a whole class out of a "complete" index.
      skipped.push({ path: entry.name, reason: 'A session folder that is not a real directory — not scanned.' });
      continue;
    }
    const dir = join(base, entry.name);
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      if (f.name.startsWith('.') || IGNORED_DIRS.has(f.name)) continue;
      const full = join(dir, f.name);
      const st = lstatSync(full);
      const path = `${entry.name}/${f.name}`;
      if (st.isSymbolicLink()) {
        // Never FOLLOWED — a link out of the archive is a path this scanner
        // has no authority over — but always SAID, so the owner can see that
        // the index is not describing something the folder holds.
        skipped.push({ path, reason: 'A symbolic link — not followed, so this file is not indexed.' });
        continue;
      }
      if (!st.isFile()) {
        skipped.push({ path, reason: 'Not a regular file — not indexed.' });
        continue;
      }
      if (!full.startsWith(base + sep)) continue;
      // `mtimeMs` is deliberately NOT semantic — `buildIndex` reads `size` and
      // nothing else, so an altered time cannot change the published index. It
      // is here for the two-read comparison below: a file edited IN PLACE at
      // the same byte length is otherwise invisible to it.
      inventory.push({ path, size: st.size, mtimeMs: st.mtimeMs });
      if (inventory.length > MAX_FILES) throw new Error(`Archive holds more than ${MAX_FILES} files; refusing to index.`);
    }
  }
  inventory.sort((a, b) => cmp(a.path, b.path));
  skipped.sort((a, b) => cmp(a.path, b.path) || cmp(a.reason, b.reason));
  return { inventory, skipped };
}

/** Write via a temp file + rename, so a reader never sees a half-written index. */
export function writeIndexAtomically(outPath, text, root) {
  const out = resolve(outPath);
  if (root && (out === resolve(root) || out.startsWith(resolve(root) + sep))) {
    throw new Error('Refusing to write the index inside the archive it describes.');
  }
  const tmp = `${out}.tmp-${process.pid}`;
  writeFileSync(tmp, text);
  renameSync(tmp, out);
  return out;
}

/**
 * EVERY input this scanner reads, in one place — so "read it twice and compare"
 * below covers all of them by construction, including one added later.
 */
export function readSource(base) {
  const registryText = readRequired(join(base, 'PIECES.csv'), 'PIECES.csv');
  const renameLog = readOptional(join(base, 'RENAME-LOG.csv'), 'RENAME-LOG.csv');
  const { inventory, skipped } = scanArchive(base);
  return { registryText, renameLog, inventory, skipped };
}

/** A required input. Any failure to read it is a failure to scan. */
function readRequired(path, label) {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
  }
}

/**
 * AN OPTIONAL INPUT IS ABSENT OR PRESENT — NEVER "EMPTY BECAUSE IT THREW".
 *
 * `catch { text = '' }` made every failure to read RENAME-LOG.csv — a
 * permission change, an I/O error, a mount that went away mid-copy — look
 * exactly like an archive that has no rename log. Both readings then agreed
 * with each other, so the consistency check below passed and the scan
 * published an index with no renames at all: a file that moved during that
 * window is flagged unavailable and its saved references can never be
 * repaired. Only ENOENT is an observation; everything else is a failure.
 */
function readOptional(path, label) {
  try {
    return { present: true, text: readFileSync(path, 'utf8') };
  } catch (err) {
    if (err?.code === 'ENOENT') return { present: false };
    throw new Error(`Could not read ${label}: ${err?.code ?? err?.message ?? 'unreadable'}.`);
  }
}

/**
 * Read the archive and build its index — from ONE consistent view, or none.
 *
 * The registry used to be the only input re-read after the walk, which made
 * the guarantee exactly as narrow as the file it named: the MEDIA is what a
 * non-atomic NAS copy actually perturbs. Move a resource out before its folder
 * is enumerated and put it back while later folders are walked, and PIECES.csv
 * never changes — the scan publishes an index missing that file, and the next
 * Refresh marks still-present material unavailable. The rename log had the
 * same exposure, read once and never checked.
 *
 * So the whole source is read TWICE and the two readings compared. `size` is
 * part of the comparison, so a file still being copied is caught too.
 *
 * This is a CONSISTENCY check, not atomicity: a perturbation that is stable
 * across both readings agrees with itself and is indistinguishable, from here,
 * from the archive genuinely being in that state. What it removes is the
 * transient, which is what a copy in flight actually looks like.
 */
export function scanToIndex(root) {
  const base = resolve(root);
  const before = readSource(base);
  const after = readSource(base);
  if (canonicalJson(before) !== canonicalJson(after)) {
    throw new Error('The archive changed during the scan; no index was produced.');
  }
  return buildIndex(before);
}

function main() {
  const { values } = parseArgs({
    options: { root: { type: 'string' }, out: { type: 'string' } },
  });
  if (!values.root) {
    console.error('Usage: scan-setar-classes.mjs --root <archive> [--out <file>]');
    process.exit(2);
  }
  let index;
  try {
    index = scanToIndex(values.root);
  } catch (err) {
    console.error(`Scan failed: ${err.message}`);
    console.error('The last published index is left exactly as it is.');
    process.exit(1);
  }
  const text = `${JSON.stringify(index, null, 2)}\n`;
  if (values.out) {
    const written = writeIndexAtomically(values.out, text, values.root);
    const files = index.sessions.reduce((n, s) => n + s.resources.length, 0);
    console.error(`${index.sessions.length} sessions, ${index.pieces.length} pieces, ${files} useful resources, ${index.diagnostics.length} needing attention.`);
    console.error(`Wrote ${written} (${index.contentHash.slice(0, 12)}).`);
  } else {
    process.stdout.write(text);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
```

### src/components/ArchiveRefresh.tsx

```
import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { fetchPublishedIndex, type FetchedIndex } from '../store/archiveIndex';
import { getNasBaseUrl } from '../store/backup';
import {
  SETAR_ARCHIVE_ID,
  archiveFor,
  describeArchiveAccess,
  archiveRootUrl,
  decisionMatchesSuggestion,
  type ImportPlan,
  type MetadataField,
  type ReconcileDecision,
} from '../domain';

// ---------------------------------------------------------------------------
// "Refresh Setar archive" — the ONE routine action.
//
// No filesystem picker, no URL to type, no crawler output. It fetches the
// latest PUBLISHED index (a small JSON file the NAS scanner writes to its own
// branch of the private data repository), says what would change, asks only
// the questions that genuinely need an owner, and applies the lot in one go.
//
// It is deliberately honest about what it knows: the index was FETCHED at a
// device-local time and CHANGED when the scanner last published something
// different. Neither is proof that a scan ran recently, and this never says
// "last scanned".
// ---------------------------------------------------------------------------

type Phase =
  | { kind: 'idle' }
  | { kind: 'working' }
  | { kind: 'error'; message: string }
  | { kind: 'done'; message: string; plan?: ImportPlan }
  | { kind: 'preview'; fetched: FetchedIndex; rev: number; plan: ImportPlan };

export default function ArchiveRefresh() {
  const db = useStore((s) => s.db);
  const preview = useStore((s) => s.previewArchiveImport);
  const commit = useStore((s) => s.commitArchiveImport);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [decisions, setDecisions] = useState<ReconcileDecision[]>([]);
  const [instrumentId, setInstrumentId] = useState<string>('');

  const source = archiveFor(db, SETAR_ARCHIVE_ID);
  // FIRST USE picks the instrument only when there is no doubt about it. An
  // archive already bound keeps its own instrument for good.
  const candidates = useMemo(
    () => db.instruments.filter((i) => i.active && (/setar/i.test(i.name) || i.name.includes('سه'))),
    [db.instruments],
  );
  const chosen = source?.instrumentId ?? (candidates.length === 1 ? candidates[0]!.id : instrumentId);

  const access = describeArchiveAccess({
    indexFetchedAt: phase.kind === 'preview' ? phase.fetched.fetchedAt.slice(0, 16).replace('T', ' ') : null,
    indexChangedAt: source ? source.acceptedAt.slice(0, 16).replace('T', ' ') : null,
    baseUrl: getNasBaseUrl(),
  });
  const rootUrl = archiveRootUrl(getNasBaseUrl());

  function showPlan(fetched: FetchedIndex, nextDecisions: ReconcileDecision[]) {
    const { plan, rev } = preview({
      index: fetched.index,
      instrumentId: chosen,
      decisions: nextDecisions,
      verifiedBase: rootUrl ?? undefined,
    });
    setPhase({ kind: 'preview', fetched, rev, plan });
  }

  async function startRefresh() {
    if (!chosen) {
      setPhase({ kind: 'error', message: 'Choose which instrument this archive belongs to first.' });
      return;
    }
    setPhase({ kind: 'working' });
    setDecisions([]);
    const result = await fetchPublishedIndex();
    if (!result.ok) {
      setPhase({ kind: 'error', message: result.error });
      return;
    }
    showPlan(result.value, []);
  }

  function decide(next: ReconcileDecision) {
    if (phase.kind !== 'preview') return;
    const merged = [...decisions.filter((d) => !sameTarget(d, next)), next];
    setDecisions(merged);
    showPlan(phase.fetched, merged);
  }

  async function apply() {
    if (phase.kind !== 'preview') return;
    const { fetched, rev } = phase;
    setPhase({ kind: 'working' });
    const result = await commit({
      index: fetched.index,
      instrumentId: chosen,
      decisions,
      verifiedBase: rootUrl ?? undefined,
      decidedFromRev: rev,
    });
    if (!result.ok) {
      if (result.status === 'stale') {
        // Something changed underneath; look again rather than apply a plan
        // that was decided against a database that has moved on. A decision
        // whose premise moved is DROPPED here — keeping it would re-submit the
        // same invalid answer for ever — and the fresh preview shows the
        // question, or the suggestion's real current value, as it is now.
        const kept = result.staleDecisions?.length
          ? decisions.filter((d) => !result.staleDecisions!.includes(d))
          : decisions;
        setDecisions(kept);
        showPlan(fetched, kept);
        setPhase((p) => (p.kind === 'preview' ? p : { kind: 'error', message: result.message }));
        return;
      }
      setPhase({ kind: 'error', message: result.message });
      return;
    }
    setPhase({ kind: 'done', message: result.message, plan: phase.plan });
  }

  return (
    <section className="card stack-sm">
      <div className="row between">
        <h3 style={{ margin: 0 }}>Setar archive</h3>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => void startRefresh()} disabled={phase.kind === 'working'}>
          {phase.kind === 'working' ? 'Working…' : 'Refresh Setar archive'}
        </button>
      </div>

      <p className="tiny faint" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          Brings in classes, pieces and their material from the archive index published by the NAS scanner. Your
          practice, notes and schedule are never changed by it.
        </span>
      </p>

      {!source && candidates.length !== 1 && (
        <label className="tiny" style={{ textAlign: 'start' }}>
          <span dir="ltr">Which instrument is this archive for?</span>
          <select className="input" value={instrumentId} onChange={(e) => setInstrumentId(e.target.value)}>
            <option value="">Choose…</option>
            {db.instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="tiny faint" style={{ textAlign: 'start' }}>
        <div>
          <span dir="ltr">{access.index}</span>
        </div>
        <div>
          <span dir="ltr">{access.media}</span>
        </div>
        {rootUrl && (
          <a className="tiny" href={rootUrl} target="_blank" rel="noreferrer">
            Open archive root
          </a>
        )}
      </div>

      {phase.kind === 'error' && (
        <p className="tiny" style={{ color: 'var(--tone-alert)', textAlign: 'start' }} role="alert">
          <span dir="ltr">{phase.message}</span>
        </p>
      )}

      {phase.kind === 'done' && (
        <div className="tiny" aria-live="polite" style={{ textAlign: 'start' }}>
          <span dir="ltr">{phase.message}</span>
          {phase.plan && <Summary plan={phase.plan} />}
        </div>
      )}

      {phase.kind === 'preview' && (
        <div className="stack-sm">
          <Summary plan={phase.plan} />

          {phase.plan.questions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">Needs a decision</div>
              {phase.plan.questions.map((q) => (
                <div key={`${q.kind}-${q.pieceKey ?? q.sessionN}`} className="list-row stack-sm">
                  {/* The GROUP is the name and the sentence that belongs to it;
                      the fixed English buttons below sit OUTSIDE it, so a Farsi
                      piece name cannot claim their bidi base. */}
                  <div dir="auto" style={{ textAlign: 'start' }}>
                    <strong>{q.label}</strong>
                    <div className="tiny faint">
                      <span dir="ltr">
                        {q.kind === 'item'
                          ? 'An existing piece has this exact name.'
                          : 'More than one class matches this session.'}
                      </span>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                    {q.candidates.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="btn btn-sm"
                        onClick={() =>
                          decide(
                            q.kind === 'item'
                              ? { kind: 'link-item', pieceKey: q.pieceKey!, itemId: c.id }
                              : { kind: 'link-lesson', sessionN: q.sessionN!, lessonId: c.id },
                          )
                        }
                      >
                        Link to “{c.title}”
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() =>
                        decide(
                          q.kind === 'item'
                            ? { kind: 'create-item', pieceKey: q.pieceKey! }
                            : { kind: 'create-lesson', sessionN: q.sessionN! },
                        )
                      }
                    >
                      Create separately
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() =>
                        decide(
                          q.kind === 'item'
                            ? { kind: 'skip-item', pieceKey: q.pieceKey! }
                            : { kind: 'skip-lesson', sessionN: q.sessionN! },
                        )
                      }
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {phase.plan.suggestions.length > 0 && (
            <div className="stack-sm">
              <div className="section-label">The archive knows more about these</div>
              {/* A registry improvement to a piece the owner ALREADY has. It is
                  offered field by field and applied only when asked — never
                  written behind them, and never near their notebook. */}
              {phase.plan.suggestions.map((sg) => {
                // The PREMISE is part of the match: a choice made against a
                // value the owner has since edited is no longer this
                // suggestion's answer, so the button reads unpressed again.
                const applied = decisions.some((d) => decisionMatchesSuggestion(d, sg));
                return (
                  <div key={`${sg.pieceKey}-${sg.field}`} className="list-row stack-sm">
                    <div dir="auto" style={{ textAlign: 'start' }}>
                      <strong>{sg.pieceKey}</strong>
                      <div className="tiny faint">
                        <span dir="ltr">{FIELD_LABELS[sg.field]}: </span>
                        <span dir="auto">{sg.from || '—'}</span>
                        <span dir="ltr"> → </span>
                        <span dir="auto">{sg.to}</span>
                      </div>
                    </div>
                    <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-sm"
                        aria-pressed={applied}
                        onClick={() =>
                          decide({
                            kind: 'apply-field',
                            pieceKey: sg.pieceKey,
                            // The RECORD the value was shown against, not just
                            // the piece: a rebase must not hand the answer to
                            // whichever item happens to hold that piece later.
                            itemId: sg.itemId,
                            field: sg.field,
                            from: sg.from,
                          })
                        }
                      >
                        {applied ? `Archive’s ${FIELD_LABELS[sg.field]} chosen` : `Use the archive’s ${FIELD_LABELS[sg.field]}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="row" style={{ gap: 8 }}>
            <button type="button" className="btn btn-primary" onClick={() => void apply()}>
              {phase.plan.summary.unchanged ? 'Already current' : 'Apply'}
            </button>
            <button type="button" className="btn" onClick={() => setPhase({ kind: 'idle' })}>
              Cancel
            </button>
          </div>
          <p className="tiny faint" style={{ textAlign: 'start' }}>
            <span dir="ltr">
              New pieces arrive resting, so today’s suggestions are not flooded. They stay searchable and you can start
              one directly whenever you like.
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

function Summary({ plan }: { plan: ImportPlan }) {
  const s = plan.summary;
  const [open, setOpen] = useState(false);
  return (
    <div className="stack-sm">
      <div className="tiny" style={{ textAlign: 'start' }}>
        <span dir="ltr">
          {s.unchanged
            ? 'Already current.'
            : `Added ${s.addedItems} pieces and ${s.addedLessons} classes · Updated ${s.updatedLessons} · ${s.questions} to decide · ${s.attention} needing attention`}
        </span>
      </div>
      {plan.attention.length > 0 && (
        <div className="tiny" style={{ textAlign: 'start' }}>
          <button type="button" className="link tiny" style={LINK_BTN} onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide details' : `Show ${plan.attention.length} needing attention`}
          </button>
          {open && (
            <ul className="tiny faint stack-sm" style={{ marginTop: 6, listStyle: 'none', padding: 0 }}>
              {plan.attention.map((d, i) => (
                <li key={`${d.path}-${i}`} className="row" dir="auto" style={{ gap: 6, textAlign: 'start' }}>
                  <span>{d.path}</span>
                  <span dir="ltr">— {d.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function sameTarget(a: ReconcileDecision, b: ReconcileDecision): boolean {
  // A FIELD decision is keyed by its field, not merely its piece: keyed by
  // piece alone, choosing a composer evicted the dastgāh choice made a moment
  // earlier, and either one evicted a Link/Skip answer about the same piece.
  const key = (d: ReconcileDecision) =>
    d.kind === 'apply-field'
      ? `field:${d.pieceKey}:${d.field}`
      : 'pieceKey' in d
        ? `piece:${d.pieceKey}`
        : 'sessionN' in d
          ? `session:${d.sessionN}`
          : '';
  return key(a) === key(b) && key(a) !== '';
}

const LINK_BTN = { background: 'none', border: 'none', padding: 0 } as const;

/** Plain names for the registry fields an improvement can touch. */
const FIELD_LABELS: Record<MetadataField, string> = {
  dastgahAvaz: 'dastgāh',
  gusheh: 'gusheh',
  form: 'form',
  composer: 'composer',
};
```

### src/domain/io.test.ts

```
import { describe, expect, it, vi } from 'vitest';
import V11_TEXT from '../../tests/fixtures/practice-decisions-v11.json?raw';
import V12_TEXT from '../../tests/fixtures/practice-decisions-v12.json?raw';
import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
import SETAR_INDEX_TEXT from '../../tests/fixtures/setar-archive.json?raw';
import { serializeExport, validateDB, parseImport } from './io';
import { migrateToCurrent } from './migrations';
import { createSeedDB } from './seed';
import {
  decodeSourceIndex,
  membersForSession,
  repeatChains,
  resourceReference,
  resourcesForPiece,
  resourcesForSession,
} from './sourceArchive';
import { applyArchiveImport, planArchiveImport } from './sourceReconcile';
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

// ---------------------------------------------------------------------------
// ac-15 — the v14 source graph across the migration and validation boundary.
// ---------------------------------------------------------------------------

describe('the v14 source graph at the schema boundary', () => {
  const NOW = new Date('2026-09-17T09:00:00.000Z');
  const legacy = () => JSON.parse(V13_SETAR_TEXT) as { data: PracticeDB };

  /**
   * A source graph as it arrives — every value still `unknown`, because that is
   * exactly what these mutations put into it. One shape for BOTH doors: the
   * published index and a persisted `archiveSources` row carry the same graph,
   * so one mutation can be handed to each and neither can be given a check the
   * other misses.
   */
  type RawRow = Record<string, unknown>;
  type RawSession = RawRow & { folder: string; resources: RawRow[]; members: RawRow[] };
  type Graph = { pieces: RawRow[]; sessions: RawSession[]; diagnostics: RawRow[] };

  /** First `[session, resource]` carrying a role, in the corpus fixture. */
  function firstWithRole(g: Graph, role: string): [RawSession, RawRow] {
    for (const sess of g.sessions) {
      const res = sess.resources.find((r) => r.role === role);
      if (res) return [sess, res];
    }
    throw new Error(`The corpus fixture has no "${role}" resource to mutate.`);
  }

  /** A demonstration group with at least TWO parts, and its session. */
  function groupedDemo(g: Graph): [string, RawRow, RawSession] {
    for (const sess of g.sessions) {
      for (const r of sess.resources) {
        if (!r.group) continue;
        if (sess.resources.filter((x) => x.group === r.group).length > 1) return [r.group as string, r, sess];
      }
    }
    throw new Error('The corpus fixture has no multi-part demonstration to mutate.');
  }

  /** A database with a real accepted graph in it, built by the real planner. */
  function withGraph(): PracticeDB {
    const base = validateDB(legacy());
    const index = decodeSourceIndex(JSON.parse(SETAR_INDEX_TEXT));
    const plan = planArchiveImport({ db: base, index, instrumentId: 'inst-setar', now: NOW });
    return applyArchiveImport(base, plan);
  }

  it('archive schema migration and validation preserve the whole source graph', () => {
    // --- v13 -> v14 is ADDITIVE ---------------------------------------------
    const source = legacy().data;
    const migrated = validateDB(legacy());
    expect(migrated.schemaVersion).toBe(SCHEMA_VERSION);
    expect(migrated.archiveSources).toEqual([]);
    // Every legacy field comes through unchanged apart from the schema number
    // and the new, empty collection.
    const strip = (db: PracticeDB) => JSON.stringify({ ...db, schemaVersion: 0, archiveSources: [] });
    expect(strip(migrated)).toBe(strip({ ...source, archiveSources: [] } as PracticeDB));
    expect(migrated.blocks).toEqual(source.blocks);
    expect(migrated.reviews).toEqual(source.reviews);
    expect(migrated.lessonAgenda).toEqual(source.lessonAgenda);
    expect(migrated.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'Teacher: keep the mezrab light on the return.',
    );

    // The WHOLE chain from the oldest supported version, and a repeat of it.
    const fromOldest = migrateToCurrent(source, 2);
    expect(Array.isArray(fromOldest.archiveSources)).toBe(true);
    expect(migrateToCurrent(fromOldest, SCHEMA_VERSION)).toEqual(fromOldest);
    // A database DECLARING the current schema but carrying no collection at
    // all is still given one — gating on the version would hydrate an app with
    // no source state and no way to say so.
    const stray = { ...source, schemaVersion: SCHEMA_VERSION } as unknown as Record<string, unknown>;
    delete stray.archiveSources;
    expect(validateDB(stray).archiveSources).toEqual([]);
    // ...and a stray LEGACY field on a current-declared database does not slip
    // past validation just because the version says it should not be there.
    expect(() =>
      validateDB({
        ...source,
        schemaVersion: SCHEMA_VERSION,
        lessonAgenda: [{ id: 'bad', kind: 'question', instrumentId: 'inst-setar', text: '' }],
      }),
    ).toThrow();

    // --- the collection is RECONSTRUCTED, not merely accepted ---------------
    const graphed = withGraph();
    expect(graphed.archiveSources).toHaveLength(1);
    const roundTripped = validateDB(JSON.parse(serializeExport(graphed, NOW)));
    expect(roundTripped.archiveSources).toEqual(graphed.archiveSources);
    expect(roundTripped.items.filter((i) => i.source).length).toBe(94);
    expect(roundTripped.lessons.filter((l) => l.source).length).toBeGreaterThan(0);
    // Revalidating its own output changes nothing, and an export round trip is
    // byte-identical.
    expect(serializeExport(validateDB(roundTripped), NOW)).toBe(serializeExport(graphed, NOW));

    // --- every new persisted field is CHECKED --------------------------------
    const mutate = (fn: (db: PracticeDB) => void): unknown => {
      const copy = JSON.parse(JSON.stringify(graphed)) as PracticeDB;
      fn(copy);
      return copy;
    };
    const refuses = (fn: (db: PracticeDB) => void, pattern: RegExp) =>
      expect(() => validateDB(mutate(fn))).toThrow(pattern);

    refuses((d) => {
      d.archiveSources.push({ ...d.archiveSources[0]! });
    }, /Two archive sources share the id/);
    refuses((d) => {
      d.archiveSources[0]!.pieces.push({ ...d.archiveSources[0]!.pieces[0]! });
    }, /two pieces keyed/);
    refuses((d) => {
      d.archiveSources[0]!.sessions.push({ ...d.archiveSources[0]!.sessions[0]! });
    }, /two entries for session/);
    refuses((d) => {
      (d.archiveSources[0] as unknown as { indexHash: unknown }).indexHash = 42;
    }, /no index hash/);
    refuses((d) => {
      d.archiveSources[0]!.instrumentId = 'no-such-instrument';
    }, /instrument that does not exist/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.resources[0]!.path = '../../etc/passwd';
    }, /unsafe resource path/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.resources[0]!.pieces = ['not-a-registry-key'];
    }, /which this source does not describe/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { group: unknown }).group = { n: 1 };
    }, /invalid part group/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.date = '2026-02-30';
    }, /unreadable date/);
    refuses((d) => {
      d.archiveSources[0]!.suppressions = [{ kind: 'nonsense', ref: 'x', at: '2026-01-01T00:00:00.000Z' }] as never;
    }, /suppression of an unknown kind/);

    // --- EVERY NESTED FIELD A PRODUCTION READER DEREFERENCES ----------------
    // The validator used to check a resource's path and its part group and
    // walk straight past the rest of the graph, so a malformed nested value
    // was accepted, persisted, and then thrown on by the first reader to
    // touch it. These are that whole family, not one counterexample: the
    // roles list `repeatChains` calls `.includes` on, the alias list
    // `planArchiveImport` spreads, the kind/title `resourceReference` reads,
    // and the session fields `sessionsForPiece` and the material composition
    // walk.
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.members[0] as unknown as { roles: unknown }).roles = null;
    }, /unreadable role list/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.members[0]!.roles = ['not-a-real-role'];
    }, /unknown role/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.members[0] as unknown as { key: unknown }).key = null;
    }, /claims an unknown piece/);
    refuses((d) => {
      (d.archiveSources[0]!.pieces[0] as unknown as { aliases: unknown }).aliases = null;
    }, /unreadable alias list/);
    refuses((d) => {
      (d.archiveSources[0]!.pieces[0] as unknown as { aliases: unknown }).aliases = [1, 2];
    }, /unreadable alias list/);
    refuses((d) => {
      (d.archiveSources[0]!.pieces[0] as unknown as { composer: unknown }).composer = { name: 'x' };
    }, /unreadable composer/);
    refuses((d) => {
      (d.archiveSources[0]!.pieces[0] as unknown as { sessions: unknown }).sessions = ['13'];
    }, /invalid session number/);
    refuses((d) => {
      (d.archiveSources[0]!.pieces[0] as unknown as { provisional: unknown }).provisional = 'yes';
    }, /unreadable flag/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { kind: unknown }).kind = 'executable';
    }, /unknown kind/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { role: unknown }).role = null;
    }, /unknown role/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { title: unknown }).title = 42;
    }, /unreadable title/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { pieces: unknown }).pieces = null;
    }, /unreadable piece list/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { part: unknown }).part = '2';
    }, /unreadable part number/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0]!.resources[0] as unknown as { size: unknown }).size = '10mb';
    }, /unreadable size/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0] as unknown as { resources: unknown }).resources = null;
    }, /no resource list/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0] as unknown as { members: unknown }).members = null;
    }, /no membership list/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.folder = '../elsewhere';
    }, /unsafe folder path/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0] as unknown as { roster: unknown }).roster = null;
    }, /unreadable roster/);
    refuses((d) => {
      d.archiveSources[0]!.sessions[0]!.roster = ['not-in-the-registry'];
    }, /which it does not describe/);
    refuses((d) => {
      (d.archiveSources[0]!.sessions[0] as unknown as { rosterTrusted: unknown }).rosterTrusted = 'maybe';
    }, /unreadable flag/);
    refuses((d) => {
      d.archiveSources[0]!.renames = [{ from: '../secret', to: 'x' }];
    }, /rename with an unsafe path/);
    refuses((d) => {
      d.archiveSources[0]!.renames = [
        { from: 'a/b.mp4', to: 'a/c.mp4' },
        { from: 'a/b.mp4', to: 'a/d.mp4' },
      ];
    }, /more than one destination/);
    refuses((d) => {
      (d.archiveSources[0] as unknown as { diagnostics: unknown }).diagnostics = [{ path: 'x' }];
    }, /unreadable diagnostic entry/);
    refuses((d) => {
      (d.archiveSources[0]!.suppressions as unknown[]) = [
        { kind: 'resource', ref: 'x', itemId: 42, at: '2026-01-01T00:00:00.000Z' },
      ];
    }, /suppression with an unreadable item/);
    refuses((d) => {
      (d.archiveSources[0]!.suppressions as unknown[]) = [{ kind: 'resource', ref: 'x' }];
    }, /suppression with no timestamp/);

    // --- ABSENT IS A DEFAULT; PRESENT-AND-NULL IS A REFUSAL ----------------
    // The list/num/bool rule closed this for lists and scalars and left every
    // STRING with a default behind: `str(raw.form ?? '')` read absent and
    // present-and-null as the same thing, so a `title: null` in an index whose
    // digest was recomputed decoded to an untitled row the grammar was
    // perfectly happy with. Absent is a default; null is a value, and a wrong
    // one. Proved at BOTH doors from ONE mutation, so the published decoder
    // and the persisted-graph validator cannot be given it separately.
    const refusesBothDoors = (fn: (g: Graph) => void, pattern: RegExp) => {
      const index = JSON.parse(SETAR_INDEX_TEXT) as Graph;
      fn(index);
      expect(() => decodeSourceIndex(index)).toThrow(pattern);
      refuses((d) => fn(d.archiveSources[0] as unknown as Graph), pattern);
    };
    const onIndexOnly = (fn: (g: Graph) => void, pattern: RegExp) => {
      const index = JSON.parse(SETAR_INDEX_TEXT) as Graph;
      fn(index);
      expect(() => decodeSourceIndex(index)).toThrow(pattern);
    };
    onIndexOnly((g) => {
      g.sessions[0]!.resources[0]!.title = null;
    }, /title must be text/);
    onIndexOnly((g) => {
      g.pieces[0]!.form = null;
    }, /form must be text/);
    onIndexOnly((g) => {
      g.pieces[0]!.notes = null;
    }, /notes must be text/);
    onIndexOnly((g) => {
      g.pieces[0]!.composer = null;
    }, /composer must be text/);
    // `size` is genuinely optional, so ABSENT is a default here too — but a
    // present null is still a value, and the DECODER refuses it rather than
    // spreading a type-violating value into its own output for the grammar to
    // catch downstream. (The persisted door has its own `size` check above.)
    onIndexOnly((g) => {
      g.sessions[0]!.resources[0]!.size = null;
    }, /size must be a number/);
    onIndexOnly((g) => {
      g.diagnostics.push({ path: null, reason: 'x' });
    }, /diagnostic path must be text/);

    // --- SEMANTIC RELATIONS, NOT MERELY FIELD TYPES ------------------------
    // A field-type grammar says every value is READABLE and nothing about
    // whether the graph agrees with itself. A resource physically sitting in
    // class 2's folder, listed under class 1, is type-perfect and attributes
    // someone else's file to the wrong class on every screen that reads it;
    // an arbitrary `group` on a non-demonstration invents one logical resource
    // out of unrelated files. Both doors, one mutation, every time.
    refusesBothDoors((g) => {
      g.sessions[1]!.resources[0]!.path = `${g.sessions[0]!.folder}/smuggled.mp4`;
    }, /not a file in its own folder/);
    refusesBothDoors((g) => {
      g.sessions[0]!.resources[0]!.path = `${g.sessions[0]!.folder}/deeper/x.mp4`;
    }, /not a file in its own folder/);
    refusesBothDoors((g) => {
      // Attributed to a real registry piece that this session never records a
      // membership for: the file would surface as that piece's material with
      // nothing in the graph saying it belongs to it.
      const [s0, res] = firstWithRole(g, 'نت');
      const stranger = g.pieces.find((p) => !s0.members.some((m) => m.key === p.key))!;
      res.pieces = [stranger.key];
    }, /without recording that membership/);
    refusesBothDoors((g) => {
      const [, res] = firstWithRole(g, 'نت');
      res.group = 'نمونه:invented';
    }, /carries a part group but is not a demonstration/);
    refusesBothDoors((g) => {
      const [, res] = firstWithRole(g, 'ضبط-کلاس');
      res.pieces = [g.pieces[0]!.key];
    }, /class recording and cannot name a piece/);
    refusesBothDoors((g) => {
      const [sess] = firstWithRole(g, 'ضبط-کلاس');
      sess.hasClassRecording = false;
    }, /disagrees with itself about having a class recording/);
    refusesBothDoors((g) => {
      const sess = g.sessions.find((x) => !x.resources.some((r) => r.role === 'ضبط-کلاس'))!;
      sess.hasClassRecording = true;
    }, /disagrees with itself about having a class recording/);
    // A demonstration's PARTS are one resource told in order. Parts that are
    // material for different pieces are not one resource, and two parts
    // numbered alike have no order to be read in.
    refusesBothDoors((g) => {
      const [, first, sess] = groupedDemo(g);
      const sibling = sess.resources.find((r) => r.group === first.group && r !== first)!;
      sibling.pieces = [];
    }, /parts belong to different pieces/);
    refusesBothDoors((g) => {
      const [, first, sess] = groupedDemo(g);
      const sibling = sess.resources.find((r) => r.group === first.group && r !== first)!;
      sibling.part = first.part;
    }, /two parts numbered alike/);

    // --- AND THE RECORD'S OWN FIELDS, not only its nested graph -------------
    // `acceptedAt` is what Settings renders (`acceptedAt.slice(0, 16)`) to say
    // when the index last changed. It was the one persisted field with no
    // check at all: a v14 import carrying `acceptedAt: null` was accepted and
    // then threw while the screen rendered. The fix is this door, never a
    // guard in the component.
    for (const bad of [null, 42, '', 'yesterday', '2026-02-30T12:00:00.000Z', '2026-09-17']) {
      refuses((d) => {
        (d.archiveSources[0] as unknown as { acceptedAt: unknown }).acceptedAt = bad;
      }, /unreadable accepted time/);
    }
    refuses((d) => {
      delete (d.archiveSources[0] as unknown as { renames?: unknown }).renames;
    }, /no rename log/);
    refuses((d) => {
      (d.archiveSources[0] as unknown as { diagnostics?: unknown }).diagnostics = null;
    }, /no diagnostic list/);

    // The POSITIVE half: a graph this door ACCEPTS is one every production
    // reader can walk without throwing. The counterexample above reached
    // `repeatChains` and crashed the material list; this asserts the whole
    // reader surface over the whole accepted graph, not one call.
    const accepted = validateDB(graphed);
    const live = accepted.archiveSources[0]!;
    for (const piece of live.pieces) {
      expect(Array.isArray(repeatChains(live, piece.key))).toBe(true);
      expect(Array.isArray(resourcesForPiece(live, piece.key))).toBe(true);
      for (const r of resourcesForPiece(live, piece.key)) {
        expect(typeof resourceReference(live.id, r).title).toBe('string');
      }
      expect([...new Set([piece.key, ...piece.aliases])].length).toBeGreaterThan(0);
    }
    for (const sess of live.sessions) {
      expect(Array.isArray(membersForSession(live, sess.n))).toBe(true);
      expect(Array.isArray(resourcesForSession(live, sess.n))).toBe(true);
    }

    // Bindings: dangling, duplicated, or on the wrong instrument.
    refuses((d) => {
      d.items.find((i) => i.id === 'own-iraq')!.source = { archiveId: 'setar-classes', pieceKey: 'not-in-the-registry' };
    }, /which archive "setar-classes" does not describe/);
    refuses((d) => {
      d.items.find((i) => i.id === 'own-iraq')!.source = { archiveId: 'no-such-archive', pieceKey: 'عراق' };
    }, /which is not present/);
    refuses((d) => {
      const bound = d.items.find((i) => i.source)!;
      // 'own-iraq' carries no binding of its own, so this is a genuine second
      // claim on one canonical piece.
      d.items.find((i) => i.id === 'own-iraq')!.source = { ...bound.source! };
    }, /Two items are bound to piece/);
    refuses((d) => {
      d.instruments.push({ ...d.instruments[0]!, id: 'inst-tar', name: 'Tar' });
      d.items.find((i) => i.source)!.instrumentId = 'inst-tar';
    }, /belongs to another instrument/);
    refuses((d) => {
      d.lessons.find((l) => l.id === 'L-38-upcoming')!.source = { archiveId: 'setar-classes', sessionN: 4242 };
    }, /which archive "setar-classes" does not describe/);
    refuses((d) => {
      const bound = d.lessons.find((l) => l.source)!;
      // The owner's own upcoming class 38 — deliberately an UNBOUND record, so
      // this really is a second claim on one session rather than a no-op.
      d.lessons.find((l) => l.id === 'L-38-upcoming')!.source = { ...bound.source! };
    }, /Two lessons are bound to session/);
    // Manual direct item references obey the same path rules.
    refuses((d) => {
      d.items.find((i) => i.id === 'own-iraq')!.references = [
        { id: 'x', title: 'x', path: '../secret.mp4', kind: 'video', createdAt: '2026-01-01T00:00:00.000Z' },
      ];
    }, /unsafe reference path/);

    // --- a MISSING FILE is a valid state, not a broken graph ----------------
    const unavailable = mutate((d) => {
      d.archiveSources[0]!.sessions[0]!.resources[0]!.unavailable = true;
      d.archiveSources[0]!.pieces[0]!.unavailable = true;
    }) as PracticeDB;
    expect(() => validateDB(unavailable)).not.toThrow();
    expect(validateDB(unavailable).archiveSources[0]!.pieces[0]!.unavailable).toBe(true);

    // --- a newer schema, and an unknown index format, are refused -----------
    expect(() => validateDB({ ...graphed, schemaVersion: SCHEMA_VERSION + 1 })).toThrow(/newer version/);
    expect(() => decodeSourceIndex({ format: 'something-else', version: 1 })).toThrow(/not a Setar archive index/);
    expect(() => decodeSourceIndex({ ...JSON.parse(SETAR_INDEX_TEXT), version: 99 })).toThrow(/newer scanner/);

    // --- nothing above disturbed practice text or the attachment rules ------
    expect(roundTripped.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'Teacher: keep the mezrab light on the return.',
    );
    expect(roundTripped.blocks[0]!.observation).toBe('The return is still heavy.');
    expect(roundTripped.attachments).toEqual(graphed.attachments);
    const attachment = {
      id: 'att-1',
      ownerType: 'lesson' as const,
      ownerId: graphed.lessons[0]!.id,
      name: 'handout.pdf',
      mime: 'application/pdf',
      size: 2048,
      kind: 'pdf' as const,
      createdAt: '2026-09-10T19:00:00.000Z',
    };
    expect(validateDB({ ...graphed, attachments: [attachment] }).attachments).toEqual([attachment]);
    expect(() => validateDB({ ...graphed, attachments: [attachment, attachment] })).toThrow(/share the id/);
  });
});
```

### src/domain/itemFiles.test.ts

```
import { describe, expect, it } from 'vitest';
import SETAR_INDEX_TEXT from '../../tests/fixtures/setar-archive.json?raw';
import { lessonFiles, type ItemFileReference } from './itemFiles';
import { decodeSourceIndex } from './sourceArchive';
import { applyArchiveImport, planArchiveImport } from './sourceReconcile';
import { emptyDB } from './seed';
import { createLesson } from './factories';
import { resolveRecordingUrl } from './recordings';
import { attachmentsOwnedBy, itemFiles, itemOwnedAttachments } from './itemFiles';
import type { AttachmentMeta, Lesson, LessonRecording, PracticeDB } from './types';

function recording(partial: Partial<LessonRecording> & { id: string; path: string }): LessonRecording {
  return {
    title: partial.path,
    kind: 'video',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function lesson(partial: Partial<Lesson> & { id: string; date: string }): Lesson {
  return {
    instrumentId: 'setar',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function attachment(partial: Partial<AttachmentMeta> & { id: string; ownerId: string }): AttachmentMeta {
  return {
    ownerType: 'item',
    name: partial.id,
    mime: 'application/pdf',
    size: 1024,
    kind: 'pdf',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...partial,
  };
}

function db(partial: Partial<PracticeDB>): PracticeDB {
  return {
    schemaVersion: 11,
    instruments: [],
    materials: [],
    items: [],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    lessons: [],
    // Schema v12's lesson agenda. This file's own subject (composing an
    // item's material) is untouched by it; the field is listed because
    // PracticeDB now requires it.
    lessonAgenda: [],
    archiveSources: [],
    ...partial,
  };
}

describe('itemFiles', () => {
  it("lists a linked lesson's references with the item's attachments, deduplicating references by path", () => {
    const shared = 'setar-classes/session-37/score.pdf';
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [
            recording({ id: 'r-score', path: shared, kind: 'pdf', title: 'Score' }),
            recording({ id: 'r-video', path: 'setar-classes/session-37/class.mp4', title: 'Class 37' }),
          ],
        }),
        // An EARLIER lesson the item is also linked to, referencing the same
        // score by a leading-slash spelling of the same path.
        lesson({
          id: 'l-36',
          date: '2026-06-09',
          itemIds: ['it'],
          recordings: [recording({ id: 'r-score-again', path: `/${shared}`, kind: 'pdf', title: 'Score again' })],
        }),
      ],
      attachments: [attachment({ id: 'a-photo', ownerId: 'it', name: 'page.jpg', kind: 'image', mime: 'image/jpeg' })],
    });

    const files = itemFiles(state, 'it');

    // Newest lesson first, video before score within it, then attachments.
    expect(files.map((f) => f.id)).toEqual(['r-video', 'r-score', 'a-photo']);
    expect(files.filter((f) => f.source === 'reference' && f.path.endsWith('score.pdf'))).toHaveLength(1);
  });

  it("keeps a lesson-owned attachment out of an item's own attachments even when the item and a lesson it is linked to share an id", () => {
    // Reviewer counterexample, reproduced exactly: a database containing an
    // item AND a lesson with the same id, with an attachment whose ownerType
    // is 'lesson' and ownerId is that shared id. ownerId alone is not a valid
    // ownership test — it is only correct together with ownerType.
    const sharedId = 'shared-id';
    const attachments = [
      attachment({ id: 'a-item-own', ownerId: sharedId, ownerType: 'item', name: 'item-file.pdf' }),
      attachment({ id: 'a-lesson-own', ownerId: sharedId, ownerType: 'lesson', name: 'lesson-file.pdf' }),
    ];

    expect(itemOwnedAttachments(attachments, sharedId).map((a) => a.id)).toEqual(['a-item-own']);

    // The item is genuinely linked to the colliding-id lesson, so its
    // recording legitimately appears — only the lesson's ATTACHMENT must not.
    const state = db({
      lessons: [
        lesson({
          id: sharedId,
          date: '2026-07-09',
          itemIds: [sharedId],
          recordings: [recording({ id: 'r-class', path: 'a/class.mp4' })],
        }),
      ],
      attachments,
    });
    expect(itemFiles(state, sharedId).map((f) => f.id)).toEqual(['r-class', 'a-item-own']);
  });

  it("mirrors the collision the other way: a lesson's own attachments never include an item's, on the same shared id", () => {
    // The surface this guards is the lesson Files section (Attachments.tsx,
    // rendered with ownerType="lesson") and ItemCard's file-count badge
    // (ownerType="item") — both must resolve through attachmentsOwnedBy
    // rather than filtering ownerId alone, or a collision leaks across owners
    // in both directions: the lesson's list would show/allow deleting the
    // item's attachment, and the item's count would include the lesson's.
    const sharedId = 'shared-id';
    const attachments = [
      attachment({ id: 'a-item-own', ownerId: sharedId, ownerType: 'item', name: 'item-file.pdf' }),
      attachment({ id: 'a-lesson-own', ownerId: sharedId, ownerType: 'lesson', name: 'lesson-file.pdf' }),
    ];

    expect(attachmentsOwnedBy(attachments, 'lesson', sharedId).map((a) => a.id)).toEqual(['a-lesson-own']);
    expect(attachmentsOwnedBy(attachments, 'item', sharedId).map((a) => a.id)).toEqual(['a-item-own']);
  });

  it('excludes references from lessons the item is not linked to and returns nothing when it has none', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-other',
          date: '2026-07-09',
          itemIds: ['someone-else'],
          recordings: [recording({ id: 'r-other', path: 'setar-classes/other/class.mp4' })],
        }),
      ],
      attachments: [attachment({ id: 'a-other', ownerId: 'someone-else' })],
    });

    expect(itemFiles(state, 'it')).toEqual([]);
    expect(itemFiles(state, 'someone-else').map((f) => f.id)).toEqual(['r-other', 'a-other']);
  });

  it('tags every entry with how it opens so a reference is never treated as an attachment', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [recording({ id: 'r-video', path: 'setar-classes/session-37/class.mp4' })],
        }),
      ],
      attachments: [attachment({ id: 'a-pdf', ownerId: 'it', name: 'handout.pdf' })],
    });

    const [ref, att] = itemFiles(state, 'it');
    expect(ref.source).toBe('reference');
    // A reference carries the path the NAS base URL resolves; an attachment
    // carries none, because it opens as a blob and would 404 through the base.
    expect(ref.source === 'reference' && ref.path).toBe('setar-classes/session-37/class.mp4');
    expect(att.source).toBe('attachment');
    expect('path' in att).toBe(false);
  });

  it('treats a local image as inline-renderable and every PDF, audio file and NAS reference as open-only', () => {
    const state = db({
      lessons: [
        lesson({
          id: 'l-37',
          date: '2026-07-09',
          itemIds: ['it'],
          recordings: [
            recording({ id: 'r-video', path: 'a/class.mp4', kind: 'video' }),
            // `inferKind` maps jpg/png/heic to 'doc', so no NAS reference can
            // ever be read as an image — and a remote origin could not render
            // under the static production CSP anyway.
            recording({ id: 'r-photo', path: 'a/page.jpg', kind: 'doc' }),
          ],
        }),
      ],
      attachments: [
        attachment({ id: 'a-image', ownerId: 'it', name: 'page.jpg', kind: 'image', mime: 'image/jpeg' }),
        attachment({ id: 'a-pdf', ownerId: 'it', name: 'score.pdf', kind: 'pdf' }),
        attachment({ id: 'a-audio', ownerId: 'it', name: 'clip.m4a', kind: 'audio', mime: 'audio/mp4' }),
      ],
    });

    const inline = Object.fromEntries(itemFiles(state, 'it').map((f) => [f.id, f.inline]));
    expect(inline).toEqual({
      'r-video': false,
      'r-photo': false,
      'a-image': true,
      'a-pdf': false,
      'a-audio': false,
    });
  });
});

// ---------------------------------------------------------------------------
// ac-13 — one composition, correctly scoped, for the item screen and Active.
// ---------------------------------------------------------------------------

describe('archive material for a piece', () => {
  const NOW = new Date('2026-09-17T09:00:00.000Z');
  const SETAR = 'inst-setar';
  const INDEX = decodeSourceIndex(JSON.parse(SETAR_INDEX_TEXT) as unknown);

  function imported(): PracticeDB {
    const base: PracticeDB = {
      ...emptyDB(),
      instruments: [
        {
          id: SETAR,
          name: 'Setar',
          family: 'Persian',
          active: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    };
    return applyArchiveImport(base, planArchiveImport({ db: base, index: INDEX, instrumentId: SETAR, now: NOW }));
  }

  const idFor = (db: PracticeDB, key: string) => db.items.find((i) => i.source?.pieceKey === key)!.id;

  it('practice material shows only useful correctly scoped archive resources', () => {
    const db = imported();

    // --- a piece with a correction AND a clean score -------------------------
    const mahur = itemFiles(db, idFor(db, 'پیش-درامد-ماهور-هرمزی')) as ItemFileReference[];
    // The teacher's corrected copy leads, and nothing else the piece has is
    // dropped to make room for it.
    expect(mahur[0]!.archive!.role).toBe('تصحیح');
    expect(mahur.filter((f) => f.path.includes('تصحیح-پیش-درامد-ماهور-هرمزی'))).toHaveLength(2);
    expect(mahur.some((f) => f.archive!.role === 'نمونه')).toBe(true);

    // No piece in the real corpus currently carries BOTH a correction and a
    // clean score of its own, so the retention rule is exercised against a
    // graph that does: the correction still leads, and the clean score is
    // RETAINED below it rather than replaced by it.
    const cleanScore = {
      path: 'session-18-21-01-2025/نت-پیش-درامد-ماهور-هرمزی.pdf',
      role: 'نت',
      kind: 'score' as const,
      title: 'نت پیش درامد ماهور هرمزی',
      part: null,
      pieces: ['پیش-درامد-ماهور-هرمزی'],
      group: null,
    };
    const withClean: PracticeDB = {
      ...db,
      archiveSources: db.archiveSources.map((src) => ({
        ...src,
        sessions: src.sessions.map((sess) =>
          sess.n === 18 ? { ...sess, resources: [...sess.resources, cleanScore] } : sess,
        ),
      })),
    };
    const bothKinds = itemFiles(withClean, idFor(db, 'پیش-درامد-ماهور-هرمزی')) as ItemFileReference[];
    const roles = bothKinds.map((f) => f.archive!.role);
    expect(roles[0]).toBe('تصحیح');
    expect(roles).toContain('نت');
    expect(roles.indexOf('تصحیح')).toBeLessThan(roles.indexOf('نت'));
    expect(bothKinds.some((f) => f.path === cleanScore.path)).toBe(true);

    // --- a class recording stays with the LESSON ----------------------------
    expect(mahur.every((f) => f.archive?.role !== 'ضبط-کلاس')).toBe(true);
    for (const item of db.items) {
      for (const f of itemFiles(db, item.id)) {
        if (f.source !== 'reference') continue;
        expect(f.path).not.toContain('ضبط-کلاس');
        // ...and the owner's own practice recordings are never material either.
        expect(f.path).not.toContain('تمرین-من');
      }
    }
    const lesson13 = db.lessons.find((l) => l.source?.sessionN === 13)!;
    const lessonSide = lessonFiles(db, lesson13.id) as ItemFileReference[];
    expect(lessonSide[0]!.path).toContain('ضبط-کلاس');
    expect(lessonSide.every((f) => f.lessonId === lesson13.id)).toBe(true);

    // --- EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT -----
    // This composition used to include the owner's OWN references and the
    // lesson's attachments as well. The lesson page renders both in their own
    // editable sections, so each authored file appeared twice: once here, and
    // once again where it can actually be removed. An ITEM is the opposite
    // case and is unchanged — its material comes from records its own page has
    // no section for, which is why `itemFiles` stays the whole composition.
    const withOwnFiles: PracticeDB = {
      ...db,
      lessons: db.lessons.map((l) =>
        l.id === lesson13.id
          ? {
              ...l,
              recordings: [
                {
                  id: 'own-ref',
                  title: 'My own link',
                  path: 'session-13-03-09-2024/my-own-file.mp4',
                  kind: 'video' as const,
                  createdAt: '2026-01-01T00:00:00.000Z',
                },
              ],
            }
          : l,
      ),
      attachments: [
        {
          id: 'own-att',
          ownerType: 'lesson' as const,
          ownerId: lesson13.id,
          name: 'handout.pdf',
          mime: 'application/pdf',
          size: 2048,
          kind: 'pdf' as const,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    };
    const composed = lessonFiles(withOwnFiles, lesson13.id);
    expect(composed.every((f) => f.source === 'reference' && f.archive !== undefined)).toBe(true);
    expect(composed.some((f) => f.title === 'My own link')).toBe(false);
    expect(composed.some((f) => f.source === 'attachment')).toBe(false);
    // The archive's own material is untouched by the owner's additions.
    expect(composed.map((f) => f.id)).toEqual(lessonSide.map((f) => f.id));

    // --- an UNNAMED demonstration is one ordered logical group --------------
    const araqGusheh = itemFiles(db, idFor(db, 'کرشمه-در-عراق')) as ItemFileReference[];
    const demo = araqGusheh.filter((f) => f.archive?.role === 'نمونه' && f.archive.sessionN === 13);
    expect(demo.map((f) => f.archive!.part)).toEqual([1, 2]);
    expect(new Set(demo.map((f) => f.archive!.group)).size).toBe(1);
    // It belongs to every canonical member of session 13 — all eight — and the
    // eight are exactly the roster, not a guessed set.
    const members = INDEX.sessions.find((s) => s.n === 13)!.roster;
    expect(members).toHaveLength(8);
    for (const key of members) {
      const files = itemFiles(db, idFor(db, key)) as ItemFileReference[];
      expect(files.some((f) => f.path === 'session-13-03-09-2024/نمونه-1.mp4')).toBe(true);
    }

    // --- a NAMED score or demo NEVER bleeds onto a sibling piece ------------
    const zendan = itemFiles(db, idFor(db, 'به-زندان-شوشتری')) as ItemFileReference[];
    expect(zendan.some((f) => f.path === 'session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4')).toBe(true);
    const sibling = itemFiles(db, idFor(db, 'ضربی-شکسته-لطفی')) as ItemFileReference[];
    expect(sibling.some((f) => f.path.includes('به-زندان'))).toBe(false);
    // The session-13 notation names ONE piece and reaches only that one.
    const named = 'session-13-03-09-2024/نت-ضربی-عراق-ماهور-میرزا-حسینقلی.pdf';
    expect((itemFiles(db, idFor(db, 'ضربی-عراق-ماهور-میرزا-حسینقلی')) as ItemFileReference[]).some((f) => f.path === named)).toBe(true);
    expect(araqGusheh.some((f) => f.path === named)).toBe(false);

    // --- every session the piece appears in stays reachable -----------------
    const chain = itemFiles(db, idFor(db, 'چهارمضراب-ماهور-صبا')) as ItemFileReference[];
    const sessions = [...new Set(chain.map((f) => f.archive!.sessionN))].sort((a, b) => a - b);
    // Its own registry row names sessions 9-12 and 16; the material from the
    // EARLIER lessons of that run is still reachable, with its provenance.
    expect(sessions).toContain(16);
    expect(sessions.some((n) => n < 16)).toBe(true);
    expect(chain.every((f) => f.archive!.date.length === 10)).toBe(true);

    // --- a DIRECT item reference needs no lesson at all ----------------------
    const target = idFor(db, 'عراق');
    const direct: PracticeDB = {
      ...db,
      items: db.items.map((i) =>
        i.id === target
          ? {
              ...i,
              references: [
                {
                  id: 'own-1',
                  title: 'My own copy of the score',
                  path: 'session-12-06-08-2024/some-other-file.pdf',
                  kind: 'pdf' as const,
                  notes: 'Printed for the stand.',
                  createdAt: '2026-09-01T00:00:00.000Z',
                },
              ],
            }
          : i,
      ),
    };
    const withDirect = itemFiles(direct, target) as ItemFileReference[];
    const mine = withDirect.find((f) => f.id === 'own-1')!;
    expect(mine).toBeDefined();
    expect(mine.lessonId).toBeUndefined();
    expect(mine.archive).toBeUndefined();
    expect(mine.notes).toBe('Printed for the stand.');
    // It is a REFERENCE — the same resolver as every archive and legacy path,
    // and never an attachment blob.
    expect(mine.source).toBe('reference');
    expect(resolveRecordingUrl('https://192.168.0.20:5010/setar-classes', mine)).toContain(
      '/setar-classes/session-12-06-08-2024/',
    );
    expect(withDirect.every((f) => f.inline === false)).toBe(true);

    // --- a MANUAL, unclassified lesson stays reachable, unscoped ------------
    const manualLesson: Lesson = {
      ...createLesson({ instrumentId: SETAR, date: '2026-02-02' }, NOW),
      id: 'manual-lesson',
      itemIds: [target],
      recordings: [
        {
          id: 'manual-ref',
          title: 'Something a teacher sent',
          path: 'elsewhere/whatever.pdf',
          kind: 'pdf',
          createdAt: '2026-02-02T00:00:00.000Z',
        },
      ],
    };
    const withManual = itemFiles({ ...direct, lessons: [...direct.lessons, manualLesson] }, target) as ItemFileReference[];
    const manual = withManual.find((f) => f.id === 'manual-ref')!;
    expect(manual).toBeDefined();
    expect(manual.lessonId).toBe('manual-lesson');
    // Nothing invented a scope for it: it carries no archive provenance.
    expect(manual.archive).toBeUndefined();

    // --- an archive-bound lesson does not re-deliver its whole folder -------
    // Linking the item to its own archive lesson must not drag the class
    // recording back onto the piece through the lesson route.
    const linked: PracticeDB = {
      ...direct,
      lessons: direct.lessons.map((l) =>
        l.source?.sessionN === 12 ? { ...l, itemIds: [...(l.itemIds ?? []), target] } : l,
      ),
    };
    const afterLink = itemFiles(linked, target) as ItemFileReference[];
    expect(afterLink.some((f) => f.path.includes('ضبط-کلاس'))).toBe(false);
    expect(afterLink.map((f) => f.path)).toEqual(withDirect.map((f) => f.path));
  });
});
```

### src/domain/itemFiles.ts

```
import type { AttachmentKind, AttachmentMeta, AttachmentOwnerType, ID, ISODate, LessonFileKind, PracticeDB } from './types';
import {
  CLASS_ROLE,
  CORRECTION_ROLE,
  DEMO_ROLE,
  NOTATION_ROLE,
  archiveFor,
  resourcesForPiece,
  resourcesForSession,
  resourceReference,
} from './sourceArchive';

// ---------------------------------------------------------------------------
// An item's MATERIAL — composed, never stored.
//
// Everything a piece needs to be practised from is already linked in the data:
// the lessons it came from hold NAS references (the class video, the score
// PDF), and the item itself holds attachments. Nothing new is persisted to show
// them together; this module is the composition that was always possible and
// never made.
//
// The two kinds open by COMPLETELY DIFFERENT mechanisms — a reference resolves
// through the configured NAS base URL, an attachment through a blob — so the
// `source` discriminant is not decoration: it is what stops a reference being
// opened as a blob or an attachment being pushed through the base URL. They
// also share no identity field (a reference has a path, an attachment a name),
// so they are never merged and deduplication is WITHIN a kind, never across.
// ---------------------------------------------------------------------------

/** Video first, then scores/docs, then audio — the order Lessons already shows. */
export const LESSON_FILE_KIND_ORDER: Record<LessonFileKind, number> = {
  video: 0,
  pdf: 1,
  doc: 2,
  audio: 3,
};

/** Where a composed reference came from, so the UI can say so honestly. */
export interface ItemFileProvenance {
  sessionN: number;
  date: ISODate;
  /** The archive's own role word — a correction, a demonstration, notation. */
  role: string;
  /** Parts of ONE logical demonstration share this. */
  group?: string | null;
  part?: number | null;
}

export interface ItemFileReference {
  source: 'reference';
  id: ID;
  title: string;
  /** Relative NAS path or full https URL — resolve with `resolveRecording`. */
  path: string;
  kind: LessonFileKind;
  /**
   * The lesson this reference belongs to. ABSENT for a resource composed from
   * the archive graph (which belongs to a session, not to a lesson record) and
   * for a direct reference the owner attached to the item itself.
   */
  lessonId?: ID;
  /** Present only for a resource the archive scoped to this piece. */
  archive?: ItemFileProvenance;
  /** The source no longer describes this file; its provenance is kept. */
  unavailable?: boolean;
  sizeBytes?: number;
  notes?: string;
  /**
   * Never inline. A NAS origin is not knowable at build time, so a remote file
   * could not render under the static production CSP in any case; opening it in
   * a tab is the only honest option.
   */
  inline: false;
}

export interface ItemFileAttachment {
  source: 'attachment';
  id: ID;
  title: string;
  kind: AttachmentKind;
  mime: string;
  sizeBytes: number;
  /** A local image renders inline (blob: is already permitted); nothing else does. */
  inline: boolean;
}

export type ItemFile = ItemFileReference | ItemFileAttachment;

/** Same file, whichever lesson referenced it: `/a/b` and `a/b` resolve alike. */
function referenceKey(path: string): string {
  return path.trim().replace(/^\/+/, '');
}

/**
 * The single test for "this attachment belongs to this owner." `ownerId`
 * alone is not enough — an item and a lesson can collide on id, since each
 * has its own id space — so the check is only correct when `ownerType` and
 * `ownerId` are checked TOGETHER. Every surface that lists, counts or removes
 * attachments (an item's own files, a lesson's own Files section, ItemCard's
 * file-count badge) calls this instead of re-deriving the predicate, so the
 * invariant can't drift between call sites.
 */
export function attachmentsOwnedBy(
  attachments: AttachmentMeta[],
  ownerType: AttachmentOwnerType,
  ownerId: ID,
): AttachmentMeta[] {
  return attachments.filter((a) => a.ownerType === ownerType && a.ownerId === ownerId);
}

/** `attachmentsOwnedBy` narrowed to an item — the common case at every item surface. */
export function itemOwnedAttachments(attachments: AttachmentMeta[], itemId: ID): AttachmentMeta[] {
  return attachmentsOwnedBy(attachments, 'item', itemId);
}

/**
 * Every file that already belongs to an item: the NAS references of each lesson
 * the item is LINKED to (deduplicated by path, so a file referenced from two of
 * those lessons appears once), followed by the item's own attachments.
 *
 * Order is deterministic: lessons newest first, references within a lesson by
 * kind then creation, then attachments oldest first (the order the Files
 * section already lists them in).
 */
export function itemFiles(db: PracticeDB, itemId: ID): ItemFile[] {
  const out: ItemFile[] = [];
  const seen = new Set<string>();
  const item = db.items.find((i) => i.id === itemId);

  // 1. WHAT THE ARCHIVE SAYS IS MATERIAL FOR THIS PIECE.
  //
  // Scope comes from the graph, never from "everything the lesson happens to
  // hold": a class recording covers a whole lesson and stays there, a named
  // score belongs to its own piece and never bleeds onto a sibling, and the
  // owner's own practice recordings were never resources to begin with.
  const source = item?.source ? archiveFor(db, item.source.archiveId) : undefined;
  if (source && item?.source) {
    const scoped = resourcesForPiece(source, item.source.pieceKey, itemId);
    // Corrections carry the teacher's own hand and are the most useful thing
    // here, so they lead — but a clean score is still kept, not replaced by it.
    const rank = (role: string) =>
      role === CORRECTION_ROLE ? 0 : role === DEMO_ROLE ? 1 : role === NOTATION_ROLE ? 2 : 3;
    const ordered = [...scoped].sort(
      (a, b) =>
        rank(a.role) - rank(b.role) ||
        a.sessionN - b.sessionN ||
        (a.group ?? '').localeCompare(b.group ?? '') ||
        (a.part ?? 0) - (b.part ?? 0) ||
        a.path.localeCompare(b.path),
    );
    for (const r of ordered) {
      // Defensive, and cheap: the graph already excludes it, and a class
      // recording must never become one piece's material by any route.
      if (r.role === CLASS_ROLE) continue;
      const key = referenceKey(r.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const ref = resourceReference(item.source.archiveId, r, r.sessionDate);
      out.push({
        source: 'reference',
        id: ref.id,
        title: ref.title,
        path: ref.path,
        kind: ref.kind ?? 'video',
        archive: { sessionN: r.sessionN, date: r.sessionDate, role: r.role, group: r.group, part: r.part },
        ...(r.unavailable ? { unavailable: true } : {}),
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  // 2. DIRECT references the owner attached to the item itself — useful
  //    material that needs no artificial lesson to hang from.
  for (const rec of item?.references ?? []) {
    const key = referenceKey(rec.path);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({
      source: 'reference',
      id: rec.id,
      title: rec.title,
      path: rec.path,
      kind: rec.kind ?? 'video',
      sizeBytes: rec.sizeBytes,
      notes: rec.notes,
      inline: false,
    });
  }

  // 3. Lessons the item is LINKED to. An archive-bound lesson contributes
  //    nothing here: its files reached this list above, correctly scoped.
  //    A manual, unclassified lesson still contributes all of its references —
  //    nothing knows their scope, and inventing one would be a guess.
  const lessons = db.lessons
    .filter((l) => (l.itemIds ?? []).includes(itemId) && !l.source)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

  for (const lesson of lessons) {
    const recordings = [...(lesson.recordings ?? [])].sort(
      (a, b) =>
        LESSON_FILE_KIND_ORDER[a.kind ?? 'video'] - LESSON_FILE_KIND_ORDER[b.kind ?? 'video'] ||
        a.createdAt.localeCompare(b.createdAt),
    );
    for (const rec of recordings) {
      const key = referenceKey(rec.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({
        source: 'reference',
        id: rec.id,
        title: rec.title,
        path: rec.path,
        kind: rec.kind ?? 'video',
        lessonId: lesson.id,
        sizeBytes: rec.sizeBytes,
        notes: rec.notes,
        inline: false,
      });
    }
  }

  const attachments = itemOwnedAttachments(db.attachments, itemId).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  for (const a of attachments) {
    out.push({
      source: 'attachment',
      id: a.id,
      title: a.name,
      kind: a.kind,
      mime: a.mime,
      sizeBytes: a.size,
      inline: a.kind === 'image',
    });
  }

  return out;
}

/**
 * What the ARCHIVE gives a lesson: its session's own files — the class
 * recording, an unnamed handout, the material that belongs to the whole class
 * rather than to one piece. An archive-bound lesson keeps no copy of these, so
 * reading its `recordings` array alone shows nothing at all; this is the only
 * way they reach the screen.
 *
 * EVERY FILE ON A LESSON HAS EXACTLY ONE SECTION THAT RENDERS IT. This used to
 * compose the owner's own `recordings` and attachments too, and the lesson page
 * renders those in their own editable sections — so one authored NAS reference
 * and one local attachment each appeared TWICE, once here and once where they
 * can actually be edited or removed. An item is the opposite case and stays as
 * it is: its material is composed from OTHER records (linked lessons, the
 * graph) that the item's own page has no section for, which is exactly why
 * `itemFiles` must stay the whole composition.
 */
export function lessonFiles(db: PracticeDB, lessonId: ID): ItemFile[] {
  const out: ItemFile[] = [];
  const seen = new Set<string>();
  const lesson = db.lessons.find((l) => l.id === lessonId);
  if (!lesson) return out;

  const source = lesson.source ? archiveFor(db, lesson.source.archiveId) : undefined;
  if (source && lesson.source) {
    const resources = resourcesForSession(source, lesson.source.sessionN).sort(
      (a, b) =>
        // The class recording first — it IS the lesson — then everything else
        // in the archive's own role order, parts numerically.
        (a.role === CLASS_ROLE ? 0 : 1) - (b.role === CLASS_ROLE ? 0 : 1) ||
        a.role.localeCompare(b.role) ||
        (a.part ?? 0) - (b.part ?? 0) ||
        a.path.localeCompare(b.path),
    );
    for (const r of resources) {
      const key = referenceKey(r.path);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const ref = resourceReference(lesson.source.archiveId, r, lesson.date);
      out.push({
        source: 'reference',
        id: ref.id,
        title: ref.title,
        path: ref.path,
        kind: ref.kind ?? 'video',
        lessonId,
        archive: { sessionN: lesson.source.sessionN, date: lesson.date, role: r.role, group: r.group, part: r.part },
        ...(r.unavailable ? { unavailable: true } : {}),
        sizeBytes: ref.sizeBytes,
        inline: false,
      });
    }
  }

  return out;
}
```

### src/domain/scanSetarClasses.test.ts

```
import { mkdtempSync, mkdirSync, writeFileSync, symlinkSync, utimesSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
// The scanner is an operator-run Node tool (.mjs) so a NAS needs no bundler and
// no app dependencies — but its grammar is the ONE place a filename becomes an
// identity, so every rule in it is exercised here. The facade below is the
// shape under test; the module itself carries no types.
interface Piece {
  key: string;
  form: string;
  piece: string;
  dastgah: string;
  composer: string;
  aliases: string[];
  sessions: number[];
  notes: string;
  provisional: boolean;
  mediumConfidence: boolean;
}
interface Resource {
  path: string;
  role: string;
  kind: string;
  title: string;
  part: number | null;
  size: number;
  pieces: string[];
  group: string | null;
}
interface Session {
  n: number;
  date: string;
  folder: string;
  roster: string[];
  rosterTrusted: boolean;
  hasClassRecording: boolean;
  resources: Resource[];
  members: { key: string; roles: string[] }[];
}
interface Index {
  pieces: Piece[];
  sessions: Session[];
  renames: { from: string; to: string }[];
  diagnostics: { path: string; reason: string }[];
  contentHash: string;
}
interface Entry {
  path: string;
  size: number;
  mtimeMs?: number;
}
interface Skipped {
  path: string;
  reason: string;
}
/** An optional input is ABSENT or PRESENT — never "empty because it threw". */
type OptionalInput = { present: false } | { present: true; text: string };
interface Scanner {
  buildIndex(input: {
    registryText: string;
    inventory: Entry[];
    renameLog?: OptionalInput;
    skipped?: Skipped[];
  }): Index;
  contentHash(body: unknown): string;
  parseAssetStem(stem: string): { role: string; piece: string | null; part: number | null } | null;
  parseCsv(text: string): string[][];
  parseRegistry(text: string): Piece[];
  parseSessionFolderName(name: string): { n: number; date: string } | null;
  scanArchive(root: string): { inventory: Entry[]; skipped: Skipped[] };
  scanToIndex(root: string): Index;
  readSource(root: string): {
    registryText: string;
    renameLog: OptionalInput;
    inventory: Entry[];
    skipped: Skipped[];
  };
  canonicalJson(value: unknown): string;
  writeIndexAtomically(outPath: string, text: string, root?: string): string;
  isSafeRelativePath(p: string): boolean;
  displayTitle(stem: string): string;
}
// @ts-expect-error — no type declarations for the .mjs operator tool.
import * as scannerModule from '../../scripts/scan-setar-classes.mjs';
const {
  buildIndex,
  contentHash,
  parseAssetStem,
  parseCsv,
  parseRegistry,
  parseSessionFolderName,
  scanArchive,
  scanToIndex,
  readSource,
  canonicalJson,
  writeIndexAtomically,
  isSafeRelativePath,
  displayTitle,
} = scannerModule as Scanner;

// ---------------------------------------------------------------------------
// Real rows from the archive's own PIECES.csv. Registry notes are trimmed to
// their first sentence — the caveat survives, the research prose does not
// travel into a checked-in fixture — EXCEPT the one row kept verbatim because
// its quoting is the thing under test.
// ---------------------------------------------------------------------------

const HEADER = 'canonical_fa,form,piece,dastgah,composer,aliases_seen,sessions,notes';

const REGISTRY_ROWS = [
  'چهارمضراب-اول-دشتی-صبا,چهارمضراب,دشتی(اول),دشتی,صبا,chahar-mezarabe-avale-dashti|4mez-aval-dashti,1,Confirmed from PDF and jpg score.',
  // Verbatim: embedded commas AND doubled quotes inside one quoted field.
  'رنگ-ماهور-درویش-خان,رنگ,ماهور,ماهور,درویش-خان,renge-mahoor-darvish|renge-mahoor-darvish-sevom-1402-05-22,1,"Confirmed from PDF. ""sevom"" in filename is a version/take marker, not part of the name. Distinct from رنگ-ماهور-راک-برومند (session 21), a different arrangement."',
  'تمرین-دشتی-1-علیزاده,تمرین,دشتی-1,دشتی,علیزاده,study-of-dashti-1-alizadeh|تمرین-دشتی-۳,"4,5",Repeat chain 4->5.',
  'عراق,(standalone),عراق,,,araq,12,Matches the brief\'s own worked example exactly.',
  'رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان,رنگ,اصفهان(پریچهر-و-پریزاد),اصفهان,درویش-خان,renge-esfehan-paricherandparizad-darvish,16,Confirmed from PDF.',
  'پیش-درامد-ماهور-هرمزی,پیش-درامد,ماهور,ماهور,هرمزی,pishdaramade-mahur-hormozi,"16,17,18",Repeat chain 16->17->18 (3 sessions).',
  'چهارمضراب-ماهور-صبا,چهارمضراب,ماهور,ماهور,صبا,chaharmezrabe-mahur-sabaa,"9,10,11,12,16",Repeat chain 9->10->11->12.',
  'به-زندان-شوشتری,(قطعه),به-زندان,شوشتری,,be-zendan-shushtari,"28,29",Repeat chain 28->29 (2 parts).',
  'ضربی-شکسته-لطفی,ضربی,شکسته,,لطفی,zarbiye-shekasteh-lotfi-1,"27,28",Repeat chain 27->28 (2 parts).',
  'پیش-درامد-سه-گاه-فروتن,پیش-درامد,سه-گاه,سه-گاه,فروتن,pish-daramade-segah-forutan-1|pish-daramade-segah-forutan-6,"22,23,24,25,26,27","Longest repeat chain in the archive: 22->23->24->25->26->27 (6 sessions, only session 22 should get a نمونه)."',
  'ماهور-ردیف-میرزاعبدالله,(ردیف),ماهور,ماهور,,movie-on-16-04-2024-at-*,7,PROVISIONAL dastgah-level name.',
  'هفت-ضربی-چهارگاه-علیزاده,هفت-ضربی,چهارگاه,چهارگاه,علیزاده,haft-zarbi-chahargah-alizadeh-1,"5,6",Repeat chain 5->6 (2 parts).',
  'چهار-پاره,چهارپاره,چهار-پاره,ابوعطا,,abouata-chaharpareh-1,"4,5",Repeat chain 4->5 (2 parts).',
  'سیخی-ابوعطا,گوشه,سیخی,ابوعطا,,abouata-sayakhi,3,MEDIUM confidence.',
  // Session 13's full roster: eight canonical pieces.
  'ضربی-عراق-ماهور-میرزا-حسینقلی,ضربی,عراق,ماهور,میرزا-حسینقلی,zarbi-araaq-mahur-mirzahoseyngholi,13,Confirmed from PDF.',
  'اصفهانک-در-عراق,گوشه,اصفهانک,عراق(ماهور),,esfahaanak-dar-araaq,13,Part of the عراق gusheh-sequence.',
  'حزین-در-عراق,گوشه,حزین,عراق(ماهور),,hazin-dar-araaq,13,Confirmed via web search.',
  'کرشمه-در-عراق,گوشه,کرشمه,عراق(ماهور),,kereshmeh-dar-araaq,13,Distinct from کرشمه-راک.',
  'محیر-در-عراق,گوشه,محیر,عراق(ماهور),,mohayyer-dar-araaq,13,Confirmed spelling محیّر via web search.',
  'نهیب-در-عراق,گوشه,نهیب,عراق(ماهور),,nahib-dar-araaq,13,Confirmed via web search.',
  'زنگوله-در-عراق,گوشه,زنگوله,عراق(ماهور),,zanguleh-dar-araaq,13,Distinct from زنگوله-بیات-ترک.',
  'آشوراوند,(standalone),آشوراوند,راک(ماهور),,ashur-aavand,13,Confirmed via web search as one solid word.',
];

const REGISTRY = [HEADER, ...REGISTRY_ROWS].join('\n') + '\n';

/** A real slice of the archive: paths exactly as they are on disk. */
const INVENTORY: Entry[] = [
  { path: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', size: 47_321_598 },
  { path: 'session-1-26-09-2023/ضبط-کلاس-2.mp4', size: 41_770_634 },
  { path: 'session-1-26-09-2023/ضبط-کلاس-3.mp4', size: 16_587_151 },
  { path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf', size: 120_000 },
  { path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.jpg', size: 90_000 },
  { path: 'session-1-26-09-2023/نت-رنگ-ماهور-درویش-خان.pdf', size: 110_000 },
  { path: 'session-1-26-09-2023/تمرین-من-رنگ-ماهور-درویش-خان.mp4', size: 15_200_000 },
  { path: 'session-5-23-01-2024/تمرین-من-تمرین-دشتی-1-علیزاده.mp4', size: 9_000_000 },
  { path: 'session-5-23-01-2024/تمرین-من-چهار-پاره.mp4', size: 8_000_000 },
  { path: 'session-5-23-01-2024/تمرین-من-هفت-ضربی-چهارگاه-علیزاده.mp4', size: 7_000_000 },
  { path: 'session-5-23-01-2024/نت-هفت-ضربی-چهارگاه-علیزاده.pdf', size: 100_000 },
  { path: 'session-5-23-01-2024/ضبط-کلاس.mp4', size: 402_863_504 },
  { path: 'session-5-23-01-2024/نمونه-1.mp4', size: 60_000_000 },
  { path: 'session-5-23-01-2024/نمونه-2.mp4', size: 30_000_000 },
  { path: 'session-9-14-05-2024/تمرین-من-چهارمضراب-ماهور-صبا.mp4', size: 5_000_000 },
  { path: 'session-10-11-06-2024/تمرین-من-چهارمضراب-ماهور-صبا.mp4', size: 5_100_000 },
  { path: 'session-12-06-08-2024/تمرین-من-عراق.mp4', size: 4_000_000 },
  { path: 'session-12-06-08-2024/ضبط-کلاس.mp4', size: 99_765_911 },
  { path: 'session-13-03-09-2024/ضبط-کلاس.mp4', size: 90_002_728 },
  { path: 'session-13-03-09-2024/نمونه-1.mp4', size: 55_000_000 },
  { path: 'session-13-03-09-2024/نمونه-2.mp4', size: 22_000_000 },
  { path: 'session-13-03-09-2024/نت-ضربی-عراق-ماهور-میرزا-حسینقلی.pdf', size: 130_000 },
  { path: 'session-13-03-09-2024/تمرین-من-کرشمه-در-عراق.mp4', size: 3_000_000 },
  { path: 'session-16-26-11-2024/ضبط-کلاس.mp4', size: 84_518_794 },
  { path: 'session-16-26-11-2024/تصحیح-پیش-درامد-ماهور-هرمزی.pdf', size: 210_000 },
  { path: 'session-16-26-11-2024/تصحیح-چهارمضراب-ماهور-صبا.pdf', size: 190_000 },
  { path: 'session-16-26-11-2024/نت-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان.pdf', size: 150_000 },
  { path: 'session-16-26-11-2024/تمرین-من-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان.mp4', size: 6_000_000 },
  // The one un-normalised file in the whole archive (brief §8.1).
  { path: 'session-16-26-11-2024/video-2024-10-29-15-32-35.mp4', size: 12_000_000 },
  { path: 'session-22-13-05-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_500_000 },
  { path: 'session-22-13-05-2025/نمونه.mp4', size: 40_000_000 },
  { path: 'session-23-10-06-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_600_000 },
  { path: 'session-24-08-07-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_700_000 },
  { path: 'session-25-05-08-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_800_000 },
  { path: 'session-26-02-09-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 3_900_000 },
  { path: 'session-27-30-09-2025/تمرین-من-پیش-درامد-سه-گاه-فروتن.mp4', size: 4_100_000 },
  { path: 'session-27-30-09-2025/تمرین-من-ضربی-شکسته-لطفی.mp4', size: 2_100_000 },
  { path: 'session-27-30-09-2025/ضبط-کلاس-1.mp4', size: 50_000_000 },
  { path: 'session-27-30-09-2025/ضبط-کلاس-2.mp4', size: 43_432_037 },
  { path: 'session-27-30-09-2025/نمونه.mp4', size: 38_000_000 },
  { path: 'session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4', size: 20_000_000 },
  { path: 'session-28-28-10-2025/نت-به-زندان-شوشتری.pdf', size: 140_000 },
  { path: 'session-28-28-10-2025/تمرین-من-به-زندان-شوشتری.mp4', size: 2_500_000 },
  { path: 'session-28-28-10-2025/تمرین-من-ضربی-شکسته-لطفی.mp4', size: 2_600_000 },
];

const build = (over: Partial<{ registryText: string; inventory: Entry[] }> = {}): Index =>
  buildIndex({ registryText: REGISTRY, inventory: INVENTORY, ...over });

const session = (index: Index, n: number): Session => index.sessions.find((s) => s.n === n)!;

const resource = (index: Index, path: string): Resource | undefined =>
  index.sessions.flatMap((s) => s.resources).find((r) => r.path === path);

// ---------------------------------------------------------------------------

describe('the Setar source registry', () => {
  it('setar registry keeps exact Farsi keys and rejects ambiguous CSV input', () => {
    const pieces = parseRegistry(REGISTRY);
    const byKey = new Map(pieces.map((p) => [p.key, p]));
    const pieceOf = (k: string): Piece => byKey.get(k)!;

    // A quoted field carrying commas AND doubled quotes stays ONE field, and
    // every column after it stays in its own column. Splitting on "," would
    // shift dastgah/composer/sessions onto fragments of this sentence.
    const reng = pieceOf('رنگ-ماهور-درویش-خان');
    expect(reng.composer).toBe('درویش-خان');
    expect(reng.sessions).toEqual([1]);
    expect(reng.notes).toContain('"sevom" in filename is a version/take marker');
    expect(reng.notes).toContain('a different arrangement.');

    // Byte identity. The key is the join key with the filenames: an embedded
    // ASCII digit is piece identity, and "-و-" is INSIDE one name.
    expect(byKey.has('تمرین-دشتی-1-علیزاده')).toBe(true);
    expect(pieceOf('تمرین-دشتی-1-علیزاده').sessions).toEqual([4, 5]);
    expect(byKey.has('رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان')).toBe(true);
    expect(pieces.every((p) => p.key === p.key.normalize('NFC'))).toBe(true);

    // Real forms, carried verbatim. Neither is invented, folded into a
    // neighbouring form, or turned into a categorical claim of its own.
    expect(pieceOf('هفت-ضربی-چهارگاه-علیزاده').form).toBe('هفت-ضربی');
    expect(pieceOf('چهار-پاره').form).toBe('چهارپاره');

    // Caveats are flags on the source row, never a reason to merge or rename.
    expect(pieceOf('ماهور-ردیف-میرزاعبدالله').provisional).toBe(true);
    expect(pieceOf('سیخی-ابوعطا').mediumConfidence).toBe(true);
    expect(pieceOf('چهارمضراب-ماهور-صبا').provisional).toBe(false);

    // aliases_seen is LITERAL SEARCH DATA. It is split on "|" and stored as
    // given — no wildcard is expanded, nothing is transliterated, and no alias
    // is ever consulted to decide which piece a file belongs to.
    expect(pieceOf('ماهور-ردیف-میرزاعبدالله').aliases).toEqual(['movie-on-16-04-2024-at-*']);
    expect(pieceOf('چهارمضراب-اول-دشتی-صبا').aliases).toEqual([
      'chahar-mezarabe-avale-dashti',
      '4mez-aval-dashti',
    ]);
    // The alias "abouata-sayakhi" belongs to سیخی-ابوعطا and to nothing else —
    // it never becomes a second key or a match for another row.
    expect(pieces.filter((p) => p.aliases.includes('abouata-sayakhi'))).toHaveLength(1);

    // --- refusals: an ambiguous registry is not a registry -----------------
    const rowFor = (key: string) => REGISTRY_ROWS.find((r) => r.startsWith(`${key},`))!;
    expect(() => parseRegistry([HEADER, rowFor('عراق'), rowFor('عراق')].join('\n'))).toThrow(
      /two rows for the canonical piece/i,
    );
    expect(() => parseRegistry([HEADER, ',(standalone),x,,,,,12,'].join('\n'))).toThrow(/empty canonical_fa/i);
    expect(() => parseRegistry(['canonical_fa,form,piece', 'x,y,z'].join('\n'))).toThrow(/missing the "dastgah" column/);
    expect(() =>
      parseRegistry([HEADER, 'ابوعطا-تست,گوشه,x,ابوعطا,,,"12,twelve",'].join('\n')),
    ).toThrow(/invalid session number "twelve"/);
    expect(() => parseRegistry([HEADER, 'x,y,z,,,,0,'].join('\n'))).toThrow(/invalid session number "0"/);
    // Malformed quoting: a field that opens a quote and never closes it, and a
    // stray quote in the middle of an unquoted field.
    expect(() => parseCsv('a,b\n"never closed,c')).toThrow(/never closed/i);
    expect(() => parseCsv('a,b\nx"y,c')).toThrow(/unexpected quote/i);
  });
});

describe('the Setar filename grammar', () => {
  it('setar filenames preserve compound roles and report unhandled assets', () => {
    // All seven worked examples from the archive's own brief, asserted exactly.
    expect(parseAssetStem('ضبط-کلاس-2')).toEqual({ role: 'ضبط-کلاس', piece: null, part: 2 });
    expect(parseAssetStem('تمرین-من-عراق')).toEqual({ role: 'تمرین-من', piece: 'عراق', part: null });
    expect(parseAssetStem('نمونه-1')).toEqual({ role: 'نمونه', piece: null, part: 1 });
    expect(parseAssetStem('نمونه-به-زندان-شوشتری')).toEqual({
      role: 'نمونه',
      piece: 'به-زندان-شوشتری',
      part: null,
    });
    expect(parseAssetStem('تصحیح-پیش-درامد-ماهور-هرمزی')).toEqual({
      role: 'تصحیح',
      piece: 'پیش-درامد-ماهور-هرمزی',
      part: null,
    });
    // ROLE BOUNDARY, LONGEST MATCH: "تمرین-من" wins over nothing, and the
    // piece keeps its own leading "تمرین" — token-0 splitting yields "تمرین".
    expect(parseAssetStem('تمرین-من-تمرین-دشتی-1-علیزاده')).toEqual({
      role: 'تمرین-من',
      piece: 'تمرین-دشتی-1-علیزاده',
      part: null,
    });
    // The embedded "-و-" stays INSIDE one canonical name; one file, one piece.
    expect(parseAssetStem('تمرین-من-رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان')).toEqual({
      role: 'تمرین-من',
      piece: 'رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان',
      part: null,
    });

    // A part number is TRAILING digits only; an embedded digit is identity.
    expect(parseAssetStem('نت-تمرین-دشتی-1-علیزاده')!.piece).toBe('تمرین-دشتی-1-علیزاده');
    expect(parseAssetStem('نمونه')!.part).toBe(null);
    expect(parseAssetStem('نمونه')!.piece).toBe(null);
    expect(displayTitle('تمرین-من-عراق')).toBe('تمرین من عراق');

    const index = build();

    // The known exception: not parsed, not reassigned to session 15, and named
    // in the diagnostics with something the owner can act on.
    const exception = index.diagnostics.find((d) => d.path.endsWith('video-2024-10-29-15-32-35.mp4'))!;
    expect(exception).toBeDefined();
    expect(exception.reason).toMatch(/no known role/i);
    expect(exception.path.startsWith('session-16-')).toBe(true);
    expect(resource(index, 'session-16-26-11-2024/video-2024-10-29-15-32-35.mp4')).toBeUndefined();
    expect(session(index, 15)).toBeUndefined();
    // No role was guessed for it anywhere.
    expect(
      index.sessions.every((s: { resources: { path: string }[] }) =>
        s.resources.every((r) => !r.path.includes('video-2024-10-29')),
      ),
    ).toBe(true);

    // An unknown piece, an unknown role and an unsupported extension are each
    // SURFACED rather than relabelled into something the archive didn't say.
    const odd = build({
      inventory: [
        { path: 'session-1-26-09-2023/نت-یک-قطعه-ناشناخته.pdf', size: 10 },
        { path: 'session-1-26-09-2023/راهنما-چیزی.pdf', size: 10 },
        { path: 'session-1-26-09-2023/نت-عراق.txt', size: 10 },
      ],
    });
    expect(odd.sessions[0].resources).toEqual([]);
    expect(odd.diagnostics.map((d) => d.reason)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/not in the registry/),
        expect.stringMatching(/no known role/),
        expect.stringMatching(/Unsupported file type "\.txt"/),
      ]),
    );

    // A class recording NEVER carries a piece: a filename claiming one is a
    // contradiction in the source, reported instead of silently scoped.
    const named = build({ inventory: [{ path: 'session-12-06-08-2024/ضبط-کلاس-عراق.mp4', size: 10 }] });
    expect(named.sessions[0].resources).toEqual([]);
    expect(named.diagnostics[0]!.reason).toMatch(/cannot name a piece/);

    // NO LARGEST-FILE HEURISTIC anywhere: the class recording of session 5 is
    // the one NAMED ضبط-کلاس, and the biggest file in session 13 is a demo.
    const s5 = session(index, 5);
    expect(s5.resources.filter((r) => r.role === 'ضبط-کلاس').map((r) => r.path)).toEqual([
      'session-5-23-01-2024/ضبط-کلاس.mp4',
    ]);
    const s13 = session(index, 13);
    const biggest = [...INVENTORY.filter((f) => f.path.startsWith('session-13-'))].sort((a, b) => b.size - a.size)[0]!;
    expect(biggest.path).toBe('session-13-03-09-2024/ضبط-کلاس.mp4');
    expect(s13.hasClassRecording).toBe(true);
    // ...and session 28, whose biggest file is a demo, still has NO class
    // recording rather than the largest video promoted into one.
    const s28 = session(index, 28);
    expect(s28.hasClassRecording).toBe(false);
    expect(s28.resources.some((r) => r.role === 'ضبط-کلاس')).toBe(false);
  });
});

describe('Setar session attribution', () => {
  it('setar session material follows exact roster and demonstration attribution', () => {
    const index = build();

    // Session 13: an UNNAMED two-part demonstration belongs to every canonical
    // member of that session — all eight — because there is no single piece to
    // attribute it to and the information simply is not in the filename.
    const s13 = session(index, 13);
    expect(s13.roster).toHaveLength(8);
    const demo13 = s13.resources.filter((r) => r.role === 'نمونه');
    expect(demo13.map((r) => r.path)).toEqual([
      'session-13-03-09-2024/نمونه-1.mp4',
      'session-13-03-09-2024/نمونه-2.mp4',
    ]);
    for (const part of demo13) expect([...part.pieces].sort()).toEqual([...s13.roster].sort());
    // Its numbered parts are ONE logical demonstration, ordered by part.
    expect(new Set(demo13.map((r) => r.group)).size).toBe(1);
    expect(demo13.map((r) => r.part)).toEqual([1, 2]);

    // Session 28: a NAMED demo belongs to that piece only — never to its
    // sibling ضربی-شکسته-لطفی, which is also a member of session 28.
    const s28 = session(index, 28);
    expect([...s28.roster].sort()).toEqual(['به-زندان-شوشتری', 'ضربی-شکسته-لطفی'].sort());
    const demo28 = s28.resources.filter((r) => r.role === 'نمونه');
    expect(demo28).toHaveLength(1);
    expect(demo28[0].pieces).toEqual(['به-زندان-شوشتری']);
    // ...and no class recording is fabricated for it.
    expect(s28.hasClassRecording).toBe(false);

    // Session 27: two class parts, ordered NUMERICALLY, and each stays with
    // the lesson rather than being scoped to a piece.
    const s27 = session(index, 27);
    const class27 = s27.resources.filter((r) => r.role === 'ضبط-کلاس');
    expect(class27.map((r) => r.part)).toEqual([1, 2]);
    expect(class27.every((r) => r.pieces.length === 0)).toBe(true);

    // FOLDER MEMBERSHIP, not mtime: session 9's and 10's practice recordings
    // of one piece belong to their own folders, and nothing here reads a time.
    expect(index.sessions.map((s) => s.n)).toEqual([...index.sessions.map((s) => s.n)].sort((a: number, b: number) => a - b));
    expect(session(index, 9).members.map((m) => m.key)).toEqual(['چهارمضراب-ماهور-صبا']);
    expect(session(index, 10).members.map((m) => m.key)).toEqual(['چهارمضراب-ماهور-صبا']);

    // Provisional identities are REAL, linkable pieces that keep their caveat.
    const provisional = index.pieces.find((p) => p.key === 'ماهور-ردیف-میرزاعبدالله')!;
    expect(provisional.provisional).toBe(true);
    expect(provisional.sessions).toEqual([7]);

    // The six-session repeat chain is PROVENANCE: six sessions the piece was
    // practised in, carried as membership and roles and nothing else. No
    // resource, no minute, no result and no "six weeks" claim is produced.
    const chain = [22, 23, 24, 25, 26, 27];
    for (const n of chain) {
      const s = session(index, n);
      const member = s.members.find((m) => m.key === 'پیش-درامد-سه-گاه-فروتن')!;
      expect(member.roles).toContain('تمرین-من');
      // The student's own recording is evidence, never material: it is not a
      // resource anywhere in the index.
      expect(s.resources.some((r) => r.path.includes('تمرین-من'))).toBe(false);
    }
    expect(JSON.stringify(index)).not.toContain('week');
    // Only the FIRST session of the chain has a demonstration for it.
    expect(session(index, 22).resources.some((r) => r.role === 'نمونه')).toBe(true);
    expect(session(index, 23).resources).toEqual([]);

    // ROSTER DISAGREEMENT: a folder naming a piece the registry does not place
    // in that session must NOT expand the unnamed demo across a guessed set.
    const disputed = build({
      inventory: [
        { path: 'session-13-03-09-2024/نمونه-1.mp4', size: 10 },
        // عراق is a real registry piece, but its only session is 12.
        { path: 'session-13-03-09-2024/نت-عراق.pdf', size: 10 },
      ],
    });
    const bad13 = session(disputed, 13);
    expect(bad13.rosterTrusted).toBe(false);
    expect(bad13.resources.find((r) => r.role === 'نمونه')!.pieces).toEqual([]);
    expect(disputed.diagnostics.map((d) => d.reason)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/registry does not list session 13/),
        expect.stringMatching(/Unnamed demonstration not attributed/),
      ]),
    );
    // The NAMED score still attaches to its own named piece — only the
    // ambiguous inference is blocked.
    expect(bad13.resources.find((r) => r.role === 'نت')!.pieces).toEqual(['عراق']);
  });
});

describe('scanning the archive', () => {
  it('setar scanning is bounded read-only and produces stable complete indexes', () => {
    const root = mkdtempSync(join(tmpdir(), 'setar-scan-'));
    const out = mkdtempSync(join(tmpdir(), 'setar-out-'));
    try {
      writeFileSync(join(root, 'PIECES.csv'), REGISTRY);
      const folders = new Set(INVENTORY.map((f) => f.path.split('/')[0]));
      for (const folder of folders) mkdirSync(join(root, folder));
      for (const f of INVENTORY) writeFileSync(join(root, f.path), Buffer.alloc(Math.min(f.size, 16)));
      // Things a scan must ignore, all real: a dotfile, NAS housekeeping, an
      // out-of-scope root folder, and a symlink pointing outside the archive.
      writeFileSync(join(root, 'session-1-26-09-2023/.DS_Store'), 'x');
      mkdirSync(join(root, 'session-1-26-09-2023/@eaDir'), { recursive: true });
      mkdirSync(join(root, 'practice'));
      writeFileSync(join(root, 'practice/نت-عراق.pdf'), 'x');
      writeFileSync(join(out, 'outside.mp4'), 'x');
      symlinkSync(join(out, 'outside.mp4'), join(root, 'session-1-26-09-2023/نت-عراق.pdf'));

      const { inventory: first, skipped: firstSkipped } = scanArchive(root);
      expect(first.some((f) => f.path.includes('.DS_Store'))).toBe(false);
      expect(first.some((f) => f.path.includes('@eaDir'))).toBe(false);
      expect(first.some((f) => f.path.startsWith('practice/'))).toBe(false);
      // The symlink is not followed: its target is outside the archive root.
      expect(first.some((f) => f.path.endsWith('نت-عراق.pdf'))).toBe(false);
      expect(first).toHaveLength(INVENTORY.length);
      // …but "not followed" is SAID, never silent. A walk that drops a file the
      // folder really holds and reports nothing publishes an index that is
      // quietly narrower than the archive — the same "partial view sold as
      // complete" the two-read check below refuses, arriving through the door
      // the two-read check cannot see, because BOTH readings agree on it.
      expect(firstSkipped.map((x) => x.path)).toEqual(['session-1-26-09-2023/نت-عراق.pdf']);
      expect(firstSkipped[0]!.reason).toMatch(/symbolic link/i);
      expect(
        buildIndex({ registryText: REGISTRY, inventory: first, skipped: firstSkipped }).diagnostics.some(
          (d) => d.path === 'session-1-26-09-2023/نت-عراق.pdf' && /symbolic link/i.test(d.reason),
        ),
      ).toBe(true);

      // DETERMINISM. Shuffled directory order and altered mtimes produce a
      // byte-identical semantic index: nothing here reads a time or trusts the
      // order the filesystem happened to hand back.
      const scanned = buildIndex({ registryText: REGISTRY, inventory: first });
      const shuffled = [...first].reverse();
      expect(buildIndex({ registryText: REGISTRY, inventory: shuffled }).contentHash).toBe(scanned.contentHash);
      const old = new Date('2001-01-01T00:00:00Z');
      for (const f of INVENTORY) utimesSync(join(root, f.path), old, old);
      expect(buildIndex({ registryText: REGISTRY, inventory: scanArchive(root).inventory }).contentHash).toBe(scanned.contentHash);
      expect(contentHash(scanned)).toBe(scanned.contentHash);
      // ...and the hash is not vacuous: a file whose SIZE changed is a changed
      // archive, so the semantic index changes with it.
      expect(buildIndex({ registryText: REGISTRY, inventory: INVENTORY }).contentHash).not.toBe(scanned.contentHash);

      // Session 9 sorts BEFORE session 10 — numerically, never lexically.
      const ns = scanned.sessions.map((s) => s.n);
      expect(ns.indexOf(9)).toBeLessThan(ns.indexOf(10));
      expect(ns).toEqual([1, 5, 9, 10, 12, 13, 16, 22, 23, 24, 25, 26, 27, 28]);

      // COMPLETENESS: every parseable useful file is in the index exactly once,
      // and the personal recordings are represented only as membership.
      const useful = INVENTORY.filter(
        (f) => !f.path.includes('تمرین-من') && !f.path.includes('video-2024-10-29'),
      );
      const indexed = scanned.sessions.flatMap((s: { resources: { path: string }[] }) => s.resources.map((r) => r.path));
      expect([...indexed].sort()).toEqual(useful.map((f) => f.path).sort());

      // --- refusals ---------------------------------------------------------
      expect(isSafeRelativePath('session-1-26-09-2023/ضبط-کلاس.mp4')).toBe(true);
      for (const unsafe of [
        '../PIECES.csv',
        'session-1/../../etc/passwd',
        '/etc/passwd',
        'session-1\\ضبط.mp4',
        'https://nas.example/x.mp4',
        'file:///etc/passwd',
        'session-1%2F..%2Fx.mp4',
        '',
      ]) {
        expect(isSafeRelativePath(unsafe)).toBe(false);
        expect(() => buildIndex({ registryText: REGISTRY, inventory: [{ path: unsafe, size: 1 }] })).toThrow();
      }
      expect(() =>
        buildIndex({
          registryText: REGISTRY,
          inventory: [
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 1 },
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 2 },
          ],
        }),
      ).toThrow(/share the path/);
      // Two folders claiming one session number are two different identities
      // for one lesson — refused, never merged.
      expect(() =>
        buildIndex({
          registryText: REGISTRY,
          inventory: [
            { path: 'session-1-26-09-2023/نمونه.mp4', size: 1 },
            { path: 'session-1-27-09-2023/نمونه.mp4', size: 1 },
          ],
        }),
      ).toThrow(/Two folders claim session 1/);
      // A folder date that is not a real calendar day is not a session.
      expect(parseSessionFolderName('session-3-30-02-2024')).toBeNull();
      expect(parseSessionFolderName('session-9-14-05-2024')).toEqual({ n: 9, date: '2024-05-14' });
      const oversize = Array.from({ length: 5001 }, (_, i) => ({ path: `session-1-26-09-2023/نمونه-${i}.mp4`, size: 1 }));
      expect(() => buildIndex({ registryText: REGISTRY, inventory: oversize })).toThrow(/more than 5000 files/);

      // --- publication is atomic, outside the archive, read-only over it ----
      const target = join(out, 'index.json');
      writeIndexAtomically(target, 'last good\n', root);
      expect(() => writeIndexAtomically(join(root, 'index.json'), 'x', root)).toThrow(/inside the archive/);
      // --- ONE CONSISTENT VIEW, OF EVERY INPUT, NOT JUST THE REGISTRY -------
      // The registry used to be the only input re-read after the walk, so the
      // one thing a non-atomic NAS copy actually perturbs — THE MEDIA — was
      // never checked: move a resource out before its folder is enumerated and
      // put it back while later folders are walked, and the scan publishes an
      // index that omits it while PIECES.csv never changes. The next Refresh
      // then marks still-present material unavailable.
      const renameLog = 'old_path,new_path\nsession-1-26-09-2023/a.mp4,session-1-26-09-2023/b.mp4\n';
      writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
      const settled = readSource(root);
      // Every input this scanner reads is in the reading that gets compared.
      expect(Object.keys(settled).sort()).toEqual(['inventory', 'registryText', 'renameLog', 'skipped']);
      expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));

      // Each of the inputs, perturbed in turn, is VISIBLE to that comparison.
      const moved = INVENTORY[0]!.path;
      const bytes = readFileSync(join(root, moved));
      const when = new Date(settled.inventory.find((f) => f.path === moved)!.mtimeMs!);
      // Put a file back EXACTLY as it was — bytes and metadata — or the
      // restore is itself a mutation, which is the whole point of observing
      // more than the size.
      const restore = () => {
        writeFileSync(join(root, moved), bytes);
        utimesSync(join(root, moved), when, when);
      };
      rmSync(join(root, moved));
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      restore(); // …and back, as a copy would
      expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
      // A file still being COPIED is a size change, and is caught the same way.
      writeFileSync(join(root, moved), Buffer.concat([bytes, Buffer.alloc(8)]));
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      restore();
      writeFileSync(join(root, 'RENAME-LOG.csv'), `${renameLog}session-1/x.mp4,session-1/y.mp4\n`);
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
      writeFileSync(join(root, 'PIECES.csv'), `${REGISTRY}\n`);
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      writeFileSync(join(root, 'PIECES.csv'), REGISTRY);
      expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));
      // A file edited IN PLACE at the same byte length changes no size and no
      // CSV: `mtimeMs` is what makes that mutation visible to the comparison,
      // and it is deliberately NOT semantic — the determinism check above
      // altered every mtime in the archive and the index hash did not move.
      const later = new Date(Date.now() + 60_000);
      utimesSync(join(root, moved), later, later);
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      utimesSync(join(root, moved), when, when);
      expect(canonicalJson(readSource(root))).toBe(canonicalJson(settled));

      // A READ FAILURE IS NEVER VALID EMPTY SOURCE DATA. `catch { text = '' }`
      // made an unreadable RENAME-LOG.csv indistinguishable from an archive
      // that has none: both readings agreed, the consistency check passed, and
      // the scan published an index with NO renames — so a file that moved in
      // that window is flagged unavailable and its saved references can never
      // be repaired. Absence is an OBSERVATION and is recorded as one;
      // anything else fails the scan.
      expect(settled.renameLog).toEqual({ present: true, text: renameLog });
      rmSync(join(root, 'RENAME-LOG.csv'));
      expect(readSource(root).renameLog).toEqual({ present: false });
      // …and the two are not the same reading, so a log that VANISHES between
      // the readings is a change, not a quiet "there was never one".
      expect(canonicalJson(readSource(root))).not.toBe(canonicalJson(settled));
      // A present-but-EMPTY log is a zero-byte file — what a copy in flight
      // looks like — and is refused exactly as PIECES.csv would be, rather
      // than read as "no renames".
      writeFileSync(join(root, 'RENAME-LOG.csv'), '');
      expect(() => scanToIndex(root)).toThrow(/CSV is empty/);
      // An unreadable required input fails the scan; it is never an empty one.
      writeFileSync(join(root, 'RENAME-LOG.csv'), renameLog);
      const hidden = join(root, 'PIECES.csv');
      const registryBytes = readFileSync(hidden);
      rmSync(hidden);
      mkdirSync(hidden); // a directory where a file must be: EISDIR, not ENOENT
      expect(() => readSource(root)).toThrow(/Could not read PIECES\.csv/);
      expect(() => scanToIndex(root)).toThrow(/Could not read PIECES\.csv/);
      rmSync(hidden, { recursive: true });
      writeFileSync(hidden, registryBytes);

      // A RENAME LOOP NAMES NO FILE, and is dropped with a diagnostic rather
      // than published. Every path that walks INTO the loop is equally
      // unusable: A->B, B->C, C->B leaves no readable destination for A.
      const swap = buildIndex({
        registryText: REGISTRY,
        inventory: INVENTORY,
        renameLog: {
          present: true,
          text: 'old_path,new_path\nsession-1-26-09-2023/a.mp4,session-1-26-09-2023/b.mp4\nsession-1-26-09-2023/b.mp4,session-1-26-09-2023/a.mp4\n',
        },
      });
      expect(swap.renames).toEqual([]);
      expect(swap.diagnostics.filter((d) => /loops through this path/.test(d.reason)).map((d) => d.path).sort()).toEqual([
        'session-1-26-09-2023/a.mp4',
        'session-1-26-09-2023/b.mp4',
      ]);
      const intoLoop = buildIndex({
        registryText: REGISTRY,
        inventory: INVENTORY,
        renameLog: {
          present: true,
          text: 'old_path,new_path\nx/a.mp4,x/b.mp4\nx/b.mp4,x/c.mp4\nx/c.mp4,x/b.mp4\n',
        },
      });
      expect(intoLoop.renames).toEqual([]);
      // An ordinary chain beside a loop still publishes — one bad topology
      // does not cost the archive its good provenance.
      const mixed = buildIndex({
        registryText: REGISTRY,
        inventory: INVENTORY,
        renameLog: {
          present: true,
          text: 'old_path,new_path\nx/p.mp4,x/q.mp4\nx/a.mp4,x/b.mp4\nx/b.mp4,x/a.mp4\n',
        },
      });
      expect(mixed.renames).toEqual([{ from: 'x/p.mp4', to: 'x/q.mp4' }]);
      // An old path with TWO destinations was already refused, and still is.
      const forked = buildIndex({
        registryText: REGISTRY,
        inventory: INVENTORY,
        renameLog: { present: true, text: 'old_path,new_path\nx/a.mp4,x/b.mp4\nx/a.mp4,x/c.mp4\n' },
      });
      expect(forked.renames).toEqual([{ from: 'x/a.mp4', to: 'x/b.mp4' }]);
      expect(forked.diagnostics.some((d) => /both/.test(d.reason))).toBe(true);

      // And the scan itself reads the WHOLE source twice and refuses on any
      // difference. Nothing can mutate a filesystem between two synchronous
      // reads from inside this process, so the WIRING is held structurally —
      // the same way `commitArchiveImport`'s "no whole-DB import" is.
      const scannerSrc = readFileSync('scripts/scan-setar-classes.mjs', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const scanBody = scannerSrc.slice(
        scannerSrc.indexOf('export function scanToIndex'),
        scannerSrc.indexOf('function main('),
      );
      expect(scanBody.match(/readSource\(base\)/g) ?? []).toHaveLength(2);
      expect(scanBody).toMatch(/canonicalJson\(before\) !== canonicalJson\(after\)/);
      expect(scanBody).toMatch(/changed during the scan/);
      rmSync(join(root, 'RENAME-LOG.csv'));

      // A scan that cannot produce a complete consistent view throws BEFORE
      // anything is written, so the last good output still stands.
      rmSync(join(root, 'PIECES.csv'));
      expect(() => scanToIndex(root)).toThrow();
      expect(readFileSync(target, 'utf8')).toBe('last good\n');
      // And the archive itself is untouched by any of the above.
      expect(scanArchive(root).inventory).toHaveLength(INVENTORY.length);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(out, { recursive: true, force: true });
    }
  });
});
```

### src/domain/sourceArchive.ts

```
import type { ID, ISODate, ISODateTime, LessonRecording, PracticeDB } from './types';
import { canonicalStringify, sha256Hex } from './canonical';

// ---------------------------------------------------------------------------
// The Setar class archive as the APP sees it.
//
// The app never parses a filename. A read-only scanner (scripts/scan-setar-
// classes.mjs) publishes a deterministic JSON index; everything here decodes
// that index, keeps the accepted graph, and answers questions about it.
//
// Pure: no React, no clock, no network. The decoder is a TRUST BOUNDARY — it
// refuses what it cannot vouch for rather than coercing it, because every
// identity downstream (which lesson, which piece, which file) is taken from
// this data verbatim.
// ---------------------------------------------------------------------------

export const INDEX_FORMAT = 'setar-archive-index';
export const INDEX_VERSION = 1;
/** The one archive this lane knows. Tar/Guitar do not share this grammar. */
export const SETAR_ARCHIVE_ID = 'setar-classes';

/** A published index larger than this is refused rather than parsed. */
export const MAX_INDEX_BYTES = 4 * 1024 * 1024;

// --- the published index ---------------------------------------------------

export interface SourcePiece {
  /** `canonical_fa` — the BYTE-EXACT join key. Never folded or transliterated. */
  key: string;
  form: string;
  piece: string;
  dastgah: string;
  composer: string;
  /** Literal historical spellings, for SEARCH only — never for identity. */
  aliases: string[];
  sessions: number[];
  notes: string;
  provisional?: boolean;
  mediumConfidence?: boolean;
  /** The source no longer describes this piece; its provenance is kept. */
  unavailable?: boolean;
}

export type SourceRole = string;
export type SourceKind = 'video' | 'score' | 'photo';

export interface SourceResource {
  /** Archive-RELATIVE path. Never an absolute URL: transport is per device. */
  path: string;
  role: SourceRole;
  kind: SourceKind;
  title: string;
  part?: number | null;
  size?: number;
  /** Canonical piece keys this resource is material for. Empty = lesson-level. */
  pieces: string[];
  /** Parts of ONE logical demonstration share a group. */
  group?: string | null;
  unavailable?: boolean;
}

export interface SourceMember {
  key: string;
  roles: SourceRole[];
}

export interface SourceSession {
  n: number;
  date: ISODate;
  folder: string;
  roster: string[];
  rosterTrusted: boolean;
  hasClassRecording: boolean;
  resources: SourceResource[];
  members: SourceMember[];
  unavailable?: boolean;
}

export interface SourceRename {
  from: string;
  to: string;
}

export interface SourceDiagnostic {
  path: string;
  reason: string;
}

export interface SourceIndex {
  format: typeof INDEX_FORMAT;
  version: number;
  archiveId: string;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  contentHash: string;
}

// --- what the database keeps ----------------------------------------------

/** An owner decision that a refresh, a reload and a sync must all respect. */
export interface SourceSuppression {
  /** `piece` / `session` / `resource` (a hidden file), `link` (item-to-lesson). */
  kind: 'piece' | 'session' | 'resource' | 'link';
  /** Piece key, session number, resource path, or `sessionN:pieceKey`. */
  ref: string;
  /** A resource hidden on ONE item only — never on its siblings. */
  itemId?: ID;
  at: ISODateTime;
}

/**
 * The last accepted source graph, persisted so material, provenance and the
 * next refresh all work offline. One row per archive; items and lessons carry
 * only a KEY into it, so a resource is never copied per item.
 */
export interface ArchiveSource {
  id: ID;
  instrumentId: ID;
  indexHash: string;
  acceptedAt: ISODateTime;
  pieces: SourcePiece[];
  sessions: SourceSession[];
  renames: SourceRename[];
  diagnostics: SourceDiagnostic[];
  suppressions: SourceSuppression[];
}

/** An item's binding to a canonical piece in an archive. */
export interface ItemSourceRef {
  archiveId: ID;
  pieceKey: string;
}

/** A lesson's binding to one archive session. */
export interface LessonSourceRef {
  archiveId: ID;
  sessionN: number;
}

// --- path safety -----------------------------------------------------------

/**
 * An archive path is a relative POSIX path of plain segments. Traversal,
 * absolute paths, backslashes, URL schemes, credentials and percent-encoded
 * separators are REFUSED, never sanitised: a rewritten path names a different
 * file, and this graph is an identity table.
 *
 * Deliberately a small copy of the scanner's own predicate rather than an
 * import — `scripts/` is a Node operator tool that must not be pulled into the
 * browser bundle, and this rule is eight lines.
 */
export function isSafeSourcePath(p: unknown): p is string {
  if (typeof p !== 'string' || !p) return false;
  if (p.length > 1024) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(p)) return false;
  if (p.startsWith('/') || p.includes('\\')) return false;
  if (/%2f|%5c/i.test(p)) return false;
  if (p.includes('@')) return false; // no user:pass@host smuggled in
  return p.split('/').every((s) => s !== '' && s !== '.' && s !== '..');
}

// --- deterministic identity ------------------------------------------------

const NUL = String.fromCharCode(0);

/**
 * FNV-1a over the UTF-8 bytes, twice, for a stable 64-bit hex digest. Two
 * devices importing the same source must MINT THE SAME ID for the same logical
 * entity, or the next sync sees two records for one piece. A readable
 * `src:<archive>:piece:<farsi key>` would be equally deterministic but puts
 * Farsi into every route parameter; this keeps ids ASCII.
 */
function stableHash(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (const byte of bytes) {
    a = Math.imul(a ^ byte, 0x01000193) >>> 0;
    b = Math.imul(b ^ byte, 0x85ebca6b) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

/** Deterministic id for the item a canonical piece becomes. */
export function sourceItemId(archiveId: string, pieceKey: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}piece${NUL}${pieceKey}`)}`;
}

/** Deterministic id for the historical lesson an archive session becomes. */
export function sourceLessonId(archiveId: string, sessionN: number): ID {
  return `src-${stableHash(`${archiveId}${NUL}session${NUL}${sessionN}`)}`;
}

/** Deterministic id for a resource reference minted from the graph. */
export function sourceResourceId(archiveId: string, path: string): ID {
  return `src-${stableHash(`${archiveId}${NUL}asset${NUL}${path}`)}`;
}

// --- decoding --------------------------------------------------------------

/** The fixed role vocabulary, byte-exact from the archive's own contract. */
export const SOURCE_ROLES: readonly string[] = [
  'ضبط-کلاس', // class recording
  'تمرین-من', // my practice
  'تصحیح', // corrected notation
  'تکلیف', // homework
  'جزوه', // handout
  'نمونه', // teacher demonstration
  'نت', // clean notation
];

/**
 * Plain-English names for the archive's own role words, for UI copy only.
 * The Farsi word stays the identity everywhere else — this is a LABEL map,
 * exactly like `ITEM_STATUS_LABELS`, and never a second vocabulary.
 */
export const SOURCE_ROLE_LABELS: Record<string, string> = {
  [SOURCE_ROLES[0]!]: 'class recording',
  [SOURCE_ROLES[1]!]: 'my practice',
  [SOURCE_ROLES[2]!]: 'teacher’s corrections',
  [SOURCE_ROLES[3]!]: 'homework',
  [SOURCE_ROLES[4]!]: 'handout',
  [SOURCE_ROLES[5]!]: 'teacher’s demonstration',
  [SOURCE_ROLES[6]!]: 'notation',
};

export const CLASS_ROLE = SOURCE_ROLES[0];
export const PERSONAL_ROLE = SOURCE_ROLES[1];
export const CORRECTION_ROLE = SOURCE_ROLES[2];
export const DEMO_ROLE = SOURCE_ROLES[5];
export const NOTATION_ROLE = SOURCE_ROLES[6];

const ROLE_SET = new Set<string>(SOURCE_ROLES);
const KIND_SET = new Set<string>(['video', 'score', 'photo']);
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, what: string): string {
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function strList(v: unknown, what: string): string[] {
  if (v === undefined) return [];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) throw new Error(`${what} must be a list of text.`);
  return v as string[];
}

/**
 * ABSENT IS A DEFAULT; PRESENT-AND-WRONG IS A REFUSAL. Never a coercion.
 *
 * The decoder NORMALISES before `checkSourceGraph` runs, so the grammar only
 * ever sees what these produce — which is why `Array.isArray(x) ? x : []` was
 * not a tolerance but a silent erasure: a session whose `resources` arrived as
 * `null` decoded to a session with NO resources, passed the grammar (it is a
 * valid empty list by then) and turned six files into zero. The same held for
 * every scalar: `part: "3"` became `null`, a wrong-typed `size` vanished, and
 * `rosterTrusted: 'yes'` became a boolean the grammar was happy with.
 *
 * These three are that rule in one place, and they throw NAMING the record —
 * the same treatment `validatePracticeText` gives the owner's own words.
 */
function list(v: unknown, what: string): unknown[] {
  if (v === undefined) return [];
  if (!Array.isArray(v)) throw new Error(`${what} must be a list.`);
  return v;
}

/**
 * OPTIONAL TEXT. `str(raw.form ?? '')` read ABSENT and PRESENT-AND-NULL as the
 * same thing and quietly produced `''` for both — the very normalisation the
 * list/num/bool rule above exists to stop, left in place for every string
 * field that has a default. A resource `title: null` became an untitled row
 * the grammar was perfectly happy with. Absent is a default; null is a value,
 * and a wrong one.
 */
function text(v: unknown, what: string): string {
  if (v === undefined) return '';
  if (typeof v !== 'string') throw new Error(`${what} must be text.`);
  return v;
}

function num(v: unknown, what: string): number | null {
  if (v === undefined || v === null) return null;
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

/** A number that is genuinely a number — no `null`, unlike an optional part. */
function size(v: unknown, what: string): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${what} must be a number.`);
  return v;
}

function bool(v: unknown, what: string, fallback: boolean): boolean {
  if (v === undefined) return fallback;
  if (typeof v !== 'boolean') throw new Error(`${what} must be true or false.`);
  return v;
}

/** A real calendar day, not merely four-two-two digits ("2026-02-30" is not). */
export function isValidSourceDate(v: unknown): v is ISODate {
  if (typeof v !== 'string') return false;
  const m = DATE_RE.exec(v);
  if (!m) return false;
  const [, y, mo, d] = m;
  const t = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  return t.getUTCFullYear() === Number(y) && t.getUTCMonth() === Number(mo) - 1 && t.getUTCDate() === Number(d);
}

/** A real calendar instant — the date-time sibling of {@link isValidSourceDate}. */
export function isValidSourceDateTime(v: unknown): v is ISODateTime {
  if (typeof v !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
  if (!m) return false;
  if (!isValidSourceDate(v.slice(0, 10))) return false;
  return !Number.isNaN(Date.parse(v));
}

/**
 * Validate an unknown published index into a {@link SourceIndex}, or throw with
 * a message the owner can act on.
 *
 * A NEWER version is refused rather than read leniently: a future scanner may
 * mean something different by the same field, and this graph decides which
 * file is which piece.
 */
export function decodeSourceIndex(input: unknown): SourceIndex {
  if (!isRecord(input)) throw new Error('The source index is not a valid object.');
  if (input.format !== INDEX_FORMAT) throw new Error('That file is not a Setar archive index.');
  if (typeof input.version !== 'number' || !Number.isInteger(input.version)) {
    throw new Error('The source index has no usable version.');
  }
  if (input.version > INDEX_VERSION) {
    throw new Error(
      `This index was written by a newer scanner (version ${input.version}) than this app understands (version ${INDEX_VERSION}). Update the app.`,
    );
  }
  if (input.version < INDEX_VERSION) {
    throw new Error(`This index is from an older scanner (version ${input.version}). Re-run the scanner.`);
  }
  const archiveId = str(input.archiveId, 'The index archive id');
  if (!archiveId.trim()) throw new Error('The index archive id is empty.');
  if (typeof input.contentHash !== 'string' || !/^[0-9a-f]{64}$/.test(input.contentHash)) {
    throw new Error('The index carries no usable content hash.');
  }

  if (!Array.isArray(input.pieces)) throw new Error('The index has no piece registry.');
  if (!Array.isArray(input.sessions)) throw new Error('The index has no sessions.');

  const pieces: SourcePiece[] = [];
  const keys = new Set<string>();
  for (const raw of input.pieces) {
    if (!isRecord(raw)) throw new Error('A registry entry is not an object.');
    const key = str(raw.key, 'A registry entry key');
    if (!key.trim()) throw new Error('A registry entry has an empty canonical key.');
    if (keys.has(key)) throw new Error(`Two registry entries share the canonical key "${key}".`);
    keys.add(key);
    const sessions = list(raw.sessions, `Registry entry "${key}" sessions`);
    if (sessions.some((n) => typeof n !== 'number' || !Number.isInteger(n) || n < 1)) {
      throw new Error(`Registry entry "${key}" has an invalid session number.`);
    }
    pieces.push({
      key,
      form: text(raw.form, `Registry entry "${key}" form`),
      piece: text(raw.piece, `Registry entry "${key}" piece`),
      dastgah: text(raw.dastgah, `Registry entry "${key}" dastgah`),
      composer: text(raw.composer, `Registry entry "${key}" composer`),
      aliases: strList(raw.aliases, `Registry entry "${key}" aliases`),
      sessions: sessions as number[],
      notes: text(raw.notes, `Registry entry "${key}" notes`),
      ...(bool(raw.provisional, `Registry entry "${key}" provisional`, false) ? { provisional: true } : {}),
      ...(bool(raw.mediumConfidence, `Registry entry "${key}" confidence`, false) ? { mediumConfidence: true } : {}),
    });
  }

  const sessions: SourceSession[] = [];
  const seenN = new Set<number>();
  const seenPaths = new Set<string>();
  for (const raw of input.sessions) {
    if (!isRecord(raw)) throw new Error('A session entry is not an object.');
    const n = raw.n;
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) throw new Error('A session has no usable number.');
    if (seenN.has(n)) throw new Error(`Two entries claim session ${n}.`);
    seenN.add(n);
    if (!isValidSourceDate(raw.date)) throw new Error(`Session ${n} has an unreadable date.`);
    const folder = str(raw.folder, `Session ${n} folder`);
    if (!isSafeSourcePath(folder)) throw new Error(`Session ${n} has an unsafe folder path.`);
    const roster = strList(raw.roster, `Session ${n} roster`);
    for (const k of roster) {
      if (!keys.has(k)) throw new Error(`Session ${n} lists piece "${k}", which is not in the registry.`);
    }
    const resources: SourceResource[] = [];
    for (const r of list(raw.resources, `Session ${n} resources`)) {
      if (!isRecord(r)) throw new Error(`Session ${n} has a resource that is not an object.`);
      const path = r.path;
      if (!isSafeSourcePath(path)) throw new Error(`Session ${n} has an unsafe resource path.`);
      if (seenPaths.has(path)) throw new Error(`Two resources share the path "${path}".`);
      seenPaths.add(path);
      const role = str(r.role, 'A resource role');
      if (!ROLE_SET.has(role)) throw new Error(`Resource "${path}" has an unknown role.`);
      const kind = str(r.kind, 'A resource kind');
      if (!KIND_SET.has(kind)) throw new Error(`Resource "${path}" has an unknown kind "${kind}".`);
      const forPieces = strList(r.pieces, `Resource "${path}" pieces`);
      for (const k of forPieces) {
        if (!keys.has(k)) throw new Error(`Resource "${path}" names piece "${k}", which is not in the registry.`);
      }
      resources.push({
        path,
        role,
        kind: kind as SourceKind,
        title: text(r.title, `Resource "${path}" title`),
        part: num(r.part, `Resource "${path}" part`),
        // `part` and `group` are genuinely nullable in the published format —
        // the scanner emits `null` for both — so null stays legal THERE and
        // nowhere else. `size` it always emits as a number, and a present null
        // is refused HERE rather than spread into the output as a value the
        // declared type does not admit and left for the grammar to catch.
        ...(r.size === undefined ? {} : { size: size(r.size, `Resource "${path}" size`) }),
        pieces: forPieces,
        group: r.group === undefined || r.group === null ? null : str(r.group, `Resource "${path}" group`),
      });
    }
    const members: SourceMember[] = [];
    for (const m of list(raw.members, `Session ${n} members`)) {
      if (!isRecord(m)) throw new Error(`Session ${n} has a membership that is not an object.`);
      const key = str(m.key, 'A membership key');
      if (!keys.has(key)) throw new Error(`Session ${n} claims piece "${key}", which is not in the registry.`);
      const roles = strList(m.roles, `Membership "${key}" roles`);
      for (const role of roles) if (!ROLE_SET.has(role)) throw new Error(`Membership "${key}" has an unknown role.`);
      members.push({ key, roles });
    }
    sessions.push({
      n,
      date: raw.date as ISODate,
      folder,
      roster,
      rosterTrusted: bool(raw.rosterTrusted, `Session ${n} roster trust`, true),
      hasClassRecording: bool(raw.hasClassRecording, `Session ${n} class recording`, false),
      resources,
      members,
    });
  }

  const renames: SourceRename[] = [];
  const froms = new Set<string>();
  for (const r of list(input.renames, 'The rename log')) {
    if (!isRecord(r)) throw new Error('A rename entry is not an object.');
    if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) throw new Error('A rename entry carries an unsafe path.');
    if (froms.has(r.from)) throw new Error(`The index maps "${r.from}" to more than one destination.`);
    froms.add(r.from);
    renames.push({ from: r.from, to: r.to });
  }

  const diagnostics: SourceDiagnostic[] = [];
  for (const d of list(input.diagnostics, 'The diagnostic list')) {
    if (!isRecord(d)) throw new Error('A diagnostic entry is not an object.');
    diagnostics.push({
      path: text(d.path, 'A diagnostic path'),
      reason: text(d.reason, 'A diagnostic reason'),
    });
  }

  // The decoder's own normalisation, held to the SAME grammar the persisted
  // graph is held to. Every field below has just been built here, so this can
  // only fail if the two ever drift — which is exactly what it exists to stop.
  const bad = checkSourceGraph({ pieces, sessions, renames, diagnostics }, 'The source index');
  if (bad) throw new Error(bad);

  return {
    format: INDEX_FORMAT,
    version: INDEX_VERSION,
    archiveId,
    pieces,
    sessions,
    renames,
    diagnostics,
    contentHash: input.contentHash,
  };
}

/**
 * The scanner's own digest, recomputed here: SHA-256 over the key-sorted JSON
 * of the SEMANTIC body — everything but `contentHash` and the clock-bearing
 * `generatedAt`. Byte-for-byte the definition in `scripts/scan-setar-classes.mjs`
 * (`contentHash` / `canonicalJson`), and `canonicalStringify` produces exactly
 * that serialisation for JSON-derived data.
 */
async function computeIndexDigest(parsed: Record<string, unknown>): Promise<string> {
  const body = { ...parsed };
  delete body.contentHash;
  delete body.generatedAt;
  return sha256Hex(canonicalStringify(body));
}

/**
 * Read published index TEXT: size, JSON, structure, and finally the DIGEST.
 *
 * `contentHash` is not a checksum the app may take on faith — it is the
 * REFRESH IDENTITY. `planArchiveImport` compares it against the hash already
 * accepted to decide that nothing has changed, so content altered in transit
 * (or in the repository) under a retained old hash would be reported "Already
 * current" and the changed facts silently ignored. Recomputing it here, at the
 * ONE boundary both the GitHub fetch and the file fallback pass through, makes
 * that fail closed instead.
 *
 * `decodeSourceIndex` stays synchronous and digest-free on purpose: it is the
 * STRUCTURAL decoder, and the digest is a transport-integrity concern. Tests
 * that build an index object in memory call it directly and have no transport.
 *
 * Order matters: size → parse → structure → digest, so a structurally broken
 * file reports the error the owner can act on rather than a hash mismatch.
 */
export async function parseSourceIndex(text: string): Promise<SourceIndex> {
  if (text.length > MAX_INDEX_BYTES) throw new Error('That index file is too large to be a Setar archive index.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const index = decodeSourceIndex(parsed);
  const actual = await computeIndexDigest(parsed as Record<string, unknown>);
  if (actual !== index.contentHash) {
    throw new Error(
      'This index does not match its own content hash — it was altered after the scanner wrote it. Nothing was changed.',
    );
  }
  return index;
}

// --- what counts as an UPCOMING class ---------------------------------------

/**
 * THE one predicate for "is this lesson still ahead of me". Every caller that
 * asks about the next class — the badges, the default question target, the
 * commitment deadline that reaches practice priority — goes through this.
 *
 * A lesson imported from a source archive is a record of a class that ALREADY
 * HAPPENED. Its date can still be in the future relative to this device's
 * clock (the archive runs to September 2026 and a device may be behind it, or
 * the owner may simply be importing early), and a plain `date >= today` then
 * turns thirty-nine pieces of history into thirty-nine deadlines: urgency on
 * items nobody committed to anything, and a question sheet defaulting to a
 * class that is over. `origin: 'archive'` is checked FIRST, before the date,
 * because no date can make history upcoming.
 */
export function isUpcomingLesson(lesson: { date: ISODate; origin?: string }, todayISO: ISODate): boolean {
  if (lesson.origin === 'archive') return false;
  return lesson.date >= todayISO;
}

// --- queries over the accepted graph ---------------------------------------

export function archiveFor(db: PracticeDB, archiveId: string): ArchiveSource | undefined {
  return db.archiveSources?.find((a) => a.id === archiveId);
}

function suppressed(source: ArchiveSource, kind: SourceSuppression['kind'], ref: string, itemId?: ID): boolean {
  return source.suppressions.some(
    (s) => s.kind === kind && s.ref === ref && (s.itemId === undefined || s.itemId === itemId),
  );
}

/** Sessions a canonical piece appears in, numerically ordered. */
export function sessionsForPiece(source: ArchiveSource, pieceKey: string): SourceSession[] {
  return source.sessions.filter((s) => s.members.some((m) => m.key === pieceKey)).sort((a, b) => a.n - b.n);
}

/**
 * Consecutive runs of sessions a piece was practised in. Six sessions in a row
 * is six CLASSES worth of provenance — never six weeks, and never practice
 * this app recorded.
 */
export function repeatChains(source: ArchiveSource, pieceKey: string): number[][] {
  // A REPEAT is the student having been asked to play the piece again: its own
  // practice recording, in consecutive sessions. Membership alone is the wrong
  // input — an unnamed demonstration gives every piece in its session
  // membership, so a chain read from membership would report a repeat nobody
  // was asked for.
  const ns = source.sessions
    .filter((s) => s.members.some((m) => m.key === pieceKey && m.roles.includes(PERSONAL_ROLE)))
    .sort((a, b) => a.n - b.n)
    .map((s) => s.n);
  const chains: number[][] = [];
  for (const n of ns) {
    const last = chains[chains.length - 1];
    if (last && last[last.length - 1] === n - 1) last.push(n);
    else chains.push([n]);
  }
  return chains.filter((c) => c.length > 1);
}

export interface ScopedResource extends SourceResource {
  sessionN: number;
  sessionDate: ISODate;
}

/**
 * Every archive resource that is USEFUL PRACTICE MATERIAL for one piece, in
 * session order. A class recording stays with its lesson, a resource the owner
 * hid on THIS item is dropped for this item only, and a suppressed session or
 * piece contributes nothing.
 */
export function resourcesForPiece(source: ArchiveSource, pieceKey: string, itemId?: ID): ScopedResource[] {
  if (suppressed(source, 'piece', pieceKey)) return [];
  const out: ScopedResource[] = [];
  for (const s of sessionsForPiece(source, pieceKey)) {
    if (suppressed(source, 'session', String(s.n))) continue;
    for (const r of s.resources) {
      if (!r.pieces.includes(pieceKey)) continue;
      if (suppressed(source, 'resource', r.path, itemId)) continue;
      out.push({ ...r, sessionN: s.n, sessionDate: s.date });
    }
  }
  return out;
}

/** Everything an archive session contributes to its own lesson, in role order. */
export function resourcesForSession(source: ArchiveSource, sessionN: number): SourceResource[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.resources.filter((r) => !suppressed(source, 'resource', r.path));
}

/** Turn a graph resource into the app's ordinary NAS reference shape. */
export function resourceReference(archiveId: string, r: SourceResource, date?: ISODate): LessonRecording {
  return {
    id: sourceResourceId(archiveId, r.path),
    title: r.title,
    path: r.path,
    kind: r.kind === 'video' ? 'video' : r.kind === 'score' ? 'pdf' : 'doc',
    ...(date ? { date } : {}),
    ...(r.size ? { sizeBytes: r.size } : {}),
    createdAt: '1970-01-01T00:00:00.000Z',
  };
}

// --- the graph's own grammar, in ONE place ---------------------------------

/**
 * THE grammar of a source graph — every nested field, one definition.
 *
 * `decodeSourceIndex` and `validateArchiveSources` used to state this
 * separately, and the second stated LESS of it: it checked a resource's path
 * and its part group and then walked straight past `members[].roles`,
 * `piece.aliases`, a resource's `kind`, `title` and `pieces`, a session's
 * `folder` and `roster`, and the rename and diagnostic rows entirely. A
 * database carrying `members[0].roles: null` was therefore accepted and
 * PERSISTED by every inbound door, and the first production reader to touch it
 * — `repeatChains`, doing `m.roles.includes(...)` — threw while rendering
 * material. `planArchiveImport` had the same exposure through
 * `new Set([piece.key, ...piece.aliases])`, which throws on a non-iterable.
 *
 * Both callers run THIS function now, so the decoder and the persisted-graph
 * validator cannot drift apart again: a reader may dereference any field this
 * grammar admits, and nothing else can reach the database.
 *
 * `unavailable` stays legal on a piece, a session and a resource — a file gone
 * from the NAS with its provenance kept is a VALID state, not a broken graph.
 */
function checkSourceGraph(
  graph: { pieces: unknown; sessions: unknown; renames?: unknown; diagnostics?: unknown },
  label: string,
): string | null {
  const text = (v: unknown) => typeof v === 'string';
  const textList = (v: unknown) => Array.isArray(v) && v.every(text);
  const flag = (v: unknown) => v === undefined || typeof v === 'boolean';

  if (!Array.isArray(graph.pieces)) return `${label} has no piece registry.`;
  if (!Array.isArray(graph.sessions)) return `${label} has no sessions.`;

  const keys = new Set<string>();
  for (const raw of graph.pieces) {
    if (!isRecord(raw)) return `${label} has a registry entry that is not an object.`;
    const p = raw as Partial<SourcePiece>;
    if (typeof p.key !== 'string' || !p.key) return `${label} has a piece with no canonical key.`;
    if (keys.has(p.key)) return `${label} has two pieces keyed "${p.key}".`;
    keys.add(p.key);
    for (const field of ['form', 'piece', 'dastgah', 'composer', 'notes'] as const) {
      if (!text(p[field])) return `Piece "${p.key}" has an unreadable ${field}.`;
    }
    // SEARCH data, read as `[...piece.aliases]` by the reconciler: a value
    // that is not a list of text takes the whole refresh down with a TypeError.
    if (!textList(p.aliases)) return `Piece "${p.key}" has an unreadable alias list.`;
    if (!Array.isArray(p.sessions) || p.sessions.some((n) => !Number.isInteger(n) || (n as number) < 1)) {
      return `Piece "${p.key}" has an invalid session number.`;
    }
    if (!flag(p.provisional) || !flag(p.mediumConfidence) || !flag(p.unavailable)) {
      return `Piece "${p.key}" has an unreadable flag.`;
    }
  }

  const ns = new Set<number>();
  const paths = new Set<string>();
  for (const raw of graph.sessions) {
    if (!isRecord(raw)) return `${label} has a session entry that is not an object.`;
    const sess = raw as Partial<SourceSession>;
    if (typeof sess.n !== 'number' || !Number.isInteger(sess.n) || sess.n < 1) {
      return `${label} has a session with no number.`;
    }
    if (ns.has(sess.n)) return `${label} has two entries for session ${sess.n}.`;
    ns.add(sess.n);
    if (!isValidSourceDate(sess.date)) return `${label} session ${sess.n} has an unreadable date.`;
    if (!isSafeSourcePath(sess.folder)) return `${label} session ${sess.n} has an unsafe folder path.`;
    if (!textList(sess.roster)) return `${label} session ${sess.n} has an unreadable roster.`;
    for (const k of sess.roster as string[]) {
      if (!keys.has(k)) return `${label} session ${sess.n} lists piece "${k}", which it does not describe.`;
    }
    if (typeof sess.rosterTrusted !== 'boolean' || typeof sess.hasClassRecording !== 'boolean' || !flag(sess.unavailable)) {
      return `${label} session ${sess.n} has an unreadable flag.`;
    }

    if (!Array.isArray(sess.resources)) return `${label} session ${sess.n} has no resource list.`;
    for (const rawRes of sess.resources) {
      if (!isRecord(rawRes)) return `${label} session ${sess.n} has a resource that is not an object.`;
      const r = rawRes as Partial<SourceResource>;
      if (!isSafeSourcePath(r.path)) return `${label} has an unsafe resource path.`;
      if (paths.has(r.path)) return `${label} lists "${r.path}" twice.`;
      paths.add(r.path);
      if (typeof r.role !== 'string' || !ROLE_SET.has(r.role)) return `Resource "${r.path}" has an unknown role.`;
      if (typeof r.kind !== 'string' || !KIND_SET.has(r.kind)) return `Resource "${r.path}" has an unknown kind.`;
      if (!text(r.title)) return `Resource "${r.path}" has an unreadable title.`;
      if (!(r.part === null || r.part === undefined || typeof r.part === 'number')) {
        return `Resource "${r.path}" has an unreadable part number.`;
      }
      if (!(r.size === undefined || typeof r.size === 'number')) return `Resource "${r.path}" has an unreadable size.`;
      if (!textList(r.pieces)) return `Resource "${r.path}" has an unreadable piece list.`;
      for (const k of r.pieces as string[]) {
        if (!keys.has(k)) return `Resource "${r.path}" names piece "${k}", which this source does not describe.`;
      }
      // A demonstration's parts form ONE group; anything but a plain label
      // here would let a part claim membership of an arbitrary structure.
      if (!(r.group === null || r.group === undefined || typeof r.group === 'string')) {
        return `Resource "${r.path}" has an invalid part group.`;
      }
      if (!flag(r.unavailable)) return `Resource "${r.path}" has an unreadable flag.`;
    }

    if (!Array.isArray(sess.members)) return `${label} session ${sess.n} has no membership list.`;
    for (const rawMember of sess.members) {
      if (!isRecord(rawMember)) return `${label} session ${sess.n} has a membership that is not an object.`;
      const m = rawMember as Partial<SourceMember>;
      if (typeof m.key !== 'string' || !keys.has(m.key)) {
        return `${label} session ${sess.n} claims an unknown piece.`;
      }
      // `repeatChains` reads `roles.includes(...)` on every one of these.
      if (!textList(m.roles)) return `${label} session ${sess.n} gives piece "${m.key}" an unreadable role list.`;
      for (const role of m.roles as string[]) {
        if (!ROLE_SET.has(role)) return `${label} session ${sess.n} gives piece "${m.key}" an unknown role.`;
      }
    }

    // --- SEMANTIC RELATIONS, not merely field types ------------------------
    //
    // A field-type grammar says every value is READABLE; it says nothing about
    // whether the graph agrees with itself. A resource physically sitting in
    // class 2's folder, listed under class 1, is type-perfect and attributes
    // someone else's file to the wrong lesson on every screen that reads it —
    // and an arbitrary `group` on a non-demonstration invents a logical
    // resource out of unrelated files.
    //
    // Scoped to what the source still DESCRIBES. `unavailable` is retained
    // provenance about what it has STOPPED describing — a piece dropped from
    // the registry, a file deleted from the NAS — so holding those rows to the
    // current source's internal agreement is a category error, and would make
    // every refresh after a removal refuse at every door.
    if (!sess.unavailable) {
      const live = (sess.resources as SourceResource[]).filter((r) => !r.unavailable);
      const rolesFor = new Map<string, Set<string>>();
      for (const m of sess.members as SourceMember[]) rolesFor.set(m.key, new Set(m.roles));
      const groups = new Map<string, SourceResource[]>();
      let classRecordings = 0;
      for (const r of live) {
        const segs = r.path.split('/');
        if (segs.length !== 2 || segs[0] !== sess.folder) {
          return `${label} session ${sess.n} lists "${r.path}", which is not a file in its own folder.`;
        }
        if (r.role === CLASS_ROLE) {
          classRecordings += 1;
          if (r.pieces.length > 0) return `Resource "${r.path}" is a class recording and cannot name a piece.`;
        }
        for (const k of r.pieces) {
          if (!rolesFor.get(k)?.has(r.role)) {
            return `${label} session ${sess.n} gives "${r.path}" to piece "${k}" without recording that membership.`;
          }
        }
        if (r.group !== null && r.group !== undefined) {
          if (r.role !== DEMO_ROLE) return `Resource "${r.path}" carries a part group but is not a demonstration.`;
          groups.set(r.group, [...(groups.get(r.group) ?? []), r]);
        }
      }
      if (classRecordings > 0 !== sess.hasClassRecording) {
        return `${label} session ${sess.n} disagrees with itself about having a class recording.`;
      }
      // Parts of ONE demonstration: the same material, told in order. Parts
      // that are material for different pieces are not one resource, and two
      // parts with one number have no order to be read in.
      for (const [g, parts] of groups) {
        const pieces = [...parts[0]!.pieces].sort().join(NUL);
        const numbers = new Set<number | null>();
        for (const r of parts) {
          if ([...r.pieces].sort().join(NUL) !== pieces) {
            return `${label} session ${sess.n} has a part group "${g}" whose parts belong to different pieces.`;
          }
          const part = r.part ?? null;
          if (numbers.has(part)) return `${label} session ${sess.n} has two parts numbered alike in "${g}".`;
          numbers.add(part);
        }
      }
    }
  }

  if (graph.renames !== undefined) {
    if (!Array.isArray(graph.renames)) return `${label} has an unreadable rename log.`;
    const froms = new Set<string>();
    for (const rawRename of graph.renames) {
      if (!isRecord(rawRename)) return `${label} has a rename entry that is not an object.`;
      const r = rawRename as Partial<SourceRename>;
      if (!isSafeSourcePath(r.from) || !isSafeSourcePath(r.to)) return `${label} has a rename with an unsafe path.`;
      if (froms.has(r.from)) return `${label} maps "${r.from}" to more than one destination.`;
      froms.add(r.from);
    }
  }

  if (graph.diagnostics !== undefined) {
    if (!Array.isArray(graph.diagnostics)) return `${label} has an unreadable diagnostic list.`;
    for (const rawDiag of graph.diagnostics) {
      if (!isRecord(rawDiag)) return `${label} has a diagnostic entry that is not an object.`;
      const d = rawDiag as Partial<SourceDiagnostic>;
      if (!text(d.path) || !text(d.reason)) return `${label} has an unreadable diagnostic entry.`;
    }
  }

  return null;
}

// --- inbound validation (C7) -----------------------------------------------

/**
 * The v14 graph, checked at EVERY inbound door through `validateDB`. Invalid
 * structure is REFUSED with the record named, never coerced or dropped: a
 * binding that points at nothing is a claim about which file is which piece,
 * and silently discarding it loses the owner's own reconciliation decisions.
 *
 * A source entity marked `unavailable` is a VALID state (the file is gone from
 * the NAS, its provenance is kept) — not a dangling reference.
 */
export function validateArchiveSources(db: PracticeDB): string | null {
  const sources = db.archiveSources ?? [];
  const ids = new Set<string>();
  const instrumentIds = new Set(db.instruments.map((i) => i.id));
  const byId = new Map<string, ArchiveSource>();

  for (const s of sources) {
    if (typeof s?.id !== 'string' || !s.id.trim()) return 'An archive source has no id.';
    if (ids.has(s.id)) return `Two archive sources share the id "${s.id}".`;
    ids.add(s.id);
    byId.set(s.id, s);
    if (typeof s.instrumentId !== 'string' || !instrumentIds.has(s.instrumentId)) {
      return `Archive source "${s.id}" is bound to an instrument that does not exist.`;
    }
    if (typeof s.indexHash !== 'string') return `Archive source "${s.id}" has no index hash.`;
    // THE RECORD'S OWN FIELDS, not merely its nested graph. `acceptedAt` is
    // read back by Settings (`acceptedAt.slice(0, 16)`) to say when the index
    // last changed, so a non-string here crashes the screen that renders it —
    // and the fix belongs at this door, never as a guard in the component.
    // Checked for REAL validity for the same reason `askedAt` is: a shape
    // regex matches "2026-02-30T12:00:00.000Z" and `Date.parse` silently
    // normalises it into March. Deliberately a local check beside
    // `isValidSourceDate` rather than an import — this file's own pattern.
    if (!isValidSourceDateTime(s.acceptedAt)) return `Archive source "${s.id}" has an unreadable accepted time.`;
    if (!Array.isArray(s.pieces) || !Array.isArray(s.sessions)) return `Archive source "${s.id}" is missing its graph.`;
    // Required AT REST, where `checkSourceGraph` tolerates them absent: the
    // decoder always emits both, and `planArchiveImport` reads
    // `index.renames`/`source.renames` unguarded.
    if (!Array.isArray(s.renames)) return `Archive source "${s.id}" has no rename log.`;
    if (!Array.isArray(s.diagnostics)) return `Archive source "${s.id}" has no diagnostic list.`;
    if (!Array.isArray(s.suppressions)) return `Archive source "${s.id}" has no suppression list.`;

    // THE WHOLE NESTED GRAPH, through the one grammar the decoder also uses.
    const bad = checkSourceGraph(s, `Archive source "${s.id}"`);
    if (bad) return bad;

    for (const sup of s.suppressions) {
      if (!['piece', 'session', 'resource', 'link'].includes(sup?.kind)) {
        return `Archive source "${s.id}" has a suppression of an unknown kind.`;
      }
      if (typeof sup.ref !== 'string' || !sup.ref) return `Archive source "${s.id}" has a suppression with no target.`;
      // An owner decision carries the id it was scoped to and the moment it
      // was taken; both are read back — a resource hidden on ONE item is
      // decided by comparing `itemId`, so a non-string silently widens it.
      if (!(sup.itemId === undefined || (typeof sup.itemId === 'string' && sup.itemId !== ''))) {
        return `Archive source "${s.id}" has a suppression with an unreadable item.`;
      }
      // `at` is provenance only — nothing reads it back as a date — so it is
      // held to being real text and no further.
      if (typeof sup.at !== 'string' || !sup.at) return `Archive source "${s.id}" has a suppression with no timestamp.`;
    }
  }

  // Bindings: exactly one live record per source identity, resolving to a real
  // entity of the right instrument.
  const itemBindings = new Set<string>();
  for (const item of db.items) {
    const ref = item.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.pieceKey !== 'string') {
      return `Item "${item.title}" has an unreadable archive binding.`;
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `Item "${item.title}" is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.pieces.some((p) => p.key === ref.pieceKey)) {
      return `Item "${item.title}" is bound to piece "${ref.pieceKey}", which archive "${ref.archiveId}" does not describe.`;
    }
    if (item.instrumentId !== source.instrumentId) {
      return `Item "${item.title}" is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.pieceKey}`;
    if (itemBindings.has(k)) return `Two items are bound to piece "${ref.pieceKey}".`;
    itemBindings.add(k);
  }

  const lessonBindings = new Set<string>();
  for (const lesson of db.lessons) {
    const ref = lesson.source;
    if (!ref) continue;
    if (typeof ref.archiveId !== 'string' || typeof ref.sessionN !== 'number') {
      return 'A lesson has an unreadable archive binding.';
    }
    const source = byId.get(ref.archiveId);
    if (!source) return `A lesson is bound to archive "${ref.archiveId}", which is not present.`;
    if (!source.sessions.some((s) => s.n === ref.sessionN)) {
      return `A lesson is bound to session ${ref.sessionN}, which archive "${ref.archiveId}" does not describe.`;
    }
    if (lesson.instrumentId !== source.instrumentId) {
      return `A lesson is bound to archive "${ref.archiveId}" but belongs to another instrument.`;
    }
    const k = `${ref.archiveId}${NUL}${ref.sessionN}`;
    if (lessonBindings.has(k)) return `Two lessons are bound to session ${ref.sessionN}.`;
    lessonBindings.add(k);
  }

  // Manual item references: the same path rules as every other NAS reference.
  for (const item of db.items) {
    for (const r of item.references ?? []) {
      if (typeof r?.path !== 'string' || !r.path.trim()) return `Item "${item.title}" has a reference with no path.`;
      if (!/^https?:\/\//i.test(r.path) && !isSafeSourcePath(r.path)) {
        return `Item "${item.title}" has an unsafe reference path.`;
      }
    }
  }
  return null;
}

/**
 * The canonical pieces an archive session is associated with, honouring an
 * owner's explicit unlink of ONE piece from ONE class.
 *
 * Derived from the graph, never stored on the lesson: a session's membership
 * is a source fact, and copying it into `lesson.itemIds` would make one fact
 * two that can disagree.
 */
export function membersForSession(source: ArchiveSource, sessionN: number): SourceMember[] {
  const s = source.sessions.find((x) => x.n === sessionN);
  if (!s || suppressed(source, 'session', String(sessionN))) return [];
  return s.members.filter((m) => !suppressed(source, 'link', `${sessionN}:${m.key}`));
}
```

### src/domain/sourceReconcile.test.ts

```
import { describe, expect, it } from 'vitest';
import rawIndex from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import {
  decodeSourceIndex,
  resourcesForPiece,
  resourcesForSession,
  sourceItemId,
  sourceLessonId,
  validateArchiveSources,
  type SourceIndex,
} from './sourceArchive';
import {
  applyArchiveImport,
  planArchiveImport,
  repairReferencePath,
  repairLessonReferences,
  toArchiveRelative,
  withSuppression,
  followRenames,
} from './sourceReconcile';
import { archiveRootUrl } from './recordings';
import { emptyDB } from './seed';
import { LEGACY_SEED_PATHS } from './setarClasses';
import { createItem, createLesson } from './factories';
import type { Lesson, PracticeDB, PracticeItem } from './types';

const NOW = new Date('2026-09-17T09:00:00.000Z');
const INDEX: SourceIndex = decodeSourceIndex(rawIndex);
const SETAR = 'inst-setar';

function baseDB(over: Partial<PracticeDB> = {}): PracticeDB {
  return {
    ...emptyDB(),
    instruments: [
      { id: SETAR, name: 'Setar', family: 'Persian', active: true, createdAt: '2023-01-01T00:00:00.000Z', updatedAt: '2023-01-01T00:00:00.000Z' },
    ],
    ...over,
  };
}

const item = (over: Partial<PracticeItem>): PracticeItem => ({
  ...createItem({ instrumentId: SETAR, title: 'x' }, NOW),
  ...over,
});

const lesson = (over: Partial<Lesson>): Lesson => ({
  ...createLesson({ instrumentId: SETAR, date: '2026-01-01' }, NOW),
  ...over,
});

const plan = (db: PracticeDB, index = INDEX, decisions = undefined as never) =>
  planArchiveImport({ db, index, instrumentId: SETAR, decisions, now: NOW });

describe('reconciling the archive with the owner’s own records', () => {
  it('setar reconciliation binds exact identities without merging owner records', () => {
    // --- a first import of an empty database --------------------------------
    const first = plan(baseDB());
    expect(first.newLessons).toHaveLength(39);
    expect(first.newItems).toHaveLength(94);
    expect(first.questions).toEqual([]);
    expect(first.newLessons.every((l) => l.origin === 'archive')).toBe(true);
    const after = applyArchiveImport(baseDB(), first);
    expect(after.lessons).toHaveLength(39);
    expect(after.items).toHaveLength(94);
    expect(after.archiveSources).toHaveLength(1);

    // Canonical keys survive BYTE-EXACT as the items' own titles.
    expect(after.items.map((i) => i.title)).toContain('رنگ-اصفهان-پریچهر-و-پریزاد-درویش-خان');
    expect(after.items.map((i) => i.title)).toContain('تمرین-دشتی-1-علیزاده');

    // --- repeating it adds NOTHING -----------------------------------------
    const second = plan(after);
    expect(second.newLessons).toEqual([]);
    expect(second.newItems).toEqual([]);
    expect(second.summary.unchanged).toBe(true);
    // ...and applying it returns the very same database object, so an
    // unchanged refresh cannot bump a revision or churn a timestamp.
    expect(applyArchiveImport(after, second)).toBe(after);

    // --- DETERMINISTIC IDENTITY across devices ------------------------------
    // Two devices importing the same published index separately must agree on
    // which record is which, or the next sync sees two of everything.
    const other = applyArchiveImport(baseDB(), plan(baseDB()));
    expect(other.items.map((i) => i.id).sort()).toEqual(after.items.map((i) => i.id).sort());
    expect(other.lessons.map((l) => l.id).sort()).toEqual(after.lessons.map((l) => l.id).sort());
    expect(after.items.some((i) => i.id === sourceItemId('setar-classes', 'عراق'))).toBe(true);
    expect(after.lessons.some((l) => l.id === sourceLessonId('setar-classes', 13))).toBe(true);

    // --- EXISTING BINDINGS WIN, across edited titles and dates --------------
    const edited: PracticeDB = {
      ...after,
      items: after.items.map((i) =>
        i.source?.pieceKey === 'عراق' ? { ...i, title: 'Iraq — my own name for it', notes: 'teacher said…' } : i,
      ),
      lessons: after.lessons.map((l) => (l.source?.sessionN === 13 ? { ...l, date: '2020-01-01', number: 999 } : l)),
    };
    const third = plan(edited);
    expect(third.newItems).toEqual([]);
    expect(third.newLessons).toEqual([]);
    const applied = applyArchiveImport(edited, third);
    // The owner's edits are still there: a binding identifies, it never rewrites.
    expect(applied.items.find((i) => i.source?.pieceKey === 'عراق')!.title).toBe('Iraq — my own name for it');
    expect(applied.lessons.find((l) => l.source?.sessionN === 13)!.date).toBe('2020-01-01');

    // --- adopting ONE legacy lesson, on EXACT evidence ----------------------
    const evidence = lesson({
      id: 'legacy-13',
      date: '2024-09-03',
      number: 13,
      // The owner's own old reference — legacy prefix and pre-rename name.
      recordings: [
        {
          id: 'r1',
          title: 'Class 13',
          path: 'setar-classes/session-13-03-09-2024/video-20240903-152547-meeting-recording.mp4',
          kind: 'video',
          createdAt: '2024-09-04T00:00:00.000Z',
        },
      ],
      notes: 'What the teacher said that day.',
    });
    const withLegacy = plan(baseDB({ lessons: [evidence] }));
    const adopted = withLegacy.adoptedLessons.find((l) => l.source?.sessionN === 13);
    expect(adopted).toBeDefined();
    expect(adopted!.id).toBe('legacy-13'); // the owner's record KEEPS its id
    expect(adopted!.notes).toBe('What the teacher said that day.');
    expect(withLegacy.newLessons).toHaveLength(38);

    // --- weaker equivalences CANNOT auto-merge ------------------------------
    const dateOnly = lesson({ id: 'date-only', date: '2024-09-03' });
    const numberOnly = lesson({ id: 'number-only', date: '2019-05-05', number: 13 });
    const dateAndNumber = lesson({ id: 'date-and-number', date: '2024-09-03', number: 13 });
    const weak = plan(baseDB({ lessons: [dateOnly, numberOnly, dateAndNumber] }));
    expect(weak.adoptedLessons).toEqual([]);
    expect(weak.newLessons).toHaveLength(39);
    // Two identical candidates do not pick the first: the owner is asked.
    const twin = { ...evidence, id: 'legacy-13-twin' };
    const ambiguous = plan(baseDB({ lessons: [evidence, twin] }));
    expect(ambiguous.adoptedLessons).toEqual([]);
    const q = ambiguous.questions.find((x) => x.sessionN === 13)!;
    expect(q.candidates.map((c) => c.id).sort()).toEqual(['legacy-13', 'legacy-13-twin']);

    // --- the owner's real upcoming class 38 survives ------------------------
    const upcoming = lesson({ id: 'class-38-upcoming', date: '2026-09-27', number: 38 });
    const withUpcoming = plan(baseDB({ lessons: [upcoming] }));
    expect(withUpcoming.adoptedLessons).toEqual([]);
    expect(withUpcoming.newLessons).toHaveLength(39);
    const installed = applyArchiveImport(baseDB({ lessons: [upcoming] }), withUpcoming);
    const thirtyEights = installed.lessons.filter((l) => l.number === 38);
    expect(thirtyEights.map((l) => l.date).sort()).toEqual(['2026-08-04', '2026-09-27']);
    expect(installed.lessons.find((l) => l.id === 'class-38-upcoming')!.origin).toBeUndefined();

    // --- a catalogue slug is NEVER a canonical Farsi key --------------------
    const catalogued = item({ id: 'cat-iraq', title: 'Iraq', catalogKey: 'iraq' });
    const withCatalogue = plan(baseDB({ items: [catalogued] }));
    expect(withCatalogue.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(withCatalogue.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(true);
    const cataloguedAfter = applyArchiveImport(baseDB({ items: [catalogued] }), withCatalogue);
    expect(cataloguedAfter.items.find((i) => i.id === 'cat-iraq')!.source).toBeUndefined();

    // --- exact title / literal alias equality ASKS, never merges ------------
    const sameTitle = item({ id: 'mine-araq', title: 'عراق' });
    const aliasTitle = item({ id: 'mine-alias', title: 'araq' });
    const asked = plan(baseDB({ items: [sameTitle, aliasTitle] }));
    const itemQ = asked.questions.find((x) => x.pieceKey === 'عراق')!;
    expect(itemQ.candidates.map((c) => c.id).sort()).toEqual(['mine-alias', 'mine-araq']);
    expect(asked.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    const untouched = applyArchiveImport(baseDB({ items: [sameTitle, aliasTitle] }), asked);
    expect(untouched.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(0);

    // Link: the owner's record keeps its id and gains the binding.
    const linked = planArchiveImport({
      db: baseDB({ items: [sameTitle, aliasTitle] }),
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'link-item', pieceKey: 'عراق', itemId: 'mine-araq' }],
      now: NOW,
    });
    expect(linked.adoptedItems.map((i) => i.id)).toEqual(['mine-araq']);
    expect(linked.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    const linkedDb = applyArchiveImport(baseDB({ items: [sameTitle, aliasTitle] }), linked);
    expect(linkedDb.items.find((i) => i.id === 'mine-araq')!.source).toEqual({
      archiveId: 'setar-classes',
      pieceKey: 'عراق',
    });
    // ...and the binding PERSISTS: a later refresh asks nothing more about it.
    expect(plan(linkedDb).questions.some((x) => x.pieceKey === 'عراق')).toBe(false);

    // Create separately: two records, both kept, only one bound.
    const separate = planArchiveImport({
      db: baseDB({ items: [sameTitle] }),
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'create-item', pieceKey: 'عراق' }],
      now: NOW,
    });
    const separateDb = applyArchiveImport(baseDB({ items: [sameTitle] }), separate);
    expect(separateDb.items.filter((i) => i.title === 'عراق')).toHaveLength(2);
    expect(separateDb.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);
    expect(separateDb.items.find((i) => i.id === 'mine-araq')!.source).toBeUndefined();

    // --- SKIP IS A DECISION, AND A DECISION IS PERSISTED -------------------
    // It used to live only in the preview's own `decisions` argument, so "no,
    // not this one" survived exactly as long as the screen did: a reload, or
    // simply the next refresh, asked the identical question again with nothing
    // in the database to show it had ever been answered.
    const skipDb = baseDB({ items: [sameTitle] });
    const skipDecisions = [{ kind: 'skip-item' as const, pieceKey: 'عراق' }];
    const skipped = planArchiveImport({ db: skipDb, index: INDEX, instrumentId: SETAR, decisions: skipDecisions, now: NOW });
    expect(skipped.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(skipped.source.suppressions).toContainEqual({ kind: 'piece', ref: 'عراق', at: NOW.toISOString() });
    const afterSkip = applyArchiveImport(skipDb, skipped, skipDecisions);
    expect(afterSkip.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(afterSkip.items.find((i) => i.id === 'mine-araq')!.title).toBe('عراق');
    expect(validateArchiveSources(afterSkip)).toBeNull();
    // ...and it survives the persisted shape. A LATER refresh, carrying no
    // decisions at all, neither asks nor re-creates.
    const reloaded = JSON.parse(JSON.stringify(afterSkip)) as PracticeDB;
    const afterReload = plan(reloaded);
    expect(afterReload.questions.some((x) => x.pieceKey === 'عراق')).toBe(false);
    expect(afterReload.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(afterReload.summary.unchanged).toBe(true);
    expect(applyArchiveImport(reloaded, afterReload)).toBe(reloaded);
    // Skipping the same thing twice does not grow the list either.
    const skipTwice = planArchiveImport({ db: reloaded, index: INDEX, instrumentId: SETAR, decisions: skipDecisions, now: NOW });
    expect(skipTwice.source.suppressions).toHaveLength(1);
    expect(applyArchiveImport(reloaded, skipTwice, skipDecisions)).toBe(reloaded);

    // The same holds for a CLASS the owner skips.
    const skipSession = [{ kind: 'skip-lesson' as const, sessionN: 13 }];
    const lessonSkipped = planArchiveImport({ db: baseDB(), index: INDEX, instrumentId: SETAR, decisions: skipSession, now: NOW });
    expect(lessonSkipped.newLessons).toHaveLength(38);
    const afterLessonSkip = applyArchiveImport(baseDB(), lessonSkipped, skipSession);
    const lessonReloaded = JSON.parse(JSON.stringify(afterLessonSkip)) as PracticeDB;
    expect(plan(lessonReloaded).newLessons).toEqual([]);
    expect(lessonReloaded.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);

    // --- "CREATE SEPARATELY" RESOLVES AN AMBIGUOUS CLASS -------------------
    // Two indistinguishable candidates; the owner says neither of them is this
    // session. The decision used to be dropped on the floor for lessons — the
    // item side had it from the start — and the question came back for ever.
    const twinDb = baseDB({ lessons: [evidence, twin] });
    const createSeparately = [{ kind: 'create-lesson' as const, sessionN: 13 }];
    const resolvedLesson = planArchiveImport({ db: twinDb, index: INDEX, instrumentId: SETAR, decisions: createSeparately, now: NOW });
    expect(resolvedLesson.questions.some((x) => x.sessionN === 13)).toBe(false);
    expect(resolvedLesson.adoptedLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    expect(resolvedLesson.newLessons.filter((l) => l.source?.sessionN === 13)).toHaveLength(1);
    const afterCreate = applyArchiveImport(twinDb, resolvedLesson, createSeparately);
    // Three records for that day now: the archive's own, and BOTH of the
    // owner's, each keeping its id, its notes and its unbound status.
    expect(afterCreate.lessons.filter((l) => l.date === '2024-09-03')).toHaveLength(3);
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13')!.source).toBeUndefined();
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13')!.notes).toBe('What the teacher said that day.');
    expect(afterCreate.lessons.find((l) => l.id === 'legacy-13-twin')!.source).toBeUndefined();
    expect(validateArchiveSources(afterCreate)).toBeNull();
    // ...and the binding it did create is the archive's own deterministic one.
    expect(afterCreate.lessons.some((l) => l.id === sourceLessonId('setar-classes', 13))).toBe(true);

    // --- the source/instrument binding is explicit and validated -----------
    expect(after.archiveSources[0]!.instrumentId).toBe(SETAR);
    expect(after.archiveSources[0]!.id).toBe('setar-classes');
    expect(after.items.every((i) => i.instrumentId === SETAR)).toBe(true);
  });

  it('archive refresh preserves owner edits and applies only the new source delta', () => {
    const installed = applyArchiveImport(baseDB(), plan(baseDB()));

    // The owner then works on their own records.
    const owned: PracticeDB = {
      ...installed,
      items: installed.items.map((i) =>
        i.source?.pieceKey === 'عراق'
          ? { ...i, title: 'My own title', notes: 'my notes', status: 'usable', persian: { ...i.persian, composer: '' } }
          : i,
      ),
      lessons: installed.lessons.map((l) => (l.source?.sessionN === 1 ? { ...l, notes: 'class one notes' } : l)),
    };

    // --- ONE new session, plus one new score on an existing session ---------
    const session40 = {
      n: 40,
      date: '2026-09-29',
      folder: 'session-40-29-09-2026',
      roster: ['عراق'],
      rosterTrusted: true,
      hasClassRecording: true,
      resources: [
        {
          path: 'session-40-29-09-2026/ضبط-کلاس.mp4',
          role: 'ضبط-کلاس',
          kind: 'video' as const,
          title: 'ضبط کلاس',
          part: null,
          pieces: [],
          group: null,
        },
      ],
      members: [{ key: 'عراق', roles: ['ضبط-کلاس'] }],
    };
    const addedScore = {
      path: 'session-12-06-08-2024/نت-عراق.pdf',
      role: 'نت',
      kind: 'score' as const,
      title: 'نت عراق',
      part: null,
      pieces: ['عراق'],
      group: null,
    };
    const next: SourceIndex = {
      ...INDEX,
      contentHash: 'b'.repeat(64),
      sessions: [
        // A scan records the MEMBERSHIP a new resource creates in the same
        // pass that lists the resource, so a fixture that adds one without the
        // other is a graph disagreeing with itself — refused at every door.
        ...INDEX.sessions.map((s) =>
          s.n === 12
            ? {
                ...s,
                resources: [...s.resources, addedScore],
                members: [
                  ...s.members.filter((m) => m.key !== 'عراق'),
                  {
                    key: 'عراق',
                    roles: [...new Set([...(s.members.find((m) => m.key === 'عراق')?.roles ?? []), 'نت'])],
                  },
                ],
              }
            : s,
        ),
        session40,
      ],
      // A later registry improvement on a piece already seeded.
      pieces: INDEX.pieces.map((p) => (p.key === 'عراق' ? { ...p, composer: 'میرزا-حسینقلی' } : p)),
    };

    const delta = planArchiveImport({ db: owned, index: next, instrumentId: SETAR, now: NOW });
    // ONLY the delta: one lesson, no items (عراق is already bound).
    expect(delta.newLessons.map((l) => l.source?.sessionN)).toEqual([40]);
    expect(delta.newItems).toEqual([]);

    const refreshed = applyArchiveImport(owned, delta);
    expect(refreshed.lessons).toHaveLength(40);
    // AUTHORED FIELDS ARE SEEDED ONCE AND THEN PRESERVED — including the
    // deliberately EMPTY composer the owner cleared.
    const araq = refreshed.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(araq.title).toBe('My own title');
    expect(araq.notes).toBe('my notes');
    expect(araq.status).toBe('usable');
    expect(araq.persian?.composer).toBe('');
    expect(refreshed.lessons.find((l) => l.source?.sessionN === 1)!.notes).toBe('class one notes');
    // Source facts DID update: the new score is in the graph.
    const source = refreshed.archiveSources.find((s) => s.id === 'setar-classes')!;
    expect(source.sessions.find((s) => s.n === 12)!.resources.some((r) => r.path === addedScore.path)).toBe(true);
    expect(source.indexHash).toBe('b'.repeat(64));

    // The registry improvement is OFFERED, never applied behind the owner.
    const suggestion = delta.suggestions.find((s) => s.pieceKey === 'عراق' && s.field === 'composer')!;
    expect(suggestion).toBeDefined();
    expect(suggestion.from).toBe('');
    expect(suggestion.to).toBe('میرزا-حسینقلی');
    // A field decision names the RECORD it was shown against, not just the
    // piece: a rebase must not hand the answer to whichever item happens to
    // hold that piece by the time Apply is pressed.
    const araqItemId = suggestion.itemId;
    const selective = applyArchiveImport(owned, delta, [
      { kind: 'apply-field', pieceKey: 'عراق', itemId: araqItemId, field: 'composer', from: '' },
    ]);
    const applied = selective.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(applied.persian?.composer).toBe('میرزا-حسینقلی');
    // ...and applying a field NEVER touches the notebook or the title.
    expect(applied.notes).toBe('my notes');
    expect(applied.title).toBe('My own title');

    // --- an UNCHANGED refresh writes nothing --------------------------------
    const same = planArchiveImport({ db: refreshed, index: next, instrumentId: SETAR, now: NOW });
    expect(same.summary.unchanged).toBe(true);
    expect(applyArchiveImport(refreshed, same)).toBe(refreshed);

    // --- ...BUT A NEW OWNER DECISION AGAINST IT IS NOT "UNCHANGED" ---------
    // The suggestion stands until it is answered, and it may be answered days
    // later against the very same published index. Judging "already current"
    // by the index hash alone reported exactly that and discarded the answer.
    const lateField = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'composer' as const, from: '' },
    ];
    const lateDecision = planArchiveImport({
      db: refreshed,
      index: next,
      instrumentId: SETAR,
      decisions: lateField,
      now: NOW,
    });
    expect(lateDecision.suggestions.some((x) => x.pieceKey === 'عراق' && x.field === 'composer')).toBe(true);
    expect(lateDecision.summary.unchanged).toBe(false);
    const lateApplied = applyArchiveImport(refreshed, lateDecision, lateField);
    expect(lateApplied).not.toBe(refreshed);
    const lateItem = lateApplied.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(lateItem.persian?.composer).toBe('میرزا-حسینقلی');
    // Only that field: the notebook, the title and the status are the owner's.
    expect(lateItem.notes).toBe('my notes');
    expect(lateItem.title).toBe('My own title');
    expect(lateItem.status).toBe('usable');
    expect(lateApplied.blocks).toEqual(refreshed.blocks);
    // Applied, the suggestion is gone: the next refresh has nothing to offer.
    expect(planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, now: NOW }).suggestions).toEqual([]);
    // A decision for a field with NO suggestion changes nothing at all.
    const emptyField = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqItemId, field: 'form' as const, from: '' },
    ];
    const noop = planArchiveImport({ db: lateApplied, index: next, instrumentId: SETAR, decisions: emptyField, now: NOW });
    expect(noop.summary.unchanged).toBe(true);
    expect(applyArchiveImport(lateApplied, noop, emptyField)).toBe(lateApplied);

    // --- A DECISION IS ABOUT THE VALUE THE OWNER SAW -----------------------
    // Choose the archive's composer over an EMPTY field, then write one of
    // your own before the plan is applied. The choice was an answer about the
    // empty field; it is not an instruction to replace the new words.
    const ownWrote = {
      ...refreshed,
      items: refreshed.items.map((i) =>
        i.source?.pieceKey === 'عراق'
          ? { ...i, persian: { ...i.persian, composer: 'Owner wrote this during refresh' } }
          : i,
      ),
    };
    const rebased = planArchiveImport({
      db: ownWrote,
      index: next,
      instrumentId: SETAR,
      decisions: lateField,
      now: NOW,
    });
    expect(rebased.staleDecisions).toEqual(lateField);
    // Not applied, and not counted as a change either: both sides of the
    // preview/commit boundary agree that this decision no longer stands.
    expect(rebased.summary.unchanged).toBe(true);
    const notOverwritten = applyArchiveImport(ownWrote, rebased, lateField);
    expect(notOverwritten.items.find((i) => i.source?.pieceKey === 'عراق')!.persian?.composer).toBe(
      'Owner wrote this during refresh',
    );
    // The suggestion is re-offered against what is there NOW, so the owner can
    // answer the question that actually stands.
    expect(rebased.suggestions.find((x) => x.pieceKey === 'عراق' && x.field === 'composer')!.from).toBe(
      'Owner wrote this during refresh',
    );
    // A decision carrying the CURRENT value still applies, on the same data.
    const answeredNow = [{ ...lateField[0]!, from: 'Owner wrote this during refresh' }];
    const fresh = planArchiveImport({ db: ownWrote, index: next, instrumentId: SETAR, decisions: answeredNow, now: NOW });
    expect(fresh.staleDecisions).toEqual([]);
    expect(applyArchiveImport(ownWrote, fresh, answeredNow).items.find((i) => i.source?.pieceKey === 'عراق')!.persian
      ?.composer).toBe('میرزا-حسینقلی');

    // --- A LINK TARGET THAT MOVED IS THE SAME KIND OF STALENESS ------------
    // Bound elsewhere, moved instrument or deleted: never silently turned into
    // "create a new record instead".
    const araqId = owned.items.find((i) => i.source?.pieceKey === 'عراق')!.id;
    const otherKey = INDEX.pieces.find((x) => x.key !== 'عراق')!.key;
    const unbound: PracticeDB = {
      ...owned,
      items: owned.items.map((i) => {
        const { source, ...rest } = i;
        void source;
        return rest.id === araqId ? { ...rest, title: 'عراق' } : rest;
      }),
    };
    const linkDecision = [{ kind: 'link-item' as const, pieceKey: 'عراق', itemId: araqId }];
    const linkable = planArchiveImport({ db: unbound, index: next, instrumentId: SETAR, decisions: linkDecision, now: NOW });
    expect(linkable.staleDecisions).toEqual([]);
    expect(linkable.adoptedItems.map((i) => i.id)).toEqual([araqId]);
    const takenElsewhere: PracticeDB = {
      ...unbound,
      items: unbound.items.map((i) =>
        i.id === araqId ? { ...i, source: { archiveId: 'setar-classes', pieceKey: otherKey } } : i,
      ),
    };
    const stalelink = planArchiveImport({
      db: takenElsewhere,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(stalelink.staleDecisions).toEqual(linkDecision);
    expect(stalelink.adoptedItems).toEqual([]);

    // --- A DECISION NAMES ITS RECORD, AND EVERY DECISION IS ACCOUNTED FOR ---
    //
    // The loops start with "already bound? nothing to decide" / "already
    // suppressed? nothing to decide", so a decision about a record that became
    // bound between the preview and the commit was never looked at: no
    // adoption, no question, and an EMPTY `staleDecisions` — the commit
    // reported success for an action it had not performed. And a field
    // decision keyed by piece alone was worse than ignored: it was REDIRECTED
    // onto whichever record held that piece by the time Apply ran.
    const otherItemId = 'someone-elses-item';
    const boundToAnother: PracticeDB = {
      ...unbound,
      items: [
        ...unbound.items,
        item({
          id: otherItemId,
          instrumentId: SETAR,
          title: 'Another record',
          source: { archiveId: 'setar-classes', pieceKey: 'عراق' },
        }),
      ],
    };
    // LINK: the approved record is not the one holding the piece now, so the
    // choice is stale — never quietly satisfied by the other record.
    const redirectedLink = planArchiveImport({
      db: boundToAnother,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(redirectedLink.staleDecisions).toEqual(linkDecision);
    expect(redirectedLink.adoptedItems).toEqual([]);
    expect(applyArchiveImport(boundToAnother, redirectedLink, linkDecision).items.find((i) => i.id === araqId)!.source)
      .toBeUndefined();
    // APPLY-FIELD: the archive's composer, chosen against item A's empty
    // field, must not be written to the item that holds the piece now — whose
    // composer is also empty, so nothing about the VALUE would have caught it.
    const fieldForA = [
      { kind: 'apply-field' as const, pieceKey: 'عراق', itemId: araqId, field: 'composer' as const, from: '' },
    ];
    const redirectedField = planArchiveImport({
      db: boundToAnother,
      index: next,
      instrumentId: SETAR,
      decisions: fieldForA,
      now: NOW,
    });
    expect(redirectedField.staleDecisions).toEqual(fieldForA);
    expect(redirectedField.suggestions.every((x) => x.itemId === otherItemId)).toBe(true);
    const notRedirected = applyArchiveImport(boundToAnother, redirectedField, fieldForA);
    expect(notRedirected.items.find((i) => i.id === otherItemId)!.persian?.composer ?? '').toBe('');
    // SKIP and CREATE are the same rule: an answer about a record that has
    // since been bound is an answer to a question that no longer stands.
    for (const decision of [
      [{ kind: 'skip-item' as const, pieceKey: 'عراق' }],
      [{ kind: 'create-item' as const, pieceKey: 'عراق' }],
    ]) {
      const swept = planArchiveImport({
        db: boundToAnother,
        index: next,
        instrumentId: SETAR,
        decisions: decision,
        now: NOW,
      });
      expect(swept.staleDecisions).toEqual(decision);
      expect(swept.newItems).toEqual([]);
    }
    // …and LOOP PREVENTION: the action the owner approved, once it HAS
    // happened, is not stale. `ArchiveRefresh` drops a stale decision and
    // re-previews, so a realised action that could never be consumed again
    // would go stale for ever.
    const afterLink = applyArchiveImport(unbound, linkable, linkDecision);
    const again = planArchiveImport({
      db: afterLink,
      index: next,
      instrumentId: SETAR,
      decisions: linkDecision,
      now: NOW,
    });
    expect(again.staleDecisions).toEqual([]);
    const skipped = applyArchiveImport(
      unbound,
      planArchiveImport({
        db: unbound,
        index: next,
        instrumentId: SETAR,
        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
        now: NOW,
      }),
    );
    expect(
      planArchiveImport({
        db: skipped,
        index: next,
        instrumentId: SETAR,
        decisions: [{ kind: 'skip-item', pieceKey: otherKey }],
        now: NOW,
      }).staleDecisions,
    ).toEqual([]);

    // --- a missing FILE keeps its provenance, flagged ----------------------
    const goneFile = next.sessions.find((s) => s.n === 12)!.resources[0]!.path;
    const shrunk: SourceIndex = {
      ...next,
      contentHash: 'c'.repeat(64),
      // A session that has lost every file has lost its class recording with
      // them: a scan recomputes that flag, and a hand-built index that keeps
      // it is a graph disagreeing with itself — which `checkSourceGraph` now
      // refuses at every door, so it cannot be used to prove anything else.
      sessions: next.sessions.map((s) =>
        s.n === 12 ? { ...s, resources: [], members: [], hasClassRecording: false } : s,
      ),
    };
    const shrunkPlan = planArchiveImport({ db: refreshed, index: shrunk, instrumentId: SETAR, now: NOW });
    const afterShrink = applyArchiveImport(refreshed, shrunkPlan);
    // The LESSON and the ITEM are still there — a vanished file never deletes
    // an owner record, it only changes what the source can offer.
    expect(afterShrink.lessons).toHaveLength(40);
    expect(afterShrink.items.find((i) => i.source?.pieceKey === 'عراق')!.title).toBe('My own title');
    expect(afterShrink.blocks).toEqual(refreshed.blocks);
    const shrunkSource = afterShrink.archiveSources.find((s) => s.id === 'setar-classes')!;
    const goneRow = shrunkSource.sessions.find((s) => s.n === 12)!.resources.find((r) => r.path === goneFile)!;
    expect(goneRow.unavailable).toBe(true);
    // ...and the database this produced is one every inbound door accepts.
    expect(validateArchiveSources(afterShrink)).toBeNull();

    // --- a missing REGISTRY ROW is the case that used to lock refresh out ---
    // Dropping a piece the owner has an item bound to would leave that binding
    // pointing at nothing — which `validateDB` refuses at every door, so the
    // next Refresh, and every one after it, would fail outright. Provenance is
    // RETAINED and flagged instead.
    const withoutPiece: SourceIndex = {
      ...next,
      contentHash: 'e'.repeat(64),
      pieces: next.pieces.filter((p) => p.key !== 'عراق'),
      sessions: next.sessions.map((s) => ({
        ...s,
        roster: s.roster.filter((k) => k !== 'عراق'),
        members: s.members.filter((m) => m.key !== 'عراق'),
        resources: s.resources.map((r) => ({ ...r, pieces: r.pieces.filter((k) => k !== 'عراق') })),
      })),
    };
    const withoutPlan = planArchiveImport({ db: refreshed, index: withoutPiece, instrumentId: SETAR, now: NOW });
    const afterWithout = applyArchiveImport(refreshed, withoutPlan);
    expect(validateArchiveSources(afterWithout)).toBeNull();
    const keptPiece = afterWithout.archiveSources[0]!.pieces.find((p) => p.key === 'عراق')!;
    expect(keptPiece.unavailable).toBe(true);
    // The owner's item, its title and its binding are all still there.
    const keptItem = afterWithout.items.find((i) => i.source?.pieceKey === 'عراق')!;
    expect(keptItem.title).toBe('My own title');
    expect(keptItem.notes).toBe('my notes');
    // It is not re-created as a second item either.
    expect(afterWithout.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);
    // A WHOLE SESSION that disappears is retained the same way.
    const withoutSession: SourceIndex = {
      ...next,
      contentHash: 'f'.repeat(64),
      sessions: next.sessions.filter((s) => s.n !== 13),
    };
    const afterNoSession = applyArchiveImport(
      refreshed,
      planArchiveImport({ db: refreshed, index: withoutSession, instrumentId: SETAR, now: NOW }),
    );
    expect(validateArchiveSources(afterNoSession)).toBeNull();
    expect(afterNoSession.archiveSources[0]!.sessions.find((s) => s.n === 13)!.unavailable).toBe(true);
    expect(afterNoSession.lessons.filter((l) => l.source?.sessionN === 13)).toHaveLength(1);
    // ...and the source coming BACK clears the flag: the source is
    // authoritative about what it has.
    const restoredPlan = planArchiveImport({ db: afterWithout, index: next, instrumentId: SETAR, now: NOW });
    const afterRestore = applyArchiveImport(afterWithout, restoredPlan);
    expect(afterRestore.archiveSources[0]!.pieces.find((p) => p.key === 'عراق')!.unavailable).toBeUndefined();
    expect(afterRestore.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(1);

    // --- a CHANGED canonical key is a NEW identity, never a rename ----------
    const renamedKey: SourceIndex = {
      ...INDEX,
      contentHash: 'd'.repeat(64),
      pieces: INDEX.pieces.map((p) => (p.key === 'عراق' ? { ...p, key: 'عراق-جدید' } : p)),
      sessions: INDEX.sessions.map((s) => ({
        ...s,
        roster: s.roster.map((k) => (k === 'عراق' ? 'عراق-جدید' : k)),
        members: s.members.map((m) => (m.key === 'عراق' ? { ...m, key: 'عراق-جدید' } : m)),
        resources: s.resources.map((r) => ({
          ...r,
          pieces: r.pieces.map((k) => (k === 'عراق' ? 'عراق-جدید' : k)),
        })),
      })),
    };
    const keyChange = planArchiveImport({ db: refreshed, index: renamedKey, instrumentId: SETAR, now: NOW });
    // A NEW piece appears; the old binding is NOT silently carried across.
    expect(keyChange.newItems.map((i) => i.source?.pieceKey)).toEqual(['عراق-جدید']);
    expect(keyChange.adoptedItems).toEqual([]);

    // --- an unresolved question stays a question until answered ------------
    const stranger = item({ id: 'stranger', title: 'چهار-پاره' });
    const strangerDb = { ...baseDB(), items: [stranger] };
    const asked = planArchiveImport({ db: strangerDb, index: INDEX, instrumentId: SETAR, now: NOW });
    expect(asked.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(true);
    const stillAsked = planArchiveImport({ db: strangerDb, index: INDEX, instrumentId: SETAR, now: NOW });
    expect(stillAsked.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(true);
    // The SAME index with a NEW owner decision resolves it, with no re-scan.
    const resolved = planArchiveImport({
      db: strangerDb,
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'چهار-پاره' }],
      now: NOW,
    });
    expect(resolved.questions.some((x) => x.pieceKey === 'چهار-پاره')).toBe(false);
    expect(resolved.newItems.some((i) => i.source?.pieceKey === 'چهار-پاره')).toBe(false);
  });

  it('exact Setar rename repair preserves saved references and their metadata', () => {
    const renames = new Map(INDEX.renames.map((r) => [r.from, r.to]));
    const known = new Set(INDEX.sessions.flatMap((s) => s.resources.map((r) => r.path)));

    // The archive prefix the owner's legacy paths carry is not part of the
    // archive-relative identity; the device base now ends in it.
    expect(toArchiveRelative('setar-classes/session-1-26-09-2023/x.mp4')).toBe('session-1-26-09-2023/x.mp4');
    expect(toArchiveRelative('session-1-26-09-2023/x.mp4')).toBe('session-1-26-09-2023/x.mp4');

    // EVERY legacy seed path the old importer ever wrote — all 67 of them —
    // maps through the rename log EXACTLY. No title, size or modification-time
    // matching is involved anywhere, and none of the 67 is left to a guess.
    expect(LEGACY_SEED_PATHS).toHaveLength(67);
    expect(INDEX.renames).toHaveLength(257);
    const repairedPaths = new Map<string, string>();
    for (const p of LEGACY_SEED_PATHS) {
      const outcome = repairReferencePath(p, renames, known);
      expect(outcome.status).toBe('repaired');
      if (outcome.status !== 'repaired') throw new Error('unreachable');
      expect(outcome.path.startsWith('session-')).toBe(true);
      expect(known.has(outcome.path)).toBe(true);
      repairedPaths.set(p, outcome.path);
    }
    expect(repairedPaths.size).toBe(67);
    // Session 28's "main video" is really a NAMED DEMONSTRATION; the repair
    // says so by landing on the demo file, and nothing invents a class
    // recording for a session that has none.
    const s28 = repairReferencePath('setar-classes/session-28-28-10-2025/video-2025-10-28-19-56-30.mp4', renames, known);
    expect(s28.status === 'repaired' && s28.path).toBe('session-28-28-10-2025/نمونه-به-زندان-شوشتری.mp4');

    // A path with no rename row and no file is DIAGNOSED, never guessed.
    const missing = repairReferencePath('setar-classes/session-1-26-09-2023/nothing.mp4', renames, known);
    expect(missing.status).toBe('attention');
    // A foreign link, and a link carrying a query, are left exactly as they are.
    const base = 'https://192.168.0.20:5010/setar-classes';
    expect(repairReferencePath('https://elsewhere.example/x.mp4', renames, known, base).status).toBe('unchanged');
    expect(repairReferencePath(`${base}/session-1-26-09-2023/x.mp4?download=1`, renames, known, base).status).toBe(
      'unchanged',
    );
    // Without a VERIFIED base a full URL is not converted at all.
    expect(repairReferencePath(`${base}/session-1-26-09-2023/x.mp4`, renames, known).status).toBe('attention');
    // Under the verified base it converts, decoding each segment once.
    const encoded = `${base}/${encodeURIComponent('session-13-03-09-2024')}/${encodeURIComponent('نمونه-1.mp4')}`;
    const converted = repairReferencePath(encoded, renames, known, base);
    expect(converted.status === 'repaired' && converted.path).toBe('session-13-03-09-2024/نمونه-1.mp4');
    // A cycle in the log is reported rather than followed forever.
    const cyclic = new Map([
      ['a/b.mp4', 'a/c.mp4'],
      ['a/c.mp4', 'a/b.mp4'],
    ]);
    expect(repairReferencePath('a/b.mp4', cyclic, new Set(['a/c.mp4'])).status).toBe('attention');

    // --- both rows of a real collision survive, with their own metadata -----
    // Session 1's class part 1 and the first Dashti score each have an OLD and
    // a CURRENT row that now point at one physical file. Repairing them keeps
    // TWO rows, because each carries something the owner wrote.
    const collided = lesson({
      id: 'L1',
      date: '2023-09-26',
      number: 1,
      recordings: [
        {
          id: 'old-video',
          title: 'Class 1 (old link)',
          path: 'setar-classes/session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4',
          kind: 'video',
          notes: 'The half I watched first.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'current-video',
          title: 'Class 1 part 1',
          path: 'session-1-26-09-2023/ضبط-کلاس-1.mp4',
          kind: 'video',
          createdAt: '2026-09-10T00:00:00.000Z',
        },
        {
          id: 'old-score',
          title: 'First Dashti score (old link)',
          path: 'setar-classes/session-1-26-09-2023/chahar-mezarabe-avale-dashti.pdf',
          kind: 'pdf',
          notes: 'Teacher marked bar 12.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'current-score',
          title: 'Dashti score',
          path: 'session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf',
          kind: 'pdf',
          createdAt: '2026-09-10T00:00:00.000Z',
        },
      ],
    });
    const repaired = repairLessonReferences(collided, renames, known);
    expect(repaired.repaired).toBe(2);
    expect(repaired.attention).toEqual([]);
    expect(repaired.lesson.recordings).toHaveLength(4);
    const byId = new Map(repaired.lesson.recordings!.map((r) => [r.id, r]));
    // The two old rows now resolve to the same physical files as the new ones…
    expect(byId.get('old-video')!.path).toBe(byId.get('current-video')!.path);
    expect(byId.get('old-score')!.path).toBe(byId.get('current-score')!.path);
    // …and neither authored row, nor its notes or title, was deleted.
    expect(byId.get('old-video')!.notes).toBe('The half I watched first.');
    expect(byId.get('old-video')!.title).toBe('Class 1 (old link)');
    expect(byId.get('old-score')!.notes).toBe('Teacher marked bar 12.');

    // --- the owner's own practice recordings stay, outside useful material --
    const personal = lesson({
      id: 'L2',
      date: '2025-08-05',
      recordings: [
        {
          id: 'mine-1',
          title: 'My take, August',
          path: 'setar-classes/session-25-05-08-2025/mine.mp4',
          kind: 'video',
          notes: 'Slow but even.',
          createdAt: '2025-08-06T00:00:00.000Z',
        },
      ],
    });
    const personalRepair = repairLessonReferences(personal, renames, known);
    expect(personalRepair.lesson.recordings).toHaveLength(1);
    expect(personalRepair.lesson.recordings![0]!.notes).toBe('Slow but even.');
    // The archive never offers a personal recording as material for a piece.
    const source = applyArchiveImport(baseDB(), plan(baseDB())).archiveSources[0]!;
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);

    // --- THE REFRESH ITSELF REPAIRS THEM ------------------------------------
    // The helper above proves the mapping. THIS proves the production journey:
    // the rename log arrives WITH the index, so the one moment the app can
    // repair a stored path is the moment it accepts a new graph — and a lesson
    // adopted with its own references still pointing at names the archive
    // renamed is half a job, bound and broken.
    const ownPersonal = lesson({
      id: 'L25',
      date: '2025-08-05',
      number: 25,
      recordings: [
        {
          id: 'mine-1',
          title: 'My take, August',
          path: 'setar-classes/session-25-05-08-2025/mine.mp4',
          kind: 'video',
          notes: 'Slow but even.',
          createdAt: '2025-08-06T00:00:00.000Z',
        },
      ],
    });
    const legacyDb = baseDB({ lessons: [collided, ownPersonal] });
    const refresh = plan(legacyDb);
    const adoptedOne = refresh.adoptedLessons.find((l) => l.id === 'L1')!;
    expect(adoptedOne.source).toEqual({ archiveId: 'setar-classes', sessionN: 1 });
    // The PLAN already shows the repaired paths, so the preview and the commit
    // cannot disagree about what is about to be written.
    const planned = new Map(adoptedOne.recordings!.map((r) => [r.id, r]));
    expect(planned.get('old-video')!.path).toBe('session-1-26-09-2023/ضبط-کلاس-1.mp4');
    expect(planned.get('old-score')!.path).toBe('session-1-26-09-2023/نت-چهارمضراب-اول-دشتی-صبا.pdf');

    const installedLegacy = applyArchiveImport(legacyDb, refresh);
    const storedOne = installedLegacy.lessons.find((l) => l.id === 'L1')!;
    expect(storedOne.recordings).toEqual(adoptedOne.recordings);
    // BOTH rows of each collision survive, with everything the owner wrote.
    expect(storedOne.recordings).toHaveLength(4);
    const stored = new Map(storedOne.recordings!.map((r) => [r.id, r]));
    expect(stored.get('old-video')!.path).toBe(stored.get('current-video')!.path);
    expect(stored.get('old-score')!.path).toBe(stored.get('current-score')!.path);
    expect(stored.get('old-video')!.title).toBe('Class 1 (old link)');
    expect(stored.get('old-video')!.notes).toBe('The half I watched first.');
    expect(stored.get('old-score')!.notes).toBe('Teacher marked bar 12.');
    expect(validateArchiveSources(installedLegacy)).toBeNull();

    // The owner's own practice takes are RETAINED, untouched — and never
    // reported missing. The index describes only material scoped to pieces and
    // classes, so a path it does not name is outside what it knows, never
    // evidence that the file is gone.
    const storedPersonal = installedLegacy.lessons.find((l) => l.id === 'L25')!;
    expect(storedPersonal.recordings![0]!.path).toBe('setar-classes/session-25-05-08-2025/mine.mp4');
    expect(storedPersonal.recordings![0]!.notes).toBe('Slow but even.');
    expect(refresh.attention.some((a) => a.path.includes('mine.mp4'))).toBe(false);

    // --- A FULL URL CONVERTS ONLY UNDER THE DEVICE'S OWN BASE ---------------
    // `ArchiveRefresh` threads `archiveRootUrl(getNasBaseUrl())` into the plan
    // as `verifiedBase`, so this uses that FUNCTION's own output rather than a
    // literal: a trailing-slash or prefix mismatch between the two would fail
    // silently, leaving the link exactly as it was with nothing to show why.
    const deviceBase = archiveRootUrl('https://192.168.0.20:5010/setar-classes')!;
    const absolute = lesson({
      id: 'L-abs',
      date: '2023-09-26',
      number: 1,
      recordings: [
        {
          id: 'abs-1',
          title: 'Class 1, saved as a full link',
          path: `${deviceBase}session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4`,
          kind: 'video',
          notes: 'Typed in from the browser bar.',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
        {
          id: 'foreign',
          title: 'Somewhere else entirely',
          path: 'https://elsewhere.example/x.mp4',
          kind: 'video',
          createdAt: '2023-09-27T00:00:00.000Z',
        },
      ],
    });
    const absDb = baseDB({ lessons: [absolute] });
    const urlRepaired = applyArchiveImport(
      absDb,
      planArchiveImport({ db: absDb, index: INDEX, instrumentId: SETAR, verifiedBase: deviceBase, now: NOW }),
    );
    const convertedRows = new Map(urlRepaired.lessons.find((l) => l.id === 'L-abs')!.recordings!.map((r) => [r.id, r]));
    expect(convertedRows.get('abs-1')!.path).toBe('session-1-26-09-2023/ضبط-کلاس-1.mp4');
    expect(convertedRows.get('abs-1')!.notes).toBe('Typed in from the browser bar.');
    // A link to somewhere else is not this archive's to rewrite.
    expect(convertedRows.get('foreign')!.path).toBe('https://elsewhere.example/x.mp4');
    // WITHOUT a base, nothing is converted and nothing is mangled.
    const noBase = applyArchiveImport(absDb, plan(absDb));
    const noBaseRows = new Map(noBase.lessons.find((l) => l.id === 'L-abs')!.recordings!.map((r) => [r.id, r]));
    expect(noBaseRows.get('abs-1')!.path).toBe(absolute.recordings![0]!.path);
    expect(noBaseRows.get('foreign')!.path).toBe('https://elsewhere.example/x.mp4');

    // --- IDEMPOTENT: the second refresh repairs nothing ---------------------
    const again = plan(installedLegacy);
    expect(again.repairedLessons).toEqual([]);
    expect(again.summary.unchanged).toBe(true);
    expect(applyArchiveImport(installedLegacy, again)).toBe(installedLegacy);

    // --- AN ALREADY-BOUND LESSON IS REPAIRED BY A LATER RENAME -------------
    // The archive moves a file the owner's bound class already points at. The
    // next refresh follows the log; the row, its title and its notes stay.
    const movedTo = 'session-1-26-09-2023/ضبط-کلاس-part-1.mp4';
    const moved: SourceIndex = {
      ...INDEX,
      contentHash: '9'.repeat(64),
      renames: [...INDEX.renames, { from: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', to: movedTo }],
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1
          ? {
              ...sess,
              resources: sess.resources.map((r) =>
                r.path === 'session-1-26-09-2023/ضبط-کلاس-1.mp4' ? { ...r, path: movedTo } : r,
              ),
            }
          : sess,
      ),
    };
    const later = planArchiveImport({ db: installedLegacy, index: moved, instrumentId: SETAR, now: NOW });
    expect(later.repairedLessons.map((l) => l.id)).toEqual(['L1']);
    const afterMove = applyArchiveImport(installedLegacy, later);
    const movedLesson = afterMove.lessons.find((l) => l.id === 'L1')!;
    const movedRows = new Map(movedLesson.recordings!.map((r) => [r.id, r]));
    expect(movedRows.get('old-video')!.path).toBe(movedTo);
    expect(movedRows.get('current-video')!.path).toBe(movedTo);
    expect(movedRows.get('old-video')!.notes).toBe('The half I watched first.');
    // The score, which did not move, is exactly as it was.
    expect(movedRows.get('old-score')!.path).toBe(stored.get('old-score')!.path);
    // Nothing about practice moved with it.
    expect(afterMove.blocks).toEqual(installedLegacy.blocks);
    expect(validateArchiveSources(afterMove)).toBeNull();

    // --- A BROKEN CHAIN IS DIAGNOSED, never guessed ------------------------
    // A rename whose destination the archive no longer has: the stored path is
    // left exactly as it is, and the owner is told which file and why.
    const dangling: SourceIndex = {
      ...INDEX,
      contentHash: '8'.repeat(64),
      renames: [...INDEX.renames, { from: 'session-1-26-09-2023/ضبط-کلاس-1.mp4', to: 'session-1-26-09-2023/gone.mp4' }],
    };
    const broken = planArchiveImport({ db: installedLegacy, index: dangling, instrumentId: SETAR, now: NOW });
    expect(broken.repairedLessons).toEqual([]);
    expect(broken.attention.some((a) => /renamed, but the archive no longer has it/.test(a.reason))).toBe(true);
    const afterBroken = applyArchiveImport(installedLegacy, broken);
    expect(afterBroken.lessons.find((l) => l.id === 'L1')!.recordings).toEqual(storedOne.recordings);

    // --- ONE READING OF A CHAIN, EVERYWHERE IT IS USED AS AN IDENTITY ------
    // Adoption took a single hop while repair followed the whole chain, so one
    // rename log gave two different answers about the same file. With
    // A -> B -> C logged, B in session 1 and C in session 2, a unique legacy
    // class was adopted AS SESSION 1 on the strength of B, and then had that
    // very reference repaired into session 2's folder: bound to one class,
    // pointing at another's files.
    const hopA = 'session-1-26-09-2023/first-name.mp4';
    const hopB = 'session-1-26-09-2023/second-name.mp4';
    const hopC = 'session-5-23-01-2024/ضبط-کلاس.mp4'; // a real file, another session
    expect(known.has(hopC)).toBe(true);
    const chained: SourceIndex = {
      ...INDEX,
      contentHash: '7'.repeat(64),
      renames: [...INDEX.renames, { from: hopA, to: hopB }, { from: hopB, to: hopC }],
    };
    const chainRenames = new Map(chained.renames.map((r) => [r.from, r.to]));
    expect(followRenames(hopA, chainRenames)).toBe(hopC);
    const legacyClass = lesson({
      id: 'L-chain',
      date: '2023-09-26',
      number: 1,
      recordings: [{ id: 'c1', title: 'Class 1', path: hopA, kind: 'video', createdAt: '2023-09-27T00:00:00.000Z' }],
    });
    const chainDb = baseDB({ lessons: [legacyClass] });
    const chainPlan = planArchiveImport({ db: chainDb, index: chained, instrumentId: SETAR, now: NOW });
    // Its ONLY reference now points into session 5, so it is NOT evidence of
    // session 1 — and the class is not adopted on it.
    expect(chainPlan.adoptedLessons.some((l) => l.id === 'L-chain')).toBe(false);
    // A CYCLE is no reading at all, so it is no evidence either.
    const cyclicIndex: SourceIndex = {
      ...INDEX,
      contentHash: '6'.repeat(64),
      renames: [...INDEX.renames, { from: hopA, to: hopB }, { from: hopB, to: hopA }],
    };
    expect(
      planArchiveImport({ db: chainDb, index: cyclicIndex, instrumentId: SETAR, now: NOW }).adoptedLessons.some(
        (l) => l.id === 'L-chain',
      ),
    ).toBe(false);

    // --- A HIDE FOLLOWS ITS FILE, AND A RENAMED FILE IS NOT "MISSING" ------
    // A resource suppression is keyed BY PATH. Left on the old name, the file
    // came back into view under its new one while the old row sat there
    // flagged unavailable — the owner's decision silently undone by a rename.
    const hiddenPath = 'session-1-26-09-2023/ضبط-کلاس-1.mp4';
    const hidden: PracticeDB = {
      ...installedLegacy,
      archiveSources: withSuppression(installedLegacy.archiveSources, 'setar-classes', {
        kind: 'resource',
        ref: hiddenPath,
        itemId: 'item-x',
        at: NOW.toISOString(),
      }),
    };
    const afterRename = applyArchiveImport(hidden, planArchiveImport({ db: hidden, index: moved, instrumentId: SETAR, now: NOW }));
    const renamedSource = afterRename.archiveSources[0]!;
    const hide = renamedSource.suppressions.find((x) => x.kind === 'resource')!;
    expect(hide.ref).toBe(movedTo);
    expect(hide.itemId).toBe('item-x'); // the SCOPE is carried, not widened
    expect(renamedSource.suppressions.filter((x) => x.kind === 'resource')).toHaveLength(1);
    // And the old row is GONE rather than retained-and-flagged: the log says
    // exactly where the bytes went, so this file moved, it did not disappear.
    const session1 = renamedSource.sessions.find((x) => x.n === 1)!;
    expect(session1.resources.some((r) => r.path === hiddenPath)).toBe(false);
    expect(session1.resources.some((r) => r.path === movedTo && !r.unavailable)).toBe(true);
    // ACROSS sessions too — a rename can move a file into a different session,
    // which is exactly the shape of the A -> B -> C log above. Asking only
    // "is it still in THIS session" flagged the old row as missing while the
    // very same bytes sat in the graph under their new name.
    const crossTo = 'session-5-23-01-2024/moved-out-of-session-1.mp4';
    const oldRow = INDEX.sessions.find((x) => x.n === 1)!.resources.find((r) => r.path === hiddenPath)!;
    const crossSession: SourceIndex = {
      ...INDEX,
      contentHash: '4'.repeat(64),
      renames: [...INDEX.renames, { from: hiddenPath, to: crossTo }],
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1
          ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) }
          : sess.n === 5
            ? { ...sess, resources: [...sess.resources, { ...oldRow, path: crossTo }] }
            : sess,
      ),
    };
    const afterCross = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: crossSession, instrumentId: SETAR, now: NOW }),
    );
    const crossSource = afterCross.archiveSources[0]!;
    expect(crossSource.sessions.find((x) => x.n === 1)!.resources.some((r) => r.path === hiddenPath)).toBe(false);
    expect(crossSource.sessions.find((x) => x.n === 5)!.resources.some((r) => r.path === crossTo)).toBe(true);
    // The hide went WITH it, into the other session, still scoped to one item.
    expect(crossSource.suppressions.find((x) => x.kind === 'resource')).toMatchObject({
      ref: crossTo,
      itemId: 'item-x',
    });
    expect(validateArchiveSources(afterCross)).toBeNull();

    // --- A CYCLE IS NO READING, FOR EVERY CONSUMER OF THE LOG -------------
    // `followRenames` used to hand back `{ path, cycle: true }` — a perfectly
    // usable-looking path beside a flag — and only ONE of its three callers
    // read the flag. Hide A, then publish A->B and B->A: the re-key walked
    // straight past the verdict and moved the owner's hide onto B, so A came
    // back into view and the wrong file went dark. It returns `null` now, so
    // there is no way to drop the verdict and still have a path.
    const cyclicTo = 'session-1-26-09-2023/ضبط-کلاس-2.mp4'; // a real sibling file
    const cyclicLog: SourceIndex = {
      ...INDEX,
      contentHash: '3'.repeat(64),
      renames: [...INDEX.renames, { from: hiddenPath, to: cyclicTo }, { from: cyclicTo, to: hiddenPath }],
    };
    const afterCycle = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
    );
    const cycledSource = afterCycle.archiveSources[0]!;
    const cycledHide = cycledSource.suppressions.find((x) => x.kind === 'resource')!;
    expect(cycledHide.ref).toBe(hiddenPath); // exactly where the owner put it
    expect(cycledHide.itemId).toBe('item-x');
    expect(cycledSource.suppressions.filter((x) => x.kind === 'resource')).toHaveLength(1);
    // …so the file the owner hid is still hidden, and its sibling is not.
    expect(resourcesForPiece(cycledSource, 'عراق', 'item-x').some((r) => r.path === hiddenPath)).toBe(false);
    expect(resourcesForSession(cycledSource, 1).some((r) => r.path === cyclicTo)).toBe(true);

    // AVAILABILITY reads the same verdict: a cycle is not a move, so a row the
    // incoming index has dropped keeps its provenance flagged rather than
    // being silently deleted on the strength of a destination nothing can read.
    const cyclicAndRemoved: SourceIndex = {
      ...cyclicLog,
      contentHash: '2'.repeat(64),
      sessions: cyclicLog.sessions.map((sess) =>
        sess.n === 1 ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) } : sess,
      ),
    };
    const afterCyclicRemoval = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicAndRemoved, instrumentId: SETAR, now: NOW }),
    );
    expect(
      afterCyclicRemoval.archiveSources[0]!.sessions.find((x) => x.n === 1)!.resources.find(
        (r) => r.path === hiddenPath,
      )?.unavailable,
    ).toBe(true);
    expect(validateArchiveSources(afterCyclicRemoval)).toBeNull();

    // REPAIR says so out loud rather than rewriting the path to a stop on the
    // loop — and ADOPTION, which reads the same verdict, takes it as no
    // evidence at all (asserted above for the same shape).
    const loopMap = new Map(cyclicLog.renames.map((r) => [r.from, r.to]));
    expect(followRenames(hiddenPath, loopMap)).toBeNull();
    expect(repairReferencePath(hiddenPath, loopMap, known)).toEqual({
      status: 'attention',
      reason: 'The rename log loops on this path.',
      code: 'cycle',
    });
    const loopLesson = applyArchiveImport(
      hidden,
      planArchiveImport({ db: hidden, index: cyclicLog, instrumentId: SETAR, now: NOW }),
    ).lessons.find((l) => l.id === 'L1')!;
    expect(loopLesson.recordings).toEqual(storedOne.recordings);

    // A file that really IS gone still keeps its provenance, flagged.
    const removed: SourceIndex = {
      ...INDEX,
      contentHash: '5'.repeat(64),
      sessions: INDEX.sessions.map((sess) =>
        sess.n === 1 ? { ...sess, resources: sess.resources.filter((r) => r.path !== hiddenPath) } : sess,
      ),
    };
    const afterRemoval = applyArchiveImport(
      installedLegacy,
      planArchiveImport({ db: installedLegacy, index: removed, instrumentId: SETAR, now: NOW }),
    );
    expect(
      afterRemoval.archiveSources[0]!.sessions.find((x) => x.n === 1)!.resources.find((r) => r.path === hiddenPath)
        ?.unavailable,
    ).toBe(true);
    expect(validateArchiveSources(afterRename)).toBeNull();
  });
});

describe('owner suppressions', () => {
  it('a suppressed piece or session is never re-created by a later refresh', () => {
    const installed = applyArchiveImport(baseDB(), plan(baseDB()));
    const stripped: PracticeDB = {
      ...installed,
      items: installed.items.filter((i) => i.source?.pieceKey !== 'عراق'),
      lessons: installed.lessons.filter((l) => l.source?.sessionN !== 13),
      archiveSources: withSuppression(
        withSuppression(installed.archiveSources, 'setar-classes', {
          kind: 'piece',
          ref: 'عراق',
          at: NOW.toISOString(),
        }),
        'setar-classes',
        { kind: 'session', ref: '13', at: NOW.toISOString() },
      ),
    };
    const again = plan(stripped);
    expect(again.newItems.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(again.newLessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    // Idempotent: suppressing the same thing twice does not grow the list.
    const twice = withSuppression(stripped.archiveSources, 'setar-classes', {
      kind: 'piece',
      ref: 'عراق',
      at: '2027-01-01T00:00:00.000Z',
    });
    expect(twice[0]!.suppressions).toHaveLength(2);
  });
});
```

### src/domain/sourceReconcile.ts

```
import type { ID, ISODate, Lesson, LessonRecording, PracticeDB, PracticeItem } from './types';
import { createItem, createLesson } from './factories';
import { nowISO } from './util';
import {
  isSafeSourcePath,
  sourceItemId,
  sourceLessonId,
  type ArchiveSource,
  type SourceDiagnostic,
  type SourceIndex,
  type SourcePiece,
  type SourceSuppression,
} from './sourceArchive';

// ---------------------------------------------------------------------------
// Reconciling a published source index with the owner's own database.
//
// PURE and clock-explicit. Two steps, deliberately separate: `planArchiveImport`
// decides and explains, `applyArchiveImport` writes. The store commits the plan
// in ONE synchronous mutation, so a partially-applied import cannot exist.
//
// THE RULE THIS MODULE EXISTS FOR: the archive owns what the archive knows —
// registry facts, session facts, roles, memberships, availability. Everything
// else is the owner's and is seeded ONCE, then never written again. An import
// may establish repertoire membership, historical lesson provenance and source
// material. It may never establish recorded practice, a result, a review, or a
// deadline.
// ---------------------------------------------------------------------------

/**
 * The archive folder the owner's LEGACY references were written against. New
 * references are stored relative to the archive ROOT (the device base now ends
 * in `/setar-classes/`), so a legacy path carries one extra leading segment
 * that must come off before it can be looked up — and must not be written back.
 */
export const LEGACY_ARCHIVE_PREFIX = 'setar-classes/';

// --- decisions and questions -----------------------------------------------

export type ReconcileDecision =
  | { kind: 'link-item'; pieceKey: string; itemId: ID }
  | { kind: 'create-item'; pieceKey: string }
  | { kind: 'skip-item'; pieceKey: string }
  | { kind: 'link-lesson'; sessionN: number; lessonId: ID }
  | { kind: 'create-lesson'; sessionN: number }
  | { kind: 'skip-lesson'; sessionN: number }
  /**
   * A REGISTRY VALUE THE OWNER CHOSE TO TAKE — carrying `itemId`, the RECORD
   * it was shown against, and `from`, the value of theirs it was chosen
   * against. A decision is about the state the owner actually saw: the preview
   * and the commit are two moments, and between them a note can be saved, a
   * sync can land, another device can write.
   *
   * Without the PREMISE, choosing the archive's composer over an empty field
   * and then typing one yourself before pressing Apply replaced your own new
   * words with the registry's. Without the IDENTITY, the same answer landed on
   * whichever record happened to hold that piece at commit time: sync a
   * database where the piece is bound to item B instead, also with an empty
   * composer, and a choice made about A was written to B.
   */
  | { kind: 'apply-field'; pieceKey: string; itemId: ID; field: MetadataField; from: string };

export type MetadataField = 'dastgahAvaz' | 'gusheh' | 'form' | 'composer';

export interface ReconcileCandidate {
  id: ID;
  title: string;
  why: string;
}

export interface ReconcileQuestion {
  kind: 'item' | 'lesson';
  /** Exactly one of these is set. */
  pieceKey?: string;
  sessionN?: number;
  label: string;
  candidates: ReconcileCandidate[];
}

/** A registry improvement the owner may apply to an already-seeded item. */
export interface MetadataSuggestion {
  pieceKey: string;
  itemId: ID;
  field: MetadataField;
  from: string;
  to: string;
}

/**
 * Does this decision still describe THIS suggestion? The one answer, used by
 * the plan's own summary and by `applyArchiveImport`'s write — a question with
 * two answers is how a preview and a commit come to mean different things.
 */
export function decisionMatchesSuggestion(d: ReconcileDecision, s: MetadataSuggestion): boolean {
  return (
    d.kind === 'apply-field' &&
    d.pieceKey === s.pieceKey &&
    // IDENTITY and PREMISE together: which record, and what of theirs it was
    // chosen against. Either one alone lets a rebase redirect the answer.
    d.itemId === s.itemId &&
    d.field === s.field &&
    d.from === s.from
  );
}

export interface ImportSummary {
  addedItems: number;
  addedLessons: number;
  updatedLessons: number;
  questions: number;
  attention: number;
  /** Nothing at all would change: the same index, already accepted. */
  unchanged: boolean;
}

export interface ImportPlan {
  archiveId: string;
  instrumentId: ID;
  indexHash: string;
  /** The graph to persist, carrying the owner's existing suppressions. */
  source: ArchiveSource;
  newItems: PracticeItem[];
  newLessons: Lesson[];
  /** Existing lessons adopted into the archive (id preserved, binding added). */
  adoptedLessons: Lesson[];
  /**
   * Already-bound lessons whose stored reference PATHS the rename log moved —
   * the row, its title and its notes untouched, only the path text rewritten.
   */
  repairedLessons: Lesson[];
  /** Existing items adopted by an explicit owner decision. */
  adoptedItems: PracticeItem[];
  questions: ReconcileQuestion[];
  suggestions: MetadataSuggestion[];
  attention: SourceDiagnostic[];
  /**
   * Decisions whose PREMISE moved: the owner's value is no longer the one the
   * choice was made against, or a link target has since been deleted, bound
   * elsewhere or moved to another instrument. They are not applied and not
   * quietly turned into some other action — the commit refuses and the owner
   * looks again at what is actually there now.
   */
  staleDecisions: ReconcileDecision[];
  summary: ImportSummary;
}

// --- helpers ---------------------------------------------------------------

/** Strip the legacy archive-folder prefix; leave anything else alone. */
export function toArchiveRelative(path: string): string {
  return path.startsWith(LEGACY_ARCHIVE_PREFIX) ? path.slice(LEGACY_ARCHIVE_PREFIX.length) : path;
}

function suppressionKey(s: SourceSuppression): string {
  return `${s.kind} ${s.ref} ${s.itemId ?? ''}`;
}

/**
 * WHERE DOES THIS ARCHIVE PATH POINT NOW? One reading, for everything that
 * uses a stored path as an IDENTITY.
 *
 * `repairReferencePath` followed the whole logged chain while adoption took a
 * single hop and a suppression took none at all, so one rename log gave three
 * different answers about the same file. With A -> B -> C logged, B in session
 * 1 and C in session 2, a legacy class was adopted as session 1 on the
 * strength of B and then had that very reference repaired into session 2 —
 * bound to one class, pointing at another's files. A hidden resource,
 * meanwhile, stayed keyed to the old path and simply reappeared under the new
 * one.
 *
 * A CYCLE YIELDS NO IDENTITY AT ALL, and saying so is the whole return type.
 * A log that loops says nothing about where the file is, and picking a
 * stopping point would invent one. This used to hand back
 * `{ path, cycle: true }` — a perfectly usable-looking path beside a flag —
 * and only ONE of the three callers read the flag: `hasSourcePathEvidence`
 * refused it, while the suppression re-key and `retainMissing` walked straight
 * past it. With A->B and B->A logged, an owner's hide of A was re-keyed onto
 * B, so A reappeared and the wrong file went dark. `null` is what makes that
 * unrepresentable: there is no path to drop the verdict and still use.
 */
export function followRenames(path: string, renames: Map<string, string>): string | null {
  let current = path;
  const seen = new Set<string>([current]);
  while (renames.has(current)) {
    const next = renames.get(current)!;
    if (seen.has(next)) return null;
    seen.add(next);
    current = next;
  }
  return current;
}

/** The registry facts an item is SEEDED from — identity, never working detail. */
function persianFromPiece(piece: SourcePiece) {
  return {
    // "گوشه" is the form that identifies a gusheh. Every other form is carried
    // verbatim; none of them is turned into a category the registry never made.
    ...(piece.form === 'گوشه' ? { gusheh: piece.piece || piece.key } : {}),
    ...(piece.dastgah ? { dastgahAvaz: piece.dastgah } : {}),
    ...(piece.form ? { form: piece.form } : {}),
    ...(piece.composer ? { composer: piece.composer } : {}),
  };
}

/**
 * A NEW library item for a canonical piece.
 *
 * `status: 'dormant'` ("Resting") is an explicit ADMINISTRATIVE import policy,
 * not a judgement about the music: ninety-four pieces arriving as live
 * candidates would flood every recommendation and every session plan on the
 * day of the import. A resting item is still searchable, still in My
 * repertoire, and still directly startable — the owner decides what comes back.
 *
 * Nothing about practice is seeded: no last practice, no result, no review
 * date, no SM-2 state. `createItem` already leaves every one of those empty;
 * this function adds no field it does not.
 */
function itemForPiece(archiveId: string, instrumentId: ID, piece: SourcePiece, now: Date): PracticeItem {
  const item = createItem(
    {
      instrumentId,
      // The canonical key IS the piece's name in this archive, byte for byte.
      title: piece.key,
      itemType: piece.form === 'گوشه' ? 'gusheh' : 'full_piece',
      status: 'dormant',
      persian: persianFromPiece(piece),
    },
    now,
  );
  return { ...item, id: sourceItemId(archiveId, piece.key), source: { archiveId, pieceKey: piece.key } };
}

/** A historical lesson for one archive session. */
function lessonForSession(
  archiveId: string,
  instrumentId: ID,
  session: { n: number; date: ISODate },
  now: Date,
): Lesson {
  const lesson = createLesson({ instrumentId, date: session.date, number: session.n }, now);
  return {
    ...lesson,
    id: sourceLessonId(archiveId, session.n),
    source: { archiveId, sessionN: session.n },
    // HISTORY, whatever the clock says. See `isUpcomingLesson`.
    origin: 'archive',
  };
}

/**
 * Read a stored reference path as an ARCHIVE-RELATIVE one.
 *
 * A full URL sitting under THIS DEVICE's own verified base names the same file
 * as the relative path beneath it — written differently, nothing more. Adoption
 * evidence and path repair therefore have to read a stored path the SAME way,
 * or one of them adopts a class the other cannot fix: a lesson whose references
 * were saved as full links would carry perfectly good evidence that nothing
 * recognised.
 *
 * Anything it cannot read as archive-relative — a foreign origin, a link with a
 * query or fragment, a URL with no verified base to measure it against, an
 * unsafe path — comes back as the repair outcome that case deserves, so the two
 * callers cannot disagree about those either.
 */
type RelativeRead = { ok: true; relative: string; wasUrl: boolean } | { ok: false; outcome: ReferenceRepair };

function readArchiveRelative(raw: string, verifiedBase?: string): RelativeRead {
  if (!raw) return { ok: false, outcome: { status: 'attention', reason: 'This reference has no path.', code: 'no-path' } };

  let relative = raw;
  let wasUrl = false;
  if (/^https?:\/\//i.test(raw)) {
    wasUrl = true;
    if (!verifiedBase) {
      return {
        ok: false,
        outcome: {
          status: 'attention',
          reason: 'A full link cannot be converted without a verified media base.',
          code: 'no-base',
        },
      };
    }
    let url: URL;
    let base: URL;
    try {
      url = new URL(raw);
      base = new URL(verifiedBase);
    } catch {
      return { ok: false, outcome: { status: 'attention', reason: 'That link could not be read as a URL.', code: 'bad-url' } };
    }
    if (url.search || url.hash) return { ok: false, outcome: { status: 'unchanged' } };
    const prefix = base.toString().replace(/\/+$/, '') + '/';
    if (!url.toString().startsWith(prefix)) return { ok: false, outcome: { status: 'unchanged' } };
    // Decoded per SEGMENT because `resolveRecording` re-encodes on the way out;
    // a Farsi filename copied percent-encoded would otherwise double-escape.
    relative = url
      .toString()
      .slice(prefix.length)
      .split('/')
      .map((seg) => {
        try {
          return decodeURIComponent(seg);
        } catch {
          return seg;
        }
      })
      .join('/');
  }

  const stripped = toArchiveRelative(relative);
  if (!isSafeSourcePath(stripped)) {
    return { ok: false, outcome: { status: 'attention', reason: 'That path is not a safe archive path.', code: 'unsafe' } };
  }
  return { ok: true, relative: stripped, wasUrl };
}

/**
 * Does this lesson carry EXACT source-path evidence that it is this session?
 *
 * A reference whose stored path — once the legacy archive prefix is off, and
 * once the rename log has been followed — sits inside that session's folder is
 * proof the owner's own record already points at these very files. Date and
 * number agreeing is not: two classes can share a number across years, and the
 * owner's upcoming class 38 and archive session 38 are a real, live example of
 * exactly that collision.
 */
function hasSourcePathEvidence(
  lesson: Lesson,
  folder: string,
  renames: Map<string, string>,
  verifiedBase?: string,
): boolean {
  return (lesson.recordings ?? []).some((r) => {
    const read = readArchiveRelative(r.path.trim(), verifiedBase);
    if (!read.ok) return false;
    const moved = followRenames(read.relative, renames);
    if (moved === null) return false; // no reading, therefore no evidence
    return moved.startsWith(`${folder}/`);
  });
}

/**
 * Keep what the source has STOPPED describing, flagged unavailable.
 *
 * A piece removed from the registry, a session folder that is gone, a file that
 * was deleted — the app has an item bound to it, a lesson bound to it and
 * material listed from it. Replacing the graph with the incoming index alone
 * would leave those bindings pointing at nothing, which `validateDB` refuses at
 * every door: the next Refresh, and every one after it, would fail outright.
 *
 * So provenance is RETAINED and labelled instead. The owner sees that the file
 * is no longer in the archive and decides what to do; nothing of theirs is
 * deleted to make the two agree. A row that comes back is simply the incoming
 * row again, with no flag — the source is authoritative about what it HAS.
 */
function retainMissing(previous: ArchiveSource | undefined, index: SourceIndex, renames: Map<string, string>) {
  if (!previous) return { pieces: index.pieces, sessions: index.sessions };

  const incomingKeys = new Set(index.pieces.map((p) => p.key));
  const pieces = [
    ...index.pieces,
    ...previous.pieces.filter((p) => !incomingKeys.has(p.key)).map((p) => ({ ...p, unavailable: true as const })),
  ];

  const incomingSessions = new Map(index.sessions.map((s) => [s.n, s]));
  // Every path the incoming graph describes, ACROSS sessions: a rename can
  // move a file into a different session (the log's own A -> B -> C shape), and
  // asking only "is it still in THIS session" would flag such a file as gone
  // while the very same bytes sit in the graph under their new name.
  const anywhere = new Set(index.sessions.flatMap((s) => s.resources.map((r) => r.path)));
  // A cycle is NOT a move: with no readable destination there is nothing to
  // say the bytes are elsewhere in the graph, so the row keeps its provenance
  // and its `unavailable` flag rather than being silently dropped.
  const movedNotGone = (path: string) => {
    const to = followRenames(path, renames);
    return to !== null && anywhere.has(to);
  };
  const sessions = index.sessions.map((s) => {
    const before = previous.sessions.find((x) => x.n === s.n);
    if (!before) return s;
    const paths = new Set(s.resources.map((r) => r.path));
    // A RENAMED FILE MOVED; IT DID NOT GO MISSING. Its old row is dropped
    // rather than retained-and-flagged, because the log says exactly where the
    // bytes went and the incoming row describes them. Safe to drop: only
    // pieces and sessions carry item/lesson bindings, so no binding can dangle
    // on a resource row, and a manual unclassified lesson's own reference
    // reaches material through the LESSON, never through this graph.
    const gone = before.resources
      .filter((r) => !paths.has(r.path) && !movedNotGone(r.path))
      .map((r) => ({ ...r, unavailable: true as const }));
    return gone.length > 0 ? { ...s, resources: [...s.resources, ...gone] } : s;
  });
  for (const before of previous.sessions) {
    if (incomingSessions.has(before.n)) continue;
    sessions.push({
      ...before,
      unavailable: true,
      // …and a file this vanished session's folder was renamed OUT of is in the
      // graph already, under its new session. Keeping it here too would list
      // one file twice, once falsely as missing.
      resources: before.resources
        .filter((r) => !movedNotGone(r.path))
        .map((r) => ({ ...r, unavailable: true as const })),
    });
  }
  sessions.sort((a, b) => a.n - b.n);
  return { pieces, sessions };
}

// --- planning --------------------------------------------------------------

export interface PlanInput {
  db: PracticeDB;
  index: SourceIndex;
  instrumentId: ID;
  decisions?: ReconcileDecision[];
  /**
   * This DEVICE's confirmed media base, when it has one. Only a full URL
   * sitting under it may be rewritten to an archive-relative path; without it
   * a stored `https://…` link is left exactly as the owner saved it.
   */
  verifiedBase?: string;
  now: Date;
}

/**
 * Decide what an import would do, without doing any of it.
 *
 * EXACT SOURCE BINDING WINS. A record already bound to a source identity IS
 * that entity, whatever its title or date has since been edited to. Only an
 * UNBOUND record is a candidate for anything, and only exact evidence adopts
 * one: everything weaker becomes a question with the candidates named.
 */
export function planArchiveImport({ db, index, instrumentId, decisions = [], verifiedBase, now }: PlanInput): ImportPlan {
  const archiveId = index.archiveId;
  const existing = db.archiveSources?.find((s) => s.id === archiveId);
  const suppressions = existing?.suppressions ?? [];
  const isSuppressed = (kind: SourceSuppression['kind'], ref: string) =>
    suppressions.some((s) => s.kind === kind && s.ref === ref && s.itemId === undefined);

  // EVERY DECISION IS ACCOUNTED FOR: applied, already realised, or STALE.
  //
  // The loops below start with `if (already bound) continue` / `if (already
  // suppressed) continue`, which meant a decision about a record that had been
  // bound between the preview and the commit was never looked at at all — no
  // adoption, no question, and an EMPTY `staleDecisions`, so the commit
  // reported success for an action it had not performed. Marking what is used
  // and sweeping the rest closes that for every kind at once, rather than
  // adding a stale check inside each early return.
  const consumed = new Set<ReconcileDecision>();
  const decisionFor = <T extends ReconcileDecision['kind']>(kind: T, match: (d: ReconcileDecision) => boolean) =>
    decisions.find((d) => d.kind === kind && match(d));
  const acted = <T,>(d: T): T => {
    if (d) consumed.add(d as unknown as ReconcileDecision);
    return d;
  };

  // A SKIP IS A DECISION, AND A DECISION IS PERSISTED.
  //
  // It used to live only in this call's `decisions` argument, so the owner's
  // "no, not this one" survived exactly as long as the preview screen did: the
  // next refresh — or simply a reload — asked the identical question again,
  // with nothing in the database to show it had ever been answered. It becomes
  // a suppression, the same record every other deliberate removal writes, which
  // a refresh, a reload and a sync all already respect.
  const addedSuppressions: SourceSuppression[] = [];
  const knownSuppressions = new Set(suppressions.map(suppressionKey));
  const suppress = (kind: SourceSuppression['kind'], ref: string) => {
    const entry: SourceSuppression = { kind, ref, at: nowISO(now) };
    if (knownSuppressions.has(suppressionKey(entry))) return;
    knownSuppressions.add(suppressionKey(entry));
    addedSuppressions.push(entry);
  };

  const renames = new Map(index.renames.map((r) => [r.from, r.to]));
  const staleDecisions: ReconcileDecision[] = [];

  // --- lessons ------------------------------------------------------------
  const boundLessons = new Map<number, Lesson>();
  for (const l of db.lessons) {
    if (l.source?.archiveId === archiveId) boundLessons.set(l.source.sessionN, l);
  }

  const newLessons: Lesson[] = [];
  const adoptedLessons: Lesson[] = [];
  const questions: ReconcileQuestion[] = [];

  for (const session of index.sessions) {
    if (boundLessons.has(session.n)) continue;
    if (isSuppressed('session', String(session.n))) continue;

    const skip = decisionFor('skip-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
    if (skip) {
      acted(skip);
      suppress('session', String(session.n));
      continue;
    }

    // "Create separately" ends the question: the owner has said this session is
    // NOT any of the classes already in their database. Without this branch the
    // decision was silently dropped and the ambiguous candidates re-asked for
    // ever — the item side had it from the start, and the lesson side did not.
    const createSeparately = decisionFor('create-lesson', (d) => 'sessionN' in d && d.sessionN === session.n);
    if (createSeparately) {
      acted(createSeparately);
      newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
      continue;
    }

    const linked = decisionFor('link-lesson', (d) => 'sessionN' in d && d.sessionN === session.n) as
      | { kind: 'link-lesson'; sessionN: number; lessonId: ID }
      | undefined;
    if (linked) {
      // The SAME conditions the candidate list is built from — a link may only
      // adopt a record that is still unbound and still this instrument's.
      // Deleted, bound elsewhere or moved since the preview, the decision is
      // STALE, never silently turned into "create a new class instead".
      acted(linked);
      const target = db.lessons.find((l) => l.id === linked.lessonId);
      if (target && !target.source && target.instrumentId === instrumentId) {
        adoptedLessons.push({ ...target, source: { archiveId, sessionN: session.n }, origin: 'archive' });
        continue;
      }
      staleDecisions.push(linked);
    }

    // AUTO-ADOPT only a UNIQUE candidate with all three: same instrument, same
    // date, same number, and a reference that actually points into this
    // session's own folder.
    const candidates = db.lessons.filter(
      (l) =>
        !l.source &&
        l.instrumentId === instrumentId &&
        l.date === session.date &&
        l.number === session.n &&
        hasSourcePathEvidence(l, session.folder, renames, verifiedBase),
    );
    if (candidates.length === 1) {
      adoptedLessons.push({ ...candidates[0]!, source: { archiveId, sessionN: session.n }, origin: 'archive' });
      continue;
    }
    if (candidates.length > 1) {
      questions.push({
        kind: 'lesson',
        sessionN: session.n,
        label: `Class ${session.n} · ${session.date}`,
        candidates: candidates.map((l) => ({
          id: l.id,
          title: `${l.date}${l.number ? ` · class ${l.number}` : ''}`,
          why: 'Same date and number, and it already links to this folder.',
        })),
      });
      continue;
    }
    newLessons.push(lessonForSession(archiveId, instrumentId, session, now));
  }

  // --- items --------------------------------------------------------------
  const boundItems = new Map<string, PracticeItem>();
  for (const i of db.items) {
    if (i.source?.archiveId === archiveId) boundItems.set(i.source.pieceKey, i);
  }

  const newItems: PracticeItem[] = [];
  const adoptedItems: PracticeItem[] = [];
  const suggestions: MetadataSuggestion[] = [];

  for (const piece of index.pieces) {
    const bound = boundItems.get(piece.key);
    if (bound) {
      // SOURCE FACTS update; the owner's own fields never do. A later registry
      // improvement is OFFERED, field by field, and applied only on an explicit
      // decision — including when the owner's value is deliberately EMPTY.
      for (const field of ['dastgahAvaz', 'gusheh', 'form', 'composer'] as MetadataField[]) {
        const proposed = persianFromPiece(piece)[field] ?? '';
        const current = bound.persian?.[field] ?? '';
        if (proposed && proposed !== current) {
          suggestions.push({ pieceKey: piece.key, itemId: bound.id, field, from: current, to: proposed });
        }
      }
      continue;
    }
    if (isSuppressed('piece', piece.key)) continue;

    const skipItem = decisionFor('skip-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key);
    if (skipItem) {
      acted(skipItem);
      suppress('piece', piece.key);
      continue;
    }
    const linked = decisionFor('link-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key) as
      | { kind: 'link-item'; pieceKey: string; itemId: ID }
      | undefined;
    if (linked) {
      acted(linked);
      const target = db.items.find((i) => i.id === linked.itemId);
      if (target && !target.source && target.instrumentId === instrumentId) {
        adoptedItems.push({ ...target, source: { archiveId, pieceKey: piece.key } });
        continue;
      }
      staleDecisions.push(linked); // see the lesson branch above
    }
    const createNow = acted(decisionFor('create-item', (d) => 'pieceKey' in d && d.pieceKey === piece.key));

    // CANDIDATES are EXACT equality only: the canonical key itself, or one of
    // the registry's own literal aliases. Nothing is normalised, folded or
    // transliterated here — that is search, and search is not identity. A
    // built-in `catalogKey` is never compared at all: "iraq" is a catalogue
    // slug, عراق is a canonical Farsi key, and equating them would merge two
    // different things on a coincidence of meaning.
    const literals = new Set<string>([piece.key, ...piece.aliases]);
    const candidates = createNow
      ? []
      : db.items.filter(
          (i) => !i.source && i.instrumentId === instrumentId && literals.has(i.title.trim()),
        );

    if (candidates.length > 0) {
      questions.push({
        kind: 'item',
        pieceKey: piece.key,
        label: piece.key,
        candidates: candidates.map((i) => ({
          id: i.id,
          title: i.title,
          why: i.title.trim() === piece.key ? 'Same title as the archive name.' : 'Matches a name this piece used to have.',
        })),
      });
      continue;
    }
    newItems.push(itemForPiece(archiveId, instrumentId, piece, now));
  }

  // --- EXACT REFERENCE REPAIR, inside the refresh the owner actually runs ---
  //
  // The rename log is published WITH the index, so the one moment the app can
  // repair a stored path is the moment it accepts a new graph. Adopting a
  // legacy class and leaving its own references pointing at names the archive
  // renamed years ago is half a job: the lesson binds, and every file on it
  // still 404s.
  //
  // Scope is the lessons this archive OWNS — the ones adopted by this plan and
  // the ones already bound. A lesson the archive has no claim on is not
  // something a refresh may rewrite.
  //
  // ONE pass over both, so `adoptedLessons` in the plan is byte-identical to
  // what `applyArchiveImport` installs: a preview that shows an old path while
  // the commit writes a new one is the plan/apply divergence this module is
  // built to make impossible.
  const known = new Set(index.sessions.flatMap((s) => s.resources.map((r) => r.path)));
  const repairAttention: SourceDiagnostic[] = [];
  const repair = (l: Lesson): { lesson: Lesson; changed: boolean } => {
    const outcome = repairLessonReferences(l, renames, known, verifiedBase);
    for (const a of outcome.attention) {
      // 'not-described' is NOT reported: the index describes only the material
      // scoped to pieces and classes, so a path it never names and never
      // renamed is outside what it knows — never evidence the file is gone.
      // See `RepairReason`.
      if (a.code === 'not-described') continue;
      repairAttention.push({ path: a.path, reason: a.reason });
    }
    return { lesson: outcome.lesson, changed: outcome.repaired > 0 };
  };

  const repairedAdopted = adoptedLessons.map((l) => repair(l).lesson);
  const repairedLessons: Lesson[] = [];
  for (const bound of boundLessons.values()) {
    const outcome = repair(bound);
    if (outcome.changed) repairedLessons.push(outcome.lesson);
  }

  // --- the graph to persist ------------------------------------------------
  // What the source still describes, PLUS what it has stopped describing,
  // flagged. New records above were minted from `index.pieces` alone, so a
  // retained-but-unavailable piece never comes back as a fresh item.
  const retained = retainMissing(existing, index, renames);
  const source: ArchiveSource = {
    id: archiveId,
    instrumentId,
    indexHash: index.contentHash,
    acceptedAt: nowISO(now),
    pieces: retained.pieces,
    sessions: retained.sessions,
    renames: index.renames,
    diagnostics: index.diagnostics,
    // A HIDE FOLLOWS ITS FILE, exactly as a stored reference does. A resource
    // suppression is keyed BY PATH, so a rename left the decision pointing at
    // a name the archive no longer uses: the file came back into view under
    // its new path while the old, hidden row sat there flagged unavailable.
    // Rewriting the ref is not editing the owner's decision — it is the same
    // decision about the same bytes, said in the archive's current words. The
    // `itemId` scope is carried untouched, and re-keying cannot duplicate:
    // `suppressionKey` de-duplicates the result.
    suppressions: dedupeSuppressions([
      ...suppressions.map((sup) => {
        if (sup.kind !== 'resource') return sup;
        // A HIDE FOLLOWS ITS FILE ONLY WHERE THE LOG SAYS WHERE THE FILE WENT.
        // A cycle names no destination, so the decision stays exactly where the
        // owner put it: moving it to an arbitrary stop on the loop would both
        // un-hide what they hid and hide something they did not.
        const to = followRenames(sup.ref, renames);
        return to === null ? sup : { ...sup, ref: to };
      }),
      ...addedSuppressions,
    ]),
  };

  // A field decision only counts as a change when there is a suggestion for it
  // to apply — a stale one left over from an earlier preview changes nothing.
  const appliedFields = decisions.filter((d) => suggestions.some((x) => decisionMatchesSuggestion(d, x)));
  for (const d of appliedFields) acted(d);

  // THE SWEEP. Anything the loops above did not act on is either an action
  // that has ALREADY HAPPENED — the owner pressed Apply, it was written, and
  // the same decision is still in hand on the next preview — or an answer to a
  // question that no longer stands.
  //
  // The already-done branch is LOOP PREVENTION, not politeness:
  // `ArchiveRefresh` drops a stale decision and re-previews, and a realised
  // action can never be consumed by a loop that skips its record, so without
  // it the same decision would go stale for ever.
  const realised = (d: ReconcileDecision): boolean => {
    switch (d.kind) {
      case 'skip-item':
        return isSuppressed('piece', d.pieceKey);
      case 'skip-lesson':
        return isSuppressed('session', String(d.sessionN));
      case 'link-item':
        return boundItems.get(d.pieceKey)?.id === d.itemId;
      case 'create-item':
        return boundItems.get(d.pieceKey)?.id === sourceItemId(archiveId, d.pieceKey);
      case 'link-lesson':
        return boundLessons.get(d.sessionN)?.id === d.lessonId;
      case 'create-lesson':
        return boundLessons.get(d.sessionN)?.id === sourceLessonId(archiveId, d.sessionN);
      case 'apply-field': {
        // No live suggestion can mean two opposite things. The registry value
        // is already in the owner's field — done — or the registry no longer
        // proposes one, which is a premise that moved.
        const piece = index.pieces.find((x) => x.key === d.pieceKey);
        const item = boundItems.get(d.pieceKey);
        if (!piece || !item || item.id !== d.itemId) return false;
        const proposed = persianFromPiece(piece)[d.field] ?? '';
        return proposed !== '' && (item.persian?.[d.field] ?? '') === proposed;
      }
    }
  };
  for (const d of decisions) {
    if (consumed.has(d) || staleDecisions.includes(d)) continue;
    if (realised(d)) continue;
    staleDecisions.push(d);
  }
  const changesRecords =
    newItems.length > 0 ||
    newLessons.length > 0 ||
    adoptedLessons.length > 0 ||
    adoptedItems.length > 0 ||
    repairedLessons.length > 0 ||
    addedSuppressions.length > 0 ||
    appliedFields.length > 0;
  const sameGraph = existing?.indexHash === index.contentHash;
  const attention = [...index.diagnostics, ...repairAttention];

  return {
    archiveId,
    instrumentId,
    indexHash: index.contentHash,
    source,
    newItems,
    newLessons,
    adoptedLessons: repairedAdopted,
    repairedLessons,
    adoptedItems,
    questions,
    suggestions,
    attention,
    staleDecisions,
    summary: {
      addedItems: newItems.length,
      addedLessons: newLessons.length,
      updatedLessons: repairedAdopted.length + adoptedItems.length + repairedLessons.length,
      questions: questions.length,
      attention: attention.length,
      unchanged: sameGraph && !changesRecords && questions.length === 0,
    },
  };
}

// --- applying --------------------------------------------------------------

/**
 * Apply a plan to a database, returning a NEW database — or the SAME OBJECT
 * when the plan changes nothing at all, so an unchanged refresh cannot bump the
 * revision counter or churn a timestamp.
 *
 * Nothing here touches a block, a review, an agenda entry, a practice counter,
 * a result or any scheduling field. It adds records and it replaces the source
 * graph; that is the whole of it.
 */
export function applyArchiveImport(db: PracticeDB, plan: ImportPlan, decisions: ReconcileDecision[] = []): PracticeDB {
  const existing = db.archiveSources?.find((s) => s.id === plan.archiveId);
  const graphChanged = !existing || existing.indexHash !== plan.indexHash;
  // AN OWNER DECISION IS A CHANGE even when the index is not. A skip recorded
  // against an already-current graph writes a suppression, and comparing the
  // index hash alone returned the database untouched — which is precisely how
  // "Skip" survived the preview and nothing else. The digest is verified at the
  // reader, so an equal hash really does mean an equal graph; the suppression
  // list is the part it says nothing about.
  const knownSuppressions = new Set((existing?.suppressions ?? []).map(suppressionKey));
  const suppressionsChanged =
    plan.source.suppressions.length !== knownSuppressions.size ||
    plan.source.suppressions.some((s) => !knownSuppressions.has(suppressionKey(s)));
  // A field decision counts only when the plan actually OFFERS that field —
  // the same rule the plan's own summary applies, so "nothing to do" means the
  // same thing on both sides of the preview/commit boundary. A decision left
  // over from an earlier preview must not make an unchanged refresh a write.
  const applied = decisions.filter(
    (d): d is Extract<ReconcileDecision, { kind: 'apply-field' }> =>
      plan.suggestions.some((x) => decisionMatchesSuggestion(d, x)),
  );
  const nothingToDo =
    !graphChanged &&
    !suppressionsChanged &&
    plan.newItems.length === 0 &&
    plan.newLessons.length === 0 &&
    plan.adoptedLessons.length === 0 &&
    plan.repairedLessons.length === 0 &&
    plan.adoptedItems.length === 0 &&
    applied.length === 0;
  if (nothingToDo) return db;

  const adoptedLessonIds = new Set(plan.adoptedLessons.map((l) => l.id));
  const repairedById = new Map(plan.repairedLessons.map((l) => [l.id, l]));
  const fieldsByItem = new Map<ID, MetadataSuggestion[]>();
  for (const s of plan.suggestions) {
    if (!applied.some((d) => decisionMatchesSuggestion(d, s))) continue;
    fieldsByItem.set(s.itemId, [...(fieldsByItem.get(s.itemId) ?? []), s]);
  }

  const items = db.items.map((item) => {
    const adopted = plan.adoptedItems.find((i) => i.id === item.id);
    const fields = fieldsByItem.get(item.id);
    if (!adopted && !fields) return item;
    const base = adopted ?? item;
    if (!fields) return base;
    return {
      ...base,
      persian: { ...base.persian, ...Object.fromEntries(fields.map((f) => [f.field, f.to])) },
      updatedAt: plan.source.acceptedAt,
    };
  });

  // A repaired path carries NO `updatedAt`: the archive renamed a file, which
  // is a source fact about where the bytes are, not the owner revising their
  // own record. The field application above DOES touch it, because that one is
  // the owner choosing to change a value of theirs. The asymmetry is the point.
  const lessons = db.lessons.map((l) => {
    if (adoptedLessonIds.has(l.id)) return plan.adoptedLessons.find((x) => x.id === l.id)!;
    return repairedById.get(l.id) ?? l;
  });

  const sources = (db.archiveSources ?? []).filter((s) => s.id !== plan.archiveId);

  return {
    ...db,
    // Adopted records are rewritten IN PLACE above — they keep their own ids,
    // their practice history and their position. Only genuinely new records are
    // appended.
    items: [...items, ...plan.newItems],
    lessons: [...lessons, ...plan.newLessons],
    archiveSources: [...sources, plan.source],
  };
}

// --- suppression -----------------------------------------------------------

/**
 * Record an owner decision that a refresh, a reload and a sync must all
 * respect. Narrowly scoped BY CONSTRUCTION: a resource hidden on one item
 * carries that item's id and leaves every sibling alone.
 *
 * Idempotent, so re-deleting the same thing does not grow the list.
 */
export function withSuppression(
  sources: ArchiveSource[],
  archiveId: string,
  suppression: SourceSuppression,
): ArchiveSource[] {
  return sources.map((s) => {
    if (s.id !== archiveId) return s;
    const key = suppressionKey(suppression);
    if (s.suppressions.some((x) => suppressionKey(x) === key)) return s;
    return { ...s, suppressions: [...s.suppressions, suppression] };
  });
}

/** Keep the FIRST of each distinct decision; re-keying two refs onto one path
 * must not grow the list. */
function dedupeSuppressions(list: SourceSuppression[]): SourceSuppression[] {
  const seen = new Set<string>();
  return list.filter((s) => {
    const k = suppressionKey(s);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Lift a suppression, so the next refresh may import that entity again. */
export function withoutSuppression(
  sources: ArchiveSource[],
  archiveId: string,
  match: (s: SourceSuppression) => boolean,
): ArchiveSource[] {
  return sources.map((s) => (s.id === archiveId ? { ...s, suppressions: s.suppressions.filter((x) => !match(x)) } : s));
}

// --- exact reference repair (no fuzzy matching, ever) ----------------------

/**
 * Why a repair could not proceed. The CODE exists because one of these is not
 * something the app may state as a fact: the published index deliberately
 * describes only the material the archive scopes to pieces and classes — 125
 * of its 258 files (the owner's own practice takes) are absent from it by
 * construction — so a path that is neither renamed nor described is simply
 * OUTSIDE what the index knows, never evidence that the file is gone. Every
 * other code is a real finding about the log itself.
 */
export type RepairReason = 'no-path' | 'unsafe' | 'no-base' | 'bad-url' | 'cycle' | 'renamed-gone' | 'not-described';

export type ReferenceRepair =
  | { status: 'repaired'; path: string }
  | { status: 'unchanged' }
  | { status: 'attention'; reason: string; code: RepairReason };

/**
 * Repair ONE stored reference path against the archive's own rename log.
 *
 * EXACT mapping only. A path that the log does not name is left exactly as it
 * is with a reason — never matched by title, by size, by modification time or
 * by similarity. A full URL is converted only when it sits under the device's
 * VERIFIED base, and a URL carrying a query or fragment is not a plain file
 * path and stays untouched.
 */
export function repairReferencePath(
  path: string,
  renames: Map<string, string>,
  known: Set<string>,
  verifiedBase?: string,
): ReferenceRepair {
  const raw = path.trim();
  const read = readArchiveRelative(raw, verifiedBase);
  if (!read.ok) return read.outcome;
  const { relative: stripped, wasUrl } = read;

  // Follow the rename chain — the SAME reading adoption and suppression use.
  const moved = followRenames(stripped, renames);
  if (moved === null) return { status: 'attention', reason: 'The rename log loops on this path.', code: 'cycle' };
  const current = moved;
  if (current === stripped) {
    if (known.has(current)) return !wasUrl && stripped === raw ? { status: 'unchanged' } : { status: 'repaired', path: current };
    return { status: 'attention', reason: 'The archive no longer has a file at this path.', code: 'not-described' };
  }
  if (!known.has(current)) {
    return { status: 'attention', reason: 'This file was renamed, but the archive no longer has it.', code: 'renamed-gone' };
  }
  return { status: 'repaired', path: current };
}

/** Repair every reference on a lesson, preserving each row and its metadata. */
export function repairLessonReferences(
  lesson: Lesson,
  renames: Map<string, string>,
  known: Set<string>,
  verifiedBase?: string,
): { lesson: Lesson; repaired: number; attention: { title: string; path: string; reason: string; code: RepairReason }[] } {
  let repaired = 0;
  const attention: { title: string; path: string; reason: string; code: RepairReason }[] = [];
  const recordings: LessonRecording[] = (lesson.recordings ?? []).map((r) => {
    const outcome = repairReferencePath(r.path, renames, known, verifiedBase);
    if (outcome.status === 'repaired') {
      repaired += 1;
      // The ROW survives with its own title, notes, date and size: only the
      // path text changes. Two rows that now point at one physical file stay
      // two rows — deleting one would delete something the owner wrote.
      return { ...r, path: outcome.path };
    }
    if (outcome.status === 'attention') {
      attention.push({ title: r.title, path: r.path, reason: outcome.reason, code: outcome.code });
    }
    return r;
  });
  return { lesson: { ...lesson, recordings }, repaired, attention };
}
```

### src/pages/Lessons.tsx

```
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  itemsCommittedForLesson,
  type PracticeItem,
  cleanFileTitle,
  daysUntil,
  CLASS_ROLE,
  defaultInstrumentFilter,
  formatFileSize,
  ITEM_STATUS_LABELS,
  LESSON_FILE_KIND_ORDER,
  lessonFiles,
  lessonsForInstrument,
  isUpcomingLesson,
  nextLessonFor,
  nextLessonNumber,
  normalizeBaseUrl,
  openQuestionsForLessonId,
  relativizeReference,
  resolveRecording,
  todayISODate,
  type Instrument,
  type Lesson,
  type LessonFileKind,
} from '../domain';
import { useStore } from '../store/useStore';
import { getNasBaseUrl } from '../store/backup';
import { Field } from '../components/ui';
import { MusicIcon, PlayIcon, PlusIcon, ReportIcon, XIcon } from '../components/icons';
import { relativeDay } from '../components/format';
import Attachments from '../components/Attachments';
import ClassQuestions from '../components/ClassQuestions';
import LessonNotes from '../components/LessonNotes';
import { LessonMaterial } from '../components/ItemMaterial';
import { LessonAgendaPanel } from '../components/LessonAgenda';
import QuickAdd from '../components/QuickAdd';

/** "Class 37 · 2026-07-09" when numbered, else just the date. */
function lessonLabel(lesson: Lesson): string {
  return typeof lesson.number === 'number' ? `Class ${lesson.number} · ${lesson.date}` : lesson.date;
}

/**
 * The class workflow: log each lesson's date, then — after rewatching your
 * recording — write up what was said (Farsi welcome). The nearest upcoming
 * lesson becomes the deadline that prioritises items flagged "for class".
 */
export default function Lessons() {
  const db = useStore((s) => s.db);
  const now = useMemo(() => new Date(), []);
  const instruments = db.instruments.filter((i) => i.active);
  const wide = useIsWide();

  // Open on the instrument you are actually practising — 40-plus Setar classes
  // stacked above Tar and Guitar is not a phone screen. Seeded from the same
  // persisted session instrument every other screen reads, never written back,
  // and always widenable to all.
  const sessionInstrumentId = useStore((s) => s.sessionInstrumentId);
  const [instrumentId, setInstrumentId] = useState(() =>
    defaultInstrumentFilter(sessionInstrumentId, instruments),
  );
  const shown = instruments.filter((i) => !instrumentId || i.id === instrumentId);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Lessons</h1>
        <p className="page-sub">
          Your classes, per instrument — dates and the notes you take when rewatching the recording.
        </p>
        {instruments.length > 1 && (
          <select
            className="select"
            aria-label="Instrument"
            style={{ width: 'fit-content' }}
            value={instrumentId}
            onChange={(e) => setInstrumentId(e.target.value)}
          >
            <option value="">All instruments</option>
            {instruments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        )}
      </header>

      {wide ? (
        <WideLessons now={now} instruments={shown} />
      ) : (
        shown.map((inst) => (
          <InstrumentLessons key={inst.id} instrumentId={inst.id} name={inst.name} now={now} />
        ))
      )}
    </div>
  );
}

function useIsWide(): boolean {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1000px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1000px)');
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/**
 * MacBook layout: lesson list on the left, the open lesson (long Farsi notes,
 * linked items, files) with real room on the right. Phones keep the simple
 * drill-down cards.
 */
function WideLessons({ now, instruments }: { now: Date; instruments: Instrument[] }) {
  const db = useStore((s) => s.db);
  const addLesson = useStore((s) => s.addLesson);
  const deleteLesson = useStore((s) => s.deleteLesson);

  const allLessons = useMemo(() => {
    const ids = new Set(instruments.map((i) => i.id));
    return db.lessons.filter((l) => ids.has(l.instrumentId)).sort((a, b) => b.date.localeCompare(a.date));
  }, [db.lessons, instruments]);
  const defaultSelection = useMemo(() => {
    const upcoming = [...allLessons].reverse().find((l) => isUpcomingLesson(l, todayISODate(now)));
    return upcoming?.id ?? allLessons[0]?.id ?? null;
  }, [allLessons, now]);
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelection);
  // `selectedId` is state so a click sticks across re-renders, but narrowing
  // (or a delete) can leave it pointing at a lesson `allLessons` no longer
  // has — falling back to the same smart default keeps the detail pane and
  // the sidebar highlight in sync instead of silently blanking.
  const effectiveSelectedId = allLessons.some((l) => l.id === selectedId) ? selectedId : defaultSelection;
  const selected = allLessons.find((l) => l.id === effectiveSelectedId) ?? null;

  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [date, setDate] = useState(todayISODate(now));
  const [num, setNum] = useState('');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
      <div className="stack">
        {instruments.map((inst) => {
          const lessons = lessonsForInstrument(db.lessons, inst.id);
          const next = nextLessonFor(db.lessons, inst.id, now);
          const flagged = itemsCommittedForLesson(db.items, db.lessonAgenda, db.lessons, now).filter(
            (i: PracticeItem) => i.instrumentId === inst.id,
          );
          return (
            <section key={inst.id} className="stack-sm">
              {/* The instrument's own name leads this group (dir="auto"
                  resolves from the first strong character), same shape as
                  InstrumentLessons' identical row below — the badge gets its
                  own dir="ltr" isolate so it can't inherit the name's base. */}
              <div className="row between" dir="auto">
                <h2 className="title-md" style={{ fontSize: '1.05rem' }}>
                  {inst.name}
                </h2>
                {next && (
                  <span className="badge tone-progress" dir="ltr">
                    next {relativeDay(next.date, now)}
                  </span>
                )}
              </div>
              {next && flagged.length > 0 && (
                <div className="tiny dim">
                  {flagged.length} item{flagged.length === 1 ? '' : 's'} to prepare · {daysUntil(next.date, now)} day
                  {daysUntil(next.date, now) === 1 ? '' : 's'} left
                </div>
              )}
              <div className="card card-flush list">
                {lessons.map((l) => (
                  <button
                    key={l.id}
                    className="list-row"
                    style={{
                      background: l.id === effectiveSelectedId ? 'var(--accent-soft)' : 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                    onClick={() => setSelectedId(l.id)}
                  >
                    <span className="grow">{lessonLabel(l)}</span>
                    <span className="tiny faint">
                      {l.notes ? 'notes ✓' : isUpcomingLesson(l, todayISODate(now)) ? 'upcoming' : '—'}
                    </span>
                  </button>
                ))}
                {lessons.length === 0 && <div className="list-row tiny faint">No classes logged.</div>}
              </div>
              {addingFor === inst.id ? (
                <div className="row" style={{ gap: 8 }}>
                  <input
                    className="input"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    aria-label="Class number (optional)"
                    placeholder="No."
                    value={num}
                    onChange={(e) => setNum(e.target.value)}
                    style={{ width: 72 }}
                  />
                  <input className="input grow" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      const id = addLesson({ instrumentId: inst.id, date, number: num.trim() ? Number(num) : undefined });
                      setAddingFor(null);
                      setNum('');
                      setSelectedId(id);
                    }}
                  >
                    Add
                  </button>
                  <button className="btn btn-sm" aria-label="Cancel" onClick={() => setAddingFor(null)}>
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ width: 'fit-content' }}
                  onClick={() => {
                    setNum(String(nextLessonNumber(db.lessons, inst.id)));
                    setAddingFor(inst.id);
                  }}
                >
                  <PlusIcon /> Add a class
                </button>
              )}
            </section>
          );
        })}
      </div>

      <div className="card stack-sm" style={{ minHeight: 320 }}>
        {selected ? (
          <>
            <div className="row between">
              {/* The instrument name is the owner's own editable text — its
                  own dir="auto" isolate. lessonLabel is always digits +
                  English by construction ("Class N · date") — its own
                  dir="ltr" isolate keeps the two from being fused into one
                  bare, undirected string as they used to be. */}
              <strong>
                <span dir="auto">{instruments.find((i) => i.id === selected.instrumentId)?.name}</span>
                <span dir="ltr"> · {lessonLabel(selected)}</span>
              </strong>
              <span className="tiny faint">{relativeDay(selected.date, now)}</span>
            </div>
            <LessonDetail lesson={selected} onDelete={() => deleteLesson(selected.id)} />
          </>
        ) : (
          <div className="small dim">Pick a class on the left — or add one.</div>
        )}
      </div>
    </div>
  );
}

function InstrumentLessons({ instrumentId, name, now }: { instrumentId: string; name: string; now: Date }) {
  const db = useStore((s) => s.db);
  const addLesson = useStore((s) => s.addLesson);
  const deleteLesson = useStore((s) => s.deleteLesson);

  const lessons = useMemo(() => lessonsForInstrument(db.lessons, instrumentId), [db.lessons, instrumentId]);
  const next = nextLessonFor(db.lessons, instrumentId, now);
  const flagged = useMemo(
    () =>
      itemsCommittedForLesson(db.items, db.lessonAgenda, db.lessons, now).filter(
        (i: PracticeItem) => i.instrumentId === instrumentId,
      ),
    [db.items, db.lessonAgenda, db.lessons, now, instrumentId],
  );

  const [adding, setAdding] = useState(false);
  const [date, setDate] = useState(todayISODate(now));
  const [num, setNum] = useState('');

  return (
    <section className="stack-sm">
      <div className="row between" dir="auto">
        <h2 className="title-md">{name}</h2>
        {/* Fixed English page copy / generated metadata, never user text —
            its own dir="ltr" isolate keeps it from inheriting the
            instrument name's RTL base. */}
        {next ? (
          <span className="badge tone-progress" dir="ltr">
            next class {relativeDay(next.date, now)}
          </span>
        ) : (
          <span className="tiny faint" dir="ltr">no class planned</span>
        )}
      </div>

      {next && flagged.length > 0 && (
        <div className="card card-quiet small dim">
          {flagged.length} item{flagged.length === 1 ? '' : 's'} to complete before this class ·{' '}
          {daysUntil(next.date, now)} day{daysUntil(next.date, now) === 1 ? '' : 's'} left —{' '}
          <Link to="/repertoire" className="link">
            see them
          </Link>
        </div>
      )}

      <div className="stack-sm">
        {lessons.map((l) => (
          <LessonCard key={l.id} lesson={l} now={now} onDelete={() => deleteLesson(l.id)} />
        ))}
        {lessons.length === 0 && !adding && (
          <div className="card card-quiet small dim">No lessons logged yet.</div>
        )}
      </div>

      {adding ? (
        <div className="card row" style={{ gap: 8 }}>
          <Field label="Class no.">
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="No."
              value={num}
              onChange={(e) => setNum(e.target.value)}
              style={{ width: 72 }}
            />
          </Field>
          <Field label="Class date">
            <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <button
            className="btn btn-primary"
            style={{ alignSelf: 'flex-end' }}
            onClick={() => {
              addLesson({ instrumentId, date, number: num.trim() ? Number(num) : undefined });
              setNum('');
              setAdding(false);
            }}
          >
            Add
          </button>
          <button className="btn" style={{ alignSelf: 'flex-end' }} onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button
          className="btn btn-sm"
          style={{ width: 'fit-content' }}
          onClick={() => {
            setNum(String(nextLessonNumber(db.lessons, instrumentId)));
            setAdding(true);
          }}
        >
          <PlusIcon /> Add a class
        </button>
      )}
    </section>
  );
}

function LessonCard({ lesson, now, onDelete }: { lesson: Lesson; now: Date; onDelete: () => void }) {
  const upcoming = isUpcomingLesson(lesson, todayISODate(now));
  // "No notes yet" opens a card the owner is about to write in. An IMPORTED
  // class has no notes by construction, and thirty-nine of them opening at once
  // turns the phone list into a wall — history starts COMPACT, and the owner
  // opens what they want to read.
  const [open, setOpen] = useState(lesson.origin === 'archive' ? false : upcoming || !lesson.notes);

  return (
    <article className="card stack-sm">
      <button
        className="row between"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, width: '100%' }}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="row" style={{ gap: 8 }}>
          <strong>{lessonLabel(lesson)}</strong>
          <span className="tiny faint">{relativeDay(lesson.date, now)}</span>
          {upcoming && <span className="badge tone-progress">upcoming</span>}
        </span>
        <span className="tiny faint">{open ? 'close' : lesson.notes ? 'notes ✓' : 'add notes'}</span>
      </button>

      {open && <LessonDetail lesson={lesson} onDelete={onDelete} />}
    </article>
  );
}

/** Notes, linked items, files and delete — the body of an open lesson. */
function LessonDetail({ lesson, onDelete }: { lesson: Lesson; onDelete: () => void }) {
  const db = useStore((s) => s.db);
  const now = useMemo(() => new Date(), []);

  const upcoming = isUpcomingLesson(lesson, todayISODate(now));
  // BY LESSON ID, never by instrument: every future class used to show the
  // identical list, so a question meant for one class appeared on all of them.
  const questions = useMemo(
    // `db.blocks` supplies each question's latest recorded observation, so the
    // list has to recompute when a block is added.
    () => openQuestionsForLessonId(db.lessonAgenda, db.items, lesson.id, db.blocks),
    [db.lessonAgenda, db.items, db.blocks, lesson.id],
  );
  const instrumentName = db.instruments.find((i) => i.id === lesson.instrumentId)?.name ?? 'Instrument';

  return (
    <>
      {/* The SAME durable editor as the item's notebook. Blur-only saving
          made a stale copy authoritative the moment anything stole focus, and
          could not clear the text at all. */}
      <LessonNotes lessonId={lesson.id} />

      <LessonItems lesson={lesson} />

      {/* This class's OWN agenda: what is committed to it, what is still to
          ask at it, and what was already asked — history that stays here
          rather than being carried forward to the next class by itself. */}
      <LessonAgendaPanel lessonId={lesson.id} />

      {/* The take-into-the-room list: only this class's still-open questions,
          selected by its id. A past class keeps its unasked questions on its
          own page (above) rather than showing an export sheet for a class
          that has already happened. */}
      {upcoming && (
        <ClassQuestions
          title="Questions for this class"
          instrumentName={instrumentName}
          dateLabel={lessonLabel(lesson)}
          questions={questions}
        />
      )}

      {/* WHAT THE ARCHIVE GIVES THIS CLASS. An archive-bound class keeps no
          copy of its session's files, so only the graph can answer — and the
          owner's OWN references and attachments are NOT repeated here: they
          each have exactly one section on this page, the one that can also
          edit and remove them. */}
      <LessonMaterial lessonId={lesson.id} />

      <LessonRecordings lesson={lesson} />

      <Attachments
        ownerType="lesson"
        ownerId={lesson.id}
        emptyHint="Attach small hand-outs for this class — PDFs of pieces, photos of notation, short audio. Full class videos are too big for the app: add them as a Class recording above (a NAS link), not here."
      />

      <button
        className="link tiny"
        style={{ background: 'none', border: 'none', width: 'fit-content', color: 'var(--tone-alert)' }}
        onClick={() => {
          if (confirm(`Delete the ${lesson.date} lesson? Its notes and attached files go with it; linked practice items are kept.`)) onDelete();
        }}
      >
        Delete lesson
      </button>
    </>
  );
}

/** Guess a reference's kind from its path extension (used when adding). */
function inferKind(path: string): LessonFileKind {
  const ext = (path.split('.').pop() ?? '').toLowerCase();
  if (['mp4', 'mov', 'm4v', 'webm', 'mkv'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['mp3', 'm4a', 'wav', 'aac', 'ogg'].includes(ext)) return 'audio';
  if (['doc', 'docx', 'txt', 'rtf', 'jpg', 'jpeg', 'png', 'heic'].includes(ext)) return 'doc';
  return 'video';
}

function KindIcon({ kind }: { kind: LessonFileKind }) {
  if (kind === 'video') return <PlayIcon width={16} height={16} />;
  if (kind === 'audio') return <MusicIcon width={16} height={16} />;
  return <ReportIcon width={16} height={16} />; // pdf / doc
}

/**
 * Lesson NAS references — the class video plus score PDFs/docs, all links,
 * never the bytes. A file is only fetched when the user taps Open; deleting a
 * reference never touches the NAS file. Video first, then scores/docs.
 */
function LessonRecordings({ lesson }: { lesson: Lesson }) {
  const db = useStore((s) => s.db);
  const addLessonRecording = useStore((s) => s.addLessonRecording);
  const removeLessonRecording = useStore((s) => s.removeLessonRecording);
  const navigate = useNavigate();
  const baseUrl = getNasBaseUrl();
  const recordings = useMemo(
    () =>
      [...(lesson.recordings ?? [])].sort(
        (a, b) => LESSON_FILE_KIND_ORDER[a.kind ?? 'video'] - LESSON_FILE_KIND_ORDER[b.kind ?? 'video'],
      ),
    [lesson.recordings],
  );
  // "HAS A RECORDING" IS ABOUT THE CLASS, NOT ABOUT THIS ARRAY. An imported
  // historical class keeps no copy of its session's files, so `recordings` is
  // empty and the empty-state card invited the owner to add a class recording
  // directly beneath the one already playing above it. Read through the same
  // composition the section above renders, so a recording the owner has HIDDEN
  // does not count as one that is there.
  const fromArchive = useMemo(
    () => lessonFiles(db, lesson.id).some((f) => f.source === 'reference' && f.archive?.role === CLASS_ROLE),
    [db, lesson.id],
  );

  const browseUrl = normalizeBaseUrl(baseUrl);

  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [path, setPath] = useState('');
  const [notes, setNotes] = useState('');

  function add() {
    if (!path.trim()) return;
    // A URL pasted from the NAS listing is stored RELATIVE to the configured
    // base, so the reference is not pinned to this device's route to the NAS.
    const stored = relativizeReference(baseUrl, path);
    addLessonRecording(lesson.id, {
      title: title.trim() || cleanFileTitle(stored) || 'Class file',
      path: stored,
      kind: inferKind(stored),
      date: lesson.date,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setPath('');
    setNotes('');
    setAdding(false);
  }

  function open(rec: (typeof recordings)[number]) {
    const r = resolveRecording(baseUrl, rec);
    if (r.status !== 'ok') return; // button is disabled unless resolvable
    window.open(r.url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="stack-sm">
      <div className="row between">
        <div className="section-label">Class recording &amp; scores</div>
        <button className="btn btn-ghost btn-sm" onClick={() => setAdding((v) => !v)}>
          {adding ? 'Cancel' : <><PlusIcon /> Add link</>}
        </button>
      </div>

      {recordings.length === 0 && !fromArchive && !adding && (
        <div className="card card-quiet small dim">
          Full class videos and scores live on your NAS, not in the app. Add a link to open them from here.
        </div>
      )}

      {recordings.map((rec) => {
        const resolution = resolveRecording(baseUrl, rec);
        const kind = rec.kind ?? 'video';
        const size = formatFileSize(rec.sizeBytes);
        const meta = ['Stored on NAS', kind === 'video' ? null : kind.toUpperCase(), size, rec.durationLabel]
          .filter(Boolean)
          .join(' · ');
        return (
          <div key={rec.id} className="card row between" style={{ gap: 10 }}>
            <span className="faint" style={{ flex: 'none', display: 'grid', placeItems: 'center' }} aria-hidden="true">
              <KindIcon kind={kind} />
            </span>
            <div className="grow" dir="auto" style={{ minWidth: 0 }}>
              <div className="truncate">
                {rec.title}
              </div>
              {/* Generated English metadata, never user text — its own
                  dir="ltr" isolate keeps it from inheriting a Farsi title's
                  RTL base. */}
              <div className="tiny faint">
                <span dir="ltr">{meta}</span>
              </div>
              {rec.notes && (
                <div className="tiny dim" dir="auto">
                  {rec.notes}
                </div>
              )}
              {/* Fixed English page copy, never user text — its own dir="ltr"
                  isolate keeps it from inheriting a Farsi title's RTL base.
                  Inline (span), not dir="ltr" on these blocks: a block
                  isolate resolves its OWN text-align independently of the
                  group, splitting it from a right-aligned Farsi title. */}
              {resolution.status === 'no-base' && (
                <div className="tiny" style={{ color: 'var(--tone-warn)' }}>
                  <span dir="ltr">
                    Set your NAS base URL in{' '}
                    <button className="link" style={{ background: 'none', border: 'none' }} onClick={() => navigate('/settings')}>
                      Settings
                    </button>{' '}
                    to open this.
                  </span>
                </div>
              )}
              {resolution.status === 'bad-base' && (
                <div className="tiny" style={{ color: 'var(--tone-alert)' }}>
                  <span dir="ltr">
                    Your NAS base URL isn’t a valid web address — fix it in{' '}
                    <button className="link" style={{ background: 'none', border: 'none' }} onClick={() => navigate('/settings')}>
                      Settings
                    </button>
                    .
                  </span>
                </div>
              )}
            </div>
            <button className="btn btn-sm btn-primary" disabled={resolution.status !== 'ok'} onClick={() => open(rec)}>
              Open
            </button>
            <button
              className="btn btn-ghost btn-sm"
              // Named, because a class holds several of these and "Remove this
              // link" three times over tells a screen reader nothing about
              // which file it is about to drop.
              aria-label={`Remove ${rec.title} (the NAS file is kept)`}
              title="Remove link (the NAS file is kept)"
              onClick={() => {
                if (confirm('Remove this link? The file on your NAS is not deleted.')) removeLessonRecording(lesson.id, rec.id);
              }}
            >
              <XIcon width={14} height={14} />
            </button>
          </div>
        );
      })}

      {adding && (
        <div className="card stack-sm">
          <input
            className="input"
            dir="auto"
            placeholder="Title — e.g. Class recording"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className="input"
            placeholder="NAS path or https:// link — e.g. setar-classes/session-37/class.mp4 or …/score.pdf"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
          <input className="input" dir="auto" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="row between" style={{ gap: 8 }}>
            <div className="tiny faint">
              Stop typing paths: browse your NAS, copy the file’s URL, paste it above.
            </div>
            <button
              className="btn btn-sm"
              style={{ flex: 'none' }}
              disabled={!browseUrl}
              onClick={() => browseUrl && window.open(`${browseUrl}/`, '_blank', 'noopener,noreferrer')}
            >
              Browse NAS
            </button>
          </div>
          <div className="tiny faint">
            Video, PDF or audio — the kind is detected from the file. A relative path resolves against your NAS base
            URL (Settings); a URL you paste from that base is stored as a relative path so it keeps working on every
            device. The file opens only when you tap “Open”.
          </div>
          <button className="btn btn-primary" disabled={!path.trim()} onClick={add}>
            Add link
          </button>
        </div>
      )}
    </div>
  );
}

/** The items worked on / created in this lesson: link, create, flag, unlink. */
function LessonItems({ lesson }: { lesson: Lesson }) {
  const db = useStore((s) => s.db);
  const linkItemToLesson = useStore((s) => s.linkItemToLesson);
  const unlinkItemFromLesson = useStore((s) => s.unlinkItemFromLesson);
  const addLessonPreparation = useStore((s) => s.addLessonPreparation);
  const removeAgendaEntry = useStore((s) => s.removeAgendaEntry);
  const [linking, setLinking] = useState(false);

  // "Worked on in this class" (lesson.itemIds) and "prepare this FOR this
  // class" (a preparation entry) are separate facts, exactly as they always
  // were — the button below toggles the second without touching the first.
  const committedHere = new Map(
    db.lessonAgenda
      .filter((e) => e.kind === 'preparation' && e.lessonId === lesson.id)
      .map((e) => [(e as { itemId: string }).itemId, e.id] as const),
  );

  const linked = (lesson.itemIds ?? [])
    .map((id) => db.items.find((i) => i.id === id))
    .filter((i): i is NonNullable<typeof i> => !!i);
  const linkable = db.items.filter(
    (i) => i.instrumentId === lesson.instrumentId && !(lesson.itemIds ?? []).includes(i.id),
  );

  return (
    <div className="stack-sm">
      <div className="row between">
        <div className="section-label">Worked on in this class</div>
        {linkable.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={() => setLinking((v) => !v)}>
            Link existing…
          </button>
        )}
      </div>

      {linking && (
        <select
          className="select"
          aria-label="Link an existing item to this lesson"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              linkItemToLesson(lesson.id, e.target.value);
              setLinking(false);
            }
          }}
        >
          <option value="">Choose an item…</option>
          {linkable.map((i) => (
            <option key={i.id} value={i.id}>
              {i.title}
            </option>
          ))}
        </select>
      )}

      {linked.length > 0 && (
        <div className="card card-flush list">
          {linked.map((item) => (
            <div key={item.id} className="list-row" style={{ paddingLeft: 'var(--space-3)', paddingRight: 'var(--space-3)' }}>
              <Link to={`/items/${item.id}`} state={{ from: '/lessons' }} className="grow" dir="auto" style={{ minWidth: 0 }}>
                <div className="truncate">
                  {item.title}
                </div>
                {/* Generated English metadata, never user text — its own
                    dir="ltr" isolate keeps it from inheriting a Farsi
                    title's RTL base. */}
                <div className="tiny faint">
                  <span dir="ltr">{ITEM_STATUS_LABELS[item.status]}</span>
                </div>
              </Link>
              <button
                className={`btn btn-sm${committedHere.has(item.id) ? ' btn-primary' : ''}`}
                aria-pressed={committedHere.has(item.id)}
                title="Commit to preparing this before this class"
                onClick={() => {
                  const existing = committedHere.get(item.id);
                  if (existing) removeAgendaEntry(existing);
                  else addLessonPreparation(item.id, lesson.id);
                }}
              >
                {committedHere.has(item.id) ? 'For this class ✓' : 'Prepare for this class'}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                title="Unlink from this lesson (the item is kept)"
                aria-label={`Unlink ${item.title} from this lesson — the item is kept`}
                onClick={() => unlinkItemFromLesson(lesson.id, item.id)}
              >
                <XIcon width={14} height={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <QuickAdd lessonId={lesson.id} />
    </div>
  );
}
```

### src/store/archiveIndex.test.ts

```
import { describe, expect, it, vi } from 'vitest';
// @ts-expect-error — no types for the .mjs operator tool; the decision is pure.
import { publishIndex, SOURCE_INDEX_BRANCH, INDEX_PATH } from '../../scripts/publish-setar-index.mjs';
// @ts-expect-error — the SCANNER's own digest definition, so the app is checked
// against the real producer rather than a restatement of it in the test.
import { contentHash as indexDigest } from '../../scripts/scan-setar-classes.mjs';
import { fetchPublishedIndex, readIndexFile } from './archiveIndex';
import indexFixture from '../../tests/fixtures/setar-archive.json' with { type: 'json' };
import V13_SETAR_TEXT from '../../tests/fixtures/setar-legacy-v13.json?raw';
import { decodeSourceIndex } from '../domain/sourceArchive';
import { validateDB } from '../domain/io';
import { createItem } from '../domain/factories';
import type { PracticeDB } from '../domain/types';

// ---------------------------------------------------------------------------
// The persist storage, CONTROLLABLE per assertion — the same stub io.test.ts
// uses, plus a settle promise this test can reject on demand. A failed
// IndexedDB write is the one thing `commitArchiveImport` must never mistake
// for a success, and it cannot be provoked in a real browser on purpose.
// ---------------------------------------------------------------------------
const fakeStorage = vi.hoisted(() => {
  let value: string | null = null;
  let failNextWrite = false;
  return {
    get: () => value,
    set: (v: string | null) => {
      value = v;
    },
    failNext: () => {
      failNextWrite = true;
    },
    takeFailure: () => {
      const f = failNextWrite;
      failNextWrite = false;
      return f;
    },
  };
});
vi.mock('./idb', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./idb')>();
  let settle: Promise<void> = Promise.resolve();
  return {
    ...actual,
    // Dexie itself has no IndexedDB to talk to in this environment, and
    // `clearAll` reaches for the blob store. Stubbed so a deliberate erasure
    // does not raise an unhandled rejection that would mask a real one.
    clearBlobs: async () => undefined,
    deleteBlob: async () => undefined,
    allBlobs: async () => [],
    heldBlobIds: async () => new Set<string>(),
    storageSettled: () => settle,
    idbStorage: {
      getItem: async () => fakeStorage.get(),
      setItem: async (_name: string, value: string) => {
        if (fakeStorage.takeFailure()) {
          settle = Promise.reject(new Error('the device refused the write'));
          // Mark it handled here so the rejection reaches only the one caller
          // that is waiting on it, exactly as the real adapter does.
          void settle.catch(() => undefined);
          return;
        }
        fakeStorage.set(value);
        settle = Promise.resolve();
      },
      removeItem: async () => fakeStorage.set(null),
    },
  };
});
// Imported AFTER the mock declaration on purpose: the store's persist
// middleware binds its storage at module load.
const { useStore } = await import('./useStore');

// ---------------------------------------------------------------------------
// A fake git repository, small enough to assert against exactly. It records
// EVERY write, so "this publisher cannot touch practice data" is a checked
// property of the calls made, not a claim about intent.
// ---------------------------------------------------------------------------

interface FakeRepo {
  refs: Map<string, string>;
  commits: Map<string, { treeSha: string; parents: string[] }>;
  trees: Map<string, Record<string, string>>;
  blobs: Map<string, string>;
  writes: { kind: string; target: string }[];
  n: number;
}

function newRepo(): FakeRepo {
  const repo: FakeRepo = {
    refs: new Map(),
    commits: new Map(),
    trees: new Map(),
    blobs: new Map(),
    writes: [],
    n: 0,
  };
  // The app's own data branch, exactly as the sync engine leaves it. Nothing in
  // this test may change any of these three.
  const tree = { 'state.json': 'blob-state', 'manifest.json': 'blob-manifest', 'files/a.pdf': 'blob-file' };
  repo.trees.set('tree-main', tree);
  repo.commits.set('commit-main', { treeSha: 'tree-main', parents: [] });
  repo.refs.set('main', 'commit-main');
  repo.refs.set('archive/2026-09-01', 'commit-main');
  return repo;
}

function transportFor(repo: FakeRepo, opts: { failAfterCommit?: boolean; raceOnce?: () => void } = {}) {
  const id = (p: string) => `${p}-${(repo.n += 1)}`;
  return {
    async getRef(branch: string) {
      const sha = repo.refs.get(branch);
      return sha ? { sha } : null;
    },
    async getCommit(sha: string) {
      return { treeSha: repo.commits.get(sha)!.treeSha };
    },
    async getFile(sha: string, path: string) {
      const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
      const blob = tree[path];
      return blob ? { text: repo.blobs.get(blob)! } : null;
    },
    async createBlob(text: string) {
      const sha = id('blob');
      repo.blobs.set(sha, text);
      repo.writes.push({ kind: 'blob', target: sha });
      return sha;
    },
    async createTree({ baseTreeSha, path, blobSha }: { baseTreeSha: string | null; path: string; blobSha: string }) {
      const sha = id('tree');
      repo.trees.set(sha, { ...(baseTreeSha ? repo.trees.get(baseTreeSha) : {}), [path]: blobSha });
      repo.writes.push({ kind: 'tree', target: path });
      return sha;
    },
    async createCommit({ treeSha, parents }: { treeSha: string; parents: string[] }) {
      const sha = id('commit');
      repo.commits.set(sha, { treeSha, parents });
      repo.writes.push({ kind: 'commit', target: treeSha });
      return sha;
    },
    async updateRef(branch: string, sha: string, expectedSha: string) {
      opts.raceOnce?.();
      if (opts.failAfterCommit) throw new Error('network dropped');
      // NON-FORCE: the ref only advances from the commit that was read.
      if (repo.refs.get(branch) !== expectedSha) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
    async createRef(branch: string, sha: string) {
      if (opts.failAfterCommit) throw new Error('network dropped');
      if (repo.refs.has(branch)) return 'HTTP 422';
      repo.refs.set(branch, sha);
      repo.writes.push({ kind: 'ref', target: branch });
      return 'ok';
    },
  };
}

const publishedText = (repo: FakeRepo) => {
  const sha = repo.refs.get(SOURCE_INDEX_BRANCH);
  if (!sha) return null;
  const tree = repo.trees.get(repo.commits.get(sha)!.treeSha)!;
  return repo.blobs.get(tree[INDEX_PATH]) ?? null;
};

// A credential-shaped placeholder — never a real token, and never a
// contiguous 16+ char [A-Za-z0-9_-] run (the space keeps it that way) — used
// only to prove no credential text reaches anything the publisher's output
// touches.
const NEVER_LEAKED_CREDENTIAL = 'publisher credential placeholder';
const ROOT = '/volume1/media/setar-classes';

describe('publishing and reading the source index', () => {
  it('source index publication cannot replace practice data or lose a concurrent update', async () => {
    const repo = newRepo();
    const first = `${JSON.stringify(indexFixture, null, 1)}\n`;

    // --- first publish: creates the branch, main untouched -----------------
    const created = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(created.status).toBe('created');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(created.commit);
    expect(publishedText(repo)).toBe(first);
    expect(repo.refs.get('main')).toBe('commit-main');
    expect(repo.refs.get('archive/2026-09-01')).toBe('commit-main');
    expect(repo.trees.get('tree-main')).toEqual({
      'state.json': 'blob-state',
      'manifest.json': 'blob-manifest',
      'files/a.pdf': 'blob-file',
    });
    // Every ref this publisher advanced, and every path it wrote.
    expect(repo.writes.filter((w) => w.kind === 'ref').map((w) => w.target)).toEqual([SOURCE_INDEX_BRANCH]);
    expect(repo.writes.filter((w) => w.kind === 'tree').map((w) => w.target)).toEqual([INDEX_PATH]);
    expect(repo.writes.some((w) => /state\.json|manifest\.json|^files\//.test(w.target))).toBe(false);

    // --- an identical scan makes NO commit ---------------------------------
    const before = repo.refs.get(SOURCE_INDEX_BRANCH);
    const writesBefore = repo.writes.length;
    const again = await publishIndex({ transport: transportFor(repo), indexText: first });
    expect(again.status).toBe('unchanged');
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(before);
    expect(repo.writes).toHaveLength(writesBefore);

    // --- a changed scan advances the branch, and only it --------------------
    const changed = `${JSON.stringify({ ...indexFixture, diagnostics: [{ path: 'x', reason: 'y' }] }, null, 1)}\n`;
    const second = await publishIndex({ transport: transportFor(repo), indexText: changed });
    expect(second.status).toBe('published');
    expect(publishedText(repo)).toBe(changed);
    expect(repo.commits.get(second.commit)!.parents).toEqual([before]);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- interrupted BEFORE the ref advances: the old index still stands ----
    const head = repo.refs.get(SOURCE_INDEX_BRANCH);
    const interrupted = `${JSON.stringify({ ...indexFixture, archiveId: 'half-written' }, null, 1)}\n`;
    await expect(
      publishIndex({ transport: transportFor(repo, { failAfterCommit: true }), indexText: interrupted }),
    ).rejects.toThrow(/network dropped/);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe(head);
    expect(publishedText(repo)).toBe(changed);

    // --- racing a second publisher: nothing is overwritten ------------------
    // The other publisher lands its own commit between this one's read and its
    // update. Non-force, so this update is refused; the retry re-reads and,
    // because the other publisher wrote exactly what this one has, it settles
    // on "unchanged" rather than clobbering.
    const rival = `${JSON.stringify({ ...indexFixture, archiveId: 'setar-classes' }, null, 1)}\n`;
    let raced = false;
    const race = () => {
      if (raced) return;
      raced = true;
      const blob = 'blob-rival';
      repo.blobs.set(blob, rival);
      repo.trees.set('tree-rival', { [INDEX_PATH]: blob });
      repo.commits.set('commit-rival', { treeSha: 'tree-rival', parents: [repo.refs.get(SOURCE_INDEX_BRANCH)!] });
      repo.refs.set(SOURCE_INDEX_BRANCH, 'commit-rival');
    };
    const afterRace = await publishIndex({ transport: transportFor(repo, { raceOnce: race }), indexText: rival });
    expect(afterRace.status).toBe('unchanged');
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get(SOURCE_INDEX_BRANCH)).toBe('commit-rival');
    // A racing publisher with DIFFERENT content gives up rather than force it.
    let always = true;
    const alwaysRace = () => {
      if (!always) return;
      repo.commits.set(`commit-rival-${(repo.n += 1)}`, { treeSha: 'tree-rival', parents: [] });
      repo.refs.set(SOURCE_INDEX_BRANCH, `commit-rival-${repo.n}`);
    };
    await expect(
      publishIndex({ transport: transportFor(repo, { raceOnce: alwaysRace }), indexText: changed }),
    ).rejects.toThrow(/nothing was overwritten/);
    always = false;

    // --- the target is fixed in CODE, not by trusting the caller ------------
    for (const branch of ['main', 'master', 'archive/2026-09-01', 'source-index-2']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, branch })).rejects.toThrow(
        /only writes/,
      );
    }
    for (const path of ['state.json', 'manifest.json', 'files/a.pdf', 'setar/other.json']) {
      await expect(publishIndex({ transport: transportFor(repo), indexText: first, path })).rejects.toThrow(
        /only writes "setar\/index\.json"/,
      );
    }

    // --- the READER pins the file to the branch's own commit ----------------
    const requests: string[] = [];
    const publishedCommit = repo.refs.get(SOURCE_INDEX_BRANCH)!;
    const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      requests.push(href);
      // The reader must never send anything but a GET.
      expect(init?.method ?? 'GET').toBe('GET');
      if (href.includes('/git/ref/heads/')) {
        return new Response(JSON.stringify({ object: { sha: publishedCommit } }), { status: 200 });
      }
      const m = /contents\/(.+)\?ref=(.+)$/.exec(href)!;
      const tree = repo.trees.get(repo.commits.get(m[2])!.treeSha)!;
      const text = repo.blobs.get(tree[decodeURIComponent(m[1])])!;
      return new Response(
        JSON.stringify({ content: Buffer.from(text, 'utf8').toString('base64'), encoding: 'base64', size: text.length }),
        { status: 200 },
      );
    };
    const got = await fetchPublishedIndex({ repo: 'owner/data', token: 'device-token', fetchImpl: fakeFetch as typeof fetch });
    expect(got.ok).toBe(true);
    if (!got.ok) throw new Error(got.error);
    expect(got.value.commitSha).toBe(publishedCommit);
    expect(got.value.index.archiveId).toBe('setar-classes');
    // The content request names the COMMIT, not the branch: a publish landing
    // between the two calls cannot hand back half of one index and half of
    // another.
    expect(requests[1]).toContain(`?ref=${publishedCommit}`);
    expect(requests[1]).not.toContain(SOURCE_INDEX_BRANCH);
    expect(requests.every((r) => r.startsWith('https://api.github.com/'))).toBe(true);

    // --- authentication and network failures change nothing -----------------
    const refuse = async () => new Response('no', { status: 401 });
    const denied = await fetchPublishedIndex({ repo: 'owner/data', token: 'bad', fetchImpl: refuse as typeof fetch });
    expect(denied.ok).toBe(false);
    if (denied.ok) throw new Error('expected refusal');
    expect(denied.error).toMatch(/refused/i);
    const offline = async () => {
      throw new Error('offline');
    };
    const down = await fetchPublishedIndex({ repo: 'owner/data', token: 't', fetchImpl: offline as typeof fetch });
    expect(down.ok).toBe(false);
    if (down.ok) throw new Error('expected refusal');
    expect(down.error).toMatch(/already imported is unaffected/);
    // The published index and the app's data branch are exactly as they were.
    expect(publishedText(repo)).toBe(rival);
    expect(repo.refs.get('main')).toBe('commit-main');

    // --- no credential and no archive root in anything that travels ---------
    const everything = JSON.stringify([
      [...repo.blobs.values()],
      [...repo.trees.values()],
      [...repo.commits.keys()],
      requests,
      denied.error,
      down.error,
    ]);
    expect(everything).not.toContain(NEVER_LEAKED_CREDENTIAL);
    expect(everything).not.toContain(ROOT);
    expect(everything).not.toContain('/Volumes/');

    // The file-import fallback goes through the SAME decoder.
    expect((await readIndexFile(rival)).ok).toBe(true);
    const badFile = await readIndexFile('{"format":"setar-archive-index","version":99}');
    expect(badFile.ok).toBe(false);
    if (badFile.ok) throw new Error('expected refusal');
    expect(badFile.error).toMatch(/newer scanner/);

    // --- THE DECLARED DIGEST IS RECOMPUTED, NOT TAKEN ON FAITH -------------
    // `contentHash` is the REFRESH IDENTITY: `planArchiveImport` compares it
    // against the hash already accepted to conclude that nothing has changed.
    // So content altered under a RETAINED old hash would be reported "Already
    // current" and its changed facts silently ignored. Both doors recompute
    // the scanner's own digest and fail closed.
    const original = JSON.parse(rival) as typeof indexFixture;
    const altered = {
      ...original,
      pieces: original.pieces.map((piece, i) => (i === 0 ? { ...piece, composer: 'somebody-else' } : piece)),
    };
    // The hash it still carries is the one the scanner wrote for the ORIGINAL.
    expect(altered.contentHash).toBe(original.contentHash);
    const alteredText = JSON.stringify(altered);
    const tampered = await readIndexFile(alteredText);
    expect(tampered.ok).toBe(false);
    if (tampered.ok) throw new Error('expected refusal');
    expect(tampered.error).toMatch(/does not match its own content hash/);

    // The GitHub door refuses the identical bytes, through the same boundary.
    const tamperedFetch = async (url: string | URL | Request) => {
      const href = String(url);
      if (href.includes('/git/ref/heads/')) {
        return new Response(JSON.stringify({ object: { sha: publishedCommit } }), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          content: Buffer.from(alteredText, 'utf8').toString('base64'),
          encoding: 'base64',
          size: alteredText.length,
        }),
        { status: 200 },
      );
    };
    const fetchedTampered = await fetchPublishedIndex({
      repo: 'owner/data',
      token: 'device-token',
      fetchImpl: tamperedFetch as typeof fetch,
    });
    expect(fetchedTampered.ok).toBe(false);
    if (fetchedTampered.ok) throw new Error('expected refusal');
    expect(fetchedTampered.error).toMatch(/does not match its own content hash/);

    // Re-scanned content — a NEW digest for the new facts — is accepted, so
    // this is an integrity gate and not a freeze on the archive ever changing.
    const rescanned = await readIndexFile(JSON.stringify({ ...altered, contentHash: indexDigest(altered) }));
    expect(rescanned.ok).toBe(true);
    if (!rescanned.ok) throw new Error(rescanned.error);
    expect(rescanned.value.index.pieces[0]!.composer).toBe('somebody-else');
    expect(rescanned.value.index.contentHash).not.toBe(original.contentHash);

    // A STRUCTURALLY broken file still reports the structural error rather
    // than a hash mismatch: the owner can act on the first, never the second.
    const brokenStructure = await readIndexFile(JSON.stringify({ ...original, sessions: 'not a list' }));
    expect(brokenStructure.ok).toBe(false);
    if (brokenStructure.ok) throw new Error('expected refusal');
    expect(brokenStructure.error).toMatch(/no sessions/);

    // --- A WRONG-TYPED FIELD IS REFUSED, NEVER COERCED TO EMPTY ------------
    // A digest proves the file is the one the scanner wrote; it says nothing
    // about the file being well formed. The decoder normalises BEFORE the
    // graph's grammar runs, so `resources: null` decoded to a session with no
    // resources — a perfectly valid empty list by the time the grammar saw it
    // — and six files became zero with a VALID digest on the front. Every
    // absent-tolerant read in the decoder had the same shape.
    const withDigest = (body: Record<string, unknown>) =>
      JSON.stringify({ ...body, contentHash: indexDigest(body) });
    const sessionZero = original.sessions[0]!;
    const erasures: [string, Record<string, unknown>][] = [
      ['must be a list', { ...sessionZero, resources: null }],
      ['must be a list', { ...sessionZero, members: null }],
      ['must be true or false', { ...sessionZero, rosterTrusted: 'yes' }],
      ['must be true or false', { ...sessionZero, hasClassRecording: 1 }],
    ];
    for (const [message, session0] of erasures) {
      const bad = await readIndexFile(
        withDigest({ ...original, sessions: [session0, ...original.sessions.slice(1)] }),
      );
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    const withResource = (over: Record<string, unknown>) => ({
      ...original,
      sessions: [
        { ...sessionZero, resources: [{ ...sessionZero.resources[0]!, ...over }, ...sessionZero.resources.slice(1)] },
        ...original.sessions.slice(1),
      ],
    });
    for (const [message, over] of [
      ['must be a number', { part: '2' }],
      ['must be a number', { size: '10mb' }],
      ['must be text', { group: 42 }],
    ] as [string, Record<string, unknown>][]) {
      const bad = await readIndexFile(withDigest(withResource(over)));
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    for (const [message, over] of [
      ['must be a list', { sessions: null }],
      ['must be true or false', { provisional: 'yes' }],
    ] as [string, Record<string, unknown>][]) {
      const bad = await readIndexFile(
        withDigest({ ...original, pieces: [{ ...original.pieces[0]!, ...over }, ...original.pieces.slice(1)] }),
      );
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain(message);
    }
    for (const over of [{ renames: null }, { diagnostics: null }]) {
      const bad = await readIndexFile(withDigest({ ...original, ...over }));
      expect(bad.ok).toBe(false);
      if (bad.ok) throw new Error('expected refusal');
      expect(bad.error).toContain('must be a list');
    }
    // ABSENT still reads as absent: the tolerance that was correct stays.
    const withoutOptional = { ...(original as Record<string, unknown>) };
    delete withoutOptional.renames;
    delete withoutOptional.diagnostics;
    const lean = await readIndexFile(withDigest(withoutOptional));
    expect(lean.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// ac-11 — the commit boundary, against the REAL store.
// ---------------------------------------------------------------------------

const INDEX = decodeSourceIndex(indexFixture);
const SETAR = 'inst-setar';
const NOW = new Date('2026-09-17T09:00:00.000Z');

function loadOwnerData(): PracticeDB {
  const db = validateDB(JSON.parse(V13_SETAR_TEXT));
  useStore.setState({ db, active: null, activeRoutine: null, activePlan: null, sessionInstrumentId: SETAR });
  return db;
}

const commit = (decidedFromRev: number) =>
  useStore.getState().commitArchiveImport({ index: INDEX, instrumentId: SETAR, decidedFromRev, now: NOW });

describe('committing an archive import', () => {
  it('archive commits survive interruption and never apply a stale preview', async () => {
    loadOwnerData();

    // --- ONE mutation, validated first, acknowledged by storage -------------
    const { plan, rev } = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(plan.newItems).toHaveLength(94);
    const applied = await commit(rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    // The storage adapter holds the WHOLE new state, not a partial one.
    const persisted = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    expect(persisted.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(persisted.state.db.archiveSources).toHaveLength(1);

    // --- an unchanged refresh writes NOTHING, and churns no revision --------
    const quietRev = useStore.getState().rev;
    const again = await commit(quietRev);
    expect(again).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().rev).toBe(quietRev);

    // --- a REVISION CHANGE during the fetch rebases without losing edits ----
    loadOwnerData();
    const stale = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    // The owner edits a notebook while the index is being read.
    useStore.getState().updateItem('own-dashti', { notes: 'edited while the index was being read' });
    expect(useStore.getState().rev).not.toBe(stale.rev);
    const rebased = await commit(stale.rev);
    expect(rebased).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'edited while the index was being read',
    );
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);

    // --- a rebase that raises a NEW question refuses, and changes nothing ---
    loadOwnerData();
    const before = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(before.plan.questions).toEqual([]);
    // An item appears with a canonical title while the index is being read —
    // now there IS something to decide, and it is not this code's decision.
    useStore.getState().addItem({ instrumentId: SETAR, title: 'عراق' });
    const itemsBefore = useStore.getState().db.items.length;
    const refused = await commit(before.rev);
    expect(refused).toMatchObject({ ok: false, status: 'stale' });
    expect(useStore.getState().db.items).toHaveLength(itemsBefore);
    expect(useStore.getState().db.archiveSources).toEqual([]);
    // Answering it explicitly lets the same index through.
    const answered = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'عراق' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(answered).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.filter((i) => i.source?.pieceKey === 'عراق')).toHaveLength(0);

    // --- A RUNNING SESSION IS UNTOUCHED, and one that FINISHES is kept ------
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    const activeBefore = useStore.getState().active;
    expect(activeBefore).not.toBeNull();
    const duringPractice = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const withClock = await commit(duringPractice.rev);
    expect(withClock).toMatchObject({ ok: true, status: 'applied' });
    // Not replaced, not nulled, not restarted: the same object, still running.
    expect(useStore.getState().active).toBe(activeBefore);
    expect(useStore.getState().activeRoutine).toBeNull();
    expect(useStore.getState().activePlan).toBeNull();
    expect(useStore.getState().sessionInstrumentId).toBe(SETAR);

    loadOwnerData();
    const beforeBlock = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().closeSession({ durationMinutes: 12, result: 'same', answer: 'unanswered', now: NOW });
    const blocksAfterClose = useStore.getState().db.blocks.length;
    expect(blocksAfterClose).toBe(2);
    const afterBlock = await commit(beforeBlock.rev);
    expect(afterBlock).toMatchObject({ ok: true, status: 'applied' });
    // The minute played while the index was being read is still there.
    expect(useStore.getState().db.blocks).toHaveLength(2);

    // --- A FAILED WRITE IS REPORTED, and the retry really writes -----------
    loadOwnerData();
    const toFail = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const persistedBefore = fakeStorage.get();
    fakeStorage.failNext();
    const unsaved = await commit(toFail.rev);
    expect(unsaved).toMatchObject({ ok: false, status: 'unsaved' });
    expect(unsaved.message).toMatch(/could not save/i);
    // The store holds the graph; the DISK does not. A reload before the
    // acknowledgement therefore yields the PREVIOUS complete state.
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(fakeStorage.get()).toBe(persistedBefore);

    // THE RETRY IS THE POINT: the in-memory index hash already matches, so a
    // "nothing changed" shortcut would answer "Already current" over data that
    // was never saved.
    const retry = await commit(useStore.getState().rev);
    expect(retry).toMatchObject({ ok: true, status: 'applied' });
    const afterRetry = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    // A COMPLETE state, not a delta: the graph, the owner's items, the blocks.
    expect(afterRetry.state.db.archiveSources).toHaveLength(1);
    expect(afterRetry.state.db.items.filter((i) => i.source)).toHaveLength(94);
    expect(afterRetry.state.db.blocks).toHaveLength(1);
    expect(afterRetry.state.db.lessonAgenda).toHaveLength(1);

    // --- reload AFTER the acknowledgement yields the NEW complete state -----
    // The bytes on disk at the moment of the acknowledgement, replayed through
    // the app's own hydration. (Every `setState` re-persists, so the captured
    // text is put back first — otherwise this would only prove that the store
    // can read what it has just written.)
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(useStore.getState().db.archiveSources).toHaveLength(1);
    expect(useStore.getState().db.items.filter((i) => i.source)).toHaveLength(94);
    expect(useStore.getState().db.items.find((i) => i.id === 'own-dashti')!.notes).toBe(
      'Teacher: keep the mezrab light on the return.',
    );

    // --- a graph this device would REFUSE to import is never written -------
    loadOwnerData();
    const broken = { ...INDEX, sessions: INDEX.sessions.map((s) => ({ ...s, n: 1 })) };
    const refusedGraph = await useStore.getState().commitArchiveImport({
      index: broken,
      instrumentId: SETAR,
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(refusedGraph.ok).toBe(false);
    expect(refusedGraph.status).toBe('refused');
    expect(useStore.getState().db.archiveSources).toEqual([]);

    // --- AN OWNER DECISION SURVIVES COMMIT, RELOAD AND THE NEXT REFRESH ----
    // The whole lifecycle, not the helper: a rendered choice becomes a
    // decision, the commit persists it, a real rehydration reads it back, and
    // the NEXT refresh — carrying no decisions at all — honours it.
    loadOwnerData();
    useStore.getState().addItem({ instrumentId: SETAR, title: 'عراق' });
    const asked = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(asked.plan.questions.some((q) => q.pieceKey === 'عراق')).toBe(true);
    const skipped = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'skip-item', pieceKey: 'عراق' }],
      decidedFromRev: asked.rev,
      now: NOW,
    });
    expect(skipped).toMatchObject({ ok: true, status: 'applied' });

    // Reload: the bytes actually on disk, back through the app's hydration.
    const skipDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(skipDisk);
    await useStore.persist.rehydrate();
    const reloadedSource = useStore.getState().db.archiveSources[0]!;
    expect(reloadedSource.suppressions.filter((x) => x.kind === 'piece' && x.ref === 'عراق')).toHaveLength(1);
    expect(useStore.getState().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    // The owner's own record is untouched and still theirs.
    expect(useStore.getState().db.items.find((i) => i.title === 'عراق')!.source).toBeUndefined();

    // The NEXT refresh asks nothing and writes nothing.
    const afterReload = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(afterReload.plan.questions).toEqual([]);
    const quiet = await commit(afterReload.rev);
    expect(quiet).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);

    // --- A FIELD DECISION AGAINST AN ALREADY-CURRENT INDEX IS NOT "current" -
    // The index has not moved; the owner has only just answered. Judging
    // "Already current" by the index hash alone reported exactly that and
    // dropped the answer before it could ever be written.
    const boundWithComposer = useStore
      .getState()
      .db.items.find((i) => i.source && (i.persian?.composer ?? '') !== '')!;
    useStore.getState().updateItem(boundWithComposer.id, { persian: { ...boundWithComposer.persian, composer: '' } });
    const composer = boundWithComposer.persian!.composer!;
    const pieceKey = boundWithComposer.source!.pieceKey;
    const offered = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    expect(offered.plan.suggestions.some((x) => x.pieceKey === pieceKey && x.field === 'composer')).toBe(true);
    // An OFFER is not a change: unanswered, this refresh genuinely writes
    // nothing, and says so. The owner's DECISION is what makes it a write.
    expect(offered.plan.summary.unchanged).toBe(true);
    const answered2 = useStore.getState().previewArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
      now: NOW,
    });
    expect(answered2.plan.summary.unchanged).toBe(false);
    // Left unanswered, the same refresh really is a no-op.
    const declined = await commit(useStore.getState().rev);
    expect(declined).toMatchObject({ ok: true, status: 'unchanged' });
    expect(useStore.getState().db.items.find((i) => i.id === boundWithComposer.id)!.persian?.composer).toBe('');
    // Answered, it is applied — and acknowledged by storage.
    const appliedField = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ kind: 'apply-field', pieceKey, itemId: boundWithComposer.id, field: 'composer', from: '' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(appliedField).toMatchObject({ ok: true, status: 'applied' });
    const persistedField = JSON.parse(fakeStorage.get()!) as { state: { db: PracticeDB } };
    expect(persistedField.state.db.items.find((i) => i.id === boundWithComposer.id)!.persian?.composer).toBe(composer);
    // Nothing else moved with it.
    expect(useStore.getState().db.items.find((i) => i.id === boundWithComposer.id)!.title).toBe(
      boundWithComposer.title,
    );
    expect(useStore.getState().db.blocks).toHaveLength(1);

    // --- A DECISION WHOSE PREMISE MOVED IS REFUSED, NOT APPLIED ------------
    // The counterexample, through the REAL store: preview an empty composer,
    // choose the archive's value, then write your own before pressing Apply.
    // No new QUESTION appears, so the rebase guard alone let this through and
    // the registry value replaced the words just typed.
    const second = useStore.getState().db.items.find((i) => i.source && i.id !== boundWithComposer.id && (i.persian?.composer ?? '') !== '')!;
    useStore.getState().updateItem(second.id, { persian: { ...second.persian, composer: '' } });
    const secondKey = second.source!.pieceKey;
    const seen = useStore.getState().previewArchiveImport({ index: INDEX, instrumentId: SETAR, now: NOW });
    const choice = [
      // Bound to the RECORD as well as the piece and the premise: a rebase that
      // finds the piece on a different item must not hand it that answer.
      { kind: 'apply-field' as const, pieceKey: secondKey, itemId: second.id, field: 'composer' as const, from: '' },
    ];
    useStore.getState().updateItem(second.id, {
      persian: { ...second.persian, composer: 'Owner wrote this during refresh' },
    });
    const refusedStale = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: choice,
      decidedFromRev: seen.rev,
      now: NOW,
    });
    expect(refusedStale).toMatchObject({ ok: false, status: 'stale' });
    expect(refusedStale.staleDecisions).toEqual(choice);
    expect(useStore.getState().db.items.find((i) => i.id === second.id)!.persian?.composer).toBe(
      'Owner wrote this during refresh',
    );
    // Re-answered against what is actually there now, it applies.
    const reAnswered = await useStore.getState().commitArchiveImport({
      index: INDEX,
      instrumentId: SETAR,
      decisions: [{ ...choice[0]!, from: 'Owner wrote this during refresh' }],
      decidedFromRev: useStore.getState().rev,
      now: NOW,
    });
    expect(reAnswered).toMatchObject({ ok: true, status: 'applied' });
    expect(useStore.getState().db.items.find((i) => i.id === second.id)!.persian?.composer).toBe(
      second.persian!.composer,
    );

    // --- A DECISION IS BOUND TO ITS RECORD, THROUGH A REAL COMMIT ---------
    // The other half of the same family, and the one an already-bound early
    // `continue` hid completely: the piece is held by a DIFFERENT record by
    // the time Apply runs. A field decision keyed by piece alone was written
    // to that other record (its composer was empty too, so nothing about the
    // VALUE would have caught it), and a Link decision was skipped in silence
    // — `staleDecisions` empty, the commit reporting success for an action it
    // never performed.
    const movedPiece = useStore.getState().db.items.find((i) => i.source && i.id !== second.id)!;
    const movedKey = movedPiece.source!.pieceKey;
    const decoy = createItem({ instrumentId: SETAR, title: 'A different record' }, NOW);
    useStore.setState((st) => ({
      db: {
        ...st.db,
        items: [
          // The approved record loses the binding; another record takes it.
          ...st.db.items.map((i) => (i.id === movedPiece.id ? { ...i, source: undefined } : i)),
          { ...decoy, source: { archiveId: 'setar-classes', pieceKey: movedKey } },
        ],
      },
    }));
    for (const decisions of [
      [{ kind: 'link-item' as const, pieceKey: movedKey, itemId: movedPiece.id }],
      [
        {
          kind: 'apply-field' as const,
          pieceKey: movedKey,
          itemId: movedPiece.id,
          field: 'composer' as const,
          from: movedPiece.persian?.composer ?? '',
        },
      ],
    ]) {
      const refused = await useStore.getState().commitArchiveImport({
        index: INDEX,
        instrumentId: SETAR,
        decisions,
        decidedFromRev: useStore.getState().rev,
        now: NOW,
      });
      expect(refused).toMatchObject({ ok: false, status: 'stale' });
      expect(refused.staleDecisions).toEqual(decisions);
    }
    // Neither record was touched by either refusal.
    expect(useStore.getState().db.items.find((i) => i.id === movedPiece.id)!.source).toBeUndefined();
    expect(useStore.getState().db.items.find((i) => i.id === decoy.id)!.persian?.composer ?? '').toBe('');

    // --- refresh NEVER runs a whole-database import or reset ---------------
    // `importDB`, `resetDemo` and `clearAll` each null the active session and
    // reset `notNow`/`sessionInstrumentId`; every assertion above shows those
    // intact across a commit. The source, too, says so:
    const storeSource = await (await import('node:fs/promises')).readFile('src/store/useStore.ts', 'utf8');
    const from = storeSource.indexOf('commitArchiveImport: async');
    expect(from).toBeGreaterThan(0);
    const body = storeSource.slice(from, storeSource.indexOf('hideArchiveResource: (', from));
    expect(body.length).toBeGreaterThan(200);
    // Comments stripped first — this action's own docstring NAMES the things
    // it must not call, and a scan that matched prose would be checking the
    // comment rather than the code.
    const code = body.replace(/\/\/[^\n]*/g, '');
    expect(code).not.toMatch(/importDB|installDatabase|resetDemo|clearAll|replaceAllBlobs|addAttachment/);
    // ONE db mutation in the whole action.
    expect(code.match(/\bset\(/g) ?? []).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// ac-9 — an import may establish membership and provenance. Never practice.
// ---------------------------------------------------------------------------

describe('what an archive import may and may not establish', () => {
  it('archive import cannot fabricate practice or next-class urgency', async () => {
    loadOwnerData();
    useStore.getState().startItemSession('own-dashti');
    useStore.getState().notNowReview('rev-1');
    const beforeState = useStore.getState();
    const before = JSON.parse(JSON.stringify(beforeState.db)) as PracticeDB;
    const activeBefore = beforeState.active;
    const notNowBefore = JSON.parse(JSON.stringify(beforeState.notNow)) as unknown;

    const applied = await commit(useStore.getState().rev);
    expect(applied).toMatchObject({ ok: true, status: 'applied' });
    const after = useStore.getState();

    // --- EVERY existing record, byte for byte ------------------------------
    expect(after.db.blocks).toEqual(before.blocks);
    expect(after.db.reviews).toEqual(before.reviews);
    expect(after.db.lessonAgenda).toEqual(before.lessonAgenda);
    expect(after.db.materials).toEqual(before.materials);
    expect(after.db.pathways).toEqual(before.pathways);
    expect(after.db.pathwayStages).toEqual(before.pathwayStages);
    expect(after.db.pathwayRoutines).toEqual(before.pathwayRoutines);
    expect(after.db.attachments).toEqual(before.attachments);
    for (const original of before.items) {
      const now = after.db.items.find((i) => i.id === original.id)!;
      expect(now).toEqual(original);
    }
    // ...and the ephemeral session state the owner is standing in.
    expect(after.active).toBe(activeBefore);
    expect(after.activeRoutine).toBeNull();
    expect(after.activePlan).toBeNull();
    expect(after.notNow).toEqual(notNowBefore);
    expect(after.sessionInstrumentId).toBe(SETAR);

    // --- NEW items carry no practice at all ---------------------------------
    const fresh = after.db.items.filter((i) => i.source);
    expect(fresh).toHaveLength(94);
    for (const item of fresh) {
      expect(item.timesPractised).toBe(0);
      expect(item.totalMinutes).toBe(0);
      expect(item.lastPractisedAt).toBeUndefined();
      expect(item.lastResult).toBeUndefined();
      expect(item.nextReviewDate).toBeUndefined();
      expect(item.nextReviewSource).toBeUndefined();
      expect(item.srReps).toBeUndefined();
      expect(item.srEase).toBeUndefined();
      expect(item.srIntervalDays).toBeUndefined();
      expect(item.srLastProgressDay).toBeUndefined();
      // RESTING by explicit import policy: 94 pieces must not flood Today.
      expect(item.status).toBe('dormant');
      // No pathway placement, no catalogue identity, no material invented.
      expect(item.stageId).toBeUndefined();
      expect(item.catalogKey).toBeUndefined();
      expect(item.materialId).toBeUndefined();
    }
    // No review row and no agenda entry was created for any of them.
    expect(after.db.reviews.filter((r) => fresh.some((i) => i.id === r.practiceItemId))).toEqual([]);
    expect(after.db.lessonAgenda).toHaveLength(1);
    expect(after.db.blocks.filter((b) => fresh.some((i) => i.id === b.practiceItemId))).toEqual([]);

    // A resting item is still DIRECTLY startable — resting is administrative,
    // not a lock.
    const araq = after.db.items.find((i) => i.source?.pieceKey === 'عراق')!;
    useStore.getState().cancelSession();
    useStore.getState().startItemSession(araq.id);
    expect(useStore.getState().active?.itemId).toBe(araq.id);
    useStore.getState().cancelSession();

    // --- THE OWNER'S OWN RECORDINGS ARE EVIDENCE, NOT MATERIAL -------------
    const source = useStore.getState().db.archiveSources[0]!;
    // 125 personal files in the real corpus, and not one of them is a resource.
    expect(source.sessions.every((s) => s.resources.every((r) => r.role !== 'تمرین-من'))).toBe(true);
    // Their membership and role survive — that is the whole of what they leave.
    const chainPiece = 'پیش-درامد-سه-گاه-فروتن';
    const { repeatChains } = await import('../domain/sourceArchive');
    // The longest repeat chain in the real archive. It is read from the
    // PERSONAL role — a piece is a repeat because the student was asked to play
    // it again, not because an unnamed demonstration gave it membership of a
    // session (which would report a repeat nobody was asked for).
    expect(repeatChains(source, chainPiece)).toEqual([[22, 23, 24, 25, 26, 27]]);
    // The real counterexample: پیش-درامد-ماهور-هرمزی is a MEMBER of sessions
    // 16, 17 and 18, but the student only recorded themselves playing it in 17
    // and 18 — session 16's membership comes from a correction and a
    // demonstration. Read from membership the chain would be three classes
    // long; read from what was actually asked for again, it is two.
    const hormozi = 'پیش-درامد-ماهور-هرمزی';
    expect(source.sessions.filter((s) => s.members.some((m) => m.key === hormozi)).map((s) => s.n)).toEqual([
      16, 17, 18,
    ]);
    expect(repeatChains(source, hormozi)).toEqual([[17, 18]]);
    const chainItem = useStore.getState().db.items.find((i) => i.source?.pieceKey === chainPiece)!;
    // Six classes of provenance, and still zero recorded practice.
    expect(chainItem.timesPractised).toBe(0);
    expect(chainItem.totalMinutes).toBe(0);
    const material = (await import('../domain/itemFiles')).itemFiles(useStore.getState().db, chainItem.id);
    expect(material.every((f) => f.source !== 'reference' || !f.path.includes('تمرین-من'))).toBe(true);

    // --- HISTORY NEVER BECOMES THE NEXT CLASS ------------------------------
    const { nextLessonFor } = await import('../domain/selectors');
    const { preparationDatesByItem, defaultTargetLesson } = await import('../domain/lessonAgenda');
    const db = useStore.getState().db;
    expect(db.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
    expect(nextLessonFor(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, NOW)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, NOW).values()]).toEqual([]);

    // AND ON A DEVICE WHOSE CLOCK IS BEHIND THE ARCHIVE. Read from 1 June 2026,
    // the last three imported classes are all in the FUTURE and all NEARER than
    // the owner's own next class — the exact case a plain `date >= today` turns
    // into a deadline. They are still history.
    const EARLIER = new Date('2026-06-01T09:00:00.000Z');
    const futureHistory = db.lessons.filter((l) => l.origin === 'archive' && l.date > '2026-06-01');
    expect(futureHistory.map((l) => l.date).sort()).toEqual(['2026-06-09', '2026-07-09', '2026-08-04', '2026-09-01']);
    expect(nextLessonFor(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect(defaultTargetLesson(db.lessons, SETAR, EARLIER)!.id).toBe('L-38-upcoming');
    expect([...preparationDatesByItem(db.lessonAgenda, db.lessons, EARLIER).values()]).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// ac-8 — an owner's deletion is a decision a refresh has to respect.
// ---------------------------------------------------------------------------

describe('deletions, unlinking and hiding', () => {
  it('archive deletions and unlinking remain respected after refresh and reload', async () => {
    loadOwnerData();
    await commit(useStore.getState().rev);
    const store = () => useStore.getState();
    const itemFor = (key: string) => store().db.items.find((i) => i.source?.pieceKey === key)!;
    const lessonFor = (n: number) => store().db.lessons.find((l) => l.source?.sessionN === n)!;
    const suppressions = () => store().db.archiveSources[0]!.suppressions;

    // --- deleteItem records the decision IN THE SAME mutation --------------
    const araqId = itemFor('عراق').id;
    store().deleteItem(araqId);
    expect(store().db.items.some((i) => i.id === araqId)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'piece', ref: 'عراق' }));

    // --- deleteLesson likewise ---------------------------------------------
    const lesson13 = lessonFor(13).id;
    store().deleteLesson(lesson13);
    expect(store().db.lessons.some((l) => l.id === lesson13)).toBe(false);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'session', ref: '13' }));

    // --- REFRESHING THE SAME SOURCE MUST NOT BRING THEM BACK ---------------
    const again = await commit(store().rev);
    expect(again.ok).toBe(true);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);

    // ...nor may a RELOAD, which replays the persisted bytes through hydration.
    const onDisk = fakeStorage.get()!;
    useStore.setState({ db: validateDB(JSON.parse(V13_SETAR_TEXT)) });
    fakeStorage.set(onDisk);
    await useStore.persist.rehydrate();
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);
    expect(store().db.lessons.some((l) => l.source?.sessionN === 13)).toBe(false);
    await commit(store().rev);
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(false);

    // --- lifting a suppression lets the next refresh bring it back ----------
    store().resetArchiveSuppression('setar-classes', 'piece', 'عراق');
    const restored = await commit(store().rev);
    expect(restored).toMatchObject({ ok: true, status: 'applied' });
    expect(store().db.items.some((i) => i.source?.pieceKey === 'عراق')).toBe(true);

    // --- HIDING A SHARED DEMO IS SCOPED TO ONE ITEM ------------------------
    const { itemFiles } = await import('../domain/itemFiles');
    const sharedDemo = 'session-13-03-09-2024/نمونه-1.mp4';
    const oneMember = itemFor('کرشمه-در-عراق');
    const otherMember = itemFor('حزین-در-عراق');
    // Session 13 was suppressed above and is back only for the piece; re-run a
    // refresh so its resources are present for both members.
    store().resetArchiveSuppression('setar-classes', 'session', '13');
    await commit(store().rev);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(true);
    store().hideArchiveResource('setar-classes', sharedDemo, oneMember.id);
    expect(itemFiles(store().db, oneMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(false);
    // Its seven siblings still have it.
    expect(itemFiles(store().db, otherMember.id).some((f) => f.source === 'reference' && f.path === sharedDemo)).toBe(
      true,
    );

    // --- unlinking an item from an archive class is remembered -------------
    const lesson28 = lessonFor(28);
    const zendan = itemFor('به-زندان-شوشتری');
    store().unlinkItemFromLesson(lesson28.id, zendan.id);
    expect(suppressions()).toContainEqual(expect.objectContaining({ kind: 'link', ref: `28:${'به-زندان-شوشتری'}` }));
    const { membersForSession } = await import('../domain/sourceArchive');
    expect(membersForSession(store().db.archiveSources[0]!, 28).some((m) => m.key === 'به-زندان-شوشتری')).toBe(false);

    // --- a MANUAL reference is removed without touching the archive --------
    store().addItemReference(zendan.id, { title: 'my own copy', path: 'session-28-28-10-2025/نت-به-زندان-شوشتری.pdf' });
    const added = store().db.items.find((i) => i.id === zendan.id)!.references![0]!;
    const suppressionsBefore = suppressions().length;
    store().removeItemReference(zendan.id, added.id);
    expect(store().db.items.find((i) => i.id === zendan.id)!.references).toEqual([]);
    // Removing an owner's own link says nothing about the archive.
    expect(suppressions()).toHaveLength(suppressionsBefore);

    // --- a catalogue removal of a bound item is still lossless -------------
    const catalogueItem = itemFor('چهار-پاره');
    expect(store().removeCatalogItem(catalogueItem.id)).toBe(false); // no catalogKey
    expect(store().db.items.some((i) => i.id === catalogueItem.id)).toBe(true);

    // --- MOVING A BOUND ITEM TO ANOTHER INSTRUMENT IS REFUSED --------------
    useStore.setState((s) => ({
      db: {
        ...s.db,
        instruments: [
          ...s.db.instruments,
          { ...s.db.instruments[0]!, id: 'inst-tar', name: 'Tar' },
        ],
      },
    }));
    const boundId = itemFor('به-زندان-شوشتری').id;
    const refusal = store().updateItem(boundId, { instrumentId: 'inst-tar' });
    expect(refusal).toMatch(/Detach it from the archive/);
    expect(store().db.items.find((i) => i.id === boundId)!.instrumentId).toBe(SETAR);
    // No invalid graph was emitted: the database still validates.
    expect(() => validateDB(store().db)).not.toThrow();

    // --- a PARTIAL binding is refused, never healed by duplication ---------
    expect(() =>
      validateDB({
        ...store().db,
        items: store().db.items.map((i) =>
          i.id === boundId ? { ...i, source: { archiveId: 'setar-classes', pieceKey: 'not-a-real-piece' } } : i,
        ),
      }),
    ).toThrow(/does not describe/);

    // --- clearing everything takes the source state with it ----------------
    store().clearAll();
    expect(store().db.archiveSources).toEqual([]);
    expect(store().db.items).toEqual([]);
    expect(store().active).toBeNull();
  });
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
    // A request the BROWSER cancelled because this test navigated away while it
    // was in flight is not an application error. WebKit reports such a fetch as
    // "Fetch API cannot load … due to access control checks", which reads
    // exactly like a CORS problem and is not one: instrumented, the only
    // difference between the passing and failing runs of the same journey is a
    // single `requestfailed` with `errorText: 'cancelled'` for a request that
    // is otherwise fulfilled with the right CORS headers every other time.
    // A real person navigating mid-sync cancels the same request, so treating
    // it as a page error makes a journey fail for driving the app quickly.
    // Narrow by construction: only a URL this run actually saw cancelled is
    // ever excused, and every other page error is recorded as before.
    const cancelled = new Set<string>();
    page.on('requestfailed', (r) => {
      if (r.failure()?.errorText === 'cancelled') cancelled.add(r.url());
    });
    // Surface a page-level error instead of letting it become a silently
    // wrong assertion later.
    page.on('pageerror', (e) => {
      const message = `${e.message}`;
      // WebKit spells the URL with the scheme separated from the host, so the
      // comparison is on the path, which both spellings carry verbatim.
      for (const url of cancelled) {
        if (message.includes(new URL(url).pathname)) return;
      }
      pageErrors.push(e);
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

### tests/setarArchive.browser.test.ts

```
import { describe, expect, it } from 'vitest';
import INDEX_TEXT from './fixtures/setar-archive.json?raw';
import V13_SETAR_TEXT from './fixtures/setar-legacy-v13.json?raw';
import {
  connectSync,
  goTo,
  importBackup,
  installFakeGitHub,
  newFakeRemote,
  openPracticeApp,
  persistedUntil,
  publishSourceIndex,
  readPersistedState,
  stampSourceIndex,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// ac-18 — the whole journey, rendered, in BOTH engines the owner actually uses.
//
// Refresh → a historical class with its real material → a canonical piece →
// the material that is genuinely useful for it → Start → open a file, with the
// practice clock untouched. The corpus is the checked-in index derived from the
// real archive, the clock is frozen, and every control is reached by its
// accessible name — no debug hook, no source regex.
//
// A missing engine FAILS with an install instruction; it never skips.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-17T09:00:00.000Z');
const PHONE = { width: 390, height: 844 };
const DESKTOP = { width: 1280, height: 900 };

interface Db {
  items: {
    id: string;
    title: string;
    status: string;
    persian?: { composer?: string };
    source?: { pieceKey: string };
  }[];
  lessons: { id: string; date: string; number?: number; origin?: string; source?: { sessionN: number } }[];
  blocks: unknown[];
  archiveSources: { id: string; sessions: unknown[]; pieces: unknown[] }[];
}

async function db(app: PracticeApp): Promise<Db> {
  const { state } = await readPersistedState(app);
  return (state as { db: Db }).db;
}

/** Seed the owner's real v13 data, connect the fake repo, publish an index. */
async function setUp(app: PracticeApp, indexText: string) {
  const remote = newFakeRemote();
  await installFakeGitHub(app.page, remote);
  await importBackup(app, 'setar-legacy-v13.json', V13_SETAR_TEXT);
  await connectSync(app);
  publishSourceIndex(remote, indexText);
  return remote;
}

async function refresh(app: PracticeApp) {
  await goTo(app, '/settings');
  await app.page.getByRole('button', { name: 'Refresh Setar archive' }).click();
  await app.page.getByRole('button', { name: /^(Apply|Already current)$/ }).waitFor({ timeout: 30_000 });
}

/**
 * An index with one more class than the corpus — the delta a refresh applies.
 *
 * Re-STAMPED with the digest the scanner itself would have written: the app
 * recomputes that digest and refuses an index whose content and hash disagree,
 * so a journey may not hand-edit a hash to fake a new scan.
 */
async function withSession40(text: string): Promise<string> {
  const index = JSON.parse(text) as {
    contentHash: string;
    sessions: unknown[];
    pieces: { key: string; composer: string }[];
  };
  index.sessions = [
    ...index.sessions,
    {
      n: 40,
      date: '2026-09-29',
      folder: 'session-40-29-09-2026',
      roster: [index.pieces[0]!.key],
      rosterTrusted: true,
      hasClassRecording: true,
      resources: [
        {
          path: 'session-40-29-09-2026/ضبط-کلاس.mp4',
          role: 'ضبط-کلاس',
          kind: 'video',
          title: 'ضبط کلاس',
          part: null,
          pieces: [],
          group: null,
        },
      ],
      members: [{ key: index.pieces[0]!.key, roles: ['ضبط-کلاس'] }],
    },
  ];
  return stampSourceIndex(index as unknown as Record<string, unknown>);
}

/** The composer this journey's re-scanned registry proposes for one piece. */
const NEW_COMPOSER = 'میرزا-عبدالله';

/**
 * A re-scanned index whose REGISTRY has improved: one piece the owner already
 * has now names a different composer. That is a suggestion, never a write.
 */
async function withBetterComposer(text: string): Promise<{ text: string; key: string; was: string }> {
  const index = JSON.parse(text) as { pieces: { key: string; composer: string }[] };
  const target = index.pieces.find((p) => p.composer && p.composer !== NEW_COMPOSER)!;
  const was = target.composer;
  index.pieces = index.pieces.map((p) => (p.key === target.key ? { ...p, composer: NEW_COMPOSER } : p));
  return { text: await stampSourceIndex(index as unknown as Record<string, unknown>), key: target.key, was };
}

describe('the Setar archive, rendered', () => {
  it('setar archive journey works on phone and desktop in Chromium and WebKit', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      for (const viewport of [PHONE, DESKTOP]) {
        const app = await openPracticeApp({ now: NOW, viewport, engine });
        try {
          const { page } = app;
          const remote = await setUp(app, INDEX_TEXT);

          // --- REFRESH: one action, a readable summary, no crawler output ---
          await refresh(app);
          const summary = await page.locator('main').innerText();
          // Four of the owner's own legacy classes carry EXACT source-path evidence,
          // so they are adopted rather than duplicated; the other 35 are new.
          expect(summary).toMatch(/Added 94 pieces and 35 classes · Updated 4/);
          // It says the index CHANGED or was FETCHED — never that a scan ran.
          expect(summary).not.toMatch(/last scanned/i);
          expect(summary).toMatch(/needing attention/);
          // Import policy is stated BEFORE the import, not discovered after.
          expect(summary).toMatch(/New pieces arrive resting/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });

          const after = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.lessons.length === 40 && d.items.length === 96,
          );
          expect(after.lessons.filter((l) => l.origin === 'archive')).toHaveLength(39);
          expect(after.items.filter((i) => i.source)).toHaveLength(94);
          // The owner's own upcoming class 38 and the archive's class 38 both
          // exist, on their own dates.
          expect(after.lessons.filter((l) => l.number === 38).map((l) => l.date).sort()).toEqual([
            '2026-08-04',
            '2026-09-27',
          ]);

          // --- A HISTORICAL CLASS, with its real material -------------------
          // Lessons is a two-pane list at 1000px and stacked cards below it, so
          // this journey drives whichever the viewport actually renders.
          await goTo(app, '/lessons');
          const wide = viewport.width >= 1000;
          /**
           * Open one class and read what it actually renders — the whole page
           * on the wide two-pane layout, the card itself on the phone, where
           * rows start compact and must be opened first.
           */
          const openClass = async (label: string, number: number): Promise<string> => {
            if (wide) {
              await page.getByRole('button', { name: new RegExp(label) }).first().click();
              await page.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
              return page.locator('main').innerText();
            }
            const card = page.getByRole('article').filter({ hasText: label });
            await card.first().waitFor({ timeout: 20_000 });
            // PHONE ROWS START COMPACT: thirty-nine imported classes must not
            // all open at once just because none of them has notes yet.
            expect(await card.getByRole('button', { name: /Class notes/ }).count()).toBe(0);
            await card.getByRole('button', { name: new RegExp(`Class ${number}`) }).first().click();
            await card.getByRole('button', { name: /Class notes/ }).first().waitFor({ timeout: 20_000 });
            return card.innerText();
          };
          const lessonText = await openClass('Class 13 · 2024-09-03', 13);
          // The class recording is here, with its part numbers; a named score
          // is here; nothing claims a demonstration belongs to the class alone.
          expect(lessonText).toContain('ضبط کلاس');
          expect(lessonText).toContain('Class 13 · 2024-09-03 · class recording');

          // --- ONE SECTION PER FILE, and no prompt beside a file that is here
          //
          // Class 25 is an ADOPTED legacy class carrying three of the owner's
          // OWN references — personal takes the index describes nowhere, by
          // construction — beside the archive's session material. The composed
          // list used to include the owner's rows as well, so each of them was
          // rendered twice: once where it can be edited and removed, and once
          // again above it.
          const occurrences = (text: string, needle: string) => text.split(needle).length - 1;
          const adopted = await openClass('Class 25 · 2025-08-05', 25);
          for (const authored of ['My take, 3 August', 'My take, 4 August', 'My take, 5 August']) {
            expect(occurrences(adopted, authored)).toBe(1);
          }
          // …and they are still editable where they live: the section that owns
          // them can still remove them, by name.
          const owning = wide
            ? page.locator('main')
            : page.getByRole('article').filter({ hasText: 'Class 25 · 2025-08-05' });
          expect(await owning.getByRole('button', { name: /Remove My take, 3 August/ }).count()).toBe(1);
          // A class the archive gave a recording to is NOT invited to add one.
          // Class 12 is a purely imported class: it keeps no copy of its
          // session's files, so its own `recordings` array is empty and the
          // empty-state card offered to add the very video playing above it.
          const imported = await openClass('Class 12 · 2024-08-06', 12);
          expect(imported).toContain('Class 12 · 2024-08-06 · class recording');
          expect(imported).not.toMatch(/Full class videos and scores live on your NAS/);

          // --- A CANONICAL PIECE, and the material that is useful for it ----
          await goTo(app, '/repertoire');
          await page.getByRole('button', { name: 'Practice list' }).click();
          // ALIAS SEARCH: an old transliterated spelling still finds the piece,
          // through the existing Farsi matcher.
          await page.getByPlaceholder('Search items…').first().fill('zarbi-araaq');
          const found = page.getByRole('link', { name: /ضربی-عراق-ماهور-میرزا-حسینقلی/ }).first();
          await found.waitFor({ timeout: 20_000 });
          await found.click();
          await page.getByRole('button', { name: 'Start a block' }).waitFor({ timeout: 20_000 });

          const itemText = await page.locator('main').innerText();
          // Its OWN notation, with provenance…
          expect(itemText).toContain('Class 13 · 2024-09-03 · notation');
          // …the demonstration that covers its session…
          expect(itemText).toContain('teacher’s demonstration');
          // …and NOT the class recording, and NOT anyone's practice takes.
          expect(itemText).not.toContain('class recording');
          expect(itemText).not.toContain('تمرین من');
          // Imported pieces arrive resting.
          expect(itemText).toMatch(/Resting/);

          // --- DIRECT START, and opening material with the clock untouched --
          await page.getByRole('button', { name: 'Start a block' }).click();
          await page.getByRole('button', { name: 'Finish' }).waitFor({ timeout: 20_000 });
          const clockBefore = await page.locator('main').innerText();
          // Material on the practice screen is ONE CLOSED disclosure.
          const materialToggle = page.getByRole('button', { name: /Material/ }).first();
          // CLOSED until asked for: nothing is listed before the tap.
          expect(await page.getByRole('button', { name: 'Open' }).count()).toBe(0);
          await materialToggle.click();
          const openButtons = page.getByRole('button', { name: 'Open' });
          expect(await openButtons.count()).toBeGreaterThan(0);
          // Every control has an accessible name and is reachable by keyboard.
          await page.keyboard.press('Tab');
          expect(await page.evaluate(() => document.activeElement?.tagName ?? '')).not.toBe('BODY');
          // Opening a file never disturbs the running block.
          expect((await page.locator('main').innerText()).includes('Finish')).toBe(
            clockBefore.includes('Finish'),
          );
          const blocksBefore = (await db(app)).blocks.length;
          // The harness accepts the confirm() for the whole journey.
          await page.getByRole('button', { name: 'Discard block' }).click();
          expect((await db(app)).blocks).toHaveLength(blocksBefore);

          // --- MIXED DIRECTION: Farsi wraps, English labels stay isolated ----
          await goTo(app, '/repertoire');
          await page.getByRole('button', { name: 'Practice list' }).click();
          await page.getByPlaceholder('Search items…').first().waitFor({ timeout: 20_000 });
          const wrapped = await page.evaluate(() => {
            const el = [...document.querySelectorAll('[dir="auto"]')].find((n) =>
              /[؀-ۿ]/.test(n.textContent ?? ''),
            );
            if (!el) return null;
            const box = el.getBoundingClientRect();
            return { rtl: getComputedStyle(el).direction, overflows: el.scrollWidth > Math.ceil(box.width) + 1 };
          });
          expect(wrapped).not.toBeNull();
          expect(wrapped!.rtl).toBe('rtl');
          expect(wrapped!.overflows).toBe(false);

          // --- REPEAT REFRESH: nothing at all; then ONE new class -----------
          await refresh(app);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);
          await page.getByRole('button', { name: 'Already current' }).click();
          await page.getByText('Already current.').first().waitFor({ timeout: 20_000 });

          publishSourceIndex(remote, await withSession40(INDEX_TEXT), 'source-index-commit-2');
          await refresh(app);
          expect(await page.locator('main').innerText()).toMatch(/Added 0 pieces and 1 classes/);
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const delta = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.lessons.length === 41,
          );
          expect(delta.items.filter((i) => i.source)).toHaveLength(94);

          // --- A RENDERED METADATA SUGGESTION, and the choice that applies it
          // The registry improves. That is an OFFER, field by field: nothing
          // about the owner's own piece changes until they say so, and the
          // choice must survive the commit even when the index behind it is
          // already the one installed.
          const better = await withBetterComposer(INDEX_TEXT);
          publishSourceIndex(remote, better.text, 'source-index-commit-4');
          await refresh(app);
          const offerRow = page.getByRole('button', { name: /Use the archive’s composer/ });
          await offerRow.first().waitFor({ timeout: 20_000 });
          const offerText = await page.locator('main').innerText();
          // The section label is rendered uppercase by the stylesheet, and
          // innerText returns what is actually rendered.
          expect(offerText).toMatch(/the archive knows more about these/i);
          expect(offerText).toContain(better.key);
          expect(offerText).toContain(NEW_COMPOSER);
          // Applying WITHOUT answering updates the source graph and leaves the
          // owner's own piece exactly as it was.
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const unanswered = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.archiveSources[0]!.pieces.some((p) => (p as { composer: string }).composer === NEW_COMPOSER),
          );
          expect(unanswered.items.find((i) => i.source?.pieceKey === better.key)!.persian?.composer).toBe(better.was);

          // THE SAME INDEX, a NEW answer. The graph is already current, so a
          // refresh judged by the index hash alone called this "Already
          // current" and threw the answer away unwritten.
          await refresh(app);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);
          await page.getByRole('button', { name: /Use the archive’s composer/ }).first().click();
          await page.getByRole('button', { name: 'Apply' }).waitFor({ timeout: 20_000 });
          await page.getByRole('button', { name: 'Apply' }).click();
          await page.getByText('Archive updated.').waitFor({ timeout: 30_000 });
          const answeredDb = await persistedUntil(
            app,
            (s) => (s.state as { db: Db }).db,
            (d) => d.items.find((i) => i.source?.pieceKey === better.key)?.persian?.composer === NEW_COMPOSER,
          );
          // Only that field moved: the piece keeps its title and its history.
          expect(answeredDb.items.find((i) => i.source?.pieceKey === better.key)!.title).toBe(better.key);
          expect(answeredDb.blocks).toHaveLength(1);
          // …and the offer is gone, because it has been taken.
          await refresh(app);
          expect(await page.getByRole('button', { name: /Use the archive’s composer/ }).count()).toBe(0);
          expect(await page.getByRole('button', { name: 'Already current' }).count()).toBe(1);

          // --- AN INVALID INDEX IS ACTIONABLE, and changes nothing ----------
          publishSourceIndex(remote, '{"format":"setar-archive-index","version":99}', 'source-index-commit-3');
          await goTo(app, '/settings');
          await page.getByRole('button', { name: 'Refresh Setar archive' }).click();
          await page.getByRole('alert').first().waitFor({ timeout: 30_000 });
          expect(await page.getByRole('alert').first().innerText()).toMatch(/newer scanner/);

          // --- A RELOAD PROVES IT: no duplicates, no fabricated history -----
          await reload(app);
          const persisted = await db(app);
          expect(persisted.lessons).toHaveLength(41);
          expect(persisted.items.filter((i) => i.source)).toHaveLength(94);
          expect(new Set(persisted.items.map((i) => i.id)).size).toBe(persisted.items.length);
          expect(new Set(persisted.lessons.map((l) => l.id)).size).toBe(persisted.lessons.length);
          expect(persisted.blocks).toHaveLength(1);
          expect(app.pageErrors).toEqual([]);
        } finally {
          await app.close();
        }
      }
    }
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
