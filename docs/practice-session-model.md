# The practice session model (schema v17)

What a block's result means, when an item comes back, and what the Plan and
Routine controls do with time. Every number below is a constant in the code;
every example is a literal fixture value a test asserts. Nothing here claims an
optimal music-learning algorithm — these are bounded, published defaults.

Sources: `src/domain/scheduling.ts` (`decideReview`, `WORKING_RETURN_DAYS`),
`src/domain/scoring.ts` (`returnIntentOf`, `effectiveReturnDate`,
`candidatePool`, `sameWork`), `src/domain/practiceSessionModel.ts`
(`nextPractice`, validation, study prompts), `src/domain/plan.ts`
(`removePlanSegment`, `movePlanSegment`, `skipPlanSegment`, `planRunTime`,
`theoryTurnDue`), `src/domain/routines.ts` (`skipCurrentSegment`,
`skipSegmentUnpractised`, `removePendingSegment`, `routineRunTime`),
`src/store/useStore.ts` (`closeSession`, `setReturnIntent`, `saveNotes`,
`persistAgain`), `src/store/notesDrafts.ts`, `src/components/ItemNotes.tsx`.

---

## 1. Three questions, kept apart

A close answers three different questions, and the old model blurred them:

| question | where it lives | default |
|---|---|---|
| What did this block cover? | `PracticeBlock.scope`: `focused` (a chunk, one aspect) or `whole` (an explicit whole-item check) | `focused`; a legacy block has NO scope and stays unknown |
| What happened there? | `PracticeBlock.result` — the six results plus `not_logged` (shown as "Not assessed") | none: a result is chosen, or "Save without a result" |
| Is the whole item ready to be kept fresh? | `PracticeItem.returnIntent`: `working` or `keep_fresh` | absent = derived: an explicit `maintenance` status keeps its old meaning (`keep_fresh`), everything else is `working` |

`returnIntent` is separate from WHO owns the date (`reviewMode`,
`nextReviewSource`). Readiness is never inferred from a stable result, a mode,
a title, elapsed time, a status label other than `maintenance`, or a
successful part. Status suggestions appear only for a whole-item check and
apply only when tapped; "Keep it fresh" is offered (never pre-selected) after a
stable whole-item check on a Working item. A part is its own item: nothing it
records propagates to its parent.

## 2. The decision table (`decideReview`)

Cases are decided top to bottom. "keep" leaves the date AND the open review row
exactly as they are; "set" writes one date to the item and replaces/completes
its open row in the same write (`computeReviewOutcome`).

