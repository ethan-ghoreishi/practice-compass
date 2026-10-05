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
