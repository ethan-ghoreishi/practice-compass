import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import { createItem, SCHEMA_VERSION } from '../src/domain';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedDb,
  readPersistedState,
  reload,
  writePersistedState,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// The practice cue, driven through the REAL mounted screens.
//
// The audio, vibration and wake-lock ports are replaced before any app script
// runs by an instrumented stand-in that records, in order, every constructor,
// `resume()`, node, connection and schedule — and whether each happened inside
// a click dispatch (`window.event`) under the browser's own transient user
// activation (`navigator.userActivation`). The stand-in models the one policy
// that matters here: a context constructed or resumed OUTSIDE a gesture stays
// `suspended`, as iOS Safari's autoplay rule does. Its fault flags model a
// constructor that throws, a resume() that throws, rejects or never settles,
// a context that will not run, and a browser with no Web Audio.
//
// What this proves: which context the app creates, when, from which tap,
// whether it resumes it, what it schedules, and how many times — mechanics,
// in both engines. What it cannot: that a speaker made a sound, how loud,
// through which output, or how a real device's interruption behaves. Those
// are OWNER checks (docs/setar-practice-reliability.md). The pre-fix trace
// this replaced is recorded in §1 of that document.
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-05T08:00:00.000Z');
const T = CLOCK.toISOString();

export const CUE_PORTS = `(() => {
  const trace = [];
  const contexts = [];
  const flags = { ctorThrows: false, resumeThrows: false, resumeRejects: false, resumeHangs: false, staySuspended: false };
  const cue = { trace, contexts, flags };
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
    connect(dest) { trace.push({ e: 'connect', ctx: this.ctx.id, from: this.kind, to: dest.kind }); return dest; }
    disconnect() { trace.push({ e: 'disconnect', ctx: this.ctx.id, node: this.kind }); }
  }
  class Osc extends Node {
    constructor(ctx) {
      super(ctx, 'oscillator');
      this.frequency = { set value(v) { trace.push({ e: 'frequency', v }); }, get value() { return 0; } };
      this.onended = null;
    }
    start(t) { trace.push({ e: 'start', ctx: this.ctx.id, t, state: this.ctx.state }); }
    stop(t) {
      trace.push({ e: 'stop', ctx: this.ctx.id, t });
      // A running engine reaches the end of what it scheduled; a suspended one does not.
      if (this.ctx.state === 'running') setTimeout(() => { this.onended && this.onended(); }, 500);
    }
  }
  class Gain extends Node {
    constructor(ctx) { super(ctx, 'gain'); this.gain = new Param(ctx, 'gain'); }
  }
  class FakeAudioContext {
    constructor() {
      if (flags.ctorThrows) { trace.push({ e: 'ctor-throw', during: during(), route: where() }); throw new Error('audio unavailable'); }
      this.id = ++ids; this.nodes = 0; this.listeners = [];
      this.state = activated() && !flags.staySuspended ? 'running' : 'suspended';
      this.destination = { kind: 'destination' };
      this.onstatechange = null;
      contexts.push(this);
      trace.push({ e: 'ctor', ctx: this.id, state: this.state, activated: activated(), during: during(), route: where() });
    }
    get currentTime() { return 10; }
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
      if (flags.resumeThrows) throw new Error('resume refused');
      if (flags.resumeRejects) return Promise.reject(new Error('resume rejected'));
      if (flags.resumeHangs) return new Promise(() => {});
      if (this.state === 'closed') return Promise.reject(new Error('closed'));
      if (activated() && !flags.staySuspended) this.setState('running');
      return Promise.resolve();
    }
    suspend() { this.setState('suspended'); return Promise.resolve(); }
    close() { trace.push({ e: 'close', ctx: this.id }); this.setState('closed'); return Promise.resolve(); }
    createOscillator() { return new Osc(this); }
    createGain() { return new Gain(this); }
  }
  Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true, writable: true });
  Object.defineProperty(window, 'webkitAudioContext', { value: FakeAudioContext, configurable: true, writable: true });
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

/** A small, deterministic Setar library touching every start door. */
function fixture(): string {
  const item = (id: string, title: string, over: Record<string, unknown> = {}) => ({
    ...createItem({ instrumentId: 'inst-setar', title, itemType: 'gusheh', status: 'usable' }, CLOCK),
    id,
    ...over,
  });
  const routine = (id: string, name: string, segments: unknown[], placement: Record<string, unknown> = {}) => ({
    id,
    instrumentId: 'inst-setar',
    name,
    segments,
    order: 0,
    createdAt: T,
    updatedAt: T,
    ...placement,
  });
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [{ id: 'inst-setar', name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T }],
    materials: [],
    items: [
      item('it-a', 'Cue item A', { stageId: 'st-cue' }),
      item('it-review', 'Cue review item', { nextReviewDate: '2026-10-05' }),
      item('it-fragile', 'Cue fragile item', { status: 'fragile' }),
      item('it-parent', 'Cue parent piece', { itemType: 'full_piece' }),
      item('it-part', 'Cue part', { itemType: 'section', status: 'new', parentItemId: 'it-parent' }),
    ],
    blocks: [],
    reviews: [{ id: 'rev-due', practiceItemId: 'it-review', dueDate: '2026-10-05', reviewType: 'retention', createdAt: T, updatedAt: T }],
    pathways: [{ id: 'pw-cue', instrumentId: 'inst-setar', name: 'Cue pathway', order: 0, createdAt: T, updatedAt: T }],
    pathwayStages: [{ id: 'st-cue', pathwayId: 'pw-cue', code: 'C1', title: 'Cue stage', order: 0, createdAt: T, updatedAt: T }],
    pathwayRoutines: [
      routine('rt-1', 'Cue routine', [
        { label: 'First segment', minutes: 1, itemId: 'it-a', essential: true },
        { label: 'Second segment', minutes: 1, itemId: 'it-fragile' },
        { label: 'Third segment', minutes: 1 },
      ]),
      routine('rt-stage', 'Stage routine', [{ label: 'Only', minutes: 1 }], { pathwayId: 'pw-cue', stageId: 'st-cue' }),
      routine('rt-path', 'Path routine', [{ label: 'Only', minutes: 1 }], { pathwayId: 'pw-cue' }),
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

const trace = (app: PracticeApp): Promise<TraceEvent[]> =>
  app.page.evaluate(() => (window as unknown as { __cue: { trace: TraceEvent[] } }).__cue.trace.slice());
const contexts = (app: PracticeApp): Promise<number> =>
  app.page.evaluate(() => (window as unknown as { __cue: { contexts: unknown[] } }).__cue.contexts.length);
const setFlags = (app: PracticeApp, flags: Record<string, boolean>) =>
  app.page.evaluate((f) => Object.assign((window as unknown as { __cue: { flags: object } }).__cue.flags, f), flags);
/** A phone call, another app's audio: the page's context is suspended again. */
const interrupt = (app: PracticeApp) =>
  app.page.evaluate(() => {
    for (const c of (window as unknown as { __cue: { contexts: { state: string; suspend(): void }[] } }).__cue.contexts) {
      if (c.state === 'running') c.suspend();
    }
  });
const since = async (app: PracticeApp, from: number) => (await trace(app)).slice(from);
const count = (events: TraceEvent[], e: string) => events.filter((x) => x.e === e).length;

async function seeded(engine: Engine): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, initScript: CUE_PORTS });
  await importBackup(app, 'cue-fixture.json', fixture());
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  await goTo(app, '/');
  await app.page.getByRole('button', { name: 'Setar', exact: true }).click();
  return app;
}

/**
 * Tap a door and prove it READIED the sound itself: the constructor or the
 * resume() ran inside that click's own dispatch, under its activation, on the
 * route the tap was made on (before any navigation), and the page still holds
 * exactly one context. The context is interrupted first so every door, not
 * just the first, has to do the readying.
 */
async function primedBy(app: PracticeApp, door: string, tap: () => Promise<void>): Promise<TraceEvent[]> {
  await interrupt(app);
  const route = await app.page.evaluate(() => location.hash);
  const from = (await trace(app)).length;
  await tap();
  const events = await since(app, from);
  const primed = events.filter((x) => x.e === 'ctor' || x.e === 'resume');
  expect(primed.length, `${door}: no context readied`).toBeGreaterThan(0);
  for (const p of primed) {
    expect(p.during, `${door}: readied outside the tap`).toBe('click');
    expect(p.activated, `${door}: readied without activation`).toBe(true);
    expect(p.route, `${door}: readied after navigating`).toBe(route);
  }
  expect(await contexts(app), `${door}: contexts stacked`).toBe(1);
  return events;
}

async function discardBlock(page: Page) {
  await page.getByRole('button', { name: 'Discard block' }).click();
  await page.getByRole('navigation', { name: 'Primary' }).waitFor();
}

async function finishRoutine(app: PracticeApp) {
  await app.page.getByRole('button', { name: 'Finish & save' }).click();
  await app.page.getByText('Routine complete').waitFor();
  await goTo(app, '/');
}

const persisted = async (app: PracticeApp) =>
  (await readPersistedState(app)).state as {
    active: { startedAt: string; signalledThrough?: number; running: boolean } | null;
    activeRoutine: { startedAt?: string; signalledThrough?: number } | null;
    activePlan: { pointer: number } | null;
  };

describe('the practice sound, through every door', () => {
  it('practice sound reuses one gesture primed context across all start and resume doors', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        // --- BLOCK STARTS --------------------------------------------------
        // Today: the recommendation.
        const first = await primedBy(app, 'Today recommendation', () => page.getByRole('button', { name: /Start · 10 min/ }).click());
        expect(first.find((x) => x.e === 'ctor')).toMatchObject({ during: 'click', route: '#/', state: 'running' });
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        // ActiveBlock Resume.
        await page.getByRole('button', { name: 'Pause' }).click();
        await primedBy(app, 'ActiveBlock Resume', () => page.getByRole('button', { name: 'Resume' }).click());
        // CloseBlock Resume ("Back").
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Back' }).waitFor();
        await primedBy(app, 'CloseBlock Resume', () => page.getByRole('button', { name: 'Back' }).click());
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await discardBlock(page);
        // Today: a due review, and a direct start from the rest of the list.
        await primedBy(app, 'Today review', () => page.getByRole('button', { name: 'Review Cue review item' }).click());
        await discardBlock(page);
        await primedBy(app, 'Today direct start', () => page.getByRole('button', { name: /^Practise / }).first().click());
        await discardBlock(page);
        // StartBlock.
        await goTo(app, '/start');
        await page.locator('.list-row').filter({ hasText: 'Cue item A' }).first().click();
        await primedBy(app, 'StartBlock', () => page.getByRole('button', { name: 'Begin practice' }).click());
        await discardBlock(page);
        // ItemDetail, and its next part.
        await goTo(app, '/items/it-a');
        await primedBy(app, 'ItemDetail Start', () => page.getByRole('button', { name: 'Start a block' }).click());
        await discardBlock(page);
        await goTo(app, '/items/it-parent');
        await primedBy(app, 'ItemDetail next part', () => page.getByRole('button', { name: 'Practise Cue part' }).click());
        await discardBlock(page);
        // StageDetail Play.
        await goTo(app, '/pathway/pw-cue/st-cue');
        await primedBy(app, 'StageDetail Play', () => page.getByRole('button', { name: 'Practise Cue item A' }).click());
        await discardBlock(page);

        // --- ROUTINES: one tap starts the run, inside the tap --------------
        await page.getByRole('button', { name: /^Routines/ }).click();
        await primedBy(app, 'Today routine card', () => page.getByRole('button', { name: 'Start Cue routine' }).click());
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        expect((await persisted(app)).activeRoutine).not.toBeNull();
        await page.getByRole('button', { name: 'Pause' }).click();
        await primedBy(app, 'RoutineRunner Resume', () => page.getByRole('button', { name: 'Resume' }).click());
        await finishRoutine(app);
        await page.getByRole('button', { name: /^Routines/ }).click();
        await primedBy(app, 'Today short on time', () => page.getByRole('button', { name: 'Short on time — essentials only' }).click());
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        expect(await page.locator('main').innerText()).toMatch(/short on time/i);
        await finishRoutine(app);
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Run it for a different length' }).first().click();
        await page.getByLabel('Minutes to run Cue routine').fill('6');
        await primedBy(app, 'RoutineDuration Start', () => page.getByRole('button', { name: 'Start', exact: true }).click());
        await finishRoutine(app);
        await goTo(app, '/pathway/pw-cue/st-cue');
        const stageCard = page.locator('article').filter({ hasText: 'Stage routine' });
        await primedBy(app, 'StageDetail routine card', () => stageCard.getByRole('button', { name: 'Start', exact: true }).click());
        await finishRoutine(app);
        await goTo(app, '/pathway/pw-cue');
        const pathCard = page.locator('.card').filter({ hasText: 'Path routine' }).first();
        await primedBy(app, 'PathwayDetail routine card', () => pathCard.getByRole('button', { name: 'Start', exact: true }).click());
        await finishRoutine(app);

        // A BARE ROUTINE LINK starts nothing until its own Start is tapped.
        const before = (await trace(app)).length;
        await goTo(app, '/routine/rt-stage');
        await page.getByRole('button', { name: 'Start', exact: true }).waitFor();
        expect((await persisted(app)).activeRoutine).toBeNull();
        expect(count(await since(app, before), 'ctor') + count(await since(app, before), 'resume')).toBe(0);
        await primedBy(app, 'bare routine URL Start', () => page.getByRole('button', { name: 'Start', exact: true }).click());
        expect((await persisted(app)).activeRoutine).not.toBeNull();
        await finishRoutine(app);

        // --- SESSION PLAN: the plan is no clock; each Begin is ------------
        await goTo(app, '/plan');
        await page.getByRole('button', { name: '30 min', exact: true }).click();
        await interrupt(app);
        const planFrom = (await trace(app)).length;
        await page.getByRole('button', { name: 'Start plan' }).click();
        expect(count(await since(app, planFrom), 'resume') + count(await since(app, planFrom), 'ctor')).toBe(0);
        expect((await persisted(app)).active).toBeNull();
        await primedBy(app, 'Session Plan first Begin', () => page.getByRole('button', { name: /^Start / }).first().click());
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('button', { name: /^Start / }).first().waitFor();
        await primedBy(app, 'Session Plan later Begin', () => page.getByRole('button', { name: /^Start / }).first().click());
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('button', { name: 'End the plan' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- AN EXISTING CLOCK is never replaced or restarted by a door ----
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        const running = (await persisted(app)).active!.startedAt;
        await goTo(app, '/');
        await page.getByRole('button', { name: /^Routines/ }).click();
        await page.getByRole('button', { name: 'Start Cue routine' }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        expect((await persisted(app)).active!.startedAt).toBe(running);
        expect((await persisted(app)).activeRoutine).toBeNull();
        expect(await contexts(app)).toBe(1);

        // --- LATER BOUNDARIES REUSE THE SAME CONTEXT -----------------------
        const boundaryFrom = (await trace(app)).length;
        await page.clock.fastForward(598_000);
        await page.clock.runFor(4_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        await page.clock.runFor(2_000);
        const cue = await since(app, boundaryFrom);
        expect(count(cue, 'ctor')).toBe(0);
        expect(count(cue, 'resume')).toBe(0);
        // Two bounded pulses on the page's one context: 880 Hz, gain 0.2
        // decaying to silence over 0.3 s, starting 0.45 s apart, each
        // oscillator → gain → destination, each let go once it has played.
        expect(cue.filter((x) => x.e === 'start').map((x) => [x.ctx, x.t, x.state])).toEqual([
          [1, 10, 'running'],
          [1, 10.45, 'running'],
        ]);
        expect(cue.filter((x) => x.e === 'stop').map((x) => x.t)).toEqual([10.3, 10.75]);
        expect(cue.filter((x) => x.e === 'frequency').map((x) => x.v)).toEqual([880, 880]);
        expect(cue.filter((x) => x.e === 'param').map((x) => [x.op, x.v, x.t])).toEqual([
          ['set', 0.2, 10],
          ['exp', 0.001, 10.3],
          ['set', 0.2, 10.45],
          ['exp', 0.001, 10.75],
        ]);
        expect(cue.filter((x) => x.e === 'connect').map((x) => `${x.from}>${x.to}`)).toEqual([
          'oscillator>gain',
          'gain>destination',
          'oscillator>gain',
          'gain>destination',
        ]);
        expect(count(cue, 'disconnect')).toBe(4);
        expect(count(cue, 'close')).toBe(0);
        expect(cue.filter((x) => x.e === 'vibrate').map((x) => x.p)).toEqual([[80, 120, 80]]);
        await discardBlock(page);

        // --- SETTINGS: Test practice sound changes nothing it should not ---
        await goTo(app, '/settings');
        const testFrom = (await trace(app)).length;
        const dbBefore = JSON.stringify((await readPersistedState(app)).state);
        await primedBy(app, 'Settings Test sound', () => page.getByRole('button', { name: 'Test practice sound' }).click());
        await page.getByText('Ready on this page.').waitFor();
        await page.clock.runFor(1_000);
        expect(count(await since(app, testFrom), 'start')).toBe(2);
        expect(count(await since(app, testFrom), 'wake-request')).toBe(0);
        expect(JSON.stringify((await readPersistedState(app)).state)).toBe(dbBefore);

        // --- RECOVERY on the practice screen after a reload ---------------
        await goTo(app, '/');
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        const clockBefore = (await persisted(app)).active;
        await reload(app); // a new page: no context until a tap
        await page.getByRole('button', { name: 'Turn on sound' }).waitFor();
        expect(await contexts(app)).toBe(0);
        await primedBy(app, 'practice-screen recovery', () => page.getByRole('button', { name: 'Turn on sound' }).click());
        await expect.poll(() => page.getByRole('button', { name: 'Turn on sound' }).count()).toBe(0);
        // Recovery is a tap on the sound alone: the clock is exactly as it was.
        expect((await persisted(app)).active).toEqual(clockBefore);
        await discardBlock(page);

        // --- EVERY AUDIO FAILURE: practice goes on, nothing stacks or throws
        for (const flags of [
          { ctorThrows: true },
          { staySuspended: true, resumeThrows: true },
          { staySuspended: true, resumeRejects: true },
          { staySuspended: true, resumeHangs: true },
          { staySuspended: true },
          { unsupported: true },
        ]) {
          const label = JSON.stringify(flags);
          await reload(app);
          if ('unsupported' in flags) {
            await page.evaluate(() => {
              delete (window as { AudioContext?: unknown }).AudioContext;
              delete (window as { webkitAudioContext?: unknown }).webkitAudioContext;
            });
          } else await setFlags(app, flags);
          const from = (await trace(app)).length;
          await page.getByRole('button', { name: /Start · 10 min/ }).click();
          await page.getByRole('button', { name: 'Finish' }).waitFor();
          // Repeated taps on the recovery control never stack contexts.
          for (let i = 0; i < 3; i += 1) {
            const turnOn = page.getByRole('button', { name: 'Turn on sound' });
            if (await turnOn.count()) await turnOn.click();
          }
          expect(await contexts(app), label).toBeLessThanOrEqual(1);
          // The clock runs; a boundary is still marked by the ring and the
          // marker; no tone is attempted on a context that is not running,
          // and none is queued for later.
          await page.clock.fastForward(601_000);
          await expect.poll(() => page.locator('main').innerText(), { timeout: 10_000 }).toContain('Target reached');
          expect((await persisted(app)).active!.signalledThrough, label).toBe(1);
          expect(count(await since(app, from), 'start'), label).toBe(0);
          const note = await page.locator('main').innerText();
          if (label.includes('ctorThrows') || label.includes('unsupported')) expect(note, label).toMatch(/no practice sound|off on this page/);
          else expect(note, label).toMatch(/Practice sound is (paused|off)/);
          await setFlags(app, { ctorThrows: false, resumeThrows: false, resumeRejects: false, resumeHangs: false, staySuspended: false });
          await discardBlock(page);
        }
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }

    // --- THE REAL ENGINE, under its normal policy ------------------------------
    // No stand-in: the browser's own Web Audio, no autoplay flag. The app's own
    // indicator reports the engine running after the tap, and the two pulses
    // it scheduled reach their `ended` — scheduling completes. Nothing here
    // asserts a sound was heard. ONE route, in Chromium: it renders to a fake
    // output where a host has no audio device (CI's Linux runners), while
    // WebKit's Linux build may have no audio sink at all — its graph is proven
    // above against the stand-in, and a real WebKit's sound is an OWNER check
    // on the iPhone itself.
    for (const engine of ['chromium'] as Engine[]) {
      const app = await openPracticeApp({
        now: CLOCK,
        engine,
        initScript: `(() => {
          const ended = [];
          Object.defineProperty(window, '__ended', { value: ended });
          const start = AudioScheduledSourceNode.prototype.start;
          AudioScheduledSourceNode.prototype.start = function (...args) {
            this.addEventListener('ended', () => ended.push(this.context.state));
            return start.apply(this, args);
          };
        })();`,
      });
      try {
        await goTo(app, '/settings');
        await app.page.getByRole('button', { name: 'Test practice sound' }).click();
        await app.page.getByText('Ready on this page.').waitFor({ timeout: 10_000 });
        await expect
          .poll(() => app.page.evaluate(() => (window as unknown as { __ended: string[] }).__ended.length), { timeout: 10_000 })
          .toBe(2);
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);

  it('practice cues preserve wall clock boundaries and every recorded minute', async () => {
    for (const engine of ['chromium', 'webkit'] as Engine[]) {
      const app = await seeded(engine);
      const { page } = app;
      const cues = async (from: number) => count(await since(app, from), 'vibrate');
      try {
        // --- A BLOCK: one natural boundary is ONE claim and ONE cue -------
        const startedFrom = (await trace(app)).length;
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        const started = (await persisted(app)).active!.startedAt;
        await page.clock.fastForward(598_000);
        expect(await page.locator('main').innerText()).not.toContain('Target reached');
        expect(await cues(startedFrom)).toBe(0);
        await page.clock.runFor(4_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        expect((await persisted(app)).active!.signalledThrough).toBe(1);
        expect(await cues(startedFrom)).toBe(1);
        // Practising past target never announces again, and never auto-finishes.
        await page.clock.runFor(120_000);
        expect(await cues(startedFrom)).toBe(1);
        expect(await page.getByRole('button', { name: 'Finish' }).count()).toBe(1);
        // Pause and Resume replay nothing consumed.
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.clock.runFor(30_000);
        await page.getByRole('button', { name: 'Resume' }).click();
        await page.clock.runFor(5_000);
        expect(await cues(startedFrom)).toBe(1);
        // A reload is a new page: the marker is persisted, so nothing replays.
        await reload(app);
        await page.clock.runFor(3_000);
        expect(count(await trace(app), 'vibrate')).toBe(0);
        // Finish and save: the minutes are the WALL CLOCK's — the running
        // time this test advanced (598 + 4 + 120 + 5 s; the 30 s pause
        // excluded) plus the real seconds the page's clock kept moving between
        // steps — read back from the frozen clock, never a count of ticks.
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Same' }).waitFor();
        const frozen = ((await readPersistedState(app)).state as { active: { accumulatedSeconds: number; running: boolean } }).active;
        expect(frozen.running).toBe(false);
        expect(frozen.accumulatedSeconds).toBeGreaterThanOrEqual(727);
        expect(frozen.accumulatedSeconds).toBeLessThan(727 + 60);
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        const saved = (await persistedDb(app)).blocks.at(-1) as { durationMinutes: number; result: string; startedAt: string };
        expect(saved).toMatchObject({ durationMinutes: Math.max(1, Math.round(frozen.accumulatedSeconds / 60)), result: 'same', startedAt: started });

        // --- REMOUNT after the target passed elsewhere: StrictMode's double
        //     effect, one claim, ONE cue (the pre-fix app played two).
        let from = (await trace(app)).length;
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await goTo(app, '/');
        await page.clock.fastForward(660_000);
        await goTo(app, '/active');
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        await page.clock.runFor(2_000);
        expect(await cues(from)).toBe(1);
        expect((await persisted(app)).active!.signalledThrough).toBe(1);
        // …and the same again through a second navigation: nothing replays.
        await goTo(app, '/');
        await goTo(app, '/active');
        await page.clock.runFor(2_000);
        expect(await cues(from)).toBe(1);
        await discardBlock(page);

        // --- AN ABSENT MARKER (a session persisted before the marker) ------
        await page.getByRole('button', { name: /Start · 10 min/ }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        const legacy = await readPersistedState(app);
        const st = legacy.state as { active: Record<string, unknown> };
        const { signalledThrough: _drop, ...noMarker } = st.active;
        void _drop;
        const earlier = (iso: unknown) => new Date(Date.parse(String(iso)) - 700_000).toISOString();
        await writePersistedState(
          app,
          { ...st, active: { ...noMarker, startedAt: earlier(noMarker.startedAt), segmentStartedAt: earlier(noMarker.segmentStartedAt) } },
          legacy.version,
        );
        await reload(app);
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        await page.clock.runFor(2_000);
        // ONE cue attempt for the boundary already passed — vibration only:
        // this new page has no running context, and none is created for it.
        expect(count(await trace(app), 'vibrate')).toBe(1);
        expect(count(await trace(app), 'ctor')).toBe(0);
        expect((await persisted(app)).active!.signalledThrough).toBe(1);
        // Turning the sound on afterwards plays the TEST cue, never the boundary.
        await page.getByRole('button', { name: 'Turn on sound' }).click();
        await page.clock.runFor(1_000);
        expect(count(await trace(app), 'start')).toBe(2);
        expect((await persisted(app)).active!.signalledThrough).toBe(1);
        await discardBlock(page);

        // --- A ROUTINE: natural boundary, background catch-up, final ------
        await page.getByRole('button', { name: /^Routines/ }).click();
        from = (await trace(app)).length;
        await page.getByRole('button', { name: 'Start Cue routine' }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.clock.runFor(62_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Segment 2 of 3');
        expect(await cues(from)).toBe(1);
        expect((await persisted(app)).activeRoutine!.signalledThrough).toBe(1);
        // The arrival is visible for a window, then not.
        expect(await page.locator('main').innerText()).toContain('New segment');
        await page.clock.runFor(10_000);
        expect(await page.locator('main').innerText()).not.toContain('New segment');
        // BACKGROUND: away from the screen across TWO boundaries (the second
        // and the last); back, ONE catch-up cue — and the routine completes.
        await goTo(app, '/');
        await page.clock.fastForward(130_000);
        await goTo(app, '/routine/rt-1');
        await page.getByText('Routine complete').waitFor();
        await page.clock.runFor(2_000);
        expect(await cues(from)).toBe(2);
        // Saved: each bound segment's real elapsed time — 60 s each, one
        // minute each — and the unbound third logs nothing.
        const routineBlocks = (await persistedDb(app)).blocks.slice(-2) as { practiceItemId: string; durationMinutes: number; result: string }[];
        expect(routineBlocks.map((b) => [b.practiceItemId, b.durationMinutes, b.result]).sort()).toEqual(
          [
            ['it-a', 1, 'not_logged'],
            ['it-fragile', 1, 'not_logged'],
          ].sort(),
        );
        expect((await persisted(app)).activeRoutine).toBeNull();
        await goTo(app, '/');

        // ZERO-TIME SKIPS, repeated: acknowledged silently, never a cue.
        await page.getByRole('button', { name: /^Routines/ }).click();
        from = (await trace(app)).length;
        await page.getByRole('button', { name: 'Start Cue routine' }).click();
        await page.getByRole('button', { name: 'Skip' }).click();
        await page.getByRole('button', { name: 'Skip' }).click();
        await expect.poll(() => page.locator('main').innerText()).toContain('Segment 3 of 3');
        await page.clock.runFor(3_000);
        expect(await cues(from)).toBe(0);
        // FINISH before the last boundary: what elapsed is saved, and the
        // boundary that would have come announces nothing afterwards.
        const blocksBefore = (await persistedDb(app)).blocks.length;
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        await page.clock.runFor(70_000);
        expect(await cues(from)).toBe(0);
        // Each skipped bound segment ran the fraction of a second before its
        // Skip — real elapsed time, which the routine rule records as its
        // minimum minute (`aggregateItemMinutes`); the cue rules changed none
        // of it, and nothing was announced.
        const skipped = ((await persistedDb(app)).blocks.slice(blocksBefore) as { practiceItemId: string; durationMinutes: number; result: string }[])
          .map((b) => [b.practiceItemId, b.durationMinutes, b.result])
          .sort();
        expect(skipped).toEqual(
          [
            ['it-a', 1, 'not_logged'],
            ['it-fragile', 1, 'not_logged'],
          ].sort(),
        );
        await goTo(app, '/');

        // --- A PLAN: each Begin is a real block with its own boundary ------
        await goTo(app, '/plan');
        await page.getByRole('button', { name: '30 min', exact: true }).click();
        await page.getByRole('button', { name: 'Start plan' }).click();
        from = (await trace(app)).length;
        await page.getByRole('button', { name: /^Start / }).first().click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        const target = Number(/of (\d+):00/.exec(await page.locator('main').innerText())![1]);
        await page.clock.fastForward(target * 60_000 - 2_000);
        expect(await cues(from)).toBe(0);
        await page.clock.runFor(4_000);
        await expect.poll(() => page.locator('main').innerText()).toContain('Target reached');
        expect(await cues(from)).toBe(1);
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Same' }).waitFor();
        const planClock = ((await readPersistedState(app)).state as { active: { accumulatedSeconds: number } }).active;
        expect(planClock.accumulatedSeconds).toBeGreaterThanOrEqual(target * 60 + 2);
        await page.getByRole('button', { name: 'Same' }).click();
        await page.getByRole('button', { name: 'Save block' }).click();
        await page.getByRole('button', { name: /^Start / }).first().waitFor();
        expect((await persisted(app)).activePlan!.pointer).toBe(1);
        const planBlock = (await persistedDb(app)).blocks.at(-1) as { durationMinutes: number };
        expect(planBlock.durationMinutes).toBe(Math.max(1, Math.round(planClock.accumulatedSeconds / 60)));
        await page.getByRole('button', { name: 'End the plan' }).click();
        expect(app.pageErrors.map((e) => e.message)).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 600_000);
});
