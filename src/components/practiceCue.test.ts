import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// The practice sound's lifecycle, and the store's boundary claims, in Node.
// Supports the mounted proof in tests/practice-cues.browser.test.ts: this is
// where every fault a real AudioContext can show — a constructor that throws,
// a resume() that throws, rejects or never settles, a context closed under
// the page — is driven one at a time against the module itself.
// ---------------------------------------------------------------------------

type Log = { e: string; [k: string]: unknown }[];

function fakeAudio(log: Log, opts: { ctorThrows?: boolean; resume?: 'ok' | 'throws' | 'rejects' | 'hangs' } = {}) {
  class Ctx {
    state: string = 'suspended';
    currentTime = 5;
    destination = { kind: 'destination' };
    private listeners: (() => void)[] = [];
    constructor() {
      if (opts.ctorThrows) throw new Error('no audio');
      log.push({ e: 'ctor', ctx: this });
    }
    addEventListener(_t: string, fn: () => void) {
      this.listeners.push(fn);
    }
    setState(s: string) {
      this.state = s;
      for (const fn of this.listeners) fn();
    }
    resume() {
      log.push({ e: 'resume' });
      if (opts.resume === 'throws') throw new Error('refused');
      if (opts.resume === 'rejects') return Promise.reject(new Error('rejected'));
      if (opts.resume === 'hangs') return new Promise(() => undefined);
      this.setState('running');
      return Promise.resolve();
    }
    createOscillator() {
      const node = {
        frequency: { value: 0 },
        onended: null as null | (() => void),
        connect: (to: { kind?: string }) => (log.push({ e: 'connect', from: 'osc', to: to.kind ?? 'gain' }), to),
        disconnect: () => log.push({ e: 'disconnect', node: 'osc' }),
        start: (t: number) => log.push({ e: 'start', t }),
        stop: (t: number) => log.push({ e: 'stop', t }),
        kind: 'osc',
      };
      return node;
    }
    createGain() {
      const node = {
        kind: 'gain',
        gain: {
          setValueAtTime: (v: number, t: number) => log.push({ e: 'set', v, t }),
          exponentialRampToValueAtTime: (v: number, t: number) => log.push({ e: 'exp', v, t }),
        },
        connect: (to: { kind?: string }) => (log.push({ e: 'connect', from: 'gain', to: to.kind }), to),
        disconnect: () => log.push({ e: 'disconnect', node: 'gain' }),
      };
      return node;
    }
  }
  return Ctx;
}

async function load(log: Log, opts: Parameters<typeof fakeAudio>[1] = {}, audio = true) {
  vi.resetModules();
  vi.stubGlobal('window', audio ? { AudioContext: fakeAudio(log, opts) } : {});
  vi.stubGlobal('navigator', { vibrate: (p: unknown) => (log.push({ e: 'vibrate', p }), true) });
  return import('./practiceCue');
}

