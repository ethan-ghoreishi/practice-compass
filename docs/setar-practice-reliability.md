# Setar practice reliability: the family proof

What this lane changed, the invariant behind each change, every consumer of it,
and the one named test that proves it. The route that runs all of it is
`node scripts/check-setar-practice-families.mjs` (§9).

---

## 1. The practice cue BEFORE any change (recorded 2026-10-05, base 93dadcb)

Captured through the mounted screens of the unmodified app, in Chromium and
WebKit alike, with the instrumented audio/vibration/wake ports from
`tests/practice-cues.browser.test.ts` (`CUE_PORTS`). Identical in both engines.

The stand-in counts a GESTURE as a trusted input event being dispatched
(`window.event`) under the browser's own transient activation — WebKit's
scoping and the strict reading of iOS's autoplay rule. A context constructed or
resumed outside one stays `suspended`.

| Step | What the app did |
| --- | --- |
| A1 Today → **Start · 10 min** (a click) | Wake lock requested. **No AudioContext, no `resume()`.** |
| A2 target crossed on `/active` | `vibrate(80)`, then **`new AudioContext()` inside a React scheduler task** (`during: message`) → `suspended`; oscillator → gain → destination connected, 880 Hz scheduled at gain 0.2 decaying over 0.3 s on the SUSPENDED context. **No `resume()`.** It never ends, so `onended → close()` never runs: the context is leaked. |
| A3 Pause → **Resume** (a click) | Wake lock released and re-requested. **No audio call at all.** |
| B leave `/active`, pass the target elsewhere, return | **TWO** contexts and **two** `vibrate(80)` for ONE boundary (`during: popstate`). The development StrictMode double-invokes the mount effect; the second run reads the same captured marker and announces again, because `setSessionSignal` writes unconditionally and reports nothing. |
| C1 Today → Routines → **Start Cue routine** | Navigation only; the run is started by `RoutineRunner`'s mount EFFECT. No audio call. |
| C2 first routine boundary | A fourth **new** context, `suspended`, no `resume()`, leaked like the others. |

So on a device that enforces the gesture rule the cue is structurally silent:
every boundary builds a fresh context nobody ever unlocked. On a desktop whose
policy lets a late context run, it plays — which is why the MacBook could sound
while the iPhone did not. Neither is proof of audibility; that is OWNER.

What this evidence does NOT establish: that the owner's iPhone version applies
exactly this rule, any hardware output, mute switch, routing or interruption.

---

## 2. Future intake: the same generic steps for every class

The owner's ongoing route is declaration, never code: `--attention` (read-only,
`docs/setar-archive.md` §2) → the owner confirms rows in PIECES.csv /
RENAME-LOG.csv → the existing NAS job publishes → Refresh. The runbook is
`docs/setar-archive.md` §7. Session 40 and Session 1 are worked examples of
those steps, not special cases; the automated proof runs the same route for
Sessions 41, 42, 43, 45, 57, 58 and 103 on temporary corpora.

The real `--attention` output for the committed fixture corpus
(`tests/fixtures/setar-practice-source-v1.json`, with its future sessions),
abridged — one entry per section:

