---
id: 20260910-every-minute-the-app-records-is-a-minute-6d14
flowId: practise-todays-recommendation
step: 7
today: >-
  Step 7 records that saving a block completes any open review and schedules the
  next one 'on the date that was shown', and the flow ends 'recorded honestly:
  one block, one result, one next action -- and the item knows when it should
  come back.' Verified against the code at 0c6058e, four of those claims are
  false.


  ONE RESULT is optional, and skipping it is destructive. Save is always enabled
  and `result` starts null. setReviewDate is reached only from pickResult or the
  manual date field, so with no result the date field stays empty,
  scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate:
  null } and CLEARS the item's date, and closeSession completes every open
  review for the item anyway. One skipped tap and the item silently leaves the
  review system: review closed, date erased, SM-2 state left stale, and it never
  appears under Due reviews again. The screen says the opposite while this
  happens -- 'Should this come back? Yes' sits above an empty date field,
  because comeBack defaults to true. 'The date shown is the date saved' is
  broken in the worst direction: nothing is shown and the schedule is wiped.


  RECORDED HONESTLY is not guaranteed. Elapsed time is unbounded wall clock, so
  a block left running overnight pre-fills the duration with the entire gap.
  Save it distractedly and eight hours of practice you did not do enter the
  item's totals, the instrument balance, the Teacher Report and every insight,
  permanently. Nothing distinguishes a phone locked during real practice from a
  session abandoned two days ago.


  ONE NEXT ACTION is write-only. It is captured on every close and read by
  nothing, anywhere. Practise the item again and the screen shows its general
  notes instead, so the one thing you deliberately decided to try never reaches
  the moment it was written for.


  And the block can be destroyed before it is ever recorded. A running block
  lives outside the synced database, so the device looks unchanged to sync; a
  change from the other device resolves to a straight pull, and the in-flight
  block is discarded with no prompt and no archive. A PAUSED block is no safer
  than a running one. Choosing Import, Restore archive or Keep remote by hand
  does the same thing just as quietly. And the same replacement leaves the
  running plan, today's dismissed reviews and a now-dangling session instrument
  pointing at a database that no longer contains them -- at all three places a
  database is installed, since reset-to-demo and erase-everything never pass
  through the import path at all.
instead: >-
  Every minute the app records is a minute you actually played, and every number
  it shows is derived from those minutes honestly. Two separate questions do
  that work and are never confused: whether an unfinished session EXISTS decides
  whether anything may replace your data, and whether its elapsed figure is
  still PLAUSIBLE decides only what minutes are proposed and whether it is worth
  pointing at. A heuristic about duration never becomes permission to discard
  practice.


  Saving needs a result -- the six options are already on screen, and 'Save
  without a result' keeps not_logged deliberate rather than accidental.
  Underneath, at the one place every caller routes through, answering nothing no
  longer reads as declining: a close carrying no result leaves the item's review
  date exactly as it was and leaves its open review open, while genuinely
  declining still clears it. Closing an ABANDONED block proposes its own target
  rather than the fabricated figure and says plainly why, so a forgotten clock
  cannot write practice you did not do -- while ordinary overtime stays
  completely normal. Practising an item again shows the next action you chose
  last time, before you start playing.


  And no unfinished session is ever destroyed by a replacement you did not aim
  at it -- running or paused, fresh or stale, ordinary or routine. Staleness
  decides the minutes proposed and raises the attention state; it never becomes
  permission to discard practice. Automatic sync defers quietly while practice
  is unfinished and retries the moment that session clears, whether you finished
  it or discarded it. A deliberate Import, Restore archive or Keep remote
  refuses out loud instead, naming the block that is in the way -- never a
  silent no-op, never a silent discard. A stale session blocking sync says so on
  Today and in the sync notice, and Resume leads straight to Finish, correct the
  minutes, or Discard. When a replacement does happen, the running plan, today's
  dismissals and a session instrument the new database lacks are cleared in the
  same step -- at every one of the three places a database is installed, not
  just the import path.


  And you can finally see how much you have practised: a compact
  minutes-and-blocks line for today and this week, low on Today and never above
  the recommendation, with today, this week and all time per instrument on
  Insights. Calendar figures, not rolling windows -- late last night belongs to
  yesterday and the week starts Monday. Neutral counts only, no target and no
  streak.
