---
id: 20260921-bring-the-classical-guitar-shed-course-i-9b18
contractId: 20260921-bring-the-classical-guitar-shed-course-i-9b18
patchId: 305c8fb48d7968607b290d26b669e77ee6e44155
reviewer: claude
state: sealed
verdict: approve
createdAt: 2026-09-22T15:53:57.380Z
sealedAt: 2026-09-22T17:59:52.434Z
---

# Review: Bring the Classical Guitar Shed course into the Guitar pathway with its material, works and position-aware routines

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260921-bring-the-classical-guitar-shed-course-i-9b18
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/32
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `305c8fb48d7968607b290d26b669e77ee6e44155`

## The Delta this change was framed from

# Each level offers what the course actually teaches there: its real sections with their guidance and syllabus BPMs, keeping the existing keys wherever a real section maps onto one. The level's own study and the named packet works with their composers are their own entries and become the only things that reach My repertoire, grouped under a “Classical Guitar Shed” study source created on first use; a work carried forward across levels is introduced once and reused, never duplicated. Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed live from the catalogue and never stored on the item, resolving under the one shared media root derived from the archive base the owner already set — shown on screen, overridable, and honestly unavailable rather than a dead link when there is none. A stage offers “Use this level's routine”, transcribed from the syllabus with its `***` segments essential, and “Build one for where I am” — the previous level's essentials plus only the sections actually added — both written as ordinary editable routines. Any routine can be run at a chosen total: its authored length is the default, changing it scales the segments proportionally, and too short a time drops non-essential segments before essential ones. Buying Levels 4A-5F later is a data change: the stage list comes from the generated course data, and a course-scoped “Add new levels from this course” action adds only the missing ones, without redefining the existing “restore default pathways” button or touching stages the owner edited.

_approved · about "work-a-pathway-stage"_

## Today

The Classical Guitar Shed pathway has a stage for every level the owner owns but almost no content. Levels 1B-3F each offer the same eight generic suggestions from `cgsOutline()` with one boilerplate sentence apiece, no course material, no named works and no routine. Adding the generic “Piece” suggestion creates a work literally called “Piece” in My repertoire, because `strand: 'piece'` maps to `itemType: 'full_piece'`. No course file reaches a practice item even though the whole tree is already served by the NAS: `itemFiles` composes only the Setar archive graph, hand-entered references and linked lessons, so a Guitar item's Material section is empty. The one NAS setting names the Setar archive folder and nothing knows that the folder above it is the shared `video-courses` root that also holds `classical-guitar`. Sixteen levels have no routine and there is no way to get one for a level you are part-way through — the owner is at 1B `05_Scales` and assembles that by hand every day. A routine runs only at its authored length. And a level bought later could never reach an existing database: `reseedDefaultPathways` adds stages only for pathways that do not yet exist, `addStage` mints a random id no catalogue could be keyed to, and there is no action that means “add the levels I have just bought”.

## Instead

Each level offers what the course actually teaches there: its real sections with their guidance and syllabus BPMs, keeping the existing keys wherever a real section maps onto one. The level's own study and the named packet works with their composers are their own entries and become the only things that reach My repertoire, grouped under a “Classical Guitar Shed” study source created on first use; a work carried forward across levels is introduced once and reused, never duplicated. Every item created from the course carries its section's videos, scores, images and contrast-card folder automatically, composed live from the catalogue and never stored on the item, resolving under the one shared media root derived from the archive base the owner already set — shown on screen, overridable, and honestly unavailable rather than a dead link when there is none. A stage offers “Use this level's routine”, transcribed from the syllabus with its `***` segments essential, and “Build one for where I am” — the previous level's essentials plus only the sections actually added — both written as ordinary editable routines. Any routine can be run at a chosen total: its authored length is the default, changing it scales the segments proportionally, and too short a time drops non-essential segments before essential ones. Buying Levels 4A-5F later is a data change: the stage list comes from the generated course data, and a course-scoped “Add new levels from this course” action adds only the missing ones, without redefining the existing “restore default pathways” button or touching stages the owner edited.

## Keep

- Seeing where you are in a stage stays derived from item status exactly as it is now — `stageUnits` and `itemStageState` are unchanged, and a suggestion you have not taken stays a suggestion.
- Taking a suggestion into your own items stays one tap, arrives honestly as “Not practised yet” with zero statistics, and stays losslessly removable until you practise it.
- Running a routine is unchanged: the same runner, the same frozen segment list, the same boundary signals, the same at-most-one-block-per-bound-item recording. Only segment minutes are ever scaled.
- “Short on time — essentials only” keeps its exact meaning and stays independent of duration.
- Level 1A keeps its fourteen hand-authored steps and both of its existing routines, byte for byte.
- Every Setar and Tar pathway, stage, catalogue entry and routine is untouched, and so is the whole Setar archive: its index, scanner, publisher, refresh and adoption flow.
- The configured archive base keeps its value and meaning, so no device needs reconfiguring and every existing lesson reference resolves identically.
- The Session Plan is untouched and remains a separate peer; only its 5-120 minute bound is shared.
- Today keeps its doorway order, its card heights and its above-the-fold recommendation.
- No file bytes enter the app, sync or a backup, and no item, routine, stage or study source is ever created without an explicit owner action.

## New assumptions

- The guitar tree is already served by the NAS — verified directly, including a real 1B lesson video returning 206 video/mp4 — so no mirroring is needed and no new device setting is required.
- Course material is derived from the catalogue rather than copied onto items, so re-running the scanner after a course change reaches items that already exist.

## Show me

Open Pathways → Classical Guitar Shed → Level 1B. Instead of eight generic rows it lists the level's real sections — Chords (C, G7), Split Chunks P-IM and P-MA, I/M Alternation at 60 bpm, Finger-Walking, Rhythm Practice #1, Sight-Reading, Study #1 — plus the level's named works (Sor Op.35 No.1, Carulli Op.241 No.1, Ode to Joy and the rest of the packet). Add “Split Chunks” and open it: its four lesson videos and the level syllabus PDF are already under Material, no link ever typed, and tapping one opens it from the NAS — Settings shows the media root it derived from your archive base, with Browse to confirm. Add Study #1 and it appears in My repertoire under “Classical Guitar Shed”; add Finger-Walking and it does not. Back on the stage, press “Build one for where I am”: because only the sections up to 05_Scales have been added, the routine is 1A's essentials followed by just those 1B segments — Piece, Rhythm and Sight-Reading are simply absent, not skipped. It is an ordinary routine: reorder it, retime it, or set today's duration to 12 minutes and watch the segments scale in proportion, the non-essential ones dropping first while the asterisked ones stay. “Short on time” still does what it always did.



## Re-review after a rejection — scoped to the rework

The last review of this contract asked for changes. This is NOT the whole plan
restated: it is what changed since the previously reviewed head, plus the
findings that review recorded, plus the full current text of every file the
rework touched — the same Check already bound to this head is not to be
rerun wholesale.

**Findings from the previous review:**

- **carried-work identity and complete catalogue material** — Course material deduplicates files by basename without proving that the files have identical content, so a distinct catalogue file can be silently hidden.
  _counterexample:_ Give two entries for one work different score files with the same basename and displayed title, such as two revisions of Ferrer-Ejercicio.pdf. courseFilesFor keeps the first path and drops the second at src/domain/courseSeed.ts:343-350. The family test at src/domain/courseSeed.test.ts:379-398 accepts this because it compares only basename and title, neither of which establishes content identity. Preserve both paths unless copy identity is authoritative and content-backed.

**What changed since the previously reviewed head:**

