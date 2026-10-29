# AGENTS.md - development rules for Practice Compass

## The core loop

Preserve **one item · one mode · one focus · one result · one next action.** A change blurring the loop or adding a second thing per step is wrong, however useful. The loop closes: `ActiveBlock` shows the latest NON-EMPTY `nextAction` before you play (`lastNextAction`). Anything the app asks you to record, it must use.

## Hard do-nots (only an explicit owner decision, recorded here, changes one)

- **No gamification** (r-no-gamification): no streaks, points, badges, XP, leaderboards, confetti or fake "mastery %"; progress is honest status, results and neutral counts.
- **No backend, no auth server, no service of our own** (r-local-first-offline): IndexedDB is each device's truth, everything works offline, free tiers only. **Owner decision 2026-07-11:** sync IS sanctioned via the owner's own GitHub data repo; never a custom server, never a NAS backend replacing it.
- **No AI or audio analysis** in v1: no tone scoring, pitch detection, posture tracking or "AI teacher". The app organises; it does not grade.
- **No guilt-driven copy.** Insights are neutral observations, never nags.

## How to change this file

- CURRENT rules only, each once, as an imperative plus where it is enforced, edited in place only when a rule changes; never append how a rule was found (why: a dated `DECISIONS.md` entry; mechanism: `docs/*.md` or the enforcing code).
- CLAUDE.md plus its imports, and this file alone, each stay <= 32,768 bytes (`tests/agent-context.test.ts`): condense in place; detail may move to its doc; a prohibition aimed at agents stays here. Rule ids (`r-*`) sit beside their text.

## Practice information has one home per kind (schema v13)

- Four homes (`practiceInformation.ts`): `PracticeItem.notes` ("Working notes", editable mid-practice), `PracticeBlock.observation`, `PracticeBlock.nextAction`, `lessonAgenda`. Legacy `PracticeBlock.constraint` is kept, shown and validated, never newly captured. Nothing copies one home into another; the latest observation is derived (`latestObservation`), shown dated, never stored back.
- **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`, `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen working-detail fields (`RETIRED_PERSIAN_KEYS`, `RETIRED_GUITAR_KEYS`) are REMOVED, not merged into `notes`; identity fields (`dastgahAvaz`, `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. It covers exactly those fields, NOT practice history, ratings, reviews, commitments or future text. `retirePracticeText` only deletes, reads no clock, runs on every inbound database.
- `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block): absent, empty, `null` pass; a wrong type is refused naming the record, never coerced.
- Notes are edited only in `ItemNotes.tsx` (lessons: `DurableNotes`), Done optional, never on blur: autosaved and flushed on exit to its record; `saveNotes` keeps both texts if the stored one changed and never recreates a gone record. "Saved." waits for IndexedDB; a failed write keeps the text with Try again (always writes) and Copy. The draft is read through a ref, never a closure or a ref an effect mirrors; an in-flight write never owns the editor; only the latest save acts (`saveSeq`). Editing notes changes nothing else.
- After any install every attachment the database describes has bytes here (r-no-silent-data-loss): `decodeBackupFiles`/`importFullBackup` refuse a file breaking that, naming it, changing nothing; `validateDB` refuses duplicate attachment ids. Exports come from metadata (`buildFullBackupWithRev`), never refused; unreferenced blobs are never deleted; `addAttachment` writes the blob first.

## Quick start, low admin (r-quick-start)

- Start a block in under 30 seconds, close one in under 60. Only an item title is required; a new field is optional with a smart default (status -> mode, item -> focus via `focusForItem` only, 10 minutes); rich metadata hides until asked.
- Exactly two one-step creation paths, never a third: Quick add (title only, also inline from Start and recommendations) and kind-first "Add practice item" (`itemKinds.ts`), every connection settable at creation; item detail shows "Connected to" first. A new instrument family drops identity fields its form cannot show (`dropUnshownIdentity`).

## Today is a session workspace for one instrument (r-one-instrument-per-session)

