# The Setar lesson lifecycle: one class, one record, from plan to archive

How one real class moves from "I know its date" to "its recording is on the
NAS", and the family proof that keeps it one record the whole way. Written
before the code of the 2026-10-30 lane (issue #60); `docs/setar-archive.md` is
the scanner/index/Refresh runbook, this is the identity contract over it.

## The owner's workflow (the only one)

1. As soon as the date is known: **Lessons → Add a class** (offline), then
   commit work and capture questions for it. No NAS folder, no media, no
   publication is needed or recommended.
2. After the class: create the ordinary `session-N-DD-MM-YYYY` folder and put
   the recording and material in it. Nothing else.
3. The NAS job (every 15 minutes, all day) scans and publishes.
4. **Refresh** sees session N, finds the class you planned, and asks once:
   *Link to your class / Create separately / Skip*. Linking binds the session
   to YOUR lesson: same id, same commitments, questions and notes, with the
   archive's files composed onto it. Repeating Refresh changes nothing.
5. A piece the archive does not know yet, a class roster, or a renamed file:
   `node scripts/setar-archive-maintenance.mjs` (§ Maintenance). Never a hand
   edit of `PIECES.csv` or `RENAME-LOG.csv`.

An empty future folder is harmless and never needed: the scanner inventories
files, so `session-42-24-11-2026/` with nothing in it contributes no session,
no lesson and no deadline.

## Shared decisions (settled before implementation)

| # | Rule | Where it is enforced |
|---|---|---|
| D1 | One real class has one app record. Source identity is `(archiveId, sessionN)` scoped to the archive's instrument; the source date only finds candidates. | `planArchiveImport` (`sourceReconcile.ts`), `validateArchiveSources` (one lesson per session) |
| D2 | A session auto-adopts an existing lesson only on a UNIQUE candidate with same instrument + date + number AND exact source-path evidence. | `planArchiveImport` |
| D3 | Same instrument + date + number WITHOUT path evidence is a question (Link / Create separately / Skip), never a silent second lesson. Number alone, date alone, another instrument, another date (Class 38: 2026-08-04 archive vs 2026-09-27 planned) or several candidates never adopt. | `planArchiveImport` |
| D4 | A bound session is still examined for an unbound same instrument + date + number counterpart: a *duplicate* question (Combine into your class / Keep separate). Never automatic. | `planArchiveImport` (`duplicates`) |
| D5 | Combine keeps the owner's lesson id, moves the binding onto it, and folds the archive row in: notes (both kept when both differ), item links (union), references (union by row; a shared path with different metadata stays two rows), agenda entries (`lessonId` and `detachedFromLessonId` rebound, ids/text/asked/answers untouched) and lesson attachments (`ownerId` rebound; blobs keyed by attachment id, untouched). Never `deleteLesson`: no blob deletion, no agenda detach, no suppression. | `consolidateLesson` (`lessonReconcile.ts`), applied inside `applyArchiveImport` |
| D6 | Keep separate is durable: a `session` suppression scoped to the lesson (`{kind:'session', ref:N, itemId:<lessonId>}`). It never hides the session (only an unscoped one does), passes the v17 validator unchanged, and stops the question for that pair only. Create separately on a first-time question writes the same marker for each named candidate. | `planArchiveImport`, `isLessonKeptSeparate` |
| D7 | Provenance is not scheduling intent. Adopting/combining keeps the owner lesson's `origin` (absent ⇒ planned); only a lesson the import CREATES carries `origin:'archive'` (history even when future-dated). Every "upcoming" reader goes through `isUpcomingLesson`. | `lessonForSession`, adoption branches, `isUpcomingLesson` |
| D8 | A decision is about the state seen: a combine or a Link whose lesson is gone, bound, moved, renumbered or redated (a Link adopts only a lesson still among the session's candidates), or whose archive row changed, is stale, named in the refusal before any rebase question, and re-asked. A held notes recovery draft or a live question capture on either lesson refuses the combine with the words kept. | `planArchiveImport` (stale), `commitArchiveImport` (draft guard) |
| D9 | `PIECES.csv` and `RENAME-LOG.csv` beside the archive stay the only declarations. One guided operator route edits them (preview first, rollback copy, validation, scan, publish); the scanner stays read-only. | `scripts/setar-archive-maintenance.mjs` |
| D10 | Every diagnostic carries a `code` (additive, index stays `version: 1`) so Refresh groups messages and names the action without parsing text. | scanner `buildIndex`, `decodeSourceIndex`, `ArchiveRefresh` |

## Invariants, producers and consumers

| Invariant | Producers (write it) | Consumers (read it) |
|---|---|---|
| I1 one lesson per session | `planArchiveImport`/`applyArchiveImport`, `consolidateLesson` | `validateArchiveSources` at every inbound door; `associationsForLesson`, `lessonFiles`, `itemFiles`, Lessons list |
| I2 planned stays upcoming until its date; archive-created stays history | `createLesson` (Add a class), `lessonForSession`, adoption/combine | `isUpcomingLesson` → `nextLessonFor`, `defaultTargetLesson`, `upcomingLessons`, `preparationDatesByItem`, `requiredClassWork`, `lessonUrgencyScore`/`scoreItems`/`buildSessionPlan`, `TeacherQuestionCapture`, `questions.ts` warnings, Lessons badges/open state, Teacher report |
| I3 authored information survives a combine | `consolidateLesson` | Lessons detail (notes, links, agenda, files), Teacher report, ClassQuestions, attachments/backup |
| I4 decisions persist and are not re-asked | `planArchiveImport` (`suppress`), `applyArchiveImport` | next `planArchiveImport`, hidden list (`ArchiveRefresh`), sync/backup (inside `archiveSources`) |
| I5 the index never invents identity | scanner `buildIndex` | `decodeSourceIndex`, `parseSourceIndex`, `planArchiveImport` |
| I6 maintenance never loses a declaration | `setar-archive-maintenance.mjs` | scanner, publisher, app |

## Equivalence classes and how they interact

- **Source**: known (registered piece), unknown (unregistered key), malformed
  (no role, stacked role, unsupported type), empty folder.
- **Binding**: unbound, bound, duplicate (bound + unbound twin), separate
  (kept), suppressed (deleted/skipped).
- **Intent**: planned (owner-created, date ahead), historical (date passed, or
  archive-created).
- **Time of decision**: stable, stale (premise moved), in-flight (draft held,
  live capture, persistence pending).
- **Durability**: saved, failed (IndexedDB refused), reloaded, synced/imported.

Interactions that matter and where each is proved:

| Interaction | Family |
|---|---|
| unknown/malformed source × roster trust × empty folder | ac-1 |
| unbound × planned × no path → question → link keeps id and intent | ac-4 (browser), ac-3 (domain) |
| duplicate × combine × both-sided authored data × drafts × stale × failed save | ac-3 |
| duplicate/separate × reload × backup × sync pull × Keep remote × archive restore | ac-5 |
| maintenance edit × stale preview × interrupted apply × failed publish × rerun | ac-2 |

## Independent expectations

Hand-written in `tests/fixtures/setar-lifecycle-expected.json` from the real
evidence (folder listing of 2026-10-30, the owner's schema-17 export, read
only), never from scanner or reconciler output:

- **Session 40 before repair**: roster `پیش-درامد-چهارگاه-فروتن`,
  `چهارمضراب-چهارگاه-عبادی` (both rows already list 40); the personal take
  `تمرین-من-نت-چهارمضراب-چهارگاه-عبادی.mp4` parses as role `تمرین-من` + key
  `نت-چهارمضراب-چهارگاه-عبادی` (stacked role, not registered), so the roster is
  untrusted and `نمونه.mp4` stays with the lesson.
- **Session 40 after repair** (rename to `تمرین-من-چهارمضراب-چهارگاه-عبادی.mp4`
  logged): roster trusted; `نمونه.mp4` scoped to both roster pieces; the
  personal take is a membership, never a resource.
- **Session 41 before**: `پیش-درامد-ابوعطا-لطفی` unregistered, its demo
  excluded; the class recording indexed. **After** registration (identity only,
  session 41): the demo scoped to that one piece.
- **Session 42**: an empty folder → no session.
- **Class 41 pair** (synthetic ids, the export's shape): manual
  `L41-mine` (2 item links, 2 preparations, 2 open questions) and bound
  `src-…41` (no authored data). Combined: one lesson `L41-mine`, bound to
  session 41, same 2 links/2 preparations/2 questions, plus the archive's
  composed class recording; no new suppression.

## Proof routes and their limits

```sh
npx vitest run tests/setar-lifecycle.test.ts tests/setar-lifecycle.browser.test.ts tests/setar-maintenance.test.ts tests/practice-cues.browser.test.ts tests/ci-browser-setup.test.ts
```

| Family (exact title) | Owns |
|---|---|
| ac-1 `setar source pipeline indexes sessions 40 and 41 without creating a lesson from empty session 42` | scanner → digest/decoder → publisher (fake Git) → thin clean-store import |
| ac-2 `setar guided maintenance is reversible stale safe and idempotent without altering media` | operator edits, rollback, stale/interrupted/failed publish, rerun |
| ac-3 `setar lesson reconciliation preserves both owners through decisions failures retries and repeat refresh` | the full Class 41 combine and preservation matrix |
| `setar duplicate lesson repair exposes the same reconciliation decision in both browsers` | the real Combine / Keep separate controls, both engines |
| ac-4 `setar future class preparation and later media use one lesson across every visible consumer` | app-created Class 42 → later session-42 binding; visible messages |
| ac-5 `setar reconciled lessons survive reload backup and compatible sync without resurrecting removed material` | already-reconciled state across every durable door |
| ac-6, ac-7 | existing titles, extended in place |

What each proves is SYNTHETIC: transport is a local fake Git/`fetch`, the
clock is injected, AudioContext is instrumented. None of it proves the live
NAS job, the real publication, a speaker or a real device; those are recorded
separately (`docs/nas-topology.md`, ac-8).

## Consumer sweep (before the first review)

Changed:

- `planArchiveImport` / `applyArchiveImport` (`sourceReconcile.ts`): D2–D8;
  `PLANNED_CLASS_WHY`; adoption no longer stamps `origin`.
- `consolidateLesson`, `lessonTwins`, `isLessonKeptSeparate` (`lessonReconcile.ts`).
- `commitArchiveImport` (`useStore.ts`): the held-words guard (`status: 'held'`).
- `ArchiveRefresh.tsx` (duplicate rows via `LessonReconcile.tsx`, grouped
  attention, kept-separate rows in the hidden list), `Lessons.tsx`
  (`LessonTwinNotice`; the wide add-class date field is named).
- Scanner `buildIndex` codes and wording; `decodeSourceIndex` /
  `checkSourceGraph` accept an optional text `code`; `diagnosticAction`.
- `setar-archive-maintenance.mjs` (new).

Checked clean (they read through `isUpcomingLesson`, so D7 reaches them
without a change): `nextLessonFor`, `upcomingLessons` (`selectors.ts`);
`defaultTargetLesson`, `preparationDatesByItem`, `requiredClassWork`
(`lessonAgenda.ts`); `lessonUrgencyScore` / `scoreItems` (`scoring.ts`) and
`buildSessionPlan` (`plan.ts`) through `preparationDatesByItem`;
`captureTargetProblem` (`questions.ts`); `TeacherQuestionCapture`; Lessons
badges and open state; Teacher report's default class.

Lesson-id holders a combine could orphan: agenda `lessonId` and
`detachedFromLessonId` and lesson attachments (rebound); notes recovery copies
and the live question capture on the twin (the combine is refused, words kept);
a close-screen question naming the twin is saved visibly unassigned exactly as
after a delete — and the twin, created by the import, is history, so it is never
offered as a capture target; the wide Lessons selection falls back to its
default; `lessonFiles` composes from the binding, so the archive's files follow
it onto the survivor. Item bindings, blocks, reviews and routines hold no lesson
id.

Not changed, by decision: no schema bump (D6); the session-40/41 archive
declarations were not edited from the Mac (`docs/nas-topology.md`, live repair).

## Maintenance

`scripts/setar-archive-maintenance.mjs --root <archive>` (§ in
`docs/setar-archive.md`): `register`, `roster`, `rename`, each previewed, then
applied only with `--apply --preview <hash>`; it copies the declarations
privately first, re-validates with the scanner's own grammar, scans to a scratch
file, then publishes through the existing runner, which publishes only that
validated index and must print its evidence. Recovery (`rollback`, and the
automatic put-back of a failed apply) undoes only what that change wrote,
judging every file before writing any, under the lock, for its own archive
only. Repeat runs are no-ops.