keep:
  - An unfinished practice session is never destroyed by a replacement you did
    not aim at it, and a paused session is protected exactly as much as a
    running one.
  - "A heuristic never becomes an authority: staleness changes what is proposed
    and what is shown, never what is discarded."
  - Practising stays the only thing that completes a review and advances spaced
    repetition; 'Not now' still changes no schedule and snooze still moves the
    real date on both sides.
  - The date previewed before saving is exactly the date saved -- now including
    when that date is deliberately left unchanged.
  - Closing a block stays under 60 seconds and starting one under 30. No new
    field is added; requiring a result only makes a choice already on screen a
    required one.
  - "The SM-2 rungs are not retuned and no schema changes: SCHEMA_VERSION stays
    11 with no migration."
  - No timer or wake-lock behaviour changes, and no recorded minute is ever
    influenced by a wake-lock or audio outcome.
  - Routine runs are untouched -- their minutes are already clamped per segment,
    and finishRoutine still records time without a judgement.
  - The sync model stays whole-snapshot, content-hash compared, with explicit
    two-button conflicts and both copies preserved. No timestamp enters a sync
    decision.
  - The primary recommendation stays above the fold on a 390x844 phone; the
    totals line sits below it.
  - Totals stay neutral counts -- no goal, streak, score, bar or judging colour
    -- and everything still works fully offline.
assumptions:
  - Staleness is a judgement about a DURATION, not about a session's worth. It
    is wired to the proposed minutes and the attention state, and to no
    destructive path anywhere.
  - What blocks a replacement is the PRESENCE of an unfinished session, never
    whether its clock is ticking -- pausing protects, it does not expose.
  - A deferred sync is retried by watching the blocking condition clear, so
    finishing and discarding both release it; neither depends on an incidental
    database write.
  - Deliberate erasure -- reset to demo, erase everything -- is aimed at
    destroying the data and already confirms first, so it keeps no guard; it
    must still leave no ephemeral state behind.
  - A block belongs whole to the calendar day it began, because its minutes are
    the figure you attested to and routine blocks carry no end timestamp to
    split by.
  - The week starts Monday 00:00 local time.
  - The most recent non-empty next action is the right one to surface; a later
    block that recorded none should not blank out a decision that still stands.
showMe: >-
  Practise an item, tap Finish, and try to save without choosing a result --
  Save is unavailable. Use 'Save without a result', then open the item: its next
  review date is UNCHANGED and its due review is still open, where today both
  would have silently disappeared. Practise it again and last time's next action
  is shown before you start playing.


  Leave a block running overnight, reopen and tap Finish: the proposed minutes
  are the block's target, not the eight-hour gap, with one plain line saying why
  -- and the block is still there to resolve, not discarded on your behalf. A
  block you genuinely played twenty minutes past its target still proposes the
  real elapsed time.


  Now the part that matters most. With a block running on the phone, push a
  change from the MacBook and reopen the phone: it does not replace its data,
  your block is still there with its time intact, and the sync notice says it is
  waiting on that block. PAUSE the block -- it is still protected. Leave it
  overnight so it goes stale -- it is STILL protected, and now Today's
  In-progress card says so. Discard it, and sync completes on its own within a
  few seconds without you touching anything. Then try Import or Restore archive
  with a block unfinished: each refuses out loud, names the block, and leaves it
  exactly where it was.


  Finally, glance at Today: below the 'Practise now' card -- still fully visible
  without scrolling -- a quiet line reads today's and this week's minutes and
  block counts, and Insights shows the same per instrument including all time.
  No goal, no streak, no bar.
status: approved
contractId: 20260910-every-recorded-minute-is-one-you-played--9ed1
createdAt: 2026-09-10T10:59:25.623Z
---

# Every minute the app records is a minute you actually played, and every number it shows is derived from those minutes honestly. Two separate questions do that work and are never confused: whether an unfinished session EXISTS decides whether anything may replace your data, and whether its elapsed figure is still PLAUSIBLE decides only what minutes are proposed and whether it is worth pointing at. A heuristic about duration never becomes permission to discard practice.