```text
Setar archive — attention report. READ-ONLY: nothing was written, renamed or published.
An ordinary scan of this archive would publish index cddda669eef6 (6 sessions, 5 pieces, 14 needing attention).
Every draft below is UNCONFIRMED. Nothing in it is read from a filename except the name itself.

1. Pieces named by files but missing from PIECES.csv: 3
   پیش-درامد-چهارگاه-فروتن
     seen: session 40 (نت)
     UNCONFIRMED draft row for the header canonical_fa,form,piece,dastgah,composer,source,aliases_seen,sessions,roles_present,notes:
       پیش-درامد-چهارگاه-فروتن,,,,,,,,,
   (also چهارمضراب-چهارگاه-عبادی from session 40, ضربی-اصفهان-نوری from session 42)

2. Unnamed demonstrations kept with their lesson: 5
   session-40-29-09-2026/نمونه.mp4
     PIECES.csv lists no pieces for session 40, but files in that folder name other pieces, so the roster cannot be trusted for it.
     to attribute it: add 40 to `sessions` for exactly the pieces you can confirm this class taught.
   session-45-03-11-2026/نمونه.mp4
     PIECES.csv lists no pieces for session 45, so the demonstration stays with the class.

3. Registered pieces named in a class their row does not list: 2
   رنگ-ماهور-درویش-خان — named in session 41
     Its named files are imported already. Only if it was TAUGHT in that class, its row becomes (UNCONFIRMED; every other cell unchanged):
       رنگ-ماهور-درویش-خان,رنگ,رنگ,ماهور,درویش-خان,,renge-mahoor-darvish|renge-mahoor-darvish-sevom,"1,41","تمرین-من,نت","Confirmed from PDF. ""sevom"" in the filename is a take marker, not part of the name."

4. Rename-log names that are not on disk: 5
   session-1-26-09-2023
     the log says these files ended up here, but no such file exists:
       session-1-26-09-2023/ضبط-کلاس-1.mp4   (logged from session-1-26-09-2023/video-2023-09-27-07-14-52-1.mp4)
     files in that folder that no log row names:
       session-1-26-09-2023/نمونه-1.mp4
     Only you know which became which: nothing here pairs them by number, size or similarity.

5. Other files and rows needing attention: 3
   session-2-24-10-2023/fork.mp4 — Rename log names more than one destination for this path …
```

The owner's confirmed answers for that corpus are
`tests/fixtures/setar-practice-source-expectations.json` (`ownerRows`,
`ownerLogRows`); the journeys apply them to temporary copies only.

---

## 3. Invariants, writers and every consumer

| Invariant | Writers | Consumers (each fixed or checked clean) | Proof |
| --- | --- | --- | --- |
| A roster is the registry's; every role-named file counts against it, registered or not | `PIECES.csv` (owner only) | scanner inventory loop (`session.named` before the type/registry filters), attribution (`rosterTrusted`), diagnostics, `attentionReport` (§2 sections 2–3) | ac-1, ac-4 |
| A new piece is declared, never inferred | owner, from an UNCONFIRMED `--attention` draft against the actual header | scanner registry filter, `attentionReport` drafts (header order, extra columns, quoting kept), app (no filename parsing) | ac-1, ac-4 |
| `studySource` is provenance: absent = unknown, `''` = none, text verbatim; wrong type refused | scanner `parseRegistry` (only when the column exists) | digest, `decodeSourceIndex`, `parseSourceIndex` (fetch + file doors), `checkSourceGraph`, `validateDB` + v16 step, adoption (`sourceReconcile`), setup source groups, import/export/sync/restore/hydration/recovery | ac-2 (+ io companion) |
| A rename is exact evidence or nothing | RENAME-LOG.csv (owner only) | `planArchiveImport` repair, suppression re-key, `itemFiles`/`lessonFiles`, ItemMaterial "not described" label | ac-5, ac-4 |
| A suppression is lifted only as its exact `{kind, ref, itemId}` | `restoreArchiveSuppression` | Recovery list (ArchiveRefresh), refresh planning (`isSuppressed`), `sessionMembership` | ac-3 |
| One association relation; derived membership is never owner history | owner: `linkItemToLesson` / `unlinkItemFromLesson`; archive: session membership | `lessonAssociations` → Lessons "Worked on" + its picker, ItemDetail Connected to + Connections + its picker, setup class rows | ac-6 (+ browser companion) |
| A registry field is offered only when it changed since the ACCEPTED graph, by meaning | the NAS publication; acceptance by Apply | `planArchiveImport` (`fresh`, `sameMeaning`, `GENERIC_FORMS`), summaries, DifferenceRow, Review differences | ac-7 |
| A choice carries its typed premise and exact proposal; a moved premise is refused, said, re-previewed | `archiveValueDecision(s)` (UI) | `decisionMatchesSuggestion`, `commitArchiveImport` stale path, ArchiveRefresh notice | ac-8 (+ browser companion) |
| One kind policy; organisation is a selected review | `classifyPiece` (import seeding and the review) | `itemForPiece`, `persianFromPiece`, `planSetarSetup`, `applySetarSetup` premise check, `commitSetarSetup`, SetarSetupReview (no unseen row joins) | ac-9, ac-10, ac-11 |
| Terms are found while typing on every engine | `MusicalTermField` (typed text or a tapped term) | ItemForm new + edit; `searchAliasTable`/`searchMatch` | ac-12, ac-13 companion |
| Sound is readied only inside a gesture, on ONE page-lifetime context; a boundary sounds only on a granted claim | `primePracticeSound` (store start/resume actions, Test sound, Turn on sound) | `startSession`, `resumeSession`, `startRoutineRun`, `resumeRoutineRun`; routine cards' click handlers and the bare-URL Start; ActiveBlock + RoutineRunner via `claimSessionSignal`/`claimRoutineSignal`; `playPracticeCue` | ac-14, ac-15 |
| Removal from a pathway keeps the item; restoring answers with the same id | `removeFromPathway`, restore | StageDetail notice after Add, row menu, ItemDetail, progress/next/Today/plan/routine readers | ac-16 |
| Focus never falls to the page; an authored value is never fused into generated copy | the controls themselves | Restore (summary keeps focus), term choose/Clear (box keeps focus), "hidden on {title}" isolate, Settings reset row reflow | ac-13 |

