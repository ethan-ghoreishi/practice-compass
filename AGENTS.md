# AGENTS.md - development rules for Practice Compass

The contract for anyone, human or AI, extending this app; its value is what it refuses.

## The core loop

Preserve **one item · one mode · one focus · one result · one next action.** A change blurring the loop or adding a second thing to think about per step is wrong, however useful. The loop closes: `ActiveBlock` shows the latest NON-EMPTY `nextAction` before you play (`lastNextAction`). Anything the app asks you to record, it must use.

## Hard do-nots (only an explicit owner decision, recorded here, changes one)

- **No gamification** (r-no-gamification): no streaks, points, badges, XP, leaderboards, confetti or fake "mastery %"; progress is honest status, results and neutral counts.
- **No backend, no auth server, no service of our own** (r-local-first-offline): IndexedDB is each device's truth, everything works offline, free tiers only. **Owner decision 2026-07-11:** sync IS sanctioned via the owner's own GitHub data repo; never a custom server, never a NAS backend replacing it.
- **No AI or audio analysis** in v1: no tone scoring, pitch detection, posture tracking or "AI teacher". The app organises; it does not grade.
- **No guilt-driven copy.** Insights are neutral observations, never nags.

## How to change this file

- CURRENT rules only, each once, as an imperative plus where it is enforced, edited in place; never append how a rule was found (the why goes in a dated `DECISIONS.md` entry, mechanism in `docs/*.md` or the enforcing code).
- CLAUDE.md plus its imports, and this file alone, each stay <= 32,768 bytes (`tests/agent-context.test.ts`, Prismatica's budget check): condense in place; detail may move to its doc; a prohibition aimed at agents stays here (that test anchors them). Rule ids (`r-*`) sit beside their text.

## Practice information has one home per kind (schema v13)

- Four homes (`practiceInformation.ts`): `PracticeItem.notes` ("Working notes"), `PracticeBlock.observation`, `PracticeBlock.nextAction`, `lessonAgenda`. Legacy `PracticeBlock.constraint` is kept, shown and validated, never newly captured. Nothing copies one home into another; the latest observation is derived (`latestObservation`), shown dated, never stored back.
- **Owner decision 2026-09-16 (v13 waiver), bounded and one-way:** `currentProblem`, `bestStrategy`, `tags`, `item.lastObservation`, `block.bodyNote` and the fourteen working-detail fields (`RETIRED_PERSIAN_KEYS`, `RETIRED_GUITAR_KEYS`) are REMOVED, not merged into `notes`; identity fields (`dastgahAvaz`, `gusheh`, `form`, `composer`, `lessonNumber`, `barRange`) stay. It covers exactly those fields, NOT practice history, ratings, reviews, commitments or future text. `retirePracticeText` only deletes, reads no clock, runs on every inbound database.
- `validatePracticeText` (in `validateDB`; `validateUnfinishedText` for the running block): absent, empty, `null` pass; a wrong type is refused naming the record, never coerced.
- Notes are edited only in `src/components/ItemNotes.tsx` (lessons: `DurableNotes`): explicit Done, never on blur; "Saved." waits for IndexedDB; a failed write keeps the text with Try again (always writes) and Copy. The draft is tagged with its item, dropped when it changes, read through a ref, never a closure or a ref an effect mirrors; an in-flight write never owns the editor; only the latest save acts (`saveSeq`). Editing notes changes nothing else.
- After any install every attachment the database describes has bytes here (r-no-silent-data-loss): `decodeBackupFiles` and `importFullBackup` refuse a file breaking that, naming it, changing nothing; `validateDB` refuses duplicate attachment ids. The export is built from metadata (`buildFullBackupWithRev`), never refused; unreferenced blobs are never deleted; `addAttachment` writes the blob first.

## Quick start, low admin (r-quick-start)

- Start a block in under 30 seconds, close one in under 60. No required field beyond an item title; a new field is optional with a smart default (status -> mode, item -> focus via `focusForItem` only, 10 minutes); rich metadata hides until asked for.
- Exactly two one-step creation paths, never a third: Quick add (title only, also inline from Start and recommendations) and kind-first "Add practice item" (`itemKinds.ts`: "What are you adding? / Connect it (optional) / First practice setup"), every connection settable at creation; item detail shows "Connected to" first. A new instrument family drops identity fields its form cannot show (`dropUnshownIdentity`).

## Today is a session workspace for one instrument (r-one-instrument-per-session)

- A persisted `sessionInstrumentId` scopes everything below Today's switcher; the cross-instrument Overview is a deliberate secondary choice, never the default. Never hard-code a morning/evening schedule or show another instrument's work in a session. The primary recommendation stays above the fold at 390x844.
- Session Plan and Routines are independent peer doorways (`PlanCard`, `RoutinesCard`; owner acceptance 2026-08-28), each collapsed with its own state and Resume. Today is an unplaced routine's only home (Edit, Start, "Short on time - essentials only").
- **Owner decision 2026-09-11:** the two doorways sit ABOVE the recommendation, a taste judgement, not a derivation: never re-derive or flip it.

## Closing a block and review actions (r-practice-completes-reviews)

- Only closing a block can complete a review or advance SM-2, and not always. "Not now" hides a due review for today, schedule unchanged; Snooze (+2d) moves the date on review and item. Never fabricate a result or leave a stale overdue item. Finish freezes the clock (`pauseSession`) first.
- A result is required to save; "Save without a result" keeps `not_logged` deliberate. `computeReviewOutcome` returns the date and `completeOpenReviews` as ONE decision (no result keeps both; a decline clears the date, completes the row); `closeSession` never decides the row alone.
- `CloseBlock` leads with the musician's words, then minutes and ONE scheduling line, controls a tap behind, all rendering one `ReviewPlan` (`reviewSummaryLine` computes no date), never a second derivation; "Why this date?" opens `SchedulingExplanation` in place. A new result clears a typed date unless `reviewOverrideSurvivesResultChange`; only a typed date is an override (`closeOverrideDate`). Save uses the screen's `now`; a rolled day refreshes visibly. One collapsed line edits Status, Primary focus, Current effort (`applyCloseEdits`, by key presence, same write); the review uses the item as practised. Back keeps the inputs for THAT block only (`closeDraft.ts`), in memory, never persisted; derived values are recomputed.
- The due-review row wraps the title, never truncates it.

## Unfinished practice is never replaced (r-no-silent-data-loss)

- PRESENCE of unfinished practice, paused or running (`decideReplacement`), alone decides whether a whole-database replacement may proceed. A stale clock (`isStaleClock`) only proposes minutes and is labelled (`StaleNote`) wherever Today shows it; never wire it to a destructive path, `shouldKeepAwake` or `nextSignal`.
- Automatic sync defers (`deferred`, never `error`); Import, Restore archive and Keep remote refuse naming the session. `importFullBackup(text, intent, decidedFromRev)` checks presence, then again with the local `rev` (a counter, never a clock) in the install's tick, never installing before `replaceAllBlobs`; `decidedFromRev` is passed in (sync captures it with its db), never read from module scope. A mid-run sync request is remembered (`rerunWanted`), never dropped; the deferred retry (`deferredSyncRetry`, seeded with current presence) watches presence clearing, never `rev`.
- `active`, `activeRoutine` and `activePlan` are ephemeral, never in `PracticeDB`; `installDatabase` resets them, `notNow` and an unresolvable `sessionInstrumentId`; `importDB`, `resetDemo` and `clearAll` are each one `set()` of it. Deliberate erasure keeps no guard.

## Practice totals are calendar figures

`practiceTotals`/`practiceTotalsByInstrument` count local calendar days, week from Monday 00:00, never rolling hours (`blocksInWindow`, `totalMinutesInWindow`); a block belongs whole to the day it began. Neutral counts (no goal, filling bar or judging colour) below the recommendation. Today and Insights tick `now` each minute; Lessons, Repertoire and StageDetail roll at local midnight (`useDecisionNow`), never a `now` frozen at mount. Insights counts every instrument, no empty rows.

## Hands-free practice

- A running clock on a visible screen holds one Screen Wake Lock (`shouldKeepAwake`, owned by `useScreenAwake`). `nextSignal` announces at most once per call, moving the ephemeral `signalledThrough` to the boundaries passed, never by one; routine boundaries are `segmentBoundaries`, never a second sum; Skip calls `acknowledgeThrough`. The guaranteed signal is visual (ring, overtime; a routine boundary shows for a window, never one render); a block never auto-finishes; audio and vibration are best-effort, never asserted; each Start, Resume, Test sound or recovery tap makes a fresh audio context in the tap (`practiceCue.ts`), never from render or an effect, and plays only on a granted marker claim (`claimSessionSignal`). A routine starts only from a tap, never an effect. None of this changes a minute.
- The wake lock, `crypto.subtle` (`sha256Hex`) and the service worker need a secure context: check `window.isSecureContext` over HTTPS before judging a branch; never a fallback hash (`parseSourceIndex` refuses first, `INSECURE_CONTEXT_REFUSAL`).
- **Open gaps:** Sync over plain http still throws the raw `Cannot read properties of undefined (reading 'digest')` (a wording fix in its own lane, never a second hash); `readIndexFile` (`src/store/archiveIndex.ts`) has no production caller.

## Pathways, routines and repertoire

In full, binding: `docs/repertoire-experience.md` ("Rules in full").

- The practice item is the only unit of work; pathways are a view (`itemStageState`), never a parallel to-do list, "pieces" object or guitar-specific model. Parts (`parentItemId`), never quotas: `partRelationRefusal` refuses a parent that is the item, its own part, a part or on another instrument, and a work with parts becoming a part, on each write changing the link or instrument; never repaired on read.
- Suggestions (`pathwaySeed.ts`) are reference aids, never canonical; `addFromCatalog` makes an honest "Not practised yet" item in one `set()`, never a second `addMaterial`; binding is by reference id (`resolveCatalogReference`), never by title or placement; candidates are never picked; placing is not linking. Unlink, Remove from pathway and Hide never delete; hidden suggestions count for nothing; an empty stage is never complete; Delete practice item is the only destructive action. Legacy evidence is settled or refused, never promoted or lost; writes pass `identityRefusal`, never overruling another item's legacy answer (`legacyClaimRefusal`); validity never reads an instrument's name.
- Pathways, stages and routines are editable; deleting one only detaches and clears a stale pin; a `currentStageId` pin wins; one route selector (`primaryPathway`); never treat linear order as truth for Setar/Tar.
- A routine's instrument is never invented for a legacy one; bound items match it (`retargetRoutineInstrument`; an unresolved placement is cleared, never read as General). A run writes at most one `not_logged` block per bound item, never completes a review or advances SM-2; Routine complete annotates only those blocks; Finish always saves. ONE practice clock; the persist `merge` freezes both, losing neither.
- My repertoire (`discoverRepertoire`) is a lens; browsing never writes `sessionInstrumentId`. One term vocabulary (`musicTerms.ts`): ids never derived from a label; legacy text is never rewritten, nothing reseeds; identity exact, transliteration search only; a reclassifying edit is refused; only unused custom terms delete; gusheh titles are not terms; nothing closes before acknowledgement.
- A study source (`studySources.ts`) is never a person, pathway or lesson, never deduplicated by title or shared across instruments; `sourceKey` once per instrument (a second is refused, never silently un-keyed).
- Seeds are never fabricated authority; an upgraded Setar device is only offered the named radif; Forms is a lens, never a pathway; per-gusheh `about` stays a generic prompt, never invented specifics; copy is calm and self-paced.

## Lessons, the agenda and NAS references (r-large-files-stay-on-nas)

- A `Lesson` is per instrument; `lesson.itemIds` links, never owns. A preparation's own class date is the ONE sanctioned deadline (`lessonUrgencyScore`, `preparationDatesByItem`), never guilt-toned.
- Attachments belong to an item OR a lesson by `ownerType` AND `ownerId` (`attachmentsOwnedBy`, for every list, count and delete); `attachmentPolicy` warns over 10 MB and for any video, refuses over 40 MB. A lesson's own files render once, in their own sections (`lessonFiles` is only the archive's).
- Class videos and score PDFs are NAS references (`Lesson.recordings`), never bytes in IndexedDB, sync or a backup. `resolveRecording` joins a relative path to the per-device base, opening only on an explicit tap, never with a bad base; removing a reference never touches the NAS file.
- `lessonAgenda` is the one home for class preparations and questions (open -> asked, optional answer), one typed union, never independent booleans. A question never changes practice priority. An entry with no lesson is visibly unassigned, never guessed; new ones default to the nearest upcoming lesson, named; questions are selected by lesson id. Asked is explicit, reversible history that logs no practice and is never copied forward. Deleting a lesson detaches its entries; deleting an item removes its preparations, keeps its questions. Practising never clears a question; one raised at close is a new entry, never overwriting another.
- `migrateToV12` converts legacy `assignedForLesson`/`teacherQuestion` once (guessing nothing, reading no clock; "represented" means the same text). `validateDB` refuses invalid new intent, including a dangling live `lessonId` or `itemId`. Calendar values are validated by round-trip (`isValidISODate`, `isValidISODateTime`), one check per file, never a shared import.

