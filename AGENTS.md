# AGENTS.md - development rules for Practice Compass

The contract for anyone, human or AI, extending this app; its value is what it refuses.

## The core loop

Preserve **one item · one mode · one focus · one result · one next action.** A change that
blurs the loop or adds a second thing to think about per step is wrong, however useful.
The loop closes: `ActiveBlock` shows the most recent NON-EMPTY `nextAction` before you play
(`lastNextAction`, `src/domain/blocks.ts`). Anything the app asks you to record, it must use.

## Hard do-nots (only an explicit owner decision, recorded here, changes one)

- **No gamification** (r-no-gamification): no streaks, points, badges, XP, leaderboards,
  confetti or fake "mastery %". Progress is honest status, results and neutral counts.
- **No backend, no auth server, no service of our own** (r-local-first-offline).
  IndexedDB is the source of truth on each device and everything works offline. Free tiers
  only; no paid services.
  **Owner decision 2026-07-11:** device sync IS sanctioned, via the owner's own GitHub data
  repo - see "Sync" below. Never a custom server, never a NAS backend replacing it.
- **No AI or audio analysis** in v1: no tone scoring, pitch detection, posture tracking or
  "AI teacher". The app organises; it does not grade.
- **No guilt-driven copy.** Insights are neutral observations, never nags.

## How to change this file

- It holds CURRENT rules only, each stated once, as an imperative plus where it is
  enforced. Edit a rule in place when it changes; edit this file only then.
- Never append how a rule was found (review findings, counterexamples, measurements,
  rejected attempts). The why goes in a dated `DECISIONS.md` entry; mechanism goes in the
  subsystem's `docs/*.md` or the enforcing code's comment. Text removed on 2026-10-01
  stays readable at commit 56789a8.