```diff
diff --git a/AGENTS.md b/AGENTS.md
index 146ea8c20373e16037957f63eca7ebee579b4e63..dd62ac3c0c650eb2a6178d6ae0fda94cc746b9fe 100644
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -2500,15 +2500,30 @@ the one item the identity rule exists to produce. `courseFilesFor` resolves
 in that course naming that work — course order, units then works within a group
 — so both addition orders compose the same LIST, not merely the same set. An
 ORDINARY per-stage key carries no identity at all, so `chords` still composes
-only its own section and nothing widens with it. Deduplication is by the file's
-own NAME rather than its path, because the course ships a copy of one packet in
-each level's folder that names it (Ferrer Ejercicio runs 2C-2F) and four rows of
-one identical score is noise, not material — the same reading of a score's
-identity the scanner's packet dedup already uses, and held to collapsing COPIES
-ONLY: two candidates sharing a name must share a title, asserted per identity
-(measured across the whole course: fifteen collapses, every one between
-identically-titled copies of one packet), so a regenerated course that introduced
-a genuine basename collision fails rather than silently losing a score. The item's own provenance is
+only its own section and nothing widens with it. DEDUPLICATION IS BY THE FILE'S
+OWN PATH, AND BY NOTHING WEAKER. It was by BASENAME, to keep the copy of one
+packet the course ships in each level's folder that names it (Ferrer Ejercicio
+runs 2C-2F) from appearing four times — and a sealed review found what that
+bought: a basename is not a file's identity, so two genuinely different scores
+sharing one (two revisions of `Ferrer-Ejercicio.pdf`, a regenerated course that
+renamed a folder rather than its files) had the SECOND SILENTLY DROPPED from the
+one list a work's material is composed into, with nothing on the item saying a
+score was missing. Nothing in this data can establish content identity — a
+`CourseFile` is a path, a kind and a title, with no size and no digest — and
+inventing one would mean a scanner field, a regenerated `courseData.ts` and a
+new claim to keep true, machinery bought for a cosmetic. COMPLETENESS BEATS
+TIDINESS: a repeated packet costs the owner one extra row they can SEE, a hidden
+one costs them material they cannot. A path IS authoritative, it is the same
+reading the scanner's own `packetWorks` dedup uses (`seen.has(file)` on the full
+relative path — the claim that it read a basename was simply untrue), and
+`itemFiles` keys its own rows by path too, so each copy is a distinct row with
+its own stable id rather than a collision. The fifteen identical packet copies
+the old key collapsed now appear once per level that ships one.
+`courseSeed.test.ts` proves this against the LIVE data in the counterexample's
+own hardest shape — distinct paths sharing a basename AND a title, so no weaker
+key could tell them apart — and asserts that set is NON-EMPTY first, or a
+regenerated course with no such collision would pass while asserting nothing.
+The item's own provenance is
 NOT rewritten to make this work: `stageId`/`catalogKey` stay what the tap
 created them as, which is what keeps an Undo and the row's "−" bounded to the
 stage that actually created the item, and nothing new is persisted. Its TITLE
diff --git a/docs/cgs-course.md b/docs/cgs-course.md
index 24a268bacdbb8de916e823b1067d8f3fa840c0cf..092a7d219246a094bc169652771d60f735fe141a 100644
--- a/docs/cgs-course.md
+++ b/docs/cgs-course.md
@@ -242,12 +242,16 @@ machinery.
     that work, in course order (units then works within a group), so both
     addition orders compose the same LIST and not merely the same set. An
     ordinary per-stage key carries no identity, so `chords` still composes only
-    its own section. Files are deduplicated by their own NAME rather than their
-    path, because the course ships a copy of one packet in each level's folder
-    that names it (Ferrer Ejercicio runs 2C–2F) — the same reading of a score's
-    identity `packetWorks` already uses, held to collapsing COPIES ONLY: two
-    candidates sharing a name must share a title (measured: fifteen collapses
-    across the course, every one between identically-titled copies). The item's provenance is NOT rewritten
+    its own section. Files are deduplicated by their own PATH and by nothing
+    weaker. It was their BASENAME, to keep the copy of one packet the course
+    ships in each level's folder that names it (Ferrer Ejercicio runs 2C–2F)
+    from appearing four times; a sealed review found that a basename is not a
+    file's identity, so two genuinely different scores sharing one had the
+    second silently dropped with nothing on the item saying so. Nothing in this
+    data establishes content identity — a `CourseFile` is a path, a kind and a
+    title — so completeness wins over tidiness: a repeated packet is one visible
+    extra row, a hidden one is material the owner cannot see. A path is
+    authoritative and is what `packetWorks` itself dedups on. The item's provenance is NOT rewritten
     to achieve this: `stageId`/`catalogKey` stay what the tap created them as,
     which is what keeps Undo and the row's "−" bounded to the stage that created
     the item, and nothing new is persisted. `courseSeed.test.ts` sweeps every
diff --git a/src/domain/courseSeed.test.ts b/src/domain/courseSeed.test.ts
index aa451b2370ac5ce906af34535befead2277f2aa4..c825d2c57105e4898a642910af09237896222c5a 100644
--- a/src/domain/courseSeed.test.ts
+++ b/src/domain/courseSeed.test.ts
@@ -279,6 +279,14 @@ describe('what a course entry becomes in My repertoire', () => {
     // The packet's own arm of the same rule, which holds today and is what a
     // level bought later could quietly break: one score is one key, so a
     // re-titled reappearance can never become a second work.
+    //
+    // THIS ONE KEEPS ITS BASENAME READING ON PURPOSE, and is not the defect
+    // `courseFilesFor` was just fixed for. That one DROPPED a file silently;
+    // this one FAILS LOUDLY — a course that ever shipped two different scores
+    // under one basename breaks this assertion rather than hiding anything,
+    // which is exactly the visibility the sealed finding asked for. Weakening
+    // it to compare paths would let a re-titled reappearance mint a second
+    // work, which is the identity design the contract fences off.
     const byScore = new Map<string, Set<string>>();
     for (const w of CGS_COURSE.groups.flatMap((x) => x.works)) {
       const score = w.file?.split('/').pop();
@@ -373,29 +381,12 @@ describe('a work carried forward across levels', () => {
       // files are in the one list all of them compose. Without this a
       // regression that let the LAST matching entry win would still have every
       // entry agreeing with every other and pass unnoticed. Compared by the
-      // file's NAME, which is the identity the dedup itself uses — the course
-      // ships one packet once per level that names it.
-      const names = new Set(paths.map((f) => f.split('/').pop()));
-      // AND THE DEDUP ONLY EVER COLLAPSES COPIES OF ONE FILE. Deduplicating by
-      // NAME is what keeps four identical Ferrer packets off one item, and the
-      // risk it carries is hiding a genuinely different file that happens to
-      // share a basename — so two candidates sharing one name must share a
-      // title too. Measured across the whole course: fifteen collapses, every
-      // one between identically-titled copies. A regenerated course that broke
-      // that fails here rather than silently losing a score.
-      const titlesByName = new Map<string, Set<string>>();
-      for (const e of entries) {
-        for (const f of declaredEntries(e)) {
-          const n = f.path.split('/').pop()!;
-          titlesByName.set(n, (titlesByName.get(n) ?? new Set()).add(f.title));
-        }
-      }
-      for (const [n, titles] of titlesByName) expect([...titles], `${identity}: ${n}`).toHaveLength(1);
-
+      // whole PATH — every declared file survives composition, never merely one
+      // per basename.
       for (const e of entries) {
         const own = declaredFiles(e);
         expect(own.length, `${identity}: ${e[0]}/${e[1]} declares nothing`).toBeGreaterThan(0);
-        for (const f of own) expect([...names], `${identity}: ${e[0]}/${e[1]}`).toContain(f.split('/').pop());
+        for (const f of own) expect(paths, `${identity}: ${e[0]}/${e[1]}`).toContain(f);
       }
 
       const first = entries[0];
@@ -423,6 +414,55 @@ describe('a work carried forward across levels', () => {
     }
   });
 
+  it('keeps every distinct path, even when two share a basename AND a title', () => {
+    // THE DEDUP KEY IS THE PATH, AND NOTHING WEAKER. It used to be the
+    // BASENAME, to keep the copy of one packet the course ships in each level
+    // folder that names it from appearing four times — but a basename is not a
+    // file's identity. Two genuinely different scores sharing one (two
+    // revisions of Ferrer-Ejercicio.pdf) had the second silently dropped, and
+    // nothing on the item said a score was missing. Nothing in this data
+    // establishes content identity — a CourseFile is a path, a kind and a
+    // title — so completeness wins: a repeated packet is one visible extra row,
+    // a hidden one is material the owner cannot see.
+    //
+    // Driven from the LIVE data rather than a fixture, and from the hardest
+    // shape there is: paths the old key could not tell apart even with the
+    // title added, which is exactly the counterexample's own shape.
+    const collisions = multiEntryIdentities()
+      .map(({ identity, entries }) => {
+        const byNameAndTitle = new Map<string, Set<string>>();
+        for (const e of entries) {
+          for (const f of declaredEntries(e)) {
+            const k = `${f.path.split('/').pop()}\u0000${f.title}`;
+            byNameAndTitle.set(k, (byNameAndTitle.get(k) ?? new Set()).add(f.path));
+          }
+        }
+        return { identity, entries, shared: [...byNameAndTitle.values()].filter((ps) => ps.size > 1) };
+      })
+      .filter((x) => x.shared.length > 0);
+
+    // NON-VACUITY FIRST. A regenerated course that stopped shipping duplicate
+    // basenames would otherwise pass this while asserting nothing at all.
+    expect(collisions.length, 'no basename collision left to prove anything with').toBeGreaterThan(0);
+    expect(collisions.map((x) => x.identity)).toContain('work-ferrer-ejercicio');
+
+    for (const { identity, entries, shared } of collisions) {
+      const composed = courseFilesFor(...entries[0]).map((f) => f.path);
+      // Every distinct path survives, and the ROW COUNT says so: a set
+      // comparison alone would pass a list that had quietly collapsed them.
+      for (const ps of shared) {
+        for (const path of ps) expect(composed, `${identity}: ${path}`).toContain(path);
+        expect(composed.filter((c) => ps.has(c)).length, identity).toBe(ps.size);
+      }
+      // And all the way out to the real item's Material, where each copy is its
+      // own row with its own stable id rather than a collision.
+      const items = addAll([entries[0]]);
+      const files = itemFiles(dbWith(items), items[0].id) as ItemFileReference[];
+      for (const ps of shared) for (const path of ps) expect(files.map((f) => f.path), identity).toContain(path);
+      expect(new Set(files.map((f) => f.id)).size, identity).toBe(files.length);
+    }
+  });
+
   it('still creates it the first time, and never reuses across an ordinary per-stage key', () => {
     const chords1B = added(STAGE_1B, 'chords');
     const entry = catalogForStage(STAGE_1C).find((e) => e.key === 'chords');
diff --git a/src/domain/courseSeed.ts b/src/domain/courseSeed.ts
index 4f134ffabc33c9b7c7f80afc0af27c824b252293..ee9206da56d9314b83ce5058aebdb566ca16abe2 100644
--- a/src/domain/courseSeed.ts
+++ b/src/domain/courseSeed.ts
@@ -325,11 +325,22 @@ function entryFiles(
  * works within a group — so both addition orders compose the SAME list, not
  * merely the same set.
  *
- * Deduplication is by the file's OWN NAME, not by its path: the course ships a
- * copy of one packet in each level's folder that names it (Ferrer Ejercicio
- * runs 2C-2F), and four rows of one identical score is noise, not material.
- * That is the same reading of a score's identity the scanner's own packet
- * dedup and `courseSeed.test.ts`'s "one score is one key" already use.
+ * Deduplication is by the file's OWN PATH, and by nothing weaker. It used to
+ * be by BASENAME, to keep the copy of one packet the course ships in each
+ * level's folder that names it (Ferrer Ejercicio runs 2C-2F) from appearing
+ * four times — but a basename is not a file's identity. Two genuinely
+ * different scores that happen to share one (two revisions of
+ * `Ferrer-Ejercicio.pdf`, a regenerated course that renamed a folder rather
+ * than its files) then had the second SILENTLY DROPPED from the one list the
+ * work's material is composed into, and nothing about the item said a score
+ * was missing. Nothing in this data establishes content identity — a
+ * `CourseFile` is a path, a kind and a title, with no size and no digest — so
+ * there is nothing here to collapse a copy on, and COMPLETENESS BEATS TIDINESS:
+ * a repeated packet costs the owner one extra row they can see, where a hidden
+ * one costs them material they cannot. A path IS authoritative, and it is the
+ * same reading the scanner's own `packetWorks` dedup uses (`seen.has(file)` on
+ * the full relative path). `itemFiles` keys its own rows by path too, so each
+ * copy is a distinct, stable row rather than a collision.
  *
  * An ORDINARY per-stage key carries no identity at all — `chords` exists in
  * every level — so it composes only its own section, exactly as before.
@@ -344,9 +355,8 @@ export function courseFilesFor(stageId: string, catalogKey: string): CourseFile[
   const seen = new Set<string>();
   const take = (files: CourseFile[]) => {
     for (const f of files) {
-      const name = f.path.split('/').pop() ?? f.path;
-      if (seen.has(name)) continue;
-      seen.add(name);
+      if (seen.has(f.path)) continue;
+      seen.add(f.path);
       out.push(f);
     }
   };
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
  conscious practice — for the Classical Guitar Shed levels those entries are GENERATED
  from the course's own tree (`courseSeed.ts` / `courseData.ts`; see "A COURSE is
  reference data in code" below), which changes where they come from and nothing about
  what they are; `addFromCatalog` turns one into a real item with one tap. The new
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

A THIRD, of the same kind, AND IT IS A RACE THE HARNESS CREATES RATHER THAN A BUG TO
EXCUSE. WebKit refuses a `fetch()` issued while the document is being destroyed and — on
GitHub's LINUX WebKit — reports it as an uncaught page error reading `"Fetch API cannot load …
due to access control checks"`, which reads exactly like a CORS problem and is not one. The
failing case arrives with NO `request`, NO route hit and NO `requestfailed` at all. It cannot
be reproduced on the Mac: macOS WebKit reports the same teardown as `requestfailed: cancelled`
with no page error, and a torn-down CORS PREFLIGHT as nothing whatsoever (measured, both). What
tears a document down is NOT every navigation: the app is hash-routed, and `page.goto` to a
different `#/route` is a same-document navigation in BOTH engines (a `window` marker survives).
Only a `goto` to the URL the page is ALREADY on differs — Chromium keeps it same-document
(firing `popstate`, so the router re-renders), WebKit performs a full document load. A journey
therefore never calls `goTo` for the route it is already on: ac-18 reaches Settings through
`openSettings` (More → Settings, the owner's own tap) and only `reload` loads a document. Making
`goTo` a no-op for that case was tried and REVERTED: Chromium's `popstate` navigation is slack
another journey's route wait relies on after an in-app navigation, and removing it made that
journey race under a full-suite run. The trap is documented on `goTo` itself.

**THE ANSWER IS TO REMOVE THE RACE, AND THE HISTORY OF TRYING TO EXCUSE IT IS WHY.** Six
versions of an excuse were built and every one of them could withhold a genuine failure:
a permanent set of cancelled URLs; a consuming time window (an unconsumed cancellation stayed
a live credit any later genuine failure to that URL could spend); a rule reading the page
error's `message` alone, which never contains the diagnosis — Playwright splits a page error
at its first colon, the URL's own scheme colon, so the wording lands in `name` and the excuse
was dead code; a backwards-only search, while WebKit delivers the page error 74–359µs BEFORE
the request's own `requestfailed` (six of six, measured); a nearest-wins ranking on host+path,
which threw away the QUERY and rested safety on a proximity that reads as 0ms or 1ms at
`Date.now()` granularity; and finally full-URL identity plus a veto on genuine evidence, which
STILL dropped a genuine diagnosis carrying no `requestfailed` of its own — exactly the CI
failure's own shape — whenever an earlier unconsumed cancellation to that URL was the only
thing in the log. That is the sealed finding that ended the attempt.

**THE PREMISE WAS NEVER OBSERVED, SO NO RULE COULD EVER PROVE IT — AND WHAT A CANCELLATION
LOOKS LIKE IS NOT EVEN PORTABLE.** Five cancellation shapes driven through macOS WebKit —
navigating away mid-flight, reloading mid-flight, `AbortController`, a same-tick
`location.href`, a cancelled CORS preflight — each produced a `requestfailed` with
`errorText: 'cancelled'` and NO page error. GitHub's Linux WebKit reports the same teardown as
the access-control page error with no `requestfailed`, and does not reliably emit `cancelled`
for a fetch reloaded across at all: two harness tests that asserted the macOS shape as a WebKit
invariant failed on every Linux run and were removed (the genuine-refusal measurement and the
end-to-end "kept and annotated" wiring check stay; neither needs a cancellation). A `pageerror`
hands a test an `Error` and no request identity. So there is no positive evidence available to
bind a specific error to a specific cancellation at any window or resolution, on either port,
and an unprovable correlation is resolved the only safe way: `openPracticeApp` KEEPS every page
error.
`excusedCancellation` is gone. What survives is `requestFailureEvidence`
(`tests/practiceBrowser.ts`), which only ANNOTATES a kept error with the browser's own
`errorText` for every tracked request to that resource and how far each sat from it — because
one bare CORS-shaped message with nothing to distinguish a cancellation from a real refusal is
what made the original CI-only failure unreadable. It consumes nothing and withholds nothing,
its full-URL identity (host, path and query; the fragment ignored, since a fragment never
reaches the network while the message keeps it verbatim) only decides whether a row is labelled
as the resource the error named, and `FAILURE_EVIDENCE_MS` bounds a REPORT rather than a
suppression.

**THERE WERE TWO RACES, AND FIXING THE FIRST WAS MISREAD AS FIXING BOTH.** Vite's default
`cacheDir` is `node_modules/.vite`, ten test files each start their own dev server on one
checkout, and the rollback journeys' baseline worktree SYMLINKS that same `node_modules` — so
every server ran the dependency optimizer against one directory and raced to commit it
(`ENOTEMPTY: rename '…/.vite/deps_temp_xxxx' -> '…/.vite/deps'`). A loser cannot serve its
modules, so its page never paints and the cold-start wait fires. Each server gets a PRIVATE
`cacheDir` now, and that race is gone. It was recorded as the cause of the access-control
diagnosis too, and GitHub disproved that: with the private cache in place ac-18 still failed on
Linux WebKit naming `README.md`. THE SECOND RACE IS A SYNC LEFT IN FLIGHT BY THE HARNESS.
Settings' `connectAndSync` stores the config — which renders "Sync now" at once — and only then
awaits `syncNow()`, holding the button DISABLED until that sync resolves. `connectSync` waited
for the button to APPEAR, so every journey drove on while the repo bootstrap
(`PUT contents/README.md`, behind a CORS preflight) was still running; ac-18's very next step is
`goTo('/settings')` from `#/settings`, which in WebKit alone was a full document load (above).
README is the only request the journey ever had in flight at a document load, which is why the
failure never named anything else. `connectSync` now waits for the ENABLED button — the sync's
own completion, read through the real control — and ac-18 no longer `goTo`s a route it is on.
A journey may only drive on from a document with nothing in flight; that is the rule, and it is
enforced by ordering, never by hiding what a torn-down request reports.

**A COLD-START TIMEOUT IS A QUESTION, NOT A NUMBER TO RAISE**, and this lane proved it: three
full-suite failures landed on that wait, in three DIFFERENT tests, and raising 60s to 120s
bought exactly one more run before the next. The ceiling is back at its original 60s.

The fake GitHub repo also now retains the fact that `main` EXISTS after its own bootstrap.
`initialize()` writes `PUT contents/README.md` through the Contents API and real GitHub then
resolves `git/ref/heads/main`; the fake answered 404 there until a SNAPSHOT existed, so
`getHead()` kept returning null and EVERY later sync re-entered `initialize()` and issued
another README PUT — measured at one every one to three seconds for a whole journey. Gating
that route on the REF alone fixes it without touching what `decideSync` sees: `manifest.json`
and `state.json` still 404 until something publishes a snapshot, so `readRemoteMeta` still
returns null, the decision is still `first-push`, and the pull/conflict journeys are unchanged.
Making the fake REMEMBER THE PUSH is deliberately NOT done — it was built and reverted once
because it changes `decideSync`'s input and `setarInbound`'s pull journey then reads "Already
in sync" instead of pulling. ac-18 asserts the bootstrap happens exactly once. This is a
correctness fix for the fake, and it removes a stream of needless writes; it is NOT what closed
the flake, and it was measured not to: with the bootstrap loop gone and the shared cache still
in place, the failure simply moved from `README.md` to `contents/manifest.json`.

**AND A HELPER THAT WAITS FOR THE SYMPTOM WAS BUILT HERE, MEASURED, AND DELETED.** `goTo` and
`reload` were given a `settleSync` that waited for the app's GitHub traffic to fall quiet before
navigating. It could not be shown to do anything on the Mac — where, as above, the failure is
unreproducible by construction — and it was dead in the two journeys that call `page.reload()`
directly anyway. It is still not the answer: waiting for traffic to go quiet before EVERY
navigation treats the symptom everywhere, where the cause was one helper returning mid-sync and
one engine-specific hidden reload, each fixed at its own line. Keeping harness code whose effect
cannot be measured, and a normative claim that it is what fixed this, is how the next reader
inherits a false cause — which is exactly what the private-cache claim above became for one
round. Six clean local runs are not evidence about a Linux-only report shape; the CI log is.

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

## A COURSE is reference data in code — it is not an archive

The owner's Classical Guitar Shed "Woodshed" course is a DOWNLOADED, FIXED tree
whose own `notes.md` and `LEVEL_GUIDE.md` already state everything about it.
`scripts/scan-cgs-course.mjs` (stdlib only, dry-run by default, never imported by
or reachable from any runtime path) reads it into `src/domain/courseData.ts`, and
`src/domain/courseSeed.ts` is the hand-written reader beside it. `docs/cgs-course.md`
is the operator runbook, the corpus baseline and the recorded deviations.

**IT MUST NOT REUSE THE SETAR ARCHIVE MACHINERY, AND THE REASON IS NOT TIDINESS.**
That source GROWS, gets RENAMED and carries piece identity to reconcile against
existing repertoire — which is why it needs a published index, a content digest,
a reconciler and a persisted graph validated at six doors. A course has none of
that to reconcile. So it sits on the rung `pathwaySeed.ts` already stands on:
reference data in code, with NO persisted graph, NO new inbound door, NO schema
change and NO migration. `SCHEMA_VERSION` stays 14 and `PracticeDB` gains
nothing. `sourceArchive.ts`, `sourceReconcile.ts`, the published index format,
the scanner, the publisher and the refresh/adoption flow are all untouched.

**THE GRAMMAR LIVES IN THE SCANNER AND NOWHERE ELSE.** The app never parses a
folder name, a `notes.md` heading or a syllabus table — it consumes the generated
data. `courseData.ts` is the scanner's OUTPUT and is never edited by hand; a
course change is answered by re-running the scanner and committing new data.

**THE SOURCE OF A LEVEL'S ROUTINE IS `LEVEL_GUIDE.md`, NOT THE SYLLABUS PDF, AND
THAT IS A MEASURED CORRECTION TO THE APPROVED PLAN.** The plan said "transcribed
from the syllabus with its `***` segments essential". There is no `***` anywhere
in the corpus — `grep -r` returns nothing — and the 1A syllabus PDF, whose text
extracts cleanly, carries no minute-by-minute routine at all. Every level's
`LEVEL_GUIDE.md` DOES carry a uniform Core (⭐, every session) / Rotation A /
Rotation B / Reference split with time budgets, so Core → `essential: true`,
Rotation → not essential, Reference → not in the routine at all. Level 3 is not
the exception the plan expected either: 3A, 3D, 3E and 3F all carry full tables,
so every level is derived uniformly rather than one being given prose about not
having a routine. Target BPMs come from the syllabus table where it can be read
and are ABSENT with a diagnostic where it cannot — a wrong tempo on a real
section is worse than none, and the mechanism is validated against 1A's
hand-authored ground truth.

**AND A PRESERVED KEY GOES TO THE SECTION IT ACTUALLY NAMES.** Where a level
ships two folders of one family, the base key is taken by the one with real
content, never merely the lower ordinal: 2E's `08_Sight_Reading` is an empty stub
beside the real `09_Sight_Reading`, and first-by-ordinal left an already-added
item attached to a titleless folder while the level's own routine named the
other — a key that survives but points at the wrong thing is the same failure as
a key that disappears, wearing a passing test. A duplicate key is two sections
claiming ONE item (`stageUnits` maps a key to a single item, `addFromCatalog`
takes the first entry under it): the scanner refuses to emit one and
`pathways.test.ts` holds the generated data to it.

**MATERIAL IS DERIVED; GUIDANCE IS COPIED ONCE.** The "regenerating reaches every
item that already exists" claim above is bounded to FILES. A section's guidance,
BPM line and checklist are written into the item's Working notes at creation by
`itemFromCatalogEntry`, exactly like every other catalogue entry — and must stay
that way, because the notebook is the owner's to edit and a regeneration that
overwrote it would destroy their words. Re-running the scanner updates an
existing item's material and not its notes.

**KEYS ARE ADDED, NEVER RENAMED — AND THAT IS A TEST, NOT AN INTENTION.** Every
catalogue key the old generic `cgsOutline()` placeholders produced (`chords`,
`arpeggios`, `scales`, `exercises`, `rhythm-study`, `sight-reading`, `piece`,
`other-study`, `phrasing`, `fretboard-mastery`, `practice-skills`) is taken by the
real section that replaces it, so an item the owner had already added stays
attached to its suggestion instead of becoming a silently detached non-catalogue
unit. A second section of the same family (2E's two Scales sections, 3A's two
Arpeggios sections) gets its OWN new key rather than displacing the base one.
`src/domain/pathways.test.ts` records every pre-import stage id and key and fails
if one disappears. **Level 1A keeps its fourteen hand-authored steps and both of
its routines byte for byte** — and a PRESERVED KEY STILL HAS TO REACH THE SECTION
IT NAMES. 1A's keys are slugs of their own titles (`warm-up-stretches`) and match
no course unit key (`warm-up`), so the level the owner STARTS from was the one
level with no composed material at all and — worse — the one level whose
essentials 1B's "where I am" routine carries forward, which could therefore never
bind to an item however much 1A had actually been added. Byte-stable but
unreachable is the same failure as renamed, wearing a passing test.
`COURSE_LEGACY_KEYS` (`courseSeed.ts`, the hand-written reader — never the
generated data) records which course section each legacy key names, and BOTH
readers go through it: `courseFilesFor` for material and `unitItem` for the
segment→item join. It ADDS a reading of those keys and changes none of them.
Many-to-one is deliberate and is what the course says (Chunks and Thumb-chunks
are both the one Right Hand Technique section); where a segment must pick ONE
item it takes the first key in the list that has one, so the choice is
deterministic. Every entry is asserted against the LIVE catalogue in
`courseSeed.test.ts` — a stale alias fails rather than quietly aliasing nothing,
the same visibility contract `direction.test.ts`'s inventories carry. Thirteen of
the fourteen resolve; "Technique primer — What is Technique" does not, because no
course section clearly corresponds to it, and a guessed section's videos on a real
step is the same failure as a guessed BPM on a real section.

**A COURSE ENTRY BECOMES REPERTOIRE ONLY WHERE THE COURSE NAMES A WORK, AND
`repertoire.ts` IS UNCHANGED.** The fix is upstream, in what the catalogue
DECLARES. `STRAND_TO_ITEM_TYPE` maps `strand: 'piece'` to `full_piece`, which is
why the old generic "Piece" placeholder created a repertoire work literally called
"Piece": the bug was the TITLE, never the strand. The level's own study IS the
Piece section — it keeps its `piece` key and its `piece` strand and gains the real
name the course gives it ("1B Piece — Study #1") — and the named packet works from
that section's own Sheet Music lists are their own entries with their composers in
the title. Every
drill, exercise, rhythm, sight-reading and reading section stays what it was and
never reaches My repertoire. A separate "study" entry beside the Piece section is
NOT emitted: it would put one study in repertoire twice.

**AND ONE MUSICAL WORK IS ONE REPERTOIRE ITEM, HOWEVER MANY ENTRIES NAME IT.**
That was the hole the first pass left, and it is the same "one study in repertoire
twice" the paragraph above already refuses, arriving through the OTHER channel: the
Piece SECTION and the PACKET WORKS are two entries the course can name one piece
by, and each minted its own `full_piece`. A sealed review reproduced both shapes —
3B's section ("Malagueña by Lecuona") beside `work-lecuona-malaguena`, literally the
same score PDF; and 2E's study ("Carulli Valse Op.50 No.7") beside 3F's
`work-carulli-valse-op-50-no-7-1`, a level apart with no shared file at all, because
2E's own folder holds no copy of the Valse.

**THE FIX IS AN IDENTITY, NOT A DEMOTION.** Closing the second channel — making the
section practice material wherever the level also names packet works — was built,
and the OWNER rejected it: a work they are learning at 2E must reach My repertoire
AT 2E, not only if a later level's packet happens to name it. So every entry that is
a work carries a `workKey`, and `courseWorkKey` (`courseSeed.ts`) is the ONE
resolution every surface reads — `carriedCourseWorkItem`, therefore
`planCatalogAddition` and `stageUnits` alike, so the tap and the row can never
disagree:

- A packet work's identity is its own key, derived from the WORK. That already
  joins a work the course carries across levels: Ferrer Ejercicio is titled
  identically in 2C-2F, so it slugs identically.
- A Piece section the course names ONE study for carries that study's identity
  (`unit.workKey`) while its catalogue key stays `piece`.
- A packet entry that IS an earlier level's study under another name carries that
  study's identity, from `WORK_ALIASES` in the scanner. Three pairs, each stated by
  the course's own words, and one of them — 3B's, where the packet entry is the
  section's own single score — is DROPPED outright rather than aliased, since the
  section is already that work at that very level.

An ordinary per-stage key carries no identity at all, so `chords` in 1B can never be
reused by 2B's; that narrowing is what the identity check buys, and it is asserted
directly. Every surface reads that one resolution — the tap, the stage row, and the
routine binding (`unitItem`) — so a work taken at 3F still binds 2E's own Piece
segment and still counts as added when 2E's "where I am" routine is built.

**MATCHING THE TWO BY NAME IS WHAT THIS REFUSES.** The cross-level pairs have no file
to compare, so a match would have to join "Malagueña by Lecuona" to "Lecuona
Malaguena" and "Fernando Sor Etude #1 Op.44" to "Sor Etude No.1 op 44 Practice
Packet" — token fuzz whose false positive MERGES TWO GENUINELY DIFFERENT WORKS into
one repertoire item, which is silent destruction of the owner's own record. This file
already refuses that shape by name for the Setar archive's own path repair ("No fuzzy
matching by title, size or modification time"). Identity is DECLARED instead, in the
scanner where the grammar lives, and a stale entry — one naming a packet work the
course no longer has, or pointing at a key that is no level's study — FAILS the scan
rather than quietly aliasing nothing.

**AND THE COURSE ITSELF SAYS WHICH PAIRS ARE REAL, WHICH IS WHY THE TABLE IS THREE
LINES AND NOT SIXTY.** Studies #1-#9 (1B-2D) each carry their OWN score image inside
their section ("Study #4 page 1"), and those sections' sheet lists are the course's
alternatives — 2B labels its list "Other appropriate pieces" in so many words. "Allen
Mathews — Small Etude #1" is NOT Study #1, and aliasing them would have been the
false merge this whole rule exists to prevent. Only the six "Full course: X" sections
(2E, 2F, 3A, 3B, 3D, 3E) have no study sheet of their own, and only three of those are
named again elsewhere. `NOT_A_PACKET_WORK`'s `^click here` is LOAD-BEARING here, not
tidiness: 3D and 3E name their study's own score as an instruction, and an instruction
admitted as a "work" would mint a repertoire item called "Click here…" beside the
section that is the real work.

AND "NAMES A WORK" IS THE WHOLE RULE, INCLUDING WHERE THE COURSE DOES NOT — AND
WHERE IT NAMES MORE THAN ONE. 3C's Piece section is a comma list ("Excerpts + Fur
Elise, Minuet in G, Red is the Rose") and 3F's is "Repertoire + Video Review": the
scanner already DIAGNOSED that it could not name a study there and then kept the
`piece` strand anyway, so both still became `full_piece` items titled after the
section — a repertoire work called "3F Piece: Repertoire + Video Review", which is
the same defect as the old "Piece" placeholder said the other way round. 3A is the
third shape and the same failure: "Tarrega Study in C + Canon in D" is TWO distinct
works, `studiesFrom` splits them correctly, and the section then rejoined them into
one `full_piece` item because nothing had been skipped — while the stage already
offered each of them as its own packet work. Two works cannot be one repertoire
item. All three sections are emitted as practice material (`strand: 'other'`) and
their REAL works reach My repertoire as that section's own packet works, which is
where the course does name them. The
KEY stays `piece` — keys are added, never renamed — and it is the SCANNER that
decides this, because the grammar lives there and the app consumes the data. It
is FORWARD-ONLY, as every catalogue change is: an item already created from that
entry keeps the `itemType` stored on it, since regenerating the course reaches an
item's MATERIAL and never its stored fields. AND A DOWNLOAD IN A SHEET-MUSIC
LIST IS NOT AUTOMATICALLY A WORK EITHER — the same rule one level down. 3F's
list carries "Here's the video review checklist" beside four real pieces and it
became a repertoire work called exactly that; an AID (a syllabus, a materials
list, course notes, a checklist) is skipped and stays reachable as one of that
section's own FILES.

**A WORK CARRIED FORWARD ACROSS LEVELS IS ONE WORK, AND THAT LOOKUP IS THE ONLY
CROSS-STAGE ONE.** A packet work's key is derived from the WORK (`work-<slug>`),
so Ferrer Ejercicio carries one key in all four levels it appears in and adding it
from 2E reuses the item created from 2C. `CatalogEntry.key` is otherwise unique
PER STAGE, not globally — `chords` exists in every level — so the ordinary reuse
stays a `(stageId, catalogKey)` match and a `chords` item in 1B can never be
reused by 2B's. Two lookups, two scopes, two tested rules; neither may leak into
the other.

THAT LOOKUP LIVES IN ONE PLACE AND EVERY SURFACE READS IT (`carriedCourseWorkItem`,
`courseSeed.ts`). It used to be private to `planCatalogAddition`, which made the
reuse something only the STORE could see: `stageUnits` still resolved an entry
against that stage's own items alone, so 2E showed Ferrer Ejercicio as an untaken
suggestion, its "+" handed back the 2C item while the banner said "Added", and the
Undo beside that message then offered to delete an item created at another level
weeks earlier — losslessly removable, so it would have gone. One resolution, one
answer on every surface. It is narrow by construction: only a key the CURRENT
stage's own course declares as a WORK resolves, and only against an item in a
stage of that SAME course.

AND AN UNDO MAY ONLY EVER REACH AN ITEM THE TAP ACTUALLY CREATED. That authority
is structural rather than contingent on the row happening to resolve:
`planCatalogAddition` returns `created`, `addFromCatalog` carries it out, and
`StageDetail` raises the undo banner only on a real creation. The row's own "−"
follows the same rule — an item that lives in ANOTHER stage is not this row's to
delete — and `removeCatalogItem` still re-checks `isLosslesslyRemovable` against
live blocks underneath both.

**COURSE MATERIAL IS COMPOSED FROM THE CATALOGUE, NEVER STORED ON THE ITEM.** An
item created from a course entry holds only its stage and its catalogue key;
`itemFiles` reads that section's videos, scores, images and contrast-card folder
out of the course data EVERY TIME. That is what makes re-running the scanner after
a course change reach every item that already exists, and it is why the owner
never types a link. No bytes enter the app, sync or a backup: a course file is
OPENED where it lives, exactly like a class recording, and the contrast-card decks
(1663 images) are ONE folder reference — never a viewer, a flashcard player or a
deck-by-deck list.

**AND A WORK'S MATERIAL IS THE WORK'S, NOT THE ENTRY'S — WHICH IS THE SAME
IDENTITY, READ ONE SURFACE FURTHER ON.** `carriedCourseWorkItem` already makes
one musical work ONE item however many entries name it, and `courseFilesFor`
then composed from the item's own `stageId`/`catalogKey` alone — so the material
depended on WHICH entry the owner happened to add FIRST. Take 2E's Carulli Valse
section and 3F's packet score was unreachable from the item; take 3F's packet
entry first and 2E's own section material was. Half a work either way round, on
the one item the identity rule exists to produce. `courseFilesFor` resolves
`courseWorkKey` FIRST and, where there is one, composes the files of EVERY entry
in that course naming that work — course order, units then works within a group
— so both addition orders compose the same LIST, not merely the same set. An
ORDINARY per-stage key carries no identity at all, so `chords` still composes
only its own section and nothing widens with it. DEDUPLICATION IS BY THE FILE'S
OWN PATH, AND BY NOTHING WEAKER. It was by BASENAME, to keep the copy of one
packet the course ships in each level's folder that names it (Ferrer Ejercicio
runs 2C-2F) from appearing four times — and a sealed review found what that
bought: a basename is not a file's identity, so two genuinely different scores
sharing one (two revisions of `Ferrer-Ejercicio.pdf`, a regenerated course that
renamed a folder rather than its files) had the SECOND SILENTLY DROPPED from the
one list a work's material is composed into, with nothing on the item saying a
score was missing. Nothing in this data can establish content identity — a
`CourseFile` is a path, a kind and a title, with no size and no digest — and
inventing one would mean a scanner field, a regenerated `courseData.ts` and a
new claim to keep true, machinery bought for a cosmetic. COMPLETENESS BEATS
TIDINESS: a repeated packet costs the owner one extra row they can SEE, a hidden
one costs them material they cannot. A path IS authoritative, it is the same
reading the scanner's own `packetWorks` dedup uses (`seen.has(file)` on the full
relative path — the claim that it read a basename was simply untrue), and
`itemFiles` keys its own rows by path too, so each copy is a distinct row with
its own stable id rather than a collision. The fifteen identical packet copies
the old key collapsed now appear once per level that ships one.
`courseSeed.test.ts` proves this against the LIVE data in the counterexample's
own hardest shape — distinct paths sharing a basename AND a title, so no weaker
key could tell them apart — and asserts that set is NON-EMPTY first, or a
regenerated course with no such collision would pass while asserting nothing.
The item's own provenance is
NOT rewritten to make this work: `stageId`/`catalogKey` stay what the tap
created them as, which is what keeps an Undo and the row's "−" bounded to the
stage that actually created the item, and nothing new is persisted. Its TITLE
and its Working notes still come from the entry that created it, deliberately:
a renamed item keeps its name on every row, and regeneration reaches an item's
material and never the notebook. `courseSeed.test.ts` sweeps EVERY identity the
course names from more than one entry — enumerated from the generated data, not
a written list, so a regenerated course is swept too — in both addition orders,
for identity, composed material, stage presentation, routine binding and the
`created: false` that keeps Undo away from an item this tap did not make.

