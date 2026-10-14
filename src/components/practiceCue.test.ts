import { afterEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// The practice sound's lifecycle, and the store's boundary claims, in Node.
// Supports the mounted proof in tests/practice-cues.browser.test.ts: this is
// where every fault a real AudioContext can show — a constructor that throws,
// a resume() that throws, rejects or never settles, a context closed under
// the page — is driven one at a time against the module itself.
// ---------------------------------------------------------------------------

type Log = { e: string; [k: string]: unknown }[];

/**
 * A stand-in AudioContext. Every context STARTS SUSPENDED, even inside a tap,
 * so a prime that does not call resume() never gets a running engine. A
 * created context can then be killed into one of the dead states a real one
 * reaches after a long idle: still `running` but silent, `interrupted` or
 * `suspended` in a way resume() cannot clear, or closed by the browser.
 */
type Dead = 'frozen' | 'interrupted' | 'suspended' | 'closed';
type Fake = { id: number; state: string; dead?: Dead; setState(s: string): void; kill(d: Dead): void };

function fakeAudio(log: Log, opts: { ctorThrows?: boolean; resume?: 'ok' | 'throws' | 'rejects' | 'hangs' | 'manual' } = {}) {
  let ids = 0;
  class Ctx {
    id = ++ids;
    state: string = 'suspended';
    dead?: Dead;
    currentTime = 5;
    destination = { kind: 'destination' };
    private listeners: (() => void)[] = [];
    constructor() {
      if (opts.ctorThrows) throw new Error('no audio');
      log.push({ e: 'ctor', ctx: this, id: this.id });
    }
    addEventListener(_t: string, fn: () => void) {
      this.listeners.push(fn);
    }
    setState(s: string) {
      this.state = s;
      for (const fn of this.listeners) fn();
    }
    kill(d: Dead) {
      this.dead = d;
      if (d !== 'frozen') this.setState(d);
    }
    close() {
      log.push({ e: 'close', id: this.id });
      // A real close() settles later: until then the context still reports
      // whatever state it had, `running` included.
      return new Promise<void>((done) =>
        setTimeout(() => {
          this.setState('closed');
          done();
        }, 0),
      );
    }
    resume() {
      log.push({ e: 'resume', id: this.id });
      if (opts.resume === 'throws') throw new Error('refused');
      if (opts.resume === 'rejects') return Promise.reject(new Error('rejected'));
      if (opts.resume === 'hangs') return new Promise(() => undefined);
      // Settles only when the test says so — never changes the state itself.
      if (opts.resume === 'manual') return new Promise<void>((done) => log.push({ e: 'pending', done }));
      // A dead context's resume() resolves and changes nothing.
      if (this.dead) return Promise.resolve();
      this.setState('running');
      return Promise.resolve();
    }
    createOscillator() {
      const node = {
        frequency: { value: 0 },
        onended: null as null | (() => void),
        connect: (to: { kind?: string }) => (log.push({ e: 'connect', from: 'osc', to: to.kind ?? 'gain' }), to),
        disconnect: () => log.push({ e: 'disconnect', node: 'osc' }),
        // A frozen context schedules and is never heard: `silent` records that.
        start: (t: number) => log.push({ e: 'start', t, id: this.id, silent: !!this.dead }),
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
  vi.doMock('../store/idb', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../store/idb')>()),
    idbStorage: { getItem: async () => null, setItem: async () => undefined, removeItem: async () => undefined },
  }));
  const { useStore } = await import('../store/useStore');
  const cue = await import('./practiceCue');
  return { ...cue, useStore };
}

const flush = () => new Promise((r) => setTimeout(r, 0));
const contextsIn = (log: Log) => log.filter((x) => x.e === 'ctor').map((x) => x.ctx as Fake);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock('../store/idb');
});