| # | condition | decision | spacing state |
|---|---|---|---|
| 1 | no result / `not_logged` (routine runs, "Save without a result") | keep | untouched |
| 2 | `reviewMode: manual` | keep | untouched |
| W1 | Working, PROTECTED future date (owner's, fixed cadence, or unknown provenance) | keep | untouched |
| W2 | Working, fixed cadence due or unscheduled | set today + `reviewIntervalDays` | untouched |
| W3 | Working, otherwise (engine-owned future date, due, or none) | set today + `WORKING_RETURN_DAYS[result]`; keep when already exactly that date | untouched |
| F | Keep fresh, FOCUSED evidence (any result, `worse` and `performable` included) | keep | untouched |
| K | Keep fresh, WHOLE-item check | the spaced-retention engine (§3) | per §3 |

`WORKING_RETURN_DAYS`: worse **1**, same **1**, slightly better **2**, stable
alone **2**, stable in context **3**, performable **3** — weaker evidence never
returns later than stronger. W3 deliberately may bring an engine-owned long
date FORWARD (the old "only worse moves an automatic date earlier" rule now
holds for Keep fresh alone). Same is never failed recall anywhere.

The close screen decides with the intention THIS close leaves the item in: a
"Keep it fresh" chosen on the screen is an input to the same decision that is
previewed, saved and explained.

## 3. Keep fresh, whole-item check (unchanged retention engine)

Protected future date: keep. Engine-owned future date: keep, except `worse`,
which brings it forward to the earlier of the existing date and the relearn
gap. Due or unscheduled: fixed cadence uses its own gap; `worse` resets spacing
to the relearn gap; a stable result advances SM-2 at most once per local day
(`srLastProgressDay`); same / slightly better hold the current gap. Numbers:
`docs/scheduling-evidence.md` §6.

## 4. Next practice — derived, never stored (`nextPractice`)

| kind | when | date | stored review date |
|---|---|---|---|
| `class` | a LIVE preparation names this item (`preparationDatesByItem`: an upcoming, same-instrument, non-archive lesson) | today; tomorrow when already practised today and the class is later | reported as kept, never overwritten |
| `working` | Working intent | `effectiveReturnDate`: the earlier of the stored date and `WORKING_MAX_GAP_DAYS` (**3**) after the last practice | reported as kept when later |
| `retention` | Keep fresh with a date | the stored date | — |

Ranking reads the same derivation: the `overdue` term uses
`effectiveReturnDate`, and the class term is `lessonUrgencyScore` from the
same live preparation. A passed, removed, retargeted, unassigned,
other-instrument or archive-origin lesson contributes nothing; a question
contributes nothing.

## 5. One candidate pool (`candidatePool`)

Today's cards, a plan's build, regeneration and swaps all draw from it:
anything practised today — a routine's unassessed block included, a class
commitment included — steps aside while anything else is eligible; with
nothing else eligible the pool repeats today's work and every reason says so.
A piece and its own part are one intended work (`sameWork`): one card or
segment, unless the other has its own due review — a swap included, judged
against the segments that stay. Urgency outranks variety:
diversity and the theory turn act only in a plan's middle picks.

## 6. Theory / listening study

An ordinary practice item with strand `reading_theory`, created through the
existing kind-first Add practice item ("Theory / listening study"). It is never
a work (`isWork`), so it never reaches My repertoire or a whole work's
10-minute floor, whatever its title or dastgāh says. A study item not practised
for `THEORY_TURN_GAP_DAYS` (**4**) local days gains `THEORY_TURN_POINTS`
(**3**) in a plan's MIDDLE picks only — never the anchor, and never a warm-up
or cool-down (study is not playing) — so it gets a turn once the urgent work is
seated and there is room.
Item pages offer optional, dismissible study prompts (stable ids, Farsi wording,
questions not facts) that only pre-fill Add practice item.

## 7. Plan and Routine controls — one policy

Selected time is CAPACITY. Removing, skipping or moving on never lengthens
another entry; freed time stays visibly unused until the owner deliberately
reallocates (Regenerate or a new Plan length; a routine length choice).

| state | Plan | Routine | records |
|---|---|---|---|
| before start: remove an entry | `removePlanSegment` — others keep minutes; summary says unused | preview Remove — the run starts without it; the saved routine is untouched | nothing |
| before start: reorder | Move earlier / Move later (`movePlanSegment`) — the whole segment moves | (order is the routine's own) | nothing |
| before start: reallocate | Regenerate / new length → `buildSessionPlan` | "Run it for a different length" → `fitRoutineToMinutes` | nothing |
| running: a later entry | Skip (`skipPlanSegment(run, i)`) | Remove (`removePendingSegment`) | nothing |
| running: current, skip | "Skip this one — save nothing" (block discarded, segment skipped) | Skip (`skipSegmentUnpractised`) — even after time passed | nothing for THAT occurrence |
| running: current, keep partial | Finish → Close → Save (result or "Save without a result"), then the plan advances | Move on (`skipCurrentSegment`) — the elapsed time is kept | the real minutes |
| finish / end | already-saved blocks stay | Finish & save writes one `not_logged`, `focused` block per practised bound item | real minutes only |

The one product difference: a Plan segment is an independently closed block
with its own result and scheduling decision; a Routine is one continuous clock
whose blocks are unassessed (optional capture after, never a retention
judgement). Overtime is recorded as practice and never charged to another
target. An earlier real occurrence of a repeated routine item survives skipping
a later one. A legacy run (no `skipped` flags) keeps its old skip credit.

Time figures, each separate: Plan `planRunTime` → available / planned /
remaining / unused / recorded (a done segment occupies what it actually took,
up to its target, so finishing early frees the rest as unused); Routine
`routineRunTime` → planned / remaining /
unused (seconds), recorded = `aggregateItemMinutes`.

## 8. Notes without a Done dependency

`DurableNotes` (items and lessons alike): every keystroke is held on the device
(`notesDrafts.ts`, localStorage, synchronous — the outstanding window before a
durable copy exists is zero for the local copy and `AUTOSAVE_QUIET_MS` (**800
ms**) plus the IndexedDB write for the canonical one). Leaving — route change,
Finish, a routine boundary, another owner, unmount — writes the draft to the
record it was typed for; collapsing is a Done (written, then closed once it
lands; a failure keeps it open). "Saved." waits for IndexedDB. The store's
`saveNotes(owner, text, base)` decides every write against what is stored NOW:
same text → nothing; stored text unchanged since `base` → replaced; stored text
changed underneath (sync, import, restore, another editor) → BOTH kept, stored
first, then this text under `KEPT_DRAFT_HEADING`; record gone → nothing written,
draft kept on the device. After a reload, held drafts replay through the same
decision before the app opens. Item and lesson ids never share a draft. When a
write kept both texts, the device copy becomes that kept-both text, based on
what the store held, so a retry or a reload never replays the old draft onto it
a second time.

## 9. Data and compatibility

Schema **17**. The migration converts nothing: legacy blocks keep no scope,
items derive their intention, long legacy dates stay exactly as stored (made
reachable by §4, never rewritten on hydration). `validateDB` refuses an
unknown `scope` or `returnIntent`; hydration (`migrate` AND `merge`) refuses an
unreadable `activeRoutine`/`activePlan` shape before anything is installed. A
v16 build refuses a v17 file (`SchemaTooNewError`): update both devices, then
sync as usual.

## 10. Consumer inventory

| consumer | reads | checked by |
|---|---|---|
| `closeSession` | `decideReview` via `computeReviewOutcome` (scope, intent) | ac-8, ac-9 |
| CloseBlock line / "Why this date?" | `planNextReview` + `nextPractice`, same inputs | ac-11 |
| ItemDetail Next practice, Comes back as | `nextPractice`, `setReturnIntent` | ac-9, ac-11 |
| Today cards | `recommend` → `candidatePool`, `sameWork`, `effectiveReturnDate` | ac-10 |
| Plan build / regenerate / swap | `buildSessionPlan` / `swapSegment` → `candidatePool`, theory turn | ac-10, ac-12 |
| Plan preview / run controls | `removePlanSegment`, `movePlanSegment`, `skipPlanSegment`, `planRunTime` | ac-2, ac-4, ac-5 |
| Routine preview / run controls | `fitRoutineToMinutes`, `skipCurrentSegment`, `skipSegmentUnpractised`, `removePendingSegment` | ac-1, ac-2, ac-3 |
| Item and lesson notes | `DurableNotes`, `saveNotes`, `notesDrafts` | ac-6, ac-7 |
| Every inbound door | `validateDB` (+ `validateUnfinishedRun` at hydration) | ac-13, ac-14 |
| Insights, teacher report, history | results unchanged; history shows scope | checked clean: no reader treats scope as a result |
| RoutineEdit | keeps a bound segment with no label | ac-1 |

## 11. Proof route and its limits

```
npx vitest run tests/practice-session-families.test.ts tests/practice-session.browser.test.ts tests/practice-session-inbound.browser.test.ts tests/ci-browser-setup.test.ts
```

Each acceptance check is ONE named test. Domain and store families run in
Node (the store with its IndexedDB adapter stubbed, as `blocks.test.ts` does);
journeys drive Chromium and WebKit through `tests/practiceBrowser.ts`.
Expected dates and minutes are literals. Limits: no proof of a process kill
before any storage acknowledges; native iPhone keyboard, sound and wake are
the owner's device check (ac-17); whether the model makes sense in real Setar
practice is the owner's walkthrough (ac-18).

### The reported "only the first item is logged" routine

Reproduced through the real editor: a segment bound to an item with no label
of its own was DROPPED by RoutineEdit's save (`cleanSegments` filtered on the
label alone), so the saved routine had one segment and only the first item was
ever practised or logged. Fixed at that choke point: a bound segment is kept
and shows its item's title. Checked clean: the run's aggregation, Finish before
capture, capture omitted, reload after finish, and history (which never
filtered `not_logged`).