Saving needs a result -- the six options are already on screen, and 'Save without a result' keeps not_logged deliberate rather than accidental. Underneath, at the one place every caller routes through, answering nothing no longer reads as declining: a close carrying no result leaves the item's review date exactly as it was and leaves its open review open, while genuinely declining still clears it. Closing an ABANDONED block proposes its own target rather than the fabricated figure and says plainly why, so a forgotten clock cannot write practice you did not do -- while ordinary overtime stays completely normal. Practising an item again shows the next action you chose last time, before you start playing.

And no unfinished session is ever destroyed by a replacement you did not aim at it -- running or paused, fresh or stale, ordinary or routine. Staleness decides the minutes proposed and raises the attention state; it never becomes permission to discard practice. Automatic sync defers quietly while practice is unfinished and retries the moment that session clears, whether you finished it or discarded it. A deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the block that is in the way -- never a silent no-op, never a silent discard. A stale session blocking sync says so on Today and in the sync notice, and Resume leads straight to Finish, correct the minutes, or Discard. When a replacement does happen, the running plan, today's dismissals and a session instrument the new database lacks are cleared in the same step -- at every one of the three places a database is installed, not just the import path.

And you can finally see how much you have practised: a compact minutes-and-blocks line for today and this week, low on Today and never above the recommendation, with today, this week and all time per instrument on Insights. Calendar figures, not rolling windows -- late last night belongs to yesterday and the week starts Monday. Neutral counts only, no target and no streak.

_approved · about "practise-todays-recommendation" step 7_

## Today

Step 7 records that saving a block completes any open review and schedules the next one 'on the date that was shown', and the flow ends 'recorded honestly: one block, one result, one next action -- and the item knows when it should come back.' Verified against the code at 0c6058e, four of those claims are false.

ONE RESULT is optional, and skipping it is destructive. Save is always enabled and `result` starts null. setReviewDate is reached only from pickResult or the manual date field, so with no result the date field stays empty, scheduleReview evaluates false, computeReviewOutcome returns { nextReviewDate: null } and CLEARS the item's date, and closeSession completes every open review for the item anyway. One skipped tap and the item silently leaves the review system: review closed, date erased, SM-2 state left stale, and it never appears under Due reviews again. The screen says the opposite while this happens -- 'Should this come back? Yes' sits above an empty date field, because comeBack defaults to true. 'The date shown is the date saved' is broken in the worst direction: nothing is shown and the schedule is wiped.

RECORDED HONESTLY is not guaranteed. Elapsed time is unbounded wall clock, so a block left running overnight pre-fills the duration with the entire gap. Save it distractedly and eight hours of practice you did not do enter the item's totals, the instrument balance, the Teacher Report and every insight, permanently. Nothing distinguishes a phone locked during real practice from a session abandoned two days ago.

ONE NEXT ACTION is write-only. It is captured on every close and read by nothing, anywhere. Practise the item again and the screen shows its general notes instead, so the one thing you deliberately decided to try never reaches the moment it was written for.

And the block can be destroyed before it is ever recorded. A running block lives outside the synced database, so the device looks unchanged to sync; a change from the other device resolves to a straight pull, and the in-flight block is discarded with no prompt and no archive. A PAUSED block is no safer than a running one. Choosing Import, Restore archive or Keep remote by hand does the same thing just as quietly. And the same replacement leaves the running plan, today's dismissed reviews and a now-dangling session instrument pointing at a database that no longer contains them -- at all three places a database is installed, since reset-to-demo and erase-everything never pass through the import path at all.

## Instead

Every minute the app records is a minute you actually played, and every number it shows is derived from those minutes honestly. Two separate questions do that work and are never confused: whether an unfinished session EXISTS decides whether anything may replace your data, and whether its elapsed figure is still PLAUSIBLE decides only what minutes are proposed and whether it is worth pointing at. A heuristic about duration never becomes permission to discard practice.

Saving needs a result -- the six options are already on screen, and 'Save without a result' keeps not_logged deliberate rather than accidental. Underneath, at the one place every caller routes through, answering nothing no longer reads as declining: a close carrying no result leaves the item's review date exactly as it was and leaves its open review open, while genuinely declining still clears it. Closing an ABANDONED block proposes its own target rather than the fabricated figure and says plainly why, so a forgotten clock cannot write practice you did not do -- while ordinary overtime stays completely normal. Practising an item again shows the next action you chose last time, before you start playing.