- CLAUDE.md plus its imports, and this file alone, must each stay <= 32,768 bytes
  (`tests/agent-context.test.ts`, and Prismatica's instruction-budget check). Make room by
  condensing in place; subsystem detail may move to its doc; a prohibition aimed at agents
  stays here.
- Owner-approved rule ids (`r-*`) sit beside the text that elaborates them.

## Practice information has one home per kind (schema v13)

- Four homes (`src/domain/practiceInformation.ts`): `PracticeItem.notes` ("Working
  notes", the item's one notebook, editable while practising); `PracticeBlock.observation`;
  `PracticeBlock.nextAction` (decided at close, read at the next block); `lessonAgenda`.
  The legacy `PracticeBlock.constraint` is kept, shown and validated, with no new capture
  control. Nothing copies one home into another.
- A derived value is not a fifth home: read the latest observation from blocks
  (`latestObservation`) and show it with its date; never store it back on the item.
- **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`,
  `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen
  Persian/Guitar working-detail fields (`shahed`, `ist`, `foroud`, `ornamentIssue`,
  `mezrabIssue`, `phraseLabel`, `importantNote`, `rightHandIssue`, `leftHandIssue`,
  `toneIssue`, `fingering`, `tempo`, `stringNoiseIssue`, `bodyTensionNote`) are REMOVED, not
  merged into `notes` (their content was dummy data). Identity fields (`dastgahAvaz`,
  `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. The waiver covers exactly
  those fields and is NOT permission to reset practice history, ratings, reviews,
  commitments or any future meaningful text. `retirePracticeText` only deletes, reads no
  clock and runs on every inbound database.
- `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block):
  absent, empty and `null` are legitimate; a wrong type is refused naming the record, never
  coerced.
- Notes are edited only through `src/components/ItemNotes.tsx` (lesson notes reuse its
  `DurableNotes`). Save on an explicit Done, never on blur; "Saved." waits for IndexedDB
  (`storageSettled()`); a failed write keeps the text with Try again (which always writes)
  and Copy. The draft is tagged with its item and dropped when the item changes; an
  in-flight write never owns the editor and only the latest save acts (`saveSeq`).
  Editing notes changes nothing else (clock, block, result, review, SM-2).
- After any install every attachment the database describes has bytes on this device
  (r-no-silent-data-loss): `decodeBackupFiles` and `importFullBackup` refuse a file that
  would break that, naming it and changing nothing; `validateDB` refuses duplicate
  attachment ids. The export (`buildFullBackupWithRev`) is built from the metadata, so the
  app never writes a backup it refuses; unreferenced blobs are left untouched, never
  deleted, and `addAttachment` writes the blob before its metadata.

## Quick start, low admin (r-quick-start)

- Starting a block stays under 30 seconds and closing one under 60. Never add a required
  field beyond an item title; every new field is optional with a smart default; rich
  metadata stays hidden until asked for.
- Smart defaults: status -> mode, item -> focus, 10-minute duration; `focusForItem`
  (`src/domain/defaults.ts`) is the only focus default.
- Exactly two one-step creation paths: Quick add (title only, also inline from Start and
  recommendations) and the kind-first full form "Add practice item"
  (`src/components/itemKinds.ts`: "What are you adding? / Connect it (optional) / First
  practice setup"), where every connection is settable at creation. Never a third path.
  Item detail shows "Connected to" near the top.

## Today is a session workspace for one instrument (r-one-instrument-per-session)

- A persisted `sessionInstrumentId` drives Today; everything below the switcher is scoped
  to it; the cross-instrument Overview is a deliberate secondary choice, never the default.
  Never hard-code a morning/evening schedule; never show another instrument's work inside
  a session. The primary recommendation stays above the fold at 390x844.
- Session Plan and Routines are two independent peer doorway cards (`PlanCard`,
  `RoutinesCard` in `src/pages/Today.tsx`; owner acceptance 2026-08-28), each collapsed
  (~50px) with its own state and Resume takeover. Today is the only home of an unplaced
  routine, so its rows carry Edit, Start and "Short on time - essentials only".
- **Owner decision 2026-09-11:** the two doorways sit ABOVE the recommendation. It is a
  taste judgement, not a derivation (both orders fit above the fold). Do not re-derive or
  flip it; it changes only when the owner says so.

## Closing a block and review actions (r-practice-completes-reviews)

- Only closing a block can complete a review or advance SM-2, and not always. "Not now"
  hides a due review for today, schedule unchanged; Snooze (+2d) moves the date on both
  the review and the item. Never fabricate a result or leave a stale overdue item. Finish
  freezes the clock (`pauseSession`) first.
- A result is required to save; "Save without a result" keeps `not_logged` deliberate.
  `computeReviewOutcome` (`ReviewAnswer`: scheduled, declined, unanswered) returns the date
  and `completeOpenReviews` as ONE decision: no result keeps the date and the open row; a
  decline clears the date and completes the row. `closeSession` never decides the row alone.
- The close screen leads with the musician's words, then minutes and ONE scheduling line,
  controls a tap behind. `CloseBlock` holds one `ReviewPlan` that line, field and save all
  render (`reviewSummaryLine` computes no date). Never reintroduce a second derivation. A
  new result clears a typed date unless `reviewOverrideSurvivesResultChange` says the
  engine's date does not depend on it. Save uses the screen's `now` and, if the day
  rolled, refreshes visibly instead of saving.
- The due-review row wraps the title, never truncates it; its actions keep their meanings.

## Unfinished practice is never replaced (r-no-silent-data-loss)

- PRESENCE of unfinished practice, paused or running (`decideReplacement`,
  `src/domain/practiceSession.ts`), alone decides whether a whole-database replacement may
  proceed. A stale-clock verdict (`isStaleClock`) only proposes minutes and labels the
  block (`StaleNote`, wherever Today shows it); never wire it to a destructive path,
  `shouldKeepAwake` or `nextSignal`.
- Automatic sync defers (`deferred` phase, never `error`); Import, Restore archive and Keep
  remote refuse naming the session. `importFullBackup(text, intent, decidedFromRev)` checks
  presence first and again, with the local `rev` (a counter, never a clock), in the same
  tick as the install; sync's baseline rev is captured in the same statement as its db.
  A sync requested mid-run is remembered (`rerunWanted`), never dropped; the deferred retry
  watches presence clearing (`deferredSyncRetry`, `src/App.tsx`), never `rev`.
- `installDatabase` returns the new db with ephemeral state (`active`, `activeRoutine`,
  `activePlan`, `notNow`, an unresolvable `sessionInstrumentId`) reset; `importDB`,
  `resetDemo` and `clearAll` are each one `set()` of it. Deliberate erasure keeps no guard.

## Practice totals are calendar figures

`practiceTotals`/`practiceTotalsByInstrument` (`src/domain/selectors.ts`) count local
calendar days, week from Monday 00:00, never `blocksInWindow`/`totalMinutesInWindow`
(rolling hours). A block belongs whole to the day it began. Totals stay neutral counts
and sit below the recommendation on Today. Today and Insights tick `now` each
minute; Insights counts every instrument and drops empty rows.

## Hands-free practice

- While a practice clock runs and its screen is visible, hold one Screen Wake Lock
  (`shouldKeepAwake`, `src/domain/practiceSignal.ts`; one owner, `useScreenAwake`).
  `nextSignal` announces each boundary at most once per call (marker `signalledThrough`,
  ephemeral only); Skip calls `acknowledgeThrough`. The guaranteed signal is visual (target
  ring, overtime figure); a block never auto-finishes; audio and vibration are best-effort
  and never asserted. None of this may change a recorded minute.
- The wake lock, `crypto.subtle` (`sha256Hex`: sync and archive refresh) and the service
  worker need a secure context, which plain `http://` on a LAN address is not. Confirm
  `window.isSecureContext` on the real device over HTTPS before concluding anything from an
  unmerged branch. The answer is a route, never a fallback hash: `parseSourceIndex` refuses
  with `INSECURE_CONTEXT_REFUSAL` before reading the file.
- **Open gaps:** Sync over plain http still throws the raw `Cannot read properties of
  undefined (reading 'digest')` (a wording fix in its own lane, never a second hash), and
  `readIndexFile` (`src/store/archiveIndex.ts`) has no production caller.

## Pathways, routines and repertoire

- The practice item is the only unit of work; pathways are a view, with stage progress
  derived (`itemStageState`, `src/domain/pathways.ts`). Never a parallel to-do list,
  "pieces" object or guitar-specific model. Pieces may have parts (`parentItemId`),
  never quotas.
- The catalogue is reference data in code (`src/domain/pathwaySeed.ts`): suggestions are
  reference aids, never canonical; keys stay stable per stage. `addFromCatalog` creates an
  honest "Not practised yet" item (status `new`, zero stats).
- Suggestions bind by stable reference id (`catalogReferenceId`,
  `src/domain/referenceCatalog.ts`), never by title or placement, held in `catalogRefs`;
  one resolver, `resolveCatalogReference`, drives every surface (who reads and writes what:
  `docs/repertoire-experience.md`). Two items answering one suggestion are candidates,
  never picked; placing is not linking (`unlinkedInStage`). Unlink, Remove from pathway
  (`Pathway.hiddenRefs`) and Hide never delete; Delete practice item is the only
  destructive action. Undecided legacy evidence is settled or refused, never promoted or
  lost; every write passes `identityRefusal` (`src/store/useStore.ts`); validity never
  reads an instrument's name.
- Pathways, stages and routines are editable; deleting a stage or pathway only detaches
  its items and routines and clears a stale pin.
- The current stage is the owner's choice: a `currentStageId` pin wins while its stage
  exists. One route selector (`visiblePathways`/`primaryPathway`/`pathwayPosition`) serves
  every surface. Never treat linear order as truth for Setar/Tar.
- A routine (`src/domain/routines.ts`) belongs to an instrument, required for new ones and
  never invented for a legacy one; a bound segment item always matches it, checked by
  `retargetRoutineInstrument` on every create and save, never by rewriting an instrument.
  A run freezes its segments at start, writes at most one block per bound item
  (`aggregateItemMinutes`, result `not_logged`) and never completes a review. Skip clamps
  to elapsed; "Short on time" (`segmentsForRun`) drops non-essentials; Finish always saves.
- Only ONE practice clock runs at a time: block and routine start/resume each refuse while
  the other exists, and the persist `merge` freezes both if it finds both, losing neither.
  Pages redirect to the running clock. Elapsed time is wall-clock (`locateClock`).
- My repertoire is a derived lens: three peer views (My repertoire, the default; Pathways;
  Practice list) share one instrument selector; browse state lives in the URL
  (`readBrowseState`, `browseParams`) and never writes `sessionInstrumentId`.
  `discoverRepertoire` (`src/domain/repertoire.ts`) shows every work once. A work is a
  top-level item with a work identity (`isWork`): any dastgah/avaz, form, composer or
  gusheh, or the type `full_piece`/`gusheh` (how Guitar pieces qualify). A work with no
  dastgah sits under "No dastgah yet"; technique, exercise and study material stay out.
- Dastgah/Avaz, Form and Composer share one vocabulary (`src/domain/musicTerms.ts`) with
  ids never derived from a label; a field holds one `{termId}` or the owner's literal text;
  identity is exact (`resolveValue`), transliteration is search only. An edit that would
  change an unedited value's meaning (`reclassifiedItems`) or take another term's spelling
  is refused; only unused custom terms delete. Gusheh titles are not terms. Saves report
  through `useAcknowledgedSaves` (`src/components/ui.tsx`).
- A study source is the material an item is studied FROM (`src/domain/studySources.ts`).
  Never deduplicate sources by title or share them across instruments; a shipped course's
  source is keyed (`sourceKey`), once per instrument, and an unproven match is asked.
- Seeds are honest starting points, never fabricated authority: Guitar = Classical Guitar
  Shed; Setar = the named Mirza Abdollah radif pathway on a new install (an upgraded device
  keeps its mixed pathway and is offered the named one); Tar = the Honarestan method and
  Khonyagar, with the radif offered. `MIRZA_ABDOLLAH_RADIF` is one explicitly PARTIAL
  definition. Forms is a lens in My repertoire, never a pathway. Per-gusheh `about` text
  stays a generic prompt: never invent specifics; the teacher's account is the authority.
  Copy is calm and self-paced: "Move on when it feels right, not by a deadline".

## Lessons, the agenda and NAS references (r-large-files-stay-on-nas)

- A `Lesson` is per instrument; `lesson.itemIds` is a link, never ownership. A
  preparation's own class date is the ONE sanctioned deadline (`lessonUrgencyScore`),
  never guilt-toned.
- Small files are attachments owned by an item OR a lesson, decided by `ownerType` AND
  `ownerId` together (`attachmentsOwnedBy`, `src/domain/itemFiles.ts`, used by every list,
  count and delete). Attachment size policy (`attachmentPolicy`, `src/domain/files.ts`):
  warn over 10 MB and for any video, refuse over 40 MB.
- Class videos and score PDFs are NAS references (`Lesson.recordings`), never bytes in
  IndexedDB, sync or a backup. `resolveRecording` (`src/domain/recordings.ts`) joins a
  relative path to the per-device base and opens only on an explicit tap. Removing a
  reference never touches the NAS file.
- `lessonAgenda` (`src/domain/lessonAgenda.ts`) is the one home for "prepare this for
  that class" (`preparation`) and "ask this at that class" (`question`, open -> asked with
  an optional answer): one typed union, never independent booleans. A commitment's own
  class date is its only deadline (`preparationDatesByItem`); a question changes no
  practice priority, ever. An entry with no lesson is visibly unassigned, never guessed;
  new ones default to the nearest upcoming lesson, date named. Questions are selected by
  lesson id. Asked is explicit, reversible history. Deleting a lesson detaches its entries;
  deleting an item removes its preparations and keeps its questions. Practising never
  clears a question.
- `migrateToV12` converts legacy `assignedForLesson`/`teacherQuestion` once, guessing
  nothing and reading no clock; "represented" means the same text. `validateDB` refuses
  invalid new intent, including a dangling live `lessonId` or `itemId`. Validate calendar
  values by round-trip (`isValidISODate`, `isValidISODateTime`).

## Direction-aware text (r-direction-aware-text)

- Built-in Setar/Tar data is authored in Farsi behind stable ascii ids (`slug`/`key` in
  `src/domain/pathwaySeed.ts`); generic UI and Classical Guitar stay English.
  Every search surface goes through `itemMatchesSearch` (Farsi-aware, `farsi.ts`).
- Direction is resolved natively with `dir="auto"`, never by detecting script in
  JavaScript or reordering text. Free-text fields get `unicode-bidi: plaintext` only via
  `.input`/`.textarea` in `src/styles/global.css`.
- Put `dir="auto"` on GROUPS (a title with its details) and fields, never bare on a title
  element; the title must be the group's first strong text, so an English eyebrow stays
  outside the group. Inside a group, always-English generated copy gets an inline
  `dir="ltr"` isolate and an independently authored value its own `dir="auto"`. An isolate
  is inline: `dir="ltr"`/`"rtl"` only on `span`/`bdi`. Never isolate the element a group
  resolves from (`dir="auto"` skips descendants that carry a `dir`).
- An instrument name is owner text: it resolves its own direction and is never pinned LTR
  or fused into a template string. `<option>` text and `confirm()`/toast strings are out
  of scope.
- A content-directed block re-declares `textAlign: 'start'` on itself (WebKit inherits the
  physical value), and so does a group under an ancestor pinning left/right. Active is a
  deliberate case: its title group is start-aligned, so English moves from centred to left
  there; that does not conflict with "English keeps its layout" elsewhere.
- Lists of `dir="auto"` items drop the native marker (`role="list"`, ordinal as a flex
  child). In `src/components/ClassQuestions.tsx` the guaranteed question, not the optional
  title, anchors each item; in multi-line text the first line anchors and later lines
  carry their own `dir="auto"`.
- `src/components/direction.test.ts` enforces this and records the surface list and site
  ledgers; a new site is added there visibly. Its title allowlist is currently EMPTY; an
  exception goes there AND here.
  Verify mixed-language surfaces with deliberately MISMATCHED languages, in both engines
  (`tests/practice-information-layout.browser.test.ts`).
- **Open gaps:** `src/components/QuickAdd.tsx`'s instrument picker renders the name with no
  direction (the instrument-name check excludes `ItemForm.tsx`, `QuickAdd.tsx`,
  `RoutineEdit.tsx`); `src/domain/insights.ts` fuses instrument names into one sentence
  that `Today.tsx` renders under `dir="ltr"`. Each needs its own lane.

## Material reaches you where you are

- Browse screens (Repertoire, Lessons) seed their instrument filter from
  `sessionInstrumentId` (`defaultInstrumentFilter`) and never write it; a narrowed Pathways
  view hides General pathways too (`pathwaysForInstrumentFilter`); every door out keeps it.
- An item's material is composed, never stored (`itemFiles`, `src/domain/itemFiles.ts`):
  archive-scoped files, the item's own references, linked non-archive lessons' references
  (deduplicated by path), then attachments. Only a local image renders inline; practice
  shows material as one closed disclosure below the timer. An item with no lesson link has
  no NAS material (gap: a schema change in its own lane).
- Store a NAS reference relative to the configured base (`relativizeReference`); keep
  anything else exactly as given. A base is an origin and a path only (`normalizeBaseUrl`
  refuses credentials, query and fragment). Browse is offered only where it can work; a
  missing NAS never blocks practising.

## The Setar archive is a source: it describes, never testifies

Runbook and detail: `docs/setar-archive.md`; app side `src/domain/sourceReconcile.ts`.

- The grammar lives once, in the scanner; the app never parses a filename. The app
  recomputes the index digest (`parseSourceIndex`), its decoder refuses a present but
  wrong-typed value, and `checkSourceGraph` is the one grammar at every door. Fix the
  grammar or the door, never with a guard in a component.
- Archive evidence may establish repertoire membership, lesson provenance and source
  material, never practice, a result, exposure, review completion or scheduling progress.
  New imported pieces arrive resting. An imported class is history even when future-dated:
  every upcoming-lesson test goes through `isUpcomingLesson`, never a bare date compare.
- Exact bindings win; weak equivalences ask (Link / Create separately / Skip), never merge.
  Decisions, Skips and deletions persist; one whose premise moved is refused as stale. The
  commit re-plans, validates, waits for IndexedDB and never replaces the database.
- Repair legacy paths exactly through the rename log or diagnose them; no fuzzy matching by
  title, size or modification time. A refresh rewrites references only on lessons the
  archive owns. **Open gap:** a legacy `setar-classes/` reference on a lesson the archive
  does not own stays in the old namespace; it is the owner's to repoint.
- One media base per device, naming the archive folder: no second archive-specific base,
  no resolver fallback. The shared media root is derived from it
  (`src/domain/mediaRoots.ts`), never guessed; each reference resolves against exactly one.
- The NAS publisher's token is separate and repository-scoped, kept only in the NAS
  runtime; the branch restriction is the script's, never called credential isolation. No
  credential or archive root enters a committed file, app data, a log, sync or a backup.

## Courses are reference data in code

Runbooks: `docs/cgs-course.md`, `docs/khonyagar-course.md`.

- A course never reuses the Setar archive machinery: no persisted graph, no inbound door,
  no schema change. Its scanner is the only grammar; generated data
  (`src/domain/courseData.ts`, `src/domain/khonyagarData.ts`) is never edited by hand.
- Catalogue keys are added, never renamed (`src/domain/pathways.test.ts` holds them); a
  section never moves stage; a work key never changes meaning.
- One musical work is one repertoire item. Identity is DECLARED (`courseWorkKey`,
  `carriedCourseWorkItem`), never matched by name. Material is composed from the catalogue
  (deduplicated by path); guidance is copied into notes once and never overwritten.
- Only the owner adds levels or shipped defaults: offered by deterministic id
  (`offeredCourseLevels`, `offeredDefaultPathways`), added only when chosen;
  `reseedDefaultPathways` never adds a stage to an existing pathway.
- Routine minutes scale proportionally (`fitRoutineToMinutes`); essentials-only is a
  separate choice and drops are named honestly (`describeFitDrop`). Khonyagar ships no
  routine; nothing may claim the Session Plan follows its guide. A Khonyagar item carries
  no Persian identity inferred from a title.

## Review scheduling stays explainable (r-explainable-scheduling)

Numbers: `docs/scheduling-evidence.md`. One pure decision, `decideReview`
(`src/domain/scheduling.ts`); preview, write and screen render it.

- Practice is exposure; only eligible retention evidence (a stable result, due, not
  already advanced today via `srLastProgressDay`) advances spacing. `same` is not failure.
  Only `worse` may bring an automatic date forward, never later. A future date the owner
  owns (or of unknown provenance) is protected until due. A keep completes nothing.
- An open date editor is bound to the item and date it was opened for
  (`reviewDateDraftFor`). "Schedule again", "Use automatic scheduling"
  (`transferToAutomaticReview`, keeps the date) and "Review today" are administration and
  record no practice; ambiguous schedules are refused, never guessed. Never describe a
  retained date as a new calculation.
- Bounded params (`SchedulingParams`, `clampSchedulingParams`) are threaded wherever a date
  is shown or saved. The published priority formula, `importance*2 + difficulty +
  fragility + overdue + neglected + lessonUrgency - exposurePenalty`, is what the code
  computes (`src/domain/scoring.test.ts`) and what Settings shows with live values. Keep it
  deterministic, never an opaque model. Keep status enum keys stable; change only their
  labels (`src/domain/labels.ts`).

## The Session Plan is a view over real blocks

`src/domain/plan.ts` reuses the same `scoreItems` priorities (numbers:
`docs/scheduling-evidence.md`). Minutes never exceed the budget; a budget outside 5-120 is
rejected, never clamped (`validateBudgetMinutes`); one `isProactiveCandidate` policy and one
`candidatePool` serve build and swap; resting material never surfaces; warm-up is a role
for familiar easy items; a diversity preference stays subordinate to real needs. A plan is
stale when `rev` or the local day moves, and Start rechecks the day. It runs real blocks,
revalidating each segment's item at start; skipping logs nothing. `activePlan` is
ephemeral and never synced.

## Device, sync and infrastructure

- MacBook-first, iPhone companion, one installed PWA served by GitHub Pages, deployed only
  behind lint, tests and build (`.github/workflows/deploy.yml`). **Owner decision
  2026-07-11:** the repo is public.
- **Sync** (r-no-silent-data-loss): whole snapshots to the owner's GitHub data repo,
  committed atomically (`src/store/syncEngine.ts`); decisions by content hash
  (`decideSync`, `hashState`), never timestamps. Both-changed is an explicit two-button
  conflict and both copies are preserved before any replace. Never a silent merge or
  per-field magic. Manual export/import stays the fallback.
- **Secrets** (r-secrets-stay-on-device): the GitHub token (scoped to the one data repo)
  and NAS base URL live only in this browser's localStorage, never in exports, backups or
  sync.
- Keep storage roles distinct: IndexedDB (truth), GitHub sync (transport), NAS backup
  (independent export), NAS recordings (media).
- Repository tools change only what they can prove they wrote (a folder they created, a
  marker's claims, a scanner's own output; a path's name proves nothing), never delete,
  never write through a link and never exit 0 without running. `docs/nas-topology.md` maps
  what each path reaches; `scripts/nas-mirror.mjs` is an optional HTTPS mirror for an
  unmerged build, never the primary.
- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`; installed standalone
  `100vh`, owner-passed on iOS 27). Diagnose keyboard drift from traces, never guesses
  (`src/components/viewport.ts`). Five equal nav tabs; Today owns Start. The service worker
  prompts (in-app Reload), never a reinstall. The build ships a CSP of self plus
  api.github.com only.
- Canonical names: practice item, Study source, Pathways / My repertoire / Practice list,
  "Add practice item", "Based on / reference", "Connect it (optional)".

## Architecture and tests

- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now`
  (r-pure-tested-domain). Recommendations carry a one-sentence reason from the numbers that
  ranked them. Only the store mutates app data; attachment blobs live in
  `src/store/attachments.ts`. One file per route under `src/pages/`; pure helpers go in
  non-component modules.
- Every inbound database (rehydration via both persist `migrate` and `merge`, import, sync
  pull, Keep remote, archive restore, cold-start recovery) runs `validateDB`
  (`src/domain/io.ts`) and its migrations; schema changes bump `SCHEMA_VERSION` (now 15). A
  refused hydration leaves memory and disk untouched and offers recovery only for invalid,
  never too-new, data.
- Colour contrast is checked by `src/styles/contrast.test.ts`; change a light token in
  both of its blocks.
- `npm test` must pass; update tests with any scoring or scheduling change. Browser
  journeys are Vitest tests driving Playwright as a library, each with its own dev server
  and browser context and no live GitHub or NAS (GitHub is faked at the `fetch` boundary).
  They drive rendered controls by role and name, never a debug hook or a source regex, and
  fail, never skip, when a browser is missing (`npx playwright install chromium webkit`).
  WebKit cannot store a Blob in IndexedDB under automation, so its journeys seed
  state-only. Harness rules (`tests/practiceBrowser.ts`; read `DECISIONS.md` 2026-09-29
  first): keep every page error, never `goTo` the route you are on, `connectSync` waits for
  the enabled Sync now, a private Vite cache per server, the fake GitHub remembers `main`
  after bootstrap, and a cold-start timeout is a question, never a number to raise.
- Roadmap items that fit (audio notes, CSV export, reminders, teacher PDF) are allowed;
  contradicting a do-not needs an explicit owner decision recorded here.
