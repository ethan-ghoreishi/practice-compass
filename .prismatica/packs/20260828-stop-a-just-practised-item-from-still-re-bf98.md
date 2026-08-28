---
id: 20260828-stop-a-just-practised-item-from-still-re-bf98
contractId: 20260828-stop-a-just-practised-item-from-still-re-bf98
contractHash: 3df63b548a2cf51926884e92d838d21cb8a41d121acc435661386888d2eeedb2
createdAt: 2026-08-28T14:34:40.160Z
skills:
  - build
  - simplify
---

# Build brief: Stop a just-practised item from still reporting as overdue

> This brief is scoped and self-contained. A fresh session can resume from it
> alone. Prismatica will check your work deterministically — it never reads this
> chat, only Git and your tests.

- **Linked issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/1
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Work in the lane:** /Users/Ehsan/workspace/active/practice-compass-lanes/20260828-stop-a-just-practised-item-from-still-re-bf98

## The plan the owner approved

This is the complete approved proposal, verbatim. `assumptions` and
`possibleConflicts` are the Planner's advisory reading — treat them as leads to
verify against the code, never as established fact.

````yaml
# Approved intent: Stop a just-practised item from still reporting as overdue

The owner imported this plan and confirmed the change. Its approved meaning is
recorded here verbatim; the transport snapshot is deliberately omitted.

- **Kind:** existing-flow
- **Risk tier:** heavy
- **Builder:** claude

## What the owner asked for

This is the wording the owner and the planning agent settled on together, taken
from the plan itself — not a description reconstructed afterwards.

> Start the most critical lane coming out of the two attached artifacts (the 27 August code review and the 28 August build advisory): the review-scheduling divergence cluster, findings §1.1–§1.5. The item's nextReviewDate and the Review row's dueDate are two sources of truth that drift apart, so an item I practised thirty seconds ago can still be announced on Today as '14 days overdue' with no way to clear it. Route every review-date write through one place, modelled on snoozeReview, which already does it correctly. Fix forward only — do not rewrite items already stuck in that state; they clear the next time I practise them. Keep the file frame to what this genuinely needs, so the contract does not have to be amended mid-build.

## Why

Between them the two artifacts list 19 review findings and 4 feature requests. This is the one the review ranks first and the advisory does not block. Three reasons it goes first.

1. It is the only finding where the app lies to the user about its own core promise. An item practised thirty seconds ago is announced on Today as 'its review is 14 days overdue', its overdue score is pinned at the maximum permanently, and neither 'Not now' nor '+2d' can clear it because the review row they act on no longer exists. That breaks r-practice-completes-reviews and r-explainable-scheduling at once, via the most ordinary action in the app.

2. It is cheap and unblocked. The advisory's 'fix importDB's missing migration chain first' gates the four FEATURE requests, because two of them need a schema bump. This cluster needs no bump, no migration, and matches none of the heavy tier paths, so it is not waiting on anything. Five files, mostly one-line and one-signature changes.

3. It is the structural fix the review's own closing observation names. Every remaining correctness finding has the same shape: a rule stated clearly in prose, enforced in one place and forgotten in the others. 'Never leave a stale overdue item after an action' is enforced in snoozeReview and missing in closeSession. Routing every review-date write through a single tested place is the cheapest durable improvement available, and the model is already in the codebase — it just was not copied.

## Today

