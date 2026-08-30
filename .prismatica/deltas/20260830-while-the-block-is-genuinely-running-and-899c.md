---
id: 20260830-while-the-block-is-genuinely-running-and-899c
flowId: practise-todays-recommendation
step: 4
today: "The musician practises while the block runs, pausing and resuming as
  needed, and the screen shows the elapsed clock. Nothing asks the device to
  keep the display awake, so on a phone the screen dims and locks mid-block and
  the clock is simply not there to glance at. Reaching the 10-minute target
  changes nothing at all: the ring silently saturates at full (`Math.min(elapsed
  / targetSeconds, 1)`) and the readout keeps counting with no indication that
  the intended time has arrived."
instead: While the block is genuinely running and its screen is visible, the app
  asks the device to keep the display awake, so the clock is readable from the
  instrument without touching anything; pausing, finishing, discarding or
  navigating away releases it again and the phone sleeps normally. When the
  target is reached the screen visibly says so, once, and begins showing how far
  past it you have gone — the block does NOT auto-finish, because practising
  past the target is ordinary. A sound or vibration may accompany it where the
  device supports one, but the visible change is the promise. Whether the wake
  lock succeeds or fails changes no recorded minute.
keep:
  - Elapsed seconds still accumulate only while the timer runs, from the wall
    clock, exactly as now.
  - Finish still freezes the clock before the close screen, so reflection time
    is not counted.
  - The review date shown before saving is still exactly the date saved.
  - Starting a block stays under 30 seconds; nothing new is required of the user
    to get the screen to stay awake.
  - Practising is still the only thing that completes a review and advances
    spaced repetition.
assumptions:
  - Whether the Screen Wake Lock API is available and effective in the owner's
    installed iOS PWA is established by an OWNER device check, not asserted by
    this contract; the implementation feature-detects and degrades to a silent
    no-op.
  - The specification requires the platform to release a wake lock when the
    document becomes hidden, so reacquiring on return to visible is mandated
    behaviour rather than a browser-specific workaround.
showMe: "On the iPhone with the app installed: start a block at the shortest
  real preset (5 minutes) from Today, put the phone face-up on the music stand
  and do not touch it. The display stays on for the whole block; at 5:00 the
  screen visibly changes to say the target is reached and starts counting
  overtime; the block is still running and waiting for you to Finish. Tap Pause
  and leave it: the phone now sleeps normally, and when you wake it the elapsed
  time has not moved."
status: approved
contractId: 20260830-hands-free-practice-the-screen-stays-awa-65dd
createdAt: 2026-08-30T12:14:22.169Z
---

# While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

_approved · about "practise-todays-recommendation" step 4_

## Today

The musician practises while the block runs, pausing and resuming as needed, and the screen shows the elapsed clock. Nothing asks the device to keep the display awake, so on a phone the screen dims and locks mid-block and the clock is simply not there to glance at. Reaching the 10-minute target changes nothing at all: the ring silently saturates at full (`Math.min(elapsed / targetSeconds, 1)`) and the readout keeps counting with no indication that the intended time has arrived.

## Instead

While the block is genuinely running and its screen is visible, the app asks the device to keep the display awake, so the clock is readable from the instrument without touching anything; pausing, finishing, discarding or navigating away releases it again and the phone sleeps normally. When the target is reached the screen visibly says so, once, and begins showing how far past it you have gone — the block does NOT auto-finish, because practising past the target is ordinary. A sound or vibration may accompany it where the device supports one, but the visible change is the promise. Whether the wake lock succeeds or fails changes no recorded minute.

## Keep

- Elapsed seconds still accumulate only while the timer runs, from the wall clock, exactly as now.
- Finish still freezes the clock before the close screen, so reflection time is not counted.
- The review date shown before saving is still exactly the date saved.
- Starting a block stays under 30 seconds; nothing new is required of the user to get the screen to stay awake.
- Practising is still the only thing that completes a review and advances spaced repetition.

## New assumptions

- Whether the Screen Wake Lock API is available and effective in the owner's installed iOS PWA is established by an OWNER device check, not asserted by this contract; the implementation feature-detects and degrades to a silent no-op.
- The specification requires the platform to release a wake lock when the document becomes hidden, so reacquiring on return to visible is mandated behaviour rather than a browser-specific workaround.

## Show me

On the iPhone with the app installed: start a block at the shortest real preset (5 minutes) from Today, put the phone face-up on the music stand and do not touch it. The display stays on for the whole block; at 5:00 the screen visibly changes to say the target is reached and starts counting overtime; the block is still running and waiting for you to Finish. Tap Pause and leave it: the phone now sleeps normally, and when you wake it the elapsed time has not moved.

