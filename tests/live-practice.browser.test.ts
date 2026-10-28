import { describe, expect, it } from 'vitest';
import type { Page } from 'playwright';
import {
  captureTargetProblem,
  createItem,
  preparationDatesByItem,
  recommendForInstrument,
  SCHEMA_VERSION,
  type Lesson,
  type LessonAgendaEntry,
  type PracticeBlock,
  type PracticeItem,
} from '../src/domain';
import {
  goTo,
  importBackup,
  importOutcome,
  openPracticeApp,
  persistedDb,
  persistedUntil,
  readPersistedState,
  reload,
  type Engine,
  type PracticeApp,
} from './practiceBrowser';

// ---------------------------------------------------------------------------
// The live-practice tools through the REAL mounted screens, in both engines,
// read back from what the app PERSISTED (docs/practice-session-model.md §12).
//
// The audio port below replaces Web Audio before any app script runs with a
// recording stand-in whose `currentTime` follows the page's (faked) clock, so
// the metronome's look-ahead and the cue are observable as scheduled events.
// Page visibility is emulated the same way. What this proves: which beats and
// cues the app schedules, on which context, when they stop, and that none of
// it touches a clock, a note or a record. What it cannot: that a speaker made
// a sound, or how loud — the owner's walkthrough (ac-8).
// ---------------------------------------------------------------------------

const CLOCK = new Date('2026-10-28T23:30:00');
const T = '2026-10-01T09:00:00.000Z';
const ENGINES: Engine[] = ['chromium', 'webkit'];
const SETAR = 'inst-setar';
const A = 'it-a';
const A_TITLE = 'Reng-e Esfahān';
const B = 'it-b';
const B_TITLE = 'چهارمضراب ماهور';
const C = 'it-c';
const C_TITLE = 'Masnavi';
const L0 = 'L-39';
const L0_LABEL = 'Class 39 · 2026-10-28';
const L1_LABEL = 'Class 40 · 2026-10-30';

const LIVE_PORTS = `(() => {
  const trace = [];
  const contexts = [];
  Object.defineProperty(window, '__live', { value: { trace, contexts } });
  const GESTURES = ['click', 'pointerdown', 'pointerup', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'keydown', 'keyup'];
  const activated = () =>
    !!(navigator.userActivation && navigator.userActivation.isActive) &&
    !!window.event && window.event.isTrusted && GESTURES.includes(window.event.type);
  let ids = 0;
  class Param {
    constructor(ctx, node) { this.ctx = ctx; this.node = node; this.value = 1; }
    setValueAtTime(v, t) { trace.push({ e: 'set', ctx: this.ctx.id, node: this.node, v, t }); }
    linearRampToValueAtTime(v, t) { trace.push({ e: 'lin', ctx: this.ctx.id, node: this.node, v, t }); }
    exponentialRampToValueAtTime(v, t) { trace.push({ e: 'exp', ctx: this.ctx.id, node: this.node, v, t }); }
  }
  class Node {
    constructor(ctx, kind) { this.ctx = ctx; this.kind = kind + (++ctx.nodes); }
    connect(d) { trace.push({ e: 'connect', ctx: this.ctx.id, from: this.kind, to: d.kind }); return d; }
    disconnect() { trace.push({ e: 'disconnect', ctx: this.ctx.id, node: this.kind }); }
  }
  class Osc extends Node {
    constructor(ctx) { super(ctx, 'osc'); this.type = 'sine'; this.frequency = { value: 0 }; this.onended = null; }
    start(t) { trace.push({ e: 'start', ctx: this.ctx.id, t, hz: this.frequency.value, state: this.ctx.state }); }
    stop(t) { trace.push({ e: 'stop', ctx: this.ctx.id, t }); }
  }
  class Gain extends Node {
    constructor(ctx) { super(ctx, 'gain'); this.gain = new Param(ctx, this.kind); }
  }
  class FakeAudioContext {
    constructor() {
      this.id = ++ids; this.nodes = 0; this.listeners = []; this.dead = false;
      this.base = performance.now();
      this.state = activated() ? 'running' : 'suspended';
      this.destination = { kind: 'destination' };
      contexts.push(this);
      trace.push({ e: 'ctor', ctx: this.id, state: this.state });
    }
    get currentTime() { return 10 + (performance.now() - this.base) / 1000; }
    setState(s) {
      if (this.state === s) return;
      this.state = s;
      trace.push({ e: 'state', ctx: this.id, state: s });
      for (const fn of this.listeners) fn(new Event('statechange'));
    }
    addEventListener(type, fn) { if (type === 'statechange') this.listeners.push(fn); }
    removeEventListener(type, fn) { this.listeners = this.listeners.filter((x) => x !== fn); }
    resume() {
      trace.push({ e: 'resume', ctx: this.id });
      if (this.state === 'closed') return Promise.reject(new Error('closed'));
      if (activated() && !this.dead) this.setState('running');
      return Promise.resolve();
    }
    suspend() { this.setState('suspended'); return Promise.resolve(); }
    interrupt() { this.dead = true; this.setState('interrupted'); }
    close() { trace.push({ e: 'close', ctx: this.id }); this.setState('closed'); return Promise.resolve(); }
    createOscillator() { return new Osc(this); }
    createGain() { return new Gain(this); }
  }
  Object.defineProperty(window, 'AudioContext', { value: FakeAudioContext, configurable: true, writable: true });
  Object.defineProperty(window, 'webkitAudioContext', { value: FakeAudioContext, configurable: true, writable: true });
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: (p) => { trace.push({ e: 'vibrate', p }); return true; } });
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => ({ release: async () => {} }) } });
  let hidden = false;
  Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (hidden ? 'hidden' : 'visible') });
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  Object.defineProperty(window, '__visibility', {
    value: (h) => { hidden = h; document.dispatchEvent(new Event('visibilitychange')); },
  });
})();`;