- A persisted `sessionInstrumentId` scopes everything below Today's switcher; the cross-instrument Overview is a deliberate second choice, never the default. Never hard-code a morning/evening schedule or show another instrument's work in a session. The primary recommendation stays above the fold at 390x844.
- Session Plan and Routines are independent peer doorways (`PlanCard`, `RoutinesCard`; owner acceptance 2026-08-28), each collapsed (~50px), with own state and Resume. Today is an unplaced routine's only home (Edit, Start, essentials only).
- **Owner decision 2026-09-11:** the two doorways sit ABOVE the recommendation, a taste judgement, not a derivation: never re-derive or flip it; only the owner changes it.

## Closing a block and review actions (r-practice-completes-reviews)

- Only closing a block can complete a review or advance SM-2 (not always). "Not now" hides a due review for today, schedule unchanged; Snooze (+2d) moves the date on review and item. Never fabricate a result or leave a stale overdue item. Finish freezes the clock (`pauseSession`) first.
- A result is required to save; "Save without a result" keeps `not_logged` deliberate. Results are `scope`d (focused unless marked whole); readiness changes only on a tap. `computeReviewOutcome` returns the date and `completeOpenReviews` as ONE decision (no result keeps both; a decline clears the date, completes the row); `closeSession` never decides the row alone.
- `CloseBlock` leads with the musician's words, then minutes and ONE scheduling line, controls a tap behind, all rendering one `ReviewPlan`, never a second derivation; "Why this date?" opens `SchedulingExplanation` in place. A new result clears a typed date unless `reviewOverrideSurvivesResultChange`; only a typed date is an override (`closeOverrideDate`). Save uses the screen's `now`; a rolled day refreshes visibly. One collapsed line edits Status, Primary focus, Current effort, intention (`applyCloseEdits`, by key presence, same write); the review uses the item as practised. Back keeps the inputs for THAT block only (`closeDraft.ts`), in memory, never persisted; derived values are recomputed.
- The due-review row wraps its title, never truncates it.

## Unfinished practice is never replaced (r-no-silent-data-loss)

- PRESENCE of unfinished practice, paused or running (`decideReplacement`), alone decides whether a whole-database replacement proceeds. A stale clock (`isStaleClock`) only proposes minutes, labelled (`StaleNote`) wherever Today shows it; never wire it to a destructive path, `shouldKeepAwake` or `nextSignal`.
- Automatic sync defers (`deferred`, never `error`); Import, Restore archive and Keep remote refuse naming the session. `importFullBackup(text, intent, decidedFromRev)` checks presence, then again with the local `rev` (a counter, never a clock) in the install's tick, never installing before `replaceAllBlobs`; `decidedFromRev` is passed in (sync captures it with its db), never read from module scope. A mid-run sync request is remembered (`rerunWanted`), never dropped; the deferred retry (`deferredSyncRetry`, seeded with current presence) watches presence clearing, never `rev`.
- `active`, `activeRoutine` and `activePlan` are ephemeral, never in `PracticeDB`; `installDatabase` resets them, `notNow` and an unresolvable `sessionInstrumentId`; `importDB`, `resetDemo` and `clearAll` are each one `set()` of it. Deliberate erasure keeps no guard.

## Practice totals are calendar figures

`practiceTotals`/`practiceTotalsByInstrument` count local calendar days, week from Monday 00:00, never rolling hours (`blocksInWindow`, `totalMinutesInWindow`); a block belongs whole to its start day. Neutral counts (no goal, filling bar or judging colour) below the recommendation. Today and Insights tick `now` per minute; Lessons, Repertoire and StageDetail roll at local midnight (`useDecisionNow`), never a `now` frozen at mount. Insights counts all instruments, no empty rows.

## Hands-free practice

Full: `docs/setar-practice-reliability.md`.

- A visible running clock holds one wake lock (`shouldKeepAwake`). `nextSignal` announces at most once per call, moving `signalledThrough` to the boundaries passed, never by one; routine boundaries are `segmentBoundaries`, never a second sum; Skip acknowledges. The guaranteed signal is visual (a routine boundary shows for a window, never one render); a block never auto-finishes; audio and vibration are best-effort, never asserted; each readying tap makes a fresh audio context (`practiceCue.ts`), never from render or an effect, and plays only on a granted marker claim; the metronome (`metronome.ts`) starts only by a tap, never by itself. A routine starts only from a tap, never an effect, after its preview; none of this changes a minute.
- The wake lock, `crypto.subtle` and the service worker need a secure context (not LAN `http://`): judge branches over HTTPS; never a fallback hash (`parseSourceIndex` refuses first).