## Direction-aware text (r-direction-aware-text)

- Built-in Setar/Tar data is Farsi behind stable ascii ids (`slug`/`key`); generic UI and Classical Guitar stay English. Every search goes through `itemMatchesSearch` (one wrapper over `farsi.ts`, never a second matcher).
- Direction resolves natively (`dir="auto"`), never by detecting script in JavaScript or reordering text; `unicode-bidi: plaintext` only on `.input`/`.textarea`.
- `dir="auto"` goes on GROUPS (a title with its details) and fields, never bare on a title element; the title is the group's first strong text (an English eyebrow stays outside); the group re-declares `textAlign: 'start'` ('center' on a centred screen). In a group, generated copy is ONE inline `dir="ltr"` isolate per line with each value nested in its own `dir="auto"`, never sibling isolates or bare words beside one; separators stay outside a label isolate; a clipped line wraps. `dir="ltr"`/`"rtl"` only on `span`/`bdi`. Never isolate the element a group resolves from (`dir="auto"` skips descendants carrying a `dir`).
- An instrument name is owner text: it resolves its own direction, never pinned LTR or fused into a template string, in every file. `<option>` text and `confirm()`/toast strings are out of scope.
- Generated plain text (insights, report, class sheet) wraps each owner value with ONE helper, `isolate` (`src/domain/util.ts`, per line, never twice), never a stored value; an insight title never embeds one. **Owner decision 2026-10-22:** one UI-refresh lane closed the QuickAdd and insights gaps.
- `dir="auto"` list items drop the native marker (`role="list"`, ordinal as a flex child); in `ClassQuestions.tsx` the guaranteed question, not the optional title, anchors each item; in multi-line text the first line anchors, later lines carry `dir="auto"`.
- `src/components/direction.test.ts` enforces this with ledgers each new site joins; it scans source, so write every `dir` literally, never computed; its title allowlist is EMPTY (an exception goes there AND here). Verify MISMATCHED languages in both engines.