**ONE MEDIA ROOT PER DEVICE, DERIVED — NOT A SECOND BASE AND NOT A RESOLVER
FALLBACK.** The NAS serves one tree with `setar-classes/`, `classical-guitar/` and
`tar-classes/` side by side, so the configured archive base is exactly
`<media root>/setar-classes`. `deriveMediaRoot` (`mediaRoots.ts`) takes the folder
ABOVE it, and `mediaRoot` lets an explicit per-device override win. `getNasBaseUrl()`
keeps its stored value and its meaning: every Setar and lesson code path reads the
same string it always did and every existing reference resolves byte-identically.
Nothing resolves against two bases in turn — each composed reference carries
`root: 'archive' | 'media'` and `baseForItemFile` picks exactly ONE, so a course
file is never retried against the archive base and a class recording never against
the root. NOTHING IS GUESSED: the derivation applies only when the base's last
segment names a folder a shipped source declares (`knownSourceFolders()`), and
anything else — the LEGACY base one folder too high included — yields no root at
all, so a course file reports `no-base` and offers no open action rather than
pointing at a dead link. That state is not new: Setar references are already
broken in it, and correcting the base once fixes both. A BASE THAT CANNOT BE READ
IS AN UNRECOGNISED BASE, NEVER A THROWN ERROR: a lone `%` is a legal URL path and
an illegal escape, so `decodeURIComponent` on the last segment raises a URIError —
and this runs while Settings and every material row are DRAWING, with the archive
base read in the same expression, so an unreadable base took the whole screen down
and ARCHIVE rows with it. A segment that will not decode is left exactly as given,
matches no known source, and yields no root.

**A ROUTINE'S AUTHORED MINUTES ARE PROPORTIONS, AND DURATION IS A SECOND
INDEPENDENT KNOB.** `fitRoutineToMinutes` (`routines.ts`, tested) scales
proportionally to the authored minutes — preserving the syllabus's own proportions,
which is the whole point of a curriculum routine — returns the input array
UNCHANGED at the authored total so doing nothing behaves exactly as before, and
when the target cannot seat every segment at a one-minute floor it DROPS using the
routine's own priority: non-essential first, latest first, so `essential` keeps
meaning what it means. A surviving segment keeps its label, note, essential flag
and bound item; only the MINUTES ever move.

THE FLOOR IS A REPAIR, NOT A MINUTE SPENT BEFORE THE PROPORTIONS ARE READ. Giving
every surviving segment one minute up front and sharing out only the remainder
distorts every share for no reason: 1:9 fitted to 20 came out 3:17, where the
authored proportion is exactly 2:18 and already satisfies the floor. The split is
proportional over the WHOLE target (largest remainder, earliest index on a tie),
and only then is a segment rounded to nothing lifted to one minute, taking it from
the longest that can spare one. The total never moves and it terminates, because
`kept.length <= target` guarantees a donor.

It COMPOSES with `segmentsForRun` rather than replacing it — essentials-only is a
CONTENT decision, duration is a TIME decision — and `segmentsForRun` keeps its
exact meaning and signature. COMPOSING IS SOMETHING THE OWNER CAN ACTUALLY DO:
every surface rendered the duration control with no way to say essentials-only,
and the separate "Short on time" button started immediately at the authored
length, so "twenty minutes, essentials only" was the one combination two controls
could never express. `RoutineDuration` carries both — the total, and its own
essentials-only tick, which re-seeds the offered total because changing the
CONTENT changes what the authored length is.

AND WHAT IT DROPS, IT SAYS HONESTLY. Cutting far enough reaches the essential
segments too, and the caption called every drop "non-essential" — a plain untruth
about the one distinction ⭐ exists to make. `describeFitDrop` (`routines.ts`,
tested) is that sentence, a pure FORMATTER rather than an expression inside the
render, for the reason this file keeps giving: written inline it is unreachable
from a Node test, and it was the sentence, not the arithmetic, that was wrong. The
Session Plan's `allocateMinutes` is deliberately NOT reused: it allocates by bucket
priority with a pinned warm-up share and a 2-25 minute clamp, which would distort a
one-minute syllabus segment and entangle two systems the app keeps as peers. Only
`validateBudgetMinutes` and its 5-120 bound are shared, so the control rejects
exactly what "Plan this session" rejects. `RoutineDuration.tsx` is ONE component on
all three routine surfaces (Today, a stage, a pathway) so they cannot drift, and it
starts the run ITSELF before navigating — `startRoutineRun` already takes its
segments from the caller and the runner freezes whatever it is given, so fitting
needs no runner change at all. `RoutineRunner.tsx` is untouched.

**A STAGE OFFERS TWO ROUTINES AND BOTH ARE ORDINARY EDITABLE DATA.** "Use this
level's routine" is the syllabus's own; "Build one for where I am"
(`buildPositionRoutine`) is the PREVIOUS level's essential segments — the
maintenance the syllabus itself carries forward — followed by only the segments of
the current level whose catalogue item the owner has ACTUALLY ADDED. Neither is a
live view. The catalogue-to-item flow is the position marker and no new stored
concept is introduced. A SEGMENT IS MATCHED BY ITS OWN DECLARED CATALOGUE KEY, on
`(stageId, catalogKey)` TOGETHER: a position routine spans two stages by
construction, so a key-only lookup would silently bind the wrong level's item.
Three consequences are deliberate — adding one of the level's optional repertoire
works enables no segment (the syllabus routines contain no piece segment at that
level anyway), an item the owner created by hand with no catalogue key is not one
of the course's sections, and a segment the marker leaves out is one edit away from
being added back. The ONE widening is a work's own IDENTITY (`courseWorkKey`): a
Piece section's segment binds to that work's item wherever in the course it was
first taken, because the stage ROW already shows it as added there and a segment
that left it out would be the same split resolution `carriedCourseWorkItem` exists
to refuse, one surface further on. An ordinary section carries no identity, so
nothing else widens with it.

**BUYING LEVELS 4A-5F LATER IS A DATA CHANGE, AND THE ACTION THAT ADDS THEM ADDS
NOTHING ON ITS OWN.** Re-run the scanner, ship the regenerated data, and use the
course-scoped "Add new levels from this course" on the pathway.
`reseedDefaultPathways` AND ITS REPERTOIRE BUTTON ARE NOT CHANGED: they keep adding
stages only for pathways that do not yet exist. Making that shipped button additive
would change what it does to every existing pathway and would SILENTLY RESURRECT a
stage the owner deliberately deleted, because a deleted stage's deterministic id is
absent in precisely the same way a never-seeded one is. The new action cannot do
that: `offeredCourseLevels` OFFERS the levels absent from the pathway — keyed by the
stage's deterministic id, never by its title, so a level the owner RENAMED is never
offered again — and `planCourseLevels` adds only the ones explicitly selected. A
deleted stage therefore reappears in a LIST, never in the pathway.

**THE TWO STORE-APPLIED DECISIONS ARE PURE FUNCTIONS APPLIED AS ONE `set()`.** The
Node test environment cannot import `useStore.ts` (it pulls in Dexie via `./idb`),
so `planCatalogAddition` and `planCourseLevels` prove the DECISION in
`courseSeed.test.ts` and their SHAPE protects the WIRING — the same
shape-protects-the-wiring pattern `installDatabase` already uses.
`planCatalogAddition` returns the items AND the materials together, so
`addFromCatalog` can never apply half of a change: it never calls the `addMaterial`
action (that would be a second `set()`), and `resolveCourseSource` returns the SAME
materials array when nothing was minted, so a second course item can never create a
duplicate "Classical Guitar Shed" study source. `addFromCatalog` keeps its contract
otherwise: a catalogue item still arrives `status: 'new'` with zero statistics and
stays losslessly removable.

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

### docs/cgs-course.md