const flush = () => new Promise((r) => setTimeout(r, 0));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('the practice sound module', () => {
  it('practice sound keeps one context primed only by taps and never queues a cue', async () => {
    // --- ONE context, readied by the first tap, reused by every later one --
    let log: Log = [];
    let cue = await load(log);
    expect(cue.usePracticeSound).toBeTypeOf('function');
    cue.playPracticeCue(); // a boundary before any tap: vibration only, nothing created
    expect(log.map((x) => x.e)).toEqual(['vibrate']);
    cue.primePracticeSound();
    cue.primePracticeSound();
    cue.primePracticeSound();
    await flush();
    expect(log.filter((x) => x.e === 'ctor')).toHaveLength(1);
    expect(log.filter((x) => x.e === 'resume')).toHaveLength(1); // only while suspended
    // A boundary plays two bounded pulses on it, and lets the nodes go.
    log.length = 0;
    cue.playPracticeCue();
    expect(log.filter((x) => x.e === 'start').map((x) => x.t)).toEqual([5, 5.45]);
    expect(log.filter((x) => x.e === 'stop').map((x) => x.t)).toEqual([5.3, 5.75]);
    expect(log.filter((x) => x.e === 'set').map((x) => [x.v, x.t])).toEqual([
      [0.2, 5],
      [0.2, 5.45],
    ]);
    expect(log.filter((x) => x.e === 'exp').map((x) => [x.v, x.t])).toEqual([
      [0.001, 5.3],
      [0.001, 5.75],
    ]);
    expect(log.filter((x) => x.e === 'ctor' || x.e === 'resume')).toEqual([]);

    // --- A CONTEXT THAT WILL NOT RUN: no tone, no retry, nothing queued -----
    for (const resume of ['throws', 'rejects', 'hangs'] as const) {
      log = [];
      cue = await load(log, { resume });
      expect(() => cue.primePracticeSound()).not.toThrow();
      expect(() => cue.testPracticeSound()).not.toThrow();
      await flush();
      cue.playPracticeCue();
      await flush();
      expect(log.filter((x) => x.e === 'start'), resume).toEqual([]);
      expect(log.filter((x) => x.e === 'ctor'), resume).toHaveLength(1);
      // The next TAP may try again; nothing tries on its own.
      const resumes = log.filter((x) => x.e === 'resume').length;
      await flush();
      expect(log.filter((x) => x.e === 'resume').length, resume).toBe(resumes);
    }

    // --- INTERRUPTED, then resumed by a later tap: a missed boundary stays
    // missed. Nothing waits on the context to sound late. ----------------------
    log = [];
    cue = await load(log);
    cue.primePracticeSound();
    await flush();
    const ctx = log.find((x) => x.e === 'ctor')!.ctx as { setState(s: string): void };
    ctx.setState('interrupted'); // a call, the lock screen, another app's audio
    cue.playPracticeCue(); // a boundary passes while it is not running
    cue.primePracticeSound(); // the owner's next tap resumes it
    await flush();
    expect(log.filter((x) => x.e === 'resume')).toHaveLength(2);
    expect(log.filter((x) => x.e === 'start')).toEqual([]);

    // --- A CONSTRUCTOR THAT THROWS: unavailable, until an explicit tap ------
    log = [];
    cue = await load(log, { ctorThrows: true });
    expect(() => cue.primePracticeSound()).not.toThrow();
    cue.playPracticeCue();
    expect(log.filter((x) => x.e === 'start')).toEqual([]);

    // --- NO WEB AUDIO at all: nothing to create, nothing thrown -------------
    log = [];
    cue = await load(log, {}, false);
    expect(() => cue.primePracticeSound()).not.toThrow();
    expect(() => cue.testPracticeSound()).not.toThrow();
    cue.playPracticeCue();
    // Only the boundary's best-effort vibration: Test sound has nothing to play.
    expect(log.map((x) => x.e)).toEqual(['vibrate']);

    // --- TEST SOUND plays once the tap's own resume lands -------------------
    log = [];
    cue = await load(log);
    cue.testPracticeSound();
    await flush();
    expect(log.filter((x) => x.e === 'start')).toHaveLength(2);
  });
});

describe('the boundary claim', () => {
  it('a boundary claim is granted once and only for the still-running clock', async () => {
    vi.resetModules();
    vi.doMock('../store/idb', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../store/idb')>()),
      idbStorage: { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined },
    }));
    const { useStore } = await import('../store/useStore');
    const s = () => useStore.getState();
    const block = { itemId: 'i', instrumentId: 'x', mode: 'learn' as const, focus: 'other' as const, targetMinutes: 1, startedAt: 'A', accumulatedSeconds: 0, running: true, segmentStartedAt: 'A' };
    useStore.setState({ active: block, activeRoutine: null });
    // The still-current clock advances its marker ONCE per boundary.
    expect(s().claimSessionSignal('A', 1)).toBe(true);
    expect(s().active!.signalledThrough).toBe(1);
    // A replayed effect holding the same marker, or an older one: refused.
    expect(s().claimSessionSignal('A', 1)).toBe(false);
    expect(s().claimSessionSignal('A', 0)).toBe(false);
    // A clock that has been REPLACED since it was observed: refused, nothing moves.
    useStore.setState({ active: { ...block, startedAt: 'B' } });
    expect(s().claimSessionSignal('A', 1)).toBe(false);
    expect(s().active!.signalledThrough).toBeUndefined();
    // A PAUSED clock announces nothing.
    useStore.setState({ active: { ...block, startedAt: 'B', running: false } });
    expect(s().claimSessionSignal('B', 1)).toBe(false);
    // No clock at all.
    useStore.setState({ active: null });
    expect(s().claimSessionSignal('B', 1)).toBe(false);

    // The routine claim, by run identity — a legacy run with none claims as none.
    const run = { routineId: 'r', shortOnTime: false, authoredSegments: [], segs: [], accumulatedSeconds: 0, running: true, runningSince: 'R', startedAt: 'R' };
    useStore.setState({ activeRoutine: run });
    expect(s().claimRoutineSignal('R', 2)).toBe(true);
    expect(s().claimRoutineSignal('R', 2)).toBe(false);
    expect(s().claimRoutineSignal('OLD-RUN', 3)).toBe(false);
    useStore.setState({ activeRoutine: { ...run, running: false } });
    expect(s().claimRoutineSignal('R', 3)).toBe(false);
    const { startedAt: _none, ...legacyRun } = run;
    void _none;
    useStore.setState({ activeRoutine: { ...legacyRun, signalledThrough: 0 } });
    expect(s().claimRoutineSignal(undefined, 1)).toBe(true);
    vi.doUnmock('../store/idb');
  });
});