## Material reaches you where you are

- Browse screens seed their instrument filter from `sessionInstrumentId` (`defaultInstrumentFilter`), never write it, never remove the cross-instrument view; a narrowed Pathways view hides General pathways too (`pathwaysForInstrumentFilter`); every door out keeps the filter.
- An item's material is composed, never stored (`itemFiles`, deduplicated by path); linked lessons contribute only when not archive-bound; references and attachments never merge or split across sections; ItemDetail's Files list only adds and removes; only a local image renders inline. Practice shows material as one closed disclosure below the timer, never a panel, viewer or dashboard; no material or viewer concern may touch a recorded minute, the wake lock or a boundary announcement. An item with no lesson link has no NAS material (a gap for its own lane).
- Store a NAS reference relative to the base (`relativizeReference`), anything else exactly as given. A base is an origin and a path: `normalizeBaseUrl` refuses credentials, query and fragment, never strips them. Browse is offered only where it works, never as a dead link or an error; a missing NAS never blocks practising.

## The Setar archive is a source: it describes, never testifies

Runbook; in full, binding: `docs/setar-archive.md` ("Rules in full").

- The grammar lives once, in the scanner; the app never parses a filename. The scanner never follows a symlink, treats a failed read as empty, splits on token 0 or picks the largest file; a rename loop or fork is diagnosed, never walked. The app refuses a newer index version, a wrong digest (`parseSourceIndex`) or a wrong-typed value; `checkSourceGraph` guards every door. Fix the grammar or the door, never with a guard in a component.
- Archive evidence never establishes practice, a result, exposure, review completion or scheduling progress. The owner's own practice takes are never a resource; a roster is the registry's, never inferred from files; an unnamed demo never spreads over a guessed set; every role-named file, registered or not, counts against the roster. An imported class is history even when future-dated (`isUpcomingLesson`).
- Exact bindings win; weak ones ask, never merge; `aliases_seen` is search only, never identity; a built-in `catalogKey` never equals a canonical key. A decision whose premise moved is refused as stale; an unanswered offer writes nothing; a registry field is offered only when changed; `--attention` only prints; Review Setar setup writes only selected rows, never on load, import, sync or Refresh. The commit never replaces the database or touches a blob. Moving an archive-bound item to another instrument is refused.
- Legacy paths: the rename log or a diagnosis, never fuzzy matching; `not-described` never means gone; two rows naming one file both survive; a refresh rewrites only lessons the archive owns. **Open gap:** a legacy `setar-classes/` reference on a lesson the archive does not own waits for the owner.
- One media base per device, no resolver fallback; the media root is derived (`src/domain/mediaRoots.ts`), never guessed; each reference resolves against exactly one; an undecodable base is unrecognised, never thrown. An unreachable NAS is never called absent. The publisher's token is repository-scoped (no workflow or admin scope), never called credential isolation; no credential or archive root enters a committed file, app data, a log, sync or a backup.

