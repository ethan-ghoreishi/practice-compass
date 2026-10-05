import { describe, expect, it } from 'vitest';
import { createItem, SCHEMA_VERSION } from '../src/domain';
import { goTo, importBackup, importOutcome, openPracticeApp, reload, type Engine, type PracticeApp } from './practiceBrowser';

// ---------------------------------------------------------------------------
// The practice cue, driven through the REAL mounted screens.
//
// The audio, vibration and wake-lock ports are replaced before any app script
// runs by an instrumented stand-in that records, in order, every constructor,
// `resume()`, node, connection and schedule — and whether each happened inside
// a click dispatch (`window.event`) under the browser's own transient user
// activation (`navigator.userActivation`). The stand-in models the one policy
// that matters here: a context constructed or resumed WITHOUT activation stays
// `suspended`, as iOS Safari's autoplay rule does.
//
// What this can prove: which context the app creates, when, from which tap,
// whether it resumes it, what it schedules, and how many times — mechanics.
// What it cannot: that a speaker made a sound, at what loudness, through which
// output, or how a real device's interruption behaves. Those are OWNER checks.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T08:00:00.000Z');
const T = CLOCK.toISOString();

export const CUE_PORTS = `(() => {
  const trace = [];
  const contexts = [];
  const cue = { trace, contexts, mode: 'policy' };
  Object.defineProperty(window, '__cue', { value: cue });
  // A GESTURE is a trusted input event being dispatched right now — WebKit's
  // scoping, and the strict reading of iOS's autoplay rule. Transient
  // activation alone is measured in REAL seconds, so under a faked clock a
  // ten-minute jump would otherwise inherit the Start tap's activation.
  const GESTURES = ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];
  const during = () => (window.event && window.event.type) || null;
  const activated = () =>
    !!(navigator.userActivation && navigator.userActivation.isActive) &&
    !!window.event && window.event.isTrusted && GESTURES.includes(window.event.type);
  const where = () => location.hash;
  let ids = 0;
  class Param {
    constructor(ctx, name) { this.ctx = ctx; this.name = name; this.value = 0; }
    setValueAtTime(v, t) { trace.push({ e: 'param', ctx: this.ctx.id, name: this.name, op: 'set', v, t }); return this; }
    exponentialRampToValueAtTime(v, t) { trace.push({ e: 'param', ctx: this.ctx.id, name: this.name, op: 'exp', v, t }); return this; }
    linearRampToValueAtTime(v, t) { trace.push({ e: 'param', ctx: this.ctx.id, name: this.name, op: 'lin', v, t }); return this; }
  }
  class Node {
    constructor(ctx, kind) { this.ctx = ctx; this.kind = kind; this.node = ++ctx.nodes; }
    connect(dest) { trace.push({ e: 'connect', ctx: this.ctx.id, from: this.kind + this.node, to: dest.kind === 'destination' ? 'destination' : dest.kind + dest.node }); return dest; }
    disconnect() { trace.push({ e: 'disconnect', ctx: this.ctx.id, node: this.kind + this.node }); }
  }
  class Osc extends Node {
    constructor(ctx) { super(ctx, 'oscillator'); this.frequency = new Param(ctx, 'frequency'); this.onended = null; }
    start(t) { trace.push({ e: 'start', ctx: this.ctx.id, node: this.kind + this.node, t: t ?? this.ctx.currentTime, state: this.ctx.state }); }
    stop(t) {
      trace.push({ e: 'stop', ctx: this.ctx.id, node: this.kind + this.node, t });
      // A running engine reaches the end of what it scheduled; a suspended one
      // does not advance, so its oscillator never ends.
      if (this.ctx.state === 'running') setTimeout(() => { this.onended && this.onended(); }, 0);
    }
  }
  class Gain extends Node {
    constructor(ctx) { super(ctx, 'gain'); this.gain = new Param(ctx, 'gain'); }
  }
  class FakeAudioContext {
    constructor() {
      if (cue.mode === 'ctor-throws') { trace.push({ e: 'ctor-throw', during: during(), route: where() }); throw new Error('audio unavailable'); }
      this.id = ++ids; this.nodes = 0; this.listeners = [];
      this.state = activated() && cue.mode !== 'stays-suspended' ? 'running' : 'suspended';
      this.destination = { kind: 'destination' };
      this.onstatechange = null;
      contexts.push(this);
      trace.push({ e: 'ctor', ctx: this.id, state: this.state, activated: activated(), during: during(), route: where() });
    }
    get currentTime() { return 0; }
    setState(s) {
      if (this.state === s) return;
      this.state = s;
      trace.push({ e: 'state', ctx: this.id, state: s });
      this.onstatechange && this.onstatechange(new Event('statechange'));
      for (const fn of this.listeners) fn(new Event('statechange'));
    }
    addEventListener(type, fn) { if (type === 'statechange') this.listeners.push(fn); }
    removeEventListener(type, fn) { this.listeners = this.listeners.filter((x) => x !== fn); }
    resume() {
      trace.push({ e: 'resume', ctx: this.id, state: this.state, activated: activated(), during: during(), route: where() });
      if (cue.mode === 'resume-throws') throw new Error('resume refused');
      if (cue.mode === 'resume-rejects') return Promise.reject(new Error('resume rejected'));
      if (cue.mode === 'resume-hangs') return new Promise(() => {});
      if (this.state === 'closed') return Promise.reject(new Error('closed'));
      if (activated() && cue.mode !== 'stays-suspended') this.setState('running');
      return Promise.resolve();
    }
    suspend() { this.setState('suspended'); return Promise.resolve(); }
    close() { trace.push({ e: 'close', ctx: this.id }); this.setState('closed'); return Promise.resolve(); }
    createOscillator() { return new Osc(this); }
    createGain() { return new Gain(this); }
  }
  if (cue.mode !== 'unsupported') {
    Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true, writable: true });
    Object.defineProperty(window, 'webkitAudioContext', { value: FakeAudioContext, configurable: true, writable: true });
  }
  Object.defineProperty(navigator, 'vibrate', {
    configurable: true,
    value: (p) => { trace.push({ e: 'vibrate', p, route: where() }); return true; },
  });
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: {
      request: async () => {
        trace.push({ e: 'wake-request', route: where() });
        return { release: async () => { trace.push({ e: 'wake-release', route: where() }); } };
      },
    },
  });
})();`;