The item carries nextReviewDate (which drives priority and the overdue score) and a separate Review row carries dueDate (which drives Today's 'Due reviews' list). Nothing keeps them in step. Five verified consequences:

§1.1 — src/domain/blocks.ts:39 ends applyBlockStats with `nextReviewDate: nextReviewDate ?? item.nextReviewDate`, so there is no way to express 'this item has no next review'. src/store/useStore.ts:876 therefore passes the OLD date whenever input.scheduleReview is false. Answering 'No' to 'Should this come back?' logs the block, completes the open review, and leaves the item's stale past date in place — reproduced in the live app: an item dated 14 days ago was practised successfully and Today immediately rendered 'Next up: its review is 14 days overdue.' overdueScore is then pinned at 5 forever and grows daily. Also reachable by saving with no result picked, or by clearing the date field by hand.

§1.2 — useStore.ts:874 assigns the date as `input.nextReviewDate ?? comp?.dueDate ?? item.nextReviewDate`, but useStore.ts:903 guards row creation on `input.scheduleReview && input.nextReviewDate`. The guard is stricter than the assignment, so the item can be given the SM-2 date while no Review row exists: it reads as due to the priority engine and never appears in Today's list.

§1.3 — useStore.ts:885's `if (comp) { srReps, srEase, srIntervalDays }` is not gated on input.scheduleReview. Confirmed in the §1.1 repro: srReps 0→1 and srEase 2.5→2.6 on a block that scheduled nothing. Ten declines climb srReps to 10, and the next accepted date is computed from that invented history.

§1.4 — src/domain/scheduling.ts:150, interval mode, returns `srIntervalDays: interval`, overwriting the SM-2 base. Measured: an item with base 6 (next Auto interval 15 days) becomes base 30 (next Auto interval 75 days) after one review at 'every 30 days'. Switch back to Auto and its spacing is silently five times looser, reported by 'Why this date?' as an ordinary SM-2 step.

§1.5 — useStore.ts:689's updateItem is a blind spread, so editing an item's review date by hand leaves its open Review row at the old dueDate — the same divergence, from a third direction.

## Instead

One place decides what a review date is, and writes both sides of it. Concretely:

• Declining a review CLEARS the item's next review date. The item drops out of the review system honestly and stops reporting as overdue — overdueDays already returns null for an item with no date, so the scoring side needs no change.
• Accepting one writes a SINGLE computed date to both the item and its new Review row. There is one expression for that date, not two that can disagree — which is how r-explainable-scheduling ('the date shown before saving is exactly the date saved') becomes true by construction rather than by coincidence.
• SM-2 state advances only when a review is genuinely scheduled.
• A fixed cadence no longer overwrites the SM-2 interval base, so switching back to Auto restores the item's real spacing.
• Editing an item's review date moves its open Review row with it.
• The helper's date argument is TRI-STATE, and this is a hard part of the contract: absent/undefined = leave the schedule exactly as it is; null = deliberately clear it; an ISODate = set it. `null` is an action-input sentinel on the helper and on ItemPatch only — PracticeItem.nextReviewDate stays `ISODate | undefined` on disk, so nothing about the persisted shape changes and src/domain/types.ts is not touched.
• The decision lives in a pure, tested function in src/domain/scheduling.ts taking an explicit `now`; closeSession, updateItem and snoozeReview become thin call sites that route through it. snoozeReview is the existing correct model — its behaviour must not change, it should simply stop being the only place that gets this right.

No user-visible new control, no new field, no extra question at close. The close screen is untouched.

## Advisory — the planning agent's reading, not established fact

The two lists below are the planning agent's interpretation. Deterministic code
checked that this plan is complete, in scope, correctly bound, and correctly
tiered; it did not and cannot check whether this reading of the app is right.
Verify them against the code.

**Assumptions**

- ItemPatch is declared in src/store/useStore.ts:148, not in src/domain/types.ts, so §1.5 needs no change to the types file.
- applyBlockStats has exactly one non-test call site (closeSession), so widening its nextReviewDate option to ISODate | null is safe.
- overdueDays (src/domain/scoring.ts:33) already returns null when an item has no nextReviewDate, so clearing the date needs no scoring change.
- src/domain/index.ts already does `export * from './scheduling'`, so a new exported helper there needs no barrel edit.
- factories.ts does not import scheduling.ts, so scheduling.ts may import createReview without a cycle — setarClasses.ts is the existing precedent for a domain module importing a factory.
- vitest runs with environment: 'node' and no IndexedDB shim, so useStore.ts itself is not unit-testable without adding a dependency. That is why the decision logic belongs in the pure domain — which is what r-pure-tested-domain asks for anyway — and why no store test file is in scope.
- CLAUDE.md already states the invariant correctly ('never leave a stale overdue item after an action'). The code diverged from the doc, not the reverse, so no documentation goes stale.
- Neither updateItem call site passes nextReviewDate today: ItemNotes.tsx:20 sends `{ notes }`, and valuesToCreateInput (src/components/itemFormValues.ts:90-113) omits the field entirely. So 'absent means keep' is load-bearing for every real edit in the app, and ItemPatch.nextReviewDate is what widens to `ISODate | null` — not the PracticeItem type.
- Because no call site sets it, §1.5 is currently only reachable programmatically, like §1.2. Its acceptance check pins the helper's contract rather than a path the UI can walk today — worth having precisely because the next feature that edits a review date will route through it.
- reviewMode and reviewIntervalDays ARE editable from ItemDetail, so §1.4's fivefold spacing inflation is a genuinely user-reachable bug, not a theoretical one.

**Possible conflicts**

- The approved flow practise-todays-recommendation is signed with status 'works', and its step 7 claims the next review 'is scheduled on the date that was shown'. That claim is false today whenever the user declines a date — §1.1 is the verified proof. This Delta corrects the flow's truth as well as the code.
- The flow clear-a-due-review is also touched, but only in that snoozeReview becomes the shared path rather than the lone correct one. Its behaviour, and the flow's truth, must come out unchanged.
- Gating SM-2 on scheduleReview (§1.3) means an item practised repeatedly with 'No, don't bring it back' builds no SM-2 history at all. That is the intended and honest outcome, but it does change what a later accepted date is computed from.
- AGENTS.md and CLAUDE.md are byte-identical duplicates (review §4.1). Touching either creates drift, so this change updates neither — de-duplicating them is separate housekeeping.
- §1.4 is a genuinely separate bug from the item/review divergence — it is fixed-cadence mode clobbering the SM-2 base. It is included because it is one line in scheduling.ts, a file this lane already opens, and because leaving it makes the 'why this date' explanation dishonest. It is not scope creep.

## The complete approved plan

```json
{
  "format": "prismatica/start@1",
  "request": "Start the most critical lane coming out of the two attached artifacts (the 27 August code review and the 28 August build advisory): the review-scheduling divergence cluster, findings §1.1–§1.5. The item's nextReviewDate and the Review row's dueDate are two sources of truth that drift apart, so an item I practised thirty seconds ago can still be announced on Today as '14 days overdue' with no way to clear it. Route every review-date write through one place, modelled on snoozeReview, which already does it correctly. Fix forward only — do not rewrite items already stuck in that state; they clear the next time I practise them. Keep the file frame to what this genuinely needs, so the contract does not have to be amended mid-build.",
  "builder": "claude",
  "summary": "Stop a just-practised item from still reporting as overdue",
  "rationale": "Between them the two artifacts list 19 review findings and 4 feature requests. This is the one the review ranks first and the advisory does not block. Three reasons it goes first.\n\n1. It is the only finding where the app lies to the user about its own core promise. An item practised thirty seconds ago is announced on Today as 'its review is 14 days overdue', its overdue score is pinned at the maximum permanently, and neither 'Not now' nor '+2d' can clear it because the review row they act on no longer exists. That breaks r-practice-completes-reviews and r-explainable-scheduling at once, via the most ordinary action in the app.\n\n2. It is cheap and unblocked. The advisory's 'fix importDB's missing migration chain first' gates the four FEATURE requests, because two of them need a schema bump. This cluster needs no bump, no migration, and matches none of the heavy tier paths, so it is not waiting on anything. Five files, mostly one-line and one-signature changes.\n\n3. It is the structural fix the review's own closing observation names. Every remaining correctness finding has the same shape: a rule stated clearly in prose, enforced in one place and forgotten in the others. 'Never leave a stale overdue item after an action' is enforced in snoozeReview and missing in closeSession. Routing every review-date write through a single tested place is the cheapest durable improvement available, and the model is already in the codebase — it just was not copied.",
  "kind": "existing-flow",
  "flowId": "practise-todays-recommendation",
  "currentBehaviour": "The item carries nextReviewDate (which drives priority and the overdue score) and a separate Review row carries dueDate (which drives Today's 'Due reviews' list). Nothing keeps them in step. Five verified consequences:\n\n§1.1 — src/domain/blocks.ts:39 ends applyBlockStats with `nextReviewDate: nextReviewDate ?? item.nextReviewDate`, so there is no way to express 'this item has no next review'. src/store/useStore.ts:876 therefore passes the OLD date whenever input.scheduleReview is false. Answering 'No' to 'Should this come back?' logs the block, completes the open review, and leaves the item's stale past date in place — reproduced in the live app: an item dated 14 days ago was practised successfully and Today immediately rendered 'Next up: its review is 14 days overdue.' overdueScore is then pinned at 5 forever and grows daily. Also reachable by saving with no result picked, or by clearing the date field by hand.\n\n§1.2 — useStore.ts:874 assigns the date as `input.nextReviewDate ?? comp?.dueDate ?? item.nextReviewDate`, but useStore.ts:903 guards row creation on `input.scheduleReview && input.nextReviewDate`. The guard is stricter than the assignment, so the item can be given the SM-2 date while no Review row exists: it reads as due to the priority engine and never appears in Today's list.\n\n§1.3 — useStore.ts:885's `if (comp) { srReps, srEase, srIntervalDays }` is not gated on input.scheduleReview. Confirmed in the §1.1 repro: srReps 0→1 and srEase 2.5→2.6 on a block that scheduled nothing. Ten declines climb srReps to 10, and the next accepted date is computed from that invented history.\n\n§1.4 — src/domain/scheduling.ts:150, interval mode, returns `srIntervalDays: interval`, overwriting the SM-2 base. Measured: an item with base 6 (next Auto interval 15 days) becomes base 30 (next Auto interval 75 days) after one review at 'every 30 days'. Switch back to Auto and its spacing is silently five times looser, reported by 'Why this date?' as an ordinary SM-2 step.\n\n§1.5 — useStore.ts:689's updateItem is a blind spread, so editing an item's review date by hand leaves its open Review row at the old dueDate — the same divergence, from a third direction.",
  "desiredBehaviour": "One place decides what a review date is, and writes both sides of it. Concretely:\n\n• Declining a review CLEARS the item's next review date. The item drops out of the review system honestly and stops reporting as overdue — overdueDays already returns null for an item with no date, so the scoring side needs no change.\n• Accepting one writes a SINGLE computed date to both the item and its new Review row. There is one expression for that date, not two that can disagree — which is how r-explainable-scheduling ('the date shown before saving is exactly the date saved') becomes true by construction rather than by coincidence.\n• SM-2 state advances only when a review is genuinely scheduled.\n• A fixed cadence no longer overwrites the SM-2 interval base, so switching back to Auto restores the item's real spacing.\n• Editing an item's review date moves its open Review row with it.\n• The helper's date argument is TRI-STATE, and this is a hard part of the contract: absent/undefined = leave the schedule exactly as it is; null = deliberately clear it; an ISODate = set it. `null` is an action-input sentinel on the helper and on ItemPatch only — PracticeItem.nextReviewDate stays `ISODate | undefined` on disk, so nothing about the persisted shape changes and src/domain/types.ts is not touched.\n• The decision lives in a pure, tested function in src/domain/scheduling.ts taking an explicit `now`; closeSession, updateItem and snoozeReview become thin call sites that route through it. snoozeReview is the existing correct model — its behaviour must not change, it should simply stop being the only place that gets this right.\n\nNo user-visible new control, no new field, no extra question at close. The close screen is untouched.",
  "mustNotChange": [
    "Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2.",
    "'Not now' still changes no schedule at all — it stays a per-day dismissal in session state.",
    "An item update that does not carry a review date must NEVER clear the review schedule. Neither updateItem call site passes one today, so 'absent means keep' protects 100% of real edits — reading absent as 'clear' would make every title, status, difficulty and notes edit silently wipe the item's schedule.",
    "Snooze (+2d) still moves the real date on BOTH the review and the item, counted from today.",
    "The review date previewed on the close screen is still exactly the date saved.",
    "No SCHEMA_VERSION bump, no migration, and no change to the persisted shape of PracticeItem or Review.",
    "Starting a block stays under 30 seconds, closing one under 60; no new required field.",
    "The Session Plan advance tail in closeSession keeps working, and the plain no-plan flow stays behaviourally identical apart from the review-date fix itself.",
    "DEFAULT_SCHEDULING_PARAMS and the byte-identical-defaults snapshot test stay green — the SM-2 rungs are not being retuned."
  ],
  "assumptions": [
    "ItemPatch is declared in src/store/useStore.ts:148, not in src/domain/types.ts, so §1.5 needs no change to the types file.",
    "applyBlockStats has exactly one non-test call site (closeSession), so widening its nextReviewDate option to ISODate | null is safe.",
    "overdueDays (src/domain/scoring.ts:33) already returns null when an item has no nextReviewDate, so clearing the date needs no scoring change.",
    "src/domain/index.ts already does `export * from './scheduling'`, so a new exported helper there needs no barrel edit.",
    "factories.ts does not import scheduling.ts, so scheduling.ts may import createReview without a cycle — setarClasses.ts is the existing precedent for a domain module importing a factory.",
    "vitest runs with environment: 'node' and no IndexedDB shim, so useStore.ts itself is not unit-testable without adding a dependency. That is why the decision logic belongs in the pure domain — which is what r-pure-tested-domain asks for anyway — and why no store test file is in scope.",
    "CLAUDE.md already states the invariant correctly ('never leave a stale overdue item after an action'). The code diverged from the doc, not the reverse, so no documentation goes stale.",
    "Neither updateItem call site passes nextReviewDate today: ItemNotes.tsx:20 sends `{ notes }`, and valuesToCreateInput (src/components/itemFormValues.ts:90-113) omits the field entirely. So 'absent means keep' is load-bearing for every real edit in the app, and ItemPatch.nextReviewDate is what widens to `ISODate | null` — not the PracticeItem type.",
    "Because no call site sets it, §1.5 is currently only reachable programmatically, like §1.2. Its acceptance check pins the helper's contract rather than a path the UI can walk today — worth having precisely because the next feature that edits a review date will route through it.",
    "reviewMode and reviewIntervalDays ARE editable from ItemDetail, so §1.4's fivefold spacing inflation is a genuinely user-reachable bug, not a theoretical one."
  ],
  "possibleConflicts": [
    "The approved flow practise-todays-recommendation is signed with status 'works', and its step 7 claims the next review 'is scheduled on the date that was shown'. That claim is false today whenever the user declines a date — §1.1 is the verified proof. This Delta corrects the flow's truth as well as the code.",
    "The flow clear-a-due-review is also touched, but only in that snoozeReview becomes the shared path rather than the lone correct one. Its behaviour, and the flow's truth, must come out unchanged.",
    "Gating SM-2 on scheduleReview (§1.3) means an item practised repeatedly with 'No, don't bring it back' builds no SM-2 history at all. That is the intended and honest outcome, but it does change what a later accepted date is computed from.",
    "AGENTS.md and CLAUDE.md are byte-identical duplicates (review §4.1). Touching either creates drift, so this change updates neither — de-duplicating them is separate housekeeping.",
    "§1.4 is a genuinely separate bug from the item/review divergence — it is fixed-cadence mode clobbering the SM-2 base. It is included because it is one line in scheduling.ts, a file this lane already opens, and because leaving it makes the 'why this date' explanation dishonest. It is not scope creep."
  ],
  "scope": {
    "allow": [
      "src/domain/scheduling.ts",
      "src/domain/scheduling.test.ts",
      "src/domain/blocks.ts",
      "src/domain/blocks.test.ts",
      "src/store/useStore.ts"
    ],
    "forbid": []
  },
  "exclusions": [
    "Review §2.3 — importDB skipping the migration chain. A separate lane. This change needs no schema bump, so it is NOT gated by it; the advisory's 'fix that first' applies to the feature requests that do need bumps.",
    "Review §3.2 — wiring persianSearchMatch into the two search boxes. Highest value-per-line in the report and the natural next lane, but different files and a different flow.",
    "Review §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock, §3.4 frozen `now`, §3.5 seeded fake history.",
    "Any repair of items ALREADY stuck in the false-overdue state. The owner explicitly chose fix-forward-only: they clear the next time that item is practised. No pass over existing data.",
    "src/pages/CloseBlock.tsx — its `scheduleReview: comeBack && !!reviewDate` is already correct semantics; every fix in this lane lands behind it. Do not change the close screen.",
    "Adding fake-indexeddb, jsdom, or any store test harness. If the store wiring feels untestable, that is the signal to move more of the decision into the pure domain function, not to add a dependency.",
    "Retuning any SM-2 constant, interval or ease value. This lane fixes where dates are written, not what they are.",
    "Nothing is hard-forbidden on purpose: the frame is the five files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around. The exclusions above are intent, not a wall."
  ],
  "acceptance": [
    {
      "description": "§1.1 root cause — applyBlockStats can express 'no next review': null clears the date, undefined keeps the existing one. The two halves of the same test discriminate the states.",
      "test": "clears nextReviewDate when passed null and keeps it when passed undefined"
    },
    {
      "description": "§1.1 — closing a block without scheduling a review leaves the item with NO next review date, so a just-practised item can no longer report as overdue.",
      "test": "clears the item's next review date when no review is scheduled"
    },
    {
      "description": "The discriminating opposite of the check above: closing a block WITH a review date still sets that exact date on the item.",
      "test": "keeps the item's next review date when a review is scheduled"
    },
    {
      "description": "§1.2 — the item's date and its new Review row's dueDate are the same single value, including when no explicit date is supplied and the SM-2 suggestion is used. The item can never be given a date without a matching row.",
      "test": "writes one date to both the item and its new review row"
    },
    {
      "description": "§1.3 — declining a review leaves srReps, srEase and srIntervalDays untouched, so a later accepted date is computed from real history rather than from declines.",
      "test": "leaves SM-2 state untouched when no review is scheduled"
    },
    {
      "description": "§1.4 — a fixed cadence no longer overwrites the SM-2 interval base, so switching an item back to Auto restores its real spacing instead of loosening it fivefold.",
      "test": "fixed cadence does not overwrite the SM-2 interval base"
    },
    {
      "description": "§1.5 — moving an item's review date by hand moves its open Review row with it, so the two sides cannot be edited apart.",
      "test": "moves the open review row when the item's review date changes"
    },
    {
      "description": "The regression this lane could itself introduce: updating unrelated item fields (title, notes, difficulty) leaves BOTH PracticeItem.nextReviewDate and the open Review's dueDate unchanged. This is the discriminating partner to the check above — together they prove absent = keep, ISODate = set.",
      "test": "leaves the review schedule untouched when an item update does not include a review date"
    },
    {
      "description": "Snooze is the one path that is already correct and this lane deliberately refactors it, so its coupled write must be pinned by a test rather than by the prose in mustNotChange: snoozing moves Review.dueDate and PracticeItem.nextReviewDate to the same date and leaves srReps, srEase and srIntervalDays untouched.",
      "test": "snooze moves the same date on the item and the review without changing SM-2 state"
    },
    {
      "description": "End to end in the running app: take the item Today currently announces as overdue, practise it, pick a result, answer No to 'Should this come back?', save. Today shows it with no overdue claim and no invented future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews when it arrives.",
      "test": "manual:OWNER"
    }
  ],
  "risk": {
    "touchesAuth": false,
    "touchesPayments": false,
    "touchesSavedData": true,
    "copyOnly": false,
    "rationale": "This app has no auth and no payments — it is local-first with no backend of its own. It does touch saved data: it changes what closeSession, updateItem and snoozeReview write into IndexedDB for PracticeItem.nextReviewDate, PracticeItem.srReps/srEase/srIntervalDays, and the Review rows. Nothing existing is rewritten or migrated — the owner explicitly chose fix-forward-only — and no persisted shape changes, so there is no schema bump and none of the heavy tier paths are matched. The realistic failure mode is a wrong or missing review date: visible immediately on Today, and recoverable by practising the item again and accepting a date. The acceptance checks discriminate the scheduled and not-scheduled cases against each other rather than only proving the happy path, because that boundary is exactly where the bug lives."
  },
  "delta": {
    "step": 7,
    "today": "Step 7 says the item 'knows when it should come back'. It does not. Answer No to 'Should this come back?' — or save with the date field cleared — and the block is logged, the counters advance, the SM-2 state advances anyway, the open review is marked complete, but the item KEEPS its old review date. Verified in the live app: an item whose date was 14 days in the past was practised successfully, and Today immediately said 'Next up: its review is 14 days overdue.' The overdue score is now pinned at its maximum permanently and grows every day, and neither 'Not now' nor '+2d' can clear it, because the review row those buttons act on has just been completed. The only escape is practising the item again and accepting a date.",
    "instead": "Declining a review clears the item's next review date. The item drops out of the review system honestly — no overdue claim, no invented future date — and Today stops mentioning a review for it at all. Accepting one writes a single computed date to both the item and its new review row, so the date shown at close is the date saved, by construction. SM-2 advances only when a review is genuinely scheduled. And every path that moves a review date — closing a block, snoozing, editing the item — goes through one tested place, so the item and its review row can no longer disagree.",
    "keep": [
      "Practising stays the only thing that completes a review and advances spaced repetition.",
      "'Not now' still changes no schedule; '+2d' still moves the real date on both sides.",
      "The review date previewed before saving is still exactly the date saved.",
      "Closing a block stays under 60 seconds — no new field and no extra question on the close screen."
    ],
    "assumptions": [
      "An item with no next review date is an honest state, not an error: it simply is not in the spaced-repetition system until the user next accepts a date.",
      "Items already stuck in the false-overdue state are left alone and clear themselves on their next practice — the owner's explicit choice."
    ],
    "showMe": "Practise an item, pick a result, answer No to 'Should this come back?', and save. Today shows the item with no overdue claim at all — not 'overdue', not a fabricated future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews on the day it arrives."
  },
  "desiredRules": [
    "An item's next review date and its Review row are always written together, through one place — no code path may move one without the other, and 'no next review' is a state the system can express."
  ],
  "docsDelta": []
}
```
````

## The approved Delta this change must deliver

# Declining a review clears the item's next review date. The item drops out of the review system honestly — no overdue claim, no invented future date — and Today stops mentioning a review for it at all. Accepting one writes a single computed date to both the item and its new review row, so the date shown at close is the date saved, by construction. SM-2 advances only when a review is genuinely scheduled. And every path that moves a review date — closing a block, snoozing, editing the item — goes through one tested place, so the item and its review row can no longer disagree.

_approved · about "practise-todays-recommendation" step 7_

## Today

Step 7 says the item 'knows when it should come back'. It does not. Answer No to 'Should this come back?' — or save with the date field cleared — and the block is logged, the counters advance, the SM-2 state advances anyway, the open review is marked complete, but the item KEEPS its old review date. Verified in the live app: an item whose date was 14 days in the past was practised successfully, and Today immediately said 'Next up: its review is 14 days overdue.' The overdue score is now pinned at its maximum permanently and grows every day, and neither 'Not now' nor '+2d' can clear it, because the review row those buttons act on has just been completed. The only escape is practising the item again and accepting a date.

## Instead

Declining a review clears the item's next review date. The item drops out of the review system honestly — no overdue claim, no invented future date — and Today stops mentioning a review for it at all. Accepting one writes a single computed date to both the item and its new review row, so the date shown at close is the date saved, by construction. SM-2 advances only when a review is genuinely scheduled. And every path that moves a review date — closing a block, snoozing, editing the item — goes through one tested place, so the item and its review row can no longer disagree.

## Keep

- Practising stays the only thing that completes a review and advances spaced repetition.
- 'Not now' still changes no schedule; '+2d' still moves the real date on both sides.
- The review date previewed before saving is still exactly the date saved.
- Closing a block stays under 60 seconds — no new field and no extra question on the close screen.

## New assumptions

- An item with no next review date is an honest state, not an error: it simply is not in the spaced-repetition system until the user next accepts a date.
- Items already stuck in the false-overdue state are left alone and clear themselves on their next practice — the owner's explicit choice.

## Show me

Practise an item, pick a result, answer No to 'Should this come back?', and save. Today shows the item with no overdue claim at all — not 'overdue', not a fabricated future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews on the day it arrives.


## Flows near this scope (understand before you change them)

# See and adjust the scheduling engine

_Works now · approved 2026-08-28T13:30:17.733Z by Ethan (signed)_

## Goal

Understand exactly why an item was recommended and a date chosen — and change the numbers if they do not suit you.

## Starts when

The musician follows 'Why this date?' from the close screen, or opens Settings → 'How scheduling works'.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** States the real priority formula and the spaced-repetition rungs in plain English, filled in with the values currently in force.
   - Shows: The priority terms, the current first/second/slip-reset gaps, and how importance and difficulty pull material sooner.

2. **The musician** Changes a value — a review gap, the warm-up or deep-work share of a plan, the shortest or longest review slot.
   - Shows: The explanation updates to the new numbers.
   - Changes: The settings are stored with the practice data, clamped to safe bounds; out-of-range input is never trusted.

3. **The musician** Closes a block or builds a plan afterwards.
   - Shows: Review dates and plan shapes computed with the adjusted values.
   - Changes: The same settings are used for the date previewed and the date saved.

4. **The musician** Taps 'Reset to recommended' whenever they want the original behaviour back.
   - Shows: 'Using the recommended defaults.'
   - Changes: The settings field is dropped, so the historical constants apply exactly.

## Ends with

The engine is understood and, if wanted, tuned — and it still produces the same date it showed.

## Variations

- **Never customised** — With no settings stored the defaults reproduce the original constants exactly, so old backups import unchanged. _(Works now)_
- **Per-item override** — An individual item can be set to a fixed cadence or to manual dates instead of automatic spaced repetition. _(Works now)_

## Rules

- Scheduling is deterministic and explainable — visible and adjustable, never magic.
- Bounds are enforced on every stored value.

## Involves

- The musician
- The spaced-repetition scheduler
- The plan builder

---

# Back up and restore everything

_Works now · approved 2026-08-28T13:30:17.770Z by Ethan (signed)_

## Goal

Keep an independent copy of all practice data and files, and put it back on any device.

## Starts when

In Settings → Data & backup the musician taps 'Export backup'.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps 'Export backup'.
   - Shows: A single downloaded file named for this device and today's date, and 'Backup exported (data + files)'.
   - Changes: One JSON file holding the whole database plus every attachment, stamped with the device name and the latest change; the export time is remembered locally.

2. **The musician** Saves it wherever they keep backups — NAS, iCloud, anywhere.
   - Shows: Settings shows the last export from this device and the latest change made here.

3. **The musician** Taps 'Import backup' on any device and picks a file.
   - Shows: A confirmation naming the device the backup came from — and an explicit warning if the backup is older than what is on this device.

4. **Practice Compass** Decodes every attachment before touching anything.
   - Shows: A corrupt file aborts the whole import with a clear message and nothing changed.
   - Changes: Only once everything decodes do the files get replaced in one transaction, and only then the data — attachment records can never end up pointing at missing files.

5. **Practice Compass** Leaves existing files alone when the file has no attachments section at all.
   - Changes: A state-only export is never mistaken for 'zero attachments' and never wipes the device's files.

## Ends with

There is an independent full copy of everything, and restoring it is a single, clearly-confirmed step.

## Variations

- **Older backup** — Importing a backup older than the local data requires confirming a spelled-out warning that shows both dates. _(Works now)_
- **Legacy backups** — Older exports import unchanged; legacy attachment records are normalised to the current shape on the way in. _(Works now)_
- **Start over** — 'Reset demo data' and 'Clear all data' both replace everything and both ask first. _(Works now)_

## Rules

- The NAS backup is the user's own independent copy — sync history is never treated as the only backup.
- Nothing is replaced without an explicit confirmation.
- Large videos never enter a backup.

## Involves

- The musician
- The NAS or other storage

---

# Add a practice item

_Works now · approved 2026-08-28T13:30:17.831Z by Ethan (signed)_

## Goal

Get a new piece, gusheh, étude, passage or technique into the app without breaking your concentration.

## Starts when

The musician wants to record something to work on — from Today, a stage, a lesson, the practice list, or the Start screen.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Types a title into the quick-add box and presses Add.
   - Shows: 'Added ✓' with an 'add details' link.
   - Changes: A practice item exists, with the instrument taken from context (stage's pathway, lesson, or the current session instrument) and sensible defaults for everything else. From a lesson it is linked to that lesson at the same time.

2. **The musician** Or chooses 'Add practice item' for the full one-step form.
   - Shows: A kind-first form: what you are adding (gusheh / composed piece / piece / étude / passage / technique), then only that kind's identity fields, then 'Connect it (optional)', then the first practice setup.

3. **The musician** Fills in identity, and optionally connects a study source (creatable inline), a pathway stage, a lesson and a parent work — all at creation.
   - Shows: Persian instruments are asked for dastgāh, gusheh, form and composer, with dastgāh and form offered as datalist suggestions; free text always wins.

4. **The musician** Saves.
   - Shows: The item's own page, with a 'Connected to' summary near the top.
   - Changes: One item, linked to whatever it belongs to — links never duplicate the item.

## Ends with

The thing to practise exists and can be started immediately; details can be filled in later, or never.

## Variations

- **Create while starting** — The Start screen's quick create takes a title only, then begins the block right away; a link opens the full form and returns with the item preselected. _(Works now)_
- **Edit later** — The same kind-first form is the item's inline edit, so nothing needs a second creation path. _(Works now)_

## Rules

- Exactly two creation paths, both one-step: title-only quick add, and the full kind-first form.
- No required field beyond a title.
- Free text is direction-aware so Farsi and English can be mixed anywhere.

## Involves

- The musician

---

# Deal with a due review

_Works now · approved 2026-08-28T13:30:17.861Z by Ethan (signed)_

## Goal

Handle material that is due to come back, without ever faking that it was practised.

## Starts when

Today lists 'Due reviews' for the session instrument — items whose review date has arrived.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Lists each due review with the item's title and how long it has been due, and hides any review dismissed earlier today.
   - Shows: A 'Due reviews' section with three actions per row and one line explaining what each does.

2. **The musician** Taps ▶ to practise it.
   - Shows: The active block, seeded from the item's status and focus.
   - Changes: Nothing yet — the review only completes when the block is closed.

3. **The musician** Or taps 'Not now'.
   - Shows: The row disappears for the rest of the day and returns tomorrow.
   - Changes: Only a per-day dismissal list in the app's session state — no review or item date is touched.

4. **The musician** Or taps '+2d' to genuinely move it.
   - Changes: The review's due date and the item's next review date both move to two days from today, so nothing is left showing overdue.

## Ends with

Either the item was actually practised (and spaced repetition advanced), or the schedule was moved honestly — never both, never neither.

## Variations

- **Snoozed from a stale date** — The new date is counted from today, not from the old overdue date, so a long-ignored review does not stay in the past. _(Works now)_

## Rules

- 'Not now' changes no schedule; snooze moves the real date on both the review and the item.
- No action may fabricate a practice result.

## Involves

- The musician
- The spaced-repetition scheduler

---

# Log a class and its follow-up work

_Works now · approved 2026-08-28T13:30:17.922Z by Ethan (signed)_

## Goal

Record a lesson, write up what was said after rewatching it, and turn it into concrete work before the next one.

## Starts when

The musician taps 'Add a class' on the Lessons screen for one instrument.

## Needs first

- At least one instrument exists

## Steps

1. **The musician** Accepts the pre-filled class number and picks the date.
   - Shows: The class appears as 'Class N · date', newest first, with 'upcoming' while it is still ahead.
   - Changes: A Lesson is stored for that instrument; the number is optional and editable.

2. **The musician** Rewatches the class and types the notes, in Farsi or English.
   - Shows: A direction-aware notes field; the list shows 'notes ✓' once there is text.
   - Changes: Notes are saved when the field loses focus.

3. **The musician** Adds a link to the class recording and to any scores — a NAS path or a full https link.
   - Shows: The links listed video-first, then PDFs and documents, each with its kind icon and 'Stored on NAS'.
   - Changes: Only a reference (title, path, kind, notes) is stored — never the file itself.

4. **The musician** Taps 'Open' on a link.
   - Shows: The file opens in a new tab, resolved against the NAS base URL from Settings.
   - Changes: Nothing is stored or downloaded into the app; removing a link never touches the NAS file.
   - Only if: A NAS base URL is set in Settings and the NAS is reachable from this device

5. **The musician** Links or quick-adds the practice items that came out of the class, and flags the ones to be ready for next time.
   - Shows: Each linked item with its status and a 'For next class' toggle.
   - Changes: The lesson keeps a link to the item (never ownership — unlinking keeps the item); a flagged item gains a priority boost that climbs as that instrument's next class approaches.

6. **The musician** Optionally attaches small hand-outs (a PDF, a photo, a short audio).
   - Shows: Files over 10 MB and any video are warned about; over 40 MB is refused with a clear message.
   - Changes: Small blobs are stored on the device and travel with backups and sync.

## Ends with

The class is on record, its material is real practice items, and the work due before the next class is prioritised automatically.

## Variations

- **No NAS base URL yet** — The link shows 'Set your NAS base URL in Settings to open this' and the Open button stays disabled — never a broken link. _(Works now)_
- **Invalid base URL** — An unparseable base is reported as such and nothing is opened, rather than resolving to a wrong in-app address. _(Works now)_
- **Import the Setar class history** — Settings → 'Import Setar classes' adds the logged sessions as lessons with their recording and score links, additively and idempotently, backfilling refs missing from classes already imported. _(Works now)_
- **Wide screen** — At 1000px and above the class list sits beside the open class, giving long Farsi notes real room. _(Works now)_

## Rules

- Class videos and scores are references to the user's NAS, never bytes in the app, sync or backups.
- A lesson link to an item is a link, never ownership.
- The next class is the one sanctioned deadline — per instrument, never guilt-toned.

## Involves

- The musician
- The teacher (indirectly)
- The NAS

---

# Practise what the app suggests

_Works now · approved 2026-08-28T13:30:17.983Z by Ethan (signed)_

## Goal

Practise the one thing the app suggests next and leave an honest record of how it went.

## Starts when

The musician opens Today, picks the instrument they are practising, and sees a single 'Practise now' card.

## Needs first

_nothing extra required_

## Steps

1. **The musician** Taps their instrument in the switcher at the top of Today.
   - Shows: Everything below is scoped to that instrument: recommendation, class work, due reviews, pathway position.
   - Changes: The chosen instrument is remembered as the session instrument.

2. **Practice Compass** Scores every item of that instrument and shows the best one with a one-sentence reason.
   - Shows: One 'Practise now' card above the fold, plus up to two quieter 'then, if you have time' suggestions.

3. **The musician** Taps 'Start · 10 min'.
   - Shows: The active block screen: item title, mode and focus chips, a running ring timer.
   - Changes: A practice block is opened in memory with mode, focus and a 10-minute target derived from the item.

4. **The musician** Practises, optionally opening 'About this piece' or jotting a passing note; pauses and resumes as needed.
   - Shows: The elapsed clock, and the item's notes and current problem on request.
   - Changes: Elapsed seconds accumulate only while the timer runs.

5. **The musician** Taps 'Finish'.
   - Shows: The close screen, with the minutes already filled in.
   - Changes: The clock is frozen first, so reflection time is not counted as practice.

6. **The musician** Picks one of the six results, optionally adds an observation, a next action, a body note or a teacher question, and accepts or declines the suggested status and review date.
   - Shows: A preview of the next review date with the plain reason behind it, and a 'Why this date?' link.

7. **The musician** Taps 'Save block'.
   - Shows: Back to Today (or to the running plan), with the item's stats and status updated.
   - Changes: A PracticeBlock is stored; the item's counters, status, saturation flag and spaced-repetition state advance; any open review for the item is completed and the next one is scheduled on the date that was shown.

## Ends with

The session is recorded honestly: one block, one result, one next action — and the item knows when it should come back.

## Variations

- **Choose something else** — From 'Choose something else to practise…' the Start screen takes instrument → item → mode/focus/duration, with a title-only quick create for something that does not exist yet. _(Works now)_
- **Start from an item or a stage** — 'Start a block' on an item, or ▶ on a pathway stage row, opens the same block with defaults taken from the item's status and focus. _(Works now)_
- **Discard** — 'Discard block' (during) or 'Discard without saving' (at close) throws the block away — nothing is logged and no schedule moves. _(Works now)_

## Rules

- Starting a block must stay under 30 seconds and closing one under 60 seconds; a title is the only required field.
- Practising is the only thing that completes a review and advances spaced repetition.
- The review date shown before saving is exactly the date saved.

## Involves

- The musician
- The recommendation engine
- The spaced-repetition scheduler

---

# Run a time-budgeted session

_Works now · approved 2026-08-28T13:30:18.043Z by Ethan (signed)_

## Goal

Turn the minutes actually available into an ordered session, then practise it block by block.

## Starts when

The musician taps 'Plan this session' on Today and chooses a length (15, 20, 30, 45 or 60 minutes).

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Builds a plan from the same priority numbers the recommendation uses, laid out as warm-up, class work, review, focus and cool-down segments.
   - Shows: The plan preview: each segment with its minutes, bucket, item and a one-sentence reason, and a total that always equals the chosen budget.

2. **The musician** Swaps, removes or regenerates segments until the shape looks right.
   - Shows: The remaining minutes are redistributed immediately so the total still equals the budget.
   - Changes: Only a local copy of the plan — nothing is saved yet.

3. **The musician** Taps 'Start plan'.
   - Shows: The runner: the whole list with the current segment highlighted.
   - Changes: The running plan is held in app state (never in the database, never synced), and the chosen length is remembered for this instrument.

4. **The musician** Taps 'Start' on the current segment.
   - Shows: The ordinary active-block screen, with the segment's minutes as the target.
   - Changes: A real practice block opens for that segment's item.

5. **The musician** Finishes and saves the block as usual.
   - Shows: Back on the plan, that segment reads 'done' and the pointer moves to the next one.
   - Changes: The block, item stats and review schedule update exactly as in an unplanned block.

6. **The musician** Skips anything they do not want, or ends the plan at any time.
   - Shows: 'Session complete' once the last segment is passed.
   - Changes: A skipped segment logs nothing at all; ending the plan discards it and leaves every logged block untouched.

## Ends with

The available time was spent on real, logged practice in a sensible order — and the plan itself leaves no trace in the data.

## Variations

- **Nothing to plan** — With no items for the instrument the plan is empty and says so rather than inventing filler. _(Works now)_
- **Everything already practised today** — A plan is still produced, and the summary says plainly that everything has been practised today. _(Works now)_
- **Resume** — While a plan runs, Today's card becomes 'Resume your plan' with the count of finished segments. _(Works now)_

## Rules

- Segment minutes always sum to the chosen budget.
- A plan is a view over real practice blocks — it is not a countdown and it is never persisted as data.
- No scores, no 'optimal session' claims.

## Involves

- The musician
- The plan builder
- The recommendation engine

---

# Work through a pathway stage

_Works now · approved 2026-08-28T13:30:18.134Z by Ethan (signed)_

## Goal

Follow a route you trust — see where you are, take the next suggestion into your own items, and practise it.

## Starts when

From Repertoire → Pathways (or the 'Now in:' card on Today) the musician opens a pathway and then a stage.

## Needs first

_nothing extra required_

## Steps

1. **Practice Compass** Shows the stage's rows: your own items laid over the stage's reference catalogue, with progress derived from item status.
   - Shows: A progress bar reading 'n/m solid', guided routines if any, and one line of metadata per row — greyed rows are labelled reference suggestions.

2. **The musician** Taps + on a suggestion.
   - Shows: The row becomes a real item, honestly marked 'Not practised yet', with a lingering Undo card.
   - Changes: A practice item is created from the catalogue entry, carrying its stable catalogue key — adding is organisation, not progress.

3. **The musician** Undoes it, or removes it later from the row's − button, if it was added by mistake.
   - Shows: The row reverts to a suggestion.
   - Changes: The item is deleted only while it is provably untouched (catalogue item, still 'not practised', zero blocks); the check is re-run against live data, so anything practised is kept.

4. **The musician** Taps ▶ on a row to practise it.
   - Shows: The ordinary active block.
   - Changes: A suggestion not yet added is added first, then the block opens.

5. **The musician** Optionally pins the stage as the current one, or edits its code, title and intro.
   - Shows: Today's 'Now in:' card points at the pinned stage.
   - Changes: The pathway records the pinned stage; deleting a stage detaches items instead of deleting them.

## Ends with

The next piece of the route is now a real practice item with real practice behind it, and the stage's progress reflects it honestly.

## Variations

- **Teacher jumps around** — A pinned current stage always beats 'first incomplete stage', because teacher-led work does not go in order. _(Works now)_
- **Guided routine** — A stage routine runs as a segmented warm-up countdown that is explicitly not logged as practice. _(Works now)_
- **Off-catalogue items** — Anything quick-added inside the stage appears in the same list and in recommendations. _(Works now)_

## Rules

- The item is the only unit of work — a pathway is a view over items, never a parallel to-do list.
- The catalogue is reference data in code, labelled as an aid, never a fixed syllabus.
- Adding from the catalogue is losslessly reversible until the moment it is practised.

## Involves

- The musician
- The pathway catalogue


## App rules

- **r-direction-aware-text** — Every free-text field is direction-aware so Farsi and English can be mixed anywhere, and built-in Persian data is authored in Farsi behind stable ascii identifiers.
- **r-explainable-scheduling** — Every recommendation and review date comes from deterministic, published formulas that carry a one-sentence reason, and the date shown before saving is exactly the date saved.
- **r-large-files-stay-on-nas** — Class videos and score PDFs are stored as references to the user's NAS and never enter local storage, sync or backups; in-app attachments are warned above 10 MB and refused above 40 MB.
- **r-local-first-offline** — All practice data lives in IndexedDB on the device and every core flow works offline — the app has no backend, account or paid service of its own.
- **r-no-gamification** — Progress is shown only as honest status, results and counts — never streaks, points, badges, XP or a fabricated mastery percentage.
- **r-no-silent-data-loss** — Data is never replaced silently: sync compares content hashes rather than timestamps, both-changed is an explicit choice, and the copy about to be replaced is archived first.
- **r-one-instrument-per-session** — Today is a session workspace scoped to one chosen instrument; the cross-instrument overview is a deliberate secondary choice and no other instrument's work appears inside a session.
- **r-practice-completes-reviews** — Only closing a practice block completes a review and advances spaced repetition; 'Not now' hides a review for the day without changing any schedule, and snooze moves the real date on both the review and the item.
- **r-pure-tested-domain** — Domain logic is free of React and side effects, takes an explicit `now`, and is unit-tested; only the store mutates app data.
- **r-quick-start** — Starting a practice block stays under 30 seconds and closing one under 60; a title is the only required field anywhere, and every other field has a smart default.
- **r-secrets-stay-on-device** — The GitHub token and the NAS base URL live only in this browser's local storage — never in exports, backups or synced data.


## The goal

Stop a just-practised item from still reporting as overdue

## Stay in scope — you may ONLY change

- src/domain/scheduling.ts
- src/domain/scheduling.test.ts
- src/domain/blocks.ts
- src/domain/blocks.test.ts
- src/store/useStore.ts

Never touch:

- Practising (closing a block) remains the ONLY thing that completes a review and advances SM-2.
- 'Not now' still changes no schedule at all — it stays a per-day dismissal in session state.
- An item update that does not carry a review date must NEVER clear the review schedule. Neither updateItem call site passes one today, so 'absent means keep' protects 100% of real edits — reading absent as 'clear' would make every title, status, difficulty and notes edit silently wipe the item's schedule.
- Snooze (+2d) still moves the real date on BOTH the review and the item, counted from today.
- The review date previewed on the close screen is still exactly the date saved.
- No SCHEMA_VERSION bump, no migration, and no change to the persisted shape of PracticeItem or Review.
- Starting a block stays under 30 seconds, closing one under 60; no new required field.
- The Session Plan advance tail in closeSession keeps working, and the plain no-plan flow stays behaviourally identical apart from the review-date fix itself.
- DEFAULT_SCHEDULING_PARAMS and the byte-identical-defaults snapshot test stay green — the SM-2 rungs are not being retuned.
- Review §2.3 — importDB skipping the migration chain. A separate lane. This change needs no schema bump, so it is NOT gated by it; the advisory's 'fix that first' applies to the feature requests that do need bumps.
- Review §3.2 — wiring persianSearchMatch into the two search boxes. Highest value-per-line in the report and the natural next lane, but different files and a different flow.
- Review §3.1 touch targets, §2.1 class-work fallback, §2.2 attachment silent failure, §2.4 RoutineRunner wall clock, §3.4 frozen `now`, §3.5 seeded fake history.
- Any repair of items ALREADY stuck in the false-overdue state. The owner explicitly chose fix-forward-only: they clear the next time that item is practised. No pass over existing data.
- src/pages/CloseBlock.tsx — its `scheduleReview: comeBack && !!reviewDate` is already correct semantics; every fix in this lane lands behind it. Do not change the close screen.
- Adding fake-indexeddb, jsdom, or any store test harness. If the store wiring feels untestable, that is the signal to move more of the decision into the pure domain function, not to add a dependency.
- Retuning any SM-2 constant, interval or ease value. This lane fixes where dates are written, not what they are.
- Nothing is hard-forbidden on purpose: the frame is the five files in `allow`, and anything genuinely needed beyond them should be added by `prismatica amend` rather than worked around. The exclusions above are intent, not a wall.
- Desired rule (not yet truth): An item's next review date and its Review row are always written together, through one place — no code path may move one without the other, and 'no next review' is a state the system can express.

## Definition of done

- **ac-1** — §1.1 root cause — applyBlockStats can express 'no next review': null clears the date, undefined keeps the existing one. The two halves of the same test discriminate the states. → proven by `clears nextReviewDate when passed null and keeps it when passed undefined`
- **ac-2** — §1.1 — closing a block without scheduling a review leaves the item with NO next review date, so a just-practised item can no longer report as overdue. → proven by `clears the item's next review date when no review is scheduled`
- **ac-3** — The discriminating opposite of the check above: closing a block WITH a review date still sets that exact date on the item. → proven by `keeps the item's next review date when a review is scheduled`
- **ac-4** — §1.2 — the item's date and its new Review row's dueDate are the same single value, including when no explicit date is supplied and the SM-2 suggestion is used. The item can never be given a date without a matching row. → proven by `writes one date to both the item and its new review row`
- **ac-5** — §1.3 — declining a review leaves srReps, srEase and srIntervalDays untouched, so a later accepted date is computed from real history rather than from declines. → proven by `leaves SM-2 state untouched when no review is scheduled`
- **ac-6** — §1.4 — a fixed cadence no longer overwrites the SM-2 interval base, so switching an item back to Auto restores its real spacing instead of loosening it fivefold. → proven by `fixed cadence does not overwrite the SM-2 interval base`
- **ac-7** — §1.5 — moving an item's review date by hand moves its open Review row with it, so the two sides cannot be edited apart. → proven by `moves the open review row when the item's review date changes`
- **ac-8** — The regression this lane could itself introduce: updating unrelated item fields (title, notes, difficulty) leaves BOTH PracticeItem.nextReviewDate and the open Review's dueDate unchanged. This is the discriminating partner to the check above — together they prove absent = keep, ISODate = set. → proven by `leaves the review schedule untouched when an item update does not include a review date`
- **ac-9** — Snooze is the one path that is already correct and this lane deliberately refactors it, so its coupled write must be pinned by a test rather than by the prose in mustNotChange: snoozing moves Review.dueDate and PracticeItem.nextReviewDate to the same date and leaves srReps, srEase and srIntervalDays untouched. → proven by `snooze moves the same date on the item and the review without changing SM-2 state`
- **ac-10** — End to end in the running app: take the item Today currently announces as overdue, practise it, pick a result, answer No to 'Should this come back?', save. Today shows it with no overdue claim and no invented future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews when it arrives. → proven by `manual:OWNER`

## Docs to update as part of this change

_none_

## Recommended skills (quality only — never gates)

- **build** — implementing the change against the contract — _(use your agent’s equivalent)_
- **simplify** — reducing risk by simplifying the change — _(use your agent’s equivalent)_

## Current progress

Not started — no checks have run yet. Default state is "not ready".

## Before you finish

Run `prismatica flow report --auto`. It records the flows your diff provably
touched, and then prints the exact command for every flow it will not decide
for you — a merely possible hit, or a flow nothing maps to files. Answer those
yourself: `--auto` never claims a test passed and never claims behaviour is
unchanged, because no file list can establish either.

File it BEFORE `check` and commit it WITH your work — a report sitting
uncommitted proves nothing, and `check` refuses an uncommitted proof input.

## How your work will be judged

Deterministic checks run on every push and at the merge gate: the diff must stay
inside the allowed files, every acceptance check must trace to a passing test,
docs must be updated, a sealed review must match your exact diff, and the owner must sign a decision over your diff. Nothing merges until they all pass. Default is "not ready".

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.