## Courses are reference data in code

In full, binding: `docs/cgs-course.md`, `docs/khonyagar-course.md` ("Rules in full").

- A course never reuses the Setar archive machinery. Its scanner is the only grammar, never imported by or reachable from runtime; what it cannot read is absent with a diagnostic, never guessed; it refuses a duplicate key. Generated data is never hand-edited; legacy key aliases live in hand-written `courseSeed.ts`. Stored paths are NFC.
- Keys are added, never renamed; a section never moves stage; a work key never changes meaning; a shipped work row is never removed (literal ledgers, never derived from the data); only a declared work key crosses stages; a preserved key goes to the one with real content, never merely the lower ordinal.
- One work is one repertoire item, never matched by name, ZWNJ or space; only an entry naming one work becomes repertoire, never a drill, an aid or two works. Material by path, never basename; contrast-card decks are one folder reference, never a viewer, flashcard player or deck-by-deck list; regeneration never rewrites notes or stored fields.
- Levels and defaults are added only when the owner chooses, never on load, hydration, import or sync; `reseedDefaultPathways` never adds a stage; `seedInstrumentIds` never reads Setar or Guitar as Tar. `fitRoutineToMinutes` never reuses `allocateMinutes` and names its drops. Khonyagar ships no routine and creates no `Lesson`; nothing may claim the Session Plan follows its guide; no Persian identity from its titles.

