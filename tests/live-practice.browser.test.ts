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
  // Held writes: while held, every readwrite transaction the app opens stays
  // alive on a chain of no-op reads until the test answers it — committed, or
  // aborted (a delayed refusal). The harness's own reads and barriers open
  // theirs through 'unslowed', as with its slow-storage fixture.
  const openTx = IDBDatabase.prototype.transaction;
  let holding = false;
  const held = [];
  function transaction(stores, mode, options) {
    const tx = openTx.call(this, stores, mode, options);
    if (mode !== 'readwrite' || !holding) return tx;
    const store = tx.objectStore(tx.objectStoreNames[0]);
    const w = { answer: null };
    held.push(w);
    tx.commit = () => {};
    const spin = () => {
      if (w.answer === null) store.count().onsuccess = spin;
      else if (w.answer === 'refuse') tx.abort();
    };
    spin();
    return tx;
  }
  transaction.unslowed = openTx;
  IDBDatabase.prototype.transaction = transaction;
  Object.defineProperty(window, '__writes', {
    value: {
      hold: () => { holding = true; },
      answer: (ok) => { holding = false; for (const w of held.splice(0)) w.answer = ok ? 'commit' : 'refuse'; },
    },
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
        id: 'rt-rest',
        instrumentId: SETAR,
        name: 'Resting close',
        segments: [
          { label: 'Mahur phrases', minutes: 1, itemId: B },
          { label: 'Breathe slowly', minutes: 1 },
          { label: 'Rest the hand', minutes: 1 },
          { label: 'Let go', minutes: 1 },
        ],
        order: 1,
        createdAt: T,
        updatedAt: T,
      },
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

/** Hold every app write until `answerWrites` commits or refuses it. */
const holdWrites = (page: Page) => page.evaluate(() => (window as unknown as { __writes: { hold(): void } }).__writes.hold());
const answerWrites = (page: Page, ok: boolean) => page.evaluate((k) => (window as unknown as { __writes: { answer(ok: boolean): void } }).__writes.answer(k), ok);
const ask = (page: Page) => page.getByRole('form', { name: 'Ask teacher' });
const askStatus = (page: Page, text: string | RegExp) => ask(page).getByText(text);

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
        const SAVED_L0 = `Saved on this device for ${L0_LABEL}.`;
        const FAILED_EMPTY = "Not saved — this device refused your question's last change. The field is empty.";
        const EMPTY_KEPT = 'The field is empty — nothing new is saved; your saved question stays as it was.';
        const CHANGED = 'Changed elsewhere — not yet confirmed on this device. Done saves it.';
        const FAILED_WORDS = 'Not saved — this device refused the write. Your words are still here.';
        /** One question's own row in an agenda list (the innermost card holding its words). */
        const questionRow = (text: string) => page.locator('.card-quiet').filter({ hasText: text }).last();

        // --- ORDINARY: a notes draft open, the clock running -----------------
        await startBlock(app, A, A_TITLE);
        await page.getByRole('button', { name: 'Show Working notes' }).click();
        await page.getByRole('button', { name: 'Edit Working notes' }).click();
        await notesBox(page).fill('the draft I am in the middle of');
        const clock0 = (await persisted(app)).active!;
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        // Explicit opening focuses the field; ownership is named.
        await askBox(page).and(page.locator(':focus')).waitFor();
        await ask(page).getByText(`About: ${A_TITLE}`).waitFor();
        expect(await page.getByLabel('Ask at', { exact: true }).inputValue(), engine).toBe(L0);
        // Only this instrument's upcoming classes, plus unassigned — never the Tar class.
        expect(await page.getByLabel('Ask at', { exact: true }).locator('option').allInnerTexts(), engine).toEqual([L0_LABEL, L1_LABEL, 'No class — save it unassigned']);
        // Opening and closing with only whitespace creates nothing.
        await askBox(page).fill('   ');
        await page.clock.runFor(1_000);
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
        expect(questions(await db(app)), engine).toEqual([]);

        // QUIET-INTERVAL AUTOSAVE: nothing is written while typing goes on…
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Which finger for the trill?');
        await askStatus(page, 'Saves on this device when you pause.').waitFor();
        await page.clock.runFor(500);
        expect(questions(await db(app)), engine).toEqual([]);
        // …and after the pause the words are on the device, with no Save pressed,
        // the field still open, still focused.
        await page.clock.runFor(400);
        await askStatus(page, SAVED_L0).waitFor();
        await askBox(page).and(page.locator(':focus')).waitFor();
        const q1 = await questionLanded(app, 'Which finger for the trill?');
        expect([q1.itemId, q1.lessonId, q1.instrumentId], engine).toEqual([A, L0, SETAR]);
        // More typing updates the SAME question.
        await askBox(page).fill('Which finger for the trill, 2 or 3?');
        await page.clock.runFor(800);
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Which finger for the trill, 2 or 3?')).id, engine).toBe(q1.id);
        await askBox(page).and(page.locator(':focus')).waitFor();
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

        // An OLDER acknowledgement never marks newer words saved, clears or closes them.
        await holdWrites(page);
        await askBox(page).fill('Does the bow lift here?');
        await page.clock.runFor(800);
        await askStatus(page, 'Saving…').waitFor();
        await askBox(page).fill('Does the bow lift here, or later?');
        await answerWrites(page, true);
        await askStatus(page, 'Saves on this device when you pause.').waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Does the bow lift here, or later?');
        await page.clock.runFor(800);
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Does the bow lift here, or later?')).id, engine).toBe(q1.id);

        // CLEARED WHILE A WRITE IS PENDING: no blank question, the written one
        // kept, and the answer settles — on success…
        await holdWrites(page);
        await askBox(page).fill('Should the left hand rest?');
        await page.clock.runFor(800);
        await askStatus(page, 'Saving…').waitFor();
        await askBox(page).fill('');
        await answerWrites(page, true);
        await askStatus(page, 'The field is empty — nothing new is saved; your saved question stays as it was.').waitFor();
        expect((await questionLanded(app, 'Should the left hand rest?')).id, engine).toBe(q1.id);
        // …and on a delayed refusal (whitespace this time): failed, never Saving,
        // and Try again writes the words that question still holds.
        await holdWrites(page);
        await askBox(page).fill('Left hand again?');
        await page.clock.runFor(800);
        await askStatus(page, 'Saving…').waitFor();
        await askBox(page).fill('  ');
        await answerWrites(page, false);
        await askStatus(page, FAILED_EMPTY).waitFor();
        await ask(page).getByRole('button', { name: 'Try again' }).click();
        await askStatus(page, 'The field is empty — nothing new is saved; your saved question stays as it was.').waitFor();
        expect((await questionLanded(app, 'Left hand again?')).id, engine).toBe(q1.id);
        expect(questions(await db(app)).length, engine).toBe(1);

        // A REFUSED write keeps the words, owner and id, and its Try again
        // survives internal navigation: Today holds the words.
        await breakStorage(page);
        await askBox(page).fill('Should I slow down here?');
        await page.clock.runFor(800);
        await askStatus(page, 'Not saved — this device refused the write. Your words are still here.').waitFor();
        await goTo(app, '/');
        expect(await askBox(page).inputValue(), engine).toBe('Should I slow down here?');
        await ask(page).getByText(`About: ${A_TITLE}`).waitFor();
        await repairStorage(page);
        await ask(page).getByRole('button', { name: 'Try again' }).click();
        expect((await questionLanded(app, 'Should I slow down here?')).id, engine).toBe(q1.id);
        // Acknowledged there, the field stays on Today — words, Saved and Done — until Done.
        await askStatus(page, SAVED_L0).waitFor();
        await page.clock.runFor(1_000);
        await ask(page).getByRole('button', { name: 'Done' }).waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Should I slow down here?');
        // Back in the block the same capture is still open, saved.
        await goTo(app, '/active');
        await askStatus(page, SAVED_L0).waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Should I slow down here?');
        // Refused again, then a reload: the device still holds the OLDER
        // acknowledged words — never the refused ones.
        await breakStorage(page);
        await askBox(page).fill('Unsaved newer words');
        await page.clock.runFor(800);
        await askStatus(page, 'Not saved — this device refused the write. Your words are still here.').waitFor();
        await reload(app);
        await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
        expect(questions(await db(app)).map((q) => [q.id, q.text]), engine).toEqual([[q1.id, 'Should I slow down here?']]);

        // A deliberate class choice (none); DONE while the write is pending keeps
        // the field open until the device answers, then closes it.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await page.getByLabel('Ask at', { exact: true }).selectOption('');
        await holdWrites(page);
        await askBox(page).fill('Is the tempo too fast?');
        await page.clock.runFor(800);
        await askStatus(page, 'Saving…').waitFor();
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await askStatus(page, 'Saving…').waitFor();
        await answerWrites(page, true);
        await page.getByText('Question saved on this device — unassigned.').waitFor();
        const q2 = await questionLanded(app, 'Is the tempo too fast?');
        expect([q2.lessonId, q2.itemId], engine).toEqual([undefined, A]);

        // ITS CLASS CHANGED WITH THE FIELD EMPTY is a write like any other: a
        // refusal is said, Done never closes over it (nor claims it saved), and
        // the device keeps the class it last acknowledged until Try again lands.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Which string first?');
        await page.clock.runFor(800);
        await askStatus(page, SAVED_L0).waitFor();
        const q6 = await questionLanded(app, 'Which string first?');
        await askBox(page).fill('');
        await breakStorage(page);
        await page.getByLabel('Ask at', { exact: true }).selectOption('');
        await askStatus(page, FAILED_EMPTY).waitFor();
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await askStatus(page, FAILED_EMPTY).waitFor();
        await page.clock.runFor(1_000);
        await askBox(page).waitFor();
        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
        expect(questions(await db(app)).find((q) => q.id === q6.id)!.lessonId, engine).toBe(L0);
        await repairStorage(page);
        await ask(page).getByRole('button', { name: 'Try again' }).click();
        await askStatus(page, EMPTY_KEPT).waitFor();
        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q6.id), (q) => !!q && q.lessonId === undefined);
        // …and pending: Done waits for the device's answer to the class, then closes saying it.
        await holdWrites(page);
        await page.getByLabel('Ask at', { exact: true }).selectOption(L0);
        await askStatus(page, 'Saving…').waitFor();
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await askStatus(page, 'Saving…').waitFor();
        await answerWrites(page, true);
        await page.getByText(`Question saved on this device for ${L0_LABEL}.`).waitFor();
        expect(questions(await db(app)).filter((q) => q.id === q6.id).map((q) => [q.text, q.lessonId]), engine).toEqual([['Which string first?', L0]]);

        // DETACHED underneath: a chosen class deleted after its question exists —
        // the question keeps its id, now unassigned, and later words update it,
        // never reattached. The deletion REFUSED by the device: the earlier
        // acknowledgement (for the deleted class) never stands for it — no
        // Saved, Done stays open, the device keeps the old class until a write
        // of the capture's own lands.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Is the bow too heavy?');
        await page.getByLabel('Ask at', { exact: true }).selectOption('L-40');
        await askStatus(page, `Saved on this device for ${L1_LABEL}.`).waitFor();
        const q4 = await questionLanded(app, 'Is the bow too heavy?');
        expect(q4.lessonId, engine).toBe('L-40');
        await breakStorage(page);
        await goTo(app, '/lessons');
        await page.getByRole('article').filter({ hasText: L1_LABEL }).getByRole('button', { name: 'Delete lesson' }).click();
        await goTo(app, '/active');
        await askStatus(page, CHANGED).waitFor();
        expect(await page.getByText(/Saved on this device|^Question saved on this device/).count(), engine).toBe(0);
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await askStatus(page, FAILED_WORDS).waitFor();
        await page.clock.runFor(1_000);
        await askBox(page).waitFor();
        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
        expect(questions(await db(app)).find((q) => q.id === q4.id)!.lessonId, engine).toBe('L-40');
        await repairStorage(page);
        await ask(page).getByRole('button', { name: 'Try again' }).click();
        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q4.id), (q) => !!q && q.lessonId === undefined);
        await askBox(page).fill('Is the bow too heavy here?');
        await page.clock.runFor(800);
        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
        const q4b = await questionLanded(app, 'Is the bow too heavy here?');
        expect([q4b.id, q4b.lessonId], engine).toEqual([q4.id, undefined]);
        await ask(page).getByRole('button', { name: 'Done' }).click();

        // RETARGETED in the item's agenda with the field EMPTY, the device
        // refusing: the same — Done neither closes nor claims "unassigned"
        // while the device still holds the class; once a write lands it does.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Which bow for the turn?');
        await page.clock.runFor(800);
        await askStatus(page, SAVED_L0).waitFor();
        const q7 = await questionLanded(app, 'Which bow for the turn?');
        await askBox(page).fill('');
        await breakStorage(page);
        const picker = questionRow('Which bow for the turn?').getByRole('combobox', { name: 'Ask at which class' });
        await goTo(app, `/items/${A}`, { arrival: picker });
        await picker.selectOption('');
        await goTo(app, '/active');
        await askStatus(page, CHANGED).waitFor();
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await askStatus(page, FAILED_EMPTY).waitFor();
        await page.clock.runFor(1_000);
        await askBox(page).waitFor();
        expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
        expect(questions(await db(app)).find((q) => q.id === q7.id)!.lessonId, engine).toBe(L0);
        await repairStorage(page);
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByText('Question saved on this device — unassigned.').waitFor();
        await persistedUntil(app, (st) => questions((st.state as { db: Db }).db).find((q) => q.id === q7.id), (q) => !!q && q.lessonId === undefined && q.text === 'Which bow for the turn?');

        // FINISH before the pause, its flush still pending: the editor is there
        // on Close, Saving, until the device answers; Close's own question stays
        // independent.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await holdWrites(page);
        await askBox(page).fill('Asked just before finishing');
        await page.getByRole('button', { name: 'Finish' }).click();
        await askStatus(page, 'Saving…').waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Asked just before finishing');
        await answerWrites(page, true);
        await askStatus(page, SAVED_L0).waitFor();
        const q3 = await questionLanded(app, 'Asked just before finishing');
        expect([q3.itemId, q3.lessonId], engine).toEqual([A, L0]);
        await page.getByRole('group', { name: 'Make this a teacher question?' }).getByRole('button', { name: 'Yes' }).click();
        await page.locator('textarea[aria-label="Question for your teacher"]').fill('How long should the pause be?');
        await page.getByRole('button', { name: 'Save without a result' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();
        await questionLanded(app, 'How long should the pause be?');

        // --- PLAN: the segment's own item; navigation while a write is pending
        await goTo(app, '/plan?minutes=20');
        await page.getByRole('button', { name: /^Start plan|^Start without/ }).click();
        const planBefore = (await persisted(app)).activePlan!;
        const first = planBefore.segments[0];
        const firstTitle = (await db(app)).items.find((i) => i.id === first.itemId)!.title;
        await page.getByRole('button', { name: `Start ${firstTitle}` }).click();
        await page.getByRole('button', { name: 'Finish' }).waitFor();
        // A capture settled in the last practice is not carried into this one.
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await ask(page).getByText(`About: ${firstTitle}`).waitFor();
        await askBox(page).fill('Plan question');
        await page.clock.runFor(800);
        await askStatus(page, /^Saved on this device/).waitFor();
        const q5 = await questionLanded(app, 'Plan question');
        expect(q5.itemId, engine).toBe(first.itemId);
        await holdWrites(page);
        await askBox(page).fill('Plan question, part two');
        await goTo(app, '/');
        await askStatus(page, 'Saving…').waitFor();
        await answerWrites(page, true);
        expect((await questionLanded(app, 'Plan question, part two')).id, engine).toBe(q5.id);
        // The acknowledged autosave leaves Today's field in place.
        await askStatus(page, /^Saved on this device/).waitFor();
        await page.clock.runFor(1_000);
        expect(await askBox(page).inputValue(), engine).toBe('Plan question, part two');
        await goTo(app, '/active');
        await askStatus(page, /^Saved on this device/).waitFor();
        const during = await persisted(app);
        expect([during.activePlan!.pointer, during.active!.running, during.active!.itemId], engine).toEqual([planBefore.pointer, true, first.itemId]);
        await page.getByRole('button', { name: 'Skip this one — save nothing' }).click();
        await page.getByRole('button', { name: 'End the plan' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- ROUTINE: boundaries, Skip and the automatic end keep the words --
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
        await ask(page).getByText(`About: ${A_TITLE}`).waitFor();
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Asked while on open strings')).itemId, engine).toBe(A);
        const run1 = (await persisted(app)).activeRoutine!;
        // One clock, its boundary claimed once by the natural crossing — capture changed neither.
        expect([run1.startedAt, run1.running, run1.signalledThrough, run1.accumulatedSeconds, run1.runningSince], engine).toEqual([
          run0.startedAt,
          true,
          1,
          run0.accumulatedSeconds,
          run0.runningSince,
        ]);
        // The unbound segment: an instrument question, never a guessed item —
        // and a manual Move on under the open field neither closes nor retargets it.
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await ask(page).getByText('About this instrument — no item.').waitFor();
        await askBox(page).fill('Asked while breathing');
        await page.getByRole('button', { name: 'Move on — keep the time practised' }).click();
        await page.getByText(/Segment 3 of 3/).waitFor();
        await ask(page).getByText('About this instrument — no item.').waitFor();
        await page.clock.runFor(800);
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Asked while breathing')).itemId, engine).toBeUndefined();
        // THE FINAL AUTOMATIC BOUNDARY while a write is pending: Routine complete
        // keeps the field, its words, its owner and its status — then Saved.
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await holdWrites(page);
        await askBox(page).fill('Typed as the run ends');
        await page.clock.fastForward(61_000);
        await page.getByText('Routine complete').waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Typed as the run ends');
        await ask(page).getByText(`About: ${B_TITLE}`).waitFor();
        await askStatus(page, 'Saving…').waitFor();
        await answerWrites(page, true);
        await askStatus(page, SAVED_L0).waitFor();
        await page.getByText('Saved on this device — no feedback needed.').waitFor();
        expect((await questionLanded(app, 'Typed as the run ends')).itemId, engine).toBe(B);
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: 'Back' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // A MANUAL Finish & save before the pause: flushed, and the field is on
        // Routine complete with its words and owner.
        await goTo(app, '/routine/rt-live', { arrival: 'Evening warm-up' });
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Asked before Finish & save');
        await page.getByRole('button', { name: 'Finish & save' }).click();
        await page.getByText('Routine complete').waitFor();
        await ask(page).getByText(`About: ${A_TITLE}`).waitFor();
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Asked before Finish & save')).itemId, engine).toBe(A);
        await ask(page).getByRole('button', { name: 'Done' }).click();
        await page.getByRole('button', { name: 'Back' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // BACKGROUND CATCH-UP across several boundaries through completion,
        // the field open on an UNBOUND stretch — and a manual Skip under it first.
        await goTo(app, '/routine/rt-rest', { arrival: 'Resting close' });
        await page.getByRole('button', { name: 'Start', exact: true }).click();
        await page.getByRole('button', { name: 'Pause' }).waitFor();
        await page.getByRole('button', { name: 'Skip — log nothing for this segment' }).click();
        await page.getByText(/Segment 2 of 4/).waitFor();
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        await askBox(page).fill('Asked while resting');
        await page.getByRole('button', { name: 'Skip — log nothing for this segment' }).click();
        await page.getByText(/Segment 3 of 4/).waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Asked while resting');
        await page.evaluate(() => (window as unknown as { __visibility(h: boolean): void }).__visibility(true));
        await page.clock.fastForward(130_000);
        await page.evaluate(() => (window as unknown as { __visibility(h: boolean): void }).__visibility(false));
        await page.getByText('Routine complete').waitFor();
        expect(await askBox(page).inputValue(), engine).toBe('Asked while resting');
        await ask(page).getByText('About this instrument — no item.').waitFor();
        await askStatus(page, SAVED_L0).waitFor();
        expect((await questionLanded(app, 'Asked while resting')).itemId, engine).toBeUndefined();
        await ask(page).getByRole('button', { name: 'Done' }).click();

        // --- MIDNIGHT before the first write: the class has passed — refused,
        // words kept; the owner's deliberate choice writes them.
        await startBlock(app, C, C_TITLE);
        await page.getByRole('button', { name: '+ Ask teacher' }).click();
        const toMidnight = await page.evaluate(() => {
          const d = new Date();
          return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - d.getTime();
        });
        await page.clock.fastForward(toMidnight + 31_000);
        await page.getByText('The class it was for is no longer upcoming.').waitFor();
        await askBox(page).fill('Typed across midnight');
        await page.clock.runFor(800);
        expect(questions(await db(app)).filter((q) => q.text === 'Typed across midnight'), engine).toEqual([]);
        expect(await askBox(page).inputValue(), engine).toBe('Typed across midnight');
        await page.getByRole('button', { name: 'Save it unassigned' }).click();
        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
        const late = await questionLanded(app, 'Typed across midnight');
        expect([late.itemId, late.lessonId], engine).toEqual([C, undefined]);
        // REMOVED ELSEWHERE while the field is open: never resurrected by a later
        // write — only by the deliberate "Save as a new question".
        await goTo(app, `/items/${C}`, { arrival: page.getByRole('button', { name: 'Remove this question' }) });
        await page.getByRole('button', { name: 'Remove this question' }).click();
        await page.getByText('No questions recorded for this item.').waitFor();
        await goTo(app, '/active');
        await askStatus(page, 'This question was removed from your class list — these words are not saved.').waitFor();
        await askBox(page).fill('Typed across midnight, kept');
        await page.clock.runFor(800);
        expect(questions(await db(app)).filter((q) => q.itemId === C), engine).toEqual([]);
        await ask(page).getByRole('button', { name: 'Save as a new question' }).click();
        await askStatus(page, 'Saved on this device — unassigned.').waitFor();
        const renewed = await questionLanded(app, 'Typed across midnight, kept');
        expect([renewed.id === late.id, renewed.itemId, renewed.lessonId], engine).toEqual([false, C, undefined]);
        await ask(page).getByRole('button', { name: 'Done' }).click();

        // REMOVED after a write the device refused — or one it refuses later,
        // while the removal is on its way — then the field cleared: Done lets
        // the capture go, writing nothing and recreating nothing.
        for (const pending of [false, true]) {
          const words = pending ? 'Removed while pending' : 'Removed after a refusal';
          await page.getByRole('button', { name: '+ Ask teacher' }).click();
          await askBox(page).fill(words);
          await page.clock.runFor(800);
          await askStatus(page, 'Saved on this device — unassigned.').waitFor();
          const gone = await questionLanded(app, words);
          if (pending) {
            await holdWrites(page);
            await askBox(page).fill(`${words}, edited`);
            await page.clock.runFor(800);
            await askStatus(page, 'Saving…').waitFor();
          } else {
            await breakStorage(page);
            await askBox(page).fill(`${words}, edited`);
            await page.clock.runFor(800);
            await askStatus(page, FAILED_WORDS).waitFor();
            await repairStorage(page);
          }
          const remove = questionRow(`${words}, edited`).getByRole('button', { name: 'Remove this question' });
          await goTo(app, `/items/${C}`, { arrival: remove });
          await remove.click();
          if (pending) await answerWrites(page, false);
          await goTo(app, '/active');
          await askStatus(page, 'This question was removed from your class list — these words are not saved.').waitFor();
          await askBox(page).fill('');
          await ask(page).getByRole('button', { name: 'Done' }).click();
          await page.getByRole('button', { name: '+ Ask teacher' }).waitFor();
          expect(await page.getByText(/^Question saved on this device/).count(), engine).toBe(0);
          // (A removal the device refused lands with the next write: the reload below holds neither.)
          if (!pending) expect(questions(await db(app)).some((q) => q.id === gone.id), engine).toBe(false);
        }
        await page.getByRole('button', { name: 'Discard block' }).click();
        await page.getByRole('navigation', { name: 'Primary' }).waitFor();

        // --- After a reload: each capture ONE question with its latest
        // acknowledged words and frozen owner; nothing else moved.
        await reload(app);
        const end = await db(app);
        const owned = questions(end)
          .map((q) => [q.text, q.itemId ?? null, q.lessonId ?? null])
          .sort((a, b) => String(a[0]).localeCompare(String(b[0])));
        expect(owned, engine).toEqual(
          [
            ['Asked just before finishing', A, L0],
            ['Asked while breathing', null, L0],
            ['Asked while on open strings', A, L0],
            ['Asked while resting', null, L0],
            ['How long should the pause be?', A, L0],
            ['Is the tempo too fast?', A, null],
            ['Is the bow too heavy here?', A, null],
            ['Asked before Finish & save', A, L0],
            ['Plan question, part two', first.itemId, L0],
            ['Should I slow down here?', A, L0],
            ['Typed across midnight, kept', C, null],
            ['Typed as the run ends', B, L0],
            ['Which string first?', A, L0],
            ['Which bow for the turn?', A, null],
          ].sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
        );
        expect(new Set(questions(end).map((q) => q.id)).size, engine).toBe(14);
        expect(questions(end).find((q) => q.text === 'Should I slow down here?')!.id, engine).toBe(q1.id);
        expect(end.lessonAgenda.filter((e) => e.kind === 'preparation'), engine).toEqual(preparations);
        const withoutQuestions = end.lessonAgenda.filter((e) => e.kind !== 'question');
        expect(preparationDatesByItem(end.lessonAgenda, end.lessons, CLOCK), engine).toEqual(preparationDatesByItem(withoutQuestions, end.lessons, CLOCK));
        expect(recommendForInstrument(SETAR, start.items, start.blocks, CLOCK, preparationDatesByItem(end.lessonAgenda, end.lessons, CLOCK)).best!.score.item.id, engine).toBe(ranked);
        // Visible where questions are read: the item's agenda (with its class), and the report.
        await goTo(app, `/items/${A}`, { arrival: A_TITLE });
        await page.getByText('Should I slow down here?').waitFor();
        await page.getByText(`For ${L0_LABEL}`).first().waitFor();
        await goTo(app, `/items/${C}`, { arrival: C_TITLE });
        await page.getByText('Typed across midnight, kept').waitFor();
        await page.getByText('Unassigned — no class chosen yet').first().waitFor();
        // The report selects BY LESSON ID: last night's class still holds its questions.
        await goTo(app, '/report');
        await page.getByRole('combobox', { name: 'Class this report is for' }).selectOption(L0);
        await page.getByText('Asked while resting').first().waitFor();
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
        await page.getByRole('form', { name: 'Ask teacher' }).getByRole('button', { name: 'Done' }).click();
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
        await page.getByRole('form', { name: 'Ask teacher' }).getByRole('button', { name: 'Done' }).click();
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