## Pathways, routines and repertoire

Full: `docs/repertoire-experience.md`.

- The practice item is the only unit of work; pathways are a view, never a parallel to-do list, "pieces" object or guitar-specific model. Parts (`parentItemId`), never quotas: on each write changing the link or instrument, `partRelationRefusal` refuses a parent that is the item, its own part, a part or on another instrument, and a work with parts becoming one; never repaired on read.
- Suggestions (`pathwaySeed.ts`) are reference aids, never canonical, keys stable; `addFromCatalog` adds an honest "Not practised yet" item in one `set()`, never a second `addMaterial`; they bind by reference id via one resolver, `resolveCatalogReference`, never by title or placement; candidates are never picked; placing isn't linking. Unlink, Remove from pathway, Hide never delete; hidden suggestions count for nothing; an empty stage is never complete; Delete practice item is the only destructive action. Legacy evidence is settled or refused, never promoted or lost; writes pass `identityRefusal`, never overruling another item's legacy answer (`legacyClaimRefusal`); validity never reads an instrument's name.
- Pathways, stages and routines are editable; deleting one only detaches, clearing a stale pin; a `currentStageId` pin wins; one route selector; linear order is never truth for Setar/Tar.
- A routine's instrument is required when new, never invented for a legacy one; bound items match it, never by rewriting an instrument (an unresolved placement is cleared, never read as General). A run freezes its segments, writes at most one `not_logged` block per bound item, never completes a review or advances SM-2; Routine complete annotates only those blocks; Move on keeps elapsed, Skip/Remove log nothing (a legacy run's Skip clamps to elapsed; Short on time drops non-essentials); Finish always saves. ONE practice clock (`locateClock`, wall-clock elapsed); the persist `merge` freezes both, losing neither.
- My repertoire is a lens excluding technique, exercise and study material; browsing never writes `sessionInstrumentId`. One term vocabulary (`musicTerms.ts`): ids never derived from a label; legacy text is never rewritten, nothing reseeds; identity exact, transliteration search only; a reclassifying edit or another term's spelling is refused; only unused custom terms delete; gusheh titles are not terms; nothing closes before acknowledgement.
- A study source (`studySources.ts`) is never a person, pathway or lesson, never deduplicated by title or shared across instruments; `sourceKey` once per instrument (a second is refused, never silently un-keyed); an unproven match is asked.
- Seeds are never fabricated authority; an upgraded Setar device keeps its mixed pathway, offered only the named radif (`MIRZA_ABDOLLAH_RADIF`, PARTIAL); Forms is a lens, never a pathway; per-gusheh `about` stays a generic prompt, never invented specifics; copy is calm, self-paced.

## Lessons, the agenda and NAS references (r-large-files-stay-on-nas)

- A `Lesson` is per instrument; `lesson.itemIds` links, never owns. A preparation's own class date is the ONE sanctioned deadline (`lessonUrgencyScore`, `preparationDatesByItem`), never guilt-toned.
- Attachments belong to an item OR a lesson by `ownerType` AND `ownerId` (`attachmentsOwnedBy`, for every list, count and delete); `attachmentPolicy` warns over 10 MB and for any video, refuses over 40 MB. A lesson's own files render once, in their own sections (`lessonFiles` is only the archive's).
- Class videos and score PDFs are NAS references (`Lesson.recordings`), never bytes in IndexedDB, sync or backups. `resolveRecording` joins a relative path to the per-device base, opening only on a tap, never with a bad base; removing a reference never touches the NAS file.
- `lessonAgenda` is the one home for class preparations and questions (open -> asked, optional answer), one typed union, never independent booleans; a question never changes practice priority. An entry with no lesson is visibly unassigned, never guessed; new ones default to the nearest upcoming lesson, named; questions select by lesson id. Asked is explicit, reversible history that logs no practice and is never copied forward. Deleting a lesson detaches its entries; deleting an item drops its preparations, keeps its questions. Practising never clears a question; a live one autosaves ONE entry, never resurrected (`saveLiveQuestion`); one raised at close is a new entry, never overwriting another.
- `migrateToV12` converts legacy `assignedForLesson`/`teacherQuestion` once, guessing nothing, reading no clock ("represented" means the same text). `validateDB` refuses invalid new intent, including a dangling live `lessonId` or `itemId`. Calendar values validate by round-trip (`isValidISODate`, `isValidISODateTime`), one check per file, never a shared import.