```
# The Classical Guitar Shed course: scanner, data and what the app does with it

The owner practises Classical Guitar daily from an offline copy of the
Classical Guitar Shed "Woodshed" course. This file is the operator runbook for
bringing that course into the app, the record of what the scanner reads and
what it deliberately does not, and the corpus baseline.

It is the sibling of `docs/setar-archive.md` and is deliberately **not** the
same machinery. That source GROWS, gets RENAMED, and carries piece identity to
reconcile against existing repertoire — which is why it needs a published index,
a content digest and a reconciler. A downloaded course has none of that: it is a
fixed tree whose own `notes.md` and `LEVEL_GUIDE.md` already state everything.
So the course sits on the rung `pathwaySeed.ts` already stands on — reference
data in code — with **no persisted graph, no new validation door, no schema
change and no migration**.

---

## 1. The shape of it

    /Volumes/Sandisk/video-courses/            ← the shared MEDIA ROOT
      setar-classes/                           ← the Setar archive (unchanged)
      classical-guitar/
        classical-guitar-shed/                 ← this course
          PRACTICE_GUIDE.md
          Level_1A/ … Level_3F/
            LEVEL_GUIDE.md                     ← core / rotation / reference + times
            1B-Syllabus-Materials-….pdf        ← target-BPM table
            00_Contrast_Cards/                 ← sub-folders, 1663 images
            03_Chords/
              notes.md                         ← title, guidance, files, checklist
              01_e939830c-ddf.mp4  …
      tar-classes/

Currently 18 levels (1A–3F), 212 sections, 688 addressable files, 59 named
packet works. The course itself continues to roughly 5F; see §5.

## 2. The scanner

    node scripts/scan-cgs-course.mjs                 # DRY RUN — reports only
    node scripts/scan-cgs-course.mjs --write         # writes src/domain/courseData.ts

Node stdlib only, no dependencies, **dry-run by default**. It is a BUILD-TIME
tool: nothing in `src/` imports it and nothing in it is reachable from any
runtime path. `--root` points it at another copy of the tree, `--media-path` at
the course's own folder beneath the media root, `--out` elsewhere.

It **discovers** the levels present — nothing is bound to eighteen of them, to
`Level_*` naming or to a section-per-folder layout — and it **reports** anything
it could not read rather than silently emitting less. Every diagnostic it
produces is committed into `courseData.ts`'s own `diagnostics` array, so the
record travels with the data.

### The grammar lives here and nowhere else

The app never parses a folder name, a `notes.md` heading or a syllabus table. It
consumes the generated data.

**Catalogue keys are ADDED, never renamed.** A section folder's base name maps
onto the key the stage already used before this course existed
(`03_Chords` → `chords`, `07_Rhythm_Study` → `rhythm-study`, `09_Piece` →
`piece`, …), so an item the owner had already added from the old generic
suggestion stays attached to the real section that replaced it. Where a level
ships two folders of one family (2E's two Scales sections, 3A's two Arpeggios
sections), ONE takes the base key and the other gets its own new key, so nothing
is ever displaced. `src/domain/pathways.test.ts` records every pre-import key and
fails if one disappears.

WHICH one is not simply the lower ordinal: the key goes to the folder with real
content. 2E's `08_Sight_Reading` is an empty stub beside the real
`09_Sight_Reading`, and first-by-ordinal left an already-added item attached to a
titleless folder while the level's own routine named the other — a key that
survives but points at the wrong thing is the same failure as a key that
disappears, wearing a passing test. Ordinal order only breaks the tie. A
duplicate key is two sections claiming one item; the scanner refuses to emit one
and the same test holds the generated data to it.

**Files.** `notes.md` lists videos IN ORDER, and names its sheet music and
images; that leads. Anything on disk it does not mention still follows, because
a file the app cannot see is a file the owner has to leave the app for. Video
filenames are opaque (`01_80ee0462-cc7.mp4`) but their ORDINAL is stable, so a
video is addressed by (section, ordinal) and never by meaning read out of its
name. A section holding sub-folders (the contrast-card decks) is ONE folder
reference to the section itself — never a deck-by-deck list, and never a viewer.

**Works.** A level's own STUDY is its Piece section itself: the section keeps
its `piece` key and its `piece` strand and gains the real name the course gives
it ("1B Piece — Study #1", from the H1 after a colon, else the first line of the
section's own text). The **packet works** come from the section's own Sheet
Music lists, deduplicated by file, with the composer joined into the title
("Fernando Sor — Opus 35, no.1").

**Where the course names NO single work — or more than one — the section is not
a work.** 3C ("Excerpts + Fur Elise, Minuet in G, Red is the Rose") and 3F
("Repertoire + Video Review") name none; 3A ("Tarrega Study in C + Canon in D")
names two, and two works cannot be one repertoire item while the packet already
offers each of them separately. All three emit `strand: 'other'` — practice on
material named elsewhere, with their real works reaching My repertoire as that
section's own packet works. The KEY stays `piece` in every case — keys are added,
never renamed — and the section keeps its own title and every file it reaches.
The change is FORWARD-ONLY, as every catalogue change is: an item already created
from that entry keeps the `itemType` stored on it, because regenerating the course
reaches an item's MATERIAL and never its stored fields.

### One musical work is one repertoire item

The section and the packet are two entries the course can name one piece by, so
each entry that is a work carries a `workKey` — its repertoire IDENTITY, separate
from its catalogue key. `courseWorkKey` (`courseSeed.ts`) is the one resolution
every surface reads — the tap, the stage row, the routine binding and the item's
composed MATERIAL — so they can never disagree, and the owner takes a work at the
level they actually meet it.

| entry | identity |
|---|---|
| a packet work | its own key, derived from the WORK — which is what already joins Ferrer Ejercicio across 2C–2F under one title |
| a Piece section naming ONE study | that study's key (`unit.workKey`), while its catalogue key stays `piece` |
| a packet entry that IS an earlier level's study | that study's key, declared in `WORK_ALIASES` |
| anything else (`chords`, `scales`, …) | none — so an ordinary per-stage key is never joined across levels |

`WORK_ALIASES` is three lines, and the course itself states each pair: 3B's "Full
course: Malagueña by Ernesto Lecuona" beside its single sheet entry (dropped
outright rather than aliased — the section is already that work at that very
level); 2E's "Full course: Carulli's Valse, Opus 50, Number 7", whose score exists
ONLY in 3F's folder and which 3F re-lists under "Recommended pieces"; and 2F's
"Full course: Fernando Sor, Etude #1, Opus 44", re-listed by 3F the same way.

**Why it is declared and not matched.** The cross-level pairs share no file at all,
so a match would have to join "Malagueña by Lecuona" to "Lecuona Malaguena" and
"Fernando Sor Etude #1 Op.44" to "Sor Etude No.1 op 44 Practice Packet" — token
fuzz whose false positive merges two genuinely different works into one repertoire
item and destroys the owner's record. `AGENTS.md` refuses exactly this shape for
the Setar archive's own path repair. The curation is verified AT SCAN TIME and a
stale entry — naming a packet work the course no longer has, or pointing at a key
that is no level's study — HARD-FAILS the scan; what `courseSeed.test.ts` holds is
the OUTCOME, that each of the three pairs resolves to one repertoire item in either
addition order.

**Why the table is three lines and not sixty.** Studies #1–#9 (1B–2D) each carry
their OWN score image inside their section ("Study #4 page 1"), and those sections'
sheet lists are the course's alternatives — 2B labels its list "Other appropriate
pieces" in so many words. "Allen Mathews — Small Etude #1" is not Study #1, and
aliasing them would be the false merge this rule exists to prevent. Only the six
"Full course: X" sections (2E, 2F, 3A, 3B, 3D, 3E) have no study sheet of their own,
and only three of those are named again elsewhere.

The same rule applies one level down, in the Sheet Music list itself: a download
there is not automatically a work. 3F's list carries "Here's the video review
checklist" beside four real pieces, and it became a repertoire work called
exactly that. Aids — a syllabus, a materials list, course notes, a checklist —
are skipped (`NOT_A_PACKET_WORK`), and they stay fully reachable as that
section's own FILES. That filter's `^click here` is LOAD-BEARING rather than
tidiness: 3D and 3E name their study's own score as an instruction ("Click here
for the materials for Chester."), and admitting one as a work would mint a
repertoire item called "Click here…" beside the section that is the real work.

**Routines** come from `LEVEL_GUIDE.md`: Core (⭐, every session) → `essential:
true`, Rotation A/B → not essential, Reference sections → not in the routine at
all. Minutes are the midpoint of the guide's own range ("8–12 min" → 10).

**Target BPMs** come from the syllabus PDF's page-1 practice table, read with
`zlib` alone. A number is attributed to the NEAREST left-column header row at or
above it whose text matches a real section of that level — and to nothing at all
otherwise.

### Deliberate deviations from the approved plan, and why

Three things the plan expected are not in the corpus. They are recorded here
rather than worked around silently.

1. **There is no `***`-marked routine in the syllabus PDFs.** The plan said the
   level routine is "transcribed from the syllabus with its `***` segments
   essential"; `grep -r '\*\*\*'` across every markdown file in the course
   returns nothing, and the 1A syllabus PDF (whose text extracts cleanly)
   contains no minute-by-minute routine at all. `LEVEL_GUIDE.md` is the real,
   uniform, machine-readable source and every level has one. Core⭐ → essential
   is the honest reading of "essential", and it is what "Short on time —
   essentials only" now filters on.
2. **Level 3 therefore gets routines too.** The plan expected Level 3 syllabi to
   carry a repertoire page and no routine, and said those stages should say so.
   That followed from believing the PDF was the source. Measured: 3A, 3D, 3E and
   3F all carry full Core/Rotation tables in their `LEVEL_GUIDE.md`. They are
   derived uniformly with every other level.
3. **BPM coverage is partial and honestly reported.** 25 values across 11 levels
   are attributed. Eight levels (1E, 1F, 2A, 2C, 2E, 2F, 3A, 3E) use a shifted
   font subset with no text positioning at all — the "+29 character-shift" case
   the plan anticipated — so their table cannot be read, and they get no BPMs
   and a diagnostic each. Nothing is guessed: a wrong tempo attached to a real
   section is worse than an absent one, and the syllabus PDF is itself linked as
   material on every level's Syllabus section. The mechanism is validated
   against ground truth — 1A's three positioned values (rhythm 80, sight-reading
   70, piece 60) reproduce the hand-authored seed exactly.

Three further diagnostics are genuine facts about the course, not scanner
failures: 3C's and 3F's Piece sections name no single work and 3A's names two, so
all three are practice material rather than repertoire works (see **Works**); and
`Level_2E/08_Sight_Reading/` has no `notes.md`, so its title and guidance are
unavailable while its three PDFs still reach the app.

## 3. The generated data

`src/domain/courseData.ts` is the scanner's OUTPUT and is **never edited by
hand**. `src/domain/courseSeed.ts` is the hand-written reader beside it. A
course change is answered by re-running the scanner and committing new data.

It is ~222 KB of committed literal that ships in the offline PWA bundle, and
would roughly double if the course reaches 5F. Per-strand practice checklists
are deduplicated to one per strand (`CGS_CHECKLISTS`); per-section guidance,
titles, file lists and routines are kept in full.

The shape is ordered **groups of units**, not "levels", and how many there are
is data — which is also the shape a flat, index-driven source (Khonyagar's 106
sections) needs, so a second course is a second reader plus data and never new
machinery.

## 4. What the app does with it

* **The stages and their catalogue** come from `courseStageSeeds()` through
  `pathwaySeed.ts`. Level 1A keeps its fourteen hand-authored steps byte for
  byte; every other level is the course's own sections plus its named packet
  works.
* **Repertoire** follows from the strand alone, and `repertoire.ts` is
  unchanged: the level's own study and the packet works carry `strand: 'piece'`
  → `itemType: 'full_piece'` → `isWork`. Every drill, exercise, rhythm,
  sight-reading and reading section does not — and neither does a Piece section
  the course names no single work, or more than one, for. One musical work is
  one repertoire ITEM however many entries name it (`workKey`). The scanner, not
  the app, decides all of this (see **Works** in §2).
* **Material is COMPOSED, never stored.** An item holds only the stage and the
  catalogue key it was created from; `itemFiles` reads its files out of the
  course data every time. So re-running the scanner after a course change
  reaches every item that already exists, and the owner never types a link.
  **No bytes enter the app**: a course file is opened where it lives, exactly
  like a class recording.
  * **A work's material is the WORK's, not the entry's.** Composed from the
    item's own stage and catalogue key alone, the files depended on which entry
    the owner added FIRST: take 2E's Carulli Valse section and 3F's packet score
    was unreachable from the item; take 3F's packet entry first and 2E's own
    section material was — half a work either way, on the one item the identity
    rule exists to produce. `courseFilesFor` resolves `courseWorkKey` first and,
    where there is one, composes the files of EVERY entry in that course naming
    that work, in course order (units then works within a group), so both
    addition orders compose the same LIST and not merely the same set. An
    ordinary per-stage key carries no identity, so `chords` still composes only
    its own section. Files are deduplicated by their own PATH and by nothing
    weaker. It was their BASENAME, to keep the copy of one packet the course
    ships in each level's folder that names it (Ferrer Ejercicio runs 2C–2F)
    from appearing four times; a sealed review found that a basename is not a
    file's identity, so two genuinely different scores sharing one had the
    second silently dropped with nothing on the item saying so. Nothing in this
    data establishes content identity — a `CourseFile` is a path, a kind and a
    title — so completeness wins over tidiness: a repeated packet is one visible
    extra row, a hidden one is material the owner cannot see. A path is
    authoritative and is what `packetWorks` itself dedups on. The item's provenance is NOT rewritten
    to achieve this: `stageId`/`catalogKey` stay what the tap created them as,
    which is what keeps Undo and the row's "−" bounded to the stage that created
    the item, and nothing new is persisted. `courseSeed.test.ts` sweeps every
    identity the course names from more than one entry — enumerated from the
    generated data rather than a written list — in both addition orders.
  * **That claim is bounded to MATERIAL.** A section's guidance, its BPM line
    and its checklist are written into the item's own Working notes ONCE, at
    creation, by `itemFromCatalogEntry` — the same as every other catalogue
    entry in the app, and deliberately so: the notebook is the owner's to edit,
    and regenerating the course must never overwrite what they have written
    there. Re-running the scanner therefore updates the FILES of an existing
    item and not its notes. A new item created from the regenerated entry gets
    the new text.
* **Files resolve under the shared media root**, derived from the archive base
  the owner already set. See `docs/setar-archive.md` for why that is not a
  second base and not a resolver fallback.
* **A study source is found or created on first use**, so every course item
  groups under one "Classical Guitar Shed" source in My repertoire and a second
  item can never mint a duplicate.
* **A stage offers two routines.** "Use this level's routine" is the syllabus's
  own; "Build one for where I am" is the previous level's essential segments
  plus only the current level's sections the owner has actually added, joined on
  `(stageId, catalogKey)` together. Both write an **ordinary editable routine** —
  neither is a live view — and a segment the position marker leaves out is one
  edit away from being added back.
* **Any routine runs at a chosen total.** `fitRoutineToMinutes` scales
  proportionally and drops non-essential segments before essential ones. The
  authored length is the default, so doing nothing behaves exactly as before,
  and duration stays independent of "Short on time". The one-minute floor is a
  REPAIR applied after the proportional split, never a minute reserved before
  it: reserving one each and sharing out only the remainder distorted every
  share for no reason (1:9 fitted to 20 came out 3:17 where 2:18 is both exact
  and legal). `RoutineDuration` carries BOTH knobs — the total and its own
  essentials-only tick — so "twenty minutes, essentials only" is one choice
  rather than two controls that could never be used together, and what it drops
  it names honestly: cutting far enough reaches the essential segments too, and
  `describeFitDrop` (pure, tested) says so instead of calling every drop
  non-essential.

## 5. Buying Levels 4A–5F later

It is a data change, not a code change:

1. Download the new levels into the same tree.
2. `node scripts/scan-cgs-course.mjs` — read the diagnostics.
3. `node scripts/scan-cgs-course.mjs --write`, commit, ship.
4. Open the pathway → **Add new levels from this course** → tick the ones you
   want.

No migration and no schema change. That last action is deliberately **separate**
from the existing "restore default pathways" button, which is unchanged: it adds
nothing on its own, it OFFERS the levels the course has and the pathway does
not, keyed by the stage's deterministic id rather than its title. So a level the
owner renamed is never offered again, and a stage they deliberately **deleted**
reappears in a list — never in the pathway — and only if they choose it.

## 6. What is NOT here

* No published index, no content digest, no reconciler, no scanner running
  inside the app, and no second source-archive grammar.
* No contrast-card viewer, flashcard player or media player of any kind.
* No Khonyagar/Tar course data and no ArtistWorks import. The group/unit shape
  and the shared media root were chosen so either becomes a second reader plus
  data; Khonyagar's four teacher folders are real dated classes belonging to the
  lessons flow, and `behrooz-hemati` carries a Setar book, so its instrument
  needs confirming before anything is imported.
* No content for levels the owner does not own — no placeholder stage,
  catalogue entry or routine exists for 4A–5F.
* **One Level 1A step gets no composed course material**, and it is named rather
  than guessed at. 1A's fourteen steps are hand-authored and their keys are
  slugs of their own titles (`warm-up-stretches`), matching no course unit key
  (`warm-up`) — so the level the owner STARTS from was the one level with no
  material and, worse, the one level whose essentials 1B's "where I am" routine
  carries forward and could therefore never bind. `COURSE_LEGACY_KEYS`
  (`courseSeed.ts`, the hand-written reader — not the generated data) records
  which course section each of those keys names, and BOTH the material
  composition and the segment→item join read it. The keys themselves are
  untouched, exactly as the scanner's own rule ADDS keys and never renames one;
  every entry is asserted against the live catalogue in `courseSeed.test.ts`, so
  a stale alias fails rather than quietly aliasing nothing. Many-to-one is
  deliberate and is what the course itself says (Chunks and Thumb-chunks are
  both the one Right Hand Technique section); where a routine segment must pick
  ONE item it takes the first key in the list that has one. Thirteen of the
  fourteen resolve. "Technique primer — What is Technique" does not, because no
  course section clearly corresponds to it, and a guessed section's videos on a
  real step is the same failure as a guessed BPM on a real section.
* **An existing database keeps its old stage TITLES.** Stages are ordinary
  editable data the owner may have renamed, so nothing here rewrites one: a
  device seeded before this change still reads "1B · Arpeggios begin" rather
  than the course's own focus line, while its catalogue, material and routines
  are the new ones. §5's action only adds stages that are ABSENT. That is
  deliberate — silently retitling a stage the owner may have edited is exactly
  what "adds nothing on its own" rules out — and renaming one by hand takes a
  tap on Edit. A fresh install gets the course's titles.
```

### src/domain/courseSeed.test.ts