/** The four taps that ready sound: Start and Resume through the store, Test sound and Turn on sound. */
const ENTRIES = {
  start: (m: Awaited<ReturnType<typeof load>>) => {
    m.useStore.setState({ active: null, activeRoutine: null });
    m.useStore.getState().startSession({ itemId: 'i', instrumentId: 'x', mode: 'learn', focus: 'other', targetMinutes: 10 });
  },
  resume: (m: Awaited<ReturnType<typeof load>>) => {
    m.useStore.setState({
      activeRoutine: null,
      active: { itemId: 'i', instrumentId: 'x', mode: 'learn', focus: 'other', targetMinutes: 10, startedAt: 'A', accumulatedSeconds: 60, running: false },
    });
    m.useStore.getState().resumeSession();
  },
  'Test practice sound': (m: Awaited<ReturnType<typeof load>>) => m.testPracticeSound(),
  'Turn on sound': (m: Awaited<ReturnType<typeof load>>) => m.testPracticeSound(),
};

describe('the practice sound module', () => {
  it("every readying tap replaces the page's sound context and a boundary never revives a dead one", async () => {
    // --- THE CUE'S SHAPE, on the context a tap readied ----------------------
    let log: Log = [];
    let m = await load(log);
    expect(m.usePracticeSound).toBeTypeOf('function');
    m.playPracticeCue(); // a boundary before any tap: vibration only, nothing created
    expect(log.map((x) => x.e)).toEqual(['vibrate']);
    m.primePracticeSound();
    await flush();
    expect(contextsIn(log).map((c) => c.state)).toEqual(['running']);
    log.length = 0;
    m.playPracticeCue();
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
    expect(log.filter((x) => x.e === 'ctor' || x.e === 'resume' || x.e === 'close')).toEqual([]);

    // --- EVERY DEAD STATE × EVERY READYING TAP ------------------------------
    // The context dies while the app sits idle; a boundary passes (it may
    // schedule on a frozen `running` engine, never creates or resumes one);
    // then ONE tap: the old context is closed, exactly one fresh one is created
    // and resumed inside that tap, it is the only live one, and the next
    // boundary plays once — on it.
    for (const dead of ['frozen', 'interrupted', 'suspended', 'closed'] as Dead[]) {
      for (const [entry, tap] of Object.entries(ENTRIES)) {
        const label = `${dead} · ${entry}`;
        log = [];
        m = await load(log);
        m.primePracticeSound();
        await flush();
        const [first] = contextsIn(log);
        first.kill(dead);
        const boundaryFrom = log.length;
        m.playPracticeCue();
        expect(log.slice(boundaryFrom).filter((x) => x.e === 'ctor' || x.e === 'resume'), label).toEqual([]);
        const from = log.length;
        tap(m);
        const during = log.slice(from);
        // Inside the tap itself, synchronously: close the old, create and resume ONE new.
        expect(during.filter((x) => x.e === 'close' || x.e === 'ctor' || x.e === 'resume').map((x) => [x.e, x.id]), label).toEqual(
          dead === 'closed' ? [['ctor', 2], ['resume', 2]] : [['close', 1], ['ctor', 2], ['resume', 2]],
        );
        await flush();
        expect(contextsIn(log).filter((c) => c.state !== 'closed').map((c) => c.id), label).toEqual([2]);
        const cueFrom = log.length;
        m.playPracticeCue();
        await flush();
        const starts = log.slice(cueFrom).filter((x) => x.e === 'start');
        expect(starts.map((x) => [x.id, x.silent]), label).toEqual([
          [2, false],
          [2, false],
        ]);
        expect(log.slice(cueFrom).filter((x) => x.e === 'ctor' || x.e === 'resume'), label).toEqual([]);
      }
    }

    // --- A CONTEXT THAT WILL NOT RUN: replaced at each tap, never retried ----
    for (const resume of ['throws', 'rejects', 'hangs'] as const) {
      for (const [entry, tap] of Object.entries(ENTRIES)) {
        const label = `${resume} · ${entry}`;
        log = [];
        m = await load(log, { resume });
        expect(() => m.primePracticeSound(), label).not.toThrow();
        expect(() => tap(m), label).not.toThrow();
        await flush();
        // The second tap closed the first and made its own; one live context.
        expect(contextsIn(log).map((c) => c.state), label).toEqual(['closed', 'suspended']);
        expect(log.filter((x) => x.e === 'resume').map((x) => x.id), label).toEqual([1, 2]);
        m.playPracticeCue();
        await flush();
        expect(log.filter((x) => x.e === 'start'), label).toEqual([]);
        // Nothing tries again on its own.
        const resumes = log.filter((x) => x.e === 'resume').length;
        await flush();
        expect(log.filter((x) => x.e === 'resume').length, label).toBe(resumes);
      }
    }

    // --- A CONSTRUCTOR THAT THROWS: unavailable, until an explicit tap ------
    for (const [entry, tap] of Object.entries(ENTRIES)) {
      log = [];
      m = await load(log, { ctorThrows: true });
      expect(() => tap(m), entry).not.toThrow();
      m.playPracticeCue();
      expect(log.filter((x) => x.e === 'start' || x.e === 'ctor'), entry).toEqual([]);
    }

    // --- NO WEB AUDIO at all: nothing to create, nothing thrown -------------
    log = [];
    m = await load(log, {}, false);
    expect(() => m.primePracticeSound()).not.toThrow();
    expect(() => m.testPracticeSound()).not.toThrow();
    m.playPracticeCue();
    // Only the boundary's best-effort vibration: Test sound has nothing to play.
    expect(log.map((x) => x.e)).toEqual(['vibrate']);

    // --- TEST SOUND plays once the tap's own resume lands -------------------
    log = [];
    m = await load(log);
    m.testPracticeSound();
    await flush();
    expect(log.filter((x) => x.e === 'start')).toHaveLength(2);

    // --- A BOUNDARY ON A CONTEXT NOT YET RUNNING is not queued -------------
    // The tap's resume is still pending when the boundary passes; it lands
    // afterwards and the engine runs — the passed boundary stays passed.
    log = [];
    m = await load(log, { resume: 'manual' });
    m.primePracticeSound();
    m.playPracticeCue();
    contextsIn(log)[0].setState('running');
    log.filter((x) => x.e === 'pending').forEach((x) => (x.done as () => void)());
    await flush();
    expect(log.filter((x) => x.e === 'start')).toEqual([]);

    // --- PENDING REQUESTS never sound late ---------------------------------
    // Three Test taps whose resume has not settled: each its own fresh context
    // and its own one resume. When the old promises finally settle after a
    // later tap, no earlier request plays.
    log = [];
    m = await load(log, { resume: 'manual' });
    m.testPracticeSound();
    m.testPracticeSound();
    m.testPracticeSound();
    expect(log.filter((x) => x.e === 'resume')).toHaveLength(3);
    const settle = () => log.filter((x) => x.e === 'pending').forEach((x) => (x.done as () => void)());
    // Every context — the two still closing included — reports running when
    // the old requests land.
    for (const c of contextsIn(log)) c.setState('running');
    m.primePracticeSound(); // a later tap supersedes every pending Test request
    settle();
    await flush();
    expect(log.filter((x) => x.e === 'start')).toEqual([]);
    expect(log.filter((x) => x.e === 'vibrate')).toEqual([]);
    // Once the closes settle, only the latest tap's context is live.
    expect(contextsIn(log).filter((c) => c.state !== 'closed').map((c) => c.id)).toEqual([4]);
    // The LATEST tap's own request does play when its resume lands.
    log = [];
    m = await load(log, { resume: 'manual' });
    m.testPracticeSound();
    m.testPracticeSound();
    contextsIn(log).at(-1)!.setState('running');
    settle();
    await flush();
    expect(log.filter((x) => x.e === 'start').map((x) => x.id)).toEqual([2, 2]); // the latest request only
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