And no unfinished session is ever destroyed by a replacement you did not aim at it -- running or paused, fresh or stale, ordinary or routine. Staleness decides the minutes proposed and raises the attention state; it never becomes permission to discard practice. Automatic sync defers quietly while practice is unfinished and retries the moment that session clears, whether you finished it or discarded it. A deliberate Import, Restore archive or Keep remote refuses out loud instead, naming the block that is in the way -- never a silent no-op, never a silent discard. A stale session blocking sync says so on Today and in the sync notice, and Resume leads straight to Finish, correct the minutes, or Discard. When a replacement does happen, the running plan, today's dismissals and a session instrument the new database lacks are cleared in the same step -- at every one of the three places a database is installed, not just the import path.

And you can finally see how much you have practised: a compact minutes-and-blocks line for today and this week, low on Today and never above the recommendation, with today, this week and all time per instrument on Insights. Calendar figures, not rolling windows -- late last night belongs to yesterday and the week starts Monday. Neutral counts only, no target and no streak.

## Keep

- An unfinished practice session is never destroyed by a replacement you did not aim at it, and a paused session is protected exactly as much as a running one.
- A heuristic never becomes an authority: staleness changes what is proposed and what is shown, never what is discarded.
- Practising stays the only thing that completes a review and advances spaced repetition; 'Not now' still changes no schedule and snooze still moves the real date on both sides.
- The date previewed before saving is exactly the date saved -- now including when that date is deliberately left unchanged.
- Closing a block stays under 60 seconds and starting one under 30. No new field is added; requiring a result only makes a choice already on screen a required one.
- The SM-2 rungs are not retuned and no schema changes: SCHEMA_VERSION stays 11 with no migration.
- No timer or wake-lock behaviour changes, and no recorded minute is ever influenced by a wake-lock or audio outcome.
- Routine runs are untouched -- their minutes are already clamped per segment, and finishRoutine still records time without a judgement.
- The sync model stays whole-snapshot, content-hash compared, with explicit two-button conflicts and both copies preserved. No timestamp enters a sync decision.
- The primary recommendation stays above the fold on a 390x844 phone; the totals line sits below it.
- Totals stay neutral counts -- no goal, streak, score, bar or judging colour -- and everything still works fully offline.

## New assumptions

- Staleness is a judgement about a DURATION, not about a session's worth. It is wired to the proposed minutes and the attention state, and to no destructive path anywhere.
- What blocks a replacement is the PRESENCE of an unfinished session, never whether its clock is ticking -- pausing protects, it does not expose.
- A deferred sync is retried by watching the blocking condition clear, so finishing and discarding both release it; neither depends on an incidental database write.
- Deliberate erasure -- reset to demo, erase everything -- is aimed at destroying the data and already confirms first, so it keeps no guard; it must still leave no ephemeral state behind.
- A block belongs whole to the calendar day it began, because its minutes are the figure you attested to and routine blocks carry no end timestamp to split by.
- The week starts Monday 00:00 local time.
- The most recent non-empty next action is the right one to surface; a later block that recorded none should not blank out a decision that still stands.

## Show me

Practise an item, tap Finish, and try to save without choosing a result -- Save is unavailable. Use 'Save without a result', then open the item: its next review date is UNCHANGED and its due review is still open, where today both would have silently disappeared. Practise it again and last time's next action is shown before you start playing.

Leave a block running overnight, reopen and tap Finish: the proposed minutes are the block's target, not the eight-hour gap, with one plain line saying why -- and the block is still there to resolve, not discarded on your behalf. A block you genuinely played twenty minutes past its target still proposes the real elapsed time.

Now the part that matters most. With a block running on the phone, push a change from the MacBook and reopen the phone: it does not replace its data, your block is still there with its time intact, and the sync notice says it is waiting on that block. PAUSE the block -- it is still protected. Leave it overnight so it goes stale -- it is STILL protected, and now Today's In-progress card says so. Discard it, and sync completes on its own within a few seconds without you touching anything. Then try Import or Restore archive with a block unfinished: each refuses out loud, names the block, and leaves it exactly where it was.

Finally, glance at Today: below the 'Practise now' card -- still fully visible without scrolling -- a quiet line reads today's and this week's minutes and block counts, and Insights shows the same per instrument including all time. No goal, no streak, no bar.