```
import { describe, expect, it } from 'vitest';
import { CGS_COURSE } from './courseData';
import {
  COURSE_LEGACY_KEYS,
  buildLevelRoutine,
  buildPositionRoutine,
  carriedCourseWorkItem,
  courseFilesFor,
  courseStageId,
  offeredCourseLevels,
  planCatalogAddition,
  planCourseLevels,
  resolveCourseSource,
} from './courseSeed';
import { createItem, createMaterial } from './factories';
import { catalogForStage } from './pathwaySeed';
import { isWork, repertoireWorks } from './repertoire';
import { stageUnits } from './pathways';
import { baseForItemFile, itemFiles, type ItemFileReference } from './itemFiles';
import { mediaRoot } from './mediaRoots';
import { resolveRecording } from './recordings';
import type { Material, PathwayStage, PracticeDB, PracticeItem } from './types';

// ---------------------------------------------------------------------------
// The course, read as reference data. Every check below runs against the REAL
// generated `courseData.ts` — the owner's own eighteen levels — not a fixture,
// because what these rules have to hold for is the actual course.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-21T09:00:00.000Z');
const STAGE_1B = courseStageId(CGS_COURSE, '1b');
const STAGE_1C = courseStageId(CGS_COURSE, '1c');
const STAGE_2C = courseStageId(CGS_COURSE, '2c');
const STAGE_2E = courseStageId(CGS_COURSE, '2e');
const STAGE_1A = courseStageId(CGS_COURSE, '1a');
const STAGE_3A = courseStageId(CGS_COURSE, '3a');
const STAGE_3B = courseStageId(CGS_COURSE, '3b');
const STAGE_2F = courseStageId(CGS_COURSE, '2f');
const STAGE_3F = courseStageId(CGS_COURSE, '3f');

function group(key: string) {
  const g = CGS_COURSE.groups.find((x) => x.key === key);
  if (!g) throw new Error(`no course group ${key}`);
  return g;
}

/** An item as `addFromCatalog` would have created it from that stage's entry. */
function added(stageId: string, catalogKey: string, over: Partial<PracticeItem> = {}): PracticeItem {
  const entry = catalogForStage(stageId).find((e) => e.key === catalogKey);
  if (!entry) throw new Error(`no catalog entry ${stageId}/${catalogKey}`);
  return {
    ...createItem({ instrumentId: 'g', title: entry.title, stageId, catalogKey }, NOW),
    itemType: entry.strand === 'piece' ? 'full_piece' : 'technique',
    strand: entry.strand,
    ...over,
  };
}

type Pair = readonly [string, string];

/** The files ONE catalogue entry declares in the generated data, read directly. */
function declaredEntries([stageId, key]: Pair): Array<{ path: string; title: string }> {
  const g = group(stageId.replace('cgs-', ''));
  const unit = g.units.find((u) => u.key === key);
  if (unit) return unit.files;
  const work = g.works.find((w) => w.key === key);
  return work?.file ? [{ path: work.file, title: work.title }] : [];
}

function declaredFiles(entry: Pair): string[] {
  return declaredEntries(entry).map((f) => f.path);
}

/**
 * Every repertoire identity this course names from MORE THAN ONE catalogue
 * entry, read out of the generated data rather than written down here — the
 * two declared aliases and every packet work the course carries across levels.
 */
function multiEntryIdentities(): Array<{ identity: string; entries: Pair[] }> {
  const byIdentity = new Map<string, Pair[]>();
  const push = (id: string, entry: Pair) => byIdentity.set(id, [...(byIdentity.get(id) ?? []), entry]);
  for (const g of CGS_COURSE.groups) {
    const stageId = courseStageId(CGS_COURSE, g.key);
    for (const u of g.units) if (u.workKey) push(u.workKey, [stageId, u.key]);
    for (const w of g.works) push(w.workKey ?? w.key, [stageId, w.key]);
  }
  return [...byIdentity]
    .filter(([, entries]) => entries.length > 1)
    .map(([identity, entries]) => ({ identity, entries }));
}

/** Taking a list of suggestions in order, through the real addition path. */
function addAll(pairs: readonly Pair[]): PracticeItem[] {
  let db = { items: [] as PracticeItem[], materials: [] as Material[] };
  for (const [stageId, key] of pairs) {
    const entry = catalogForStage(stageId).find((e) => e.key === key);
    if (!entry) throw new Error(`no catalog entry ${stageId}/${key}`);
    const plan = planCatalogAddition(db, stageId, key, entry, 'g', NOW);
    db = { items: plan.items, materials: plan.materials };
  }
  return db.items;
}

// --- ac-1 -------------------------------------------------------------------

describe('what a course entry becomes in My repertoire', () => {
  const entries = catalogForStage(STAGE_1B);
  const g = group('1b');

  it("a level's study and packet works are repertoire works and its drill sections are not", () => {
    // The level's OWN study IS the Piece section, named as the course names it
    // — a repertoire work at the level the owner actually meets it, with the
    // whole section's material rather than one loose PDF lifted out of it.
    expect(entries.find((e) => e.key === 'piece')?.title).toBe('1B Piece — Study #1');
    expect(isWork(added(STAGE_1B, 'piece'))).toBe(true);
    expect(courseFilesFor(STAGE_1B, 'piece')).toEqual(g.units.find((u) => u.key === 'piece')!.files);

    // EVERY level whose Piece section names one study, including the two whose
    // study is a "Full course" with no study sheet of its own.
    for (const key of ['1c', '1d', '1e', '1f', '2a', '2b', '2c', '2d', '2e', '2f', '3b', '3d', '3e']) {
      const stageId = courseStageId(CGS_COURSE, key);
      expect(isWork(added(stageId, 'piece')), `${key}'s study did not reach My repertoire`).toBe(true);
    }

    // Every named packet work, with its composer.
    expect(g.works.length).toBeGreaterThan(0);
    expect(g.works.find((w) => w.key === 'work-fernando-sor-opus-35-no-1')?.title).toBe(
      'Fernando Sor — Opus 35, no.1',
    );
    for (const w of g.works) {
      expect(entries.some((e) => e.key === w.key && e.strand === 'piece')).toBe(true);
      expect(isWork(added(STAGE_1B, w.key))).toBe(true);
    }

    // And nothing else from the same level.
    const practice = ['chords', 'arpeggios', 'scales', 'exercises', 'rhythm-study', 'sight-reading', 'other-study', 'contrast-cards'];
    const items = practice.map((k) => added(STAGE_1B, k));
    for (const item of items) expect(isWork(item), `${item.catalogKey} reached My repertoire`).toBe(false);
    expect(repertoireWorks(items)).toEqual([]);

    // A PIECE SECTION THE COURSE NAMES NO SINGLE WORK FOR IS NOT A WORK
    // EITHER. 3C ("Excerpts + Fur Elise, Minuet in G, Red is the Rose") and 3F
    // ("Repertoire + Video Review") are practice on material named elsewhere;
    // the scanner already DIAGNOSED that it could not name a study there and
    // then kept the `piece` strand anyway, so both became full_piece items
    // titled after the section. Their real works reach My repertoire as the
    // packet works, which is the whole rule: repertoire only where the course
    // NAMES a work.
    for (const key of ['3c', '3f']) {
      const stageId = courseStageId(CGS_COURSE, key);
      const section = catalogForStage(stageId).find((e) => e.key === 'piece');
      // The KEY is untouched — keys are added, never renamed (ac-15).
      expect(section, `${key} lost its piece entry`).toBeDefined();
      expect(section!.strand).not.toBe('piece');
      expect(isWork(added(stageId, 'piece')), `${key}'s piece section reached My repertoire`).toBe(false);
      expect(
        CGS_COURSE.diagnostics.some((d) =>
          d.startsWith(`${key.toUpperCase()}: the Piece section is practice material, not a repertoire work — it names no single work`),
        ),
      ).toBe(true);
      // Its named packet works still do.
      const works = group(key).works;
      expect(works.length).toBeGreaterThan(0);
      for (const w of works) expect(isWork(added(stageId, w.key)), `${w.key}`).toBe(true);
    }

    // AND A DOWNLOAD IN A SHEET-MUSIC LIST IS NOT AUTOMATICALLY A WORK EITHER —
    // the same rule one level down. 3F's list carries "Here's the video review
    // checklist" beside four real pieces, and it became a repertoire work
    // called exactly that. It is an AID, so it is not a work; it is still
    // reachable, because it is one of that section's own files.
    const aid = /syllabus|materials|course notes|checklist/i;
    for (const g of CGS_COURSE.groups) {
      for (const w of g.works) expect(aid.test(w.title), `${g.key}: "${w.title}" reached My repertoire`).toBe(false);
    }
    expect(
      courseFilesFor(courseStageId(CGS_COURSE, '3f'), 'piece').some((f) => /Video-Review-Checklist/.test(f.path)),
    ).toBe(true);
  });

  it('emits no separate study entry beside the Piece section, which would repertoire it twice', () => {
    expect(g.works.some((w) => w.title === 'Study #1')).toBe(false);
    expect(entries.filter((e) => /Study #1/.test(e.title))).toHaveLength(1);
  });

  it("a level's study and a packet entry for the same work are ONE repertoire item", () => {
    // ONE MUSICAL WORK, ONE REPERTOIRE ITEM — and the owner takes it at the
    // level they meet it. The Piece SECTION and the packet works are two
    // entries the course can name one piece by, so each carries that work's
    // IDENTITY and the second tap hands back the first item. Both sealed
    // counterexamples, in BOTH addition orders:
    //
    //  (a) WITHIN a level: 3B's section studies Malagueña and its packet named
    //      the same score. The scanner drops the packet entry outright there —
    //      the section IS that work and the PDF is already one of its files —
    //      so the level offers it exactly once.
    expect(group('3b').works).toEqual([]);
    const malaguena = catalogForStage(STAGE_3B).filter((e) => e.strand === 'piece');
    expect(malaguena.map((e) => e.key)).toEqual(['piece']);
    expect(malaguena[0].title).toBe('3B Piece — Malagueña by Lecuona');
    expect(repertoireWorks(addAll([[STAGE_3B, 'piece']])).map((w) => w.work.title)).toEqual([
      '3B Piece — Malagueña by Lecuona',
    ]);
    expect(courseFilesFor(STAGE_3B, 'piece').some((f) => /Lecuona-Malaguena/.test(f.path))).toBe(true);

    //  (b) ACROSS levels, where there is no shared file at all — 2E's own
    //      folder holds no copy of the Valse — and the two titles only a fuzzy
    //      match would join. The identity is DECLARED in the scanner from the
    //      course's own words, so both entries resolve to one item whichever
    //      is added first, INCLUDING when the later level is added first.
    const pairs: Array<[Pair, Pair, string]> = [
      [[STAGE_2E, 'piece'], [STAGE_3F, 'work-carulli-valse-op-50-no-7-1'], '2E Piece — Carulli Valse Op.50 No.7'],
      [[STAGE_2F, 'piece'], [STAGE_3F, 'work-sor-etude-no-1-op-44-practice-packet'], '2F Piece — Fernando Sor Etude #1 Op.44'],
    ];
    for (const [study, packet, studyTitle] of pairs) {
      const studyFirst = addAll([study, packet]);
      expect(studyFirst, `${study[0]} then ${packet[1]}`).toHaveLength(1);
      expect(repertoireWorks(studyFirst).map((w) => w.work.title)).toEqual([studyTitle]);

      const packetFirst = addAll([packet, study]);
      expect(packetFirst, `${packet[1]} then ${study[0]}`).toHaveLength(1);
      expect(repertoireWorks(packetFirst)).toHaveLength(1);

      // The row at the OTHER level shows the existing item rather than an
      // untaken suggestion, so its “+” can never report “Added” for something
      // it did not create and Undo can never reach it.
      const item = studyFirst[0];
      expect(stageUnits(stage(packet[0]), [item]).find((u) => u.key === packet[1])?.item?.id).toBe(item.id);
      expect(stageUnits(stage(study[0]), [item]).find((u) => u.key === 'piece')?.item?.id).toBe(item.id);
      const entry = catalogForStage(packet[0]).find((e) => e.key === packet[1]);
      expect(planCatalogAddition({ items: [item], materials: [] }, packet[0], packet[1], entry, 'g', NOW).created).toBe(
        false,
      );

      // AND THE ROUTINE BINDS TO IT. Taken from the later level, the work is
      // still the study level's own Piece section, so that level's routine
      // segment binds and its position routine counts the section as added —
      // the row and the binding are one resolution, not two.
      const fromPacket = addAll([packet])[0];
      const levelKey = study[0].replace('cgs-', '');
      const pieceSeg = buildLevelRoutine(CGS_COURSE, levelKey, [fromPacket]).find((seg) =>
        /Piece/.test(seg.label),
      );
      expect(pieceSeg?.itemId, `${levelKey} routine did not bind its Piece segment`).toBe(fromPacket.id);
      expect(
        buildPositionRoutine(CGS_COURSE, levelKey, [fromPacket]).some((seg) => seg.itemId === fromPacket.id),
      ).toBe(true);

      // AND ITS MATERIAL IS THE WORK'S, NEVER THE ENTRY'S. Composing from the
      // item's own stage and catalogue key alone made the files depend on
      // WHICH entry created it — 2E's section material or 3F's score, never
      // both — so the one item the identity rule produces was half a work
      // whichever way round it was added. Both entries compose the IDENTICAL
      // list, not merely the same set: the scan is course-ordered.
      const studyFiles = courseFilesFor(study[0], study[1]);
      expect(courseFilesFor(packet[0], packet[1]), `${study[1]} vs ${packet[1]}`).toEqual(studyFiles);
      // It is a UNION, not one side quietly winning: the packet's own score is
      // in it, and so is the section's own material.
      const packetScore = group(packet[0].replace('cgs-', '')).works.find((w) => w.key === packet[1])!.file;
      expect(studyFiles.map((f) => f.path), packet[1]).toContain(packetScore);
      for (const f of group(study[0].replace('cgs-', '')).units.find((u) => u.key === 'piece')!.files) {
        expect(studyFiles, f.path).toContainEqual(f);
      }
      // And the ONE item composes exactly that, whichever entry created it.
      for (const items of [studyFirst, packetFirst]) {
        const paths = itemFiles(dbWith(items), items[0].id).map((f) => (f as ItemFileReference).path);
        expect(paths, `created from ${items[0].catalogKey}`).toEqual(studyFiles.map((f) => f.path));
      }
    }

    // AN ORDINARY PER-STAGE KEY CARRIES NO IDENTITY, so nothing above leaks
    // into it: `chords` exists at every level and is never joined across them.
    expect(carriedCourseWorkItem(STAGE_1C, 'chords', [added(STAGE_1B, 'chords')])).toBeUndefined();
    // — including for its MATERIAL, which is the half the widening above could
    // have leaked into: 1C's chords section composes 1C's files and no other
    // level's, because an ordinary per-stage key names no work at all.
    expect(courseFilesFor(STAGE_1C, 'chords')).toEqual(group('1c').units.find((u) => u.key === 'chords')!.files);

    // The packet's own arm of the same rule, which holds today and is what a
    // level bought later could quietly break: one score is one key, so a
    // re-titled reappearance can never become a second work.
    //
    // THIS ONE KEEPS ITS BASENAME READING ON PURPOSE, and is not the defect
    // `courseFilesFor` was just fixed for. That one DROPPED a file silently;
    // this one FAILS LOUDLY — a course that ever shipped two different scores
    // under one basename breaks this assertion rather than hiding anything,
    // which is exactly the visibility the sealed finding asked for. Weakening
    // it to compare paths would let a re-titled reappearance mint a second
    // work, which is the identity design the contract fences off.
    const byScore = new Map<string, Set<string>>();
    for (const w of CGS_COURSE.groups.flatMap((x) => x.works)) {
      const score = w.file?.split('/').pop();
      if (!score) continue;
      byScore.set(score, (byScore.get(score) ?? new Set()).add(w.workKey ?? w.key));
    }
    for (const [score, keys] of byScore) expect([...keys], score).toHaveLength(1);
  });

  it('treats a Piece section naming two works as practice material, never one work', () => {
    // 3A: "Tarrega Study in C + Canon in D". Two distinct works cannot be one
    // repertoire item, and the stage already offers each of them separately —
    // so the section keeps its key, its title and its material, and the two
    // works are what reach My repertoire.
    const section = catalogForStage(STAGE_3A).find((e) => e.key === 'piece');
    expect(section?.title).toBe('3A Piece — Tarrega Study in C + Canon in D');
    expect(section?.strand).not.toBe('piece');
    expect(isWork(added(STAGE_3A, 'piece'))).toBe(false);
    expect(courseFilesFor(STAGE_3A, 'piece').length).toBeGreaterThan(0);
    expect(
      CGS_COURSE.diagnostics.some((d) =>
        d.startsWith('3A: the Piece section is practice material, not a repertoire work — it names 2 works'),
      ),
    ).toBe(true);

    const works = group('3a').works;
    expect(works).toHaveLength(2);
    expect(repertoireWorks(addAll(works.map((w) => [STAGE_3A, w.key] as const)))).toHaveLength(2);
  });
});

// --- ac-2 -------------------------------------------------------------------

describe('a work carried forward across levels', () => {
  // Ferrer Ejercicio runs 2C-2F: ONE work, suggested in each level it appears.
  const CARRIED = 'work-ferrer-ejercicio';

  it('reuses a carried-forward work when it is added from a later level instead of duplicating it', () => {
    // The course names it by the same key in every level it appears in...
    expect(CGS_COURSE.groups.filter((g) => g.works.some((w) => w.key === CARRIED)).length).toBeGreaterThan(1);

    // ...so adding it from 2E returns the item created from 2C.
    const first = added(STAGE_2C, CARRIED);
    const db = { items: [first], materials: [] as Material[] };
    const entry = catalogForStage(STAGE_2E).find((e) => e.key === CARRIED);
    const plan = planCatalogAddition(db, STAGE_2E, CARRIED, entry, 'g', NOW);
    expect(plan.itemId).toBe(first.id);
    expect(plan.items).toHaveLength(1);
    expect(repertoireWorks(plan.items)).toHaveLength(1);

    // AND THE LATER LEVEL SAYS SO. Reuse that only the store could see left 2E
    // showing an untaken suggestion: its “+” handed back the 2C item while
    // reporting “Added”, and the Undo beside that message then offered to
    // delete an item created at another level weeks earlier. One resolution,
    // one answer on every surface — so the row shows the existing item...
    const unit = stageUnits(stage(STAGE_2E), [first]).find((u) => u.key === CARRIED);
    expect(unit?.item?.id).toBe(first.id);
    // ...and the plan reports that it created NOTHING, which is what stops an
    // Undo ever reaching it.
    expect(plan.created).toBe(false);

    // The reuse is bounded to the course. An identically-keyed item in a stage
    // no course owns is never adopted.
    const stranger = { ...added(STAGE_2C, CARRIED), id: 'stranger', stageId: 'setar-radif-mezrab' };
    const fresh = planCatalogAddition({ items: [stranger], materials: [] }, STAGE_2E, CARRIED, entry, 'g', NOW);
    expect(fresh.created).toBe(true);
    expect(fresh.itemId).not.toBe('stranger');
    expect(stageUnits(stage(STAGE_2E), [stranger]).find((u) => u.key === CARRIED)?.item).toBeUndefined();
  });

  it('holds for EVERY identity this course names twice, in both addition orders', () => {
    // THE SWEEP, NOT THE COUNTEREXAMPLE. The two declared aliases are the pair
    // a reviewer happened to name; the course names nine more identities from
    // more than one entry, and every one of them has the same two orders and
    // the same four consumers. Enumerating them from the DATA rather than by
    // hand is what makes a regenerated course — a fourth Ferrer level, a new
    // alias — swept too, instead of silently falling outside a written list.
    const sets = multiEntryIdentities();
    expect(sets.map((x) => x.identity)).toEqual(
      expect.arrayContaining(['work-carulli-valse-op-50-no-7', 'work-fernando-sor-etude-1-op-44']),
    );
    expect(sets.length).toBeGreaterThan(2);

    for (const { identity, entries } of sets) {
      // Every entry naming this work composes the SAME material — the work's,
      // never the entry's. This is the half that was order-dependent.
      const paths = courseFilesFor(...entries[0]).map((f) => f.path);
      for (const e of entries) {
        expect(courseFilesFor(...e).map((f) => f.path), `${identity} at ${e[0]}/${e[1]}`).toEqual(paths);
      }
      // And it is a UNION, not merely agreement: every entry's OWN declared
      // files are in the one list all of them compose. Without this a
      // regression that let the LAST matching entry win would still have every
      // entry agreeing with every other and pass unnoticed. Compared by the
      // whole PATH — every declared file survives composition, never merely one
      // per basename.
      for (const e of entries) {
        const own = declaredFiles(e);
        expect(own.length, `${identity}: ${e[0]}/${e[1]} declares nothing`).toBeGreaterThan(0);
        for (const f of own) expect(paths, `${identity}: ${e[0]}/${e[1]}`).toContain(f);
      }

      const first = entries[0];
      const last = entries[entries.length - 1];
      for (const order of [[first, last], [last, first]] as const) {
        const why = `${identity}: ${order[0][1]} then ${order[1][1]}`;
        const items = addAll(order);
        expect(items, why).toHaveLength(1);
        expect(repertoireWorks(items), why).toHaveLength(1);
        // ONE item, and the WHOLE work's material on it either way round.
        expect(itemFiles(dbWith(items), items[0].id).map((f) => (f as ItemFileReference).path), why).toEqual(paths);
        // Every level that names it shows that item as added, and no tap there
        // claims to have created it — so no Undo can reach it.
        for (const [stageId, key] of entries) {
          expect(stageUnits(stage(stageId), items).find((u) => u.key === key)?.item?.id, `${why} @ ${stageId}`).toBe(
            items[0].id,
          );
          const entry = catalogForStage(stageId).find((e) => e.key === key);
          expect(
            planCatalogAddition({ items, materials: [] }, stageId, key, entry, 'g', NOW).created,
            `${why} @ ${stageId}`,
          ).toBe(false);
        }
      }
    }
  });

  it('keeps every distinct path, even when two share a basename AND a title', () => {
    // THE DEDUP KEY IS THE PATH, AND NOTHING WEAKER. It used to be the
    // BASENAME, to keep the copy of one packet the course ships in each level
    // folder that names it from appearing four times — but a basename is not a
    // file's identity. Two genuinely different scores sharing one (two
    // revisions of Ferrer-Ejercicio.pdf) had the second silently dropped, and
    // nothing on the item said a score was missing. Nothing in this data
    // establishes content identity — a CourseFile is a path, a kind and a
    // title — so completeness wins: a repeated packet is one visible extra row,
    // a hidden one is material the owner cannot see.
    //
    // Driven from the LIVE data rather than a fixture, and from the hardest
    // shape there is: paths the old key could not tell apart even with the
    // title added, which is exactly the counterexample's own shape.
    const collisions = multiEntryIdentities()
      .map(({ identity, entries }) => {
        const byNameAndTitle = new Map<string, Set<string>>();
        for (const e of entries) {
          for (const f of declaredEntries(e)) {
            const k = `${f.path.split('/').pop()}\u0000${f.title}`;
            byNameAndTitle.set(k, (byNameAndTitle.get(k) ?? new Set()).add(f.path));
          }
        }
        return { identity, entries, shared: [...byNameAndTitle.values()].filter((ps) => ps.size > 1) };
      })
      .filter((x) => x.shared.length > 0);

    // NON-VACUITY FIRST. A regenerated course that stopped shipping duplicate
    // basenames would otherwise pass this while asserting nothing at all.
    expect(collisions.length, 'no basename collision left to prove anything with').toBeGreaterThan(0);
    expect(collisions.map((x) => x.identity)).toContain('work-ferrer-ejercicio');

    for (const { identity, entries, shared } of collisions) {
      const composed = courseFilesFor(...entries[0]).map((f) => f.path);
      // Every distinct path survives, and the ROW COUNT says so: a set
      // comparison alone would pass a list that had quietly collapsed them.
      for (const ps of shared) {
        for (const path of ps) expect(composed, `${identity}: ${path}`).toContain(path);
        expect(composed.filter((c) => ps.has(c)).length, identity).toBe(ps.size);
      }
      // And all the way out to the real item's Material, where each copy is its
      // own row with its own stable id rather than a collision.
      const items = addAll([entries[0]]);
      const files = itemFiles(dbWith(items), items[0].id) as ItemFileReference[];
      for (const ps of shared) for (const path of ps) expect(files.map((f) => f.path), identity).toContain(path);
      expect(new Set(files.map((f) => f.id)).size, identity).toBe(files.length);
    }
  });

  it('still creates it the first time, and never reuses across an ordinary per-stage key', () => {
    const chords1B = added(STAGE_1B, 'chords');
    const entry = catalogForStage(STAGE_1C).find((e) => e.key === 'chords');
    const plan = planCatalogAddition({ items: [chords1B], materials: [] }, STAGE_1C, 'chords', entry, 'g', NOW);
    expect(plan.itemId).not.toBe(chords1B.id);
    expect(plan.items).toHaveLength(2);
    expect(plan.created).toBe(true);

    // The ordinary per-stage reuse reports the same thing, so an Undo after
    // tapping “+” on a row that was already added deletes nothing either.
    const again = planCatalogAddition({ items: [chords1B], materials: [] }, STAGE_1B, 'chords', entry, 'g', NOW);
    expect(again.itemId).toBe(chords1B.id);
    expect(again.created).toBe(false);
  });
});

// --- ac-3 -------------------------------------------------------------------

function dbWith(items: PracticeItem[]): PracticeDB {
  return {
    schemaVersion: 14,
    instruments: [],
    materials: [],
    items,
    blocks: [],
    reviews: [],
    lessons: [],
    lessonAgenda: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [],
    attachments: [],
    archiveSources: [],
  } as unknown as PracticeDB;
}