## Direction-aware text (r-direction-aware-text)

- Built-in Setar/Tar data is Farsi behind stable ascii ids (`slug`/`key`); generic UI and Classical Guitar stay English. Every search uses `itemMatchesSearch` (over `farsi.ts`, never a second matcher).
- Direction resolves natively (`dir="auto"`), never by script detection in JavaScript or reordering text; `unicode-bidi: plaintext` only on `.input`/`.textarea`.
- `dir="auto"` goes on GROUPS (a title with its details) and fields, never bare on a title element; the title is the group's first strong text (an English eyebrow stays outside); the group re-declares `textAlign: 'start'` ('center' on a centred screen; Active's title group is deliberately start-aligned). In a group an independently authored value gets its own `dir="auto"`; generated copy is ONE inline `dir="ltr"` isolate per line, each value nested in its own `dir="auto"`, never sibling isolates or bare words beside one; separators stay outside a label isolate; a clipped line wraps. `dir="ltr"`/`"rtl"` only on `span`/`bdi`. Never isolate the element a group resolves from.
- An instrument name is owner text resolving its own direction in every file, never pinned LTR or fused into a template string. `<option>` text and `confirm()`/toast strings are out of scope.
- Generated plain text (insights, report, class sheet) wraps owner values with ONE helper, `isolate` (`src/domain/util.ts`, per line, never twice), never a stored value; an insight title never embeds one. **Owner decision 2026-10-22:** one UI-refresh lane closed the QuickAdd and insights gaps.
- `dir="auto"` list items drop the native marker (`role="list"`, ordinal as a flex child); in `ClassQuestions.tsx` the guaranteed question, not the optional title, anchors each item; in multi-line text the first line anchors; later lines carry `dir="auto"`.
- `direction.test.ts` enforces this with ledgers each new site joins; it scans source: write every `dir` literally, never computed; its title allowlist is EMPTY (an exception goes there AND here). Verify MISMATCHED languages in both engines.

## Material reaches you where you are