function fixture(): string {
  const item = (id: string, title: string, over: Record<string, unknown> = {}) => ({
    ...createItem({ instrumentId: SETAR, title, itemType: 'gusheh', status: 'usable' }, new Date(T)),
    id,
    ...over,
  });
  const lesson = (id: string, date: string, number: number, instrumentId = SETAR) => ({ id, instrumentId, date, number, itemIds: [], recordings: [], createdAt: T, updatedAt: T });
  const data = {
    schemaVersion: SCHEMA_VERSION,
    instruments: [
      { id: SETAR, name: 'Setar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
      { id: 'inst-tar', name: 'Tar', family: 'Persian', active: true, createdAt: T, updatedAt: T },
    ],
    materials: [],
    items: [
      item(A, A_TITLE, { status: 'integrated', importance: 4, nextReviewDate: '2027-01-21', nextReviewSource: 'user', lastPractisedAt: '2026-10-21T09:00:00.000Z', timesPractised: 12 }),
      item(B, B_TITLE, { itemType: 'technique', difficulty: 2, timesPractised: 6, lastPractisedAt: '2026-10-20T09:00:00.000Z' }),
      item(C, C_TITLE, { itemType: 'technique', status: 'fragile', importance: 4 }),
      item('it-tar', 'Tar piece', { instrumentId: 'inst-tar' }),
    ],
    blocks: [],
    reviews: [],
    pathways: [],
    pathwayStages: [],
    pathwayRoutines: [
      {
        id: 'rt-live',
        instrumentId: SETAR,
        name: 'Evening warm-up',
        segments: [
          { label: 'Open strings', minutes: 1, itemId: A, essential: true },
          { label: 'Breathe', minutes: 1 },
          { label: 'Mahur phrases', minutes: 1, itemId: B },
        ],
        order: 0,
        createdAt: T,
        updatedAt: T,
      },
    ],
    attachments: [],
    lessons: [lesson(L0, '2026-10-28', 39), lesson('L-40', '2026-10-30', 40), lesson('L-tar', '2026-10-29', 7, 'inst-tar')],
    lessonAgenda: [{ id: 'prep-a', kind: 'preparation', itemId: A, instrumentId: SETAR, lessonId: L0, createdAt: T, updatedAt: T }],
    archiveSources: [],
    musicTerms: [],
  };
  return JSON.stringify({ app: 'practice-compass', schemaVersion: SCHEMA_VERSION, exportedAt: T, data });
}

type Db = { items: (PracticeItem & Record<string, unknown>)[]; blocks: PracticeBlock[]; lessons: Lesson[]; lessonAgenda: LessonAgendaEntry[]; reviews: unknown[] };
type Ev = Record<string, unknown> & { e: string };

async function seeded(engine: Engine): Promise<PracticeApp> {
  const app = await openPracticeApp({ now: CLOCK, engine, viewport: { width: 390, height: 844 }, initScript: LIVE_PORTS });
  await importBackup(app, 'live-practice.json', fixture());
  expect(await importOutcome(app)).toContain('Imported');
  await reload(app);
  await goTo(app, '/');
  await app.page.getByRole('navigation', { name: 'Which instrument are you practising?' }).getByRole('button', { name: 'Setar', exact: true }).click();
  return app;
}

const db = async (app: PracticeApp) => (await persistedDb(app)) as unknown as Db;
const questions = (d: Db) => d.lessonAgenda.filter((e) => e.kind === 'question') as (LessonAgendaEntry & { text: string; itemId?: string; lessonId?: string })[];
const persisted = async (app: PracticeApp) =>
  (await readPersistedState(app)).state as {
    active: { startedAt: string; running: boolean; signalledThrough?: number; itemId: string; accumulatedSeconds: number; segmentStartedAt?: string } | null;
    activeRoutine: { startedAt: string; running: boolean; signalledThrough?: number; accumulatedSeconds: number; runningSince?: string } | null;
    activePlan: { pointer: number; segments: { itemId: string; minutes: number }[] } | null;
  };
/** Wait until a question with exactly this text has landed, and return it. */
const questionLanded = (app: PracticeApp, text: string) =>
  persistedUntil(
    app,
    (s) => questions((s.state as { db: Db }).db).filter((q) => q.text === text),
    (qs) => qs.length > 0,
  ).then((qs) => qs![0]);
const trace = (app: PracticeApp): Promise<Ev[]> => app.page.evaluate(() => (window as unknown as { __live: { trace: Ev[] } }).__live.trace.slice());
const ms = (t: unknown) => Math.round((t as number) * 1000) / 1000;
const beatsIn = (events: Ev[]) => events.filter((x) => x.e === 'start' && x.hz === 1600);
const cuesIn = (events: Ev[]) => events.filter((x) => x.e === 'start' && (x.hz === 988 || x.hz === 1319));
const askBox = (page: Page) => page.getByRole('textbox', { name: 'Question for your teacher' });
const notesBox = (page: Page) => page.getByRole('textbox', { name: 'Working notes', exact: true });

async function breakStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    proto.__realPut = proto.put;
    proto.put = function failing() {
      throw new DOMException('storage is full', 'QuotaExceededError');
    };
  });
}