describe("a course item's material", () => {
  const item = added(STAGE_1B, 'piece');

  it("composes a catalogue item's course files without storing any reference on the item", () => {
    // The item stores nothing...
    expect(item.references ?? []).toEqual([]);
    const files = itemFiles(dbWith([item]), item.id);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'video')).toBe(true);
    expect(files.some((f) => f.source === 'reference' && f.kind === 'pdf')).toBe(true);
    // ...and nothing was written back onto it.
    expect(item.references ?? []).toEqual([]);
    // It is read out of the catalogue EVERY time, which is what makes
    // regenerated course data reach an item that already exists.
    expect(files.map((f) => (f as ItemFileReference).path)).toEqual(
      courseFilesFor(STAGE_1B, 'piece').map((f) => f.path),
    );
  });

  it('gives an item from no course nothing at all', () => {
    const plain = createItem({ instrumentId: 'g', title: 'Scales' }, NOW);
    expect(itemFiles(dbWith([plain]), plain.id)).toEqual([]);
  });

  it("composes it for a hand-authored level's own keys too, which name the same sections", () => {
    // Level 1A's fourteen steps predate this course data and the contract keeps
    // them byte for byte, so their keys are slugs of their own titles
    // (`warm-up-stretches`) and match no course unit key (`warm-up`). Left at
    // that, 1A was the ONE level whose items got no course material at all —
    // on the very level the owner starts from. The keys are untouched; what is
    // added is a reading of which course section each one names.
    const catalog = catalogForStage(STAGE_1A);
    expect(catalog.length).toBe(14);

    // EVERY ALIAS NAMES A REAL ENTRY. A stale one would alias nothing and no
    // test would notice, which is exactly how fourteen dead entries ship.
    const keys = new Set(catalog.map((e) => e.key));
    const units = new Set(group('1a').units.map((u) => u.key));
    for (const [unitKey, legacy] of Object.entries(COURSE_LEGACY_KEYS[STAGE_1A])) {
      expect(units.has(unitKey), `no course unit ${unitKey}`).toBe(true);
      for (const k of legacy) expect(keys.has(k), `no 1A catalogue entry ${k}`).toBe(true);
    }

    // The Forest Glade reads the course's own Piece section, and the two
    // right-hand steps share the one Right Hand Technique section the course
    // writes them both from.
    expect(courseFilesFor(STAGE_1A, 'piece-the-forest-glade')).toEqual(
      group('1a').units.find((u) => u.key === 'piece')!.files,
    );
    expect(courseFilesFor(STAGE_1A, 'chunks-right-hand-only')).toEqual(
      courseFilesFor(STAGE_1A, 'thumb-chunks-right-hand-only'),
    );
    // Composed, never stored, exactly as for every other level.
    const glade = added(STAGE_1A, 'piece-the-forest-glade');
    const files = itemFiles(dbWith([glade]), glade.id);
    expect(files.length).toBeGreaterThan(0);
    expect(glade.references ?? []).toEqual([]);

    // Thirteen of the fourteen resolve. The one that does not is named rather
    // than given a guessed section's videos: no course section clearly
    // corresponds to "Technique primer — What is Technique".
    const without = catalog.filter((e) => courseFilesFor(STAGE_1A, e.key).length === 0);
    expect(without.map((e) => e.key)).toEqual(['technique-primer-what-is-technique']);
  });
});

// --- ac-4, ac-5, ac-6 -------------------------------------------------------

// The values the owner's own devices actually carry.
const MAC_ARCHIVE_BASE = 'https://192.168.0.20:5010/setar-classes';
const PHONE_ARCHIVE_BASE = 'https://ds220plus.taild1d1f7.ts.net/media/setar-classes';

describe('which base a composed reference resolves against', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];
  const archiveRef = { path: 'session-39-1405-06-13/01-correction.mp4' };

  it('resolves a course file under the shared media root and leaves archive resolution unchanged', () => {
    // The Mac, over the LAN.
    expect(courseFile.path.startsWith('classical-guitar/classical-guitar-shed/Level_1B/')).toBe(true);
    expect(resolveRecording(mediaRoot({ archiveBase: MAC_ARCHIVE_BASE }) ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://192.168.0.20:5010/${courseFile.path}`,
    });
    expect(resolveRecording(MAC_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${MAC_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });

    // The phone, over Tailscale — each keeps its own path prefix.
    const phoneRoot = mediaRoot({ archiveBase: PHONE_ARCHIVE_BASE });
    expect(phoneRoot).toBe('https://ds220plus.taild1d1f7.ts.net/media');
    expect(resolveRecording(phoneRoot ?? undefined, courseFile)).toEqual({
      status: 'ok',
      url: `https://ds220plus.taild1d1f7.ts.net/media/${courseFile.path}`,
    });
    expect(resolveRecording(PHONE_ARCHIVE_BASE, archiveRef)).toEqual({
      status: 'ok',
      url: `${PHONE_ARCHIVE_BASE}/session-39-1405-06-13/01-correction.mp4`,
    });

    // AND EACH COMPOSED REFERENCE PICKS ITS OWN BASE. The two resolutions
    // above prove the arithmetic; this is what makes a real item use it —
    // without it a course file would be pushed through the archive base and
    // 404, and a class recording through the root, landing a folder too high.
    const item = added(STAGE_1B, 'scales');
    const composed = itemFiles(dbWith([item]), item.id).filter(
      (f): f is ItemFileReference => f.source === 'reference',
    );
    expect(composed.length).toBeGreaterThan(0);
    const bases = { archiveBase: MAC_ARCHIVE_BASE, mediaRoot: mediaRoot({ archiveBase: MAC_ARCHIVE_BASE }) };
    for (const f of composed) {
      expect(f.root).toBe('media');
      expect(baseForItemFile(f, bases)).toBe('https://192.168.0.20:5010');
      expect(resolveRecording(baseForItemFile(f, bases), f)).toEqual({
        status: 'ok',
        url: `https://192.168.0.20:5010/${f.path}`,
      });
    }
    expect(baseForItemFile({ root: 'archive' } as ItemFileReference, bases)).toBe(MAC_ARCHIVE_BASE);
  });
});

describe('a course file with no media root behind it', () => {
  const courseFile = courseFilesFor(STAGE_1B, 'scales')[0];

  it('reports no-base for a course file when no media root is derivable or set', () => {
    // The LEGACY archive base, one folder too high: it IS the media root, so
    // nothing is derivable from it and nothing is guessed.
    const root = mediaRoot({ archiveBase: 'https://192.168.0.20:5010/' });
    expect(root).toBeNull();
    const resolution = resolveRecording(root ?? undefined, courseFile);
    expect(resolution).toEqual({ status: 'no-base' });
    // Honestly unavailable, never a dead link: the material row's Open is
    // enabled only for `ok`.
    expect(resolution.status === 'ok').toBe(false);
    // And the same for a device with nothing configured at all.
    expect(resolveRecording(mediaRoot({}) ?? undefined, courseFile)).toEqual({ status: 'no-base' });
  });
});

// --- ac-7, ac-8, ac-9, ac-10 ------------------------------------------------

describe('"Build one for where I am"', () => {
  it("builds a position routine from added current-level items plus the previous level's essentials", () => {
    const arp = added(STAGE_1C, 'arpeggios');
    const items = [arp, added(STAGE_1C, 'scales')];
    const segments = buildPositionRoutine(CGS_COURSE, '1c', items);
    expect(segments.map((s) => s.label)).toEqual([
      // 1B's essentials — the maintenance the syllabus itself carries forward.
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
      // 1C, only what has been added.
      '1C Arpeggios',
      '1C Scales',
    ]);
    expect(segments.slice(0, 3).every((s) => s.essential)).toBe(true);
    // Each current-level segment is bound to the item it was matched to;
    // nothing was added in 1B, so its maintenance segments are unbound
    // countdowns rather than fabricated bindings.
    expect(segments.find((s) => s.label === '1C Arpeggios')?.itemId).toBe(arp.id);
    expect(segments.find((s) => s.label === '1B Scales')?.itemId).toBeUndefined();
  });

  it('is just the added sections for the first level, which has no previous one', () => {
    const items = [added(STAGE_1B, 'scales')];
    expect(buildPositionRoutine(CGS_COURSE, '1a', items)).toEqual([]);
  });

  it("binds a hand-authored level's carried-forward essentials to the items that stand for them", () => {
    // 1B's "where I am" carries 1A's essentials forward — and 1A is the level
    // whose catalogue keys are hand-authored, so before this those three
    // segments could NEVER bind to an item however much 1A the owner had
    // added: unbound countdowns on the level they have actually practised.
    const oneA = catalogForStage(STAGE_1A).map((e) => added(STAGE_1A, e.key));
    const position = buildPositionRoutine(CGS_COURSE, '1b', oneA);
    expect(position.map((s) => s.label)).toEqual([
      '1A Warm Up',
      '1A Right Hand Technique (*Most important going forward *)',
      '1A Piece — The Forest Glade',
    ]);
    expect(position.every((s) => s.itemId)).toBe(true);
    const glade = oneA.find((i) => i.catalogKey === 'piece-the-forest-glade');
    expect(position[2].itemId).toBe(glade!.id);

    // And 1A's own "where I am" is no longer EMPTY with all fourteen added,
    // which is the shape the gap took: it had no previous level and could
    // match none of its own sections either, so it built nothing at all.
    const own1A = buildPositionRoutine(CGS_COURSE, '1a', oneA);
    expect(own1A).toHaveLength(group('1a').routine.length);
    expect(own1A.every((s) => s.itemId)).toBe(true);

    // 1A's OWN routine binds the same way, and a many-to-one section takes the
    // first of the keys it stands for that has an item — deterministic, never
    // whichever the array happened to hold first.
    expect(buildLevelRoutine(CGS_COURSE, '1a', oneA).every((s) => s.itemId)).toBe(true);
    const onlyThumb = oneA.filter((i) => i.catalogKey === 'thumb-chunks-right-hand-only');
    expect(
      buildLevelRoutine(CGS_COURSE, '1a', onlyThumb).find((s) => /Right Hand Technique/.test(s.label))?.itemId,
    ).toBe(onlyThumb[0].id);
    // And an empty 1A still carries the maintenance as unbound countdowns
    // rather than fabricating a binding.
    expect(buildPositionRoutine(CGS_COURSE, '1b', []).every((s) => s.itemId === undefined)).toBe(true);
  });
});

describe('a section the owner has not reached yet', () => {
  it('omits a current-level segment whose catalogue item has not been added', () => {
    const items = [added(STAGE_1C, 'arpeggios')];
    const position = buildPositionRoutine(CGS_COURSE, '1c', items);
    const full = buildLevelRoutine(CGS_COURSE, '1c', items);

    expect(position.map((s) => s.label)).not.toContain('1C Sight-Reading');
    expect(full.map((s) => s.label)).toContain('1C Sight-Reading');
    // Absent, not skipped: the full routine keeps every one of its own segments.
    expect(full.map((s) => s.label)).toEqual(group('1c').routine.map((s) => s.label));
  });
});

describe('the segment-to-item join', () => {
  it('joins a segment to its item by stage and catalogue key together, never by key alone', () => {
    // `chords` exists in every level. An item added in 1B must not enable 1C's.
    const chords1B = added(STAGE_1B, 'chords');
    const segments = buildPositionRoutine(CGS_COURSE, '1c', [chords1B]);
    expect(segments.map((s) => s.label)).not.toContain('1C Chords');
    expect(segments.find((s) => s.label === '1B Arpeggios')?.itemId).toBeUndefined();

    // And with an item under the same key in BOTH levels, each binds its own.
    const chords1C = added(STAGE_1C, 'chords');
    const full = buildLevelRoutine(CGS_COURSE, '1c', [chords1B, chords1C]);
    expect(full.find((s) => s.label === '1C Chords')?.itemId).toBe(chords1C.id);
  });
});

describe('what adding an item does and does not enable', () => {
  it('ignores an added repertoire work when building the position routine and includes an added practice section', () => {
    const work = added(STAGE_1C, group('1c').works[0].key);
    expect(isWork(work)).toBe(true);
    expect(buildPositionRoutine(CGS_COURSE, '1c', [work]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
    ]);

    const section = added(STAGE_1C, 'rhythm-study');
    expect(buildPositionRoutine(CGS_COURSE, '1c', [work, section]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
      '1C Rhythm Study',
    ]);
  });

  it('enables nothing for an item the owner created by hand with no catalogue key', () => {
    const byHand = createItem({ instrumentId: 'g', title: 'My own thing', stageId: STAGE_1C }, NOW);
    expect(buildPositionRoutine(CGS_COURSE, '1c', [byHand]).map((s) => s.label)).toEqual([
      '1B Arpeggios',
      '1B Scales',
      '1B Piece — Study #1',
    ]);
  });
});

// --- ac-13 ------------------------------------------------------------------

function stage(id: string, over: Partial<PathwayStage> = {}): PathwayStage {
  return {
    id,
    pathwayId: CGS_COURSE.pathwayId,
    code: id,
    title: id,
    order: 0,
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...over,
  };
}

describe('"Add new levels from this course"', () => {
  const present = ['1a', '1b', '1c'].map((k) => stage(courseStageId(CGS_COURSE, k)));

  it('offers only the course levels absent from an existing pathway and never a renamed one already present', () => {
    const offered = offeredCourseLevels(CGS_COURSE, present).map((o) => o.groupKey);
    expect(offered).not.toContain('1a');
    expect(offered).not.toContain('1c');
    expect(offered).toContain('1d');
    expect(offered.length).toBe(CGS_COURSE.groups.length - 3);

    // Presence is the stage ID, never the title, so a renamed level is present.
    const renamed = [stage(courseStageId(CGS_COURSE, '2a'), { code: 'My warm-ups', title: 'Whatever I like' })];
    expect(offeredCourseLevels(CGS_COURSE, renamed).map((o) => o.groupKey)).not.toContain('2a');

    // And only what was explicitly selected is added.
    const next = planCourseLevels(CGS_COURSE, present, ['1d'], NOW);
    expect(next.filter((s) => !present.includes(s)).map((s) => s.id)).toEqual([
      courseStageId(CGS_COURSE, '1d'),
    ]);
    expect(next).toHaveLength(present.length + 1);
  });

  it('adds NOTHING on its own, so a deliberately deleted stage is offered but never recreated', () => {
    // 1B deleted: it is offered again...
    const afterDeletion = present.filter((s) => s.id !== courseStageId(CGS_COURSE, '1b'));
    expect(offeredCourseLevels(CGS_COURSE, afterDeletion).map((o) => o.groupKey)).toContain('1b');
    // ...but selecting nothing changes nothing, and the collection is untouched.
    expect(planCourseLevels(CGS_COURSE, afterDeletion, [], NOW)).toBe(afterDeletion);
  });

  it('ignores a selection naming a level the pathway already has, rather than duplicating it', () => {
    expect(planCourseLevels(CGS_COURSE, present, ['1c'], NOW)).toBe(present);
  });

  it('gives the added stage the deterministic id the catalogue is keyed by', () => {
    const next = planCourseLevels(CGS_COURSE, present, ['3f'], NOW);
    const addedStage = next[next.length - 1];
    expect(addedStage.id).toBe(courseStageId(CGS_COURSE, '3f'));
    expect(catalogForStage(addedStage.id).length).toBeGreaterThan(0);
  });
});

// --- ac-14 ------------------------------------------------------------------

describe("the course's own study source", () => {
  it('returns an existing study source when one matches and mints one only when none does', () => {
    // Minted on first use, and the item is grouped under it.
    const first = planCatalogAddition({ items: [], materials: [] }, STAGE_1B, 'scales', catalogForStage(STAGE_1B).find((e) => e.key === 'scales'), 'g', NOW);
    expect(first.materials).toHaveLength(1);
    expect(first.materials[0].title).toBe('Classical Guitar Shed');
    expect(first.items[0].materialId).toBe(first.materials[0].id);

    // A second course item returns the SAME collection — never a duplicate.
    const second = planCatalogAddition(
      { items: first.items, materials: first.materials },
      STAGE_1C,
      'chords',
      catalogForStage(STAGE_1C).find((e) => e.key === 'chords'),
      'g',
      NOW,
    );
    expect(second.materials).toHaveLength(1);
    expect(second.materials).toBe(first.materials);
    expect(second.items[1].materialId).toBe(first.materials[0].id);
  });

  it('matches on the source the owner may already have created by hand', () => {
    const mine = createMaterial({ instrumentId: 'g', title: '  classical guitar shed ' }, NOW);
    const r = resolveCourseSource([mine], CGS_COURSE, 'g', NOW);
    expect(r.materialId).toBe(mine.id);
    expect(r.materials).toHaveLength(1);
  });

  it('mints a separate one per instrument, because a source belongs to one', () => {
    const forGuitar = resolveCourseSource([], CGS_COURSE, 'g', NOW);
    const forOther = resolveCourseSource(forGuitar.materials, CGS_COURSE, 'other', NOW);
    expect(forOther.materials).toHaveLength(2);
    expect(forOther.materialId).not.toBe(forGuitar.materialId);
  });
});
```

### src/domain/courseSeed.ts

```
import { createItem, createMaterial, itemFromCatalogEntry } from './factories';
import { CGS_CHECKLISTS, CGS_COURSE } from './courseData';
import type {
  CatalogEntry,
  ID,
  Material,
  PathwayRoutine,
  PathwayStage,
  PracticeItem,
  RoutineSegment,
  StepKind,
  StepStrand,
} from './types';
import { newId, nowISO } from './util';

// ---------------------------------------------------------------------------
// A COURSE the owner already owns, read as reference data in code.
//
// `courseData.ts` is the SCANNER'S OUTPUT (`scripts/scan-cgs-course.mjs`) and
// is never edited by hand; this module is the hand-written reader that turns it
// into the things the app already understands — stage seeds, catalogue entries,
// composed material and ordinary editable routines. Nothing here is persisted:
// no schema change, no migration, no new inbound door. That is what makes
// re-running the scanner after a course change reach every item that already
// exists — course material is DERIVED from the catalogue, never copied onto an
// item.
//
// It is deliberately NOT the Setar archive machinery. That source grows, gets
// renamed and carries piece identity to reconcile against existing repertoire,
// which is why it needs a published index, a digest and a reconciler. A
// downloaded course has none of that: it is a fixed tree whose own `notes.md`
// and `LEVEL_GUIDE.md` already state everything, so it belongs on the rung
// `pathwaySeed.ts` already stands on.
//
// The data is shaped as ordered GROUPS of UNITS, not as "levels", and how many
// there are is data. Buying Levels 4A-5F later is therefore: re-run the
// scanner, ship the regenerated data, and use the course-scoped "Add new levels
// from this course" action — never a migration.
// ---------------------------------------------------------------------------

export type CourseFileKind = 'video' | 'pdf' | 'image' | 'audio' | 'doc' | 'folder';

export interface CourseFile {
  /** Path relative to the shared MEDIA ROOT, never to the archive base. */
  path: string;
  kind: CourseFileKind;
  title: string;
}

export interface CourseUnit {
  /** Catalogue key. STABLE: keys are added, never renamed. */
  key: string;
  title: string;
  strand: StepStrand;
  /**
   * The REPERTOIRE IDENTITY of the single work this section studies, where the
   * course names one — separate from `key`, which is the catalogue key and
   * stays `piece`. Absent on every section that is not one work.
   */
  workKey?: string;
  mediaPath: string;
  files: CourseFile[];
  guidance?: string;
  /** Index into the course's deduplicated per-strand practice checklists. */
  checklistKey?: string;
  /** Watch once — not daily practice, and never in a routine. */
  reference?: boolean;
  routineMinutes?: number;
  essential?: boolean;
  bpm?: number;
}

/**
 * A named work from the level's practice packet — a real piece with a real
 * composer, the only thing besides the level's own study that may reach My
 * repertoire.
 *
 * The key is derived from the WORK, not from the level, so a work carried
 * forward across levels (Ferrer Ejercicio runs 2C-2F) is ONE entry the owner
 * adds once.
 */
export interface CourseWork {
  key: string;
  title: string;
  file?: string;
  /**
   * Set only where this entry is a work already identified under ANOTHER name
   * — a level's own study re-listed in a later level's packet. Absent means the
   * entry's own `key` IS its identity, which is what already joins a work
   * carried across levels under one title.
   */
  workKey?: string;
}

export interface CourseRoutineSegment {
  /** The unit this segment is FOR — its own declared catalogue key. */
  unitKey: string;
  label: string;
  minutes: number;
  essential?: boolean;
}

export interface CourseGroup {
  key: string;
  code: string;
  title: string;
  group: string;
  mediaPath: string;
  units: CourseUnit[];
  works: CourseWork[];
  routine: CourseRoutineSegment[];
}

export interface CourseData {
  id: string;
  /** The pathway this course's stages belong to. */
  pathwayId: string;
  name: string;
  /** The study source every item created from this course is grouped under. */
  sourceName: string;
  /** The course's own folder beneath the shared media root. */
  mediaPath: string;
  /** What the scanner could not read — reported, never silently dropped. */
  diagnostics: string[];
  groups: CourseGroup[];
}

/** Every course the app ships data for. A second course is a second entry. */
export const COURSES: CourseData[] = [CGS_COURSE];

/** Stage ids are deterministic and byte-identical to `stageIdFor(pathwayId, code)`. */
export function courseStageId(course: CourseData, groupKey: string): string {
  return `${course.pathwayId}-${groupKey}`;
}

export function courseById(id: string): CourseData | undefined {
  return COURSES.find((c) => c.id === id);
}

export function courseForPathway(pathwayId: string): CourseData | undefined {
  return COURSES.find((c) => c.pathwayId === pathwayId);
}

