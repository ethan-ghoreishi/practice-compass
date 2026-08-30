import { useEffect, useMemo } from 'react';
import { shouldKeepAwake } from '../domain';
import { createScreenAwakeCoordinator, type WakeLockSentinelPort } from './screenAwake';

/** Feature-detected: rejects (harmlessly, per screenAwake's coordinator) when the API is absent. */
async function requestWakeLock(): Promise<WakeLockSentinelPort> {
  if (!('wakeLock' in navigator)) throw new Error('Screen Wake Lock unsupported');
  const sentinel = await navigator.wakeLock.request('screen');
  return { release: () => sentinel.release() };
}

/**
 * Best-effort only, never the contractual signal — the visual state change
 * is that (see ActiveBlock/RoutineRunner). Wrapped so failure is always
 * silent: `navigator.vibrate` is unimplemented in Safari on iOS, and a
 * WebAudio context needs a user-gesture unlock that happens on the page
 * that STARTS a clock (Today/StageDetail/SessionPlan) — never on the
 * practice screen itself, which hands-free practice by definition never
 * taps. It may therefore be silent on the owner's own iPhone; the OWNER
 * device checks record what was actually heard rather than asserting it.
 */
export function playSignalCue(): void {
  try {
    if (typeof navigator.vibrate === 'function') navigator.vibrate(80);
  } catch {
    // best-effort only
  }
  try {
    const Ctx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => void ctx.close();
  } catch {
    // best-effort only — most likely a locked AudioContext with no unlock gesture available here
  }
}

/**
 * A thin React/browser adapter: one coordinator per mounted practice screen
 * (ActiveBlock, RoutineRunner) — safe because only one of them is ever
 * mounted at a time, matching the single-active-practice-clock invariant.
 * Supplies the real `navigator.wakeLock.request` port and wires
 * `visibilitychange`, since the spec requires the platform to release a
 * held lock when the document becomes hidden — reacquiring on return is
 * mandated behaviour, not a browser workaround.
 */
export function useScreenAwake(hasClock: boolean, running: boolean): void {
  const coordinator = useMemo(() => createScreenAwakeCoordinator(requestWakeLock), []);

  useEffect(() => {
    const evaluate = () => coordinator.setEnabled(shouldKeepAwake({ hasClock, running, visible: document.visibilityState === 'visible' }));
    evaluate();
    document.addEventListener('visibilitychange', evaluate);
    return () => {
      document.removeEventListener('visibilitychange', evaluate);
      coordinator.setEnabled(false); // unmount (navigation, Finish, Discard, routine completion) always releases
    };
  }, [coordinator, hasClock, running]);
}