## Review scheduling stays explainable (r-explainable-scheduling)

Numbers; in full, binding: `docs/scheduling-evidence.md` ("Rules in full"). One pure decision, `decideReview`, which preview, write and screen render.

- Only eligible retention evidence (`srLastProgressDay`) advances spacing; `same` is not failure; only `worse` may bring an automatic date forward, never later; nothing else reads as failure. An owner's date is protected until due, and manual mode with no new date keeps it. A keep completes nothing.
- A date editor is bound to its item and date (reconciled each render, never from an effect); "Schedule again", "Use automatic scheduling" (keeps the date) and "Review today" (day read at the tap) record no practice; an ordinary item save never releases a protected date; ambiguous schedules are refused, never guessed; a retained date is never described as a new calculation.
- `clampSchedulingParams` goes wherever a date is shown or saved. The priority formula, `importance*2 + difficulty + fragility + overdue + neglected + lessonUrgency - exposurePenalty`, is what the code computes (`src/domain/scoring.test.ts`) and Settings shows with live values, never an opaque model. Status enum keys stay stable.

## The Session Plan is a view over real blocks

`plan.ts` reuses `scoreItems`, never a second ranking: no scores, no "optimal" claims, its evidence never dressed up as an optimum. Minutes never exceed the budget; warm-up and cool-down never exceed their shares or take overflow; a budget outside 5-120 is rejected, never clamped; resting material never surfaces, even by fallback; warm-up is never a due review or class commitment. Start rechecks the day and refuses visibly; skipping logs nothing. The running plan (`activePlan`, `planMinutesByInstrument`) is store state, never in `PracticeDB`, sync or a backup.