---

## 4. Equivalence classes

- **Intake:** registered / unregistered / registered-but-unlisted pieces ×
  empty / consistent / inconsistent rosters × the real 10-column header,
  a reordered header with an extra column, and an 8-column one × future,
  non-consecutive and three-digit session numbers.
- **Provenance:** absent, `''`, known, unknown text; `null`, number, object.
- **Renames:** single, multi-hop, cross-session, unlogged, cyclic, forked ×
  destination present/absent × global/item-scoped hide.
- **Metadata:** each of form, dastgāh, composer, gusheh × unchanged / changed /
  hash churn / first adoption / disappearance / reappearance × empty / literal /
  term / alias / ambiguous / composite × `(قطعه)`, ZWNJ/hyphen, provisional.
- **Premises:** typed empty/literal/ref × rename / meaning change / same label
  different identity × deleted / rebound / moved item / proposal drift.
- **Cue doors:** Today, Start, StageDetail, PathwayDetail, RoutineDuration,
  RoutineRunner bare URL, Session Plan, Resume on Active and on Close × running /
  suspended / interrupted / throwing / hanging contexts.
- **Layout:** Chromium and WebKit × light and dark × normal and 150% text ×
  390×844 (and 1280 where the journey says).

---

## 5. Acceptance map

Run every row: `node scripts/check-setar-practice-families.mjs` (`--unit` for
the Node rows only). One row alone: `npx vitest run <file> -t "<title>"`.