function groupForStage(course: CourseData, stageId: string): CourseGroup | undefined {
  return course.groups.find((g) => courseStageId(course, g.key) === stageId);
}

/** The course, group and stage a stage id names — or nothing, for a stage no course owns. */
export function courseStage(stageId: string): { course: CourseData; group: CourseGroup } | undefined {
  for (const course of COURSES) {
    const group = groupForStage(course, stageId);
    if (group) return { course, group };
  }
  return undefined;
}

// --- stage seeds -------------------------------------------------------------

/** The shape `pathwaySeed.ts` expands into stages and catalogue entries. */
export interface CourseStepSeed {
  key: string;
  title: string;
  strand: StepStrand;
  kind?: StepKind;
  notes?: string;
  about?: string;
  bpm?: number;
}

export interface CourseStageSeed {
  slug: string;
  code: string;
  title: string;
  group: string;
  intro?: string;
  steps: CourseStepSeed[];
}

/** The level's own practice guidance plus the course's checklist for its strand. */
function unitNotes(unit: CourseUnit): string | undefined {
  const checklist = unit.checklistKey ? CGS_CHECKLISTS[unit.checklistKey] : undefined;
  const parts = [
    unit.guidance?.trim(),
    unit.bpm ? `Syllabus target: ${unit.bpm} bpm.` : undefined,
    checklist ? `Each session:\n${checklist}` : undefined,
  ].filter(Boolean);
  return parts.length ? parts.join('\n\n') : undefined;
}

const WORK_NOTE = (code: string) =>
  `Optional repertoire from the Level ${code} practice packet. Learn it when it appeals — nothing here is a deadline.`;

/**
 * One stage seed per course group, its real sections followed by the level's
 * named packet works.
 *
 * `skipCodes` is how a level whose steps are HAND-AUTHORED keeps them: Level 1A
 * was written out from the syllabus before this scanner existed, and the
 * contract keeps it byte-for-byte.
 */
export function courseStageSeeds(course: CourseData, skipCodes: string[] = []): CourseStageSeed[] {
  const skip = new Set(skipCodes.map((c) => c.toLowerCase()));
  return course.groups
    .filter((g) => !skip.has(g.key))
    .map((g) => ({
      slug: g.key,
      code: g.code,
      title: g.title,
      group: g.group,
      intro: g.units.find((u) => u.key === 'welcome')?.guidance?.split('\n').find((l) => l.trim())?.trim(),
      steps: [
        ...g.units.map((u) => ({
          key: u.key,
          title: u.title,
          strand: u.strand,
          kind: u.strand === 'piece' ? ('piece' as StepKind) : undefined,
          notes: unitNotes(u),
          bpm: u.bpm,
        })),
        // The packet works. `strand: 'piece'` is what makes them — and ONLY
        // them and the level's own study section — repertoire works. One work
        // is one repertoire ITEM however many entries name it; that join is
        // `courseWorkKey`, never a second entry removed here.
        ...g.works.map((w) => ({
          key: w.key,
          title: w.title,
          strand: 'piece' as StepStrand,
          kind: 'piece' as StepKind,
          notes: WORK_NOTE(g.code),
        })),
      ],
    }));
}

// --- legacy catalogue keys the course's own sections stand for ---------------

/**
 * A HAND-AUTHORED STAGE'S OWN KEYS, MAPPED ONTO THE COURSE SECTIONS THEY NAME.
 *
 * Level 1A was written out from the syllabus before this scanner existed and
 * the contract keeps its fourteen steps byte for byte — so its catalogue keys
 * are slugs of their own titles (`warm-up-stretches`) and match no course unit
 * key (`warm-up`). Left at that, 1A was the one level whose items got no course
 * material at all, AND the one level whose essentials 1B's "where I am" routine
 * carries forward — so those segments could never bind to an item either. The
 * keys themselves are untouched: this ADDS a reading of them, exactly as the
 * scanner's own rule adds keys and never renames one.
 *
 * COURSE UNIT KEY → the legacy keys it stands for, IN ORDER. Many-to-one is
 * deliberate and is what the course itself says: the Chunks and Thumb-chunks
 * steps are both the one Right Hand Technique section, and its videos are the
 * material for both. Where a routine segment has to pick ONE item, it takes the
 * first key in this list that has one, so the choice is deterministic.
 *
 * Every key here is asserted against the live catalogue in `courseSeed.test.ts`
 * — a stale entry FAILS rather than quietly aliasing nothing. ONE of 1A's
 * fourteen steps is deliberately absent, "Technique primer — What is Technique",
 * because no course section clearly corresponds to it: it gets no composed
 * material, which is honest, rather than a guessed section's videos. (The
 * course's own orientation units — Welcome, First Things First, Syllabus and
 * Materials — simply have no hand-authored step, which costs nothing: they are
 * reached from the stage's other levels and are in no routine.)
 */
export const COURSE_LEGACY_KEYS: Record<string, Record<string, string[]>> = {
  'cgs-1a': {
    'warm-up': ['warm-up-stretches'],
    // The course's own Finger Walking exercise lives in its LEFT hand section,
    // whatever strand the hand-authored step was given.
    'left-hand-exercises': ['finger-walking'],
    'contrast-cards': ['contrast-practice-right-hand'],
    'right-hand-technique': ['chunks-right-hand-only', 'thumb-chunks-right-hand-only'],
    chords: ['3-note-chords', '3-note-chords-with-chunks'],
    'rhythm-study': ['rhythm-practice-1-clap-count-aloud'],
    'sight-reading': ['notes-on-the-1st-string', 'sight-reading-practice-1-play-along'],
    piece: ['piece-the-forest-glade'],
    'background-knowledge': ['reading-music-how-notes-work-musical-notation'],
    'ready-for': ['checkpoint-ready-for-1b'],
  },
};

/** The legacy catalogue keys one course unit stands for at one stage. */
function legacyKeysFor(stageId: string, unitKey: string): string[] {
  return COURSE_LEGACY_KEYS[stageId]?.[unitKey] ?? [];
}

// --- composed material -------------------------------------------------------

/** A packet work's own score, as one composed file. */
function workFile(work: CourseWork): CourseFile[] {
  return work.file ? [{ path: work.file, kind: 'pdf', title: work.title }] : [];
}

/** The files ONE catalogue entry of this course declares, and nothing else. */
function entryFiles(
  found: { course: CourseData; group: CourseGroup },
  stageId: string,
  catalogKey: string,
): CourseFile[] {
  const unit = found.group.units.find(
    (u) => u.key === catalogKey || legacyKeysFor(stageId, u.key).includes(catalogKey),
  );
  if (unit) return unit.files;
  const work = found.group.works.find((w) => w.key === catalogKey);
  return work ? workFile(work) : [];
}

/**
 * The course files that belong to one catalogue entry — its section's videos,
 * scores, images and contrast-card folder, or a packet work's own score.
 *
 * COMPOSED, NEVER STORED. The item holds nothing but the stage and the
 * catalogue key it was created from; the files come from the course data every
 * time they are read, so regenerating that data reaches every item that already
 * exists and the owner never types a link.
 *
 * AND A WORK'S MATERIAL IS EVERY ENTRY THAT NAMES THAT WORK, NOT ONLY THE ONE
 * THE ITEM HAPPENED TO BE CREATED FROM. `carriedCourseWorkItem` already makes
 * one musical work ONE item however many entries name it — so composing from
 * the item's own `stageId`/`catalogKey` alone made the material depend on
 * WHICH entry was added first: take 2E's Carulli Valse section and 3F's packet
 * score was unreachable from it; take the 3F packet entry first and 2E's own
 * section material was. Identity governs here for the same reason it governs
 * the tap, the row and the routine binding: the item is the work, so its
 * material is the work's. The scan is deterministic — course order, units then
 * works within a group — so both addition orders compose the SAME list, not
 * merely the same set.
 *
 * Deduplication is by the file's OWN PATH, and by nothing weaker. It used to
 * be by BASENAME, to keep the copy of one packet the course ships in each
 * level's folder that names it (Ferrer Ejercicio runs 2C-2F) from appearing
 * four times — but a basename is not a file's identity. Two genuinely
 * different scores that happen to share one (two revisions of
 * `Ferrer-Ejercicio.pdf`, a regenerated course that renamed a folder rather
 * than its files) then had the second SILENTLY DROPPED from the one list the
 * work's material is composed into, and nothing about the item said a score
 * was missing. Nothing in this data establishes content identity — a
 * `CourseFile` is a path, a kind and a title, with no size and no digest — so
 * there is nothing here to collapse a copy on, and COMPLETENESS BEATS TIDINESS:
 * a repeated packet costs the owner one extra row they can see, where a hidden
 * one costs them material they cannot. A path IS authoritative, and it is the
 * same reading the scanner's own `packetWorks` dedup uses (`seen.has(file)` on
 * the full relative path). `itemFiles` keys its own rows by path too, so each
 * copy is a distinct, stable row rather than a collision.
 *
 * An ORDINARY per-stage key carries no identity at all — `chords` exists in
 * every level — so it composes only its own section, exactly as before.
 */
export function courseFilesFor(stageId: string, catalogKey: string): CourseFile[] {
  const found = courseStage(stageId);
  if (!found) return [];
  const identity = courseWorkKey(found, stageId, catalogKey);
  if (!identity) return entryFiles(found, stageId, catalogKey);

  const out: CourseFile[] = [];
  const seen = new Set<string>();
  const take = (files: CourseFile[]) => {
    for (const f of files) {
      if (seen.has(f.path)) continue;
      seen.add(f.path);
      out.push(f);
    }
  };
  for (const group of found.course.groups) {
    for (const u of group.units) if (u.workKey === identity) take(u.files);
    for (const w of group.works) if ((w.workKey ?? w.key) === identity) take(workFile(w));
  }
  return out;
}

// --- routines ----------------------------------------------------------------

/** A course segment bound to the item the owner created from its unit, if any. */
function toSegment(
  seg: CourseRoutineSegment,
  stageId: string,
  itemsByKey: Map<string, PracticeItem>,
  items: PracticeItem[],
): RoutineSegment {
  const item = unitItem(stageId, seg.unitKey, itemsByKey, items);
  return {
    label: seg.label,
    minutes: seg.minutes,
    ...(seg.essential ? { essential: true } : {}),
    ...(item ? { itemId: item.id } : {}),
  };
}

/**
 * A SEGMENT IS JOINED TO ITS ITEM BY STAGE AND CATALOGUE KEY TOGETHER.
 * `CatalogEntry.key` is unique per stage, not globally — `chords` exists in
 * every level — and a position routine spans two stages by construction, so a
 * key-only lookup would silently bind the wrong level's item.
 */
function itemsByStageAndKey(items: PracticeItem[]): Map<string, PracticeItem> {
  const out = new Map<string, PracticeItem>();
  for (const i of items) {
    if (i.stageId && i.catalogKey) out.set(`${i.stageId}\u0000${i.catalogKey}`, i);
  }
  return out;
}

/**
 * The item a course unit's segment binds to: the one created from the unit's
 * own key, else — for a hand-authored stage — the first of the legacy keys it
 * stands for that has one. ONE resolution, used by every routine this module
 * builds, so a level whose catalogue predates the course is not a level whose
 * carried-forward essentials can never bind.
 */
function unitItem(
  stageId: string,
  unitKey: string,
  itemsByKey: Map<string, PracticeItem>,
  items: PracticeItem[],
): PracticeItem | undefined {
  const direct = itemsByKey.get(`${stageId}\u0000${unitKey}`);
  if (direct) return direct;
  for (const legacy of legacyKeysFor(stageId, unitKey)) {
    const item = itemsByKey.get(`${stageId}\u0000${legacy}`);
    if (item) return item;
  }
  // A Piece section that IS a work resolves by that work's IDENTITY too, so a
  // study taken from the later level that re-lists it still binds here. The
  // stage ROW already shows that item as added; a segment that left it out
  // would be the same split resolution `carriedCourseWorkItem`'s own docstring
  // exists to refuse, one surface further on. An ordinary section carries no
  // identity, so nothing else widens.
  return carriedCourseWorkItem(stageId, unitKey, items);
}

/** The level's own routine, exactly as its syllabus states it. */
export function buildLevelRoutine(
  course: CourseData,
  groupKey: string,
  items: PracticeItem[],
): RoutineSegment[] {
  const group = course.groups.find((g) => g.key === groupKey);
  if (!group) return [];
  const stageId = courseStageId(course, groupKey);
  const byKey = itemsByStageAndKey(items);
  return group.routine.map((s) => toSegment(s, stageId, byKey, items));
}

/**
 * "Build one for where I am" — the PREVIOUS level's essential segments (the
 * maintenance the syllabus itself says carries forward) followed by only the
 * segments of the current level whose catalogue item the owner has ACTUALLY
 * ADDED.
 *
 * The catalogue-to-item flow is the position marker; no new stored concept is
 * needed and none is introduced. A segment is matched by its OWN declared
 * catalogue key, never by how many items the stage now holds — so adding one of
 * the level's optional repertoire works enables nothing, and an item the owner
 * created by hand with no catalogue key is not one of the course's sections.
 *
 * The result is ORDINARY EDITABLE DATA: a segment the marker leaves out is one
 * edit away from being added back.
 */
export function buildPositionRoutine(
  course: CourseData,
  groupKey: string,
  items: PracticeItem[],
): RoutineSegment[] {
  const index = course.groups.findIndex((g) => g.key === groupKey);
  if (index < 0) return [];
  const byKey = itemsByStageAndKey(items);
  const out: RoutineSegment[] = [];

  const previous = course.groups[index - 1];
  if (previous) {
    const prevStageId = courseStageId(course, previous.key);
    for (const s of previous.routine) {
      if (s.essential) out.push(toSegment(s, prevStageId, byKey, items));
    }
  }

  const stageId = courseStageId(course, groupKey);
  for (const s of course.groups[index].routine) {
    if (unitItem(stageId, s.unitKey, byKey, items)) out.push(toSegment(s, stageId, byKey, items));
  }
  return out;
}

export function courseRoutineName(group: CourseGroup, kind: 'level' | 'position'): string {
  return kind === 'level'
    ? `${group.code} · the course routine`
    : `${group.code} · where I am`;
}

/** A whole, ordinary editable routine placed in the course's own stage. */
export function courseRoutine(
  course: CourseData,
  group: CourseGroup,
  segments: RoutineSegment[],
  instrumentId: ID | undefined,
  order: number,
  kind: 'level' | 'position',
  now: Date,
): PathwayRoutine {
  const ts = nowISO(now);
  return {
    id: newId(),
    pathwayId: course.pathwayId,
    stageId: courseStageId(course, group.key),
    instrumentId,
    name: courseRoutineName(group, kind),
    segments,
    order,
    createdAt: ts,
    updatedAt: ts,
  };
}

// --- the study source --------------------------------------------------------

export interface CourseSourceResolution {
  /** The materials collection to install — the SAME array when none was minted. */
  materials: Material[];
  materialId: ID;
}

/**
 * The course's own study source, FOUND OR CREATED — never a duplicate.
 *
 * A second item created from the same course must group under the same "Classical
 * Guitar Shed" source in My repertoire, so this returns the existing Material
 * whenever one already matches (same instrument, same title) and mints one only
 * when none does. The caller installs `materials` in the SAME `set()` as the
 * item, so the two can never be applied apart.
 */
export function resolveCourseSource(
  materials: Material[],
  course: CourseData,
  instrumentId: ID,
  now: Date,
): CourseSourceResolution {
  const title = course.sourceName.trim().toLowerCase();
  const existing = materials.find(
    (m) => m.instrumentId === instrumentId && m.title.trim().toLowerCase() === title,
  );
  if (existing) return { materials, materialId: existing.id };
  const mat = createMaterial(
    { instrumentId, title: course.sourceName, sourceType: 'course', sourceName: course.name },
    now,
  );
  return { materials: [...materials, mat], materialId: mat.id };
}

// --- adding a catalogue entry ------------------------------------------------

export interface CatalogAddition {
  items: PracticeItem[];
  materials: Material[];
  itemId: ID;
  /**
   * Whether this addition actually CREATED the item, or handed back one that
   * already existed. An Undo may only ever reach a created one: an item the
   * owner added at an earlier level is not this tap's to delete.
   */
  created: boolean;
}

interface CatalogAdditionDB {
  items: PracticeItem[];
  materials: Material[];
}

/**
 * Everything adding one catalogue suggestion changes, as ONE value the store
 * applies in a single `set()`. The Node test environment cannot import the
 * store (it pulls in Dexie through `./idb`), so the DECISION is proved here and
 * the SHAPE is what protects the wiring — the same reason `installDatabase`
 * returns its ephemeral resets alongside the database.
 *
 * Two course rules ride on top of what adding a suggestion has always done:
 *
 *  • A WORK CARRIED FORWARD ACROSS LEVELS IS ONE WORK. Adding Ferrer Ejercicio
 *    from 2E reuses the item created from 2C rather than putting a second copy
 *    in My repertoire. This lookup is deliberately CROSS-STAGE and deliberately
 *    restricted to course works, whose keys are derived from the work itself;
 *    the ordinary per-stage reuse below is unchanged, so a `chords` item in 1B
 *    can never be reused by 2B's `chords`.
 *  • A COURSE ITEM IS GROUPED UNDER THE COURSE'S OWN STUDY SOURCE, found or
 *    created on first use.
 */
export function planCatalogAddition(
  db: CatalogAdditionDB,
  stageId: ID,
  entryKey: string,
  entry: CatalogEntry | undefined,
  instrumentId: ID,
  now: Date,
): CatalogAddition {
  // Reuse an existing item already created from this catalogue entry — at this
  // stage, or, for a work the course carries across levels, wherever in the
  // same course it was first added.
  const existing =
    db.items.find((i) => i.stageId === stageId && i.catalogKey === entryKey) ??
    carriedCourseWorkItem(stageId, entryKey, db.items);
  if (existing) {
    return { items: db.items, materials: db.materials, itemId: existing.id, created: false };
  }

  const found = courseStage(stageId);
  const base = entry
    ? itemFromCatalogEntry(entry, instrumentId, now)
    : createItem({ instrumentId, title: 'New item', stageId }, now);

  if (!found) return { items: [...db.items, base], materials: db.materials, itemId: base.id, created: true };

  const source = resolveCourseSource(db.materials, found.course, instrumentId, now);
  const item = { ...base, materialId: source.materialId };
  return { items: [...db.items, item], materials: source.materials, itemId: item.id, created: true };
}

/**
 * THE ONE ITEM A COURSE WORK IS, WHEREVER IN THIS COURSE IT WAS FIRST ADDED.
 *
 * ONE MUSICAL WORK IS ONE REPERTOIRE ITEM. The course names the same work in
 * more than one place — Ferrer Ejercicio runs 2C-2F, and a level's own study
 * can reappear in a later level's practice packet — so adding it the second
 * time must hand back the item created the first. This is the single rule that
 * says so, and BOTH readers go through it: `planCatalogAddition`, so the tap
 * reuses, and `stageUnits` (`pathways.ts`), so the row SHOWS it as added.
 *
 * Splitting those two apart is a defect this closes rather than the shape it
 * keeps: the later row read as an untaken suggestion, its “+” reported “Added”
 * for an item created weeks earlier at another level, and Undo then offered to
 * delete it. One resolution, one answer on every surface.
 *
 * It is deliberately narrow, and the narrowing is `courseWorkKey` below: only
 * an entry the CURRENT stage's own course declares to BE a work resolves at
 * all, and only against an item sitting in a stage of that SAME course. An
 * ordinary per-stage key carries no identity, so a `chords` item in 1B can
 * never be reused by 2B's.
 */
export function carriedCourseWorkItem(
  stageId: ID,
  entryKey: string,
  items: PracticeItem[],
): PracticeItem | undefined {
  const found = courseStage(stageId);
  const identity = found && courseWorkKey(found, stageId, entryKey);
  // The identity check comes FIRST, so an ordinary per-stage key — `chords`,
  // which every level has — never reaches the item scan at all.
  if (!found || !identity) return undefined;
  // The course's own stage ids, as a set built once rather than resolving every
  // item's stage through `courseStage` again.
  const ofThisCourse = new Set(found.course.groups.map((g) => courseStageId(found.course, g.key)));
  return items.find(
    (i) =>
      !!i.stageId &&
      !!i.catalogKey &&
      ofThisCourse.has(i.stageId) &&
      courseWorkKey(courseStage(i.stageId)!, i.stageId, i.catalogKey) === identity,
  );
}

