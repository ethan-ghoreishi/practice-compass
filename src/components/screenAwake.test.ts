import { describe, expect, it, vi } from 'vitest';
import { createScreenAwakeCoordinator, type WakeLockSentinelPort } from './screenAwake';

function deferred<T>() {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function mockSentinel(): WakeLockSentinelPort & { release: ReturnType<typeof vi.fn<() => void>> } {
  return { release: vi.fn<() => void>() };
}

/** Flush every pending microtask AND macrotask — reliable regardless of how many .then() hops the coordinator chains internally. */
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('screenAwake: the wake lock coordinator', () => {
  it('holds at most one sentinel and never stacks requests', async () => {
    const inFlight = deferred<WakeLockSentinelPort>();
    const acquire = vi.fn().mockReturnValueOnce(inFlight.promise);
    const coordinator = createScreenAwakeCoordinator(acquire);

    coordinator.setEnabled(true);
    coordinator.setEnabled(true); // idempotent re-enable — must not issue a second request
    expect(acquire).toHaveBeenCalledTimes(1);

    const s = mockSentinel();
    inFlight.resolve(s);
    await flush();
    expect(s.release).not.toHaveBeenCalled(); // held, not stranded
  });

  it('treats a rejected wake lock request as harmless', async () => {
    const held = mockSentinel();
    const acquire = vi.fn().mockRejectedValueOnce(new Error('denied')).mockResolvedValueOnce(held);
    const coordinator = createScreenAwakeCoordinator(acquire);

    expect(() => coordinator.setEnabled(true)).not.toThrow();
    await flush(); // the rejection resolves harmlessly

    // A later enable cycle can still acquire — nothing was left corrupted.
    coordinator.setEnabled(false);
    coordinator.setEnabled(true);
    await flush();
    expect(acquire).toHaveBeenCalledTimes(2);
  });

  it('releases a sentinel that resolves after the coordinator was disabled', async () => {
    const inFlight = deferred<WakeLockSentinelPort>();
    const acquire = vi.fn().mockReturnValueOnce(inFlight.promise);
    const coordinator = createScreenAwakeCoordinator(acquire);

    coordinator.setEnabled(true);
    coordinator.setEnabled(false); // disabled while the request is still in flight

    const s = mockSentinel();
    inFlight.resolve(s);
    await flush();

    expect(s.release).toHaveBeenCalledTimes(1); // the pending-acquisition leak, closed
  });

  it('releases a held sentinel exactly once when disabled', async () => {
    const s = mockSentinel();
    const acquire = vi.fn().mockResolvedValue(s);
    const coordinator = createScreenAwakeCoordinator(acquire);

    coordinator.setEnabled(true);
    await flush();

    coordinator.setEnabled(false);
    coordinator.setEnabled(false); // repeated disable — must not double-release
    expect(s.release).toHaveBeenCalledTimes(1);
  });

  it('reacquires exactly once when the document becomes visible again', async () => {
    const first = mockSentinel();
    const second = mockSentinel();
    const acquire = vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    const coordinator = createScreenAwakeCoordinator(acquire);

    coordinator.setEnabled(true); // clock starts, screen visible
    await flush();
    expect(acquire).toHaveBeenCalledTimes(1);

    coordinator.setEnabled(false); // document hidden — the spec releases the lock
    coordinator.setEnabled(true); // back to visible, the clock still qualifies
    await flush();

    expect(acquire).toHaveBeenCalledTimes(2);
    expect(first.release).toHaveBeenCalledTimes(1);
  });

  it('leaks no sentinel across rapid visibility and pause churn', async () => {
    const sentinels: ReturnType<typeof mockSentinel>[] = [];
    const acquire = vi.fn().mockImplementation(async () => {
      const s = mockSentinel();
      sentinels.push(s);
      return s;
    });
    const coordinator = createScreenAwakeCoordinator(acquire);

    for (let i = 0; i < 6; i++) {
      coordinator.setEnabled(true);
      await flush();
      coordinator.setEnabled(false);
      await flush();
    }
    coordinator.setEnabled(true); // settle enabled
    await flush();

    const stillHeld = sentinels.filter((s) => s.release.mock.calls.length === 0);
    expect(stillHeld).toHaveLength(1); // exactly the final, currently-enabled sentinel
    sentinels.slice(0, -1).forEach((s) => expect(s.release).toHaveBeenCalledTimes(1));
  });
});