| AC | File | Test title |
| --- | --- | --- |
| ac-1 | tests/setar-practice-source.test.ts | setar durable intake preserves registry authority and exact rename evidence without changing media |
| ac-2 | tests/setar-practice-inbound.browser.test.ts | setar study provenance survives compatible indexes and every saved data boundary |
| ac-3 | tests/setar-practice.browser.test.ts | setar recovery restores only the selected suppression through owner controls |
| ac-4 | tests/setar-practice.browser.test.ts | setar publish fetch and refresh carry source corrections to lessons and item material |
| ac-5 | src/domain/sourceReconcile.test.ts | setar rename consumers preserve authored metadata and never infer missing provenance |
| ac-6 | tests/setar-practice-relations.test.ts | setar association readers agree without copying source membership into owner history |
| ac-7 | src/domain/sourceReconcile.test.ts | setar metadata refresh offers only new meaningful source proposals |
| ac-8 | src/store/archiveIndex.test.ts | setar metadata choices refuse every changed identity and premise before a write |
| ac-9 | src/domain/setarSetup.test.ts | setar setup proposals distinguish learning organisation and source evidence |
| ac-10 | src/domain/setarSetup.test.ts | setar setup commits selected rows atomically idempotently and without collateral changes |
| ac-11 | tests/setar-practice.browser.test.ts | setar setup review is usable through controls and survives interruption |
| ac-12 | tests/musical-term-suggestions.browser.test.ts | musical term suggestions can be found and selected while typing in both engines |
| ac-13 | tests/setar-practice.browser.test.ts | portable term and recovery controls preserve direction focus and scroll ownership |
| ac-14 | tests/practice-cues.browser.test.ts | practice sound reuses one gesture primed context across all start and resume doors |
| ac-15 | tests/practice-cues.browser.test.ts | practice cues preserve wall clock boundaries and every recorded minute |
| ac-16 | tests/setar-practice.browser.test.ts | pathway removal and restoration visibly retain the existing owned item |
| ac-17 | tests/setar-practice-proof.test.ts | setar practice family proof rejects targeted partial fixes before review |

Companions (each leans on, never replaces, its acceptance): io
`study provenance decodes the same way at every reader` (ac-2); setar-practice
`archive associations unlink and relink through every reader and survive a
reload` (ac-6) and `archive metadata controls send the typed premise and
re-preview a stale choice` (ac-8); musical-term-suggestions `term suggestion
controls keep direction focus and scroll on new and edit forms` (ac-13);
practiceCue `practice sound keeps one context primed only by taps and never
queues a cue` (ac-14) and `a boundary claim is granted once and only for the
still-running clock` (ac-15).

Fixtures are committed and synthetic (`tests/fixtures/setar-practice-*.json`);
every clock is fixed in the test; no journey touches live GitHub, the NAS or a
private dump.

---

## 6. Targeted mutations

`node scripts/check-setar-practice-families.mjs --mutations` applies each
partial fix to its source, runs only the named test, requires it to FAIL, and
restores the file byte for byte (the run checks; `git diff --quiet` after).

| Partial fix | Mutated source | Fails | Result |
| --- | --- | --- | --- |
| scanner drops studySource | `scripts/scan-setar-classes.mjs` | ac-1 | failed (caught) |
| decoder drops studySource | `src/domain/sourceArchive.ts` | ac-2 io companion | failed (caught) |
| inbound drops studySource (validateDB rebuilds the graph without it) | `src/domain/io.ts` | ac-2 io companion | failed (caught) |
| a fix hard-coded to Session 40's keys | scanner | ac-1 | failed (caught) |
| an auto-confirmed draft (an unregistered named piece indexed) | scanner | ac-1 | failed (caught) |
| roster disagreement counted only after filtering | scanner | ac-1 | failed (caught) |
| draft row appended positionally (eight columns) | scanner | ac-1 | failed (caught) |
| roster amendment rebuilt from parsed cells (quoting lost) | scanner | ac-1 | failed (caught) |
| a hard-coded session ceiling | scanner | ac-1 | failed (caught) |
| an inferred roster (demo spread over every named piece) | scanner | ac-1 | failed (caught) |
| an unlogged rename guessed by part number | `src/domain/sourceReconcile.ts` | ac-5 | failed (caught) |
| restore widened to kind and target (sibling hides lifted) | `src/store/useStore.ts` | ac-3 | failed (caught) |
| a relation reader bypasses the selector (Connected to reads itemIds) | `src/pages/ItemDetail.tsx` | ac-6 browser companion | failed (caught) |
| a same-label premise accepted | `src/domain/sourceReconcile.ts` | ac-8 (and its browser companion) | failed (caught) |
| unchanged metadata re-offered every refresh | `src/domain/sourceReconcile.ts` | ac-7 | failed (caught) |
| the selected-patch guard bypassed | `src/domain/setarSetup.ts` | ac-10 | failed (caught) |
| an omitted gesture door (Resume does not ready the sound) | `src/store/useStore.ts` | ac-14 | failed (caught) |
| a context created per boundary | `src/components/practiceCue.ts` | ac-14 | failed (caught) |
| no resume or state gate in the prime | `src/components/practiceCue.ts` | ac-14 | failed (caught) |
| an unconditional marker claim (effect replay cues twice) | `src/store/useStore.ts` | ac-15 | failed (caught) |
| a delayed cue queued for a context that is not running | `src/components/practiceCue.ts` | ac-14 practiceCue companion | failed (caught) |
| routine Start moved back into an effect | `src/pages/RoutineRunner.tsx` | ac-14 | failed (caught) |
| term suggestions back to a datalist only | `src/components/MusicalTermField.tsx` | ac-12 | failed (caught) |
| removal from a pathway by deleting the item | `src/store/useStore.ts` | ac-16 | failed (caught) |