## Device, sync and infrastructure

- MacBook-first, iPhone companion, one installed PWA on GitHub Pages, deployed only behind lint, tests and build (`.github/workflows/deploy.yml`). **Owner decision 2026-07-11:** the repo is public.
- **Sync**: whole snapshots to the owner's GitHub data repo, committed atomically (`syncEngine.ts`); decisions by content hash (`decideSync`, `hashState`), never timestamps. Both-changed is an explicit two-button conflict ("newest" is a hint, never an auto-winner), both copies preserved before any replace; never a silent merge or per-field magic. Manual export/import stays the fallback.
- **Secrets** (r-secrets-stay-on-device): the GitHub token (one data repo) and NAS base URL live only in this browser's localStorage, never in exports, backups or sync.
- Distinct storage roles: IndexedDB (truth), GitHub sync (transport, never the only backup), NAS backup (independent export), NAS recordings (media).
- Repository tools change only what they can prove they wrote (their folder, a marker's claims, their own output; a path's name proves nothing), never delete, never write through a link, never exit 0 without running. `docs/nas-topology.md` maps the paths; `scripts/nas-mirror.mjs` is an optional HTTPS mirror, never the primary.
- Only `<main>` scrolls; nothing is fixed or sticky (`100dvh`, never `height: 100%`; installed standalone `100vh`). `viewport.ts` judges keyboard drift by geometry, never focus, never touching `<main>`'s scroll, restoring only at full height and scale 1, never while the viewport is short or zoomed; diagnose from traces, never guesses. Five equal nav tabs; Today owns Start; a catalogue row shows its status once. The service worker prompts (in-app Reload), never a reinstall; only a Reload tap reloads, only its window (`appUpdate.ts`). The stamp is the last build-input commit (`scripts/app-version.mjs`); the CSP is self plus api.github.com only.
- Each route keeps the conventions `tests/ui-conformance.browser.test.ts` sweeps: one h1, named controls, reflow at 390px, a 44px phone floor (stars, in-text links excepted), primitives keeping their display. Serif only for `.page-title`, timer, wordmark, `.practise-title`.
- Canonical names: practice item, Study source, Pathways / My repertoire / Practice list, "Add practice item", "Based on / reference", "Connect it (optional)"; links never duplicate the item.

## Architecture and tests

- Domain logic in `src/domain/` is pure, React-free and takes an explicit `now` (r-pure-tested-domain); recommendations carry a one-sentence reason from the numbers that ranked them. Only the store (blobs: `attachments.ts`) mutates app data; components never touch IndexedDB or rebuild domain objects by hand; a patch tells an omitted field from an empty one by key presence, never `??`. One file per route under `src/pages/`; pure helpers in non-component modules.
- Every inbound database (both persist `migrate` and `merge`, import, sync pull, Keep remote, archive restore, cold-start recovery) runs `validateDB` (`io.ts`) and its migrations, which read no clock and guess nothing; a new collection goes in its `ARRAY_KEYS` and returned object; schema changes bump `SCHEMA_VERSION` (now 16). A refused hydration leaves memory and disk untouched: its throw is never caught, `hydrated` never forced open, nothing set through `setState`; recovery (`importFullBackup`, never a second importer) is offered only for invalid, never too-new, data.
- An `aria-pressed` control also shows its state by class (`pressedState.test.ts`). Contrast is checked by `contrast.test.ts`; change a light token in both of its blocks, and only one that fails a listed pair.
- `npm test` must pass; scoring or scheduling changes update their tests. Browser journeys are Vitest tests on Playwright as a library (own server and context; GitHub faked at `fetch`, no NAS), by role and name, never a debug hook or source regex; a missing browser fails them, never skips; WebKit journeys seed state-only (no Blob under automation). Harness (`tests/practiceBrowser.ts`): keep every page error; `goTo` never the current route, `arrive` after a tap; reads and `reload` wait on storage; no sleep, poller or unpolled presence read (`tests/journey-waits.test.ts`); a cold-start timeout is a question, not a knob.
- Fitting roadmap items (audio notes, CSV export, reminders, teacher PDF) are allowed; contradicting a do-not needs an explicit owner decision recorded here.
