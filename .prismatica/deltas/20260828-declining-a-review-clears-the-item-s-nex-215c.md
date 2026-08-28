---
id: 20260828-declining-a-review-clears-the-item-s-nex-215c
flowId: practise-todays-recommendation
step: 7
today: "Step 7 says the item 'knows when it should come back'. It does not.
  Answer No to 'Should this come back?' — or save with the date field cleared —
  and the block is logged, the counters advance, the SM-2 state advances anyway,
  the open review is marked complete, but the item KEEPS its old review date.
  Verified in the live app: an item whose date was 14 days in the past was
  practised successfully, and Today immediately said 'Next up: its review is 14
  days overdue.' The overdue score is now pinned at its maximum permanently and
  grows every day, and neither 'Not now' nor '+2d' can clear it, because the
  review row those buttons act on has just been completed. The only escape is
  practising the item again and accepting a date."
instead: Declining a review clears the item's next review date. The item drops
  out of the review system honestly — no overdue claim, no invented future date
  — and Today stops mentioning a review for it at all. Accepting one writes a
  single computed date to both the item and its new review row, so the date
  shown at close is the date saved, by construction. SM-2 advances only when a
  review is genuinely scheduled. And every path that moves a review date —
  closing a block, snoozing, editing the item — goes through one tested place,
  so the item and its review row can no longer disagree.
keep:
  - Practising stays the only thing that completes a review and advances spaced
    repetition.
  - "'Not now' still changes no schedule; '+2d' still moves the real date on
    both sides."
  - The review date previewed before saving is still exactly the date saved.
  - Closing a block stays under 60 seconds — no new field and no extra question
    on the close screen.
assumptions:
  - "An item with no next review date is an honest state, not an error: it
    simply is not in the spaced-repetition system until the user next accepts a
    date."
  - Items already stuck in the false-overdue state are left alone and clear
    themselves on their next practice — the owner's explicit choice.
showMe: "Practise an item, pick a result, answer No to 'Should this come back?',
  and save. Today shows the item with no overdue claim at all — not 'overdue',
  not a fabricated future date. Then practise it again and accept the suggested
  date: Today shows that exact date, and the row appears under Due reviews on
  the day it arrives."
status: approved
contractId: 20260828-stop-a-just-practised-item-from-still-re-bf98
createdAt: 2026-08-28T14:34:18.728Z
---

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