Recorded 2026-10-06: all 24 caught, every source restored byte for byte. The
first run MISSED one — a cue queued on a not-running context went unnoticed by
ac-14, whose stand-in never resumes a context after a missed boundary. The
practiceCue companion now drives exactly that (interrupted → boundary → the
owner's next tap resumes) and owns the mutation. Other browser checks named
here also caught mutations aimed at them while they were written: removing the
Restore focus hand-off (ac-13), the term box's focus return (ac-13 companion),
and the typed premise from the screen (ac-8 companion).

---

## 7. What stays OWNER (ac-18, ac-19)

- **ac-18 — one real-device session.** Mac browser, iPhone Safari and the
  installed PWA over a verified secure context, isolated preview data, no real
  sync. Record build, browser, iOS, keyboard, output route and volume. iPhone:
  partial Farsi/Latin term selection, draft kept, native keyboard dismissal.
  Each platform: Test practice sound, a short foreground block and routine
  boundaries, Pause/Resume, one background/lock return — audibility and a
  recognisable two-pulse cue at normal media volume beside the visual cue, the
  recovery gesture and the context state. A routine card stays one tap. Only
  hardware, OS policy and the native keyboard are left here.
- **ac-19 — one live recovery.** The owner runs `--attention`, applies the two
  Session 40 rows and roster and the three Session 1 log continuations by hand,
  deploys the app first and then all three NAS runtime files, runs the job,
  compares publication / commit / hash with Refresh, restores Class 40 under
  "Hidden and removed from the archive", and opens both PDFs and the three
  ordered demonstrations on Mac and iPhone; then reviews the setup exceptions
  before applying any. Re-import cannot recover deleted notes or bytes.

---

## 8. Limits

- Audibility, mute switch, routing and interruption policy are measured only
  on the owner's devices; automation proves wiring, scheduling and claims.
- The fake GitHub carries no attachment bytes in a sync snapshot, so sync doors
  are proven state-only; bytes are proven at import, export and recovery.
- Confirming an undecidable kind as the import's old default is
  indistinguishable from never answering, so that row keeps asking; nothing
  records answers beside the item.
- A same-path byte replacement keeps the index hash: the reference opens the
  NAS's current bytes, with no fingerprint invented.
- `--attention` drafts are UNCONFIRMED; no tool writes PIECES.csv or
  RENAME-LOG.csv.

---

## 9. The route

```sh
node scripts/check-setar-practice-families.mjs              # every family, both engines
node scripts/check-setar-practice-families.mjs --unit       # Node families only
node scripts/check-setar-practice-families.mjs --list       # the manifest; runs nothing
node scripts/check-setar-practice-families.mjs --mutations  # each partial fix must fail its test
```

A missing browser fails (`npx playwright install chromium webkit`); every page
error is kept; each server has a private Vite cache (`tests/practiceBrowser.ts`).
