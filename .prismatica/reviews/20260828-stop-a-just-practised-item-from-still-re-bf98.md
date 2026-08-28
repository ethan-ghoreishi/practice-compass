---
id: 20260828-stop-a-just-practised-item-from-still-re-bf98
contractId: 20260828-stop-a-just-practised-item-from-still-re-bf98
patchId: 15e1edde1886d71fd1b664ad8c70a1833b96f9e5
reviewer: codex
state: sealed
verdict: approve
createdAt: 2026-08-28T15:41:08.692Z
sealedAt: 2026-08-28T15:45:16.573Z
---

# Review: Stop a just-practised item from still reporting as overdue

> A fresh-eyes review, bound to one exact diff. If the code changes after this,
> the seal breaks and the review must be redone — the maths checks, not the chat.
> A Fresh Reviewer is a NEW session that did not build this diff.
> The same provider is fine — what must not be reused is the session that wrote
> the code, because it already believes the diff is right.

- **Contract:** 20260828-stop-a-just-practised-item-from-still-re-bf98
- **Issue:** https://github.com/ethan-ghoreishi/practice-compass/issues/1
- **Risk tier:** heavy — auth, payments, saved data, schema/migrations — full checks, sealed review, a signed owner decision, and a tested rollback route
- **Diff patch-id:** `15e1edde1886d71fd1b664ad8c70a1833b96f9e5`

## The plan the owner approved

Verbatim. `assumptions` and `possibleConflicts` are the Planner's advisory
reading — check them against the diff rather than accepting them.

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

## The Delta this change was framed from

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



## Files in this diff

- src/domain/blocks.test.ts
- src/domain/blocks.ts
- src/domain/scheduling.test.ts
- src/domain/scheduling.ts
- src/store/useStore.ts

## Check against the contract