/** A small, deterministic library: one Setar item and one two-segment routine. */
function fixture(): string {
  const base = createItem({ instrumentId: 'inst-setar', title: 'Cue item A', itemType: 'gusheh', status: 'usable' }, CLOCK);
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [{ id: 'inst-setar', name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T }],
    materials: [],
    items: [{ ...base, id: 'it-a' }],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [
      {
        id: 'rt-1',
        instrumentId: 'inst-setar',
        name: 'Cue routine',
        segments: [
          { label: 'First segment', minutes: 1, itemId: 'it-a' },
          { label: 'Second segment', minutes: 1 },
        ],
        order: 0,
        createdAt: T,
        updatedAt: T,
      },
    ],
    attachments: [],
    lessons: [],
    lessonAgenda: [],
    archiveSources: [],
    musicTerms: [],
  };
  return JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data });
}

type TraceEvent = Record<string, unknown> & { e: string };

async function trace(app: PracticeApp): Promise<TraceEvent[]> {
  return app.page.evaluate(() => (window as unknown as { __cue: { trace: TraceEvent[] } }).__cue.trace.slice());
}

async function seeded(engine: Engine): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, initScript: CUE_PORTS });
  await importBackup(app, 'cue-fixture.json', fixture());
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  await goTo(app, '/');
  await app.page.getByRole('button', { name: 'Setar', exact: true }).click();
  return app;
}

describe('the practice cue, before any change (evidence)', () => {
  it('records the pre-fix cue trace', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine);
      const { page } = app;
      const out: Record<string, TraceEvent[]> = {};
      const mark = async (label: string) => {
        const all = await trace(app);
        const seen = Object.values(out).reduce((n, t) => n + t.length, 0);
        out[label] = all.slice(seen);
      };
      try {
        // A. Start, then cross the target NATURALLY on the practice screen.
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await mark('A1 start click');
        await page.clock.fastForward(598_000);
        await page.clock.runFor(4_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        await mark('A2 natural boundary');
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.getByRole('button', { name: 'Resume' }).click();
        await mark('A3 pause and resume');
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await mark('A4 discard');

        // B. Start, leave the practice screen, let the target pass THERE, return.
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await goTo(app, '/');
        await page.clock.fastForward(660_000);
        await goTo(app, '/active');
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        await mark('B remount after the target');
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // C. A routine card's Start, then its first boundary.
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Start Cue routine' }).click();
        await expect.poll(() => page.locator('main').innerText()).toContain('Segment 1 of 2');
        await mark('C1 routine card start');
        await page.clock.runFor(62_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Segment 2 of 2');
        await mark('C2 routine boundary');
        (await import('node:fs')).writeFileSync(`${process.env.CUE_TRACE_DIR ?? '/tmp'}/cue-trace-${engine}.json`, JSON.stringify(out, null, 1));
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 300_000);
});
