# Decisions

Durable record of non-obvious choices. Newest first.

## Rejection: a window can never tell a cancellation from a real failure (2026-09-17)

A fifth sealed review rejected the harness's cancellation excuse again. The previous round
(below) made it CONSUMING and bounded by a generous ceiling, but the ceiling was still the
whole bound, matched by host+path alone — and a cancellation that never produced its own page
error stayed a live, unconsumed "credit" for the full ceiling, spendable by ANY later error to
the same URL, including a genuine one that had nothing to do with it. Wording and URL cannot
tell a cancellation's spurious error apart from a real access-control failure — they read
identically by design (that is the whole diagnosis) — so no window, however short, can be the
thing that distinguishes them. Only ORDER can: `excusedCancellation` now tracks EVERY
`requestfailed`, not only cancelled ones, and excuses a page error only when the temporally
NEAREST tracked request to the exact host+path it names is itself a cancellation. A genuine
failure to that URL always fires its own `requestfailed` first, so it automatically becomes the
nearer candidate the instant it happens — a stale cancellation with no error of its own is
never reachable by anything but the error it was actually waiting for. The ceiling
(`CANCELLED_EXCUSE_MS`, shrunk from 30s to 2s) is now purely DEFENSIVE headroom against
delivery lag under contention, not the correlation itself.

A second, independent hole in the same function was found and closed in the same pass:
`message.includes(url.host)` and `message.includes(url.pathname)` are substring tests, and a
crafted host (`evil-api.github.com`, `api.github.com.evil.test`) or path (`state.json.bak`)
that merely CONTAINS the genuine value as a substring passed them. The message is now parsed
into a real `URL` (stripping the space WebKit inserts after the scheme) and compared to each
candidate by `host`/`pathname` EQUALITY, which removes the ambiguity structurally instead of
trying to add more boundary characters to a string test.

Six mutations were run and all six fail their named acceptance test: nearest-event selection
reverted to first-match, the consuming `splice` removed, host/path equality loosened back to
substring `includes`, the diagnosed-wording anchor dropped, the cancelled-type requirement
dropped (any nearest match excuses), and the ceiling check removed outright.

## Rejection: two rules that held for one shape of the same defect (2026-09-17)

A fourth sealed review rejected the reworked Setar-archive diff with two findings. Both are
the previous fix covering one shape of a defect and not the shape beside it, so each fix
here is the rule the shapes share — and the narrower mechanism is subsumed rather than left
next to the new one.

- **A rename source with two destinations still published its first one.** The loop rule
  ("a log that loops names no file") had been closed at every consumer, and the fork sitting
  beside it — `A→B` and `A→C` in the same log — was diagnosed as "not applied" while `A→B`
  was published and used as exact identity: Refresh repaired an authored reference onto B and
  re-keyed an owner's item-scoped hide onto B, although the log never established which file
  A became. A fork and a loop are ONE defect said two ways, so the scanner now publishes a
  replacement name only where the log determines it UNIQUELY and TERMINALLY — a fork
  publishes nothing, a loop publishes nothing, and a chain walking into either publishes
  nothing. The conflicted sources are removed from the map BEFORE the reachability walk, or
  a chain ending at one would still publish a name on the strength of a mapping that was
  meant to be gone. Its diagnostic names every destination seen, once and sorted, because
  `diagnostics` is inside `contentHash` and ac-4's own claim is that a shuffled source yields
  the same semantic index. Refusing the whole index was rejected for the reason the loop case
  already records: an unimportable archive is a worse answer than an unrepaired path. No app
  change was needed — `checkSourceGraph` already refuses a second row for one `from` at the
  decoder and at the persisted door — and ac-12's named test now drives the downstream
  reference and suppression transitions from the scanner's ACTUAL output for a forked log.
  It changes nothing the operator publishes TODAY, and that is checked rather than assumed:
  the corpus baseline records 257 rows in RENAME-LOG.csv and the index carries 257 mappings,
  so no row of the real log is dropped for any reason — there is no fork in it to drop.
- **The harness's excuse for a cancelled request was permanent.** The WebKit
  cancelled-request diagnosis recorded in the previous round was implemented as a permanent
  set of cancelled URLs, with any later page error whose message merely CONTAINED that
  pathname discarded — so a genuine failure at the same path, later in the same journey, was
  swallowed and the journey's `pageErrors` assertion passed over it. A check that can hide
  the failure it exists to catch is worse than no check. `excusedCancellation` is consuming
  (one cancellation, one error) and additionally requires the diagnosed wording and the
  request's host as well as its path, inside a generous ceiling on how long an unconsumed
  cancellation may stand. The ceiling is not a timing correlation: the spurious error arrives
  in the same tick, and a tight window would trade an over-broad filter for a flaky one under
  the contention five concurrent dev servers already create. Matching the request's METHOD
  was considered and is not possible — the page error carries no method.

Four mutations were run and all four fail their named acceptance test: the fork's first
destination published again, the walks-into-a-fork extension removed, the cancellation excuse
made permanent (non-consuming), and the diagnosed-wording requirement dropped.

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