- [ ] **ac-1** — §1.1 root cause — applyBlockStats can express 'no next review': null clears the date, undefined keeps the existing one. The two halves of the same test discriminate the states. _(proof: clears nextReviewDate when passed null and keeps it when passed undefined)_
- [ ] **ac-2** — §1.1 — closing a block without scheduling a review leaves the item with NO next review date, so a just-practised item can no longer report as overdue. _(proof: clears the item's next review date when no review is scheduled)_
- [ ] **ac-3** — The discriminating opposite of the check above: closing a block WITH a review date still sets that exact date on the item. _(proof: keeps the item's next review date when a review is scheduled)_
- [ ] **ac-4** — §1.2 — the item's date and its new Review row's dueDate are the same single value, including when no explicit date is supplied and the SM-2 suggestion is used. The item can never be given a date without a matching row. _(proof: writes one date to both the item and its new review row)_
- [ ] **ac-5** — §1.3 — declining a review leaves srReps, srEase and srIntervalDays untouched, so a later accepted date is computed from real history rather than from declines. _(proof: leaves SM-2 state untouched when no review is scheduled)_
- [ ] **ac-6** — §1.4 — a fixed cadence no longer overwrites the SM-2 interval base, so switching an item back to Auto restores its real spacing instead of loosening it fivefold. _(proof: fixed cadence does not overwrite the SM-2 interval base)_
- [ ] **ac-7** — §1.5 — moving an item's review date by hand moves its open Review row with it, so the two sides cannot be edited apart. _(proof: moves the open review row when the item's review date changes)_
- [ ] **ac-8** — The regression this lane could itself introduce: updating unrelated item fields (title, notes, difficulty) leaves BOTH PracticeItem.nextReviewDate and the open Review's dueDate unchanged. This is the discriminating partner to the check above — together they prove absent = keep, ISODate = set. _(proof: leaves the review schedule untouched when an item update does not include a review date)_
- [ ] **ac-9** — Snooze is the one path that is already correct and this lane deliberately refactors it, so its coupled write must be pinned by a test rather than by the prose in mustNotChange: snoozing moves Review.dueDate and PracticeItem.nextReviewDate to the same date and leaves srReps, srEase and srIntervalDays untouched. _(proof: snooze moves the same date on the item and the review without changing SM-2 state)_
- [ ] **ac-10** — End to end in the running app: take the item Today currently announces as overdue, practise it, pick a result, answer No to 'Should this come back?', save. Today shows it with no overdue claim and no invented future date. Then practise it again and accept the suggested date: Today shows that exact date, and the row appears under Due reviews when it arrives. _(proof: manual:OWNER)_

## Flow impact — detected vs reported

**Detected from the diff:**

- **adjust-how-scheduling-works** — touched via src/domain/scheduling.ts, src/store/useStore.ts
- **back-up-and-restore** — touched via src/store/useStore.ts
- **capture-a-practice-item** — touched via src/store/useStore.ts
- **clear-a-due-review** — touched via src/store/useStore.ts, src/domain/scheduling.ts
- **log-a-class** — touched via src/store/useStore.ts
- **practise-todays-recommendation** — touched via src/store/useStore.ts, src/domain/scheduling.ts, src/domain/blocks.ts
- **run-a-session-plan** — touched via src/store/useStore.ts
- **work-a-pathway-stage** — touched via src/store/useStore.ts

**Possibly affected (shares a mechanic with a detected flow):**

- **browse-my-repertoire** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **install-the-app-and-keep-it-current** — shares route "/settings" with "adjust-how-scheduling-works"
- **point-this-device-at-the-nas** — shares route "/settings" with "adjust-how-scheduling-works"
- **prepare-for-the-next-class** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **see-practice-patterns** — shares entity "PracticeItem" with "adjust-how-scheduling-works"
- **sync-devices-via-github** — shares route "/settings" with "adjust-how-scheduling-works"

**What the agent reported:**

## adjust-how-scheduling-works — mechanics-updated

Mapped implementation touched: touchpoint(s) src/domain/scheduling.ts, src/store/useStore.ts matched changed file(s) src/domain/scheduling.ts, src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## back-up-and-restore — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## capture-a-practice-item — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## log-a-class — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## run-a-session-plan — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## work-a-pathway-stage — mechanics-updated

Mapped implementation touched: touchpoint(s) src/store/useStore.ts matched changed file(s) src/store/useStore.ts. Derived from the diff alone — this says nothing about whether any test ran or whether behaviour changed.

## practise-todays-recommendation — truth-proposed

Step 7 claims the next review 'is scheduled on the date that was shown'. Before this change that was false whenever the user declined a review (§1.1: the item kept its old, now-overdue date) or accepted the SM-2 suggestion without an explicit override (§1.2: the item's date and the new Review row's date could diverge). computeReviewOutcome (scheduling.ts) now computes ONE date used for both the item and the new Review row, and closeSession/applyBlockStats route the item's write through it verbatim — so step 7's claim holds by construction. Pinned by scheduling.test.ts: 'clears the item's next review date when no review is scheduled', 'keeps the item's next review date when a review is scheduled', 'writes one date to both the item and its new review row'. Verified live in the browser (Afshari darāmad opening, previously 63 days overdue): declining showed no overdue claim and the item dropped out of Due reviews; accepting showed the exact previewed date and an IndexedDB dump confirmed item.nextReviewDate === the new open Review row's dueDate.

Steps: 7

## browse-my-repertoire — unchanged

Shares the PracticeItem entity only because closeSession/updateItem now write nextReviewDate/srReps/srEase/srIntervalDays more precisely; Repertoire's views (Pathways/My repertoire/Practice list) group and list items by identity, status and kind, none of which this lane touches. No file this flow maps to (repertoire.ts, Repertoire.tsx) changed.

## install-the-app-and-keep-it-current — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; PWA install/update mechanics (service worker, version banner) are untouched — no file this flow maps to changed.

## point-this-device-at-the-nas — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; the NAS base URL setting and recording-link resolution are untouched — no file this flow maps to changed.

## prepare-for-the-next-class — unchanged

Shares the PracticeItem entity because closeSession still writes assignedForLesson/teacherQuestion, but that pass-through code (input.teacherQuestion !== undefined) is untouched by this diff — only the review-date decision changed. No file this flow maps to (questions.ts, ClassQuestions) changed.

## see-practice-patterns — unchanged

Shares the PracticeItem entity because Insights reads item stats, but scoring.ts, insights.ts and report.ts are untouched — this lane only changes how nextReviewDate/SM-2 state are written, not how they're read for insights. No file this flow maps to changed.

## sync-devices-via-github — unchanged

Shares the /settings route only because 'How scheduling works' also lives there; the sync engine hash-compares whatever PracticeItem/Review state exists and is agnostic to which code wrote it — canonical.ts, syncEngine.ts and gitRemote.ts are untouched.

## clear-a-due-review — unchanged

snoozeReview resolves the tri-state date once via resolveReviewDate (the shared primitive), but the row write itself is scoped to the SELECTED review by id via applyReviewDateToRow — not the item-scoped applyReviewDateToRows used by closeSession/updateItem. A fresh-eyes review (sealed, request_changes) caught that routing snooze through the item-scoped coupling silently moved every open review row for the item, not just the one snoozed; applyReviewDateToRow was added as the row-scoped sibling to fix that while keeping the tri-state resolution shared. Observable behaviour is unchanged from before this lane: '+2d' still moves only the selected review's dueDate and the item's nextReviewDate to the same date, counted from today, with SM-2 state (srReps/srEase/srIntervalDays) untouched. 'Not now' is untouched entirely — notNowReview was not modified. Pinned by scheduling.test.ts 'snooze moves the same date on the item and the review without changing SM-2 state' (now exercises applyReviewDateToRow) and the new discriminating regression 'moves only the selected row, leaving a second open review for the SAME item untouched', which builds two open rows on one item and asserts only the targeted row moves.

## Read these claims with this in mind

- **clear-a-due-review** — reported unaffected, but its own mapped tests changed here: src/domain/scheduling.test.ts

A test can change for refactoring or coverage without any behaviour change, and
behaviour can change without a test moving — so this decides nothing. It is here
because a reviewer weighing "unaffected" should be weighing it against this.


**Gaps between detected and reported:**

_None — the report matches what was detected._

## Flow truth this change touches

### adjust-how-scheduling-works — Works now

Touchpoints: src/pages/Settings.tsx, src/pages/CloseBlock.tsx, src/domain/scheduling.ts, src/domain/plan.ts, src/domain/types.ts, src/store/useStore.ts

Evidence: 4 steps: 4 code inferred

### back-up-and-restore — Works now

Touchpoints: src/store/backup.ts, src/store/idb.ts, src/domain/io.ts, src/pages/Settings.tsx, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

### capture-a-practice-item — Works now

Touchpoints: src/components/QuickAdd.tsx, src/components/ItemForm.tsx, src/components/itemKinds.ts, src/pages/NewItem.tsx, src/pages/ItemDetail.tsx, src/store/useStore.ts, src/domain/factories.ts

Evidence: 4 steps: 4 code inferred

### clear-a-due-review — Works now

Touchpoints: src/pages/Today.tsx, src/store/useStore.ts, src/domain/scheduling.ts, src/domain/selectors.ts

Evidence: 4 steps: 4 code inferred

### log-a-class — Works now

Touchpoints: src/pages/Lessons.tsx, src/components/Attachments.tsx, src/domain/recordings.ts, src/domain/setarClasses.ts, src/domain/files.ts, src/domain/selectors.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### practise-todays-recommendation — Works now

Touchpoints: src/pages/Today.tsx, src/pages/StartBlock.tsx, src/pages/ActiveBlock.tsx, src/pages/CloseBlock.tsx, src/store/useStore.ts, src/domain/recommend.ts, src/domain/scoring.ts, src/domain/scheduling.ts, src/domain/blocks.ts

Evidence: 7 steps: 7 code inferred

### run-a-session-plan — Works now

Touchpoints: src/pages/SessionPlan.tsx, src/pages/Today.tsx, src/domain/plan.ts, src/store/useStore.ts

Evidence: 6 steps: 6 code inferred

### work-a-pathway-stage — Works now

Touchpoints: src/pages/PathwayDetail.tsx, src/pages/StageDetail.tsx, src/pages/RoutineRunner.tsx, src/domain/pathways.ts, src/domain/pathwaySeed.ts, src/store/useStore.ts

Evidence: 5 steps: 5 code inferred

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
cat > '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-stop-a-just-practised-item-from-still-re-bf98/findings.json'
```

**2. Paste this data, then press Ctrl-D** — one fenced `json` code block containing ONE valid, compact JSON array, with each entry shaped exactly `{ "family": "...", "summary": "...", "counterexample": "..." }`. Strict JSON only: no literal newline inside a quoted string — escape multi-line finding text — and keep the array on one logical line so no viewer's word-wrap can be mistaken for a real line break.

**3. Run this exact command** — one fenced `bash` code block containing only this command, on one logical line:

```bash
prismatica seal '20260828-stop-a-just-practised-item-from-still-re-bf98' --request-changes --findings '/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-stop-a-just-practised-item-from-still-re-bf98/findings.json'
```

You remain `--sandbox read-only` throughout: no `--add-dir`, no workspace-write, no heredoc, no shell interpolation, and no other findings transport. The findings file is `/var/folders/js/7jld3v1s7nq3fb8rnh6fl3h80000gn/T/prismatica-review-d8c8e126e0997c57-20260828-stop-a-just-practised-item-from-still-re-bf98/findings.json`. Never put any of your findings inside either command: they are data the owner pastes, not shell text.

Current policy: acceptance evidence is the exact NAMED test, never a whole test file. After a rejection, rework is judged by the invariant FAMILY a finding named, not by matching its exact wording. A Check already bound to the reviewed head is proof — it is not to be rerun wholesale. Use the stored rejection findings from the sealed review record, verbatim, rather than re-deriving them from memory.