async function repairStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    const proto = IDBObjectStore.prototype as unknown as { put: unknown; __realPut?: unknown };
    if (proto.__realPut) proto.put = proto.__realPut;
  });
}

async function startBlock(app: PracticeApp, itemId: string, title: string): Promise<void> {
  await goTo(app, `/items/${itemId}`, { arrival: title });
  await app.page.getByRole('button', { name: 'Start a block' }).click();
  await app.page.getByRole('button', { name: 'Finish' }).waitFor();
}

// ---------------------------------------------------------------------------
// ac-5 — a question asked mid-practice keeps its owner, and practice runs on
// ---------------------------------------------------------------------------

describe('asking the teacher while practising', () => {
  it('live teacher questions retain capture ownership while practice continues', async () => {
    // The targets the field cannot see change underneath it (sync, another
    // editor): judged by the same pure check the field renders.
    const now = new Date('2026-10-28T23:40:00');
    const items = [{ id: A, instrumentId: SETAR }, { id: 'moved', instrumentId: 'inst-tar' }] as PracticeItem[];
    const lessons = [{ id: L0, instrumentId: SETAR, date: '2026-10-28' }, { id: 'tar', instrumentId: 'inst-tar', date: '2026-10-29' }, { id: 'old', instrumentId: SETAR, date: '2026-10-20' }] as Lesson[];
    for (const [capture, want] of [
      [{ instrumentId: SETAR, itemId: A, lessonId: L0 }, null],
      [{ instrumentId: SETAR }, null],
      [{ instrumentId: SETAR, itemId: 'gone' }, 'item'],
      [{ instrumentId: SETAR, itemId: 'moved' }, 'item'],
      [{ instrumentId: SETAR, lessonId: 'deleted' }, 'lesson'],
      [{ instrumentId: SETAR, lessonId: 'tar' }, 'lesson'],
      [{ instrumentId: SETAR, lessonId: 'old' }, 'lesson'],
    ] as const) {
      const problem = captureTargetProblem({ items, lessons }, capture, now);
      expect(problem ? Object.keys(problem) : null, JSON.stringify(capture)).toEqual(want ? [want] : null);
    }

    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      try {
        const start = await db(app);
        const preparations = start.lessonAgenda.filter((e) => e.kind === 'preparation');
        const ranked = recommendForInstrument(SETAR, start.items, start.blocks, CLOCK, preparationDatesByItem(start.lessonAgenda, start.lessons, CLOCK)).best!.score.item.id;

        // --- ORDINARY: a notes draft open, the clock running -----------------
        await startBlock(app, A, A_TITLE);
        await page.getByRole('button', { name: 'Show Working notes' }).click();
        await page.getByRole('button', { name: 'Edit Working notes' }).click();
        await notesBox(page).fill('the draft I am in the middle of');
        const clock0 = (await persisted(app)).active!;
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        // Explicit opening focuses the field; ownership is named.
        await askBox(page).and(page.locator(':focus')).waitFor();
        await page.getByRole('form', { name: 'Ask teacher' }).getByText(`About: ${A_TITLE}`).waitFor();
        expect(await page.getByLabel('Ask at', { exact: true }).inputValue(), engine).toBe(L0);
        // Only this instrument's upcoming classes, plus unassigned — never the Tar class.
        expect(await page.getByLabel('Ask at', { exact: true }).locator('option').allInnerTexts(), engine).toEqual([L0_LABEL, L1_LABEL, 'No class — save it unassigned']);
        // Blank saves nothing; Cancel writes nothing.
        await page.getByRole('button', { name: 'Save question', disabled: true }).waitFor();
        await page.getByRole('button', { name: 'Cancel' }).click();
        await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
        expect(questions(await db(app)), engine).toEqual([]);

        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Which finger for the trill?');
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText(`Question saved on this device for ${L0_LABEL}.`).waitFor();
        const q1 = await questionLanded(app, 'Which finger for the trill?');
        expect([q1.itemId, q1.lessonId, q1.instrumentId], engine).toEqual([A, L0, SETAR]);
        // The clock, the notes draft and the block were never touched: the same
        // running interval (never paused or restarted), still advancing.
        await page.clock.runFor(3_000);
        const clock1 = (await persisted(app)).active!;
        expect([clock1.startedAt, clock1.running, clock1.signalledThrough, clock1.accumulatedSeconds, clock1.segmentStartedAt], engine).toEqual([
          clock0.startedAt,
          true,
          clock0.signalledThrough,
          clock0.accumulatedSeconds,
          clock0.segmentStartedAt,
        ]);
        await page.getByText(/^0:0[4-9]$|^0:[1-5]\d$/).first().waitFor();
        expect(await notesBox(page).inputValue(), engine).toBe('the draft I am in the middle of');

        // No class chosen: visibly unassigned.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Is the tempo too fast?');
        await page.getByLabel('Ask at', { exact: true }).selectOption('');
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText('Question saved on this device — unassigned.').waitFor();
        expect((await questionLanded(app, 'Is the tempo too fast?')).lessonId, engine).toBeUndefined();

        // A FAILED write keeps the words; Try again writes the SAME question once.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Should the left hand rest here?');
        await breakStorage(page);
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText('Not saved — this device refused the write. Nothing on screen was lost.').waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Should the left hand rest here?');
        await repairStorage(page);
        await page.getByRole('button', { name: 'Try again' }).click();
        await page.getByText(`Question saved on this device for ${L0_LABEL}.`).waitFor();
        await questionLanded(app, 'Should the left hand rest here?');

        // A LATER question at Close stays its own entry.
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('group', { name: 'Make this a teacher question?' }).getByRole('button', { name: 'Yes' }).click();
        await page.getByRole('textbox', { name: 'Question for your teacher' }).fill('How long should the pause be?');
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await questionLanded(app, 'How long should the pause be?');

        // --- PLAN: the segment's own item, the run untouched -----------------
        await goTo(app, '/plan?minutes=20');
        await page.getByRole('button', { name: /^Start plan|^Start without/ }).click();
        const planBefore = (await persisted(app)).activePlan!;
        const first = planBefore.segments[0];
        const firstTitle = (await db(app)).items.find((i) => i.id === first.itemId)!.title;
        await page.getByRole('button', { name: `Start ${firstTitle}` }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await page.getByRole('form', { name: 'Ask teacher' }).getByText(`About: ${firstTitle}`).waitFor();
        await askBox(page).fill('Plan question');
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText(/^Question saved on this device/).waitFor();
        expect((await questionLanded(app, 'Plan question')).itemId, engine).toBe(first.itemId);
        const during = await persisted(app);
        expect([during.activePlan!.pointer, during.active!.running, during.active!.itemId], engine).toEqual([planBefore.pointer, true, first.itemId]);
        await page.getByRole('button', { name: 'Skip this one — save nothing' }).click();
        await page.getByRole('button', { name: 'End the plan' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- ROUTINE: a boundary while typing never retargets the words ------
        await goTo(app, '/routine/rt-live');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        const run0 = (await persisted(app)).activeRoutine!;
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Asked while on open strings');
        await page.clock.fastForward(62_000);
        await page.getByText(/Segment 2 of 3/).waitFor();
        // Same field, same words, same owner, still focused: nothing remounted.
        await askBox(page).and(page.locator(':focus')).waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Asked while on open strings');
        await page.getByRole('form', { name: 'Ask teacher' }).getByText(`About: ${A_TITLE}`).waitFor();
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText(/^Question saved on this device/).waitFor();
        expect((await questionLanded(app, 'Asked while on open strings')).itemId, engine).toBe(A);
        // The unbound segment: an instrument question, never a guessed item.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await page.getByText('About this instrument — no item.').waitFor();
        await askBox(page).fill('Asked while breathing');
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText(/^Question saved on this device/).waitFor();
        expect((await questionLanded(app, 'Asked while breathing')).itemId, engine).toBeUndefined();
        const run1 = (await persisted(app)).activeRoutine!;
        // One clock, its boundary claimed once by the natural crossing — capture changed neither,
        // and the run was never paused or restarted.
        expect([run1.startedAt, run1.running, run1.signalledThrough, run1.accumulatedSeconds, run1.runningSince], engine).toEqual([
          run0.startedAt,
          true,
          1,
          run0.accumulatedSeconds,
          run0.runningSince,
        ]);
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();

        // --- MIDNIGHT while typing: the class has passed — refused, words kept ---
        await startBlock(app, C, C_TITLE);
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Typed across midnight');
        const toMidnight = await page.evaluate(() => {
          const d = new Date();
          return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - d.getTime();
        });
        await page.clock.fastForward(toMidnight + 31_000);
        await page.getByText('The class it was for is no longer upcoming.').waitFor();
        await page.getByRole('button', { name: 'Save question', disabled: true }).waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Typed across midnight');
        await page.getByRole('button', { name: 'Save it unassigned' }).click();
        await page.getByRole('button', { name: 'Save question' }).click();
        await page.getByText('Question saved on this device — unassigned.').waitFor();
        const late = await questionLanded(app, 'Typed across midnight');
        expect([late.itemId, late.lessonId], engine).toEqual([C, undefined]);
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- After a reload: each question once, independent; nothing else moved.
        await reload(app);
        const end = await db(app);
        expect(questions(end).map((q) => q.text).sort(), engine).toEqual([
          'Asked while breathing',
          'Asked while on open strings',
          'How long should the pause be?',
          'Is the tempo too fast?',
          'Plan question',
          'Should the left hand rest here?',
          'Typed across midnight',
          'Which finger for the trill?',
        ]);
        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(8);
        expect(end.lessonAgenda.filter((e) => e.kind === 'preparation'), engine).toEqual(preparations);
        const withoutQuestions = end.lessonAgenda.filter((e) => e.kind !== 'question');
        expect(preparationDatesByItem(end.lessonAgenda, end.lessons, CLOCK), engine).toEqual(preparationDatesByItem(withoutQuestions, end.lessons, CLOCK));
        expect(recommendForInstrument(SETAR, start.items, start.blocks, CLOCK, preparationDatesByItem(end.lessonAgenda, end.lessons, CLOCK)).best!.score.item.id, engine).toBe(ranked);
        // Visible where questions are read: the item's agenda (with its class), and the report.
        await goTo(app, `/items/${A}`, { arrival: A_TITLE });
        await page.getByText('Which finger for the trill?').waitFor();
        await page.getByText(`For ${L0_LABEL}`).first().waitFor();
        await goTo(app, `/items/${C}`, { arrival: C_TITLE });
        await page.getByText('Typed across midnight').waitFor();
        await page.getByText('Unassigned — no class chosen yet').first().waitFor();
        // The report selects BY LESSON ID: last night's class still holds its questions.
        await goTo(app, '/report');
        await page.getByRole('combobox', { name: 'Class this report is for' }).selectOption(L0);
        await page.getByText('Asked while breathing').first().waitFor();
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 900_000);
});

// ---------------------------------------------------------------------------
// ac-7 — the metronome, the question field and freed time leave practice whole
// ---------------------------------------------------------------------------

describe('live practice tools', () => {
  it('live practice tools preserve clocks notes records and mobile controls', async () => {
    for (const engine of ENGINES) {
      const app = await seeded(engine);
      const { page } = app;
      const metronome = () => page.getByRole('region', { name: 'Metronome' });
      try {
        const blocks0 = (await db(app)).blocks.length;

        // --- ORDINARY: start the beat from a tap; it follows the audio clock --
        await startBlock(app, A, A_TITLE);
        await metronome().getByRole('button', { name: 'Start beat' }).click();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        await page.clock.runFor(2_000);
        let events = await trace(app);
        const ctx1 = events.filter((x) => x.e === 'ctor').at(-1)!.ctx;
        let beats = beatsIn(events);
        expect(beats.length, engine).toBeGreaterThanOrEqual(3);
        expect(beats.every((b) => b.ctx === ctx1), engine).toBe(true);
        for (let i = 1; i < beats.length; i++) expect(ms((beats[i].t as number) - (beats[i - 1].t as number)), engine).toBe(0.75);
        // Tempo: −/+ and a typed value; the level for the next beats.
        await metronome().getByRole('button', { name: 'Faster' }).click();
        expect(await metronome().getByRole('spinbutton', { name: 'Beats per minute' }).inputValue(), engine).toBe('81');
        await metronome().getByRole('spinbutton', { name: 'Beats per minute' }).fill('120');
        await metronome().getByRole('button', { name: 'Loud', exact: true }).click();
        await metronome().getByRole('button', { name: 'Loud', exact: true, pressed: true }).waitFor();
        let from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        events = (await trace(app)).slice(from);
        beats = beatsIn(events);
        expect(beats.length, engine).toBeGreaterThanOrEqual(3);
        for (let i = 2; i < beats.length; i++) expect(ms((beats[i].t as number) - (beats[i - 1].t as number)), engine).toBe(0.5);
        expect(events.filter((x) => x.e === 'lin' && x.v === 0.34).length, engine).toBeGreaterThan(0);

        // Typing a question and dismissing the keyboard: the beat goes on, the controls answer.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Does the beat help here?');
        await askBox(page).blur();
        from = (await trace(app)).length;
        await page.clock.runFor(1_000);
        expect(beatsIn((await trace(app)).slice(from)).length, engine).toBeGreaterThanOrEqual(1);
        await page.getByRole('button', { name: 'Cancel' }).click();
        // Notes typed with the beat running are durable.
        await page.getByRole('button', { name: 'Show Working notes' }).click();
        await page.getByRole('button', { name: 'Edit Working notes' }).click();
        await notesBox(page).fill('steady at 120');
        await page.clock.runFor(1_000);
        await persistedUntil(app, (s) => (s.state as { db: Db }).db.items.find((i) => i.id === A)?.notes, (n) => n === 'steady at 120');
        await page.getByRole('button', { name: 'Done editing Working notes' }).click();

        // PAUSE stops it and cancels what was placed; RESUME leaves it off.
        await page.getByRole('button', { name: 'Pause' }).click();
        await metronome().getByRole('button', { name: 'Start beat', disabled: true }).waitFor();
        from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        expect(beatsIn((await trace(app)).slice(from)), engine).toEqual([]);
        await page.getByRole('button', { name: 'Resume' }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        expect(beatsIn((await trace(app)).slice(from)), engine).toEqual([]);
        // A HIDDEN page stops it; showing the page again leaves it off.
        await metronome().getByRole('button', { name: 'Start beat' }).click();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        await page.evaluate(() => (window as unknown as { __visibility: (h: boolean) => void }).__visibility(true));
        await metronome().getByRole('button', { name: 'Start beat' }).waitFor();
        await page.evaluate(() => (window as unknown as { __visibility: (h: boolean) => void }).__visibility(false));
        from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        expect(beatsIn((await trace(app)).slice(from)), engine).toEqual([]);

        // SOUND RECOVERY: an interruption stops the beat; "Turn on sound" readies a fresh
        // context, and the beat waits for its own tap.
        await metronome().getByRole('button', { name: 'Start beat' }).click();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        await page.evaluate(() => {
          for (const c of (window as unknown as { __live: { contexts: { state: string; interrupt(): void }[] } }).__live.contexts) if (c.state === 'running') c.interrupt();
        });
        await page.getByText('Practice sound is paused on this device.').waitFor();
        await metronome().getByRole('button', { name: 'Start beat' }).waitFor();
        await page.getByRole('button', { name: 'Turn on sound' }).click();
        await metronome().getByRole('button', { name: 'Start beat' }).click();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        events = await trace(app);
        const ctx2 = events.filter((x) => x.e === 'ctor').at(-1)!.ctx;
        expect(ctx2, engine).not.toBe(ctx1);

        // The BOUNDARY: the ring shows it, the cue sounds once over a ducked beat,
        // and the beat carries on in time.
        from = (await trace(app)).length;
        await page.clock.fastForward(10 * 60_000);
        await page.clock.runFor(2_000);
        await page.getByText(/Target reached/).waitFor();
        events = (await trace(app)).slice(from);
        expect(cuesIn(events).map((x) => [x.hz, x.ctx]), engine).toEqual([[988, ctx2], [1319, ctx2]]);
        const duck = events.filter((x) => x.e === 'set' && (x.v === 0 || x.v === 1));
        expect(duck.map((x) => x.v), engine).toEqual([0, 1]);
        expect(ms((duck[1].t as number) - (duck[0].t as number)), engine).toBe(0.56);
        expect(beatsIn(events).filter((b) => (b.t as number) > (duck[1].t as number)).length, engine).toBeGreaterThanOrEqual(1);

        // FINISH stops it (the screen is gone); the block records the real minutes, once.
        const active = (await persisted(app)).active!;
        await page.getByRole('button', { name: 'Finish' }).click();
        await page.getByRole('button', { name: 'Save without a result' }).waitFor();
        from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        expect(beatsIn((await trace(app)).slice(from)), engine).toEqual([]);
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        let d = await db(app);
        expect(d.blocks.length, engine).toBe(blocks0 + 1);
        expect([d.blocks.at(-1)!.practiceItemId, d.blocks.at(-1)!.startedAt], engine).toEqual([A, active.startedAt]);

        // --- PLAN preview: freed time is offered, a cancelled choice changes nothing,
        // and Start runs exactly the preview.
        await goTo(app, '/plan?minutes=30');
        const minutes = () =>
          page.locator('.list-row').filter({ has: page.getByRole('button', { name: /from the plan$/ }) }).locator('.mono-num').allInnerTexts();
        await page.getByRole('button', { name: /^Start plan|^Start without/ }).waitFor();
        const rowsBefore = await minutes();
        const removeButtons = page.getByRole('button', { name: /from the plan$/ });
        // The warm-up leads; its few minutes fit under the work's ceilings.
        await removeButtons.first().click();
        await page.getByRole('group', { name: 'Freed time' }).waitFor();
        const afterRemove = await minutes();
        expect(afterRemove, engine).toEqual(rowsBefore.slice(1));
        await page.getByRole('button', { name: 'Give to one…' }).click();
        await page.getByRole('group', { name: 'Freed time' }).getByRole('button', { name: 'Cancel' }).click();
        expect(await minutes(), engine).toEqual(afterRemove);
        await page.getByRole('button', { name: 'Spread over the rest' }).click();
        // So the planned total returns to what it was before the removal.
        const total = (list: string[]) => list.reduce((n, m) => n + Number.parseInt(m, 10), 0);
        await page.locator('.list-row').filter({ hasText: 'Planned' }).getByText(`${total(rowsBefore)} min`, { exact: true }).waitFor();
        const shown = await minutes();
        expect(total(shown), engine).toBe(total(rowsBefore));
        await page.getByRole('button', { name: /^Start plan|^Start without/ }).click();
        await page.getByRole('button', { name: 'End the plan' }).waitFor();
        const run = (await persisted(app)).activePlan!;
        expect(run.segments.map((s) => `${s.minutes} min`), engine).toEqual(shown);
        await page.getByRole('button', { name: 'End the plan' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- ROUTINE: the beat keeps going across a boundary; Finish stops it.
        await goTo(app, '/routine/rt-live');
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await metronome().getByRole('button', { name: 'Start beat' }).click();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('typing over the boundary');
        from = (await trace(app)).length;
        await page.clock.fastForward(61_000);
        await page.clock.runFor(1_000);
        await page.getByText(/New segment · Segment 2 of 3/).waitFor();
        await metronome().getByRole('button', { name: 'Stop beat' }).waitFor();
        events = (await trace(app)).slice(from);
        expect(cuesIn(events).length, engine).toBe(2);
        expect(beatsIn(events).length, engine).toBeGreaterThanOrEqual(1);
        expect(await askBox(page).inputValue(), engine).toBe('typing over the boundary');
        await page.getByRole('button', { name: 'Cancel' }).click();
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        from = (await trace(app)).length;
        await page.clock.runFor(2_000);
        expect(beatsIn((await trace(app)).slice(from)), engine).toEqual([]);
        await page.getByText('Saved on this device — no feedback needed.').waitFor();
        // Reload after the finished run: nothing unfinished, nothing recorded twice.
        await reload(app);
        d = await db(app);
        const state = await persisted(app);
        expect([state.active, state.activeRoutine, state.activePlan], engine).toEqual([null, null, null]);
        expect(d.blocks.length, engine).toBe(blocks0 + 2);
        expect(d.blocks.at(-1)!.practiceItemId, engine).toBe(A);
        expect(app.pageErrors.map((e) => e.message), engine).toEqual([]);
      } finally {
        await app.close();
      }
    }
  }, 900_000);
});