- Browse screens seed their instrument filter from `sessionInstrumentId` (`defaultInstrumentFilter`), never write it, never remove the cross-instrument view; a narrowed Pathways view hides General pathways too (`pathwaysForInstrumentFilter`); every door out keeps the filter.
- An item's material is composed, never stored (`itemFiles`, deduplicated by path); linked lessons add only when not archive-bound; references and attachments never merge or split across sections; ItemDetail's Files list only adds and removes; only a local image renders inline. Practice shows material in one closed disclosure below the timer, never a panel, viewer or dashboard; no material or viewer concern may touch a recorded minute, the wake lock or a boundary announcement. An item with no lesson link has no NAS material (its own lane's gap).
- A NAS reference is stored relative to the base (`relativizeReference`), anything else as given. A base is an origin and a path: `normalizeBaseUrl` refuses credentials, query and fragment, never strips them. Browse is offered only where it works, never as a dead link or an error; a missing NAS never blocks practice.

## The Setar archive is a source: it describes, never testifies

Runbook and full: `docs/setar-archive.md`.

- The grammar lives once, in the scanner; the app never parses a filename. The scanner never follows a symlink, treats a failed read as empty, splits on token 0 or picks the largest file; a rename loop or fork is diagnosed, never walked. The app refuses a newer index version, a wrong digest or a wrong-typed value; `checkSourceGraph` guards each door. Fix the grammar or the door, never with a guard in a component.
- Archive evidence never establishes practice, a result, exposure, review completion or schedule progress. The owner's own practice takes are never a resource; a roster is the registry's, never inferred from files; an unnamed demo never spreads over a guessed set; every role-named file, registered or not, counts against the roster. An imported class is history even when future-dated (`isUpcomingLesson`, never a bare date compare); imported pieces arrive resting.
- Exact bindings win; weak ones ask, never merge; `aliases_seen` is search only, never identity; a built-in `catalogKey` never equals a canonical key. Decisions, Skips and deletions persist; one whose premise moved is refused as stale; an unanswered offer writes nothing; a registry field is offered only when changed; Restore lifts one exact suppression; `--attention` only prints; Review Setar setup writes only selected rows, never on load, import, sync or Refresh. The commit re-plans, validates, waits for IndexedDB, never replaces the database or touches a blob. Moving an archive-bound item to another instrument is refused.
- Legacy paths: the rename log or a diagnosis, never fuzzy matching; `not-described` never means gone; two rows naming one file both survive; a refresh rewrites only the archive's lessons. **Open gap:** a legacy `setar-classes/` reference on a lesson it does not own waits for the owner.
- One media base per device, no resolver fallback; the media root is derived (`mediaRoots.ts`), never guessed; each reference resolves against exactly one; an undecodable base is unrecognised, never thrown. An unreachable NAS is never called absent (`describeArchiveAccess`). The NAS publisher's token is separate, repository-scoped (no workflow or admin scope) and only in the NAS runtime; its branch restriction is never called credential isolation; no credential or archive root enters a committed file, app data, a log, sync or a backup.

## Courses are reference data in code

Full: `docs/cgs-course.md`, `docs/khonyagar-course.md`.

- A course never reuses the Setar archive machinery: no persisted graph, inbound door or schema change. Its scanner is the only grammar, never imported by or reachable from runtime; what it can't read is absent with a diagnostic, never guessed; it refuses a duplicate key. Generated data is never hand-edited; legacy key aliases live in hand-written `courseSeed.ts`. Stored paths are NFC.
- Keys are added, never renamed (`pathways.test.ts`); a section never moves stage; a work key keeps its meaning; a shipped work row is never removed (literal ledgers, never derived from the data); only a declared work key crosses stages; a preserved key goes to the one with real content, never merely the lower ordinal.
- One work is one repertoire item (`courseWorkKey`), never matched by name, ZWNJ or space; only an entry naming one work becomes repertoire, never a drill, an aid or two works. Material by path, never basename; contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list; guidance is copied into notes once; regeneration never rewrites notes or stored fields.
- Levels and defaults are added only when the owner chooses, never on load, hydration, import or sync; `reseedDefaultPathways` never adds a stage to an existing pathway; `seedInstrumentIds` never reads Setar or Guitar as Tar. `fitRoutineToMinutes` never reuses `allocateMinutes` and names its drops. Khonyagar ships no routine and creates no `Lesson`; nothing claims the Session Plan follows its guide; no Persian identity from its titles.

## Review scheduling stays explainable (r-explainable-scheduling)

Numbers and full: `docs/scheduling-evidence.md`. One pure decision, `decideReview`, for preview, write and screen.

- Working (`returnIntentOf`) returns in 1-3 days, ignoring spacing; only a Keep-fresh whole check's eligible evidence (stable, due, not yet advanced today: `srLastProgressDay`) advances it, and there only `worse` brings an automatic date forward, never later; `same` is not failure; nothing else reads as failure. Class and gap returns are derived, never written. A date the owner owns (or of unknown provenance) is protected until due, and manual mode with no new date keeps it. A keep completes nothing.
- A date editor is bound to its item and date (`reviewDateDraftFor`, reconciled each render, never from an effect); "Schedule again", "Use automatic scheduling" (`transferToAutomaticReview`, keeps the date) and "Review today" (day read at the tap) record no practice; an ordinary item save never releases a protected date; ambiguous schedules are refused, never guessed; a retained date is never described as a new calculation.
- `clampSchedulingParams` goes wherever a date is shown or saved. The priority formula Settings shows with live values is what `scoring.ts` computes, never an opaque model. Status enum keys stay stable (`labels.ts`).

## The Session Plan is a view over real blocks

`plan.ts` reuses `scoreItems`, never a second ranking: no scores, no "optimal" claims, its evidence never dressed up as an optimum. Minutes never exceed the budget; a whole work (`isWork`) gets at least 10; warm-up and cool-down never exceed their shares or take overflow; a budget outside 5-120 is rejected, never clamped (`validateBudgetMinutes`); build and swap share `isProactiveCandidate`/`candidatePool`; resting material never surfaces, even by fallback; next-class preparations (`requiredClassWork`) are seated first or named; omissions start only by choice, never below a floor (`planStartRefusal`); warm-up takes familiar easy items, never a due review or class commitment; diversity stays subordinate; Remove leaves time unused unless given back before Start, never mid-run. A plan is stale when `rev` or the day moves; Start rechecks the day and refuses visibly; each item is revalidated at start; skipping logs nothing. The running plan (`activePlan`, `planMinutesByInstrument`) is store state, never in `PracticeDB`, sync or a backup.

## Device, sync and infrastructure

- MacBook-first, iPhone companion, one PWA on GitHub Pages, deployed only behind lint, tests and build (`deploy.yml`). **Owner decision 2026-07-11:** the repo is public.
- **Sync**: whole snapshots to the owner's GitHub data repo, committed atomically (`syncEngine.ts`); decisions by content hash (`decideSync`, `hashState`), never timestamps. Both-changed is an explicit two-button conflict ("newest" is a hint, never an auto-winner), both copies kept before any replace; never a silent merge or per-field magic. Manual export/import is the fallback.
- **Secrets** (r-secrets-stay-on-device): the GitHub token (one data repo) and NAS base URL live only in this browser's localStorage, never in exports, backups or sync.
- Storage roles: IndexedDB (truth), GitHub sync (transport, never the only backup), NAS backup (independent export), NAS recordings (media).
- Repository tools change only what they can prove they wrote (their folder, a marker's claims, their output; a path's name proves nothing), never delete, never write through a link, never exit 0 without running. `docs/nas-topology.md` maps the paths; `nas-mirror.mjs` is an optional HTTPS mirror, never the primary.
- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`, never `height: 100%`; installed standalone `100vh`). `viewport.ts` judges keyboard drift by geometry, never focus, never touching `<main>`'s scroll, restoring only at full height and scale 1, never while the viewport is short or zoomed; diagnose from traces, not guesses. Five equal nav tabs; Today owns Start; a catalogue row shows its status once. The service worker prompts (in-app Reload), never a reinstall; only a Reload tap reloads, only its window (`appUpdate.ts`). The stamp is the last build-input commit (`app-version.mjs`); the CSP is self plus api.github.com only.
- Every route keeps what `tests/ui-conformance.browser.test.ts` sweeps: one h1, named controls, 390px reflow, a 44px phone floor (stars, in-text links excepted), primitives keep their display. Serif only for `.page-title`, timer, wordmark, `.practise-title`.
- Canonical names: practice item, Study source, Pathways / My repertoire / Practice list, "Add practice item", "Based on / reference", "Connect it (optional)"; links never duplicate the item.

## Architecture and tests

- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now` (r-pure-tested-domain); recommendations carry a one-sentence reason from the numbers ranking them. Only the store (blobs: `attachments.ts`) mutates app data; components never touch IndexedDB or rebuild domain objects by hand; a patch tells an omitted field from an empty one by key presence, never `??`. One file per route under `src/pages/`; pure helpers in non-component modules.
- Every inbound database (persist `migrate` and `merge`, import, sync pull, Keep remote, archive restore, cold-start recovery) runs `validateDB` (`io.ts`) and its migrations, which read no clock and guess nothing; a new collection goes in its `ARRAY_KEYS` and returned object; schema changes bump `SCHEMA_VERSION` (now 17). A refused hydration leaves memory and disk untouched: its throw is never caught, `hydrated` never forced open, nothing set through `setState`; recovery (`importFullBackup`, never a second importer) is offered for invalid, never too-new, data.
- An `aria-pressed` control shows its state by class too (`pressedState.test.ts`). Contrast is checked by `contrast.test.ts`; change a light token in both of its blocks, and only one that fails a listed pair.
- `npm test` must pass; scoring or scheduling changes update their tests. Browser journeys are Vitest on Playwright as a library (own server and context; GitHub faked at `fetch`, no NAS), by role and name, never a debug hook or source regex; a missing browser fails them, never skips; WebKit journeys seed state-only (no Blob under automation). Harness (`practiceBrowser.ts`): keep every page error; `goTo` never the current route, `arrive` after a tap; reads and `reload` wait on storage; no sleep, poller or unpolled presence read (`journey-waits.test.ts`); a cold-start timeout is a question, not a knob.
- Fitting roadmap items (audio notes, CSV export, reminders, teacher PDF) are allowed.
