// ---------------------------------------------------------------------------
// The screen wake lock's ONE shared owner. A plain, non-React state machine
// — no navigator/window/document — with acquire/release taken as injected
// ports, so every risk that actually matters (a stacked request, a leaked
// sentinel, an acquisition that resolves after the caller already disabled
// it) is reachable from an ordinary Node test. `useScreenAwake.ts` is the
// only caller: it supplies the real `navigator.wakeLock.request` port and
// wires visibilitychange/pause/unmount into `setEnabled`.
// ---------------------------------------------------------------------------

export interface WakeLockSentinelPort {
  release: () => void | Promise<void>;
}

export type AcquireWakeLock = () => Promise<WakeLockSentinelPort>;

export interface ScreenAwakeCoordinator {
  /**
   * Ask to hold (true) or release (false) the lock. Idempotent — repeating
   * the same value never issues a second request or a second release.
   */
  setEnabled: (enabled: boolean) => void;
}

function releaseQuietly(sentinel: WakeLockSentinelPort): void {
  try {
    void Promise.resolve(sentinel.release()).catch(() => {});
  } catch {
    // A synchronous throw from a hostile port is exactly as harmless as a rejection.
  }
}

/**
 * At most one outstanding request and one held sentinel at any time. A
 * rejected (or unsupported — the adapter's port simply rejects) acquisition
 * is swallowed silently and never blocks a later enable. If `setEnabled(false)`
 * fires while a request is in flight, the sentinel that eventually resolves
 * is released immediately rather than held — checked against `enabled` at
 * resolution time, not a snapshot taken when the request was issued, so a
 * disable-then-re-enable in between ends up holding the lock rather than
 * wastefully releasing and re-requesting it.
 */
export function createScreenAwakeCoordinator(acquire: AcquireWakeLock): ScreenAwakeCoordinator {
  let enabled = false;
  let sentinel: WakeLockSentinelPort | null = null;
  let pending = false;

  function release(): void {
    if (!sentinel) return;
    const held = sentinel;
    sentinel = null;
    releaseQuietly(held);
  }

  function requestIfNeeded(): void {
    if (!enabled || sentinel || pending) return;
    pending = true;
    acquire()
      .then((s) => {
        pending = false;
        if (!enabled) {
          releaseQuietly(s); // disabled while this was in flight — never strand it held
          return;
        }
        sentinel = s;
      })
      .catch(() => {
        pending = false;
      });
  }

  return {
    setEnabled(next: boolean) {
      if (next === enabled) return;
      enabled = next;
      if (enabled) requestIfNeeded();
      else release();
    },
  };
}