/**
 * THE REPERTOIRE IDENTITY one catalogue entry of this course carries, or
 * nothing when it is not a work at all.
 *
 * A packet work's identity is its own key, which is derived from the WORK — so
 * Ferrer Ejercicio, titled identically in 2C-2F, already slugs to one identity.
 * Two things sit beside that, and both come from the SCANNER (the grammar lives
 * there; the app consumes the data):
 *
 *  • A PIECE SECTION THE COURSE NAMES ONE STUDY FOR CARRIES THAT WORK'S
 *    IDENTITY (`unit.workKey`), while its catalogue key stays `piece`. That is
 *    what lets the owner take the work at the level they actually meet it —
 *    2E's Carulli Valse is a repertoire work AT 2E, not only wherever a later
 *    packet happens to name it.
 *  • A PACKET ENTRY THAT IS AN EARLIER LEVEL'S STUDY UNDER ANOTHER NAME carries
 *    that study's identity (`work.workKey`), declared in the scanner's own
 *    WORK_ALIASES from the course's words. 3F's "Carulli Valse Op 50 No 7 1" IS
 *    2E's study; nothing in the archive joins them (2E holds no copy of the
 *    score), and a fuzzy title match that merged two genuinely different works
 *    would destroy the owner's record.
 */
function courseWorkKey(
  found: { course: CourseData; group: CourseGroup },
  stageId: ID,
  entryKey: string,
): string | undefined {
  const unit = found.group.units.find(
    (u) => u.key === entryKey || legacyKeysFor(stageId, u.key).includes(entryKey),
  );
  if (unit) return unit.workKey;
  const work = found.group.works.find((w) => w.key === entryKey);
  return work && (work.workKey ?? work.key);
}

// --- adding levels the owner has just bought ---------------------------------

export interface CourseLevelOffer {
  groupKey: string;
  code: string;
  title: string;
  group: string;
}

/**
 * The course levels this pathway does NOT have.
 *
 * Absence is decided by the stage's deterministic ID, never by its title: a
 * level the owner renamed is present and is never offered again, and a stage
 * they deliberately DELETED is offered — in a list — but is never recreated
 * unless they choose it. That is exactly why this is a separate, course-scoped
 * action and not an extension of `reseedDefaultPathways`: making that shipped
 * button additive would resurrect a deleted stage on its own, because a deleted
 * stage's id is absent in precisely the same way a never-seeded one is.
 */
export function offeredCourseLevels(course: CourseData, stages: PathwayStage[]): CourseLevelOffer[] {
  const have = new Set(stages.filter((s) => s.pathwayId === course.pathwayId).map((s) => s.id));
  return course.groups
    .filter((g) => !have.has(courseStageId(course, g.key)))
    .map((g) => ({ groupKey: g.key, code: g.code, title: g.title, group: g.group }));
}

/**
 * The stages collection with exactly the SELECTED levels added — as one value
 * the store applies in a single `set()`. Nothing is added that was not
 * explicitly selected, and a selection naming a level the pathway already has
 * is ignored rather than duplicated.
 */
export function planCourseLevels(
  course: CourseData,
  stages: PathwayStage[],
  selectedGroupKeys: string[],
  now: Date,
): PathwayStage[] {
  const offered = new Map(offeredCourseLevels(course, stages).map((o) => [o.groupKey, o]));
  const chosen = course.groups.filter((g) => selectedGroupKeys.includes(g.key) && offered.has(g.key));
  if (chosen.length === 0) return stages;
  const ts = nowISO(now);
  let order = stages.filter((s) => s.pathwayId === course.pathwayId).length;
  const added = chosen.map((g) => ({
    id: courseStageId(course, g.key),
    pathwayId: course.pathwayId,
    code: g.code,
    title: g.title,
    group: g.group,
    order: order++,
    createdAt: ts,
    updatedAt: ts,
  }));
  return [...stages, ...added];
}
```

## Check against the contract

- [ ] **ac-1** — A level's own study and its named packet works become repertoire works; every drill, exercise, rhythm, sight-reading and reading section from the same level does not. _(proof: a level's study and packet works are repertoire works and its drill sections are not)_
- [ ] **ac-2** — A work carried forward across levels is suggested once. Adding it from a later level reuses the existing item rather than creating a second work in My repertoire. _(proof: reuses a carried-forward work when it is added from a later level instead of duplicating it)_
- [ ] **ac-3** — Course material is composed live from the catalogue for a catalogue-linked item, and nothing is written onto the item — so regenerated course data reaches items that already exist. _(proof: composes a catalogue item's course files without storing any reference on the item)_
- [ ] **ac-4** — A course file resolves under the shared media root joined with the course's own media path, while an archive reference resolves against the unchanged archive base — both from the real configured values. _(proof: resolves a course file under the shared media root and leaves archive resolution unchanged)_
- [ ] **ac-5** — The media root is derived from the archive base, an explicit override wins over the derivation when set, and a base whose last segment names no known source yields no root at all rather than a guess. _(proof: prefers an explicit media root over the derived one and derives nothing from an unrecognised base)_
- [ ] **ac-6** — With no media root derivable or set, a course file is honestly unavailable rather than a dead link: the resolver reports no-base and the material row offers no open action. _(proof: reports no-base for a course file when no media root is derivable or set)_
- [ ] **ac-7** — The position routine is the previous level's essential segments plus only the current level's segments whose catalogue item the owner has actually added. _(proof: builds a position routine from added current-level items plus the previous level's essentials)_
- [ ] **ac-8** — A current-level segment whose catalogue item has not been added is absent from the position routine, while the level's full routine still contains it. _(proof: omits a current-level segment whose catalogue item has not been added)_
- [ ] **ac-9** — A segment is joined to its item by stage and catalogue key together, so an identically-keyed entry in another level is never matched. _(proof: joins a segment to its item by stage and catalogue key together, never by key alone)_
- [ ] **ac-10** — Adding one of a level's optional repertoire works changes nothing about the position routine, while adding one of its practice sections adds that section's segments — because a segment is matched by its OWN declared catalogue key, never by how many items the stage now holds. _(proof: ignores an added repertoire work when building the position routine and includes an added practice section)_
- [ ] **ac-11** — Fitting a routine to a target total yields minutes summing exactly to that target, and returns the routine unchanged when the target equals its authored total. _(proof: fits a routine to a target total exactly and leaves it unchanged at its authored total)_
- [ ] **ac-12** — When the target cannot seat every segment at a one-minute floor, non-essential segments are dropped before essential ones, and every surviving segment keeps its label, note, essential flag and bound item. _(proof: drops a non-essential segment before an essential one and preserves every surviving segment's identity)_
- [ ] **ac-13** — Adding new course levels OFFERS only the levels genuinely absent from the pathway — never one already present under a title the owner renamed — and adds nothing that was not explicitly selected, so a stage they deliberately deleted is offered again but never recreated on its own. The store applies that decision as a single set() of its result, so the shape protects the wiring the Node environment cannot import. _(proof: offers only the course levels absent from an existing pathway and never a renamed one already present)_
- [ ] **ac-14** — Resolving a course entry's study source returns the existing Material when one already matches and mints a new one only when none does, so a second course item can never create a duplicate source. The store applies that decision as a single set() of its result. _(proof: returns an existing study source when one matches and mints one only when none does)_
- [ ] **ac-15** — Every CGS stage id and catalogue key that existing data may reference is unchanged by the course import, so no already-added item is detached from its suggestion. _(proof: CGS stage ids and catalog keys stay stable across the course import)_
- [ ] **ac-16** — On the owner's own Mac and iPhone: Level 1B shows its real sections, 'Build one for where I am' matches the sections already added, running it at a changed duration keeps the syllabus proportions, a course video and a score open from a practice item over both the LAN and Tailscale routes, and the level's study appears in My repertoire while no exercise does. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/pages/Settings.tsx, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/backup.ts, src/pages/Settings.tsx, src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **install-the-app-and-keep-it-current** — touched via src/pages/Settings.tsx
- **log-a-class** — touched via src/store/useStore.ts
- **point-this-device-at-the-nas** — touched via src/pages/Settings.tsx, src/store/backup.ts
- **practise-todays-recommendation** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **run-a-session-plan** — touched via src/pages/Today.tsx, src/store/useStore.ts
- **see-practice-patterns** — touched via src/pages/Today.tsx
- **sync-devices-via-github** — touched via src/pages/Settings.tsx
- **work-a-pathway-stage** — touched via src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/domain/routines.ts, src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"

**What the agent reported:**

## browse-my-repertoire — unchanged

No change to repertoire.ts, isWork, repertoireWorks or any of the three Repertoire views; the only shared thing with this lane is the PracticeItem entity. What a course item IS was fixed upstream, in what the catalogue declares: a Classical Guitar Shed level's own study section and its named packet works now carry strand 'piece' (so isWork is true, exactly as this flow has always treated a full piece), and every drill, exercise, rhythm, sight-reading and reading section carries a non-piece strand and stays out of repertoire — where the old generic 'Piece' placeholder wrongly created a work literally titled 'Piece'. src/domain/courseSeed.test.ts's "a level's study and packet works are repertoire works and its drill sections are not" asserts that against the real generated data through this flow's own isWork/repertoireWorks. One observable consequence, considered and deliberate: a course item now carries a materialId for the found-or-created 'Classical Guitar Shed' study source, so it groups under that source here instead of under 'No study source yet'. That is this flow's existing grouping rule applied to data that finally has a source, not a change to the rule. Verified in the running app: the item's Connected-to reads 'Study source: Classical Guitar Shed'.

## prepare-for-the-next-class — unchanged

Nothing in this lane touches lessonAgenda.ts, questions.ts, Lessons.tsx, LessonAgenda.tsx or ClassQuestions.tsx — none of them is in the contract's allowed paths and none appears in the diff. The only link is the shared PracticeItem entity, and this lane adds no field to it and changes no field it already had: an item created from a course catalogue entry differs from one created from any other catalogue entry only in carrying a materialId for the course's study source. lessonUrgencyScore, preparationDatesByItem, detachItem and every commitment/question rule are untouched, so committing a course item to a class, asking a question about it and marking that asked all behave exactly as they did. The full lesson-agenda browser journey (tests/lesson-agenda.browser.test.ts) passes unchanged.

## work-a-pathway-stage — truth-proposed

This is the flow the approved Delta is about, and what a stage OFFERS genuinely changes. A Classical Guitar Shed level from 1B on now lists the level's real sections read out of the course's own tree (courseData.ts, generated by scripts/scan-cgs-course.mjs) with their guidance, the syllabus target BPM where it could be read, and the level's named packet works — instead of eight generic placeholders. An item created from one carries its section's videos, scores and contrast-card folder in Material, composed LIVE by itemFiles from the catalogue and written nowhere. A course stage also offers two new actions, 'Use this level's routine' and 'Build one for where I am', both of which write an ORDINARY EDITABLE routine rather than a live view. Every existing step and rule of the flow is intact: the item is still the only unit of work, the catalogue is still reference data in code labelled as an aid, adding is still one tap arriving honestly as 'Not practised yet' with zero statistics and a durable Undo, isLosslesslyRemovable and the Remove affordance still work, stageUnits/itemStageState/stageProgress are untouched, and a routine still records at most one block per distinct bound item. Level 1A keeps its fourteen hand-authored steps and both routines byte for byte. Every pre-import stage id and catalogue key is preserved so an already-added item stays attached to its suggestion — asserted by src/domain/pathways.test.ts's "CGS stage ids and catalog keys stay stable across the course import". Verified in the running app at localhost: 1B lists its real sections, adding 1B Scales showed its lesson video under Material resolving to https://192.168.0.20:5010/classical-guitar/classical-guitar-shed/Level_1B/05_Scales/01_80ee0462-cc7.mp4, and 'Build one for where I am' produced 1A's three essentials plus only 1B Scales.

## point-this-device-at-the-nas — mechanics-updated

Settings gains a second, read-mostly panel beneath the existing archive base: the SHARED MEDIA ROOT, derived as the folder above that base, shown on screen with its own Browse and an optional per-device override in localStorage (pc-media-root). The existing archive base is untouched in value and in meaning — getNasBaseUrl/setNasBaseUrl, normalizeBaseUrl, relativizeReference, archiveRootUrl, describeArchiveAccess, ReferenceEditor, Lessons and ArchiveRefresh all read and write exactly the same string they did, and every stored lesson reference resolves byte-identically (asserted in courseSeed.test.ts's "resolves a course file under the shared media root and leaves archive resolution unchanged", which checks both bases against the owner's real Mac and Tailscale values). This is NOT the second archive-specific base or the resolver fallback docs/setar-archive.md rules out: nothing resolves against two bases in turn — each composed reference carries root: 'archive' | 'media' and baseForItemFile picks exactly one — and nothing is guessed, since the derivation applies only when the base's last segment names a folder a shipped source declares and otherwise yields no root at all. A device on the LEGACY base one folder too high gets no media root, and a course file then reports no-base and offers no open action; that is not a new failure, since Setar references are already broken in that state and correcting the base once fixes both. docs/setar-archive.md now says all of this in its own words. No credential, no query, no fragment: normalizeBaseUrl still refuses them, and the root stays device-local, out of sync and out of backups.

## capture-a-practice-item — mechanics-updated

addFromCatalog now routes its whole decision through the pure planCatalogAddition (courseSeed.ts) and applies it as a single set() — the same shape-protects-the-wiring pattern installDatabase uses, because the Node test environment cannot import useStore.ts (Dexie via ./idb). Its existing contract is unchanged: an item still arrives status 'new' with zero statistics, still carries its catalogue key, still reuses an item already created from that (stageId, catalogKey), and stays losslessly removable. Two rules ride on top, both only for a stage a course owns: a packet work carried forward across levels is reused across stages rather than duplicated (its key is derived from the work, so the ordinary per-stage reuse is untouched and a 'chords' item in 1B can never be reused by 2B's), and the item is given the materialId of the course's found-or-created 'Classical Guitar Shed' study source. Because the source is resolved in the same pure value and installed in the same set(), a second course item can never mint a duplicate. Both are tested in courseSeed.test.ts. Quick add, the full 'Add practice item' form and every other creation path are untouched, and no required field is added anywhere.

## practise-todays-recommendation — mechanics-updated

Today's Routines doorway rows gain one extra affordance, 'Run it for a different length', shared with the stage and pathway routine surfaces through the single RoutineDuration component. It is COLLAPSED to one ghost button until tapped, and it sits inside the Routines card, which itself starts collapsed — so Today's layout is unchanged: both doorways stay above the recommendation, both stay at about 50px collapsed, and the primary recommendation stays above the fold at 390x844 (verified in the running app at that width: the instrument switcher, 'Plan this session · choose a length', 'Routines · 1 saved' and then PRACTISE NOW). Choosing a length starts the run with proportionally scaled segments (fitRoutineToMinutes) and navigates; the ordinary Start button and 'Short on time — essentials only' are untouched and keep their exact meanings, and doing nothing behaves exactly as before because the authored total returns the segments unchanged. Nothing about the recommendation engine, scoring, reviews or the practice totals line is touched.

## adjust-how-scheduling-works — unchanged

Settings.tsx and useStore.ts appear in the diff, but nothing in either change touches scheduling. scheduling.ts is forbidden by this contract and is not in the diff; decideReview, planNextReview, computeReviewOutcome, SchedulingParams, clampSchedulingParams and the 'How scheduling works' section are all untouched. Settings' only change is a new media-root panel appended after the NAS section and before ArchiveRefresh; useStore's changes are addFromCatalog's routing through a pure planner and two new course actions that write only pathwayStages and pathwayRoutines. Nothing here writes a block, a result, a review row or any SM-2 value.

## clear-a-due-review — unchanged

Today.tsx and useStore.ts appear in the diff but nothing in this lane touches reviews. Today's only change is adding the shared RoutineDuration control to its Routines doorway rows; the due-review row, 'Not now', snooze and the review actions are byte-identical. In the store, no new or changed action writes a Review, a nextReviewDate or any SM-2 field, and scheduling.ts is forbidden and absent from the diff. Practising stays the only thing that can complete a review or advance spacing — a routine run still records blocks with the factory-default not_logged result, and fitting a routine to a duration changes only segment minutes.

## back-up-and-restore — unchanged

backup.ts gains three device-local localStorage helpers for the optional media-root override (getMediaRootOverride/setMediaRootOverride/getMediaRoot) and nothing else. buildFullBackup, buildFullBackupWithRev, decodeBackupFiles, importFullBackup, replaceAllBlobs, recoverFromRefusedHydration and the archive-restore path are untouched, and SCHEMA_VERSION stays 14. Nothing new is persisted in PracticeDB, so no backup gains or loses a field; the media root is per-device environment config exactly like the archive base and stays out of exports, backups and sync. The rollback journey and the inbound journey both pass unchanged.

## install-the-app-and-keep-it-current — unchanged

Settings.tsx is in the diff only because the media-root panel was appended to it; the install hints, the service-worker update banner, the build stamp and every PWA concern are untouched, and vite.config.ts, the CSP and the workflows are not in the diff at all. One measured consequence worth stating plainly: the generated course data is a ~222 KB committed literal that ships in the offline bundle, so the precache grew and now stands at 42 entries / 1021.93 KiB. The app still installs and works fully offline; this is the cost the approved plan named.

## log-a-class — unchanged

useStore.ts is in the diff but no lesson action changed. addLesson, updateLesson, deleteLesson, unlinkItemFromLesson, the recordings/ReferenceEditor path and every LessonRecording rule are untouched, and Lessons.tsx, LessonNotes.tsx and Attachments.tsx are not in the diff. The archive base a lesson reference resolves against keeps its exact value and meaning, so every existing class recording and score opens at the identical URL. The lesson-agenda browser journey passes unchanged.

## run-a-session-plan — unchanged

plan.ts, SessionPlan.tsx and CloseBlock.tsx are all forbidden by this contract and none is in the diff. The Session Plan's allocator is deliberately NOT reused for routine duration — allocateMinutes allocates by bucket priority with a pinned warm-up share and a 2-25 minute clamp, which would distort a one-minute syllabus segment — so fitRoutineToMinutes is its own pure function in routines.ts. The ONLY thing shared is validateBudgetMinutes and its 5-120 bound, imported so the duration control rejects exactly what 'Plan this session' rejects. Today.tsx's Plan doorway is untouched and still sits above the recommendation, collapsed.

## sync-devices-via-github — unchanged

syncEngine.ts, githubSync.ts, gitRemote.ts, canonical.ts, sync.ts, io.ts and migrations.ts are all forbidden by this contract and none is in the diff. SCHEMA_VERSION stays 14 and nothing new is persisted in PracticeDB: the course catalogue, its data and the syllabus routines are reference data in code, and the media-root override is per-device localStorage, so no snapshot gains a field and no content hash changes shape. The two new store actions write only into existing collections (pathwayStages, pathwayRoutines, items, materials) through the ordinary revision-bumping middleware. The inbound sync browser journey passes unchanged.

## see-practice-patterns — unchanged

Insights.tsx, insights.ts, selectors.ts and scoring.ts are not in the diff. practiceTotals, practiceTotalsByInstrument, instrumentBalance and every generated observation are untouched, and nothing in this lane writes a block, a minute or a result — a routine run still records what it always did. Today's practice-totals line is unchanged.


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

If your verdict is `DO NOT SEAL`, make the hand-off self-contained: save your findings as ONE JSON array to EXACTLY this reserved file — if you are a Claude Code session, this lane's own scope hook allows writing only this one path outside the lane, so it is also the only place you CAN write it (a reviewer on a different provider's own sandbox is not covered by this):

`/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260921-bring-the-classical-guitar-shed-course-i-9b18/findings.json`

with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Then report two things verbatim: the exact temporary file path, and the exact command, using this change's own contract id (shown above as **Contract**): `prismatica seal <id> --request-changes --findings <that path>`. The owner should never have to reconstruct that JSON from your prose by hand.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
