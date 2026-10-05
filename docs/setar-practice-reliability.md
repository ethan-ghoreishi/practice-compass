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
